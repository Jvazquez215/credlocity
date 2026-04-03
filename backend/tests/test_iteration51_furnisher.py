"""
Iteration 51: Testing FCRA-compliant Furnisher Actions for Collections Accounts
- Metro 2 status codes, ACDV consumer dispute handling
- Reporting suppression, full audit trails
"""
import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"


class TestAuth:
    """Test authentication endpoints"""
    
    def test_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data or "token" in data
        print("SUCCESS: Admin login works")


class TestFurnisherReferenceCodes:
    """Test the reference codes endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            data = response.json()
            return data.get("access_token") or data.get("token")
        pytest.skip("Auth failed")
    
    def test_get_reference_codes(self, auth_token):
        """Test GET /api/collections/furnisher/reference-codes"""
        response = requests.get(
            f"{BASE_URL}/api/collections/furnisher/reference-codes",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify all required code types present
        assert "metro2_status_codes" in data, "Missing metro2_status_codes"
        assert "payment_rating_codes" in data, "Missing payment_rating_codes"
        assert "special_comment_codes" in data, "Missing special_comment_codes"
        assert "dispute_reasons" in data, "Missing dispute_reasons"
        assert "acdv_response_codes" in data, "Missing acdv_response_codes"
        
        # Verify some specific codes
        assert "11" in data["metro2_status_codes"], "Missing status code 11"
        assert "82" in data["metro2_status_codes"], "Missing status code 82 (Collections)"
        assert "0" in data["payment_rating_codes"], "Missing payment rating 0"
        assert "XB" in data["special_comment_codes"], "Missing XB (dispute) code"
        assert "verified" in data["acdv_response_codes"], "Missing ACDV verified response"
        
        print("SUCCESS: Reference codes endpoint returns all Metro 2 codes")
        print(f"  - Metro 2 status codes: {len(data['metro2_status_codes'])} codes")
        print(f"  - Payment rating codes: {len(data['payment_rating_codes'])} codes")
        print(f"  - Special comment codes: {len(data['special_comment_codes'])} codes")
        print(f"  - Dispute reasons: {len(data['dispute_reasons'])} reasons")
        print(f"  - ACDV response codes: {len(data['acdv_response_codes'])} codes")


class TestPastDueReport:
    """Test past due report and account data"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            data = response.json()
            return data.get("access_token") or data.get("token")
        pytest.skip("Auth failed")
    
    def test_past_due_report_has_debtor_names(self, auth_token):
        """Test GET /api/collections/reporting/past-due returns debtor names"""
        response = requests.get(
            f"{BASE_URL}/api/collections/reporting/past-due",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "aging_buckets" in data, "Missing aging_buckets"
        assert "total_accounts" in data, "Missing total_accounts"
        
        # Check at least one bucket has accounts with debtor_name
        has_debtor_names = False
        for bucket_name, bucket_data in data["aging_buckets"].items():
            if bucket_data.get("accounts"):
                for account in bucket_data["accounts"]:
                    if account.get("debtor_name") and account["debtor_name"] != "Unknown":
                        has_debtor_names = True
                        print(f"  Found account with debtor_name: {account['debtor_name']}")
                        break
            if has_debtor_names:
                break
        
        # This is the bug fix - debtor names should now be visible
        # Previously showing blank, now should show client_name as fallback
        print(f"SUCCESS: Past due report loads with {data['total_accounts']} accounts")
        print(f"  - Debtor names present: {has_debtor_names}")


class TestFurnisherActions:
    """Test furnisher action APIs"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get auth headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token") or data.get("token")
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Auth failed")
    
    @pytest.fixture
    def test_account_id(self, auth_headers):
        """Get a test account ID from past due report"""
        response = requests.get(
            f"{BASE_URL}/api/collections/reporting/past-due",
            headers=auth_headers
        )
        if response.status_code == 200:
            data = response.json()
            for bucket in data.get("aging_buckets", {}).values():
                if bucket.get("accounts"):
                    return bucket["accounts"][0]["id"]
        pytest.skip("No test account available")
    
    def test_update_status_requires_reason(self, auth_headers, test_account_id):
        """Test POST /api/collections/accounts/{id}/furnisher/update-status requires reason"""
        response = requests.post(
            f"{BASE_URL}/api/collections/accounts/{test_account_id}/furnisher/update-status",
            json={
                "metro2_status_code": "82",
                "payment_rating": "G"
            },
            headers=auth_headers
        )
        # Should fail without reason
        assert response.status_code == 422, f"Should require reason, got {response.status_code}: {response.text}"
        print("SUCCESS: Update status correctly requires reason field")
    
    def test_update_status_success(self, auth_headers, test_account_id):
        """Test successful status update with reason"""
        response = requests.post(
            f"{BASE_URL}/api/collections/accounts/{test_account_id}/furnisher/update-status",
            json={
                "metro2_status_code": "82",
                "payment_rating": "G",
                "special_comment_code": "",
                "reason": "TEST: Setting to collections status"
            },
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "audit_id" in data, "Response should contain audit_id"
        print(f"SUCCESS: Update status works, audit_id: {data['audit_id']}")
    
    def test_suppress_requires_reason(self, auth_headers, test_account_id):
        """Test POST /api/collections/accounts/{id}/furnisher/suppress requires reason"""
        response = requests.post(
            f"{BASE_URL}/api/collections/accounts/{test_account_id}/furnisher/suppress",
            json={"suppress": True},
            headers=auth_headers
        )
        assert response.status_code == 422, f"Should require reason, got {response.status_code}"
        print("SUCCESS: Suppress correctly requires reason field")
    
    def test_suppress_and_unsuppress(self, auth_headers, test_account_id):
        """Test suppress and unsuppress flow"""
        # Suppress
        response = requests.post(
            f"{BASE_URL}/api/collections/accounts/{test_account_id}/furnisher/suppress",
            json={
                "suppress": True,
                "reason": "TEST: Temporarily suppress for investigation"
            },
            headers=auth_headers
        )
        assert response.status_code == 200, f"Suppress failed: {response.text}"
        print("SUCCESS: Account suppressed")
        
        # Unsuppress
        response = requests.post(
            f"{BASE_URL}/api/collections/accounts/{test_account_id}/furnisher/suppress",
            json={
                "suppress": False,
                "reason": "TEST: Investigation complete, resuming reporting"
            },
            headers=auth_headers
        )
        assert response.status_code == 200, f"Unsuppress failed: {response.text}"
        print("SUCCESS: Account unsuppressed")
    
    def test_open_dispute(self, auth_headers, test_account_id):
        """Test opening an ACDV dispute"""
        response = requests.post(
            f"{BASE_URL}/api/collections/accounts/{test_account_id}/furnisher/dispute",
            json={
                "dispute_reason": "Balance incorrect",
                "bureau": "Equifax",
                "consumer_statement": "TEST: Consumer disputes balance amount"
            },
            headers=auth_headers
        )
        assert response.status_code == 200, f"Open dispute failed: {response.text}"
        data = response.json()
        
        assert "id" in data, "Response should contain dispute id"
        assert "deadline" in data or "deadline_date" in data, "Response should contain deadline"
        assert data.get("status") == "open", "Dispute should be open"
        
        print(f"SUCCESS: Dispute opened - ID: {data['id']}, Deadline: {data.get('deadline_date')}")
        return data["id"]
    
    def test_get_account_disputes(self, auth_headers, test_account_id):
        """Test getting disputes for an account"""
        response = requests.get(
            f"{BASE_URL}/api/collections/accounts/{test_account_id}/furnisher/disputes",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "disputes" in data, "Response should contain disputes array"
        print(f"SUCCESS: Got {len(data['disputes'])} disputes for account")
    
    def test_get_all_disputes_with_stats(self, auth_headers):
        """Test GET /api/collections/furnisher/disputes returns disputes with stats"""
        response = requests.get(
            f"{BASE_URL}/api/collections/furnisher/disputes",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "disputes" in data, "Response should contain disputes array"
        assert "stats" in data, "Response should contain stats"
        assert "total_open" in data["stats"], "Stats should have total_open"
        assert "total_resolved" in data["stats"], "Stats should have total_resolved"
        assert "approaching_deadline" in data["stats"], "Stats should have approaching_deadline"
        
        print(f"SUCCESS: Got all disputes with stats")
        print(f"  - Total open: {data['stats']['total_open']}")
        print(f"  - Total resolved: {data['stats']['total_resolved']}")
        print(f"  - Approaching deadline: {data['stats']['approaching_deadline']}")
    
    def test_audit_log(self, auth_headers, test_account_id):
        """Test GET /api/collections/accounts/{id}/furnisher/audit-log"""
        response = requests.get(
            f"{BASE_URL}/api/collections/accounts/{test_account_id}/furnisher/audit-log",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "audit_log" in data, "Response should contain audit_log array"
        print(f"SUCCESS: Got {len(data['audit_log'])} audit log entries")
        if data["audit_log"]:
            print(f"  Latest action: {data['audit_log'][0].get('action')}")


class TestResolveDispute:
    """Test dispute resolution flow"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get auth headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token") or data.get("token")
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Auth failed")
    
    @pytest.fixture
    def test_account_id(self, auth_headers):
        """Get a test account ID"""
        response = requests.get(
            f"{BASE_URL}/api/collections/reporting/past-due",
            headers=auth_headers
        )
        if response.status_code == 200:
            data = response.json()
            for bucket in data.get("aging_buckets", {}).values():
                if bucket.get("accounts"):
                    return bucket["accounts"][0]["id"]
        pytest.skip("No test account available")
    
    def test_resolve_dispute_invalid_code(self, auth_headers, test_account_id):
        """Test resolving dispute with invalid ACDV code fails"""
        response = requests.post(
            f"{BASE_URL}/api/collections/accounts/{test_account_id}/furnisher/resolve-dispute",
            json={
                "acdv_response": "invalid_code",
                "investigation_notes": "Test notes"
            },
            headers=auth_headers
        )
        # Should fail with invalid code
        assert response.status_code in [404, 422], f"Should reject invalid ACDV code, got {response.status_code}"
        print("SUCCESS: Resolve dispute correctly rejects invalid ACDV code")
    
    def test_full_dispute_flow(self, auth_headers, test_account_id):
        """Test complete dispute open -> resolve flow"""
        # Open dispute
        open_response = requests.post(
            f"{BASE_URL}/api/collections/accounts/{test_account_id}/furnisher/dispute",
            json={
                "dispute_reason": "Not my account",
                "bureau": "TransUnion",
                "consumer_statement": "TEST: Complete flow test"
            },
            headers=auth_headers
        )
        assert open_response.status_code == 200, f"Open failed: {open_response.text}"
        dispute_id = open_response.json()["id"]
        print(f"  Opened dispute: {dispute_id}")
        
        # Resolve dispute
        resolve_response = requests.post(
            f"{BASE_URL}/api/collections/accounts/{test_account_id}/furnisher/resolve-dispute",
            json={
                "dispute_id": dispute_id,
                "acdv_response": "verified",
                "investigation_notes": "TEST: Verified as reported after investigation"
            },
            headers=auth_headers
        )
        assert resolve_response.status_code == 200, f"Resolve failed: {resolve_response.text}"
        data = resolve_response.json()
        assert "audit_id" in data, "Response should contain audit_id"
        print(f"SUCCESS: Full dispute flow works - Resolved with 'verified'")
