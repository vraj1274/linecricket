from .base import BaseModel, db
from datetime import datetime
from .enums import MatchType, MatchStatus

class Match(BaseModel):
    """Cricket match model"""
    __tablename__ = 'matches'
    
    creator_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    match_type = db.Column(db.String(20), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    venue = db.Column(db.String(200))
    
    # Date and time
    match_date = db.Column(db.Date, nullable=False)
    match_time = db.Column(db.Time, nullable=False)
    
    # Match details
    players_needed = db.Column(db.Integer, nullable=False)
    entry_fee = db.Column(db.Float, default=0.0)
    is_public = db.Column(db.Boolean, default=True)
    status = db.Column(db.Enum(MatchStatus), default=MatchStatus.UPCOMING)
    
    # Live match details
    team1_name = db.Column(db.String(100))
    team2_name = db.Column(db.String(100))
    team1_score = db.Column(db.String(50))
    team2_score = db.Column(db.String(50))
    current_over = db.Column(db.String(20))
    match_summary = db.Column(db.Text)
    stream_url = db.Column(db.String(500))
    
    # Match settings
    skill_level = db.Column(db.String(50))
    equipment_provided = db.Column(db.Boolean)
    rules = db.Column(db.Text)
    
    # Advanced match features
    weather = db.Column(db.String(20), default='unknown')
    temperature = db.Column(db.Float)  # in Celsius
    wind_speed = db.Column(db.Float)   # in km/h
    humidity = db.Column(db.Float)     # percentage
    
    # Match statistics
    total_views = db.Column(db.Integer, default=0)
    total_interested = db.Column(db.Integer, default=0)
    total_joined = db.Column(db.Integer, default=0)
    total_left = db.Column(db.Integer, default=0)
    
    # Match duration and timing
    estimated_duration = db.Column(db.Integer)  # in minutes
    actual_duration = db.Column(db.Integer)     # in minutes
    start_time_actual = db.Column(db.DateTime)
    end_time_actual = db.Column(db.DateTime)
    
    # Match results and scores
    winner_team = db.Column(db.String(100))
    man_of_the_match = db.Column(db.String(100))
    best_bowler = db.Column(db.String(100))
    best_batsman = db.Column(db.String(100))
    
    # Match media and content
    photos = db.Column(db.JSON, default=list)  # List of photo URLs
    videos = db.Column(db.JSON, default=list)  # List of video URLs
    highlights = db.Column(db.JSON, default=list)  # List of highlight URLs
    
    # Match notifications and updates
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)
    update_count = db.Column(db.Integer, default=0)
    
    # Match relationships
    participants = db.relationship('MatchParticipant', backref='match', lazy='dynamic', cascade='all, delete-orphan')
    # comments = db.relationship('MatchComment', backref='match', lazy='dynamic', cascade='all, delete-orphan')  # Table doesn't exist
    # likes = db.relationship('MatchLike', backref='match', lazy='dynamic', cascade='all, delete-orphan')  # Table doesn't exist
    
    def to_dict(self):
        """Convert match to dictionary with related data"""
        data = super().to_dict()
        data['match_type'] = self.match_type if self.match_type else None
        data['status'] = self.status.value if self.status else None
        data['skill_level'] = self.skill_level if self.skill_level else None
        data['weather'] = self.weather if self.weather else None
        
        # Convert time objects to strings for JSON serialization
        if self.match_time:
            data['match_time'] = self.match_time.strftime('%H:%M')
        if self.start_time_actual:
            data['start_time_actual'] = self.start_time_actual.isoformat()
        if self.end_time_actual:
            data['end_time_actual'] = self.end_time_actual.isoformat()
        if self.last_updated:
            data['last_updated'] = self.last_updated.isoformat()
            
        data['participants_count'] = self.participants.count()
        data['spots_available'] = self.players_needed - self.participants.count()
        data['is_full'] = self.participants.count() >= self.players_needed
        data['creator'] = {
            'id': self.creator.id,
            'username': self.creator.username,
            'profile': self.creator.profile.to_dict() if self.creator.profile else None
        }
        data['participants'] = [p.to_dict() for p in self.participants.limit(10).all()]
        # data['comments_count'] = self.comments.count()  # Table doesn't exist
        # data['likes_count'] = self.likes.count()  # Table doesn't exist
        data['comments_count'] = 0
        data['likes_count'] = 0
        return data
    
    def is_participant(self, user_id):
        """Check if user is a participant in this match"""
        return self.participants.filter_by(user_id=user_id).first() is not None
    
    def can_join(self, user_id):
        """Check if user can join this match"""
        if self.status != MatchStatus.UPCOMING:
            return False
        if self.is_participant(user_id):
            return False
        if self.participants.count() >= self.players_needed:
            return False
        return True
    
    def join_match(self, user_id):
        """Add user to match participants"""
        if not self.can_join(user_id):
            return False
        
        participant = MatchParticipant(match_id=self.id, user_id=user_id)
        db.session.add(participant)
        
        # Update match statistics
        self.total_joined += 1
        self.total_interested += 1
        self.update_count += 1
        self.last_updated = datetime.utcnow()
        
        # Update status if full
        if self.participants.count() + 1 >= self.players_needed:
            self.status = MatchStatus.FULL
        
        self.save()
        db.session.commit()
        return True
    
    def leave_match(self, user_id):
        """Remove user from match participants"""
        participant = self.participants.filter_by(user_id=user_id).first()
        if not participant:
            return False
        
        db.session.delete(participant)
        
        # Update match statistics
        self.total_left += 1
        self.update_count += 1
        self.last_updated = datetime.utcnow()
        
        # Update status if not full anymore
        if self.status == MatchStatus.FULL and self.participants.count() - 1 < self.players_needed:
            self.status = MatchStatus.UPCOMING
        
        self.save()
        db.session.commit()
        return True
    
    def get_team_participants(self, team_id):
        """Get participants for a specific team"""
        return MatchTeamParticipant.query.filter_by(
            match_id=self.id, 
            team_id=team_id, 
            is_active=True
        ).all()
    
    def get_match_team_stats(self):
        """Get comprehensive team statistics for all teams"""
        teams = MatchTeam.query.filter_by(match_id=self.id).all()
        return {
            team.team_id: team.get_team_stats() for team in teams
        }
    
    def start_match(self):
        """Start the match"""
        if self.status != MatchStatus.UPCOMING and self.status != MatchStatus.FULL:
            return False
        
        self.status = MatchStatus.LIVE
        self.start_time_actual = datetime.utcnow()
        self.update_count += 1
        self.last_updated = datetime.utcnow()
        self.save()
        return True
    
    def end_match(self, winner_team=None, man_of_the_match=None):
        """End the match"""
        if self.status != MatchStatus.LIVE:
            return False
        
        self.status = MatchStatus.COMPLETED
        self.end_time_actual = datetime.utcnow()
        self.winner_team = winner_team
        self.man_of_the_match = man_of_the_match
        
        # Calculate actual duration
        if self.start_time_actual:
            duration = self.end_time_actual - self.start_time_actual
            self.actual_duration = int(duration.total_seconds() / 60)
        
        self.update_count += 1
        self.last_updated = datetime.utcnow()
        self.save()
        return True
    
    def cancel_match(self, reason=None):
        """Cancel the match"""
        if self.status in [MatchStatus.COMPLETED, MatchStatus.CANCELLED]:
            return False
        
        self.status = MatchStatus.CANCELLED
        self.update_count += 1
        self.last_updated = datetime.utcnow()
        if reason:
            self.match_summary = reason
        self.save()
        return True
    
    def postpone_match(self, new_date, new_time, reason=None):
        """Postpone the match"""
        if self.status not in [MatchStatus.UPCOMING, MatchStatus.FULL]:
            return False
        
        self.status = MatchStatus.POSTPONED
        self.match_date = new_date
        self.match_time = new_time
        self.update_count += 1
        self.last_updated = datetime.utcnow()
        if reason:
            self.match_summary = reason
        self.save()
        return True
    
    def add_view(self, user_id):
        """Add a view to the match"""
        self.total_views += 1
        self.update_count += 1
        self.last_updated = datetime.utcnow()
        self.save()
    
    def add_interest(self, user_id):
        """Add interest to the match"""
        self.total_interested += 1
        self.update_count += 1
        self.last_updated = datetime.utcnow()
        self.save()
    
    def update_weather(self, weather, temperature=None, wind_speed=None, humidity=None):
        """Update weather conditions"""
        self.weather = weather
        if temperature is not None:
            self.temperature = temperature
        if wind_speed is not None:
            self.wind_speed = wind_speed
        if humidity is not None:
            self.humidity = humidity
        self.update_count += 1
        self.last_updated = datetime.utcnow()
        self.save()
    
    def add_media(self, media_type, url):
        """Add media to the match"""
        if media_type == 'photo':
            if not self.photos:
                self.photos = []
            self.photos.append(url)
        elif media_type == 'video':
            if not self.videos:
                self.videos = []
            self.videos.append(url)
        elif media_type == 'highlight':
            if not self.highlights:
                self.highlights = []
            self.highlights.append(url)
        
        self.update_count += 1
        self.last_updated = datetime.utcnow()
        self.save()
    
    @classmethod
    def search_matches(cls, query=None, match_type=None, skill_level=None, location=None, 
                      date_from=None, date_to=None, status=None, page=1, per_page=20):
        """Search matches with filters"""
        matches = cls.query
        
        if query:
            matches = matches.filter(
                (cls.title.ilike(f'%{query}%')) |
                (cls.description.ilike(f'%{query}%')) |
                (cls.location.ilike(f'%{query}%'))
            )
        
        if match_type:
            matches = matches.filter(cls.match_type == match_type)
        
        if skill_level:
            matches = matches.filter(cls.skill_level == skill_level)
        
        if location:
            matches = matches.filter(cls.location.ilike(f'%{location}%'))
        
        if date_from:
            matches = matches.filter(cls.match_date >= date_from)
        
        if date_to:
            matches = matches.filter(cls.match_date <= date_to)
        
        if status:
            matches = matches.filter(cls.status == status)
        
        # Order by match date and time
        matches = matches.order_by(cls.match_date.asc(), cls.match_time.asc())
        
        return matches.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
    
    @classmethod
    def get_trending_matches(cls, page=1, per_page=20):
        """Get trending matches based on views and interest"""
        matches = cls.query.filter(cls.status == MatchStatus.UPCOMING)
        matches = matches.order_by(
            (cls.total_views + cls.total_interested).desc(),
            cls.created_at.desc()
        )
        
        return matches.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
    
    @classmethod
    def update_match_statuses(cls):
        """Update match statuses based on current time"""
        from datetime import datetime, date, time
        
        now = datetime.now()
        current_date = now.date()
        current_time = now.time()
        
        # Update matches that should be completed (past their date/time)
        past_matches = cls.query.filter(
            (cls.match_date < current_date) |
            ((cls.match_date == current_date) & (cls.match_time < current_time))
        ).filter(cls.status == MatchStatus.UPCOMING)
        
        for match in past_matches:
            match.status = MatchStatus.COMPLETED
            match.save()
        
        # Update matches that should be live (current date and time)
        live_matches = cls.query.filter(
            cls.match_date == current_date,
            cls.match_time <= current_time,
            cls.status == MatchStatus.UPCOMING
        )
        
        for match in live_matches:
            match.status = MatchStatus.LIVE
            match.save()
        
        return {
            'updated_to_completed': past_matches.count(),
            'updated_to_live': live_matches.count()
        }
    
    @classmethod
    def get_nearby_matches(cls, latitude, longitude, radius_km=50, page=1, per_page=20):
        """Get matches near a location (requires location data in match)"""
        # This is a simplified version - in production, you'd use PostGIS or similar
        matches = cls.query.filter(cls.status == MatchStatus.UPCOMING)
        matches = matches.order_by(cls.match_date.asc())
        
        return matches.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

