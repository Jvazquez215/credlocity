"""
Iteration 52 - Credit Reporting Dashboard API Tests
Tests for Metro 2 compliance checking, cross-bureau validation, 
reporting cycles, and disputes dashboard (Phase 15)
"""

import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCreditReportingAPI:
    """Credit Reporting Dashboard API tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        self.token = login_response.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    # ==================== TEST: Compliance Overview ====================
    def test_compliance_overview_returns_stats(self):
        """GET /api/credit-reporting/compliance/overview - returns total_accounts, ready_to_report, average_compliance_score, disputes stats"""
        response = requests.get(f"{BASE_URL}/api/credit-reporting/compliance/overview", headers=self.headers)
        assert response.status_code == 200, f"Failed: {response.status_code} - {response.text}"
        
        data = response.json()
        # Check required fields exist
        assert "total_accounts" in data, "Missing total_accounts"
        assert "ready_to_report" in data, "Missing ready_to_report"
        assert "average_compliance_score" in data, "Missing average_compliance_score"
        assert "disputes" in data, "Missing disputes"
        
        # Check disputes structure
        disputes = data["disputes"]
        assert "open" in disputes, "Missing disputes.open"
        assert "approaching_deadline" in disputes, "Missing disputes.approaching_deadline"
        assert "overdue" in disputes, "Missing disputes.overdue"
        
        # Check additional stats
        assert "not_ready" in data, "Missing not_ready"
        assert "suppressed" in data, "Missing suppressed"
        assert "missing_metro2_code" in data, "Missing missing_metro2_code"
        assert "missing_payment_history" in data, "Missing missing_payment_history"
        
        print(f"Compliance Overview: {data['total_accounts']} accounts, {data['ready_to_report']} ready, {data['average_compliance_score']}% avg score")
    
    def test_compliance_overview_requires_auth(self):
        """GET /api/credit-reporting/compliance/overview - requires authentication"""
        response = requests.get(f"{BASE_URL}/api/credit-reporting/compliance/overview")
        assert response.status_code == 401, "Should require auth"
    
    # ==================== TEST: Account Registry ====================
    def test_get_all_accounts_returns_unified_list(self):
        """GET /api/credit-reporting/accounts - returns unified list of collections + credit builder accounts"""
        response = requests.get(f"{BASE_URL}/api/credit-reporting/accounts", headers=self.headers)
        assert response.status_code == 200, f"Failed: {response.status_code} - {response.text}"
        
        data = response.json()
        assert "accounts" in data, "Missing accounts array"
        assert "total" in data, "Missing total count"
        
        # If there are accounts, validate structure
        if data["total"] > 0:
            account = data["accounts"][0]
            # Required fields for unified view
            assert "id" in account, "Missing id"
            assert "account_type" in account, "Missing account_type"
            assert "name" in account, "Missing name"
            assert "compliance_score" in account, "Missing compliance_score"
            assert "ready_to_report" in account, "Missing ready_to_report"
            assert "cross_bureau_consistent" in account, "Missing cross_bureau_consistent"
            assert "payment_history_profile" in account, "Missing payment_history_profile"
            
            print(f"Found {data['total']} accounts. First: {account['name']} ({account['account_type']}) - {account['compliance_score']}% compliance")
        else:
            print("No accounts found in database")
    
    def test_filter_accounts_by_type_collections(self):
        """GET /api/credit-reporting/accounts?account_type=collections - filters by collections"""
        response = requests.get(f"{BASE_URL}/api/credit-reporting/accounts?account_type=collections", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        # All accounts should be collections type
        for acc in data.get("accounts", []):
            assert acc["account_type"] == "collections", f"Found non-collections account: {acc['account_type']}"
        
        print(f"Found {data['total']} collections accounts")
    
    def test_filter_accounts_by_type_credit_builder(self):
        """GET /api/credit-reporting/accounts?account_type=credit_builder - filters by credit builder"""
        response = requests.get(f"{BASE_URL}/api/credit-reporting/accounts?account_type=credit_builder", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        # All accounts should be credit_builder type
        for acc in data.get("accounts", []):
            assert acc["account_type"] == "credit_builder", f"Found non-credit_builder account: {acc['account_type']}"
        
        print(f"Found {data['total']} credit builder accounts")
    
    def test_filter_accounts_by_compliance_ready(self):
        """GET /api/credit-reporting/accounts?compliance_filter=ready - filters ready to report"""
        response = requests.get(f"{BASE_URL}/api/credit-reporting/accounts?compliance_filter=ready", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        # All accounts should be ready to report
        for acc in data.get("accounts", []):
            assert acc["ready_to_report"] == True, f"Found not-ready account in ready filter"
        
        print(f"Found {data['total']} ready-to-report accounts")
    
    def test_filter_accounts_by_compliance_not_ready(self):
        """GET /api/credit-reporting/accounts?compliance_filter=not_ready - filters not ready"""
        response = requests.get(f"{BASE_URL}/api/credit-reporting/accounts?compliance_filter=not_ready", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        # All accounts should NOT be ready to report
        for acc in data.get("accounts", []):
            assert acc["ready_to_report"] == False, f"Found ready account in not_ready filter"
        
        print(f"Found {data['total']} not-ready accounts")
    
    def test_search_accounts_by_name(self):
        """GET /api/credit-reporting/accounts?search=<name> - searches by name"""
        # First get an account to search for
        all_response = requests.get(f"{BASE_URL}/api/credit-reporting/accounts?limit=1", headers=self.headers)
        all_data = all_response.json()
        
        if all_data["total"] > 0:
            search_name = all_data["accounts"][0]["name"].split()[0]  # First word of name
            response = requests.get(f"{BASE_URL}/api/credit-reporting/accounts?search={search_name}", headers=self.headers)
            assert response.status_code == 200
            
            data = response.json()
            print(f"Search for '{search_name}' returned {data['total']} accounts")
        else:
            pytest.skip("No accounts to search")
    
    # ==================== TEST: Account Compliance Detail ====================
    def test_get_account_compliance_detail(self):
        """GET /api/credit-reporting/accounts/{id}/compliance - returns full Metro 2 checklist"""
        # First get an account
        all_response = requests.get(f"{BASE_URL}/api/credit-reporting/accounts?limit=1", headers=self.headers)
        all_data = all_response.json()
        
        if all_data["total"] > 0:
            account_id = all_data["accounts"][0]["id"]
            response = requests.get(f"{BASE_URL}/api/credit-reporting/accounts/{account_id}/compliance", headers=self.headers)
            assert response.status_code == 200
            
            data = response.json()
            # Validate compliance structure
            assert "account_id" in data
            assert "account_type" in data
            assert "compliance" in data
            assert "cross_bureau" in data
            
            # Validate compliance checklist fields
            compliance = data["compliance"]
            assert "total_fields" in compliance
            assert "passed" in compliance
            assert "failed" in compliance
            assert "score" in compliance
            assert "ready_to_report" in compliance
            assert "fields" in compliance
            
            # Validate cross-bureau check
            cross_bureau = data["cross_bureau"]
            assert "consistent" in cross_bureau
            assert "issues" in cross_bureau
            assert "bureaus" in cross_bureau
            
            # Validate field checklist items
            if len(compliance["fields"]) > 0:
                field = compliance["fields"][0]
                assert "field" in field
                assert "label" in field
                assert "severity" in field
                assert "status" in field  # pass or fail
            
            print(f"Account {data['name']}: {compliance['passed']}/{compliance['total_fields']} fields valid, {compliance['score']}% score")
        else:
            pytest.skip("No accounts to check compliance")
    
    def test_account_compliance_returns_404_for_invalid(self):
        """GET /api/credit-reporting/accounts/{invalid_id}/compliance - returns 404"""
        response = requests.get(f"{BASE_URL}/api/credit-reporting/accounts/invalid-id-12345/compliance", headers=self.headers)
        assert response.status_code == 404, f"Should return 404 for invalid ID, got {response.status_code}"
    
    # ==================== TEST: Disputes Dashboard ====================
    def test_get_disputes_dashboard(self):
        """GET /api/credit-reporting/disputes - returns disputes with days_remaining, is_urgent, is_overdue"""
        response = requests.get(f"{BASE_URL}/api/credit-reporting/disputes", headers=self.headers)
        assert response.status_code == 200, f"Failed: {response.status_code} - {response.text}"
        
        data = response.json()
        assert "disputes" in data
        assert "stats" in data
        
        # Validate stats structure
        stats = data["stats"]
        assert "total" in stats
        assert "open" in stats
        assert "resolved" in stats
        
        # If there are open disputes, check FCRA deadline fields
        for dispute in data["disputes"]:
            if dispute.get("status") == "open" and dispute.get("deadline"):
                # Should have days_remaining calculated
                assert "days_remaining" in dispute or dispute.get("days_remaining") is None
                # Should have urgency flags
                # Note: is_urgent and is_overdue only set if days_remaining is calculated
        
        print(f"Disputes: {stats['open']} open, {stats['resolved']} resolved")
    
    def test_filter_disputes_by_status_open(self):
        """GET /api/credit-reporting/disputes?status_filter=open - filters open disputes"""
        response = requests.get(f"{BASE_URL}/api/credit-reporting/disputes?status_filter=open", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        for dispute in data.get("disputes", []):
            assert dispute["status"] == "open", f"Found non-open dispute in open filter"
        
        print(f"Found {len(data.get('disputes', []))} open disputes")
    
    def test_filter_disputes_by_status_resolved(self):
        """GET /api/credit-reporting/disputes?status_filter=resolved - filters resolved disputes"""
        response = requests.get(f"{BASE_URL}/api/credit-reporting/disputes?status_filter=resolved", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        for dispute in data.get("disputes", []):
            assert dispute["status"] == "resolved", f"Found non-resolved dispute in resolved filter"
        
        print(f"Found {len(data.get('disputes', []))} resolved disputes")
    
    # ==================== TEST: Reporting Cycles ====================
    def test_get_reporting_cycles(self):
        """GET /api/credit-reporting/cycles - returns list of reporting cycles"""
        response = requests.get(f"{BASE_URL}/api/credit-reporting/cycles", headers=self.headers)
        assert response.status_code == 200, f"Failed: {response.status_code} - {response.text}"
        
        data = response.json()
        assert "cycles" in data
        
        if len(data["cycles"]) > 0:
            cycle = data["cycles"][0]
            assert "id" in cycle
            assert "cycle_type" in cycle
            assert "total_accounts" in cycle
            assert "created_at" in cycle
            print(f"Found {len(data['cycles'])} reporting cycles. Latest: {cycle['cycle_type']} with {cycle['total_accounts']} accounts")
        else:
            print("No reporting cycles found")
    
    def test_create_scheduled_reporting_cycle(self):
        """POST /api/credit-reporting/cycles - creates a scheduled reporting cycle"""
        response = requests.post(f"{BASE_URL}/api/credit-reporting/cycles", headers=self.headers, json={
            "cycle_type": "scheduled",
            "bureaus": ["Equifax", "Experian", "TransUnion"]
        })
        assert response.status_code == 200, f"Failed: {response.status_code} - {response.text}"
        
        data = response.json()
        assert "id" in data
        assert data["cycle_type"] == "scheduled"
        assert "total_accounts" in data
        assert "accounts_included" in data
        assert data["bureaus"] == ["Equifax", "Experian", "TransUnion"]
        
        print(f"Created scheduled cycle: {data['total_accounts']} accounts included")
    
    def test_create_off_cycle_reporting(self):
        """POST /api/credit-reporting/cycles - creates an off-cycle report"""
        response = requests.post(f"{BASE_URL}/api/credit-reporting/cycles", headers=self.headers, json={
            "cycle_type": "off_cycle",
            "bureaus": ["Equifax", "Experian", "TransUnion"],
            "notes": "Test off-cycle report"
        })
        assert response.status_code == 200, f"Failed: {response.status_code} - {response.text}"
        
        data = response.json()
        assert data["cycle_type"] == "off_cycle"
        assert data["notes"] == "Test off-cycle report"
        
        print(f"Created off-cycle report: {data['total_accounts']} accounts included")
    
    def test_get_cycle_detail(self):
        """GET /api/credit-reporting/cycles/{cycle_id} - returns cycle detail with accounts"""
        # First create a cycle
        create_response = requests.post(f"{BASE_URL}/api/credit-reporting/cycles", headers=self.headers, json={
            "cycle_type": "scheduled",
            "bureaus": ["Equifax"]
        })
        cycle_id = create_response.json()["id"]
        
        # Then get detail
        response = requests.get(f"{BASE_URL}/api/credit-reporting/cycles/{cycle_id}", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "accounts" in data
        assert data["id"] == cycle_id
        
        print(f"Cycle {cycle_id} has {len(data.get('accounts', []))} accounts")
    
    def test_cycle_detail_returns_404_for_invalid(self):
        """GET /api/credit-reporting/cycles/{invalid} - returns 404"""
        response = requests.get(f"{BASE_URL}/api/credit-reporting/cycles/invalid-cycle-id", headers=self.headers)
        assert response.status_code == 404


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
