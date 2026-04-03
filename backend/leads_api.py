"""
Leads API — Captures leads from the Free Trial and Book Consultation flows.
Stores lead data with signed service agreements in MongoDB.
Generates and stores signed agreement PDFs.
"""
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from datetime import datetime, timezone
from typing import Optional
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch
import uuid, io, base64

leads_router = APIRouter(prefix="/api/leads", tags=["Leads"])
db = None


def set_db(database):
    global db
    db = database


def generate_agreement_pdf(lead: dict) -> bytes:
    """Generate a CROA-compliant service agreement PDF."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=letter, leftMargin=60, rightMargin=60, topMargin=50, bottomMargin=50)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle('AgreementTitle', parent=styles['Title'], fontSize=16, textColor=HexColor('#1a365d'), spaceAfter=6, alignment=TA_CENTER)
    subtitle_style = ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=10, textColor=HexColor('#4a5568'), alignment=TA_CENTER, spaceAfter=12)
    heading_style = ParagraphStyle('SectionHead', parent=styles['Heading2'], fontSize=12, textColor=HexColor('#1a365d'), spaceBefore=14, spaceAfter=6, fontName='Helvetica-Bold')
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=9.5, leading=13, alignment=TA_JUSTIFY, spaceAfter=6)
    bold_body = ParagraphStyle('BoldBody', parent=body_style, fontName='Helvetica-Bold')
    small_style = ParagraphStyle('Small', parent=styles['Normal'], fontSize=8, leading=10, textColor=HexColor('#718096'))
    sig_style = ParagraphStyle('Signature', parent=styles['Normal'], fontSize=11, fontName='Helvetica-BoldOblique', textColor=HexColor('#1a365d'))

    signed_dt = lead.get("signed_at", datetime.now(timezone.utc).isoformat())
    try:
        dt_obj = datetime.fromisoformat(signed_dt.replace('Z', '+00:00'))
    except:
        dt_obj = datetime.now(timezone.utc)
    date_str = dt_obj.strftime('%B %d, %Y')
    time_str = dt_obj.strftime('%I:%M %p %Z')
    full_name = f"{lead['first_name']} {lead['last_name']}"
    ip_addr = lead.get("ip_address", "Not recorded")

    elements = []

    # Header
    elements.append(Paragraph("CREDLOCITY BUSINESS GROUP LLC", title_style))
    elements.append(Paragraph("CREDIT REPAIR SERVICE AGREEMENT", title_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph(f"Date: {date_str}", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=2, color=HexColor('#1a365d'), spaceAfter=12))

    elements.append(Paragraph(
        f'This Credit Repair Service Agreement ("Agreement") is entered into between <b>Credlocity Business Group LLC</b> '
        f'("Company"), and <b>{full_name}</b> ("Client"), effective as of the date of electronic signature below.',
        body_style
    ))

    # Section 1 — Services
    elements.append(Paragraph("1. SERVICES PROVIDED", heading_style))
    elements.append(Paragraph(
        "The Company agrees to provide credit repair services including, but not limited to: review of consumer "
        "credit reports, identification of potentially inaccurate, incomplete, unverifiable, or misleading information, "
        "preparation and submission of dispute correspondence to credit bureaus (Equifax, Experian, TransUnion) and/or "
        "data furnishers, and ongoing monitoring of dispute results on Client's behalf.",
        body_style
    ))

    # Section 2 — Free Trial Terms
    elements.append(Paragraph("2. FREE TRIAL TERMS — $0.00 PER MONTH FOR 30 DAYS (FREE TRIAL FOR CREDIT REPAIR ONLY)", heading_style))
    elements.append(Paragraph(
        'This agreement establishes a <b>conditional client relationship at no cost ($0.00 per month for 30 days)</b> '
        'during the trial period. This free trial is for credit repair services only. '
        'The Client will not be charged any fees — including setup fees, enrollment fees, advance fees, or '
        'first-work fees — until such time as the Client voluntarily elects to become a paying client after '
        'consultation with the Company. <b>No payment is required, collected, or expected at any point during the '
        'free trial period.</b>',
        body_style
    ))

    # Section 3 — TSR
    elements.append(Paragraph("3. TELEMARKETING SALES RULE (TSR) DISCLOSURE", heading_style))
    elements.append(Paragraph(
        'The Client understands and acknowledges that under the <b>Telemarketing Sales Rule (TSR), 16 CFR Part 310, '
        '§310.4(a)(2)</b>, it is unlawful for a credit repair company to request or receive payment for credit repair '
        'services sold via telemarketing before such services are fully performed. Furthermore, the TSR prohibits '
        'credit repair companies from engaging in substantive discussions about a consumer\'s credit repair needs '
        'via telephone without a written service agreement in place.',
        body_style
    ))
    elements.append(Paragraph(
        '<b>By signing this agreement, the Client acknowledges that because of the Telemarketing Sales Rule, '
        'Credlocity cannot under any circumstances discuss credit repair services with the Client over the phone '
        'without this signed agreement. This agreement is the only legal mechanism by which the Company and Client '
        'may communicate about credit repair services.</b>',
        body_style
    ))

    # Section 4 — CROA Cancellation
    elements.append(Paragraph("4. YOUR RIGHT TO CANCEL — CROA §1679e", heading_style))
    elements.append(Paragraph(
        '<b>YOU MAY CANCEL THIS CONTRACT WITHOUT PENALTY OR OBLIGATION AT ANY TIME BEFORE MIDNIGHT OF THE '
        '3RD BUSINESS DAY AFTER THE DATE ON WHICH YOU SIGNED THIS CONTRACT.</b>',
        bold_body
    ))
    elements.append(Paragraph(
        'If you cancel this contract, the Company will return to you any money you paid within five (5) business days '
        'of receiving your cancellation notice. To cancel, send written notice to: Credlocity Business Group LLC, '
        'or email support@credlocity.com.',
        body_style
    ))
    elements.append(Paragraph(
        'Additionally, beyond the 3-day CROA cancellation period, Credlocity allows cancellation at any time with '
        'no penalty, no cancellation fees, and no hidden obligations. This agreement is entirely non-binding beyond '
        'the free trial terms described herein.',
        body_style
    ))

    # Section 5 — CROA Consumer Rights
    elements.append(Paragraph("5. CROA CONSUMER RIGHTS DISCLOSURE — 15 U.S.C. §1679c", heading_style))
    elements.append(Paragraph("As required by the Credit Repair Organizations Act, you are informed of the following rights:", body_style))
    rights = [
        "You have the right to dispute inaccurate information in your credit report by contacting the credit bureau directly.",
        "Nothing in this agreement prevents you from contacting or communicating directly with any credit bureau.",
        "You have the right to obtain a copy of your credit report from each credit bureau once every 12 months at no charge (AnnualCreditReport.com).",
        "No one can lawfully remove accurate, current, and verifiable information from your credit report.",
        "You have the right to sue a credit repair organization that violates the CROA.",
    ]
    for r in rights:
        elements.append(Paragraph(f"• {r}", body_style))

    # Section 6 — Superseding Agreement
    elements.append(Paragraph("6. SUPERSEDING AGREEMENT", heading_style))
    elements.append(Paragraph(
        'The Client understands and agrees that upon electing to become a paying client, the Client will be '
        'required to sign a new service agreement as part of the onboarding process. <b>That new agreement shall '
        'supersede this agreement in its entirety, and the terms of the new agreement shall be the controlling '
        'agreement between the Company and Client.</b> This free trial agreement shall have no further force or '
        'effect once the superseding agreement is executed.',
        body_style
    ))

    # Section 7 — Company Info
    elements.append(Paragraph("7. COMPANY INFORMATION", heading_style))
    elements.append(Paragraph(
        '<b>Credlocity Business Group LLC</b><br/>'
        'Website: www.credlocity.com<br/>'
        'Email: support@credlocity.com<br/>'
        'Established: 2008 | BBB Rating: A+ | Zero Complaints',
        body_style
    ))

    elements.append(Spacer(1, 20))
    elements.append(HRFlowable(width="100%", thickness=2, color=HexColor('#1a365d'), spaceAfter=12))

    # Client Information Table
    elements.append(Paragraph("CLIENT INFORMATION", heading_style))
    client_data = [
        ["Full Name:", full_name, "Email:", lead.get("email", "")],
        ["Phone:", lead.get("phone", ""), "Address:", lead.get("address", "")],
        ["City:", lead.get("city", ""), "State:", lead.get("state", "")],
        ["Zip Code:", lead.get("zip_code", ""), "Lead Type:", lead.get("lead_type", "").replace("_", " ").title()],
    ]
    t = Table(client_data, colWidths=[70, 170, 70, 170])
    t.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (0, -1), HexColor('#4a5568')),
        ('TEXTCOLOR', (2, 0), (2, -1), HexColor('#4a5568')),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t)

    elements.append(Spacer(1, 20))
    elements.append(HRFlowable(width="100%", thickness=1, color=HexColor('#cbd5e0'), spaceAfter=12))

    # Electronic Signature Block
    elements.append(Paragraph("ELECTRONIC SIGNATURE", heading_style))
    elements.append(Paragraph(
        'By typing my full name below, I am electronically signing this service agreement and acknowledge that '
        'I have read and agree to all terms above, including the TSR and CROA disclosures.',
        body_style
    ))
    elements.append(Spacer(1, 8))
    elements.append(Paragraph(f"Signature: ", small_style))
    elements.append(Paragraph(lead.get("signed_name", ""), sig_style))
    elements.append(Spacer(1, 8))

    sig_data = [
        ["Date of Signature:", date_str],
        ["Time of Signature:", time_str],
        ["IP Address:", ip_addr],
        ["Agreement ID:", lead.get("id", "N/A")],
    ]
    st = Table(sig_data, colWidths=[120, 360])
    st.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8.5),
        ('TEXTCOLOR', (0, 0), (-1, -1), HexColor('#4a5568')),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(st)

    elements.append(Spacer(1, 12))
    elements.append(Paragraph(
        'This electronic signature is legally binding under the Electronic Signatures in Global and National Commerce Act (E-SIGN Act) '
        'and the Uniform Electronic Transactions Act (UETA).',
        small_style
    ))

    doc.build(elements)
    return buf.getvalue()


@leads_router.post("")
async def create_lead(data: dict, request: Request):
    """Public: Create a new lead from the service agreement form"""
    required = ["first_name", "last_name", "email", "phone", "address", "city", "state", "zip_code", "signed_name", "lead_type"]
    missing = [f for f in required if not data.get(f, "").strip()]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required fields: {', '.join(missing)}")

    lead_type = data["lead_type"]
    if lead_type not in ("free_trial", "consultation"):
        raise HTTPException(status_code=400, detail="lead_type must be 'free_trial' or 'consultation'")

    # Capture IP address
    ip_address = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
    if "," in ip_address:
        ip_address = ip_address.split(",")[0].strip()

    existing = await db.leads.find_one({"email": data["email"].strip().lower(), "status": {"$nin": ["lost", "cancelled"]}})

    now = datetime.now(timezone.utc).isoformat()
    lead = {
        "id": str(uuid.uuid4()),
        "first_name": data["first_name"].strip(),
        "last_name": data["last_name"].strip(),
        "email": data["email"].strip().lower(),
        "phone": data["phone"].strip(),
        "address": data["address"].strip(),
        "city": data["city"].strip(),
        "state": data["state"].strip(),
        "zip_code": data["zip_code"].strip(),
        "lead_type": lead_type,
        "signed_name": data["signed_name"].strip(),
        "agreement_signed": True,
        "signed_at": now,
        "ip_address": ip_address,
        "status": "new",
        "notes": "",
        "created_at": now,
        "updated_at": now,
        "is_duplicate": existing is not None,
    }

    # Generate and store the signed agreement PDF as base64
    pdf_bytes = generate_agreement_pdf(lead)
    lead["agreement_pdf_base64"] = base64.b64encode(pdf_bytes).decode("utf-8")

    await db.leads.insert_one(lead)

    return {
        "id": lead["id"],
        "message": "Lead captured successfully",
        "lead_type": lead_type,
        "redirect_url": "https://calendly.com/credlocity/oneonone" if lead_type == "consultation" else None,
        "credit_report_url": "https://credlocity.scorexer.com/scorefusion/scorefusion-signup.jsp?code=50a153cc-c" if lead_type == "free_trial" else None,
    }


@leads_router.get("")
async def get_leads(status: Optional[str] = None, lead_type: Optional[str] = None):
    """Admin: Get all leads with optional filters"""
    query = {}
    if status:
        query["status"] = status
    if lead_type:
        query["lead_type"] = lead_type

    leads = await db.leads.find(query, {"_id": 0, "agreement_pdf_base64": 0}).sort("created_at", -1).to_list(5000)
    return leads


@leads_router.get("/stats")
async def get_lead_stats():
    """Admin: Get lead statistics"""
    total = await db.leads.count_documents({})
    new_count = await db.leads.count_documents({"status": "new"})
    contacted = await db.leads.count_documents({"status": "contacted"})
    converted = await db.leads.count_documents({"status": "converted"})
    lost = await db.leads.count_documents({"status": "lost"})
    free_trial = await db.leads.count_documents({"lead_type": "free_trial"})
    consultation = await db.leads.count_documents({"lead_type": "consultation"})

    return {
        "total": total,
        "new": new_count,
        "contacted": contacted,
        "converted": converted,
        "lost": lost,
        "free_trial": free_trial,
        "consultation": consultation,
    }


@leads_router.get("/{lead_id}")
async def get_lead(lead_id: str):
    """Admin: Get a specific lead (without the large PDF blob)"""
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0, "agreement_pdf_base64": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    # Tell frontend whether a PDF exists
    full = await db.leads.find_one({"id": lead_id}, {"agreement_pdf_base64": 1})
    lead["has_agreement_pdf"] = bool(full and full.get("agreement_pdf_base64"))
    return lead


@leads_router.get("/{lead_id}/agreement-pdf")
async def download_agreement_pdf(lead_id: str):
    """Download the signed service agreement PDF for a lead"""
    lead = await db.leads.find_one({"id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    pdf_b64 = lead.get("agreement_pdf_base64")
    if not pdf_b64:
        # Generate on-the-fly if missing
        pdf_bytes = generate_agreement_pdf(lead)
    else:
        pdf_bytes = base64.b64decode(pdf_b64)

    name = f"{lead['first_name']}_{lead['last_name']}".replace(" ", "_")
    filename = f"Credlocity_Service_Agreement_{name}.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@leads_router.put("/{lead_id}")
async def update_lead(lead_id: str, data: dict):
    """Admin: Update lead status and notes"""
    lead = await db.leads.find_one({"id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    update_fields = {}
    if "status" in data:
        if data["status"] not in ("new", "contacted", "converted", "lost", "cancelled"):
            raise HTTPException(status_code=400, detail="Invalid status")
        update_fields["status"] = data["status"]
    if "notes" in data:
        update_fields["notes"] = data["notes"]

    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()

    await db.leads.update_one({"id": lead_id}, {"$set": update_fields})
    updated = await db.leads.find_one({"id": lead_id}, {"_id": 0, "agreement_pdf_base64": 0})
    return updated


@leads_router.delete("/{lead_id}")
async def delete_lead(lead_id: str):
    """Admin: Delete a lead"""
    result = await db.leads.delete_one({"id": lead_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead deleted"}
