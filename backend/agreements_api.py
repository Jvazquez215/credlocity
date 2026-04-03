"""
PDF Agreement Generation API
Template-based system: Admins create agreement templates with placeholders,
attorneys fill in client details to generate PDFs.
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel
import uuid
import io
import re

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.colors import HexColor

agreements_router = APIRouter(prefix="/api/agreements", tags=["Agreements"])

db_instance: AsyncIOMotorDatabase = None

def set_db(database):
    global db_instance
    db_instance = database

def get_db():
    return db_instance


# ── Models ──

class TemplateField(BaseModel):
    key: str  # e.g. "client_name"
    label: str  # e.g. "Client Full Name"
    field_type: str = "text"  # text, date, number, textarea, select
    required: bool = True
    default_value: str = ""
    options: List[str] = []  # for select type
    placeholder: str = ""


class TemplateCreate(BaseModel):
    name: str
    description: str = ""
    category: str = "General"
    content: str  # Template body with {{placeholder}} markers
    fields: List[TemplateField] = []
    is_active: bool = True


class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    content: Optional[str] = None
    fields: Optional[List[TemplateField]] = None
    is_active: Optional[bool] = None


class GeneratePDFRequest(BaseModel):
    template_id: str
    field_values: dict  # {"client_name": "John Doe", "date": "2026-03-20", ...}


# ── Admin: Create template ──
@agreements_router.post("/templates")
async def create_template(data: TemplateCreate):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    # Auto-detect fields from {{placeholders}} in content
    detected = re.findall(r'\{\{(\w+)\}\}', data.content)
    existing_keys = {f.key for f in data.fields}
    for key in detected:
        if key not in existing_keys:
            label = key.replace('_', ' ').title()
            data.fields.append(TemplateField(key=key, label=label))

    doc = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "description": data.description,
        "category": data.category,
        "content": data.content,
        "fields": [f.dict() for f in data.fields],
        "is_active": data.is_active,
        "generated_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.agreement_templates.insert_one(doc)
    doc.pop("_id", None)
    return doc


# ── Admin: List all templates ──
@agreements_router.get("/templates")
async def list_templates():
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    templates = await db.agreement_templates.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return templates


# ── Admin: Get single template ──
@agreements_router.get("/templates/{template_id}")
async def get_template(template_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    template = await db.agreement_templates.find_one({"id": template_id}, {"_id": 0})
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


# ── Admin: Update template ──
@agreements_router.put("/templates/{template_id}")
async def update_template(template_id: str, data: TemplateUpdate):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    update = {"updated_at": datetime.now(timezone.utc).isoformat()}
    for field, value in data.dict(exclude_unset=True).items():
        if value is not None:
            if field == "fields":
                update["fields"] = [f.dict() if hasattr(f, 'dict') else f for f in value]
            else:
                update[field] = value

    # Re-detect fields if content changed
    if "content" in update:
        detected = re.findall(r'\{\{(\w+)\}\}', update["content"])
        existing_fields = update.get("fields") or (await db.agreement_templates.find_one({"id": template_id}, {"_id": 0})).get("fields", [])
        existing_keys = {f["key"] for f in existing_fields}
        for key in detected:
            if key not in existing_keys:
                existing_fields.append({"key": key, "label": key.replace('_', ' ').title(), "field_type": "text", "required": True, "default_value": "", "options": [], "placeholder": ""})
        update["fields"] = existing_fields

    result = await db.agreement_templates.update_one({"id": template_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Template not found")

    updated = await db.agreement_templates.find_one({"id": template_id}, {"_id": 0})
    return updated


# ── Admin: Delete template ──
@agreements_router.delete("/templates/{template_id}")
async def delete_template(template_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    result = await db.agreement_templates.delete_one({"id": template_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Template not found")
    return {"message": "Template deleted"}


# ── Generate PDF ──
@agreements_router.post("/generate")
async def generate_pdf(data: GeneratePDFRequest):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    template = await db.agreement_templates.find_one({"id": data.template_id}, {"_id": 0})
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # Replace placeholders
    content = template["content"]
    for key, value in data.field_values.items():
        content = content.replace(f"{{{{{key}}}}}", str(value))

    # Check for unfilled required fields
    remaining = re.findall(r'\{\{(\w+)\}\}', content)
    required_fields = {f["key"] for f in template.get("fields", []) if f.get("required")}
    missing = [k for k in remaining if k in required_fields]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required fields: {', '.join(missing)}")

    # Replace any remaining unfilled optional placeholders with blanks
    content = re.sub(r'\{\{\w+\}\}', '________________', content)

    # Generate PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.75 * inch, bottomMargin=0.75 * inch, leftMargin=1 * inch, rightMargin=1 * inch)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('AgreementTitle', parent=styles['Title'], fontSize=16, spaceAfter=6, textColor=HexColor('#1a365d'), fontName='Helvetica-Bold')
    subtitle_style = ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=10, spaceAfter=12, textColor=HexColor('#4a5568'), alignment=TA_CENTER)
    body_style = ParagraphStyle('AgreementBody', parent=styles['Normal'], fontSize=10, leading=14, spaceAfter=8, alignment=TA_JUSTIFY)
    heading_style = ParagraphStyle('SectionHeading', parent=styles['Heading2'], fontSize=12, spaceAfter=6, spaceBefore=12, textColor=HexColor('#1a365d'), fontName='Helvetica-Bold')
    signature_style = ParagraphStyle('Signature', parent=styles['Normal'], fontSize=10, leading=18, spaceAfter=4)

    story = []

    # Header
    story.append(Paragraph("CREDLOCITY BUSINESS GROUP LLC", title_style))
    story.append(Paragraph(template["name"], subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=HexColor('#1a365d'), spaceAfter=12))

    # Metadata
    gen_date = datetime.now(timezone.utc).strftime("%B %d, %Y")
    story.append(Paragraph(f"<b>Date Generated:</b> {gen_date}", body_style))
    if data.field_values.get("client_name"):
        story.append(Paragraph(f"<b>Client:</b> {data.field_values['client_name']}", body_style))
    if data.field_values.get("attorney_name"):
        story.append(Paragraph(f"<b>Attorney:</b> {data.field_values['attorney_name']}", body_style))
    story.append(Spacer(1, 12))

    # Parse content into sections
    lines = content.split('\n')
    for line in lines:
        stripped = line.strip()
        if not stripped:
            story.append(Spacer(1, 6))
        elif stripped.startswith('## '):
            story.append(Paragraph(stripped[3:], heading_style))
        elif stripped.startswith('# '):
            story.append(Paragraph(stripped[2:], title_style))
        elif stripped.startswith('SIGNATURE:') or stripped.startswith('___'):
            story.append(Spacer(1, 20))
            story.append(Paragraph(stripped, signature_style))
        else:
            # Escape HTML special chars but preserve basic formatting
            safe = stripped.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            story.append(Paragraph(safe, body_style))

    # Footer
    story.append(Spacer(1, 30))
    story.append(HRFlowable(width="100%", thickness=0.5, color=HexColor('#cbd5e0'), spaceAfter=6))
    footer_style = ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=HexColor('#718096'), alignment=TA_CENTER)
    story.append(Paragraph("Credlocity Business Group LLC | 1500 Chestnut St, Suite 2, Philadelphia, PA 19102", footer_style))
    story.append(Paragraph(f"Generated on {gen_date} | This document is confidential", footer_style))

    doc.build(story)
    buffer.seek(0)

    # Increment generated count
    await db.agreement_templates.update_one({"id": data.template_id}, {"$inc": {"generated_count": 1}})

    # Log generation
    log_doc = {
        "id": str(uuid.uuid4()),
        "template_id": data.template_id,
        "template_name": template["name"],
        "field_values": {k: v for k, v in data.field_values.items() if k not in ("ssn", "social_security")},
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.agreement_logs.insert_one(log_doc)

    filename = f"{template['name'].replace(' ', '_')}_{gen_date.replace(' ', '_')}.pdf"

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# ── Get generation history ──
@agreements_router.get("/history")
async def get_generation_history():
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    logs = await db.agreement_logs.find({}, {"_id": 0}).sort("generated_at", -1).to_list(100)
    return logs


# ── Seed default templates ──
@agreements_router.post("/templates/seed")
async def seed_templates():
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    DEFAULT_TEMPLATES = [
        {
            "name": "Attorney-Client Credit Repair Agreement",
            "description": "Standard agreement between Credlocity's attorney partner and a credit repair client. Covers scope of services, fees, timeline, and client obligations.",
            "category": "Attorney Partner",
            "content": """## ATTORNEY-CLIENT CREDIT REPAIR AGREEMENT

