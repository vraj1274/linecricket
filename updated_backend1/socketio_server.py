"""
Socket.IO server for real-time messaging
"""

from flask import Flask
from flask_socketio import SocketIO, emit, join_room, leave_room, disconnect
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from functools import wraps
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Socket.IO
socketio = SocketIO(cors_allowed_origins="*", logger=True, engineio_logger=True)

def socket_jwt_required(f):
    """Decorator for Socket.IO JWT authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"JWT verification failed: {str(e)}")
            emit('error', {'message': 'Authentication required'})
            disconnect()
            return False
    return decorated_function

@socketio.on('connect')
@socket_jwt_required
def on_connect():
    """Handle client connection"""
    user_id = get_jwt_identity()
    logger.info(f"User {user_id} connected")
    
    # Join user to their personal room for notifications
    join_room(f"user_{user_id}")
    emit('connected', {'message': 'Connected successfully', 'user_id': user_id})

@socketio.on('disconnect')
def on_disconnect():
    """Handle client disconnection"""
    user_id = get_jwt_identity()
    logger.info(f"User {user_id} disconnected")

@socketio.on('join_conversation')
@socket_jwt_required
def on_join_conversation(data):
    """Join a conversation room"""
    user_id = get_jwt_identity()
    conversation_id = data.get('conversation_id')
    
    if not conversation_id:
        emit('error', {'message': 'Conversation ID is required'})
        return
    
    # Verify user is participant in conversation
    from models import Conversation
    conversation = Conversation.query.get(conversation_id)
    
    if not conversation or not conversation.is_participant(user_id):
        emit('error', {'message': 'Not authorized to join this conversation'})
        return
    
    # Join the conversation room
    join_room(f"conversation_{conversation_id}")
    logger.info(f"User {user_id} joined conversation {conversation_id}")
    
    emit('joined_conversation', {
        'conversation_id': conversation_id,
        'message': 'Joined conversation successfully'
    })

@socketio.on('leave_conversation')
@socket_jwt_required
def on_leave_conversation(data):
    """Leave a conversation room"""
    user_id = get_jwt_identity()
    conversation_id = data.get('conversation_id')
    
    if conversation_id:
        leave_room(f"conversation_{conversation_id}")
        logger.info(f"User {user_id} left conversation {conversation_id}")
        
        emit('left_conversation', {
            'conversation_id': conversation_id,
            'message': 'Left conversation successfully'
        })

@socketio.on('send_message')
@socket_jwt_required
def on_send_message(data):
    """Handle sending a message"""
    user_id = get_jwt_identity()
    conversation_id = data.get('conversation_id')
    content = data.get('content')
    message_type = data.get('message_type', 'text')
    reply_to_message_id = data.get('reply_to_message_id')
    
    if not conversation_id or not content:
        emit('error', {'message': 'Conversation ID and content are required'})
        return
    
    try:
        from models import Conversation, Message, MessageType
        
        # Verify user is participant in conversation
        conversation = Conversation.query.get(conversation_id)
        if not conversation or not conversation.is_participant(user_id):
            emit('error', {'message': 'Not authorized to send message to this conversation'})
            return
        
        # Create message
        message = Message.create_message(
            conversation_id=conversation_id,
            sender_id=user_id,
            content=content,
            message_type=MessageType(message_type) if message_type in [e.value for e in MessageType] else MessageType.TEXT,
            reply_to_message_id=reply_to_message_id
        )
        
        # Broadcast message to all participants in the conversation
        socketio.emit('new_message', {
            'message': message.to_dict(),
            'conversation_id': conversation_id
        }, room=f"conversation_{conversation_id}")
        
        # Send confirmation to sender
        emit('message_sent', {
            'message_id': message.id,
            'conversation_id': conversation_id,
            'status': 'sent'
        })
        
        logger.info(f"Message {message.id} sent by user {user_id} in conversation {conversation_id}")
        
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        emit('error', {'message': 'Failed to send message'})

@socketio.on('typing_start')
@socket_jwt_required
def on_typing_start(data):
    """Handle typing start event"""
    user_id = get_jwt_identity()
    conversation_id = data.get('conversation_id')
    
    if conversation_id:
        # Broadcast typing indicator to other participants
        socketio.emit('user_typing', {
            'user_id': user_id,
            'conversation_id': conversation_id,
            'is_typing': True
        }, room=f"conversation_{conversation_id}", include_self=False)

@socketio.on('typing_stop')
@socket_jwt_required
def on_typing_stop(data):
    """Handle typing stop event"""
    user_id = get_jwt_identity()
    conversation_id = data.get('conversation_id')
    
    if conversation_id:
        # Broadcast typing stop to other participants
        socketio.emit('user_typing', {
            'user_id': user_id,
            'conversation_id': conversation_id,
            'is_typing': False
        }, room=f"conversation_{conversation_id}", include_self=False)

@socketio.on('mark_as_read')
@socket_jwt_required
def on_mark_as_read(data):
    """Handle marking messages as read"""
    user_id = get_jwt_identity()
    conversation_id = data.get('conversation_id')
    message_ids = data.get('message_ids', [])
    
    if not conversation_id:
        emit('error', {'message': 'Conversation ID is required'})
        return
    
    try:
        from models import Message
        
        # Mark messages as read
        messages = Message.query.filter(
            Message.id.in_(message_ids),
            Message.conversation_id == conversation_id,
            Message.receiver_id == user_id
        ).all()
        
        for message in messages:
            message.mark_as_read(user_id)
        
        # Broadcast read receipt to other participants
        socketio.emit('messages_read', {
            'user_id': user_id,
            'conversation_id': conversation_id,
            'message_ids': message_ids,
            'read_at': datetime.utcnow().isoformat()
        }, room=f"conversation_{conversation_id}", include_self=False)
        
        emit('messages_marked_read', {
            'conversation_id': conversation_id,
            'message_ids': message_ids
        })
        
    except Exception as e:
        logger.error(f"Error marking messages as read: {str(e)}")
        emit('error', {'message': 'Failed to mark messages as read'})

@socketio.on('add_reaction')
@socket_jwt_required
def on_add_reaction(data):
    """Handle adding reaction to message"""
    user_id = get_jwt_identity()
    message_id = data.get('message_id')
    emoji = data.get('emoji')
    
    if not message_id or not emoji:
        emit('error', {'message': 'Message ID and emoji are required'})
        return
    
    try:
        from models import Message
        
        message = Message.query.get(message_id)
        if not message:
            emit('error', {'message': 'Message not found'})
            return
        
        # Verify user is participant in conversation
        if not message.conversation.is_participant(user_id):
            emit('error', {'message': 'Not authorized to react to this message'})
            return
        
        # Add reaction
        success = message.add_reaction(emoji, user_id)
        
        if success:
            # Broadcast reaction to all participants
            socketio.emit('reaction_added', {
                'message_id': message_id,
                'emoji': emoji,
                'user_id': user_id,
                'reactions': message.reactions
            }, room=f"conversation_{message.conversation_id}")
            
            emit('reaction_added', {
                'message_id': message_id,
                'emoji': emoji,
                'status': 'success'
            })
        else:
            emit('error', {'message': 'Failed to add reaction'})
            
    except Exception as e:
        logger.error(f"Error adding reaction: {str(e)}")
        emit('error', {'message': 'Failed to add reaction'})

@socketio.on('remove_reaction')
@socket_jwt_required
def on_remove_reaction(data):
    """Handle removing reaction from message"""
    user_id = get_jwt_identity()
    message_id = data.get('message_id')
    emoji = data.get('emoji')
    
    if not message_id or not emoji:
        emit('error', {'message': 'Message ID and emoji are required'})
        return
    
    try:
        from models import Message
        
        message = Message.query.get(message_id)
        if not message:
            emit('error', {'message': 'Message not found'})
            return
        
        # Verify user is participant in conversation
        if not message.conversation.is_participant(user_id):
            emit('error', {'message': 'Not authorized to react to this message'})
            return
        
        # Remove reaction
        success = message.remove_reaction(emoji, user_id)
        
        if success:
            # Broadcast reaction removal to all participants
            socketio.emit('reaction_removed', {
                'message_id': message_id,
                'emoji': emoji,
                'user_id': user_id,
                'reactions': message.reactions
            }, room=f"conversation_{message.conversation_id}")
            
            emit('reaction_removed', {
                'message_id': message_id,
                'emoji': emoji,
                'status': 'success'
            })
        else:
            emit('error', {'message': 'Failed to remove reaction'})
            
    except Exception as e:
        logger.error(f"Error removing reaction: {str(e)}")
        emit('error', {'message': 'Failed to remove reaction'})

@socketio.on('error')
def on_error(error):
    """Handle Socket.IO errors"""
    logger.error(f"Socket.IO error: {error}")

@socketio.on('notification_delivered')
@socket_jwt_required
def on_notification_delivered(data):
    """Handle notification delivery confirmation"""
    user_id = get_jwt_identity()
    notification_id = data.get('notification_id')
    
    if notification_id:
        try:
            from services.notification_service import notification_service
            notification_service.mark_notification_delivered(notification_id)
            logger.info(f"Notification {notification_id} marked as delivered for user {user_id}")
        except Exception as e:
            logger.error(f"Failed to mark notification as delivered: {str(e)}")

@socketio.on('notification_read')
@socket_jwt_required
def on_notification_read(data):
    """Handle notification read confirmation"""
    user_id = get_jwt_identity()
    notification_id = data.get('notification_id')
    
    if notification_id:
        try:
            from models import Notification
            notification = Notification.query.get(notification_id)
            if notification and notification.receiver_id == user_id:
                notification.mark_as_read()
                logger.info(f"Notification {notification_id} marked as read by user {user_id}")
        except Exception as e:
            logger.error(f"Failed to mark notification as read: {str(e)}")

@socketio.on('join_match_room')
@socket_jwt_required
def on_join_match_room(data):
    """Join a match room for real-time updates"""
    user_id = get_jwt_identity()
    match_id = data.get('match_id')
    
    if not match_id:
        emit('error', {'message': 'Match ID is required'})
        return
    
    try:
        from models import Match
        match = Match.query.get(match_id)
        
        if not match:
            emit('error', {'message': 'Match not found'})
            return
        
        # Join the match room
        join_room(f"match_{match_id}")
        logger.info(f"User {user_id} joined match room {match_id}")
        
        emit('joined_match_room', {
            'match_id': match_id,
            'message': 'Joined match room successfully'
        })
        
    except Exception as e:
        logger.error(f"Error joining match room: {str(e)}")
        emit('error', {'message': 'Failed to join match room'})

@socketio.on('leave_match_room')
@socket_jwt_required
def on_leave_match_room(data):
    """Leave a match room"""
    user_id = get_jwt_identity()
    match_id = data.get('match_id')
    
    if match_id:
        leave_room(f"match_{match_id}")
        logger.info(f"User {user_id} left match room {match_id}")
        
        emit('left_match_room', {
            'match_id': match_id,
            'message': 'Left match room successfully'
        })

@socketio.on('match_join')
@socket_jwt_required
def on_match_join(data):
    """Handle match join event"""
    user_id = get_jwt_identity()
    match_id = data.get('match_id')
    
    if not match_id:
        emit('error', {'message': 'Match ID is required'})
        return
    
    try:
        from models import Match
        match = Match.query.get(match_id)
        
        if not match:
            emit('error', {'message': 'Match not found'})
            return
        
        if not match.can_join(user_id):
            emit('error', {'message': 'Cannot join this match'})
            return
        
        # Join match
        success = match.join_match(user_id)
        if success:
            # Broadcast to all match room participants
            socketio.emit('match_updated', {
                'match': match.to_dict(),
                'action': 'player_joined',
                'user_id': user_id
            }, room=f"match_{match_id}")
            
            emit('match_joined', {
                'match_id': match_id,
                'message': 'Successfully joined match'
            })
        else:
            emit('error', {'message': 'Failed to join match'})
            
    except Exception as e:
        logger.error(f"Error joining match: {str(e)}")
        emit('error', {'message': 'Failed to join match'})

@socketio.on('match_leave')
@socket_jwt_required
def on_match_leave(data):
    """Handle match leave event"""
    user_id = get_jwt_identity()
    match_id = data.get('match_id')
    
    if not match_id:
        emit('error', {'message': 'Match ID is required'})
        return
    
    try:
        from models import Match
        match = Match.query.get(match_id)
        
        if not match:
            emit('error', {'message': 'Match not found'})
            return
        
        if not match.is_participant(user_id):
            emit('error', {'message': 'You are not a participant in this match'})
            return
        
        # Leave match
        success = match.leave_match(user_id)
        if success:
            # Broadcast to all match room participants
            socketio.emit('match_updated', {
                'match': match.to_dict(),
                'action': 'player_left',
                'user_id': user_id
            }, room=f"match_{match_id}")
            
            emit('match_left', {
                'match_id': match_id,
                'message': 'Successfully left match'
            })
        else:
            emit('error', {'message': 'Failed to leave match'})
            
    except Exception as e:
        logger.error(f"Error leaving match: {str(e)}")
        emit('error', {'message': 'Failed to leave match'})

@socketio.on('match_update')
@socket_jwt_required
def on_match_update(data):
    """Handle match update event (creator only)"""
    user_id = get_jwt_identity()
    match_id = data.get('match_id')
    update_type = data.get('update_type')  # 'start', 'end', 'cancel', 'postpone'
    
    if not match_id or not update_type:
        emit('error', {'message': 'Match ID and update type are required'})
        return
    
    try:
        from models import Match
        match = Match.query.get(match_id)
        
        if not match:
            emit('error', {'message': 'Match not found'})
            return
        
        if match.creator_id != user_id:
            emit('error', {'message': 'Only the match creator can update the match'})
            return
        
        success = False
        if update_type == 'start':
            success = match.start_match()
        elif update_type == 'end':
            success = match.end_match()
        elif update_type == 'cancel':
            success = match.cancel_match()
        elif update_type == 'postpone':
            new_date = data.get('new_date')
            new_time = data.get('new_time')
            reason = data.get('reason')
            if new_date and new_time:
                success = match.postpone_match(new_date, new_time, reason)
        
        if success:
            # Broadcast to all match room participants
            socketio.emit('match_updated', {
                'match': match.to_dict(),
                'action': update_type,
                'user_id': user_id
            }, room=f"match_{match_id}")
            
            emit('match_updated', {
                'match_id': match_id,
                'action': update_type,
                'message': f'Match {update_type} successfully'
            })
        else:
            emit('error', {'message': f'Failed to {update_type} match'})
            
    except Exception as e:
        logger.error(f"Error updating match: {str(e)}")
        emit('error', {'message': 'Failed to update match'})

def init_socketio(app):
    """Initialize Socket.IO with Flask app"""
    socketio.init_app(app)
    return socketio
