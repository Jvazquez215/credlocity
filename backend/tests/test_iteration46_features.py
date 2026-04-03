"""
Iteration 46 Tests - Google Voice Removal, Credit Builder Footer Link, Redesigned Credit Builder Page
Tests:
1. Backend APIs still work without GV code
2. Login API works
3. Collections dashboard stats API works (verifies GV removal didn't break collections)
4. Credit Builder products API still works (public endpoint)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestBackendHealth:
    """Test that backend APIs work correctly after GV removal"""
    
    def test_api_health(self):
        """Test basic API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        print(f"Health check: {response.status_code}")
        assert response.status_code == 200
    
    def test_login_endpoint_works(self):
        """Test admin login still works after GV code removal"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "Admin@credlocity.com",
                "password": "Credit123!"
            },
            timeout=10
        )
        print(f"Login response status: {response.status_code}")
        assert response.status_code == 200
        
        data = response.json()
        assert "access_token" in data or "token" in data
        print("Login successful - auth system working")


class TestCollectionsAPIWithoutGV:
    """Verify collections API still works after Google Voice code removal"""
    
    @pytest.fixture
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "Admin@credlocity.com",
                "password": "Credit123!"
            },
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("access_token") or data.get("token")
        pytest.skip("Could not authenticate")
    
    def test_collections_dashboard_stats(self, auth_token):
        """Test GET /api/collections/dashboard/stats works without GV code"""
        response = requests.get(
            f"{BASE_URL}/api/collections/dashboard/stats",
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        print(f"Collections dashboard stats: {response.status_code}")
        assert response.status_code == 200
        
        data = response.json()
        # Verify response has expected fields
        assert "total_accounts" in data or "active_accounts" in data
        print(f"Collections stats response: {data}")


class TestCreditBuilderPublicAPI:
    """Test Credit Builder public API (no auth required)"""
    
    def test_credit_builder_products_public(self):
        """Test GET /api/credit-builder/products is public and returns products"""
        response = requests.get(
            f"{BASE_URL}/api/credit-builder/products",
            timeout=10
        )
        print(f"Credit Builder products: {response.status_code}")
        assert response.status_code == 200
        
        data = response.json()
        # Should return list of products
        assert isinstance(data, list)
        print(f"Found {len(data)} Credit Builder products")
        
        if len(data) > 0:
            product = data[0]
            assert "id" in product
            assert "name" in product
            assert "price" in product
            print(f"Sample product: {product.get('name')} - ${product.get('price')}")


class TestGoogleVoiceRemoval:
    """Verify Google Voice endpoints are removed/don't exist"""
    
    @pytest.fixture
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "Admin@credlocity.com",
                "password": "Credit123!"
            },
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("access_token") or data.get("token")
        pytest.skip("Could not authenticate")
    
    def test_google_voice_endpoints_removed(self, auth_token):
        """Test that Google Voice endpoints no longer exist (should return 404)"""
        # Try to access what would have been a GV endpoint
        gv_endpoints = [
            "/api/collections/google-voice/settings",
            "/api/collections/google-voice/logs",
        ]
        
        for endpoint in gv_endpoints:
            response = requests.get(
                f"{BASE_URL}{endpoint}",
                headers={"Authorization": f"Bearer {auth_token}"},
                timeout=10
            )
            print(f"GV endpoint {endpoint}: {response.status_code}")
            # Should return 404 (not found) since GV code was removed
            # Could also be 422 or 405 if router structure changed
            assert response.status_code in [404, 422, 405, 400], f"Expected GV endpoint {endpoint} to be removed, got {response.status_code}"
            print(f"Confirmed: {endpoint} not accessible (GV removed)")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
