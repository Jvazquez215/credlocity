from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone

router = APIRouter(prefix="/api/seo", tags=["SEO Metadata"])
db = None

def set_db(database):
    global db
    db = database

class SEOMetadata(BaseModel):
    page_slug: str
    title: str
    description: str
    keywords: str = ""
    canonical_url: str = ""
    og_title: str = ""
    og_description: str = ""
    og_image: str = ""
    schema_type: str = "WebPage"
    robots: str = "index, follow"

class SEOMetadataUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    keywords: Optional[str] = None
    canonical_url: Optional[str] = None
    og_title: Optional[str] = None
    og_description: Optional[str] = None
    og_image: Optional[str] = None
    schema_type: Optional[str] = None
    robots: Optional[str] = None

DEFAULT_SEO_DATA = [
    {"page_slug": "credit-scores", "title": "Credit Scores Explained: FICO vs VantageScore — All Versions, History & Factors | Credlocity", "description": "Complete guide to credit scores: FICO 2-10 vs VantageScore 1.0-4.0, scoring history from 1899, 5 score factors, ranges, and how lenders use your score.", "keywords": "credit score, FICO score, VantageScore, credit score factors, credit score range, good credit score", "canonical_url": "https://credlocity.com/credit-scores"},
    {"page_slug": "credit-reports", "title": "Understanding Credit Reports: 3-Bureau Guide, Common Errors & Dispute Process | Credlocity", "description": "Learn to read your Equifax, Experian & TransUnion credit reports. Identify 8 common errors and use our 6-step dispute guide to fix inaccuracies.", "keywords": "credit report, credit bureau, Equifax, Experian, TransUnion, credit report errors, dispute credit report", "canonical_url": "https://credlocity.com/credit-reports"},
    {"page_slug": "repair-methods", "title": "8 Credit Repair Methods: Interactive Guide to Disputes, Goodwill Letters & More | Credlocity", "description": "Interactive explorer with 8 proven credit repair methods: FCRA disputes, goodwill letters, pay-for-delete, Metro2, debt validation, and more.", "keywords": "credit repair methods, credit dispute, goodwill letter, pay for delete, debt validation, credit repair strategies", "canonical_url": "https://credlocity.com/repair-methods"},
    {"page_slug": "education-hub", "title": "Credit Education Hub: Free Guides on Scores, Reports, Repair & Legal Rights | Credlocity", "description": "Free credit education: understand scores, read reports, learn repair strategies, know your legal rights under FCRA, FDCPA, CROA. 20+ guides.", "keywords": "credit education, credit score guide, credit report help, credit repair education, financial literacy", "canonical_url": "https://credlocity.com/education-hub"},
    {"page_slug": "financial-wellness", "title": "Financial Wellness Guide: Budgeting, Saving, Investing & Building Wealth | Credlocity", "description": "Complete financial wellness guide: 50/30/20 budgeting, emergency funds, debt elimination, retirement planning, insurance, and wealth building.", "keywords": "financial wellness, budgeting guide, emergency fund, debt elimination, retirement planning, wealth building", "canonical_url": "https://credlocity.com/financial-wellness"},
    {"page_slug": "debt-management", "title": "Debt Management Guide: 6 Methods Compared — Snowball, Avalanche, Consolidation | Credlocity", "description": "Complete debt management guide: Snowball vs Avalanche, consolidation, balance transfers, settlement, bankruptcy — compare pros, cons, credit impact.", "keywords": "debt management, debt snowball, debt avalanche, debt consolidation, debt settlement, bankruptcy guide", "canonical_url": "https://credlocity.com/debt-management"},
    {"page_slug": "credit-building", "title": "Credit Building Strategies: 6 Proven Methods for Beginners & Rebuilders | Credlocity", "description": "6 proven credit building strategies: secured cards, credit builder loans, authorized user, Experian Boost, and more. Step-by-step for beginners.", "keywords": "credit building, build credit, secured credit card, credit builder loan, authorized user, improve credit score", "canonical_url": "https://credlocity.com/credit-building"},
    {"page_slug": "fcra-guide", "title": "FCRA Guide: Fair Credit Reporting Act — 10 Rights, 9 Sections, Dispute Process | Credlocity", "description": "Complete FCRA guide: 10 consumer rights, 9 key sections, 4 dispute methods compared, and how to sue for violations.", "keywords": "FCRA, fair credit reporting act, credit dispute rights, section 611, section 609, credit bureau dispute", "canonical_url": "https://credlocity.com/fcra-guide"},
    {"page_slug": "fdcpa-guide", "title": "FDCPA Guide: Fair Debt Collection Practices Act — Your Rights Against Collectors | Credlocity", "description": "Complete FDCPA guide: 5 consumer rights, prohibited collector actions, debt validation process, and when to sue for violations.", "keywords": "FDCPA, fair debt collection, debt collector rights, debt validation, stop debt collectors", "canonical_url": "https://credlocity.com/fdcpa-guide"},
    {"page_slug": "croa-guide", "title": "CROA Guide: Credit Repair Organizations Act — Your Rights & Company Requirements | Credlocity", "description": "Complete CROA guide: 6 requirements for credit repair companies, prohibited practices, cancellation rights, and how to spot violations.", "keywords": "CROA, credit repair organizations act, credit repair rights, credit repair law", "canonical_url": "https://credlocity.com/croa-guide"},
    {"page_slug": "tsr-compliance", "title": "TSR Compliance Guide: Telemarketing Sales Rule & Credit Repair Protections | Credlocity", "description": "Understand the TSR: advance fee bans for credit repair, disclosure requirements, do-not-call rules, penalties, and how to report violations.", "keywords": "telemarketing sales rule, TSR, advance fee ban, FTC credit repair rules", "canonical_url": "https://credlocity.com/tsr-compliance"},
    {"page_slug": "fcra-605b", "title": "FCRA Section 605B: Identity Theft Block — Remove Fraudulent Accounts in 4 Days | Credlocity", "description": "Step-by-step guide to 605B identity theft block: remove fraudulent accounts within 4 business days. File reports, protect credit from fraud.", "keywords": "FCRA 605B, identity theft block, remove fraudulent accounts, identity theft credit repair", "canonical_url": "https://credlocity.com/fcra-605b"},
    {"page_slug": "credit-repair-scams", "title": "Credit Repair Scams: 6 Types, Red Flags & How to Spot Legitimate Companies | Credlocity", "description": "Avoid credit repair scams: 6 common scam types, 10 red flags, signs of legitimate companies, and how to report fraud.", "keywords": "credit repair scams, credit repair fraud, CPN scam, advance fee scam, legitimate credit repair", "canonical_url": "https://credlocity.com/credit-repair-scams"},
    {"page_slug": "fraud-removal", "title": "Fraud Removal Guide: 8-Step Process to Remove Fraudulent Accounts | Credlocity", "description": "Complete 8-step fraud removal process: detect fraud, file reports, request 605B blocks, contact creditors, freeze credit, and monitor recovery.", "keywords": "fraud removal, identity theft recovery, remove fraudulent accounts, credit fraud protection", "canonical_url": "https://credlocity.com/fraud-removal"},
    {"page_slug": "credit-tracker-app", "title": "Credit Tracker App: Monitor Scores, Reports, Disputes & Identity | Credlocity", "description": "Free credit monitoring app: real-time FICO & VantageScore from all 3 bureaus, report alerts, score simulator, dispute tracking, dark web monitoring.", "keywords": "credit monitoring app, credit score tracker, credit report monitoring, identity protection", "canonical_url": "https://credlocity.com/credit-tracker-app"},
    {"page_slug": "free-trial", "title": "30-Day Free Trial: Professional Credit Repair — $0 to Start | Credlocity", "description": "Start professional credit repair free. 30-day trial includes full 3-bureau analysis, dedicated specialist, Credit Tracker app, 180-day guarantee.", "keywords": "credit repair free trial, free credit repair, no upfront fees, 30 day trial", "canonical_url": "https://credlocity.com/free-trial"},
    {"page_slug": "how-it-works", "title": "How Credlocity Works: 6-Step Credit Repair Process | Credlocity", "description": "Our proven 6-step process: free analysis, custom strategy, certified mail disputes, investigation monitoring, results review, and credit building.", "keywords": "how credit repair works, credit repair process, credit dispute process, Credlocity process", "canonical_url": "https://credlocity.com/how-it-works"},
    {"page_slug": "human-trafficking-credit-block", "title": "Human Trafficking Credit Block: FCRA Protections for Survivors | Credlocity", "description": "Specialized credit protections for trafficking survivors: FCRA 605B blocks, fraud alerts, TVPA protections, and free recovery resources.", "keywords": "human trafficking credit, trafficking survivor credit repair, FCRA 605B trafficking, credit fraud trafficking", "canonical_url": "https://credlocity.com/human-trafficking-credit-block"},
    {"page_slug": "mortgage-professionals", "title": "Mortgage Professional Partnership: Help Borrowers Qualify | Credlocity", "description": "Partner with Credlocity to help declined borrowers improve credit and qualify for mortgages. RESPA compliant. 78% approval success rate.", "keywords": "mortgage credit repair partner, RESPA compliant referral, borrower credit repair, mortgage professional partnership", "canonical_url": "https://credlocity.com/mortgage-professionals"},
    {"page_slug": "car-dealerships", "title": "Car Dealership Partnership: Turn Credit Declines Into Approvals | Credlocity", "description": "Earn up to $200 per referral. Turn credit declines into approvals with Credlocity's credit repair partnership for car dealerships.", "keywords": "car dealership credit repair, auto dealer partnership, credit decline referral, dealership referral program", "canonical_url": "https://credlocity.com/car-dealerships"},
    {"page_slug": "real-estate-partner", "title": "Real Estate Agent Partnership: Expand Your Buyer Pool | Credlocity", "description": "Help more clients qualify for mortgages. Partner with Credlocity to offer professional credit repair. RESPA compliant, no commissions.", "keywords": "real estate credit repair partner, realtor referral program, buyer credit help, RESPA compliant", "canonical_url": "https://credlocity.com/real-estate-partner"},
    {"page_slug": "social-media-influencers", "title": "Influencer Partnership: Earn Recurring Income | Credlocity", "description": "Monetize your audience with recurring income. Earn $75 per signup plus $20/month for active clients. Join the Credlocity influencer network.", "keywords": "credit repair influencer, affiliate program, recurring income, influencer partnership", "canonical_url": "https://credlocity.com/social-media-influencers"},
]

