"""
Credit Reporting Dashboard API
Provides Metro 2 compliance checking, reporting cycles, cross-bureau validation,
and unified account views for credit bureau furnisher operations.
"""

from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import Response
from datetime import datetime, timezone, timedelta
from typing import Optional
from uuid import uuid4

credit_reporting_router = APIRouter(prefix="/credit-reporting", tags=["Credit Reporting"])

db = None

def set_db(database):
    global db
    db = database


# ==================== HELPERS ====================

METRO2_REQUIRED_FIELDS = {
    "collections": [
        {"field": "account_number", "label": "Account Number", "severity": "critical"},
        {"field": "client_name", "label": "Consumer Name", "severity": "critical"},
        {"field": "past_due_balance", "label": "Current Balance", "severity": "critical"},
        {"field": "original_balance", "label": "Original Amount", "severity": "critical"},
        {"field": "first_failed_payment_date", "label": "Date of First Delinquency", "severity": "critical"},
        {"field": "account_status", "label": "Account Status", "severity": "critical"},
        {"field": "metro2_status_code", "label": "Metro 2 Status Code", "severity": "critical"},
        {"field": "payment_rating", "label": "Payment Rating Code", "severity": "high"},
        {"field": "payment_history_profile", "label": "Payment History Profile (24mo)", "severity": "high"},
        {"field": "assigned_rep_name", "label": "Creditor Name / Rep", "severity": "medium"},
        {"field": "client_email", "label": "Consumer Email", "severity": "low"},
        {"field": "client_phone", "label": "Consumer Phone", "severity": "low"},
        {"field": "special_comment_code", "label": "Special Comment Code", "severity": "low"},
    ],
    "credit_builder": [
        {"field": "account_number", "label": "Account Number", "severity": "critical"},
        {"field": "first_name", "label": "First Name", "severity": "critical"},
        {"field": "last_name", "label": "Last Name", "severity": "critical"},
        {"field": "date_of_birth", "label": "Date of Birth", "severity": "critical"},
        {"field": "ssn_last_four", "label": "SSN (Last 4)", "severity": "critical"},
        {"field": "current_balance", "label": "Current Balance", "severity": "critical"},
        {"field": "credit_limit", "label": "Credit Limit / Highest Credit", "severity": "critical"},
        {"field": "date_opened", "label": "Date Opened", "severity": "critical"},
        {"field": "account_status_code", "label": "Account Status Code", "severity": "critical"},
        {"field": "payment_rating", "label": "Payment Rating Code", "severity": "high"},
        {"field": "payment_history_profile", "label": "Payment History Profile (24mo)", "severity": "high"},
        {"field": "ecoa_code", "label": "ECOA Code", "severity": "high"},
        {"field": "address", "label": "Consumer Address", "severity": "medium"},
        {"field": "special_comment_code", "label": "Special Comment Code", "severity": "low"},
    ],
    "school": [
        {"field": "account_number", "label": "Account Number", "severity": "critical"},
        {"field": "first_name", "label": "First Name", "severity": "critical"},
        {"field": "last_name", "label": "Last Name", "severity": "critical"},
        {"field": "date_of_birth", "label": "Date of Birth", "severity": "critical"},
        {"field": "ssn_last_four", "label": "SSN (Last 4)", "severity": "critical"},
        {"field": "current_balance", "label": "Current Balance", "severity": "critical"},
        {"field": "original_amount", "label": "Original Contract Amount", "severity": "critical"},
        {"field": "date_opened", "label": "Date Opened", "severity": "critical"},
        {"field": "account_status_code", "label": "Account Status Code", "severity": "critical"},
        {"field": "payment_rating", "label": "Payment Rating Code", "severity": "high"},
        {"field": "payment_history_profile", "label": "Payment History Profile (24mo)", "severity": "high"},
        {"field": "ecoa_code", "label": "ECOA Code", "severity": "high"},
        {"field": "address", "label": "Consumer Address", "severity": "medium"},
        {"field": "phone", "label": "Consumer Phone", "severity": "medium"},
        {"field": "employer", "label": "Employer", "severity": "low"},
    ]
}

# Account type codes per Metro 2 spec
ACCOUNT_TYPE_CODES = {
    "collections": "48",     # Collection account / installment
    "credit_builder": "18",  # Revolving / Line of credit
    "school": "12",          # Educational / Contractual
}


async def _get_user(authorization: str = Header(None)):
    if not authorization:
        return None
    try:
        from server import decode_token
        actual_token = authorization
        if authorization.startswith("Bearer "):
            actual_token = authorization[7:]
        payload = decode_token(actual_token)
        if not payload:
            return None
        email = payload.get("sub", "")
        # Try main admin users first
        user = await db.users.find_one({"email": email}, {"_id": 0, "password_hash": 0})
        if user:
            return {
                "email": user.get("email"),
                "full_name": user.get("full_name", user.get("name", "Admin")),
                "role": user.get("role", "admin"),
                "is_master": user.get("is_master", False),
            }
        # Try collections employees
        emp = await db.collections_employees.find_one({"email": email, "is_active": True}, {"_id": 0, "password_hash": 0})
        if emp:
            return {"email": email, "role": emp.get("role", "collections_agent"), "full_name": emp.get("full_name", "")}
        return None
    except Exception:
        return None


