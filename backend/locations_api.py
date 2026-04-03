"""
Locations CMS API
Allows admins to manage city locations from the dashboard.
Public endpoint serves data to the Locations hub page and auto-generates landing pages.
"""
from fastapi import APIRouter, HTTPException, Header
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field
import uuid

locations_router = APIRouter(prefix="/api/locations", tags=["Locations"])

db_instance: AsyncIOMotorDatabase = None

def set_db(database):
    global db_instance
    db_instance = database

def get_db():
    return db_instance


class LocationCreate(BaseModel):
    city: str
    state: str
    region: str = "Other"
    slug: str = ""
    tagline: str = ""
    description: str = ""
    image_url: str = ""
    population: str = ""
    metro_area: str = ""
    avg_credit_score: str = ""
    subprime_pct: str = ""
    office_address: str = ""
    seo_title: str = ""
    seo_description: str = ""
    is_published: bool = True
    sort_order: int = 0


class LocationUpdate(BaseModel):
    city: Optional[str] = None
    state: Optional[str] = None
    region: Optional[str] = None
    slug: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    population: Optional[str] = None
    metro_area: Optional[str] = None
    avg_credit_score: Optional[str] = None
    subprime_pct: Optional[str] = None
    office_address: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    is_published: Optional[bool] = None
    sort_order: Optional[int] = None


def generate_slug(city: str, state: str) -> str:
    return f"credit-repair-{city.lower().replace(' ', '-')}"


# ── Public: Get all published locations ──
@locations_router.get("/public")
async def get_public_locations():
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    locations = await db.cms_locations.find(
        {"is_published": True}, {"_id": 0}
    ).sort("sort_order", 1).to_list(200)
    return locations


# ── Admin: List all locations ──
@locations_router.get("/admin/list")
async def admin_list_locations():
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    locations = await db.cms_locations.find({}, {"_id": 0}).sort("sort_order", 1).to_list(200)
    return locations


