import boto3
import jwt
from functools import wraps
from flask import request, jsonify, current_app
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, create_access_token
from botocore.exceptions import ClientError
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class CognitoAuth:
    """AWS Cognito authentication helper class"""
    
    def __init__(self, region, user_pool_id, client_id, client_secret=None):
        self.region = region
        self.user_pool_id = user_pool_id
        self.client_id = client_id
        self.client_secret = client_secret
        self.cognito_client = boto3.client('cognito-idp', region_name=region)
    
    def authenticate_user(self, username, password):
        """Authenticate user with Cognito"""
        try:
            auth_parameters = {
                'USERNAME': username,
                'PASSWORD': password
            }
            
            if self.client_secret:
                auth_parameters['SECRET_HASH'] = self._get_secret_hash(username)
            
            response = self.cognito_client.admin_initiate_auth(
                UserPoolId=self.user_pool_id,
                ClientId=self.client_id,
                AuthFlow='ADMIN_NO_SRP_AUTH',
                AuthParameters=auth_parameters
            )
            
            return {
                'success': True,
                'access_token': response['AuthenticationResult']['AccessToken'],
                'id_token': response['AuthenticationResult']['IdToken'],
                'refresh_token': response['AuthenticationResult']['RefreshToken']
            }
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'NotAuthorizedException':
                return {'success': False, 'error': 'Invalid credentials'}
            elif error_code == 'UserNotFoundException':
                return {'success': False, 'error': 'User not found'}
            elif error_code == 'UserNotConfirmedException':
                return {'success': False, 'error': 'User not confirmed'}
            else:
                logger.error(f"Cognito authentication error: {e}")
                return {'success': False, 'error': 'Authentication failed'}
    
    def register_user(self, username, password, email, user_attributes=None):
        """Register new user with Cognito"""
        try:
            if user_attributes is None:
                user_attributes = []
            
            user_attributes.append({'Name': 'email', 'Value': email})
            
            response = self.cognito_client.sign_up(
                ClientId=self.client_id,
                Username=username,
                Password=password,
                UserAttributes=user_attributes,
                SecretHash=self._get_secret_hash(username) if self.client_secret else None
            )
            
            return {
                'success': True,
                'user_sub': response['UserSub'],
                'confirmation_required': response.get('UserConfirmed', False)
            }
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'UsernameExistsException':
                return {'success': False, 'error': 'Username already exists'}
            elif error_code == 'InvalidPasswordException':
                return {'success': False, 'error': 'Password does not meet requirements'}
            else:
                logger.error(f"Cognito registration error: {e}")
                return {'success': False, 'error': 'Registration failed'}
    
    def confirm_user(self, username, confirmation_code):
        """Confirm user registration"""
        try:
            self.cognito_client.confirm_sign_up(
                ClientId=self.client_id,
                Username=username,
                ConfirmationCode=confirmation_code,
                SecretHash=self._get_secret_hash(username) if self.client_secret else None
            )
            return {'success': True}
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'CodeMismatchException':
                return {'success': False, 'error': 'Invalid confirmation code'}
            elif error_code == 'ExpiredCodeException':
                return {'success': False, 'error': 'Confirmation code expired'}
            else:
                logger.error(f"Cognito confirmation error: {e}")
                return {'success': False, 'error': 'Confirmation failed'}
    
    def get_user_info(self, access_token):
        """Get user information from Cognito"""
        try:
            response = self.cognito_client.get_user(AccessToken=access_token)
            
            user_info = {}
            for attribute in response['UserAttributes']:
                user_info[attribute['Name']] = attribute['Value']
            
            return {
                'success': True,
                'user_info': user_info,
                'username': response['Username']
            }
            
        except ClientError as e:
            logger.error(f"Cognito get user info error: {e}")
            return {'success': False, 'error': 'Failed to get user info'}
    
    def refresh_token(self, refresh_token):
        """Refresh access token"""
        try:
            response = self.cognito_client.initiate_auth(
                ClientId=self.client_id,
                AuthFlow='REFRESH_TOKEN_AUTH',
                AuthParameters={
                    'REFRESH_TOKEN': refresh_token,
                    'SECRET_HASH': self._get_secret_hash(refresh_token) if self.client_secret else None
                }
            )
            
            return {
                'success': True,
                'access_token': response['AuthenticationResult']['AccessToken'],
                'id_token': response['AuthenticationResult']['IdToken']
            }
            
        except ClientError as e:
            logger.error(f"Cognito refresh token error: {e}")
            return {'success': False, 'error': 'Token refresh failed'}
    
    def _get_secret_hash(self, username):
        """Generate secret hash for Cognito"""
        import hmac
        import hashlib
        import base64
        
        message = username + self.client_id
        dig = hmac.new(
            self.client_secret.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).digest()
        return base64.b64encode(dig).decode()

def get_cognito_auth():
    """Get Cognito auth instance from app config"""
    return CognitoAuth(
        region=current_app.config['COGNITO_REGION'],
        user_pool_id=current_app.config['COGNITO_USER_POOL_ID'],
        client_id=current_app.config['COGNITO_CLIENT_ID'],
        client_secret=current_app.config.get('COGNITO_CLIENT_SECRET')
    )

def cognito_required(f):
    """Decorator to require Cognito authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid authorization header'}), 401
        
        access_token = auth_header.split(' ')[1]
        cognito_auth = get_cognito_auth()
        
        user_info_result = cognito_auth.get_user_info(access_token)
        if not user_info_result['success']:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Add user info to request context
        request.cognito_user = user_info_result['user_info']
        request.cognito_username = user_info_result['username']
        
        return f(*args, **kwargs)
    
    return decorated_function

def generate_jwt_token(user_id: int, expires_in_hours: int = 24) -> str:
    """
    Generate JWT token for user
    
    Args:
        user_id: User ID
        expires_in_hours: Token expiration time in hours
        
    Returns:
        JWT token string
    """
    try:
        # Create token with user ID as string
        token = create_access_token(
            identity=str(user_id),
            expires_delta=timedelta(hours=expires_in_hours)
        )
        return token
    except Exception as e:
        logger.error(f"Error generating JWT token: {e}")
        raise

def verify_jwt_token(token: str) -> int:
    """
    Verify JWT token and return user ID
    
    Args:
        token: JWT token string
        
    Returns:
        User ID if valid, None if invalid
    """
    try:
        # Use Flask-JWT-Extended to verify token
        from flask_jwt_extended import decode_token
        decoded = decode_token(token)
        
        user_id = decoded.get('sub')
        if user_id:
            return int(user_id)
        else:
            return None
            
    except Exception as e:
        logger.error(f"Error verifying JWT token: {e}")
        return None

def jwt_required(f):
    """Decorator to require JWT authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Invalid or missing JWT token'}), 401
    
    return decorated_function

def firebase_required(f):
    """Decorator to require Firebase authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            from services.firebase_auth import FirebaseService
            
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'error': 'Missing or invalid authorization header'}), 401
            
            token = auth_header.split(' ')[1]
            firebase_service = FirebaseService()
            
            success, decoded_token = firebase_service.verify_id_token(token)
            if not success or not decoded_token:
                return jsonify({'error': 'Invalid or expired Firebase token'}), 401
            
            # Add user info to request context
            request.firebase_user = decoded_token
            request.firebase_uid = decoded_token.get('uid')
            
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"Firebase authentication error: {e}")
            return jsonify({'error': 'Authentication failed'}), 401
    
    return decorated_function
