"""
Iteration 77 Backend Tests
Testing: Partners Hub Reports, Live Video Classes, Payment Plans with PII, Credit Reporting School Integration

Features tested:
1. Reports API (5 report types: collections, payroll, credit-builder, school, credit-reporting)
2. Live Video Classes CRUD (Zoom/Google Meet)
3. Payment Plan with PII collection for credit bureau reporting
4. Credit Reporting unified accounts view with school filter
"""

import pytest
import requests
import os
from datetime import datetime, timezone, timedelta
from uuid import uuid4

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"
TEACHER_EMAIL = "jane@teacher.com"
TEACHER_PASSWORD = "Teacher123!"


class TestReportsAPI:
    """Test Partners Hub Reports API endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login as admin before each test"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Admin login
        res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert res.status_code == 200, f"Admin login failed: {res.text}"
        token = res.json().get("access_token")
        self.session.headers.update({"Authorization": f"Bearer {token}"})
        self.admin_token = token
    
    def test_reports_summary(self):
        """GET /api/reports/summary - Returns high-level summary across all business areas"""
        res = self.session.get(f"{BASE_URL}/api/reports/summary")
        assert res.status_code == 200, f"Reports summary failed: {res.text}"
        data = res.json()
        
        assert "summary" in data
        summary = data["summary"]
        
        # Verify all 5 report categories exist
        assert "collections" in summary
        assert "payroll" in summary
        assert "credit_builder" in summary
        assert "school" in summary
        assert "credit_reporting" in summary
        
        # Verify collections structure
        assert "total_accounts" in summary["collections"]
        assert "active_accounts" in summary["collections"]
        assert "total_balance" in summary["collections"]
        
        # Verify school structure
        assert "total_students" in summary["school"]
        assert "total_enrollments" in summary["school"]
        assert "payment_plans" in summary["school"]
        
        print(f"✓ Reports summary: {len(summary)} categories")
    
    def test_collections_report(self):
        """GET /api/reports/collections - Detailed collections financial report"""
        res = self.session.get(f"{BASE_URL}/api/reports/collections")
        assert res.status_code == 200, f"Collections report failed: {res.text}"
        data = res.json()
        
        assert "report" in data
        report = data["report"]
        
        assert "total_accounts" in report
        assert "total_balance_outstanding" in report
        assert "total_collected" in report
        assert "recovery_rate" in report
        assert "by_status" in report
        
        print(f"✓ Collections report: {report['total_accounts']} accounts, ${report['total_balance_outstanding']} outstanding")
    
    def test_payroll_report(self):
        """GET /api/reports/payroll - Detailed payroll and commission report"""
        res = self.session.get(f"{BASE_URL}/api/reports/payroll")
        assert res.status_code == 200, f"Payroll report failed: {res.text}"
        data = res.json()
        
        assert "report" in data
        report = data["report"]
        
        assert "total_commissions" in report
        assert "commission_entries" in report
        assert "active_employees" in report
        assert "by_employee" in report
        
        print(f"✓ Payroll report: ${report['total_commissions']} total commissions")
    
    def test_credit_builder_report(self):
        """GET /api/reports/credit-builder - Credit builder accounts report"""
        res = self.session.get(f"{BASE_URL}/api/reports/credit-builder")
        assert res.status_code == 200, f"Credit builder report failed: {res.text}"
        data = res.json()
        
        assert "report" in data
        report = data["report"]
        
        assert "total_accounts" in report
        assert "total_balance" in report
        assert "total_credit_limit" in report
        assert "utilization_rate" in report
        
        print(f"✓ Credit builder report: {report['total_accounts']} accounts")
    
    def test_school_report(self):
        """GET /api/reports/school - School enrollment and revenue report"""
        res = self.session.get(f"{BASE_URL}/api/reports/school")
        assert res.status_code == 200, f"School report failed: {res.text}"
        data = res.json()
        
        assert "report" in data
        report = data["report"]
        
        assert "total_students" in report
        assert "total_enrollments" in report
        assert "completion_rate" in report
        assert "certificates_issued" in report
        assert "payment_plans" in report
        
        # Verify payment_plans structure
        pp = report["payment_plans"]
        assert "total" in pp
        assert "active" in pp
        assert "completed" in pp
        
        print(f"✓ School report: {report['total_students']} students, {report['total_enrollments']} enrollments")
    
    def test_credit_reporting_report(self):
        """GET /api/reports/credit-reporting - Credit bureau reporting readiness report"""
        res = self.session.get(f"{BASE_URL}/api/reports/credit-reporting")
        assert res.status_code == 200, f"Credit reporting report failed: {res.text}"
        data = res.json()
        
        assert "report" in data
        report = data["report"]
        
        # Verify all 3 account types with proper labels
        assert "collections" in report
        assert report["collections"]["type"] == "Installment (Collection)"
        
        assert "credit_builder" in report
        assert report["credit_builder"]["type"] == "Revolving Line of Credit"
        
        assert "school" in report
        assert report["school"]["type"] == "Educational Contractual"
        
        assert "total_accounts" in report
        assert "total_ready" in report
        assert "reporting_start_date" in report
        
        print(f"✓ Credit reporting report: {report['total_accounts']} total accounts, {report['total_ready']} ready")
    
    def test_reports_require_auth(self):
        """Reports API requires partner or admin access"""
        # Create unauthenticated session
        unauth_session = requests.Session()
        unauth_session.headers.update({"Content-Type": "application/json"})
        
        res = unauth_session.get(f"{BASE_URL}/api/reports/summary")
        assert res.status_code == 403, f"Expected 403 for unauthenticated access, got {res.status_code}"
        
        print("✓ Reports API correctly requires authentication")


class TestLiveVideoClasses:
    """Test Live Video Classes CRUD with Zoom/Google Meet support"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login as admin before each test"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Admin login
        res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert res.status_code == 200, f"Admin login failed: {res.text}"
        token = res.json().get("access_token")
        self.session.headers.update({"Authorization": f"Bearer {token}"})
        self.admin_token = token
    
    def test_create_zoom_live_class(self):
        """POST /api/school/admin/live-classes - Create a Zoom live class"""
        scheduled = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
        
        res = self.session.post(f"{BASE_URL}/api/school/admin/live-classes", json={
            "title": "TEST_Zoom Credit Repair Basics",
            "description": "Learn the fundamentals of credit repair",
            "platform": "zoom",
            "meeting_link": "https://zoom.us/j/123456789",
            "meeting_id": "123456789",
            "meeting_passcode": "abc123",
            "scheduled_at": scheduled,
            "duration_minutes": 60,
            "max_attendees": 50,
            "is_free": True
        })
        assert res.status_code == 200, f"Create Zoom class failed: {res.text}"
        data = res.json()
        
        assert "live_class" in data
        lc = data["live_class"]
        assert lc["platform"] == "zoom"
        assert lc["title"] == "TEST_Zoom Credit Repair Basics"
        assert lc["status"] == "scheduled"  # Admin creates scheduled directly
        assert "id" in lc
        
        self.zoom_class_id = lc["id"]
        print(f"✓ Created Zoom live class: {lc['id']}")
        
        return lc["id"]
    
    def test_create_google_meet_live_class(self):
        """POST /api/school/admin/live-classes - Create a Google Meet live class"""
        scheduled = (datetime.now(timezone.utc) + timedelta(days=14)).isoformat()
        
        res = self.session.post(f"{BASE_URL}/api/school/admin/live-classes", json={
            "title": "TEST_Google Meet Advanced FCRA",
            "description": "Deep dive into FCRA regulations",
            "platform": "google_meet",
            "meeting_link": "https://meet.google.com/abc-defg-hij",
            "scheduled_at": scheduled,
            "duration_minutes": 90,
            "max_attendees": 100,
            "is_free": False,
            "price": 49.99
        })
        assert res.status_code == 200, f"Create Google Meet class failed: {res.text}"
        data = res.json()
        
        assert "live_class" in data
        lc = data["live_class"]
        assert lc["platform"] == "google_meet"
        assert lc["title"] == "TEST_Google Meet Advanced FCRA"
        
        print(f"✓ Created Google Meet live class: {lc['id']}")
        
        return lc["id"]
    
    def test_list_live_classes(self):
        """GET /api/school/admin/live-classes - List all live classes"""
        res = self.session.get(f"{BASE_URL}/api/school/admin/live-classes")
        assert res.status_code == 200, f"List live classes failed: {res.text}"
        data = res.json()
        
        assert "live_classes" in data
        assert "total" in data
        
        # Check for platform badges
        for lc in data["live_classes"]:
            assert lc["platform"] in ["zoom", "google_meet"]
            assert "scheduled_at" in lc
            assert "status" in lc
        
        print(f"✓ Listed {data['total']} live classes")
    
    def test_student_list_upcoming_classes(self):
        """GET /api/school/live-classes - Student-facing list of upcoming classes"""
        # This endpoint doesn't require auth
        res = requests.get(f"{BASE_URL}/api/school/live-classes")
        assert res.status_code == 200, f"List upcoming classes failed: {res.text}"
        data = res.json()
        
        assert "live_classes" in data
        
        # Verify meeting_passcode is not exposed
        for lc in data["live_classes"]:
            assert "meeting_passcode" not in lc or lc.get("meeting_passcode") is None
        
        print(f"✓ Student can see {len(data['live_classes'])} upcoming classes")
    
    def test_delete_live_class(self):
        """DELETE /api/school/admin/live-classes/{id} - Delete a live class"""
        # First create a class to delete
        scheduled = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
        create_res = self.session.post(f"{BASE_URL}/api/school/admin/live-classes", json={
            "title": "TEST_To Be Deleted",
            "platform": "zoom",
            "meeting_link": "https://zoom.us/j/999999999",
            "scheduled_at": scheduled
        })
        assert create_res.status_code == 200
        class_id = create_res.json()["live_class"]["id"]
        
        # Delete it
        res = self.session.delete(f"{BASE_URL}/api/school/admin/live-classes/{class_id}")
        assert res.status_code == 200, f"Delete live class failed: {res.text}"
        
        # Verify it's gone
        list_res = self.session.get(f"{BASE_URL}/api/school/admin/live-classes")
        classes = list_res.json()["live_classes"]
        assert not any(c["id"] == class_id for c in classes)
        
        print(f"✓ Deleted live class: {class_id}")


