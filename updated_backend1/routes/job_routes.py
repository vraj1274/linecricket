from flask import Blueprint, request, jsonify
from models import db, Job, JobApplication, User, ProfilePage
from datetime import datetime
import uuid

job_bp = Blueprint('jobs', __name__)

@job_bp.route('/jobs', methods=['GET'])
def get_jobs():
    """Get all jobs for a specific page"""
    try:
        page_id = request.args.get('page_id')
        if not page_id:
            return jsonify({
                'success': False,
                'error': 'Page ID is required'
            }), 400
        
        jobs = Job.query.filter_by(page_id=page_id, is_active=True).order_by(Job.created_at.desc()).all()
        
        job_list = []
        for job in jobs:
            job_data = {
                'job_id': str(job.job_id),
                'title': job.title,
                'description': job.description,
                'location': job.location,
                'job_type': job.job_type,
                'salary_range': job.salary_range,
                'experience_required': job.experience_required,
                'skills_required': job.skills_required,
                'benefits': job.benefits,
                'application_deadline': job.application_deadline.isoformat() if job.application_deadline else None,
                'contact_email': job.contact_email,
                'contact_phone': job.contact_phone,
                'is_featured': job.is_featured,
                'views_count': job.views_count,
                'applications_count': job.applications_count,
                'created_at': job.created_at.isoformat() if job.created_at else None
            }
            job_list.append(job_data)
        
        return jsonify({
            'success': True,
            'jobs': job_list
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@job_bp.route('/jobs', methods=['POST'])
def create_job():
    """Create a new job posting"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Validate required fields
        required_fields = ['page_id', 'user_id', 'title', 'description', 'location', 'job_type']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({
                    'success': False,
                    'error': f'{field} is required'
                }), 400
        
        # Create new job
        new_job = Job(
            page_id=data['page_id'],
            user_id=data['user_id'],
            title=data['title'],
            description=data['description'],
            location=data['location'],
            job_type=data['job_type'],
            salary_range=data.get('salary_range'),
            experience_required=data.get('experience_required'),
            skills_required=data.get('skills_required'),
            benefits=data.get('benefits'),
            application_deadline=datetime.strptime(data['application_deadline'], '%Y-%m-%d').date() if data.get('application_deadline') else None,
            contact_email=data.get('contact_email'),
            contact_phone=data.get('contact_phone')
        )
        
        db.session.add(new_job)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Job created successfully',
            'job_id': str(new_job.job_id)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@job_bp.route('/jobs/<job_id>', methods=['PUT'])
def update_job(job_id):
    """Update a job posting"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        job = Job.query.filter_by(job_id=job_id).first()
        if not job:
            return jsonify({
                'success': False,
                'error': 'Job not found'
            }), 404
        
        # Update job fields
        if 'title' in data:
            job.title = data['title']
        if 'description' in data:
            job.description = data['description']
        if 'location' in data:
            job.location = data['location']
        if 'job_type' in data:
            job.job_type = data['job_type']
        if 'salary_range' in data:
            job.salary_range = data['salary_range']
        if 'experience_required' in data:
            job.experience_required = data['experience_required']
        if 'skills_required' in data:
            job.skills_required = data['skills_required']
        if 'benefits' in data:
            job.benefits = data['benefits']
        if 'application_deadline' in data:
            job.application_deadline = datetime.strptime(data['application_deadline'], '%Y-%m-%d').date() if data['application_deadline'] else None
        if 'contact_email' in data:
            job.contact_email = data['contact_email']
        if 'contact_phone' in data:
            job.contact_phone = data['contact_phone']
        if 'is_active' in data:
            job.is_active = data['is_active']
        if 'is_featured' in data:
            job.is_featured = data['is_featured']
        
        job.updated_at = datetime.utcnow()
        if 'updated_by' in data:
            job.updated_by = data['updated_by']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Job updated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@job_bp.route('/jobs/<job_id>', methods=['DELETE'])
def delete_job(job_id):
    """Delete a job posting"""
    try:
        job = Job.query.filter_by(job_id=job_id).first()
        if not job:
            return jsonify({
                'success': False,
                'error': 'Job not found'
            }), 404
        
        # Soft delete by setting is_active to False
        job.is_active = False
        job.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Job deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@job_bp.route('/jobs/<job_id>/applications', methods=['GET'])
def get_job_applications(job_id):
    """Get applications for a specific job"""
    try:
        applications = JobApplication.query.filter_by(job_id=job_id).order_by(JobApplication.applied_at.desc()).all()
        
        application_list = []
        for app in applications:
            application_data = {
                'application_id': str(app.application_id),
                'applicant_user_id': str(app.applicant_user_id),
                'cover_letter': app.cover_letter,
                'resume_url': app.resume_url,
                'status': app.status,
                'notes': app.notes,
                'applied_at': app.applied_at.isoformat() if app.applied_at else None,
                'reviewed_at': app.reviewed_at.isoformat() if app.reviewed_at else None,
                'reviewed_by': str(app.reviewed_by) if app.reviewed_by else None
            }
            application_list.append(application_data)
        
        return jsonify({
            'success': True,
            'applications': application_list
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@job_bp.route('/jobs/<job_id>/applications', methods=['POST'])
def apply_for_job(job_id):
    """Apply for a job"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Validate required fields
        if 'applicant_user_id' not in data:
            return jsonify({
                'success': False,
                'error': 'applicant_user_id is required'
            }), 400
        
        # Check if job exists
        job = Job.query.filter_by(job_id=job_id, is_active=True).first()
        if not job:
            return jsonify({
                'success': False,
                'error': 'Job not found or inactive'
            }), 404
        
        # Create new application
        new_application = JobApplication(
            job_id=job_id,
            applicant_user_id=data['applicant_user_id'],
            cover_letter=data.get('cover_letter'),
            resume_url=data.get('resume_url'),
            notes=data.get('notes')
        )
        
        db.session.add(new_application)
        
        # Update job applications count
        job.applications_count += 1
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Application submitted successfully',
            'application_id': str(new_application.application_id)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500