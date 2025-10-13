#!/usr/bin/env python3
"""
PostgreSQL Database Setup Script for TheLineCricket
This script sets up the PostgreSQL database connection and creates necessary tables.
"""

import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': 'root',
    'database': 'linecricket25'
}

def create_database():
    """Create the database if it doesn't exist"""
    try:
        # Connect to PostgreSQL server (without specific database)
        conn = psycopg2.connect(
            host=DB_CONFIG['host'],
            port=DB_CONFIG['port'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password']
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (DB_CONFIG['database'],))
        exists = cursor.fetchone()
        
        if not exists:
            # Create database
            cursor.execute(f"CREATE DATABASE {DB_CONFIG['database']}")
            logger.info(f"✅ Database '{DB_CONFIG['database']}' created successfully")
        else:
            logger.info(f"✅ Database '{DB_CONFIG['database']}' already exists")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        logger.error(f"❌ Error creating database: {e}")
        return False

def test_connection():
    """Test the database connection"""
    try:
        # Create connection string
        connection_string = f"postgresql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}"
        
        # Test connection
        engine = create_engine(connection_string)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            logger.info(f"✅ PostgreSQL connection successful!")
            logger.info(f"📊 Database version: {version}")
            return True
            
    except Exception as e:
        logger.error(f"❌ Error connecting to database: {e}")
        return False

def create_tables():
    """Create necessary tables using SQLAlchemy"""
    try:
        from app import app, db
        
        with app.app_context():
            # Create all tables
            db.create_all()
            logger.info("✅ All tables created successfully")
            return True
            
    except Exception as e:
        logger.error(f"❌ Error creating tables: {e}")
        return False

def setup_search_indexes():
    """Create search indexes for better performance"""
    try:
        connection_string = f"postgresql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}"
        engine = create_engine(connection_string)
        
        with engine.connect() as conn:
            # Create indexes for search functionality
            indexes = [
                "CREATE INDEX IF NOT EXISTS idx_page_profiles_name ON page_profiles(academy_name);",
                "CREATE INDEX IF NOT EXISTS idx_page_profiles_type ON page_profiles(page_type);",
                "CREATE INDEX IF NOT EXISTS idx_page_profiles_user_id ON page_profiles(user_id);",
                "CREATE INDEX IF NOT EXISTS idx_page_profiles_created_at ON page_profiles(created_at);",
                "CREATE INDEX IF NOT EXISTS idx_page_profiles_search ON page_profiles USING gin(to_tsvector('english', academy_name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')));",
                "CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);",
                "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);",
                "CREATE INDEX IF NOT EXISTS idx_posts_content ON posts(content);",
                "CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);"
            ]
            
            for index_sql in indexes:
                conn.execute(text(index_sql))
            
            logger.info("✅ Search indexes created successfully")
            return True
            
    except Exception as e:
        logger.error(f"❌ Error creating search indexes: {e}")
        return False

def main():
    """Main setup function"""
    logger.info("🚀 Setting up PostgreSQL database for TheLineCricket...")
    
    # Step 1: Create database
    logger.info("📊 Step 1: Creating database...")
    if not create_database():
        logger.error("❌ Failed to create database")
        sys.exit(1)
    
    # Step 2: Test connection
    logger.info("🔗 Step 2: Testing connection...")
    if not test_connection():
        logger.error("❌ Failed to connect to database")
        sys.exit(1)
    
    # Step 3: Create tables
    logger.info("📋 Step 3: Creating tables...")
    if not create_tables():
        logger.error("❌ Failed to create tables")
        sys.exit(1)
    
    # Step 4: Create search indexes
    logger.info("🔍 Step 4: Creating search indexes...")
    if not setup_search_indexes():
        logger.error("❌ Failed to create search indexes")
        sys.exit(1)
    
    logger.info("🎉 PostgreSQL database setup completed successfully!")
    logger.info("📝 Next steps:")
    logger.info("   1. Update your .env file with the database configuration")
    logger.info("   2. Run the Flask application: python app.py")
    logger.info("   3. Test the search functionality in the frontend")

if __name__ == "__main__":
    main()


