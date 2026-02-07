import requests
import sys
import json
from datetime import datetime

class WeddingGiftsAPITester:
    def __init__(self, base_url="https://mahar-collections.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.session_id = None
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   {method} {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if response.text:
                    try:
                        resp_data = response.json()
                        if isinstance(resp_data, list):
                            print(f"   Response: Array with {len(resp_data)} items")
                        elif isinstance(resp_data, dict) and len(resp_data) <= 3:
                            print(f"   Response: {resp_data}")
                    except:
                        print(f"   Response length: {len(response.text)}")
                return True, response.json() if response.text and response.text != '""' else {}
            else:
                self.failed_tests.append(f"{name} - Expected {expected_status}, got {response.status_code}")
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                if response.text:
                    print(f"   Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            self.failed_tests.append(f"{name} - Error: {str(e)}")
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test basic API health"""
        success, response = self.run_test(
            "API Health Check",
            "GET",
            "api/health",
            200
        )
        return success

    def test_admin_login(self):
        """Test admin login and store token"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "api/admin/login",
            200,
            data={"username": "aadishve", "password": "061097"}
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Token received: {self.token[:20]}...")
            return True
        return False

    def test_get_pots(self):
        """Test getting list of pots"""
        success, response = self.run_test(
            "Get Pots List",
            "GET",
            "api/pots",
            200
        )
        if success:
            print(f"   Found {len(response)} pots")
            return response
        return []

    def test_get_pot_detail(self, slug):
        """Test getting pot detail"""
        success, response = self.run_test(
            f"Get Pot Detail ({slug})",
            "GET",
            f"api/pots/{slug}",
            200
        )
        return success, response

    def test_get_contributors(self, slug):
        """Test getting contributors for a pot"""
        success, response = self.run_test(
            f"Get Contributors ({slug})",
            "GET",
            f"api/pots/{slug}/contributors",
            200
        )
        return success, response

    def test_create_session(self, pot_id):
        """Test creating a contribution session"""
        session_data = {
            "donor_name": "Test Donor",
            "donor_email": "test@example.com",
            "donor_phone": "+919876543210",
            "donor_message": "Best wishes for the couple",
            "allocations": [
                {
                    "pot_id": pot_id,
                    "amount_paise": 50000  # Rs 500
                }
            ],
            "cover_fees": True
        }
        
        success, response = self.run_test(
            "Create Session",
            "POST",
            "api/session/create-or-update",
            200,
            data=session_data
        )
        
        if success and 'session_id' in response:
            self.session_id = response['session_id']
            print(f"   Session created: {self.session_id}")
            return True
        return False

    def test_get_session_status(self):
        """Test getting session status"""
        if not self.session_id:
            print("❌ No session ID available")
            return False
            
        success, response = self.run_test(
            "Get Session Status",
            "GET",
            f"api/session/{self.session_id}",
            200
        )
        return success

    def test_create_razorpay_order(self):
        """Test creating Razorpay order"""
        if not self.session_id:
            print("❌ No session ID available")
            return False
            
        success, response = self.run_test(
            "Create Razorpay Order",
            "POST",
            "api/razorpay/order/create",
            200,
            data={"session_id": self.session_id}
        )
        return success

    def test_admin_dashboard(self):
        """Test admin dashboard"""
        if not self.token:
            print("❌ No admin token available")
            return False
            
        success, response = self.run_test(
            "Admin Dashboard",
            "GET",
            "api/admin/dashboard",
            200
        )
        return success

    def test_admin_contributions(self):
        """Test admin contributions list"""
        if not self.token:
            print("❌ No admin token available")
            return False
            
        success, response = self.run_test(
            "Admin Contributions",
            "GET",
            "api/admin/contributions",
            200
        )
        return success

    def test_admin_contributions_export(self):
        """Test admin contributions export"""
        if not self.token:
            print("❌ No admin token available")
            return False
            
        success, response = self.run_test(
            "Admin Contributions Export",
            "GET",
            "api/admin/contributions/export",
            200
        )
        return success

def main():
    print("🎉 Starting Wedding Gifts API Testing")
    print("=" * 50)
    
    tester = WeddingGiftsAPITester()
    
    # Test basic connectivity
    if not tester.test_health_check():
        print("❌ Health check failed, stopping tests")
        return 1
    
    # Test public endpoints
    pots = tester.test_get_pots()
    
    if pots:
        # Test pot details for each pot
        for pot in pots[:3]:  # Test first 3 pots
            slug = pot.get('slug')
            if slug:
                tester.test_get_pot_detail(slug)
                tester.test_get_contributors(slug)
    
    # Test admin endpoints
    if tester.test_admin_login():
        tester.test_admin_dashboard()
        tester.test_admin_contributions()
        tester.test_admin_contributions_export()
    
    # Test session creation (need actual pot ID)
    if pots and len(pots) > 0:
        # Update session data with actual pot ID
        pot_id = pots[0].get('id')
        if pot_id:
            if tester.test_create_session(pot_id):
                tester.test_get_session_status()
                tester.test_create_razorpay_order()
    
    # Print final results
    print(f"\n📊 Test Results:")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    if tester.failed_tests:
        print(f"\n❌ Failed tests:")
        for failed in tester.failed_tests:
            print(f"  - {failed}")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"Success rate: {success_rate:.1f}%")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())