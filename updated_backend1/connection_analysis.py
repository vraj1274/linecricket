#!/usr/bin/env python3
"""
Comprehensive Connection Analysis for TheLineCricket
Tests database, backend, and frontend connections
"""

import requests
import psycopg2
import time
import json
from datetime import datetime, date, timedelta
import subprocess
import sys

class ConnectionAnalyzer:
    def __init__(self):
        self.backend_url = "http://localhost:5000"
        self.frontend_url = "http://localhost:3000"
        self.db_config = {
            'host': 'localhost',
            'port': 5432,
            'database': 'linecricket25',
            'user': 'postgres',
            'password': 'root'
        }
        self.results = {
            'database': False,
            'backend': False,
            'frontend': False,
            'api_endpoints': {},
            'database_tables': {},
            'issues': []
        }

    def test_database_connection(self):
        """Test PostgreSQL database connection"""
        print("🔍 Testing Database Connection...")
        print("-" * 40)
        
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor()
            
            # Test basic connection
            cursor.execute("SELECT version();")
            db_version = cursor.fetchone()[0]
            print(f"✅ Database connected successfully")
            print(f"📊 PostgreSQL version: {db_version}")
            
            # Check if required tables exist
            cursor.execute("""
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
                ORDER BY table_name;
            """)
            tables = [row[0] for row in cursor.fetchall()]
            print(f"📋 Available tables: {len(tables)}")
            
            # Check critical tables
            critical_tables = ['users', 'matches', 'match_participants']
            missing_tables = []
            for table in critical_tables:
                if table in tables:
                    # Get row count
                    cursor.execute(f"SELECT COUNT(*) FROM {table};")
                    count = cursor.fetchone()[0]
                    self.results['database_tables'][table] = count
                    print(f"   ✅ {table}: {count} rows")
                else:
                    missing_tables.append(table)
                    print(f"   ❌ {table}: MISSING")
            
            if missing_tables:
                self.results['issues'].append(f"Missing critical tables: {missing_tables}")
            
            # Test sample data
            cursor.execute("SELECT COUNT(*) FROM users;")
            user_count = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM matches;")
            match_count = cursor.fetchone()[0]
            
            print(f"👥 Users in database: {user_count}")
            print(f"🏏 Matches in database: {match_count}")
            
            cursor.close()
            conn.close()
            
            self.results['database'] = True
            print("✅ Database connection test PASSED")
            return True
            
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            self.results['issues'].append(f"Database connection error: {str(e)}")
            return False

    def test_backend_connection(self):
        """Test Flask backend server"""
        print("\n🔍 Testing Backend Connection...")
        print("-" * 40)
        
        try:
            # Test health endpoint
            response = requests.get(f"{self.backend_url}/api/health", timeout=5)
            if response.status_code == 200:
                print("✅ Backend server is running")
                health_data = response.json()
                print(f"📊 Health status: {health_data.get('status')}")
                print(f"⏰ Timestamp: {health_data.get('timestamp')}")
                self.results['backend'] = True
            else:
                print(f"❌ Backend health check failed: {response.status_code}")
                self.results['issues'].append(f"Backend health check failed: {response.status_code}")
                return False
                
        except requests.exceptions.ConnectionError:
            print("❌ Backend server is not running or not accessible")
            self.results['issues'].append("Backend server not accessible")
            return False
        except Exception as e:
            print(f"❌ Backend connection error: {e}")
            self.results['issues'].append(f"Backend connection error: {str(e)}")
            return False

    def test_api_endpoints(self):
        """Test all API endpoints"""
        print("\n🔍 Testing API Endpoints...")
        print("-" * 40)
        
        endpoints = [
            ('GET', '/api/health', 'Health check'),
            ('GET', '/api/matches', 'Get matches'),
            ('POST', '/api/matches', 'Create match'),
            ('GET', '/api/matches/live', 'Get live matches')
        ]
        
        for method, endpoint, description in endpoints:
            try:
                if method == 'GET':
                    response = requests.get(f"{self.backend_url}{endpoint}", timeout=5)
                elif method == 'POST' and endpoint == '/api/matches':
                    # Test match creation
                    match_data = {
                        'title': f'Connection Test Match - {datetime.now().strftime("%Y-%m-%d %H:%M")}',
                        'description': 'Testing API connection',
                        'match_type': 'FRIENDLY',
                        'location': 'Test Ground',
                        'venue': 'Test Venue',
                        'match_date': (date.today() + timedelta(days=1)).strftime('%Y-%m-%d'),
                        'match_time': '10:00',
                        'players_needed': 22,
                        'entry_fee': 0,
                        'is_public': True,
                        'skill_level': 'beginner',
                        'equipment_provided': True,
                        'rules': 'Standard rules'
                    }
                    response = requests.post(f"{self.backend_url}{endpoint}", json=match_data, timeout=10)
                
                if response.status_code in [200, 201]:
                    print(f"✅ {method} {endpoint}: {response.status_code} - {description}")
                    self.results['api_endpoints'][f"{method} {endpoint}"] = {
                        'status': response.status_code,
                        'working': True
                    }
                else:
                    print(f"❌ {method} {endpoint}: {response.status_code} - {description}")
                    self.results['api_endpoints'][f"{method} {endpoint}"] = {
                        'status': response.status_code,
                        'working': False,
                        'error': response.text
                    }
                    self.results['issues'].append(f"API endpoint {method} {endpoint} failed: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ {method} {endpoint}: ERROR - {str(e)}")
                self.results['api_endpoints'][f"{method} {endpoint}"] = {
                    'status': 'ERROR',
                    'working': False,
                    'error': str(e)
                }
                self.results['issues'].append(f"API endpoint {method} {endpoint} error: {str(e)}")

    def test_frontend_connection(self):
        """Test React frontend connection"""
        print("\n🔍 Testing Frontend Connection...")
        print("-" * 40)
        
        try:
            response = requests.get(self.frontend_url, timeout=5)
            if response.status_code == 200:
                print("✅ Frontend server is running")
                print(f"📊 Frontend URL: {self.frontend_url}")
                self.results['frontend'] = True
                return True
            else:
                print(f"❌ Frontend connection failed: {response.status_code}")
                self.results['issues'].append(f"Frontend connection failed: {response.status_code}")
                return False
                
        except requests.exceptions.ConnectionError:
            print("❌ Frontend server is not running or not accessible")
            self.results['issues'].append("Frontend server not accessible")
            return False
        except Exception as e:
            print(f"❌ Frontend connection error: {e}")
            self.results['issues'].append(f"Frontend connection error: {str(e)}")
            return False

    def test_cors_configuration(self):
        """Test CORS configuration between frontend and backend"""
        print("\n🔍 Testing CORS Configuration...")
        print("-" * 40)
        
        try:
            # Test CORS preflight request
            headers = {
                'Origin': self.frontend_url,
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
            
            response = requests.options(f"{self.backend_url}/api/matches", headers=headers, timeout=5)
            
            if response.status_code == 200:
                cors_headers = {
                    'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                    'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                    'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
                }
                
                print("✅ CORS preflight request successful")
                for header, value in cors_headers.items():
                    if value:
                        print(f"   {header}: {value}")
                    else:
                        print(f"   {header}: NOT SET")
                        self.results['issues'].append(f"CORS header {header} not set")
            else:
                print(f"❌ CORS preflight request failed: {response.status_code}")
                self.results['issues'].append(f"CORS preflight failed: {response.status_code}")
                
        except Exception as e:
            print(f"❌ CORS test error: {e}")
            self.results['issues'].append(f"CORS test error: {str(e)}")

    def test_data_flow(self):
        """Test complete data flow from frontend to backend to database"""
        print("\n🔍 Testing Complete Data Flow...")
        print("-" * 40)
        
        try:
            # Create a test match
            match_data = {
                'title': f'Data Flow Test Match - {datetime.now().strftime("%Y-%m-%d %H:%M")}',
                'description': 'Testing complete data flow',
                'match_type': 'FRIENDLY',
                'location': 'Data Flow Test Ground',
                'venue': 'Test Venue',
                'match_date': (date.today() + timedelta(days=1)).strftime('%Y-%m-%d'),
                'match_time': '14:00',
                'players_needed': 22,
                'entry_fee': 0,
                'is_public': True,
                'skill_level': 'intermediate',
                'equipment_provided': True,
                'rules': 'Standard cricket rules'
            }
            
            # Step 1: Create match via API
            print("Step 1: Creating match via API...")
            response = requests.post(f"{self.backend_url}/api/matches", json=match_data, timeout=10)
            
            if response.status_code == 201:
                result = response.json()
                match_id = result.get('match_id')
                print(f"✅ Match created successfully: {match_id}")
                
                # Step 2: Verify match in database
                print("Step 2: Verifying match in database...")
                conn = psycopg2.connect(**self.db_config)
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM matches WHERE id = %s", (match_id,))
                match_record = cursor.fetchone()
                
                if match_record:
                    print("✅ Match found in database")
                    print(f"   Title: {match_record[2] if len(match_record) > 2 else 'N/A'}")
                    print(f"   Type: {match_record[4] if len(match_record) > 4 else 'N/A'}")
                    print(f"   Location: {match_record[5] if len(match_record) > 5 else 'N/A'}")
                else:
                    print("❌ Match not found in database")
                    self.results['issues'].append("Match not found in database after creation")
                
                cursor.close()
                conn.close()
                
                # Step 3: Fetch matches via API
                print("Step 3: Fetching matches via API...")
                response = requests.get(f"{self.backend_url}/api/matches", timeout=5)
                
                if response.status_code == 200:
                    data = response.json()
                    matches = data.get('matches', [])
                    print(f"✅ Matches fetched successfully: {len(matches)} matches")
                    
                    # Check if our test match is in the results
                    test_match = next((m for m in matches if m.get('id') == match_id), None)
                    if test_match:
                        print("✅ Test match found in API response")
                    else:
                        print("❌ Test match not found in API response")
                        self.results['issues'].append("Test match not found in API response")
                else:
                    print(f"❌ Failed to fetch matches: {response.status_code}")
                    self.results['issues'].append(f"Failed to fetch matches: {response.status_code}")
                
                print("✅ Complete data flow test PASSED")
                return True
            else:
                print(f"❌ Match creation failed: {response.status_code}")
                print(f"Response: {response.text}")
                self.results['issues'].append(f"Match creation failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Data flow test error: {e}")
            self.results['issues'].append(f"Data flow test error: {str(e)}")
            return False

    def generate_report(self):
        """Generate comprehensive connection report"""
        print("\n" + "=" * 60)
        print("📊 CONNECTION ANALYSIS REPORT")
        print("=" * 60)
        print(f"Timestamp: {datetime.now()}")
        print()
        
        # Overall status
        all_connected = all([
            self.results['database'],
            self.results['backend'],
            self.results['frontend']
        ])
        
        if all_connected:
            print("🎉 OVERALL STATUS: ALL CONNECTIONS WORKING")
        else:
            print("⚠️ OVERALL STATUS: SOME CONNECTIONS FAILED")
        
        print()
        
        # Individual component status
        print("📋 COMPONENT STATUS:")
        print(f"   Database: {'✅ WORKING' if self.results['database'] else '❌ FAILED'}")
        print(f"   Backend:  {'✅ WORKING' if self.results['backend'] else '❌ FAILED'}")
        print(f"   Frontend: {'✅ WORKING' if self.results['frontend'] else '❌ FAILED'}")
        print()
        
        # API endpoints status
        print("🔗 API ENDPOINTS STATUS:")
        for endpoint, status in self.results['api_endpoints'].items():
            status_icon = "✅" if status['working'] else "❌"
            print(f"   {status_icon} {endpoint}: {status['status']}")
        print()
        
        # Database tables status
        print("🗄️ DATABASE TABLES STATUS:")
        for table, count in self.results['database_tables'].items():
            print(f"   ✅ {table}: {count} rows")
        print()
        
        # Issues
        if self.results['issues']:
            print("⚠️ ISSUES FOUND:")
            for i, issue in enumerate(self.results['issues'], 1):
                print(f"   {i}. {issue}")
            print()
        else:
            print("✅ NO ISSUES FOUND")
            print()
        
        # Recommendations
        print("💡 RECOMMENDATIONS:")
        if not self.results['database']:
            print("   1. Check PostgreSQL server is running on port 5432")
            print("   2. Verify database 'linecricket25' exists")
            print("   3. Check database credentials")
        
        if not self.results['backend']:
            print("   1. Start Flask backend server: python minimal_server.py")
            print("   2. Check backend is running on port 5000")
            print("   3. Verify database connection in backend")
        
        if not self.results['frontend']:
            print("   1. Start React frontend: npm start")
            print("   2. Check frontend is running on port 3000")
            print("   3. Verify frontend can connect to backend")
        
        if self.results['issues']:
            print("   4. Fix the issues listed above")
        
        print("=" * 60)
        
        return all_connected

    def run_analysis(self):
        """Run complete connection analysis"""
        print("🏏 TheLineCricket Connection Analysis")
        print("=" * 60)
        print(f"Timestamp: {datetime.now()}")
        print()
        
        # Test all connections
        self.test_database_connection()
        self.test_backend_connection()
        self.test_api_endpoints()
        self.test_frontend_connection()
        self.test_cors_configuration()
        self.test_data_flow()
        
        # Generate report
        return self.generate_report()

def main():
    """Main function"""
    analyzer = ConnectionAnalyzer()
    
    try:
        success = analyzer.run_analysis()
        
        if success:
            print("\n🎯 ANALYSIS COMPLETED SUCCESSFULLY!")
            print("All connections are working properly!")
        else:
            print("\n❌ ANALYSIS COMPLETED WITH ISSUES!")
            print("Please fix the issues listed above.")
            
    except KeyboardInterrupt:
        print("\n🛑 Analysis interrupted by user")
    except Exception as e:
        print(f"\n❌ Analysis error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
