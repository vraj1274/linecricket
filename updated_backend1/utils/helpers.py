import os
import boto3
from datetime import datetime, timedelta
from flask import current_app
import logging

logger = logging.getLogger(__name__)

class S3Helper:
    """Helper class for AWS S3 operations"""
    
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=current_app.config.get('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=current_app.config.get('AWS_SECRET_ACCESS_KEY'),
            region_name=current_app.config.get('S3_REGION', 'us-east-1')
        )
        self.bucket_name = current_app.config.get('S3_BUCKET_NAME')
    
    def upload_file(self, file, folder, filename=None):
        """Upload file to S3"""
        try:
            if not filename:
                filename = f"{datetime.utcnow().timestamp()}_{file.filename}"
            
            key = f"{folder}/{filename}"
            
            self.s3_client.upload_fileobj(
                file,
                self.bucket_name,
                key,
                ExtraArgs={
                    'ACL': 'public-read',
                    'ContentType': file.content_type
                }
            )
            
            url = f"https://{self.bucket_name}.s3.{current_app.config.get('S3_REGION', 'us-east-1')}.amazonaws.com/{key}"
            return url
            
        except Exception as e:
            logger.error(f"S3 upload error: {e}")
            raise Exception("Failed to upload file")
    
    def delete_file(self, url):
        """Delete file from S3"""
        try:
            # Extract key from URL
            key = url.split('.amazonaws.com/')[-1]
            
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=key
            )
            
            return True
            
        except Exception as e:
            logger.error(f"S3 delete error: {e}")
            return False

def allowed_file(filename, allowed_extensions=None):
    """Check if file extension is allowed"""
    if allowed_extensions is None:
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

def format_file_size(size_bytes):
    """Format file size in human readable format"""
    if size_bytes == 0:
        return "0B"
    
    size_names = ["B", "KB", "MB", "GB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    
    return f"{size_bytes:.1f}{size_names[i]}"

def generate_username_from_email(email):
    """Generate username from email"""
    username = email.split('@')[0]
    # Remove special characters and make lowercase
    username = ''.join(c for c in username if c.isalnum()).lower()
    return username

def calculate_age(birth_date):
    """Calculate age from birth date"""
    today = datetime.now().date()
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))

def format_time_ago(dt):
    """Format datetime as time ago string"""
    now = datetime.utcnow()
    diff = now - dt
    
    if diff.days > 0:
        if diff.days == 1:
            return "1 day ago"
        elif diff.days < 7:
            return f"{diff.days} days ago"
        elif diff.days < 30:
            weeks = diff.days // 7
            return f"{weeks} week{'s' if weeks > 1 else ''} ago"
        elif diff.days < 365:
            months = diff.days // 30
            return f"{months} month{'s' if months > 1 else ''} ago"
        else:
            years = diff.days // 365
            return f"{years} year{'s' if years > 1 else ''} ago"
    elif diff.seconds > 3600:
        hours = diff.seconds // 3600
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    elif diff.seconds > 60:
        minutes = diff.seconds // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    else:
        return "Just now"

def paginate_query(query, page, per_page):
    """Paginate SQLAlchemy query"""
    return query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

def create_pagination_response(paginated_obj):
    """Create standardized pagination response"""
    return {
        'page': paginated_obj.page,
        'pages': paginated_obj.pages,
        'per_page': paginated_obj.per_page,
        'total': paginated_obj.total,
        'has_next': paginated_obj.has_next,
        'has_prev': paginated_obj.has_prev
    }

def sanitize_filename(filename):
    """Sanitize filename for safe storage"""
    import re
    # Remove or replace invalid characters
    filename = re.sub(r'[^\w\-_\.]', '_', filename)
    # Remove multiple underscores
    filename = re.sub(r'_+', '_', filename)
    # Remove leading/trailing underscores
    filename = filename.strip('_')
    return filename

def generate_avatar_url(username, size=100):
    """Generate avatar URL using a service like Gravatar or initials"""
    # For now, return a placeholder URL
    # In production, you might want to use Gravatar or generate initials
    return f"https://ui-avatars.com/api/?name={username}&size={size}&background=random"

def validate_image_file(file):
    """Validate uploaded image file"""
    if not file:
        return False, "No file provided"
    
    if not allowed_file(file.filename):
        return False, "Invalid file type. Only PNG, JPG, JPEG, GIF, and WebP are allowed"
    
    # Check file size (5MB limit)
    file.seek(0, 2)  # Seek to end
    file_size = file.tell()
    file.seek(0)  # Reset to beginning
    
    if file_size > 5 * 1024 * 1024:  # 5MB
        return False, "File size too large. Maximum size is 5MB"
    
    return True, "Valid file"

def get_client_ip():
    """Get client IP address from request"""
    from flask import request
    
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0].strip()
    elif request.headers.get('X-Real-IP'):
        return request.headers.get('X-Real-IP')
    else:
        return request.remote_addr

def rate_limit_key():
    """Generate rate limit key for current user/IP"""
    from flask_jwt_extended import get_jwt_identity
    from flask import request
    
    user_id = get_jwt_identity()
    if user_id:
        return f"user:{user_id}"
    else:
        return f"ip:{get_client_ip()}"

def is_valid_date_string(date_string, format='%Y-%m-%d'):
    """Check if date string is valid"""
    try:
        datetime.strptime(date_string, format)
        return True
    except ValueError:
        return False

def is_valid_time_string(time_string, format='%H:%M'):
    """Check if time string is valid"""
    try:
        datetime.strptime(time_string, format)
        return True
    except ValueError:
        return False

def get_timezone_aware_datetime(dt, timezone='UTC'):
    """Convert datetime to timezone aware"""
    import pytz
    
    if dt.tzinfo is None:
        tz = pytz.timezone(timezone)
        return tz.localize(dt)
    return dt

def send_notification_email(user_email, subject, message):
    """Send notification email (placeholder for email service integration)"""
    # This would integrate with your email service (SES, SendGrid, etc.)
    logger.info(f"Would send email to {user_email}: {subject}")
    return True

def create_short_url(long_url):
    """Create short URL (placeholder for URL shortening service)"""
    # This would integrate with a URL shortening service
    return long_url

def generate_qr_code(data):
    """Generate QR code for data"""
    try:
        import qrcode
        from io import BytesIO
        import base64
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        img_str = base64.b64encode(buffer.getvalue()).decode()
        return f"data:image/png;base64,{img_str}"
        
    except ImportError:
        logger.warning("qrcode library not installed")
        return None
    except Exception as e:
        logger.error(f"QR code generation error: {e}")
        return None