def _check_field(account, field_name):
    """Check if a field has a valid (non-empty) value."""
    val = account.get(field_name)
    if val is None or val == "" or val == 0:
        return False
    if isinstance(val, str) and val.strip() == "":
        return False
    return True


def _get_account_name(acc, acct_type):
    if acct_type == "collections":
        first = acc.get("debtor_first_name", "")
        last = acc.get("debtor_last_name", "")
        if first or last:
            return f"{first} {last}".strip()
        return acc.get("client_name", "Unknown")
    return f"{acc.get('first_name', '')} {acc.get('last_name', '')}".strip() or "Unknown"


def _compute_compliance(account, acct_type):
    """Run Metro 2 compliance check on a single account."""
    fields = METRO2_REQUIRED_FIELDS.get(acct_type, METRO2_REQUIRED_FIELDS["collections"])
    results = []
    passed = 0
    critical_missing = 0
    for f in fields:
        ok = _check_field(account, f["field"])
        results.append({
            "field": f["field"],
            "label": f["label"],
            "severity": f["severity"],
            "status": "pass" if ok else "fail",
            "value": str(account.get(f["field"], ""))[:50] if ok else None,
        })
        if ok:
            passed += 1
        elif f["severity"] == "critical":
            critical_missing += 1
    total = len(fields)
    score = round((passed / total) * 100) if total > 0 else 0
    return {
        "total_fields": total,
        "passed": passed,
        "failed": total - passed,
        "critical_missing": critical_missing,
        "score": score,
        "ready_to_report": critical_missing == 0,
        "fields": results,
    }


def _cross_bureau_check(account, acct_type):
    """Check if the account data is consistent for all 3 bureaus.
    Since we report the same data to all 3, we flag any fields that
    might cause inconsistency (e.g., missing or conflicting data)."""
    issues = []
    # Check account has metro2 code
    if not account.get("metro2_status_code") and not account.get("account_status_code"):
        issues.append({"bureau": "All", "issue": "No Metro 2 status code set — bureaus will reject"})
    # Check payment history
    php = account.get("payment_history_profile", "")
    if len(php) < 60:
        issues.append({"bureau": "All", "issue": f"Payment history profile incomplete ({len(php)}/60 months)"})
    # Check dispute status
    if account.get("dispute_status") == "under_investigation":
        issues.append({"bureau": "All", "issue": "Active dispute — must report special comment XB to all bureaus"})
        if account.get("special_comment_code") != "XB":
            issues.append({"bureau": "All", "issue": "CRITICAL: Active dispute but special comment is not XB"})
    # Check suppression
    if account.get("reporting_suppressed"):
        issues.append({"bureau": "All", "issue": "Reporting is SUPPRESSED — account will not be reported"})
    return {
        "consistent": len(issues) == 0,
        "issues": issues,
        "bureaus": ["Equifax", "Experian", "TransUnion"],
    }


# ==================== UNIFIED ACCOUNT REGISTRY ====================

