"""
Iteration 47 Tests - Credit Score Simulator, $68 Annual Fee, E-Sign Agreement API
Features:
1. Credit Score Simulator widget on /credit-builder-store
2. $68 annual membership fee on all plan cards
3. E-sign credit agreement API endpoints
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://rep-dashboard-11.preview.emergentagent.com')


class TestAgreementEndpoints:
    """Tests for the Credit Builder Agreement API endpoints"""
    
    @pytest.fixture(scope='class')
    def auth_token(self):
        """Get admin authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "Admin@credlocity.com", "password": "Credit123!"},
            timeout=10
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        token = data.get('access_token')
        assert token, "No access_token in response"
        return token
    
    @pytest.fixture(scope='class')
    def test_account(self, auth_token):
        """Get or create a test account for agreement testing"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # First try to get existing accounts
        response = requests.get(
            f"{BASE_URL}/api/credit-builder/accounts",
            headers=headers,
            timeout=10
        )
        assert response.status_code == 200, f"Get accounts failed: {response.text}"
        data = response.json()
        
        # Use existing account if available
        if data.get('accounts') and len(data['accounts']) > 0:
            return data['accounts'][0]
        
        # Create a new test account if none exist
        test_data = {
            "first_name": "Test",
            "last_name": "Agreement",
            "date_of_birth": "01011990",
            "ssn_last_four": "1234",
            "email": "test.agreement@example.com",
            "address_line1": "123 Test St",
            "city": "Philadelphia",
            "state": "PA",
            "zip_code": "19101",
            "plan_tier": "standard"
        }
        response = requests.post(
            f"{BASE_URL}/api/credit-builder/accounts",
            json=test_data,
            headers=headers,
            timeout=10
        )
        assert response.status_code == 200, f"Create account failed: {response.text}"
        return response.json()
    
    def test_get_agreement_returns_agreement_text(self, auth_token, test_account):
        """Test GET /api/credit-builder/agreement/{account_id} returns agreement text with plan details"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        account_id = test_account['id']
        
        response = requests.get(
            f"{BASE_URL}/api/credit-builder/agreement/{account_id}",
            headers=headers,
            timeout=10
        )
        assert response.status_code == 200, f"Get agreement failed: {response.text}"
        data = response.json()
        
        # Verify required fields
        assert 'agreement_text' in data, "Missing agreement_text"
        assert 'account_id' in data, "Missing account_id"
        assert 'plan_tier' in data, "Missing plan_tier"
        assert 'annual_fee' in data, "Missing annual_fee"
        assert data['annual_fee'] == 68.00, f"Annual fee should be 68.00, got {data['annual_fee']}"
        
        # Verify agreement text content
        agreement_text = data['agreement_text']
        assert 'CREDLOCITY CREDIT BUILDER ACCOUNT AGREEMENT' in agreement_text
        assert '$68.00' in agreement_text or '68.00' in agreement_text, "Agreement should mention $68 annual fee"
        print(f"Agreement API returns correct text with annual fee ${data['annual_fee']}")
    
    def test_agreement_includes_croa_disclosure(self, auth_token, test_account):
        """Test agreement text includes CROA disclosure"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        account_id = test_account['id']
        
        response = requests.get(
            f"{BASE_URL}/api/credit-builder/agreement/{account_id}",
            headers=headers,
            timeout=10
        )
        assert response.status_code == 200
        agreement_text = response.json().get('agreement_text', '')
        
        assert 'CREDIT REPAIR ORGANIZATIONS ACT' in agreement_text or 'CROA' in agreement_text
        assert 'Cancel' in agreement_text and 'three' in agreement_text.lower()
        print("CROA disclosure present in agreement")
    
    def test_agreement_includes_cancellation_rights(self, auth_token, test_account):
        """Test agreement text includes cancellation rights (3 business days)"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        account_id = test_account['id']
        
        response = requests.get(
            f"{BASE_URL}/api/credit-builder/agreement/{account_id}",
            headers=headers,
            timeout=10
        )
        assert response.status_code == 200
        agreement_text = response.json().get('agreement_text', '')
        
        assert 'RIGHT TO CANCEL' in agreement_text or 'cancel' in agreement_text.lower()
        assert 'three (3) business days' in agreement_text or '3 business days' in agreement_text
        print("Cancellation rights present in agreement")
    
    def test_agreement_status_endpoint(self, auth_token, test_account):
        """Test GET /api/credit-builder/agreement/{account_id}/status returns signed status"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        account_id = test_account['id']
        
        response = requests.get(
            f"{BASE_URL}/api/credit-builder/agreement/{account_id}/status",
            headers=headers,
            timeout=10
        )
        assert response.status_code == 200, f"Get status failed: {response.text}"
        data = response.json()
        
        assert 'agreement_signed' in data, "Missing agreement_signed field"
        assert 'account_id' in data, "Missing account_id field"
        print(f"Agreement status API returns signed={data['agreement_signed']}")
    
    def test_sign_agreement_validates_name(self, auth_token, test_account):
        """Test POST /api/credit-builder/agreement/{account_id}/sign validates signer name"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        account_id = test_account['id']
        
        # First check if already signed
        status_resp = requests.get(
            f"{BASE_URL}/api/credit-builder/agreement/{account_id}/status",
            headers=headers,
            timeout=10
        )
        if status_resp.status_code == 200 and status_resp.json().get('agreement_signed'):
            print("Agreement already signed, skipping wrong name validation test")
            return
        
        # Try with wrong name - should fail
        response = requests.post(
            f"{BASE_URL}/api/credit-builder/agreement/{account_id}/sign",
            json={"full_name": "Wrong Name", "ip_address": "127.0.0.1"},
            headers=headers,
            timeout=10
        )
        # Should fail validation - name doesn't match account holder
        assert response.status_code == 422, f"Should reject wrong name, got {response.status_code}"
        print("Agreement sign rejects wrong name as expected")
    
    def test_sign_agreement_with_correct_name(self, auth_token, test_account):
        """Test POST /api/credit-builder/agreement/{account_id}/sign works with correct name"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        account_id = test_account['id']
        
        # First check if already signed
        status_resp = requests.get(
            f"{BASE_URL}/api/credit-builder/agreement/{account_id}/status",
            headers=headers,
            timeout=10
        )
        if status_resp.status_code == 200 and status_resp.json().get('agreement_signed'):
            print("Agreement already signed, skipping sign test")
            return
        
        # Get account holder name
        full_name = f"{test_account['first_name']} {test_account['last_name']}"
        
        response = requests.post(
            f"{BASE_URL}/api/credit-builder/agreement/{account_id}/sign",
            json={"full_name": full_name, "ip_address": "127.0.0.1"},
            headers=headers,
            timeout=10
        )
        assert response.status_code == 200, f"Sign failed: {response.text}"
        data = response.json()
        assert 'signed_at' in data, "Missing signed_at in response"
        assert data.get('signer_name') == full_name
        print(f"Agreement signed successfully by {full_name}")


class TestCreditBuilderProducts:
    """Tests for Credit Builder products and plan tiers"""
    
    def test_products_public_endpoint(self):
        """Test GET /api/credit-builder/products returns products (public, no auth)"""
        response = requests.get(
            f"{BASE_URL}/api/credit-builder/products",
            timeout=10
        )
        assert response.status_code == 200, f"Get products failed: {response.text}"
        products = response.json()
        assert isinstance(products, list), "Products should be a list"
        assert len(products) > 0, "Should have at least one product"
        print(f"Products API returns {len(products)} products")


class TestHealthAndAuth:
    """Basic health and auth tests"""
    
    def test_auth_login(self):
        """Test admin login works"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "Admin@credlocity.com", "password": "Credit123!"},
            timeout=10
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert 'access_token' in data, "Missing access_token"
        assert 'user' in data, "Missing user"
        print("Admin login successful")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
