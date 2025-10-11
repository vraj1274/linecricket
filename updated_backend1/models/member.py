from .base import BaseModel, db
from datetime import datetime
from sqlalchemy import text

class Member(BaseModel):
    """Member model for team members"""
    __tablename__ = 'members'
    
    # Override the id field from BaseModel since we use member_id as primary key
    id = None
    member_id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=db.text('uuid_generate_v4()'))
    page_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('page_profiles.page_id'), nullable=False)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    role = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='pending')
    permissions = db.Column(db.JSON)
    bio = db.Column(db.Text)
    profile_image_url = db.Column(db.String(500))
    join_date = db.Column(db.Date)
    last_active = db.Column(db.DateTime)
    invited_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'))
    invited_at = db.Column(db.DateTime)
    accepted_at = db.Column(db.DateTime)
    is_verified = db.Column(db.Boolean, default=False)
    
    # Relationships (commented out for tables that don't exist yet)
    # page = db.relationship('ProfilePage', backref='members')
    # user = db.relationship('User', foreign_keys=[user_id], backref='memberships')
    # inviter = db.relationship('User', foreign_keys=[invited_by], backref='invited_members')
    
    def to_dict(self):
        """Convert member to dictionary"""
        return {
            'member_id': str(self.member_id) if self.member_id else None,
            'page_id': str(self.page_id) if self.page_id else None,
            'user_id': str(self.user_id) if self.user_id else None,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'status': self.status,
            'permissions': self.permissions,
            'bio': self.bio,
            'profile_image_url': self.profile_image_url,
            'join_date': self.join_date.isoformat() if self.join_date else None,
            'last_active': self.last_active.isoformat() if self.last_active else None,
            'invited_by': str(self.invited_by) if self.invited_by else None,
            'invited_at': self.invited_at.isoformat() if self.invited_at else None,
            'accepted_at': self.accepted_at.isoformat() if self.accepted_at else None,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

