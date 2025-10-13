#!/usr/bin/env python3
"""
Fix foreign key constraints for user_experiences and user_achievements tables
"""

import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def fix_foreign_keys():
    """Fix the foreign key constraints"""
    
    # Database connection
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME', 'linecricket25')
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'postgres')
    
    # Create database URL
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    
    try:
        # Create engine
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as conn:
            # Start transaction
            trans = conn.begin()
            
            try:
                print("Fixing foreign key constraints...")
                
                # Drop existing foreign key constraints
                print("1. Dropping existing foreign key constraints...")
                conn.execute(text("""
                    ALTER TABLE user_experiences 
                    DROP CONSTRAINT IF EXISTS user_experiences_profile_id_fkey;
                """))
                
                conn.execute(text("""
                    ALTER TABLE user_achievements 
                    DROP CONSTRAINT IF EXISTS user_achievements_profile_id_fkey;
                """))
                
                # Add correct foreign key constraints
                print("2. Adding correct foreign key constraints...")
                conn.execute(text("""
                    ALTER TABLE user_experiences 
                    ADD CONSTRAINT user_experiences_profile_id_fkey 
                    FOREIGN KEY (profile_id) REFERENCES user_profiles(id);
                """))
                
                conn.execute(text("""
                    ALTER TABLE user_achievements 
                    ADD CONSTRAINT user_achievements_profile_id_fkey 
                    FOREIGN KEY (profile_id) REFERENCES user_profiles(id);
                """))
                
                # Commit transaction
                trans.commit()
                print("Foreign key constraints fixed successfully!")
                
            except Exception as e:
                # Rollback on error
                trans.rollback()
                print(f"Error fixing foreign keys: {e}")
                raise
                
    except Exception as e:
        print(f"Database connection error: {e}")
        return False
        
    return True

if __name__ == "__main__":
    print("Starting foreign key constraint fix...")
    success = fix_foreign_keys()
    if success:
        print("Foreign key constraints fixed successfully!")
    else:
        print("Failed to fix foreign key constraints!")
        sys.exit(1)
