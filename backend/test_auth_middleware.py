#!/usr/bin/env python3
"""
Enhanced test script to verify authentication and authorization middleware
"""
import requests
import json
import time

BASE_URL = "http://localhost:8000/api"

def test_login_with_enhanced_response():
    """Test login endpoint with enhanced JWT response"""
    print("Testing enhanced login endpoint...")
    
    login_data = {
        "email": "admin@rbcomputer.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
        print(f"Login Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("Enhanced login successful!")
            print(f"Access token: {data.get('access', 'N/A')[:50]}...")
            print(f"Refresh token: {data.get('refresh', 'N/A')[:50]}...")
            print(f"Access expires in: {data.get('access_expires_in')} seconds")
            print(f"Refresh expires in: {data.get('refresh_expires_in')} seconds")
            print(f"User info: {data.get('user', {}).get('email')} ({data.get('user', {}).get('user_type')})")
            return data.get('access'), data.get('refresh')
        else:
            print(f"Login failed: {response.text}")
            return None, None
    except requests.exceptions.ConnectionError:
        print("Could not connect to server. Make sure the server is running on localhost:8000")
        return None, None

def test_rate_limiting():
    """Test rate limiting middleware"""
    print("\nTesting rate limiting...")
    
    # Make multiple requests quickly
    for i in range(5):
        try:
            response = requests.get(f"{BASE_URL}/courses/")
            print(f"Request {i+1}: Status {response.status_code}")
            
            # Check rate limit headers
            if 'X-RateLimit-Limit' in response.headers:
                print(f"  Rate Limit: {response.headers['X-RateLimit-Remaining']}/{response.headers['X-RateLimit-Limit']}")
                print(f"  Reset Time: {response.headers.get('X-RateLimit-Reset', 'N/A')}")
            
            if response.status_code == 429:
                print("  Rate limit exceeded!")
                break
                
        except requests.exceptions.ConnectionError:
            print("Could not connect to server")
            break
        
        time.sleep(0.1)  # Small delay between requests

def test_security_headers(token):
    """Test security headers in response"""
    print("\nTesting security headers...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    } if token else {}
    
    try:
        response = requests.get(f"{BASE_URL}/courses/", headers=headers)
        print(f"Response Status: {response.status_code}")
        
        # Check security headers
        security_headers = [
            'X-Content-Type-Options',
            'X-Frame-Options',
            'X-XSS-Protection',
            'Referrer-Policy',
            'Content-Security-Policy',
            'X-Response-Time'
        ]
        
        print("Security headers:")
        for header in security_headers:
            value = response.headers.get(header, 'Not set')
            print(f"  {header}: {value}")
            
    except requests.exceptions.ConnectionError:
        print("Could not connect to server")

def test_role_based_access(token):
    """Test role-based access control"""
    print("\nTesting role-based access control...")
    
    if not token:
        print("No token available, skipping role-based access test")
        return
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test different endpoints with different permission requirements
    test_endpoints = [
        ("GET", "/students/", "Should allow admin to view students"),
        ("POST", "/students/", "Should allow admin to create students"),
        ("GET", "/courses/", "Should allow admin to view courses"),
        ("POST", "/courses/", "Should allow admin to create courses"),
        ("GET", "/students/me/", "Should allow access to own profile"),
    ]
    
    for method, endpoint, description in test_endpoints:
        try:
            if method == "GET":
                response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
            elif method == "POST":
                # Use minimal data for POST requests
                test_data = {"test": "data"}
                response = requests.post(f"{BASE_URL}{endpoint}", json=test_data, headers=headers)
            
            print(f"{method} {endpoint}: {response.status_code} - {description}")
            
            if response.status_code == 403:
                print(f"  Permission denied: {response.json().get('message', 'No message')}")
            elif response.status_code == 400:
                print(f"  Bad request (expected for test data): {response.json().get('message', 'No message')}")
            
        except requests.exceptions.ConnectionError:
            print("Could not connect to server")
            break

def test_token_refresh(refresh_token):
    """Test token refresh functionality"""
    print("\nTesting token refresh...")
    
    if not refresh_token:
        print("No refresh token available")
        return None
    
    try:
        refresh_data = {"refresh": refresh_token}
        response = requests.post(f"{BASE_URL}/auth/token/refresh/", json=refresh_data)
        print(f"Token refresh status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("Token refresh successful!")
            print(f"New access token: {data.get('access', 'N/A')[:50]}...")
            return data.get('access')
        else:
            print(f"Token refresh failed: {response.text}")
            return None
            
    except requests.exceptions.ConnectionError:
        print("Could not connect to server")
        return None

def test_input_sanitization():
    """Test input sanitization middleware"""
    print("\nTesting input sanitization...")
    
    # Test with potentially malicious input
    malicious_inputs = [
        {"email": "<script>alert('xss')</script>@test.com", "password": "test123"},
        {"email": "test@test.com", "password": "'; DROP TABLE users; --"},
        {"email": "test@test.com", "password": "<iframe src='javascript:alert(1)'></iframe>"},
    ]
    
    for i, malicious_data in enumerate(malicious_inputs):
        try:
            response = requests.post(f"{BASE_URL}/auth/login/", json=malicious_data)
            print(f"Malicious input test {i+1}: Status {response.status_code}")
            
            # The input should be sanitized, so we shouldn't see the malicious content in the response
            response_text = response.text.lower()
            if '<script>' in response_text or 'drop table' in response_text or '<iframe>' in response_text:
                print(f"  WARNING: Malicious content detected in response!")
            else:
                print(f"  Input appears to be sanitized")
                
        except requests.exceptions.ConnectionError:
            print("Could not connect to server")
            break

def test_logout_and_token_blacklist(refresh_token):
    """Test logout and token blacklisting"""
    print("\nTesting logout and token blacklisting...")
    
    if not refresh_token:
        print("No refresh token available")
        return
    
    try:
        logout_data = {"refresh": refresh_token}
        response = requests.post(f"{BASE_URL}/auth/logout/", json=logout_data)
        print(f"Logout status: {response.status_code}")
        
        if response.status_code == 200:
            print("Logout successful - token should be blacklisted")
            
            # Try to use the refresh token again (should fail)
            refresh_response = requests.post(f"{BASE_URL}/auth/token/refresh/", json=logout_data)
            print(f"Attempting to use blacklisted token: {refresh_response.status_code}")
            
            if refresh_response.status_code == 401:
                print("  Token successfully blacklisted!")
            else:
                print("  WARNING: Blacklisted token still works!")
        else:
            print(f"Logout failed: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("Could not connect to server")

if __name__ == "__main__":
    print("=== Enhanced Authentication & Authorization Test ===\n")
    
    # Test enhanced login
    access_token, refresh_token = test_login_with_enhanced_response()
    
    # Test rate limiting
    test_rate_limiting()
    
    # Test security headers
    test_security_headers(access_token)
    
    # Test role-based access
    test_role_based_access(access_token)
    
    # Test token refresh
    new_access_token = test_token_refresh(refresh_token)
    
    # Test input sanitization
    test_input_sanitization()
    
    # Test logout and token blacklisting
    test_logout_and_token_blacklist(refresh_token)
    
    print("\n=== Enhanced Test Complete ===")
