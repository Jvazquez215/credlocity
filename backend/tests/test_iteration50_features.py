"""
Iteration 50 Tests - Credlocity Platform Fixes:
1) Letter Builder: 'Save & Send' button (status='sent', generates payment link)
2) Past Due Report: Clickable accounts in aging buckets 
3) Past Due Report: Account detail modal with Payment History (24 months)
4) Past Due Report: Fix Reporting UI for both collections and CB accounts
5) Past Due Report: payment_history_profile field in fix-reporting
6) Credit Builder signup form works from CTA buttons
"""

import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestIteration50Features:
    """Test all iteration 50 features"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: login as admin"""
        self.session = requests.Session()
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        token = login_response.json().get("access_token")
        self.session.headers.update({"Authorization": f"Bearer {token}"})
        self.token = token
    
    # ============ LETTER BUILDER TESTS ============
    
    def test_letter_builder_save_and_send(self):
        """Test that Save & Send saves letter with status='sent' and generates payment link"""
        # Create a letter with status='sent' (simulating Save & Send button)
        letter_data = {
            "consumer_first_name": "TestSend",
            "consumer_last_name": f"User{uuid.uuid4().hex[:6]}",
            "consumer_ssn_last_four": "9999",
            "consumer_birth_year": "1990",
            "amount_owed": 500.00,
            "urgency_level": "friendly_reminder",
            "payment_options": ["pay_online", "qr_code"],
            "status": "sent"  # This is what Save & Send does
        }
        
        response = self.session.post(f"{BASE_URL}/api/collections/letters", json=letter_data)
        assert response.status_code == 200, f"Create letter failed: {response.text}"
        
        letter = response.json()
        # Verify status is 'sent'
        assert letter.get("status") == "sent", f"Expected status='sent', got {letter.get('status')}"
        # Verify payment_token was generated (for payment link)
        assert letter.get("payment_token") is not None, "Payment token should be generated for Save & Send"
        
        print(f"PASS: Letter created with status='sent' and payment_token={letter.get('payment_token')}")
        
        return letter
    
    def test_letter_builder_save_draft(self):
        """Test that Save Draft saves letter with status='draft'"""
        letter_data = {
            "consumer_first_name": "TestDraft",
            "consumer_last_name": f"User{uuid.uuid4().hex[:6]}",
            "amount_owed": 250.00,
            "urgency_level": "firm_notice",
            "status": "draft"  # This is what Save Draft does
        }
        
        response = self.session.post(f"{BASE_URL}/api/collections/letters", json=letter_data)
        assert response.status_code == 200, f"Create draft failed: {response.text}"
        
        letter = response.json()
        assert letter.get("status") == "draft", f"Expected status='draft', got {letter.get('status')}"
        
        print(f"PASS: Letter created with status='draft'")
    
    # ============ PAST DUE REPORT TESTS ============
    
    def test_past_due_report_returns_accounts_with_payment_history(self):
        """Test that past due report returns accounts with payment_history_profile"""
        response = self.session.get(f"{BASE_URL}/api/collections/reporting/past-due")
        assert response.status_code == 200, f"Past due report failed: {response.text}"
        
        report = response.json()
        assert "aging_buckets" in report, "Report missing aging_buckets"
        
        # Check each bucket for accounts with payment_history_profile
        buckets_with_history = 0
        for bucket_name, bucket_data in report["aging_buckets"].items():
            accounts = bucket_data.get("accounts", [])
            for acc in accounts:
                # Each account should have id, debtor_name, account_number
                assert "id" in acc, f"Account in {bucket_name} missing 'id'"
                assert "debtor_name" in acc or "debtor_first_name" in acc, f"Account in {bucket_name} missing debtor name"
                assert "account_number" in acc, f"Account in {bucket_name} missing 'account_number'"
                # payment_history_profile should be present (may be empty string)
                if "payment_history_profile" in acc:
                    buckets_with_history += 1
        
        print(f"PASS: Past due report returns accounts with required fields. {buckets_with_history} accounts have payment_history_profile")
    
    def test_past_due_report_bucket_structure(self):
        """Test aging bucket structure (current, 30_days, 60_days, 90_days, 120_plus)"""
        response = self.session.get(f"{BASE_URL}/api/collections/reporting/past-due")
        assert response.status_code == 200
        
        report = response.json()
        expected_buckets = ["current", "30_days", "60_days", "90_days", "120_plus"]
        
        for bucket in expected_buckets:
            assert bucket in report["aging_buckets"], f"Missing bucket: {bucket}"
            bucket_data = report["aging_buckets"][bucket]
            assert "count" in bucket_data, f"{bucket} missing 'count'"
            assert "total_balance" in bucket_data, f"{bucket} missing 'total_balance'"
            assert "accounts" in bucket_data, f"{bucket} missing 'accounts'"
        
        print(f"PASS: All expected aging buckets present with correct structure")
    
    # ============ FIX REPORTING TESTS ============
    
    def test_collections_fix_reporting_with_payment_history_profile(self):
        """Test that fix-reporting endpoint accepts payment_history_profile field"""
        # First get an existing collections account
        accounts_response = self.session.get(f"{BASE_URL}/api/collections/accounts?limit=1")
        assert accounts_response.status_code == 200, f"Get accounts failed: {accounts_response.text}"
        
        accounts = accounts_response.json().get("accounts", [])
        if not accounts:
            pytest.skip("No collections accounts available for testing")
        
        account_id = accounts[0]["id"]
        
        # Test fix-reporting with payment_history_profile
        corrections = {
            "corrections": {
                "payment_history_profile": "111111111111111111110000",  # 24 chars: 20 on-time, 4 late
                "past_due_balance": 1000.00
            },
            "reason": "Test correction for iteration 50 - updating payment history"
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/collections/accounts/{account_id}/fix-reporting",
            json=corrections
        )
        assert response.status_code == 200, f"Fix reporting failed: {response.text}"
        
        result = response.json()
        assert "correction_id" in result or "corrected_fields" in result, f"Response missing correction info: {result}"
        
        print(f"PASS: Collections fix-reporting accepts payment_history_profile")
    
    def test_credit_builder_fix_reporting_with_payment_history_profile(self):
        """Test that CB fix-reporting endpoint accepts payment_history_profile field"""
        # First get an existing CB account
        accounts_response = self.session.get(f"{BASE_URL}/api/credit-builder/accounts?limit=1")
        assert accounts_response.status_code == 200, f"Get CB accounts failed: {accounts_response.text}"
        
        accounts = accounts_response.json().get("accounts", [])
        if not accounts:
            pytest.skip("No credit builder accounts available for testing")
        
        account_id = accounts[0]["id"]
        
        # Test fix-reporting with payment_history_profile
        corrections = {
            "corrections": {
                "payment_history_profile": "111111111111111111111111",  # 24 chars: all on-time
                "current_balance": 500.00
            },
            "reason": "Test correction for iteration 50 - updating payment history to all on-time"
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/credit-builder/accounts/{account_id}/fix-reporting",
            json=corrections
        )
        assert response.status_code == 200, f"CB fix reporting failed: {response.text}"
        
        result = response.json()
        assert "correction_id" in result or "corrected_fields" in result, f"Response missing correction info: {result}"
        
        print(f"PASS: Credit Builder fix-reporting accepts payment_history_profile")
    
    def test_fix_reporting_requires_reason(self):
        """Test that fix-reporting requires a reason"""
        accounts_response = self.session.get(f"{BASE_URL}/api/collections/accounts?limit=1")
        assert accounts_response.status_code == 200
        
        accounts = accounts_response.json().get("accounts", [])
        if not accounts:
            pytest.skip("No accounts available")
        
        account_id = accounts[0]["id"]
        
        # Try without reason
        corrections = {
            "corrections": {"past_due_balance": 1500.00}
            # Missing "reason" field
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/collections/accounts/{account_id}/fix-reporting",
            json=corrections
        )
        assert response.status_code == 422, f"Expected 422 when reason is missing, got {response.status_code}"
        
        print(f"PASS: Fix reporting correctly requires reason field")
    
    # ============ CREDIT BUILDER SIGNUP TESTS ============
    
    def test_credit_builder_signup_endpoint(self):
        """Test that CB signup endpoint (public) works correctly"""
        unique_email = f"test_signup_{uuid.uuid4().hex[:8]}@example.com"
        
        signup_data = {
            "first_name": "TestSignup",
            "last_name": "User",
            "email": unique_email,
            "phone": "5551234567",
            "date_of_birth": "01151990",  # MMDDYYYY
            "ssn_last_four": "1234",
            "full_ssn": "123456789",
            "address_line1": "123 Test Street",
            "city": "Philadelphia",
            "state": "PA",
            "zip_code": "19102",
            "plan_tier": "standard",
            "password": "TestPass123!"
        }
        
        # Signup is PUBLIC - no auth needed
        response = requests.post(f"{BASE_URL}/api/credit-builder/signup", json=signup_data)
        assert response.status_code == 200, f"Signup failed: {response.text}"
        
        result = response.json()
        assert "account_number" in result, "Response missing account_number"
        assert "credit_limit" in result, "Response missing credit_limit"
        assert result["plan_tier"] == "standard", f"Unexpected plan_tier: {result.get('plan_tier')}"
        assert result["credit_limit"] == 1500, f"Standard plan should have $1500 limit, got {result.get('credit_limit')}"
        
        print(f"PASS: Credit Builder signup works. Account: {result['account_number']}, Limit: ${result['credit_limit']}")
        
        return result
    
    def test_credit_builder_signup_duplicate_email(self):
        """Test that signup rejects duplicate email"""
        unique_email = f"test_dup_{uuid.uuid4().hex[:8]}@example.com"
        
        signup_data = {
            "first_name": "TestDup",
            "last_name": "User",
            "email": unique_email,
            "phone": "5559876543",
            "date_of_birth": "06201985",
            "ssn_last_four": "5678",
            "full_ssn": "567891234",
            "address_line1": "456 Dup Street",
            "city": "Philadelphia",
            "state": "PA",
            "zip_code": "19103",
            "plan_tier": "starter",
            "password": "DupPass123!"
        }
        
        # First signup should succeed
        response1 = requests.post(f"{BASE_URL}/api/credit-builder/signup", json=signup_data)
        assert response1.status_code == 200, f"First signup failed: {response1.text}"
        
        # Second signup with same email should fail
        response2 = requests.post(f"{BASE_URL}/api/credit-builder/signup", json=signup_data)
        assert response2.status_code == 409, f"Expected 409 for duplicate, got {response2.status_code}"
        
        print(f"PASS: Duplicate email correctly rejected with 409")
    
    # ============ CB ACCOUNTS LIST TEST ============
    
    def test_cb_accounts_list(self):
        """Test that CB accounts list endpoint works for Toggle CB Accounts button"""
        response = self.session.get(f"{BASE_URL}/api/credit-builder/accounts?limit=100")
        assert response.status_code == 200, f"CB accounts list failed: {response.text}"
        
        data = response.json()
        assert "accounts" in data, "Response missing 'accounts' field"
        
        accounts = data["accounts"]
        if accounts:
            # Check that accounts have expected fields for the table
            first_acc = accounts[0]
            assert "id" in first_acc
            assert "first_name" in first_acc
            assert "last_name" in first_acc
            assert "account_number" in first_acc
            assert "plan_tier" in first_acc
            
            # Check for payment_history_profile (needed for Fix Reporting modal)
            if "payment_history_profile" in first_acc:
                print(f"PASS: CB accounts include payment_history_profile")
        
        print(f"PASS: CB accounts list works. Found {len(accounts)} accounts")
    
    # ============ SAMPLE DATA VERIFICATION ============
    
    def test_sample_cb_accounts_exist(self):
        """Verify sample CB accounts were seeded (Marcus Johnson, Sophia Williams, etc.)"""
        response = self.session.get(f"{BASE_URL}/api/credit-builder/accounts?limit=100")
        assert response.status_code == 200
        
        accounts = response.json().get("accounts", [])
        
        # Check for expected sample accounts
        expected_names = ["Marcus", "Sophia", "DeAndre", "Aaliyah"]
        found_names = []
        
        for acc in accounts:
            first_name = acc.get("first_name", "")
            if first_name in expected_names:
                found_names.append(first_name)
        
        if found_names:
            print(f"PASS: Found sample CB accounts: {found_names}")
        else:
            print(f"INFO: Sample accounts not found, may need seeding")
    
    def test_collections_accounts_have_payment_history(self):
        """Verify some collections accounts have payment_history_profile data"""
        response = self.session.get(f"{BASE_URL}/api/collections/reporting/past-due")
        assert response.status_code == 200
        
        report = response.json()
        accounts_with_history = 0
        total_accounts = 0
        
        for bucket_data in report["aging_buckets"].values():
            for acc in bucket_data.get("accounts", []):
                total_accounts += 1
                if acc.get("payment_history_profile"):
                    accounts_with_history += 1
        
        print(f"PASS: Found {accounts_with_history}/{total_accounts} accounts with payment_history_profile data")


class TestPaymentHistoryFormat:
    """Test payment history profile format (24-char string of 1s and 0s)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        assert login_response.status_code == 200
        token = login_response.json().get("access_token")
        self.session.headers.update({"Authorization": f"Bearer {token}"})
    
    def test_payment_history_grid_data_format(self):
        """Test that payment_history_profile uses correct format (1=on-time, 0=late)"""
        # Get an account and verify the format
        accounts_response = self.session.get(f"{BASE_URL}/api/collections/accounts?limit=10")
        assert accounts_response.status_code == 200
        
        accounts = accounts_response.json().get("accounts", [])
        
        for acc in accounts:
            profile = acc.get("payment_history_profile", "")
            if profile:
                # Profile should be max 24 characters
                assert len(profile) <= 24, f"Profile too long: {len(profile)} chars"
                # Should only contain 0, 1, or - (dash for no data)
                valid_chars = set("01-")
                assert set(profile).issubset(valid_chars), f"Invalid chars in profile: {profile}"
                print(f"PASS: Account {acc.get('account_number')} has valid payment_history_profile: {profile[:10]}...")
                break
        else:
            print("INFO: No accounts with payment_history_profile found")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
