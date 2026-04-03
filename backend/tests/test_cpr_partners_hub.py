"""
CPR PartnersHub API Tests - Iteration 80
Tests partner authentication, verification, summary, Elisabeth CRUD, notary waivers, mailing costs, and PDF export.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Partner credentials
JOEZIEL_EMAIL = "joeziel@credlocity.com"
JOEZIEL_PASSWORD = "Credit123!"
SHAR_EMAIL = "shar@cprcreditrepair.com"
SHAR_PASSWORD = "Credlocity2026!"
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"


class TestPartnerAuthentication:
    """Test partner login and token management"""
    
    def test_joeziel_login_returns_master_partner_role(self):
        """Partner login with joeziel@credlocity.com returns master_partner role"""
        response = requests.post(f"{BASE_URL}/api/cpr-partners/login", json={
            "email": JOEZIEL_EMAIL,
            "password": JOEZIEL_PASSWORD
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "access_token" in data, "Missing access_token in response"
        assert "partner" in data, "Missing partner in response"
        assert data["partner"]["role"] == "master_partner", f"Expected master_partner, got {data['partner']['role']}"
        assert data["partner"]["email"] == JOEZIEL_EMAIL
        assert data["partner"]["can_verify"] == True
        assert data["partner"]["can_edit_mailing"] == True
    
    def test_shar_login_returns_partner_role(self):
        """Partner login with shar@cprcreditrepair.com returns partner role"""
        response = requests.post(f"{BASE_URL}/api/cpr-partners/login", json={
            "email": SHAR_EMAIL,
            "password": SHAR_PASSWORD
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["partner"]["role"] == "partner", f"Expected partner, got {data['partner']['role']}"
        assert data["partner"]["email"] == SHAR_EMAIL
        assert data["partner"]["can_verify"] == False
        assert data["partner"]["can_edit_mailing"] == False
    
    def test_partner_login_invalid_credentials(self):
        """Partner login with invalid credentials returns 401"""
        response = requests.post(f"{BASE_URL}/api/cpr-partners/login", json={
            "email": "invalid@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
    
    def test_partner_me_with_valid_token(self):
        """GET /api/cpr-partners/me returns correct partner info with valid token"""
        # First login to get token
        login_res = requests.post(f"{BASE_URL}/api/cpr-partners/login", json={
            "email": JOEZIEL_EMAIL,
            "password": JOEZIEL_PASSWORD
        })
        token = login_res.json()["access_token"]
        
        # Then call /me
        response = requests.get(f"{BASE_URL}/api/cpr-partners/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["email"] == JOEZIEL_EMAIL
        assert data["role"] == "master_partner"
        assert "password_hash" not in data, "password_hash should not be returned"
    
    def test_partner_me_without_token(self):
        """GET /api/cpr-partners/me without token returns 401"""
        response = requests.get(f"{BASE_URL}/api/cpr-partners/me")
        assert response.status_code == 401


class TestPartnerSummary:
    """Test partner summary endpoint"""
    
    @pytest.fixture
    def partner_token(self):
        """Get partner token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/cpr-partners/login", json={
            "email": JOEZIEL_EMAIL,
            "password": JOEZIEL_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_summary_returns_required_fields(self, partner_token):
        """GET /api/cpr-partners/summary returns total_clients, shar_current_total, joe_current_total, by_category"""
        response = requests.get(f"{BASE_URL}/api/cpr-partners/summary", headers={
            "Authorization": f"Bearer {partner_token}"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Check required fields
        assert "total_clients" in data, "Missing total_clients"
        assert "shar_current_total" in data, "Missing shar_current_total"
        assert "joe_current_total" in data, "Missing joe_current_total"
        assert "by_category" in data, "Missing by_category"
        assert "pending_verifications" in data, "Missing pending_verifications"
        
        # Validate types
        assert isinstance(data["total_clients"], int)
        assert isinstance(data["shar_current_total"], (int, float))
        assert isinstance(data["joe_current_total"], (int, float))
        assert isinstance(data["by_category"], dict)
    
    def test_summary_without_token(self):
        """GET /api/cpr-partners/summary without token returns 401"""
        response = requests.get(f"{BASE_URL}/api/cpr-partners/summary")
        assert response.status_code == 401


class TestVerification:
    """Test client verification endpoints"""
    
    @pytest.fixture
    def joeziel_token(self):
        """Get Joeziel's token (master_partner)"""
        response = requests.post(f"{BASE_URL}/api/cpr-partners/login", json={
            "email": JOEZIEL_EMAIL,
            "password": JOEZIEL_PASSWORD
        })
        return response.json()["access_token"]
    
    @pytest.fixture
    def shar_token(self):
        """Get Shar's token (partner)"""
        response = requests.post(f"{BASE_URL}/api/cpr-partners/login", json={
            "email": SHAR_EMAIL,
            "password": SHAR_PASSWORD
        })
        return response.json()["access_token"]
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token for creating test data"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_joeziel_can_verify_client(self, joeziel_token, admin_token):
        """POST /api/cpr-partners/verify/client/{id} works for Joeziel (master_partner)"""
        # First get a client to verify
        clients_res = requests.get(f"{BASE_URL}/api/cpr/clients", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        clients = clients_res.json()
        if not clients:
            pytest.skip("No clients available to verify")
        
        client_id = clients[0]["id"]
        
        # Verify the client
        response = requests.post(f"{BASE_URL}/api/cpr-partners/verify/client/{client_id}", headers={
            "Authorization": f"Bearer {joeziel_token}"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "message" in data
        assert "verified" in data["message"].lower() or "verified_at" in data
    
    def test_shar_cannot_verify_client(self, shar_token, admin_token):
        """POST /api/cpr-partners/verify/client/{id} returns 403 for Shar (partner)"""
        # First get a client
        clients_res = requests.get(f"{BASE_URL}/api/cpr/clients", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        clients = clients_res.json()
        if not clients:
            pytest.skip("No clients available to verify")
        
        client_id = clients[0]["id"]
        
        # Try to verify as Shar
        response = requests.post(f"{BASE_URL}/api/cpr-partners/verify/client/{client_id}", headers={
            "Authorization": f"Bearer {shar_token}"
        })
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
    
    def test_pending_verifications_endpoint(self, joeziel_token):
        """GET /api/cpr-partners/pending-verifications returns list of pending clients"""
        response = requests.get(f"{BASE_URL}/api/cpr-partners/pending-verifications", headers={
            "Authorization": f"Bearer {joeziel_token}"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list)


class TestElisabethClients:
    """Test Elisabeth clients CRUD and financial calculations"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_elisabeth_clients_returns_seeded_data(self, admin_token):
        """GET /api/cpr/elisabeth returns 2 seeded Elisabeth clients"""
        response = requests.get(f"{BASE_URL}/api/cpr/elisabeth", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2, f"Expected at least 2 Elisabeth clients, got {len(data)}"
    
    def test_elisabeth_clients_have_financial_fields(self, admin_token):
        """Elisabeth clients have auto-calculated financial fields"""
        response = requests.get(f"{BASE_URL}/api/cpr/elisabeth", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        data = response.json()
        if not data:
            pytest.skip("No Elisabeth clients available")
        
        client = data[0]
        # Check financial fields are present
        assert "jan_feb_gross" in client, "Missing jan_feb_gross"
        assert "shar_total" in client, "Missing shar_total"
        assert "joe_total" in client, "Missing joe_total"
        assert "grand_total" in client, "Missing grand_total"
        
        # Check types
        assert isinstance(client["jan_feb_gross"], (int, float))
        assert isinstance(client["shar_total"], (int, float))
        assert isinstance(client["joe_total"], (int, float))
    
    def test_create_elisabeth_client(self, admin_token):
        """POST /api/cpr/elisabeth creates new client with auto-calculated financials"""
        new_client = {
            "full_name": "TEST_Elisabeth_Client",
            "cr_date": "2026-01-01",
            "status": "active",
            "monthly_rev_rate": 100.00,
            "cr_fee": 49.95,
            "cr_cost": 16.00,
            "jan_rev_status": "paid",
            "feb_rev_status": "paid",
            "jan_cr_status": "paid",
            "feb_cr_status": "paid",
            "notary_date": "2026-01-15",
            "notary_charged": 30.00,
            "cb_risk": "low",
            "notes": "Test client for iteration 80"
        }
        
        response = requests.post(f"{BASE_URL}/api/cpr/elisabeth", 
            headers={"Authorization": f"Bearer {admin_token}"},
            json=new_client
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify created client has financial calculations
        assert "id" in data
        assert data["full_name"] == "TEST_Elisabeth_Client"
        assert "jan_feb_gross" in data
        assert "shar_total" in data
        assert "joe_total" in data
        
        # Cleanup - delete the test client
        requests.delete(f"{BASE_URL}/api/cpr/elisabeth/{data['id']}", 
            headers={"Authorization": f"Bearer {admin_token}"})


class TestNotaryWaivers:
    """Test notary waiver summary endpoint"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_notary_waiver_summary_returns_correct_structure(self, admin_token):
        """GET /api/cpr/notary-waivers/summary returns correct counts"""
        response = requests.get(f"{BASE_URL}/api/cpr/notary-waivers/summary", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Check required fields
        assert "total_orders" in data
        assert "total_collected" in data
        assert "expected_standard" in data
        assert "total_shortfall" in data
        assert "fully_waived_count" in data
        assert "discounted_count" in data
        assert "net_notary_profit" in data
        assert "waivers" in data
        
        # Validate types
        assert isinstance(data["total_orders"], int)
        assert isinstance(data["waivers"], list)


class TestMailingCostRestriction:
    """Test that mailing cost update is restricted for partners"""
    
    @pytest.fixture
    def partner_token(self):
        """Get partner token"""
        response = requests.post(f"{BASE_URL}/api/cpr-partners/login", json={
            "email": SHAR_EMAIL,
            "password": SHAR_PASSWORD
        })
        return response.json()["access_token"]
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_mailing_update_with_partner_token_fails(self, partner_token, admin_token):
        """PUT /api/cpr/clients/{id}/mailing returns 401/403 when called with partner JWT"""
        # Get a client ID first
        clients_res = requests.get(f"{BASE_URL}/api/cpr/clients", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        clients = clients_res.json()
        if not clients:
            pytest.skip("No clients available")
        
        client_id = clients[0]["id"]
        
        # Try to update mailing with partner token (should fail)
        response = requests.put(f"{BASE_URL}/api/cpr/clients/{client_id}/mailing",
            headers={"Authorization": f"Bearer {partner_token}"},
            json={"jan_mail_amount": 10.00}
        )
        # Should return 401 (invalid token type) or 403 (forbidden)
        assert response.status_code in [401, 403], f"Expected 401 or 403, got {response.status_code}: {response.text}"


class TestPayoutPDF:
    """Test payout PDF export"""
    
    @pytest.fixture
    def partner_token(self):
        """Get partner token"""
        response = requests.post(f"{BASE_URL}/api/cpr-partners/login", json={
            "email": JOEZIEL_EMAIL,
            "password": JOEZIEL_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_payout_pdf_returns_valid_pdf(self, partner_token):
        """GET /api/cpr-partners/payout-pdf returns a valid PDF file"""
        response = requests.get(f"{BASE_URL}/api/cpr-partners/payout-pdf", headers={
            "Authorization": f"Bearer {partner_token}"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Check content type
        content_type = response.headers.get("content-type", "")
        assert "application/pdf" in content_type, f"Expected PDF content type, got {content_type}"
        
        # Check content disposition
        content_disp = response.headers.get("content-disposition", "")
        assert "attachment" in content_disp, f"Expected attachment disposition, got {content_disp}"
        assert "payout-summary" in content_disp, f"Expected payout-summary in filename, got {content_disp}"
        
        # Check PDF magic bytes
        assert response.content[:4] == b'%PDF', "Response does not start with PDF magic bytes"
    
    def test_payout_pdf_without_token_fails(self):
        """GET /api/cpr-partners/payout-pdf without token returns 401"""
        response = requests.get(f"{BASE_URL}/api/cpr-partners/payout-pdf")
        assert response.status_code == 401


class TestCPRClientsCategories:
    """Test CPR clients by category"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_legacy_cpr_clients_exist(self, admin_token):
        """GET /api/cpr/clients?category=legacy_cpr returns legacy clients"""
        response = requests.get(f"{BASE_URL}/api/cpr/clients?category=legacy_cpr", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Expected at least 1 legacy_cpr client"
        for client in data:
            assert client["category"] == "legacy_cpr"
    
    def test_shar_active_clients_have_financials(self, admin_token):
        """GET /api/cpr/clients?category=shar_active returns clients with shar_total/joe_total"""
        response = requests.get(f"{BASE_URL}/api/cpr/clients?category=shar_active", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            client = data[0]
            assert client["category"] == "shar_active"
            # shar_active clients should have financial calculations
            assert "shar_total" in client or "jan_feb_gross" in client


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
