from flask import Blueprint, request, jsonify
from models.match import Match, MatchParticipant, MatchType, MatchStatus, MatchTeam, MatchUmpire, MatchTeamParticipant
from models.user import User
from models.base import db
from datetime import datetime, date, time
import json
import logging

logger = logging.getLogger(__name__)

matches_bp = Blueprint('matches', __name__)

@matches_bp.route('/', methods=['GET', 'POST', 'OPTIONS'])
@matches_bp.route('', methods=['GET', 'POST', 'OPTIONS'])
def matches():
    """Handle matches - GET for fetching, POST for creating"""
    # Handle CORS preflight request
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'CORS preflight'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        return response
    
    # Handle GET request - fetch matches
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
            
            # Pagination
            matches = query.paginate(
                page=page, 
                per_page=per_page, 
                error_out=False
            )
            
            # Convert matches to dictionary with related data
            matches_data = []
            for match in matches.items:
                match_dict = match.to_dict()
                
                # Add participant count and other computed fields
                match_dict['participants_count'] = 0
                match_dict['can_join'] = True
                match_dict['is_participant'] = False
                
                matches_data.append(match_dict)
            
            return jsonify({
                'matches': matches_data,
                'total': matches.total,
                'page': page,
                'per_page': per_page,
                'pages': matches.pages,
                'has_next': matches.has_next,
                'has_prev': matches.has_prev
            }), 200
            
        except Exception as e:
            logger.error(f"Error fetching matches: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    # Handle POST request - create match
    elif request.method == 'POST':
        try:
            data = request.get_json()
            
            # Use a test user ID for now
            current_user_id = "550e8400-e29b-41d4-a716-446655440000"
            
            # Validate required fields
            required_fields = ['title', 'match_type', 'location', 'match_date', 'match_time', 'players_needed']
            for field in required_fields:
                if not data.get(field):
                    return jsonify({'error': f'{field} is required'}), 400
            
            # Parse match type
            match_type_mapping = {
                't20': 't20',
                'odi': 'odi', 
                'test': 'test',
                'practice': 'practice',
                'friendly': 'FRIENDLY',
                'tournament': 'TOURNAMENT',
                'league': 'LEAGUE'
            }
            
            match_type_value = match_type_mapping.get(data['match_type'].lower())
            if not match_type_value:
                valid_types = list(match_type_mapping.keys())
                return jsonify({'error': f'Invalid match_type: {data["match_type"]}. Valid types: {valid_types}'}), 400
            
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
                match_type=match_type_value,
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
                status=MatchStatus.UPCOMING
            )
            
            db.session.add(new_match)
            db.session.commit()
            
            return jsonify({
                'message': 'Match created successfully',
                'match': new_match.to_dict()
            }), 201
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating match: {str(e)}")
            return jsonify({'error': str(e)}), 500

# Live matches endpoint
@matches_bp.route('/live', methods=['GET', 'OPTIONS'])
def get_live_matches():
    """Get live matches"""
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'CORS preflight'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        return response
    
    try:
        # Get live matches (matches happening today)
        live_matches = Match.query.filter(
            Match.match_date == date.today(),
            Match.status == MatchStatus.LIVE
        ).all()
        
        matches_data = [match.to_dict() for match in live_matches]
        
        return jsonify({
            'matches': matches_data,
            'total': len(matches_data)
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching live matches: {str(e)}")
        return jsonify({'error': str(e)}), 500
