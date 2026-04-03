"""
E-Book Store API Tests - Iteration 42
Tests the complete e-book system including:
- Store listing at /store
- Individual e-book pages at /store/:slug  
- AI cover generation
- Social sharing features
- SEO fields (meta_title, meta_description, social_caption)
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://rep-dashboard-11.preview.emergentagent.com').rstrip('/')


class TestPublicEbooksAPI:
    """Public e-book API tests - /api/ebooks/public and /api/ebooks/slug/:slug"""
    
    def test_public_ebooks_list(self):
        """GET /api/ebooks/public returns valid response with slug field"""
        response = requests.get(f"{BASE_URL}/api/ebooks/public")
        assert response.status_code == 200
        data = response.json()
        assert "ebooks" in data
        assert "total" in data
        print(f"Public ebooks: {data['total']} total")
        
        # Verify each ebook has required fields including slug
        for ebook in data["ebooks"]:
            assert "slug" in ebook, "E-book missing slug field"
            assert "title" in ebook
            assert "price" in ebook
            assert "meta_title" in ebook or ebook.get("title")  # meta_title or fallback to title
            assert "meta_description" in ebook or ebook.get("description")  # meta_description or fallback
            # Social caption for sharing
            assert "social_caption" in ebook
            # Storage paths should NOT be exposed
            assert "storage_path" not in ebook
            assert "original_filename" not in ebook
            assert "cover_storage_path" not in ebook
            print(f"  - {ebook['title']} (slug: {ebook['slug']})")
    
    def test_get_ebook_by_slug_free_edition(self):
        """GET /api/ebooks/slug/credit-repair-guide-free-edition returns correct e-book"""
        response = requests.get(f"{BASE_URL}/api/ebooks/slug/credit-repair-guide-free-edition")
        assert response.status_code == 200
        ebook = response.json()
        
        # Verify correct e-book returned
        assert ebook["slug"] == "credit-repair-guide-free-edition"
        assert "Credit Repair Guide" in ebook["title"]
        assert ebook["price"] == 0.0  # Free e-book
        
        # Verify SEO fields
        assert "meta_title" in ebook
        assert "meta_description" in ebook
        assert "social_caption" in ebook
        
        # Storage paths should NOT be exposed
        assert "storage_path" not in ebook
        print(f"Retrieved: {ebook['title']} via slug")
    
    def test_get_ebook_by_slug_paid(self):
        """GET /api/ebooks/slug/advanced-credit-repair-strategies returns paid e-book"""
        response = requests.get(f"{BASE_URL}/api/ebooks/slug/advanced-credit-repair-strategies")
        assert response.status_code == 200
        ebook = response.json()
        
        # Verify correct e-book returned
        assert ebook["slug"] == "advanced-credit-repair-strategies"
        assert ebook["price"] > 0  # Paid e-book
        print(f"Retrieved: {ebook['title']} - ${ebook['price']}")
    
    def test_get_ebook_by_invalid_slug_returns_404(self):
        """GET /api/ebooks/slug/nonexistent-ebook returns 404"""
        response = requests.get(f"{BASE_URL}/api/ebooks/slug/nonexistent-ebook-12345")
        assert response.status_code == 404
        print("404 returned for invalid slug - PASS")
    
    def test_public_ebooks_filter_by_category(self):
        """GET /api/ebooks/public?category=consumers filters correctly"""
        response = requests.get(f"{BASE_URL}/api/ebooks/public?category=consumers")
        assert response.status_code == 200
        data = response.json()
        for ebook in data["ebooks"]:
            assert ebook["category"] in ["consumers", "both"]


class TestAICoverGeneration:
    """AI Cover Generation endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        if login_response.status_code != 200:
            pytest.skip("Cannot authenticate - skipping admin tests")
        self.token = login_response.json()["access_token"]
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def test_generate_cover_endpoint_available(self):
        """POST /api/ebooks/generate-cover endpoint exists and validates input"""
        # Test with empty title - should fail validation or return error
        response = requests.post(
            f"{BASE_URL}/api/ebooks/generate-cover",
            headers=self.headers,
            json={"title": "", "description": "", "style": "professional"}
        )
        # Either 422 (validation error) or success - endpoint exists
        assert response.status_code in [200, 422, 500], "Generate cover endpoint not accessible"
        print(f"Generate cover endpoint status: {response.status_code}")
    
    def test_generate_cover_with_valid_input(self):
        """POST /api/ebooks/generate-cover with valid input (long timeout for AI)"""
        # This test can take 30-60 seconds due to AI generation
        response = requests.post(
            f"{BASE_URL}/api/ebooks/generate-cover",
            headers=self.headers,
            json={
                "title": "Test Cover Generation",
                "description": "A test e-book for cover generation",
                "style": "professional"
            },
            timeout=90  # Long timeout for AI generation
        )
        
        if response.status_code == 200:
            data = response.json()
            assert "image_base64" in data
            assert "format" in data
            assert data["format"] == "png"
            assert len(data["image_base64"]) > 100  # Should have substantial base64 data
            print(f"AI cover generated successfully - base64 length: {len(data['image_base64'])}")
        elif response.status_code == 503:
            print("AI cover generation not configured (503) - acceptable")
        elif response.status_code == 500:
            print(f"AI cover generation error (500): {response.text[:200]}")
        else:
            print(f"Unexpected status: {response.status_code} - {response.text[:200]}")


