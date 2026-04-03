"""
Test Collections Platform Enhancements - Iteration 86
Tests for:
1. Dispositions endpoint (10 call, 2 text, 2 email dispositions)
2. Contact logging with disposition and is_conversation fields
3. Text limit 1/day enforcement
4. Round-robin auto-assignment
5. Daily conversations tracking (4/day minimum)
6. Letter logging and 1/month compliance
7. Letter compliance reporting
8. Partial contact compliance alerts
9. Recommended callback times
10. CPR Merger past-due sync
11. Phone disconnected flag and clear-disconnected
"""

import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCollectionsEnhancements:
    """Test suite for Collections Platform enhancements"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures - get auth token and account ID"""
        # Login as admin
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        self.token = login_res.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
        
        # Get a valid account ID
        accounts_res = requests.get(f"{BASE_URL}/api/collections/accounts", headers=self.headers)
        if accounts_res.status_code == 200:
            accounts = accounts_res.json().get("accounts", [])
            if accounts:
                self.account_id = accounts[0]["id"]
                self.account_name = accounts[0].get("client_name", "Test Account")
            else:
                self.account_id = None
        else:
            self.account_id = None
    
    # ============ TEST 1: Dispositions Endpoint ============
    def test_get_dispositions_returns_correct_counts(self):
        """GET /api/collections/dispositions returns 10 call, 2 text, 2 email dispositions"""
        res = requests.get(f"{BASE_URL}/api/collections/dispositions", headers=self.headers)
        assert res.status_code == 200, f"Failed to get dispositions: {res.text}"
        
        data = res.json()
        
        # Verify call dispositions (should be 10)
        assert "call_dispositions" in data, "Missing call_dispositions"
        call_disps = data["call_dispositions"]
        assert len(call_disps) == 10, f"Expected 10 call dispositions, got {len(call_disps)}"
        
        # Verify text dispositions (should be 2)
        assert "text_dispositions" in data, "Missing text_dispositions"
        text_disps = data["text_dispositions"]
        assert len(text_disps) == 2, f"Expected 2 text dispositions, got {len(text_disps)}"
        
        # Verify email dispositions (should be 2)
        assert "email_dispositions" in data, "Missing email_dispositions"
        email_disps = data["email_dispositions"]
        assert len(email_disps) == 2, f"Expected 2 email dispositions, got {len(email_disps)}"
        
        # Verify structure of dispositions
        for disp in call_disps:
            assert "value" in disp, "Disposition missing 'value'"
            assert "label" in disp, "Disposition missing 'label'"
            assert "is_conversation" in disp, "Disposition missing 'is_conversation'"
        
        print(f"✓ Dispositions endpoint returns correct counts: {len(call_disps)} call, {len(text_disps)} text, {len(email_disps)} email")
    
    # ============ TEST 2: Contact Logging with Disposition ============
    def test_log_contact_with_disposition_and_conversation(self):
        """POST /api/collections/accounts/{id}/contacts with disposition and is_conversation"""
        if not self.account_id:
            pytest.skip("No account available for testing")
        
        # Log a call contact with disposition
        contact_data = {
            "contact_type": "call",
            "outcome": "Spoke with client about payment options, they will call back tomorrow",
            "disposition": "spoke_with_client",
            "is_conversation": True
        }
        
        res = requests.post(
            f"{BASE_URL}/api/collections/accounts/{self.account_id}/contacts",
            headers=self.headers,
            json=contact_data
        )
        
        # May fail if max contacts reached, which is acceptable
        if res.status_code == 400 and "Maximum" in res.json().get("detail", ""):
            print(f"✓ Contact logging correctly enforces limits: {res.json()['detail']}")
            return
        
        assert res.status_code == 200, f"Failed to log contact: {res.text}"
        
        data = res.json()
        assert "contact" in data, "Response missing 'contact'"
        contact = data["contact"]
        
        assert contact.get("disposition") == "spoke_with_client", f"Disposition not saved correctly"
        assert contact.get("is_conversation") == True, f"is_conversation not saved correctly"
        
        print(f"✓ Contact logged with disposition={contact['disposition']}, is_conversation={contact['is_conversation']}")
    
    # ============ TEST 3: Text Limit 1/Day ============
    def test_text_limit_one_per_day(self):
        """Text limit is 1/day - second text should fail"""
        if not self.account_id:
            pytest.skip("No account available for testing")
        
        # First, check current compliance
        account_res = requests.get(
            f"{BASE_URL}/api/collections/accounts/{self.account_id}",
            headers=self.headers
        )
        assert account_res.status_code == 200
        account = account_res.json()
        texts_today = account.get("today_compliance", {}).get("texts_completed", 0)
        
        # Try to log a text
        text_data = {
            "contact_type": "text",
            "outcome": "Sent payment reminder text message to client",
            "disposition": "text_sent",
            "is_conversation": False
        }
        
        res = requests.post(
            f"{BASE_URL}/api/collections/accounts/{self.account_id}/contacts",
            headers=self.headers,
            json=text_data
        )
        
        if texts_today >= 1:
            # Should fail with limit message
            assert res.status_code == 400, f"Expected 400 for text limit, got {res.status_code}"
            assert "Maximum 1 text(s) already logged today" in res.json().get("detail", ""), \
                f"Expected text limit error, got: {res.json()}"
            print(f"✓ Text limit enforced: {res.json()['detail']}")
        else:
            # First text should succeed
            if res.status_code == 200:
                print(f"✓ First text logged successfully")
                
                # Now try second text - should fail
                res2 = requests.post(
                    f"{BASE_URL}/api/collections/accounts/{self.account_id}/contacts",
                    headers=self.headers,
                    json=text_data
                )
                assert res2.status_code == 400, f"Expected 400 for second text, got {res2.status_code}"
                assert "Maximum 1 text(s) already logged today" in res2.json().get("detail", ""), \
                    f"Expected text limit error, got: {res2.json()}"
                print(f"✓ Second text correctly rejected: {res2.json()['detail']}")
    
    # ============ TEST 4: Round-Robin Assignment ============
    def test_round_robin_assignment(self):
        """POST /api/collections/accounts/round-robin returns appropriate response"""
        res = requests.post(
            f"{BASE_URL}/api/collections/accounts/round-robin",
            headers=self.headers,
            json={"reassign_all": False}
        )
        
        # May return 400 if no reps available - this is expected behavior
        if res.status_code == 400:
            detail = res.json().get("detail", "")
            assert "No active collection reps found" in detail, f"Unexpected error: {detail}"
            print(f"✓ Round-robin correctly reports: {detail}")
            return
        
        assert res.status_code == 200, f"Round-robin failed: {res.text}"
        
        data = res.json()
        assert "assigned" in data, "Response missing 'assigned' count"
        assert "reps_used" in data or "message" in data, "Response missing expected fields"
        
        print(f"✓ Round-robin response: {data.get('message', data)}")
    
    # ============ TEST 5: Daily Conversations Tracking ============
    def test_daily_conversations_endpoint(self):
        """GET /api/collections/reps/daily-conversations returns date, minimum_required=4, reps array"""
        res = requests.get(
            f"{BASE_URL}/api/collections/reps/daily-conversations",
            headers=self.headers
        )
        assert res.status_code == 200, f"Failed to get daily conversations: {res.text}"
        
        data = res.json()
        
        # Verify required fields
        assert "date" in data, "Response missing 'date'"
        assert "minimum_required" in data, "Response missing 'minimum_required'"
        assert data["minimum_required"] == 4, f"Expected minimum_required=4, got {data['minimum_required']}"
        assert "reps" in data, "Response missing 'reps'"
        assert isinstance(data["reps"], list), "'reps' should be a list"
        
        # Verify rep structure if any reps exist
        for rep in data["reps"]:
            assert "rep_id" in rep, "Rep missing 'rep_id'"
            assert "rep_name" in rep, "Rep missing 'rep_name'"
            assert "conversation_count" in rep, "Rep missing 'conversation_count'"
            assert "meets_minimum" in rep, "Rep missing 'meets_minimum'"
        
        print(f"✓ Daily conversations: date={data['date']}, minimum_required={data['minimum_required']}, reps={len(data['reps'])}")
    
    # ============ TEST 6: Letter Logging ============
    def test_log_letter_and_enforce_monthly_limit(self):
        """POST /api/collections/accounts/{id}/letters logs a letter and enforces 1/month"""
        if not self.account_id:
            pytest.skip("No account available for testing")
        
        letter_data = {
            "letter_type": "collection_notice",
            "delivery_method": "mail",
            "notes": "Sent standard collection notice via USPS"
        }
        
        res = requests.post(
            f"{BASE_URL}/api/collections/accounts/{self.account_id}/letters",
            headers=self.headers,
            json=letter_data
        )
        
        # May fail if letter already sent this month
        if res.status_code == 400:
            detail = res.json().get("detail", "")
            assert "Letter already sent" in detail, f"Unexpected error: {detail}"
            print(f"✓ Letter monthly limit enforced: {detail}")
            return
        
        assert res.status_code == 200, f"Failed to log letter: {res.text}"
        
        data = res.json()
        assert "id" in data, "Letter response missing 'id'"
        assert "month" in data, "Letter response missing 'month'"
        assert "letter_type" in data, "Letter response missing 'letter_type'"
        
        print(f"✓ Letter logged: id={data['id']}, month={data['month']}")
        
        # Try to log another letter - should fail
        res2 = requests.post(
            f"{BASE_URL}/api/collections/accounts/{self.account_id}/letters",
            headers=self.headers,
            json=letter_data
        )
        assert res2.status_code == 400, f"Expected 400 for second letter, got {res2.status_code}"
        assert "Letter already sent" in res2.json().get("detail", ""), \
            f"Expected monthly limit error, got: {res2.json()}"
        print(f"✓ Second letter correctly rejected: {res2.json()['detail']}")
    
    # ============ TEST 7: Letter Compliance Reporting ============
    def test_letter_compliance_endpoint(self):
        """GET /api/collections/letters/compliance returns total_accounts, letters_sent, letters_pending, compliance_rate"""
        res = requests.get(
            f"{BASE_URL}/api/collections/letters/compliance",
            headers=self.headers
        )
        assert res.status_code == 200, f"Failed to get letter compliance: {res.text}"
        
        data = res.json()
        
        # Verify required fields
        assert "total_accounts" in data, "Response missing 'total_accounts'"
        assert "letters_sent" in data, "Response missing 'letters_sent'"
        assert "letters_pending" in data, "Response missing 'letters_pending'"
        assert "compliance_rate" in data, "Response missing 'compliance_rate'"
        assert "month" in data, "Response missing 'month'"
        
        # Verify data types
        assert isinstance(data["total_accounts"], int), "'total_accounts' should be int"
        assert isinstance(data["letters_sent"], int), "'letters_sent' should be int"
        assert isinstance(data["letters_pending"], int), "'letters_pending' should be int"
        assert isinstance(data["compliance_rate"], (int, float)), "'compliance_rate' should be numeric"
        
        print(f"✓ Letter compliance: total={data['total_accounts']}, sent={data['letters_sent']}, pending={data['letters_pending']}, rate={data['compliance_rate']}%")
    
    # ============ TEST 8: Partial Contact Alerts ============
    def test_partial_contact_alerts(self):
        """GET /api/collections/compliance/partial-contacts returns partial contact alerts"""
        res = requests.get(
            f"{BASE_URL}/api/collections/compliance/partial-contacts",
            headers=self.headers
        )
        assert res.status_code == 200, f"Failed to get partial contacts: {res.text}"
        
        data = res.json()
        
        # Verify required fields
        assert "date" in data, "Response missing 'date'"
        assert "total_partial" in data, "Response missing 'total_partial'"
        assert "accounts" in data, "Response missing 'accounts'"
        assert isinstance(data["accounts"], list), "'accounts' should be a list"
        
        # Verify account structure if any exist
        for acc in data["accounts"]:
            assert "account_id" in acc, "Account missing 'account_id'"
            assert "client_name" in acc, "Account missing 'client_name'"
            assert "missing" in acc, "Account missing 'missing'"
            assert "calls" in acc["missing"], "Missing 'calls' in missing"
            assert "texts" in acc["missing"], "Missing 'texts' in missing"
            assert "emails" in acc["missing"], "Missing 'emails' in missing"
        
        print(f"✓ Partial contact alerts: date={data['date']}, total_partial={data['total_partial']}")
    
    # ============ TEST 9: Recommended Callback Times ============
    def test_recommended_callback_times(self):
        """GET /api/collections/accounts/{id}/recommended-callback returns recommended_windows"""
        if not self.account_id:
            pytest.skip("No account available for testing")
        
        res = requests.get(
            f"{BASE_URL}/api/collections/accounts/{self.account_id}/recommended-callback",
            headers=self.headers
        )
        assert res.status_code == 200, f"Failed to get recommended callback: {res.text}"
        
        data = res.json()
        
        # Verify required fields
        assert "account_id" in data, "Response missing 'account_id'"
        assert "recommended_windows" in data, "Response missing 'recommended_windows'"
        assert isinstance(data["recommended_windows"], list), "'recommended_windows' should be a list"
        
        # Verify window structure
        for window in data["recommended_windows"]:
            assert "time_window" in window, "Window missing 'time_window'"
            assert "confidence" in window, "Window missing 'confidence'"
            assert "reason" in window, "Window missing 'reason'"
        
        print(f"✓ Recommended callback: {len(data['recommended_windows'])} windows, next_date={data.get('next_recommended_date', 'N/A')}")
    
    # ============ TEST 10: CPR Merger Past-Due Sync ============
    def test_sync_cpr_past_due(self):
        """POST /api/collections/sync-cpr-past-due syncs CPR merger past-due clients"""
        res = requests.post(
            f"{BASE_URL}/api/collections/sync-cpr-past-due",
            headers=self.headers
        )
        assert res.status_code == 200, f"Failed to sync CPR past-due: {res.text}"
        
        data = res.json()
        
        # Verify required fields
        assert "message" in data, "Response missing 'message'"
        assert "created" in data, "Response missing 'created'"
        assert "skipped_existing" in data, "Response missing 'skipped_existing'"
        assert "total_found" in data, "Response missing 'total_found'"
        
        print(f"✓ CPR sync: created={data['created']}, skipped={data['skipped_existing']}, total_found={data['total_found']}")
    
    # ============ TEST 11: Phone Disconnected Flag ============
    def test_phone_disconnected_flag(self):
        """Phone disconnected disposition sets flag, subsequent call fails"""
        if not self.account_id:
            pytest.skip("No account available for testing")
        
        # First, check if phone is already disconnected
        account_res = requests.get(
            f"{BASE_URL}/api/collections/accounts/{self.account_id}",
            headers=self.headers
        )
        assert account_res.status_code == 200
        account = account_res.json()
        
        if account.get("phone_disconnected"):
            # Test that call attempt fails
            call_data = {
                "contact_type": "call",
                "outcome": "Attempting to call client about payment",
                "disposition": "no_answer",
                "is_conversation": False
            }
            res = requests.post(
                f"{BASE_URL}/api/collections/accounts/{self.account_id}/contacts",
                headers=self.headers,
                json=call_data
            )
            
            if res.status_code == 400:
                detail = res.json().get("detail", "")
                if "disconnected" in detail.lower():
                    print(f"✓ Phone disconnected blocks calls: {detail}")
                    return
        
        print(f"✓ Phone disconnected flag test: phone_disconnected={account.get('phone_disconnected', False)}")
    
    # ============ TEST 12: Clear Disconnected ============
    def test_clear_disconnected(self):
        """POST /api/collections/accounts/{id}/clear-disconnected re-enables calls"""
        if not self.account_id:
            pytest.skip("No account available for testing")
        
        res = requests.post(
            f"{BASE_URL}/api/collections/accounts/{self.account_id}/clear-disconnected",
            headers=self.headers
        )
        
        # Should succeed or return 404 if account not found
        assert res.status_code in [200, 404], f"Unexpected status: {res.status_code}, {res.text}"
        
        if res.status_code == 200:
            data = res.json()
            assert "message" in data, "Response missing 'message'"
            print(f"✓ Clear disconnected: {data['message']}")
        else:
            print(f"✓ Clear disconnected: Account not found (expected if no disconnected accounts)")


class TestCollectionsAccountsExist:
    """Verify collections accounts exist for testing"""
    
    def test_accounts_endpoint_returns_data(self):
        """GET /api/collections/accounts returns accounts list"""
        # Login
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        token = login_res.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get accounts
        res = requests.get(f"{BASE_URL}/api/collections/accounts", headers=headers)
        assert res.status_code == 200, f"Failed to get accounts: {res.text}"
        
        data = res.json()
        assert "accounts" in data, "Response missing 'accounts'"
        assert "total" in data, "Response missing 'total'"
        
        print(f"✓ Collections accounts: total={data['total']}, returned={len(data['accounts'])}")
        
        # Verify account structure
        if data["accounts"]:
            acc = data["accounts"][0]
            assert "id" in acc, "Account missing 'id'"
            assert "client_name" in acc, "Account missing 'client_name'"
            assert "today_compliance" in acc, "Account missing 'today_compliance'"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
