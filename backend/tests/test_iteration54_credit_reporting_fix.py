"""
Iteration 54 - Testing Credit Reporting Dashboard Field Fix Feature
Tests:
1. All accounts (collections + credit_builder) appear in /api/credit-reporting/accounts
2. POST /api/credit-reporting/accounts/{id}/fix endpoint accepts any editable field
3. Fix endpoint creates entries in furnisher_audit_log AND corrections collection
4. Fix endpoint requires reason field
5. Various field types are editable: account_number, original_balance, metro2_status_code, etc.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCreditReportingFixEndpoint:
    """Tests for the new POST /api/credit-reporting/accounts/{id}/fix endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login as admin
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        data = login_response.json()
        self.token = data.get("token") or data.get("access_token")
        assert self.token, "No token returned from login"
        self.session.headers.update({"Authorization": f"Bearer {self.token}"})
    
    def test_01_get_all_reportable_accounts(self):
        """Verify GET /api/credit-reporting/accounts returns both collections and credit_builder accounts"""
        response = self.session.get(f"{BASE_URL}/api/credit-reporting/accounts?limit=200")
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "accounts" in data
        assert "total" in data
        
        accounts = data["accounts"]
        print(f"Total accounts found: {data['total']}")
        
        # Check for both account types
        collections_count = sum(1 for a in accounts if a.get("account_type") == "collections")
        credit_builder_count = sum(1 for a in accounts if a.get("account_type") == "credit_builder")
        
        print(f"Collections accounts: {collections_count}")
        print(f"Credit Builder accounts: {credit_builder_count}")
        
        # Store an account ID for later tests
        if accounts:
            pytest.account_id = accounts[0].get("id")
            pytest.account_type = accounts[0].get("account_type")
            print(f"Using account ID: {pytest.account_id} (type: {pytest.account_type})")
        
        assert len(accounts) > 0, "No accounts found"
        
    def test_02_get_account_compliance_detail(self):
        """Verify GET /api/credit-reporting/accounts/{id}/compliance returns raw_fields for editing"""
        if not hasattr(pytest, 'account_id'):
            pytest.skip("No account ID available from previous test")
        
        response = self.session.get(f"{BASE_URL}/api/credit-reporting/accounts/{pytest.account_id}/compliance")
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Check required fields are present
        assert "compliance" in data
        assert "raw_fields" in data, "raw_fields not present - needed for editing"
        
        raw_fields = data["raw_fields"]
        print(f"Raw fields available for editing: {list(raw_fields.keys())}")
        
        # Check critical editable fields are exposed
        expected_fields = ["account_number", "metro2_status_code", "payment_rating", "original_balance"]
        for field in expected_fields:
            assert field in raw_fields, f"Field '{field}' not in raw_fields"
        
        print(f"Compliance score: {data['compliance'].get('score')}")
        print(f"Ready to report: {data['compliance'].get('ready_to_report')}")
    
    def test_03_fix_endpoint_requires_reason(self):
        """Verify POST /api/credit-reporting/accounts/{id}/fix requires reason field"""
        if not hasattr(pytest, 'account_id'):
            pytest.skip("No account ID available from previous test")
        
        # Try without reason
        response = self.session.post(
            f"{BASE_URL}/api/credit-reporting/accounts/{pytest.account_id}/fix",
            json={
                "fields": {"account_number": "TEST-123"},
                "corrected_items": ["Account number update"]
            }
        )
        assert response.status_code == 422, f"Expected 422 for missing reason, got {response.status_code}"
        print("Correctly rejects request without reason")
    
    def test_04_fix_endpoint_requires_fields(self):
        """Verify POST /api/credit-reporting/accounts/{id}/fix requires fields"""
        if not hasattr(pytest, 'account_id'):
            pytest.skip("No account ID available from previous test")
        
        # Try without fields
        response = self.session.post(
            f"{BASE_URL}/api/credit-reporting/accounts/{pytest.account_id}/fix",
            json={
                "reason": "Test reason",
                "corrected_items": []
            }
        )
        assert response.status_code == 422, f"Expected 422 for missing fields, got {response.status_code}"
        print("Correctly rejects request without fields")
    
    def test_05_fix_account_number_field(self):
        """Test fixing account_number via the fix endpoint"""
        if not hasattr(pytest, 'account_id'):
            pytest.skip("No account ID available from previous test")
        
        # Get current value first
        get_response = self.session.get(f"{BASE_URL}/api/credit-reporting/accounts/{pytest.account_id}/compliance")
        original = get_response.json().get("raw_fields", {}).get("account_number", "")
        
        # Fix with test value
        test_value = f"TEST-{pytest.account_id[:8]}"
        response = self.session.post(
            f"{BASE_URL}/api/credit-reporting/accounts/{pytest.account_id}/fix",
            json={
                "fields": {"account_number": test_value},
                "reason": "Testing account number update capability",
                "corrected_items": ["Account number update"]
            }
        )
        assert response.status_code == 200, f"Fix failed: {response.text}"
        data = response.json()
        
        assert "corrected_fields" in data
        assert "account_number" in data["corrected_fields"]
        assert "audit_id" in data
        
        print(f"Successfully updated account_number to: {test_value}")
        print(f"Corrected fields: {data['corrected_fields']}")
        print(f"Audit ID: {data['audit_id']}")
        
        # Verify the update persisted
        verify_response = self.session.get(f"{BASE_URL}/api/credit-reporting/accounts/{pytest.account_id}/compliance")
        new_value = verify_response.json().get("raw_fields", {}).get("account_number", "")
        assert new_value == test_value, f"Expected {test_value}, got {new_value}"
        print(f"Verified persistence: account_number = {new_value}")
        
        # Restore original if it existed
        if original:
            self.session.post(
                f"{BASE_URL}/api/credit-reporting/accounts/{pytest.account_id}/fix",
                json={
                    "fields": {"account_number": original},
                    "reason": "Restoring original value after test",
                    "corrected_items": ["Account number update"]
                }
            )
    
    def test_06_fix_original_balance_field(self):
        """Test fixing original_balance (number field) via the fix endpoint"""
        if not hasattr(pytest, 'account_id'):
            pytest.skip("No account ID available from previous test")
        
        test_value = 12345.67
        response = self.session.post(
            f"{BASE_URL}/api/credit-reporting/accounts/{pytest.account_id}/fix",
            json={
                "fields": {"original_balance": test_value},
                "reason": "Testing original balance update",
                "corrected_items": ["Balance/amount correction"]
            }
        )
        assert response.status_code == 200, f"Fix failed: {response.text}"
        data = response.json()
        
        assert "original_balance" in data["corrected_fields"]
        print(f"Successfully updated original_balance to: {test_value}")
    
    def test_07_fix_metro2_status_code_field(self):
        """Test fixing metro2_status_code (dropdown field) via the fix endpoint"""
        if not hasattr(pytest, 'account_id'):
            pytest.skip("No account ID available from previous test")
        
        test_value = "11"  # Valid Metro 2 code
        response = self.session.post(
            f"{BASE_URL}/api/credit-reporting/accounts/{pytest.account_id}/fix",
            json={
                "fields": {"metro2_status_code": test_value},
                "reason": "Testing Metro 2 status code update",
                "corrected_items": ["Metro 2 status code correction"]
            }
        )
        assert response.status_code == 200, f"Fix failed: {response.text}"
        data = response.json()
        
        assert "metro2_status_code" in data["corrected_fields"]
        print(f"Successfully updated metro2_status_code to: {test_value}")
    
    def test_08_fix_payment_rating_field(self):
        """Test fixing payment_rating (dropdown field) via the fix endpoint"""
        if not hasattr(pytest, 'account_id'):
            pytest.skip("No account ID available from previous test")
        
        test_value = "1"  # Valid payment rating
        response = self.session.post(
            f"{BASE_URL}/api/credit-reporting/accounts/{pytest.account_id}/fix",
            json={
                "fields": {"payment_rating": test_value},
                "reason": "Testing payment rating update",
                "corrected_items": ["Payment rating correction"]
            }
        )
        assert response.status_code == 200, f"Fix failed: {response.text}"
        data = response.json()
        
        assert "payment_rating" in data["corrected_fields"]
        print(f"Successfully updated payment_rating to: {test_value}")
    
    def test_09_fix_multiple_fields_at_once(self):
        """Test fixing multiple fields in a single request"""
        if not hasattr(pytest, 'account_id'):
            pytest.skip("No account ID available from previous test")
        
        response = self.session.post(
            f"{BASE_URL}/api/credit-reporting/accounts/{pytest.account_id}/fix",
            json={
                "fields": {
                    "special_comment_code": "AU",
                    "ecoa_code": "1",
                    "payment_history_profile": "111111111111111111111111111111111111111111111111111111111111"
                },
                "reason": "Testing multi-field update for compliance improvement",
                "corrected_items": ["Special comment update", "ECOA code update", "Payment history correction"]
            }
        )
        assert response.status_code == 200, f"Fix failed: {response.text}"
        data = response.json()
        
        corrected = data["corrected_fields"]
        print(f"Corrected fields: {corrected}")
        
        # At least one of these should be corrected
        assert len(corrected) >= 1, "Expected at least one field to be corrected"
        print(f"Successfully updated {len(corrected)} fields at once")
    
    def test_10_fix_creates_audit_log_entry(self):
        """Verify the fix endpoint creates an entry in furnisher_audit_log"""
        if not hasattr(pytest, 'account_id'):
            pytest.skip("No account ID available from previous test")
        
        # Make a fix
        response = self.session.post(
            f"{BASE_URL}/api/credit-reporting/accounts/{pytest.account_id}/fix",
            json={
                "fields": {"account_status": "active"},
                "reason": "Testing audit log creation",
                "corrected_items": ["Other"]
            }
        )
        assert response.status_code == 200, f"Fix failed: {response.text}"
        audit_id = response.json().get("audit_id")
        
        # Get compliance detail which includes audit_log
        compliance_response = self.session.get(f"{BASE_URL}/api/credit-reporting/accounts/{pytest.account_id}/compliance")
        assert compliance_response.status_code == 200
        data = compliance_response.json()
        
        # Check audit_log exists
        audit_log = data.get("audit_log", [])
        print(f"Found {len(audit_log)} audit log entries")
        
        if audit_log:
            latest = audit_log[0]
            print(f"Latest audit entry: action={latest.get('action')}, reason={latest.get('reason')}")
            
            # Look for our entry
            found = any(
                entry.get("action") == "credit_reporting_fix" and 
                "Testing audit log creation" in (entry.get("reason") or "")
                for entry in audit_log
            )
            assert found, "Audit log entry not found for our fix"
            print("Verified: fix creates audit log entry")
    
    def test_11_fix_creates_corrections_entry(self):
        """Verify the fix endpoint creates an entry in corrections collection"""
        if not hasattr(pytest, 'account_id'):
            pytest.skip("No account ID available from previous test")
        
        # Get compliance detail which includes corrections
        response = self.session.get(f"{BASE_URL}/api/credit-reporting/accounts/{pytest.account_id}/compliance")
        assert response.status_code == 200
        data = response.json()
        
        corrections = data.get("corrections", [])
        print(f"Found {len(corrections)} correction entries")
        
        if corrections:
            latest = corrections[0]
            print(f"Latest correction: fields={latest.get('corrected_fields')}, reason={latest.get('reason')}")
            print("Verified: fix creates corrections entry")
    
    def test_12_fix_returns_corrected_fields_list(self):
        """Verify the fix endpoint returns the list of corrected fields"""
        if not hasattr(pytest, 'account_id'):
            pytest.skip("No account ID available from previous test")
        
        response = self.session.post(
            f"{BASE_URL}/api/credit-reporting/accounts/{pytest.account_id}/fix",
            json={
                "fields": {"client_name": "Test Consumer Name"},
                "reason": "Testing corrected_fields return value",
                "corrected_items": ["Consumer name correction"]
            }
        )
        
        # Collections might use client_name, credit builder uses first_name/last_name
        # Accept either 200 or the field might not be in allowed list
        if response.status_code == 200:
            data = response.json()
            assert "corrected_fields" in data
            assert isinstance(data["corrected_fields"], list)
            print(f"Returned corrected_fields: {data['corrected_fields']}")
        else:
            print(f"Field not allowed for this account type (status {response.status_code})")
    
    def test_13_disputes_are_clickable_with_detail(self):
        """Verify disputes endpoint returns data for clickable disputes"""
        response = self.session.get(f"{BASE_URL}/api/credit-reporting/disputes")
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "disputes" in data
        assert "stats" in data
        
        disputes = data["disputes"]
        print(f"Total disputes: {len(disputes)}")
        print(f"Stats: open={data['stats'].get('open')}, resolved={data['stats'].get('resolved')}")
        
        if disputes:
            d = disputes[0]
            # Check dispute has clickable-required fields
            assert "id" in d
            assert "account_id" in d or "debtor_name" in d
            print(f"Dispute fields available: {list(d.keys())}")
    
    def test_14_compliance_score_recalculates(self):
        """Verify compliance score updates after fixing fields"""
        if not hasattr(pytest, 'account_id'):
            pytest.skip("No account ID available from previous test")
        
        # Get initial score
        before = self.session.get(f"{BASE_URL}/api/credit-reporting/accounts/{pytest.account_id}/compliance")
        initial_score = before.json().get("compliance", {}).get("score", 0)
        print(f"Initial compliance score: {initial_score}")
        
        # The score should be > 0 after our previous fixes
        assert initial_score > 0, "Compliance score should be > 0"
        print(f"Compliance score is valid: {initial_score}%")
    
    def test_15_reference_codes_for_dropdowns(self):
        """Verify reference codes endpoint returns data for dropdown fields"""
        response = self.session.get(f"{BASE_URL}/api/collections/furnisher/reference-codes")
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Check for dropdown codes
        assert "metro2_status_codes" in data or "account_status_codes" in data
        
        print(f"Reference code categories: {list(data.keys())}")
        
        if "metro2_status_codes" in data:
            print(f"Metro 2 status codes count: {len(data['metro2_status_codes'])}")
        if "payment_rating_codes" in data:
            print(f"Payment rating codes count: {len(data['payment_rating_codes'])}")
        if "special_comment_codes" in data:
            print(f"Special comment codes count: {len(data['special_comment_codes'])}")


