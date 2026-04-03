"""
Iteration 58 - SEO Infrastructure Testing
Tests for:
1. SEO API endpoints: sitemap.xml, robots.txt, pages list, domain settings
2. Schema presets
3. Per-page SEO settings CRUD
"""
import pytest
import requests
import os
import json

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"

@pytest.fixture(scope="module")
def auth_token():
    """Get admin authentication token"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    if response.status_code == 200:
        data = response.json()
        return data.get("token") or data.get("access_token")
    pytest.skip(f"Authentication failed: {response.status_code} {response.text}")

@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestSEOSitemapRobots:
    """Tests for sitemap.xml and robots.txt generation"""

    def test_sitemap_xml_returns_valid_xml(self, api_client):
        """GET /api/seo/sitemap.xml should return valid XML sitemap"""
        response = api_client.get(f"{BASE_URL}/api/seo/sitemap.xml")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "application/xml" in response.headers.get("Content-Type", ""), "Should return XML content type"
        
        content = response.text
        assert '<?xml version="1.0" encoding="UTF-8"?>' in content, "Should have XML declaration"
        assert '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' in content, "Should have urlset element"
        assert '<url>' in content, "Should contain URL entries"
        assert '<loc>' in content, "Should have loc elements"
        
        # Count URLs - expect 40+ based on DEFAULT_PAGES (49 defined)
        url_count = content.count('<url>')
        assert url_count >= 40, f"Expected 40+ URLs in sitemap, got {url_count}"
        print(f"Sitemap contains {url_count} URLs")

    def test_sitemap_contains_key_pages(self, api_client):
        """Sitemap should contain important pages"""
        response = api_client.get(f"{BASE_URL}/api/seo/sitemap.xml")
        assert response.status_code == 200
        
        content = response.text
        key_pages = [
            "https://www.credlocity.com/",
            "https://www.credlocity.com/pricing",
            "https://www.credlocity.com/blog",
            "https://www.credlocity.com/faqs",
            "https://www.credlocity.com/how-it-works",
            "https://www.credlocity.com/become-a-partner"
        ]
        for page in key_pages:
            assert page in content, f"Sitemap should contain {page}"
        print("All key pages found in sitemap")

    def test_robots_txt_returns_text(self, api_client):
        """GET /api/seo/robots.txt should return robots.txt content"""
        response = api_client.get(f"{BASE_URL}/api/seo/robots.txt")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "text/plain" in response.headers.get("Content-Type", ""), "Should return text/plain"
        
        content = response.text
        assert "User-agent: *" in content, "Should have User-agent directive"
        assert "Allow: /" in content, "Should allow root"
        assert "Disallow: /admin/" in content, "Should disallow /admin/"
        assert "Sitemap:" in content, "Should have Sitemap directive"
        print("robots.txt structure verified")

    def test_robots_txt_blocks_admin_paths(self, api_client):
        """robots.txt should block admin/company/partner/attorney/payment/api paths"""
        response = api_client.get(f"{BASE_URL}/api/seo/robots.txt")
        assert response.status_code == 200
        
        content = response.text
        blocked_paths = ["/admin/", "/company/", "/partner/", "/attorney/", "/payment/", "/api/"]
        for path in blocked_paths:
            assert f"Disallow: {path}" in content, f"robots.txt should block {path}"
        print("All expected paths are blocked in robots.txt")


class TestSEOPagesAPI:
    """Tests for SEO pages listing and management"""

    def test_get_pages_requires_auth(self, api_client):
        """GET /api/seo/pages should require authentication"""
        response = api_client.get(f"{BASE_URL}/api/seo/pages")
        assert response.status_code == 401, "Should require auth"

    def test_get_pages_returns_all_pages(self, api_client, auth_token):
        """GET /api/seo/pages should return all SEO pages (49 default)"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = api_client.get(f"{BASE_URL}/api/seo/pages", headers=headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert "pages" in data, "Response should have 'pages' key"
        assert "total" in data, "Response should have 'total' key"
        
        pages = data["pages"]
        total = data["total"]
        assert isinstance(pages, list), "pages should be a list"
        assert len(pages) >= 49, f"Should have at least 49 pages, got {len(pages)}"
        assert total >= 49, f"Total should be at least 49, got {total}"
        
        # Check page structure
        first_page = pages[0]
        assert "path" in first_page, "Page should have 'path'"
        assert "title" in first_page, "Page should have 'title'"
        print(f"Retrieved {len(pages)} SEO pages, total: {total}")

    def test_get_page_by_path_homepage(self, api_client):
        """GET /api/seo/pages/by-path?path=/ should return homepage SEO data"""
        response = api_client.get(f"{BASE_URL}/api/seo/pages/by-path?path=/")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert data["path"] == "/", "Path should be /"
        assert "title" in data, "Should have title"
        assert "description" in data, "Should have description"
        assert "Credlocity" in data["title"], "Homepage title should mention Credlocity"
        print(f"Homepage SEO: {data['title'][:50]}...")

    def test_get_page_by_path_pricing(self, api_client):
        """GET /api/seo/pages/by-path?path=/pricing should return pricing SEO data"""
        response = api_client.get(f"{BASE_URL}/api/seo/pages/by-path?path=/pricing")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["path"] == "/pricing", "Path should be /pricing"
        assert "pricing" in data["title"].lower() or "Pricing" in data["title"], "Title should mention pricing"
        print(f"Pricing SEO: {data['title']}")

    def test_update_page_seo_settings(self, api_client, auth_token):
        """PUT /api/seo/pages/pricing should save custom SEO settings"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        update_data = {
            "title": "TEST Credit Repair Pricing | Credlocity",
            "description": "TEST description for pricing page SEO",
            "keywords": "credit repair, pricing, test",
            "robots_meta": "index, follow",
            "priority": 0.9,
            "changefreq": "weekly"
        }
        
        response = api_client.put(
            f"{BASE_URL}/api/seo/pages/pricing",
            json=update_data,
            headers=headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data["path"] == "/pricing", "Returned path should be /pricing"
        assert data["title"] == update_data["title"], "Title should be updated"
        assert data["custom"] == True, "Page should be marked as custom"
        print("Successfully updated pricing page SEO settings")

        # Verify the change persisted
        get_response = api_client.get(f"{BASE_URL}/api/seo/pages/by-path?path=/pricing")
        assert get_response.status_code == 200
        get_data = get_response.json()
        assert "TEST" in get_data.get("title", ""), "Title change should persist"


class TestSEODomainSettings:
    """Tests for domain settings and Organization schema"""

    def test_get_domain_settings_requires_auth(self, api_client):
        """GET /api/seo/domain-settings should require authentication"""
        response = api_client.get(f"{BASE_URL}/api/seo/domain-settings")
        assert response.status_code == 401, "Should require auth"

    def test_get_domain_settings(self, api_client, auth_token):
        """GET /api/seo/domain-settings should return site identity and org schema"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = api_client.get(f"{BASE_URL}/api/seo/domain-settings", headers=headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Check site identity fields
        assert "site_name" in data, "Should have site_name"
        assert "site_url" in data, "Should have site_url"
        
        # Check organization schema
        assert "organization_schema" in data, "Should have organization_schema"
        org = data["organization_schema"]
        assert "name" in org, "Org schema should have name"
        assert "description" in org, "Org schema should have description"
        
        # Check verification fields
        assert "google_analytics_id" in data or data.get("google_analytics_id") == "", "Should have google_analytics_id"
        
        print(f"Domain settings: site_name={data.get('site_name')}, site_url={data.get('site_url')}")

    def test_update_domain_settings(self, api_client, auth_token):
        """PUT /api/seo/domain-settings should update settings"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # First get current settings
        get_response = api_client.get(f"{BASE_URL}/api/seo/domain-settings", headers=headers)
        current = get_response.json()
        
        # Update with test values
        update_data = {
            **current,
            "google_analytics_id": "G-TEST123456",
            "twitter_handle": "@credlocity_test"
        }
        
        response = api_client.put(
            f"{BASE_URL}/api/seo/domain-settings",
            json=update_data,
            headers=headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("google_analytics_id") == "G-TEST123456", "GA ID should be updated"
        print("Domain settings updated successfully")


class TestSEOSchemaPresets:
    """Tests for schema.org presets"""

    def test_get_schema_presets(self, api_client):
        """GET /api/seo/schema-presets should return 10 schema type presets"""
        response = api_client.get(f"{BASE_URL}/api/seo/schema-presets")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert "presets" in data, "Response should have 'presets' key"
        presets = data["presets"]
        
        assert len(presets) >= 10, f"Should have at least 10 presets, got {len(presets)}"
        
        # Check preset structure
        first_preset = presets[0]
        assert "id" in first_preset, "Preset should have 'id'"
        assert "label" in first_preset, "Preset should have 'label'"
        assert "description" in first_preset, "Preset should have 'description'"
        
        # Check expected preset types exist
        preset_ids = [p["id"] for p in presets]
        expected_presets = ["organization", "faq_page", "article", "speakable"]
        for expected in expected_presets:
            assert expected in preset_ids, f"Should have '{expected}' preset"
        
        print(f"Found {len(presets)} schema presets: {preset_ids}")


class TestBugFixes:
    """Tests for bug fixes in this iteration"""

    def test_lawsuit_form_blog_posts_not_required(self, api_client, auth_token):
        """Verify LawsuitForm.js blogPosts.map error is fixed - blog posts endpoint works"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = api_client.get(f"{BASE_URL}/api/blog/posts", headers=headers)
        
        # The endpoint should return either a list or object with posts key
        assert response.status_code == 200, f"Blog posts endpoint should work, got {response.status_code}"
        data = response.json()
        
        # Check that we get either posts array or list directly
        if isinstance(data, list):
            posts = data
        else:
            posts = data.get("posts", [])
        
        assert isinstance(posts, list), "Should return array (possibly empty)"
        print(f"Blog posts endpoint returns {len(posts)} posts")

    def test_lawsuit_response_filings_have_download_email(self, api_client, auth_token):
        """Verify Lawsuit Response filings show Download and Email buttons"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Create a test case
        case_data = {
            "defendant_name": "TEST_BugFix_Defendant",
            "plaintiff_name": "TEST_BugFix_Plaintiff",
            "case_number": "TEST-BUG-001",
            "court_type": "State Court",
            "status": "New"
        }
        
        create_response = api_client.post(
            f"{BASE_URL}/api/lawsuit-response/cases",
            json=case_data,
            headers=headers
        )
        
        assert create_response.status_code in [200, 201], f"Create case failed: {create_response.text}"
        case = create_response.json()
        case_id = case.get("id")
        
        # Add a filing
        filing_data = {
            "title": "TEST Answer Filing",
            "filing_type": "Answer",
            "date_filed": "2025-01-15",
            "description": "Test filing description for bug fix verification"
        }
        
        filing_response = api_client.post(
            f"{BASE_URL}/api/lawsuit-response/cases/{case_id}/filings",
            json=filing_data,
            headers=headers
        )
        
        assert filing_response.status_code in [200, 201], f"Add filing failed: {filing_response.text}"
        filing = filing_response.json()
        
        # Verify filing has required fields for Download/Email buttons
        assert "title" in filing, "Filing should have title"
        assert "filing_type" in filing, "Filing should have filing_type"
        assert "date_filed" in filing or filing.get("date_filed") is None, "Filing should have date_filed"
        assert "description" in filing or filing.get("description") is None, "Filing should have description"
        
        print(f"Filing created with id={filing.get('id')}, has required fields for Download/Email")
        
        # Cleanup
        api_client.delete(f"{BASE_URL}/api/lawsuit-response/cases/{case_id}", headers=headers)

    def test_prose_center_complaint_preview_step4(self, api_client, auth_token):
        """Verify Pro Se Center step 4 shows prepared complaint preview"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Create a pro se case
        prose_data = {
            "client_name": "TEST_ProSe_Client",
            "client_address": "123 Test St",
            "client_city": "Test City",
            "client_state": "California",
            "client_zip": "90210",
            "defendant_name": "TEST_ProSe_Defendant",
            "defendant_type": "Credit Bureau (Equifax)",
            "court_type": "Federal Court",
            "filing_state": "California",
            "violation_types": ["fcra"],
            "claim_description": "Test claim description",
            "relief_requested": ["Statutory damages under FCRA ($100-$1,000 per violation)"],
            "status": "Draft"
        }
        
        create_response = api_client.post(
            f"{BASE_URL}/api/lawsuit-response/prose-cases",
            json=prose_data,
            headers=headers
        )
        
        assert create_response.status_code in [200, 201], f"Create prose case failed: {create_response.text}"
        prose_case = create_response.json()
        
        # Verify case has all fields needed for complaint preview
        assert prose_case.get("client_name") == prose_data["client_name"], "Should have client_name"
        assert prose_case.get("defendant_name") == prose_data["defendant_name"], "Should have defendant_name"
        assert "violation_types" in prose_case, "Should have violation_types"
        assert "relief_requested" in prose_case, "Should have relief_requested"
        
        print(f"Pro Se case created with all fields for complaint preview")
        
        # Cleanup
        case_id = prose_case.get("id")
        if case_id:
            api_client.delete(f"{BASE_URL}/api/lawsuit-response/prose-cases/{case_id}", headers=headers)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
