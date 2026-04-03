"""
Partner PIN Authentication & Management API.
Endpoints: POST /api/partners/pin-auth, POST /api/partners/set-pin, GET /api/partners/list
"""
import os
import bcrypt
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Header
import jwt as pyjwt

pin_router = APIRouter()
db = None

JWT_SECRET = os.environ.get("JWT_SECRET_KEY", "your-secret-key-change-in-production-credlocity-2025")
PARTNER_JWT_SECRET = JWT_SECRET + "-partners"
PARTNER_JWT_ALGO = "HS256"
PARTNER_SESSION_HOURS = 8
MAX_PIN_ATTEMPTS = 5
LOCKOUT_MINUTES = 5


def set_db(database):
    global db
    db = database


def verify_admin_jwt(authorization: str):
    """Verify the main CMS admin JWT."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="CMS authentication required")
    token = authorization.split(" ", 1)[1]
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="CMS session expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid CMS token")


def hash_pin(pin: str) -> str:
    return bcrypt.hashpw(pin.encode('utf-8'), bcrypt.gensalt(rounds=10)).decode('utf-8')


def verify_pin(pin: str, pin_hash: str) -> bool:
    return bcrypt.checkpw(pin.encode('utf-8'), pin_hash.encode('utf-8'))


def create_partner_token(partner: dict) -> str:
    payload = {
        "sub": partner.get("email"),
        "partner_id": partner.get("id"),
        "role": partner.get("role"),
        "partner_role": partner.get("role"),
        "display_name": partner.get("display_name"),
        "exp": datetime.now(timezone.utc) + timedelta(hours=PARTNER_SESSION_HOURS),
        "iat": datetime.now(timezone.utc),
        "iss": "credlocity-partners",
    }
    return pyjwt.encode(payload, PARTNER_JWT_SECRET, algorithm=PARTNER_JWT_ALGO)


@pin_router.post("/api/partners/pin-auth")
async def pin_auth(data: dict, authorization: str = Header(None)):
    """Authenticate partner via 6-digit PIN. Requires valid CMS admin JWT."""
    admin = verify_admin_jwt(authorization)
    admin_email = admin.get("sub", admin.get("email", ""))

    pin = data.get("pin", "").strip()
    if not pin or len(pin) != 6 or not pin.isdigit():
        raise HTTPException(status_code=400, detail="PIN must be exactly 6 digits")

    # Find partner: first try direct email match, then lookup admin user from DB
    partner = await db.partner_accounts.find_one(
        {"$or": [{"email": admin_email.lower()}, {"email": admin_email}]}
    )
    if not partner:
        # Look up admin user to check role
        admin_user = await db.users.find_one({"email": admin_email})
        if admin_user and (admin_user.get("role") in ("admin", "super_admin", "superadmin") or admin_user.get("is_partner")):
            # Admin/master user: match to master_partner
            partner = await db.partner_accounts.find_one({"role": "master_partner"})

    if not partner:
        raise HTTPException(status_code=404, detail="No partner account linked to your CMS login")

    # Check lockout
    locked_until = partner.get("pin_locked_until")
    if locked_until:
        if isinstance(locked_until, str):
            locked_until = datetime.fromisoformat(locked_until.replace('Z', '+00:00'))
        if locked_until > datetime.now(timezone.utc):
            remaining = int((locked_until - datetime.now(timezone.utc)).total_seconds())
            raise HTTPException(status_code=423, detail=f"Too many attempts. Try again in {remaining} seconds.")
        else:
            await db.partner_accounts.update_one(
                {"id": partner["id"]},
                {"$set": {"pin_failed_attempts": 0, "pin_locked_until": None}}
            )

    pin_hash = partner.get("pin_hash")
    if not pin_hash:
        raise HTTPException(status_code=400, detail="PIN not set. Contact the master admin.")

    if not verify_pin(pin, pin_hash):
        failed = partner.get("pin_failed_attempts", 0) + 1
        update = {"pin_failed_attempts": failed}
        if failed >= MAX_PIN_ATTEMPTS:
            update["pin_locked_until"] = (datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_MINUTES)).isoformat()
        await db.partner_accounts.update_one({"id": partner["id"]}, {"$set": update})

        if failed >= MAX_PIN_ATTEMPTS:
            raise HTTPException(status_code=423, detail=f"Too many attempts. Try again in {LOCKOUT_MINUTES} minutes.")
        raise HTTPException(status_code=401, detail="Incorrect PIN", headers={"X-Attempts-Remaining": str(MAX_PIN_ATTEMPTS - failed)})

    # Success: reset failed attempts, issue partner JWT
    await db.partner_accounts.update_one(
        {"id": partner["id"]},
        {"$set": {"pin_failed_attempts": 0, "pin_locked_until": None}}
    )

    token = create_partner_token(partner)
    return {
        "access_token": token,
        "partner": {
            "id": partner["id"],
            "email": partner["email"],
            "role": partner["role"],
            "display_name": partner["display_name"],
        }
    }


@pin_router.post("/api/partners/set-pin")
async def set_pin(data: dict, authorization: str = Header(None)):
    """Set or change a partner's PIN. Master admin only."""
    admin = verify_admin_jwt(authorization)
    admin_email = admin.get("sub", admin.get("email", ""))
    admin_user = await db.users.find_one({"email": admin_email})
    if not admin_user or admin_user.get("role") not in ("admin", "super_admin", "superadmin"):
        raise HTTPException(status_code=403, detail="Only master admin can set PINs")

    partner_id = data.get("partner_id")
    new_pin = data.get("new_pin", "").strip()

    if not partner_id:
        raise HTTPException(status_code=400, detail="partner_id required")
    if not new_pin or len(new_pin) != 6 or not new_pin.isdigit():
        raise HTTPException(status_code=400, detail="PIN must be exactly 6 numeric digits")

    partner = await db.partner_accounts.find_one({"id": partner_id})
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    now = datetime.now(timezone.utc).isoformat()
    await db.partner_accounts.update_one(
        {"id": partner_id},
        {"$set": {
            "pin_hash": hash_pin(new_pin),
            "pin_set_at": now,
            "pin_failed_attempts": 0,
            "pin_locked_until": None,
        }}
    )
    return {"success": True, "message": f"PIN updated for {partner['display_name']}"}


@pin_router.get("/api/partner-pins/list")
async def list_partners(authorization: str = Header(None)):
    """List all partners for admin management. Master admin only."""
    admin = verify_admin_jwt(authorization)
    admin_email = admin.get("sub", admin.get("email", ""))
    admin_user = await db.users.find_one({"email": admin_email})
    if not admin_user or admin_user.get("role") not in ("admin", "super_admin", "superadmin"):
        raise HTTPException(status_code=403, detail="Only master admin can view partner list")

    partners = await db.partner_accounts.find({}, {"_id": 0, "password_hash": 0, "pin_hash": 0}).to_list(50)
    for p in partners:
        p["has_pin"] = bool(p.get("pin_set_at"))
    return {"partners": partners}
