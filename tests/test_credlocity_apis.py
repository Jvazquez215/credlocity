"""
Credlocity API Tests - Iteration 2
Testing:
- Security API endpoints (/api/security/*)
- Case Management API endpoints (/api/cases/*)
- Company Management API endpoints (/api/companies/*)
- Billing API public endpoints (/api/billing/public/*)
"""

import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://condescending-wozniak-3.preview.emergentagent.com').rstrip('/')

# Test credentials
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"


class TestSecurityAPI:
    """Security API endpoint tests"""
    
    def test_security_health_check(self):
        """Test public security health endpoint"""
        response = requests.get(f"{BASE_URL}/api/security/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "services" in data
        assert data["services"]["audit_logging"] == "active"
        assert data["services"]["rate_limiting"] == "active"
        assert data["services"]["encryption"] == "active"
        print(f"✓ Security health check passed: {data['status']}")
    
    def test_audit_log_requires_auth(self):
        """Test that audit log endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/security/audit-log")
        assert response.status_code == 401
        print("✓ Audit log correctly requires authentication")
    
    def test_audit_log_with_admin_auth(self, admin_token):
        """Test audit log endpoint with admin authentication"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/security/audit-log", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "events" in data
        assert "count" in data
        assert "filters" in data
        print(f"✓ Audit log accessible with admin auth, {data['count']} events found")
    
    def test_audit_log_summary_with_admin(self, admin_token):
        """Test audit log summary endpoint"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/security/audit-log/summary?days=7", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "period_days" in data
        assert "event_counts" in data
        assert "total_events" in data
        print(f"✓ Audit log summary: {data['total_events']} total events in last {data['period_days']} days")
    
    def test_rate_limits_status_requires_admin(self, admin_token):
        """Test rate limits status endpoint"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(
            f"{BASE_URL}/api/security/rate-limits/status?identifier=test-ip&identifier_type=ip",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "identifier" in data
        assert "identifier_type" in data
        print(f"✓ Rate limits status endpoint working")
    
    def test_failed_logins_endpoint(self, admin_token):
        """Test failed logins monitoring endpoint"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/security/failed-logins?hours=24", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "period_hours" in data
        assert "failed_attempts" in data
        assert "count" in data
        print(f"✓ Failed logins endpoint: {data['count']} failed attempts in last {data['period_hours']} hours")


class TestBillingPublicAPI:
    """Billing API public endpoint tests"""
    
    def test_public_pricing_products(self):
        """Test public pricing products endpoint"""
        response = requests.get(f"{BASE_URL}/api/billing/public/pricing-products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # Check for setup services
        setup_services = [p for p in data if p.get("category") == "setup_service"]
        assert len(setup_services) >= 2, "Should have at least 2 setup services"
        
        # Check for pay-per-delete options
        ppd_options = [p for p in data if p.get("category") == "pay_per_delete"]
        assert len(ppd_options) >= 3, "Should have at least 3 pay-per-delete options"
        
        # Verify product structure
        for product in data:
            assert "id" in product
            assert "name" in product
            assert "price_display" in product
            assert "category" in product
            assert product.get("show_on_website") == True
        
        print(f"✓ Public pricing products: {len(setup_services)} setup services, {len(ppd_options)} PPD options")
    
    def test_public_pricing_plans(self):
        """Test public pricing plans endpoint"""
        response = requests.get(f"{BASE_URL}/api/billing/public/pricing-plans")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Public pricing plans: {len(data)} plans returned")
    
    def test_public_pricing_config(self):
        """Test public pricing page config endpoint"""
        response = requests.get(f"{BASE_URL}/api/billing/public/pricing-config")
        assert response.status_code == 200
        data = response.json()
        assert "hero" in data or "sections" in data
        print(f"✓ Public pricing config endpoint working")


class TestCaseManagementAPI:
    """Case Management API endpoint tests"""
    
    def test_cases_list_requires_auth(self):
        """Test that cases list requires authentication"""
        response = requests.get(f"{BASE_URL}/api/cases")
        assert response.status_code == 401
        print("✓ Cases list correctly requires authentication")
    
    def test_cases_list_with_admin(self, admin_token):
        """Test cases list with admin authentication"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/cases", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "cases" in data
        assert "total" in data
        print(f"✓ Cases list: {data['total']} total cases")
    
    def test_create_case_with_admin(self, admin_token):
        """Test case creation with admin authentication"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        case_data = {
            "client_name": "TEST_John Doe",
            "client_first_name": "John",
            "client_last_name": "Doe",
            "client_email": "test_john@example.com",
            "client_phone": "555-123-4567",
            "client_state": "CA",
            "client_city": "Los Angeles",
            "case_summary": "Test case for API testing"
        }
        response = requests.post(f"{BASE_URL}/api/cases/create", json=case_data, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "case_id" in data
        assert "case_number" in data
        print(f"✓ Case created: {data['case_number']}")
        return data["case_id"]
    
    def test_get_case_details(self, admin_token, test_case_id):
        """Test getting case details"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/cases/{test_case_id}", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "case" in data
        assert data["case"]["id"] == test_case_id
        print(f"✓ Case details retrieved: {data['case']['case_number']}")
    
    def test_update_case(self, admin_token, test_case_id):
        """Test updating a case"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        update_data = {
            "case_summary": "Updated test case summary",
            "internal_notes": "Test internal notes"
        }
        response = requests.put(f"{BASE_URL}/api/cases/{test_case_id}", json=update_data, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["case_summary"] == "Updated test case summary"
        print(f"✓ Case updated successfully")
    
    def test_add_dispute_to_case(self, admin_token, test_case_id):
        """Test adding a dispute to a case"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        dispute_data = {
            "recipient_type": "bureau",
            "recipient_name": "Experian",
            "letter_date": datetime.now().isoformat(),
            "mailing_method": "certified",
            "dispute_reason": "Inaccurate information",
            "items_disputed": ["Late payment on account XYZ"]
        }
        response = requests.post(f"{BASE_URL}/api/cases/{test_case_id}/disputes/add", json=dispute_data, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "dispute" in data
        assert data["dispute"]["recipient_name"] == "Experian"
        print(f"✓ Dispute added to case")
        return data["dispute"]["id"]
    
    def test_add_violation_to_case(self, admin_token, test_case_id):
        """Test adding a violation to a case"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        violation_data = {
            "violation_type": "1681s-2(b)",
            "violation_description": "Failure to investigate dispute",
            "defendant": "Experian",
            "defendant_type": "cra",
            "evidence_summary": "Bureau failed to respond within 30 days"
        }
        response = requests.post(f"{BASE_URL}/api/cases/{test_case_id}/violations/add", json=violation_data, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "violation" in data
        print(f"✓ Violation added to case")
    
    def test_analyze_case(self, admin_token, test_case_id):
        """Test case analysis endpoint"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.post(f"{BASE_URL}/api/cases/{test_case_id}/analyze", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "case_id" in data
        assert "tier" in data
        assert "quality_score" in data
        print(f"✓ Case analyzed: Tier {data['tier']}, Quality Score {data['quality_score']}")
    
    def test_case_readiness(self, admin_token, test_case_id):
        """Test case marketplace readiness check"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/cases/{test_case_id}/readiness", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "ready" in data
        assert "quality_score" in data
        print(f"✓ Case readiness: Ready={data['ready']}, Score={data['quality_score']}")
    
    def test_case_timeline(self, admin_token, test_case_id):
        """Test case timeline endpoint"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/cases/{test_case_id}/timeline", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "timeline" in data
        print(f"✓ Case timeline: {len(data['timeline'])} events")


class TestCompanyManagementAPI:
    """Company Management API endpoint tests"""
    
    def test_company_signup(self):
        """Test company signup endpoint"""
        signup_data = {
            "company_name": "TEST_Credit Repair Co",
            "owner_name": "Test Owner",
            "email": f"test_company_{datetime.now().timestamp()}@example.com",
            "phone": "555-987-6543",
            "password": "TestPass123!"
        }
        response = requests.post(f"{BASE_URL}/api/companies/signup", json=signup_data)
        assert response.status_code == 200
        data = response.json()
        assert "company_id" in data
        assert "signup_fee" in data
        assert "monthly_fee" in data
        print(f"✓ Company signup successful: {data['company_id']}")
        return data["company_id"], signup_data["email"], signup_data["password"]
    
    def test_company_login(self, test_company_credentials):
        """Test company login endpoint"""
        email, password = test_company_credentials
        login_data = {"email": email, "password": password}
        response = requests.post(f"{BASE_URL}/api/companies/login", json=login_data)
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert "company" in data
        print(f"✓ Company login successful")
        return data["token"]
    
    def test_admin_list_companies(self, admin_token):
        """Test admin list companies endpoint"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/companies/admin/list", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "companies" in data
        assert "total" in data
        print(f"✓ Admin list companies: {data['total']} companies")
    
    def test_admin_company_stats(self, admin_token):
        """Test admin company stats endpoint"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/companies/admin/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "companies" in data
        assert "total" in data["companies"]
        print(f"✓ Admin company stats: {data['companies']['total']} total, {data['companies']['active']} active")


# Fixtures
@pytest.fixture(scope="module")
def admin_token():
    """Get admin authentication token"""
    login_data = {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    if response.status_code != 200:
        pytest.skip(f"Admin login failed: {response.status_code} - {response.text}")
    return response.json().get("access_token")


@pytest.fixture(scope="module")
def test_case_id(admin_token):
    """Create a test case and return its ID"""
    headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
    case_data = {
        "client_name": "TEST_Fixture Client",
        "client_email": "test_fixture@example.com",
        "client_state": "TX",
        "case_summary": "Test case created by fixture"
    }
    response = requests.post(f"{BASE_URL}/api/cases/create", json=case_data, headers=headers)
    if response.status_code != 200:
        pytest.skip(f"Failed to create test case: {response.text}")
    return response.json()["case_id"]


@pytest.fixture(scope="module")
def test_company_credentials():
    """Create a test company and return credentials"""
    signup_data = {
        "company_name": "TEST_Fixture Company",
        "owner_name": "Fixture Owner",
        "email": f"test_fixture_{datetime.now().timestamp()}@example.com",
        "phone": "555-111-2222",
        "password": "FixturePass123!"
    }
    response = requests.post(f"{BASE_URL}/api/companies/signup", json=signup_data)
    if response.status_code != 200:
        pytest.skip(f"Failed to create test company: {response.text}")
    return signup_data["email"], signup_data["password"]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
