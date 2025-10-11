from flask import Blueprint, request, jsonify
from models import db, ProfilePage, PageAdmin, User, AcademyProgram, AcademyStudent
from datetime import datetime
import json

profile_page_bp = Blueprint('profile_page', __name__)

@profile_page_bp.route('/profile-page/posts/<post_id>', methods=['DELETE'])
def delete_profile_post(post_id):
    """
    Delete a post from a profile page
    """
    try:
        # For now, return success
        # In a real implementation, this would delete the post
        return jsonify({
            'success': True,
            'message': 'Post deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@profile_page_bp.route('/profile-page', methods=['POST'])
def create_profile_page():
    """
    Create a new academy profile
    ---
    tags:
      - Academy Profile
    parameters:
      - in: body
        name: academy_profile
        description: Academy profile data
        required: true
        schema:
          type: object
          properties:
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
        description: Academy profile created successfully
      400:
        description: Bad request
      409:
        description: Academy profile already exists for this account
      500:
        description: Internal server error
    """
    try:
        current_user_id = 1  # 1 - using test user ID
        
        # Check if profile page already exists for this user
        existing_profile = ProfilePage.get_by_user_id(current_user_id)
        if existing_profile:
            return jsonify({'error': 'Profile page already exists for this user'}), 409
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['academy_name', 'academy_type', 'level', 'page_type']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create profile page
        profile_page = ProfilePage(
            user_id=current_user_id,
            firebase_uid=data.get('firebase_uid'),
            cognito_user_id=data.get('cognito_user_id'),
            academy_name=data['academy_name'],
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
            academy_type=data['academy_type'],
            level=data['level'],
            established_year=data.get('established_year'),
            accreditation=data.get('accreditation'),
            logo_url=data.get('logo_url'),
            banner_image_url=data.get('banner_image_url'),
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
            'message': 'Profile page created successfully',
            'profile_page': profile_page.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@profile_page_bp.route('/profile-page/<uuid:page_id>', methods=['GET'])
def get_profile_page(page_id):
    """
    Get profile page by ID
    ---
    tags:
      - Profile Page
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

@profile_page_bp.route('/profile-page/user/<int:user_id>', methods=['GET'])
def get_profile_page_by_user(user_id):
    """
    Get profile page by user ID
    ---
    tags:
      - Profile Page
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

@profile_page_bp.route('/profile-page/<uuid:page_id>', methods=['PATCH'])
def update_profile_page(page_id):
    """
    Update profile page
    ---
    tags:
      - Profile Page
    parameters:
      - in: path
        name: page_id
        type: string
        format: uuid
        required: true
        description: Profile page ID
      - in: body
        name: profile_page
        description: Updated profile page data
        required: true
        schema:
          type: object
          properties:
            academy_name:
              type: string
            # ... other fields same as create
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
        current_user_id = 1  # 1 - using test user ID
        
        profile_page = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        
        if not profile_page:
            return jsonify({'error': 'Profile page not found'}), 404
        
        # Check if user owns this profile
        if profile_page.user_id != current_user_id:
            return jsonify({'error': 'Forbidden - not the profile owner'}), 403
        
        data = request.get_json()
        
        # Update fields
        for field, value in data.items():
            if hasattr(profile_page, field):
                if field in ['facilities', 'services_offered', 'programs_offered', 'batch_timings', 'fees_structure', 'achievements', 'testimonials'] and value:
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

@profile_page_bp.route('/profile-page/<uuid:page_id>', methods=['DELETE'])
def delete_profile_page(page_id):
    """
    Soft delete profile page
    ---
    tags:
      - Profile Page
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
        current_user_id = 1  # 1 - using test user ID
        
        profile_page = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        
        if not profile_page:
            return jsonify({'error': 'Profile page not found'}), 404
        
        # Check if user owns this profile
        if profile_page.user_id != current_user_id:
            return jsonify({'error': 'Forbidden - not the profile owner'}), 403
        
        profile_page.soft_delete()
        
        return jsonify({
            'message': 'Profile page deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profile_page_bp.route('/profile-page/<uuid:page_id>/restore', methods=['POST'])
def restore_profile_page(page_id):
    """
    Restore soft-deleted profile page
    ---
    tags:
      - Profile Page
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
        current_user_id = 1  # 1 - using test user ID
        
        profile_page = ProfilePage.query.filter_by(page_id=page_id).first()
        
        if not profile_page:
            return jsonify({'error': 'Profile page not found'}), 404
        
        # Check if user owns this profile
        if profile_page.user_id != current_user_id:
            return jsonify({'error': 'Forbidden - not the profile owner'}), 403
        
        if not profile_page.deleted_at:
            return jsonify({'error': 'Profile page is not deleted'}), 400
        
        profile_page.restore()
        
        return jsonify({
            'message': 'Profile page restored successfully',
            'profile_page': profile_page.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profile_page_bp.route('/profile-pages', methods=['GET'])
def list_profile_pages():
    """
    List all active profile pages with pagination and filters
    ---
    tags:
      - Profile Page
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
        description: Search by academy name or description
      - in: query
        name: academy_type
        type: string
        description: Filter by academy type
      - in: query
        name: level
        type: string
        description: Filter by level
      - in: query
        name: page_type
        type: string
        description: Filter by page type
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
        academy_type = request.args.get('academy_type', '')
        level = request.args.get('level', '')
        page_type = request.args.get('page_type', '')
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
        
        if academy_type:
            query = query.filter(ProfilePage.academy_type == academy_type)
        
        if level:
            query = query.filter(ProfilePage.level == level)
        
        if page_type:
            query = query.filter(ProfilePage.page_type == page_type)
        
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

@profile_page_bp.route('/profile-pages/search/location', methods=['GET'])
def search_profile_pages_by_location():
    """
    Search profile pages by location
    ---
    tags:
      - Profile Page
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
        description: Profile pages found
    """
    try:
        city = request.args.get('city', '')
        state = request.args.get('state', '')
        country = request.args.get('country', '')
        
        profile_pages = ProfilePage.search_by_location(city, state, country)
        
        return jsonify({
            'profile_pages': [profile.to_dict() for profile in profile_pages]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Page Admin Routes

@profile_page_bp.route('/profile-page/<uuid:page_id>/admins', methods=['POST'])
def add_page_admin(page_id):
    """
    Add an admin to a profile page
    ---
    tags:
      - Profile Page Admin
    parameters:
      - in: path
        name: page_id
        type: string
        format: uuid
        required: true
        description: Profile page ID
      - in: body
        name: admin_data
        description: Admin data
        required: true
        schema:
          type: object
          properties:
            user_id:
              type: integer
              description: User ID of the admin
            admin_name:
              type: string
              description: Admin display name
            specialization:
              type: string
              description: Admin specialization
            experience_years:
              type: integer
              description: Years of experience
            qualifications:
              type: string
              description: Admin qualifications
            profile_image_url:
              type: string
              description: Profile image URL
            bio:
              type: string
              description: Admin bio
            admin_role:
              type: string
              description: Admin role (admin, super_admin, etc.)
            permissions:
              type: array
              items:
                type: string
              description: Admin permissions
    responses:
      201:
        description: Admin added successfully
      400:
        description: Bad request
      404:
        description: Profile page not found
      409:
        description: Admin already exists for this page
    """
    try:
        current_user_id = 1  # Using test user ID
        
        # Check if profile page exists
        profile_page = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        if not profile_page:
            return jsonify({'error': 'Profile page not found'}), 404
        
        # Check if user owns this profile page
        if profile_page.user_id != current_user_id:
            return jsonify({'error': 'Forbidden - not the profile owner'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_id', 'admin_name']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
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

@profile_page_bp.route('/profile-page/<uuid:page_id>/admins', methods=['GET'])
def get_page_admins(page_id):
    """
    Get all admins for a profile page
    ---
    tags:
      - Profile Page Admin
    parameters:
      - in: path
        name: page_id
        type: string
        format: uuid
        required: true
        description: Profile page ID
    responses:
      200:
        description: Admins retrieved successfully
      404:
        description: Profile page not found
    """
    try:
        # Check if profile page exists
        profile_page = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        if not profile_page:
            return jsonify({'error': 'Profile page not found'}), 404
        
        # Get all admins for this page
        admins = PageAdmin.query.filter_by(page_id=page_id, is_active=True).all()
        
        return jsonify({
            'admins': [admin.to_dict() for admin in admins]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profile_page_bp.route('/profile-page/<uuid:page_id>/admins/<int:admin_id>', methods=['PATCH'])
def update_page_admin(page_id, admin_id):
    """
    Update a page admin
    ---
    tags:
      - Profile Page Admin
    parameters:
      - in: path
        name: page_id
        type: string
        format: uuid
        required: true
        description: Profile page ID
      - in: path
        name: admin_id
        type: integer
        required: true
        description: Admin ID
      - in: body
        name: admin_data
        description: Updated admin data
        required: true
        schema:
          type: object
          properties:
            admin_name:
              type: string
            specialization:
              type: string
            experience_years:
              type: integer
            qualifications:
              type: string
            profile_image_url:
              type: string
            bio:
              type: string
            admin_role:
              type: string
            permissions:
              type: array
              items:
                type: string
            is_active:
              type: boolean
    responses:
      200:
        description: Admin updated successfully
      400:
        description: Bad request
      403:
        description: Forbidden - not the profile owner
      404:
        description: Admin not found
    """
    try:
        current_user_id = 1  # Using test user ID
        
        # Check if profile page exists and user owns it
        profile_page = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        if not profile_page:
            return jsonify({'error': 'Profile page not found'}), 404
        
        if profile_page.user_id != current_user_id:
            return jsonify({'error': 'Forbidden - not the profile owner'}), 403
        
        # Get the admin
        page_admin = PageAdmin.query.filter_by(id=admin_id, page_id=page_id).first()
        if not page_admin:
            return jsonify({'error': 'Admin not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        for field, value in data.items():
            if hasattr(page_admin, field):
                if field == 'permissions' and value:
                    setattr(page_admin, field, json.dumps(value))
                else:
                    setattr(page_admin, field, value)
        
        page_admin.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Admin updated successfully',
            'admin': page_admin.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@profile_page_bp.route('/profile-page/<uuid:page_id>/admins/<int:admin_id>', methods=['DELETE'])
def remove_page_admin(page_id, admin_id):
    """
    Remove an admin from a profile page
    ---
    tags:
      - Profile Page Admin
    parameters:
      - in: path
        name: page_id
        type: string
        format: uuid
        required: true
        description: Profile page ID
      - in: path
        name: admin_id
        type: integer
        required: true
        description: Admin ID
    responses:
      200:
        description: Admin removed successfully
      403:
        description: Forbidden - not the profile owner
      404:
        description: Admin not found
    """
    try:
        current_user_id = 1  # Using test user ID
        
        # Check if profile page exists and user owns it
        profile_page = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        if not profile_page:
            return jsonify({'error': 'Profile page not found'}), 404
        
        if profile_page.user_id != current_user_id:
            return jsonify({'error': 'Forbidden - not the profile owner'}), 403
        
        # Get the admin
        page_admin = PageAdmin.query.filter_by(id=admin_id, page_id=page_id).first()
        if not page_admin:
            return jsonify({'error': 'Admin not found'}), 404
        
        # Soft delete by setting is_active to False
        page_admin.is_active = False
        page_admin.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Admin removed successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Academy Programs API Endpoints

@profile_page_bp.route('/academy/<uuid:page_id>/programs', methods=['POST'])
def create_academy_program(page_id):
    """
    Create a new academy program
    ---
    tags:
      - Academy Programs
    parameters:
      - in: path
        name: page_id
        type: string
        format: uuid
        required: true
        description: Academy profile page ID
      - in: body
        name: program_data
        description: Academy program data
        required: true
        schema:
          type: object
          properties:
            program_name:
              type: string
              example: "Summer Cricket Camp"
            description:
              type: string
              example: "Intensive 4-week cricket training program"
            duration_weeks:
              type: integer
              example: 4
            age_group:
              type: string
              example: "8-16 years"
            level:
              type: string
              example: "beginner"
            fees:
              type: number
              example: 5000.0
            max_students:
              type: integer
              example: 30
            is_active:
              type: boolean
              example: true
    responses:
      201:
        description: Academy program created successfully
      400:
        description: Bad request
      404:
        description: Academy profile not found
      403:
        description: Forbidden - not the academy owner
    """
    try:
        current_user_id = 1  # Using test user ID
        
        # Check if academy profile exists
        academy_profile = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        if not academy_profile:
            return jsonify({'error': 'Academy profile not found'}), 404
        
        # Check if user owns this academy
        if academy_profile.user_id != current_user_id:
            return jsonify({'error': 'Forbidden - not the academy owner'}), 403
        
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

@profile_page_bp.route('/academy/<uuid:page_id>/programs', methods=['GET'])
def get_academy_programs(page_id):
    """
    Get all programs for an academy
    ---
    tags:
      - Academy Programs
    parameters:
      - in: path
        name: page_id
        type: string
        format: uuid
        required: true
        description: Academy profile page ID
      - in: query
        name: is_active
        type: boolean
        description: Filter by active status
    responses:
      200:
        description: Programs retrieved successfully
      404:
        description: Academy profile not found
    """
    try:
        # Check if academy profile exists
        academy_profile = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        if not academy_profile:
            return jsonify({'error': 'Academy profile not found'}), 404
        
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

@profile_page_bp.route('/academy/<uuid:page_id>/programs/<int:program_id>', methods=['PATCH'])
def update_academy_program(page_id, program_id):
    """
    Update an academy program
    ---
    tags:
      - Academy Programs
    parameters:
      - in: path
        name: page_id
        type: string
        format: uuid
        required: true
        description: Academy profile page ID
      - in: path
        name: program_id
        type: integer
        required: true
        description: Program ID
      - in: body
        name: program_data
        description: Updated program data
        required: true
        schema:
          type: object
          properties:
            program_name:
              type: string
            description:
              type: string
            duration_weeks:
              type: integer
            age_group:
              type: string
            level:
              type: string
            fees:
              type: number
            max_students:
              type: integer
            is_active:
              type: boolean
    responses:
      200:
        description: Program updated successfully
      400:
        description: Bad request
      403:
        description: Forbidden - not the academy owner
      404:
        description: Program not found
    """
    try:
        current_user_id = 1  # Using test user ID
        
        # Check if academy profile exists and user owns it
        academy_profile = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        if not academy_profile:
            return jsonify({'error': 'Academy profile not found'}), 404
        
        if academy_profile.user_id != current_user_id:
            return jsonify({'error': 'Forbidden - not the academy owner'}), 403
        
        # Get the program
        program = AcademyProgram.query.filter_by(
            id=program_id, 
            academy_profile_id=academy_profile.id
        ).first()
        if not program:
            return jsonify({'error': 'Program not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        for field, value in data.items():
            if hasattr(program, field):
                setattr(program, field, value)
        
        program.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Program updated successfully',
            'program': program.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@profile_page_bp.route('/academy/<uuid:page_id>/programs/<int:program_id>', methods=['DELETE'])
def delete_academy_program(page_id, program_id):
    """
    Delete an academy program
    ---
    tags:
      - Academy Programs
    parameters:
      - in: path
        name: page_id
        type: string
        format: uuid
        required: true
        description: Academy profile page ID
      - in: path
        name: program_id
        type: integer
        required: true
        description: Program ID
    responses:
      200:
        description: Program deleted successfully
      403:
        description: Forbidden - not the academy owner
      404:
        description: Program not found
    """
    try:
        current_user_id = 1  # Using test user ID
        
        # Check if academy profile exists and user owns it
        academy_profile = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        if not academy_profile:
            return jsonify({'error': 'Academy profile not found'}), 404
        
        if academy_profile.user_id != current_user_id:
            return jsonify({'error': 'Forbidden - not the academy owner'}), 403
        
        # Get the program
        program = AcademyProgram.query.filter_by(
            id=program_id, 
            academy_profile_id=academy_profile.id
        ).first()
        if not program:
            return jsonify({'error': 'Program not found'}), 404
        
        # Soft delete by setting is_active to False
        program.is_active = False
        program.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Program deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Academy Students API Endpoints

@profile_page_bp.route('/academy/<uuid:page_id>/students', methods=['POST'])
def add_academy_student(page_id):
    """
    Add a student to an academy
    ---
    tags:
      - Academy Students
    parameters:
      - in: path
        name: page_id
        type: string
        format: uuid
        required: true
        description: Academy profile page ID
      - in: body
        name: student_data
        description: Student data
        required: true
        schema:
          type: object
          properties:
            student_name:
              type: string
              example: "Rahul Sharma"
            age:
              type: integer
              example: 15
            level:
              type: string
              example: "intermediate"
            enrollment_date:
              type: string
              format: date
              example: "2024-01-15"
            is_active:
              type: boolean
              example: true
    responses:
      201:
        description: Student added successfully
      400:
        description: Bad request
      404:
        description: Academy profile not found
      403:
        description: Forbidden - not the academy owner
    """
    try:
        current_user_id = 1  # Using test user ID
        
        # Check if academy profile exists
        academy_profile = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        if not academy_profile:
            return jsonify({'error': 'Academy profile not found'}), 404
        
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

@profile_page_bp.route('/academy/<uuid:page_id>/students', methods=['GET'])
def get_academy_students(page_id):
    """
    Get all students for an academy
    ---
    tags:
      - Academy Students
    parameters:
      - in: path
        name: page_id
        type: string
        format: uuid
        required: true
        description: Academy profile page ID
      - in: query
        name: is_active
        type: boolean
        description: Filter by active status
      - in: query
        name: level
        type: string
        description: Filter by student level
    responses:
      200:
        description: Students retrieved successfully
      404:
        description: Academy profile not found
    """
    try:
        # Check if academy profile exists
        academy_profile = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        if not academy_profile:
            return jsonify({'error': 'Academy profile not found'}), 404
        
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

@profile_page_bp.route('/academy/<uuid:page_id>/students/<int:student_id>', methods=['PATCH'])
def update_academy_student(page_id, student_id):
    """
    Update an academy student
    ---
    tags:
      - Academy Students
    parameters:
      - in: path
        name: page_id
        type: string
        format: uuid
        required: true
        description: Academy profile page ID
      - in: path
        name: student_id
        type: integer
        required: true
        description: Student ID
      - in: body
        name: student_data
        description: Updated student data
        required: true
        schema:
          type: object
          properties:
            student_name:
              type: string
            age:
              type: integer
            level:
              type: string
            enrollment_date:
              type: string
              format: date
            is_active:
              type: boolean
    responses:
      200:
        description: Student updated successfully
      400:
        description: Bad request
      403:
        description: Forbidden - not the academy owner
      404:
        description: Student not found
    """
    try:
        current_user_id = 1  # Using test user ID
        
        # Check if academy profile exists and user owns it
        academy_profile = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        if not academy_profile:
            return jsonify({'error': 'Academy profile not found'}), 404
        
        if academy_profile.user_id != current_user_id:
            return jsonify({'error': 'Forbidden - not the academy owner'}), 403
        
        # Get the student
        student = AcademyStudent.query.filter_by(
            id=student_id, 
            academy_profile_id=academy_profile.id
        ).first()
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        data = request.get_json()
        
        # Handle enrollment_date if provided
        if 'enrollment_date' in data and data['enrollment_date']:
            try:
                data['enrollment_date'] = datetime.strptime(data['enrollment_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid enrollment_date format. Use YYYY-MM-DD'}), 400
        
        # Update fields
        for field, value in data.items():
            if hasattr(student, field):
                setattr(student, field, value)
        
        student.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Student updated successfully',
            'student': student.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@profile_page_bp.route('/academy/<uuid:page_id>/students/<int:student_id>', methods=['DELETE'])
def remove_academy_student(page_id, student_id):
    """
    Remove a student from an academy
    ---
    tags:
      - Academy Students
    parameters:
      - in: path
        name: page_id
        type: string
        format: uuid
        required: true
        description: Academy profile page ID
      - in: path
        name: student_id
        type: integer
        required: true
        description: Student ID
    responses:
      200:
        description: Student removed successfully
      403:
        description: Forbidden - not the academy owner
      404:
        description: Student not found
    """
    try:
        current_user_id = 1  # Using test user ID
        
        # Check if academy profile exists and user owns it
        academy_profile = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        if not academy_profile:
            return jsonify({'error': 'Academy profile not found'}), 404
        
        if academy_profile.user_id != current_user_id:
            return jsonify({'error': 'Forbidden - not the academy owner'}), 403
        
        # Get the student
        student = AcademyStudent.query.filter_by(
            id=student_id, 
            academy_profile_id=academy_profile.id
        ).first()
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        # Soft delete by setting is_active to False
        student.is_active = False
        student.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Student removed successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Academy Statistics API

@profile_page_bp.route('/academy/<uuid:page_id>/stats', methods=['GET'])
def get_academy_stats(page_id):
    """
    Get academy statistics
    ---
    tags:
      - Academy Statistics
    parameters:
      - in: path
        name: page_id
        type: string
        format: uuid
        required: true
        description: Academy profile page ID
    responses:
      200:
        description: Academy statistics retrieved successfully
      404:
        description: Academy profile not found
    """
    try:
        # Check if academy profile exists
        academy_profile = ProfilePage.query.filter_by(page_id=page_id, deleted_at=None).first()
        if not academy_profile:
            return jsonify({'error': 'Academy profile not found'}), 404
        
        # Get statistics
        total_programs = AcademyProgram.query.filter_by(academy_profile_id=academy_profile.id).count()
        active_programs = AcademyProgram.query.filter_by(academy_profile_id=academy_profile.id, is_active=True).count()
        
        total_students = AcademyStudent.query.filter_by(academy_profile_id=academy_profile.id).count()
        active_students = AcademyStudent.query.filter_by(academy_profile_id=academy_profile.id, is_active=True).count()
        
        # Get students by level
        students_by_level = db.session.query(
            AcademyStudent.level, 
            db.func.count(AcademyStudent.id)
        ).filter_by(
            academy_profile_id=academy_profile.id, 
            is_active=True
        ).group_by(AcademyStudent.level).all()
        
        level_distribution = {level: count for level, count in students_by_level}
        
        return jsonify({
            'academy_profile': academy_profile.to_dict(),
            'statistics': {
                'total_programs': total_programs,
                'active_programs': active_programs,
                'total_students': total_students,
                'active_students': active_students,
                'students_by_level': level_distribution
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
