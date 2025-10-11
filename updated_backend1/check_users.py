#!/usr/bin/env python3
"""
Check existing users in the database
"""

import sys
import os
from app import app, db
from models.user import User
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_users():
    """Check existing users in the database"""
    print("👥 Checking existing users in database...")
    print("=" * 50)
    
    try:
        with app.app_context():
            users = User.query.all()
            print(f"📊 Total users in database: {len(users)}")
            
            if users:
                print("\n👤 Existing users:")
                for user in users:
                    print(f"   🆔 ID: {user.id}")
                    print(f"   📧 Email: {user.email}")
                    print(f"   👤 Name: {user.full_name if hasattr(user, 'full_name') else 'N/A'}")
                    print(f"   📅 Created: {user.created_at}")
                    print("-" * 30)
            else:
                print("❌ No users found in database!")
                print("💡 You need to create a user first before creating matches.")
                
    except Exception as e:
        print(f"❌ Error checking users: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    check_users()
