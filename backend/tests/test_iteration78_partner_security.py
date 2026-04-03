"""
Iteration 78 Tests: Partner Security Protocol, Student Detail Profile, Trust Badge SEO, State of Company PDF, Email Scheduler

Tests:
1. Password Policy API - GET /api/auth/password-policy
2. Password Validation - POST /api/auth/set-partner-password (rejects bad passwords)
3. PIN Creation - POST /api/auth/set-credit-pin (validates 6-digit PIN with no shared digits)
4. PIN Verification - POST /api/auth/verify-credit-pin
5. Security Settings - GET/PUT /api/auth/security-settings (admin only)
6. Student Detail Profile - GET /api/school/admin/students/{id}
7. Trust Badge HTML - schema.org structured data and dofollow link
8. Badge Tracking - POST /api/school/certificates/{id}/track-badge
9. State of Company PDF - GET /api/reports/state-of-company/pdf
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"
STUDENT_EMAIL = "test@creditfix.com"
STUDENT_PASSWORD = "test123"


class TestPasswordPolicy:
    """Test password policy API - public endpoint"""
    
    def test_get_password_policy(self):
        """GET /api/auth/password-policy returns correct rules"""
        response = requests.get(f"{BASE_URL}/api/auth/password-policy")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "policy" in data, "Response should contain 'policy' key"
        
        policy = data["policy"]
        # Verify all required policy fields
        assert policy.get("min_length") == 7, "Password min length should be 7"
        assert policy.get("require_upper") == True, "Should require uppercase"
        assert policy.get("require_lower") == True, "Should require lowercase"
        assert policy.get("min_numbers") == 2, "Should require at least 2 numbers"
        assert policy.get("min_special") == 2, "Should require at least 2 special chars"
        assert "!" in policy.get("banned_special", []), "! should be banned"
        assert policy.get("pin_length") == 6, "PIN length should be 6"
        assert policy.get("rotation_days") == 90, "Rotation should be 90 days"
        print("✓ Password policy returns correct rules")


class TestPasswordValidation:
    """Test password validation endpoint"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Admin login failed: {response.text}")
        return response.json().get("access_token")
    
    def test_reject_short_password(self, admin_token):
        """POST /api/auth/set-partner-password rejects password < 7 chars"""
        response = requests.post(
            f"{BASE_URL}/api/auth/set-partner-password",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"password": "Ab1@#"}  # Only 5 chars
        )
        assert response.status_code == 400, f"Expected 400 for short password, got {response.status_code}"
        assert "7 characters" in response.json().get("detail", "").lower() or "at least" in response.json().get("detail", "").lower()
        print("✓ Rejects password shorter than 7 characters")
    
    def test_reject_no_uppercase(self, admin_token):
        """POST /api/auth/set-partner-password rejects password without uppercase"""
        response = requests.post(
            f"{BASE_URL}/api/auth/set-partner-password",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"password": "abcdef12@#"}  # No uppercase
        )
        assert response.status_code == 400, f"Expected 400 for no uppercase, got {response.status_code}"
        assert "uppercase" in response.json().get("detail", "").lower()
        print("✓ Rejects password without uppercase letter")
    
    def test_reject_insufficient_numbers(self, admin_token):
        """POST /api/auth/set-partner-password rejects password with < 2 numbers"""
        response = requests.post(
            f"{BASE_URL}/api/auth/set-partner-password",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"password": "Abcdef1@#$"}  # Only 1 number
        )
        assert response.status_code == 400, f"Expected 400 for insufficient numbers, got {response.status_code}"
        assert "number" in response.json().get("detail", "").lower()
        print("✓ Rejects password with fewer than 2 numbers")
    
    def test_reject_banned_special_char(self, admin_token):
        """POST /api/auth/set-partner-password rejects password containing '!'"""
        response = requests.post(
            f"{BASE_URL}/api/auth/set-partner-password",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"password": "Abcdef12!@"}  # Contains banned '!'
        )
        assert response.status_code == 400, f"Expected 400 for banned char, got {response.status_code}"
        assert "!" in response.json().get("detail", "")
        print("✓ Rejects password containing banned character '!'")
    
    def test_reject_insufficient_special_chars(self, admin_token):
        """POST /api/auth/set-partner-password rejects password with < 2 special chars"""
        response = requests.post(
            f"{BASE_URL}/api/auth/set-partner-password",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"password": "Abcdef12@"}  # Only 1 special char
        )
        assert response.status_code == 400, f"Expected 400 for insufficient special chars, got {response.status_code}"
        assert "special" in response.json().get("detail", "").lower()
        print("✓ Rejects password with fewer than 2 special characters")


