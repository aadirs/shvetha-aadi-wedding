"""
Test UPI flow endpoints for Wedding Gift Registry
Tests: /api/config, /api/upi/session/create, /api/upi/blessing/confirm, /api/admin/contributions/{id}/status
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# ========== Config Endpoint Tests ==========
class TestConfigEndpoint:
    """Test /api/config returns payment_provider"""

    def test_config_returns_payment_provider(self):
        """GET /api/config returns payment_provider='upi'"""
        response = requests.get(f"{BASE_URL}/api/config")
        assert response.status_code == 200
        data = response.json()
        assert "payment_provider" in data
        assert data["payment_provider"] == "upi"


# ========== UPI Session Create Tests ==========
class TestUpiSessionCreate:
    """Test /api/upi/session/create endpoint"""

    def test_create_upi_session_valid_allocations(self):
        """POST /api/upi/session/create with valid allocations returns session_id and total_amount_paise"""
        # Get a valid pot_id first
        pots_response = requests.get(f"{BASE_URL}/api/pots")
        assert pots_response.status_code == 200
        pots = pots_response.json()
        assert len(pots) > 0
        pot_id = pots[0]["id"]

        # Create session with valid allocations
        payload = {
            "allocations": [
                {"pot_id": pot_id, "amount_paise": 50000}  # ₹500
            ]
        }
        response = requests.post(f"{BASE_URL}/api/upi/session/create", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert "total_amount_paise" in data
        assert data["total_amount_paise"] == 50000
        assert len(data["session_id"]) > 0

    def test_create_upi_session_multiple_allocations(self):
        """POST /api/upi/session/create with multiple allocations sums correctly"""
        pots_response = requests.get(f"{BASE_URL}/api/pots")
        pots = pots_response.json()
        pot_id = pots[0]["id"]

        payload = {
            "allocations": [
                {"pot_id": pot_id, "amount_paise": 50000},
                {"pot_id": pot_id, "amount_paise": 100000}
            ]
        }
        response = requests.post(f"{BASE_URL}/api/upi/session/create", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["total_amount_paise"] == 150000  # 50000 + 100000

    def test_create_upi_session_empty_allocations_returns_400(self):
        """POST /api/upi/session/create with empty allocations returns 400"""
        payload = {"allocations": []}
        response = requests.post(f"{BASE_URL}/api/upi/session/create", json=payload)
        assert response.status_code == 400

    def test_create_upi_session_no_allocations_returns_400(self):
        """POST /api/upi/session/create without allocations key returns 400"""
        payload = {}
        response = requests.post(f"{BASE_URL}/api/upi/session/create", json=payload)
        assert response.status_code == 400

    def test_create_upi_session_zero_amount_returns_400(self):
        """POST /api/upi/session/create with zero amount returns 400"""
        pots_response = requests.get(f"{BASE_URL}/api/pots")
        pots = pots_response.json()
        pot_id = pots[0]["id"]

        payload = {
            "allocations": [
                {"pot_id": pot_id, "amount_paise": 0}
            ]
        }
        response = requests.post(f"{BASE_URL}/api/upi/session/create", json=payload)
        assert response.status_code == 400


# ========== UPI Blessing Confirm Tests ==========
class TestUpiBlessingConfirm:
    """Test /api/upi/blessing/confirm endpoint"""

    @pytest.fixture
    def upi_session(self):
        """Create a fresh UPI session for testing"""
        pots_response = requests.get(f"{BASE_URL}/api/pots")
        pot_id = pots_response.json()[0]["id"]
        payload = {"allocations": [{"pot_id": pot_id, "amount_paise": 50000}]}
        response = requests.post(f"{BASE_URL}/api/upi/session/create", json=payload)
        return response.json()["session_id"]

    def test_confirm_blessing_valid_data(self, upi_session):
        """POST /api/upi/blessing/confirm with valid data updates session to 'paid'"""
        payload = {
            "session_id": upi_session,
            "donor_name": "TEST_UpiUser",
            "donor_phone": "+919876543210",
            "donor_message": "Best wishes for your wedding!"
        }
        response = requests.post(f"{BASE_URL}/api/upi/blessing/confirm", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "paid"
        assert data["session_id"] == upi_session
        assert data["donor_name"] == "TEST_UpiUser"

    def test_confirm_blessing_with_utr(self, upi_session):
        """POST /api/upi/blessing/confirm with UTR processes correctly"""
        payload = {
            "session_id": upi_session,
            "donor_name": "TEST_UtrUser",
            "donor_phone": "+919876543211",
            "donor_message": "Congratulations!",
            "utr": "123456789012"
        }
        response = requests.post(f"{BASE_URL}/api/upi/blessing/confirm", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "paid"

    def test_confirm_blessing_missing_name_returns_400(self, upi_session):
        """POST /api/upi/blessing/confirm with missing name returns 400"""
        payload = {
            "session_id": upi_session,
            "donor_phone": "+919876543210",
            "donor_message": "Best wishes!"
        }
        response = requests.post(f"{BASE_URL}/api/upi/blessing/confirm", json=payload)
        assert response.status_code == 400

    def test_confirm_blessing_missing_phone_returns_400(self, upi_session):
        """POST /api/upi/blessing/confirm with missing phone returns 400"""
        payload = {
            "session_id": upi_session,
            "donor_name": "TEST_NoPhone",
            "donor_message": "Best wishes!"
        }
        response = requests.post(f"{BASE_URL}/api/upi/blessing/confirm", json=payload)
        assert response.status_code == 400

    def test_confirm_blessing_missing_message_returns_400(self, upi_session):
        """POST /api/upi/blessing/confirm with missing message returns 400"""
        payload = {
            "session_id": upi_session,
            "donor_name": "TEST_NoMessage",
            "donor_phone": "+919876543210"
        }
        response = requests.post(f"{BASE_URL}/api/upi/blessing/confirm", json=payload)
        assert response.status_code == 400

    def test_confirm_blessing_missing_session_returns_400(self):
        """POST /api/upi/blessing/confirm with missing session_id returns 400"""
        payload = {
            "donor_name": "TEST_NoSession",
            "donor_phone": "+919876543210",
            "donor_message": "Best wishes!"
        }
        response = requests.post(f"{BASE_URL}/api/upi/blessing/confirm", json=payload)
        assert response.status_code == 400

    def test_confirm_blessing_already_paid_returns_400(self, upi_session):
        """POST /api/upi/blessing/confirm with already-paid session returns 400"""
        # First confirm the blessing
        payload = {
            "session_id": upi_session,
            "donor_name": "TEST_FirstConfirm",
            "donor_phone": "+919876543212",
            "donor_message": "First blessing!"
        }
        first_response = requests.post(f"{BASE_URL}/api/upi/blessing/confirm", json=payload)
        assert first_response.status_code == 200

        # Try to confirm again - should fail
        payload["donor_name"] = "TEST_SecondConfirm"
        payload["donor_message"] = "Second attempt!"
        second_response = requests.post(f"{BASE_URL}/api/upi/blessing/confirm", json=payload)
        assert second_response.status_code == 400

    def test_confirm_blessing_invalid_session_returns_404(self):
        """POST /api/upi/blessing/confirm with non-existent session_id returns 404"""
        # Use valid UUID format that doesn't exist in DB
        payload = {
            "session_id": "00000000-0000-0000-0000-000000000000",
            "donor_name": "TEST_InvalidSession",
            "donor_phone": "+919876543210",
            "donor_message": "Best wishes!"
        }
        response = requests.post(f"{BASE_URL}/api/upi/blessing/confirm", json=payload)
        assert response.status_code == 404


# ========== Admin Contribution Status Tests ==========
class TestAdminContributionStatus:
    """Test /api/admin/contributions/{id}/status endpoint"""

    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "Aadishve",
            "password": "061097"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin login failed")

    @pytest.fixture
    def test_session_for_admin(self):
        """Create a session for admin status change testing"""
        pots_response = requests.get(f"{BASE_URL}/api/pots")
        pot_id = pots_response.json()[0]["id"]
        payload = {"allocations": [{"pot_id": pot_id, "amount_paise": 10000}]}
        response = requests.post(f"{BASE_URL}/api/upi/session/create", json=payload)
        return response.json()["session_id"]

    def test_admin_mark_received_sets_paid(self, admin_token, test_session_for_admin):
        """POST /api/admin/contributions/{id}/status with 'received' sets status to 'paid'"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.post(
            f"{BASE_URL}/api/admin/contributions/{test_session_for_admin}/status",
            json={"status": "received"},
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "paid"
        assert data["session_id"] == test_session_for_admin

    def test_admin_mark_failed(self, admin_token, test_session_for_admin):
        """POST /api/admin/contributions/{id}/status with 'failed' sets status to 'failed'"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.post(
            f"{BASE_URL}/api/admin/contributions/{test_session_for_admin}/status",
            json={"status": "failed"},
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "failed"

    def test_admin_invalid_status_returns_400(self, admin_token, test_session_for_admin):
        """POST /api/admin/contributions/{id}/status with invalid status returns 400"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.post(
            f"{BASE_URL}/api/admin/contributions/{test_session_for_admin}/status",
            json={"status": "invalid_status"},
            headers=headers
        )
        assert response.status_code == 400

    def test_admin_status_requires_auth(self, test_session_for_admin):
        """POST /api/admin/contributions/{id}/status without auth returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/admin/contributions/{test_session_for_admin}/status",
            json={"status": "received"}
        )
        assert response.status_code == 401


# ========== Existing Razorpay Endpoints Still Work ==========
class TestRazorpayEndpointsStillWork:
    """Test that existing Razorpay endpoints still respond"""

    def test_pots_endpoint_works(self):
        """GET /api/pots still works"""
        response = requests.get(f"{BASE_URL}/api/pots")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_session_create_or_update_works(self):
        """POST /api/session/create-or-update still works (Razorpay flow)"""
        pots_response = requests.get(f"{BASE_URL}/api/pots")
        pot_id = pots_response.json()[0]["id"]
        
        payload = {
            "donor_name": "TEST_RazorpayUser",
            "donor_email": "test@example.com",
            "donor_phone": "+919876543210",
            "donor_message": "Test message",
            "allocations": [{"pot_id": pot_id, "amount_paise": 50000}],
            "cover_fees": True
        }
        response = requests.post(f"{BASE_URL}/api/session/create-or-update", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert "total_amount_paise" in data
        assert "fee_amount_paise" in data
        assert "grand_total_paise" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
