"""
Merger Workflow API — Task management, verification, cancellation, overview.
All endpoints under /api/cpr/ prefix.
"""
import os
import uuid
import json
import shutil
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Header, UploadFile, File
import jwt

merger_router = APIRouter()
db = None
PARTNER_JWT_SECRET = os.environ.get("JWT_SECRET_KEY", "your-secret-key-change-in-production-credlocity-2025") + "-partners"

VALID_TASKS = [
    "id_uploaded", "ssn_uploaded", "proof_of_address_uploaded",
    "scorefusion_ordered", "notary_invoice_sent", "notary_payment_received",
    "notary_completed", "disputes_sent"
]
SHAR_TASKS = VALID_TASKS[:7]  # Tasks 1-7


def set_db(database):
    global db
    db = database


def verify_partner(authorization: str):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Partner authentication required")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, PARTNER_JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def is_master(partner):
    # Check both 'role' and 'partner_role' for compatibility with JWT payload
    return partner.get("role") == "master_partner" or partner.get("partner_role") == "master_partner"


def remove_id(doc):
    if doc and "_id" in doc:
        del doc["_id"]
    return doc


def calc_merger_status(client):
    tasks = client.get("tasks", {})
    completed = sum(1 for t in VALID_TASKS if tasks.get(t, {}).get("complete", False))
    canceled = client.get("canceled", False)
    shar_confirmed = client.get("shar_confirmed", False)
    joe_verified = client.get("joe_verified", False)

    if canceled:
        return "canceled", completed
    if joe_verified and shar_confirmed and completed == 8:
        return "fully_merged", completed
    if shar_confirmed and completed >= 7 and not tasks.get("disputes_sent", {}).get("complete"):
        return "waiting_disputes", completed
    if completed == 8 and shar_confirmed:
        return "waiting_verification", completed
    if completed > 0:
        return "in_progress", completed
    return "not_started", completed


async def update_client_status(client_id: str):
    client = await db.cpr_clients.find_one({"id": client_id})
    if not client:
        return None
    status, count = calc_merger_status(client)
    await db.cpr_clients.update_one(
        {"id": client_id},
        {"$set": {
            "merger_status": status,
            "tasks_completed_count": count,
            "merger_progress_pct": round(count / 8 * 100, 1),
        }}
    )
    return status


async def log_task_action(client, task_name, action, performed_by, prev_val, new_val, notes=None):
    await db.merger_task_log.insert_one({
        "id": str(uuid.uuid4()),
        "client_id": client.get("id"),
        "client_name": client.get("full_name"),
        "client_category": client.get("category"),
        "task_name": task_name,
        "action": action,
        "performed_by": performed_by,
        "performed_at": datetime.now(timezone.utc).isoformat(),
        "previous_value": json.dumps(prev_val) if prev_val else None,
        "new_value": json.dumps(new_val) if new_val else None,
        "notes": notes,
    })


# === TASK COMPLETION ===
@merger_router.post("/api/cpr/clients/{client_id}/tasks/{task_name}/complete")
async def complete_task(client_id: str, task_name: str, data: dict, authorization: str = Header(None)):
    partner = verify_partner(authorization)
    if task_name not in VALID_TASKS:
        raise HTTPException(status_code=400, detail=f"Invalid task: {task_name}")

    # Task 8 (disputes_sent) is Joeziel only
    if task_name == "disputes_sent" and not is_master(partner):
        raise HTTPException(status_code=403, detail="Only Joeziel can complete the disputes task")

    # Non-master can only do tasks 1-7
    if task_name not in SHAR_TASKS and not is_master(partner):
        raise HTTPException(status_code=403, detail="You do not have permission to complete this task")

    client = await db.cpr_clients.find_one({"id": client_id})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    tasks = client.get("tasks", {})
    prev_val = tasks.get(task_name, {})

    now = datetime.now(timezone.utc).isoformat()
    completed_by = partner.get("display_name", partner.get("sub", "unknown"))

    task_update = {
        "complete": True,
        "completed_date": data.get("completed_date", now),
        "completed_by": completed_by,
    }

    # Add task-specific fields
    if task_name in ("id_uploaded", "ssn_uploaded", "proof_of_address_uploaded"):
        task_update["file_url"] = data.get("file_url")
        task_update["file_name"] = data.get("file_name")
    elif task_name == "scorefusion_ordered":
        task_update["confirmation_number"] = data.get("confirmation_number")
    elif task_name == "notary_invoice_sent":
        task_update["invoice_amount"] = data.get("invoice_amount")
        task_update["invoice_notes"] = data.get("invoice_notes")
    elif task_name == "notary_payment_received":
        task_update["amount_paid"] = data.get("amount_paid")
        task_update["payment_method"] = data.get("payment_method")
    elif task_name == "notary_completed":
        task_update["notary_provider"] = data.get("notary_provider")
    elif task_name == "disputes_sent":
        task_update["dispute_round"] = data.get("dispute_round", 1)
        task_update["notes"] = data.get("notes")

    update_doc = {f"tasks.{task_name}": task_update, "last_task_activity": now, "updated_at": now}
    await db.cpr_clients.update_one({"id": client_id}, {"$set": update_doc})
    await log_task_action(client, task_name, "completed", completed_by, prev_val, task_update, data.get("notes"))
    status = await update_client_status(client_id)

    updated = await db.cpr_clients.find_one({"id": client_id}, {"_id": 0})
    return {"message": f"Task '{task_name}' completed", "merger_status": status, "client": updated}