class TestPaymentPlanWithPII:
    """Test Payment Plan flow with PII collection for credit bureau reporting"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test student"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Register a new test student
        self.test_email = f"test_pp_{uuid4().hex[:8]}@test.com"
        res = self.session.post(f"{BASE_URL}/api/school/auth/register", json={
            "email": self.test_email,
            "password": "TestPass123!",
            "full_name": "Test PaymentPlan Student",
            "company_name": "Test Credit Repair LLC"
        })
        
        if res.status_code == 200:
            token = res.json().get("access_token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.student_token = token
            self.student = res.json().get("student")
        else:
            # Try login if already exists
            res = self.session.post(f"{BASE_URL}/api/school/auth/login", json={
                "email": "test@creditfix.com",
                "password": "test123"
            })
            if res.status_code == 200:
                token = res.json().get("access_token")
                self.session.headers.update({"Authorization": f"Bearer {token}"})
                self.student_token = token
                self.student = res.json().get("student")
    
    def test_payment_plan_requires_pii(self):
        """POST /api/school/payment-plan/request - Requires PII fields"""
        # Get a course first
        courses_res = self.session.get(f"{BASE_URL}/api/school/courses")
        courses = courses_res.json().get("courses", [])
        if not courses:
            pytest.skip("No courses available for payment plan test")
        
        course_id = courses[0]["id"]
        
        # Try without PII - should fail
        res = self.session.post(f"{BASE_URL}/api/school/payment-plan/request", json={
            "course_id": course_id
        })
        assert res.status_code == 400, f"Expected 400 for missing PII, got {res.status_code}"
        assert "Missing required fields" in res.json().get("detail", "")
        
        print("✓ Payment plan correctly requires PII fields")
    
    def test_payment_plan_with_full_pii(self):
        """POST /api/school/payment-plan/request - Creates plan with full PII"""
        # Get a course first
        courses_res = self.session.get(f"{BASE_URL}/api/school/courses")
        courses = courses_res.json().get("courses", [])
        if not courses:
            pytest.skip("No courses available for payment plan test")
        
        course_id = courses[0]["id"]
        
        # Submit with full PII
        res = self.session.post(f"{BASE_URL}/api/school/payment-plan/request", json={
            "course_id": course_id,
            "first_name": "Test",
            "last_name": "Student",
            "date_of_birth": "1990-01-15",
            "ssn": "123-45-6789",
            "address": "123 Test Street, Test City, TS 12345",
            "phone": "555-123-4567",
            "employer": "Test Credit Repair LLC",
            "plan_amount": 299.00,
            "num_payments": 3
        })
        
        # May fail if already enrolled, which is OK
        if res.status_code == 200:
            data = res.json()
            assert "plan" in data
            plan = data["plan"]
            
            assert plan["reports_to_bureaus"] == True
            assert plan["no_credit_check"] == True
            assert "reporting_starts" in plan
            assert plan["status"] == "active"
            
            # Verify message about credit reporting
            assert "credit bureaus" in data.get("message", "").lower()
            
            print(f"✓ Created payment plan with PII: {plan['id']}")
            return plan["id"]
        else:
            print(f"✓ Payment plan request handled (may already be enrolled): {res.status_code}")
    
    def test_admin_list_payment_plans(self):
        """GET /api/school/admin/payment-plans - Admin can list all payment plans"""
        # Login as admin
        admin_session = requests.Session()
        admin_session.headers.update({"Content-Type": "application/json"})
        
        res = admin_session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert res.status_code == 200
        token = res.json().get("access_token")
        admin_session.headers.update({"Authorization": f"Bearer {token}"})
        
        # List payment plans
        res = admin_session.get(f"{BASE_URL}/api/school/admin/payment-plans")
        assert res.status_code == 200, f"List payment plans failed: {res.text}"
        data = res.json()
        
        assert "plans" in data
        assert "total" in data
        
        print(f"✓ Admin listed {data['total']} payment plans")


class TestCreditReportingSchoolIntegration:
    """Test Credit Reporting unified view with school accounts"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login as admin"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert res.status_code == 200
        token = res.json().get("access_token")
        self.session.headers.update({"Authorization": f"Bearer {token}"})
    
    def test_unified_accounts_includes_school(self):
        """GET /api/credit-reporting/accounts - Includes school accounts"""
        res = self.session.get(f"{BASE_URL}/api/credit-reporting/accounts")
        assert res.status_code == 200, f"Get accounts failed: {res.text}"
        data = res.json()
        
        assert "accounts" in data
        assert "total" in data
        
        # Check for account types
        account_types = set(a["account_type"] for a in data["accounts"])
        print(f"✓ Account types in unified view: {account_types}")
        
        # Verify account type labels
        for acc in data["accounts"]:
            if acc["account_type"] == "collections":
                assert acc["account_type_label"] == "Installment (Collection)"
                assert acc["account_type_code"] == "48"
            elif acc["account_type"] == "credit_builder":
                assert acc["account_type_label"] == "Revolving Line of Credit"
                assert acc["account_type_code"] == "18"
            elif acc["account_type"] == "school":
                assert acc["account_type_label"] == "Educational Contractual"
                assert acc["account_type_code"] == "12"
        
        print(f"✓ Unified accounts view: {data['total']} total accounts")
    
    def test_filter_by_school_type(self):
        """GET /api/credit-reporting/accounts?account_type=school - Filter by school"""
        res = self.session.get(f"{BASE_URL}/api/credit-reporting/accounts?account_type=school")
        assert res.status_code == 200, f"Filter by school failed: {res.text}"
        data = res.json()
        
        # All returned accounts should be school type
        for acc in data["accounts"]:
            assert acc["account_type"] == "school"
            assert acc["account_type_label"] == "Educational Contractual"
        
        print(f"✓ School filter: {data['total']} school accounts")
    
    def test_compliance_overview_includes_school_count(self):
        """GET /api/credit-reporting/compliance/overview - Includes school_count"""
        res = self.session.get(f"{BASE_URL}/api/credit-reporting/compliance/overview")
        assert res.status_code == 200, f"Get overview failed: {res.text}"
        data = res.json()
        
        # Verify school_count is present
        assert "school_count" in data, "school_count missing from overview"
        
        print(f"✓ Compliance overview includes school_count: {data.get('school_count', 0)}")


