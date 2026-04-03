"""
Test Media Upload API - Iteration 96
Tests the enhanced TipTap editor media upload functionality with object storage.
Also includes regression tests for leads API.
"""
import pytest
import requests
import os
import io
from PIL import Image

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestAuth:
    """Authentication tests - get token for subsequent tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Login and get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "Response should contain 'access_token'"
        return data["access_token"]
    
    def test_login_returns_access_token(self):
        """Test that login returns access_token (not 'token')"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data, "Login should return 'access_token'"
        assert "user" in data, "Login should return 'user' object"
        print("PASS: Login returns access_token correctly")


class TestMediaUpload:
    """Media upload API tests for TipTap editor image insertion"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Login and get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture
    def test_image(self):
        """Create a test image using PIL"""
        img = Image.new('RGB', (100, 100), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        return img_bytes
    
    def test_media_upload_requires_auth(self, test_image):
        """Test that media upload requires authentication"""
        files = {'file': ('test.png', test_image, 'image/png')}
        response = requests.post(f"{BASE_URL}/api/media/upload", files=files)
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: Media upload requires authentication")
    
    def test_media_upload_with_auth(self, auth_token, test_image):
        """Test media upload with valid auth token"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        files = {'file': ('test_image.png', test_image, 'image/png')}
        data = {'alt_text': 'Test image for TipTap editor'}
        
        response = requests.post(
            f"{BASE_URL}/api/media/upload",
            headers=headers,
            files=files,
            data=data
        )
        
        assert response.status_code == 200, f"Upload failed: {response.text}"
        result = response.json()
        
        # Verify response structure
        assert "url" in result, "Response should contain 'url'"
        assert "filename" in result, "Response should contain 'filename'"
        assert "file_type" in result, "Response should contain 'file_type'"
        
        # Verify URL format - should be /api/media/serve/{filename}
        assert result["url"].startswith("/api/media/serve/"), f"URL should start with /api/media/serve/, got: {result['url']}"
        assert result["file_type"] == "image", f"File type should be 'image', got: {result['file_type']}"
        
        print(f"PASS: Media upload successful, URL: {result['url']}")
        return result
    
    def test_media_serve_endpoint(self, auth_token):
        """Test that uploaded media can be served"""
        # First upload an image
        headers = {"Authorization": f"Bearer {auth_token}"}
        img = Image.new('RGB', (50, 50), color='blue')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        files = {'file': ('serve_test.png', img_bytes, 'image/png')}
        upload_response = requests.post(
            f"{BASE_URL}/api/media/upload",
            headers=headers,
            files=files
        )
        assert upload_response.status_code == 200
        upload_data = upload_response.json()
        
        # Now try to serve the uploaded file
        serve_url = upload_data["url"]
        serve_response = requests.get(f"{BASE_URL}{serve_url}")
        
        assert serve_response.status_code == 200, f"Serve failed: {serve_response.status_code}"
        assert "image" in serve_response.headers.get("Content-Type", ""), "Content-Type should be image"
        
        print(f"PASS: Media serve endpoint works, Content-Type: {serve_response.headers.get('Content-Type')}")
    
    def test_media_upload_with_alt_text(self, auth_token):
        """Test media upload with alt_text parameter"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        img = Image.new('RGB', (75, 75), color='green')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        files = {'file': ('alt_test.jpg', img_bytes, 'image/jpeg')}
        data = {'alt_text': 'Custom alt text for accessibility'}
        
        response = requests.post(
            f"{BASE_URL}/api/media/upload",
            headers=headers,
            files=files,
            data=data
        )
        
        assert response.status_code == 200
        result = response.json()
        assert result.get("alt_text") == "Custom alt text for accessibility", "Alt text should be preserved"
        
        print("PASS: Media upload preserves alt_text")
    
    def test_media_upload_detects_dimensions(self, auth_token):
        """Test that media upload detects image dimensions"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        img = Image.new('RGB', (200, 150), color='yellow')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        files = {'file': ('dimension_test.png', img_bytes, 'image/png')}
        
        response = requests.post(
            f"{BASE_URL}/api/media/upload",
            headers=headers,
            files=files
        )
        
        assert response.status_code == 200
        result = response.json()
        
        # Check dimensions are detected
        assert result.get("width") == 200, f"Width should be 200, got: {result.get('width')}"
        assert result.get("height") == 150, f"Height should be 150, got: {result.get('height')}"
        
        print(f"PASS: Image dimensions detected: {result.get('width')}x{result.get('height')}")


