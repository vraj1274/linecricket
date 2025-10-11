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
def create_match():
    """Create a new match with teams and umpires"""
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
                # For live matches, you might want to add time-based logic
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
                
                # Get teams for this match (we need to link teams to matches properly)
                # For now, we'll get teams created by the same user, but this should be improved
                teams = MatchTeam.query.filter_by(created_by=match.creator_id).limit(10).all()
                match_dict['teams'] = [team.to_dict() for team in teams]
                
                # Get umpires for this match (we need to link umpires to matches properly)
                # For now, we'll get umpires created by the same user, but this should be improved
                umpires = MatchUmpire.query.filter_by(created_by=match.creator_id).limit(5).all()
                match_dict['umpires'] = [umpire.to_dict() for umpire in umpires]
                
                # Add participant count and other computed fields
                match_dict['participants_count'] = 0  # You can calculate this from MatchParticipant
                match_dict['can_join'] = True  # Add logic to determine if user can join
                match_dict['is_participant'] = False  # Add logic to check if current user is participant
                
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
    try:
        data = request.get_json()
        current_user_id = "b78102aa-d962-4f4c-adec-9ae860605cb1"  # Using existing user UUID
        
        # Validate required fields
        required_fields = ['title', 'match_type', 'location', 'match_date', 'match_time', 'players_needed']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Parse match type - map frontend values to database values
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
            rules=data.get('rules', '')
        )
        
        db.session.add(new_match)
        db.session.flush()  # Get the match ID
        
        # Create teams
        teams_created = []
        
        # Handle tournament teams (multiple teams)
        if data.get('teams') and isinstance(data['teams'], list):
            for index, team_data in enumerate(data['teams']):
                if team_data.get('name'):
                    team = MatchTeam(
                        team_name=team_data['name'],
                        player_role=team_data.get('role', 'captain'),
                        player_position=index + 1,
                        created_by=current_user_id
                    )
                    db.session.add(team)
                    teams_created.append(team)
        else:
            # Handle regular match teams (team1 and team2)
            if data.get('team1_name'):
                team1 = MatchTeam(
                    team_name=data['team1_name'],
                    player_role=data.get('team1_role', 'captain'),
                    player_position=1,
                    created_by=current_user_id
                )
                db.session.add(team1)
                teams_created.append(team1)
            
            if data.get('team2_name'):
                team2 = MatchTeam(
                    team_name=data['team2_name'],
                    player_role=data.get('team2_role', 'captain'),
                    player_position=2,
                    created_by=current_user_id
                )
                db.session.add(team2)
                teams_created.append(team2)
        
        # Create umpires if needed
        umpires_created = []
        if data.get('need_umpire'):
            # Handle multiple umpires
            if data.get('umpires') and isinstance(data['umpires'], list):
                for umpire_data in data['umpires']:
                    if umpire_data.get('name'):
                        umpire = MatchUmpire(
                            umpire_name=umpire_data['name'],
                            umpire_contact=umpire_data.get('contact', ''),
                            experience_level=umpire_data.get('experience', 'intermediate'),
                            umpire_fees=umpire_data.get('fee', 0.0),
                            created_by=current_user_id
                        )
                        db.session.add(umpire)
                        umpires_created.append(umpire)
            else:
                # Handle single umpire (backward compatibility)
                if data.get('umpire_name'):
                    umpire = MatchUmpire(
                        umpire_name=data['umpire_name'],
                        umpire_contact=data.get('umpire_contact', ''),
                        experience_level=data.get('umpire_experience', 'intermediate'),
                        umpire_fees=data.get('umpire_fee', 0.0),
                        created_by=current_user_id
                    )
                    db.session.add(umpire)
                    umpires_created.append(umpire)
        
        # Update match with team names
        if teams_created:
            new_match.team1_name = teams_created[0].team_name if len(teams_created) > 0 else None
            new_match.team2_name = teams_created[1].team_name if len(teams_created) > 1 else None
        
        db.session.commit()
        
        response_data = {
            'message': 'Match created successfully',
            'match': new_match.to_dict(),
            'teams_created': len(teams_created),
            'umpires_created': len(umpires_created)
        }
        
        if teams_created:
            response_data['teams'] = [team.to_dict() for team in teams_created]
        
        if umpires_created:
            response_data['umpires'] = [umpire.to_dict() for umpire in umpires_created]
        
        return jsonify(response_data), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating match: {str(e)}")
        return jsonify({'error': str(e)}), 500

