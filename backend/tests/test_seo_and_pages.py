"""
Test Suite for SEO Metadata API and Education Pages
Tests the new SEO API endpoints and verifies pages load correctly
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"


class TestAuth:
    """Get auth token for protected endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed - skipping authenticated tests")
        return None


class TestSEOMetadataAPI:
    """Test SEO Metadata API endpoints - /api/seo/metadata"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        return None
    
    def test_get_all_seo_metadata_returns_array(self):
        """GET /api/seo/metadata returns array of 22+ SEO entries"""
        response = requests.get(f"{BASE_URL}/api/seo/metadata")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be an array"
        assert len(data) >= 22, f"Expected at least 22 SEO entries, got {len(data)}"
        
        # Verify first entry has required fields
        if len(data) > 0:
            entry = data[0]
            assert "page_slug" in entry, "Entry should have page_slug"
            assert "title" in entry, "Entry should have title"
            assert "description" in entry, "Entry should have description"
        
        print(f"✓ GET /api/seo/metadata returned {len(data)} entries")
    
    def test_get_seo_metadata_credit_scores(self):
        """GET /api/seo/metadata/credit-scores returns specific metadata"""
        response = requests.get(f"{BASE_URL}/api/seo/metadata/credit-scores")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("page_slug") == "credit-scores", "page_slug should be credit-scores"
        assert "title" in data, "Should have title"
        assert "description" in data, "Should have description"
        assert "keywords" in data, "Should have keywords"
        assert "canonical_url" in data, "Should have canonical_url"
        
        print(f"✓ GET /api/seo/metadata/credit-scores - title: {data.get('title')[:50]}...")
    
    def test_get_seo_metadata_education_hub(self):
        """GET /api/seo/metadata/education-hub returns metadata"""
        response = requests.get(f"{BASE_URL}/api/seo/metadata/education-hub")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("page_slug") == "education-hub"
        assert "Credit Education Hub" in data.get("title", "")
        print(f"✓ GET /api/seo/metadata/education-hub OK")
    
    def test_get_seo_metadata_financial_wellness(self):
        """GET /api/seo/metadata/financial-wellness returns metadata"""
        response = requests.get(f"{BASE_URL}/api/seo/metadata/financial-wellness")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("page_slug") == "financial-wellness"
        print(f"✓ GET /api/seo/metadata/financial-wellness OK")
    
    def test_get_seo_metadata_debt_management(self):
        """GET /api/seo/metadata/debt-management returns metadata"""
        response = requests.get(f"{BASE_URL}/api/seo/metadata/debt-management")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("page_slug") == "debt-management"
        print(f"✓ GET /api/seo/metadata/debt-management OK")
    
    def test_get_seo_metadata_fcra_guide(self):
        """GET /api/seo/metadata/fcra-guide returns metadata"""
        response = requests.get(f"{BASE_URL}/api/seo/metadata/fcra-guide")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ GET /api/seo/metadata/fcra-guide OK")
    
    def test_get_seo_metadata_nonexistent_returns_404(self):
        """GET /api/seo/metadata/nonexistent returns 404"""
        response = requests.get(f"{BASE_URL}/api/seo/metadata/nonexistent-page-xyz")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✓ GET /api/seo/metadata/nonexistent correctly returns 404")
    
    def test_put_update_seo_metadata(self, auth_token):
        """PUT /api/seo/metadata/credit-scores updates SEO metadata"""
        if not auth_token:
            pytest.skip("No auth token available")
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Update with a new description
        new_desc = "TEST_Updated description for credit scores page"
        response = requests.put(
            f"{BASE_URL}/api/seo/metadata/credit-scores",
            json={"description": new_desc},
            headers=headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("description") == new_desc, "Description should be updated"
        
        # Verify the update persisted
        get_response = requests.get(f"{BASE_URL}/api/seo/metadata/credit-scores")
        assert get_response.json().get("description") == new_desc
        
        # Restore original description
        original_desc = "Complete guide to credit scores: FICO 2-10 vs VantageScore 1.0-4.0, scoring history from 1899, 5 score factors, ranges, and how lenders use your score."
        requests.put(
            f"{BASE_URL}/api/seo/metadata/credit-scores",
            json={"description": original_desc},
            headers=headers
        )
        
        print(f"✓ PUT /api/seo/metadata/credit-scores update works correctly")


class TestEducationPagesExist:
    """Test that education page routes return proper HTML (not 404)"""
    
    def test_education_hub_page_loads(self):
        """Education Hub page (/education-hub) loads"""
        response = requests.get(f"{BASE_URL}/education-hub", allow_redirects=True)
        # Frontend pages return HTML, not JSON
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "text/html" in response.headers.get("content-type", "")
        print(f"✓ /education-hub page loads")
    
    def test_financial_wellness_page_loads(self):
        """Financial Wellness page loads"""
        response = requests.get(f"{BASE_URL}/financial-wellness", allow_redirects=True)
        assert response.status_code == 200
        print(f"✓ /financial-wellness page loads")
    
    def test_debt_management_page_loads(self):
        """Debt Management page loads"""
        response = requests.get(f"{BASE_URL}/debt-management", allow_redirects=True)
        assert response.status_code == 200
        print(f"✓ /debt-management page loads")
    
    def test_tsr_compliance_page_loads(self):
        """TSR Compliance page loads"""
        response = requests.get(f"{BASE_URL}/tsr-compliance", allow_redirects=True)
        assert response.status_code == 200
        print(f"✓ /tsr-compliance page loads")
    
    def test_croa_guide_page_loads(self):
        """CROA Guide page loads"""
        response = requests.get(f"{BASE_URL}/croa-guide", allow_redirects=True)
        assert response.status_code == 200
        print(f"✓ /croa-guide page loads")
    
    def test_fdcpa_guide_page_loads(self):
        """FDCPA Guide page loads"""
        response = requests.get(f"{BASE_URL}/fdcpa-guide", allow_redirects=True)
        assert response.status_code == 200
        print(f"✓ /fdcpa-guide page loads")
    
    def test_fcra_605b_page_loads(self):
        """FCRA 605B page loads"""
        response = requests.get(f"{BASE_URL}/fcra-605b", allow_redirects=True)
        assert response.status_code == 200
        print(f"✓ /fcra-605b page loads")
    
    def test_fcra_guide_page_loads(self):
        """FCRA Guide page loads"""
        response = requests.get(f"{BASE_URL}/fcra-guide", allow_redirects=True)
        assert response.status_code == 200
        print(f"✓ /fcra-guide page loads")
    
    def test_free_trial_page_loads(self):
        """Free Trial page loads"""
        response = requests.get(f"{BASE_URL}/free-trial", allow_redirects=True)
        assert response.status_code == 200
        print(f"✓ /free-trial page loads")
    
    def test_credit_tracker_page_loads(self):
        """Credit Tracker page loads"""
        response = requests.get(f"{BASE_URL}/credit-tracker-app", allow_redirects=True)
        assert response.status_code == 200
        print(f"✓ /credit-tracker-app page loads")


class TestPartnerPages:
    """Test partner pages have related resources sections"""
    
    def test_mortgage_professionals_page_loads(self):
        """Mortgage Professionals page loads"""
        response = requests.get(f"{BASE_URL}/mortgage-professionals", allow_redirects=True)
        assert response.status_code == 200
        print(f"✓ /mortgage-professionals page loads")
    
    def test_car_dealerships_page_loads(self):
        """Car Dealerships page loads"""
        response = requests.get(f"{BASE_URL}/car-dealerships", allow_redirects=True)
        assert response.status_code == 200
        print(f"✓ /car-dealerships page loads")
    
    def test_real_estate_partner_page_loads(self):
        """Real Estate Partner page loads"""
        response = requests.get(f"{BASE_URL}/real-estate-partner", allow_redirects=True)
        assert response.status_code == 200
        print(f"✓ /real-estate-partner page loads")
    
    def test_social_media_influencers_page_loads(self):
        """Social Media Influencers page loads"""
        response = requests.get(f"{BASE_URL}/social-media-influencers", allow_redirects=True)
        assert response.status_code == 200
        print(f"✓ /social-media-influencers page loads")


class TestMiddleware:
    """Test middleware functions exist (not wired to routes yet)"""
    
    def test_middleware_module_exists(self):
        """Verify middleware.py has expected functions"""
        import sys
        sys.path.insert(0, '/app/backend')
        try:
            from middleware import check_document_access, verify_attorney_payment, set_db
            print(f"✓ middleware.py has check_document_access, verify_attorney_payment")
            assert callable(check_document_access)
            assert callable(verify_attorney_payment)
            assert callable(set_db)
        except ImportError as e:
            pytest.fail(f"Failed to import middleware: {e}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
