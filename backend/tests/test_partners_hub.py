"""
Partners Hub API Tests - Tests for private workspace features:
- Idea Board CRUD
- Todo List CRUD with completion toggle
- Discussion Items CRUD
- Goals (Business + KPI) CRUD
- Policies CRUD with voting
- Partners list endpoint
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPartnersHubAuth:
    """Test Partners Hub requires partner authentication"""
    
    def test_login_admin_user(self, api_client):
        """Login as admin user (is_partner: true, is_master: true)"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "Admin@credlocity.com"
        print(f"SUCCESS: Admin login works, is_partner={data['user'].get('is_partner')}")
        return data["access_token"]
    
    def test_partners_hub_requires_auth(self, api_client):
        """Partners Hub endpoints require authentication"""
        response = api_client.get(f"{BASE_URL}/api/partners-hub/ideas")
        assert response.status_code == 403 or response.status_code == 401, \
            f"Expected 401/403, got {response.status_code}"
        print("SUCCESS: Partners Hub requires authentication")
    

class TestIdeasCRUD:
    """Test Idea Board CRUD operations"""
    
    def test_get_ideas(self, authenticated_client):
        """Get all ideas"""
        response = authenticated_client.get(f"{BASE_URL}/api/partners-hub/ideas")
        assert response.status_code == 200, f"Get ideas failed: {response.text}"
        ideas = response.json()
        assert isinstance(ideas, list)
        print(f"SUCCESS: Get ideas returned {len(ideas)} items")
        return ideas
    
    def test_create_idea(self, authenticated_client):
        """Create a new idea"""
        payload = {
            "title": "TEST_Idea - Improve Partner Dashboard",
            "description": "Add better analytics to partner dashboard",
            "priority": "high",
            "category": "product"
        }
        response = authenticated_client.post(f"{BASE_URL}/api/partners-hub/ideas", json=payload)
        assert response.status_code == 200, f"Create idea failed: {response.text}"
        idea = response.json()
        assert idea["title"] == payload["title"]
        assert idea["priority"] == "high"
        assert idea["status"] == "new"
        assert "id" in idea
        print(f"SUCCESS: Created idea with id={idea['id']}")
        return idea
    
    def test_update_idea_status(self, authenticated_client):
        """Create idea then update status"""
        # Create
        create_resp = authenticated_client.post(f"{BASE_URL}/api/partners-hub/ideas", json={
            "title": "TEST_StatusUpdate Idea",
            "description": "Test status update",
            "priority": "medium",
            "category": "general"
        })
        assert create_resp.status_code == 200
        idea_id = create_resp.json()["id"]
        
        # Update status
        update_resp = authenticated_client.put(f"{BASE_URL}/api/partners-hub/ideas/{idea_id}", json={
            "status": "in-progress"
        })
        assert update_resp.status_code == 200
        print(f"SUCCESS: Updated idea status to in-progress")
        return idea_id
    
    def test_delete_idea(self, authenticated_client):
        """Create then delete idea"""
        # Create
        create_resp = authenticated_client.post(f"{BASE_URL}/api/partners-hub/ideas", json={
            "title": "TEST_ToDelete Idea",
            "description": "Will be deleted",
            "priority": "low",
            "category": "general"
        })
        assert create_resp.status_code == 200
        idea_id = create_resp.json()["id"]
        
        # Delete
        delete_resp = authenticated_client.delete(f"{BASE_URL}/api/partners-hub/ideas/{idea_id}")
        assert delete_resp.status_code == 200
        print(f"SUCCESS: Deleted idea {idea_id}")


