#!/usr/bin/env python3
"""
Simple posts server to show posts from database
"""

import psycopg2
import json
from flask import Flask, jsonify, render_template_string

app = Flask(__name__)

def get_posts_from_db():
    """Get posts directly from database"""
    try:
        conn = psycopg2.connect('postgresql://postgres:postgres@localhost:5432/linecricket25')
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, content, post_type, visibility, likes_count, comments_count, 
                   shares_count, created_at, user_id
            FROM posts 
            WHERE visibility = 'public' 
            ORDER BY created_at DESC 
            LIMIT 10
        """)
        
        posts = []
        for row in cursor.fetchall():
            post = {
                'id': str(row[0]),
                'content': row[1],
                'post_type': row[2],
                'visibility': row[3],
                'likes_count': row[4] or 0,
                'comments_count': row[5] or 0,
                'shares_count': row[6] or 0,
                'created_at': row[7].isoformat() if row[7] else None,
                'user_id': str(row[8]) if row[8] else None
            }
            posts.append(post)
        
        conn.close()
        return posts
        
    except Exception as e:
        print(f"Database error: {e}")
        return []

@app.route('/')
def index():
    """Show posts page"""
    posts = get_posts_from_db()
    
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>TheLineCricket - Posts from Database</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .post { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .post-content { font-size: 16px; line-height: 1.5; margin-bottom: 10px; }
            .post-meta { color: #666; font-size: 14px; }
            .success { color: green; text-align: center; padding: 20px; background: #e8f5e8; border-radius: 8px; margin-bottom: 20px; }
        </style>
    </head>
    <body>
        <h1>🏏 TheLineCricket - Posts from Database</h1>
        <div class="success">✅ Successfully fetched {{ posts_count }} posts from PostgreSQL database!</div>
        {% for post in posts %}
        <div class="post">
            <div class="post-content">{{ post.content }}</div>
            <div class="post-meta">
                Post ID: {{ post.id }} | Type: {{ post.post_type }} | 
                Likes: {{ post.likes_count }} | Comments: {{ post.comments_count }} | 
                Created: {{ post.created_at }}
            </div>
        </div>
        {% endfor %}
    </body>
    </html>
    """
    
    return render_template_string(html, posts=posts, posts_count=len(posts))

@app.route('/api/posts-simple')
def api_posts():
    """API endpoint for posts"""
    posts = get_posts_from_db()
    return jsonify({
        'success': True,
        'posts': posts,
        'total': len(posts),
        'message': 'Posts fetched directly from database'
    })

if __name__ == '__main__':
    print("Starting simple posts server on http://localhost:5001")
    print("Open http://localhost:5001 to see posts from database")
    app.run(host='0.0.0.0', port=5001, debug=True)
