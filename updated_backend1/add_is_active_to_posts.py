#!/usr/bin/env python3
"""
Migration script to add is_active field to posts table
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from sqlalchemy import text

def add_is_active_to_posts():
    """Add is_active column to posts table and set all existing posts to active"""
    with app.app_context():
        try:
            # Check if column already exists
            result = db.session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='posts' AND column_name='is_active'
            """))
            
            if result.fetchone():
                print("✅ is_active column already exists in posts table")
                return
            
            # Add the is_active column
            print("Adding is_active column to posts table...")
            db.session.execute(text("""
                ALTER TABLE posts 
                ADD COLUMN is_active BOOLEAN DEFAULT TRUE
            """))
            
            # Set all existing posts to active
            print("Setting all existing posts to active...")
            db.session.execute(text("""
                UPDATE posts 
                SET is_active = TRUE 
                WHERE is_active IS NULL
            """))
            
            db.session.commit()
            print("✅ Successfully added is_active column to posts table")
            
        except Exception as e:
            print(f"❌ Error adding is_active column: {str(e)}")
            db.session.rollback()
            raise

if __name__ == "__main__":
    add_is_active_to_posts()




