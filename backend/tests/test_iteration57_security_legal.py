"""
Iteration 57 - Security & Legal Features Testing
Tests for:
1. Forgot Password & Account Lockout APIs
2. Credit Reporting PIN Gate (6-digit PIN + Employee ID + 5-min session)
3. Lawsuit Response Center CMS
4. Pro Se Center
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# ==================== FIXTURES ====================

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture
def auth_token(api_client):
    """Get authentication token for admin user"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": "Admin@credlocity.com",
        "password": "Credit123!"
    })
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Authentication failed - skipping authenticated tests")

@pytest.fixture
def authenticated_client(api_client, auth_token):
    """Session with auth header"""
    api_client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return api_client

# ==================== FORGOT PASSWORD TESTS ====================

class TestForgotPassword:
    """Tests for forgot password and reset password flows"""

    def test_forgot_password_with_valid_email(self, api_client):
        """POST /api/security/forgot-password should return reset token (mocked email)"""
        response = api_client.post(f"{BASE_URL}/api/security/forgot-password", json={
            "email": "Admin@credlocity.com"
        })
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        # In dev mode, reset_token is returned directly
        assert "reset_token" in data
        assert len(data["reset_token"]) > 20  # Token should be substantial

    def test_forgot_password_with_nonexistent_email(self, api_client):
        """POST /api/security/forgot-password should not reveal if email doesn't exist"""
        response = api_client.post(f"{BASE_URL}/api/security/forgot-password", json={
            "email": "nonexistent@example.com"
        })
        assert response.status_code == 200
        data = response.json()
        # Should return same generic message for security
        assert "message" in data
        assert "If an account exists" in data["message"]

    def test_forgot_password_without_email(self, api_client):
        """POST /api/security/forgot-password should fail without email"""
        response = api_client.post(f"{BASE_URL}/api/security/forgot-password", json={})
        assert response.status_code == 400

    def test_reset_password_with_valid_token(self, api_client):
        """POST /api/security/reset-password should reset password with valid token"""
        # First get a reset token
        forgot_response = api_client.post(f"{BASE_URL}/api/security/forgot-password", json={
            "email": "Admin@credlocity.com"
        })
        assert forgot_response.status_code == 200
        reset_token = forgot_response.json().get("reset_token")
        
        # Reset password
        reset_response = api_client.post(f"{BASE_URL}/api/security/reset-password", json={
            "token": reset_token,
            "new_password": "Credit123!"  # Keep same password for testing
        })
        assert reset_response.status_code == 200
        data = reset_response.json()
        assert "message" in data
        assert "successfully" in data["message"].lower()

    def test_reset_password_with_invalid_token(self, api_client):
        """POST /api/security/reset-password should fail with invalid token"""
        response = api_client.post(f"{BASE_URL}/api/security/reset-password", json={
            "token": "invalid_token_12345",
            "new_password": "NewPassword123!"
        })
        assert response.status_code == 400

    def test_reset_password_with_short_password(self, api_client):
        """POST /api/security/reset-password should fail with password < 8 chars"""
        # Get token first
        forgot_response = api_client.post(f"{BASE_URL}/api/security/forgot-password", json={
            "email": "Admin@credlocity.com"
        })
        reset_token = forgot_response.json().get("reset_token")
        
        response = api_client.post(f"{BASE_URL}/api/security/reset-password", json={
            "token": reset_token,
            "new_password": "short"
        })
        assert response.status_code == 400

# ==================== ACCOUNT LOCKOUT TESTS ====================

