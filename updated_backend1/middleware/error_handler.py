"""
Comprehensive Error Handling Middleware
"""
import logging
import traceback
from flask import jsonify, request
from werkzeug.exceptions import HTTPException
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ErrorHandler:
    """Centralized error handling for the application"""
    
    @staticmethod
    def handle_exception(e):
        """
        Handle all unhandled exceptions
        """
        # Generate unique error ID for tracking
        error_id = str(uuid.uuid4())[:8]
        
        # Log the error with full traceback
        logger.error(f"🚨 Unhandled Exception [{error_id}]: {str(e)}")
        logger.error(f"🚨 Traceback: {traceback.format_exc()}")
        
        # Get request information
        request_info = {
            'method': request.method if request else 'Unknown',
            'url': request.url if request else 'Unknown',
            'user_agent': request.headers.get('User-Agent', 'Unknown') if request else 'Unknown',
            'remote_addr': request.remote_addr if request else 'Unknown'
        }
        
        logger.error(f"🚨 Request Info: {request_info}")
        
        # Return standardized error response
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'error_id': error_id,
            'message': 'An unexpected error occurred. Please try again.',
            'timestamp': str(uuid.uuid4().time_low)  # Simple timestamp
        }), 500
    
    @staticmethod
    def handle_http_exception(e):
        """
        Handle HTTP exceptions (404, 400, etc.)
        """
        error_id = str(uuid.uuid4())[:8]
        
        logger.warning(f"⚠️ HTTP Exception [{error_id}]: {e.code} - {e.description}")
        
        return jsonify({
            'success': False,
            'error': e.description,
            'error_id': error_id,
            'status_code': e.code,
            'message': f'HTTP {e.code}: {e.description}'
        }), e.code
    
    @staticmethod
    def handle_validation_error(e):
        """
        Handle validation errors
        """
        error_id = str(uuid.uuid4())[:8]
        
        logger.warning(f"⚠️ Validation Error [{error_id}]: {str(e)}")
        
        return jsonify({
            'success': False,
            'error': 'Validation failed',
            'error_id': error_id,
            'details': str(e),
            'message': 'Please check your input and try again.'
        }), 400
    
    @staticmethod
    def handle_database_error(e):
        """
        Handle database-related errors
        """
        error_id = str(uuid.uuid4())[:8]
        
        logger.error(f"🗄️ Database Error [{error_id}]: {str(e)}")
        
        return jsonify({
            'success': False,
            'error': 'Database operation failed',
            'error_id': error_id,
            'message': 'A database error occurred. Please try again later.'
        }), 500
    
    @staticmethod
    def handle_authentication_error(e):
        """
        Handle authentication errors
        """
        error_id = str(uuid.uuid4())[:8]
        
        logger.warning(f"🔐 Authentication Error [{error_id}]: {str(e)}")
        
        return jsonify({
            'success': False,
            'error': 'Authentication failed',
            'error_id': error_id,
            'message': 'Please log in again to continue.'
        }), 401

def register_error_handlers(app):
    """
    Register all error handlers with the Flask app
    """
    
    @app.errorhandler(Exception)
    def handle_general_exception(e):
        """Handle all general exceptions"""
        return ErrorHandler.handle_exception(e)
    
    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        """Handle HTTP exceptions"""
        return ErrorHandler.handle_http_exception(e)
    
    @app.errorhandler(ValueError)
    def handle_value_error(e):
        """Handle value errors"""
        return ErrorHandler.handle_validation_error(e)
    
    @app.errorhandler(KeyError)
    def handle_key_error(e):
        """Handle key errors"""
        return ErrorHandler.handle_validation_error(e)
    
    @app.errorhandler(AttributeError)
    def handle_attribute_error(e):
        """Handle attribute errors"""
        return ErrorHandler.handle_validation_error(e)
    
    # Database-specific error handlers
    @app.errorhandler(Exception)
    def handle_database_exception(e):
        """Handle database exceptions"""
        if 'database' in str(e).lower() or 'sql' in str(e).lower():
            return ErrorHandler.handle_database_error(e)
        return ErrorHandler.handle_exception(e)
    
    logger.info("✅ Error handlers registered successfully")


