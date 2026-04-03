"""
Schema.org JSON-LD Generator for SEO
Automatically generates structured data for Google
"""
from datetime import datetime
from typing import Dict, List, Optional
import json


def generate_article_schema(post: dict, site_settings: dict = None, base_url: str = "https://credlocity.com") -> dict:
    """
    Generate Article or BlogPosting schema
    https://schema.org/Article
    """
    # Determine article type
    article_type = "NewsArticle" if post.get("is_news") else "BlogPosting"
    
    # Build schema
    schema = {
        "@context": "https://schema.org",
        "@type": article_type,
        "headline": post.get("title", ""),
        "description": post.get("excerpt", ""),
        "url": f"{base_url}/blog/{post.get('slug', '')}",
        "datePublished": post.get("publish_date", post.get("created_at", "")),
        "dateModified": post.get("updated_at", ""),
        "author": generate_author_schema(post, site_settings, base_url),
        "publisher": generate_organization_schema(site_settings, base_url)
    }
    
    # Add image if available
    if post.get("featured_image_url"):
        schema["image"] = {
            "@type": "ImageObject",
            "url": post["featured_image_url"],
            "width": 1200,
            "height": 630
        }
    
    # Add keywords from SEO
    if post.get("seo") and post["seo"].get("keywords"):
        keywords = post["seo"]["keywords"]
        if isinstance(keywords, list):
            schema["keywords"] = ", ".join(keywords)
        else:
            schema["keywords"] = keywords
    
    # Add categories
    if post.get("categories"):
        schema["articleSection"] = post["categories"]
    
    # Add word count if available
    if post.get("content"):
        word_count = len(post["content"].split())
        schema["wordCount"] = word_count
    
    # Add updates/corrections if present
    if post.get("updates") and len(post["updates"]) > 0:
        # Add correction/update information
        critical_updates = [u for u in post["updates"] if u.get("type") == "critical_update"]
        if critical_updates:
            schema["correction"] = []
            for update in critical_updates:
                schema["correction"].append({
                    "@type": "CorrectionComment",
                    "text": update.get("explanation", ""),
                    "datePublished": update.get("date", "")
                })
    
    # Add disclosures to schema (for transparency & E-E-A-T)
    disclosures = post.get("disclosures", {})
    if disclosures and isinstance(disclosures, dict):
        disclosure_text = []
        
        # YMYL disclosure
        if disclosures.get("ymyl_enabled") and disclosures.get("ymyl_content"):
            disclosure_text.append(f"YMYL Content Notice: {disclosures['ymyl_content'][:200]}...")
        
        # Competitor disclosure
        if disclosures.get("competitor_disclosure_enabled") and disclosures.get("competitor_disclosure_content"):
            disclosure_text.append(f"Competitor Disclosure: {disclosures['competitor_disclosure_content'][:200]}...")
        
        # Corrections policy
        if disclosures.get("corrections_enabled") and disclosures.get("corrections_content"):
            disclosure_text.append(f"Corrections Policy: {disclosures['corrections_content'][:200]}...")
        
        # Pseudonym/source protection
        if disclosures.get("pseudonym_enabled"):
            disclosure_text.append("Source Protection: Some names have been changed to protect privacy.")
        
        if disclosure_text:
            schema["abstract"] = " | ".join(disclosure_text)
            schema["isAccessibleForFree"] = True
            schema["isPartOf"] = {
                "@type": "WebSite",
                "name": "Credlocity",
                "url": base_url
            }
    
    # Add reference to pricing page if mentioned
    schema["offers"] = {
        "@type": "AggregateOffer",
        "url": f"{base_url}/pricing",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
    }
    
    return schema


