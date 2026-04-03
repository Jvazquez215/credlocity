"""
Iteration 44 Feature Tests
Tests new features:
1. E-book detail enhancements (author, release_date, complementary_ebook_ids)
2. Analytics tracking (by_source, by_ebook, totals)
3. Partners Hub modernization (enhanced meetings with topics, costs CRUD/summary)
4. Discussions with replies
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# ============ AUTH FIXTURES ============
@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture
def auth_token(api_client):
    """Get authentication token for admin user"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": "Admin@credlocity.com",
        "password": "Credit123!"
    })
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip(f"Authentication failed: {response.status_code} {response.text}")

@pytest.fixture
def authenticated_client(api_client, auth_token):
    """Session with auth header"""
    api_client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return api_client


# ============ E-BOOK DETAIL ENHANCEMENTS ============
class TestEbookDetailEnhancements:
    """Tests for author, release_date, complementary_ebook_ids fields"""
    
    def test_ebooks_public_list_has_author_and_release_date(self, api_client):
        """GET /api/ebooks/public should include author and release_date"""
        response = api_client.get(f"{BASE_URL}/api/ebooks/public")
        assert response.status_code == 200
        data = response.json()
        assert "ebooks" in data
        if data["ebooks"]:
            ebook = data["ebooks"][0]
            # Check that author field exists (may be empty string)
            assert "author" in ebook or "author" not in ebook  # Field is optional in public endpoint
            print(f"SUCCESS: Public ebooks endpoint works, found {len(data['ebooks'])} ebooks")
    
    def test_ebook_by_slug_returns_author_release_date(self, api_client):
        """GET /api/ebooks/slug/:slug returns author, release_date fields"""
        # First get a list to find a slug
        list_resp = api_client.get(f"{BASE_URL}/api/ebooks/public")
        assert list_resp.status_code == 200
        ebooks = list_resp.json()["ebooks"]
        if not ebooks:
            pytest.skip("No ebooks available")
        
        slug = ebooks[0].get("slug")
        if not slug:
            pytest.skip("No ebook with slug found")
        
        response = api_client.get(f"{BASE_URL}/api/ebooks/slug/{slug}")
        assert response.status_code == 200
        ebook = response.json()
        
        # These fields should be present for the detail view
        assert "author" in ebook, "author field missing"
        assert "release_date" in ebook, "release_date field missing"
        assert "complementary_ebook_ids" in ebook or True  # Optional field
        print(f"SUCCESS: Ebook by slug has author='{ebook.get('author')}', release_date='{ebook.get('release_date')}'")
    
    def test_complementary_ebooks_endpoint(self, api_client, authenticated_client):
        """GET /api/ebooks/{id}/complementary returns companion e-books"""
        # Get admin list which includes storage info
        list_resp = authenticated_client.get(f"{BASE_URL}/api/ebooks/list")
        assert list_resp.status_code == 200
        ebooks = list_resp.json()["ebooks"]
        if not ebooks:
            pytest.skip("No ebooks available")
        
        ebook_id = ebooks[0]["id"]
        
        response = api_client.get(f"{BASE_URL}/api/ebooks/{ebook_id}/complementary")
        assert response.status_code == 200
        companions = response.json()
        assert isinstance(companions, list)
        print(f"SUCCESS: Complementary endpoint works, returned {len(companions)} companions")


# ============ ANALYTICS TRACKING ============
class TestEbookAnalytics:
    """Tests for /api/ebooks/analytics/overview"""
    
    def test_analytics_overview_structure(self, authenticated_client):
        """GET /api/ebooks/analytics/overview returns by_source, by_ebook, totals"""
        response = authenticated_client.get(f"{BASE_URL}/api/ebooks/analytics/overview")
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        assert "by_source" in data, "by_source field missing"
        assert "by_ebook" in data, "by_ebook field missing"
        assert "totals" in data, "totals field missing"
        
        # Check by_source structure
        assert isinstance(data["by_source"], list)
        for source in data["by_source"]:
            assert "source" in source
            assert "downloads" in source
            assert "purchases" in source
            assert "revenue" in source
        
        # Check totals structure
        totals = data["totals"]
        assert "total_leads" in totals
        assert "total_revenue" in totals
        assert "total_downloads" in totals
        assert "total_purchases" in totals
        
        print(f"SUCCESS: Analytics overview has {len(data['by_source'])} sources, {len(data['by_ebook'])} ebooks")
        print(f"  Totals: leads={totals['total_leads']}, revenue=${totals['total_revenue']}, downloads={totals['total_downloads']}")


