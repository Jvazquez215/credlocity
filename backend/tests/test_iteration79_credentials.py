"""
Iteration 79 - Credential Status & Rotation Tests
Tests for:
1. /api/auth/credential-status - Returns expiry data for current user
2. /api/auth/all-credentials-status - Returns all partners' credential status (admin only)
3. /api/auth/set-partner-password - Password update with validation
4. /api/auth/set-credit-pin - PIN update with validation
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"
GUEST_EMAIL = "jane@teacher.com"
GUEST_PASSWORD = "Teacher123!"


class TestCredentialStatusAPI:
    """Tests for /api/auth/credential-status endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login as admin and get token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        self.token = response.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_credential_status_returns_correct_structure(self):
        """Test that credential-status returns all required fields"""
        response = requests.get(f"{BASE_URL}/api/auth/credential-status", headers=self.headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        
        # Check required top-level fields
        assert "user_id" in data, "Missing user_id"
        assert "email" in data, "Missing email"
        assert "role" in data, "Missing role"
        assert "rotation_days" in data, "Missing rotation_days"
        assert "password" in data, "Missing password status"
        assert "pin" in data, "Missing pin status"
        assert "requires_action" in data, "Missing requires_action"
        
        # Check password status structure
        pw = data["password"]
        assert "set" in pw, "Missing password.set"
        assert "expired" in pw, "Missing password.expired"
        assert "days_remaining" in pw, "Missing password.days_remaining"
        assert "last_set" in pw, "Missing password.last_set"
        assert "expires_at" in pw, "Missing password.expires_at"
        
        # Check pin status structure
        pin = data["pin"]
        assert "set" in pin, "Missing pin.set"
        assert "expired" in pin, "Missing pin.expired"
        assert "days_remaining" in pin, "Missing pin.days_remaining"
        
        print(f"✓ Credential status structure valid: {data['email']}, rotation_days={data['rotation_days']}")
    
    def test_credential_status_rotation_days_default(self):
        """Test that rotation_days defaults to 90"""
        response = requests.get(f"{BASE_URL}/api/auth/credential-status", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["rotation_days"] == 90, f"Expected rotation_days=90, got {data['rotation_days']}"
        print(f"✓ Rotation days correctly set to 90")
    
    def test_credential_status_requires_auth(self):
        """Test that credential-status requires authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/credential-status")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Credential status requires authentication")


class TestAllCredentialsStatusAPI:
    """Tests for /api/auth/all-credentials-status endpoint (admin only)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login as admin and get token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        self.admin_token = response.json().get("access_token")
        self.admin_headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Also login as guest teacher for non-admin test
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": GUEST_EMAIL,
            "password": GUEST_PASSWORD
        })
        if response.status_code == 200:
            self.guest_token = response.json().get("access_token")
            self.guest_headers = {"Authorization": f"Bearer {self.guest_token}"}
        else:
            self.guest_token = None
            self.guest_headers = {}
    
    def test_all_credentials_status_returns_correct_structure(self):
        """Test that all-credentials-status returns all required fields"""
        response = requests.get(f"{BASE_URL}/api/auth/all-credentials-status", headers=self.admin_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        
        # Check required top-level fields
        assert "users" in data, "Missing users array"
        assert "total" in data, "Missing total count"
        assert "expired" in data, "Missing expired count"
        assert "expiring_soon" in data, "Missing expiring_soon count"
        assert "secure" in data, "Missing secure count"
        assert "rotation_days" in data, "Missing rotation_days"
        
        # Check that users array has correct structure
        if len(data["users"]) > 0:
            user = data["users"][0]
            assert "id" in user, "Missing user.id"
            assert "email" in user, "Missing user.email"
            assert "role" in user, "Missing user.role"
            assert "password" in user, "Missing user.password"
            assert "pin" in user, "Missing user.pin"
            assert "status" in user, "Missing user.status"
            
            # Check status is one of expected values
            assert user["status"] in ["expired", "expiring_soon", "secure"], f"Invalid status: {user['status']}"
        
        print(f"✓ All credentials status: {data['total']} users, {data['expired']} expired, {data['expiring_soon']} expiring, {data['secure']} secure")
    
    def test_all_credentials_status_requires_admin(self):
        """Test that all-credentials-status requires admin role"""
        if not self.guest_token:
            pytest.skip("Guest teacher login failed, skipping non-admin test")
        
        response = requests.get(f"{BASE_URL}/api/auth/all-credentials-status", headers=self.guest_headers)
        assert response.status_code in [401, 403], f"Expected 401/403 for non-admin, got {response.status_code}"
        print("✓ All credentials status requires admin role")
    
    def test_all_credentials_status_requires_auth(self):
        """Test that all-credentials-status requires authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/all-credentials-status")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ All credentials status requires authentication")
    
    def test_all_credentials_counts_add_up(self):
        """Test that expired + expiring_soon + secure = total"""
        response = requests.get(f"{BASE_URL}/api/auth/all-credentials-status", headers=self.admin_headers)
        assert response.status_code == 200
        
        data = response.json()
        calculated_total = data["expired"] + data["expiring_soon"] + data["secure"]
        assert calculated_total == data["total"], f"Counts don't add up: {data['expired']} + {data['expiring_soon']} + {data['secure']} != {data['total']}"
        print(f"✓ Credential counts add up correctly: {calculated_total} = {data['total']}")


class TestPasswordUpdateAPI:
    """Tests for /api/auth/set-partner-password endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login as admin and get token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        self.token = response.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_password_update_rejects_short_password(self):
        """Test that password < 7 chars is rejected"""
        response = requests.post(f"{BASE_URL}/api/auth/set-partner-password", 
            headers=self.headers,
            json={"password": "Ab1@#"})  # 5 chars
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "7" in response.text.lower() or "length" in response.text.lower()
        print("✓ Short password rejected")
    
    def test_password_update_rejects_no_uppercase(self):
        """Test that password without uppercase is rejected"""
        response = requests.post(f"{BASE_URL}/api/auth/set-partner-password", 
            headers=self.headers,
            json={"password": "abcdef12@#"})  # No uppercase
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "uppercase" in response.text.lower()
        print("✓ Password without uppercase rejected")
    
    def test_password_update_rejects_no_lowercase(self):
        """Test that password without lowercase is rejected"""
        response = requests.post(f"{BASE_URL}/api/auth/set-partner-password", 
            headers=self.headers,
            json={"password": "ABCDEF12@#"})  # No lowercase
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "lowercase" in response.text.lower()
        print("✓ Password without lowercase rejected")
    
    def test_password_update_rejects_insufficient_numbers(self):
        """Test that password with < 2 numbers is rejected"""
        response = requests.post(f"{BASE_URL}/api/auth/set-partner-password", 
            headers=self.headers,
            json={"password": "Abcdef1@#"})  # Only 1 number
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "number" in response.text.lower()
        print("✓ Password with insufficient numbers rejected")
    
    def test_password_update_rejects_banned_char(self):
        """Test that password with '!' is rejected"""
        response = requests.post(f"{BASE_URL}/api/auth/set-partner-password", 
            headers=self.headers,
            json={"password": "Abcdef12!@"})  # Contains banned '!'
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "!" in response.text or "cannot contain" in response.text.lower()
        print("✓ Password with banned character '!' rejected")
    
    def test_password_update_rejects_insufficient_special(self):
        """Test that password with < 2 special chars is rejected"""
        response = requests.post(f"{BASE_URL}/api/auth/set-partner-password", 
            headers=self.headers,
            json={"password": "Abcdef12@"})  # Only 1 special char
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "special" in response.text.lower()
        print("✓ Password with insufficient special characters rejected")
    
    def test_password_update_requires_auth(self):
        """Test that password update requires authentication"""
        response = requests.post(f"{BASE_URL}/api/auth/set-partner-password", 
            json={"password": "ValidPass12@#"})
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Password update requires authentication")


class TestPINUpdateAPI:
    """Tests for /api/auth/set-credit-pin endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login as admin and get token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        self.token = response.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_pin_update_rejects_wrong_length(self):
        """Test that PIN not exactly 6 digits is rejected"""
        response = requests.post(f"{BASE_URL}/api/auth/set-credit-pin", 
            headers=self.headers,
            json={"pin": "12345", "current_password": ADMIN_PASSWORD})  # 5 digits
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "6" in response.text or "digit" in response.text.lower()
        print("✓ PIN with wrong length rejected")
    
    def test_pin_update_rejects_non_numeric(self):
        """Test that non-numeric PIN is rejected"""
        response = requests.post(f"{BASE_URL}/api/auth/set-credit-pin", 
            headers=self.headers,
            json={"pin": "12345a", "current_password": ADMIN_PASSWORD})  # Contains letter
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "digit" in response.text.lower()
        print("✓ Non-numeric PIN rejected")
    
    def test_pin_update_rejects_wrong_password(self):
        """Test that wrong current password is rejected"""
        response = requests.post(f"{BASE_URL}/api/auth/set-credit-pin", 
            headers=self.headers,
            json={"pin": "987654", "current_password": "WrongPassword123"})
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Wrong current password rejected")
    
    def test_pin_update_rejects_shared_digits(self):
        """Test that PIN with digits from password is rejected"""
        # Admin password is Credit123! which contains 1, 2, 3
        response = requests.post(f"{BASE_URL}/api/auth/set-credit-pin", 
            headers=self.headers,
            json={"pin": "123456", "current_password": ADMIN_PASSWORD})  # Contains 1, 2, 3 from password
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "shared" in response.text.lower() or "password" in response.text.lower()
        print("✓ PIN with shared digits rejected")
    
    def test_pin_update_requires_auth(self):
        """Test that PIN update requires authentication"""
        response = requests.post(f"{BASE_URL}/api/auth/set-credit-pin", 
            json={"pin": "987654", "current_password": ADMIN_PASSWORD})
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ PIN update requires authentication")


class TestSecurityDashboardIntegration:
    """Integration tests for Security Dashboard credential features"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login as admin and get token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        self.token = response.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_security_health_endpoint(self):
        """Test that security health endpoint works"""
        response = requests.get(f"{BASE_URL}/api/security/health", headers=self.headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "status" in data, "Missing status"
        print(f"✓ Security health: {data.get('status')}")
    
    def test_audit_log_summary(self):
        """Test that audit log summary endpoint works"""
        response = requests.get(f"{BASE_URL}/api/security/audit-log/summary?days=7", headers=self.headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "total_events" in data, "Missing total_events"
        print(f"✓ Audit log summary: {data.get('total_events')} events")
    
    def test_password_policy_endpoint(self):
        """Test that password policy endpoint returns correct rules"""
        response = requests.get(f"{BASE_URL}/api/auth/password-policy")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "policy" in data, "Missing policy"
        
        policy = data["policy"]
        assert policy.get("min_length") == 7, f"Expected min_length=7, got {policy.get('min_length')}"
        assert policy.get("require_upper") == True, "Expected require_upper=True"
        assert policy.get("require_lower") == True, "Expected require_lower=True"
        assert policy.get("min_numbers") == 2, f"Expected min_numbers=2, got {policy.get('min_numbers')}"
        assert policy.get("min_special") == 2, f"Expected min_special=2, got {policy.get('min_special')}"
        assert "!" in policy.get("banned_special", []), "Expected '!' in banned_special"
        assert policy.get("pin_length") == 6, f"Expected pin_length=6, got {policy.get('pin_length')}"
        assert policy.get("rotation_days") == 90, f"Expected rotation_days=90, got {policy.get('rotation_days')}"
        
        print(f"✓ Password policy correct: min_length={policy['min_length']}, rotation_days={policy['rotation_days']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
