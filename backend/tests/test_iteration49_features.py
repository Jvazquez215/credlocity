"""
Iteration 49 Tests - Credit Builder Platform New Features

Features tested:
1. Credit Builder Signup: Public endpoint at POST /api/credit-builder/signup
2. QR Code Generation: GET /api/collections/letters/{id}/qr-data returns base64 QR
3. Send to Collections: POST /api/credit-builder/accounts/{id}/send-to-collections
4. Fix Reporting (CB): POST /api/credit-builder/accounts/{id}/fix-reporting
5. Fix Reporting (Collections): POST /api/collections/accounts/{id}/fix-reporting
6. Past Due Reporting: GET /api/collections/reporting/past-due
"""

import pytest
import requests
import os
import uuid
import time

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://rep-dashboard-11.preview.emergentagent.com")

# Test credentials
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"
TEST_LETTER_ID = "2a9f9420-a370-46f5-8add-45bf27480868"


class TestAuth:
    """Authentication tests for admin access"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "No access_token in response"
        return data["access_token"]
    
    def test_admin_login(self, admin_token):
        """Verify admin login works"""
        assert admin_token is not None
        assert len(admin_token) > 0
        print(f"Admin login successful, token length: {len(admin_token)}")


class TestCreditBuilderSignup:
    """Test public credit builder signup endpoint"""
    
    @pytest.fixture(scope="class")
    def unique_email(self):
        """Generate unique email for signup test"""
        return f"test_{uuid.uuid4().hex[:8]}@testcreditbuilder.com"
    
    def test_signup_requires_all_fields(self):
        """Signup should reject requests missing required fields"""
        incomplete_data = {
            "first_name": "Test",
            "last_name": "User"
            # Missing other required fields
        }
        response = requests.post(f"{BASE_URL}/api/credit-builder/signup", json=incomplete_data)
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print("Signup correctly rejects incomplete data")
    
    def test_signup_validates_ssn_format(self):
        """Signup should validate SSN format (9 digits)"""
        data = {
            "first_name": "Test",
            "last_name": "User",
            "email": "test_invalid_ssn@test.com",
            "phone": "2155550100",
            "date_of_birth": "01151990",
            "ssn_last_four": "1234",
            "full_ssn": "123",  # Invalid - too short
            "address_line1": "123 Test St",
            "city": "Philadelphia",
            "state": "PA",
            "zip_code": "19102",
            "plan_tier": "standard",
            "password": "TestPass123!"
        }
        response = requests.post(f"{BASE_URL}/api/credit-builder/signup", json=data)
        assert response.status_code == 422, f"Expected 422 for invalid SSN, got {response.status_code}"
        assert "SSN" in response.json().get("detail", "") or "ssn" in response.json().get("detail", "").lower()
        print("Signup correctly validates SSN format")
    
    def test_signup_creates_account_successfully(self, unique_email):
        """Complete signup should create account"""
        data = {
            "first_name": "Test",
            "last_name": "SignupUser",
            "middle_name": "",
            "email": unique_email,
            "phone": "2155550100",
            "date_of_birth": "01151990",
            "ssn_last_four": "5678",
            "full_ssn": "123-45-5678",
            "address_line1": "123 Test Street",
            "address_line2": "",
            "city": "Philadelphia",
            "state": "PA",
            "zip_code": "19102",
            "plan_tier": "standard",
            "password": "TestPassword123!"
        }
        response = requests.post(f"{BASE_URL}/api/credit-builder/signup", json=data)
        assert response.status_code == 200, f"Signup failed: {response.text}"
        result = response.json()
        assert "account_number" in result, "Response missing account_number"
        assert result["email"] == unique_email, "Email mismatch"
        assert result["plan_tier"] == "standard", "Plan tier mismatch"
        assert result["credit_limit"] == 1500, f"Expected 1500 credit limit for standard, got {result.get('credit_limit')}"
        print(f"Signup successful - Account: {result['account_number']}, Credit Limit: ${result['credit_limit']}")
        return result
    
    def test_signup_rejects_duplicate_email(self, unique_email):
        """Signup should reject duplicate email"""
        # First create an account
        data = {
            "first_name": "Test",
            "last_name": "DuplicateTest",
            "email": f"dup_{unique_email}",
            "phone": "2155550100",
            "date_of_birth": "01151990",
            "ssn_last_four": "9999",
            "full_ssn": "999-99-9999",
            "address_line1": "123 Test St",
            "city": "Philadelphia",
            "state": "PA",
            "zip_code": "19102",
            "plan_tier": "starter",
            "password": "TestPassword123!"
        }
        response1 = requests.post(f"{BASE_URL}/api/credit-builder/signup", json=data)
        if response1.status_code == 200:
            # Try to create again with same email
            response2 = requests.post(f"{BASE_URL}/api/credit-builder/signup", json=data)
            assert response2.status_code == 409, f"Expected 409 for duplicate, got {response2.status_code}"
            print("Signup correctly rejects duplicate email")
        else:
            pytest.skip("First signup failed, cannot test duplicate rejection")


class TestQRCodeGeneration:
    """Test QR code generation for collection letters"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        return response.json().get("access_token")
    
    def test_qr_data_endpoint_returns_base64(self, admin_token):
        """QR data endpoint should return base64 image"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(
            f"{BASE_URL}/api/collections/letters/{TEST_LETTER_ID}/qr-data",
            headers=headers
        )
        # Letter may or may not exist, check for proper response
        if response.status_code == 200:
            data = response.json()
            assert "qr_data_url" in data, "Response missing qr_data_url"
            assert data["qr_data_url"].startswith("data:image/png;base64,"), "QR data not in base64 format"
            assert "payment_url" in data, "Response missing payment_url"
            assert "/pay/" in data["payment_url"], "Payment URL doesn't contain /pay/"
            print(f"QR code data returned successfully, payment URL: {data['payment_url']}")
        elif response.status_code == 404:
            print(f"Test letter {TEST_LETTER_ID} not found - testing with existing letter")
            # Try to get any letter to test the endpoint
            list_response = requests.get(f"{BASE_URL}/api/collections/letters", headers=headers)
            if list_response.status_code == 200:
                letters = list_response.json()
                if isinstance(letters, list) and len(letters) > 0:
                    test_letter = letters[0]
                    if test_letter.get("payment_token"):
                        qr_response = requests.get(
                            f"{BASE_URL}/api/collections/letters/{test_letter['id']}/qr-data",
                            headers=headers
                        )
                        if qr_response.status_code == 200:
                            qr_data = qr_response.json()
                            assert "qr_data_url" in qr_data
                            assert qr_data["qr_data_url"].startswith("data:image/png;base64,")
                            print(f"QR code tested with letter {test_letter['id']}")
        else:
            pytest.fail(f"Unexpected response: {response.status_code} - {response.text}")


class TestSendToCollections:
    """Test sending credit builder account to collections"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        return response.json().get("access_token")
    
    @pytest.fixture(scope="class")
    def test_cb_account(self, admin_token):
        """Create a test credit builder account for collections transfer"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        account_data = {
            "first_name": "Collections",
            "last_name": "TestAccount",
            "email": f"collections_test_{uuid.uuid4().hex[:6]}@test.com",
            "phone": "2155550100",
            "date_of_birth": "01011985",
            "ssn_last_four": "4321",
            "address_line1": "456 Collections Ave",
            "city": "Philadelphia",
            "state": "PA",
            "zip_code": "19103",
            "plan_tier": "starter"
        }
        response = requests.post(
            f"{BASE_URL}/api/credit-builder/accounts",
            json=account_data,
            headers=headers
        )
        if response.status_code == 200:
            return response.json()
        return None
    
    def test_send_to_collections_creates_collections_account(self, admin_token, test_cb_account):
        """Sending to collections should create a collections account"""
        if not test_cb_account:
            pytest.skip("Test CB account not created")
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.post(
            f"{BASE_URL}/api/credit-builder/accounts/{test_cb_account['id']}/send-to-collections",
            json={"notes": "Test transfer to collections"},
            headers=headers
        )
        assert response.status_code == 200, f"Send to collections failed: {response.text}"
        result = response.json()
        assert "collections_account_id" in result, "Response missing collections_account_id"
        assert "credit_builder_account_id" in result, "Response missing credit_builder_account_id"
        print(f"Account sent to collections: {result['collections_account_id']}")
        
        # Verify CB account status updated to 97
        cb_response = requests.get(
            f"{BASE_URL}/api/credit-builder/accounts/{test_cb_account['id']}",
            headers=headers
        )
        if cb_response.status_code == 200:
            cb_account = cb_response.json()
            assert cb_account.get("account_status_code") == "97", f"Expected status 97, got {cb_account.get('account_status_code')}"
            print("CB account status correctly updated to 97 (sent to collections)")


class TestFixReportingCB:
    """Test fix reporting for credit builder accounts"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        return response.json().get("access_token")
    
    @pytest.fixture(scope="class")
    def test_cb_account_for_fix(self, admin_token):
        """Get or create a test CB account for fix reporting test"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        # Get existing accounts
        response = requests.get(f"{BASE_URL}/api/credit-builder/accounts", headers=headers)
        if response.status_code == 200:
            data = response.json()
            accounts = data.get("accounts", [])
            if accounts:
                return accounts[0]
        return None
    
    def test_fix_reporting_requires_reason(self, admin_token, test_cb_account_for_fix):
        """Fix reporting should require a reason"""
        if not test_cb_account_for_fix:
            pytest.skip("No CB account available for testing")
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.post(
            f"{BASE_URL}/api/credit-builder/accounts/{test_cb_account_for_fix['id']}/fix-reporting",
            json={"corrections": {"payment_rating": "1"}},  # Missing reason
            headers=headers
        )
        assert response.status_code == 422, f"Expected 422 for missing reason, got {response.status_code}"
        print("Fix reporting correctly requires reason")
    
    def test_fix_reporting_creates_correction_log(self, admin_token, test_cb_account_for_fix):
        """Fix reporting should create a correction log"""
        if not test_cb_account_for_fix:
            pytest.skip("No CB account available for testing")
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.post(
            f"{BASE_URL}/api/credit-builder/accounts/{test_cb_account_for_fix['id']}/fix-reporting",
            json={
                "corrections": {"payment_rating": "1"},
                "reason": "Test correction for iteration 49"
            },
            headers=headers
        )
        assert response.status_code == 200, f"Fix reporting failed: {response.text}"
        result = response.json()
        assert "correction_id" in result, "Response missing correction_id"
        assert "corrected_fields" in result, "Response missing corrected_fields"
        print(f"Fix reporting successful, correction ID: {result['correction_id']}")


class TestFixReportingCollections:
    """Test fix reporting for collections accounts"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        return response.json().get("access_token")
    
    @pytest.fixture(scope="class")
    def test_collections_account(self, admin_token):
        """Get an existing collections account for testing"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/collections/accounts", headers=headers)
        if response.status_code == 200:
            data = response.json()
            accounts = data.get("accounts", [])
            if accounts:
                return accounts[0]
        return None
    
    def test_fix_collections_reporting(self, admin_token, test_collections_account):
        """Fix collections reporting should work for admin"""
        if not test_collections_account:
            pytest.skip("No collections account available for testing")
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.post(
            f"{BASE_URL}/api/collections/accounts/{test_collections_account['id']}/fix-reporting",
            json={
                "corrections": {"notes": "Updated via fix-reporting test"},
                "reason": "Test correction for iteration 49 collections"
            },
            headers=headers
        )
        assert response.status_code == 200, f"Collections fix reporting failed: {response.text}"
        result = response.json()
        assert "correction_id" in result, "Response missing correction_id"
        print(f"Collections fix reporting successful, correction ID: {result['correction_id']}")


class TestPastDueReporting:
    """Test past due collections reporting"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        return response.json().get("access_token")
    
    def test_past_due_report_returns_data(self, admin_token):
        """Past due report should return aging buckets and stats"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(
            f"{BASE_URL}/api/collections/reporting/past-due",
            headers=headers
        )
        assert response.status_code == 200, f"Past due report failed: {response.text}"
        data = response.json()
        
        # Verify required fields
        assert "total_accounts" in data, "Missing total_accounts"
        assert "total_past_due_balance" in data, "Missing total_past_due_balance"
        assert "total_collected" in data, "Missing total_collected"
        assert "collection_rate" in data, "Missing collection_rate"
        assert "aging_buckets" in data, "Missing aging_buckets"
        
        # Verify aging buckets structure
        buckets = data["aging_buckets"]
        assert "current" in buckets, "Missing 'current' bucket"
        assert "30_days" in buckets, "Missing '30_days' bucket"
        assert "60_days" in buckets, "Missing '60_days' bucket"
        assert "90_days" in buckets, "Missing '90_days' bucket"
        assert "120_plus" in buckets, "Missing '120_plus' bucket"
        
        # Verify bucket structure
        for bucket_name, bucket_data in buckets.items():
            assert "count" in bucket_data, f"Missing 'count' in {bucket_name}"
            assert "total_balance" in bucket_data, f"Missing 'total_balance' in {bucket_name}"
            assert "accounts" in bucket_data, f"Missing 'accounts' in {bucket_name}"
        
        print(f"Past due report: {data['total_accounts']} accounts, ${data['total_past_due_balance']} past due")
        print(f"Collection rate: {data['collection_rate']}%")
        
        # Verify by_rep and by_status
        assert "by_rep" in data, "Missing by_rep breakdown"
        assert "by_status" in data, "Missing by_status breakdown"


class TestSignupModalFields:
    """Test that signup modal has all required fields (integration test)"""
    
    def test_signup_endpoint_accepts_all_fields(self):
        """Verify signup endpoint accepts all required fields"""
        # Create a complete signup payload with all fields
        complete_data = {
            "first_name": "Complete",
            "last_name": "FieldTest",
            "middle_name": "M",
            "email": f"complete_test_{uuid.uuid4().hex[:8]}@test.com",
            "phone": "(215) 555-0100",
            "date_of_birth": "03151985",  # MMDDYYYY format
            "ssn_last_four": "9876",
            "full_ssn": "987-65-9876",
            "address_line1": "789 Complete St",
            "address_line2": "Apt 2B",
            "city": "Philadelphia",
            "state": "PA",
            "zip_code": "19104",
            "plan_tier": "premium",
            "password": "CompleteTest123!"
        }
        
        response = requests.post(f"{BASE_URL}/api/credit-builder/signup", json=complete_data)
        
        # Should succeed
        assert response.status_code == 200, f"Signup with complete fields failed: {response.text}"
        result = response.json()
        
        # Verify response
        assert result["plan_tier"] == "premium", "Plan tier mismatch"
        assert result["credit_limit"] == 2500, f"Expected 2500 for premium, got {result['credit_limit']}"
        print(f"Complete signup successful: Account {result['account_number']}, ${result['credit_limit']} limit")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
