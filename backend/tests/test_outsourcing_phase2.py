"""
Test suite for Outsourcing Portal Phase 2 Enhancements
- Historical data management
- Signed agreement uploads
- Credit report uploads
- Deletion tracking
- Partner read-only endpoints
"""
import pytest
import requests
import os
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"
PARTNER_EMAIL = "admin@credlocity.com"
PARTNER_PASSWORD = "Credit123!"

# Test IDs from context
TEST_PARTNER_ID = "176200b3-5e59-4ecd-be5e-d58fa531afd5"
TEST_CUSTOMER_IDS = [
    "f85ac217-938e-4120-ab6f-2e9fbe7e7543",  # John Smith
    "3eefa218-6827-4076-9206-83a8652c2c34",  # Maria Garcia
    "b5c25e0d-db82-44d7-a050-7c74e1b615c0",  # Robert Johnson
]


@pytest.fixture(scope="module")
def admin_token():
    """Get admin JWT token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        return data.get("access_token") or data.get("token")
    pytest.skip(f"Admin login failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def partner_token():
    """Get partner portal token"""
    response = requests.post(f"{BASE_URL}/api/outsourcing/partner/login", json={
        "email": PARTNER_EMAIL,
        "password": PARTNER_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        return data.get("token") or data.get("access_token")
    pytest.skip(f"Partner login failed: {response.status_code} - {response.text}")


@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def partner_headers(partner_token):
    return {"Authorization": f"Bearer {partner_token}"}


class TestAdminHistoricalData:
    """Test admin historical data endpoints"""

    def test_get_historical_data(self, admin_headers):
        """GET /api/outsourcing/admin/partners/{id}/historical-data"""
        response = requests.get(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_ID}/historical-data",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "historical_start_date" in data
        assert "signed_agreement_date" in data
        assert "monthly_charge" in data
        print(f"Historical data: {data}")

    def test_update_historical_data(self, admin_headers):
        """PUT /api/outsourcing/admin/partners/{id}/historical-data"""
        payload = {
            "historical_start_date": "2024-01-15",
            "signed_agreement_date": "2024-01-10",
            "monthly_charge": 1500.00
        }
        response = requests.put(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_ID}/historical-data",
            headers=admin_headers,
            json=payload
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("historical_start_date") == "2024-01-15"
        assert data.get("signed_agreement_date") == "2024-01-10"
        assert data.get("monthly_charge") == 1500.00
        print(f"Updated historical data: {data}")

    def test_update_historical_data_partial(self, admin_headers):
        """PUT with partial data should work"""
        payload = {"monthly_charge": 2000.00}
        response = requests.put(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_ID}/historical-data",
            headers=admin_headers,
            json=payload
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("monthly_charge") == 2000.00
        print(f"Partial update successful: monthly_charge = {data.get('monthly_charge')}")

    def test_update_historical_data_empty_fails(self, admin_headers):
        """PUT with empty data should fail"""
        response = requests.put(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_ID}/historical-data",
            headers=admin_headers,
            json={}
        )
        assert response.status_code == 400
        print("Empty update correctly rejected")


class TestAdminSignedAgreements:
    """Test admin signed agreement upload endpoints"""

    def test_list_signed_agreements(self, admin_headers):
        """GET /api/outsourcing/admin/partners/{id}/signed-agreements/list"""
        response = requests.get(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_ID}/signed-agreements/list",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} signed agreements")

    def test_upload_signed_agreement(self, admin_headers):
        """POST /api/outsourcing/admin/partners/{id}/signed-agreements/upload"""
        # Create a simple PDF-like file for testing
        pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF"
        files = {"file": ("test_agreement.pdf", io.BytesIO(pdf_content), "application/pdf")}
        data = {"description": "TEST_Agreement_Phase2"}
        
        response = requests.post(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_ID}/signed-agreements/upload",
            headers=admin_headers,
            files=files,
            data=data
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        result = response.json()
        assert "id" in result
        assert result.get("file_name") == "test_agreement.pdf"
        assert result.get("description") == "TEST_Agreement_Phase2"
        print(f"Uploaded agreement: {result.get('id')}")
        return result.get("id")

    def test_view_signed_agreement_pdf(self, admin_headers):
        """GET /api/outsourcing/signed-agreements/{id}/pdf"""
        # First get list to find an agreement
        list_response = requests.get(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_ID}/signed-agreements/list",
            headers=admin_headers
        )
        agreements = list_response.json()
        if not agreements:
            pytest.skip("No agreements to view")
        
        agreement_id = agreements[0]["id"]
        response = requests.get(
            f"{BASE_URL}/api/outsourcing/signed-agreements/{agreement_id}/pdf",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "application/pdf" in response.headers.get("content-type", "")
        print(f"PDF retrieved successfully, size: {len(response.content)} bytes")


class TestAdminCustomerManagement:
    """Test admin customer management endpoints"""

    def test_list_partner_customers(self, admin_headers):
        """GET /api/outsourcing/admin/partners/{id}/all-customers"""
        response = requests.get(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_ID}/all-customers",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} customers for partner")
        if data:
            customer = data[0]
            assert "id" in customer
            assert "first_name" in customer or "last_name" in customer
            print(f"Sample customer: {customer.get('first_name')} {customer.get('last_name')}")


class TestAdminCreditReports:
    """Test admin credit report endpoints"""

    def test_list_credit_reports(self, admin_headers):
        """GET /api/outsourcing/admin/customers/{id}/credit-reports"""
        customer_id = TEST_CUSTOMER_IDS[0]  # John Smith
        response = requests.get(
            f"{BASE_URL}/api/outsourcing/admin/customers/{customer_id}/credit-reports",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} credit reports for customer")

    def test_upload_credit_report(self, admin_headers):
        """POST /api/outsourcing/admin/customers/{id}/credit-reports/upload"""
        customer_id = TEST_CUSTOMER_IDS[0]
        pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF"
        files = {"file": ("TEST_credit_report.pdf", io.BytesIO(pdf_content), "application/pdf")}
        data = {"round_number": "1", "notes": "TEST_Round 1 credit report"}
        
        response = requests.post(
            f"{BASE_URL}/api/outsourcing/admin/customers/{customer_id}/credit-reports/upload",
            headers=admin_headers,
            files=files,
            data=data
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        result = response.json()
        assert "id" in result
        assert result.get("round_number") == 1
        print(f"Uploaded credit report: {result.get('id')}")
        return result.get("id")

    def test_view_credit_report_pdf(self, admin_headers):
        """GET /api/outsourcing/credit-reports/{id}/pdf"""
        customer_id = TEST_CUSTOMER_IDS[0]
        list_response = requests.get(
            f"{BASE_URL}/api/outsourcing/admin/customers/{customer_id}/credit-reports",
            headers=admin_headers
        )
        reports = list_response.json()
        if not reports:
            pytest.skip("No credit reports to view")
        
        report_id = reports[0]["id"]
        response = requests.get(
            f"{BASE_URL}/api/outsourcing/credit-reports/{report_id}/pdf",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "application/pdf" in response.headers.get("content-type", "")
        print(f"Credit report PDF retrieved, size: {len(response.content)} bytes")


class TestAdminDeletionTracking:
    """Test admin deletion tracking endpoints"""

    def test_list_deletions(self, admin_headers):
        """GET /api/outsourcing/admin/customers/{id}/deletions"""
        customer_id = TEST_CUSTOMER_IDS[0]  # John Smith - has existing deletion data
        response = requests.get(
            f"{BASE_URL}/api/outsourcing/admin/customers/{customer_id}/deletions",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} deletion records")

    def test_add_deletion_record(self, admin_headers):
        """POST /api/outsourcing/admin/customers/{id}/deletions"""
        customer_id = TEST_CUSTOMER_IDS[0]
        payload = {
            "category": "collections",
            "count": 5,
            "bureau": "equifax",
            "round_number": 1,
            "notes": "TEST_Deletion record"
        }
        response = requests.post(
            f"{BASE_URL}/api/outsourcing/admin/customers/{customer_id}/deletions",
            headers=admin_headers,
            json=payload
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("category") == "collections"
        assert data.get("count") == 5
        assert data.get("bureau") == "equifax"
        print(f"Created deletion record: {data.get('id')}")
        return data.get("id")

    def test_add_deletion_invalid_category(self, admin_headers):
        """POST with invalid category should fail"""
        customer_id = TEST_CUSTOMER_IDS[0]
        payload = {
            "category": "invalid_category",
            "count": 1
        }
        response = requests.post(
            f"{BASE_URL}/api/outsourcing/admin/customers/{customer_id}/deletions",
            headers=admin_headers,
            json=payload
        )
        assert response.status_code == 400
        print("Invalid category correctly rejected")

    def test_update_deletion_record(self, admin_headers):
        """PUT /api/outsourcing/admin/deletions/{id}"""
        customer_id = TEST_CUSTOMER_IDS[0]
        # First create a record
        create_payload = {
            "category": "inquiries",
            "count": 2,
            "notes": "TEST_To be updated"
        }
        create_response = requests.post(
            f"{BASE_URL}/api/outsourcing/admin/customers/{customer_id}/deletions",
            headers=admin_headers,
            json=create_payload
        )
        assert create_response.status_code == 200
        deletion_id = create_response.json().get("id")
        
        # Update it
        update_payload = {"count": 10, "notes": "TEST_Updated notes"}
        response = requests.put(
            f"{BASE_URL}/api/outsourcing/admin/deletions/{deletion_id}",
            headers=admin_headers,
            json=update_payload
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("count") == 10
        assert data.get("notes") == "TEST_Updated notes"
        print(f"Updated deletion record: {deletion_id}")

    def test_delete_deletion_record(self, admin_headers):
        """DELETE /api/outsourcing/admin/deletions/{id}"""
        customer_id = TEST_CUSTOMER_IDS[0]
        # First create a record
        create_payload = {
            "category": "late_payments",
            "count": 1,
            "notes": "TEST_To be deleted"
        }
        create_response = requests.post(
            f"{BASE_URL}/api/outsourcing/admin/customers/{customer_id}/deletions",
            headers=admin_headers,
            json=create_payload
        )
        assert create_response.status_code == 200
        deletion_id = create_response.json().get("id")
        
        # Delete it
        response = requests.delete(
            f"{BASE_URL}/api/outsourcing/admin/deletions/{deletion_id}",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print(f"Deleted deletion record: {deletion_id}")


class TestPartnerReadOnlyEndpoints:
    """Test partner portal read-only endpoints"""

    def test_partner_get_historical_data(self, partner_headers):
        """GET /api/outsourcing/my/historical-data"""
        response = requests.get(
            f"{BASE_URL}/api/outsourcing/my/historical-data",
            headers=partner_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "historical_start_date" in data
        assert "signed_agreement_date" in data
        assert "monthly_charge" in data
        print(f"Partner historical data: {data}")

    def test_partner_get_signed_agreements(self, partner_headers):
        """GET /api/outsourcing/my/signed-agreements"""
        response = requests.get(
            f"{BASE_URL}/api/outsourcing/my/signed-agreements",
            headers=partner_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"Partner has {len(data)} signed agreements")

    def test_partner_list_credit_reports(self, partner_headers):
        """GET /api/outsourcing/customers/{id}/credit-reports (partner auth)"""
        # First get partner's customers
        customers_response = requests.get(
            f"{BASE_URL}/api/outsourcing/customers",
            headers=partner_headers
        )
        if customers_response.status_code != 200:
            pytest.skip("Could not get partner customers")
        
        customers = customers_response.json()
        if not customers:
            pytest.skip("Partner has no customers")
        
        customer_id = customers[0]["id"]
        response = requests.get(
            f"{BASE_URL}/api/outsourcing/customers/{customer_id}/credit-reports",
            headers=partner_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"Partner customer has {len(data)} credit reports")

    def test_partner_list_deletions(self, partner_headers):
        """GET /api/outsourcing/customers/{id}/deletions (partner auth)"""
        customers_response = requests.get(
            f"{BASE_URL}/api/outsourcing/customers",
            headers=partner_headers
        )
        if customers_response.status_code != 200:
            pytest.skip("Could not get partner customers")
        
        customers = customers_response.json()
        if not customers:
            pytest.skip("Partner has no customers")
        
        customer_id = customers[0]["id"]
        response = requests.get(
            f"{BASE_URL}/api/outsourcing/customers/{customer_id}/deletions",
            headers=partner_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"Partner customer has {len(data)} deletion records")

    def test_partner_success_summary(self, partner_headers):
        """GET /api/outsourcing/customers/{id}/success-summary"""
        customers_response = requests.get(
            f"{BASE_URL}/api/outsourcing/customers",
            headers=partner_headers
        )
        if customers_response.status_code != 200:
            pytest.skip("Could not get partner customers")
        
        customers = customers_response.json()
        if not customers:
            pytest.skip("Partner has no customers")
        
        customer_id = customers[0]["id"]
        response = requests.get(
            f"{BASE_URL}/api/outsourcing/customers/{customer_id}/success-summary",
            headers=partner_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "customer_id" in data
        assert "total_deletions" in data
        assert "by_category" in data
        print(f"Success summary: total_deletions={data.get('total_deletions')}")


class TestCleanup:
    """Cleanup test data"""

    def test_cleanup_test_agreements(self, admin_headers):
        """Delete TEST_ prefixed agreements"""
        response = requests.get(
            f"{BASE_URL}/api/outsourcing/admin/partners/{TEST_PARTNER_ID}/signed-agreements/list",
            headers=admin_headers
        )
        if response.status_code == 200:
            agreements = response.json()
            for a in agreements:
                if "TEST_" in (a.get("description") or ""):
                    requests.delete(
                        f"{BASE_URL}/api/outsourcing/admin/signed-agreements/{a['id']}",
                        headers=admin_headers
                    )
                    print(f"Cleaned up agreement: {a['id']}")

    def test_cleanup_test_credit_reports(self, admin_headers):
        """Delete TEST_ prefixed credit reports"""
        for customer_id in TEST_CUSTOMER_IDS:
            response = requests.get(
                f"{BASE_URL}/api/outsourcing/admin/customers/{customer_id}/credit-reports",
                headers=admin_headers
            )
            if response.status_code == 200:
                reports = response.json()
                for r in reports:
                    if "TEST_" in (r.get("file_name") or "") or "TEST_" in (r.get("notes") or ""):
                        requests.delete(
                            f"{BASE_URL}/api/outsourcing/admin/credit-reports/{r['id']}",
                            headers=admin_headers
                        )
                        print(f"Cleaned up credit report: {r['id']}")

    def test_cleanup_test_deletions(self, admin_headers):
        """Delete TEST_ prefixed deletion records"""
        for customer_id in TEST_CUSTOMER_IDS:
            response = requests.get(
                f"{BASE_URL}/api/outsourcing/admin/customers/{customer_id}/deletions",
                headers=admin_headers
            )
            if response.status_code == 200:
                records = response.json()
                for r in records:
                    if "TEST_" in (r.get("notes") or ""):
                        requests.delete(
                            f"{BASE_URL}/api/outsourcing/admin/deletions/{r['id']}",
                            headers=admin_headers
                        )
                        print(f"Cleaned up deletion record: {r['id']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
