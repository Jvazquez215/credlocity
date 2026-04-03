"""
Affiliate Landing Pages API
CRUD for affiliate profiles with file uploads and SEO-optimized public pages.
"""

from fastapi import APIRouter, HTTPException, Header, UploadFile, File, Form
from datetime import datetime, timezone
from typing import Optional, List
from uuid import uuid4
from pydantic import BaseModel
import re

affiliate_router = APIRouter(prefix="/affiliate-pages", tags=["Affiliate Landing Pages"])
db = None

def set_db(database):
    global db
    db = database


AFFILIATE_TYPES = {
    "real_estate": "Real Estate",
    "social_media": "Social Media",
    "credit_repair_educator": "Credit Repair Educator",
    "mortgage": "Mortgage",
    "car_dealership": "Car Dealership",
}


def generate_slug(name: str, affiliate_type: str, city: str = "") -> str:
    parts = [name]
    if city:
        parts.append(city)
    type_labels = {
        "real_estate": "realtor",
        "social_media": "creator",
        "credit_repair_educator": "credit-educator",
        "mortgage": "mortgage",
        "car_dealership": "auto",
    }
    parts.append(type_labels.get(affiliate_type, "partner"))
    raw = "-".join(parts)
    return re.sub(r'[^a-z0-9]+', '-', raw.lower()).strip('-')


async def _get_user(authorization: str = Header(None)):
    if not authorization:
        return None
    try:
        from server import decode_token
        token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
        payload = decode_token(token)
        if not payload:
            return None
        email = payload.get("sub", "")
        user = await db.users.find_one({"email": email}, {"_id": 0, "password_hash": 0})
        if user:
            return user
        emp = await db.collections_employees.find_one({"email": email, "is_active": True}, {"_id": 0, "password_hash": 0})
        if emp:
            return {"email": email, "role": emp.get("role")}
        return None
    except Exception:
        return None


# ==================== PUBLIC ENDPOINTS (must be before /{affiliate_id}) ====================

@affiliate_router.get("/public/by-slug/{slug}")
async def get_public_affiliate(slug: str):
    """Public endpoint to get affiliate data for landing page."""
    aff = await db.affiliates.find_one({"slug": slug, "status": "published"}, {"_id": 0})
    if not aff:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    aff.pop("created_by", None)
    return aff


@affiliate_router.get("/public/all")
async def get_all_public_affiliates():
    """Get all published affiliates for directory."""
    affiliates = await db.affiliates.find({"status": "published", "affiliate_type": {"$exists": True}}, {"_id": 0, "custom_form_html": 0}).sort("name", 1).to_list(None)
    for a in affiliates:
        a.pop("created_by", None)
    return {"affiliates": affiliates}


@affiliate_router.get("/types")
async def get_affiliate_types(authorization: Optional[str] = Header(None)):
    return {"types": AFFILIATE_TYPES}


# ==================== ADMIN CRUD ====================

@affiliate_router.get("")
async def list_affiliates(
    authorization: Optional[str] = Header(None),
    affiliate_type: Optional[str] = None,
    status: Optional[str] = None,
):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    query = {"affiliate_type": {"$exists": True}}
    if affiliate_type:
        query["affiliate_type"] = affiliate_type
    if status:
        query["status"] = status
    affiliates = await db.affiliates.find(query, {"_id": 0}).sort("created_at", -1).to_list(None)
    return {"affiliates": affiliates, "total": len(affiliates)}


