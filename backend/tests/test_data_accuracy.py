"""
Test data accuracy and prefetch/caching concerns for Wedding Gift Registry.

Focus areas:
1. /api/pots returns accurate total_raised_paise from database (not cached)
2. /api/session/{id}/progress returns accurate raised_before_paise and session_contribution_paise
3. Data consistency across multiple requests
4. Session progress calculation correctness
"""

import pytest
import requests
import os
import time
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPotsDataAccuracy:
    """Test that /api/pots returns accurate data from database"""
    
    def test_pots_endpoint_returns_total_raised(self):
        """Verify /api/pots returns total_raised_paise field"""
        response = requests.get(f"{BASE_URL}/api/pots")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        pots = response.json()
        assert isinstance(pots, list), "Expected list of pots"
        
        if len(pots) > 0:
            for pot in pots:
                assert "id" in pot, "Pot should have id"
                assert "title" in pot, "Pot should have title"
                assert "total_raised_paise" in pot, "Pot should have total_raised_paise"
                assert isinstance(pot["total_raised_paise"], (int, float)), "total_raised_paise should be numeric"
                print(f"Pot '{pot['title']}': raised ₹{pot['total_raised_paise']/100:.2f}")
    
    def test_pots_data_consistency_multiple_requests(self):
        """Verify multiple requests to /api/pots return consistent data"""
        response1 = requests.get(f"{BASE_URL}/api/pots")
        assert response1.status_code == 200
        pots1 = response1.json()
        
        time.sleep(0.5)  # Brief delay
        
        response2 = requests.get(f"{BASE_URL}/api/pots")
        assert response2.status_code == 200
        pots2 = response2.json()
        
        # Same number of pots
        assert len(pots1) == len(pots2), "Pot count should be consistent"
        
        # Same totals (no contributions in between)
        for pot1, pot2 in zip(pots1, pots2):
            assert pot1["id"] == pot2["id"], "Pot IDs should match"
            assert pot1["total_raised_paise"] == pot2["total_raised_paise"], \
                f"total_raised_paise should be consistent: {pot1['total_raised_paise']} vs {pot2['total_raised_paise']}"
        print("✓ Data consistent across multiple requests")


class TestSinglePotAccuracy:
    """Test that /api/pots/{slug} returns accurate data"""
    
    def test_single_pot_returns_fresh_total(self):
        """Verify /api/pots/{slug} returns total_raised_paise from database"""
        # First get list of pots
        response = requests.get(f"{BASE_URL}/api/pots")
        assert response.status_code == 200
        pots = response.json()
        
        if len(pots) == 0:
            pytest.skip("No pots available for testing")
        
        pot = pots[0]
        slug = pot.get("slug")
        list_total = pot["total_raised_paise"]
        
        # Now fetch single pot
        response = requests.get(f"{BASE_URL}/api/pots/{slug}")
        assert response.status_code == 200
        single_pot = response.json()
        
        assert "total_raised_paise" in single_pot, "Single pot should have total_raised_paise"
        detail_total = single_pot["total_raised_paise"]
        
        # Both should match (no contributions between requests)
        assert list_total == detail_total, \
            f"List total ({list_total}) should match detail total ({detail_total})"
        print(f"✓ Pot '{slug}' consistent: ₹{detail_total/100:.2f} raised")
    
    def test_pot_total_consistency_across_endpoints(self):
        """Verify /api/pots and /api/pots/{slug} return same total"""
        response = requests.get(f"{BASE_URL}/api/pots")
        assert response.status_code == 200
        pots = response.json()
        
        for pot in pots[:3]:  # Test up to 3 pots
            slug = pot.get("slug")
            list_total = pot["total_raised_paise"]
            
            detail_response = requests.get(f"{BASE_URL}/api/pots/{slug}")
            assert detail_response.status_code == 200
            detail_pot = detail_response.json()
            detail_total = detail_pot["total_raised_paise"]
            
            assert list_total == detail_total, \
                f"Pot '{slug}': list total ({list_total}) != detail total ({detail_total})"
            print(f"✓ '{slug}': list={list_total}, detail={detail_total} - MATCH")