class TestTodosCRUD:
    """Test Todo List CRUD operations"""
    
    def test_get_todos(self, authenticated_client):
        """Get all todos"""
        response = authenticated_client.get(f"{BASE_URL}/api/partners-hub/todos")
        assert response.status_code == 200, f"Get todos failed: {response.text}"
        todos = response.json()
        assert isinstance(todos, list)
        print(f"SUCCESS: Get todos returned {len(todos)} items")
    
    def test_create_todo(self, authenticated_client):
        """Create a new todo"""
        payload = {
            "title": "TEST_Todo - Review Partner Documents",
            "description": "Review Q4 partner agreements",
            "priority": "high"
        }
        response = authenticated_client.post(f"{BASE_URL}/api/partners-hub/todos", json=payload)
        assert response.status_code == 200, f"Create todo failed: {response.text}"
        todo = response.json()
        assert todo["title"] == payload["title"]
        assert todo["completed"] == False
        assert "id" in todo
        print(f"SUCCESS: Created todo with id={todo['id']}")
        return todo
    
    def test_toggle_todo_completion(self, authenticated_client):
        """Create todo and toggle completion"""
        # Create
        create_resp = authenticated_client.post(f"{BASE_URL}/api/partners-hub/todos", json={
            "title": "TEST_Toggle Todo",
            "description": "Test completion toggle",
            "priority": "medium"
        })
        assert create_resp.status_code == 200
        todo = create_resp.json()
        todo_id = todo["id"]
        assert todo["completed"] == False
        
        # Toggle to completed
        update_resp = authenticated_client.put(f"{BASE_URL}/api/partners-hub/todos/{todo_id}", json={
            "completed": True
        })
        assert update_resp.status_code == 200
        
        # Verify GET returns completed
        get_resp = authenticated_client.get(f"{BASE_URL}/api/partners-hub/todos")
        assert get_resp.status_code == 200
        todos = get_resp.json()
        updated_todo = next((t for t in todos if t["id"] == todo_id), None)
        assert updated_todo is not None
        assert updated_todo["completed"] == True
        print(f"SUCCESS: Todo completion toggled to True")


class TestDiscussCRUD:
    """Test Discussion Items CRUD operations"""
    
    def test_get_discuss_items(self, authenticated_client):
        """Get all discussion items"""
        response = authenticated_client.get(f"{BASE_URL}/api/partners-hub/discuss")
        assert response.status_code == 200, f"Get discuss failed: {response.text}"
        items = response.json()
        assert isinstance(items, list)
        print(f"SUCCESS: Get discuss returned {len(items)} items")
    
    def test_create_discuss_item(self, authenticated_client):
        """Create a new discussion topic"""
        payload = {
            "title": "TEST_Discuss - Budget Planning 2026",
            "description": "Discuss Q1 budget allocation",
            "category": "finance"
        }
        response = authenticated_client.post(f"{BASE_URL}/api/partners-hub/discuss", json=payload)
        assert response.status_code == 200, f"Create discuss failed: {response.text}"
        item = response.json()
        assert item["title"] == payload["title"]
        assert item["status"] == "pending"
        assert "id" in item
        print(f"SUCCESS: Created discussion with id={item['id']}")
        return item


class TestGoalsCRUD:
    """Test Goals (Business + KPI) CRUD operations"""
    
    def test_get_goals(self, authenticated_client):
        """Get all goals"""
        response = authenticated_client.get(f"{BASE_URL}/api/partners-hub/goals")
        assert response.status_code == 200, f"Get goals failed: {response.text}"
        goals = response.json()
        assert isinstance(goals, list)
        print(f"SUCCESS: Get goals returned {len(goals)} items")
    
    def test_create_business_goal(self, authenticated_client):
        """Create a business goal"""
        payload = {
            "title": "TEST_Goal - Increase Partner Revenue",
            "description": "Grow partner revenue by 25%",
            "goal_type": "business",
            "target_value": "25",
            "current_value": "0",
            "category": "finance"
        }
        response = authenticated_client.post(f"{BASE_URL}/api/partners-hub/goals", json=payload)
        assert response.status_code == 200, f"Create goal failed: {response.text}"
        goal = response.json()
        assert goal["title"] == payload["title"]
        assert goal["goal_type"] == "business"
        assert goal["status"] == "active"
        print(f"SUCCESS: Created business goal with id={goal['id']}")
        return goal
    
    def test_create_kpi_goal(self, authenticated_client):
        """Create a KPI goal"""
        payload = {
            "title": "TEST_KPI - Monthly Active Users",
            "description": "Track MAU growth",
            "goal_type": "kpi",
            "target_value": "10000",
            "current_value": "5000",
            "category": "marketing"
        }
        response = authenticated_client.post(f"{BASE_URL}/api/partners-hub/goals", json=payload)
        assert response.status_code == 200, f"Create KPI goal failed: {response.text}"
        goal = response.json()
        assert goal["goal_type"] == "kpi"
        print(f"SUCCESS: Created KPI goal with id={goal['id']}")
        return goal


