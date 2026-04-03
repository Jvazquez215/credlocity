"""
CPR Merger Financial Tracking System - Iteration 82 Tests
Tests for:
- Partner authentication (joeziel@credlocity.com / Credit123!)
- Summary endpoint with 121 clients (41 legacy, 43 shar_active, 37 new_credlocity)
- Client listing by category
- William Peden Kendal exact financial calculations
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCPRPartnerAuth:
    """CPR Partner authentication tests"""
    
    def test_partner_login_joeziel_success(self):
        """Test partner login with joeziel@credlocity.com / Credit123!"""
        response = requests.post(f"{BASE_URL}/api/cpr-partners/login", json={
            "email": "joeziel@credlocity.com",
            "password": "Credit123!"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify access_token is returned
        assert "access_token" in data, "Response should contain 'access_token'"
        assert isinstance(data["access_token"], str)
        assert len(data["access_token"]) > 0
        
        # Verify partner info
        assert "partner" in data
        assert data["partner"]["email"] == "joeziel@credlocity.com"
        assert data["partner"]["role"] == "master_partner"
        assert data["partner"]["can_verify"] == True
        assert data["partner"]["can_edit_mailing"] == True
    
    def test_partner_login_shar_success(self):
        """Test partner login with shar@cprcreditrepair.com / Credlocity2026!"""
        response = requests.post(f"{BASE_URL}/api/cpr-partners/login", json={
            "email": "shar@cprcreditrepair.com",
            "password": "Credlocity2026!"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "access_token" in data
        assert data["partner"]["role"] == "partner"
        assert data["partner"]["can_verify"] == False
    
    def test_partner_login_invalid_credentials(self):
        """Test partner login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/cpr-partners/login", json={
            "email": "invalid@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401


