"""
Test Suite for Iteration 60 - Enhanced Local Landing Pages
Tests comprehensive city statistics, client reviews, interlinked legal rights sections,
expanded FAQs, Idaho address for Idaho pages, and cross-city links.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"

# Idaho pages expected data
IDAHO_OFFICE_ADDRESS = "964 W Idaho Ave, Ontario, OR 97914"
IDAHO_CITIES = ["credit-repair-boise", "credit-repair-caldwell", "credit-repair-nampa", "credit-repair-idaho-falls", "credit-repair-twin-falls", "credit-repair-pocatello"]

# Non-Idaho pages
NON_IDAHO_CITIES = ["credit-repair-philadelphia", "credit-repair-atlanta", "credit-repair-new-york", "credit-repair-trenton"]


class TestBackendLocalPages:
    """Test local landing page endpoints with enhanced data"""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        # Login to get token for admin endpoints
        login_res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if login_res.status_code == 200:
            token = login_res.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        yield

    # ===== BOISE TESTS =====
    def test_boise_page_has_correct_stats_and_reviews(self):
        """GET /api/seo/local-pages/by-slug/credit-repair-boise returns stats, reviews, Idaho office"""
        res = self.session.get(f"{BASE_URL}/api/seo/local-pages/by-slug/credit-repair-boise")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        data = res.json()
        
        # Check basic fields
        assert data.get("city") == "Boise", f"Expected city 'Boise', got {data.get('city')}"
        assert data.get("state") == "ID", f"Expected state 'ID', got {data.get('state')}"
        
        # Check use_idaho_office flag
        assert data.get("use_idaho_office") == True, f"Expected use_idaho_office=True for Boise"
        
        # Check Idaho office address
        assert data.get("office_address") == IDAHO_OFFICE_ADDRESS, f"Expected '{IDAHO_OFFICE_ADDRESS}', got {data.get('office_address')}"
        
        # Check stats exist with metro_population
        stats = data.get("stats", {})
        assert "population" in stats, "Missing population in stats"
        assert "metro_population" in stats, "Missing metro_population in stats"
        assert "avg_credit_score" in stats, "Missing avg_credit_score in stats"
        assert "pct_subprime" in stats, "Missing pct_subprime in stats"
        assert "pct_with_collections" in stats, "Missing pct_with_collections in stats"
        assert "median_income" in stats, "Missing median_income in stats"
        assert "pct_with_debt" in stats, "Missing pct_with_debt in stats"
        assert "avg_debt" in stats, "Missing avg_debt in stats"
        print(f"Boise stats: {stats}")
        
        # Check reviews array
        reviews = data.get("reviews", [])
        assert len(reviews) >= 2, f"Expected at least 2 reviews for Boise, got {len(reviews)}"
        for review in reviews:
            assert "name" in review, "Review missing name"
            assert "text" in review, "Review missing text"
            assert "rating" in review, "Review missing rating"
        print(f"Boise reviews count: {len(reviews)}")
        
        # Check FAQs count (should be 8-12)
        faqs = data.get("faqs", [])
        assert len(faqs) >= 8, f"Expected at least 8 FAQs for Boise, got {len(faqs)}"
        assert len(faqs) <= 15, f"Expected max 15 FAQs for Boise, got {len(faqs)}"
        print(f"Boise FAQs count: {len(faqs)}")
        
        # Check services count (should be 12)
        services = data.get("services", [])
        assert len(services) == 12, f"Expected 12 services for Boise, got {len(services)}"
        print(f"Boise services: {services}")

    # ===== PHILADELPHIA TESTS =====
    def test_philadelphia_page_has_correct_stats_and_non_idaho_office(self):
        """GET /api/seo/local-pages/by-slug/credit-repair-philadelphia returns stats, reviews, non-Idaho office"""
        res = self.session.get(f"{BASE_URL}/api/seo/local-pages/by-slug/credit-repair-philadelphia")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        data = res.json()
        
        # Check basic fields
        assert data.get("city") == "Philadelphia", f"Expected city 'Philadelphia', got {data.get('city')}"
        assert data.get("state") == "PA", f"Expected state 'PA', got {data.get('state')}"
        
        # Check use_idaho_office flag is False
        assert data.get("use_idaho_office") == False, f"Expected use_idaho_office=False for Philadelphia"
        
        # Check office address contains Philadelphia
        office_addr = data.get("office_address", "")
        assert "Philadelphia" in office_addr, f"Expected Philadelphia in office address, got {office_addr}"
        
        # Check stats
        stats = data.get("stats", {})
        assert len(stats) >= 6, f"Expected at least 6 stats fields, got {len(stats)}"
        print(f"Philadelphia stats: {stats}")
        
        # Check reviews
        reviews = data.get("reviews", [])
        assert len(reviews) >= 2, f"Expected at least 2 reviews, got {len(reviews)}"
        
        # Check FAQs (10)
        faqs = data.get("faqs", [])
        assert len(faqs) >= 8, f"Expected at least 8 FAQs, got {len(faqs)}"
        print(f"Philadelphia FAQs count: {len(faqs)}")
        
        # Check services (12)
        services = data.get("services", [])
        assert len(services) == 12, f"Expected 12 services, got {len(services)}"

    # ===== ATLANTA TESTS =====
    def test_atlanta_page_has_stats_and_reviews(self):
        """GET /api/seo/local-pages/by-slug/credit-repair-atlanta returns stats with metro_population, 3 reviews"""
        res = self.session.get(f"{BASE_URL}/api/seo/local-pages/by-slug/credit-repair-atlanta")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        data = res.json()
        
        # Check basic fields
        assert data.get("city") == "Atlanta", f"Expected city 'Atlanta', got {data.get('city')}"
        assert data.get("state") == "GA", f"Expected state 'GA', got {data.get('state')}"
        
        # Check stats with metro_population
        stats = data.get("stats", {})
        assert "metro_population" in stats, "Missing metro_population in Atlanta stats"
        assert stats["metro_population"] == "6,230,854", f"Expected metro_population '6,230,854', got {stats.get('metro_population')}"
        print(f"Atlanta stats: {stats}")
        
        # Check reviews array - should have 3 items
        reviews = data.get("reviews", [])
        assert len(reviews) == 3, f"Expected exactly 3 reviews for Atlanta, got {len(reviews)}"
        for review in reviews:
            assert "name" in review
            assert "text" in review
            assert "location" in review
        print(f"Atlanta reviews: {[r['name'] for r in reviews]}")
        
        # Check FAQs (10)
        faqs = data.get("faqs", [])
        assert len(faqs) >= 8, f"Expected at least 8 FAQs for Atlanta, got {len(faqs)}"
        print(f"Atlanta FAQs count: {len(faqs)}")

    # ===== NEW YORK TESTS =====
    def test_new_york_page_has_stats_and_reviews(self):
        """GET /api/seo/local-pages/by-slug/credit-repair-new-york returns stats, 10 FAQs, 3 reviews"""
        res = self.session.get(f"{BASE_URL}/api/seo/local-pages/by-slug/credit-repair-new-york")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        data = res.json()
        
        # Check basic fields
        assert data.get("city") == "New York", f"Expected city 'New York', got {data.get('city')}"
        assert data.get("state") == "NY", f"Expected state 'NY', got {data.get('state')}"
        
        # Check stats
        stats = data.get("stats", {})
        assert len(stats) >= 6, f"Expected at least 6 stats fields"
        print(f"New York stats: {stats}")
        
        # Check reviews - should have 3
        reviews = data.get("reviews", [])
        assert len(reviews) == 3, f"Expected 3 reviews for New York, got {len(reviews)}"
        
        # Check FAQs (10)
        faqs = data.get("faqs", [])
        assert len(faqs) >= 8, f"Expected at least 8 FAQs for New York, got {len(faqs)}"
        print(f"New York FAQs count: {len(faqs)}")

    # ===== IDAHO PAGES TESTS =====
    def test_caldwell_uses_idaho_office(self):
        """GET /api/seo/local-pages/by-slug/credit-repair-caldwell returns use_idaho_office=true"""
        res = self.session.get(f"{BASE_URL}/api/seo/local-pages/by-slug/credit-repair-caldwell")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        data = res.json()
        assert data.get("use_idaho_office") == True, f"Expected use_idaho_office=True for Caldwell"
        assert data.get("office_address") == IDAHO_OFFICE_ADDRESS, f"Expected Idaho office address"
        print(f"Caldwell use_idaho_office: {data.get('use_idaho_office')}")

    def test_nampa_uses_idaho_office(self):
        """GET /api/seo/local-pages/by-slug/credit-repair-nampa returns use_idaho_office=true"""
        res = self.session.get(f"{BASE_URL}/api/seo/local-pages/by-slug/credit-repair-nampa")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        data = res.json()
        assert data.get("use_idaho_office") == True, f"Expected use_idaho_office=True for Nampa"
        assert data.get("office_address") == IDAHO_OFFICE_ADDRESS, f"Expected Idaho office address"
        print(f"Nampa use_idaho_office: {data.get('use_idaho_office')}")

    # ===== ALL IDAHO PAGES BATCH TEST =====
    def test_all_idaho_pages_use_idaho_office(self):
        """Verify all Idaho cities have use_idaho_office=true"""
        for slug in IDAHO_CITIES:
            res = self.session.get(f"{BASE_URL}/api/seo/local-pages/by-slug/{slug}")
            if res.status_code == 200:
                data = res.json()
                assert data.get("use_idaho_office") == True, f"{slug} should have use_idaho_office=True"
                assert data.get("office_address") == IDAHO_OFFICE_ADDRESS, f"{slug} should have Idaho office address"
                print(f"✓ {slug}: use_idaho_office={data.get('use_idaho_office')}")
            else:
                print(f"⚠ {slug} returned {res.status_code}")

    # ===== NON-IDAHO PAGES TEST =====
    def test_non_idaho_pages_do_not_use_idaho_office(self):
        """Verify non-Idaho cities have use_idaho_office=false"""
        for slug in NON_IDAHO_CITIES:
            res = self.session.get(f"{BASE_URL}/api/seo/local-pages/by-slug/{slug}")
            if res.status_code == 200:
                data = res.json()
                assert data.get("use_idaho_office") == False, f"{slug} should have use_idaho_office=False"
                print(f"✓ {slug}: use_idaho_office={data.get('use_idaho_office')}")
            else:
                print(f"⚠ {slug} returned {res.status_code}")

    # ===== SCHEMA GENERATION TESTS =====
    def test_boise_page_schema_includes_faq(self):
        """GET /api/seo/page-schemas?path=/credit-repair-boise returns schemas with FAQPage type"""
        res = self.session.get(f"{BASE_URL}/api/seo/page-schemas", params={"path": "/credit-repair-boise"})
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        data = res.json()
        
        schemas = data.get("schemas", [])
        assert len(schemas) >= 1, "Expected at least 1 schema"
        
        # Check for FAQPage schema type
        schema_types = [s.get("@type") for s in schemas]
        assert "FAQPage" in schema_types, f"Expected FAQPage schema, got types: {schema_types}"
        
        # Check LocalBusiness schema
        assert "LocalBusiness" in schema_types, f"Expected LocalBusiness schema, got types: {schema_types}"
        
        print(f"Boise page schema types: {schema_types}")

    def test_page_public_list_returns_all_cities(self):
        """GET /api/seo/local-pages/public returns all 10 published local pages"""
        res = self.session.get(f"{BASE_URL}/api/seo/local-pages/public")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        data = res.json()
        
        pages = data.get("pages", [])
        assert len(pages) >= 10, f"Expected at least 10 local pages, got {len(pages)}"
        
        city_slugs = [p.get("slug") for p in pages]
        print(f"Public local pages: {city_slugs}")
        
        # Verify all expected cities are present
        expected_slugs = IDAHO_CITIES + NON_IDAHO_CITIES
        for slug in expected_slugs:
            assert slug in city_slugs, f"Expected {slug} in public pages list"


class TestBackendHealthAndRegression:
    """Basic health and regression tests"""

    def test_homepage_seo_endpoint(self):
        """GET /api/seo/pages/by-path?path=/ returns homepage SEO"""
        res = requests.get(f"{BASE_URL}/api/seo/pages/by-path", params={"path": "/"})
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        data = res.json()
        assert "title" in data or "path" in data, "Response should have title or path"
        print(f"Homepage SEO: {data.get('title', 'N/A')}")

    def test_pricing_seo_endpoint(self):
        """GET /api/seo/pages/by-path?path=/pricing returns pricing page SEO"""
        res = requests.get(f"{BASE_URL}/api/seo/pages/by-path", params={"path": "/pricing"})
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        data = res.json()
        print(f"Pricing SEO: {data.get('title', 'N/A')}")

    def test_schema_presets_endpoint(self):
        """GET /api/seo/schema-presets returns available schema types"""
        res = requests.get(f"{BASE_URL}/api/seo/schema-presets")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        data = res.json()
        presets = data.get("presets", [])
        assert len(presets) >= 5, f"Expected at least 5 schema presets"
        print(f"Schema presets: {[p.get('id') for p in presets]}")