class TestSessionProgressAccuracy:
    """Test /api/session/{id}/progress returns accurate data"""
    
    def _create_test_session_and_pay(self, pot_id, amount_paise):
        """Helper to create and pay a test session"""
        # Create UPI session
        response = requests.post(f"{BASE_URL}/api/upi/session/create", json={
            "allocations": [{"pot_id": pot_id, "amount_paise": amount_paise}]
        })
        assert response.status_code == 200, f"Failed to create session: {response.text}"
        session_id = response.json()["session_id"]
        
        # Confirm blessing (marks as paid)
        unique_id = str(uuid.uuid4())[:8]
        response = requests.post(f"{BASE_URL}/api/upi/blessing/confirm", json={
            "session_id": session_id,
            "donor_name": f"Test User {unique_id}",
            "donor_phone": "+919876543210",
            "donor_email": f"test{unique_id}@example.com",
            "donor_message": "Test blessing for data accuracy"
        })
        assert response.status_code == 200, f"Failed to confirm blessing: {response.text}"
        
        return session_id
    
    def test_session_progress_structure(self):
        """Verify /api/session/{id}/progress returns required fields"""
        # Get a pot
        response = requests.get(f"{BASE_URL}/api/pots")
        assert response.status_code == 200
        pots = response.json()
        if not pots:
            pytest.skip("No pots available")
        
        pot_id = pots[0]["id"]
        test_amount = 10000  # ₹100
        
        # Create and pay session
        session_id = self._create_test_session_and_pay(pot_id, test_amount)
        
        # Get progress
        response = requests.get(f"{BASE_URL}/api/session/{session_id}/progress")
        assert response.status_code == 200, f"Failed to get progress: {response.text}"
        
        progress = response.json()
        
        # Verify required fields
        required_fields = ["pot_id", "pot_title", "goal_amount_paise", 
                         "raised_before_paise", "session_contribution_paise", "raised_after_paise"]
        for field in required_fields:
            assert field in progress, f"Missing field: {field}"
        
        print(f"✓ Progress fields present for session {session_id}")
        print(f"  - raised_before: ₹{progress['raised_before_paise']/100:.2f}")
        print(f"  - contribution: ₹{progress['session_contribution_paise']/100:.2f}")
        print(f"  - raised_after: ₹{progress['raised_after_paise']/100:.2f}")
    
    def test_session_progress_calculation_correctness(self):
        """Verify raised_before + contribution = raised_after"""
        # Get a pot
        response = requests.get(f"{BASE_URL}/api/pots")
        pots = response.json()
        if not pots:
            pytest.skip("No pots available")
        
        pot_id = pots[0]["id"]
        test_amount = 25000  # ₹250
        
        session_id = self._create_test_session_and_pay(pot_id, test_amount)
        
        response = requests.get(f"{BASE_URL}/api/session/{session_id}/progress")
        assert response.status_code == 200
        progress = response.json()
        
        # Calculation check
        calculated_after = progress["raised_before_paise"] + progress["session_contribution_paise"]
        assert progress["raised_after_paise"] == calculated_after, \
            f"Math error: {progress['raised_before_paise']} + {progress['session_contribution_paise']} = {calculated_after}, not {progress['raised_after_paise']}"
        
        # Contribution should match what we sent
        assert progress["session_contribution_paise"] == test_amount, \
            f"Contribution should be {test_amount}, got {progress['session_contribution_paise']}"
        
        print(f"✓ Progress calculation correct: {progress['raised_before_paise']} + {test_amount} = {progress['raised_after_paise']}")
    
    def test_session_progress_reflects_contribution_in_total(self):
        """Verify contribution is reflected in pot total after payment"""
        # Get initial pot state
        response = requests.get(f"{BASE_URL}/api/pots")
        pots = response.json()
        if not pots:
            pytest.skip("No pots available")
        
        pot = pots[0]
        pot_id = pot["id"]
        slug = pot["slug"]
        initial_total = pot["total_raised_paise"]
        test_amount = 15000  # ₹150
        
        print(f"Initial total for '{slug}': ₹{initial_total/100:.2f}")
        
        # Create and pay session
        session_id = self._create_test_session_and_pay(pot_id, test_amount)
        
        # Brief delay to ensure database is updated
        time.sleep(0.5)
        
        # Check pot total increased
        response = requests.get(f"{BASE_URL}/api/pots/{slug}")
        assert response.status_code == 200
        updated_pot = response.json()
        new_total = updated_pot["total_raised_paise"]
        
        expected_total = initial_total + test_amount
        assert new_total == expected_total, \
            f"Expected new total {expected_total}, got {new_total} (initial {initial_total} + {test_amount})"
        
        print(f"✓ Pot total updated correctly: ₹{initial_total/100:.2f} + ₹{test_amount/100:.2f} = ₹{new_total/100:.2f}")


