from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, UserProfile, UserStats, UserExperience, UserAchievement, db
import logging

logger = logging.getLogger(__name__)

users_bp = Blueprint('users', __name__)

@users_bp.route('/test', methods=['GET'])
def test_endpoint():
    """Test endpoint to verify backend is working"""
    return jsonify({'message': 'Backend is working!', 'status': 'success'}), 200

@users_bp.route('/profile', methods=['GET'])
def get_current_user_profile():
    """Get current user's profile with Firebase authentication"""
    try:
        # For testing purposes, get the first user directly
        user = User.query.first()
        print(f"Getting profile for test user: {user.username if user else 'None'}")
        
        if not user:
            return jsonify({'error': 'No users found in database'}), 404
        
        # Get user profile with all related data
        profile_data = user.to_dict()
        
        # Add additional fields from User table
        profile_data.update({
            'contact_number': user.profile.contact_number if user.profile else None,
            'location': user.profile.location if user.profile else None,
            'age': user.profile.age if user.profile else None,
            'gender': user.profile.gender if user.profile else None,
        })
        
        # Add profile data if exists
        if user.profile:
            profile_data['profile'] = {
                'id': user.profile.id,
                'full_name': user.profile.full_name,
                'bio': user.profile.bio,
                'location': user.profile.location,
                'organization': user.profile.organization,
                'age': user.profile.age,
                'gender': user.profile.gender,
                'contact_number': user.profile.contact_number,
                'profile_image_url': user.profile.profile_image_url,
                'batting_skill': user.profile.batting_skill,
                'bowling_skill': user.profile.bowling_skill,
                'fielding_skill': user.profile.fielding_skill,
                'created_at': user.profile.created_at.isoformat() if user.profile.created_at else None,
                'updated_at': user.profile.updated_at.isoformat() if user.profile.updated_at else None,
            }
            
            # Add stats data if exists
            if user.profile.stats:
                profile_data['profile']['stats'] = {
                    'id': user.profile.stats.id,
                    'total_runs': user.profile.stats.total_runs,
                    'total_wickets': user.profile.stats.total_wickets,
                    'total_matches': user.profile.stats.total_matches,
                    'batting_average': user.profile.stats.batting_average,
                    'batting_strike_rate': user.profile.stats.batting_strike_rate,
                    'highest_score': user.profile.stats.highest_score,
                    'centuries': user.profile.stats.centuries,
                    'half_centuries': user.profile.stats.half_centuries,
                    'bowling_average': user.profile.stats.bowling_average,
                    'bowling_economy': user.profile.stats.bowling_economy,
                    'best_bowling_figures': user.profile.stats.best_bowling_figures,
                    'catches': user.profile.stats.catches,
                    'stumpings': user.profile.stats.stumpings,
                    'run_outs': user.profile.stats.run_outs,
                    'test_matches': user.profile.stats.test_matches,
                    'odi_matches': user.profile.stats.odi_matches,
                    't20_matches': user.profile.stats.t20_matches,
                    'test_runs': user.profile.stats.test_runs,
                    'odi_runs': user.profile.stats.odi_runs,
                    't20_runs': user.profile.stats.t20_runs,
                    'test_wickets': user.profile.stats.test_wickets,
                    'odi_wickets': user.profile.stats.odi_wickets,
                    't20_wickets': user.profile.stats.t20_wickets,
                }
            
            # Add experiences data
            experiences = UserExperience.query.filter_by(profile_id=user.profile.id).all()
            profile_data['profile']['experiences'] = [
                {
                    'id': exp.id,
                    'title': exp.title,
                    'role': exp.role,
                    'duration': exp.duration,
                    'description': exp.description,
                    'created_at': exp.created_at.isoformat() if exp.created_at else None,
                }
                for exp in experiences
            ]
            
            # Add achievements data
            achievements = UserAchievement.query.filter_by(profile_id=user.profile.id).all()
            profile_data['profile']['achievements'] = [
                {
                    'id': ach.id,
                    'title': ach.title,
                    'description': ach.description,
                    'year': ach.year,
                    'created_at': ach.created_at.isoformat() if ach.created_at else None,
                }
                for ach in achievements
            ]
        
        return jsonify({
            'user': profile_data
        }), 200
        
    except Exception as e:
        logger.error(f"Get profile error: {e}")
        return jsonify({'error': 'Failed to fetch profile'}), 500

