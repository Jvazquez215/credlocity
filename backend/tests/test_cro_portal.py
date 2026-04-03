"""
CRO Portal API Tests - Iteration 106
Tests for CRO registration, login, dashboard, case submission, earnings, messages, subscription, and settings
"""
import pytest
import requests
import os
from datetime import datetime
from uuid import uuid4

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
CRO_TEST_EMAIL = "testcro@example.com"
CRO_TEST_PASSWORD = "TestCRO123!"

# For registration tests - unique email each run
TEST_UNIQUE_EMAIL = f"test_cro_{uuid4().hex[:8]}@example.com"


class TestCROAuth:
    """CRO Authentication endpoint tests"""
    
    def test_cro_login_success(self):
        """Test CRO login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/cro/login", json={
            "email": CRO_TEST_EMAIL,
            "password": CRO_TEST_PASSWORD
        })
        print(f"Login response: {response.status_code} - {response.text[:200]}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data, "Response should contain token"
        assert "cro" in data, "Response should contain cro object"
        assert data["cro"]["email"] == CRO_TEST_EMAIL.lower()
        assert "company_name" in data["cro"]
        assert "status" in data["cro"]
        print(f"Login successful for CRO: {data['cro']['company_name']}")
    
    def test_cro_login_invalid_credentials(self):
        """Test CRO login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/cro/login", json={
            "email": "invalid@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_cro_login_missing_fields(self):
        """Test CRO login with missing fields"""
        response = requests.post(f"{BASE_URL}/api/cro/login", json={
            "email": CRO_TEST_EMAIL
        })
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"


class TestCRORegistration:
    """CRO Registration endpoint tests"""
    
    def test_cro_register_missing_fields(self):
        """Test registration with missing required fields"""
        response = requests.post(f"{BASE_URL}/api/cro/register", json={
            "company_name": "Test CRO",
            "email": TEST_UNIQUE_EMAIL
        })
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "detail" in data
        print(f"Missing fields error: {data['detail']}")
    
    def test_cro_register_without_agreement(self):
        """Test registration without accepting agreement"""
        response = requests.post(f"{BASE_URL}/api/cro/register", json={
            "company_name": "Test CRO Company",
            "owner_name": "Test Owner",
            "email": f"test_{uuid4().hex[:8]}@example.com",
            "phone": "555-123-4567",
            "ein": f"12-{uuid4().hex[:7]}",
            "state": "FL",
            "password": "TestPass123!",
            "agreement_accepted": False
        })
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "agreement" in data.get("detail", "").lower()
    
    def test_cro_register_duplicate_email(self):
        """Test registration with existing email"""
        response = requests.post(f"{BASE_URL}/api/cro/register", json={
            "company_name": "Duplicate CRO",
            "owner_name": "Test Owner",
            "email": CRO_TEST_EMAIL,  # Already exists
            "phone": "555-123-4567",
            "ein": f"99-{uuid4().hex[:7]}",
            "state": "FL",
            "password": "TestPass123!",
            "agreement_accepted": True
        })
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "email" in data.get("detail", "").lower() or "exists" in data.get("detail", "").lower()


class TestCRODashboard:
    """CRO Dashboard endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/cro/login", json={
            "email": CRO_TEST_EMAIL,
            "password": CRO_TEST_PASSWORD
        })
        if response.status_code == 200:
            self.token = response.json()["token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Could not authenticate CRO user")
    
    def test_get_dashboard(self):
        """Test GET /api/cro/dashboard returns summary data"""
        response = requests.get(f"{BASE_URL}/api/cro/dashboard", headers=self.headers)
        print(f"Dashboard response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "summary" in data, "Response should contain summary"
        summary = data["summary"]
        
        # Verify summary fields
        assert "total_cases" in summary
        assert "pending_cases" in summary
        assert "listed_cases" in summary
        assert "total_earnings" in summary
        assert "pending_payouts" in summary
        
        assert "recent_cases" in data, "Response should contain recent_cases"
        assert "recent_payouts" in data, "Response should contain recent_payouts"
        print(f"Dashboard summary: {summary}")
    
    def test_dashboard_unauthorized(self):
        """Test dashboard without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/cro/dashboard")
        assert response.status_code == 401


