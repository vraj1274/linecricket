#!/usr/bin/env python3
"""
Migration script to add shared_from_post_id field to posts table
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from sqlalchemy import text

def add_shared_from_field():
    """Add shared_from_post_id column to posts table"""
    with app.app_context():
        try:
            # Check if column already exists
            result = db.session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='posts' AND column_name='shared_from_post_id'
            """))
            
            if result.fetchone():
                print("✅ shared_from_post_id column already exists in posts table")
                return
            
            # Add the shared_from_post_id column
            print("Adding shared_from_post_id column to posts table...")
            db.session.execute(text("""
                ALTER TABLE posts 
                ADD COLUMN shared_from_post_id UUID REFERENCES posts(id)
            """))
            
            db.session.commit()
            print("✅ Successfully added shared_from_post_id column to posts table")
            
        except Exception as e:
            print(f"❌ Error adding shared_from_post_id column: {str(e)}")
            db.session.rollback()
            raise

if __name__ == "__main__":
    add_shared_from_field()




