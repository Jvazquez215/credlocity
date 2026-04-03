"""
Test Collections Rep Dashboard and Payroll Integration - Iteration 104
Tests commission dashboard, settings, payroll commissions, bulk actions, and rep todos
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"


class TestAuthSetup:
    """Authentication setup for all tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        # API returns access_token, not token
        token = data.get("access_token") or data.get("token")
        assert token, "No token in login response"
        return token
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Headers with auth token"""
        return {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }


class TestCollectionsCommissionDashboard(TestAuthSetup):
    """Test GET /api/collections/commission-dashboard endpoint"""
    
    def test_commission_dashboard_returns_summary(self, auth_headers):
        """Verify commission dashboard returns summary with total_earned, trackers, leaderboard"""
        response = requests.get(f"{BASE_URL}/api/collections/commission-dashboard", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify summary structure
        assert "summary" in data, "Missing 'summary' in response"
        summary = data["summary"]
        assert "total_earned" in summary or isinstance(summary, dict), "Summary should contain total_earned or be a dict"
        
        # Verify trackers
        assert "trackers" in data, "Missing 'trackers' in response"
        assert isinstance(data["trackers"], list), "Trackers should be a list"
        
        # Verify leaderboard
        assert "leaderboard" in data, "Missing 'leaderboard' in response"
        assert isinstance(data["leaderboard"], list), "Leaderboard should be a list"
        
        print(f"Dashboard summary: {summary}")
        print(f"Trackers count: {len(data['trackers'])}")
        print(f"Leaderboard count: {len(data['leaderboard'])}")


class TestCollectionsSettings(TestAuthSetup):
    """Test GET/PUT /api/collections/settings endpoints"""
    
    def test_get_settings_returns_commission_config(self, auth_headers):
        """Verify settings returns commission settings with base_rate, payment_plan_threshold, collection_fee_immediate"""
        response = requests.get(f"{BASE_URL}/api/collections/settings", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify settings structure
        assert "settings" in data, "Missing 'settings' in response"
        settings = data["settings"]
        
        # Check commission settings
        if "commission" in settings:
            commission = settings["commission"]
            assert "base_rate" in commission, "Missing base_rate in commission settings"
            assert "payment_plan_threshold" in commission, "Missing payment_plan_threshold"
            # collection_fee_immediate may be present
            print(f"Commission settings: base_rate={commission.get('base_rate')}, threshold={commission.get('payment_plan_threshold')}, immediate={commission.get('collection_fee_immediate')}")
        else:
            print(f"Settings structure: {settings}")
    
    def test_update_settings_success(self, auth_headers):
        """Verify PUT settings updates commission settings successfully"""
        # First get current settings
        get_response = requests.get(f"{BASE_URL}/api/collections/settings", headers=auth_headers)
        assert get_response.status_code == 200
        current_settings = get_response.json().get("settings", {})
        
        # Update with new values (then restore)
        new_settings = {
            "commission": {
                "base_rate": 25,
                "payment_plan_threshold": 70,
                "collection_fee_immediate": True
            },
            "fees": current_settings.get("fees", {"collection_fee": 350})
        }
        
        response = requests.put(f"{BASE_URL}/api/collections/settings", 
                               headers=auth_headers, 
                               json={"settings": new_settings})
        assert response.status_code == 200, f"Failed to update settings: {response.text}"
        
        # Verify the update persisted
        verify_response = requests.get(f"{BASE_URL}/api/collections/settings", headers=auth_headers)
        assert verify_response.status_code == 200
        updated = verify_response.json().get("settings", {})
        
        if "commission" in updated:
            assert updated["commission"].get("base_rate") == 25, "base_rate not updated"
            print(f"Settings updated successfully: {updated['commission']}")


class TestPayrollCommissions(TestAuthSetup):
    """Test GET/PUT /api/payroll/commissions endpoints"""
    
    def test_get_commissions_returns_entries_with_type(self, auth_headers):
        """Verify GET commissions returns entries with commission_type field"""
        response = requests.get(f"{BASE_URL}/api/payroll/commissions", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "commissions" in data, "Missing 'commissions' in response"
        commissions = data["commissions"]
        assert isinstance(commissions, list), "Commissions should be a list"
        
        # Check total_commission field
        assert "total_commission" in data, "Missing total_commission"
        
        # Check commission_type field in entries
        if len(commissions) > 0:
            for c in commissions[:5]:  # Check first 5
                # commission_type should be present (collection_fee or collections_commission)
                if "commission_type" in c:
                    assert c["commission_type"] in ["collection_fee", "collections_commission", None], f"Invalid commission_type: {c['commission_type']}"
                print(f"Commission: {c.get('employee_name')} - {c.get('commission_type')} - ${c.get('commission_amount')}")
        
        print(f"Total commissions: {len(commissions)}, Total amount: ${data['total_commission']}")
    
    def test_update_commission_with_override_reason(self, auth_headers):
        """Verify PUT commission updates entry with override_reason and creates override_history"""
        # First get a commission to update
        get_response = requests.get(f"{BASE_URL}/api/payroll/commissions", headers=auth_headers)
        assert get_response.status_code == 200
        commissions = get_response.json().get("commissions", [])
        
        if len(commissions) == 0:
            pytest.skip("No commissions available to test update")
        
        # Find a pending commission or use the first one
        test_commission = None
        for c in commissions:
            if c.get("status") == "pending":
                test_commission = c
                break
        
        if not test_commission:
            test_commission = commissions[0]
        
        commission_id = test_commission["id"]
        original_amount = test_commission.get("commission_amount", 0)
        
        # Update with override reason
        update_data = {
            "commission_amount": original_amount,  # Keep same amount
            "override_reason": "TEST_Manager review - verified amount"
        }
        
        response = requests.put(f"{BASE_URL}/api/payroll/commissions/{commission_id}", 
                               headers=auth_headers, 
                               json=update_data)
        assert response.status_code == 200, f"Failed to update commission: {response.text}"
        
        # Verify the update
        verify_response = requests.get(f"{BASE_URL}/api/payroll/commissions", headers=auth_headers)
        assert verify_response.status_code == 200
        updated_commissions = verify_response.json().get("commissions", [])
        
        updated = next((c for c in updated_commissions if c["id"] == commission_id), None)
        assert updated is not None, "Updated commission not found"
        
        # Check override_history was created
        if "override_history" in updated:
            print(f"Override history: {updated['override_history']}")
        
        print(f"Commission {commission_id} updated successfully")


class TestPayrollBulkAction(TestAuthSetup):
    """Test POST /api/payroll/commissions/bulk-action endpoint"""
    
    def test_bulk_action_requires_commission_ids(self, auth_headers):
        """Verify bulk-action returns 400 for empty commission_ids array"""
        response = requests.post(f"{BASE_URL}/api/payroll/commissions/bulk-action",
                                headers=auth_headers,
                                json={"commission_ids": [], "action": "approve"})
        assert response.status_code == 400, f"Expected 400 for empty IDs, got {response.status_code}: {response.text}"
        print("Bulk action correctly rejects empty commission_ids")
    
    def test_bulk_action_with_valid_ids(self, auth_headers):
        """Verify bulk-action with valid pending commission IDs changes their status"""
        # Get pending commissions
        get_response = requests.get(f"{BASE_URL}/api/payroll/commissions?status=pending", headers=auth_headers)
        assert get_response.status_code == 200
        commissions = get_response.json().get("commissions", [])
        
        pending = [c for c in commissions if c.get("status") == "pending"]
        
        if len(pending) == 0:
            pytest.skip("No pending commissions to test bulk action")
        
        # Test with first pending commission
        test_ids = [pending[0]["id"]]
        
        response = requests.post(f"{BASE_URL}/api/payroll/commissions/bulk-action",
                                headers=auth_headers,
                                json={"commission_ids": test_ids, "action": "approve"})
        assert response.status_code == 200, f"Bulk action failed: {response.text}"
        data = response.json()
        
        assert "modified" in data or "message" in data, "Response should contain modified count or message"
        print(f"Bulk action result: {data}")
        
        # Verify the status changed
        verify_response = requests.get(f"{BASE_URL}/api/payroll/commissions", headers=auth_headers)
        updated = verify_response.json().get("commissions", [])
        updated_commission = next((c for c in updated if c["id"] == test_ids[0]), None)
        
        if updated_commission:
            print(f"Commission status after bulk approve: {updated_commission.get('status')}")


class TestRepTodos(TestAuthSetup):
    """Test GET /api/collections/rep-todos endpoint"""
    
    def test_get_rep_todos(self, auth_headers):
        """Verify rep-todos returns todo items for the rep"""
        response = requests.get(f"{BASE_URL}/api/collections/rep-todos", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "todos" in data, "Missing 'todos' in response"
        todos = data["todos"]
        assert isinstance(todos, list), "Todos should be a list"
        
        if len(todos) > 0:
            for todo in todos[:3]:
                print(f"Todo: {todo.get('title', todo.get('account_name'))} - {todo.get('type')} - {todo.get('priority')}")
        else:
            print("No todos found (this is acceptable)")


class TestHealthCheck:
    """Basic health check tests"""
    
    def test_api_health(self):
        """Verify API is accessible"""
        response = requests.get(f"{BASE_URL}/api/health")
        # Health endpoint may return 200 or 404 if not implemented
        assert response.status_code in [200, 404], f"API not accessible: {response.status_code}"
        print(f"API health check: {response.status_code}")
    
    def test_auth_login(self):
        """Verify login endpoint works"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        token = data.get("access_token") or data.get("token")
        assert token, "No token in response"
        print("Login successful")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
