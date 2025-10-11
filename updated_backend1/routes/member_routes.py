from flask import Blueprint, request, jsonify
from models import db, Member, User, ProfilePage
from datetime import datetime
import uuid

member_bp = Blueprint('members', __name__)

@member_bp.route('/members', methods=['GET'])
def get_members():
    """Get all members for a specific page"""
    try:
        page_id = request.args.get('page_id')
        if not page_id:
            return jsonify({
                'success': False,
                'error': 'Page ID is required'
            }), 400
        
        members = Member.query.filter_by(page_id=page_id).order_by(Member.created_at.desc()).all()
        
        member_list = []
        for member in members:
            member_data = {
                'member_id': str(member.member_id),
                'user_id': str(member.user_id) if member.user_id else None,
                'name': member.name,
                'email': member.email,
                'phone': member.phone,
                'role': member.role,
                'status': member.status,
                'permissions': member.permissions,
                'bio': member.bio,
                'profile_image_url': member.profile_image_url,
                'join_date': member.join_date.isoformat() if member.join_date else None,
                'last_active': member.last_active.isoformat() if member.last_active else None,
                'invited_by': str(member.invited_by) if member.invited_by else None,
                'invited_at': member.invited_at.isoformat() if member.invited_at else None,
                'accepted_at': member.accepted_at.isoformat() if member.accepted_at else None,
                'is_verified': member.is_verified,
                'created_at': member.created_at.isoformat() if member.created_at else None
            }
            member_list.append(member_data)
        
        return jsonify({
            'success': True,
            'members': member_list
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@member_bp.route('/members', methods=['POST'])
def add_member():
    """Add a new member to a page"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Validate required fields
        required_fields = ['page_id', 'name', 'email', 'role']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({
                    'success': False,
                    'error': f'{field} is required'
                }), 400
        
        # Check if member already exists with this email for this page
        existing_member = Member.query.filter_by(
            page_id=data['page_id'], 
            email=data['email']
        ).first()
        
        if existing_member:
            return jsonify({
                'success': False,
                'error': 'Member with this email already exists for this page'
            }), 400
        
        # Create new member
        new_member = Member(
            page_id=data['page_id'],
            user_id=data.get('user_id'),
            name=data['name'],
            email=data['email'],
            phone=data.get('phone'),
            role=data['role'],
            status=data.get('status', 'pending'),
            permissions=data.get('permissions'),
            bio=data.get('bio'),
            profile_image_url=data.get('profile_image_url'),
            join_date=datetime.strptime(data['join_date'], '%Y-%m-%d').date() if data.get('join_date') else datetime.utcnow().date(),
            invited_by=data.get('invited_by'),
            invited_at=datetime.utcnow() if data.get('invited_by') else None,
            accepted_at=datetime.utcnow() if data.get('status') == 'active' else None,
            is_verified=data.get('is_verified', False)
        )
        
        db.session.add(new_member)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Member added successfully',
            'member_id': str(new_member.member_id)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@member_bp.route('/members/<member_id>', methods=['PUT'])
def update_member(member_id):
    """Update a member"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        member = Member.query.filter_by(member_id=member_id).first()
        if not member:
            return jsonify({
                'success': False,
                'error': 'Member not found'
            }), 404
        
        # Update member fields
        if 'name' in data:
            member.name = data['name']
        if 'email' in data:
            member.email = data['email']
        if 'phone' in data:
            member.phone = data['phone']
        if 'role' in data:
            member.role = data['role']
        if 'status' in data:
            member.status = data['status']
        if 'permissions' in data:
            member.permissions = data['permissions']
        if 'bio' in data:
            member.bio = data['bio']
        if 'profile_image_url' in data:
            member.profile_image_url = data['profile_image_url']
        if 'is_verified' in data:
            member.is_verified = data['is_verified']
        
        # Update timestamps
        if data.get('status') == 'active' and member.status != 'active':
            member.accepted_at = datetime.utcnow()
        
        member.updated_at = datetime.utcnow()
        if 'updated_by' in data:
            member.updated_by = data['updated_by']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Member updated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@member_bp.route('/members/<member_id>', methods=['DELETE'])
def remove_member(member_id):
    """Remove a member from a page"""
    try:
        member = Member.query.filter_by(member_id=member_id).first()
        if not member:
            return jsonify({
                'success': False,
                'error': 'Member not found'
            }), 404
        
        # Soft delete by setting status to inactive
        member.status = 'inactive'
        member.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Member removed successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@member_bp.route('/members/<member_id>/status', methods=['PUT'])
def update_member_status(member_id):
    """Update member status (approve, reject, etc.)"""
    try:
        data = request.get_json()
        if not data or 'status' not in data:
            return jsonify({
                'success': False,
                'error': 'Status is required'
            }), 400
        
        member = Member.query.filter_by(member_id=member_id).first()
        if not member:
            return jsonify({
                'success': False,
                'error': 'Member not found'
            }), 404
        
        old_status = member.status
        member.status = data['status']
        
        # Update timestamps based on status change
        if data['status'] == 'active' and old_status != 'active':
            member.accepted_at = datetime.utcnow()
        
        member.updated_at = datetime.utcnow()
        if 'updated_by' in data:
            member.updated_by = data['updated_by']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Member status updated to {data["status"]}'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


