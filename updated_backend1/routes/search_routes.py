from flask import Blueprint, request, jsonify
from sqlalchemy import text, func, or_, and_
from models.base import db
from models.profile_page import ProfilePage
from models.user import User
from models.post import Post
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

search_bp = Blueprint('search', __name__)

@search_bp.route('/search/profiles', methods=['GET'])
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
            # Use PostgreSQL full-text search
            search_vector = func.to_tsvector('english', 
                ProfilePage.academy_name + ' ' + 
                func.coalesce(ProfilePage.description, '') + ' ' +
                func.coalesce(ProfilePage.tagline, '')
            )
            search_query = func.plainto_tsquery('english', query)
            
            base_query = base_query.filter(
                or_(
                    search_vector.match(search_query),
                    ProfilePage.academy_name.ilike(f'%{query}%'),
                    ProfilePage.description.ilike(f'%{query}%'),
                    ProfilePage.tagline.ilike(f'%{query}%')
                )
            )
        
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

@search_bp.route('/search/posts', methods=['GET'])
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
            # Use PostgreSQL full-text search
            search_vector = func.to_tsvector('english', 
                Post.content + ' ' + 
                func.coalesce(Post.location, '')
            )
            search_query = func.plainto_tsquery('english', query)
            
            base_query = base_query.filter(
                or_(
                    search_vector.match(search_query),
                    Post.content.ilike(f'%{query}%'),
                    Post.location.ilike(f'%{query}%')
                )
            )
        
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

@search_bp.route('/search/suggestions', methods=['GET'])
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

@search_bp.route('/search/analytics', methods=['GET'])
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