def generate_author_schema(post: dict, site_settings: dict = None, base_url: str = "https://credlocity.com") -> dict:
    """
    Generate Person schema for author (uses full author profile data)
    https://schema.org/Person
    """
    author = {
        "@type": "Person",
        "name": post.get("author_name", "Credlocity Team"),
        "url": f"{base_url}/team/{post.get('author_slug', '')}"
    }
    
    # Add job title
    if post.get("author_title"):
        author["jobTitle"] = post["author_title"]
    
    # Add credentials (awards/certifications)
    if post.get("author_credentials") and len(post["author_credentials"]) > 0:
        author["award"] = post["author_credentials"]
    
    # Add experience & bio
    if post.get("author_experience"):
        author["yearsExperience"] = post["author_experience"]
    
    if post.get("author_bio"):
        author["description"] = post["author_bio"]
    
    # Add education
    if post.get("author_education") and len(post["author_education"]) > 0:
        author["alumniOf"] = []
        for edu in post["author_education"]:
            if isinstance(edu, dict):
                author["alumniOf"].append({
                    "@type": "EducationalOrganization",
                    "name": edu.get("institution", ""),
                    "description": edu.get("degree", "")
                })
    
    # Add publications/media features
    if post.get("author_publications") and len(post["author_publications"]) > 0:
        author["sameAs"] = []
        for pub in post["author_publications"]:
            if isinstance(pub, dict) and pub.get("url"):
                author["sameAs"].append(pub["url"])
    
    # Add photo
    if post.get("author_photo_url"):
        author["image"] = {
            "@type": "ImageObject",
            "url": post["author_photo_url"]
        }
    
    # Add author's affiliation (organization from site settings)
    if site_settings:
        org_name = site_settings.get("organization_name", "Credlocity")
        author["worksFor"] = {
            "@type": "Organization",
            "name": org_name,
            "url": base_url
        }
    
    return author


def generate_breadcrumb_schema(post: dict, base_url: str = "https://credlocity.com") -> dict:
    """
    Generate BreadcrumbList schema
    https://schema.org/BreadcrumbList
    """
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": base_url
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": f"{base_url}/blog"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": post.get("title", ""),
                "item": f"{base_url}/blog/{post.get('slug', '')}"
            }
        ]
    }


def generate_faq_schema(faqs: List[dict]) -> dict:
    """
    Generate FAQPage schema
    https://schema.org/FAQPage
    """
    if not faqs:
        return None
    
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": faq.get("question", ""),
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.get("answer", "")
                }
            }
            for faq in faqs
        ]
    }


def generate_webpage_schema(page_data: dict, base_url: str = "https://credlocity.com") -> dict:
    """
    Generate WebPage schema
    https://schema.org/WebPage
    """
    return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": page_data.get("title", ""),
        "description": page_data.get("description", ""),
        "url": page_data.get("url", base_url),
        "publisher": {
            "@type": "Organization",
            "name": "Credlocity",
            "url": base_url
        }
    }


def generate_organization_schema(site_settings: dict = None, base_url: str = "https://credlocity.com") -> dict:
    """
    Generate Organization schema (pulls from site settings)
    https://schema.org/Organization
    """
    if not site_settings:
        # Fallback if no settings provided
        return {
            "@type": "Organization",
            "name": "Credlocity",
            "url": base_url,
            "logo": {
                "@type": "ImageObject",
                "url": f"{base_url}/logo.png"
            }
        }
    
    org_schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": site_settings.get("organization_name", "Credlocity"),
        "url": base_url,
        "description": site_settings.get("default_meta_description", "Credit Repair and Financial Education"),
        "foundingDate": "2008"
    }
    
    # Add logo
    logo_url = site_settings.get("organization_logo") or site_settings.get("logo_url")
    if logo_url:
        org_schema["logo"] = {
            "@type": "ImageObject",
            "url": logo_url if logo_url.startswith("http") else f"{base_url}{logo_url}"
        }
    
    # Add contact information
    if site_settings.get("organization_phone"):
        org_schema["telephone"] = site_settings["organization_phone"]
    
    if site_settings.get("organization_email"):
        org_schema["email"] = site_settings["organization_email"]
    
    # Add address
    address = site_settings.get("organization_address")
    if address and isinstance(address, dict):
        org_schema["address"] = {
            "@type": "PostalAddress",
            "streetAddress": address.get("street", ""),
            "addressLocality": address.get("city", ""),
            "addressRegion": address.get("state", ""),
            "postalCode": address.get("zip", ""),
            "addressCountry": address.get("country", "US")
        }
    
    # Add social media profiles
    social = site_settings.get("social_profiles", {})
    if social and isinstance(social, dict):
        same_as = []
        for platform, url in social.items():
            if url:
                same_as.append(url)
        if same_as:
            org_schema["sameAs"] = same_as
    
    return org_schema


