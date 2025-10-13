from flask import Blueprint, request, jsonify, current_app
from models import User, UserProfile, Match, Post, db
from models import ProfilePage, Job, Member, UserStats
from sqlalchemy import or_, and_, desc, func
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

@search_bp.route('/', methods=['GET'])
def main_search():
    """Main search endpoint that handles all search types"""
    try:
        query = request.args.get('q', '').strip()
        category = request.args.get('category', 'all')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        if not query:
            return jsonify({'success': False, 'message': 'Search query is required'}), 400
        
        results = []
        
        if category == 'all':
            # Search across all content types
            results.extend(_search_users(query, page, per_page))
            results.extend(_search_matches(query, page, per_page))
            results.extend(_search_posts(query, page, per_page))
            results.extend(_search_academies(query, page, per_page))
            results.extend(_search_jobs(query, page, per_page))
            results.extend(_search_communities(query, page, per_page))
            results.extend(_search_venues(query, page, per_page))
            results.extend(_search_coaches(query, page, per_page))
        elif category == 'location':
            results.extend(_search_by_location(query, page, per_page))
        elif category == 'academy':
            results.extend(_search_academies(query, page, per_page))
        elif category == 'job':
            results.extend(_search_jobs(query, page, per_page))
        elif category == 'coach':
            results.extend(_search_coaches(query, page, per_page))
        elif category == 'community':
            results.extend(_search_communities(query, page, per_page))
        elif category == 'venue':
            results.extend(_search_venues(query, page, per_page))
        else:
            # Default to global search
            results.extend(_search_users(query, page, per_page))
            results.extend(_search_matches(query, page, per_page))
            results.extend(_search_posts(query, page, per_page))
        
        return jsonify({
            'success': True,
            'results': results,
            'query': query,
            'category': category,
            'total': len(results)
        }), 200
        
    except Exception as e:
        logger.error(f"Main search error: {e}")
        return jsonify({'success': False, 'message': 'Search failed'}), 500

@search_bp.route('/trending', methods=['GET'])
def get_trending_content():
    """Get trending content for when no search query"""
    try:
        category = request.args.get('category', 'all')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        results = []
        
        if category == 'all':
            # Get trending content from all categories
            results.extend(_get_trending_users(page, per_page))
            results.extend(_get_trending_matches(page, per_page))
            results.extend(_get_trending_posts(page, per_page))
            results.extend(_get_trending_academies(page, per_page))
            results.extend(_get_trending_jobs(page, per_page))
            results.extend(_get_trending_communities(page, per_page))
        elif category == 'location':
            results.extend(_get_trending_locations(page, per_page))
        elif category == 'academy':
            results.extend(_get_trending_academies(page, per_page))
        elif category == 'job':
            results.extend(_get_trending_jobs(page, per_page))
        elif category == 'coach':
            results.extend(_get_trending_coaches(page, per_page))
        elif category == 'community':
            results.extend(_get_trending_communities(page, per_page))
        elif category == 'venue':
            results.extend(_get_trending_venues(page, per_page))
        
        return jsonify({
            'success': True,
            'results': results,
            'category': category,
            'total': len(results)
        }), 200
        
    except Exception as e:
        logger.error(f"Get trending content error: {e}")
        return jsonify({'success': False, 'message': 'Failed to get trending content'}), 500

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

# Helper functions for different search types
def _search_users(query, page=1, per_page=5):
    """Search for users/players"""
    try:
        users = User.query.join(UserProfile).filter(
            and_(
                User.is_active == True,
                or_(
                    User.username.ilike(f'%{query}%'),
                    UserProfile.full_name.ilike(f'%{query}%'),
                    UserProfile.location.ilike(f'%{query}%'),
                    UserProfile.organization.ilike(f'%{query}%')
                )
            )
        ).limit(per_page).all()
        
        results = []
        for user in users:
            profile = user.profile
            results.append({
                'id': str(user.id),
                'name': profile.full_name if profile and profile.full_name else user.username,
                'initials': (profile.full_name[:2].upper() if profile and profile.full_name else user.username[:2].upper()),
                'followers': f"{user.posts.count()} posts",
                'type': 'Player',
                'verified': user.is_verified,
                'gradient': 'from-blue-500 to-purple-600',
                'category': 'user',
                'description': profile.organization if profile else 'Cricket Player',
                'location': profile.location if profile else None,
                'isConnected': False
            })
        return results
    except Exception as e:
        logger.error(f"Search users error: {e}")
        return []

