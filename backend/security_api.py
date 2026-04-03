"""
Security API: Forgot Password, Account Lockout, Credit Reporting PIN Gate
"""
import os
import uuid
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Header, Depends
from motor.motor_asyncio import AsyncIOMotorClient
from auth import verify_password, get_password_hash, decode_token

security_router = APIRouter(prefix="/security", tags=["Security"])

mongo_url = os.environ['MONGO_URL']
db_name = os.environ.get('DB_NAME', 'credlocity')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 30
PIN_SESSION_MINUTES = 5


async def _get_user(authorization: Optional[str]):
    if not authorization:
        return None
    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    if not payload:
        return None
    return await db.users.find_one({"email": payload.get("sub")}, {"_id": 0})


# ==================== FORGOT PASSWORD ====================

@security_router.post("/forgot-password")
async def forgot_password(data: dict):
    email = data.get("email", "").strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    user = await db.users.find_one({"email": {"$regex": f"^{email}$", "$options": "i"}})
    if not user:
        # Don't reveal if email exists
        return {"message": "If an account exists with that email, a password reset link has been sent."}

    # Generate reset token
    reset_token = secrets.token_urlsafe(48)
    expires = datetime.now(timezone.utc) + timedelta(hours=1)

    await db.password_resets.insert_one({
        "email": user["email"],
        "token": reset_token,
        "expires_at": expires.isoformat(),
        "used": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    # In production, send email. For now, return the token for testing.
    # TODO: Integrate email service (SendGrid/Resend)
    return {
        "message": "If an account exists with that email, a password reset link has been sent.",
        "reset_token": reset_token  # Remove in production
    }


@security_router.post("/reset-password")
async def reset_password(data: dict):
    token = data.get("token", "").strip()
    new_password = data.get("new_password", "").strip()

    if not token or not new_password:
        raise HTTPException(status_code=400, detail="Token and new password are required")

    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    reset_record = await db.password_resets.find_one({"token": token, "used": False})
    if not reset_record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    expires_at = datetime.fromisoformat(reset_record["expires_at"])
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="Reset token has expired")

    # Update password
    hashed = get_password_hash(new_password)
    await db.users.update_one(
        {"email": reset_record["email"]},
        {"$set": {"hashed_password": hashed}}
    )

    # Mark token as used
    await db.password_resets.update_one(
        {"token": token},
        {"$set": {"used": True, "used_at": datetime.now(timezone.utc).isoformat()}}
    )

    # Clear any lockout
    await db.login_attempts.delete_many({"email": reset_record["email"]})

    return {"message": "Password reset successfully"}


# ==================== ACCOUNT LOCKOUT ====================

@security_router.post("/check-lockout")
async def check_lockout(data: dict):
    email = data.get("email", "").strip().lower()
    if not email:
        return {"locked": False}

    record = await db.login_attempts.find_one({"email": {"$regex": f"^{email}$", "$options": "i"}})
    if not record:
        return {"locked": False, "attempts": 0}

    if record.get("locked_until"):
        locked_until = datetime.fromisoformat(record["locked_until"])
        if datetime.now(timezone.utc) < locked_until:
            remaining = int((locked_until - datetime.now(timezone.utc)).total_seconds() / 60) + 1
            return {"locked": True, "remaining_minutes": remaining, "attempts": record.get("attempts", 0)}
        else:
            # Lockout expired, clear it
            await db.login_attempts.delete_one({"email": record["email"]})
            return {"locked": False, "attempts": 0}

    return {"locked": False, "attempts": record.get("attempts", 0)}


@security_router.post("/record-failed-login")
async def record_failed_login(data: dict):
    email = data.get("email", "").strip().lower()
    if not email:
        return {"locked": False}

    record = await db.login_attempts.find_one({"email": {"$regex": f"^{email}$", "$options": "i"}})
    attempts = (record.get("attempts", 0) if record else 0) + 1

    if attempts >= MAX_LOGIN_ATTEMPTS:
        locked_until = datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
        await db.login_attempts.update_one(
            {"email": {"$regex": f"^{email}$", "$options": "i"}},
            {"$set": {
                "email": email,
                "attempts": attempts,
                "locked_until": locked_until.isoformat(),
                "last_attempt": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )
        return {"locked": True, "remaining_minutes": LOCKOUT_DURATION_MINUTES, "attempts": attempts}
    else:
        await db.login_attempts.update_one(
            {"email": {"$regex": f"^{email}$", "$options": "i"}},
            {"$set": {
                "email": email,
                "attempts": attempts,
                "last_attempt": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )
        return {"locked": False, "attempts": attempts, "remaining_attempts": MAX_LOGIN_ATTEMPTS - attempts}


@security_router.post("/clear-login-attempts")
async def clear_login_attempts(data: dict):
    email = data.get("email", "").strip().lower()
    if email:
        await db.login_attempts.delete_many({"email": {"$regex": f"^{email}$", "$options": "i"}})
    return {"cleared": True}


# ==================== CREDIT REPORTING PIN GATE ====================

@security_router.post("/set-pin")
async def set_pin(data: dict, authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    pin = data.get("pin", "").strip()
    employee_id = data.get("employee_id", "").strip()

    if not pin or len(pin) != 6 or not pin.isdigit():
        raise HTTPException(status_code=400, detail="PIN must be exactly 6 digits")

    if not employee_id:
        raise HTTPException(status_code=400, detail="Employee ID is required")

    hashed_pin = get_password_hash(pin)
    await db.users.update_one(
        {"email": user["email"]},
        {"$set": {
            "credit_reporting_pin": hashed_pin,
            "employee_id": employee_id,
            "pin_updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"message": "PIN and Employee ID set successfully"}


@security_router.post("/verify-pin")
async def verify_pin(data: dict, authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    pin = data.get("pin", "").strip()
    employee_id = data.get("employee_id", "").strip()

    if not pin or not employee_id:
        raise HTTPException(status_code=400, detail="PIN and Employee ID are required")

    stored_pin = user.get("credit_reporting_pin")
    stored_eid = user.get("employee_id")

    if not stored_pin or not stored_eid:
        raise HTTPException(status_code=400, detail="PIN not configured. Please set up your Credit Reporting PIN first.")

    if employee_id != stored_eid:
        raise HTTPException(status_code=401, detail="Invalid Employee ID")

    if not verify_password(pin, stored_pin):
        raise HTTPException(status_code=401, detail="Invalid PIN")

    # Generate a short-lived session token for credit reporting access
    session_token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(minutes=PIN_SESSION_MINUTES)

    await db.pin_sessions.insert_one({
        "email": user["email"],
        "session_token": session_token,
        "expires_at": expires.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    return {
        "verified": True,
        "session_token": session_token,
        "expires_in_minutes": PIN_SESSION_MINUTES
    }


@security_router.post("/extend-pin-session")
async def extend_pin_session(data: dict, authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session_token = data.get("session_token", "")
    session = await db.pin_sessions.find_one({
        "email": user["email"],
        "session_token": session_token
    })

    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")

    expires_at = datetime.fromisoformat(session["expires_at"])
    if datetime.now(timezone.utc) > expires_at:
        await db.pin_sessions.delete_one({"session_token": session_token})
        raise HTTPException(status_code=401, detail="Session expired")

    new_expires = datetime.now(timezone.utc) + timedelta(minutes=PIN_SESSION_MINUTES)
    await db.pin_sessions.update_one(
        {"session_token": session_token},
        {"$set": {"expires_at": new_expires.isoformat()}}
    )

    return {"extended": True, "expires_in_minutes": PIN_SESSION_MINUTES}


@security_router.get("/pin-status")
async def get_pin_status(authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    has_pin = bool(user.get("credit_reporting_pin"))
    has_eid = bool(user.get("employee_id"))
    employee_id = user.get("employee_id", "")

    return {
        "has_pin": has_pin,
        "has_employee_id": has_eid,
        "employee_id": employee_id
    }
