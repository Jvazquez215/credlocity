"""
Social Media Auto-Publishing API Tests
Tests for platform management, post creation, character limits, and post history
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"


class TestSocialMediaAuth:
    """Authentication tests for social media endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        return data.get("access_token")
    
    def test_platforms_requires_auth(self):
        """GET /api/social-media/platforms requires authentication"""
        response = requests.get(f"{BASE_URL}/api/social-media/platforms")
        assert response.status_code == 401
    
    def test_posts_requires_auth(self):
        """GET /api/social-media/posts requires authentication"""
        response = requests.get(f"{BASE_URL}/api/social-media/posts")
        assert response.status_code == 401
    
    def test_create_post_requires_auth(self):
        """POST /api/social-media/posts requires authentication"""
        response = requests.post(f"{BASE_URL}/api/social-media/posts", json={
            "platforms": [{"platform_id": "twitter", "content": "Test"}]
        })
        assert response.status_code == 401


class TestSocialMediaPlatforms:
    """Tests for GET /api/social-media/platforms"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        return response.json().get("access_token")
    
    def test_get_platforms_returns_all_five(self, auth_token):
        """GET /api/social-media/platforms returns all 5 platforms"""
        response = requests.get(
            f"{BASE_URL}/api/social-media/platforms",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "platforms" in data
        platforms = data["platforms"]
        assert len(platforms) == 5
        
        # Verify all platform IDs
        platform_ids = [p["id"] for p in platforms]
        assert "facebook" in platform_ids
        assert "instagram" in platform_ids
        assert "twitter" in platform_ids
        assert "threads" in platform_ids
        assert "linkedin" in platform_ids
    
    def test_platforms_have_correct_char_limits(self, auth_token):
        """Platforms have correct character limits"""
        response = requests.get(
            f"{BASE_URL}/api/social-media/platforms",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        platforms = {p["id"]: p for p in response.json()["platforms"]}
        
        # Verify character limits
        assert platforms["twitter"]["char_limit"] == 280
        assert platforms["threads"]["char_limit"] == 500
        assert platforms["instagram"]["char_limit"] == 2200
        assert platforms["linkedin"]["char_limit"] == 3000
        assert platforms["facebook"]["char_limit"] == 63206
    
    def test_platforms_have_required_fields(self, auth_token):
        """Each platform has required fields"""
        response = requests.get(
            f"{BASE_URL}/api/social-media/platforms",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        
        for platform in response.json()["platforms"]:
            assert "id" in platform
            assert "name" in platform
            assert "char_limit" in platform
            assert "supports_image" in platform
            assert "supports_link" in platform
            assert "connected" in platform
            assert isinstance(platform["connected"], bool)


class TestSocialMediaPostCreation:
    """Tests for POST /api/social-media/posts"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        return response.json().get("access_token")
    
    def test_create_single_platform_post(self, auth_token):
        """Create a post for a single platform"""
        response = requests.post(
            f"{BASE_URL}/api/social-media/posts",
            headers={"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"},
            json={
                "platforms": [{"platform_id": "twitter", "content": "TEST_social_media_post: Testing Twitter post creation"}],
                "source_type": "blog",
                "source_id": "test-blog-123",
                "source_title": "Test Blog Post",
                "source_url": "https://example.com/blog/test",
                "og_image": "https://example.com/image.jpg"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "posts" in data
        assert len(data["posts"]) == 1
        
        post = data["posts"][0]
        assert post["platform_id"] == "twitter"
        assert post["source_type"] == "blog"
        assert post["source_id"] == "test-blog-123"
        # Status should be pending_setup since no API keys configured
        assert post["status"] in ["pending_setup", "queued", "published"]
    
    def test_create_multi_platform_posts(self, auth_token):
        """Create posts for multiple platforms at once"""
        response = requests.post(
            f"{BASE_URL}/api/social-media/posts",
            headers={"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"},
            json={
                "platforms": [
                    {"platform_id": "twitter", "content": "TEST_multi: Short tweet for Twitter"},
                    {"platform_id": "linkedin", "content": "TEST_multi: Professional post for LinkedIn with more details"},
                    {"platform_id": "facebook", "content": "TEST_multi: Facebook post with even more content"}
                ],
                "source_type": "press_release",
                "source_id": "test-pr-456",
                "source_title": "Test Press Release",
                "source_url": "https://example.com/press/test"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["posts"]) == 3
        
        platform_ids = [p["platform_id"] for p in data["posts"]]
        assert "twitter" in platform_ids
        assert "linkedin" in platform_ids
        assert "facebook" in platform_ids
    
    def test_create_post_requires_platforms(self, auth_token):
        """Creating a post without platforms should fail"""
        response = requests.post(
            f"{BASE_URL}/api/social-media/posts",
            headers={"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"},
            json={
                "platforms": [],
                "source_type": "blog",
                "source_id": "test-123"
            }
        )
        assert response.status_code == 400
        assert "platform" in response.json().get("detail", "").lower()
    
    def test_twitter_char_limit_enforced(self, auth_token):
        """Twitter 280 character limit is enforced"""
        long_content = "A" * 300  # Over 280 limit
        response = requests.post(
            f"{BASE_URL}/api/social-media/posts",
            headers={"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"},
            json={
                "platforms": [{"platform_id": "twitter", "content": long_content}],
                "source_type": "blog",
                "source_id": "test-limit"
            }
        )
        assert response.status_code == 400
        detail = response.json().get("detail", "")
        assert "280" in detail or "character" in detail.lower()
    
    def test_threads_char_limit_enforced(self, auth_token):
        """Threads 500 character limit is enforced"""
        long_content = "B" * 550  # Over 500 limit
        response = requests.post(
            f"{BASE_URL}/api/social-media/posts",
            headers={"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"},
            json={
                "platforms": [{"platform_id": "threads", "content": long_content}],
                "source_type": "blog",
                "source_id": "test-limit"
            }
        )
        assert response.status_code == 400
        detail = response.json().get("detail", "")
        assert "500" in detail or "character" in detail.lower()
    
    def test_instagram_char_limit_enforced(self, auth_token):
        """Instagram 2200 character limit is enforced"""
        long_content = "C" * 2300  # Over 2200 limit
        response = requests.post(
            f"{BASE_URL}/api/social-media/posts",
            headers={"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"},
            json={
                "platforms": [{"platform_id": "instagram", "content": long_content}],
                "source_type": "blog",
                "source_id": "test-limit"
            }
        )
        assert response.status_code == 400
        detail = response.json().get("detail", "")
        assert "2200" in detail or "character" in detail.lower()
    
    def test_linkedin_char_limit_enforced(self, auth_token):
        """LinkedIn 3000 character limit is enforced"""
        long_content = "D" * 3100  # Over 3000 limit
        response = requests.post(
            f"{BASE_URL}/api/social-media/posts",
            headers={"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"},
            json={
                "platforms": [{"platform_id": "linkedin", "content": long_content}],
                "source_type": "blog",
                "source_id": "test-limit"
            }
        )
        assert response.status_code == 400
        detail = response.json().get("detail", "")
        assert "3000" in detail or "character" in detail.lower()
    
    def test_valid_content_within_limits(self, auth_token):
        """Content within limits should be accepted"""
        response = requests.post(
            f"{BASE_URL}/api/social-media/posts",
            headers={"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"},
            json={
                "platforms": [
                    {"platform_id": "twitter", "content": "TEST_valid: " + "X" * 250},  # Under 280
                    {"platform_id": "threads", "content": "TEST_valid: " + "Y" * 450},  # Under 500
                ],
                "source_type": "blog",
                "source_id": "test-valid"
            }
        )
        assert response.status_code == 200
        assert len(response.json()["posts"]) == 2


class TestSocialMediaPostHistory:
    """Tests for GET /api/social-media/posts"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        return response.json().get("access_token")
    
    def test_get_posts_returns_list(self, auth_token):
        """GET /api/social-media/posts returns posts list"""
        response = requests.get(
            f"{BASE_URL}/api/social-media/posts",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "posts" in data
        assert isinstance(data["posts"], list)
    
    def test_filter_by_source_type(self, auth_token):
        """Filter posts by source_type"""
        response = requests.get(
            f"{BASE_URL}/api/social-media/posts?source_type=blog",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        posts = response.json()["posts"]
        for post in posts:
            assert post["source_type"] == "blog"
    
    def test_filter_by_platform_id(self, auth_token):
        """Filter posts by platform_id"""
        response = requests.get(
            f"{BASE_URL}/api/social-media/posts?platform_id=twitter",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        posts = response.json()["posts"]
        for post in posts:
            assert post["platform_id"] == "twitter"
    
    def test_filter_by_status(self, auth_token):
        """Filter posts by status"""
        response = requests.get(
            f"{BASE_URL}/api/social-media/posts?status=pending_setup",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        posts = response.json()["posts"]
        for post in posts:
            assert post["status"] == "pending_setup"


class TestSocialMediaPostDelete:
    """Tests for DELETE /api/social-media/posts/{id}"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        return response.json().get("access_token")
    
    def test_delete_post(self, auth_token):
        """Create and delete a post"""
        # First create a post
        create_response = requests.post(
            f"{BASE_URL}/api/social-media/posts",
            headers={"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"},
            json={
                "platforms": [{"platform_id": "facebook", "content": "TEST_delete: Post to be deleted"}],
                "source_type": "blog",
                "source_id": "test-delete-123"
            }
        )
        assert create_response.status_code == 200
        post_id = create_response.json()["posts"][0]["id"]
        
        # Delete the post
        delete_response = requests.delete(
            f"{BASE_URL}/api/social-media/posts/{post_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert delete_response.status_code == 200
        assert "deleted" in delete_response.json().get("message", "").lower()
        
        # Verify post is gone by checking posts list
        get_response = requests.get(
            f"{BASE_URL}/api/social-media/posts?source_id=test-delete-123",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        posts = get_response.json()["posts"]
        post_ids = [p["id"] for p in posts]
        assert post_id not in post_ids
    
    def test_delete_nonexistent_post(self, auth_token):
        """Deleting non-existent post returns 404"""
        response = requests.delete(
            f"{BASE_URL}/api/social-media/posts/nonexistent-id-12345",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 404


class TestPlatformCredentials:
    """Tests for PUT /api/social-media/platforms/{id}/credentials"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        return response.json().get("access_token")
    
    def test_update_credentials_admin_only(self, auth_token):
        """Admin can update platform credentials"""
        response = requests.put(
            f"{BASE_URL}/api/social-media/platforms/twitter/credentials",
            headers={"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"},
            json={
                "access_token": "test_token_12345",
                "page_name": "Test Twitter Account"
            }
        )
        assert response.status_code == 200
        assert "updated" in response.json().get("message", "").lower()
    
    def test_update_credentials_invalid_platform(self, auth_token):
        """Updating credentials for invalid platform returns 400"""
        response = requests.put(
            f"{BASE_URL}/api/social-media/platforms/invalid_platform/credentials",
            headers={"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"},
            json={"access_token": "test"}
        )
        assert response.status_code == 400
    
    def test_update_credentials_requires_auth(self):
        """Updating credentials requires authentication"""
        response = requests.put(
            f"{BASE_URL}/api/social-media/platforms/twitter/credentials",
            json={"access_token": "test"}
        )
        assert response.status_code == 401


class TestCleanup:
    """Cleanup test data"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        return response.json().get("access_token")
    
    def test_cleanup_test_posts(self, auth_token):
        """Clean up TEST_ prefixed posts"""
        # Get all posts
        response = requests.get(
            f"{BASE_URL}/api/social-media/posts?limit=100",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        if response.status_code == 200:
            posts = response.json().get("posts", [])
            for post in posts:
                if post.get("content", "").startswith("TEST_"):
                    requests.delete(
                        f"{BASE_URL}/api/social-media/posts/{post['id']}",
                        headers={"Authorization": f"Bearer {auth_token}"}
                    )
        assert True  # Cleanup always passes
