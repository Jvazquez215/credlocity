"""
Test suite for Payment Management features - Iteration 38
Tests:
1. Authorize.net health check with configured:true
2. Client types endpoint (7 types)
3. Dashboard summary with transactions
4. Local transactions with search/filter
5. Sync status
6. Credit creation and listing
7. Chargeback recording and listing
8. Corporate docs categories (8 categories)

IMPORTANT: Do NOT test POST /api/authorizenet/charge - production credentials!
"""

import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://rep-dashboard-11.preview.emergentagent.com')


class TestAuthorizeNetHealth:
    """Test Authorize.net health and configuration endpoints"""
    
    def test_health_returns_configured_true(self):
        """GET /api/authorizenet/health should return configured:true"""
        response = requests.get(f"{BASE_URL}/api/authorizenet/health")
        assert response.status_code == 200
        data = response.json()
        assert data["configured"] == True, f"Expected configured=True, got {data}"
        assert data["api_login_id_set"] == True
        assert data["transaction_key_set"] == True
        print(f"[PASS] Health: configured={data['configured']}, env={data.get('environment')}")


class TestClientTypes:
    """Test client types endpoint"""
    
    def test_client_types_returns_7_types(self):
        """GET /api/authorizenet/client-types should return 7 client types"""
        response = requests.get(f"{BASE_URL}/api/authorizenet/client-types")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 7, f"Expected 7 client types, got {len(data)}"
        
        expected_values = [
            "current_client", "past_due_collections", "outsourcing_client",
            "attorney_network", "new_client", "credit_repair", "other"
        ]
        actual_values = [ct["value"] for ct in data]
        for val in expected_values:
            assert val in actual_values, f"Missing client type: {val}"
        
        # Verify each has value and label
        for ct in data:
            assert "value" in ct
            assert "label" in ct
        
        print(f"[PASS] Client types: {len(data)} types returned")
        print(f"  Types: {actual_values}")