@credit_reporting_router.get("/accounts")
async def get_all_reportable_accounts(
    authorization: Optional[str] = Header(None),
    account_type: Optional[str] = None,
    compliance_filter: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
):
    """Get all accounts (collections + credit builder) in a unified view for reporting."""
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    accounts = []

    # Collections accounts
    if not account_type or account_type == "collections":
        coll_query = {}
        if search:
            coll_query["$or"] = [
                {"client_name": {"$regex": search, "$options": "i"}},
                {"account_number": {"$regex": search, "$options": "i"}},
            ]
        coll_accs = await db.collections_accounts.find(coll_query, {"_id": 0}).to_list(None)
        for a in coll_accs:
            compliance = _compute_compliance(a, "collections")
            bureau_check = _cross_bureau_check(a, "collections")
            accounts.append({
                "id": a.get("id"),
                "account_type": "collections",
                "account_type_label": "Installment (Collection)",
                "account_type_code": ACCOUNT_TYPE_CODES["collections"],
                "name": _get_account_name(a, "collections"),
                "account_number": a.get("account_number", a.get("id", "")[:12]),
                "metro2_status_code": a.get("metro2_status_code", ""),
                "payment_rating": a.get("payment_rating", ""),
                "special_comment_code": a.get("special_comment_code", ""),
                "balance": a.get("past_due_balance", 0),
                "original_balance": a.get("original_balance", 0),
                "account_status": a.get("account_status", ""),
                "days_past_due": 0,
                "payment_history_profile": a.get("payment_history_profile", ""),
                "dispute_status": a.get("dispute_status"),
                "reporting_suppressed": a.get("reporting_suppressed", False),
                "last_reported_date": a.get("last_reported_date"),
                "compliance_score": compliance["score"],
                "ready_to_report": compliance["ready_to_report"],
                "cross_bureau_consistent": bureau_check["consistent"],
                "cross_bureau_issues_count": len(bureau_check["issues"]),
                "first_failed_payment_date": a.get("first_failed_payment_date", ""),
            })

    # Credit builder accounts
    if not account_type or account_type == "credit_builder":
        cb_query = {}
        if search:
            cb_query["$or"] = [
                {"first_name": {"$regex": search, "$options": "i"}},
                {"last_name": {"$regex": search, "$options": "i"}},
                {"account_number": {"$regex": search, "$options": "i"}},
            ]
        cb_accs = await db.credit_builder_accounts.find(cb_query, {"_id": 0, "ssn_encrypted": 0}).to_list(None)
        for a in cb_accs:
            compliance = _compute_compliance(a, "credit_builder")
            bureau_check = _cross_bureau_check(a, "credit_builder")
            accounts.append({
                "id": a.get("id"),
                "account_type": "credit_builder",
                "account_type_label": "Revolving Line of Credit",
                "account_type_code": ACCOUNT_TYPE_CODES["credit_builder"],
                "name": f"{a.get('first_name', '')} {a.get('last_name', '')}".strip(),
                "account_number": a.get("account_number", ""),
                "metro2_status_code": a.get("account_status_code", ""),
                "payment_rating": a.get("payment_rating", ""),
                "special_comment_code": a.get("special_comment_code", ""),
                "balance": a.get("current_balance", 0),
                "original_balance": a.get("credit_limit", 0),
                "account_status": a.get("account_status", "active"),
                "days_past_due": a.get("days_past_due", 0),
                "payment_history_profile": a.get("payment_history_profile", ""),
                "dispute_status": a.get("dispute_status"),
                "reporting_suppressed": a.get("reporting_suppressed", False),
                "last_reported_date": a.get("last_reported_date"),
                "compliance_score": compliance["score"],
                "ready_to_report": compliance["ready_to_report"],
                "cross_bureau_consistent": bureau_check["consistent"],
                "cross_bureau_issues_count": len(bureau_check["issues"]),
                "date_opened": a.get("date_opened", ""),
            })

    # School accounts (educational contractual)
    if not account_type or account_type == "school":
        sch_query = {"has_payment_plan": True}
        if search:
            sch_query["$or"] = [
                {"first_name": {"$regex": search, "$options": "i"}},
                {"last_name": {"$regex": search, "$options": "i"}},
                {"account_number": {"$regex": search, "$options": "i"}},
            ]
        sch_accs = await db.school_payment_accounts.find(sch_query, {"_id": 0, "ssn_encrypted": 0}).to_list(None)
        for a in sch_accs:
            compliance = _compute_compliance(a, "school")
            bureau_check = _cross_bureau_check(a, "school")
            accounts.append({
                "id": a.get("id"),
                "account_type": "school",
                "account_type_label": "Educational Contractual",
                "account_type_code": ACCOUNT_TYPE_CODES["school"],
                "name": f"{a.get('first_name', '')} {a.get('last_name', '')}".strip(),
                "account_number": a.get("account_number", ""),
                "metro2_status_code": a.get("account_status_code", "11"),
                "payment_rating": a.get("payment_rating", "0"),
                "special_comment_code": a.get("special_comment_code", ""),
                "balance": a.get("current_balance", 0),
                "original_balance": a.get("original_amount", 0),
                "account_status": a.get("account_status", "current"),
                "days_past_due": a.get("days_past_due", 0),
                "payment_history_profile": a.get("payment_history_profile", ""),
                "dispute_status": a.get("dispute_status"),
                "reporting_suppressed": a.get("reporting_suppressed", False),
                "last_reported_date": a.get("last_reported_date"),
                "compliance_score": compliance["score"],
                "ready_to_report": compliance["ready_to_report"],
                "cross_bureau_consistent": bureau_check["consistent"],
                "cross_bureau_issues_count": len(bureau_check["issues"]),
                "date_opened": a.get("date_opened", ""),
            })

    # Filter by compliance status
    if compliance_filter == "ready":
        accounts = [a for a in accounts if a["ready_to_report"]]
    elif compliance_filter == "not_ready":
        accounts = [a for a in accounts if not a["ready_to_report"]]
    elif compliance_filter == "suppressed":
        accounts = [a for a in accounts if a["reporting_suppressed"]]

    total = len(accounts)
    accounts = accounts[skip:skip + limit]

    return {"accounts": accounts, "total": total}


