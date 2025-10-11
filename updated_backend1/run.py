#!/usr/bin/env python3
"""
TheLineCricket Flask Application
Run this file to start the development server
"""

import os
import sys
from app import app, db
from models import *
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_database():
    """Initialize database with all tables"""
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