@users_bp.route('/profile', methods=['PUT'])
def update_user_profile():
    """Update current user's profile with Firebase authentication"""
    try:
        # For testing purposes, get the first user directly
        user = User.query.first()
        print(f"Using test user: {user.username if user else 'None'}")
        
        if not user:
            return jsonify({'error': 'No users found in database'}), 404
        
        data = request.get_json()
        
        # Update user basic info
        if data.get('username') and data['username'] != user.username:
            # Check if username is taken
            existing_user = User.query.filter_by(username=data['username']).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({'error': 'Username already taken'}), 400
            user.username = data['username']
        
        # Update additional user fields from EditProfilePage
        if data.get('contact_number'):
            user.contact_number = data['contact_number']
        if data.get('location'):
            user.location = data['location']
        if data.get('age'):
            user.age = data['age']
        if data.get('gender'):
            user.gender = data['gender']
        
        # Update or create profile
        if not user.profile:
            profile = UserProfile(
                user_id=user.id,
                full_name=data.get('full_name', user.username)  # Use full_name from data or fallback to username
            )
            profile.save()
            user.profile = profile
            # Commit the user-profile relationship
            db.session.commit()
        
        profile = user.profile
        
        # Update basic profile info
        if data.get('full_name'):
            profile.full_name = data['full_name']
        elif not profile.full_name:  # If no full_name provided and profile doesn't have one
            profile.full_name = user.username  # Use username as fallback
        if data.get('bio'):
            profile.bio = data['bio']
        if data.get('location'):
            profile.location = data['location']
        if data.get('organization'):
            profile.organization = data['organization']
        if data.get('age'):
            profile.age = data['age']
        if data.get('gender'):
            profile.gender = data['gender']
        if data.get('contact_number'):
            profile.contact_number = data['contact_number']
        if data.get('profile_image_url'):
            profile.profile_image_url = data['profile_image_url']
        
        # Update cricket skills
        if data.get('batting_skill') is not None:
            profile.batting_skill = data['batting_skill']
        if data.get('bowling_skill') is not None:
            profile.bowling_skill = data['bowling_skill']
        if data.get('fielding_skill') is not None:
            profile.fielding_skill = data['fielding_skill']
        
        profile.save()
        # Ensure profile is committed to database before creating stats
        db.session.commit()
        
        # Update or create stats - only if profile exists and is committed
        if not profile.stats and profile.id:
            try:
                stats = UserStats(profile_id=profile.id)
                stats.save()
                profile.stats = stats
                # Commit the profile-stats relationship
                db.session.commit()
            except Exception as e:
                print(f"Error creating stats: {e}")
                # Don't fail the entire operation if stats creation fails
        
        stats = profile.stats
        
        # Update basic stats
        if data.get('total_runs') is not None:
            stats.total_runs = data['total_runs']
        if data.get('total_wickets') is not None:
            stats.total_wickets = data['total_wickets']
        if data.get('total_matches') is not None:
            stats.total_matches = data['total_matches']
        if data.get('total_awards') is not None:
            stats.total_awards = data['total_awards']
        
        # Update batting stats
        if data.get('batting_average') is not None:
            stats.batting_average = data['batting_average']
        if data.get('batting_strike_rate') is not None:
            stats.batting_strike_rate = data['batting_strike_rate']
        if data.get('highest_score') is not None:
            stats.highest_score = data['highest_score']
        if data.get('centuries') is not None:
            stats.centuries = data['centuries']
        if data.get('half_centuries') is not None:
            stats.half_centuries = data['half_centuries']
        if data.get('fours') is not None:
            stats.fours = data['fours']
        if data.get('sixes') is not None:
            stats.sixes = data['sixes']
        if data.get('balls_faced') is not None:
            stats.balls_faced = data['balls_faced']
        
        # Update bowling stats
        if data.get('bowling_average') is not None:
            stats.bowling_average = data['bowling_average']
        if data.get('bowling_economy') is not None:
            stats.bowling_economy = data['bowling_economy']
        if data.get('bowling_strike_rate') is not None:
            stats.bowling_strike_rate = data['bowling_strike_rate']
        if data.get('best_bowling_figures'):
            stats.best_bowling_figures = data['best_bowling_figures']
        if data.get('five_wicket_hauls') is not None:
            stats.five_wicket_hauls = data['five_wicket_hauls']
        if data.get('four_wicket_hauls') is not None:
            stats.four_wicket_hauls = data['four_wicket_hauls']
        if data.get('maidens') is not None:
            stats.maidens = data['maidens']
        if data.get('runs_conceded') is not None:
            stats.runs_conceded = data['runs_conceded']
        if data.get('balls_bowled') is not None:
            stats.balls_bowled = data['balls_bowled']
        
        # Update fielding stats
        if data.get('catches') is not None:
            stats.catches = data['catches']
        if data.get('stumpings') is not None:
            stats.stumpings = data['stumpings']
        if data.get('run_outs') is not None:
            stats.run_outs = data['run_outs']
        
        # Update format-wise stats
        if data.get('test_matches') is not None:
            stats.test_matches = data['test_matches']
        if data.get('odi_matches') is not None:
            stats.odi_matches = data['odi_matches']
        if data.get('t20_matches') is not None:
            stats.t20_matches = data['t20_matches']
        if data.get('test_runs') is not None:
            stats.test_runs = data['test_runs']
        if data.get('odi_runs') is not None:
            stats.odi_runs = data['odi_runs']
        if data.get('t20_runs') is not None:
            stats.t20_runs = data['t20_runs']
        if data.get('test_wickets') is not None:
            stats.test_wickets = data['test_wickets']
        if data.get('odi_wickets') is not None:
            stats.odi_wickets = data['odi_wickets']
        if data.get('t20_wickets') is not None:
            stats.t20_wickets = data['t20_wickets']
        
        stats.save()
        
        # Handle experiences data
        if data.get('experiences'):
            # Clear existing experiences
            UserExperience.query.filter_by(profile_id=profile.id).delete()
            
            # Add new experiences
            for exp_data in data['experiences']:
                if exp_data.get('title') and exp_data.get('role') and exp_data.get('duration'):
                    experience = UserExperience(
                        profile_id=profile.id,
                        title=exp_data['title'],
                        role=exp_data['role'],
                        duration=exp_data['duration'],
                        description=exp_data.get('description', '')
                    )
                    experience.save()
        
        # Handle achievements data
        if data.get('achievements'):
            # Clear existing achievements
            UserAchievement.query.filter_by(profile_id=profile.id).delete()
            
            # Add new achievements
            for ach_data in data['achievements']:
                if ach_data.get('title') and ach_data.get('year'):
                    achievement = UserAchievement(
                        profile_id=profile.id,
                        title=ach_data['title'],
                        description=ach_data.get('description', ''),
                        year=ach_data['year']
                    )
                    achievement.save()
        
        # Final commit to save all changes to database
        db.session.commit()
        
        # Refresh the user object to get the latest data
        db.session.refresh(user)
        db.session.refresh(profile)
        db.session.refresh(stats)
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Update profile error: {e}")
        return jsonify({'error': 'Failed to update profile'}), 500

