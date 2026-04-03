"""
Collections Letter Generator API - Generate, manage, and export collection letters.
Includes public payment portal with SSN/DOB verification.
"""
import os
import uuid
import random
import hashlib
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Header, Request
from pydantic import BaseModel

collections_letter_router = APIRouter(prefix="/api/collections", tags=["Collections Letters"])

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


def generate_account_number():
    date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    rand = random.randint(1000, 9999)
    return f"COL-{date_str}-{rand}"


# ============ COLLECTION REPS ============

@collections_letter_router.post("/reps")
async def create_rep(data: dict, authorization: str = Header(None)):
    await get_admin(authorization)
    rep = {
        "id": str(uuid.uuid4()),
        "name": data.get("name", ""),
        "phone": data.get("phone", ""),
        "email": data.get("email", ""),
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.collection_reps.insert_one(rep)
    return remove_id(rep)


@collections_letter_router.get("/reps")
async def list_reps(authorization: str = Header(None)):
    await get_admin(authorization)
    reps = await db.collection_reps.find({"active": True}, {"_id": 0}).to_list(100)
    return reps


@collections_letter_router.put("/reps/{rep_id}")
async def update_rep(rep_id: str, data: dict, authorization: str = Header(None)):
    await get_admin(authorization)
    update_fields = {k: v for k, v in data.items() if k not in ["id", "created_at"]}
    result = await db.collection_reps.update_one({"id": rep_id}, {"$set": update_fields})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Rep not found")
    return await db.collection_reps.find_one({"id": rep_id}, {"_id": 0})


@collections_letter_router.delete("/reps/{rep_id}")
async def deactivate_rep(rep_id: str, authorization: str = Header(None)):
    await get_admin(authorization)
    await db.collection_reps.update_one({"id": rep_id}, {"$set": {"active": False}})
    return {"message": "Rep deactivated"}


# ============ COLLECTION LETTERS ============

US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"]

@collections_letter_router.post("/letters")
async def create_letter(data: dict, authorization: str = Header(None)):
    admin = await get_admin(authorization)
    
    # Auto-generate account number if blank
    account_number = data.get("account_number") or generate_account_number()
    
    # Calculate days past due
    days_past_due = 0
    if data.get("original_due_date"):
        try:
            due = datetime.strptime(data["original_due_date"], "%Y-%m-%d")
            days_past_due = max(0, (datetime.now() - due).days)
        except Exception:
            pass
    
    # Generate unique payment token for this letter
    payment_token = str(uuid.uuid4()).replace("-", "")[:16]
    
    letter = {
        "id": str(uuid.uuid4()),
        "consumer_first_name": data.get("consumer_first_name", ""),
        "consumer_last_name": data.get("consumer_last_name", ""),
        "consumer_address_street": data.get("consumer_address_street", ""),
        "consumer_address_city": data.get("consumer_address_city", ""),
        "consumer_address_state": data.get("consumer_address_state", ""),
        "consumer_address_zip": data.get("consumer_address_zip", ""),
        "consumer_ssn_last_four": data.get("consumer_ssn_last_four", ""),
        "consumer_birth_year": data.get("consumer_birth_year", ""),
        "account_number": account_number,
        "amount_owed": float(data.get("amount_owed", 0)),
        "amount_paid": 0.0,
        "original_due_date": data.get("original_due_date", ""),
        "days_past_due": days_past_due,
        "assigned_rep_id": data.get("assigned_rep_id"),
        "urgency_level": data.get("urgency_level", "friendly_reminder"),
        "consequences": data.get("consequences", []),
        "payment_options": data.get("payment_options", []),
        "payment_url": data.get("payment_url", ""),
        "payment_phone": data.get("payment_phone", ""),
        "payment_mail_address": data.get("payment_mail_address", "Credlocity Business Group LLC, 1500 Chestnut Street, Suite 2, Philadelphia, PA 19102"),
        "payment_plan_instructions": data.get("payment_plan_instructions", ""),
        "response_deadline": data.get("response_deadline", ""),
        "letter_body": data.get("letter_body", ""),
        "payment_token": payment_token,
        "payment_status": "unpaid",
        "payment_transactions": [],
        "status": data.get("status", "draft"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "created_by": admin.get("sub", "admin")
    }
    
    await db.collection_letters.insert_one(letter)
    return remove_id(letter)


@collections_letter_router.get("/letters")
async def list_letters(
    urgency: Optional[str] = None,
    status: Optional[str] = None,
    rep_id: Optional[str] = None,
    search: Optional[str] = None,
    authorization: str = Header(None)
):
    await get_admin(authorization)
    query = {}
    if urgency:
        query["urgency_level"] = urgency
    if status:
        query["status"] = status
    if rep_id:
        query["assigned_rep_id"] = rep_id
    
    letters = await db.collection_letters.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    
    if search:
        s = search.lower()
        letters = [l for l in letters if s in f"{l.get('consumer_first_name','')} {l.get('consumer_last_name','')}".lower() or s in l.get("account_number","").lower()]
    
    # Enrich with rep names
    reps_cache = {}
    for l in letters:
        rep_id = l.get("assigned_rep_id")
        if rep_id and rep_id not in reps_cache:
            rep = await db.collection_reps.find_one({"id": rep_id}, {"_id": 0})
            reps_cache[rep_id] = rep
        l["rep_name"] = reps_cache.get(rep_id, {}).get("name", "Unassigned") if rep_id else "Unassigned"
    
    return letters


@collections_letter_router.get("/letters/{letter_id}")
async def get_letter(letter_id: str, authorization: str = Header(None)):
    await get_admin(authorization)
    letter = await db.collection_letters.find_one({"id": letter_id}, {"_id": 0})
    if not letter:
        raise HTTPException(status_code=404, detail="Letter not found")
    
    # Enrich with rep info
    if letter.get("assigned_rep_id"):
        rep = await db.collection_reps.find_one({"id": letter["assigned_rep_id"]}, {"_id": 0})
        letter["rep"] = rep
    
    return letter


@collections_letter_router.put("/letters/{letter_id}")
async def update_letter(letter_id: str, data: dict, authorization: str = Header(None)):
    await get_admin(authorization)
    
    # Recalculate days past due
    if data.get("original_due_date"):
        try:
            due = datetime.strptime(data["original_due_date"], "%Y-%m-%d")
            data["days_past_due"] = max(0, (datetime.now() - due).days)
        except Exception:
            pass
    
    update_fields = {k: v for k, v in data.items() if k not in ["id", "created_at", "created_by"]}
    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.collection_letters.update_one({"id": letter_id}, {"$set": update_fields})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Letter not found")
    
    return await db.collection_letters.find_one({"id": letter_id}, {"_id": 0})


@collections_letter_router.delete("/letters/{letter_id}")
async def soft_delete_letter(letter_id: str, authorization: str = Header(None)):
    await get_admin(authorization)
    result = await db.collection_letters.update_one(
        {"id": letter_id},
        {"$set": {"status": "closed", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Letter not found")
    return {"message": "Letter closed"}


@collections_letter_router.get("/letters/{letter_id}/qr-code")
async def get_letter_qr_code(letter_id: str, authorization: str = Header(None)):
    """Generate a QR code image for the letter's payment portal URL."""
    await get_admin(authorization)
    letter = await db.collection_letters.find_one({"id": letter_id}, {"_id": 0})
    if not letter:
        raise HTTPException(status_code=404, detail="Letter not found")
    if not letter.get("payment_token"):
        raise HTTPException(status_code=400, detail="Letter does not have a payment token")

    import qrcode
    import io
    import base64
    from fastapi.responses import Response

    base_url = os.environ.get("FRONTEND_URL", "https://credlocity.com")
    pay_url = f"{base_url}/pay/{letter['payment_token']}"

    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=4)
    qr.add_data(pay_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    return Response(content=buf.getvalue(), media_type="image/png",
                    headers={"Content-Disposition": f"inline; filename=qr-{letter_id[:8]}.png"})


@collections_letter_router.get("/letters/{letter_id}/qr-data")
async def get_letter_qr_data(letter_id: str, authorization: str = Header(None)):
    """Get QR code as base64 data URL for embedding in letter preview."""
    await get_admin(authorization)
    letter = await db.collection_letters.find_one({"id": letter_id}, {"_id": 0})
    if not letter:
        raise HTTPException(status_code=404, detail="Letter not found")
    if not letter.get("payment_token"):
        raise HTTPException(status_code=400, detail="No payment token")

    import qrcode
    import io
    import base64

    base_url = os.environ.get("FRONTEND_URL", "https://credlocity.com")
    pay_url = f"{base_url}/pay/{letter['payment_token']}"

    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=8, border=3)
    qr.add_data(pay_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode()

    return {"qr_data_url": f"data:image/png;base64,{b64}", "payment_url": pay_url}


# ============ PUBLIC PAYMENT PORTAL ============

def _hash_verify(ssn_last_four: str, birth_year: str) -> str:
    """Create a verification hash for SSN + birth year."""
    return hashlib.sha256(f"{ssn_last_four}:{birth_year}".encode()).hexdigest()[:32]


@collections_letter_router.post("/pay/{payment_token}/verify")
async def verify_consumer(payment_token: str, data: dict):
    """Public endpoint: Verify consumer identity to access payment portal."""
    letter = await db.collection_letters.find_one({"payment_token": payment_token}, {"_id": 0})
    if not letter:
        raise HTTPException(status_code=404, detail="Payment link not found or expired")

    ssn_last_four = data.get("ssn_last_four", "").strip()
    birth_year = data.get("birth_year", "").strip()

    if not ssn_last_four or len(ssn_last_four) != 4 or not ssn_last_four.isdigit():
        raise HTTPException(status_code=422, detail="Please enter the last 4 digits of your Social Security number")
    if not birth_year or len(birth_year) != 4 or not birth_year.isdigit():
        raise HTTPException(status_code=422, detail="Please enter your 4-digit birth year")

    stored_ssn = letter.get("consumer_ssn_last_four", "")
    stored_year = str(letter.get("consumer_birth_year", ""))

    if ssn_last_four != stored_ssn or birth_year != stored_year:
        raise HTTPException(status_code=403, detail="Identity verification failed. Please check your information and try again.")

    # Generate a session token for this verified session
    session_token = str(uuid.uuid4())
    await db.collection_letters.update_one(
        {"payment_token": payment_token},
        {"$set": {"active_session_token": session_token, "last_verified_at": datetime.now(timezone.utc).isoformat()}}
    )

    remaining = max(0, letter.get("amount_owed", 0) - letter.get("amount_paid", 0))

    return {
        "verified": True,
        "session_token": session_token,
        "consumer_name": f"{letter.get('consumer_first_name', '')} {letter.get('consumer_last_name', '')}",
        "account_number": letter.get("account_number"),
        "amount_owed": letter.get("amount_owed", 0),
        "amount_paid": letter.get("amount_paid", 0),
        "amount_remaining": remaining,
        "payment_status": letter.get("payment_status", "unpaid"),
        "response_deadline": letter.get("response_deadline", ""),
    }


@collections_letter_router.post("/pay/{payment_token}/process")
async def process_payment(payment_token: str, data: dict):
    """Public endpoint: Process a payment for a collection letter."""
    letter = await db.collection_letters.find_one({"payment_token": payment_token}, {"_id": 0})
    if not letter:
        raise HTTPException(status_code=404, detail="Payment link not found")

    session_token = data.get("session_token", "")
    if session_token != letter.get("active_session_token"):
        raise HTTPException(status_code=403, detail="Session expired. Please verify your identity again.")

    amount = float(data.get("amount", 0))
    remaining = max(0, letter.get("amount_owed", 0) - letter.get("amount_paid", 0))
    if amount <= 0 or amount > remaining:
        raise HTTPException(status_code=422, detail=f"Payment amount must be between $0.01 and ${remaining:.2f}")

    card_number = data.get("card_number", "")
    expiration_date = data.get("expiration_date", "")
    card_code = data.get("card_code", "")

    if not card_number or not expiration_date or not card_code:
        raise HTTPException(status_code=422, detail="Card number, expiration date, and CVV are required")

    # Process via Authorize.net
    try:
        from authorizenet_service import charge_credit_card
        result = charge_credit_card(
            amount=amount,
            card_number=card_number.replace(" ", "").replace("-", ""),
            expiration_date=expiration_date,
            card_code=card_code,
            order_description=f"Collection Payment - Account {letter.get('account_number', '')}",
            invoice_number=f"COL-{payment_token[:8]}",
            customer_email=None,
            bill_to={
                "firstName": letter.get("consumer_first_name", ""),
                "lastName": letter.get("consumer_last_name", ""),
                "address": letter.get("consumer_address_street", ""),
                "city": letter.get("consumer_address_city", ""),
                "state": letter.get("consumer_address_state", ""),
                "zip": letter.get("consumer_address_zip", ""),
                "country": "US"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Payment processing error: {str(e)}")

    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message", "Payment declined"))

    now_iso = datetime.now(timezone.utc).isoformat()

    # Record the transaction locally on the letter
    txn = {
        "id": str(uuid.uuid4()),
        "transaction_id": result.get("transaction_id", ""),
        "amount": amount,
        "processed_at": now_iso,
        "card_last_four": card_number[-4:] if len(card_number) >= 4 else "",
        "response_code": result.get("response_code", ""),
    }

    new_paid = letter.get("amount_paid", 0) + amount
    new_remaining = max(0, letter.get("amount_owed", 0) - new_paid)
    new_status = "paid" if new_remaining <= 0 else "partial"

    await db.collection_letters.update_one(
        {"payment_token": payment_token},
        {
            "$set": {
                "amount_paid": new_paid,
                "payment_status": new_status,
                "updated_at": now_iso
            },
            "$push": {"payment_transactions": txn}
        }
    )

    # ── Record to central finance ledger (authorizenet_transactions + revenue_records) ──
    consumer_name = f"{letter.get('consumer_first_name', '')} {letter.get('consumer_last_name', '')}".strip()
    central_txn = {
        "id": str(uuid.uuid4()),
        "transaction_id": result.get("transaction_id", ""),
        "type": "payment",
        "amount": abs(float(amount)),
        "status": "settled",
        "payment_method": "credit_card",
        "card_type": result.get("account_type"),
        "last_four": card_number[-4:] if len(card_number) >= 4 else None,
        "auth_code": result.get("auth_code"),
        "avs_result": result.get("avs_result"),
        "cvv_result": result.get("cvv_result"),
        "response_code": result.get("response_code"),
        "network_trans_id": result.get("network_trans_id"),
        "gateway_message": result.get("message"),
        "client_type": "past_due_collections",
        "source_category": "past_due_collections",
        "client_name": consumer_name,
        "customer_name": consumer_name,
        "customer_email": None,
        "customer_id": letter.get("account_number"),
        "invoice_number": f"COL-{payment_token[:8]}",
        "description": f"Collection Payment - Account {letter.get('account_number', '')}",
        "created_by_id": "consumer_self_pay",
        "created_by_name": consumer_name or "Consumer",
        "created_at": now_iso,
        "updated_at": now_iso,
    }
    await db.authorizenet_transactions.insert_one(central_txn)

    rev = {
        "id": str(uuid.uuid4()),
        "source": "authorizenet",
        "category": "past_due_collections",
        "amount": float(amount),
        "description": f"Collection Payment - {consumer_name} (Account {letter.get('account_number', '')})",
        "reference_id": result.get("transaction_id"),
        "reference_type": "authorizenet_gateway",
        "payment_status": "paid",
        "payment_method": "credit_card",
        "payment_date": now_iso,
        "created_by_id": "consumer_self_pay",
        "created_by_name": consumer_name or "Consumer",
        "created_at": now_iso,
        "updated_at": now_iso,
    }
    await db.revenue_records.insert_one(rev)

    return {
        "success": True,
        "transaction_id": result.get("transaction_id", ""),
        "amount_paid": amount,
        "total_paid": new_paid,
        "amount_remaining": new_remaining,
        "payment_status": new_status,
        "message": "Payment processed successfully. Thank you."
    }


@collections_letter_router.get("/pay/{payment_token}/info")
async def get_payment_info(payment_token: str):
    """Public endpoint: Check if a payment link exists (no sensitive data returned)."""
    letter = await db.collection_letters.find_one({"payment_token": payment_token}, {"_id": 0})
    if not letter:
        raise HTTPException(status_code=404, detail="Payment link not found or expired")
    return {
        "valid": True,
        "payment_status": letter.get("payment_status", "unpaid"),
        "has_verification": bool(letter.get("consumer_ssn_last_four")),
    }
