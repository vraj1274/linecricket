from flask import Blueprint, request, jsonify
from models import (
    db, User, UserProfile, Post, Match, AdminUser, AdminLog, ContentReport, 
    SystemSettings, AdminAnalytics, AdminRole, AdminPermission
)
from utils.admin_auth import (
    admin_required, permission_required, role_required, super_admin_required,
    log_admin_action, get_admin_user
)
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

admin_bp = Blueprint('admin', __name__)

# Dashboard and Analytics
@admin_bp.route('/admin/dashboard', methods=['GET'])
# @admin_required
# @permission_required(...)
def get_dashboard():
    """Get admin dashboard data"""
    try:
        # Get basic stats
        total_users = User.query.count()
        total_posts = Post.query.count()
        total_matches = Match.query.count()
        total_reports = ContentReport.query.count()
        pending_reports = ContentReport.query.filter_by(status='pending').count()
        
        # Get recent activity
        recent_users = User.query.order_by(User.created_at.desc()).limit(5).all()
        recent_posts = Post.query.order_by(Post.created_at.desc()).limit(5).all()
        recent_matches = Match.query.order_by(Match.created_at.desc()).limit(5).all()
        recent_reports = ContentReport.query.order_by(ContentReport.created_at.desc()).limit(5).all()
        
        # Get daily analytics for last 7 days
        analytics = AdminAnalytics.get_daily_analytics(days=7)
        
        # Get admin activity
        admin_actions = AdminLog.query.order_by(AdminLog.created_at.desc()).limit(10).all()
        
        dashboard_data = {
            'stats': {
                'total_users': total_users,
                'total_posts': total_posts,
                'total_matches': total_matches,
                'total_reports': total_reports,
                'pending_reports': pending_reports
            },
            'recent_activity': {
                'users': [user.to_dict() for user in recent_users],
                'posts': [post.to_dict() for post in recent_posts],
                'matches': [match.to_dict() for match in recent_matches],
                'reports': [report.to_dict() for report in recent_reports]
            },
            'analytics': [analytics_day.to_dict() for analytics_day in analytics],
            'admin_actions': [action.to_dict() for action in admin_actions]
        }
        
        log_admin_action('view_dashboard')
        
        return jsonify(dashboard_data), 200
        
    except Exception as e:
        logger.error(f"Dashboard error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/analytics', methods=['GET'])
# @admin_required
# @permission_required(...)
def get_analytics():
    """Get detailed analytics"""
    try:
        days = request.args.get('days', 30, type=int)
        analytics = AdminAnalytics.get_daily_analytics(days=days)
        
        # Calculate summary metrics
        total_users = User.query.count()
        total_posts = Post.query.count()
        total_matches = Match.query.count()
        total_reports = ContentReport.query.count()
        
        # Get user growth over time
        user_growth = []
        for analytics_day in analytics:
            user_growth.append({
                'date': analytics_day.date.isoformat(),
                'total_users': analytics_day.total_users,
                'new_users': analytics_day.new_users,
                'active_users': analytics_day.active_users
            })
        
        # Get content metrics
        content_metrics = {
            'posts': {
                'total': total_posts,
                'growth': [{'date': a.date.isoformat(), 'count': a.new_posts} for a in analytics]
            },
            'matches': {
                'total': total_matches,
                'growth': [{'date': a.date.isoformat(), 'count': a.new_matches} for a in analytics]
            }
        }
        
        # Get engagement metrics
        engagement_metrics = {
            'post_likes': sum(a.post_likes for a in analytics),
            'post_comments': sum(a.post_comments for a in analytics),
            'match_joins': sum(a.match_joins for a in analytics),
            'user_follows': sum(a.user_follows for a in analytics)
        }
        
        analytics_data = {
            'summary': {
                'total_users': total_users,
                'total_posts': total_posts,
                'total_matches': total_matches,
                'total_reports': total_reports
            },
            'user_growth': user_growth,
            'content_metrics': content_metrics,
            'engagement_metrics': engagement_metrics,
            'daily_analytics': [a.to_dict() for a in analytics]
        }
        
        log_admin_action('view_analytics', details={'days': days})
        
        return jsonify(analytics_data), 200
        
    except Exception as e:
        logger.error(f"Analytics error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# User Management
@admin_bp.route('/admin/users', methods=['GET'])
# @admin_required
# @permission_required(...)
def get_users():
    """Get users with pagination and filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        status = request.args.get('status', 'all')
        role = request.args.get('role', 'all')
        
        query = User.query.join(UserProfile)
        
        # Apply search filter
        if search:
            query = query.filter(
                db.or_(
                    User.username.ilike(f'%{search}%'),
                    UserProfile.full_name.ilike(f'%{search}%'),
                    User.email.ilike(f'%{search}%')
                )
            )
        
        # Apply status filter
        if status == 'active':
            query = query.filter(User.is_active == True)
        elif status == 'inactive':
            query = query.filter(User.is_active == False)
        elif status == 'verified':
            query = query.filter(User.is_verified == True)
        elif status == 'unverified':
            query = query.filter(User.is_verified == False)
        
        # Apply role filter (based on profile type)
        if role != 'all':
            query = query.filter(UserProfile.profile_type == role)
        
        users = query.paginate(page=page, per_page=per_page, error_out=False)
        
        users_data = []
        for user in users.items:
            user_dict = user.to_dict()
            user_dict['profile'] = user.profile.to_dict() if user.profile else None
            users_data.append(user_dict)
        
        log_admin_action('view_users', details={'search': search, 'status': status, 'role': role})
        
        return jsonify({
            'users': users_data,
            'pagination': {
                'page': users.page,
                'pages': users.pages,
                'per_page': users.per_page,
                'total': users.total,
                'has_next': users.has_next,
                'has_prev': users.has_prev
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Get users error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/users/<int:user_id>', methods=['GET'])
# @admin_required
# @permission_required(...)
def get_user(user_id):
    """Get specific user details"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user_dict = user.to_dict()
        user_dict['profile'] = user.profile.to_dict() if user.profile else None
        
        # Get user's posts, matches, etc.
        user_dict['posts_count'] = Post.query.filter_by(user_id=user_id).count()
        user_dict['matches_created'] = Match.query.filter_by(creator_id=user_id).count()
        user_dict['matches_joined'] = Match.query.join(Match.participants).filter_by(user_id=user_id).count()
        
        log_admin_action('view_user', target_type='user', target_id=user_id)
        
        return jsonify({'user': user_dict}), 200
        
    except Exception as e:
        logger.error(f"Get user error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/users/<int:user_id>/ban', methods=['POST'])
# @admin_required
# @permission_required(...)
def ban_user(user_id):
    """Ban a user"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json() or {}
        reason = data.get('reason', 'No reason provided')
        
        user.is_active = False
        user.save()
        
        log_admin_action('ban_user', target_type='user', target_id=user_id, details={'reason': reason})
        
        return jsonify({'message': 'User banned successfully'}), 200
        
    except Exception as e:
        logger.error(f"Ban user error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/users/<int:user_id>/unban', methods=['POST'])
# @admin_required
# @permission_required(...)
def unban_user(user_id):
    """Unban a user"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.is_active = True
        user.save()
        
        log_admin_action('unban_user', target_type='user', target_id=user_id)
        
        return jsonify({'message': 'User unbanned successfully'}), 200
        
    except Exception as e:
        logger.error(f"Unban user error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/users/<int:user_id>/verify', methods=['POST'])
# @admin_required
# @permission_required(...)
def verify_user(user_id):
    """Verify a user"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.is_verified = True
        user.save()
        
        log_admin_action('verify_user', target_type='user', target_id=user_id)
        
        return jsonify({'message': 'User verified successfully'}), 200
        
    except Exception as e:
        logger.error(f"Verify user error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Content Management
@admin_bp.route('/admin/posts', methods=['GET'])
# @admin_required
# @permission_required(...)
def get_posts():
    """Get posts with pagination and filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        status = request.args.get('status', 'all')
        
        query = Post.query
        
        # Apply search filter
        if search:
            query = query.filter(
                db.or_(
                    Post.content.ilike(f'%{search}%'),
                    Post.title.ilike(f'%{search}%')
                )
            )
        
        # Apply status filter
        if status == 'active':
            query = query.filter(Post.is_active == True)
        elif status == 'inactive':
            query = query.filter(Post.is_active == False)
        
        posts = query.order_by(Post.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        posts_data = []
        for post in posts.items:
            post_dict = post.to_dict()
            post_dict['author'] = {
                'id': post.user.id,
                'username': post.user.username,
                'profile': post.user.profile.to_dict() if post.user.profile else None
            }
            posts_data.append(post_dict)
        
        log_admin_action('view_posts', details={'search': search, 'status': status})
        
        return jsonify({
            'posts': posts_data,
            'pagination': {
                'page': posts.page,
                'pages': posts.pages,
                'per_page': posts.per_page,
                'total': posts.total,
                'has_next': posts.has_next,
                'has_prev': posts.has_prev
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Get posts error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/posts/<int:post_id>/delete', methods=['DELETE'])
# @admin_required
# @permission_required(...)
def delete_post(post_id):
    """Delete a post"""
    try:
        post = Post.query.get(post_id)
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        post.delete()
        
        log_admin_action('delete_post', target_type='post', target_id=post_id)
        
        return jsonify({'message': 'Post deleted successfully'}), 200
        
    except Exception as e:
        logger.error(f"Delete post error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/matches', methods=['GET'])
# @admin_required
# @permission_required(...)
def get_matches():
    """Get matches with pagination and filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        status = request.args.get('status', 'all')
        
        query = Match.query
        
        # Apply search filter
        if search:
            query = query.filter(
                db.or_(
                    Match.title.ilike(f'%{search}%'),
                    Match.description.ilike(f'%{search}%'),
                    Match.location.ilike(f'%{search}%')
                )
            )
        
        # Apply status filter
        if status != 'all':
            from models.match import MatchStatus
            try:
                status_enum = MatchStatus(status)
                query = query.filter(Match.status == status_enum)
            except ValueError:
                return jsonify({'error': 'Invalid status'}), 400
        
        matches = query.order_by(Match.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        matches_data = []
        for match in matches.items:
            match_dict = match.to_dict()
            match_dict['creator'] = {
                'id': match.creator.id,
                'username': match.creator.username,
                'profile': match.creator.profile.to_dict() if match.creator.profile else None
            }
            matches_data.append(match_dict)
        
        log_admin_action('view_matches', details={'search': search, 'status': status})
        
        return jsonify({
            'matches': matches_data,
            'pagination': {
                'page': matches.page,
                'pages': matches.pages,
                'per_page': matches.per_page,
                'total': matches.total,
                'has_next': matches.has_next,
                'has_prev': matches.has_prev
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Get matches error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/matches/<int:match_id>/delete', methods=['DELETE'])
# @admin_required
# @permission_required(...)
def delete_match(match_id):
    """Delete a match"""
    try:
        match = Match.query.get(match_id)
        if not match:
            return jsonify({'error': 'Match not found'}), 404
        
        match.delete()
        
        log_admin_action('delete_match', target_type='match', target_id=match_id)
        
        return jsonify({'message': 'Match deleted successfully'}), 200
        
    except Exception as e:
        logger.error(f"Delete match error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Reports and Moderation
@admin_bp.route('/admin/reports', methods=['GET'])
# @admin_required
# @permission_required(...)
def get_reports():
    """Get content reports"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status', 'pending')
        priority = request.args.get('priority', 'all')
        
        query = ContentReport.query
        
        # Apply status filter
        if status != 'all':
            query = query.filter(ContentReport.status == status)
        
        # Apply priority filter
        if priority != 'all':
            query = query.filter(ContentReport.priority == priority)
        
        reports = query.order_by(ContentReport.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        reports_data = []
        for report in reports.items:
            report_dict = report.to_dict()
            reports_data.append(report_dict)
        
        log_admin_action('view_reports', details={'status': status, 'priority': priority})
        
        return jsonify({
            'reports': reports_data,
            'pagination': {
                'page': reports.page,
                'pages': reports.pages,
                'per_page': reports.per_page,
                'total': reports.total,
                'has_next': reports.has_next,
                'has_prev': reports.has_prev
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Get reports error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/reports/<int:report_id>/resolve', methods=['POST'])
# @admin_required
# @permission_required(...)
def resolve_report(report_id):
    """Resolve a content report"""
    try:
        report = ContentReport.query.get(report_id)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        data = request.get_json() or {}
        admin_notes = data.get('admin_notes', '')
        
        report.status = 'resolved'
        report.reviewed_by = get_admin_user().id
        report.reviewed_at = datetime.utcnow()
        report.admin_notes = admin_notes
        report.save()
        
        log_admin_action('resolve_report', target_type='report', target_id=report_id, details={'admin_notes': admin_notes})
        
        return jsonify({'message': 'Report resolved successfully'}), 200
        
    except Exception as e:
        logger.error(f"Resolve report error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/reports/<int:report_id>/dismiss', methods=['POST'])
# @admin_required
# @permission_required(...)
def dismiss_report(report_id):
    """Dismiss a content report"""
    try:
        report = ContentReport.query.get(report_id)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        data = request.get_json() or {}
        admin_notes = data.get('admin_notes', '')
        
        report.status = 'dismissed'
        report.reviewed_by = get_admin_user().id
        report.reviewed_at = datetime.utcnow()
        report.admin_notes = admin_notes
        report.save()
        
        log_admin_action('dismiss_report', target_type='report', target_id=report_id, details={'admin_notes': admin_notes})
        
        return jsonify({'message': 'Report dismissed successfully'}), 200
        
    except Exception as e:
        logger.error(f"Dismiss report error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# System Settings
@admin_bp.route('/admin/settings', methods=['GET'])
# @admin_required
# @permission_required(...)
def get_settings():
    """Get system settings"""
    try:
        category = request.args.get('category', 'all')
        
        query = SystemSettings.query
        if category != 'all':
            query = query.filter(SystemSettings.category == category)
        
        settings = query.all()
        
        settings_data = {}
        for setting in settings:
            settings_data[setting.key] = setting.to_dict()
        
        log_admin_action('view_settings', details={'category': category})
        
        return jsonify({'settings': settings_data}), 200
        
    except Exception as e:
        logger.error(f"Get settings error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/settings', methods=['POST'])
# @admin_required
# @permission_required(...)
def update_settings():
    """Update system settings"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No settings provided'}), 400
        
        updated_settings = {}
        for key, value_data in data.items():
            if isinstance(value_data, dict):
                value = value_data.get('value')
                value_type = value_data.get('value_type', 'string')
                description = value_data.get('description')
                category = value_data.get('category', 'general')
                is_public = value_data.get('is_public', False)
            else:
                value = value_data
                value_type = 'string'
                description = None
                category = 'general'
                is_public = False
            
            setting = SystemSettings.set_setting(
                key=key,
                value=value,
                value_type=value_type,
                description=description,
                category=category,
                is_public=is_public,
                updated_by=get_admin_user().id
            )
            updated_settings[key] = setting.to_dict()
        
        log_admin_action('update_settings', details={'updated_keys': list(data.keys())})
        
        return jsonify({
            'message': 'Settings updated successfully',
            'settings': updated_settings
        }), 200
        
    except Exception as e:
        logger.error(f"Update settings error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Admin Management
@admin_bp.route('/admin/admins', methods=['GET'])
# @admin_required
# @permission_required(...)
def get_admins():
    """Get admin users"""
    try:
        admins = AdminUser.query.filter_by(is_active=True).all()
        
        admins_data = []
        for admin in admins:
            admin_dict = admin.to_dict()
            admins_data.append(admin_dict)
        
        log_admin_action('view_admins')
        
        return jsonify({'admins': admins_data}), 200
        
    except Exception as e:
        logger.error(f"Get admins error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/admins', methods=['POST'])
# @admin_required
# @super_admin_required
def create_admin():
    """Create new admin user"""
    try:
        data = request.get_json()
        if not data or 'user_id' not in data or 'role' not in data:
            return jsonify({'error': 'user_id and role are required'}), 400
        
        user_id = data['user_id']
        role = AdminRole(data['role'])
        permissions = data.get('permissions', [])
        
        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user is already an admin
        existing_admin = AdminUser.get_by_user_id(user_id)
        if existing_admin:
            return jsonify({'error': 'User is already an admin'}), 400
        
        # Create admin user
        admin = AdminUser(
            user_id=user_id,
            role=role,
            permissions=permissions,
            created_by=get_admin_user().id
        )
        admin.save()
        
        log_admin_action('create_admin', target_type='admin', target_id=admin.id, details={'user_id': user_id, 'role': role.value})
        
        return jsonify({
            'message': 'Admin created successfully',
            'admin': admin.to_dict()
        }), 201
        
    except Exception as e:
        logger.error(f"Create admin error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/admins/<int:admin_id>/permissions', methods=['PUT'])
# @admin_required
# @super_admin_required
def update_admin_permissions(admin_id):
    """Update admin permissions"""
    try:
        admin = AdminUser.query.get(admin_id)
        if not admin:
            return jsonify({'error': 'Admin not found'}), 404
        
        data = request.get_json()
        if not data or 'permissions' not in data:
            return jsonify({'error': 'permissions are required'}), 400
        
        admin.permissions = data['permissions']
        admin.save()
        
        log_admin_action('update_admin_permissions', target_type='admin', target_id=admin_id, details={'permissions': data['permissions']})
        
        return jsonify({
            'message': 'Admin permissions updated successfully',
            'admin': admin.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Update admin permissions error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/logs', methods=['GET'])
# @admin_required
# @permission_required(...)
def get_admin_logs():
    """Get admin action logs"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        admin_id = request.args.get('admin_id')
        action = request.args.get('action')
        
        query = AdminLog.query
        
        if admin_id:
            query = query.filter(AdminLog.admin_id == admin_id)
        
        if action:
            query = query.filter(AdminLog.action.ilike(f'%{action}%'))
        
        logs = query.order_by(AdminLog.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        logs_data = []
        for log in logs.items:
            log_dict = log.to_dict()
            logs_data.append(log_dict)
        
        log_admin_action('view_admin_logs', details={'admin_id': admin_id, 'action': action})
        
        return jsonify({
            'logs': logs_data,
            'pagination': {
                'page': logs.page,
                'pages': logs.pages,
                'per_page': logs.per_page,
                'total': logs.total,
                'has_next': logs.has_next,
                'has_prev': logs.has_prev
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Get admin logs error: {str(e)}")
        return jsonify({'error': str(e)}), 500