This Credit Repair Services Agreement ("Agreement") is entered into as of {{agreement_date}} by and between:

**Attorney:** {{attorney_name}}, Esq.
Bar Number: {{bar_number}}
Firm: {{firm_name}}
Address: {{firm_address}}

**Client:** {{client_name}}
Address: {{client_address}}
Email: {{client_email}}
Date of Birth: {{client_dob}}

## 1. SCOPE OF SERVICES

The Attorney agrees to provide the following credit repair and consumer advocacy services on behalf of the Client:

a) Review and analysis of Client's credit reports from Equifax, Experian, and TransUnion
b) Identification of inaccurate, misleading, incomplete, or unverifiable information
c) Preparation and submission of dispute letters under FCRA Section 611
d) Debt validation requests under FDCPA Section 809(b)
e) Direct creditor disputes and Method of Verification challenges
f) FCRA Section 605B identity theft disputes (if applicable)
g) Monitoring of dispute results and follow-up correspondence
h) Legal representation in FCRA/FDCPA litigation if violations are identified

## 2. CLIENT OBLIGATIONS

The Client agrees to:

a) Provide accurate and complete personal information
b) Maintain active credit monitoring through ScoreFusion ($49.95/month, paid to ScoreFusion)
c) Complete a notarized Limited Power of Attorney through NotaryFox ($39.95 one-time, paid to NotaryFox)
d) Respond promptly to requests for additional information
e) Not open new credit accounts without consulting the Attorney
f) Not make late payments during the credit repair process