@credit_reporting_router.get("/accounts/{account_id}/compliance")
async def get_account_compliance_detail(
    account_id: str,
    authorization: Optional[str] = Header(None),
):
    """Get full Metro 2 compliance detail for a single account."""
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Try collections first
    account = await db.collections_accounts.find_one({"id": account_id}, {"_id": 0})
    acct_type = "collections"
    if not account:
        account = await db.credit_builder_accounts.find_one({"id": account_id}, {"_id": 0, "ssn_encrypted": 0})
        acct_type = "credit_builder"
    if not account:
        account = await db.school_payment_accounts.find_one({"id": account_id}, {"_id": 0, "ssn_encrypted": 0})
        acct_type = "school"
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    compliance = _compute_compliance(account, acct_type)
    bureau_check = _cross_bureau_check(account, acct_type)

    # Disputes
    disputes = await db.consumer_disputes.find({"account_id": account_id}, {"_id": 0}).sort("created_at", -1).to_list(None)

    # Audit log
    audit = await db.furnisher_audit_log.find({"account_id": account_id}, {"_id": 0}).sort("created_at", -1).limit(20).to_list(None)

    # Reporting corrections
    corrections = await db.collections_reporting_corrections.find({"account_id": account_id}, {"_id": 0}).sort("corrected_at", -1).limit(20).to_list(None)
    if not corrections:
        corrections = await db.credit_builder_reporting_corrections.find({"account_id": account_id}, {"_id": 0}).sort("corrected_at", -1).limit(20).to_list(None)

    # Reporting history
    report_history = await db.reporting_cycle_accounts.find({"account_id": account_id}, {"_id": 0}).sort("reported_at", -1).limit(20).to_list(None)

    return {
        "account_id": account_id,
        "account_type": acct_type,
        "name": _get_account_name(account, acct_type),
        "account_number": account.get("account_number", account.get("id", "")[:12]),
        "metro2_status_code": account.get("metro2_status_code", account.get("account_status_code", "")),
        "payment_rating": account.get("payment_rating", ""),
        "special_comment_code": account.get("special_comment_code", ""),
        "payment_history_profile": account.get("payment_history_profile", ""),
        "reporting_suppressed": account.get("reporting_suppressed", False),
        "dispute_status": account.get("dispute_status"),
        "compliance": compliance,
        "cross_bureau": bureau_check,
        "disputes": disputes,
        "audit_log": audit,
        "corrections": corrections,
        "report_history": report_history,
        # Raw editable fields for collections
        "raw_fields": {
            "account_number": account.get("account_number", ""),
            "client_name": account.get("client_name", ""),
            "first_name": account.get("first_name", ""),
            "last_name": account.get("last_name", ""),
            "debtor_first_name": account.get("debtor_first_name", ""),
            "debtor_last_name": account.get("debtor_last_name", ""),
            "past_due_balance": account.get("past_due_balance", 0),
            "original_balance": account.get("original_balance", 0),
            "current_balance": account.get("current_balance", 0),
            "credit_limit": account.get("credit_limit", 0),
            "first_failed_payment_date": account.get("first_failed_payment_date", ""),
            "date_opened": account.get("date_opened", ""),
            "account_status": account.get("account_status", ""),
            "metro2_status_code": account.get("metro2_status_code", account.get("account_status_code", "")),
            "payment_rating": account.get("payment_rating", ""),
            "payment_history_profile": account.get("payment_history_profile", ""),
            "special_comment_code": account.get("special_comment_code", ""),
            "assigned_rep_name": account.get("assigned_rep_name", ""),
            "client_email": account.get("client_email", account.get("email", "")),
            "client_phone": account.get("client_phone", account.get("phone", "")),
            "address": account.get("address", ""),
            "date_of_birth": account.get("date_of_birth", ""),
            "ssn_last_four": account.get("ssn_last_four", ""),
            "ecoa_code": account.get("ecoa_code", ""),
        },
    }


# All fields that can be updated via the Credit Reporting fix endpoint
EDITABLE_COLLECTIONS_FIELDS = [
    "account_number", "client_name", "debtor_first_name", "debtor_last_name",
    "past_due_balance", "original_balance", "first_failed_payment_date",
    "account_status", "metro2_status_code", "payment_rating", "payment_history_profile",
    "special_comment_code", "assigned_rep_name", "client_email", "client_phone",
    "address", "ecoa_code", "notes",
]

EDITABLE_CB_FIELDS = [
    "account_number", "first_name", "last_name", "date_of_birth", "ssn_last_four",
    "current_balance", "credit_limit", "date_opened", "account_status", "account_status_code",
    "payment_rating", "payment_history_profile", "special_comment_code",
    "address", "email", "phone", "ecoa_code",
]

EDITABLE_SCHOOL_FIELDS = [
    "account_number", "first_name", "last_name", "date_of_birth", "ssn_last_four",
    "current_balance", "original_amount", "date_opened", "account_status", "account_status_code",
    "payment_rating", "payment_history_profile", "special_comment_code",
    "address", "phone", "email", "employer", "ecoa_code",
]


@credit_reporting_router.post("/accounts/{account_id}/fix")
async def fix_account_fields(
    account_id: str,
    data: dict,
    authorization: Optional[str] = Header(None),
):
    """Fix any field on an account from the Credit Reporting dashboard.
    Accepts: { fields: { field_name: value, ... }, reason: str, corrected_items: [str] }
    """
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    fields = data.get("fields", {})
    reason = data.get("reason", "")
    corrected_items = data.get("corrected_items", [])

    if not fields:
        raise HTTPException(status_code=422, detail="No fields provided")
    if not reason:
        raise HTTPException(status_code=422, detail="Reason is required")

    # Determine account type
    account = await db.collections_accounts.find_one({"id": account_id}, {"_id": 0})
    acct_type = "collections"
    collection_name = "collections_accounts"
    allowed_fields = EDITABLE_COLLECTIONS_FIELDS

    if not account:
        account = await db.credit_builder_accounts.find_one({"id": account_id}, {"_id": 0, "ssn_encrypted": 0})
        acct_type = "credit_builder"
        collection_name = "credit_builder_accounts"
        allowed_fields = EDITABLE_CB_FIELDS

    if not account:
        account = await db.school_payment_accounts.find_one({"id": account_id}, {"_id": 0, "ssn_encrypted": 0})
        acct_type = "school"
        collection_name = "school_payment_accounts"
        allowed_fields = EDITABLE_SCHOOL_FIELDS

    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    # Build update dict — only allow known fields
    update = {"updated_at": datetime.now(timezone.utc).isoformat()}
    old_values = {}
    corrected_fields = []

    for field_name, new_value in fields.items():
        if field_name in allowed_fields:
            old_values[field_name] = account.get(field_name)
            update[field_name] = new_value
            corrected_fields.append(field_name)

    if len(corrected_fields) == 0:
        raise HTTPException(status_code=422, detail="No valid fields to update")

    # Apply update
    coll = db[collection_name]
    await coll.update_one({"id": account_id}, {"$set": update})

    # Audit log
    now = datetime.now(timezone.utc)
    audit = {
        "id": str(uuid4()),
        "account_id": account_id,
        "action": "credit_reporting_fix",
        "performed_by": user.get("email", user.get("full_name")),
        "performed_by_role": user.get("role"),
        "reason": reason,
        "corrected_items": corrected_items,
        "corrected_fields": corrected_fields,
        "old_values": old_values,
        "new_values": {k: v for k, v in update.items() if k != "updated_at"},
        "created_at": now.isoformat(),
    }
    await db.furnisher_audit_log.insert_one(audit)

    # Also log to corrections collection
    correction = {
        "id": str(uuid4()),
        "account_id": account_id,
        "account_type": acct_type,
        "corrected_fields": corrected_fields,
        "corrected_items": corrected_items,
        "reason": reason,
        "performed_by": user.get("email", user.get("full_name")),
        "corrected_at": now.isoformat(),
    }
    corrections_coll = "collections_reporting_corrections" if acct_type == "collections" else "credit_builder_reporting_corrections"
    await db[corrections_coll].insert_one(correction)

    return {
        "message": f"Updated {len(corrected_fields)} fields",
        "corrected_fields": corrected_fields,
        "audit_id": audit["id"],
    }