class TestCPRPartnerSummary:
    """CPR Partner summary endpoint tests"""
    
    @pytest.fixture
    def partner_token(self):
        """Get partner token for joeziel"""
        response = requests.post(f"{BASE_URL}/api/cpr-partners/login", json={
            "email": "joeziel@credlocity.com",
            "password": "Credit123!"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Partner authentication failed")
    
    def test_summary_returns_correct_client_counts(self, partner_token):
        """Test GET /api/cpr-partners/summary returns correct category breakdowns
        Note: total_clients includes both cpr_clients (121) and cpr_elisabeth_clients (2) = 123
        """
        response = requests.get(
            f"{BASE_URL}/api/cpr-partners/summary",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify total clients (121 cpr + 2 elisabeth = 123)
        assert "total_clients" in data
        # The summary includes both cpr_clients and cpr_elisabeth_clients
        assert data["total_clients"] >= 121, f"Expected at least 121 total clients, got {data['total_clients']}"
        
        # Verify by_category breakdown
        assert "by_category" in data
        by_cat = data["by_category"]
        
        # Check legacy_cpr count
        assert "legacy_cpr" in by_cat, "by_category should contain 'legacy_cpr'"
        assert by_cat["legacy_cpr"]["count"] == 41, f"Expected 41 legacy_cpr, got {by_cat['legacy_cpr']['count']}"
        
        # Check shar_active count
        assert "shar_active" in by_cat, "by_category should contain 'shar_active'"
        assert by_cat["shar_active"]["count"] == 43, f"Expected 43 shar_active, got {by_cat['shar_active']['count']}"
        
        # Check new_credlocity count
        assert "new_credlocity" in by_cat, "by_category should contain 'new_credlocity'"
        assert by_cat["new_credlocity"]["count"] == 37, f"Expected 37 new_credlocity, got {by_cat['new_credlocity']['count']}"
        
        # Verify shar_current_total and joe_current_total exist
        assert "shar_current_total" in data
        assert "joe_current_total" in data
        assert "pending_verifications" in data
    
    def test_summary_requires_auth(self):
        """Test summary endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/cpr-partners/summary")
        assert response.status_code == 401


class TestCPRClientListing:
    """CPR Client listing by category tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    def test_list_shar_active_clients(self, admin_token):
        """Test GET /api/cpr/clients?category=shar_active returns 43 clients"""
        response = requests.get(
            f"{BASE_URL}/api/cpr/clients?category=shar_active",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Response is a raw array
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == 43, f"Expected 43 shar_active clients, got {len(data)}"
        
        # Verify financial fields exist
        for client in data:
            assert "shar_total" in client, f"Client {client.get('full_name')} missing shar_total"
            assert "joe_total" in client, f"Client {client.get('full_name')} missing joe_total"
            assert "grand_total" in client, f"Client {client.get('full_name')} missing grand_total"
    
    def test_list_legacy_cpr_clients(self, admin_token):
        """Test GET /api/cpr/clients?category=legacy_cpr returns 41 clients"""
        response = requests.get(
            f"{BASE_URL}/api/cpr/clients?category=legacy_cpr",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) == 41, f"Expected 41 legacy_cpr clients, got {len(data)}"
    
    def test_list_new_credlocity_clients(self, admin_token):
        """Test GET /api/cpr/clients?category=new_credlocity returns 37 clients"""
        response = requests.get(
            f"{BASE_URL}/api/cpr/clients?category=new_credlocity",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) == 37, f"Expected 37 new_credlocity clients, got {len(data)}"
        
        # Verify financial fields exist
        for client in data:
            assert "shar_total" in client, f"Client {client.get('full_name')} missing shar_total"
            assert "joe_total" in client, f"Client {client.get('full_name')} missing joe_total"


class TestWilliamPedenKendalFinancials:
    """Test exact financial calculations for William Peden Kendal"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    def test_william_peden_kendal_exact_financials(self, admin_token):
        """
        Test William Peden Kendal (shar_active) has exact financials:
        - jan_feb_gross=198.10
        - jan_feb_net=158.30
        - mar_jun_gross=25.54
        - mar_jun_net=6.99
        - shar_total=161.79
        - joe_total=3.49
        - grand_total=165.28
        """
        response = requests.get(
            f"{BASE_URL}/api/cpr/clients?category=shar_active",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Find William Peden Kendal
        william = None
        for client in data:
            if client.get("full_name") == "William Peden Kendal":
                william = client
                break
        
        assert william is not None, "William Peden Kendal not found in shar_active clients"
        
        # Verify exact financial values
        assert william.get("jan_feb_gross") == 198.10, f"Expected jan_feb_gross=198.10, got {william.get('jan_feb_gross')}"
        assert william.get("jan_feb_net") == 158.30, f"Expected jan_feb_net=158.30, got {william.get('jan_feb_net')}"
        assert william.get("mar_jun_gross") == 25.54, f"Expected mar_jun_gross=25.54, got {william.get('mar_jun_gross')}"
        assert william.get("mar_jun_net") == 6.99, f"Expected mar_jun_net=6.99, got {william.get('mar_jun_net')}"
        assert william.get("shar_total") == 161.79, f"Expected shar_total=161.79, got {william.get('shar_total')}"
        assert william.get("joe_total") == 3.49, f"Expected joe_total=3.49, got {william.get('joe_total')}"
        assert william.get("grand_total") == 165.28, f"Expected grand_total=165.28, got {william.get('grand_total')}"
        
        print(f"✓ William Peden Kendal financials verified:")
        print(f"  jan_feb_gross: ${william.get('jan_feb_gross')}")
        print(f"  jan_feb_net: ${william.get('jan_feb_net')}")
        print(f"  mar_jun_gross: ${william.get('mar_jun_gross')}")
        print(f"  mar_jun_net: ${william.get('mar_jun_net')}")
        print(f"  shar_total: ${william.get('shar_total')}")
        print(f"  joe_total: ${william.get('joe_total')}")
        print(f"  grand_total: ${william.get('grand_total')}")


class TestCPRClientRequiresAuth:
    """Test that CPR client endpoints require authentication"""
    
    def test_clients_endpoint_requires_auth(self):
        """Test /api/cpr/clients requires authentication"""
        response = requests.get(f"{BASE_URL}/api/cpr/clients")
        assert response.status_code == 401


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
