#!/usr/bin/env python3
"""
Run PostgreSQL Database Setup
This script sets up the PostgreSQL database and runs the search setup.
"""

import subprocess
import sys
import os

def run_setup():
    """Run the PostgreSQL setup script"""
    try:
        print("🚀 Starting PostgreSQL database setup...")
        
        # Change to the backend directory
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        
        # Run the setup script
        result = subprocess.run([sys.executable, 'setup_postgres.py'], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ PostgreSQL setup completed successfully!")
            print(result.stdout)
        else:
            print("❌ PostgreSQL setup failed!")
            print("STDOUT:", result.stdout)
            print("STDERR:", result.stderr)
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Error running setup: {e}")
        return False

def test_connection():
    """Test the database connection"""
    try:
        print("\n🔍 Testing database connection...")
        
        # Import and test the database connection
        from app import app, db
        
        with app.app_context():
            # Test a simple query
            result = db.session.execute("SELECT 1 as test").fetchone()
            if result and result[0] == 1:
                print("✅ Database connection successful!")
                return True
            else:
                print("❌ Database connection test failed!")
                return False
                
    except Exception as e:
        print(f"❌ Database connection test error: {e}")
        return False

def main():
    """Main function"""
    print("=" * 60)
    print("🐘 PostgreSQL Database Setup for TheLineCricket")
    print("=" * 60)
    
    # Step 1: Run setup
    if not run_setup():
        print("❌ Setup failed!")
        sys.exit(1)
    
    # Step 2: Test connection
    if not test_connection():
        print("❌ Connection test failed!")
        sys.exit(1)
    
    print("\n🎉 PostgreSQL setup completed successfully!")
    print("\n📝 Next steps:")
    print("   1. Start the Flask backend: python app.py")
    print("   2. Test the search functionality in the frontend")
    print("   3. Check the search API endpoints:")
    print("      - GET /api/search/profiles")
    print("      - GET /api/search/posts")
    print("      - GET /api/search/suggestions")
    print("      - GET /api/search/analytics")

if __name__ == "__main__":
    main()


