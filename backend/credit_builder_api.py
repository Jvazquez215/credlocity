"""
Credit Builder System API - Revolving credit product with Metro 2 reporting.
"""
import os
import uuid
import random
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Header
from cryptography.fernet import Fernet
from revenue_tracker import log_revenue

credit_builder_router = APIRouter(prefix="/api/credit-builder", tags=["Credit Builder"])

db = None

def set_db(database):
    global db
    db = database

# ============ HELPERS ============

ENCRYPTION_KEY = os.environ.get("ENCRYPTION_KEY", "")
VALID_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"]
VALID_STATUS_CODES = ["11","71","78","80","82","83","84","97"]
VALID_ECOA = ["1","2","3"]
VALID_LIMITS = [750, 1500, 2500, 3500]
PLAN_MAP = {
    "starter": {"credit_limit": 750, "monthly_fee": 9.00, "annual_fee": 68.00},
    "standard": {"credit_limit": 1500, "monthly_fee": 15.00, "annual_fee": 68.00},
    "premium": {"credit_limit": 2500, "monthly_fee": 25.00, "annual_fee": 68.00},
    "elite": {"credit_limit": 3500, "monthly_fee": 35.00, "annual_fee": 68.00},
}


def encrypt_ssn(ssn: str) -> str:
    if not ENCRYPTION_KEY:
        return ""
    f = Fernet(ENCRYPTION_KEY.encode())
    return f.encrypt(ssn.encode()).decode()


def decrypt_ssn(encrypted: str) -> str:
    if not ENCRYPTION_KEY or not encrypted:
        return ""
    f = Fernet(ENCRYPTION_KEY.encode())
    return f.decrypt(encrypted.encode()).decode()


async def get_admin(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        from auth import decode_token
        token = authorization.replace("Bearer ", "")
        payload = decode_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid token")
        # Enrich with user data from DB for role-based access
        email = payload.get("sub", "")
        user = await db.users.find_one({"email": email}, {"_id": 0, "password_hash": 0})
        if user:
            payload["role"] = user.get("role", "viewer")
            payload["is_master"] = user.get("is_master", False)
        return payload
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


def remove_id(doc):
    if doc and "_id" in doc:
        doc.pop("_id")
    return doc


def strip_ssn(doc):
    """Remove ssn_encrypted from API response"""
    if doc:
        doc.pop("ssn_encrypted", None)
    return doc


SENSITIVE_FIELDS = ["date_of_birth", "ssn_last_four", "full_ssn", "ssn_encrypted"]
PRIVILEGED_ROLES = ["super_admin", "credit_builder_manager"]


def mask_sensitive_data(doc, user_role, user_is_master=False):
    """Mask sensitive fields unless user is master admin or credit builder manager."""
    if not doc:
        return doc
    if user_is_master or user_role in PRIVILEGED_ROLES:
        doc.pop("ssn_encrypted", None)
        return doc
    # Mask DOB: show only year
    if doc.get("date_of_birth"):
        dob = doc["date_of_birth"]
        doc["date_of_birth"] = f"****{dob[-4:]}" if len(dob) >= 4 else "****"
    # Mask SSN last 4
    if doc.get("ssn_last_four"):
        doc["ssn_last_four"] = "****"
    # Remove encrypted SSN entirely
    doc.pop("ssn_encrypted", None)
    doc.pop("full_ssn", None)
    return doc


def today_mmddyyyy():
    return datetime.now(timezone.utc).strftime("%m%d%Y")


def generate_account_number():
    date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    rand = ''.join([str(random.randint(0,9)) for _ in range(6)])
    return f"CB-{date_str}-{rand}"


def validate_mmddyyyy(val, field_name):
    if not val:
        return
    if len(val) != 8 or not val.isdigit():
        raise HTTPException(status_code=422, detail=f"{field_name} must be MMDDYYYY format")
    m, d, y = int(val[:2]), int(val[2:4]), int(val[4:])
    if m < 1 or m > 12 or d < 1 or d > 31:
        raise HTTPException(status_code=422, detail=f"{field_name} has invalid month/day")


async def log_audit(user_id, action, resource_type, resource_id, details=""):
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "action": action,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "details": details,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })


# ============ SEED PRODUCTS ============

SEED_PRODUCTS = [
    {"name": "FCRA Consumer Rights Guide", "price": 19.99, "category": "credit_education", "description": "Complete guide to your rights under the Fair Credit Reporting Act"},
    {"name": "Credit Score Mastery Course", "price": 29.99, "category": "credit_education", "description": "Learn how credit scores work and how to improve yours"},
    {"name": "DIY Dispute Letter Templates", "price": 24.99, "category": "credit_education", "description": "Professional dispute letter templates you can customize"},
    {"name": "Understanding Your Credit Report", "price": 14.99, "category": "credit_education", "description": "A beginner's guide to reading and understanding credit reports"},
    {"name": "Debt Validation Strategy Guide", "price": 19.99, "category": "legal_guides", "description": "Learn how to validate debts and protect your rights"},
    {"name": "Building Credit from Zero Playbook", "price": 24.99, "category": "credit_education", "description": "Step-by-step guide to building credit from scratch"},
    {"name": "Homebuyer Credit Prep Course", "price": 34.99, "category": "credit_education", "description": "Prepare your credit for a home purchase"},
    {"name": "The Credlocity Credit Mastery Bundle", "price": 49.99, "category": "bundles", "description": "Our complete collection of credit education resources"},
]

