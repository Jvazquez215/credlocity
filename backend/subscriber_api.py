"""
Credlocity Email Subscriber System
Auto-enrolls CRO registrants and manages email subscriber lists for press releases, blogs, updates.
"""
from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from datetime import datetime, timezone
from uuid import uuid4
import os
from motor.motor_asyncio import AsyncIOMotorClient

subscriber_router = APIRouter(prefix="/api/subscribers", tags=["Email Subscribers"])

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

SUBSCRIBER_TAGS = ["cro", "attorney", "client", "blog", "press_release", "updates", "newsletter", "general"]


async def get_admin_user(authorization: Optional[str] = Header(None)):
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
        raise HTTPException(status_code=403, detail="Admin access required")


# ==================== AUTO-ENROLLMENT ====================

async def enroll_subscriber(email, name, source, tags=None):
    """Auto-enroll an email into the subscriber system. Idempotent — updates tags if already exists."""
    email = email.lower().strip()
    tags = tags or ["general", "blog", "press_release", "updates"]

    existing = await db.email_subscribers.find_one({"email": email})
    if existing:
        merged_tags = list(set(existing.get("tags", []) + tags))
        merged_sources = list(set(existing.get("sources", []) + [source]))
        await db.email_subscribers.update_one(
            {"email": email},
            {"$set": {"tags": merged_tags, "sources": merged_sources, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        return existing.get("id")

    subscriber = {
        "id": str(uuid4()),
        "email": email,
        "name": name,
        "tags": tags,
        "sources": [source],
        "status": "active",
        "unsubscribed_at": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.email_subscribers.insert_one(subscriber)
    subscriber.pop("_id", None)
    return subscriber["id"]


# ==================== ADMIN ENDPOINTS ====================

@subscriber_router.get("/list")
async def list_subscribers(
    tag: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    skip: int = 0,
    authorization: Optional[str] = Header(None)
):
    user = await get_admin_user(authorization)
    require_admin(user)

    query = {}
    if tag:
        query["tags"] = tag
    if status:
        query["status"] = status
    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"name": {"$regex": search, "$options": "i"}},
        ]

    total = await db.email_subscribers.count_documents(query)
    subscribers = await db.email_subscribers.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)

    tag_counts = {}
    for t in SUBSCRIBER_TAGS:
        tag_counts[t] = await db.email_subscribers.count_documents({"tags": t, "status": "active"})

    return {
        "subscribers": subscribers,
        "total": total,
        "tag_counts": tag_counts,
        "available_tags": SUBSCRIBER_TAGS,
    }


@subscriber_router.get("/stats")
async def subscriber_stats(authorization: Optional[str] = Header(None)):
    user = await get_admin_user(authorization)
    require_admin(user)

    total = await db.email_subscribers.count_documents({})
    active = await db.email_subscribers.count_documents({"status": "active"})
    unsubscribed = await db.email_subscribers.count_documents({"status": "unsubscribed"})

    tag_counts = {}
    for t in SUBSCRIBER_TAGS:
        tag_counts[t] = await db.email_subscribers.count_documents({"tags": t, "status": "active"})

    source_counts = {}
    pipeline = [
        {"$unwind": "$sources"},
        {"$group": {"_id": "$sources", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    async for doc in db.email_subscribers.aggregate(pipeline):
        source_counts[doc["_id"]] = doc["count"]

    return {
        "total": total,
        "active": active,
        "unsubscribed": unsubscribed,
        "by_tag": tag_counts,
        "by_source": source_counts,
    }


@subscriber_router.put("/{subscriber_id}/tags")
async def update_subscriber_tags(subscriber_id: str, data: dict, authorization: Optional[str] = Header(None)):
    user = await get_admin_user(authorization)
    require_admin(user)

    sub = await db.email_subscribers.find_one({"id": subscriber_id})
    if not sub:
        raise HTTPException(status_code=404, detail="Subscriber not found")

    tags = data.get("tags", [])
    await db.email_subscribers.update_one(
        {"id": subscriber_id},
        {"$set": {"tags": tags, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Tags updated"}


@subscriber_router.put("/{subscriber_id}/status")
async def update_subscriber_status(subscriber_id: str, data: dict, authorization: Optional[str] = Header(None)):
    user = await get_admin_user(authorization)
    require_admin(user)

    sub = await db.email_subscribers.find_one({"id": subscriber_id})
    if not sub:
        raise HTTPException(status_code=404, detail="Subscriber not found")

    new_status = data.get("status")
    if new_status not in ["active", "unsubscribed"]:
        raise HTTPException(status_code=400, detail="Status must be 'active' or 'unsubscribed'")

    updates = {"status": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}
    if new_status == "unsubscribed":
        updates["unsubscribed_at"] = datetime.now(timezone.utc).isoformat()

    await db.email_subscribers.update_one({"id": subscriber_id}, {"$set": updates})
    return {"message": f"Subscriber status changed to {new_status}"}


@subscriber_router.delete("/{subscriber_id}")
async def delete_subscriber(subscriber_id: str, authorization: Optional[str] = Header(None)):
    user = await get_admin_user(authorization)
    require_admin(user)

    result = await db.email_subscribers.delete_one({"id": subscriber_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    return {"message": "Subscriber deleted"}


@subscriber_router.post("/add")
async def manually_add_subscriber(data: dict, authorization: Optional[str] = Header(None)):
    user = await get_admin_user(authorization)
    require_admin(user)

    email = data.get("email", "").lower().strip()
    name = data.get("name", "")
    tags = data.get("tags", ["general"])

    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    sub_id = await enroll_subscriber(email, name, "manual_admin", tags)
    return {"message": "Subscriber added", "subscriber_id": sub_id}


@subscriber_router.get("/export")
async def export_subscribers(tag: Optional[str] = None, authorization: Optional[str] = Header(None)):
    user = await get_admin_user(authorization)
    require_admin(user)

    query = {"status": "active"}
    if tag:
        query["tags"] = tag

    subscribers = await db.email_subscribers.find(query, {"_id": 0, "email": 1, "name": 1, "tags": 1}).to_list(10000)
    return {"subscribers": subscribers, "count": len(subscribers)}


# ==================== NOTIFICATION QUEUE ====================

@subscriber_router.get("/notifications")
async def list_notifications(
    status: Optional[str] = None,
    limit: int = 50,
    authorization: Optional[str] = Header(None)
):
    user = await get_admin_user(authorization)
    require_admin(user)

    query = {}
    if status:
        query["status"] = status

    notifications = await db.subscriber_notifications.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(length=limit)
    total = await db.subscriber_notifications.count_documents(query)
    queued = await db.subscriber_notifications.count_documents({"status": "queued"})

    return {"notifications": notifications, "total": total, "queued": queued}


@subscriber_router.put("/notifications/{notification_id}/status")
async def update_notification_status(notification_id: str, data: dict, authorization: Optional[str] = Header(None)):
    user = await get_admin_user(authorization)
    require_admin(user)

    new_status = data.get("status")
    if new_status not in ["queued", "sent", "cancelled"]:
        raise HTTPException(status_code=400, detail="Status must be queued, sent, or cancelled")

    result = await db.subscriber_notifications.update_one(
        {"id": notification_id},
        {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")

    # If marking as sent, count target subscribers
    if new_status == "sent":
        notif = await db.subscriber_notifications.find_one({"id": notification_id})
        target_tags = notif.get("target_tags", [])
        target_count = await db.email_subscribers.count_documents({"status": "active", "tags": {"$in": target_tags}})
        await db.subscriber_notifications.update_one(
            {"id": notification_id},
            {"$set": {"sent_to_count": target_count, "sent_at": datetime.now(timezone.utc).isoformat()}}
        )

    return {"message": f"Notification status updated to {new_status}"}
