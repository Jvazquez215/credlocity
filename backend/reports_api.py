"""
Partners Hub Reports API
Provides comprehensive financial and operational reporting
for every business area managed in the CMS.
"""

from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import Response
from datetime import datetime, timezone, timedelta
from typing import Optional
from uuid import uuid4

reports_router = APIRouter(prefix="/reports", tags=["Reports"])

db = None

def set_db(database):
    global db
    db = database


async def _get_partner(authorization: str = Header(None)):
    """Verify user is a partner or admin."""
    if not authorization:
        return None
    try:
        from server import decode_token
        actual_token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
        payload = decode_token(actual_token)
        if not payload:
            return None
        email = payload.get("sub", "")
        user = await db.users.find_one({"email": email}, {"_id": 0, "hashed_password": 0})
        if user and user.get("role") in ["admin", "super_admin"]:
            return user
        if user and user.get("is_partner"):
            return user
        return None
    except Exception:
        return None


@reports_router.get("/summary")
async def get_reports_summary(authorization: Optional[str] = Header(None)):
    """High-level summary across all business areas."""
    user = await _get_partner(authorization)
    if not user:
        raise HTTPException(status_code=403, detail="Partner or admin access required")

    # Collections
    total_collections = await db.collections_accounts.count_documents({})
    active_collections = await db.collections_accounts.count_documents({"account_status": {"$in": ["active", "payment_plan"]}})

    # Pipeline totals
    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$past_due_balance"}}}]
    coll_total = await db.collections_accounts.aggregate(pipeline).to_list(1)
    collections_balance = coll_total[0]["total"] if coll_total else 0

    # Payroll
    total_employees = await db.payroll_profiles.count_documents({})
    payroll_pipeline = [{"$group": {"_id": None, "total": {"$sum": "$amount"}}}]
    comm_total = await db.payroll_commissions.aggregate(payroll_pipeline).to_list(1)
    total_commissions = comm_total[0]["total"] if comm_total else 0

    # Credit Builder
    cb_accounts = await db.credit_builder_accounts.count_documents({})

    # School
    school_students = await db.school_students.count_documents({})
    school_enrollments = await db.school_enrollments.count_documents({})
    school_certs = await db.school_certificates.count_documents({})
    payment_plans = await db.school_payment_plans.count_documents({})
    pp_pipeline = [{"$group": {"_id": None, "total": {"$sum": "$amount_paid"}}}]
    pp_total = await db.school_payment_records.aggregate(pp_pipeline).to_list(1)
    school_revenue = pp_total[0]["total"] if pp_total else 0

    # Blog/Content
    blog_posts = await db.blog_posts.count_documents({})
    press_releases = await db.press_releases.count_documents({})

    # Credit Reporting
    cr_total = 0
    try:
        coll_accs = await db.collections_accounts.find({}, {"_id": 0, "metro2_status_code": 1, "account_number": 1}).to_list(None)
        cb_accs = await db.credit_builder_accounts.find({}, {"_id": 0, "account_status_code": 1}).to_list(None)
        sch_accs = await db.school_payment_accounts.find({"has_payment_plan": True}, {"_id": 0}).to_list(None)
        cr_total = len(coll_accs) + len(cb_accs) + len(sch_accs)
    except Exception:
        pass

    return {
        "summary": {
            "collections": {
                "total_accounts": total_collections,
                "active_accounts": active_collections,
                "total_balance": collections_balance,
            },
            "payroll": {
                "total_employees": total_employees,
                "total_commissions_paid": total_commissions,
            },
            "credit_builder": {
                "total_accounts": cb_accounts,
            },
            "school": {
                "total_students": school_students,
                "total_enrollments": school_enrollments,
                "certificates_issued": school_certs,
                "payment_plans": payment_plans,
                "revenue_collected": school_revenue,
            },
            "content": {
                "blog_posts": blog_posts,
                "press_releases": press_releases,
            },
            "credit_reporting": {
                "total_reportable_accounts": cr_total,
            },
        }
    }


