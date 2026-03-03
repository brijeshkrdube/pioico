"""
Test cases for PIOGOLD ICO Platform - Whitepaper URL and New Sections Testing
Features tested:
- Admin login with credentials admin/adminpassword
- Settings API with whitepaper_url field
- Public settings endpoint returns whitepaper_url
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://pio-token-presale.preview.emergentagent.com')

class TestHealthAndPublicAPIs:
    """Health check and public API tests"""
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health endpoint working")
    
    def test_public_settings_returns_whitepaper_url(self):
        """Test public settings endpoint includes whitepaper_url field"""
        response = requests.get(f"{BASE_URL}/api/settings/public")
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        assert "gold_price_per_gram" in data
        assert "ico_active" in data
        assert "whitepaper_url" in data
        
        # Verify whitepaper_url is a string
        assert isinstance(data["whitepaper_url"], str)
        print(f"✓ Public settings returns whitepaper_url: {data['whitepaper_url']}")


class TestAdminAuth:
    """Admin authentication tests"""
    
    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "adminpassword"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        print("✓ Admin login successful")
    
    def test_admin_login_invalid_credentials(self):
        """Test admin login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Admin login rejects invalid credentials")


class TestAdminSettings:
    """Admin settings management tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "adminpassword"
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["access_token"]
    
    def test_get_admin_settings(self, admin_token):
        """Test getting admin settings"""
        response = requests.get(
            f"{BASE_URL}/api/admin/settings",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        assert "gold_price_per_gram" in data
        assert "ico_active" in data
        assert "whitepaper_url" in data
        assert "has_private_key" in data
        print(f"✓ Admin settings retrieved, whitepaper_url: {data.get('whitepaper_url')}")
    
    def test_update_whitepaper_url(self, admin_token):
        """Test updating whitepaper URL"""
        test_url = "https://test.com/whitepaper-test.pdf"
        
        # Update settings
        response = requests.put(
            f"{BASE_URL}/api/admin/settings",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"whitepaper_url": test_url}
        )
        assert response.status_code == 200
        assert response.json()["message"] == "Settings updated"
        
        # Verify via GET
        verify_response = requests.get(
            f"{BASE_URL}/api/admin/settings",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert verify_response.status_code == 200
        assert verify_response.json()["whitepaper_url"] == test_url
        print(f"✓ Whitepaper URL updated successfully to: {test_url}")
        
        # Also verify in public settings
        public_response = requests.get(f"{BASE_URL}/api/settings/public")
        assert public_response.status_code == 200
        assert public_response.json()["whitepaper_url"] == test_url
        print("✓ Whitepaper URL reflected in public settings")
    
    def test_clear_whitepaper_url(self, admin_token):
        """Test clearing whitepaper URL"""
        # Clear URL
        response = requests.put(
            f"{BASE_URL}/api/admin/settings",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"whitepaper_url": ""}
        )
        assert response.status_code == 200
        
        # Verify cleared
        public_response = requests.get(f"{BASE_URL}/api/settings/public")
        assert public_response.status_code == 200
        assert public_response.json()["whitepaper_url"] == ""
        print("✓ Whitepaper URL cleared successfully")
        
        # Restore a valid URL for other tests
        requests.put(
            f"{BASE_URL}/api/admin/settings",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"whitepaper_url": "https://piogold.com/whitepaper.pdf"}
        )
    
    def test_settings_require_auth(self):
        """Test settings endpoints require authentication"""
        # GET without auth
        response = requests.get(f"{BASE_URL}/api/admin/settings")
        assert response.status_code == 401
        
        # PUT without auth
        response = requests.put(
            f"{BASE_URL}/api/admin/settings",
            json={"whitepaper_url": "test"}
        )
        assert response.status_code == 401
        print("✓ Settings endpoints properly protected")


class TestPurchaseCalculation:
    """Purchase calculation tests"""
    
    def test_calculate_purchase(self):
        """Test purchase calculation endpoint"""
        response = requests.post(f"{BASE_URL}/api/calculate-purchase", json={
            "usdt_amount": 100
        })
        assert response.status_code == 200
        data = response.json()
        
        assert "usdt_amount" in data
        assert "gold_price" in data
        assert "base_pio" in data
        assert "total_pio" in data
        assert data["usdt_amount"] == 100
        assert data["base_pio"] > 0
        print(f"✓ Purchase calculation working: {data['usdt_amount']} USDT = {data['total_pio']} PIO")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
