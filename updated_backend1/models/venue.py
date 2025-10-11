from .base import BaseModel, db
from datetime import datetime
import uuid

class VenueBooking(BaseModel):
    """Venue booking model"""
    __tablename__ = 'venue_bookings'
    
    venue_profile_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('page_profiles.page_id'), nullable=False)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    booking_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    duration_hours = db.Column(db.Float, nullable=False)
    total_cost = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20))
    special_requirements = db.Column(db.Text)
    contact_number = db.Column(db.String(20))
    
    def to_dict(self):
        """Convert venue booking to dictionary"""
        data = super().to_dict()
        data['venue_profile_id'] = str(self.venue_profile_id) if self.venue_profile_id else None
        data['user_id'] = str(self.user_id) if self.user_id else None
        data['booking_date'] = self.booking_date.isoformat() if self.booking_date else None
        data['start_time'] = self.start_time.isoformat() if self.start_time else None
        data['end_time'] = self.end_time.isoformat() if self.end_time else None
        return data

class VenueReview(BaseModel):
    """Venue review model"""
    __tablename__ = 'venue_reviews'
    
    venue_profile_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('page_profiles.page_id'), nullable=False)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(200))
    review_text = db.Column(db.Text)
    is_verified = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        """Convert venue review to dictionary"""
        data = super().to_dict()
        data['venue_profile_id'] = str(self.venue_profile_id) if self.venue_profile_id else None
        data['user_id'] = str(self.user_id) if self.user_id else None
        return data