def _search_matches(query, page=1, per_page=5):
    """Search for matches"""
    try:
        matches = Match.query.filter(
            and_(
                Match.is_active == True,
                or_(
                    Match.title.ilike(f'%{query}%'),
                    Match.description.ilike(f'%{query}%'),
                    Match.location.ilike(f'%{query}%'),
                    Match.venue.ilike(f'%{query}%')
                )
            )
        ).order_by(desc(Match.created_at)).limit(per_page).all()
        
        results = []
        for match in matches:
            results.append({
                'id': match.id,
                'name': match.title,
                'initials': match.title[:2].upper(),
                'followers': f"{match.players_needed or 0} players needed",
                'type': match.match_type.value if match.match_type else 'Match',
                'verified': True,
                'gradient': 'from-green-500 to-teal-600',
                'category': 'match',
                'description': match.description,
                'location': match.location,
                'isJoined': False
            })
        return results
    except Exception as e:
        logger.error(f"Search matches error: {e}")
        return []

def _search_posts(query, page=1, per_page=5):
    """Search for posts"""
    try:
        posts = Post.query.filter(
            Post.content.ilike(f'%{query}%')
        ).limit(per_page).all()
        
        results = []
        for post in posts:
            results.append({
                'id': post.id,
                'name': post.content[:50] + '...' if len(post.content) > 50 else post.content,
                'initials': 'PO',
                'followers': f"{post.likes_count or 0} likes",
                'type': 'Post',
                'verified': True,
                'gradient': 'from-orange-500 to-red-600',
                'category': 'post',
                'description': post.content,
                'location': None,
                'isConnected': False
            })
        return results
    except Exception as e:
        logger.error(f"Search posts error: {e}")
        return []

def _search_academies(query, page=1, per_page=5):
    """Search for academies"""
    try:
        # Search in user profiles with academy-related organizations
        users = User.query.join(User.profile).filter(
            and_(
                or_(
                    UserProfile.organization.ilike(f'%{query}%'),
                    UserProfile.organization.ilike('%academy%'),
                    UserProfile.organization.ilike('%cricket%'),
                    UserProfile.organization.ilike('%training%')
                ),
                or_(
                    UserProfile.organization.ilike('%academy%'),
                    UserProfile.organization.ilike('%cricket%'),
                    UserProfile.organization.ilike('%training%')
                )
            )
        ).limit(per_page).all()
        
        results = []
        for user in users:
            profile = user.profile
            results.append({
                'id': user.id,
                'name': profile.organization if profile and profile.organization else 'Cricket Academy',
                'initials': 'AC',
                'followers': f"{user.posts.count()} posts",
                'type': 'Academy',
                'verified': user.is_verified,
                'gradient': 'from-purple-500 to-pink-600',
                'category': 'academy',
                'description': f"Cricket training academy in {profile.location if profile else 'Unknown location'}",
                'location': profile.location if profile else None,
                'isConnected': False
            })
        return results
    except Exception as e:
        logger.error(f"Search academies error: {e}")
        return []

def _search_jobs(query, page=1, per_page=5):
    """Search for jobs"""
    try:
        # Search in posts that might be job postings
        posts = Post.query.filter(
            and_(
                Post.content.ilike(f'%{query}%'),
                or_(
                    Post.content.ilike('%job%'),
                    Post.content.ilike('%hiring%'),
                    Post.content.ilike('%position%'),
                    Post.content.ilike('%coach%'),
                    Post.content.ilike('%trainer%')
                )
            )
        ).limit(per_page).all()
        
        results = []
        for post in posts:
            results.append({
                'id': post.id,
                'name': post.content[:50] + '...' if len(post.content) > 50 else post.content,
                'initials': 'JO',
                'followers': f"{post.likes_count or 0} interested",
                'type': 'Job',
                'verified': True,
                'gradient': 'from-indigo-500 to-blue-600',
                'category': 'job',
                'description': post.content,
                'location': None,
                'isApplied': False
            })
        return results
    except Exception as e:
        logger.error(f"Search jobs error: {e}")
        return []

