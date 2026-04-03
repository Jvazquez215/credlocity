"""
Document Access Control Middleware.
Checks if a user has permission to access specific documents
based on role, subscription level, and document ownership.
"""
from fastapi import HTTPException, Request
from functools import wraps
import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "credlocity")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Document access levels
ACCESS_LEVELS = {
    "public": 0,
    "basic": 1,
    "standard": 2,
    "premium": 3,
    "attorney": 4,
    "admin": 5,
    "super_admin": 6
}

# Role to access level mapping
ROLE_ACCESS = {
    "viewer": "basic",
    "editor": "standard",
    "manager": "premium",
    "director": "premium",
    "attorney": "attorney",
    "admin": "admin",
    "super_admin": "super_admin"
}


async def check_document_access(user: dict, document_id: str, required_level: str = "basic") -> bool:
    """
    Check if a user can access a specific document.
    Returns True if access is granted, raises HTTPException otherwise.
    """
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    role = user.get("role", "viewer")
    if role == "super_admin":
        role = "admin"

    # Admin always has access
    if role in ("admin",):
        return True

    # Get user's access level
    user_access = ROLE_ACCESS.get(role, "basic")
    user_level = ACCESS_LEVELS.get(user_access, 0)
    required = ACCESS_LEVELS.get(required_level, 0)

    # Check access level
    if user_level < required:
        raise HTTPException(
            status_code=403,
            detail=f"Insufficient access level. Required: {required_level}, your level: {user_access}"
        )

    # Check document-specific permissions
    doc = await db.documents.find_one({"id": document_id}, {"_id": 0})
    if not doc:
        doc = await db.corporate_documents.find_one({"id": document_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Check if document is restricted to specific users
    allowed_users = doc.get("allowed_users", [])
    if allowed_users and user.get("id") not in allowed_users:
        # Check if user's role grants access
        allowed_roles = doc.get("allowed_roles", [])
        if allowed_roles and role not in allowed_roles:
            raise HTTPException(status_code=403, detail="You don't have access to this document")

    # Check if document requires partner access
    if doc.get("partner_only") and not user.get("is_partner"):
        raise HTTPException(status_code=403, detail="Partner access required")

    # Check if document is deleted
    if doc.get("is_deleted"):
        raise HTTPException(status_code=404, detail="Document has been removed")

    return True


async def check_corporate_doc_access(user: dict, doc_id: str) -> bool:
    """Check access for corporate documents (partner-only)."""
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    role = user.get("role", "viewer")
    if role == "super_admin":
        role = "admin"

    # Admin and partners have access
    if role == "admin" or user.get("is_partner"):
        return True

    raise HTTPException(status_code=403, detail="Corporate documents are restricted to partners and administrators")
