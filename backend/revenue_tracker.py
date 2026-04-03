"""
Centralized revenue tracking helper.
Every module that handles money should call log_revenue() to ensure
the transaction appears on the Finance Dashboard via the revenue_records collection.
"""
from datetime import datetime, timezone
from uuid import uuid4


async def log_revenue(
    db,
    *,
    source: str,
    category: str,
    amount: float,
    description: str,
    reference_id: str = "",
    reference_type: str = "",
    payment_status: str = "paid",
    payment_method: str = "",
    recorded_by_id: str = "system",
    recorded_by_name: str = "System",
):
    """Insert a revenue record into the central finance ledger."""
    now = datetime.now(timezone.utc).isoformat()
    record = {
        "id": str(uuid4()),
        "source": source,
        "category": category,
        "amount": float(amount),
        "description": description,
        "reference_id": reference_id,
        "reference_type": reference_type,
        "payment_status": payment_status,
        "payment_method": payment_method,
        "payment_date": now,
        "created_by_id": recorded_by_id,
        "created_by_name": recorded_by_name,
        "created_at": now,
        "updated_at": now,
    }
    await db.revenue_records.insert_one(record)
    record.pop("_id", None)
    return record