class MatchParticipant(BaseModel):
    """Match participants model"""
    __tablename__ = 'match_participants'
    
    match_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('matches.id'), nullable=False)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Ensure unique participation per user per match
    __table_args__ = (db.UniqueConstraint('match_id', 'user_id', name='unique_match_participation'),)
    
    def to_dict(self):
        """Convert participant to dictionary with user info"""
        data = super().to_dict()
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'profile': self.user.profile.to_dict() if self.user.profile else None
        }
        return data

class MatchComment(BaseModel):
    """Match comments model"""
    __tablename__ = 'match_comments'
    
    match_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('matches.id'), nullable=False)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    parent_comment_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('match_comments.id'), nullable=True)
    
    # Comment engagement
    likes_count = db.Column(db.Integer, default=0)
    is_edited = db.Column(db.Boolean, default=False)
    edited_at = db.Column(db.DateTime, nullable=True)
    
    # Self-referential relationship for replies
    replies = db.relationship('MatchComment', backref=db.backref('parent_comment', remote_side=lambda: MatchComment.id), lazy='dynamic')
    
    def to_dict(self):
        """Convert comment to dictionary with user info"""
        data = super().to_dict()
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'profile': self.user.profile.to_dict() if self.user.profile else None
        }
        data['replies_count'] = self.replies.count()
        data['is_reply'] = self.parent_comment_id is not None
        return data

