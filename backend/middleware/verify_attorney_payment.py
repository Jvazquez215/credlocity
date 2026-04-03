"""
Attorney Payment Verification Middleware.
Verifies that an attorney or client has an active subscription/payment
before granting access to premium legal content and services.
"""
from fastapi import HTTPException
from datetime import datetime, timezone
import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "credlocity")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Services that require payment verification
PAID_SERVICES = {
    "attorney_marketplace": {"min_plan": "basic", "description": "Attorney Marketplace Access"},
    "legal_documents": {"min_plan": "standard", "description": "Legal Document Generation"},
    "credit_dispute": {"min_plan": "basic", "description": "Credit Dispute Filing"},
    "case_management": {"min_plan": "standard", "description": "Case Management"},
    "premium_reports": {"min_plan": "premium", "description": "Premium Credit Reports"},
    "consulting": {"min_plan": "premium", "description": "Legal Consulting"}
}

PLAN_TIERS = {"free": 0, "basic": 1, "standard": 2, "premium": 3, "enterprise": 4}


async def verify_attorney_payment(user: dict, service: str = None) -> dict:
    """
    Verify that a user has active payment/subscription for a service.
    Returns subscription info if valid, raises HTTPException otherwise.
    """
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    role = user.get("role", "viewer")
    if role in ("super_admin", "admin"):
        return {"verified": True, "plan": "enterprise", "reason": "Admin access"}

    # Check active subscription
    subscription = await db.subscriptions.find_one(
        {"user_id": user.get("id"), "status": "active"},
        {"_id": 0}
    )

    if not subscription:
        # Check if user has any valid payment records
        payment = await db.payments.find_one(
            {"user_id": user.get("id"), "status": "completed"},
            {"_id": 0},
            sort=[("created_at", -1)]
        )
        if not payment:
            raise HTTPException(
                status_code=402,
                detail="Payment required. Please subscribe to access this service."
            )
        # Create a basic subscription record from the payment
        subscription = {"plan": "basic", "status": "active"}

    # Check plan tier if a specific service is requested
    if service and service in PAID_SERVICES:
        required = PAID_SERVICES[service]
        user_tier = PLAN_TIERS.get(subscription.get("plan", "free"), 0)
        required_tier = PLAN_TIERS.get(required["min_plan"], 0)

        if user_tier < required_tier:
            raise HTTPException(
                status_code=402,
                detail=f"Your plan ({subscription.get('plan')}) doesn't include {required['description']}. "
                       f"Please upgrade to {required['min_plan']} or higher."
            )

    # Check expiration
    expiry = subscription.get("expires_at") or subscription.get("end_date")
    if expiry:
        exp_dt = datetime.fromisoformat(str(expiry)) if isinstance(expiry, str) else expiry
        if exp_dt.tzinfo is None:
            exp_dt = exp_dt.replace(tzinfo=timezone.utc)
        if exp_dt < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=402,
                detail="Your subscription has expired. Please renew to continue."
            )

    return {
        "verified": True,
        "plan": subscription.get("plan", "basic"),
        "status": subscription.get("status"),
        "expires_at": str(subscription.get("expires_at", ""))
    }


async def verify_service_access(user: dict, service: str) -> dict:
    """Convenience function to verify access to a specific service."""
    if service not in PAID_SERVICES:
        return {"verified": True, "reason": "Service does not require payment"}
    return await verify_attorney_payment(user, service)
