"""
E-Book Management API - Complete system for managing downloadable PDF e-books.
Supports free (email capture) and paid (Authorize.net) e-books.
Individual e-book pages with SEO, social sharing, and AI cover generation.
"""
import os
import re
import uuid
import base64
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Request
from fastapi.responses import Response
from pydantic import BaseModel

ebook_router = APIRouter(prefix="/api/ebooks", tags=["E-Books"])

db = None

def set_db(database):
    global db
    db = database

# Object storage functions - use local module
from object_storage import put_object, get_object


def generate_slug(title: str) -> str:
    """Generate URL-friendly slug from title."""
    slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
    return slug


# ============ MODELS ============

class EbookCreate(BaseModel):
    title: str
    description: str
    price: float = 0.0
    category: str = "consumers"
    cover_image_url: Optional[str] = None
    is_active: bool = True
    is_featured: bool = False
    tags: List[str] = []
    attach_to_pages: List[str] = []
    attach_to_blogs: List[str] = []
    is_signup_bonus: bool = False
    bonus_value_display: Optional[float] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    social_caption: Optional[str] = None


class EbookUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    cover_image_url: Optional[str] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    tags: Optional[List[str]] = None
    attach_to_pages: Optional[List[str]] = None
    attach_to_blogs: Optional[List[str]] = None
    is_signup_bonus: Optional[bool] = None
    bonus_value_display: Optional[float] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    social_caption: Optional[str] = None
    slug: Optional[str] = None
    author: Optional[str] = None
    release_date: Optional[str] = None
    complementary_ebook_ids: Optional[List[str]] = None


class DownloadRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    referral_source: Optional[str] = None  # facebook, twitter, instagram, direct, organic


class PurchaseRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    card_number: str
    expiration_date: str  # MMYY
    card_code: str
    referral_source: Optional[str] = None


class CoverGenerateRequest(BaseModel):
    title: str
    description: str = ""
    style: str = "professional"  # professional, modern, minimalist, bold


# ============ ADMIN CRUD ============

