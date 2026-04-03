"""
Iteration 55 - Affiliate Landing Pages API Tests
Tests: /api/affiliate-pages/* endpoints for CRUD and public access
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://rep-dashboard-11.preview.emergentagent.com')


# ==================== Public Endpoints (No Auth) ====================

class TestPublicAffiliateEndpoints:
    """Tests for public affiliate endpoints - no authentication required"""

    def test_get_affiliate_types(self):
        """GET /api/affiliate-pages/types returns all 5 affiliate types"""
        response = requests.get(f"{BASE_URL}/api/affiliate-pages/types")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "types" in data, "Response should contain 'types' key"
        
        types = data["types"]
        expected_types = ["real_estate", "social_media", "credit_repair_educator", "mortgage", "car_dealership"]
        
        for t in expected_types:
            assert t in types, f"Missing affiliate type: {t}"
        
        # Verify labels
        assert types["real_estate"] == "Real Estate"
        assert types["social_media"] == "Social Media"
        assert types["credit_repair_educator"] == "Credit Repair Educator"
        assert types["mortgage"] == "Mortgage"
        assert types["car_dealership"] == "Car Dealership"
        print(f"PASS: GET /api/affiliate-pages/types returns all 5 types: {list(types.keys())}")

    def test_get_all_public_affiliates(self):
        """GET /api/affiliate-pages/public/all returns published affiliates with affiliate_type"""
        response = requests.get(f"{BASE_URL}/api/affiliate-pages/public/all")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "affiliates" in data, "Response should contain 'affiliates' key"
        
        affiliates = data["affiliates"]
        assert len(affiliates) >= 2, f"Expected at least 2 seeded affiliates, got {len(affiliates)}"
        
        # Verify all affiliates have affiliate_type field
        for aff in affiliates:
            assert "affiliate_type" in aff, f"Affiliate {aff.get('name')} missing affiliate_type"
            assert aff["affiliate_type"] in ["real_estate", "social_media", "credit_repair_educator", "mortgage", "car_dealership"]
            assert aff["status"] == "published", f"Non-published affiliate in public endpoint: {aff.get('name')}"
        
        print(f"PASS: GET /api/affiliate-pages/public/all returns {len(affiliates)} affiliates with affiliate_type")

    def test_get_mr_ohana_by_slug(self):
        """GET /api/affiliate-pages/public/by-slug/mr-ohana-credit-educator returns Mark Santiago data"""
        response = requests.get(f"{BASE_URL}/api/affiliate-pages/public/by-slug/mr-ohana-credit-educator")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["name"] == "Mark Santiago", f"Expected 'Mark Santiago', got '{data.get('name')}'"
        assert data["display_name"] == "Mr. Ohana Credit", f"Expected 'Mr. Ohana Credit', got '{data.get('display_name')}'"
        assert data["slug"] == "mr-ohana-credit-educator"
        assert data["affiliate_type"] == "credit_repair_educator"
        assert data["status"] == "published"
        assert "bio" in data
        assert "tagline" in data
        assert "social_media" in data
        assert "services_highlight" in data
        print(f"PASS: GET /api/affiliate-pages/public/by-slug/mr-ohana-credit-educator returns Mark Santiago (Credit Repair Educator)")

    def test_get_quandell_by_slug(self):
        """GET /api/affiliate-pages/public/by-slug/quandell-iglesia-south-jersey-realtor returns Quandell data"""
        response = requests.get(f"{BASE_URL}/api/affiliate-pages/public/by-slug/quandell-iglesia-south-jersey-realtor")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["name"] == "Quandell Iglesia", f"Expected 'Quandell Iglesia', got '{data.get('name')}'"
        assert data["slug"] == "quandell-iglesia-south-jersey-realtor"
        assert data["affiliate_type"] == "real_estate"
        assert data["status"] == "published"
        assert data["city"] == "South Jersey"
        assert data["state"] == "NJ"
        assert "testimonials" in data
        assert len(data.get("testimonials", [])) >= 2, "Quandell should have at least 2 testimonials"
        print(f"PASS: GET /api/affiliate-pages/public/by-slug/quandell-iglesia-south-jersey-realtor returns Quandell (Real Estate)")

    def test_get_nonexistent_affiliate_returns_404(self):
        """GET /api/affiliate-pages/public/by-slug/nonexistent returns 404"""
        response = requests.get(f"{BASE_URL}/api/affiliate-pages/public/by-slug/nonexistent-affiliate-slug")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: GET /api/affiliate-pages/public/by-slug/nonexistent returns 404")


# ==================== Admin Endpoints (Auth Required) ====================

class TestAdminAffiliateEndpoints:
    """Tests for admin affiliate endpoints - authentication required"""

    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "Admin@credlocity.com", "password": "Credit123!"}
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")

    def test_admin_list_affiliates_requires_auth(self):
        """GET /api/affiliate-pages (admin list) requires authentication"""
        response = requests.get(f"{BASE_URL}/api/affiliate-pages")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: GET /api/affiliate-pages requires authentication (401)")

    def test_admin_list_affiliates_with_auth(self, auth_token):
        """GET /api/affiliate-pages with auth returns affiliates list"""
        response = requests.get(
            f"{BASE_URL}/api/affiliate-pages",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "affiliates" in data
        assert "total" in data
        assert data["total"] >= 2, f"Expected at least 2 affiliates, got {data['total']}"
        print(f"PASS: GET /api/affiliate-pages returns {data['total']} affiliates")

    def test_admin_filter_by_type(self, auth_token):
        """GET /api/affiliate-pages?affiliate_type=real_estate filters correctly"""
        response = requests.get(
            f"{BASE_URL}/api/affiliate-pages?affiliate_type=real_estate",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        for aff in data["affiliates"]:
            assert aff["affiliate_type"] == "real_estate"
        print(f"PASS: Filter by affiliate_type=real_estate returns {len(data['affiliates'])} affiliates")

    def test_admin_get_single_affiliate(self, auth_token):
        """GET /api/affiliate-pages/{id} returns single affiliate"""
        # First get list to get an ID
        list_response = requests.get(
            f"{BASE_URL}/api/affiliate-pages",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        affiliates = list_response.json()["affiliates"]
        if not affiliates:
            pytest.skip("No affiliates found")
        
        affiliate_id = affiliates[0]["id"]
        response = requests.get(
            f"{BASE_URL}/api/affiliate-pages/{affiliate_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == affiliate_id
        print(f"PASS: GET /api/affiliate-pages/{affiliate_id} returns correct affiliate")

    def test_admin_create_affiliate(self, auth_token):
        """POST /api/affiliate-pages creates new affiliate"""
        new_affiliate = {
            "name": "TEST_Pytest Affiliate",
            "display_name": "Pytest Test Partner",
            "affiliate_type": "mortgage",
            "status": "draft",
            "bio": "This is a test affiliate created by pytest",
            "tagline": "Testing made easy",
            "city": "Test City",
            "state": "TS"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/affiliate-pages",
            json=new_affiliate,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["name"] == new_affiliate["name"]
        assert data["affiliate_type"] == "mortgage"
        assert "id" in data
        assert "slug" in data
        
        # Clean up - delete test affiliate
        delete_response = requests.delete(
            f"{BASE_URL}/api/affiliate-pages/{data['id']}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert delete_response.status_code == 200
        print(f"PASS: POST /api/affiliate-pages creates and DELETE removes affiliate")

    def test_admin_update_affiliate(self, auth_token):
        """PUT /api/affiliate-pages/{id} updates affiliate"""
        # Create test affiliate
        create_response = requests.post(
            f"{BASE_URL}/api/affiliate-pages",
            json={
                "name": "TEST_Update Affiliate",
                "affiliate_type": "car_dealership",
                "status": "draft"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        affiliate_id = create_response.json()["id"]
        
        # Update it
        update_response = requests.put(
            f"{BASE_URL}/api/affiliate-pages/{affiliate_id}",
            json={
                "tagline": "Updated tagline",
                "status": "published"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert update_response.status_code == 200
        updated = update_response.json()
        assert updated["tagline"] == "Updated tagline"
        assert updated["status"] == "published"
        
        # Clean up
        requests.delete(
            f"{BASE_URL}/api/affiliate-pages/{affiliate_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        print(f"PASS: PUT /api/affiliate-pages/{affiliate_id} updates affiliate")

    def test_admin_create_requires_name(self, auth_token):
        """POST /api/affiliate-pages without name returns 422"""
        response = requests.post(
            f"{BASE_URL}/api/affiliate-pages",
            json={"affiliate_type": "social_media"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print("PASS: POST /api/affiliate-pages without name returns 422")


# ==================== Data Validation Tests ====================

class TestAffiliateDataValidation:
    """Tests for affiliate data structure and validation"""

    def test_public_affiliate_has_required_fields(self):
        """Public affiliate response has all required fields"""
        response = requests.get(f"{BASE_URL}/api/affiliate-pages/public/by-slug/mr-ohana-credit-educator")
        data = response.json()
        
        required_fields = [
            "id", "name", "display_name", "slug", "affiliate_type", "status",
            "bio", "tagline", "social_media", "seo_title", "seo_description"
        ]
        
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        # Should NOT expose created_by (private field)
        assert "created_by" not in data, "created_by should not be exposed in public endpoint"
        print("PASS: Public affiliate has all required fields and excludes private fields")

    def test_public_all_excludes_custom_form_html(self):
        """GET /api/affiliate-pages/public/all excludes custom_form_html for security"""
        response = requests.get(f"{BASE_URL}/api/affiliate-pages/public/all")
        data = response.json()
        
        for aff in data["affiliates"]:
            assert "custom_form_html" not in aff, f"custom_form_html should be excluded from public/all for {aff['name']}"
        
        print("PASS: GET /api/affiliate-pages/public/all excludes custom_form_html")

    def test_by_slug_includes_custom_form_html(self):
        """GET /api/affiliate-pages/public/by-slug/{slug} includes custom_form_html"""
        response = requests.get(f"{BASE_URL}/api/affiliate-pages/public/by-slug/mr-ohana-credit-educator")
        data = response.json()
        
        # Should include custom_form_html (even if empty) for landing page rendering
        assert "custom_form_html" in data, "custom_form_html should be included in by-slug endpoint"
        print("PASS: GET /api/affiliate-pages/public/by-slug includes custom_form_html")
