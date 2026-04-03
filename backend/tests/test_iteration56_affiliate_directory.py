"""
Iteration 56 - Affiliate Directory Page Tests
Tests the new /affiliate-partners directory page and its backend API endpoint.
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestAffiliateDirectoryAPI:
    """Tests for the affiliate directory public API endpoint"""
    
    def test_get_all_public_affiliates(self):
        """GET /api/affiliate-pages/public/all returns published affiliates"""
        response = requests.get(f"{BASE_URL}/api/affiliate-pages/public/all")
        assert response.status_code == 200
        
        data = response.json()
        assert "affiliates" in data
        affiliates = data["affiliates"]
        
        # Should have at least 2 seeded affiliates
        assert len(affiliates) >= 2
        print(f"✓ Found {len(affiliates)} published affiliates")
    
    def test_public_affiliates_have_required_fields(self):
        """Verify each affiliate has required display fields"""
        response = requests.get(f"{BASE_URL}/api/affiliate-pages/public/all")
        assert response.status_code == 200
        
        affiliates = response.json()["affiliates"]
        required_fields = ["id", "name", "slug", "affiliate_type", "status"]
        
        for aff in affiliates:
            for field in required_fields:
                assert field in aff, f"Missing field '{field}' in affiliate {aff.get('name', 'unknown')}"
            assert aff["status"] == "published", f"Non-published affiliate in public list: {aff['name']}"
        print(f"✓ All {len(affiliates)} affiliates have required fields")
    
    def test_public_affiliates_exclude_sensitive_data(self):
        """Verify sensitive fields are excluded from public endpoint"""
        response = requests.get(f"{BASE_URL}/api/affiliate-pages/public/all")
        assert response.status_code == 200
        
        affiliates = response.json()["affiliates"]
        sensitive_fields = ["created_by", "custom_form_html"]
        
        for aff in affiliates:
            for field in sensitive_fields:
                assert field not in aff, f"Sensitive field '{field}' exposed in public endpoint"
        print("✓ Sensitive fields properly excluded from public endpoint")
    
    def test_quandell_iglesia_in_directory(self):
        """Verify Quandell Iglesia (Real Estate) is in the directory"""
        response = requests.get(f"{BASE_URL}/api/affiliate-pages/public/all")
        assert response.status_code == 200
        
        affiliates = response.json()["affiliates"]
        quandell = next((a for a in affiliates if a.get("slug") == "quandell-iglesia-south-jersey-realtor"), None)
        
        assert quandell is not None, "Quandell Iglesia not found in directory"
        assert quandell["name"] == "Quandell Iglesia"
        assert quandell["affiliate_type"] == "real_estate"
        assert quandell["city"] == "South Jersey"
        assert quandell["state"] == "NJ"
        print("✓ Quandell Iglesia (Real Estate, South Jersey NJ) found in directory")
    
    def test_mr_ohana_credit_in_directory(self):
        """Verify Mr. Ohana Credit (Credit Repair Educator) is in the directory"""
        response = requests.get(f"{BASE_URL}/api/affiliate-pages/public/all")
        assert response.status_code == 200
        
        affiliates = response.json()["affiliates"]
        ohana = next((a for a in affiliates if a.get("slug") == "mr-ohana-credit-educator"), None)
        
        assert ohana is not None, "Mr. Ohana Credit not found in directory"
        assert ohana["display_name"] == "Mr. Ohana Credit"
        assert ohana["affiliate_type"] == "credit_repair_educator"
        print("✓ Mr. Ohana Credit (Credit Repair Educator) found in directory")
    
    def test_affiliate_types_endpoint(self):
        """GET /api/affiliate-pages/types returns all affiliate types"""
        response = requests.get(f"{BASE_URL}/api/affiliate-pages/types")
        assert response.status_code == 200
        
        data = response.json()
        assert "types" in data
        
        expected_types = ["real_estate", "social_media", "credit_repair_educator", "mortgage", "car_dealership"]
        for type_key in expected_types:
            assert type_key in data["types"], f"Missing affiliate type: {type_key}"
        
        print(f"✓ All 5 affiliate types present: {list(data['types'].keys())}")
    
    def test_get_affiliate_by_slug_quandell(self):
        """GET /api/affiliate-pages/public/by-slug/{slug} returns correct affiliate"""
        response = requests.get(f"{BASE_URL}/api/affiliate-pages/public/by-slug/quandell-iglesia-south-jersey-realtor")
        assert response.status_code == 200
        
        aff = response.json()
        assert aff["name"] == "Quandell Iglesia"
        assert aff["affiliate_type"] == "real_estate"
        assert aff["status"] == "published"
        assert "testimonials" in aff
        print("✓ GET by-slug returns Quandell Iglesia correctly")
    
    def test_get_affiliate_by_slug_ohana(self):
        """GET /api/affiliate-pages/public/by-slug/{slug} returns Mr. Ohana Credit"""
        response = requests.get(f"{BASE_URL}/api/affiliate-pages/public/by-slug/mr-ohana-credit-educator")
        assert response.status_code == 200
        
        aff = response.json()
        assert aff["display_name"] == "Mr. Ohana Credit"
        assert aff["affiliate_type"] == "credit_repair_educator"
        assert aff["status"] == "published"
        print("✓ GET by-slug returns Mr. Ohana Credit correctly")
    
    def test_get_affiliate_by_slug_not_found(self):
        """GET /api/affiliate-pages/public/by-slug/{slug} returns 404 for invalid slug"""
        response = requests.get(f"{BASE_URL}/api/affiliate-pages/public/by-slug/nonexistent-affiliate-slug")
        assert response.status_code == 404
        print("✓ GET by-slug returns 404 for nonexistent slug")
    
    def test_affiliates_sorted_alphabetically(self):
        """Verify affiliates are sorted by name"""
        response = requests.get(f"{BASE_URL}/api/affiliate-pages/public/all")
        assert response.status_code == 200
        
        affiliates = response.json()["affiliates"]
        names = [a["name"] for a in affiliates]
        sorted_names = sorted(names)
        
        assert names == sorted_names, f"Affiliates not sorted: {names} vs {sorted_names}"
        print(f"✓ Affiliates sorted alphabetically: {names}")


class TestFrontendRouteAccess:
    """Tests for frontend route accessibility"""
    
    def test_affiliate_directory_page_loads(self):
        """GET /affiliate-partners returns 200 (SPA - content rendered client-side)"""
        response = requests.get(f"{BASE_URL}/affiliate-partners", timeout=10)
        assert response.status_code == 200
        # React SPA - actual content is rendered client-side via JavaScript
        # Just verify the page shell loads (200 status)
        print("✓ /affiliate-partners page loads successfully (status 200)")
    
    def test_affiliate_landing_page_quandell(self):
        """GET /p/quandell-iglesia-south-jersey-realtor returns 200"""
        response = requests.get(f"{BASE_URL}/p/quandell-iglesia-south-jersey-realtor", timeout=10)
        assert response.status_code == 200
        print("✓ /p/quandell-iglesia-south-jersey-realtor landing page loads")
    
    def test_affiliate_landing_page_ohana(self):
        """GET /p/mr-ohana-credit-educator returns 200"""
        response = requests.get(f"{BASE_URL}/p/mr-ohana-credit-educator", timeout=10)
        assert response.status_code == 200
        print("✓ /p/mr-ohana-credit-educator landing page loads")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
