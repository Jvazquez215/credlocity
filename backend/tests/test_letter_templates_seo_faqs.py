"""
Test suite for Letter Templates SEO Enhancement - FAQs and JSON-LD Schemas
Tests all 9 letter templates have 5 FAQs each, and main listing page has 10 FAQs
Iteration 92 - SEO settings enhancement
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


class TestLetterTemplatesFAQs:
    """Tests for FAQs in each letter template - 5 FAQs per template"""
    
    def test_credit_bureau_dispute_letter_has_5_faqs(self):
        """Test credit bureau dispute letter has exactly 5 FAQs"""
        response = requests.get(f"{BASE_URL}/api/letter-templates/credit-bureau-dispute-letter")
        assert response.status_code == 200
        
        data = response.json()
        assert 'faqs' in data, "Template should have 'faqs' field"
        assert isinstance(data['faqs'], list), "FAQs should be a list"
        assert len(data['faqs']) == 5, f"Expected 5 FAQs, got {len(data['faqs'])}"
        
        # Verify FAQ structure
        for faq in data['faqs']:
            assert 'q' in faq, "FAQ should have 'q' (question) field"
            assert 'a' in faq, "FAQ should have 'a' (answer) field"
            assert len(faq['q']) > 10, "Question should be substantial"
            assert len(faq['a']) > 50, "Answer should be substantial"
    
    def test_debt_validation_letter_has_5_faqs(self):
        """Test debt validation letter has exactly 5 FAQs"""
        response = requests.get(f"{BASE_URL}/api/letter-templates/debt-validation-letter")
        assert response.status_code == 200
        
        data = response.json()
        assert 'faqs' in data, "Template should have 'faqs' field"
        assert len(data['faqs']) == 5, f"Expected 5 FAQs, got {len(data['faqs'])}"
        
        # Verify content is relevant to debt validation
        faq_text = ' '.join([f['q'] + f['a'] for f in data['faqs']]).lower()
        assert 'debt' in faq_text or 'validation' in faq_text or 'fdcpa' in faq_text
    
    def test_goodwill_letter_has_5_faqs(self):
        """Test goodwill letter has exactly 5 FAQs"""
        response = requests.get(f"{BASE_URL}/api/letter-templates/goodwill-letter")
        assert response.status_code == 200
        
        data = response.json()
        assert 'faqs' in data
        assert len(data['faqs']) == 5, f"Expected 5 FAQs, got {len(data['faqs'])}"
    
    def test_cease_and_desist_letter_has_5_faqs(self):
        """Test cease and desist letter has exactly 5 FAQs"""
        response = requests.get(f"{BASE_URL}/api/letter-templates/cease-and-desist-letter")
        assert response.status_code == 200
        
        data = response.json()
        assert 'faqs' in data
        assert len(data['faqs']) == 5, f"Expected 5 FAQs, got {len(data['faqs'])}"
    
    def test_identity_theft_dispute_letter_has_5_faqs(self):
        """Test identity theft dispute letter has exactly 5 FAQs"""
        response = requests.get(f"{BASE_URL}/api/letter-templates/identity-theft-dispute-letter")
        assert response.status_code == 200
        
        data = response.json()
        assert 'faqs' in data
        assert len(data['faqs']) == 5, f"Expected 5 FAQs, got {len(data['faqs'])}"
    
    def test_pay_for_delete_letter_has_5_faqs(self):
        """Test pay for delete letter has exactly 5 FAQs"""
        response = requests.get(f"{BASE_URL}/api/letter-templates/pay-for-delete-letter")
        assert response.status_code == 200
        
        data = response.json()
        assert 'faqs' in data
        assert len(data['faqs']) == 5, f"Expected 5 FAQs, got {len(data['faqs'])}"
    
    def test_inquiry_removal_letter_has_5_faqs(self):
        """Test inquiry removal letter has exactly 5 FAQs"""
        response = requests.get(f"{BASE_URL}/api/letter-templates/inquiry-removal-letter")
        assert response.status_code == 200
        
        data = response.json()
        assert 'faqs' in data
        assert len(data['faqs']) == 5, f"Expected 5 FAQs, got {len(data['faqs'])}"
    
    def test_method_of_verification_letter_has_5_faqs(self):
        """Test method of verification letter has exactly 5 FAQs"""
        response = requests.get(f"{BASE_URL}/api/letter-templates/method-of-verification-letter")
        assert response.status_code == 200
        
        data = response.json()
        assert 'faqs' in data
        assert len(data['faqs']) == 5, f"Expected 5 FAQs, got {len(data['faqs'])}"
    
    def test_statute_of_limitations_letter_has_5_faqs(self):
        """Test statute of limitations letter has exactly 5 FAQs"""
        response = requests.get(f"{BASE_URL}/api/letter-templates/statute-of-limitations-letter")
        assert response.status_code == 200
        
        data = response.json()
        assert 'faqs' in data
        assert len(data['faqs']) == 5, f"Expected 5 FAQs, got {len(data['faqs'])}"


class TestAllTemplatesFAQsComprehensive:
    """Comprehensive tests for all templates FAQs"""
    
    def test_all_9_templates_have_faqs_array(self):
        """Verify all 9 templates have faqs array"""
        for slug in LETTER_SLUGS:
            response = requests.get(f"{BASE_URL}/api/letter-templates/{slug}")
            assert response.status_code == 200, f"Failed to get template {slug}"
            
            data = response.json()
            assert 'faqs' in data, f"Template {slug} missing 'faqs' field"
            assert isinstance(data['faqs'], list), f"Template {slug} faqs should be a list"
    
    def test_all_templates_have_exactly_5_faqs(self):
        """Verify all 9 templates have exactly 5 FAQs each"""
        for slug in LETTER_SLUGS:
            response = requests.get(f"{BASE_URL}/api/letter-templates/{slug}")
            assert response.status_code == 200
            
            data = response.json()
            assert len(data['faqs']) == 5, f"Template {slug} should have 5 FAQs, got {len(data['faqs'])}"
    
    def test_all_faqs_have_valid_structure(self):
        """Verify all FAQs have q and a fields with content"""
        for slug in LETTER_SLUGS:
            response = requests.get(f"{BASE_URL}/api/letter-templates/{slug}")
            assert response.status_code == 200
            
            data = response.json()
            for i, faq in enumerate(data['faqs']):
                assert 'q' in faq, f"Template {slug} FAQ {i} missing 'q' field"
                assert 'a' in faq, f"Template {slug} FAQ {i} missing 'a' field"
                assert len(faq['q']) > 10, f"Template {slug} FAQ {i} question too short"
                assert len(faq['a']) > 50, f"Template {slug} FAQ {i} answer too short"
    
    def test_faqs_are_unique_per_template(self):
        """Verify FAQs are unique within each template"""
        for slug in LETTER_SLUGS:
            response = requests.get(f"{BASE_URL}/api/letter-templates/{slug}")
            assert response.status_code == 200
            
            data = response.json()
            questions = [faq['q'] for faq in data['faqs']]
            assert len(questions) == len(set(questions)), f"Template {slug} has duplicate FAQ questions"


class TestListEndpointWithSlugs:
    """Tests for list endpoint returning correct slugs"""
    
    def test_list_returns_all_9_templates_with_correct_slugs(self):
        """Verify list endpoint returns all 9 templates with correct slugs"""
        response = requests.get(f"{BASE_URL}/api/letter-templates/list")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 9, f"Expected 9 templates, got {len(data)}"
        
        returned_slugs = [t['slug'] for t in data]
        for slug in LETTER_SLUGS:
            assert slug in returned_slugs, f"Missing slug: {slug}"
    
    def test_list_templates_have_slug_field(self):
        """Verify all templates in list have slug field"""
        response = requests.get(f"{BASE_URL}/api/letter-templates/list")
        assert response.status_code == 200
        
        data = response.json()
        for template in data:
            assert 'slug' in template, f"Template missing slug field: {template.get('title', 'unknown')}"
            assert template['slug'], f"Template has empty slug: {template.get('title', 'unknown')}"


class TestPDFGenerationWithFAQs:
    """Tests for PDF generation still works after FAQ additions"""
    
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
    
    def test_pdf_generation_still_works_credit_bureau(self, valid_form_data):
        """Test PDF generation still works for credit bureau dispute letter"""
        response = requests.post(
            f"{BASE_URL}/api/letter-templates/credit-bureau-dispute-letter/generate-pdf",
            json=valid_form_data
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert response.headers.get('content-type') == 'application/pdf'
    
    def test_pdf_generation_still_works_debt_validation(self, valid_form_data):
        """Test PDF generation still works for debt validation letter"""
        response = requests.post(
            f"{BASE_URL}/api/letter-templates/debt-validation-letter/generate-pdf",
            json=valid_form_data
        )
        assert response.status_code == 200
        assert response.headers.get('content-type') == 'application/pdf'
