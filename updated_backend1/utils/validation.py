import re
import phonenumbers
from email_validator import validate_email, EmailNotValidError
from flask import request, jsonify
from functools import wraps
import logging

logger = logging.getLogger(__name__)

class ValidationError(Exception):
    """Custom validation error"""
    pass

def validate_required_fields(data, required_fields):
    """Validate that all required fields are present"""
    missing_fields = []
    for field in required_fields:
        if not data.get(field):
            missing_fields.append(field)
    
    if missing_fields:
        raise ValidationError(f"Missing required fields: {', '.join(missing_fields)}")

def validate_email_format(email):
    """Validate email format"""
    try:
        validate_email(email)
        return True
    except EmailNotValidError:
        raise ValidationError("Invalid email format")

def validate_phone_number(phone_number):
    """Validate phone number format"""
    try:
        parsed_number = phonenumbers.parse(phone_number, None)
        if phonenumbers.is_valid_number(parsed_number):
            return True
        else:
            raise ValidationError("Invalid phone number")
    except phonenumbers.NumberParseException:
        raise ValidationError("Invalid phone number format")

def validate_password_strength(password):
    """Validate password strength"""
    if len(password) < 6:
        raise ValidationError("Password must be at least 6 characters long")
    
    if len(password) > 128:
        raise ValidationError("Password must be less than 128 characters")
    
    # Check for at least one letter and one number
    if not re.search(r'[A-Za-z]', password):
        raise ValidationError("Password must contain at least one letter")
    
    if not re.search(r'\d', password):
        raise ValidationError("Password must contain at least one number")
    
    return True

def validate_username(username):
    """Validate username format"""
    if len(username) < 3:
        raise ValidationError("Username must be at least 3 characters long")
    
    if len(username) > 30:
        raise ValidationError("Username must be less than 30 characters")
    
    # Username should only contain letters, numbers, underscores, and hyphens
    if not re.match(r'^[a-zA-Z0-9_-]+$', username):
        raise ValidationError("Username can only contain letters, numbers, underscores, and hyphens")
    
    return True

def validate_age(age):
    """Validate age"""
    try:
        age_int = int(age)
        if age_int < 13:
            raise ValidationError("You must be at least 13 years old")
        if age_int > 120:
            raise ValidationError("Invalid age")
        return True
    except ValueError:
        raise ValidationError("Age must be a valid number")

def validate_cricket_skill(skill):
    """Validate cricket skill level (0-100)"""
    try:
        skill_int = int(skill)
        if skill_int < 0 or skill_int > 100:
            raise ValidationError("Cricket skill must be between 0 and 100")
        return True
    except ValueError:
        raise ValidationError("Cricket skill must be a valid number")

def validate_match_type(match_type):
    """Validate match type"""
    valid_types = ['t20', 'odi', 'test', 'practice', 'tournament']
    if match_type not in valid_types:
        raise ValidationError(f"Invalid match type. Must be one of: {', '.join(valid_types)}")
    return True

def validate_players_needed(players_needed):
    """Validate number of players needed"""
    try:
        players_int = int(players_needed)
        if players_int < 2 or players_int > 22:
            raise ValidationError("Players needed must be between 2 and 22")
        return True
    except ValueError:
        raise ValidationError("Players needed must be a valid number")

def validate_entry_fee(entry_fee):
    """Validate entry fee"""
    try:
        fee_float = float(entry_fee)
        if fee_float < 0:
            raise ValidationError("Entry fee cannot be negative")
        if fee_float > 10000:
            raise ValidationError("Entry fee cannot exceed ₹10,000")
        return True
    except ValueError:
        raise ValidationError("Entry fee must be a valid number")

def validate_content_length(content, field_name, max_length=1000):
    """Validate content length"""
    if len(content) > max_length:
        raise ValidationError(f"{field_name} must be less than {max_length} characters")
    return True

def validate_pagination_params(page, per_page):
    """Validate pagination parameters"""
    if page < 1:
        raise ValidationError("Page must be greater than 0")
    
    if per_page < 1 or per_page > 100:
        raise ValidationError("Per page must be between 1 and 100")
    
    return True

def validate_json_request(f):
    """Decorator to validate JSON request"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({'error': 'Request must be JSON'}), 400
        
        try:
            return f(*args, **kwargs)
        except ValidationError as e:
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            logger.error(f"Validation error in {f.__name__}: {e}")
            return jsonify({'error': 'Validation failed'}), 400
    
    return decorated_function

def validate_query_params(f):
    """Decorator to validate query parameters"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except ValidationError as e:
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            logger.error(f"Query validation error in {f.__name__}: {e}")
            return jsonify({'error': 'Invalid query parameters'}), 400
    
    return decorated_function

# Common validation schemas
REGISTRATION_SCHEMA = {
    'username': validate_username,
    'email': validate_email_format,
    'password': validate_password_strength,
    'fullName': lambda x: validate_content_length(x, 'Full name', 100),
    'contact': validate_phone_number,
    'age': validate_age,
    'gender': lambda x: x in ['Male', 'Female', 'Other', 'Prefer not to say'] or ValidationError('Invalid gender'),
    'location': lambda x: validate_content_length(x, 'Location', 100)
}

POST_SCHEMA = {
    'content': lambda x: validate_content_length(x, 'Post content', 2000),
    'image_caption': lambda x: validate_content_length(x, 'Image caption', 200) if x else True,
    'location': lambda x: validate_content_length(x, 'Location', 100) if x else True
}

MATCH_SCHEMA = {
    'title': lambda x: validate_content_length(x, 'Match title', 200),
    'description': lambda x: validate_content_length(x, 'Description', 1000) if x else True,
    'location': lambda x: validate_content_length(x, 'Location', 200),
    'venue': lambda x: validate_content_length(x, 'Venue', 200) if x else True,
    'match_type': validate_match_type,
    'players_needed': validate_players_needed,
    'entry_fee': validate_entry_fee
}

def validate_schema(data, schema):
    """Validate data against a schema"""
    for field, validator in schema.items():
        if field in data and data[field] is not None:
            validator(data[field])
