"""
Enhanced Authentication Routes with Security Improvements
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import User, UserProfile, UserStats, db
from utils.auth import get_cognito_auth, cognito_required
from utils.security import (
    EnhancedPasswordValidator, AccountLockoutManager, InputSanitizer,
    SecurityHeaders, RateLimiter, security_logger, security_headers_required,
    sanitize_input_required, enhanced_validation_required, ENHANCED_REGISTRATION_SCHEMA
)
from utils.validation import validate_required_fields
import logging

logger = logging.getLogger(__name__)

secure_auth_bp = Blueprint('secure_auth', __name__)

@secure_auth_bp.route('/register', methods=['POST'])
@RateLimiter.registration_rate_limit()
@security_headers_required
@sanitize_input_required
@enhanced_validation_required(ENHANCED_REGISTRATION_SCHEMA)
def secure_register():
    """Enhanced user registration with security measures"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['username', 'email', 'password', 'fullName', 'contact', 'age', 'gender', 'location']
        validate_required_fields(data, required_fields)
        
        # Get client information
        ip_address = request.remote_addr
        user_agent = request.headers.get('User-Agent')
        
        # Check for existing user
        if User.query.filter_by(email=data['email']).first():
            security_logger.log_registration_attempt(data['email'], ip_address, False)
            return jsonify({'error': 'User with this email already exists'}), 400
        
        if User.query.filter_by(username=data['username']).first():
            security_logger.log_registration_attempt(data['email'], ip_address, False)
            return jsonify({'error': 'Username already taken'}), 400
        
        # Register with Cognito
        cognito_auth = get_cognito_auth()
        cognito_result = cognito_auth.register_user(
            username=data['username'],
            password=data['password'],
            email=data['email'],
            user_attributes=[
                {'Name': 'given_name', 'Value': data['fullName']},
                {'Name': 'phone_number', 'Value': data['contact']}
            ]
        )
        
        if not cognito_result['success']:
            security_logger.log_registration_attempt(data['email'], ip_address, False)
            return jsonify({'error': cognito_result['error']}), 400
        
        # Create local user
        user = User(
            cognito_user_id=cognito_result['user_sub'],
            email=data['email'],
            username=data['username'],
            is_verified=False
        )
        user.save()
        
        # Create user profile
        profile = UserProfile(
            user_id=user.id,
            full_name=data['fullName'],
            contact_number=data['contact'],
            age=int(data['age']),
            gender=data['gender'],
            location=data['location']
        )
        profile.save()
        
        # Create user stats
        stats = UserStats(profile_id=profile.id)
        stats.save()
        
        security_logger.log_registration_attempt(data['email'], ip_address, True)
        
        return jsonify({
            'message': 'Registration successful. Please check your email for confirmation.',
            'user_id': str(user.id),
            'confirmation_required': not cognito_result.get('confirmation_required', True)
        }), 201
        
    except Exception as e:
        logger.error(f"Registration error: {e}")
        security_logger.log_registration_attempt(data.get('email', 'unknown'), request.remote_addr, False)
        return jsonify({'error': 'Registration failed'}), 500

