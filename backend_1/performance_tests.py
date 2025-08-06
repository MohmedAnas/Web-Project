#!/usr/bin/env python
"""
Performance testing script for RB Computer API
"""

import os
import sys
import time
import requests
import statistics
from concurrent.futures import ThreadPoolExecutor
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rbcomputer.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.students.models import Student
from apps.courses.models import Course

User = get_user_model()

class PerformanceTester:
    def __init__(self, base_url='http://localhost:8000'):
        self.base_url = base_url
        self.auth_token = None
    
    def authenticate(self):
        """Authenticate and get token"""
        try:
            # Create test admin user if doesn't exist
            admin_user, created = User.objects.get_or_create(
                email='admin@test.com',
                defaults={
                    'first_name': 'Admin',
                    'last_name': 'User',
                    'role': 'admin',
                    'is_staff': True
                }
            )
            if created:
                admin_user.set_password('admin123')
                admin_user.save()
            
            # Login via API
            response = requests.post(f'{self.base_url}/api/token/', {
                'email': 'admin@test.com',
                'password': 'admin123'
            })
            
            if response.status_code == 200:
                self.auth_token = response.json()['access']
                return True
            return False
        except Exception as e:
            print(f"Authentication failed: {e}")
            return False
    
    def get_headers(self):
        """Get authentication headers"""
        return {
            'Authorization': f'Bearer {self.auth_token}',
            'Content-Type': 'application/json'
        }
    
    def measure_response_time(self, url, method='GET', data=None, iterations=10):
        """Measure average response time for an endpoint"""
        times = []
        
        for _ in range(iterations):
            start_time = time.time()
            
            if method == 'GET':
                response = requests.get(url, headers=self.get_headers())
            elif method == 'POST':
                response = requests.post(url, json=data, headers=self.get_headers())
            
            end_time = time.time()
            
            if response.status_code in [200, 201]:
                times.append(end_time - start_time)
        
        if times:
            return {
                'avg_time': statistics.mean(times),
                'min_time': min(times),
                'max_time': max(times),
                'median_time': statistics.median(times),
                'success_rate': len(times) / iterations * 100
            }
        return None
    
    def test_concurrent_requests(self, url, concurrent_users=10, requests_per_user=5):
        """Test concurrent request handling"""
        def make_requests(user_id):
            times = []
            for _ in range(requests_per_user):
                start_time = time.time()
                response = requests.get(url, headers=self.get_headers())
                end_time = time.time()
                
                if response.status_code == 200:
                    times.append(end_time - start_time)
            return times
        
        with ThreadPoolExecutor(max_workers=concurrent_users) as executor:
            futures = [executor.submit(make_requests, i) for i in range(concurrent_users)]
            all_times = []
            
            for future in futures:
                all_times.extend(future.result())
        
        if all_times:
            return {
                'total_requests': len(all_times),
                'avg_time': statistics.mean(all_times),
                'min_time': min(all_times),
                'max_time': max(all_times),
                'requests_per_second': len(all_times) / sum(all_times) if sum(all_times) > 0 else 0
            }
        return None
    
    def run_performance_tests(self):
        """Run all performance tests"""
        print("🚀 Starting Performance Tests for RB Computer API")
        print("=" * 60)
        
        if not self.authenticate():
            print("❌ Authentication failed. Cannot run tests.")
            return
        
        print("✅ Authentication successful")
        
        # Test endpoints
        endpoints = [
            ('Students List', f'{self.base_url}/api/students/'),
            ('Courses List', f'{self.base_url}/api/courses/'),
            ('Fees List', f'{self.base_url}/api/fees/'),
            ('Attendance Sessions', f'{self.base_url}/api/attendance/sessions/'),
        ]
        
        print("\n📊 Response Time Tests")
        print("-" * 40)
        
        for name, url in endpoints:
            print(f"\nTesting: {name}")
            result = self.measure_response_time(url)
            
            if result:
                print(f"  Average: {result['avg_time']:.3f}s")
                print(f"  Min: {result['min_time']:.3f}s")
                print(f"  Max: {result['max_time']:.3f}s")
                print(f"  Median: {result['median_time']:.3f}s")
                print(f"  Success Rate: {result['success_rate']:.1f}%")
                
                # Performance thresholds
                if result['avg_time'] > 2.0:
                    print("  ⚠️  WARNING: Average response time > 2s")
                elif result['avg_time'] > 1.0:
                    print("  ⚡ GOOD: Response time < 2s")
                else:
                    print("  🚀 EXCELLENT: Response time < 1s")
            else:
                print("  ❌ Test failed")
        
        print("\n🔄 Concurrent Request Tests")
        print("-" * 40)
        
        # Test concurrent requests on students endpoint
        print("\nTesting concurrent requests (10 users, 5 requests each):")
        concurrent_result = self.test_concurrent_requests(f'{self.base_url}/api/students/')
        
        if concurrent_result:
            print(f"  Total Requests: {concurrent_result['total_requests']}")
            print(f"  Average Time: {concurrent_result['avg_time']:.3f}s")
            print(f"  Requests/Second: {concurrent_result['requests_per_second']:.2f}")
            
            if concurrent_result['requests_per_second'] > 50:
                print("  🚀 EXCELLENT: >50 requests/second")
            elif concurrent_result['requests_per_second'] > 20:
                print("  ⚡ GOOD: >20 requests/second")
            else:
                print("  ⚠️  WARNING: <20 requests/second")
        
        print("\n✅ Performance tests completed!")

if __name__ == '__main__':
    tester = PerformanceTester()
    tester.run_performance_tests()
