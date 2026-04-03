"""
Test Credit Management System for Outsourcing Portal
Tests: Credit settings, credit purchases, credit deduction on rounds, credit info/estimates
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"
PARTNER_EMAIL = "admin@credlocity.com"
PARTNER_PASSWORD = "Credit123!"
TEST_PARTNER_CRM_ID = "176200b3-5e59-4ecd-be5e-d58fa531afd5"


class TestAdminAuth:
    """Get admin token for subsequent tests"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Login as admin and get token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "No access_token in admin login response"
        return data["access_token"]
    
    def test_admin_login(self, admin_token):
        """Verify admin login works"""
        assert admin_token is not None
        assert len(admin_token) > 0
        print(f"Admin token obtained successfully")


class TestPartnerAuth:
    """Get partner token for subsequent tests"""
    
    @pytest.fixture(scope="class")
    def partner_token(self):
        """Login as partner and get token"""
        response = requests.post(f"{BASE_URL}/api/outsourcing/partner/login", json={
            "email": PARTNER_EMAIL,
            "password": PARTNER_PASSWORD
        })
        assert response.status_code == 200, f"Partner login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token in partner login response"
        return data["token"]
    
    def test_partner_login(self, partner_token):
        """Verify partner login works"""
        assert partner_token is not None
        assert len(partner_token) > 0
        print(f"Partner token obtained successfully")


class TestAdminCreditSettings:
    """Test admin credit settings endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json().get("access_token")
    
    def test_get_credit_settings(self, admin_token):
        """GET /api/outsourcing/admin/partners/{id}/credit-settings"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_CRM_ID}/credit-settings",
            headers=headers
        )
        assert response.status_code == 200, f"Failed to get credit settings: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "price_per_credit" in data, "Missing price_per_credit"
        assert "credit_balance" in data, "Missing credit_balance"
        assert "active_customers" in data, "Missing active_customers"
        assert "credits_needed_next_round" in data, "Missing credits_needed_next_round"
        assert "cost_next_round" in data, "Missing cost_next_round"
        assert "credit_rates" in data, "Missing credit_rates"
        
        # Verify credit rates structure
        rates = data["credit_rates"]
        assert rates.get("bureau") == 1.0, "Bureau rate should be 1.0"
        assert rates.get("collection_agency") == 1.0, "Collection agency rate should be 1.0"
        assert rates.get("creditor") == 0.5, "Creditor rate should be 0.5"
        
        print(f"Credit settings: balance={data['credit_balance']}, price=${data['price_per_credit']}, active_customers={data['active_customers']}")
    
    def test_update_credit_price(self, admin_token):
        """PUT /api/outsourcing/admin/partners/{id}/credit-settings - Update price per credit"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Get current price
        get_response = requests.get(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_CRM_ID}/credit-settings",
            headers=headers
        )
        original_price = get_response.json().get("price_per_credit", 30.0)
        
        # Update to new price
        new_price = 35.00
        response = requests.put(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_CRM_ID}/credit-settings",
            headers=headers,
            json={"price_per_credit": new_price}
        )
        assert response.status_code == 200, f"Failed to update credit price: {response.text}"
        data = response.json()
        assert data.get("price_per_credit") == new_price, "Price not updated correctly"
        
        # Verify the change persisted
        verify_response = requests.get(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_CRM_ID}/credit-settings",
            headers=headers
        )
        assert verify_response.json().get("price_per_credit") == new_price
        
        # Restore original price
        requests.put(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_CRM_ID}/credit-settings",
            headers=headers,
            json={"price_per_credit": original_price}
        )
        print(f"Credit price updated from ${original_price} to ${new_price} and restored")
    
    def test_update_credit_price_negative_rejected(self, admin_token):
        """PUT /api/outsourcing/admin/partners/{id}/credit-settings - Reject negative price"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.put(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_CRM_ID}/credit-settings",
            headers=headers,
            json={"price_per_credit": -10.0}
        )
        assert response.status_code == 400, "Should reject negative price"
        print("Negative price correctly rejected")


