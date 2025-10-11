from .base import BaseModel, db
from datetime import datetime
import uuid

class PlayerCareerStats(BaseModel):
    """Player career statistics model"""
    __tablename__ = 'player_career_stats'
    
    player_profile_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('page_profiles.page_id'), nullable=False, unique=True)
    total_matches = db.Column(db.Integer, default=0)
    total_innings = db.Column(db.Integer, default=0)
    total_runs = db.Column(db.Integer, default=0)
    total_wickets = db.Column(db.Integer, default=0)
    total_catches = db.Column(db.Integer, default=0)
    total_stumpings = db.Column(db.Integer, default=0)
    batting_average = db.Column(db.Float, default=0.0)
    batting_strike_rate = db.Column(db.Float, default=0.0)
    highest_score = db.Column(db.Integer, default=0)
    centuries = db.Column(db.Integer, default=0)
    half_centuries = db.Column(db.Integer, default=0)
    fours = db.Column(db.Integer, default=0)
    sixes = db.Column(db.Integer, default=0)
    balls_faced = db.Column(db.Integer, default=0)
    not_outs = db.Column(db.Integer, default=0)
    bowling_average = db.Column(db.Float, default=0.0)
    bowling_economy = db.Column(db.Float, default=0.0)
    bowling_strike_rate = db.Column(db.Float, default=0.0)
    best_bowling_figures = db.Column(db.String(20))
    five_wicket_hauls = db.Column(db.Integer, default=0)
    four_wicket_hauls = db.Column(db.Integer, default=0)
    maidens = db.Column(db.Integer, default=0)
    runs_conceded = db.Column(db.Integer, default=0)
    balls_bowled = db.Column(db.Integer, default=0)
    run_outs = db.Column(db.Integer, default=0)
    catches_behind = db.Column(db.Integer, default=0)
    catches_field = db.Column(db.Integer, default=0)
    test_matches = db.Column(db.Integer, default=0)
    odi_matches = db.Column(db.Integer, default=0)
    t20_matches = db.Column(db.Integer, default=0)
    test_runs = db.Column(db.Integer, default=0)
    odi_runs = db.Column(db.Integer, default=0)
    t20_runs = db.Column(db.Integer, default=0)
    test_wickets = db.Column(db.Integer, default=0)
    odi_wickets = db.Column(db.Integer, default=0)
    t20_wickets = db.Column(db.Integer, default=0)
    recent_runs = db.Column(db.Integer, default=0)
    recent_wickets = db.Column(db.Integer, default=0)
    recent_matches = db.Column(db.Integer, default=0)
    
    def to_dict(self):
        """Convert player career stats to dictionary"""
        data = super().to_dict()
        data['player_profile_id'] = str(self.player_profile_id) if self.player_profile_id else None
        return data

class PlayerMatchStats(BaseModel):
    """Player match statistics model"""
    __tablename__ = 'player_match_stats'
    
    player_profile_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('page_profiles.page_id'), nullable=False)
    match_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('matches.id'), nullable=False)
    runs_scored = db.Column(db.Integer, default=0)
    balls_faced = db.Column(db.Integer, default=0)
    is_not_out = db.Column(db.Boolean, default=False)
    fours = db.Column(db.Integer, default=0)
    sixes = db.Column(db.Integer, default=0)
    overs_bowled = db.Column(db.Float, default=0.0)
    runs_conceded = db.Column(db.Integer, default=0)
    wickets_taken = db.Column(db.Integer, default=0)
    maidens = db.Column(db.Integer, default=0)
    catches = db.Column(db.Integer, default=0)
    stumpings = db.Column(db.Integer, default=0)
    run_outs = db.Column(db.Integer, default=0)
    man_of_the_match = db.Column(db.Boolean, default=False)
    captain = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        """Convert player match stats to dictionary"""
        data = super().to_dict()
        data['player_profile_id'] = str(self.player_profile_id) if self.player_profile_id else None
        data['match_id'] = str(self.match_id) if self.match_id else None
        return data

class PlayerReview(BaseModel):
    """Player review model"""
    __tablename__ = 'player_reviews'
    
    player_profile_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('page_profiles.page_id'), nullable=False)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(200))
    review_text = db.Column(db.Text)
    is_verified = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        """Convert player review to dictionary"""
        data = super().to_dict()
        data['player_profile_id'] = str(self.player_profile_id) if self.player_profile_id else None
        data['user_id'] = str(self.user_id) if self.user_id else None
        return data