# === TASK UNDO (master only) ===
@merger_router.post("/api/cpr/clients/{client_id}/tasks/{task_name}/undo")
async def undo_task(client_id: str, task_name: str, authorization: str = Header(None)):
    partner = verify_partner(authorization)
    if not is_master(partner):
        raise HTTPException(status_code=403, detail="Only master admin can undo tasks")
    if task_name not in VALID_TASKS:
        raise HTTPException(status_code=400, detail=f"Invalid task: {task_name}")

    client = await db.cpr_clients.find_one({"id": client_id})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    tasks = client.get("tasks", {})
    prev_val = tasks.get(task_name, {})

    default = {"complete": False, "completed_date": None, "completed_by": None}
    if task_name in ("id_uploaded", "ssn_uploaded", "proof_of_address_uploaded"):
        default.update({"file_url": None, "file_name": None})
    elif task_name == "scorefusion_ordered":
        default["confirmation_number"] = None
    elif task_name == "notary_invoice_sent":
        default.update({"invoice_amount": None, "invoice_notes": None})
    elif task_name == "notary_payment_received":
        default.update({"amount_paid": None, "payment_method": None})
    elif task_name == "notary_completed":
        default["notary_provider"] = None
    elif task_name == "disputes_sent":
        default.update({"dispute_round": None, "notes": None})

    now = datetime.now(timezone.utc).isoformat()
    await db.cpr_clients.update_one(
        {"id": client_id},
        {"$set": {f"tasks.{task_name}": default, "last_task_activity": now, "updated_at": now}}
    )
    performed_by = partner.get("display_name", partner.get("sub", "unknown"))
    await log_task_action(client, task_name, "undone", performed_by, prev_val, default)
    status = await update_client_status(client_id)
    updated = await db.cpr_clients.find_one({"id": client_id}, {"_id": 0})
    return {"message": f"Task '{task_name}' undone", "merger_status": status, "client": updated}


# === GET TASKS ===
@merger_router.get("/api/cpr/clients/{client_id}/tasks")
async def get_tasks(client_id: str, authorization: str = Header(None)):
    verify_partner(authorization)
    client = await db.cpr_clients.find_one({"id": client_id}, {"_id": 0, "tasks": 1, "tasks_completed_count": 1, "merger_status": 1, "merger_progress_pct": 1, "full_name": 1})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


# === FILE UPLOAD FOR TASKS ===
@merger_router.post("/api/cpr/clients/{client_id}/tasks/{task_name}/upload")
async def upload_task_file(client_id: str, task_name: str, file: UploadFile = File(...), authorization: str = Header(None)):
    verify_partner(authorization)
    if task_name not in ("id_uploaded", "ssn_uploaded", "proof_of_address_uploaded"):
        raise HTTPException(status_code=400, detail="File upload only for document tasks")

    client = await db.cpr_clients.find_one({"id": client_id})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    upload_dir = f"/app/backend/uploads/merger_docs/{client_id}/{task_name}"
    os.makedirs(upload_dir, exist_ok=True)
    file_ext = os.path.splitext(file.filename)[1] if file.filename else ".bin"
    saved_name = f"{task_name}_{uuid.uuid4().hex[:8]}{file_ext}"
    file_path = os.path.join(upload_dir, saved_name)

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    file_url = f"/api/cpr/uploads/merger_docs/{client_id}/{task_name}/{saved_name}"
    return {"file_url": file_url, "file_name": file.filename}


