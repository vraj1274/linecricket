from .base import BaseModel, db
from datetime import datetime
from sqlalchemy import text

class Job(BaseModel):
    """Job model for job postings"""
    __tablename__ = 'jobs'
    
    # Override the id field from BaseModel since we use job_id as primary key
    id = None
    job_id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=db.text('uuid_generate_v4()'))
    page_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('page_profiles.page_id'), nullable=False)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(200), nullable=False)
    job_type = db.Column(db.String(50), nullable=False)
    salary_range = db.Column(db.String(100))
    experience_required = db.Column(db.String(50))
    skills_required = db.Column(db.Text)
    benefits = db.Column(db.Text)
    application_deadline = db.Column(db.Date)
    contact_email = db.Column(db.String(255))
    contact_phone = db.Column(db.String(20))
    is_active = db.Column(db.Boolean, default=True)
    is_featured = db.Column(db.Boolean, default=False)
    views_count = db.Column(db.Integer, default=0)
    applications_count = db.Column(db.Integer, default=0)
    
    # Relationships (commented out for tables that don't exist yet)
    # page = db.relationship('ProfilePage', backref='jobs')
    # user = db.relationship('User', backref='posted_jobs')
    # applications = db.relationship('JobApplication', backref='job_post', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert job to dictionary"""
        return {
            'job_id': str(self.job_id) if self.job_id else None,
            'page_id': str(self.page_id) if self.page_id else None,
            'user_id': str(self.user_id) if self.user_id else None,
            'title': self.title,
            'description': self.description,
            'location': self.location,
            'job_type': self.job_type,
            'salary_range': self.salary_range,
            'experience_required': self.experience_required,
            'skills_required': self.skills_required,
            'benefits': self.benefits,
            'application_deadline': self.application_deadline.isoformat() if self.application_deadline else None,
            'contact_email': self.contact_email,
            'contact_phone': self.contact_phone,
            'is_active': self.is_active,
            'is_featured': self.is_featured,
            'views_count': self.views_count,
            'applications_count': self.applications_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class JobApplication(BaseModel):
    """Job Application model"""
    __tablename__ = 'job_applications'
    
    # Override the id field from BaseModel since we use application_id as primary key
    id = None
    application_id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=db.text('uuid_generate_v4()'))
    job_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('jobs.job_id'), nullable=False)
    applicant_user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    cover_letter = db.Column(db.Text)
    resume_url = db.Column(db.String(500))
    status = db.Column(db.String(20), default='pending')
    notes = db.Column(db.Text)
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)
    reviewed_at = db.Column(db.DateTime)
    reviewed_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'))
    
    # Relationships
    job = db.relationship('Job', backref='job_applications')
    applicant = db.relationship('User', foreign_keys=[applicant_user_id], backref='job_applications')
    reviewer = db.relationship('User', foreign_keys=[reviewed_by], backref='reviewed_applications')
    
    def to_dict(self):
        """Convert job application to dictionary"""
        return {
            'application_id': str(self.application_id) if self.application_id else None,
            'job_id': str(self.job_id) if self.job_id else None,
            'applicant_user_id': str(self.applicant_user_id) if self.applicant_user_id else None,
            'cover_letter': self.cover_letter,
            'resume_url': self.resume_url,
            'status': self.status,
            'notes': self.notes,
            'applied_at': self.applied_at.isoformat() if self.applied_at else None,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'reviewed_by': str(self.reviewed_by) if self.reviewed_by else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

