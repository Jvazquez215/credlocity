"""
CPR Merger CRM Module - Complete CRM and financial tracking for Credlocity x CPR merger.
"""
import os
import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Header
from revenue_tracker import log_revenue

cpr_router = APIRouter(prefix="/api/cpr", tags=["CPR Merger CRM"])

db = None

def set_db(database):
    global db
    db = database


async def get_admin(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        from auth import decode_token
        token = authorization.replace("Bearer ", "")
        payload = decode_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid token")
        return payload
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


def remove_id(doc):
    if doc and "_id" in doc:
        doc.pop("_id")
    return doc


# ============ SEED DATA ============

LEGACY_CLIENTS = [
    "Darren Grier", "Leticia Galvan", "Anna Contreras", "Rosario Chaires", "Pamela Chaires",
    "Adrian Salinas", "Beatrice Aguilar", "Israel Garcia", "Pauline Adams", "Sarah Lindsey",
    "Lisa Ortega", "Cheryl Daniels", "Robert Daniels", "Tonya Cummings", "Natalie Moran",
    "Patricia Austin", "Donna Stephenson", "Laquita Thompson", "Natasha Brown", "Veronica James",
    "Sylvia Jones", "Ronald Johnson", "Brenda Smith", "Angela Williams", "Marcus Davis",
    "Patricia Moore", "Sandra Taylor", "Dorothy Anderson", "Beverly Thomas", "Gloria Jackson",
    "Carolyn White", "Shirley Harris", "Frances Martin", "Evelyn Thompson", "Martha Garcia",
    "Alice Martinez", "Mildred Robinson"
]

SHAR_CLIENTS = [
    {"name": "Jose Campos", "rate": 149.00, "method": "venmo", "payments": [
        {"month": "2025-09", "date": "2025-09-07"}, {"month": "2025-10", "date": "2025-10-07"},
        {"month": "2025-11", "date": "2025-11-07"}, {"month": "2025-12", "date": "2025-12-07"},
        {"month": "2026-01", "date": "2026-01-07"}, {"month": "2026-02", "date": "2026-02-07"},
        {"month": "2026-03", "date": "2026-03-07"}, {"month": "2026-04", "date": "2026-04-07"}
    ]},
    {"name": "Paige Wheat", "rate": 149.00, "method": "venmo", "payments": [
        {"month": "2026-01", "date": "2026-01-17"}, {"month": "2026-02", "date": "2026-02-17"},
        {"month": "2026-03", "date": "2026-03-17"}, {"month": "2026-04", "date": "2026-04-17"},
        {"month": "2026-05", "date": "2026-05-17"}, {"month": "2026-06", "date": "2026-06-17"},
        {"month": "2026-07", "date": "2026-07-17"}, {"month": "2026-08", "date": "2026-08-17"}
    ]},
    {"name": "Karen Allen", "rate": 149.00, "method": "venmo", "payments": [
        {"month": "2026-01", "date": "2026-01-17"}, {"month": "2026-02", "date": "2026-02-17"},
        {"month": "2026-03", "date": "2026-03-17"}, {"month": "2026-04", "date": "2026-04-17"},
        {"month": "2026-05", "date": "2026-05-17"}, {"month": "2026-06", "date": "2026-06-17"},
        {"month": "2026-07", "date": "2026-07-17"}, {"month": "2026-08", "date": "2026-08-17"}
    ]},
    {"name": "Brandon Boulan", "rate": 149.00, "method": "venmo", "payments": [
        {"month": "2026-01", "date": "2026-01-17"}, {"month": "2026-02", "date": "2026-02-17"},
        {"month": "2026-03", "date": "2026-03-17"}, {"month": "2026-04", "date": "2026-04-17"},
        {"month": "2026-05", "date": "2026-05-17"}, {"month": "2026-06", "date": "2026-06-17"},
        {"month": "2026-07", "date": "2026-07-17"}, {"month": "2026-08", "date": "2026-08-17"}
    ]},
    {"name": "Anthony Cuevas", "rate": 149.00, "method": "venmo", "payments": [
        {"month": "2026-01", "date": "2026-01-17"}, {"month": "2026-02", "date": "2026-02-17"},
        {"month": "2026-03", "date": "2026-03-17"}, {"month": "2026-04", "date": "2026-04-17"},
        {"month": "2026-05", "date": "2026-05-17"}, {"month": "2026-06", "date": "2026-06-17"},
        {"month": "2026-07", "date": "2026-07-17"}, {"month": "2026-08", "date": "2026-08-17"}
    ]},
]


async def seed_cpr_data():
    count = await db.cpr_clients.count_documents({})
    if count > 0:
        return

    # Seed Legacy CPR Clients
    for name in LEGACY_CLIENTS:
        parts = name.split(" ", 1)
        client = {
            "id": str(uuid.uuid4()),
            "full_name": name,
            "category": "legacy_cpr",
            "status": "active",
            "email": "",
            "phone": "",
            "address": "",
            "payment_method": "check",
            "cr_monitoring_active": True,
            "cr_charge_to_client": 49.95,
            "cr_cost_to_credlocity": 16.00,
            "cr_start_date": "2026-01-01",
            "notary_required": True,
            "notary_completed": False,
            "notary_completed_date": None,
            "notary_charged_to_client": 39.95,
            "notary_cost_to_credlocity": 19.99,
            "notary_paid_by_client": False,
            "notary_paid_date": None,
            "notary_discount_absorbed": round(19.99 - 39.95, 2),
            "three_b_report_ordered": False,
            "three_b_report_ordered_date": None,
            "three_b_report_completed": False,
            "three_b_report_completed_date": None,
            "monthly_rate": 0,
            "billing_start_date": None,
            "couple_account": False,
            "merger_status": None,
            "missing_items": [],
            "chargeback_risk": "low",
            "notes": "",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "created_by": "system"
        }
        await db.cpr_clients.insert_one(client)

    # Seed Shar Active Clients
    for sc in SHAR_CLIENTS:
        client_id = str(uuid.uuid4())
        client = {
            "id": client_id,
            "full_name": sc["name"],
            "category": "shar_active",
            "status": "active",
            "email": "",
            "phone": "",
            "address": "",
            "payment_method": sc["method"],
            "cr_monitoring_active": True,
            "cr_charge_to_client": 49.95,
            "cr_cost_to_credlocity": 16.00,
            "cr_start_date": "2026-01-01",
            "notary_required": False,
            "notary_completed": False,
            "notary_completed_date": None,
            "notary_charged_to_client": 0,
            "notary_cost_to_credlocity": 0,
            "notary_paid_by_client": False,
            "notary_paid_date": None,
            "notary_discount_absorbed": 0,
            "three_b_report_ordered": False,
            "three_b_report_ordered_date": None,
            "three_b_report_completed": False,
            "three_b_report_completed_date": None,
            "monthly_rate": sc["rate"],
            "billing_start_date": None,
            "couple_account": False,
            "merger_status": "pending",
            "missing_items": [],
            "chargeback_risk": "low",
            "notes": "",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "created_by": "system"
        }
        await db.cpr_clients.insert_one(client)

        # Seed payment records
        for pmt in sc["payments"]:
            payment = {
                "id": str(uuid.uuid4()),
                "client_id": client_id,
                "payment_type": "monthly_repair",
                "amount_collected": sc["rate"],
                "month": pmt["month"],
                "payment_date": pmt["date"],
                "payment_method": sc["method"],
                "notes": "",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "created_by": "system"
            }
            await db.cpr_payment_records.insert_one(payment)

    # Seed Shar Payouts
    payouts = [
        {"month": "2026-01", "calculated_amount": 1259.00, "actual_paid": 1259.00, "payment_date": "2026-02-17", "payment_method": "check", "notes": "January payout"},
        {"month": "2026-02", "calculated_amount": 2025.00, "actual_paid": 2025.00, "payment_date": "2026-03-05", "payment_method": "check", "notes": "February payout"},
    ]
    for p in payouts:
        payout = {
            "id": str(uuid.uuid4()),
            "month": p["month"],
            "calculated_amount": p["calculated_amount"],
            "actual_paid": p["actual_paid"],
            "payment_date": p["payment_date"],
            "payment_method": p["payment_method"],
            "notes": p["notes"],
            "balance": round(p["actual_paid"] - p["calculated_amount"], 2),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": "system"
        }
        await db.cpr_shar_payouts.insert_one(payout)

    print(f"[SEED] CPR Merger: {len(LEGACY_CLIENTS)} Legacy + {len(SHAR_CLIENTS)} Shar Active clients + 2 payouts seeded")


async def migrate_client_monthly_fields():
    """Add monthly status fields and run financial calculations on existing clients that lack them."""
    from cpr_financial_engine import recalculate_client
    clients = await db.cpr_clients.find(
        {"jan_rev_status": {"$exists": False}}, {"_id": 0}
    ).to_list(500)
    if not clients:
        return
    for c in clients:
        update = {
            "mailing_source": "DisputeFox",
            "mailing_locked": True,
            "joe_verified": c.get("joe_verified", False),
            "merger_status": c.get("merger_status", "pending"),
            "not_added_merged": c.get("not_added_merged", False),
        }
        # Set monthly statuses based on existing cr_monitoring_active
        is_active = c.get("cr_monitoring_active", False)
        default_status = "paid" if is_active and c.get("status") == "active" else "n_a"
        for m in ["jan", "feb", "mar", "apr", "may", "jun"]:
            update[f"{m}_rev_status"] = c.get(f"{m}_rev_status", default_status)
            update[f"{m}_cr_status"] = c.get(f"{m}_cr_status", default_status)
            update[f"{m}_mail_amount"] = float(c.get(f"{m}_mail_amount", 0) or 0)
        # Merge and recalculate
        merged = {**c, **update}
        financials = recalculate_client(merged)
        update.update(financials)
        await db.cpr_clients.update_one({"id": c["id"]}, {"$set": update})
    print(f"[MIGRATE] CPR: Migrated {len(clients)} clients with monthly fields + financial recalculation")



# ============ CLIENTS ============

@cpr_router.post("/clients")
async def create_client(data: dict, authorization: str = Header(None)):
    admin = await get_admin(authorization)

    # Auto-calculate notary discount absorbed
    notary_charged = float(data.get("notary_charged_to_client", 0))
    notary_cost = 19.99 if data.get("notary_completed") else 0
    discount_absorbed = round(19.99 - notary_charged, 2) if data.get("notary_required") else 0

    # Auto-calculate billing_start_date for new_credlocity
    billing_start = data.get("billing_start_date")
    if data.get("category") == "new_credlocity" and data.get("cr_start_date") and not billing_start:
        from datetime import timedelta
        cr_start = datetime.strptime(data["cr_start_date"], "%Y-%m-%d")
        billing_start = (cr_start + timedelta(days=31)).strftime("%Y-%m-%d")

    client = {
        "id": str(uuid.uuid4()),
        "full_name": data.get("full_name", ""),
        "category": data.get("category", "new_credlocity"),
        "status": data.get("status", "active"),
        "email": data.get("email", ""),
        "phone": data.get("phone", ""),
        "address": data.get("address", ""),
        "payment_method": data.get("payment_method", "credit_card"),
        "cr_monitoring_active": data.get("cr_monitoring_active", True),
        "cr_charge_to_client": float(data.get("cr_charge_to_client", 49.95)),
        "cr_cost_to_credlocity": float(data.get("cr_cost_to_credlocity", 16.00)),
        "cr_start_date": data.get("cr_start_date"),
        "notary_required": data.get("notary_required", False),
        "notary_completed": data.get("notary_completed", False),
        "notary_completed_date": data.get("notary_completed_date"),
        "notary_charged_to_client": notary_charged,
        "notary_cost_to_credlocity": 19.99 if data.get("notary_required") else 0,
        "notary_paid_by_client": data.get("notary_paid_by_client", False),
        "notary_paid_date": data.get("notary_paid_date"),
        "notary_discount_absorbed": discount_absorbed,
        "three_b_report_ordered": data.get("three_b_report_ordered", False),
        "three_b_report_ordered_date": data.get("three_b_report_ordered_date"),
        "three_b_report_completed": data.get("three_b_report_completed", False),
        "three_b_report_completed_date": data.get("three_b_report_completed_date"),
        "monthly_rate": float(data.get("monthly_rate", 130)),
        "billing_start_date": billing_start,
        "couple_account": data.get("couple_account", False),
        "merger_status": data.get("merger_status"),
        "missing_items": data.get("missing_items", []),
        "chargeback_risk": data.get("chargeback_risk", "low"),
        "notes": data.get("notes", ""),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "created_by": admin.get("sub", "admin")
    }
    await db.cpr_clients.insert_one(client)
    return remove_id(client)


@cpr_router.get("/clients")
async def list_clients(
    category: Optional[str] = None,
    status: Optional[str] = None,
    missing_items: Optional[str] = None,
    chargeback_risk: Optional[str] = None,
    search: Optional[str] = None,
    authorization: str = Header(None)
):
    await get_admin(authorization)
    query = {}
    if category:
        query["category"] = category
    if status:
        query["status"] = status
    if chargeback_risk:
        query["chargeback_risk"] = chargeback_risk
    if missing_items == "true":
        query["missing_items"] = {"$ne": []}

    clients = await db.cpr_clients.find(query, {"_id": 0}).sort("full_name", 1).to_list(500)

    if search:
        s = search.lower()
        clients = [c for c in clients if s in c.get("full_name", "").lower()]

    return clients


@cpr_router.get("/clients/{client_id}")
async def get_client(client_id: str, authorization: str = Header(None)):
    await get_admin(authorization)
    client = await db.cpr_clients.find_one({"id": client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@cpr_router.put("/clients/{client_id}")
async def update_client(client_id: str, data: dict, authorization: str = Header(None)):
    await get_admin(authorization)

    # Auto-recalculate notary discount
    if "notary_charged_to_client" in data:
        data["notary_discount_absorbed"] = round(19.99 - float(data["notary_charged_to_client"]), 2)

    update_fields = {k: v for k, v in data.items() if k not in ["id", "created_at", "created_by"]}
    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()

    result = await db.cpr_clients.update_one({"id": client_id}, {"$set": update_fields})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")

    # Auto-recalculate financials for all categories
    updated = await db.cpr_clients.find_one({"id": client_id}, {"_id": 0})
    if updated:
        from cpr_financial_engine import recalculate_client
        financials = recalculate_client(updated)
        if financials:
            await db.cpr_clients.update_one({"id": client_id}, {"$set": financials})
            updated.update(financials)

    return updated


@cpr_router.delete("/clients/{client_id}")
async def soft_delete_client(client_id: str, authorization: str = Header(None)):
    await get_admin(authorization)
    await db.cpr_clients.update_one({"id": client_id}, {"$set": {"status": "closed", "updated_at": datetime.now(timezone.utc).isoformat()}})
    return {"message": "Client closed"}


# ============ MAILING EXPENSES ============

@cpr_router.post("/clients/{client_id}/mailing")
async def add_mailing(client_id: str, data: dict, authorization: str = Header(None)):
    admin = await get_admin(authorization)
    expense = {
        "id": str(uuid.uuid4()),
        "client_id": client_id,
        "amount": float(data.get("amount", 0)),
        "month": data.get("month", ""),
        "description": data.get("description", ""),
        "date_spent": data.get("date_spent", ""),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": admin.get("sub", "admin")
    }
    await db.cpr_mailing_expenses.insert_one(expense)
    return remove_id(expense)


@cpr_router.get("/clients/{client_id}/mailing")
async def get_client_mailing(client_id: str, authorization: str = Header(None)):
    await get_admin(authorization)
    expenses = await db.cpr_mailing_expenses.find({"client_id": client_id}, {"_id": 0}).sort("date_spent", -1).to_list(200)
    return expenses


@cpr_router.put("/mailing/{expense_id}")
async def update_mailing(expense_id: str, data: dict, authorization: str = Header(None)):
    await get_admin(authorization)
    update_fields = {k: v for k, v in data.items() if k not in ["id", "created_at"]}
    await db.cpr_mailing_expenses.update_one({"id": expense_id}, {"$set": update_fields})
    return await db.cpr_mailing_expenses.find_one({"id": expense_id}, {"_id": 0})


@cpr_router.delete("/mailing/{expense_id}")
async def delete_mailing(expense_id: str, authorization: str = Header(None)):
    await get_admin(authorization)
    await db.cpr_mailing_expenses.delete_one({"id": expense_id})
    return {"message": "Mailing expense deleted"}


# ============ PAYMENT RECORDS ============

@cpr_router.post("/clients/{client_id}/payments")
async def record_payment(client_id: str, data: dict, authorization: str = Header(None)):
    admin = await get_admin(authorization)
    payment = {
        "id": str(uuid.uuid4()),
        "client_id": client_id,
        "payment_type": data.get("payment_type", "cr_monitoring"),
        "amount_collected": float(data.get("amount_collected", 0)),
        "month": data.get("month", ""),
        "payment_date": data.get("payment_date", ""),
        "payment_method": data.get("payment_method", ""),
        "notes": data.get("notes", ""),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": admin.get("sub", "admin")
    }
    await db.cpr_payment_records.insert_one(payment)

    # ── Log to central revenue_records for Finance Dashboard ──
    await log_revenue(
        db,
        source="credit_repair",
        category=f"cpr_{data.get('payment_type', 'monitoring')}",
        amount=float(data.get("amount_collected", 0)),
        description=f"CPR Client Payment - {data.get('payment_type', 'monitoring')}",
        reference_id=client_id,
        reference_type="cpr_client",
        payment_status="paid",
        payment_method=data.get("payment_method", ""),
        recorded_by_id=admin.get("sub", "admin"),
        recorded_by_name="Admin",
    )

    return remove_id(payment)


@cpr_router.get("/clients/{client_id}/payments")
async def get_client_payments(client_id: str, authorization: str = Header(None)):
    await get_admin(authorization)
    payments = await db.cpr_payment_records.find({"client_id": client_id}, {"_id": 0}).sort("payment_date", -1).to_list(500)
    return payments


@cpr_router.get("/payments")
async def get_all_payments(month: Optional[str] = None, payment_type: Optional[str] = None, authorization: str = Header(None)):
    await get_admin(authorization)
    query = {}
    if month:
        query["month"] = month
    if payment_type:
        query["payment_type"] = payment_type
    payments = await db.cpr_payment_records.find(query, {"_id": 0}).sort("payment_date", -1).to_list(1000)
    return payments


# ============ SHAR PAYOUTS ============

@cpr_router.get("/shar/calculate/{month}")
async def calculate_shar_payout(month: str, authorization: str = Header(None)):
    await get_admin(authorization)

    # Only Jan/Feb 2026 use legacy formula
    is_shar_payout = month in ["2026-01", "2026-02"]

    legacy_clients = await db.cpr_clients.find({"category": "legacy_cpr"}, {"_id": 0}).to_list(500)
    shar_clients = await db.cpr_clients.find({"category": "shar_active"}, {"_id": 0}).to_list(100)

    # Get all payments for the month
    all_payments = await db.cpr_payment_records.find({"month": month}, {"_id": 0}).to_list(1000)
    legacy_ids = {c["id"] for c in legacy_clients}
    shar_ids = {c["id"] for c in shar_clients}

    # Revenue from legacy CR monitoring collected
    legacy_cr_collected = sum(p["amount_collected"] for p in all_payments if p["client_id"] in legacy_ids and p["payment_type"] == "cr_monitoring")
    legacy_notary_collected = sum(p["amount_collected"] for p in all_payments if p["client_id"] in legacy_ids and p["payment_type"] == "notary")

    # Costs
    active_legacy_count = len([c for c in legacy_clients if c.get("cr_monitoring_active")])
    cr_cost = active_legacy_count * 16.00
    notary_completed = len([c for c in legacy_clients if c.get("notary_completed")])
    notary_cost = notary_completed * 19.99

    # Mailing costs
    mailing = await db.cpr_mailing_expenses.find({"month": month}, {"_id": 0}).to_list(500)
    legacy_mailing = sum(m["amount"] for m in mailing if m.get("client_id") in legacy_ids)

    if is_shar_payout:
        revenue = legacy_cr_collected + legacy_notary_collected
        costs = cr_cost + notary_cost + legacy_mailing
        calculated = max(0, revenue - costs)
    else:
        calculated = 0

    return {
        "month": month,
        "is_shar_payout_month": is_shar_payout,
        "revenue_base": legacy_cr_collected + legacy_notary_collected,
        "cr_report_cost": cr_cost,
        "notary_cost": notary_cost,
        "mailing_cost": legacy_mailing,
        "calculated_payout": round(calculated, 2)
    }


@cpr_router.post("/shar/payouts")
async def record_shar_payout(data: dict, authorization: str = Header(None)):
    admin = await get_admin(authorization)
    calculated = float(data.get("calculated_amount", 0))
    actual = float(data.get("actual_paid", 0))
    payout = {
        "id": str(uuid.uuid4()),
        "month": data.get("month", ""),
        "calculated_amount": calculated,
        "actual_paid": actual,
        "payment_date": data.get("payment_date", ""),
        "payment_method": data.get("payment_method", ""),
        "notes": data.get("notes", ""),
        "balance": round(actual - calculated, 2),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": admin.get("sub", "admin")
    }
    await db.cpr_shar_payouts.insert_one(payout)
    return remove_id(payout)


@cpr_router.get("/shar/payouts")
async def get_shar_payouts(authorization: str = Header(None)):
    await get_admin(authorization)
    payouts = await db.cpr_shar_payouts.find({}, {"_id": 0}).sort("month", 1).to_list(100)
    return payouts


# ============ FINANCIALS ============

@cpr_router.get("/financials/monthly/{month}")
async def get_monthly_financials(month: str, authorization: str = Header(None)):
    await get_admin(authorization)

    is_shar_month = month in ["2026-01", "2026-02"]

    all_clients = await db.cpr_clients.find({}, {"_id": 0}).to_list(500)
    legacy = [c for c in all_clients if c["category"] == "legacy_cpr"]
    shar_active = [c for c in all_clients if c["category"] == "shar_active"]
    new_cred = [c for c in all_clients if c["category"] == "new_credlocity"]

    legacy_ids = {c["id"] for c in legacy}
    shar_ids = {c["id"] for c in shar_active}
    new_ids = {c["id"] for c in new_cred}

    payments = await db.cpr_payment_records.find({"month": month}, {"_id": 0}).to_list(1000)
    mailing = await db.cpr_mailing_expenses.find({"month": month}, {"_id": 0}).to_list(500)

    # Revenue
    def sum_payments(client_ids, ptype=None):
        return sum(p["amount_collected"] for p in payments if p["client_id"] in client_ids and (not ptype or p["payment_type"] == ptype))

    legacy_cr = sum_payments(legacy_ids, "cr_monitoring")
    legacy_notary = sum_payments(legacy_ids, "notary")
    shar_billing = sum_payments(shar_ids, "monthly_repair")
    new_billing = sum_payments(new_ids, "monthly_repair")

    total_revenue = legacy_cr + legacy_notary + shar_billing + new_billing

    # Costs
    active_legacy = len([c for c in legacy if c.get("cr_monitoring_active")])
    active_shar = len([c for c in shar_active if c.get("cr_monitoring_active")])
    active_new = len([c for c in new_cred if c.get("cr_monitoring_active")])

    cr_cost_legacy = active_legacy * 16.00
    cr_cost_shar = active_shar * 16.00
    cr_cost_new = active_new * 16.00
    notary_cost = len([c for c in legacy if c.get("notary_completed")]) * 19.99

    legacy_mail = sum(m["amount"] for m in mailing if m.get("client_id") in legacy_ids)
    shar_mail = sum(m["amount"] for m in mailing if m.get("client_id") in shar_ids)
    new_mail = sum(m["amount"] for m in mailing if m.get("client_id") in new_ids)

    total_costs = cr_cost_legacy + cr_cost_shar + cr_cost_new + notary_cost + legacy_mail + shar_mail + new_mail

    # Shar payout
    payout = await db.cpr_shar_payouts.find_one({"month": month}, {"_id": 0})
    shar_payout_calc = payout.get("calculated_amount", 0) if payout else 0
    shar_payout_paid = payout.get("actual_paid", 0) if payout else 0

    net_income = total_revenue - total_costs - (shar_payout_paid if is_shar_month else 0)

    # Partner split (March+ only)
    joey_share = 0
    shar_share = 0
    if not is_shar_month:
        shared_pool = total_revenue - total_costs
        joey_share = round(shared_pool / 2, 2)
        shar_share = round(shared_pool / 2, 2)

    return {
        "month": month,
        "is_shar_payout_month": is_shar_month,
        "gross_revenue": {
            "legacy_cr_monitoring": round(legacy_cr, 2),
            "legacy_notary_collected": round(legacy_notary, 2),
            "shar_active_billing": round(shar_billing, 2),
            "new_credlocity_billing": round(new_billing, 2),
            "total": round(total_revenue, 2)
        },
        "costs": {
            "cr_report_cost_legacy": round(cr_cost_legacy, 2),
            "cr_report_cost_shar_active": round(cr_cost_shar, 2),
            "cr_report_cost_new_credlocity": round(cr_cost_new, 2),
            "notary_cost": round(notary_cost, 2),
            "mailing_legacy": round(legacy_mail, 2),
            "mailing_shar_active": round(shar_mail, 2),
            "mailing_new_credlocity": round(new_mail, 2),
            "total": round(total_costs, 2)
        },
        "shar_payout": {
            "calculated": shar_payout_calc,
            "actual_paid": shar_payout_paid,
            "payment_date": payout.get("payment_date") if payout else None,
            "balance": round(shar_payout_paid - shar_payout_calc, 2) if payout else 0
        },
        "net_income": round(net_income, 2),
        "partner_split": {
            "joey_share": joey_share,
            "shar_share": shar_share
        }
    }


@cpr_router.get("/financials/annual")
async def get_annual_financials(authorization: str = Header(None)):
    await get_admin(authorization)
    months = [f"2026-{str(m).zfill(2)}" for m in range(1, 13)]
    annual = []
    for m in months:
        try:
            monthly = await get_monthly_financials(m, authorization)
            annual.append(monthly)
        except Exception:
            annual.append({"month": m, "gross_revenue": {"total": 0}, "costs": {"total": 0}, "net_income": 0, "partner_split": {"joey_share": 0, "shar_share": 0}})
    return annual


@cpr_router.get("/financials/client/{client_id}")
async def get_client_financials(client_id: str, authorization: str = Header(None)):
    await get_admin(authorization)
    client = await db.cpr_clients.find_one({"id": client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    payments = await db.cpr_payment_records.find({"client_id": client_id}, {"_id": 0}).to_list(500)
    mailing = await db.cpr_mailing_expenses.find({"client_id": client_id}, {"_id": 0}).to_list(200)

    cr_collected = sum(p["amount_collected"] for p in payments if p["payment_type"] == "cr_monitoring")
    notary_collected = sum(p["amount_collected"] for p in payments if p["payment_type"] == "notary")
    repair_collected = sum(p["amount_collected"] for p in payments if p["payment_type"] == "monthly_repair")
    total_collected = cr_collected + notary_collected + repair_collected

    total_mailing = sum(m["amount"] for m in mailing)
    cr_cost = 16.00 * len(set(p["month"] for p in payments if p["payment_type"] == "cr_monitoring")) if client.get("cr_monitoring_active") else 0
    notary_cost = 19.99 if client.get("notary_completed") else 0

    total_costs = cr_cost + notary_cost + total_mailing
    net = total_collected - total_costs

    return {
        "client_id": client_id,
        "full_name": client.get("full_name"),
        "category": client.get("category"),
        "cr_monitoring_collected": round(cr_collected, 2),
        "notary_collected": round(notary_collected, 2),
        "monthly_repair_collected": round(repair_collected, 2),
        "total_collected": round(total_collected, 2),
        "cr_report_costs": round(cr_cost, 2),
        "notary_costs": round(notary_cost, 2),
        "mailing_costs": round(total_mailing, 2),
        "total_costs": round(total_costs, 2),
        "net": round(net, 2)
    }


# ============ DASHBOARD ============

@cpr_router.get("/dashboard")
async def get_cpr_dashboard(authorization: str = Header(None)):
    await get_admin(authorization)

    total = await db.cpr_clients.count_documents({})
    legacy = await db.cpr_clients.count_documents({"category": "legacy_cpr"})
    shar = await db.cpr_clients.count_documents({"category": "shar_active"})
    new_cred = await db.cpr_clients.count_documents({"category": "new_credlocity"})
    missing = await db.cpr_clients.count_documents({"missing_items": {"$ne": []}})
    action_needed = await db.cpr_clients.count_documents({"status": "action_needed"})

    # YTD financials
    payments = await db.cpr_payment_records.find({}, {"_id": 0}).to_list(5000)
    total_revenue = sum(p["amount_collected"] for p in payments)

    # YTD mailing costs
    mailing = await db.cpr_mailing_expenses.find({}, {"_id": 0}).to_list(1000)
    total_mailing = sum(m["amount"] for m in mailing)

    payouts = await db.cpr_shar_payouts.find({}, {"_id": 0}).to_list(100)
    total_payout_calc = sum(p["calculated_amount"] for p in payouts)
    total_payout_paid = sum(p["actual_paid"] for p in payouts)

    return {
        "total_clients": total,
        "legacy_count": legacy,
        "shar_count": shar,
        "new_credlocity_count": new_cred,
        "missing_items_count": missing,
        "action_needed_count": action_needed,
        "total_revenue_ytd": round(total_revenue, 2),
        "total_mailing_ytd": round(total_mailing, 2),
        "shar_payout_calculated_ytd": round(total_payout_calc, 2),
        "shar_payout_paid_ytd": round(total_payout_paid, 2),
    }


# ============ ELISABETH CLIENTS ============

async def seed_elisabeth_data():
    """Seed example Elisabeth clients."""
    count = await db.cpr_elisabeth_clients.count_documents({})
    if count > 0:
        return
    from cpr_financial_engine import calculate_elisabeth

    clients = [
        {
            "id": str(uuid.uuid4()),
            "full_name": "William Peden Kendal",
            "cr_date": "2025-11-15",
            "status": "active",
            "monthly_rev_rate": 99.05,
            "cr_fee": 49.95,
            "cr_cost": 16.00,
            "jan_rev_status": "paid", "feb_rev_status": "paid",
            "mar_rev_status": "n_a", "apr_rev_status": "n_a",
            "may_rev_status": "n_a", "jun_rev_status": "n_a",
            "jan_cr_status": "n_a", "feb_cr_status": "n_a",
            "mar_cr_status": "n_a", "apr_cr_status": "n_a",
            "may_cr_status": "n_a", "jun_cr_status": "n_a",
            "jan_mail": 0.0, "feb_mail": 0.0,
            "mar_mail": 0.0, "apr_mail": 0.0,
            "may_mail": 0.0, "jun_mail": 0.0,
            "mailing_source": "DisputeFox", "mailing_locked": True,
            "notary_date": "2025-12-01",
            "notary_charged": 39.95,
            "notary_standard": 39.95,
            "notary_cost": 19.99,
            "joe_verified": False,
            "merger_status": "pending",
            "cb_risk": "low",
            "notes": "Elisabeth's client - transferred to Credlocity",
        },
        {
            "id": str(uuid.uuid4()),
            "full_name": "Maria Santos Rivera",
            "cr_date": "2025-10-01",
            "status": "active",
            "monthly_rev_rate": 79.00,
            "cr_fee": 49.95,
            "cr_cost": 16.00,
            "jan_rev_status": "paid", "feb_rev_status": "paid",
            "mar_rev_status": "paid", "apr_rev_status": "paid",
            "may_rev_status": "n_a", "jun_rev_status": "n_a",
            "jan_cr_status": "paid", "feb_cr_status": "paid",
            "mar_cr_status": "paid", "apr_cr_status": "paid",
            "may_cr_status": "n_a", "jun_cr_status": "n_a",
            "jan_mail": 5.50, "feb_mail": 3.25,
            "mar_mail": 4.00, "apr_mail": 6.10,
            "may_mail": 0.0, "jun_mail": 0.0,
            "mailing_source": "DisputeFox", "mailing_locked": True,
            "notary_date": "2025-10-15",
            "notary_charged": 20.00,
            "notary_standard": 39.95,
            "notary_cost": 19.99,
            "joe_verified": False,
            "merger_status": "pending",
            "cb_risk": "medium",
            "notes": "Notary discounted - shortfall applied against Shar",
        },
    ]
    for c in clients:
        financials = calculate_elisabeth(c)
        c.update(financials)
        await db.cpr_elisabeth_clients.insert_one(c)
    print(f"[SEED] CPR Elisabeth: {len(clients)} clients seeded")


@cpr_router.get("/elisabeth")
async def list_elisabeth_clients(authorization: str = Header(None)):
    await get_admin(authorization)
    clients = await db.cpr_elisabeth_clients.find({}, {"_id": 0}).sort("full_name", 1).to_list(500)
    return clients


@cpr_router.post("/elisabeth")
async def create_elisabeth_client(data: dict, authorization: str = Header(None)):
    await get_admin(authorization)
    from cpr_financial_engine import calculate_elisabeth

    client = {
        "id": str(uuid.uuid4()),
        "full_name": data.get("full_name", ""),
        "cr_date": data.get("cr_date"),
        "status": data.get("status", "active"),
        "monthly_rev_rate": float(data.get("monthly_rev_rate", 0)),
        "cr_fee": float(data.get("cr_fee", 49.95)),
        "cr_cost": float(data.get("cr_cost", 16.00)),
        "mailing_source": "DisputeFox",
        "mailing_locked": True,
        "notary_date": data.get("notary_date"),
        "notary_charged": float(data.get("notary_charged", 39.95)),
        "notary_standard": 39.95,
        "notary_cost": 19.99,
        "joe_verified": False,
        "merger_status": data.get("merger_status", "pending"),
        "cb_risk": data.get("cb_risk", "n_a"),
        "notes": data.get("notes", ""),
    }
    # Monthly statuses
    for m in ["jan", "feb", "mar", "apr", "may", "jun"]:
        client[f"{m}_rev_status"] = data.get(f"{m}_rev_status", "n_a")
        client[f"{m}_cr_status"] = data.get(f"{m}_cr_status", "n_a")
        client[f"{m}_mail"] = float(data.get(f"{m}_mail", 0) or 0)

    # Calculate financials
    financials = calculate_elisabeth(client)
    client.update(financials)

    await db.cpr_elisabeth_clients.insert_one(client)
    return remove_id(client)


@cpr_router.get("/elisabeth/{client_id}")
async def get_elisabeth_client(client_id: str, authorization: str = Header(None)):
    await get_admin(authorization)
    client = await db.cpr_elisabeth_clients.find_one({"id": client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Elisabeth client not found")
    return client


@cpr_router.put("/elisabeth/{client_id}")
async def update_elisabeth_client(client_id: str, data: dict, authorization: str = Header(None)):
    await get_admin(authorization)
    from cpr_financial_engine import calculate_elisabeth

    update_fields = {k: v for k, v in data.items() if k not in ["id"]}

    result = await db.cpr_elisabeth_clients.update_one({"id": client_id}, {"$set": update_fields})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Elisabeth client not found")

    # Recalculate
    updated = await db.cpr_elisabeth_clients.find_one({"id": client_id}, {"_id": 0})
    financials = calculate_elisabeth(updated)
    await db.cpr_elisabeth_clients.update_one({"id": client_id}, {"$set": financials})
    updated.update(financials)
    return updated


@cpr_router.delete("/elisabeth/{client_id}")
async def delete_elisabeth_client(client_id: str, authorization: str = Header(None)):
    await get_admin(authorization)
    result = await db.cpr_elisabeth_clients.delete_one({"id": client_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Elisabeth client not found")
    return {"message": "Elisabeth client deleted"}


# ============ MAILING COST UPDATE (Master Admin Only) ============

@cpr_router.put("/clients/{client_id}/mailing")
async def update_client_mailing(client_id: str, data: dict, authorization: str = Header(None)):
    """Update mailing costs - master admin only, NOT partner JWT."""
    admin = await get_admin(authorization)
    # Verify this is a main admin, not a partner
    admin_email = admin.get("sub", "")
    user = await db.users.find_one({"email": admin_email}, {"_id": 0})
    if not user or user.get("role") not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Master admin access required")

    mailing_fields = {}
    for m in ["jan", "feb", "mar", "apr", "may", "jun"]:
        key = f"{m}_mail_amount"
        if key in data:
            mailing_fields[key] = float(data[key])

    if not mailing_fields:
        raise HTTPException(status_code=400, detail="No mailing fields provided")

    mailing_fields["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.cpr_clients.update_one({"id": client_id}, {"$set": mailing_fields})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")

    # Recalculate after mailing update
    updated = await db.cpr_clients.find_one({"id": client_id}, {"_id": 0})
    if updated and updated.get("category") in ("shar_active", "new_credlocity"):
        from cpr_financial_engine import recalculate_client
        financials = recalculate_client(updated)
        if financials:
            await db.cpr_clients.update_one({"id": client_id}, {"$set": financials})
            updated.update(financials)

    return updated


# ============ NOTARY WAIVERS ============

@cpr_router.get("/notary-waivers")
async def get_notary_waivers(authorization: str = Header(None)):
    await get_admin(authorization)
    waivers = await db.notary_waiver_log.find({}, {"_id": 0}).sort("recorded_at", -1).to_list(500)
    return waivers


@cpr_router.get("/notary-waivers/summary")
async def get_notary_waiver_summary(authorization: str = Header(None)):
    await get_admin(authorization)

    # Build waiver data from all clients with notary
    all_waivers = []

    cpr_clients = await db.cpr_clients.find(
        {"$or": [{"notary_completed": True}, {"notary_completed_date": {"$ne": None}}, {"notary_date": {"$ne": None}}]},
        {"_id": 0}
    ).to_list(500)
    for c in cpr_clients:
        charged = float(c.get("notary_charged_to_client", 0) or c.get("notary_charged", 0) or 0)
        all_waivers.append({
            "client_name": c.get("full_name", ""),
            "client_id": c.get("id"),
            "category": c.get("category", ""),
            "standard": 39.95,
            "charged": charged,
            "shortfall": round(max(0, 39.95 - charged), 2),
            "cost": 19.99,
            "profit_loss": round(charged - 19.99, 2),
            "waived_fully": charged == 0,
            "discounted": 0 < charged < 39.95,
            "charged_against_shar": c.get("category") in ("shar_active", "cpr_elisabeth"),
            "date": c.get("notary_completed_date") or c.get("notary_date") or "",
        })

    elisabeth_clients = await db.cpr_elisabeth_clients.find(
        {"notary_date": {"$ne": None}},
        {"_id": 0}
    ).to_list(500)
    for c in elisabeth_clients:
        charged = float(c.get("notary_charged", 0) or 0)
        all_waivers.append({
            "client_name": c.get("full_name", ""),
            "client_id": c.get("id"),
            "category": "cpr_elisabeth",
            "standard": 39.95,
            "charged": charged,
            "shortfall": round(max(0, 39.95 - charged), 2),
            "cost": 19.99,
            "profit_loss": round(charged - 19.99, 2),
            "waived_fully": charged == 0,
            "discounted": 0 < charged < 39.95,
            "charged_against_shar": True,
            "date": c.get("notary_date", ""),
        })

    total_orders = len(all_waivers)
    total_collected = round(sum(w["charged"] for w in all_waivers), 2)
    expected_standard = round(39.95 * total_orders, 2)
    total_shortfall = round(sum(w["shortfall"] for w in all_waivers), 2)
    fully_waived = len([w for w in all_waivers if w["waived_fully"]])
    discounted = len([w for w in all_waivers if w["discounted"]])
    net_profit = round(sum(w["profit_loss"] for w in all_waivers), 2)

    return {
        "total_orders": total_orders,
        "total_collected": total_collected,
        "expected_standard": expected_standard,
        "total_shortfall": total_shortfall,
        "fully_waived_count": fully_waived,
        "discounted_count": discounted,
        "net_notary_profit": net_profit,
        "waivers": sorted(all_waivers, key=lambda x: x["shortfall"], reverse=True),
    }


@cpr_router.get("/notary-waivers/by-category")
async def get_notary_waivers_by_category(authorization: str = Header(None)):
    summary = await get_notary_waiver_summary(authorization)
    waivers = summary["waivers"]

    by_cat = {}
    for w in waivers:
        cat = w["category"]
        if cat not in by_cat:
            by_cat[cat] = {"count": 0, "total_collected": 0, "total_shortfall": 0, "waivers": []}
        by_cat[cat]["count"] += 1
        by_cat[cat]["total_collected"] = round(by_cat[cat]["total_collected"] + w["charged"], 2)
        by_cat[cat]["total_shortfall"] = round(by_cat[cat]["total_shortfall"] + w["shortfall"], 2)
        by_cat[cat]["waivers"].append(w)

    return by_cat


# ============ PORTFOLIO P&L ============

@cpr_router.get("/portfolio-pl")
async def get_portfolio_pl(authorization: str = Header(None)):
    """Portfolio-level P&L summary for all categories."""
    await get_admin(authorization)
    from cpr_financial_engine import calculate_portfolio

    clients = await db.cpr_clients.find({}, {"_id": 0}).to_list(None)
    portfolio = calculate_portfolio(clients)

    payouts = await db.cpr_shar_payouts.find({}, {"_id": 0}).sort("payment_date", 1).to_list(None)
    total_paid = sum(float(p.get("actual_paid", 0) or 0) for p in payouts)

    total_shar = sum(d.get("shar_total", 0) for d in portfolio.values())

    return {
        "categories": portfolio,
        "payouts": payouts,
        "total_paid_to_shar": round(total_paid, 2),
        "total_shar_owed": round(total_shar, 2),
        "outstanding_balance": round(total_shar - total_paid, 2),
        "auth_net_monthly": 35.00,
        "auth_net_months": 3,
        "auth_net_total": 105.00,
    }


@cpr_router.post("/recalculate-all")
async def recalculate_all_clients(authorization: str = Header(None)):
    """Recalculate financials for all clients. Master admin only."""
    await get_admin(authorization)
    from cpr_financial_engine import recalculate_client

    clients = await db.cpr_clients.find({}, {"_id": 0}).to_list(None)
    updated_count = 0
    for c in clients:
        financials = recalculate_client(c)
        if financials:
            await db.cpr_clients.update_one({"id": c["id"]}, {"$set": financials})
            updated_count += 1

    return {"message": f"Recalculated {updated_count} clients", "total": len(clients)}
