from .base import BaseModel, db
from datetime import datetime
import uuid

class CommunityEvent(BaseModel):
    """Community event model"""
    __tablename__ = 'community_events'
    
    community_profile_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('page_profiles.page_id'), nullable=False)
    event_name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    event_date = db.Column(db.Date, nullable=False)
    event_time = db.Column(db.Time, nullable=False)
    location = db.Column(db.String(200))
    max_participants = db.Column(db.Integer)
    registration_fee = db.Column(db.Float)
    registration_deadline = db.Column(db.Date)
    is_public = db.Column(db.Boolean, default=True)
    status = db.Column(db.String(20))
    
    def to_dict(self):
        """Convert community event to dictionary"""
        data = super().to_dict()
        data['community_profile_id'] = str(self.community_profile_id) if self.community_profile_id else None
        data['event_date'] = self.event_date.isoformat() if self.event_date else None
        data['event_time'] = self.event_time.isoformat() if self.event_time else None
        data['registration_deadline'] = self.registration_deadline.isoformat() if self.registration_deadline else None
        return data

class CommunityReview(BaseModel):
    """Community review model"""
    __tablename__ = 'community_reviews'
    
    community_profile_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('page_profiles.page_id'), nullable=False)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(200))
    review_text = db.Column(db.Text)
    is_verified = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        """Convert community review to dictionary"""
        data = super().to_dict()
        data['community_profile_id'] = str(self.community_profile_id) if self.community_profile_id else None
        data['user_id'] = str(self.user_id) if self.user_id else None
        return data

class Connection(BaseModel):
    """Connection model for user connections"""
    __tablename__ = 'connections'
    
    requester_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    addressee_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    
    def to_dict(self):
        """Convert connection to dictionary"""
        data = super().to_dict()
        data['requester_id'] = str(self.requester_id) if self.requester_id else None
        data['addressee_id'] = str(self.addressee_id) if self.addressee_id else None
        return data
