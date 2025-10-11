#!/usr/bin/env python3
"""
Database Initialization Script
Creates all database tables and fixes any relationship issues
"""

import sys
import os
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
            # Drop all tables first (for clean start)
            print("Dropping existing tables...")
            db.drop_all()
            
            # Create all tables
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

def test_user_creation():
    """Test creating a user after database initialization"""
    print("\nTesting User Creation...")
    
    try:
        with app.app_context():
            # Test creating a simple user
            test_user = User(
                firebase_uid="test_init_uid_123",
                email="test_init@example.com",
                username="testinit123",
                is_verified=True,
                is_active=True,
                auth_provider="firebase"
            )
            
            db.session.add(test_user)
            db.session.commit()
            print("User created successfully")
            
            # Test creating UserProfile
            test_profile = UserProfile(
                user_id=test_user.id,
                full_name="Test Init User",
                bio="Test bio for initialization",
                location="Test City",
                organization="Test Org",
                age=25,
                gender="Male",
                contact_number="+1234567890"
            )
            
            db.session.add(test_profile)
            db.session.commit()
            print("UserProfile created successfully")
            
            # Clean up
            db.session.delete(test_user)
            db.session.commit()
            print("Test data cleaned up")
            
            return True
            
    except Exception as e:
        print(f"User creation test failed: {e}")
        logger.error(f"User creation test error: {e}")
        return False

def main():
    """Run database initialization"""
    print("Database Initialization")
    print("=" * 40)
    
    # Initialize database
    if not init_database():
        print("Database initialization failed")
        return 1
    
    # Test user creation
    if not test_user_creation():
        print("User creation test failed")
        return 1
    
    print("\nDATABASE INITIALIZATION SUCCESSFUL!")
    print("All tables created")
    print("User creation working")
    print("UserProfile creation working")
    print("\nDatabase is ready for Firebase data storage!")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())