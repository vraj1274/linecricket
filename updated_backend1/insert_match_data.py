#!/usr/bin/env python3
"""
Insert Sample Match Data into PostgreSQL Database
This script inserts sample cricket matches into the matches table
"""

import sys
import os
from datetime import datetime, date, time
from app import app, db
from models.match import Match
from models.enums import MatchType, MatchStatus
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def insert_sample_matches():
    """Insert sample cricket matches into the database"""
    print("🏏 Inserting Sample Match Data into Database...")
    print("=" * 50)
    
    try:
        with app.app_context():
            # Get the first user from the database
            from models.user import User
            user = User.query.first()
            if not user:
                print("❌ No users found in database. Please create a user first.")
                return False
            
            creator_id = str(user.id)
            print(f"👤 Using creator ID: {creator_id}")
            print(f"📧 Creator email: {user.email}")
            
            # Sample match data
            sample_matches = [
                {
                    'creator_id': creator_id,
                    'title': 'Mumbai Warriors vs Delhi Champions',
                    'description': 'Exciting T20 match between two top teams. High-quality cricket expected!',
                    'match_type': MatchType.TOURNAMENT,
                    'location': 'Shivaji Park, Mumbai',
                    'venue': 'Shivaji Park Cricket Ground',
                    'match_date': date(2024, 2, 15),
                    'match_time': time(14, 30),  # 2:30 PM
                    'players_needed': 22,
                    'entry_fee': 500.0,
                    'is_public': True,
                    'status': MatchStatus.UPCOMING,
                    'team1_name': 'Mumbai Warriors',
                    'team2_name': 'Delhi Champions',
                    'skill_level': 'intermediate',
                    'equipment_provided': True,
                    'rules': 'Standard T20 rules apply. 20 overs per side.',
                    'weather': 'sunny',
                    'temperature': 28.5,
                    'wind_speed': 12.3,
                    'humidity': 65.0,
                    'estimated_duration': 180,  # 3 hours
                    'total_views': 0,
                    'total_interested': 0,
                    'total_joined': 0,
                    'total_left': 0
                },
                {
                    'creator_id': creator_id,
                    'title': 'Bangalore Strikers vs Chennai Kings',
                    'description': 'Friendly match for practice and fun. All skill levels welcome!',
                    'match_type': MatchType.FRIENDLY,
                    'location': 'Cubbon Park, Bangalore',
                    'venue': 'Cubbon Park Cricket Ground',
                    'match_date': date(2024, 2, 18),
                    'match_time': time(10, 0),  # 10:00 AM
                    'players_needed': 22,
                    'entry_fee': 0.0,
                    'is_public': True,
                    'status': MatchStatus.UPCOMING,
                    'team1_name': 'Bangalore Strikers',
                    'team2_name': 'Chennai Kings',
                    'skill_level': 'all_levels',
                    'equipment_provided': False,
                    'rules': 'Friendly match rules. Bring your own equipment.',
                    'weather': 'partly_cloudy',
                    'temperature': 26.0,
                    'wind_speed': 8.5,
                    'humidity': 70.0,
                    'estimated_duration': 150,  # 2.5 hours
                    'total_views': 0,
                    'total_interested': 0,
                    'total_joined': 0,
                    'total_left': 0
                },
                {
                    'creator_id': creator_id,
                    'title': 'Kolkata Knight Riders vs Punjab Kings',
                    'description': 'Professional league match. High stakes and intense competition!',
                    'match_type': MatchType.LEAGUE,
                    'location': 'Eden Gardens, Kolkata',
                    'venue': 'Eden Gardens Cricket Stadium',
                    'match_date': date(2024, 2, 20),
                    'match_time': time(19, 0),  # 7:00 PM
                    'players_needed': 22,
                    'entry_fee': 1000.0,
                    'is_public': True,
                    'status': MatchStatus.UPCOMING,
                    'team1_name': 'Kolkata Knight Riders',
                    'team2_name': 'Punjab Kings',
                    'skill_level': 'advanced',
                    'equipment_provided': True,
                    'rules': 'Professional league rules. Strict adherence required.',
                    'weather': 'clear',
                    'temperature': 24.0,
                    'wind_speed': 6.0,
                    'humidity': 55.0,
                    'estimated_duration': 200,  # 3.3 hours
                    'total_views': 0,
                    'total_interested': 0,
                    'total_joined': 0,
                    'total_left': 0
                },
                {
                    'creator_id': creator_id,
                    'title': 'Hyderabad Sunrisers vs Rajasthan Royals',
                    'description': 'Evening match under lights. Perfect for working professionals!',
                    'match_type': MatchType.TOURNAMENT,
                    'location': 'Rajiv Gandhi Stadium, Hyderabad',
                    'venue': 'Rajiv Gandhi International Cricket Stadium',
                    'match_date': date(2024, 2, 22),
                    'match_time': time(18, 30),  # 6:30 PM
                    'players_needed': 22,
                    'entry_fee': 750.0,
                    'is_public': True,
                    'status': MatchStatus.UPCOMING,
                    'team1_name': 'Hyderabad Sunrisers',
                    'team2_name': 'Rajasthan Royals',
                    'skill_level': 'intermediate',
                    'equipment_provided': True,
                    'rules': 'T20 format. 20 overs per side. Powerplay rules apply.',
                    'weather': 'clear',
                    'temperature': 22.0,
                    'wind_speed': 10.0,
                    'humidity': 60.0,
                    'estimated_duration': 180,  # 3 hours
                    'total_views': 0,
                    'total_interested': 0,
                    'total_joined': 0,
                    'total_left': 0
                },
                {
                    'creator_id': creator_id,
                    'title': 'Gujarat Titans vs Lucknow Super Giants',
                    'description': 'Weekend special match. Family-friendly atmosphere!',
                    'match_type': MatchType.FRIENDLY,
                    'location': 'Narendra Modi Stadium, Ahmedabad',
                    'venue': 'Narendra Modi Stadium',
                    'match_date': date(2024, 2, 25),
                    'match_time': time(15, 0),  # 3:00 PM
                    'players_needed': 22,
                    'entry_fee': 300.0,
                    'is_public': True,
                    'status': MatchStatus.UPCOMING,
                    'team1_name': 'Gujarat Titans',
                    'team2_name': 'Lucknow Super Giants',
                    'skill_level': 'beginner',
                    'equipment_provided': True,
                    'rules': 'Friendly match. Focus on fun and learning.',
                    'weather': 'sunny',
                    'temperature': 30.0,
                    'wind_speed': 15.0,
                    'humidity': 45.0,
                    'estimated_duration': 120,  # 2 hours
                    'total_views': 0,
                    'total_interested': 0,
                    'total_joined': 0,
                    'total_left': 0
                }
            ]
            
            # Insert matches one by one
            for i, match_data in enumerate(sample_matches, 1):
                print(f"📝 Inserting Match {i}: {match_data['title']}")
                
                # Create match object
                new_match = Match(**match_data)
                
                # Add to database
                db.session.add(new_match)
                db.session.commit()
                
                print(f"✅ Match {i} inserted successfully!")
                print(f"   🏏 Title: {match_data['title']}")
                print(f"   📍 Location: {match_data['location']}")
                print(f"   📅 Date: {match_data['match_date']}")
                print(f"   ⏰ Time: {match_data['match_time']}")
                print(f"   👥 Players Needed: {match_data['players_needed']}")
                print(f"   💰 Entry Fee: ₹{match_data['entry_fee']}")
                print(f"   🏆 Type: {match_data['match_type'].value}")
                print(f"   📊 Status: {match_data['status'].value}")
                print("-" * 50)
            
            print(f"🎉 Successfully inserted {len(sample_matches)} matches into the database!")
            
            # Verify the data
            print("\n🔍 Verifying inserted data...")
            matches = Match.query.all()
            print(f"📊 Total matches in database: {len(matches)}")
            
            for match in matches:
                print(f"   🏏 {match.title} - {match.match_type.value} - {match.status.value}")
            
            print("\n✅ Database insertion completed successfully!")
            
    except Exception as e:
        print(f"❌ Error inserting match data: {str(e)}")
        db.session.rollback()
        return False
    
    return True

if __name__ == "__main__":
    print("🏏 TheLineCricket - Sample Match Data Insertion")
    print("=" * 50)
    
    success = insert_sample_matches()
    
    if success:
        print("\n🎉 All sample matches have been successfully inserted!")
        print("🔗 You can now test the match creation functionality in your frontend.")
    else:
        print("\n❌ Failed to insert sample matches. Please check the error messages above.")
        sys.exit(1)