@matches_bp.route('/live', methods=['GET', 'OPTIONS'])
def get_live_matches():
    """Get live matches"""
    # Handle CORS preflight request
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'CORS preflight'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        return response
    
    try:
        # Get live matches (today's matches)
        today = date.today()
        live_matches = Match.query.filter(
            Match.match_date == today,
            Match.status == MatchStatus.LIVE  # Use the correct enum value
        ).order_by(Match.match_time.asc()).all()
        
        # Convert to dictionary with related data
        matches_data = []
        for match in live_matches:
            match_dict = match.to_dict()
            
            # Get teams for this match (we need to link teams to matches properly)
            # For now, we'll get teams created by the same user, but this should be improved
            teams = MatchTeam.query.filter_by(created_by=match.creator_id).limit(10).all()
            match_dict['teams'] = [team.to_dict() for team in teams]
            
            # Get umpires for this match (we need to link umpires to matches properly)
            # For now, we'll get umpires created by the same user, but this should be improved
            umpires = MatchUmpire.query.filter_by(created_by=match.creator_id).limit(5).all()
            match_dict['umpires'] = [umpire.to_dict() for umpire in umpires]
            
            # Add participant count and other computed fields
            match_dict['participants_count'] = 0
            match_dict['can_join'] = True
            match_dict['is_participant'] = False
            
            matches_data.append(match_dict)
        
        return jsonify({
            'matches': matches_data,
            'total': len(matches_data)
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching live matches: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Duplicate route removed

@matches_bp.route('/<match_id>/join', methods=['POST'])
def join_match(match_id):
    """Join a match"""
    try:
        current_user_id = "b78102aa-d962-4f4c-adec-9ae860605cb1"  # Using existing user UUID
        match = Match.query.get_or_404(match_id)
        
        # Check if user can join
        logger.info(f"🔧 Checking if user {current_user_id} can join match {match_id}")
        logger.info(f"🔧 Match status: {match.status}")
        logger.info(f"🔧 Is participant: {match.is_participant(current_user_id)}")
        logger.info(f"🔧 Participants count: {match.participants.count()}")
        logger.info(f"🔧 Players needed: {match.players_needed}")
        
        # Check if user is already a participant
        if match.is_participant(current_user_id):
            logger.info(f"ℹ️ User {current_user_id} is already a participant in match {match_id}")
            return jsonify({
                'message': 'You are already a participant in this match',
                'participants_count': match.participants.count()
            }), 200
        
        if not match.can_join(current_user_id):
            logger.warning(f"❌ User {current_user_id} cannot join match {match_id}")
            return jsonify({'error': 'Cannot join this match'}), 400
        
        # Add participant
        participant = MatchParticipant(
            match_id=match_id,
            user_id=current_user_id
        )
        
        db.session.add(participant)
        db.session.commit()
        
        return jsonify({
            'message': 'Successfully joined the match',
            'participants_count': match.participants.count()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@matches_bp.route('/<match_id>/leave', methods=['POST'])
def leave_match(match_id):
    """Leave a match"""
    try:
        current_user_id = "b78102aa-d962-4f4c-adec-9ae860605cb1"  # Using existing user UUID
        match = Match.query.get_or_404(match_id)
        
        # Find and remove participant
        participant = MatchParticipant.query.filter_by(
            match_id=match_id, 
            user_id=current_user_id
        ).first()
        
        if not participant:
            return jsonify({'error': 'You are not a participant in this match'}), 400
        
        db.session.delete(participant)
        db.session.commit()
        
        return jsonify({
            'message': 'Successfully left the match',
            'participants_count': match.participants.count()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

    @matches_bp.route('/<match_id>', methods=['PUT', 'PATCH'])
    def update_match(match_id):
        """Update a match"""
        try:
            match = Match.query.get_or_404(match_id)
            data = request.get_json()
            
            logger.info(f"🔧 Updating match {match_id} with data: {data}")
            
            if not data:
                return jsonify({'error': 'No data provided'}), 400
            
            # Update basic match fields
            if 'title' in data:
                match.title = data['title']
            if 'description' in data:
                match.description = data['description']
            if 'match_type' in data:
                # Map frontend values to database enum values
                # Handle both old and new enum formats
                match_type_mapping = {
                    'friendly': 'Friendly',
                    'tournament': 'TOURNAMENT', 
                    'league': 'League',
                    't20': 't20',
                    'odi': 'odi',
                    'test': 'test'
                }
                match.match_type = match_type_mapping.get(data['match_type'], data['match_type'])
            if 'location' in data:
                match.location = data['location']
            if 'venue' in data:
                match.venue = data['venue']
            if 'match_date' in data:
                match.match_date = data['match_date']
            if 'match_time' in data:
                match.match_time = data['match_time']
            if 'players_needed' in data:
                match.players_needed = data['players_needed']
            if 'entry_fee' in data:
                match.entry_fee = data['entry_fee']
            if 'skill_level' in data:
                match.skill_level = data['skill_level']
            
            # Update team information
            if 'team1_name' in data:
                match.team1_name = data['team1_name']
            if 'team2_name' in data:
                match.team2_name = data['team2_name']
            
            # Update teams if provided
            if 'teams' in data and data['teams']:
                try:
                    logger.info(f"📝 Updating teams for match {match_id}")
                    # Delete existing teams for this match
                    MatchTeam.query.filter_by(match_id=match_id).delete()
                    
                    # Add new teams
                    for team_data in data['teams']:
                        team = MatchTeam(
                            match_id=match_id,
                            team_name=team_data['name'],
                            max_players=team_data.get('max_players', 11),
                            created_by=match.creator_id
                        )
                        db.session.add(team)
                    logger.info(f"✅ Teams updated for match {match_id}")
                except Exception as e:
                    logger.error(f"❌ Error updating teams for match {match_id}: {e}")
                    # Don't fail the entire update for teams/umpires errors
            
            # Update umpires if provided
            if 'umpires' in data and data['umpires']:
                try:
                    logger.info(f"📝 Updating umpires for match {match_id}")
                    # Delete existing umpires for this match
                    MatchUmpire.query.filter_by(match_id=match_id).delete()
                    
                    # Add new umpires
                    for umpire_data in data['umpires']:
                        umpire = MatchUmpire(
                            match_id=match_id,
                            umpire_name=umpire_data['name'],
                            umpire_contact=umpire_data['contact'],
                            experience_level=umpire_data.get('experience', 'intermediate'),
                            umpire_fees=umpire_data.get('fee', 0),
                            created_by=match.creator_id
                        )
                        db.session.add(umpire)
                    logger.info(f"✅ Umpires updated for match {match_id}")
                except Exception as e:
                    logger.error(f"❌ Error updating umpires for match {match_id}: {e}")
                    # Don't fail the entire update for teams/umpires errors
            
            # Update timestamp
            match.updated_at = db.func.current_timestamp()
            
            db.session.commit()
            
            logger.info(f"✅ Match {match_id} updated successfully")
            
            return jsonify({
                'message': 'Match updated successfully',
                'match': match.to_dict()
            }), 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"❌ Error updating match {match_id}: {e}")
            return jsonify({'error': str(e)}), 500

@matches_bp.route('/matches/<int:match_id>/participants', methods=['GET'])
def get_match_participants(match_id):
    """Get match participants"""
    try:
        match = Match.query.get_or_404(match_id)
        participants = match.participants.all()
        
        participants_data = []
        for participant in participants:
            participants_data.append(participant.to_dict())
        
        return jsonify({
            'participants': participants_data,
            'total': len(participants_data)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@matches_bp.route('/matches/<int:match_id>/update-score', methods=['POST'])
def update_match_score(match_id):
    """Update match score (for live matches)"""
    try:
        current_user_id = "b78102aa-d962-4f4c-adec-9ae860605cb1"  # Using existing user UUID
        match = Match.query.get_or_404(match_id)
        
        # Check if user is the creator
        if match.creator_id != current_user_id:
            return jsonify({'error': 'Only match creator can update scores'}), 403
        
        data = request.get_json()
        
        # Update match details
        if 'team1_name' in data:
            match.team1_name = data['team1_name']
        if 'team2_name' in data:
            match.team2_name = data['team2_name']
        if 'team1_score' in data:
            match.team1_score = data['team1_score']
        if 'team2_score' in data:
            match.team2_score = data['team2_score']
        if 'current_over' in data:
            match.current_over = data['current_over']
        if 'match_summary' in data:
            match.match_summary = data['match_summary']
        if 'status' in data:
            match.status = MatchStatus(data['status'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Match score updated successfully',
            'match': match.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@matches_bp.route('/matches/<int:match_id>/watch', methods=['POST'])
def watch_live_match(match_id):
    """Start watching a live match"""
    try:
        current_user_id = "b78102aa-d962-4f4c-adec-9ae860605cb1"  # Using existing user UUID
        match = Match.query.get_or_404(match_id)
        
        if match.status != MatchStatus.LIVE:
            return jsonify({'error': 'Match is not live'}), 400
        
        return jsonify({
            'message': 'Starting live stream',
            'match_id': match_id,
            'stream_url': match.stream_url or f'https://example.com/live-stream/{match_id}',
            'user_id': current_user_id
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@matches_bp.route('/matches', methods=['GET'])
def get_matches():
    """Get all matches (upcoming, live, completed)"""
    try:
        status = request.args.get('status', 'all')
        match_type = request.args.get('match_type', 'all')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        current_user_id = "b78102aa-d962-4f4c-adec-9ae860605cb1"  # Using existing user UUID
        
        query = Match.query
        
        if status != 'all':
            query = query.filter(Match.status == MatchStatus(status))
        
        if match_type != 'all':
            query = query.filter(Match.match_type == MatchType(match_type))
        
        matches = query.order_by(Match.match_date.desc(), Match.match_time.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        matches_data = []
        for match in matches.items:
            is_participant = match.is_participant(current_user_id)
            can_join = match.can_join(current_user_id)
            
            matches_data.append({
                'id': match.id,
                'title': match.title,
                'description': match.description,
                'match_type': match.match_type.value,
                'location': match.location,
                'venue': match.venue,
                'match_date': match.match_date.isoformat(),
                'match_time': match.match_time.strftime('%H:%M'),
                'players_needed': match.players_needed,
                'participants_count': match.participants.count(),
                'entry_fee': match.entry_fee,
                'skill_level': match.skill_level,
                'equipment_provided': match.equipment_provided,
                'status': match.status.value,
                'is_public': match.is_public,
                'is_participant': is_participant,
                'can_join': can_join,
                'creator': {
                    'id': match.creator.id,
                    'username': match.creator.username
                },
                'team1_name': match.team1_name,
                'team2_name': match.team2_name,
                'team1_score': match.team1_score,
                'team2_score': match.team2_score,
                'current_over': match.current_over,
                'match_summary': match.match_summary,
                'stream_url': match.stream_url,
                'created_at': match.created_at.isoformat()
            })
        
        return jsonify({
            'matches': matches_data,
            'total': matches.total,
            'pages': matches.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
        if 'current_over' in data:

            match.current_over = data['current_over']

        if 'match_summary' in data:

            match.match_summary = data['match_summary']

        if 'status' in data:

            match.status = MatchStatus(data['status'])

        

        db.session.commit()

        

        return jsonify({

            'message': 'Match score updated successfully',

            'match': match.to_dict()

        }), 200

        

    except Exception as e:

        db.session.rollback()

        return jsonify({'error': str(e)}), 500

@matches_bp.route('/<match_id>', methods=['DELETE', 'OPTIONS'])
def delete_match(match_id):
    """Delete a match and its associated data"""
    # Handle CORS preflight request
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'CORS preflight'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'DELETE, OPTIONS')
        return response
    
    try:
        current_user_id = "b78102aa-d962-4f4c-adec-9ae860605cb1"  # Using existing user UUID
        
        # Find the match
        match = Match.query.get(match_id)
        if not match:
            return jsonify({'error': 'Match not found'}), 404
        
        # Check if user is the creator (for now, allow all deletions)
        # if match.creator_id != current_user_id:
        #     return jsonify({'error': 'Not authorized to delete this match'}), 403
        
        logger.info(f"🗑️ Deleting match: {match_id} - {match.title}")
        
        # Delete team participants first (foreign key constraint)
        MatchTeamParticipant.query.filter_by(match_id=match_id).delete()
        
        # Delete teams for this match
        MatchTeam.query.filter_by(match_id=match_id).delete()
        
        # Delete umpires for this match
        MatchUmpire.query.filter_by(match_id=match_id).delete()
        
        # Delete match participants
        MatchParticipant.query.filter_by(match_id=match_id).delete()
        
        # Delete the match
        db.session.delete(match)
        db.session.commit()
        
        logger.info(f"✅ Match deleted successfully: {match_id}")
        
        return jsonify({
            'message': 'Match deleted successfully',
            'deleted_match_id': match_id,
            'deleted_title': match.title
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Error deleting match: {str(e)}")
        return jsonify({'error': str(e)}), 500


@matches_bp.route('/<match_id>/teams', methods=['GET'])
def get_match_teams(match_id):
    """Get detailed team information with player counts"""
    try:
        match = Match.query.get_or_404(match_id)
        teams = MatchTeam.query.filter_by(match_id=match_id).all()
        
        teams_data = []
        for team in teams:
            team_data = team.to_dict()
            team_data['participants'] = [
                p.to_dict() for p in team.participants if p.is_active
            ]
            teams_data.append(team_data)
        
        return jsonify({'teams': teams_data}), 200
        
    except Exception as e:
        logger.error(f"❌ Error getting match teams: {str(e)}")
        return jsonify({'error': str(e)}), 500


@matches_bp.route('/<match_id>/join-team', methods=['POST'])
def join_team(match_id):
    """Join a specific team with position selection"""
    try:
        data = request.get_json()
        team_id = data.get('team_id')
        position = data.get('position')
        role = data.get('role', 'player')
        
        # Get current user - handle both Firebase UID and database UUID
        firebase_uid = data.get('user_id')  # This comes from frontend as Firebase UID
        
        if not firebase_uid:
            return jsonify({'error': 'User not authenticated'}), 401
        
        # Debug: Log the Firebase UID being sent
        logger.info(f"🔍 Received Firebase UID: {firebase_uid}")
        
        # Look up user by Firebase UID to get database UUID
        user = User.query.filter_by(firebase_uid=firebase_uid).first()
        if not user:
            logger.error(f"❌ User not found for Firebase UID: {firebase_uid}")
            # List all users for debugging
            all_users = User.query.all()
            logger.info(f"📋 Available users: {[(u.username, u.firebase_uid) for u in all_users]}")
            
            # Try to create user automatically if we have email from request
            email = data.get('email')
            display_name = data.get('display_name', '')
            
            if email:
                logger.info(f"🔄 Attempting to create user automatically...")
                try:
                    # Create new user
                    user = User(
                        firebase_uid=firebase_uid,
                        email=email,
                        username=display_name or f"user_{firebase_uid[:8]}",
                        is_active=True,
                        is_verified=True,
                        auth_provider="firebase"
                    )
                    db.session.add(user)
                    db.session.commit()
                    logger.info(f"✅ Created new user: {user.username} (Firebase UID: {firebase_uid})")
                except Exception as e:
                    logger.error(f"❌ Failed to create user: {e}")
                    return jsonify({'error': 'User not found in database and could not be created'}), 404
            else:
                return jsonify({'error': 'User not found in database. Please sign in first.'}), 404
        
        current_user_id = str(user.id)  # Get the database UUID
        
        # Validate team and position availability
        team = MatchTeam.query.filter_by(team_id=team_id, match_id=match_id).first()
        if not team:
            return jsonify({'error': 'Team not found'}), 404
        
        # Check if position is already taken by another player
        existing_position = MatchTeamParticipant.query.filter_by(
            match_id=match_id,
            team_id=team_id,
            player_position=position,
            is_active=True
        ).first()
        
        if existing_position:
            return jsonify({'error': f'Position {position} is already taken by another player'}), 400
        
        # Check if user is already in this match
        existing_participant = MatchTeamParticipant.query.filter_by(
            match_id=match_id, 
            user_id=current_user_id,
            is_active=True
        ).first()
        
        if existing_participant:
            return jsonify({'error': 'You are already participating in this match'}), 400
        
        # Validate position is within team limits
        if position < 1 or position > team.max_players:
            return jsonify({'error': f'Position must be between 1 and {team.max_players}'}), 400
        
        # Create team participant
        participant = MatchTeamParticipant(
            match_id=match_id,
            team_id=team_id,
            user_id=current_user_id,
            player_position=position,
            player_role=role
        )
        
        db.session.add(participant)
        
        # Update team statistics
        team.update_team_stats()
        
        db.session.commit()
        
        # Return updated team information
        updated_team = MatchTeam.query.get(team_id)
        team_data = updated_team.to_dict()
        team_data['participants'] = [
            p.to_dict() for p in updated_team.participants if p.is_active
        ]
        
        return jsonify({
            'message': f'Successfully joined team at position {position}',
            'team': team_data
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Error joining team: {str(e)}")
        return jsonify({'error': str(e)}), 500


@matches_bp.route('/<match_id>/leave-team', methods=['POST'])
def leave_team(match_id):
    """Leave a specific team"""
    try:
        data = request.get_json()
        firebase_uid = data.get('user_id')  # This comes from frontend as Firebase UID
        
        if not firebase_uid:
            return jsonify({'error': 'User not authenticated'}), 401
        
        # Debug: Log the Firebase UID being sent
        logger.info(f"🔍 Received Firebase UID: {firebase_uid}")
        
        # Look up user by Firebase UID to get database UUID
        user = User.query.filter_by(firebase_uid=firebase_uid).first()
        if not user:
            logger.error(f"❌ User not found for Firebase UID: {firebase_uid}")
            # List all users for debugging
            all_users = User.query.all()
            logger.info(f"📋 Available users: {[(u.username, u.firebase_uid) for u in all_users]}")
            return jsonify({'error': 'User not found in database'}), 404
        
        current_user_id = str(user.id)  # Get the database UUID
        
        # Find the participant
        participant = MatchTeamParticipant.query.filter_by(
            match_id=match_id, 
            user_id=current_user_id,
            is_active=True
        ).first()
        
        if not participant:
            return jsonify({'error': 'You are not participating in this match'}), 404
        
        # Get the team to update stats
        team = MatchTeam.query.get(participant.team_id)
        position = participant.player_position
        
        # Remove participant
        db.session.delete(participant)
        
        # Update team statistics
        if team:
            team.update_team_stats()
        
        db.session.commit()
        
        # Return updated team information
        updated_team = MatchTeam.query.get(team.team_id)
        team_data = updated_team.to_dict()
        team_data['participants'] = [
            p.to_dict() for p in updated_team.participants if p.is_active
        ]
        
        return jsonify({
            'message': f'Successfully left team, position {position} is now available',
            'team': team_data
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Error leaving team: {str(e)}")
        return jsonify({'error': str(e)}), 500


@matches_bp.route('/<match_id>/team-stats', methods=['GET'])
def get_match_team_stats(match_id):
    """Get comprehensive team statistics for a match"""
    try:
        match = Match.query.get_or_404(match_id)
        team_stats = match.get_match_team_stats()
        
        return jsonify({'team_stats': team_stats}), 200
        
    except Exception as e:
        logger.error(f"❌ Error getting team stats: {str(e)}")
        return jsonify({'error': str(e)}), 500




