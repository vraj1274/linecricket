from flask import Blueprint, request, jsonify
from models import db, Notification, NotificationPreferences, NotificationType, NotificationPriority, User
from services.notification_service import notification_service
from datetime import datetime

notification_bp = Blueprint('notification_routes', __name__)

@notification_bp.route('/notifications', methods=['GET'])
def get_notifications():
    """Get notifications for current user"""
    try:
        current_user_id = 1  # 1 - using test user ID
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        notification_type = request.args.get('type')
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        
        # Parse notification type if provided
        parsed_type = None
        if notification_type:
            try:
                parsed_type = NotificationType(notification_type)
            except ValueError:
                return jsonify({'error': 'Invalid notification type'}), 400
        
        # Get notifications
        pagination = Notification.get_user_notifications(
            user_id=current_user_id,
            page=page,
            per_page=per_page,
            notification_type=parsed_type,
            unread_only=unread_only
        )
        
        notifications = [notification.to_dict() for notification in pagination.items]
        
        return jsonify({
            'notifications': notifications,
            'pagination': {
                'page': pagination.page,
                'per_page': pagination.per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notification_bp.route('/notifications/unread-count', methods=['GET'])
def get_unread_count():
    """Get unread notification count for current user"""
    try:
        current_user_id = 1  # 1 - using test user ID
        unread_count = Notification.get_unread_count(current_user_id)
        
        return jsonify({
            'unread_count': unread_count
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notification_bp.route('/notifications/<int:notification_id>/read', methods=['POST'])
def mark_notification_read(notification_id):
    """Mark a notification as read"""
    try:
        current_user_id = 1  # 1 - using test user ID
        
        notification = Notification.query.get(notification_id)
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        # Check if user owns the notification
        if notification.receiver_id != current_user_id:
            return jsonify({'error': 'Not authorized to mark this notification as read'}), 403
        
        # Mark as read
        notification.mark_as_read()
        
        return jsonify({
            'message': 'Notification marked as read successfully',
            'notification_id': notification_id
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notification_bp.route('/notifications/read-all', methods=['POST'])
def mark_all_notifications_read():
    """Mark all notifications as read for current user"""
    try:
        current_user_id = 1  # 1 - using test user ID
        
        # Mark all unread notifications as read
        unread_notifications = Notification.query.filter_by(
            receiver_id=current_user_id,
            is_read=False
        ).all()
        
        for notification in unread_notifications:
            notification.mark_as_read()
        
        return jsonify({
            'message': f'Marked {len(unread_notifications)} notifications as read',
            'count': len(unread_notifications)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notification_bp.route('/notifications/<int:notification_id>', methods=['DELETE'])
def delete_notification(notification_id):
    """Delete a notification"""
    try:
        current_user_id = 1  # 1 - using test user ID
        
        notification = Notification.query.get(notification_id)
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        # Check if user owns the notification
        if notification.receiver_id != current_user_id:
            return jsonify({'error': 'Not authorized to delete this notification'}), 403
        
        # Delete notification
        db.session.delete(notification)
        db.session.commit()
        
        return jsonify({
            'message': 'Notification deleted successfully',
            'notification_id': notification_id
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notification_bp.route('/notifications/preferences', methods=['GET'])
def get_notification_preferences():
    """Get notification preferences for current user"""
    try:
        current_user_id = 1  # 1 - using test user ID
        
        preferences = NotificationPreferences.get_or_create_preferences(current_user_id)
        
        return jsonify({
            'preferences': preferences.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notification_bp.route('/notifications/preferences', methods=['PUT'])
def update_notification_preferences():
    """Update notification preferences for current user"""
    try:
        current_user_id = 1  # 1 - using test user ID
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        preferences = NotificationPreferences.get_or_create_preferences(current_user_id)
        
        # Update preferences
        for key, value in data.items():
            if hasattr(preferences, key):
                setattr(preferences, key, value)
        
        preferences.save()
        
        return jsonify({
            'message': 'Notification preferences updated successfully',
            'preferences': preferences.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notification_bp.route('/notifications/test', methods=['POST'])
def send_test_notification():
    """Send a test notification to current user"""
    try:
        current_user_id = 1  # 1 - using test user ID
        data = request.get_json()
        
        title = data.get('title', 'Test Notification')
        content = data.get('content', 'This is a test notification')
        notification_type = data.get('type', 'system_announcement')
        
        # Parse notification type
        try:
            parsed_type = NotificationType(notification_type)
        except ValueError:
            return jsonify({'error': 'Invalid notification type'}), 400
        
        # Create and send test notification
        notification = notification_service.create_and_send_notification(
            receiver_id=current_user_id,
            notification_type=parsed_type,
            title=title,
            content=content,
            priority='normal',
            action_url='/notifications'
        )
        
        if notification:
            return jsonify({
                'message': 'Test notification sent successfully',
                'notification': notification.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Failed to send test notification'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notification_bp.route('/notifications/stats', methods=['GET'])
def get_notification_stats():
    """Get notification statistics for current user"""
    try:
        current_user_id = 1  # 1 - using test user ID
        
        stats = notification_service.get_notification_stats(current_user_id)
        
        return jsonify({
            'stats': stats
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notification_bp.route('/notifications/bulk-action', methods=['POST'])
def bulk_notification_action():
    """Perform bulk action on notifications"""
    try:
        current_user_id = 1  # 1 - using test user ID
        data = request.get_json()
        
        action = data.get('action')  # 'read', 'delete', 'unread'
        notification_ids = data.get('notification_ids', [])
        
        if not action or not notification_ids:
            return jsonify({'error': 'Action and notification_ids are required'}), 400
        
        # Get notifications
        notifications = Notification.query.filter(
            Notification.id.in_(notification_ids),
            Notification.receiver_id == current_user_id
        ).all()
        
        if not notifications:
            return jsonify({'error': 'No notifications found'}), 404
        
        # Perform action
        count = 0
        if action == 'read':
            for notification in notifications:
                if not notification.is_read:
                    notification.mark_as_read()
                    count += 1
        elif action == 'delete':
            for notification in notifications:
                db.session.delete(notification)
                count += 1
            db.session.commit()
        elif action == 'unread':
            for notification in notifications:
                if notification.is_read:
                    notification.is_read = False
                    notification.read_at = None
                    notification.status = 'sent'
                    count += 1
            db.session.commit()
        else:
            return jsonify({'error': 'Invalid action'}), 400
        
        return jsonify({
            'message': f'Bulk action completed successfully',
            'action': action,
            'count': count
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notification_bp.route('/notifications/types', methods=['GET'])
def get_notification_types():
    """Get available notification types"""
    try:
        types = [{'value': t.value, 'label': t.value.replace('_', ' ').title()} for t in NotificationType]
        priorities = [{'value': p.value, 'label': p.value.title()} for p in NotificationPriority]
        
        return jsonify({
            'types': types,
            'priorities': priorities
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500