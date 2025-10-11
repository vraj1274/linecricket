from flask import Blueprint, request, jsonify
from models import db, Match, MatchParticipant, MatchComment, MatchLike, MatchType, MatchStatus
from models.user import User
from services.notification_service import notification_service
from datetime import datetime, date, time
import logging

logger = logging.getLogger(__name__)

match_bp = Blueprint('match_routes', __name__)

@match_bp.route('/matches', methods=['GET'])
def get_matches():
    """Get matches with search and filtering"""
    try:
        # Update match statuses based on current time
        Match.update_match_statuses()
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        query = request.args.get('query')
        match_type = request.args.get('match_type')
        skill_level = request.args.get('skill_level')
        location = request.args.get('location')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        status = request.args.get('status')
        
        # Parse enums
        parsed_match_type = None
        if match_type and match_type != 'all':
            try:
                parsed_match_type = MatchType(match_type)
            except ValueError:
                return jsonify({'error': 'Invalid match type'}), 400
        
        parsed_skill_level = None
        if skill_level:
            try:
                parsed_skill_level = MatchSkillLevel(skill_level)
            except ValueError:
                return jsonify({'error': 'Invalid skill level'}), 400
        
        parsed_status = None
        if status:
            # Map frontend status values to backend enum values
            status_mapping = {
                'upcoming': MatchStatus.UPCOMING,
                'live': MatchStatus.LIVE,
                'completed': MatchStatus.COMPLETED,
                'cancelled': MatchStatus.CANCELLED,
                'postponed': MatchStatus.POSTPONED,
                'full': MatchStatus.FULL
            }
            
            if status in status_mapping:
                parsed_status = status_mapping[status]
            else:
                try:
                    parsed_status = MatchStatus(status)
                except ValueError:
                    return jsonify({'error': 'Invalid status'}), 400
        
        # Parse dates
        parsed_date_from = None
        if date_from:
            try:
                parsed_date_from = datetime.strptime(date_from, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid date_from format. Use YYYY-MM-DD'}), 400
        
        parsed_date_to = None
        if date_to:
            try:
                parsed_date_to = datetime.strptime(date_to, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid date_to format. Use YYYY-MM-DD'}), 400
        
        # Search matches
        pagination = Match.search_matches(
            query=query,
            match_type=parsed_match_type,
            skill_level=parsed_skill_level,
            location=location,
            date_from=parsed_date_from,
            date_to=parsed_date_to,
            status=parsed_status,
            page=page,
            per_page=per_page
        )
        
        matches = [match.to_dict() for match in pagination.items]
        
        return jsonify({
            'matches': matches,
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
        logger.error(f"Error getting matches: {str(e)}")
        return jsonify({'error': str(e)}), 500

@match_bp.route('/matches/trending', methods=['GET'])
def get_trending_matches():
    """Get trending matches"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        pagination = Match.get_trending_matches(page=page, per_page=per_page)
        matches = [match.to_dict() for match in pagination.items]
        
        return jsonify({
            'matches': matches,
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
        logger.error(f"Error getting trending matches: {str(e)}")
        return jsonify({'error': str(e)}), 500

@match_bp.route('/matches', methods=['POST'])
def create_match():
    """Create a new match"""
    try:
        # For testing purposes, use the Firebase user directly
        # TODO: Implement proper Firebase token verification
        current_user_id = 9  # Firebase user ID from database
        data = request.get_json()
        
        if not data or 'title' not in data or 'match_type' not in data or 'location' not in data:
            return jsonify({'error': 'title, match_type, and location are required'}), 400
        
        # Parse match type
        try:
            match_type = MatchType(data['match_type'])
        except ValueError:
            return jsonify({'error': 'Invalid match type'}), 400
        
        # Parse skill level
        skill_level = MatchSkillLevel.ALL_LEVELS
        if 'skill_level' in data:
            try:
                skill_level = MatchSkillLevel(data['skill_level'])
            except ValueError:
                return jsonify({'error': 'Invalid skill level'}), 400
        
        # Parse match date and time
        match_date = datetime.strptime(data['match_date'], '%Y-%m-%d').date()
        match_time = datetime.strptime(data['match_time'], '%H:%M').time()
        
        # Create match
        logger.info(f"Creating match with data: {data}")
        match = Match(
            creator_id=current_user_id,
            title=data['title'],
            description=data.get('description', ''),
            match_type=match_type,
            location=data['location'],
            venue=data.get('venue'),
            match_date=match_date,
            match_time=match_time,
            players_needed=data.get('players_needed', 22),  # Default 11v11
            entry_fee=data.get('entry_fee', 0.0),
            is_public=data.get('is_public', True),
            skill_level=skill_level,
            equipment_provided=data.get('equipment_provided', False),
            rules=data.get('rules', ''),
            estimated_duration=data.get('estimated_duration', 180)  # 3 hours default
        )
        
        logger.info(f"Match object created, attempting to save...")
        match.save()
        logger.info(f"Match saved successfully with ID: {match.id}")
        
        # Send notification to interested users
        # Temporarily disabled for debugging
        # try:
        #     notification_service.create_and_send_notification(
        #         receiver_id=current_user_id,  # Self notification
        #         notification_type='match_create',
        #         title='Match Created',
        #         content=f'You created a new match: {match.title}',
        #         action_url=f'/matches/{match.id}',
        #         related_match_id=match.id
        #     )
        # except Exception as e:
        #     logger.warning(f"Failed to send notification: {e}")
        #     # Continue without notification
        
        return jsonify({
            'message': 'Match created successfully',
            'match': match.to_dict()
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating match: {str(e)}")
        return jsonify({'error': str(e)}), 500

@match_bp.route('/matches/<int:match_id>', methods=['GET'])
def get_match(match_id):
    """Get a specific match"""
    try:
        match = Match.query.get(match_id)
        if not match:
            return jsonify({'error': 'Match not found'}), 404
        
        # Add view
        match.add_view(None)  # No user tracking for now
        
        return jsonify({'match': match.to_dict()}), 200
        
    except Exception as e:
        logger.error(f"Error getting match: {str(e)}")
        return jsonify({'error': str(e)}), 500

@match_bp.route('/matches/<int:match_id>/join', methods=['POST'])
def join_match(match_id):
    """Join a match"""
    try:
        current_user_id = 8  # 8 - using test user ID
        
        match = Match.query.get(match_id)
        if not match:
            return jsonify({'error': 'Match not found'}), 404
        
        if not match.can_join(current_user_id):
            return jsonify({'error': 'Cannot join this match'}), 400
        
        # Join match
        success = match.join_match(current_user_id)
        if not success:
            return jsonify({'error': 'Failed to join match'}), 500
        
        # Send notification to match creator
        if match.creator_id != current_user_id:
            notification_service.create_and_send_notification(
                receiver_id=match.creator_id,
                notification_type='match_join',
                title='New Player Joined',
                content=f'A new player joined your match: {match.title}',
                sender_id=current_user_id,
                action_url=f'/matches/{match.id}',
                related_match_id=match.id
            )
        
        return jsonify({
            'message': 'Successfully joined match',
            'match': match.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error joining match: {str(e)}")
        return jsonify({'error': str(e)}), 500

@match_bp.route('/matches/<int:match_id>/leave', methods=['POST'])
def leave_match(match_id):
    """Leave a match"""
    try:
        current_user_id = 8  # 8 - using test user ID
        
        match = Match.query.get(match_id)
        if not match:
            return jsonify({'error': 'Match not found'}), 404
        
        if not match.is_participant(current_user_id):
            return jsonify({'error': 'You are not a participant in this match'}), 400
        
        # Leave match
        success = match.leave_match(current_user_id)
        if not success:
            return jsonify({'error': 'Failed to leave match'}), 500
        
        return jsonify({
            'message': 'Successfully left match',
            'match': match.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error leaving match: {str(e)}")
        return jsonify({'error': str(e)}), 500

@match_bp.route('/matches/<int:match_id>/start', methods=['POST'])
def start_match(match_id):
    """Start a match (creator only)"""
    try:
        current_user_id = 8  # 8 - using test user ID
        
        match = Match.query.get(match_id)
        if not match:
            return jsonify({'error': 'Match not found'}), 404
        
        if match.creator_id != current_user_id:
            return jsonify({'error': 'Only the match creator can start the match'}), 403
        
        # Start match
        success = match.start_match()
        if not success:
            return jsonify({'error': 'Cannot start this match'}), 400
        
        # Notify all participants
        for participant in match.participants:
            notification_service.create_and_send_notification(
                receiver_id=participant.user_id,
                notification_type='match_join',
                title='Match Started',
                content=f'Your match has started: {match.title}',
                action_url=f'/matches/{match.id}',
                related_match_id=match.id
            )
        
        return jsonify({
            'message': 'Match started successfully',
            'match': match.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error starting match: {str(e)}")
        return jsonify({'error': str(e)}), 500

@match_bp.route('/matches/<int:match_id>/end', methods=['POST'])
def end_match(match_id):
    """End a match (creator only)"""
    try:
        current_user_id = 8  # 8 - using test user ID
        data = request.get_json() or {}
        
        match = Match.query.get(match_id)
        if not match:
            return jsonify({'error': 'Match not found'}), 404
        
        if match.creator_id != current_user_id:
            return jsonify({'error': 'Only the match creator can end the match'}), 403
        
        # End match
        success = match.end_match(
            winner_team=data.get('winner_team'),
            man_of_the_match=data.get('man_of_the_match')
        )
        if not success:
            return jsonify({'error': 'Cannot end this match'}), 400
        
        return jsonify({
            'message': 'Match ended successfully',
            'match': match.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error ending match: {str(e)}")
        return jsonify({'error': str(e)}), 500

@match_bp.route('/matches/<int:match_id>/cancel', methods=['POST'])
def cancel_match(match_id):
    """Cancel a match (creator only)"""
    try:
        current_user_id = 8  # 8 - using test user ID
        data = request.get_json() or {}
        
        match = Match.query.get(match_id)
        if not match:
            return jsonify({'error': 'Match not found'}), 404
        
        if match.creator_id != current_user_id:
            return jsonify({'error': 'Only the match creator can cancel the match'}), 403
        
        # Cancel match
        success = match.cancel_match(reason=data.get('reason'))
        if not success:
            return jsonify({'error': 'Cannot cancel this match'}), 400
        
        # Notify all participants
        for participant in match.participants:
            notification_service.create_and_send_notification(
                receiver_id=participant.user_id,
                notification_type='match_join',
                title='Match Cancelled',
                content=f'Your match has been cancelled: {match.title}',
                action_url=f'/matches/{match.id}',
                related_match_id=match.id
            )
        
        return jsonify({
            'message': 'Match cancelled successfully',
            'match': match.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error cancelling match: {str(e)}")
        return jsonify({'error': str(e)}), 500

@match_bp.route('/matches/<int:match_id>/like', methods=['POST'])
def like_match(match_id):
    """Like/unlike a match"""
    try:
        current_user_id = 8  # 8 - using test user ID
        
        match = Match.query.get(match_id)
        if not match:
            return jsonify({'error': 'Match not found'}), 404
        
        # Check if already liked
        existing_like = MatchLike.query.filter_by(match_id=match_id, user_id=current_user_id).first()
        
        if existing_like:
            # Unlike
            db.session.delete(existing_like)
            message = "Match unliked"
            is_liked = False
        else:
            # Like
            like = MatchLike(match_id=match_id, user_id=current_user_id)
            db.session.add(like)
            message = "Match liked"
            is_liked = True
        
        db.session.commit()
        
        return jsonify({
            'message': message,
            'is_liked': is_liked,
            'likes_count': match.likes.count()
        }), 200
        
    except Exception as e:
        logger.error(f"Error liking match: {str(e)}")
        return jsonify({'error': str(e)}), 500

@match_bp.route('/matches/<int:match_id>/comments', methods=['POST'])
def add_match_comment(match_id):
    """Add a comment to a match"""
    try:
        current_user_id = 8  # 8 - using test user ID
        data = request.get_json()
        
        if not data or 'content' not in data:
            return jsonify({'error': 'content is required'}), 400
        
        match = Match.query.get(match_id)
        if not match:
            return jsonify({'error': 'Match not found'}), 404
        
        # Create comment
        comment = MatchComment(
            match_id=match_id,
            user_id=current_user_id,
            content=data['content'],
            parent_comment_id=data.get('parent_comment_id')
        )
        
        db.session.add(comment)
        db.session.commit()
        
        return jsonify({
            'message': 'Comment added successfully',
            'comment': comment.to_dict()
        }), 201
        
    except Exception as e:
        logger.error(f"Error adding comment: {str(e)}")
        return jsonify({'error': str(e)}), 500

@match_bp.route('/matches/<int:match_id>/comments', methods=['GET'])
def get_match_comments(match_id):
    """Get comments for a match"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        match = Match.query.get(match_id)
        if not match:
            return jsonify({'error': 'Match not found'}), 404
        
        # Get top-level comments
        query = MatchComment.query.filter_by(match_id=match_id, parent_comment_id=None)
        query = query.order_by(MatchComment.created_at.desc())
        
        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        comments = []
        for comment in pagination.items:
            comment_dict = comment.to_dict()
            
            # Get replies for this comment
            replies = MatchComment.query.filter_by(parent_comment_id=comment.id).limit(3).all()
            comment_dict['replies'] = [reply.to_dict() for reply in replies]
            
            comments.append(comment_dict)
        
        return jsonify({
            'comments': comments,
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
        logger.error(f"Error getting comments: {str(e)}")
        return jsonify({'error': str(e)}), 500

@match_bp.route('/matches/types', methods=['GET'])
def get_match_types():
    """Get available match types and skill levels"""
    try:
        match_types = [{'value': t.value, 'label': t.value.upper()} for t in MatchType]
        skill_levels = [{'value': s.value, 'label': s.value.replace('_', ' ').title()} for s in MatchSkillLevel]
        weather_types = [{'value': w.value, 'label': w.value.title()} for w in MatchWeather]
        
        return jsonify({
            'match_types': match_types,
            'skill_levels': skill_levels,
            'weather_types': weather_types
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting match types: {str(e)}")
        return jsonify({'error': str(e)}), 500
