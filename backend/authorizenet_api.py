"""
Live Authorize.net Payment Gateway API Routes.
Full payment processing, refund management, transaction sync, and chargeback tracking.
"""
from fastapi import APIRouter, HTTPException, Header, Query, BackgroundTasks
from typing import Optional
from datetime import datetime, timezone, timedelta
from uuid import uuid4
import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient

import authorizenet_service as anet
from email_notifications import notify_chargeback, notify_refund

logger = logging.getLogger(__name__)

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "credlocity")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

authorizenet_router = APIRouter(prefix="/api/authorizenet", tags=["Authorize.net Live"])

CLIENT_TYPES = [
    "current_client", "past_due_collections", "outsourcing_client",
    "attorney_network", "new_client", "credit_repair", "other"
]

CLIENT_TYPE_LABELS = {
    "current_client": "Current Client",
    "past_due_collections": "Past Due Collections",
    "outsourcing_client": "Outsourcing Client",
    "attorney_network": "Attorney Network",
    "new_client": "New Client",
    "credit_repair": "Credit Repair",
    "other": "Other"
}


async def get_current_user(authorization: Optional[str] = Header(None)):
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
        raise HTTPException(status_code=403, detail="Not authorized")


# ==================== TRANSACTION RECORD HELPERS ====================

