"""
CPR Partners API — Partner authentication, verification, and summary endpoints.
Uses a separate JWT namespace from the main admin auth.
"""
import os
import uuid
import jwt
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Header
from passlib.context import CryptContext

partners_router = APIRouter(prefix="/api/cpr-partners", tags=["CPR Partners"])

db = None
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
PARTNER_JWT_SECRET = os.environ.get("JWT_SECRET_KEY", "your-secret-key-change-in-production-credlocity-2025") + "-partners"
PARTNER_JWT_ALGO = "HS256"
PARTNER_JWT_EXP_HOURS = 12


def set_db(database):
    global db
    db = database


def remove_id(doc):
    if doc and "_id" in doc:
        doc.pop("_id")
    return doc


def create_partner_token(partner_id: str, role: str, email: str):
    payload = {
        "sub": email,
        "partner_id": partner_id,
        "partner_role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=PARTNER_JWT_EXP_HOURS),
        "iss": "credlocity-partners",
    }
    return jwt.encode(payload, PARTNER_JWT_SECRET, algorithm=PARTNER_JWT_ALGO)


def decode_partner_token(token: str):
    try:
        payload = jwt.decode(token, PARTNER_JWT_SECRET, algorithms=[PARTNER_JWT_ALGO])
        if payload.get("iss") != "credlocity-partners":
            return None
        return payload
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


