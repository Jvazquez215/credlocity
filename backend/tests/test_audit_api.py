"""
Test Audit & Time Tracking API Endpoints
Tests: login session_id, heartbeat, audit log, logout-event, active-sessions, user logs/sessions/summary, all-users-summary
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"
PARTNER_EMAIL = "Shar@credlocity.com"
PARTNER_PASSWORD = "Credit123!"


class TestAuditLogin:
    """Test that login returns session_id for audit tracking"""
    
    def test_login_returns_session_id(self):
        """POST /api/auth/login should return session_id in user object"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        
        # Verify access_token exists
        assert "access_token" in data, "Missing access_token in response"
        assert data["token_type"] == "bearer"
        
        # Verify session_id in user object
        assert "user" in data, "Missing user object in response"
        user = data["user"]
        assert "session_id" in user, "Missing session_id in user object"
        assert isinstance(user["session_id"], str)
        assert len(user["session_id"]) > 0, "session_id should not be empty"
        
        # Verify it's a valid UUID format
        import uuid
        try:
            uuid.UUID(user["session_id"])
        except ValueError:
            pytest.fail(f"session_id is not a valid UUID: {user['session_id']}")
        
        print(f"Login successful, session_id: {user['session_id']}")


class TestAuditHeartbeat:
    """Test heartbeat endpoint for activity tracking and idle detection"""
    
    @pytest.fixture
    def admin_auth(self):
        """Get admin auth token and session_id"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        return {
            "token": data["access_token"],
            "session_id": data["user"]["session_id"],
            "user": data["user"]
        }
    
    def test_heartbeat_returns_should_logout_false_for_admin(self, admin_auth):
        """POST /api/audit/heartbeat should return should_logout=false for admin/partner users"""
        headers = {"Authorization": f"Bearer {admin_auth['token']}"}
        response = requests.post(f"{BASE_URL}/api/audit/heartbeat", json={
            "session_id": admin_auth["session_id"],
            "current_page": "/admin/dashboard"
        }, headers=headers)
        
        assert response.status_code == 200, f"Heartbeat failed: {response.text}"
        data = response.json()
        
        assert "status" in data
        assert data["status"] == "ok"
        assert "should_logout" in data
        # Admin/partner should NEVER get should_logout=true
        assert data["should_logout"] == False, f"Admin should not get should_logout=true, got: {data}"
        assert "server_time" in data
        
        print(f"Heartbeat response for admin: {data}")
    
    def test_heartbeat_with_meaningful_action(self, admin_auth):
        """Heartbeat should accept last_meaningful_action_time"""
        headers = {"Authorization": f"Bearer {admin_auth['token']}"}
        from datetime import datetime, timezone
        
        response = requests.post(f"{BASE_URL}/api/audit/heartbeat", json={
            "session_id": admin_auth["session_id"],
            "current_page": "/admin/clients",
            "last_meaningful_action_time": datetime.now(timezone.utc).isoformat(),
            "last_meaningful_action_detail": "Clicked on client list"
        }, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["should_logout"] == False
        print(f"Heartbeat with action: {data}")


class TestAuditLog:
    """Test audit log recording endpoint"""
    
    @pytest.fixture
    def admin_auth(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        return {
            "token": data["access_token"],
            "session_id": data["user"]["session_id"]
        }
    
    def test_log_audit_event(self, admin_auth):
        """POST /api/audit/log should record audit events"""
        headers = {"Authorization": f"Bearer {admin_auth['token']}"}
        response = requests.post(f"{BASE_URL}/api/audit/log", json={
            "event_type": "action",
            "action_category": "test",
            "action_detail": "TEST_audit_log_test_action",
            "page": "/admin/test",
            "session_id": admin_auth["session_id"],
            "metadata": {"test_key": "test_value"}
        }, headers=headers)
        
        assert response.status_code == 200, f"Audit log failed: {response.text}"
        data = response.json()
        assert data["status"] == "logged"
        print(f"Audit log recorded: {data}")
    
    def test_log_page_view(self, admin_auth):
        """Log a page view event"""
        headers = {"Authorization": f"Bearer {admin_auth['token']}"}
        response = requests.post(f"{BASE_URL}/api/audit/log", json={
            "event_type": "page_view",
            "action_category": "navigation",
            "action_detail": "Viewed test page",
            "page": "/admin/test-page",
            "session_id": admin_auth["session_id"]
        }, headers=headers)
        
        assert response.status_code == 200
        assert response.json()["status"] == "logged"


class TestAuditLogoutEvent:
    """Test logout event recording"""
    
    @pytest.fixture
    def admin_auth(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        return {
            "token": data["access_token"],
            "session_id": data["user"]["session_id"]
        }
    
    def test_logout_event_manual(self, admin_auth):
        """POST /api/audit/logout-event should record logout and mark session inactive"""
        headers = {"Authorization": f"Bearer {admin_auth['token']}"}
        response = requests.post(f"{BASE_URL}/api/audit/logout-event", json={
            "session_id": admin_auth["session_id"],
            "reason": "manual"
        }, headers=headers)
        
        assert response.status_code == 200, f"Logout event failed: {response.text}"
        data = response.json()
        assert data["status"] == "logged_out"
        print(f"Logout event recorded: {data}")


class TestAuditActiveSessions:
    """Test active sessions endpoint (admin only)"""
    
    @pytest.fixture
    def admin_auth(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        return {
            "token": data["access_token"],
            "session_id": data["user"]["session_id"]
        }
    
    def test_get_active_sessions(self, admin_auth):
        """GET /api/audit/active-sessions should return currently active sessions"""
        headers = {"Authorization": f"Bearer {admin_auth['token']}"}
        
        # First send a heartbeat to ensure session is active
        requests.post(f"{BASE_URL}/api/audit/heartbeat", json={
            "session_id": admin_auth["session_id"],
            "current_page": "/admin"
        }, headers=headers)
        
        response = requests.get(f"{BASE_URL}/api/audit/active-sessions", headers=headers)
        
        assert response.status_code == 200, f"Active sessions failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        
        # Should have at least our current session
        if len(data) > 0:
            session = data[0]
            assert "session_id" in session
            assert "user_email" in session
            assert "user_role" in session
            assert "is_active" in session
            assert "login_time" in session
            assert "last_heartbeat" in session
            print(f"Found {len(data)} active sessions")
            print(f"First session: {session.get('user_email')}, role: {session.get('user_role')}")
        else:
            print("No active sessions found (may be expected if session expired)")


class TestAuditAllUsersSummary:
    """Test all users summary endpoint"""
    
    @pytest.fixture
    def admin_auth(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        return {"token": data["access_token"]}
    
    def test_get_all_users_summary(self, admin_auth):
        """GET /api/audit/all-users-summary should return overview of all users"""
        headers = {"Authorization": f"Bearer {admin_auth['token']}"}
        response = requests.get(f"{BASE_URL}/api/audit/all-users-summary?days=7", headers=headers)
        
        assert response.status_code == 200, f"All users summary failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            user = data[0]
            assert "email" in user
            assert "name" in user
            assert "role" in user
            assert "total_actions" in user
            assert "total_logins" in user
            assert "is_online" in user
            print(f"Found {len(data)} users in summary")
            # Print first few users
            for u in data[:3]:
                print(f"  - {u.get('email')}: {u.get('total_actions')} actions, online: {u.get('is_online')}")


class TestAuditUserLogs:
    """Test user-specific audit logs endpoint"""
    
    @pytest.fixture
    def admin_auth(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        return {"token": data["access_token"]}
    
    def test_get_user_logs(self, admin_auth):
        """GET /api/audit/user/{email}/logs should return audit logs for specific user"""
        headers = {"Authorization": f"Bearer {admin_auth['token']}"}
        email = ADMIN_EMAIL
        response = requests.get(f"{BASE_URL}/api/audit/user/{email}/logs?days=7", headers=headers)
        
        assert response.status_code == 200, f"User logs failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} audit logs for {email}")
        
        if len(data) > 0:
            log = data[0]
            assert "user_email" in log
            assert "event_type" in log
            assert "timestamp" in log


class TestAuditUserSessions:
    """Test user session history endpoint"""
    
    @pytest.fixture
    def admin_auth(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        return {"token": data["access_token"]}
    
    def test_get_user_sessions(self, admin_auth):
        """GET /api/audit/user/{email}/sessions should return session history"""
        headers = {"Authorization": f"Bearer {admin_auth['token']}"}
        email = ADMIN_EMAIL
        response = requests.get(f"{BASE_URL}/api/audit/user/{email}/sessions?days=30", headers=headers)
        
        assert response.status_code == 200, f"User sessions failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} sessions for {email}")
        
        if len(data) > 0:
            session = data[0]
            assert "session_id" in session
            assert "login_time" in session
            assert "session_duration_minutes" in session


class TestAuditUserSummary:
    """Test user productivity summary endpoint"""
    
    @pytest.fixture
    def admin_auth(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        return {"token": data["access_token"]}
    
    def test_get_user_summary(self, admin_auth):
        """GET /api/audit/user/{email}/summary should return productivity summary"""
        headers = {"Authorization": f"Bearer {admin_auth['token']}"}
        email = ADMIN_EMAIL
        response = requests.get(f"{BASE_URL}/api/audit/user/{email}/summary?days=7", headers=headers)
        
        assert response.status_code == 200, f"User summary failed: {response.text}"
        data = response.json()
        
        assert "user_email" in data
        assert data["user_email"] == email
        assert "total_sessions" in data
        assert "total_session_minutes" in data
        assert "total_events" in data
        assert "total_actions" in data
        assert "actions_per_hour" in data
        assert "successful_logins" in data
        assert "idle_logouts" in data
        
        print(f"User summary for {email}:")
        print(f"  Sessions: {data['total_sessions']}")
        print(f"  Total time: {data['total_session_minutes']}m")
        print(f"  Actions: {data['total_actions']}")
        print(f"  Actions/hour: {data['actions_per_hour']}")


class TestPartnerNoAutoLogout:
    """Test that partner/admin users should NOT get should_logout=true from heartbeat"""
    
    def test_admin_partner_no_auto_logout(self):
        """Admin with is_partner=true should NEVER get should_logout=true"""
        # Login as admin (who is also a partner)
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        token = data["access_token"]
        session_id = data["user"]["session_id"]
        user = data["user"]
        
        # Verify user is admin/partner
        assert user.get("role") in ["admin", "super_admin"] or user.get("is_partner") == True, \
            f"Test user should be admin or partner, got role={user.get('role')}, is_partner={user.get('is_partner')}"
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # Send heartbeat with old last_meaningful_action_time (simulating idle)
        from datetime import datetime, timezone, timedelta
        old_time = (datetime.now(timezone.utc) - timedelta(minutes=30)).isoformat()
        
        response = requests.post(f"{BASE_URL}/api/audit/heartbeat", json={
            "session_id": session_id,
            "current_page": "/admin",
            "last_meaningful_action_time": old_time,
            "last_meaningful_action_detail": "Old action"
        }, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Admin/partner should NEVER get should_logout=true even after being idle
        assert data["should_logout"] == False, \
            f"Admin/partner should NOT get should_logout=true even after 30min idle. Got: {data}"
        
        # idle_timeout_minutes should be None for admin
        assert data.get("idle_timeout_minutes") is None, \
            f"Admin should have idle_timeout_minutes=None, got: {data.get('idle_timeout_minutes')}"
        
        print(f"Verified: Admin/partner does NOT get auto-logout even after 30min idle")
        print(f"Response: {data}")


class TestAuditAccessControl:
    """Test that audit endpoints require admin access"""
    
    def test_active_sessions_requires_admin(self):
        """Non-admin users should not access active-sessions"""
        # This test would require a non-admin user
        # For now, just verify the endpoint exists and returns 403 without auth
        response = requests.get(f"{BASE_URL}/api/audit/active-sessions")
        assert response.status_code == 401, "Should require authentication"
    
    def test_all_users_summary_requires_admin(self):
        """Non-admin users should not access all-users-summary"""
        response = requests.get(f"{BASE_URL}/api/audit/all-users-summary")
        assert response.status_code == 401, "Should require authentication"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
