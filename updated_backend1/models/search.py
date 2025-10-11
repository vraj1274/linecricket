from .base import BaseModel, db
from datetime import datetime
import json
from .enums import SearchType

class SearchResult(BaseModel):
    """Search results tracking model"""
    __tablename__ = 'search_results'
    
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=True)
    query = db.Column(db.String(500), nullable=False)
    search_type = db.Column(db.Enum(SearchType), nullable=False)
    results_count = db.Column(db.Integer, default=0)
    filters_applied = db.Column(db.JSON, default=dict)
    search_duration = db.Column(db.Float)  # in milliseconds
    clicked_result_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('posts.id'), nullable=True)
    clicked_result_type = db.Column(db.String(50), nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.String(500), nullable=True)
    
    def to_dict(self):
        data = super().to_dict()
        data['search_type'] = self.search_type.value if self.search_type else None
        return data

class SearchTrend(BaseModel):
    """Search trends and analytics model"""
    __tablename__ = 'search_trends'
    
    query = db.Column(db.String(500), nullable=False, unique=True)
    search_count = db.Column(db.Integer, default=1)
    last_searched = db.Column(db.DateTime, default=datetime.utcnow)
    trend_score = db.Column(db.Float, default=0.0)
    related_queries = db.Column(db.JSON, default=list)
    search_type_distribution = db.Column(db.JSON, default=dict)
    
    def to_dict(self):
        data = super().to_dict()
        return data
    
    @classmethod
    def update_trend(cls, query, search_type):
        """Update search trend for a query"""
        from models.base import db
        trend = db.session.query(cls).filter_by(query=query).first()
        if not trend:
            trend = cls(
                query=query,
                search_type_distribution={search_type.value: 1}
            )
        else:
            trend.search_count += 1
            trend.last_searched = datetime.utcnow()
            
            # Update search type distribution
            if not trend.search_type_distribution:
                trend.search_type_distribution = {}
            trend.search_type_distribution[search_type.value] = trend.search_type_distribution.get(search_type.value, 0) + 1
        
        trend.save()
        return trend
    
    @classmethod
    def get_trending_queries(cls, limit=10, days=7):
        """Get trending search queries"""
        from datetime import timedelta
        from models.base import db
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        trends = db.session.query(cls).filter(
            cls.last_searched >= cutoff_date
        ).order_by(
            cls.search_count.desc(),
            cls.trend_score.desc()
        ).limit(limit).all()
        
        return trends

class SearchSuggestion(BaseModel):
    """Search suggestions and autocomplete model"""
    __tablename__ = 'search_suggestions'
    
    suggestion = db.Column(db.String(200), nullable=False)
    suggestion_type = db.Column(db.Enum(SearchType), nullable=False)
    related_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('posts.id'), nullable=True)
    popularity_score = db.Column(db.Float, default=0.0)
    search_count = db.Column(db.Integer, default=1)
    last_used = db.Column(db.DateTime, default=datetime.utcnow)
    suggestion_metadata = db.Column(db.JSON, default=dict)  # Additional data like location, etc.
    
    def to_dict(self):
        data = super().to_dict()
        data['suggestion_type'] = self.suggestion_type.value if self.suggestion_type else None
        return data
    
    @classmethod
    def get_suggestions(cls, query, suggestion_type=None, limit=10):
        """Get search suggestions based on query"""
        suggestions_query = cls.query.filter(
            cls.suggestion.ilike(f'{query}%')
        )
        
        if suggestion_type:
            suggestions_query = suggestions_query.filter_by(suggestion_type=suggestion_type)
        
        suggestions = suggestions_query.order_by(
            cls.popularity_score.desc(),
            cls.search_count.desc()
        ).limit(limit).all()
        
        return suggestions
    
    @classmethod
    def add_suggestion(cls, suggestion, suggestion_type, related_id=None, metadata=None):
        """Add or update a search suggestion"""
        existing = cls.query.filter_by(
            suggestion=suggestion,
            suggestion_type=suggestion_type,
            related_id=related_id
        ).first()
        
        if existing:
            existing.search_count += 1
            existing.last_used = datetime.utcnow()
            existing.popularity_score = cls._calculate_popularity_score(existing)
            if metadata:
                existing.suggestion_metadata.update(metadata)
            existing.save()
            return existing
        else:
            new_suggestion = cls(
                suggestion=suggestion,
                suggestion_type=suggestion_type,
                related_id=related_id,
                suggestion_metadata=metadata or {},
                popularity_score=1.0
            )
            new_suggestion.save()
            return new_suggestion
    
    @classmethod
    def _calculate_popularity_score(cls, suggestion):
        """Calculate popularity score for a suggestion"""
        # Simple scoring based on search count and recency
        recency_factor = 1.0
        if suggestion.last_used:
            days_old = (datetime.utcnow() - suggestion.last_used).days
            recency_factor = max(0.1, 1.0 - (days_old / 30))  # Decay over 30 days
        
        return suggestion.search_count * recency_factor

