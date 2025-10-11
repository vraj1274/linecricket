#!/usr/bin/env python3
"""
Flask app with PostgreSQL database connection for TheLineCricket
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date, time
import os
import uuid
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Database configuration for PostgreSQL
app.config['SECRET_KEY'] = 'dev-secret-key-change-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:root@localhost:5432/linecricket25'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
CORS(app, origins=['http://localhost:3000', 'http://localhost:3001'], supports_credentials=True)

# User model
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    firebase_uid = db.Column(db.String(128), unique=True, nullable=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'firebase_uid': self.firebase_uid,
            'username': self.username,
            'email': self.email,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

# Match model
class Match(db.Model):
    __tablename__ = 'matches'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    creator_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
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
    team1_name = db.Column(db.String(100))
    team2_name = db.Column(db.String(100))
    team1_score = db.Column(db.String(50))
    team2_score = db.Column(db.String(50))
    current_over = db.Column(db.String(20))
    match_summary = db.Column(db.Text)
    stream_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    creator = db.relationship('User', backref='created_matches')
    
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
            'team1_name': self.team1_name,
            'team2_name': self.team2_name,
            'team1_score': self.team1_score,
            'team2_score': self.team2_score,
            'current_over': self.current_over,
            'match_summary': self.match_summary,
            'stream_url': self.stream_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'creator': self.creator.to_dict() if self.creator else None
        }

# Match Participant model
class MatchParticipant(db.Model):
    __tablename__ = 'match_participants'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    match_id = db.Column(db.String(36), db.ForeignKey('matches.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    match = db.relationship('Match', backref='participants')
    user = db.relationship('User', backref='match_participations')
    
    def to_dict(self):
        return {
            'id': self.id,
            'match_id': self.match_id,
            'user_id': self.user_id,
            'joined_at': self.joined_at.isoformat() if self.joined_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

# Health endpoint
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'database': 'connected'
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
            logger.error(f"Error fetching matches: {e}")
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            
            # Use existing user ID from database
            test_user = User.query.first()
            if not test_user:
                # Create a test user if none exists
                test_user = User(
                    firebase_uid='test-firebase-uid',
                    username='testuser',
                    email='test@example.com',
                    is_active=True,
                    is_verified=True
                )
                db.session.add(test_user)
                db.session.commit()
            
            current_user_id = test_user.id
            
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
                status='UPCOMING',
                team1_name=data.get('team1_name'),
                team2_name=data.get('team2_name')
            )
            
            db.session.add(new_match)
            db.session.commit()
            
            logger.info(f"✅ Match created successfully: {new_match.title}")
            
            return jsonify({
                'message': 'Match created successfully',
                'match': new_match.to_dict()
            }), 201
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating match: {e}")
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
        logger.error(f"Error fetching live matches: {e}")
        return jsonify({'error': str(e)}), 500

# Join match endpoint
@app.route('/api/matches/<match_id>/join', methods=['POST', 'OPTIONS'])
def join_match(match_id):
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'CORS preflight'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        # Get test user
        test_user = User.query.first()
        if not test_user:
            return jsonify({'error': 'No users found'}), 404
        
        # Check if match exists
        match = Match.query.get(match_id)
        if not match:
            return jsonify({'error': 'Match not found'}), 404
        
        # Check if user is already a participant
        existing_participant = MatchParticipant.query.filter_by(
            match_id=match_id,
            user_id=test_user.id
        ).first()
        
        if existing_participant:
            return jsonify({
                'message': 'You are already a participant in this match',
                'participants_count': match.participants.count()
            }), 200
        
        # Add participant
        participant = MatchParticipant(
            match_id=match_id,
            user_id=test_user.id
        )
        
        db.session.add(participant)
        db.session.commit()
        
        return jsonify({
            'message': 'Successfully joined the match',
            'participants_count': match.participants.count()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error joining match: {e}")
        return jsonify({'error': str(e)}), 500

def create_tables():
    """Create all database tables"""
    try:
        with app.app_context():
            db.create_all()
            logger.info("✅ Database tables created/verified")
            
            # Check if we have any users
            user_count = User.query.count()
            logger.info(f"📊 Users in database: {user_count}")
            
            # Check if we have any matches
            match_count = Match.query.count()
            logger.info(f"📊 Matches in database: {match_count}")
            
            return True
    except Exception as e:
        logger.error(f"❌ Error creating tables: {e}")
        return False

if __name__ == '__main__':
    print("🚀 Starting TheLineCricket Backend with PostgreSQL Database...")
    print("=" * 60)
    print("🗄️ Database: PostgreSQL linecricket25")
    print("🌐 Server: http://localhost:5000")
    print("📡 API endpoints:")
    print("   - GET  /api/health - Health check")
    print("   - GET  /api/matches - Get all matches")
    print("   - POST /api/matches - Create new match")
    print("   - GET  /api/matches/live - Get live matches")
    print("   - POST /api/matches/<id>/join - Join match")
    print("=" * 60)
    
    try:
        # Create tables
        if create_tables():
            print("✅ Database connection successful")
            print("🌐 Starting Flask server...")
            
            app.run(
                host='0.0.0.0',
                port=5000,
                debug=True,
                use_reloader=False
            )
        else:
            print("❌ Failed to connect to database")
            
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        import traceback
        traceback.print_exc()
