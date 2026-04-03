"""
Blog Import API - Imports blog posts from credlocity.com Wix blog via their internal API.
Preserves URL slugs, extracts metadata, images, disclosures, and series info.
Phase 1: Import metadata from Wix API (fast, all posts at once)
Phase 2: Scrape full content via HTTP for each post (slower, with rate limiting)
"""
import asyncio
import re
import uuid
from datetime import datetime, timezone
from typing import Optional
import httpx
from bs4 import BeautifulSoup
from fastapi import APIRouter, HTTPException, BackgroundTasks

blog_import_router = APIRouter(prefix="/api/blog-import", tags=["Blog Import"])

db = None

def set_db(database):
    global db
    db = database


# Known series groupings
SERIES_MAP = {
    "government-shutdown": {
        "name": "Government Shutdown Coverage",
        "id": str(uuid.uuid5(uuid.NAMESPACE_URL, "government-shutdown-series")),
        "slugs": [
            "2025-government-shutdown-financial-guide-facts",
            "government-shutdown-day-2-updates-layoffs-military-pay",
            "government-shutdown-day-13-mass-firings-military-pay-crisis",
            "government-shutdown-2025-day-20-snap-crisis-42-million-americans",
            "government-shutdown-day-27-critical-resources-survival-guide-federal-workers-snap",
            "supreme-court-blocks-snap-benefits-42-million-americans-november-2025",
            "government-shutdown-day-43-snap-benefits-aca-credits-congress-vote",
        ]
    },
    "credit-repair-scams": {
        "name": "Credit Repair Scams Exposed",
        "id": str(uuid.uuid5(uuid.NAMESPACE_URL, "credit-repair-scams-series")),
        "slugs": [
            "credit-repair-scams-exposed-industry-experts-double-agents-investigation",
            "credit-repair-industry-expose-illegal-credit-sweeps-investigation-part-2",
            "credit-repair-scam-chanelle-jones-savvy-business-group-exposed",
            "bronx-da-employee-credit-repair-fraud-investigation-exposed",
        ]
    },
    "credit-saint": {
        "name": "Credit Saint Investigation",
        "id": str(uuid.uuid5(uuid.NAMESPACE_URL, "credit-saint-series")),
        "slugs": [
            "credit-saint-investigation",
            "credit-saint-fraud-investigation-part-2-undercover-calls",
            "credit-saint-reviews-235-reviews-exposed",
        ]
    },
    "ninja-files": {
        "name": "The Ninja Files",
        "id": str(uuid.uuid5(uuid.NAMESPACE_URL, "ninja-files-series")),
        "slugs": [
            "ninja-outsourcing-fraud-investigation-vivi-campbell-devin-shaw-part-1",
            "ninja-files-interlude-legal-threats-investigation-update",
            "ninja-outsourcing-fraud-devin-shaw-mustard-heist-part-2",
        ]
    },
    "one-big-beautiful-bill": {
        "name": "One Big Beautiful Bill Act",
        "id": str(uuid.uuid5(uuid.NAMESPACE_URL, "one-big-beautiful-bill-series")),
        "slugs": [
            "fighting-one-big-beautiful-bill-constitutional-challenge",
            "one-big-beautiful-bill-act-legal-challenges-implementation-impact-2025",
        ]
    },
}


def get_series_info(slug: str) -> dict:
    for series_data in SERIES_MAP.values():
        if slug in series_data["slugs"]:
            return {
                "series_id": series_data["id"],
                "series_name": series_data["name"],
                "series_order": series_data["slugs"].index(slug) + 1,
            }
    return {"series_id": None, "series_name": None, "series_order": None}


