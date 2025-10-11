"""
Admin Authentication and Authorization Utilities
"""

from functools import wraps
from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from models import AdminUser, AdminPermission, AdminRole
import logging

logger = logging.getLogger(__name__)

def admin_required(f):
    """Decorator to require admin authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            
            if not user_id:
                return jsonify({'error': 'Authentication required'}), 401
            
            admin_user = AdminUser.get_by_user_id(user_id)
            if not admin_user:
                return jsonify({'error': 'Admin access required'}), 403
            
            if not admin_user.is_active:
                return jsonify({'error': 'Admin account is inactive'}), 403
            
            # Add admin user to request context
            request.admin_user = admin_user
            return f(*args, **kwargs)
            
        except Exception as e:
            logger.error(f"Admin authentication error: {str(e)}")
            return jsonify({'error': 'Authentication failed'}), 401
    
    return decorated_function

def permission_required(permission: AdminPermission):
    """Decorator to require specific admin permission"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                verify_jwt_in_request()
                user_id = get_jwt_identity()
                
                if not user_id:
                    return jsonify({'error': 'Authentication required'}), 401
                
                admin_user = AdminUser.get_by_user_id(user_id)
                if not admin_user:
                    return jsonify({'error': 'Admin access required'}), 403
                
                if not admin_user.is_active:
                    return jsonify({'error': 'Admin account is inactive'}), 403
                
                if not admin_user.has_permission(permission):
                    return jsonify({'error': f'Permission required: {permission.value}'}), 403
                
                # Add admin user to request context
                request.admin_user = admin_user
                return f(*args, **kwargs)
                
            except Exception as e:
                logger.error(f"Permission check error: {str(e)}")
                return jsonify({'error': 'Permission check failed'}), 401
        
        return decorated_function
    return decorator

def role_required(role: AdminRole):
    """Decorator to require specific admin role"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                verify_jwt_in_request()
                user_id = get_jwt_identity()
                
                if not user_id:
                    return jsonify({'error': 'Authentication required'}), 401
                
                admin_user = AdminUser.get_by_user_id(user_id)
                if not admin_user:
                    return jsonify({'error': 'Admin access required'}), 403
                
                if not admin_user.is_active:
                    return jsonify({'error': 'Admin account is inactive'}), 403
                
                if admin_user.role != role and admin_user.role != AdminRole.SUPER_ADMIN:
                    return jsonify({'error': f'Role required: {role.value}'}), 403
                
                # Add admin user to request context
                request.admin_user = admin_user
                return f(*args, **kwargs)
                
            except Exception as e:
                logger.error(f"Role check error: {str(e)}")
                return jsonify({'error': 'Role check failed'}), 401
        
        return decorated_function
    return decorator

def super_admin_required(f):
    """Decorator to require super admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            
            if not user_id:
                return jsonify({'error': 'Authentication required'}), 401
            
            admin_user = AdminUser.get_by_user_id(user_id)
            if not admin_user:
                return jsonify({'error': 'Admin access required'}), 403
            
            if not admin_user.is_active:
                return jsonify({'error': 'Admin account is inactive'}), 403
            
            if admin_user.role != AdminRole.SUPER_ADMIN:
                return jsonify({'error': 'Super admin access required'}), 403
            
            # Add admin user to request context
            request.admin_user = admin_user
            return f(*args, **kwargs)
            
        except Exception as e:
            logger.error(f"Super admin check error: {str(e)}")
            return jsonify({'error': 'Super admin check failed'}), 401
    
    return decorated_function

def log_admin_action(action, target_type=None, target_id=None, details=None):
    """Log an admin action"""
    try:
        if hasattr(request, 'admin_user') and request.admin_user:
            AdminLog.log_action(
                admin_id=request.admin_user.id,
                action=action,
                target_type=target_type,
                target_id=target_id,
                details=details,
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
    except Exception as e:
        logger.error(f"Failed to log admin action: {str(e)}")

def get_admin_user():
    """Get current admin user from request context"""
    return getattr(request, 'admin_user', None)

def check_admin_permission(permission: AdminPermission):
    """Check if current admin has specific permission"""
    admin_user = get_admin_user()
    if not admin_user:
        return False
    return admin_user.has_permission(permission)

def check_admin_role(role: AdminRole):
    """Check if current admin has specific role"""
    admin_user = get_admin_user()
    if not admin_user:
        return False
    return admin_user.role == role or admin_user.role == AdminRole.SUPER_ADMIN
