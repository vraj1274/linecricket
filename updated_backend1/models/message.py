from .base import BaseModel, db
from datetime import datetime
from enum import Enum

class ConversationType(Enum):
    DIRECT = "direct"
    GROUP = "group"

class MessageType(Enum):
    TEXT = "text"
    IMAGE = "image"
    FILE = "file"
    SYSTEM = "system"

class MessageStatus(Enum):
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"

class Conversation(BaseModel):
    """Conversation model for messaging (direct and group)"""
    __tablename__ = 'conversations'
    
    # For direct conversations
    user1_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    user2_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    
    # Last message info
    last_message_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_message_content = db.Column(db.Text)
    
    # Message relationships
    messages = db.relationship('Message', backref='conversation', lazy='dynamic', cascade='all, delete-orphan')
    participants = db.relationship('ConversationParticipant', backref='conversation', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert conversation to dictionary with user info"""
        data = super().to_dict()
        data['conversation_type'] = self.conversation_type.value if self.conversation_type else None
        
        if self.conversation_type == ConversationType.DIRECT:
            data['user1'] = {
                'id': self.user1.id,
                'username': self.user1.username,
                'profile': self.user1.profile.to_dict() if self.user1.profile else None
            } if self.user1 else None
            data['user2'] = {
                'id': self.user2.id,
                'username': self.user2.username,
                'profile': self.user2.profile.to_dict() if self.user2.profile else None
            } if self.user2 else None
        else:
            # Group conversation
            data['created_by'] = {
                'id': self.created_by.id,
                'username': self.created_by.username,
                'profile': self.created_by.profile.to_dict() if self.created_by.profile else None
            } if self.created_by else None
            data['participants'] = [p.to_dict() for p in self.participants]
        
        data['unread_count'] = self.get_unread_count()
        data['last_message_sender'] = {
            'id': self.last_message_sender.id,
            'username': self.last_message_sender.username,
            'profile': self.last_message_sender.profile.to_dict() if self.last_message_sender.profile else None
        } if self.last_message_sender else None
        
        return data
    
    def get_unread_count(self, user_id=None):
        """Get unread message count for a user"""
        if user_id:
            return self.messages.filter(
                Message.receiver_id == user_id,
                Message.is_read == False
            ).count()
        return self.messages.filter_by(is_read=False).count()
    
    def add_participant(self, user_id, role='member'):
        """Add a participant to group conversation"""
        if self.conversation_type == ConversationType.DIRECT:
            return False
        
        participant = ConversationParticipant(
            conversation_id=self.id,
            user_id=user_id,
            role=role
        )
        db.session.add(participant)
        db.session.commit()
        return participant
    
    def remove_participant(self, user_id):
        """Remove a participant from group conversation"""
        participant = ConversationParticipant.query.filter_by(
            conversation_id=self.id,
            user_id=user_id
        ).first()
        
        if participant:
            db.session.delete(participant)
            db.session.commit()
            return True
        return False
    
    def is_participant(self, user_id):
        """Check if user is a participant in the conversation"""
        if self.conversation_type == ConversationType.DIRECT:
            return user_id in [self.user1_id, self.user2_id]
        else:
            return ConversationParticipant.query.filter_by(
                conversation_id=self.id,
                user_id=user_id
            ).first() is not None
    
    @classmethod
    def get_or_create_direct_conversation(cls, user1_id, user2_id):
        """Get existing direct conversation or create new one between two users"""
        # Ensure consistent ordering for unique constraint
        if user1_id > user2_id:
            user1_id, user2_id = user2_id, user1_id
        
        conversation = cls.query.filter_by(
            user1_id=user1_id, 
            user2_id=user2_id,
            conversation_type=ConversationType.DIRECT
        ).first()
        
        if not conversation:
            conversation = cls(
                user1_id=user1_id,
                user2_id=user2_id,
                conversation_type=ConversationType.DIRECT
            )
            conversation.save()
        return conversation
    
    @classmethod
    def create_group_conversation(cls, name, description, created_by_id, participant_ids):
        """Create a new group conversation"""
        conversation = cls(
            name=name,
            description=description,
            conversation_type=ConversationType.GROUP,
            created_by_id=created_by_id
        )
        conversation.save()
        
        # Add creator as admin
        conversation.add_participant(created_by_id, 'admin')
        
        # Add other participants
        for user_id in participant_ids:
            if user_id != created_by_id:
                conversation.add_participant(user_id, 'member')
        
        return conversation

class ConversationParticipant(BaseModel):
    """Model for group conversation participants"""
    __tablename__ = 'conversation_participants'
    
    conversation_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('conversations.id'), nullable=False)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    role = db.Column(db.String(20), default='member')  # admin, member
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Ensure unique participation per user per conversation
    __table_args__ = (db.UniqueConstraint('conversation_id', 'user_id', name='unique_conversation_participation'),)
    
    def to_dict(self):
        """Convert participant to dictionary with user info"""
        data = super().to_dict()
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'profile': self.user.profile.to_dict() if self.user.profile else None
        }
        return data

class Message(BaseModel):
    """Message model for messaging"""
    __tablename__ = 'messages'
    
    conversation_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('conversations.id'), nullable=False)
    sender_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    receiver_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    read_at = db.Column(db.DateTime)
    
    def to_dict(self):
        """Convert message to dictionary with sender info"""
        data = super().to_dict()
        data['message_type'] = self.message_type.value if self.message_type else None
        data['status'] = self.status.value if self.status else None
        data['sender'] = {
            'id': self.sender.id,
            'username': self.sender.username,
            'profile': self.sender.profile.to_dict() if self.sender.profile else None
        }
        data['reactions'] = self.reactions or {}
        data['reply_to_message'] = self.reply_to_message.to_dict() if self.reply_to_message else None
        return data
    
    def mark_as_read(self, user_id=None):
        """Mark message as read"""
        self.is_read = True
        self.read_at = datetime.utcnow()
        self.status = MessageStatus.READ
        self.save()
        return self
    
    def mark_as_delivered(self):
        """Mark message as delivered"""
        self.status = MessageStatus.DELIVERED
        self.delivered_at = datetime.utcnow()
        self.save()
        return self
    
    def add_reaction(self, emoji, user_id):
        """Add a reaction to the message"""
        if not self.reactions:
            self.reactions = {}
        
        if emoji not in self.reactions:
            self.reactions[emoji] = []
        
        if user_id not in self.reactions[emoji]:
            self.reactions[emoji].append(user_id)
            self.save()
            return True
        return False
    
    def remove_reaction(self, emoji, user_id):
        """Remove a reaction from the message"""
        if not self.reactions or emoji not in self.reactions:
            return False
        
        if user_id in self.reactions[emoji]:
            self.reactions[emoji].remove(user_id)
            if not self.reactions[emoji]:
                del self.reactions[emoji]
            self.save()
            return True
        return False
    
    @classmethod
    def create_message(cls, conversation_id, sender_id, content, message_type=MessageType.TEXT, 
                      receiver_id=None, file_url=None, file_name=None, file_size=None, 
                      mime_type=None, reply_to_message_id=None):
        """Create a new message"""
        message = cls(
            conversation_id=conversation_id,
            sender_id=sender_id,
            receiver_id=receiver_id,
            content=content,
            message_type=message_type,
            file_url=file_url,
            file_name=file_name,
            file_size=file_size,
            mime_type=mime_type,
            reply_to_message_id=reply_to_message_id
        )
        
        db.session.add(message)
        db.session.commit()
        
        # Update conversation last message info
        conversation = Conversation.query.get(conversation_id)
        if conversation:
            conversation.last_message_at = datetime.utcnow()
            conversation.last_message_content = content
            conversation.last_message_sender_id = sender_id
            conversation.save()
        
        return message
