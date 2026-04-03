"""
Complaint Letter Generator — Pre-filled complaint letters for CFPB, FTC, and State Attorney General.
Used by the Scam Checker tool when red flags are detected.
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from datetime import datetime, timezone
import uuid
import io

complaint_letters_router = APIRouter(prefix="/api/complaint-letters", tags=["Complaint Letters"])
db = None


def set_db(database):
    global db
    db = database


AGENCIES = {
    "cfpb": {
        "name": "Consumer Financial Protection Bureau (CFPB)",
        "address": "Consumer Financial Protection Bureau\n1700 G Street NW\nWashington, DC 20552",
        "online_url": "https://www.consumerfinance.gov/complaint/",
        "phone": "(855) 411-2372",
        "description": "The CFPB is the primary federal agency responsible for enforcing consumer financial protection laws, including the Credit Repair Organizations Act (CROA). Filing a complaint with the CFPB creates an official record and triggers a mandatory company response within 15 days.",
    },
    "ftc": {
        "name": "Federal Trade Commission (FTC)",
        "address": "Federal Trade Commission\nConsumer Response Center\n600 Pennsylvania Avenue NW\nWashington, DC 20580",
        "online_url": "https://reportfraud.ftc.gov/",
        "phone": "(877) 382-4357",
        "description": "The FTC enforces the Telemarketing Sales Rule (TSR) and the FTC Act. They investigate patterns of fraud and can take legal action against companies with multiple complaints. While the FTC doesn't resolve individual complaints, your report helps build cases against scam companies.",
    },
    "attorney_general": {
        "name": "State Attorney General",
        "address": "[Your State] Office of the Attorney General\nConsumer Protection Division",
        "online_url": "https://www.naag.org/find-my-ag/",
        "phone": "Search at naag.org/find-my-ag",
        "description": "Your State Attorney General's Consumer Protection Division investigates and prosecutes fraudulent business practices at the state level. State AGs can issue cease and desist orders, file lawsuits, and seek restitution for consumers. Many states have additional consumer protection laws beyond federal requirements.",
    }
}


US_STATES_FULL = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
    'DC': 'District of Columbia'
}


@complaint_letters_router.get("/agencies")
async def get_agencies():
    """Public: List all complaint agencies with details"""
    return AGENCIES


@complaint_letters_router.post("/generate")
async def generate_complaint_letter(data: dict):
    """Generate a pre-filled complaint letter PDF for the selected agency"""
    agency_key = data.get("agency", "cfpb")
    if agency_key not in AGENCIES:
        raise HTTPException(status_code=400, detail=f"Invalid agency. Must be one of: {', '.join(AGENCIES.keys())}")

    # Required fields
    required = ["first_name", "last_name", "address", "city", "state", "zip_code", "email"]
    missing = [f for f in required if not data.get(f, "").strip()]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required fields: {', '.join(missing)}")

    violations = data.get("violations", [])
    if not violations:
        raise HTTPException(status_code=400, detail="At least one violation must be reported")

    agency = AGENCIES[agency_key]
    current_date = datetime.now().strftime("%B %d, %Y")
    company_name = data.get("company_name", "the credit repair company")
    state_full = US_STATES_FULL.get(data.get("state", ""), data.get("state", ""))

    # Build violations text
    violations_text = ""
    for i, v in enumerate(violations, 1):
        violations_text += f"\n{i}. {v.get('title', 'Violation')}\n"
        violations_text += f"   Law Violated: {v.get('law', 'N/A')}\n"
        violations_text += f"   Evidence: \"{v.get('matched_text', 'N/A')}\"\n"
        violations_text += f"   Description: {v.get('description', '')}\n"

    # Build the letter body based on agency
    if agency_key == "cfpb":
        body = f"""Dear Consumer Financial Protection Bureau,

I am writing to file a formal complaint against {company_name} for violations of federal consumer protection laws, specifically the Credit Repair Organizations Act (CROA) and the Telemarketing Sales Rule (TSR).

COMPLAINANT INFORMATION:
Name: {data['first_name']} {data['last_name']}
Address: {data['address']}, {data['city']}, {data['state']} {data['zip_code']}
Email: {data['email']}
Phone: {data.get('phone', 'N/A')}

COMPANY BEING REPORTED:
Company Name: {company_name}
{f"Company Website: {data.get('company_website', '')}" if data.get('company_website') else ""}
{f"Contact Person: {data.get('company_contact', '')}" if data.get('company_contact') else ""}

VIOLATIONS DETECTED:
{violations_text}

DESCRIPTION OF EVENTS:
{data.get('description_of_events', 'The above violations were identified through analysis of communications received from this company, including emails, advertisements, and/or contractual materials.')}

{f"AMOUNT PAID: ${data.get('amount_paid', 'N/A')}" if data.get('amount_paid') else ""}

I am requesting that the CFPB investigate this company for the violations listed above and take appropriate enforcement action. I also request that the company be required to provide a full refund of any fees collected in violation of the TSR and CROA.

I understand that the CFPB will forward this complaint to the company and require a response within 15 days. I am prepared to provide additional documentation upon request.

Thank you for your attention to this matter.

Sincerely,

[Your Signature]
{data['first_name']} {data['last_name']}

Date: {current_date}"""

    elif agency_key == "ftc":
        body = f"""Dear Federal Trade Commission,

I am filing this complaint to report suspected violations of the Telemarketing Sales Rule (TSR), the FTC Act Section 5, and related federal consumer protection laws by {company_name}.

