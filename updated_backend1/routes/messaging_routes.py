from flask import Blueprint, request, jsonify
from models import db, Conversation, Message, ConversationParticipant, ConversationType, MessageType, User

messaging_bp = Blueprint('messaging', __name__)

@messaging_bp.route('/conversations', methods=['GET'])
def get_conversations():
    """Get conversations for current user"""
    try:
        current_user_id = 1  # 1 - using test user ID
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Get conversations where user is a participant
        query = Conversation.query.filter(
            (Conversation.user1_id == current_user_id) |
            (Conversation.user2_id == current_user_id) |
            (Conversation.participants.any(ConversationParticipant.user_id == current_user_id))
        )
        
        # Order by last message time
        query = query.order_by(Conversation.last_message_at.desc())
        
        # Paginate results
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        conversations = []
        for conv in pagination.items:
            conv_dict = conv.to_dict()
            conv_dict['unread_count'] = conv.get_unread_count(current_user_id)
            conversations.append(conv_dict)
        
        return jsonify({
            'conversations': conversations,
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

@messaging_bp.route('/conversations/direct', methods=['POST'])
def create_direct_conversation():
    """Create or get direct conversation with another user"""
    try:
        current_user_id = 1  # 1 - using test user ID
        data = request.get_json()
        
        if not data or 'user_id' not in data:
            return jsonify({'error': 'user_id is required'}), 400
        
        target_user_id = data['user_id']
        
        if current_user_id == target_user_id:
            return jsonify({'error': 'Cannot create conversation with yourself'}), 400
        
        target_user = User.query.get(target_user_id)
        if not target_user:
            return jsonify({'error': 'User not found'}), 404
        
        conversation = Conversation.get_or_create_direct_conversation(current_user_id, target_user_id)
        
        return jsonify({'conversation': conversation.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@messaging_bp.route('/conversations/group', methods=['POST'])
def create_group_conversation():
    """Create a group conversation"""
    try:
        current_user_id = 1  # 1 - using test user ID
        data = request.get_json()
        
        if not data or 'name' not in data or 'participant_ids' not in data:
            return jsonify({'error': 'name and participant_ids are required'}), 400
        
        name = data['name']
        description = data.get('description', '')
        participant_ids = data['participant_ids']
        
        if current_user_id not in participant_ids:
            participant_ids.append(current_user_id)
        
        conversation = Conversation.create_group_conversation(
            name=name,
            description=description,
            created_by_id=current_user_id,
            participant_ids=participant_ids
        )
        
        return jsonify({
            'message': 'Group conversation created successfully',
            'conversation': conversation.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@messaging_bp.route('/conversations/<int:conversation_id>/messages', methods=['GET'])
def get_conversation_messages(conversation_id):
    """Get messages for a conversation"""
    try:
        current_user_id = 1  # 1 - using test user ID
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        conversation = Conversation.query.get(conversation_id)
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        if not conversation.is_participant(current_user_id):
            return jsonify({'error': 'Not authorized to view this conversation'}), 403
        
        query = Message.query.filter_by(conversation_id=conversation_id)
        query = query.order_by(Message.created_at.desc())
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        messages = [message.to_dict() for message in pagination.items]
        
        return jsonify({
            'messages': messages,
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

@messaging_bp.route('/conversations/<int:conversation_id>/messages', methods=['POST'])
def send_message(conversation_id):
    """Send a message to a conversation"""
    try:
        current_user_id = 1  # 1 - using test user ID
        data = request.get_json()
        
        if not data or 'content' not in data:
            return jsonify({'error': 'content is required'}), 400
        
        conversation = Conversation.query.get(conversation_id)
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        if not conversation.is_participant(current_user_id):
            return jsonify({'error': 'Not authorized to send message to this conversation'}), 403
        
        message = Message.create_message(
            conversation_id=conversation_id,
            sender_id=current_user_id,
            content=data['content'],
            message_type=MessageType(data.get('message_type', 'text')),
            file_url=data.get('file_url'),
            file_name=data.get('file_name'),
            file_size=data.get('file_size'),
            mime_type=data.get('mime_type'),
            reply_to_message_id=data.get('reply_to_message_id')
        )
        
        return jsonify({
            'message': 'Message sent successfully',
            'message_data': message.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@messaging_bp.route('/messages/<int:message_id>/read', methods=['POST'])
def mark_message_read(message_id):
    """Mark a message as read"""
    try:
        current_user_id = 1  # 1 - using test user ID
        
        message = Message.query.get(message_id)
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        if not message.conversation.is_participant(current_user_id):
            return jsonify({'error': 'Not authorized to mark this message as read'}), 403
        
        message.mark_as_read(current_user_id)
        
        return jsonify({
            'message': 'Message marked as read successfully',
            'message_id': message_id
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@messaging_bp.route('/messages/<int:message_id>/reaction', methods=['POST'])
def add_message_reaction(message_id):
    """Add reaction to a message"""
    try:
        current_user_id = 1  # 1 - using test user ID
        data = request.get_json()
        
        if not data or 'emoji' not in data:
            return jsonify({'error': 'emoji is required'}), 400
        
        emoji = data['emoji']
        
        message = Message.query.get(message_id)
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        if not message.conversation.is_participant(current_user_id):
            return jsonify({'error': 'Not authorized to react to this message'}), 403
        
        success = message.add_reaction(emoji, current_user_id)
        
        if success:
            return jsonify({
                'message': 'Reaction added successfully',
                'reactions': message.reactions
            }), 200
        else:
            return jsonify({'error': 'Failed to add reaction'}), 400
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@messaging_bp.route('/messages/<int:message_id>/reaction', methods=['DELETE'])
def remove_message_reaction(message_id):
    """Remove reaction from a message"""
    try:
        current_user_id = 1  # 1 - using test user ID
        data = request.get_json()
        
        if not data or 'emoji' not in data:
            return jsonify({'error': 'emoji is required'}), 400
        
        emoji = data['emoji']
        
        message = Message.query.get(message_id)
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        if not message.conversation.is_participant(current_user_id):
            return jsonify({'error': 'Not authorized to react to this message'}), 403
        
        success = message.remove_reaction(emoji, current_user_id)
        
        if success:
            return jsonify({
                'message': 'Reaction removed successfully',
                'reactions': message.reactions
            }), 200
        else:
            return jsonify({'error': 'Failed to remove reaction'}), 400
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500