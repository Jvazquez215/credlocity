"""
Test Authorize.net Payment Integration - Iteration 101
Tests for:
1. GET /api/gateway/health - returns configured:true and environment:production
2. GET /api/authorizenet/dashboard-summary?period=all - returns total_transactions > 0
3. GET /api/authorizenet/local-transactions?limit=5 - returns transactions with client_type field
4. POST /api/collections/agreements/{id}/record-payment - accepts card fields
5. POST /api/outsourcing/admin/partners/{id}/credits/purchase - accepts card fields
6. POST /api/collections/pay/{token}/process - validates card fields
7. Frontend: Finance Dashboard PIN gate
8. Frontend: Homepage loads
"""

import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://rep-dashboard-11.preview.emergentagent.com")


class TestAuthorizeNetGateway:
    """Test Authorize.net gateway health and configuration"""
    
    def test_gateway_health_configured(self):
        """Test GET /api/gateway/health returns configured:true and environment:production"""
        response = requests.get(f"{BASE_URL}/api/gateway/health")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "configured" in data, "Response should have 'configured' field"
        assert data["configured"] == True, f"Expected configured=true, got {data['configured']}"
        assert "environment" in data, "Response should have 'environment' field"
        assert data["environment"] == "production", f"Expected environment=production, got {data['environment']}"
        print(f"Gateway health: configured={data['configured']}, environment={data['environment']}")


class TestAuthorizeNetDashboard:
    """Test Authorize.net dashboard and transaction endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    def test_dashboard_summary_has_transactions(self, admin_token):
        """Test GET /api/authorizenet/dashboard-summary?period=all returns total_transactions > 0"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/authorizenet/dashboard-summary?period=all", headers=headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "total_transactions" in data, "Response should have 'total_transactions' field"
        # The problem statement mentions 3576 existing transactions
        assert data["total_transactions"] > 0, f"Expected total_transactions > 0, got {data['total_transactions']}"
        print(f"Dashboard summary: total_transactions={data['total_transactions']}, net_revenue={data.get('net_revenue', 'N/A')}")
    
    def test_local_transactions_has_client_type(self, admin_token):
        """Test GET /api/authorizenet/local-transactions?limit=5 returns transactions with client_type field"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/authorizenet/local-transactions?limit=5", headers=headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "transactions" in data, "Response should have 'transactions' array"
        
        transactions = data["transactions"]
        assert len(transactions) > 0, "Expected at least 1 transaction"
        
        # Check that transactions have client_type field
        for txn in transactions:
            assert "client_type" in txn, f"Transaction {txn.get('id', 'unknown')} missing 'client_type' field"
            print(f"Transaction {txn.get('transaction_id', 'N/A')}: client_type={txn.get('client_type')}, amount={txn.get('amount')}")


class TestCollectionsAgreementPayment:
    """Test Collections Agreement Payment endpoint accepts card fields"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    def test_record_payment_endpoint_exists(self, admin_token):
        """Test POST /api/collections/agreements/{id}/record-payment endpoint exists and accepts card fields"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Use a fake agreement ID - we're just testing the endpoint accepts the parameters
        fake_agreement_id = "test-agreement-id-12345"
        
        # Test with card fields - using test card number (will be declined but validates endpoint)
        payload = {
            "amount": 100.00,
            "card_number": "4111111111111111",  # Test card number
            "expiration_date": "2026-12",
            "card_code": "123",
            "payment_method": "card"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/collections/agreements/{fake_agreement_id}/record-payment",
            headers=headers,
            json=payload
        )
        
        # We expect either 404 (agreement not found) or 400/502 (payment declined)
        # NOT 422 (validation error for missing fields) - which would mean endpoint doesn't accept card fields
        assert response.status_code in [400, 404, 502], f"Expected 400/404/502, got {response.status_code}: {response.text}"
        
        # If 404, the endpoint exists but agreement wasn't found (expected)
        # If 400/502, the endpoint tried to process the payment (also expected)
        print(f"Record payment endpoint response: {response.status_code} - {response.text[:200]}")


class TestOutsourcingCreditPurchase:
    """Test Outsourcing Credit Purchase endpoint accepts card fields"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    def test_credit_purchase_endpoint_exists(self, admin_token):
        """Test POST /api/outsourcing/admin/partners/{id}/credits/purchase endpoint exists and accepts card fields"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Use a fake partner ID - we're just testing the endpoint accepts the parameters
        fake_partner_id = "test-partner-id-12345"
        
        # Test with card fields - using test card number (will be declined but validates endpoint)
        payload = {
            "credits": 10,
            "payment_amount": 300.00,
            "card_number": "4111111111111111",  # Test card number
            "expiration_date": "2026-12",
            "card_code": "123",
            "payment_method": "credit_card",
            "notes": "Test purchase"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/outsourcing/admin/partners/{fake_partner_id}/credits/purchase",
            headers=headers,
            json=payload
        )
        
        # We expect either 404 (partner not found) or 400/502 (payment declined)
        # NOT 422 (validation error for missing fields)
        assert response.status_code in [400, 404, 502], f"Expected 400/404/502, got {response.status_code}: {response.text}"
        
        print(f"Credit purchase endpoint response: {response.status_code} - {response.text[:200]}")


class TestCollectionsLetterPayment:
    """Test Collections Letter Payment endpoint validates card fields"""
    
    def test_pay_process_endpoint_exists(self):
        """Test POST /api/collections/pay/{token}/process endpoint exists and validates card fields"""
        # Use a fake payment token
        fake_token = "test-payment-token-12345"
        
        # Test with card fields
        payload = {
            "session_token": "fake-session",
            "amount": 50.00,
            "card_number": "4111111111111111",
            "expiration_date": "2026-12",
            "card_code": "123"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/collections/pay/{fake_token}/process",
            json=payload
        )
        
        # We expect 403 (session expired) or 404 (token not found)
        # NOT 422 (validation error for missing card fields)
        assert response.status_code in [403, 404], f"Expected 403/404, got {response.status_code}: {response.text}"
        
        print(f"Pay process endpoint response: {response.status_code} - {response.text[:200]}")
    
    def test_pay_info_endpoint_exists(self):
        """Test GET /api/collections/pay/{token}/info endpoint exists"""
        fake_token = "test-payment-token-12345"
        
        response = requests.get(f"{BASE_URL}/api/collections/pay/{fake_token}/info")
        
        # We expect 404 (token not found) - endpoint exists
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"Pay info endpoint response: {response.status_code}")


class TestFrontendLoads:
    """Test frontend pages load correctly"""
    
    def test_homepage_loads(self):
        """Test homepage loads at /"""
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "text/html" in response.headers.get("content-type", ""), "Expected HTML response"
        print("Homepage loads successfully")
    
    def test_admin_finance_page_loads(self):
        """Test admin finance page loads at /admin/finance"""
        response = requests.get(f"{BASE_URL}/admin/finance")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "text/html" in response.headers.get("content-type", ""), "Expected HTML response"
        print("Admin finance page loads successfully")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