@reports_router.get("/collections")
async def collections_report(
    authorization: Optional[str] = Header(None),
    period: Optional[str] = "all",
):
    """Detailed collections financial report."""
    user = await _get_partner(authorization)
    if not user:
        raise HTTPException(status_code=403, detail="Partner or admin access required")

    query = {}
    if period != "all":
        days = {"7d": 7, "30d": 30, "90d": 90, "year": 365}.get(period, 365)
        cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
        query["created_at"] = {"$gte": cutoff}

    accounts = await db.collections_accounts.find(query, {"_id": 0}).to_list(None)

    total_balance = sum(a.get("past_due_balance", 0) for a in accounts)
    total_original = sum(a.get("original_balance", 0) for a in accounts)
    by_status = {}
    for a in accounts:
        s = a.get("account_status", "unknown")
        if s not in by_status:
            by_status[s] = {"count": 0, "balance": 0}
        by_status[s]["count"] += 1
        by_status[s]["balance"] += a.get("past_due_balance", 0)

    # Payments collected
    payments = await db.collections_payments.find(query, {"_id": 0}).to_list(None)
    total_collected = sum(p.get("amount", 0) for p in payments)

    return {
        "report": {
            "period": period,
            "total_accounts": len(accounts),
            "total_balance_outstanding": total_balance,
            "total_original_balance": total_original,
            "total_collected": total_collected,
            "recovery_rate": round((total_collected / total_original * 100) if total_original > 0 else 0, 1),
            "by_status": by_status,
        }
    }


@reports_router.get("/payroll")
async def payroll_report(
    authorization: Optional[str] = Header(None),
    period: Optional[str] = "all",
):
    """Detailed payroll and commission report."""
    user = await _get_partner(authorization)
    if not user:
        raise HTTPException(status_code=403, detail="Partner or admin access required")

    query = {}
    if period != "all":
        days = {"7d": 7, "30d": 30, "90d": 90, "year": 365}.get(period, 365)
        cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
        query["date"] = {"$gte": cutoff}

    commissions = await db.payroll_commissions.find(query, {"_id": 0}).to_list(None)
    total_paid = sum(c.get("amount", 0) for c in commissions)

    by_employee = {}
    for c in commissions:
        eid = c.get("employee_id", "unknown")
        if eid not in by_employee:
            by_employee[eid] = {"employee_id": eid, "total": 0, "count": 0}
        by_employee[eid]["total"] += c.get("amount", 0)
        by_employee[eid]["count"] += 1

    profiles = await db.payroll_profiles.find({}, {"_id": 0}).to_list(None)

    return {
        "report": {
            "period": period,
            "total_commissions": total_paid,
            "commission_entries": len(commissions),
            "active_employees": len(profiles),
            "by_employee": list(by_employee.values()),
        }
    }


@reports_router.get("/credit-builder")
async def credit_builder_report(authorization: Optional[str] = Header(None)):
    """Credit builder accounts report."""
    user = await _get_partner(authorization)
    if not user:
        raise HTTPException(status_code=403, detail="Partner or admin access required")

    accounts = await db.credit_builder_accounts.find({}, {"_id": 0, "ssn_encrypted": 0}).to_list(None)
    total_balance = sum(a.get("current_balance", 0) for a in accounts)
    total_limit = sum(a.get("credit_limit", 0) for a in accounts)

    by_status = {}
    for a in accounts:
        s = a.get("account_status", "active")
        if s not in by_status:
            by_status[s] = {"count": 0, "balance": 0}
        by_status[s]["count"] += 1
        by_status[s]["balance"] += a.get("current_balance", 0)

    return {
        "report": {
            "total_accounts": len(accounts),
            "total_balance": total_balance,
            "total_credit_limit": total_limit,
            "utilization_rate": round((total_balance / total_limit * 100) if total_limit > 0 else 0, 1),
            "by_status": by_status,
        }
    }


