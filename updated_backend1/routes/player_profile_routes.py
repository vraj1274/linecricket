from flask import Blueprint, request, jsonify
from models import db, PlayerProfile, PlayerCareerStats, User
from datetime import datetime
import json

player_profile_bp = Blueprint('player_profile', __name__)

@player_profile_bp.route('/player-profile', methods=['POST'])
def create_player_profile():
    """
    Create a new player profile
    ---
    tags:
      - Player Profile
    parameters:
      - in: body
        name: player_profile
        description: Player profile data
        required: true
        schema:
          type: object
          properties:
            display_name:
              type: string
              example: "Virat Kohli"
            bio:
              type: string
              example: "Professional cricketer and former captain"
            location:
              type: string
              example: "Mumbai, India"
            date_of_birth:
              type: string
              format: date
              example: "1988-11-05"
            nationality:
              type: string
              example: "Indian"
            contact_number:
              type: string
              example: "+91-9876543210"
            profile_image_url:
              type: string
              example: "https://example.com/profile.jpg"
            banner_image_url:
              type: string
              example: "https://example.com/banner.jpg"
            player_role:
              type: string
              enum: [batsman, bowler, all_rounder, wicket_keeper, captain]
              example: "batsman"
            batting_style:
              type: string
              enum: [right_handed, left_handed]
              example: "right_handed"
            bowling_style:
              type: string
              enum: [right_arm_fast, left_arm_fast, right_arm_medium, left_arm_medium, right_arm_spin, left_arm_spin, leg_spin, off_spin]
              example: "right_arm_medium"
            preferred_position:
              type: string
              example: "Opening Batsman"
            batting_skill:
              type: integer
              minimum: 0
              maximum: 100
              example: 95
            bowling_skill:
              type: integer
              minimum: 0
              maximum: 100
              example: 60
            fielding_skill:
              type: integer
              minimum: 0
              maximum: 100
              example: 85
            leadership_skill:
              type: integer
              minimum: 0
              maximum: 100
              example: 90
            height:
              type: number
              example: 175.5
            weight:
              type: number
              example: 70.0
            dominant_hand:
              type: string
              enum: [right, left]
              example: "right"
            playing_since:
              type: string
              format: date
              example: "2008-08-18"
            current_team:
              type: string
              example: "Royal Challengers Bangalore"
            previous_teams:
              type: array
              items:
                type: string
              example: ["Delhi Daredevils", "India U19"]
            achievements:
              type: array
              items:
                type: string
              example: ["ICC Cricketer of the Year 2017", "Wisden Leading Cricketer 2016"]
            instagram_handle:
              type: string
              example: "virat.kohli"
            twitter_handle:
              type: string
              example: "imVkohli"
            linkedin_handle:
              type: string
              example: "virat-kohli"
            is_public:
              type: boolean
              example: true
            allow_messages:
              type: boolean
              example: true
            show_contact:
              type: boolean
              example: false
    responses:
      201:
        description: Player profile created successfully
        schema:
          type: object
          properties:
            message:
              type: string
            player_profile:
              $ref: '#/definitions/PlayerProfile'
      400:
        description: Bad request
      409:
        description: Player profile already exists for this account
      500:
        description: Internal server error
    """
    try:
        current_user_id = 1  # 1 - using test user ID
        
        # Check if player profile already exists for this account
        existing_profile = PlayerProfile.get_by_account_id(current_user_id)
        if existing_profile:
            return jsonify({'error': 'Player profile already exists for this account'}), 409
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['display_name', 'player_role']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create player profile
        player_profile = PlayerProfile(
            account_id=current_user_id,
            display_name=data['display_name'],
            bio=data.get('bio'),
            location=data.get('location'),
            date_of_birth=datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date() if data.get('date_of_birth') else None,
            nationality=data.get('nationality'),
            contact_number=data.get('contact_number'),
            profile_image_url=data.get('profile_image_url'),
            banner_image_url=data.get('banner_image_url'),
            player_role=data['player_role'],
            batting_style=data.get('batting_style'),
            bowling_style=data.get('bowling_style'),
            preferred_position=data.get('preferred_position'),
            batting_skill=data.get('batting_skill', 0),
            bowling_skill=data.get('bowling_skill', 0),
            fielding_skill=data.get('fielding_skill', 0),
            leadership_skill=data.get('leadership_skill', 0),
            height=data.get('height'),
            weight=data.get('weight'),
            dominant_hand=data.get('dominant_hand'),
            playing_since=datetime.strptime(data['playing_since'], '%Y-%m-%d').date() if data.get('playing_since') else None,
            current_team=data.get('current_team'),
            previous_teams=json.dumps(data.get('previous_teams', [])),
            achievements=json.dumps(data.get('achievements', [])),
            instagram_handle=data.get('instagram_handle'),
            twitter_handle=data.get('twitter_handle'),
            linkedin_handle=data.get('linkedin_handle'),
            is_public=data.get('is_public', True),
            allow_messages=data.get('allow_messages', True),
            show_contact=data.get('show_contact', False)
        )
        
        db.session.add(player_profile)
        db.session.commit()
        
        # Create initial career stats
        career_stats = PlayerCareerStats(player_profile_id=player_profile.id)
        db.session.add(career_stats)
        db.session.commit()
        
        return jsonify({
            'message': 'Player profile created successfully',
            'player_profile': player_profile.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'error': f'Invalid date format: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@player_profile_bp.route('/player-profile/<int:profile_id>', methods=['GET'])
def get_player_profile(profile_id):
    """
    Get player profile by ID with career stats
    ---
    tags:
      - Player Profile
    parameters:
      - in: path
        name: profile_id
        type: integer
        required: true
        description: Player profile ID
    responses:
      200:
        description: Player profile retrieved successfully
        schema:
          type: object
          properties:
            player_profile:
              $ref: '#/definitions/PlayerProfile'
      404:
        description: Player profile not found
    """
    try:
        player_profile = PlayerProfile.query.filter_by(id=profile_id, deleted_at=None).first()
        
        if not player_profile:
            return jsonify({'error': 'Player profile not found'}), 404
        
        return jsonify({
            'player_profile': player_profile.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@player_profile_bp.route('/player-profile/account/<int:account_id>', methods=['GET'])
def get_player_profile_by_account(account_id):
    """
    Get player profile by account ID
    ---
    tags:
      - Player Profile
    parameters:
      - in: path
        name: account_id
        type: integer
        required: true
        description: Account ID
    responses:
      200:
        description: Player profile retrieved successfully
      404:
        description: Player profile not found
    """
    try:
        player_profile = PlayerProfile.get_by_account_id(account_id)
        
        if not player_profile:
            return jsonify({'error': 'Player profile not found'}), 404
        
        return jsonify({
            'player_profile': player_profile.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@player_profile_bp.route('/player-profile/<int:profile_id>', methods=['PATCH'])
def update_player_profile(profile_id):
    """
    Update player profile
    ---
    tags:
      - Player Profile
    parameters:
      - in: path
        name: profile_id
        type: integer
        required: true
        description: Player profile ID
      - in: body
        name: player_profile
        description: Updated player profile data
        required: true
        schema:
          type: object
          properties:
            display_name:
              type: string
            bio:
              type: string
            location:
              type: string
            # ... other fields same as create
    responses:
      200:
        description: Player profile updated successfully
      400:
        description: Bad request
      403:
        description: Forbidden - not the profile owner
      404:
        description: Player profile not found
    """
    try:
        current_user_id = 1  # 1 - using test user ID
        
        player_profile = PlayerProfile.query.filter_by(id=profile_id, deleted_at=None).first()
        
        if not player_profile:
            return jsonify({'error': 'Player profile not found'}), 404
        
        # Check if user owns this profile
        if player_profile.account_id != current_user_id:
            return jsonify({'error': 'Forbidden - not the profile owner'}), 403
        
        data = request.get_json()
        
        # Update fields
        for field, value in data.items():
            if hasattr(player_profile, field):
                if field in ['date_of_birth', 'playing_since'] and value:
                    setattr(player_profile, field, datetime.strptime(value, '%Y-%m-%d').date())
                elif field in ['previous_teams', 'achievements'] and value:
                    setattr(player_profile, field, json.dumps(value))
                else:
                    setattr(player_profile, field, value)
        
        player_profile.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Player profile updated successfully',
            'player_profile': player_profile.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({'error': f'Invalid date format: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@player_profile_bp.route('/player-profile/<int:profile_id>', methods=['DELETE'])
def delete_player_profile(profile_id):
    """
    Soft delete player profile
    ---
    tags:
      - Player Profile
    parameters:
      - in: path
        name: profile_id
        type: integer
        required: true
        description: Player profile ID
    responses:
      200:
        description: Player profile deleted successfully
      403:
        description: Forbidden - not the profile owner
      404:
        description: Player profile not found
    """
    try:
        current_user_id = 1  # 1 - using test user ID
        
        player_profile = PlayerProfile.query.filter_by(id=profile_id, deleted_at=None).first()
        
        if not player_profile:
            return jsonify({'error': 'Player profile not found'}), 404
        
        # Check if user owns this profile
        if player_profile.account_id != current_user_id:
            return jsonify({'error': 'Forbidden - not the profile owner'}), 403
        
        player_profile.soft_delete()
        
        return jsonify({
            'message': 'Player profile deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@player_profile_bp.route('/player-profile/<int:profile_id>/restore', methods=['POST'])
def restore_player_profile(profile_id):
    """
    Restore soft-deleted player profile
    ---
    tags:
      - Player Profile
    parameters:
      - in: path
        name: profile_id
        type: integer
        required: true
        description: Player profile ID
    responses:
      200:
        description: Player profile restored successfully
      403:
        description: Forbidden - not the profile owner
      404:
        description: Player profile not found
    """
    try:
        current_user_id = 1  # 1 - using test user ID
        
        player_profile = PlayerProfile.query.filter_by(id=profile_id).first()
        
        if not player_profile:
            return jsonify({'error': 'Player profile not found'}), 404
        
        # Check if user owns this profile
        if player_profile.account_id != current_user_id:
            return jsonify({'error': 'Forbidden - not the profile owner'}), 403
        
        if not player_profile.deleted_at:
            return jsonify({'error': 'Player profile is not deleted'}), 400
        
        player_profile.restore()
        
        return jsonify({
            'message': 'Player profile restored successfully',
            'player_profile': player_profile.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@player_profile_bp.route('/player-profiles', methods=['GET'])
def list_player_profiles():
    """
    List all active player profiles with pagination
    ---
    tags:
      - Player Profile
    parameters:
      - in: query
        name: page
        type: integer
        default: 1
        description: Page number
      - in: query
        name: per_page
        type: integer
        default: 20
        description: Items per page
      - in: query
        name: search
        type: string
        description: Search by display name or location
      - in: query
        name: player_role
        type: string
        description: Filter by player role
      - in: query
        name: location
        type: string
        description: Filter by location
    responses:
      200:
        description: Player profiles retrieved successfully
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        player_role = request.args.get('player_role', '')
        location = request.args.get('location', '')
        
        query = PlayerProfile.query.filter(PlayerProfile.deleted_at.is_(None))
        
        # Apply filters
        if search:
            query = query.filter(
                (PlayerProfile.display_name.ilike(f'%{search}%')) |
                (PlayerProfile.location.ilike(f'%{search}%'))
            )
        
        if player_role:
            query = query.filter(PlayerProfile.player_role == player_role)
        
        if location:
            query = query.filter(PlayerProfile.location.ilike(f'%{location}%'))
        
        # Paginate results
        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        player_profiles = [profile.to_dict() for profile in pagination.items]
        
        return jsonify({
            'player_profiles': player_profiles,
            'pagination': {
                'page': pagination.page,
                'per_page': pagination.per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
