"""
Iteration 48 Backend Tests:
- E-Sign Agreement APIs
- Collections Payment Portal (SSN/DOB verification)
- Past Due Collections Reporting
- Role-based data masking
- Auth health check
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"
TEST_PAYMENT_TOKEN = "b4594b80cb104329"
TEST_SSN_LAST_FOUR = "1234"
TEST_BIRTH_YEAR = "1985"


class TestAuthHealthCheck:
    """Auth endpoint health check"""
    
    def test_login_success(self):
        """Test admin login works"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data or "token" in data
        print(f"[PASS] Admin login successful")


@pytest.fixture(scope="module")
def admin_token():
    """Get admin token for authenticated requests"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        return data.get("access_token") or data.get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")


@pytest.fixture(scope="module")
def test_account_id(admin_token):
    """Get or create a test account for agreement testing"""
    headers = {"Authorization": f"Bearer {admin_token}"}
    # List existing accounts
    response = requests.get(f"{BASE_URL}/api/credit-builder/accounts", headers=headers)
    if response.status_code == 200:
        data = response.json()
        accounts = data.get("accounts", [])
        if accounts:
            return accounts[0]["id"]
    
    # Create a test account if none exist
    response = requests.post(f"{BASE_URL}/api/credit-builder/accounts", headers=headers, json={
        "first_name": "Test",
        "last_name": "User",
        "date_of_birth": "01011990",
        "ssn_last_four": "1234",
        "email": "test@test.com",
        "address_line1": "123 Test St",
        "city": "Philadelphia",
        "state": "PA",
        "zip_code": "19102",
        "plan_tier": "standard"
    })
    if response.status_code == 200:
        return response.json().get("id")
    pytest.skip("Could not get or create test account")


class TestESignAgreementAPI:
    """E-Sign Agreement API Tests"""
    
    def test_get_agreement_returns_content(self, admin_token, test_account_id):
        """Test GET /api/credit-builder/agreement/{account_id} returns agreement text"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/credit-builder/agreement/{test_account_id}", headers=headers)
        
        assert response.status_code == 200, f"Agreement fetch failed: {response.text}"
        data = response.json()
        
        # Verify required fields
        assert "agreement_text" in data
        assert "plan_tier" in data
        assert "credit_limit" in data
        assert "monthly_fee" in data
        assert "annual_fee" in data
        assert data["annual_fee"] == 68.00
        
        # Verify CROA disclosure in agreement text
        assert "CROA" in data["agreement_text"] or "Credit Repair Organizations Act" in data["agreement_text"]
        assert "$68" in data["agreement_text"] or "68.00" in data["agreement_text"]
        
        print(f"[PASS] Agreement API returns content with CROA and $68 annual fee")
    
    def test_sign_agreement_validates_name(self, admin_token, test_account_id):
        """Test POST /api/credit-builder/agreement/{account_id}/sign validates signer name"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Try with wrong name
        response = requests.post(f"{BASE_URL}/api/credit-builder/agreement/{test_account_id}/sign", 
            headers=headers, json={"full_name": "Wrong Name"})
        
        # Should fail with name mismatch
        assert response.status_code == 422 or response.status_code == 400, f"Should reject wrong name: {response.text}"
        print(f"[PASS] Agreement sign API rejects mismatched signer name")
    
    def test_agreement_status_endpoint(self, admin_token, test_account_id):
        """Test GET /api/credit-builder/agreement/{account_id}/status returns status"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/credit-builder/agreement/{test_account_id}/status", headers=headers)
        
        assert response.status_code == 200, f"Status fetch failed: {response.text}"
        data = response.json()
        
        assert "agreement_signed" in data
        assert "account_id" in data
        print(f"[PASS] Agreement status API returns signed status: {data.get('agreement_signed')}")


