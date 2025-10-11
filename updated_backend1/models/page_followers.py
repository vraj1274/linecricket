from .base import BaseModel, db
from datetime import datetime
import uuid
from .enums import PageType

class PageFollower(BaseModel):
    """Consolidated page followers model for all page types"""
    __tablename__ = 'page_followers'
    
    page_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('page_profiles.page_id'), nullable=False)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    follower_type = db.Column(db.String(20), nullable=False)
    page_type = db.Column(db.Enum(PageType), nullable=False)
    
    # Membership/Following details
    joined_date = db.Column(db.Date, default=datetime.utcnow)
    role = db.Column(db.String(50), default='member')
    status = db.Column(db.String(20), default='active')
    is_approved = db.Column(db.Boolean, default=True)
    
    # Profile references for different follower types
    community_profile_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('page_profiles.page_id'), nullable=True)
    academy_profile_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('page_profiles.page_id'), nullable=True)
    venue_profile_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('page_profiles.page_id'), nullable=True)
    
    # Academy specific fields
    student_name = db.Column(db.String(100))
    age = db.Column(db.Integer)
    level = db.Column(db.String(50))
    enrollment_date = db.Column(db.Date)
    
    # Community specific fields
    membership_fee = db.Column(db.Float)
    membership_duration = db.Column(db.String(50))
    
    # Venue specific fields
    booking_preferences = db.Column(db.String(500))
    notification_preferences = db.Column(db.String(500))
    
    # Follower engagement
    engagement_score = db.Column(db.Float, default=0.0)
    last_active = db.Column(db.DateTime)
    interaction_count = db.Column(db.Integer, default=0)
    
    # Invitation and approval
    invited_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=True)
    invitation_sent_at = db.Column(db.DateTime)
    invitation_accepted_at = db.Column(db.DateTime)
    approved_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=True)
    approval_notes = db.Column(db.Text)
    
    # Follower preferences
    notification_settings = db.Column(db.String(500))
    privacy_settings = db.Column(db.String(500))
    
    # Additional metadata
    follower_notes = db.Column(db.Text)
    tags = db.Column(db.String(500))
    priority = db.Column(db.Integer, default=0)
    
    # Constraints
    __table_args__ = (
        db.UniqueConstraint('page_id', 'user_id', name='unique_page_follower'),
    )
    
    def to_dict(self):
        """Convert follower to dictionary"""
        data = super().to_dict()
        data['page_id'] = str(self.page_id) if self.page_id else None
        data['user_id'] = str(self.user_id) if self.user_id else None
        data['follower_type'] = self.follower_type.value if self.follower_type else None
        data['page_type'] = self.page_type.value if self.page_type else None
        data['role'] = self.role.value if self.role else None
        data['status'] = self.status.value if self.status else None
        data['joined_date'] = self.joined_date.isoformat() if self.joined_date else None
        data['enrollment_date'] = self.enrollment_date.isoformat() if self.enrollment_date else None
        data['last_active'] = self.last_active.isoformat() if self.last_active else None
        data['invitation_sent_at'] = self.invitation_sent_at.isoformat() if self.invitation_sent_at else None
        data['invitation_accepted_at'] = self.invitation_accepted_at.isoformat() if self.invitation_accepted_at else None
        
        return data
    
    @classmethod
    def get_followers_by_page(cls, page_id, page_type=None, status=None):
        """Get followers for a specific page"""
        query = cls.query.filter_by(page_id=page_id)
        
        if page_type:
            query = query.filter_by(page_type=page_type)
        if status:
            query = query.filter_by(status=status)
            
        return query.all()
    
    @classmethod
    def get_followers_by_user(cls, user_id, follower_type=None):
        """Get pages followed by a user"""
        query = cls.query.filter_by(user_id=user_id)
        
        if follower_type:
            query = query.filter_by(follower_type=follower_type)
            
        return query.all()
    
    @classmethod
    def is_follower(cls, page_id, user_id):
        """Check if user is a follower of the page"""
        return cls.query.filter_by(page_id=page_id, user_id=user_id).first() is not None