@users_bp.route('/profile/photo', methods=['POST'])
def upload_profile_photo():
    """Upload profile photo with Firebase authentication"""
    try:
        # Get JWT token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization header required'}), 401
        
        jwt_token = auth_header.split(' ')[1]
        
        # Verify Firebase ID token and get user
        from services.firebase_auth import firebase_service
        is_valid, decoded_token = firebase_service.verify_id_token(jwt_token)
        if not is_valid:
            return jsonify({'error': 'Invalid token'}), 401
        
        firebase_uid = decoded_token.get('uid')
        user = User.query.filter_by(firebase_uid=firebase_uid).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if file is present
        if 'photo' not in request.files:
            return jsonify({'error': 'No photo file provided'}), 400
        
        file = request.files['photo']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file
        from utils.helpers import validate_image_file
        is_valid_file, error_message = validate_image_file(file)
        if not is_valid_file:
            return jsonify({'error': error_message}), 400
        
        # Create or get user profile
        if not user.profile:
            profile = UserProfile(user_id=user.id, full_name=user.email.split('@')[0])
            profile.save()
            user.profile = profile
        
        # Generate unique filename
        import uuid
        import os
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{user.id}_{uuid.uuid4().hex}{file_extension}"
        
        # Create uploads directory if it doesn't exist
        upload_dir = os.path.join(os.getcwd(), 'uploads', 'profile_photos')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save file
        file_path = os.path.join(upload_dir, unique_filename)
        file.save(file_path)
        
        # Update profile with image URL
        profile = user.profile
        profile.profile_image_url = f"/uploads/profile_photos/{unique_filename}"
        profile.save()
        
        return jsonify({
            'message': 'Profile photo uploaded successfully',
            'profile_image_url': profile.profile_image_url
        }), 200
        
    except Exception as e:
        logger.error(f"Upload profile photo error: {e}")
        return jsonify({'error': 'Failed to upload profile photo'}), 500