class TestLeadsRegression:
    """Regression tests for leads API (from iteration 95)"""
    
    def test_leads_create(self):
        """Test creating a lead via POST /api/leads"""
        lead_data = {
            "first_name": "Test",
            "last_name": "MediaUpload96",
            "email": f"test_media96_{os.urandom(4).hex()}@example.com",
            "phone": "555-123-4567",
            "lead_type": "free_trial",
            "signature": "Test MediaUpload96",
            "signed_name": "Test MediaUpload96",
            "agreed_to_terms": True,
            "address": "123 Test Street",
            "city": "Test City",
            "state": "TX",
            "zip_code": "75001"
        }
        
        response = requests.post(f"{BASE_URL}/api/leads", json=lead_data)
        assert response.status_code == 200, f"Lead creation failed: {response.text}"
        
        result = response.json()
        assert "id" in result, "Response should contain lead ID"
        assert result.get("message") == "Lead captured successfully", "Should return success message"
        
        print(f"PASS: Lead created with ID: {result['id']}")
    
    def test_leads_agreement_pdf_download(self):
        """Test downloading agreement PDF for a lead"""
        # First create a lead
        lead_data = {
            "first_name": "PDF",
            "last_name": "DownloadTest96",
            "email": f"pdf_test96_{os.urandom(4).hex()}@example.com",
            "phone": "555-987-6543",
            "lead_type": "free_trial",
            "signature": "PDF DownloadTest96",
            "signed_name": "PDF DownloadTest96",
            "agreed_to_terms": True,
            "address": "456 PDF Lane",
            "city": "Download City",
            "state": "CA",
            "zip_code": "90210"
        }
        
        create_response = requests.post(f"{BASE_URL}/api/leads", json=lead_data)
        assert create_response.status_code == 200
        lead_id = create_response.json()["id"]
        
        # Now download the PDF
        pdf_response = requests.get(f"{BASE_URL}/api/leads/{lead_id}/agreement-pdf")
        assert pdf_response.status_code == 200, f"PDF download failed: {pdf_response.status_code}"
        
        # Verify it's a PDF
        content_type = pdf_response.headers.get("Content-Type", "")
        assert "application/pdf" in content_type, f"Expected PDF content type, got: {content_type}"
        
        # Verify PDF magic bytes
        assert pdf_response.content[:4] == b'%PDF', "Response should start with PDF magic bytes"
        
        print("PASS: Agreement PDF download works correctly")


class TestMediaList:
    """Test media listing endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Login and get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    def test_media_list_requires_auth(self):
        """Test that media list requires authentication"""
        response = requests.get(f"{BASE_URL}/api/media")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: Media list requires authentication")
    
    def test_media_list_with_auth(self, auth_token):
        """Test media list with valid auth"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/media", headers=headers)
        
        assert response.status_code == 200, f"Media list failed: {response.text}"
        result = response.json()
        assert isinstance(result, list), "Response should be a list"
        
        print(f"PASS: Media list returned {len(result)} items")


class TestHealthCheck:
    """Basic health check tests"""
    
    def test_api_health(self):
        """Test that API is responding"""
        response = requests.get(f"{BASE_URL}/api/health")
        # Health endpoint might not exist, so check for any valid response
        assert response.status_code in [200, 404], f"API not responding: {response.status_code}"
        print("PASS: API is responding")
    
    def test_auth_endpoint_exists(self):
        """Test that auth endpoint exists"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@test.com",
            "password": "invalid"
        })
        # Should get 401 for invalid credentials, not 404
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: Auth endpoint exists and validates credentials")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
