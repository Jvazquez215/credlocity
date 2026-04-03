"""
Social Media Auto-Publishing API
Manages platform credentials, post creation, scheduling, and history
"""

from fastapi import APIRouter, HTTPException, Header
from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

social_media_router = APIRouter(prefix="/social-media", tags=["Social Media"])

db = None

def set_db(database):
    global db
    db = database


PLATFORMS = {
    "facebook": {"name": "Facebook", "char_limit": 63206, "supports_image": True, "supports_link": True},
    "instagram": {"name": "Instagram Stories", "char_limit": 2200, "supports_image": True, "supports_link": False},
    "twitter": {"name": "Twitter / X", "char_limit": 280, "supports_image": True, "supports_link": True},
    "threads": {"name": "Threads", "char_limit": 500, "supports_image": True, "supports_link": True},
    "linkedin": {"name": "LinkedIn", "char_limit": 3000, "supports_image": True, "supports_link": True},
}


async def get_user(token, authorization):
    """Verify user from token."""
    from auth import decode_token
    tk = token
    if not tk and authorization:
        tk = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    if not tk:
        return None
    payload = decode_token(tk)
    if not payload:
        return None
    user = await db.users.find_one({"email": payload.get("sub")}, {"_id": 0})
    return user


# ==================== PLATFORM SETTINGS ====================

