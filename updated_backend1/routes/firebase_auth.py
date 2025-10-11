"""
Firebase Authentication Routes
Handles Firebase token verification and user sync with backend
"""

import logging
from flask import Blueprint, request, jsonify, current_app
from sqlalchemy.exc import SQLAlchemyError
from models.user import User, UserProfile
from models.base import db
from services.firebase_auth import firebase_service
from utils.auth import generate_jwt_token
from datetime import datetime
import re

logger = logging.getLogger(__name__)

firebase_auth_bp = Blueprint('firebase_auth', __name__)

@firebase_auth_bp.route('/verify-token', methods=['POST'])
def verify_firebase_token():
    """
    Verify Firebase ID token and sync user with backend
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        id_token = data.get('id_token')
        firebase_uid = data.get('firebase_uid')
        email = data.get('email')
        display_name = data.get('displayName')
        
        if not id_token:
            return jsonify({'success': False, 'error': 'ID token is required'}), 400
        
        # Verify Firebase token
        is_valid, decoded_token = firebase_service.verify_id_token(id_token)
        if not is_valid:
            return jsonify({'success': False, 'error': 'Invalid Firebase token'}), 401
        
        # Get user UID from token
        token_uid = decoded_token.get('uid')
        if not token_uid:
            return jsonify({'success': False, 'error': 'No UID in token'}), 401
        
        # Verify UID matches if provided
        if firebase_uid and token_uid != firebase_uid:
            return jsonify({'success': False, 'error': 'UID mismatch'}), 401
        
        # Get or create user in database
        user = User.query.filter_by(firebase_uid=token_uid).first()
        
        if not user:
            # Create new user
            user = User(
                firebase_uid=token_uid,
                email=decoded_token.get('email') or email,
                username=decoded_token.get('name') or display_name or f"user_{token_uid[:8]}",
                is_active=True,
                created_at=datetime.utcnow(),
                last_login=datetime.utcnow()
            )
            
            try:
                db.session.add(user)
                db.session.commit()
                logger.info(f"Created new user with Firebase UID: {token_uid}")
            except SQLAlchemyError as e:
                db.session.rollback()
                logger.error(f"Database error creating user: {e}")
                return jsonify({'success': False, 'error': 'Failed to create user'}), 500
        else:
            # Update existing user
            user.last_login = datetime.utcnow()
            if decoded_token.get('email') and user.email != decoded_token.get('email'):
                user.email = decoded_token.get('email')
            
            # Update additional fields if provided
            contact = data.get('contact_number')
            location = data.get('location')
            age = data.get('age')
            gender = data.get('gender')
            
            if contact:
                user.contact_number = contact
            if location:
                user.location = location
            if age:
                user.age = age
            if gender:
                user.gender = gender
            
            try:
                db.session.commit()
                logger.info(f"Updated user with Firebase UID: {token_uid}")
            except SQLAlchemyError as e:
                db.session.rollback()
                logger.error(f"Database error updating user: {e}")
                return jsonify({'success': False, 'error': 'Failed to update user'}), 500
        
        # Generate JWT token for backend API access
        jwt_token = generate_jwt_token(user.id)
        
        return jsonify({
            'success': True,
            'message': 'Token verified and user synced',
            'data': {
                'user_id': user.id,
                'firebase_uid': user.firebase_uid,
                'email': user.email,
                'full_name': user.full_name,
                'jwt_token': jwt_token,
                'is_new_user': not user.created_at or (datetime.utcnow() - user.created_at).seconds < 60
            }
        })
        
    except Exception as e:
        logger.error(f"Error in verify_firebase_token: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@firebase_auth_bp.route('/signup', methods=['POST'])
def firebase_signup():
    """
    Register new user with Firebase authentication
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        id_token = data.get('id_token')
        firebase_uid = data.get('firebase_uid')
        email = data.get('email')
        display_name = data.get('displayName')
        
        # Additional user data
        full_name = data.get('fullName', display_name)
        username = data.get('username')
        contact = data.get('contact')
        location = data.get('location')
        age = data.get('age')
        gender = data.get('gender')
        bio = data.get('bio')
        organization = data.get('organization')
        
        if not id_token:
            return jsonify({'success': False, 'error': 'ID token is required'}), 400
        
        # Verify Firebase token
        is_valid, decoded_token = firebase_service.verify_id_token(id_token)
        if not is_valid:
            return jsonify({'success': False, 'error': 'Invalid Firebase token'}), 401
        
        token_uid = decoded_token.get('uid')
        if not token_uid:
            return jsonify({'success': False, 'error': 'No UID in token'}), 401
        
        # Check if user already exists
        existing_user = User.query.filter_by(firebase_uid=token_uid).first()
        if existing_user:
            return jsonify({'success': False, 'error': 'User already exists'}), 409
        
        # Generate username
        def generate_username(email, full_name, firebase_uid, provided_username=None):
            # Use provided username if available
            if provided_username:
                username_base = re.sub(r'[^a-zA-Z0-9_]', '', provided_username)
                if len(username_base) >= 3:  # Minimum username length
                    # Ensure uniqueness
                    counter = 1
                    original_username = username_base
                    while User.query.filter_by(username=username_base).first():
                        username_base = f"{original_username}_{counter}"
                        counter += 1
                    return username_base
            
            # Fallback to auto-generation
            if email:
                username_base = email.split('@')[0]
                username_base = re.sub(r'[^a-zA-Z0-9_]', '', username_base)
            else:
                username_base = f"user_{firebase_uid[:8]}"
            
            # Ensure uniqueness
            counter = 1
            original_username = username_base
            while User.query.filter_by(username=username_base).first():
                username_base = f"{original_username}_{counter}"
                counter += 1
            
            return username_base

        # Create User with all Firebase credentials and additional fields
        user_email = decoded_token.get('email') or email
        user = User(
            firebase_uid=token_uid,
            firebase_email=user_email,  # Store Firebase-specific email
            email=user_email,  # Store in main email field
            username=generate_username(email, full_name, token_uid, username),
            auth_provider='firebase',  # Set auth provider
            is_active=True,
            # Additional fields from signup form
            contact_number=contact,
            location=location,
            age=age,
            gender=gender
        )

        try:
            # First save the user
            db.session.add(user)
            db.session.commit()
            logger.info(f"Registered new user with Firebase UID: {token_uid}")
            
            # Now create UserProfile with user.id
            profile = UserProfile(
                user_id=user.id,
                full_name=full_name,
                bio=bio,
                location=location,
                organization=organization,
                age=age,
                gender=gender,
                contact_number=contact
            )
            
            db.session.add(profile)
            db.session.commit()
            logger.info(f"Created profile for user: {user.id}")
            
        except SQLAlchemyError as e:
            db.session.rollback()
            logger.error(f"Database error creating user: {e}")
            return jsonify({'success': False, 'error': 'Failed to create user'}), 500
        
        # Generate JWT token
        jwt_token = generate_jwt_token(user.id)
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'data': {
                'user_id': user.id,
                'firebase_uid': user.firebase_uid,
                'firebase_email': user.firebase_email,
                'email': user.email,
                'username': user.username,
                'auth_provider': user.auth_provider,
                'is_active': user.is_active,
                # User table fields
                'contact_number': user.contact_number,
                'location': user.location,
                'age': user.age,
                'gender': user.gender,
                # Profile table fields
                'full_name': profile.full_name,
                'bio': profile.bio,
                'organization': profile.organization,
                'jwt_token': jwt_token
            }
        })
        
    except Exception as e:
        logger.error(f"Error in firebase_signup: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@firebase_auth_bp.route('/login', methods=['POST'])
def firebase_login():
    """
    Login user with Firebase authentication
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        id_token = data.get('id_token')
        
        if not id_token:
            return jsonify({'success': False, 'error': 'ID token is required'}), 400
        
        # Verify Firebase token
        is_valid, decoded_token = firebase_service.verify_id_token(id_token)
        if not is_valid:
            return jsonify({'success': False, 'error': 'Invalid Firebase token'}), 401
        
        token_uid = decoded_token.get('uid')
        if not token_uid:
            return jsonify({'success': False, 'error': 'No UID in token'}), 401
        
        # Find user in database
        user = User.query.filter_by(firebase_uid=token_uid).first()
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Update last login
        user.last_login = datetime.utcnow()
        try:
            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
            logger.error(f"Database error updating last login: {e}")
        
        # Generate JWT token
        jwt_token = generate_jwt_token(user.id)
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'data': {
                'user_id': user.id,
                'firebase_uid': user.firebase_uid,
                'email': user.email,
                'username': user.username,
                'jwt_token': jwt_token
            }
        })
        
    except Exception as e:
        logger.error(f"Error in firebase_login: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@firebase_auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """
    Get current user data
    """
    try:
        # Get JWT token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'Authorization header required'}), 401
        
        jwt_token = auth_header.split(' ')[1]
        
        # Verify JWT token and get user
        from utils.auth import verify_jwt_token
        user_id = verify_jwt_token(jwt_token)
        if not user_id:
            return jsonify({'success': False, 'error': 'Invalid token'}), 401
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'data': {
                'user_id': user.id,
                'firebase_uid': user.firebase_uid,
                'email': user.email,
                'username': user.username,
                'is_active': user.is_active
            }
        })
        
    except Exception as e:
        logger.error(f"Error in get_current_user: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@firebase_auth_bp.route('/update-profile', methods=['POST'])
def update_user_profile():
    """
    Update user profile
    """
    try:
        # Get JWT token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'Authorization header required'}), 401
        
        jwt_token = auth_header.split(' ')[1]
        
        # Verify JWT token and get user
        from utils.auth import verify_jwt_token
        user_id = verify_jwt_token(jwt_token)
        if not user_id:
            return jsonify({'success': False, 'error': 'Invalid token'}), 401
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        # Update user fields
        if 'fullName' in data:
            user.full_name = data['fullName']
        if 'contact' in data:
            user.contact = data['contact']
        if 'location' in data:
            user.location = data['location']
        if 'age' in data:
            user.age = data['age']
        if 'gender' in data:
            user.gender = data['gender']
        if 'bio' in data:
            user.bio = data['bio']
        if 'organization' in data:
            user.organization = data['organization']
        
        try:
            db.session.commit()
            logger.info(f"Updated profile for user: {user.id}")
        except SQLAlchemyError as e:
            db.session.rollback()
            logger.error(f"Database error updating profile: {e}")
            return jsonify({'success': False, 'error': 'Failed to update profile'}), 500
        
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully',
            'data': {
                'user_id': user.id,
                'firebase_uid': user.firebase_uid,
                'email': user.email,
                'full_name': user.full_name,
                'contact': user.contact,
                'location': user.location,
                'age': user.age,
                'gender': user.gender,
                'bio': user.bio,
                'organization': user.organization
            }
        })
        
    except Exception as e:
        logger.error(f"Error in update_user_profile: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@firebase_auth_bp.route('/deactivate', methods=['POST'])
def deactivate_user():
    """
    Deactivate user account
    """
    try:
        # Get JWT token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'Authorization header required'}), 401
        
        jwt_token = auth_header.split(' ')[1]
        
        # Verify JWT token and get user
        from utils.auth import verify_jwt_token
        user_id = verify_jwt_token(jwt_token)
        if not user_id:
            return jsonify({'success': False, 'error': 'Invalid token'}), 401
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Deactivate user
        user.is_active = False
        try:
            db.session.commit()
            logger.info(f"Deactivated user: {user.id}")
        except SQLAlchemyError as e:
            db.session.rollback()
            logger.error(f"Database error deactivating user: {e}")
            return jsonify({'success': False, 'error': 'Failed to deactivate user'}), 500
        
        return jsonify({
            'success': True,
            'message': 'User deactivated successfully'
        })
        
    except Exception as e:
        logger.error(f"Error in deactivate_user: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500