# === SHAR CONFIRM ===
@merger_router.post("/api/cpr/clients/{client_id}/shar-confirm")
async def shar_confirm(client_id: str, data: dict, authorization: str = Header(None)):
    partner = verify_partner(authorization)
    # Only Shar (non-master) can confirm
    if is_master(partner):
        raise HTTPException(status_code=403, detail="Only Shar can confirm accounts")

    if data.get("confirmation_text") != "CONFIRM":
        raise HTTPException(status_code=400, detail="You must type 'CONFIRM' to proceed")

    client = await db.cpr_clients.find_one({"id": client_id})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    tasks = client.get("tasks", {})
    shar_complete = all(tasks.get(t, {}).get("complete", False) for t in SHAR_TASKS)
    if not shar_complete:
        raise HTTPException(status_code=400, detail="Tasks 1-7 must be complete before confirming")

    now = datetime.now(timezone.utc).isoformat()
    await db.cpr_clients.update_one(
        {"id": client_id},
        {"$set": {"shar_confirmed": True, "shar_confirmed_date": now, "last_task_activity": now, "updated_at": now}}
    )
    status = await update_client_status(client_id)
    updated = await db.cpr_clients.find_one({"id": client_id}, {"_id": 0})
    return {"message": "Account confirmed by Shar", "merger_status": status, "client": updated}


# === JOE VERIFY ===
@merger_router.post("/api/cpr/clients/{client_id}/joe-verify")
async def joe_verify(client_id: str, data: dict, authorization: str = Header(None)):
    partner = verify_partner(authorization)
    if not is_master(partner):
        raise HTTPException(status_code=403, detail="Only Joeziel can verify accounts")

    if data.get("verification_text") != "VERIFIED":
        raise HTTPException(status_code=400, detail="You must type 'VERIFIED' to proceed")

    client = await db.cpr_clients.find_one({"id": client_id})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    tasks = client.get("tasks", {})
    all_complete = all(tasks.get(t, {}).get("complete", False) for t in VALID_TASKS)
    if not all_complete:
        raise HTTPException(status_code=400, detail="All 8 tasks must be complete before verifying")
    if not client.get("shar_confirmed"):
        raise HTTPException(status_code=400, detail="Shar must confirm before Joeziel can verify")

    now = datetime.now(timezone.utc).isoformat()
    await db.cpr_clients.update_one(
        {"id": client_id},
        {"$set": {
            "joe_verified": True, "joe_verified_date": now,
            "merger_status": "fully_merged", "merger_completed_date": now,
            "tasks_completed_count": 8, "merger_progress_pct": 100.0,
            "last_task_activity": now, "updated_at": now,
        }}
    )
    updated = await db.cpr_clients.find_one({"id": client_id}, {"_id": 0})
    return {"message": "Account verified — FULLY MERGED", "merger_status": "fully_merged", "client": updated}


# === CANCEL ===
@merger_router.post("/api/cpr/clients/{client_id}/cancel")
async def cancel_client(client_id: str, data: dict, authorization: str = Header(None)):
    partner = verify_partner(authorization)
    reason = data.get("cancellation_reason", "").strip()
    if not reason:
        raise HTTPException(status_code=400, detail="Cancellation reason is required")

    client = await db.cpr_clients.find_one({"id": client_id})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    now = datetime.now(timezone.utc).isoformat()
    canceled_by = partner.get("display_name", partner.get("sub", "unknown"))
    await db.cpr_clients.update_one(
        {"id": client_id},
        {"$set": {
            "canceled": True, "canceled_date": now,
            "canceled_by": canceled_by, "cancellation_reason": reason,
            "merger_status": "canceled", "last_task_activity": now, "updated_at": now,
        }}
    )
    await log_task_action(client, "cancellation", "canceled", canceled_by, None, {"reason": reason})
    updated = await db.cpr_clients.find_one({"id": client_id}, {"_id": 0})
    return {"message": "Client canceled", "client": updated}


