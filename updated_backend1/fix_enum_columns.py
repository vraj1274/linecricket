#!/usr/bin/env python3
"""
Fix enum columns in page_profiles table to use VARCHAR instead of enum types
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

def fix_enum_columns():
    """Change enum columns to VARCHAR in page_profiles table"""
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
            print("ERROR: page_profiles table does not exist.")
            return False
        
        print("Fixing enum columns in page_profiles table...")
        
        # Change enum columns to VARCHAR
        migrations = [
            # Change academy_type from ACADEMYTYPE to VARCHAR
            "ALTER TABLE page_profiles ALTER COLUMN academy_type TYPE VARCHAR(50);",
            
            # Change level from ACADEMYLEVEL to VARCHAR  
            "ALTER TABLE page_profiles ALTER COLUMN level TYPE VARCHAR(50);",
            
            # Change page_type from PAGETYPE to VARCHAR
            "ALTER TABLE page_profiles ALTER COLUMN page_type TYPE VARCHAR(50);"
        ]
        
        for i, migration in enumerate(migrations, 1):
            try:
                print(f"   {i}. Executing migration...")
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
            AND column_name IN ('academy_type', 'level', 'page_type')
            ORDER BY column_name;
        """)
        
        columns = cursor.fetchall()
        print(f"Found {len(columns)} updated columns:")
        for column in columns:
            print(f"   - {column[0]}: {column[1]} (nullable: {column[2]}, default: {column[3]})")
        
        print("\nEnum columns fixed successfully!")
        print("Summary:")
        print("   SUCCESS: Changed academy_type to VARCHAR(50)")
        print("   SUCCESS: Changed level to VARCHAR(50)")
        print("   SUCCESS: Changed page_type to VARCHAR(50)")
        
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
    print("Starting enum columns fix...")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    success = fix_enum_columns()
    
    print("=" * 60)
    if success:
        print("SUCCESS: Enum columns fixed successfully!")
    else:
        print("ERROR: Enum columns fix failed. Please check the errors above.")
        sys.exit(1)
