"""
Advanced Search Service
Handles full-text search, geolocation search, and search analytics
"""

import time
import logging
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy import or_, and_, func, text
from sqlalchemy.orm import joinedload
from models import (
    db, User, UserProfile, Match, Post, 
    SearchResult, SearchTrend, SearchSuggestion, SearchFilter, SearchAnalytics,
    SearchType, MatchType, MatchStatus
)
from datetime import datetime, timedelta
import math

logger = logging.getLogger(__name__)

class SearchService:
    """Advanced search service with full-text search and analytics"""
    
    def __init__(self):
        self.search_weights = {
            'title': 3.0,
            'username': 2.5,
            'full_name': 2.0,
            'content': 1.5,
            'description': 1.0,
            'location': 1.0,
            'venue': 0.8,
            'organization': 0.8
        }
    
    def full_text_search(self, query: str, search_type: SearchType, 
                        filters: Dict[str, Any] = None, 
                        page: int = 1, per_page: int = 20,
                        user_id: Optional[int] = None) -> Dict[str, Any]:
        """Perform full-text search across all content types"""
        start_time = time.time()
        
        try:
            # Track search
            search_result = SearchResult(
                user_id=user_id,
                query=query,
                search_type=search_type,
                filters_applied=filters or {}
            )
            
            results = []
            total_count = 0
            
            if search_type == SearchType.USER or search_type == SearchType.GLOBAL:
                user_results = self._search_users(query, filters, page, per_page)
                results.extend(user_results.get('users', []))
                total_count += user_results.get('total', 0)
            
            if search_type == SearchType.MATCH or search_type == SearchType.GLOBAL:
                match_results = self._search_matches(query, filters, page, per_page)
                results.extend(match_results.get('matches', []))
                total_count += match_results.get('total', 0)
            
            if search_type == SearchType.POST or search_type == SearchType.GLOBAL:
                post_results = self._search_posts(query, filters, page, per_page)
                results.extend(post_results.get('posts', []))
                total_count += post_results.get('total', 0)
            
            # Sort results by relevance score
            results = self._rank_results(results, query)
            
            # Update search result
            search_duration = (time.time() - start_time) * 1000
            search_result.results_count = len(results)
            search_result.search_duration = search_duration
            search_result.save()
            
            # Update search trend
            SearchTrend.update_trend(query, search_type)
            
            return {
                'results': results,
                'total': total_count,
                'query': query,
                'search_type': search_type.value,
                'search_duration': search_duration,
                'filters_applied': filters or {}
            }
            
        except Exception as e:
            logger.error(f"Full text search error: {str(e)}")
            raise e
    
    def _search_users(self, query: str, filters: Dict[str, Any] = None, 
                     page: int = 1, per_page: int = 20) -> Dict[str, Any]:
        """Search users with advanced filtering"""
        user_query = User.query.join(UserProfile)
        
        # Build search conditions
        search_conditions = or_(
            User.username.ilike(f'%{query}%'),
            UserProfile.full_name.ilike(f'%{query}%'),
            UserProfile.location.ilike(f'%{query}%'),
            UserProfile.organization.ilike(f'%{query}%'),
            UserProfile.bio.ilike(f'%{query}%')
        )
        
        user_query = user_query.filter(search_conditions)
        
        # Apply filters
        if filters:
            if 'location' in filters:
                user_query = user_query.filter(UserProfile.location.ilike(f'%{filters["location"]}%'))
            
            if 'skill_level' in filters:
                user_query = user_query.filter(UserProfile.batting_skill >= filters['skill_level'])
            
            if 'is_verified' in filters:
                user_query = user_query.filter(User.is_verified == filters['is_verified'])
            
            if 'organization' in filters:
                user_query = user_query.filter(UserProfile.organization.ilike(f'%{filters["organization"]}%'))
        
        # Paginate
        pagination = user_query.paginate(page=page, per_page=per_page, error_out=False)
        
        users = []
        for user in pagination.items:
            user_dict = {
                'id': user.id,
                'username': user.username,
                'profile': user.profile.to_dict() if user.profile else None,
                'is_verified': user.is_verified,
                'relevance_score': self._calculate_relevance_score(user, query)
            }
            users.append(user_dict)
        
        return {
            'users': users,
            'total': pagination.total,
            'page': pagination.page,
            'pages': pagination.pages
        }
    
    def _search_matches(self, query: str, filters: Dict[str, Any] = None, 
                       page: int = 1, per_page: int = 20) -> Dict[str, Any]:
        """Search matches with advanced filtering"""
        match_query = Match.query
        
        # Build search conditions
        search_conditions = or_(
            Match.title.ilike(f'%{query}%'),
            Match.description.ilike(f'%{query}%'),
            Match.location.ilike(f'%{query}%'),
            Match.venue.ilike(f'%{query}%'),
            Match.rules.ilike(f'%{query}%')
        )
        
        match_query = match_query.filter(search_conditions)
        
        # Apply filters
        if filters:
            if 'match_type' in filters:
                match_query = match_query.filter(Match.match_type == MatchType(filters['match_type']))
            
            if 'skill_level' in filters:
                match_query = match_query.filter(Match.skill_level == MatchSkillLevel(filters['skill_level']))
            
            if 'status' in filters:
                match_query = match_query.filter(Match.status == MatchStatus(filters['status']))
            
            if 'location' in filters:
                match_query = match_query.filter(Match.location.ilike(f'%{filters["location"]}%'))
            
            if 'date_from' in filters:
                match_query = match_query.filter(Match.match_date >= filters['date_from'])
            
            if 'date_to' in filters:
                match_query = match_query.filter(Match.match_date <= filters['date_to'])
            
            if 'entry_fee_max' in filters:
                match_query = match_query.filter(Match.entry_fee <= filters['entry_fee_max'])
            
            if 'equipment_provided' in filters:
                match_query = match_query.filter(Match.equipment_provided == filters['equipment_provided'])
        
        # Paginate
        pagination = match_query.order_by(Match.match_date.asc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        matches = []
        for match in pagination.items:
            match_dict = match.to_dict()
            match_dict['relevance_score'] = self._calculate_relevance_score(match, query)
            matches.append(match_dict)
        
        return {
            'matches': matches,
            'total': pagination.total,
            'page': pagination.page,
            'pages': pagination.pages
        }
    
    def _search_posts(self, query: str, filters: Dict[str, Any] = None, 
                     page: int = 1, per_page: int = 20) -> Dict[str, Any]:
        """Search posts with advanced filtering"""
        post_query = Post.query
        
        # Build search conditions
        search_conditions = or_(
            Post.content.ilike(f'%{query}%'),
            Post.title.ilike(f'%{query}%')
        )
        
        post_query = post_query.filter(search_conditions)
        
        # Apply filters
        if filters:
            if 'post_type' in filters:
                post_query = post_query.filter(Post.post_type == filters['post_type'])
            
            if 'user_id' in filters:
                post_query = post_query.filter(Post.user_id == filters['user_id'])
            
            if 'date_from' in filters:
                post_query = post_query.filter(Post.created_at >= filters['date_from'])
            
            if 'date_to' in filters:
                post_query = post_query.filter(Post.created_at <= filters['date_to'])
        
        # Paginate
        pagination = post_query.order_by(Post.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        posts = []
        for post in pagination.items:
            post_dict = post.to_dict()
            post_dict['relevance_score'] = self._calculate_relevance_score(post, query)
            posts.append(post_dict)
        
        return {
            'posts': posts,
            'total': pagination.total,
            'page': pagination.page,
            'pages': pagination.pages
        }
    
    def _calculate_relevance_score(self, item, query: str) -> float:
        """Calculate relevance score for search results"""
        score = 0.0
        query_lower = query.lower()
        
        if hasattr(item, 'title'):
            if query_lower in item.title.lower():
                score += self.search_weights.get('title', 1.0)
        
        if hasattr(item, 'username'):
            if query_lower in item.username.lower():
                score += self.search_weights.get('username', 1.0)
        
        if hasattr(item, 'full_name') and item.full_name:
            if query_lower in item.full_name.lower():
                score += self.search_weights.get('full_name', 1.0)
        
        if hasattr(item, 'content'):
            if query_lower in item.content.lower():
                score += self.search_weights.get('content', 1.0)
        
        if hasattr(item, 'description') and item.description:
            if query_lower in item.description.lower():
                score += self.search_weights.get('description', 1.0)
        
        if hasattr(item, 'location') and item.location:
            if query_lower in item.location.lower():
                score += self.search_weights.get('location', 1.0)
        
        if hasattr(item, 'venue') and item.venue:
            if query_lower in item.venue.lower():
                score += self.search_weights.get('venue', 1.0)
        
        if hasattr(item, 'organization') and item.organization:
            if query_lower in item.organization.lower():
                score += self.search_weights.get('organization', 1.0)
        
        return score
    
    def _rank_results(self, results: List[Dict], query: str) -> List[Dict]:
        """Rank search results by relevance score"""
        return sorted(results, key=lambda x: x.get('relevance_score', 0), reverse=True)
    
    def geolocation_search(self, latitude: float, longitude: float, 
                          radius_km: float = 50, search_type: SearchType = SearchType.MATCH,
                          filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Search by geolocation (simplified implementation)"""
        try:
            # This is a simplified implementation
            # In production, you'd use PostGIS or similar for accurate geolocation search
            
            if search_type == SearchType.MATCH:
                matches = Match.query.filter(
                    Match.status == MatchStatus.UPCOMING
                ).all()
                
                # Filter by location (simplified)
                nearby_matches = []
                for match in matches:
                    if match.location and any(keyword in match.location.lower() 
                                            for keyword in ['mumbai', 'delhi', 'bangalore', 'chennai']):
                        nearby_matches.append(match.to_dict())
                
                return {
                    'results': nearby_matches,
                    'total': len(nearby_matches),
                    'location': {'latitude': latitude, 'longitude': longitude},
                    'radius_km': radius_km
                }
            
            return {'results': [], 'total': 0}
            
        except Exception as e:
            logger.error(f"Geolocation search error: {str(e)}")
            raise e
    
    def get_search_suggestions(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get search suggestions and autocomplete"""
        try:
            if len(query) < 2:
                return []
            
            suggestions = []
            
            # Get suggestions from database
            db_suggestions = SearchSuggestion.get_suggestions(query, limit=limit)
            
            for suggestion in db_suggestions:
                suggestions.append({
                    'text': suggestion.suggestion,
                    'type': suggestion.suggestion_type.value,
                    'id': suggestion.related_id,
                    'metadata': suggestion.metadata
                })
            
            # Generate dynamic suggestions
            dynamic_suggestions = self._generate_dynamic_suggestions(query, limit)
            suggestions.extend(dynamic_suggestions)
            
            # Remove duplicates and limit
            seen = set()
            unique_suggestions = []
            for suggestion in suggestions:
                key = suggestion['text']
                if key not in seen:
                    seen.add(key)
                    unique_suggestions.append(suggestion)
                    if len(unique_suggestions) >= limit:
                        break
            
            return unique_suggestions
            
        except Exception as e:
            logger.error(f"Get search suggestions error: {str(e)}")
            return []
    
    def _generate_dynamic_suggestions(self, query: str, limit: int) -> List[Dict[str, Any]]:
        """Generate dynamic search suggestions"""
        suggestions = []
        
        # Username suggestions
        users = User.query.filter(
            User.username.ilike(f'{query}%')
        ).limit(3).all()
        
        for user in users:
            suggestions.append({
                'text': user.username,
                'type': 'user',
                'id': user.id,
                'metadata': {'is_verified': user.is_verified}
            })
        
        # Match title suggestions
        matches = Match.query.filter(
            Match.title.ilike(f'{query}%')
        ).limit(3).all()
        
        for match in matches:
            suggestions.append({
                'text': match.title,
                'type': 'match',
                'id': match.id,
                'metadata': {'location': match.location, 'match_type': match.match_type.value}
            })
        
        # Location suggestions
        locations = db.session.query(Match.location).filter(
            Match.location.ilike(f'{query}%')
        ).distinct().limit(3).all()
        
        for location in locations:
            suggestions.append({
                'text': location[0],
                'type': 'location',
                'id': None,
                'metadata': {}
            })
        
        return suggestions[:limit]
    
    def get_trending_searches(self, days: int = 7, limit: int = 10) -> List[Dict[str, Any]]:
        """Get trending search queries"""
        try:
            trends = SearchTrend.get_trending_queries(limit=limit, days=days)
            
            trending = []
            for trend in trends:
                trending.append({
                    'query': trend.query,
                    'search_count': trend.search_count,
                    'trend_score': trend.trend_score,
                    'last_searched': trend.last_searched.isoformat(),
                    'search_type_distribution': trend.search_type_distribution
                })
            
            return trending
            
        except Exception as e:
            logger.error(f"Get trending searches error: {str(e)}")
            return []
    
    def get_search_analytics(self, days: int = 30) -> Dict[str, Any]:
        """Get search analytics and metrics"""
        try:
            analytics = SearchAnalytics.get_daily_analytics(days=days)
            
            total_searches = sum(a.total_searches for a in analytics)
            total_users = sum(a.unique_users for a in analytics)
            avg_duration = sum(a.avg_search_duration for a in analytics) / len(analytics) if analytics else 0
            avg_ctr = sum(a.click_through_rate for a in analytics) / len(analytics) if analytics else 0
            avg_no_results = sum(a.no_results_rate for a in analytics) / len(analytics) if analytics else 0
            
            # Get search type distribution
            type_distribution = {}
            for analytics_day in analytics:
                for search_type, count in analytics_day.searches_by_type.items():
                    type_distribution[search_type] = type_distribution.get(search_type, 0) + count
            
            return {
                'total_searches': total_searches,
                'total_users': total_users,
                'avg_search_duration': avg_duration,
                'avg_click_through_rate': avg_ctr,
                'avg_no_results_rate': avg_no_results,
                'search_type_distribution': type_distribution,
                'daily_analytics': [a.to_dict() for a in analytics]
            }
            
        except Exception as e:
            logger.error(f"Get search analytics error: {str(e)}")
            return {}
    
    def save_search_filter(self, user_id: int, filter_name: str, 
                          search_type: SearchType, filters: Dict[str, Any],
                          is_public: bool = False) -> SearchFilter:
        """Save a search filter for later use"""
        try:
            search_filter = SearchFilter(
                user_id=user_id,
                filter_name=filter_name,
                search_type=search_type,
                filters=filters,
                is_saved=True,
                is_public=is_public
            )
            search_filter.save()
            return search_filter
            
        except Exception as e:
            logger.error(f"Save search filter error: {str(e)}")
            raise e
    
    def get_saved_filters(self, user_id: int, search_type: SearchType = None) -> List[Dict[str, Any]]:
        """Get saved search filters for a user"""
        try:
            filters = SearchFilter.get_user_filters(user_id, search_type)
            return [f.to_dict() for f in filters]
            
        except Exception as e:
            logger.error(f"Get saved filters error: {str(e)}")
            return []
    
    def track_search_click(self, search_result_id: int, clicked_result_id: int, 
                          clicked_result_type: str) -> bool:
        """Track when a user clicks on a search result"""
        try:
            search_result = SearchResult.query.get(search_result_id)
            if search_result:
                search_result.clicked_result_id = clicked_result_id
                search_result.clicked_result_type = clicked_result_type
                search_result.save()
                return True
            return False
            
        except Exception as e:
            logger.error(f"Track search click error: {str(e)}")
            return False

# Create global search service instance
search_service = SearchService()