class TestAccountLockout:
    """Tests for account lockout functionality"""

    def test_check_lockout_status(self, api_client):
        """POST /api/security/check-lockout should return locked status"""
        response = api_client.post(f"{BASE_URL}/api/security/check-lockout", json={
            "email": "Admin@credlocity.com"
        })
        assert response.status_code == 200
        data = response.json()
        assert "locked" in data
        assert isinstance(data["locked"], bool)

    def test_record_failed_login(self, api_client):
        """POST /api/security/record-failed-login should track attempts"""
        # Clear attempts first
        api_client.post(f"{BASE_URL}/api/security/clear-login-attempts", json={
            "email": "test_lockout@example.com"
        })
        
        response = api_client.post(f"{BASE_URL}/api/security/record-failed-login", json={
            "email": "test_lockout@example.com"
        })
        assert response.status_code == 200
        data = response.json()
        assert "locked" in data
        assert "attempts" in data
        assert data["attempts"] >= 1
        
        # Clean up
        api_client.post(f"{BASE_URL}/api/security/clear-login-attempts", json={
            "email": "test_lockout@example.com"
        })

    def test_lockout_after_5_failures(self, api_client):
        """POST /api/security/record-failed-login should lock after 5 failures"""
        test_email = f"test_lockout_{uuid.uuid4().hex[:8]}@example.com"
        
        # Record 5 failed attempts
        for i in range(5):
            response = api_client.post(f"{BASE_URL}/api/security/record-failed-login", json={
                "email": test_email
            })
            assert response.status_code == 200
        
        # Check that account is now locked
        data = response.json()
        assert data["locked"] == True
        assert "remaining_minutes" in data
        assert data["remaining_minutes"] > 0

    def test_clear_login_attempts(self, api_client):
        """POST /api/security/clear-login-attempts should clear lockout"""
        response = api_client.post(f"{BASE_URL}/api/security/clear-login-attempts", json={
            "email": "Admin@credlocity.com"
        })
        assert response.status_code == 200
        data = response.json()
        assert data.get("cleared") == True

# ==================== PIN GATE TESTS ====================

