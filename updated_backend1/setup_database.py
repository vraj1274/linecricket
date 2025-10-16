#!/usr/bin/env python3
"""
Database setup script for PostgreSQL
This script will create the database and user if they don't exist
"""
import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def setup_database():
    """Setup PostgreSQL database and user"""
    try:
        # Get the working password from environment
        working_password = os.environ.get('DB_PASSWORD', 'postgres')
        
        # Connect to PostgreSQL server (default database)
        print("Connecting to PostgreSQL server...")
        conn = psycopg2.connect(
            host='localhost',
            port=5432,
            database='postgres',  # Connect to default postgres database
            user='postgres',
            password=working_password
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        print("[SUCCESS] Connected to PostgreSQL server")
        
        # Check if database exists
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = 'linecricket25'")
        if cursor.fetchone():
            print("[INFO] Database 'linecricket25' already exists")
        else:
            print("Creating database 'linecricket25'...")
            cursor.execute("CREATE DATABASE linecricket25")
            print("[SUCCESS] Database 'linecricket25' created")
        
        # Check if user exists and has proper permissions
        cursor.execute("SELECT 1 FROM pg_roles WHERE rolname = 'postgres'")
        if cursor.fetchone():
            print("[INFO] User 'postgres' exists")
            
            # Grant all privileges on the database
            cursor.execute("GRANT ALL PRIVILEGES ON DATABASE linecricket25 TO postgres")
            print("[SUCCESS] Granted privileges to user 'postgres'")
        
        cursor.close()
        conn.close()
        
        # Test connection to the new database
        print("Testing connection to 'linecricket25' database...")
        test_conn = psycopg2.connect(
            host='localhost',
            port=5432,
            database='linecricket25',
            user='postgres',
            password=working_password
        )
        test_cursor = test_conn.cursor()
        test_cursor.execute("SELECT version();")
        version = test_cursor.fetchone()
        print(f"[SUCCESS] Connected to 'linecricket25' database")
        print(f"PostgreSQL version: {version[0]}")
        
        test_cursor.close()
        test_conn.close()
        
        return True
        
    except psycopg2.OperationalError as e:
        print(f"[ERROR] Database setup failed: {e}")
        print("\nPossible solutions:")
        print("1. Check if PostgreSQL is running")
        print("2. Verify the postgres user password")
        print("3. Check if PostgreSQL is configured to accept connections")
        return False
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        return False

def test_alternative_passwords():
    """Test alternative passwords for postgres user"""
    passwords = ['postgres', 'root', 'admin', 'password', '']
    
    for password in passwords:
        try:
            print(f"Trying password: '{password}'")
            conn = psycopg2.connect(
                host='localhost',
                port=5432,
                database='postgres',
                user='postgres',
                password=password
            )
            print(f"[SUCCESS] Found working password: '{password}'")
            conn.close()
            return password
        except psycopg2.OperationalError:
            continue
    
    print("[ERROR] No working password found")
    return None

if __name__ == "__main__":
    print("=" * 60)
    print("PostgreSQL Database Setup Script")
    print("=" * 60)
    
    # First, try to find the correct password
    print("Testing different passwords for postgres user...")
    working_password = test_alternative_passwords()
    
    if working_password:
        print(f"\nUsing password: '{working_password}'")
        # Update the environment variable
        os.environ['DB_PASSWORD'] = working_password
        os.environ['DATABASE_URL'] = f"postgresql://postgres:{working_password}@localhost:5432/linecricket25"
        
        # Try to setup the database
        if setup_database():
            print("\n[SUCCESS] Database setup completed!")
            print("You can now run your Flask application.")
        else:
            print("\n[ERROR] Database setup failed!")
    else:
        print("\n[ERROR] Could not connect to PostgreSQL server!")
        print("Please check:")
        print("1. PostgreSQL is installed and running")
        print("2. PostgreSQL service is started")
        print("3. PostgreSQL is configured to accept connections")
        print("4. The postgres user password is correct")