@users_bp.route('/profile/experiences', methods=['GET'])
def get_experiences():
    """Get user's experiences"""
    try:
        # Get the first user for testing (since we're using test data)
        user = User.query.first()
        
        if not user or not user.profile:
            return jsonify({'experiences': []}), 200
        
        experiences = UserExperience.query.filter_by(profile_id=user.profile.id).all()
        
        return jsonify({
            'experiences': [exp.to_dict() for exp in experiences]
        }), 200
        
    except Exception as e:
        logger.error(f"Get experiences error: {e}")
        return jsonify({'error': 'Failed to fetch experiences'}), 500

@users_bp.route('/profile/experiences', methods=['POST'])
# @jwt_required()
def add_experience():
    """Add experience to user profile"""
    try:
        # Get the first user for testing (since we're using test data)
        user = User.query.first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Create profile if it doesn't exist
        if not user.profile:
            profile = UserProfile(
                user_id=user.id,
                full_name=user.username
            )
            profile.save()
            db.session.commit()  # Commit profile first
            user.profile = profile
            db.session.commit()  # Then commit the relationship
            print(f"Created profile with ID: {profile.id}")
        else:
            print(f"Using existing profile with ID: {user.profile.id}")
        
        data = request.get_json()
        
        if not all(data.get(field) for field in ['title', 'role', 'duration']):
            return jsonify({'error': 'Title, role, and duration are required'}), 400
        
        print(f"Creating experience with profile_id: {user.profile.id}")
        experience = UserExperience(
            profile_id=user.profile.id,
            title=data['title'],
            role=data['role'],
            duration=data['duration'],
            description=data.get('description', '')
        )
        experience.save()
        
        return jsonify({
            'message': 'Experience added successfully',
            'experience': experience.to_dict()
        }), 201
        
    except Exception as e:
        logger.error(f"Add experience error: {e}")
        return jsonify({'error': 'Failed to add experience'}), 500