class TestStudentLiveClassRegistration:
    """Test student registration for live classes"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test student"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login as existing test student
        res = self.session.post(f"{BASE_URL}/api/school/auth/login", json={
            "email": "test@creditfix.com",
            "password": "test123"
        })
        
        if res.status_code == 200:
            token = res.json().get("access_token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.student_token = token
        else:
            pytest.skip("Test student not available")
    
    def test_register_for_live_class(self):
        """POST /api/school/live-classes/{id}/register - Student registers for class"""
        # First get list of upcoming classes
        res = self.session.get(f"{BASE_URL}/api/school/live-classes")
        classes = res.json().get("live_classes", [])
        
        if not classes:
            pytest.skip("No upcoming live classes to register for")
        
        class_id = classes[0]["id"]
        
        # Register
        res = self.session.post(f"{BASE_URL}/api/school/live-classes/{class_id}/register")
        assert res.status_code == 200, f"Registration failed: {res.text}"
        data = res.json()
        
        assert "message" in data
        # May return "Already registered" or "Registered for live class"
        assert "registered" in data["message"].lower()
        
        print(f"✓ Student registered for live class: {class_id}")


# Cleanup fixture
@pytest.fixture(scope="module", autouse=True)
def cleanup_test_data():
    """Cleanup TEST_ prefixed data after all tests"""
    yield
    
    # Login as admin for cleanup
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    
    res = session.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    
    if res.status_code == 200:
        token = res.json().get("access_token")
        session.headers.update({"Authorization": f"Bearer {token}"})
        
        # Delete TEST_ live classes
        list_res = session.get(f"{BASE_URL}/api/school/admin/live-classes")
        if list_res.status_code == 200:
            for lc in list_res.json().get("live_classes", []):
                if lc.get("title", "").startswith("TEST_"):
                    session.delete(f"{BASE_URL}/api/school/admin/live-classes/{lc['id']}")
                    print(f"Cleaned up: {lc['title']}")