@router.get("/metadata")
async def get_all_seo_metadata():
    """Get all SEO metadata entries"""
    entries = await db.seo_metadata.find({}, {"_id": 0}).to_list(None)
    return entries

@router.get("/metadata/{page_slug}")
async def get_seo_metadata(page_slug: str):
    """Get SEO metadata for a specific page"""
    entry = await db.seo_metadata.find_one({"page_slug": page_slug}, {"_id": 0})
    if not entry:
        raise HTTPException(status_code=404, detail="SEO metadata not found for this page")
    return entry

@router.put("/metadata/{page_slug}")
async def update_seo_metadata(page_slug: str, data: SEOMetadataUpdate):
    """Update SEO metadata for a specific page (admin only)"""
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.seo_metadata.update_one({"page_slug": page_slug}, {"$set": update_data}, upsert=True)
    updated = await db.seo_metadata.find_one({"page_slug": page_slug}, {"_id": 0})
    return updated

@router.post("/metadata")
async def create_seo_metadata(data: SEOMetadata):
    """Create SEO metadata for a new page"""
    existing = await db.seo_metadata.find_one({"page_slug": data.page_slug})
    if existing:
        raise HTTPException(status_code=400, detail="SEO metadata already exists for this page. Use PUT to update.")
    entry = data.dict()
    entry["created_at"] = datetime.now(timezone.utc).isoformat()
    entry["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.seo_metadata.insert_one(entry)
    return await db.seo_metadata.find_one({"page_slug": data.page_slug}, {"_id": 0})

@router.delete("/metadata/{page_slug}")
async def delete_seo_metadata(page_slug: str):
    """Delete SEO metadata for a specific page"""
    result = await db.seo_metadata.delete_one({"page_slug": page_slug})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="SEO metadata not found")
    return {"message": "SEO metadata deleted"}

async def seed_seo_metadata():
    """Seed default SEO metadata for all public pages"""
    count = await db.seo_metadata.count_documents({})
    if count == 0:
        now = datetime.now(timezone.utc).isoformat()
        for entry in DEFAULT_SEO_DATA:
            entry["created_at"] = now
            entry["updated_at"] = now
            entry["og_title"] = entry.get("og_title", entry["title"])
            entry["og_description"] = entry.get("og_description", entry["description"])
            entry["og_image"] = entry.get("og_image", "")
            entry["schema_type"] = entry.get("schema_type", "WebPage")
            entry["robots"] = entry.get("robots", "index, follow")
        await db.seo_metadata.insert_many(DEFAULT_SEO_DATA)
        print(f"Seeded {len(DEFAULT_SEO_DATA)} SEO metadata entries")