def generate_all_schemas(post: dict, site_settings: dict = None, include_faq: bool = False, faqs: List[dict] = None) -> str:
    """
    Generate all applicable schemas for a blog post
    Returns JSON-LD script tag content as array
    """
    schemas = []
    
    # Article schema (required)
    schemas.append(generate_article_schema(post, site_settings))
    
    # Author schema (separate for viewing/editing)
    if post.get("author_name"):
        schemas.append(generate_author_schema(post, site_settings))
    
    # Organization schema (separate for viewing/editing)
    if site_settings:
        schemas.append(generate_organization_schema(site_settings))
    
    # Breadcrumb schema
    schemas.append(generate_breadcrumb_schema(post))
    
    # FAQ schema if applicable
    if include_faq and faqs:
        faq_schema = generate_faq_schema(faqs)
        if faq_schema:
            schemas.append(faq_schema)
    
    # Return as JSON string for script tag
    return json.dumps(schemas, indent=2, ensure_ascii=False)


def validate_schema(schema: dict) -> tuple[bool, str]:
    """
    Basic validation of schema structure
    Returns (is_valid, error_message)
    """
    try:
        # Check required fields
        if "@context" not in schema:
            return False, "Missing @context"
        if "@type" not in schema:
            return False, "Missing @type"
        
        # Validate it's valid JSON
        json.dumps(schema)
        
        return True, "Valid"
    except Exception as e:
        return False, str(e)



def generate_pricing_schema(pricing_data: List[dict], site_settings: dict = None, base_url: str = "https://credlocity.com") -> dict:
    """
    Generate schema for pricing/service offerings
    Uses Product + Offer pattern for each pricing plan
    https://schema.org/Product
    https://schema.org/Offer
    """
    offers = []
    
    for plan in pricing_data:
        # Create an Offer for each plan
        offer = {
            "@type": "Offer",
            "name": plan.get("name", ""),
            "price": plan.get("price", "").replace("$", "").replace(",", ""),
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "url": f"{base_url}/pricing",
            "priceValidUntil": "2025-12-31",
            "seller": generate_organization_schema(site_settings, base_url)
        }
        
        # Add trial period if available
        if plan.get("trial"):
            offer["eligibleDuration"] = {
                "@type": "QuantitativeValue",
                "value": plan.get("trial_days", 30),
                "unitCode": "DAY"
            }
        
        # Add description from features
        if plan.get("features"):
            offer["description"] = ", ".join(plan["features"][:5])  # First 5 features
        
        offers.append(offer)
    
    # Create the main Service schema with multiple offers
    schema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": "Credit Repair Service",
        "name": "Credlocity Credit Repair Plans",
        "description": "Professional credit repair services with transparent pricing and no hidden fees",
        "provider": generate_organization_schema(site_settings, base_url),
        "areaServed": {
            "@type": "Country",
            "name": "United States"
        },
        "offers": offers
    }
    
    # Add aggregate offer info
    prices = [float(plan.get("price", "0").replace("$", "").replace(",", "")) for plan in pricing_data if plan.get("price")]
    if len(prices) > 1:
        schema["offers"] = {
            "@type": "AggregateOffer",
            "priceCurrency": "USD",
            "lowPrice": min(prices),
            "highPrice": max(prices),
            "offerCount": len(pricing_data),
            "offers": offers
        }
    
    return schema



# ============ MERGED FROM PART59 - SEO API SUPPORT ============
"""
Global Schema Generator
Auto-generates JSON-LD structured data for every page with Credlocity business info.
"""

# ==================== COMPANY CONSTANTS ====================

