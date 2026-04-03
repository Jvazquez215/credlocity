"""
Test Suite for School Management Admin Panel
Tests admin CMS endpoints for school management, guest teacher role, and RBAC
"""

import pytest
import requests
import os
from uuid import uuid4

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"
GUEST_TEACHER_EMAIL = "jane@teacher.com"
GUEST_TEACHER_PASSWORD = "Teacher123!"


class TestAdminAuth:
    """Test admin authentication"""
    
    def test_admin_login_success(self):
        """Admin can log in successfully"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data.get("user", {}).get("role") in ["admin", "super_admin"]
        print(f"✓ Admin login successful, role: {data.get('user', {}).get('role')}")
    
    def test_guest_teacher_login_success(self):
        """Guest teacher can log in successfully"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": GUEST_TEACHER_EMAIL,
            "password": GUEST_TEACHER_PASSWORD
        })
        assert response.status_code == 200, f"Guest teacher login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data.get("user", {}).get("role") == "guest_teacher"
        print(f"✓ Guest teacher login successful, role: {data.get('user', {}).get('role')}")


class TestSchoolAdminStats:
    """Test school admin statistics endpoint"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin login failed")
    
    def test_admin_stats_endpoint(self, admin_token):
        """Admin can access school stats"""
        response = requests.get(
            f"{BASE_URL}/api/school/admin/stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Stats endpoint failed: {response.text}"
        data = response.json()
        assert "stats" in data
        stats = data["stats"]
        assert "total_students" in stats
        assert "total_enrollments" in stats
        assert "total_certificates" in stats
        assert "completion_rate" in stats
        assert "pending_courses" in stats
        print(f"✓ Admin stats: {stats}")
    
    def test_guest_teacher_cannot_access_stats(self):
        """Guest teacher cannot access admin stats"""
        # Login as guest teacher
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": GUEST_TEACHER_EMAIL,
            "password": GUEST_TEACHER_PASSWORD
        })
        if login_resp.status_code != 200:
            pytest.skip("Guest teacher login failed")
        token = login_resp.json().get("access_token")
        
        response = requests.get(
            f"{BASE_URL}/api/school/admin/stats",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403, f"Guest teacher should not access stats: {response.status_code}"
        print("✓ Guest teacher correctly denied access to admin stats")


class TestSchoolAdminCourses:
    """Test school admin course management"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin login failed")
    
    @pytest.fixture
    def teacher_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": GUEST_TEACHER_EMAIL,
            "password": GUEST_TEACHER_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Guest teacher login failed")
    
    def test_admin_list_all_courses(self, admin_token):
        """Admin can list all courses including drafts"""
        response = requests.get(
            f"{BASE_URL}/api/school/admin/courses",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"List courses failed: {response.text}"
        data = response.json()
        assert "courses" in data
        print(f"✓ Admin can list all courses: {len(data['courses'])} courses found")
    
    def test_admin_create_course_published(self, admin_token):
        """Admin creates course that is immediately published"""
        course_data = {
            "title": f"TEST_Admin Course {uuid4().hex[:6]}",
            "description": "Test course created by admin",
            "short_name": "TADM",
            "passing_score": 80
        }
        response = requests.post(
            f"{BASE_URL}/api/school/admin/courses",
            headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"},
            json=course_data
        )
        assert response.status_code == 200, f"Create course failed: {response.text}"
        data = response.json()
        assert data.get("course", {}).get("status") == "published"
        print(f"✓ Admin course created with status: {data.get('course', {}).get('status')}")
        
        # Cleanup - delete the test course
        course_id = data.get("course", {}).get("id")
        if course_id:
            requests.delete(
                f"{BASE_URL}/api/school/admin/courses/{course_id}",
                headers={"Authorization": f"Bearer {admin_token}"}
            )
    
    def test_teacher_create_course_pending(self, teacher_token):
        """Guest teacher creates course that defaults to pending_approval"""
        course_data = {
            "title": f"TEST_Teacher Course {uuid4().hex[:6]}",
            "description": "Test course created by guest teacher",
            "short_name": "TTCH",
            "passing_score": 75
        }
        response = requests.post(
            f"{BASE_URL}/api/school/admin/courses",
            headers={"Authorization": f"Bearer {teacher_token}", "Content-Type": "application/json"},
            json=course_data
        )
        assert response.status_code == 200, f"Create course failed: {response.text}"
        data = response.json()
        assert data.get("course", {}).get("status") == "pending_approval"
        print(f"✓ Teacher course created with status: {data.get('course', {}).get('status')}")
        
        # Store course_id for cleanup in later tests
        return data.get("course", {}).get("id")


class TestSchoolAdminPendingCourses:
    """Test pending course approval workflow"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin login failed")
    
    @pytest.fixture
    def teacher_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": GUEST_TEACHER_EMAIL,
            "password": GUEST_TEACHER_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Guest teacher login failed")
    
    def test_admin_list_pending_courses(self, admin_token):
        """Admin can list pending courses"""
        response = requests.get(
            f"{BASE_URL}/api/school/admin/pending-courses",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"List pending courses failed: {response.text}"
        data = response.json()
        assert "courses" in data
        assert "total" in data
        print(f"✓ Admin can list pending courses: {data['total']} pending")
    
    def test_teacher_cannot_access_pending_courses(self, teacher_token):
        """Guest teacher cannot access pending courses list"""
        response = requests.get(
            f"{BASE_URL}/api/school/admin/pending-courses",
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert response.status_code == 403, f"Teacher should not access pending list: {response.status_code}"
        print("✓ Guest teacher correctly denied access to pending courses list")
    
    def test_approve_course_workflow(self, admin_token, teacher_token):
        """Full workflow: teacher creates, admin approves"""
        # Teacher creates course
        course_data = {
            "title": f"TEST_Approval Workflow {uuid4().hex[:6]}",
            "description": "Course for approval workflow test",
            "short_name": "TAPV"
        }
        create_resp = requests.post(
            f"{BASE_URL}/api/school/admin/courses",
            headers={"Authorization": f"Bearer {teacher_token}", "Content-Type": "application/json"},
            json=course_data
        )
        assert create_resp.status_code == 200
        course_id = create_resp.json().get("course", {}).get("id")
        assert course_id
        
        # Verify it's pending
        assert create_resp.json().get("course", {}).get("status") == "pending_approval"
        
        # Admin approves
        approve_resp = requests.put(
            f"{BASE_URL}/api/school/admin/courses/{course_id}/approve",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert approve_resp.status_code == 200, f"Approve failed: {approve_resp.text}"
        print("✓ Course approval workflow completed successfully")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/school/admin/courses/{course_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    def test_reject_course_workflow(self, admin_token, teacher_token):
        """Full workflow: teacher creates, admin rejects"""
        # Teacher creates course
        course_data = {
            "title": f"TEST_Rejection Workflow {uuid4().hex[:6]}",
            "description": "Course for rejection workflow test",
            "short_name": "TREJ"
        }
        create_resp = requests.post(
            f"{BASE_URL}/api/school/admin/courses",
            headers={"Authorization": f"Bearer {teacher_token}", "Content-Type": "application/json"},
            json=course_data
        )
        assert create_resp.status_code == 200
        course_id = create_resp.json().get("course", {}).get("id")
        
        # Admin rejects with reason
        reject_resp = requests.put(
            f"{BASE_URL}/api/school/admin/courses/{course_id}/reject",
            headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"},
            json={"reason": "Test rejection reason"}
        )
        assert reject_resp.status_code == 200, f"Reject failed: {reject_resp.text}"
        print("✓ Course rejection workflow completed successfully")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/school/admin/courses/{course_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    def test_teacher_cannot_approve_course(self, admin_token, teacher_token):
        """Guest teacher cannot approve courses"""
        # First create a pending course
        course_data = {
            "title": f"TEST_Teacher Approve Attempt {uuid4().hex[:6]}",
            "short_name": "TTAA"
        }
        create_resp = requests.post(
            f"{BASE_URL}/api/school/admin/courses",
            headers={"Authorization": f"Bearer {teacher_token}", "Content-Type": "application/json"},
            json=course_data
        )
        course_id = create_resp.json().get("course", {}).get("id")
        
        # Teacher tries to approve
        approve_resp = requests.put(
            f"{BASE_URL}/api/school/admin/courses/{course_id}/approve",
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert approve_resp.status_code == 403, f"Teacher should not approve: {approve_resp.status_code}"
        print("✓ Guest teacher correctly denied course approval")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/school/admin/courses/{course_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )


class TestSchoolAdminTeachers:
    """Test guest teacher management"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin login failed")
    
    @pytest.fixture
    def teacher_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": GUEST_TEACHER_EMAIL,
            "password": GUEST_TEACHER_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Guest teacher login failed")
    
    def test_admin_list_teachers(self, admin_token):
        """Admin can list all guest teachers"""
        response = requests.get(
            f"{BASE_URL}/api/school/admin/teachers",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"List teachers failed: {response.text}"
        data = response.json()
        assert "teachers" in data
        assert "total" in data
        print(f"✓ Admin can list teachers: {data['total']} teachers found")
        
        # Verify teacher data includes course counts
        if data["teachers"]:
            teacher = data["teachers"][0]
            assert "total_courses" in teacher
            assert "published_courses" in teacher
            assert "pending_courses" in teacher
    
    def test_admin_create_teacher(self, admin_token):
        """Admin can create a new guest teacher"""
        teacher_data = {
            "full_name": f"TEST_Teacher {uuid4().hex[:6]}",
            "email": f"test_teacher_{uuid4().hex[:6]}@test.com",
            "password": "TestPass123!",
            "bio": "Test teacher bio",
            "specialization": "Credit Repair"
        }
        response = requests.post(
            f"{BASE_URL}/api/school/admin/teachers",
            headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"},
            json=teacher_data
        )
        assert response.status_code == 200, f"Create teacher failed: {response.text}"
        data = response.json()
        assert "teacher" in data
        assert data["teacher"]["role"] == "guest_teacher"
        print(f"✓ Admin created guest teacher: {data['teacher']['email']}")
    
    def test_teacher_cannot_list_teachers(self, teacher_token):
        """Guest teacher cannot list other teachers"""
        response = requests.get(
            f"{BASE_URL}/api/school/admin/teachers",
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert response.status_code == 403, f"Teacher should not list teachers: {response.status_code}"
        print("✓ Guest teacher correctly denied access to teachers list")


class TestSchoolAdminStudents:
    """Test student management"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin login failed")
    
    def test_admin_list_students(self, admin_token):
        """Admin can list all students"""
        response = requests.get(
            f"{BASE_URL}/api/school/admin/students",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"List students failed: {response.text}"
        data = response.json()
        assert "students" in data
        assert "total" in data
        print(f"✓ Admin can list students: {data['total']} students found")


class TestTeacherMyCourses:
    """Test guest teacher's own courses endpoint"""
    
    @pytest.fixture
    def teacher_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": GUEST_TEACHER_EMAIL,
            "password": GUEST_TEACHER_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Guest teacher login failed")
    
    def test_teacher_my_courses(self, teacher_token):
        """Guest teacher can view their own courses"""
        response = requests.get(
            f"{BASE_URL}/api/school/admin/my-courses",
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert response.status_code == 200, f"My courses failed: {response.text}"
        data = response.json()
        assert "courses" in data
        print(f"✓ Guest teacher can view their courses: {len(data['courses'])} courses")


class TestTeacherBadge:
    """Test teacher trust badge endpoint"""
    
    @pytest.fixture
    def teacher_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": GUEST_TEACHER_EMAIL,
            "password": GUEST_TEACHER_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Guest teacher login failed")
    
    def test_teacher_badge_endpoint(self, teacher_token):
        """Guest teacher can get their trust badge if they have approved courses"""
        response = requests.get(
            f"{BASE_URL}/api/school/admin/teacher-badge",
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        # May return 200 (has badge) or 404 (no approved courses)
        if response.status_code == 200:
            data = response.json()
            assert "badge_html" in data
            assert "approved_courses" in data
            assert data["approved_courses"] > 0
            # Verify badge contains Credlocity backlink
            assert "credlocity.com" in data["badge_html"].lower()
            print(f"✓ Teacher badge available: {data['approved_courses']} approved courses")
        elif response.status_code == 404:
            print("✓ Teacher badge not available (no approved courses yet)")
        else:
            pytest.fail(f"Unexpected status: {response.status_code}")


class TestRBACPermissions:
    """Test RBAC permissions for guest teacher role"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin login failed")
    
    @pytest.fixture
    def teacher_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": GUEST_TEACHER_EMAIL,
            "password": GUEST_TEACHER_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Guest teacher login failed")
    
    def test_admin_permissions(self, admin_token):
        """Admin has full permissions"""
        response = requests.get(
            f"{BASE_URL}/api/rbac/my-permissions",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Get permissions failed: {response.text}"
        data = response.json()
        assert "permissions" in data
        assert data.get("is_admin") == True
        print(f"✓ Admin has {len(data['permissions'])} permissions, is_admin: {data.get('is_admin')}")
    
    def test_teacher_limited_permissions(self, teacher_token):
        """Guest teacher has limited permissions"""
        response = requests.get(
            f"{BASE_URL}/api/rbac/my-permissions",
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert response.status_code == 200, f"Get permissions failed: {response.text}"
        data = response.json()
        assert "permissions" in data
        
        # Guest teacher should have these permissions
        expected_perms = ["dashboard.view", "school.view", "school.manage", "settings.view"]
        for perm in expected_perms:
            assert perm in data["permissions"], f"Missing permission: {perm}"
        
        # Guest teacher should NOT have these permissions
        forbidden_perms = ["collections.view", "payroll.view", "team.manage", "marketing.manage"]
        for perm in forbidden_perms:
            assert perm not in data["permissions"], f"Should not have permission: {perm}"
        
        assert data.get("is_admin") == False
        print(f"✓ Guest teacher has correct limited permissions: {data['permissions']}")


class TestSecurityDeleteCourse:
    """Test that guest teacher cannot delete courses"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin login failed")
    
    @pytest.fixture
    def teacher_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": GUEST_TEACHER_EMAIL,
            "password": GUEST_TEACHER_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Guest teacher login failed")
    
    def test_teacher_cannot_delete_course(self, admin_token, teacher_token):
        """Guest teacher cannot delete any course"""
        # First create a course as teacher
        course_data = {
            "title": f"TEST_Delete Security {uuid4().hex[:6]}",
            "short_name": "TDEL"
        }
        create_resp = requests.post(
            f"{BASE_URL}/api/school/admin/courses",
            headers={"Authorization": f"Bearer {teacher_token}", "Content-Type": "application/json"},
            json=course_data
        )
        course_id = create_resp.json().get("course", {}).get("id")
        
        # Teacher tries to delete
        delete_resp = requests.delete(
            f"{BASE_URL}/api/school/admin/courses/{course_id}",
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert delete_resp.status_code == 403, f"Teacher should not delete: {delete_resp.status_code}"
        print("✓ Guest teacher correctly denied course deletion")
        
        # Cleanup with admin
        requests.delete(
            f"{BASE_URL}/api/school/admin/courses/{course_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