COMPLAINANT INFORMATION:
Name: {data['first_name']} {data['last_name']}
Address: {data['address']}, {data['city']}, {data['state']} {data['zip_code']}
Email: {data['email']}
Phone: {data.get('phone', 'N/A')}

COMPANY BEING REPORTED:
Company Name: {company_name}
{f"Company Website: {data.get('company_website', '')}" if data.get('company_website') else ""}

VIOLATIONS IDENTIFIED:
{violations_text}

DESCRIPTION OF EVENTS:
{data.get('description_of_events', 'The above violations were identified through analysis of communications received from this company. The company appears to be engaging in deceptive and/or illegal credit repair practices.')}

{f"FINANCIAL LOSS: ${data.get('amount_paid', 'N/A')}" if data.get('amount_paid') else ""}

I believe this company is engaged in a pattern of fraudulent and deceptive practices targeting consumers seeking credit repair services. I am requesting that the FTC investigate this company and take appropriate legal action to protect consumers.

I understand that the FTC does not resolve individual complaints but uses them to detect patterns of fraud. I am filing this report to contribute to the FTC's database and help protect other consumers from these illegal practices.

Thank you for your attention to this matter.

Sincerely,

[Your Signature]
{data['first_name']} {data['last_name']}

Date: {current_date}"""

    else:  # attorney_general
        body = f"""Dear Attorney General of {state_full},
Consumer Protection Division,

I am writing to file a formal complaint against {company_name} for violations of federal and state consumer protection laws related to credit repair services.

COMPLAINANT INFORMATION:
Name: {data['first_name']} {data['last_name']}
Address: {data['address']}, {data['city']}, {data['state']} {data['zip_code']}
Email: {data['email']}
Phone: {data.get('phone', 'N/A')}

COMPANY BEING REPORTED:
Company Name: {company_name}
{f"Company Website: {data.get('company_website', '')}" if data.get('company_website') else ""}

FEDERAL VIOLATIONS IDENTIFIED:
{violations_text}

DESCRIPTION OF EVENTS:
{data.get('description_of_events', 'The above violations were identified through analysis of communications received from this company. I believe this company is operating in violation of both federal consumer protection laws (CROA, TSR, FTC Act) and state consumer protection statutes.')}

{f"FINANCIAL LOSS: ${data.get('amount_paid', 'N/A')}" if data.get('amount_paid') else ""}

I am requesting that your office investigate this company for the violations listed above. Specifically, I am requesting:

1. An investigation into the company's business practices
2. Enforcement of applicable state consumer protection laws
3. Recovery of any fees collected illegally from consumers
4. Injunctive relief to prevent future violations

I am prepared to provide additional documentation, including copies of communications, contracts, and payment records upon request.

Thank you for protecting the consumers of {state_full}.

Sincerely,

[Your Signature]
{data['first_name']} {data['last_name']}

Date: {current_date}"""

    # Generate PDF
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from reportlab.lib.units import inch

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                            leftMargin=1*inch, rightMargin=1*inch,
                            topMargin=0.8*inch, bottomMargin=0.8*inch)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('ComplaintTitle', parent=styles['Heading1'], fontSize=13, spaceAfter=12)
    body_style = ParagraphStyle('ComplaintBody', parent=styles['Normal'], fontSize=10.5, leading=15, spaceAfter=3)
    small_style = ParagraphStyle('Small', parent=styles['Normal'], fontSize=9, leading=12, textColor='#666666')
    header_style = ParagraphStyle('Header', parent=styles['Normal'], fontSize=10, leading=13)

    story = []

    # Header
    story.append(Paragraph(f"FORMAL COMPLAINT — {agency['name'].upper()}", title_style))
    story.append(Spacer(1, 0.1*inch))

    # Sender info
    sender = f"{data['first_name']} {data['last_name']}<br/>"
    sender += f"{data['address']}<br/>"
    sender += f"{data['city']}, {data['state']} {data['zip_code']}<br/>"
    sender += f"Email: {data['email']}"
    if data.get('phone'):
        sender += f"<br/>Phone: {data['phone']}"
    story.append(Paragraph(sender, header_style))
    story.append(Spacer(1, 0.15*inch))

    # Date
    story.append(Paragraph(current_date, body_style))
    story.append(Spacer(1, 0.1*inch))

    # Recipient
    story.append(Paragraph(agency['address'].replace('\n', '<br/>'), body_style))
    story.append(Spacer(1, 0.2*inch))

    # Body
    for para in body.split('\n\n'):
        para = para.strip()
        if not para:
            continue
        para_html = para.replace('\n', '<br/>')
        story.append(Paragraph(para_html, body_style))
        story.append(Spacer(1, 0.08*inch))

    # Footer
    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("<b>IMPORTANT: Sign and date this letter before sending.</b>", small_style))
    story.append(Paragraph("Send via USPS Certified Mail, Return Receipt Requested.", small_style))
    story.append(Paragraph(f"You may also file online at: {agency['online_url']}", small_style))

    doc.build(story)
    buffer.seek(0)

    filename = f"complaint_{agency_key}_{data.get('last_name', 'letter').lower()}.pdf"

    # Track download
    if db is not None:
        await db.complaint_downloads.insert_one({
            "id": str(uuid.uuid4()),
            "agency": agency_key,
            "company_reported": company_name,
            "violations_count": len(violations),
            "user_email": data.get("email", ""),
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
