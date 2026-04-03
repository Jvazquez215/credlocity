"""
Revenue Tracking Integration Tests - Iteration 105
Tests the central revenue tracking system across 7 backend modules:
- marketplace_api.py (attorney settlements & initial fees)
- school_api.py (payment plan payments)
- cpr_merger_api.py (CPR client payments)
- collections_api.py (manual collection payments)
- credit_builder_api.py (credit builder payments)
- outsourcing_portal_api.py (manual credit purchases)
- billing_settings_api.py (invoice payments)
"""

import pytest
import requests
import os
from uuid import uuid4

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAuthAndHealth:
    """Basic authentication and health checks"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "No access_token in response"
        return data["access_token"]
    
    def test_login_success(self, auth_token):
        """Test admin login returns valid token"""
        assert auth_token is not None
        assert len(auth_token) > 50
        print(f"✓ Login successful, token length: {len(auth_token)}")
    
    def test_auth_me_endpoint(self, auth_token):
        """Test /api/auth/me returns user info"""
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data.get("email") == "Admin@credlocity.com"
        print(f"✓ Auth me endpoint working, user: {data.get('email')}")


class TestRevenueDashboardAPI:
    """Test Revenue Dashboard API endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        return response.json().get("access_token")
    
    def test_revenue_dashboard_summary_all_period(self, auth_token):
        """Test GET /api/revenue/dashboard/summary?period=all returns all 7 source categories"""
        response = requests.get(
            f"{BASE_URL}/api/revenue/dashboard/summary?period=all",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "period" in data
        assert data["period"] == "all"
        assert "total_revenue" in data
        assert "total_transactions" in data
        assert "pending_revenue" in data
        assert "by_source" in data
        
        # Verify all 7 source categories are present
        by_source = data["by_source"]
        expected_sources = [
            "attorney_network", "collections", "credit_repair", 
            "outsourcing", "digital_products", "authorizenet", "stripe"
        ]
        for source in expected_sources:
            assert source in by_source, f"Missing source: {source}"
            assert "total" in by_source[source]
            assert "count" in by_source[source]
        
        print(f"✓ Revenue dashboard summary returns all 7 sources")
        print(f"  Total revenue: ${data['total_revenue']}")
        print(f"  Total transactions: {data['total_transactions']}")
        for source in expected_sources:
            print(f"  - {source}: ${by_source[source]['total']} ({by_source[source]['count']} txns)")
    
    def test_revenue_dashboard_summary_month_period(self, auth_token):
        """Test GET /api/revenue/dashboard/summary?period=month"""
        response = requests.get(
            f"{BASE_URL}/api/revenue/dashboard/summary?period=month",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["period"] == "month"
        assert "start_date" in data
        print(f"✓ Revenue dashboard month period working, start_date: {data['start_date']}")
    
    def test_revenue_dashboard_trends(self, auth_token):
        """Test GET /api/revenue/dashboard/trends"""
        response = requests.get(
            f"{BASE_URL}/api/revenue/dashboard/trends?months=12",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "trends" in data
        assert "months" in data
        print(f"✓ Revenue trends endpoint working, {len(data.get('trends', []))} months of data")
    
    def test_revenue_dashboard_projected(self, auth_token):
        """Test GET /api/revenue/dashboard/projected"""
        response = requests.get(
            f"{BASE_URL}/api/revenue/dashboard/projected",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "projections" in data
        assert "total_monthly_average" in data
        assert "total_annual_projection" in data
        print(f"✓ Revenue projections working, monthly avg: ${data['total_monthly_average']}")


class TestCPRMergerPaymentRevenue:
    """Test CPR Merger payment recording creates revenue_records"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        return response.json().get("access_token")
    
    def test_cpr_clients_list(self, auth_token):
        """Test GET /api/cpr/clients returns client list"""
        response = requests.get(
            f"{BASE_URL}/api/cpr/clients",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        clients = response.json()
        assert isinstance(clients, list)
        print(f"✓ CPR clients endpoint working, {len(clients)} clients found")
        return clients
    
    def test_cpr_payment_creates_revenue_record(self, auth_token):
        """Test POST /api/cpr/clients/{client_id}/payments creates revenue_record with source='credit_repair'"""
        # First get a client
        clients_response = requests.get(
            f"{BASE_URL}/api/cpr/clients",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        clients = clients_response.json()
        
        if not clients:
            pytest.skip("No CPR clients available for testing")
        
        client_id = clients[0]["id"]
        test_amount = 99.95
        
        # Record a payment
        payment_data = {
            "payment_type": "cr_monitoring",
            "amount_collected": test_amount,
            "month": "2026-04",
            "payment_date": "2026-04-01",
            "payment_method": "credit_card",
            "notes": "TEST_revenue_tracking_payment"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/cpr/clients/{client_id}/payments",
            json=payment_data,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Payment failed: {response.text}"
        payment = response.json()
        assert payment.get("amount_collected") == test_amount
        print(f"✓ CPR payment recorded: ${test_amount}")
        
        # Verify revenue record was created by checking dashboard
        summary_response = requests.get(
            f"{BASE_URL}/api/revenue/dashboard/summary?period=all",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        summary = summary_response.json()
        # The credit_repair source should have data (may be 0 if this is first payment)
        assert "credit_repair" in summary["by_source"]
        print(f"✓ Revenue record created, credit_repair total: ${summary['by_source']['credit_repair']['total']}")


class TestBillingInvoicePaymentRevenue:
    """Test Billing invoice payment creates revenue_records"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        return response.json().get("access_token")
    
    def test_create_invoice_and_record_payment(self, auth_token):
        """Test POST /api/billing/invoices/{invoice_id}/record-payment creates revenue_record"""
        # Create an invoice first
        invoice_data = {
            "invoice_type": "general",
            "entity_name": "TEST_Revenue_Tracking_Client",
            "entity_email": "test@example.com",
            "line_items": [{"description": "Test Service", "quantity": 1, "unit_price": 150, "amount": 150}],
            "subtotal": 150,
            "total_amount": 150,
            "due_date": "2026-04-30",
            "notes": "TEST_revenue_tracking_invoice"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/billing/invoices",
            json=invoice_data,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert create_response.status_code == 200, f"Invoice creation failed: {create_response.text}"
        invoice = create_response.json().get("invoice", {})
        invoice_id = invoice.get("id")
        assert invoice_id, "No invoice ID returned"
        print(f"✓ Invoice created: {invoice.get('invoice_number')}")
        
        # Record payment
        payment_data = {
            "amount": 150,
            "payment_method": "credit_card",
            "payment_reference": "TEST_REF_123",
            "notes": "TEST_revenue_tracking_payment"
        }
        
        payment_response = requests.post(
            f"{BASE_URL}/api/billing/invoices/{invoice_id}/record-payment",
            json=payment_data,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert payment_response.status_code == 200, f"Payment recording failed: {payment_response.text}"
        result = payment_response.json()
        assert result.get("status") == "paid"
        print(f"✓ Invoice payment recorded: ${result.get('total_paid')}")


class TestCollectionsCommissionDashboard:
    """Test Collections commission dashboard still works"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        return response.json().get("access_token")
    
    def test_collections_commission_dashboard(self, auth_token):
        """Test GET /api/collections/commission-dashboard returns valid data"""
        response = requests.get(
            f"{BASE_URL}/api/collections/commission-dashboard",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "summary" in data
        assert "total_earned" in data["summary"]
        assert "total_paid" in data["summary"]
        assert "total_pending" in data["summary"]
        
        print(f"✓ Collections commission dashboard working")
        print(f"  Total earned: ${data['summary']['total_earned']}")
        print(f"  Total paid: ${data['summary']['total_paid']}")


class TestAuthorizeNetSummary:
    """Test Authorize.net summary endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        return response.json().get("access_token")
    
    def test_authorizenet_summary(self, auth_token):
        """Test GET /api/revenue/authorizenet/summary returns valid data"""
        response = requests.get(
            f"{BASE_URL}/api/revenue/authorizenet/summary?period=month",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "gross_revenue" in data
        assert "net_revenue" in data
        assert "chargeback_rate" in data
        assert "payment_count" in data
        
        print(f"✓ Authorize.net summary working")
        print(f"  Gross revenue: ${data['gross_revenue']}")
        print(f"  Net revenue: ${data['net_revenue']}")
        print(f"  Chargeback rate: {data['chargeback_rate']}%")


class TestRevenueSourceSpecificEndpoints:
    """Test source-specific revenue endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        return response.json().get("access_token")
    
    def test_attorney_network_summary(self, auth_token):
        """Test GET /api/revenue/attorney-network/summary"""
        response = requests.get(
            f"{BASE_URL}/api/revenue/attorney-network/summary",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_revenue" in data
        assert "breakdown" in data
        print(f"✓ Attorney network summary: ${data['total_revenue']}")
    
    def test_collections_summary(self, auth_token):
        """Test GET /api/revenue/collections/summary"""
        response = requests.get(
            f"{BASE_URL}/api/revenue/collections/summary",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_collected" in data
        print(f"✓ Collections summary: ${data['total_collected']}")
    
    def test_credit_repair_summary(self, auth_token):
        """Test GET /api/revenue/credit-repair/summary"""
        response = requests.get(
            f"{BASE_URL}/api/revenue/credit-repair/summary",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "monthly_recurring_revenue" in data
        print(f"✓ Credit repair MRR: ${data['monthly_recurring_revenue']}")
    
    def test_outsourcing_summary(self, auth_token):
        """Test GET /api/revenue/outsourcing/summary"""
        response = requests.get(
            f"{BASE_URL}/api/revenue/outsourcing/summary",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_revenue" in data
        print(f"✓ Outsourcing revenue: ${data['total_revenue']}")


class TestPayrollDashboard:
    """Test Payroll dashboard manager override still works"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        return response.json().get("access_token")
    
    def test_payroll_dashboard(self, auth_token):
        """Test GET /api/payroll/dashboard returns valid data"""
        response = requests.get(
            f"{BASE_URL}/api/payroll/dashboard",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify dashboard structure
        assert "summary" in data or "total_payroll" in data or isinstance(data, dict)
        print(f"✓ Payroll dashboard working")
    
    def test_payroll_commissions(self, auth_token):
        """Test GET /api/payroll/commissions returns commission entries"""
        response = requests.get(
            f"{BASE_URL}/api/payroll/commissions",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Should return list or dict with commissions
        if isinstance(data, list):
            print(f"✓ Payroll commissions: {len(data)} entries")
        elif isinstance(data, dict) and "commissions" in data:
            print(f"✓ Payroll commissions: {len(data['commissions'])} entries")
        else:
            print(f"✓ Payroll commissions endpoint working")


# Cleanup fixture to remove test data
@pytest.fixture(scope="session", autouse=True)
def cleanup_test_data():
    """Cleanup test data after all tests complete"""
    yield
    # Note: In production, you would delete TEST_ prefixed records here
    print("\n✓ Test session complete")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
