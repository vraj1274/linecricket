#!/usr/bin/env python3
"""
Simplified TheLineCricket Flask Application
This version excludes problematic models to get the server running
"""

import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from werkzeug.security import generate_password_hash, check_password_hash
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

# Get configuration from environment
config_name = os.environ.get('FLASK_ENV', 'development').strip()
app.config.from_object(config[config_name])

# Override with environment variables if they exist
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize extensions with app
db.init_app(app)
migrate.init_app(app, db)
jwt.init_app(app)

# Import only basic routes that don't require complex models
from routes.auth import auth_bp
from routes.firebase_auth import firebase_auth_bp
from routes.posts import posts_bp
from routes.users import users_bp
from routes.matches import matches_bp
from routes.messages import messages_bp
from routes.notifications import notifications_bp
from routes.search import search_bp

# Register basic blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(firebase_auth_bp, url_prefix='/api/firebase')
app.register_blueprint(posts_bp, url_prefix='/api/posts')
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(matches_bp, url_prefix='/api/matches')
app.register_blueprint(messages_bp, url_prefix='/api/messages')
app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
app.register_blueprint(search_bp, url_prefix='/api/search')

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
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

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
        'status': 'running',
        'endpoints': {
            'auth': '/api/auth',
            'posts': '/api/posts',
            'users': '/api/users',
            'matches': '/api/matches',
            'messages': '/api/messages',
            'notifications': '/api/notifications',
            'search': '/api/search',
            'health': '/api/health'
        }
    })

def init_database():
    """Initialize database with basic tables only"""
    print("Initializing Database...")
    
    try:
        with app.app_context():
            # Check if tables already exist
            inspector = db.inspect(db.engine)
            existing_tables = inspector.get_table_names()
            
            if existing_tables:
                print(f"Database already has {len(existing_tables)} tables")
                print("Existing tables:")
                for table in existing_tables:
                    print(f"   - {table}")
                return True
            
            # Create all tables if they don't exist
            print("Creating database tables...")
            db.create_all()
            
            # Verify tables were created
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            
            print(f"Database initialized successfully!")
            print(f"Created {len(tables)} tables:")
            for table in tables:
                print(f"   - {table}")
            
            return True
            
    except Exception as e:
        print(f"Database initialization failed: {e}")
        logger.error(f"Database initialization error: {e}")
        return False

if __name__ == '__main__':
    # Get configuration from environment variables
    host = os.environ.get('FLASK_HOST', '0.0.0.0')
    port = int(os.environ.get('FLASK_PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    print("Starting TheLineCricket API server...")
    print("=" * 50)
    
    # Initialize database before starting server
    if not init_database():
        print("Failed to initialize database. Exiting...")
        sys.exit(1)
    
    print("=" * 50)
    print(f"Server Configuration:")
    print(f"   Host: {host}")
    print(f"   Port: {port}")
    print(f"   Debug: {debug}")
    print(f"   Environment: {os.environ.get('FLASK_ENV', 'development')}")
    print("=" * 50)
    print("Server starting...")
    
    app.run(host=host, port=port, debug=debug)
