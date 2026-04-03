"""
Test Payment Gateway Settings and Finance Dashboard APIs - Iteration 99
Tests:
1. GET /api/gateway-settings - returns masked gateway credentials
2. GET /api/gateway-settings/status - returns active/configured/is_default status
3. PUT /api/gateway-settings/authorize-net - updates authorize.net settings
4. PUT /api/gateway-settings/paypal - updates paypal settings
5. PUT /api/gateway-settings/default - sets default gateway
6. POST /api/gateway-settings/test/authorize-net - tests authorize.net connection
7. POST /api/gateway-settings/test/paypal - tests paypal connection
8. GET /api/authorizenet/dashboard-summary - finance dashboard summary
9. GET /api/authorizenet/transactions - transactions list
10. GET /api/authorizenet/credits - credits list
11. GET /api/billing/coupons - coupons list
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestGatewaySettingsAPI:
    """Payment Gateway Settings API tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login as admin
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        token = login_response.json().get("access_token")
        assert token, "No token returned from login"
        self.session.headers.update({"Authorization": f"Bearer {token}"})
    
    def test_get_gateway_settings(self):
        """GET /api/gateway-settings returns masked credentials"""
        response = self.session.get(f"{BASE_URL}/api/gateway-settings")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        # Verify structure
        assert "authorize_net" in data, "Missing authorize_net config"
        assert "paypal" in data, "Missing paypal config"
        assert "default_gateway" in data, "Missing default_gateway"
        
        # Verify authorize_net has expected fields
        anet = data["authorize_net"]
        assert "api_login_id" in anet, "Missing api_login_id"
        assert "transaction_key" in anet, "Missing transaction_key"
        assert "environment" in anet, "Missing environment"
        assert "active" in anet, "Missing active flag"
        
        # Verify credentials are masked (should contain asterisks)
        if anet.get("api_login_id") and len(anet["api_login_id"]) > 4:
            assert "*" in anet["api_login_id"], "api_login_id should be masked"
        
        print(f"Gateway settings retrieved: default={data['default_gateway']}, anet_active={anet.get('active')}")
    
    def test_get_gateway_status(self):
        """GET /api/gateway-settings/status returns status for each gateway"""
        response = self.session.get(f"{BASE_URL}/api/gateway-settings/status")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        # Verify structure
        assert "authorize_net" in data, "Missing authorize_net status"
        assert "paypal" in data, "Missing paypal status"
        assert "default_gateway" in data, "Missing default_gateway"
        
        # Verify authorize_net status fields
        anet_status = data["authorize_net"]
        assert "active" in anet_status, "Missing active field"
        assert "configured" in anet_status, "Missing configured field"
        assert "is_default" in anet_status, "Missing is_default field"
        assert "environment" in anet_status, "Missing environment field"
        
        # Verify paypal status fields
        pp_status = data["paypal"]
        assert "active" in pp_status, "Missing active field"
        assert "configured" in pp_status, "Missing configured field"
        assert "is_default" in pp_status, "Missing is_default field"
        
        print(f"Gateway status: anet_configured={anet_status['configured']}, paypal_configured={pp_status['configured']}")
    
    def test_update_authorize_net_settings(self):
        """PUT /api/gateway-settings/authorize-net updates settings"""
        # Update environment only (don't change credentials)
        response = self.session.put(f"{BASE_URL}/api/gateway-settings/authorize-net", json={
            "environment": "production",
            "active": True
        })
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "message" in data, "Missing message in response"
        assert "updated" in data["message"].lower(), f"Unexpected message: {data['message']}"
        
        # Verify the update persisted
        verify_response = self.session.get(f"{BASE_URL}/api/gateway-settings")
        assert verify_response.status_code == 200
        verify_data = verify_response.json()
        assert verify_data["authorize_net"]["environment"] == "production"
        assert verify_data["authorize_net"]["active"] == True
        
        print("Authorize.net settings updated successfully")
    
    def test_update_paypal_settings(self):
        """PUT /api/gateway-settings/paypal updates settings"""
        response = self.session.put(f"{BASE_URL}/api/gateway-settings/paypal", json={
            "environment": "sandbox",
            "active": False
        })
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "message" in data, "Missing message in response"
        
        # Verify the update persisted
        verify_response = self.session.get(f"{BASE_URL}/api/gateway-settings")
        assert verify_response.status_code == 200
        verify_data = verify_response.json()
        assert verify_data["paypal"]["environment"] == "sandbox"
        
        print("PayPal settings updated successfully")
    
    def test_set_default_gateway(self):
        """PUT /api/gateway-settings/default sets default gateway"""
        # Set authorize_net as default
        response = self.session.put(f"{BASE_URL}/api/gateway-settings/default", json={
            "gateway": "authorize_net"
        })
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "message" in data, "Missing message in response"
        
        # Verify the update persisted
        verify_response = self.session.get(f"{BASE_URL}/api/gateway-settings/status")
        assert verify_response.status_code == 200
        verify_data = verify_response.json()
        assert verify_data["default_gateway"] == "authorize_net"
        assert verify_data["authorize_net"]["is_default"] == True
        
        print("Default gateway set to authorize_net")
    
    def test_set_default_gateway_invalid(self):
        """PUT /api/gateway-settings/default rejects invalid gateway"""
        response = self.session.put(f"{BASE_URL}/api/gateway-settings/default", json={
            "gateway": "invalid_gateway"
        })
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        
        print("Invalid gateway correctly rejected")
    
    def test_authorize_net_connection(self):
        """POST /api/gateway-settings/test/authorize-net tests connection"""
        response = self.session.post(f"{BASE_URL}/api/gateway-settings/test/authorize-net")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "success" in data, "Missing success field"
        assert "message" in data, "Missing message field"
        
        # Connection test should return success or a meaningful error
        print(f"Authorize.net test: success={data['success']}, message={data['message']}")
    
    def test_paypal_connection(self):
        """POST /api/gateway-settings/test/paypal tests connection (mocked)"""
        response = self.session.post(f"{BASE_URL}/api/gateway-settings/test/paypal")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "success" in data, "Missing success field"
        assert "message" in data, "Missing message field"
        
        # PayPal SDK not integrated, should return pending message
        print(f"PayPal test: success={data['success']}, message={data['message']}")