@affiliate_router.get("/{affiliate_id}")
async def get_affiliate(affiliate_id: str, authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    aff = await db.affiliates.find_one({"id": affiliate_id}, {"_id": 0})
    if not aff:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    return aff


@affiliate_router.post("")
async def create_affiliate(data: dict, authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    name = data.get("name", "").strip()
    if not name:
        raise HTTPException(status_code=422, detail="Name is required")

    affiliate_type = data.get("affiliate_type", "real_estate")
    city = data.get("city", "")
    slug = generate_slug(name, affiliate_type, city)

    existing = await db.affiliates.find_one({"slug": slug})
    if existing:
        slug = f"{slug}-{str(uuid4())[:6]}"

    now = datetime.now(timezone.utc).isoformat()
    affiliate = {
        "id": str(uuid4()),
        "name": name,
        "display_name": data.get("display_name", name),
        "slug": slug,
        "affiliate_type": affiliate_type,
        "status": data.get("status", "draft"),
        "bio": data.get("bio", ""),
        "tagline": data.get("tagline", ""),
        "city": city,
        "state": data.get("state", ""),
        "niche_keywords": data.get("niche_keywords", ""),
        "headshot_url": data.get("headshot_url", ""),
        "logo_url": data.get("logo_url", ""),
        "video_url": data.get("video_url", ""),
        "website": data.get("website", ""),
        "social_media": {
            "instagram": data.get("instagram", ""),
            "facebook": data.get("facebook", ""),
            "youtube": data.get("youtube", ""),
            "tiktok": data.get("tiktok", ""),
            "linkedin": data.get("linkedin", ""),
            "twitter": data.get("twitter", ""),
        },
        "custom_form_html": data.get("custom_form_html", ""),
        "seo_title": data.get("seo_title", ""),
        "seo_description": data.get("seo_description", ""),
        "seo_keywords": data.get("seo_keywords", ""),
        "testimonials": data.get("testimonials", []),
        "services_highlight": data.get("services_highlight", []),
        "created_by": user.get("email", ""),
        "created_at": now,
        "updated_at": now,
    }
    await db.affiliates.insert_one(affiliate)
    affiliate.pop("_id", None)
    return affiliate


@affiliate_router.put("/{affiliate_id}")
async def update_affiliate(affiliate_id: str, data: dict, authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    aff = await db.affiliates.find_one({"id": affiliate_id}, {"_id": 0})
    if not aff:
        raise HTTPException(status_code=404, detail="Affiliate not found")

    update = {"updated_at": datetime.now(timezone.utc).isoformat()}
    allowed = [
        "name", "display_name", "slug", "affiliate_type", "status", "bio", "tagline",
        "city", "state", "niche_keywords", "headshot_url", "logo_url", "video_url",
        "website", "custom_form_html", "seo_title", "seo_description", "seo_keywords",
        "testimonials", "services_highlight",
    ]
    for field in allowed:
        if field in data:
            update[field] = data[field]

    # Handle social media as nested
    if "social_media" in data:
        update["social_media"] = data["social_media"]
    for sm in ["instagram", "facebook", "youtube", "tiktok", "linkedin", "twitter"]:
        if sm in data:
            update[f"social_media.{sm}"] = data[sm]

    await db.affiliates.update_one({"id": affiliate_id}, {"$set": update})
    updated = await db.affiliates.find_one({"id": affiliate_id}, {"_id": 0})
    return updated


@affiliate_router.delete("/{affiliate_id}")
async def delete_affiliate(affiliate_id: str, authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    result = await db.affiliates.delete_one({"id": affiliate_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}


@affiliate_router.post("/{affiliate_id}/upload/{file_type}")
async def upload_affiliate_file(
    affiliate_id: str,
    file_type: str,
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None),
):
    """Upload headshot, logo, or video for an affiliate."""
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if file_type not in ["headshot", "logo", "video"]:
        raise HTTPException(status_code=422, detail="Invalid file type. Use: headshot, logo, video")

    aff = await db.affiliates.find_one({"id": affiliate_id}, {"_id": 0})
    if not aff:
        raise HTTPException(status_code=404, detail="Affiliate not found")

    data = await file.read()
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    storage_key = f"affiliates/{affiliate_id}/{file_type}.{ext}"

    from object_storage import put_object
    result = put_object(storage_key, data, content_type=file.content_type or "application/octet-stream")

    url_field = f"{file_type}_url"
    file_url = result.get("url", f"/api/affiliates/{affiliate_id}/file/{file_type}")

    await db.affiliates.update_one(
        {"id": affiliate_id},
        {"$set": {url_field: file_url, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"url": file_url, "file_type": file_type}


# (public endpoints moved above /{affiliate_id} routes)
