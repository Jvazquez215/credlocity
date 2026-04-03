"""
Bug Ticket System API — CRUD + file uploads for partner-reported bugs.
"""
import os
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Header, UploadFile, File
import jwt

tickets_router = APIRouter()
db = None
PARTNER_JWT_SECRET = os.environ.get("JWT_SECRET_KEY", "your-secret-key-change-in-production-credlocity-2025") + "-partners"


def set_db(database):
    global db
    db = database


def verify_auth(authorization: str):
    """Accept partner JWT (CPR), admin JWT, outsourcing partner JWT, or company JWT."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    token = authorization.split(" ", 1)[1]
    # Try CPR partner JWT first (uses -partners suffix)
    try:
        payload = jwt.decode(token, PARTNER_JWT_SECRET, algorithms=["HS256"])
        return {**payload, "auth_type": "partner"}
    except jwt.InvalidTokenError:
        pass
    # Try admin / outsourcing / attorney / company JWT (all use base secret)
    admin_secret = os.environ.get("JWT_SECRET_KEY", "your-secret-key-change-in-production-credlocity-2025")
    try:
        payload = jwt.decode(token, admin_secret, algorithms=["HS256"])
        display = payload.get("name", payload.get("company", payload.get("sub", "User")))
        auth_type = "admin" if payload.get("sub") else "portal_user"
        return {**payload, "auth_type": auth_type, "role": "master_partner" if auth_type == "admin" else "user", "display_name": display}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def is_master(user):
    return user.get("role") == "master_partner" or user.get("auth_type") == "admin"


def remove_id(doc):
    if doc and "_id" in doc:
        del doc["_id"]
    return doc


async def next_ticket_number():
    last = await db.bug_tickets.find_one(sort=[("_seq", -1)])
    seq = (last.get("_seq", 0) if last else 0) + 1
    return seq, f"BUG-{seq:03d}"


# === CREATE TICKET ===
@tickets_router.post("/api/tickets")
async def create_ticket(data: dict, authorization: str = Header(None)):
    user = verify_auth(authorization)
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    if not title or not description:
        raise HTTPException(status_code=400, detail="Title and description are required")

    seq, ticket_number = await next_ticket_number()
    now = datetime.now(timezone.utc).isoformat()

    ticket = {
        "id": str(uuid.uuid4()),
        "_seq": seq,
        "ticket_number": ticket_number,
        "title": title[:100],
        "description": description,
        "steps_to_reproduce": data.get("steps_to_reproduce", []),
        "error_message": data.get("error_message"),
        "copy_paste_code": data.get("copy_paste_code"),
        "screenshots": data.get("screenshots", []),
        "category": data.get("category", "other"),
        "severity": data.get("severity", "medium"),
        "status": "open",
        "submitted_by": user.get("display_name", user.get("sub", "unknown")),
        "submitted_at": now,
        "assigned_to": "Joeziel",
        "resolved_at": None,
        "resolution_notes": None,
        "ticket_url": data.get("ticket_url"),
        "browser_info": data.get("browser_info"),
        "portal": data.get("portal", "Unknown"),
    }
    await db.bug_tickets.insert_one(ticket)
    return {"message": f"Bug report {ticket_number} submitted", "ticket_number": ticket_number, "ticket": remove_id(ticket)}


# === LIST TICKETS ===
@tickets_router.get("/api/tickets")
async def list_tickets(authorization: str = Header(None)):
    user = verify_auth(authorization)
    query = {}
    if not is_master(user):
        query["submitted_by"] = user.get("display_name", user.get("sub"))

    tickets = await db.bug_tickets.find(query, {"_id": 0}).sort("submitted_at", -1).to_list(500)
    return {"tickets": tickets, "count": len(tickets)}


# === NOTIFICATION COUNT (admin only) — must be before {ticket_number} route ===
@tickets_router.get("/api/tickets/notifications/count")
async def get_ticket_notification_count(authorization: str = Header(None)):
    user = verify_auth(authorization)
    if not is_master(user):
        return {"open_count": 0}

    open_count = await db.bug_tickets.count_documents({"status": {"$in": ["open", "in_review"]}})
    return {"open_count": open_count}


# === GET TICKET ===
@tickets_router.get("/api/tickets/{ticket_number}")
async def get_ticket(ticket_number: str, authorization: str = Header(None)):
    user = verify_auth(authorization)
    ticket = await db.bug_tickets.find_one({"ticket_number": ticket_number}, {"_id": 0})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if not is_master(user) and ticket.get("submitted_by") != user.get("display_name", user.get("sub")):
        raise HTTPException(status_code=403, detail="Access denied")

    return ticket


# === UPDATE TICKET ===
@tickets_router.put("/api/tickets/{ticket_number}")
async def update_ticket(ticket_number: str, data: dict, authorization: str = Header(None)):
    user = verify_auth(authorization)
    if not is_master(user):
        raise HTTPException(status_code=403, detail="Only master admin can update tickets")

    ticket = await db.bug_tickets.find_one({"ticket_number": ticket_number})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    update = {}
    if "status" in data:
        update["status"] = data["status"]
        if data["status"] == "resolved":
            update["resolved_at"] = datetime.now(timezone.utc).isoformat()
    if "resolution_notes" in data:
        update["resolution_notes"] = data["resolution_notes"]
    if "assigned_to" in data:
        update["assigned_to"] = data["assigned_to"]

    if update:
        await db.bug_tickets.update_one({"ticket_number": ticket_number}, {"$set": update})

    updated = await db.bug_tickets.find_one({"ticket_number": ticket_number}, {"_id": 0})
    return {"message": "Ticket updated", "ticket": updated}


# === UPLOAD SCREENSHOT ===
@tickets_router.post("/api/tickets/{ticket_number}/screenshots")
async def upload_screenshot(ticket_number: str, file: UploadFile = File(...), authorization: str = Header(None)):
    verify_auth(authorization)
    ticket = await db.bug_tickets.find_one({"ticket_number": ticket_number})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    upload_dir = f"/app/backend/uploads/bug_tickets/{ticket_number}"
    os.makedirs(upload_dir, exist_ok=True)
    file_ext = os.path.splitext(file.filename)[1] if file.filename else ".png"
    saved_name = f"screenshot_{uuid.uuid4().hex[:8]}{file_ext}"
    file_path = os.path.join(upload_dir, saved_name)

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    file_url = f"/api/tickets/uploads/{ticket_number}/{saved_name}"
    await db.bug_tickets.update_one(
        {"ticket_number": ticket_number},
        {"$push": {"screenshots": {"url": file_url, "filename": file.filename, "uploaded_at": datetime.now(timezone.utc).isoformat()}}}
    )
    return {"file_url": file_url, "filename": file.filename}


# === DELETE TICKET ===
@tickets_router.delete("/api/tickets/{ticket_number}")
async def delete_ticket(ticket_number: str, authorization: str = Header(None)):
    user = verify_auth(authorization)
    if not is_master(user):
        raise HTTPException(status_code=403, detail="Only master admin can delete tickets")

    result = await db.bug_tickets.delete_one({"ticket_number": ticket_number})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return {"message": f"Ticket {ticket_number} deleted"}
