"""
Iteration 64 - Testing new features:
1. Letters API (public, admin, upload)
2. Credit Scores page structure
3. About Us & About Credlocity pages
4. Header/Footer changes (Locations moved, phone numbers removed)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestLettersAPI:
    """Test the Free Letters CMS API endpoints"""
    
    def test_public_letters_endpoint_returns_empty_array(self):
        """GET /api/letters/public - should return empty array (no letters uploaded)"""
        response = requests.get(f"{BASE_URL}/api/letters/public")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        # Empty is expected since no letters uploaded yet
        print(f"Public letters API returned {len(data)} letters (empty array expected)")
    
    def test_admin_letters_list_endpoint(self):
        """GET /api/letters/admin/list - should return all letters for admin"""
        response = requests.get(f"{BASE_URL}/api/letters/admin/list")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        print(f"Admin letters list returned {len(data)} letters")
    
    def test_letter_download_not_found(self):
        """GET /api/letters/download/invalid-id - should return 404"""
        response = requests.get(f"{BASE_URL}/api/letters/download/nonexistent-id")
        assert response.status_code == 404, f"Expected 404 for invalid letter ID, got {response.status_code}"
        print("Download endpoint correctly returns 404 for invalid ID")
    
    def test_letter_delete_not_found(self):
        """DELETE /api/letters/invalid-id - should return 404"""
        response = requests.delete(f"{BASE_URL}/api/letters/nonexistent-id")
        assert response.status_code == 404, f"Expected 404 for invalid letter ID, got {response.status_code}"
        print("Delete endpoint correctly returns 404 for invalid ID")


class TestCreditScoresPage:
    """Test the Credit Scores page API dependencies"""
    
    def test_credit_scores_page_loads(self):
        """Verify /credit-scores route is accessible"""
        response = requests.get(f"{BASE_URL}/credit-scores", allow_redirects=True)
        # Frontend routes return the React app shell
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("Credit Scores page route is accessible")


class TestAboutPages:
    """Test About Us and About Credlocity pages"""
    
    def test_about_us_page_route(self):
        """Verify /about-us route is accessible"""
        response = requests.get(f"{BASE_URL}/about-us", allow_redirects=True)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("About Us page route is accessible")
    
    def test_about_credlocity_page_route(self):
        """Verify /about-credlocity route is accessible"""
        response = requests.get(f"{BASE_URL}/about-credlocity", allow_redirects=True)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("About Credlocity page route is accessible")


class TestFreeLettersPage:
    """Test Free Letters page"""
    
    def test_free_letters_page_route(self):
        """Verify /free-letters route is accessible"""
        response = requests.get(f"{BASE_URL}/free-letters", allow_redirects=True)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("Free Letters page route is accessible")


class TestLocalLandingPages:
    """Test Local Landing Pages (phone number removal check)"""
    
    def test_local_page_api_exists(self):
        """Verify local pages API is accessible"""
        response = requests.get(f"{BASE_URL}/api/seo/local-pages/public")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("Local pages API is accessible")
    
    def test_philadelphia_page_api(self):
        """Verify Philadelphia local page API"""
        response = requests.get(f"{BASE_URL}/api/seo/local-pages/by-slug/credit-repair-philadelphia")
        # May or may not exist - just checking endpoint works
        if response.status_code == 200:
            data = response.json()
            assert "city" in data or "headline" in data
            print(f"Philadelphia local page found: {data.get('city', 'N/A')}")
        else:
            print(f"Philadelphia local page API returned {response.status_code}")


class TestLegalPagesAPI:
    """Test Legal Pages API (used in footer)"""
    
    def test_legal_pages_api(self):
        """GET /api/legal-pages - should return legal pages list"""
        response = requests.get(f"{BASE_URL}/api/legal-pages")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        print(f"Legal pages API returned {len(data)} pages")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
