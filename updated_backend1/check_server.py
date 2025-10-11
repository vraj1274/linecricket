#!/usr/bin/env python3
"""
Check if backend server is running
"""

import requests
import time

def check_server():
    """Check if the backend server is running"""
    print("🔍 Checking Backend Server Status")
    print("=" * 40)
    
    # Wait a moment for server to start
    time.sleep(2)
    
    try:
        # Test basic connection
        response = requests.get('http://localhost:5000/api/feed', timeout=5)
        print(f"✅ Backend is running! Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            posts = result.get('posts', [])
            print(f"📊 Posts in feed: {len(posts)}")
            
            if posts:
                print("📝 Recent posts:")
                for i, post in enumerate(posts[:3], 1):
                    print(f"   {i}. {post.get('content', 'No content')[:50]}...")
            else:
                print("📝 No posts found in feed")
                
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Backend server is not running")
        print("💡 Try starting the server with: python app.py")
        return False
        
    except Exception as e:
        print(f"❌ Error checking server: {e}")
        return False

if __name__ == "__main__":
    check_server()




