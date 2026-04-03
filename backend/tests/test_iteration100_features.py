"""
Iteration 100 Test Suite
Tests for:
1. Finance PIN endpoints (set, verify, status)
2. Credit repair companies needs-comparison endpoint
3. Public complaints endpoint
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"


class TestSetup:
    """Setup and authentication tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        token = data.get("access_token") or data.get("token")
        assert token, "No token in response"
        return token
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get authorization headers"""
        return {"Authorization": f"Bearer {auth_token}"}


class TestFinancePinEndpoints(TestSetup):
    """Test Finance PIN endpoints for PIN-protected Finance Dashboard"""
    
    def test_finance_pin_status_returns_has_pin_field(self, auth_headers):
        """GET /api/gateway-settings/finance-pin/status returns has_pin field"""
        response = requests.get(
            f"{BASE_URL}/api/gateway-settings/finance-pin/status",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Status check failed: {response.text}"
        data = response.json()
        assert "has_pin" in data, "Response missing 'has_pin' field"
        assert isinstance(data["has_pin"], bool), "has_pin should be boolean"
        print(f"✓ Finance PIN status: has_pin={data['has_pin']}")
    
    def test_finance_pin_set_with_valid_pin(self, auth_headers):
        """POST /api/gateway-settings/finance-pin/set with valid 4-digit PIN"""
        response = requests.post(
            f"{BASE_URL}/api/gateway-settings/finance-pin/set",
            headers=auth_headers,
            json={"pin": "1234"}
        )
        assert response.status_code == 200, f"Set PIN failed: {response.text}"
        data = response.json()
        assert "message" in data, "Response missing 'message' field"
        print(f"✓ Finance PIN set successfully: {data['message']}")
    
    def test_finance_pin_set_rejects_invalid_pin(self, auth_headers):
        """POST /api/gateway-settings/finance-pin/set rejects non-4-digit PIN"""
        # Test with 3 digits
        response = requests.post(
            f"{BASE_URL}/api/gateway-settings/finance-pin/set",
            headers=auth_headers,
            json={"pin": "123"}
        )
        assert response.status_code == 400, f"Should reject 3-digit PIN: {response.text}"
        
        # Test with letters
        response = requests.post(
            f"{BASE_URL}/api/gateway-settings/finance-pin/set",
            headers=auth_headers,
            json={"pin": "abcd"}
        )
        assert response.status_code == 400, f"Should reject non-numeric PIN: {response.text}"
        print("✓ Finance PIN validation working correctly")
    
    def test_finance_pin_verify_correct_pin(self, auth_headers):
        """POST /api/gateway-settings/finance-pin/verify with correct PIN returns verified=true"""
        # First ensure PIN is set
        requests.post(
            f"{BASE_URL}/api/gateway-settings/finance-pin/set",
            headers=auth_headers,
            json={"pin": "1234"}
        )
        
        # Verify with correct PIN
        response = requests.post(
            f"{BASE_URL}/api/gateway-settings/finance-pin/verify",
            headers=auth_headers,
            json={"pin": "1234"}
        )
        assert response.status_code == 200, f"Verify failed: {response.text}"
        data = response.json()
        assert data.get("verified") == True, f"Expected verified=true, got: {data}"
        print("✓ Finance PIN verification with correct PIN works")
    
    def test_finance_pin_verify_wrong_pin(self, auth_headers):
        """POST /api/gateway-settings/finance-pin/verify with wrong PIN returns verified=false"""
        response = requests.post(
            f"{BASE_URL}/api/gateway-settings/finance-pin/verify",
            headers=auth_headers,
            json={"pin": "9999"}
        )
        assert response.status_code == 200, f"Verify request failed: {response.text}"
        data = response.json()
        assert data.get("verified") == False, f"Expected verified=false, got: {data}"
        print("✓ Finance PIN verification with wrong PIN returns verified=false")
    
    def test_finance_pin_status_after_setting(self, auth_headers):
        """GET /api/gateway-settings/finance-pin/status returns has_pin=true after setting"""
        response = requests.get(
            f"{BASE_URL}/api/gateway-settings/finance-pin/status",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("has_pin") == True, f"Expected has_pin=true after setting PIN, got: {data}"
        print("✓ Finance PIN status correctly shows has_pin=true after setting")


class TestCreditRepairEndpoints(TestSetup):
    """Test Credit Repair API endpoints"""
    
    def test_companies_needs_comparison_endpoint(self, auth_headers):
        """GET /api/credit-repair/companies/needs-comparison returns companies list"""
        response = requests.get(
            f"{BASE_URL}/api/credit-repair/companies/needs-comparison",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Needs comparison failed: {response.text}"
        data = response.json()
        assert "companies" in data, "Response missing 'companies' field"
        assert "total" in data, "Response missing 'total' field"
        assert isinstance(data["companies"], list), "companies should be a list"
        print(f"✓ Companies needing comparison: {data['total']} companies")
    
    def test_public_complaints_endpoint(self, auth_headers):
        """GET /api/credit-repair/complaints/public returns published complaints"""
        response = requests.get(
            f"{BASE_URL}/api/credit-repair/complaints/public"
        )
        assert response.status_code == 200, f"Public complaints failed: {response.text}"
        data = response.json()
        assert "complaints" in data, "Response missing 'complaints' field"
        assert "total" in data, "Response missing 'total' field"
        assert isinstance(data["complaints"], list), "complaints should be a list"
        print(f"✓ Public complaints endpoint: {data['total']} complaints")
    
    def test_public_complaints_by_company_slug(self, auth_headers):
        """GET /api/credit-repair/complaints/public?company_slug=lexington-law returns filtered complaints"""
        response = requests.get(
            f"{BASE_URL}/api/credit-repair/complaints/public?company_slug=lexington-law"
        )
        assert response.status_code == 200, f"Filtered complaints failed: {response.text}"
        data = response.json()
        assert "complaints" in data, "Response missing 'complaints' field"
        print(f"✓ Complaints for lexington-law: {data['total']} complaints")
    
    def test_companies_list_endpoint(self, auth_headers):
        """GET /api/credit-repair/companies returns companies list"""
        response = requests.get(
            f"{BASE_URL}/api/credit-repair/companies"
        )
        assert response.status_code == 200, f"Companies list failed: {response.text}"
        data = response.json()
        assert "companies" in data, "Response missing 'companies' field"
        assert "total" in data, "Response missing 'total' field"
        print(f"✓ Credit repair companies: {data['total']} companies")


class TestGatewaySettingsEndpoints(TestSetup):
    """Test Gateway Settings endpoints still work"""
    
    def test_gateway_settings_page_loads(self, auth_headers):
        """GET /api/gateway-settings returns gateway config"""
        response = requests.get(
            f"{BASE_URL}/api/gateway-settings",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Gateway settings failed: {response.text}"
        data = response.json()
        assert "authorize_net" in data or "default_gateway" in data, "Response missing gateway config"
        print("✓ Gateway settings endpoint working")
    
    def test_gateway_status_endpoint(self, auth_headers):
        """GET /api/gateway-settings/status returns status"""
        response = requests.get(
            f"{BASE_URL}/api/gateway-settings/status",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Gateway status failed: {response.text}"
        data = response.json()
        assert "authorize_net" in data or "default_gateway" in data, "Response missing status"
        print("✓ Gateway status endpoint working")


class TestAuthorizenetSyncEndpoint(TestSetup):
    """Test Sync Transactions endpoint"""
    
    def test_sync_transactions_endpoint_exists(self, auth_headers):
        """POST /api/authorizenet/sync-transactions endpoint exists"""
        response = requests.post(
            f"{BASE_URL}/api/authorizenet/sync-transactions",
            headers=auth_headers,
            json={}
        )
        # Should return 200 or 202 (accepted) or 400 (if already syncing)
        # Should NOT return 404
        assert response.status_code != 404, f"Sync endpoint not found: {response.text}"
        print(f"✓ Sync transactions endpoint exists (status: {response.status_code})")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
