"""
Email utility functions
Handles email sending functionality
"""

import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        self.smtp_username = os.environ.get('SMTP_USERNAME')
        self.smtp_password = os.environ.get('SMTP_PASSWORD')
        self.from_email = os.environ.get('FROM_EMAIL', 'noreply@linecricket.com')
    
    def send_email(self, to_email: str, subject: str, body: str, is_html: bool = False) -> bool:
        """
        Send email to recipient
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Email body content
            is_html: Whether body is HTML content
            
        Returns:
            Success status
        """
        try:
            if not self.smtp_username or not self.smtp_password:
                logger.warning("SMTP credentials not configured - email sending disabled")
                return False
            
            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.from_email
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add body
            if is_html:
                msg.attach(MIMEText(body, 'html'))
            else:
                msg.attach(MIMEText(body, 'plain'))
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False
    
    def send_otp_email(self, to_email: str, otp_code: str) -> bool:
        """
        Send OTP code via email
        
        Args:
            to_email: Recipient email address
            otp_code: OTP code to send
            
        Returns:
            Success status
        """
        subject = "Password Reset Code - LineCricket"
        body = f"""
        Your password reset code is: {otp_code}
        
        This code will expire in 15 minutes.
        
        If you didn't request this code, please ignore this email.
        
        Best regards,
        LineCricket Team
        """
        
        return self.send_email(to_email, subject, body)
    
    def send_welcome_email(self, to_email: str, user_name: str) -> bool:
        """
        Send welcome email to new user
        
        Args:
            to_email: Recipient email address
            user_name: User's name
            
        Returns:
            Success status
        """
        subject = "Welcome to LineCricket!"
        body = f"""
        Hi {user_name},
        
        Welcome to LineCricket! We're excited to have you join our community.
        
        You can now:
        - Create and join cricket matches
        - Connect with other cricket enthusiasts
        - Share your cricket experiences
        - And much more!
        
        Get started by creating your first match or exploring the community.
        
        Best regards,
        LineCricket Team
        """
        
        return self.send_email(to_email, subject, body)

# Create singleton instance
email_service = EmailService()
