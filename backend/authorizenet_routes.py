"""
Authorize.net Gateway API Routes
Connects Authorize.net live payment processing to Credlocity's revenue tracking.
"""

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from uuid import uuid4

import authorizenet_service as anet

router = APIRouter(prefix="/api/gateway", tags=["Authorize.net Gateway"])
db = None

def set_db(database):
    global db
    db = database

async def _get_admin_user(authorization: Optional[str] = Header(None)):
    """Verify admin access"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization required")
    token = authorization.replace("Bearer ", "")
    from auth import decode_access_token
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload.get("sub")}, {"_id": 0})
    if not user or user.get("role") not in ("admin", "manager", "owner"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


class ChargeRequest(BaseModel):
    amount: float
    card_number: str
    expiration_date: str  # YYYY-MM format
    card_code: str
    description: Optional[str] = None
    invoice_number: Optional[str] = None
    customer_email: Optional[str] = None
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    source_category: str = "credit_repair"
    bill_to: Optional[dict] = None

class AuthOnlyRequest(BaseModel):
    amount: float
    card_number: str
    expiration_date: str
    card_code: str
    description: Optional[str] = None

class CaptureRequest(BaseModel):
    transaction_id: str
    amount: Optional[float] = None

class RefundRequest(BaseModel):
    transaction_id: str
    amount: float
    card_last_four: str
    expiration_date: str
    customer_name: Optional[str] = None
    reason: Optional[str] = None

class VoidRequest(BaseModel):
    transaction_id: str
    reason: Optional[str] = None


async def _record_transaction(user, gateway_result, txn_type, amount, extra=None):
    """Record the Authorize.net transaction in our database"""
    extra = extra or {}
    txn = {
        "id": str(uuid4()),
        "transaction_id": gateway_result.get("transaction_id", ""),
        "type": txn_type,
        "amount": abs(float(amount)),
        "status": "settled" if gateway_result.get("success") else "declined",
        "payment_method": "credit_card",
        "card_type": gateway_result.get("account_type"),
        "last_four": gateway_result.get("account_number", "")[-4:] if gateway_result.get("account_number") else None,
        "auth_code": gateway_result.get("auth_code"),
        "avs_result": gateway_result.get("avs_result"),
        "cvv_result": gateway_result.get("cvv_result"),
        "response_code": gateway_result.get("response_code"),
        "network_trans_id": gateway_result.get("network_trans_id"),
        "gateway_message": gateway_result.get("message") or gateway_result.get("error_message"),
        "source_category": extra.get("source_category", "credit_repair"),
        "client_type": extra.get("source_category", "credit_repair"),
        "client_name": extra.get("customer_name"),
        "customer_name": extra.get("customer_name"),
        "customer_email": extra.get("customer_email"),
        "customer_id": extra.get("customer_id"),
        "invoice_number": extra.get("invoice_number"),
        "description": extra.get("description"),
        "ref_trans_id": extra.get("ref_trans_id"),
        "notes": extra.get("reason"),
        "created_by_id": user["id"],
        "created_by_name": user.get("full_name") or user.get("name"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.authorizenet_transactions.insert_one(txn)
    txn.pop("_id", None)
    
    # Also create revenue record if successful
    if gateway_result.get("success") and txn_type not in ("void", "auth_only"):
        rev_amount = float(amount)
        if txn_type in ("refund", "chargeback"):
            rev_amount = -abs(rev_amount)
        
        rev = {
            "id": str(uuid4()),
            "source": "authorizenet",
            "category": txn_type,
            "amount": rev_amount,
            "description": f"Authorize.net {txn_type}: {extra.get('description', '')}",
            "reference_id": gateway_result.get("transaction_id"),
            "reference_type": "authorizenet_gateway",
            "payment_status": "paid",
            "payment_method": "credit_card",
            "payment_date": datetime.now(timezone.utc).isoformat(),
            "created_by_id": user["id"],
            "created_by_name": user.get("full_name") or user.get("name"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.revenue_records.insert_one(rev)
    
    return txn


@router.post("/charge")
async def charge_card(data: ChargeRequest, authorization: Optional[str] = Header(None)):
    """Charge a credit card (authorize + capture) via Authorize.net"""
    user = await _get_admin_user(authorization)
    
    result = anet.charge_credit_card(
        amount=data.amount,
        card_number=data.card_number,
        expiration_date=data.expiration_date,
        card_code=data.card_code,
        order_description=data.description,
        invoice_number=data.invoice_number,
        customer_email=data.customer_email,
        customer_id=data.customer_id,
        bill_to=data.bill_to
    )
    
    txn = await _record_transaction(user, result, "payment", data.amount, {
        "source_category": data.source_category,
        "customer_name": data.customer_name,
        "customer_email": data.customer_email,
        "customer_id": data.customer_id,
        "invoice_number": data.invoice_number,
        "description": data.description,
    })
    
    return {
        "gateway_response": result,
        "recorded_transaction": txn
    }


@router.post("/authorize")
async def authorize_card(data: AuthOnlyRequest, authorization: Optional[str] = Header(None)):
    """Authorize a credit card (hold funds, don't capture yet)"""
    user = await _get_admin_user(authorization)
    
    result = anet.authorize_only(
        amount=data.amount,
        card_number=data.card_number,
        expiration_date=data.expiration_date,
        card_code=data.card_code,
        order_description=data.description
    )
    
    txn = await _record_transaction(user, result, "auth_only", data.amount, {
        "description": data.description,
    })
    
    return {"gateway_response": result, "recorded_transaction": txn}


@router.post("/capture")
async def capture_payment(data: CaptureRequest, authorization: Optional[str] = Header(None)):
    """Capture a previously authorized transaction"""
    user = await _get_admin_user(authorization)
    
    result = anet.capture_authorized(
        transaction_id=data.transaction_id,
        amount=data.amount
    )
    
    txn = await _record_transaction(user, result, "capture", data.amount or 0, {
        "ref_trans_id": data.transaction_id,
        "description": f"Capture of auth {data.transaction_id}",
    })
    
    return {"gateway_response": result, "recorded_transaction": txn}


@router.post("/refund")
async def refund_payment(data: RefundRequest, authorization: Optional[str] = Header(None)):
    """Refund a settled transaction"""
    user = await _get_admin_user(authorization)
    
    result = anet.refund_transaction(
        transaction_id=data.transaction_id,
        amount=data.amount,
        card_number_last_four=data.card_last_four,
        expiration_date=data.expiration_date
    )
    
    txn = await _record_transaction(user, result, "refund", data.amount, {
        "ref_trans_id": data.transaction_id,
        "customer_name": data.customer_name,
        "reason": data.reason,
        "description": f"Refund of txn {data.transaction_id}",
    })
    
    return {"gateway_response": result, "recorded_transaction": txn}


@router.post("/void")
async def void_payment(data: VoidRequest, authorization: Optional[str] = Header(None)):
    """Void an unsettled transaction"""
    user = await _get_admin_user(authorization)
    
    result = anet.void_transaction(transaction_id=data.transaction_id)
    
    txn = await _record_transaction(user, result, "void", 0, {
        "ref_trans_id": data.transaction_id,
        "reason": data.reason,
        "description": f"Void of txn {data.transaction_id}",
    })
    
    return {"gateway_response": result, "recorded_transaction": txn}


@router.get("/transaction/{transaction_id}")
async def get_transaction(transaction_id: str, authorization: Optional[str] = Header(None)):
    """Get transaction details from Authorize.net gateway"""
    await _get_admin_user(authorization)
    result = anet.get_transaction_details(transaction_id)
    return result


@router.get("/batches")
async def get_batches(authorization: Optional[str] = Header(None)):
    """Get settled batch list from Authorize.net (last 30 days)"""
    await _get_admin_user(authorization)
    result = anet.get_settled_batch_list()
    return result


@router.get("/health")
async def gateway_health():
    """Check if Authorize.net credentials are configured"""
    configured = bool(anet.API_LOGIN_ID and anet.TRANSACTION_KEY)
    return {
        "configured": configured,
        "environment": anet.ENV,
        "api_login_id_set": bool(anet.API_LOGIN_ID),
        "transaction_key_set": bool(anet.TRANSACTION_KEY)
    }
