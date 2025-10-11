#!/usr/bin/env python3
"""
Script to remove the unique constraint from page_profiles.user_id
"""
import os
import sys
from sqlalchemy import create_engine, text

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Database connection
DATABASE_URL = "postgresql://postgres:root@localhost:5432/linecricket25"

def fix_unique_constraint():
    """Remove the unique constraint from page_profiles.user_id"""
    try:
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as conn:
            # Start a transaction
            trans = conn.begin()
            
            try:
                # Drop the unique constraint
                conn.execute(text("ALTER TABLE page_profiles DROP CONSTRAINT IF EXISTS page_profiles_user_id_key;"))
                
                # Commit the transaction
                trans.commit()
                print("Successfully removed unique constraint from page_profiles.user_id")
                
            except Exception as e:
                trans.rollback()
                print(f"Error removing unique constraint: {e}")
                raise
                
    except Exception as e:
        print(f"Database connection error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("Fixing unique constraint on page_profiles.user_id...")
    if fix_unique_constraint():
        print("Database constraint fixed successfully!")
    else:
        print("Failed to fix database constraint")
        sys.exit(1)