# ==================== COMPLIANCE OVERVIEW ====================

@credit_reporting_router.get("/compliance/overview")
async def get_compliance_overview(authorization: Optional[str] = Header(None)):
    """Get overall compliance stats across all accounts."""
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    coll_accs = await db.collections_accounts.find({}, {"_id": 0}).to_list(None)
    cb_accs = await db.credit_builder_accounts.find({}, {"_id": 0, "ssn_encrypted": 0}).to_list(None)
    sch_accs = await db.school_payment_accounts.find({"has_payment_plan": True}, {"_id": 0, "ssn_encrypted": 0}).to_list(None)

    total = len(coll_accs) + len(cb_accs) + len(sch_accs)
    ready = 0
    not_ready = 0
    suppressed = 0
    disputed = 0
    missing_metro2 = 0
    missing_payment_history = 0
    inconsistent = 0
    score_sum = 0

    for a in coll_accs:
        c = _compute_compliance(a, "collections")
        b = _cross_bureau_check(a, "collections")
        score_sum += c["score"]
        if c["ready_to_report"]:
            ready += 1
        else:
            not_ready += 1
        if a.get("reporting_suppressed"):
            suppressed += 1
        if a.get("dispute_status") == "under_investigation":
            disputed += 1
        if not a.get("metro2_status_code"):
            missing_metro2 += 1
        if len(a.get("payment_history_profile", "")) < 60:
            missing_payment_history += 1
        if not b["consistent"]:
            inconsistent += 1

    for a in cb_accs:
        c = _compute_compliance(a, "credit_builder")
        b = _cross_bureau_check(a, "credit_builder")
        score_sum += c["score"]
        if c["ready_to_report"]:
            ready += 1
        else:
            not_ready += 1
        if a.get("reporting_suppressed"):
            suppressed += 1
        if a.get("dispute_status") == "under_investigation":
            disputed += 1
        if not a.get("account_status_code"):
            missing_metro2 += 1
        if len(a.get("payment_history_profile", "")) < 60:
            missing_payment_history += 1
        if not b["consistent"]:
            inconsistent += 1

    for a in sch_accs:
        c = _compute_compliance(a, "school")
        b = _cross_bureau_check(a, "school")
        score_sum += c["score"]
        if c["ready_to_report"]:
            ready += 1
        else:
            not_ready += 1
        if a.get("reporting_suppressed"):
            suppressed += 1
        if a.get("dispute_status") == "under_investigation":
            disputed += 1
        if not a.get("account_status_code"):
            missing_metro2 += 1
        if len(a.get("payment_history_profile", "")) < 60:
            missing_payment_history += 1
        if not b["consistent"]:
            inconsistent += 1

    avg_score = round(score_sum / total) if total > 0 else 0

    # Disputes stats
    open_disputes = await db.consumer_disputes.count_documents({"status": "open"})
    now = datetime.now(timezone.utc)
    approaching = 0
    overdue = 0
    open_d = await db.consumer_disputes.find({"status": "open"}, {"_id": 0, "deadline": 1}).to_list(None)
    for d in open_d:
        if d.get("deadline"):
            try:
                dl = datetime.fromisoformat(d["deadline"])
                days_left = (dl - now).days
                if days_left < 0:
                    overdue += 1
                elif days_left <= 5:
                    approaching += 1
            except Exception:
                pass

    # Last reporting cycle
    last_cycle = await db.reporting_cycles.find_one({}, {"_id": 0}, sort=[("created_at", -1)])

    return {
        "total_accounts": total,
        "collections_count": len(coll_accs),
        "credit_builder_count": len(cb_accs),
        "school_count": len(sch_accs),
        "ready_to_report": ready,
        "not_ready": not_ready,
        "suppressed": suppressed,
        "disputed": disputed,
        "missing_metro2_code": missing_metro2,
        "missing_payment_history": missing_payment_history,
        "inconsistent_cross_bureau": inconsistent,
        "average_compliance_score": avg_score,
        "disputes": {
            "open": open_disputes,
            "approaching_deadline": approaching,
            "overdue": overdue,
        },
        "last_reporting_cycle": last_cycle,
    }


