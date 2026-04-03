"""
Centralized Payment Processor
Routes ALL platform payments through Authorize.net and records
transactions to the central finance ledger (authorizenet_transactions + revenue_records).
"""

from datetime import datetime, timezone
from uuid import uuid4
import authorizenet_service as anet

db = None

def set_db(database):
    global db
    db = database


async def process_and_record_payment(
    amount: float,
    card_number: str,
    expiration_date: str,
    card_code: str,
    source_category: str,
    description: str = "",
    invoice_number: str = None,
    customer_email: str = None,
    customer_id: str = None,
    customer_name: str = None,
    bill_to: dict = None,
    recorded_by_id: str = "system",
    recorded_by_name: str = "System",
):
    """
    Charge a credit card via Authorize.net, then record the transaction
    in both `authorizenet_transactions` and `revenue_records`.

    Returns dict with keys: success, transaction_id, gateway_result, recorded_txn
    """

    # 1) Charge via Authorize.net
    gateway_result = anet.charge_credit_card(
        amount=amount,
        card_number=card_number.replace(" ", "").replace("-", ""),
        expiration_date=expiration_date,
        card_code=card_code,
        order_description=description,
        invoice_number=invoice_number,
        customer_email=customer_email,
        customer_id=customer_id,
        bill_to=bill_to,
    )

    # 2) Record to authorizenet_transactions
    now_iso = datetime.now(timezone.utc).isoformat()
    txn = {
        "id": str(uuid4()),
        "transaction_id": gateway_result.get("transaction_id", ""),
        "type": "payment",
        "amount": abs(float(amount)),
        "status": "settled" if gateway_result.get("success") else "declined",
        "payment_method": "credit_card",
        "card_type": gateway_result.get("account_type"),
        "last_four": (gateway_result.get("account_number", "") or "")[-4:] or None,
        "auth_code": gateway_result.get("auth_code"),
        "avs_result": gateway_result.get("avs_result"),
        "cvv_result": gateway_result.get("cvv_result"),
        "response_code": gateway_result.get("response_code"),
        "network_trans_id": gateway_result.get("network_trans_id"),
        "gateway_message": gateway_result.get("message") or gateway_result.get("error_message"),
        "client_type": source_category,
        "source_category": source_category,
        "client_name": customer_name,
        "customer_name": customer_name,
        "customer_email": customer_email,
        "customer_id": customer_id,
        "invoice_number": invoice_number,
        "description": description,
        "created_by_id": recorded_by_id,
        "created_by_name": recorded_by_name,
        "created_at": now_iso,
        "updated_at": now_iso,
    }
    await db.authorizenet_transactions.insert_one(txn)
    txn.pop("_id", None)

    # 3) Record revenue if successful
    if gateway_result.get("success"):
        rev = {
            "id": str(uuid4()),
            "source": "authorizenet",
            "category": source_category,
            "amount": float(amount),
            "description": f"Authorize.net payment: {description}",
            "reference_id": gateway_result.get("transaction_id"),
            "reference_type": "authorizenet_gateway",
            "payment_status": "paid",
            "payment_method": "credit_card",
            "payment_date": now_iso,
            "created_by_id": recorded_by_id,
            "created_by_name": recorded_by_name,
            "created_at": now_iso,
            "updated_at": now_iso,
        }
        await db.revenue_records.insert_one(rev)

    return {
        "success": gateway_result.get("success", False),
        "transaction_id": gateway_result.get("transaction_id", ""),
        "gateway_result": gateway_result,
        "recorded_txn": txn,
    }
