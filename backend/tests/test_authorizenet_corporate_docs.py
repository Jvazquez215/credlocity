"""
Test suite for Authorize.net Live Integration and Corporate Documents features.
Tests:
1. Authorize.net health check, batches, and summary endpoints
2. Corporate Documents CRUD operations (upload, list, download, delete)
3. Revenue Dashboard API integration
"""

import pytest
import requests
import os
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://rep-dashboard-11.preview.emergentagent.com')

class TestAuthorizeNetIntegration:
    """Test live Authorize.net payment gateway integration"""
    
    @pytest.fixture(scope='class')
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "Admin@credlocity.com", "password": "Credit123!"}
        )
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return response.json()["access_token"]
    
    def test_authorizenet_health_check(self):
        """Test Authorize.net health endpoint returns configured status"""
        response = requests.get(f"{BASE_URL}/api/authorizenet/health")
        assert response.status_code == 200
        data = response.json()
        assert data["configured"] == True
        assert data["api_login_id_set"] == True
        assert data["transaction_key_set"] == True
        assert data["environment"] == "production"
        print(f"[PASS] Authorize.net health: configured={data['configured']}, env={data['environment']}")
    
    def test_authorizenet_batches_returns_live_data(self, admin_token):
        """Test Authorize.net batches endpoint returns real settlement data"""
        response = requests.get(
            f"{BASE_URL}/api/authorizenet/batches?days=30",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "batches" in data
        assert len(data["batches"]) > 0, "Expected non-empty batches array with real data"
        
        # Verify batch structure
        first_batch = data["batches"][0]
        assert "batch_id" in first_batch
        assert "settlement_state" in first_batch
        assert "settlement_time" in first_batch
        
        print(f"[PASS] Authorize.net batches: {len(data['batches'])} batches returned")
        print(f"  Sample batch: ID={first_batch['batch_id']}, state={first_batch['settlement_state']}")
    
    def test_authorizenet_batches_requires_auth(self):
        """Test that batches endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/authorizenet/batches?days=30")
        assert response.status_code == 403
        print("[PASS] Authorize.net batches endpoint correctly requires authentication")
    
    def test_authorizenet_summary_endpoint(self, admin_token):
        """Test Authorize.net summary endpoint returns KPIs"""
        response = requests.get(
            f"{BASE_URL}/api/revenue/authorizenet/summary?period=month",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify KPI fields
        expected_fields = ["gross_revenue", "total_chargebacks", "total_refunds", "net_revenue", 
                         "payment_count", "chargeback_rate", "refund_rate", "avg_transaction"]
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"
        
        print(f"[PASS] Authorize.net summary: gross={data['gross_revenue']}, net={data['net_revenue']}")


class TestCorporateDocuments:
    """Test Corporate Documents API for Partners Hub"""
    
    @pytest.fixture(scope='class')
    def partner_token(self):
        """Get partner auth token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "Shar@credlocity.com", "password": "Credit123!"}
        )
        assert response.status_code == 200, f"Partner login failed: {response.text}"
        return response.json()["access_token"]
    
    @pytest.fixture(scope='class')
    def test_doc_id(self, partner_token):
        """Upload a test document and return its ID for other tests"""
        # Create test file
        test_content = b"Test corporate document content for pytest"
        files = {'file': ('pytest_test_doc.txt', io.BytesIO(test_content), 'text/plain')}
        data = {'category': 'contracts', 'description': 'Pytest test document'}
        
        response = requests.post(
            f"{BASE_URL}/api/corporate-docs/upload",
            headers={"Authorization": f"Bearer {partner_token}"},
            files=files,
            data=data
        )
        assert response.status_code == 200, f"Upload failed: {response.text}"
        doc_id = response.json()["id"]
        print(f"[SETUP] Uploaded test doc with ID: {doc_id}")
        yield doc_id
        
        # Cleanup: delete the test document
        requests.delete(
            f"{BASE_URL}/api/corporate-docs/{doc_id}",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        print(f"[CLEANUP] Deleted test doc: {doc_id}")
    
    def test_get_categories_returns_8_categories(self):
        """Test categories endpoint returns exactly 8 document categories"""
        response = requests.get(f"{BASE_URL}/api/corporate-docs/categories")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 8, f"Expected 8 categories, got {len(data)}"
        
        expected_values = ["partnership_agreement", "corporate_docs", "ein_docs", 
                         "amendments", "contracts", "legal", "financial", "other"]
        actual_values = [c["value"] for c in data]
        for val in expected_values:
            assert val in actual_values, f"Missing category: {val}"
        
        print(f"[PASS] Corporate docs categories: {len(data)} categories returned")
    
    def test_upload_document(self, partner_token):
        """Test uploading a corporate document"""
        test_content = b"Partnership agreement test content"
        files = {'file': ('test_partnership.txt', io.BytesIO(test_content), 'text/plain')}
        data = {'category': 'partnership_agreement', 'description': 'Test upload'}
        
        response = requests.post(
            f"{BASE_URL}/api/corporate-docs/upload",
            headers={"Authorization": f"Bearer {partner_token}"},
            files=files,
            data=data
        )
        assert response.status_code == 200
        doc = response.json()
        assert "id" in doc
        assert doc["original_filename"] == "test_partnership.txt"
        assert doc["category"] == "partnership_agreement"
        assert doc["is_deleted"] == False
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/corporate-docs/{doc['id']}",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        print(f"[PASS] Document upload: created ID {doc['id']}")
    
    def test_upload_requires_partner_auth(self):
        """Test upload requires partner authentication"""
        test_content = b"Unauthorized upload attempt"
        files = {'file': ('unauthorized.txt', io.BytesIO(test_content), 'text/plain')}
        data = {'category': 'other', 'description': 'Should fail'}
        
        response = requests.post(
            f"{BASE_URL}/api/corporate-docs/upload",
            files=files,
            data=data
        )
        assert response.status_code == 403 or response.status_code == 422  # No auth header
        print("[PASS] Upload correctly requires partner authentication")
    
    def test_list_documents(self, partner_token, test_doc_id):
        """Test listing corporate documents"""
        response = requests.get(
            f"{BASE_URL}/api/corporate-docs/list",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "documents" in data
        assert "total" in data
        
        # Verify test doc is in the list
        doc_ids = [d["id"] for d in data["documents"]]
        assert test_doc_id in doc_ids, "Test document not found in list"
        print(f"[PASS] List documents: {data['total']} documents returned")
    
    def test_list_with_category_filter(self, partner_token, test_doc_id):
        """Test listing documents filtered by category"""
        response = requests.get(
            f"{BASE_URL}/api/corporate-docs/list?category=contracts",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # All returned docs should be contracts category
        for doc in data["documents"]:
            assert doc["category"] == "contracts"
        print(f"[PASS] Category filter: {len(data['documents'])} contracts found")
    
    def test_download_document(self, partner_token, test_doc_id):
        """Test downloading a corporate document"""
        response = requests.get(
            f"{BASE_URL}/api/corporate-docs/download/{test_doc_id}",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert response.status_code == 200
        assert len(response.content) > 0
        assert "pytest_test_doc" in response.headers.get("Content-Disposition", "")
        print(f"[PASS] Document download: {len(response.content)} bytes")
    
    def test_download_nonexistent_doc(self, partner_token):
        """Test downloading a non-existent document returns 404"""
        response = requests.get(
            f"{BASE_URL}/api/corporate-docs/download/nonexistent-doc-id",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert response.status_code == 404
        print("[PASS] Non-existent document correctly returns 404")
    
    def test_delete_document(self, partner_token):
        """Test soft-deleting a corporate document"""
        # First upload a doc to delete
        test_content = b"Document to delete"
        files = {'file': ('delete_me.txt', io.BytesIO(test_content), 'text/plain')}
        data = {'category': 'other', 'description': 'Will be deleted'}
        
        upload_response = requests.post(
            f"{BASE_URL}/api/corporate-docs/upload",
            headers={"Authorization": f"Bearer {partner_token}"},
            files=files,
            data=data
        )
        doc_id = upload_response.json()["id"]
        
        # Delete the doc
        delete_response = requests.delete(
            f"{BASE_URL}/api/corporate-docs/{doc_id}",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert delete_response.status_code == 200
        assert delete_response.json()["message"] == "Document deleted"
        
        # Verify it's no longer in list
        list_response = requests.get(
            f"{BASE_URL}/api/corporate-docs/list",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        doc_ids = [d["id"] for d in list_response.json()["documents"]]
        assert doc_id not in doc_ids, "Deleted doc should not appear in list"
        print(f"[PASS] Document delete: soft-deleted {doc_id}")


class TestRevenueDashboard:
    """Test Revenue Dashboard API endpoints"""
    
    @pytest.fixture(scope='class')
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "Admin@credlocity.com", "password": "Credit123!"}
        )
        assert response.status_code == 200
        return response.json()["access_token"]
    
    def test_revenue_summary_endpoint(self, admin_token):
        """Test revenue dashboard summary returns all required fields"""
        response = requests.get(
            f"{BASE_URL}/api/revenue/dashboard/summary?period=month",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["period", "total_revenue", "total_transactions", 
                          "pending_revenue", "by_source"]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        # Verify by_source contains authorizenet
        assert "authorizenet" in data["by_source"]
        print(f"[PASS] Revenue summary: total={data['total_revenue']}, pending={data['pending_revenue']}")
    
    def test_revenue_trends_endpoint(self, admin_token):
        """Test revenue trends returns monthly data"""
        response = requests.get(
            f"{BASE_URL}/api/revenue/dashboard/trends?months=12",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "trends" in data
        print(f"[PASS] Revenue trends: {len(data['trends'])} months of data")
    
    def test_partners_hub_revenue_overview(self, admin_token):
        """Test Partners Hub revenue overview endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/revenue/partners-hub/revenue-overview",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        required_sections = ["this_month", "ytd", "all_time", "authorizenet", "pending"]
        for section in required_sections:
            assert section in data, f"Missing section: {section}"
        
        print(f"[PASS] Partners Hub revenue: this_month={data['this_month']['total']}, ytd={data['ytd']['total']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