@users_bp.route('/profile/experiences/<int:experience_id>', methods=['PUT'])
# @jwt_required()
def update_experience(experience_id):
    """Update user experience"""
    try:
        user_id = 1  # get_jwt_identity() - using test user ID
        experience = UserExperience.get_by_id(experience_id)
        
        if not experience:
            return jsonify({'error': 'Experience not found'}), 404
        
        if experience.profile.user_id != user_id:
            return jsonify({'error': 'Unauthorized to update this experience'}), 403
        
        data = request.get_json()
        
        if data.get('title'):
            experience.title = data['title']
        if data.get('role'):
            experience.role = data['role']
        if data.get('duration'):
            experience.duration = data['duration']
        if data.get('description'):
            experience.description = data['description']
        
        experience.save()
        
        return jsonify({
            'message': 'Experience updated successfully',
            'experience': experience.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Update experience error: {e}")
        return jsonify({'error': 'Failed to update experience'}), 500

@users_bp.route('/profile/experiences/<int:experience_id>', methods=['DELETE'])
# @jwt_required()
def delete_experience(experience_id):
    """Delete user experience"""
    try:
        user_id = 1  # get_jwt_identity() - using test user ID
        experience = UserExperience.get_by_id(experience_id)
        
        if not experience:
            return jsonify({'error': 'Experience not found'}), 404
        
        if experience.profile.user_id != user_id:
            return jsonify({'error': 'Unauthorized to delete this experience'}), 403
        
        experience.delete()
        
        return jsonify({'message': 'Experience deleted successfully'}), 200
        
    except Exception as e:
        logger.error(f"Delete experience error: {e}")
        return jsonify({'error': 'Failed to delete experience'}), 500

# @users_bp.route('/profile/hobbies', methods=['POST'])
# # @jwt_required()
# def add_hobby():
#     """Add hobby to user profile - DISABLED: UserHobby model not in schema"""
#     return jsonify({'error': 'Hobby functionality not available'}), 501

# @users_bp.route('/profile/hobbies/<int:hobby_id>', methods=['PUT'])
# # @jwt_required()
# def update_hobby(hobby_id):
#     """Update user hobby - DISABLED: UserHobby model not in schema"""
#     return jsonify({'error': 'Hobby functionality not available'}), 501

# @users_bp.route('/profile/hobbies/<int:hobby_id>', methods=['DELETE'])
# # @jwt_required()
# def delete_hobby(hobby_id):
#     """Delete user hobby - DISABLED: UserHobby model not in schema"""
#     return jsonify({'error': 'Hobby functionality not available'}), 501

@users_bp.route('/profile/achievements', methods=['GET'])
def get_achievements():
    """Get user's achievements"""
    try:
        # Get the first user for testing (since we're using test data)
        user = User.query.first()
        
        if not user or not user.profile:
            return jsonify({'achievements': []}), 200
        
        achievements = UserAchievement.query.filter_by(profile_id=user.profile.id).all()
        
        return jsonify({
            'achievements': [ach.to_dict() for ach in achievements]
        }), 200
        
    except Exception as e:
        logger.error(f"Get achievements error: {e}")
        return jsonify({'error': 'Failed to fetch achievements'}), 500

@users_bp.route('/profile/achievements', methods=['POST'])
# @jwt_required()
def add_achievement():
    """Add achievement to user profile"""
    try:
        # Get the first user for testing (since we're using test data)
        user = User.query.first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Create profile if it doesn't exist
        if not user.profile:
            profile = UserProfile(
                user_id=user.id,
                full_name=user.username
            )
            profile.save()
            db.session.commit()  # Commit profile first
            user.profile = profile
            db.session.commit()  # Then commit the relationship
        
        data = request.get_json()
        
        if not all(data.get(field) for field in ['title', 'year']):
            return jsonify({'error': 'Title and year are required'}), 400
        
        achievement = UserAchievement(
            profile_id=user.profile.id,
            title=data['title'],
            description=data.get('description', ''),
            year=data['year']
        )
        achievement.save()
        
        return jsonify({
            'message': 'Achievement added successfully',
            'achievement': achievement.to_dict()
        }), 201
        
    except Exception as e:
        logger.error(f"Add achievement error: {e}")
        return jsonify({'error': 'Failed to add achievement'}), 500

@users_bp.route('/profile/achievements/<int:achievement_id>', methods=['PUT'])
# @jwt_required()
def update_achievement(achievement_id):
    """Update user achievement"""
    try:
        user_id = 1  # get_jwt_identity() - using test user ID
        achievement = UserAchievement.get_by_id(achievement_id)
        
        if not achievement:
            return jsonify({'error': 'Achievement not found'}), 404
        
        if achievement.profile.user_id != user_id:
            return jsonify({'error': 'Unauthorized to update this achievement'}), 403
        
        data = request.get_json()
        
        if data.get('title'):
            achievement.title = data['title']
        if data.get('description'):
            achievement.description = data['description']
        if data.get('year'):
            achievement.year = data['year']
        
        achievement.save()
        
        return jsonify({
            'message': 'Achievement updated successfully',
            'achievement': achievement.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Update achievement error: {e}")
        return jsonify({'error': 'Failed to update achievement'}), 500

@users_bp.route('/profile/achievements/<int:achievement_id>', methods=['DELETE'])
# @jwt_required()
def delete_achievement(achievement_id):
    """Delete user achievement"""
    try:
        user_id = 1  # get_jwt_identity() - using test user ID
        achievement = UserAchievement.get_by_id(achievement_id)
        
        if not achievement:
            return jsonify({'error': 'Achievement not found'}), 404
        
        if achievement.profile.user_id != user_id:
            return jsonify({'error': 'Unauthorized to delete this achievement'}), 403
        
        achievement.delete()
        
        return jsonify({'message': 'Achievement deleted successfully'}), 200
        
    except Exception as e:
        logger.error(f"Delete achievement error: {e}")
        return jsonify({'error': 'Failed to delete achievement'}), 500

@users_bp.route('/<int:user_id>', methods=['GET'])
# @jwt_required()
def get_user_profile(user_id):
    """Get another user's public profile"""
    try:
        user = User.get_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Get user profile error: {e}")
        return jsonify({'error': 'Failed to fetch user profile'}), 500