def detect_disclosures(text: str, title: str) -> dict:
    disclosures = {
        "ymyl_enabled": False, "ymyl_content": "",
        "general_disclosure_enabled": False, "general_disclosure_type": "", "general_disclosure_content": "",
        "competitor_disclosure_enabled": False, "competitor_disclosure_content": "",
        "corrections_enabled": False, "corrections_content": "",
        "pseudonym_enabled": False, "pseudonym_reason": "", "pseudonym_content": "",
    }
    combined = (text + " " + title).lower()

    ymyl_kw = ["credit", "debt", "loan", "mortgage", "fico", "vantagescore", "financial",
                "settlement", "bankruptcy", "refund", "social security", "snap benefits",
                "government shutdown", "interest rate", "tradeline", "credit bureau",
                "credit report", "medical debt", "student loan", "credit score"]
    if any(k in combined for k in ymyl_kw):
        disclosures["ymyl_enabled"] = True
        disclosures["ymyl_content"] = (
            "This article contains information about financial topics (Your Money or Your Life). "
            "The information provided is for educational purposes only and should not be considered "
            "as financial, legal, or professional advice. Consult with a qualified professional "
            "before making financial decisions."
        )

    comp_kw = ["credit saint", "lexington law", "credit butterfly", "credit repair cloud",
               "savvy business group", "ninja outsourcing", "chanelle jones", "devin shaw",
               "scam", "exposed", "investigation", "fraud"]
    if any(k in combined for k in comp_kw):
        disclosures["competitor_disclosure_enabled"] = True
        disclosures["competitor_disclosure_content"] = (
            "This article discusses competitors or third-party companies. Credlocity has conducted "
            "independent research and investigation. The views expressed are based on publicly "
            "available information and our professional analysis."
        )

    inv_kw = ["investigation", "exposed", "undercover", "fraud", "ninja files", "double agents"]
    if any(k in combined for k in inv_kw):
        disclosures["pseudonym_enabled"] = True
        disclosures["pseudonym_reason"] = "nature_of_info"
        disclosures["pseudonym_content"] = (
            "Some names and identifying details in this investigative report may have been "
            "changed to protect sources and ongoing investigations."
        )

    return disclosures


def build_cover_image_url(cover_image: dict) -> str:
    if not cover_image:
        return ""
    src = cover_image.get("src")
    if not src or not isinstance(src, dict):
        return ""
    file_id = src.get("id", "") or src.get("file_name", "")
    if not file_id:
        return ""
    return f"https://static.wixstatic.com/media/{file_id}"


def extract_content_from_html(html: str) -> str:
    """Extract blog content from Wix rendered HTML."""
    soup = BeautifulSoup(html, "lxml")
    html_parts = []

    # Find content viewer
    content_viewer = soup.find("div", {"data-id": "content-viewer"})
    if not content_viewer:
        post_desc = soup.find("section", {"data-hook": "post-description"})
        if post_desc:
            content_viewer = post_desc

    if not content_viewer:
        return ""

    # Process blocks
    blocks = content_viewer.find_all("div", {"data-hook": re.compile(r"rcv-block")})
    for block in blocks:
        # Headings
        for level in range(1, 7):
            h = block.find(f"h{level}")
            if h:
                text = h.get_text(strip=True)
                if text:
                    html_parts.append(f"<h{level}>{text}</h{level}>")
                break

        # Paragraphs
        for p in block.find_all("p", class_="dEt5S"):
            text_parts = []
            for child in p.descendants:
                if child.name == "a":
                    href = child.get("href", "")
                    if "credlocity.com/post/" in href:
                        slug = href.rstrip("/").split("/post/")[-1]
                        href = f"/post/{slug}"
                    text_parts.append(f'<a href="{href}">{child.get_text()}</a>')
                elif child.name == "strong" or child.name == "b":
                    text_parts.append(f"<strong>{child.get_text()}</strong>")
                elif child.name == "em" or child.name == "i":
                    text_parts.append(f"<em>{child.get_text()}</em>")
                elif child.name is None:
                    parent = child.parent
                    if parent and parent.name in ("a", "strong", "b", "em", "i", "u"):
                        continue
                    if parent and parent.name == "span":
                        gp = parent.parent
                        if gp and gp.name == "span":
                            continue
                    text_parts.append(str(child))
            text = "".join(text_parts).strip()
            if text and text != "\n":
                html_parts.append(f"<p>{text}</p>")

        # Images
        for img in block.find_all("img"):
            src = img.get("data-pin-media", "") or img.get("src", "")
            alt = img.get("alt", "")
            if src and "blur" not in src and src.startswith("http"):
                html_parts.append(f'<img src="{src}" alt="{alt}" />')

    return "\n".join(html_parts)


# ============ IMPORT STATE ============
import_status = {
    "running": False, "phase": "", "total": 0, "completed": 0,
    "failed": 0, "errors": [], "imported_slugs": [],
    "content_scraped": 0, "content_failed": 0,
}


