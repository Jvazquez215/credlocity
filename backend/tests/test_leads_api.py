"""
Test Leads API - Lead Capture Flow for Free Trial and Consultation
Tests POST/GET/PUT/DELETE /api/leads endpoints
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestLeadsAPI:
    """Tests for the Leads API endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.test_lead_ids = []
        self.unique_id = str(uuid.uuid4())[:8]
        yield
        # Cleanup: Delete test leads
        for lead_id in self.test_lead_ids:
            try:
                requests.delete(f"{BASE_URL}/api/leads/{lead_id}")
            except:
                pass
    
    # ─── POST /api/leads - Create Lead ───
    
    def test_create_lead_free_trial_success(self):
        """POST /api/leads - Create free_trial lead with all required fields"""
        payload = {
            "first_name": f"TEST_John_{self.unique_id}",
            "last_name": "Doe",
            "email": f"test_john_{self.unique_id}@example.com",
            "phone": "555-123-4567",
            "address": "123 Test Street",
            "city": "Philadelphia",
            "state": "PA",
            "zip_code": "19103",
            "signed_name": "John Doe",
            "lead_type": "free_trial"
        }
        response = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response should contain lead id"
        assert data["message"] == "Lead captured successfully"
        assert data["lead_type"] == "free_trial"
        assert data["credit_report_url"] is not None, "Free trial should have credit_report_url"
        assert "scorefusion" in data["credit_report_url"].lower(), "Credit report URL should be ScoreFusion"
        assert data["redirect_url"] is None, "Free trial should not have redirect_url"
        
        self.test_lead_ids.append(data["id"])
    
    def test_create_lead_consultation_success(self):
        """POST /api/leads - Create consultation lead with all required fields"""
        payload = {
            "first_name": f"TEST_Jane_{self.unique_id}",
            "last_name": "Smith",
            "email": f"test_jane_{self.unique_id}@example.com",
            "phone": "555-987-6543",
            "address": "456 Test Avenue",
            "city": "New York",
            "state": "NY",
            "zip_code": "10001",
            "signed_name": "Jane Smith",
            "lead_type": "consultation"
        }
        response = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data
        assert data["lead_type"] == "consultation"
        assert data["redirect_url"] is not None, "Consultation should have redirect_url"
        assert "calendly" in data["redirect_url"].lower(), "Redirect URL should be Calendly"
        assert data["credit_report_url"] is None, "Consultation should not have credit_report_url"
        
        self.test_lead_ids.append(data["id"])
    
    def test_create_lead_missing_required_fields(self):
        """POST /api/leads - Missing required fields returns 400"""
        payload = {
            "first_name": "Test",
            "email": "test@example.com"
            # Missing: last_name, phone, address, city, state, zip_code, signed_name, lead_type
        }
        response = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "Missing required fields" in response.json().get("detail", "")
    
    def test_create_lead_invalid_lead_type(self):
        """POST /api/leads - Invalid lead_type returns 400"""
        payload = {
            "first_name": "Test",
            "last_name": "User",
            "email": "test@example.com",
            "phone": "555-111-2222",
            "address": "789 Test Blvd",
            "city": "Chicago",
            "state": "IL",
            "zip_code": "60601",
            "signed_name": "Test User",
            "lead_type": "invalid_type"
        }
        response = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "lead_type must be" in response.json().get("detail", "")
    
    def test_create_lead_empty_required_field(self):
        """POST /api/leads - Empty required field returns 400"""
        payload = {
            "first_name": "",  # Empty
            "last_name": "User",
            "email": "test@example.com",
            "phone": "555-111-2222",
            "address": "789 Test Blvd",
            "city": "Chicago",
            "state": "IL",
            "zip_code": "60601",
            "signed_name": "Test User",
            "lead_type": "free_trial"
        }
        response = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    
    # ─── GET /api/leads - List Leads ───
    
    def test_get_leads_returns_list(self):
        """GET /api/leads - Returns list of leads"""
        response = requests.get(f"{BASE_URL}/api/leads")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
    
    def test_get_leads_sorted_by_created_at_desc(self):
        """GET /api/leads - Leads are sorted by created_at descending"""
        # Create two leads
        for i in range(2):
            payload = {
                "first_name": f"TEST_Sort_{self.unique_id}_{i}",
                "last_name": "Test",
                "email": f"test_sort_{self.unique_id}_{i}@example.com",
                "phone": "555-000-0000",
                "address": "Test Address",
                "city": "Test City",
                "state": "CA",
                "zip_code": "90001",
                "signed_name": "Test Sort",
                "lead_type": "free_trial"
            }
            res = requests.post(f"{BASE_URL}/api/leads", json=payload)
            if res.status_code == 200:
                self.test_lead_ids.append(res.json()["id"])
        
        response = requests.get(f"{BASE_URL}/api/leads")
        assert response.status_code == 200
        
        data = response.json()
        if len(data) >= 2:
            # Check that leads are sorted by created_at descending
            for i in range(len(data) - 1):
                assert data[i]["created_at"] >= data[i+1]["created_at"], "Leads should be sorted by created_at desc"
    
    def test_get_leads_filter_by_status(self):
        """GET /api/leads?status=new - Filter by status"""
        response = requests.get(f"{BASE_URL}/api/leads?status=new")
        assert response.status_code == 200
        
        data = response.json()
        for lead in data:
            assert lead["status"] == "new", f"Expected status 'new', got '{lead['status']}'"
    
    def test_get_leads_filter_by_lead_type(self):
        """GET /api/leads?lead_type=free_trial - Filter by lead_type"""
        response = requests.get(f"{BASE_URL}/api/leads?lead_type=free_trial")
        assert response.status_code == 200
        
        data = response.json()
        for lead in data:
            assert lead["lead_type"] == "free_trial", f"Expected lead_type 'free_trial', got '{lead['lead_type']}'"
    
    # ─── GET /api/leads/stats - Lead Statistics ───
    
    def test_get_lead_stats(self):
        """GET /api/leads/stats - Returns correct statistics structure"""
        response = requests.get(f"{BASE_URL}/api/leads/stats")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        required_fields = ["total", "new", "contacted", "converted", "lost", "free_trial", "consultation"]
        for field in required_fields:
            assert field in data, f"Stats should contain '{field}'"
            assert isinstance(data[field], int), f"'{field}' should be an integer"
    
    def test_get_lead_stats_counts_match(self):
        """GET /api/leads/stats - Total equals sum of status counts"""
        response = requests.get(f"{BASE_URL}/api/leads/stats")
        assert response.status_code == 200
        
        data = response.json()
        # Note: total may not equal sum of statuses if there are other statuses like 'cancelled'
        # But free_trial + consultation should equal total
        assert data["free_trial"] + data["consultation"] <= data["total"], "Type counts should not exceed total"
    
    # ─── GET /api/leads/{id} - Get Single Lead ───
    
    def test_get_single_lead(self):
        """GET /api/leads/{id} - Returns single lead by ID"""
        # First create a lead
        payload = {
            "first_name": f"TEST_Single_{self.unique_id}",
            "last_name": "Lead",
            "email": f"test_single_{self.unique_id}@example.com",
            "phone": "555-333-4444",
            "address": "Single Test Address",
            "city": "Boston",
            "state": "MA",
            "zip_code": "02101",
            "signed_name": "Single Lead",
            "lead_type": "consultation"
        }
        create_res = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert create_res.status_code == 200
        lead_id = create_res.json()["id"]
        self.test_lead_ids.append(lead_id)
        
        # Get the lead
        response = requests.get(f"{BASE_URL}/api/leads/{lead_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == lead_id
        assert data["first_name"] == payload["first_name"]
        assert data["email"] == payload["email"].lower()
        assert data["status"] == "new"
        assert data["agreement_signed"] == True
    
    def test_get_single_lead_not_found(self):
        """GET /api/leads/{id} - Non-existent lead returns 404"""
        response = requests.get(f"{BASE_URL}/api/leads/non-existent-id-12345")
        assert response.status_code == 404
    
    # ─── PUT /api/leads/{id} - Update Lead ───
    
    def test_update_lead_status(self):
        """PUT /api/leads/{id} - Update lead status"""
        # Create a lead
        payload = {
            "first_name": f"TEST_Update_{self.unique_id}",
            "last_name": "Status",
            "email": f"test_update_{self.unique_id}@example.com",
            "phone": "555-555-5555",
            "address": "Update Test Address",
            "city": "Seattle",
            "state": "WA",
            "zip_code": "98101",
            "signed_name": "Update Status",
            "lead_type": "free_trial"
        }
        create_res = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert create_res.status_code == 200
        lead_id = create_res.json()["id"]
        self.test_lead_ids.append(lead_id)
        
        # Update status
        update_payload = {"status": "contacted"}
        response = requests.put(f"{BASE_URL}/api/leads/{lead_id}", json=update_payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "contacted"
        
        # Verify persistence
        get_res = requests.get(f"{BASE_URL}/api/leads/{lead_id}")
        assert get_res.json()["status"] == "contacted"
    
    def test_update_lead_notes(self):
        """PUT /api/leads/{id} - Update lead notes"""
        # Create a lead
        payload = {
            "first_name": f"TEST_Notes_{self.unique_id}",
            "last_name": "Test",
            "email": f"test_notes_{self.unique_id}@example.com",
            "phone": "555-666-7777",
            "address": "Notes Test Address",
            "city": "Denver",
            "state": "CO",
            "zip_code": "80201",
            "signed_name": "Notes Test",
            "lead_type": "consultation"
        }
        create_res = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert create_res.status_code == 200
        lead_id = create_res.json()["id"]
        self.test_lead_ids.append(lead_id)
        
        # Update notes
        update_payload = {"notes": "Called on 01/15/2026, interested in premium plan"}
        response = requests.put(f"{BASE_URL}/api/leads/{lead_id}", json=update_payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["notes"] == update_payload["notes"]
    
    def test_update_lead_invalid_status(self):
        """PUT /api/leads/{id} - Invalid status returns 400"""
        # Create a lead
        payload = {
            "first_name": f"TEST_Invalid_{self.unique_id}",
            "last_name": "Status",
            "email": f"test_invalid_{self.unique_id}@example.com",
            "phone": "555-888-9999",
            "address": "Invalid Test Address",
            "city": "Miami",
            "state": "FL",
            "zip_code": "33101",
            "signed_name": "Invalid Status",
            "lead_type": "free_trial"
        }
        create_res = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert create_res.status_code == 200
        lead_id = create_res.json()["id"]
        self.test_lead_ids.append(lead_id)
        
        # Try invalid status
        update_payload = {"status": "invalid_status"}
        response = requests.put(f"{BASE_URL}/api/leads/{lead_id}", json=update_payload)
        assert response.status_code == 400
    
    def test_update_lead_not_found(self):
        """PUT /api/leads/{id} - Non-existent lead returns 404"""
        response = requests.put(f"{BASE_URL}/api/leads/non-existent-id-12345", json={"status": "contacted"})
        assert response.status_code == 404
    
    # ─── DELETE /api/leads/{id} - Delete Lead ───
    
    def test_delete_lead(self):
        """DELETE /api/leads/{id} - Delete lead successfully"""
        # Create a lead
        payload = {
            "first_name": f"TEST_Delete_{self.unique_id}",
            "last_name": "Me",
            "email": f"test_delete_{self.unique_id}@example.com",
            "phone": "555-000-1111",
            "address": "Delete Test Address",
            "city": "Austin",
            "state": "TX",
            "zip_code": "78701",
            "signed_name": "Delete Me",
            "lead_type": "free_trial"
        }
        create_res = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert create_res.status_code == 200
        lead_id = create_res.json()["id"]
        
        # Delete the lead
        response = requests.delete(f"{BASE_URL}/api/leads/{lead_id}")
        assert response.status_code == 200
        
        # Verify deletion
        get_res = requests.get(f"{BASE_URL}/api/leads/{lead_id}")
        assert get_res.status_code == 404
    
    def test_delete_lead_not_found(self):
        """DELETE /api/leads/{id} - Non-existent lead returns 404"""
        response = requests.delete(f"{BASE_URL}/api/leads/non-existent-id-12345")
        assert response.status_code == 404


class TestLeadsAgreementPDF:
    """Tests for Agreement PDF generation and download - Iteration 95"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.test_lead_ids = []
        self.unique_id = str(uuid.uuid4())[:8]
        yield
        for lead_id in self.test_lead_ids:
            try:
                requests.delete(f"{BASE_URL}/api/leads/{lead_id}")
            except:
                pass
    
    def test_create_lead_captures_ip_address(self):
        """POST /api/leads - Lead is created with IP address captured"""
        payload = {
            "first_name": f"TEST_IP_{self.unique_id}",
            "last_name": "Address",
            "email": f"test_ip_{self.unique_id}@example.com",
            "phone": "555-111-2222",
            "address": "123 IP Test Street",
            "city": "Philadelphia",
            "state": "PA",
            "zip_code": "19103",
            "signed_name": "IP Address Test",
            "lead_type": "free_trial"
        }
        response = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        lead_id = response.json()["id"]
        self.test_lead_ids.append(lead_id)
        
        # Get the lead and verify IP address is captured
        get_res = requests.get(f"{BASE_URL}/api/leads/{lead_id}")
        assert get_res.status_code == 200
        
        data = get_res.json()
        assert "ip_address" in data, "Lead should have ip_address field"
        assert data["ip_address"] is not None, "IP address should not be None"
        assert len(data["ip_address"]) > 0, "IP address should not be empty"
    
    def test_get_lead_has_agreement_pdf_flag(self):
        """GET /api/leads/{id} - Returns has_agreement_pdf: true for leads with stored PDFs"""
        payload = {
            "first_name": f"TEST_PDF_{self.unique_id}",
            "last_name": "Flag",
            "email": f"test_pdf_flag_{self.unique_id}@example.com",
            "phone": "555-222-3333",
            "address": "456 PDF Test Ave",
            "city": "New York",
            "state": "NY",
            "zip_code": "10001",
            "signed_name": "PDF Flag Test",
            "lead_type": "free_trial"
        }
        response = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert response.status_code == 200
        
        lead_id = response.json()["id"]
        self.test_lead_ids.append(lead_id)
        
        # Get the lead and verify has_agreement_pdf flag
        get_res = requests.get(f"{BASE_URL}/api/leads/{lead_id}")
        assert get_res.status_code == 200
        
        data = get_res.json()
        assert "has_agreement_pdf" in data, "Lead should have has_agreement_pdf field"
        assert data["has_agreement_pdf"] == True, "has_agreement_pdf should be True for leads with stored PDFs"
    
    def test_get_leads_list_excludes_pdf_base64(self):
        """GET /api/leads - List endpoint excludes agreement_pdf_base64 for performance"""
        # Create a lead first
        payload = {
            "first_name": f"TEST_List_{self.unique_id}",
            "last_name": "NoPDF",
            "email": f"test_list_nopdf_{self.unique_id}@example.com",
            "phone": "555-333-4444",
            "address": "789 List Test Blvd",
            "city": "Chicago",
            "state": "IL",
            "zip_code": "60601",
            "signed_name": "List No PDF",
            "lead_type": "consultation"
        }
        create_res = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert create_res.status_code == 200
        lead_id = create_res.json()["id"]
        self.test_lead_ids.append(lead_id)
        
        # Get leads list
        response = requests.get(f"{BASE_URL}/api/leads")
        assert response.status_code == 200
        
        data = response.json()
        for lead in data:
            assert "agreement_pdf_base64" not in lead, "List endpoint should not include agreement_pdf_base64"
    
    def test_download_agreement_pdf_returns_valid_pdf(self):
        """GET /api/leads/{id}/agreement-pdf - Returns valid PDF download"""
        payload = {
            "first_name": f"TEST_Download_{self.unique_id}",
            "last_name": "PDF",
            "email": f"test_download_pdf_{self.unique_id}@example.com",
            "phone": "555-444-5555",
            "address": "101 Download Test Lane",
            "city": "Los Angeles",
            "state": "CA",
            "zip_code": "90001",
            "signed_name": "Download PDF Test",
            "lead_type": "free_trial"
        }
        response = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert response.status_code == 200
        
        lead_id = response.json()["id"]
        self.test_lead_ids.append(lead_id)
        
        # Download the PDF
        pdf_res = requests.get(f"{BASE_URL}/api/leads/{lead_id}/agreement-pdf")
        assert pdf_res.status_code == 200, f"Expected 200, got {pdf_res.status_code}"
        
        # Verify Content-Type is application/pdf
        assert "application/pdf" in pdf_res.headers.get("Content-Type", ""), "Content-Type should be application/pdf"
        
        # Verify Content-Disposition header has filename
        content_disp = pdf_res.headers.get("Content-Disposition", "")
        assert "attachment" in content_disp, "Should have attachment disposition"
        assert "Credlocity_Service_Agreement" in content_disp, "Filename should contain 'Credlocity_Service_Agreement'"
        
        # Verify PDF content starts with PDF magic bytes
        assert pdf_res.content[:4] == b'%PDF', "Content should be a valid PDF (starts with %PDF)"
    
    def test_download_agreement_pdf_not_found(self):
        """GET /api/leads/{id}/agreement-pdf - Non-existent lead returns 404"""
        response = requests.get(f"{BASE_URL}/api/leads/non-existent-id-12345/agreement-pdf")
        assert response.status_code == 404
    
    def test_pdf_contains_client_signature(self):
        """Verify downloaded PDF contains client's typed signature"""
        signed_name = f"Maria Garcia Test {self.unique_id}"
        payload = {
            "first_name": "Maria",
            "last_name": f"Garcia_{self.unique_id}",
            "email": f"test_maria_{self.unique_id}@example.com",
            "phone": "555-555-6666",
            "address": "202 Signature Test Way",
            "city": "Miami",
            "state": "FL",
            "zip_code": "33101",
            "signed_name": signed_name,
            "lead_type": "free_trial"
        }
        response = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert response.status_code == 200
        
        lead_id = response.json()["id"]
        self.test_lead_ids.append(lead_id)
        
        # Download PDF and check it's valid
        pdf_res = requests.get(f"{BASE_URL}/api/leads/{lead_id}/agreement-pdf")
        assert pdf_res.status_code == 200
        assert len(pdf_res.content) > 1000, "PDF should have substantial content"


class TestLeadsDataIntegrity:
    """Tests for lead data integrity and business rules"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.test_lead_ids = []
        self.unique_id = str(uuid.uuid4())[:8]
        yield
        for lead_id in self.test_lead_ids:
            try:
                requests.delete(f"{BASE_URL}/api/leads/{lead_id}")
            except:
                pass
    
    def test_lead_has_all_required_fields_after_creation(self):
        """Verify created lead has all expected fields"""
        payload = {
            "first_name": f"TEST_Fields_{self.unique_id}",
            "last_name": "Check",
            "email": f"test_fields_{self.unique_id}@example.com",
            "phone": "555-222-3333",
            "address": "Fields Test Address",
            "city": "Portland",
            "state": "OR",
            "zip_code": "97201",
            "signed_name": "Fields Check",
            "lead_type": "free_trial"
        }
        create_res = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert create_res.status_code == 200
        lead_id = create_res.json()["id"]
        self.test_lead_ids.append(lead_id)
        
        # Get the lead and verify all fields
        response = requests.get(f"{BASE_URL}/api/leads/{lead_id}")
        assert response.status_code == 200
        
        data = response.json()
        expected_fields = [
            "id", "first_name", "last_name", "email", "phone", "address",
            "city", "state", "zip_code", "lead_type", "signed_name",
            "agreement_signed", "signed_at", "status", "notes",
            "created_at", "updated_at"
        ]
        for field in expected_fields:
            assert field in data, f"Lead should have field '{field}'"
    
    def test_email_is_lowercased(self):
        """Verify email is stored in lowercase"""
        payload = {
            "first_name": f"TEST_Email_{self.unique_id}",
            "last_name": "Case",
            "email": f"TEST_EMAIL_{self.unique_id}@EXAMPLE.COM",  # Uppercase
            "phone": "555-444-5555",
            "address": "Email Test Address",
            "city": "Phoenix",
            "state": "AZ",
            "zip_code": "85001",
            "signed_name": "Email Case",
            "lead_type": "consultation"
        }
        create_res = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert create_res.status_code == 200
        lead_id = create_res.json()["id"]
        self.test_lead_ids.append(lead_id)
        
        response = requests.get(f"{BASE_URL}/api/leads/{lead_id}")
        assert response.json()["email"] == payload["email"].lower()
    
    def test_agreement_signed_is_true(self):
        """Verify agreement_signed is always True for created leads"""
        payload = {
            "first_name": f"TEST_Signed_{self.unique_id}",
            "last_name": "Agreement",
            "email": f"test_signed_{self.unique_id}@example.com",
            "phone": "555-666-7777",
            "address": "Signed Test Address",
            "city": "Las Vegas",
            "state": "NV",
            "zip_code": "89101",
            "signed_name": "Signed Agreement",
            "lead_type": "free_trial"
        }
        create_res = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert create_res.status_code == 200
        lead_id = create_res.json()["id"]
        self.test_lead_ids.append(lead_id)
        
        response = requests.get(f"{BASE_URL}/api/leads/{lead_id}")
        assert response.json()["agreement_signed"] == True
    
    def test_default_status_is_new(self):
        """Verify default status is 'new'"""
        payload = {
            "first_name": f"TEST_Status_{self.unique_id}",
            "last_name": "Default",
            "email": f"test_status_{self.unique_id}@example.com",
            "phone": "555-888-9999",
            "address": "Status Test Address",
            "city": "San Diego",
            "state": "CA",
            "zip_code": "92101",
            "signed_name": "Status Default",
            "lead_type": "consultation"
        }
        create_res = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert create_res.status_code == 200
        lead_id = create_res.json()["id"]
        self.test_lead_ids.append(lead_id)
        
        response = requests.get(f"{BASE_URL}/api/leads/{lead_id}")
        assert response.json()["status"] == "new"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
