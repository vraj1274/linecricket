from flask import Blueprint, request, jsonify
from models import db, Post, PostLike, PostComment, PostBookmark, User
from datetime import datetime
import re
<<<<<<< HEAD
from utils.firebase_auth import get_user_id_from_token, get_user_info_from_token
=======
import uuid
>>>>>>> 22158ac5d1d06ca18cc5cf739625cf0b44215b68

feed_bp = Blueprint('feed', __name__)

@feed_bp.route('/feed', methods=['GET'])
def get_feed():
    """
    Get the main feed with posts
    ---
    tags:
      - Feed
    parameters:
      - in: query
        name: page
        type: integer
        default: 1
        description: Page number
      - in: query
        name: per_page
        type: integer
        default: 20
        description: Items per page
      - in: query
        name: post_type
        type: string
        description: Filter by post type (text, image, video, poll)
      - in: query
        name: hashtag
        type: string
        description: Filter by hashtag
      - in: query
        name: search
        type: string
        description: Search query
    responses:
      200:
        description: Feed retrieved successfully
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        post_type = request.args.get('post_type')
        hashtag = request.args.get('hashtag')
        search_query = request.args.get('search')
        
        # Get current user ID if authenticated
        current_user_id = None
        try:
<<<<<<< HEAD
            # Get user ID from Firebase token in Authorization header
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                # Extract user ID from Firebase token
                current_user_id = get_user_id_from_token(token)
                if current_user_id:
                    print(f"✅ Authenticated user: {current_user_id}")
                else:
                    print("❌ Invalid token")
        except Exception as e:
            print(f"❌ Authentication error: {e}")
=======
            current_user_id = uuid.UUID("17c9109e-cb20-4723-be49-c26b8343cd19")  # Convert to UUID object
        except:
>>>>>>> 22158ac5d1d06ca18cc5cf739625cf0b44215b68
            pass  # Not authenticated, show public posts only
        
        if search_query:
            # Search posts
            pagination = Post.search_posts(search_query, page, per_page, current_user_id)
        else:
            # Get feed posts
            pagination = Post.get_feed_posts(current_user_id, page, per_page, post_type, hashtag)
        
        posts = []
        for post in pagination.items:
            post_dict = post.to_dict()
            
            # Add user-specific data if authenticated
            if current_user_id:
                post_dict['is_liked'] = post.is_liked_by(current_user_id)
                post_dict['is_bookmarked'] = post.is_bookmarked_by(current_user_id)
                post_dict['is_shared'] = post.is_shared_by(current_user_id)
            else:
                post_dict['is_liked'] = False
                post_dict['is_bookmarked'] = False
                post_dict['is_shared'] = False
            
            posts.append(post_dict)
        
        return jsonify({
            'posts': posts,
            'pagination': {
                'page': pagination.page,
                'per_page': pagination.per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feed_bp.route('/feed/trending', methods=['GET'])
def get_trending_feed():
    """
    Get trending posts
    ---
    tags:
      - Feed
    parameters:
      - in: query
        name: page
        type: integer
        default: 1
        description: Page number
      - in: query
        name: per_page
        type: integer
        default: 20
        description: Items per page
      - in: query
        name: timeframe
        type: string
        default: 24h
        description: Timeframe for trending (24h, 7d)
    responses:
      200:
        description: Trending posts retrieved successfully
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        timeframe = request.args.get('timeframe', '24h')
        
        pagination = Post.get_trending_posts(page, per_page, timeframe)
        
        posts = []
        for post in pagination.items:
            post_dict = post.to_dict()
            posts.append(post_dict)
        
        return jsonify({
            'trending_posts': posts,
            'pagination': {
                'page': pagination.page,
                'per_page': pagination.per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feed_bp.route('/posts', methods=['POST'])
def create_post():
    """
    Create a new post
    ---
    tags:
      - Feed
    parameters:
      - in: body
        name: post_data
        description: Post data
        required: true
        schema:
          type: object
          properties:
            content:
              type: string
              description: Post content
              example: "Great cricket match today! #cricket #victory"
            image_url:
              type: string
              description: Image URL
              example: "https://example.com/image.jpg"
            image_caption:
              type: string
              description: Image caption
              example: "Team celebration"
            location:
              type: string
              description: Post location
              example: "Mumbai, India"
            post_type:
              type: string
              enum: [text, image, video, poll]
              default: text
            visibility:
              type: string
              enum: [public, friends, private]
              default: public
    responses:
      201:
        description: Post created successfully
      400:
        description: Bad request
    """
    try:
<<<<<<< HEAD
        # Get current user ID from Firebase token
        current_user_id = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                # Extract user ID from Firebase token
                current_user_id = get_user_id_from_token(token)
                if current_user_id:
                    print(f"✅ Creating post for user: {current_user_id}")
                else:
                    print("❌ Invalid token")
            except Exception as e:
                print(f"❌ Token processing error: {e}")
        
        if not current_user_id:
            print("❌ No valid authentication found")
            return jsonify({'error': 'Authentication required. Please log in again.'}), 401
            
=======
        current_user_id = uuid.UUID("17c9109e-cb20-4723-be49-c26b8343cd19")  # Convert to UUID object
>>>>>>> 22158ac5d1d06ca18cc5cf739625cf0b44215b68
        data = request.get_json()
        
        if not data or 'content' not in data:
            return jsonify({'error': 'Content is required'}), 400
        
        # Create post
        post_type = data.get('post_type', 'general')
        
        # Handle image_url properly - convert to JSON if it's a string
        image_url = data.get('image_url')
        if image_url and isinstance(image_url, str):
            # If it's a single image URL string, convert to JSON array
            image_url = [image_url]
        elif image_url and isinstance(image_url, list):
            # If it's already a list, keep it as is
            pass
        else:
            image_url = None
            
        # Create post with page-specific fields
        post_data = {
            'user_id': current_user_id,
            'content': data['content'],
            'image_url': image_url,
            'video_url': data.get('video_url'),
            'location': data.get('location'),
            'post_type': post_type,
            'visibility': data.get('visibility', 'public'),
            'page_id': data.get('page_id')
        }
        
        # Set the appropriate profile_id based on page_type
        page_type = data.get('page_type')
        if page_type and data.get('page_id'):
            if page_type == 'community':
                post_data['community_profile_id'] = data.get('page_id')
            elif page_type == 'academy':
                post_data['academy_profile_id'] = data.get('page_id')
            elif page_type == 'venue':
                post_data['venue_profile_id'] = data.get('page_id')
        
        post = Post(**post_data)
        
        db.session.add(post)
        db.session.commit()
        
        # Extract hashtags and mentions
        try:
            post.extract_hashtags_and_mentions()
        except Exception as e:
            print(f"Error extracting hashtags: {e}")
        
        # Update search vector
        try:
            post.update_search_vector()
        except Exception as e:
            print(f"Error updating search vector: {e}")
        
        # Calculate initial engagement score
        try:
            post.calculate_engagement_score()
        except Exception as e:
            print(f"Error calculating engagement score: {e}")
        
        return jsonify({
            'success': True,
            'message': 'Post created successfully',
            'post': post.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@feed_bp.route('/posts', methods=['GET'])
def get_posts():
    """Get all posts with pagination and optional page_id filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        sort_by = request.args.get('sort_by', 'created_at')
        order = request.args.get('order', 'desc')
        page_id = request.args.get('page_id')  # Add page_id filtering
        user_id = request.args.get('user_id')  # Add user_id filtering
        
        # Use the same logic as feed posts for consistency
        current_user_id = None
        try:
            current_user_id = uuid.UUID("17c9109e-cb20-4723-be49-c26b8343cd19")  # Convert to UUID object
        except:
            pass  # Not authenticated, show public posts only
        
<<<<<<< HEAD
        # Add page_id filtering if provided
        if page_id:
            query = query.filter_by(page_id=page_id)
        
        # Add user_id filtering if provided
        if user_id:
            query = query.filter_by(user_id=user_id)
        
        # Apply sorting
        if sort_by == 'created_at':
            if order == 'desc':
                query = query.order_by(Post.created_at.desc())
            else:
                query = query.order_by(Post.created_at.asc())
        elif sort_by == 'likes_count':
            if order == 'desc':
                query = query.order_by(Post.likes_count.desc())
            else:
                query = query.order_by(Post.likes_count.asc())
        
        # Get paginated results
        posts = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
=======
        # Get feed posts using the same method as /api/feed
        posts = Post.get_feed_posts(current_user_id, page, per_page, None, None)
>>>>>>> 22158ac5d1d06ca18cc5cf739625cf0b44215b68
        
        # Convert posts to dict format
        posts_data = []
        for post in posts.items:
            post_dict = post.to_dict()
            posts_data.append(post_dict)
        
        return jsonify({
            'success': True,
            'posts': posts_data,
            'pagination': {
                'page': posts.page,
                'per_page': posts.per_page,
                'total': posts.total,
                'pages': posts.pages,
                'has_next': posts.has_next,
                'has_prev': posts.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@feed_bp.route('/posts/<post_id>/like', methods=['POST'])
def toggle_like_post(post_id):
    """
    Toggle like on a post
    ---
    tags:
      - Feed
    parameters:
      - in: path
        name: post_id
        type: integer
        required: true
        description: Post ID
    responses:
      200:
        description: Like toggled successfully
      404:
        description: Post not found
    """
    try:
        current_user_id = uuid.UUID("17c9109e-cb20-4723-be49-c26b8343cd19")  # Convert to UUID object
        
        # Check if post exists
        post = Post.query.get(post_id)
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        # Toggle like
        is_liked, message = PostLike.toggle_like(post_id, current_user_id)
        
        # Update engagement score
        post.calculate_engagement_score()
        post.update_trending_score()
        
        return jsonify({
            'message': message,
            'is_liked': is_liked,
            'likes_count': post.likes_count or 0
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feed_bp.route('/posts/<post_id>/comments', methods=['POST'])
def create_comment(post_id):
    """
    Create a comment on a post
    ---
    tags:
      - Feed
    parameters:
      - in: path
        name: post_id
        type: integer
        required: true
        description: Post ID
      - in: body
        name: comment_data
        description: Comment data
        required: true
        schema:
          type: object
          properties:
            content:
              type: string
              description: Comment content
              example: "Great post!"
            parent_comment_id:
              type: integer
              description: Parent comment ID for replies
              example: 123
    responses:
      201:
        description: Comment created successfully
      400:
        description: Bad request
      404:
        description: Post not found
    """
    try:
        current_user_id = uuid.UUID("17c9109e-cb20-4723-be49-c26b8343cd19")  # Convert to UUID object
        data = request.get_json()
        
        if not data or 'content' not in data:
            return jsonify({'error': 'Content is required'}), 400
        
        # Check if post exists
        post = Post.query.get(post_id)
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        # Create comment
        comment = PostComment.create_comment(
            post_id=post_id,
            user_id=current_user_id,
            content=data['content'],
            parent_comment_id=data.get('parent_comment_id')
        )
        
        # Update engagement score
        post.calculate_engagement_score()
        post.update_trending_score()
        
        return jsonify({
            'message': 'Comment created successfully',
            'comment': comment.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feed_bp.route('/posts/<post_id>/comments', methods=['GET'])
def get_post_comments(post_id):
    """
    Get comments for a post
    ---
    tags:
      - Feed
    parameters:
      - in: path
        name: post_id
        type: integer
        required: true
        description: Post ID
      - in: query
        name: page
        type: integer
        default: 1
        description: Page number
      - in: query
        name: per_page
        type: integer
        default: 20
        description: Items per page
    responses:
      200:
        description: Comments retrieved successfully
      404:
        description: Post not found
    """
    try:
        # Check if post exists
        post = Post.query.get(post_id)
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Get top-level comments (not replies)
        query = PostComment.query.filter_by(post_id=post_id, parent_comment_id=None)
        
        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        comments = []
        for comment in pagination.items:
            comment_dict = comment.to_dict()
            
            # Get replies for this comment
            replies = PostComment.query.filter_by(parent_comment_id=comment.id).limit(3).all()
            comment_dict['replies'] = [reply.to_dict() for reply in replies]
            
            comments.append(comment_dict)
        
        return jsonify({
            'comments': comments,
            'pagination': {
                'page': pagination.page,
                'per_page': pagination.per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feed_bp.route('/comments/<comment_id>', methods=['PATCH'])
def edit_comment(comment_id):
    """
    Edit a comment
    ---
    tags:
      - Feed
    parameters:
      - in: path
        name: comment_id
        type: integer
        required: true
        description: Comment ID
      - in: body
        name: comment_data
        description: Updated comment data
        required: true
        schema:
          type: object
          properties:
            content:
              type: string
              description: Updated comment content
              example: "Updated comment"
    responses:
      200:
        description: Comment updated successfully
      403:
        description: Forbidden - not the comment owner
      404:
        description: Comment not found
    """
    try:
        current_user_id = uuid.UUID("17c9109e-cb20-4723-be49-c26b8343cd19")  # Convert to UUID object
        
        comment = PostComment.query.get(comment_id)
        if not comment:
            return jsonify({'error': 'Comment not found'}), 404
        
        # Check if user owns the comment
        if comment.user_id != current_user_id:
            return jsonify({'error': 'Forbidden - not the comment owner'}), 403
        
        data = request.get_json()
        if not data or 'content' not in data:
            return jsonify({'error': 'Content is required'}), 400
        
        # Edit comment
        comment.edit_comment(data['content'])
        
        return jsonify({
            'message': 'Comment updated successfully',
            'comment': comment.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feed_bp.route('/comments/<comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    """
    Delete a comment
    ---
    tags:
      - Feed
    parameters:
      - in: path
        name: comment_id
        type: integer
        required: true
        description: Comment ID
    responses:
      200:
        description: Comment deleted successfully
      403:
        description: Forbidden - not the comment owner
      404:
        description: Comment not found
    """
    try:
        current_user_id = uuid.UUID("17c9109e-cb20-4723-be49-c26b8343cd19")  # Convert to UUID object
        
        comment = PostComment.query.get(comment_id)
        if not comment:
            return jsonify({'error': 'Comment not found'}), 404
        
        # Check if user owns the comment
        if comment.user_id != current_user_id:
            return jsonify({'error': 'Forbidden - not the comment owner'}), 403
        
        # Delete comment
        comment.delete_comment()
        
        return jsonify({'message': 'Comment deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feed_bp.route('/posts/<post_id>/bookmark', methods=['POST'])
def toggle_bookmark_post(post_id):
    """
    Toggle bookmark on a post
    ---
    tags:
      - Feed
    parameters:
      - in: path
        name: post_id
        type: integer
        required: true
        description: Post ID
    responses:
      200:
        description: Bookmark toggled successfully
      404:
        description: Post not found
    """
    try:
        current_user_id = uuid.UUID("17c9109e-cb20-4723-be49-c26b8343cd19")  # Convert to UUID object
        
        # Check if post exists
        post = Post.query.get(post_id)
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        # Check if already bookmarked
        existing_bookmark = PostBookmark.query.filter_by(
            post_id=post_id, 
            user_id=current_user_id
        ).first()
        
        if existing_bookmark:
            # Remove bookmark
            db.session.delete(existing_bookmark)
            post.bookmarks_count = max(0, post.bookmarks_count - 1)
            if post.bookmarked_by and current_user_id in post.bookmarked_by:
                post.bookmarked_by.remove(current_user_id)
            message = "Post unbookmarked"
            is_bookmarked = False
        else:
            # Add bookmark
            bookmark = PostBookmark(post_id=post_id, user_id=current_user_id)
            db.session.add(bookmark)
            post.bookmarks_count += 1
            if not post.bookmarked_by:
                post.bookmarked_by = []
            post.bookmarked_by.append(current_user_id)
            message = "Post bookmarked"
            is_bookmarked = True
        
        post.save()
        db.session.commit()
        
        return jsonify({
            'message': message,
            'is_bookmarked': is_bookmarked,
            'bookmarks_count': post.bookmarks_count
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feed_bp.route('/search', methods=['GET'])
def search_posts():
    """
    Search posts
    ---
    tags:
      - Feed
    parameters:
      - in: query
        name: q
        type: string
        required: true
        description: Search query
      - in: query
        name: page
        type: integer
        default: 1
        description: Page number
      - in: query
        name: per_page
        type: integer
        default: 20
        description: Items per page
    responses:
      200:
        description: Search results retrieved successfully
    """
    try:
        query = request.args.get('q')
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Get current user ID if authenticated
        current_user_id = None
        try:
            current_user_id = uuid.UUID("17c9109e-cb20-4723-be49-c26b8343cd19")  # Convert to UUID object
        except:
            pass
        
        pagination = Post.search_posts(query, page, per_page, current_user_id)
        
        posts = []
        for post in pagination.items:
            post_dict = post.to_dict()
            
            # Add user-specific data if authenticated
            if current_user_id:
                post_dict['is_liked'] = post.is_liked_by(current_user_id)
                post_dict['is_bookmarked'] = post.is_bookmarked_by(current_user_id)
            else:
                post_dict['is_liked'] = False
                post_dict['is_bookmarked'] = False
            
            posts.append(post_dict)
        
        return jsonify({
            'posts': posts,
            'query': query,
            'pagination': {
                'page': pagination.page,
                'per_page': pagination.per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feed_bp.route('/posts/<post_id>', methods=['GET'])
def get_post(post_id):
    """
    Get a specific post by ID
    ---
    tags:
      - Posts
    parameters:
      - in: path
        name: post_id
        type: string
        required: true
        description: Post ID
    responses:
      200:
        description: Post retrieved successfully
      404:
        description: Post not found
    """
    try:
        current_user_id = "17c9109e-cb20-4723-be49-c26b8343cd19"
        
        post = Post.query.get(post_id)
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        if not post.is_active:
            return jsonify({'error': 'Post not found'}), 404
        
        post_dict = post.to_dict()
        
        # Add user-specific data if authenticated
        if current_user_id:
            post_dict['is_liked'] = post.is_liked_by(current_user_id)
            post_dict['is_bookmarked'] = post.is_bookmarked_by(current_user_id)
            post_dict['is_shared'] = post.is_shared_by(current_user_id)
        else:
            post_dict['is_liked'] = False
            post_dict['is_bookmarked'] = False
            post_dict['is_shared'] = False
        
        return jsonify({
            'post': post_dict
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feed_bp.route('/posts/<post_id>', methods=['PUT'])
def update_post(post_id):
    """
    Update a post
    ---
    tags:
      - Feed
    parameters:
      - in: path
        name: post_id
        type: integer
        required: true
        description: Post ID
      - in: body
        name: post_data
        description: Updated post data
        required: true
        schema:
          type: object
          properties:
            content:
              type: string
              description: Updated post content
            location:
              type: string
              description: Updated post location
            visibility:
              type: string
              enum: [public, friends, private]
    responses:
      200:
        description: Post updated successfully
      404:
        description: Post not found
      403:
        description: Forbidden - not the post owner
    """
    try:
        current_user_id = uuid.UUID("17c9109e-cb20-4723-be49-c26b8343cd19")  # Convert to UUID object
        
        # Check if post exists
        post = Post.query.get(post_id)
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        # Check if user owns the post
        if post.user_id != current_user_id:
            return jsonify({'error': 'Forbidden - not the post owner'}), 403
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update post fields
        if 'content' in data:
            post.content = data['content']
        if 'location' in data:
            post.location = data['location']
        if 'visibility' in data:
            post.visibility = data['visibility']
        
        # Update timestamps
        post.updated_at = datetime.utcnow()
        
        # Update search vector and engagement score
        try:
            post.extract_hashtags_and_mentions()
            post.update_search_vector()
            post.calculate_engagement_score()
        except Exception as e:
            print(f"Error updating post metadata: {e}")
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Post updated successfully',
            'post': post.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@feed_bp.route('/posts/<post_id>', methods=['DELETE'])
def delete_post(post_id):
    """
    Delete a post
    ---
    tags:
      - Feed
    parameters:
      - in: path
        name: post_id
        type: integer
        required: true
        description: Post ID
    responses:
      200:
        description: Post deleted successfully
      404:
        description: Post not found
      403:
        description: Forbidden - not the post owner
    """
    try:
        current_user_id = uuid.UUID("17c9109e-cb20-4723-be49-c26b8343cd19")  # Convert to UUID object
        
        # Check if post exists
        post = Post.query.get(post_id)
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        # Check if user owns the post
        if post.user_id != current_user_id:
            return jsonify({'error': 'Forbidden - not the post owner'}), 403
        
        # Soft delete by setting is_active to False
        post.is_active = False
        post.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Post deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@feed_bp.route('/posts/my-posts', methods=['GET'])
def get_my_posts():
    """
    Get current user's posts for management
    ---
    tags:
      - Posts
    parameters:
      - in: query
        name: page
        type: integer
        default: 1
        description: Page number
      - in: query
        name: per_page
        type: integer
        default: 20
        description: Items per page
      - in: query
        name: visibility
        type: string
        description: Filter by visibility (public, followers, private)
    responses:
      200:
        description: User's posts retrieved successfully
    """
    try:
        current_user_id = "17c9109e-cb20-4723-be49-c26b8343cd19"
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        visibility_filter = request.args.get('visibility')
        
        # Get user's posts
        query = Post.query.filter_by(user_id=current_user_id)
        
        # Filter by visibility if specified
        if visibility_filter:
            query = query.filter_by(visibility=visibility_filter)
        
        # Order by creation date (newest first)
        query = query.order_by(Post.created_at.desc())
        
        # Paginate results
        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        posts = []
        for post in pagination.items:
            post_dict = post.to_dict()
            post_dict['is_liked'] = post.is_liked_by(current_user_id)
            post_dict['is_bookmarked'] = post.is_bookmarked_by(current_user_id)
            post_dict['is_shared'] = post.is_shared_by(current_user_id)
            posts.append(post_dict)
        
        return jsonify({
            'posts': posts,
            'pagination': {
                'page': pagination.page,
                'pages': pagination.pages,
                'per_page': pagination.per_page,
                'total': pagination.total,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feed_bp.route('/posts/<post_id>/visibility', methods=['PUT'])
def update_post_visibility(post_id):
    """
    Update post visibility
    ---
    tags:
      - Posts
    parameters:
      - in: path
        name: post_id
        type: string
        required: true
        description: Post ID
      - in: body
        name: visibility_data
        description: Visibility data
        schema:
          type: object
          properties:
            visibility:
              type: string
              enum: [public, followers, private]
              description: New visibility setting
    responses:
      200:
        description: Post visibility updated successfully
      403:
        description: Forbidden - not the post owner
      404:
        description: Post not found
    """
    try:
        current_user_id = "17c9109e-cb20-4723-be49-c26b8343cd19"
        data = request.get_json()
        
        if not data or 'visibility' not in data:
            return jsonify({'error': 'Visibility is required'}), 400
        
        post = Post.query.get(post_id)
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        if post.user_id != current_user_id:
            return jsonify({'error': 'Forbidden - not the post owner'}), 403
        
        # Update visibility
        post.visibility = data['visibility']
        post.updated_at = datetime.utcnow()
        post.save()
        
        return jsonify({
            'success': True,
            'message': 'Post visibility updated successfully',
            'post': post.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

