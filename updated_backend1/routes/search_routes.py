from flask import Blueprint, request, jsonify
from sqlalchemy import text, func, or_, and_, desc, asc
from models.base import db
from models.profile_page import ProfilePage
from models.user import User, UserProfile
from models.post import Post
import logging
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

search_routes = Blueprint('search_routes', __name__)

@search_routes.route('/search/profiles', methods=['GET'])
def search_profiles():
    """
    Advanced profile search with PostgreSQL full-text search
    """
    try:
        # Get search parameters
        query = request.args.get('q', '').strip()
        profile_type = request.args.get('type', 'all')
        sort_by = request.args.get('sort', 'name')
        sort_order = request.args.get('order', 'asc')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        logger.info(f"🔍 Search request: query='{query}', type='{profile_type}', sort='{sort_by}'")
        
        # Build base query
        base_query = db.session.query(ProfilePage)
        
        # Apply text search if query provided
        if query:
            # Use PostgreSQL full-text search with proper syntax
            base_query = base_query.filter(
                or_(
                    text("to_tsvector('english', academy_name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) @@ plainto_tsquery('english', :query)"),
                    ProfilePage.academy_name.ilike(f'%{query}%'),
                    ProfilePage.description.ilike(f'%{query}%'),
                    ProfilePage.tagline.ilike(f'%{query}%')
                )
            ).params(query=query)
        
        # Apply type filter
        if profile_type != 'all':
            base_query = base_query.filter(ProfilePage.page_type == profile_type)
        
        # Apply sorting
        if sort_by == 'name':
            order_column = ProfilePage.academy_name
        elif sort_by == 'type':
            order_column = ProfilePage.page_type
        elif sort_by == 'created':
            order_column = ProfilePage.created_at
        elif sort_by == 'updated':
            order_column = ProfilePage.updated_at
        else:
            order_column = ProfilePage.academy_name
        
        if sort_order == 'desc':
            base_query = base_query.order_by(order_column.desc())
        else:
            base_query = base_query.order_by(order_column.asc())
        
        # Get total count
        total_count = base_query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        profiles = base_query.offset(offset).limit(per_page).all()
        
        # Convert to response format
        results = []
        for profile in profiles:
            results.append({
                'id': str(profile.page_id),
                'name': profile.academy_name,
                'type': profile.page_type.lower(),
                'description': profile.description,
                'tagline': profile.tagline,
                'city': profile.city,
                'state': profile.state,
                'country': profile.country,
                'created_at': profile.created_at.isoformat(),
                'updated_at': profile.updated_at.isoformat(),
                'is_public': profile.is_public,
                'is_verified': profile.is_verified
            })
        
        logger.info(f"✅ Found {len(results)} profiles out of {total_count} total")
        
        return jsonify({
            'success': True,
            'profiles': results,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total_count,
                'pages': (total_count + per_page - 1) // per_page,
                'has_next': page * per_page < total_count,
                'has_prev': page > 1
            },
            'search_info': {
                'query': query,
                'type': profile_type,
                'sort_by': sort_by,
                'sort_order': sort_order
            }
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Search error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@search_routes.route('/search/posts', methods=['GET'])
def search_posts():
    """
    Advanced post search with PostgreSQL full-text search
    """
    try:
        # Get search parameters
        query = request.args.get('q', '').strip()
        post_type = request.args.get('type', 'all')
        sort_by = request.args.get('sort', 'created_at')
        sort_order = request.args.get('order', 'desc')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        logger.info(f"🔍 Post search request: query='{query}', type='{post_type}'")
        
        # Build base query
        base_query = db.session.query(Post).join(User, Post.user_id == User.id)
        
        # Apply text search if query provided
        if query:
            # Use PostgreSQL full-text search with proper syntax
            base_query = base_query.filter(
                or_(
                    text("to_tsvector('english', content || ' ' || COALESCE(location, '')) @@ plainto_tsquery('english', :query)"),
                    Post.content.ilike(f'%{query}%'),
                    Post.location.ilike(f'%{query}%')
                )
            ).params(query=query)
        
        # Apply type filter
        if post_type != 'all':
            base_query = base_query.filter(Post.post_type == post_type)
        
        # Apply sorting
        if sort_by == 'created_at':
            order_column = Post.created_at
        elif sort_by == 'likes':
            order_column = Post.likes_count
        elif sort_by == 'comments':
            order_column = Post.comments_count
        else:
            order_column = Post.created_at
        
        if sort_order == 'asc':
            base_query = base_query.order_by(order_column.asc())
        else:
            base_query = base_query.order_by(order_column.desc())
        
        # Get total count
        total_count = base_query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        posts = base_query.offset(offset).limit(per_page).all()
        
        # Convert to response format
        results = []
        for post in posts:
            results.append(post.to_dict())
        
        logger.info(f"✅ Found {len(results)} posts out of {total_count} total")
        
        return jsonify({
            'success': True,
            'posts': results,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total_count,
                'pages': (total_count + per_page - 1) // per_page,
                'has_next': page * per_page < total_count,
                'has_prev': page > 1
            },
            'search_info': {
                'query': query,
                'type': post_type,
                'sort_by': sort_by,
                'sort_order': sort_order
            }
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Post search error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@search_routes.route('/search/suggestions', methods=['GET'])
def search_suggestions():
    """
    Get search suggestions based on partial input
    """
    try:
        query = request.args.get('q', '').strip()
        limit = int(request.args.get('limit', 10))
        
        if len(query) < 2:
            return jsonify({
                'success': True,
                'suggestions': []
            }), 200
        
        # Get profile name suggestions
        profile_suggestions = db.session.query(ProfilePage.academy_name)\
            .filter(ProfilePage.academy_name.ilike(f'%{query}%'))\
            .distinct()\
            .limit(limit)\
            .all()
        
        # Get username suggestions
        user_suggestions = db.session.query(User.username)\
            .filter(User.username.ilike(f'%{query}%'))\
            .distinct()\
            .limit(limit)\
            .all()
        
        suggestions = []
        
        # Add profile suggestions
        for suggestion in profile_suggestions:
            suggestions.append({
                'text': suggestion[0],
                'type': 'profile',
                'category': 'Profiles'
            })
        
        # Add user suggestions
        for suggestion in user_suggestions:
            suggestions.append({
                'text': suggestion[0],
                'type': 'user',
                'category': 'Users'
            })
        
        # Remove duplicates and limit results
        seen = set()
        unique_suggestions = []
        for suggestion in suggestions:
            if suggestion['text'] not in seen:
                seen.add(suggestion['text'])
                unique_suggestions.append(suggestion)
                if len(unique_suggestions) >= limit:
                    break
        
        return jsonify({
            'success': True,
            'suggestions': unique_suggestions
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Suggestions error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@search_routes.route('/search/analytics', methods=['GET'])
def search_analytics():
    """
    Get search analytics and statistics
    """
    try:
        # Get profile type distribution
        profile_types = db.session.query(
            ProfilePage.page_type,
            func.count(ProfilePage.page_id).label('count')
        ).group_by(ProfilePage.page_type).all()
        
        # Get recent activity
        recent_profiles = db.session.query(ProfilePage)\
            .order_by(ProfilePage.created_at.desc())\
            .limit(5)\
            .all()
        
        # Get total counts
        total_profiles = db.session.query(ProfilePage).count()
        total_users = db.session.query(User).count()
        total_posts = db.session.query(Post).count()
        
        analytics = {
            'totals': {
                'profiles': total_profiles,
                'users': total_users,
                'posts': total_posts
            },
            'profile_types': [
                {'type': pt[0], 'count': pt[1]} 
                for pt in profile_types
            ],
            'recent_activity': [
                {
                    'id': str(p.page_id),
                    'name': p.academy_name,
                    'type': p.page_type,
                    'created_at': p.created_at.isoformat()
                }
                for p in recent_profiles
            ]
        }
        
        return jsonify({
            'success': True,
            'analytics': analytics
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Analytics error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@search_routes.route('/search/comprehensive', methods=['GET'])
def comprehensive_search():
    """
    Comprehensive search across all database tables
    """
    try:
        # Get search parameters
        query = request.args.get('q', '').strip()
        search_type = request.args.get('type', 'all')  # all, users, pages, posts, videos
        sort_by = request.args.get('sort', 'relevance')
        sort_order = request.args.get('order', 'desc')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        logger.info(f"🔍 Comprehensive search: query='{query}', type='{search_type}'")
        
        results = {
            'users': [],
            'pages': [],
            'posts': [],
            'videos': [],
            'total_results': 0,
            'search_info': {
                'query': query,
                'type': search_type,
                'sort_by': sort_by,
                'sort_order': sort_order
            }
        }
        
        if not query:
            return jsonify({
                'success': True,
                'results': results,
                'message': 'Please provide a search query'
            }), 200
        
        # Search Users (Registered Users)
        if search_type in ['all', 'users']:
            users = search_users_comprehensive(query, sort_by, sort_order, page, per_page)
            results['users'] = users
        
        # Search Pages (Academies, Venues, Communities)
        if search_type in ['all', 'pages']:
            pages = search_pages_comprehensive(query, sort_by, sort_order, page, per_page)
            results['pages'] = pages
        
        # Search Posts
        if search_type in ['all', 'posts']:
            posts = search_posts_comprehensive(query, sort_by, sort_order, page, per_page)
            results['posts'] = posts
        
        # Search Videos
        if search_type in ['all', 'videos']:
            videos = search_videos_comprehensive(query, sort_by, sort_order, page, per_page)
            results['videos'] = videos
        
        # Calculate total results
        results['total_results'] = len(results['users']) + len(results['pages']) + len(results['posts']) + len(results['videos'])
        
        logger.info(f"✅ Found {results['total_results']} total results")
        
        return jsonify({
            'success': True,
            'results': results,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': results['total_results']
            }
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Comprehensive search error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def search_users_comprehensive(query, sort_by, sort_order, page, per_page):
    """Search registered users from database"""
    try:
        # Build search query for users
        search_conditions = or_(
            User.username.ilike(f'%{query}%'),
            User.email.ilike(f'%{query}%'),
            UserProfile.full_name.ilike(f'%{query}%'),
            UserProfile.bio.ilike(f'%{query}%'),
            UserProfile.location.ilike(f'%{query}%')
        )
        
        # Join with UserProfile for comprehensive search
        query_builder = db.session.query(User, UserProfile)\
            .join(UserProfile, User.id == UserProfile.user_id)\
            .filter(search_conditions)\
            .filter(User.is_active == True)
        
        # Apply sorting
        if sort_by == 'name':
            order_column = UserProfile.full_name
        elif sort_by == 'username':
            order_column = User.username
        elif sort_by == 'created':
            order_column = User.created_at
        elif sort_by == 'activity':
            order_column = User.updated_at
        else:  # relevance
            order_column = User.username
        
        if sort_order == 'desc':
            query_builder = query_builder.order_by(desc(order_column))
        else:
            query_builder = query_builder.order_by(asc(order_column))
        
        # Apply pagination
        offset = (page - 1) * per_page
        users_data = query_builder.offset(offset).limit(per_page).all()
        
        # Format results
        users = []
        for user, profile in users_data:
            users.append({
                'id': str(user.id),
                'type': 'user',
                'username': user.username,
                'email': user.email,
                'full_name': profile.full_name if profile else user.username,
                'bio': profile.bio if profile else '',
                'location': profile.location if profile else '',
                'avatar': profile.profile_image_url if profile else '',
                'is_verified': user.is_verified,
                'is_active': user.is_active,
                'created_at': user.created_at.isoformat(),
                'updated_at': user.updated_at.isoformat(),
                'profile_type': profile.profile_type if profile else 'player'
            })
        
        return users
        
    except Exception as e:
        logger.error(f"❌ User search error: {e}")
        return []

def search_pages_comprehensive(query, sort_by, sort_order, page, per_page):
    """Search pages (academies, venues, communities) from database"""
    try:
        # Build search query for pages
        search_conditions = or_(
            ProfilePage.academy_name.ilike(f'%{query}%'),
            ProfilePage.description.ilike(f'%{query}%'),
            ProfilePage.tagline.ilike(f'%{query}%'),
            ProfilePage.city.ilike(f'%{query}%'),
            ProfilePage.state.ilike(f'%{query}%')
        )
        
        query_builder = db.session.query(ProfilePage)\
            .filter(search_conditions)\
            .filter(ProfilePage.is_public == True)
        
        # Apply sorting
        if sort_by == 'name':
            order_column = ProfilePage.academy_name
        elif sort_by == 'type':
            order_column = ProfilePage.page_type
        elif sort_by == 'created':
            order_column = ProfilePage.created_at
        elif sort_by == 'activity':
            order_column = ProfilePage.updated_at
        else:  # relevance
            order_column = ProfilePage.academy_name
        
        if sort_order == 'desc':
            query_builder = query_builder.order_by(desc(order_column))
        else:
            query_builder = query_builder.order_by(asc(order_column))
        
        # Apply pagination
        offset = (page - 1) * per_page
        pages_data = query_builder.offset(offset).limit(per_page).all()
        
        # Format results
        pages = []
        for page in pages_data:
            pages.append({
                'id': str(page.page_id),
                'type': 'page',
                'page_type': page.page_type.lower(),
                'name': page.academy_name,
                'description': page.description,
                'tagline': page.tagline,
                'city': page.city,
                'state': page.state,
                'country': page.country,
                'contact_person': page.contact_person,
                'contact_email': page.contact_email,
                'contact_phone': page.contact_phone,
                'is_public': page.is_public,
                'is_verified': page.is_verified,
                'created_at': page.created_at.isoformat(),
                'updated_at': page.updated_at.isoformat()
            })
        
        return pages
        
    except Exception as e:
        logger.error(f"❌ Page search error: {e}")
        return []

def search_posts_comprehensive(query, sort_by, sort_order, page, per_page):
    """Search posts from database"""
    try:
        # Build search query for posts
        search_conditions = or_(
            Post.content.ilike(f'%{query}%'),
            Post.location.ilike(f'%{query}%')
        )
        
        # Join with User to get author info
        query_builder = db.session.query(Post, User)\
            .join(User, Post.user_id == User.id)\
            .filter(search_conditions)\
            .filter(Post.is_active == True)
        
        # Apply sorting
        if sort_by == 'created':
            order_column = Post.created_at
        elif sort_by == 'likes':
            order_column = Post.likes_count
        elif sort_by == 'comments':
            order_column = Post.comments_count
        elif sort_by == 'engagement':
            order_column = Post.engagement_score
        else:  # relevance
            order_column = Post.created_at
        
        if sort_order == 'desc':
            query_builder = query_builder.order_by(desc(order_column))
        else:
            query_builder = query_builder.order_by(asc(order_column))
        
        # Apply pagination
        offset = (page - 1) * per_page
        posts_data = query_builder.offset(offset).limit(per_page).all()
        
        # Format results
        posts = []
        for post, user in posts_data:
            posts.append({
                'id': str(post.id),
                'type': 'post',
                'content': post.content,
                'post_type': post.post_type,
                'image_url': post.image_url,
                'video_url': post.video_url,
                'location': post.location,
                'likes_count': post.likes_count,
                'comments_count': post.comments_count,
                'shares_count': post.shares_count,
                'views_count': post.views_count,
                'created_at': post.created_at.isoformat(),
                'author': {
                    'id': str(user.id),
                    'username': user.username,
                    'email': user.email
                }
            })
        
        return posts
        
    except Exception as e:
        logger.error(f"❌ Post search error: {e}")
        return []

def search_videos_comprehensive(query, sort_by, sort_order, page, per_page):
    """Search videos (posts with video_url) from database"""
    try:
        # Build search query for videos
        search_conditions = and_(
            Post.video_url.isnot(None),
            Post.video_url != '',
            or_(
                Post.content.ilike(f'%{query}%'),
                Post.location.ilike(f'%{query}%')
            )
        )
        
        # Join with User to get author info
        query_builder = db.session.query(Post, User)\
            .join(User, Post.user_id == User.id)\
            .filter(search_conditions)\
            .filter(Post.is_active == True)
        
        # Apply sorting
        if sort_by == 'created':
            order_column = Post.created_at
        elif sort_by == 'likes':
            order_column = Post.likes_count
        elif sort_by == 'comments':
            order_column = Post.comments_count
        elif sort_by == 'views':
            order_column = Post.views_count
        else:  # relevance
            order_column = Post.created_at
        
        if sort_order == 'desc':
            query_builder = query_builder.order_by(desc(order_column))
        else:
            query_builder = query_builder.order_by(asc(order_column))
        
        # Apply pagination
        offset = (page - 1) * per_page
        videos_data = query_builder.offset(offset).limit(per_page).all()
        
        # Format results
        videos = []
        for post, user in videos_data:
            videos.append({
                'id': str(post.id),
                'type': 'video',
                'content': post.content,
                'video_url': post.video_url,
                'thumbnail_url': post.image_url,  # Use image_url as thumbnail
                'location': post.location,
                'likes_count': post.likes_count,
                'comments_count': post.comments_count,
                'shares_count': post.shares_count,
                'views_count': post.views_count,
                'duration': None,  # Could be added to Post model
                'created_at': post.created_at.isoformat(),
                'author': {
                    'id': str(user.id),
                    'username': user.username,
                    'email': user.email
                }
            })
        
        return videos
        
    except Exception as e:
        logger.error(f"❌ Video search error: {e}")
        return []