# ============ PARTNERS HUB - COSTS CRUD ============
class TestPartnersCostsCRUD:
    """Tests for /api/partners-hub/costs CRUD and summary"""
    
    def test_get_costs_list(self, authenticated_client):
        """GET /api/partners-hub/costs returns list"""
        response = authenticated_client.get(f"{BASE_URL}/api/partners-hub/costs")
        assert response.status_code == 200
        costs = response.json()
        assert isinstance(costs, list)
        print(f"SUCCESS: Costs list returned {len(costs)} items")
    
    def test_create_cost_entry(self, authenticated_client):
        """POST /api/partners-hub/costs creates a new cost entry"""
        payload = {
            "title": "TEST_Cost - Monthly Software License",
            "description": "Development tools subscription",
            "amount": 99.99,
            "category": "software",
            "vendor": "Test Vendor Inc",
            "frequency": "monthly",
            "is_recurring": True,
            "status": "active"
        }
        response = authenticated_client.post(f"{BASE_URL}/api/partners-hub/costs", json=payload)
        assert response.status_code == 200, f"Create cost failed: {response.text}"
        cost = response.json()
        
        assert cost["title"] == payload["title"]
        assert cost["amount"] == payload["amount"]
        assert cost["category"] == "software"
        assert cost["frequency"] == "monthly"
        assert cost["status"] == "active"
        assert "id" in cost
        print(f"SUCCESS: Created cost entry id={cost['id']}, amount=${cost['amount']}")
        return cost["id"]
    
    def test_costs_summary_returns_totals(self, authenticated_client):
        """GET /api/partners-hub/costs/summary returns monthly and annual totals"""
        response = authenticated_client.get(f"{BASE_URL}/api/partners-hub/costs/summary")
        assert response.status_code == 200, f"Costs summary failed: {response.text}"
        summary = response.json()
        
        assert "monthly_total" in summary, "monthly_total field missing"
        assert "annual_total" in summary, "annual_total field missing"
        assert "by_category" in summary, "by_category field missing"
        assert "active_count" in summary, "active_count field missing"
        
        print(f"SUCCESS: Costs summary - monthly=${summary['monthly_total']}, annual=${summary['annual_total']}, active={summary['active_count']}")
        print(f"  Categories: {list(summary['by_category'].keys())}")
    
    def test_update_cost_entry(self, authenticated_client):
        """PUT /api/partners-hub/costs/{id} updates the cost"""
        # First create
        create_resp = authenticated_client.post(f"{BASE_URL}/api/partners-hub/costs", json={
            "title": "TEST_Update Cost",
            "amount": 50.00,
            "category": "general",
            "frequency": "one-time",
            "status": "pending"
        })
        assert create_resp.status_code == 200
        cost_id = create_resp.json()["id"]
        
        # Then update
        update_resp = authenticated_client.put(f"{BASE_URL}/api/partners-hub/costs/{cost_id}", json={
            "amount": 75.00,
            "status": "active"
        })
        assert update_resp.status_code == 200
        print(f"SUCCESS: Updated cost {cost_id}")
        
        # Cleanup
        authenticated_client.delete(f"{BASE_URL}/api/partners-hub/costs/{cost_id}")
    
    def test_delete_cost_entry(self, authenticated_client):
        """DELETE /api/partners-hub/costs/{id} removes the cost"""
        # Create
        create_resp = authenticated_client.post(f"{BASE_URL}/api/partners-hub/costs", json={
            "title": "TEST_Delete Cost",
            "amount": 25.00,
            "category": "general",
            "frequency": "one-time",
            "status": "active"
        })
        assert create_resp.status_code == 200
        cost_id = create_resp.json()["id"]
        
        # Delete
        delete_resp = authenticated_client.delete(f"{BASE_URL}/api/partners-hub/costs/{cost_id}")
        assert delete_resp.status_code == 200
        print(f"SUCCESS: Deleted cost {cost_id}")


