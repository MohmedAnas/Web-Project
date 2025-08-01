#!/usr/bin/env python3
"""
Simple test script to verify API endpoints are working
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_login():
    """Test login endpoint"""
    print("Testing login endpoint...")
    
    login_data = {
        "email": "admin@rbcomputer.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
        print(f"Login Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("Login successful!")
            print(f"Access token received: {data.get('access', 'N/A')[:50]}...")
            return data.get('access')
        else:
            print(f"Login failed: {response.text}")
            return None
    except requests.exceptions.ConnectionError:
        print("Could not connect to server. Make sure the server is running on localhost:8000")
        return None

def test_protected_endpoint(token):
    """Test a protected endpoint"""
    if not token:
        print("No token available, skipping protected endpoint test")
        return
    
    print("\nTesting protected endpoint...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/auth/user-info/", headers=headers)
        print(f"User info Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("User info retrieved successfully!")
            print(f"User: {data.get('email')} ({data.get('user_type')})")
        else:
            print(f"Failed to get user info: {response.text}")
    except requests.exceptions.ConnectionError:
        print("Could not connect to server")

def test_courses_endpoint(token):
    """Test courses endpoint"""
    if not token:
        print("No token available, skipping courses endpoint test")
        return
    
    print("\nTesting courses endpoint...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/courses/", headers=headers)
        print(f"Courses Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Courses retrieved successfully! Count: {data.get('count', 0)}")
        else:
            print(f"Failed to get courses: {response.text}")
    except requests.exceptions.ConnectionError:
        print("Could not connect to server")

def test_students_endpoint(token):
    """Test students endpoint"""
    if not token:
        print("No token available, skipping students endpoint test")
        return
    
    print("\nTesting students endpoint...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/students/", headers=headers)
        print(f"Students Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Students retrieved successfully! Count: {data.get('count', 0)}")
        else:
            print(f"Failed to get students: {response.text}")
    except requests.exceptions.ConnectionError:
        print("Could not connect to server")

if __name__ == "__main__":
    print("=== R.B Computer API Test ===\n")
    
    # Test login
    token = test_login()
    
    # Test protected endpoints
    test_protected_endpoint(token)
    test_courses_endpoint(token)
    test_students_endpoint(token)
    
    print("\n=== Test Complete ===")
