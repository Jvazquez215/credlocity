#!/usr/bin/env python3
"""
Phase 1: Client Review System API Tests
Tests the backend APIs for client review link generation, validation, submission, and approval workflow.
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

class ClientReviewTester:
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
                
                if "access_token" in data and "token_type" in data:
                    self.token = data["access_token"]
                    self.headers["Authorization"] = f"Bearer {self.token}"
                    
                    self.log_test(
                        "Admin Authentication API",
                        True,
                        f"Login successful. Token received.",
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
    
    def test_client_review_generate_link(self) -> tuple[bool, dict]:
        """TEST 1: Generate Review Link"""
        print("\n" + "="*60)
        print("TESTING: Client Review API - Generate Review Link")
        print("="*60)
        
        try:
            url = f"{BASE_URL}/client-reviews/generate-link"
            payload = {
                "client_id": "test-client-123",
                "client_name": "John Smith",
                "client_email": "john.smith@example.com",
                "client_phone": "+1-555-123-4567",
                "expires_days": 30
            }
            
            print(f"POST {url}")
            print(f"Payload: {json.dumps(payload, indent=2)}")
            
            response = requests.post(url, json=payload, headers=self.headers, timeout=30)
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                if data.get("success") and data.get("link"):
                    link_data = data["link"]
                    required_fields = ["id", "token", "link_url", "client_name", "expires_at", "status"]
                    missing_fields = [field for field in required_fields if field not in link_data]
                    
                    if not missing_fields:
                        # Verify token format (should be URL-safe)
                        token = link_data["token"]
                        if len(token) > 30 and token.replace("-", "").replace("_", "").isalnum():
                            self.log_test(
                                "Client Review API - Generate Review Link",
                                True,
                                f"✅ Successfully generated review link. Token: {token[:10]}..., URL: {link_data['link_url'][:50]}...",
                                {
                                    "status_code": response.status_code,
                                    "link_id": link_data["id"],
                                    "token_length": len(token),
                                    "expires_at": link_data["expires_at"],
                                    "client_name": link_data["client_name"]
                                }
                            )
                            return True, link_data
                        else:
                            self.log_test(
                                "Client Review API - Generate Review Link",
                                False,
                                f"❌ Invalid token format: {token}",
                                data
                            )
                            return False, {}
                    else:
                        self.log_test(
                            "Client Review API - Generate Review Link",
                            False,
                            f"❌ Missing required fields in link data: {missing_fields}",
                            data
                        )
                        return False, {}
                else:
                    self.log_test(
                        "Client Review API - Generate Review Link",
                        False,
                        "❌ Response missing 'success' or 'link' fields",
                        data
                    )
                    return False, {}
            else:
                error_msg = f"❌ Generate link failed with status {response.status_code}"
                try:
                    error_data = response.json()
                    error_msg += f": {error_data.get('detail', 'Unknown error')}"
                except:
                    error_msg += f": {response.text}"
                
                self.log_test(
                    "Client Review API - Generate Review Link",
                    False,
                    error_msg,
                    {"status_code": response.status_code, "response": response.text}
                )
                return False, {}
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Client Review API - Generate Review Link",
                False,
                f"❌ Network error: {str(e)}",
                None
            )
            return False, {}
        except Exception as e:
            self.log_test(
                "Client Review API - Generate Review Link",
                False,
                f"❌ Unexpected error: {str(e)}",
                None
            )
            return False, {}
    
    def test_client_review_validate_link(self, link_data: dict) -> bool:
        """TEST 2: Validate Review Link"""
        print("\n" + "="*60)
        print("TESTING: Client Review API - Validate Review Link")
        print("="*60)
        
        if not link_data or not link_data.get("token"):
            self.log_test(
                "Client Review API - Validate Review Link",
                False,
                "❌ Cannot test - no token available from generate link test",
                None
            )
            return False
        
        try:
            token = link_data["token"]
            url = f"{BASE_URL}/client-reviews/validate-link/{token}"
            
            print(f"GET {url}")
            print(f"Validating token: {token[:10]}...")
            
            response = requests.get(url, timeout=30)
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if valid
                if data.get("valid"):
                    required_fields = ["link_id", "client_name", "expires_at"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        # Verify client name matches
                        expected_name = link_data.get("client_name", "")
                        actual_name = data.get("client_name", "")
                        
                        if expected_name == actual_name:
                            self.log_test(
                                "Client Review API - Validate Review Link",
                                True,
                                f"✅ Successfully validated review link. Client: {actual_name}, View count incremented.",
                                {
                                    "status_code": response.status_code,
                                    "valid": True,
                                    "link_id": data["link_id"],
                                    "client_name": actual_name,
                                    "expires_at": data["expires_at"]
                                }
                            )
                            return True
                        else:
                            self.log_test(
                                "Client Review API - Validate Review Link",
                                False,
                                f"❌ Client name mismatch: expected '{expected_name}', got '{actual_name}'",
                                data
                            )
                            return False
                    else:
                        self.log_test(
                            "Client Review API - Validate Review Link",
                            False,
                            f"❌ Missing required fields: {missing_fields}",
                            data
                        )
                        return False
                else:
                    # Check error type
                    error_type = data.get("error", "unknown")
                    message = data.get("message", "No message")
                    
                    self.log_test(
                        "Client Review API - Validate Review Link",
                        False,
                        f"❌ Link validation failed: {error_type} - {message}",
                        data
                    )
                    return False
            else:
                error_msg = f"❌ Validate link failed with status {response.status_code}"
                try:
                    error_data = response.json()
                    error_msg += f": {error_data.get('detail', 'Unknown error')}"
                except:
                    error_msg += f": {response.text}"
                
                self.log_test(
                    "Client Review API - Validate Review Link",
                    False,
                    error_msg,
                    {"status_code": response.status_code, "response": response.text}
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Client Review API - Validate Review Link",
                False,
                f"❌ Network error: {str(e)}",
                None
            )
            return False
        except Exception as e:
            self.log_test(
                "Client Review API - Validate Review Link",
                False,
                f"❌ Unexpected error: {str(e)}",
                None
            )
            return False
    
    def test_client_review_search_attorneys(self) -> tuple[bool, list]:
        """TEST 3: Search Attorneys"""
        print("\n" + "="*60)
        print("TESTING: Client Review API - Search Attorneys")
        print("="*60)
        
        try:
            url = f"{BASE_URL}/client-reviews/search-attorneys"
            params = {"q": "attorney", "limit": 10}
            
            print(f"GET {url}")
            print(f"Params: {params}")
            
            response = requests.get(url, params=params, timeout=30)
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                if "attorneys" in data and "total" in data:
                    attorneys = data["attorneys"]
                    total = data["total"]
                    
                    if isinstance(attorneys, list):
                        # Check if we have the test attorney
                        test_attorney_found = False
                        for attorney in attorneys:
                            if attorney.get("id") == "7ead579d-d978-4d5b-88e7-6f68f0544f06":
                                test_attorney_found = True
                                break
                        
                        self.log_test(
                            "Client Review API - Search Attorneys",
                            True,
                            f"✅ Successfully searched attorneys. Found {total} attorneys. Test attorney {'found' if test_attorney_found else 'not found'}.",
                            {
                                "status_code": response.status_code,
                                "total_attorneys": total,
                                "returned_count": len(attorneys),
                                "test_attorney_found": test_attorney_found,
                                "sample_attorney": attorneys[0] if attorneys else None
                            }
                        )
                        return True, attorneys
                    else:
                        self.log_test(
                            "Client Review API - Search Attorneys",
                            False,
                            f"❌ Expected attorneys to be a list, got {type(attorneys)}",
                            data
                        )
                        return False, []
                else:
                    self.log_test(
                        "Client Review API - Search Attorneys",
                        False,
                        "❌ Response missing 'attorneys' or 'total' fields",
                        data
                    )
                    return False, []
            else:
                error_msg = f"❌ Search attorneys failed with status {response.status_code}"
                try:
                    error_data = response.json()
                    error_msg += f": {error_data.get('detail', 'Unknown error')}"
                except:
                    error_msg += f": {response.text}"
                
                self.log_test(
                    "Client Review API - Search Attorneys",
                    False,
                    error_msg,
                    {"status_code": response.status_code, "response": response.text}
                )
                return False, []
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Client Review API - Search Attorneys",
                False,
                f"❌ Network error: {str(e)}",
                None
            )
            return False, []
        except Exception as e:
            self.log_test(
                "Client Review API - Search Attorneys",
                False,
                f"❌ Unexpected error: {str(e)}",
                None
            )
            return False, []
    
    def test_client_review_submit_via_link(self, link_data: dict, attorneys: list) -> tuple[bool, str]:
        """TEST 4: Submit Review via Link"""
        print("\n" + "="*60)
        print("TESTING: Client Review API - Submit Review via Link")
        print("="*60)
        
        if not link_data or not link_data.get("token"):
            self.log_test(
                "Client Review API - Submit Review via Link",
                False,
                "❌ Cannot test - no token available from generate link test",
                None
            )
            return False, ""
        
        try:
            token = link_data["token"]
            url = f"{BASE_URL}/client-reviews/submit/{token}"
            
            # Use test attorney if available
            selected_attorney = None
            if attorneys:
                for attorney in attorneys:
                    if attorney.get("id") == "7ead579d-d978-4d5b-88e7-6f68f0544f06":
                        selected_attorney = attorney
                        break
                if not selected_attorney and attorneys:
                    selected_attorney = attorneys[0]
            
            payload = {
                "client_name": "John Smith",
                "client_email": "john.smith@example.com",
                "client_phone": "+1-555-123-4567",
                "client_city": "Los Angeles",
                "client_state": "CA",
                "before_score": 580,
                "after_score": 720,
                "rating": 5,
                "testimonial_text": "Credlocity helped me improve my credit score by 140 points! Their team was professional and knowledgeable.",
                "full_story": "I was struggling with poor credit due to some financial mistakes in my past. Credlocity's team worked with me to dispute inaccurate items and helped me understand how to build better credit habits.",
                "social_links": {
                    "facebook": "https://facebook.com/johnsmith",
                    "instagram": "@johnsmith_la",
                    "linkedin": "https://linkedin.com/in/johnsmith"
                },
                "helped_with_lawsuit": bool(selected_attorney),
                "selected_attorney_id": selected_attorney.get("id") if selected_attorney else None,
                "selected_attorney_name": selected_attorney.get("full_name") if selected_attorney else None,
                "defendant_name": "Equifax" if selected_attorney else None,
                "settlement_amount": 5000.0 if selected_attorney else None,
                "case_type": "FCRA Violation" if selected_attorney else None,
                "consent_to_publish": True,
                "consent_to_contact": True
            }
            
            print(f"POST {url}")
            print(f"Submitting review for token: {token[:10]}...")
            print(f"Attorney linking: {'Yes' if selected_attorney else 'No'}")
            if selected_attorney:
                print(f"Selected attorney: {selected_attorney.get('full_name')} ({selected_attorney.get('id')})")
            
            response = requests.post(url, json=payload, headers=self.headers, timeout=30)
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("success") and data.get("review_id"):
                    review_id = data["review_id"]
                    message = data.get("message", "")
                    
                    # Verify the message mentions approval
                    if "approval" in message.lower():
                        self.log_test(
                            "Client Review API - Submit Review via Link",
                            True,
                            f"✅ Successfully submitted review via link. Review ID: {review_id}. Status: pending approval. Attorney linked: {'Yes' if selected_attorney else 'No'}.",
                            {
                                "status_code": response.status_code,
                                "review_id": review_id,
                                "message": message,
                                "attorney_linked": bool(selected_attorney),
                                "attorney_id": selected_attorney.get("id") if selected_attorney else None
                            }
                        )
                        return True, review_id
                    else:
                        self.log_test(
                            "Client Review API - Submit Review via Link",
                            False,
                            f"❌ Review submitted but message doesn't mention approval: {message}",
                            data
                        )
                        return False, ""
                else:
                    self.log_test(
                        "Client Review API - Submit Review via Link",
                        False,
                        "❌ Response missing 'success' or 'review_id' fields",
                        data
                    )
                    return False, ""
            else:
                error_msg = f"❌ Submit review failed with status {response.status_code}"
                try:
                    error_data = response.json()
                    error_msg += f": {error_data.get('detail', 'Unknown error')}"
                except:
                    error_msg += f": {response.text}"
                
                self.log_test(
                    "Client Review API - Submit Review via Link",
                    False,
                    error_msg,
                    {"status_code": response.status_code, "response": response.text}
                )
                return False, ""
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Client Review API - Submit Review via Link",
                False,
                f"❌ Network error: {str(e)}",
                None
            )
            return False, ""
        except Exception as e:
            self.log_test(
                "Client Review API - Submit Review via Link",
                False,
                f"❌ Unexpected error: {str(e)}",
                None
            )
            return False, ""
    
    def test_client_review_submit_public(self, attorneys: list) -> tuple[bool, str]:
        """TEST 5: Submit Public Review"""
        print("\n" + "="*60)
        print("TESTING: Client Review API - Submit Public Review")
        print("="*60)
        
        try:
            url = f"{BASE_URL}/client-reviews/submit-public"
            
            # Use test attorney if available
            selected_attorney = None
            if attorneys:
                for attorney in attorneys:
                    if attorney.get("id") == "7ead579d-d978-4d5b-88e7-6f68f0544f06":
                        selected_attorney = attorney
                        break
                if not selected_attorney and attorneys:
                    selected_attorney = attorneys[0]
            
            payload = {
                "client_name": "Sarah Johnson",
                "client_email": "sarah.johnson@example.com",
                "client_city": "Miami",
                "client_state": "FL",
                "before_score": 520,
                "after_score": 680,
                "rating": 5,
                "testimonial_text": "Amazing service! Credlocity helped me clean up my credit report and improve my score significantly.",
                "social_links": {
                    "twitter": "@sarahj_miami",
                    "tiktok": "@sarahcredit"
                },
                "helped_with_lawsuit": bool(selected_attorney),
                "selected_attorney_id": selected_attorney.get("id") if selected_attorney else None,
                "selected_attorney_name": selected_attorney.get("full_name") if selected_attorney else None,
                "consent_to_publish": True,
                "consent_to_contact": True
            }
            
            print(f"POST {url}")
            print(f"Submitting public review for: {payload['client_name']}")
            print(f"Attorney linking: {'Yes' if selected_attorney else 'No'}")
            
            response = requests.post(url, json=payload, headers=self.headers, timeout=30)
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("success") and data.get("review_id"):
                    review_id = data["review_id"]
                    message = data.get("message", "")
                    
                    self.log_test(
                        "Client Review API - Submit Public Review",
                        True,
                        f"✅ Successfully submitted public review. Review ID: {review_id}. Status: pending approval.",
                        {
                            "status_code": response.status_code,
                            "review_id": review_id,
                            "message": message,
                            "attorney_linked": bool(selected_attorney)
                        }
                    )
                    return True, review_id
                else:
                    self.log_test(
                        "Client Review API - Submit Public Review",
                        False,
                        "❌ Response missing 'success' or 'review_id' fields",
                        data
                    )
                    return False, ""
            else:
                error_msg = f"❌ Submit public review failed with status {response.status_code}"
                try:
                    error_data = response.json()
                    error_msg += f": {error_data.get('detail', 'Unknown error')}"
                except:
                    error_msg += f": {response.text}"
                
                self.log_test(
                    "Client Review API - Submit Public Review",
                    False,
                    error_msg,
                    {"status_code": response.status_code, "response": response.text}
                )
                return False, ""
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Client Review API - Submit Public Review",
                False,
                f"❌ Network error: {str(e)}",
                None
            )
            return False, ""
        except Exception as e:
            self.log_test(
                "Client Review API - Submit Public Review",
                False,
                f"❌ Unexpected error: {str(e)}",
                None
            )
            return False, ""
    
    def test_client_review_pending_approval(self) -> tuple[bool, list]:
        """TEST 6: Get Pending Reviews"""
        print("\n" + "="*60)
        print("TESTING: Client Review API - Get Pending Reviews")
        print("="*60)
        
        try:
            url = f"{BASE_URL}/client-reviews/pending-approval"
            
            print(f"GET {url}")
            
            response = requests.get(url, headers=self.headers, timeout=30)
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                if "reviews" in data and "total" in data:
                    reviews = data["reviews"]
                    total = data["total"]
                    pending_count = data.get("pending_count", total)
                    
                    if isinstance(reviews, list):
                        # Check if our test reviews are in the pending list
                        test_reviews_found = 0
                        for review in reviews:
                            if review.get("client_name") in ["John Smith", "Sarah Johnson"]:
                                test_reviews_found += 1
                        
                        self.log_test(
                            "Client Review API - Get Pending Reviews",
                            True,
                            f"✅ Successfully retrieved pending reviews. Total: {total}, Pending: {pending_count}. Test reviews found: {test_reviews_found}.",
                            {
                                "status_code": response.status_code,
                                "total_reviews": total,
                                "pending_count": pending_count,
                                "returned_count": len(reviews),
                                "test_reviews_found": test_reviews_found
                            }
                        )
                        return True, reviews
                    else:
                        self.log_test(
                            "Client Review API - Get Pending Reviews",
                            False,
                            f"❌ Expected reviews to be a list, got {type(reviews)}",
                            data
                        )
                        return False, []
                else:
                    self.log_test(
                        "Client Review API - Get Pending Reviews",
                        False,
                        "❌ Response missing 'reviews' or 'total' fields",
                        data
                    )
                    return False, []
            else:
                error_msg = f"❌ Get pending reviews failed with status {response.status_code}"
                try:
                    error_data = response.json()
                    error_msg += f": {error_data.get('detail', 'Unknown error')}"
                except:
                    error_msg += f": {response.text}"
                
                self.log_test(
                    "Client Review API - Get Pending Reviews",
                    False,
                    error_msg,
                    {"status_code": response.status_code, "response": response.text}
                )
                return False, []
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Client Review API - Get Pending Reviews",
                False,
                f"❌ Network error: {str(e)}",
                None
            )
            return False, []
        except Exception as e:
            self.log_test(
                "Client Review API - Get Pending Reviews",
                False,
                f"❌ Unexpected error: {str(e)}",
                None
            )
            return False, []
    
    def test_client_review_approve(self, pending_reviews: list) -> bool:
        """TEST 7: Approve Review"""
        print("\n" + "="*60)
        print("TESTING: Client Review API - Approve Review")
        print("="*60)
        
        if not pending_reviews:
            self.log_test(
                "Client Review API - Approve Review",
                False,
                "❌ Cannot test - no pending reviews available",
                None
            )
            return False
        
        try:
            # Find a test review to approve
            test_review = None
            for review in pending_reviews:
                if review.get("client_name") in ["John Smith", "Sarah Johnson"]:
                    test_review = review
                    break
            
            if not test_review:
                test_review = pending_reviews[0]  # Use first available review
            
            review_id = test_review["id"]
            client_name = test_review.get("client_name", "Unknown")
            
            url = f"{BASE_URL}/client-reviews/approve/{review_id}"
            payload = {
                "status": "approved",
                "admin_notes": "Test approval - review looks good",
                "publish_immediately": True
            }
            
            print(f"PUT {url}")
            print(f"Approving review for: {client_name} (ID: {review_id})")
            print(f"Payload: {json.dumps(payload, indent=2)}")
            
            response = requests.put(url, json=payload, headers=self.headers, timeout=30)
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("success") and data.get("review_id"):
                    message = data.get("message", "")
                    
                    self.log_test(
                        "Client Review API - Approve Review",
                        True,
                        f"✅ Successfully approved review for {client_name}. Message: {message}. show_on_success_stories should be set to true.",
                        {
                            "status_code": response.status_code,
                            "review_id": review_id,
                            "client_name": client_name,
                            "message": message,
                            "status": "approved"
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "Client Review API - Approve Review",
                        False,
                        "❌ Response missing 'success' or 'review_id' fields",
                        data
                    )
                    return False
            else:
                error_msg = f"❌ Approve review failed with status {response.status_code}"
                try:
                    error_data = response.json()
                    error_msg += f": {error_data.get('detail', 'Unknown error')}"
                except:
                    error_msg += f": {response.text}"
                
                self.log_test(
                    "Client Review API - Approve Review",
                    False,
                    error_msg,
                    {"status_code": response.status_code, "response": response.text}
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Client Review API - Approve Review",
                False,
                f"❌ Network error: {str(e)}",
                None
            )
            return False
        except Exception as e:
            self.log_test(
                "Client Review API - Approve Review",
                False,
                f"❌ Unexpected error: {str(e)}",
                None
            )
            return False
    
    def test_client_review_stats(self) -> bool:
        """TEST 8: Get Review Stats"""
        print("\n" + "="*60)
        print("TESTING: Client Review API - Get Review Stats")
        print("="*60)
        
        try:
            url = f"{BASE_URL}/client-reviews/stats"
            
            print(f"GET {url}")
            
            response = requests.get(url, headers=self.headers, timeout=30)
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required stats fields
                required_fields = ["total_reviews", "pending_approval", "approved_reviews", "rejected_reviews"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    total = data["total_reviews"]
                    pending = data["pending_approval"]
                    approved = data["approved_reviews"]
                    rejected = data["rejected_reviews"]
                    
                    # Verify numbers make sense
                    if total >= 0 and pending >= 0 and approved >= 0 and rejected >= 0:
                        self.log_test(
                            "Client Review API - Get Review Stats",
                            True,
                            f"✅ Successfully retrieved review stats. Total: {total}, Pending: {pending}, Approved: {approved}, Rejected: {rejected}.",
                            {
                                "status_code": response.status_code,
                                "total_reviews": total,
                                "pending_approval": pending,
                                "approved_reviews": approved,
                                "rejected_reviews": rejected,
                                "reviews_with_video": data.get("reviews_with_video", 0),
                                "pending_links": data.get("pending_links", 0)
                            }
                        )
                        return True
                    else:
                        self.log_test(
                            "Client Review API - Get Review Stats",
                            False,
                            f"❌ Invalid stats values: total={total}, pending={pending}, approved={approved}, rejected={rejected}",
                            data
                        )
                        return False
                else:
                    self.log_test(
                        "Client Review API - Get Review Stats",
                        False,
                        f"❌ Missing required stats fields: {missing_fields}",
                        data
                    )
                    return False
            else:
                error_msg = f"❌ Get stats failed with status {response.status_code}"
                try:
                    error_data = response.json()
                    error_msg += f": {error_data.get('detail', 'Unknown error')}"
                except:
                    error_msg += f": {response.text}"
                
                self.log_test(
                    "Client Review API - Get Review Stats",
                    False,
                    error_msg,
                    {"status_code": response.status_code, "response": response.text}
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Client Review API - Get Review Stats",
                False,
                f"❌ Network error: {str(e)}",
                None
            )
            return False
        except Exception as e:
            self.log_test(
                "Client Review API - Get Review Stats",
                False,
                f"❌ Unexpected error: {str(e)}",
                None
            )
            return False
    
    def test_client_review_link_already_used(self, link_data: dict) -> bool:
        """TEST 9: Test Link Already Used Error"""
        print("\n" + "="*60)
        print("TESTING: Client Review API - Link Already Used Error")
        print("="*60)
        
        if not link_data or not link_data.get("token"):
            self.log_test(
                "Client Review API - Link Already Used Error",
                False,
                "❌ Cannot test - no token available from generate link test",
                None
            )
            return False
        
        try:
            token = link_data["token"]
            url = f"{BASE_URL}/client-reviews/submit/{token}"
            
            payload = {
                "client_name": "Test User",
                "rating": 5,
                "testimonial_text": "This should fail because link was already used",
                "consent_to_publish": True,
                "consent_to_contact": True
            }
            
            print(f"POST {url}")
            print(f"Attempting to reuse token: {token[:10]}...")
            
            response = requests.post(url, json=payload, headers=self.headers, timeout=30)
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 400:
                try:
                    error_data = response.json()
                    error_detail = error_data.get("detail", "").lower()
                    
                    if "already submitted" in error_detail or "already" in error_detail:
                        self.log_test(
                            "Client Review API - Link Already Used Error",
                            True,
                            f"✅ Correctly rejected reuse of link with error: {error_detail}",
                            {
                                "status_code": response.status_code,
                                "error_detail": error_detail,
                                "expected_behavior": "Link should be one-time use only"
                            }
                        )
                        return True
                    else:
                        self.log_test(
                            "Client Review API - Link Already Used Error",
                            False,
                            f"❌ Got 400 error but wrong message: {error_detail}",
                            error_data
                        )
                        return False
                except:
                    self.log_test(
                        "Client Review API - Link Already Used Error",
                        False,
                        f"❌ Got 400 error but couldn't parse response: {response.text}",
                        {"status_code": response.status_code, "response": response.text}
                    )
                    return False
            else:
                self.log_test(
                    "Client Review API - Link Already Used Error",
                    False,
                    f"❌ Expected 400 error for reused link, got {response.status_code}",
                    {"status_code": response.status_code, "response": response.text}
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Client Review API - Link Already Used Error",
                False,
                f"❌ Network error: {str(e)}",
                None
            )
            return False
        except Exception as e:
            self.log_test(
                "Client Review API - Link Already Used Error",
                False,
                f"❌ Unexpected error: {str(e)}",
                None
            )
            return False

    def run_all_tests(self):
        """Run all client review system tests"""
        print("\n" + "="*80)
        print("📝 PHASE 1: CLIENT REVIEW SYSTEM API TESTS")
        print("="*80)
        
        # Track overall results
        all_tests_passed = True
        
        # Test 0: Admin Authentication
        auth_success = self.test_admin_login()
        if not auth_success:
            print("\n❌ CRITICAL: Authentication failed - cannot proceed with authenticated tests")
            all_tests_passed = False
            return False
        
        # Test 1: Generate Review Link
        link_success, link_data = self.test_client_review_generate_link()
        if not link_success:
            all_tests_passed = False
        
        # Test 2: Validate Review Link
        if link_success and link_data:
            validate_success = self.test_client_review_validate_link(link_data)
            if not validate_success:
                all_tests_passed = False
        
        # Test 3: Search Attorneys
        attorneys_success, attorneys_data = self.test_client_review_search_attorneys()
        if not attorneys_success:
            all_tests_passed = False
        
        # Test 4: Submit Review via Link
        submit_link_review_id = ""
        if link_success and link_data:
            submit_link_success, submit_link_review_id = self.test_client_review_submit_via_link(link_data, attorneys_data)
            if not submit_link_success:
                all_tests_passed = False
        
        # Test 5: Submit Public Review
        submit_public_success, submit_public_review_id = self.test_client_review_submit_public(attorneys_data)
        if not submit_public_success:
            all_tests_passed = False
        
        # Test 6: Get Pending Reviews
        pending_success, pending_reviews = self.test_client_review_pending_approval()
        if not pending_success:
            all_tests_passed = False
        
        # Test 7: Approve Review
        if pending_success and pending_reviews:
            approve_success = self.test_client_review_approve(pending_reviews)
            if not approve_success:
                all_tests_passed = False
        
        # Test 8: Get Review Stats
        stats_success = self.test_client_review_stats()
        if not stats_success:
            all_tests_passed = False
        
        # Test 9: Test Link Already Used Error
        if link_success and link_data:
            already_used_success = self.test_client_review_link_already_used(link_data)
            if not already_used_success:
                all_tests_passed = False
        
        # ============================================
        # FINAL RESULTS
        # ============================================
        
        print("\n" + "="*80)
        print("📊 FINAL TEST RESULTS")
        print("="*80)
        
        # Count results
        passed_tests = sum(1 for result in self.test_results if result["success"])
        total_tests = len(self.test_results)
        
        print(f"\n✅ PASSED: {passed_tests}/{total_tests} tests")
        print(f"❌ FAILED: {total_tests - passed_tests}/{total_tests} tests")
        
        if all_tests_passed:
            print("\n🎉 ALL TESTS PASSED! Phase 1 Client Review System APIs are working correctly.")
        else:
            print("\n⚠️  SOME TESTS FAILED. Please review the detailed results above.")
            
            # Show failed tests
            failed_tests = [result for result in self.test_results if not result["success"]]
            if failed_tests:
                print("\n❌ FAILED TESTS:")
                for test in failed_tests:
                    print(f"   • {test['test']}: {test['details']}")
        
        print("\n" + "="*80)
        print("🏁 TESTING COMPLETE")
        print("="*80)
        
        return all_tests_passed


if __name__ == "__main__":
    tester = ClientReviewTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)