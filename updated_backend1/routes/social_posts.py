"""
Social Posts Routes
Handles social media posts functionality
"""

from flask import Blueprint

social_posts_bp = Blueprint('social_posts', __name__)

@social_posts_bp.route('/api/social/test')
def test_social_posts():
    """Test social posts endpoint"""
    return {'message': 'Social posts routes working'}, 200
