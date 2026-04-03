"""
SEO & Domain Control API
Manages per-page SEO settings, generates sitemap.xml, robots.txt, and schema markup.
"""
import os
import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Header, Request
from fastapi.responses import Response
from motor.motor_asyncio import AsyncIOMotorClient
from auth import decode_token
from schema_generator import generate_page_schemas, build_blog_posting_schema, build_local_business_schema, build_author_schema, build_faq_schema, COMPANY

seo_router = APIRouter(prefix="/seo", tags=["SEO & Domain Control"])

mongo_url = os.environ['MONGO_URL']
db_name = os.environ.get('DB_NAME', 'credlocity')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Default SEO pages configuration
DEFAULT_PAGES = [
    {"path": "/", "title": "Credlocity — Professional Credit Repair Services", "description": "Credlocity offers FCRA-compliant credit repair services to help you remove errors, disputes, and negative items from your credit report. Start your free consultation today.", "priority": 1.0, "changefreq": "daily"},
    {"path": "/pricing", "title": "Credit Repair Pricing & Plans | Credlocity", "description": "Transparent credit repair pricing with no hidden fees. Compare Credlocity's affordable plans and start repairing your credit today.", "priority": 0.9, "changefreq": "weekly"},
    {"path": "/how-it-works", "title": "How Credit Repair Works | Credlocity Process", "description": "Learn how Credlocity's proven credit repair process works — from free consultation to dispute resolution and credit monitoring.", "priority": 0.9, "changefreq": "monthly"},
    {"path": "/why-us", "title": "Why Choose Credlocity for Credit Repair?", "description": "See why thousands of clients trust Credlocity for credit repair. CROA-compliant, FCRA-certified, transparent pricing, and proven results.", "priority": 0.8, "changefreq": "monthly"},
    {"path": "/credit-scores", "title": "Understanding Credit Scores | Credlocity Education", "description": "Learn how credit scores work, what affects them, and how to improve yours. Expert guide from Credlocity's credit repair professionals.", "priority": 0.8, "changefreq": "monthly"},
    {"path": "/collection-removal", "title": "Collection Account Removal | Credlocity", "description": "Remove collection accounts from your credit report legally. Credlocity disputes inaccurate collections under FDCPA and FCRA.", "priority": 0.8, "changefreq": "monthly"},
    {"path": "/late-payment-removal", "title": "Late Payment Removal from Credit Report | Credlocity", "description": "Remove late payments from your credit report. Credlocity uses goodwill letters and FCRA disputes to restore your payment history.", "priority": 0.8, "changefreq": "monthly"},
    {"path": "/charge-off-removal", "title": "Charge-Off Removal from Credit Report | Credlocity", "description": "Remove charge-offs from your credit report with Credlocity's professional dispute services.", "priority": 0.8, "changefreq": "monthly"},
    {"path": "/bankruptcy-credit-repair", "title": "Credit Repair After Bankruptcy | Credlocity", "description": "Rebuild your credit after bankruptcy with Credlocity. Expert strategies to restore your score and financial standing.", "priority": 0.8, "changefreq": "monthly"},
    {"path": "/identity-theft-credit-repair", "title": "Identity Theft Credit Repair | Credlocity", "description": "Repair credit damage from identity theft. Credlocity helps remove fraudulent accounts and restore your credit report.", "priority": 0.8, "changefreq": "monthly"},
    {"path": "/hard-inquiry-removal", "title": "Hard Inquiry Removal | Credlocity", "description": "Remove unauthorized hard inquiries from your credit report with Credlocity.", "priority": 0.7, "changefreq": "monthly"},
    {"path": "/fraud-removal", "title": "Fraud Account Removal | Credlocity", "description": "Remove fraudulent accounts from your credit report with Credlocity's identity theft repair services.", "priority": 0.7, "changefreq": "monthly"},
    {"path": "/blog", "title": "Credit Repair Blog & Financial Tips | Credlocity", "description": "Expert credit repair tips, financial literacy guides, and industry news from Credlocity's team of credit professionals.", "priority": 0.8, "changefreq": "daily"},
    {"path": "/faqs", "title": "Credit Repair FAQs | Credlocity", "description": "Frequently asked questions about credit repair, FCRA rights, dispute processes, and Credlocity's services.", "priority": 0.7, "changefreq": "monthly"},
    {"path": "/team", "title": "Meet Our Credit Repair Team | Credlocity", "description": "Meet the experienced credit repair professionals at Credlocity dedicated to helping you improve your credit score.", "priority": 0.6, "changefreq": "monthly"},
    {"path": "/credit-repair-reviews", "title": "Best Credit Repair Companies 2026 | Reviews & Comparison | Credlocity", "description": "Compare the top 7 credit repair companies in 2026. Unbiased reviews of Credlocity, Lexington Law, CreditRepair.com, Credit Saint, The Credit Pros, The Credit People, and White Jacobs.", "priority": 0.9, "changefreq": "weekly"},
    {"path": "/vs-lexington-law", "title": "Credlocity vs Lexington Law 2026: Honest Credit Repair Comparison", "description": "Compare Credlocity vs Lexington Law credit repair services in 2026. See pricing, BBB ratings, CFPB actions, complaints, and why 79,000+ clients chose Credlocity.", "priority": 0.9, "changefreq": "monthly"},
    {"path": "/vs-creditrepair", "title": "Credlocity vs CreditRepair.com 2026: Which Credit Repair Service Wins?", "description": "Credlocity vs CreditRepair.com comparison 2026. Compare pricing, BBB ratings (A+ vs D), Trustpilot reviews, FTC complaints, and real results.", "priority": 0.9, "changefreq": "monthly"},
    {"path": "/vs-credit-people", "title": "Credlocity vs The Credit People 2026: Credit Repair Comparison", "description": "Compare Credlocity vs The Credit People for credit repair in 2026. See pricing, BBB ratings (A+ vs C+), refund policies, and real client results.", "priority": 0.9, "changefreq": "monthly"},
    {"path": "/vs-credit-pros", "title": "Credlocity vs The Credit Pros 2026: Price, Results & Complaints Compared", "description": "Credlocity vs The Credit Pros comparison 2026. The Credit Pros charges $129-$149/mo with cancellation complaints. Credlocity offers a 30-day free trial and 180-day guarantee.", "priority": 0.9, "changefreq": "monthly"},
    {"path": "/vs-credit-saint", "title": "Credlocity vs Credit Saint 2026: Complete Credit Repair Comparison", "description": "Credlocity vs Credit Saint comparison 2026. Compare the $195 setup fee, 847 complaints, and guarantee loopholes to Credlocity's free trial and zero complaints.", "priority": 0.9, "changefreq": "monthly"},
    {"path": "/vs-white-jacobs", "title": "Credlocity vs White Jacobs 2026: Credit Repair Company Comparison", "description": "Compare Credlocity vs White Jacobs & Associates credit repair 2026. White Jacobs has hidden pricing and D+ BBB rating. Credlocity: free trial, A+ BBB, zero complaints.", "priority": 0.9, "changefreq": "monthly"},
    {"path": "/switch", "title": "Switch Credit Repair Companies & Save 5% | Credlocity Price-Beat Guarantee", "description": "Switching credit repair companies? Credlocity beats your current price by 5% guaranteed. If your company charged illegal fees, we'll help you fight for a refund.", "priority": 0.9, "changefreq": "monthly"},
    {"path": "/scam-checker", "title": "Free Credit Repair Scam Checker Tool | Analyze Emails & Contracts | Credlocity", "description": "Free tool to check if a credit repair company is a scam. Paste any email, contract, or ad and get instant analysis of red flags, illegal fees, and federal law violations.", "priority": 0.9, "changefreq": "monthly"},
    {"path": "/success-stories", "title": "Credit Repair Success Stories | Credlocity", "description": "Real client success stories from Credlocity. See how we've helped thousands improve their credit scores.", "priority": 0.7, "changefreq": "weekly"},
    {"path": "/lawsuits", "title": "Credit Repair Industry Lawsuits | Credlocity", "description": "Track major credit repair industry lawsuits, FCRA violations, and consumer protection cases.", "priority": 0.6, "changefreq": "weekly"},
    {"path": "/become-a-partner", "title": "Become a Credlocity Partner | Affiliate Program", "description": "Join Credlocity's affiliate partner network. Earn referral commissions helping your clients with credit repair.", "priority": 0.8, "changefreq": "monthly"},
    {"path": "/become-a-partner/real-estate", "title": "Real Estate Credit Repair Partner | Credlocity", "description": "Partner with Credlocity to help homebuyers get mortgage-ready. Real estate agent affiliate program.", "priority": 0.7, "changefreq": "monthly"},
    {"path": "/become-a-partner/mortgage-professionals", "title": "Mortgage Partner Program | Credlocity", "description": "Credlocity's mortgage professional partner program helps your clients qualify for better loan rates.", "priority": 0.7, "changefreq": "monthly"},
    {"path": "/become-a-partner/car-dealerships", "title": "Auto Dealership Credit Repair Partner | Credlocity", "description": "Partner with Credlocity to help car buyers improve their credit for better auto financing.", "priority": 0.7, "changefreq": "monthly"},
    {"path": "/become-a-partner/social-media-influencers", "title": "Social Media Creator Partner | Credlocity", "description": "Monetize your audience with Credlocity's affiliate program for content creators and influencers.", "priority": 0.7, "changefreq": "monthly"},
    {"path": "/become-a-partner/attorneys", "title": "Attorney Partner Network | Credlocity", "description": "Join Credlocity's attorney network for consumer protection and credit repair litigation cases.", "priority": 0.7, "changefreq": "monthly"},
    {"path": "/affiliate-partners", "title": "Credit Repair Partners & Affiliates Near You | Credlocity", "description": "Find trusted credit repair partners in real estate, mortgage, auto, and education. Credlocity's affiliate network helps you build better credit.", "priority": 0.8, "changefreq": "weekly"},
    {"path": "/education-hub", "title": "Credit Education Hub | Credlocity", "description": "Free credit education resources: FCRA, FDCPA, CROA guides, credit building strategies, and debt management.", "priority": 0.8, "changefreq": "weekly"},
    {"path": "/credit-building", "title": "Credit Building Guide | Credlocity", "description": "Build credit from scratch or rebuild after setbacks. Credlocity's step-by-step credit building guide.", "priority": 0.7, "changefreq": "monthly"},
    {"path": "/repair-methods", "title": "Credit Repair Methods & Strategies | Credlocity", "description": "Professional credit repair methods: dispute letters, goodwill negotiations, pay-for-delete, and more.", "priority": 0.7, "changefreq": "monthly"},
    {"path": "/debt-management", "title": "Debt Management Guide | Credlocity", "description": "Manage and reduce debt effectively with Credlocity's expert debt management strategies.", "priority": 0.7, "changefreq": "monthly"},
    {"path": "/financial-wellness", "title": "Financial Wellness Guide | Credlocity", "description": "Achieve financial wellness with Credlocity's comprehensive guide to budgeting, saving, and credit health.", "priority": 0.7, "changefreq": "monthly"},
    {"path": "/credit-repair-scams", "title": "How to Avoid Credit Repair Scams | Credlocity", "description": "Protect yourself from credit repair scams. Learn the red flags and how Credlocity operates transparently.", "priority": 0.7, "changefreq": "monthly"},
    {"path": "/credit-tracker-app", "title": "Credit Tracker App | Credlocity", "description": "Track your credit repair progress with Credlocity's free credit monitoring and tracking tools.", "priority": 0.6, "changefreq": "monthly"},
    {"path": "/store", "title": "Credit Repair Store | E-Books & Resources | Credlocity", "description": "Credit repair e-books, guides, and tools from Credlocity's expert team.", "priority": 0.6, "changefreq": "weekly"},
    {"path": "/credit-builder-store", "title": "Credit Builder Accounts & Products | Credlocity", "description": "Build credit with Credlocity's curated credit builder accounts and tradeline products.", "priority": 0.8, "changefreq": "weekly"},
    {"path": "/press-releases", "title": "Press Releases & News | Credlocity", "description": "Latest press releases and news from Credlocity, the leader in professional credit repair.", "priority": 0.5, "changefreq": "weekly"},
    {"path": "/outsourcing", "title": "Credit Repair Outsourcing | Credlocity", "description": "Outsource your credit repair operations to Credlocity's white-label team of professionals.", "priority": 0.7, "changefreq": "monthly"},
    {"path": "/intake", "title": "Get Started with Credit Repair | Free Consultation | Credlocity", "description": "Start your credit repair journey. Fill out our intake form for a free credit assessment and personalized repair plan.", "priority": 0.9, "changefreq": "monthly"},
    {"path": "/submit-complaint", "title": "Submit a Complaint | Credlocity", "description": "Submit a complaint about a credit repair company. Credlocity advocates for consumer protection.", "priority": 0.5, "changefreq": "monthly"},
    {"path": "/30-day-free-trial", "title": "30-Day Free Trial | Credlocity Credit Repair", "description": "Try Credlocity's credit repair services free for 30 days. No credit card required. See real results.", "priority": 0.9, "changefreq": "monthly"},
    {"path": "/leave-review", "title": "Leave a Review | Credlocity", "description": "Share your experience with Credlocity. Leave a review to help others on their credit repair journey.", "priority": 0.5, "changefreq": "monthly"},
    {"path": "/fcra-guide", "title": "FCRA Guide — Know Your Rights | Credlocity", "description": "Complete guide to the Fair Credit Reporting Act (FCRA). Know your rights as a consumer.", "priority": 0.7, "changefreq": "monthly"},
    {"path": "/fdcpa-guide", "title": "FDCPA Guide — Debt Collection Rights | Credlocity", "description": "Understand your rights under the Fair Debt Collection Practices Act (FDCPA).", "priority": 0.7, "changefreq": "monthly"},
    {"path": "/croa-guide", "title": "CROA Guide — Credit Repair Organizations Act | Credlocity", "description": "Understanding the Credit Repair Organizations Act (CROA) and what it means for consumers.", "priority": 0.7, "changefreq": "monthly"},
    {"path": "/tsr-compliance", "title": "TSR Compliance | Telemarketing Sales Rule | Credlocity", "description": "How Credlocity complies with the Telemarketing Sales Rule and protects consumers.", "priority": 0.5, "changefreq": "monthly"},
    {"path": "/credit-reports", "title": "Understanding Your Credit Report | Credlocity", "description": "Learn how to read and understand your credit report. Identify errors and dispute them with Credlocity.", "priority": 0.7, "changefreq": "monthly"},
    {"path": "/report-company", "title": "Report a Credit Repair Company | Credlocity", "description": "Report a fraudulent or non-compliant credit repair company. Credlocity stands for consumer protection.", "priority": 0.5, "changefreq": "monthly"},
    {"path": "/human-trafficking-credit-block", "title": "Human Trafficking Credit Block | Credlocity", "description": "Protection for human trafficking survivors — block fraudulent credit activity. Credlocity advocates for victims.", "priority": 0.6, "changefreq": "monthly"},
    {"path": "/fcra-605b", "title": "FCRA Section 605B — Identity Theft Block | Credlocity", "description": "Block fraudulent information from your credit report under FCRA Section 605B identity theft provisions.", "priority": 0.6, "changefreq": "monthly"},
    {"path": "/calculators", "title": "Credit & Financial Calculators | Credlocity", "description": "Free credit repair calculators, mortgage payment estimators, and debt payoff tools.", "priority": 0.6, "changefreq": "monthly"},
    {"path": "/about-us", "title": "About Us | Credlocity Credit Repair", "description": "Meet the team behind Credlocity. 17 years of experience, 79,000+ clients served, 5.0-star rating. Learn about our mission and leadership.", "priority": 0.8, "changefreq": "monthly"},
    {"path": "/about-credlocity", "title": "About Credlocity | Our Mission, Values & 17-Year History", "description": "Credlocity Business Group LLC has been the most trusted credit repair company since 2008. Learn about our mission, CROA compliance, and why we offer a 30-day free trial.", "priority": 0.8, "changefreq": "monthly"},
    {"path": "/locations", "title": "Credit Repair Locations | Professional Services Near You | Credlocity", "description": "Find Credlocity credit repair services near you. Philadelphia PA, Atlanta GA, New York NY, Boise ID, and more. 79,000+ clients served, 236-point average score increase.", "priority": 0.9, "changefreq": "weekly"},
    {"path": "/free-letters", "title": "Free Downloadable Letters | Dispute Templates & Legal Letters | Credlocity", "description": "Download free credit repair dispute letter templates, debt validation letters, cease and desist letters, goodwill letters, and identity theft affidavits.", "priority": 0.8, "changefreq": "weekly"},
    {"path": "/credit-repair-laws", "title": "Credit Repair Laws Guide | FCRA, CROA, TSR, FDCPA | Credlocity", "description": "Comprehensive guide to credit repair laws including FCRA, CROA, TSR, FDCPA, and FCBA. Know your rights and how to exercise them.", "priority": 0.8, "changefreq": "monthly"},
    {"path": "/attorney-signup", "title": "Join Our Attorney Network | Partner with Credlocity", "description": "Partner with Credlocity's attorney network for FCRA litigation cases and consumer protection.", "priority": 0.6, "changefreq": "monthly"},
]


