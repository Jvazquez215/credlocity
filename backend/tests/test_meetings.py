"""
Test Partners Hub Meeting Minutes API endpoints
Tests CRUD operations for /api/partners-hub/meetings
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestMeetingMinutesAPI:
    """Test Meeting Minutes endpoints in Partners Hub"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: get auth token for admin partner user"""
        # Login as admin partner
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        data = login_resp.json()
        self.token = data.get("token") or data.get("access_token")
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def test_get_meetings_list(self):
        """Test GET /api/partners-hub/meetings returns list"""
        resp = requests.get(f"{BASE_URL}/api/partners-hub/meetings", headers=self.headers)
        assert resp.status_code == 200, f"Get meetings failed: {resp.text}"
        meetings = resp.json()
        assert isinstance(meetings, list), "Response should be a list"
        print(f"✓ GET /api/partners-hub/meetings - {len(meetings)} meetings found")
    
    def test_create_meeting_minutes(self):
        """Test POST /api/partners-hub/meetings creates new meeting"""
        payload = {
            "title": "TEST_Weekly Sync Meeting",
            "date": "2026-03-20",
            "attendees": ["Admin@credlocity.com"],
            "notes": "Testing meeting creation via API",
            "decisions": ["Test decision 1", "Test decision 2"],
            "action_items": ["Test action item 1"]
        }
        resp = requests.post(f"{BASE_URL}/api/partners-hub/meetings", headers=self.headers, json=payload)
        assert resp.status_code == 200, f"Create meeting failed: {resp.text}"
        data = resp.json()
        
        # Verify response structure
        assert "id" in data, "Response should have id"
        assert data["title"] == "TEST_Weekly Sync Meeting"
        assert data["date"] == "2026-03-20"
        assert len(data["decisions"]) == 2
        assert len(data["action_items"]) == 1
        
        print(f"✓ POST /api/partners-hub/meetings - Created meeting {data['id'][:8]}...")
        self.meeting_id = data["id"]
        return data["id"]
    
    def test_create_and_get_meeting(self):
        """Test create then verify with GET"""
        # Create
        payload = {
            "title": "TEST_Verification Meeting",
            "date": "2026-03-21",
            "attendees": [],
            "notes": "Created for verification test",
            "decisions": [],
            "action_items": []
        }
        create_resp = requests.post(f"{BASE_URL}/api/partners-hub/meetings", headers=self.headers, json=payload)
        assert create_resp.status_code == 200
        created = create_resp.json()
        meeting_id = created["id"]
        
        # Verify in list
        get_resp = requests.get(f"{BASE_URL}/api/partners-hub/meetings", headers=self.headers)
        assert get_resp.status_code == 200
        meetings = get_resp.json()
        found = any(m["id"] == meeting_id for m in meetings)
        assert found, "Created meeting should appear in list"
        
        print(f"✓ Create → GET verification passed for meeting {meeting_id[:8]}...")
    
    def test_update_meeting(self):
        """Test PUT /api/partners-hub/meetings/{id} updates meeting"""
        # First create a meeting
        payload = {
            "title": "TEST_Update Test Meeting",
            "date": "2026-03-22",
            "notes": "Original notes"
        }
        create_resp = requests.post(f"{BASE_URL}/api/partners-hub/meetings", headers=self.headers, json=payload)
        assert create_resp.status_code == 200
        meeting_id = create_resp.json()["id"]
        
        # Update it
        update_payload = {
            "notes": "Updated notes via PUT",
            "decisions": ["New decision after update"]
        }
        update_resp = requests.put(f"{BASE_URL}/api/partners-hub/meetings/{meeting_id}", headers=self.headers, json=update_payload)
        assert update_resp.status_code == 200, f"Update failed: {update_resp.text}"
        
        # Verify update in list
        get_resp = requests.get(f"{BASE_URL}/api/partners-hub/meetings", headers=self.headers)
        meetings = get_resp.json()
        updated = next((m for m in meetings if m["id"] == meeting_id), None)
        assert updated is not None
        assert updated["notes"] == "Updated notes via PUT"
        assert "New decision after update" in updated.get("decisions", [])
        
        print(f"✓ PUT /api/partners-hub/meetings/{meeting_id[:8]}... - Update verified")
    
    def test_delete_meeting(self):
        """Test DELETE /api/partners-hub/meetings/{id} removes meeting"""
        # First create a meeting to delete
        payload = {
            "title": "TEST_Delete Test Meeting",
            "date": "2026-03-23",
            "notes": "This will be deleted"
        }
        create_resp = requests.post(f"{BASE_URL}/api/partners-hub/meetings", headers=self.headers, json=payload)
        assert create_resp.status_code == 200
        meeting_id = create_resp.json()["id"]
        
        # Delete it
        delete_resp = requests.delete(f"{BASE_URL}/api/partners-hub/meetings/{meeting_id}", headers=self.headers)
        assert delete_resp.status_code == 200, f"Delete failed: {delete_resp.text}"
        
        # Verify deleted
        get_resp = requests.get(f"{BASE_URL}/api/partners-hub/meetings", headers=self.headers)
        meetings = get_resp.json()
        found = any(m["id"] == meeting_id for m in meetings)
        assert not found, "Deleted meeting should not appear in list"
        
        print(f"✓ DELETE /api/partners-hub/meetings/{meeting_id[:8]}... - Deleted and verified")
    
    def test_unauthorized_access(self):
        """Test that meetings endpoint requires auth"""
        resp = requests.get(f"{BASE_URL}/api/partners-hub/meetings")
        assert resp.status_code in [401, 403], f"Should be unauthorized: {resp.status_code}"
        print("✓ Unauthorized access correctly rejected")


# Cleanup test data after all tests
@pytest.fixture(scope="module", autouse=True)
def cleanup_test_meetings():
    """Cleanup TEST_ prefixed meetings after tests complete"""
    yield
    # Post-test cleanup
    login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "Admin@credlocity.com",
        "password": "Credit123!"
    })
    if login_resp.status_code == 200:
        data = login_resp.json()
        token = data.get("token") or data.get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        
        get_resp = requests.get(f"{BASE_URL}/api/partners-hub/meetings", headers=headers)
        if get_resp.status_code == 200:
            meetings = get_resp.json()
            for meeting in meetings:
                if meeting.get("title", "").startswith("TEST_"):
                    requests.delete(f"{BASE_URL}/api/partners-hub/meetings/{meeting['id']}", headers=headers)
            print("✓ Cleanup: Removed TEST_ prefixed meetings")
