"""
Credlocity Promo/Discount Code System
Handles creation, validation, and redemption of promo codes for CRO registration and other purposes.
"""
from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from datetime import datetime, timezone
from uuid import uuid4
import os
from motor.motor_asyncio import AsyncIOMotorClient

promo_router = APIRouter(prefix="/api/promo", tags=["Promo Codes"])

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

CODE_TYPES = [
    "free_registration",
    "percentage_discount",
    "flat_credit",
    "free_trial",
    "freemium",
]


async def get_admin_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.replace("Bearer ", "")
    try:
        from jose import jwt
        SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-secret-key-change-in-production-credlocity-2025")
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = payload.get("sub")
        if not email:
            return None
    except Exception:
        return None
    user = await db.users.find_one({"email": email}, {"_id": 0, "hashed_password": 0})
    if user and user.get("role") == "super_admin":
        user["role"] = "admin"
    return user


def require_admin(user):
    if not user or user.get("role") not in ["admin", "director", "manager"]:
        raise HTTPException(status_code=403, detail="Admin access required")


# ==================== ADMIN CRUD ====================

@promo_router.post("/codes")
async def create_promo_code(data: dict, authorization: Optional[str] = Header(None)):
    user = await get_admin_user(authorization)
    require_admin(user)

    required = ["code", "type"]
    for f in required:
        if not data.get(f):
            raise HTTPException(status_code=400, detail=f"{f} is required")

    code = data["code"].upper().strip()
    code_type = data["type"]

    if code_type not in CODE_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid type. Must be one of: {CODE_TYPES}")

    existing = await db.promo_codes.find_one({"code": code})
    if existing:
        raise HTTPException(status_code=400, detail="A promo code with this code already exists")

    promo = {
        "id": str(uuid4()),
        "code": code,
        "type": code_type,
        "value": float(data.get("value", 0)),
        "description": data.get("description", ""),
        "applies_to": data.get("applies_to", "cro_registration"),
        "max_uses": int(data.get("max_uses", 0)),
        "times_used": 0,
        "free_trial_days": int(data.get("free_trial_days", 0)),
        "expires_at": data.get("expires_at"),
        "active": True,
        "created_by": user.get("full_name", user.get("email", "")),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.promo_codes.insert_one(promo)
    promo.pop("_id", None)
    return {"message": "Promo code created", "promo": promo}


@promo_router.get("/codes")
async def list_promo_codes(authorization: Optional[str] = Header(None)):
    user = await get_admin_user(authorization)
    require_admin(user)

    codes = await db.promo_codes.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return {"codes": codes}


@promo_router.get("/codes/{code_id}")
async def get_promo_code(code_id: str, authorization: Optional[str] = Header(None)):
    user = await get_admin_user(authorization)
    require_admin(user)

    promo = await db.promo_codes.find_one({"id": code_id}, {"_id": 0})
    if not promo:
        raise HTTPException(status_code=404, detail="Promo code not found")

    redemptions = await db.promo_redemptions.find({"promo_id": code_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"promo": promo, "redemptions": redemptions}


@promo_router.put("/codes/{code_id}")
async def update_promo_code(code_id: str, data: dict, authorization: Optional[str] = Header(None)):
    user = await get_admin_user(authorization)
    require_admin(user)

    promo = await db.promo_codes.find_one({"id": code_id})
    if not promo:
        raise HTTPException(status_code=404, detail="Promo code not found")

    allowed = ["description", "value", "max_uses", "free_trial_days", "expires_at", "active", "applies_to"]
    updates = {k: data[k] for k in allowed if k in data}
    if "value" in updates:
        updates["value"] = float(updates["value"])
    if "max_uses" in updates:
        updates["max_uses"] = int(updates["max_uses"])
    if "free_trial_days" in updates:
        updates["free_trial_days"] = int(updates["free_trial_days"])
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()

    await db.promo_codes.update_one({"id": code_id}, {"$set": updates})
    updated = await db.promo_codes.find_one({"id": code_id}, {"_id": 0})
    return {"message": "Promo code updated", "promo": updated}


@promo_router.delete("/codes/{code_id}")
async def delete_promo_code(code_id: str, authorization: Optional[str] = Header(None)):
    user = await get_admin_user(authorization)
    require_admin(user)

    result = await db.promo_codes.delete_one({"id": code_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Promo code not found")
    return {"message": "Promo code deleted"}


# ==================== PUBLIC VALIDATION ====================

@promo_router.post("/validate")
async def validate_promo_code(data: dict):
    """Public endpoint - validate a promo code before applying it."""
    code = data.get("code", "").upper().strip()
    applies_to = data.get("applies_to", "cro_registration")

    if not code:
        raise HTTPException(status_code=400, detail="Code is required")

    promo = await db.promo_codes.find_one({"code": code, "active": True}, {"_id": 0})
    if not promo:
        raise HTTPException(status_code=404, detail="Invalid or expired promo code")

    if promo.get("applies_to") and promo["applies_to"] != applies_to:
        raise HTTPException(status_code=400, detail="This code is not valid for this registration type")

    if promo.get("max_uses") and promo["times_used"] >= promo["max_uses"]:
        raise HTTPException(status_code=400, detail="This promo code has reached its usage limit")

    if promo.get("expires_at"):
        try:
            exp = datetime.fromisoformat(promo["expires_at"].replace("Z", "+00:00"))
            if datetime.now(timezone.utc) > exp:
                raise HTTPException(status_code=400, detail="This promo code has expired")
        except (ValueError, TypeError):
            pass

    signup_fee = 500.00
    monthly_fee = 99.99
    discount_info = {"original_signup_fee": signup_fee, "original_monthly_fee": monthly_fee}

    if promo["type"] == "free_registration":
        discount_info["final_signup_fee"] = 0
        discount_info["final_monthly_fee"] = monthly_fee
        discount_info["message"] = "Registration fee waived!"
    elif promo["type"] == "percentage_discount":
        pct = promo.get("value", 0) / 100
        discount_info["final_signup_fee"] = round(signup_fee * (1 - pct), 2)
        discount_info["final_monthly_fee"] = monthly_fee
        discount_info["message"] = f"{promo.get('value', 0)}% off signup fee!"
    elif promo["type"] == "flat_credit":
        credit = min(promo.get("value", 0), signup_fee)
        discount_info["final_signup_fee"] = round(signup_fee - credit, 2)
        discount_info["final_monthly_fee"] = monthly_fee
        discount_info["message"] = f"${credit:.2f} credit applied!"
    elif promo["type"] == "free_trial":
        discount_info["final_signup_fee"] = 0
        discount_info["final_monthly_fee"] = 0
        discount_info["free_trial_days"] = promo.get("free_trial_days", 30)
        discount_info["message"] = f"Free {promo.get('free_trial_days', 30)}-day trial!"
    elif promo["type"] == "freemium":
        discount_info["final_signup_fee"] = 0
        discount_info["final_monthly_fee"] = round(monthly_fee * (1 - promo.get("value", 0) / 100), 2)
        discount_info["message"] = f"Free signup + {promo.get('value', 0)}% off monthly!"

    return {
        "valid": True,
        "code": promo["code"],
        "type": promo["type"],
        "description": promo.get("description", ""),
        "discount": discount_info,
    }


async def redeem_promo_code(code, redeemer_email, redeemer_name, applies_to="cro_registration"):
    """Internal function to record a promo code redemption."""
    promo = await db.promo_codes.find_one({"code": code.upper().strip(), "active": True})
    if not promo:
        return None

    redemption = {
        "id": str(uuid4()),
        "promo_id": promo["id"],
        "code": promo["code"],
        "type": promo["type"],
        "redeemer_email": redeemer_email,
        "redeemer_name": redeemer_name,
        "applies_to": applies_to,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.promo_redemptions.insert_one(redemption)
    await db.promo_codes.update_one({"id": promo["id"]}, {"$inc": {"times_used": 1}})

    return promo