# ── Admin: Create location ──
@locations_router.post("/admin/create")
async def admin_create_location(data: LocationCreate):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    slug = data.slug if data.slug else generate_slug(data.city, data.state)

    existing = await db.cms_locations.find_one({"slug": slug})
    if existing:
        raise HTTPException(status_code=400, detail=f"Location with slug '{slug}' already exists")

    doc = {
        "id": str(uuid.uuid4()),
        "city": data.city,
        "state": data.state,
        "region": data.region,
        "slug": slug,
        "tagline": data.tagline,
        "description": data.description,
        "image_url": data.image_url,
        "population": data.population,
        "metro_area": data.metro_area,
        "avg_credit_score": data.avg_credit_score,
        "subprime_pct": data.subprime_pct,
        "office_address": data.office_address,
        "seo_title": data.seo_title or f"Credit Repair in {data.city}, {data.state} | Credlocity",
        "seo_description": data.seo_description or f"Professional credit repair services in {data.city}, {data.state}. 79,000+ clients served, 236-point average score increase. Start your 30-day free trial.",
        "is_published": data.is_published,
        "sort_order": data.sort_order,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.cms_locations.insert_one(doc)
    doc.pop("_id", None)
    return doc


# ── Admin: Update location ──
@locations_router.put("/admin/{location_id}")
async def admin_update_location(location_id: str, data: LocationUpdate):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    update = {"updated_at": datetime.now(timezone.utc).isoformat()}
    for field, value in data.dict(exclude_unset=True).items():
        if value is not None:
            update[field] = value

    result = await db.cms_locations.update_one({"id": location_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Location not found")

    updated = await db.cms_locations.find_one({"id": location_id}, {"_id": 0})
    return updated


# ── Admin: Delete location ──
@locations_router.delete("/admin/{location_id}")
async def admin_delete_location(location_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    result = await db.cms_locations.delete_one({"id": location_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Location not found")
    return {"message": "Location deleted"}


# ── Admin: Seed existing hardcoded cities into CMS ──
@locations_router.post("/admin/seed")
async def seed_locations():
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    SEED_DATA = [
        {"city": "Philadelphia", "state": "PA", "region": "East Coast", "slug": "credit-repair-philadelphia", "tagline": "Headquarters — Serving the Tri-State Area", "population": "1.6M", "metro_area": "6.2M", "avg_credit_score": "675", "subprime_pct": "35%", "office_address": "1500 Chestnut St, Suite 2, Philadelphia, PA 19102", "image_url": "https://images.pexels.com/photos/6379121/pexels-photo-6379121.jpeg?auto=compress&cs=tinysrgb&w=600", "description": "Home to Credlocity's national headquarters. Philadelphia has one of the highest rates of credit report errors in the nation, with 35% of residents carrying subprime scores.", "sort_order": 1},
        {"city": "Atlanta", "state": "GA", "region": "Southeast", "slug": "credit-repair-atlanta", "tagline": "The South's Credit Repair Leader", "population": "499K", "metro_area": "6.1M", "avg_credit_score": "668", "subprime_pct": "38%", "office_address": "", "image_url": "https://images.pexels.com/photos/2815184/pexels-photo-2815184.jpeg?auto=compress&cs=tinysrgb&w=600", "description": "Atlanta's booming economy creates huge demand for credit-qualified workers and homebuyers, yet nearly 38% of metro Atlanta residents have subprime credit scores.", "sort_order": 2},
        {"city": "New York", "state": "NY", "region": "East Coast", "slug": "credit-repair-new-york", "tagline": "All Five Boroughs & Beyond", "population": "8.3M", "metro_area": "20.1M", "avg_credit_score": "695", "subprime_pct": "28%", "office_address": "", "image_url": "https://images.unsplash.com/photo-1655845836463-facb2826510b?w=600", "description": "New York's high cost of living makes excellent credit essential. Even a small score improvement can save tens of thousands on a Manhattan mortgage.", "sort_order": 3},
        {"city": "Trenton", "state": "NJ", "region": "East Coast", "slug": "credit-repair-trenton", "tagline": "New Jersey's Capital City", "population": "91K", "metro_area": "375K", "avg_credit_score": "660", "subprime_pct": "40%", "office_address": "", "image_url": "https://images.unsplash.com/photo-1642507870903-710079828691?w=600", "description": "As New Jersey's capital, Trenton faces unique economic challenges with 40% of residents carrying subprime credit scores.", "sort_order": 4},
        {"city": "Boise", "state": "ID", "region": "Idaho", "slug": "credit-repair-boise", "tagline": "Idaho's Fastest-Growing Metro", "population": "236K", "metro_area": "800K", "avg_credit_score": "710", "subprime_pct": "22%", "office_address": "964 W Idaho Ave, Ontario, OR 97914", "image_url": "https://images.pexels.com/photos/30256874/pexels-photo-30256874.jpeg?auto=compress&cs=tinysrgb&w=600", "description": "Boise's explosive growth has pushed median home prices above $450,000, making good credit more important than ever.", "sort_order": 5},
        {"city": "Nampa", "state": "ID", "region": "Idaho", "slug": "credit-repair-nampa", "tagline": "Treasure Valley's Growing Hub", "population": "108K", "metro_area": "800K", "avg_credit_score": "695", "subprime_pct": "27%", "office_address": "964 W Idaho Ave, Ontario, OR 97914", "image_url": "https://images.unsplash.com/photo-1748273489562-803584ce4e3b?w=600", "description": "As Idaho's third-largest city and a key part of the Treasure Valley, Nampa residents face rising costs that make credit health critical.", "sort_order": 6},
        {"city": "Caldwell", "state": "ID", "region": "Idaho", "slug": "credit-repair-caldwell", "tagline": "Canyon County's County Seat", "population": "62K", "metro_area": "800K", "avg_credit_score": "685", "subprime_pct": "30%", "office_address": "964 W Idaho Ave, Ontario, OR 97914", "image_url": "https://images.unsplash.com/photo-1700669026231-c15352acbc26?w=600", "description": "Caldwell has seen rapid growth alongside the Treasure Valley boom. With 30% subprime rates and rising property values, professional credit repair can make the difference.", "sort_order": 7},
        {"city": "Idaho Falls", "state": "ID", "region": "Idaho", "slug": "credit-repair-idaho-falls", "tagline": "Eastern Idaho's Economic Center", "population": "67K", "metro_area": "190K", "avg_credit_score": "705", "subprime_pct": "24%", "office_address": "964 W Idaho Ave, Ontario, OR 97914", "image_url": "https://images.pexels.com/photos/1767666/pexels-photo-1767666.jpeg?auto=compress&cs=tinysrgb&w=600", "description": "Idaho Falls is the commercial hub of eastern Idaho, with a growing economy driven by the Idaho National Laboratory.", "sort_order": 8},
        {"city": "Twin Falls", "state": "ID", "region": "Idaho", "slug": "credit-repair-twin-falls", "tagline": "Magic Valley's Gateway City", "population": "53K", "metro_area": "115K", "avg_credit_score": "700", "subprime_pct": "26%", "office_address": "964 W Idaho Ave, Ontario, OR 97914", "image_url": "https://images.unsplash.com/photo-1657518860172-5d4e4de1eb03?w=600", "description": "Twin Falls, home to the spectacular Shoshone Falls, serves as the economic hub of the Magic Valley.", "sort_order": 9},
        {"city": "Pocatello", "state": "ID", "region": "Idaho", "slug": "credit-repair-pocatello", "tagline": "The Gateway to the Northwest", "population": "57K", "metro_area": "100K", "avg_credit_score": "695", "subprime_pct": "28%", "office_address": "964 W Idaho Ave, Ontario, OR 97914", "image_url": "https://images.pexels.com/photos/6940677/pexels-photo-6940677.jpeg?auto=compress&cs=tinysrgb&w=600", "description": "Pocatello, home to Idaho State University, combines small-town charm with economic opportunity.", "sort_order": 10},
    ]

    seeded = 0
    skipped = 0
    for city_data in SEED_DATA:
        existing = await db.cms_locations.find_one({"slug": city_data["slug"]})
        if existing:
            skipped += 1
            continue

        doc = {
            "id": str(uuid.uuid4()),
            **city_data,
            "seo_title": f"Credit Repair in {city_data['city']}, {city_data['state']} | Credlocity",
            "seo_description": f"Professional credit repair services in {city_data['city']}, {city_data['state']}. 79,000+ clients served, 236-point average score increase.",
            "is_published": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.cms_locations.insert_one(doc)
        seeded += 1

    return {"seeded": seeded, "skipped": skipped, "total": len(SEED_DATA)}
