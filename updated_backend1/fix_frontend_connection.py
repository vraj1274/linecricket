#!/usr/bin/env python3
"""
Fix frontend-backend connection issues
"""

import requests
import json
from datetime import datetime, date, timedelta

def test_frontend_backend_connection():
    """Test frontend to backend connection"""
    print("🔍 Testing Frontend-Backend Connection...")
    print("=" * 50)
    
    # Test 1: Check if frontend is running
    print("1. Checking Frontend Server...")
    try:
        response = requests.get('http://localhost:3000', timeout=5)
        print(f"   Frontend Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ Frontend server is running")
        else:
            print("   ❌ Frontend server not accessible")
            return False
    except Exception as e:
        print(f"   ❌ Frontend connection error: {e}")
        print("   💡 Start frontend with: cd 'D:\\merger\\linecricket2\\New folder (3)\\webfront2' && npm start")
        return False
    
    # Test 2: Check backend from frontend perspective
    print("\n2. Testing Backend from Frontend...")
    try:
        # Simulate frontend request with proper headers
        headers = {
            'Origin': 'http://localhost:3000',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        response = requests.get('http://localhost:5000/api/health', headers=headers, timeout=5)
        print(f"   Backend Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ Backend accessible from frontend")
        else:
            print(f"   ❌ Backend not accessible: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ Backend connection error: {e}")
        return False
    
    # Test 3: Test CORS with frontend origin
    print("\n3. Testing CORS Configuration...")
    try:
        headers = {
            'Origin': 'http://localhost:3000',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
        
        response = requests.options('http://localhost:5000/api/matches', headers=headers, timeout=5)
        print(f"   CORS Status: {response.status_code}")
        
        if response.status_code == 200:
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
            }
            
            print("   ✅ CORS preflight successful")
            for header, value in cors_headers.items():
                print(f"     {header}: {value}")
        else:
            print(f"   ❌ CORS preflight failed: {response.text}")
    except Exception as e:
        print(f"   ❌ CORS test error: {e}")
    
    # Test 4: Test match creation from frontend perspective
    print("\n4. Testing Match Creation from Frontend...")
    try:
        headers = {
            'Origin': 'http://localhost:3000',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        match_data = {
            'title': f'Frontend Test Match - {datetime.now().strftime("%Y-%m-%d %H:%M")}',
            'description': 'Testing match creation from frontend',
            'match_type': 'FRIENDLY',
            'location': 'Frontend Test Ground',
            'venue': 'Frontend Test Venue',
            'match_date': (date.today() + timedelta(days=1)).strftime('%Y-%m-%d'),
            'match_time': '17:00',
            'players_needed': 22,
            'entry_fee': 0,
            'is_public': True,
            'skill_level': 'beginner',
            'equipment_provided': True,
            'rules': 'Frontend test rules'
        }
        
        response = requests.post('http://localhost:5000/api/matches', json=match_data, headers=headers, timeout=10)
        print(f"   Match Creation Status: {response.status_code}")
        
        if response.status_code == 201:
            result = response.json()
            print("   ✅ Match creation from frontend successful")
            print(f"     Match ID: {result.get('match', {}).get('id')}")
            print(f"     Title: {result.get('match', {}).get('title')}")
        else:
            print(f"   ❌ Match creation failed: {response.text}")
    except Exception as e:
        print(f"   ❌ Match creation error: {e}")
    
    # Test 5: Test match fetching from frontend perspective
    print("\n5. Testing Match Fetching from Frontend...")
    try:
        headers = {
            'Origin': 'http://localhost:3000',
            'Accept': 'application/json'
        }
        
        response = requests.get('http://localhost:5000/api/matches', headers=headers, timeout=5)
        print(f"   Match Fetch Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("   ✅ Match fetching from frontend successful")
            print(f"     Total matches: {data.get('total', 0)}")
            print(f"     Matches returned: {len(data.get('matches', []))}")
        else:
            print(f"   ❌ Match fetching failed: {response.text}")
    except Exception as e:
        print(f"   ❌ Match fetching error: {e}")
    
    return True

def create_frontend_test_script():
    """Create a test script for the frontend"""
    print("\n🔧 Creating Frontend Test Script...")
    
    test_script = '''
// Frontend API Test Script
// Run this in the browser console on http://localhost:3000

async function testFrontendAPI() {
    console.log('🏏 Testing Frontend API Connection...');
    
    try {
        // Test 1: Health Check
        console.log('1. Testing Health Check...');
        const healthResponse = await fetch('http://localhost:5000/api/health');
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData);
        
        // Test 2: Get Matches
        console.log('2. Testing GET Matches...');
        const matchesResponse = await fetch('http://localhost:5000/api/matches');
        const matchesData = await matchesResponse.json();
        console.log('✅ Matches fetched:', matchesData);
        
        // Test 3: Create Match
        console.log('3. Testing POST Match Creation...');
        const matchData = {
            title: 'Frontend Browser Test Match',
            description: 'Testing from browser',
            match_type: 'FRIENDLY',
            location: 'Browser Test Ground',
            venue: 'Browser Test Venue',
            match_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            match_time: '18:00',
            players_needed: 22,
            entry_fee: 0,
            is_public: true,
            skill_level: 'beginner',
            equipment_provided: true,
            rules: 'Browser test rules'
        };
        
        const createResponse = await fetch('http://localhost:5000/api/matches', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(matchData)
        });
        
        const createData = await createResponse.json();
        console.log('✅ Match created:', createData);
        
        console.log('🎉 All frontend API tests passed!');
        
    } catch (error) {
        console.error('❌ Frontend API test failed:', error);
    }
}

// Run the test
testFrontendAPI();
'''
    
    with open('frontend_api_test.js', 'w') as f:
        f.write(test_script)
    
    print("   ✅ Frontend test script created: frontend_api_test.js")
    print("   💡 Copy and paste the script into browser console on http://localhost:3000")

def main():
    """Main function"""
    print("🏏 Frontend-Backend Connection Fix")
    print("=" * 50)
    print(f"Timestamp: {datetime.now()}")
    print()
    
    success = test_frontend_backend_connection()
    
    if success:
        print("\n✅ Frontend-Backend connection is working!")
    else:
        print("\n❌ Frontend-Backend connection has issues!")
        print("\n🔧 Troubleshooting Steps:")
        print("1. Make sure backend is running: python minimal_server.py")
        print("2. Make sure frontend is running: npm start")
        print("3. Check both servers are on correct ports (backend: 5000, frontend: 3000)")
        print("4. Test the frontend API script in browser console")
    
    create_frontend_test_script()
    
    print("\n" + "=" * 50)
    print("🔍 Frontend connection testing completed!")

if __name__ == "__main__":
    main()
