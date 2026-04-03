"""
Test Partner PIN Authentication & Management API
Tests: POST /api/partners/pin-auth, POST /api/partners/set-pin, GET /api/partner-pins/list
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from /app/memory/test_credentials.md
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"
JOEZIEL_PIN = "042889"
WRONG_PIN = "111111"


class TestPartnerPINAuth:
    """Partner PIN Authentication Tests"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get CMS admin JWT token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "No access_token in login response"
        return data["access_token"]
    
    @pytest.fixture(scope="class")
    def admin_headers(self, admin_token):
        """Headers with admin JWT"""
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {admin_token}"
        }
    
    # ===== PIN AUTH TESTS =====
    
    def test_pin_auth_requires_cms_token(self):
        """PIN auth should fail without CMS JWT"""
        response = requests.post(
            f"{BASE_URL}/api/partners/pin-auth",
            json={"pin": JOEZIEL_PIN}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        data = response.json()
        assert "CMS authentication required" in data.get("detail", "")
    
    def test_pin_auth_wrong_pin_returns_401(self, admin_headers):
        """Wrong PIN should return 401 with 'Incorrect PIN' message"""
        response = requests.post(
            f"{BASE_URL}/api/partners/pin-auth",
            headers=admin_headers,
            json={"pin": WRONG_PIN}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        data = response.json()
        assert "Incorrect PIN" in data.get("detail", ""), f"Expected 'Incorrect PIN' in detail, got: {data}"
    
    def test_pin_auth_invalid_format(self, admin_headers):
        """PIN must be exactly 6 digits"""
        # Too short
        response = requests.post(
            f"{BASE_URL}/api/partners/pin-auth",
            headers=admin_headers,
            json={"pin": "123"}
        )
        assert response.status_code == 400, f"Expected 400 for short PIN, got {response.status_code}"
        
        # Too long
        response = requests.post(
            f"{BASE_URL}/api/partners/pin-auth",
            headers=admin_headers,
            json={"pin": "1234567"}
        )
        assert response.status_code == 400, f"Expected 400 for long PIN, got {response.status_code}"
        
        # Non-numeric
        response = requests.post(
            f"{BASE_URL}/api/partners/pin-auth",
            headers=admin_headers,
            json={"pin": "abcdef"}
        )
        assert response.status_code == 400, f"Expected 400 for non-numeric PIN, got {response.status_code}"
    
    def test_pin_auth_correct_pin_returns_token(self, admin_headers):
        """Correct PIN (042889) should return access_token and partner data"""
        response = requests.post(
            f"{BASE_URL}/api/partners/pin-auth",
            headers=admin_headers,
            json={"pin": JOEZIEL_PIN}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "access_token" in data, "Missing access_token in response"
        assert "partner" in data, "Missing partner in response"
        assert isinstance(data["access_token"], str), "access_token should be string"
        assert len(data["access_token"]) > 0, "access_token should not be empty"
        
        # Verify partner data
        partner = data["partner"]
        assert "id" in partner, "Missing partner id"
        assert "email" in partner, "Missing partner email"
        assert "role" in partner, "Missing partner role"
        assert "display_name" in partner, "Missing partner display_name"
    
    # ===== PARTNER LIST TESTS =====
    
    def test_partner_list_requires_admin(self):
        """Partner list should fail without admin JWT"""
        response = requests.get(f"{BASE_URL}/api/partner-pins/list")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_partner_list_returns_partners_with_has_pin(self, admin_headers):
        """GET /api/partner-pins/list should return partners with has_pin field"""
        response = requests.get(
            f"{BASE_URL}/api/partner-pins/list",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "partners" in data, "Missing 'partners' in response"
        partners = data["partners"]
        assert isinstance(partners, list), "partners should be a list"
        assert len(partners) > 0, "Should have at least one partner"
        
        # Verify each partner has required fields
        for p in partners:
            assert "id" in p, "Partner missing id"
            assert "email" in p, "Partner missing email"
            assert "display_name" in p, "Partner missing display_name"
            assert "has_pin" in p, "Partner missing has_pin field"
            assert isinstance(p["has_pin"], bool), "has_pin should be boolean"
            # Verify sensitive fields are excluded
            assert "password_hash" not in p, "password_hash should be excluded"
            assert "pin_hash" not in p, "pin_hash should be excluded"
    
    # ===== SET PIN TESTS =====
    
    def test_set_pin_requires_admin(self):
        """Set PIN should fail without admin JWT"""
        response = requests.post(
            f"{BASE_URL}/api/partners/set-pin",
            json={"partner_id": "test", "new_pin": "123456"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_set_pin_validates_format(self, admin_headers):
        """Set PIN should validate PIN format"""
        # First get a partner ID
        list_response = requests.get(
            f"{BASE_URL}/api/partner-pins/list",
            headers=admin_headers
        )
        assert list_response.status_code == 200
        partners = list_response.json().get("partners", [])
        assert len(partners) > 0, "Need at least one partner to test"
        
        # Find Shar (non-master partner) for testing
        shar = next((p for p in partners if "shar" in p.get("email", "").lower()), partners[-1])
        partner_id = shar["id"]
        
        # Test invalid PIN format
        response = requests.post(
            f"{BASE_URL}/api/partners/set-pin",
            headers=admin_headers,
            json={"partner_id": partner_id, "new_pin": "123"}  # Too short
        )
        assert response.status_code == 400, f"Expected 400 for short PIN, got {response.status_code}"
        
        response = requests.post(
            f"{BASE_URL}/api/partners/set-pin",
            headers=admin_headers,
            json={"partner_id": partner_id, "new_pin": "abcdef"}  # Non-numeric
        )
        assert response.status_code == 400, f"Expected 400 for non-numeric PIN, got {response.status_code}"
    
    def test_set_pin_success(self, admin_headers):
        """Admin can set a new PIN for a partner"""
        # First get partner list
        list_response = requests.get(
            f"{BASE_URL}/api/partner-pins/list",
            headers=admin_headers
        )
        assert list_response.status_code == 200
        partners = list_response.json().get("partners", [])
        
        # Find Shar for testing
        shar = next((p for p in partners if "shar" in p.get("email", "").lower()), None)
        if not shar:
            pytest.skip("Shar partner not found for PIN set test")
        
        partner_id = shar["id"]
        test_pin = "999888"  # Test PIN for Shar
        
        # Set new PIN
        response = requests.post(
            f"{BASE_URL}/api/partners/set-pin",
            headers=admin_headers,
            json={"partner_id": partner_id, "new_pin": test_pin}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True, "Expected success=True"
        assert "PIN updated" in data.get("message", ""), f"Expected 'PIN updated' in message, got: {data}"
        
        # Verify has_pin is now True
        list_response = requests.get(
            f"{BASE_URL}/api/partner-pins/list",
            headers=admin_headers
        )
        partners = list_response.json().get("partners", [])
        shar_updated = next((p for p in partners if p["id"] == partner_id), None)
        assert shar_updated is not None, "Shar not found after PIN update"
        assert shar_updated["has_pin"] == True, "has_pin should be True after setting PIN"


class TestPartnerPINLockout:
    """Test PIN lockout after failed attempts"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get CMS admin JWT token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def admin_headers(self, admin_token):
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {admin_token}"
        }
    
    def test_failed_attempts_tracked(self, admin_headers):
        """Multiple wrong PINs should track failed attempts"""
        # First reset by logging in with correct PIN
        response = requests.post(
            f"{BASE_URL}/api/partners/pin-auth",
            headers=admin_headers,
            json={"pin": JOEZIEL_PIN}
        )
        # This should succeed and reset failed attempts
        assert response.status_code == 200, f"Correct PIN should work: {response.text}"
        
        # Now try wrong PIN
        response = requests.post(
            f"{BASE_URL}/api/partners/pin-auth",
            headers=admin_headers,
            json={"pin": WRONG_PIN}
        )
        assert response.status_code == 401, "Wrong PIN should return 401"
        
        # Check X-Attempts-Remaining header if present
        remaining = response.headers.get("X-Attempts-Remaining")
        if remaining:
            assert int(remaining) < 5, "Attempts remaining should decrease"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