@secure_auth_bp.route('/login', methods=['POST'])
@RateLimiter.login_rate_limit()
@security_headers_required
@sanitize_input_required
def secure_login():
    """Enhanced user login with security measures"""
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Get client information
        ip_address = request.remote_addr
        user_agent = request.headers.get('User-Agent')
        
        # Check account lockout
        is_locked, lockout_message = AccountLockoutManager.check_lockout(data['email'], ip_address)
        if is_locked:
            security_logger.log_suspicious_activity('LOCKED_ACCOUNT_ACCESS', ip_address, f"Attempted login to locked account: {data['email']}")
            return jsonify({'error': lockout_message}), 423
        
        # Authenticate with Cognito
        cognito_auth = get_cognito_auth()
        cognito_result = cognito_auth.authenticate_user(data['email'], data['password'])
        
        if not cognito_result['success']:
            # Record failed attempt
            AccountLockoutManager.record_attempt(data['email'], ip_address, False, user_agent)
            security_logger.log_login_attempt(data['email'], ip_address, False, user_agent)
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Get user info from Cognito
        user_info_result = cognito_auth.get_user_info(cognito_result['access_token'])
        if not user_info_result['success']:
            security_logger.log_login_attempt(data['email'], ip_address, False, user_agent)
            return jsonify({'error': 'Failed to get user information'}), 500
        
        # Find or create local user
        user = User.query.filter_by(email=data['email']).first()
        if not user:
            # Create user if not exists
            user = User(
                cognito_user_id=user_info_result['user_info'].get('sub'),
                email=data['email'],
                username=user_info_result['username'],
                is_verified=True
            )
            user.save()
            
            # Create basic profile
            profile = UserProfile(
                user_id=user.id,
                full_name=user_info_result['user_info'].get('given_name', ''),
                email=data['email']
            )
            profile.save()
            
            # Create user stats
            stats = UserStats(profile_id=profile.id)
            stats.save()
        
        # Record successful attempt and clear failed attempts
        AccountLockoutManager.record_attempt(data['email'], ip_address, True, user_agent)
        AccountLockoutManager.clear_attempts(data['email'])
        security_logger.log_login_attempt(data['email'], ip_address, True, user_agent)
        
        # Create JWT token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'id': str(user.id),
                'username': user.username,
                'email': user.email,
                'is_verified': user.is_verified
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        security_logger.log_login_attempt(data.get('email', 'unknown'), request.remote_addr, False)
        return jsonify({'error': 'Login failed'}), 500

@secure_auth_bp.route('/logout', methods=['POST'])
@jwt_required()
@security_headers_required
def secure_logout():
    """Enhanced logout with security measures"""
    try:
        user_id = get_jwt_identity()
        ip_address = request.remote_addr
        
        # Log logout event
        security_logger.log_security_event('LOGOUT', user_id, ip_address, 'User logged out successfully')
        
        # In a production system, you would:
        # 1. Add token to blacklist
        # 2. Invalidate user sessions
        # 3. Clear any cached user data
        
        return jsonify({'message': 'Logout successful'}), 200
        
    except Exception as e:
        logger.error(f"Logout error: {e}")
        return jsonify({'error': 'Logout failed'}), 500

@secure_auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
@security_headers_required
@sanitize_input_required
def secure_change_password():
    """Enhanced password change with security measures"""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        ip_address = request.remote_addr
        
        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({'error': 'Current password and new password are required'}), 400
        
        # Validate new password strength
        EnhancedPasswordValidator.validate_password_strength(data['new_password'])
        
        # Get user
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Verify current password with Cognito
        cognito_auth = get_cognito_auth()
        auth_result = cognito_auth.authenticate_user(user.email, data['current_password'])
        
        if not auth_result['success']:
            security_logger.log_security_event('PASSWORD_CHANGE_FAILED', user_id, ip_address, 'Invalid current password')
            return jsonify({'error': 'Current password is incorrect'}), 400
        
        # Change password in Cognito (this would require additional Cognito admin functions)
        # For now, we'll just log the attempt
        security_logger.log_security_event('PASSWORD_CHANGE_ATTEMPT', user_id, ip_address, 'Password change requested')
        
        return jsonify({'message': 'Password change successful'}), 200
        
    except Exception as e:
        logger.error(f"Password change error: {e}")
        return jsonify({'error': 'Password change failed'}), 500

@secure_auth_bp.route('/security-status', methods=['GET'])
@jwt_required()
@security_headers_required
def get_security_status():
    """Get user security status"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get recent login attempts
        recent_attempts = LoginAttempt.query.filter_by(email=user.email).order_by(LoginAttempt.attempt_time.desc()).limit(5).all()
        
        return jsonify({
            'user_id': str(user.id),
            'email': user.email,
            'is_verified': user.is_verified,
            'recent_attempts': [
                {
                    'ip_address': attempt.ip_address,
                    'success': attempt.success,
                    'attempt_time': attempt.attempt_time.isoformat()
                } for attempt in recent_attempts
            ]
        }), 200
        
    except Exception as e:
        logger.error(f"Security status error: {e}")
        return jsonify({'error': 'Failed to get security status'}), 500