async def get_partner(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Partner authentication required")
    token = authorization.replace("Bearer ", "")
    payload = decode_partner_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired partner token")
    return payload


async def require_master_partner(authorization: str = Header(None)):
    partner = await get_partner(authorization)
    if partner.get("partner_role") != "master_partner":
        raise HTTPException(status_code=403, detail="Master partner access required")
    return partner


async def seed_partner_accounts():
    """Seed the two partner accounts if they don't exist."""
    count = await db.partner_accounts.count_documents({})
    if count >= 2:
        return

    partners = [
        {
            "id": str(uuid.uuid4()),
            "email": "joeziel@credlocity.com",
            "password_hash": pwd_context.hash("Credit123!"),
            "role": "master_partner",
            "display_name": "Joeziel Vazquez-Davila",
            "can_verify": True,
            "can_edit_mailing": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "email": "shar@cprcreditrepair.com",
            "password_hash": pwd_context.hash("Credlocity2026!"),
            "role": "partner",
            "display_name": "Shar Schaffeld",
            "can_verify": False,
            "can_edit_mailing": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
    ]
    for p in partners:
        existing = await db.partner_accounts.find_one({"email": p["email"]})
        if not existing:
            await db.partner_accounts.insert_one(p)
    print("[SEED] Partner accounts seeded: joeziel@credlocity.com, shar@cprcreditrepair.com")


# ============ AUTH ============

@partners_router.post("/login")
async def partner_login(data: dict):
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    account = await db.partner_accounts.find_one({"email": email})
    if not account or not pwd_context.verify(password, account.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_partner_token(account["id"], account["role"], account["email"])

    # Track session
    session = {
        "id": str(uuid.uuid4()),
        "partner_id": account["id"],
        "partner_name": account["display_name"],
        "partner_role": account["role"],
        "login_time": datetime.now(timezone.utc).isoformat(),
        "last_activity": datetime.now(timezone.utc).isoformat(),
        "session_token": token,
    }
    await db.partners_hub_sessions.insert_one(session)

    return {
        "access_token": token,
        "partner": {
            "id": account["id"],
            "email": account["email"],
            "display_name": account["display_name"],
            "role": account["role"],
            "can_verify": account.get("can_verify", False),
            "can_edit_mailing": account.get("can_edit_mailing", False),
        },
    }


@partners_router.get("/me")
async def get_partner_me(authorization: str = Header(None)):
    payload = await get_partner(authorization)
    account = await db.partner_accounts.find_one({"email": payload["sub"]}, {"_id": 0, "password_hash": 0, "pin_hash": 0})
    if not account:
        raise HTTPException(status_code=404, detail="Partner account not found")
    return account


@partners_router.post("/logout")
async def partner_logout(authorization: str = Header(None)):
    payload = await get_partner(authorization)
    token = authorization.replace("Bearer ", "")
    await db.partners_hub_sessions.delete_many({"session_token": token})
    return {"message": "Logged out successfully"}


# ============ VERIFICATION ============

@partners_router.post("/verify/client/{client_id}")
async def verify_client(client_id: str, authorization: str = Header(None)):
    partner = await require_master_partner(authorization)
    now = datetime.now(timezone.utc).isoformat()

    # Try cpr_clients first
    result = await db.cpr_clients.update_one(
        {"id": client_id},
        {"$set": {
            "joe_verified": True,
            "merger_status": "verified",
            "merger_verified_date": now,
            "merger_verified_by": "Joeziel",
            "updated_at": now,
        }}
    )
    if result.matched_count == 0:
        # Try elisabeth
        result = await db.cpr_elisabeth_clients.update_one(
            {"id": client_id},
            {"$set": {
                "joe_verified": True,
                "merger_status": "verified",
                "merger_verified_date": now,
                "merger_verified_by": "Joeziel",
            }}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Client not found")

    return {"message": "Client verified", "verified_at": now}


@partners_router.post("/verify/notary/{client_id}")
async def verify_notary(client_id: str, authorization: str = Header(None)):
    await require_master_partner(authorization)
    now = datetime.now(timezone.utc).isoformat()

    result = await db.cpr_clients.update_one(
        {"id": client_id},
        {"$set": {"notary_verified_by_joe": True, "updated_at": now}}
    )
    if result.matched_count == 0:
        result = await db.cpr_elisabeth_clients.update_one(
            {"id": client_id},
            {"$set": {"notary_verified_by_joe": True}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Client not found")

    return {"message": "Notary confirmed"}


@partners_router.get("/pending-verifications")
async def get_pending_verifications(authorization: str = Header(None)):
    await get_partner(authorization)

    cpr_pending = await db.cpr_clients.find(
        {"joe_verified": {"$ne": True}}, {"_id": 0}
    ).sort("updated_at", -1).to_list(500)

    elisabeth_pending = await db.cpr_elisabeth_clients.find(
        {"joe_verified": {"$ne": True}}, {"_id": 0}
    ).sort("full_name", 1).to_list(500)

    # Add source collection tag
    for c in cpr_pending:
        c["_source"] = "cpr_clients"
    for c in elisabeth_pending:
        c["_source"] = "cpr_elisabeth_clients"

    return cpr_pending + elisabeth_pending


@partners_router.get("/summary")
async def get_partner_summary(authorization: str = Header(None)):
    await get_partner(authorization)

    # Count clients
    cpr_count = await db.cpr_clients.count_documents({"status": {"$ne": "closed"}})
    elisabeth_count = await db.cpr_elisabeth_clients.count_documents({"status": {"$ne": "canceled"}})
    total_clients = cpr_count + elisabeth_count

    # Sum shar_total and joe_total
    cpr_clients = await db.cpr_clients.find(
        {"status": {"$ne": "closed"}},
        {"_id": 0, "shar_total": 1, "joe_total": 1, "grand_total": 1, "joe_verified": 1, "category": 1}
    ).to_list(500)
    elisabeth_clients = await db.cpr_elisabeth_clients.find(
        {"status": {"$ne": "canceled"}},
        {"_id": 0, "shar_total": 1, "joe_total": 1, "grand_total": 1, "joe_verified": 1, "category": 1}
    ).to_list(500)

    all_clients = cpr_clients + [dict(c, category="cpr_elisabeth") for c in elisabeth_clients]

    shar_current = round(sum(c.get("shar_total", 0) or 0 for c in all_clients), 2)
    joe_current = round(sum(c.get("joe_total", 0) or 0 for c in all_clients), 2)
    pending_verifications = len([c for c in all_clients if not c.get("joe_verified")])

    # By category
    categories = {}
    for c in all_clients:
        cat = c.get("category", "unknown")
        if cat not in categories:
            categories[cat] = {"shar_total": 0, "joe_total": 0, "grand_total": 0, "count": 0}
        categories[cat]["shar_total"] = round(categories[cat]["shar_total"] + (c.get("shar_total", 0) or 0), 2)
        categories[cat]["joe_total"] = round(categories[cat]["joe_total"] + (c.get("joe_total", 0) or 0), 2)
        categories[cat]["grand_total"] = round(categories[cat]["grand_total"] + (c.get("grand_total", 0) or 0), 2)
        categories[cat]["count"] += 1

    # Payouts already made
    payouts = await db.cpr_shar_payouts.find({}, {"_id": 0}).sort("month", 1).to_list(100)
    total_paid = round(sum(p.get("actual_paid", 0) for p in payouts), 2)
    outstanding = round(shar_current - total_paid, 2)

    return {
        "total_clients": total_clients,
        "shar_current_total": shar_current,
        "joe_current_total": joe_current,
        "pending_verifications": pending_verifications,
        "by_category": categories,
        "payouts": payouts,
        "total_paid_to_shar": total_paid,
        "outstanding_balance": outstanding,
    }


@partners_router.get("/payout-pdf")
async def export_payout_pdf(authorization: str = Header(None)):
    """Generate a payout summary PDF."""
    await get_partner(authorization)
    from fastapi.responses import StreamingResponse
    from io import BytesIO
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet

    summary_data = await get_partner_summary(authorization)

    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=letter, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("Credlocity - Payout Summary", styles['Title']))
    elements.append(Paragraph(f"Generated: {datetime.now(timezone.utc).strftime('%B %d, %Y')}", styles['Normal']))
    elements.append(Spacer(1, 20))

    # Shar section
    elements.append(Paragraph("What Joey Owes Shar", styles['Heading2']))
    shar_data = [["Category", "Shar's Total", "Clients"]]
    for cat, d in summary_data["by_category"].items():
        shar_data.append([cat.replace("_", " ").title(), f"${d['shar_total']:.2f}", str(d['count'])])
    shar_data.append(["TOTAL", f"${summary_data['shar_current_total']:.2f}", str(summary_data['total_clients'])])
    t = Table(shar_data, colWidths=[200, 150, 80])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.2, 0.6, 0.2)),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (0, -1), (-1, -1), colors.Color(0.9, 0.95, 0.9)),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 20))

    # Joe section
    elements.append(Paragraph("What Joey Keeps", styles['Heading2']))
    joe_data = [["Category", "Joe's Total"]]
    for cat, d in summary_data["by_category"].items():
        joe_data.append([cat.replace("_", " ").title(), f"${d['joe_total']:.2f}"])
    joe_data.append(["TOTAL", f"${summary_data['joe_current_total']:.2f}"])
    t2 = Table(joe_data, colWidths=[200, 150])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.2, 0.3, 0.6)),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (0, -1), (-1, -1), colors.Color(0.9, 0.9, 0.95)),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
    ]))
    elements.append(t2)
    elements.append(Spacer(1, 20))

    # Balance
    elements.append(Paragraph("Settlement", styles['Heading2']))
    balance_data = [
        ["Total Paid to Shar", f"${summary_data['total_paid_to_shar']:.2f}"],
        ["Outstanding Balance", f"${summary_data['outstanding_balance']:.2f}"],
    ]
    t3 = Table(balance_data, colWidths=[200, 150])
    t3.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
    ]))
    elements.append(t3)

    doc.build(elements)
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=payout-summary-{datetime.now().strftime('%Y-%m-%d')}.pdf"}
    )
