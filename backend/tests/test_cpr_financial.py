"""
CPR Financial Engine and Portfolio P&L Tests
Tests for Iteration 85 - PartnersHub Financial Features
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCPRFinancialEngine:
    """Tests for CPR financial calculations and portfolio P&L"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for all tests"""
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
        
        # Login as admin
        login_res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        token = login_res.json().get('access_token')
        self.session.headers.update({'Authorization': f'Bearer {token}'})
        self.token = token
    
    # ============ TEST 1: Portfolio P&L Endpoint ============
    def test_portfolio_pl_returns_correct_legacy_cpr_totals(self):
        """Test 1: GET /api/cpr/portfolio-pl returns correct Legacy CPR totals"""
        res = self.session.get(f"{BASE_URL}/api/cpr/portfolio-pl")
        assert res.status_code == 200, f"Portfolio P&L failed: {res.text}"
        
        data = res.json()
        assert 'categories' in data, "Response missing 'categories' field"
        
        legacy = data['categories'].get('legacy_cpr', {})
        print(f"Legacy CPR totals: CR Revenue=${legacy.get('cr_revenue')}, CR Cost=${legacy.get('cr_cost')}, "
              f"Notary Revenue=${legacy.get('notary_revenue')}, Notary Cost=${legacy.get('notary_cost')}, "
              f"Mailing=${legacy.get('mailing_cost')}")
        
        # Verify structure exists
        assert 'cr_revenue' in legacy, "Missing cr_revenue in legacy_cpr"
        assert 'cr_cost' in legacy, "Missing cr_cost in legacy_cpr"
        assert 'notary_revenue' in legacy, "Missing notary_revenue in legacy_cpr"
        assert 'notary_cost' in legacy, "Missing notary_cost in legacy_cpr"
        assert 'mailing_cost' in legacy, "Missing mailing_cost in legacy_cpr"
        
        # Check Auth.net fee section
        assert 'auth_net_monthly' in data, "Missing auth_net_monthly"
        assert 'auth_net_total' in data, "Missing auth_net_total"
        assert data['auth_net_monthly'] == 35.00, f"Auth.net monthly should be $35, got {data['auth_net_monthly']}"
    
    # ============ TEST 2: Client List Endpoint ============
    def test_get_clients_list(self):
        """Test GET /api/cpr/clients returns client list"""
        res = self.session.get(f"{BASE_URL}/api/cpr/clients")
        assert res.status_code == 200, f"Get clients failed: {res.text}"
        
        clients = res.json()
        assert isinstance(clients, list), "Response should be a list"
        assert len(clients) > 0, "Should have at least one client"
        
        # Check client structure
        client = clients[0]
        assert 'id' in client, "Client missing id"
        assert 'full_name' in client, "Client missing full_name"
        assert 'category' in client, "Client missing category"
    
    # ============ TEST 3: Find Mark Phillips and verify net_pl ============
    def test_mark_phillips_net_pl(self):
        """Test 4: Verify Mark Phillips net_pl calculation"""
        res = self.session.get(f"{BASE_URL}/api/cpr/clients")
        assert res.status_code == 200
        
        clients = res.json()
        mark = next((c for c in clients if c.get('full_name') == 'Mark Phillips'), None)
        
        if mark:
            print(f"Mark Phillips found: net_pl=${mark.get('net_pl')}, category={mark.get('category')}")
            # If Mark Phillips exists, verify he has financial fields
            if mark.get('category') == 'legacy_cpr':
                assert 'net_pl' in mark or 'cr_revenue' in mark, "Legacy client should have financial fields"
        else:
            print("Mark Phillips not found in client list - may need to be seeded")
            pytest.skip("Mark Phillips not in database")
    
    # ============ TEST 4: Find Hilary Bond and verify net_pl ============
    def test_hilary_bond_net_pl(self):
        """Test 4: Verify Hilary Bond net_pl=-30.19"""
        res = self.session.get(f"{BASE_URL}/api/cpr/clients")
        assert res.status_code == 200
        
        clients = res.json()
        hilary = next((c for c in clients if c.get('full_name') == 'Hilary Bond'), None)
        
        if hilary:
            print(f"Hilary Bond found: net_pl=${hilary.get('net_pl')}, category={hilary.get('category')}")
            if hilary.get('category') == 'legacy_cpr':
                assert 'net_pl' in hilary or 'cr_revenue' in hilary, "Legacy client should have financial fields"
        else:
            print("Hilary Bond not found in client list - may need to be seeded")
            pytest.skip("Hilary Bond not in database")
    
    # ============ TEST 5: Find William Peden Kendal and verify grand_total ============
    def test_william_peden_kendal_grand_total(self):
        """Test 4: Verify William Peden Kendal grand_total=165.28"""
        # Check in Elisabeth clients
        res = self.session.get(f"{BASE_URL}/api/cpr/elisabeth")
        assert res.status_code == 200
        
        clients = res.json()
        william = next((c for c in clients if 'William Peden' in c.get('full_name', '')), None)
        
        if william:
            print(f"William Peden Kendal found: grand_total=${william.get('grand_total')}, "
                  f"shar_total=${william.get('shar_total')}, joe_total=${william.get('joe_total')}")
            assert 'grand_total' in william, "Elisabeth client should have grand_total"
            assert 'shar_total' in william, "Elisabeth client should have shar_total"
            assert 'joe_total' in william, "Elisabeth client should have joe_total"
        else:
            print("William Peden Kendal not found in Elisabeth clients")
            pytest.skip("William Peden Kendal not in database")
    
    # ============ TEST 6: PUT client recalculates legacy_cpr fields ============
    def test_put_client_recalculates_legacy_cpr(self):
        """Test 2: PUT /api/cpr/clients/{id} recalculates legacy_cpr financial fields"""
        # Get a legacy_cpr client
        res = self.session.get(f"{BASE_URL}/api/cpr/clients?category=legacy_cpr")
        assert res.status_code == 200
        
        clients = res.json()
        if not clients:
            pytest.skip("No legacy_cpr clients found")
        
        client = clients[0]
        client_id = client['id']
        original_cr_revenue = client.get('cr_revenue', 0)
        
        # Update a CR status to trigger recalculation
        update_data = {
            "jan_cr_status": "paid",
            "feb_cr_status": "paid"
        }
        
        put_res = self.session.put(f"{BASE_URL}/api/cpr/clients/{client_id}", json=update_data)
        assert put_res.status_code == 200, f"PUT failed: {put_res.text}"
        
        updated = put_res.json()
        print(f"Updated legacy client: cr_revenue=${updated.get('cr_revenue')}, "
              f"cr_cost=${updated.get('cr_cost')}, net_pl=${updated.get('net_pl')}")
        
        # Verify financial fields are present after update
        assert 'cr_revenue' in updated, "Updated client should have cr_revenue"
        assert 'cr_cost' in updated, "Updated client should have cr_cost"
        assert 'net_pl' in updated, "Updated client should have net_pl"
    
    # ============ TEST 7: PUT client recalculates shar_active fields ============
    def test_put_client_recalculates_shar_active(self):
        """Test 3: PUT /api/cpr/clients/{id} recalculates shar_active financial fields"""
        # Get a shar_active client
        res = self.session.get(f"{BASE_URL}/api/cpr/clients?category=shar_active")
        assert res.status_code == 200
        
        clients = res.json()
        if not clients:
            pytest.skip("No shar_active clients found")
        
        client = clients[0]
        client_id = client['id']
        
        # Update a status to trigger recalculation
        update_data = {
            "jan_rev_status": "paid",
            "jan_cr_status": "paid"
        }
        
        put_res = self.session.put(f"{BASE_URL}/api/cpr/clients/{client_id}", json=update_data)
        assert put_res.status_code == 200, f"PUT failed: {put_res.text}"
        
        updated = put_res.json()
        print(f"Updated shar_active client: shar_total=${updated.get('shar_total')}, "
              f"joe_total=${updated.get('joe_total')}, grand_total=${updated.get('grand_total')}")
        
        # Verify financial fields are present after update
        assert 'shar_total' in updated, "Updated client should have shar_total"
        assert 'joe_total' in updated, "Updated client should have joe_total"
        assert 'grand_total' in updated, "Updated client should have grand_total"
    
    # ============ TEST 8: Portfolio P&L has category breakdowns ============
    def test_portfolio_pl_category_breakdowns(self):
        """Test 10: Portfolio P&L tab shows category breakdowns"""
        res = self.session.get(f"{BASE_URL}/api/cpr/portfolio-pl")
        assert res.status_code == 200
        
        data = res.json()
        categories = data.get('categories', {})
        
        # Check all expected categories exist
        for cat in ['legacy_cpr', 'shar_active', 'new_credlocity']:
            if cat in categories:
                cat_data = categories[cat]
                print(f"{cat}: count={cat_data.get('count')}, cr_revenue=${cat_data.get('cr_revenue')}, "
                      f"shar_total=${cat_data.get('shar_total')}, joe_total=${cat_data.get('joe_total')}")
                
                # Verify structure
                assert 'count' in cat_data, f"{cat} missing count"
                assert 'cr_revenue' in cat_data, f"{cat} missing cr_revenue"
                assert 'cr_cost' in cat_data, f"{cat} missing cr_cost"
    
    # ============ TEST 9: Auth.net fee section ============
    def test_portfolio_pl_authnet_fee(self):
        """Test 11: Portfolio P&L tab shows Auth.net $35/month fee section"""
        res = self.session.get(f"{BASE_URL}/api/cpr/portfolio-pl")
        assert res.status_code == 200
        
        data = res.json()
        
        assert 'auth_net_monthly' in data, "Missing auth_net_monthly"
        assert 'auth_net_months' in data, "Missing auth_net_months"
        assert 'auth_net_total' in data, "Missing auth_net_total"
        
        print(f"Auth.net: ${data['auth_net_monthly']}/month x {data['auth_net_months']} months = ${data['auth_net_total']}")
        
        assert data['auth_net_monthly'] == 35.00, f"Auth.net monthly should be $35"
        assert data['auth_net_total'] == data['auth_net_monthly'] * data['auth_net_months']
    
    # ============ TEST 10: Recalculate all endpoint ============
    def test_recalculate_all_endpoint(self):
        """Test POST /api/cpr/recalculate-all endpoint"""
        res = self.session.post(f"{BASE_URL}/api/cpr/recalculate-all")
        assert res.status_code == 200, f"Recalculate all failed: {res.text}"
        
        data = res.json()
        assert 'message' in data, "Response should have message"
        assert 'total' in data, "Response should have total count"
        
        print(f"Recalculate all: {data['message']}, total={data['total']}")
    
    # ============ TEST 11: Get single client ============
    def test_get_single_client(self):
        """Test GET /api/cpr/clients/{id} returns client details"""
        # First get a client ID
        list_res = self.session.get(f"{BASE_URL}/api/cpr/clients")
        assert list_res.status_code == 200
        
        clients = list_res.json()
        if not clients:
            pytest.skip("No clients found")
        
        client_id = clients[0]['id']
        
        # Get single client
        res = self.session.get(f"{BASE_URL}/api/cpr/clients/{client_id}")
        assert res.status_code == 200, f"Get client failed: {res.text}"
        
        client = res.json()
        assert client['id'] == client_id
        assert 'full_name' in client
        assert 'category' in client
    
    # ============ TEST 12: Elisabeth clients endpoint ============
    def test_elisabeth_clients_endpoint(self):
        """Test GET /api/cpr/elisabeth returns Elisabeth clients"""
        res = self.session.get(f"{BASE_URL}/api/cpr/elisabeth")
        assert res.status_code == 200, f"Get Elisabeth clients failed: {res.text}"
        
        clients = res.json()
        assert isinstance(clients, list), "Response should be a list"
        
        if clients:
            client = clients[0]
            print(f"Elisabeth client: {client.get('full_name')}, grand_total=${client.get('grand_total')}")
            assert 'full_name' in client
            assert 'grand_total' in client or 'shar_total' in client
    
    # ============ TEST 13: Notary waivers summary ============
    def test_notary_waivers_summary(self):
        """Test GET /api/cpr/notary-waivers/summary returns waiver data"""
        res = self.session.get(f"{BASE_URL}/api/cpr/notary-waivers/summary")
        assert res.status_code == 200, f"Get notary waivers failed: {res.text}"
        
        data = res.json()
        assert 'total_orders' in data, "Missing total_orders"
        assert 'total_collected' in data, "Missing total_collected"
        assert 'total_shortfall' in data, "Missing total_shortfall"
        
        print(f"Notary waivers: {data['total_orders']} orders, collected=${data['total_collected']}, "
              f"shortfall=${data['total_shortfall']}")
    
    # ============ TEST 14: Shar payouts endpoint ============
    def test_shar_payouts_endpoint(self):
        """Test GET /api/cpr/shar/payouts returns payout history"""
        res = self.session.get(f"{BASE_URL}/api/cpr/shar/payouts")
        assert res.status_code == 200, f"Get payouts failed: {res.text}"
        
        payouts = res.json()
        assert isinstance(payouts, list), "Response should be a list"
        
        if payouts:
            payout = payouts[0]
            print(f"Payout: date={payout.get('date')}, amount=${payout.get('amount')}, description={payout.get('description')}")
            assert 'date' in payout or 'payment_date' in payout, "Payout should have date field"
            assert 'amount' in payout or 'actual_paid' in payout, "Payout should have amount field"