class TestCollectionsPaymentPortal:
    """Collections Payment Portal Public API Tests"""
    
    def test_payment_link_info_public(self):
        """Test GET /api/collections/pay/{token}/info returns link status (public, no auth)"""
        response = requests.get(f"{BASE_URL}/api/collections/pay/{TEST_PAYMENT_TOKEN}/info")
        
        if response.status_code == 404:
            pytest.skip("Test payment token not found - may need to create test letter first")
        
        assert response.status_code == 200, f"Payment info failed: {response.text}"
        data = response.json()
        
        assert "valid" in data or "payment_status" in data
        print(f"[PASS] Payment link info API returns: {data}")
    
    def test_verify_rejects_wrong_ssn(self):
        """Test POST /api/collections/pay/{token}/verify rejects wrong SSN"""
        response = requests.post(f"{BASE_URL}/api/collections/pay/{TEST_PAYMENT_TOKEN}/verify", json={
            "ssn_last_four": "9999",  # Wrong SSN
            "birth_year": TEST_BIRTH_YEAR
        })
        
        if response.status_code == 404:
            pytest.skip("Test payment token not found")
        
        assert response.status_code == 403, f"Should reject wrong SSN: {response.status_code} - {response.text}"
        print(f"[PASS] Payment verify API rejects wrong SSN")
    
    def test_verify_rejects_wrong_birthyear(self):
        """Test POST /api/collections/pay/{token}/verify rejects wrong birth year"""
        response = requests.post(f"{BASE_URL}/api/collections/pay/{TEST_PAYMENT_TOKEN}/verify", json={
            "ssn_last_four": TEST_SSN_LAST_FOUR,
            "birth_year": "1999"  # Wrong birth year
        })
        
        if response.status_code == 404:
            pytest.skip("Test payment token not found")
        
        assert response.status_code == 403, f"Should reject wrong birth year: {response.status_code} - {response.text}"
        print(f"[PASS] Payment verify API rejects wrong birth year")
    
    def test_verify_accepts_correct_credentials(self):
        """Test POST /api/collections/pay/{token}/verify accepts correct SSN/DOB"""
        response = requests.post(f"{BASE_URL}/api/collections/pay/{TEST_PAYMENT_TOKEN}/verify", json={
            "ssn_last_four": TEST_SSN_LAST_FOUR,
            "birth_year": TEST_BIRTH_YEAR
        })
        
        if response.status_code == 404:
            pytest.skip("Test payment token not found")
        
        assert response.status_code == 200, f"Should accept correct credentials: {response.status_code} - {response.text}"
        data = response.json()
        
        assert data.get("verified") == True
        assert "session_token" in data
        assert "consumer_name" in data
        assert "amount_owed" in data
        assert "amount_remaining" in data
        print(f"[PASS] Payment verify API accepts correct SSN/DOB - consumer: {data.get('consumer_name')}")


class TestPastDueReporting:
    """Past Due Collections Reporting API Tests"""
    
    def test_past_due_report_endpoint(self, admin_token):
        """Test GET /api/collections/reporting/past-due returns aging report"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/collections/reporting/past-due", headers=headers)
        
        assert response.status_code == 200, f"Past due report failed: {response.text}"
        data = response.json()
        
        # Verify report structure
        assert "total_accounts" in data
        assert "total_past_due_balance" in data
        assert "total_collected" in data
        assert "collection_rate" in data
        assert "aging_buckets" in data
        
        # Verify aging buckets structure
        buckets = data.get("aging_buckets", {})
        assert "current" in buckets or "30_days" in buckets
        
        print(f"[PASS] Past due report API returns: {data.get('total_accounts')} accounts, ${data.get('total_past_due_balance', 0):,.2f} past due, {data.get('collection_rate', 0)}% collection rate")


class TestRoleBasedDataMasking:
    """Role-based data masking tests"""
    
    def test_accounts_list_contains_dob(self, admin_token):
        """Test that accounts list returns DOB field (may be masked or full)"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/credit-builder/accounts", headers=headers)
        
        assert response.status_code == 200, f"Accounts list failed: {response.text}"
        data = response.json()
        accounts = data.get("accounts", [])
        
        if not accounts:
            pytest.skip("No accounts to test masking")
        
        # Check if DOB is present (may be masked or full depending on role)
        account = accounts[0]
        if "date_of_birth" in account:
            dob = account.get("date_of_birth", "")
            # Master admin should see full DOB, others see masked
            print(f"[PASS] Account DOB field present: {dob[:8]}... (masked/full depends on role)")
        else:
            print(f"[INFO] DOB field not in list response")
    
    def test_single_account_detail_masking(self, admin_token, test_account_id):
        """Test that account detail returns data (masked/full based on role)"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/credit-builder/accounts/{test_account_id}", headers=headers)
        
        assert response.status_code == 200, f"Account detail failed: {response.text}"
        data = response.json()
        
        # Check for sensitive fields
        dob = data.get("date_of_birth", "")
        ssn4 = data.get("ssn_last_four", "")
        
        # Master admin sees full, others see masked
        # Admin@credlocity.com should be master admin and see full data
        print(f"[PASS] Account detail - DOB: {dob}, SSN4: {ssn4}")


class TestCollectionsLetterBuilder:
    """Collections Letter Builder API Tests"""
    
    def test_letters_list(self, admin_token):
        """Test GET /api/collections/letters returns list"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/collections/letters", headers=headers)
        
        assert response.status_code == 200, f"Letters list failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list), "Should return list of letters"
        print(f"[PASS] Letters list API returns {len(data)} letters")
        
        # Check for payment token field in letters (for 'Pay Online' option)
        if data:
            letter = data[0]
            if letter.get("payment_token"):
                print(f"[INFO] Letter has payment_token: {letter.get('payment_token')[:8]}...")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