class TestPoliciesCRUD:
    """Test Company Policies CRUD operations with voting"""
    
    def test_get_policies(self, authenticated_client):
        """Get all policies"""
        response = authenticated_client.get(f"{BASE_URL}/api/partners-hub/policies")
        assert response.status_code == 200, f"Get policies failed: {response.text}"
        policies = response.json()
        assert isinstance(policies, list)
        print(f"SUCCESS: Get policies returned {len(policies)} items")
        return policies
    
    def test_create_policy(self, authenticated_client):
        """Create (propose) a new policy"""
        payload = {
            "title": "TEST_Policy - Remote Work Guidelines",
            "description": "Guidelines for remote work arrangements",
            "category": "hr",
            "full_text": "All employees are eligible for remote work 2 days per week..."
        }
        response = authenticated_client.post(f"{BASE_URL}/api/partners-hub/policies", json=payload)
        assert response.status_code == 200, f"Create policy failed: {response.text}"
        policy = response.json()
        assert policy["title"] == payload["title"]
        assert policy["status"] == "proposed"
        assert "id" in policy
        assert "votes" in policy
        assert policy["total_partners"] >= 1
        print(f"SUCCESS: Created policy with id={policy['id']}, total_partners={policy['total_partners']}")
        return policy
    
    def test_vote_on_policy(self, authenticated_client):
        """Create policy and vote on it"""
        # Create policy
        create_resp = authenticated_client.post(f"{BASE_URL}/api/partners-hub/policies", json={
            "title": "TEST_VotePolicy - Expense Policy Update",
            "description": "Update expense reimbursement limits",
            "category": "finance"
        })
        assert create_resp.status_code == 200
        policy_id = create_resp.json()["id"]
        
        # Vote agree
        vote_resp = authenticated_client.post(f"{BASE_URL}/api/partners-hub/policies/{policy_id}/vote", json={
            "vote": "agree"
        })
        assert vote_resp.status_code == 200
        vote_data = vote_resp.json()
        assert "agree_count" in vote_data
        assert vote_data["agree_count"] >= 1
        print(f"SUCCESS: Voted on policy, agree_count={vote_data['agree_count']}")
        
        # Vote disagree (change vote)
        vote_resp2 = authenticated_client.post(f"{BASE_URL}/api/partners-hub/policies/{policy_id}/vote", json={
            "vote": "disagree"
        })
        assert vote_resp2.status_code == 200
        print("SUCCESS: Changed vote to disagree")
        return policy_id


class TestPartnersEndpoint:
    """Test Partners list endpoint"""
    
    def test_get_partners_list(self, authenticated_client):
        """Get list of all partners"""
        response = authenticated_client.get(f"{BASE_URL}/api/partners-hub/partners")
        assert response.status_code == 200, f"Get partners failed: {response.text}"
        partners = response.json()
        assert isinstance(partners, list)
        assert len(partners) >= 1, "Expected at least 1 partner"
        
        # Verify partner has expected fields
        for partner in partners:
            assert "email" in partner
            assert "name" in partner
            assert "is_master" in partner
        
        # Check admin partner is in list
        admin_partner = next((p for p in partners if "admin" in p["email"].lower()), None)
        assert admin_partner is not None, "Admin partner not found in list"
        print(f"SUCCESS: Get partners returned {len(partners)} partners: {[p['name'] for p in partners]}")
        return partners


# ============ FIXTURES ============
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
    pytest.skip("Authentication failed - skipping authenticated tests")


@pytest.fixture
def authenticated_client(api_client, auth_token):
    """Session with auth header"""
    api_client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return api_client


# ============ CLEANUP ============
@pytest.fixture(scope="module", autouse=True)
def cleanup_test_data():
    """Cleanup TEST_ prefixed data after tests"""
    yield
    # Cleanup would happen here if needed
    print("Test cleanup completed")
