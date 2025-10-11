#!/usr/bin/env python3
"""
Debug match creation issue
"""

import requests
import psycopg2
from datetime import datetime, date, timedelta
import json

def debug_match_creation():
    """Debug the match creation process"""
    print("🔍 Debugging Match Creation Process...")
    print("=" * 50)
    
    # Test match data
    match_data = {
        'title': f'Debug Test Match - {datetime.now().strftime("%Y-%m-%d %H:%M")}',
        'description': 'Debugging match creation',
        'match_type': 'FRIENDLY',
        'location': 'Debug Test Ground',
        'venue': 'Debug Venue',
        'match_date': (date.today() + timedelta(days=1)).strftime('%Y-%m-%d'),
        'match_time': '15:00',
        'players_needed': 22,
        'entry_fee': 0,
        'is_public': True,
        'skill_level': 'intermediate',
        'equipment_provided': True,
        'rules': 'Debug rules'
    }
    
    print("📝 Match data to create:")
    print(json.dumps(match_data, indent=2))
    print()
    
    # Step 1: Create match via API
    print("Step 1: Creating match via API...")
    try:
        response = requests.post('http://localhost:5000/api/matches', json=match_data, timeout=10)
        print(f"📡 API Response Status: {response.status_code}")
        print(f"📡 API Response: {response.text}")
        
        if response.status_code == 201:
            result = response.json()
            match_id = result.get('match_id')
            print(f"✅ Match created with ID: {match_id}")
            
            # Step 2: Check database directly
            print("\nStep 2: Checking database directly...")
            conn = psycopg2.connect(
                host='localhost',
                port=5432,
                database='linecricket25',
                user='postgres',
                password='root'
            )
            cursor = conn.cursor()
            
            # Check if match exists
            cursor.execute("SELECT * FROM matches WHERE id = %s", (match_id,))
            match_record = cursor.fetchone()
            
            if match_record:
                print("✅ Match found in database!")
                print(f"   ID: {match_record[0]}")
                print(f"   Title: {match_record[2]}")
                print(f"   Type: {match_record[4]}")
                print(f"   Location: {match_record[5]}")
                print(f"   Date: {match_record[7]}")
                print(f"   Time: {match_record[8]}")
            else:
                print("❌ Match not found in database")
                
                # Check all matches
                cursor.execute("SELECT id, title, match_type FROM matches ORDER BY created_at DESC LIMIT 5")
                all_matches = cursor.fetchall()
                print("📋 Recent matches in database:")
                for match in all_matches:
                    print(f"   - {match[0]}: {match[1]} ({match[2]})")
            
            cursor.close()
            conn.close()
            
            # Step 3: Check API response
            print("\nStep 3: Checking API response...")
            response = requests.get('http://localhost:5000/api/matches', timeout=5)
            if response.status_code == 200:
                data = response.json()
                matches = data.get('matches', [])
                print(f"📊 Total matches from API: {len(matches)}")
                
                # Look for our match
                our_match = next((m for m in matches if m.get('id') == match_id), None)
                if our_match:
                    print("✅ Our match found in API response!")
                    print(f"   Title: {our_match.get('title')}")
                    print(f"   Type: {our_match.get('match_type')}")
                else:
                    print("❌ Our match not found in API response")
                    print("📋 Available matches:")
                    for match in matches:
                        print(f"   - {match.get('id')}: {match.get('title')} ({match.get('match_type')})")
            else:
                print(f"❌ Failed to fetch matches: {response.status_code}")
                
        else:
            print(f"❌ Match creation failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error during match creation: {e}")
        import traceback
        traceback.print_exc()

def check_database_schema():
    """Check database schema for matches table"""
    print("\n🔍 Checking Database Schema...")
    print("=" * 50)
    
    try:
        conn = psycopg2.connect(
            host='localhost',
            port=5432,
            database='linecricket25',
            user='postgres',
            password='root'
        )
        cursor = conn.cursor()
        
        # Check matches table structure
        cursor.execute("""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'matches'
            ORDER BY ordinal_position;
        """)
        
        columns = cursor.fetchall()
        print("📋 Matches table structure:")
        for col in columns:
            print(f"   {col[0]}: {col[1]} {'NULL' if col[2] == 'YES' else 'NOT NULL'} {f'DEFAULT {col[3]}' if col[3] else ''}")
        
        # Check for any constraints
        cursor.execute("""
            SELECT constraint_name, constraint_type
            FROM information_schema.table_constraints
            WHERE table_name = 'matches';
        """)
        
        constraints = cursor.fetchall()
        print("\n📋 Table constraints:")
        for constraint in constraints:
            print(f"   {constraint[0]}: {constraint[1]}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error checking schema: {e}")

def main():
    """Main function"""
    print("🏏 Match Creation Debug Tool")
    print("=" * 50)
    
    debug_match_creation()
    check_database_schema()
    
    print("\n" + "=" * 50)
    print("🔍 Debug completed!")

if __name__ == "__main__":
    main()
