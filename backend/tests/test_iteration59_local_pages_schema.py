"""
Iteration 59 - Local Landing Pages & Schema Generation Testing
Tests:
1. GET /api/seo/page-schemas?path=/ - Homepage schemas (LocalBusiness, Person, WebPage)
2. GET /api/seo/page-schemas?path=/credit-repair-philadelphia - Local page schemas (LocalBusiness, Person, FAQPage, BreadcrumbList)
3. GET /api/seo/page-schemas?path=/pricing - Pricing page schemas (WebPage)
4. GET /api/seo/local-pages - Admin list of local landing pages (requires auth)
5. GET /api/seo/local-pages/public - Public list of published local pages
6. GET /api/seo/local-pages/by-slug/credit-repair-atlanta - Get city data by slug
7. POST /api/seo/local-pages/seed - Seed default local pages (admin)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSchemaGeneration:
    """Test auto-generated JSON-LD schema endpoints"""
    
    def test_homepage_schemas(self):
        """GET /api/seo/page-schemas?path=/ returns LocalBusiness, Person, WebPage schemas"""
        response = requests.get(f"{BASE_URL}/api/seo/page-schemas?path=/")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "schemas" in data, "Response should have 'schemas' key"
        schemas = data["schemas"]
        assert isinstance(schemas, list), "Schemas should be a list"
        assert len(schemas) >= 3, f"Homepage should have at least 3 schemas, got {len(schemas)}"
        
        # Check for LocalBusiness schema
        schema_types = [s.get("@type") for s in schemas]
        assert "LocalBusiness" in schema_types, f"Should have LocalBusiness schema, got {schema_types}"
        assert "Person" in schema_types, f"Should have Person schema, got {schema_types}"
        
        # Verify LocalBusiness has required fields
        local_business = next(s for s in schemas if s.get("@type") == "LocalBusiness")
        assert local_business.get("name") == "Credlocity Business Group LLC"
        assert "address" in local_business
        assert "telephone" in local_business
        assert local_business.get("priceRange") == "$99.95 - $279.95/month"
        print("PASS: Homepage returns LocalBusiness, Person, and WebPage schemas")
    
    def test_local_page_schemas_philadelphia(self):
        """GET /api/seo/page-schemas?path=/credit-repair-philadelphia returns LocalBusiness, Person, FAQPage, BreadcrumbList"""
        response = requests.get(f"{BASE_URL}/api/seo/page-schemas?path=/credit-repair-philadelphia")
        assert response.status_code == 200
        
        data = response.json()
        schemas = data.get("schemas", [])
        schema_types = [s.get("@type") for s in schemas]
        
        # Must have these core schemas
        assert "LocalBusiness" in schema_types, f"Should have LocalBusiness, got {schema_types}"
        assert "Person" in schema_types, f"Should have Person, got {schema_types}"
        assert "BreadcrumbList" in schema_types, f"Should have BreadcrumbList for local page, got {schema_types}"
        
        # Check breadcrumb structure
        breadcrumb = next(s for s in schemas if s.get("@type") == "BreadcrumbList")
        assert "itemListElement" in breadcrumb
        items = breadcrumb["itemListElement"]
        assert len(items) >= 2, "Breadcrumb should have at least 2 items (Home -> City)"
        assert items[0]["name"] == "Home"
        
        print("PASS: Local page /credit-repair-philadelphia returns correct schemas with BreadcrumbList")
    
    def test_pricing_page_schemas(self):
        """GET /api/seo/page-schemas?path=/pricing returns schemas including WebPage type"""
        response = requests.get(f"{BASE_URL}/api/seo/page-schemas?path=/pricing")
        assert response.status_code == 200
        
        data = response.json()
        schemas = data.get("schemas", [])
        schema_types = [s.get("@type") for s in schemas]
        
        assert "LocalBusiness" in schema_types, "Should have LocalBusiness on pricing page"
        assert "Person" in schema_types, "Should have Person on pricing page"
        assert "WebPage" in schema_types, f"Should have WebPage for pricing page, got {schema_types}"
        
        # Verify WebPage has correct title
        web_page = next(s for s in schemas if s.get("@type") == "WebPage")
        assert "Credit Repair Pricing" in web_page.get("name", ""), f"WebPage name should mention pricing, got {web_page.get('name')}"
        
        print("PASS: Pricing page returns WebPage schema with correct title")


class TestLocalLandingPagesAdmin:
    """Test admin local landing pages CRUD endpoints (require auth)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        if login_response.status_code != 200:
            pytest.skip("Authentication failed - skipping admin tests")
        self.token = login_response.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_list_local_pages_authenticated(self):
        """GET /api/seo/local-pages returns list of local pages (admin, requires auth)"""
        response = requests.get(f"{BASE_URL}/api/seo/local-pages", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "pages" in data, "Response should have 'pages' key"
        assert "total" in data, "Response should have 'total' key"
        
        pages = data["pages"]
        # Should have 10 seeded pages
        assert len(pages) >= 10, f"Should have at least 10 seeded pages, got {len(pages)}"
        
        # Check structure of a page
        if pages:
            page = pages[0]
            assert "city" in page, "Page should have city"
            assert "state" in page, "Page should have state"
            assert "slug" in page, "Page should have slug"
            assert "status" in page, "Page should have status"
        
        print(f"PASS: Admin local-pages returns {len(pages)} pages")
    
    def test_list_local_pages_unauthenticated_fails(self):
        """GET /api/seo/local-pages without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/seo/local-pages")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("PASS: Unauthenticated access to local-pages returns 401")
    
    def test_seed_local_pages_returns_zero_if_already_seeded(self):
        """POST /api/seo/local-pages/seed should return seeded:0 if already seeded"""
        response = requests.post(f"{BASE_URL}/api/seo/local-pages/seed", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "seeded" in data, "Response should have 'seeded' count"
        assert "total" in data, "Response should have 'total' count"
        assert data["total"] == 10, f"Total should be 10, got {data['total']}"
        # Since already seeded, seeded count should be 0
        assert data["seeded"] == 0, f"Seeded should be 0 (already seeded), got {data['seeded']}"
        print("PASS: Seed endpoint returns seeded:0 when already seeded")


class TestLocalLandingPagesPublic:
    """Test public local landing pages endpoints"""
    
    def test_list_public_local_pages(self):
        """GET /api/seo/local-pages/public returns published local pages"""
        response = requests.get(f"{BASE_URL}/api/seo/local-pages/public")
        assert response.status_code == 200
        
        data = response.json()
        assert "pages" in data, "Response should have 'pages' key"
        
        pages = data["pages"]
        # All returned pages should be published
        for page in pages:
            assert page.get("status") == "published", f"Public pages should all be published, got {page.get('status')}"
        
        print(f"PASS: Public local-pages returns {len(pages)} published pages")
    
    def test_get_local_page_by_slug_atlanta(self):
        """GET /api/seo/local-pages/by-slug/credit-repair-atlanta returns correct city data"""
        response = requests.get(f"{BASE_URL}/api/seo/local-pages/by-slug/credit-repair-atlanta")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("city") == "Atlanta", f"City should be Atlanta, got {data.get('city')}"
        assert data.get("state") == "GA", f"State should be GA, got {data.get('state')}"
        assert data.get("slug") == "credit-repair-atlanta"
        assert "headline" in data, "Should have headline"
        assert "description" in data, "Should have description"
        assert "faqs" in data, "Should have FAQs"
        assert len(data.get("faqs", [])) >= 2, f"Atlanta should have at least 2 FAQs, got {len(data.get('faqs', []))}"
        
        print("PASS: credit-repair-atlanta returns correct city data with FAQs")
    
    def test_get_local_page_by_slug_philadelphia(self):
        """GET /api/seo/local-pages/by-slug/credit-repair-philadelphia returns correct city data"""
        response = requests.get(f"{BASE_URL}/api/seo/local-pages/by-slug/credit-repair-philadelphia")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("city") == "Philadelphia"
        assert data.get("state") == "PA"
        assert len(data.get("faqs", [])) >= 4, f"Philadelphia should have at least 4 FAQs"
        
        print("PASS: credit-repair-philadelphia returns correct city data")
    
    def test_get_local_page_by_slug_new_york(self):
        """GET /api/seo/local-pages/by-slug/credit-repair-new-york returns correct city data"""
        response = requests.get(f"{BASE_URL}/api/seo/local-pages/by-slug/credit-repair-new-york")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("city") == "New York"
        assert data.get("state") == "NY"
        assert len(data.get("faqs", [])) >= 3
        
        print("PASS: credit-repair-new-york returns correct city data")
    
    def test_get_local_page_invalid_slug_returns_404(self):
        """GET /api/seo/local-pages/by-slug/invalid-city returns 404"""
        response = requests.get(f"{BASE_URL}/api/seo/local-pages/by-slug/invalid-nonexistent-city")
        assert response.status_code == 404, f"Expected 404 for invalid slug, got {response.status_code}"
        print("PASS: Invalid slug returns 404")


class TestLocalPageSchemaGeneration:
    """Test that local landing pages get FAQPage schema when they have FAQs"""
    
    def test_local_page_with_faqs_gets_faq_schema(self):
        """Local page with FAQs should include FAQPage schema"""
        # First verify the page has FAQs via the by-slug endpoint
        page_response = requests.get(f"{BASE_URL}/api/seo/local-pages/by-slug/credit-repair-philadelphia")
        assert page_response.status_code == 200
        page_data = page_response.json()
        assert len(page_data.get("faqs", [])) >= 4, "Philadelphia page should have FAQs"
        
        # Now get schemas for that path
        schema_response = requests.get(f"{BASE_URL}/api/seo/page-schemas?path=/credit-repair-philadelphia")
        assert schema_response.status_code == 200
        
        schemas = schema_response.json().get("schemas", [])
        schema_types = [s.get("@type") for s in schemas]
        
        # Should have FAQPage because page has FAQs
        assert "FAQPage" in schema_types, f"Local page with FAQs should have FAQPage schema, got {schema_types}"
        
        # Verify FAQPage has correct structure
        faq_schema = next(s for s in schemas if s.get("@type") == "FAQPage")
        assert "mainEntity" in faq_schema, "FAQPage should have mainEntity"
        faq_items = faq_schema["mainEntity"]
        assert len(faq_items) >= 4, f"FAQPage should have at least 4 questions, got {len(faq_items)}"
        
        print("PASS: Local page with FAQs gets FAQPage schema with correct questions")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
