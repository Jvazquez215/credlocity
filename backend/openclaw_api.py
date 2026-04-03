"""
OpenClaw AI Bot Integration - Proxy API for the admin CMS.
Connects to an OpenClaw Gateway via its HTTP REST API.
Restricted to superadmin users.
"""
import os
import json
import httpx
from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone

openclaw_router = APIRouter(prefix="/api/openclaw", tags=["OpenClaw AI"])

db = None

def set_db(database):
    global db
    db = database


OPENCLAW_TOKEN = os.environ.get("OPENCLAW_TOKEN", "")
OPENCLAW_GATEWAY_URL = os.environ.get("OPENCLAW_GATEWAY_URL", "http://127.0.0.1:18789")


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    stream: bool = True


class ConfigUpdate(BaseModel):
    gateway_url: Optional[str] = None


@openclaw_router.get("/config")
async def get_openclaw_config():
    """Get current OpenClaw configuration."""
    settings = await db.settings.find_one({"type": "openclaw"}, {"_id": 0})
    gateway_url = settings.get("gateway_url", OPENCLAW_GATEWAY_URL) if settings else OPENCLAW_GATEWAY_URL
    return {
        "gateway_url": gateway_url,
        "token_configured": bool(OPENCLAW_TOKEN),
        "status": "configured" if OPENCLAW_TOKEN else "missing_token"
    }


@openclaw_router.post("/config")
async def update_openclaw_config(config: ConfigUpdate):
    """Update OpenClaw configuration."""
    update_data = {"type": "openclaw", "updated_at": datetime.now(timezone.utc).isoformat()}
    if config.gateway_url:
        update_data["gateway_url"] = config.gateway_url
    await db.settings.update_one({"type": "openclaw"}, {"$set": update_data}, upsert=True)
    return {"message": "Configuration updated"}


@openclaw_router.post("/chat")
async def openclaw_chat(req: ChatRequest):
    """Send a message to OpenClaw and stream the response."""
    if not OPENCLAW_TOKEN:
        raise HTTPException(status_code=503, detail="OpenClaw token not configured")

    # Get gateway URL from DB settings or env
    settings = await db.settings.find_one({"type": "openclaw"}, {"_id": 0})
    gateway_url = (settings.get("gateway_url") if settings else None) or OPENCLAW_GATEWAY_URL

    api_url = f"{gateway_url.rstrip('/')}/v1/responses"

    payload = {
        "model": "openclaw",
        "input": req.message,
        "stream": req.stream,
    }
    if req.session_id:
        payload["user"] = req.session_id

    headers = {
        "Authorization": f"Bearer {OPENCLAW_TOKEN}",
        "Content-Type": "application/json",
        "x-openclaw-agent-id": "main",
    }

    if req.stream:
        async def event_stream():
            try:
                async with httpx.AsyncClient(timeout=120) as client:
                    async with client.stream("POST", api_url, json=payload, headers=headers) as response:
                        if response.status_code != 200:
                            body = await response.aread()
                            yield f"data: {json.dumps({'error': body.decode()[:500]})}\n\n"
                            return
                        async for line in response.aiter_lines():
                            if line.startswith("data: "):
                                yield f"{line}\n\n"
                            elif line.startswith("event: "):
                                yield f"{line}\n"
            except httpx.ConnectError:
                yield f"data: {json.dumps({'error': 'Cannot connect to OpenClaw Gateway. Ensure the gateway is running.'})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)[:200]})}\n\n"

        return StreamingResponse(event_stream(), media_type="text/event-stream")
    else:
        try:
            async with httpx.AsyncClient(timeout=120) as client:
                response = await client.post(api_url, json=payload, headers=headers)
                if response.status_code != 200:
                    raise HTTPException(status_code=response.status_code, detail=response.text[:500])
                return response.json()
        except httpx.ConnectError:
            raise HTTPException(status_code=503, detail="Cannot connect to OpenClaw Gateway. Ensure the gateway is running.")


@openclaw_router.get("/health")
async def openclaw_health():
    """Check if the OpenClaw Gateway is reachable."""
    settings = await db.settings.find_one({"type": "openclaw"}, {"_id": 0})
    gateway_url = (settings.get("gateway_url") if settings else None) or OPENCLAW_GATEWAY_URL

    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(f"{gateway_url.rstrip('/')}/", headers={"Accept": "text/html"})
            return {
                "status": "reachable" if resp.status_code < 500 else "error",
                "gateway_url": gateway_url,
                "status_code": resp.status_code,
            }
    except Exception as e:
        return {
            "status": "unreachable",
            "gateway_url": gateway_url,
            "error": str(e)[:100],
        }


# Store chat history in DB for persistence
@openclaw_router.post("/history/save")
async def save_chat_message(request: Request):
    """Save a chat message to history."""
    data = await request.json()
    doc = {
        "session_id": data.get("session_id", "default"),
        "role": data.get("role", "user"),
        "content": data.get("content", ""),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.openclaw_history.insert_one(doc)
    return {"status": "saved"}


@openclaw_router.get("/history/{session_id}")
async def get_chat_history(session_id: str, limit: int = 50):
    """Get chat history for a session."""
    messages = await db.openclaw_history.find(
        {"session_id": session_id},
        {"_id": 0}
    ).sort("created_at", 1).limit(limit).to_list(length=limit)
    return messages


@openclaw_router.delete("/history/{session_id}")
async def clear_chat_history(session_id: str):
    """Clear chat history for a session."""
    result = await db.openclaw_history.delete_many({"session_id": session_id})
    return {"deleted": result.deleted_count}
