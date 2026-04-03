from fastapi import APIRouter, HTTPException, Header, Depends, Request
from datetime import datetime, timezone, timedelta
import uuid
import os

audit_router = APIRouter(prefix="/api/audit")
db = None


def set_db(database):
    global db
    db = database


EMPLOYEE_IDLE_TIMEOUT_MINUTES = 10

# Roles that get auto-logout on idle
EMPLOYEE_ROLES = ["editor", "author", "credit_builder_manager", "viewer", "guest_teacher"]
# Roles that do NOT get auto-logged out
ADMIN_ROLES = ["admin", "super_admin"]


async def get_user_from_token(authorization: str):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.replace("Bearer ", "")
    from auth import decode_token
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"email": payload.get("sub")}, {"_id": 0, "hashed_password": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ============ AUDIT LOGGING ============

@audit_router.post("/log")
async def log_audit_event(data: dict, request: Request, authorization: str = Header(None)):
    """Log an audit event (page view, action, etc.)"""
    user = await get_user_from_token(authorization)

    event = {
        "id": str(uuid.uuid4()),
        "user_id": user.get("id", user.get("email")),
        "user_email": user.get("email"),
        "user_name": user.get("name", user.get("email")),
        "user_role": user.get("role", "viewer"),
        "is_partner": user.get("is_partner", False),
        "event_type": data.get("event_type", "action"),
        "action_category": data.get("action_category", "general"),
        "action_detail": data.get("action_detail", ""),
        "page": data.get("page", ""),
        "metadata": data.get("metadata", {}),
        "session_id": data.get("session_id", ""),
        "ip_address": request.client.host if request.client else "",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    await db.audit_logs.insert_one(event)
    return {"status": "logged"}


@audit_router.post("/heartbeat")
async def heartbeat(data: dict, request: Request, authorization: str = Header(None)):
    """Employee heartbeat - tracks activity and checks idle status"""
    user = await get_user_from_token(authorization)
    session_id = data.get("session_id", "")
    now = datetime.now(timezone.utc)

    session = await db.active_sessions.find_one(
        {"session_id": session_id, "user_id": user.get("id", user.get("email"))},
        {"_id": 0}
    )

    update = {
        "last_heartbeat": now.isoformat(),
        "current_page": data.get("current_page", ""),
    }

    last_meaningful = data.get("last_meaningful_action_time")
    if last_meaningful:
        update["last_meaningful_action"] = last_meaningful
        update["last_meaningful_action_detail"] = data.get("last_meaningful_action_detail", "")

    if session:
        await db.active_sessions.update_one(
            {"session_id": session_id},
            {"$set": update}
        )
    else:
        session_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user.get("id", user.get("email")),
            "user_email": user.get("email"),
            "user_name": user.get("name", user.get("email")),
            "user_role": user.get("role", "viewer"),
            "is_partner": user.get("is_partner", False),
            "session_id": session_id,
            "login_time": now.isoformat(),
            "last_heartbeat": now.isoformat(),
            "last_meaningful_action": now.isoformat(),
            "last_meaningful_action_detail": "session_start",
            "current_page": data.get("current_page", ""),
            "is_active": True,
            "logout_time": None,
            "logout_reason": None,
            "ip_address": request.client.host if request.client else "",
        }
        session_doc.update(update)
        await db.active_sessions.insert_one(session_doc)

    # Check idle for employees
    role = user.get("role", "viewer")
    should_logout = False

    if role in EMPLOYEE_ROLES and not user.get("is_partner", False):
        if session and session.get("last_meaningful_action"):
            try:
                last_action_time = datetime.fromisoformat(session["last_meaningful_action"])
                if last_action_time.tzinfo is None:
                    last_action_time = last_action_time.replace(tzinfo=timezone.utc)
                idle_minutes = (now - last_action_time).total_seconds() / 60
                if idle_minutes >= EMPLOYEE_IDLE_TIMEOUT_MINUTES:
                    should_logout = True
            except (ValueError, TypeError):
                pass

    return {
        "status": "ok",
        "should_logout": should_logout,
        "idle_timeout_minutes": EMPLOYEE_IDLE_TIMEOUT_MINUTES if role in EMPLOYEE_ROLES else None,
        "server_time": now.isoformat()
    }


@audit_router.post("/login-event")
async def record_login_event(data: dict, request: Request):
    """Record login/login attempt (called from login endpoint)"""
    event = {
        "id": str(uuid.uuid4()),
        "user_email": data.get("email", ""),
        "user_name": data.get("name", ""),
        "user_role": data.get("role", ""),
        "is_partner": data.get("is_partner", False),
        "event_type": data.get("event_type", "login"),
        "action_category": "authentication",
        "action_detail": data.get("detail", ""),
        "session_id": data.get("session_id", ""),
        "ip_address": request.client.host if request.client else "",
        "success": data.get("success", True),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.audit_logs.insert_one(event)

    if data.get("event_type") == "login" and data.get("success", True):
        session_doc = {
            "id": str(uuid.uuid4()),
            "user_id": data.get("user_id", data.get("email")),
            "user_email": data.get("email", ""),
            "user_name": data.get("name", ""),
            "user_role": data.get("role", ""),
            "is_partner": data.get("is_partner", False),
            "session_id": data.get("session_id", str(uuid.uuid4())),
            "login_time": datetime.now(timezone.utc).isoformat(),
            "last_heartbeat": datetime.now(timezone.utc).isoformat(),
            "last_meaningful_action": datetime.now(timezone.utc).isoformat(),
            "last_meaningful_action_detail": "login",
            "current_page": "/admin",
            "is_active": True,
            "logout_time": None,
            "logout_reason": None,
            "ip_address": request.client.host if request.client else "",
        }
        await db.active_sessions.insert_one(session_doc)

    return {"status": "recorded"}


@audit_router.post("/logout-event")
async def record_logout_event(data: dict, authorization: str = Header(None)):
    """Record logout event"""
    user = await get_user_from_token(authorization)
    now = datetime.now(timezone.utc)
    session_id = data.get("session_id", "")
    reason = data.get("reason", "manual")

    await db.active_sessions.update_many(
        {"session_id": session_id},
        {"$set": {
            "is_active": False,
            "logout_time": now.isoformat(),
            "logout_reason": reason
        }}
    )

    event = {
        "id": str(uuid.uuid4()),
        "user_id": user.get("id", user.get("email")),
        "user_email": user.get("email"),
        "user_name": user.get("name", user.get("email")),
        "user_role": user.get("role", "viewer"),
        "is_partner": user.get("is_partner", False),
        "event_type": "logout",
        "action_category": "authentication",
        "action_detail": f"Logout ({reason})",
        "session_id": session_id,
        "timestamp": now.isoformat()
    }
    await db.audit_logs.insert_one(event)
    return {"status": "logged_out"}


# ============ ADMIN - AUDIT VIEWER ============

@audit_router.get("/active-sessions")
async def get_active_sessions(authorization: str = Header(None)):
    """Admin: View currently active sessions"""
    user = await get_user_from_token(authorization)
    if user.get("role") not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Admin access required")

    cutoff = (datetime.now(timezone.utc) - timedelta(minutes=15)).isoformat()
    sessions = await db.active_sessions.find(
        {"is_active": True, "last_heartbeat": {"$gte": cutoff}},
        {"_id": 0}
    ).sort("last_heartbeat", -1).to_list(100)

    now = datetime.now(timezone.utc)
    for s in sessions:
        try:
            login_time = datetime.fromisoformat(s["login_time"])
            if login_time.tzinfo is None:
                login_time = login_time.replace(tzinfo=timezone.utc)
            s["session_duration_minutes"] = round((now - login_time).total_seconds() / 60, 1)

            if s.get("last_meaningful_action"):
                last_action = datetime.fromisoformat(s["last_meaningful_action"])
                if last_action.tzinfo is None:
                    last_action = last_action.replace(tzinfo=timezone.utc)
                s["idle_minutes"] = round((now - last_action).total_seconds() / 60, 1)
                s["is_idle"] = s["idle_minutes"] >= EMPLOYEE_IDLE_TIMEOUT_MINUTES and s.get("user_role") in EMPLOYEE_ROLES
            else:
                s["idle_minutes"] = 0
                s["is_idle"] = False
        except (ValueError, TypeError):
            s["session_duration_minutes"] = 0
            s["idle_minutes"] = 0
            s["is_idle"] = False

    return sessions


@audit_router.get("/user/{user_email}/logs")
async def get_user_audit_logs(
    user_email: str,
    days: int = 7,
    event_type: str = "",
    authorization: str = Header(None)
):
    """Admin: Get audit logs for a specific user"""
    user = await get_user_from_token(authorization)
    if user.get("role") not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Admin access required")

    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    query = {"user_email": user_email, "timestamp": {"$gte": cutoff}}
    if event_type:
        query["event_type"] = event_type

    logs = await db.audit_logs.find(query, {"_id": 0}).sort("timestamp", -1).to_list(500)
    return logs


@audit_router.get("/user/{user_email}/sessions")
async def get_user_sessions(
    user_email: str,
    days: int = 30,
    authorization: str = Header(None)
):
    """Admin: Get session history for a user"""
    user = await get_user_from_token(authorization)
    if user.get("role") not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Admin access required")

    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    sessions = await db.active_sessions.find(
        {"user_email": user_email, "login_time": {"$gte": cutoff}},
        {"_id": 0}
    ).sort("login_time", -1).to_list(200)

    now = datetime.now(timezone.utc)
    for s in sessions:
        try:
            login_time = datetime.fromisoformat(s["login_time"])
            if login_time.tzinfo is None:
                login_time = login_time.replace(tzinfo=timezone.utc)
            end_time = now
            if s.get("logout_time"):
                end_time = datetime.fromisoformat(s["logout_time"])
                if end_time.tzinfo is None:
                    end_time = end_time.replace(tzinfo=timezone.utc)
            s["session_duration_minutes"] = round((end_time - login_time).total_seconds() / 60, 1)
        except (ValueError, TypeError):
            s["session_duration_minutes"] = 0

    return sessions


@audit_router.get("/user/{user_email}/summary")
async def get_user_activity_summary(
    user_email: str,
    days: int = 7,
    authorization: str = Header(None)
):
    """Admin: Get productivity summary for a user"""
    user = await get_user_from_token(authorization)
    if user.get("role") not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Admin access required")

    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

    logs = await db.audit_logs.find(
        {"user_email": user_email, "timestamp": {"$gte": cutoff}},
        {"_id": 0}
    ).to_list(2000)

    sessions = await db.active_sessions.find(
        {"user_email": user_email, "login_time": {"$gte": cutoff}},
        {"_id": 0}
    ).to_list(200)

    # Count events by type
    event_counts = {}
    action_counts = {}
    for log in logs:
        et = log.get("event_type", "unknown")
        event_counts[et] = event_counts.get(et, 0) + 1
        ac = log.get("action_category", "unknown")
        action_counts[ac] = action_counts.get(ac, 0) + 1

    # Calculate total session time
    now = datetime.now(timezone.utc)
    total_session_minutes = 0
    for s in sessions:
        try:
            login_time = datetime.fromisoformat(s["login_time"])
            if login_time.tzinfo is None:
                login_time = login_time.replace(tzinfo=timezone.utc)
            end_time = now
            if s.get("logout_time"):
                end_time = datetime.fromisoformat(s["logout_time"])
                if end_time.tzinfo is None:
                    end_time = end_time.replace(tzinfo=timezone.utc)
            total_session_minutes += (end_time - login_time).total_seconds() / 60
        except (ValueError, TypeError):
            pass

    # Disposition stats
    disposition_logs = [entry for entry in logs if entry.get("action_category") == "disposition"]
    avg_disposition_time = 0
    if disposition_logs:
        times = [entry.get("metadata", {}).get("duration_seconds", 0) for entry in disposition_logs if entry.get("metadata", {}).get("duration_seconds")]
        if times:
            avg_disposition_time = round(sum(times) / len(times), 1)

    # Login attempts
    login_attempts = len([entry for entry in logs if entry.get("event_type") == "login_failed"])
    successful_logins = len([entry for entry in logs if entry.get("event_type") == "login"])
    idle_logouts = len([s for s in sessions if s.get("logout_reason") == "idle"])

    total_actions = len([entry for entry in logs if entry.get("event_type") == "action"])
    actions_per_hour = round(total_actions / max(total_session_minutes / 60, 0.1), 1) if total_session_minutes > 0 else 0

    return {
        "user_email": user_email,
        "period_days": days,
        "total_sessions": len(sessions),
        "total_session_minutes": round(total_session_minutes, 1),
        "total_events": len(logs),
        "total_actions": total_actions,
        "actions_per_hour": actions_per_hour,
        "event_counts": event_counts,
        "action_counts": action_counts,
        "avg_disposition_seconds": avg_disposition_time,
        "login_attempts_failed": login_attempts,
        "successful_logins": successful_logins,
        "idle_logouts": idle_logouts,
        "page_views": event_counts.get("page_view", 0),
    }


@audit_router.get("/all-users-summary")
async def get_all_users_summary(days: int = 7, authorization: str = Header(None)):
    """Admin: Overview of all users' activity"""
    user = await get_user_from_token(authorization)
    if user.get("role") not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Admin access required")

    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

    users = await db.users.find(
        {"is_active": True},
        {"_id": 0, "email": 1, "name": 1, "role": 1, "is_partner": 1}
    ).to_list(100)

    now = datetime.now(timezone.utc)
    result = []
    for u in users:
        email = u["email"]

        last_session = await db.active_sessions.find(
            {"user_email": email}
        ).sort("login_time", -1).limit(1).to_list(1)

        action_count = await db.audit_logs.count_documents(
            {"user_email": email, "event_type": "action", "timestamp": {"$gte": cutoff}}
        )

        login_count = await db.audit_logs.count_documents(
            {"user_email": email, "event_type": "login", "timestamp": {"$gte": cutoff}}
        )

        entry = {
            "email": email,
            "name": u.get("name", email),
            "role": u.get("role", "viewer"),
            "is_partner": u.get("is_partner", False),
            "total_actions": action_count,
            "total_logins": login_count,
            "last_login": last_session[0].get("login_time") if last_session else None,
            "is_online": False,
            "idle_minutes": 0,
        }

        if last_session and last_session[0].get("is_active"):
            last_hb = last_session[0].get("last_heartbeat")
            if last_hb:
                try:
                    hb_time = datetime.fromisoformat(last_hb)
                    if hb_time.tzinfo is None:
                        hb_time = hb_time.replace(tzinfo=timezone.utc)
                    if (now - hb_time).total_seconds() < 300:
                        entry["is_online"] = True
                        last_action = last_session[0].get("last_meaningful_action")
                        if last_action:
                            la_time = datetime.fromisoformat(last_action)
                            if la_time.tzinfo is None:
                                la_time = la_time.replace(tzinfo=timezone.utc)
                            entry["idle_minutes"] = round((now - la_time).total_seconds() / 60, 1)
                except (ValueError, TypeError):
                    pass

        result.append(entry)

    result.sort(key=lambda x: (not x["is_online"], -x["total_actions"]))
    return result
