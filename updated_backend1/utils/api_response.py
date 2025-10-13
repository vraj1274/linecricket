"""
API Response Utilities
"""
import logging
from flask import jsonify
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

class APIResponse:
    """Standardized API response utilities"""
    
    @staticmethod
    def success(data=None, message="Operation successful", status_code=200):
        """
        Create a standardized success response
        """
        response = {
            'success': True,
            'message': message,
            'timestamp': datetime.utcnow().isoformat(),
            'status_code': status_code
        }
        
        if data is not None:
            response['data'] = data
            
        return jsonify(response), status_code
    
    @staticmethod
    def error(message="Operation failed", details=None, status_code=400, error_type=None):
        """
        Create a standardized error response
        """
        error_id = str(uuid.uuid4())[:8]
        
        response = {
            'success': False,
            'error': message,
            'error_id': error_id,
            'timestamp': datetime.utcnow().isoformat(),
            'status_code': status_code
        }
        
        if details:
            response['details'] = details
            
        if error_type:
            response['error_type'] = error_type
            
        # Log the error
        logger.error(f"❌ API Error [{error_id}]: {message}")
        if details:
            logger.error(f"❌ Error Details: {details}")
            
        return jsonify(response), status_code
    
    @staticmethod
    def validation_error(field_errors, message="Validation failed"):
        """
        Create a validation error response
        """
        error_id = str(uuid.uuid4())[:8]
        
        response = {
            'success': False,
            'error': message,
            'error_id': error_id,
            'validation_errors': field_errors,
            'timestamp': datetime.utcnow().isoformat(),
            'status_code': 400
        }
        
        logger.warning(f"⚠️ Validation Error [{error_id}]: {message}")
        logger.warning(f"⚠️ Field Errors: {field_errors}")
        
        return jsonify(response), 400
    
    @staticmethod
    def not_found(resource="Resource", resource_id=None):
        """
        Create a not found error response
        """
        message = f"{resource} not found"
        if resource_id:
            message += f" (ID: {resource_id})"
            
        return APIResponse.error(
            message=message,
            status_code=404,
            error_type="NotFoundError"
        )
    
    @staticmethod
    def unauthorized(message="Authentication required"):
        """
        Create an unauthorized error response
        """
        return APIResponse.error(
            message=message,
            status_code=401,
            error_type="UnauthorizedError"
        )
    
    @staticmethod
    def forbidden(message="Access denied"):
        """
        Create a forbidden error response
        """
        return APIResponse.error(
            message=message,
            status_code=403,
            error_type="ForbiddenError"
        )
    
    @staticmethod
    def server_error(message="Internal server error", details=None):
        """
        Create a server error response
        """
        return APIResponse.error(
            message=message,
            details=details,
            status_code=500,
            error_type="ServerError"
        )
    
    @staticmethod
    def paginated_response(data, page, per_page, total, message="Data retrieved successfully"):
        """
        Create a paginated response
        """
        total_pages = (total + per_page - 1) // per_page
        
        response = {
            'success': True,
            'message': message,
            'data': data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'total_pages': total_pages,
                'has_next': page < total_pages,
                'has_prev': page > 1
            },
            'timestamp': datetime.utcnow().isoformat(),
            'status_code': 200
        }
        
        return jsonify(response), 200

class ValidationHelper:
    """Validation utilities"""
    
    @staticmethod
    def validate_uuid(uuid_string, field_name="ID"):
        """
        Validate UUID format
        """
        try:
            uuid.UUID(uuid_string)
            return True, None
        except ValueError:
            return False, f"Invalid {field_name} format"
    
    @staticmethod
    def validate_required_fields(data, required_fields):
        """
        Validate required fields in request data
        """
        missing_fields = []
        for field in required_fields:
            if field not in data or not data[field]:
                missing_fields.append(field)
        
        if missing_fields:
            return False, f"Missing required fields: {', '.join(missing_fields)}"
        
        return True, None
    
    @staticmethod
    def validate_email(email):
        """
        Basic email validation
        """
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @staticmethod
    def validate_phone(phone):
        """
        Basic phone validation
        """
        import re
        # Remove all non-digit characters
        digits_only = re.sub(r'\D', '', phone)
        # Check if it has 10-15 digits
        return 10 <= len(digits_only) <= 15