async def _get_user(authorization: Optional[str]):
    if not authorization:
        return None
    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    if not payload:
        return None
    return await db.users.find_one({"email": payload.get("sub")}, {"_id": 0})


# ==================== SEO SETTINGS CRUD ====================

@seo_router.get("/pages")
async def list_seo_pages(authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    pages = await db.seo_pages.find({}, {"_id": 0}).sort("path", 1).to_list(None)

    # Merge with defaults for any pages not yet customized
    existing_paths = {p["path"] for p in pages}
    for dp in DEFAULT_PAGES:
        if dp["path"] not in existing_paths:
            pages.append({**dp, "id": None, "custom": False})

    pages.sort(key=lambda x: x.get("path", ""))
    return {"pages": pages, "total": len(pages)}


@seo_router.put("/pages/{path:path}")
async def update_seo_page(path: str, data: dict, authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    clean_path = "/" + path.lstrip("/")

    update_data = {
        "path": clean_path,
        "title": data.get("title", ""),
        "description": data.get("description", ""),
        "keywords": data.get("keywords", ""),
        "og_title": data.get("og_title", ""),
        "og_description": data.get("og_description", ""),
        "og_image": data.get("og_image", ""),
        "canonical_url": data.get("canonical_url", ""),
        "robots_meta": data.get("robots_meta", "index, follow"),
        "schema_type": data.get("schema_type", "WebPage"),
        "schema_json": data.get("schema_json", ""),
        "priority": data.get("priority", 0.5),
        "changefreq": data.get("changefreq", "monthly"),
        "custom": True,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "updated_by": user.get("email", ""),
    }

    result = await db.seo_pages.update_one(
        {"path": clean_path},
        {"$set": update_data},
        upsert=True
    )

    return {**update_data, "upserted": result.upserted_id is not None}


@seo_router.get("/pages/by-path")
async def get_seo_by_path(path: str):
    """Public endpoint — frontend calls this to get SEO for a page."""
    page = await db.seo_pages.find_one({"path": path}, {"_id": 0})
    if page:
        return page

    # Fallback to defaults
    for dp in DEFAULT_PAGES:
        if dp["path"] == path:
            return dp

    return {"path": path, "title": "", "description": ""}


# ==================== DOMAIN SETTINGS ====================

@seo_router.get("/domain-settings")
async def get_domain_settings(authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    settings = await db.seo_settings.find_one({"type": "domain"}, {"_id": 0})
    if not settings:
        settings = {
            "type": "domain",
            "site_name": "Credlocity",
            "site_url": "https://www.credlocity.com",
            "default_og_image": "",
            "google_analytics_id": "",
            "google_search_console_verification": "",
            "bing_webmaster_verification": "",
            "facebook_pixel_id": "",
            "twitter_handle": "@credlocity",
            "organization_schema": {
                "name": "Credlocity",
                "description": "Professional credit repair services compliant with FCRA, CROA, and TSR.",
                "url": "https://www.credlocity.com",
                "logo": "",
                "phone": "",
                "email": "",
                "address": {"street": "", "city": "", "state": "", "zip": "", "country": "US"},
                "social_profiles": [],
            },
            "robots_txt_custom": "",
            "global_head_scripts": "",
            "global_robots_meta": "index, follow",
        }
    return settings


@seo_router.put("/domain-settings")
async def update_domain_settings(data: dict, authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    data["type"] = "domain"
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    data["updated_by"] = user.get("email", "")

    await db.seo_settings.update_one(
        {"type": "domain"},
        {"$set": data},
        upsert=True
    )
    return data


# ==================== SITEMAP.XML ====================

@seo_router.get("/sitemap.xml")
async def generate_sitemap(request: Request):
    """Dynamically generated sitemap.xml"""
    base_url = "https://www.credlocity.com"

    # Get custom pages from DB
    custom_pages = await db.seo_pages.find({}, {"_id": 0}).to_list(None)
    custom_paths = {p["path"]: p for p in custom_pages}

    # Merge defaults with custom
    all_pages = []
    seen = set()
    for dp in DEFAULT_PAGES:
        p = custom_paths.get(dp["path"], dp)
        robots = p.get("robots_meta", "index, follow")
        if "noindex" not in robots:
            all_pages.append(p)
            seen.add(dp["path"])

    for cp in custom_pages:
        if cp["path"] not in seen:
            robots = cp.get("robots_meta", "index, follow")
            if "noindex" not in robots:
                all_pages.append(cp)

    # Add blog posts
    blog_posts = await db.blog_posts.find({"status": "published"}, {"_id": 0, "slug": 1, "updated_at": 1}).to_list(None)
    for post in blog_posts:
        all_pages.append({"path": f"/post/{post['slug']}", "priority": 0.7, "changefreq": "weekly"})

    # Add affiliate landing pages
    affiliates = await db.affiliates.find({"status": "published", "affiliate_type": {"$exists": True}}, {"_id": 0, "slug": 1}).to_list(None)
    for aff in affiliates:
        all_pages.append({"path": f"/p/{aff['slug']}", "priority": 0.6, "changefreq": "monthly"})

    # Add success stories
    stories = await db.success_stories.find({"status": "published"}, {"_id": 0, "slug": 1}).to_list(None) if "success_stories" in await db.list_collection_names() else []
    for story in stories:
        all_pages.append({"path": f"/success-stories/{story['slug']}", "priority": 0.6, "changefreq": "monthly"})

    # Add local landing pages
    local_pages = await db.local_landing_pages.find({"status": "published"}, {"_id": 0, "slug": 1, "path": 1}).to_list(None)
    for lp in local_pages:
        all_pages.append({"path": lp.get("path", f"/{lp['slug']}"), "priority": 0.8, "changefreq": "weekly"})

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    xml_entries = []
    for p in all_pages:
        url = f"{base_url}{p['path']}"
        priority = p.get("priority", 0.5)
        freq = p.get("changefreq", "monthly")
        xml_entries.append(f"""  <url>
    <loc>{url}</loc>
    <lastmod>{now}</lastmod>
    <changefreq>{freq}</changefreq>
    <priority>{priority}</priority>
  </url>""")

    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(xml_entries)}
</urlset>"""

    return Response(content=xml, media_type="application/xml")


# ==================== ROBOTS.TXT ====================

@seo_router.get("/robots.txt")
async def generate_robots():
    """Dynamically generated robots.txt"""
    settings = await db.seo_settings.find_one({"type": "domain"}, {"_id": 0})
    custom_rules = settings.get("robots_txt_custom", "") if settings else ""

    base_url = settings.get("site_url", "https://www.credlocity.com") if settings else "https://www.credlocity.com"

    robots = f"""User-agent: *
Allow: /
Disallow: /admin/
Disallow: /company/
Disallow: /partner/
Disallow: /attorney/
Disallow: /payment/
Disallow: /sign/
Disallow: /api/

# Crawl-delay
Crawl-delay: 1

{custom_rules}

# Sitemap
Sitemap: {base_url}/sitemap.xml
"""
    return Response(content=robots.strip(), media_type="text/plain")


# ==================== SCHEMA PRESETS ====================

@seo_router.get("/schema-presets")
async def get_schema_presets():
    """Returns common schema.org presets for quick configuration."""
    return {
        "presets": [
            {"id": "organization", "label": "Organization", "description": "Business/company information"},
            {"id": "local_business", "label": "Local Business", "description": "Physical business location"},
            {"id": "professional_service", "label": "Professional Service", "description": "For credit repair services"},
            {"id": "faq_page", "label": "FAQ Page", "description": "Page with frequently asked questions"},
            {"id": "article", "label": "Article / Blog Post", "description": "For blog content"},
            {"id": "how_to", "label": "How-To Guide", "description": "Step-by-step instructions"},
            {"id": "review", "label": "Review", "description": "Product/service review"},
            {"id": "breadcrumb", "label": "Breadcrumb List", "description": "Navigation breadcrumbs"},
            {"id": "collection_page", "label": "Collection Page", "description": "Directory or listing page"},
            {"id": "speakable", "label": "Speakable (AEO)", "description": "For voice search / AI assistants"},
        ]
    }


# ==================== AUTO SCHEMA GENERATION ====================

@seo_router.get("/page-schemas")
async def get_page_schemas(path: str, post_slug: str = None):
    """Public endpoint — returns auto-generated JSON-LD schemas for any page."""
    seo = await db.seo_pages.find_one({"path": path}, {"_id": 0})
    if not seo:
        for dp in DEFAULT_PAGES:
            if dp["path"] == path:
                seo = dp
                break

    title = seo.get("title", "") if seo else ""
    description = seo.get("description", "") if seo else ""

    # If page has custom schema_json, return that plus base schemas
    custom_json = seo.get("schema_json", "") if seo else ""

    post = None
    if post_slug:
        post = await db.blog_posts.find_one({"slug": post_slug}, {"_id": 0})

    faqs = None
    if path == "/faqs":
        faq_docs = await db.faqs.find({"status": "published"}, {"_id": 0, "question": 1, "answer": 1}).limit(25).to_list(None)
        if faq_docs:
            faqs = [{"q": f.get("question", ""), "a": f.get("answer", "")} for f in faq_docs]

    # Check if this is a local landing page
    local_page = await db.local_landing_pages.find_one({"path": path, "status": "published"}, {"_id": 0})
    location_override = None
    if local_page:
        if local_page.get("faqs"):
            faqs = local_page["faqs"]
        # Use Idaho office for Idaho pages
        if local_page.get("use_idaho_office"):
            from schema_generator import IDAHO_OFFICE
            location_override = {
                **IDAHO_OFFICE,
                "city": f"{local_page.get('city', '')}, {local_page.get('state', '')}",
                "description": local_page.get("description", ""),
            }
        elif local_page.get("city"):
            location_override = {
                "city": f"{local_page.get('city', '')}, {local_page.get('state', '')}",
                "description": local_page.get("description", ""),
            }

    schemas = generate_page_schemas(path=path, title=title, description=description, faqs=faqs, post=post, location_override=location_override)

    # Append custom schema if set
    if custom_json:
        import json as json_lib
        try:
            parsed = json_lib.loads(custom_json) if isinstance(custom_json, str) else custom_json
            if isinstance(parsed, list):
                schemas.extend(parsed)
            elif isinstance(parsed, dict):
                schemas.append(parsed)
        except Exception:
            pass

    return {"schemas": schemas}


# ==================== LOCAL LANDING PAGES CRUD ====================

LOCAL_CITIES_SEED = [
    {"city": "Philadelphia", "state": "PA", "slug": "credit-repair-philadelphia", "path": "/credit-repair-philadelphia",
     "headline": "Credit Repair Services in Philadelphia, PA",
     "description": "Credlocity offers professional, FCRA-compliant credit repair services in Philadelphia, PA. Headquartered in Center City Philadelphia since 2008, we've helped over 79,000 clients remove inaccurate collections, late payments, charge-offs, and identity theft items. Our Board Certified Credit Consultants serve the Greater Philadelphia area including Bucks, Montgomery, Delaware, and Chester counties.",
     "use_idaho_office": False,
     "office_address": "1500 Chestnut Street, Suite 2, Philadelphia, PA 19102",
     "stats": {"population": "1,603,797", "metro_population": "6,245,051", "avg_credit_score": "686", "pct_subprime": "34%", "pct_with_collections": "28%", "median_income": "$52,649", "pct_with_debt": "72%", "avg_debt": "$68,900"},
     "reviews": [
         {"name": "Marcus T.", "location": "North Philadelphia, PA", "rating": 5, "text": "Credlocity removed 8 collections and 3 late payments from my credit report in just 4 months. My score went from 512 to 698. I was finally able to get approved for a mortgage in Kensington."},
         {"name": "Jasmine R.", "location": "West Philadelphia, PA", "rating": 5, "text": "After identity theft destroyed my credit, Credlocity helped me block all fraudulent accounts under FCRA Section 605B. My score jumped 145 points. Best decision I ever made."},
         {"name": "Carlos M.", "location": "South Philadelphia, PA", "rating": 5, "text": "I had charge-offs from medical bills that weren't even mine. Credlocity disputed every one and got them removed within 60 days. Professional and thorough."},
     ],
     "faqs": [
         {"q": "How does credit repair work in Philadelphia?", "a": "At our Philadelphia headquarters on Chestnut Street, Credlocity's Board Certified Credit Consultants review your Equifax, Experian, and TransUnion credit reports to identify inaccurate, misleading, or unverifiable items. We then send legally compliant dispute letters under the Fair Credit Reporting Act (FCRA) to the bureaus and original creditors. Items that cannot be verified within 30 days must be removed by law."},
         {"q": "How long does credit repair take in Philadelphia?", "a": "Most Philadelphia clients see initial improvements within 30-45 days after the first round of disputes. Comprehensive credit repair programs typically run 3-6 months depending on the number and complexity of negative items. We've helped Philadelphia residents raise their scores by an average of 50-150 points."},
         {"q": "Is credit repair legal in Pennsylvania?", "a": "Yes. Credit repair is fully legal and protected under the Fair Credit Reporting Act (FCRA), the Credit Repair Organizations Act (CROA), and the Fair Debt Collection Practices Act (FDCPA). Pennsylvania also has its own Fair Credit Extension Uniformity Act. Credlocity is fully compliant with all federal and state regulations."},
         {"q": "How much does credit repair cost in Philadelphia?", "a": "Credlocity offers three plans: Fraud Package at $99.95/month, Aggressive Package at $179.95/month (most popular), and Family Package at $279.95/month. We offer a 30-day free trial with no credit card required and a 180-day money-back guarantee."},
         {"q": "Can Credlocity help with medical debt on my Philadelphia credit report?", "a": "Yes. Under recent changes to credit reporting rules, paid medical collections should not appear on your credit report. Additionally, medical debts under $500 may not be reported. Credlocity disputes all inaccurate medical collections and ensures bureaus comply with the latest regulations."},
         {"q": "What types of negative items can Credlocity remove in Philadelphia?", "a": "We dispute and remove collections, late payments, charge-offs, bankruptcies, repossessions, foreclosures, hard inquiries, identity theft accounts, student loan errors, and any inaccurate information found on your credit report. Each item is individually analyzed for FCRA violations."},
         {"q": "Does Credlocity offer in-person consultations in Philadelphia?", "a": "Yes. Our Philadelphia office is located at 1500 Chestnut Street, Suite 2, Philadelphia, PA 19102. We offer both in-person and remote consultations. Per the Telemarketing Sales Rule (TSR), we cannot enroll clients by phone — all enrollments are through our secure online system at credlocity.com."},
         {"q": "How is Credlocity different from other credit repair companies in Philadelphia?", "a": "Credlocity is the only credit repair company in Philadelphia with 17 years of continuous operation (since 2008), Board Certified Credit Consultants, a 5.0-star rating across 79,000+ clients, and a 180-day money-back guarantee. We are Hispanic-owned, Minority-owned, and fully CROA/FCRA/TSR compliant. Unlike competitors, we never charge upfront fees before work is completed."},
         {"q": "Can I repair my credit myself in Philadelphia?", "a": "You have the legal right to dispute items yourself under the FCRA. However, the process requires knowledge of consumer protection law, proper dispute letter formatting, and persistence through multiple rounds. Credlocity's certified consultants handle everything for you, leveraging 17 years of experience to maximize results."},
         {"q": "What if I filed bankruptcy in Philadelphia — can my credit still be repaired?", "a": "Absolutely. While a bankruptcy filing itself will remain on your report for 7-10 years, Credlocity can ensure it is reported accurately and dispute any accounts that were included in the bankruptcy but still show as active or unpaid. Many Philadelphia clients see significant score improvements even with a bankruptcy on file."},
     ]},
    {"city": "Boise", "state": "ID", "slug": "credit-repair-boise", "path": "/credit-repair-boise",
     "headline": "Credit Repair Services in Boise, ID",
     "description": "Professional credit repair in Boise, Idaho from Credlocity's local Idaho office. As Boise's population has surged past 235,000, many residents face credit challenges from rapid growth and rising costs. Our FCRA-certified consultants help Treasure Valley families remove inaccurate collections, late payments, charge-offs, and identity theft items from all three credit bureaus.",
     "use_idaho_office": True,
     "office_address": "964 W Idaho Ave, Ontario, OR 97914",
     "stats": {"population": "235,684", "metro_population": "786,738", "avg_credit_score": "713", "pct_subprime": "27%", "pct_with_collections": "22%", "median_income": "$62,463", "pct_with_debt": "68%", "avg_debt": "$54,200"},
     "reviews": [
         {"name": "Sarah K.", "location": "Boise, ID", "rating": 5, "text": "Moving to Boise from California, I needed better credit for a mortgage. Credlocity removed 5 old collections and raised my score from 580 to 721. We closed on our home in the North End last month!"},
         {"name": "David L.", "location": "Meridian, ID", "rating": 5, "text": "Outstanding service. Credlocity disputed 12 inaccurate items and all 12 were removed within 90 days. The team is knowledgeable, responsive, and truly cares about their clients."},
         {"name": "Emily W.", "location": "Eagle, ID", "rating": 5, "text": "After a divorce left my credit in shambles, Credlocity helped me rebuild. They removed 3 charge-offs and 2 late payments. My score went up 112 points. I finally feel financially independent."},
     ],
     "faqs": [
         {"q": "Does Credlocity have an office near Boise, Idaho?", "a": "Yes! Credlocity's Idaho office is located at 964 W Idaho Ave, Ontario, OR 97914, just minutes from the Idaho border. We serve all of the Treasure Valley including Boise, Meridian, Nampa, Caldwell, Eagle, Star, and Kuna with both in-person and remote consultations."},
         {"q": "Why do Boise residents need credit repair?", "a": "Boise has experienced massive population growth (over 20% since 2015), driving up housing costs and cost of living. Many residents carry subprime credit scores — approximately 27% of Boise residents have credit scores below 670. Collections, late payments, and identity theft remain common challenges that credit repair can address."},
         {"q": "What credit issues can Credlocity fix for Boise residents?", "a": "We dispute and remove collections, late payments, charge-offs, hard inquiries, bankruptcies, repossessions, identity theft accounts, medical debt errors, and any inaccurate information on your Equifax, Experian, and TransUnion credit reports. Each item is analyzed under the Fair Credit Reporting Act (FCRA) for compliance."},
         {"q": "How much does credit repair cost in Boise?", "a": "Credlocity offers three affordable plans: Fraud Package at $99.95/month, Aggressive Package at $179.95/month (most popular), and Family Package at $279.95/month. All plans include a 30-day free trial and our industry-leading 180-day money-back guarantee."},
         {"q": "Is credit repair legal in Idaho?", "a": "Yes. Credit repair is fully legal under the Fair Credit Reporting Act (FCRA), the Credit Repair Organizations Act (CROA), and the Fair Debt Collection Practices Act (FDCPA). Idaho also has the Idaho Collection Agency Act (IC 26-22) that provides additional consumer protections. Credlocity complies with all federal and state regulations."},
         {"q": "How long does credit repair take in Boise?", "a": "Most Boise clients see their first results within 30-45 days. Full credit repair programs typically run 3-6 months depending on the number of inaccurate items. The average Boise client sees a 50-150 point score improvement during their program."},
         {"q": "Can Credlocity help me qualify for a Boise mortgage?", "a": "Absolutely. Many of our Boise clients come to us specifically to improve their credit scores for mortgage qualification. With Boise's median home price exceeding $450,000, even a small score improvement can save thousands in interest. We work to remove inaccurate negative items that are keeping your score below mortgage thresholds."},
         {"q": "What makes Credlocity different from other Boise credit repair companies?", "a": "Credlocity has been in business since 2008 with a 5.0-star rating across 79,000+ clients. We have Board Certified Credit Consultants, a 180-day money-back guarantee, and never charge upfront fees. We are the only credit repair company serving Boise with a physical Idaho presence and 17 years of proven results."},
         {"q": "Can Credlocity remove identity theft items from my Boise credit report?", "a": "Yes. We specialize in identity theft recovery using FCRA Section 605B to block fraudulent accounts. Boise has seen a 15% increase in identity theft reports since 2020. Credlocity helps you file the proper documentation and dispute all fraudulent accounts with the bureaus."},
         {"q": "What if I have student loan errors on my credit report?", "a": "Student loan reporting errors are increasingly common. Credlocity disputes inaccurate student loan information including wrong balances, duplicate accounts, incorrect payment histories, and accounts that should have been discharged. We ensure your student loans are reported accurately under FCRA guidelines."},
     ]},
    {"city": "Caldwell", "state": "ID", "slug": "credit-repair-caldwell", "path": "/credit-repair-caldwell",
     "headline": "Credit Repair Services in Caldwell, ID",
     "description": "Affordable, professional credit repair in Caldwell, Idaho. Serving Canyon County families from our local Idaho office, Credlocity helps Caldwell residents dispute inaccurate collections, late payments, and negative items under the FCRA, CROA, and FDCPA. With a growing population and rising costs of living, good credit is more important than ever for Caldwell families.",
     "use_idaho_office": True,
     "office_address": "964 W Idaho Ave, Ontario, OR 97914",
     "stats": {"population": "64,242", "metro_population": "786,738", "avg_credit_score": "678", "pct_subprime": "33%", "pct_with_collections": "29%", "median_income": "$48,125", "pct_with_debt": "71%", "avg_debt": "$47,600"},
     "reviews": [
         {"name": "Rosa G.", "location": "Caldwell, ID", "rating": 5, "text": "As a single mom in Caldwell, I thought I'd never fix my credit. Credlocity removed 6 collections and my score went from 498 to 645 in 5 months. I was able to get a car loan at a reasonable rate."},
         {"name": "James H.", "location": "Caldwell, ID", "rating": 5, "text": "Credlocity is the real deal. They got 4 late payments and 2 charge-offs removed from my report. Professional service and they kept me updated every step of the way."},
     ],
     "faqs": [
         {"q": "Does Credlocity serve Caldwell, Idaho?", "a": "Yes! Credlocity's Idaho office at 964 W Idaho Ave, Ontario, OR 97914 is just 25 minutes from Caldwell. We serve all of Canyon County including Caldwell, Nampa, Middleton, and surrounding communities with both in-person and remote consultations."},
         {"q": "Why is credit repair important for Caldwell residents?", "a": "Approximately 33% of Caldwell residents have subprime credit scores (below 670), and 29% have collections on their credit reports. With the Treasure Valley's growing economy, good credit is essential for housing, employment, and financial opportunities. Credlocity helps Caldwell families remove inaccurate negative items and rebuild their financial standing."},
         {"q": "What does credit repair cost in Caldwell?", "a": "Plans start at just $99.95/month with a 30-day free trial and 180-day money-back guarantee. Our Aggressive Package ($179.95/month) is the most popular choice for Caldwell clients seeking comprehensive credit repair across all three bureaus."},
         {"q": "Is credit repair legal in Caldwell, Idaho?", "a": "Absolutely. Credit repair is protected under federal law including the Fair Credit Reporting Act (FCRA), Credit Repair Organizations Act (CROA), and Fair Debt Collection Practices Act (FDCPA). Idaho's Collection Agency Act provides additional consumer protections."},
         {"q": "Can Credlocity help with medical debt collections in Caldwell?", "a": "Yes. Medical debt is a common issue in Caldwell. Under current rules, paid medical collections should not appear on credit reports, and unpaid medical debts under $500 may not be reported. We dispute all inaccurate medical collections and ensure bureaus comply with the latest regulations."},
         {"q": "How long does credit repair take for Caldwell residents?", "a": "Most clients see initial results within 30-45 days. Full programs typically run 3-6 months depending on the number and type of inaccurate items. Caldwell clients typically see score improvements of 50-150 points."},
         {"q": "What types of items can be removed from my credit report?", "a": "Credlocity disputes collections, late payments, charge-offs, hard inquiries, bankruptcies, repossessions, foreclosures, identity theft accounts, and any inaccurate, misleading, or unverifiable information. Every item on your report is analyzed under the FCRA for accuracy and compliance."},
         {"q": "Can I repair my credit while on a tight budget in Caldwell?", "a": "Yes. Our Fraud Package starts at just $99.95/month, and we offer a 30-day free trial so you can see results before paying. With Caldwell's median income of $48,125, we understand budget constraints and have designed our plans to be affordable while delivering real results."},
     ]},
    {"city": "Nampa", "state": "ID", "slug": "credit-repair-nampa", "path": "/credit-repair-nampa",
     "headline": "Credit Repair Services in Nampa, ID",
     "description": "Expert credit repair services in Nampa, Idaho. As the Treasure Valley's second-largest city with a population exceeding 108,000, Nampa families face unique credit challenges. Credlocity's certified consultants work from our local Idaho office to remove inaccurate collections, late payments, charge-offs, and identity theft items under the FCRA and CROA.",
     "use_idaho_office": True,
     "office_address": "964 W Idaho Ave, Ontario, OR 97914",
     "stats": {"population": "108,750", "metro_population": "786,738", "avg_credit_score": "683", "pct_subprime": "31%", "pct_with_collections": "27%", "median_income": "$53,285", "pct_with_debt": "70%", "avg_debt": "$51,300"},
     "reviews": [
         {"name": "Mike P.", "location": "Nampa, ID", "rating": 5, "text": "Credlocity removed 7 negative items from my credit report including collections I didn't even recognize. Score went from 545 to 689. Finally qualified for a conventional mortgage on a home in Nampa."},
         {"name": "Teresa A.", "location": "Nampa, ID", "rating": 5, "text": "Professional, thorough, and they actually care. Credlocity helped me recover from identity theft — removed all 9 fraudulent accounts in under 3 months. Highly recommend."},
     ],
     "faqs": [
         {"q": "Does Credlocity have a local office near Nampa?", "a": "Yes! Our Idaho office at 964 W Idaho Ave, Ontario, OR 97914 serves all of Canyon County including Nampa, Caldwell, Meridian, and surrounding areas. We offer both in-person and remote consultations for Nampa residents."},
         {"q": "Why do Nampa residents need credit repair?", "a": "With Nampa's rapid growth (population up 25% since 2015) and rising housing costs, many residents struggle with credit challenges. Approximately 31% of Nampa residents have subprime credit, and 27% have at least one collection on their credit report. Credit repair can remove inaccurate items and improve your score significantly."},
         {"q": "What can Credlocity remove from my Nampa credit report?", "a": "We dispute and remove inaccurate collections, late payments, charge-offs, hard inquiries, bankruptcies, repossessions, medical debt errors, student loan errors, identity theft accounts, and any information that violates the Fair Credit Reporting Act (FCRA)."},
         {"q": "How much does credit repair cost in Nampa?", "a": "Credlocity offers affordable plans from $99.95 to $279.95 per month. We include a 30-day free trial and a 180-day money-back guarantee. Most Nampa clients choose our Aggressive Package at $179.95/month for comprehensive three-bureau disputes."},
         {"q": "Is credit repair legal in Idaho?", "a": "Yes. Credit repair is fully legal under the Fair Credit Reporting Act (FCRA), Credit Repair Organizations Act (CROA), Fair Debt Collection Practices Act (FDCPA), and Idaho's Collection Agency Act. Credlocity complies with all federal and state regulations."},
         {"q": "How long does credit repair take for Nampa clients?", "a": "Most Nampa clients see initial results within 30-45 days. Full credit repair programs run 3-6 months. The average client sees 50-150 point improvements. Complex cases with identity theft or numerous inaccuracies may take longer."},
         {"q": "Can Credlocity help me get a car loan in Nampa?", "a": "Yes. Many Nampa clients come to us specifically to improve their credit for auto financing. Even a 50-point score increase can save you thousands in interest over the life of a car loan. We prioritize removing the items that have the biggest impact on your score."},
         {"q": "What rights do I have under the FCRA in Idaho?", "a": "Under the Fair Credit Reporting Act, you have the right to dispute any inaccurate information on your credit report. Bureaus must investigate within 30 days and remove items they cannot verify. You also have the right to a free credit report annually from each bureau, and you can freeze your credit to prevent identity theft."},
     ]},
    {"city": "Idaho Falls", "state": "ID", "slug": "credit-repair-idaho-falls", "path": "/credit-repair-idaho-falls",
     "headline": "Credit Repair Services in Idaho Falls, ID",
     "description": "Trusted credit repair services in Idaho Falls, Idaho. Serving eastern Idaho from our local office, Credlocity helps Idaho Falls residents remove inaccurate collections, late payments, charge-offs, and identity theft items from all three credit bureaus. With 17 years of experience and 79,000+ clients served, we are the trusted choice for Idaho Falls credit repair.",
     "use_idaho_office": True,
     "office_address": "964 W Idaho Ave, Ontario, OR 97914",
     "stats": {"population": "67,681", "metro_population": "155,922", "avg_credit_score": "696", "pct_subprime": "29%", "pct_with_collections": "24%", "median_income": "$55,764", "pct_with_debt": "67%", "avg_debt": "$49,800"},
     "reviews": [
         {"name": "Brandon S.", "location": "Idaho Falls, ID", "rating": 5, "text": "Living in Idaho Falls, I didn't think I could find quality credit repair. Credlocity proved me wrong. They removed 4 collections and 2 late payments. My score jumped from 561 to 688. Excellent remote service."},
         {"name": "Amanda C.", "location": "Ammon, ID", "rating": 5, "text": "Credlocity helped me clean up my credit after years of financial hardship. 6 negative items removed in 4 months. Their team is professional, patient, and really knows the FCRA inside and out."},
     ],
     "faqs": [
         {"q": "Can Credlocity help with credit repair in Idaho Falls?", "a": "Absolutely! Credlocity serves Idaho Falls and all of eastern Idaho from our Idaho office at 964 W Idaho Ave, Ontario, OR. We offer comprehensive credit repair services including bureau disputes, identity theft recovery, and credit score optimization through both remote and in-person consultations."},
         {"q": "What credit challenges do Idaho Falls residents face?", "a": "Approximately 29% of Idaho Falls residents have subprime credit scores, and 24% have at least one collection account. Common issues include medical debt collections, old late payments, student loan errors, and identity theft. Idaho Falls' growing economy means good credit is essential for housing and employment opportunities."},
         {"q": "How much does credit repair cost in Idaho Falls?", "a": "Plans range from $99.95 to $279.95 per month. Our most popular Aggressive Package is $179.95/month and includes comprehensive disputes with all three bureaus. Every plan includes a 30-day free trial and 180-day money-back guarantee."},
         {"q": "What laws protect Idaho Falls residents during credit repair?", "a": "Idaho Falls residents are protected by the Fair Credit Reporting Act (FCRA), Credit Repair Organizations Act (CROA), Fair Debt Collection Practices Act (FDCPA), Fair Credit Billing Act (FCBA), and Idaho's Collection Agency Act. These laws give you the right to dispute inaccurate information and hold bureaus accountable."},
         {"q": "How does the credit repair process work?", "a": "Step 1: We review your credit reports from all three bureaus. Step 2: We identify inaccurate, misleading, or unverifiable items. Step 3: We send legally compliant dispute letters to the bureaus. Step 4: Bureaus have 30 days to investigate and respond. Items they cannot verify must be removed. We repeat this process for all negative items."},
         {"q": "Can Credlocity help with bankruptcy credit repair in Idaho Falls?", "a": "Yes. While a bankruptcy stays on your report for 7-10 years, we can ensure it's reported accurately and dispute accounts included in the bankruptcy that still show as active. Many Idaho Falls clients see significant score improvements even with a bankruptcy on file through our comprehensive dispute process."},
         {"q": "What items can be removed from my Idaho Falls credit report?", "a": "We dispute collections, late payments, charge-offs, hard inquiries, bankruptcies, repossessions, foreclosures, tax liens, student loan errors, medical debt errors, identity theft accounts, and any inaccurate information. Every item is analyzed for FCRA compliance and dispute potential."},
         {"q": "How long does credit repair take in Idaho Falls?", "a": "Initial results typically appear within 30-45 days. Most Idaho Falls clients complete their programs in 3-6 months with score improvements of 50-150 points. The timeline depends on the number and complexity of inaccurate items on your report."},
     ]},
    {"city": "Twin Falls", "state": "ID", "slug": "credit-repair-twin-falls", "path": "/credit-repair-twin-falls",
     "headline": "Credit Repair Services in Twin Falls, ID",
     "description": "Professional credit repair in Twin Falls, Idaho and the Magic Valley region. Credlocity's certified credit consultants help Twin Falls residents remove inaccurate negative items from credit reports using FCRA-compliant dispute methods. From our local Idaho office, we serve all of south-central Idaho with proven, ethical credit repair services.",
     "use_idaho_office": True,
     "office_address": "964 W Idaho Ave, Ontario, OR 97914",
     "stats": {"population": "53,367", "metro_population": "114,464", "avg_credit_score": "692", "pct_subprime": "30%", "pct_with_collections": "25%", "median_income": "$51,837", "pct_with_debt": "69%", "avg_debt": "$46,500"},
     "reviews": [
         {"name": "Chris D.", "location": "Twin Falls, ID", "rating": 5, "text": "Credlocity is worth every penny. They removed 5 negative items from my report and my score went from 523 to 672. I can finally get approved for things I couldn't before. Thank you!"},
         {"name": "Jennifer M.", "location": "Jerome, ID", "rating": 5, "text": "I was skeptical about credit repair, but Credlocity delivered real results. 3 collections and 2 late payments gone in 3 months. My score improved by 89 points. Highly professional."},
     ],
     "faqs": [
         {"q": "Does Credlocity offer credit repair in Twin Falls?", "a": "Yes! Credlocity serves Twin Falls and the entire Magic Valley region from our Idaho office at 964 W Idaho Ave, Ontario, OR. We provide comprehensive credit repair services to Twin Falls, Jerome, Burley, Rupert, and surrounding communities."},
         {"q": "What credit problems are common in Twin Falls?", "a": "Approximately 30% of Twin Falls residents have subprime credit scores, and 25% carry at least one collection account. Common issues include medical debt from local hospitals, old collections from move-related bills, agricultural loan complications, and identity theft. Good credit repair can address all of these."},
         {"q": "How much does Credlocity charge in Twin Falls?", "a": "Plans start at $99.95/month with our Fraud Package. The most popular Aggressive Package is $179.95/month. The Family Package covers multiple family members at $279.95/month. All plans include a 30-day free trial and 180-day money-back guarantee."},
         {"q": "Is credit repair legal in Twin Falls, Idaho?", "a": "Yes. Credit repair is legal under federal law including the FCRA, CROA, and FDCPA. Idaho state law also provides consumer protections through the Collection Agency Act. Credlocity is fully compliant with all applicable laws and regulations."},
         {"q": "What items can Credlocity remove from my Twin Falls credit report?", "a": "We dispute and remove inaccurate collections, late payments, charge-offs, hard inquiries, bankruptcies, repossessions, medical debt errors, student loan errors, identity theft accounts, and any unverifiable information. Our consultants analyze each item for FCRA violations."},
         {"q": "How long does credit repair take in Twin Falls?", "a": "Most Twin Falls clients see results within 30-45 days of their first disputes. Full programs typically run 3-6 months with average score improvements of 50-150 points. Results vary based on the number of inaccurate items."},
         {"q": "Can I get credit repair to qualify for a home in Twin Falls?", "a": "Absolutely. With Twin Falls median home prices rising, a higher credit score means better mortgage rates and terms. Many of our Magic Valley clients start credit repair specifically to qualify for a mortgage. Even a 40-point improvement can make the difference between approval and denial."},
         {"q": "What should I know about debt collection in Idaho?", "a": "Idaho's statute of limitations on most debts is 5 years. Debt collectors must follow the FDCPA and cannot harass you, make false statements, or collect debts past the statute of limitations. If a collector violates these rules, Credlocity can help you take action and dispute the associated credit report entries."},
     ]},
    {"city": "Pocatello", "state": "ID", "slug": "credit-repair-pocatello", "path": "/credit-repair-pocatello",
     "headline": "Credit Repair Services in Pocatello, ID",
     "description": "Credit repair services in Pocatello, Idaho for Bannock County residents. Credlocity's Board Certified Credit Consultants help Pocatello families remove inaccurate collections, late payments, charge-offs, and identity theft items. Serving southeastern Idaho from our local office with FCRA, CROA, and FDCPA compliant methods.",
     "use_idaho_office": True,
     "office_address": "964 W Idaho Ave, Ontario, OR 97914",
     "stats": {"population": "57,182", "metro_population": "94,596", "avg_credit_score": "688", "pct_subprime": "31%", "pct_with_collections": "26%", "median_income": "$49,232", "pct_with_debt": "70%", "avg_debt": "$44,200"},
     "reviews": [
         {"name": "Tyler R.", "location": "Pocatello, ID", "rating": 5, "text": "I had terrible credit from medical bills and a repossession. Credlocity challenged everything and got 7 items removed. My score went from 489 to 631. Life-changing service for Pocatello residents."},
         {"name": "Maria L.", "location": "Chubbuck, ID", "rating": 5, "text": "Credlocity's team is incredible. They walked me through the entire process and removed 4 inaccurate collections. As a student at ISU, having better credit means everything for my future."},
     ],
     "faqs": [
         {"q": "Is Credlocity available for credit repair in Pocatello?", "a": "Yes! Credlocity serves Pocatello, Chubbuck, and all of Bannock County from our Idaho office at 964 W Idaho Ave, Ontario, OR. We offer both remote and in-person consultations for southeastern Idaho residents."},
         {"q": "What credit challenges do Pocatello residents face?", "a": "Approximately 31% of Pocatello residents have subprime credit scores, and 26% have collection accounts on their reports. With a large student population from Idaho State University, student loan errors and first-time credit issues are particularly common. Medical collections and identity theft are also significant challenges."},
         {"q": "How much does credit repair cost in Pocatello?", "a": "Credlocity offers plans starting at $99.95/month. Our most popular plan is the Aggressive Package at $179.95/month. The Family Package covers multiple family members at $279.95/month. All plans include a free 30-day trial and 180-day money-back guarantee — ideal for students and families on a budget."},
         {"q": "What laws protect me during credit repair in Idaho?", "a": "Pocatello residents are protected by the Fair Credit Reporting Act (FCRA), Credit Repair Organizations Act (CROA), Fair Debt Collection Practices Act (FDCPA), Fair Credit Billing Act (FCBA), and Idaho's Collection Agency Act. These laws ensure your right to accurate credit reporting and protection from predatory debt collection."},
         {"q": "Can Credlocity help ISU students with credit repair?", "a": "Absolutely. We help many Idaho State University students and recent graduates with credit repair, particularly for student loan reporting errors, identity theft, and first-time credit issues. Good credit is essential for post-graduation employment, apartment rentals, and car loans."},
         {"q": "How long does credit repair take in Pocatello?", "a": "Most Pocatello clients see initial results within 30-45 days. Full programs typically run 3-6 months with average score improvements of 50-150 points. Student loan dispute cases may take additional time due to servicer response requirements."},
         {"q": "What types of items can be removed from my credit report?", "a": "Credlocity disputes inaccurate collections, late payments, charge-offs, hard inquiries, bankruptcies, repossessions, foreclosures, medical debt errors, student loan errors, identity theft accounts, and any unverifiable items. Each item is analyzed for FCRA compliance."},
         {"q": "What is the FCRA and how does it help Pocatello residents?", "a": "The Fair Credit Reporting Act (FCRA) is the federal law that regulates how credit bureaus collect, use, and share your information. Under the FCRA, you have the right to dispute any inaccurate information, and bureaus must investigate within 30 days. Items they cannot verify must be removed. Credlocity leverages this law to protect your rights."},
     ]},
    {"city": "Atlanta", "state": "GA", "slug": "credit-repair-atlanta", "path": "/credit-repair-atlanta",
     "headline": "Credit Repair Services in Atlanta, GA",
     "description": "Top-rated credit repair in Atlanta, Georgia. Credlocity has served the Atlanta metro area since 2008, helping residents across Fulton, DeKalb, Gwinnett, and Cobb counties remove inaccurate collections, late payments, charge-offs, and identity theft items. With Atlanta's population exceeding 500,000 (metro 6.2 million), credit challenges are widespread — and Credlocity's FCRA-certified team delivers proven results.",
     "use_idaho_office": False,
     "office_address": "1500 Chestnut Street, Suite 2, Philadelphia, PA 19102",
     "stats": {"population": "510,823", "metro_population": "6,230,854", "avg_credit_score": "674", "pct_subprime": "38%", "pct_with_collections": "32%", "median_income": "$65,345", "pct_with_debt": "74%", "avg_debt": "$72,400"},
     "reviews": [
         {"name": "Keisha W.", "location": "Atlanta, GA", "rating": 5, "text": "Credlocity changed my life. I had 9 collections from medical bills and old credit cards. They disputed all of them and 7 were removed completely. My score went from 478 to 648. I'm now looking at homes in Buckhead!"},
         {"name": "Andre J.", "location": "Decatur, GA", "rating": 5, "text": "After years of struggling with bad credit in Atlanta, Credlocity was the answer. They removed 5 late payments and 3 charge-offs in just 4 months. Professional, knowledgeable, and worth every penny."},
         {"name": "Patricia H.", "location": "Marietta, GA", "rating": 5, "text": "I was a victim of identity theft and my credit was destroyed. Credlocity used the FCRA 605B block to remove all fraudulent accounts. My score went from 390 to 612 in 5 months. Outstanding service."},
     ],
     "faqs": [
         {"q": "What credit repair services does Credlocity offer in Atlanta?", "a": "Credlocity provides comprehensive credit repair for Atlanta residents including three-bureau dispute services, collection removal, late payment disputes, charge-off removal, hard inquiry removal, identity theft recovery under FCRA Section 605B, bankruptcy credit repair, and ongoing credit monitoring. Our Board Certified Credit Consultants create personalized strategies for each Atlanta client."},
         {"q": "Why do Atlanta residents struggle with credit?", "a": "Atlanta has a higher-than-average rate of subprime credit — approximately 38% of residents have scores below 670. Contributing factors include high medical costs, aggressive debt collection practices, widespread identity theft (Atlanta ranks in the top 10 cities for identity theft), and economic inequality. Credlocity addresses all of these credit challenges."},
         {"q": "How long does credit repair take in Atlanta?", "a": "Most Atlanta clients see initial results within 30-45 days after the first round of bureau disputes. Full credit repair programs typically run 3-6 months depending on the number and complexity of inaccurate items. Atlanta clients average 50-150 point score improvements."},
         {"q": "Is credit repair legal in Georgia?", "a": "Yes. Credit repair is fully legal under the Fair Credit Reporting Act (FCRA), Credit Repair Organizations Act (CROA), Fair Debt Collection Practices Act (FDCPA), and Georgia's Fair Business Practices Act. Georgia also has specific debt collection statutes (O.C.G.A. 7-3). Credlocity is fully compliant with all federal and Georgia state regulations."},
         {"q": "How much does credit repair cost in Atlanta?", "a": "Credlocity offers three affordable plans: Fraud Package at $99.95/month, Aggressive Package at $179.95/month (most popular for Atlanta clients), and Family Package at $279.95/month. All plans include a 30-day free trial and 180-day money-back guarantee. We never charge upfront fees."},
         {"q": "Can Credlocity help me qualify for a mortgage in Atlanta?", "a": "Absolutely. With Atlanta's median home price exceeding $380,000, credit score directly impacts your mortgage rate and purchasing power. A 50-point score improvement can save you $50,000+ in interest over a 30-year mortgage. We prioritize removing items that have the biggest impact on your mortgage eligibility."},
         {"q": "What types of negative items can be removed from my Atlanta credit report?", "a": "We dispute and remove inaccurate collections, late payments, charge-offs, bankruptcies, repossessions, foreclosures, hard inquiries, tax liens, medical debt errors, student loan errors, identity theft accounts, and any unverifiable information on your Equifax, Experian, and TransUnion reports."},
         {"q": "Does Credlocity help with identity theft recovery in Atlanta?", "a": "Yes. Atlanta ranks among the top 10 U.S. cities for identity theft. Credlocity specializes in identity theft recovery using FCRA Section 605B blocks, fraud alerts, credit freezes, and comprehensive dispute strategies. We help you reclaim your credit identity and remove all fraudulent accounts."},
         {"q": "What is the statute of limitations on debt in Georgia?", "a": "Georgia's statute of limitations on most debts is 6 years from the date of last payment. Debt collectors cannot sue for debts past this period. However, the debt may still appear on your credit report for up to 7 years. Credlocity ensures all time-barred debts are reported accurately and disputes any violations."},
         {"q": "Can I fix my credit after bankruptcy in Atlanta?", "a": "Yes. Many Atlanta clients come to us after bankruptcy. While the bankruptcy itself stays on your report for 7-10 years, we ensure it's reported accurately and dispute accounts that should show $0 balance or 'included in bankruptcy.' Many post-bankruptcy clients see significant improvements."},
     ]},
    {"city": "New York", "state": "NY", "slug": "credit-repair-new-york", "path": "/credit-repair-new-york",
     "headline": "Credit Repair Services in New York, NY",
     "description": "Credlocity provides professional credit repair services in New York City and throughout New York State. With NYC's population exceeding 8.3 million and some of the highest living costs in the nation, millions of New Yorkers face credit challenges. Our FCRA-certified team has helped 79,000+ clients nationwide since 2008, delivering proven results for Manhattan, Brooklyn, Queens, Bronx, and Staten Island residents.",
     "use_idaho_office": False,
     "office_address": "1500 Chestnut Street, Suite 2, Philadelphia, PA 19102",
     "stats": {"population": "8,336,817", "metro_population": "20,140,470", "avg_credit_score": "692", "pct_subprime": "33%", "pct_with_collections": "27%", "median_income": "$70,663", "pct_with_debt": "76%", "avg_debt": "$93,800"},
     "reviews": [
         {"name": "Michelle T.", "location": "Brooklyn, NY", "rating": 5, "text": "Credlocity removed 11 negative items from my credit report in 5 months. My score went from 502 to 714. I was finally able to rent an apartment in Park Slope without a guarantor. Game changer!"},
         {"name": "Robert K.", "location": "Queens, NY", "rating": 5, "text": "As a small business owner in Queens, my credit was holding me back. Credlocity disputed old collections and charge-offs — 8 items removed. My business credit improved too. Exceptional service."},
         {"name": "Daniela S.", "location": "Manhattan, NY", "rating": 5, "text": "Identity theft wrecked my credit while living in the city. Credlocity filed the 605B blocks and disputed every fraudulent account. 6 months later, my score went from 410 to 650. I can't thank them enough."},
     ],
     "faqs": [
         {"q": "Can I get credit repair in New York City?", "a": "Yes! Credlocity serves all five boroughs of New York City (Manhattan, Brooklyn, Queens, Bronx, Staten Island) as well as Long Island, Westchester, and the entire state of New York. Our services are available remotely with phone and video consultations, making professional credit repair accessible to all New Yorkers."},
         {"q": "Why do New York City residents need credit repair?", "a": "NYC has unique credit challenges: approximately 33% of residents have subprime credit scores, landlords run credit checks for apartment rentals, and the high cost of living leads to medical and consumer debt. With average debt of $93,800 per resident and aggressive debt collection, many New Yorkers benefit from professional credit repair."},
         {"q": "How much does credit repair cost in New York?", "a": "Credlocity offers affordable plans: Fraud Package at $99.95/month, Aggressive Package at $179.95/month (most popular), and Family Package at $279.95/month. All plans include a 30-day free trial and 180-day money-back guarantee. Unlike many NYC credit repair companies, we never charge upfront fees."},
         {"q": "What consumer protections exist in New York for credit repair?", "a": "New York residents are protected by federal laws (FCRA, CROA, FDCPA, FCBA) and New York General Business Law Article 28-CC which specifically regulates credit repair services in the state. New York also has strong consumer protection through the Attorney General's office and the NYC Department of Consumer and Worker Protection."},
         {"q": "How long does credit repair take in New York?", "a": "Most NYC clients see initial results within 30-45 days. Full programs typically run 3-6 months with average score improvements of 50-150 points. Complex cases involving identity theft or numerous inaccuracies may take longer."},
         {"q": "Can Credlocity help me pass a NYC landlord credit check?", "a": "Absolutely. NYC landlords typically require credit scores of 650-700+ for apartment approval. Credlocity helps remove inaccurate negative items that are keeping your score below these thresholds. Many clients improve their scores enough to rent without a guarantor or extra deposit."},
         {"q": "What items can Credlocity remove from my New York credit report?", "a": "We dispute and remove inaccurate collections, late payments, charge-offs, hard inquiries, bankruptcies, foreclosures, repossessions, medical debt errors, student loan errors, identity theft accounts, utility collections, and any unverifiable information. Each item is analyzed under the FCRA."},
         {"q": "Does Credlocity help with identity theft in New York?", "a": "Yes. New York is one of the highest states for identity theft. Credlocity uses FCRA Section 605B to block fraudulent accounts, files fraud alerts and credit freezes, and disputes all unauthorized entries on your credit reports. We handle the entire recovery process from documentation to bureau disputes."},
         {"q": "What is the statute of limitations on debt in New York?", "a": "New York's statute of limitations on most consumer debts was reduced from 6 years to 3 years in 2021 under the Consumer Credit Fairness Act. This is one of the shortest in the nation. Debt collectors cannot sue for time-barred debts. Credlocity ensures time-barred debts are reported accurately on your credit report."},
         {"q": "Can credit repair help my New York small business?", "a": "Yes. Many NYC small business owners have personal credit issues that affect business financing. Credlocity repairs your personal credit, which directly impacts your ability to get business loans, lines of credit, and vendor terms. Improving your personal score can unlock better business financing options."},
     ]},
    {"city": "Trenton", "state": "NJ", "slug": "credit-repair-trenton", "path": "/credit-repair-trenton",
     "headline": "Credit Repair Services in Trenton, NJ",
     "description": "Expert credit repair in Trenton, New Jersey and the greater Central NJ area. Credlocity's Board Certified Credit Consultants help Trenton and Mercer County residents remove inaccurate collections, late payments, charge-offs, and identity theft items. As New Jersey's capital city, Trenton residents face unique credit challenges that professional, FCRA-compliant credit repair can solve.",
     "use_idaho_office": False,
     "office_address": "1500 Chestnut Street, Suite 2, Philadelphia, PA 19102",
     "stats": {"population": "90,871", "metro_population": "387,340", "avg_credit_score": "671", "pct_subprime": "39%", "pct_with_collections": "34%", "median_income": "$37,209", "pct_with_debt": "73%", "avg_debt": "$58,600"},
     "reviews": [
         {"name": "Tony M.", "location": "Trenton, NJ", "rating": 5, "text": "Credlocity removed 6 collections and 4 late payments from my report. My score went from 485 to 652 in just 5 months. As a state employee in Trenton, having good credit matters. Thank you Credlocity!"},
         {"name": "Shaniqua B.", "location": "Ewing, NJ", "rating": 5, "text": "I had medical collections from St. Francis that shouldn't have been on my report. Credlocity disputed every one and they were all removed in under 60 days. Professional and fast."},
         {"name": "Frank R.", "location": "Hamilton, NJ", "rating": 5, "text": "After years of ignoring my credit, Credlocity helped me take control. 8 negative items removed, score up 134 points. Now I'm looking at buying a house in Hamilton instead of renting."},
     ],
     "faqs": [
         {"q": "Does Credlocity serve Trenton, New Jersey?", "a": "Yes! Credlocity serves Trenton and all of Mercer County including Ewing, Hamilton, Lawrence, Princeton, and surrounding communities. Our Philadelphia office is just 35 minutes from Trenton. We offer both in-person and remote consultations for Central New Jersey residents."},
         {"q": "Why do Trenton residents need credit repair?", "a": "Trenton has one of the highest rates of subprime credit in the region — approximately 39% of residents have scores below 670 and 34% have collections on their reports. With a median income of $37,209, many Trenton residents struggle with medical collections, utility bills, and consumer debt. Professional credit repair can remove inaccurate items and rebuild credit standing."},
         {"q": "How much does credit repair cost in Trenton?", "a": "Credlocity offers affordable plans: Fraud Package at $99.95/month, Aggressive Package at $179.95/month (most popular), and Family Package at $279.95/month. All plans include a 30-day free trial and 180-day money-back guarantee. We understand Trenton's economic challenges and have priced our services to be accessible."},
         {"q": "What New Jersey laws protect me during credit repair?", "a": "Trenton residents are protected by federal laws (FCRA, CROA, FDCPA, FCBA) and New Jersey's Consumer Fraud Act (N.J.S.A. 56:8-1). New Jersey also has the Debt Collection Licensing Act and strong consumer protection through the Division of Consumer Affairs. Credlocity is fully compliant with all regulations."},
         {"q": "How long does credit repair take in Trenton?", "a": "Most Trenton clients see initial results within 30-45 days. Full programs typically run 3-6 months depending on the number and complexity of inaccurate items. The average Trenton client sees score improvements of 50-150 points."},
         {"q": "Can Credlocity help with NJ medical debt on my credit report?", "a": "Yes. Medical debt is a major issue in Trenton. Under updated credit reporting rules, paid medical collections should not appear on your credit report, and unpaid medical debts under $500 may not be reported. Credlocity disputes all inaccurate medical collections and ensures compliance with the latest rules."},
         {"q": "What types of negative items can be removed?", "a": "We dispute and remove inaccurate collections, late payments, charge-offs, hard inquiries, bankruptcies, repossessions, foreclosures, medical debt errors, student loan errors, identity theft accounts, utility collections, and any unverifiable information on your credit reports."},
         {"q": "What is the statute of limitations on debt in New Jersey?", "a": "New Jersey's statute of limitations on most consumer debts is 6 years. After this period, creditors cannot sue you for the debt. However, the debt may still appear on your credit report for up to 7 years from the date of first delinquency. Credlocity ensures all debts are reported accurately and disputes any time-barred violations."},
         {"q": "Can credit repair help me get a job in Trenton?", "a": "Yes. While New Jersey limits how employers can use credit reports (employers cannot check credit for most jobs under NJ law), some government and financial positions in Trenton still require credit checks. Credlocity improves your overall credit profile, which benefits all areas of your financial life."},
         {"q": "How is Credlocity different from other credit repair companies near Trenton?", "a": "Credlocity has been in business since 2008 with a perfect 5.0-star rating across 79,000+ clients. We have Board Certified Credit Consultants, a 180-day money-back guarantee, and never charge upfront fees before work is completed. Our Philadelphia office is just 35 minutes from Trenton, giving Central NJ residents convenient access to personalized service."},
     ]},
]


@seo_router.get("/local-pages")
async def list_local_pages(authorization: Optional[str] = Header(None)):
    """Admin endpoint — list all local landing pages."""
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    pages = await db.local_landing_pages.find({}, {"_id": 0}).sort("city", 1).to_list(None)
    return {"pages": pages, "total": len(pages)}


@seo_router.get("/local-pages/public")
async def list_public_local_pages():
    """Public endpoint — list published local landing pages for sitemap/nav."""
    pages = await db.local_landing_pages.find({"status": "published"}, {"_id": 0}).sort("city", 1).to_list(None)
    return {"pages": pages}


@seo_router.get("/local-pages/{page_id}")
async def get_local_page(page_id: str, authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    page = await db.local_landing_pages.find_one({"id": page_id}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page


@seo_router.get("/local-pages/by-slug/{slug}")
async def get_local_page_by_slug(slug: str):
    """Public endpoint — get a local landing page by slug."""
    page = await db.local_landing_pages.find_one({"slug": slug, "status": "published"}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page


@seo_router.post("/local-pages")
async def create_local_page(data: dict, authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    page_id = str(uuid.uuid4())
    slug = data.get("slug", "").strip() or data.get("city", "").lower().replace(" ", "-")
    slug = f"credit-repair-{slug}" if not slug.startswith("credit-repair-") else slug
    path = f"/{slug}"

    page = {
        "id": page_id,
        "city": data.get("city", ""),
        "state": data.get("state", ""),
        "slug": slug,
        "path": path,
        "headline": data.get("headline", ""),
        "description": data.get("description", ""),
        "content": data.get("content", ""),
        "meta_title": data.get("meta_title", ""),
        "meta_description": data.get("meta_description", ""),
        "keywords": data.get("keywords", ""),
        "faqs": data.get("faqs", []),
        "services": data.get("services", []),
        "status": data.get("status", "draft"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "updated_by": user.get("email", ""),
    }

    await db.local_landing_pages.insert_one(page)
    page.pop("_id", None)
    return page


@seo_router.put("/local-pages/{page_id}")
async def update_local_page(page_id: str, data: dict, authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    existing = await db.local_landing_pages.find_one({"id": page_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Page not found")

    slug = data.get("slug", existing.get("slug", ""))
    path = f"/{slug}" if not slug.startswith("/") else slug

    update = {
        "city": data.get("city", existing.get("city", "")),
        "state": data.get("state", existing.get("state", "")),
        "slug": slug,
        "path": path,
        "headline": data.get("headline", existing.get("headline", "")),
        "description": data.get("description", existing.get("description", "")),
        "content": data.get("content", existing.get("content", "")),
        "meta_title": data.get("meta_title", existing.get("meta_title", "")),
        "meta_description": data.get("meta_description", existing.get("meta_description", "")),
        "keywords": data.get("keywords", existing.get("keywords", "")),
        "faqs": data.get("faqs", existing.get("faqs", [])),
        "services": data.get("services", existing.get("services", [])),
        "status": data.get("status", existing.get("status", "draft")),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "updated_by": user.get("email", ""),
    }

    await db.local_landing_pages.update_one({"id": page_id}, {"$set": update})
    return {**update, "id": page_id}


@seo_router.delete("/local-pages/{page_id}")
async def delete_local_page(page_id: str, authorization: Optional[str] = Header(None)):
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    result = await db.local_landing_pages.delete_one({"id": page_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    return {"deleted": True}


@seo_router.post("/local-pages/seed")
async def seed_local_pages(authorization: Optional[str] = Header(None), force: bool = False):
    """Admin endpoint — seed the default set of local landing pages. Use force=true to reseed existing."""
    user = await _get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    seeded = 0
    updated = 0
    for city_data in LOCAL_CITIES_SEED:
        city_slug = city_data["slug"]
        city_lower = city_data["city"].lower()

        page_data = {
            **city_data,
            "content": "",
            "meta_title": f"{city_data['headline']} | Credlocity",
            "meta_description": city_data["description"][:160],
            "keywords": f"credit repair {city_data['city']}, credit repair {city_data['state']}, {city_data['city']} credit repair services, best credit repair {city_lower}, credit score improvement {city_lower}, FCRA credit repair {city_lower}, credit report errors {city_lower}",
            "services": [
                "Credit Report Error Disputes",
                "Collection Account Removal",
                "Late Payment Removal",
                "Charge-Off Disputes",
                "Hard Inquiry Removal",
                "Identity Theft Recovery",
                "Bankruptcy Credit Repair",
                "Credit Score Optimization",
                "Medical Debt Dispute",
                "Student Loan Error Correction",
                "Repossession Record Removal",
                "Foreclosure Dispute",
            ],
            "status": "published",
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "updated_by": user.get("email", ""),
        }

        exists = await db.local_landing_pages.find_one({"slug": city_slug})
        if exists and force:
            await db.local_landing_pages.update_one({"slug": city_slug}, {"$set": page_data})
            updated += 1
        elif not exists:
            page_data["id"] = str(uuid.uuid4())
            page_data["created_at"] = datetime.now(timezone.utc).isoformat()
            await db.local_landing_pages.insert_one(page_data)
            seeded += 1

    return {"seeded": seeded, "updated": updated, "total": len(LOCAL_CITIES_SEED)}