class MatchLike(BaseModel):
    """Match likes model"""
    __tablename__ = 'match_likes'
    
    match_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('matches.id'), nullable=False)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    
    # Ensure unique like per user per match
    __table_args__ = (db.UniqueConstraint('match_id', 'user_id', name='unique_match_like'),)
    
    def to_dict(self):
        """Convert like to dictionary with user info"""
        data = super().to_dict()
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'profile': self.user.profile.to_dict() if self.user.profile else None
        }
        return data

class MatchTeam(BaseModel):
    """Match teams model"""
    __tablename__ = 'match_teams'
    
    team_id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=db.func.uuid_generate_v4())
    match_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('matches.id'), nullable=False)
    team_name = db.Column(db.String(200), nullable=False)
    player_role = db.Column(db.String(50))
    player_position = db.Column(db.Integer)
    max_players = db.Column(db.Integer, default=11)
    current_players = db.Column(db.Integer, default=0)
    available_positions = db.Column(db.JSON, default=list(range(1, 12)))
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'))
    updated_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'))
    
    # Override the id property to use team_id
    @property
    def id(self):
        return self.team_id
    
    def get_available_positions(self):
        """Get list of available positions in this team"""
        occupied = [p.player_position for p in self.participants if p.is_active]
        return [pos for pos in range(1, self.max_players + 1) if pos not in occupied]
    
    def get_team_stats(self):
        """Get team statistics"""
        active_participants = len([p for p in self.participants if p.is_active])
        return {
            'current_players': active_participants,
            'max_players': self.max_players,
            'available_positions': self.get_available_positions(),
            'is_full': active_participants >= self.max_players
        }
    
    def update_team_stats(self):
        """Update team statistics"""
        self.current_players = len([p for p in self.participants if p.is_active])
        self.available_positions = self.get_available_positions()
        self.save()
    
    def to_dict(self):
        """Convert team to dictionary"""
        data = super().to_dict()
        data.update(self.get_team_stats())
        return data

