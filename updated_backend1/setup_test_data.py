#!/usr/bin/env python3
"""
Setup test data for CreatedPageView.tsx APIs
Creates necessary users and page profiles for testing
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from models.user import User, UserProfile
from models.profile_page import ProfilePage
import uuid
from datetime import datetime

def setup_test_data():
    """Create test users and page profiles"""
    with app.app_context():
        try:
            # Create test user
            test_user_id = "17c9109e-cb20-4723-be49-c26b8343cd19"
            existing_user = User.query.filter_by(id=test_user_id).first()
            
            if not existing_user:
                print("Creating test user...")
                user = User(
                    id=test_user_id,
                    firebase_uid="test_firebase_uid",
                    firebase_email="test@example.com",
                    email="test@example.com",
                    username="testuser",
                    is_verified=True,
                    is_active=True,
                    auth_provider="firebase"
                )
                db.session.add(user)
                
                # Create user profile
                user_profile = UserProfile(
                    user_id=test_user_id,
                    full_name="Test User",
                    bio="Test user profile",
                    location="Mumbai, India",
                    contact_number="+91-9876543210",
                    age=25,
                    gender="other",
                    profile_image_url=["https://example.com/avatar.jpg"]
                )
                db.session.add(user_profile)
                print("✅ Test user created")
            else:
                print("✅ Test user already exists")
            
            # Create test page profile
            test_page_id = "78762ef2-35ca-48e7-9547-3b15ecf3b45e"
            existing_page = ProfilePage.query.filter_by(page_id=test_page_id).first()
            
            if not existing_page:
                print("Creating test page profile...")
                page_profile = ProfilePage(
                    page_id=test_page_id,
                    user_id=test_user_id,
                    academy_name="Test Cricket Academy",
                    page_type="academy",
                    description="Test academy for cricket training",
                    city="Mumbai",
                    state="Maharashtra",
                    country="India",
                    contact_number="+91-9876543210",
                    email="academy@example.com",
                    website="https://testacademy.com",
                    academy_type="cricket_training",
                    level="beginner",
                    established_year=2020,
                    accreditation="BCCI Certified",
                    coaching_staff_count=5,
                    total_students=100,
                    successful_placements=50,
                    equipment_provided=True,
                    programs_offered='["Beginner", "Intermediate", "Advanced"]',
                    age_groups="5-18",
                    batch_timings='["Morning", "Evening"]',
                    fees_structure='{"monthly": 5000, "quarterly": 14000}',
                    gallery_images='["https://example.com/image1.jpg"]',
                    facilities='["Ground", "Net Practice", "Gym"]',
                    services_offered='["Training", "Coaching", "Equipment"]',
                    achievements='["State Champions 2023"]',
                    testimonials='["Great academy!"]',
                    is_public=True,
                    is_verified=True
                )
                db.session.add(page_profile)
                print("✅ Test page profile created")
            else:
                print("✅ Test page profile already exists")
            
            # Commit all changes
            db.session.commit()
            print("✅ All test data setup complete!")
            
        except Exception as e:
            print(f"❌ Error setting up test data: {str(e)}")
            db.session.rollback()
            raise

if __name__ == "__main__":
    setup_test_data()
