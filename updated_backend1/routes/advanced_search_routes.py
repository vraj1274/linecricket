from flask import Blueprint, request, jsonify
from services.search_service import search_service
from models import SearchType, SearchResult, SearchFilter, SearchAnalytics
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

advanced_search_bp = Blueprint('advanced_search', __name__)

@advanced_search_bp.route('/search/global', methods=['GET'])
def global_search():
    """Advanced global search across all content types"""
    try:
        query = request.args.get('q', '').strip()
        search_type = request.args.get('type', 'global')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        user_id = 1  # 1 - using test user ID
        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        # Parse search type
        try:
            search_type_enum = SearchType(search_type)
        except ValueError:
            return jsonify({'error': 'Invalid search type'}), 400
        
        # Parse filters
        filters = {}
        if request.args.get('location'):
            filters['location'] = request.args.get('location')
        if request.args.get('skill_level'):
            filters['skill_level'] = request.args.get('skill_level')
        if request.args.get('match_type'):
            filters['match_type'] = request.args.get('match_type')
        if request.args.get('status'):
            filters['status'] = request.args.get('status')
        if request.args.get('date_from'):
            filters['date_from'] = datetime.strptime(request.args.get('date_from'), '%Y-%m-%d').date()
        if request.args.get('date_to'):
            filters['date_to'] = datetime.strptime(request.args.get('date_to'), '%Y-%m-%d').date()
        if request.args.get('entry_fee_max'):
            filters['entry_fee_max'] = float(request.args.get('entry_fee_max'))
        if request.args.get('equipment_provided'):
            filters['equipment_provided'] = request.args.get('equipment_provided').lower() == 'true'
        if request.args.get('is_verified'):
            filters['is_verified'] = request.args.get('is_verified').lower() == 'true'
        if request.args.get('organization'):
            filters['organization'] = request.args.get('organization')
        
        # Perform search
        results = search_service.full_text_search(
            query=query,
            search_type=search_type_enum,
            filters=filters,
            page=page,
            per_page=per_page,
            user_id=user_id
        )
        
        return jsonify(results), 200
        
    except Exception as e:
        logger.error(f"Global search error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@advanced_search_bp.route('/search/suggestions', methods=['GET'])
def get_search_suggestions():
    """Get search suggestions and autocomplete"""
    try:
        query = request.args.get('q', '').strip()
        limit = request.args.get('limit', 10, type=int)
        
        if len(query) < 2:
            return jsonify({'suggestions': []}), 200
        
        suggestions = search_service.get_search_suggestions(query, limit)
        
        return jsonify({
            'suggestions': suggestions,
            'query': query
        }), 200
        
    except Exception as e:
        logger.error(f"Get search suggestions error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@advanced_search_bp.route('/search/trending', methods=['GET'])
def get_trending_searches():
    """Get trending search queries"""
    try:
        days = request.args.get('days', 7, type=int)
        limit = request.args.get('limit', 10, type=int)
        
        trending = search_service.get_trending_searches(days=days, limit=limit)
        
        return jsonify({
            'trending_searches': trending,
            'days': days
        }), 200
        
    except Exception as e:
        logger.error(f"Get trending searches error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@advanced_search_bp.route('/search/analytics', methods=['GET'])
def get_search_analytics():
    """Get search analytics and metrics"""
    try:
        days = request.args.get('days', 30, type=int)
        
        analytics = search_service.get_search_analytics(days=days)
        
        return jsonify({
            'analytics': analytics,
            'days': days
        }), 200
        
    except Exception as e:
        logger.error(f"Get search analytics error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@advanced_search_bp.route('/search/geolocation', methods=['GET'])
def geolocation_search():
    """Search by geolocation"""
    try:
        latitude = request.args.get('latitude', type=float)
        longitude = request.args.get('longitude', type=float)
        radius_km = request.args.get('radius_km', 50, type=float)
        search_type = request.args.get('type', 'match')
        
        if not latitude or not longitude:
            return jsonify({'error': 'Latitude and longitude are required'}), 400
        
        # Parse search type
        try:
            search_type_enum = SearchType(search_type)
        except ValueError:
            return jsonify({'error': 'Invalid search type'}), 400
        
        # Parse filters
        filters = {}
        if request.args.get('match_type'):
            filters['match_type'] = request.args.get('match_type')
        if request.args.get('skill_level'):
            filters['skill_level'] = request.args.get('skill_level')
        if request.args.get('status'):
            filters['status'] = request.args.get('status')
        
        results = search_service.geolocation_search(
            latitude=latitude,
            longitude=longitude,
            radius_km=radius_km,
            search_type=search_type_enum,
            filters=filters
        )
        
        return jsonify(results), 200
        
    except Exception as e:
        logger.error(f"Geolocation search error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@advanced_search_bp.route('/search/filters', methods=['POST'])
def save_search_filter():
    """Save a search filter for later use"""
    try:
        user_id = 1  # 1 - using test user ID
        data = request.get_json()
        
        if not data or 'filter_name' not in data or 'search_type' not in data or 'filters' not in data:
            return jsonify({'error': 'filter_name, search_type, and filters are required'}), 400
        
        # Parse search type
        try:
            search_type = SearchType(data['search_type'])
        except ValueError:
            return jsonify({'error': 'Invalid search type'}), 400
        
        search_filter = search_service.save_search_filter(
            user_id=user_id,
            filter_name=data['filter_name'],
            search_type=search_type,
            filters=data['filters'],
            is_public=data.get('is_public', False)
        )
        
        return jsonify({
            'message': 'Search filter saved successfully',
            'filter': search_filter.to_dict()
        }), 201
        
    except Exception as e:
        logger.error(f"Save search filter error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@advanced_search_bp.route('/search/filters', methods=['GET'])
def get_saved_filters():
    """Get saved search filters for a user"""
    try:
        user_id = 1  # 1 - using test user ID
        search_type = request.args.get('type')
        
        # Parse search type if provided
        search_type_enum = None
        if search_type:
            try:
                search_type_enum = SearchType(search_type)
            except ValueError:
                return jsonify({'error': 'Invalid search type'}), 400
        
        filters = search_service.get_saved_filters(user_id, search_type_enum)
        
        return jsonify({
            'filters': filters,
            'search_type': search_type
        }), 200
        
    except Exception as e:
        logger.error(f"Get saved filters error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@advanced_search_bp.route('/search/filters/<int:filter_id>', methods=['DELETE'])
def delete_search_filter(filter_id):
    """Delete a saved search filter"""
    try:
        user_id = 1  # 1 - using test user ID
        
        search_filter = SearchFilter.query.filter_by(
            id=filter_id,
            user_id=user_id
        ).first()
        
        if not search_filter:
            return jsonify({'error': 'Search filter not found'}), 404
        
        search_filter.delete()
        
        return jsonify({
            'message': 'Search filter deleted successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Delete search filter error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@advanced_search_bp.route('/search/click', methods=['POST'])
def track_search_click():
    """Track when a user clicks on a search result"""
    try:
        data = request.get_json()
        
        if not data or 'search_result_id' not in data or 'clicked_result_id' not in data:
            return jsonify({'error': 'search_result_id and clicked_result_id are required'}), 400
        
        success = search_service.track_search_click(
            search_result_id=data['search_result_id'],
            clicked_result_id=data['clicked_result_id'],
            clicked_result_type=data.get('clicked_result_type', 'unknown')
        )
        
        if success:
            return jsonify({
                'message': 'Search click tracked successfully'
            }), 200
        else:
            return jsonify({
                'error': 'Failed to track search click'
            }), 400
        
    except Exception as e:
        logger.error(f"Track search click error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@advanced_search_bp.route('/search/types', methods=['GET'])
def get_search_types():
    """Get available search types and their descriptions"""
    try:
        search_types = [
            {
                'value': 'global',
                'label': 'Global Search',
                'description': 'Search across all content types'
            },
            {
                'value': 'user',
                'label': 'Users',
                'description': 'Search for users, players, coaches'
            },
            {
                'value': 'match',
                'label': 'Matches',
                'description': 'Search for cricket matches and tournaments'
            },
            {
                'value': 'post',
                'label': 'Posts',
                'description': 'Search for posts and content'
            },
            {
                'value': 'venue',
                'label': 'Venues',
                'description': 'Search for cricket venues and grounds'
            },
            {
                'value': 'academy',
                'label': 'Academies',
                'description': 'Search for cricket academies and training centers'
            },
            {
                'value': 'community',
                'label': 'Communities',
                'description': 'Search for cricket communities and groups'
            }
        ]
        
        return jsonify({
            'search_types': search_types
        }), 200
        
    except Exception as e:
        logger.error(f"Get search types error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@advanced_search_bp.route('/search/health', methods=['GET'])
def search_health_check():
    """Health check for search service"""
    try:
        # Test basic search functionality
        test_results = search_service.get_search_suggestions('test', limit=1)
        
        return jsonify({
            'status': 'healthy',
            'service': 'advanced_search',
            'timestamp': datetime.utcnow().isoformat(),
            'test_results': len(test_results)
        }), 200
        
    except Exception as e:
        logger.error(f"Search health check error: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'service': 'advanced_search',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500