@social_media_router.get("/platforms")
async def get_platforms(token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Get all supported platforms and their connection status."""
    user = await get_user(token, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Get saved credentials
    settings = await db.social_media_settings.find_one({"type": "platform_credentials"}, {"_id": 0})
    credentials = settings.get("platforms", {}) if settings else {}

    platforms = []
    for key, info in PLATFORMS.items():
        cred = credentials.get(key, {})
        platforms.append({
            "id": key,
            "name": info["name"],
            "char_limit": info["char_limit"],
            "supports_image": info["supports_image"],
            "supports_link": info["supports_link"],
            "connected": bool(cred.get("access_token")),
            "page_name": cred.get("page_name", ""),
        })

    return {"platforms": platforms}


@social_media_router.put("/platforms/{platform_id}/credentials")
async def update_platform_credentials(
    platform_id: str, data: dict,
    token: Optional[str] = None, authorization: Optional[str] = Header(None)
):
    """Update API credentials for a platform (admin only)."""
    user = await get_user(token, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    if platform_id not in PLATFORMS:
        raise HTTPException(status_code=400, detail=f"Unknown platform: {platform_id}")

    cred_data = {
        "access_token": data.get("access_token", ""),
        "page_name": data.get("page_name", ""),
        "page_id": data.get("page_id", ""),
        "api_key": data.get("api_key", ""),
        "api_secret": data.get("api_secret", ""),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "updated_by": user["id"]
    }

    await db.social_media_settings.update_one(
        {"type": "platform_credentials"},
        {"$set": {f"platforms.{platform_id}": cred_data}},
        upsert=True
    )
    return {"message": f"{PLATFORMS[platform_id]['name']} credentials updated"}


# ==================== POST CREATION ====================

@social_media_router.post("/posts")
async def create_social_post(data: dict, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Create a social media post (queued for publishing)."""
    user = await get_user(token, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    platforms = data.get("platforms", [])
    if not platforms:
        raise HTTPException(status_code=400, detail="At least one platform required")

    source_type = data.get("source_type", "blog")  # blog or press_release
    source_id = data.get("source_id", "")
    source_title = data.get("source_title", "")
    source_url = data.get("source_url", "")
    og_image = data.get("og_image", "")

    created_posts = []

    for p in platforms:
        pid = p.get("platform_id")
        if pid not in PLATFORMS:
            continue

        content = p.get("content", "")
        char_limit = PLATFORMS[pid]["char_limit"]

        # Validate character limit
        if len(content) > char_limit:
            raise HTTPException(
                status_code=400,
                detail=f"{PLATFORMS[pid]['name']} post exceeds {char_limit} character limit ({len(content)} chars)"
            )

        post = {
            "id": str(uuid4()),
            "platform_id": pid,
            "platform_name": PLATFORMS[pid]["name"],
            "content": content,
            "char_count": len(content),
            "char_limit": char_limit,
            "source_type": source_type,
            "source_id": source_id,
            "source_title": source_title,
            "source_url": source_url,
            "og_image": og_image,
            "include_link": p.get("include_link", True),
            "status": "queued",
            "error_message": None,
            "created_by": user["id"],
            "created_by_name": user.get("full_name", ""),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "published_at": None
        }

        # Check if platform has credentials configured
        settings = await db.social_media_settings.find_one({"type": "platform_credentials"}, {"_id": 0})
        creds = settings.get("platforms", {}).get(pid, {}) if settings else {}
        has_creds = bool(creds.get("access_token"))

        if has_creds:
            # Attempt to publish via platform API
            success, error = await publish_to_platform(pid, post, creds)
            if success:
                post["status"] = "published"
                post["published_at"] = datetime.now(timezone.utc).isoformat()
            else:
                post["status"] = "failed"
                post["error_message"] = error
        else:
            post["status"] = "pending_setup"
            post["error_message"] = f"{PLATFORMS[pid]['name']} API credentials not configured yet. Post saved and will be published once connected."

        await db.social_media_posts.insert_one(post)
        post.pop("_id", None)
        created_posts.append(post)

    return {
        "message": f"{len(created_posts)} post(s) created",
        "posts": created_posts
    }


async def publish_to_platform(platform_id: str, post: dict, credentials: dict) -> tuple:
    """
    Publish to a specific platform using its API.
    Returns (success: bool, error_message: str or None)
    
    NOTE: Actual API integration requires platform-specific keys.
    This is the hook point for each platform's API.
    """
    access_token = credentials.get("access_token", "")

    try:
        if platform_id == "facebook":
            return await _publish_facebook(post, credentials)
        elif platform_id == "twitter":
            return await _publish_twitter(post, credentials)
        elif platform_id == "linkedin":
            return await _publish_linkedin(post, credentials)
        elif platform_id == "instagram":
            return await _publish_instagram(post, credentials)
        elif platform_id == "threads":
            return await _publish_threads(post, credentials)
        else:
            return False, f"Unsupported platform: {platform_id}"
    except Exception as e:
        return False, str(e)


async def _publish_facebook(post, creds):
    """Publish to Facebook Page via Graph API."""
    import httpx
    page_id = creds.get("page_id", "")
    access_token = creds.get("access_token", "")
    if not page_id or not access_token:
        return False, "Facebook Page ID and Access Token required"

    message = post["content"]
    if post.get("include_link") and post.get("source_url"):
        message += f"\n\n{post['source_url']}"

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"https://graph.facebook.com/v19.0/{page_id}/feed",
            data={"message": message, "access_token": access_token}
        )
        if resp.status_code == 200:
            return True, None
        return False, f"Facebook API error: {resp.text}"


async def _publish_twitter(post, creds):
    """Publish to Twitter/X via API v2."""
    import httpx
    bearer = creds.get("access_token", "")
    if not bearer:
        return False, "Twitter Bearer Token required"

    text = post["content"]
    if post.get("include_link") and post.get("source_url"):
        url = post["source_url"]
        if len(text) + len(url) + 2 <= 280:
            text += f"\n\n{url}"
        else:
            text = text[:280 - len(url) - 3] + f"...\n{url}"

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.x.com/2/tweets",
            json={"text": text},
            headers={"Authorization": f"Bearer {bearer}", "Content-Type": "application/json"}
        )
        if resp.status_code in [200, 201]:
            return True, None
        return False, f"Twitter API error: {resp.text}"


async def _publish_linkedin(post, creds):
    """Publish to LinkedIn via API."""
    import httpx
    access_token = creds.get("access_token", "")
    if not access_token:
        return False, "LinkedIn Access Token required"

    text = post["content"]
    if post.get("include_link") and post.get("source_url"):
        text += f"\n\n{post['source_url']}"

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.linkedin.com/v2/ugcPosts",
            json={
                "author": f"urn:li:person:{creds.get('page_id', '')}",
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": {
                        "shareCommentary": {"text": text},
                        "shareMediaCategory": "NONE"
                    }
                },
                "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"}
            },
            headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
        )
        if resp.status_code in [200, 201]:
            return True, None
        return False, f"LinkedIn API error: {resp.text}"


