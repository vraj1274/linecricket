from flask import Blueprint, request, jsonify, current_app
from models import User, UserProfile, Match, Post, db
from sqlalchemy import or_, and_
import logging

logger = logging.getLogger(__name__)

search_bp = Blueprint('search', __name__)

@search_bp.route('/users', methods=['GET'])
def search_users():
    """Search for users by username, name, or location"""
    try:
        query = request.args.get('q', '').strip()
        search_type = request.args.get('type', 'all')  # all, players, coaches, teams
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        # Base query for users
        user_query = User.query.join(User.profile)
        
        # Apply search filters
        search_filters = or_(
            User.username.ilike(f'%{query}%'),
            UserProfile.full_name.ilike(f'%{query}%'),
            UserProfile.location.ilike(f'%{query}%'),
            UserProfile.organization.ilike(f'%{query}%')
        )
        
        user_query = user_query.filter(search_filters)
        
        # Apply type filters
        if search_type == 'players':
            # Filter for users with cricket stats
            user_query = user_query.filter(UserProfile.batting_skill > 0)
        elif search_type == 'coaches':
            # Filter for users with coaching experience
            user_query = user_query.filter(UserProfile.organization.ilike('%coach%'))
        elif search_type == 'teams':
            # Filter for users with team/organization info
            user_query = user_query.filter(UserProfile.organization.isnot(None))
        
        users = user_query.paginate(page=page, per_page=per_page, error_out=False)
        
        users_data = []
        for user in users.items:
            user_dict = {
                'id': user.id,
                'username': user.username,
                'profile': user.profile.to_dict() if user.profile else None,
                'is_verified': user.is_verified
            }
            users_data.append(user_dict)
        
        return jsonify({
            'users': users_data,
            'pagination': {
                'page': users.page,
                'pages': users.pages,
                'per_page': users.per_page,
                'total': users.total,
                'has_next': users.has_next,
                'has_prev': users.has_prev
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Search users error: {e}")
        return jsonify({'error': 'Failed to search users'}), 500

@search_bp.route('/matches', methods=['GET'])
def search_matches():
    """Search for matches by title, location, or type"""
    try:
        query = request.args.get('q', '').strip()
        match_type = request.args.get('type')
        location = request.args.get('location')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        # Base query for matches
        match_query = Match.query
        
        # Apply search filters
        search_filters = or_(
            Match.title.ilike(f'%{query}%'),
            Match.description.ilike(f'%{query}%'),
            Match.location.ilike(f'%{query}%'),
            Match.venue.ilike(f'%{query}%')
        )
        
        match_query = match_query.filter(search_filters)
        
        # Apply additional filters
        if match_type:
            try:
                from models.match import MatchType
                match_type_enum = MatchType(match_type)
                match_query = match_query.filter_by(match_type=match_type_enum)
            except ValueError:
                return jsonify({'error': 'Invalid match type'}), 400
        
        if location:
            match_query = match_query.filter(Match.location.ilike(f'%{location}%'))
        
        matches = match_query.order_by(Match.match_date.asc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        matches_data = []
        for match in matches.items:
            match_dict = match.to_dict()
            matches_data.append(match_dict)
        
        return jsonify({
            'matches': matches_data,
            'pagination': {
                'page': matches.page,
                'pages': matches.pages,
                'per_page': matches.per_page,
                'total': matches.total,
                'has_next': matches.has_next,
                'has_prev': matches.has_prev
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Search matches error: {e}")
        return jsonify({'error': 'Failed to search matches'}), 500

@search_bp.route('/posts', methods=['GET'])
def search_posts():
    """Search for posts by content"""
    try:
        query = request.args.get('q', '').strip()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        # Search in post content
        posts = Post.query.filter(
            Post.content.ilike(f'%{query}%')
        ).order_by(Post.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        posts_data = []
        for post in posts.items:
            post_dict = post.to_dict()
            posts_data.append(post_dict)
        
        return jsonify({
            'posts': posts_data,
            'pagination': {
                'page': posts.page,
                'pages': posts.pages,
                'per_page': posts.per_page,
                'total': posts.total,
                'has_next': posts.has_next,
                'has_prev': posts.has_prev
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Search posts error: {e}")
        return jsonify({'error': 'Failed to search posts'}), 500

@search_bp.route('/global', methods=['GET'])
def global_search():
    """Global search across users, matches, and posts"""
    try:
        query = request.args.get('q', '').strip()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        results = {
            'users': [],
            'matches': [],
            'posts': []
        }
        
        # Search users
        users = User.query.join(User.profile).filter(
            or_(
                User.username.ilike(f'%{query}%'),
                UserProfile.full_name.ilike(f'%{query}%'),
                UserProfile.location.ilike(f'%{query}%')
            )
        ).limit(5).all()
        
        for user in users:
            results['users'].append({
                'id': user.id,
                'username': user.username,
                'profile': user.profile.to_dict() if user.profile else None,
                'is_verified': user.is_verified
            })
        
        # Search matches
        matches = Match.query.filter(
            or_(
                Match.title.ilike(f'%{query}%'),
                Match.location.ilike(f'%{query}%')
            )
        ).limit(5).all()
        
        for match in matches:
            results['matches'].append(match.to_dict())
        
        # Search posts
        posts = Post.query.filter(
            Post.content.ilike(f'%{query}%')
        ).limit(5).all()
        
        for post in posts:
            results['posts'].append(post.to_dict())
        
        return jsonify({
            'results': results,
            'query': query
        }), 200
        
    except Exception as e:
        logger.error(f"Global search error: {e}")
        return jsonify({'error': 'Failed to perform global search'}), 500

@search_bp.route('/suggestions', methods=['GET'])
def get_search_suggestions():
    """Get search suggestions based on popular searches"""
    try:
        query = request.args.get('q', '').strip()
        
        if len(query) < 2:
            return jsonify({'suggestions': []}), 200
        
        suggestions = []
        
        # Get username suggestions
        users = User.query.filter(
            User.username.ilike(f'{query}%')
        ).limit(3).all()
        
        for user in users:
            suggestions.append({
                'type': 'user',
                'text': user.username,
                'id': user.id
            })
        
        # Get match title suggestions
        matches = Match.query.filter(
            Match.title.ilike(f'{query}%')
        ).limit(3).all()
        
        for match in matches:
            suggestions.append({
                'type': 'match',
                'text': match.title,
                'id': match.id
            })
        
        # Get location suggestions
        locations = db.session.query(Match.location).filter(
            Match.location.ilike(f'{query}%')
        ).distinct().limit(3).all()
        
        for location in locations:
            suggestions.append({
                'type': 'location',
                'text': location[0],
                'id': None
            })
        
        return jsonify({
            'suggestions': suggestions[:10]  # Limit to 10 suggestions
        }), 200
        
    except Exception as e:
        logger.error(f"Get search suggestions error: {e}")
        return jsonify({'error': 'Failed to get search suggestions'}), 500
