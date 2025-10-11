from .base import BaseModel, db
from datetime import datetime
from sqlalchemy import text

class Post(BaseModel):
    """Post model for cricket-related content"""
    __tablename__ = 'posts'
    
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.JSON)
    video_url = db.Column(db.String(500))
    location = db.Column(db.String(100))
    likes_count = db.Column(db.Integer, default=0)
    comments_count = db.Column(db.Integer, default=0)
    shares_count = db.Column(db.Integer, default=0)
    bookmarks_count = db.Column(db.Integer, default=0)
    views_count = db.Column(db.Integer, default=0)
    
    # Post type and visibility
    post_type = db.Column(db.String(50), default='general', nullable=False)
    visibility = db.Column(db.String(20), default='public')
    is_pinned = db.Column(db.Boolean, default=False)
    # is_active = db.Column(db.Boolean, default=True)  # Temporarily commented out due to schema mismatch
    
    # Engagement tracking
    engagement_score = db.Column(db.Float, default=0.0)
    trending_score = db.Column(db.Float, default=0.0)
    
    # Hashtags and mentions
    hashtags = db.Column(db.String(500))
    mentions = db.Column(db.String(500))
    
    # Community/Academy/Venue specific fields
    page_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('page_profiles.page_id'), nullable=True)
    community_profile_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('page_profiles.page_id'), nullable=True)
    academy_profile_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('page_profiles.page_id'), nullable=True)
    venue_profile_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('page_profiles.page_id'), nullable=True)
    title = db.Column(db.String(200))
    is_approved = db.Column(db.Boolean, default=True)
    approval_status = db.Column(db.String(20), default='approved')
    moderator_notes = db.Column(db.Text)
    
    # Event specific fields
    event_date = db.Column(db.Date)
    event_time = db.Column(db.Time)
    event_location = db.Column(db.String(200))
    max_participants = db.Column(db.Integer)
    registration_fee = db.Column(db.Float)
    registration_deadline = db.Column(db.Date)
    
    # Match specific fields - temporarily commented out due to schema mismatch
    # match_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('matches.id'), nullable=True)
    
    # Share specific fields - temporarily commented out due to schema mismatch
    # shared_from_post_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('posts.id'), nullable=True)
    
    # Post metadata
    post_category = db.Column(db.String(50))
    tags = db.Column(db.String(500))
    featured = db.Column(db.Boolean, default=False)
    priority = db.Column(db.Integer, default=0)
    schedule_time = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Search vectors (using Text for PostgreSQL TSVECTOR compatibility)
    content_tsv = db.Column(db.Text)
    search_vector = db.Column(db.Text)
    
    # Post relationships
    user = db.relationship('User', back_populates='posts', lazy='select')
    likes = db.relationship('PostLike', backref='post', lazy='dynamic', cascade='all, delete-orphan')
    post_comments = db.relationship('PostComment', backref='post', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert post to dictionary with related data"""
        data = super().to_dict()
        data['likes_count'] = self.likes_count
        data['comments_count'] = self.comments_count
        data['shares_count'] = self.shares_count
        data['bookmarks_count'] = self.bookmarks_count
        data['views_count'] = self.views_count
        data['author'] = {
            'id': self.user.id,
            'username': self.user.username,
            'profile': self.user.profile.to_dict() if self.user.profile else None
        }
        
        # Add engagement_stats object for frontend compatibility
        data['engagement_stats'] = {
            'likes': self.likes_count,
            'comments': self.comments_count,
            'shares': self.shares_count,
            'bookmarks': self.bookmarks_count,
            'views': self.views_count,
            'engagement_score': self.engagement_score or 0.0
        }
        
        # Add interaction flags (default to False for now)
        data['is_liked'] = False
        data['is_bookmarked'] = False
        data['is_shared'] = False
        
        return data
    
    def is_liked_by(self, user_id):
        """Check if post is liked by a specific user"""
        from models.post import PostLike
        return PostLike.query.filter_by(post_id=self.id, user_id=user_id).first() is not None
    
    def is_bookmarked_by(self, user_id):
        """Check if post is bookmarked by a specific user"""
        from models.post import PostBookmark
        return PostBookmark.query.filter_by(post_id=self.id, user_id=user_id).first() is not None
    
    def is_shared_by(self, user_id):
        """Check if post is shared by a specific user"""
        from models.post import PostShare
        return PostShare.query.filter_by(post_id=self.id, user_id=user_id).first() is not None
    
    def add_view(self, user_id):
        """Add a view to the post"""
        # For now, just increment the view count
        # In a production app, you might want to track individual views
        self.views_count = (self.views_count or 0) + 1
        self.save()
    
    def calculate_engagement_score(self):
        """Calculate engagement score based on interactions"""
        total_interactions = (self.likes_count or 0) + (self.comments_count or 0) + (self.shares_count or 0) + (self.bookmarks_count or 0)
        time_factor = 1.0  # Could be based on post age
        
        self.engagement_score = total_interactions * time_factor
        self.save()
        return self.engagement_score
    
    def extract_hashtags_and_mentions(self):
        """Extract hashtags and mentions from content"""
        import re
        
        # Extract hashtags
        hashtag_pattern = r'#(\w+)'
        hashtags = re.findall(hashtag_pattern, self.content)
        
        # Extract mentions
        mention_pattern = r'@(\w+)'
        mentions = re.findall(mention_pattern, self.content)
        
        self.hashtags = list(set(hashtags))
        self.mentions = list(set(mentions))
        self.save()
        
        return {
            'hashtags': self.hashtags,
            'mentions': self.mentions
        }
    
    def get_engagement_stats(self):
        """Get comprehensive engagement statistics"""
        return {
            'likes': self.likes_count,
            'comments': self.comments_count,
            'shares': self.shares_count,
            'bookmarks': self.bookmarks_count,
            'views': self.views_count,
            'engagement_score': self.engagement_score,
            'trending_score': self.trending_score
        }
    
    def update_search_vector(self):
        """Update the search vector for full-text search"""
        # Combine content, hashtags, and mentions for search
        search_text = self.content or ""
        if self.hashtags:
            search_text += " " + " ".join([f"#{tag}" for tag in self.hashtags])
        if self.mentions:
            search_text += " " + " ".join([f"@{mention}" for mention in self.mentions])
        
        self.content_tsv = search_text
        self.save()
    
    @classmethod
    def search_posts(cls, query, page=1, per_page=20, user_id=None):
        """Search posts using full-text search"""
        # Base query
        search_query = cls.query.filter(
            cls.content_tsv.ilike(f'%{query}%'),
            cls.is_active == True  # Only search active posts
        )
        
        # If user_id provided, filter by user's posts or public posts
        if user_id:
            search_query = search_query.filter(
                (cls.user_id == user_id) | (cls.visibility == 'public')
            )
        else:
            search_query = search_query.filter(cls.visibility == 'public')
        
        # Order by engagement score and recency
        search_query = search_query.order_by(
            cls.engagement_score.desc(),
            cls.created_at.desc()
        )
        
        # Paginate results
        return search_query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
    
    @classmethod
    def get_feed_posts(cls, user_id=None, page=1, per_page=20, post_type=None, hashtag=None):
        """Get feed posts with various filters"""
        query = cls.query.filter(
            cls.visibility == 'public'
            # cls.is_active == True  # Temporarily commented out due to schema mismatch
        )
        
        # Filter by post type
        if post_type:
            query = query.filter(cls.post_type == post_type)
        
        # Filter by hashtag
        if hashtag:
            query = query.filter(cls.hashtags.contains([hashtag]))
        
        # Order by engagement and recency
        query = query.order_by(
            cls.trending_score.desc(),
            cls.engagement_score.desc(),
            cls.created_at.desc()
        )
        
        # Paginate results
        return query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
    
    @classmethod
    def get_trending_posts(cls, page=1, per_page=20, timeframe='24h'):
        """Get trending posts based on engagement"""
        query = cls.query.filter(
            cls.visibility == 'public'
            # cls.is_active == True  # Temporarily commented out due to schema mismatch
        )
        
        # Filter by timeframe
        if timeframe == '24h':
            from datetime import datetime, timedelta
            yesterday = datetime.utcnow() - timedelta(days=1)
            query = query.filter(cls.created_at >= yesterday)
        elif timeframe == '7d':
            from datetime import datetime, timedelta
            week_ago = datetime.utcnow() - timedelta(days=7)
            query = query.filter(cls.created_at >= week_ago)
        
        # Order by trending score
        query = query.order_by(cls.trending_score.desc())
        
        # Paginate results
        return query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
    
    def update_trending_score(self):
        """Update trending score based on recent engagement"""
        # Calculate trending score based on recent likes, comments, shares
        # This is a simplified algorithm - in production, you'd want more sophisticated scoring
        recent_engagement = (self.likes_count or 0) + ((self.comments_count or 0) * 2) + ((self.shares_count or 0) * 3)
        
        # Time decay factor (newer posts get higher scores)
        from datetime import datetime, timedelta
        hours_old = (datetime.utcnow() - self.created_at).total_seconds() / 3600
        time_factor = max(0.1, 1.0 - (hours_old / 168))  # Decay over a week
        
        self.trending_score = recent_engagement * time_factor
        self.save()
        return self.trending_score

class PostLike(BaseModel):
    """Post likes model"""
    __tablename__ = 'post_likes'
    
    post_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('posts.id'), nullable=False)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    
    # Ensure unique like per user per post
    __table_args__ = (db.UniqueConstraint('post_id', 'user_id', name='unique_post_like'),)
    
    def to_dict(self):
        """Convert like to dictionary with user info"""
        data = super().to_dict()
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'profile': self.user.profile.to_dict() if self.user.profile else None
        }
        return data
    
    @classmethod
    def toggle_like(cls, post_id, user_id):
        """Toggle like on a post"""
        existing_like = cls.query.filter_by(post_id=post_id, user_id=user_id).first()
        
        if existing_like:
            # Unlike the post
            db.session.delete(existing_like)
            # Update post like count
            post = Post.query.get(post_id)
            if post:
                post.likes_count = max(0, (post.likes_count or 0) - 1)
                post.save()
            db.session.commit()
            return False, "Post unliked"
        else:
            # Like the post
            like = cls(post_id=post_id, user_id=user_id)
            db.session.add(like)
            # Update post like count
            post = Post.query.get(post_id)
            if post:
                post.likes_count = (post.likes_count or 0) + 1
                post.save()
            db.session.commit()
            return True, "Post liked"

class PostComment(BaseModel):
    """Post comments model"""
    __tablename__ = 'post_comments'
    
    post_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('posts.id'), nullable=False)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    parent_comment_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('post_comments.id'), nullable=True)
    
    # Self-referential relationship for replies
    replies = db.relationship('PostComment', backref=db.backref('parent_comment', remote_side=lambda: PostComment.id), lazy='dynamic')
    
    def to_dict(self):
        """Convert comment to dictionary with author info"""
        data = super().to_dict()
        data['author'] = {
            'id': self.user.id,
            'username': self.user.username,
            'profile': self.user.profile.to_dict() if self.user.profile else None
        }
        data['replies_count'] = self.replies.count()
        data['is_reply'] = self.parent_comment_id is not None
        return data
    
    @classmethod
    def create_comment(cls, post_id, user_id, content, parent_comment_id=None):
        """Create a new comment and update post comment count"""
        comment = cls(
            post_id=post_id,
            user_id=user_id,
            content=content,
            parent_comment_id=parent_comment_id
        )
        
        db.session.add(comment)
        
        # Update post comment count
        post = Post.query.get(post_id)
        if post:
            post.comments_count += 1
            post.save()
        
        db.session.commit()
        return comment
    
    def edit_comment(self, new_content):
        """Edit a comment"""
        self.content = new_content
        self.updated_at = datetime.utcnow()
        self.save()
        return self
    
    def delete_comment(self):
        """Delete a comment and update post comment count"""
        post = Post.query.get(self.post_id)
        if post:
            post.comments_count = max(0, post.comments_count - 1)
            post.save()
        
        db.session.delete(self)
        db.session.commit()
        return True

class PostBookmark(BaseModel):
    """Post bookmarks model"""
    __tablename__ = 'post_bookmarks'
    
    post_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('posts.id'), nullable=False)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    
    # Ensure unique bookmark per user per post
    __table_args__ = (db.UniqueConstraint('post_id', 'user_id', name='unique_post_bookmark'),)
    
    def to_dict(self):
        """Convert bookmark to dictionary"""
        data = super().to_dict()
        data['post'] = self.post.to_dict() if self.post else None
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username
        } if self.user else None
        return data

class PostShare(BaseModel):
    """Post shares model"""
    __tablename__ = 'post_shares'
    
    post_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('posts.id'), nullable=False)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    share_type = db.Column(db.String(20), default='share')
    share_platform = db.Column(db.String(50))
    share_message = db.Column(db.Text)
    share_visibility = db.Column(db.String(20), default='public')
    is_original = db.Column(db.Boolean, default=True)
    original_share_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('post_shares.id'), nullable=True)
    
    # Ensure unique share per user per post per type
    __table_args__ = (db.UniqueConstraint('post_id', 'user_id', 'share_type', name='unique_post_share'),)
    
    def to_dict(self):
        """Convert share to dictionary"""
        data = super().to_dict()
        return data
