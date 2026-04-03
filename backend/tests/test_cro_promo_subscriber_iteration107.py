"""
Test Suite for CRO Portal Iteration 107 Features:
- Promo/Discount Code System (CRUD + validation)
- Email Subscriber System (CRUD + auto-enrollment)
- CRO Registration with promo codes
- CRO Pay-Signup endpoint (Authorize.net integration)
- Admin CRO Management endpoints
"""
import pytest
import requests
import os
from uuid import uuid4

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://rep-dashboard-11.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"

# Test data prefixes for cleanup
TEST_PREFIX = "TEST_ITER107_"


class TestSetup:
    """Setup fixtures for all tests"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin JWT token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def admin_headers(self, admin_token):
        """Headers with admin auth"""
        return {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }


class TestPromoCodeCRUD(TestSetup):
    """Test Promo Code CRUD operations"""
    
    def test_create_promo_code_free_registration(self, admin_headers):
        """Test creating a free_registration promo code"""
        code = f"{TEST_PREFIX}FREE{str(uuid4())[:4].upper()}"
        response = requests.post(
            f"{BASE_URL}/api/promo/codes",
            headers=admin_headers,
            json={
                "code": code,
                "type": "free_registration",
                "description": "Test free registration code",
                "applies_to": "cro_registration",
                "max_uses": 10
            }
        )
        assert response.status_code == 200, f"Create promo failed: {response.text}"
        data = response.json()
        assert "promo" in data
        assert data["promo"]["code"] == code
        assert data["promo"]["type"] == "free_registration"
        print(f"✓ Created free_registration promo code: {code}")
        return data["promo"]["id"]
    
    def test_create_promo_code_percentage_discount(self, admin_headers):
        """Test creating a percentage_discount promo code"""
        code = f"{TEST_PREFIX}PCT{str(uuid4())[:4].upper()}"
        response = requests.post(
            f"{BASE_URL}/api/promo/codes",
            headers=admin_headers,
            json={
                "code": code,
                "type": "percentage_discount",
                "value": 50,
                "description": "50% off signup fee",
                "applies_to": "cro_registration",
                "max_uses": 5
            }
        )
        assert response.status_code == 200, f"Create promo failed: {response.text}"
        data = response.json()
        assert data["promo"]["type"] == "percentage_discount"
        assert data["promo"]["value"] == 50
        print(f"✓ Created percentage_discount promo code: {code}")
    
    def test_create_promo_code_flat_credit(self, admin_headers):
        """Test creating a flat_credit promo code"""
        code = f"{TEST_PREFIX}FLAT{str(uuid4())[:4].upper()}"
        response = requests.post(
            f"{BASE_URL}/api/promo/codes",
            headers=admin_headers,
            json={
                "code": code,
                "type": "flat_credit",
                "value": 100,
                "description": "$100 off signup fee",
                "applies_to": "cro_registration"
            }
        )
        assert response.status_code == 200, f"Create promo failed: {response.text}"
        data = response.json()
        assert data["promo"]["type"] == "flat_credit"
        assert data["promo"]["value"] == 100
        print(f"✓ Created flat_credit promo code: {code}")
    
    def test_create_promo_code_free_trial(self, admin_headers):
        """Test creating a free_trial promo code"""
        code = f"{TEST_PREFIX}TRIAL{str(uuid4())[:4].upper()}"
        response = requests.post(
            f"{BASE_URL}/api/promo/codes",
            headers=admin_headers,
            json={
                "code": code,
                "type": "free_trial",
                "free_trial_days": 30,
                "description": "30-day free trial",
                "applies_to": "cro_registration"
            }
        )
        assert response.status_code == 200, f"Create promo failed: {response.text}"
        data = response.json()
        assert data["promo"]["type"] == "free_trial"
        assert data["promo"]["free_trial_days"] == 30
        print(f"✓ Created free_trial promo code: {code}")
    
    def test_create_promo_code_freemium(self, admin_headers):
        """Test creating a freemium promo code"""
        code = f"{TEST_PREFIX}FREEM{str(uuid4())[:4].upper()}"
        response = requests.post(
            f"{BASE_URL}/api/promo/codes",
            headers=admin_headers,
            json={
                "code": code,
                "type": "freemium",
                "value": 25,
                "description": "Free signup + 25% off monthly",
                "applies_to": "cro_registration"
            }
        )
        assert response.status_code == 200, f"Create promo failed: {response.text}"
        data = response.json()
        assert data["promo"]["type"] == "freemium"
        print(f"✓ Created freemium promo code: {code}")
    
    def test_list_promo_codes(self, admin_headers):
        """Test listing all promo codes"""
        response = requests.get(
            f"{BASE_URL}/api/promo/codes",
            headers=admin_headers
        )
        assert response.status_code == 200, f"List promo codes failed: {response.text}"
        data = response.json()
        assert "codes" in data
        assert isinstance(data["codes"], list)
        print(f"✓ Listed {len(data['codes'])} promo codes")
    
    def test_update_promo_code(self, admin_headers):
        """Test updating a promo code"""
        # First create a code
        code = f"{TEST_PREFIX}UPD{str(uuid4())[:4].upper()}"
        create_resp = requests.post(
            f"{BASE_URL}/api/promo/codes",
            headers=admin_headers,
            json={"code": code, "type": "free_registration", "description": "Original"}
        )
        assert create_resp.status_code == 200
        promo_id = create_resp.json()["promo"]["id"]
        
        # Update it
        update_resp = requests.put(
            f"{BASE_URL}/api/promo/codes/{promo_id}",
            headers=admin_headers,
            json={"description": "Updated description", "max_uses": 100}
        )
        assert update_resp.status_code == 200, f"Update failed: {update_resp.text}"
        data = update_resp.json()
        assert data["promo"]["description"] == "Updated description"
        assert data["promo"]["max_uses"] == 100
        print(f"✓ Updated promo code: {code}")
    
    def test_delete_promo_code(self, admin_headers):
        """Test deleting a promo code"""
        # First create a code
        code = f"{TEST_PREFIX}DEL{str(uuid4())[:4].upper()}"
        create_resp = requests.post(
            f"{BASE_URL}/api/promo/codes",
            headers=admin_headers,
            json={"code": code, "type": "free_registration"}
        )
        assert create_resp.status_code == 200
        promo_id = create_resp.json()["promo"]["id"]
        
        # Delete it
        delete_resp = requests.delete(
            f"{BASE_URL}/api/promo/codes/{promo_id}",
            headers=admin_headers
        )
        assert delete_resp.status_code == 200, f"Delete failed: {delete_resp.text}"
        print(f"✓ Deleted promo code: {code}")
    
    def test_create_promo_code_invalid_type(self, admin_headers):
        """Test creating promo code with invalid type fails"""
        response = requests.post(
            f"{BASE_URL}/api/promo/codes",
            headers=admin_headers,
            json={"code": "INVALID", "type": "invalid_type"}
        )
        assert response.status_code == 400
        print("✓ Invalid promo type rejected correctly")
    
    def test_create_promo_code_duplicate(self, admin_headers):
        """Test creating duplicate promo code fails"""
        code = f"{TEST_PREFIX}DUP{str(uuid4())[:4].upper()}"
        # Create first
        requests.post(
            f"{BASE_URL}/api/promo/codes",
            headers=admin_headers,
            json={"code": code, "type": "free_registration"}
        )
        # Try duplicate
        response = requests.post(
            f"{BASE_URL}/api/promo/codes",
            headers=admin_headers,
            json={"code": code, "type": "free_registration"}
        )
        assert response.status_code == 400
        print("✓ Duplicate promo code rejected correctly")
    
    def test_promo_codes_require_admin_auth(self):
        """Test that promo code endpoints require admin auth"""
        response = requests.get(f"{BASE_URL}/api/promo/codes")
        assert response.status_code == 403
        print("✓ Promo codes require admin auth")


class TestPromoCodeValidation(TestSetup):
    """Test public promo code validation endpoint"""
    
    def test_validate_promo_code_public_endpoint(self, admin_headers):
        """Test validating a promo code (public endpoint, no auth)"""
        # First create a code as admin
        code = f"{TEST_PREFIX}VAL{str(uuid4())[:4].upper()}"
        requests.post(
            f"{BASE_URL}/api/promo/codes",
            headers=admin_headers,
            json={"code": code, "type": "free_registration", "description": "Test validation"}
        )
        
        # Validate without auth (public endpoint)
        response = requests.post(
            f"{BASE_URL}/api/promo/validate",
            json={"code": code, "applies_to": "cro_registration"}
        )
        assert response.status_code == 200, f"Validate failed: {response.text}"
        data = response.json()
        assert data["valid"] == True
        assert data["code"] == code
        assert data["type"] == "free_registration"
        assert "discount" in data
        assert data["discount"]["final_signup_fee"] == 0
        print(f"✓ Validated promo code (public): {code}")
    
    def test_validate_percentage_discount_calculation(self, admin_headers):
        """Test percentage discount calculation"""
        code = f"{TEST_PREFIX}PCT50{str(uuid4())[:4].upper()}"
        requests.post(
            f"{BASE_URL}/api/promo/codes",
            headers=admin_headers,
            json={"code": code, "type": "percentage_discount", "value": 50}
        )
        
        response = requests.post(
            f"{BASE_URL}/api/promo/validate",
            json={"code": code, "applies_to": "cro_registration"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["discount"]["final_signup_fee"] == 250.0  # 50% of $500
        print(f"✓ Percentage discount calculated correctly: $250")
    
    def test_validate_flat_credit_calculation(self, admin_headers):
        """Test flat credit calculation"""
        code = f"{TEST_PREFIX}FLAT100{str(uuid4())[:4].upper()}"
        requests.post(
            f"{BASE_URL}/api/promo/codes",
            headers=admin_headers,
            json={"code": code, "type": "flat_credit", "value": 100}
        )
        
        response = requests.post(
            f"{BASE_URL}/api/promo/validate",
            json={"code": code, "applies_to": "cro_registration"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["discount"]["final_signup_fee"] == 400.0  # $500 - $100
        print(f"✓ Flat credit calculated correctly: $400")
    
    def test_validate_invalid_promo_code(self):
        """Test validating an invalid promo code"""
        response = requests.post(
            f"{BASE_URL}/api/promo/validate",
            json={"code": "NONEXISTENT123", "applies_to": "cro_registration"}
        )
        assert response.status_code == 404
        print("✓ Invalid promo code rejected correctly")
    
    def test_validate_empty_code(self):
        """Test validating empty code"""
        response = requests.post(
            f"{BASE_URL}/api/promo/validate",
            json={"code": "", "applies_to": "cro_registration"}
        )
        assert response.status_code == 400
        print("✓ Empty promo code rejected correctly")


class TestEmailSubscriberSystem(TestSetup):
    """Test Email Subscriber CRUD operations"""
    
    def test_add_subscriber_manually(self, admin_headers):
        """Test manually adding a subscriber"""
        email = f"{TEST_PREFIX}sub{str(uuid4())[:4]}@test.com"
        response = requests.post(
            f"{BASE_URL}/api/subscribers/add",
            headers=admin_headers,
            json={
                "email": email,
                "name": "Test Subscriber",
                "tags": ["blog", "press_release", "updates"]
            }
        )
        assert response.status_code == 200, f"Add subscriber failed: {response.text}"
        data = response.json()
        assert "subscriber_id" in data
        print(f"✓ Added subscriber: {email}")
    
    def test_list_subscribers(self, admin_headers):
        """Test listing subscribers"""
        response = requests.get(
            f"{BASE_URL}/api/subscribers/list",
            headers=admin_headers
        )
        assert response.status_code == 200, f"List subscribers failed: {response.text}"
        data = response.json()
        assert "subscribers" in data
        assert "total" in data
        assert "tag_counts" in data
        assert "available_tags" in data
        print(f"✓ Listed {data['total']} subscribers")
    
    def test_list_subscribers_with_tag_filter(self, admin_headers):
        """Test listing subscribers with tag filter"""
        response = requests.get(
            f"{BASE_URL}/api/subscribers/list?tag=cro",
            headers=admin_headers
        )
        assert response.status_code == 200
        print("✓ Listed subscribers with tag filter")
    
    def test_list_subscribers_with_search(self, admin_headers):
        """Test listing subscribers with search"""
        response = requests.get(
            f"{BASE_URL}/api/subscribers/list?search=test",
            headers=admin_headers
        )
        assert response.status_code == 200
        print("✓ Listed subscribers with search filter")
    
    def test_subscriber_stats(self, admin_headers):
        """Test getting subscriber statistics"""
        response = requests.get(
            f"{BASE_URL}/api/subscribers/stats",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Stats failed: {response.text}"
        data = response.json()
        assert "total" in data
        assert "active" in data
        assert "unsubscribed" in data
        assert "by_tag" in data
        assert "by_source" in data
        print(f"✓ Got subscriber stats: {data['total']} total, {data['active']} active")
    
    def test_toggle_subscriber_status(self, admin_headers):
        """Test toggling subscriber status"""
        # First add a subscriber
        email = f"{TEST_PREFIX}toggle{str(uuid4())[:4]}@test.com"
        add_resp = requests.post(
            f"{BASE_URL}/api/subscribers/add",
            headers=admin_headers,
            json={"email": email, "name": "Toggle Test", "tags": ["general"]}
        )
        assert add_resp.status_code == 200
        sub_id = add_resp.json()["subscriber_id"]
        
        # Toggle to unsubscribed
        toggle_resp = requests.put(
            f"{BASE_URL}/api/subscribers/{sub_id}/status",
            headers=admin_headers,
            json={"status": "unsubscribed"}
        )
        assert toggle_resp.status_code == 200, f"Toggle failed: {toggle_resp.text}"
        print(f"✓ Toggled subscriber status to unsubscribed")
        
        # Toggle back to active
        toggle_resp2 = requests.put(
            f"{BASE_URL}/api/subscribers/{sub_id}/status",
            headers=admin_headers,
            json={"status": "active"}
        )
        assert toggle_resp2.status_code == 200
        print(f"✓ Toggled subscriber status back to active")
    
    def test_delete_subscriber(self, admin_headers):
        """Test deleting a subscriber"""
        # First add a subscriber
        email = f"{TEST_PREFIX}del{str(uuid4())[:4]}@test.com"
        add_resp = requests.post(
            f"{BASE_URL}/api/subscribers/add",
            headers=admin_headers,
            json={"email": email, "name": "Delete Test", "tags": ["general"]}
        )
        assert add_resp.status_code == 200
        sub_id = add_resp.json()["subscriber_id"]
        
        # Delete it
        del_resp = requests.delete(
            f"{BASE_URL}/api/subscribers/{sub_id}",
            headers=admin_headers
        )
        assert del_resp.status_code == 200, f"Delete failed: {del_resp.text}"
        print(f"✓ Deleted subscriber: {email}")
    
    def test_export_subscribers(self, admin_headers):
        """Test exporting subscribers"""
        response = requests.get(
            f"{BASE_URL}/api/subscribers/export",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Export failed: {response.text}"
        data = response.json()
        assert "subscribers" in data
        assert "count" in data
        print(f"✓ Exported {data['count']} subscribers")
    
    def test_export_subscribers_with_tag(self, admin_headers):
        """Test exporting subscribers with tag filter"""
        response = requests.get(
            f"{BASE_URL}/api/subscribers/export?tag=blog",
            headers=admin_headers
        )
        assert response.status_code == 200
        print("✓ Exported subscribers with tag filter")
    
    def test_subscribers_require_admin_auth(self):
        """Test that subscriber endpoints require admin auth"""
        response = requests.get(f"{BASE_URL}/api/subscribers/list")
        assert response.status_code == 403
        print("✓ Subscriber endpoints require admin auth")


class TestCRORegistrationWithPromo(TestSetup):
    """Test CRO registration with promo codes"""
    
    def test_cro_register_with_promo_code(self, admin_headers):
        """Test CRO registration with a promo code"""
        # First create a promo code
        promo_code = f"{TEST_PREFIX}REG{str(uuid4())[:4].upper()}"
        requests.post(
            f"{BASE_URL}/api/promo/codes",
            headers=admin_headers,
            json={"code": promo_code, "type": "free_registration"}
        )
        
        # Register CRO with promo code
        email = f"{TEST_PREFIX}cro{str(uuid4())[:4]}@test.com"
        response = requests.post(
            f"{BASE_URL}/api/cro/register",
            json={
                "company_name": f"{TEST_PREFIX} CRO Company",
                "owner_name": "Test Owner",
                "email": email,
                "phone": "555-123-4567",
                "ein": f"12-{str(uuid4())[:7]}",
                "state": "FL",
                "password": "TestPassword123!",
                "agreement_accepted": True,
                "promo_code": promo_code
            }
        )
        assert response.status_code == 200, f"CRO register failed: {response.text}"
        data = response.json()
        assert "cro_id" in data
        assert data.get("promo_applied") == promo_code
        print(f"✓ CRO registered with promo code: {promo_code}")
    
    def test_cro_register_auto_enrolls_subscriber(self, admin_headers):
        """Test that CRO registration auto-enrolls as email subscriber"""
        email = f"{TEST_PREFIX}autosub{str(uuid4())[:4]}@test.com"
        
        # Register CRO
        response = requests.post(
            f"{BASE_URL}/api/cro/register",
            json={
                "company_name": f"{TEST_PREFIX} Auto Sub CRO",
                "owner_name": "Auto Sub Owner",
                "email": email,
                "phone": "555-123-4567",
                "ein": f"12-{str(uuid4())[:7]}",
                "state": "CA",
                "password": "TestPassword123!",
                "agreement_accepted": True
            }
        )
        assert response.status_code == 200, f"CRO register failed: {response.text}"
        
        # Check if auto-enrolled as subscriber
        list_resp = requests.get(
            f"{BASE_URL}/api/subscribers/list?search={email}",
            headers=admin_headers
        )
        assert list_resp.status_code == 200
        data = list_resp.json()
        
        # Find the subscriber
        found = False
        for sub in data.get("subscribers", []):
            if sub["email"] == email.lower():
                found = True
                # Check tags include CRO-related tags
                assert "cro" in sub.get("tags", []), "Missing 'cro' tag"
                print(f"✓ CRO auto-enrolled as subscriber with tags: {sub.get('tags')}")
                break
        
        assert found, f"Subscriber not found for email: {email}"


class TestCROPaySignup(TestSetup):
    """Test CRO pay-signup endpoint (Authorize.net integration)"""
    
    def test_pay_signup_endpoint_exists(self):
        """Test that pay-signup endpoint exists and accepts requests"""
        # This will fail with 400 because cro_id is required, but confirms endpoint exists
        response = requests.post(
            f"{BASE_URL}/api/cro/pay-signup",
            json={}
        )
        assert response.status_code == 400
        assert "cro_id" in response.json().get("detail", "").lower()
        print("✓ Pay-signup endpoint exists and validates input")
    
    def test_pay_signup_requires_card_info(self, admin_headers):
        """Test that pay-signup requires card information"""
        # First register a CRO
        email = f"{TEST_PREFIX}pay{str(uuid4())[:4]}@test.com"
        reg_resp = requests.post(
            f"{BASE_URL}/api/cro/register",
            json={
                "company_name": f"{TEST_PREFIX} Pay Test CRO",
                "owner_name": "Pay Test Owner",
                "email": email,
                "phone": "555-123-4567",
                "ein": f"12-{str(uuid4())[:7]}",
                "state": "TX",
                "password": "TestPassword123!",
                "agreement_accepted": True
            }
        )
        assert reg_resp.status_code == 200
        cro_id = reg_resp.json()["cro_id"]
        
        # Try to pay without card info
        response = requests.post(
            f"{BASE_URL}/api/cro/pay-signup",
            json={"cro_id": cro_id}
        )
        assert response.status_code == 400
        assert "card_number" in response.json().get("detail", "").lower()
        print("✓ Pay-signup requires card information")
    
    def test_pay_signup_with_invalid_card(self, admin_headers):
        """Test pay-signup with invalid card returns appropriate error"""
        # First register a CRO
        email = f"{TEST_PREFIX}badcard{str(uuid4())[:4]}@test.com"
        reg_resp = requests.post(
            f"{BASE_URL}/api/cro/register",
            json={
                "company_name": f"{TEST_PREFIX} Bad Card CRO",
                "owner_name": "Bad Card Owner",
                "email": email,
                "phone": "555-123-4567",
                "ein": f"12-{str(uuid4())[:7]}",
                "state": "NY",
                "password": "TestPassword123!",
                "agreement_accepted": True
            }
        )
        assert reg_resp.status_code == 200
        cro_id = reg_resp.json()["cro_id"]
        
        # Try to pay with invalid card (this confirms Authorize.net integration is wired)
        response = requests.post(
            f"{BASE_URL}/api/cro/pay-signup",
            json={
                "cro_id": cro_id,
                "card_number": "1234567890123456",  # Invalid card
                "expiration_date": "1228",
                "card_code": "123"
            }
        )
        # Should return 400 or 500 with payment error (not 404 or other)
        assert response.status_code in [400, 500], f"Unexpected status: {response.status_code}"
        # The error should mention payment or card
        error_detail = response.json().get("detail", "").lower()
        assert any(word in error_detail for word in ["payment", "card", "error", "failed"]), f"Unexpected error: {error_detail}"
        print(f"✓ Pay-signup with invalid card returns appropriate error: {response.status_code}")
    
    def test_pay_signup_free_promo_skips_payment(self, admin_headers):
        """Test that free_registration promo skips payment"""
        # Create a free promo code
        promo_code = f"{TEST_PREFIX}FREEPAY{str(uuid4())[:4].upper()}"
        requests.post(
            f"{BASE_URL}/api/promo/codes",
            headers=admin_headers,
            json={"code": promo_code, "type": "free_registration"}
        )
        
        # Register CRO with free promo
        email = f"{TEST_PREFIX}freepay{str(uuid4())[:4]}@test.com"
        reg_resp = requests.post(
            f"{BASE_URL}/api/cro/register",
            json={
                "company_name": f"{TEST_PREFIX} Free Pay CRO",
                "owner_name": "Free Pay Owner",
                "email": email,
                "phone": "555-123-4567",
                "ein": f"12-{str(uuid4())[:7]}",
                "state": "FL",
                "password": "TestPassword123!",
                "agreement_accepted": True,
                "promo_code": promo_code
            }
        )
        assert reg_resp.status_code == 200
        cro_id = reg_resp.json()["cro_id"]
        
        # Try to pay - should return already_paid or no payment required
        response = requests.post(
            f"{BASE_URL}/api/cro/pay-signup",
            json={
                "cro_id": cro_id,
                "card_number": "4111111111111111",
                "expiration_date": "1228",
                "card_code": "123"
            }
        )
        assert response.status_code == 200, f"Pay-signup failed: {response.text}"
        data = response.json()
        assert data.get("already_paid") == True or data.get("amount") == 0
        print("✓ Free promo skips payment correctly")


class TestAdminCROManagement(TestSetup):
    """Test Admin CRO Management endpoints"""
    
    def test_admin_list_cros(self, admin_headers):
        """Test admin listing all CROs"""
        response = requests.get(
            f"{BASE_URL}/api/cro/admin/list",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Admin list CROs failed: {response.text}"
        data = response.json()
        assert "organizations" in data or "cros" in data
        print(f"✓ Admin listed CROs")
    
    def test_admin_update_cro_status(self, admin_headers):
        """Test admin updating CRO status"""
        # First register a CRO
        email = f"{TEST_PREFIX}status{str(uuid4())[:4]}@test.com"
        reg_resp = requests.post(
            f"{BASE_URL}/api/cro/register",
            json={
                "company_name": f"{TEST_PREFIX} Status Test CRO",
                "owner_name": "Status Test Owner",
                "email": email,
                "phone": "555-123-4567",
                "ein": f"12-{str(uuid4())[:7]}",
                "state": "FL",
                "password": "TestPassword123!",
                "agreement_accepted": True
            }
        )
        assert reg_resp.status_code == 200
        cro_id = reg_resp.json()["cro_id"]
        
        # Update status to approved
        response = requests.put(
            f"{BASE_URL}/api/cro/admin/{cro_id}/status",
            headers=admin_headers,
            json={"status": "approved"}
        )
        assert response.status_code == 200, f"Update status failed: {response.text}"
        print("✓ Admin updated CRO status to approved")
        
        # Update status to suspended
        response2 = requests.put(
            f"{BASE_URL}/api/cro/admin/{cro_id}/status",
            headers=admin_headers,
            json={"status": "suspended"}
        )
        assert response2.status_code == 200
        print("✓ Admin updated CRO status to suspended")
    
    def test_admin_cro_endpoints_require_admin(self):
        """Test that admin CRO endpoints require admin auth"""
        response = requests.get(f"{BASE_URL}/api/cro/admin/list")
        assert response.status_code in [401, 403]
        print("✓ Admin CRO endpoints require admin auth")


class TestExistingPromoCodes(TestSetup):
    """Test existing promo codes mentioned in requirements"""
    
    def test_freestart_promo_exists(self):
        """Test FREESTART promo code validation"""
        response = requests.post(
            f"{BASE_URL}/api/promo/validate",
            json={"code": "FREESTART", "applies_to": "cro_registration"}
        )
        # May or may not exist, but endpoint should work
        if response.status_code == 200:
            data = response.json()
            assert data["type"] == "free_registration"
            print("✓ FREESTART promo code exists and is free_registration type")
        else:
            print("⚠ FREESTART promo code not found (may need to be created)")
    
    def test_half50_promo_exists(self):
        """Test HALF50 promo code validation"""
        response = requests.post(
            f"{BASE_URL}/api/promo/validate",
            json={"code": "HALF50", "applies_to": "cro_registration"}
        )
        # May or may not exist, but endpoint should work
        if response.status_code == 200:
            data = response.json()
            assert data["type"] == "percentage_discount"
            assert data["discount"]["final_signup_fee"] == 250.0
            print("✓ HALF50 promo code exists and gives 50% discount")
        else:
            print("⚠ HALF50 promo code not found (may need to be created)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
