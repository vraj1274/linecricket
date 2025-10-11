#!/usr/bin/env python3
"""
Clean up test pages from the database
"""

import psycopg2
import os
from datetime import datetime

DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'port': os.environ.get('DB_PORT', '5432'),
    'database': os.environ.get('DB_NAME', 'linecricket25'),
    'user': os.environ.get('DB_USER', 'postgres'),
    'password': os.environ.get('DB_PASSWORD', 'root')
}

def cleanup_test_pages():
    """Remove test pages from the database"""
    conn = None
    cursor = None
    
    try:
        print("Connecting to database...")
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        print("Current pages in database:")
        cursor.execute("""
            SELECT page_id, academy_name, page_type, created_at 
            FROM page_profiles 
            ORDER BY created_at DESC
        """)
        pages = cursor.fetchall()
        
        print(f"Found {len(pages)} total pages:")
        for i, page in enumerate(pages, 1):
            print(f"  {i}. {page[1]} ({page[2]}) - {page[3]}")
        
        print("\nCleaning up test pages...")
        
        # Delete test pages created today (2025-10-10)
        cursor.execute("""
            DELETE FROM page_profiles 
            WHERE created_at >= '2025-10-10 00:00:00'
        """)
        
        deleted_count = cursor.rowcount
        print(f"Deleted {deleted_count} test pages created today")
        
        # Also delete any pages with test names
        cursor.execute("""
            DELETE FROM page_profiles 
            WHERE academy_name LIKE '%Test%' 
               OR academy_name LIKE '%Updated%' 
               OR academy_name = 'hhh'
        """)
        
        additional_deleted = cursor.rowcount
        print(f"Deleted {additional_deleted} additional test pages")
        
        total_deleted = deleted_count + additional_deleted
        print(f"Total deleted: {total_deleted} pages")
        
        # Commit the changes
        conn.commit()
        
        # Show remaining pages
        print("\nRemaining pages:")
        cursor.execute("""
            SELECT page_id, academy_name, page_type, created_at 
            FROM page_profiles 
            ORDER BY created_at DESC
        """)
        remaining_pages = cursor.fetchall()
        
        if remaining_pages:
            for i, page in enumerate(remaining_pages, 1):
                print(f"  {i}. {page[1]} ({page[2]}) - {page[3]}")
        else:
            print("  No pages remaining")
        
        print(f"\nDatabase cleanup completed! {len(remaining_pages)} pages remaining.")
        return True
        
    except Exception as e:
        print(f"Error during cleanup: {e}")
        if conn:
            conn.rollback()
        return False
        
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    print("Test Pages Cleanup Script")
    print("=" * 50)
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)
    
    success = cleanup_test_pages()
    
    print("=" * 50)
    if success:
        print("SUCCESS: Test pages cleanup completed!")
    else:
        print("ERROR: Test pages cleanup failed!")