# === REOPEN ===
@merger_router.post("/api/cpr/clients/{client_id}/reopen")
async def reopen_client(client_id: str, data: dict, authorization: str = Header(None)):
    partner = verify_partner(authorization)
    if not is_master(partner):
        raise HTTPException(status_code=403, detail="Only master admin can reopen canceled clients")

    client = await db.cpr_clients.find_one({"id": client_id})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    now = datetime.now(timezone.utc).isoformat()
    await db.cpr_clients.update_one(
        {"id": client_id},
        {"$set": {
            "canceled": False, "canceled_date": None,
            "canceled_by": None, "cancellation_reason": None,
            "last_task_activity": now, "updated_at": now,
        }}
    )
    status = await update_client_status(client_id)
    updated = await db.cpr_clients.find_one({"id": client_id}, {"_id": 0})
    return {"message": "Client reopened", "merger_status": status, "client": updated}


# === MERGER OVERVIEW ===
@merger_router.get("/api/cpr/merger-overview")
async def merger_overview(authorization: str = Header(None)):
    verify_partner(authorization)
    pipeline = [
        {"$group": {
            "_id": {"category": "$category", "status": "$merger_status"},
            "count": {"$sum": 1}
        }}
    ]
    results = await db.cpr_clients.aggregate(pipeline).to_list(100)

    categories = {}
    for r in results:
        cat = r["_id"]["category"]
        st = r["_id"]["status"] or "not_started"
        if cat not in categories:
            categories[cat] = {"total": 0, "fully_merged": 0, "in_progress": 0, "not_started": 0, "canceled": 0, "waiting_disputes": 0, "waiting_verification": 0}
        categories[cat]["total"] += r["count"]
        if st in categories[cat]:
            categories[cat][st] += r["count"]
        else:
            categories[cat]["in_progress"] += r["count"]

    totals = {"total": 0, "fully_merged": 0, "in_progress": 0, "not_started": 0, "canceled": 0, "waiting_disputes": 0, "waiting_verification": 0}
    for cat_data in categories.values():
        for k in totals:
            totals[k] += cat_data.get(k, 0)

    return {"categories": categories, "totals": totals}


# === READY FOR DISPUTES ===
@merger_router.get("/api/cpr/ready-for-disputes")
async def ready_for_disputes(authorization: str = Header(None)):
    partner = verify_partner(authorization)
    if not is_master(partner):
        raise HTTPException(status_code=403, detail="Master admin only")

    clients = await db.cpr_clients.find({
        "shar_confirmed": True,
        "tasks.disputes_sent.complete": False,
        "canceled": {"$ne": True},
    }, {"_id": 0}).to_list(200)

    # Filter to only those with tasks 1-7 complete
    ready = []
    for c in clients:
        tasks = c.get("tasks", {})
        if all(tasks.get(t, {}).get("complete", False) for t in SHAR_TASKS):
            ready.append(c)

    return {"clients": ready, "count": len(ready)}


# === OVERDUE ===
@merger_router.get("/api/cpr/overdue")
async def get_overdue(authorization: str = Header(None)):
    verify_partner(authorization)
    cutoff = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()

    clients = await db.cpr_clients.find({
        "merger_status": {"$nin": ["fully_merged", "canceled"]},
        "$or": [
            {"last_task_activity": {"$lt": cutoff}},
            {"last_task_activity": None},
        ]
    }, {"_id": 0}).to_list(200)

    return {"clients": clients, "count": len(clients)}


# === TASK LOG ===
@merger_router.get("/api/cpr/clients/{client_id}/task-log")
async def get_client_task_log(client_id: str, authorization: str = Header(None)):
    verify_partner(authorization)
    logs = await db.merger_task_log.find(
        {"client_id": client_id}, {"_id": 0}
    ).sort("performed_at", -1).to_list(500)
    return {"logs": logs}


@merger_router.get("/api/cpr/task-log")
async def get_all_task_log(authorization: str = Header(None)):
    partner = verify_partner(authorization)
    if not is_master(partner):
        raise HTTPException(status_code=403, detail="Master admin only")
    logs = await db.merger_task_log.find({}, {"_id": 0}).sort("performed_at", -1).to_list(1000)
    return {"logs": logs}
