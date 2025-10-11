from .base import BaseModel, db
from datetime import datetime
from .enums import RelationshipType, RelationshipStatus

class Relationship(BaseModel):
    """Social relationships between users (follow, block, connection)"""
    __tablename__ = 'relationships'
    
    # User IDs
    follower_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    following_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    
    # Relationship details
    relationship_type = db.Column(db.Enum(RelationshipType), nullable=False)
    status = db.Column(db.Enum(RelationshipStatus), default=RelationshipStatus.ACCEPTED)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    accepted_at = db.Column(db.DateTime, nullable=True)
    rejected_at = db.Column(db.DateTime, nullable=True)
    
    # Additional data
    message = db.Column(db.Text)  # For connection requests
    is_mutual = db.Column(db.Boolean, default=False)  # For mutual connections
    
    # Ensure unique relationships per user pair per type
    __table_args__ = (
        db.UniqueConstraint('follower_id', 'following_id', 'relationship_type', 
                          name='unique_relationship_per_type'),
        db.CheckConstraint('follower_id != following_id', name='prevent_self_relationship')
    )
    
    # Relationships
    follower = db.relationship('User', foreign_keys=[follower_id], backref='following_relationships')
    following = db.relationship('User', foreign_keys=[following_id], backref='follower_relationships')
    
    def to_dict(self):
        """Convert relationship to dictionary with user info"""
        data = super().to_dict()
        data['relationship_type'] = self.relationship_type.value if self.relationship_type else None
        data['status'] = self.status.value if self.status else None
        data['follower'] = {
            'id': self.follower.id,
            'username': self.follower.username,
            'profile': self.follower.profile.to_dict() if self.follower.profile else None
        }
        data['following'] = {
            'id': self.following.id,
            'username': self.following.username,
            'profile': self.following.profile.to_dict() if self.following.profile else None
        }
        return data
    
    @classmethod
    def follow_user(cls, follower_id, following_id):
        """Follow a user"""
        # Check if already following
        existing = cls.query.filter_by(
            follower_id=follower_id,
            following_id=following_id,
            relationship_type=RelationshipType.FOLLOW
        ).first()
        
        if existing:
            return existing, False  # Already following
        
        # Check if blocked
        blocked = cls.query.filter_by(
            follower_id=follower_id,
            following_id=following_id,
            relationship_type=RelationshipType.BLOCK
        ).first()
        
        if blocked:
            return None, False  # Cannot follow blocked user
        
        # Create follow relationship
        relationship = cls(
            follower_id=follower_id,
            following_id=following_id,
            relationship_type=RelationshipType.FOLLOW,
            status=RelationshipStatus.ACCEPTED
        )
        
        db.session.add(relationship)
        db.session.commit()
        
        return relationship, True
    
    @classmethod
    def unfollow_user(cls, follower_id, following_id):
        """Unfollow a user"""
        relationship = cls.query.filter_by(
            follower_id=follower_id,
            following_id=following_id,
            relationship_type=RelationshipType.FOLLOW
        ).first()
        
        if relationship:
            db.session.delete(relationship)
            db.session.commit()
            return True
        
        return False
    
    @classmethod
    def block_user(cls, blocker_id, blocked_id):
        """Block a user"""
        # Check if already blocked
        existing = cls.query.filter_by(
            follower_id=blocker_id,
            following_id=blocked_id,
            relationship_type=RelationshipType.BLOCK
        ).first()
        
        if existing:
            return existing, False  # Already blocked
        
        # Remove any existing follow relationships
        follow_relationship = cls.query.filter_by(
            follower_id=blocker_id,
            following_id=blocked_id,
            relationship_type=RelationshipType.FOLLOW
        ).first()
        
        if follow_relationship:
            db.session.delete(follow_relationship)
        
        # Remove any existing follow relationships in reverse
        reverse_follow = cls.query.filter_by(
            follower_id=blocked_id,
            following_id=blocker_id,
            relationship_type=RelationshipType.FOLLOW
        ).first()
        
        if reverse_follow:
            db.session.delete(reverse_follow)
        
        # Create block relationship
        relationship = cls(
            follower_id=blocker_id,
            following_id=blocked_id,
            relationship_type=RelationshipType.BLOCK,
            status=RelationshipStatus.ACCEPTED
        )
        
        db.session.add(relationship)
        db.session.commit()
        
        return relationship, True
    
    @classmethod
    def unblock_user(cls, blocker_id, blocked_id):
        """Unblock a user"""
        relationship = cls.query.filter_by(
            follower_id=blocker_id,
            following_id=blocked_id,
            relationship_type=RelationshipType.BLOCK
        ).first()
        
        if relationship:
            db.session.delete(relationship)
            db.session.commit()
            return True
        
        return False
    
    @classmethod
    def send_connection_request(cls, requester_id, target_id, message=None):
        """Send a connection request"""
        # Check if already connected or request pending
        existing = cls.query.filter(
            ((cls.follower_id == requester_id) & (cls.following_id == target_id)) |
            ((cls.follower_id == target_id) & (cls.following_id == requester_id)),
            cls.relationship_type == RelationshipType.CONNECTION_REQUEST
        ).first()
        
        if existing:
            return existing, False  # Request already exists
        
        # Check if already connected
        connected = cls.query.filter(
            ((cls.follower_id == requester_id) & (cls.following_id == target_id)) |
            ((cls.follower_id == target_id) & (cls.following_id == requester_id)),
            cls.relationship_type == RelationshipType.CONNECTION_ACCEPTED
        ).first()
        
        if connected:
            return connected, False  # Already connected
        
        # Create connection request
        relationship = cls(
            follower_id=requester_id,
            following_id=target_id,
            relationship_type=RelationshipType.CONNECTION_REQUEST,
            status=RelationshipStatus.PENDING,
            message=message
        )
        
        db.session.add(relationship)
        db.session.commit()
        
        return relationship, True
    
    @classmethod
    def accept_connection_request(cls, accepter_id, requester_id):
        """Accept a connection request"""
        # Find the pending request
        request = cls.query.filter_by(
            follower_id=requester_id,
            following_id=accepter_id,
            relationship_type=RelationshipType.CONNECTION_REQUEST,
            status=RelationshipStatus.PENDING
        ).first()
        
        if not request:
            return None, False  # No pending request
        
        # Update request to accepted
        request.relationship_type = RelationshipType.CONNECTION_ACCEPTED
        request.status = RelationshipStatus.ACCEPTED
        request.accepted_at = datetime.utcnow()
        
        # Create mutual connection
        mutual_connection = cls(
            follower_id=accepter_id,
            following_id=requester_id,
            relationship_type=RelationshipType.CONNECTION_ACCEPTED,
            status=RelationshipStatus.ACCEPTED,
            accepted_at=datetime.utcnow(),
            is_mutual=True
        )
        
        request.is_mutual = True
        
        db.session.add(mutual_connection)
        db.session.commit()
        
        return request, True
    
    @classmethod
    def reject_connection_request(cls, rejecter_id, requester_id):
        """Reject a connection request"""
        request = cls.query.filter_by(
            follower_id=requester_id,
            following_id=rejecter_id,
            relationship_type=RelationshipType.CONNECTION_REQUEST,
            status=RelationshipStatus.PENDING
        ).first()
        
        if not request:
            return None, False  # No pending request
        
        # Update request to rejected
        request.relationship_type = RelationshipType.CONNECTION_REJECTED
        request.status = RelationshipStatus.REJECTED
        request.rejected_at = datetime.utcnow()
        
        db.session.commit()
        
        return request, True
    
    @classmethod
    def get_followers(cls, user_id, page=1, per_page=20):
        """Get followers of a user with pagination"""
        query = cls.query.filter_by(
            following_id=user_id,
            relationship_type=RelationshipType.FOLLOW,
            status=RelationshipStatus.ACCEPTED
        )
        
        return query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
    
    @classmethod
    def get_following(cls, user_id, page=1, per_page=20):
        """Get users that a user is following with pagination"""
        query = cls.query.filter_by(
            follower_id=user_id,
            relationship_type=RelationshipType.FOLLOW,
            status=RelationshipStatus.ACCEPTED
        )
        
        return query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
    
    @classmethod
    def get_connections(cls, user_id, page=1, per_page=20):
        """Get connections of a user with pagination"""
        query = cls.query.filter(
            ((cls.follower_id == user_id) | (cls.following_id == user_id)),
            cls.relationship_type == RelationshipType.CONNECTION_ACCEPTED,
            cls.status == RelationshipStatus.ACCEPTED
        )
        
        return query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
    
    @classmethod
    def get_pending_requests(cls, user_id, page=1, per_page=20):
        """Get pending connection requests for a user"""
        query = cls.query.filter_by(
            following_id=user_id,
            relationship_type=RelationshipType.CONNECTION_REQUEST,
            status=RelationshipStatus.PENDING
        )
        
        return query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
    
    @classmethod
    def get_sent_requests(cls, user_id, page=1, per_page=20):
        """Get connection requests sent by a user"""
        query = cls.query.filter_by(
            follower_id=user_id,
            relationship_type=RelationshipType.CONNECTION_REQUEST,
            status=RelationshipStatus.PENDING
        )
        
        return query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
    
    @classmethod
    def is_following(cls, follower_id, following_id):
        """Check if user is following another user"""
        return cls.query.filter_by(
            follower_id=follower_id,
            following_id=following_id,
            relationship_type=RelationshipType.FOLLOW,
            status=RelationshipStatus.ACCEPTED
        ).first() is not None
    
    @classmethod
    def is_blocked(cls, blocker_id, blocked_id):
        """Check if user is blocked by another user"""
        return cls.query.filter_by(
            follower_id=blocker_id,
            following_id=blocked_id,
            relationship_type=RelationshipType.BLOCK,
            status=RelationshipStatus.ACCEPTED
        ).first() is not None
    
    @classmethod
    def is_connected(cls, user1_id, user2_id):
        """Check if two users are connected"""
        return cls.query.filter(
            ((cls.follower_id == user1_id) & (cls.following_id == user2_id)) |
            ((cls.follower_id == user2_id) & (cls.following_id == user1_id)),
            cls.relationship_type == RelationshipType.CONNECTION_ACCEPTED,
            cls.status == RelationshipStatus.ACCEPTED
        ).first() is not None
    
    @classmethod
    def get_relationship_status(cls, user1_id, user2_id):
        """Get the relationship status between two users"""
        # Check if user1 follows user2
        follow = cls.query.filter_by(
            follower_id=user1_id,
            following_id=user2_id,
            relationship_type=RelationshipType.FOLLOW,
            status=RelationshipStatus.ACCEPTED
        ).first()
        
        # Check if user1 is blocked by user2
        blocked = cls.query.filter_by(
            follower_id=user2_id,
            following_id=user1_id,
            relationship_type=RelationshipType.BLOCK,
            status=RelationshipStatus.ACCEPTED
        ).first()
        
        # Check if they are connected
        connected = cls.is_connected(user1_id, user2_id)
        
        # Check for pending connection request
        pending_request = cls.query.filter(
            ((cls.follower_id == user1_id) & (cls.following_id == user2_id)) |
            ((cls.follower_id == user2_id) & (cls.following_id == user1_id)),
            cls.relationship_type == RelationshipType.CONNECTION_REQUEST,
            cls.status == RelationshipStatus.PENDING
        ).first()
        
        return {
            'is_following': follow is not None,
            'is_blocked': blocked is not None,
            'is_connected': connected,
            'has_pending_request': pending_request is not None,
            'pending_request_direction': 'sent' if pending_request and pending_request.follower_id == user1_id else 'received' if pending_request else None
        }
