from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.post import Post
from models.user import User
from models.base import db
from datetime import datetime
import json

posts_bp = Blueprint('posts', __name__)

# NOTE: POST /api/posts route is handled by feed_routes.py to avoid conflicts
# Use /api/posts (from feed_bp) for post creation with full features like hashtags, mentions, etc.

# NOTE: GET /api/posts route is handled by feed_routes.py to avoid conflicts
# Use /api/posts (from feed_bp) for post retrieval with full features like sorting, filtering, etc.

# NOTE: Like functionality is handled by feed_routes.py to avoid conflicts
# @posts_bp.route('/posts/<post_id>/like', methods=['POST'])
# def like_post(post_id):
#     """Like or unlike a post - DISABLED: Use feed routes instead"""
#     return jsonify({'error': 'Use /api/posts/<post_id>/like from feed routes'}), 404

@posts_bp.route('/posts/<post_id>/comments', methods=['POST'])
# @jwt_required()
def add_comment(post_id):
    """Add a comment to a post"""
    try:
        data = request.get_json()
        current_user_id = "17c9109e-cb20-4723-be49-c26b8343cd19"  # get_jwt_identity() - using test user ID
        
        if not data.get('content'):
            return jsonify({'error': 'Comment content is required'}), 400
        
        post = Post.query.get_or_404(post_id)
        
        # Add comment to post using PostComment model
        from models.post import PostComment
        comment = PostComment(
            post_id=post_id,
            user_id=current_user_id,
            content=data['content']
        )
        db.session.add(comment)
        
        # Update post comment count
        post.comments_count = (post.comments_count or 0) + 1
        
        db.session.commit()
        
        return jsonify({
            'message': 'Comment added successfully',
            'comment': comment.to_dict(),
            'comments_count': post.comments_count
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@posts_bp.route('/posts/<post_id>/comments', methods=['GET'])
# @jwt_required()
def get_comments(post_id):
    """Get comments for a post"""
    try:
        post = Post.query.get_or_404(post_id)
        
        from models.post import PostComment
        comments = PostComment.query.filter_by(post_id=post_id).order_by(PostComment.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'comments': [comment.to_dict() for comment in comments],
            'total': len(comments)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@posts_bp.route('/posts/<post_id>/share', methods=['POST'])
# @jwt_required()
def share_post(post_id):
    """Share a post with visibility controls"""
    try:
        current_user_id = "17c9109e-cb20-4723-be49-c26b8343cd19"  # get_jwt_identity() - using test user ID
        data = request.get_json() or {}
        
        # Get the original post
        original_post = Post.query.get_or_404(post_id)
        
        if not original_post.is_active:
            return jsonify({'error': 'Post not found'}), 404
        
        # Get share parameters
        share_visibility = data.get('visibility', 'public')
        share_message = data.get('message', '')
        
        # Create the shared post content
        shared_content = f"Shared: {original_post.content}"
        if share_message:
            shared_content = f"{share_message}\n\n{shared_content}"
        
        # Create shared post
        shared_post = Post(
            user_id=current_user_id,
            content=shared_content,
            post_type='share',
            visibility=share_visibility,
            location=original_post.location,
            shared_from_post_id=original_post.id
        )
        
        db.session.add(shared_post)
        
        # Update original post share count
        original_post.shares_count = (original_post.shares_count or 0) + 1
        original_post.save()
        
        # Create share record
        from models.post import PostShare
        share_record = PostShare(
            post_id=original_post.id,
            user_id=current_user_id,
            share_type='share',
            share_platform='web',
            share_message=share_message,
            share_visibility=share_visibility
        )
        db.session.add(share_record)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Post shared successfully',
            'shared_post': shared_post.to_dict(),
            'shares_count': original_post.shares_count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500