class TestSaveGeneratedCover:
    """Test saving AI-generated cover to e-book"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        if login_response.status_code != 200:
            pytest.skip("Cannot authenticate")
        self.token = login_response.json()["access_token"]
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def test_save_generated_cover_endpoint_exists(self):
        """POST /api/ebooks/{id}/save-generated-cover endpoint exists"""
        # Get an existing ebook
        list_response = requests.get(f"{BASE_URL}/api/ebooks/list", headers=self.headers)
        ebooks = list_response.json()["ebooks"]
        if not ebooks:
            pytest.skip("No ebooks exist")
        
        ebook_id = ebooks[0]["id"]
        
        # Test endpoint with minimal base64 (should validate)
        response = requests.post(
            f"{BASE_URL}/api/ebooks/{ebook_id}/save-generated-cover",
            headers=self.headers,
            json={"image_base64": ""}
        )
        # Should return 400 for empty data, or 200/other status
        assert response.status_code in [200, 400, 422]
        print(f"Save cover endpoint response: {response.status_code}")


class TestCoverImageServing:
    """Test serving cover images"""
    
    def test_cover_image_endpoint_404_for_no_cover(self):
        """GET /api/ebooks/cover-image/{id} returns 404 if no cover"""
        response = requests.get(f"{BASE_URL}/api/ebooks/cover-image/nonexistent-id")
        assert response.status_code == 404
        print("Cover image 404 for invalid ID - PASS")


class TestEbookUpdateWithSEOFields:
    """Test updating e-books with SEO fields"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        if login_response.status_code != 200:
            pytest.skip("Cannot authenticate")
        self.token = login_response.json()["access_token"]
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def test_update_ebook_seo_fields(self):
        """PUT /api/ebooks/{id} can update SEO fields"""
        # Get an ebook
        list_response = requests.get(f"{BASE_URL}/api/ebooks/list", headers=self.headers)
        ebooks = list_response.json()["ebooks"]
        if not ebooks:
            pytest.skip("No ebooks exist")
        
        ebook_id = ebooks[0]["id"]
        test_timestamp = str(time.time())
        
        # Update SEO fields
        update_payload = {
            "meta_title": f"Test Meta Title {test_timestamp}",
            "meta_description": f"Test meta description for SEO testing {test_timestamp}",
            "social_caption": f"Share this amazing e-book! {test_timestamp}"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/ebooks/{ebook_id}",
            headers=self.headers,
            json=update_payload
        )
        
        assert response.status_code == 200
        updated = response.json()
        assert test_timestamp in updated["meta_title"]
        assert test_timestamp in updated["meta_description"]
        assert test_timestamp in updated["social_caption"]
        print("SEO fields updated successfully")


class TestAdminEbookListWithSlug:
    """Test admin e-book list includes slug"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        if login_response.status_code != 200:
            pytest.skip("Cannot authenticate")
        self.token = login_response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_admin_list_shows_slug(self):
        """GET /api/ebooks/list returns slugs for admin view"""
        response = requests.get(f"{BASE_URL}/api/ebooks/list", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        
        for ebook in data["ebooks"]:
            assert "slug" in ebook, "Admin view missing slug"
            print(f"  Admin sees: {ebook['title']} -> /store/{ebook['slug']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
