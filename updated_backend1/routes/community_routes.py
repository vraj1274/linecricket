"""
Community Routes
Handles community functionality
"""

from flask import Blueprint

community_routes = Blueprint('community_routes', __name__)

@community_routes.route('/api/communities/test')
def test_communities():
    """Test communities endpoint"""
    return {'message': 'Community routes working'}, 200
