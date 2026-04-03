"""
Pricing CMS Backend API Tests - Iteration 97
Tests for admin pricing management and public pricing page APIs
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"


class TestPricingCMSAPIs:
    """Test Pricing CMS Backend APIs"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get auth token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if login_response.status_code == 200:
            data = login_response.json()
            token = data.get("access_token") or data.get("token")
            if token:
                self.session.headers.update({"Authorization": f"Bearer {token}"})
                self.token = token
            else:
                pytest.skip("No token in login response")
        else:
            pytest.skip(f"Login failed: {login_response.status_code}")
    
    # ==================== PUBLIC ENDPOINTS (No Auth Required) ====================
    
    def test_public_pricing_plans_endpoint(self):
        """Test GET /api/billing/public/pricing-plans - Public endpoint"""
        response = requests.get(f"{BASE_URL}/api/billing/public/pricing-plans")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"PASS: Public pricing plans endpoint returns {len(data)} plans")
        
        # Verify plan structure if plans exist
        if len(data) > 0:
            plan = data[0]
            assert "name" in plan, "Plan should have 'name' field"
            assert "price" in plan, "Plan should have 'price' field"
            print(f"PASS: First plan: {plan.get('name')} - {plan.get('price')}")
    
    def test_public_pricing_config_endpoint(self):
        """Test GET /api/billing/public/pricing-config - Public endpoint"""
        response = requests.get(f"{BASE_URL}/api/billing/public/pricing-config")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, dict), "Response should be a dict"
        print(f"PASS: Public pricing config endpoint returns config")
        
        # Check for expected config sections
        if data:
            if "hero" in data:
                print(f"PASS: Config has hero section with title: {data['hero'].get('title', 'N/A')}")
            if "sections" in data:
                print(f"PASS: Config has sections: {list(data['sections'].keys())}")
    
    def test_public_pricing_products_endpoint(self):
        """Test GET /api/billing/public/pricing-products - Public endpoint"""
        response = requests.get(f"{BASE_URL}/api/billing/public/pricing-products")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"PASS: Public pricing products endpoint returns {len(data)} products")
        
        # Verify product structure if products exist
        if len(data) > 0:
            product = data[0]
            assert "name" in product, "Product should have 'name' field"
            print(f"PASS: First product: {product.get('name')} - {product.get('price_display', 'N/A')}")
    
    # ==================== ADMIN ENDPOINTS (Auth Required) ====================
    
    def test_admin_subscription_plans_endpoint(self):
        """Test GET /api/billing/subscription-plans - Admin endpoint"""
        response = self.session.get(f"{BASE_URL}/api/billing/subscription-plans")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"PASS: Admin subscription plans endpoint returns {len(data)} plans")
        
        # Count visible vs hidden plans
        visible_count = sum(1 for p in data if p.get("show_on_website", False))
        hidden_count = len(data) - visible_count
        print(f"PASS: {visible_count} visible plans, {hidden_count} hidden plans")
        
        # Verify plan structure
        if len(data) > 0:
            plan = data[0]
            assert "id" in plan, "Plan should have 'id' field"
            assert "name" in plan, "Plan should have 'name' field"
            assert "monthly_fee" in plan, "Plan should have 'monthly_fee' field"
            print(f"PASS: Plan structure verified - {plan.get('name')}")
    
    def test_admin_pricing_products_endpoint(self):
        """Test GET /api/billing/pricing-products - Admin endpoint"""
        response = self.session.get(f"{BASE_URL}/api/billing/pricing-products")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"PASS: Admin pricing products endpoint returns {len(data)} products")
        
        # Count by category
        categories = {}
        for p in data:
            cat = p.get("category", "unknown")
            categories[cat] = categories.get(cat, 0) + 1
        print(f"PASS: Products by category: {categories}")
    
    def test_admin_pricing_page_config_endpoint(self):
        """Test GET /api/billing/pricing-page-config - Admin endpoint"""
        response = self.session.get(f"{BASE_URL}/api/billing/pricing-page-config")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, dict), "Response should be a dict"
        print(f"PASS: Admin pricing page config endpoint returns config")
    
    def test_admin_update_pricing_page_config(self):
        """Test PUT /api/billing/pricing-page-config - Admin endpoint"""
        # First get current config
        get_response = self.session.get(f"{BASE_URL}/api/billing/pricing-page-config")
        current_config = get_response.json() if get_response.status_code == 200 else {}
        
        # Update with test data
        test_config = {
            **current_config,
            "hero": {
                "title": "Test Title - Iteration 97",
                "subtitle": "Test subtitle",
                "highlights": ["$0 First Work Fee", "30-Day Free Trial"]
            }
        }
        
        response = self.session.put(f"{BASE_URL}/api/billing/pricing-page-config", json=test_config)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print(f"PASS: Admin can update pricing page config")
        
        # Restore original config if it existed
        if current_config:
            self.session.put(f"{BASE_URL}/api/billing/pricing-page-config", json=current_config)
    
    def test_admin_toggle_plan_visibility(self):
        """Test PUT /api/billing/subscription-plans/{id} - Toggle visibility"""
        # Get plans first
        plans_response = self.session.get(f"{BASE_URL}/api/billing/subscription-plans")
        plans = plans_response.json()
        
        if not plans:
            pytest.skip("No plans available to test visibility toggle")
        
        # Find a plan to toggle
        test_plan = plans[0]
        plan_id = test_plan.get("id")
        original_visibility = test_plan.get("show_on_website", False)
        
        # Toggle visibility
        response = self.session.put(
            f"{BASE_URL}/api/billing/subscription-plans/{plan_id}",
            json={"show_on_website": not original_visibility}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify change
        updated_plan = response.json()
        assert updated_plan.get("show_on_website") == (not original_visibility), "Visibility should be toggled"
        print(f"PASS: Plan visibility toggled from {original_visibility} to {not original_visibility}")
        
        # Restore original visibility
        self.session.put(
            f"{BASE_URL}/api/billing/subscription-plans/{plan_id}",
            json={"show_on_website": original_visibility}
        )
        print(f"PASS: Plan visibility restored to {original_visibility}")
    
    def test_admin_toggle_product_visibility(self):
        """Test PUT /api/billing/pricing-products/{id} - Toggle visibility"""
        # Get products first
        products_response = self.session.get(f"{BASE_URL}/api/billing/pricing-products")
        products = products_response.json()
        
        if not products:
            pytest.skip("No products available to test visibility toggle")
        
        # Find a product to toggle
        test_product = products[0]
        product_id = test_product.get("id")
        original_visibility = test_product.get("show_on_website", False)
        
        # Toggle visibility
        response = self.session.put(
            f"{BASE_URL}/api/billing/pricing-products/{product_id}",
            json={"show_on_website": not original_visibility}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify change
        updated_product = response.json()
        assert updated_product.get("show_on_website") == (not original_visibility), "Visibility should be toggled"
        print(f"PASS: Product visibility toggled from {original_visibility} to {not original_visibility}")
        
        # Restore original visibility
        self.session.put(
            f"{BASE_URL}/api/billing/pricing-products/{product_id}",
            json={"show_on_website": original_visibility}
        )
        print(f"PASS: Product visibility restored to {original_visibility}")
    
    def test_admin_create_and_delete_plan(self):
        """Test POST and DELETE /api/billing/subscription-plans"""
        # Create a test plan
        test_plan_data = {
            "name": "TEST_Iteration97_Plan",
            "code": "TEST_ITER97",
            "description": "Test plan for iteration 97",
            "monthly_fee": 99.99,
            "signup_fee": 0,
            "show_on_website": False,
            "is_featured": False,
            "display_order": 999,
            "website_settings": {
                "display_name": "Test Plan",
                "price_display": "$99.99",
                "trial_text": "7-Day Free Trial",
                "features_included": ["Test Feature 1", "Test Feature 2"],
                "features_not_included": ["Not Included Feature"]
            }
        }
        
        # Create plan
        create_response = self.session.post(
            f"{BASE_URL}/api/billing/subscription-plans",
            json=test_plan_data
        )
        assert create_response.status_code == 200, f"Expected 200, got {create_response.status_code}: {create_response.text}"
        
        created_data = create_response.json()
        plan_id = created_data.get("plan", {}).get("id")
        assert plan_id, "Created plan should have an ID"
        print(f"PASS: Created test plan with ID: {plan_id}")
        
        # Delete the test plan
        delete_response = self.session.delete(f"{BASE_URL}/api/billing/subscription-plans/{plan_id}")
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}: {delete_response.text}"
        print(f"PASS: Deleted test plan")
    
    def test_admin_create_and_delete_product(self):
        """Test POST and DELETE /api/billing/pricing-products"""
        # Create a test product
        test_product_data = {
            "name": "TEST_Iteration97_Product",
            "code": "TEST_PROD_ITER97",
            "description": "Test product for iteration 97",
            "category": "pay_per_delete",
            "price": 99.99,
            "price_display": "$99.99",
            "price_note": "Per deletion",
            "show_on_website": False,
            "display_order": 999,
            "features": ["Test Feature 1"]
        }
        
        # Create product
        create_response = self.session.post(
            f"{BASE_URL}/api/billing/pricing-products",
            json=test_product_data
        )
        assert create_response.status_code == 200, f"Expected 200, got {create_response.status_code}: {create_response.text}"
        
        created_data = create_response.json()
        product_id = created_data.get("product", {}).get("id")
        assert product_id, "Created product should have an ID"
        print(f"PASS: Created test product with ID: {product_id}")
        
        # Delete the test product
        delete_response = self.session.delete(f"{BASE_URL}/api/billing/pricing-products/{product_id}")
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}: {delete_response.text}"
        print(f"PASS: Deleted test product")
    
    # ==================== UNAUTHORIZED ACCESS TESTS ====================
    
    def test_admin_endpoints_require_auth(self):
        """Test that admin endpoints require authentication"""
        # Create a session without auth
        no_auth_session = requests.Session()
        no_auth_session.headers.update({"Content-Type": "application/json"})
        
        # Test subscription-plans endpoint
        response = no_auth_session.get(f"{BASE_URL}/api/billing/subscription-plans")
        assert response.status_code == 403, f"Expected 403 for unauthorized access, got {response.status_code}"
        print(f"PASS: /api/billing/subscription-plans requires auth (returns 403)")
        
        # Test pricing-products endpoint
        response = no_auth_session.get(f"{BASE_URL}/api/billing/pricing-products")
        assert response.status_code == 403, f"Expected 403 for unauthorized access, got {response.status_code}"
        print(f"PASS: /api/billing/pricing-products requires auth (returns 403)")
        
        # Test pricing-page-config endpoint
        response = no_auth_session.get(f"{BASE_URL}/api/billing/pricing-page-config")
        assert response.status_code == 403, f"Expected 403 for unauthorized access, got {response.status_code}"
        print(f"PASS: /api/billing/pricing-page-config requires auth (returns 403)")


