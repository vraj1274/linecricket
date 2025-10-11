from flask import Blueprint, request, jsonify
from models import db, CommunityProfile, User
from datetime import datetime
import json

community_profile_bp = Blueprint('community_profile', __name__)

@community_profile_bp.route('/community-profile', methods=['POST'])
def create_community_profile():
    """
    Create a new community profile
    ---
    tags:
      - Community Profile
    parameters:
      - in: body
        name: community_profile
        description: Community profile data
        required: true
        schema:
          type: object
          properties:
            community_name:
              type: string
              example: "Mumbai Cricket Club"
            tagline:
              type: string
              example: "Uniting Cricket Enthusiasts"
            description:
              type: string
              example: "A vibrant community of cricket lovers in Mumbai"
            bio:
              type: string
              example: "Founded in 2015, we organize regular matches and events"
            community_type:
              type: string
              enum: [local_club, online_community, tournament_organizer, fan_club, coaching_group, player_association]
              example: "local_club"
            level:
              type: string
              enum: [beginner, intermediate, advanced, professional, all_levels]
              example: "all_levels"
            location:
              type: string
              example: "Mumbai, Maharashtra"
            city:
              type: string
              example: "Mumbai"
            state:
              type: string
              example: "Maharashtra"
            country:
              type: string
              example: "India"
            contact_person:
              type: string
              example: "Community Manager"
            contact_number:
              type: string
              example: "+91-9876543210"
            email:
              type: string
              example: "info@mumbaicricketclub.com"
            website:
              type: string
              example: "https://mumbaicricketclub.com"
            logo_url:
              type: string
              example: "https://example.com/logo.jpg"
            banner_image_url:
              type: string
              example: "https://example.com/banner.jpg"
            is_public:
              type: boolean
              example: true
            is_private:
              type: boolean
              example: false
            requires_approval:
              type: boolean
              example: false
            allow_messages:
              type: boolean
              example: true
            show_contact:
              type: boolean
              example: true
            max_members:
              type: integer
              example: 1000
            membership_fee:
              type: number
              example: 500.0
            membership_duration:
              type: string
              example: "1 year"
            rules:
              type: array
              items:
                type: string
              example: ["Be respectful", "No spam", "Stay on topic"]
            guidelines:
              type: array
              items:
                type: string
              example: ["Post relevant content", "Use appropriate language"]
            code_of_conduct:
              type: string
              example: "We promote a positive and inclusive environment"
            activities:
              type: array
              items:
                type: string
              example: ["Weekly matches", "Training sessions", "Social events"]
            events:
              type: array
              items:
                type: object
                properties:
                  name:
                    type: string
                  date:
                    type: string
                  description:
                    type: string
              example: [{"name": "Annual Tournament", "date": "2024-03-15", "description": "Community cricket tournament"}]
            regular_meetings:
              type: array
              items:
                type: object
                properties:
                  day:
                    type: string
                  time:
                    type: string
                  location:
                    type: string
              example: [{"day": "Sunday", "time": "9:00 AM", "location": "Local Ground"}]
            instagram_handle:
              type: string
              example: "mumbaicricketclub"
            facebook_handle:
              type: string
              example: "MumbaiCricketClub"
            twitter_handle:
              type: string
              example: "MumbaiCricketClub"
            discord_handle:
              type: string
              example: "MumbaiCricketClub"
            whatsapp_group:
              type: string
              example: "MumbaiCricketClub"
            achievements:
              type: array
              items:
                type: string
              example: ["Best Community Award 2023", "500+ Active Members"]
            testimonials:
              type: array
              items:
                type: object
                properties:
                  name:
                    type: string
                  text:
                    type: string
              example: [{"name": "John Doe", "text": "Great community for cricket enthusiasts"}]
            auto_approve_posts:
              type: boolean
              example: true
            allow_member_posts:
              type: boolean
              example: true
            allow_guest_posts:
              type: boolean
              example: false
            content_moderation:
              type: boolean
              example: true
    responses:
      201:
        description: Community profile created successfully
      400:
        description: Bad request
      409:
        description: Community profile already exists for this account
      500:
        description: Internal server error
    """
    try:
        current_user_id = 1  # 1 - using test user ID
        
        # Check if community profile already exists for this account
        existing_profile = CommunityProfile.get_by_account_id(current_user_id)
        if existing_profile:
            return jsonify({'error': 'Community profile already exists for this account'}), 409
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['community_name', 'community_type', 'level']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create community profile
        community_profile = CommunityProfile(
            account_id=current_user_id,
            community_name=data['community_name'],
            tagline=data.get('tagline'),
            description=data.get('description'),
            bio=data.get('bio'),
            community_type=data['community_type'],
            level=data['level'],
            location=data.get('location'),
            city=data.get('city'),
            state=data.get('state'),
            country=data.get('country'),
            contact_person=data.get('contact_person'),
            contact_number=data.get('contact_number'),
            email=data.get('email'),
            website=data.get('website'),
            logo_url=data.get('logo_url'),
            banner_image_url=data.get('banner_image_url'),
            is_public=data.get('is_public', True),
            is_private=data.get('is_private', False),
            requires_approval=data.get('requires_approval', False),
            allow_messages=data.get('allow_messages', True),
            show_contact=data.get('show_contact', True),
            max_members=data.get('max_members', 1000),
            membership_fee=data.get('membership_fee', 0.0),
            membership_duration=data.get('membership_duration'),
            rules=json.dumps(data.get('rules', [])),
            guidelines=json.dumps(data.get('guidelines', [])),
            code_of_conduct=data.get('code_of_conduct'),
            activities=json.dumps(data.get('activities', [])),
            events=json.dumps(data.get('events', [])),
            regular_meetings=json.dumps(data.get('regular_meetings', [])),
            instagram_handle=data.get('instagram_handle'),
            facebook_handle=data.get('facebook_handle'),
            twitter_handle=data.get('twitter_handle'),
            discord_handle=data.get('discord_handle'),
            whatsapp_group=data.get('whatsapp_group'),
            achievements=json.dumps(data.get('achievements', [])),
            testimonials=json.dumps(data.get('testimonials', [])),
            auto_approve_posts=data.get('auto_approve_posts', True),
            allow_member_posts=data.get('allow_member_posts', True),
            allow_guest_posts=data.get('allow_guest_posts', False),
            content_moderation=data.get('content_moderation', True)
        )
        
        db.session.add(community_profile)
        db.session.commit()
        
        return jsonify({
            'message': 'Community profile created successfully',
            'community_profile': community_profile.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@community_profile_bp.route('/community-profile/<int:profile_id>', methods=['GET'])
def get_community_profile(profile_id):
    """
    Get community profile by ID
    ---
    tags:
      - Community Profile
    parameters:
      - in: path
        name: profile_id
        type: integer
        required: true
        description: Community profile ID
    responses:
      200:
        description: Community profile retrieved successfully
      404:
        description: Community profile not found
    """
    try:
        community_profile = CommunityProfile.query.filter_by(id=profile_id, deleted_at=None).first()
        
        if not community_profile:
            return jsonify({'error': 'Community profile not found'}), 404
        
        return jsonify({
            'community_profile': community_profile.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@community_profile_bp.route('/community-profile/account/<int:account_id>', methods=['GET'])
def get_community_profile_by_account(account_id):
    """
    Get community profile by account ID
    ---
    tags:
      - Community Profile
    parameters:
      - in: path
        name: account_id
        type: integer
        required: true
        description: Account ID
    responses:
      200:
        description: Community profile retrieved successfully
      404:
        description: Community profile not found
    """
    try:
        community_profile = CommunityProfile.get_by_account_id(account_id)
        
        if not community_profile:
            return jsonify({'error': 'Community profile not found'}), 404
        
        return jsonify({
            'community_profile': community_profile.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@community_profile_bp.route('/community-profile/<int:profile_id>', methods=['PATCH'])
def update_community_profile(profile_id):
    """
    Update community profile
    ---
    tags:
      - Community Profile
    parameters:
      - in: path
        name: profile_id
        type: integer
        required: true
        description: Community profile ID
      - in: body
        name: community_profile
        description: Updated community profile data
        required: true
        schema:
          type: object
          properties:
            community_name:
              type: string
            # ... other fields same as create
    responses:
      200:
        description: Community profile updated successfully
      400:
        description: Bad request
      403:
        description: Forbidden - not the profile owner
      404:
        description: Community profile not found
    """
    try:
        current_user_id = 1  # 1 - using test user ID
        
        community_profile = CommunityProfile.query.filter_by(id=profile_id, deleted_at=None).first()
        
        if not community_profile:
            return jsonify({'error': 'Community profile not found'}), 404
        
        # Check if user owns this profile
        if community_profile.account_id != current_user_id:
            return jsonify({'error': 'Forbidden - not the profile owner'}), 403
        
        data = request.get_json()
        
        # Update fields
        for field, value in data.items():
            if hasattr(community_profile, field):
                if field in ['rules', 'guidelines', 'activities', 'events', 'regular_meetings', 'achievements', 'testimonials'] and value:
                    setattr(community_profile, field, json.dumps(value))
                else:
                    setattr(community_profile, field, value)
        
        community_profile.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Community profile updated successfully',
            'community_profile': community_profile.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@community_profile_bp.route('/community-profile/<int:profile_id>', methods=['DELETE'])
def delete_community_profile(profile_id):
    """
    Soft delete community profile
    ---
    tags:
      - Community Profile
    parameters:
      - in: path
        name: profile_id
        type: integer
        required: true
        description: Community profile ID
    responses:
      200:
        description: Community profile deleted successfully
      403:
        description: Forbidden - not the profile owner
      404:
        description: Community profile not found
    """
    try:
        current_user_id = 1  # 1 - using test user ID
        
        community_profile = CommunityProfile.query.filter_by(id=profile_id, deleted_at=None).first()
        
        if not community_profile:
            return jsonify({'error': 'Community profile not found'}), 404
        
        # Check if user owns this profile
        if community_profile.account_id != current_user_id:
            return jsonify({'error': 'Forbidden - not the profile owner'}), 403
        
        community_profile.soft_delete()
        
        return jsonify({
            'message': 'Community profile deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@community_profile_bp.route('/community-profile/<int:profile_id>/restore', methods=['POST'])
def restore_community_profile(profile_id):
    """
    Restore soft-deleted community profile
    ---
    tags:
      - Community Profile
    parameters:
      - in: path
        name: profile_id
        type: integer
        required: true
        description: Community profile ID
    responses:
      200:
        description: Community profile restored successfully
      403:
        description: Forbidden - not the profile owner
      404:
        description: Community profile not found
    """
    try:
        current_user_id = 1  # 1 - using test user ID
        
        community_profile = CommunityProfile.query.filter_by(id=profile_id).first()
        
        if not community_profile:
            return jsonify({'error': 'Community profile not found'}), 404
        
        # Check if user owns this profile
        if community_profile.account_id != current_user_id:
            return jsonify({'error': 'Forbidden - not the profile owner'}), 403
        
        if not community_profile.deleted_at:
            return jsonify({'error': 'Community profile is not deleted'}), 400
        
        community_profile.restore()
        
        return jsonify({
            'message': 'Community profile restored successfully',
            'community_profile': community_profile.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@community_profile_bp.route('/community-profiles', methods=['GET'])
def list_community_profiles():
    """
    List all active community profiles with pagination and filters
    ---
    tags:
      - Community Profile
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
        description: Search by community name or description
      - in: query
        name: community_type
        type: string
        description: Filter by community type
      - in: query
        name: level
        type: string
        description: Filter by level
      - in: query
        name: city
        type: string
        description: Filter by city
      - in: query
        name: state
        type: string
        description: Filter by state
      - in: query
        name: country
        type: string
        description: Filter by country
    responses:
      200:
        description: Community profiles retrieved successfully
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        community_type = request.args.get('community_type', '')
        level = request.args.get('level', '')
        city = request.args.get('city', '')
        state = request.args.get('state', '')
        country = request.args.get('country', '')
        
        query = CommunityProfile.query.filter(CommunityProfile.deleted_at.is_(None))
        
        # Apply filters
        if search:
            query = query.filter(
                (CommunityProfile.community_name.ilike(f'%{search}%')) |
                (CommunityProfile.description.ilike(f'%{search}%'))
            )
        
        if community_type:
            query = query.filter(CommunityProfile.community_type == community_type)
        
        if level:
            query = query.filter(CommunityProfile.level == level)
        
        if city:
            query = query.filter(CommunityProfile.city.ilike(f'%{city}%'))
        
        if state:
            query = query.filter(CommunityProfile.state.ilike(f'%{state}%'))
        
        if country:
            query = query.filter(CommunityProfile.country.ilike(f'%{country}%'))
        
        # Paginate results
        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        community_profiles = [profile.to_dict() for profile in pagination.items]
        
        return jsonify({
            'community_profiles': community_profiles,
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

@community_profile_bp.route('/community-profiles/search/location', methods=['GET'])
def search_community_profiles_by_location():
    """
    Search community profiles by location
    ---
    tags:
      - Community Profile
    parameters:
      - in: query
        name: city
        type: string
        description: City name
      - in: query
        name: state
        type: string
        description: State name
      - in: query
        name: country
        type: string
        description: Country name
    responses:
      200:
        description: Community profiles found
    """
    try:
        city = request.args.get('city', '')
        state = request.args.get('state', '')
        country = request.args.get('country', '')
        
        community_profiles = CommunityProfile.search_by_location(city, state, country)
        
        return jsonify({
            'community_profiles': [profile.to_dict() for profile in community_profiles]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@community_profile_bp.route('/community-profiles/search/type', methods=['GET'])
def search_community_profiles_by_type():
    """
    Search community profiles by type
    ---
    tags:
      - Community Profile
    parameters:
      - in: query
        name: community_type
        type: string
        required: true
        description: Community type
    responses:
      200:
        description: Community profiles found
    """
    try:
        community_type = request.args.get('community_type', '')
        
        if not community_type:
            return jsonify({'error': 'Community type parameter is required'}), 400
        
        community_profiles = CommunityProfile.search_by_type(community_type)
        
        return jsonify({
            'community_profiles': [profile.to_dict() for profile in community_profiles]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
