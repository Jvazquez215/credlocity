"""
Free Downloadable Letters CMS API
Allows admins to upload and manage letter templates for consumers.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone
from typing import Optional
import uuid
import os
import shutil
from pathlib import Path

letters_router = APIRouter(prefix="/api/letters", tags=["Letters"])

db_instance: AsyncIOMotorDatabase = None
UPLOAD_DIR = Path("/app/backend/uploads/letters")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def set_db(database):
    global db_instance
    db_instance = database

def get_db():
    return db_instance

# ── Admin: Upload a letter ──
@letters_router.post("/upload")
async def upload_letter(
    title: str = Form(...),
    category: str = Form(...),
    description: str = Form(""),
    file: UploadFile = File(...)
):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    allowed = {".pdf", ".doc", ".docx", ".txt", ".rtf"}
    ext = Path(file.filename).suffix.lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"File type {ext} not allowed. Allowed: {', '.join(allowed)}")
    
    file_id = str(uuid.uuid4())
    safe_name = f"{file_id}{ext}"
    file_path = UPLOAD_DIR / safe_name
    
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    letter_doc = {
        "id": file_id,
        "title": title,
        "category": category,
        "description": description,
        "original_filename": file.filename,
        "stored_filename": safe_name,
        "file_type": ext.replace(".", ""),
        "file_size": os.path.getsize(file_path),
        "download_count": 0,
        "is_published": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    
    await db.free_letters.insert_one(letter_doc)
    letter_doc.pop("_id", None)
    return letter_doc

# ── Admin: Get all letters ──
@letters_router.get("/admin/list")
async def list_all_letters():
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    letters = await db.free_letters.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return letters

# ── Admin: Update letter metadata ──
@letters_router.put("/{letter_id}")
async def update_letter(letter_id: str, title: str = Form(None), category: str = Form(None), description: str = Form(None), is_published: bool = Form(None)):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    update = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if title is not None:
        update["title"] = title
    if category is not None:
        update["category"] = category
    if description is not None:
        update["description"] = description
    if is_published is not None:
        update["is_published"] = is_published
    
    result = await db.free_letters.update_one({"id": letter_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Letter not found")
    
    updated = await db.free_letters.find_one({"id": letter_id}, {"_id": 0})
    return updated

# ── Admin: Delete letter ──
@letters_router.delete("/{letter_id}")
async def delete_letter(letter_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    letter = await db.free_letters.find_one({"id": letter_id}, {"_id": 0})
    if not letter:
        raise HTTPException(status_code=404, detail="Letter not found")
    
    file_path = UPLOAD_DIR / letter["stored_filename"]
    if file_path.exists():
        file_path.unlink()
    
    await db.free_letters.delete_one({"id": letter_id})
    return {"message": "Letter deleted"}

# ── Public: Get published letters ──
@letters_router.get("/public")
async def get_published_letters():
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    letters = await db.free_letters.find({"is_published": True}, {"_id": 0}).sort("category", 1).to_list(500)
    return letters

# ── Public: Download a letter ──
@letters_router.get("/download/{letter_id}")
async def download_letter(letter_id: str):
    from fastapi.responses import FileResponse
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    letter = await db.free_letters.find_one({"id": letter_id}, {"_id": 0})
    if not letter or not letter.get("is_published"):
        raise HTTPException(status_code=404, detail="Letter not found")
    
    file_path = UPLOAD_DIR / letter["stored_filename"]
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on server")
    
    # Increment download count
    await db.free_letters.update_one({"id": letter_id}, {"$inc": {"download_count": 1}})
    
    content_types = {
        "pdf": "application/pdf",
        "doc": "application/msword",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "txt": "text/plain",
        "rtf": "application/rtf",
    }
    
    return FileResponse(
        path=str(file_path),
        filename=letter["original_filename"],
        media_type=content_types.get(letter["file_type"], "application/octet-stream")
    )