# ==================== DISPUTES CENTER ====================

@credit_reporting_router.get("/disputes")
async def get_disputes_dashboard(
    authorization: Optional[str] = Header(None),
    status_filter: Optional[str] = None,
    limit: int = 200,
):
    """Get all disputes across all accounts for the disputes dashboard."""
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    query = {}
    if status_filter:
        query["status"] = status_filter
    disputes = await db.consumer_disputes.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(None)

    now = datetime.now(timezone.utc)
    for d in disputes:
        if d.get("status") == "open" and d.get("deadline"):
            try:
                dl = datetime.fromisoformat(d["deadline"])
                d["days_remaining"] = (dl - now).days
                d["is_urgent"] = d["days_remaining"] <= 5
                d["is_overdue"] = d["days_remaining"] < 0
            except Exception:
                d["days_remaining"] = None

    open_count = await db.consumer_disputes.count_documents({"status": "open"})
    resolved_count = await db.consumer_disputes.count_documents({"status": "resolved"})

    return {
        "disputes": disputes,
        "stats": {
            "total": open_count + resolved_count,
            "open": open_count,
            "resolved": resolved_count,
        }
    }


# ==================== REPORTING CYCLES ====================

@credit_reporting_router.get("/cycles")
async def get_reporting_cycles(
    authorization: Optional[str] = Header(None),
    limit: int = 50,
):
    """Get all reporting cycles."""
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    cycles = await db.reporting_cycles.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(None)
    return {"cycles": cycles}


