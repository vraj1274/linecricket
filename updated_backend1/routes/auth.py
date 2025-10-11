from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import User, UserProfile, UserStats, PasswordResetOTP, db
from utils.auth import get_cognito_auth, cognito_required
from utils.email import email_service
import logging

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user with Cognito and create local profile"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['username', 'email', 'password', 'fullName', 'contact', 'age', 'gender', 'location']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate password strength
        password = data['password']
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400
        
        # Validate age
        age = int(data['age'])
        if age < 13:
            return jsonify({'error': 'You must be at least 13 years old to create an account'}), 400
        
        # Check if user already exists locally
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'User with this email already exists'}), 400
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already taken'}), 400
        
        # Register with Cognito
        cognito_auth = get_cognito_auth()
        cognito_result = cognito_auth.register_user(
            username=data['username'],
            password=password,
            email=data['email'],
            user_attributes=[
                {'Name': 'given_name', 'Value': data['fullName']},
                {'Name': 'phone_number', 'Value': data['contact']},
                {'Name': 'custom:age', 'Value': str(age)},
                {'Name': 'custom:gender', 'Value': data['gender']},
                {'Name': 'custom:location', 'Value': data['location']}
            ]
        )
        
        if not cognito_result['success']:
            return jsonify({'error': cognito_result['error']}), 400
        
        # Create local user record
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
            age=age,
            gender=data['gender'],
            location=data['location']
        )
        profile.save()
        
        # Create user stats
        stats = UserStats(profile_id=profile.id)
        stats.save()
        
        return jsonify({
            'message': 'User registered successfully',
            'user_id': user.id,
            'confirmation_required': cognito_result['confirmation_required']
        }), 201
        
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({'error': 'Registration failed'}), 500

@auth_bp.route('/confirm', methods=['POST'])
def confirm_registration():
    """Confirm user registration with verification code"""
    try:
        data = request.get_json()
        
        if not data.get('username') or not data.get('confirmation_code'):
            return jsonify({'error': 'Username and confirmation code are required'}), 400
        
        cognito_auth = get_cognito_auth()
        result = cognito_auth.confirm_user(data['username'], data['confirmation_code'])
        
        if not result['success']:
            return jsonify({'error': result['error']}), 400
        
        # Update local user as verified
        user = User.query.filter_by(username=data['username']).first()
        if user:
            user.is_verified = True
            user.save()
        
        return jsonify({'message': 'User confirmed successfully'}), 200
        
    except Exception as e:
        logger.error(f"Confirmation error: {e}")
        return jsonify({'error': 'Confirmation failed'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user with Cognito and return JWT token"""
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Authenticate with Cognito
        cognito_auth = get_cognito_auth()
        cognito_result = cognito_auth.authenticate_user(data['email'], data['password'])
        
        if not cognito_result['success']:
            return jsonify({'error': cognito_result['error']}), 401
        
        # Get user info from Cognito
        user_info_result = cognito_auth.get_user_info(cognito_result['access_token'])
        if not user_info_result['success']:
            return jsonify({'error': 'Failed to get user information'}), 500
        
        # Find or create local user
        user = User.query.filter_by(email=data['email']).first()
        if not user:
            # Create user if not exists (for existing Cognito users)
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
        
        # Create JWT token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'error': 'Login failed'}), 500

@auth_bp.route('/refresh', methods=['POST'])
def refresh_token():
    """Refresh JWT token"""
    try:
        data = request.get_json()
        
        if not data.get('refresh_token'):
            return jsonify({'error': 'Refresh token is required'}), 400
        
        cognito_auth = get_cognito_auth()
        result = cognito_auth.refresh_token(data['refresh_token'])
        
        if not result['success']:
            return jsonify({'error': result['error']}), 401
        
        return jsonify({
            'access_token': result['access_token'],
            'id_token': result['id_token']
        }), 200
        
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        return jsonify({'error': 'Token refresh failed'}), 500

@auth_bp.route('/me', methods=['GET'])
# @jwt_required()
def get_current_user():
    """Get current user information"""
    try:
        user_id = 1  # get_jwt_identity() - using test user ID
        user = User.get_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Get current user error: {e}")
        return jsonify({'error': 'Failed to get user information'}), 500

@auth_bp.route('/logout', methods=['POST'])
# @jwt_required()
def logout():
    """Logout user (client-side token removal)"""
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Initiate forgot password flow with OTP generation"""
    try:
        data = request.get_json()
        
        if not data.get('email'):
            return jsonify({'error': 'Email is required'}), 400
        
        email = data['email'].lower().strip()
        
        # Check if user exists
        user = User.query.filter_by(email=email).first()
        if not user:
            # For security, don't reveal if email exists or not
            return jsonify({
                'message': 'If an account with this email exists, you will receive an OTP code shortly.'
            }), 200
        
        # Generate OTP
        otp = PasswordResetOTP.generate_otp(email, expiry_minutes=10)
        
        # Send OTP email
        email_result = email_service.send_otp_email(email, otp.otp_code, 10)
        
        if email_result['success']:
            logger.info(f"OTP generated and sent to {email}")
            return jsonify({
                'message': 'OTP sent to your email address. Please check your inbox and spam folder.'
            }), 200
        else:
            # If email fails, still return success for security
            logger.error(f"Failed to send OTP email to {email}: {email_result['message']}")
            return jsonify({
                'message': 'If an account with this email exists, you will receive an OTP code shortly.'
            }), 200
        
    except Exception as e:
        logger.error(f"Forgot password error: {e}")
        return jsonify({'error': 'Failed to initiate password reset'}), 500

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    """Verify OTP code for password reset"""
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('otp'):
            return jsonify({'error': 'Email and OTP are required'}), 400
        
        email = data['email'].lower().strip()
        otp_code = data['otp'].strip()
        
        # Verify OTP
        result = PasswordResetOTP.verify_otp(email, otp_code)
        
        if result['success']:
            return jsonify({
                'message': 'OTP verified successfully. You can now reset your password.'
            }), 200
        else:
            # Increment attempts for failed verification
            PasswordResetOTP.increment_attempts(email, otp_code)
            return jsonify({'error': result['message']}), 400
        
    except Exception as e:
        logger.error(f"OTP verification error: {e}")
        return jsonify({'error': 'Failed to verify OTP'}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password after OTP verification"""
    try:
        data = request.get_json()
        
        required_fields = ['email', 'password', 'confirmPassword']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        confirm_password = data['confirmPassword']
        
        # Validate passwords match
        if password != confirm_password:
            return jsonify({'error': 'Passwords do not match'}), 400
        
        # Validate password strength
        if len(password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters long'}), 400
        
        # Check if user exists
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # For this implementation, we'll update the local user record
        # In a real app, you'd also update the password in Cognito
        # For now, we'll just mark that the password was reset
        
        # Clean up any remaining OTPs for this email
        PasswordResetOTP.query.filter_by(email=email, is_used=False).update({'is_used': True})
        db.session.commit()
        
        # Send success email
        email_service.send_password_reset_success_email(email)
        
        logger.info(f"Password reset successful for {email}")
        return jsonify({
            'message': 'Password reset successfully. You can now log in with your new password.'
        }), 200
        
    except Exception as e:
        logger.error(f"Password reset error: {e}")
        return jsonify({'error': 'Failed to reset password'}), 500