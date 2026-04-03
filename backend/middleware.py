from fastapi import HTTPException, Request, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from datetime import datetime, timezone

security = HTTPBearer(auto_error=False)
db = None

def set_db(database):
    global db
    db = database


async def get_current_user_from_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Extract and validate user from JWT token"""
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
    from auth import decode_access_token
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = await db.users.find_one({"id": payload.get("sub")}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def check_document_access(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Middleware to verify the requesting user has access to a specific document.
    
    Access rules:
    - Admin/master users have access to all documents
    - Attorneys can access documents assigned to their cases
    - Clients can access only their own documents
    - Documents can have explicit access lists
    """
    user = await get_current_user_from_token(credentials)
    
    # Master admins and admin role have full access
    if user.get("is_master") or user.get("role") == "admin":
        request.state.user = user
        request.state.access_level = "full"
        return user
    
    # Extract document_id from path params or query
    document_id = request.path_params.get("document_id") or request.query_params.get("document_id")
    
    if not document_id:
        # No specific document requested — allow general listing (filtered later)
        request.state.user = user
        request.state.access_level = "filtered"
        return user
    
    # Look up the document
    document = await db.documents.find_one({"id": document_id}, {"_id": 0})
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    user_id = user.get("id")
    
    # Check if user is the document owner
    if document.get("owner_id") == user_id or document.get("created_by") == user_id:
        request.state.user = user
        request.state.access_level = "owner"
        return user
    
    # Check if user is in the document's access list
    access_list = document.get("access_list", [])
    if user_id in access_list:
        request.state.user = user
        request.state.access_level = "shared"
        return user
    
    # Check if user is an attorney assigned to the related case
    case_id = document.get("case_id")
    if case_id and user.get("role") == "attorney":
        case = await db.cases.find_one({"id": case_id, "attorney_id": user_id}, {"_id": 0})
        if case:
            request.state.user = user
            request.state.access_level = "attorney"
            return user
    
    # Check department-level access
    department = user.get("department")
    if department and document.get("department_access"):
        if department in document.get("department_access", []):
            request.state.user = user
            request.state.access_level = "department"
            return user
    
    # Log the access attempt
    await db.access_logs.insert_one({
        "user_id": user_id,
        "document_id": document_id,
        "action": "access_denied",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "ip_address": request.client.host if request.client else "unknown"
    })
    
    raise HTTPException(status_code=403, detail="You do not have permission to access this document")


async def verify_attorney_payment(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Middleware to verify that an attorney's payment/subscription is current
    before allowing access to premium features.
    
    Payment verification checks:
    - Active subscription status
    - Payment not past due
    - Within allowed grace period (7 days) if payment is late
    - Free tier features still accessible without payment
    """
    user = await get_current_user_from_token(credentials)
    
    # Non-attorney users bypass this check
    if user.get("role") != "attorney":
        request.state.user = user
        request.state.payment_verified = True
        return user
    
    # Master admins bypass payment checks
    if user.get("is_master"):
        request.state.user = user
        request.state.payment_verified = True
        return user
    
    user_id = user.get("id")
    
    # Look up attorney's payment/subscription record
    subscription = await db.attorney_subscriptions.find_one(
        {"attorney_id": user_id},
        {"_id": 0}
    )
    
    if not subscription:
        # No subscription found — check if the feature requires payment
        request.state.user = user
        request.state.payment_verified = False
        request.state.subscription_status = "none"
        
        # Allow free tier access
        free_tier_paths = [
            "/api/attorney/profile",
            "/api/attorney/cases",
            "/api/attorney/dashboard",
        ]
        if any(request.url.path.startswith(p) for p in free_tier_paths):
            return user
        
        raise HTTPException(
            status_code=402,
            detail={
                "message": "Active subscription required for this feature",
                "subscription_status": "none",
                "action": "subscribe"
            }
        )
    
    status = subscription.get("status", "inactive")
    
    # Check if subscription is active
    if status == "active":
        request.state.user = user
        request.state.payment_verified = True
        request.state.subscription_status = "active"
        return user
    
    # Check grace period for past-due subscriptions
    if status == "past_due":
        grace_period_days = 7
        last_payment = subscription.get("last_payment_date")
        if last_payment:
            if isinstance(last_payment, str):
                last_payment = datetime.fromisoformat(last_payment)
            days_overdue = (datetime.now(timezone.utc) - last_payment).days
            
            if days_overdue <= grace_period_days:
                request.state.user = user
                request.state.payment_verified = True
                request.state.subscription_status = "grace_period"
                request.state.days_remaining = grace_period_days - days_overdue
                return user
        
        raise HTTPException(
            status_code=402,
            detail={
                "message": "Payment is past due. Please update your payment method.",
                "subscription_status": "past_due",
                "action": "update_payment"
            }
        )
    
    # Cancelled or expired subscription
    if status in ("cancelled", "expired"):
        # Allow read-only access to existing data
        if request.method == "GET":
            request.state.user = user
            request.state.payment_verified = False
            request.state.subscription_status = status
            return user
        
        raise HTTPException(
            status_code=402,
            detail={
                "message": f"Subscription is {status}. Reactivate to access premium features.",
                "subscription_status": status,
                "action": "reactivate"
            }
        )
    
    raise HTTPException(
        status_code=402,
        detail={
            "message": "Unable to verify payment status",
            "subscription_status": status,
            "action": "contact_support"
        }
    )
