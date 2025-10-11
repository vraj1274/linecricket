from flask import Blueprint, request, jsonify, current_app
from models import Notification, NotificationType, db
import logging

logger = logging.getLogger(__name__)

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/', methods=['GET'])
def get_notifications():
    """Get all notifications for current user"""
    try:
        user_id = 1  # 1 - using test user ID
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        
        query = Notification.query.filter_by(receiver_id=user_id)
        
        if unread_only:
            query = query.filter_by(is_read=False)
        
        notifications = query.order_by(Notification.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'notifications': [notification.to_dict() for notification in notifications.items],
            'pagination': {
                'page': notifications.page,
                'pages': notifications.pages,
                'per_page': notifications.per_page,
                'total': notifications.total,
                'has_next': notifications.has_next,
                'has_prev': notifications.has_prev
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Get notifications error: {e}")
        return jsonify({'error': 'Failed to fetch notifications'}), 500

@notifications_bp.route('/<int:notification_id>', methods=['GET'])
def get_notification(notification_id):
    """Get a specific notification"""
    try:
        user_id = 1  # 1 - using test user ID
        notification = Notification.get_by_id(notification_id)
        
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        if notification.receiver_id != user_id:
            return jsonify({'error': 'Unauthorized to access this notification'}), 403
        
        return jsonify({
            'notification': notification.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Get notification error: {e}")
        return jsonify({'error': 'Failed to fetch notification'}), 500

@notifications_bp.route('/<int:notification_id>/read', methods=['POST'])
def mark_notification_read(notification_id):
    """Mark a notification as read"""
    try:
        user_id = 1  # 1 - using test user ID
        notification = Notification.get_by_id(notification_id)
        
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        if notification.receiver_id != user_id:
            return jsonify({'error': 'Unauthorized to access this notification'}), 403
        
        notification.mark_as_read()
        
        return jsonify({
            'message': 'Notification marked as read',
            'notification': notification.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Mark notification read error: {e}")
        return jsonify({'error': 'Failed to mark notification as read'}), 500

@notifications_bp.route('/mark-all-read', methods=['POST'])
def mark_all_notifications_read():
    """Mark all notifications as read for current user"""
    try:
        user_id = 1  # 1 - using test user ID
        
        # Update all unread notifications
        Notification.query.filter_by(
            receiver_id=user_id,
            is_read=False
        ).update({'is_read': True, 'read_at': db.func.now()})
        db.session.commit()
        
        return jsonify({'message': 'All notifications marked as read'}), 200
        
    except Exception as e:
        logger.error(f"Mark all notifications read error: {e}")
        return jsonify({'error': 'Failed to mark all notifications as read'}), 500

@notifications_bp.route('/unread-count', methods=['GET'])
def get_unread_count():
    """Get unread notification count for current user"""
    try:
        user_id = 1  # 1 - using test user ID
        
        unread_count = Notification.query.filter_by(
            receiver_id=user_id,
            is_read=False
        ).count()
        
        return jsonify({
            'unread_count': unread_count
        }), 200
        
    except Exception as e:
        logger.error(f"Get unread count error: {e}")
        return jsonify({'error': 'Failed to get unread count'}), 500

@notifications_bp.route('/<int:notification_id>', methods=['DELETE'])
def delete_notification(notification_id):
    """Delete a notification"""
    try:
        user_id = 1  # 1 - using test user ID
        notification = Notification.get_by_id(notification_id)
        
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        if notification.receiver_id != user_id:
            return jsonify({'error': 'Unauthorized to delete this notification'}), 403
        
        notification.delete()
        
        return jsonify({'message': 'Notification deleted successfully'}), 200
        
    except Exception as e:
        logger.error(f"Delete notification error: {e}")
        return jsonify({'error': 'Failed to delete notification'}), 500

@notifications_bp.route('/clear-all', methods=['DELETE'])
def clear_all_notifications():
    """Clear all notifications for current user"""
    try:
        user_id = 1  # 1 - using test user ID
        
        # Delete all notifications for user
        Notification.query.filter_by(receiver_id=user_id).delete()
        db.session.commit()
        
        return jsonify({'message': 'All notifications cleared'}), 200
        
    except Exception as e:
        logger.error(f"Clear all notifications error: {e}")
        return jsonify({'error': 'Failed to clear all notifications'}), 500
