"""
OTP (One-Time Password) Models
Handles password reset and verification codes
"""

from datetime import datetime, timedelta
from .base import db
import secrets
import string

class PasswordResetOTP(db.Model):
    """Password reset OTP model"""
    __tablename__ = 'password_reset_otps'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), nullable=False, index=True)
    otp_code = db.Column(db.String(6), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    def __init__(self, email: str, expires_in_minutes: int = 15):
        """Initialize OTP with email and expiration time"""
        self.email = email
        self.otp_code = self.generate_otp()
        self.expires_at = datetime.utcnow() + timedelta(minutes=expires_in_minutes)
        self.used = False
    
    @staticmethod
    def generate_otp(length: int = 6) -> str:
        """Generate a random OTP code"""
        return ''.join(secrets.choice(string.digits) for _ in range(length))
    
    def is_valid(self) -> bool:
        """Check if OTP is valid (not used and not expired)"""
        return not self.used and datetime.utcnow() < self.expires_at
    
    def mark_as_used(self):
        """Mark OTP as used"""
        self.used = True
        db.session.commit()
    
    def __repr__(self):
        return f'<PasswordResetOTP {self.email}: {self.otp_code}>'