class TestPINCreation:
    """Test PIN creation and validation"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Admin login failed: {response.text}")
        return response.json().get("access_token")
    
    def test_pin_wrong_length(self, admin_token):
        """POST /api/auth/set-credit-pin rejects PIN not 6 digits"""
        response = requests.post(
            f"{BASE_URL}/api/auth/set-credit-pin",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"pin": "12345", "current_password": ADMIN_PASSWORD}  # Only 5 digits
        )
        assert response.status_code == 400, f"Expected 400 for wrong PIN length, got {response.status_code}"
        assert "6 digits" in response.json().get("detail", "").lower() or "exactly" in response.json().get("detail", "").lower()
        print("✓ Rejects PIN not exactly 6 digits")
    
    def test_pin_non_numeric(self, admin_token):
        """POST /api/auth/set-credit-pin rejects non-numeric PIN"""
        response = requests.post(
            f"{BASE_URL}/api/auth/set-credit-pin",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"pin": "12345a", "current_password": ADMIN_PASSWORD}  # Contains letter
        )
        assert response.status_code == 400, f"Expected 400 for non-numeric PIN, got {response.status_code}"
        assert "digit" in response.json().get("detail", "").lower()
        print("✓ Rejects non-numeric PIN")
    
    def test_pin_shared_digits_with_password(self, admin_token):
        """POST /api/auth/set-credit-pin rejects PIN with digits from password"""
        # Password is Credit123! which contains 1, 2, 3
        response = requests.post(
            f"{BASE_URL}/api/auth/set-credit-pin",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"pin": "123456", "current_password": ADMIN_PASSWORD}  # Contains 1, 2, 3 from password
        )
        assert response.status_code == 400, f"Expected 400 for shared digits, got {response.status_code}"
        assert "shared" in response.json().get("detail", "").lower() or "password" in response.json().get("detail", "").lower()
        print("✓ Rejects PIN with digits shared with password")
    
    def test_pin_wrong_password(self, admin_token):
        """POST /api/auth/set-credit-pin rejects wrong current password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/set-credit-pin",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"pin": "456789", "current_password": "WrongPassword123!"}
        )
        assert response.status_code == 401, f"Expected 401 for wrong password, got {response.status_code}"
        print("✓ Rejects PIN creation with wrong current password")
    
    def test_pin_creation_success(self, admin_token):
        """POST /api/auth/set-credit-pin accepts valid PIN"""
        # Use digits not in password (Credit123! has 1,2,3)
        response = requests.post(
            f"{BASE_URL}/api/auth/set-credit-pin",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"pin": "456789", "current_password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200, f"Expected 200 for valid PIN, got {response.status_code}: {response.text}"
        assert "success" in response.json().get("message", "").lower()
        print("✓ Accepts valid 6-digit PIN with no shared digits")


class TestPINVerification:
    """Test PIN verification endpoint"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Admin login failed: {response.text}")
        return response.json().get("access_token")
    
    def test_verify_correct_pin(self, admin_token):
        """POST /api/auth/verify-credit-pin verifies correct PIN"""
        # First set a PIN
        requests.post(
            f"{BASE_URL}/api/auth/set-credit-pin",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"pin": "456789", "current_password": ADMIN_PASSWORD}
        )
        
        # Now verify it
        response = requests.post(
            f"{BASE_URL}/api/auth/verify-credit-pin",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"pin": "456789"}
        )
        assert response.status_code == 200, f"Expected 200 for correct PIN, got {response.status_code}: {response.text}"
        assert response.json().get("verified") == True
        print("✓ Verifies correct PIN successfully")
    
    def test_verify_wrong_pin(self, admin_token):
        """POST /api/auth/verify-credit-pin rejects wrong PIN"""
        response = requests.post(
            f"{BASE_URL}/api/auth/verify-credit-pin",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"pin": "000000"}  # Wrong PIN
        )
        assert response.status_code == 401, f"Expected 401 for wrong PIN, got {response.status_code}"
        print("✓ Rejects wrong PIN")


class TestSecuritySettings:
    """Test security settings endpoints (admin only)"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Admin login failed: {response.text}")
        return response.json().get("access_token")
    
    @pytest.fixture
    def student_token(self):
        """Get student auth token"""
        response = requests.post(f"{BASE_URL}/api/school/auth/login", json={
            "email": STUDENT_EMAIL,
            "password": STUDENT_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Student login failed: {response.text}")
        return response.json().get("access_token")
    
    def test_get_security_settings_admin(self, admin_token):
        """GET /api/auth/security-settings returns settings for admin"""
        response = requests.get(
            f"{BASE_URL}/api/auth/security-settings",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "settings" in data
        settings = data["settings"]
        # At minimum, rotation_days should be present (other fields may use defaults)
        assert "rotation_days" in settings or "password_min_length" in settings, "Settings should have at least rotation_days or password_min_length"
        print("✓ Admin can get security settings")
    
    def test_update_security_settings_admin(self, admin_token):
        """PUT /api/auth/security-settings updates settings for admin"""
        response = requests.put(
            f"{BASE_URL}/api/auth/security-settings",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"rotation_days": 90}  # Keep default
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        assert "settings" in response.json()
        print("✓ Admin can update security settings")
    
    def test_security_settings_non_admin_forbidden(self, student_token):
        """GET /api/auth/security-settings returns 401/403 for non-admin"""
        response = requests.get(
            f"{BASE_URL}/api/auth/security-settings",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        # School student token is not valid for CMS endpoints, so 401 is expected
        # If it were a CMS user with non-admin role, 403 would be expected
        assert response.status_code in [401, 403], f"Expected 401/403 for non-admin, got {response.status_code}"
        print("✓ Non-admin cannot access security settings")


class TestStudentDetailProfile:
    """Test student detail profile endpoint"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Admin login failed: {response.text}")
        return response.json().get("access_token")
    
    def test_get_student_detail(self, admin_token):
        """GET /api/school/admin/students/{id} returns comprehensive data"""
        # First get list of students
        list_response = requests.get(
            f"{BASE_URL}/api/school/admin/students",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert list_response.status_code == 200, f"Failed to get students list: {list_response.text}"
        
        students = list_response.json().get("students", [])
        if not students:
            pytest.skip("No students found to test detail view")
        
        student_id = students[0]["id"]
        
        # Get student detail
        response = requests.get(
            f"{BASE_URL}/api/school/admin/students/{student_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify comprehensive data structure
        assert "student" in data, "Should contain student info"
        assert "enrollments" in data, "Should contain enrollments"
        assert "certificates" in data, "Should contain certificates"
        assert "payment_plans" in data, "Should contain payment plans"
        assert "login_history" in data, "Should contain login history"
        assert "stats" in data, "Should contain stats"
        
        # Verify stats structure
        stats = data["stats"]
        assert "total_logins" in stats, "Stats should have total_logins"
        assert "courses_enrolled" in stats, "Stats should have courses_enrolled"
        assert "courses_completed" in stats, "Stats should have courses_completed"
        assert "certificates_earned" in stats, "Stats should have certificates_earned"
        assert "classes_registered" in stats, "Stats should have classes_registered"
        assert "classes_missed" in stats, "Stats should have classes_missed"
        assert "payment_plans_active" in stats, "Stats should have payment_plans_active"
        assert "badges_shared" in stats, "Stats should have badges_shared"
        
        print(f"✓ Student detail returns comprehensive data with {len(stats)} stat fields")


class TestTrustBadgeHTML:
    """Test trust badge HTML contains SEO elements"""
    
    @pytest.fixture
    def student_token(self):
        """Get student auth token"""
        response = requests.post(f"{BASE_URL}/api/school/auth/login", json={
            "email": STUDENT_EMAIL,
            "password": STUDENT_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Student login failed: {response.text}")
        return response.json().get("access_token")
    
    def test_badge_html_contains_schema(self, student_token):
        """Badge HTML contains schema.org structured data"""
        # Get certificates
        certs_response = requests.get(
            f"{BASE_URL}/api/school/certificates",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        
        if certs_response.status_code != 200:
            pytest.skip("Could not get certificates")
        
        certs = certs_response.json().get("certificates", [])
        if not certs:
            pytest.skip("No certificates found to test badge HTML")
        
        cert_id = certs[0]["id"]
        
        # Get badge HTML
        response = requests.get(
            f"{BASE_URL}/api/school/certificates/{cert_id}/badge-html",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        badge_html = response.json().get("badge_html", "")
        
        # Check for schema.org markup
        assert "schema.org" in badge_html, "Badge should contain schema.org reference"
        assert "EducationalOccupationalCredential" in badge_html, "Badge should contain EducationalOccupationalCredential schema"
        assert "itemscope" in badge_html or "application/ld+json" in badge_html, "Badge should have structured data markup"
        
        # Check for dofollow link
        assert 'rel="dofollow"' in badge_html or "rel='dofollow'" in badge_html, "Badge should contain dofollow link"
        assert "credlocity.com" in badge_html, "Badge should link to credlocity.com"
        
        print("✓ Trust badge HTML contains schema.org structured data and dofollow link")


class TestBadgeTracking:
    """Test badge tracking endpoint"""
    
    @pytest.fixture
    def student_token(self):
        """Get student auth token"""
        response = requests.post(f"{BASE_URL}/api/school/auth/login", json={
            "email": STUDENT_EMAIL,
            "password": STUDENT_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Student login failed: {response.text}")
        return response.json().get("access_token")
    
    def test_track_badge_usage(self, student_token):
        """POST /api/school/certificates/{id}/track-badge records badge usage"""
        # Get certificates
        certs_response = requests.get(
            f"{BASE_URL}/api/school/certificates",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        
        if certs_response.status_code != 200:
            pytest.skip("Could not get certificates")
        
        certs = certs_response.json().get("certificates", [])
        if not certs:
            pytest.skip("No certificates found to test badge tracking")
        
        cert_id = certs[0]["id"]
        
        # Track badge usage
        response = requests.post(
            f"{BASE_URL}/api/school/certificates/{cert_id}/track-badge",
            headers={"Authorization": f"Bearer {student_token}", "Content-Type": "application/json"},
            json={"action": "copy", "website_url": "https://test-website.com"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        assert response.json().get("tracked") == True
        print("✓ Badge tracking records usage successfully")


class TestStateOfCompanyPDF:
    """Test State of Company PDF report"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Admin login failed: {response.text}")
        return response.json().get("access_token")
    
    def test_state_of_company_pdf(self, admin_token):
        """GET /api/reports/state-of-company/pdf returns valid PDF"""
        response = requests.get(
            f"{BASE_URL}/api/reports/state-of-company/pdf",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Check content type is PDF
        content_type = response.headers.get("content-type", "")
        assert "application/pdf" in content_type, f"Expected PDF content type, got {content_type}"
        
        # Check content disposition header
        content_disp = response.headers.get("content-disposition", "")
        assert "attachment" in content_disp, "Should have attachment disposition"
        assert ".pdf" in content_disp.lower(), "Filename should have .pdf extension"
        
        # Check PDF magic bytes
        content = response.content
        assert content[:4] == b'%PDF', "Content should start with PDF magic bytes"
        
        print(f"✓ State of Company PDF generated successfully ({len(content)} bytes)")
    
    def test_state_of_company_pdf_requires_auth(self):
        """GET /api/reports/state-of-company/pdf requires authentication"""
        response = requests.get(f"{BASE_URL}/api/reports/state-of-company/pdf")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print("✓ State of Company PDF requires authentication")


class TestPartnersHubReportsTab:
    """Test Partners Hub Reports tab shows 5 report categories"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Admin login failed: {response.text}")
        return response.json().get("access_token")
    
    def test_reports_summary_has_5_categories(self, admin_token):
        """GET /api/reports/summary returns 5 business area categories"""
        response = requests.get(
            f"{BASE_URL}/api/reports/summary",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        summary = response.json().get("summary", {})
        
        # Verify all 5 categories exist
        assert "collections" in summary, "Should have collections category"
        assert "payroll" in summary, "Should have payroll category"
        assert "credit_builder" in summary, "Should have credit_builder category"
        assert "school" in summary, "Should have school category"
        assert "credit_reporting" in summary, "Should have credit_reporting category"
        
        print("✓ Reports summary contains all 5 business area categories")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
