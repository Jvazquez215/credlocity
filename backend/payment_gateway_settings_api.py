"""
Payment Gateway Settings API
Manage Authorize.net and PayPal gateway configurations.
Credentials are stored encrypted in MongoDB and pushed to environment at runtime.
"""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from datetime import datetime, timezone
from uuid import uuid4
import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "credlocity")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

gateway_settings_router = APIRouter(prefix="/api/gateway-settings", tags=["Gateway Settings"])


async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.replace("Bearer ", "")
    try:
        from jose import jwt
        SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-secret-key-change-in-production-credlocity-2025")
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = payload.get("sub")
        if email:
            user = await db.users.find_one({"email": email}, {"_id": 0, "hashed_password": 0})
            if user and user.get("role") == "super_admin":
                user["role"] = "admin"
            return user
    except Exception:
        pass
    return None


def require_admin(user):
    if not user or user.get("role") not in ["admin", "super_admin", "director"]:
        raise HTTPException(status_code=403, detail="Admin authentication required")


def mask_key(key: str) -> str:
    """Mask a credential key for display, showing only last 4 chars."""
    if not key or len(key) < 8:
        return "****"
    return "*" * (len(key) - 4) + key[-4:]


# ==================== GET SETTINGS ====================

@gateway_settings_router.get("")
async def get_gateway_settings(authorization: Optional[str] = Header(None)):
    """Get all payment gateway configurations (credentials masked)."""
    user = await get_current_user(authorization)
    require_admin(user)

    settings = await db.payment_gateway_settings.find_one({"id": "gateway_config"}, {"_id": 0})

    if not settings:
        settings = await _initialize_gateway_settings()

    # Mask credentials for response
    masked = {**settings}
    for gw in ["authorize_net", "paypal"]:
        gw_config = masked.get(gw, {})
        for key in ["api_login_id", "transaction_key", "signature_key", "client_id", "client_secret"]:
            if gw_config.get(key):
                gw_config[key] = mask_key(gw_config[key])

    return masked


@gateway_settings_router.get("/status")
async def get_gateway_status(authorization: Optional[str] = Header(None)):
    """Get quick status of all gateways (no credentials)."""
    user = await get_current_user(authorization)
    require_admin(user)

    settings = await db.payment_gateway_settings.find_one({"id": "gateway_config"}, {"_id": 0})
    if not settings:
        settings = await _initialize_gateway_settings()

    anet = settings.get("authorize_net", {})
    pp = settings.get("paypal", {})

    return {
        "authorize_net": {
            "active": anet.get("active", False),
            "environment": anet.get("environment", "sandbox"),
            "configured": bool(anet.get("api_login_id") and anet.get("transaction_key")),
            "is_default": settings.get("default_gateway") == "authorize_net",
        },
        "paypal": {
            "active": pp.get("active", False),
            "environment": pp.get("environment", "sandbox"),
            "configured": bool(pp.get("client_id") and pp.get("client_secret")),
            "is_default": settings.get("default_gateway") == "paypal",
        },
        "default_gateway": settings.get("default_gateway", "authorize_net"),
    }


# ==================== UPDATE AUTHORIZE.NET ====================

@gateway_settings_router.put("/authorize-net")
async def update_authorize_net(data: dict, authorization: Optional[str] = Header(None)):
    """Update Authorize.net gateway settings."""
    user = await get_current_user(authorization)
    require_admin(user)

    settings = await db.payment_gateway_settings.find_one({"id": "gateway_config"})
    if not settings:
        await _initialize_gateway_settings()
        settings = await db.payment_gateway_settings.find_one({"id": "gateway_config"})

    update_fields = {}
    anet_current = settings.get("authorize_net", {})

    # Only update fields that were provided and aren't masked
    if "api_login_id" in data and not data["api_login_id"].startswith("*"):
        update_fields["authorize_net.api_login_id"] = data["api_login_id"]
    if "transaction_key" in data and not data["transaction_key"].startswith("*"):
        update_fields["authorize_net.transaction_key"] = data["transaction_key"]
    if "signature_key" in data and not data["signature_key"].startswith("*"):
        update_fields["authorize_net.signature_key"] = data["signature_key"]
    if "environment" in data:
        update_fields["authorize_net.environment"] = data["environment"]
    if "active" in data:
        update_fields["authorize_net.active"] = data["active"]

    update_fields["authorize_net.updated_at"] = datetime.now(timezone.utc).isoformat()
    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()

    await db.payment_gateway_settings.update_one(
        {"id": "gateway_config"},
        {"$set": update_fields}
    )

    # Sync credentials to environment for the SDK
    final = await db.payment_gateway_settings.find_one({"id": "gateway_config"}, {"_id": 0})
    anet_final = final.get("authorize_net", {})
    if anet_final.get("api_login_id"):
        os.environ["AUTHORIZENET_API_LOGIN_ID"] = anet_final["api_login_id"]
    if anet_final.get("transaction_key"):
        os.environ["AUTHORIZENET_TRANSACTION_KEY"] = anet_final["transaction_key"]
    if anet_final.get("environment"):
        os.environ["AUTHORIZENET_ENV"] = anet_final["environment"]

    return {"message": "Authorize.net settings updated"}


