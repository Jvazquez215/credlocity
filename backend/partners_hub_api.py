"""
Partners Hub API - Private workspace for Credlocity business partners/owners.
Only accessible by users with is_partner=True.
Includes: Idea Board, Todos, Discussion Items, Business Goals, KPI Goals, Company Policies with voting.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from fastapi import status as http_status
from pydantic import BaseModel, Field

from auth import decode_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

router = APIRouter(prefix="/api/partners-hub", tags=["Partners Hub"])


# ============ AUTH HELPER ============
async def get_partner_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify user is authenticated AND is a partner."""
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    from server import db
    user = await db.users.find_one({"email": payload.get("sub")}, {"_id": 0, "hashed_password": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if not user.get("is_partner"):
        raise HTTPException(status_code=403, detail="Access restricted to partners only")
    return user


# ============ MODELS ============
class IdeaCreate(BaseModel):
    title: str
    description: str = ""
    priority: str = "medium"  # low, medium, high
    category: str = "general"  # general, marketing, operations, product, finance

class TodoCreate(BaseModel):
    title: str
    description: str = ""
    assigned_to: str = ""
    due_date: Optional[str] = None
    priority: str = "medium"

class DiscussCreate(BaseModel):
    title: str
    description: str = ""
    meeting_date: Optional[str] = None
    category: str = "general"

class GoalCreate(BaseModel):
    title: str
    description: str = ""
    goal_type: str = "business"  # business, kpi
    target_value: Optional[str] = None
    current_value: Optional[str] = None
    target_date: Optional[str] = None
    category: str = "general"

class PolicyCreate(BaseModel):
    title: str
    description: str
    category: str = "general"  # general, hr, operations, finance, legal, marketing
    full_text: str = ""

class PolicyVote(BaseModel):
    vote: str  # agree, disagree


# ============ IDEA BOARD ============
@router.get("/ideas")
async def get_ideas(user: dict = Depends(get_partner_user)):
    from server import db
    ideas = await db.partner_ideas.find({}, {"_id": 0}).sort("created_at", -1).to_list(None)
    return ideas

@router.post("/ideas")
async def create_idea(idea: IdeaCreate, user: dict = Depends(get_partner_user)):
    from server import db
    doc = {
        "id": str(uuid.uuid4()),
        "title": idea.title,
        "description": idea.description,
        "priority": idea.priority,
        "category": idea.category,
        "status": "new",
        "created_by": user.get("full_name", user.get("email")),
        "created_by_email": user.get("email"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "comments": []
    }
    await db.partner_ideas.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.put("/ideas/{idea_id}")
async def update_idea(idea_id: str, updates: dict, user: dict = Depends(get_partner_user)):
    from server import db
    allowed = {"title", "description", "priority", "category", "status"}
    filtered = {k: v for k, v in updates.items() if k in allowed}
    filtered["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.partner_ideas.update_one({"id": idea_id}, {"$set": filtered})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Idea not found")
    return {"message": "Updated"}

@router.delete("/ideas/{idea_id}")
async def delete_idea(idea_id: str, user: dict = Depends(get_partner_user)):
    from server import db
    result = await db.partner_ideas.delete_one({"id": idea_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Idea not found")
    return {"message": "Deleted"}

@router.post("/ideas/{idea_id}/comment")
async def add_idea_comment(idea_id: str, comment: dict, user: dict = Depends(get_partner_user)):
    from server import db
    comment_doc = {
        "id": str(uuid.uuid4()),
        "text": comment.get("text", ""),
        "author": user.get("full_name", user.get("email")),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.partner_ideas.update_one({"id": idea_id}, {"$push": {"comments": comment_doc}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Idea not found")
    return comment_doc


# ============ TODO LIST ============
@router.get("/todos")
async def get_todos(user: dict = Depends(get_partner_user)):
    from server import db
    todos = await db.partner_todos.find({}, {"_id": 0}).sort("created_at", -1).to_list(None)
    return todos

@router.post("/todos")
async def create_todo(todo: TodoCreate, user: dict = Depends(get_partner_user)):
    from server import db
    doc = {
        "id": str(uuid.uuid4()),
        "title": todo.title,
        "description": todo.description,
        "assigned_to": todo.assigned_to,
        "due_date": todo.due_date,
        "priority": todo.priority,
        "completed": False,
        "created_by": user.get("full_name", user.get("email")),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.partner_todos.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.put("/todos/{todo_id}")
async def update_todo(todo_id: str, updates: dict, user: dict = Depends(get_partner_user)):
    from server import db
    allowed = {"title", "description", "assigned_to", "due_date", "priority", "completed"}
    filtered = {k: v for k, v in updates.items() if k in allowed}
    filtered["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.partner_todos.update_one({"id": todo_id}, {"$set": filtered})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Todo not found")
    return {"message": "Updated"}

@router.delete("/todos/{todo_id}")
async def delete_todo(todo_id: str, user: dict = Depends(get_partner_user)):
    from server import db
    result = await db.partner_todos.delete_one({"id": todo_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Todo not found")
    return {"message": "Deleted"}


# ============ TO DISCUSS LIST (legacy endpoints) ============
@router.get("/discuss")
async def get_discuss_items(user: dict = Depends(get_partner_user)):
    from server import db
    items = await db.partner_discuss.find({}, {"_id": 0}).sort("created_at", -1).to_list(None)
    return items

@router.post("/discuss")
async def create_discuss_item(item: DiscussCreate, user: dict = Depends(get_partner_user)):
    from server import db
    doc = {
        "id": str(uuid.uuid4()),
        "title": item.title,
        "description": item.description,
        "meeting_date": item.meeting_date,
        "category": item.category,
        "status": "pending",
        "created_by": user.get("full_name", user.get("email")),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.partner_discuss.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.put("/discuss/{item_id}")
async def update_discuss_item(item_id: str, updates: dict, user: dict = Depends(get_partner_user)):
    from server import db
    allowed = {"title", "description", "meeting_date", "category", "status"}
    filtered = {k: v for k, v in updates.items() if k in allowed}
    filtered["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.partner_discuss.update_one({"id": item_id}, {"$set": filtered})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Updated"}

@router.delete("/discuss/{item_id}")
async def delete_discuss_item(item_id: str, user: dict = Depends(get_partner_user)):
    from server import db
    result = await db.partner_discuss.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Deleted"}


# ============ DISCUSSIONS (frontend-compatible endpoints) ============
class DiscussionCreate(BaseModel):
    title: str
    content: str = ""

class ReplyCreate(BaseModel):
    content: str

@router.get("/discussions")
async def get_discussions(user: dict = Depends(get_partner_user)):
    """Get all discussions - frontend compatible endpoint"""
    from server import db
    items = await db.partner_discussions.find({}, {"_id": 0}).sort("created_at", -1).to_list(None)
    return items

@router.post("/discussions")
async def create_discussion(item: DiscussionCreate, user: dict = Depends(get_partner_user)):
    """Create a new discussion topic - frontend compatible"""
    from server import db
    doc = {
        "id": str(uuid.uuid4()),
        "title": item.title,
        "content": item.content,
        "created_by": user.get("full_name", user.get("email")),
        "created_by_email": user.get("email"),
        "replies": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.partner_discussions.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.post("/discussions/{discussion_id}/reply")
async def add_discussion_reply(discussion_id: str, reply: ReplyCreate, user: dict = Depends(get_partner_user)):
    """Add a reply to a discussion"""
    from server import db
    discussion = await db.partner_discussions.find_one({"id": discussion_id})
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    reply_doc = {
        "id": str(uuid.uuid4()),
        "content": reply.content,
        "author": user.get("full_name", user.get("email")),
        "author_email": user.get("email"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.partner_discussions.update_one(
        {"id": discussion_id},
        {"$push": {"replies": reply_doc}}
    )
    return reply_doc

@router.delete("/discussions/{discussion_id}")
async def delete_discussion(discussion_id: str, user: dict = Depends(get_partner_user)):
    """Delete a discussion"""
    from server import db
    result = await db.partner_discussions.delete_one({"id": discussion_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Discussion not found")
    return {"message": "Deleted"}


# ============ GOALS (Business + KPI) ============
@router.get("/goals")
async def get_goals(goal_type: Optional[str] = None, user: dict = Depends(get_partner_user)):
    from server import db
    query = {}
    if goal_type:
        query["goal_type"] = goal_type
    goals = await db.partner_goals.find(query, {"_id": 0}).sort("created_at", -1).to_list(None)
    return goals

@router.post("/goals")
async def create_goal(goal: GoalCreate, user: dict = Depends(get_partner_user)):
    from server import db
    doc = {
        "id": str(uuid.uuid4()),
        "title": goal.title,
        "description": goal.description,
        "goal_type": goal.goal_type,
        "target_value": goal.target_value,
        "current_value": goal.current_value,
        "target_date": goal.target_date,
        "category": goal.category,
        "status": "active",
        "created_by": user.get("full_name", user.get("email")),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.partner_goals.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.put("/goals/{goal_id}")
async def update_goal(goal_id: str, updates: dict, user: dict = Depends(get_partner_user)):
    from server import db
    allowed = {"title", "description", "goal_type", "target_value", "current_value", "target_date", "category", "status"}
    filtered = {k: v for k, v in updates.items() if k in allowed}
    filtered["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.partner_goals.update_one({"id": goal_id}, {"$set": filtered})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"message": "Updated"}

@router.delete("/goals/{goal_id}")
async def delete_goal(goal_id: str, user: dict = Depends(get_partner_user)):
    from server import db
    result = await db.partner_goals.delete_one({"id": goal_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"message": "Deleted"}


# ============ COMPANY POLICIES ============
@router.get("/policies")
async def get_policies(user: dict = Depends(get_partner_user)):
    from server import db
    policies = await db.partner_policies.find({}, {"_id": 0}).sort("created_at", -1).to_list(None)
    return policies

@router.post("/policies")
async def create_policy(policy: PolicyCreate, user: dict = Depends(get_partner_user)):
    from server import db
    # Count total partners to determine required votes
    total_partners = await db.users.count_documents({"is_partner": True})
    
    doc = {
        "id": str(uuid.uuid4()),
        "title": policy.title,
        "description": policy.description,
        "category": policy.category,
        "full_text": policy.full_text,
        "status": "proposed",  # proposed, approved, implemented, rejected
        "proposed_by": user.get("full_name", user.get("email")),
        "proposed_by_email": user.get("email"),
        "votes": [],
        "total_partners": total_partners,
        "required_votes": total_partners,  # all partners must agree
        "implementation_date": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.partner_policies.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.post("/policies/{policy_id}/vote")
async def vote_on_policy(policy_id: str, vote: PolicyVote, user: dict = Depends(get_partner_user)):
    from server import db
    policy = await db.partner_policies.find_one({"id": policy_id}, {"_id": 0})
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    if policy.get("status") != "proposed":
        raise HTTPException(status_code=400, detail="Can only vote on proposed policies")
    
    # Check if user already voted
    existing_votes = policy.get("votes", [])
    user_email = user.get("email")
    already_voted = any(v["email"] == user_email for v in existing_votes)
    if already_voted:
        # Update existing vote
        await db.partner_policies.update_one(
            {"id": policy_id, "votes.email": user_email},
            {"$set": {
                "votes.$.vote": vote.vote,
                "votes.$.name": user.get("full_name", user_email),
                "votes.$.voted_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    else:
        vote_doc = {
            "email": user_email,
            "name": user.get("full_name", user_email),
            "vote": vote.vote,
            "voted_at": datetime.now(timezone.utc).isoformat()
        }
        await db.partner_policies.update_one(
            {"id": policy_id},
            {"$push": {"votes": vote_doc}}
        )
    
    # Check if all partners have voted "agree"
    updated_policy = await db.partner_policies.find_one({"id": policy_id}, {"_id": 0})
    votes = updated_policy.get("votes", [])
    total_partners = await db.users.count_documents({"is_partner": True})
    agree_votes = sum(1 for v in votes if v["vote"] == "agree")
    
    # Auto-approve if all partners agree
    if agree_votes >= total_partners:
        await db.partner_policies.update_one(
            {"id": policy_id},
            {"$set": {"status": "approved", "approved_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    return {"message": "Vote recorded", "agree_count": agree_votes, "total_partners": total_partners}

@router.put("/policies/{policy_id}")
async def update_policy(policy_id: str, updates: dict, user: dict = Depends(get_partner_user)):
    from server import db
    # Only master partner can set implementation date
    allowed = {"title", "description", "category", "full_text", "implementation_date", "status"}
    filtered = {k: v for k, v in updates.items() if k in allowed}
    
    # If setting implementation date, mark as implemented
    if "implementation_date" in filtered and filtered["implementation_date"]:
        policy = await db.partner_policies.find_one({"id": policy_id}, {"_id": 0})
        if policy and policy.get("status") == "approved":
            filtered["status"] = "implemented"
    
    filtered["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.partner_policies.update_one({"id": policy_id}, {"$set": filtered})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {"message": "Updated"}

@router.delete("/policies/{policy_id}")
async def delete_policy(policy_id: str, user: dict = Depends(get_partner_user)):
    from server import db
    result = await db.partner_policies.delete_one({"id": policy_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {"message": "Deleted"}




# ============ MEETING MINUTES ============
class MeetingTopicModel(BaseModel):
    title: str
    notes: str = ""
    duration_minutes: int = 0
    presenter: str = ""
    decision: str = ""

class MeetingCreate(BaseModel):
    title: str
    date: str
    start_time: str = ""
    end_time: str = ""
    location: str = ""
    meeting_type: str = "regular"  # regular, special, emergency, quarterly
    attendees: List[str] = []
    topics: List[MeetingTopicModel] = []
    notes: str = ""
    decisions: List[str] = []
    action_items: List[str] = []
    linked_policy_ids: List[str] = []
    next_meeting_date: Optional[str] = None

@router.get("/meetings")
async def get_meetings(user: dict = Depends(get_partner_user)):
    from server import db
    meetings = await db.partner_meetings.find({}, {"_id": 0}).sort("date", -1).to_list(None)
    return meetings

@router.post("/meetings")
async def create_meeting(meeting: MeetingCreate, user: dict = Depends(get_partner_user)):
    from server import db
    doc = {
        "id": str(uuid.uuid4()),
        "title": meeting.title,
        "date": meeting.date,
        "start_time": meeting.start_time,
        "end_time": meeting.end_time,
        "location": meeting.location,
        "meeting_type": meeting.meeting_type,
        "attendees": meeting.attendees,
        "topics": [t.model_dump() for t in meeting.topics],
        "notes": meeting.notes,
        "decisions": meeting.decisions,
        "action_items": meeting.action_items,
        "linked_policy_ids": meeting.linked_policy_ids,
        "next_meeting_date": meeting.next_meeting_date,
        "status": "draft",
        "created_by": user.get("full_name", user.get("email")),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.partner_meetings.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.put("/meetings/{meeting_id}")
async def update_meeting(meeting_id: str, updates: dict, user: dict = Depends(get_partner_user)):
    from server import db
    allowed = {"title", "date", "start_time", "end_time", "location", "meeting_type", "attendees", "topics", "notes", "decisions", "action_items", "linked_policy_ids", "next_meeting_date", "status"}
    filtered = {k: v for k, v in updates.items() if k in allowed}
    filtered["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.partner_meetings.update_one({"id": meeting_id}, {"$set": filtered})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return {"message": "Updated"}

@router.delete("/meetings/{meeting_id}")
async def delete_meeting(meeting_id: str, user: dict = Depends(get_partner_user)):
    from server import db
    result = await db.partner_meetings.delete_one({"id": meeting_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return {"message": "Deleted"}


# ============ COMPANY COSTS ============
class CostCreate(BaseModel):
    title: str
    description: str = ""
    amount: float
    category: str = "general"  # general, software, marketing, legal, operations, personnel, office, subscription
    vendor: str = ""
    frequency: str = "one-time"  # one-time, monthly, quarterly, annually
    payment_date: Optional[str] = None
    is_recurring: bool = False
    status: str = "active"  # active, cancelled, pending

@router.get("/costs")
async def get_costs(user: dict = Depends(get_partner_user)):
    from server import db
    costs = await db.partner_costs.find({}, {"_id": 0}).sort("created_at", -1).to_list(None)
    return costs

@router.post("/costs")
async def create_cost(cost: CostCreate, user: dict = Depends(get_partner_user)):
    from server import db
    doc = {
        "id": str(uuid.uuid4()),
        "title": cost.title,
        "description": cost.description,
        "amount": cost.amount,
        "category": cost.category,
        "vendor": cost.vendor,
        "frequency": cost.frequency,
        "payment_date": cost.payment_date,
        "is_recurring": cost.is_recurring,
        "status": cost.status,
        "created_by": user.get("full_name", user.get("email")),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.partner_costs.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.put("/costs/{cost_id}")
async def update_cost(cost_id: str, updates: dict, user: dict = Depends(get_partner_user)):
    from server import db
    allowed = {"title", "description", "amount", "category", "vendor", "frequency", "payment_date", "is_recurring", "status"}
    filtered = {k: v for k, v in updates.items() if k in allowed}
    filtered["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.partner_costs.update_one({"id": cost_id}, {"$set": filtered})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cost not found")
    return {"message": "Updated"}

@router.delete("/costs/{cost_id}")
async def delete_cost(cost_id: str, user: dict = Depends(get_partner_user)):
    from server import db
    result = await db.partner_costs.delete_one({"id": cost_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cost not found")
    return {"message": "Deleted"}

@router.get("/costs/summary")
async def get_costs_summary(user: dict = Depends(get_partner_user)):
    """Get monthly/annual cost summaries by category."""
    from server import db
    costs = await db.partner_costs.find({"status": "active"}, {"_id": 0}).to_list(None)
    
    monthly_total = 0
    annual_total = 0
    by_category = {}
    
    for c in costs:
        amt = c.get("amount", 0)
        freq = c.get("frequency", "one-time")
        cat = c.get("category", "general")
        
        if freq == "monthly":
            monthly_total += amt
            annual_total += amt * 12
        elif freq == "quarterly":
            monthly_total += amt / 3
            annual_total += amt * 4
        elif freq == "annually":
            monthly_total += amt / 12
            annual_total += amt
        else:
            annual_total += amt
        
        if cat not in by_category:
            by_category[cat] = 0
        by_category[cat] += amt
    
    return {
        "monthly_total": round(monthly_total, 2),
        "annual_total": round(annual_total, 2),
        "by_category": by_category,
        "active_count": len(costs),
    }



# ============ PARTNER INFO ============
@router.get("/partners")
async def get_all_partners(user: dict = Depends(get_partner_user)):
    """Get list of all partners for assignment dropdowns etc."""
    from server import db
    partners = await db.users.find(
        {"is_partner": True},
        {"_id": 0, "hashed_password": 0, "password_hash": 0}
    ).to_list(None)
    return [{"email": p.get("email"), "name": p.get("full_name", p.get("email")), "is_master": p.get("is_master", False)} for p in partners]
