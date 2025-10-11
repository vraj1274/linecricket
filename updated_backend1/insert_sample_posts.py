#!/usr/bin/env python3
"""
Insert Sample Posts Data into PostgreSQL Database
This script inserts sample cricket-related posts into the posts table
"""

import sys
import os
from datetime import datetime, date, time
from app import app, db
from models.post import Post
from models.user import User
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def insert_sample_posts():
    """Insert sample cricket-related posts into the database"""
    print("Inserting Sample Posts Data into Database...")
    print("=" * 50)
    
    try:
        with app.app_context():
            # Get the first user from the database
            user = User.query.first()
            if not user:
                print("No users found in database. Please create a user first.")
                return False
            
            user_id = user.id
            print(f"Using user ID: {user_id}")
            print(f"User email: {user.email}")
            
            # Sample posts data
            sample_posts = [
                {
                    'user_id': user_id,
                    'content': 'Just had an amazing practice session at the nets! The new bat feels incredible. Can\'t wait for the weekend match! 🏏 #CricketLife #Practice #WeekendMatch',
                    'post_type': 'general',
                    'visibility': 'public',
                    'location': 'Mumbai Cricket Club',
                    'hashtags': ['CricketLife', 'Practice', 'WeekendMatch'],
                    'likes_count': 15,
                    'comments_count': 3,
                    'shares_count': 2,
                    'views_count': 45
                },
                {
                    'user_id': user_id,
                    'content': 'What a thrilling finish to the T20 match yesterday! The last over was absolutely nail-biting. Cricket never fails to amaze me! 🏆 #T20 #Cricket #ThrillingMatch',
                    'post_type': 'general',
                    'visibility': 'public',
                    'location': 'Wankhede Stadium',
                    'hashtags': ['T20', 'Cricket', 'ThrillingMatch'],
                    'likes_count': 28,
                    'comments_count': 7,
                    'shares_count': 5,
                    'views_count': 89
                },
                {
                    'user_id': user_id,
                    'content': 'Looking for players for our weekend cricket match! We need 2 more players. All skill levels welcome. DM me if interested! 👥 #CricketMatch #PlayersNeeded #WeekendCricket',
                    'post_type': 'event',
                    'visibility': 'public',
                    'location': 'Shivaji Park, Mumbai',
                    'hashtags': ['CricketMatch', 'PlayersNeeded', 'WeekendCricket'],
                    'likes_count': 12,
                    'comments_count': 8,
                    'shares_count': 3,
                    'views_count': 67
                },
                {
                    'user_id': user_id,
                    'content': 'Just finished reading "The Art of Cricket" by Don Bradman. Some incredible insights about batting technique and mental approach. Highly recommend to all cricket enthusiasts! 📚 #CricketBooks #Batting #Technique',
                    'post_type': 'general',
                    'visibility': 'public',
                    'hashtags': ['CricketBooks', 'Batting', 'Technique'],
                    'likes_count': 22,
                    'comments_count': 5,
                    'shares_count': 4,
                    'views_count': 78
                },
                {
                    'user_id': user_id,
                    'content': 'The weather is perfect for cricket today! Clear skies, gentle breeze, and the pitch looks in great condition. Time for some quality cricket! ☀️ #PerfectWeather #CricketDay #GreatConditions',
                    'post_type': 'general',
                    'visibility': 'public',
                    'location': 'Brabourne Stadium',
                    'hashtags': ['PerfectWeather', 'CricketDay', 'GreatConditions'],
                    'likes_count': 18,
                    'comments_count': 4,
                    'shares_count': 2,
                    'views_count': 56
                },
                {
                    'user_id': user_id,
                    'content': 'Congratulations to our team for winning the inter-college cricket tournament! Everyone played exceptionally well. Special mention to our bowlers for those crucial wickets! 🏆 #TournamentWin #TeamEffort #CricketChampions',
                    'post_type': 'achievement',
                    'visibility': 'public',
                    'location': 'University Ground',
                    'hashtags': ['TournamentWin', 'TeamEffort', 'CricketChampions'],
                    'likes_count': 35,
                    'comments_count': 12,
                    'shares_count': 8,
                    'views_count': 124
                },
                {
                    'user_id': user_id,
                    'content': 'Cricket coaching session tomorrow at 6 AM. Focus will be on batting technique and fielding drills. All academy students are welcome! 🏏 #Coaching #Batting #Fielding #EarlyMorning',
                    'post_type': 'announcement',
                    'visibility': 'public',
                    'location': 'Cricket Academy',
                    'hashtags': ['Coaching', 'Batting', 'Fielding', 'EarlyMorning'],
                    'likes_count': 14,
                    'comments_count': 6,
                    'shares_count': 3,
                    'views_count': 42
                },
                {
                    'user_id': user_id,
                    'content': 'The new cricket gear collection is out! Check out our latest bats, pads, and gloves. Quality equipment makes all the difference in your game! 🛍️ #CricketGear #NewCollection #QualityEquipment',
                    'post_type': 'promotion',
                    'visibility': 'public',
                    'hashtags': ['CricketGear', 'NewCollection', 'QualityEquipment'],
                    'likes_count': 9,
                    'comments_count': 2,
                    'shares_count': 1,
                    'views_count': 34
                }
            ]
            
            # Insert posts one by one
            for i, post_data in enumerate(sample_posts, 1):
                print(f"Inserting Post {i}: {post_data['content'][:50]}...")
                
                # Create post object
                new_post = Post(**post_data)
                
                # Add to database
                db.session.add(new_post)
                db.session.commit()
                
                print(f"Post {i} inserted successfully!")
                print(f"   Content: {post_data['content'][:100]}...")
                print(f"   Location: {post_data.get('location', 'Not specified')}")
                print(f"   Hashtags: {', '.join(post_data.get('hashtags', []))}")
                print(f"   Likes: {post_data['likes_count']}")
                print(f"   Comments: {post_data['comments_count']}")
                print(f"   Shares: {post_data['shares_count']}")
                print("-" * 50)
            
            print(f"Successfully inserted {len(sample_posts)} posts into the database!")
            
            # Verify the data
            print("\nVerifying inserted data...")
            posts = Post.query.all()
            print(f"Total posts in database: {len(posts)}")
            
            for post in posts:
                print(f"   {post.content[:50]}... - {post.post_type} - {post.likes_count} likes")
            
            print("\nDatabase insertion completed successfully!")
            
    except Exception as e:
        print(f"Error inserting posts data: {str(e)}")
        db.session.rollback()
        return False
    
    return True

if __name__ == "__main__":
    print("TheLineCricket - Sample Posts Data Insertion")
    print("=" * 50)
    
    success = insert_sample_posts()
    
    if success:
        print("\nAll sample posts have been successfully inserted!")
        print("You can now test the posts functionality in your frontend.")
    else:
        print("\nFailed to insert sample posts. Please check the error messages above.")
        sys.exit(1)