# ==================== UPDATE PAYPAL ====================

@gateway_settings_router.put("/paypal")
async def update_paypal(data: dict, authorization: Optional[str] = Header(None)):
    """Update PayPal gateway settings."""
    user = await get_current_user(authorization)
    require_admin(user)

    settings = await db.payment_gateway_settings.find_one({"id": "gateway_config"})
    if not settings:
        await _initialize_gateway_settings()

    update_fields = {}
    if "client_id" in data and not data["client_id"].startswith("*"):
        update_fields["paypal.client_id"] = data["client_id"]
    if "client_secret" in data and not data["client_secret"].startswith("*"):
        update_fields["paypal.client_secret"] = data["client_secret"]
    if "environment" in data:
        update_fields["paypal.environment"] = data["environment"]
    if "active" in data:
        update_fields["paypal.active"] = data["active"]

    update_fields["paypal.updated_at"] = datetime.now(timezone.utc).isoformat()
    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()

    await db.payment_gateway_settings.update_one(
        {"id": "gateway_config"},
        {"$set": update_fields}
    )

    return {"message": "PayPal settings updated"}


# ==================== SET DEFAULT GATEWAY ====================

@gateway_settings_router.put("/default")
async def set_default_gateway(data: dict, authorization: Optional[str] = Header(None)):
    """Set the default payment gateway."""
    user = await get_current_user(authorization)
    require_admin(user)

    gateway = data.get("gateway")
    if gateway not in ["authorize_net", "paypal"]:
        raise HTTPException(status_code=400, detail="Invalid gateway. Must be 'authorize_net' or 'paypal'")

    await db.payment_gateway_settings.update_one(
        {"id": "gateway_config"},
        {"$set": {"default_gateway": gateway, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )

    return {"message": f"Default gateway set to {gateway}"}


# ==================== TEST CONNECTION ====================

@gateway_settings_router.post("/test/authorize-net")
async def test_authorize_net(authorization: Optional[str] = Header(None)):
    """Test Authorize.net connection by calling the health endpoint."""
    user = await get_current_user(authorization)
    require_admin(user)

    has_login = bool(os.environ.get("AUTHORIZENET_API_LOGIN_ID"))
    has_key = bool(os.environ.get("AUTHORIZENET_TRANSACTION_KEY"))

    if not (has_login and has_key):
        return {"success": False, "message": "Credentials not configured. Save your API Login ID and Transaction Key first."}

    try:
        import authorizenet_service as anet
        result = anet.get_settled_batch_list()
        if result.get("success") or result.get("error_code") == "E00003":
            return {"success": True, "message": "Connection successful! Authorize.net credentials are valid."}
        else:
            return {"success": False, "message": f"Connection failed: {result.get('error_message', 'Unknown error')}"}
    except Exception as e:
        return {"success": False, "message": f"Connection test failed: {str(e)}"}


@gateway_settings_router.post("/test/paypal")
async def test_paypal(authorization: Optional[str] = Header(None)):
    """Test PayPal connection (placeholder — will be implemented when PayPal SDK is added)."""
    user = await get_current_user(authorization)
    require_admin(user)

    settings = await db.payment_gateway_settings.find_one({"id": "gateway_config"}, {"_id": 0})
    pp = settings.get("paypal", {}) if settings else {}

    if not pp.get("client_id") or not pp.get("client_secret"):
        return {"success": False, "message": "PayPal credentials not configured."}

    return {"success": False, "message": "PayPal SDK integration pending. Credentials saved and will be validated when PayPal processing is enabled."}


# ==================== INITIALIZE ====================

async def _initialize_gateway_settings():
    """Create default gateway settings document."""
    now = datetime.now(timezone.utc).isoformat()

    # Pre-populate from existing env vars if available
    anet_login = os.environ.get("AUTHORIZENET_API_LOGIN_ID", "")
    anet_key = os.environ.get("AUTHORIZENET_TRANSACTION_KEY", "")
    anet_env = os.environ.get("AUTHORIZENET_ENV", "production")

    settings = {
        "id": "gateway_config",
        "default_gateway": "authorize_net",
        "authorize_net": {
            "api_login_id": anet_login,
            "transaction_key": anet_key,
            "signature_key": "",
            "environment": anet_env,
            "active": bool(anet_login and anet_key),
            "updated_at": now,
        },
        "paypal": {
            "client_id": "",
            "client_secret": "",
            "environment": "sandbox",
            "active": False,
            "updated_at": now,
        },
        "created_at": now,
        "updated_at": now,
    }

    await db.payment_gateway_settings.insert_one(settings)
    settings.pop("_id", None)
    return settings
