"""
Enhanced Security Utilities for Authentication and Validation
"""

import re
import hashlib
import hmac
import time
import logging
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from models import db, User, LoginAttempt
import bleach
import html

logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

class SecurityError(Exception):
    """Custom security error"""
    pass

class EnhancedPasswordValidator:
    """Enhanced password validation with security best practices"""
    
    COMMON_PASSWORDS = [
        'password', '123456', 'qwerty', 'abc123', 'password123',
        'admin', 'root', 'user', 'test', 'guest', 'welcome',
        'cricket', 'sports', 'player', 'team', 'match'
    ]
    
    @classmethod
    def validate_password_strength(cls, password):
        """Validate password strength with enhanced requirements"""
        if not password:
            raise SecurityError("Password is required")
        
        # Length requirements
        if len(password) < 12:
            raise SecurityError("Password must be at least 12 characters long")
        
        if len(password) > 128:
            raise SecurityError("Password must be less than 128 characters")
        
        # Character requirements
        if not re.search(r'[A-Z]', password):
            raise SecurityError("Password must contain at least one uppercase letter")
        
        if not re.search(r'[a-z]', password):
            raise SecurityError("Password must contain at least one lowercase letter")
        
        if not re.search(r'\d', password):
            raise SecurityError("Password must contain at least one number")
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise SecurityError("Password must contain at least one special character")
        
        # Check for common patterns
        if password.lower() in cls.COMMON_PASSWORDS:
            raise SecurityError("Password is too common, please choose a stronger password")
        
        # Check for repeated characters
        if re.search(r'(.)\1{3,}', password):
            raise SecurityError("Password cannot contain more than 3 consecutive identical characters")
        
        # Check for keyboard patterns
        keyboard_patterns = [
            'qwerty', 'asdfgh', 'zxcvbn', '123456', 'abcdef',
            'qwertyuiop', 'asdfghjkl', 'zxcvbnm'
        ]
        
        password_lower = password.lower()
        for pattern in keyboard_patterns:
            if pattern in password_lower:
                raise SecurityError("Password cannot contain keyboard patterns")
        
        return True

class AccountLockoutManager:
    """Manage account lockout for failed login attempts"""
    
    MAX_ATTEMPTS = 5
    LOCKOUT_DURATION = 15  # minutes
    
    @classmethod
    def check_lockout(cls, email, ip_address):
        """Check if account is locked due to failed attempts"""
        cutoff_time = datetime.utcnow() - timedelta(minutes=cls.LOCKOUT_DURATION)
        
        # Check recent failed attempts
        recent_attempts = LoginAttempt.query.filter(
            LoginAttempt.email == email,
            LoginAttempt.success == False,
            LoginAttempt.attempt_time > cutoff_time
        ).count()
        
        if recent_attempts >= cls.MAX_ATTEMPTS:
            return True, f"Account temporarily locked due to {recent_attempts} failed attempts. Please try again in {cls.LOCKOUT_DURATION} minutes."
        
        return False, None
    
    @classmethod
    def record_attempt(cls, email, ip_address, success, user_agent=None):
        """Record login attempt"""
        attempt = LoginAttempt(
            email=email,
            ip_address=ip_address,
            success=success,
            user_agent=user_agent,
            attempt_time=datetime.utcnow()
        )
        
        try:
            attempt.save()
            logger.info(f"Login attempt recorded: {email} from {ip_address} - {'SUCCESS' if success else 'FAILED'}")
        except Exception as e:
            logger.error(f"Failed to record login attempt: {e}")
    
    @classmethod
    def clear_attempts(cls, email):
        """Clear failed attempts for successful login"""
        try:
            LoginAttempt.query.filter_by(email=email, success=False).delete()
            db.session.commit()
        except Exception as e:
            logger.error(f"Failed to clear login attempts: {e}")

class InputSanitizer:
    """Sanitize user input to prevent XSS and injection attacks"""
    
    @staticmethod
    def sanitize_text(text):
        """Sanitize text input"""
        if not text:
            return text
        
        # Remove HTML tags and escape special characters
        sanitized = bleach.clean(text, tags=[], attributes={}, strip=True)
        return html.escape(sanitized)
    
    @staticmethod
    def sanitize_email(email):
        """Sanitize email input"""
        if not email:
            return email
        
        # Basic email sanitization
        sanitized = bleach.clean(email, tags=[], attributes={}, strip=True)
        return sanitized.lower().strip()
    
    @staticmethod
    def sanitize_phone(phone):
        """Sanitize phone number input"""
        if not phone:
            return phone
        
        # Remove all non-digit characters except + at the beginning
        sanitized = re.sub(r'[^\d+]', '', phone)
        return sanitized

