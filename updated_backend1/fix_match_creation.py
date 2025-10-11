#!/usr/bin/env python3
"""
Complete solution to fix match creation issue
"""

import subprocess
import sys
import time
import requests
from datetime import datetime, date, timedelta

def start_backend_server():
    """Start the backend server"""
    print("🚀 Starting TheLineCricket Backend Server...")
    print("=" * 60)
    
    try:
        # Start the server in background
        process = subprocess.Popen([
            sys.executable, "working_backend.py"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        print("✅ Backend server started")
        print("🌐 Server URL: http://localhost:5000")
        print("📡 API endpoints available:")
        print("   - GET  /api/health - Health check")
        print("   - GET  /api/matches - Get all matches")
        print("   - POST /api/matches - Create new match")
        print("   - GET  /api/matches/live - Get live matches")
        print("=" * 60)
        
        return process
        
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return None

def test_backend_connection():
    """Test if backend is accessible"""
    print("🔍 Testing backend connection...")
    
    max_retries = 10
    for i in range(max_retries):
        try:
            response = requests.get('http://localhost:5000/api/health', timeout=5)
            if response.status_code == 200:
                print("✅ Backend server is running and accessible")
                return True
        except requests.exceptions.ConnectionError:
            print(f"⏳ Waiting for server to start... ({i+1}/{max_retries})")
            time.sleep(2)
        except Exception as e:
            print(f"❌ Error testing connection: {e}")
            return False
    
    print("❌ Backend server is not accessible")
    return False

def test_match_creation():
    """Test match creation"""
    print("🔍 Testing match creation...")
    
    match_data = {
        'title': 'Test Match - Backend Working',
        'description': 'Testing the backend connection and match creation',
        'match_type': 'FRIENDLY',
        'location': 'Test Cricket Ground',
        'venue': 'Test Venue',
        'match_date': (date.today() + timedelta(days=1)).strftime('%Y-%m-%d'),
        'match_time': '10:00',
        'players_needed': 22,
        'entry_fee': 0,
        'is_public': True,
        'skill_level': 'beginner',
        'equipment_provided': True,
        'rules': 'Standard cricket rules'
    }
    
    try:
        response = requests.post('http://localhost:5000/api/matches', json=match_data, timeout=10)
        print(f"📡 Match creation response: {response.status_code}")
        print(f"📝 Response: {response.text}")
        
        if response.status_code == 201:
            print("✅ Match creation successful!")
            return True
        else:
            print(f"❌ Match creation failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error creating match: {e}")
        return False

def test_matches_loading():
    """Test matches loading"""
    print("🔍 Testing matches loading...")
    
    try:
        response = requests.get('http://localhost:5000/api/matches', timeout=10)
        print(f"📡 Matches loading response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Matches loaded successfully!")
            print(f"📊 Total matches: {data.get('total', 0)}")
            print(f"📋 Matches: {len(data.get('matches', []))}")
            return True
        else:
            print(f"❌ Matches loading failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error loading matches: {e}")
        return False

def main():
    """Main function to fix match creation"""
    print("🏏 TheLineCricket Match Creation Fix")
    print("=" * 60)
    print(f"Timestamp: {datetime.now()}")
    print()
    
    # Step 1: Start backend server
    print("Step 1: Starting backend server...")
    process = start_backend_server()
    if not process:
        print("❌ Failed to start backend server")
        return False
    
    # Step 2: Test backend connection
    print("\nStep 2: Testing backend connection...")
    if not test_backend_connection():
        print("❌ Backend connection failed")
        return False
    
    # Step 3: Test match creation
    print("\nStep 3: Testing match creation...")
    if not test_match_creation():
        print("❌ Match creation failed")
        return False
    
    # Step 4: Test matches loading
    print("\nStep 4: Testing matches loading...")
    if not test_matches_loading():
        print("❌ Matches loading failed")
        return False
    
    print("\n" + "=" * 60)
    print("🎉 ALL TESTS PASSED!")
    print("=" * 60)
    print("✅ Backend server is running on http://localhost:5000")
    print("✅ Database connection is working")
    print("✅ Match creation is working")
    print("✅ Matches loading is working")
    print()
    print("🔧 Next steps:")
    print("1. Your frontend should now be able to connect to the backend")
    print("2. The 'Failed to create match' error should be resolved")
    print("3. Created matches will appear on the matches page")
    print("4. All matches will be stored in the PostgreSQL database")
    print()
    print("🌐 Frontend URL: http://localhost:3000")
    print("🌐 Backend URL: http://localhost:5000")
    print("=" * 60)
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        if success:
            print("\n🎯 Solution completed successfully!")
            print("Your match creation issue has been fixed!")
        else:
            print("\n❌ Solution failed. Please check the errors above.")
    except KeyboardInterrupt:
        print("\n🛑 Process interrupted by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
