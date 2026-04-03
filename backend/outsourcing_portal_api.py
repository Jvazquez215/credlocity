"""
Outsourcing Portal API - Client-facing portal for outsourcing partners.
Features: Customer Roster, Round Tracker, Onboarding, Document Vault,
Reports, Referrals, Support Tickets, Announcements, Billing History.
"""
import os
import uuid
from revenue_tracker import log_revenue
import string
import random
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Header, UploadFile, File, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel

portal_router = APIRouter(prefix="/api/outsourcing", tags=["Outsourcing Portal"])

db = None

def set_db(database):
    global db
    db = database


# ============ AUTH HELPER ============

async def get_partner_from_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        from jose import jwt
        SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-secret-key-change-in-production-credlocity-2025")
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        partner_id = payload.get("partner_id")
        if not partner_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        partner = await db.outsourcing_partners.find_one({"id": partner_id}, {"_id": 0, "hashed_password": 0})
        if not partner:
            raise HTTPException(status_code=404, detail="Partner not found")
        return partner
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


async def get_admin_from_token(authorization: str = Header(None)):
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


# ============ CUSTOMER ROSTER ============

@portal_router.post("/customers")
async def create_customer(data: dict, authorization: str = Header(None)):
    partner = await get_partner_from_token(authorization)
    customer = {
        "id": str(uuid.uuid4()),
        "outsourcing_client_id": partner["id"],
        "first_name": data.get("first_name", ""),
        "last_name": data.get("last_name", ""),
        "email": data.get("email", ""),
        "phone": data.get("phone", ""),
        "date_enrolled": data.get("date_enrolled", datetime.now(timezone.utc).strftime("%Y-%m-%d")),
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.outsourcing_customers.insert_one(customer)
    return remove_id(customer)


@portal_router.get("/customers")
async def list_customers(status: Optional[str] = None, search: Optional[str] = None, authorization: str = Header(None)):
    partner = await get_partner_from_token(authorization)
    query = {"outsourcing_client_id": partner["id"]}
    if status and status != "all":
        query["status"] = status
    customers = await db.outsourcing_customers.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    if search:
        s = search.lower()
        customers = [c for c in customers if s in c.get("first_name","").lower() or s in c.get("last_name","").lower() or s in c.get("email","").lower()]
    return customers


@portal_router.get("/customers/{customer_id}")
async def get_customer(customer_id: str, authorization: str = Header(None)):
    partner = await get_partner_from_token(authorization)
    customer = await db.outsourcing_customers.find_one(
        {"id": customer_id, "outsourcing_client_id": partner["id"]}, {"_id": 0}
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Get round history
    rounds = await db.outsourcing_round_history.find(
        {"customer_id": customer_id}, {"_id": 0}
    ).sort("round_number", 1).to_list(100)
    
    # Get documents
    docs = await db.outsourcing_documents.find(
        {"customer_id": customer_id}, {"_id": 0}
    ).sort("uploaded_at", -1).to_list(100)
    
    customer["rounds"] = rounds
    customer["documents"] = docs
    
    # Credit usage stats
    total_rounds = len(rounds)
    total_credits = sum(r.get("credit_deducted", 0) for r in rounds)
    customer["total_rounds"] = total_rounds
    customer["total_credits_spent"] = total_credits
    
    return customer


@portal_router.put("/customers/{customer_id}")
async def update_customer(customer_id: str, data: dict, authorization: str = Header(None)):
    partner = await get_partner_from_token(authorization)
    existing = await db.outsourcing_customers.find_one(
        {"id": customer_id, "outsourcing_client_id": partner["id"]}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    update_fields = {k: v for k, v in data.items() if k not in ["id", "outsourcing_client_id", "created_at"]}
    await db.outsourcing_customers.update_one({"id": customer_id}, {"$set": update_fields})
    updated = await db.outsourcing_customers.find_one({"id": customer_id}, {"_id": 0})
    return updated


@portal_router.delete("/customers/{customer_id}")
async def deactivate_customer(customer_id: str, authorization: str = Header(None)):
    partner = await get_partner_from_token(authorization)
    result = await db.outsourcing_customers.update_one(
        {"id": customer_id, "outsourcing_client_id": partner["id"]},
        {"$set": {"status": "on_hold"}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deactivated", "status": "on_hold"}


# ============ CREDIT RATE CONSTANTS ============

CREDIT_RATES = {
    "bureau": 1.0,              # 1 credit per round (3 letters: EQ, EX, TU)
    "collection_agency": 1.0,   # 1 credit per letter
    "creditor": 0.5,            # 0.5 credit per letter
}

DEFAULT_PRICE_PER_CREDIT = 30.00


# ============ ROUND HISTORY ============

@portal_router.post("/customers/{customer_id}/rounds")
async def create_round(customer_id: str, data: dict, authorization: str = Header(None)):
    """Admin creates round - deducts credits from partner based on letter type"""
    admin = await get_admin_from_token(authorization)

    customer = await db.outsourcing_customers.find_one({"id": customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    client_id = customer["outsourcing_client_id"]
    partner = await db.outsourcing_partners.find_one({"id": client_id}, {"_id": 0})
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    # Determine letter type and credit cost
    letter_type = data.get("letter_type", "bureau")
    if letter_type not in CREDIT_RATES:
        raise HTTPException(status_code=400, detail=f"Invalid letter_type. Must be one of: {list(CREDIT_RATES.keys())}")

    letter_count = int(data.get("letter_count", 1))
    if letter_count < 1:
        letter_count = 1

    if letter_type == "bureau":
        credits_needed = CREDIT_RATES["bureau"]  # Always 1 credit for bureau (3 letters)
    else:
        credits_needed = CREDIT_RATES[letter_type] * letter_count

    current_credits = partner.get("credit_balance", 0)
    if current_credits < credits_needed:
        price_per_credit = partner.get("price_per_credit", DEFAULT_PRICE_PER_CREDIT)
        deficit = credits_needed - current_credits
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient credits. Need {credits_needed} but only {current_credits} remaining. "
                   f"Purchase {deficit} more credits (${deficit * price_per_credit:.2f}) to proceed."
        )

    # Get next round number
    last_round = await db.outsourcing_round_history.find(
        {"customer_id": customer_id}
    ).sort("round_number", -1).limit(1).to_list(1)
    next_round = (last_round[0]["round_number"] + 1) if last_round else 1

    round_entry = {
        "id": str(uuid.uuid4()),
        "outsourcing_client_id": client_id,
        "customer_id": customer_id,
        "round_number": next_round,
        "date_submitted": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "date_processed": None,
        "letter_type": letter_type,
        "letter_count": letter_count if letter_type != "bureau" else 3,
        "credit_deducted": credits_needed,
        "status": "submitted",
        "admin_notes": data.get("admin_notes", ""),
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    await db.outsourcing_round_history.insert_one(round_entry)
    await db.outsourcing_partners.update_one(
        {"id": client_id},
        {"$inc": {"credit_balance": -credits_needed}}
    )

    return remove_id(round_entry)


@portal_router.get("/customers/{customer_id}/rounds")
async def get_rounds(customer_id: str, authorization: str = Header(None)):
    await get_partner_from_token(authorization)
    rounds = await db.outsourcing_round_history.find(
        {"customer_id": customer_id}, {"_id": 0}
    ).sort("round_number", 1).to_list(200)
    return rounds


@portal_router.put("/rounds/{round_id}")
async def update_round(round_id: str, data: dict, authorization: str = Header(None)):
    admin = await get_admin_from_token(authorization)
    update_fields = {}
    if "admin_notes" in data:
        update_fields["admin_notes"] = data["admin_notes"]
    if "status" in data:
        update_fields["status"] = data["status"]
    if "date_processed" in data:
        update_fields["date_processed"] = data["date_processed"]
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.outsourcing_round_history.update_one(
        {"id": round_id}, {"$set": update_fields}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Round not found")
    
    updated = await db.outsourcing_round_history.find_one({"id": round_id}, {"_id": 0})
    return updated


# ============ ONBOARDING ============

@portal_router.post("/onboarding")
async def submit_onboarding(data: dict, authorization: str = Header(None)):
    partner = await get_partner_from_token(authorization)
    submission = {
        "id": str(uuid.uuid4()),
        "outsourcing_client_id": partner["id"],
        "customer_first_name": data.get("customer_first_name", ""),
        "customer_last_name": data.get("customer_last_name", ""),
        "date_of_birth": data.get("date_of_birth", ""),
        "ssn_last_four": data.get("ssn_last_four", ""),
        "current_address": data.get("current_address", {}),
        "email": data.get("email", ""),
        "phone": data.get("phone", ""),
        "bureaus_to_dispute": data.get("bureaus_to_dispute", []),
        "special_notes": data.get("special_notes", ""),
        "authorization_confirmed": data.get("authorization_confirmed", False),
        "submission_status": "received",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.outsourcing_onboarding_submissions.insert_one(submission)
    return remove_id(submission)


@portal_router.get("/onboarding")
async def get_onboarding_submissions(
    status: Optional[str] = None,
    authorization: str = Header(None)
):
    """Get onboarding submissions - admin sees all, partner sees own"""
    try:
        partner = await get_partner_from_token(authorization)
        query = {"outsourcing_client_id": partner["id"]}
        if status:
            query["submission_status"] = status
        submissions = await db.outsourcing_onboarding_submissions.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
        return submissions
    except HTTPException:
        raise


@portal_router.get("/onboarding/admin")
async def get_all_onboarding_submissions(
    status: Optional[str] = None,
    authorization: str = Header(None)
):
    admin = await get_admin_from_token(authorization)
    query = {}
    if status:
        query["submission_status"] = status
    submissions = await db.outsourcing_onboarding_submissions.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return submissions


@portal_router.put("/onboarding/{submission_id}/status")
async def update_onboarding_status(submission_id: str, data: dict, authorization: str = Header(None)):
    admin = await get_admin_from_token(authorization)
    new_status = data.get("status", "")
    if new_status not in ["received", "in_review", "activated"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    submission = await db.outsourcing_onboarding_submissions.find_one({"id": submission_id}, {"_id": 0})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    await db.outsourcing_onboarding_submissions.update_one(
        {"id": submission_id},
        {"$set": {"submission_status": new_status}}
    )
    
    # If activated, create customer in roster
    if new_status == "activated":
        customer = {
            "id": str(uuid.uuid4()),
            "outsourcing_client_id": submission["outsourcing_client_id"],
            "first_name": submission.get("customer_first_name", ""),
            "last_name": submission.get("customer_last_name", ""),
            "email": submission.get("email", ""),
            "phone": submission.get("phone", ""),
            "date_enrolled": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "status": "active",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.outsourcing_customers.insert_one(customer)
    
    return {"message": f"Submission status updated to {new_status}"}


# ============ DOCUMENTS ============

@portal_router.post("/customers/{customer_id}/documents")
async def upload_document(
    customer_id: str,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    authorization: str = Header(None)
):
    partner = await get_partner_from_token(authorization)
    
    customer = await db.outsourcing_customers.find_one(
        {"id": customer_id, "outsourcing_client_id": partner["id"]}
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Validate file type
    allowed = [".pdf", ".jpg", ".jpeg", ".png"]
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="Only PDF, JPG, and PNG files are allowed")
    
    # Check size (10MB)
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File must be under 10MB")
    
    # Store file using object storage
    try:
        from object_storage import put_object
        file_key = f"outsourcing/docs/{customer_id}/{uuid.uuid4()}{ext}"
        file_url = await put_object(file_key, contents, file.content_type)
    except Exception:
        # Fallback: store locally
        upload_dir = "uploads/outsourcing_docs"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, f"{uuid.uuid4()}{ext}")
        with open(file_path, "wb") as f:
            f.write(contents)
        file_url = f"/uploads/outsourcing_docs/{os.path.basename(file_path)}"
    
    doc = {
        "id": str(uuid.uuid4()),
        "outsourcing_client_id": partner["id"],
        "customer_id": customer_id,
        "document_type": document_type,
        "file_url": file_url,
        "file_name": file.filename,
        "file_size": len(contents),
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "uploaded_by": partner["id"]
    }
    await db.outsourcing_documents.insert_one(doc)
    return remove_id(doc)


@portal_router.get("/customers/{customer_id}/documents")
async def list_documents(customer_id: str, authorization: str = Header(None)):
    partner = await get_partner_from_token(authorization)
    docs = await db.outsourcing_documents.find(
        {"customer_id": customer_id, "outsourcing_client_id": partner["id"]}, {"_id": 0}
    ).sort("uploaded_at", -1).to_list(200)
    return docs


@portal_router.delete("/documents/{document_id}")
async def delete_document(document_id: str, authorization: str = Header(None)):
    partner = await get_partner_from_token(authorization)
    result = await db.outsourcing_documents.delete_one(
        {"id": document_id, "outsourcing_client_id": partner["id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document deleted"}


@portal_router.get("/documents/admin")
async def admin_list_all_documents(
    client_id: Optional[str] = None,
    authorization: str = Header(None)
):
    admin = await get_admin_from_token(authorization)
    query = {}
    if client_id:
        query["outsourcing_client_id"] = client_id
    docs = await db.outsourcing_documents.find(query, {"_id": 0}).sort("uploaded_at", -1).to_list(500)
    return docs


# ============ REPORTS ============

@portal_router.get("/reports/monthly")
async def monthly_report(month: Optional[str] = None, authorization: str = Header(None)):
    partner = await get_partner_from_token(authorization)
    client_id = partner["id"]
    
    if not month:
        month = datetime.now(timezone.utc).strftime("%Y-%m")
    
    # Customers active that month
    customers = await db.outsourcing_customers.find(
        {"outsourcing_client_id": client_id}, {"_id": 0}
    ).to_list(500)
    active_customers = [c for c in customers if c.get("status") == "active" or c.get("date_enrolled", "9999") <= month + "-31"]
    
    # Rounds processed that month
    rounds = await db.outsourcing_round_history.find(
        {"outsourcing_client_id": client_id}, {"_id": 0}
    ).to_list(1000)
    month_rounds = [r for r in rounds if r.get("date_submitted", "").startswith(month)]
    
    total_credits_used = sum(r.get("credit_deducted", 0) for r in month_rounds)
    
    # Per-customer breakdown
    customer_breakdown = []
    for c in active_customers:
        c_rounds = [r for r in month_rounds if r.get("customer_id") == c["id"]]
        customer_breakdown.append({
            "customer_name": f"{c.get('first_name', '')} {c.get('last_name', '')}",
            "rounds_processed": len(c_rounds),
            "credits_used": sum(r.get("credit_deducted", 0) for r in c_rounds)
        })
    
    return {
        "month": month,
        "total_customers_active": len(active_customers),
        "total_rounds_processed": len(month_rounds),
        "total_credits_used": total_credits_used,
        "total_credits_purchased": partner.get("total_credits_purchased", 0),
        "customer_breakdown": customer_breakdown
    }


# ============ REFERRALS ============

def generate_referral_code():
    chars = string.ascii_uppercase + string.digits
    return "REF-" + "".join(random.choices(chars, k=6))


@portal_router.get("/referrals/my")
async def get_my_referral_info(authorization: str = Header(None)):
    partner = await get_partner_from_token(authorization)
    
    # Ensure partner has a referral code
    if not partner.get("referral_code"):
        code = generate_referral_code()
        await db.outsourcing_partners.update_one(
            {"id": partner["id"]},
            {"$set": {"referral_code": code}}
        )
        partner["referral_code"] = code
    
    referrals = await db.referrals.find(
        {"referrer_client_id": partner["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(200)
    
    # Enrich with referred company names
    for ref in referrals:
        referred = await db.outsourcing_partners.find_one(
            {"id": ref.get("referred_client_id")}, {"_id": 0, "hashed_password": 0}
        )
        ref["referred_company_name"] = referred.get("company_name", "Unknown") if referred else "Unknown"
    
    total_bonus = sum(r.get("bonus_credits_awarded", 0) for r in referrals)
    
    return {
        "referral_code": partner.get("referral_code"),
        "total_referrals": len(referrals),
        "total_bonus_credits": total_bonus,
        "referrals": referrals
    }


@portal_router.get("/referrals")
async def get_all_referrals(authorization: str = Header(None)):
    admin = await get_admin_from_token(authorization)
    referrals = await db.referrals.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return referrals


@portal_router.post("/referrals/credits/adjust")
async def adjust_referral_credits(data: dict, authorization: str = Header(None)):
    admin = await get_admin_from_token(authorization)
    client_id = data.get("client_id")
    credits = data.get("credits", 0)
    notes = data.get("notes", "")
    
    if not client_id:
        raise HTTPException(status_code=400, detail="client_id required")
    
    await db.outsourcing_partners.update_one(
        {"id": client_id},
        {"$inc": {"credit_balance": credits}}
    )
    return {"message": f"Adjusted {credits} credits for partner", "notes": notes}


# ============ SUPPORT TICKETS ============

@portal_router.post("/support/tickets")
async def create_ticket(data: dict, authorization: str = Header(None)):
    partner = await get_partner_from_token(authorization)
    ticket = {
        "id": str(uuid.uuid4()),
        "outsourcing_client_id": partner["id"],
        "subject": data.get("subject", ""),
        "category": data.get("category", "general"),
        "priority": data.get("priority", "normal"),
        "description": data.get("description", ""),
        "file_attachment_url": data.get("file_attachment_url"),
        "status": "open",
        "assigned_to": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.outsourcing_support_tickets.insert_one(ticket)
    return remove_id(ticket)


@portal_router.get("/support/tickets")
async def list_tickets(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    authorization: str = Header(None)
):
    """List tickets - partner sees own, send client_id query param for admin filtering"""
    partner = await get_partner_from_token(authorization)
    query = {"outsourcing_client_id": partner["id"]}
    if status:
        query["status"] = status
    if priority:
        query["priority"] = priority
    tickets = await db.outsourcing_support_tickets.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    return tickets


@portal_router.get("/support/tickets/admin")
async def admin_list_tickets(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    client_id: Optional[str] = None,
    authorization: str = Header(None)
):
    admin = await get_admin_from_token(authorization)
    query = {}
    if status:
        query["status"] = status
    if priority:
        query["priority"] = priority
    if client_id:
        query["outsourcing_client_id"] = client_id
    tickets = await db.outsourcing_support_tickets.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return tickets


@portal_router.get("/support/tickets/{ticket_id}")
async def get_ticket(ticket_id: str, authorization: str = Header(None)):
    # Try partner auth first, then admin
    try:
        partner = await get_partner_from_token(authorization)
        ticket = await db.outsourcing_support_tickets.find_one(
            {"id": ticket_id, "outsourcing_client_id": partner["id"]}, {"_id": 0}
        )
    except HTTPException:
        await get_admin_from_token(authorization)
        ticket = await db.outsourcing_support_tickets.find_one({"id": ticket_id}, {"_id": 0})
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    replies = await db.outsourcing_ticket_replies.find(
        {"ticket_id": ticket_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(200)
    ticket["replies"] = replies
    return ticket


@portal_router.put("/support/tickets/{ticket_id}")
async def update_ticket(ticket_id: str, data: dict, authorization: str = Header(None)):
    admin = await get_admin_from_token(authorization)
    update_fields = {}
    for key in ["status", "assigned_to", "priority"]:
        if key in data:
            update_fields[key] = data[key]
    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.outsourcing_support_tickets.update_one(
        {"id": ticket_id}, {"$set": update_fields}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    updated = await db.outsourcing_support_tickets.find_one({"id": ticket_id}, {"_id": 0})
    return updated


@portal_router.post("/support/tickets/{ticket_id}/reply")
async def add_ticket_reply(ticket_id: str, data: dict, authorization: str = Header(None)):
    # Determine sender type
    sender_type = "client"
    sender_id = ""
    try:
        partner = await get_partner_from_token(authorization)
        sender_id = partner["id"]
        sender_type = "client"
    except HTTPException:
        admin = await get_admin_from_token(authorization)
        sender_id = admin.get("sub", "admin")
        sender_type = "admin"
    
    reply = {
        "id": str(uuid.uuid4()),
        "ticket_id": ticket_id,
        "sender_type": sender_type,
        "sender_id": sender_id,
        "message": data.get("message", ""),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.outsourcing_ticket_replies.insert_one(reply)
    
    # Update ticket timestamp
    await db.outsourcing_support_tickets.update_one(
        {"id": ticket_id},
        {"$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return remove_id(reply)


# ============ ANNOUNCEMENTS ============

@portal_router.post("/announcements")
async def create_announcement(data: dict, authorization: str = Header(None)):
    admin = await get_admin_from_token(authorization)
    announcement = {
        "id": str(uuid.uuid4()),
        "title": data.get("title", ""),
        "body": data.get("body", ""),
        "priority": data.get("priority", "normal"),
        "target": data.get("target", "all"),
        "target_client_ids": data.get("target_client_ids", []),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": admin.get("sub", "admin")
    }
    await db.outsourcing_announcements.insert_one(announcement)
    return remove_id(announcement)


@portal_router.get("/announcements")
async def get_announcements(authorization: str = Header(None)):
    partner = await get_partner_from_token(authorization)
    query = {
        "$or": [
            {"target": "all"},
            {"target_client_ids": partner["id"]}
        ]
    }
    announcements = await db.outsourcing_announcements.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Get read status
    reads = await db.outsourcing_announcement_reads.find(
        {"client_id": partner["id"]}, {"_id": 0}
    ).to_list(200)
    read_ids = {r["announcement_id"] for r in reads}
    
    for a in announcements:
        a["is_read"] = a["id"] in read_ids
    
    return announcements


@portal_router.put("/announcements/{announcement_id}/read")
async def mark_announcement_read(announcement_id: str, authorization: str = Header(None)):
    partner = await get_partner_from_token(authorization)
    existing = await db.outsourcing_announcement_reads.find_one(
        {"announcement_id": announcement_id, "client_id": partner["id"]}
    )
    if not existing:
        await db.outsourcing_announcement_reads.insert_one({
            "id": str(uuid.uuid4()),
            "announcement_id": announcement_id,
            "client_id": partner["id"],
            "read_at": datetime.now(timezone.utc).isoformat()
        })
    return {"message": "Marked as read"}


@portal_router.get("/announcements/admin")
async def admin_get_announcements(authorization: str = Header(None)):
    admin = await get_admin_from_token(authorization)
    announcements = await db.outsourcing_announcements.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return announcements


# ============ BILLING HISTORY ============

@portal_router.get("/billing/history")
async def get_billing_history(authorization: str = Header(None)):
    partner = await get_partner_from_token(authorization)
    
    # Get credit purchase history from the partner's transactions
    # Look for stripe payment records or credit purchase records
    purchases = await db.outsourcing_credit_purchases.find(
        {"client_id": partner["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(200)
    
    # Get subscription info
    subscriptions = await db.outsourcing_subscriptions.find(
        {"client_id": partner["id"], "status": {"$in": ["active", "cancelling"]}}, {"_id": 0}
    ).to_list(20)
    
    return {
        "purchases": purchases,
        "subscriptions": subscriptions,
        "credit_balance": partner.get("credit_balance", 0)
    }


# ============ PORTAL DASHBOARD ============

@portal_router.get("/portal/dashboard")
async def portal_dashboard(authorization: str = Header(None)):
    partner = await get_partner_from_token(authorization)
    client_id = partner["id"]
    
    # Customer counts
    total_customers = await db.outsourcing_customers.count_documents({"outsourcing_client_id": client_id})
    active_customers = await db.outsourcing_customers.count_documents({"outsourcing_client_id": client_id, "status": "active"})
    
    # Round counts this month
    month = datetime.now(timezone.utc).strftime("%Y-%m")
    rounds = await db.outsourcing_round_history.find(
        {"outsourcing_client_id": client_id}, {"_id": 0}
    ).to_list(1000)
    month_rounds = len([r for r in rounds if r.get("date_submitted", "").startswith(month)])
    
    # Open tickets
    open_tickets = await db.outsourcing_support_tickets.count_documents(
        {"outsourcing_client_id": client_id, "status": {"$in": ["open", "in_progress"]}}
    )
    
    # Unread announcements
    all_announcements = await db.outsourcing_announcements.find(
        {"$or": [{"target": "all"}, {"target_client_ids": client_id}]}, {"_id": 0}
    ).to_list(100)
    reads = await db.outsourcing_announcement_reads.find(
        {"client_id": client_id}, {"_id": 0}
    ).to_list(200)
    read_ids = {r["announcement_id"] for r in reads}
    unread_count = len([a for a in all_announcements if a["id"] not in read_ids])
    
    # Pending onboarding
    pending_onboarding = await db.outsourcing_onboarding_submissions.count_documents(
        {"outsourcing_client_id": client_id, "submission_status": {"$in": ["received", "in_review"]}}
    )
    
    # Credit warnings
    price_per_credit = partner.get("price_per_credit", DEFAULT_PRICE_PER_CREDIT)
    credits_for_next_round = active_customers
    cost_for_next_round = credits_for_next_round * price_per_credit
    credit_balance = partner.get("credit_balance", 0)
    credits_deficit = max(0, credits_for_next_round - credit_balance)

    return {
        "credit_balance": credit_balance,
        "price_per_credit": price_per_credit,
        "total_customers": total_customers,
        "active_customers": active_customers,
        "rounds_this_month": month_rounds,
        "total_rounds": len(rounds),
        "open_tickets": open_tickets,
        "unread_announcements": unread_count,
        "pending_onboarding": pending_onboarding,
        "referral_code": partner.get("referral_code", ""),
        "credits_for_next_round": credits_for_next_round,
        "cost_for_next_round": cost_for_next_round,
        "credits_deficit": credits_deficit,
        "deficit_cost": credits_deficit * price_per_credit,
        "out_of_credits": credit_balance <= 0
    }


# ============ DELETION CATEGORIES ============

DELETION_CATEGORIES = [
    "collections", "inquiries", "late_payments",
    "public_records", "bankruptcies", "charge_offs"
]


# ============ ADMIN - HISTORICAL DATA ============

@portal_router.put("/admin/partners/{partner_id}/historical-data")
async def update_partner_historical_data(partner_id: str, data: dict, authorization: str = Header(None)):
    """Admin: Update historical data for an outsourcing partner"""
    admin = await get_admin_from_token(authorization)
    update = {}
    for field in ["historical_start_date", "signed_agreement_date", "monthly_charge"]:
        if field in data:
            update[field] = data[field]
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.outsource_partners.update_one({"id": partner_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Partner not found")
    partner = await db.outsource_partners.find_one({"id": partner_id}, {"_id": 0})
    return partner


@portal_router.get("/admin/partners/{partner_id}/historical-data")
async def get_partner_historical_data(partner_id: str, authorization: str = Header(None)):
    """Admin: Get historical data for an outsourcing partner"""
    admin = await get_admin_from_token(authorization)
    partner = await db.outsource_partners.find_one({"id": partner_id}, {"_id": 0})
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    return {
        "historical_start_date": partner.get("historical_start_date"),
        "signed_agreement_date": partner.get("signed_agreement_date"),
        "monthly_charge": partner.get("monthly_charge")
    }


# ============ ADMIN - SIGNED AGREEMENT UPLOADS ============

@portal_router.post("/admin/partners/{partner_id}/signed-agreements/upload")
async def upload_signed_agreement(
    partner_id: str,
    description: str = Form(""),
    file: UploadFile = File(...),
    authorization: str = Header(None)
):
    """Admin: Upload a signed agreement PDF for a partner"""
    admin = await get_admin_from_token(authorization)
    ext = os.path.splitext(file.filename)[1].lower()
    if ext != ".pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    contents = await file.read()
    if len(contents) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File must be under 20MB")

    upload_dir = "uploads/outsourcing_agreements"
    os.makedirs(upload_dir, exist_ok=True)
    file_id = str(uuid.uuid4())
    file_path = os.path.join(upload_dir, f"{file_id}.pdf")
    with open(file_path, "wb") as f:
        f.write(contents)

    agreement = {
        "id": file_id,
        "partner_id": partner_id,
        "file_name": file.filename,
        "file_path": file_path,
        "file_size": len(contents),
        "description": description,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "uploaded_by": admin.get("sub", "admin")
    }
    await db.outsourcing_signed_agreements.insert_one(agreement)
    return remove_id(agreement)


@portal_router.get("/admin/partners/{partner_id}/signed-agreements/list")
async def list_signed_agreements(partner_id: str, authorization: str = Header(None)):
    """Admin: List signed agreements for a partner"""
    admin = await get_admin_from_token(authorization)
    agreements = await db.outsourcing_signed_agreements.find(
        {"partner_id": partner_id}, {"_id": 0}
    ).sort("uploaded_at", -1).to_list(100)
    return agreements


@portal_router.delete("/admin/signed-agreements/{agreement_id}")
async def delete_signed_agreement(agreement_id: str, authorization: str = Header(None)):
    """Admin: Delete a signed agreement"""
    admin = await get_admin_from_token(authorization)
    agreement = await db.outsourcing_signed_agreements.find_one({"id": agreement_id})
    if not agreement:
        raise HTTPException(status_code=404, detail="Agreement not found")
    file_path = agreement.get("file_path")
    if file_path and os.path.exists(file_path):
        os.remove(file_path)
    await db.outsourcing_signed_agreements.delete_one({"id": agreement_id})
    return {"message": "Signed agreement deleted"}


# ============ PDF VIEWER ENDPOINTS ============

@portal_router.get("/signed-agreements/{agreement_id}/pdf")
async def view_signed_agreement_pdf(agreement_id: str, authorization: str = Header(None)):
    """Serve signed agreement PDF for inline viewing"""
    try:
        admin = await get_admin_from_token(authorization)
    except HTTPException:
        partner = await get_partner_from_token(authorization)
        email = partner.get("email", "").lower()
        crm_partner = await db.outsource_partners.find_one({"contact_email": email})
        if not crm_partner:
            raise HTTPException(status_code=403, detail="Access denied")
        agreement = await db.outsourcing_signed_agreements.find_one(
            {"id": agreement_id, "partner_id": crm_partner["id"]}
        )
        if not agreement:
            raise HTTPException(status_code=403, detail="Access denied")
    else:
        agreement = await db.outsourcing_signed_agreements.find_one({"id": agreement_id})

    if not agreement:
        raise HTTPException(status_code=404, detail="Agreement not found")
    file_path = agreement.get("file_path")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename=\"{agreement.get('file_name', 'agreement.pdf')}\""}
    )


@portal_router.get("/credit-reports/{report_id}/pdf")
async def view_credit_report_pdf(report_id: str, authorization: str = Header(None)):
    """Serve credit report PDF for inline viewing"""
    report = await db.outsourcing_credit_reports.find_one({"id": report_id})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    try:
        admin = await get_admin_from_token(authorization)
    except HTTPException:
        partner = await get_partner_from_token(authorization)
        customer = await db.outsourcing_customers.find_one(
            {"id": report["customer_id"], "outsourcing_client_id": partner["id"]}
        )
        if not customer:
            raise HTTPException(status_code=403, detail="Access denied")

    file_path = report.get("file_path")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename=\"{report.get('file_name', 'credit_report.pdf')}\""}
    )


# ============ ADMIN - CUSTOMER MANAGEMENT ============

@portal_router.get("/admin/partners/{partner_id}/all-customers")
async def admin_list_partner_customers(partner_id: str, authorization: str = Header(None)):
    """Admin: Get all customers under a partner (bridges outsource_partners to outsourcing_customers)"""
    admin = await get_admin_from_token(authorization)
    crm_partner = await db.outsource_partners.find_one({"id": partner_id}, {"_id": 0})
    if not crm_partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    email = crm_partner.get("contact_email", "").lower()
    portal_partner = await db.outsourcing_partners.find_one({"email": email}, {"_id": 0})
    if not portal_partner:
        return []

    customers = await db.outsourcing_customers.find(
        {"outsourcing_client_id": portal_partner["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(500)

    for c in customers:
        c["credit_report_count"] = await db.outsourcing_credit_reports.count_documents({"customer_id": c["id"]})
        c["deletion_count"] = await db.outsourcing_deletion_records.count_documents({"customer_id": c["id"]})

    return customers


# ============ ADMIN - CREDIT REPORTS ============

@portal_router.post("/admin/customers/{customer_id}/credit-reports/upload")
async def upload_credit_report(
    customer_id: str,
    round_number: int = Form(0),
    notes: str = Form(""),
    file: UploadFile = File(...),
    authorization: str = Header(None)
):
    """Admin: Upload a credit report PDF for a customer"""
    admin = await get_admin_from_token(authorization)
    ext = os.path.splitext(file.filename)[1].lower()
    if ext != ".pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    contents = await file.read()
    if len(contents) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File must be under 20MB")

    upload_dir = "uploads/outsourcing_credit_reports"
    os.makedirs(upload_dir, exist_ok=True)
    file_id = str(uuid.uuid4())
    file_path = os.path.join(upload_dir, f"{file_id}.pdf")
    with open(file_path, "wb") as f:
        f.write(contents)

    report = {
        "id": file_id,
        "customer_id": customer_id,
        "file_name": file.filename,
        "file_path": file_path,
        "file_size": len(contents),
        "round_number": round_number,
        "notes": notes,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "uploaded_by": admin.get("sub", "admin")
    }
    await db.outsourcing_credit_reports.insert_one(report)
    return remove_id(report)


@portal_router.get("/admin/customers/{customer_id}/credit-reports")
async def admin_list_credit_reports(customer_id: str, authorization: str = Header(None)):
    """Admin: List credit reports for a customer"""
    admin = await get_admin_from_token(authorization)
    reports = await db.outsourcing_credit_reports.find(
        {"customer_id": customer_id}, {"_id": 0}
    ).sort("uploaded_at", -1).to_list(100)
    return reports


@portal_router.delete("/admin/credit-reports/{report_id}")
async def delete_credit_report(report_id: str, authorization: str = Header(None)):
    """Admin: Delete a credit report"""
    admin = await get_admin_from_token(authorization)
    report = await db.outsourcing_credit_reports.find_one({"id": report_id})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    file_path = report.get("file_path")
    if file_path and os.path.exists(file_path):
        os.remove(file_path)
    await db.outsourcing_credit_reports.delete_one({"id": report_id})
    return {"message": "Credit report deleted"}


# ============ ADMIN - DELETION TRACKING ============

@portal_router.post("/admin/customers/{customer_id}/deletions")
async def add_deletion_record(customer_id: str, data: dict, authorization: str = Header(None)):
    """Admin: Add a deletion record for a customer"""
    admin = await get_admin_from_token(authorization)
    category = data.get("category")
    if category not in DELETION_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of: {', '.join(DELETION_CATEGORIES)}")

    record = {
        "id": str(uuid.uuid4()),
        "customer_id": customer_id,
        "category": category,
        "count": data.get("count", 0),
        "round_number": data.get("round_number", 0),
        "bureau": data.get("bureau", ""),
        "notes": data.get("notes", ""),
        "date_recorded": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": admin.get("sub", "admin")
    }
    await db.outsourcing_deletion_records.insert_one(record)
    return remove_id(record)


@portal_router.put("/admin/deletions/{deletion_id}")
async def update_deletion_record(deletion_id: str, data: dict, authorization: str = Header(None)):
    """Admin: Update a deletion record"""
    admin = await get_admin_from_token(authorization)
    update = {}
    for field in ["count", "notes", "bureau", "round_number"]:
        if field in data:
            update[field] = data[field]
    if "category" in data and data["category"] in DELETION_CATEGORIES:
        update["category"] = data["category"]
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.outsourcing_deletion_records.update_one({"id": deletion_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Record not found")
    updated = await db.outsourcing_deletion_records.find_one({"id": deletion_id}, {"_id": 0})
    return updated


@portal_router.delete("/admin/deletions/{deletion_id}")
async def delete_deletion_record(deletion_id: str, authorization: str = Header(None)):
    """Admin: Delete a deletion record"""
    admin = await get_admin_from_token(authorization)
    result = await db.outsourcing_deletion_records.delete_one({"id": deletion_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"message": "Deletion record removed"}


@portal_router.get("/admin/customers/{customer_id}/deletions")
async def admin_list_deletions(customer_id: str, authorization: str = Header(None)):
    """Admin: List deletion records for a customer"""
    admin = await get_admin_from_token(authorization)
    records = await db.outsourcing_deletion_records.find(
        {"customer_id": customer_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(500)
    return records


# ============ PARTNER - READ-ONLY ENDPOINTS ============

@portal_router.get("/customers/{customer_id}/credit-reports")
async def partner_list_credit_reports(customer_id: str, authorization: str = Header(None)):
    """Partner: List credit reports for their customer (read-only)"""
    partner = await get_partner_from_token(authorization)
    customer = await db.outsourcing_customers.find_one(
        {"id": customer_id, "outsourcing_client_id": partner["id"]}
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    reports = await db.outsourcing_credit_reports.find(
        {"customer_id": customer_id}, {"_id": 0, "file_path": 0}
    ).sort("uploaded_at", -1).to_list(100)
    return reports


@portal_router.get("/customers/{customer_id}/deletions")
async def partner_list_deletions(customer_id: str, authorization: str = Header(None)):
    """Partner: List deletion records for their customer (read-only)"""
    partner = await get_partner_from_token(authorization)
    customer = await db.outsourcing_customers.find_one(
        {"id": customer_id, "outsourcing_client_id": partner["id"]}
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    records = await db.outsourcing_deletion_records.find(
        {"customer_id": customer_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(500)
    return records


@portal_router.get("/my/historical-data")
async def get_my_historical_data(authorization: str = Header(None)):
    """Partner: Get historical data for the logged-in partner"""
    partner = await get_partner_from_token(authorization)
    email = partner.get("email", "").lower()
    crm_partners = await db.outsource_partners.find(
        {"contact_email": {"$regex": f"^{email}$", "$options": "i"}}, {"_id": 0}
    ).to_list(10)
    if not crm_partners:
        return {"historical_start_date": None, "signed_agreement_date": None, "monthly_charge": None}
    best = None
    for p in crm_partners:
        if p.get("historical_start_date") or p.get("monthly_charge"):
            best = p
            break
    if not best:
        best = crm_partners[0]
    return {
        "historical_start_date": best.get("historical_start_date"),
        "signed_agreement_date": best.get("signed_agreement_date"),
        "monthly_charge": best.get("monthly_charge")
    }


@portal_router.get("/my/signed-agreements")
async def get_my_signed_agreements(authorization: str = Header(None)):
    """Partner: Get signed agreements for the logged-in partner"""
    partner = await get_partner_from_token(authorization)
    email = partner.get("email", "").lower()
    crm_partners = await db.outsource_partners.find(
        {"contact_email": {"$regex": f"^{email}$", "$options": "i"}}, {"_id": 0, "id": 1}
    ).to_list(10)
    if not crm_partners:
        return []
    partner_ids = [p["id"] for p in crm_partners]
    agreements = await db.outsourcing_signed_agreements.find(
        {"partner_id": {"$in": partner_ids}}, {"_id": 0, "file_path": 0}
    ).sort("uploaded_at", -1).to_list(100)
    return agreements


@portal_router.get("/customers/{customer_id}/success-summary")
async def get_customer_success_summary(customer_id: str, authorization: str = Header(None)):
    """Partner: Get deletion success summary for a customer"""
    partner = await get_partner_from_token(authorization)
    customer = await db.outsourcing_customers.find_one(
        {"id": customer_id, "outsourcing_client_id": partner["id"]}
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    records = await db.outsourcing_deletion_records.find(
        {"customer_id": customer_id}, {"_id": 0}
    ).to_list(500)

    summary = {}
    for cat in DELETION_CATEGORIES:
        cat_records = [r for r in records if r.get("category") == cat]
        summary[cat] = {
            "total_deletions": sum(r.get("count", 0) for r in cat_records),
            "records": len(cat_records)
        }

    return {
        "customer_id": customer_id,
        "customer_name": f"{customer.get('first_name', '')} {customer.get('last_name', '')}",
        "total_deletions": sum(v["total_deletions"] for v in summary.values()),
        "by_category": summary
    }


# ============ ADMIN - CREDIT SETTINGS ============

@portal_router.put("/admin/partners/{partner_id}/credit-settings")
async def update_credit_settings(partner_id: str, data: dict, authorization: str = Header(None)):
    """Admin: Set price_per_credit for a partner"""
    admin = await get_admin_from_token(authorization)
    update = {}
    if "price_per_credit" in data:
        ppc = float(data["price_per_credit"])
        if ppc < 0:
            raise HTTPException(status_code=400, detail="Price per credit cannot be negative")
        update["price_per_credit"] = ppc

    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Update both CRM and portal partner records
    result = await db.outsource_partners.update_one({"id": partner_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Partner not found")

    # Also update the portal partner (outsourcing_partners) via email bridge
    crm_partner = await db.outsource_partners.find_one({"id": partner_id}, {"_id": 0})
    if crm_partner:
        email = crm_partner.get("contact_email", "").lower()
        if email:
            await db.outsourcing_partners.update_many(
                {"email": {"$regex": f"^{email}$", "$options": "i"}},
                {"$set": update}
            )

    return {"message": "Credit settings updated", "price_per_credit": update.get("price_per_credit")}


@portal_router.get("/admin/partners/{partner_id}/credit-settings")
async def get_credit_settings(partner_id: str, authorization: str = Header(None)):
    """Admin: Get credit settings for a partner"""
    admin = await get_admin_from_token(authorization)
    crm_partner = await db.outsource_partners.find_one({"id": partner_id}, {"_id": 0})
    if not crm_partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    # Get portal partner for credit balance
    email = crm_partner.get("contact_email", "").lower()
    portal_partner = None
    if email:
        portal_partner = await db.outsourcing_partners.find_one(
            {"email": {"$regex": f"^{email}$", "$options": "i"}}, {"_id": 0}
        )

    credit_balance = portal_partner.get("credit_balance", 0) if portal_partner else 0
    price_per_credit = crm_partner.get("price_per_credit", portal_partner.get("price_per_credit", DEFAULT_PRICE_PER_CREDIT) if portal_partner else DEFAULT_PRICE_PER_CREDIT)

    # Count active customers
    active_customers = 0
    if portal_partner:
        active_customers = await db.outsourcing_customers.count_documents(
            {"outsourcing_client_id": portal_partner["id"], "status": "active"}
        )

    return {
        "price_per_credit": price_per_credit,
        "credit_balance": credit_balance,
        "active_customers": active_customers,
        "credits_needed_next_round": active_customers,
        "cost_next_round": active_customers * price_per_credit,
        "credit_rates": CREDIT_RATES
    }


# ============ ADMIN - CREDIT PURCHASES ============

@portal_router.post("/admin/partners/{partner_id}/credits/purchase")
async def record_credit_purchase(partner_id: str, data: dict, authorization: str = Header(None)):
    """Admin: Record a credit purchase (processes via Authorize.net if card provided, then adds credits)"""
    admin = await get_admin_from_token(authorization)

    credits_to_add = float(data.get("credits", 0))
    payment_amount = float(data.get("payment_amount", 0))
    payment_method = data.get("payment_method", "")
    notes = data.get("notes", "")

    if credits_to_add <= 0:
        raise HTTPException(status_code=400, detail="Credits must be positive")

    # Find portal partner via email bridge
    crm_partner = await db.outsource_partners.find_one({"id": partner_id}, {"_id": 0})
    if not crm_partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    email = crm_partner.get("contact_email", "").lower()
    portal_partner = None
    if email:
        portal_partner = await db.outsourcing_partners.find_one(
            {"email": {"$regex": f"^{email}$", "$options": "i"}}, {"_id": 0}
        )

    if not portal_partner:
        raise HTTPException(status_code=404, detail="No portal account found for this partner")

    # ── Authorize.net charge if card details provided ──
    gateway_txn_id = ""
    card_number = data.get("card_number", "")
    expiration_date = data.get("expiration_date", "")
    card_code = data.get("card_code", "")

    if card_number and expiration_date and card_code and payment_amount > 0:
        try:
            from payment_processor import process_and_record_payment
            result = await process_and_record_payment(
                amount=payment_amount,
                card_number=card_number,
                expiration_date=expiration_date,
                card_code=card_code,
                source_category="outsourcing_client",
                description=f"Outsourcing Credit Purchase - {crm_partner.get('company_name', crm_partner.get('contact_name', ''))} ({credits_to_add} credits)",
                invoice_number=f"OSC-{partner_id[:8]}",
                customer_email=email,
                customer_id=partner_id[:20],
                customer_name=crm_partner.get("company_name", crm_partner.get("contact_name", "")),
                recorded_by_id=admin.get("sub", "admin"),
                recorded_by_name="Admin",
            )
            if not result["success"]:
                raise HTTPException(
                    status_code=400,
                    detail=result["gateway_result"].get("error_message", "Payment declined")
                )
            gateway_txn_id = result["transaction_id"]
            payment_method = "credit_card"
        except ImportError:
            pass
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Payment processing error: {str(e)}")

    # Add credits
    await db.outsourcing_partners.update_one(
        {"id": portal_partner["id"]},
        {
            "$inc": {"credit_balance": credits_to_add, "total_credits_purchased": credits_to_add}
        }
    )

    # Record the purchase
    purchase = {
        "id": str(uuid.uuid4()),
        "partner_id": partner_id,
        "portal_partner_id": portal_partner["id"],
        "credits_added": credits_to_add,
        "payment_amount": payment_amount,
        "payment_method": payment_method,
        "gateway_transaction_id": gateway_txn_id,
        "notes": notes,
        "admin_user": admin.get("sub", "admin"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.outsourcing_credit_purchases.insert_one(purchase)

    # ── Log to central revenue_records for manual (non-card) purchases ──
    if not (card_number and expiration_date and card_code) and payment_amount > 0:
        await log_revenue(
            db,
            source="outsourcing",
            category="credit_purchase",
            amount=payment_amount,
            description=f"Outsourcing Credit Purchase - {crm_partner.get('company_name', crm_partner.get('contact_name', ''))} ({credits_to_add} credits)",
            reference_id=partner_id,
            reference_type="outsourcing_partner",
            payment_status="paid",
            payment_method=payment_method,
            recorded_by_id=admin.get("sub", "admin"),
            recorded_by_name="Admin",
        )

    updated = await db.outsourcing_partners.find_one({"id": portal_partner["id"]}, {"_id": 0, "hashed_password": 0})

    return {
        "message": f"{credits_to_add} credits added successfully",
        "new_balance": updated.get("credit_balance", 0),
        "purchase_id": purchase["id"],
        "gateway_transaction_id": gateway_txn_id
    }


@portal_router.get("/admin/partners/{partner_id}/credits/history")
async def get_credit_purchase_history(partner_id: str, authorization: str = Header(None)):
    """Admin: Get credit purchase history for a partner"""
    admin = await get_admin_from_token(authorization)
    purchases = await db.outsourcing_credit_purchases.find(
        {"partner_id": partner_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(200)
    return purchases


# ============ PARTNER - CREDIT INFO & ESTIMATES ============

@portal_router.get("/credits/info")
async def get_my_credit_info(authorization: str = Header(None)):
    """Partner: Get full credit info including balance, rate, and estimates"""
    partner = await get_partner_from_token(authorization)
    credit_balance = partner.get("credit_balance", 0)
    price_per_credit = partner.get("price_per_credit", DEFAULT_PRICE_PER_CREDIT)

    active_customers = await db.outsourcing_customers.count_documents(
        {"outsourcing_client_id": partner["id"], "status": "active"}
    )

    # Bureau round estimate (1 credit per active customer)
    credits_for_next_round = active_customers
    cost_for_next_round = credits_for_next_round * price_per_credit

    # Check if enough credits
    has_enough = credit_balance >= credits_for_next_round
    credits_deficit = max(0, credits_for_next_round - credit_balance)
    deficit_cost = credits_deficit * price_per_credit

    # Purchase history
    purchases = await db.outsourcing_credit_purchases.find(
        {"portal_partner_id": partner["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(10)

    return {
        "credit_balance": credit_balance,
        "price_per_credit": price_per_credit,
        "active_customers": active_customers,
        "credits_for_next_round": credits_for_next_round,
        "cost_for_next_round": cost_for_next_round,
        "has_enough_credits": has_enough,
        "credits_deficit": credits_deficit,
        "deficit_cost": deficit_cost,
        "credit_rates": CREDIT_RATES,
        "recent_purchases": purchases
    }


@portal_router.get("/credits/estimate-new-clients")
async def estimate_credits_for_new_clients(
    count: int = 1,
    authorization: str = Header(None)
):
    """Partner: Estimate credits needed if adding X new clients"""
    partner = await get_partner_from_token(authorization)
    credit_balance = partner.get("credit_balance", 0)
    price_per_credit = partner.get("price_per_credit", DEFAULT_PRICE_PER_CREDIT)

    active_customers = await db.outsourcing_customers.count_documents(
        {"outsourcing_client_id": partner["id"], "status": "active"}
    )

    new_total = active_customers + count
    credits_for_round = new_total  # 1 credit per client for bureau
    total_cost = credits_for_round * price_per_credit
    additional_credits_needed = max(0, credits_for_round - credit_balance)
    additional_cost = additional_credits_needed * price_per_credit

    return {
        "current_active_clients": active_customers,
        "new_clients_to_add": count,
        "new_total_clients": new_total,
        "credits_per_round": credits_for_round,
        "total_round_cost": total_cost,
        "current_balance": credit_balance,
        "additional_credits_needed": additional_credits_needed,
        "additional_cost": additional_cost,
        "price_per_credit": price_per_credit
    }