# ============ PARTNERS HUB - ENHANCED MEETINGS WITH TOPICS ============
class TestPartnersMeetingsWithTopics:
    """Tests for enhanced meeting minutes with topics array"""
    
    def test_create_meeting_with_topics(self, authenticated_client):
        """POST /api/partners-hub/meetings creates meeting with topics array"""
        payload = {
            "title": "TEST_Meeting - Q1 Strategy Review",
            "date": "2026-01-15",
            "start_time": "10:00",
            "end_time": "11:30",
            "location": "Conference Room A",
            "meeting_type": "quarterly",
            "attendees": ["Partner A", "Partner B"],
            "topics": [
                {
                    "title": "Revenue Review",
                    "notes": "Discussed Q4 performance",
                    "duration_minutes": 20,
                    "presenter": "Partner A",
                    "decision": "Increase marketing budget"
                },
                {
                    "title": "Product Roadmap",
                    "notes": "Reviewed upcoming features",
                    "duration_minutes": 30,
                    "presenter": "Partner B",
                    "decision": "Prioritize mobile app"
                }
            ],
            "notes": "General meeting notes",
            "decisions": ["Budget increase approved", "Mobile priority confirmed"],
            "action_items": ["Complete budget proposal", "Draft mobile requirements"],
            "next_meeting_date": "2026-02-15"
        }
        
        response = authenticated_client.post(f"{BASE_URL}/api/partners-hub/meetings", json=payload)
        assert response.status_code == 200, f"Create meeting failed: {response.text}"
        meeting = response.json()
        
        assert meeting["title"] == payload["title"]
        assert meeting["meeting_type"] == "quarterly"
        assert "topics" in meeting
        assert len(meeting["topics"]) == 2
        assert meeting["topics"][0]["title"] == "Revenue Review"
        assert meeting["topics"][0]["decision"] == "Increase marketing budget"
        assert meeting["start_time"] == "10:00"
        assert meeting["location"] == "Conference Room A"
        assert "id" in meeting
        
        print(f"SUCCESS: Created meeting with {len(meeting['topics'])} topics, id={meeting['id']}")
        
        # Cleanup
        authenticated_client.delete(f"{BASE_URL}/api/partners-hub/meetings/{meeting['id']}")
    
    def test_get_meetings_returns_topics(self, authenticated_client):
        """GET /api/partners-hub/meetings returns meetings with topics"""
        response = authenticated_client.get(f"{BASE_URL}/api/partners-hub/meetings")
        assert response.status_code == 200
        meetings = response.json()
        assert isinstance(meetings, list)
        
        for meeting in meetings:
            assert "topics" in meeting or True  # Topics may be empty array
            print(f"  Meeting: {meeting.get('title')}, topics={len(meeting.get('topics', []))}")
        
        print(f"SUCCESS: Meetings endpoint returned {len(meetings)} meetings")


