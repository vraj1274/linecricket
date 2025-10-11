#!/usr/bin/env python3
"""
Simple Flask app for testing match functionality
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date, time
import os
import uuid

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = 'dev-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:root@localhost:5432/linecricket25'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
CORS(app, origins=['http://localhost:3000', 'http://localhost:3001'], supports_credentials=True)

# Simple Match model
class Match(db.Model):
    __tablename__ = 'matches'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    creator_id = db.Column(db.String(36), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    match_type = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    venue = db.Column(db.String(200))
    match_date = db.Column(db.Date, nullable=False)
    match_time = db.Column(db.Time, nullable=False)
    players_needed = db.Column(db.Integer, nullable=False)
    entry_fee = db.Column(db.Float, default=0.0)
    is_public = db.Column(db.Boolean, default=True)
    skill_level = db.Column(db.String(50), default='All levels')
    equipment_provided = db.Column(db.Boolean, default=False)
    rules = db.Column(db.Text)
    status = db.Column(db.String(20), default='UPCOMING')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'creator_id': self.creator_id,
            'title': self.title,
            'description': self.description,
            'match_type': self.match_type,
            'location': self.location,
            'venue': self.venue,
            'match_date': self.match_date.isoformat() if self.match_date else None,
            'match_time': self.match_time.strftime('%H:%M') if self.match_time else None,
            'players_needed': self.players_needed,
            'entry_fee': self.entry_fee,
            'is_public': self.is_public,
            'skill_level': self.skill_level,
            'equipment_provided': self.equipment_provided,
            'rules': self.rules,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

# Health endpoint
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

# Matches endpoints
@app.route('/api/matches', methods=['GET', 'POST', 'OPTIONS'])
def matches():
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'CORS preflight'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        return response
    
    if request.method == 'GET':
        try:
            # Get query parameters
            status = request.args.get('status', 'upcoming')
            match_type = request.args.get('match_type', 'all')
            page = int(request.args.get('page', 1))
            per_page = int(request.args.get('per_page', 10))
            
            # Build query
            query = Match.query
            
            # Filter by status
            if status == 'upcoming':
                query = query.filter(Match.match_date >= date.today())
            elif status == 'live':
                query = query.filter(Match.match_date == date.today())
            elif status == 'completed':
                query = query.filter(Match.match_date < date.today())
            
            # Filter by match type
            if match_type != 'all':
                query = query.filter(Match.match_type == match_type)
            
            # Order by match date
            query = query.order_by(Match.match_date.asc(), Match.match_time.asc())
            
            # Get matches
            matches = query.all()
            
            # Convert to dictionary
            matches_data = [match.to_dict() for match in matches]
            
            return jsonify({
                'matches': matches_data,
                'total': len(matches_data),
                'page': page,
                'per_page': per_page,
                'pages': 1,
                'has_next': False,
                'has_prev': False
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            
            # Use a test user ID
            current_user_id = "550e8400-e29b-41d4-a716-446655440000"
            
            # Validate required fields
            required_fields = ['title', 'match_type', 'location', 'match_date', 'match_time', 'players_needed']
            for field in required_fields:
                if not data.get(field):
                    return jsonify({'error': f'{field} is required'}), 400
            
            # Parse dates
            try:
                match_date = datetime.strptime(data['match_date'], '%Y-%m-%d').date()
                match_time = datetime.strptime(data['match_time'], '%H:%M').time()
            except ValueError as e:
                return jsonify({'error': f'Invalid date/time format: {str(e)}'}), 400
            
            # Create new match
            new_match = Match(
                creator_id=current_user_id,
                title=data['title'],
                description=data.get('description', ''),
                match_type=data['match_type'],
                location=data['location'],
                venue=data.get('venue', ''),
                match_date=match_date,
                match_time=match_time,
                players_needed=data['players_needed'],
                entry_fee=data.get('entry_fee', 0.0),
                is_public=data.get('is_public', True),
                skill_level=data.get('skill_level', 'All levels'),
                equipment_provided=data.get('equipment_provided', False),
                rules=data.get('rules', ''),
                status='UPCOMING'
            )
            
            db.session.add(new_match)
            db.session.commit()
            
            return jsonify({
                'message': 'Match created successfully',
                'match': new_match.to_dict()
            }), 201
            
        except Exception as e:
            db.session.rollback()
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
        # Get live matches
        live_matches = Match.query.filter(
            Match.match_date == date.today(),
            Match.status == 'LIVE'
        ).all()
        
        matches_data = [match.to_dict() for match in live_matches]
        
        return jsonify({
            'matches': matches_data,
            'total': len(matches_data)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Simple TheLineCricket Backend Server...")
    print("=" * 50)
    print("🌐 Server will run on http://localhost:5000")
    print("📡 API endpoints:")
    print("   - GET  /api/health - Health check")
    print("   - GET  /api/matches - Get all matches")
    print("   - POST /api/matches - Create new match")
    print("   - GET  /api/matches/live - Get live matches")
    print("=" * 50)
    
    try:
        with app.app_context():
            db.create_all()
            print("✅ Database tables created/verified")
        
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