COMPANY = {
    "name": "Credlocity Business Group LLC",
    "alternateName": ["Credlocity", "Ficostar Credit Services"],
    "foundingDate": "2008",
    "description": "Professional credit repair services compliant with FCRA, CROA, and TSR. Hispanic-owned, Minority-owned, Women-owned, LGBTQAI+-owned business serving 79,000+ clients since 2008 across all 50 states.",
    "url": "https://www.credlocity.com",
    "telephone": "",
    "email": "admin@credlocity.com",
    "priceRange": "$99.95 - $279.95/month",
    "logo": "https://static.wixstatic.com/media/bed107_4cbc9d8e58b44e6f9a5a451be0a52b4a~mv2.png/v1/fill/w_170,h_172,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/bed107_4cbc9d8e58b44e6f9a5a451be0a52b4a~mv2.png",
    "logoWidth": 170,
    "logoHeight": 172,
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "1500 Chestnut Street, Suite 2",
        "addressLocality": "Philadelphia",
        "addressRegion": "PA",
        "postalCode": "19102",
        "addressCountry": "US"
    },
    "geo": {
        "@type": "GeoCoordinates",
        "latitude": 39.9519,
        "longitude": -75.1656
    },
    "sameAs": [
        "https://www.linkedin.com/company/credlocity/",
        "https://x.com/credlocity",
        "https://www.instagram.com/credlocity",
        "https://www.facebook.com/Credlocity/",
        "https://www.threads.com/@credlocity",
        "https://bsky.app/profile/credlocity.bsky.social",
        "https://www.youtube.com/@Credlocity",
        "https://share.google/DPl9SYiffQsFVIV92"
    ],
    "keywords": "credit repair, credit repair services, FCRA, FDCPA, CROA, credit score improvement, dispute letters, credit report errors, debt collection, consumer protection"
}

AUTHOR = {
    "name": "Joeziel Vazquez",
    "alternateName": "Joeziel Joey Vazquez",
    "jobTitle": "CEO & Board Certified Credit Consultant",
    "url": "https://www.credlocity.com/credlocity-about-us-philadelphia-credit-repair-joeziel-vazquez",
    "email": "admin@credlocity.com",
    "telephone": "",
    "image": "https://static.wixstatic.com/media/bed107_e06e7a7f49e94144b9ff72ad6634af9f~mv2.jpg/v1/fill/w_836,h_2048,al_c,q_85,enc_avif,quality_auto/bed107_e06e7a7f49e94144b9ff72ad6634af9f~mv2.jpg",
    "imageWidth": 836,
    "imageHeight": 2048,
    "sameAs": [
        "https://www.linkedin.com/in/mrcreditguru/",
        "https://joezieljoeyvazquezdavila.link/"
    ],
    "description": "CEO and founder of Credlocity Business Group LLC with 17 years of experience in consumer credit and finance. Former victim of credit repair fraud by Lexington Law in 2008, which inspired him to establish Credlocity as an ethical alternative. Conducts investigative journalism since 2019 exposing credit repair fraud and advocating for consumer protection.",
    "certifications": [
        "Board Certified Credit Consultant (BCCC)",
        "Certified Credit Score Consultant (CCSC)",
        "Certified Credit Repair Specialist (CCRS)",
        "FCRA Certified Professional"
    ],
    "knowsAbout": [
        "Credit Repair", "Fair Credit Reporting Act (FCRA)", "Fair Debt Collection Practices Act (FDCPA)",
        "Credit Repair Organizations Act (CROA)", "Consumer Protection Law", "Credit Score Optimization",
        "Debt Collection Defense", "Identity Theft Recovery", "Metro 2 Compliance", "E-OSCAR Disputes"
    ],
    "awards": [
        "79,000+ clients served since 2008",
        "$3.8 million in unverified debt successfully removed",
        "17 years in business (2008-2025)",
        "Zero negative BBB reviews",
        "5.0 star aggregate rating"
    ],
}

