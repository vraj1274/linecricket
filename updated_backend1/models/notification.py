from .base import BaseModel, db
from datetime import datetime
from .enums import NotificationType, NotificationPriority, NotificationStatus

class Notification(BaseModel):
    """Notification model for user notifications"""
    __tablename__ = 'notifications'
    
    sender_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    receiver_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.Enum(NotificationType), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    read_at = db.Column(db.DateTime)
    
    # Optional reference to related objects
    related_post_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('posts.id'), nullable=True)
    related_match_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('matches.id'), nullable=True)
    related_message_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('messages.id'), nullable=True)
    
    def to_dict(self):
        """Convert notification to dictionary with sender info"""
        data = super().to_dict()
        data['type'] = self.type.value if self.type else None
        if self.sender:
            data['sender'] = {
                'id': self.sender.id,
                'username': self.sender.username,
                'profile': self.sender.profile.to_dict() if self.sender.profile else None
            }
        return data
    
    def mark_as_read(self):
        """Mark notification as read"""
        self.is_read = True
        self.read_at = datetime.utcnow()
        self.save()
        return self
    
    def get_push_payload(self):
        """Get push notification payload"""
        return {
            'notification': {
                'title': self.title,
                'body': self.content
            },
            'data': {
                'notification_id': str(self.id),
                'type': self.type.value,
                'related_post_id': str(self.related_post_id) if self.related_post_id else None,
                'related_match_id': str(self.related_match_id) if self.related_match_id else None,
                'related_message_id': str(self.related_message_id) if self.related_message_id else None
            }
        }
    
    @classmethod
    def create_notification(cls, receiver_id, notification_type, title, content, sender_id=None, 
                          **kwargs):
        """Create a new notification"""
        notification = cls(
            sender_id=sender_id,
            receiver_id=receiver_id,
            type=notification_type,
            title=title,
            content=content,
            **kwargs
        )
        notification.save()
        return notification
    
    @classmethod
    def get_unread_count(cls, user_id):
        """Get unread notification count for user"""
        return cls.query.filter_by(receiver_id=user_id, is_read=False).count()
    
    @classmethod
    def get_user_notifications(cls, user_id, page=1, per_page=20, notification_type=None, unread_only=False):
        """Get paginated notifications for user"""
        query = cls.query.filter_by(receiver_id=user_id)
        
        if notification_type:
            query = query.filter_by(type=notification_type)
        
        if unread_only:
            query = query.filter_by(is_read=False)
        
        query = query.order_by(cls.created_at.desc())
        
        return query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

class NotificationPreferences(BaseModel):
    """User notification preferences model"""
    __tablename__ = 'notification_preferences'
    
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False, unique=True)
    
    # Push notification settings
    push_enabled = db.Column(db.Boolean, default=True)
    push_likes = db.Column(db.Boolean, default=True)
    push_comments = db.Column(db.Boolean, default=True)
    push_follows = db.Column(db.Boolean, default=True)
    push_messages = db.Column(db.Boolean, default=True)
    push_matches = db.Column(db.Boolean, default=True)
    push_achievements = db.Column(db.Boolean, default=True)
    push_mentions = db.Column(db.Boolean, default=True)
    push_system = db.Column(db.Boolean, default=True)
    
    # In-app notification settings
    in_app_enabled = db.Column(db.Boolean, default=True)
    in_app_likes = db.Column(db.Boolean, default=True)
    in_app_comments = db.Column(db.Boolean, default=True)
    in_app_follows = db.Column(db.Boolean, default=True)
    in_app_messages = db.Column(db.Boolean, default=True)
    in_app_matches = db.Column(db.Boolean, default=True)
    in_app_achievements = db.Column(db.Boolean, default=True)
    in_app_mentions = db.Column(db.Boolean, default=True)
    in_app_system = db.Column(db.Boolean, default=True)
    
    # Email notification settings
    email_enabled = db.Column(db.Boolean, default=False)
    email_likes = db.Column(db.Boolean, default=False)
    email_comments = db.Column(db.Boolean, default=False)
    email_follows = db.Column(db.Boolean, default=False)
    email_messages = db.Column(db.Boolean, default=False)
    email_matches = db.Column(db.Boolean, default=False)
    email_achievements = db.Column(db.Boolean, default=True)
    email_mentions = db.Column(db.Boolean, default=True)
    email_system = db.Column(db.Boolean, default=True)
    
    # Quiet hours
    quiet_hours_enabled = db.Column(db.Boolean, default=False)
    quiet_hours_start = db.Column(db.Time, default=None)  # e.g., "22:00"
    quiet_hours_end = db.Column(db.Time, default=None)    # e.g., "08:00"
    
    def to_dict(self):
        """Convert preferences to dictionary"""
        data = super().to_dict()
        return data
    
    def is_notification_enabled(self, notification_type, delivery_method='push'):
        """Check if notification type is enabled for delivery method"""
        if delivery_method == 'push':
            if not self.push_enabled:
                return False
            return getattr(self, f'push_{notification_type.value}', True)
        elif delivery_method == 'in_app':
            if not self.in_app_enabled:
                return False
            return getattr(self, f'in_app_{notification_type.value}', True)
        elif delivery_method == 'email':
            if not self.email_enabled:
                return False
            return getattr(self, f'email_{notification_type.value}', True)
        return False
    
    def is_quiet_hours(self):
        """Check if current time is within quiet hours"""
        if not self.quiet_hours_enabled or not self.quiet_hours_start or not self.quiet_hours_end:
            return False
        
        from datetime import datetime, time
        now = datetime.now().time()
        
        if self.quiet_hours_start <= self.quiet_hours_end:
            # Same day quiet hours (e.g., 22:00 to 08:00)
            return self.quiet_hours_start <= now <= self.quiet_hours_end
        else:
            # Overnight quiet hours (e.g., 22:00 to 08:00)
            return now >= self.quiet_hours_start or now <= self.quiet_hours_end
    
    @classmethod
    def get_or_create_preferences(cls, user_id):
        """Get or create notification preferences for user"""
        preferences = cls.query.filter_by(user_id=user_id).first()
        if not preferences:
            preferences = cls(user_id=user_id)
            preferences.save()
        return preferences
