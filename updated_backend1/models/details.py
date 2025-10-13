from .base import db
from datetime import datetime
import uuid
import json

class AcademyDetails(db.Model):
    """Academy-specific details table"""
    __tablename__ = 'academy_details'
    
    page_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('page_profiles.page_id'), primary_key=True)
    academy_type = db.Column(db.String(50), nullable=False)
    level = db.Column(db.String(50), nullable=False)
    established_year = db.Column(db.Integer)
    accreditation = db.Column(db.String(200))
    equipment_provided = db.Column(db.Boolean, default=False)
    coaching_staff_count = db.Column(db.Integer, default=0)
    programs_offered = db.Column(db.Text)  # JSON string
    age_groups = db.Column(db.String(100))
    batch_timings = db.Column(db.Text)  # JSON string
    fees_structure = db.Column(db.Text)  # JSON string
    total_students = db.Column(db.Integer, default=0)
    successful_placements = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'))
    updated_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        """Convert academy details to dictionary"""
        data = {
            'page_id': str(self.page_id) if self.page_id else None,
            'academy_type': self.academy_type,
            'level': self.level,
            'established_year': self.established_year,
            'accreditation': self.accreditation,
            'equipment_provided': self.equipment_provided,
            'coaching_staff_count': self.coaching_staff_count,
            'age_groups': self.age_groups,
            'total_students': self.total_students,
            'successful_placements': self.successful_placements
        }
        
        # Parse JSON fields
        try:
            data['programs_offered'] = json.loads(self.programs_offered) if self.programs_offered else []
        except:
            data['programs_offered'] = []
            
        try:
            data['batch_timings'] = json.loads(self.batch_timings) if self.batch_timings else []
        except:
            data['batch_timings'] = []
            
        try:
            data['fees_structure'] = json.loads(self.fees_structure) if self.fees_structure else {}
        except:
            data['fees_structure'] = {}
            
        return data

class VenueDetails(db.Model):
    """Venue-specific details table"""
    __tablename__ = 'venue_details'
    
    page_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('page_profiles.page_id'), primary_key=True)
    venue_type = db.Column(db.String(50), nullable=False)
    pitch_type = db.Column(db.String(50), nullable=False)
    capacity = db.Column(db.Integer)
    lighting_available = db.Column(db.Boolean, default=False)
    parking_available = db.Column(db.Boolean, default=False)
    changing_rooms = db.Column(db.Boolean, default=False)
    equipment_rental = db.Column(db.Boolean, default=False)
    booking_rates = db.Column(db.Text)  # JSON string
    amenities = db.Column(db.Text)  # JSON string
    operating_hours = db.Column(db.Text)  # JSON string
    booking_advance_days = db.Column(db.Integer, default=7)
    minimum_booking_hours = db.Column(db.Float, default=1.0)
    maximum_booking_hours = db.Column(db.Float, default=8.0)
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'))
    updated_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        """Convert venue details to dictionary"""
        data = {
            'page_id': str(self.page_id) if self.page_id else None,
            'venue_type': self.venue_type,
            'pitch_type': self.pitch_type,
            'capacity': self.capacity,
            'lighting_available': self.lighting_available,
            'parking_available': self.parking_available,
            'changing_rooms': self.changing_rooms,
            'equipment_rental': self.equipment_rental,
            'booking_advance_days': self.booking_advance_days,
            'minimum_booking_hours': self.minimum_booking_hours,
            'maximum_booking_hours': self.maximum_booking_hours,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        # Parse JSON fields
        try:
            data['booking_rates'] = json.loads(self.booking_rates) if self.booking_rates else {}
        except:
            data['booking_rates'] = {}
            
        try:
            data['amenities'] = json.loads(self.amenities) if self.amenities else []
        except:
            data['amenities'] = []
            
        try:
            data['operating_hours'] = json.loads(self.operating_hours) if self.operating_hours else {}
        except:
            data['operating_hours'] = {}
            
        return data

class CommunityDetails(db.Model):
    """Community-specific details table"""
    __tablename__ = 'community_details'
    
    page_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('page_profiles.page_id'), primary_key=True)
    community_type = db.Column(db.String(50), nullable=False)
    member_count = db.Column(db.Integer, default=0)
    community_rules = db.Column(db.Text)
    meeting_schedule = db.Column(db.Text)  # JSON string
    membership_fee = db.Column(db.Float, default=0)
    membership_duration = db.Column(db.String(50))
    community_events_count = db.Column(db.Integer, default=0)
    active_members = db.Column(db.Integer, default=0)
    community_guidelines = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'))
    updated_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        """Convert community details to dictionary"""
        data = {
            'page_id': str(self.page_id) if self.page_id else None,
            'community_type': self.community_type,
            'member_count': self.member_count,
            'community_rules': self.community_rules,
            'membership_fee': self.membership_fee,
            'membership_duration': self.membership_duration,
            'community_events_count': self.community_events_count,
            'active_members': self.active_members,
            'community_guidelines': self.community_guidelines,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        # Parse JSON fields
        try:
            data['meeting_schedule'] = json.loads(self.meeting_schedule) if self.meeting_schedule else []
        except:
            data['meeting_schedule'] = []
            
        return data