class SearchFilter(BaseModel):
    """Search filters and saved searches model"""
    __tablename__ = 'search_filters'
    
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    filter_name = db.Column(db.String(100), nullable=False)
    search_type = db.Column(db.Enum(SearchType), nullable=False)
    filters = db.Column(db.JSON, nullable=False)  # Filter criteria
    is_saved = db.Column(db.Boolean, default=False)
    is_public = db.Column(db.Boolean, default=False)
    usage_count = db.Column(db.Integer, default=0)
    last_used = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        data = super().to_dict()
        data['search_type'] = self.search_type.value if self.search_type else None
        return data
    
    @classmethod
    def get_user_filters(cls, user_id, search_type=None):
        """Get saved filters for a user"""
        query = cls.query.filter_by(user_id=user_id, is_saved=True)
        if search_type:
            query = query.filter_by(search_type=search_type)
        
        return query.order_by(cls.last_used.desc()).all()
    
    @classmethod
    def get_public_filters(cls, search_type=None, limit=10):
        """Get public filters"""
        query = cls.query.filter_by(is_public=True)
        if search_type:
            query = query.filter_by(search_type=search_type)
        
        return query.order_by(cls.usage_count.desc()).limit(limit).all()

class SearchAnalytics(BaseModel):
    """Search analytics and metrics model"""
    __tablename__ = 'search_analytics'
    
    date = db.Column(db.Date, nullable=False, unique=True)
    total_searches = db.Column(db.Integer, default=0)
    unique_users = db.Column(db.Integer, default=0)
    searches_by_type = db.Column(db.JSON, default=dict)
    top_queries = db.Column(db.JSON, default=list)
    avg_search_duration = db.Column(db.Float, default=0.0)
    click_through_rate = db.Column(db.Float, default=0.0)
    no_results_rate = db.Column(db.Float, default=0.0)
    
    def to_dict(self):
        data = super().to_dict()
        return data
    
    @classmethod
    def get_daily_analytics(cls, days=30):
        """Get daily search analytics"""
        from datetime import timedelta
        start_date = datetime.utcnow().date() - timedelta(days=days)
        
        analytics = cls.query.filter(
            cls.date >= start_date
        ).order_by(cls.date.desc()).all()
        
        return analytics
    
    @classmethod
    def update_daily_analytics(cls, date=None):
        """Update daily analytics for a specific date"""
        if not date:
            date = datetime.utcnow().date()
        
        analytics = cls.query.filter_by(date=date).first()
        if not analytics:
            analytics = cls(date=date)
        
        # Calculate metrics for the day
        from datetime import timedelta
        start_datetime = datetime.combine(date, datetime.min.time())
        end_datetime = start_datetime + timedelta(days=1)
        
        # Get search results for the day
        search_results = SearchResult.query.filter(
            SearchResult.created_at >= start_datetime,
            SearchResult.created_at < end_datetime
        ).all()
        
        analytics.total_searches = len(search_results)
        analytics.unique_users = len(set(r.user_id for r in search_results if r.user_id))
        
        # Calculate searches by type
        searches_by_type = {}
        for result in search_results:
            search_type = result.search_type.value
            searches_by_type[search_type] = searches_by_type.get(search_type, 0) + 1
        analytics.searches_by_type = searches_by_type
        
        # Calculate average search duration
        durations = [r.search_duration for r in search_results if r.search_duration]
        analytics.avg_search_duration = sum(durations) / len(durations) if durations else 0.0
        
        # Calculate click-through rate
        clicked_searches = len([r for r in search_results if r.clicked_result_id])
        analytics.click_through_rate = (clicked_searches / analytics.total_searches) if analytics.total_searches > 0 else 0.0
        
        # Calculate no results rate
        no_results_searches = len([r for r in search_results if r.results_count == 0])
        analytics.no_results_rate = (no_results_searches / analytics.total_searches) if analytics.total_searches > 0 else 0.0
        
        # Get top queries for the day
        query_counts = {}
        for result in search_results:
            query = result.query
            query_counts[query] = query_counts.get(query, 0) + 1
        
        analytics.top_queries = sorted(
            query_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )[:10]
        
        analytics.save()
        return analytics