class SecurityHeaders:
    """Add security headers to responses"""
    
    @staticmethod
    def add_security_headers(response):
        """Add security headers to response"""
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Content-Security-Policy'] = "default-src 'self'"
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
        return response

class RateLimiter:
    """Enhanced rate limiting with IP and user-based limits"""
    
    @staticmethod
    def login_rate_limit():
        """Rate limit for login attempts"""
        return limiter.limit("5 per minute", key_func=lambda: f"login:{get_remote_address()}")
    
    @staticmethod
    def registration_rate_limit():
        """Rate limit for registration attempts"""
        return limiter.limit("3 per minute", key_func=lambda: f"register:{get_remote_address()}")
    
    @staticmethod
    def password_reset_rate_limit():
        """Rate limit for password reset attempts"""
        return limiter.limit("2 per minute", key_func=lambda: f"reset:{get_remote_address()}")

class SecurityLogger:
    """Enhanced security logging"""
    
    def __init__(self):
        self.logger = logging.getLogger('security')
        handler = logging.FileHandler('security.log')
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)
    
    def log_login_attempt(self, email, ip_address, success, user_agent=None):
        """Log login attempt with security context"""
        status = "SUCCESS" if success else "FAILED"
        self.logger.info(f"LOGIN_ATTEMPT: {email} from {ip_address} - {status}")
        
        if not success:
            self.logger.warning(f"FAILED_LOGIN: {email} from {ip_address} - User-Agent: {user_agent}")
    
    def log_registration_attempt(self, email, ip_address, success):
        """Log registration attempt"""
        status = "SUCCESS" if success else "FAILED"
        self.logger.info(f"REGISTRATION_ATTEMPT: {email} from {ip_address} - {status}")
    
    def log_suspicious_activity(self, activity, ip_address, details):
        """Log suspicious activity"""
        self.logger.warning(f"SUSPICIOUS_ACTIVITY: {activity} from {ip_address} - {details}")
    
    def log_security_event(self, event_type, user_id, ip_address, details):
        """Log general security events"""
        self.logger.info(f"SECURITY_EVENT: {event_type} - User: {user_id} from {ip_address} - {details}")

# Security decorators
def security_headers_required(f):
    """Decorator to add security headers"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        response = f(*args, **kwargs)
        return SecurityHeaders.add_security_headers(response)
    return decorated_function

def sanitize_input_required(f):
    """Decorator to sanitize input data"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.is_json:
            data = request.get_json()
            sanitized_data = {}
            
            for key, value in data.items():
                if isinstance(value, str):
                    sanitized_data[key] = InputSanitizer.sanitize_text(value)
                else:
                    sanitized_data[key] = value
            
            # Replace request data with sanitized data
            request._cached_json = sanitized_data
        
        return f(*args, **kwargs)
    return decorated_function

def enhanced_validation_required(schema):
    """Decorator for enhanced validation"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                data = request.get_json()
                if not data:
                    return jsonify({'error': 'No data provided'}), 400
                
                # Validate against schema
                for field, validator in schema.items():
                    if field in data and data[field] is not None:
                        validator(data[field])
                
                return f(*args, **kwargs)
            except SecurityError as e:
                return jsonify({'error': str(e)}), 400
            except Exception as e:
                logger.error(f"Validation error in {f.__name__}: {e}")
                return jsonify({'error': 'Validation failed'}), 400
        
        return decorated_function
    return decorator

# Enhanced validation schemas
ENHANCED_REGISTRATION_SCHEMA = {
    'username': lambda x: validate_username(x),
    'email': lambda x: validate_email_format(x),
    'password': lambda x: EnhancedPasswordValidator.validate_password_strength(x),
    'fullName': lambda x: validate_content_length(x, 'Full name', 100),
    'contact': lambda x: validate_phone_number(x),
    'age': lambda x: validate_age(x),
    'gender': lambda x: x in ['Male', 'Female', 'Other', 'Prefer not to say'] or SecurityError('Invalid gender'),
    'location': lambda x: validate_content_length(x, 'Location', 100)
}

# Import existing validation functions
from utils.validation import (
    validate_username, validate_email_format, validate_phone_number,
    validate_age, validate_content_length
)

# Initialize security logger
security_logger = SecurityLogger()


