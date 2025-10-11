from flask import Blueprint, request, jsonify
from models import db, Relationship, RelationshipType, RelationshipStatus, User
from datetime import datetime

relationships_bp = Blueprint('relationships', __name__)

@relationships_bp.route('/follow', methods=['POST'])
def follow_user():
    """
    Follow a user
    ---
    tags:
      - Relationships
    parameters:
      - in: body
        name: follow_data
        description: User to follow
        required: true
        schema:
          type: object
          properties:
            user_id:
              type: integer
              description: ID of user to follow
              example: 123
    responses:
      201:
        description: Successfully followed user
      400:
        description: Bad request or validation error
      404:
        description: User not found
      409:
        description: Already following or cannot follow
    """
    try:
        current_user_id = 1  # 1 - using test user ID
        data = request.get_json()
        
        if not data or 'user_id' not in data:
            return jsonify({'error': 'user_id is required'}), 400
        
        target_user_id = data['user_id']
        
        # Check if trying to follow self
        if current_user_id == target_user_id:
            return jsonify({'error': 'Cannot follow yourself'}), 400
        
        # Check if target user exists
        target_user = User.query.get(target_user_id)
        if not target_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if already following
        if Relationship.is_following(current_user_id, target_user_id):
            return jsonify({'error': 'Already following this user'}), 409
        
        # Check if blocked
        if Relationship.is_blocked(target_user_id, current_user_id):
            return jsonify({'error': 'Cannot follow this user'}), 409
        
        # Follow the user
        relationship, created = Relationship.follow_user(current_user_id, target_user_id)
        
        if created:
            return jsonify({
                'message': 'Successfully followed user',
                'relationship': relationship.to_dict()
            }), 201
        else:
            return jsonify({'error': 'Already following this user'}), 409
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@relationships_bp.route('/unfollow', methods=['POST'])
def unfollow_user():
    """
    Unfollow a user
    ---
    tags:
      - Relationships
    parameters:
      - in: body
        name: unfollow_data
        description: User to unfollow
        required: true
        schema:
          type: object
          properties:
            user_id:
              type: integer
              description: ID of user to unfollow
              example: 123
    responses:
      200:
        description: Successfully unfollowed user
      400:
        description: Bad request
      404:
        description: Not following this user
    """
    try:
        current_user_id = 1  # 1 - using test user ID
        data = request.get_json()
        
        if not data or 'user_id' not in data:
            return jsonify({'error': 'user_id is required'}), 400
        
        target_user_id = data['user_id']
        
        # Unfollow the user
        success = Relationship.unfollow_user(current_user_id, target_user_id)
        
        if success:
            return jsonify({'message': 'Successfully unfollowed user'}), 200
        else:
            return jsonify({'error': 'Not following this user'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@relationships_bp.route('/block', methods=['POST'])
def block_user():
    """
    Block a user
    ---
    tags:
      - Relationships
    parameters:
      - in: body
        name: block_data
        description: User to block
        required: true
        schema:
          type: object
          properties:
            user_id:
              type: integer
              description: ID of user to block
              example: 123
    responses:
      201:
        description: Successfully blocked user
      400:
        description: Bad request or validation error
      404:
        description: User not found
      409:
        description: Already blocked
    """
    try:
        current_user_id = 1  # 1 - using test user ID
        data = request.get_json()
        
        if not data or 'user_id' not in data:
            return jsonify({'error': 'user_id is required'}), 400
        
        target_user_id = data['user_id']
        
        # Check if trying to block self
        if current_user_id == target_user_id:
            return jsonify({'error': 'Cannot block yourself'}), 400
        
        # Check if target user exists
        target_user = User.query.get(target_user_id)
        if not target_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Block the user
        relationship, created = Relationship.block_user(current_user_id, target_user_id)
        
        if created:
            return jsonify({
                'message': 'Successfully blocked user',
                'relationship': relationship.to_dict()
            }), 201
        else:
            return jsonify({'error': 'Already blocked this user'}), 409
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@relationships_bp.route('/unblock', methods=['POST'])
def unblock_user():
    """
    Unblock a user
    ---
    tags:
      - Relationships
    parameters:
      - in: body
        name: unblock_data
        description: User to unblock
        required: true
        schema:
          type: object
          properties:
            user_id:
              type: integer
              description: ID of user to unblock
              example: 123
    responses:
      200:
        description: Successfully unblocked user
      400:
        description: Bad request
      404:
        description: User not blocked
    """
    try:
        current_user_id = 1  # 1 - using test user ID
        data = request.get_json()
        
        if not data or 'user_id' not in data:
            return jsonify({'error': 'user_id is required'}), 400
        
        target_user_id = data['user_id']
        
        # Unblock the user
        success = Relationship.unblock_user(current_user_id, target_user_id)
        
        if success:
            return jsonify({'message': 'Successfully unblocked user'}), 200
        else:
            return jsonify({'error': 'User not blocked'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@relationships_bp.route('/connection/request', methods=['POST'])
def send_connection_request():
    """
    Send a connection request
    ---
    tags:
      - Relationships
    parameters:
      - in: body
        name: connection_request
        description: Connection request data
        required: true
        schema:
          type: object
          properties:
            user_id:
              type: integer
              description: ID of user to send connection request to
              example: 123
            message:
              type: string
              description: Optional message with the request
              example: "Hi, I'd like to connect with you"
    responses:
      201:
        description: Connection request sent successfully
      400:
        description: Bad request or validation error
      404:
        description: User not found
      409:
        description: Request already exists or already connected
    """
    try:
        current_user_id = 1  # 1 - using test user ID
        data = request.get_json()
        
        if not data or 'user_id' not in data:
            return jsonify({'error': 'user_id is required'}), 400
        
        target_user_id = data['user_id']
        message = data.get('message')
        
        # Check if trying to connect with self
        if current_user_id == target_user_id:
            return jsonify({'error': 'Cannot send connection request to yourself'}), 400
        
        # Check if target user exists
        target_user = User.query.get(target_user_id)
        if not target_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Send connection request
        relationship, created = Relationship.send_connection_request(current_user_id, target_user_id, message)
        
        if created:
            return jsonify({
                'message': 'Connection request sent successfully',
                'relationship': relationship.to_dict()
            }), 201
        else:
            return jsonify({'error': 'Request already exists or already connected'}), 409
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@relationships_bp.route('/connection/accept', methods=['POST'])
def accept_connection_request():
    """
    Accept a connection request
    ---
    tags:
      - Relationships
    parameters:
      - in: body
        name: accept_request
        description: Connection request to accept
        required: true
        schema:
          type: object
          properties:
            user_id:
              type: integer
              description: ID of user whose request to accept
              example: 123
    responses:
      200:
        description: Connection request accepted successfully
      400:
        description: Bad request
      404:
        description: No pending request found
    """
    try:
        current_user_id = 1  # 1 - using test user ID
        data = request.get_json()
        
        if not data or 'user_id' not in data:
            return jsonify({'error': 'user_id is required'}), 400
        
        requester_id = data['user_id']
        
        # Accept connection request
        relationship, success = Relationship.accept_connection_request(current_user_id, requester_id)
        
        if success:
            return jsonify({
                'message': 'Connection request accepted successfully',
                'relationship': relationship.to_dict()
            }), 200
        else:
            return jsonify({'error': 'No pending request found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@relationships_bp.route('/connection/reject', methods=['POST'])
def reject_connection_request():
    """
    Reject a connection request
    ---
    tags:
      - Relationships
    parameters:
      - in: body
        name: reject_request
        description: Connection request to reject
        required: true
        schema:
          type: object
          properties:
            user_id:
              type: integer
              description: ID of user whose request to reject
              example: 123
    responses:
      200:
        description: Connection request rejected successfully
      400:
        description: Bad request
      404:
        description: No pending request found
    """
    try:
        current_user_id = 1  # 1 - using test user ID
        data = request.get_json()
        
        if not data or 'user_id' not in data:
            return jsonify({'error': 'user_id is required'}), 400
        
        requester_id = data['user_id']
        
        # Reject connection request
        relationship, success = Relationship.reject_connection_request(current_user_id, requester_id)
        
        if success:
            return jsonify({
                'message': 'Connection request rejected successfully',
                'relationship': relationship.to_dict()
            }), 200
        else:
            return jsonify({'error': 'No pending request found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@relationships_bp.route('/followers/<int:user_id>', methods=['GET'])
def get_followers(user_id):
    """
    Get followers of a user
    ---
    tags:
      - Relationships
    parameters:
      - in: path
        name: user_id
        type: integer
        required: true
        description: User ID
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
        description: Followers retrieved successfully
      404:
        description: User not found
    """
    try:
        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        pagination = Relationship.get_followers(user_id, page, per_page)
        
        followers = [rel.to_dict() for rel in pagination.items]
        
        return jsonify({
            'followers': followers,
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

@relationships_bp.route('/following/<int:user_id>', methods=['GET'])
def get_following(user_id):
    """
    Get users that a user is following
    ---
    tags:
      - Relationships
    parameters:
      - in: path
        name: user_id
        type: integer
        required: true
        description: User ID
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
        description: Following list retrieved successfully
      404:
        description: User not found
    """
    try:
        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        pagination = Relationship.get_following(user_id, page, per_page)
        
        following = [rel.to_dict() for rel in pagination.items]
        
        return jsonify({
            'following': following,
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

@relationships_bp.route('/connections/<int:user_id>', methods=['GET'])
def get_connections(user_id):
    """
    Get connections of a user
    ---
    tags:
      - Relationships
    parameters:
      - in: path
        name: user_id
        type: integer
        required: true
        description: User ID
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
        description: Connections retrieved successfully
      404:
        description: User not found
    """
    try:
        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        pagination = Relationship.get_connections(user_id, page, per_page)
        
        connections = [rel.to_dict() for rel in pagination.items]
        
        return jsonify({
            'connections': connections,
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

@relationships_bp.route('/connection/requests/pending', methods=['GET'])
def get_pending_requests():
    """
    Get pending connection requests for current user
    ---
    tags:
      - Relationships
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
    responses:
      200:
        description: Pending requests retrieved successfully
    """
    try:
        current_user_id = 1  # 1 - using test user ID
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        pagination = Relationship.get_pending_requests(current_user_id, page, per_page)
        
        requests = [rel.to_dict() for rel in pagination.items]
        
        return jsonify({
            'pending_requests': requests,
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

@relationships_bp.route('/connection/requests/sent', methods=['GET'])
def get_sent_requests():
    """
    Get connection requests sent by current user
    ---
    tags:
      - Relationships
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
    responses:
      200:
        description: Sent requests retrieved successfully
    """
    try:
        current_user_id = 1  # 1 - using test user ID
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        pagination = Relationship.get_sent_requests(current_user_id, page, per_page)
        
        requests = [rel.to_dict() for rel in pagination.items]
        
        return jsonify({
            'sent_requests': requests,
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

@relationships_bp.route('/status/<int:user_id>', methods=['GET'])
def get_relationship_status(user_id):
    """
    Get relationship status between current user and target user
    ---
    tags:
      - Relationships
    parameters:
      - in: path
        name: user_id
        type: integer
        required: true
        description: Target user ID
    responses:
      200:
        description: Relationship status retrieved successfully
      404:
        description: User not found
    """
    try:
        current_user_id = 1  # 1 - using test user ID
        
        # Check if target user exists
        target_user = User.query.get(user_id)
        if not target_user:
            return jsonify({'error': 'User not found'}), 404
        
        status = Relationship.get_relationship_status(current_user_id, user_id)
        
        return jsonify({
            'relationship_status': status
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