@ebook_router.post("/create")
async def create_ebook(
    title: str = Form(...),
    description: str = Form(""),
    price: float = Form(0.0),
    category: str = Form("consumers"),
    cover_image_url: str = Form(""),
    is_active: bool = Form(True),
    is_featured: bool = Form(False),
    tags: str = Form(""),
    is_signup_bonus: bool = Form(False),
    bonus_value_display: float = Form(0.0),
    meta_title: str = Form(""),
    meta_description: str = Form(""),
    social_caption: str = Form(""),
    author: str = Form(""),
    release_date: str = Form(""),
    complementary_ebook_ids: str = Form(""),
    file: UploadFile = File(...)
):
    """Create a new e-book with PDF upload."""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    data = await file.read()
    if len(data) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 50MB)")

    # Upload to object storage
    storage_key = f"ebooks/{uuid.uuid4()}/{file.filename}"
    result = put_object(storage_key, data, content_type="application/pdf")

    ebook_id = str(uuid.uuid4())
    slug = generate_slug(title)

    # Ensure unique slug
    existing = await db.ebooks.find_one({"slug": slug})
    if existing:
        slug = f"{slug}-{ebook_id[:6]}"

    doc = {
        "id": ebook_id,
        "slug": slug,
        "title": title,
        "description": description,
        "price": price,
        "category": category,
        "cover_image_url": cover_image_url or "",
        "cover_storage_path": "",
        "is_active": is_active,
        "is_featured": is_featured,
        "tags": [t.strip() for t in tags.split(",") if t.strip()] if tags else [],
        "attach_to_pages": [],
        "attach_to_blogs": [],
        "is_signup_bonus": is_signup_bonus,
        "bonus_value_display": bonus_value_display if bonus_value_display else None,
        "author": author or "Credlocity",
        "release_date": release_date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "complementary_ebook_ids": [c.strip() for c in complementary_ebook_ids.split(",") if c.strip()] if complementary_ebook_ids else [],
        "meta_title": meta_title or title,
        "meta_description": meta_description or description[:160] if description else "",
        "social_caption": social_caption or "",
        "storage_path": result.get("path", storage_key),
        "original_filename": file.filename,
        "file_size": len(data),
        "download_count": 0,
        "purchase_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.ebooks.insert_one(doc)
    doc.pop("_id", None)
    return doc


@ebook_router.get("/list")
async def list_ebooks(
    category: Optional[str] = None,
    active_only: bool = False,
    featured_only: bool = False,
):
    """List all e-books with optional filters."""
    query = {}
    if category:
        query["$or"] = [{"category": category}, {"category": "both"}]
    if active_only:
        query["is_active"] = True
    if featured_only:
        query["is_featured"] = True

    ebooks = await db.ebooks.find(query, {"_id": 0}).sort("created_at", -1).to_list(None)
    return {"ebooks": ebooks, "total": len(ebooks)}


@ebook_router.get("/public")
async def list_public_ebooks(category: Optional[str] = None):
    """Public endpoint - only active e-books, no storage paths."""
    query = {"is_active": True}
    if category:
        query["$or"] = [{"category": category}, {"category": "both"}]

    ebooks = await db.ebooks.find(query, {
        "_id": 0, "storage_path": 0, "original_filename": 0, "cover_storage_path": 0
    }).sort("created_at", -1).to_list(None)
    return {"ebooks": ebooks, "total": len(ebooks)}


@ebook_router.get("/signup-bonus")
async def get_signup_bonus_ebooks():
    """Get e-books marked as signup bonuses."""
    ebooks = await db.ebooks.find(
        {"is_signup_bonus": True, "is_active": True},
        {"_id": 0, "storage_path": 0, "original_filename": 0, "cover_storage_path": 0}
    ).to_list(None)
    return ebooks


@ebook_router.get("/for-page/{page_slug}")
async def get_ebooks_for_page(page_slug: str):
    """Get active e-books attached to a specific page."""
    ebooks = await db.ebooks.find(
        {"attach_to_pages": page_slug, "is_active": True},
        {"_id": 0, "storage_path": 0, "original_filename": 0, "cover_storage_path": 0}
    ).to_list(None)
    return ebooks


@ebook_router.get("/for-blog/{blog_id}")
async def get_ebooks_for_blog(blog_id: str):
    """Get active e-books attached to a specific blog post."""
    ebooks = await db.ebooks.find(
        {"attach_to_blogs": blog_id, "is_active": True},
        {"_id": 0, "storage_path": 0, "original_filename": 0, "cover_storage_path": 0}
    ).to_list(None)
    return ebooks


@ebook_router.get("/slug/{slug}")
async def get_ebook_by_slug(slug: str):
    """Get a single e-book by slug (public, for detail pages)."""
    ebook = await db.ebooks.find_one(
        {"slug": slug, "is_active": True},
        {"_id": 0, "storage_path": 0, "original_filename": 0, "cover_storage_path": 0}
    )
    if not ebook:
        raise HTTPException(status_code=404, detail="E-book not found")
    return ebook


@ebook_router.get("/cover-image/{ebook_id}")
async def serve_cover_image(ebook_id: str):
    """Serve the AI-generated cover image from object storage."""
    ebook = await db.ebooks.find_one({"id": ebook_id})
    if not ebook or not ebook.get("cover_storage_path"):
        raise HTTPException(status_code=404, detail="Cover image not found")
    try:
        data, ct = get_object(ebook["cover_storage_path"])
        return Response(content=data, media_type=ct or "image/png",
                        headers={"Cache-Control": "public, max-age=86400"})
    except Exception:
        raise HTTPException(status_code=404, detail="Cover image not found")


@ebook_router.get("/{ebook_id}")
async def get_ebook(ebook_id: str):
    """Get a single e-book by ID."""
    ebook = await db.ebooks.find_one({"id": ebook_id}, {"_id": 0})
    if not ebook:
        raise HTTPException(status_code=404, detail="E-book not found")
    return ebook


@ebook_router.put("/{ebook_id}")
async def update_ebook(ebook_id: str, update: EbookUpdate):
    """Update an e-book."""
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    # If title changed, regenerate slug
    if "title" in update_data and "slug" not in update_data:
        new_slug = generate_slug(update_data["title"])
        existing = await db.ebooks.find_one({"slug": new_slug, "id": {"$ne": ebook_id}})
        if existing:
            new_slug = f"{new_slug}-{ebook_id[:6]}"
        update_data["slug"] = new_slug

    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.ebooks.update_one({"id": ebook_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="E-book not found")

    ebook = await db.ebooks.find_one({"id": ebook_id}, {"_id": 0})
    return ebook


@ebook_router.delete("/{ebook_id}")
async def delete_ebook(ebook_id: str):
    """Delete an e-book."""
    result = await db.ebooks.delete_one({"id": ebook_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="E-book not found")
    return {"message": "E-book deleted"}


# ============ AI COVER GENERATION ============

@ebook_router.post("/generate-cover")
async def generate_cover(req: CoverGenerateRequest):
    """Generate an AI book cover image using OpenAI GPT Image 1."""
    from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration

    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="Image generation not configured")

    style_prompts = {
        "professional": "Clean, corporate, trustworthy design with navy blue and gold accents",
        "modern": "Sleek, contemporary design with bold geometric shapes and gradients",
        "minimalist": "Simple, elegant design with lots of white space and one accent color",
        "bold": "High-impact design with strong typography and dramatic colors",
    }
    style_desc = style_prompts.get(req.style, style_prompts["professional"])

    prompt = (
        f"Professional e-book cover design for a book titled '{req.title}'. "
        f"{f'The book is about: {req.description[:200]}. ' if req.description else ''}"
        f"Style: {style_desc}. "
        f"The cover should have the title '{req.title}' prominently displayed. "
        f"Include 'CREDLOCITY' as the publisher name at the bottom. "
        f"High quality, print-ready book cover, portrait orientation. "
        f"No stock photos, use abstract or illustrative elements."
    )

    try:
        image_gen = OpenAIImageGeneration(api_key=api_key)
        images = await image_gen.generate_images(
            prompt=prompt,
            model="gpt-image-1",
            number_of_images=1
        )

        if not images or len(images) == 0:
            raise HTTPException(status_code=500, detail="No image was generated")

        image_bytes = images[0]
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')

        return {"image_base64": image_base64, "format": "png"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cover generation failed: {str(e)}")


@ebook_router.post("/{ebook_id}/save-cover")
async def save_generated_cover(ebook_id: str):
    """Save a base64 cover image to object storage for an e-book."""
    from fastapi import Body
    import json

    ebook = await db.ebooks.find_one({"id": ebook_id})
    if not ebook:
        raise HTTPException(status_code=404, detail="E-book not found")

    # Read raw body
    return {"error": "Use the upload endpoint instead"}


@ebook_router.post("/{ebook_id}/upload-cover")
async def upload_cover_image(ebook_id: str, file: UploadFile = File(...)):
    """Upload a cover image (PNG/JPG) for an e-book."""
    ebook = await db.ebooks.find_one({"id": ebook_id})
    if not ebook:
        raise HTTPException(status_code=404, detail="E-book not found")

    allowed = ('.png', '.jpg', '.jpeg', '.webp')
    if not file.filename.lower().endswith(allowed):
        raise HTTPException(status_code=400, detail="Only PNG, JPG, WEBP images allowed")

    data = await file.read()
    ext = file.filename.rsplit('.', 1)[-1].lower()
    storage_key = f"ebooks/covers/{ebook_id}.{ext}"
    ct = f"image/{ext}" if ext != "jpg" else "image/jpeg"
    result = put_object(storage_key, data, content_type=ct)

    cover_url = f"/api/ebooks/cover-image/{ebook_id}"
    await db.ebooks.update_one({"id": ebook_id}, {"$set": {
        "cover_storage_path": result.get("path", storage_key),
        "cover_image_url": cover_url,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }})

    return {"cover_image_url": cover_url, "message": "Cover uploaded"}


@ebook_router.post("/{ebook_id}/save-generated-cover")
async def save_generated_cover_b64(ebook_id: str, request: Request):
    """Save a base64-encoded AI-generated cover to object storage."""
    ebook = await db.ebooks.find_one({"id": ebook_id})
    if not ebook:
        raise HTTPException(status_code=404, detail="E-book not found")

    body = await request.json()
    image_b64 = body.get("image_base64", "")
    if not image_b64:
        raise HTTPException(status_code=400, detail="No image data provided")

    image_bytes = base64.b64decode(image_b64)
    storage_key = f"ebooks/covers/{ebook_id}.png"
    result = put_object(storage_key, image_bytes, content_type="image/png")

    cover_url = f"/api/ebooks/cover-image/{ebook_id}"
    await db.ebooks.update_one({"id": ebook_id}, {"$set": {
        "cover_storage_path": result.get("path", storage_key),
        "cover_image_url": cover_url,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }})

    return {"cover_image_url": cover_url, "message": "Cover saved"}


# ============ DOWNLOAD / PURCHASE ============

@ebook_router.post("/{ebook_id}/download")
async def download_free_ebook(ebook_id: str, req: DownloadRequest):
    """Download a free e-book (captures name + email)."""
    ebook = await db.ebooks.find_one({"id": ebook_id}, {"_id": 0})
    if not ebook:
        raise HTTPException(status_code=404, detail="E-book not found")
    if not ebook.get("is_active"):
        raise HTTPException(status_code=400, detail="E-book is not available")
    if ebook.get("price", 0) > 0:
        raise HTTPException(status_code=400, detail="This e-book requires payment")

    # Save lead
    await db.ebook_leads.insert_one({
        "id": str(uuid.uuid4()),
        "ebook_id": ebook_id,
        "ebook_title": ebook["title"],
        "first_name": req.first_name,
        "last_name": req.last_name,
        "email": req.email,
        "type": "free_download",
        "amount": 0,
        "referral_source": req.referral_source or "direct",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    # Increment download count
    await db.ebooks.update_one({"id": ebook_id}, {"$inc": {"download_count": 1}})

    # Return the PDF
    try:
        data, ct = get_object(ebook["storage_path"])
        return Response(
            content=data,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{ebook.get("original_filename", "ebook.pdf")}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve file: {str(e)}")


@ebook_router.post("/{ebook_id}/purchase")
async def purchase_ebook(ebook_id: str, req: PurchaseRequest):
    """Purchase a paid e-book via Authorize.net."""
    ebook = await db.ebooks.find_one({"id": ebook_id}, {"_id": 0})
    if not ebook:
        raise HTTPException(status_code=404, detail="E-book not found")
    if not ebook.get("is_active"):
        raise HTTPException(status_code=400, detail="E-book is not available")
    if ebook.get("price", 0) <= 0:
        raise HTTPException(status_code=400, detail="This e-book is free, use /download instead")

    # Process payment via Authorize.net
    import httpx
    api_login = os.environ.get("AUTHORIZENET_API_LOGIN_ID", "")
    transaction_key = os.environ.get("AUTHORIZENET_TRANSACTION_KEY", "")

    if not api_login or not transaction_key:
        raise HTTPException(status_code=503, detail="Payment gateway not configured")

    xml_request = f"""<?xml version="1.0" encoding="utf-8"?>
    <createTransactionRequest xmlns="AnetApi/xml/v1/schema/AnetApiSchema.xsd">
        <merchantAuthentication>
            <name>{api_login}</name>
            <transactionKey>{transaction_key}</transactionKey>
        </merchantAuthentication>
        <transactionRequest>
            <transactionType>authCaptureTransaction</transactionType>
            <amount>{ebook['price']:.2f}</amount>
            <payment>
                <creditCard>
                    <cardNumber>{req.card_number}</cardNumber>
                    <expirationDate>{req.expiration_date}</expirationDate>
                    <cardCode>{req.card_code}</cardCode>
                </creditCard>
            </payment>
            <billTo>
                <firstName>{req.first_name}</firstName>
                <lastName>{req.last_name}</lastName>
                <email>{req.email}</email>
            </billTo>
            <order>
                <invoiceNumber>EBOOK-{ebook_id[:8]}</invoiceNumber>
                <description>E-Book: {ebook['title'][:50]}</description>
            </order>
        </transactionRequest>
    </createTransactionRequest>"""

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api.authorize.net/xml/v1/request.api",
                content=xml_request,
                headers={"Content-Type": "application/xml"}
            )
            resp_text = resp.text

            if "<resultCode>Ok</resultCode>" in resp_text:
                trans_id_match = re.search(r"<transId>(\d+)</transId>", resp_text)
                trans_id = trans_id_match.group(1) if trans_id_match else "unknown"

                await db.ebook_leads.insert_one({
                    "id": str(uuid.uuid4()),
                    "ebook_id": ebook_id,
                    "ebook_title": ebook["title"],
                    "first_name": req.first_name,
                    "last_name": req.last_name,
                    "email": req.email,
                    "type": "purchase",
                    "amount": ebook["price"],
                    "transaction_id": trans_id,
                    "referral_source": req.referral_source or "direct",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                })

                await db.ebooks.update_one({"id": ebook_id}, {"$inc": {"purchase_count": 1}})

                data, ct = get_object(ebook["storage_path"])
                return Response(
                    content=data,
                    media_type="application/pdf",
                    headers={
                        "Content-Disposition": f'attachment; filename="{ebook.get("original_filename", "ebook.pdf")}"',
                        "X-Transaction-Id": trans_id,
                    }
                )
            else:
                error_match = re.search(r"<text>(.*?)</text>", resp_text)
                error_msg = error_match.group(1) if error_match else "Payment failed"
                raise HTTPException(status_code=402, detail=error_msg)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment processing error: {str(e)}")


# ============ LEADS MANAGEMENT ============

@ebook_router.get("/leads/list")
async def list_ebook_leads(
    ebook_id: Optional[str] = None,
    lead_type: Optional[str] = None,
    limit: int = 100,
):
    """List e-book download/purchase leads."""
    query = {}
    if ebook_id:
        query["ebook_id"] = ebook_id
    if lead_type:
        query["type"] = lead_type

    leads = await db.ebook_leads.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(length=limit)
    total = await db.ebook_leads.count_documents(query)
    return {"leads": leads, "total": total}


@ebook_router.post("/{ebook_id}/upload-pdf")
async def replace_ebook_pdf(ebook_id: str, file: UploadFile = File(...)):
    """Replace the PDF for an existing e-book."""
    ebook = await db.ebooks.find_one({"id": ebook_id})
    if not ebook:
        raise HTTPException(status_code=404, detail="E-book not found")

    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    data = await file.read()
    storage_key = f"ebooks/{uuid.uuid4()}/{file.filename}"
    result = put_object(storage_key, data, content_type="application/pdf")

    await db.ebooks.update_one({"id": ebook_id}, {"$set": {
        "storage_path": result.get("path", storage_key),
        "original_filename": file.filename,
        "file_size": len(data),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }})

    return {"message": "PDF updated", "filename": file.filename}



# ============ ANALYTICS ============

@ebook_router.get("/analytics/overview")
async def get_ebook_analytics():
    """Get e-book analytics: downloads/purchases by source, conversion rates."""
    pipeline_source = [
        {"$group": {
            "_id": {"source": {"$ifNull": ["$referral_source", "direct"]}, "type": "$type"},
            "count": {"$sum": 1},
            "revenue": {"$sum": {"$ifNull": ["$amount", 0]}}
        }}
    ]
    source_data = await db.ebook_leads.aggregate(pipeline_source).to_list(None)

    # Group by source
    sources = {}
    for item in source_data:
        src = item["_id"]["source"]
        typ = item["_id"]["type"]
        if src not in sources:
            sources[src] = {"source": src, "downloads": 0, "purchases": 0, "revenue": 0}
        if typ == "free_download":
            sources[src]["downloads"] = item["count"]
        elif typ == "purchase":
            sources[src]["purchases"] = item["count"]
            sources[src]["revenue"] = item["revenue"]

    # Per-ebook stats
    pipeline_ebook = [
        {"$group": {
            "_id": "$ebook_id",
            "title": {"$first": "$ebook_title"},
            "total_leads": {"$sum": 1},
            "downloads": {"$sum": {"$cond": [{"$eq": ["$type", "free_download"]}, 1, 0]}},
            "purchases": {"$sum": {"$cond": [{"$eq": ["$type", "purchase"]}, 1, 0]}},
            "revenue": {"$sum": {"$ifNull": ["$amount", 0]}}
        }},
        {"$sort": {"total_leads": -1}}
    ]
    ebook_stats = await db.ebook_leads.aggregate(pipeline_ebook).to_list(None)

    total_leads = await db.ebook_leads.count_documents({})
    total_revenue = sum(s.get("revenue", 0) for s in sources.values())

    return {
        "by_source": list(sources.values()),
        "by_ebook": ebook_stats,
        "totals": {
            "total_leads": total_leads,
            "total_revenue": total_revenue,
            "total_downloads": sum(s.get("downloads", 0) for s in sources.values()),
            "total_purchases": sum(s.get("purchases", 0) for s in sources.values()),
        }
    }


@ebook_router.get("/{ebook_id}/complementary")
async def get_complementary_ebooks(ebook_id: str):
    """Get complementary e-books for a given e-book."""
    ebook = await db.ebooks.find_one({"id": ebook_id}, {"_id": 0})
    if not ebook:
        raise HTTPException(status_code=404, detail="E-book not found")

    comp_ids = ebook.get("complementary_ebook_ids", [])
    if not comp_ids:
        return []

    companions = await db.ebooks.find(
        {"id": {"$in": comp_ids}, "is_active": True},
        {"_id": 0, "storage_path": 0, "original_filename": 0, "cover_storage_path": 0}
    ).to_list(None)
    return companions
