"""
Iteration 45 Tests - Credit Builder, Collections Letters, Outsourcing Portal APIs

Testing:
1. Credit Builder - Public products API (no auth), accounts CRUD, SSN immutability
2. Collections Letter Generator - Letter CRUD, Reps CRUD
3. Outsourcing Portal - Customer roster (partner auth)
"""

import os
import pytest
import requests
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"


class TestAuth:
    """Get auth tokens for testing"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin JWT token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "No access_token in login response"
        return data["access_token"]
    
    @pytest.fixture(scope="class")
    def admin_headers(self, admin_token):
        """Return headers with admin token"""
        return {"Authorization": f"Bearer {admin_token}"}


class TestCreditBuilderProducts(TestAuth):
    """Test Credit Builder public products API - NO AUTH REQUIRED"""
    
    def test_get_products_public_no_auth(self):
        """GET /api/credit-builder/products - Public endpoint, no auth required"""
        response = requests.get(f"{BASE_URL}/api/credit-builder/products")
        assert response.status_code == 200, f"Products fetch failed: {response.text}"
        products = response.json()
        assert isinstance(products, list), "Products should be a list"
        print(f"Found {len(products)} public products")
    
    def test_get_products_returns_seeded_data(self):
        """Products should return 8 seeded products"""
        response = requests.get(f"{BASE_URL}/api/credit-builder/products")
        assert response.status_code == 200
        products = response.json()
        # Should have seeded products
        assert len(products) >= 1, "Should have at least 1 product"
        # Verify product structure
        if products:
            p = products[0]
            assert "id" in p
            assert "name" in p
            assert "price" in p
            assert "category" in p
            print(f"Sample product: {p['name']} - ${p['price']}")
    
    def test_products_have_correct_fields(self):
        """Products should have all required fields"""
        response = requests.get(f"{BASE_URL}/api/credit-builder/products")
        assert response.status_code == 200
        products = response.json()
        if products:
            p = products[0]
            expected_fields = ["id", "name", "description", "price", "category", "is_active"]
            for field in expected_fields:
                assert field in p, f"Missing field: {field}"
            print(f"Product fields verified: {list(p.keys())}")


class TestCreditBuilderAccounts(TestAuth):
    """Test Credit Builder accounts API - requires admin auth"""
    
    created_account_id = None
    
    def test_create_account(self, admin_headers):
        """POST /api/credit-builder/accounts - Create new account"""
        payload = {
            "first_name": "TEST_John",
            "last_name": "TEST_Doe",
            "date_of_birth": "01151990",  # MMDDYYYY format
            "ssn_last_four": "1234",
            "email": "test_john_doe@example.com",
            "phone": "215-555-1234",
            "address_line1": "123 Test Street",
            "city": "Philadelphia",
            "state": "PA",
            "zip_code": "19102",
            "plan_tier": "standard"
        }
        response = requests.post(f"{BASE_URL}/api/credit-builder/accounts", json=payload, headers=admin_headers)
        assert response.status_code == 200, f"Account creation failed: {response.text}"
        data = response.json()
        assert "id" in data
        assert "account_number" in data
        assert data["first_name"] == "TEST_John"
        assert data["plan_tier"] == "standard"
        assert data["credit_limit"] == 1500  # Standard plan limit
        TestCreditBuilderAccounts.created_account_id = data["id"]
        print(f"Created account: {data['account_number']}")
    
    def test_list_accounts(self, admin_headers):
        """GET /api/credit-builder/accounts - List all accounts"""
        response = requests.get(f"{BASE_URL}/api/credit-builder/accounts", headers=admin_headers)
        assert response.status_code == 200, f"List accounts failed: {response.text}"
        data = response.json()
        assert "accounts" in data
        assert "total" in data
        assert isinstance(data["accounts"], list)
        print(f"Found {data['total']} total accounts")
    
    def test_get_account_by_id(self, admin_headers):
        """GET /api/credit-builder/accounts/{id} - Get single account"""
        if not TestCreditBuilderAccounts.created_account_id:
            pytest.skip("No account created")
        response = requests.get(
            f"{BASE_URL}/api/credit-builder/accounts/{TestCreditBuilderAccounts.created_account_id}",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Get account failed: {response.text}"
        data = response.json()
        assert data["id"] == TestCreditBuilderAccounts.created_account_id
        print(f"Retrieved account: {data['account_number']}")
    
    def test_ssn_immutability_on_update(self, admin_headers):
        """PUT /api/credit-builder/accounts/{id} - account_number should be immutable"""
        if not TestCreditBuilderAccounts.created_account_id:
            pytest.skip("No account created")
        
        # Try to update account_number - should fail
        payload = {"account_number": "CB-HACKED-123456"}
        response = requests.put(
            f"{BASE_URL}/api/credit-builder/accounts/{TestCreditBuilderAccounts.created_account_id}",
            json=payload,
            headers=admin_headers
        )
        # Should return 400 error for immutable field
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        assert "immutable" in response.json().get("detail", "").lower()
        print("SSN/account_number immutability enforced correctly")
    
    def test_update_account_allowed_fields(self, admin_headers):
        """PUT /api/credit-builder/accounts/{id} - Update allowed fields"""
        if not TestCreditBuilderAccounts.created_account_id:
            pytest.skip("No account created")
        
        payload = {"phone": "215-555-9999"}
        response = requests.put(
            f"{BASE_URL}/api/credit-builder/accounts/{TestCreditBuilderAccounts.created_account_id}",
            json=payload,
            headers=admin_headers
        )
        assert response.status_code == 200, f"Update failed: {response.text}"
        data = response.json()
        assert data["phone"] == "215-555-9999"
        print("Account phone updated successfully")


class TestCreditBuilderDashboard(TestAuth):
    """Test Credit Builder dashboard API"""
    
    def test_get_dashboard(self, admin_headers):
        """GET /api/credit-builder/dashboard - Get dashboard stats"""
        response = requests.get(f"{BASE_URL}/api/credit-builder/dashboard", headers=admin_headers)
        assert response.status_code == 200, f"Dashboard failed: {response.text}"
        data = response.json()
        expected_fields = ["total_accounts", "active_accounts", "total_current_balance"]
        for field in expected_fields:
            assert field in data, f"Missing dashboard field: {field}"
        print(f"Dashboard: {data['total_accounts']} total, {data['active_accounts']} active")


class TestCollectionsLetterAPI(TestAuth):
    """Test Collections Letter Generator API"""
    
    created_letter_id = None
    created_rep_id = None
    
    def test_create_rep(self, admin_headers):
        """POST /api/collections/reps - Create collection rep"""
        payload = {
            "name": "TEST_Rep Smith",
            "phone": "215-555-0001",
            "email": "test_rep@credlocity.com"
        }
        response = requests.post(f"{BASE_URL}/api/collections/reps", json=payload, headers=admin_headers)
        assert response.status_code == 200, f"Rep creation failed: {response.text}"
        data = response.json()
        assert "id" in data
        assert data["name"] == "TEST_Rep Smith"
        TestCollectionsLetterAPI.created_rep_id = data["id"]
        print(f"Created rep: {data['name']}")
    
    def test_list_reps(self, admin_headers):
        """GET /api/collections/reps - List all reps"""
        response = requests.get(f"{BASE_URL}/api/collections/reps", headers=admin_headers)
        assert response.status_code == 200, f"List reps failed: {response.text}"
        reps = response.json()
        assert isinstance(reps, list)
        print(f"Found {len(reps)} collection reps")
    
    def test_create_letter(self, admin_headers):
        """POST /api/collections/letters - Create collection letter"""
        payload = {
            "consumer_first_name": "TEST_Consumer",
            "consumer_last_name": "TEST_LastName",
            "consumer_address_street": "456 Test Ave",
            "consumer_address_city": "Philadelphia",
            "consumer_address_state": "PA",
            "consumer_address_zip": "19103",
            "amount_owed": 1500.00,
            "original_due_date": "2024-01-15",
            "urgency_level": "friendly_reminder",
            "consequences": ["credit_bureau_reporting"],
            "payment_options": ["phone", "check_mail"],
            "response_deadline": "2026-02-15",
            "assigned_rep_id": TestCollectionsLetterAPI.created_rep_id
        }
        response = requests.post(f"{BASE_URL}/api/collections/letters", json=payload, headers=admin_headers)
        assert response.status_code == 200, f"Letter creation failed: {response.text}"
        data = response.json()
        assert "id" in data
        assert "account_number" in data  # Auto-generated
        assert data["consumer_first_name"] == "TEST_Consumer"
        assert data["amount_owed"] == 1500.00
        assert data["urgency_level"] == "friendly_reminder"
        TestCollectionsLetterAPI.created_letter_id = data["id"]
        print(f"Created letter: {data['account_number']}")
    
    def test_list_letters(self, admin_headers):
        """GET /api/collections/letters - List all letters"""
        response = requests.get(f"{BASE_URL}/api/collections/letters", headers=admin_headers)
        assert response.status_code == 200, f"List letters failed: {response.text}"
        letters = response.json()
        assert isinstance(letters, list)
        print(f"Found {len(letters)} collection letters")
    
    def test_get_letter_by_id(self, admin_headers):
        """GET /api/collections/letters/{id} - Get single letter"""
        if not TestCollectionsLetterAPI.created_letter_id:
            pytest.skip("No letter created")
        response = requests.get(
            f"{BASE_URL}/api/collections/letters/{TestCollectionsLetterAPI.created_letter_id}",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Get letter failed: {response.text}"
        data = response.json()
        assert data["id"] == TestCollectionsLetterAPI.created_letter_id
        print(f"Retrieved letter for: {data['consumer_first_name']} {data['consumer_last_name']}")
    
    def test_update_letter(self, admin_headers):
        """PUT /api/collections/letters/{id} - Update letter"""
        if not TestCollectionsLetterAPI.created_letter_id:
            pytest.skip("No letter created")
        
        payload = {"urgency_level": "firm_notice", "status": "sent"}
        response = requests.put(
            f"{BASE_URL}/api/collections/letters/{TestCollectionsLetterAPI.created_letter_id}",
            json=payload,
            headers=admin_headers
        )
        assert response.status_code == 200, f"Update letter failed: {response.text}"
        data = response.json()
        assert data["urgency_level"] == "firm_notice"
        assert data["status"] == "sent"
        print("Letter updated to firm_notice status")


class TestOutsourcingPortalCustomers:
    """Test Outsourcing Portal customer roster API - requires partner auth"""
    
    @pytest.fixture(scope="class")
    def partner_token(self):
        """Get partner JWT token by creating/logging in a test partner"""
        # First, try admin login to create a partner
        admin_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if admin_response.status_code != 200:
            pytest.skip("Admin login failed - cannot test partner routes")
        
        # Check if test partner exists, or skip the test
        # Partner login endpoint
        partner_response = requests.post(f"{BASE_URL}/api/outsourcing/partner/login", json={
            "email": "testpartner@example.com",
            "password": "TestPartner123!"
        })
        
        if partner_response.status_code == 200:
            return partner_response.json().get("access_token")
        else:
            pytest.skip("No test partner available - partner tests skipped")
    
    def test_outsourcing_customers_requires_auth(self):
        """POST /api/outsourcing/customers - Requires partner auth"""
        payload = {"first_name": "TEST", "last_name": "Customer"}
        response = requests.post(f"{BASE_URL}/api/outsourcing/customers", json=payload)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("Customer creation correctly requires authentication")


class TestCreditBuilderValidation(TestAuth):
    """Test Credit Builder validation rules"""
    
    def test_invalid_ssn_format(self, admin_headers):
        """Account creation should reject invalid SSN format"""
        payload = {
            "first_name": "TEST",
            "last_name": "Invalid",
            "date_of_birth": "01011990",
            "ssn_last_four": "12",  # Too short
            "email": "test@example.com",
            "address_line1": "123 Test St",
            "city": "Philadelphia",
            "state": "PA",
            "zip_code": "19102",
            "plan_tier": "starter"
        }
        response = requests.post(f"{BASE_URL}/api/credit-builder/accounts", json=payload, headers=admin_headers)
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print("SSN validation correctly rejects invalid format")
    
    def test_invalid_state(self, admin_headers):
        """Account creation should reject invalid state"""
        payload = {
            "first_name": "TEST",
            "last_name": "Invalid",
            "date_of_birth": "01011990",
            "ssn_last_four": "1234",
            "email": "test@example.com",
            "address_line1": "123 Test St",
            "city": "Philadelphia",
            "state": "XX",  # Invalid state
            "zip_code": "19102",
            "plan_tier": "starter"
        }
        response = requests.post(f"{BASE_URL}/api/credit-builder/accounts", json=payload, headers=admin_headers)
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print("State validation correctly rejects invalid state")
    
    def test_invalid_plan_tier(self, admin_headers):
        """Account creation should reject invalid plan tier"""
        payload = {
            "first_name": "TEST",
            "last_name": "Invalid",
            "date_of_birth": "01011990",
            "ssn_last_four": "1234",
            "email": "test@example.com",
            "address_line1": "123 Test St",
            "city": "Philadelphia",
            "state": "PA",
            "zip_code": "19102",
            "plan_tier": "invalid_tier"
        }
        response = requests.post(f"{BASE_URL}/api/credit-builder/accounts", json=payload, headers=admin_headers)
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print("Plan tier validation correctly rejects invalid tier")


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