@reports_router.get("/school")
async def school_report(authorization: Optional[str] = Header(None)):
    """School enrollment and revenue report."""
    user = await _get_partner(authorization)
    if not user:
        raise HTTPException(status_code=403, detail="Partner or admin access required")

    students = await db.school_students.count_documents({})
    enrollments = await db.school_enrollments.count_documents({})
    completions = await db.school_enrollments.count_documents({"completed_at": {"$ne": None}})
    certificates = await db.school_certificates.count_documents({})
    plans = await db.school_payment_plans.find({}, {"_id": 0}).to_list(None)

    total_plan_value = sum(p.get("plan_amount", 0) for p in plans)
    total_collected = sum(p.get("amount_paid", 0) for p in plans)
    active_plans = len([p for p in plans if p.get("status") == "active"])
    completed_plans = len([p for p in plans if p.get("status") == "completed"])

    courses = await db.school_courses.find({"status": "published"}, {"_id": 0, "title": 1, "id": 1}).to_list(None)
    course_enrollment = []
    for c in courses:
        e_count = await db.school_enrollments.count_documents({"course_id": c["id"]})
        course_enrollment.append({"course": c.get("title", ""), "enrollments": e_count})

    return {
        "report": {
            "total_students": students,
            "total_enrollments": enrollments,
            "total_completions": completions,
            "completion_rate": round((completions / enrollments * 100) if enrollments > 0 else 0, 1),
            "certificates_issued": certificates,
            "payment_plans": {
                "total": len(plans),
                "active": active_plans,
                "completed": completed_plans,
                "total_value": total_plan_value,
                "total_collected": total_collected,
                "collection_rate": round((total_collected / total_plan_value * 100) if total_plan_value > 0 else 0, 1),
            },
            "by_course": sorted(course_enrollment, key=lambda x: x["enrollments"], reverse=True),
        }
    }


@reports_router.get("/credit-reporting")
async def credit_reporting_report(authorization: Optional[str] = Header(None)):
    """Credit bureau reporting readiness report."""
    user = await _get_partner(authorization)
    if not user:
        raise HTTPException(status_code=403, detail="Partner or admin access required")

    from credit_reporting_api import _compute_compliance

    coll_accs = await db.collections_accounts.find({}, {"_id": 0}).to_list(None)
    cb_accs = await db.credit_builder_accounts.find({}, {"_id": 0, "ssn_encrypted": 0}).to_list(None)
    sch_accs = await db.school_payment_accounts.find({"has_payment_plan": True}, {"_id": 0, "ssn_encrypted": 0}).to_list(None)

    def count_ready(accs, atype):
        r, nr = 0, 0
        for a in accs:
            c = _compute_compliance(a, atype)
            if c["ready_to_report"]:
                r += 1
            else:
                nr += 1
        return r, nr

    coll_r, coll_nr = count_ready(coll_accs, "collections")
    cb_r, cb_nr = count_ready(cb_accs, "credit_builder")
    sch_r, sch_nr = count_ready(sch_accs, "school")

    exports = await db.metro2_exports.count_documents({})
    cycles = await db.reporting_cycles.count_documents({})

    return {
        "report": {
            "reporting_start_date": "2026-08-01",
            "collections": {"total": len(coll_accs), "ready": coll_r, "not_ready": coll_nr, "type": "Installment (Collection)"},
            "credit_builder": {"total": len(cb_accs), "ready": cb_r, "not_ready": cb_nr, "type": "Revolving Line of Credit"},
            "school": {"total": len(sch_accs), "ready": sch_r, "not_ready": sch_nr, "type": "Educational Contractual"},
            "total_accounts": len(coll_accs) + len(cb_accs) + len(sch_accs),
            "total_ready": coll_r + cb_r + sch_r,
            "metro2_exports": exports,
            "reporting_cycles": cycles,
        }
    }


