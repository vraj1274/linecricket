#!/usr/bin/env python3
"""
Test script to verify search functionality
"""

import requests
import json

# Test the search endpoints
BASE_URL = "http://localhost:5000"

def test_search_endpoints():
    """Test the search endpoints"""
    
    print("Testing Search Functionality...")
    print("=" * 50)
    
    # Test main search endpoint
    print("\n1. Testing main search endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/search?q=cricket&category=all")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Success: {data.get('success', False)}")
            print(f"Results count: {len(data.get('results', []))}")
            print(f"Query: {data.get('query', 'N/A')}")
            print(f"Category: {data.get('category', 'N/A')}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test trending content endpoint
    print("\n2. Testing trending content endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/search/trending?category=all")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Success: {data.get('success', False)}")
            print(f"Results count: {len(data.get('results', []))}")
            print(f"Category: {data.get('category', 'N/A')}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test specific category searches
    categories = ['location', 'academy', 'job', 'coach', 'community']
    
    for category in categories:
        print(f"\n3. Testing {category} search...")
        try:
            response = requests.get(f"{BASE_URL}/api/search?q=test&category={category}")
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"Success: {data.get('success', False)}")
                print(f"Results count: {len(data.get('results', []))}")
            else:
                print(f"Error: {response.text}")
        except Exception as e:
            print(f"Error: {e}")
    
    print("\n" + "=" * 50)
    print("Search functionality test completed!")

if __name__ == "__main__":
    test_search_endpoints()