class TestAdminCreditPurchases:
    """Test admin credit purchase endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json().get("access_token")
    
    def test_add_credits(self, admin_token):
        """POST /api/outsourcing/admin/partners/{id}/credits/purchase - Add credits after payment"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Get current balance
        settings_response = requests.get(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_CRM_ID}/credit-settings",
            headers=headers
        )
        original_balance = settings_response.json().get("credit_balance", 0)
        
        # Add credits
        credits_to_add = 10
        response = requests.post(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_CRM_ID}/credits/purchase",
            headers=headers,
            json={
                "credits": credits_to_add,
                "payment_amount": 300.00,
                "payment_method": "ACH",
                "notes": "TEST_credit_purchase_pytest"
            }
        )
        assert response.status_code == 200, f"Failed to add credits: {response.text}"
        data = response.json()
        
        assert "message" in data, "Missing message in response"
        assert "new_balance" in data, "Missing new_balance in response"
        assert "purchase_id" in data, "Missing purchase_id in response"
        assert data["new_balance"] == original_balance + credits_to_add, "Balance not updated correctly"
        
        print(f"Added {credits_to_add} credits. New balance: {data['new_balance']}")
        return data["purchase_id"]
    
    def test_add_credits_zero_rejected(self, admin_token):
        """POST /api/outsourcing/admin/partners/{id}/credits/purchase - Reject zero credits"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.post(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_CRM_ID}/credits/purchase",
            headers=headers,
            json={"credits": 0, "payment_amount": 0}
        )
        assert response.status_code == 400, "Should reject zero credits"
        print("Zero credits correctly rejected")
    
    def test_get_credit_purchase_history(self, admin_token):
        """GET /api/outsourcing/admin/partners/{id}/credits/history"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_CRM_ID}/credits/history",
            headers=headers
        )
        assert response.status_code == 200, f"Failed to get credit history: {response.text}"
        data = response.json()
        
        assert isinstance(data, list), "History should be a list"
        if len(data) > 0:
            purchase = data[0]
            assert "id" in purchase, "Missing id in purchase"
            assert "credits_added" in purchase, "Missing credits_added"
            assert "payment_amount" in purchase, "Missing payment_amount"
            assert "created_at" in purchase, "Missing created_at"
            print(f"Found {len(data)} credit purchases in history")
        else:
            print("No credit purchases in history yet")