@reports_router.get("/state-of-company/pdf")
async def state_of_company_pdf(authorization: Optional[str] = Header(None)):
    """Generate comprehensive 'State of the Company' PDF report."""
    user = await _get_partner(authorization)
    if not user:
        raise HTTPException(status_code=403, detail="Partner or admin access required")

    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    from reportlab.lib.colors import HexColor
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    import io

    # Gather all data
    # Collections
    coll_accs = await db.collections_accounts.find({}, {"_id": 0}).to_list(None)
    coll_balance = sum(a.get("past_due_balance", 0) for a in coll_accs)
    coll_original = sum(a.get("original_balance", 0) for a in coll_accs)
    coll_payments = await db.collections_payments.find({}, {"_id": 0}).to_list(None)
    coll_collected = sum(p.get("amount", 0) for p in coll_payments)

    # Payroll
    payroll_profiles = await db.payroll_profiles.count_documents({})
    commissions = await db.payroll_commissions.find({}, {"_id": 0}).to_list(None)
    total_commissions = sum(c.get("amount", 0) for c in commissions)

    # Credit Builder
    cb_accs = await db.credit_builder_accounts.find({}, {"_id": 0, "ssn_encrypted": 0}).to_list(None)
    cb_balance = sum(a.get("current_balance", 0) for a in cb_accs)
    cb_limit = sum(a.get("credit_limit", 0) for a in cb_accs)

    # School
    school_students = await db.school_students.count_documents({})
    school_enrollments = await db.school_enrollments.count_documents({})
    school_certs = await db.school_certificates.count_documents({})
    school_completions = await db.school_enrollments.count_documents({"completed_at": {"$ne": None}})
    school_plans = await db.school_payment_plans.find({}, {"_id": 0}).to_list(None)
    school_plan_value = sum(p.get("plan_amount", 0) for p in school_plans)
    school_collected = sum(p.get("amount_paid", 0) for p in school_plans)

    # Content
    blog_count = await db.blog_posts.count_documents({})
    pr_count = await db.press_releases.count_documents({})

    # Credit Reporting
    sch_payment_accs = await db.school_payment_accounts.find({"has_payment_plan": True}, {"_id": 0}).to_list(None)
    total_reportable = len(coll_accs) + len(cb_accs) + len(sch_payment_accs)

    # Build PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title2', parent=styles['Title'], fontSize=22, textColor=HexColor('#1a365d'), spaceAfter=6)
    subtitle_style = ParagraphStyle('Subtitle2', parent=styles['Normal'], fontSize=10, textColor=HexColor('#64748b'), spaceAfter=20)
    section_style = ParagraphStyle('Section2', parent=styles['Heading2'], fontSize=14, textColor=HexColor('#1e3a5f'), spaceBefore=16, spaceAfter=8, borderColor=HexColor('#c6a035'), borderWidth=0, borderPadding=0)
    normal = ParagraphStyle('Normal2', parent=styles['Normal'], fontSize=10, textColor=HexColor('#334155'), leading=14)

    story = []
    now = datetime.now(timezone.utc)

    story.append(Paragraph("STATE OF THE COMPANY", title_style))
    story.append(Paragraph(f"Credlocity - Confidential Report | Generated {now.strftime('%B %d, %Y at %I:%M %p UTC')}", subtitle_style))

    # Executive Summary
    story.append(Paragraph("EXECUTIVE SUMMARY", section_style))
    total_revenue = coll_collected + school_collected
    total_expenses = total_commissions
    net = total_revenue - total_expenses
    summary_data = [
        ['Metric', 'Value'],
        ['Total Revenue Collected', f'${total_revenue:,.2f}'],
        ['Total Expenses (Commissions)', f'${total_expenses:,.2f}'],
        ['Net Income', f'${net:,.2f}'],
        ['Total Reportable Accounts', str(total_reportable)],
    ]
    t = Table(summary_data, colWidths=[3.5*inch, 3*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#1e3a5f')),
        ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#ffffff')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#f8fafc'), HexColor('#ffffff')]),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t)
    story.append(Spacer(1, 12))

    # Collections
    story.append(Paragraph("COLLECTIONS DEPARTMENT", section_style))
    coll_data = [
        ['Metric', 'Value'],
        ['Total Accounts', str(len(coll_accs))],
        ['Original Balance', f'${coll_original:,.2f}'],
        ['Outstanding Balance', f'${coll_balance:,.2f}'],
        ['Total Collected', f'${coll_collected:,.2f}'],
        ['Recovery Rate', f'{(coll_collected / coll_original * 100) if coll_original > 0 else 0:.1f}%'],
        ['Account Type', 'Installment (Code 48)'],
    ]
    t = Table(coll_data, colWidths=[3.5*inch, 3*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#7c3aed')),
        ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#ffffff')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#faf5ff'), HexColor('#ffffff')]),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t)
    story.append(Spacer(1, 12))

    # Payroll
    story.append(Paragraph("PAYROLL & COMMISSIONS", section_style))
    pay_data = [
        ['Metric', 'Value'],
        ['Active Employees', str(payroll_profiles)],
        ['Total Commission Entries', str(len(commissions))],
        ['Total Commissions Paid', f'${total_commissions:,.2f}'],
    ]
    t = Table(pay_data, colWidths=[3.5*inch, 3*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#059669')),
        ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#ffffff')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#ecfdf5'), HexColor('#ffffff')]),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t)
    story.append(Spacer(1, 12))

    # Credit Builder
    story.append(Paragraph("CREDIT BUILDER", section_style))
    cb_data = [
        ['Metric', 'Value'],
        ['Total Accounts', str(len(cb_accs))],
        ['Total Balance', f'${cb_balance:,.2f}'],
        ['Total Credit Limit', f'${cb_limit:,.2f}'],
        ['Utilization Rate', f'{(cb_balance / cb_limit * 100) if cb_limit > 0 else 0:.1f}%'],
        ['Account Type', 'Revolving Line of Credit (Code 18)'],
    ]
    t = Table(cb_data, colWidths=[3.5*inch, 3*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#2563eb')),
        ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#ffffff')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#eff6ff'), HexColor('#ffffff')]),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t)
    story.append(Spacer(1, 12))

    # School
    story.append(Paragraph("CROA ETHICS SCHOOL", section_style))
    sch_data = [
        ['Metric', 'Value'],
        ['Total Students', str(school_students)],
        ['Total Enrollments', str(school_enrollments)],
        ['Total Completions', str(school_completions)],
        ['Completion Rate', f'{(school_completions / school_enrollments * 100) if school_enrollments > 0 else 0:.1f}%'],
        ['Certificates Issued', str(school_certs)],
        ['Payment Plans', str(len(school_plans))],
        ['Total Plan Value', f'${school_plan_value:,.2f}'],
        ['Revenue Collected', f'${school_collected:,.2f}'],
        ['Account Type', 'Educational Contractual (Code 12)'],
    ]
    t = Table(sch_data, colWidths=[3.5*inch, 3*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#7c3aed')),
        ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#ffffff')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#faf5ff'), HexColor('#ffffff')]),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t)
    story.append(Spacer(1, 12))

    # Credit Bureau Reporting
    story.append(Paragraph("CREDIT BUREAU REPORTING", section_style))
    cr_data = [
        ['Metric', 'Value'],
        ['Reporting Start Date', 'August 1, 2026'],
        ['Collections Accounts (Installment)', str(len(coll_accs))],
        ['Credit Builder Accounts (Revolving)', str(len(cb_accs))],
        ['School Accounts (Educational)', str(len(sch_payment_accs))],
        ['Total Reportable', str(total_reportable)],
        ['Status', 'Pre-reporting - All payments being tracked for retroactive reporting'],
    ]
    t = Table(cr_data, colWidths=[3.5*inch, 3*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#d97706')),
        ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#ffffff')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#fffbeb'), HexColor('#ffffff')]),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t)
    story.append(Spacer(1, 12))

    # Content
    story.append(Paragraph("CONTENT & MARKETING", section_style))
    content_data = [
        ['Metric', 'Value'],
        ['Blog Posts Published', str(blog_count)],
        ['Press Releases', str(pr_count)],
    ]
    t = Table(content_data, colWidths=[3.5*inch, 3*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#0891b2')),
        ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#ffffff')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#ecfeff'), HexColor('#ffffff')]),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t)
    story.append(Spacer(1, 24))

    # Footer
    story.append(Paragraph("This report is confidential and intended for authorized Credlocity partners only.", ParagraphStyle('Footer', parent=normal, fontSize=8, textColor=HexColor('#94a3b8'), alignment=1)))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()

    filename = f"Credlocity_State_of_Company_{now.strftime('%Y%m%d')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