async def _publish_instagram(post, creds):
    """Publish to Instagram via Graph API (Business Account)."""
    import httpx
    ig_id = creds.get("page_id", "")
    access_token = creds.get("access_token", "")
    if not ig_id or not access_token:
        return False, "Instagram Business Account ID and Access Token required"

    image_url = post.get("og_image", "")
    if not image_url:
        return False, "Instagram requires an image. Please set an OG image."

    caption = post["content"]

    async with httpx.AsyncClient() as client:
        # Step 1: Create media container
        resp = await client.post(
            f"https://graph.facebook.com/v19.0/{ig_id}/media",
            data={"image_url": image_url, "caption": caption, "access_token": access_token}
        )
        if resp.status_code != 200:
            return False, f"Instagram media creation error: {resp.text}"

        container_id = resp.json().get("id")
        # Step 2: Publish
        resp2 = await client.post(
            f"https://graph.facebook.com/v19.0/{ig_id}/media_publish",
            data={"creation_id": container_id, "access_token": access_token}
        )
        if resp2.status_code == 200:
            return True, None
        return False, f"Instagram publish error: {resp2.text}"


async def _publish_threads(post, creds):
    """Publish to Threads via API."""
    import httpx
    user_id = creds.get("page_id", "")
    access_token = creds.get("access_token", "")
    if not user_id or not access_token:
        return False, "Threads User ID and Access Token required"

    text = post["content"]
    if post.get("include_link") and post.get("source_url"):
        text += f"\n\n{post['source_url']}"

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"https://graph.threads.net/v1.0/{user_id}/threads",
            data={"media_type": "TEXT", "text": text, "access_token": access_token}
        )
        if resp.status_code == 200:
            container_id = resp.json().get("id")
            resp2 = await client.post(
                f"https://graph.threads.net/v1.0/{user_id}/threads_publish",
                data={"creation_id": container_id, "access_token": access_token}
            )
            if resp2.status_code == 200:
                return True, None
            return False, f"Threads publish error: {resp2.text}"
        return False, f"Threads API error: {resp.text}"


# ==================== POST HISTORY ====================

@social_media_router.get("/posts")
async def get_social_posts(
    source_id: Optional[str] = None,
    source_type: Optional[str] = None,
    platform_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    token: Optional[str] = None,
    authorization: Optional[str] = Header(None)
):
    """Get social media post history."""
    user = await get_user(token, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    query = {}
    if source_id:
        query["source_id"] = source_id
    if source_type:
        query["source_type"] = source_type
    if platform_id:
        query["platform_id"] = platform_id
    if status:
        query["status"] = status

    posts = await db.social_media_posts.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(None)
    return {"posts": posts, "total": len(posts)}


@social_media_router.post("/posts/{post_id}/retry")
async def retry_social_post(post_id: str, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Retry a failed social media post."""
    user = await get_user(token, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    post = await db.social_media_posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    settings = await db.social_media_settings.find_one({"type": "platform_credentials"}, {"_id": 0})
    creds = settings.get("platforms", {}).get(post["platform_id"], {}) if settings else {}

    if not creds.get("access_token"):
        raise HTTPException(status_code=400, detail=f"No credentials configured for {post['platform_name']}")

    success, error = await publish_to_platform(post["platform_id"], post, creds)
    new_status = "published" if success else "failed"

    await db.social_media_posts.update_one(
        {"id": post_id},
        {"$set": {
            "status": new_status,
            "error_message": error,
            "published_at": datetime.now(timezone.utc).isoformat() if success else None,
            "retry_count": post.get("retry_count", 0) + 1
        }}
    )
    return {"message": "Published" if success else f"Failed: {error}", "status": new_status}


@social_media_router.delete("/posts/{post_id}")
async def delete_social_post(post_id: str, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """Delete a social media post from history."""
    user = await get_user(token, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    result = await db.social_media_posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post deleted"}