class TestPublicPricingPageData:
    """Test that public pricing page gets correct data"""
    
    def test_public_plans_have_required_fields(self):
        """Test that public plans have all required fields for display"""
        response = requests.get(f"{BASE_URL}/api/billing/public/pricing-plans")
        assert response.status_code == 200
        
        plans = response.json()
        if not plans:
            pytest.skip("No public plans available")
        
        required_fields = ["name", "price", "features"]
        for plan in plans:
            for field in required_fields:
                assert field in plan, f"Plan missing required field: {field}"
        
        print(f"PASS: All {len(plans)} public plans have required fields")
    
    def test_public_products_have_required_fields(self):
        """Test that public products have all required fields for display"""
        response = requests.get(f"{BASE_URL}/api/billing/public/pricing-products")
        assert response.status_code == 200
        
        products = response.json()
        if not products:
            pytest.skip("No public products available")
        
        required_fields = ["name", "category", "price_display"]
        for product in products:
            for field in required_fields:
                assert field in product, f"Product missing required field: {field}"
        
        # Check categories
        setup_services = [p for p in products if p.get("category") == "setup_service"]
        pay_per_delete = [p for p in products if p.get("category") == "pay_per_delete"]
        
        print(f"PASS: {len(setup_services)} setup services, {len(pay_per_delete)} pay-per-delete products")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
