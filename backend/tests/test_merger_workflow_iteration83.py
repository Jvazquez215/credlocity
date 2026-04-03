"""
Test Merger Workflow Task System - Iteration 83
Tests for:
- Task completion endpoints (8-step checklist)
- Permission controls (Shar vs Joeziel)
- Merger overview dashboard
- Bug ticket system
- Overdue clients
- Cancel/verify flows
- William Peden Kendal financials verification
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
JOEZIEL_EMAIL = "joeziel@credlocity.com"
JOEZIEL_PASSWORD = "Credit123!"
SHAR_EMAIL = "shar@cprcreditrepair.com"
SHAR_PASSWORD = "Credlocity2026!"
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"


def get_admin_token():
    """Get admin token for client lookup"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL, "password": ADMIN_PASSWORD
    })
    return response.json().get("access_token")


def get_partner_token(email, password):
    """Get partner token"""
    response = requests.post(f"{BASE_URL}/api/cpr-partners/login", json={
        "email": email, "password": password
    })
    return response.json().get("access_token")


class TestPartnerAuth:
    """Partner authentication tests"""
    
    def test_joeziel_login_returns_master_role(self):
        """Verify Joeziel has master_partner role"""
        token = get_partner_token(JOEZIEL_EMAIL, JOEZIEL_PASSWORD)
        response = requests.get(f"{BASE_URL}/api/cpr-partners/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data.get("role") == "master_partner"
    
    def test_shar_login_returns_partner_role(self):
        """Verify Shar has partner role (not master)"""
        token = get_partner_token(SHAR_EMAIL, SHAR_PASSWORD)
        response = requests.get(f"{BASE_URL}/api/cpr-partners/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data.get("role") == "partner"


class TestMergerOverview:
    """Merger overview dashboard tests"""
    
    def test_merger_overview_returns_all_categories(self):
        """GET /api/cpr/merger-overview returns all categories with totals (121 total clients)"""
        token = get_partner_token(JOEZIEL_EMAIL, JOEZIEL_PASSWORD)
        response = requests.get(f"{BASE_URL}/api/cpr/merger-overview", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "categories" in data
        assert "totals" in data
        
        # Verify totals - should have 121 clients
        totals = data["totals"]
        assert "total" in totals
        assert totals["total"] >= 121, f"Expected at least 121 clients, got {totals['total']}"
        
        # Verify status fields exist
        for status in ["fully_merged", "in_progress", "not_started", "canceled", "waiting_disputes", "waiting_verification"]:
            assert status in totals, f"Missing status: {status}"
        
        # Verify categories exist
        categories = data["categories"]
        for cat in ["legacy_cpr", "shar_active", "new_credlocity"]:
            assert cat in categories, f"Missing category: {cat}"
    
    def test_merger_overview_requires_auth(self):
        """Merger overview requires authentication"""
        response = requests.get(f"{BASE_URL}/api/cpr/merger-overview")
        assert response.status_code == 401


class TestOverdueClients:
    """Overdue clients endpoint tests"""
    
    def test_overdue_endpoint_returns_clients(self):
        """GET /api/cpr/overdue returns overdue clients (30+ days no activity)"""
        token = get_partner_token(JOEZIEL_EMAIL, JOEZIEL_PASSWORD)
        response = requests.get(f"{BASE_URL}/api/cpr/overdue", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        
        assert "clients" in data
        assert "count" in data
        assert isinstance(data["clients"], list)


class TestTaskCompletion:
    """Task completion endpoint tests"""
    
    def test_complete_task_updates_merger_status(self):
        """POST /api/cpr/clients/{id}/tasks/id_uploaded/complete updates merger_status to 'in_progress'"""
        admin_token = get_admin_token()
        partner_token = get_partner_token(JOEZIEL_EMAIL, JOEZIEL_PASSWORD)
        
        # Get a shar_active client
        response = requests.get(f"{BASE_URL}/api/cpr/clients?category=shar_active", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        clients = response.json()
        if not clients:
            pytest.skip("No clients available")
        
        # Find a client that's not fully merged or canceled
        test_client = None
        for client in clients:
            if client.get("merger_status") not in ["fully_merged", "canceled"]:
                test_client = client
                break
        
        if not test_client:
            test_client = clients[0]
        
        client_id = test_client["id"]
        
        response = requests.post(
            f"{BASE_URL}/api/cpr/clients/{client_id}/tasks/id_uploaded/complete",
            headers={"Authorization": f"Bearer {partner_token}", "Content-Type": "application/json"},
            json={"file_url": "/test/id.pdf", "file_name": "test_id.pdf"}
        )
        
        # Could be 200 (success) or already completed
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "merger_status" in data
        # After completing a task, status should be in_progress or higher
        assert data["merger_status"] in ["in_progress", "waiting_disputes", "waiting_verification", "fully_merged"]
    
    def test_shar_cannot_complete_disputes_task(self):
        """POST /api/cpr/clients/{id}/tasks/disputes_sent/complete with Shar's token returns 403 (Joeziel only)"""
        admin_token = get_admin_token()
        shar_token = get_partner_token(SHAR_EMAIL, SHAR_PASSWORD)
        
        # Get a client
        response = requests.get(f"{BASE_URL}/api/cpr/clients?category=shar_active", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        clients = response.json()
        if not clients:
            pytest.skip("No clients available")
        
        client_id = clients[0]["id"]
        
        response = requests.post(
            f"{BASE_URL}/api/cpr/clients/{client_id}/tasks/disputes_sent/complete",
            headers={"Authorization": f"Bearer {shar_token}", "Content-Type": "application/json"},
            json={"dispute_round": 1, "notes": "Test"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        data = response.json()
        assert "Joeziel" in data.get("detail", "")
    
    def test_shar_cannot_undo_task(self):
        """POST /api/cpr/clients/{id}/tasks/id_uploaded/undo with Shar's token returns 403 (master only)"""
        admin_token = get_admin_token()
        shar_token = get_partner_token(SHAR_EMAIL, SHAR_PASSWORD)
        
        # Get a client
        response = requests.get(f"{BASE_URL}/api/cpr/clients?category=shar_active", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        clients = response.json()
        if not clients:
            pytest.skip("No clients available")
        
        client_id = clients[0]["id"]
        
        response = requests.post(
            f"{BASE_URL}/api/cpr/clients/{client_id}/tasks/id_uploaded/undo",
            headers={"Authorization": f"Bearer {shar_token}"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        data = response.json()
        assert "master" in data.get("detail", "").lower()


class TestCancelClient:
    """Client cancellation tests"""
    
    def test_cancel_requires_reason(self):
        """POST /api/cpr/clients/{id}/cancel requires cancellation_reason"""
        admin_token = get_admin_token()
        partner_token = get_partner_token(JOEZIEL_EMAIL, JOEZIEL_PASSWORD)
        
        # Get a client
        response = requests.get(f"{BASE_URL}/api/cpr/clients?category=shar_active", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        clients = response.json()
        if not clients:
            pytest.skip("No clients available")
        
        client_id = clients[0]["id"]
        
        # Try to cancel without reason
        response = requests.post(
            f"{BASE_URL}/api/cpr/clients/{client_id}/cancel",
            headers={"Authorization": f"Bearer {partner_token}", "Content-Type": "application/json"},
            json={}
        )
        assert response.status_code == 400
        data = response.json()
        assert "reason" in data.get("detail", "").lower()


class TestSharConfirm:
    """Shar confirmation tests"""
    
    def test_shar_confirm_requires_confirm_text(self):
        """POST /api/cpr/clients/{id}/shar-confirm requires typing 'CONFIRM' and tasks 1-7 complete"""
        admin_token = get_admin_token()
        shar_token = get_partner_token(SHAR_EMAIL, SHAR_PASSWORD)
        
        # Get a shar_active client
        response = requests.get(f"{BASE_URL}/api/cpr/clients?category=shar_active", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        clients = response.json()
        if not clients:
            pytest.skip("No clients available")
        
        client_id = clients[0]["id"]
        
        # Try with wrong text
        response = requests.post(
            f"{BASE_URL}/api/cpr/clients/{client_id}/shar-confirm",
            headers={"Authorization": f"Bearer {shar_token}", "Content-Type": "application/json"},
            json={"confirmation_text": "wrong"}
        )
        assert response.status_code == 400
        data = response.json()
        assert "CONFIRM" in data.get("detail", "")


class TestJoeVerify:
    """Joe verification tests"""
    
    def test_joe_verify_requires_verified_text(self):
        """POST /api/cpr/clients/{id}/joe-verify requires 'VERIFIED', all 8 tasks, and shar_confirmed"""
        admin_token = get_admin_token()
        partner_token = get_partner_token(JOEZIEL_EMAIL, JOEZIEL_PASSWORD)
        
        # Get a client
        response = requests.get(f"{BASE_URL}/api/cpr/clients?category=shar_active", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        clients = response.json()
        if not clients:
            pytest.skip("No clients available")
        
        client_id = clients[0]["id"]
        
        # Try with wrong text
        response = requests.post(
            f"{BASE_URL}/api/cpr/clients/{client_id}/joe-verify",
            headers={"Authorization": f"Bearer {partner_token}", "Content-Type": "application/json"},
            json={"verification_text": "wrong"}
        )
        assert response.status_code == 400
        data = response.json()
        assert "VERIFIED" in data.get("detail", "")
    
    def test_shar_cannot_joe_verify(self):
        """Shar cannot call joe-verify endpoint"""
        admin_token = get_admin_token()
        shar_token = get_partner_token(SHAR_EMAIL, SHAR_PASSWORD)
        
        # Get a client
        response = requests.get(f"{BASE_URL}/api/cpr/clients?category=shar_active", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        clients = response.json()
        if not clients:
            pytest.skip("No clients available")
        
        client_id = clients[0]["id"]
        
        response = requests.post(
            f"{BASE_URL}/api/cpr/clients/{client_id}/joe-verify",
            headers={"Authorization": f"Bearer {shar_token}", "Content-Type": "application/json"},
            json={"verification_text": "VERIFIED"}
        )
        assert response.status_code == 403


class TestBugTickets:
    """Bug ticket system tests"""
    
    def test_create_ticket_auto_numbers(self):
        """POST /api/tickets creates ticket with auto-numbered BUG-XXX format"""
        shar_token = get_partner_token(SHAR_EMAIL, SHAR_PASSWORD)
        
        response = requests.post(
            f"{BASE_URL}/api/tickets",
            headers={"Authorization": f"Bearer {shar_token}", "Content-Type": "application/json"},
            json={
                "title": "TEST_Bug Report from Iteration 83",
                "description": "This is a test bug report for iteration 83 testing",
                "category": "ui_display",
                "severity": "medium"
            }
        )
        assert response.status_code == 200, f"Failed to create ticket: {response.text}"
        data = response.json()
        
        assert "ticket_number" in data
        assert data["ticket_number"].startswith("BUG-")
        assert "ticket" in data
        assert data["ticket"]["title"] == "TEST_Bug Report from Iteration 83"
    
    def test_shar_sees_only_own_tickets(self):
        """GET /api/tickets with Shar token returns only Shar's tickets"""
        shar_token = get_partner_token(SHAR_EMAIL, SHAR_PASSWORD)
        joeziel_token = get_partner_token(JOEZIEL_EMAIL, JOEZIEL_PASSWORD)
        
        # Create a ticket as Shar
        requests.post(
            f"{BASE_URL}/api/tickets",
            headers={"Authorization": f"Bearer {shar_token}", "Content-Type": "application/json"},
            json={"title": "TEST_Shar's ticket", "description": "Test ticket by Shar"}
        )
        
        # Get tickets as Shar
        response = requests.get(f"{BASE_URL}/api/tickets", headers={
            "Authorization": f"Bearer {shar_token}"
        })
        assert response.status_code == 200
        data = response.json()
        
        # All tickets should be submitted by Shar (email or display name)
        for ticket in data.get("tickets", []):
            submitted_by = ticket.get("submitted_by", "")
            # Accept either email or display name
            assert "shar" in submitted_by.lower() or "Shar" in submitted_by, f"Shar sees ticket from {submitted_by}"
    
    def test_joeziel_sees_all_tickets(self):
        """GET /api/tickets with Joeziel (master) token returns all tickets"""
        joeziel_token = get_partner_token(JOEZIEL_EMAIL, JOEZIEL_PASSWORD)
        
        response = requests.get(f"{BASE_URL}/api/tickets", headers={
            "Authorization": f"Bearer {joeziel_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert "tickets" in data
    
    def test_shar_cannot_update_ticket(self):
        """PUT /api/tickets/{number} with Shar token returns 403 (master only)"""
        shar_token = get_partner_token(SHAR_EMAIL, SHAR_PASSWORD)
        joeziel_token = get_partner_token(JOEZIEL_EMAIL, JOEZIEL_PASSWORD)
        
        # Get a ticket number
        response = requests.get(f"{BASE_URL}/api/tickets", headers={
            "Authorization": f"Bearer {joeziel_token}"
        })
        tickets = response.json().get("tickets", [])
        if not tickets:
            pytest.skip("No tickets available")
        
        ticket_number = tickets[0]["ticket_number"]
        
        # Try to update as Shar
        response = requests.put(
            f"{BASE_URL}/api/tickets/{ticket_number}",
            headers={"Authorization": f"Bearer {shar_token}", "Content-Type": "application/json"},
            json={"status": "resolved"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"


class TestWilliamPedenKendalFinancials:
    """Verify William Peden Kendal exact financials"""
    
    def test_william_peden_kendal_exact_financials(self):
        """William Peden Kendal financials: shar_total=161.79, joe_total=3.49, grand_total=165.28"""
        admin_token = get_admin_token()
        
        response = requests.get(f"{BASE_URL}/api/cpr/clients?category=shar_active", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        assert response.status_code == 200
        clients = response.json()
        
        # Find William Peden Kendal
        william = None
        for client in clients:
            if "William Peden Kendal" in client.get("full_name", ""):
                william = client
                break
        
        assert william is not None, "William Peden Kendal not found in shar_active clients"
        
        # Verify exact financials
        assert abs(william.get("shar_total", 0) - 161.79) < 0.01, f"shar_total mismatch: {william.get('shar_total')}"
        assert abs(william.get("joe_total", 0) - 3.49) < 0.01, f"joe_total mismatch: {william.get('joe_total')}"
        assert abs(william.get("grand_total", 0) - 165.28) < 0.01, f"grand_total mismatch: {william.get('grand_total')}"


class TestCleanup:
    """Cleanup test data"""
    
    def test_cleanup_test_tickets(self):
        """Clean up TEST_ prefixed tickets"""
        joeziel_token = get_partner_token(JOEZIEL_EMAIL, JOEZIEL_PASSWORD)
        
        response = requests.get(f"{BASE_URL}/api/tickets", headers={
            "Authorization": f"Bearer {joeziel_token}"
        })
        if response.status_code == 200:
            tickets = response.json().get("tickets", [])
            for ticket in tickets:
                if ticket.get("title", "").startswith("TEST_"):
                    requests.delete(
                        f"{BASE_URL}/api/tickets/{ticket['ticket_number']}",
                        headers={"Authorization": f"Bearer {joeziel_token}"}
                    )
        assert True  # Cleanup is best-effort


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
