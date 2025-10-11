from flask import Blueprint, request, jsonify
from models import db, VenueProfile, User
from datetime import datetime
import json

venue_profile_bp = Blueprint('venue_profile', __name__)

@venue_profile_bp.route('/venue-profile', methods=['POST'])
def create_venue_profile():
    """
    Create a new venue profile
    ---
    tags:
      - Venue Profile
    parameters:
      - in: body
        name: venue_profile
        description: Venue profile data
        required: true
        schema:
          type: object
          properties:
            venue_name:
              type: string
              example: "Wankhede Stadium"
            tagline:
              type: string
              example: "Iconic Cricket Venue in Mumbai"
            description:
              type: string
              example: "Historic cricket stadium with world-class facilities"
            contact_person:
              type: string
              example: "Stadium Manager"
            contact_number:
              type: string
              example: "+91-9876543210"
            email:
              type: string
              example: "info@wankhedestadium.com"
            website:
              type: string
              example: "https://wankhedestadium.com"
            address:
              type: string
              example: "D Road, Churchgate, Mumbai"
            city:
              type: string
              example: "Mumbai"
            state:
              type: string
              example: "Maharashtra"
            country:
              type: string
              example: "India"
            pincode:
              type: string
              example: "400020"
            latitude:
              type: number
              example: 18.9384
            longitude:
              type: number
              example: 72.8258
            venue_type:
              type: string
              enum: [cricket_ground, indoor_facility, practice_net, sports_complex, school_ground, club_ground]
              example: "cricket_ground"
            ground_type:
              type: string
              enum: [natural_turf, artificial_turf, concrete, mat]
              example: "natural_turf"
            established_year:
              type: integer
              example: 1974
            capacity:
              type: integer
              example: 33000
            ground_length:
              type: number
              example: 150.0
            ground_width:
              type: number
              example: 120.0
            pitch_count:
              type: integer
              example: 1
            net_count:
              type: integer
              example: 8
            floodlights:
              type: boolean
              example: true
            covered_area:
              type: boolean
              example: true
            logo_url:
              type: string
              example: "https://example.com/logo.jpg"
            banner_image_url:
              type: string
              example: "https://example.com/banner.jpg"
            facilities:
              type: array
              items:
                type: string
              example: ["Parking", "Food court", "Media center", "VIP lounge"]
            amenities:
              type: array
              items:
                type: string
              example: ["Changing rooms", "Shower facilities", "Equipment rental"]
            parking_available:
              type: boolean
              example: true
            parking_capacity:
              type: integer
              example: 500
            changing_rooms:
              type: boolean
              example: true
            refreshment_facility:
              type: boolean
              example: true
            booking_contact:
              type: string
              example: "Booking Manager"
            booking_email:
              type: string
              example: "booking@wankhedestadium.com"
            advance_booking_days:
              type: integer
              example: 30
            cancellation_policy:
              type: string
              example: "24 hours notice required"
            hourly_rate:
              type: number
              example: 5000.0
            daily_rate:
              type: number
              example: 50000.0
            monthly_rate:
              type: number
              example: 1000000.0
            equipment_rental:
              type: boolean
              example: true
            equipment_rates:
              type: object
              example: {"bat": 200, "ball": 50, "helmet": 100}
            operating_hours:
              type: object
              example: {"monday": "6:00 AM - 10:00 PM", "tuesday": "6:00 AM - 10:00 PM"}
            is_24_7:
              type: boolean
              example: false
            seasonal_availability:
              type: object
              example: {"summer": "Available", "monsoon": "Limited", "winter": "Available"}
            instagram_handle:
              type: string
              example: "wankhedestadium"
            facebook_handle:
              type: string
              example: "WankhedeStadium"
            twitter_handle:
              type: string
              example: "WankhedeStadium"
            is_public:
              type: boolean
              example: true
            allow_messages:
              type: boolean
              example: true
            show_contact:
              type: boolean
              example: true
            is_verified:
              type: boolean
              example: true
            is_available:
              type: boolean
              example: true
    responses:
      201:
        description: Venue profile created successfully
      400:
        description: Bad request
      409:
        description: Venue profile already exists for this account
      500:
        description: Internal server error
    """
    try:
        current_user_id = 1  # 1 - using test user ID
        
        # Check if venue profile already exists for this account
        existing_profile = VenueProfile.get_by_account_id(current_user_id)
        if existing_profile:
            return jsonify({'error': 'Venue profile already exists for this account'}), 409
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['venue_name', 'venue_type', 'ground_type']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create venue profile
        venue_profile = VenueProfile(
            account_id=current_user_id,
            venue_name=data['venue_name'],
            tagline=data.get('tagline'),
            description=data.get('description'),
            contact_person=data.get('contact_person'),
            contact_number=data.get('contact_number'),
            email=data.get('email'),
            website=data.get('website'),
            address=data.get('address'),
            city=data.get('city'),
            state=data.get('state'),
            country=data.get('country'),
            pincode=data.get('pincode'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            venue_type=data['venue_type'],
            ground_type=data['ground_type'],
            established_year=data.get('established_year'),
            capacity=data.get('capacity'),
            ground_length=data.get('ground_length'),
            ground_width=data.get('ground_width'),
            pitch_count=data.get('pitch_count', 1),
            net_count=data.get('net_count', 0),
            floodlights=data.get('floodlights', False),
            covered_area=data.get('covered_area', False),
            logo_url=data.get('logo_url'),
            banner_image_url=data.get('banner_image_url'),
            facilities=json.dumps(data.get('facilities', [])),
            amenities=json.dumps(data.get('amenities', [])),
            parking_available=data.get('parking_available', False),
            parking_capacity=data.get('parking_capacity', 0),
            changing_rooms=data.get('changing_rooms', False),
            refreshment_facility=data.get('refreshment_facility', False),
            booking_contact=data.get('booking_contact'),
            booking_email=data.get('booking_email'),
            advance_booking_days=data.get('advance_booking_days', 30),
            cancellation_policy=data.get('cancellation_policy'),
            hourly_rate=data.get('hourly_rate'),
            daily_rate=data.get('daily_rate'),
            monthly_rate=data.get('monthly_rate'),
            equipment_rental=data.get('equipment_rental', False),
            equipment_rates=json.dumps(data.get('equipment_rates', {})),
            operating_hours=json.dumps(data.get('operating_hours', {})),
            is_24_7=data.get('is_24_7', False),
            seasonal_availability=json.dumps(data.get('seasonal_availability', {})),
            instagram_handle=data.get('instagram_handle'),
            facebook_handle=data.get('facebook_handle'),
            twitter_handle=data.get('twitter_handle'),
            is_public=data.get('is_public', True),
            allow_messages=data.get('allow_messages', True),
            show_contact=data.get('show_contact', True),
            is_verified=data.get('is_verified', False),
            is_available=data.get('is_available', True)
        )
        
        db.session.add(venue_profile)
        db.session.commit()
        
        return jsonify({
            'message': 'Venue profile created successfully',
            'venue_profile': venue_profile.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@venue_profile_bp.route('/venue-profile/<int:profile_id>', methods=['GET'])
def get_venue_profile(profile_id):
    """
    Get venue profile by ID
    ---
    tags:
      - Venue Profile
    parameters:
      - in: path
        name: profile_id
        type: integer
        required: true
        description: Venue profile ID
    responses:
      200:
        description: Venue profile retrieved successfully
      404:
        description: Venue profile not found
    """
    try:
        venue_profile = VenueProfile.query.filter_by(id=profile_id, deleted_at=None).first()
        
        if not venue_profile:
            return jsonify({'error': 'Venue profile not found'}), 404
        
        return jsonify({
            'venue_profile': venue_profile.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@venue_profile_bp.route('/venue-profile/account/<int:account_id>', methods=['GET'])
def get_venue_profile_by_account(account_id):
    """
    Get venue profile by account ID
    ---
    tags:
      - Venue Profile
    parameters:
      - in: path
        name: account_id
        type: integer
        required: true
        description: Account ID
    responses:
      200:
        description: Venue profile retrieved successfully
      404:
        description: Venue profile not found
    """
    try:
        venue_profile = VenueProfile.get_by_account_id(account_id)
        
        if not venue_profile:
            return jsonify({'error': 'Venue profile not found'}), 404
        
        return jsonify({
            'venue_profile': venue_profile.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@venue_profile_bp.route('/venue-profile/<int:profile_id>', methods=['PATCH'])
def update_venue_profile(profile_id):
    """
    Update venue profile
    ---
    tags:
      - Venue Profile
    parameters:
      - in: path
        name: profile_id
        type: integer
        required: true
        description: Venue profile ID
      - in: body
        name: venue_profile
        description: Updated venue profile data
        required: true
        schema:
          type: object
          properties:
            venue_name:
              type: string
            # ... other fields same as create
    responses:
      200:
        description: Venue profile updated successfully
      400:
        description: Bad request
      403:
        description: Forbidden - not the profile owner
      404:
        description: Venue profile not found
    """
    try:
        current_user_id = 1  # 1 - using test user ID
        
        venue_profile = VenueProfile.query.filter_by(id=profile_id, deleted_at=None).first()
        
        if not venue_profile:
            return jsonify({'error': 'Venue profile not found'}), 404
        
        # Check if user owns this profile
        if venue_profile.account_id != current_user_id:
            return jsonify({'error': 'Forbidden - not the profile owner'}), 403
        
        data = request.get_json()
        
        # Update fields
        for field, value in data.items():
            if hasattr(venue_profile, field):
                if field in ['facilities', 'amenities', 'equipment_rates', 'operating_hours', 'seasonal_availability'] and value:
                    setattr(venue_profile, field, json.dumps(value))
                else:
                    setattr(venue_profile, field, value)
        
        venue_profile.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Venue profile updated successfully',
            'venue_profile': venue_profile.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@venue_profile_bp.route('/venue-profile/<int:profile_id>', methods=['DELETE'])
def delete_venue_profile(profile_id):
    """
    Soft delete venue profile
    ---
    tags:
      - Venue Profile
    parameters:
      - in: path
        name: profile_id
        type: integer
        required: true
        description: Venue profile ID
    responses:
      200:
        description: Venue profile deleted successfully
      403:
        description: Forbidden - not the profile owner
      404:
        description: Venue profile not found
    """
    try:
        current_user_id = 1  # 1 - using test user ID
        
        venue_profile = VenueProfile.query.filter_by(id=profile_id, deleted_at=None).first()
        
        if not venue_profile:
            return jsonify({'error': 'Venue profile not found'}), 404
        
        # Check if user owns this profile
        if venue_profile.account_id != current_user_id:
            return jsonify({'error': 'Forbidden - not the profile owner'}), 403
        
        venue_profile.soft_delete()
        
        return jsonify({
            'message': 'Venue profile deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@venue_profile_bp.route('/venue-profile/<int:profile_id>/restore', methods=['POST'])
def restore_venue_profile(profile_id):
    """
    Restore soft-deleted venue profile
    ---
    tags:
      - Venue Profile
    parameters:
      - in: path
        name: profile_id
        type: integer
        required: true
        description: Venue profile ID
    responses:
      200:
        description: Venue profile restored successfully
      403:
        description: Forbidden - not the profile owner
      404:
        description: Venue profile not found
    """
    try:
        current_user_id = 1  # 1 - using test user ID
        
        venue_profile = VenueProfile.query.filter_by(id=profile_id).first()
        
        if not venue_profile:
            return jsonify({'error': 'Venue profile not found'}), 404
        
        # Check if user owns this profile
        if venue_profile.account_id != current_user_id:
            return jsonify({'error': 'Forbidden - not the profile owner'}), 403
        
        if not venue_profile.deleted_at:
            return jsonify({'error': 'Venue profile is not deleted'}), 400
        
        venue_profile.restore()
        
        return jsonify({
            'message': 'Venue profile restored successfully',
            'venue_profile': venue_profile.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@venue_profile_bp.route('/venue-profiles', methods=['GET'])
def list_venue_profiles():
    """
    List all active venue profiles with pagination and filters
    ---
    tags:
      - Venue Profile
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
        description: Search by venue name or description
      - in: query
        name: venue_type
        type: string
        description: Filter by venue type
      - in: query
        name: ground_type
        type: string
        description: Filter by ground type
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
      - in: query
        name: facilities
        type: string
        description: Filter by facilities (comma-separated)
    responses:
      200:
        description: Venue profiles retrieved successfully
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        venue_type = request.args.get('venue_type', '')
        ground_type = request.args.get('ground_type', '')
        city = request.args.get('city', '')
        state = request.args.get('state', '')
        country = request.args.get('country', '')
        facilities = request.args.get('facilities', '')
        
        query = VenueProfile.query.filter(VenueProfile.deleted_at.is_(None))
        
        # Apply filters
        if search:
            query = query.filter(
                (VenueProfile.venue_name.ilike(f'%{search}%')) |
                (VenueProfile.description.ilike(f'%{search}%'))
            )
        
        if venue_type:
            query = query.filter(VenueProfile.venue_type == venue_type)
        
        if ground_type:
            query = query.filter(VenueProfile.ground_type == ground_type)
        
        if city:
            query = query.filter(VenueProfile.city.ilike(f'%{city}%'))
        
        if state:
            query = query.filter(VenueProfile.state.ilike(f'%{state}%'))
        
        if country:
            query = query.filter(VenueProfile.country.ilike(f'%{country}%'))
        
        if facilities:
            facilities_list = [f.strip() for f in facilities.split(',')]
            query = VenueProfile.search_by_facilities(facilities_list)
        
        # Paginate results
        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        venue_profiles = [profile.to_dict() for profile in pagination.items]
        
        return jsonify({
            'venue_profiles': venue_profiles,
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

@venue_profile_bp.route('/venue-profiles/search/location', methods=['GET'])
def search_venue_profiles_by_location():
    """
    Search venue profiles by location
    ---
    tags:
      - Venue Profile
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
        description: Venue profiles found
    """
    try:
        city = request.args.get('city', '')
        state = request.args.get('state', '')
        country = request.args.get('country', '')
        
        venue_profiles = VenueProfile.search_by_location(city, state, country)
        
        return jsonify({
            'venue_profiles': [profile.to_dict() for profile in venue_profiles]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@venue_profile_bp.route('/venue-profiles/search/facilities', methods=['GET'])
def search_venue_profiles_by_facilities():
    """
    Search venue profiles by facilities
    ---
    tags:
      - Venue Profile
    parameters:
      - in: query
        name: facilities
        type: string
        required: true
        description: Comma-separated list of facilities
    responses:
      200:
        description: Venue profiles found
    """
    try:
        facilities = request.args.get('facilities', '')
        
        if not facilities:
            return jsonify({'error': 'Facilities parameter is required'}), 400
        
        facilities_list = [f.strip() for f in facilities.split(',')]
        venue_profiles = VenueProfile.search_by_facilities(facilities_list)
        
        return jsonify({
            'venue_profiles': [profile.to_dict() for profile in venue_profiles]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