def _search_communities(query, page=1, per_page=5):
    """Search for communities"""
    try:
        # Search in posts that might be community-related
        posts = Post.query.filter(
            and_(
                Post.content.ilike(f'%{query}%'),
                or_(
                    Post.content.ilike('%community%'),
                    Post.content.ilike('%group%'),
                    Post.content.ilike('%team%'),
                    Post.content.ilike('%club%')
                )
            )
        ).limit(per_page).all()
        
        results = []
        for post in posts:
            results.append({
                'id': post.id,
                'name': post.content[:50] + '...' if len(post.content) > 50 else post.content,
                'initials': 'CO',
                'followers': f"{post.likes_count or 0} members",
                'type': 'Community',
                'verified': True,
                'gradient': 'from-teal-500 to-green-600',
                'category': 'community',
                'description': post.content,
                'location': None,
                'isJoined': False
            })
        return results
    except Exception as e:
        logger.error(f"Search communities error: {e}")
        return []

def _search_coaches(query, page=1, per_page=5):
    """Search for coaches"""
    try:
        users = User.query.join(User.profile).filter(
            and_(
                or_(
                    UserProfile.full_name.ilike(f'%{query}%'),
                    UserProfile.organization.ilike(f'%{query}%')
                ),
                or_(
                    UserProfile.organization.ilike('%coach%'),
                    UserProfile.organization.ilike('%trainer%'),
                    UserProfile.organization.ilike('%instructor%')
                )
            )
        ).limit(per_page).all()
        
        results = []
        for user in users:
            profile = user.profile
            results.append({
                'id': user.id,
                'name': profile.full_name if profile else user.username,
                'initials': 'CH',
                'followers': f"{user.posts.count()} posts",
                'type': 'Coach',
                'verified': user.is_verified,
                'gradient': 'from-yellow-500 to-orange-600',
                'category': 'coach',
                'description': f"Cricket coach at {profile.organization if profile else 'Independent'}",
                'location': profile.location if profile else None,
                'isConnected': False
            })
        return results
    except Exception as e:
        logger.error(f"Search coaches error: {e}")
        return []