async def run_import_task():
    """Background task: Phase 1 = Wix API metadata, Phase 2 = scrape content."""
    global import_status
    import_status = {
        "running": True, "phase": "metadata", "total": 0, "completed": 0,
        "failed": 0, "errors": [], "imported_slugs": [],
        "content_scraped": 0, "content_failed": 0,
    }

    async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
        # Phase 1: Get all posts from Wix API
        print("[IMPORT] Phase 1: Fetching metadata from Wix API...")
        try:
            # Get instance token
            model_resp = await client.get(
                "https://www.credlocity.com/_api/v2/dynamicmodel",
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
            )
            model_data = model_resp.json()
            instance = model_data["apps"]["14bcded7-0066-7c35-14d7-466cb3f09103"]["instance"]

            # Fetch all posts
            posts_resp = await client.get(
                "https://www.credlocity.com/_api/communities-blog-node-api/_api/posts?offset=0&size=100",
                headers={"instance": instance, "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
            )
            wix_posts = posts_resp.json()
            if isinstance(wix_posts, dict):
                wix_posts = wix_posts.get("posts", [])
            import_status["total"] = len(wix_posts)
            print(f"[IMPORT] Got {len(wix_posts)} posts from Wix API")

        except Exception as e:
            import_status["errors"].append(f"Wix API failed: {str(e)[:100]}")
            import_status["running"] = False
            print(f"[IMPORT] Wix API error: {e}")
            return

        # Phase 1b: Insert metadata for each post
        for wix_post in wix_posts:
            slug = wix_post.get("slug", "")
            if not slug:
                continue

            try:
                existing = await db.blog_posts.find_one({"slug": slug})
                if existing:
                    import_status["completed"] += 1
                    import_status["imported_slugs"].append(slug)
                    continue

                title = wix_post.get("title", "")
                excerpt = wix_post.get("excerpt", "")
                cover_url = build_cover_image_url(wix_post.get("coverImage"))
                hero_url = build_cover_image_url(wix_post.get("heroImage"))
                featured_image = hero_url or cover_url
                read_time = wix_post.get("timeToRead", 5)
                series_info = get_series_info(slug)
                disclosures = detect_disclosures(excerpt + " " + title, title)

                pub_date = wix_post.get("firstPublishedDate") or wix_post.get("lastPublishedDate") or wix_post.get("createdDate")

                seo = {
                    "meta_title": wix_post.get("seoTitle", title),
                    "meta_description": wix_post.get("seoDescription", excerpt[:160]),
                    "canonical_url": f"https://credlocity.com/post/{slug}",
                    "og_title": wix_post.get("seoTitle", title),
                    "og_description": wix_post.get("seoDescription", excerpt[:160]),
                    "og_image": featured_image,
                    "focus_keyword": "",
                    "keywords": wix_post.get("hashtags", []),
                }

                # Build tags from hashtags
                raw_tags = wix_post.get("hashtags", [])
                tags = []
                for h in raw_tags:
                    if isinstance(h, dict):
                        tags.append(h.get("value", str(h)))
                    elif isinstance(h, str):
                        tags.append(h)

                post_doc = {
                    "id": str(uuid.uuid4()),
                    "title": title,
                    "slug": slug,
                    "content": f"<p>{excerpt}</p>",  # Placeholder until Phase 2
                    "excerpt": excerpt[:300],
                    "categories": [],
                    "tags": tags,
                    "is_news": False,
                    "read_time_minutes": read_time,
                    "author_name": "Credlocity Team",
                    "author_id": None, "author_slug": None, "author_photo_url": None,
                    "author_title": None, "author_credentials": [], "author_experience": None,
                    "author_education": [], "author_publications": [], "author_bio": None,
                    "featured_image_url": featured_image,
                    "featured_image_alt": title,
                    "seo": seo,
                    "status": "published",
                    "publish_date": pub_date,
                    "scheduled_publish": None,
                    "featured_post": wix_post.get("isFeatured", False),
                    "allow_comments": not wix_post.get("isCommentsDisabled", False),
                    "related_posts": wix_post.get("relatedPostIds", []),
                    "related_topics": [], "related_pages": [],
                    "related_education_hub": False, "related_press_releases": [], "related_lawsuits": [],
                    "series_id": series_info["series_id"],
                    "series_name": series_info["series_name"],
                    "series_order": series_info["series_order"],
                    "view_count": wix_post.get("viewCount", 0),
                    "updates": [],
                    "disclosures": disclosures,
                    "schemas": {
                        "auto_generate": True, "article_type": "BlogPosting",
                        "include_author": True, "include_breadcrumb": True,
                        "include_faq": False, "custom_schema": "",
                    },
                    "created_at": wix_post.get("createdDate", datetime.now(timezone.utc).isoformat()),
                    "updated_at": wix_post.get("lastActivityDate", datetime.now(timezone.utc).isoformat()),
                    "created_by": "import",
                    "last_edited_by": "import",
                    "_needs_content": True,
                    "_wix_id": wix_post.get("id", ""),
                }

                await db.blog_posts.insert_one(post_doc)
                import_status["completed"] += 1
                import_status["imported_slugs"].append(slug)
                print(f"[IMPORT] Inserted: {slug} (title: {title[:50]})")

            except Exception as e:
                import_status["failed"] += 1
                import_status["errors"].append(f"{slug}: {str(e)[:100]}")
                print(f"[IMPORT] ERROR: {slug}: {e}")

        # Phase 2: Scrape full content from each post URL
        import_status["phase"] = "content"
        print("[IMPORT] Phase 2: Scraping full content...")
        needs_content = await db.blog_posts.find(
            {"_needs_content": True},
            {"_id": 0, "id": 1, "slug": 1}
        ).to_list(None)

        for post_ref in needs_content:
            slug = post_ref["slug"]
            url = f"https://www.credlocity.com/post/{slug}"
            try:
                resp = await client.get(url, headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                })

                if resp.status_code == 429:
                    print(f"[IMPORT] Rate limited at {slug}, waiting 30s...")
                    await asyncio.sleep(30)
                    resp = await client.get(url, headers={
                        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
                    })

                if resp.status_code == 200:
                    content = extract_content_from_html(resp.text)
                    if content and len(content) > 100:
                        await db.blog_posts.update_one(
                            {"id": post_ref["id"]},
                            {"$set": {"content": content}, "$unset": {"_needs_content": ""}}
                        )
                        import_status["content_scraped"] += 1
                        print(f"[IMPORT] Content scraped: {slug} ({len(content)} chars)")
                    else:
                        # Keep the excerpt as content
                        await db.blog_posts.update_one(
                            {"id": post_ref["id"]},
                            {"$unset": {"_needs_content": ""}}
                        )
                        import_status["content_failed"] += 1
                        print(f"[IMPORT] No content extracted: {slug}")
                else:
                    import_status["content_failed"] += 1
                    await db.blog_posts.update_one(
                        {"id": post_ref["id"]},
                        {"$unset": {"_needs_content": ""}}
                    )
                    print(f"[IMPORT] HTTP {resp.status_code} for {slug}")

            except Exception as e:
                import_status["content_failed"] += 1
                await db.blog_posts.update_one(
                    {"id": post_ref["id"]},
                    {"$unset": {"_needs_content": ""}}
                )
                print(f"[IMPORT] Content error: {slug}: {e}")

            await asyncio.sleep(3)  # Rate limit between requests

    # Phase 3: Clean up
    await db.blog_posts.update_many(
        {"_needs_content": {"$exists": True}},
        {"$unset": {"_needs_content": "", "_wix_id": ""}}
    )
    await db.blog_posts.update_many(
        {"_wix_id": {"$exists": True}},
        {"$unset": {"_wix_id": ""}}
    )

    import_status["running"] = False
    import_status["phase"] = "complete"
    print(f"[IMPORT] Complete! {import_status['completed']} metadata, {import_status['content_scraped']} content scraped")


@blog_import_router.post("/start")
async def start_import(background_tasks: BackgroundTasks):
    if import_status["running"]:
        raise HTTPException(status_code=409, detail="Import already in progress")
    background_tasks.add_task(run_import_task)
    return {"message": "Blog import started", "total_urls": import_status.get("total", 60)}


@blog_import_router.get("/status")
async def get_import_status():
    return import_status


@blog_import_router.get("/count")
async def get_imported_count():
    count = await db.blog_posts.count_documents({"created_by": "import"})
    total_published = await db.blog_posts.count_documents({"status": "published"})
    return {"imported": count, "total_published": total_published}


@blog_import_router.post("/reset")
async def reset_import():
    """Delete all imported posts and reset status."""
    if import_status["running"]:
        raise HTTPException(status_code=409, detail="Import is running")
    result = await db.blog_posts.delete_many({"created_by": "import"})
    return {"deleted": result.deleted_count}