class TestPinGate:
    """Tests for Credit Reporting PIN Gate"""

    def test_get_pin_status(self, authenticated_client):
        """GET /api/security/pin-status should return PIN setup status"""
        response = authenticated_client.get(f"{BASE_URL}/api/security/pin-status")
        assert response.status_code == 200
        data = response.json()
        assert "has_pin" in data
        assert "has_employee_id" in data
        assert isinstance(data["has_pin"], bool)
        assert isinstance(data["has_employee_id"], bool)

    def test_set_pin_valid(self, authenticated_client):
        """POST /api/security/set-pin should save 6-digit PIN and employee ID"""
        response = authenticated_client.post(f"{BASE_URL}/api/security/set-pin", json={
            "pin": "123456",
            "employee_id": "EMP001"
        })
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "successfully" in data["message"].lower()

    def test_set_pin_invalid_length(self, authenticated_client):
        """POST /api/security/set-pin should fail with non-6-digit PIN"""
        response = authenticated_client.post(f"{BASE_URL}/api/security/set-pin", json={
            "pin": "1234",  # Only 4 digits
            "employee_id": "EMP001"
        })
        assert response.status_code == 400

    def test_set_pin_non_numeric(self, authenticated_client):
        """POST /api/security/set-pin should fail with non-numeric PIN"""
        response = authenticated_client.post(f"{BASE_URL}/api/security/set-pin", json={
            "pin": "12ab56",
            "employee_id": "EMP001"
        })
        assert response.status_code == 400

    def test_set_pin_without_employee_id(self, authenticated_client):
        """POST /api/security/set-pin should fail without employee ID"""
        response = authenticated_client.post(f"{BASE_URL}/api/security/set-pin", json={
            "pin": "123456"
        })
        assert response.status_code == 400

    def test_verify_pin_valid(self, authenticated_client):
        """POST /api/security/verify-pin should return session token"""
        # First set the PIN
        authenticated_client.post(f"{BASE_URL}/api/security/set-pin", json={
            "pin": "123456",
            "employee_id": "EMP001"
        })
        
        # Verify PIN
        response = authenticated_client.post(f"{BASE_URL}/api/security/verify-pin", json={
            "pin": "123456",
            "employee_id": "EMP001"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["verified"] == True
        assert "session_token" in data
        assert "expires_in_minutes" in data
        assert data["expires_in_minutes"] == 5  # 5-minute session

    def test_verify_pin_invalid(self, authenticated_client):
        """POST /api/security/verify-pin should fail with wrong PIN"""
        response = authenticated_client.post(f"{BASE_URL}/api/security/verify-pin", json={
            "pin": "999999",  # Wrong PIN
            "employee_id": "EMP001"
        })
        assert response.status_code == 401

    def test_verify_pin_wrong_employee_id(self, authenticated_client):
        """POST /api/security/verify-pin should fail with wrong employee ID"""
        response = authenticated_client.post(f"{BASE_URL}/api/security/verify-pin", json={
            "pin": "123456",
            "employee_id": "WRONG_ID"
        })
        assert response.status_code == 401

    def test_pin_status_unauthenticated(self, api_client):
        """GET /api/security/pin-status should fail without auth"""
        response = api_client.get(f"{BASE_URL}/api/security/pin-status")
        assert response.status_code == 401

# ==================== LAWSUIT RESPONSE CENTER TESTS ====================

class TestLawsuitResponseCenter:
    """Tests for Lawsuit Response Center CMS"""

    def test_get_dismissal_reasons(self, api_client):
        """GET /api/lawsuit-response/dismissal-reasons should return 30+ reasons"""
        response = api_client.get(f"{BASE_URL}/api/lawsuit-response/dismissal-reasons")
        assert response.status_code == 200
        data = response.json()
        assert "reasons" in data
        assert len(data["reasons"]) >= 30
        
        # Check structure
        first_reason = data["reasons"][0]
        assert "id" in first_reason
        assert "label" in first_reason
        assert "category" in first_reason
        assert "description" in first_reason
        
        # Verify common/uncommon categories
        categories = set(r["category"] for r in data["reasons"])
        assert "common" in categories
        assert "uncommon" in categories

    def test_get_violation_types(self, api_client):
        """GET /api/lawsuit-response/violation-types should return FCRA, FDCPA, etc."""
        response = api_client.get(f"{BASE_URL}/api/lawsuit-response/violation-types")
        assert response.status_code == 200
        data = response.json()
        assert "types" in data
        
        # Check expected violation types
        type_ids = [t["id"] for t in data["types"]]
        assert "fcra" in type_ids
        assert "fdcpa" in type_ids
        assert "croa" in type_ids
        assert "ucc" in type_ids

    def test_get_case_statuses(self, api_client):
        """GET /api/lawsuit-response/case-statuses should return status list"""
        response = api_client.get(f"{BASE_URL}/api/lawsuit-response/case-statuses")
        assert response.status_code == 200
        data = response.json()
        assert "statuses" in data
        assert "New" in data["statuses"]
        assert "Dismissed" in data["statuses"]

    def test_get_court_types(self, api_client):
        """GET /api/lawsuit-response/court-types should return court types"""
        response = api_client.get(f"{BASE_URL}/api/lawsuit-response/court-types")
        assert response.status_code == 200
        data = response.json()
        assert "types" in data
        assert "State Court" in data["types"]
        assert "Federal Court" in data["types"]

    def test_create_case(self, authenticated_client):
        """POST /api/lawsuit-response/cases should create a new case"""
        case_data = {
            "defendant_name": "TEST_John Consumer",
            "plaintiff_name": "TEST_LVNV Funding LLC",
            "case_number": f"TEST-2025-CV-{uuid.uuid4().hex[:5]}",
            "court_type": "State Court",
            "court_name": "Superior Court of New Jersey",
            "state": "New Jersey",
            "county": "Camden",
            "date_filed": "2025-01-15",
            "date_served": "2025-01-20",
            "answer_due_date": "2025-02-10",
            "dismissal_reasons": ["lack_personal_jurisdiction", "statute_of_limitations"],
            "status": "New",
            "plaintiff_attorney": "Collections Law Firm",
            "claim_amount": "5000.00",
            "original_creditor": "Bank of America"
        }
        
        response = authenticated_client.post(f"{BASE_URL}/api/lawsuit-response/cases", json=case_data)
        assert response.status_code == 200
        data = response.json()
        
        assert "id" in data
        assert data["defendant_name"] == case_data["defendant_name"]
        assert data["plaintiff_name"] == case_data["plaintiff_name"]
        assert data["status"] == "New"
        assert "lack_personal_jurisdiction" in data["dismissal_reasons"]
        
        return data["id"]

    def test_list_cases(self, authenticated_client):
        """GET /api/lawsuit-response/cases should list all cases"""
        response = authenticated_client.get(f"{BASE_URL}/api/lawsuit-response/cases")
        assert response.status_code == 200
        data = response.json()
        assert "cases" in data
        assert "total" in data
        assert isinstance(data["cases"], list)

    def test_add_note_to_case(self, authenticated_client):
        """POST /api/lawsuit-response/cases/{id}/notes should add a note"""
        # First create a case
        case_response = authenticated_client.post(f"{BASE_URL}/api/lawsuit-response/cases", json={
            "defendant_name": "TEST_Note Consumer",
            "plaintiff_name": "TEST_Debt Collector",
            "status": "New"
        })
        case_id = case_response.json()["id"]
        
        # Add note
        note_response = authenticated_client.post(
            f"{BASE_URL}/api/lawsuit-response/cases/{case_id}/notes",
            json={"content": "TEST: Initial case review completed. Recommend filing MTD."}
        )
        assert note_response.status_code == 200
        note_data = note_response.json()
        assert "id" in note_data
        assert "content" in note_data
        assert "author" in note_data
        assert "created_at" in note_data

    def test_add_filing_to_case(self, authenticated_client):
        """POST /api/lawsuit-response/cases/{id}/filings should add a filing"""
        # First create a case
        case_response = authenticated_client.post(f"{BASE_URL}/api/lawsuit-response/cases", json={
            "defendant_name": "TEST_Filing Consumer",
            "plaintiff_name": "TEST_Plaintiff LLC",
            "status": "New"
        })
        case_id = case_response.json()["id"]
        
        # Add filing
        filing_response = authenticated_client.post(
            f"{BASE_URL}/api/lawsuit-response/cases/{case_id}/filings",
            json={
                "title": "TEST Motion to Dismiss",
                "filing_type": "Motion to Dismiss",
                "date_filed": "2025-01-20",
                "description": "Filed MTD based on lack of personal jurisdiction"
            }
        )
        assert filing_response.status_code == 200
        filing_data = filing_response.json()
        assert "id" in filing_data
        assert filing_data["title"] == "TEST Motion to Dismiss"
        assert filing_data["filing_type"] == "Motion to Dismiss"

    def test_cases_require_authentication(self, api_client):
        """GET /api/lawsuit-response/cases should require authentication"""
        response = api_client.get(f"{BASE_URL}/api/lawsuit-response/cases")
        assert response.status_code == 401

# ==================== PRO SE CENTER TESTS ====================

class TestProSeCenter:
    """Tests for Pro Se Center"""

    def test_create_prose_case(self, authenticated_client):
        """POST /api/lawsuit-response/prose-cases should create a pro se case"""
        prose_data = {
            "client_name": "TEST_Jane Pro Se",
            "client_address": "123 Main Street",
            "client_city": "Camden",
            "client_state": "New Jersey",
            "client_zip": "08101",
            "client_phone": "(555) 123-4567",
            "client_email": "test_jane@example.com",
            "defendant_name": "TEST_Equifax Information Services",
            "defendant_address": "P.O. Box 740241, Atlanta, GA 30374",
            "defendant_type": "Credit Bureau (Equifax)",
            "violation_types": ["fcra", "fdcpa"],
            "court_type": "Federal Court",
            "court_district": "District of New Jersey",
            "filing_state": "New Jersey",
            "claim_description": "TEST: Defendant failed to correct inaccurate information despite multiple disputes.",
            "harm_description": "TEST: Denied mortgage due to inaccurate credit reporting.",
            "relief_requested": [
                "Statutory damages under FCRA ($100-$1,000 per violation)",
                "Actual damages for emotional distress",
                "Attorney fees and costs"
            ],
            "credit_bureaus_involved": ["Equifax"],
            "status": "Draft"
        }
        
        response = authenticated_client.post(f"{BASE_URL}/api/lawsuit-response/prose-cases", json=prose_data)
        assert response.status_code == 200
        data = response.json()
        
        assert "id" in data
        assert data["client_name"] == prose_data["client_name"]
        assert data["defendant_name"] == prose_data["defendant_name"]
        assert "fcra" in data["violation_types"]
        assert data["status"] == "Draft"

    def test_list_prose_cases(self, authenticated_client):
        """GET /api/lawsuit-response/prose-cases should list all pro se cases"""
        response = authenticated_client.get(f"{BASE_URL}/api/lawsuit-response/prose-cases")
        assert response.status_code == 200
        data = response.json()
        assert "cases" in data
        assert "total" in data
        assert isinstance(data["cases"], list)

    def test_prose_cases_require_authentication(self, api_client):
        """GET /api/lawsuit-response/prose-cases should require authentication"""
        response = api_client.get(f"{BASE_URL}/api/lawsuit-response/prose-cases")
        assert response.status_code == 401


# Test cleanup is handled manually - TEST_ prefixed data can be cleaned later
