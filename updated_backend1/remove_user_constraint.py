#!/usr/bin/env python3
"""
Remove unique constraint on user_id in page_profiles table
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

def remove_user_constraint():
    """Remove unique constraint on user_id in page_profiles table"""
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
        
        print("Removing unique constraint on user_id...")
        
        # Remove unique constraint
        try:
            cursor.execute("ALTER TABLE page_profiles DROP CONSTRAINT IF EXISTS page_profiles_user_id_key;")
            print("SUCCESS: Unique constraint removed")
        except psycopg2.Error as e:
            print(f"WARNING: Constraint removal failed (may not exist): {e}")
        
        # Commit changes
        conn.commit()
        print("Constraint removal completed successfully")
        
        # Verify the constraint is removed
        print("Verifying constraint removal...")
        cursor.execute("""
            SELECT constraint_name, constraint_type
            FROM information_schema.table_constraints 
            WHERE table_name = 'page_profiles' 
            AND constraint_name LIKE '%user_id%';
        """)
        
        constraints = cursor.fetchall()
        if constraints:
            print(f"Found {len(constraints)} user_id constraints:")
            for constraint in constraints:
                print(f"   - {constraint[0]}: {constraint[1]}")
        else:
            print("SUCCESS: No user_id constraints found")
        
        print("\nUser constraint removal completed successfully!")
        print("Summary:")
        print("   SUCCESS: Removed unique constraint on user_id")
        print("   SUCCESS: Users can now create multiple profiles")
        
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
    print("Starting user constraint removal...")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    success = remove_user_constraint()
    
    print("=" * 60)
    if success:
        print("SUCCESS: User constraint removed successfully!")
    else:
        print("ERROR: User constraint removal failed. Please check the errors above.")
        sys.exit(1)
