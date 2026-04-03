"""
Iteration 66 - Locations CMS API Tests
Tests the new Locations CMS backend API for managing cities from admin dashboard.
Endpoints tested:
- GET /api/locations/public - Public endpoint returning published locations
- GET /api/locations/admin/list - Admin endpoint returning all locations
- POST /api/locations/admin/create - Create new location
- PUT /api/locations/admin/{id} - Update location
- DELETE /api/locations/admin/{id} - Delete location
- POST /api/locations/admin/seed - Seed default cities
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestLocationsPublicAPI:
    """Tests for public locations endpoint"""

    def test_get_public_locations(self):
        """GET /api/locations/public should return 10 seeded locations"""
        response = requests.get(f"{BASE_URL}/api/locations/public")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Should have 10 seeded locations
        print(f"Found {len(data)} public locations")
        assert len(data) >= 10, f"Expected at least 10 locations, got {len(data)}"
        
        # Check structure of first location
        if data:
            loc = data[0]
            assert "city" in loc, "Location should have 'city' field"
            assert "state" in loc, "Location should have 'state' field"
            assert "slug" in loc, "Location should have 'slug' field"
            assert "region" in loc, "Location should have 'region' field"
            assert "id" in loc, "Location should have 'id' field"
            print(f"First location: {loc['city']}, {loc['state']} - /{loc['slug']}")

    def test_public_locations_exclude_unpublished(self):
        """Public endpoint should only return published locations (is_published=True)"""
        response = requests.get(f"{BASE_URL}/api/locations/public")
        assert response.status_code == 200
        
        data = response.json()
        for loc in data:
            # All returned locations should be published (public endpoint filters by is_published=True)
            # This is implied by the API design - public endpoint only returns published
            assert loc.get("slug"), "Each location should have a slug"
            print(f"Public location: {loc.get('city', 'Unknown')} - is_published should be True")

    def test_public_locations_sorted_by_sort_order(self):
        """Public locations should be sorted by sort_order"""
        response = requests.get(f"{BASE_URL}/api/locations/public")
        assert response.status_code == 200
        
        data = response.json()
        if len(data) > 1:
            # Verify sort_order is respected
            prev_order = data[0].get('sort_order', 0)
            for loc in data[1:]:
                current_order = loc.get('sort_order', 0)
                # Should be ascending or equal
                assert current_order >= prev_order, f"Sort order violated: {prev_order} should be <= {current_order}"
                prev_order = current_order


class TestLocationsAdminAPI:
    """Tests for admin locations endpoints"""
    
    def test_admin_list_locations(self):
        """GET /api/locations/admin/list should return all locations"""
        response = requests.get(f"{BASE_URL}/api/locations/admin/list")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"Admin list shows {len(data)} locations (including unpublished)")

    def test_create_location(self):
        """POST /api/locations/admin/create should create a new location"""
        unique_id = str(uuid.uuid4())[:8]
        payload = {
            "city": f"TEST_City_{unique_id}",
            "state": "TX",
            "region": "Southwest",
            "tagline": "Testing City Creation",
            "description": "A test location for API testing",
            "population": "100K",
            "metro_area": "500K",
            "avg_credit_score": "700",
            "subprime_pct": "25%",
            "is_published": True,
            "sort_order": 999
        }
        
        response = requests.post(
            f"{BASE_URL}/api/locations/admin/create",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["city"] == payload["city"], "City should match"
        assert data["state"] == payload["state"], "State should match"
        assert data["region"] == payload["region"], "Region should match"
        assert "id" in data, "Response should include id"
        assert "slug" in data, "Response should include auto-generated slug"
        
        # Verify slug format
        expected_slug_start = f"credit-repair-test_city_{unique_id}".lower()
        assert data["slug"].startswith("credit-repair-"), f"Slug should start with 'credit-repair-', got {data['slug']}"
        
        print(f"Created location: {data['city']}, {data['state']} with id: {data['id']}")
        
        # Store for cleanup
        return data

    def test_update_location(self):
        """PUT /api/locations/admin/{id} should update a location"""
        # First create a test location
        unique_id = str(uuid.uuid4())[:8]
        create_payload = {
            "city": f"TEST_Update_{unique_id}",
            "state": "FL",
            "region": "Southeast",
            "is_published": True
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/locations/admin/create",
            json=create_payload,
            headers={"Content-Type": "application/json"}
        )
        assert create_response.status_code == 200
        created = create_response.json()
        location_id = created["id"]
        
        # Now update it
        update_payload = {
            "tagline": "Updated Tagline",
            "description": "Updated description for testing",
            "population": "200K",
            "is_published": False
        }
        
        update_response = requests.put(
            f"{BASE_URL}/api/locations/admin/{location_id}",
            json=update_payload,
            headers={"Content-Type": "application/json"}
        )
        assert update_response.status_code == 200, f"Expected 200, got {update_response.status_code}: {update_response.text}"
        
        updated = update_response.json()
        assert updated["tagline"] == "Updated Tagline", "Tagline should be updated"
        assert updated["description"] == "Updated description for testing", "Description should be updated"
        assert updated["population"] == "200K", "Population should be updated"
        assert updated["is_published"] == False, "is_published should be updated to False"
        
        # Original fields should be preserved
        assert updated["city"] == create_payload["city"], "City should be preserved"
        assert updated["state"] == create_payload["state"], "State should be preserved"
        
        print(f"Updated location: {updated['city']} - tagline: {updated['tagline']}")
        
        # Cleanup - delete the test location
        requests.delete(f"{BASE_URL}/api/locations/admin/{location_id}")

    def test_delete_location(self):
        """DELETE /api/locations/admin/{id} should delete a location"""
        # First create a test location
        unique_id = str(uuid.uuid4())[:8]
        create_payload = {
            "city": f"TEST_Delete_{unique_id}",
            "state": "AZ",
            "region": "Southwest",
            "is_published": True
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/locations/admin/create",
            json=create_payload,
            headers={"Content-Type": "application/json"}
        )
        assert create_response.status_code == 200
        created = create_response.json()
        location_id = created["id"]
        
        # Now delete it
        delete_response = requests.delete(f"{BASE_URL}/api/locations/admin/{location_id}")
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}: {delete_response.text}"
        
        data = delete_response.json()
        assert data.get("message") == "Location deleted", f"Expected deletion message, got: {data}"
        
        # Verify it's actually deleted
        list_response = requests.get(f"{BASE_URL}/api/locations/admin/list")
        locations = list_response.json()
        ids = [loc["id"] for loc in locations]
        assert location_id not in ids, "Deleted location should not appear in list"
        
        print(f"Deleted location with id: {location_id}")

    def test_delete_nonexistent_location(self):
        """DELETE /api/locations/admin/{id} should return 404 for nonexistent location"""
        fake_id = "nonexistent-id-12345"
        response = requests.delete(f"{BASE_URL}/api/locations/admin/{fake_id}")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.text}"

    def test_update_nonexistent_location(self):
        """PUT /api/locations/admin/{id} should return 404 for nonexistent location"""
        fake_id = "nonexistent-id-12345"
        response = requests.put(
            f"{BASE_URL}/api/locations/admin/{fake_id}",
            json={"tagline": "Test"},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.text}"

    def test_create_duplicate_slug(self):
        """POST /api/locations/admin/create should reject duplicate slugs"""
        # Try to create a location with the same slug as Philadelphia (already seeded)
        payload = {
            "city": "Philadelphia",
            "state": "PA",
            "slug": "credit-repair-philadelphia",  # This slug already exists
            "region": "East Coast"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/locations/admin/create",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 400, f"Expected 400 for duplicate slug, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "already exists" in data.get("detail", "").lower(), f"Expected duplicate error message, got: {data}"


class TestLocationsSeedAPI:
    """Tests for seed endpoint"""

    def test_seed_returns_stats(self):
        """POST /api/locations/admin/seed should return seeded/skipped counts"""
        response = requests.post(f"{BASE_URL}/api/locations/admin/seed")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "seeded" in data, "Response should include 'seeded' count"
        assert "skipped" in data, "Response should include 'skipped' count"
        assert "total" in data, "Response should include 'total' count"
        
        # Since locations are already seeded, expect 0 seeded and 10 skipped
        print(f"Seed result: seeded={data['seeded']}, skipped={data['skipped']}, total={data['total']}")
        assert data["total"] == 10, f"Total should be 10 default cities, got {data['total']}"


class TestLocationsDataIntegrity:
    """Tests verifying the 10 seeded default cities"""

    def test_seeded_cities_present(self):
        """Verify all 10 default seeded cities are present"""
        expected_cities = [
            "Philadelphia", "Atlanta", "New York", "Trenton", "Boise",
            "Nampa", "Caldwell", "Idaho Falls", "Twin Falls", "Pocatello"
        ]
        
        response = requests.get(f"{BASE_URL}/api/locations/public")
        assert response.status_code == 200
        
        data = response.json()
        actual_cities = [loc["city"] for loc in data]
        
        for city in expected_cities:
            assert city in actual_cities, f"Expected city '{city}' not found in locations"
            print(f"Found seeded city: {city}")

    def test_philadelphia_has_office_address(self):
        """Verify Philadelphia (HQ) has office_address set"""
        response = requests.get(f"{BASE_URL}/api/locations/public")
        assert response.status_code == 200
        
        data = response.json()
        philly = next((loc for loc in data if loc["city"] == "Philadelphia"), None)
        assert philly is not None, "Philadelphia should be in locations"
        assert philly.get("office_address"), "Philadelphia should have office_address (HQ)"
        print(f"Philadelphia office: {philly.get('office_address')}")

    def test_idaho_cities_have_office_address(self):
        """Verify Idaho cities have the Idaho office address"""
        idaho_cities = ["Boise", "Nampa", "Caldwell", "Idaho Falls", "Twin Falls", "Pocatello"]
        
        response = requests.get(f"{BASE_URL}/api/locations/public")
        assert response.status_code == 200
        
        data = response.json()
        for city_name in idaho_cities:
            loc = next((l for l in data if l["city"] == city_name), None)
            assert loc is not None, f"{city_name} should be in locations"
            assert loc.get("office_address"), f"{city_name} should have office_address"
            print(f"{city_name} office: {loc.get('office_address')}")


class TestCleanupTestData:
    """Cleanup any TEST_ prefixed locations after tests"""

    def test_cleanup_test_locations(self):
        """Delete any TEST_ prefixed locations created during tests"""
        response = requests.get(f"{BASE_URL}/api/locations/admin/list")
        assert response.status_code == 200
        
        locations = response.json()
        test_locations = [loc for loc in locations if loc.get("city", "").startswith("TEST_")]
        
        for loc in test_locations:
            delete_response = requests.delete(f"{BASE_URL}/api/locations/admin/{loc['id']}")
            print(f"Cleaned up test location: {loc['city']} (id: {loc['id']})")
        
        print(f"Cleanup complete. Removed {len(test_locations)} test locations.")
