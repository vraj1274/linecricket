"""
Connection Routes
Handles user connections and friend requests
"""

from flask import Blueprint

connection_routes = Blueprint('connection_routes', __name__)

@connection_routes.route('/api/connections/test')
def test_connections():
    """Test connections endpoint"""
    return {'message': 'Connection routes working'}, 200
