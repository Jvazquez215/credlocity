"""
Test suite for CROA Ethics School API
Tests: Student auth, courses, enrollment, quizzes, certificates, discussions, chat, admin stats
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test student credentials
TEST_EMAIL = f"test_school_{uuid.uuid4().hex[:8]}@testschool.com"
TEST_PASSWORD = "testpass123"
TEST_NAME = "Test School Student"
TEST_COMPANY = "Test Credit Repair Co"

# Admin credentials for admin-only endpoints
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"


class TestSchoolAuth:
    """Test student registration and login"""
    
    student_token = None
    student_data = None
    
    def test_register_student_success(self):
        """POST /api/school/auth/register creates a new student account"""
        response = requests.post(f"{BASE_URL}/api/school/auth/register", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "full_name": TEST_NAME,
            "company_name": TEST_COMPANY
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "access_token" in data, "Response should contain access_token"
        assert "student" in data, "Response should contain student data"
        assert data["student"]["email"] == TEST_EMAIL.lower()
        assert data["student"]["full_name"] == TEST_NAME
        assert data["student"]["company_name"] == TEST_COMPANY
        assert "password_hash" not in data["student"], "Password hash should not be exposed"
        
        TestSchoolAuth.student_token = data["access_token"]
        TestSchoolAuth.student_data = data["student"]
        print(f"✓ Student registered: {TEST_EMAIL}")
    
    def test_register_duplicate_email(self):
        """POST /api/school/auth/register rejects duplicate email"""
        response = requests.post(f"{BASE_URL}/api/school/auth/register", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "full_name": "Another Student"
        })
        assert response.status_code == 409, f"Expected 409 for duplicate, got {response.status_code}"
        print("✓ Duplicate email rejected")
    
    def test_register_missing_fields(self):
        """POST /api/school/auth/register validates required fields"""
        response = requests.post(f"{BASE_URL}/api/school/auth/register", json={
            "email": "incomplete@test.com"
        })
        assert response.status_code == 400, f"Expected 400 for missing fields, got {response.status_code}"
        print("✓ Missing fields validation works")
    
    def test_login_student_success(self):
        """POST /api/school/auth/login authenticates student"""
        response = requests.post(f"{BASE_URL}/api/school/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "access_token" in data
        assert "student" in data
        assert data["student"]["email"] == TEST_EMAIL.lower()
        print("✓ Student login successful")
    
    def test_login_invalid_credentials(self):
        """POST /api/school/auth/login rejects invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/school/auth/login", json={
            "email": TEST_EMAIL,
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Invalid credentials rejected")
    
    def test_get_student_profile(self):
        """GET /api/school/auth/me returns current student profile"""
        response = requests.get(f"{BASE_URL}/api/school/auth/me", headers={
            "Authorization": f"Bearer {TestSchoolAuth.student_token}"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "student" in data
        assert data["student"]["email"] == TEST_EMAIL.lower()
        print("✓ Student profile retrieved")
    
    def test_get_profile_unauthorized(self):
        """GET /api/school/auth/me requires authentication"""
        response = requests.get(f"{BASE_URL}/api/school/auth/me")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Unauthorized access rejected")


class TestSchoolCourses:
    """Test course listing and enrollment"""
    
    def test_list_courses_public(self):
        """GET /api/school/courses returns 3 published courses"""
        response = requests.get(f"{BASE_URL}/api/school/courses")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "courses" in data
        courses = data["courses"]
        assert len(courses) == 3, f"Expected 3 courses, got {len(courses)}"
        
        # Verify course IDs
        course_ids = [c["id"] for c in courses]
        assert "croa-basics" in course_ids
        assert "fcra-certification" in course_ids
        assert "credit-repair-ethics" in course_ids
        
        # Verify course structure
        for course in courses:
            assert "title" in course
            assert "description" in course
            assert "passing_score" in course
            assert "total_questions" in course
            assert "is_free" in course
            assert course["is_free"] == True
        
        print(f"✓ Listed {len(courses)} courses: {course_ids}")
    
    def test_get_course_detail(self):
        """GET /api/school/courses/{id} returns course with lessons"""
        response = requests.get(f"{BASE_URL}/api/school/courses/croa-basics", headers={
            "Authorization": f"Bearer {TestSchoolAuth.student_token}"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "course" in data
        course = data["course"]
        assert course["id"] == "croa-basics"
        assert "lessons" in course
        assert len(course["lessons"]) > 0
        print(f"✓ Course detail retrieved with {len(course['lessons'])} lessons")
    
    def test_get_course_not_found(self):
        """GET /api/school/courses/{id} returns 404 for invalid course"""
        response = requests.get(f"{BASE_URL}/api/school/courses/nonexistent-course")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Invalid course returns 404")
    
    def test_enroll_in_course(self):
        """POST /api/school/courses/{id}/enroll enrolls student"""
        response = requests.post(f"{BASE_URL}/api/school/courses/croa-basics/enroll", headers={
            "Authorization": f"Bearer {TestSchoolAuth.student_token}"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "message" in data
        print("✓ Student enrolled in course")
    
    def test_enroll_already_enrolled(self):
        """POST /api/school/courses/{id}/enroll handles re-enrollment"""
        response = requests.post(f"{BASE_URL}/api/school/courses/croa-basics/enroll", headers={
            "Authorization": f"Bearer {TestSchoolAuth.student_token}"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "Already enrolled" in response.json().get("message", "")
        print("✓ Re-enrollment handled gracefully")
    
    def test_enroll_unauthorized(self):
        """POST /api/school/courses/{id}/enroll requires authentication"""
        response = requests.post(f"{BASE_URL}/api/school/courses/croa-basics/enroll")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Enrollment requires authentication")


class TestSchoolQuiz:
    """Test quiz retrieval and submission"""
    
    def test_get_quiz_questions(self):
        """GET /api/school/courses/{id}/quiz returns questions without answers"""
        response = requests.get(f"{BASE_URL}/api/school/courses/croa-basics/quiz", headers={
            "Authorization": f"Bearer {TestSchoolAuth.student_token}"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "quiz" in data
        quiz = data["quiz"]
        assert quiz["course_id"] == "croa-basics"
        assert quiz["total_questions"] == 20
        assert quiz["passing_score"] == 80
        assert "questions" in quiz
        
        # Verify answers are not exposed
        for q in quiz["questions"]:
            assert "correct_answer" not in q, "Correct answer should not be exposed"
            assert "id" in q
            assert "question" in q
            assert "options" in q
        
        print(f"✓ Quiz retrieved with {len(quiz['questions'])} questions (answers hidden)")
    
    def test_get_quiz_not_enrolled(self):
        """GET /api/school/courses/{id}/quiz requires enrollment"""
        # Create a new student who is not enrolled
        new_email = f"test_notenrolled_{uuid.uuid4().hex[:8]}@test.com"
        reg_response = requests.post(f"{BASE_URL}/api/school/auth/register", json={
            "email": new_email,
            "password": "testpass123",
            "full_name": "Not Enrolled Student"
        })
        new_token = reg_response.json().get("access_token")
        
        response = requests.get(f"{BASE_URL}/api/school/courses/fcra-certification/quiz", headers={
            "Authorization": f"Bearer {new_token}"
        })
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ Quiz access requires enrollment")
    
    def test_submit_quiz_passing(self):
        """POST /api/school/courses/{id}/quiz/submit grades quiz and issues certificate"""
        # CROA quiz correct answers (0-indexed): all 20 questions
        correct_answers = {
            "croa-q1": 1, "croa-q2": 2, "croa-q3": 2, "croa-q4": 2, "croa-q5": 1,
            "croa-q6": 2, "croa-q7": 1, "croa-q8": 2, "croa-q9": 1, "croa-q10": 2,
            "croa-q11": 1, "croa-q12": 1, "croa-q13": 1, "croa-q14": 1, "croa-q15": 1,
            "croa-q16": 2, "croa-q17": 1, "croa-q18": 0, "croa-q19": 1, "croa-q20": 1
        }
        
        response = requests.post(f"{BASE_URL}/api/school/courses/croa-basics/quiz/submit", 
            headers={"Authorization": f"Bearer {TestSchoolAuth.student_token}"},
            json={"answers": correct_answers}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["passed"] == True, f"Expected to pass, got score: {data.get('score')}"
        assert data["score"] == 100.0
        assert "certificate" in data
        assert data["certificate"] is not None
        assert "badge_html" in data
        assert data["badge_html"] is not None
        
        # Verify certificate structure
        cert = data["certificate"]
        assert "id" in cert
        assert cert["course_id"] == "croa-basics"
        assert cert["student_name"] == TEST_NAME
        
        # Verify badge HTML contains Credlocity backlink
        assert "credlocity.com" in data["badge_html"].lower()
        
        print(f"✓ Quiz passed with {data['score']}%, certificate issued: {cert['id']}")
    
    def test_submit_quiz_failing(self):
        """POST /api/school/courses/{id}/quiz/submit handles failing score"""
        # Enroll in another course first
        requests.post(f"{BASE_URL}/api/school/courses/credit-repair-ethics/enroll", headers={
            "Authorization": f"Bearer {TestSchoolAuth.student_token}"
        })
        
        # Submit all wrong answers
        wrong_answers = {f"eth-q{i}": 0 for i in range(1, 21)}
        
        response = requests.post(f"{BASE_URL}/api/school/courses/credit-repair-ethics/quiz/submit",
            headers={"Authorization": f"Bearer {TestSchoolAuth.student_token}"},
            json={"answers": wrong_answers}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["passed"] == False
        assert data["certificate"] is None
        assert "results" in data  # Should show which were wrong
        print(f"✓ Quiz failed with {data['score']}%, no certificate issued")


class TestSchoolCertificates:
    """Test certificate retrieval and badge HTML"""
    
    cert_id = None
    
    def test_get_my_certificates(self):
        """GET /api/school/certificates returns student's certificates"""
        response = requests.get(f"{BASE_URL}/api/school/certificates", headers={
            "Authorization": f"Bearer {TestSchoolAuth.student_token}"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "certificates" in data
        certs = data["certificates"]
        assert len(certs) >= 1, "Should have at least 1 certificate from passing quiz"
        
        # Find the CROA certificate
        croa_cert = next((c for c in certs if c["course_id"] == "croa-basics"), None)
        assert croa_cert is not None
        TestSchoolCertificates.cert_id = croa_cert["id"]
        
        print(f"✓ Retrieved {len(certs)} certificate(s)")
    
    def test_get_certificate_detail(self):
        """GET /api/school/certificates/{id} returns certificate details"""
        response = requests.get(f"{BASE_URL}/api/school/certificates/{TestSchoolCertificates.cert_id}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "certificate" in data
        cert = data["certificate"]
        assert cert["id"] == TestSchoolCertificates.cert_id
        assert cert["course_id"] == "croa-basics"
        print(f"✓ Certificate detail retrieved: {cert['id']}")
    
    def test_get_badge_html(self):
        """GET /api/school/certificates/{id}/badge-html returns embeddable HTML"""
        response = requests.get(f"{BASE_URL}/api/school/certificates/{TestSchoolCertificates.cert_id}/badge-html", headers={
            "Authorization": f"Bearer {TestSchoolAuth.student_token}"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "badge_html" in data
        badge_html = data["badge_html"]
        
        # Verify badge contains required elements
        assert "credlocity.com" in badge_html.lower(), "Badge should contain Credlocity backlink"
        assert "CROA" in badge_html, "Badge should contain course short name"
        assert TestSchoolCertificates.cert_id in badge_html, "Badge should contain cert ID"
        
        print("✓ Badge HTML retrieved with Credlocity backlink")
    
    def test_get_certificate_pdf(self):
        """GET /api/school/certificates/{id}/pdf generates PDF"""
        response = requests.get(
            f"{BASE_URL}/api/school/certificates/{TestSchoolCertificates.cert_id}/pdf?token={TestSchoolAuth.student_token}"
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "application/pdf" in response.headers.get("content-type", "")
        assert len(response.content) > 1000, "PDF should have content"
        print("✓ Certificate PDF generated successfully")
    
    def test_get_certificate_not_found(self):
        """GET /api/school/certificates/{id} returns 404 for invalid cert"""
        response = requests.get(f"{BASE_URL}/api/school/certificates/INVALID123")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Invalid certificate returns 404")


class TestSchoolDiscussions:
    """Test discussion board functionality"""
    
    thread_id = None
    
    def test_create_discussion_thread(self):
        """POST /api/school/courses/{id}/discussions creates thread"""
        response = requests.post(f"{BASE_URL}/api/school/courses/croa-basics/discussions",
            headers={"Authorization": f"Bearer {TestSchoolAuth.student_token}"},
            json={"content": "TEST_THREAD: This is a test discussion about CROA compliance."}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "discussion" in data
        thread = data["discussion"]
        assert thread["content"].startswith("TEST_THREAD")
        assert thread["author_name"] == TEST_NAME
        TestSchoolDiscussions.thread_id = thread["id"]
        
        print(f"✓ Discussion thread created: {thread['id']}")
    
    def test_get_discussions(self):
        """GET /api/school/courses/{id}/discussions returns threads"""
        response = requests.get(f"{BASE_URL}/api/school/courses/croa-basics/discussions", headers={
            "Authorization": f"Bearer {TestSchoolAuth.student_token}"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "discussions" in data
        threads = data["discussions"]
        assert len(threads) >= 1
        
        # Find our test thread
        test_thread = next((t for t in threads if t["id"] == TestSchoolDiscussions.thread_id), None)
        assert test_thread is not None
        
        print(f"✓ Retrieved {len(threads)} discussion thread(s)")
    
    def test_create_reply(self):
        """POST /api/school/courses/{id}/discussions creates reply"""
        response = requests.post(f"{BASE_URL}/api/school/courses/croa-basics/discussions",
            headers={"Authorization": f"Bearer {TestSchoolAuth.student_token}"},
            json={
                "content": "TEST_REPLY: This is a reply to the test thread.",
                "parent_id": TestSchoolDiscussions.thread_id
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["discussion"]["parent_id"] == TestSchoolDiscussions.thread_id
        print("✓ Reply created successfully")
    
    def test_get_replies(self):
        """GET /api/school/courses/{id}/discussions/{thread_id}/replies returns replies"""
        response = requests.get(
            f"{BASE_URL}/api/school/courses/croa-basics/discussions/{TestSchoolDiscussions.thread_id}/replies",
            headers={"Authorization": f"Bearer {TestSchoolAuth.student_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "replies" in data
        assert len(data["replies"]) >= 1
        print(f"✓ Retrieved {len(data['replies'])} reply(ies)")
    
    def test_discussion_requires_auth(self):
        """POST /api/school/courses/{id}/discussions requires authentication"""
        response = requests.post(f"{BASE_URL}/api/school/courses/croa-basics/discussions",
            json={"content": "Unauthorized post"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Discussion posting requires authentication")


class TestSchoolChat:
    """Test live chat functionality"""
    
    def test_send_chat_message(self):
        """POST /api/school/courses/{id}/chat sends message"""
        response = requests.post(f"{BASE_URL}/api/school/courses/croa-basics/chat",
            headers={"Authorization": f"Bearer {TestSchoolAuth.student_token}"},
            json={"content": "TEST_CHAT: Hello from the test suite!"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "message" in data
        msg = data["message"]
        assert msg["content"].startswith("TEST_CHAT")
        assert msg["author_name"] == TEST_NAME
        
        print(f"✓ Chat message sent: {msg['id']}")
    
    def test_get_chat_messages(self):
        """GET /api/school/courses/{id}/chat returns messages"""
        response = requests.get(f"{BASE_URL}/api/school/courses/croa-basics/chat", headers={
            "Authorization": f"Bearer {TestSchoolAuth.student_token}"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "messages" in data
        messages = data["messages"]
        assert len(messages) >= 1
        
        # Find our test message
        test_msg = next((m for m in messages if m["content"].startswith("TEST_CHAT")), None)
        assert test_msg is not None
        
        print(f"✓ Retrieved {len(messages)} chat message(s)")
    
    def test_chat_requires_auth(self):
        """POST /api/school/courses/{id}/chat requires authentication"""
        response = requests.post(f"{BASE_URL}/api/school/courses/croa-basics/chat",
            json={"content": "Unauthorized message"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Chat requires authentication")
    
    def test_chat_empty_message(self):
        """POST /api/school/courses/{id}/chat validates content"""
        response = requests.post(f"{BASE_URL}/api/school/courses/croa-basics/chat",
            headers={"Authorization": f"Bearer {TestSchoolAuth.student_token}"},
            json={"content": "   "}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Empty chat message rejected")


class TestSchoolAdmin:
    """Test admin-only endpoints"""
    
    admin_token = None
    
    @classmethod
    def setup_class(cls):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            cls.admin_token = response.json().get("access_token")
    
    def test_admin_stats(self):
        """GET /api/school/admin/stats returns school statistics"""
        if not TestSchoolAdmin.admin_token:
            pytest.skip("Admin login failed")
        
        response = requests.get(f"{BASE_URL}/api/school/admin/stats", headers={
            "Authorization": f"Bearer {TestSchoolAdmin.admin_token}"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "stats" in data
        stats = data["stats"]
        assert "total_students" in stats
        assert "total_enrollments" in stats
        assert "total_certificates" in stats
        assert "total_completions" in stats
        assert "completion_rate" in stats
        
        print(f"✓ Admin stats: {stats['total_students']} students, {stats['total_certificates']} certificates")
    
    def test_admin_stats_requires_admin(self):
        """GET /api/school/admin/stats requires admin role"""
        response = requests.get(f"{BASE_URL}/api/school/admin/stats", headers={
            "Authorization": f"Bearer {TestSchoolAuth.student_token}"
        })
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ Admin stats requires admin role")
    
    def test_admin_list_students(self):
        """GET /api/school/admin/students lists all students"""
        if not TestSchoolAdmin.admin_token:
            pytest.skip("Admin login failed")
        
        response = requests.get(f"{BASE_URL}/api/school/admin/students", headers={
            "Authorization": f"Bearer {TestSchoolAdmin.admin_token}"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "students" in data
        assert "total" in data
        
        # Verify our test student is in the list
        test_student = next((s for s in data["students"] if s["email"] == TEST_EMAIL.lower()), None)
        assert test_student is not None
        assert "password_hash" not in test_student
        
        print(f"✓ Admin listed {data['total']} students")
    
    def test_admin_list_courses(self):
        """GET /api/school/admin/courses lists all courses including drafts"""
        if not TestSchoolAdmin.admin_token:
            pytest.skip("Admin login failed")
        
        response = requests.get(f"{BASE_URL}/api/school/admin/courses", headers={
            "Authorization": f"Bearer {TestSchoolAdmin.admin_token}"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "courses" in data
        assert len(data["courses"]) >= 3
        
        print(f"✓ Admin listed {len(data['courses'])} courses")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
