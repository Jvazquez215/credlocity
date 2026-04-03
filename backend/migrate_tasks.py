"""
Migration script: Add merger task fields to all cpr_clients.
Run once after seed data is loaded.
"""
import os
import asyncio
from datetime import datetime, timezone
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

DEFAULT_TASK = {"complete": False, "completed_date": None, "completed_by": None}

DEFAULT_TASKS = {
    "id_uploaded": {**DEFAULT_TASK, "file_url": None, "file_name": None},
    "ssn_uploaded": {**DEFAULT_TASK, "file_url": None, "file_name": None},
    "proof_of_address_uploaded": {**DEFAULT_TASK, "file_url": None, "file_name": None},
    "scorefusion_ordered": {**DEFAULT_TASK, "confirmation_number": None},
    "notary_invoice_sent": {**DEFAULT_TASK, "invoice_amount": None, "invoice_notes": None},
    "notary_payment_received": {**DEFAULT_TASK, "amount_paid": None, "payment_method": None},
    "notary_completed": {**DEFAULT_TASK, "notary_provider": None},
    "disputes_sent": {**DEFAULT_TASK, "dispute_round": None, "notes": None},
}


async def migrate():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]

    update_fields = {
        "tasks": {k: dict(v) for k, v in DEFAULT_TASKS.items()},
        "tasks_completed_count": 0,
        "tasks_total": 8,
        "merger_progress_pct": 0.0,
        "shar_confirmed": False,
        "shar_confirmed_date": None,
        "joe_verified_date": None,
        "merger_completed_date": None,
        "canceled": False,
        "canceled_date": None,
        "canceled_by": None,
        "cancellation_reason": None,
        "last_task_activity": None,
    }

    # Update clients that don't have tasks yet
    result = await db.cpr_clients.update_many(
        {"tasks": {"$exists": False}},
        {"$set": update_fields}
    )
    print(f"[MIGRATE] Updated {result.modified_count} cpr_clients with task fields")

    # Also update merger_status for clients without proper status
    await db.cpr_clients.update_many(
        {"merger_status": "pending", "tasks": {"$exists": True}},
        {"$set": {"merger_status": "not_started"}}
    )

    # Create indexes
    await db.cpr_clients.create_index("merger_status")
    await db.cpr_clients.create_index("last_task_activity")
    await db.cpr_clients.create_index([("category", 1), ("merger_status", 1)])

    # Create merger_task_log collection index
    await db.merger_task_log.create_index("client_id")
    await db.merger_task_log.create_index("performed_at")

    # Create bug_tickets collection indexes
    await db.bug_tickets.create_index("ticket_number", unique=True)
    await db.bug_tickets.create_index("submitted_by")
    await db.bug_tickets.create_index("status")

    # Verify
    total = await db.cpr_clients.count_documents({"tasks": {"$exists": True}})
    print(f"[MIGRATE] {total} clients now have task fields")

    client.close()


if __name__ == "__main__":
    asyncio.run(migrate())
