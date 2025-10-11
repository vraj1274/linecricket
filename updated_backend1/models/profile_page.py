from .base import db
from datetime import datetime
import uuid
import json
from .enums import AcademyType, AcademyLevel, PageType

class ProfilePage(db.Model):
    """Profile page model for academies, clubs, communities, and pitches"""
    __tablename__ = 'page_profiles'
    
    # Primary key as page_id (matching schema)
    page_id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Foreign key to user account
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    
    # Authentication fields
    firebase_uid = db.Column(db.String(255))
    cognito_user_id = db.Column(db.String(255))
    
    # Basic Information
    academy_name = db.Column(db.String(200), nullable=False)
    tagline = db.Column(db.String(300))
    description = db.Column(db.Text)
    bio = db.Column(db.Text)
    
    # Contact Information
    contact_person = db.Column(db.String(100))
    contact_number = db.Column(db.String(20))
    email = db.Column(db.String(255))
    website = db.Column(db.String(500))
    
    # Location Information
    address = db.Column(db.Text)
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    country = db.Column(db.String(100))
    pincode = db.Column(db.String(20))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    
    # Academy Details
    academy_type = db.Column(db.String(50), nullable=True)  # Made nullable for other types
    level = db.Column(db.String(50), nullable=True)  # Made nullable for other types
    established_year = db.Column(db.Integer)
    accreditation = db.Column(db.String(200))  # BCCI, State Association, etc.
    
    # Venue-specific fields
    venue_type = db.Column(db.String(50), nullable=True)
    ground_type = db.Column(db.String(50), nullable=True)
    capacity = db.Column(db.Integer, nullable=True)
    ground_length = db.Column(db.Float, nullable=True)
    ground_width = db.Column(db.Float, nullable=True)
    
    # Community-specific fields
    community_type = db.Column(db.String(50), nullable=True)
    max_members = db.Column(db.Integer, nullable=True)
    membership_fee = db.Column(db.Float, nullable=True)
    membership_duration = db.Column(db.String(100), nullable=True)
    
    page_type = db.Column(db.String(50), nullable=False)
    
    # Profile Media
    logo_url = db.Column(db.String(500))
    banner_image_url = db.Column(db.String(500))
    gallery_images = db.Column(db.Text)  # JSON string of image URLs
    
    # Facilities and Services
    facilities = db.Column(db.Text)  # JSON string of facilities
    services_offered = db.Column(db.Text)  # JSON string of services
    equipment_provided = db.Column(db.Boolean, default=False)
    coaching_staff_count = db.Column(db.Integer, default=0)
    
    # Training Programs
    programs_offered = db.Column(db.Text)  # JSON string of programs
    age_groups = db.Column(db.String(100))  # e.g., "5-18 years"
    batch_timings = db.Column(db.Text)  # JSON string of timings
    fees_structure = db.Column(db.Text)  # JSON string of fees
    
    # Social Media
    instagram_handle = db.Column(db.String(100))
    facebook_handle = db.Column(db.String(100))
    twitter_handle = db.Column(db.String(100))
    youtube_handle = db.Column(db.String(100))
    
    # Statistics and Achievements
    total_students = db.Column(db.Integer, default=0)
    successful_placements = db.Column(db.Integer, default=0)
    achievements = db.Column(db.Text)  # JSON string of achievements
    testimonials = db.Column(db.Text)  # JSON string of testimonials
    
    # Profile Settings
    is_public = db.Column(db.Boolean, default=True)
    allow_messages = db.Column(db.Boolean, default=True)
    show_contact = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    
    # Soft delete
    deleted_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships (commented out for tables that don't exist yet)
    # admins = db.relationship('PageAdmin', backref='profile_page', lazy='dynamic', cascade='all, delete-orphan')
    # students = db.relationship('AcademyStudent', backref='profile_page', lazy='dynamic', cascade='all, delete-orphan')
    # programs = db.relationship('AcademyProgram', backref='profile_page', lazy='dynamic', cascade='all, delete-orphan')
    
    # Detail table relationships (commented out for tables that don't exist yet)
    # academy_details = db.relationship('AcademyDetails', backref='profile_page', uselist=False, cascade='all, delete-orphan')
    # venue_details = db.relationship('VenueDetails', backref='profile_page', uselist=False, cascade='all, delete-orphan')
    # community_details = db.relationship('CommunityDetails', backref='profile_page', uselist=False, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert profile page to dictionary"""
        data = {
            'page_id': str(self.page_id) if self.page_id else None,
            'user_id': str(self.user_id) if self.user_id else None,
            'firebase_uid': self.firebase_uid,
            'cognito_user_id': self.cognito_user_id,
            'academy_name': self.academy_name,
            'tagline': self.tagline,
            'description': self.description,
            'bio': self.bio,
            'contact_person': self.contact_person,
            'contact_number': self.contact_number,
            'email': self.email,
            'website': self.website,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'country': self.country,
            'pincode': self.pincode,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'academy_type': self.academy_type.value if hasattr(self.academy_type, 'value') else self.academy_type,
            'level': self.level.value if hasattr(self.level, 'value') else self.level,
            'established_year': self.established_year,
            'accreditation': self.accreditation,
            'page_type': self.page_type.value if hasattr(self.page_type, 'value') else self.page_type,
            'logo_url': self.logo_url,
            'banner_image_url': self.banner_image_url,
            'gallery_images': self.gallery_images,
            'facilities': self.facilities,
            'services_offered': self.services_offered,
            'equipment_provided': self.equipment_provided,
            'coaching_staff_count': self.coaching_staff_count,
            'programs_offered': self.programs_offered,
            'age_groups': self.age_groups,
            'batch_timings': self.batch_timings,
            'fees_structure': self.fees_structure,
            'instagram_handle': self.instagram_handle,
            'facebook_handle': self.facebook_handle,
            'twitter_handle': self.twitter_handle,
            'youtube_handle': self.youtube_handle,
            'total_students': self.total_students,
            'successful_placements': self.successful_placements,
            'achievements': self.achievements,
            'testimonials': self.testimonials,
            'is_public': self.is_public,
            'allow_messages': self.allow_messages,
            'show_contact': self.show_contact,
            'is_verified': self.is_verified,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_deleted': self.deleted_at is not None
        }
        
        # Parse JSON fields
        try:
            data['facilities'] = json.loads(self.facilities) if self.facilities else []
        except:
            data['facilities'] = []
            
        try:
            data['services_offered'] = json.loads(self.services_offered) if self.services_offered else []
        except:
            data['services_offered'] = []
            
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
            
        try:
            data['achievements'] = json.loads(self.achievements) if self.achievements else []
        except:
            data['achievements'] = []
            
        try:
            data['testimonials'] = json.loads(self.testimonials) if self.testimonials else []
        except:
            data['testimonials'] = []
            
        try:
            data['gallery_images'] = json.loads(self.gallery_images) if self.gallery_images else []
        except:
            data['gallery_images'] = []
            
        return data
    
    def soft_delete(self):
        """Soft delete the academy profile"""
        self.deleted_at = datetime.utcnow()
        db.session.commit()
        return True
    
    def restore(self):
        """Restore a soft-deleted academy profile"""
        self.deleted_at = None
        db.session.commit()
        return True
    
    @classmethod
    def get_active_profiles(cls):
        """Get all non-deleted academy profiles"""
        return cls.query.filter(cls.deleted_at.is_(None)).all()
    
    @classmethod
    def get_by_user_id(cls, user_id):
        """Get profile page by user ID"""
        return cls.query.filter_by(user_id=user_id, deleted_at=None).first()
    
    @classmethod
    def search_by_location(cls, city=None, state=None, country=None):
        """Search academy profiles by location"""
        query = cls.query.filter(cls.deleted_at.is_(None))
        
        if city:
            query = query.filter(cls.city.ilike(f'%{city}%'))
        if state:
            query = query.filter(cls.state.ilike(f'%{state}%'))
        if country:
            query = query.filter(cls.country.ilike(f'%{country}%'))
            
        return query.all()

class PageAdmin(db.Model):
    """Consolidated admins model for all page types"""
    __tablename__ = 'page_admins'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    page_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('page_profiles.page_id'), nullable=False)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    admin_name = db.Column(db.String(100), nullable=False)
    specialization = db.Column(db.String(100))  # Batting, Bowling, Fielding, etc.
    experience_years = db.Column(db.Integer, default=0)
    qualifications = db.Column(db.Text)
    profile_image_url = db.Column(db.JSON)
    bio = db.Column(db.Text)
    admin_role = db.Column(db.String(50), default='admin')
    permissions = db.Column(db.Text)  # JSON string of permissions
    is_active = db.Column(db.Boolean, default=True)
    page_type = db.Column(db.String(50), nullable=False)
    
    # Additional fields from community_admins
    assigned_date = db.Column(db.Date, default=datetime.utcnow)
    is_super_admin = db.Column(db.Boolean, default=False)
    
    # Profile references for different admin types

    # Admin hierarchy and management
    parent_admin_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('page_admins.id'), nullable=True)
    admin_level = db.Column(db.Integer, default=1)
    can_manage_admins = db.Column(db.Boolean, default=False)
    can_manage_content = db.Column(db.Boolean, default=True)
    can_manage_members = db.Column(db.Boolean, default=True)
    can_manage_events = db.Column(db.Boolean, default=True)
    can_manage_bookings = db.Column(db.Boolean, default=False)
    
    # Admin status and notes
    admin_notes = db.Column(db.Text)
    last_active = db.Column(db.DateTime)
    invitation_sent_at = db.Column(db.DateTime)
    invitation_accepted_at = db.Column(db.DateTime)
    
    # Constraints
    __table_args__ = (
        db.UniqueConstraint('page_id', 'user_id', name='unique_page_admin'),
        db.CheckConstraint('admin_level >= 1 AND admin_level <= 5', name='admin_level_range')
    )
    
    def to_dict(self):
        """Convert admin to dictionary"""
        data = super().to_dict()
        data['page_id'] = str(self.page_id) if self.page_id else None
        
        # Parse permissions JSON
        try:
            data['permissions'] = json.loads(self.permissions) if self.permissions else []
        except:
            data['permissions'] = []
            
        return data