async def seed_credit_builder_products():
    count = await db.credit_builder_products.count_documents({})
    if count == 0:
        for i, p in enumerate(SEED_PRODUCTS):
            product = {
                "id": str(uuid.uuid4()),
                "name": p["name"],
                "description": p["description"],
                "price": p["price"],
                "category": p["category"],
                "file_url": None,
                "thumbnail_url": None,
                "is_active": True,
                "sort_order": i,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            await db.credit_builder_products.insert_one(product)
        print("[SEED] Credit Builder: 8 products seeded")


# ============ ACCOUNTS ============

@credit_builder_router.post("/accounts")
async def create_account(data: dict, authorization: str = Header(None)):
    admin = await get_admin(authorization)
    
    # Validate required fields
    for field in ["first_name", "last_name", "date_of_birth", "ssn_last_four", "email", "address_line1", "city", "state", "zip_code", "plan_tier"]:
        if not data.get(field):
            raise HTTPException(status_code=422, detail=f"{field} is required")
    
    # Validate ssn_last_four
    ssn4 = data.get("ssn_last_four", "")
    if len(ssn4) != 4 or not ssn4.isdigit():
        raise HTTPException(status_code=422, detail="ssn_last_four must be exactly 4 numeric digits")
    
    # Validate state
    if data.get("state") not in VALID_STATES:
        raise HTTPException(status_code=422, detail=f"state must be a valid 2-letter US state abbreviation")
    
    # Validate date_of_birth
    validate_mmddyyyy(data.get("date_of_birth"), "date_of_birth")
    
    # Validate plan_tier
    plan = data.get("plan_tier")
    if plan not in PLAN_MAP:
        raise HTTPException(status_code=422, detail=f"plan_tier must be one of: starter, standard, premium, elite")
    
    plan_info = PLAN_MAP[plan]
    
    # Validate ecoa_code if provided
    ecoa = data.get("ecoa_code", "1")
    if ecoa not in VALID_ECOA:
        raise HTTPException(status_code=422, detail=f"ecoa_code must be one of: {', '.join(VALID_ECOA)}")
    
    # Encrypt SSN if full one is provided
    ssn_encrypted = None
    if data.get("full_ssn"):
        ssn_encrypted = encrypt_ssn(data["full_ssn"])
    
    account = {
        "id": str(uuid.uuid4()),
        "first_name": data["first_name"],
        "last_name": data["last_name"],
        "middle_name": data.get("middle_name"),
        "generation_code": data.get("generation_code"),
        "date_of_birth": data["date_of_birth"],
        "ssn_last_four": ssn4,
        "ssn_encrypted": ssn_encrypted,
        "email": data["email"],
        "phone": data.get("phone"),
        "address_line1": data["address_line1"],
        "address_line2": data.get("address_line2"),
        "city": data["city"],
        "state": data["state"],
        "zip_code": data["zip_code"],
        "previous_address_line1": data.get("previous_address_line1"),
        "previous_city": data.get("previous_city"),
        "previous_state": data.get("previous_state"),
        "previous_zip": data.get("previous_zip"),
        "account_number": generate_account_number(),
        "subscriber_code": data.get("subscriber_code"),
        "portfolio_type": "R",
        "account_type_code": "18",
        "plan_tier": plan,
        "credit_limit": plan_info["credit_limit"],
        "monthly_fee": plan_info["monthly_fee"],
        "highest_credit": 0,
        "current_balance": 0,
        "amount_past_due": 0,
        "scheduled_monthly_payment": plan_info["monthly_fee"],
        "actual_amount_paid": 0.0,
        "account_status_code": "11",
        "payment_rating": None,
        "ecoa_code": ecoa,
        "payment_history_profile": "",
        "date_opened": today_mmddyyyy(),
        "date_of_account_information": today_mmddyyyy(),
        "date_of_last_payment": None,
        "date_closed": None,
        "date_of_first_delinquency": None,
        "special_comment_code": None,
        "compliance_condition_code": None,
        "dispute_flag": False,
        "dispute_notes": None,
        "consumer_information_indicator": None,
        "reporting_active": data.get("reporting_active", True),
        "last_reported_date": None,
        "next_reporting_date": None,
        "annual_fee": plan_info["annual_fee"],
        "annual_fee_paid": False,
        "agreement_signed": False,
        "agreement_signed_at": None,
        "agreement_ip": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "created_by": admin.get("sub", "admin")
    }
    
    await db.credit_builder_accounts.insert_one(account)
    await log_audit(admin.get("sub"), "create", "credit_builder_account", account["id"], f"Created account {account['account_number']}")
    
    return strip_ssn(remove_id(account))


@credit_builder_router.post("/signup")
async def public_signup(data: dict):
    """Public endpoint: Consumer self-signup for a Credit Builder account."""
    for field in ["first_name", "last_name", "email", "phone", "date_of_birth", "ssn_last_four", "full_ssn",
                  "address_line1", "city", "state", "zip_code", "plan_tier", "password"]:
        if not data.get(field):
            raise HTTPException(status_code=422, detail=f"{field} is required")

    ssn4 = data.get("ssn_last_four", "")
    if len(ssn4) != 4 or not ssn4.isdigit():
        raise HTTPException(status_code=422, detail="SSN last 4 must be exactly 4 digits")

    full_ssn = data.get("full_ssn", "").replace("-", "").replace(" ", "")
    if len(full_ssn) != 9 or not full_ssn.isdigit():
        raise HTTPException(status_code=422, detail="Full SSN must be exactly 9 digits")

    if data.get("state") not in VALID_STATES:
        raise HTTPException(status_code=422, detail="Invalid state abbreviation")

    validate_mmddyyyy(data.get("date_of_birth"), "date_of_birth")

    plan = data.get("plan_tier")
    if plan not in PLAN_MAP:
        raise HTTPException(status_code=422, detail="Invalid plan tier")

    # Check if email already exists
    existing = await db.credit_builder_accounts.find_one({"email": data["email"]})
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    plan_info = PLAN_MAP[plan]
    ssn_encrypted = encrypt_ssn(full_ssn)

    # Hash password for client login
    import bcrypt
    password_hash = bcrypt.hashpw(data["password"].encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    account = {
        "id": str(uuid.uuid4()),
        "first_name": data["first_name"],
        "last_name": data["last_name"],
        "middle_name": data.get("middle_name"),
        "date_of_birth": data["date_of_birth"],
        "ssn_last_four": ssn4,
        "ssn_encrypted": ssn_encrypted,
        "email": data["email"],
        "phone": data.get("phone"),
        "address_line1": data["address_line1"],
        "address_line2": data.get("address_line2"),
        "city": data["city"],
        "state": data["state"],
        "zip_code": data["zip_code"],
        "account_number": generate_account_number(),
        "portfolio_type": "R",
        "account_type_code": "18",
        "plan_tier": plan,
        "credit_limit": plan_info["credit_limit"],
        "monthly_fee": plan_info["monthly_fee"],
        "highest_credit": 0,
        "current_balance": 0,
        "amount_past_due": 0,
        "scheduled_monthly_payment": plan_info["monthly_fee"],
        "actual_amount_paid": 0.0,
        "account_status_code": "11",
        "payment_rating": None,
        "ecoa_code": "1",
        "payment_history_profile": "",
        "date_opened": today_mmddyyyy(),
        "date_of_account_information": today_mmddyyyy(),
        "date_of_last_payment": None,
        "date_closed": None,
        "date_of_first_delinquency": None,
        "special_comment_code": None,
        "reporting_active": True,
        "last_reported_date": None,
        "next_reporting_date": None,
        "annual_fee": plan_info["annual_fee"],
        "annual_fee_paid": False,
        "agreement_signed": False,
        "agreement_signed_at": None,
        "password_hash": password_hash,
        "signup_source": "online",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "created_by": "self-signup"
    }

    await db.credit_builder_accounts.insert_one(account)
    await log_audit("self-signup", "create", "credit_builder_account", account["id"], f"Self-signup: {account['account_number']}")

    # Send welcome email
    try:
        from email_notifications import send_email
        welcome_html = f"""
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0;">
            <div style="background: linear-gradient(135deg, #1e40af 0%, #0891b2 100%); padding: 40px 32px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; color: white; letter-spacing: -0.5px;">Welcome to Credlocity</h1>
                <p style="margin: 8px 0 0; color: #bfdbfe; font-size: 14px;">Credit Builder Account</p>
            </div>
            <div style="padding: 32px;">
                <p style="color: #e2e8f0; font-size: 16px; margin-bottom: 24px;">
                    Hi {data['first_name']},
                </p>
                <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
                    Your Credit Builder account has been created successfully! You're on your way to building a stronger credit history.
                </p>
                <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; margin: 24px 0;">
                    <h3 style="margin: 0 0 16px; color: #22d3ee; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Account Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Account Number</td>
                            <td style="padding: 8px 0; color: white; font-weight: 600; text-align: right; font-family: monospace;">{account['account_number']}</td></tr>
                        <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Plan</td>
                            <td style="padding: 8px 0; color: white; font-weight: 600; text-align: right;">{plan.capitalize()}</td></tr>
                        <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Credit Limit</td>
                            <td style="padding: 8px 0; color: #22d3ee; font-weight: 700; text-align: right; font-size: 18px;">${plan_info['credit_limit']:,.2f}</td></tr>
                        <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Monthly Fee</td>
                            <td style="padding: 8px 0; color: white; font-weight: 600; text-align: right;">${plan_info['monthly_fee']:.2f}/mo</td></tr>
                        <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Username (Email)</td>
                            <td style="padding: 8px 0; color: white; font-weight: 600; text-align: right;">{data['email']}</td></tr>
                    </table>
                </div>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="https://credlocity.com/credit-builder-store" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #0891b2); color: white; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 14px;">
                        Access Your Account
                    </a>
                </div>
                <div style="background: #1e293b; border-left: 4px solid #22d3ee; padding: 16px; border-radius: 0 8px 8px 0; margin: 24px 0;">
                    <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.5;">
                        <strong style="color: #e2e8f0;">Important:</strong> You will need to sign your Credit Builder Agreement before your account is fully activated. Log in to your account to complete this step.
                    </p>
                </div>
                <p style="color: #64748b; font-size: 12px; margin-top: 32px; text-align: center;">
                    Credlocity Business Group LLC | 1500 Chestnut Street, Suite 2, Philadelphia, PA 19102<br>
                    Questions? Contact us at support@credlocity.com
                </p>
            </div>
        </div>
        """
        send_email(data["email"], f"Welcome to Credlocity Credit Builder - Account {account['account_number']}", welcome_html)
    except Exception as e:
        print(f"[WARNING] Welcome email failed: {e}")

    return {
        "id": account["id"],
        "account_number": account["account_number"],
        "email": data["email"],
        "plan_tier": plan,
        "credit_limit": plan_info["credit_limit"],
        "message": "Account created successfully! Please check your email for login details."
    }


@credit_builder_router.post("/accounts/{account_id}/send-to-collections")
async def send_to_collections(account_id: str, data: dict, authorization: str = Header(None)):
    """Send a credit builder account to the collections system."""
    admin = await get_admin(authorization)
    user_role = admin.get("role", "viewer")
    user_is_master = admin.get("is_master", False)

    if not user_is_master and user_role not in ["super_admin", "admin", "credit_builder_manager"]:
        raise HTTPException(status_code=403, detail="Only administrators and credit builder managers can send accounts to collections")

    account = await db.credit_builder_accounts.find_one({"id": account_id}, {"_id": 0})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    # Create a collections account from the credit builder account
    from collections_api import calculate_days_past_due, get_tier_from_days

    days_past_due = 0
    if account.get("date_of_first_delinquency"):
        days_past_due = calculate_days_past_due(account["date_of_first_delinquency"])

    collections_account = {
        "id": str(uuid.uuid4()),
        "debtor_first_name": account.get("first_name", ""),
        "debtor_last_name": account.get("last_name", ""),
        "debtor_email": account.get("email"),
        "debtor_phone": account.get("phone"),
        "debtor_address_street": account.get("address_line1", ""),
        "debtor_address_city": account.get("city", ""),
        "debtor_address_state": account.get("state", ""),
        "debtor_address_zip": account.get("zip_code", ""),
        "account_number": account.get("account_number"),
        "original_creditor": "Credlocity Credit Builder",
        "original_account_number": account.get("account_number"),
        "past_due_balance": account.get("amount_past_due", 0),
        "original_balance": account.get("current_balance", 0),
        "total_payments_received": account.get("actual_amount_paid", 0),
        "first_failed_payment_date": account.get("date_of_first_delinquency", ""),
        "days_past_due": days_past_due,
        "account_status": "active",
        "current_tier": get_tier_from_days(days_past_due) if days_past_due > 0 else "friendly_reminder",
        "assigned_rep_id": data.get("assigned_rep_id"),
        "assigned_rep_name": data.get("assigned_rep_name", "Unassigned"),
        "notes": data.get("notes", f"Transferred from Credit Builder account {account.get('account_number')}"),
        "source": "credit_builder",
        "source_account_id": account_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    await db.collections_accounts.insert_one(collections_account)

    # Update the credit builder account status
    await db.credit_builder_accounts.update_one(
        {"id": account_id},
        {"$set": {
            "account_status_code": "97",
            "special_comment_code": "BH",
            "sent_to_collections": True,
            "sent_to_collections_at": datetime.now(timezone.utc).isoformat(),
            "collections_account_id": collections_account["id"],
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )

    await log_audit(admin.get("sub"), "send_to_collections", "credit_builder_account", account_id,
                    f"Sent to collections: {collections_account['id']}")

    return {
        "message": "Account sent to collections successfully",
        "collections_account_id": collections_account["id"],
        "credit_builder_account_id": account_id
    }


REPORTING_ERROR_FIELDS = [
    "date_opened", "date_closed", "date_of_last_payment", "date_of_first_delinquency",
    "payment_history_profile", "account_status_code", "current_balance", "amount_past_due",
    "highest_credit", "credit_limit", "payment_rating", "special_comment_code"
]


@credit_builder_router.post("/accounts/{account_id}/fix-reporting")
async def fix_reporting_error(account_id: str, data: dict, authorization: str = Header(None)):
    """Fix reporting errors on a credit builder account. Restricted to privileged roles."""
    admin = await get_admin(authorization)
    user_role = admin.get("role", "viewer")
    user_is_master = admin.get("is_master", False)
    is_partner = admin.get("is_partner", False)

    # Check user from DB for partner status
    user_doc = await db.users.find_one({"email": admin.get("sub")}, {"_id": 0})
    if user_doc:
        is_partner = user_doc.get("is_partner", False)

    if not user_is_master and user_role not in ["super_admin", "credit_builder_manager"] and not is_partner:
        raise HTTPException(status_code=403, detail="Only master admin, collection managers, and partners can fix reporting errors")

    account = await db.credit_builder_accounts.find_one({"id": account_id}, {"_id": 0})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    corrections = data.get("corrections", {})
    if not corrections:
        raise HTTPException(status_code=422, detail="No corrections provided")

    reason = data.get("reason", "")
    if not reason:
        raise HTTPException(status_code=422, detail="Reason for correction is required")

    # Validate and apply only allowed fields
    update = {}
    old_values = {}
    for field, new_value in corrections.items():
        if field in REPORTING_ERROR_FIELDS:
            old_values[field] = account.get(field)
            update[field] = new_value

    if not update:
        raise HTTPException(status_code=422, detail="No valid reporting fields to correct")

    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.credit_builder_accounts.update_one({"id": account_id}, {"$set": update})

    # Log the correction
    correction_log = {
        "id": str(uuid.uuid4()),
        "account_id": account_id,
        "account_number": account.get("account_number"),
        "corrected_by": admin.get("sub"),
        "corrected_by_role": user_role,
        "reason": reason,
        "old_values": old_values,
        "new_values": {k: v for k, v in corrections.items() if k in REPORTING_ERROR_FIELDS},
        "corrected_at": datetime.now(timezone.utc).isoformat()
    }
    await db.credit_builder_reporting_corrections.insert_one(correction_log)

    await log_audit(admin.get("sub"), "fix_reporting", "credit_builder_account", account_id,
                    f"Reporting correction: {list(update.keys())}")

    return {
        "message": "Reporting error corrected successfully",
        "corrected_fields": list(update.keys()),
        "correction_id": correction_log["id"]
    }


@credit_builder_router.get("/accounts")
async def list_accounts(
    page: int = 1, limit: int = 25,
    status: Optional[str] = None,
    plan_tier: Optional[str] = None,
    search: Optional[str] = None,
    authorization: str = Header(None)
):
    admin = await get_admin(authorization)
    user_role = admin.get("role", "viewer")
    user_is_master = admin.get("is_master", False)
    query = {}
    if status:
        query["account_status_code"] = status
    if plan_tier:
        query["plan_tier"] = plan_tier
    
    skip = (page - 1) * limit
    total = await db.credit_builder_accounts.count_documents(query)
    accounts = await db.credit_builder_accounts.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    if search:
        s = search.lower()
        accounts = [a for a in accounts if s in f"{a.get('first_name','')} {a.get('last_name','')}".lower() or s in a.get("account_number","").lower()]
    
    accounts = [mask_sensitive_data(a, user_role, user_is_master) for a in accounts]
    return {"accounts": accounts, "total": total, "page": page, "limit": limit}


@credit_builder_router.get("/accounts/{account_id}")
async def get_account(account_id: str, authorization: str = Header(None)):
    admin = await get_admin(authorization)
    user_role = admin.get("role", "viewer")
    user_is_master = admin.get("is_master", False)
    account = await db.credit_builder_accounts.find_one({"id": account_id}, {"_id": 0})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return mask_sensitive_data(account, user_role, user_is_master)


@credit_builder_router.put("/accounts/{account_id}")
async def update_account(account_id: str, data: dict, authorization: str = Header(None)):
    admin = await get_admin(authorization)
    
    if "account_number" in data:
        raise HTTPException(status_code=400, detail="account_number is immutable")
    
    # Validate fields if provided
    if "ssn_last_four" in data:
        if len(data["ssn_last_four"]) != 4 or not data["ssn_last_four"].isdigit():
            raise HTTPException(status_code=422, detail="ssn_last_four must be exactly 4 numeric digits")
    if "state" in data and data["state"] not in VALID_STATES:
        raise HTTPException(status_code=422, detail="Invalid state")
    if "account_status_code" in data and data["account_status_code"] not in VALID_STATUS_CODES:
        raise HTTPException(status_code=422, detail=f"account_status_code must be one of: {', '.join(VALID_STATUS_CODES)}")
    if "ecoa_code" in data and data["ecoa_code"] not in VALID_ECOA:
        raise HTTPException(status_code=422, detail=f"ecoa_code must be one of: {', '.join(VALID_ECOA)}")
    
    update_fields = {k: v for k, v in data.items() if k not in ["id", "account_number", "created_at", "created_by", "ssn_encrypted"]}
    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.credit_builder_accounts.update_one({"id": account_id}, {"$set": update_fields})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Account not found")
    
    await log_audit(admin.get("sub"), "update", "credit_builder_account", account_id, str(list(update_fields.keys())))
    
    account = await db.credit_builder_accounts.find_one({"id": account_id}, {"_id": 0, "ssn_encrypted": 0})
    return account


@credit_builder_router.post("/accounts/{account_id}/payment")
async def record_payment(account_id: str, data: dict, authorization: str = Header(None)):
    admin = await get_admin(authorization)
    amount = float(data.get("amount", 0))
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    
    account = await db.credit_builder_accounts.find_one({"id": account_id}, {"_id": 0})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    new_balance = max(0, account.get("current_balance", 0) - amount)
    new_past_due = 0 if new_balance <= 0 else account.get("amount_past_due", 0)
    
    # Create transaction
    txn = {
        "id": str(uuid.uuid4()),
        "account_id": account_id,
        "transaction_type": "payment",
        "amount": -amount,
        "description": data.get("notes", "Payment received"),
        "running_balance": new_balance,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": admin.get("sub", "admin")
    }
    await db.credit_builder_transactions.insert_one(txn)
    
    await db.credit_builder_accounts.update_one({"id": account_id}, {"$set": {
        "current_balance": new_balance,
        "amount_past_due": new_past_due,
        "date_of_last_payment": today_mmddyyyy(),
        "date_of_account_information": today_mmddyyyy(),
        "actual_amount_paid": account.get("actual_amount_paid", 0) + amount,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }})
    
    await log_audit(admin.get("sub"), "payment", "credit_builder_account", account_id, f"${amount:.2f}")

    # ── Log to central revenue_records for Finance Dashboard ──
    await log_revenue(
        db,
        source="credit_repair",
        category="credit_builder_payment",
        amount=amount,
        description=f"Credit Builder Payment - Account {account_id[:8]}",
        reference_id=account_id,
        reference_type="credit_builder_account",
        payment_status="paid",
        payment_method="manual",
        recorded_by_id=admin.get("sub", "admin"),
        recorded_by_name="Admin",
    )

    updated = await db.credit_builder_accounts.find_one({"id": account_id}, {"_id": 0, "ssn_encrypted": 0})
    return updated


@credit_builder_router.post("/accounts/{account_id}/purchase")
async def record_purchase(account_id: str, data: dict, authorization: str = Header(None)):
    admin = await get_admin(authorization)
    product_id = data.get("product_id")
    if not product_id:
        raise HTTPException(status_code=400, detail="product_id required")
    
    product = await db.credit_builder_products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    account = await db.credit_builder_accounts.find_one({"id": account_id}, {"_id": 0})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    new_balance = account.get("current_balance", 0) + product["price"]
    if new_balance > account.get("credit_limit", 0):
        raise HTTPException(status_code=400, detail="Insufficient credit available")
    
    highest = max(account.get("highest_credit", 0), new_balance)
    
    # Create transaction
    txn = {
        "id": str(uuid.uuid4()),
        "account_id": account_id,
        "transaction_type": "purchase",
        "amount": product["price"],
        "description": f"Purchase: {product['name']}",
        "product_id": product_id,
        "running_balance": new_balance,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": admin.get("sub", "admin")
    }
    await db.credit_builder_transactions.insert_one(txn)
    
    # Create purchase record
    purchase = {
        "id": str(uuid.uuid4()),
        "account_id": account_id,
        "product_id": product_id,
        "product_name": product["name"],
        "product_price": product["price"],
        "balance_before": account.get("current_balance", 0),
        "balance_after": new_balance,
        "status": "completed",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.credit_builder_purchases.insert_one(purchase)
    
    await db.credit_builder_accounts.update_one({"id": account_id}, {"$set": {
        "current_balance": new_balance,
        "highest_credit": highest,
        "date_of_account_information": today_mmddyyyy(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }})
    
    await log_audit(admin.get("sub"), "purchase", "credit_builder_account", account_id, f"Product: {product['name']} ${product['price']:.2f}")
    
    updated = await db.credit_builder_accounts.find_one({"id": account_id}, {"_id": 0, "ssn_encrypted": 0})
    return {"account": updated, "purchase": remove_id(purchase)}


@credit_builder_router.post("/accounts/{account_id}/update-status")
async def update_account_status(account_id: str, data: dict, authorization: str = Header(None)):
    admin = await get_admin(authorization)
    status_code = data.get("status_code", "")
    if status_code not in VALID_STATUS_CODES:
        raise HTTPException(status_code=422, detail=f"status_code must be one of: {', '.join(VALID_STATUS_CODES)}")
    
    await db.credit_builder_accounts.update_one({"id": account_id}, {"$set": {
        "account_status_code": status_code,
        "date_of_account_information": today_mmddyyyy(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }})
    
    await log_audit(admin.get("sub"), "status_change", "credit_builder_account", account_id, f"Status: {status_code}")
    return {"message": f"Status updated to {status_code}"}


# ============ TRANSACTION HISTORY ============

@credit_builder_router.get("/accounts/{account_id}/history")
async def get_account_history(account_id: str, authorization: str = Header(None)):
    await get_admin(authorization)
    txns = await db.credit_builder_transactions.find(
        {"account_id": account_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(200)
    return txns


@credit_builder_router.post("/accounts/{account_id}/payment-history/update")
async def update_payment_history(account_id: str, data: dict, authorization: str = Header(None)):
    admin = await get_admin(authorization)
    status_char = data.get("status_char", "")
    if len(status_char) != 1:
        raise HTTPException(status_code=400, detail="status_char must be a single character")
    
    account = await db.credit_builder_accounts.find_one({"id": account_id}, {"_id": 0})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    profile = status_char + account.get("payment_history_profile", "")
    profile = profile[:24]  # Trim to 24
    
    await db.credit_builder_accounts.update_one({"id": account_id}, {"$set": {
        "payment_history_profile": profile,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }})
    
    await log_audit(admin.get("sub"), "payment_history_update", "credit_builder_account", account_id, f"Char: {status_char}")
    return {"payment_history_profile": profile}


# ============ PRODUCTS ============

@credit_builder_router.get("/products")
async def list_products_public():
    """Public endpoint - no auth"""
    products = await db.credit_builder_products.find(
        {"is_active": True}, {"_id": 0}
    ).sort("sort_order", 1).to_list(100)
    return products


@credit_builder_router.get("/products/admin")
async def list_products_admin(authorization: str = Header(None)):
    await get_admin(authorization)
    products = await db.credit_builder_products.find({}, {"_id": 0}).sort("sort_order", 1).to_list(100)
    return products


@credit_builder_router.post("/products")
async def create_product(data: dict, authorization: str = Header(None)):
    admin = await get_admin(authorization)
    price = float(data.get("price", 0))
    if price < 10.0 or price > 50.0:
        raise HTTPException(status_code=422, detail="Product price must be between $10.00 and $50.00")
    
    product = {
        "id": str(uuid.uuid4()),
        "name": data.get("name", ""),
        "description": data.get("description", ""),
        "price": price,
        "category": data.get("category", "credit_education"),
        "file_url": data.get("file_url"),
        "thumbnail_url": data.get("thumbnail_url"),
        "is_active": data.get("is_active", True),
        "sort_order": data.get("sort_order", 0),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.credit_builder_products.insert_one(product)
    await log_audit(admin.get("sub"), "create", "credit_builder_product", product["id"], product["name"])
    return remove_id(product)


@credit_builder_router.put("/products/{product_id}")
async def update_product(product_id: str, data: dict, authorization: str = Header(None)):
    admin = await get_admin(authorization)
    if "price" in data:
        price = float(data["price"])
        if price < 10.0 or price > 50.0:
            raise HTTPException(status_code=422, detail="Product price must be between $10.00 and $50.00")
    
    update_fields = {k: v for k, v in data.items() if k not in ["id", "created_at"]}
    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.credit_builder_accounts.update_one({"id": product_id}, {"$set": update_fields})
    # Fix: should update products collection
    await db.credit_builder_products.update_one({"id": product_id}, {"$set": update_fields})
    
    return await db.credit_builder_products.find_one({"id": product_id}, {"_id": 0})


@credit_builder_router.delete("/products/{product_id}")
async def delete_product(product_id: str, authorization: str = Header(None)):
    admin = await get_admin(authorization)
    await db.credit_builder_products.update_one({"id": product_id}, {"$set": {"is_active": False}})
    await log_audit(admin.get("sub"), "deactivate", "credit_builder_product", product_id, "")
    return {"message": "Product deactivated"}


# ============ DISPUTES ============

@credit_builder_router.post("/disputes")
async def create_dispute(data: dict, authorization: str = Header(None)):
    admin = await get_admin(authorization)
    opened = data.get("opened_date", today_mmddyyyy())
    
    # Calculate deadline (30 days from opened)
    try:
        opened_dt = datetime.strptime(opened, "%m%d%Y")
        deadline_dt = opened_dt + timedelta(days=30)
        deadline = deadline_dt.strftime("%m%d%Y")
    except Exception:
        deadline = ""
    
    dispute = {
        "id": str(uuid.uuid4()),
        "account_id": data.get("account_id", ""),
        "dispute_source": data.get("dispute_source", ""),
        "dispute_reason": data.get("dispute_reason", ""),
        "acdv_reference": data.get("acdv_reference"),
        "status": "open",
        "resolution": None,
        "opened_date": opened,
        "deadline_date": deadline,
        "resolved_date": None,
        "assigned_to": data.get("assigned_to"),
        "notes": data.get("notes"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.credit_builder_dispute_logs.insert_one(dispute)
    await log_audit(admin.get("sub"), "create", "credit_builder_dispute", dispute["id"], f"Account: {data.get('account_id')}")
    return remove_id(dispute)


@credit_builder_router.get("/disputes")
async def list_disputes(
    status: Optional[str] = None,
    account_id: Optional[str] = None,
    bureau: Optional[str] = None,
    authorization: str = Header(None)
):
    await get_admin(authorization)
    query = {}
    if status:
        query["status"] = status
    if account_id:
        query["account_id"] = account_id
    if bureau:
        query["dispute_source"] = bureau
    
    disputes = await db.credit_builder_dispute_logs.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    return disputes


@credit_builder_router.put("/disputes/{dispute_id}")
async def update_dispute(dispute_id: str, data: dict, authorization: str = Header(None)):
    admin = await get_admin(authorization)
    update_fields = {k: v for k, v in data.items() if k not in ["id", "created_at"]}
    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.credit_builder_dispute_logs.update_one({"id": dispute_id}, {"$set": update_fields})
    await log_audit(admin.get("sub"), "update", "credit_builder_dispute", dispute_id, str(list(update_fields.keys())))
    
    return await db.credit_builder_dispute_logs.find_one({"id": dispute_id}, {"_id": 0})


# ============ REPORTING CYCLES ============

@credit_builder_router.post("/reporting/cycles")
async def create_reporting_cycle(data: dict, authorization: str = Header(None)):
    admin = await get_admin(authorization)
    
    total = await db.credit_builder_accounts.count_documents({"reporting_active": True})
    current = await db.credit_builder_accounts.count_documents({"reporting_active": True, "account_status_code": "11"})
    delinquent = total - current
    closed = await db.credit_builder_accounts.count_documents({"reporting_active": False})
    
    cycle = {
        "id": str(uuid.uuid4()),
        "cycle_date": today_mmddyyyy(),
        "total_accounts": total,
        "accounts_current": current,
        "accounts_delinquent": delinquent,
        "accounts_closed": closed,
        "file_generated": False,
        "file_path": None,
        "equifax_submitted": False,
        "experian_submitted": False,
        "transunion_submitted": False,
        "submission_notes": data.get("notes"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": admin.get("sub", "admin")
    }
    await db.metro2_reporting_cycles.insert_one(cycle)
    await log_audit(admin.get("sub"), "create", "reporting_cycle", cycle["id"], f"Total: {total}")
    return remove_id(cycle)


@credit_builder_router.get("/reporting/cycles")
async def list_reporting_cycles(authorization: str = Header(None)):
    await get_admin(authorization)
    cycles = await db.metro2_reporting_cycles.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return cycles


@credit_builder_router.put("/reporting/cycles/{cycle_id}")
async def update_reporting_cycle(cycle_id: str, data: dict, authorization: str = Header(None)):
    admin = await get_admin(authorization)
    update_fields = {k: v for k, v in data.items() if k not in ["id", "created_at"]}
    
    await db.metro2_reporting_cycles.update_one({"id": cycle_id}, {"$set": update_fields})
    return await db.metro2_reporting_cycles.find_one({"id": cycle_id}, {"_id": 0})


# ============ DASHBOARD ============

@credit_builder_router.get("/dashboard")
async def get_dashboard(authorization: str = Header(None)):
    await get_admin(authorization)
    
    total = await db.credit_builder_accounts.count_documents({})
    active = await db.credit_builder_accounts.count_documents({"account_status_code": "11"})
    
    # Total current balance
    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$current_balance"}}}]
    balance_result = await db.credit_builder_accounts.aggregate(pipeline).to_list(1)
    total_balance = balance_result[0]["total"] if balance_result else 0
    
    # Accounts by tier
    tier_pipeline = [{"$group": {"_id": "$plan_tier", "count": {"$sum": 1}}}]
    tiers = await db.credit_builder_accounts.aggregate(tier_pipeline).to_list(10)
    accounts_by_tier = {t["_id"]: t["count"] for t in tiers if t["_id"]}
    
    # Accounts by status
    status_pipeline = [{"$group": {"_id": "$account_status_code", "count": {"$sum": 1}}}]
    statuses = await db.credit_builder_accounts.aggregate(status_pipeline).to_list(20)
    accounts_by_status = {s["_id"]: s["count"] for s in statuses if s["_id"]}
    
    # Open disputes
    open_disputes = await db.credit_builder_dispute_logs.count_documents({"status": "open"})
    
    # Last reporting cycle
    last_cycle = await db.metro2_reporting_cycles.find({}, {"_id": 0}).sort("created_at", -1).limit(1).to_list(1)
    last_cycle_date = last_cycle[0].get("cycle_date") if last_cycle else None
    
    return {
        "total_accounts": total,
        "active_accounts": active,
        "total_current_balance": total_balance,
        "accounts_by_tier": accounts_by_tier,
        "accounts_by_status": accounts_by_status,
        "open_disputes_count": open_disputes,
        "last_reporting_cycle_date": last_cycle_date
    }


# ============ AUDIT LOGS ============

@credit_builder_router.get("/audit-logs")
async def get_audit_logs(
    resource_type: Optional[str] = None,
    page: int = 1, limit: int = 50,
    authorization: str = Header(None)
):
    await get_admin(authorization)
    query = {}
    if resource_type:
        query["resource_type"] = resource_type
    
    skip = (page - 1) * limit
    logs = await db.audit_logs.find(query, {"_id": 0}).sort("timestamp", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.audit_logs.count_documents(query)
    return {"logs": logs, "total": total}


# ============ CREDIT BUILDER AGREEMENT ============

CREDIT_BUILDER_AGREEMENT_TEXT = """
CREDLOCITY CREDIT BUILDER ACCOUNT AGREEMENT

This Credit Builder Account Agreement ("Agreement") is entered into between Credlocity ("Company," "we," "us," or "our") and the undersigned consumer ("You," "your," or "Account Holder"), collectively referred to as the "Parties."

EFFECTIVE DATE: The date you electronically sign this Agreement.

1. ACCOUNT OVERVIEW AND PURPOSE

You are opening a Credlocity Credit Builder Account ("Account"), a revolving credit line designed to help you build or improve your credit history. Your account activity, including on-time payments, will be reported monthly to Equifax, Experian, and TransUnion using the Metro 2 data format.

This Account is NOT a credit card. It is a credit-building program in which your credit line may be used to purchase financial education resources from the Credlocity Digital Store.

2. CREDIT LINE AND PLAN TIER

Plan Tier: {plan_tier}
Credit Limit: ${credit_limit}
Monthly Fee: ${monthly_fee}/month
Annual Membership Fee: $68.00 (due at enrollment, non-refundable after 3 business days)

Your credit limit is determined by the plan you select. You may request a plan upgrade at any time; downgrades require your balance to be within the new plan's credit limit.

3. ANNUAL MEMBERSHIP FEE

A one-time annual membership fee of $68.00 is charged at enrollment. This fee covers account setup, credit bureau reporting infrastructure, and account maintenance for twelve (12) months. The annual membership fee is NON-REFUNDABLE except within three (3) business days of enrollment pursuant to your cancellation rights described in Section 10 below. The annual membership fee will automatically renew each year on your enrollment anniversary date.

4. MONTHLY PAYMENTS AND REPORTING

You agree to make monthly payments of at least the minimum monthly fee for your selected plan by the due date each month. Your payment history will be reported to all three major credit bureaus (Equifax, Experian, and TransUnion) on or around the same date each month.

ON-TIME PAYMENTS will be reported as current (paid as agreed) and will positively impact your credit score over time. LATE PAYMENTS (more than 30 days past due) will be reported as delinquent and may negatively impact your credit score.

5. FEES AND CHARGES

- Annual Membership Fee: $68.00 (due at enrollment)
- Monthly Account Fee: As specified by your plan tier
- Late Payment Fee: $15.00 (assessed on payments received more than 10 days after the due date)
- Returned Payment Fee: $25.00 (for any payment returned for insufficient funds)
- Account Reinstatement Fee: $35.00 (if account is suspended for non-payment and later reinstated)

There are NO interest charges, NO annual percentage rate (APR), and NO penalty interest rates on this Account. This is not a loan or line of credit subject to Truth in Lending Act (TILA) Regulation Z disclosure requirements for open-end credit plans, as no finance charges are assessed.

6. USE OF YOUR CREDIT LINE

Your credit line may be used exclusively to purchase financial education products and resources available through the Credlocity Digital Store. Purchases are applied to your Account balance. Your available credit is calculated as your credit limit minus your current balance.

7. CREDIT REPORTING

We report your Account information to Equifax, Experian, and TransUnion monthly using the Metro 2 data reporting format. Reported information includes:
- Account number and account type
- Date opened and current status
- Credit limit and current balance
- Payment history (on-time, 30-day late, 60-day late, 90+ day late)
- Payment amount

You understand that credit reporting is not guaranteed to result in a specific credit score change. Credit scores are calculated by the credit bureaus using proprietary algorithms, and your score is influenced by all items on your credit report, not just this Account.

8. ELECTRONIC COMMUNICATIONS CONSENT

By signing this Agreement electronically, you consent to receive all communications, disclosures, notices, and documents related to your Account in electronic form. You may withdraw this consent at any time by contacting us in writing, but doing so may result in the closure of your Account.

9. PRIVACY AND DATA SECURITY

Your personal information, including your Social Security number, date of birth, and financial information, is stored using industry-standard encryption (AES-256). Access to your full personal data is restricted to authorized personnel only. We will never sell or share your personal information with third parties except as required by law or as necessary to provide the services described in this Agreement (e.g., credit bureau reporting).

10. RIGHT TO CANCEL

You have the right to cancel this Agreement within three (3) business days of signing without penalty. To cancel, you must notify us in writing (email or mail) within the cancellation period. If you cancel within this period, any annual membership fee paid will be refunded in full.

After the three (3) business day cancellation period, you may close your Account at any time by contacting us. However, the annual membership fee is non-refundable after the cancellation period, and any outstanding balance must be paid in full before the Account can be closed.

11. DEFAULT AND ACCOUNT SUSPENSION

Your Account may be suspended or closed if:
- Your payment is more than 60 days past due
- You provide false or misleading information on your application
- You violate any term of this Agreement

If your Account is suspended for non-payment, we will continue to report the delinquent status to the credit bureaus until the balance is paid or the Account is charged off (after 120 days past due).

12. DISPUTE RESOLUTION

Any disputes arising under this Agreement will first be addressed through our internal dispute resolution process. You may contact us at support@credlocity.com or call our customer service line. If a dispute cannot be resolved informally, it shall be submitted to binding arbitration in accordance with the rules of the American Arbitration Association. You retain your right to file complaints with the Consumer Financial Protection Bureau (CFPB) or your state Attorney General.

13. GOVERNING LAW

This Agreement shall be governed by the laws of the State of Pennsylvania without regard to conflict of law principles. You acknowledge that Credlocity operates under the Credit Repair Organizations Act (CROA), 15 U.S.C. sections 1679-1679j, and complies with all applicable federal and state consumer protection laws.

14. CREDIT REPAIR ORGANIZATIONS ACT (CROA) DISCLOSURE

Under the Credit Repair Organizations Act, you have the right to:
- Cancel this Agreement without penalty within three (3) business days
- Sue a credit repair organization that violates the CROA
- Seek reimbursement for financial losses caused by a violation of the CROA

A credit repair organization or any person who violates any provision of the CROA may be sued in federal court or state court within five years of the violation.

15. ENTIRE AGREEMENT

This Agreement constitutes the entire understanding between you and Credlocity regarding your Credit Builder Account. Any modifications to this Agreement must be made in writing and agreed to by both parties.

16. ACKNOWLEDGMENTS

By signing below, you acknowledge and agree that:
- You have read and understand this entire Agreement
- You are at least 18 years of age
- The information you provided on your application is true and accurate
- You authorize Credlocity to report your Account activity to Equifax, Experian, and TransUnion
- You understand the annual membership fee of $68.00 is non-refundable after three (3) business days
- You understand that late payments will negatively affect your credit score
"""


@credit_builder_router.get("/agreement/{account_id}")
async def get_agreement(account_id: str, authorization: Optional[str] = Header(None)):
    """Get the agreement text for a credit builder account. Works for both admin and account holder."""
    account = await db.credit_builder_accounts.find_one({"id": account_id}, {"_id": 0})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    plan = account.get("plan_tier", "starter")
    plan_info = PLAN_MAP.get(plan, PLAN_MAP["starter"])
    agreement_text = CREDIT_BUILDER_AGREEMENT_TEXT.format(
        plan_tier=plan.capitalize(),
        credit_limit=f"{plan_info['credit_limit']:,.2f}",
        monthly_fee=f"{plan_info['monthly_fee']:.2f}"
    )

    return {
        "account_id": account_id,
        "account_number": account.get("account_number"),
        "client_name": f"{account.get('first_name', '')} {account.get('last_name', '')}",
        "plan_tier": plan,
        "credit_limit": plan_info["credit_limit"],
        "monthly_fee": plan_info["monthly_fee"],
        "annual_fee": 68.00,
        "agreement_text": agreement_text.strip(),
        "agreement_signed": account.get("agreement_signed", False),
        "agreement_signed_at": account.get("agreement_signed_at"),
    }


@credit_builder_router.post("/agreement/{account_id}/sign")
async def sign_agreement(account_id: str, data: dict, authorization: Optional[str] = Header(None)):
    """E-sign the credit builder agreement. Can be done by admin on behalf of client or by client."""
    account = await db.credit_builder_accounts.find_one({"id": account_id}, {"_id": 0})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    if account.get("agreement_signed"):
        raise HTTPException(status_code=400, detail="Agreement has already been signed")

    full_name = data.get("full_name", "").strip()
    if not full_name:
        raise HTTPException(status_code=422, detail="Full legal name is required for e-signature")

    expected_name = f"{account.get('first_name', '')} {account.get('last_name', '')}".strip()
    if full_name.lower() != expected_name.lower():
        raise HTTPException(status_code=422, detail="Signature name must match account holder name")

    now = datetime.now(timezone.utc).isoformat()
    ip_address = data.get("ip_address", "unknown")

    await db.credit_builder_accounts.update_one(
        {"id": account_id},
        {"$set": {
            "agreement_signed": True,
            "agreement_signed_at": now,
            "agreement_ip": ip_address,
            "updated_at": now
        }}
    )

    # Store the signed agreement record
    agreement_record = {
        "id": str(uuid.uuid4()),
        "account_id": account_id,
        "account_number": account.get("account_number"),
        "signer_name": full_name,
        "signer_email": account.get("email"),
        "ip_address": ip_address,
        "signed_at": now,
        "plan_tier": account.get("plan_tier"),
        "credit_limit": account.get("credit_limit"),
        "monthly_fee": account.get("monthly_fee"),
        "annual_fee": 68.00,
        "agreement_version": "1.0",
    }
    await db.credit_builder_agreements.insert_one(agreement_record)

    await log_audit(
        data.get("signed_by", "client"),
        "sign_agreement",
        "credit_builder_account",
        account_id,
        f"Agreement signed by {full_name}"
    )

    return {
        "message": "Agreement signed successfully",
        "account_id": account_id,
        "signed_at": now,
        "signer_name": full_name,
    }


@credit_builder_router.get("/agreement/{account_id}/status")
async def agreement_status(account_id: str, authorization: Optional[str] = Header(None)):
    """Check if an account's agreement has been signed."""
    account = await db.credit_builder_accounts.find_one(
        {"id": account_id}, {"_id": 0, "agreement_signed": 1, "agreement_signed_at": 1, "agreement_ip": 1, "first_name": 1, "last_name": 1}
    )
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return {
        "account_id": account_id,
        "agreement_signed": account.get("agreement_signed", False),
        "agreement_signed_at": account.get("agreement_signed_at"),
        "client_name": f"{account.get('first_name', '')} {account.get('last_name', '')}",
    }
