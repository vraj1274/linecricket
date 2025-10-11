"""
Search Routes
Handles search functionality
"""

from flask import Blueprint

search_routes = Blueprint('search_routes', __name__)

@search_routes.route('/api/search/test')
def test_search():
    """Test search endpoint"""
    return {'message': 'Search routes working'}, 200
