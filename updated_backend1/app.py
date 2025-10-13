from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime, timedelta
import boto3
import jwt
from functools import wraps
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configuration
from config import config
import os

# Get configuration from environment
config_name = os.environ.get('FLASK_ENV', 'development').strip()
app.config.from_object(config[config_name])

# Override with environment variables if they exist
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')

# Database configuration from environment variables
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/linecricket25')

# AWS Cognito Configuration
app.config['COGNITO_REGION'] = os.environ.get('COGNITO_REGION')
app.config['COGNITO_USER_POOL_ID'] = os.environ.get('COGNITO_USER_POOL_ID')
app.config['COGNITO_CLIENT_ID'] = os.environ.get('COGNITO_CLIENT_ID')
app.config['COGNITO_CLIENT_SECRET'] = os.environ.get('COGNITO_CLIENT_SECRET')

# Import models first to get db instance
from models import db

# Initialize extensions
migrate = Migrate()
jwt = JWTManager()
CORS(app, origins=['http://localhost:*', 'http://127.0.0.1:*'], supports_credentials=True)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize AWS Cognito client (only if region is configured)
cognito_client = None
if app.config.get('COGNITO_REGION'):
    try:
        cognito_client = boto3.client(
            'cognito-idp',
            region_name=app.config['COGNITO_REGION']
        )
    except Exception as e:
        logger.warning(f"Failed to initialize AWS Cognito client: {e}")
        cognito_client = None

# Initialize Firebase Admin SDK
from services.firebase_auth import firebase_service

# Check Firebase initialization status
if firebase_service.is_initialized():
    logger.info("Firebase Admin SDK initialized successfully")
else:
    logger.warning("Firebase Admin SDK not initialized - Firebase features disabled")

# Initialize extensions with app
db.init_app(app)
migrate.init_app(app, db)
jwt.init_app(app)

# Import routes
from routes.auth import auth_bp
from routes.firebase_auth import firebase_auth_bp
from routes.posts import posts_bp
from routes.users import users_bp
from routes.matches import matches_bp
from routes.messages import messages_bp
from routes.notifications import notifications_bp
from routes.search import search_bp

# Import new messaging blueprints
from routes.connection_routes import connection_routes

# Import social media blueprint
from routes.social_posts import social_posts_bp

# Import search and action blueprints
from routes.search_routes import search_routes
from routes.job_routes import job_bp
from routes.community_routes import community_routes

# Import profile blueprints
# from routes.player_profile_routes import player_profile_bp  # DISABLED: PlayerProfile model not in schema
from routes.profile_page_routes import profile_page_bp
from routes.profiles_routes import profiles_bp
# from routes.venue_profile_routes import venue_profile_bp  # DISABLED: VenueProfile model not in schema
# from routes.community_profile_routes import community_profile_bp  # DISABLED: CommunityProfile model not in schema

# Import relationship blueprints
from routes.relationships_routes import relationships_bp

# Import feed blueprints
from routes.feed_routes import feed_bp

# Import messaging blueprints
from routes.messaging_routes import messaging_bp

# Import notification blueprints
from routes.notification_routes import notification_bp

# Import match blueprints
from routes.match_routes import match_bp

# Import advanced search blueprints
from routes.advanced_search_routes import advanced_search_bp

# Import admin blueprints
# from routes.admin_routes import admin_bp  # DISABLED: Admin models not in schema

# Import manage page blueprints
from routes.manage_page_routes import manage_page_bp

# Import member blueprints
from routes.member_routes import member_bp

# Import Socket.IO
from socketio_server import init_socketio

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(firebase_auth_bp, url_prefix='/api/firebase')
app.register_blueprint(posts_bp, url_prefix='/api')
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(matches_bp, url_prefix='/api/matches')
app.register_blueprint(messages_bp, url_prefix='/api/messages')
app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
app.register_blueprint(search_bp, url_prefix='/api/search')

# Register new messaging blueprints
app.register_blueprint(connection_routes)

# Register social media blueprint
app.register_blueprint(social_posts_bp, url_prefix='/api/social')

# Register search and action blueprints
app.register_blueprint(search_routes, url_prefix='/api')
app.register_blueprint(job_bp, url_prefix='/api')
app.register_blueprint(member_bp, url_prefix='/api')
app.register_blueprint(community_routes, url_prefix='/api')

# Register profile blueprints
# app.register_blueprint(player_profile_bp, url_prefix='/api')  # DISABLED: PlayerProfile model not in schema
app.register_blueprint(profile_page_bp, url_prefix='/api')
app.register_blueprint(profiles_bp, url_prefix='/api')
# app.register_blueprint(venue_profile_bp, url_prefix='/api')  # DISABLED: VenueProfile model not in schema
# app.register_blueprint(community_profile_bp, url_prefix='/api')  # DISABLED: CommunityProfile model not in schema

# Register relationship blueprints
app.register_blueprint(relationships_bp, url_prefix='/api')

# Register feed blueprints
app.register_blueprint(feed_bp, url_prefix='/api')

# Register messaging blueprints
app.register_blueprint(messaging_bp, url_prefix='/api/messaging')

# Register notification blueprints
app.register_blueprint(notification_bp, url_prefix='/api')

# Register match blueprints
# app.register_blueprint(match_bp, url_prefix='/api')  # COMMENTED OUT: Conflicts with matches_bp

