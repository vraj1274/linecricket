# Trending functions for new categories
def _get_trending_academies(page=1, per_page=5):
    """Get trending academies"""
    try:
        academies = ProfilePage.query.filter(
            and_(
                ProfilePage.page_type == 'Academy',
                ProfilePage.is_active == True
            )
        ).order_by(desc(ProfilePage.total_students), desc(ProfilePage.created_at)).limit(per_page).all()
        
        results = []
        for academy in academies:
            results.append({
                'id': str(academy.page_id),
                'name': academy.academy_name,
                'initials': academy.academy_name[:2].upper(),
                'followers': f"{academy.total_students or 0} students",
                'type': 'Academy',
                'verified': academy.is_verified,
                'gradient': 'from-orange-500 to-red-600',
                'category': 'academy',
                'description': academy.description or academy.tagline,
                'location': f"{academy.city}, {academy.state}" if academy.city else academy.location,
                'isJoined': False
            })
        return results
    except Exception as e:
        logger.error(f"Get trending academies error: {e}")
        return []

def _get_trending_jobs(page=1, per_page=5):
    """Get trending jobs"""
    try:
        jobs = Job.query.filter(
            Job.is_active == True
        ).order_by(desc(Job.applications_count), desc(Job.created_at)).limit(per_page).all()
        
        results = []
        for job in jobs:
            results.append({
                'id': str(job.job_id),
                'name': job.title,
                'initials': job.title[:2].upper(),
                'followers': f"{job.applications_count or 0} applications",
                'type': 'Job',
                'verified': job.is_featured,
                'gradient': 'from-purple-500 to-indigo-600',
                'category': 'job',
                'description': job.description[:100] + '...' if len(job.description) > 100 else job.description,
                'location': job.location,
                'isApplied': False
            })
        return results
    except Exception as e:
        logger.error(f"Get trending jobs error: {e}")
        return []

def _get_trending_venues(page=1, per_page=5):
    """Get trending venues"""
    try:
        venues = ProfilePage.query.filter(
            and_(
                ProfilePage.page_type == 'Pitch',
                ProfilePage.is_active == True
            )
        ).order_by(desc(ProfilePage.capacity), desc(ProfilePage.created_at)).limit(per_page).all()
        
        results = []
        for venue in venues:
            results.append({
                'id': str(venue.page_id),
                'name': venue.academy_name,
                'initials': venue.academy_name[:2].upper(),
                'followers': f"{venue.capacity or 0} capacity",
                'type': 'Venue',
                'verified': venue.is_verified,
                'gradient': 'from-green-500 to-emerald-600',
                'category': 'venue',
                'description': venue.description or venue.tagline,
                'location': f"{venue.city}, {venue.state}" if venue.city else venue.location,
                'isJoined': False
            })
        return results
    except Exception as e:
        logger.error(f"Get trending venues error: {e}")
        return []