@credit_reporting_router.post("/cycles")
async def create_reporting_cycle(
    data: dict,
    authorization: Optional[str] = Header(None),
):
    """Create a new reporting cycle (scheduled or off-cycle)."""
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if user.get("role") not in ["admin", "super_admin", "collections_manager", "credit_builder_manager"]:
        if not user.get("is_master"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")

    cycle_type = data.get("cycle_type", "scheduled")
    bureaus = data.get("bureaus", ["Equifax", "Experian", "TransUnion"])
    account_ids = data.get("account_ids", [])
    account_type_filter = data.get("account_type")

    # Gather accounts to include
    included = []
    if account_ids:
        # Off-cycle for specific accounts
        for aid in account_ids:
            acc = await db.collections_accounts.find_one({"id": aid}, {"_id": 0})
            atype = "collections"
            if not acc:
                acc = await db.credit_builder_accounts.find_one({"id": aid}, {"_id": 0, "ssn_encrypted": 0})
                atype = "credit_builder"
            if not acc:
                acc = await db.school_payment_accounts.find_one({"id": aid}, {"_id": 0, "ssn_encrypted": 0})
                atype = "school"
            if acc and not acc.get("reporting_suppressed"):
                compliance = _compute_compliance(acc, atype)
                included.append({
                    "account_id": aid,
                    "account_type": atype,
                    "name": _get_account_name(acc, atype) if atype != "school" else f"{acc.get('first_name', '')} {acc.get('last_name', '')}".strip(),
                    "compliance_score": compliance["score"],
                    "ready": compliance["ready_to_report"],
                })
    else:
        # Full cycle — all non-suppressed, ready accounts
        coll_accs = await db.collections_accounts.find({"reporting_suppressed": {"$ne": True}}, {"_id": 0}).to_list(None)
        for a in coll_accs:
            c = _compute_compliance(a, "collections")
            if c["ready_to_report"]:
                included.append({
                    "account_id": a["id"],
                    "account_type": "collections",
                    "name": _get_account_name(a, "collections"),
                    "compliance_score": c["score"],
                    "ready": True,
                })
        if not account_type_filter or account_type_filter == "credit_builder":
            cb_accs = await db.credit_builder_accounts.find({"reporting_suppressed": {"$ne": True}}, {"_id": 0, "ssn_encrypted": 0}).to_list(None)
            for a in cb_accs:
                c = _compute_compliance(a, "credit_builder")
                if c["ready_to_report"]:
                    included.append({
                        "account_id": a["id"],
                        "account_type": "credit_builder",
                        "name": _get_account_name(a, "credit_builder"),
                        "compliance_score": c["score"],
                        "ready": True,
                    })
        if not account_type_filter or account_type_filter == "school":
            sch_accs = await db.school_payment_accounts.find({"has_payment_plan": True, "reporting_suppressed": {"$ne": True}}, {"_id": 0, "ssn_encrypted": 0}).to_list(None)
            for a in sch_accs:
                c = _compute_compliance(a, "school")
                if c["ready_to_report"]:
                    included.append({
                        "account_id": a["id"],
                        "account_type": "school",
                        "name": f"{a.get('first_name', '')} {a.get('last_name', '')}".strip(),
                        "compliance_score": c["score"],
                        "ready": True,
                    })

    now = datetime.now(timezone.utc)
    cycle = {
        "id": str(uuid4()),
        "cycle_type": cycle_type,
        "bureaus": bureaus,
        "status": "completed",
        "total_accounts": len(included),
        "ready_accounts": len([a for a in included if a["ready"]]),
        "skipped_accounts": len([a for a in included if not a["ready"]]),
        "notes": data.get("notes", ""),
        "created_by": user.get("email", user.get("full_name", "")),
        "created_at": now.isoformat(),
        "reported_at": now.isoformat(),
    }
    await db.reporting_cycles.insert_one(cycle)

    # Record each account in the cycle
    for acc in included:
        record = {
            "id": str(uuid4()),
            "cycle_id": cycle["id"],
            "account_id": acc["account_id"],
            "account_type": acc["account_type"],
            "name": acc["name"],
            "bureaus": bureaus,
            "compliance_score": acc["compliance_score"],
            "reported_at": now.isoformat(),
        }
        await db.reporting_cycle_accounts.insert_one(record)

        # Update last_reported_date on the account
        if acc["account_type"] == "collections":
            coll = db.collections_accounts
        elif acc["account_type"] == "school":
            coll = db.school_payment_accounts
        else:
            coll = db.credit_builder_accounts
        await coll.update_one({"id": acc["account_id"]}, {"$set": {"last_reported_date": now.isoformat()}})

    cycle.pop("_id", None)
    cycle["accounts_included"] = included
    return cycle


@credit_reporting_router.get("/cycles/{cycle_id}")
async def get_cycle_detail(cycle_id: str, authorization: Optional[str] = Header(None)):
    """Get detail for a specific reporting cycle."""
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    cycle = await db.reporting_cycles.find_one({"id": cycle_id}, {"_id": 0})
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")
    accounts = await db.reporting_cycle_accounts.find({"cycle_id": cycle_id}, {"_id": 0}).to_list(None)
    cycle["accounts"] = accounts
    return cycle


# ==================== METRO 2 FILE EXPORT ====================

def _format_metro2_field(value, length, align='left', fill=' '):
    """Format a field to Metro 2 fixed-width spec."""
    s = str(value or '')[:length]
    if align == 'right':
        return s.rjust(length, fill)
    return s.ljust(length, fill)


def _format_metro2_date(date_str):
    """Convert ISO date to MMDDYYYY format."""
    if not date_str:
        return '00000000'
    try:
        d = datetime.fromisoformat(str(date_str).replace('Z', '+00:00'))
        return d.strftime('%m%d%Y')
    except Exception:
        return '00000000'


def _generate_header_record(reporter_name, reporter_address, reporter_city, reporter_state, reporter_zip, reporter_phone):
    """Generate Metro 2 Header Record (426 bytes)."""
    record = ''
    record += '0426'                                          # Record length (4)
    record += '1'                                              # Processing indicator (1) = Header
    record += _format_metro2_field(datetime.now().strftime('%m%d%Y'), 8)  # Date created
    record += _format_metro2_field(datetime.now().strftime('%m%d%Y'), 8)  # Date reported
    record += _format_metro2_field('', 10)                     # Program date (reserved)
    record += _format_metro2_field('', 10)                     # Program revision date (reserved)
    record += _format_metro2_field(reporter_name, 40)          # Reporter name
    record += _format_metro2_field(reporter_address, 96)       # Reporter address
    record += _format_metro2_field(reporter_phone, 10)         # Reporter phone
    record += _format_metro2_field('', 239)                    # Reserved/filler
    record = record[:426].ljust(426)
    return record


def _generate_base_record(account, acct_type):
    """Generate a Metro 2 Base Segment record (426 bytes) for an account."""
    record = ''
    record += '0426'                                           # Record length
    record += '2'                                              # Processing indicator = Base
    record += _format_metro2_field(datetime.now().strftime('%m%d%Y'), 8)  # Timestamp

    # Account identification
    acct_num = account.get('account_number', account.get('id', '')[:20])
    record += _format_metro2_field(acct_num, 30)               # Account number

    # Consumer info
    if acct_type == 'collections':
        name = account.get('client_name', 'Unknown')
        parts = name.split(' ', 1)
        first_name = parts[0] if parts else ''
        last_name = parts[1] if len(parts) > 1 else parts[0] if parts else ''
    else:
        # credit_builder and school both use first_name/last_name
        first_name = account.get('first_name', '')
        last_name = account.get('last_name', '')

    record += _format_metro2_field(last_name, 25)              # Surname
    record += _format_metro2_field(first_name, 20)             # First name
    record += _format_metro2_field('', 1)                      # Middle initial
    record += _format_metro2_field('', 1)                      # Generation code

    # SSN
    ssn = account.get('ssn_last_four', account.get('ssn_encrypted', ''))
    record += _format_metro2_field(ssn, 9, align='right', fill='0')  # SSN

    # DOB
    dob = account.get('date_of_birth', account.get('dob_encrypted', ''))
    record += _format_metro2_field(_format_metro2_date(dob), 8)  # DOB

    # Phone
    phone = account.get('client_phone', account.get('phone', ''))
    record += _format_metro2_field(phone, 10)                  # Phone

    # Account status
    status_code = account.get('metro2_status_code', account.get('account_status_code', '97'))
    record += _format_metro2_field(status_code, 2)             # Account status

    # Payment rating
    payment_rating = account.get('payment_rating', '0')
    record += _format_metro2_field(payment_rating, 1)          # Payment rating

    # Payment history (60 months, most recent first)
    php = account.get('payment_history_profile', '').ljust(60, '-')[:60]
    record += php                                              # Payment history

    # Special comment
    special = account.get('special_comment_code', '')
    record += _format_metro2_field(special, 2)                 # Special comment

    # Compliance condition code
    record += _format_metro2_field('', 2)                      # Compliance condition

    # Balances
    balance = int(account.get('past_due_balance', account.get('current_balance', 0)))
    orig_balance = int(account.get('original_balance', account.get('credit_limit', 0)))
    record += _format_metro2_field(balance, 9, align='right', fill='0')    # Current balance
    record += _format_metro2_field(orig_balance, 9, align='right', fill='0')  # Original amount

    # Date opened
    date_opened = account.get('date_opened', account.get('first_failed_payment_date', ''))
    record += _format_metro2_field(_format_metro2_date(date_opened), 8)    # Date opened

    # Date of last payment
    record += _format_metro2_field('', 8)                      # Date of last payment

    # Filler to reach 426
    current_len = len(record)
    if current_len < 426:
        record += ' ' * (426 - current_len)

    return record[:426]


def _generate_trailer_record(total_records, total_base):
    """Generate Metro 2 Trailer Record (426 bytes)."""
    record = ''
    record += '0426'                                           # Record length
    record += '3'                                              # Processing indicator = Trailer
    record += _format_metro2_field(total_records, 9, align='right', fill='0')  # Total records
    record += _format_metro2_field(total_base, 9, align='right', fill='0')     # Total base segments
    record += ' ' * 404                                        # Filler
    return record[:426]


@credit_reporting_router.post("/export/metro2")
async def export_metro2_file(
    data: dict,
    authorization: Optional[str] = Header(None),
):
    """Generate a Metro 2 formatted .dat file for submission to credit bureaus."""
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if user.get("role") not in ["admin", "super_admin", "collections_manager", "credit_builder_manager"]:
        if not user.get("is_master"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")

    bureau = data.get("bureau", "All")
    account_type_filter = data.get("account_type")
    account_ids = data.get("account_ids", [])
    include_suppressed = data.get("include_suppressed", False)

    reporter_name = data.get("reporter_name", "CREDLOCITY LLC")
    reporter_address = data.get("reporter_address", "")
    reporter_city = data.get("reporter_city", "")
    reporter_state = data.get("reporter_state", "")
    reporter_zip = data.get("reporter_zip", "")
    reporter_phone = data.get("reporter_phone", "")

    # Gather accounts
    accounts_to_export = []

    if account_ids:
        for aid in account_ids:
            acc = await db.collections_accounts.find_one({"id": aid}, {"_id": 0})
            atype = "collections"
            if not acc:
                acc = await db.credit_builder_accounts.find_one({"id": aid}, {"_id": 0, "ssn_encrypted": 0})
                atype = "credit_builder"
            if not acc:
                acc = await db.school_payment_accounts.find_one({"id": aid}, {"_id": 0, "ssn_encrypted": 0})
                atype = "school"
            if acc:
                accounts_to_export.append((acc, atype))
    else:
        if not account_type_filter or account_type_filter == "collections":
            query = {} if include_suppressed else {"reporting_suppressed": {"$ne": True}}
            colls = await db.collections_accounts.find(query, {"_id": 0}).to_list(None)
            for a in colls:
                c = _compute_compliance(a, "collections")
                if c["ready_to_report"]:
                    accounts_to_export.append((a, "collections"))
        if not account_type_filter or account_type_filter == "credit_builder":
            query = {} if include_suppressed else {"reporting_suppressed": {"$ne": True}}
            cbs = await db.credit_builder_accounts.find(query, {"_id": 0, "ssn_encrypted": 0}).to_list(None)
            for a in cbs:
                c = _compute_compliance(a, "credit_builder")
                if c["ready_to_report"]:
                    accounts_to_export.append((a, "credit_builder"))
        if not account_type_filter or account_type_filter == "school":
            query = {"has_payment_plan": True} if not include_suppressed else {"has_payment_plan": True, "reporting_suppressed": {"$ne": True}}
            schs = await db.school_payment_accounts.find(query, {"_id": 0, "ssn_encrypted": 0}).to_list(None)
            for a in schs:
                c = _compute_compliance(a, "school")
                if c["ready_to_report"]:
                    accounts_to_export.append((a, "school"))

    # Generate Metro 2 file
    lines = []
    lines.append(_generate_header_record(
        reporter_name, reporter_address, reporter_city, reporter_state, reporter_zip, reporter_phone
    ))

    for acc, atype in accounts_to_export:
        lines.append(_generate_base_record(acc, atype))

    lines.append(_generate_trailer_record(len(lines) + 1, len(accounts_to_export)))

    file_content = '\n'.join(lines)
    now = datetime.now(timezone.utc)
    filename = f"METRO2_{bureau}_{now.strftime('%Y%m%d_%H%M%S')}.dat"

    # Log export
    export_record = {
        "id": str(uuid4()),
        "filename": filename,
        "bureau": bureau,
        "total_accounts": len(accounts_to_export),
        "exported_by": user.get("email", user.get("full_name", "")),
        "created_at": now.isoformat(),
    }
    await db.metro2_exports.insert_one(export_record)

    return Response(
        content=file_content,
        media_type="text/plain",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "X-Export-Id": export_record["id"],
            "X-Total-Accounts": str(len(accounts_to_export)),
        }
    )


@credit_reporting_router.get("/export/history")
async def get_export_history(authorization: Optional[str] = Header(None)):
    """Get history of Metro 2 file exports."""
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    exports = await db.metro2_exports.find({}, {"_id": 0}).sort("created_at", -1).limit(50).to_list(None)
    return {"exports": exports}

