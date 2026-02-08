"""
Wedding Gift Registry API Tests
Tests all API endpoints including admin authentication with updated credentials
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndRoot:
    """Health check and root endpoint tests"""
    
    def test_root_endpoint(self):
        """Test root API endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["app"] == "wedding-gifts"
        print("SUCCESS: Root endpoint working")
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        print(f"SUCCESS: Health check - database: {data.get('database')}")


class TestPublicPots:
    """Public pot endpoints tests"""
    
    def test_list_pots(self):
        """Test listing all active pots"""
        response = requests.get(f"{BASE_URL}/api/pots")
        assert response.status_code == 200
        pots = response.json()
        assert isinstance(pots, list)
        assert len(pots) >= 1
        
        # Verify pot structure
        for pot in pots:
            assert "id" in pot
            assert "title" in pot
            assert "slug" in pot
            assert "total_raised_paise" in pot
        print(f"SUCCESS: Listed {len(pots)} pots")
    
    def test_get_pot_kitchen(self):
        """Test getting kitchen pot details"""
        response = requests.get(f"{BASE_URL}/api/pots/kitchen")
        assert response.status_code == 200
        pot = response.json()
        assert pot["slug"] == "kitchen"
        assert "items" in pot
        assert "total_raised_paise" in pot
        print(f"SUCCESS: Kitchen pot has {len(pot.get('items', []))} items")
    
    def test_get_pot_honeymoon(self):
        """Test getting honeymoon pot details"""
        response = requests.get(f"{BASE_URL}/api/pots/honeymoon")
        assert response.status_code == 200
        pot = response.json()
        assert pot["slug"] == "honeymoon"
        print(f"SUCCESS: Honeymoon pot loaded - raised: {pot.get('total_raised_paise', 0)} paise")
    
    def test_get_pot_dream_home(self):
        """Test getting dream-home pot details"""
        response = requests.get(f"{BASE_URL}/api/pots/dream-home")
        assert response.status_code == 200
        pot = response.json()
        assert pot["slug"] == "dream-home"
        print(f"SUCCESS: Dream-home pot loaded")
    
    def test_get_pot_not_found(self):
        """Test getting non-existent pot returns 404"""
        response = requests.get(f"{BASE_URL}/api/pots/nonexistent-pot")
        assert response.status_code == 404
        print("SUCCESS: Non-existent pot returns 404")
    
    def test_get_pot_contributors(self):
        """Test getting pot contributors"""
        response = requests.get(f"{BASE_URL}/api/pots/kitchen/contributors")
        assert response.status_code == 200
        contributors = response.json()
        assert isinstance(contributors, list)
        print(f"SUCCESS: Kitchen pot has {len(contributors)} contributors")


class TestAdminAuthentication:
    """Admin authentication tests with updated credentials"""
    
    def test_admin_login_with_capitalized_username(self):
        """Test admin login with new capitalized username 'Aadishve'"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "Aadishve",  # Updated capitalized username
            "password": "061097"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["username"] == "Aadishve"
        print("SUCCESS: Admin login with 'Aadishve' (capitalized) works")
        return data["token"]
    
    def test_admin_login_old_lowercase_rejected(self):
        """Test that old lowercase 'aadishve' username is now rejected"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "aadishve",  # Old lowercase - should be rejected
            "password": "061097"
        })
        assert response.status_code == 401
        print("SUCCESS: Old lowercase 'aadishve' is correctly rejected")
    
    def test_admin_login_invalid_password(self):
        """Test admin login with wrong password"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "Aadishve",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("SUCCESS: Invalid password correctly rejected")
    
    def test_admin_login_invalid_username(self):
        """Test admin login with wrong username"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "wronguser",
            "password": "061097"
        })
        assert response.status_code == 401
        print("SUCCESS: Invalid username correctly rejected")


class TestAdminEndpoints:
    """Admin protected endpoint tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "Aadishve",
            "password": "061097"
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Admin authentication failed")
    
    def test_admin_dashboard(self, admin_token):
        """Test admin dashboard endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/dashboard",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_collected_paise" in data
        assert "pot_stats" in data
        assert "recent_contributions" in data
        print(f"SUCCESS: Dashboard - Total collected: {data['total_collected_paise']} paise")
    
    def test_admin_pots_list(self, admin_token):
        """Test admin pots listing"""
        response = requests.get(
            f"{BASE_URL}/api/admin/pots",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        pots = response.json()
        assert isinstance(pots, list)
        print(f"SUCCESS: Admin pots list has {len(pots)} pots")
    
    def test_admin_contributions_list(self, admin_token):
        """Test admin contributions listing"""
        response = requests.get(
            f"{BASE_URL}/api/admin/contributions",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        contributions = response.json()
        assert isinstance(contributions, list)
        print(f"SUCCESS: Admin contributions list has {len(contributions)} entries")
    
    def test_admin_endpoint_without_auth(self):
        """Test admin endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/dashboard")
        assert response.status_code == 401
        print("SUCCESS: Admin endpoint correctly requires auth")


class TestSessionAndPayment:
    """Session creation and Razorpay order tests"""
    
    @pytest.fixture
    def pot_id(self):
        """Get a valid pot ID for testing"""
        response = requests.get(f"{BASE_URL}/api/pots/kitchen")
        if response.status_code == 200:
            return response.json()["id"]
        pytest.skip("Could not get pot ID")
    
    def test_create_session(self, pot_id):
        """Test creating a contribution session"""
        response = requests.post(f"{BASE_URL}/api/session/create-or-update", json={
            "donor_name": "TEST_User",
            "donor_email": "test@example.com",
            "donor_phone": "+919876543210",
            "donor_message": "Test message",
            "cover_fees": True,
            "allocations": [
                {"pot_id": pot_id, "amount_paise": 50000}
            ]
        })
        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert data["total_amount_paise"] == 50000
        assert "fee_amount_paise" in data
        print(f"SUCCESS: Session created with ID: {data['session_id']}")
        return data["session_id"]
    
    def test_create_session_validation(self):
        """Test session creation validation"""
        # Missing required fields
        response = requests.post(f"{BASE_URL}/api/session/create-or-update", json={
            "donor_name": "Test",
            "allocations": []
        })
        assert response.status_code == 400
        print("SUCCESS: Session validation working correctly")
    
    def test_create_razorpay_order(self, pot_id):
        """Test Razorpay order creation"""
        # First create a session
        session_response = requests.post(f"{BASE_URL}/api/session/create-or-update", json={
            "donor_name": "TEST_Razorpay_User",
            "donor_email": "rzptest@example.com",
            "donor_phone": "+919876543210",
            "cover_fees": True,
            "allocations": [
                {"pot_id": pot_id, "amount_paise": 10000}
            ]
        })
        session_id = session_response.json()["session_id"]
        
        # Create Razorpay order
        order_response = requests.post(f"{BASE_URL}/api/razorpay/order/create", json={
            "session_id": session_id
        })
        assert order_response.status_code == 200
        data = order_response.json()
        assert "order_id" in data
        assert "key_id" in data
        assert data["key_id"].startswith("rzp_test_")
        print(f"SUCCESS: Razorpay order created: {data['order_id']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