## 3. FEES AND PAYMENT

a) 30-Day Free Trial: No service fees are charged during the first 30 calendar days.
b) Monthly Service Fee: After the free trial period, the Client agrees to pay ${{monthly_fee}} per month for credit repair services.
c) Third-Party Costs: ScoreFusion monitoring ($49.95/mo) and NotaryFox e-notary ($39.95 one-time) are paid directly to those providers, not to the Attorney or Credlocity.
d) Payment is due on the {{payment_day}} of each month.

## 4. TERM AND CANCELLATION

a) This Agreement begins on the date first written above and continues on a month-to-month basis.
b) Either party may terminate this Agreement with 30 days written notice.
c) The Client has the right to cancel this Agreement within 3 business days of signing without penalty, as required by the Credit Repair Organizations Act (CROA).
d) Average client duration is 3-7 months.

## 5. NO GUARANTEES

The Attorney makes no guarantees regarding specific credit score improvements or removal of specific items. Results vary based on individual circumstances. The Attorney guarantees only that all work will be performed in compliance with applicable federal and state consumer protection laws.

## 6. GOVERNING LAW

This Agreement shall be governed by the laws of the State of {{governing_state}} and applicable federal law, including the FCRA, FDCPA, CROA, and TSR.

## SIGNATURES

Client Signature: ___________________________

Client Name (Printed): {{client_name}}

Date: {{agreement_date}}


Attorney Signature: ___________________________

Attorney Name (Printed): {{attorney_name}}, Esq.

Date: {{agreement_date}}""",
            "fields": [
                {"key": "agreement_date", "label": "Agreement Date", "field_type": "date", "required": True, "default_value": "", "options": [], "placeholder": "YYYY-MM-DD"},
                {"key": "attorney_name", "label": "Attorney Full Name", "field_type": "text", "required": True, "default_value": "", "options": [], "placeholder": "e.g., John Smith"},
                {"key": "bar_number", "label": "Bar Number", "field_type": "text", "required": True, "default_value": "", "options": [], "placeholder": ""},
                {"key": "firm_name", "label": "Law Firm Name", "field_type": "text", "required": True, "default_value": "", "options": [], "placeholder": ""},
                {"key": "firm_address", "label": "Firm Address", "field_type": "text", "required": True, "default_value": "", "options": [], "placeholder": ""},
                {"key": "client_name", "label": "Client Full Name", "field_type": "text", "required": True, "default_value": "", "options": [], "placeholder": ""},
                {"key": "client_address", "label": "Client Address", "field_type": "text", "required": True, "default_value": "", "options": [], "placeholder": ""},
                {"key": "client_email", "label": "Client Email", "field_type": "text", "required": True, "default_value": "", "options": [], "placeholder": ""},
                {"key": "client_dob", "label": "Client Date of Birth", "field_type": "date", "required": True, "default_value": "", "options": [], "placeholder": ""},
                {"key": "monthly_fee", "label": "Monthly Service Fee ($)", "field_type": "number", "required": True, "default_value": "99.95", "options": [], "placeholder": "99.95"},
                {"key": "payment_day", "label": "Payment Due Day", "field_type": "text", "required": True, "default_value": "1st", "options": [], "placeholder": "1st"},
                {"key": "governing_state", "label": "Governing State", "field_type": "text", "required": True, "default_value": "Pennsylvania", "options": [], "placeholder": ""},
            ]
        },
        {
            "name": "FCRA Litigation Retainer Agreement",
            "description": "Retainer agreement for FCRA violation litigation. Used when credit bureaus or furnishers fail to comply with dispute requirements.",
            "category": "Attorney Partner",
            "content": """## FCRA LITIGATION RETAINER AGREEMENT