class TestCROProfile:
    """CRO Profile (me) endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/cro/login", json={
            "email": CRO_TEST_EMAIL,
            "password": CRO_TEST_PASSWORD
        })
        if response.status_code == 200:
            self.token = response.json()["token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Could not authenticate CRO user")
    
    def test_get_profile(self):
        """Test GET /api/cro/me returns profile data"""
        response = requests.get(f"{BASE_URL}/api/cro/me", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["email"] == CRO_TEST_EMAIL.lower()
        assert "company_name" in data
        assert "owner_name" in data
        assert "ein" in data
        assert "state" in data
        assert "referral_code" in data
        assert "status" in data
        # Sensitive fields should not be returned
        assert "password_hash" not in data
        assert "token" not in data
        print(f"Profile: {data['company_name']} - {data['email']}")
    
    def test_update_profile(self):
        """Test PUT /api/cro/me updates allowed fields"""
        # Get current profile
        get_response = requests.get(f"{BASE_URL}/api/cro/me", headers=self.headers)
        original = get_response.json()
        
        # Update allowed fields
        new_phone = f"555-{uuid4().hex[:3]}-{uuid4().hex[:4]}"
        response = requests.put(f"{BASE_URL}/api/cro/me", headers=self.headers, json={
            "phone": new_phone,
            "website": "https://testcro.example.com"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "profile" in data
        assert data["profile"]["phone"] == new_phone
        
        # Verify change persisted
        verify_response = requests.get(f"{BASE_URL}/api/cro/me", headers=self.headers)
        assert verify_response.json()["phone"] == new_phone


class TestCROCaseSubmission:
    """CRO Case submission endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/cro/login", json={
            "email": CRO_TEST_EMAIL,
            "password": CRO_TEST_PASSWORD
        })
        if response.status_code == 200:
            self.token = response.json()["token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Could not authenticate CRO user")
    
    def test_submit_case_success(self):
        """Test POST /api/cro/cases creates a new case"""
        case_data = {
            "client_name": f"TEST_Client_{uuid4().hex[:6]}",
            "client_email": "testclient@example.com",
            "client_phone": "555-987-6543",
            "client_state": "FL",
            "dispute_date": "2025-12-15",
            "mail_method": "certified",
            "usps_tracking": "9400111899223456789012",
            "violation_type": "FCRA - Failure to Investigate",
            "violation_count": 3,
            "violation_details": "Bureau failed to investigate dispute within 30 days",
            "bureau": "Equifax",
            "bureau_responses_received": 1,
            "documentation_quality": "excellent",
            "case_summary": "Client disputed inaccurate information, bureau failed to respond properly"
        }
        
        response = requests.post(f"{BASE_URL}/api/cro/cases", headers=self.headers, json=case_data)
        print(f"Submit case response: {response.status_code} - {response.text[:300]}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "case" in data
        case = data["case"]
        
        # Verify case fields
        assert "id" in case
        assert "case_number" in case
        assert case["client_name"] == case_data["client_name"]
        assert case["status"] == "pending_review"
        assert "estimated_value" in case
        assert case["estimated_value"] > 0
        
        print(f"Case created: {case['case_number']} - Est. Value: ${case['estimated_value']}")
        
        # Store case_id for later tests
        self.created_case_id = case["id"]
        return case
    
    def test_submit_case_missing_fields(self):
        """Test case submission with missing required fields"""
        response = requests.post(f"{BASE_URL}/api/cro/cases", headers=self.headers, json={
            "client_name": "Test Client"
        })
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    
    def test_submit_case_bidding_eligible(self):
        """Test case that qualifies for bidding (high value)"""
        case_data = {
            "client_name": f"TEST_HighValue_{uuid4().hex[:6]}",
            "client_state": "CA",
            "dispute_date": "2025-11-01",
            "mail_method": "certified",  # Required for bidding
            "violation_type": "FCRA - Failure to Investigate",
            "violation_count": 15,  # High count for high value
            "bureau": "All Three",
            "bureau_responses_received": 3,
            "documentation_quality": "excellent"
        }
        
        response = requests.post(f"{BASE_URL}/api/cro/cases", headers=self.headers, json=case_data)
        assert response.status_code == 200
        
        case = response.json()["case"]
        # With 15 violations, certified mail, excellent docs: 15*1000*1.5*1.3 + 3*500 = $30,750
        print(f"High value case: ${case['estimated_value']} - Bidding eligible: {case['qualifies_bidding']}")
        assert case["estimated_value"] >= 10000, "High violation count should result in high value"


class TestCROCaseTracker:
    """CRO Case tracker endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/cro/login", json={
            "email": CRO_TEST_EMAIL,
            "password": CRO_TEST_PASSWORD
        })
        if response.status_code == 200:
            self.token = response.json()["token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Could not authenticate CRO user")
    
    def test_list_cases(self):
        """Test GET /api/cro/cases returns case list"""
        response = requests.get(f"{BASE_URL}/api/cro/cases", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "cases" in data
        assert "total" in data
        assert isinstance(data["cases"], list)
        print(f"Total cases: {data['total']}")
    
    def test_list_cases_with_status_filter(self):
        """Test case list with status filter"""
        response = requests.get(f"{BASE_URL}/api/cro/cases?status=pending_review", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        # All returned cases should have pending_review status
        for case in data["cases"]:
            assert case["status"] == "pending_review"
    
    def test_get_single_case(self):
        """Test GET /api/cro/cases/{case_id} returns case details"""
        # First get list to find a case
        list_response = requests.get(f"{BASE_URL}/api/cro/cases?limit=1", headers=self.headers)
        if list_response.status_code == 200 and list_response.json()["cases"]:
            case_id = list_response.json()["cases"][0]["id"]
            
            response = requests.get(f"{BASE_URL}/api/cro/cases/{case_id}", headers=self.headers)
            assert response.status_code == 200
            
            data = response.json()
            assert "case" in data
            assert data["case"]["id"] == case_id
            assert "bids" in data
            assert "messages" in data
        else:
            pytest.skip("No cases available to test")


class TestCROEarnings:
    """CRO Earnings endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/cro/login", json={
            "email": CRO_TEST_EMAIL,
            "password": CRO_TEST_PASSWORD
        })
        if response.status_code == 200:
            self.token = response.json()["token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Could not authenticate CRO user")
    
    def test_get_earnings(self):
        """Test GET /api/cro/earnings returns earnings data"""
        response = requests.get(f"{BASE_URL}/api/cro/earnings", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "lifetime_earnings" in data
        assert "pending_payouts" in data
        assert "paid_count" in data
        assert "pending_count" in data
        assert "payouts" in data
        assert isinstance(data["payouts"], list)
        print(f"Earnings: Lifetime=${data['lifetime_earnings']}, Pending=${data['pending_payouts']}")


class TestCROMessages:
    """CRO Messages endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/cro/login", json={
            "email": CRO_TEST_EMAIL,
            "password": CRO_TEST_PASSWORD
        })
        if response.status_code == 200:
            self.token = response.json()["token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Could not authenticate CRO user")
    
    def test_get_message_threads(self):
        """Test GET /api/cro/messages returns message threads"""
        response = requests.get(f"{BASE_URL}/api/cro/messages", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "threads" in data
        assert isinstance(data["threads"], list)
        print(f"Message threads: {len(data['threads'])}")
    
    def test_get_unread_count(self):
        """Test GET /api/cro/unread-count returns unread message count"""
        response = requests.get(f"{BASE_URL}/api/cro/unread-count", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "unread" in data
        assert isinstance(data["unread"], int)


class TestCROSubscription:
    """CRO Subscription endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/cro/login", json={
            "email": CRO_TEST_EMAIL,
            "password": CRO_TEST_PASSWORD
        })
        if response.status_code == 200:
            self.token = response.json()["token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Could not authenticate CRO user")
    
    def test_get_subscription(self):
        """Test GET /api/cro/subscription returns subscription info"""
        response = requests.get(f"{BASE_URL}/api/cro/subscription", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "signup_fee_paid" in data
        assert "subscription_active" in data
        assert "monthly_fee" in data
        assert "signup_fee" in data
        
        # Verify fee amounts
        assert data["monthly_fee"] == 99.99
        assert data["signup_fee"] == 500.00
        print(f"Subscription: Active={data['subscription_active']}, Signup Paid={data['signup_fee_paid']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