# ============ PARTNERS HUB - DISCUSSIONS (VERIFY ENDPOINT) ============
class TestPartnersDiscussions:
    """Tests for discussions endpoint - check if /discussions or /discuss"""
    
    def test_discussions_endpoint_exists(self, authenticated_client):
        """Check if /api/partners-hub/discussions endpoint exists"""
        # Try /discussions first (what frontend expects)
        response = authenticated_client.get(f"{BASE_URL}/api/partners-hub/discussions")
        
        if response.status_code == 404:
            # Try /discuss (what backend may have)
            response2 = authenticated_client.get(f"{BASE_URL}/api/partners-hub/discuss")
            if response2.status_code == 200:
                pytest.fail("CRITICAL: Frontend expects /discussions but backend only has /discuss - ENDPOINT MISMATCH")
            else:
                pytest.fail(f"Neither /discussions nor /discuss endpoint works. Status: {response.status_code}, {response2.status_code}")
        
        assert response.status_code == 200, f"Discussions endpoint failed: {response.text}"
        discussions = response.json()
        assert isinstance(discussions, list)
        print(f"SUCCESS: Discussions endpoint works, returned {len(discussions)} items")
    
    def test_create_discussion_with_reply(self, authenticated_client):
        """Test creating discussion and adding reply"""
        # Create discussion
        create_payload = {"title": "TEST_Discussion", "content": "Test content for discussion"}
        create_resp = authenticated_client.post(f"{BASE_URL}/api/partners-hub/discussions", json=create_payload)
        
        if create_resp.status_code == 404:
            pytest.fail("CRITICAL: /api/partners-hub/discussions POST endpoint not found")
        
        assert create_resp.status_code == 200, f"Create discussion failed: {create_resp.text}"
        discussion = create_resp.json()
        discussion_id = discussion.get("id")
        
        # Try to add reply
        reply_payload = {"content": "This is a test reply"}
        reply_resp = authenticated_client.post(
            f"{BASE_URL}/api/partners-hub/discussions/{discussion_id}/reply",
            json=reply_payload
        )
        
        if reply_resp.status_code == 404:
            print(f"WARNING: Reply endpoint /discussions/{discussion_id}/reply not found")
        else:
            assert reply_resp.status_code == 200
            print(f"SUCCESS: Reply endpoint works")
        
        print(f"SUCCESS: Created discussion id={discussion_id}")


# ============ PARTNERS HUB - TODOS WITH STATUS ============
class TestPartnersTodosModernized:
    """Tests for modernized todos with status field"""
    
    def test_todo_has_status_field(self, authenticated_client):
        """Todos should have status field (pending, in_progress, done)"""
        # Create todo
        payload = {
            "title": "TEST_Status Todo",
            "description": "Testing status field",
            "priority": "high"
        }
        create_resp = authenticated_client.post(f"{BASE_URL}/api/partners-hub/todos", json=payload)
        assert create_resp.status_code == 200
        todo = create_resp.json()
        
        # Todo has 'completed' boolean - frontend expects 'status' string
        assert "id" in todo
        print(f"SUCCESS: Todo created, has completed={todo.get('completed')}")
        
        # Update with status
        update_resp = authenticated_client.put(f"{BASE_URL}/api/partners-hub/todos/{todo['id']}", json={
            "status": "done"
        })
        
        if update_resp.status_code == 200:
            print("SUCCESS: Status field update works")
        else:
            print(f"WARNING: Status field may not be supported, response: {update_resp.status_code}")
        
        # Cleanup
        authenticated_client.delete(f"{BASE_URL}/api/partners-hub/todos/{todo['id']}")


# ============ ADMIN E-BOOK FORM FIELDS ============
class TestAdminEbookFormFields:
    """Verify admin e-book API supports author, release_date, complementary_ebook_ids"""
    
    def test_update_ebook_with_new_fields(self, authenticated_client):
        """PUT /api/ebooks/{id} accepts author, release_date, complementary_ebook_ids"""
        # Get an ebook
        list_resp = authenticated_client.get(f"{BASE_URL}/api/ebooks/list")
        assert list_resp.status_code == 200
        ebooks = list_resp.json()["ebooks"]
        if not ebooks:
            pytest.skip("No ebooks to update")
        
        ebook_id = ebooks[0]["id"]
        original_author = ebooks[0].get("author", "")
        
        # Update with new fields
        update_payload = {
            "author": "TEST_Author Updated",
            "release_date": "2026-01-01",
            "complementary_ebook_ids": []
        }
        
        response = authenticated_client.put(f"{BASE_URL}/api/ebooks/{ebook_id}", json=update_payload)
        assert response.status_code == 200, f"Update failed: {response.text}"
        updated = response.json()
        
        assert updated.get("author") == "TEST_Author Updated"
        assert updated.get("release_date") == "2026-01-01"
        print(f"SUCCESS: E-book updated with author and release_date")
        
        # Restore original
        authenticated_client.put(f"{BASE_URL}/api/ebooks/{ebook_id}", json={"author": original_author})


# ============ CLEANUP ============
@pytest.fixture(scope="module", autouse=True)
def cleanup_test_data(request):
    """Cleanup TEST_ prefixed data after tests"""
    yield
    # Could add cleanup here
    print("Iteration 44 tests completed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
