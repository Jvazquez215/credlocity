"""
E-Book Management API Tests
Tests the complete e-book CRUD, download, and leads functionality.
"""
import pytest
import requests
import os
import json

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://rep-dashboard-11.preview.emergentagent.com')


class TestEbooksPublicAPI:
    """Public e-book API tests - no authentication required"""
    
    def test_public_ebooks_list(self):
        """GET /api/ebooks/public returns valid response"""
        response = requests.get(f"{BASE_URL}/api/ebooks/public")
        assert response.status_code == 200
        data = response.json()
        assert "ebooks" in data
        assert "total" in data
        assert isinstance(data["ebooks"], list)
        print(f"Public ebooks: {data['total']} total")
        
        # Verify storage_path is NOT exposed in public endpoint
        for ebook in data["ebooks"]:
            assert "storage_path" not in ebook
            assert "original_filename" not in ebook
            assert "title" in ebook
            assert "price" in ebook
            assert "is_active" in ebook
    
    def test_public_ebooks_filter_by_category(self):
        """GET /api/ebooks/public?category=consumers filters correctly"""
        response = requests.get(f"{BASE_URL}/api/ebooks/public?category=consumers")
        assert response.status_code == 200
        data = response.json()
        for ebook in data["ebooks"]:
            assert ebook["category"] in ["consumers", "both"]
    
    def test_signup_bonus_ebooks(self):
        """GET /api/ebooks/signup-bonus returns valid response"""
        response = requests.get(f"{BASE_URL}/api/ebooks/signup-bonus")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All returned ebooks should be signup bonuses
        for ebook in data:
            assert ebook["is_signup_bonus"] == True
            assert ebook["is_active"] == True


class TestEbooksAdminAPI:
    """Admin e-book API tests - requires authentication"""
    
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
    
    def test_list_ebooks_admin(self):
        """GET /api/ebooks/list returns all ebooks with admin data"""
        response = requests.get(f"{BASE_URL}/api/ebooks/list", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "ebooks" in data
        assert "total" in data
        
        # Admin endpoint should include storage_path
        for ebook in data["ebooks"]:
            assert "storage_path" in ebook
            assert "original_filename" in ebook
            assert "download_count" in ebook
            assert "purchase_count" in ebook
        print(f"Admin sees {data['total']} ebooks")
    
    def test_get_single_ebook(self):
        """GET /api/ebooks/{ebook_id} returns single ebook"""
        # First get list
        list_response = requests.get(f"{BASE_URL}/api/ebooks/list", headers=self.headers)
        ebooks = list_response.json()["ebooks"]
        if not ebooks:
            pytest.skip("No ebooks exist")
        
        ebook_id = ebooks[0]["id"]
        response = requests.get(f"{BASE_URL}/api/ebooks/{ebook_id}", headers=self.headers)
        assert response.status_code == 200
        ebook = response.json()
        assert ebook["id"] == ebook_id
        assert "title" in ebook
        assert "storage_path" in ebook
    
    def test_get_nonexistent_ebook_returns_404(self):
        """GET /api/ebooks/{invalid_id} returns 404"""
        response = requests.get(f"{BASE_URL}/api/ebooks/nonexistent-id-12345", headers=self.headers)
        assert response.status_code == 404


class TestEbooksLeadsAPI:
    """E-book leads management tests"""
    
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
    
    def test_list_leads(self):
        """GET /api/ebooks/leads/list returns valid response"""
        response = requests.get(f"{BASE_URL}/api/ebooks/leads/list?limit=100", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "leads" in data
        assert "total" in data
        assert isinstance(data["leads"], list)
        print(f"Total leads: {data['total']}")
    
    def test_list_leads_filter_by_type(self):
        """GET /api/ebooks/leads/list?lead_type=free_download filters correctly"""
        response = requests.get(f"{BASE_URL}/api/ebooks/leads/list?lead_type=free_download", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        for lead in data["leads"]:
            assert lead["type"] == "free_download"


class TestFreeEbookDownload:
    """Test free e-book download flow"""
    
    def test_free_download_with_email_capture(self):
        """POST /api/ebooks/{id}/download captures lead and returns PDF"""
        # Get a free ebook
        public_response = requests.get(f"{BASE_URL}/api/ebooks/public")
        ebooks = public_response.json()["ebooks"]
        free_ebooks = [e for e in ebooks if e["price"] == 0]
        
        if not free_ebooks:
            pytest.skip("No free ebooks available")
        
        ebook_id = free_ebooks[0]["id"]
        
        # Attempt download with email
        download_payload = {
            "first_name": "TEST_John",
            "last_name": "TEST_Doe",
            "email": "test_ebook_download@example.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ebooks/{ebook_id}/download",
            json=download_payload
        )
        
        # Should return PDF binary
        assert response.status_code == 200
        assert response.headers.get("Content-Type") == "application/pdf"
        assert "Content-Disposition" in response.headers
        print("Free download: PDF returned successfully")
    
    def test_paid_ebook_rejects_free_download(self):
        """POST /api/ebooks/{id}/download returns 400 for paid ebooks"""
        # Get a paid ebook
        public_response = requests.get(f"{BASE_URL}/api/ebooks/public")
        ebooks = public_response.json()["ebooks"]
        paid_ebooks = [e for e in ebooks if e["price"] > 0]
        
        if not paid_ebooks:
            pytest.skip("No paid ebooks available")
        
        ebook_id = paid_ebooks[0]["id"]
        
        download_payload = {
            "first_name": "Test",
            "last_name": "User",
            "email": "test@example.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ebooks/{ebook_id}/download",
            json=download_payload
        )
        
        assert response.status_code == 400
        assert "payment" in response.json()["detail"].lower()


class TestEbookUpdateDelete:
    """Test e-book update and delete operations"""
    
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
    
    def test_update_ebook_metadata(self):
        """PUT /api/ebooks/{id} updates metadata"""
        # Get an ebook
        list_response = requests.get(f"{BASE_URL}/api/ebooks/list", headers=self.headers)
        ebooks = list_response.json()["ebooks"]
        if not ebooks:
            pytest.skip("No ebooks to update")
        
        ebook = ebooks[0]
        ebook_id = ebook["id"]
        
        # Update description
        update_payload = {
            "description": "Updated test description - " + str(__import__('time').time()),
            "is_featured": True
        }
        
        response = requests.put(
            f"{BASE_URL}/api/ebooks/{ebook_id}",
            headers=self.headers,
            json=update_payload
        )
        
        assert response.status_code == 200
        updated = response.json()
        assert "Updated test description" in updated["description"]
        assert updated["is_featured"] == True
        
        # Verify persistence
        verify_response = requests.get(f"{BASE_URL}/api/ebooks/{ebook_id}", headers=self.headers)
        assert verify_response.status_code == 200
        assert "Updated test description" in verify_response.json()["description"]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