class MatchTeamParticipant(BaseModel):
    """Match team participants model"""
    __tablename__ = 'match_team_participants'
    
    match_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('matches.id'), nullable=False)
    team_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('match_teams.team_id'), nullable=False)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    player_position = db.Column(db.Integer, nullable=False)
    player_role = db.Column(db.String(50))
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    user = db.relationship('User', backref='team_participations')
    match = db.relationship('Match', backref='team_participants')
    team = db.relationship('MatchTeam', backref='participants')
    
    def to_dict(self):
        """Convert team participant to dictionary"""
        data = super().to_dict()
        if self.user:
            data['user'] = {
                'id': str(self.user.id),
                'username': self.user.username,
                'profile_image_url': getattr(self.user, 'profile_image_url', None)
            }
        return data

class MatchUmpire(BaseModel):
    """Match umpires model"""
    __tablename__ = 'match_umpires'
    
    umpire_id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=db.func.uuid_generate_v4())
    match_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('matches.id'), nullable=False)
    umpire_name = db.Column(db.String(200), nullable=False)
    umpire_contact = db.Column(db.String(20))
    experience_level = db.Column(db.String(50))
    umpire_fees = db.Column(db.Float)
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'))
    updated_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'))
    
    # Override the id property to use umpire_id
    @property
    def id(self):
        return self.umpire_id
    
    def to_dict(self):
        """Convert umpire to dictionary"""
        data = super().to_dict()
        return data