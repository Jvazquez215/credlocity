"""
Credlocity CRO (Credit Repair Organization) Partnership API
Handles CRO registration, portal, case submission, earnings, and messaging
"""
from fastapi import APIRouter, HTTPException, Header, UploadFile, File, Form
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from uuid import uuid4
import os
import bcrypt
from motor.motor_asyncio import AsyncIOMotorClient

cro_router = APIRouter(prefix="/api/cro", tags=["CRO Portal"])

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

CRO_STATUSES = ["pending", "approved", "active", "suspended", "banned"]
CASE_STATUSES = ["pending_review", "approved", "listed", "pledged", "bidding", "awarded", "completed", "rejected"]

SIGNUP_FEE = 500.00
MONTHLY_FEE = 99.99
PLATFORM_FEE_PCT = 0.20
CRO_PAYOUT_PCT = 0.80
STANDARD_PLEDGE_FEE = 400.00
BIDDING_MIN_VALUE = 10000
BIDDING_MIN_VIOLATIONS = 2
BIDDING_WINDOW_DAYS = 14


async def get_cro_from_token(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.replace("Bearer ", "")
    cro = await db.cro_organizations.find_one({"token": token}, {"_id": 0, "password_hash": 0})
    if cro:
        return {**cro, "is_cro": True}
    return None


def require_cro(user):
    if not user or not user.get("is_cro"):
        raise HTTPException(status_code=401, detail="Not authenticated as CRO")
    if user.get("status") not in ["approved", "active"]:
        raise HTTPException(status_code=403, detail=f"CRO account is {user.get('status')}. Contact support.")
    return user


# ==================== REGISTRATION & AUTH ====================

@cro_router.post("/register")
async def cro_register(data: dict):
    required = ["company_name", "owner_name", "email", "phone", "ein", "state", "password", "agreement_accepted"]
    for field in required:
        if not data.get(field):
            raise HTTPException(status_code=400, detail=f"{field} is required")

    if not data.get("agreement_accepted"):
        raise HTTPException(status_code=400, detail="You must accept the participation agreement")

    email = data["email"].lower()
    existing = await db.cro_organizations.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="A CRO with this email already exists")

    existing_ein = await db.cro_organizations.find_one({"ein": data["ein"]})
    if existing_ein:
        raise HTTPException(status_code=400, detail="A CRO with this EIN already exists")

    password_hash = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt()).decode()

    cro = {
        "id": str(uuid4()),
        "company_name": data["company_name"],
        "owner_name": data["owner_name"],
        "email": email,
        "phone": data["phone"],
        "ein": data["ein"],
        "license_number": data.get("license_number", ""),
        "state": data["state"],
        "website": data.get("website", ""),
        "password_hash": password_hash,
        "status": "pending",
        "referral_code": f"CRO-{str(uuid4())[:8].upper()}",
        "signup_fee_paid": False,
        "subscription_active": False,
        "subscription_start": None,
        "subscription_next_billing": None,
        "total_cases_submitted": 0,
        "total_cases_accepted": 0,
        "total_earnings": 0,
        "pending_payouts": 0,
        "enforcement_strikes": 0,
        "enforcement_history": [],
        "agreement_accepted": True,
        "agreement_accepted_at": datetime.now(timezone.utc).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    # Handle promo code if provided
    promo_code = data.get("promo_code", "").upper().strip()
    promo_applied = None
    if promo_code:
        promo = await db.promo_codes.find_one({"code": promo_code, "active": True})
        if promo:
            from promo_api import redeem_promo_code
            promo_applied = await redeem_promo_code(promo_code, email, data["company_name"], "cro_registration")
            if promo_applied:
                cro["promo_code_used"] = promo_code
                cro["promo_type"] = promo_applied["type"]
                if promo_applied["type"] in ("free_registration", "free_trial", "freemium"):
                    cro["signup_fee_paid"] = True
                if promo_applied["type"] == "free_trial":
                    cro["subscription_active"] = True
                    cro["subscription_start"] = datetime.now(timezone.utc).isoformat()
                    trial_days = promo_applied.get("free_trial_days", 30)
                    cro["subscription_next_billing"] = (datetime.now(timezone.utc) + timedelta(days=trial_days)).isoformat()
                    cro["free_trial_ends"] = cro["subscription_next_billing"]

    await db.cro_organizations.insert_one(cro)
    cro.pop("_id", None)
    cro.pop("password_hash", None)

    # Auto-enroll in email subscriber system
    try:
        from subscriber_api import enroll_subscriber
        await enroll_subscriber(email, data["owner_name"], "cro_registration", ["cro", "blog", "press_release", "updates", "newsletter"])
    except Exception:
        pass

    return {
        "message": "Registration submitted. Your application will be reviewed within 24-48 hours.",
        "cro_id": cro["id"],
        "promo_applied": promo_code if promo_applied else None,
    }


@cro_router.post("/pay-signup")
async def cro_pay_signup(data: dict):
    """
    Process Authorize.net payment for CRO signup fee.
    Called after registration with the CRO ID.
    Body: { cro_id, card_number, expiration_date, card_code, bill_to?: {...} }
    """
    cro_id = data.get("cro_id")
    if not cro_id:
        raise HTTPException(status_code=400, detail="cro_id is required")

    cro = await db.cro_organizations.find_one({"id": cro_id})
    if not cro:
        raise HTTPException(status_code=404, detail="CRO not found")

    if cro.get("signup_fee_paid"):
        return {"message": "Signup fee already paid", "already_paid": True}

    for field in ["card_number", "expiration_date", "card_code"]:
        if not data.get(field):
            raise HTTPException(status_code=400, detail=f"{field} is required")

    # Calculate amount based on promo
    signup_fee = 500.00
    if cro.get("promo_type") == "percentage_discount":
        promo = await db.promo_codes.find_one({"code": cro.get("promo_code_used")})
        if promo:
            pct = promo.get("value", 0) / 100
            signup_fee = round(signup_fee * (1 - pct), 2)
    elif cro.get("promo_type") == "flat_credit":
        promo = await db.promo_codes.find_one({"code": cro.get("promo_code_used")})
        if promo:
            signup_fee = max(0, round(signup_fee - promo.get("value", 0), 2))
    elif cro.get("promo_type") in ("free_registration", "free_trial", "freemium"):
        signup_fee = 0

    if signup_fee <= 0:
        await db.cro_organizations.update_one(
            {"id": cro_id},
            {"$set": {"signup_fee_paid": True, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        return {"message": "No payment required (promo applied)", "amount": 0, "already_paid": True}

    try:
        import authorizenet_service as anet
        result = anet.charge_credit_card(
            amount=signup_fee,
            card_number=data["card_number"],
            expiration_date=data["expiration_date"],
            card_code=data["card_code"],
            order_description="CRO Partnership Signup Fee",
            invoice_number=f"CRO-SIGNUP-{cro_id[:8]}",
            customer_email=cro.get("email"),
            customer_id=cro_id[:20],
            bill_to=data.get("bill_to")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment processing error: {str(e)}")

    if result.get("success"):
        await db.cro_organizations.update_one(
            {"id": cro_id},
            {"$set": {
                "signup_fee_paid": True,
                "signup_payment_transaction_id": result.get("transaction_id"),
                "signup_payment_date": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }}
        )
        # Record revenue
        revenue_record = {
            "id": str(uuid4()),
            "source": "cro_signup",
            "category": "cro_registration",
            "amount": signup_fee,
            "description": f"CRO Signup Fee: {cro.get('company_name')}",
            "reference_id": result.get("transaction_id"),
            "reference_type": "authorizenet_transaction",
            "payment_status": "paid",
            "payment_method": "credit_card",
            "client_type": "cro",
            "client_name": cro.get("company_name"),
            "payment_date": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.revenue_records.insert_one(revenue_record)

        return {
            "message": "Signup fee paid successfully",
            "amount": signup_fee,
            "transaction_id": result.get("transaction_id"),
        }
    else:
        raise HTTPException(
            status_code=400,
            detail=result.get("error_message", "Payment failed. Please check your card details.")
        )


@cro_router.post("/login")
async def cro_login(data: dict):
    email = data.get("email", "").lower()
    password = data.get("password", "")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")

    cro = await db.cro_organizations.find_one({"email": email})
    if not cro:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not cro.get("password_hash"):
        raise HTTPException(status_code=401, detail="Password not set. Contact support.")

    if not bcrypt.checkpw(password.encode(), cro["password_hash"].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if cro["status"] not in ["approved", "active"]:
        raise HTTPException(status_code=403, detail=f"Account is {cro['status']}. Contact support.")

    token = str(uuid4())
    await db.cro_organizations.update_one(
        {"id": cro["id"]},
        {"$set": {"token": token, "last_login": datetime.now(timezone.utc).isoformat()}}
    )

    return {
        "token": token,
        "cro": {
            "id": cro["id"],
            "email": cro["email"],
            "company_name": cro["company_name"],
            "owner_name": cro["owner_name"],
            "status": cro["status"],
            "referral_code": cro["referral_code"],
        },
    }


# ==================== CRO PORTAL ====================

@cro_router.get("/me")
async def get_cro_profile(authorization: Optional[str] = Header(None)):
    user = await get_cro_from_token(authorization)
    cro = require_cro(user)
    profile = await db.cro_organizations.find_one({"id": cro["id"]}, {"_id": 0, "password_hash": 0, "token": 0})
    return profile


@cro_router.put("/me")
async def update_cro_profile(data: dict, authorization: Optional[str] = Header(None)):
    user = await get_cro_from_token(authorization)
    cro = require_cro(user)

    allowed = ["company_name", "owner_name", "phone", "website", "license_number"]
    updates = {k: v for k, v in data.items() if k in allowed and v}
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()

    if data.get("new_password") and data.get("current_password"):
        full = await db.cro_organizations.find_one({"id": cro["id"]})
        if not bcrypt.checkpw(data["current_password"].encode(), full["password_hash"].encode()):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        updates["password_hash"] = bcrypt.hashpw(data["new_password"].encode(), bcrypt.gensalt()).decode()

    await db.cro_organizations.update_one({"id": cro["id"]}, {"$set": updates})
    profile = await db.cro_organizations.find_one({"id": cro["id"]}, {"_id": 0, "password_hash": 0, "token": 0})
    return {"message": "Profile updated", "profile": profile}


@cro_router.get("/dashboard")
async def get_cro_dashboard(authorization: Optional[str] = Header(None)):
    user = await get_cro_from_token(authorization)
    cro = require_cro(user)
    cro_id = cro["id"]

    cases = await db.cro_cases.find({"cro_id": cro_id}, {"_id": 0}).to_list(500)
    pending = [c for c in cases if c["status"] in ("pending_review", "approved")]
    listed = [c for c in cases if c["status"] == "listed"]
    pledged = [c for c in cases if c["status"] == "pledged"]
    bidding = [c for c in cases if c["status"] == "bidding"]
    awarded = [c for c in cases if c["status"] in ("awarded", "completed")]
    rejected = [c for c in cases if c["status"] == "rejected"]

    payouts = await db.cro_payouts.find({"cro_id": cro_id}, {"_id": 0}).to_list(200)
    paid = sum(p["amount"] for p in payouts if p["status"] == "paid")
    pending_pay = sum(p["amount"] for p in payouts if p["status"] == "pending")

    unread = await db.cro_messages.count_documents({"cro_id": cro_id, "sender_type": "attorney", "read": False})

    return {
        "summary": {
            "total_cases": len(cases),
            "pending_cases": len(pending),
            "listed_cases": len(listed),
            "pledged_cases": len(pledged),
            "bidding_cases": len(bidding),
            "awarded_cases": len(awarded),
            "rejected_cases": len(rejected),
            "total_earnings": round(paid, 2),
            "pending_payouts": round(pending_pay, 2),
            "unread_messages": unread,
        },
        "recent_cases": sorted(cases, key=lambda c: c.get("created_at", ""), reverse=True)[:5],
        "recent_payouts": sorted(payouts, key=lambda p: p.get("created_at", ""), reverse=True)[:5],
    }


# ==================== CASE SUBMISSION ====================

@cro_router.post("/cases")
async def submit_case(data: dict, authorization: Optional[str] = Header(None)):
    user = await get_cro_from_token(authorization)
    cro = require_cro(user)

    required = ["client_name", "client_state", "dispute_date", "mail_method",
                 "violation_type", "violation_count", "bureau"]
    for field in required:
        if not data.get(field):
            raise HTTPException(status_code=400, detail=f"{field} is required")

    violation_count = int(data.get("violation_count", 0))
    estimated_value = calculate_case_value(
        violation_count=violation_count,
        mail_method=data.get("mail_method", "regular"),
        documentation_quality=data.get("documentation_quality", "standard"),
        bureau_responses=data.get("bureau_responses_received", 0),
    )

    qualifies_bidding = (
        estimated_value >= BIDDING_MIN_VALUE
        and violation_count >= BIDDING_MIN_VIOLATIONS
        and data.get("mail_method") == "certified"
    )

    case = {
        "id": str(uuid4()),
        "case_number": f"CRO-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{str(uuid4())[:6].upper()}",
        "cro_id": cro["id"],
        "cro_name": cro["company_name"],
        "client_name": data["client_name"],
        "client_email": data.get("client_email", ""),
        "client_phone": data.get("client_phone", ""),
        "client_state": data["client_state"],
        "dispute_date": data["dispute_date"],
        "mail_method": data["mail_method"],
        "usps_tracking": data.get("usps_tracking", ""),
        "violation_type": data["violation_type"],
        "violation_count": violation_count,
        "violation_details": data.get("violation_details", ""),
        "bureau": data["bureau"],
        "bureau_responses_received": int(data.get("bureau_responses_received", 0)),
        "documentation_quality": data.get("documentation_quality", "standard"),
        "dispute_letter_files": data.get("dispute_letter_files", []),
        "bureau_response_files": data.get("bureau_response_files", []),
        "additional_files": data.get("additional_files", []),
        "case_summary": data.get("case_summary", ""),
        "estimated_value": estimated_value,
        "qualifies_bidding": qualifies_bidding,
        "status": "pending_review",
        "pledge_fee": STANDARD_PLEDGE_FEE,
        "attorney_id": None,
        "attorney_name": None,
        "bid_amount": None,
        "bidding_deadline": None,
        "class_action": data.get("class_action", False),
        "class_action_consumers": int(data.get("class_action_consumers", 0)),
        "payment_status": "pending",
        "cro_payout_amount": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    if qualifies_bidding:
        case["bidding_deadline"] = (datetime.now(timezone.utc) + timedelta(days=BIDDING_WINDOW_DAYS)).isoformat()

    if case["class_action"] and case["class_action_consumers"] >= 50:
        case["bidding_deadline"] = (datetime.now(timezone.utc) + timedelta(days=21)).isoformat()
        case["qualifies_bidding"] = True

    await db.cro_cases.insert_one(case)
    case.pop("_id", None)

    await db.cro_organizations.update_one(
        {"id": cro["id"]},
        {"$inc": {"total_cases_submitted": 1}}
    )

    return {"message": "Case submitted for review", "case": case}


def calculate_case_value(violation_count, mail_method, documentation_quality, bureau_responses):
    base = violation_count * 1000
    if mail_method == "certified":
        base *= 1.5
    if documentation_quality == "excellent":
        base *= 1.3
    elif documentation_quality == "good":
        base *= 1.1
    base += bureau_responses * 500
    return round(base, 2)


@cro_router.get("/cases")
async def list_cro_cases(
    status: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    authorization: Optional[str] = Header(None)
):
    user = await get_cro_from_token(authorization)
    cro = require_cro(user)

    query = {"cro_id": cro["id"]}
    if status:
        query["status"] = status

    cases = await db.cro_cases.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    total = await db.cro_cases.count_documents(query)

    return {"cases": cases, "total": total}


@cro_router.get("/cases/{case_id}")
async def get_cro_case(case_id: str, authorization: Optional[str] = Header(None)):
    user = await get_cro_from_token(authorization)
    cro = require_cro(user)

    case = await db.cro_cases.find_one({"id": case_id, "cro_id": cro["id"]}, {"_id": 0})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    bids = await db.cro_case_bids.find({"case_id": case_id}, {"_id": 0}).to_list(50)
    messages = await db.cro_messages.find(
        {"case_id": case_id, "cro_id": cro["id"]}, {"_id": 0}
    ).sort("created_at", 1).to_list(200)

    return {"case": case, "bids": bids, "messages": messages}


# ==================== EARNINGS ====================

@cro_router.get("/earnings")
async def get_cro_earnings(authorization: Optional[str] = Header(None)):
    user = await get_cro_from_token(authorization)
    cro = require_cro(user)

    payouts = await db.cro_payouts.find({"cro_id": cro["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)

    paid = [p for p in payouts if p["status"] == "paid"]
    pending = [p for p in payouts if p["status"] == "pending"]

    return {
        "lifetime_earnings": round(sum(p["amount"] for p in paid), 2),
        "pending_payouts": round(sum(p["amount"] for p in pending), 2),
        "paid_count": len(paid),
        "pending_count": len(pending),
        "payouts": payouts,
    }


# ==================== MESSAGING ====================

@cro_router.get("/messages")
async def get_cro_message_threads(authorization: Optional[str] = Header(None)):
    user = await get_cro_from_token(authorization)
    cro = require_cro(user)

    pipeline = [
        {"$match": {"cro_id": cro["id"]}},
        {"$sort": {"created_at": -1}},
        {"$group": {
            "_id": "$case_id",
            "case_id": {"$first": "$case_id"},
            "case_number": {"$first": "$case_number"},
            "attorney_id": {"$first": "$attorney_id"},
            "attorney_name": {"$first": "$attorney_name"},
            "last_message": {"$first": "$content"},
            "last_sender": {"$first": "$sender_type"},
            "last_at": {"$first": "$created_at"},
            "unread": {"$sum": {"$cond": [{"$and": [{"$eq": ["$sender_type", "attorney"]}, {"$eq": ["$read", False]}]}, 1, 0]}},
        }},
        {"$sort": {"last_at": -1}},
        {"$project": {"_id": 0}},
    ]

    threads = await db.cro_messages.aggregate(pipeline).to_list(100)
    return {"threads": threads}


@cro_router.get("/messages/{case_id}")
async def get_case_messages_cro(case_id: str, authorization: Optional[str] = Header(None)):
    user = await get_cro_from_token(authorization)
    cro = require_cro(user)

    messages = await db.cro_messages.find(
        {"case_id": case_id, "cro_id": cro["id"]}, {"_id": 0}
    ).sort("created_at", 1).to_list(200)

    await db.cro_messages.update_many(
        {"case_id": case_id, "cro_id": cro["id"], "sender_type": "attorney", "read": False},
        {"$set": {"read": True}}
    )

    return {"messages": messages}


@cro_router.post("/messages/{case_id}")
async def send_message_cro(case_id: str, data: dict, authorization: Optional[str] = Header(None)):
    user = await get_cro_from_token(authorization)
    cro = require_cro(user)

    case = await db.cro_cases.find_one({"id": case_id, "cro_id": cro["id"]}, {"_id": 0})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if not case.get("attorney_id"):
        raise HTTPException(status_code=400, detail="No attorney assigned to this case yet")

    msg = {
        "id": str(uuid4()),
        "case_id": case_id,
        "case_number": case.get("case_number", ""),
        "cro_id": cro["id"],
        "cro_name": cro["company_name"],
        "attorney_id": case["attorney_id"],
        "attorney_name": case.get("attorney_name", ""),
        "sender_type": "cro",
        "sender_name": cro["company_name"],
        "content": data.get("content", ""),
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.cro_messages.insert_one(msg)
    msg.pop("_id", None)
    return {"message": msg}


@cro_router.get("/unread-count")
async def get_unread_count(authorization: Optional[str] = Header(None)):
    user = await get_cro_from_token(authorization)
    cro = require_cro(user)
    count = await db.cro_messages.count_documents({"cro_id": cro["id"], "sender_type": "attorney", "read": False})
    return {"unread": count}


# ==================== SUBSCRIPTION ====================

@cro_router.get("/subscription")
async def get_subscription(authorization: Optional[str] = Header(None)):
    user = await get_cro_from_token(authorization)
    cro = require_cro(user)
    org = await db.cro_organizations.find_one({"id": cro["id"]}, {"_id": 0, "password_hash": 0, "token": 0})
    return {
        "signup_fee_paid": org.get("signup_fee_paid", False),
        "subscription_active": org.get("subscription_active", False),
        "subscription_start": org.get("subscription_start"),
        "subscription_next_billing": org.get("subscription_next_billing"),
        "monthly_fee": MONTHLY_FEE,
        "signup_fee": SIGNUP_FEE,
    }


# ==================== ATTORNEY-SIDE MESSAGING ====================

@cro_router.get("/attorney/messages")
async def get_attorney_cro_threads(authorization: Optional[str] = Header(None)):
    """Attorney-side: get all CRO message threads"""
    from attorney_api import get_current_user as get_atty_user
    user = await get_atty_user(authorization)
    if not user or not user.get("is_attorney"):
        raise HTTPException(status_code=401, detail="Not authenticated as attorney")

    pipeline = [
        {"$match": {"attorney_id": user["id"]}},
        {"$sort": {"created_at": -1}},
        {"$group": {
            "_id": "$case_id",
            "case_id": {"$first": "$case_id"},
            "case_number": {"$first": "$case_number"},
            "cro_id": {"$first": "$cro_id"},
            "cro_name": {"$first": "$cro_name"},
            "last_message": {"$first": "$content"},
            "last_sender": {"$first": "$sender_type"},
            "last_at": {"$first": "$created_at"},
            "unread": {"$sum": {"$cond": [{"$and": [{"$eq": ["$sender_type", "cro"]}, {"$eq": ["$read", False]}]}, 1, 0]}},
        }},
        {"$sort": {"last_at": -1}},
        {"$project": {"_id": 0}},
    ]

    threads = await db.cro_messages.aggregate(pipeline).to_list(100)
    return {"threads": threads}


@cro_router.get("/attorney/messages/{case_id}")
async def get_case_messages_attorney(case_id: str, authorization: Optional[str] = Header(None)):
    from attorney_api import get_current_user as get_atty_user
    user = await get_atty_user(authorization)
    if not user or not user.get("is_attorney"):
        raise HTTPException(status_code=401, detail="Not authenticated as attorney")

    messages = await db.cro_messages.find(
        {"case_id": case_id, "attorney_id": user["id"]}, {"_id": 0}
    ).sort("created_at", 1).to_list(200)

    await db.cro_messages.update_many(
        {"case_id": case_id, "attorney_id": user["id"], "sender_type": "cro", "read": False},
        {"$set": {"read": True}}
    )

    return {"messages": messages}


@cro_router.post("/attorney/messages/{case_id}")
async def send_message_attorney(case_id: str, data: dict, authorization: Optional[str] = Header(None)):
    from attorney_api import get_current_user as get_atty_user
    user = await get_atty_user(authorization)
    if not user or not user.get("is_attorney"):
        raise HTTPException(status_code=401, detail="Not authenticated as attorney")

    case = await db.cro_cases.find_one({"id": case_id, "attorney_id": user["id"]}, {"_id": 0})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found or not assigned to you")

    msg = {
        "id": str(uuid4()),
        "case_id": case_id,
        "case_number": case.get("case_number", ""),
        "cro_id": case["cro_id"],
        "cro_name": case.get("cro_name", ""),
        "attorney_id": user["id"],
        "attorney_name": user.get("full_name", ""),
        "sender_type": "attorney",
        "sender_name": user.get("full_name", ""),
        "content": data.get("content", ""),
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.cro_messages.insert_one(msg)
    msg.pop("_id", None)
    return {"message": msg}


@cro_router.get("/attorney/unread-count")
async def get_attorney_unread_count(authorization: Optional[str] = Header(None)):
    from attorney_api import get_current_user as get_atty_user
    user = await get_atty_user(authorization)
    if not user or not user.get("is_attorney"):
        raise HTTPException(status_code=401, detail="Not authenticated as attorney")
    count = await db.cro_messages.count_documents({"attorney_id": user["id"], "sender_type": "cro", "read": False})
    return {"unread": count}


# ==================== ADMIN ENDPOINTS ====================

@cro_router.get("/admin/list")
async def admin_list_cros(authorization: Optional[str] = Header(None)):
    from attorney_api import get_current_user
    user = await get_current_user(authorization)
    if not user or user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    cros = await db.cro_organizations.find({}, {"_id": 0, "password_hash": 0, "token": 0}).to_list(200)
    return {"organizations": cros}


@cro_router.put("/admin/{cro_id}/status")
async def admin_update_cro_status(cro_id: str, data: dict, authorization: Optional[str] = Header(None)):
    from attorney_api import get_current_user
    user = await get_current_user(authorization)
    if not user or user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")

    new_status = data.get("status")
    if new_status not in CRO_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {CRO_STATUSES}")

    updates = {"status": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}

    if new_status in ("approved", "active") and not (await db.cro_organizations.find_one({"id": cro_id})).get("subscription_active"):
        updates["subscription_active"] = True
        updates["subscription_start"] = datetime.now(timezone.utc).isoformat()
        updates["subscription_next_billing"] = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
        updates["signup_fee_paid"] = True

    await db.cro_organizations.update_one({"id": cro_id}, {"$set": updates})
    return {"message": f"CRO status updated to {new_status}"}


@cro_router.put("/admin/cases/{case_id}/status")
async def admin_update_case_status(case_id: str, data: dict, authorization: Optional[str] = Header(None)):
    from attorney_api import get_current_user
    user = await get_current_user(authorization)
    if not user or user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")

    new_status = data.get("status")
    if new_status not in CASE_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status")

    updates = {"status": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}

    if new_status == "listed":
        case = await db.cro_cases.find_one({"id": case_id})
        if case and case.get("qualifies_bidding"):
            updates["status"] = "bidding"
            updates["bidding_deadline"] = (datetime.now(timezone.utc) + timedelta(days=BIDDING_WINDOW_DAYS)).isoformat()

    await db.cro_cases.update_one({"id": case_id}, {"$set": updates})
    return {"message": f"Case status updated to {updates['status']}"}
