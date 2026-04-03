"""
Corporate Documents API for Partners Hub.
Allows partners to upload, view, and manage corporate documents
(Partnership Agreements, EIN docs, Amendments, etc.)
Uses Emergent Object Storage for secure file storage.
"""
from fastapi import APIRouter, HTTPException, Header, UploadFile, File, Form, Query
from fastapi.responses import Response
from typing import Optional
from datetime import datetime, timezone
from uuid import uuid4
import os
from motor.motor_asyncio import AsyncIOMotorClient

from object_storage import put_object, get_object

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "credlocity")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

APP_NAME = "credlocity"
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB

ALLOWED_CONTENT_TYPES = {
    "application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/png", "image/jpeg", "image/webp",
    "text/plain", "text/csv",
}

DOCUMENT_CATEGORIES = [
    "partnership_agreement", "corporate_docs", "ein_docs",
    "amendments", "contracts", "legal", "financial", "other"
]

corporate_docs_router = APIRouter(prefix="/api/corporate-docs", tags=["Corporate Documents"])


async def get_current_user(authorization: Optional[str] = Header(None)):
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
    return user


def require_partner(user):
    if not user or not user.get("is_partner"):
        raise HTTPException(status_code=403, detail="Partners only")


@corporate_docs_router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form("other"),
    description: str = Form(""),
    authorization: Optional[str] = Header(None)
):
    """Upload a corporate document to secure storage."""
    user = await get_current_user(authorization)
    require_partner(user)

    if category not in DOCUMENT_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of: {DOCUMENT_CATEGORIES}")

    content_type = file.content_type or "application/octet-stream"
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail=f"File type not allowed: {content_type}")

    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum 25 MB.")

    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    storage_path = f"{APP_NAME}/corporate-docs/{uuid4()}.{ext}"

    try:
        result = put_object(storage_path, data, content_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Storage upload failed: {str(e)}")

    doc_id = str(uuid4())
    doc_record = {
        "id": doc_id,
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": content_type,
        "size": result.get("size", len(data)),
        "category": category,
        "description": description,
        "uploaded_by_id": user["id"],
        "uploaded_by_name": user.get("full_name") or user.get("name") or user.get("email"),
        "current_version": 1,
        "version_history": [],
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    await db.corporate_documents.insert_one(doc_record)
    doc_record.pop("_id", None)

    # Audit trail entry for initial upload
    await db.document_audit_trail.insert_one({
        "id": str(uuid4()),
        "document_id": doc_id,
        "action": "uploaded",
        "version": 1,
        "user_id": user.get("id"),
        "user_name": user.get("full_name") or user.get("name") or user.get("email"),
        "details": f"Document '{file.filename}' uploaded (v1)",
        "description": description,
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    return doc_record


@corporate_docs_router.get("/list")
async def list_documents(
    authorization: Optional[str] = Header(None),
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """List corporate documents with optional category filter."""
    user = await get_current_user(authorization)
    require_partner(user)

    query = {"is_deleted": False}
    if category:
        query["category"] = category

    docs = await db.corporate_documents.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(None)
    total = await db.corporate_documents.count_documents(query)

    return {"documents": docs, "total": total}


@corporate_docs_router.get("/download/{doc_id}")
async def download_document(
    doc_id: str,
    authorization: Optional[str] = Header(None),
    auth: Optional[str] = Query(None)
):
    """Download a corporate document by ID."""
    auth_header = authorization or (f"Bearer {auth}" if auth else None)
    user = await get_current_user(auth_header)
    require_partner(user)

    record = await db.corporate_documents.find_one({"id": doc_id, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        data, ct = get_object(record["storage_path"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve file: {str(e)}")

    # Audit trail entry for download
    await db.document_audit_trail.insert_one({
        "id": str(uuid4()),
        "document_id": doc_id,
        "action": "downloaded",
        "user_id": user.get("id"),
        "user_name": user.get("full_name") or user.get("name") or user.get("email"),
        "details": f"Document '{record.get('original_filename')}' downloaded",
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    return Response(
        content=data,
        media_type=record.get("content_type", ct),
        headers={"Content-Disposition": f'attachment; filename="{record["original_filename"]}"'}
    )


@corporate_docs_router.put("/{doc_id}")
async def update_document(doc_id: str, data: dict, authorization: Optional[str] = Header(None)):
    """Update document metadata (category, description)."""
    user = await get_current_user(authorization)
    require_partner(user)

    record = await db.corporate_documents.find_one({"id": doc_id, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="Document not found")

    update = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if "category" in data:
        if data["category"] not in DOCUMENT_CATEGORIES:
            raise HTTPException(status_code=400, detail="Invalid category")
        update["category"] = data["category"]
    if "description" in data:
        update["description"] = data["description"]

    await db.corporate_documents.update_one({"id": doc_id}, {"$set": update})
    updated = await db.corporate_documents.find_one({"id": doc_id}, {"_id": 0})
    return updated


@corporate_docs_router.delete("/{doc_id}")
async def delete_document(doc_id: str, authorization: Optional[str] = Header(None)):
    """Soft-delete a corporate document."""
    user = await get_current_user(authorization)
    require_partner(user)

    record = await db.corporate_documents.find_one({"id": doc_id, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="Document not found")

    if not user.get("is_master") and record.get("uploaded_by_id") != user.get("id"):
        raise HTTPException(status_code=403, detail="Only master partners or the uploader can delete documents")

    # Record audit trail entry
    await db.document_audit_trail.insert_one({
        "id": str(uuid4()),
        "document_id": doc_id,
        "action": "deleted",
        "user_id": user.get("id"),
        "user_name": user.get("full_name") or user.get("name") or user.get("email"),
        "details": f"Document '{record.get('original_filename')}' deleted",
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    await db.corporate_documents.update_one(
        {"id": doc_id},
        {"$set": {"is_deleted": True, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Document deleted", "id": doc_id}


@corporate_docs_router.post("/new-version/{doc_id}")
async def upload_new_version(
    doc_id: str,
    file: UploadFile = File(...),
    description: str = Form(""),
    authorization: Optional[str] = Header(None)
):
    """Upload a new version of an existing document."""
    user = await get_current_user(authorization)
    require_partner(user)

    existing = await db.corporate_documents.find_one({"id": doc_id, "is_deleted": False})
    if not existing:
        raise HTTPException(status_code=404, detail="Document not found")

    content_type = file.content_type or "application/octet-stream"
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail=f"File type not allowed: {content_type}")

    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum 25 MB.")

    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    storage_path = f"{APP_NAME}/corporate-docs/{uuid4()}.{ext}"

    try:
        result = put_object(storage_path, data, content_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Storage upload failed: {str(e)}")

    # Save current version to history
    current_version = existing.get("current_version", 1)
    version_entry = {
        "version": current_version,
        "storage_path": existing["storage_path"],
        "original_filename": existing["original_filename"],
        "content_type": existing.get("content_type"),
        "size": existing.get("size"),
        "uploaded_by_id": existing.get("uploaded_by_id"),
        "uploaded_by_name": existing.get("uploaded_by_name"),
        "created_at": existing.get("updated_at", existing.get("created_at"))
    }

    new_version = current_version + 1
    await db.corporate_documents.update_one(
        {"id": doc_id},
        {
            "$set": {
                "storage_path": result["path"],
                "original_filename": file.filename,
                "content_type": content_type,
                "size": result.get("size", len(data)),
                "current_version": new_version,
                "uploaded_by_id": user["id"],
                "uploaded_by_name": user.get("full_name") or user.get("name") or user.get("email"),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            "$push": {"version_history": version_entry}
        }
    )

    # Audit trail
    await db.document_audit_trail.insert_one({
        "id": str(uuid4()),
        "document_id": doc_id,
        "action": "new_version",
        "version": new_version,
        "user_id": user.get("id"),
        "user_name": user.get("full_name") or user.get("name") or user.get("email"),
        "details": f"Uploaded version {new_version}: {file.filename}",
        "description": description,
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    updated = await db.corporate_documents.find_one({"id": doc_id}, {"_id": 0})
    return updated


@corporate_docs_router.get("/versions/{doc_id}")
async def get_version_history(doc_id: str, authorization: Optional[str] = Header(None)):
    """Get version history for a document."""
    user = await get_current_user(authorization)
    require_partner(user)

    doc = await db.corporate_documents.find_one({"id": doc_id, "is_deleted": False}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    versions = doc.get("version_history", [])
    current = {
        "version": doc.get("current_version", 1),
        "storage_path": doc["storage_path"],
        "original_filename": doc["original_filename"],
        "size": doc.get("size"),
        "uploaded_by_name": doc.get("uploaded_by_name"),
        "created_at": doc.get("updated_at"),
        "is_current": True
    }
    return {"document_id": doc_id, "current": current, "history": versions}


@corporate_docs_router.get("/audit-trail/{doc_id}")
async def get_audit_trail(doc_id: str, authorization: Optional[str] = Header(None)):
    """Get audit trail for a document."""
    user = await get_current_user(authorization)
    require_partner(user)

    entries = await db.document_audit_trail.find(
        {"document_id": doc_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(None)

    return {"document_id": doc_id, "entries": entries}


@corporate_docs_router.get("/categories")
async def get_categories():
    """Get available document categories."""
    labels = {
        "partnership_agreement": "Partnership Agreements",
        "corporate_docs": "Corporate Documents",
        "ein_docs": "EIN Documents",
        "amendments": "Amendments",
        "contracts": "Contracts",
        "legal": "Legal",
        "financial": "Financial",
        "other": "Other"
    }
    return [{"value": c, "label": labels.get(c, c.replace("_", " ").title())} for c in DOCUMENT_CATEGORIES]
