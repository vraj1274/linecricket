#!/usr/bin/env python3
"""
Run TheLineCricket Backend Server with PostgreSQL Database
"""

import sys
import os
import traceback
from datetime import datetime, date, timedelta

def test_database_connection():
    """Test PostgreSQL database connection"""
    try:
        import psycopg2
        conn = psycopg2.connect(
            host='localhost',
            port=5432,
            database='linecricket25',
            user='postgres',
            password='root'
        )
        print("✅ PostgreSQL database connection successful")
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def start_flask_server():
    """Start the Flask server"""
    try:
        print("🚀 Starting TheLineCricket Backend Server...")
        print("=" * 60)
        
        # Test database connection first
        if not test_database_connection():
            print("❌ Cannot start server without database connection")
            return False
        
        # Import Flask app
        from app_with_db import app, db, Match, User, MatchParticipant
        
        print("✅ Flask app imported successfully")
        print("🗄️ Database: PostgreSQL linecricket25")
        print("🌐 Server: http://localhost:5000")
        print("📡 API endpoints:")
        print("   - GET  /api/health - Health check")
        print("   - GET  /api/matches - Get all matches")
        print("   - POST /api/matches - Create new match")
        print("   - GET  /api/matches/live - Get live matches")
        print("   - POST /api/matches/<id>/join - Join match")
        print("=" * 60)
        
        # Create tables
        with app.app_context():
            db.create_all()
            print("✅ Database tables created/verified")
            
            # Check existing data
            user_count = User.query.count()
            match_count = Match.query.count()
            print(f"📊 Users in database: {user_count}")
            print(f"📊 Matches in database: {match_count}")
            
            # Create test user if none exists
            if user_count == 0:
                test_user = User(
                    firebase_uid='test-firebase-uid-123',
                    username='testuser',
                    email='test@example.com',
                    is_active=True,
                    is_verified=True
                )
                db.session.add(test_user)
                db.session.commit()
                print("✅ Test user created")
        
        print("🌐 Starting Flask server...")
        print("Press Ctrl+C to stop the server")
        print("=" * 60)
        
        # Start the server
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True,
            use_reloader=False
        )
        
    except ImportError as e:
        print(f"❌ Import Error: {e}")
        print("🔧 Make sure you're in the correct directory")
        print("📁 Current directory:", os.getcwd())
        return False
        
    except Exception as e:
        print(f"❌ Server Error: {e}")
        print("🔍 Full traceback:")
        traceback.print_exc()
        return False

def test_server_endpoints():
    """Test server endpoints after starting"""
    try:
        import requests
        import time
        
        print("\n🔍 Testing server endpoints...")
        
        # Wait for server to start
        time.sleep(2)
        
        # Test health endpoint
        response = requests.get('http://localhost:5000/api/health', timeout=5)
        if response.status_code == 200:
            print("✅ Health endpoint working")
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
        
        # Test matches endpoint
        response = requests.get('http://localhost:5000/api/matches', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Matches endpoint working - {data.get('total', 0)} matches found")
        else:
            print(f"❌ Matches endpoint failed: {response.status_code}")
            return False
        
        # Test match creation
        match_data = {
            'title': 'Test Match - Database Connected',
            'description': 'Testing database connection and match creation',
            'match_type': 'friendly',
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
        
        response = requests.post('http://localhost:5000/api/matches', json=match_data, timeout=5)
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Match creation working - Match ID: {data.get('match', {}).get('id')}")
        else:
            print(f"❌ Match creation failed: {response.status_code} - {response.text}")
            return False
        
        print("🎉 All endpoints working correctly!")
        return True
        
    except Exception as e:
        print(f"❌ Error testing endpoints: {e}")
        return False

if __name__ == "__main__":
    print("🏏 TheLineCricket Backend Server")
    print("=" * 60)
    print(f"Timestamp: {datetime.now()}")
    print(f"Directory: {os.getcwd()}")
    print()
    
    # Start the server
    try:
        start_flask_server()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Server crashed: {e}")
        traceback.print_exc()