class AcademyStudent(db.Model):
    """Students enrolled in a profile page"""
    __tablename__ = 'academy_students'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    academy_profile_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('page_profiles.page_id'), nullable=False)
    student_name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer)
    level = db.Column(db.String(50))
    enrollment_date = db.Column(db.Date, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        """Convert student to dictionary"""
        return {
            'id': str(self.id) if self.id else None,
            'academy_profile_id': str(self.academy_profile_id) if self.academy_profile_id else None,
            'student_name': self.student_name,
            'age': self.age,
            'level': self.level,
            'enrollment_date': self.enrollment_date.isoformat() if self.enrollment_date else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class AcademyProgram(db.Model):
    """Training programs offered by a profile page"""
    __tablename__ = 'academy_programs'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    academy_profile_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('page_profiles.page_id'), nullable=False)
    program_name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    duration_weeks = db.Column(db.Integer)
    age_group = db.Column(db.String(50))
    level = db.Column(db.String(50))
    fees = db.Column(db.Float)
    max_students = db.Column(db.Integer)
    is_active = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        """Convert program to dictionary"""
        return {
            'id': str(self.id) if self.id else None,
            'academy_profile_id': str(self.academy_profile_id) if self.academy_profile_id else None,
            'program_name': self.program_name,
            'description': self.description,
            'duration_weeks': self.duration_weeks,
            'age_group': self.age_group,
            'level': self.level,
            'fees': self.fees,
            'max_students': self.max_students,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class AcademyReview(db.Model):
    """Reviews for academy profiles"""
    __tablename__ = 'academy_reviews'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    academy_profile_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('page_profiles.page_id'), nullable=False)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    title = db.Column(db.String(200))
    review_text = db.Column(db.Text)
    is_verified = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        """Convert review to dictionary"""
        return super().to_dict()