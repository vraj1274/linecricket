from flask import Blueprint, request, jsonify
from models import db, ProfilePage, User
from datetime import datetime
import json
import uuid
import logging
from utils.firebase_auth import get_user_id_from_token
from utils.api_response import APIResponse, ValidationHelper

profiles_bp = Blueprint('profiles', __name__)

@profiles_bp.route('/profiles', methods=['POST'])
def create_profile():
    """
    Create a new profile (Academy, Venue, or Community)
    """
    try:
        data = request.get_json()
        
        # Get page type from data and convert to enum
        page_type_str = data.get('page_type', 'Academy')
        if page_type_str.upper() == 'ACADEMY':
            page_type = 'Academy'
        elif page_type_str.upper() == 'VENUE PROVIDER' or page_type_str.upper() == 'VENUE':
            page_type = 'Venue'
        elif page_type_str.upper() == 'COMMUNITY':
            page_type = 'Community'
        else:
            page_type = page_type_str
        
        # Validate required fields based on page type
        if page_type == 'Academy':
            required_fields = ['academy_name', 'academy_type', 'level']
            name_field = 'academy_name'
        elif page_type == 'Venue':
            required_fields = ['venue_name', 'venue_type', 'ground_type']
            name_field = 'venue_name'
        elif page_type == 'Community':
            required_fields = ['community_name', 'community_type']
            name_field = 'community_name'
        else:
            return jsonify({'error': 'Invalid page type'}), 400
        
        # Check for required fields
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Prevent creation of obvious test pages only
        page_name = data.get(name_field, '').lower()
        test_patterns = ['test_academy', 'sample_venue', 'demo_community', 'test_page', 'sample_page']
        if any(pattern in page_name for pattern in test_patterns):
            return jsonify({'error': 'Cannot create pages with test names'}), 400
        
        # Get user ID (for now using a default UUID, should be from authentication)
        # In a real app, this would come from JWT token or session
        existing_user = User.query.first()
        if existing_user:
            current_user_id = existing_user.id
        else:
            # Create a test user
            test_user = User(
                email="test@example.com",
                username="testuser",
                is_verified=True,
                is_active=True,
                auth_provider="test"
            )
            db.session.add(test_user)
            db.session.commit()
            current_user_id = test_user.id
        
        # Create profile page with type-specific fields
        profile_page = ProfilePage(
                user_id=current_user_id,
                firebase_uid=data.get('firebase_uid'),
                academy_name=data.get(name_field, ''),
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
            # Type-specific fields
            academy_type=data.get('academy_type', 'Private' if page_type == 'Academy' else None),
            level=data.get('level', 'Beginner' if page_type == 'Academy' else None),
            # Venue-specific fields
            venue_type=data.get('venue_type') if page_type == 'Venue' else None,
            ground_type=data.get('ground_type') if page_type == 'Venue' else None,
            # Community-specific fields
            community_type=data.get('community_type') if page_type == 'Community' else None,
                established_year=data.get('established_year'),
                accreditation=data.get('accreditation'),
            coaching_staff_count=data.get('coaching_staff_count', 0),
            total_students=data.get('total_students', 0),
            successful_placements=data.get('successful_placements', 0),
            equipment_provided=data.get('equipment_provided', False),
            programs_offered=json.dumps(data.get('programs_offered', [])),
            age_groups=data.get('age_groups'),
            batch_timings=json.dumps(data.get('batch_timings', [])),
            fees_structure=json.dumps(data.get('fees_structure', {})),
            logo_url=data.get('logo_url'),
            banner_image_url=data.get('banner_image_url'),
            gallery_images=json.dumps(data.get('gallery_images', [])),
            facilities=json.dumps(data.get('facilities', [])),
            services_offered=json.dumps(data.get('services_offered', [])),
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
                page_type=page_type,
                created_at=datetime.utcnow()
            )
        
        # Add to database
        db.session.add(profile_page)
        db.session.commit()
        
        # Return success response
        return jsonify({
            'success': True,
            'message': f'{page_type} profile created successfully',
            'profile': {
                'id': str(profile_page.page_id),
                'name': data[name_field],
                'type': page_type.lower(),
                'created_at': profile_page.created_at.isoformat(),
                'profile_type': page_type.lower()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@profiles_bp.route('/profiles', methods=['GET'])
def get_profiles():
    """
    Get all profiles for the current user
    """
    try:
        # Get user ID (for now using a default UUID, should be from authentication)
        existing_user = User.query.first()
        if not existing_user:
            return jsonify({'profiles': []}), 200
        
        current_user_id = existing_user.id
        
        # Get all profiles for the user, excluding test pages
        profiles = ProfilePage.query.filter_by(user_id=current_user_id).filter(
            ~ProfilePage.academy_name.like('%Test%'),
            ~ProfilePage.academy_name.like('%Updated%'),
            ~ProfilePage.academy_name.like('%hhh%')
        ).all()
        
        profiles_data = []
        for profile in profiles:
            profiles_data.append({
                'id': str(profile.page_id),
                'name': profile.academy_name,
                'type': profile.page_type.lower(),
                'description': profile.description,
                'city': profile.city,
                'state': profile.state,
                'is_public': profile.is_public,
                'is_verified': profile.is_verified,
                'created_at': profile.created_at.isoformat()
            })
        
        return jsonify({
            'profiles': profiles_data,
            'total': len(profiles_data)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@profiles_bp.route('/profiles/switch', methods=['POST'])
def switch_profile():
    """
    Switch to a different profile
    """
    try:
        data = request.get_json()
        email = data.get('email')
        profile_id = data.get('profile_id')
        profile_type = data.get('profile_type')
        
        if not email or not profile_id or not profile_type:
            return jsonify({
                'success': False,
                'error': 'Missing required fields: email, profile_id, profile_type'
            }), 400
        
        # For now, just return success since we don't have user session management
        # In a real app, this would update the user's active profile in the database
        return jsonify({
            'success': True,
            'message': f'Successfully switched to {profile_type} profile',
            'active_profile': {
                'id': profile_id,
                'type': profile_type,
                'email': email
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@profiles_bp.route('/profiles/<profile_id>/posts', methods=['GET'])
def get_profile_posts(profile_id):
    """
    Get posts for a specific profile
    """
    try:
        # For now, return empty posts array
        # In a real implementation, this would query posts related to the profile
        return jsonify({
            'success': True,
            'posts': []
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@profiles_bp.route('/profiles/<profile_id>/jobs', methods=['GET'])
def get_profile_jobs(profile_id):
    """
    Get jobs for a specific profile
    """
    try:
        # For now, return empty jobs array
        # In a real implementation, this would query jobs related to the profile
        return jsonify({
            'success': True,
            'jobs': []
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@profiles_bp.route('/profiles/<profile_id>/members', methods=['GET'])
def get_profile_members(profile_id):
    """
    Get members for a specific profile
    """
    try:
        # For now, return empty members array
        # In a real implementation, this would query members related to the profile
        return jsonify({
            'success': True,
            'members': []
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@profiles_bp.route('/profiles/<profile_id>', methods=['GET'])
def get_profile(profile_id):
    """
    Get a specific profile by ID
    """
    try:
        profile = ProfilePage.query.filter_by(page_id=profile_id).first()
        if not profile:
            return jsonify({'error': 'Profile not found'}), 404
        
        return jsonify({
            'success': True,
            'profile': profile.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@profiles_bp.route('/profiles/<profile_id>', methods=['PUT'])
def update_profile(profile_id):
    """
    Update a specific profile
    """
    try:
        profile = ProfilePage.query.filter_by(page_id=profile_id).first()
        if not profile:
            return jsonify({'error': 'Profile not found'}), 404
        
        data = request.get_json()
        
        # Update profile fields
        if 'academy_name' in data:
            profile.academy_name = data['academy_name']
        if 'tagline' in data:
            profile.tagline = data['tagline']
        if 'description' in data:
            profile.description = data['description']
        if 'bio' in data:
            profile.bio = data['bio']
        if 'contact_person' in data:
            profile.contact_person = data['contact_person']
        if 'contact_number' in data:
            profile.contact_number = data['contact_number']
        if 'email' in data:
            profile.email = data['email']
        if 'website' in data:
            profile.website = data['website']
        if 'address' in data:
            profile.address = data['address']
        if 'city' in data:
            profile.city = data['city']
        if 'state' in data:
            profile.state = data['state']
        if 'country' in data:
            profile.country = data['country']
        if 'pincode' in data:
            profile.pincode = data['pincode']
        if 'latitude' in data:
            profile.latitude = data['latitude']
        if 'longitude' in data:
            profile.longitude = data['longitude']
        if 'academy_type' in data:
            profile.academy_type = data['academy_type']
        if 'level' in data:
            profile.level = data['level']
        if 'established_year' in data:
            profile.established_year = data['established_year']
        if 'accreditation' in data:
            profile.accreditation = data['accreditation']
        if 'coaching_staff_count' in data:
            profile.coaching_staff_count = data['coaching_staff_count']
        if 'total_students' in data:
            profile.total_students = data['total_students']
        if 'successful_placements' in data:
            profile.successful_placements = data['successful_placements']
        if 'equipment_provided' in data:
            profile.equipment_provided = data['equipment_provided']
        if 'programs_offered' in data:
            profile.programs_offered = json.dumps(data['programs_offered'])
        if 'age_groups' in data:
            profile.age_groups = data['age_groups']
        if 'batch_timings' in data:
            profile.batch_timings = json.dumps(data['batch_timings'])
        if 'fees_structure' in data:
            profile.fees_structure = json.dumps(data['fees_structure'])
        if 'logo_url' in data:
            profile.logo_url = data['logo_url']
        if 'banner_image_url' in data:
            profile.banner_image_url = data['banner_image_url']
        if 'gallery_images' in data:
            profile.gallery_images = json.dumps(data['gallery_images'])
        if 'facilities' in data:
            profile.facilities = json.dumps(data['facilities'])
        if 'services_offered' in data:
            profile.services_offered = json.dumps(data['services_offered'])
        if 'instagram_handle' in data:
            profile.instagram_handle = data['instagram_handle']
        if 'facebook_handle' in data:
            profile.facebook_handle = data['facebook_handle']
        if 'twitter_handle' in data:
            profile.twitter_handle = data['twitter_handle']
        if 'youtube_handle' in data:
            profile.youtube_handle = data['youtube_handle']
        if 'achievements' in data:
            profile.achievements = json.dumps(data['achievements'])
        if 'testimonials' in data:
            profile.testimonials = json.dumps(data['testimonials'])
        if 'is_public' in data:
            profile.is_public = data['is_public']
        if 'allow_messages' in data:
            profile.allow_messages = data['allow_messages']
        if 'show_contact' in data:
            profile.show_contact = data['show_contact']
        if 'is_verified' in data:
            profile.is_verified = data['is_verified']
        
        profile.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully',
            'profile': profile.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@profiles_bp.route('/profiles/<profile_id>', methods=['DELETE'])
def delete_profile(profile_id):
    """
    Delete a specific profile with comprehensive error handling and validation
    """
    import logging
    from utils.firebase_auth import get_user_id_from_token
    
    logger = logging.getLogger(__name__)
    
    try:
        # Log the deletion attempt
        logger.info(f"🗑️ Profile deletion attempt: {profile_id}")
        
        # Validate profile_id format
        if not profile_id or len(profile_id.strip()) == 0:
            logger.warning("❌ Empty profile ID provided")
            return APIResponse.error(
                message='Invalid profile ID provided',
                status_code=400,
                error_type='ValidationError'
            )
        
        # Handle both regular profile_id and page_ prefixed IDs
        original_profile_id = profile_id
        if profile_id.startswith('page_'):
            profile_id = profile_id[5:]  # Remove 'page_' prefix
            logger.info(f"🔄 Removed 'page_' prefix: {original_profile_id} -> {profile_id}")
        
        # Validate UUID format
        is_valid_uuid, uuid_error = ValidationHelper.validate_uuid(profile_id, "Profile ID")
        if not is_valid_uuid:
            logger.warning(f"❌ Invalid UUID format: {profile_id}")
            return APIResponse.error(
                message=uuid_error,
                status_code=400,
                error_type='ValidationError'
            )
        
        # Authentication check (optional - can be enabled for production)
        current_user_id = None
        try:
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                current_user_id = get_user_id_from_token(token)
                if current_user_id:
                    logger.info(f"✅ Authenticated user: {current_user_id}")
                else:
                    logger.warning("❌ Invalid authentication token")
        except Exception as auth_error:
            logger.warning(f"⚠️ Authentication check failed: {auth_error}")
            # Continue without authentication for now
        
        # Find the profile
        logger.info(f"🔍 Searching for profile: {profile_id}")
        profile = ProfilePage.query.filter_by(page_id=profile_id).first()
        
        if not profile:
            logger.warning(f"❌ Profile not found: {profile_id}")
            return APIResponse.not_found("Profile", original_profile_id)
        
        # Log profile details before deletion
        logger.info(f"📋 Profile found: {profile.academy_name} (Type: {profile.page_type})")
        
        # Optional: Check if user owns this profile (if authentication is enabled)
        if current_user_id and profile.user_id != current_user_id:
            logger.warning(f"❌ User {current_user_id} attempted to delete profile owned by {profile.user_id}")
            return APIResponse.forbidden("You do not have permission to delete this profile")
        
        # Store profile info for logging
        profile_name = profile.academy_name
        profile_type = profile.page_type
        profile_owner = profile.user_id
        
        # Delete the profile
        logger.info(f"🗑️ Deleting profile: {profile_name}")
        db.session.delete(profile)
        
        # Commit the transaction
        db.session.commit()
        logger.info(f"✅ Profile deleted successfully: {profile_name}")
        
        # Return success response
        return APIResponse.success(
            data={
                'deleted_profile': {
                    'id': original_profile_id,
                    'name': profile_name,
                    'type': profile_type,
                    'owner': str(profile_owner)
                }
            },
            message=f'Profile "{profile_name}" deleted successfully'
        )
        
    except Exception as e:
        # Rollback the transaction
        db.session.rollback()
        logger.error(f"❌ Profile deletion failed: {str(e)}")
        logger.error(f"❌ Error type: {type(e).__name__}")
        
        # Return detailed error information
        return APIResponse.server_error(
            message='Failed to delete profile',
            details=str(e)
        )

@profiles_bp.route('/profiles/<profile_id>/validate', methods=['GET'])
def validate_profile_for_deletion(profile_id):
    """
    Validate if a profile exists and can be deleted
    """
    logger = logging.getLogger(__name__)
    
    try:
        # Log the validation attempt
        logger.info(f"🔍 Profile validation attempt: {profile_id}")
        
        # Validate profile_id format
        if not profile_id or len(profile_id.strip()) == 0:
            return jsonify({
                'success': False,
                'error': 'Invalid profile ID provided',
                'can_delete': False
            }), 400
        
        # Handle both regular profile_id and page_ prefixed IDs
        original_profile_id = profile_id
        if profile_id.startswith('page_'):
            profile_id = profile_id[5:]  # Remove 'page_' prefix
        
        # Validate UUID format
        try:
            uuid.UUID(profile_id)
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'Invalid profile ID format',
                'can_delete': False
            }), 400
        
        # Find the profile
        profile = ProfilePage.query.filter_by(page_id=profile_id).first()
        
        if not profile:
            return jsonify({
                'success': True,
                'exists': False,
                'can_delete': False,
                'message': 'Profile not found'
            }), 200
        
        # Check if profile is already soft-deleted
        if hasattr(profile, 'deleted_at') and profile.deleted_at:
            return jsonify({
                'success': True,
                'exists': True,
                'can_delete': False,
                'message': 'Profile is already deleted',
                'deleted_at': profile.deleted_at.isoformat()
            }), 200
        
        # Return validation success
        return jsonify({
            'success': True,
            'exists': True,
            'can_delete': True,
            'profile': {
                'id': original_profile_id,
                'name': profile.academy_name,
                'type': profile.page_type,
                'owner': str(profile.user_id),
                'created_at': profile.created_at.isoformat()
            }
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Profile validation failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Validation failed',
            'details': str(e),
            'can_delete': False
        }), 500

@profiles_bp.route('/profiles/<profile_id>/soft-delete', methods=['DELETE'])
def soft_delete_profile(profile_id):
    """
    Soft delete a profile (mark as deleted instead of removing from database)
    """
    logger = logging.getLogger(__name__)
    
    try:
        # Log the soft deletion attempt
        logger.info(f"🗑️ Profile soft deletion attempt: {profile_id}")
        
        # Validate profile_id format
        if not profile_id or len(profile_id.strip()) == 0:
            return jsonify({
                'success': False,
                'error': 'Invalid profile ID provided'
            }), 400
        
        # Handle both regular profile_id and page_ prefixed IDs
        original_profile_id = profile_id
        if profile_id.startswith('page_'):
            profile_id = profile_id[5:]  # Remove 'page_' prefix
        
        # Validate UUID format
        try:
            uuid.UUID(profile_id)
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'Invalid profile ID format'
            }), 400
        
        # Find the profile
        profile = ProfilePage.query.filter_by(page_id=profile_id).first()
        
        if not profile:
            return jsonify({
                'success': False,
                'error': 'Profile not found'
            }), 404
        
        # Check if already soft-deleted
        if hasattr(profile, 'deleted_at') and profile.deleted_at:
            return jsonify({
                'success': True,
                'message': 'Profile is already soft-deleted',
                'deleted_at': profile.deleted_at.isoformat()
            }), 200
        
        # Soft delete the profile
        profile.deleted_at = datetime.utcnow()
        profile.is_public = False  # Hide from public view
        
        db.session.commit()
        
        logger.info(f"✅ Profile soft-deleted successfully: {profile.academy_name}")
        
        return jsonify({
            'success': True,
            'message': f'Profile "{profile.academy_name}" soft-deleted successfully',
            'deleted_at': profile.deleted_at.isoformat()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Profile soft deletion failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to soft-delete profile',
            'details': str(e)
        }), 500