PRICING = [
    {"name": "Fraud Package", "price": "99.95", "description": "Entry-level credit repair with monthly consultations and budgeting."},
    {"name": "Aggressive Package", "price": "179.95", "description": "Comprehensive credit repair with intensive dispute services, monthly consultations and budgeting. Most Popular."},
    {"name": "Family Package", "price": "279.95", "description": "Multi-person credit repair covering family members with consultations and budgeting for all."},
]

IDAHO_OFFICE = {
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "964 W Idaho Ave",
        "addressLocality": "Ontario",
        "addressRegion": "OR",
        "postalCode": "97914",
        "addressCountry": "US"
    },
    "geo": {
        "@type": "GeoCoordinates",
        "latitude": 43.9757,
        "longitude": -116.9629
    },
}

OPENING_HOURS = [
    {"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "opens": "09:00", "closes": "18:00"},
]


def build_organization_schema():
    return {
        "@type": "Organization",
        "name": COMPANY["name"],
        "alternateName": COMPANY["alternateName"],
        "url": COMPANY["url"],
        "logo": {"@type": "ImageObject", "url": COMPANY["logo"], "width": COMPANY["logoWidth"], "height": COMPANY["logoHeight"]},
        "image": {"@type": "ImageObject", "url": COMPANY["logo"], "width": COMPANY["logoWidth"], "height": COMPANY["logoHeight"]},
        "telephone": COMPANY["telephone"],
        "email": COMPANY["email"],
        "address": COMPANY["address"],
        "foundingDate": COMPANY["foundingDate"],
        "sameAs": COMPANY["sameAs"],
    }


def build_local_business_schema(location_override=None):
    address = location_override.get("address", COMPANY["address"]) if location_override else COMPANY["address"]
    geo = location_override.get("geo", COMPANY["geo"]) if location_override else COMPANY["geo"]
    city_name = location_override.get("city", "") if location_override else ""
    name = f"{COMPANY['name']} — {city_name}" if city_name else COMPANY["name"]
    desc = location_override.get("description", COMPANY["description"]) if location_override else COMPANY["description"]
    return {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": name,
        "alternateName": COMPANY["alternateName"],
        "description": desc,
        "url": COMPANY["url"],
        "logo": {"@type": "ImageObject", "url": COMPANY["logo"], "width": COMPANY["logoWidth"], "height": COMPANY["logoHeight"]},
        "image": {"@type": "ImageObject", "url": COMPANY["logo"], "width": COMPANY["logoWidth"], "height": COMPANY["logoHeight"]},
        "telephone": COMPANY["telephone"],
        "email": COMPANY["email"],
        "address": address,
        "geo": geo,
        "openingHoursSpecification": OPENING_HOURS,
        "priceRange": COMPANY["priceRange"],
        "founder": {"@type": "Person", "name": AUTHOR["name"], "jobTitle": AUTHOR["jobTitle"], "url": AUTHOR["url"]},
        "foundingDate": COMPANY["foundingDate"],
        "areaServed": [{"@type": "Country", "name": "United States"}],
        "serviceArea": {"@type": "GeoCircle", "geoMidpoint": geo, "geoRadius": "5000 miles"},
        "hasOfferCatalog": {
            "@type": "OfferCatalog", "name": "Credit Repair Services",
            "itemListElement": [{"@type": "Offer", "name": p["name"], "price": p["price"], "priceCurrency": "USD", "description": p["description"]} for p in PRICING]
        },
        "makesOffer": [
            {"@type": "Offer", "name": "30-Day Free Trial", "description": "Try credit repair services free for 30 days."},
            {"@type": "Offer", "name": "180-Day Money-Back Guarantee", "description": "Full refund if not satisfied within 180 days."},
        ],
        "aggregateRating": {"@type": "AggregateRating", "ratingValue": "5.0", "bestRating": "5", "worstRating": "1", "reviewCount": "79000"},
        "sameAs": COMPANY["sameAs"],
        "keywords": COMPANY["keywords"],
    }


def build_author_schema():
    return {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": AUTHOR["name"],
        "alternateName": AUTHOR["alternateName"],
        "jobTitle": AUTHOR["jobTitle"],
        "url": AUTHOR["url"],
        "email": AUTHOR["email"],
        "telephone": AUTHOR["telephone"],
        "address": COMPANY["address"],
        "image": {"@type": "ImageObject", "url": AUTHOR["image"], "width": AUTHOR["imageWidth"], "height": AUTHOR["imageHeight"]},
        "sameAs": AUTHOR["sameAs"],
        "worksFor": build_organization_schema(),
        "hasCredential": [{"@type": "EducationalOccupationalCredential", "credentialCategory": "Professional Certification", "name": c} for c in AUTHOR["certifications"]],
        "knowsAbout": AUTHOR["knowsAbout"],
        "award": AUTHOR["awards"],
        "description": AUTHOR["description"],
    }


def build_blog_posting_schema(post: dict):
    from datetime import datetime, timezone
    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S-05:00")
    published = post.get("published_at") or post.get("created_at") or now_iso
    modified = post.get("updated_at") or published
    return {
        "@context": "https://schema.org", "@type": "BlogPosting",
        "headline": post.get("title", ""),
        "author": build_author_schema(),
        "publisher": build_organization_schema(),
        "datePublished": published, "dateModified": modified,
        "description": post.get("seo_description") or post.get("excerpt", ""),
        "mainEntityOfPage": {"@type": "WebPage", "@id": f"{COMPANY['url']}/post/{post.get('slug', '')}"},
        "image": {"@type": "ImageObject", "url": post.get("featured_image") or COMPANY["logo"], "width": 1200, "height": 630},
        "wordCount": len((post.get("content") or "").split()),
        "keywords": post.get("seo_keywords") or post.get("tags", []),
        "articleSection": post.get("category", "Credit Repair"),
        "about": [{"@type": "Thing", "name": t} for t in (post.get("tags") or ["Credit Repair"])[:5]],
        "mentions": [
            {"@type": "GovernmentOrganization", "name": "Consumer Financial Protection Bureau (CFPB)"},
            {"@type": "GovernmentOrganization", "name": "Federal Trade Commission (FTC)"},
        ],
        "citation": [
            {"@type": "WebPage", "url": f"{COMPANY['url']}/how-it-works", "name": "How Credit Repair Works"},
            {"@type": "WebPage", "url": f"{COMPANY['url']}/pricing", "name": "Credit Repair Pricing"},
        ],
        "speakable": {"@type": "SpeakableSpecification", "cssSelector": ["h1", ".article-summary", ".faq-answer"]},
    }


def build_faq_schema(faqs: list):
    return {
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": [{"@type": "Question", "name": f["q"], "acceptedAnswer": {"@type": "Answer", "text": f["a"]}} for f in faqs]
    }


def build_breadcrumb_schema(items: list):
    return {
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": item["name"], "item": item["url"]} for i, item in enumerate(items)]
    }


def generate_page_schemas(path: str, title: str = "", description: str = "", faqs: list = None, post: dict = None, location_override: dict = None):
    """Generate all schemas for a page. Returns list of schema dicts."""
    url = f"{COMPANY['url']}{path}"
    schemas = [build_local_business_schema(location_override=location_override), build_author_schema()]
    if post:
        schemas.append(build_blog_posting_schema(post))
    elif title:
        schemas.append({"@context": "https://schema.org", "@type": "WebPage", "name": title, "description": description, "url": url, "publisher": build_organization_schema(),
                         "speakable": {"@type": "SpeakableSpecification", "cssSelector": ["h1", "h2", ".faq-answer", "[data-speakable]"]}})
    if faqs:
        schemas.append(build_faq_schema(faqs))
    breadcrumbs = [{"name": "Home", "url": COMPANY["url"]}]
    parts = [p for p in path.split("/") if p]
    for i, part in enumerate(parts):
        breadcrumbs.append({"name": part.replace("-", " ").title(), "url": f"{COMPANY['url']}/{'/'.join(parts[:i+1])}"})
    if len(breadcrumbs) > 1:
        schemas.append(build_breadcrumb_schema(breadcrumbs))
    return schemas