class TestRoundCreationWithCredits:
    """Test round creation with credit deduction"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json().get("access_token")
    
    @pytest.fixture(scope="class")
    def partner_token(self):
        response = requests.post(f"{BASE_URL}/api/outsourcing/partner/login", json={
            "email": PARTNER_EMAIL,
            "password": PARTNER_PASSWORD
        })
        return response.json().get("token")
    
    def test_get_customer_for_round_test(self, partner_token):
        """Get a customer ID for round testing"""
        headers = {"Authorization": f"Bearer {partner_token}"}
        response = requests.get(f"{BASE_URL}/api/outsourcing/customers", headers=headers)
        assert response.status_code == 200
        customers = response.json()
        assert len(customers) > 0, "No customers found for testing"
        return customers[0]["id"]
    
    def test_create_bureau_round_deducts_1_credit(self, admin_token, partner_token):
        """POST /api/outsourcing/customers/{id}/rounds - Bureau round deducts 1 credit"""
        # Get customer
        partner_headers = {"Authorization": f"Bearer {partner_token}"}
        customers_response = requests.get(f"{BASE_URL}/api/outsourcing/customers", headers=partner_headers)
        customers = customers_response.json()
        if not customers:
            pytest.skip("No customers available for testing")
        customer_id = customers[0]["id"]
        
        # Get current balance
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        settings_response = requests.get(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_CRM_ID}/credit-settings",
            headers=admin_headers
        )
        original_balance = settings_response.json().get("credit_balance", 0)
        
        if original_balance < 1:
            # Add credits first
            requests.post(
                f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_CRM_ID}/credits/purchase",
                headers=admin_headers,
                json={"credits": 10, "payment_amount": 300}
            )
            settings_response = requests.get(
                f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_CRM_ID}/credit-settings",
                headers=admin_headers
            )
            original_balance = settings_response.json().get("credit_balance", 0)
        
        # Create bureau round
        response = requests.post(
            f"{BASE_URL}/api/outsourcing/customers/{customer_id}/rounds",
            headers=admin_headers,
            json={
                "letter_type": "bureau",
                "admin_notes": "TEST_bureau_round_pytest"
            }
        )
        assert response.status_code == 200, f"Failed to create bureau round: {response.text}"
        data = response.json()
        
        assert data.get("letter_type") == "bureau", "Letter type should be bureau"
        assert data.get("credit_deducted") == 1.0, "Bureau round should deduct 1 credit"
        assert data.get("letter_count") == 3, "Bureau should have 3 letters (EQ, EX, TU)"
        
        # Verify balance decreased
        new_settings = requests.get(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_CRM_ID}/credit-settings",
            headers=admin_headers
        ).json()
        assert new_settings["credit_balance"] == original_balance - 1, "Balance should decrease by 1"
        
        print(f"Bureau round created. Credit deducted: 1. Balance: {original_balance} -> {new_settings['credit_balance']}")
    
    def test_create_collection_agency_round_deducts_per_letter(self, admin_token, partner_token):
        """POST /api/outsourcing/customers/{id}/rounds - Collection agency deducts 1 credit per letter"""
        partner_headers = {"Authorization": f"Bearer {partner_token}"}
        customers_response = requests.get(f"{BASE_URL}/api/outsourcing/customers", headers=partner_headers)
        customers = customers_response.json()
        if not customers:
            pytest.skip("No customers available for testing")
        customer_id = customers[0]["id"]
        
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Ensure enough credits
        requests.post(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_CRM_ID}/credits/purchase",
            headers=admin_headers,
            json={"credits": 10, "payment_amount": 300}
        )
        
        settings_response = requests.get(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_CRM_ID}/credit-settings",
            headers=admin_headers
        )
        original_balance = settings_response.json().get("credit_balance", 0)
        
        # Create collection agency round with 3 letters
        letter_count = 3
        response = requests.post(
            f"{BASE_URL}/api/outsourcing/customers/{customer_id}/rounds",
            headers=admin_headers,
            json={
                "letter_type": "collection_agency",
                "letter_count": letter_count,
                "admin_notes": "TEST_collection_agency_round_pytest"
            }
        )
        assert response.status_code == 200, f"Failed to create collection agency round: {response.text}"
        data = response.json()
        
        expected_credits = 1.0 * letter_count  # 1 credit per letter
        assert data.get("letter_type") == "collection_agency"
        assert data.get("credit_deducted") == expected_credits, f"Should deduct {expected_credits} credits"
        assert data.get("letter_count") == letter_count
        
        # Verify balance
        new_settings = requests.get(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_CRM_ID}/credit-settings",
            headers=admin_headers
        ).json()
        assert new_settings["credit_balance"] == original_balance - expected_credits
        
        print(f"Collection agency round: {letter_count} letters = {expected_credits} credits deducted")
    
    def test_create_creditor_round_deducts_half_credit_per_letter(self, admin_token, partner_token):
        """POST /api/outsourcing/customers/{id}/rounds - Creditor deducts 0.5 credit per letter"""
        partner_headers = {"Authorization": f"Bearer {partner_token}"}
        customers_response = requests.get(f"{BASE_URL}/api/outsourcing/customers", headers=partner_headers)
        customers = customers_response.json()
        if not customers:
            pytest.skip("No customers available for testing")
        customer_id = customers[0]["id"]
        
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Ensure enough credits
        requests.post(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_CRM_ID}/credits/purchase",
            headers=admin_headers,
            json={"credits": 10, "payment_amount": 300}
        )
        
        settings_response = requests.get(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_CRM_ID}/credit-settings",
            headers=admin_headers
        )
        original_balance = settings_response.json().get("credit_balance", 0)
        
        # Create creditor round with 4 letters
        letter_count = 4
        response = requests.post(
            f"{BASE_URL}/api/outsourcing/customers/{customer_id}/rounds",
            headers=admin_headers,
            json={
                "letter_type": "creditor",
                "letter_count": letter_count,
                "admin_notes": "TEST_creditor_round_pytest"
            }
        )
        assert response.status_code == 200, f"Failed to create creditor round: {response.text}"
        data = response.json()
        
        expected_credits = 0.5 * letter_count  # 0.5 credit per letter
        assert data.get("letter_type") == "creditor"
        assert data.get("credit_deducted") == expected_credits, f"Should deduct {expected_credits} credits"
        assert data.get("letter_count") == letter_count
        
        print(f"Creditor round: {letter_count} letters = {expected_credits} credits deducted")
    
    def test_insufficient_credits_blocks_round(self, admin_token, partner_token):
        """POST /api/outsourcing/customers/{id}/rounds - Blocks when insufficient credits"""
        partner_headers = {"Authorization": f"Bearer {partner_token}"}
        customers_response = requests.get(f"{BASE_URL}/api/outsourcing/customers", headers=partner_headers)
        customers = customers_response.json()
        if not customers:
            pytest.skip("No customers available for testing")
        customer_id = customers[0]["id"]
        
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Get current balance
        settings_response = requests.get(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_CRM_ID}/credit-settings",
            headers=admin_headers
        )
        current_balance = settings_response.json().get("credit_balance", 0)
        
        # Try to create a round that requires more credits than available
        # Request 1000 collection agency letters (1000 credits needed)
        response = requests.post(
            f"{BASE_URL}/api/outsourcing/customers/{customer_id}/rounds",
            headers=admin_headers,
            json={
                "letter_type": "collection_agency",
                "letter_count": 1000,
                "admin_notes": "TEST_insufficient_credits"
            }
        )
        
        if current_balance < 1000:
            assert response.status_code == 400, "Should block round when insufficient credits"
            assert "Insufficient credits" in response.json().get("detail", ""), "Error should mention insufficient credits"
            print(f"Correctly blocked round: balance={current_balance}, needed=1000")
        else:
            # If somehow there are enough credits, the test passes differently
            print(f"Partner has {current_balance} credits, enough for 1000 letters")


class TestPartnerCreditInfo:
    """Test partner credit info endpoints"""
    
    @pytest.fixture(scope="class")
    def partner_token(self):
        response = requests.post(f"{BASE_URL}/api/outsourcing/partner/login", json={
            "email": PARTNER_EMAIL,
            "password": PARTNER_PASSWORD
        })
        return response.json().get("token")
    
    def test_get_credit_info(self, partner_token):
        """GET /api/outsourcing/credits/info - Partner sees credit balance and estimates"""
        headers = {"Authorization": f"Bearer {partner_token}"}
        response = requests.get(f"{BASE_URL}/api/outsourcing/credits/info", headers=headers)
        assert response.status_code == 200, f"Failed to get credit info: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "credit_balance" in data, "Missing credit_balance"
        assert "price_per_credit" in data, "Missing price_per_credit"
        assert "active_customers" in data, "Missing active_customers"
        assert "credits_for_next_round" in data, "Missing credits_for_next_round"
        assert "cost_for_next_round" in data, "Missing cost_for_next_round"
        assert "has_enough_credits" in data, "Missing has_enough_credits"
        assert "credits_deficit" in data, "Missing credits_deficit"
        assert "deficit_cost" in data, "Missing deficit_cost"
        assert "credit_rates" in data, "Missing credit_rates"
        
        print(f"Partner credit info: balance={data['credit_balance']}, next_round={data['credits_for_next_round']}, has_enough={data['has_enough_credits']}")
    
    def test_estimate_new_clients(self, partner_token):
        """GET /api/outsourcing/credits/estimate-new-clients?count=X"""
        headers = {"Authorization": f"Bearer {partner_token}"}
        
        # Test with 5 new clients
        count = 5
        response = requests.get(
            f"{BASE_URL}/api/outsourcing/credits/estimate-new-clients?count={count}",
            headers=headers
        )
        assert response.status_code == 200, f"Failed to get estimate: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "current_active_clients" in data, "Missing current_active_clients"
        assert "new_clients_to_add" in data, "Missing new_clients_to_add"
        assert "new_total_clients" in data, "Missing new_total_clients"
        assert "credits_per_round" in data, "Missing credits_per_round"
        assert "total_round_cost" in data, "Missing total_round_cost"
        assert "current_balance" in data, "Missing current_balance"
        assert "additional_credits_needed" in data, "Missing additional_credits_needed"
        assert "additional_cost" in data, "Missing additional_cost"
        assert "price_per_credit" in data, "Missing price_per_credit"
        
        # Verify calculations
        assert data["new_clients_to_add"] == count
        assert data["new_total_clients"] == data["current_active_clients"] + count
        assert data["credits_per_round"] == data["new_total_clients"]  # 1 credit per client
        
        print(f"Estimate for {count} new clients: current={data['current_active_clients']}, new_total={data['new_total_clients']}, additional_credits_needed={data['additional_credits_needed']}")


class TestPortalDashboardCreditWarnings:
    """Test portal dashboard credit warnings"""
    
    @pytest.fixture(scope="class")
    def partner_token(self):
        response = requests.post(f"{BASE_URL}/api/outsourcing/partner/login", json={
            "email": PARTNER_EMAIL,
            "password": PARTNER_PASSWORD
        })
        return response.json().get("token")
    
    def test_dashboard_returns_credit_warnings(self, partner_token):
        """GET /api/outsourcing/portal/dashboard - Returns credit warning fields"""
        headers = {"Authorization": f"Bearer {partner_token}"}
        response = requests.get(f"{BASE_URL}/api/outsourcing/portal/dashboard", headers=headers)
        assert response.status_code == 200, f"Failed to get dashboard: {response.text}"
        data = response.json()
        
        # Verify credit warning fields exist
        assert "credit_balance" in data, "Missing credit_balance"
        assert "price_per_credit" in data, "Missing price_per_credit"
        assert "credits_for_next_round" in data, "Missing credits_for_next_round"
        assert "cost_for_next_round" in data, "Missing cost_for_next_round"
        assert "credits_deficit" in data, "Missing credits_deficit"
        assert "deficit_cost" in data, "Missing deficit_cost"
        assert "out_of_credits" in data, "Missing out_of_credits"
        
        # Verify types
        assert isinstance(data["out_of_credits"], bool), "out_of_credits should be boolean"
        assert isinstance(data["credits_deficit"], (int, float)), "credits_deficit should be numeric"
        
        print(f"Dashboard credit warnings: balance={data['credit_balance']}, out_of_credits={data['out_of_credits']}, deficit={data['credits_deficit']}")


class TestInvalidLetterType:
    """Test invalid letter type handling"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json().get("access_token")
    
    @pytest.fixture(scope="class")
    def partner_token(self):
        response = requests.post(f"{BASE_URL}/api/outsourcing/partner/login", json={
            "email": PARTNER_EMAIL,
            "password": PARTNER_PASSWORD
        })
        return response.json().get("token")
    
    def test_invalid_letter_type_rejected(self, admin_token, partner_token):
        """POST /api/outsourcing/customers/{id}/rounds - Rejects invalid letter_type"""
        partner_headers = {"Authorization": f"Bearer {partner_token}"}
        customers_response = requests.get(f"{BASE_URL}/api/outsourcing/customers", headers=partner_headers)
        customers = customers_response.json()
        if not customers:
            pytest.skip("No customers available for testing")
        customer_id = customers[0]["id"]
        
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.post(
            f"{BASE_URL}/api/outsourcing/customers/{customer_id}/rounds",
            headers=admin_headers,
            json={
                "letter_type": "invalid_type",
                "letter_count": 1
            }
        )
        assert response.status_code == 400, "Should reject invalid letter_type"
        assert "Invalid letter_type" in response.json().get("detail", "")
        print("Invalid letter_type correctly rejected")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
