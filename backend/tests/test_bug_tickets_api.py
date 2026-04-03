"""
Bug Tickets API Tests - Iteration 90
Tests CRUD operations, screenshot upload, and notification count for bug ticket system.
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"


@pytest.fixture(scope="module")
def admin_token():
    """Get admin authentication token"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    assert response.status_code == 200, f"Admin login failed: {response.text}"
    data = response.json()
    return data.get("access_token")


@pytest.fixture
def auth_headers(admin_token):
    """Headers with admin auth token"""
    return {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json"
    }


class TestBugTicketsAuth:
    """Test authentication for bug tickets API"""
    
    def test_admin_login_returns_token(self):
        """Verify admin login works and returns access_token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        print(f"PASS: Admin login successful, got token")


class TestBugTicketsCRUD:
    """Test CRUD operations for bug tickets"""
    
    def test_create_ticket_success(self, auth_headers):
        """POST /api/tickets - Create a new bug ticket"""
        unique_id = uuid.uuid4().hex[:8]
        payload = {
            "title": f"TEST_Bug Report {unique_id}",
            "description": "This is a test bug report created by automated testing",
            "steps_to_reproduce": ["Step 1: Open the app", "Step 2: Click button", "Step 3: See error"],
            "error_message": "Test error message",
            "category": "ui_display",
            "severity": "medium",
            "portal": "Admin CMS"
        }
        
        response = requests.post(f"{BASE_URL}/api/tickets", json=payload, headers=auth_headers)
        assert response.status_code == 200, f"Create ticket failed: {response.text}"
        
        data = response.json()
        assert "ticket_number" in data
        assert data["ticket_number"].startswith("BUG-")
        assert "ticket" in data
        assert data["ticket"]["title"] == payload["title"]
        assert data["ticket"]["status"] == "open"
        assert data["ticket"]["portal"] == "Admin CMS"
        print(f"PASS: Created ticket {data['ticket_number']}")
        return data["ticket_number"]
    
    def test_create_ticket_missing_title(self, auth_headers):
        """POST /api/tickets - Should fail without title"""
        payload = {
            "description": "Description without title"
        }
        response = requests.post(f"{BASE_URL}/api/tickets", json=payload, headers=auth_headers)
        assert response.status_code == 400
        print("PASS: Correctly rejected ticket without title")
    
    def test_create_ticket_missing_description(self, auth_headers):
        """POST /api/tickets - Should fail without description"""
        payload = {
            "title": "Title without description"
        }
        response = requests.post(f"{BASE_URL}/api/tickets", json=payload, headers=auth_headers)
        assert response.status_code == 400
        print("PASS: Correctly rejected ticket without description")
    
    def test_list_tickets(self, auth_headers):
        """GET /api/tickets - List all tickets (admin sees all)"""
        response = requests.get(f"{BASE_URL}/api/tickets", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "tickets" in data
        assert "count" in data
        assert isinstance(data["tickets"], list)
        print(f"PASS: Listed {data['count']} tickets")
    
    def test_get_single_ticket(self, auth_headers):
        """GET /api/tickets/{ticket_number} - Get specific ticket"""
        # First create a ticket
        unique_id = uuid.uuid4().hex[:8]
        create_payload = {
            "title": f"TEST_Single Ticket {unique_id}",
            "description": "Test ticket for single get",
            "category": "other",
            "severity": "low"
        }
        create_response = requests.post(f"{BASE_URL}/api/tickets", json=create_payload, headers=auth_headers)
        assert create_response.status_code == 200
        ticket_number = create_response.json()["ticket_number"]
        
        # Now get the ticket
        response = requests.get(f"{BASE_URL}/api/tickets/{ticket_number}", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["ticket_number"] == ticket_number
        assert data["title"] == create_payload["title"]
        print(f"PASS: Retrieved ticket {ticket_number}")
    
    def test_update_ticket_status(self, auth_headers):
        """PUT /api/tickets/{ticket_number} - Update ticket status"""
        # First create a ticket
        unique_id = uuid.uuid4().hex[:8]
        create_payload = {
            "title": f"TEST_Update Status {unique_id}",
            "description": "Test ticket for status update",
            "category": "calculation",
            "severity": "high"
        }
        create_response = requests.post(f"{BASE_URL}/api/tickets", json=create_payload, headers=auth_headers)
        assert create_response.status_code == 200
        ticket_number = create_response.json()["ticket_number"]
        
        # Update status to in_review
        update_payload = {"status": "in_review"}
        response = requests.put(f"{BASE_URL}/api/tickets/{ticket_number}", json=update_payload, headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["ticket"]["status"] == "in_review"
        print(f"PASS: Updated ticket {ticket_number} status to in_review")
    
    def test_update_ticket_resolution_notes(self, auth_headers):
        """PUT /api/tickets/{ticket_number} - Update with resolution notes"""
        # First create a ticket
        unique_id = uuid.uuid4().hex[:8]
        create_payload = {
            "title": f"TEST_Resolution Notes {unique_id}",
            "description": "Test ticket for resolution notes",
            "category": "permissions",
            "severity": "medium"
        }
        create_response = requests.post(f"{BASE_URL}/api/tickets", json=create_payload, headers=auth_headers)
        assert create_response.status_code == 200
        ticket_number = create_response.json()["ticket_number"]
        
        # Update with resolution notes and resolved status
        update_payload = {
            "status": "resolved",
            "resolution_notes": "Fixed by updating permissions configuration"
        }
        response = requests.put(f"{BASE_URL}/api/tickets/{ticket_number}", json=update_payload, headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["ticket"]["status"] == "resolved"
        assert data["ticket"]["resolution_notes"] == update_payload["resolution_notes"]
        assert data["ticket"]["resolved_at"] is not None
        print(f"PASS: Updated ticket {ticket_number} with resolution notes")
    
    def test_delete_ticket(self, auth_headers):
        """DELETE /api/tickets/{ticket_number} - Delete ticket (admin only)"""
        # First create a ticket
        unique_id = uuid.uuid4().hex[:8]
        create_payload = {
            "title": f"TEST_Delete Ticket {unique_id}",
            "description": "Test ticket for deletion",
            "category": "other",
            "severity": "low"
        }
        create_response = requests.post(f"{BASE_URL}/api/tickets", json=create_payload, headers=auth_headers)
        assert create_response.status_code == 200
        ticket_number = create_response.json()["ticket_number"]
        
        # Delete the ticket
        response = requests.delete(f"{BASE_URL}/api/tickets/{ticket_number}", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "deleted" in data["message"].lower()
        
        # Verify ticket is gone
        get_response = requests.get(f"{BASE_URL}/api/tickets/{ticket_number}", headers=auth_headers)
        assert get_response.status_code == 404
        print(f"PASS: Deleted ticket {ticket_number} and verified removal")
    
    def test_delete_nonexistent_ticket(self, auth_headers):
        """DELETE /api/tickets/{ticket_number} - Should return 404 for nonexistent"""
        response = requests.delete(f"{BASE_URL}/api/tickets/BUG-99999", headers=auth_headers)
        assert response.status_code == 404
        print("PASS: Correctly returned 404 for nonexistent ticket")


class TestBugTicketsNotifications:
    """Test notification count endpoint"""
    
    def test_get_notification_count(self, auth_headers):
        """GET /api/tickets/notifications/count - Returns open_count for admin"""
        response = requests.get(f"{BASE_URL}/api/tickets/notifications/count", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "open_count" in data
        assert isinstance(data["open_count"], int)
        assert data["open_count"] >= 0
        print(f"PASS: Got notification count: {data['open_count']}")
    
    def test_notification_count_without_auth(self):
        """GET /api/tickets/notifications/count - Should fail without auth"""
        response = requests.get(f"{BASE_URL}/api/tickets/notifications/count")
        assert response.status_code == 401
        print("PASS: Correctly rejected unauthenticated request")


class TestBugTicketsScreenshots:
    """Test screenshot upload functionality"""
    
    def test_upload_screenshot(self, auth_headers):
        """POST /api/tickets/{ticket_number}/screenshots - Upload screenshot"""
        # First create a ticket
        unique_id = uuid.uuid4().hex[:8]
        create_payload = {
            "title": f"TEST_Screenshot Upload {unique_id}",
            "description": "Test ticket for screenshot upload",
            "category": "ui_display",
            "severity": "medium"
        }
        create_response = requests.post(f"{BASE_URL}/api/tickets", json=create_payload, headers=auth_headers)
        assert create_response.status_code == 200
        ticket_number = create_response.json()["ticket_number"]
        
        # Create a simple test image (1x1 red pixel PNG)
        import base64
        # Minimal valid PNG (1x1 red pixel)
        png_data = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
        )
        
        # Upload screenshot
        files = {"file": ("test_screenshot.png", png_data, "image/png")}
        upload_headers = {"Authorization": auth_headers["Authorization"]}
        
        response = requests.post(
            f"{BASE_URL}/api/tickets/{ticket_number}/screenshots",
            files=files,
            headers=upload_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "file_url" in data
        assert "filename" in data
        assert data["filename"] == "test_screenshot.png"
        print(f"PASS: Uploaded screenshot to ticket {ticket_number}")
        
        # Verify screenshot is in ticket
        get_response = requests.get(f"{BASE_URL}/api/tickets/{ticket_number}", headers=auth_headers)
        assert get_response.status_code == 200
        ticket_data = get_response.json()
        assert len(ticket_data["screenshots"]) > 0
        print(f"PASS: Verified screenshot attached to ticket")
    
    def test_upload_screenshot_nonexistent_ticket(self, auth_headers):
        """POST /api/tickets/{ticket_number}/screenshots - Should fail for nonexistent ticket"""
        import base64
        png_data = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
        )
        
        files = {"file": ("test.png", png_data, "image/png")}
        upload_headers = {"Authorization": auth_headers["Authorization"]}
        
        response = requests.post(
            f"{BASE_URL}/api/tickets/BUG-99999/screenshots",
            files=files,
            headers=upload_headers
        )
        assert response.status_code == 404
        print("PASS: Correctly returned 404 for nonexistent ticket")


class TestBugTicketsPortalField:
    """Test portal field tracking"""
    
    def test_ticket_includes_portal_field(self, auth_headers):
        """Verify tickets track which portal they were submitted from"""
        unique_id = uuid.uuid4().hex[:8]
        payload = {
            "title": f"TEST_Portal Field {unique_id}",
            "description": "Test ticket with portal field",
            "portal": "Partner Portal",
            "category": "other",
            "severity": "low"
        }
        
        response = requests.post(f"{BASE_URL}/api/tickets", json=payload, headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["ticket"]["portal"] == "Partner Portal"
        print(f"PASS: Ticket correctly tracks portal field")
    
    def test_ticket_default_portal(self, auth_headers):
        """Verify tickets have default portal when not specified"""
        unique_id = uuid.uuid4().hex[:8]
        payload = {
            "title": f"TEST_Default Portal {unique_id}",
            "description": "Test ticket without portal field",
            "category": "other",
            "severity": "low"
        }
        
        response = requests.post(f"{BASE_URL}/api/tickets", json=payload, headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "portal" in data["ticket"]
        assert data["ticket"]["portal"] == "Unknown"
        print(f"PASS: Ticket has default portal value")


class TestBugTicketsCleanup:
    """Cleanup test data"""
    
    def test_cleanup_test_tickets(self, auth_headers):
        """Delete all TEST_ prefixed tickets"""
        # Get all tickets
        response = requests.get(f"{BASE_URL}/api/tickets", headers=auth_headers)
        assert response.status_code == 200
        
        tickets = response.json().get("tickets", [])
        deleted_count = 0
        
        for ticket in tickets:
            if ticket.get("title", "").startswith("TEST_"):
                delete_response = requests.delete(
                    f"{BASE_URL}/api/tickets/{ticket['ticket_number']}",
                    headers=auth_headers
                )
                if delete_response.status_code == 200:
                    deleted_count += 1
        
        print(f"PASS: Cleaned up {deleted_count} test tickets")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