async def _record_transaction(txn_result, txn_type, user, extra_data=None):
    """Auto-record a successful SDK transaction to MongoDB."""
    if not txn_result.get("success"):
        return None

    data = extra_data or {}
    txn_id = str(uuid4())
    txn = {
        "id": txn_id,
        "transaction_id": txn_result.get("transaction_id", ""),
        "type": txn_type,
        "amount": txn_result.get("amount", 0),
        "status": "settled" if txn_result.get("success") else "declined",
        "payment_method": "credit_card",
        "card_type": txn_result.get("account_type"),
        "last_four": txn_result.get("account_number", "")[-4:] if txn_result.get("account_number") else None,
        "client_name": data.get("client_name"),
        "client_email": data.get("client_email"),
        "client_id": data.get("client_id"),
        "client_type": data.get("client_type", "other"),
        "invoice_number": data.get("invoice_number"),
        "description": data.get("description"),
        "avs_result": txn_result.get("avs_result"),
        "cvv_result": txn_result.get("cvv_result"),
        "auth_code": txn_result.get("auth_code"),
        "response_code": txn_result.get("response_code"),
        "network_trans_id": txn_result.get("network_trans_id"),
        "is_chargeback": False,
        "chargeback_amount": 0,
        "chargeback_date": None,
        "chargeback_reason": None,
        "refund_history": [],
        "total_refunded": 0,
        "credits_issued": [],
        "total_credits": 0,
        "original_transaction_id": data.get("original_transaction_id"),
        "created_by_id": user["id"] if user else None,
        "created_by_name": (user.get("full_name") or user.get("name")) if user else None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.authorizenet_transactions.insert_one(txn)
    txn.pop("_id", None)

    # Also create revenue_record for dashboard
    revenue_amount = txn["amount"]
    if txn_type in ("chargeback", "refund"):
        revenue_amount = -abs(txn["amount"])
    elif txn_type == "void":
        revenue_amount = 0

    if txn_type not in ("void", "auth_only"):
        revenue_record = {
            "id": str(uuid4()),
            "source": "authorizenet",
            "category": txn_type,
            "amount": revenue_amount,
            "description": f"Authorize.net {txn_type}: {data.get('description', '')}",
            "reference_id": txn_result.get("transaction_id"),
            "reference_type": "authorizenet_transaction",
            "payment_status": "paid" if txn["status"] == "settled" else txn["status"],
            "payment_method": "credit_card",
            "client_type": data.get("client_type", "other"),
            "client_name": data.get("client_name"),
            "payment_date": datetime.now(timezone.utc).isoformat(),
            "created_by_id": user["id"] if user else None,
            "created_by_name": (user.get("full_name") or user.get("name")) if user else None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.revenue_records.insert_one(revenue_record)

    return txn


# ==================== PAYMENT PROCESSING ====================

@authorizenet_router.post("/charge")
async def charge_card(data: dict, authorization: Optional[str] = Header(None)):
    """
    Process a live credit card charge.
    Body: { amount, card_number, expiration_date, card_code, client_name, client_type,
            client_email?, client_id?, description?, invoice_number?,
            bill_to?: { first_name, last_name, address, city, state, zip } }
    """
    user = await get_current_user(authorization)
    require_admin(user)

    for field in ["amount", "card_number", "expiration_date", "card_code"]:
        if not data.get(field):
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

    if not data.get("client_type"):
        raise HTTPException(status_code=400, detail="Client type is required")

    try:
        result = anet.charge_credit_card(
            amount=data["amount"],
            card_number=data["card_number"],
            expiration_date=data["expiration_date"],
            card_code=data["card_code"],
            order_description=data.get("description"),
            invoice_number=data.get("invoice_number"),
            customer_email=data.get("client_email"),
            customer_id=data.get("client_id"),
            bill_to=data.get("bill_to")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment gateway error: {str(e)}")

    if result.get("success"):
        await _record_transaction(result, "payment", user, data)

    return result


@authorizenet_router.post("/authorize")
async def authorize_card(data: dict, authorization: Optional[str] = Header(None)):
    """Auth-only transaction (hold funds, capture later)."""
    user = await get_current_user(authorization)
    require_admin(user)

    for field in ["amount", "card_number", "expiration_date", "card_code"]:
        if not data.get(field):
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

    try:
        result = anet.authorize_only(
            amount=data["amount"],
            card_number=data["card_number"],
            expiration_date=data["expiration_date"],
            card_code=data["card_code"],
            order_description=data.get("description"),
            invoice_number=data.get("invoice_number"),
            customer_email=data.get("client_email")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gateway error: {str(e)}")

    if result.get("success"):
        await _record_transaction(result, "auth_only", user, data)

    return result


@authorizenet_router.post("/capture/{transaction_id}")
async def capture_transaction(transaction_id: str, data: dict = None, authorization: Optional[str] = Header(None)):
    """Capture a previously authorized transaction."""
    user = await get_current_user(authorization)
    require_admin(user)

    data = data or {}
    try:
        result = anet.capture_authorized(transaction_id, amount=data.get("amount"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gateway error: {str(e)}")

    if result.get("success"):
        await _record_transaction(result, "payment", user, {"description": f"Capture of auth {transaction_id}"})

    return result


@authorizenet_router.post("/void/{transaction_id}")
async def void_txn(transaction_id: str, authorization: Optional[str] = Header(None)):
    """Void an unsettled transaction."""
    user = await get_current_user(authorization)
    require_admin(user)

    try:
        result = anet.void_transaction(transaction_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gateway error: {str(e)}")

    if result.get("success"):
        await _record_transaction(result, "void", user, {"description": f"Void of {transaction_id}"})
        # Update original transaction status
        await db.authorizenet_transactions.update_one(
            {"transaction_id": transaction_id},
            {"$set": {"status": "voided", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )

    return result


# ==================== REFUND MANAGEMENT ====================

@authorizenet_router.post("/refund")
async def refund_transaction(data: dict, authorization: Optional[str] = Header(None)):
    """
    Process a refund. Supports: full, partial, percentage, custom.
    Body: { transaction_id, refund_type: "full"|"partial"|"percentage"|"custom",
            amount?: number, percentage?: number, card_number_last_four, expiration_date,
            reason?, client_name? }
    """
    user = await get_current_user(authorization)
    require_admin(user)

    for field in ["transaction_id", "refund_type", "card_number_last_four", "expiration_date"]:
        if not data.get(field):
            raise HTTPException(status_code=400, detail=f"Missing: {field}")

    # Get the original transaction to calculate refund amount
    orig = await db.authorizenet_transactions.find_one(
        {"transaction_id": data["transaction_id"]}, {"_id": 0}
    )
    if not orig:
        raise HTTPException(status_code=404, detail="Original transaction not found in local records")

    original_amount = orig.get("amount", 0)
    already_refunded = orig.get("total_refunded", 0)
    available = original_amount - already_refunded

    refund_type = data["refund_type"]
    if refund_type == "full":
        refund_amount = available
    elif refund_type == "partial":
        refund_amount = float(data.get("amount", 0))
    elif refund_type == "percentage":
        pct = float(data.get("percentage", 0))
        if pct <= 0 or pct > 100:
            raise HTTPException(status_code=400, detail="Percentage must be 1-100")
        refund_amount = round(original_amount * (pct / 100), 2)
    elif refund_type == "custom":
        refund_amount = float(data.get("amount", 0))
    else:
        raise HTTPException(status_code=400, detail="Invalid refund_type")

    if refund_amount <= 0:
        raise HTTPException(status_code=400, detail="Refund amount must be positive")
    if refund_amount > available:
        raise HTTPException(status_code=400, detail=f"Refund ${refund_amount} exceeds available ${available}")

    try:
        result = anet.refund_transaction(
            transaction_id=data["transaction_id"],
            amount=refund_amount,
            card_number_last_four=data["card_number_last_four"],
            expiration_date=data["expiration_date"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gateway error: {str(e)}")

    if result.get("success"):
        refund_entry = {
            "refund_id": str(uuid4()),
            "refund_type": refund_type,
            "amount": refund_amount,
            "percentage": data.get("percentage"),
            "reason": data.get("reason", ""),
            "refund_transaction_id": result.get("transaction_id"),
            "processed_by": (user.get("full_name") or user.get("name")) if user else None,
            "processed_at": datetime.now(timezone.utc).isoformat()
        }
        await db.authorizenet_transactions.update_one(
            {"transaction_id": data["transaction_id"]},
            {
                "$push": {"refund_history": refund_entry},
                "$inc": {"total_refunded": refund_amount},
                "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
            }
        )
        await _record_transaction(result, "refund", user, {
            "description": f"{refund_type} refund: ${refund_amount}",
            "client_name": data.get("client_name") or orig.get("client_name"),
            "client_type": orig.get("client_type"),
            "original_transaction_id": data["transaction_id"]
        })

    result["refund_amount"] = refund_amount
    result["refund_type"] = refund_type

    # Send email notification
    if result.get("success"):
        try:
            notify_refund(
                transaction_id=data["transaction_id"],
                amount=refund_amount,
                refund_type=refund_type,
                client_name=data.get("client_name") or orig.get("client_name", ""),
                reason=data.get("reason", ""),
                processed_by=(user.get("full_name") or user.get("name", "")) if user else ""
            )
        except Exception:
            pass

    return result


# ==================== CREDITS ====================

@authorizenet_router.post("/credit")
async def issue_credit(data: dict, authorization: Optional[str] = Header(None)):
    """
    Issue a credit (account credit, not tied to a specific transaction).
    Body: { client_name, client_type, amount, reason, client_id?, client_email? }
    """
    user = await get_current_user(authorization)
    require_admin(user)

    for field in ["client_name", "amount", "reason"]:
        if not data.get(field):
            raise HTTPException(status_code=400, detail=f"Missing: {field}")

    credit = {
        "id": str(uuid4()),
        "type": "credit",
        "amount": float(data["amount"]),
        "client_name": data["client_name"],
        "client_type": data.get("client_type", "other"),
        "client_id": data.get("client_id"),
        "client_email": data.get("client_email"),
        "reason": data["reason"],
        "status": "issued",
        "issued_by_id": user["id"] if user else None,
        "issued_by_name": (user.get("full_name") or user.get("name")) if user else None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.client_credits.insert_one(credit)
    credit.pop("_id", None)

    # Also record as negative revenue
    revenue_record = {
        "id": str(uuid4()),
        "source": "authorizenet",
        "category": "credit",
        "amount": -abs(float(data["amount"])),
        "description": f"Credit issued to {data['client_name']}: {data['reason']}",
        "reference_id": credit["id"],
        "reference_type": "client_credit",
        "payment_status": "credit",
        "client_type": data.get("client_type", "other"),
        "client_name": data["client_name"],
        "payment_date": datetime.now(timezone.utc).isoformat(),
        "created_by_id": user["id"] if user else None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.revenue_records.insert_one(revenue_record)

    return credit


@authorizenet_router.get("/credits")
async def list_credits(
    authorization: Optional[str] = Header(None),
    client_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """List issued credits."""
    user = await get_current_user(authorization)
    require_admin(user)

    query = {}
    if client_type:
        query["client_type"] = client_type

    credits = await db.client_credits.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(None)
    total = await db.client_credits.count_documents(query)
    return {"credits": credits, "total": total}


# ==================== CHARGEBACK MANAGEMENT ====================

@authorizenet_router.post("/chargeback")
async def record_chargeback(data: dict, authorization: Optional[str] = Header(None)):
    """
    Record a chargeback on a transaction.
    Body: { transaction_id, chargeback_amount, reason, chargeback_date? }
    """
    user = await get_current_user(authorization)
    require_admin(user)

    for field in ["transaction_id", "chargeback_amount", "reason"]:
        if not data.get(field):
            raise HTTPException(status_code=400, detail=f"Missing: {field}")

    cb_date = data.get("chargeback_date", datetime.now(timezone.utc).isoformat())

    result = await db.authorizenet_transactions.update_one(
        {"transaction_id": data["transaction_id"]},
        {"$set": {
            "is_chargeback": True,
            "chargeback_amount": float(data["chargeback_amount"]),
            "chargeback_date": cb_date,
            "chargeback_reason": data["reason"],
            "status": "chargeback",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Record negative revenue
    revenue_record = {
        "id": str(uuid4()),
        "source": "authorizenet",
        "category": "chargeback",
        "amount": -abs(float(data["chargeback_amount"])),
        "description": f"Chargeback: {data['reason']}",
        "reference_id": data["transaction_id"],
        "reference_type": "chargeback",
        "payment_status": "chargeback",
        "payment_date": cb_date,
        "created_by_id": user["id"] if user else None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.revenue_records.insert_one(revenue_record)

    # Send email notification
    try:
        orig = await db.authorizenet_transactions.find_one({"transaction_id": data["transaction_id"]}, {"_id": 0})
        notify_chargeback(
            transaction_id=data["transaction_id"],
            amount=float(data["chargeback_amount"]),
            client_name=orig.get("client_name", "") if orig else "",
            reason=data["reason"],
            recorded_by=(user.get("full_name") or user.get("name", "")) if user else ""
        )
    except Exception:
        pass

    return {"message": "Chargeback recorded", "transaction_id": data["transaction_id"]}


@authorizenet_router.get("/chargebacks")
async def list_chargebacks(authorization: Optional[str] = Header(None)):
    """List all chargebacks."""
    user = await get_current_user(authorization)
    require_admin(user)

    chargebacks = await db.authorizenet_transactions.find(
        {"is_chargeback": True}, {"_id": 0}
    ).sort("chargeback_date", -1).to_list(None)
    total_amount = sum(c.get("chargeback_amount", 0) for c in chargebacks)

    return {"chargebacks": chargebacks, "total_count": len(chargebacks), "total_amount": total_amount}


# ==================== TRANSACTION SYNC ====================

_sync_status = {"running": False, "progress": "", "result": None}


async def _do_sync(start, end):
    """Background sync worker."""
    global _sync_status
    _sync_status = {"running": True, "progress": "Fetching batches...", "result": None}

    all_batches = []
    chunk_start = start
    while chunk_start < end:
        chunk_end = min(chunk_start + timedelta(days=30), end)
        try:
            batch_result = anet.get_settled_batch_list(start_date=chunk_start, end_date=chunk_end)
            if batch_result.get("success"):
                all_batches.extend(batch_result.get("batches", []))
        except Exception as e:
            logger.error(f"Batch fetch error: {e}")
        chunk_start = chunk_end + timedelta(seconds=1)

    _sync_status["progress"] = f"Found {len(all_batches)} batches. Syncing transactions..."

    total_synced = 0
    total_skipped = 0
    errors = []

    for i, batch in enumerate(all_batches):
        batch_id = batch["batch_id"]
        _sync_status["progress"] = f"Processing batch {i+1}/{len(all_batches)} ({total_synced} synced)"
        try:
            txn_list = anet.get_transaction_list(batch_id)
            if not txn_list.get("success"):
                errors.append(f"Batch {batch_id}: {txn_list.get('error_message')}")
                continue

            for txn in txn_list.get("transactions", []):
                tid = txn["transaction_id"]
                exists = await db.authorizenet_transactions.find_one({"transaction_id": tid})
                if exists:
                    total_skipped += 1
                    continue

                client_name = ""
                if txn.get("first_name") or txn.get("last_name"):
                    client_name = f"{txn.get('first_name', '')} {txn.get('last_name', '')}".strip()

                status = txn.get("transaction_status", "unknown")
                txn_type = "payment"
                if "refund" in status.lower():
                    txn_type = "refund"
                elif "void" in status.lower():
                    txn_type = "void"
                elif "decline" in status.lower():
                    txn_type = "declined"
                elif "chargeback" in status.lower() or txn.get("has_returned_items"):
                    txn_type = "chargeback"

                record = {
                    "id": str(uuid4()),
                    "transaction_id": tid,
                    "type": txn_type,
                    "amount": txn.get("settle_amount", 0),
                    "status": status,
                    "payment_method": "credit_card",
                    "card_type": txn.get("account_type"),
                    "last_four": txn.get("account_number", "")[-4:] if txn.get("account_number") else None,
                    "client_name": client_name or None,
                    "client_email": None,
                    "client_type": "current_client",
                    "invoice_number": txn.get("invoice_number"),
                    "description": None,
                    "batch_id": batch_id,
                    "settlement_time": batch.get("settlement_time"),
                    "submit_time": txn.get("submit_time"),
                    "is_chargeback": txn_type == "chargeback",
                    "chargeback_amount": txn.get("settle_amount", 0) if txn_type == "chargeback" else 0,
                    "refund_history": [],
                    "total_refunded": 0,
                    "credits_issued": [],
                    "total_credits": 0,
                    "synced_from_gateway": True,
                    "created_at": txn.get("submit_time", datetime.now(timezone.utc).isoformat()),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
                await db.authorizenet_transactions.insert_one(record)
                record.pop("_id", None)
                total_synced += 1

        except Exception as e:
            errors.append(f"Batch {batch_id}: {str(e)}")

    _sync_status = {
        "running": False,
        "progress": "Complete",
        "result": {
            "success": True,
            "total_synced": total_synced,
            "total_skipped": total_skipped,
            "total_batches": len(all_batches),
            "errors": errors[:10] if errors else []
        }
    }


@authorizenet_router.post("/sync-transactions")
async def sync_transactions(data: dict = None, background_tasks: BackgroundTasks = None, authorization: Optional[str] = Header(None)):
    """Start background sync of Authorize.net transactions."""
    user = await get_current_user(authorization)
    require_admin(user)

    if _sync_status.get("running"):
        return {"message": "Sync already in progress", "status": _sync_status}

    data = data or {}
    if data.get("start_date"):
        start = datetime.fromisoformat(data["start_date"]).replace(tzinfo=timezone.utc)
    else:
        start = datetime(2025, 1, 1, tzinfo=timezone.utc)
    end = datetime.now(timezone.utc)

    import asyncio
    asyncio.create_task(_do_sync(start, end))

    return {"message": "Sync started in background. Check /api/authorizenet/sync-status for progress."}


@authorizenet_router.get("/sync-status")
async def sync_status(authorization: Optional[str] = Header(None)):
    """Check sync progress."""
    user = await get_current_user(authorization)
    require_admin(user)
    return _sync_status


# ==================== LOCAL TRANSACTION QUERIES ====================

@authorizenet_router.get("/local-transactions")
async def get_local_transactions(
    authorization: Optional[str] = Header(None),
    client_type: Optional[str] = None,
    txn_type: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """Query locally synced transactions with filters."""
    user = await get_current_user(authorization)
    require_admin(user)

    query = {}
    if client_type:
        query["client_type"] = client_type
    if txn_type:
        query["type"] = txn_type
    if status:
        query["status"] = status
    if search:
        query["$or"] = [
            {"client_name": {"$regex": search, "$options": "i"}},
            {"transaction_id": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"invoice_number": {"$regex": search, "$options": "i"}}
        ]
    if start_date:
        query.setdefault("created_at", {})["$gte"] = start_date
    if end_date:
        query.setdefault("created_at", {})["$lte"] = end_date

    txns = await db.authorizenet_transactions.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(None)
    total = await db.authorizenet_transactions.count_documents(query)

    return {"transactions": txns, "total": total}


@authorizenet_router.get("/transaction/{transaction_id}")
async def get_transaction(transaction_id: str, authorization: Optional[str] = Header(None)):
    """Get transaction details from Authorize.net AND local records."""
    user = await get_current_user(authorization)
    require_admin(user)

    local = await db.authorizenet_transactions.find_one(
        {"transaction_id": transaction_id}, {"_id": 0}
    )

    try:
        live = anet.get_transaction_details(transaction_id)
    except Exception as e:
        live = {"error": str(e)}

    return {"local": local, "live": live}


@authorizenet_router.get("/batches")
async def get_batches(
    authorization: Optional[str] = Header(None),
    days: int = Query(30, ge=1, le=365)
):
    """Get settled batch list from Authorize.net."""
    user = await get_current_user(authorization)
    require_admin(user)

    start = datetime.now(timezone.utc) - timedelta(days=days)
    end = datetime.now(timezone.utc)

    try:
        result = anet.get_settled_batch_list(start_date=start, end_date=end)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gateway error: {str(e)}")

    return result


# ==================== DASHBOARD SUMMARY ====================

@authorizenet_router.get("/dashboard-summary")
async def get_dashboard_summary(
    authorization: Optional[str] = Header(None),
    period: str = Query("month", regex="^(week|month|quarter|year|all)$")
):
    """Comprehensive dashboard metrics from local synced data."""
    user = await get_current_user(authorization)
    require_admin(user)

    now = datetime.now(timezone.utc)
    if period == "week":
        start = (now - timedelta(days=7)).isoformat()
    elif period == "month":
        start = now.replace(day=1).isoformat()
    elif period == "quarter":
        q_month = ((now.month - 1) // 3) * 3 + 1
        start = now.replace(month=q_month, day=1).isoformat()
    elif period == "year":
        start = now.replace(month=1, day=1).isoformat()
    else:
        start = "2020-01-01T00:00:00"

    query = {"created_at": {"$gte": start}}

    all_txns = await db.authorizenet_transactions.find(query, {"_id": 0}).to_list(None)

    payments = [t for t in all_txns if t.get("type") == "payment"]
    refunds = [t for t in all_txns if t.get("type") == "refund"]
    chargebacks = [t for t in all_txns if t.get("is_chargeback")]
    credits = await db.client_credits.find({"created_at": {"$gte": start}}, {"_id": 0}).to_list(None)

    total_payments = sum(t.get("amount", 0) for t in payments)
    total_refunds = sum(t.get("amount", 0) for t in refunds)
    total_chargebacks = sum(t.get("chargeback_amount", 0) for t in chargebacks)
    total_credits_amt = sum(c.get("amount", 0) for c in credits)
    net_revenue = total_payments - total_refunds - total_chargebacks - total_credits_amt

    # By client type
    by_client_type = {}
    for t in payments:
        ct = t.get("client_type", "other")
        if ct not in by_client_type:
            by_client_type[ct] = {"count": 0, "amount": 0, "label": CLIENT_TYPE_LABELS.get(ct, ct)}
        by_client_type[ct]["count"] += 1
        by_client_type[ct]["amount"] += t.get("amount", 0)

    return {
        "period": period,
        "total_transactions": len(all_txns),
        "total_payments": round(total_payments, 2),
        "payment_count": len(payments),
        "total_refunds": round(total_refunds, 2),
        "refund_count": len(refunds),
        "total_chargebacks": round(total_chargebacks, 2),
        "chargeback_count": len(chargebacks),
        "total_credits": round(total_credits_amt, 2),
        "credit_count": len(credits),
        "net_revenue": round(net_revenue, 2),
        "by_client_type": by_client_type
    }


# ==================== CLIENT TYPES & HEALTH ====================

@authorizenet_router.get("/client-types")
async def get_client_types():
    """Get available client types."""
    return [{"value": v, "label": CLIENT_TYPE_LABELS[v]} for v in CLIENT_TYPES]


@authorizenet_router.get("/health")
async def health_check():
    """Verify credentials are configured."""
    has_login = bool(os.environ.get("AUTHORIZENET_API_LOGIN_ID"))
    has_key = bool(os.environ.get("AUTHORIZENET_TRANSACTION_KEY"))
    env = os.environ.get("AUTHORIZENET_ENV", "production")
    return {
        "configured": has_login and has_key,
        "environment": env,
        "api_login_id_set": has_login,
        "transaction_key_set": has_key
    }
