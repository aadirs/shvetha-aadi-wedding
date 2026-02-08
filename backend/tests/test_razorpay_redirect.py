"""
Razorpay Redirect Mode Tests
Tests the new /api/razorpay/callback endpoint for mobile redirect flow
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestRazorpayCallback:
    """Tests for the Razorpay redirect callback endpoint"""
    
    def test_callback_endpoint_exists(self):
        """Test that POST /api/razorpay/callback endpoint exists"""
        response = requests.post(
            f"{BASE_URL}/api/razorpay/callback",
            data={
                "razorpay_payment_id": "test_id",
                "razorpay_order_id": "test_order",
                "razorpay_signature": "test_sig"
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            allow_redirects=False
        )
        # Should return 303 See Other redirect
        assert response.status_code == 303
        print("SUCCESS: POST /api/razorpay/callback endpoint exists and returns 303")
    
    def test_callback_invalid_signature_redirects_to_failed(self):
        """Test that callback with invalid signature redirects to /thank-you?payment=failed"""
        response = requests.post(
            f"{BASE_URL}/api/razorpay/callback",
            data={
                "razorpay_payment_id": "test_invalid",
                "razorpay_order_id": "test_order_invalid",
                "razorpay_signature": "invalid_signature"
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            allow_redirects=False
        )
        assert response.status_code == 303
        location = response.headers.get("location", "")
        assert "/thank-you" in location
        assert "payment=failed" in location
        print(f"SUCCESS: Invalid signature redirects to: {location}")
    
    def test_callback_with_empty_data_redirects_to_failed(self):
        """Test callback with empty payment data still redirects properly"""
        response = requests.post(
            f"{BASE_URL}/api/razorpay/callback",
            data={
                "razorpay_payment_id": "",
                "razorpay_order_id": "",
                "razorpay_signature": ""
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            allow_redirects=False
        )
        assert response.status_code == 303
        location = response.headers.get("location", "")
        assert "/thank-you" in location
        assert "payment=failed" in location
        print(f"SUCCESS: Empty data redirects to: {location}")
    
    def test_callback_returns_form_urlencoded_format(self):
        """Test callback accepts form-urlencoded data (Razorpay's redirect format)"""
        response = requests.post(
            f"{BASE_URL}/api/razorpay/callback",
            data="razorpay_payment_id=pay_test&razorpay_order_id=order_test&razorpay_signature=sig_test",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            allow_redirects=False
        )
        assert response.status_code == 303
        print("SUCCESS: Callback accepts form-urlencoded format")
    
    def test_callback_get_method_not_allowed(self):
        """Test that GET method is not allowed on callback endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/razorpay/callback",
            allow_redirects=False
        )
        # Should return 405 Method Not Allowed
        assert response.status_code == 405
        print("SUCCESS: GET method correctly returns 405")


class TestSessionPolling:
    """Tests for session polling endpoint used by ThankYou page"""
    
    def test_session_polling_not_found(self):
        """Test polling for non-existent session returns 404"""
        response = requests.get(f"{BASE_URL}/api/session/nonexistent-session-id")
        assert response.status_code == 404
        print("SUCCESS: Non-existent session returns 404")
    
    def test_session_creation_and_polling(self):
        """Test creating a session and polling it"""
        # Get a valid pot ID first
        pots_response = requests.get(f"{BASE_URL}/api/pots")
        if pots_response.status_code != 200 or not pots_response.json():
            pytest.skip("No pots available for testing")
        
        pot_id = pots_response.json()[0]["id"]
        
        # Create session
        session_response = requests.post(f"{BASE_URL}/api/session/create-or-update", json={
            "donor_name": "TEST_Polling_User",
            "donor_email": "polling@test.com",
            "donor_phone": "+919876543210",
            "cover_fees": True,
            "allocations": [
                {"pot_id": pot_id, "amount_paise": 10000}
            ]
        })
        assert session_response.status_code == 200
        session_id = session_response.json()["session_id"]
        
        # Poll the session
        poll_response = requests.get(f"{BASE_URL}/api/session/{session_id}")
        assert poll_response.status_code == 200
        session_data = poll_response.json()
        assert session_data["id"] == session_id
        assert session_data["status"] == "created"  # Not paid yet
        print(f"SUCCESS: Session created and polled successfully, status: {session_data['status']}")


class TestRazorpayOrderWithCallback:
    """Integration tests for Razorpay order with redirect flow"""
    
    def test_full_order_creation_flow(self):
        """Test creating a complete order that could be used for redirect"""
        # Get pot ID
        pots_response = requests.get(f"{BASE_URL}/api/pots")
        if pots_response.status_code != 200 or not pots_response.json():
            pytest.skip("No pots available")
        
        pot_id = pots_response.json()[0]["id"]
        
        # Create session
        session_response = requests.post(f"{BASE_URL}/api/session/create-or-update", json={
            "donor_name": "TEST_Redirect_User",
            "donor_email": "redirect@test.com",
            "donor_phone": "+919876543210",
            "donor_message": "Testing redirect flow",
            "cover_fees": True,
            "allocations": [
                {"pot_id": pot_id, "amount_paise": 25000}
            ]
        })
        assert session_response.status_code == 200
        session_id = session_response.json()["session_id"]
        
        # Create Razorpay order
        order_response = requests.post(f"{BASE_URL}/api/razorpay/order/create", json={
            "session_id": session_id
        })
        assert order_response.status_code == 200
        order_data = order_response.json()
        
        # Verify order data has all fields needed for redirect mode
        assert "order_id" in order_data
        assert "key_id" in order_data
        assert "amount" in order_data
        assert "currency" in order_data
        assert "prefill" in order_data
        
        # The frontend would use these to build the redirect URL
        # callback_url would be {BACKEND_URL}/api/razorpay/callback
        # redirect: true would be set
        
        print(f"SUCCESS: Full order created for redirect mode")
        print(f"  Order ID: {order_data['order_id']}")
        print(f"  Amount: {order_data['amount']} paise")
        print(f"  Key: {order_data['key_id']}")


class TestWebhookEndpoint:
    """Tests for the Razorpay webhook endpoint"""
    
    def test_webhook_rejects_invalid_signature(self):
        """Test that webhook rejects requests with invalid signature"""
        response = requests.post(
            f"{BASE_URL}/api/razorpay/webhook",
            json={
                "event": "payment.captured",
                "payload": {"payment": {"entity": {"id": "test"}}}
            },
            headers={
                "Content-Type": "application/json",
                "x-razorpay-signature": "invalid-signature"
            }
        )
        # Should return 400 for invalid signature
        assert response.status_code == 400
        print("SUCCESS: Webhook correctly rejects invalid signature")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
