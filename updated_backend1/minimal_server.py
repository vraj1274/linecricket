#!/usr/bin/env python3
"""
Minimal Flask server for match creation and fetching
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, date, time
import json
import uuid

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'http://localhost:3001'], supports_credentials=True)

# Database connection
def get_db():
    try:
        conn = psycopg2.connect(
            host='localhost',
            port=5432,
            database='linecricket25',
            user='postgres',
            password='root'
        )
        return conn
    except Exception as e:
        print(f"Database error: {e}")
        return None

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/matches', methods=['GET', 'POST', 'OPTIONS'])
def matches():
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'CORS preflight'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        return response
    
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if request.method == 'GET':
            # Get matches
            cursor.execute("""
                SELECT m.*, u.username as creator_username
                FROM matches m
                LEFT JOIN users u ON m.creator_id = u.id
                ORDER BY m.match_date ASC, m.match_time ASC
            """)
            matches = cursor.fetchall()
            
            matches_data = []
            for match in matches:
                match_dict = dict(match)
                # Convert datetime objects to strings
                if match_dict.get('match_date'):
                    match_dict['match_date'] = match_dict['match_date'].isoformat()
                if match_dict.get('match_time'):
                    match_dict['match_time'] = match_dict['match_time'].strftime('%H:%M')
                if match_dict.get('created_at'):
                    match_dict['created_at'] = match_dict['created_at'].isoformat()
                if match_dict.get('updated_at'):
                    match_dict['updated_at'] = match_dict['updated_at'].isoformat()
                
                matches_data.append(match_dict)
            
            return jsonify({
                'matches': matches_data,
                'total': len(matches_data),
                'page': 1,
                'per_page': 10,
                'pages': 1,
                'has_next': False,
                'has_prev': False
            }), 200
        
        elif request.method == 'POST':
            # Create match
            data = request.get_json()
            print(f"Creating match: {data}")
            
            # Get or create user
            cursor.execute("SELECT id FROM users LIMIT 1")
            user_result = cursor.fetchone()
            
            if not user_result:
                # Create test user
                user_id = str(uuid.uuid4())
                cursor.execute("""
                    INSERT INTO users (id, firebase_uid, username, email, is_active, is_verified, auth_provider, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    user_id, 'test-firebase-uid', 'testuser', 'test@example.com',
                    True, True, 'firebase', datetime.now(), datetime.now()
                ))
            else:
                user_id = user_result['id']
            
            # Parse dates
            match_date = datetime.strptime(data['match_date'], '%Y-%m-%d').date()
            match_time = datetime.strptime(data['match_time'], '%H:%M').time()
            
            # Create match
            match_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO matches (id, creator_id, title, description, match_type, location, venue,
                                   match_date, match_time, players_needed, entry_fee, is_public,
                                   skill_level, equipment_provided, rules, status, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                match_id, user_id, data['title'], data.get('description', ''),
                data['match_type'], data['location'], data.get('venue', ''),
                match_date, match_time, data['players_needed'], data.get('entry_fee', 0.0),
                data.get('is_public', True), data.get('skill_level', 'All levels'),
                data.get('equipment_provided', False), data.get('rules', ''),
                'UPCOMING', datetime.now(), datetime.now()
            ))
            
            conn.commit()
            
            return jsonify({
                'message': 'Match created successfully',
                'match_id': match_id,
                'success': True
            }), 201
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/matches/live', methods=['GET', 'OPTIONS'])
def live_matches():
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'CORS preflight'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        return response
    
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT m.*, u.username as creator_username
            FROM matches m
            LEFT JOIN users u ON m.creator_id = u.id
            WHERE m.match_date = CURRENT_DATE AND m.status = 'LIVE'
            ORDER BY m.match_time ASC
        """)
        
        matches = cursor.fetchall()
        matches_data = [dict(match) for match in matches]
        
        return jsonify({
            'matches': matches_data,
            'total': len(matches_data)
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    print("🚀 Starting Minimal Match Server...")
    print("=" * 50)
    print("🌐 Server: http://localhost:5000")
    print("📡 Endpoints:")
    print("   - GET  /api/health")
    print("   - GET  /api/matches")
    print("   - POST /api/matches")
    print("   - GET  /api/matches/live")
    print("=" * 50)
    
    # Test database connection
    conn = get_db()
    if conn:
        print("✅ Database connected")
        conn.close()
    else:
        print("❌ Database connection failed")
        exit(1)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
