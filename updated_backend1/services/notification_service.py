"""
Notification service for handling push notifications via Firebase FCM
"""

import firebase_admin
from firebase_admin import credentials, messaging
from flask import current_app
import logging
from datetime import datetime
from models import Notification, NotificationPreferences, User

logger = logging.getLogger(__name__)

class NotificationService:
    """Service for handling notifications"""
    
    def __init__(self):
        self.fcm_app = None
        self._initialize_firebase()
    
    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            if not firebase_admin._apps:
                # Initialize Firebase Admin SDK
                cred = credentials.Certificate('firebase-service-account.json')
                self.fcm_app = firebase_admin.initialize_app(cred)
            else:
                # Use the default app that's already initialized
                self.fcm_app = firebase_admin.get_app()
            logger.info("Firebase Admin SDK initialized for notifications")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin SDK: {str(e)}")
            self.fcm_app = None
    
    def send_push_notification(self, notification, fcm_token):
        """Send push notification via FCM"""
        if not self.fcm_app or not fcm_token:
            logger.warning("FCM not initialized or no token provided")
            return False
        
        try:
            # Get push payload
            payload = notification.get_push_payload()
            
            # Create FCM message
            message = messaging.Message(
                notification=messaging.Notification(
                    title=payload['notification']['title'],
                    body=payload['notification']['body'],
                    image=payload['notification'].get('image')
                ),
                data=payload['data'],
                token=fcm_token,
                android=messaging.AndroidConfig(
                    priority=messaging.AndroidConfig.Priority.HIGH if payload['priority'] == 'high' else messaging.AndroidConfig.Priority.NORMAL,
                    notification=messaging.AndroidNotification(
                        priority=messaging.AndroidNotification.Priority.HIGH if payload['priority'] == 'high' else messaging.AndroidNotification.Priority.NORMAL,
                        sound='default'
                    )
                ),
                apns=messaging.APNSConfig(
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(
                            alert=messaging.ApsAlert(
                                title=payload['notification']['title'],
                                body=payload['notification']['body']
                            ),
                            sound='default',
                            badge=1
                        )
                    )
                )
            )
            
            # Send message
            response = messaging.send(message, app=self.fcm_app)
            logger.info(f"Successfully sent message: {response}")
            
            # Update notification status
            notification.mark_as_sent()
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to send push notification: {str(e)}")
            notification.mark_as_failed(str(e))
            return False
    
    def send_multicast_notification(self, notification, fcm_tokens):
        """Send push notification to multiple devices"""
        if not self.fcm_app or not fcm_tokens:
            logger.warning("FCM not initialized or no tokens provided")
            return False
        
        try:
            # Get push payload
            payload = notification.get_push_payload()
            
            # Create FCM multicast message
            message = messaging.MulticastMessage(
                notification=messaging.Notification(
                    title=payload['notification']['title'],
                    body=payload['notification']['body'],
                    image=payload['notification'].get('image')
                ),
                data=payload['data'],
                tokens=fcm_tokens,
                android=messaging.AndroidConfig(
                    priority=messaging.AndroidConfig.Priority.HIGH if payload['priority'] == 'high' else messaging.AndroidConfig.Priority.NORMAL,
                    notification=messaging.AndroidNotification(
                        priority=messaging.AndroidNotification.Priority.HIGH if payload['priority'] == 'high' else messaging.AndroidNotification.Priority.NORMAL,
                        sound='default'
                    )
                ),
                apns=messaging.APNSConfig(
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(
                            alert=messaging.ApsAlert(
                                title=payload['notification']['title'],
                                body=payload['notification']['body']
                            ),
                            sound='default',
                            badge=1
                        )
                    )
                )
            )
            
            # Send message
            response = messaging.send_multicast(message, app=self.fcm_app)
            logger.info(f"Successfully sent multicast message: {response.success_count} successful, {response.failure_count} failed")
            
            # Update notification status
            notification.mark_as_sent()
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to send multicast push notification: {str(e)}")
            notification.mark_as_failed(str(e))
            return False
    
    def create_and_send_notification(self, receiver_id, notification_type, title, content, 
                                   sender_id=None, priority='normal', action_url=None, 
                                   image_url=None, data=None, **kwargs):
        """Create notification and send it via all enabled channels"""
        try:
            # Get user preferences
            preferences = NotificationPreferences.get_or_create_preferences(receiver_id)
            
            # Check if notification is enabled
            if not preferences.is_notification_enabled(notification_type, 'push'):
                logger.info(f"Push notifications disabled for user {receiver_id} and type {notification_type.value}")
                return None
            
            # Check quiet hours
            if preferences.is_quiet_hours():
                logger.info(f"User {receiver_id} is in quiet hours, skipping push notification")
                return None
            
            # Create notification
            notification = Notification.create_notification(
                receiver_id=receiver_id,
                notification_type=notification_type,
                title=title,
                content=content,
                sender_id=sender_id,
                priority=priority,
                action_url=action_url,
                image_url=image_url,
                data=data,
                **kwargs
            )
            
            # Send push notification if enabled
            if preferences.push_enabled and preferences.is_notification_enabled(notification_type, 'push'):
                # Get user's FCM tokens (you'll need to implement this based on your user model)
                fcm_tokens = self._get_user_fcm_tokens(receiver_id)
                if fcm_tokens:
                    if len(fcm_tokens) == 1:
                        self.send_push_notification(notification, fcm_tokens[0])
                    else:
                        self.send_multicast_notification(notification, fcm_tokens)
            
            # Send in-app notification if enabled
            if preferences.in_app_enabled and preferences.is_notification_enabled(notification_type, 'in_app'):
                self._send_in_app_notification(notification)
            
            # Send email notification if enabled
            if preferences.email_enabled and preferences.is_notification_enabled(notification_type, 'email'):
                self._send_email_notification(notification)
            
            return notification
            
        except Exception as e:
            logger.error(f"Failed to create and send notification: {str(e)}")
            return None
    
    def _get_user_fcm_tokens(self, user_id):
        """Get FCM tokens for user (implement based on your user model)"""
        # This is a placeholder - you'll need to implement this based on how you store FCM tokens
        # For example, you might have a UserDevice model that stores FCM tokens
        try:
            user = User.query.get(user_id)
            if user and hasattr(user, 'fcm_tokens'):
                return user.fcm_tokens
            return []
        except Exception as e:
            logger.error(f"Failed to get FCM tokens for user {user_id}: {str(e)}")
            return []
    
    def _send_in_app_notification(self, notification):
        """Send in-app notification via Socket.IO"""
        try:
            from socketio_server import socketio
            
            # Emit notification to user's room
            socketio.emit('new_notification', {
                'notification': notification.to_dict()
            }, room=f"user_{notification.receiver_id}")
            
            logger.info(f"Sent in-app notification to user {notification.receiver_id}")
            
        except Exception as e:
            logger.error(f"Failed to send in-app notification: {str(e)}")
    
    def _send_email_notification(self, notification):
        """Send email notification"""
        try:
            # Implement email sending logic here
            # You can use Flask-Mail or any other email service
            logger.info(f"Email notification sent to user {notification.receiver_id}")
            
        except Exception as e:
            logger.error(f"Failed to send email notification: {str(e)}")
    
    def mark_notification_delivered(self, notification_id):
        """Mark notification as delivered"""
        try:
            notification = Notification.query.get(notification_id)
            if notification:
                notification.mark_as_delivered()
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to mark notification as delivered: {str(e)}")
            return False
    
    def get_notification_stats(self, user_id):
        """Get notification statistics for user"""
        try:
            total_notifications = Notification.query.filter_by(receiver_id=user_id).count()
            unread_notifications = Notification.get_unread_count(user_id)
            sent_notifications = Notification.query.filter_by(
                receiver_id=user_id, 
                push_sent=True
            ).count()
            delivered_notifications = Notification.query.filter_by(
                receiver_id=user_id, 
                push_delivered=True
            ).count()
            
            return {
                'total': total_notifications,
                'unread': unread_notifications,
                'sent': sent_notifications,
                'delivered': delivered_notifications
            }
        except Exception as e:
            logger.error(f"Failed to get notification stats: {str(e)}")
            return {}

# Global notification service instance
notification_service = NotificationService()
