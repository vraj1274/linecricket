#!/usr/bin/env python3
"""
Test script to verify TheLineCricket connection
"""

import requests
import time
import sys

def test_backend():
    """Test backend API connection"""
    try:
        response = requests.get('http://localhost:5000/api/health', timeout=5)
        if response.status_code == 200:
            print("[OK] Backend API is running")
            return True
        else:
            print(f"[ERROR] Backend API returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Backend API connection failed: {e}")
        return False

def test_frontend():
    """Test frontend connection"""
    try:
        response = requests.get('http://localhost:3000', timeout=5)
        if response.status_code == 200:
            print("[OK] Frontend is running")
            return True
        else:
            print(f"[ERROR] Frontend returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Frontend connection failed: {e}")
        return False

def test_database():
    """Test database connection through API"""
    try:
        response = requests.get('http://localhost:5000/api/init-db', timeout=10)
        if response.status_code == 200:
            print("[OK] Database connection is working")
            return True
        else:
            print(f"[ERROR] Database test returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Database test failed: {e}")
        return False

def main():
    """Main test function"""
    print("=" * 60)
    print("TheLineCricket Connection Test")
    print("=" * 60)
    
    print("\nTesting connections...")
    print("(Make sure both servers are running)")
    
    # Test backend
    backend_ok = test_backend()
    
    # Test frontend
    frontend_ok = test_frontend()
    
    # Test database
    database_ok = test_database()
    
    print("\n" + "=" * 60)
    print("Test Results:")
    print("=" * 60)
    print(f"Backend API: {'PASS' if backend_ok else 'FAIL'}")
    print(f"Frontend:    {'PASS' if frontend_ok else 'FAIL'}")
    print(f"Database:    {'PASS' if database_ok else 'FAIL'}")
    
    if backend_ok and frontend_ok and database_ok:
        print("\n[SUCCESS] All connections are working!")
        print("\nYou can now access:")
        print("- Frontend: http://localhost:3000")
        print("- Backend API: http://localhost:5000")
        print("- API Documentation: http://localhost:5000")
        return True
    else:
        print("\n[ERROR] Some connections failed. Check the servers.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)