# Register advanced search blueprints
app.register_blueprint(advanced_search_bp, url_prefix='/api')

# Register admin blueprints
# app.register_blueprint(admin_bp, url_prefix='/api')  # DISABLED: Admin models not in schema

# Register manage page blueprints
app.register_blueprint(manage_page_bp, url_prefix='/api')

# Error handlers
@app.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad request'}), 400

@app.errorhandler(401)
def unauthorized(error):
    return jsonify({'error': 'Unauthorized'}), 401

@app.errorhandler(403)
def forbidden(error):
    return jsonify({'error': 'Forbidden'}), 403

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

# Health check endpoint
@app.route('/api/health')
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat(), 'version': '1.0.1'})

# Direct posts endpoint to bypass route issues
@app.route('/api/posts-direct')
def get_posts_direct():
    """Direct posts endpoint to bypass route caching issues"""
    try:
        from models.post import Post
        
        # Get posts directly
        posts = Post.query.filter(Post.visibility == 'public').limit(10).all()
        print(f"DEBUG: Found {len(posts)} posts in query")
        
        posts_data = []
        for i, post in enumerate(posts):
            try:
                print(f"DEBUG: Processing post {i+1}: {post.content[:30]}...")
                post_dict = post.to_dict()
                posts_data.append(post_dict)
                print(f"DEBUG: Successfully converted post {i+1}")
            except Exception as e:
                print(f"DEBUG: Error converting post {i+1}: {e}")
                import traceback
                traceback.print_exc()
                continue
        
        return jsonify({
            'success': True,
            'posts': posts_data,
            'total': len(posts_data),
            'message': 'Direct posts endpoint working'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Working posts endpoint with direct database query
@app.route('/api/posts-working')
def get_posts_working():
    """Working posts endpoint with direct database query"""
    try:
        import psycopg2
        
        # Connect to database directly
        conn = psycopg2.connect('postgresql://postgres:postgres@localhost:5432/linecricket25')
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT p.id, p.content, p.post_type, p.visibility, p.likes_count, p.comments_count, 
                   p.shares_count, p.created_at, p.user_id, u.username, p.image_url, p.video_url, p.location
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.visibility = 'public' 
            ORDER BY p.created_at DESC 
            LIMIT 10
        """)
        
        posts = []
        for row in cursor.fetchall():
            # Create author object
            author = {
                'id': str(row[8]) if row[8] else None,
                'username': row[9] or 'Unknown User',
                'initials': (row[9] or 'U')[:2].upper() if row[9] else 'U'
            }
            
            # Parse image_url if it's JSON
            image_url = None
            if row[10] is not None:
                try:
                    if isinstance(row[10], str):
                        import json
                        image_data = json.loads(row[10])
                    else:
                        image_data = row[10]
                    
                    # Return all images as array
                    if isinstance(image_data, list) and len(image_data) > 0:
                        image_url = image_data  # Return all images
                    elif isinstance(image_data, str) and image_data.strip():
                        image_url = [image_data]  # Convert single string to array
                except:
                    image_url = None
            
            post = {
                'id': str(row[0]),
                'content': row[1],
                'post_type': row[2],
                'visibility': row[3],
                'likes_count': row[4] or 0,
                'comments_count': row[5] or 0,
                'shares_count': row[6] or 0,
                'created_at': row[7].isoformat() if row[7] else None,
                'user_id': str(row[8]) if row[8] else None,
                'author': author,
                'image_url': image_url,
                'video_url': row[11] if row[11] and row[11].strip() else None,
                'location': row[12] if row[12] and row[12].strip() else None
            }
            posts.append(post)
        
        conn.close()
        
        return jsonify({
            'success': True,
            'posts': posts,
            'total': len(posts),
            'message': 'Posts fetched directly from database'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Database initialization endpoint
@app.route('/api/init-db')
def init_db():
    try:
        db.create_all()
        return jsonify({'message': 'Database tables created successfully!'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Root endpoint
@app.route('/')
def index():
    return jsonify({
        'message': 'TheLineCricket API',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth',
            'posts': '/api/posts',
            'users': '/api/users',
            'matches': '/api/matches',
            'messages': '/api/messages',
            'notifications': '/api/notifications',
            'search': '/api/search',
            'player_profiles': '/api/player-profile',
            'academy_profiles': '/api/academy-profile',
            'venue_profiles': '/api/venue-profile',
            'community_profiles': '/api/community-profile',
            'relationships': '/api/follow, /api/block, /api/connection',
            'feed': '/api/feed, /api/posts, /api/search',
            'messaging': '/api/messaging/conversations, /api/messaging/messages',
            'notifications': '/api/notifications, /api/notifications/preferences',
            'matches': '/api/matches, /api/matches/trending',
            'advanced_search': '/api/search/global, /api/search/suggestions, /api/search/trending, /api/search/analytics, /api/search/geolocation',
            'admin': '/api/admin/dashboard, /api/admin/users, /api/admin/posts, /api/admin/matches, /api/admin/reports, /api/admin/settings'
        }
    })

# Serve uploaded files
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    from flask import send_from_directory
    upload_dir = os.path.join(os.getcwd(), 'uploads')
    return send_from_directory(upload_dir, filename)

# Initialize Socket.IO
socketio = init_socketio(app)

# Run the Flask application
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
