# Manage Page API Documentation

This document provides comprehensive documentation for the unified Manage Page API that allows you to create and manage all types of profile pages (Academy, Community, Venue) similar to LinkedIn's page management functionality.

## Overview

The Manage Page API provides a unified interface to:
- Create and manage profile pages for Academy, Community, and Venue
- Manage academy-specific features (programs, students)
- Manage profile administrators
- View comprehensive statistics
- Search and filter profiles

## Base URL
```
http://localhost:5000/api
```

## Authentication & Permissions
Currently using test user ID (1) for all operations. In production, implement proper authentication.

### Permission System
The API implements a LinkedIn-style permission system:

1. **Page Owner**: The user who created the page has full access
2. **Page Admins**: Users granted admin access by the owner
3. **Permission Levels**:
   - **Owner**: Full access (create, read, update, delete, manage admins)
   - **Admin**: Limited access (read, update, manage content - cannot delete page or manage admins)

### Access Control Rules
- **Page Updates**: Both owners and admins can update page content
- **Page Deletion**: Only owners can delete pages
- **Admin Management**: Only owners can add/remove admins
- **Content Management**: Both owners and admins can manage academy programs/students
- **Owner as Admin**: Page owners are automatically admins (cannot be added as separate admin)

## API Endpoints

### 1. Unified Profile Page Management

#### Create Profile Page
```http
POST /manage-page
```

**Request Body:**
```json
{
  "page_type": "Academy",  // Required: "Academy", "Community", or "Pitch"
  "academy_name": "Mumbai Cricket Academy",  // Required for Academy
  "community_name": "Mumbai Cricket Club",   // Required for Community
  "venue_name": "Wankhede Stadium",         // Required for Venue
  "tagline": "Excellence in Cricket Training",
  "description": "Premier cricket academy with world-class facilities",
  "bio": "Established in 2010, we have trained over 1000 cricketers",
  "contact_person": "Rajesh Kumar",
  "contact_number": "+91-9876543210",
  "email": "info@mumbaicricketacademy.com",
  "website": "https://mumbaicricketacademy.com",
  "address": "123 Cricket Ground, Bandra West",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "pincode": "400050",
  "latitude": 19.0760,
  "longitude": 72.8777,
  
  // Academy specific fields
  "academy_type": "cricket_academy",
  "level": "all_levels",
  "established_year": 2010,
  "accreditation": "BCCI Accredited",
  
  // Community specific fields
  "community_type": "local_club",
  
  // Venue specific fields
  "venue_type": "cricket_ground",
  "ground_type": "natural",
  "capacity": 1000,
  "ground_length": 150.0,
  "ground_width": 100.0,
  "pitch_count": 2,
  "net_count": 4,
  "floodlights": true,
  "covered_area": false,
  
  // Common fields
  "logo_url": "https://example.com/logo.jpg",
  "banner_image_url": "https://example.com/banner.jpg",
  "gallery_images": [
    "https://example.com/gallery1.jpg",
    "https://example.com/gallery2.jpg"
  ],
  "facilities": ["Indoor nets", "Gym", "Swimming pool", "Cafeteria"],
  "services_offered": ["Personal coaching", "Group training", "Fitness training"],
  "equipment_provided": true,
  "coaching_staff_count": 15,
  "programs_offered": ["Summer camp", "Winter training", "Weekend classes"],
  "age_groups": "5-18 years",
  "batch_timings": [
    {"day": "Monday", "time": "6:00 AM - 8:00 AM"},
    {"day": "Wednesday", "time": "6:00 AM - 8:00 AM"}
  ],
  "fees_structure": {"monthly": 5000, "quarterly": 14000, "yearly": 50000},
  "instagram_handle": "mumbaicricketacademy",
  "facebook_handle": "MumbaiCricketAcademy",
  "twitter_handle": "MumbaiCricket",
  "youtube_handle": "MumbaiCricketAcademy",
  "achievements": ["BCCI Best Academy Award 2020", "100+ players in IPL"],
  "testimonials": [
    {"name": "Rohit Sharma", "text": "Great training facility"},
    {"name": "Virat Kohli", "text": "Excellent coaching staff"}
  ],
  "is_public": true,
  "allow_messages": true,
  "show_contact": true,
  "is_verified": false
}
```

