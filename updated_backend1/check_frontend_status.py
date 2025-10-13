#!/usr/bin/env python3
"""
Check frontend status and test access
"""

import requests
import time

def check_frontend():
    """Check if frontend is accessible and working"""
    
    try:
        print("Checking frontend status...")
        
        # Test frontend access
        response = requests.get('http://localhost:3000', timeout=10)
        print(f"Frontend Status: {response.status_code}")
        
        if response.status_code == 200:
            print("SUCCESS: Frontend is accessible!")
            print("Frontend is running at: http://localhost:3000")
            
            # Check if we can access the profile page
            try:
                # Try to access the profile page directly
                profile_response = requests.get('http://localhost:3000/profile', timeout=5)
                print(f"Profile page status: {profile_response.status_code}")
            except:
                print("Profile page might be a SPA route")
            
            return True
        else:
            print(f"Frontend error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Frontend error: {e}")
        return False

if __name__ == '__main__':
    print("Checking Frontend Status")
    print("=" * 40)
    
    success = check_frontend()
    
    if success:
        print("\nSUCCESS: Frontend is running!")
        print("You can access it at: http://localhost:3000")
        print("Navigate to the profile page to see the new design!")
    else:
        print("\nFrontend is not accessible.")
        print("Please check if it's running properly.")
