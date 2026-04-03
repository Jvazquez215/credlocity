"""
Test Complaint Letters API - Iteration 93
Tests for the Scam Checker Complaint Letter Generator feature:
- GET /api/complaint-letters/agencies - returns all 3 agencies
- POST /api/complaint-letters/generate - generates PDF complaint letters for CFPB, FTC, State AG
- Error handling for missing fields, empty violations, invalid agency
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestComplaintLettersAgencies:
    """Test GET /api/complaint-letters/agencies endpoint"""
    
    def test_get_agencies_returns_200(self):
        """GET /api/complaint-letters/agencies returns 200"""
        response = requests.get(f"{BASE_URL}/api/complaint-letters/agencies")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: GET /api/complaint-letters/agencies returns 200")
    
    def test_get_agencies_returns_all_three(self):
        """GET /api/complaint-letters/agencies returns cfpb, ftc, attorney_general"""
        response = requests.get(f"{BASE_URL}/api/complaint-letters/agencies")
        data = response.json()
        
        assert "cfpb" in data, "Missing 'cfpb' agency"
        assert "ftc" in data, "Missing 'ftc' agency"
        assert "attorney_general" in data, "Missing 'attorney_general' agency"
        assert len(data) == 3, f"Expected 3 agencies, got {len(data)}"
        print("PASS: All 3 agencies returned (cfpb, ftc, attorney_general)")
    
    def test_cfpb_agency_metadata(self):
        """CFPB agency has correct metadata"""
        response = requests.get(f"{BASE_URL}/api/complaint-letters/agencies")
        data = response.json()
        cfpb = data.get("cfpb", {})
        
        assert "name" in cfpb, "CFPB missing 'name'"
        assert "address" in cfpb, "CFPB missing 'address'"
        assert "online_url" in cfpb, "CFPB missing 'online_url'"
        assert "phone" in cfpb, "CFPB missing 'phone'"
        assert "description" in cfpb, "CFPB missing 'description'"
        assert "Consumer Financial Protection Bureau" in cfpb["name"], "CFPB name incorrect"
        assert "consumerfinance.gov" in cfpb["online_url"], "CFPB online_url incorrect"
        print("PASS: CFPB agency has correct metadata")
    
    def test_ftc_agency_metadata(self):
        """FTC agency has correct metadata"""
        response = requests.get(f"{BASE_URL}/api/complaint-letters/agencies")
        data = response.json()
        ftc = data.get("ftc", {})
        
        assert "name" in ftc, "FTC missing 'name'"
        assert "address" in ftc, "FTC missing 'address'"
        assert "online_url" in ftc, "FTC missing 'online_url'"
        assert "phone" in ftc, "FTC missing 'phone'"
        assert "description" in ftc, "FTC missing 'description'"
        assert "Federal Trade Commission" in ftc["name"], "FTC name incorrect"
        assert "reportfraud.ftc.gov" in ftc["online_url"], "FTC online_url incorrect"
        print("PASS: FTC agency has correct metadata")
    
    def test_attorney_general_agency_metadata(self):
        """State Attorney General agency has correct metadata"""
        response = requests.get(f"{BASE_URL}/api/complaint-letters/agencies")
        data = response.json()
        ag = data.get("attorney_general", {})
        
        assert "name" in ag, "Attorney General missing 'name'"
        assert "address" in ag, "Attorney General missing 'address'"
        assert "online_url" in ag, "Attorney General missing 'online_url'"
        assert "phone" in ag, "Attorney General missing 'phone'"
        assert "description" in ag, "Attorney General missing 'description'"
        assert "State Attorney General" in ag["name"], "Attorney General name incorrect"
        assert "naag.org" in ag["online_url"], "Attorney General online_url incorrect"
        print("PASS: State Attorney General agency has correct metadata")


class TestComplaintLetterGeneration:
    """Test POST /api/complaint-letters/generate endpoint"""
    
    @pytest.fixture
    def valid_payload(self):
        """Valid payload for complaint letter generation"""
        return {
            "agency": "cfpb",
            "first_name": "TEST_John",
            "last_name": "TEST_Doe",
            "email": "test@example.com",
            "phone": "555-123-4567",
            "address": "123 Test Street",
            "city": "Test City",
            "state": "CA",
            "zip_code": "90210",
            "company_name": "Scam Credit Repair Co",
            "company_website": "https://scamcompany.com",
            "amount_paid": "500",
            "description_of_events": "They charged me upfront fees before doing any work.",
            "violations": [
                {
                    "title": "Advance Fee / Upfront Charge Detected",
                    "law": "TSR §310.4(a)(2) & CROA §1679b(b)",
                    "matched_text": "initial setup fee of $199.95",
                    "description": "Under the TSR and CROA, credit repair companies CANNOT charge fees before services are fully performed.",
                    "category": "Illegal Fee"
                }
            ]
        }
    
    def test_generate_cfpb_letter_returns_pdf(self, valid_payload):
        """POST /api/complaint-letters/generate with agency=cfpb generates valid PDF"""
        valid_payload["agency"] = "cfpb"
        response = requests.post(
            f"{BASE_URL}/api/complaint-letters/generate",
            json=valid_payload
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        assert response.headers.get("Content-Type") == "application/pdf", f"Expected application/pdf, got {response.headers.get('Content-Type')}"
        assert len(response.content) > 0, "PDF content is empty"
        assert response.content[:4] == b'%PDF', "Response is not a valid PDF (missing PDF header)"
        print(f"PASS: CFPB complaint letter generated - {len(response.content)} bytes")
    
    def test_generate_ftc_letter_returns_pdf(self, valid_payload):
        """POST /api/complaint-letters/generate with agency=ftc generates valid PDF"""
        valid_payload["agency"] = "ftc"
        response = requests.post(
            f"{BASE_URL}/api/complaint-letters/generate",
            json=valid_payload
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        assert response.headers.get("Content-Type") == "application/pdf", f"Expected application/pdf, got {response.headers.get('Content-Type')}"
        assert len(response.content) > 0, "PDF content is empty"
        assert response.content[:4] == b'%PDF', "Response is not a valid PDF (missing PDF header)"
        print(f"PASS: FTC complaint letter generated - {len(response.content)} bytes")
    
    def test_generate_attorney_general_letter_returns_pdf(self, valid_payload):
        """POST /api/complaint-letters/generate with agency=attorney_general generates valid PDF"""
        valid_payload["agency"] = "attorney_general"
        response = requests.post(
            f"{BASE_URL}/api/complaint-letters/generate",
            json=valid_payload
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        assert response.headers.get("Content-Type") == "application/pdf", f"Expected application/pdf, got {response.headers.get('Content-Type')}"
        assert len(response.content) > 0, "PDF content is empty"
        assert response.content[:4] == b'%PDF', "Response is not a valid PDF (missing PDF header)"
        print(f"PASS: Attorney General complaint letter generated - {len(response.content)} bytes")
    
    def test_pdf_has_content_disposition_header(self, valid_payload):
        """Generated PDF has Content-Disposition header with filename"""
        response = requests.post(
            f"{BASE_URL}/api/complaint-letters/generate",
            json=valid_payload
        )
        
        assert response.status_code == 200
        content_disposition = response.headers.get("Content-Disposition", "")
        assert "attachment" in content_disposition, "Missing attachment in Content-Disposition"
        assert "filename=" in content_disposition, "Missing filename in Content-Disposition"
        assert ".pdf" in content_disposition, "Filename should end with .pdf"
        print(f"PASS: Content-Disposition header correct: {content_disposition}")


class TestComplaintLetterValidation:
    """Test error handling for POST /api/complaint-letters/generate"""
    
    def test_missing_required_fields_returns_400(self):
        """POST with missing required fields returns 400"""
        payload = {
            "agency": "cfpb",
            "first_name": "John",
            # Missing: last_name, address, city, state, zip_code, email
            "violations": [{"title": "Test", "law": "Test", "matched_text": "test", "description": "test"}]
        }
        response = requests.post(
            f"{BASE_URL}/api/complaint-letters/generate",
            json=payload
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "detail" in data, "Missing error detail"
        assert "Missing required fields" in data["detail"], f"Unexpected error message: {data['detail']}"
        print(f"PASS: Missing required fields returns 400 - {data['detail']}")
    
    def test_empty_violations_returns_400(self):
        """POST with empty violations array returns 400"""
        payload = {
            "agency": "cfpb",
            "first_name": "John",
            "last_name": "Doe",
            "email": "test@example.com",
            "address": "123 Test St",
            "city": "Test City",
            "state": "CA",
            "zip_code": "90210",
            "company_name": "Test Company",
            "violations": []  # Empty violations
        }
        response = requests.post(
            f"{BASE_URL}/api/complaint-letters/generate",
            json=payload
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "detail" in data, "Missing error detail"
        assert "violation" in data["detail"].lower(), f"Unexpected error message: {data['detail']}"
        print(f"PASS: Empty violations returns 400 - {data['detail']}")
    
    def test_invalid_agency_returns_400(self):
        """POST with invalid agency returns 400"""
        payload = {
            "agency": "invalid_agency",
            "first_name": "John",
            "last_name": "Doe",
            "email": "test@example.com",
            "address": "123 Test St",
            "city": "Test City",
            "state": "CA",
            "zip_code": "90210",
            "company_name": "Test Company",
            "violations": [{"title": "Test", "law": "Test", "matched_text": "test", "description": "test"}]
        }
        response = requests.post(
            f"{BASE_URL}/api/complaint-letters/generate",
            json=payload
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "detail" in data, "Missing error detail"
        assert "Invalid agency" in data["detail"], f"Unexpected error message: {data['detail']}"
        print(f"PASS: Invalid agency returns 400 - {data['detail']}")
    
    def test_missing_company_name_still_works(self):
        """POST without company_name uses default 'the credit repair company'"""
        payload = {
            "agency": "cfpb",
            "first_name": "John",
            "last_name": "Doe",
            "email": "test@example.com",
            "address": "123 Test St",
            "city": "Test City",
            "state": "CA",
            "zip_code": "90210",
            # No company_name - should use default
            "violations": [{"title": "Test", "law": "Test", "matched_text": "test", "description": "test"}]
        }
        response = requests.post(
            f"{BASE_URL}/api/complaint-letters/generate",
            json=payload
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        assert response.headers.get("Content-Type") == "application/pdf"
        print("PASS: Missing company_name uses default and generates PDF")


class TestComplaintLetterMultipleViolations:
    """Test PDF generation with multiple violations"""
    
    def test_multiple_violations_in_letter(self):
        """POST with multiple violations generates PDF with all violations"""
        payload = {
            "agency": "cfpb",
            "first_name": "TEST_Multi",
            "last_name": "TEST_Violations",
            "email": "test@example.com",
            "address": "123 Test St",
            "city": "Test City",
            "state": "TX",
            "zip_code": "75001",
            "company_name": "Multi Scam Co",
            "violations": [
                {
                    "title": "Advance Fee / Upfront Charge Detected",
                    "law": "TSR §310.4(a)(2) & CROA §1679b(b)",
                    "matched_text": "initial setup fee of $199.95",
                    "description": "Illegal upfront fee",
                    "category": "Illegal Fee"
                },
                {
                    "title": "Guaranteed Results Promise Detected",
                    "law": "CROA §1679b(a)(3)",
                    "matched_text": "100% guaranteed removal",
                    "description": "No company can guarantee results",
                    "category": "Deceptive Practice"
                },
                {
                    "title": "CPN Fraud Scheme Detected",
                    "law": "18 U.S.C. §1028 (Identity Fraud)",
                    "matched_text": "new credit identity with a CPN",
                    "description": "Federal crime",
                    "category": "Federal Crime"
                }
            ]
        }
        response = requests.post(
            f"{BASE_URL}/api/complaint-letters/generate",
            json=payload
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert response.headers.get("Content-Type") == "application/pdf"
        assert len(response.content) > 1000, "PDF with 3 violations should have content"
        assert response.content[:4] == b'%PDF', "Response is not a valid PDF"
        print(f"PASS: Multiple violations PDF generated - {len(response.content)} bytes")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