This Retainer Agreement ("Agreement") is entered into as of {{agreement_date}}.

**Attorney:** {{attorney_name}}, Esq.
Bar Number: {{bar_number}}
Firm: {{firm_name}}

**Client:** {{client_name}}
Address: {{client_address}}

## 1. PURPOSE

The Client retains the Attorney to represent them in litigation arising from violations of the Fair Credit Reporting Act (15 U.S.C. Section 1681 et seq.) and/or the Fair Debt Collection Practices Act (15 U.S.C. Section 1692 et seq.).

## 2. IDENTIFIED VIOLATIONS

The following potential violations have been identified:

Defendant(s): {{defendant_names}}
Nature of Violation(s): {{violation_description}}
Bureau(s) Involved: {{bureaus_involved}}

## 3. FEE ARRANGEMENT

This engagement is on a {{fee_type}} basis:

a) No upfront attorney fees are required from the Client.
b) The Attorney's fees shall be recovered from the defendant(s) as provided under FCRA Section 1681n (willful violations: $100-$1,000 per violation plus attorney's fees) or Section 1681o (negligent violations: actual damages plus attorney's fees).
c) In the event of a settlement, the Attorney shall receive {{contingency_pct}}% of the total recovery.

## 4. CLIENT COOPERATION

The Client agrees to provide all requested documentation, respond to discovery requests, and make themselves available for depositions and trial as needed.

## 5. SCOPE

This Agreement covers only the FCRA/FDCPA litigation described above. Any additional legal matters require a separate agreement.

## SIGNATURES

Client: ___________________________ Date: {{agreement_date}}
{{client_name}}

Attorney: ___________________________ Date: {{agreement_date}}
{{attorney_name}}, Esq.""",
            "fields": [
                {"key": "agreement_date", "label": "Agreement Date", "field_type": "date", "required": True, "default_value": "", "options": [], "placeholder": ""},
                {"key": "attorney_name", "label": "Attorney Name", "field_type": "text", "required": True, "default_value": "", "options": [], "placeholder": ""},
                {"key": "bar_number", "label": "Bar Number", "field_type": "text", "required": True, "default_value": "", "options": [], "placeholder": ""},
                {"key": "firm_name", "label": "Law Firm", "field_type": "text", "required": True, "default_value": "", "options": [], "placeholder": ""},
                {"key": "client_name", "label": "Client Name", "field_type": "text", "required": True, "default_value": "", "options": [], "placeholder": ""},
                {"key": "client_address", "label": "Client Address", "field_type": "text", "required": True, "default_value": "", "options": [], "placeholder": ""},
                {"key": "defendant_names", "label": "Defendant(s)", "field_type": "text", "required": True, "default_value": "", "options": [], "placeholder": "e.g., Equifax, TransUnion"},
                {"key": "violation_description", "label": "Violation Description", "field_type": "textarea", "required": True, "default_value": "", "options": [], "placeholder": "Describe the FCRA/FDCPA violations"},
                {"key": "bureaus_involved", "label": "Bureau(s) Involved", "field_type": "text", "required": True, "default_value": "", "options": [], "placeholder": "Equifax, Experian, TransUnion"},
                {"key": "fee_type", "label": "Fee Type", "field_type": "text", "required": True, "default_value": "contingency", "options": [], "placeholder": "contingency"},
                {"key": "contingency_pct", "label": "Contingency %", "field_type": "number", "required": True, "default_value": "33", "options": [], "placeholder": "33"},
            ]
        }
    ]

    seeded = 0
    for tpl in DEFAULT_TEMPLATES:
        existing = await db.agreement_templates.find_one({"name": tpl["name"]})
        if existing:
            continue
        doc = {
            "id": str(uuid.uuid4()),
            **tpl,
            "is_active": True,
            "generated_count": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.agreement_templates.insert_one(doc)
        seeded += 1

    return {"seeded": seeded, "total": len(DEFAULT_TEMPLATES)}
