#!/usr/bin/env python3
"""
Simple Flask backend for TheLineCricket with PostgreSQL database
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

# Database connection function
def get_db_connection():
    """Get database connection"""
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
        print(f"Database connection error: {e}")
        return None

# Health endpoint
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'database': 'connected'
    })

# Get matches endpoint
@app.route('/api/matches', methods=['GET', 'OPTIONS'])
def get_matches():
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'CORS preflight'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        return response
    
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get query parameters
        status = request.args.get('status', 'upcoming')
        match_type = request.args.get('match_type', 'all')
        
        # Build query
        query = """
            SELECT m.*, u.username as creator_username, u.email as creator_email
            FROM matches m
            LEFT JOIN users u ON m.creator_id = u.id
        """
        
        conditions = []
        params = []
        
        # Filter by status
        if status == 'upcoming':
            conditions.append("m.match_date >= CURRENT_DATE")
        elif status == 'live':
            conditions.append("m.match_date = CURRENT_DATE AND m.status = 'LIVE'")
        elif status == 'completed':
            conditions.append("m.match_date < CURRENT_DATE")
        
        # Filter by match type
        if match_type != 'all':
            conditions.append("m.match_type = %s")
            params.append(match_type)
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        query += " ORDER BY m.match_date ASC, m.match_time ASC"
        
        cursor.execute(query, params)
        matches = cursor.fetchall()
        
        # Convert to list of dictionaries
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
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'matches': matches_data,
            'total': len(matches_data),
            'page': 1,
            'per_page': 10,
            'pages': 1,
            'has_next': False,
            'has_prev': False
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Create match endpoint
@app.route('/api/matches', methods=['POST', 'OPTIONS'])
def create_match():
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'CORS preflight'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        return response
    
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'match_type', 'location', 'match_date', 'match_time', 'players_needed']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        # Get or create test user
        cursor.execute("SELECT id FROM users LIMIT 1")
        user_result = cursor.fetchone()
        
        if not user_result:
            # Create test user
            user_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO users (id, firebase_uid, username, email, is_active, is_verified, auth_provider, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                user_id,
                'test-firebase-uid',
                'testuser',
                'test@example.com',
                True,
                True,
                'firebase',
                datetime.now(),
                datetime.now()
            ))
        else:
            user_id = user_result[0]
        
        # Parse dates
        try:
            match_date = datetime.strptime(data['match_date'], '%Y-%m-%d').date()
            match_time = datetime.strptime(data['match_time'], '%H:%M').time()
        except ValueError as e:
            return jsonify({'error': f'Invalid date/time format: {str(e)}'}), 400
        
        # Create match
        match_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO matches (id, creator_id, title, description, match_type, location, venue, 
                               match_date, match_time, players_needed, entry_fee, is_public, 
                               skill_level, equipment_provided, rules, status, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            match_id,
            user_id,
            data['title'],
            data.get('description', ''),
            data['match_type'],
            data['location'],
            data.get('venue', ''),
            match_date,
            match_time,
            data['players_needed'],
            data.get('entry_fee', 0.0),
            data.get('is_public', True),
            data.get('skill_level', 'All levels'),
            data.get('equipment_provided', False),
            data.get('rules', ''),
            'UPCOMING',
            datetime.now(),
            datetime.now()
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'message': 'Match created successfully',
            'match_id': match_id
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Live matches endpoint
@app.route('/api/matches/live', methods=['GET', 'OPTIONS'])
def get_live_matches():
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'CORS preflight'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        return response
    
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
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
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'matches': matches_data,
            'total': len(matches_data)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting TheLineCricket Backend Server...")
    print("=" * 60)
    print("🗄️ Database: PostgreSQL linecricket25")
    print("🌐 Server: http://localhost:5000")
    print("📡 API endpoints:")
    print("   - GET  /api/health - Health check")
    print("   - GET  /api/matches - Get all matches")
    print("   - POST /api/matches - Create new match")
    print("   - GET  /api/matches/live - Get live matches")
    print("=" * 60)
    
    try:
        # Test database connection
        conn = get_db_connection()
        if conn:
            print("✅ Database connection successful")
            conn.close()
        else:
            print("❌ Database connection failed")
            exit(1)
        
        print("🌐 Starting Flask server...")
        print("Press Ctrl+C to stop the server")
        print("=" * 60)
        
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True,
            use_reloader=False
        )
        
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        import traceback
        traceback.print_exc()
