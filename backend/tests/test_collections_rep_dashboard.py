"""
Test Collections Rep Dashboard and Payroll Commission Features
Tests: commission settings, rep-todos, commission-dashboard, payroll commission edit
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"


class TestAuth:
    """Authentication tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        # Login returns 'access_token' not 'token'
        token = data.get("access_token") or data.get("token")
        assert token, f"No token in response: {data}"
        return token
    
    def test_login_success(self, auth_token):
        """Verify login works and returns access_token"""
        assert auth_token is not None
        assert len(auth_token) > 10
        print(f"✓ Login successful, token length: {len(auth_token)}")


class TestCommissionSettings:
    """Commission settings endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        return data.get("access_token") or data.get("token")
    
    def test_get_commission_settings(self, auth_token):
        """GET /api/collections/settings returns commission settings with $350 collection fee and 20% base rate"""
        response = requests.get(
            f"{BASE_URL}/api/collections/settings",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify settings structure
        assert "settings" in data, f"No settings in response: {data}"
        settings = data["settings"]
        
        # Verify commission settings
        assert "commission" in settings, f"No commission in settings: {settings}"
        commission = settings["commission"]
        assert commission.get("base_rate") == 20, f"Expected base_rate 20, got {commission.get('base_rate')}"
        assert commission.get("collection_fee_amount") == 350.00, f"Expected collection_fee_amount 350, got {commission.get('collection_fee_amount')}"
        
        # Verify fees structure
        assert "fees" in settings, f"No fees in settings: {settings}"
        fees = settings["fees"]
        assert fees.get("collection_fee", {}).get("amount") == 350.00, f"Expected collection_fee amount 350, got {fees.get('collection_fee')}"
        
        print(f"✓ Commission settings: base_rate={commission.get('base_rate')}%, collection_fee=${commission.get('collection_fee_amount')}")
    
    def test_get_default_settings(self, auth_token):
        """GET /api/collections/settings/defaults returns default settings for reset"""
        response = requests.get(
            f"{BASE_URL}/api/collections/settings/defaults",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "settings" in data, f"No settings in response: {data}"
        settings = data["settings"]
        
        # Verify default values
        assert settings.get("commission", {}).get("base_rate") == 20
        assert settings.get("commission", {}).get("collection_fee_amount") == 350.00
        print("✓ Default settings returned correctly")
    
    def test_update_commission_settings(self, auth_token):
        """PUT /api/collections/settings updates commission settings (admin only)"""
        # First get current settings
        get_response = requests.get(
            f"{BASE_URL}/api/collections/settings",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert get_response.status_code == 200
        current_settings = get_response.json()["settings"]
        
        # Modify a setting
        modified_settings = current_settings.copy()
        modified_settings["commission"]["base_rate"] = 25  # Change from 20 to 25
        
        # Update settings
        update_response = requests.put(
            f"{BASE_URL}/api/collections/settings",
            headers={"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"},
            json={"settings": modified_settings}
        )
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        
        # Verify update
        verify_response = requests.get(
            f"{BASE_URL}/api/collections/settings",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert verify_response.status_code == 200
        updated_settings = verify_response.json()["settings"]
        assert updated_settings["commission"]["base_rate"] == 25, f"Update not persisted: {updated_settings}"
        
        # Restore original settings
        restore_response = requests.put(
            f"{BASE_URL}/api/collections/settings",
            headers={"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"},
            json={"settings": current_settings}
        )
        assert restore_response.status_code == 200
        print("✓ Commission settings update and restore successful")


class TestRepTodos:
    """Rep to-do endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        return data.get("access_token") or data.get("token")
    
    def test_get_rep_todos(self, auth_token):
        """GET /api/collections/rep-todos returns to-do items (compliance, payment follow-ups)"""
        response = requests.get(
            f"{BASE_URL}/api/collections/rep-todos",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "todos" in data, f"No todos in response: {data}"
        assert "total" in data, f"No total in response: {data}"
        assert "date" in data, f"No date in response: {data}"
        
        todos = data["todos"]
        assert isinstance(todos, list), f"todos should be a list: {type(todos)}"
        
        # If there are todos, verify structure
        if len(todos) > 0:
            todo = todos[0]
            assert "type" in todo, f"No type in todo: {todo}"
            assert todo["type"] in ["compliance", "payment_followup"], f"Invalid todo type: {todo['type']}"
            
            if todo["type"] == "compliance":
                assert "calls" in todo, f"No calls in compliance todo: {todo}"
                assert "texts" in todo, f"No texts in compliance todo: {todo}"
                assert "emails" in todo, f"No emails in compliance todo: {todo}"
        
        print(f"✓ Rep todos returned: {data['total']} items for date {data['date']}")


class TestCommissionDashboard:
    """Commission dashboard endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        return data.get("access_token") or data.get("token")
    
    def test_get_commission_dashboard(self, auth_token):
        """GET /api/collections/commission-dashboard returns earnings summary"""
        response = requests.get(
            f"{BASE_URL}/api/collections/commission-dashboard",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify summary structure
        assert "summary" in data, f"No summary in response: {data}"
        summary = data["summary"]
        
        # Verify required summary fields
        required_fields = ["total_earned", "total_pending", "total_projected", "collection_fee_earned"]
        for field in required_fields:
            assert field in summary, f"Missing field {field} in summary: {summary}"
        
        # Verify trackers
        assert "trackers" in data, f"No trackers in response: {data}"
        assert isinstance(data["trackers"], list), f"trackers should be a list"
        
        # Verify commissions
        assert "commissions" in data, f"No commissions in response: {data}"
        assert isinstance(data["commissions"], list), f"commissions should be a list"
        
        print(f"✓ Commission dashboard: total_earned=${summary['total_earned']}, pending=${summary['total_pending']}, projected=${summary['total_projected']}")


class TestPayrollCommissions:
    """Payroll commissions endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        return data.get("access_token") or data.get("token")
    
    def test_get_payroll_commissions(self, auth_token):
        """GET /api/payroll/commissions returns list with edit support"""
        response = requests.get(
            f"{BASE_URL}/api/payroll/commissions",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "commissions" in data, f"No commissions in response: {data}"
        assert "total_commission" in data, f"No total_commission in response: {data}"
        
        commissions = data["commissions"]
        assert isinstance(commissions, list), f"commissions should be a list"
        
        print(f"✓ Payroll commissions: {len(commissions)} entries, total=${data['total_commission']}")
        return commissions
    
    def test_create_and_edit_commission(self, auth_token):
        """PUT /api/payroll/commissions/{id} allows manager to edit commission amount, status, description"""
        # First create a test commission
        create_response = requests.post(
            f"{BASE_URL}/api/payroll/commissions",
            headers={"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"},
            json={
                "employee_id": "TEST_employee_123",
                "employee_name": "TEST Commission Employee",
                "account_id": "TEST_account_456",
                "account_name": "TEST Account",
                "amount_collected": 1000.00,
                "commission_rate": 20,
                "commission_amount": 200.00,
                "description": "TEST commission entry",
                "date": "2026-01-15"
            }
        )
        assert create_response.status_code == 200, f"Create failed: {create_response.text}"
        created = create_response.json()
        commission_id = created.get("id")
        assert commission_id, f"No id in created commission: {created}"
        
        # Edit the commission
        edit_response = requests.put(
            f"{BASE_URL}/api/payroll/commissions/{commission_id}",
            headers={"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"},
            json={
                "commission_amount": 250.00,
                "status": "approved",
                "description": "TEST commission entry - EDITED"
            }
        )
        assert edit_response.status_code == 200, f"Edit failed: {edit_response.text}"
        
        # Verify edit by getting commissions list
        verify_response = requests.get(
            f"{BASE_URL}/api/payroll/commissions",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert verify_response.status_code == 200
        commissions = verify_response.json()["commissions"]
        
        # Find our edited commission
        edited = next((c for c in commissions if c.get("id") == commission_id), None)
        assert edited, f"Could not find edited commission {commission_id}"
        assert edited.get("commission_amount") == 250.00, f"Commission amount not updated: {edited}"
        assert edited.get("status") == "approved", f"Status not updated: {edited}"
        assert "EDITED" in edited.get("description", ""), f"Description not updated: {edited}"
        
        print(f"✓ Commission edit successful: id={commission_id}, amount=${edited['commission_amount']}, status={edited['status']}")


class TestCollectionsAccounts:
    """Collections accounts endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        return data.get("access_token") or data.get("token")
    
    def test_get_collections_accounts(self, auth_token):
        """GET /api/collections/accounts returns accounts list"""
        response = requests.get(
            f"{BASE_URL}/api/collections/accounts?limit=10",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "accounts" in data, f"No accounts in response: {data}"
        assert "total" in data, f"No total in response: {data}"
        
        accounts = data["accounts"]
        assert isinstance(accounts, list), f"accounts should be a list"
        
        print(f"✓ Collections accounts: {len(accounts)} returned, total={data['total']}")


class TestUnauthorizedAccess:
    """Test unauthorized access to protected endpoints"""
    
    def test_settings_requires_auth(self):
        """Settings endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/collections/settings")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Settings endpoint properly requires authentication")
    
    def test_rep_todos_requires_auth(self):
        """Rep todos endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/collections/rep-todos")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Rep todos endpoint properly requires authentication")
    
    def test_commission_dashboard_requires_auth(self):
        """Commission dashboard endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/collections/commission-dashboard")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Commission dashboard endpoint properly requires authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
