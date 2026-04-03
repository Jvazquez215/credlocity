"""
Backend API Tests for PDF Agreement Generation System
Tests: templates CRUD, PDF generation, seeding, history
"""
import pytest
import requests
import os
import time
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAgreementsAPI:
    """Tests for /api/agreements/* endpoints"""

    # Track created template IDs for cleanup
    created_template_ids = []

    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup and teardown for each test"""
        yield
        # Cleanup - delete any templates we created during tests
        for template_id in self.created_template_ids:
            try:
                requests.delete(f"{BASE_URL}/api/agreements/templates/{template_id}")
            except Exception:
                pass
        self.created_template_ids.clear()

    # --- Seeding Tests ---
    def test_seed_templates(self):
        """POST /api/agreements/templates/seed - should seed 2 default templates"""
        response = requests.post(f"{BASE_URL}/api/agreements/templates/seed")
        assert response.status_code == 200, f"Seed failed: {response.text}"
        
        data = response.json()
        assert "seeded" in data, "Response should contain 'seeded' count"
        assert "total" in data, "Response should contain 'total' count"
        assert data["total"] == 2, "Should have 2 default templates"
        print(f"Seeded {data['seeded']} templates, total: {data['total']}")

    # --- List Templates Tests ---
    def test_list_templates(self):
        """GET /api/agreements/templates - should return list of templates"""
        response = requests.get(f"{BASE_URL}/api/agreements/templates")
        assert response.status_code == 200, f"List failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"Found {len(data)} templates")
        
        # After seeding, should have at least 2 templates
        if len(data) >= 2:
            # Verify template structure
            template = data[0]
            assert "id" in template, "Template should have 'id'"
            assert "name" in template, "Template should have 'name'"
            assert "content" in template, "Template should have 'content'"
            assert "fields" in template, "Template should have 'fields'"
            assert "is_active" in template, "Template should have 'is_active'"
            print(f"Template structure valid: {template['name']}")

    # --- Create Template Tests ---
    def test_create_template(self):
        """POST /api/agreements/templates - should create a new template with auto-detected fields"""
        unique_name = f"TEST_Template_{uuid.uuid4().hex[:8]}"
        payload = {
            "name": unique_name,
            "description": "Test description for pytest",
            "category": "General",
            "content": "Agreement for {{client_name}} dated {{agreement_date}}. Amount: ${{amount}}.",
            "fields": [],  # Empty - should auto-detect placeholders
            "is_active": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/agreements/templates",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Create failed: {response.text}"
        
        data = response.json()
        assert data["name"] == unique_name, "Name should match"
        assert "id" in data, "Should return template ID"
        assert len(data["fields"]) == 3, f"Should auto-detect 3 fields from placeholders, got {len(data['fields'])}"
        
        # Track for cleanup
        self.created_template_ids.append(data["id"])
        
        # Verify auto-detected fields
        field_keys = {f["key"] for f in data["fields"]}
        assert "client_name" in field_keys, "Should auto-detect 'client_name' field"
        assert "agreement_date" in field_keys, "Should auto-detect 'agreement_date' field"
        assert "amount" in field_keys, "Should auto-detect 'amount' field"
        print(f"Created template with ID: {data['id']}, auto-detected fields: {field_keys}")

    def test_create_template_with_predefined_fields(self):
        """POST /api/agreements/templates - should merge predefined fields with auto-detected"""
        unique_name = f"TEST_Predefined_{uuid.uuid4().hex[:8]}"
        payload = {
            "name": unique_name,
            "description": "Template with predefined fields",
            "category": "Attorney Partner",
            "content": "Client: {{client_name}}, Date: {{date}}, Notes: {{notes}}",
            "fields": [
                {"key": "client_name", "label": "Full Client Name", "field_type": "text", "required": True, "default_value": "", "options": [], "placeholder": "Enter name"}
            ],
            "is_active": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/agreements/templates",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Create failed: {response.text}"
        
        data = response.json()
        self.created_template_ids.append(data["id"])
        
        # Should have 3 fields: 1 predefined (client_name) + 2 auto-detected (date, notes)
        assert len(data["fields"]) == 3, f"Expected 3 fields, got {len(data['fields'])}"
        
        # Check predefined field kept its custom label
        client_field = next((f for f in data["fields"] if f["key"] == "client_name"), None)
        assert client_field is not None, "client_name field should exist"
        assert client_field["label"] == "Full Client Name", "Predefined field should keep custom label"
        print(f"Template created with merged fields: {[f['key'] for f in data['fields']]}")

    # --- Get Single Template Tests ---
    def test_get_template_by_id(self):
        """GET /api/agreements/templates/{id} - should return single template"""
        # First create a template
        unique_name = f"TEST_GetSingle_{uuid.uuid4().hex[:8]}"
        create_response = requests.post(
            f"{BASE_URL}/api/agreements/templates",
            json={"name": unique_name, "content": "Test content {{field}}", "category": "General"},
            headers={"Content-Type": "application/json"}
        )
        assert create_response.status_code == 200
        template_id = create_response.json()["id"]
        self.created_template_ids.append(template_id)
        
        # Get the template
        response = requests.get(f"{BASE_URL}/api/agreements/templates/{template_id}")
        assert response.status_code == 200, f"Get failed: {response.text}"
        
        data = response.json()
        assert data["id"] == template_id, "ID should match"
        assert data["name"] == unique_name, "Name should match"
        print(f"Got template: {data['name']}")

    def test_get_template_not_found(self):
        """GET /api/agreements/templates/{id} - should return 404 for non-existent template"""
        fake_id = str(uuid.uuid4())
        response = requests.get(f"{BASE_URL}/api/agreements/templates/{fake_id}")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("Correctly returned 404 for non-existent template")

    # --- Update Template Tests ---
    def test_update_template(self):
        """PUT /api/agreements/templates/{id} - should update a template"""
        # Create a template first
        unique_name = f"TEST_Update_{uuid.uuid4().hex[:8]}"
        create_response = requests.post(
            f"{BASE_URL}/api/agreements/templates",
            json={"name": unique_name, "content": "Original content {{field}}", "category": "General"},
            headers={"Content-Type": "application/json"}
        )
        assert create_response.status_code == 200
        template_id = create_response.json()["id"]
        self.created_template_ids.append(template_id)
        
        # Update the template
        update_payload = {
            "name": f"{unique_name}_Updated",
            "description": "Updated description",
            "is_active": False
        }
        response = requests.put(
            f"{BASE_URL}/api/agreements/templates/{template_id}",
            json=update_payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Update failed: {response.text}"
        
        data = response.json()
        assert data["name"] == f"{unique_name}_Updated", "Name should be updated"
        assert data["description"] == "Updated description", "Description should be updated"
        assert data["is_active"] == False, "is_active should be updated to False"
        print(f"Updated template: {data['name']}")

    def test_update_template_content_redetects_fields(self):
        """PUT /api/agreements/templates/{id} - updating content should re-detect fields"""
        # Create a template
        unique_name = f"TEST_RedetectFields_{uuid.uuid4().hex[:8]}"
        create_response = requests.post(
            f"{BASE_URL}/api/agreements/templates",
            json={"name": unique_name, "content": "Hello {{name}}", "category": "General"},
            headers={"Content-Type": "application/json"}
        )
        assert create_response.status_code == 200
        template_id = create_response.json()["id"]
        self.created_template_ids.append(template_id)
        
        original_fields = create_response.json()["fields"]
        assert len(original_fields) == 1, "Should have 1 field initially"
        
        # Update content with new placeholders
        update_payload = {
            "content": "Hello {{name}}, your email is {{email}} and date is {{date}}"
        }
        response = requests.put(
            f"{BASE_URL}/api/agreements/templates/{template_id}",
            json=update_payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Update failed: {response.text}"
        
        data = response.json()
        field_keys = {f["key"] for f in data["fields"]}
        assert "name" in field_keys, "Should still have 'name' field"
        assert "email" in field_keys, "Should auto-detect 'email' field"
        assert "date" in field_keys, "Should auto-detect 'date' field"
        print(f"Fields after content update: {field_keys}")

    # --- Delete Template Tests ---
    def test_delete_template(self):
        """DELETE /api/agreements/templates/{id} - should delete a template"""
        # Create a template first
        unique_name = f"TEST_Delete_{uuid.uuid4().hex[:8]}"
        create_response = requests.post(
            f"{BASE_URL}/api/agreements/templates",
            json={"name": unique_name, "content": "Content to delete {{field}}", "category": "General"},
            headers={"Content-Type": "application/json"}
        )
        assert create_response.status_code == 200
        template_id = create_response.json()["id"]
        
        # Delete the template
        response = requests.delete(f"{BASE_URL}/api/agreements/templates/{template_id}")
        assert response.status_code == 200, f"Delete failed: {response.text}"
        
        data = response.json()
        assert "message" in data, "Should return success message"
        print(f"Deleted template: {template_id}")
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/agreements/templates/{template_id}")
        assert get_response.status_code == 404, "Template should not exist after deletion"
        print("Verified template no longer exists")

    def test_delete_template_not_found(self):
        """DELETE /api/agreements/templates/{id} - should return 404 for non-existent template"""
        fake_id = str(uuid.uuid4())
        response = requests.delete(f"{BASE_URL}/api/agreements/templates/{fake_id}")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("Correctly returned 404 when deleting non-existent template")

    # --- Generate PDF Tests ---
    def test_generate_pdf(self):
        """POST /api/agreements/generate - should generate PDF with field values"""
        # First get templates
        templates_response = requests.get(f"{BASE_URL}/api/agreements/templates")
        templates = templates_response.json()
        
        if len(templates) == 0:
            # Seed templates first
            requests.post(f"{BASE_URL}/api/agreements/templates/seed")
            templates_response = requests.get(f"{BASE_URL}/api/agreements/templates")
            templates = templates_response.json()
        
        # Use the first template
        template = templates[0]
        
        # Build field values from template fields
        field_values = {}
        for field in template.get("fields", []):
            if field["field_type"] == "date":
                field_values[field["key"]] = "2026-01-15"
            elif field["field_type"] == "number":
                field_values[field["key"]] = "99.95"
            elif field["key"] == "client_name":
                field_values[field["key"]] = "TEST_John Doe"
            elif field["key"] == "attorney_name":
                field_values[field["key"]] = "TEST_Jane Smith, Esq."
            else:
                field_values[field["key"]] = f"Test Value for {field['label']}"
        
        payload = {
            "template_id": template["id"],
            "field_values": field_values
        }
        
        response = requests.post(
            f"{BASE_URL}/api/agreements/generate",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"PDF generation failed: {response.text}"
        
        # Verify response is PDF
        assert response.headers.get("content-type") == "application/pdf", "Should return PDF content type"
        assert len(response.content) > 0, "PDF content should not be empty"
        assert "Content-Disposition" in response.headers, "Should have Content-Disposition header"
        print(f"Generated PDF of {len(response.content)} bytes for template: {template['name']}")

    def test_generate_pdf_missing_required_fields(self):
        """POST /api/agreements/generate - should reject missing required fields"""
        # Get templates
        templates_response = requests.get(f"{BASE_URL}/api/agreements/templates")
        templates = templates_response.json()
        
        if len(templates) == 0:
            requests.post(f"{BASE_URL}/api/agreements/templates/seed")
            templates_response = requests.get(f"{BASE_URL}/api/agreements/templates")
            templates = templates_response.json()
        
        template = templates[0]
        
        # Send empty field values - should fail if template has required fields
        payload = {
            "template_id": template["id"],
            "field_values": {}  # Empty - missing required fields
        }
        
        response = requests.post(
            f"{BASE_URL}/api/agreements/generate",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        # If template has required fields, should return 400
        required_fields = [f for f in template.get("fields", []) if f.get("required", True)]
        if len(required_fields) > 0:
            assert response.status_code == 400, f"Expected 400 for missing required fields, got {response.status_code}"
            data = response.json()
            assert "detail" in data, "Should have error detail"
            assert "Missing required fields" in data["detail"], f"Error should mention missing fields: {data['detail']}"
            print(f"Correctly rejected request with missing required fields: {data['detail']}")
        else:
            # No required fields, should succeed
            assert response.status_code == 200
            print("Template has no required fields, generation succeeded")

    def test_generate_pdf_template_not_found(self):
        """POST /api/agreements/generate - should return 404 for non-existent template"""
        payload = {
            "template_id": str(uuid.uuid4()),
            "field_values": {"client_name": "Test"}
        }
        
        response = requests.post(
            f"{BASE_URL}/api/agreements/generate",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("Correctly returned 404 for non-existent template in PDF generation")

    # --- History Tests ---
    def test_get_generation_history(self):
        """GET /api/agreements/history - should return generation log entries"""
        response = requests.get(f"{BASE_URL}/api/agreements/history")
        assert response.status_code == 200, f"History fetch failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "History should be a list"
        print(f"Found {len(data)} history entries")
        
        # If we have history entries, verify structure
        if len(data) > 0:
            entry = data[0]
            assert "id" in entry, "History entry should have 'id'"
            assert "template_id" in entry, "History entry should have 'template_id'"
            assert "template_name" in entry, "History entry should have 'template_name'"
            assert "generated_at" in entry, "History entry should have 'generated_at'"
            print(f"History entry structure valid: {entry['template_name']} at {entry['generated_at']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
