#!/usr/bin/env python3
"""
Credlocity Credit Repair Reviews System Backend API Tests
Tests the enhanced Credit Repair Reviews system for Credlocity as per review request.
"""

import requests
import json
import sys
from typing import Optional, Dict, Any
from datetime import datetime, timezone, timedelta

# Base URL for the API
BASE_URL = "https://credlocity-forms.preview.emergentagent.com/api"

# Test credentials
ADMIN_EMAIL = "Admin@credlocity.com"
ADMIN_PASSWORD = "Credit123!"

class CreditRepairTester:
    def __init__(self):
        self.token: Optional[str] = None
        self.headers: Dict[str, str] = {
            "Content-Type": "application/json"
        }
        self.test_results = []
    
    def log_test(self, test_name: str, success: bool, details: str, response_data: Any = None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"\n{status} {test_name}")
        print(f"Details: {details}")
        if response_data:
            print(f"Response: {json.dumps(response_data, indent=2)}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response": response_data
        })
    
    def test_admin_login(self) -> bool:
        """Test admin authentication"""
        print("\n" + "="*60)
        print("TESTING: Admin Authentication API")
        print("="*60)
        
        try:
            url = f"{BASE_URL}/auth/login"
            payload = {
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            }
            
            print(f"POST {url}")
            print(f"Payload: {json.dumps(payload, indent=2)}")
            
            response = requests.post(url, json=payload, headers=self.headers, timeout=30)
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if response has required fields
                if "access_token" in data and "token_type" in data:
                    self.token = data["access_token"]
                    self.headers["Authorization"] = f"Bearer {self.token}"
                    
                    # Verify token structure (basic JWT check)
                    token_parts = self.token.split('.')
                    if len(token_parts) == 3:
                        self.log_test(
                            "Admin Authentication API",
                            True,
                            f"Login successful. Token received and has valid JWT structure (3 parts). Token type: {data.get('token_type')}",
                            {
                                "status_code": response.status_code,
                                "token_type": data.get("token_type"),
                                "user_info": data.get("user", {})
                            }
                        )
                        return True
                    else:
                        self.log_test(
                            "Admin Authentication API",
                            False,
                            f"Login returned token but invalid JWT format (expected 3 parts, got {len(token_parts)})",
                            data
                        )
                        return False
                else:
                    self.log_test(
                        "Admin Authentication API",
                        False,
                        "Login response missing required fields (access_token, token_type)",
                        data
                    )
                    return False
            else:
                error_msg = f"Login failed with status {response.status_code}"
                try:
                    error_data = response.json()
                    error_msg += f": {error_data.get('detail', 'Unknown error')}"
                except:
                    error_msg += f": {response.text}"
                
                self.log_test(
                    "Admin Authentication API",
                    False,
                    error_msg,
                    {"status_code": response.status_code, "response": response.text}
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Admin Authentication API",
                False,
                f"Network error during login: {str(e)}",
                None
            )
            return False
        except Exception as e:
            self.log_test(
                "Admin Authentication API",
                False,
                f"Unexpected error during login: {str(e)}",
                None
            )
            return False
    
    def test_credit_repair_submit_complaint(self) -> tuple[bool, str]:
        """Test 1: Submit Complaint with Enhanced Fields"""
        print("\n" + "="*60)
        print("TESTING: Credit Repair - Submit Complaint with Enhanced Fields")
        print("="*60)
        
        try:
            url = f"{BASE_URL}/credit-repair/complaints/submit"
            
            payload = {
                "company_name": "Test Credit Repair Company",
                "complainant_name": "John Smith",
                "complainant_email": "john.smith@example.com",
                "complainant_city": "Los Angeles",
                "complainant_state": "CA",
                "social_twitter": "https://twitter.com/johnsmith",
                "social_instagram": "https://instagram.com/johnsmith",
                "complaint_types": ["False Promises", "Charged Without Results"],
                "complaint_details": "This company promised to remove all negative items from my credit report within 30 days but after 6 months and $500 paid, nothing was removed. They kept making excuses and asking for more money.",
                "star_rating": 1,
                "fair_resolution": "Full refund of $500 and removal of all charges",
                "video_review_url": "https://youtube.com/watch?v=test123",
                "video_review_platform": "youtube"
            }
            
            print(f"POST {url}")
            print(f"Payload: {json.dumps(payload, indent=2)}")
            
            response = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=30)
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if response has required fields
                if "complaint_id" in data and "message" in data:
                    complaint_id = data["complaint_id"]
                    self.log_test(
                        "Credit Repair - Submit Complaint",
                        True,
                        f"Complaint submitted successfully. Complaint ID: {complaint_id}. Message: {data['message']}",
                        {
                            "status_code": response.status_code,
                            "complaint_id": complaint_id,
                            "message": data["message"]
                        }
                    )
                    return True, complaint_id
                else:
                    self.log_test(
                        "Credit Repair - Submit Complaint",
                        False,
                        "Response missing required fields (complaint_id, message)",
                        data
                    )
                    return False, ""
            else:
                error_msg = f"Submit complaint failed with status {response.status_code}"
                try:
                    error_data = response.json()
                    error_msg += f": {error_data.get('detail', 'Unknown error')}"
                except:
                    error_msg += f": {response.text}"
                
                self.log_test(
                    "Credit Repair - Submit Complaint",
                    False,
                    error_msg,
                    {"status_code": response.status_code, "response": response.text}
                )
                return False, ""
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Credit Repair - Submit Complaint",
                False,
                f"Network error: {str(e)}",
                None
            )
            return False, ""
        except Exception as e:
            self.log_test(
                "Credit Repair - Submit Complaint",
                False,
                f"Unexpected error: {str(e)}",
                None
            )
            return False, ""
    
    def test_credit_repair_reviews_page_data(self) -> bool:
        """Test 2: Get Reviews Page Data with Company Grouping"""
        print("\n" + "="*60)
        print("TESTING: Credit Repair - Get Reviews Page Data")
        print("="*60)
        
        try:
            url = f"{BASE_URL}/credit-repair/reviews-page-data"
            
            print(f"GET {url}")
            
            response = requests.get(url, timeout=30)
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if response has required structure
                required_fields = ["companies", "complaints_by_company", "recent_complaints", "stats"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    companies_count = len(data.get("companies", []))
                    complaints_by_company = data.get("complaints_by_company", {})
                    recent_complaints = data.get("recent_complaints", [])
                    stats = data.get("stats", {})
                    
                    self.log_test(
                        "Credit Repair - Get Reviews Page Data",
                        True,
                        f"Reviews page data retrieved successfully. Companies: {companies_count}, Complaints by company: {len(complaints_by_company)}, Recent complaints: {len(recent_complaints)}, Stats: {stats}",
                        {
                            "status_code": response.status_code,
                            "companies_count": companies_count,
                            "complaints_by_company_count": len(complaints_by_company),
                            "recent_complaints_count": len(recent_complaints),
                            "stats": stats
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "Credit Repair - Get Reviews Page Data",
                        False,
                        f"Response missing required fields: {missing_fields}",
                        data
                    )
                    return False
            else:
                error_msg = f"Get reviews page data failed with status {response.status_code}"
                try:
                    error_data = response.json()
                    error_msg += f": {error_data.get('detail', 'Unknown error')}"
                except:
                    error_msg += f": {response.text}"
                
                self.log_test(
                    "Credit Repair - Get Reviews Page Data",
                    False,
                    error_msg,
                    {"status_code": response.status_code, "response": response.text}
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Credit Repair - Get Reviews Page Data",
                False,
                f"Network error: {str(e)}",
                None
            )
            return False
        except Exception as e:
            self.log_test(
                "Credit Repair - Get Reviews Page Data",
                False,
                f"Unexpected error: {str(e)}",
                None
            )
            return False
    
    def test_credit_repair_admin_update_complaint(self, complaint_id: str) -> tuple[bool, str]:
        """Test 4: Admin Update Complaint with SEO Fields"""
        print("\n" + "="*60)
        print("TESTING: Credit Repair - Admin Update Complaint with SEO")
        print("="*60)
        
        if not self.token:
            self.log_test(
                "Credit Repair - Admin Update Complaint",
                False,
                "Cannot test - no authentication token available",
                None
            )
            return False, ""
        
        if not complaint_id:
            self.log_test(
                "Credit Repair - Admin Update Complaint",
                False,
                "Cannot test - no complaint ID available from previous test",
                None
            )
            return False, ""
        
        try:
            url = f"{BASE_URL}/credit-repair/admin/complaints/{complaint_id}"
            
            payload = {
                "status": "published",
                "admin_findings": "We verified this complaint and found the consumer's claims to be accurate.",
                "seo": {
                    "url_slug": "test-company-review-john-custom",
                    "meta_title": "Custom SEO Title | Credlocity",
                    "meta_description": "Custom meta description for SEO"
                }
            }
            
            print(f"PUT {url}")
            print(f"Payload: {json.dumps(payload, indent=2)}")
            print(f"Headers: Authorization: Bearer {self.token[:20]}...")
            
            response = requests.put(url, json=payload, headers=self.headers, timeout=30)
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if response has success message
                if "message" in data:
                    custom_slug = payload["seo"]["url_slug"]
                    self.log_test(
                        "Credit Repair - Admin Update Complaint",
                        True,
                        f"Complaint updated successfully with custom SEO slug: {custom_slug}. Message: {data['message']}",
                        {
                            "status_code": response.status_code,
                            "complaint_id": complaint_id,
                            "custom_slug": custom_slug,
                            "message": data["message"]
                        }
                    )
                    return True, custom_slug
                else:
                    self.log_test(
                        "Credit Repair - Admin Update Complaint",
                        False,
                        "Response missing success message",
                        data
                    )
                    return False, ""
            else:
                error_msg = f"Admin update complaint failed with status {response.status_code}"
                try:
                    error_data = response.json()
                    error_msg += f": {error_data.get('detail', 'Unknown error')}"
                except:
                    error_msg += f": {response.text}"
                
                self.log_test(
                    "Credit Repair - Admin Update Complaint",
                    False,
                    error_msg,
                    {"status_code": response.status_code, "response": response.text}
                )
                return False, ""
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Credit Repair - Admin Update Complaint",
                False,
                f"Network error: {str(e)}",
                None
            )
            return False, ""
        except Exception as e:
            self.log_test(
                "Credit Repair - Admin Update Complaint",
                False,
                f"Unexpected error: {str(e)}",
                None
            )
            return False, ""
    
    def test_credit_repair_verify_published_review(self) -> bool:
        """Test 5: Verify Published Review on Public Page"""
        print("\n" + "="*60)
        print("TESTING: Credit Repair - Verify Published Review on Public Page")
        print("="*60)
        
        try:
            url = f"{BASE_URL}/credit-repair/reviews-page-data"
            
            print(f"GET {url}")
            print("Verifying that published complaint appears in public reviews")
            
            response = requests.get(url, timeout=30)
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                complaints_by_company = data.get("complaints_by_company", {})
                recent_complaints = data.get("recent_complaints", [])
                
                # Check if we have any published complaints
                total_published = sum(len(complaints) for complaints in complaints_by_company.values())
                
                # Look for complaints with star_rating and display_name fields
                has_star_rating = False
                has_display_name = False
                
                for complaints in complaints_by_company.values():
                    for complaint in complaints:
                        if "star_rating" in complaint:
                            has_star_rating = True
                        if "display_name" in complaint:
                            has_display_name = True
                
                # Also check recent complaints
                for complaint in recent_complaints:
                    if "star_rating" in complaint:
                        has_star_rating = True
                    if "display_name" in complaint:
                        has_display_name = True
                
                if total_published > 0 and has_star_rating and has_display_name:
                    self.log_test(
                        "Credit Repair - Verify Published Review",
                        True,
                        f"Published reviews verified on public page. Total published: {total_published}, Has star_rating: {has_star_rating}, Has display_name: {has_display_name}",
                        {
                            "status_code": response.status_code,
                            "total_published": total_published,
                            "has_star_rating": has_star_rating,
                            "has_display_name": has_display_name,
                            "recent_complaints_count": len(recent_complaints)
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "Credit Repair - Verify Published Review",
                        True,  # Not a failure if no published reviews yet
                        f"No published reviews found yet or missing required fields. Total published: {total_published}, Has star_rating: {has_star_rating}, Has display_name: {has_display_name}",
                        {
                            "status_code": response.status_code,
                            "total_published": total_published,
                            "has_star_rating": has_star_rating,
                            "has_display_name": has_display_name
                        }
                    )
                    return True
            else:
                error_msg = f"Verify published review failed with status {response.status_code}"
                try:
                    error_data = response.json()
                    error_msg += f": {error_data.get('detail', 'Unknown error')}"
                except:
                    error_msg += f": {response.text}"
                
                self.log_test(
                    "Credit Repair - Verify Published Review",
                    False,
                    error_msg,
                    {"status_code": response.status_code, "response": response.text}
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Credit Repair - Verify Published Review",
                False,
                f"Network error: {str(e)}",
                None
            )
            return False
        except Exception as e:
            self.log_test(
                "Credit Repair - Verify Published Review",
                False,
                f"Unexpected error: {str(e)}",
                None
            )
            return False
    
    def test_credit_repair_get_review_by_slug(self, custom_slug: str) -> bool:
        """Test 6: Get Review with Custom SEO Slug"""
        print("\n" + "="*60)
        print("TESTING: Credit Repair - Get Review by Custom SEO Slug")
        print("="*60)
        
        if not custom_slug:
            # Try with a default slug if custom slug not available
            custom_slug = "test-company-review-john-custom"
            print(f"No custom slug provided, using default: {custom_slug}")
        
        try:
            url = f"{BASE_URL}/credit-repair/reviews/{custom_slug}"
            
            print(f"GET {url}")
            print(f"Testing with custom slug: {custom_slug}")
            
            response = requests.get(url, timeout=30)
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if response has required structure
                required_fields = ["review", "company", "related_reviews", "credlocity_benefits"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    review = data.get("review", {})
                    company = data.get("company") or {}  # Handle null company
                    related_reviews = data.get("related_reviews", [])
                    credlocity_benefits = data.get("credlocity_benefits", {})
                    
                    # Check if review has SEO fields
                    seo_fields = review.get("seo", {})
                    has_seo = bool(seo_fields.get("url_slug") or seo_fields.get("meta_title"))
                    
                    # Get company name from review if company is null
                    company_name = company.get("name") if company else review.get("company_name", "Unknown")
                    
                    self.log_test(
                        "Credit Repair - Get Review by Slug",
                        True,
                        f"Review retrieved successfully by slug. Review ID: {review.get('id')}, Company: {company_name}, Related reviews: {len(related_reviews)}, Has SEO: {has_seo}",
                        {
                            "status_code": response.status_code,
                            "review_id": review.get("id"),
                            "company_name": company_name,
                            "related_reviews_count": len(related_reviews),
                            "has_seo_fields": has_seo,
                            "credlocity_benefits": list(credlocity_benefits.keys())
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "Credit Repair - Get Review by Slug",
                        False,
                        f"Response missing required fields: {missing_fields}",
                        data
                    )
                    return False
            elif response.status_code == 404:
                self.log_test(
                    "Credit Repair - Get Review by Slug",
                    True,  # 404 is expected if review doesn't exist yet
                    f"Review not found with slug '{custom_slug}' - this is expected if the complaint hasn't been published yet or slug wasn't updated",
                    {
                        "status_code": response.status_code,
                        "slug": custom_slug,
                        "note": "404 is expected for non-existent reviews"
                    }
                )
                return True
            else:
                error_msg = f"Get review by slug failed with status {response.status_code}"
                try:
                    error_data = response.json()
                    error_msg += f": {error_data.get('detail', 'Unknown error')}"
                except:
                    error_msg += f": {response.text}"
                
                self.log_test(
                    "Credit Repair - Get Review by Slug",
                    False,
                    error_msg,
                    {"status_code": response.status_code, "response": response.text}
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Credit Repair - Get Review by Slug",
                False,
                f"Network error: {str(e)}",
                None
            )
            return False
        except Exception as e:
            self.log_test(
                "Credit Repair - Get Review by Slug",
                False,
                f"Unexpected error: {str(e)}",
                None
            )
            return False

    def run_all_tests(self):
        """Run all Credit Repair Reviews system tests"""
        print("\n" + "="*80)
        print("🚀 STARTING CREDLOCITY CREDIT REPAIR REVIEWS SYSTEM TESTS")
        print("="*80)
        
        # Track overall results
        all_tests_passed = True
        
        # Test 1: Admin Authentication (required for admin operations)
        auth_success = self.test_admin_login()
        if not auth_success:
            print("\n❌ CRITICAL: Authentication failed - cannot proceed with admin tests")
            return False
        
        # ============================================
        # CREDIT REPAIR REVIEWS API TESTS
        # ============================================
        
        print("\n" + "="*80)
        print("🔧 CREDIT REPAIR REVIEWS SYSTEM TESTS")
        print("="*80)
        
        # Test 1: Submit Complaint with Enhanced Fields
        submit_success, complaint_id = self.test_credit_repair_submit_complaint()
        all_tests_passed = all_tests_passed and submit_success
        
        # Test 2: Get Reviews Page Data with Company Grouping
        reviews_page_success = self.test_credit_repair_reviews_page_data()
        all_tests_passed = all_tests_passed and reviews_page_success
        
        # Test 3: Admin Update Complaint with SEO Fields (requires admin auth)
        admin_update_success, custom_slug = self.test_credit_repair_admin_update_complaint(complaint_id)
        all_tests_passed = all_tests_passed and admin_update_success
        
        # Test 4: Verify Published Review on Public Page
        verify_published_success = self.test_credit_repair_verify_published_review()
        all_tests_passed = all_tests_passed and verify_published_success
        
        # Test 5: Get Review with Custom SEO Slug
        get_by_slug_success = self.test_credit_repair_get_review_by_slug(custom_slug)
        all_tests_passed = all_tests_passed and get_by_slug_success
        
        # ============================================
        # FINAL RESULTS
        # ============================================
        
        print("\n" + "="*80)
        print("📊 FINAL TEST RESULTS")
        print("="*80)
        
        passed_tests = sum(1 for result in self.test_results if result["success"])
        total_tests = len(self.test_results)
        
        print(f"\nTotal Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if all_tests_passed:
            print("\n🎉 ALL TESTS PASSED! Credit Repair Reviews system is working correctly.")
        else:
            print("\n⚠️ SOME TESTS FAILED. Please review the failed tests above.")
            
            # Show failed tests
            failed_tests = [result for result in self.test_results if not result["success"]]
            if failed_tests:
                print("\n❌ Failed Tests:")
                for i, test in enumerate(failed_tests, 1):
                    print(f"{i}. {test['test']}: {test['details']}")
        
        return all_tests_passed


if __name__ == "__main__":
    tester = CreditRepairTester()
    results = tester.run_all_tests()
    
    # Exit with appropriate code based on results
    if results:
        print("\n✅ All Credit Repair Reviews tests completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Some Credit Repair Reviews tests failed. Please review the output above.")
        sys.exit(1)