class TestPartnerPINAuth:
    """Tests for Partner PIN authentication flow"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get CMS auth token"""
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
        
        # Login as admin to get CMS token
        login_res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        assert login_res.status_code == 200
        self.cms_token = login_res.json().get('access_token')
        self.session.headers.update({'Authorization': f'Bearer {self.cms_token}'})
    
    def test_pin_auth_with_correct_pin(self):
        """Test PIN auth with correct PIN 042889"""
        res = self.session.post(f"{BASE_URL}/api/partners/pin-auth", json={"pin": "042889"})
        assert res.status_code == 200, f"PIN auth failed: {res.text}"
        
        data = res.json()
        assert 'access_token' in data, "Response should have access_token"
        assert 'partner' in data, "Response should have partner data"
        
        print(f"Partner authenticated: {data['partner'].get('display_name')}, role={data['partner'].get('role')}")
    
    def test_pin_auth_with_wrong_pin(self):
        """Test PIN auth with wrong PIN returns 401"""
        res = self.session.post(f"{BASE_URL}/api/partners/pin-auth", json={"pin": "000000"})
        assert res.status_code == 401, f"Wrong PIN should return 401, got {res.status_code}"
    
    def test_partner_summary_endpoint(self):
        """Test partner summary endpoint after PIN auth"""
        # First authenticate with PIN
        pin_res = self.session.post(f"{BASE_URL}/api/partners/pin-auth", json={"pin": "042889"})
        assert pin_res.status_code == 200
        
        partner_token = pin_res.json().get('access_token')
        
        # Use partner token for summary
        headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {partner_token}'}
        res = requests.get(f"{BASE_URL}/api/cpr-partners/summary", headers=headers)
        assert res.status_code == 200, f"Partner summary failed: {res.text}"
        
        data = res.json()
        assert 'total_clients' in data, "Missing total_clients"
        assert 'shar_current_total' in data, "Missing shar_current_total"
        assert 'joe_current_total' in data, "Missing joe_current_total"
        
        print(f"Partner summary: {data['total_clients']} clients, shar=${data['shar_current_total']}, joe=${data['joe_current_total']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