class TestDataFreshness:
    """Test that endpoints return fresh data, not cached"""
    
    def test_pots_list_reflects_new_contribution(self):
        """Verify /api/pots returns updated total after contribution"""
        # Get initial state
        response = requests.get(f"{BASE_URL}/api/pots")
        pots1 = response.json()
        if not pots1:
            pytest.skip("No pots available")
        
        pot = pots1[0]
        pot_id = pot["id"]
        slug = pot["slug"]
        initial_total = pot["total_raised_paise"]
        test_amount = 5000  # ₹50
        
        # Create and pay a session
        create_resp = requests.post(f"{BASE_URL}/api/upi/session/create", json={
            "allocations": [{"pot_id": pot_id, "amount_paise": test_amount}]
        })
        session_id = create_resp.json()["session_id"]
        
        unique_id = str(uuid.uuid4())[:8]
        requests.post(f"{BASE_URL}/api/upi/blessing/confirm", json={
            "session_id": session_id,
            "donor_name": f"Fresh Test {unique_id}",
            "donor_phone": "+919999999999",
            "donor_email": f"fresh{unique_id}@test.com",
            "donor_message": "Testing data freshness"
        })
        
        time.sleep(0.5)
        
        # Get pots list again
        response = requests.get(f"{BASE_URL}/api/pots")
        pots2 = response.json()
        
        # Find our pot in new list
        pot2 = next((p for p in pots2 if p["id"] == pot_id), None)
        assert pot2 is not None, f"Pot {pot_id} not found in updated list"
        
        new_total = pot2["total_raised_paise"]
        expected = initial_total + test_amount
        
        assert new_total == expected, \
            f"List not showing fresh data: expected {expected}, got {new_total}"
        print(f"✓ /api/pots returns fresh data after contribution")
    
    def test_multiple_pots_no_cross_contamination(self):
        """Verify contribution to one pot doesn't affect others"""
        response = requests.get(f"{BASE_URL}/api/pots")
        pots = response.json()
        
        if len(pots) < 2:
            pytest.skip("Need at least 2 pots for this test")
        
        pot1 = pots[0]
        pot2 = pots[1]
        
        pot1_initial = pot1["total_raised_paise"]
        pot2_initial = pot2["total_raised_paise"]
        test_amount = 7500  # ₹75
        
        # Contribute only to pot1
        create_resp = requests.post(f"{BASE_URL}/api/upi/session/create", json={
            "allocations": [{"pot_id": pot1["id"], "amount_paise": test_amount}]
        })
        session_id = create_resp.json()["session_id"]
        
        unique_id = str(uuid.uuid4())[:8]
        requests.post(f"{BASE_URL}/api/upi/blessing/confirm", json={
            "session_id": session_id,
            "donor_name": f"Cross Test {unique_id}",
            "donor_phone": "+919988776655",
            "donor_email": f"cross{unique_id}@test.com",
            "donor_message": "Testing no cross-contamination"
        })
        
        time.sleep(0.5)
        
        # Check both pots
        response = requests.get(f"{BASE_URL}/api/pots")
        updated_pots = response.json()
        
        updated_pot1 = next(p for p in updated_pots if p["id"] == pot1["id"])
        updated_pot2 = next(p for p in updated_pots if p["id"] == pot2["id"])
        
        # Pot1 should increase
        assert updated_pot1["total_raised_paise"] == pot1_initial + test_amount, \
            f"Pot1 should have increased by {test_amount}"
        
        # Pot2 should remain same
        assert updated_pot2["total_raised_paise"] == pot2_initial, \
            f"Pot2 should not have changed: expected {pot2_initial}, got {updated_pot2['total_raised_paise']}"
        
        print(f"✓ No cross-contamination: Pot1 updated, Pot2 unchanged")


class TestClearPrefetchedDataEquivalent:
    """Test that after payment, data is truly fresh (simulates clearPrefetchedData behavior)"""
    
    def test_fresh_data_after_payment_flow(self):
        """Simulate what happens after clearPrefetchedData - next /api/pots call should be fresh"""
        # Get initial state
        response1 = requests.get(f"{BASE_URL}/api/pots")
        pots1 = response1.json()
        if not pots1:
            pytest.skip("No pots")
        
        pot = pots1[0]
        initial_total = pot["total_raised_paise"]
        test_amount = 11000  # ₹110
        
        # Create contribution
        create_resp = requests.post(f"{BASE_URL}/api/upi/session/create", json={
            "allocations": [{"pot_id": pot["id"], "amount_paise": test_amount}]
        })
        session_id = create_resp.json()["session_id"]
        
        unique_id = str(uuid.uuid4())[:8]
        requests.post(f"{BASE_URL}/api/upi/blessing/confirm", json={
            "session_id": session_id,
            "donor_name": f"Cache Clear Test {unique_id}",
            "donor_phone": "+919111111111",
            "donor_email": f"clear{unique_id}@test.com",
            "donor_message": "Testing cache clear"
        })
        
        # This simulates what happens after clearPrefetchedData() is called
        # The next API call should return fresh data
        time.sleep(0.3)
        
        response2 = requests.get(f"{BASE_URL}/api/pots")
        pots2 = response2.json()
        updated_pot = next(p for p in pots2 if p["id"] == pot["id"])
        
        expected = initial_total + test_amount
        assert updated_pot["total_raised_paise"] == expected, \
            f"After clearing cache simulation, expected {expected}, got {updated_pot['total_raised_paise']}"
        
        print(f"✓ Fresh data returned after payment (simulating clearPrefetchedData)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
