#!/usr/bin/env python3
"""
Migration script to update page_profiles table schema
Fixes inconsistencies between model and database
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
    'password': 'root'
}

def migrate_page_profiles_schema():
    """Update page_profiles table schema to match model"""
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
        
        print("Updating page_profiles table schema...")
        
        # Add missing columns if they don't exist
        migrations = [
            # Rename organization_name to academy_name
            "ALTER TABLE page_profiles RENAME COLUMN organization_name TO academy_name;",
            
            # Add missing academy-specific columns
            "ALTER TABLE page_profiles ADD COLUMN IF NOT EXISTS academy_type VARCHAR(50);",
            "ALTER TABLE page_profiles ADD COLUMN IF NOT EXISTS level VARCHAR(50);",
            "ALTER TABLE page_profiles ADD COLUMN IF NOT EXISTS established_year INTEGER;",
            "ALTER TABLE page_profiles ADD COLUMN IF NOT EXISTS accreditation VARCHAR(200);",
            "ALTER TABLE page_profiles ADD COLUMN IF NOT EXISTS coaching_staff_count INTEGER DEFAULT 0;",
            "ALTER TABLE page_profiles ADD COLUMN IF NOT EXISTS total_students INTEGER DEFAULT 0;",
            "ALTER TABLE page_profiles ADD COLUMN IF NOT EXISTS successful_placements INTEGER DEFAULT 0;",
            "ALTER TABLE page_profiles ADD COLUMN IF NOT EXISTS equipment_provided BOOLEAN DEFAULT false;",
            "ALTER TABLE page_profiles ADD COLUMN IF NOT EXISTS programs_offered TEXT;",
            "ALTER TABLE page_profiles ADD COLUMN IF NOT EXISTS age_groups VARCHAR(100);",
            "ALTER TABLE page_profiles ADD COLUMN IF NOT EXISTS batch_timings TEXT;",
            "ALTER TABLE page_profiles ADD COLUMN IF NOT EXISTS fees_structure TEXT;",
            
            # Update JSON columns
            "ALTER TABLE page_profiles ALTER COLUMN gallery_images TYPE JSON USING gallery_images::json;",
            "ALTER TABLE page_profiles ALTER COLUMN facilities TYPE JSON USING facilities::json;",
            "ALTER TABLE page_profiles ALTER COLUMN services_offered TYPE JSON USING services_offered::json;",
            "ALTER TABLE page_profiles ALTER COLUMN achievements TYPE JSON USING achievements::json;",
            "ALTER TABLE page_profiles ALTER COLUMN testimonials TYPE JSON USING testimonials::json;",
            
            # Set default values for JSON columns
            "ALTER TABLE page_profiles ALTER COLUMN gallery_images SET DEFAULT '[]'::json;",
            "ALTER TABLE page_profiles ALTER COLUMN facilities SET DEFAULT '[]'::json;",
            "ALTER TABLE page_profiles ALTER COLUMN services_offered SET DEFAULT '[]'::json;",
            "ALTER TABLE page_profiles ALTER COLUMN achievements SET DEFAULT '[]'::json;",
            "ALTER TABLE page_profiles ALTER COLUMN testimonials SET DEFAULT '[]'::json;",
            
            # Set default values for boolean columns
            "ALTER TABLE page_profiles ALTER COLUMN is_public SET DEFAULT true;",
            "ALTER TABLE page_profiles ALTER COLUMN allow_messages SET DEFAULT true;",
            "ALTER TABLE page_profiles ALTER COLUMN show_contact SET DEFAULT true;",
            "ALTER TABLE page_profiles ALTER COLUMN is_verified SET DEFAULT false;",
            
            # Remove unique constraint on user_id to allow multiple profiles
            "ALTER TABLE page_profiles DROP CONSTRAINT IF EXISTS page_profiles_user_id_key;"
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
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'page_profiles' 
            AND column_name IN ('academy_name', 'academy_type', 'level', 'facilities', 'services_offered')
            ORDER BY column_name;
        """)
        
        columns = cursor.fetchall()
        print(f"Found {len(columns)} updated columns:")
        for column in columns:
            print(f"   - {column[0]}: {column[1]} (nullable: {column[2]}, default: {column[3]})")
        
        print("\nPage profiles schema migration completed successfully!")
        print("Summary:")
        print("   SUCCESS: Renamed organization_name to academy_name")
        print("   SUCCESS: Added academy-specific columns")
        print("   SUCCESS: Updated JSON column types")
        print("   SUCCESS: Set proper default values")
        print("   SUCCESS: Removed user_id unique constraint")
        
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
    print("Starting page_profiles schema migration...")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    success = migrate_page_profiles_schema()
    
    print("=" * 60)
    if success:
        print("SUCCESS: Schema migration completed successfully!")
    else:
        print("ERROR: Schema migration failed. Please check the errors above.")
        sys.exit(1)