class TestDashboardSummary:
    """Test dashboard summary endpoint"""
    
    @pytest.fixture(scope='class')
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "Admin@credlocity.com", "password": "Credit123!"}
        )
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return response.json()["access_token"]
    
    def test_dashboard_summary_all_period(self, admin_token):
        """GET /api/authorizenet/dashboard-summary?period=all should return total_transactions > 0"""
        response = requests.get(
            f"{BASE_URL}/api/authorizenet/dashboard-summary?period=all",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify required fields
        assert "period" in data
        assert data["period"] == "all"
        assert "total_transactions" in data
        assert data["total_transactions"] > 0, f"Expected transactions > 0, got {data['total_transactions']}"
        assert "total_payments" in data
        assert "payment_count" in data
        assert "total_refunds" in data
        assert "total_chargebacks" in data
        assert "total_credits" in data
        assert "net_revenue" in data
        
        print(f"[PASS] Dashboard summary (all): {data['total_transactions']} total transactions")
        print(f"  Payments: ${data['total_payments']} ({data['payment_count']} txns)")
        print(f"  Net Revenue: ${data['net_revenue']}")
    
    def test_dashboard_summary_requires_auth(self):
        """Dashboard summary endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/authorizenet/dashboard-summary?period=month")
        assert response.status_code == 403
        print("[PASS] Dashboard summary correctly requires authentication")


class TestLocalTransactions:
    """Test local transactions with filters"""
    
    @pytest.fixture(scope='class')
    def admin_token(self):
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "Admin@credlocity.com", "password": "Credit123!"}
        )
        assert response.status_code == 200
        return response.json()["access_token"]
    
    def test_local_transactions_search_coleen(self, admin_token):
        """GET /api/authorizenet/local-transactions?search=Coleen should return transactions"""
        response = requests.get(
            f"{BASE_URL}/api/authorizenet/local-transactions?search=Coleen",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "transactions" in data
        assert "total" in data
        
        # If transactions found, verify client_name contains Coleen (case insensitive)
        if data["total"] > 0:
            for txn in data["transactions"]:
                client_name = txn.get("client_name", "") or ""
                # Search is case-insensitive regex
                assert "coleen" in client_name.lower() or "COLEEN" in client_name.upper(), \
                    f"Transaction client_name '{client_name}' doesn't match search 'Coleen'"
            print(f"[PASS] Search 'Coleen': {data['total']} transactions found")
        else:
            print(f"[INFO] Search 'Coleen': No transactions found (may not have Coleen in data)")
    
    def test_local_transactions_filter_payment_type(self, admin_token):
        """GET /api/authorizenet/local-transactions?txn_type=payment should filter only payments"""
        response = requests.get(
            f"{BASE_URL}/api/authorizenet/local-transactions?txn_type=payment&limit=20",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "transactions" in data
        
        # All returned transactions should be payment type
        for txn in data["transactions"]:
            assert txn.get("type") == "payment", f"Expected type='payment', got '{txn.get('type')}'"
        
        print(f"[PASS] Payment type filter: {len(data['transactions'])} payments returned (total: {data['total']})")
    
    def test_local_transactions_no_filter(self, admin_token):
        """Test local transactions returns data without filters"""
        response = requests.get(
            f"{BASE_URL}/api/authorizenet/local-transactions?limit=10",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "transactions" in data
        assert "total" in data
        assert data["total"] > 0, "Expected at least some transactions in database"
        
        print(f"[PASS] Local transactions: {data['total']} total, showing {len(data['transactions'])}")


class TestSyncStatus:
    """Test sync status endpoint"""
    
    @pytest.fixture(scope='class')
    def admin_token(self):
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "Admin@credlocity.com", "password": "Credit123!"}
        )
        assert response.status_code == 200
        return response.json()["access_token"]
    
    def test_sync_status_returns_status(self, admin_token):
        """GET /api/authorizenet/sync-status should return sync progress info"""
        response = requests.get(
            f"{BASE_URL}/api/authorizenet/sync-status",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "running" in data
        assert "progress" in data
        
        # If sync completed, check result
        if data.get("result"):
            assert "total_synced" in data["result"]
            print(f"[PASS] Sync status: running={data['running']}, synced={data['result'].get('total_synced', 'N/A')}")
        else:
            print(f"[PASS] Sync status: running={data['running']}, progress='{data['progress']}'")


class TestCreditsFeature:
    """Test credit issuance endpoints"""
    
    @pytest.fixture(scope='class')
    def admin_token(self):
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "Admin@credlocity.com", "password": "Credit123!"}
        )
        assert response.status_code == 200
        return response.json()["access_token"]
    
    def test_create_credit(self, admin_token):
        """POST /api/authorizenet/credit should create a client credit"""
        credit_data = {
            "client_name": "TEST_Pytest Credit Client",
            "amount": 10.00,
            "reason": "Pytest test credit - iteration 38",
            "client_type": "current_client"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/authorizenet/credit",
            headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"},
            json=credit_data
        )
        assert response.status_code == 200, f"Credit creation failed: {response.text}"
        data = response.json()
        
        assert "id" in data
        assert data["client_name"] == credit_data["client_name"]
        assert data["amount"] == credit_data["amount"]
        assert data["reason"] == credit_data["reason"]
        assert data["client_type"] == credit_data["client_type"]
        assert data["type"] == "credit"
        assert data["status"] == "issued"
        
        print(f"[PASS] Credit created: ID={data['id']}, amount=${data['amount']}")
        return data["id"]
    
    def test_list_credits(self, admin_token):
        """GET /api/authorizenet/credits should return credits list"""
        response = requests.get(
            f"{BASE_URL}/api/authorizenet/credits",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "credits" in data
        assert "total" in data
        assert isinstance(data["credits"], list)
        
        print(f"[PASS] Credits list: {data['total']} credits found")
        
        # Verify our test credit is in the list
        test_credits = [c for c in data["credits"] if "TEST_Pytest" in c.get("client_name", "")]
        if test_credits:
            print(f"  Found {len(test_credits)} test credit(s)")
    
    def test_credit_requires_fields(self, admin_token):
        """Test credit endpoint validates required fields"""
        # Missing client_name
        response = requests.post(
            f"{BASE_URL}/api/authorizenet/credit",
            headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"},
            json={"amount": 10.00, "reason": "Test"}
        )
        assert response.status_code == 400
        assert "client_name" in response.text.lower()
        print("[PASS] Credit endpoint validates required fields")


class TestChargebackFeature:
    """Test chargeback recording endpoints"""
    
    @pytest.fixture(scope='class')
    def admin_token(self):
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "Admin@credlocity.com", "password": "Credit123!"}
        )
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope='class')
    def sample_transaction_id(self, admin_token):
        """Get a real transaction ID from local-transactions for chargeback testing"""
        response = requests.get(
            f"{BASE_URL}/api/authorizenet/local-transactions?txn_type=payment&limit=5",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Find a payment transaction that's not already a chargeback
        for txn in data.get("transactions", []):
            if not txn.get("is_chargeback") and txn.get("transaction_id"):
                return txn["transaction_id"]
        
        pytest.skip("No suitable transaction found for chargeback test")
    
    def test_record_chargeback(self, admin_token, sample_transaction_id):
        """POST /api/authorizenet/chargeback should record a chargeback"""
        chargeback_data = {
            "transaction_id": sample_transaction_id,
            "chargeback_amount": 50.00,
            "reason": "TEST_Pytest chargeback - iteration 38"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/authorizenet/chargeback",
            headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"},
            json=chargeback_data
        )
        
        # Could be 200 (success) or 404 (if transaction not found in local DB)
        if response.status_code == 200:
            data = response.json()
            assert "message" in data
            assert "Chargeback recorded" in data["message"]
            print(f"[PASS] Chargeback recorded for transaction: {sample_transaction_id}")
        elif response.status_code == 404:
            print(f"[INFO] Transaction {sample_transaction_id} not found in local DB (may need sync)")
        else:
            pytest.fail(f"Unexpected response: {response.status_code} - {response.text}")
    
    def test_list_chargebacks(self, admin_token):
        """GET /api/authorizenet/chargebacks should return chargebacks list"""
        response = requests.get(
            f"{BASE_URL}/api/authorizenet/chargebacks",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "chargebacks" in data
        assert "total_count" in data
        assert "total_amount" in data
        assert isinstance(data["chargebacks"], list)
        
        print(f"[PASS] Chargebacks list: {data['total_count']} chargebacks, total ${data['total_amount']}")
    
    def test_chargeback_requires_fields(self, admin_token):
        """Test chargeback endpoint validates required fields"""
        response = requests.post(
            f"{BASE_URL}/api/authorizenet/chargeback",
            headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"},
            json={"transaction_id": "test", "reason": "Test"}  # Missing chargeback_amount
        )
        assert response.status_code == 400
        print("[PASS] Chargeback endpoint validates required fields")


class TestCorporateDocsCategories:
    """Test corporate documents categories endpoint"""
    
    def test_categories_returns_8_categories(self):
        """GET /api/corporate-docs/categories should return 8 categories"""
        response = requests.get(f"{BASE_URL}/api/corporate-docs/categories")
        assert response.status_code == 200
        data = response.json()
        
        assert len(data) == 8, f"Expected 8 categories, got {len(data)}"
        
        expected_values = [
            "partnership_agreement", "corporate_docs", "ein_docs",
            "amendments", "contracts", "legal", "financial", "other"
        ]
        actual_values = [c["value"] for c in data]
        for val in expected_values:
            assert val in actual_values, f"Missing category: {val}"
        
        print(f"[PASS] Corporate docs categories: {len(data)} categories")
        print(f"  Categories: {actual_values}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
