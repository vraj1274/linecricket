from flask import Blueprint, request, jsonify
from models import db, ProfilePage, PageAdmin, User, AcademyProgram, AcademyStudent
from datetime import datetime
import json

manage_page_bp = Blueprint('manage_page', __name__)

def check_page_access(page_id, user_id):
    """
    Check if user has access to a profile page (owner or admin)
    Returns (has_access, is_owner, is_admin)
    """
    # Check if profile page exists
    profile_page = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
    if not profile_page:
        return False, False, False
    
    # Check if user is the owner
    is_owner = profile_page.user_id == user_id
    
    # Check if user is an admin
    is_admin = PageAdmin.query.filter_by(
        page_id=page_id, 
        user_id=user_id, 
        is_active=True
    ).first() is not None
    
    has_access = is_owner or is_admin
    
    return has_access, is_owner, is_admin

# =============================================================================
# UNIFIED PROFILE PAGE MANAGEMENT API
# =============================================================================

@manage_page_bp.route('/manage-page', methods=['POST'])
def create_manage_page():
    """
    Create a new profile page (Academy, Community, or Venue)
    ---
    tags:
      - Manage Page
    parameters:
      - in: body
        name: profile_data
        description: Profile page data
        required: true
        schema:
          type: object
          properties:
            page_type:
              type: string
              enum: [Academy, Community, Pitch]
              example: "Academy"
            academy_name:
              type: string
              example: "Mumbai Cricket Academy"
            tagline:
              type: string
              example: "Excellence in Cricket Training"
            description:
              type: string
              example: "Premier cricket academy with world-class facilities"
            bio:
              type: string
              example: "Established in 2010, we have trained over 1000 cricketers"
            contact_person:
              type: string
              example: "Rajesh Kumar"
            contact_number:
              type: string
              example: "+91-9876543210"
            email:
              type: string
              example: "info@mumbaicricketacademy.com"
            website:
              type: string
              example: "https://mumbaicricketacademy.com"
            address:
              type: string
              example: "123 Cricket Ground, Bandra West"
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
              example: "400050"
            latitude:
              type: number
              example: 19.0760
            longitude:
              type: number
              example: 72.8777
            # Academy specific fields
            academy_type:
              type: string
              enum: [cricket_academy, coaching_center, sports_club, school_program, university_program]
              example: "cricket_academy"
            level:
              type: string
              enum: [beginner, intermediate, advanced, professional, all_levels]
              example: "all_levels"
            established_year:
              type: integer
              example: 2010
            accreditation:
              type: string
              example: "BCCI Accredited"
            # Community specific fields
            community_type:
              type: string
              enum: [local_club, online_community, tournament_organizer, fan_club, coaching_group, player_association]
              example: "local_club"
            # Venue specific fields
            venue_type:
              type: string
              enum: [cricket_ground, indoor_facility, training_center, stadium, club_ground]
              example: "cricket_ground"
            ground_type:
              type: string
              enum: [natural, artificial, hybrid, indoor, outdoor]
              example: "natural"
            capacity:
              type: integer
              example: 1000
            ground_length:
              type: number
              example: 150.0
            ground_width:
              type: number
              example: 100.0
            pitch_count:
              type: integer
              example: 2
            net_count:
              type: integer
              example: 4
            floodlights:
              type: boolean
              example: true
            covered_area:
              type: boolean
              example: false
            # Common fields
            logo_url:
              type: string
              example: "https://example.com/logo.jpg"
            banner_image_url:
              type: string
              example: "https://example.com/banner.jpg"
            gallery_images:
              type: array
              items:
                type: string
              example: ["https://example.com/gallery1.jpg", "https://example.com/gallery2.jpg"]
            facilities:
              type: array
              items:
                type: string
              example: ["Indoor nets", "Gym", "Swimming pool", "Cafeteria"]
            services_offered:
              type: array
              items:
                type: string
              example: ["Personal coaching", "Group training", "Fitness training"]
            equipment_provided:
              type: boolean
              example: true
            coaching_staff_count:
              type: integer
              example: 15
            programs_offered:
              type: array
              items:
                type: string
              example: ["Summer camp", "Winter training", "Weekend classes"]
            age_groups:
              type: string
              example: "5-18 years"
            batch_timings:
              type: array
              items:
                type: object
                properties:
                  day:
                    type: string
                  time:
                    type: string
              example: [{"day": "Monday", "time": "6:00 AM - 8:00 AM"}]
            fees_structure:
              type: object
              example: {"monthly": 5000, "quarterly": 14000, "yearly": 50000}
            instagram_handle:
              type: string
              example: "mumbaicricketacademy"
            facebook_handle:
              type: string
              example: "MumbaiCricketAcademy"
            twitter_handle:
              type: string
              example: "MumbaiCricket"
            youtube_handle:
              type: string
              example: "MumbaiCricketAcademy"
            achievements:
              type: array
              items:
                type: string
              example: ["BCCI Best Academy Award 2020", "100+ players in IPL"]
            testimonials:
              type: array
              items:
                type: object
                properties:
                  name:
                    type: string
                  text:
                    type: string
              example: [{"name": "Rohit Sharma", "text": "Great training facility"}]
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
              example: false
    responses:
      201:
        description: Profile page created successfully
      400:
        description: Bad request
      409:
        description: Profile page already exists for this account
      500:
        description: Internal server error
    """
    try:
        # Get user ID from request or use test UUID
        current_user_id = request.headers.get('X-User-ID')
        if not current_user_id:
            # Use a test UUID for development
            current_user_id = '550e8400-e29b-41d4-a716-446655440000'
        
        # Check if profile page already exists for this user
        existing_profile = ProfilePage.get_by_user_id(current_user_id)
        if existing_profile:
            return jsonify({'error': 'Profile page already exists for this user'}), 409
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['page_type']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Set the appropriate name field based on page type
        name_field = None
        if data['page_type'] == 'Academy':
            name_field = 'academy_name'
        elif data['page_type'] == 'Community':
            name_field = 'community_name'
        elif data['page_type'] == 'Pitch':
            name_field = 'venue_name'
        
        if name_field and name_field not in data:
            return jsonify({'error': f'Missing required field: {name_field}'}), 400
        
        # Create profile page
        profile_page = ProfilePage(
            user_id=current_user_id,
            firebase_uid=data.get('firebase_uid'),
            cognito_user_id=data.get('cognito_user_id'),
            academy_name=data.get('academy_name', data.get('community_name', data.get('venue_name'))),
            tagline=data.get('tagline'),
            description=data.get('description'),
            bio=data.get('bio'),
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
            academy_type=data.get('academy_type'),
            level=data.get('level'),
            established_year=data.get('established_year'),
            accreditation=data.get('accreditation'),
            logo_url=data.get('logo_url'),
            banner_image_url=data.get('banner_image_url'),
            gallery_images=json.dumps(data.get('gallery_images', [])),
            facilities=json.dumps(data.get('facilities', [])),
            services_offered=json.dumps(data.get('services_offered', [])),
            equipment_provided=data.get('equipment_provided', False),
            coaching_staff_count=data.get('coaching_staff_count', 0),
            programs_offered=json.dumps(data.get('programs_offered', [])),
            age_groups=data.get('age_groups'),
            batch_timings=json.dumps(data.get('batch_timings', [])),
            fees_structure=json.dumps(data.get('fees_structure', {})),
            instagram_handle=data.get('instagram_handle'),
            facebook_handle=data.get('facebook_handle'),
            twitter_handle=data.get('twitter_handle'),
            youtube_handle=data.get('youtube_handle'),
            achievements=json.dumps(data.get('achievements', [])),
            testimonials=json.dumps(data.get('testimonials', [])),
            is_public=data.get('is_public', True),
            allow_messages=data.get('allow_messages', True),
            show_contact=data.get('show_contact', True),
            is_verified=data.get('is_verified', False),
            page_type=data['page_type']
        )
        
        db.session.add(profile_page)
        db.session.commit()
        
        return jsonify({
            'message': f'{data["page_type"]} profile page created successfully',
            'profile_page': profile_page.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@manage_page_bp.route('/manage-page/<uuid:page_id>', methods=['GET'])
def get_manage_page(page_id):
    """
    Get profile page by ID
    ---
    tags:
      - Manage Page
    parameters:
      - in: path
        name: page_id
        type: string
        format: uuid
        required: true
        description: Profile page ID
    responses:
      200:
        description: Profile page retrieved successfully
      404:
        description: Profile page not found
    """
    try:
        profile_page = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        
        if not profile_page:
            return jsonify({'error': 'Profile page not found'}), 404
        
        return jsonify({
            'profile_page': profile_page.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@manage_page_bp.route('/manage-page/user/<user_id>', methods=['GET'])
def get_manage_page_by_user(user_id):
    """
    Get profile page by user ID
    ---
    tags:
      - Manage Page
    parameters:
      - in: path
        name: user_id
        type: integer
        required: true
        description: User ID
    responses:
      200:
        description: Profile page retrieved successfully
      404:
        description: Profile page not found
    """
    try:
        profile_page = ProfilePage.get_by_user_id(user_id)
        
        if not profile_page:
            return jsonify({'error': 'Profile page not found'}), 404
        
        return jsonify({
            'profile_page': profile_page.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@manage_page_bp.route('/manage-page/<uuid:page_id>', methods=['PATCH'])
def update_manage_page(page_id):
    """
    Update profile page
    ---
    tags:
      - Manage Page
    parameters:
      - in: path
        name: page_id
        type: string
        format: uuid
        required: true
        description: Profile page ID
      - in: body
        name: profile_data
        description: Updated profile page data
        required: true
        schema:
          type: object
          properties:
            academy_name:
              type: string
            tagline:
              type: string
            description:
              type: string
            bio:
              type: string
            contact_person:
              type: string
            contact_number:
              type: string
            email:
              type: string
            website:
              type: string
            address:
              type: string
            city:
              type: string
            state:
              type: string
            country:
              type: string
            pincode:
              type: string
            latitude:
              type: number
            longitude:
              type: number
            academy_type:
              type: string
            level:
              type: string
            established_year:
              type: integer
            accreditation:
              type: string
            logo_url:
              type: string
            banner_image_url:
              type: string
            gallery_images:
              type: array
              items:
                type: string
            facilities:
              type: array
              items:
                type: string
            services_offered:
              type: array
              items:
                type: string
            equipment_provided:
              type: boolean
            coaching_staff_count:
              type: integer
            programs_offered:
              type: array
              items:
                type: string
            age_groups:
              type: string
            batch_timings:
              type: array
              items:
                type: object
            fees_structure:
              type: object
            instagram_handle:
              type: string
            facebook_handle:
              type: string
            twitter_handle:
              type: string
            youtube_handle:
              type: string
            achievements:
              type: array
              items:
                type: string
            testimonials:
              type: array
              items:
                type: object
            is_public:
              type: boolean
            allow_messages:
              type: boolean
            show_contact:
              type: boolean
            is_verified:
              type: boolean
    responses:
      200:
        description: Profile page updated successfully
      400:
        description: Bad request
      403:
        description: Forbidden - not the profile owner
      404:
        description: Profile page not found
    """
    try:
        # Get user ID from request or use test UUID
        current_user_id = request.headers.get('X-User-ID')
        if not current_user_id:
            # Use a test UUID for development
            current_user_id = '550e8400-e29b-41d4-a716-446655440000'
        
        # Check if user has access to this profile page
        has_access, is_owner, is_admin = check_page_access(page_id, current_user_id)
        
        if not has_access:
            return jsonify({'error': 'Forbidden - not the profile owner or admin'}), 403
        
        profile_page = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        
        data = request.get_json()
        
        # Update fields
        for field, value in data.items():
            if hasattr(profile_page, field):
                if field in ['facilities', 'services_offered', 'programs_offered', 'batch_timings', 'fees_structure', 'achievements', 'testimonials', 'gallery_images'] and value:
                    setattr(profile_page, field, json.dumps(value))
                else:
                    setattr(profile_page, field, value)
        
        profile_page.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Profile page updated successfully',
            'profile_page': profile_page.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@manage_page_bp.route('/manage-page/<uuid:page_id>', methods=['DELETE'])
def delete_manage_page(page_id):
    """
    Soft delete profile page
    ---
    tags:
      - Manage Page
    parameters:
      - in: path
        name: page_id
        type: string
        format: uuid
        required: true
        description: Profile page ID
    responses:
      200:
        description: Profile page deleted successfully
      403:
        description: Forbidden - not the profile owner
      404:
        description: Profile page not found
    """
    try:
        # Get user ID from request or use test UUID
        current_user_id = request.headers.get('X-User-ID')
        if not current_user_id:
            # Use a test UUID for development
            current_user_id = '550e8400-e29b-41d4-a716-446655440000'
        
        # Check if user has access to this profile page
        has_access, is_owner, is_admin = check_page_access(page_id, current_user_id)
        
        if not has_access:
            return jsonify({'error': 'Forbidden - not the profile owner or admin'}), 403
        
        # Only owners can delete pages, not admins
        if not is_owner:
            return jsonify({'error': 'Forbidden - only the profile owner can delete the page'}), 403
        
        profile_page = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        
        profile_page.soft_delete()
        
        return jsonify({
            'message': 'Profile page deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@manage_page_bp.route('/manage-page/<uuid:page_id>/restore', methods=['POST'])
def restore_manage_page(page_id):
    """
    Restore soft-deleted profile page
    ---
    tags:
      - Manage Page
    parameters:
      - in: path
        name: page_id
        type: string
        format: uuid
        required: true
        description: Profile page ID
    responses:
      200:
        description: Profile page restored successfully
      403:
        description: Forbidden - not the profile owner
      404:
        description: Profile page not found
    """
    try:
        # Get user ID from request or use test UUID
        current_user_id = request.headers.get('X-User-ID')
        if not current_user_id:
            # Use a test UUID for development
            current_user_id = '550e8400-e29b-41d4-a716-446655440000'
        
        # Check if user has access to this profile page
        has_access, is_owner, is_admin = check_page_access(page_id, current_user_id)
        
        if not has_access:
            return jsonify({'error': 'Forbidden - not the profile owner or admin'}), 403
        
        # Only owners can restore pages, not admins
        if not is_owner:
            return jsonify({'error': 'Forbidden - only the profile owner can restore the page'}), 403
        
        profile_page = ProfilePage.query.filter_by(page_id=page_id).first()
        
        if not profile_page:
            return jsonify({'error': 'Profile page not found'}), 404
        
        if not profile_page.deleted_at:
            return jsonify({'error': 'Profile page is not deleted'}), 400
        
        profile_page.restore()
        
        return jsonify({
            'message': 'Profile page restored successfully',
            'profile_page': profile_page.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@manage_page_bp.route('/manage-pages', methods=['GET'])
def list_manage_pages():
    """
    List all active profile pages with pagination and filters
    ---
    tags:
      - Manage Page
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
        description: Search by name or description
      - in: query
        name: page_type
        type: string
        description: Filter by page type (Academy, Community, Pitch)
      - in: query
        name: academy_type
        type: string
        description: Filter by academy type
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
        description: Profile pages retrieved successfully
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        page_type = request.args.get('page_type', '')
        academy_type = request.args.get('academy_type', '')
        level = request.args.get('level', '')
        city = request.args.get('city', '')
        state = request.args.get('state', '')
        country = request.args.get('country', '')
        
        query = ProfilePage.query.filter(ProfilePage.deleted_at.is_(None))
        
        # Apply filters
        if search:
            query = query.filter(
                (ProfilePage.academy_name.ilike(f'%{search}%')) |
                (ProfilePage.description.ilike(f'%{search}%'))
            )
        
        if page_type:
            query = query.filter(ProfilePage.page_type == page_type)
        
        if academy_type:
            query = query.filter(ProfilePage.academy_type == academy_type)
        
        if level:
            query = query.filter(ProfilePage.level == level)
        
        if city:
            query = query.filter(ProfilePage.city.ilike(f'%{city}%'))
        
        if state:
            query = query.filter(ProfilePage.state.ilike(f'%{state}%'))
        
        if country:
            query = query.filter(ProfilePage.country.ilike(f'%{country}%'))
        
        # Paginate results
        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        profile_pages = [profile.to_dict() for profile in pagination.items]
        
        return jsonify({
            'profile_pages': profile_pages,
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

# =============================================================================
# ACADEMY SPECIFIC MANAGEMENT ENDPOINTS
# =============================================================================

@manage_page_bp.route('/manage-page/<uuid:page_id>/academy/programs', methods=['POST'])
def create_academy_program(page_id):
    """Create a new academy program"""
    try:
        # Get user ID from request or use test UUID
        current_user_id = request.headers.get('X-User-ID')
        if not current_user_id:
            # Use a test UUID for development
            current_user_id = '550e8400-e29b-41d4-a716-446655440000'
        
        # Check if user has access to this profile page
        has_access, is_owner, is_admin = check_page_access(page_id, current_user_id)
        
        if not has_access:
            return jsonify({'error': 'Forbidden - not the profile owner or admin'}), 403
        
        # Check if academy profile exists
        academy_profile = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        if not academy_profile:
            return jsonify({'error': 'Academy profile not found'}), 404
        
        if academy_profile.page_type != 'Academy':
            return jsonify({'error': 'This is not an academy profile'}), 400
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['program_name']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create academy program
        program = AcademyProgram(
            academy_profile_id=academy_profile.id,
            program_name=data['program_name'],
            description=data.get('description'),
            duration_weeks=data.get('duration_weeks'),
            age_group=data.get('age_group'),
            level=data.get('level'),
            fees=data.get('fees'),
            max_students=data.get('max_students'),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(program)
        db.session.commit()
        
        return jsonify({
            'message': 'Academy program created successfully',
            'program': program.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@manage_page_bp.route('/manage-page/<uuid:page_id>/academy/programs', methods=['GET'])
def get_academy_programs(page_id):
    """Get all programs for an academy"""
    try:
        # Check if academy profile exists
        academy_profile = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        if not academy_profile:
            return jsonify({'error': 'Academy profile not found'}), 404
        
        if academy_profile.page_type != 'Academy':
            return jsonify({'error': 'This is not an academy profile'}), 400
        
        # Get filter parameters
        is_active = request.args.get('is_active', type=bool)
        
        # Build query
        query = AcademyProgram.query.filter_by(academy_profile_id=academy_profile.id)
        
        if is_active is not None:
            query = query.filter_by(is_active=is_active)
        
        programs = query.all()
        
        return jsonify({
            'programs': [program.to_dict() for program in programs]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@manage_page_bp.route('/manage-page/<uuid:page_id>/academy/students', methods=['POST'])
def add_academy_student(page_id):
    """Add a student to an academy"""
    try:
        # Get user ID from request or use test UUID
        current_user_id = request.headers.get('X-User-ID')
        if not current_user_id:
            # Use a test UUID for development
            current_user_id = '550e8400-e29b-41d4-a716-446655440000'
        
        # Check if academy profile exists
        academy_profile = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        if not academy_profile:
            return jsonify({'error': 'Academy profile not found'}), 404
        
        if academy_profile.page_type != 'Academy':
            return jsonify({'error': 'This is not an academy profile'}), 400
        
        # Check if user owns this academy
        if academy_profile.user_id != current_user_id:
            return jsonify({'error': 'Forbidden - not the academy owner'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['student_name']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Parse enrollment date if provided
        enrollment_date = None
        if data.get('enrollment_date'):
            try:
                enrollment_date = datetime.strptime(data['enrollment_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid enrollment_date format. Use YYYY-MM-DD'}), 400
        
        # Create academy student
        student = AcademyStudent(
            academy_profile_id=academy_profile.id,
            student_name=data['student_name'],
            age=data.get('age'),
            level=data.get('level'),
            enrollment_date=enrollment_date or datetime.utcnow().date(),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(student)
        db.session.commit()
        
        return jsonify({
            'message': 'Student added successfully',
            'student': student.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@manage_page_bp.route('/manage-page/<uuid:page_id>/academy/students', methods=['GET'])
def get_academy_students(page_id):
    """Get all students for an academy"""
    try:
        # Check if academy profile exists
        academy_profile = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        if not academy_profile:
            return jsonify({'error': 'Academy profile not found'}), 404
        
        if academy_profile.page_type != 'Academy':
            return jsonify({'error': 'This is not an academy profile'}), 400
        
        # Get filter parameters
        is_active = request.args.get('is_active', type=bool)
        level = request.args.get('level', '')
        
        # Build query
        query = AcademyStudent.query.filter_by(academy_profile_id=academy_profile.id)
        
        if is_active is not None:
            query = query.filter_by(is_active=is_active)
        
        if level:
            query = query.filter_by(level=level)
        
        students = query.all()
        
        return jsonify({
            'students': [student.to_dict() for student in students]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =============================================================================
# PROFILE PAGE ADMINISTRATORS MANAGEMENT
# =============================================================================

@manage_page_bp.route('/manage-page/<uuid:page_id>/admins', methods=['POST'])
def add_page_admin(page_id):
    """Add an admin to a profile page"""
    try:
        # Get user ID from request or use test UUID
        current_user_id = request.headers.get('X-User-ID')
        if not current_user_id:
            # Use a test UUID for development
            current_user_id = '550e8400-e29b-41d4-a716-446655440000'
        
        # Check if profile page exists
        profile_page = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        if not profile_page:
            return jsonify({'error': 'Profile page not found'}), 404
        
        # Check if user has access to this profile page
        has_access, is_owner, is_admin = check_page_access(page_id, current_user_id)
        
        if not has_access:
            return jsonify({'error': 'Forbidden - not the profile owner or admin'}), 403
        
        # Only owners can add admins, not other admins
        if not is_owner:
            return jsonify({'error': 'Forbidden - only the profile owner can add admins'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_id', 'admin_name']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if trying to add the owner as admin (owner is automatically admin)
        if data['user_id'] == profile_page.user_id:
            return jsonify({'error': 'Profile owner is automatically an admin'}), 400
        
        # Check if admin already exists for this page and user
        existing_admin = PageAdmin.query.filter_by(
            page_id=page_id, 
            user_id=data['user_id']
        ).first()
        if existing_admin:
            return jsonify({'error': 'Admin already exists for this page and user'}), 409
        
        # Create page admin
        page_admin = PageAdmin(
            page_id=page_id,
            user_id=data['user_id'],
            admin_name=data['admin_name'],
            specialization=data.get('specialization'),
            experience_years=data.get('experience_years', 0),
            qualifications=data.get('qualifications'),
            profile_image_url=data.get('profile_image_url'),
            bio=data.get('bio'),
            admin_role=data.get('admin_role', 'admin'),
            permissions=json.dumps(data.get('permissions', [])),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(page_admin)
        db.session.commit()
        
        return jsonify({
            'message': 'Admin added successfully',
            'admin': page_admin.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@manage_page_bp.route('/manage-page/<uuid:page_id>/admins', methods=['GET'])
def get_page_admins(page_id):
    """Get all admins for a profile page (including owner)"""
    try:
        # Check if profile page exists
        profile_page = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        if not profile_page:
            return jsonify({'error': 'Profile page not found'}), 404
        
        # Get all additional admins for this page
        additional_admins = PageAdmin.query.filter_by(page_id=page_id, is_active=True).all()
        
        # Get owner information
        owner = User.query.get(profile_page.user_id)
        owner_admin = {
            'id': 'owner',
            'page_id': str(page_id),
            'user_id': profile_page.user_id,
            'admin_name': owner.username if owner else 'Profile Owner',
            'specialization': 'Owner',
            'experience_years': 0,
            'qualifications': 'Profile Owner',
            'profile_image_url': None,
            'bio': 'Profile owner and primary administrator',
            'admin_role': 'owner',
            'permissions': ['all_permissions'],
            'is_active': True,
            'created_at': profile_page.created_at.isoformat() if profile_page.created_at else None,
            'updated_at': profile_page.updated_at.isoformat() if profile_page.updated_at else None
        }
        
        # Combine owner and additional admins
        all_admins = [owner_admin] + [admin.to_dict() for admin in additional_admins]
        
        return jsonify({
            'admins': all_admins,
            'owner': owner_admin
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =============================================================================
# COMMUNITY SPECIFIC MANAGEMENT ENDPOINTS
# =============================================================================

@manage_page_bp.route('/manage-page/<uuid:page_id>/community/members', methods=['POST'])
def add_community_member(page_id):
    """Add a member to a community"""
    try:
        # Get user ID from request or use test UUID
        current_user_id = request.headers.get('X-User-ID')
        if not current_user_id:
            # Use a test UUID for development
            current_user_id = '550e8400-e29b-41d4-a716-446655440000'
        
        # Check if user has access to this profile page
        has_access, is_owner, is_admin = check_page_access(page_id, current_user_id)
        
        if not has_access:
            return jsonify({'error': 'Forbidden - not the profile owner or admin'}), 403
        
        # Check if community profile exists
        community_profile = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        if not community_profile:
            return jsonify({'error': 'Community profile not found'}), 404
        
        if community_profile.page_type != 'Community':
            return jsonify({'error': 'This is not a community profile'}), 400
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if member already exists
        existing_member = CommunityProfile.query.filter_by(
            account_id=data['user_id']
        ).first()
        if existing_member:
            return jsonify({'error': 'User is already a member of this community'}), 409
        
        # Create community member (using CommunityProfile model)
        member = CommunityProfile(
            account_id=data['user_id'],
            community_name=data.get('community_name', community_profile.academy_name),
            tagline=data.get('tagline'),
            description=data.get('description'),
            bio=data.get('bio'),
            community_type=data.get('community_type', 'local_club'),
            level=data.get('level', 'all_levels'),
            location=data.get('location'),
            city=data.get('city', community_profile.city),
            state=data.get('state', community_profile.state),
            country=data.get('country', community_profile.country),
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
            max_members=data.get('max_members', 100),
            current_members=data.get('current_members', 1),
            membership_fee=data.get('membership_fee', 0.0),
            membership_duration=data.get('membership_duration', 'yearly'),
            rules=data.get('rules'),
            guidelines=data.get('guidelines'),
            code_of_conduct=data.get('code_of_conduct'),
            activities=data.get('activities'),
            regular_meetings=data.get('regular_meetings'),
            instagram_handle=data.get('instagram_handle'),
            facebook_handle=data.get('facebook_handle'),
            twitter_handle=data.get('twitter_handle'),
            discord_handle=data.get('discord_handle'),
            whatsapp_group=data.get('whatsapp_group'),
            total_posts=data.get('total_posts', 0),
            total_events=data.get('total_events', 0),
            achievements=data.get('achievements'),
            testimonials=data.get('testimonials'),
            auto_approve_posts=data.get('auto_approve_posts', True),
            allow_member_posts=data.get('allow_member_posts', True),
            allow_guest_posts=data.get('allow_guest_posts', False),
            content_moderation=data.get('content_moderation', True)
        )
        
        db.session.add(member)
        db.session.commit()
        
        return jsonify({
            'message': 'Community member added successfully',
            'member': member.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@manage_page_bp.route('/manage-page/<uuid:page_id>/community/members', methods=['GET'])
def get_community_members(page_id):
    """Get all members for a community"""
    try:
        # Check if community profile exists
        community_profile = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        if not community_profile:
            return jsonify({'error': 'Community profile not found'}), 404
        
        if community_profile.page_type != 'Community':
            return jsonify({'error': 'This is not a community profile'}), 400
        
        # Get filter parameters
        is_active = request.args.get('is_active', type=bool)
        role = request.args.get('role', '')
        
        # Build query
        query = CommunityProfile.query.filter_by(account_id=community_profile.user_id)
        
        if is_active is not None:
            query = query.filter_by(is_active=is_active)
        
        if role:
            query = query.filter_by(role=role)
        
        members = query.all()
        
        return jsonify({
            'members': [member.to_dict() for member in members]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =============================================================================
# VENUE SPECIFIC MANAGEMENT ENDPOINTS
# =============================================================================

@manage_page_bp.route('/manage-page/<uuid:page_id>/venue/bookings', methods=['POST'])
def create_venue_booking(page_id):
    """Create a venue booking"""
    try:
        # Get user ID from request or use test UUID
        current_user_id = request.headers.get('X-User-ID')
        if not current_user_id:
            # Use a test UUID for development
            current_user_id = '550e8400-e29b-41d4-a716-446655440000'
        
        # Check if user has access to this profile page
        has_access, is_owner, is_admin = check_page_access(page_id, current_user_id)
        
        if not has_access:
            return jsonify({'error': 'Forbidden - not the profile owner or admin'}), 403
        
        # Check if venue profile exists
        venue_profile = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        if not venue_profile:
            return jsonify({'error': 'Venue profile not found'}), 404
        
        if venue_profile.page_type != 'Pitch':
            return jsonify({'error': 'This is not a venue profile'}), 400
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['booking_date', 'start_time', 'end_time', 'duration_hours']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Parse booking date if provided
        booking_date = None
        if data.get('booking_date'):
            try:
                booking_date = datetime.strptime(data['booking_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid booking_date format. Use YYYY-MM-DD'}), 400
        
        # Parse start and end times
        start_time = None
        end_time = None
        if data.get('start_time'):
            try:
                start_time = datetime.strptime(data['start_time'], '%H:%M').time()
            except ValueError:
                return jsonify({'error': 'Invalid start_time format. Use HH:MM'}), 400
        
        if data.get('end_time'):
            try:
                end_time = datetime.strptime(data['end_time'], '%H:%M').time()
            except ValueError:
                return jsonify({'error': 'Invalid end_time format. Use HH:MM'}), 400
        
        # Create venue booking
        booking = VenueProfile(
            account_id=current_user_id,
            venue_name=data.get('venue_name', venue_profile.academy_name),
            tagline=data.get('tagline'),
            description=data.get('description'),
            contact_person=data.get('contact_person'),
            contact_number=data.get('contact_number'),
            email=data.get('email'),
            website=data.get('website'),
            address=data.get('address', venue_profile.address),
            city=data.get('city', venue_profile.city),
            state=data.get('state', venue_profile.state),
            country=data.get('country', venue_profile.country),
            pincode=data.get('pincode', venue_profile.pincode),
            latitude=data.get('latitude', venue_profile.latitude),
            longitude=data.get('longitude', venue_profile.longitude),
            venue_type=data.get('venue_type', 'cricket_ground'),
            ground_type=data.get('ground_type', 'natural'),
            established_year=data.get('established_year'),
            capacity=data.get('capacity', 100),
            ground_length=data.get('ground_length', 150.0),
            ground_width=data.get('ground_width', 100.0),
            pitch_count=data.get('pitch_count', 1),
            net_count=data.get('net_count', 2),
            floodlights=data.get('floodlights', False),
            covered_area=data.get('covered_area', False),
            logo_url=data.get('logo_url'),
            banner_image_url=data.get('banner_image_url'),
            gallery_images=data.get('gallery_images'),
            virtual_tour_url=data.get('virtual_tour_url'),
            facilities=data.get('facilities'),
            amenities=data.get('amenities'),
            parking_available=data.get('parking_available', True),
            parking_capacity=data.get('parking_capacity', 50),
            changing_rooms=data.get('changing_rooms', True),
            refreshment_facility=data.get('refreshment_facility', True),
            booking_contact=data.get('booking_contact'),
            booking_email=data.get('booking_email'),
            advance_booking_days=data.get('advance_booking_days', 7),
            cancellation_policy=data.get('cancellation_policy'),
            hourly_rate=data.get('hourly_rate', 1000.0),
            daily_rate=data.get('daily_rate', 5000.0),
            monthly_rate=data.get('monthly_rate', 50000.0),
            equipment_rental=data.get('equipment_rental', True),
            equipment_rates=data.get('equipment_rates'),
            operating_hours=data.get('operating_hours'),
            is_24_7=data.get('is_24_7', False),
            seasonal_availability=data.get('seasonal_availability'),
            instagram_handle=data.get('instagram_handle'),
            facebook_handle=data.get('facebook_handle'),
            twitter_handle=data.get('twitter_handle'),
            total_bookings=data.get('total_bookings', 0),
            average_rating=data.get('average_rating', 0.0),
            total_reviews=data.get('total_reviews', 0),
            reviews=data.get('reviews'),
            is_public=data.get('is_public', True),
            allow_messages=data.get('allow_messages', True),
            show_contact=data.get('show_contact', True),
            is_verified=data.get('is_verified', False),
            is_available=data.get('is_available', True)
        )
        
        db.session.add(booking)
        db.session.commit()
        
        return jsonify({
            'message': 'Venue booking created successfully',
            'booking': booking.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@manage_page_bp.route('/manage-page/<uuid:page_id>/venue/bookings', methods=['GET'])
def get_venue_bookings(page_id):
    """Get all bookings for a venue"""
    try:
        # Check if venue profile exists
        venue_profile = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        if not venue_profile:
            return jsonify({'error': 'Venue profile not found'}), 404
        
        if venue_profile.page_type != 'Pitch':
            return jsonify({'error': 'This is not a venue profile'}), 400
        
        # Get filter parameters
        status = request.args.get('status', '')
        user_id = request.args.get('user_id')
        
        # Build query
        query = VenueProfile.query.filter_by(account_id=venue_profile.user_id)
        
        if status:
            query = query.filter_by(status=status)
        
        if user_id:
            query = query.filter_by(user_id=user_id)
        
        bookings = query.all()
        
        return jsonify({
            'bookings': [booking.to_dict() for booking in bookings]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =============================================================================
# PROFILE PAGE STATISTICS
# =============================================================================

@manage_page_bp.route('/manage-page/<uuid:page_id>/stats', methods=['GET'])
def get_profile_page_stats(page_id):
    """Get profile page statistics"""
    try:
        # Check if profile page exists
        profile_page = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        if not profile_page:
            return jsonify({'error': 'Profile page not found'}), 404
        
        stats = {
            'profile_page': profile_page.to_dict(),
            'statistics': {}
        }
        
        # Get academy-specific statistics
        if profile_page.page_type == 'Academy':
            total_programs = AcademyProgram.query.filter_by(academy_profile_id=profile_page.id).count()
            active_programs = AcademyProgram.query.filter_by(academy_profile_id=profile_page.id, is_active=True).count()
            
            total_students = AcademyStudent.query.filter_by(academy_profile_id=profile_page.id).count()
            active_students = AcademyStudent.query.filter_by(academy_profile_id=profile_page.id, is_active=True).count()
            
            # Get students by level
            students_by_level = db.session.query(
                AcademyStudent.level, 
                db.func.count(AcademyStudent.id)
            ).filter_by(
                academy_profile_id=profile_page.id, 
                is_active=True
            ).group_by(AcademyStudent.level).all()
            
            level_distribution = {level: count for level, count in students_by_level}
            
            stats['statistics'] = {
                'total_programs': total_programs,
                'active_programs': active_programs,
                'total_students': total_students,
                'active_students': active_students,
                'students_by_level': level_distribution
            }
        
        # Get admin statistics
        total_admins = PageAdmin.query.filter_by(page_id=page_id).count()
        active_admins = PageAdmin.query.filter_by(page_id=page_id, is_active=True).count()
        
        stats['statistics']['total_admins'] = total_admins
        stats['statistics']['active_admins'] = active_admins
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
