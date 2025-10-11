from .base import BaseModel, db
from datetime import datetime
import json

class User(BaseModel):
    """User model for authentication and basic info"""
    __tablename__ = 'users'
    
    # Firebase fields (primary authentication)
    firebase_uid = db.Column(db.String(255), nullable=True)
    firebase_email = db.Column(db.String(255), nullable=True)
    
    # Legacy Cognito fields (for backward compatibility)
    cognito_user_id = db.Column(db.String(255), nullable=True)
    
    # Common fields
    email = db.Column(db.String(255), nullable=False)
    username = db.Column(db.String(50), nullable=False)
    is_verified = db.Column(db.Boolean, nullable=False)
    is_active = db.Column(db.Boolean, nullable=False)
    
    # Authentication method tracking
    auth_provider = db.Column(db.String(50), nullable=False)
    
    # Profile relationship
    profile = db.relationship('UserProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    
    # Post relationships
    posts = db.relationship('Post', back_populates='user', lazy='dynamic', cascade='all, delete-orphan')
    post_likes = db.relationship('PostLike', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    post_comments = db.relationship('PostComment', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    
    # Match relationships
    created_matches = db.relationship('Match', backref='creator', lazy='dynamic', cascade='all, delete-orphan')
    match_participations = db.relationship('MatchParticipant', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    
    # Message relationships
    sent_messages = db.relationship('Message', foreign_keys='Message.sender_id', backref='sender', lazy='dynamic')
    received_messages = db.relationship('Message', foreign_keys='Message.receiver_id', backref='receiver', lazy='dynamic')
    conversations_as_user1 = db.relationship('Conversation', foreign_keys='Conversation.user1_id', backref='user1', lazy='dynamic')
    conversations_as_user2 = db.relationship('Conversation', foreign_keys='Conversation.user2_id', backref='user2', lazy='dynamic')
    
    # Notification relationships
    sent_notifications = db.relationship('Notification', foreign_keys='Notification.sender_id', backref='notification_sender', lazy='dynamic')
    received_notifications = db.relationship('Notification', foreign_keys='Notification.receiver_id', backref='notification_receiver', lazy='dynamic')
    
    def to_dict(self):
        """Convert user to dictionary with profile info"""
        data = super().to_dict()
        if self.profile:
            data['profile'] = self.profile.to_dict()
        return data

class UserProfile(BaseModel):
    """Extended user profile with cricket-specific information"""
    __tablename__ = 'user_profiles'
    
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False, unique=True)
    
    # Basic Information
    full_name = db.Column(db.String(100), nullable=False)
    bio = db.Column(db.Text)
    location = db.Column(db.String(100))
    organization = db.Column(db.String(100))
    age = db.Column(db.Integer)
    gender = db.Column(db.String(20))
    contact_number = db.Column(db.String(20))
    profile_image_url = db.Column(db.JSON)
    
    # Cricket Skills (0-100)
    batting_skill = db.Column(db.Integer, default=0)
    bowling_skill = db.Column(db.Integer, default=0)
    fielding_skill = db.Column(db.Integer, default=0)
    
    # Profile relationships
    stats = db.relationship('UserStats', backref='profile', uselist=False, cascade='all, delete-orphan')
    experiences = db.relationship('UserExperience', backref='profile', lazy='dynamic', cascade='all, delete-orphan')
    # hobbies = db.relationship('UserHobby', backref='profile', lazy='dynamic', cascade='all, delete-orphan')  # Table doesn't exist
    achievements = db.relationship('UserAchievement', backref='profile', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert profile to dictionary with related data"""
        data = super().to_dict()
        if self.stats:
            data['stats'] = self.stats.to_dict()
        data['experiences'] = [exp.to_dict() for exp in self.experiences]
        # data['hobbies'] = [hobby.to_dict() for hobby in self.hobbies]  # Table doesn't exist
        data['achievements'] = [achievement.to_dict() for achievement in self.achievements]
        return data

class UserStats(BaseModel):
    """Comprehensive cricket statistics for a user"""
    __tablename__ = 'user_stats'
    
    profile_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('user_profiles.id'), nullable=False, unique=True)
    
    # Basic Statistics
    total_runs = db.Column(db.Integer, default=0)
    total_wickets = db.Column(db.Integer, default=0)
    total_matches = db.Column(db.Integer, default=0)
    total_awards = db.Column(db.Integer, default=0)
    
    # Batting Statistics
    batting_average = db.Column(db.Float, default=0.0)
    batting_strike_rate = db.Column(db.Float, default=0.0)
    highest_score = db.Column(db.Integer, default=0)
    centuries = db.Column(db.Integer, default=0)
    half_centuries = db.Column(db.Integer, default=0)
    fours = db.Column(db.Integer, default=0)
    sixes = db.Column(db.Integer, default=0)
    balls_faced = db.Column(db.Integer, default=0)
    
    # Bowling Statistics
    bowling_average = db.Column(db.Float, default=0.0)
    bowling_economy = db.Column(db.Float, default=0.0)
    bowling_strike_rate = db.Column(db.Float, default=0.0)
    best_bowling_figures = db.Column(db.String(20))
    five_wicket_hauls = db.Column(db.Integer, default=0)
    four_wicket_hauls = db.Column(db.Integer, default=0)
    maidens = db.Column(db.Integer, default=0)
    runs_conceded = db.Column(db.Integer, default=0)
    balls_bowled = db.Column(db.Integer, default=0)
    
    # Fielding Statistics
    catches = db.Column(db.Integer, default=0)
    stumpings = db.Column(db.Integer, default=0)
    run_outs = db.Column(db.Integer, default=0)
    
    # Format-wise Statistics
    test_matches = db.Column(db.Integer, default=0)
    odi_matches = db.Column(db.Integer, default=0)
    t20_matches = db.Column(db.Integer, default=0)
    test_runs = db.Column(db.Integer, default=0)
    odi_runs = db.Column(db.Integer, default=0)
    t20_runs = db.Column(db.Integer, default=0)
    test_wickets = db.Column(db.Integer, default=0)
    odi_wickets = db.Column(db.Integer, default=0)
    t20_wickets = db.Column(db.Integer, default=0)

class UserExperience(BaseModel):
    """User's cricket experience and career history"""
    __tablename__ = 'user_experiences'
    
    profile_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('user_profiles.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(100), nullable=False)
    duration = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)

class UserHobby(BaseModel):
    """User's hobbies and interests"""
    __tablename__ = 'user_hobbies'
    
    profile_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('user_profiles.id'), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    icon = db.Column(db.String(10), default='🎯')
    level = db.Column(db.String(20), default='Beginner')  # Beginner, Intermediate, Advanced, Expert

class UserAchievement(BaseModel):
    """User's achievements and awards"""
    __tablename__ = 'user_achievements'
    
    profile_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('user_profiles.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    year = db.Column(db.String(10), nullable=False)
