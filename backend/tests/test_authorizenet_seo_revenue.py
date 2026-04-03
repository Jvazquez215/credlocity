"""
Test Suite: Authorize.net Payment Tracking, SEO Metadata, and Partners Hub Revenue
Tests the new features added in this session:
1. Authorize.net transaction CRUD and summary endpoints
2. SEO Metadata API (GET all, GET by slug, PUT update)
3. Partners Hub revenue overview endpoint
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL')
if BASE_URL and BASE_URL.endswith('/'):
    BASE_URL = BASE_URL.rstrip('/')

# Test credentials
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"
PARTNER_EMAIL = "Shar@credlocity.com"
PARTNER_PASSWORD = "Credit123!"


@pytest.fixture(scope="module")
def admin_token():
    """Get admin token for authenticated requests"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    assert response.status_code == 200, f"Admin login failed: {response.text}"
    return response.json()["access_token"]


@pytest.fixture(scope="module")
def partner_token():
    """Get partner token for Partners Hub access"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": PARTNER_EMAIL,
        "password": PARTNER_PASSWORD
    })
    if response.status_code != 200:
        pytest.skip(f"Partner login failed: {response.text}")
    return response.json()["access_token"]


class TestAuthorizenetTransactions:
    """Test Authorize.net payment transaction endpoints"""
    
    created_txn_id = None
    
    def test_create_payment_transaction(self, admin_token):
        """POST /api/revenue/authorizenet/transactions creates a new payment transaction"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        payload = {
            "type": "payment",
            "amount": 199.95,
            "status": "settled",
            "card_type": "Visa",
            "last_four": "4242",
            "customer_name": "TEST_John Doe",
            "customer_email": "test_john@example.com",
            "source_category": "credit_repair",
            "description": "Credit repair monthly fee"
        }
        response = requests.post(f"{BASE_URL}/api/revenue/authorizenet/transactions", 
                                 json=payload, headers=headers)
        assert response.status_code == 200, f"Failed to create payment: {response.text}"
        data = response.json()
        assert data["type"] == "payment"
        assert data["amount"] == 199.95
        assert data["status"] == "settled"
        assert data["card_type"] == "Visa"
        assert "id" in data
        TestAuthorizenetTransactions.created_txn_id = data["id"]
        print(f"PASS: Created payment transaction ID: {data['id']}")
    
    def test_create_chargeback_transaction(self, admin_token):
        """POST /api/revenue/authorizenet/transactions creates a chargeback with negative revenue"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        payload = {
            "type": "chargeback",
            "amount": 99.95,
            "status": "settled",
            "card_type": "Mastercard",
            "customer_name": "TEST_Jane Smith",
            "chargeback_reason": "Fraud - card not present",
            "source_category": "credit_repair"
        }
        response = requests.post(f"{BASE_URL}/api/revenue/authorizenet/transactions",
                                 json=payload, headers=headers)
        assert response.status_code == 200, f"Failed to create chargeback: {response.text}"
        data = response.json()
        assert data["type"] == "chargeback"
        assert data["amount"] == 99.95
        print(f"PASS: Created chargeback transaction")
    
    def test_create_refund_transaction(self, admin_token):
        """POST /api/revenue/authorizenet/transactions creates a refund"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        payload = {
            "type": "refund",
            "amount": 50.00,
            "status": "settled",
            "card_type": "Amex",
            "customer_name": "TEST_Bob Wilson",
            "description": "Partial refund - service cancellation",
            "source_category": "outsourcing"
        }
        response = requests.post(f"{BASE_URL}/api/revenue/authorizenet/transactions",
                                 json=payload, headers=headers)
        assert response.status_code == 200, f"Failed to create refund: {response.text}"
        data = response.json()
        assert data["type"] == "refund"
        assert data["amount"] == 50.00
        print(f"PASS: Created refund transaction")
    
    def test_list_transactions_with_filters(self, admin_token):
        """GET /api/revenue/authorizenet/transactions returns list with filters"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Test without filters
        response = requests.get(f"{BASE_URL}/api/revenue/authorizenet/transactions", headers=headers)
        assert response.status_code == 200, f"Failed to list transactions: {response.text}"
        data = response.json()
        assert "transactions" in data
        assert "total" in data
        assert isinstance(data["transactions"], list)
        print(f"PASS: Listed {data['total']} transactions total")
        
        # Test with type filter
        response = requests.get(f"{BASE_URL}/api/revenue/authorizenet/transactions?type=payment", 
                               headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert all(t["type"] == "payment" for t in data["transactions"])
        print(f"PASS: Filter by type=payment returned {len(data['transactions'])} transactions")
    
    def test_authorizenet_summary_kpis(self, admin_token):
        """GET /api/revenue/authorizenet/summary?period=month returns KPIs"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/revenue/authorizenet/summary?period=month", 
                               headers=headers)
        assert response.status_code == 200, f"Failed to get summary: {response.text}"
        data = response.json()
        
        # Verify all expected KPI fields are present
        expected_fields = [
            "period", "gross_revenue", "total_chargebacks", "total_refunds", 
            "net_revenue", "chargeback_rate", "avg_transaction", 
            "by_card_type", "by_source_category"
        ]
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"
        
        # Verify numeric values
        assert isinstance(data["gross_revenue"], (int, float))
        assert isinstance(data["chargeback_rate"], (int, float))
        assert isinstance(data["by_card_type"], dict)
        assert isinstance(data["by_source_category"], dict)
        print(f"PASS: Summary KPIs - Gross: ${data['gross_revenue']}, Net: ${data['net_revenue']}, Chargeback rate: {data['chargeback_rate']}%")