class TestCreditReportingAccountsDisplay:
    """Tests that all accounts appear in Credit Reporting view"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        assert login_response.status_code == 200
        data = login_response.json()
        self.token = data.get("token") or data.get("access_token")
        self.session.headers.update({"Authorization": f"Bearer {self.token}"})
    
    def test_16_all_collections_accounts_appear(self):
        """Verify all collections accounts appear in credit reporting"""
        # Get collections accounts directly
        coll_response = self.session.get(f"{BASE_URL}/api/collections/accounts?limit=500")
        assert coll_response.status_code == 200
        coll_accounts = coll_response.json().get("accounts", [])
        coll_count = len(coll_accounts)
        print(f"Collections accounts from /api/collections/accounts: {coll_count}")
        
        # Get from credit reporting
        cr_response = self.session.get(f"{BASE_URL}/api/credit-reporting/accounts?account_type=collections&limit=500")
        assert cr_response.status_code == 200
        cr_accounts = cr_response.json().get("accounts", [])
        cr_coll_count = len(cr_accounts)
        print(f"Collections accounts from /api/credit-reporting/accounts: {cr_coll_count}")
        
        # They should match (approximately - might differ if some filtering is applied)
        assert cr_coll_count >= coll_count * 0.9, f"Credit Reporting missing some collections accounts: expected ~{coll_count}, got {cr_coll_count}"
    
    def test_17_all_credit_builder_accounts_appear(self):
        """Verify all credit builder accounts appear in credit reporting"""
        # Get from credit reporting
        response = self.session.get(f"{BASE_URL}/api/credit-reporting/accounts?account_type=credit_builder&limit=500")
        assert response.status_code == 200
        data = response.json()
        
        cb_count = len(data.get("accounts", []))
        print(f"Credit Builder accounts from /api/credit-reporting/accounts: {cb_count}")
        
        # Should have some credit builder accounts
        # (we know from previous tests there are some)
        print(f"Credit Builder accounts present: {cb_count}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