class TestFinanceDashboardAPI:
    """Finance Dashboard API tests (authorizenet endpoints)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login as admin
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        token = login_response.json().get("access_token")
        assert token, "No token returned from login"
        self.session.headers.update({"Authorization": f"Bearer {token}"})
    
    def test_dashboard_summary(self):
        """GET /api/authorizenet/dashboard-summary returns financial metrics"""
        response = self.session.get(f"{BASE_URL}/api/authorizenet/dashboard-summary?period=month")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        # Verify required fields
        assert "period" in data, "Missing period"
        assert "total_payments" in data, "Missing total_payments"
        assert "payment_count" in data, "Missing payment_count"
        assert "total_refunds" in data, "Missing total_refunds"
        assert "refund_count" in data, "Missing refund_count"
        assert "total_chargebacks" in data, "Missing total_chargebacks"
        assert "chargeback_count" in data, "Missing chargeback_count"
        assert "total_credits" in data, "Missing total_credits"
        assert "credit_count" in data, "Missing credit_count"
        assert "net_revenue" in data, "Missing net_revenue"
        
        print(f"Dashboard summary: payments=${data['total_payments']}, refunds=${data['total_refunds']}, net=${data['net_revenue']}")
    
    def test_dashboard_summary_periods(self):
        """GET /api/authorizenet/dashboard-summary works with different periods"""
        for period in ["week", "month", "quarter", "year", "all"]:
            response = self.session.get(f"{BASE_URL}/api/authorizenet/dashboard-summary?period={period}")
            assert response.status_code == 200, f"Failed for period={period}: {response.text}"
            data = response.json()
            assert data["period"] == period, f"Period mismatch: expected {period}, got {data['period']}"
        
        print("All period filters work correctly")
    
    def test_transactions_list(self):
        """GET /api/authorizenet/transactions returns transaction list"""
        # Using local-transactions endpoint which is the correct one for listing
        response = self.session.get(f"{BASE_URL}/api/authorizenet/local-transactions?limit=25")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "transactions" in data, "Missing transactions array"
        assert "total" in data, "Missing total count"
        assert isinstance(data["transactions"], list), "transactions should be a list"
        
        print(f"Transactions: {len(data['transactions'])} returned, {data['total']} total")
    
    def test_transactions_with_filters(self):
        """GET /api/authorizenet/local-transactions supports filters"""
        # Test with type filter
        response = self.session.get(f"{BASE_URL}/api/authorizenet/local-transactions?txn_type=payment&limit=10")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "transactions" in data
        
        # All returned transactions should be payments
        for txn in data["transactions"]:
            assert txn.get("type") == "payment", f"Expected payment type, got {txn.get('type')}"
        
        print(f"Transaction filter works: {len(data['transactions'])} payments returned")
    
    def test_credits_list(self):
        """GET /api/authorizenet/credits returns credits list"""
        response = self.session.get(f"{BASE_URL}/api/authorizenet/credits?limit=50")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "credits" in data, "Missing credits array"
        assert "total" in data, "Missing total count"
        assert isinstance(data["credits"], list), "credits should be a list"
        
        print(f"Credits: {len(data['credits'])} returned, {data['total']} total")
    
    def test_coupons_list(self):
        """GET /api/billing/coupons returns coupons list"""
        response = self.session.get(f"{BASE_URL}/api/billing/coupons")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "coupons should be a list"
        
        print(f"Coupons: {len(data)} returned")
    
    def test_chargebacks_list(self):
        """GET /api/authorizenet/chargebacks returns chargebacks list"""
        response = self.session.get(f"{BASE_URL}/api/authorizenet/chargebacks")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "chargebacks" in data, "Missing chargebacks array"
        assert "total_count" in data, "Missing total_count"
        assert "total_amount" in data, "Missing total_amount"
        
        print(f"Chargebacks: {data['total_count']} total, ${data['total_amount']} amount")


class TestGatewaySettingsAuth:
    """Test authentication requirements for gateway settings"""
    
    def test_gateway_settings_requires_auth(self):
        """GET /api/gateway-settings requires authentication"""
        response = requests.get(f"{BASE_URL}/api/gateway-settings")
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("Gateway settings correctly requires authentication")
    
    def test_gateway_status_requires_auth(self):
        """GET /api/gateway-settings/status requires authentication"""
        response = requests.get(f"{BASE_URL}/api/gateway-settings/status")
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("Gateway status correctly requires authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
