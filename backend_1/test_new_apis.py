#!/usr/bin/env python3
"""
Test script for the new API endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_login():
    """Test login and get token"""
    login_data = {
        "email": "admin@rbcomputer.com",
        "password": "admin123"
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/login/", json=login_data)
    if response.status_code == 200:
        token = response.json().get('access')
        print("✅ Login successful")
        return token
    else:
        print("❌ Login failed:", response.text)
        return None

def test_fee_endpoints(token):
    """Test Fee Management endpoints"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n🧪 Testing Fee Management APIs:")
    
    # Test fee structures
    response = requests.get(f"{BASE_URL}/api/fees/structures/", headers=headers)
    print(f"Fee Structures: {response.status_code}")
    
    # Test student fees
    response = requests.get(f"{BASE_URL}/api/fees/", headers=headers)
    print(f"Student Fees: {response.status_code}")
    
    # Test fee stats
    response = requests.get(f"{BASE_URL}/api/fees/stats/", headers=headers)
    print(f"Fee Stats: {response.status_code}")

def test_attendance_endpoints(token):
    """Test Attendance endpoints"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n🧪 Testing Attendance APIs:")
    
    # Test attendance sessions
    response = requests.get(f"{BASE_URL}/api/attendance/sessions/", headers=headers)
    print(f"Attendance Sessions: {response.status_code}")
    
    # Test attendance records
    response = requests.get(f"{BASE_URL}/api/attendance/records/", headers=headers)
    print(f"Attendance Records: {response.status_code}")
    
    # Test attendance stats
    response = requests.get(f"{BASE_URL}/api/attendance/stats/", headers=headers)
    print(f"Attendance Stats: {response.status_code}")

def test_notice_endpoints(token):
    """Test Notice endpoints"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n🧪 Testing Notice APIs:")
    
    # Test notices
    response = requests.get(f"{BASE_URL}/api/notices/", headers=headers)
    print(f"Notices: {response.status_code}")
    
    # Test notice stats
    response = requests.get(f"{BASE_URL}/api/notices/stats/", headers=headers)
    print(f"Notice Stats: {response.status_code}")

def test_certificate_endpoints(token):
    """Test Certificate endpoints"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n🧪 Testing Certificate APIs:")
    
    # Test certificate templates
    response = requests.get(f"{BASE_URL}/api/certificates/templates/", headers=headers)
    print(f"Certificate Templates: {response.status_code}")
    
    # Test student certificates
    response = requests.get(f"{BASE_URL}/api/certificates/", headers=headers)
    print(f"Student Certificates: {response.status_code}")
    
    # Test certificate stats
    response = requests.get(f"{BASE_URL}/api/certificates/stats/", headers=headers)
    print(f"Certificate Stats: {response.status_code}")

def main():
    print("🚀 Testing New API Endpoints")
    print("=" * 40)
    
    # Login first
    token = test_login()
    if not token:
        return
    
    # Test all endpoints
    test_fee_endpoints(token)
    test_attendance_endpoints(token)
    test_notice_endpoints(token)
    test_certificate_endpoints(token)
    
    print("\n✅ All tests completed!")

if __name__ == "__main__":
    main()
