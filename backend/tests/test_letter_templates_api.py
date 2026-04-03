"""
Test suite for Letter Templates API - Free Letters System
Tests all 9 letter templates, listing, individual retrieval, and PDF generation
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# All 9 letter template slugs
LETTER_SLUGS = [
    "credit-bureau-dispute-letter",
    "debt-validation-letter",
    "goodwill-letter",
    "cease-and-desist-letter",
    "identity-theft-dispute-letter",
    "pay-for-delete-letter",
    "inquiry-removal-letter",
    "method-of-verification-letter",
    "statute-of-limitations-letter"
]


class TestLetterTemplatesList:
    """Tests for GET /api/letter-templates/list endpoint"""
    
    def test_list_returns_all_9_templates(self):
        """Verify list endpoint returns exactly 9 templates"""
        response = requests.get(f"{BASE_URL}/api/letter-templates/list")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == 9, f"Expected 9 templates, got {len(data)}"
    
    def test_list_template_structure(self):
        """Verify each template in list has required fields"""
        response = requests.get(f"{BASE_URL}/api/letter-templates/list")
        assert response.status_code == 200
        
        data = response.json()
        required_fields = ['slug', 'title', 'category', 'short_description', 'order', 'send_to']
        
        for template in data:
            for field in required_fields:
                assert field in template, f"Missing field '{field}' in template {template.get('slug', 'unknown')}"
    
    def test_list_contains_all_expected_slugs(self):
        """Verify all 9 expected letter slugs are present"""
        response = requests.get(f"{BASE_URL}/api/letter-templates/list")
        assert response.status_code == 200
        
        data = response.json()
        returned_slugs = [t['slug'] for t in data]
        
        for slug in LETTER_SLUGS:
            assert slug in returned_slugs, f"Missing expected slug: {slug}"


class TestIndividualLetterTemplates:
    """Tests for GET /api/letter-templates/{slug} endpoint"""
    
    def test_credit_bureau_dispute_letter(self):
        """Test credit bureau dispute letter template retrieval"""
        response = requests.get(f"{BASE_URL}/api/letter-templates/credit-bureau-dispute-letter")
        assert response.status_code == 200
        
        data = response.json()
        assert data['title'] == "Credit Bureau Dispute Letter"
        assert data['category'] == "Dispute Letters"
        assert 'description' in data
        assert 'how_to_use' in data
        assert 'results_likelihood' in data
        assert 'aftercare' in data
        assert 'credit_bureaus' in data
        assert 'required_fields' in data
        assert 'letter_body' in data
        assert len(data['credit_bureaus']) == 3  # Equifax, Experian, TransUnion
    
    def test_debt_validation_letter(self):
        """Test debt validation letter template retrieval"""
        response = requests.get(f"{BASE_URL}/api/letter-templates/debt-validation-letter")
        assert response.status_code == 200
        
        data = response.json()
        assert data['title'] == "Debt Validation Letter"
        assert data['category'] == "Debt Validation"
        assert 'FDCPA' in data['description']
    
    def test_goodwill_letter(self):
        """Test goodwill letter template retrieval"""
        response = requests.get(f"{BASE_URL}/api/letter-templates/goodwill-letter")
        assert response.status_code == 200
        
        data = response.json()
        assert data['title'] == "Goodwill Adjustment Letter"
        assert data['category'] == "Goodwill Letters"
    
    def test_cease_and_desist_letter(self):
        """Test cease and desist letter template retrieval"""
        response = requests.get(f"{BASE_URL}/api/letter-templates/cease-and-desist-letter")
        assert response.status_code == 200
        
        data = response.json()
        assert data['title'] == "Cease and Desist Letter to Debt Collectors"
        assert data['category'] == "Cease & Desist"
    
    def test_identity_theft_dispute_letter(self):
        """Test identity theft dispute letter template retrieval"""
        response = requests.get(f"{BASE_URL}/api/letter-templates/identity-theft-dispute-letter")
        assert response.status_code == 200
        
        data = response.json()
        assert data['title'] == "Identity Theft Dispute Letter"
        assert data['category'] == "Identity Theft"
    
    def test_pay_for_delete_letter(self):
        """Test pay for delete letter template retrieval"""
        response = requests.get(f"{BASE_URL}/api/letter-templates/pay-for-delete-letter")
        assert response.status_code == 200
        
        data = response.json()
        assert data['title'] == "Pay for Delete Negotiation Letter"
        assert data['category'] == "Dispute Letters"
    
    def test_inquiry_removal_letter(self):
        """Test inquiry removal letter template retrieval"""
        response = requests.get(f"{BASE_URL}/api/letter-templates/inquiry-removal-letter")
        assert response.status_code == 200
        
        data = response.json()
        assert data['title'] == "Hard Inquiry Removal Letter"
        assert data['category'] == "Credit Bureau"
    
    def test_method_of_verification_letter(self):
        """Test method of verification letter template retrieval"""
        response = requests.get(f"{BASE_URL}/api/letter-templates/method-of-verification-letter")
        assert response.status_code == 200
        
        data = response.json()
        assert data['title'] == "Method of Verification (MOV) Letter"
        assert data['category'] == "Credit Bureau"
    
    def test_statute_of_limitations_letter(self):
        """Test statute of limitations letter template retrieval"""
        response = requests.get(f"{BASE_URL}/api/letter-templates/statute-of-limitations-letter")
        assert response.status_code == 200
        
        data = response.json()
        assert data['title'] == "Statute of Limitations Expiration Letter"
        assert data['category'] == "Debt Validation"
    
    def test_nonexistent_template_returns_404(self):
        """Test that nonexistent template slug returns 404"""
        response = requests.get(f"{BASE_URL}/api/letter-templates/nonexistent-letter")
        assert response.status_code == 404


class TestPDFGeneration:
    """Tests for POST /api/letter-templates/{slug}/generate-pdf endpoint"""
    
    @pytest.fixture
    def valid_form_data(self):
        """Valid form data for PDF generation"""
        return {
            "first_name": "TEST_John",
            "last_name": "TEST_Smith",
            "email": "test@example.com",
            "phone": "(555) 123-4567",
            "address": "123 Test Street",
            "city": "Miami",
            "state": "FL",
            "zip_code": "33101",
            "account_name": "Test Creditor",
            "account_number": "XXXX-1234",
            "bureau": "Equifax"
        }
    
    def test_generate_credit_bureau_dispute_pdf(self, valid_form_data):
        """Test PDF generation for credit bureau dispute letter"""
        response = requests.post(
            f"{BASE_URL}/api/letter-templates/credit-bureau-dispute-letter/generate-pdf",
            json=valid_form_data
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        assert response.headers.get('content-type') == 'application/pdf'
        assert 'attachment' in response.headers.get('content-disposition', '')
        assert len(response.content) > 1000  # PDF should have substantial content
    
    def test_generate_debt_validation_pdf(self, valid_form_data):
        """Test PDF generation for debt validation letter"""
        response = requests.post(
            f"{BASE_URL}/api/letter-templates/debt-validation-letter/generate-pdf",
            json=valid_form_data
        )
        assert response.status_code == 200
        assert response.headers.get('content-type') == 'application/pdf'
    
    def test_generate_goodwill_pdf(self, valid_form_data):
        """Test PDF generation for goodwill letter"""
        response = requests.post(
            f"{BASE_URL}/api/letter-templates/goodwill-letter/generate-pdf",
            json=valid_form_data
        )
        assert response.status_code == 200
        assert response.headers.get('content-type') == 'application/pdf'
    
    def test_generate_cease_and_desist_pdf(self, valid_form_data):
        """Test PDF generation for cease and desist letter"""
        response = requests.post(
            f"{BASE_URL}/api/letter-templates/cease-and-desist-letter/generate-pdf",
            json=valid_form_data
        )
        assert response.status_code == 200
        assert response.headers.get('content-type') == 'application/pdf'
    
    def test_generate_identity_theft_pdf(self, valid_form_data):
        """Test PDF generation for identity theft letter"""
        response = requests.post(
            f"{BASE_URL}/api/letter-templates/identity-theft-dispute-letter/generate-pdf",
            json=valid_form_data
        )
        assert response.status_code == 200
        assert response.headers.get('content-type') == 'application/pdf'
    
    def test_generate_pay_for_delete_pdf(self, valid_form_data):
        """Test PDF generation for pay for delete letter"""
        response = requests.post(
            f"{BASE_URL}/api/letter-templates/pay-for-delete-letter/generate-pdf",
            json=valid_form_data
        )
        assert response.status_code == 200
        assert response.headers.get('content-type') == 'application/pdf'
    
    def test_generate_inquiry_removal_pdf(self, valid_form_data):
        """Test PDF generation for inquiry removal letter"""
        response = requests.post(
            f"{BASE_URL}/api/letter-templates/inquiry-removal-letter/generate-pdf",
            json=valid_form_data
        )
        assert response.status_code == 200
        assert response.headers.get('content-type') == 'application/pdf'
    
    def test_generate_mov_pdf(self, valid_form_data):
        """Test PDF generation for method of verification letter"""
        response = requests.post(
            f"{BASE_URL}/api/letter-templates/method-of-verification-letter/generate-pdf",
            json=valid_form_data
        )
        assert response.status_code == 200
        assert response.headers.get('content-type') == 'application/pdf'
    
    def test_generate_sol_pdf(self, valid_form_data):
        """Test PDF generation for statute of limitations letter"""
        response = requests.post(
            f"{BASE_URL}/api/letter-templates/statute-of-limitations-letter/generate-pdf",
            json=valid_form_data
        )
        assert response.status_code == 200
        assert response.headers.get('content-type') == 'application/pdf'
    
    def test_pdf_generation_missing_required_fields(self):
        """Test that missing required fields returns 400 error"""
        incomplete_data = {
            "first_name": "John",
            # Missing other required fields
        }
        response = requests.post(
            f"{BASE_URL}/api/letter-templates/credit-bureau-dispute-letter/generate-pdf",
            json=incomplete_data
        )
        assert response.status_code == 400
        assert 'Missing required fields' in response.json().get('detail', '')
    
    def test_pdf_generation_nonexistent_template(self, valid_form_data):
        """Test PDF generation for nonexistent template returns 404"""
        response = requests.post(
            f"{BASE_URL}/api/letter-templates/nonexistent-letter/generate-pdf",
            json=valid_form_data
        )
        assert response.status_code == 404


class TestTemplateContent:
    """Tests for template content quality and completeness"""
    
    def test_all_templates_have_required_content_fields(self):
        """Verify all templates have complete content for SEO pages"""
        required_content_fields = [
            'description', 'how_to_use', 'results_likelihood', 
            'aftercare', 'letter_body', 'required_fields'
        ]
        
        for slug in LETTER_SLUGS:
            response = requests.get(f"{BASE_URL}/api/letter-templates/{slug}")
            assert response.status_code == 200, f"Failed to get template {slug}"
            
            data = response.json()
            for field in required_content_fields:
                assert field in data, f"Template {slug} missing field: {field}"
                assert data[field], f"Template {slug} has empty field: {field}"
    
    def test_credit_bureaus_included_in_all_templates(self):
        """Verify credit bureau info is included in all template responses"""
        for slug in LETTER_SLUGS:
            response = requests.get(f"{BASE_URL}/api/letter-templates/{slug}")
            assert response.status_code == 200
            
            data = response.json()
            assert 'credit_bureaus' in data, f"Template {slug} missing credit_bureaus"
            assert len(data['credit_bureaus']) == 3, f"Template {slug} should have 3 bureaus"
            
            # Verify bureau structure
            for bureau in data['credit_bureaus']:
                assert 'name' in bureau
                assert 'address' in bureau
                assert 'phone' in bureau
                assert 'website' in bureau
