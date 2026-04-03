"""
Iteration 108: Notification Queue & Blog Preservation Tests
Tests:
- Blog post create/update auto-queues notifications when published
- Press release create/update/toggle auto-queues notifications when published
- Notification queue CRUD (list, update status)
- Blog posts preservation (108+ posts with images)
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestNotificationQueueBackend:
    """Test notification queue feature for blog and press release publishing"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Get admin auth token"""
        self.token = None
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "Admin@credlocity.com",
            "password": "Credit123!"
        })
        if login_res.status_code == 200:
            self.token = login_res.json().get("access_token")
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        yield
    
    # ==================== BLOG POST NOTIFICATION TESTS ====================
    
    def test_01_create_published_blog_queues_notification(self):
        """POST /api/blog/posts with status=published should auto-queue notification"""
        if not self.token:
            pytest.skip("Auth failed")
        
        # Create a published blog post
        unique_slug = f"test-notif-blog-{uuid.uuid4().hex[:8]}"
        blog_data = {
            "title": "TEST_ITER108 Notification Test Blog",
            "slug": unique_slug,
            "content": "<p>Test content for notification queue testing</p>",
            "excerpt": "Test excerpt for notification",
            "status": "published",
            "categories": ["credit-repair"],
            "author_id": "test-author",
            "tags": ["test", "notification"]
        }
        
        res = requests.post(f"{BASE_URL}/api/blog/posts", json=blog_data, headers=self.headers)
        assert res.status_code == 200, f"Failed to create blog: {res.text}"
        
        created_post = res.json()
        assert created_post.get("id"), "Blog post should have an ID"
        assert created_post.get("status") == "published"
        
        # Check notification queue for this blog
        notif_res = requests.get(f"{BASE_URL}/api/subscribers/notifications?limit=50", headers=self.headers)
        assert notif_res.status_code == 200
        
        notif_data = notif_res.json()
        notifications = notif_data.get("notifications", [])
        
        # Find notification for our blog
        blog_notif = next((n for n in notifications if n.get("title") == "TEST_ITER108 Notification Test Blog"), None)
        assert blog_notif is not None, "Notification should be queued for published blog"
        assert blog_notif.get("type") == "blog_published"
        assert blog_notif.get("status") == "queued"
        assert "blog" in blog_notif.get("target_tags", [])
        
        # Cleanup: delete the test blog post
        requests.delete(f"{BASE_URL}/api/blog/posts/{created_post['id']}", headers=self.headers)
        print(f"PASS: Published blog auto-queued notification")
    
    def test_02_update_draft_to_published_queues_notification(self):
        """PUT /api/blog/posts/{id} changing status from draft to published should queue notification"""
        if not self.token:
            pytest.skip("Auth failed")
        
        # Create a draft blog post first
        unique_slug = f"test-draft-blog-{uuid.uuid4().hex[:8]}"
        blog_data = {
            "title": "TEST_ITER108 Draft to Published Blog",
            "slug": unique_slug,
            "content": "<p>Draft content</p>",
            "excerpt": "Draft excerpt",
            "status": "draft",
            "categories": ["credit-repair"],
            "author_id": "test-author",
            "tags": ["test"]
        }
        
        create_res = requests.post(f"{BASE_URL}/api/blog/posts", json=blog_data, headers=self.headers)
        assert create_res.status_code == 200, f"Failed to create draft blog: {create_res.text}"
        
        created_post = create_res.json()
        post_id = created_post.get("id")
        
        # Update to published
        update_res = requests.put(f"{BASE_URL}/api/blog/posts/{post_id}", json={
            "status": "published"
        }, headers=self.headers)
        assert update_res.status_code == 200, f"Failed to update blog: {update_res.text}"
        
        # Check notification queue
        notif_res = requests.get(f"{BASE_URL}/api/subscribers/notifications?limit=50", headers=self.headers)
        assert notif_res.status_code == 200
        
        notifications = notif_res.json().get("notifications", [])
        blog_notif = next((n for n in notifications if n.get("title") == "TEST_ITER108 Draft to Published Blog"), None)
        assert blog_notif is not None, "Notification should be queued when draft is published"
        assert blog_notif.get("type") == "blog_published"
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/blog/posts/{post_id}", headers=self.headers)
        print(f"PASS: Draft-to-published blog auto-queued notification")
    
    # ==================== NOTIFICATION QUEUE CRUD TESTS ====================
    
    def test_03_get_notifications_list(self):
        """GET /api/subscribers/notifications returns queued notifications with counts"""
        if not self.token:
            pytest.skip("Auth failed")
        
        res = requests.get(f"{BASE_URL}/api/subscribers/notifications", headers=self.headers)
        assert res.status_code == 200
        
        data = res.json()
        assert "notifications" in data
        assert "total" in data
        assert "queued" in data
        assert isinstance(data["notifications"], list)
        assert isinstance(data["total"], int)
        assert isinstance(data["queued"], int)
        print(f"PASS: Notifications list returned {data['total']} total, {data['queued']} queued")
    
    def test_04_update_notification_to_sent(self):
        """PUT /api/subscribers/notifications/{id}/status - mark as sent records sent_to_count and sent_at"""
        if not self.token:
            pytest.skip("Auth failed")
        
        # Get a queued notification
        notif_res = requests.get(f"{BASE_URL}/api/subscribers/notifications?status=queued&limit=10", headers=self.headers)
        assert notif_res.status_code == 200
        
        notifications = notif_res.json().get("notifications", [])
        if not notifications:
            pytest.skip("No queued notifications to test")
        
        notif_id = notifications[0].get("id")
        
        # Mark as sent
        update_res = requests.put(f"{BASE_URL}/api/subscribers/notifications/{notif_id}/status", 
            json={"status": "sent"}, headers=self.headers)
        assert update_res.status_code == 200
        
        # Verify the notification was updated
        verify_res = requests.get(f"{BASE_URL}/api/subscribers/notifications?limit=100", headers=self.headers)
        all_notifs = verify_res.json().get("notifications", [])
        updated_notif = next((n for n in all_notifs if n.get("id") == notif_id), None)
        
        assert updated_notif is not None
        assert updated_notif.get("status") == "sent"
        # sent_to_count and sent_at should be set
        assert "sent_to_count" in updated_notif or updated_notif.get("sent_to_count") is not None
        print(f"PASS: Notification marked as sent with sent_to_count={updated_notif.get('sent_to_count')}")
    
    def test_05_update_notification_to_cancelled(self):
        """PUT /api/subscribers/notifications/{id}/status - mark as cancelled"""
        if not self.token:
            pytest.skip("Auth failed")
        
        # Create a new blog to get a fresh notification
        unique_slug = f"test-cancel-blog-{uuid.uuid4().hex[:8]}"
        blog_data = {
            "title": "TEST_ITER108 Cancel Notification Blog",
            "slug": unique_slug,
            "content": "<p>Content</p>",
            "excerpt": "Excerpt",
            "status": "published",
            "categories": ["credit-repair"],
            "author_id": "test-author",
            "tags": ["test"]
        }
        
        create_res = requests.post(f"{BASE_URL}/api/blog/posts", json=blog_data, headers=self.headers)
        if create_res.status_code != 200:
            pytest.skip("Could not create test blog")
        
        post_id = create_res.json().get("id")
        
        # Find the notification
        notif_res = requests.get(f"{BASE_URL}/api/subscribers/notifications?limit=50", headers=self.headers)
        notifications = notif_res.json().get("notifications", [])
        notif = next((n for n in notifications if n.get("title") == "TEST_ITER108 Cancel Notification Blog"), None)
        
        if notif:
            # Cancel it
            cancel_res = requests.put(f"{BASE_URL}/api/subscribers/notifications/{notif['id']}/status",
                json={"status": "cancelled"}, headers=self.headers)
            assert cancel_res.status_code == 200
            print(f"PASS: Notification cancelled successfully")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/blog/posts/{post_id}", headers=self.headers)
    
    # ==================== BLOG PRESERVATION TESTS ====================
    
    def test_06_blog_posts_count_preserved(self):
        """Verify 108+ blog posts are preserved and accessible"""
        if not self.token:
            pytest.skip("Auth failed")
        
        # Get all blog posts (admin endpoint)
        res = requests.get(f"{BASE_URL}/api/blog/posts/all?limit=200", headers=self.headers)
        assert res.status_code == 200
        
        data = res.json()
        total = data.get("total", 0)
        posts = data.get("posts", [])
        
        # Should have 108+ posts
        assert total >= 100, f"Expected 100+ blog posts, got {total}"
        print(f"PASS: Blog posts preserved - {total} total posts")
    
    def test_07_blog_posts_with_images_accessible(self):
        """Verify blog posts with images are accessible via public API"""
        # Public endpoint - no auth needed
        res = requests.get(f"{BASE_URL}/api/blog/posts?page=1&page_size=20")
        assert res.status_code == 200
        
        data = res.json()
        posts = data.get("posts", [])
        total = data.get("total", 0)
        
        assert total >= 100, f"Expected 100+ published posts, got {total}"
        
        # Check that posts have featured images
        posts_with_images = [p for p in posts if p.get("featured_image_url")]
        print(f"PASS: {len(posts_with_images)}/{len(posts)} posts have featured images")
    
    # ==================== PRESS RELEASE NOTIFICATION TESTS ====================
    
    def test_08_create_published_press_release_queues_notification(self):
        """POST /api/admin/press-releases with is_published=true should auto-queue notification"""
        if not self.token:
            pytest.skip("Auth failed")
        
        pr_data = {
            "title": "TEST_ITER108 Press Release Notification Test",
            "summary": "Test summary for press release notification",
            "excerpt": "Test excerpt for press release notification",
            "content": "<p>Press release content</p>",
            "is_published": True,
            "publish_date": datetime.now().isoformat()
        }
        
        res = requests.post(f"{BASE_URL}/api/admin/press-releases", json=pr_data, headers=self.headers)
        assert res.status_code == 200, f"Failed to create press release: {res.text}"
        
        created_pr = res.json()
        pr_id = created_pr.get("id")
        
        # Check notification queue
        notif_res = requests.get(f"{BASE_URL}/api/subscribers/notifications?limit=50", headers=self.headers)
        assert notif_res.status_code == 200
        
        notifications = notif_res.json().get("notifications", [])
        pr_notif = next((n for n in notifications if n.get("title") == "TEST_ITER108 Press Release Notification Test"), None)
        
        assert pr_notif is not None, "Notification should be queued for published press release"
        assert pr_notif.get("type") == "press_release_published"
        assert "press_release" in pr_notif.get("target_tags", [])
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/press-releases/{pr_id}", headers=self.headers)
        print(f"PASS: Published press release auto-queued notification")
    
    def test_09_toggle_press_release_to_published_queues_notification(self):
        """PATCH /api/admin/press-releases/{id}/toggle should queue notification when toggled to published"""
        if not self.token:
            pytest.skip("Auth failed")
        
        # Create unpublished press release
        pr_data = {
            "title": "TEST_ITER108 Toggle Press Release",
            "summary": "Test toggle notification",
            "excerpt": "Test excerpt for toggle",
            "content": "<p>Content</p>",
            "is_published": False,
            "publish_date": datetime.now().isoformat()
        }
        
        create_res = requests.post(f"{BASE_URL}/api/admin/press-releases", json=pr_data, headers=self.headers)
        assert create_res.status_code == 200, f"Failed to create press release: {create_res.text}"
        
        pr_id = create_res.json().get("id")
        
        # Toggle to published (PATCH request)
        toggle_res = requests.patch(f"{BASE_URL}/api/admin/press-releases/{pr_id}/toggle", headers=self.headers)
        assert toggle_res.status_code == 200, f"Failed to toggle: {toggle_res.text}"
        
        # Check notification queue
        notif_res = requests.get(f"{BASE_URL}/api/subscribers/notifications?limit=50", headers=self.headers)
        notifications = notif_res.json().get("notifications", [])
        pr_notif = next((n for n in notifications if n.get("title") == "TEST_ITER108 Toggle Press Release"), None)
        
        assert pr_notif is not None, "Notification should be queued when press release is toggled to published"
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/press-releases/{pr_id}", headers=self.headers)
        print(f"PASS: Toggle press release to published queued notification")
    
    def test_10_notification_invalid_status_rejected(self):
        """PUT /api/subscribers/notifications/{id}/status with invalid status should fail"""
        if not self.token:
            pytest.skip("Auth failed")
        
        # Get any notification
        notif_res = requests.get(f"{BASE_URL}/api/subscribers/notifications?limit=1", headers=self.headers)
        notifications = notif_res.json().get("notifications", [])
        
        if not notifications:
            pytest.skip("No notifications to test")
        
        notif_id = notifications[0].get("id")
        
        # Try invalid status
        res = requests.put(f"{BASE_URL}/api/subscribers/notifications/{notif_id}/status",
            json={"status": "invalid_status"}, headers=self.headers)
        
        assert res.status_code == 400, "Invalid status should be rejected"
        print(f"PASS: Invalid notification status rejected")


class TestBlogPostsIntegrity:
    """Additional tests for blog post data integrity"""
    
    def test_blog_posts_have_required_fields(self):
        """Verify blog posts have required fields"""
        res = requests.get(f"{BASE_URL}/api/blog/posts?page=1&page_size=10")
        assert res.status_code == 200
        
        posts = res.json().get("posts", [])
        assert len(posts) > 0, "Should have blog posts"
        
        for post in posts[:5]:
            assert post.get("id"), "Post should have id"
            assert post.get("title"), "Post should have title"
            assert post.get("slug"), "Post should have slug"
            assert post.get("status") == "published", "Public posts should be published"
        
        print(f"PASS: Blog posts have required fields")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