**Response:**
```json
{
  "message": "Academy profile page created successfully",
  "profile_page": {
    "page_id": "123e4567-e89b-12d3-a456-426614174000",
    "academy_name": "Mumbai Cricket Academy",
    "page_type": "Academy",
    "academy_type": "cricket_academy",
    "level": "all_levels",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Get Profile Page
```http
GET /manage-page/{page_id}
```

#### Update Profile Page
```http
PATCH /manage-page/{page_id}
```

#### Delete Profile Page
```http
DELETE /manage-page/{page_id}
```

#### Restore Profile Page
```http
POST /manage-page/{page_id}/restore
```

#### List Profile Pages
```http
GET /manage-pages
```

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `per_page` (integer): Items per page (default: 20)
- `search` (string): Search by name or description
- `page_type` (string): Filter by page type (Academy, Community, Pitch)
- `academy_type` (string): Filter by academy type
- `level` (string): Filter by level
- `city` (string): Filter by city
- `state` (string): Filter by state
- `country` (string): Filter by country

**Response:**
```json
{
  "profile_pages": [
    {
      "page_id": "123e4567-e89b-12d3-a456-426614174000",
      "academy_name": "Mumbai Cricket Academy",
      "page_type": "Academy",
      "academy_type": "cricket_academy",
      "level": "all_levels",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "is_public": true,
      "is_verified": false,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 1,
    "pages": 1,
    "has_next": false,
    "has_prev": false
  }
}
```

### 2. Academy-Specific Management

#### Create Academy Program
```http
POST /manage-page/{page_id}/academy/programs
```

**Request Body:**
```json
{
  "program_name": "Summer Cricket Camp",
  "description": "Intensive 4-week cricket training program",
  "duration_weeks": 4,
  "age_group": "8-16 years",
  "level": "beginner",
  "fees": 5000.0,
  "max_students": 30,
  "is_active": true
}
```

#### Get Academy Programs
```http
GET /manage-page/{page_id}/academy/programs
```

**Query Parameters:**
- `is_active` (boolean): Filter by active status

#### Add Academy Student
```http
POST /manage-page/{page_id}/academy/students
```

**Request Body:**
```json
{
  "student_name": "Rahul Sharma",
  "age": 15,
  "level": "intermediate",
  "enrollment_date": "2024-01-15",
  "is_active": true
}
```

#### Get Academy Students
```http
GET /manage-page/{page_id}/academy/students
```

**Query Parameters:**
- `is_active` (boolean): Filter by active status
- `level` (string): Filter by student level

### 3. Profile Administrators Management

#### Add Profile Administrator
```http
POST /manage-page/{page_id}/admins
```

**Request Body:**
```json
{
  "user_id": 1,
  "admin_name": "Coach Rajesh",
  "specialization": "Batting Coach",
  "experience_years": 10,
  "qualifications": "BCCI Level 2 Coach",
  "profile_image_url": "https://example.com/coach.jpg",
  "bio": "Experienced batting coach with 10+ years of experience",
  "admin_role": "coach",
  "permissions": ["manage_students", "manage_programs", "view_reports"],
  "is_active": true
}
```

#### Get Profile Administrators
```http
GET /manage-page/{page_id}/admins
```

**Response:**
```json
{
  "admins": [
    {
      "id": "owner",
      "page_id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": 1,
      "admin_name": "Profile Owner",
      "specialization": "Owner",
      "experience_years": 0,
      "qualifications": "Profile Owner",
      "profile_image_url": null,
      "bio": "Profile owner and primary administrator",
      "admin_role": "owner",
      "permissions": ["all_permissions"],
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 1,
      "page_id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": 2,
      "admin_name": "Coach Rajesh",
      "specialization": "Batting Coach",
      "experience_years": 10,
      "qualifications": "BCCI Level 2 Coach",
      "profile_image_url": "https://example.com/coach.jpg",
      "bio": "Experienced batting coach with 10+ years of experience",
      "admin_role": "coach",
      "permissions": ["manage_students", "manage_programs", "view_reports"],
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "owner": {
    "id": "owner",
    "page_id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": 1,
    "admin_name": "Profile Owner",
    "specialization": "Owner",
    "experience_years": 0,
    "qualifications": "Profile Owner",
    "profile_image_url": null,
    "bio": "Profile owner and primary administrator",
    "admin_role": "owner",
    "permissions": ["all_permissions"],
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### 4. Community-Specific Management

#### Add Community Member
```http
POST /manage-page/{page_id}/community/members
```

**Request Body:**
```json
{
  "user_id": 2,
  "community_name": "Mumbai Cricket Club Member",
  "tagline": "Active Member",
  "description": "Dedicated cricket enthusiast",
  "bio": "Passionate about cricket and community building",
  "community_type": "local_club",
  "level": "intermediate",
  "location": "Mumbai, Maharashtra",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "contact_person": "Rahul Sharma",
  "contact_number": "+91-9876543213",
  "email": "rahul@example.com",
  "is_public": true,
  "is_private": false,
  "requires_approval": false,
  "allow_messages": true,
  "show_contact": true,
  "max_members": 100,
  "current_members": 1,
  "membership_fee": 1000.0,
  "membership_duration": "yearly",
  "rules": "Be respectful and follow community guidelines",
  "guidelines": "Regular participation in community activities",
  "code_of_conduct": "Fair play and sportsmanship",
  "activities": ["Weekly matches", "Training sessions", "Social events"],
  "regular_meetings": "Every Saturday 4 PM",
  "instagram_handle": "mumbaicricketclub",
  "facebook_handle": "MumbaiCricketClub",
  "twitter_handle": "MumbaiCricketClub",
  "discord_handle": "mumbaicricketclub",
  "whatsapp_group": "Mumbai Cricket Club",
  "total_posts": 0,
  "total_events": 0,
  "achievements": ["Community Champion 2023"],
  "testimonials": [
    {"name": "Community Member", "text": "Great community spirit"}
  ],
  "auto_approve_posts": true,
  "allow_member_posts": true,
  "allow_guest_posts": false,
  "content_moderation": true
}
```

#### Get Community Members
```http
GET /manage-page/{page_id}/community/members
```

**Query Parameters:**
- `is_active` (boolean): Filter by active status
- `role` (string): Filter by member role

### 5. Venue-Specific Management

#### Create Venue Booking
```http
POST /manage-page/{page_id}/venue/bookings
```

**Request Body:**
```json
{
  "booking_date": "2024-02-15",
  "start_time": "09:00",
  "end_time": "12:00",
  "duration_hours": 3.0,
  "total_cost": 3000.0,
  "status": "confirmed",
  "special_requirements": "Need floodlights for evening match",
  "contact_number": "+91-9876543214",
  "venue_name": "Wankhede Stadium",
  "tagline": "Iconic Cricket Venue",
  "description": "Historic cricket stadium with world-class facilities",
  "contact_person": "Stadium Manager",
  "contact_number": "+91-9876543212",
  "email": "info@wankhedestadium.com",
  "website": "https://wankhedestadium.com",
  "address": "D Road, Churchgate, Mumbai",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "pincode": "400020",
  "latitude": 18.9384,
  "longitude": 72.8258,
  "venue_type": "cricket_ground",
  "ground_type": "natural",
  "established_year": 1974,
  "capacity": 33000,
  "ground_length": 150.0,
  "ground_width": 100.0,
  "pitch_count": 2,
  "net_count": 8,
  "floodlights": true,
  "covered_area": true,
  "logo_url": "https://example.com/venue-logo.jpg",
  "banner_image_url": "https://example.com/venue-banner.jpg",
  "gallery_images": [
    "https://example.com/venue-gallery1.jpg",
    "https://example.com/venue-gallery2.jpg"
  ],
  "virtual_tour_url": "https://example.com/virtual-tour",
  "facilities": ["VIP boxes", "Media center", "Parking", "Food courts"],
  "amenities": ["Air conditioning", "WiFi", "Parking", "Food court"],
  "parking_available": true,
  "parking_capacity": 1000,
  "changing_rooms": true,
  "refreshment_facility": true,
  "booking_contact": "Stadium Manager",
  "booking_email": "booking@wankhedestadium.com",
  "advance_booking_days": 30,
  "cancellation_policy": "24 hours notice required",
  "hourly_rate": 5000.0,
  "daily_rate": 50000.0,
  "monthly_rate": 500000.0,
  "equipment_rental": true,
  "equipment_rates": "Bats: 500/day, Balls: 200/day",
  "operating_hours": "6:00 AM - 10:00 PM",
  "is_24_7": false,
  "seasonal_availability": "Year round",
  "instagram_handle": "wankhedestadium",
  "facebook_handle": "WankhedeStadium",
  "twitter_handle": "WankhedeStadium",
  "total_bookings": 0,
  "average_rating": 0.0,
  "total_reviews": 0,
  "reviews": [],
  "is_public": true,
  "allow_messages": true,
  "show_contact": true,
  "is_verified": true,
  "is_available": true
}
```

#### Get Venue Bookings
```http
GET /manage-page/{page_id}/venue/bookings
```

**Query Parameters:**
- `status` (string): Filter by booking status
- `user_id` (integer): Filter by user ID

### 6. Profile Statistics

#### Get Profile Statistics
```http
GET /manage-page/{page_id}/stats
```

**Response:**
```json
{
  "profile_page": {
    "page_id": "123e4567-e89b-12d3-a456-426614174000",
    "academy_name": "Mumbai Cricket Academy",
    "page_type": "Academy",
    "academy_type": "cricket_academy",
    "level": "all_levels",
    "total_students": 150,
    "successful_placements": 25
  },
  "statistics": {
    "total_programs": 5,
    "active_programs": 4,
    "total_students": 150,
    "active_students": 120,
    "students_by_level": {
      "beginner": 50,
      "intermediate": 40,
      "advanced": 30
    },
    "total_admins": 3,
    "active_admins": 3
  }
}
```

## Profile Types and Their Specific Fields

### Academy Profile
- **Required Fields:** `page_type: "Academy"`, `academy_name`
- **Specific Fields:** `academy_type`, `level`, `established_year`, `accreditation`
- **Features:** Programs management, Students management

### Community Profile
- **Required Fields:** `page_type: "Community"`, `community_name`
- **Specific Fields:** `community_type`, `level`
- **Features:** Community management, Member management

### Venue Profile (Pitch)
- **Required Fields:** `page_type: "Pitch"`, `venue_name`
- **Specific Fields:** `venue_type`, `ground_type`, `capacity`, `ground_length`, `ground_width`, `pitch_count`, `net_count`, `floodlights`, `covered_area`
- **Features:** Venue management, Booking management

## Database Tables Used

The Manage Page API stores data in the following database tables:

1. **`profile_pages`** - Main profile page information for all types
2. **`academy_programs`** - Training programs (Academy only)
3. **`academy_students`** - Students enrolled (Academy only)
4. **`page_admins`** - Profile administrators for all types

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `201` - Created successfully
- `400` - Bad request (missing required fields)
- `403` - Forbidden (not the profile owner)
- `404` - Not found
- `409` - Conflict (already exists)
- `500` - Internal server error

## Example Usage

### Python Example
```python
import requests
import json

# Create academy profile
profile_data = {
    "page_type": "Academy",
    "academy_name": "Mumbai Cricket Academy",
    "academy_type": "cricket_academy",
    "level": "all_levels",
    "contact_person": "Rajesh Kumar",
    "contact_number": "+91-9876543210",
    "email": "info@mumbaicricketacademy.com",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India"
}

response = requests.post("http://localhost:5000/api/manage-page", json=profile_data)
if response.status_code == 201:
    page_id = response.json()['profile_page']['page_id']
    print(f"Academy created with ID: {page_id}")
    
    # Add a program
    program_data = {
        "program_name": "Summer Cricket Camp",
        "description": "Intensive 4-week cricket training program",
        "duration_weeks": 4,
        "age_group": "8-16 years",
        "level": "beginner",
        "fees": 5000.0,
        "max_students": 30
    }
    
    response = requests.post(f"http://localhost:5000/api/manage-page/{page_id}/academy/programs", json=program_data)
    if response.status_code == 201:
        print("Program created successfully")
        
        # Add a student
        student_data = {
            "student_name": "Rahul Sharma",
            "age": 15,
            "level": "intermediate",
            "enrollment_date": "2024-01-15"
        }
        
        response = requests.post(f"http://localhost:5000/api/manage-page/{page_id}/academy/students", json=student_data)
        if response.status_code == 201:
            print("Student added successfully")
```

### cURL Examples

#### Create Academy Profile
```bash
curl -X POST http://localhost:5000/api/manage-page \
  -H "Content-Type: application/json" \
  -d '{
    "page_type": "Academy",
    "academy_name": "Mumbai Cricket Academy",
    "academy_type": "cricket_academy",
    "level": "all_levels",
    "contact_person": "Rajesh Kumar",
    "contact_number": "+91-9876543210",
    "email": "info@mumbaicricketacademy.com",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India"
  }'
```

#### Create Community Profile
```bash
curl -X POST http://localhost:5000/api/manage-page \
  -H "Content-Type: application/json" \
  -d '{
    "page_type": "Community",
    "community_name": "Mumbai Cricket Club",
    "community_type": "local_club",
    "level": "all_levels",
    "contact_person": "Amit Patel",
    "contact_number": "+91-9876543211",
    "email": "info@mumbaicricketclub.com",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India"
  }'
```

#### Create Venue Profile
```bash
curl -X POST http://localhost:5000/api/manage-page \
  -H "Content-Type: application/json" \
  -d '{
    "page_type": "Pitch",
    "venue_name": "Wankhede Stadium",
    "venue_type": "cricket_ground",
    "ground_type": "natural",
    "capacity": 33000,
    "ground_length": 150.0,
    "ground_width": 100.0,
    "pitch_count": 2,
    "net_count": 8,
    "floodlights": true,
    "covered_area": true,
    "contact_person": "Stadium Manager",
    "contact_number": "+91-9876543212",
    "email": "info@wankhedestadium.com",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India"
  }'
```

## Testing

Use the provided test script to test all endpoints:

```bash
python test_manage_page_endpoints.py
```

This script will:
1. Create academy, community, and venue profiles
2. Test academy-specific management (programs, students)
3. Test profile management features
4. Test profile listing and filtering
5. Test administrator management
6. Test statistics endpoints

## Frontend Integration

The API is designed to work seamlessly with frontend applications. Key features for frontend integration:

1. **Unified Interface** - Single API for all profile types
2. **Comprehensive Filtering** - Search and filter capabilities
3. **Pagination** - Built-in pagination for large datasets
4. **Statistics** - Rich statistics for dashboard views
5. **Admin Management** - Role-based access control
6. **Real-time Updates** - Support for real-time updates

## Notes

- All timestamps are in UTC
- UUIDs are used for page IDs
- Soft deletes are implemented (setting `deleted_at` timestamp)
- All endpoints include proper error handling and validation
- The API follows RESTful conventions
- JSON is used for all request/response bodies
- The API supports LinkedIn-style page management functionality
