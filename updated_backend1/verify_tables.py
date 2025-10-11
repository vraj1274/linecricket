#!/usr/bin/env python3
"""
Script to verify that jobs and members tables were created successfully
"""

import psycopg2

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'linecricket25',
    'user': 'postgres',
    'password': 'root'
}

def verify_tables():
    """Verify that the tables were created"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Check if tables exist
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('jobs', 'members', 'job_applications')
            ORDER BY table_name;
        """)
        
        tables = cursor.fetchall()
        
        print("Database verification:")
        print("====================")
        
        if tables:
            print("Tables found:")
            for table in tables:
                print(f"  + {table[0]}")
        else:
            print("  - No tables found")
            
        # Check table structures
        for table_name in ['jobs', 'members', 'job_applications']:
            cursor.execute(f"""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '{table_name}' 
                ORDER BY ordinal_position;
            """)
            columns = cursor.fetchall()
            
            if columns:
                print(f"\n{table_name} table structure:")
                for col in columns:
                    print(f"  - {col[0]}: {col[1]}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error verifying tables: {e}")

if __name__ == "__main__":
    verify_tables()
