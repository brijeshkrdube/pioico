import requests
import sys
import json
from datetime import datetime

class PIOGoldAPITester:
    def __init__(self, base_url="https://pio-ico-launch.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_setup_done = False
        self.test_results = []

    def log_result(self, test_name, success, details="", expected_status=None, actual_status=None):
        """Log test result"""
        result = {
            "test_name": test_name,
            "success": success,
            "details": details,
            "expected_status": expected_status,
            "actual_status": actual_status,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        if success:
            print(f"✅ {test_name} - PASSED")
        else:
            print(f"❌ {test_name} - FAILED: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, description=""):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        if description:
            print(f"   Description: {description}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                try:
                    response_data = response.json()
                    self.log_result(name, True, f"Response: {json.dumps(response_data, indent=2)[:200]}", expected_status, response.status_code)
                    return True, response_data
                except:
                    response_data = response.text
                    self.log_result(name, True, f"Response: {response_data[:200]}", expected_status, response.status_code)
                    return True, response_data
            else:
                try:
                    error_data = response.json()
                    error_msg = f"Expected {expected_status}, got {response.status_code}. Response: {error_data}"
                except:
                    error_msg = f"Expected {expected_status}, got {response.status_code}. Response: {response.text[:100]}"
                
                self.log_result(name, False, error_msg, expected_status, response.status_code)
                return False, {}

        except requests.exceptions.RequestException as e:
            error_msg = f"Network error: {str(e)}"
            self.log_result(name, False, error_msg, expected_status, None)
            return False, {}
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            self.log_result(name, False, error_msg, expected_status, None)
            return False, {}

    def test_health(self):
        """Test health endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "health",
            200,
            description="Check API health and blockchain connections"
        )
        return success

    def test_public_settings(self):
        """Test public settings endpoint"""
        success, response = self.run_test(
            "Public Settings",
            "GET", 
            "settings/public",
            200,
            description="Get gold price and ICO settings"
        )
        if success:
            required_fields = ['gold_price_per_gram', 'ico_active', 'offers']
            for field in required_fields:
                if field not in response:
                    self.log_result("Public Settings - Field Check", False, f"Missing field: {field}")
                    return False
            print(f"   Gold Price: ${response.get('gold_price_per_gram', 'N/A')}")
            print(f"   ICO Active: {response.get('ico_active', 'N/A')}")
            print(f"   Offers: {len(response.get('offers', []))} active")
        return success

    def test_purchase_calculation(self):
        """Test purchase calculation endpoint"""
        test_amounts = [100, 500, 800]
        for amount in test_amounts:
            success, response = self.run_test(
                f"Calculate Purchase - ${amount}",
                "POST",
                "calculate-purchase",
                200,
                data={"usdt_amount": amount},
                description=f"Calculate PIO for ${amount} USDT"
            )
            if success:
                print(f"   ${amount} USDT = {response.get('total_pio', 'N/A')} PIO (Discount: {response.get('discount_percent', 0)}%)")
            if not success:
                return False
        return True

    def test_admin_setup(self):
        """Test admin setup (first time only)"""
        test_admin_data = {
            "username": "admin",
            "password": "AdminPass123!",
            "email": "admin@piogold.com"
        }
        
        success, response = self.run_test(
            "Admin Setup",
            "POST",
            "admin/setup",
            200,
            data=test_admin_data,
            description="Create first admin account"
        )
        
        if success:
            if 'access_token' in response:
                self.token = response['access_token']
                self.admin_setup_done = True
                print(f"   Admin created and authenticated")
                return True
        
        # If setup fails, try login (admin might already exist)
        return self.test_admin_login()

    def test_admin_login(self):
        """Test admin login"""
        login_data = {
            "username": "admin",
            "password": "AdminPass123!"
        }
        
        success, response = self.run_test(
            "Admin Login", 
            "POST",
            "admin/login",
            200,
            data=login_data,
            description="Authenticate admin user"
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Admin authenticated successfully")
            return True
        return False

    def test_admin_protected_endpoints(self):
        """Test admin-protected endpoints"""
        if not self.token:
            self.log_result("Admin Protected Endpoints", False, "No admin token available")
            return False
        
        # Test admin settings
        success1, _ = self.run_test(
            "Admin Settings Get",
            "GET",
            "admin/settings",
            200,
            description="Get admin settings (protected)"
        )
        
        # Test admin stats
        success2, _ = self.run_test(
            "Admin Stats",
            "GET", 
            "admin/stats",
            200,
            description="Get dashboard statistics (protected)"
        )
        
        # Test offers list
        success3, _ = self.run_test(
            "Admin Offers List",
            "GET",
            "admin/offers", 
            200,
            description="Get all offers (protected)"
        )
        
        return success1 and success2 and success3

    def test_user_registration(self):
        """Test user registration"""
        test_wallet = "0x742d35cc6451c532c5b5f3d5c8a3b8f9e34ad0d1"
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "users/register",
            200,
            data={"wallet_address": test_wallet},
            description="Register new user with wallet"
        )
        
        if success:
            print(f"   User ID: {response.get('id', 'N/A')}")
            print(f"   Referral Code: {response.get('referral_code', 'N/A')}")
            return response.get('id')
        return None

    def test_user_endpoints(self, user_wallet):
        """Test user-related endpoints"""
        if not user_wallet:
            return False
            
        # Test get user
        success1, _ = self.run_test(
            "Get User",
            "GET",
            f"users/{user_wallet}",
            200,
            description="Get user by wallet address"
        )
        
        # Test user orders
        success2, _ = self.run_test(
            "User Orders",
            "GET", 
            f"users/{user_wallet}/orders",
            200,
            description="Get user orders"
        )
        
        # Test user referrals
        success3, _ = self.run_test(
            "User Referrals",
            "GET",
            f"users/{user_wallet}/referrals", 
            200,
            description="Get user referrals"
        )
        
        return success1 and success2 and success3

    def test_order_creation(self):
        """Test order creation (will fail without valid tx)"""
        test_order_data = {
            "wallet_address": "0x742d35cc6451c532c5b5f3d5c8a3b8f9e34ad0d1",
            "usdt_amount": 100.0,
            "tx_hash": "0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef123456"
        }
        
        success, response = self.run_test(
            "Order Creation",
            "POST",
            "orders/create",
            200,
            data=test_order_data,
            description="Create purchase order (may fail due to invalid tx)"
        )
        
        return success

    def run_all_tests(self):
        """Run comprehensive API test suite"""
        print("🚀 Starting PIOGOLD API Test Suite\n")
        print("=" * 60)
        
        # Basic health checks
        print("\n📊 BASIC HEALTH CHECKS")
        print("-" * 30)
        health_ok = self.test_health()
        settings_ok = self.test_public_settings()
        calc_ok = self.test_purchase_calculation()
        
        # Admin functionality
        print("\n🔐 ADMIN FUNCTIONALITY")
        print("-" * 30)
        admin_ok = self.test_admin_setup()
        admin_protected_ok = self.test_admin_protected_endpoints() if admin_ok else False
        
        # User functionality 
        print("\n👤 USER FUNCTIONALITY")
        print("-" * 30)
        test_wallet = "0x742d35cc6451c532c5b5f3d5c8a3b8f9e34ad0d1"
        user_reg_id = self.test_user_registration()
        user_endpoints_ok = self.test_user_endpoints(test_wallet)
        
        # Order functionality (expected to have issues without real blockchain tx)
        print("\n💰 ORDER FUNCTIONALITY")
        print("-" * 30)
        order_ok = self.test_order_creation()
        
        # Summary
        print("\n" + "=" * 60)
        print("📋 TEST SUMMARY")
        print("=" * 60)
        print(f"Total tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        print("\n🎯 CRITICAL ENDPOINTS STATUS:")
        critical_tests = {
            "Health Check": health_ok,
            "Public Settings": settings_ok, 
            "Purchase Calculation": calc_ok,
            "Admin Setup/Login": admin_ok,
            "Admin Protected": admin_protected_ok,
            "User Registration": bool(user_reg_id),
            "User Endpoints": user_endpoints_ok
        }
        
        for test_name, status in critical_tests.items():
            status_icon = "✅" if status else "❌"
            print(f"   {status_icon} {test_name}")
        
        # Identify major issues
        failed_critical = sum(1 for status in critical_tests.values() if not status)
        if failed_critical >= len(critical_tests) * 0.5:
            print(f"\n⚠️  CRITICAL: {failed_critical}/{len(critical_tests)} core APIs failing")
            return 1
        
        print(f"\n🎉 Backend testing completed. {failed_critical} critical issues found.")
        return 0 if failed_critical == 0 else 1

if __name__ == "__main__":
    tester = PIOGoldAPITester()
    exit_code = tester.run_all_tests()
    
    # Save detailed results
    with open("/app/backend_test_results.json", "w") as f:
        json.dump(tester.test_results, f, indent=2)
    
    print(f"\n📄 Detailed results saved to /app/backend_test_results.json")
    sys.exit(exit_code)