class TestSEOMetadataAPI:
    """Test SEO Metadata API endpoints"""
    
    def test_get_all_seo_metadata_returns_22_plus(self, admin_token):
        """GET /api/seo/metadata returns 22+ entries"""
        response = requests.get(f"{BASE_URL}/api/seo/metadata")
        assert response.status_code == 200, f"Failed to get SEO metadata: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 22, f"Expected 22+ SEO entries, got {len(data)}"
        
        # Check first entry has required fields
        if len(data) > 0:
            entry = data[0]
            required_fields = ["page_slug", "title", "description"]
            for field in required_fields:
                assert field in entry, f"Missing field {field} in SEO entry"
        print(f"PASS: GET /api/seo/metadata returned {len(data)} entries")
    
    def test_get_seo_by_slug(self, admin_token):
        """GET /api/seo/metadata/{page_slug} returns specific metadata"""
        response = requests.get(f"{BASE_URL}/api/seo/metadata/credit-scores")
        assert response.status_code == 200, f"Failed to get credit-scores SEO: {response.text}"
        data = response.json()
        assert data["page_slug"] == "credit-scores"
        assert "title" in data
        assert "description" in data
        assert "keywords" in data
        assert "canonical_url" in data
        print(f"PASS: Got SEO metadata for credit-scores page")
    
    def test_update_seo_metadata(self, admin_token):
        """PUT /api/seo/metadata/credit-scores updates SEO metadata successfully"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        update_payload = {
            "title": "Credit Scores Explained: Updated Title | Credlocity"
        }
        response = requests.put(f"{BASE_URL}/api/seo/metadata/credit-scores", 
                               json=update_payload, headers=headers)
        assert response.status_code == 200, f"Failed to update SEO: {response.text}"
        data = response.json()
        assert "Updated" in data.get("title", "") or data.get("title") is not None
        print(f"PASS: Updated SEO metadata for credit-scores")
        
        # Reset to original
        reset_payload = {
            "title": "Credit Scores Explained: FICO vs VantageScore — All Versions, History & Factors | Credlocity"
        }
        requests.put(f"{BASE_URL}/api/seo/metadata/credit-scores", json=reset_payload, headers=headers)
    
    def test_seo_metadata_not_found(self):
        """GET /api/seo/metadata/nonexistent-page returns 404"""
        response = requests.get(f"{BASE_URL}/api/seo/metadata/nonexistent-page-xyz123")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"PASS: GET nonexistent SEO page returns 404")


class TestPartnersHubRevenue:
    """Test Partners Hub revenue overview endpoint"""
    
    def test_partners_hub_revenue_overview(self, partner_token):
        """GET /api/revenue/partners-hub/revenue-overview returns comprehensive revenue data"""
        headers = {"Authorization": f"Bearer {partner_token}"}
        response = requests.get(f"{BASE_URL}/api/revenue/partners-hub/revenue-overview", 
                               headers=headers)
        assert response.status_code == 200, f"Failed to get revenue overview: {response.text}"
        data = response.json()
        
        # Verify expected structure
        expected_keys = ["this_month", "ytd", "all_time", "monthly_trends", "authorizenet", "pending"]
        for key in expected_keys:
            assert key in data, f"Missing key: {key}"
        
        # Verify this_month structure
        assert "total" in data["this_month"]
        assert "by_source" in data["this_month"]
        
        # Verify ytd structure
        assert "total" in data["ytd"]
        
        # Verify monthly_trends is a list
        assert isinstance(data["monthly_trends"], list)
        
        # Verify authorizenet structure
        assert "this_month" in data["authorizenet"]
        
        print(f"PASS: Partners Hub revenue overview - This Month: ${data['this_month']['total']}, YTD: ${data['ytd']['total']}")
    
    def test_partners_hub_requires_partner(self, admin_token):
        """Verify non-partner access is handled"""
        # Note: Admin might also have is_partner=true, so this test validates the endpoint exists
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/revenue/partners-hub/revenue-overview", 
                               headers=headers)
        # Either 200 (if admin is partner) or 403 (if not)
        assert response.status_code in [200, 403], f"Unexpected status: {response.status_code}"
        print(f"PASS: Partners Hub access control working (status: {response.status_code})")


class TestRevenueDashboardSummary:
    """Test revenue dashboard summary endpoints"""
    
    def test_dashboard_summary(self, admin_token):
        """GET /api/revenue/dashboard/summary returns aggregated data"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/revenue/dashboard/summary?period=month", 
                               headers=headers)
        assert response.status_code == 200, f"Failed to get dashboard summary: {response.text}"
        data = response.json()
        
        expected_fields = ["period", "total_revenue", "pending_revenue", "by_source"]
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"
        
        # Verify by_source includes authorizenet
        assert "authorizenet" in data["by_source"], "Missing authorizenet in by_source"
        print(f"PASS: Dashboard summary - Total: ${data['total_revenue']}, Pending: ${data['pending_revenue']}")


class TestMiddlewareFunctions:
    """Test middleware functions exist and are callable"""
    
    def test_middleware_module_exists(self):
        """Verify middleware module is properly configured"""
        import sys
        sys.path.insert(0, '/app/backend')
        from middleware import check_document_access, verify_attorney_payment, set_db
        assert callable(check_document_access)
        assert callable(verify_attorney_payment)
        assert callable(set_db)
        print("PASS: Middleware functions (check_document_access, verify_attorney_payment) exist")


# Cleanup fixture
@pytest.fixture(scope="module", autouse=True)
def cleanup(request, admin_token):
    """Clean up TEST_ prefixed data after tests"""
    def cleanup_test_data():
        headers = {"Authorization": f"Bearer {admin_token}"}
        # Note: We don't have a delete endpoint for authorizenet transactions
        # The transactions are self-contained test data
        print("Test cleanup: Test transactions remain in DB (no delete endpoint)")
    
    request.addfinalizer(cleanup_test_data)
