#!/usr/bin/env python3
"""
Script to create jobs and members tables in the PostgreSQL database
"""

import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'linecricket25',
    'user': 'postgres',
    'password': 'root'
}

def create_tables():
    """Create jobs and members tables in the database"""
    
    # SQL for creating the tables
    create_tables_sql = """
-- Jobs table for job postings
CREATE TABLE IF NOT EXISTS jobs (
    job_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES page_profiles(page_id),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(200) NOT NULL,
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship')),
    salary_range VARCHAR(100),
    experience_required VARCHAR(50) CHECK (experience_required IN ('0-1', '1-3', '3-5', '5+')),
    skills_required TEXT,
    benefits TEXT,
    application_deadline DATE,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- Members table for team members
CREATE TABLE IF NOT EXISTS members (
    member_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES page_profiles(page_id),
    user_id UUID REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'moderator', 'member', 'coach', 'player', 'staff')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'banned')),
    permissions JSONB,
    bio TEXT,
    profile_image_url VARCHAR(500),
    join_date DATE,
    last_active TIMESTAMP WITHOUT TIME ZONE,
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMP WITHOUT TIME ZONE,
    accepted_at TIMESTAMP WITHOUT TIME ZONE,
    is_verified BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- Job Applications table
CREATE TABLE IF NOT EXISTS job_applications (
    application_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(job_id),
    applicant_user_id UUID NOT NULL REFERENCES users(id),
    cover_letter TEXT,
    resume_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted')),
    notes TEXT,
    applied_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMP WITHOUT TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for Jobs table
CREATE INDEX IF NOT EXISTS idx_jobs_page_id ON jobs(page_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_is_featured ON jobs(is_featured);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);

-- Indexes for Members table
CREATE INDEX IF NOT EXISTS idx_members_page_id ON members(page_id);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_role ON members(role);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_created_at ON members(created_at);

-- Indexes for Job Applications table
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applicant_user_id ON job_applications(applicant_user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON job_applications(applied_at);
"""

    try:
        # Connect to the database
        print("Connecting to PostgreSQL database...")
        conn = psycopg2.connect(**DB_CONFIG)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Execute the SQL
        print("Creating jobs and members tables...")
        cursor.execute(create_tables_sql)
        
        print("Successfully created jobs and members tables!")
        print("Tables created:")
        print("   - jobs")
        print("   - members") 
        print("   - job_applications")
        print("   - All necessary indexes")
        
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"Error creating tables: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    create_tables()
