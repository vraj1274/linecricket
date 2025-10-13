#!/usr/bin/env python3
"""
Fix missing venue and community columns in page_profiles table
"""

import psycopg2
import sys
from datetime import datetime

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'linecricket25',
    'user': 'postgres',
    'password': 'postgres'
}

def fix_venue_columns():
    """Add missing venue and community columns to page_profiles table"""
    try:
        # Connect to database
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        print("Connected to database successfully")
        
        # Check if table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'page_profiles'
            );
        """)
        
        table_exists = cursor.fetchone()[0]
        if not table_exists:
            print("ERROR: page_profiles table does not exist. Please run the main database schema first.")
            return False
        
        print("Adding missing venue and community columns to page_profiles table...")
        
        # Add missing columns
        migrations = [
            # Venue-specific columns
            "ALTER TABLE page_profiles ADD COLUMN IF NOT EXISTS venue_type VARCHAR(50);",
            "ALTER TABLE page_profiles ADD COLUMN IF NOT EXISTS ground_type VARCHAR(50);",
            "ALTER TABLE page_profiles ADD COLUMN IF NOT EXISTS capacity INTEGER;",
            "ALTER TABLE page_profiles ADD COLUMN IF NOT EXISTS ground_length FLOAT;",
            "ALTER TABLE page_profiles ADD COLUMN IF NOT EXISTS ground_width FLOAT;",
            
            # Community-specific columns
            "ALTER TABLE page_profiles ADD COLUMN IF NOT EXISTS community_type VARCHAR(50);",
            "ALTER TABLE page_profiles ADD COLUMN IF NOT EXISTS max_members INTEGER;",
            "ALTER TABLE page_profiles ADD COLUMN IF NOT EXISTS membership_fee FLOAT;",
            "ALTER TABLE page_profiles ADD COLUMN IF NOT EXISTS membership_duration VARCHAR(100);",
        ]
        
        for i, migration in enumerate(migrations, 1):
            try:
                print(f"   {i:2d}. Executing migration...")
                cursor.execute(migration)
                print(f"   SUCCESS: Migration {i} completed")
            except psycopg2.Error as e:
                if "already exists" in str(e) or "does not exist" in str(e):
                    print(f"   WARNING: Migration {i} skipped (already applied or not needed)")
                else:
                    print(f"   ERROR: Migration {i} failed: {e}")
                    # Continue with other migrations
        
        # Commit changes
        conn.commit()
        print("Schema migration completed successfully")
        
        # Verify the changes
        print("Verifying schema changes...")
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'page_profiles' 
            AND column_name IN ('venue_type', 'ground_type', 'capacity', 'ground_length', 'ground_width', 'community_type', 'max_members', 'membership_fee', 'membership_duration')
            ORDER BY column_name;
        """)
        
        columns = cursor.fetchall()
        print(f"Found {len(columns)} updated columns:")
        for column in columns:
            print(f"   - {column[0]}: {column[1]} (nullable: {column[2]})")
        
        print("\nVenue and community columns migration completed successfully!")
        print("Summary:")
        print("   SUCCESS: Added venue-specific columns (venue_type, ground_type, capacity, ground_length, ground_width)")
        print("   SUCCESS: Added community-specific columns (community_type, max_members, membership_fee, membership_duration)")
        
        return True
        
    except psycopg2.Error as e:
        print(f"Database error: {e}")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
        print("Database connection closed")

if __name__ == "__main__":
    print("Starting venue and community columns migration...")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    success = fix_venue_columns()
    
    print("=" * 60)
    if success:
        print("SUCCESS: Schema migration completed successfully!")
    else:
        print("ERROR: Schema migration failed. Please check the errors above.")
        sys.exit(1)
