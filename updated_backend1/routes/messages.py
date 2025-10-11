from flask import Blueprint, request, jsonify, current_app
from models import Message, Conversation, User, db
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

messages_bp = Blueprint('messages', __name__)

@messages_bp.route('/conversations', methods=['GET'])
def get_conversations():
    """Get all conversations for current user"""
    try:
        user_id = 1  # 1 - using test user ID
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Get conversations where user is either user1 or user2
        conversations = Conversation.query.filter(
            (Conversation.user1_id == user_id) | (Conversation.user2_id == user_id)
        ).order_by(Conversation.last_message_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        conversations_data = []
        for conversation in conversations.items:
            conv_dict = conversation.to_dict()
            # Get unread count for current user
            unread_count = Message.query.filter_by(
                conversation_id=conversation.id,
                receiver_id=user_id,
                is_read=False
            ).count()
            conv_dict['unread_count'] = unread_count
            conversations_data.append(conv_dict)
        
        return jsonify({
            'conversations': conversations_data,
            'pagination': {
                'page': conversations.page,
                'pages': conversations.pages,
                'per_page': conversations.per_page,
                'total': conversations.total,
                'has_next': conversations.has_next,
                'has_prev': conversations.has_prev
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Get conversations error: {e}")
        return jsonify({'error': 'Failed to fetch conversations'}), 500

@messages_bp.route('/conversations/<int:conversation_id>', methods=['GET'])
def get_conversation(conversation_id):
    """Get a specific conversation"""
    try:
        user_id = 1  # 1 - using test user ID
        conversation = Conversation.get_by_id(conversation_id)
        
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        # Check if user is part of this conversation
        if conversation.user1_id != user_id and conversation.user2_id != user_id:
            return jsonify({'error': 'Unauthorized to access this conversation'}), 403
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        # Get messages for this conversation
        messages = Message.query.filter_by(conversation_id=conversation_id).order_by(
            Message.created_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        # Mark messages as read
        Message.query.filter_by(
            conversation_id=conversation_id,
            receiver_id=user_id,
            is_read=False
        ).update({'is_read': True, 'read_at': datetime.utcnow()})
        db.session.commit()
        
        conversation_dict = conversation.to_dict()
        conversation_dict['messages'] = [msg.to_dict() for msg in messages.items]
        conversation_dict['pagination'] = {
            'page': messages.page,
            'pages': messages.pages,
            'per_page': messages.per_page,
            'total': messages.total,
            'has_next': messages.has_next,
            'has_prev': messages.has_prev
        }
        
        return jsonify({'conversation': conversation_dict}), 200
        
    except Exception as e:
        logger.error(f"Get conversation error: {e}")
        return jsonify({'error': 'Failed to fetch conversation'}), 500

@messages_bp.route('/conversations', methods=['POST'])
def create_conversation():
    """Create a new conversation or get existing one"""
    try:
        user_id = 1  # 1 - using test user ID
        data = request.get_json()
        
        if not data.get('receiver_id'):
            return jsonify({'error': 'Receiver ID is required'}), 400
        
        receiver_id = int(data['receiver_id'])
        
        if receiver_id == user_id:
            return jsonify({'error': 'Cannot create conversation with yourself'}), 400
        
        # Check if receiver exists
        receiver = User.get_by_id(receiver_id)
        if not receiver:
            return jsonify({'error': 'Receiver not found'}), 404
        
        # Get or create conversation
        conversation = Conversation.get_or_create_conversation(user_id, receiver_id)
        
        return jsonify({
            'conversation': conversation.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Create conversation error: {e}")
        return jsonify({'error': 'Failed to create conversation'}), 500

@messages_bp.route('/conversations/<int:conversation_id>/messages', methods=['POST'])
def send_message(conversation_id):
    """Send a message in a conversation"""
    try:
        user_id = 1  # 1 - using test user ID
        data = request.get_json()
        
        if not data.get('content'):
            return jsonify({'error': 'Message content is required'}), 400
        
        conversation = Conversation.get_by_id(conversation_id)
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        # Check if user is part of this conversation
        if conversation.user1_id != user_id and conversation.user2_id != user_id:
            return jsonify({'error': 'Unauthorized to send message in this conversation'}), 403
        
        # Determine receiver
        receiver_id = conversation.user2_id if conversation.user1_id == user_id else conversation.user1_id
        
        message = Message(
            conversation_id=conversation_id,
            sender_id=user_id,
            receiver_id=receiver_id,
            content=data['content']
        )
        message.save()
        
        # Update conversation last message
        conversation.last_message_at = datetime.utcnow()
        conversation.last_message_content = data['content']
        conversation.save()
        
        return jsonify({
            'message': 'Message sent successfully',
            'message_data': message.to_dict()
        }), 201
        
    except Exception as e:
        logger.error(f"Send message error: {e}")
        return jsonify({'error': 'Failed to send message'}), 500

@messages_bp.route('/conversations/<int:conversation_id>/messages/<int:message_id>', methods=['PUT'])
def update_message(conversation_id, message_id):
    """Update a message (only by sender)"""
    try:
        user_id = 1  # 1 - using test user ID
        data = request.get_json()
        
        message = Message.get_by_id(message_id)
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        if message.conversation_id != conversation_id:
            return jsonify({'error': 'Message does not belong to this conversation'}), 400
        
        if message.sender_id != user_id:
            return jsonify({'error': 'Unauthorized to update this message'}), 403
        
        if data.get('content'):
            message.content = data['content']
            message.save()
        
        return jsonify({
            'message': 'Message updated successfully',
            'message_data': message.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Update message error: {e}")
        return jsonify({'error': 'Failed to update message'}), 500

@messages_bp.route('/conversations/<int:conversation_id>/messages/<int:message_id>', methods=['DELETE'])
def delete_message(conversation_id, message_id):
    """Delete a message (only by sender)"""
    try:
        user_id = 1  # 1 - using test user ID
        
        message = Message.get_by_id(message_id)
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        if message.conversation_id != conversation_id:
            return jsonify({'error': 'Message does not belong to this conversation'}), 400
        
        if message.sender_id != user_id:
            return jsonify({'error': 'Unauthorized to delete this message'}), 403
        
        message.delete()
        
        return jsonify({'message': 'Message deleted successfully'}), 200
        
    except Exception as e:
        logger.error(f"Delete message error: {e}")
        return jsonify({'error': 'Failed to delete message'}), 500

@messages_bp.route('/unread-count', methods=['GET'])
def get_unread_count():
    """Get total unread message count for current user"""
    try:
        user_id = 1  # 1 - using test user ID
        
        unread_count = Message.query.filter_by(
            receiver_id=user_id,
            is_read=False
        ).count()
        
        return jsonify({
            'unread_count': unread_count
        }), 200
        
    except Exception as e:
        logger.error(f"Get unread count error: {e}")
        return jsonify({'error': 'Failed to get unread count'}), 500

@messages_bp.route('/conversations/<int:conversation_id>/mark-read', methods=['POST'])
def mark_conversation_read(conversation_id):
    """Mark all messages in a conversation as read"""
    try:
        user_id = 1  # 1 - using test user ID
        
        conversation = Conversation.get_by_id(conversation_id)
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        # Check if user is part of this conversation
        if conversation.user1_id != user_id and conversation.user2_id != user_id:
            return jsonify({'error': 'Unauthorized to access this conversation'}), 403
        
        # Mark all unread messages as read
        Message.query.filter_by(
            conversation_id=conversation_id,
            receiver_id=user_id,
            is_read=False
        ).update({'is_read': True, 'read_at': datetime.utcnow()})
        db.session.commit()
        
        return jsonify({'message': 'Conversation marked as read'}), 200
        
    except Exception as e:
        logger.error(f"Mark conversation read error: {e}")
        return jsonify({'error': 'Failed to mark conversation as read'}), 500