def _search_by_location(query, page=1, per_page=5):
    """Search by location"""
    try:
        results = []
        
        # Search matches by location
        matches = Match.query.filter(
            Match.location.ilike(f'%{query}%')
        ).limit(per_page // 2).all()
        
        for match in matches:
            results.append({
                'id': match.id,
                'name': match.title,
                'initials': 'LO',
                'followers': f"{match.players_needed or 0} players needed",
                'type': 'Match',
                'verified': True,
                'gradient': 'from-green-500 to-teal-600',
                'category': 'location',
                'description': f"Match in {match.location}",
                'location': match.location,
                'isJoined': False
            })
        
        # Search users by location
        users = User.query.join(User.profile).filter(
            UserProfile.location.ilike(f'%{query}%')
        ).limit(per_page // 2).all()
        
        for user in users:
            profile = user.profile
            results.append({
                'id': user.id,
                'name': profile.full_name if profile else user.username,
                'initials': 'US',
                'followers': f"{user.posts.count()} posts",
                'type': 'Player',
                'verified': user.is_verified,
                'gradient': 'from-blue-500 to-purple-600',
                'category': 'location',
                'description': f"Player from {profile.location if profile else 'Unknown'}",
                'location': profile.location if profile else None,
                'isConnected': False
            })
        
        return results
    except Exception as e:
        logger.error(f"Search by location error: {e}")
        return []

# Trending content functions
def _get_trending_users(page=1, per_page=5):
    """Get trending users"""
    try:
        users = User.query.join(User.profile).order_by(desc(User.created_at)).limit(per_page).all()
        
        results = []
        for user in users:
            profile = user.profile
            results.append({
                'id': user.id,
                'name': profile.full_name if profile else user.username,
                'initials': (profile.full_name[:2].upper() if profile and profile.full_name else user.username[:2].upper()),
                'followers': f"{user.posts.count()} posts",
                'type': 'Player',
                'verified': user.is_verified,
                'gradient': 'from-blue-500 to-purple-600',
                'category': 'user',
                'description': profile.organization if profile else 'Cricket Player',
                'location': profile.location if profile else None,
                'isConnected': False
            })
        return results
    except Exception as e:
        logger.error(f"Get trending users error: {e}")
        return []

def _get_trending_matches(page=1, per_page=5):
    """Get trending matches"""
    try:
        matches = Match.query.order_by(desc(Match.created_at)).limit(per_page).all()
        
        results = []
        for match in matches:
            results.append({
                'id': match.id,
                'name': match.title,
                'initials': match.title[:2].upper(),
                'followers': f"{match.players_needed or 0} players needed",
                'type': match.match_type.value if match.match_type else 'Match',
                'verified': True,
                'gradient': 'from-green-500 to-teal-600',
                'category': 'match',
                'description': match.description,
                'location': match.location,
                'isJoined': False
            })
        return results
    except Exception as e:
        logger.error(f"Get trending matches error: {e}")
        return []

def _get_trending_posts(page=1, per_page=5):
    """Get trending posts"""
    try:
        posts = Post.query.order_by(desc(Post.likes_count)).limit(per_page).all()
        
        results = []
        for post in posts:
            results.append({
                'id': post.id,
                'name': post.content[:50] + '...' if len(post.content) > 50 else post.content,
                'initials': 'PO',
                'followers': f"{post.likes_count or 0} likes",
                'type': 'Post',
                'verified': True,
                'gradient': 'from-orange-500 to-red-600',
                'category': 'post',
                'description': post.content,
                'location': None,
                'isConnected': False
            })
        return results
    except Exception as e:
        logger.error(f"Get trending posts error: {e}")
        return []

def _get_trending_locations(page=1, per_page=5):
    """Get trending locations"""
    try:
        # Get popular match locations
        locations = db.session.query(Match.location, db.func.count(Match.id).label('count')).group_by(Match.location).order_by(desc('count')).limit(per_page).all()
        
        results = []
        for location, count in locations:
            if location:
                results.append({
                    'id': f"loc_{hash(location)}",
                    'name': location,
                    'initials': location[:2].upper(),
                    'followers': f"{count} matches",
                    'type': 'Location',
                    'verified': True,
                    'gradient': 'from-green-500 to-teal-600',
                    'category': 'location',
                    'description': f"Popular cricket location with {count} matches",
                    'location': location,
                    'isJoined': False
                })
        return results
    except Exception as e:
        logger.error(f"Get trending locations error: {e}")
        return []

def _get_trending_academies(page=1, per_page=5):
    """Get trending academies"""
    try:
        users = User.query.join(User.profile).filter(
            or_(
                UserProfile.organization.ilike('%academy%'),
                UserProfile.organization.ilike('%cricket%'),
                UserProfile.organization.ilike('%training%')
            )
        ).order_by(desc(User.created_at)).limit(per_page).all()
        
        results = []
        for user in users:
            profile = user.profile
            results.append({
                'id': user.id,
                'name': profile.organization if profile and profile.organization else 'Cricket Academy',
                'initials': 'AC',
                'followers': f"{user.posts.count()} posts",
                'type': 'Academy',
                'verified': user.is_verified,
                'gradient': 'from-purple-500 to-pink-600',
                'category': 'academy',
                'description': f"Cricket training academy in {profile.location if profile else 'Unknown location'}",
                'location': profile.location if profile else None,
                'isConnected': False
            })
        return results
    except Exception as e:
        logger.error(f"Get trending academies error: {e}")
        return []

def _get_trending_jobs(page=1, per_page=5):
    """Get trending jobs"""
    try:
        posts = Post.query.filter(
            or_(
                Post.content.ilike('%job%'),
                Post.content.ilike('%hiring%'),
                Post.content.ilike('%position%'),
                Post.content.ilike('%coach%'),
                Post.content.ilike('%trainer%')
            )
        ).order_by(desc(Post.likes_count)).limit(per_page).all()
        
        results = []
        for post in posts:
            results.append({
                'id': post.id,
                'name': post.content[:50] + '...' if len(post.content) > 50 else post.content,
                'initials': 'JO',
                'followers': f"{post.likes_count or 0} interested",
                'type': 'Job',
                'verified': True,
                'gradient': 'from-indigo-500 to-blue-600',
                'category': 'job',
                'description': post.content,
                'location': None,
                'isApplied': False
            })
        return results
    except Exception as e:
        logger.error(f"Get trending jobs error: {e}")
        return []

def _get_trending_coaches(page=1, per_page=5):
    """Get trending coaches"""
    try:
        users = User.query.join(User.profile).filter(
            or_(
                UserProfile.organization.ilike('%coach%'),
                UserProfile.organization.ilike('%trainer%'),
                UserProfile.organization.ilike('%instructor%')
            )
        ).order_by(desc(User.created_at)).limit(per_page).all()
        
        results = []
        for user in users:
            profile = user.profile
            results.append({
                'id': user.id,
                'name': profile.full_name if profile else user.username,
                'initials': 'CH',
                'followers': f"{user.posts.count()} posts",
                'type': 'Coach',
                'verified': user.is_verified,
                'gradient': 'from-yellow-500 to-orange-600',
                'category': 'coach',
                'description': f"Cricket coach at {profile.organization if profile else 'Independent'}",
                'location': profile.location if profile else None,
                'isConnected': False
            })
        return results
    except Exception as e:
        logger.error(f"Get trending coaches error: {e}")
        return []

def _get_trending_communities(page=1, per_page=5):
    """Get trending communities"""
    try:
        posts = Post.query.filter(
            or_(
                Post.content.ilike('%community%'),
                Post.content.ilike('%group%'),
                Post.content.ilike('%team%'),
                Post.content.ilike('%club%')
            )
        ).order_by(desc(Post.likes_count)).limit(per_page).all()
        
        results = []
        for post in posts:
            results.append({
                'id': post.id,
                'name': post.content[:50] + '...' if len(post.content) > 50 else post.content,
                'initials': 'CO',
                'followers': f"{post.likes_count or 0} members",
                'type': 'Community',
                'verified': True,
                'gradient': 'from-teal-500 to-green-600',
                'category': 'community',
                'description': post.content,
                'location': None,
                'isJoined': False
            })
        return results
    except Exception as e:
        logger.error(f"Get trending communities error: {e}")
        return []

def _get_trending_venues(page=1, per_page=5):
    """Get trending venues"""
    try:
        venues = ProfilePage.query.filter(
            and_(
                ProfilePage.page_type == 'Pitch',
                ProfilePage.is_active == True
            )
        ).order_by(desc(ProfilePage.capacity), desc(ProfilePage.created_at)).limit(per_page).all()
        
        results = []
        for venue in venues:
            results.append({
                'id': str(venue.page_id),
                'name': venue.academy_name,
                'initials': venue.academy_name[:2].upper(),
                'followers': f"{venue.capacity or 0} capacity",
                'type': 'Venue',
                'verified': venue.is_verified,
                'gradient': 'from-green-500 to-emerald-600',
                'category': 'venue',
                'description': venue.description or venue.tagline,
                'location': f"{venue.city}, {venue.state}" if venue.city else venue.location,
                'isJoined': False
            })
        return results
    except Exception as e:
        logger.error(f"Get trending venues error: {e}")
        return []

# New search functions for database integration
def _search_jobs(query, page=1, per_page=5):
    """Search for jobs"""
    try:
        jobs = Job.query.filter(
            and_(
                Job.is_active == True,
                or_(
                    Job.title.ilike(f'%{query}%'),
                    Job.description.ilike(f'%{query}%'),
                    Job.location.ilike(f'%{query}%'),
                    Job.skills_required.ilike(f'%{query}%')
                )
            )
        ).order_by(desc(Job.created_at)).limit(per_page).all()
        
        results = []
        for job in jobs:
            results.append({
                'id': str(job.job_id),
                'name': job.title,
                'initials': job.title[:2].upper(),
                'followers': f"{job.applications_count or 0} applications",
                'type': 'Job',
                'verified': job.is_featured,
                'gradient': 'from-purple-500 to-indigo-600',
                'category': 'job',
                'description': job.description[:100] + '...' if len(job.description) > 100 else job.description,
                'location': job.location,
                'isApplied': False
            })
        return results
    except Exception as e:
        logger.error(f"Search jobs error: {e}")
        return []

def _search_academies(query, page=1, per_page=5):
    """Search for academies"""
    try:
        academies = ProfilePage.query.filter(
            and_(
                ProfilePage.page_type == 'Academy',
                ProfilePage.is_active == True,
                or_(
                    ProfilePage.academy_name.ilike(f'%{query}%'),
                    ProfilePage.description.ilike(f'%{query}%'),
                    ProfilePage.location.ilike(f'%{query}%'),
                    ProfilePage.city.ilike(f'%{query}%'),
                    ProfilePage.state.ilike(f'%{query}%')
                )
            )
        ).order_by(desc(ProfilePage.created_at)).limit(per_page).all()
        
        results = []
        for academy in academies:
            results.append({
                'id': str(academy.page_id),
                'name': academy.academy_name,
                'initials': academy.academy_name[:2].upper(),
                'followers': f"{academy.total_students or 0} students",
                'type': 'Academy',
                'verified': academy.is_verified,
                'gradient': 'from-orange-500 to-red-600',
                'category': 'academy',
                'description': academy.description or academy.tagline,
                'location': f"{academy.city}, {academy.state}" if academy.city else academy.location,
                'isJoined': False
            })
        return results
    except Exception as e:
        logger.error(f"Search academies error: {e}")
        return []

def _search_coaches(query, page=1, per_page=5):
    """Search for coaches"""
    try:
        # Search for users who are coaches (assuming we have a coach field or can identify coaches)
        coaches = User.query.join(UserProfile).filter(
            and_(
                User.is_active == True,
                or_(
                    UserProfile.full_name.ilike(f'%{query}%'),
                    UserProfile.organization.ilike(f'%{query}%'),
                    UserProfile.location.ilike(f'%{query}%'),
                    UserProfile.bio.ilike(f'%{query}%')
                )
            )
        ).limit(per_page).all()
        
        results = []
        for coach in coaches:
            profile = coach.profile
            results.append({
                'id': str(coach.id),
                'name': profile.full_name if profile and profile.full_name else coach.username,
                'initials': (profile.full_name[:2].upper() if profile and profile.full_name else coach.username[:2].upper()),
                'followers': f"{coach.posts.count()} posts",
                'type': 'Coach',
                'verified': coach.is_verified,
                'gradient': 'from-yellow-500 to-orange-600',
                'category': 'coach',
                'description': profile.bio or profile.organization or 'Cricket Coach',
                'location': profile.location,
                'isConnected': False
            })
        return results
    except Exception as e:
        logger.error(f"Search coaches error: {e}")
        return []

def _search_venues(query, page=1, per_page=5):
    """Search for venues/pitches"""
    try:
        venues = ProfilePage.query.filter(
            and_(
                ProfilePage.page_type == 'Pitch',
                ProfilePage.is_active == True,
                or_(
                    ProfilePage.academy_name.ilike(f'%{query}%'),
                    ProfilePage.description.ilike(f'%{query}%'),
                    ProfilePage.location.ilike(f'%{query}%'),
                    ProfilePage.city.ilike(f'%{query}%'),
                    ProfilePage.state.ilike(f'%{query}%')
                )
            )
        ).order_by(desc(ProfilePage.created_at)).limit(per_page).all()
        
        results = []
        for venue in venues:
            results.append({
                'id': str(venue.page_id),
                'name': venue.academy_name,  # Using academy_name for venue name
                'initials': venue.academy_name[:2].upper(),
                'followers': f"{venue.capacity or 0} capacity",
                'type': 'Venue',
                'verified': venue.is_verified,
                'gradient': 'from-green-500 to-emerald-600',
                'category': 'venue',
                'description': venue.description or venue.tagline,
                'location': f"{venue.city}, {venue.state}" if venue.city else venue.location,
                'isJoined': False
            })
        return results
    except Exception as e:
        logger.error(f"Search venues error: {e}")
        return []

def _search_communities(query, page=1, per_page=5):
    """Search for communities"""
    try:
        communities = ProfilePage.query.filter(
            and_(
                ProfilePage.page_type == 'Community',
                ProfilePage.is_active == True,
                or_(
                    ProfilePage.academy_name.ilike(f'%{query}%'),
                    ProfilePage.description.ilike(f'%{query}%'),
                    ProfilePage.location.ilike(f'%{query}%'),
                    ProfilePage.city.ilike(f'%{query}%'),
                    ProfilePage.state.ilike(f'%{query}%')
                )
            )
        ).order_by(desc(ProfilePage.created_at)).limit(per_page).all()
        
        results = []
        for community in communities:
            results.append({
                'id': str(community.page_id),
                'name': community.academy_name,  # Using academy_name for community name
                'initials': community.academy_name[:2].upper(),
                'followers': f"{community.max_members or 0} members",
                'type': 'Community',
                'verified': community.is_verified,
                'gradient': 'from-teal-500 to-cyan-600',
                'category': 'community',
                'description': community.description or community.tagline,
                'location': f"{community.city}, {community.state}" if community.city else community.location,
                'isJoined': False
            })
        return results
    except Exception as e:
        logger.error(f"Search communities error: {e}")
        return []

def _search_by_location(query, page=1, per_page=5):
    """Search by location across all entities"""
    try:
        results = []
        
        # Search users by location
        users = User.query.join(UserProfile).filter(
            and_(
                User.is_active == True,
                UserProfile.location.ilike(f'%{query}%')
            )
        ).limit(per_page // 2).all()
        
        for user in users:
            profile = user.profile
            results.append({
                'id': str(user.id),
                'name': profile.full_name if profile and profile.full_name else user.username,
                'initials': (profile.full_name[:2].upper() if profile and profile.full_name else user.username[:2].upper()),
                'followers': f"{user.posts.count()} posts",
                'type': 'Player',
                'verified': user.is_verified,
                'gradient': 'from-blue-500 to-purple-600',
                'category': 'user',
                'description': profile.organization if profile else 'Cricket Player',
                'location': profile.location,
                'isConnected': False
            })
        
        # Search venues by location
        venues = ProfilePage.query.filter(
            and_(
                ProfilePage.page_type == 'Pitch',
                ProfilePage.is_active == True,
                or_(
                    ProfilePage.location.ilike(f'%{query}%'),
                    ProfilePage.city.ilike(f'%{query}%'),
                    ProfilePage.state.ilike(f'%{query}%')
                )
            )
        ).limit(per_page // 2).all()
        
        for venue in venues:
            results.append({
                'id': str(venue.page_id),
                'name': venue.academy_name,
                'initials': venue.academy_name[:2].upper(),
                'followers': f"{venue.capacity or 0} capacity",
                'type': 'Venue',
                'verified': venue.is_verified,
                'gradient': 'from-green-500 to-emerald-600',
                'category': 'venue',
                'description': venue.description or venue.tagline,
                'location': f"{venue.city}, {venue.state}" if venue.city else venue.location,
                'isJoined': False
            })
        
        return results
    except Exception as e:
        logger.error(f"Search by location error: {e}")
        return []
