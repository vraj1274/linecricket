-- LineCricket Database Schema
-- Generated from SQLAlchemy models

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ✅ Enum Definitions (Place these at the TOP of the file, before any table)

CREATE TYPE PAGETYPE AS ENUM ('Academy', 'Club', 'Community', 'Pitch');
CREATE TYPE SEARCHTYPE AS ENUM ('User', 'Page', 'Post', 'Match', 'Event');
CREATE TYPE MATCHTYPE AS ENUM ('Friendly', 'Tournament', 'League');
CREATE TYPE MATCHSTATUS AS ENUM ('Upcoming', 'Live', 'Completed', 'Cancelled');
CREATE TYPE ACADEMYTYPE AS ENUM ('Private', 'Government', 'Club');
CREATE TYPE ACADEMYLEVEL AS ENUM ('Beginner', 'Intermediate', 'Advanced', 'Professional');
CREATE TYPE RELATIONSHIPTYPE AS ENUM ('Follow', 'Friend', 'Block', 'Mute');
CREATE TYPE RELATIONSHIPSTATUS AS ENUM ('Pending', 'Accepted', 'Rejected', 'Blocked');
CREATE TYPE NOTIFICATIONTYPE AS ENUM ('Like', 'Comment', 'Follow', 'Message', 'Match', 'System');
CREATE TYPE MATCHFORMAT AS ENUM ('T20', 'ODI', 'Test', 'T10', 'Other');

CREATE TABLE users (
	firebase_uid VARCHAR(255), 
	firebase_email VARCHAR(255), 
	cognito_user_id VARCHAR(255), 
	email VARCHAR(255) NOT NULL, 
	username VARCHAR(50) NOT NULL, 
	is_verified BOOLEAN NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	auth_provider VARCHAR(50) NOT NULL, 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE conversations (
    user1_id UUID NOT NULL REFERENCES users(id),
    user2_id UUID NOT NULL REFERENCES users(id),
    last_message_at TIMESTAMP WITHOUT TIME ZONE,
    last_message_content TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT unique_conversation UNIQUE (user1_id, user2_id)
);

CREATE TABLE conversation_participants (
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(20),
    joined_at TIMESTAMP WITHOUT TIME ZONE,
    is_active BOOLEAN,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT unique_conversation_participation UNIQUE (conversation_id, user_id)
);

CREATE TABLE page_profiles (
	page_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
	user_id UUID NOT NULL REFERENCES users(id), 
	firebase_uid VARCHAR(255), 
	cognito_user_id VARCHAR(255), 
	academy_name VARCHAR(200) NOT NULL, 
	tagline VARCHAR(300), 
	description TEXT, 
	bio TEXT, 
	contact_person VARCHAR(100), 
	contact_number VARCHAR(20), 
	email VARCHAR(255), 
	website VARCHAR(500), 
	address TEXT, 
	city VARCHAR(100), 
	state VARCHAR(100), 
	country VARCHAR(100), 
	pincode VARCHAR(20), 
	latitude DOUBLE PRECISION,
	longitude DOUBLE PRECISION,
	academy_type VARCHAR(50),
	level VARCHAR(50),
	established_year INTEGER,
	accreditation VARCHAR(200),
	coaching_staff_count INTEGER DEFAULT 0,
	total_students INTEGER DEFAULT 0,
	successful_placements INTEGER DEFAULT 0,
	equipment_provided BOOLEAN DEFAULT false,
	programs_offered TEXT,
	age_groups VARCHAR(100),
	batch_timings TEXT,
	fees_structure TEXT,
	logo_url VARCHAR(500), 
	banner_image_url VARCHAR(500), 
	gallery_images JSON DEFAULT '[]'::json, 
	facilities JSON DEFAULT '[]'::json, 
	services_offered JSON DEFAULT '[]'::json, 
	instagram_handle VARCHAR(100), 
	facebook_handle VARCHAR(100), 
	twitter_handle VARCHAR(100), 
	youtube_handle VARCHAR(100), 
	achievements JSON DEFAULT '[]'::json, 
	testimonials JSON DEFAULT '[]'::json, 
	is_public BOOLEAN DEFAULT true, 
	allow_messages BOOLEAN DEFAULT true, 
	show_contact BOOLEAN DEFAULT true, 
	is_verified BOOLEAN DEFAULT false, 
	page_type PAGETYPE NOT NULL,
	is_active BOOLEAN DEFAULT true,
	created_by UUID REFERENCES users(id),
	updated_by UUID REFERENCES users(id),
	deleted_at TIMESTAMP WITHOUT TIME ZONE,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

-- Academy-specific details table
CREATE TABLE academy_details (
	page_id UUID PRIMARY KEY REFERENCES page_profiles(page_id) ON DELETE CASCADE,
	academy_type ACADEMYTYPE NOT NULL,
	level ACADEMYLEVEL NOT NULL,
	established_year INTEGER,
	accreditation VARCHAR(200),
	equipment_provided BOOLEAN DEFAULT false,
	coaching_staff_count INTEGER DEFAULT 0,
	programs_offered TEXT,
	age_groups VARCHAR(100),
	batch_timings TEXT,
	fees_structure TEXT,
	total_students INTEGER DEFAULT 0,
	successful_placements INTEGER DEFAULT 0,
	is_active BOOLEAN DEFAULT true,
	created_by UUID REFERENCES users(id),
	updated_by UUID REFERENCES users(id),
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

-- Venue/Pitch-specific details table
CREATE TABLE venue_details (
	page_id UUID PRIMARY KEY REFERENCES page_profiles(page_id) ON DELETE CASCADE,
	venue_type VARCHAR(50) NOT NULL CHECK (venue_type IN ('cricket_ground', 'indoor_pitch', 'net_practice', 'multi_sport', 'training_facility')),
	pitch_type VARCHAR(50) NOT NULL CHECK (pitch_type IN ('turf', 'mat', 'concrete', 'synthetic', 'natural')),
	capacity INTEGER,
	lighting_available BOOLEAN DEFAULT false,
	parking_available BOOLEAN DEFAULT false,
	changing_rooms BOOLEAN DEFAULT false,
	equipment_rental BOOLEAN DEFAULT false,
	booking_rates TEXT, -- JSON string of hourly/daily rates
	amenities TEXT, -- JSON string of available amenities
	operating_hours TEXT, -- JSON string of operating hours
	booking_advance_days INTEGER DEFAULT 7,
	minimum_booking_hours DOUBLE PRECISION DEFAULT 1.0,
	maximum_booking_hours DOUBLE PRECISION DEFAULT 8.0,
	is_active BOOLEAN DEFAULT true,
	created_by UUID REFERENCES users(id),
	updated_by UUID REFERENCES users(id),
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

-- Community-specific details table
CREATE TABLE community_details (
	page_id UUID PRIMARY KEY REFERENCES page_profiles(page_id) ON DELETE CASCADE,
	community_type VARCHAR(50) NOT NULL CHECK (community_type IN ('local_club', 'district_association', 'state_association', 'national_body', 'fan_club', 'players_association')),
	member_count INTEGER DEFAULT 0,
	community_rules TEXT,
	meeting_schedule TEXT, -- JSON string of meeting times
	membership_fee DOUBLE PRECISION DEFAULT 0,
	membership_duration VARCHAR(50),
	community_events_count INTEGER DEFAULT 0,
	active_members INTEGER DEFAULT 0,
	community_guidelines TEXT,
	is_active BOOLEAN DEFAULT true,
	created_by UUID REFERENCES users(id),
	updated_by UUID REFERENCES users(id),
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE matches (
	creator_id UUID NOT NULL REFERENCES users(id), 
	match_name VARCHAR(200) NOT NULL, 
	description TEXT, 
	match_type MATCHTYPE NOT NULL, 
	match_format MATCHFORMAT NOT NULL,
	location VARCHAR(200) NOT NULL, 
	venue VARCHAR(200), 
	match_date DATE NOT NULL, 
	match_time TIME WITHOUT TIME ZONE NOT NULL, 
	players_needed INTEGER NOT NULL, 
	entry_fee DOUBLE PRECISION, 
	is_public BOOLEAN, 
	status MATCHSTATUS, 
	match_summary TEXT, 
	stream_url VARCHAR(500), 
	skill_level VARCHAR(50), 
	minimum_age INTEGER,
	maximum_age INTEGER,
	equipment_provided BOOLEAN, 
	entry_fee DOUBLE PRECISION,
	price_money_amount DOUBLE PRECISION,
	rules TEXT, 
	weather VARCHAR(20) DEFAULT 'unknown'::character varying, 
	temperature DOUBLE PRECISION, 
	wind_speed DOUBLE PRECISION, 
	humidity DOUBLE PRECISION, 
	total_views INTEGER DEFAULT 0, 
	total_interested INTEGER DEFAULT 0, 
	total_joined INTEGER DEFAULT 0, 
	total_left INTEGER DEFAULT 0, 
	estimated_duration INTEGER, 
	actual_duration INTEGER, 
	start_time_actual TIMESTAMP WITHOUT TIME ZONE, 
	end_time_actual TIMESTAMP WITHOUT TIME ZONE, 
	winner_team VARCHAR(100), 
	man_of_the_match VARCHAR(100), 
	best_bowler VARCHAR(100), 
	best_batsman VARCHAR(100), 
	photos JSON DEFAULT '[]'::json, 
	videos JSON DEFAULT '[]'::json, 
	highlights JSON DEFAULT '[]'::json, 
	last_updated TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP, 
	update_count INTEGER DEFAULT 0,
	is_active BOOLEAN DEFAULT true,
	created_by UUID REFERENCES users(id),
	updated_by UUID REFERENCES users(id),
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

-- Match Teams Table
CREATE TABLE match_teams (
	team_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
	team_name VARCHAR(200) NOT NULL,
	player_role VARCHAR(50),
	player_position INTEGER,
	max_players INTEGER DEFAULT 11,
	current_players INTEGER DEFAULT 0,
	available_positions JSON DEFAULT '[]'::json,
	is_active BOOLEAN DEFAULT true,
	created_by UUID REFERENCES users(id),
	updated_by UUID REFERENCES users(id),
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

-- Match Team Participants Table
CREATE TABLE match_team_participants (
	match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
	team_id UUID NOT NULL REFERENCES match_teams(team_id) ON DELETE CASCADE,
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	player_position INTEGER NOT NULL,
	player_role VARCHAR(50),
	joined_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	is_active BOOLEAN DEFAULT true,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	PRIMARY KEY (match_id, team_id, user_id)
);

-- Match Participants Table
CREATE TABLE match_participants (
	match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	joined_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	CONSTRAINT unique_match_participation UNIQUE (match_id, user_id)
);

-- Match Umpires Table
CREATE TABLE match_umpires (
	umpire_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
	umpire_name VARCHAR(200) NOT NULL,
	umpire_contact VARCHAR(20),
	experience_level VARCHAR(50),
	umpire_fees DOUBLE PRECISION,
	is_active BOOLEAN DEFAULT true,
	created_by UUID REFERENCES users(id),
	updated_by UUID REFERENCES users(id),
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE posts (
	user_id UUID NOT NULL REFERENCES users(id), 
	content TEXT NOT NULL, 
	image_url JSONB, 
	video_url VARCHAR(500), 
	location VARCHAR(100), 
	likes_count INTEGER, 
	comments_count INTEGER, 
	shares_count INTEGER, 
	bookmarks_count INTEGER, 
	views_count INTEGER, 
	post_type VARCHAR(50) NOT NULL CHECK (post_type IN ('general', 'community', 'academy', 'venue', 'match', 'event', 'announcement')), 
	visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public','community', 'academy', 'venue')), 
	is_pinned BOOLEAN DEFAULT false, 
	engagement_score DOUBLE PRECISION, 
	trending_score DOUBLE PRECISION, 
	hashtags VARCHAR(500), 
	mentions VARCHAR(500), 
	page_id UUID REFERENCES page_profiles(page_id), 
	community_profile_id UUID REFERENCES page_profiles(page_id),
	academy_profile_id UUID REFERENCES page_profiles(page_id),
	venue_profile_id UUID REFERENCES page_profiles(page_id),
	title VARCHAR(200), 
	is_approved BOOLEAN DEFAULT true, 
	approval_status VARCHAR(20) DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')), 
	moderator_notes TEXT, 
	event_date DATE, 
	event_time TIME WITHOUT TIME ZONE, 
	event_location VARCHAR(200), 
	max_participants INTEGER, 
	registration_fee DOUBLE PRECISION, 
	registration_deadline DATE, 
	post_category VARCHAR(50), 
	tags VARCHAR(500), 
	featured BOOLEAN DEFAULT false, 
	priority INTEGER DEFAULT 0, 
	schedule_time TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	content_tsv TSVECTOR, 
	search_vector TSVECTOR,
	is_active BOOLEAN DEFAULT true,
	created_by UUID REFERENCES users(id),
	updated_by UUID REFERENCES users(id),
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	CONSTRAINT posts_page_type_consistency CHECK (
		(post_type = 'community' AND community_profile_id IS NOT NULL) OR
		(post_type = 'academy' AND academy_profile_id IS NOT NULL) OR
		(post_type = 'venue' AND venue_profile_id IS NOT NULL) OR
		(post_type IN ('general', 'match', 'event', 'announcement'))
	)
);

CREATE TABLE search_results (
	user_id UUID REFERENCES users(id), 
	query VARCHAR(500) NOT NULL, 
	search_type SEARCHTYPE NOT NULL, 
	results_count INTEGER, 
	filters_applied JSON, 
	search_duration DOUBLE PRECISION, 
	clicked_result_id UUID REFERENCES posts(id),
	clicked_result_type VARCHAR(50), 
	ip_address VARCHAR(45), 
	user_agent VARCHAR(500), 
	is_active BOOLEAN DEFAULT true,
	created_by UUID REFERENCES users(id),
	updated_by UUID REFERENCES users(id),
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE search_trends (
	query VARCHAR(500) NOT NULL, 
	search_count INTEGER, 
	last_searched TIMESTAMP WITHOUT TIME ZONE, 
	trend_score DOUBLE PRECISION, 
	related_queries JSON, 
	search_type_distribution JSON, 
	is_active BOOLEAN DEFAULT true,
	created_by UUID REFERENCES users(id),
	updated_by UUID REFERENCES users(id),
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	CONSTRAINT search_trends_query_key UNIQUE (query)
);

CREATE TABLE search_suggestions (
	suggestion VARCHAR(200) NOT NULL, 
	suggestion_type SEARCHTYPE NOT NULL, 
	related_id UUID REFERENCES posts(id), 
	popularity_score DOUBLE PRECISION, 
	search_count INTEGER, 
	last_used TIMESTAMP WITHOUT TIME ZONE, 
	suggestion_metadata JSON, 
	is_active BOOLEAN DEFAULT true,
	created_by UUID REFERENCES users(id),
	updated_by UUID REFERENCES users(id),
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE search_filters (
	user_id UUID NOT NULL REFERENCES users(id), 
	filter_name VARCHAR(100) NOT NULL, 
	search_type SEARCHTYPE NOT NULL, 
	filters JSON NOT NULL, 
	is_saved BOOLEAN, 
	is_public BOOLEAN, 
	usage_count INTEGER, 
	last_used TIMESTAMP WITHOUT TIME ZONE, 
	is_active BOOLEAN DEFAULT true,
	created_by UUID REFERENCES users(id),
	updated_by UUID REFERENCES users(id),
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE search_analytics (
	date DATE NOT NULL, 
	total_searches INTEGER, 
	unique_users INTEGER, 
	searches_by_type JSON, 
	top_queries JSON, 
	avg_search_duration DOUBLE PRECISION, 
	click_through_rate DOUBLE PRECISION, 
	no_results_rate DOUBLE PRECISION, 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	CONSTRAINT search_analytics_date_key UNIQUE (date)
);

CREATE TABLE notification_preferences (
	user_id UUID NOT NULL REFERENCES users(id), 
	push_enabled BOOLEAN, 
	push_likes BOOLEAN, 
	push_comments BOOLEAN, 
	push_follows BOOLEAN, 
	push_messages BOOLEAN, 
	push_matches BOOLEAN, 
	push_achievements BOOLEAN, 
	push_mentions BOOLEAN, 
	push_system BOOLEAN, 
	in_app_enabled BOOLEAN, 
	in_app_likes BOOLEAN, 
	in_app_comments BOOLEAN, 
	in_app_follows BOOLEAN, 
	in_app_messages BOOLEAN, 
	in_app_matches BOOLEAN, 
	in_app_achievements BOOLEAN, 
	in_app_mentions BOOLEAN, 
	in_app_system BOOLEAN, 
	email_enabled BOOLEAN, 
	email_likes BOOLEAN, 
	email_comments BOOLEAN, 
	email_follows BOOLEAN, 
	email_messages BOOLEAN, 
	email_matches BOOLEAN, 
	email_achievements BOOLEAN, 
	email_mentions BOOLEAN, 
	email_system BOOLEAN, 
	quiet_hours_enabled BOOLEAN, 
	quiet_hours_start TIME WITHOUT TIME ZONE, 
	quiet_hours_end TIME WITHOUT TIME ZONE, 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	CONSTRAINT notification_preferences_user_id_key UNIQUE (user_id)
);

CREATE TABLE player_career_stats (
	player_profile_id UUID NOT NULL REFERENCES page_profiles (page_id),
	total_matches INTEGER, 
	total_innings INTEGER, 
	total_runs INTEGER, 
	total_wickets INTEGER, 
	total_catches INTEGER, 
	total_stumpings INTEGER, 
	batting_average DOUBLE PRECISION, 
	batting_strike_rate DOUBLE PRECISION, 
	highest_score INTEGER, 
	centuries INTEGER, 
	half_centuries INTEGER, 
	fours INTEGER, 
	sixes INTEGER, 
	balls_faced INTEGER, 
	not_outs INTEGER, 
	bowling_average DOUBLE PRECISION, 
	bowling_economy DOUBLE PRECISION, 
	bowling_strike_rate DOUBLE PRECISION, 
	best_bowling_figures VARCHAR(20), 
	five_wicket_hauls INTEGER, 
	four_wicket_hauls INTEGER, 
	maidens INTEGER, 
	runs_conceded INTEGER, 
	balls_bowled INTEGER, 
	run_outs INTEGER, 
	catches_behind INTEGER, 
	catches_field INTEGER, 
	test_matches INTEGER, 
	odi_matches INTEGER, 
	t20_matches INTEGER, 
	test_runs INTEGER, 
	odi_runs INTEGER, 
	t20_runs INTEGER, 
	test_wickets INTEGER, 
	odi_wickets INTEGER, 
	t20_wickets INTEGER, 
	recent_runs INTEGER, 
	recent_wickets INTEGER, 
	recent_matches INTEGER, 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	CONSTRAINT player_career_stats_player_profile_id_key UNIQUE (player_profile_id)
);

CREATE TABLE player_match_stats (
	player_profile_id UUID NOT NULL REFERENCES page_profiles(page_id), 
	match_id UUID NOT NULL REFERENCES matches(id), 
	runs_scored INTEGER, 
	balls_faced INTEGER, 
	is_not_out BOOLEAN, 
	fours INTEGER, 
	sixes INTEGER, 
	overs_bowled DOUBLE PRECISION, 
	runs_conceded INTEGER, 
	wickets_taken INTEGER, 
	maidens INTEGER, 
	catches INTEGER, 
	stumpings INTEGER, 
	run_outs INTEGER, 
	man_of_the_match BOOLEAN, 
	captain BOOLEAN, 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE page_admins (
	page_id UUID NOT NULL REFERENCES page_profiles(page_id), 
	user_id UUID NOT NULL REFERENCES users(id), 
	admin_name VARCHAR(100) NOT NULL, 
	specialization VARCHAR(100), 
	experience_years INTEGER, 
	qualifications TEXT, 
	profile_image_url JSONB, 
	bio TEXT, 
	admin_role VARCHAR(50) NOT NULL CHECK (admin_role IN ('academy_admin', 'community_admin', 'venue_admin', 'super_admin')),
	permissions TEXT, 
	is_active BOOLEAN DEFAULT true,
	page_type PAGETYPE NOT NULL,
	assigned_date DATE DEFAULT CURRENT_DATE, 
	is_super_admin BOOLEAN DEFAULT false,
	community_profile_id UUID REFERENCES page_profiles(page_id), 
	academy_profile_id UUID REFERENCES page_profiles(page_id), 
	venue_profile_id UUID REFERENCES page_profiles(page_id), 
	parent_admin_id UUID REFERENCES page_admins(id), 
	admin_level INTEGER DEFAULT 1 CHECK (admin_level >= 1 AND admin_level <= 5),
	can_manage_admins BOOLEAN DEFAULT false,
	can_manage_content BOOLEAN DEFAULT true,
	can_manage_members BOOLEAN DEFAULT true,
	can_manage_events BOOLEAN DEFAULT true,
	can_manage_bookings BOOLEAN DEFAULT false,
	admin_notes TEXT, 
	last_active TIMESTAMP WITHOUT TIME ZONE, 
	invitation_sent_at TIMESTAMP WITHOUT TIME ZONE, 
	invitation_accepted_at TIMESTAMP WITHOUT TIME ZONE, 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	CONSTRAINT unique_page_admin UNIQUE (page_id, user_id),
	CONSTRAINT admin_role_page_type_match CHECK (
		(admin_role = 'academy_admin' AND page_type = 'Academy') OR
		(admin_role = 'community_admin' AND page_type = 'Community') OR
		(admin_role = 'venue_admin' AND page_type = 'Pitch') OR
		(admin_role = 'super_admin')
	),
	CONSTRAINT admin_profile_consistency CHECK (
		(admin_role = 'community_admin' AND community_profile_id IS NOT NULL) OR
		(admin_role = 'academy_admin' AND academy_profile_id IS NOT NULL) OR
		(admin_role = 'venue_admin' AND venue_profile_id IS NOT NULL) OR
		(admin_role = 'super_admin')
	)
);

CREATE TABLE academy_students (
	academy_profile_id UUID NOT NULL REFERENCES page_profiles(page_id), 
	student_name VARCHAR(100) NOT NULL, 
	age INTEGER, 
	level VARCHAR(50), 
	enrollment_date DATE, 
	is_active BOOLEAN, 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	CONSTRAINT academy_students_page_type_check CHECK (
		EXISTS (SELECT 1 FROM page_profiles WHERE page_id = academy_profile_id AND page_type = 'Academy')
	)
);

CREATE TABLE academy_programs (
	academy_profile_id UUID NOT NULL REFERENCES page_profiles(page_id), 
	program_name VARCHAR(200) NOT NULL, 
	description TEXT, 
	duration_weeks INTEGER, 
	age_group VARCHAR(50), 
	level VARCHAR(50), 
	fees DOUBLE PRECISION, 
	max_students INTEGER, 
	is_active BOOLEAN, 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	CONSTRAINT academy_programs_page_type_check CHECK (
		EXISTS (SELECT 1 FROM page_profiles WHERE page_id = academy_profile_id AND page_type = 'Academy')
	)
);

CREATE TABLE venue_bookings (
	venue_profile_id UUID NOT NULL REFERENCES page_profiles(page_id), 
	user_id UUID NOT NULL REFERENCES users(id), 
	booking_date DATE NOT NULL, 
	start_time TIME WITHOUT TIME ZONE NOT NULL, 
	end_time TIME WITHOUT TIME ZONE NOT NULL, 
	duration_hours DOUBLE PRECISION NOT NULL, 
	total_cost DOUBLE PRECISION NOT NULL, 
	status VARCHAR(20), 
	special_requirements TEXT, 
	contact_number VARCHAR(20), 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	CONSTRAINT venue_bookings_page_type_check CHECK (
		EXISTS (SELECT 1 FROM page_profiles WHERE page_id = venue_profile_id AND page_type = 'Pitch')
	)
);

CREATE TABLE venue_reviews (
	venue_profile_id UUID NOT NULL REFERENCES page_profiles(page_id), 
	user_id UUID NOT NULL REFERENCES users(id), 
	rating INTEGER NOT NULL, 
	title VARCHAR(200), 
	review_text TEXT, 
	is_verified BOOLEAN, 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	CONSTRAINT venue_reviews_page_type_check CHECK (
		EXISTS (SELECT 1 FROM page_profiles WHERE page_id = venue_profile_id AND page_type = 'Pitch')
	)
);

CREATE TABLE community_reviews (
	community_profile_id UUID NOT NULL REFERENCES page_profiles(page_id), 
	user_id UUID NOT NULL REFERENCES users(id), 
	rating INTEGER NOT NULL, 
	title VARCHAR(200), 
	review_text TEXT, 
	is_verified BOOLEAN, 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	CONSTRAINT community_reviews_page_type_check CHECK (
		EXISTS (SELECT 1 FROM page_profiles WHERE page_id = community_profile_id AND page_type = 'Community')
	)
);

CREATE TABLE academy_reviews (
	academy_profile_id UUID NOT NULL REFERENCES page_profiles(page_id), 
	user_id UUID NOT NULL REFERENCES users(id), 
	rating INTEGER NOT NULL, 
	title VARCHAR(200), 
	review_text TEXT, 
	is_verified BOOLEAN, 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	CONSTRAINT academy_reviews_page_type_check CHECK (
		EXISTS (SELECT 1 FROM page_profiles WHERE page_id = academy_profile_id AND page_type = 'Academy')
	)
);

CREATE TABLE player_reviews (
	player_profile_id UUID NOT NULL REFERENCES page_profiles(page_id), 
	user_id UUID NOT NULL REFERENCES users(id), 
	rating INTEGER NOT NULL, 
	title VARCHAR(200), 
	review_text TEXT,
	is_verified BOOLEAN, 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE page_followers (
	page_id UUID NOT NULL REFERENCES page_profiles(page_id), 
	user_id UUID NOT NULL REFERENCES users(id), 
	follower_type VARCHAR(20) NOT NULL CHECK (follower_type IN ('community_member', 'academy_student', 'venue_follower', 'general_follower')), 
	page_type PAGETYPE NOT NULL,
	joined_date DATE DEFAULT CURRENT_DATE, 
	role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('member', 'student', 'follower', 'moderator', 'vip', 'premium')),
	status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending', 'rejected')),
	is_approved BOOLEAN DEFAULT true,
	community_profile_id UUID REFERENCES page_profiles(page_id), 
	academy_profile_id UUID REFERENCES page_profiles(page_id), 
	venue_profile_id UUID REFERENCES page_profiles(page_id), 
	student_name VARCHAR(100), 
	age INTEGER, 
	level VARCHAR(50), 
	enrollment_date DATE, 
	membership_fee DOUBLE PRECISION, 
	membership_duration VARCHAR(50), 
	booking_preferences VARCHAR(500), 
	notification_preferences VARCHAR(500), 
	engagement_score DOUBLE PRECISION DEFAULT 0, 
	last_active TIMESTAMP WITHOUT TIME ZONE, 
	interaction_count INTEGER DEFAULT 0, 
	invited_by UUID REFERENCES users(id), 
	invitation_sent_at TIMESTAMP WITHOUT TIME ZONE, 
	invitation_accepted_at TIMESTAMP WITHOUT TIME ZONE, 
	approved_by UUID REFERENCES users(id), 
	approval_notes TEXT, 
	notification_settings VARCHAR(500), 
	privacy_settings VARCHAR(500), 
	follower_notes TEXT, 
	tags VARCHAR(500), 
	priority INTEGER DEFAULT 0, 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	CONSTRAINT unique_page_follower UNIQUE (page_id, user_id),
	CONSTRAINT follower_type_page_type_match CHECK (
		(follower_type = 'community_member' AND page_type = 'Community') OR
		(follower_type = 'academy_student' AND page_type = 'Academy') OR
		(follower_type = 'venue_follower' AND page_type = 'Pitch') OR
		(follower_type = 'general_follower')
	),
	CONSTRAINT follower_profile_consistency CHECK (
		(follower_type = 'community_member' AND community_profile_id IS NOT NULL) OR
		(follower_type = 'academy_student' AND academy_profile_id IS NOT NULL) OR
		(follower_type = 'venue_follower' AND venue_profile_id IS NOT NULL) OR
		(follower_type = 'general_follower')
	)
);

CREATE TABLE user_profiles (
	user_id UUID NOT NULL REFERENCES users(id), 
	full_name VARCHAR(100) NOT NULL, 
	bio TEXT, 
	location VARCHAR(100), 
	organization VARCHAR(100), 
	age INTEGER, 
	gender VARCHAR(20), 
	contact_number VARCHAR(20), 
	profile_image_url JSONB, 
	batting_skill INTEGER, 
	bowling_skill INTEGER, 
	fielding_skill INTEGER, 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	CONSTRAINT user_profiles_user_id_key UNIQUE (user_id)
);

CREATE TABLE community_events (
	community_profile_id UUID NOT NULL REFERENCES page_profiles(page_id), 
	event_name VARCHAR(200) NOT NULL, 
	description TEXT, 
	event_date DATE NOT NULL, 
	event_time TIME WITHOUT TIME ZONE NOT NULL, 
	location VARCHAR(200), 
	max_participants INTEGER, 
	registration_fee DOUBLE PRECISION, 
	registration_deadline DATE, 
	is_public BOOLEAN, 
	status VARCHAR(20), 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	CONSTRAINT community_events_page_type_check CHECK (
		EXISTS (SELECT 1 FROM page_profiles WHERE page_id = community_profile_id AND page_type = 'Community')
	)
);

CREATE TABLE connections (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	requester_id UUID NOT NULL REFERENCES users(id),
	addressee_id UUID NOT NULL REFERENCES users(id), 
	status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')), 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE user_stats (
	profile_id UUID NOT NULL REFERENCES users(id), 
	total_runs INTEGER, 
	total_wickets INTEGER, 
	total_matches INTEGER, 
	total_awards INTEGER, 
	batting_average DOUBLE PRECISION, 
	batting_strike_rate DOUBLE PRECISION, 
	highest_score INTEGER, 
	centuries INTEGER, 
	half_centuries INTEGER, 
	fours INTEGER, 
	sixes INTEGER, 
	balls_faced INTEGER, 
	bowling_average DOUBLE PRECISION, 
	bowling_economy DOUBLE PRECISION, 
	bowling_strike_rate DOUBLE PRECISION, 
	best_bowling_figures VARCHAR(20), 
	five_wicket_hauls INTEGER, 
	four_wicket_hauls INTEGER, 
	maidens INTEGER, 
	runs_conceded INTEGER, 
	balls_bowled INTEGER, 
	catches INTEGER, 
	stumpings INTEGER, 
	run_outs INTEGER, 
	test_matches INTEGER, 
	odi_matches INTEGER, 
	t20_matches INTEGER, 
	test_runs INTEGER, 
	odi_runs INTEGER, 
	t20_runs INTEGER, 
	test_wickets INTEGER, 
	odi_wickets INTEGER, 
	t20_wickets INTEGER, 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	CONSTRAINT user_stats_profile_id_key UNIQUE (profile_id)
);

CREATE TABLE user_experiences (
	profile_id UUID NOT NULL REFERENCES users(id), 
	title VARCHAR(100) NOT NULL, 
	role VARCHAR(100) NOT NULL, 
	duration VARCHAR(50) NOT NULL, 
	description TEXT, 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE match_comments (
	match_id UUID NOT NULL REFERENCES matches(id), 
	user_id UUID NOT NULL REFERENCES users(id), 
	content TEXT NOT NULL, 
	parent_comment_id UUID, 
	likes_count INTEGER, 
	is_edited BOOLEAN, 
	edited_at TIMESTAMP WITHOUT TIME ZONE, 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	CONSTRAINT match_comments_parent_comment_id_fkey FOREIGN KEY(parent_comment_id) REFERENCES match_comments (id)
);

CREATE TABLE relationships (
	follower_id UUID NOT NULL REFERENCES users(id), 
	following_id UUID NOT NULL REFERENCES users(id), 
	relationship_type RELATIONSHIPTYPE NOT NULL, 
	status RELATIONSHIPSTATUS, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	accepted_at TIMESTAMP WITHOUT TIME ZONE, 
	rejected_at TIMESTAMP WITHOUT TIME ZONE, 
	message TEXT, 
	is_mutual BOOLEAN, 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	CONSTRAINT unique_relationship_per_type UNIQUE (follower_id, following_id, relationship_type), 
	CONSTRAINT prevent_self_relationship CHECK (follower_id <> following_id)
);

CREATE TABLE post_likes (
	post_id UUID NOT NULL REFERENCES posts(id), 
	user_id UUID NOT NULL REFERENCES users(id), 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	CONSTRAINT unique_post_like UNIQUE (post_id, user_id)
);

CREATE TABLE match_likes (
	match_id UUID NOT NULL REFERENCES matches(id), 
	user_id UUID NOT NULL REFERENCES users(id), 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	CONSTRAINT unique_match_like UNIQUE (match_id, user_id)
);

CREATE TABLE user_achievements (
	profile_id UUID NOT NULL REFERENCES users(id), 
	title VARCHAR(100) NOT NULL, 
	description TEXT, 
	year VARCHAR(10) NOT NULL, 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE post_comments (
	post_id UUID NOT NULL REFERENCES posts(id), 
	user_id UUID NOT NULL REFERENCES users(id), 
	content TEXT NOT NULL, 
	parent_comment_id UUID, 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	CONSTRAINT post_comments_parent_comment_id_fkey FOREIGN KEY(parent_comment_id) REFERENCES post_comments (id)
);

CREATE TABLE post_bookmarks (
	post_id UUID NOT NULL REFERENCES posts(id), 
	user_id UUID NOT NULL REFERENCES users(id), 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	CONSTRAINT unique_post_bookmark UNIQUE (post_id, user_id)
);

CREATE TABLE post_shares (
	post_id UUID NOT NULL REFERENCES posts(id), 
	user_id UUID NOT NULL REFERENCES users(id), 
	share_type VARCHAR(20) DEFAULT 'share' CHECK (share_type IN ('share', 'repost', 'quote', 'story')),
	share_platform VARCHAR(50), 
	share_message TEXT, 
	share_visibility VARCHAR(20) DEFAULT 'public' CHECK (share_visibility IN ('public', 'private', 'friends', 'followers')),
	is_original BOOLEAN DEFAULT true,
	original_share_id UUID, 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	CONSTRAINT unique_post_share UNIQUE (post_id, user_id, share_type)
);	

CREATE TABLE match_participants (
	match_id UUID NOT NULL REFERENCES matches(id), 
	user_id UUID NOT NULL REFERENCES users(id), 
	joined_at TIMESTAMP WITHOUT TIME ZONE, 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	CONSTRAINT unique_match_participation UNIQUE (match_id, user_id)
);

CREATE TABLE messages (
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    sender_id UUID NOT NULL REFERENCES users(id),
    receiver_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_read BOOLEAN,
    read_at TIMESTAMP WITHOUT TIME ZONE,
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE notifications (
	sender_id UUID NOT NULL REFERENCES users(id), 
	receiver_id UUID NOT NULL REFERENCES users(id), 
	type NOTIFICATIONTYPE NOT NULL, 
	title VARCHAR(200) NOT NULL, 
	content TEXT NOT NULL, 
	is_read BOOLEAN, 
	read_at TIMESTAMP WITHOUT TIME ZONE, 
	related_post_id UUID REFERENCES posts(id), 
	related_match_id UUID REFERENCES matches(id), 
	related_message_id UUID REFERENCES messages(id), 
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE match_teams (
	team_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	match_id UUID REFERENCES matches(id),
	team_name VARCHAR(200) NOT NULL,
	player_role VARCHAR(50),
	player_position INTEGER,
	max_players INTEGER DEFAULT 11,
	current_players INTEGER DEFAULT 0,
	available_positions JSONB DEFAULT '[]'::jsonb,
	is_active BOOLEAN DEFAULT true,
	created_by UUID REFERENCES users(id),
	updated_by UUID REFERENCES users(id),
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE match_umpires (
	umpire_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	match_id UUID REFERENCES matches(id),
	umpire_name VARCHAR(200) NOT NULL,
	umpire_contact VARCHAR(20),
	experience_level VARCHAR(50),
	umpire_fees DOUBLE PRECISION,
	is_active BOOLEAN DEFAULT true,
	created_by UUID REFERENCES users(id),
	updated_by UUID REFERENCES users(id),
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE match_team_participants (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	match_id UUID NOT NULL REFERENCES matches(id),
	team_id UUID NOT NULL REFERENCES match_teams(team_id),
	user_id UUID NOT NULL REFERENCES users(id),
	player_position INTEGER NOT NULL,
	player_role VARCHAR(50),
	joined_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	is_active BOOLEAN DEFAULT true,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	CONSTRAINT unique_team_position UNIQUE (match_id, team_id, player_position),
	CONSTRAINT unique_team_participation UNIQUE (match_id, user_id)
);

-- =============================================
-- PERFORMANCE INDEXES
-- =============================================

-- User-related indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Page profiles indexes
CREATE INDEX idx_page_profiles_user_id ON page_profiles(user_id);
CREATE INDEX idx_page_profiles_page_type ON page_profiles(page_type);
CREATE INDEX idx_page_profiles_city ON page_profiles(city);
CREATE INDEX idx_page_profiles_state ON page_profiles(state);
CREATE INDEX idx_page_profiles_country ON page_profiles(country);
CREATE INDEX idx_page_profiles_is_verified ON page_profiles(is_verified);
CREATE INDEX idx_page_profiles_is_active ON page_profiles(is_active);
CREATE INDEX idx_page_profiles_created_at ON page_profiles(created_at);
CREATE INDEX idx_page_profiles_location ON page_profiles USING GIST (ll_to_earth(latitude, longitude));

-- Matches indexes
CREATE INDEX idx_matches_creator_id ON matches(creator_id);
CREATE INDEX idx_matches_match_date ON matches(match_date);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_match_type ON matches(match_type);
CREATE INDEX idx_matches_match_format ON matches(match_format);
CREATE INDEX idx_matches_location ON matches(location);
CREATE INDEX idx_matches_is_public ON matches(is_public);
CREATE INDEX idx_matches_is_active ON matches(is_active);
CREATE INDEX idx_matches_created_at ON matches(created_at);

-- Posts indexes
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_post_type ON posts(post_type);
CREATE INDEX idx_posts_visibility ON posts(visibility);
CREATE INDEX idx_posts_is_approved ON posts(is_approved);
CREATE INDEX idx_posts_approval_status ON posts(approval_status);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_posts_is_active ON posts(is_active);
CREATE INDEX idx_posts_featured ON posts(featured);
CREATE INDEX idx_posts_priority ON posts(priority);
CREATE INDEX idx_posts_schedule_time ON posts(schedule_time);
CREATE INDEX idx_posts_content_tsv ON posts USING GIN (content_tsv);
CREATE INDEX idx_posts_search_vector ON posts USING GIN (search_vector);

-- Search indexes
CREATE INDEX idx_search_results_user_id ON search_results(user_id);
CREATE INDEX idx_search_results_search_type ON search_results(search_type);
CREATE INDEX idx_search_results_created_at ON search_results(created_at);
CREATE INDEX idx_search_trends_query ON search_trends(query);
CREATE INDEX idx_search_trends_trend_score ON search_trends(trend_score);
CREATE INDEX idx_search_suggestions_suggestion_type ON search_suggestions(suggestion_type);
CREATE INDEX idx_search_suggestions_popularity_score ON search_suggestions(popularity_score);

-- Relationship indexes
CREATE INDEX idx_relationships_follower_id ON relationships(follower_id);
CREATE INDEX idx_relationships_following_id ON relationships(following_id);
CREATE INDEX idx_relationships_type ON relationships(relationship_type);
CREATE INDEX idx_relationships_status ON relationships(status);

-- Page followers indexes
CREATE INDEX idx_page_followers_page_id ON page_followers(page_id);
CREATE INDEX idx_page_followers_user_id ON page_followers(user_id);
CREATE INDEX idx_page_followers_page_type ON page_followers(page_type);
CREATE INDEX idx_page_followers_follower_type ON page_followers(follower_type);
CREATE INDEX idx_page_followers_status ON page_followers(status);
CREATE INDEX idx_page_followers_joined_date ON page_followers(joined_date);

-- Messages indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Notifications indexes
CREATE INDEX idx_notifications_receiver_id ON notifications(receiver_id);
CREATE INDEX idx_notifications_sender_id ON notifications(sender_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Match participants indexes
CREATE INDEX idx_match_participants_match_id ON match_participants(match_id);
CREATE INDEX idx_match_participants_user_id ON match_participants(user_id);

-- Post interactions indexes
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX idx_post_comments_user_id ON post_comments(user_id);
CREATE INDEX idx_post_bookmarks_post_id ON post_bookmarks(post_id);
CREATE INDEX idx_post_bookmarks_user_id ON post_bookmarks(user_id);
CREATE INDEX idx_post_shares_post_id ON post_shares(post_id);
CREATE INDEX idx_post_shares_user_id ON post_shares(user_id);

-- Match interactions indexes
CREATE INDEX idx_match_likes_match_id ON match_likes(match_id);
CREATE INDEX idx_match_likes_user_id ON match_likes(user_id);
CREATE INDEX idx_match_comments_match_id ON match_comments(match_id);
CREATE INDEX idx_match_comments_user_id ON match_comments(user_id);

-- Page admin indexes
CREATE INDEX idx_page_admins_page_id ON page_admins(page_id);
CREATE INDEX idx_page_admins_user_id ON page_admins(user_id);
CREATE INDEX idx_page_admins_admin_role ON page_admins(admin_role);
CREATE INDEX idx_page_admins_page_type ON page_admins(page_type);
CREATE INDEX idx_page_admins_is_active ON page_admins(is_active);

-- Academy/Community/Venue specific indexes
CREATE INDEX idx_academy_students_academy_profile_id ON academy_students(academy_profile_id);
CREATE INDEX idx_academy_students_is_active ON academy_students(is_active);
CREATE INDEX idx_academy_programs_academy_profile_id ON academy_programs(academy_profile_id);
CREATE INDEX idx_academy_programs_is_active ON academy_programs(is_active);
CREATE INDEX idx_venue_bookings_venue_profile_id ON venue_bookings(venue_profile_id);
CREATE INDEX idx_venue_bookings_user_id ON venue_bookings(user_id);
CREATE INDEX idx_venue_bookings_booking_date ON venue_bookings(booking_date);
CREATE INDEX idx_venue_bookings_status ON venue_bookings(status);
CREATE INDEX idx_community_events_community_profile_id ON community_events(community_profile_id);
CREATE INDEX idx_community_events_event_date ON community_events(event_date);
CREATE INDEX idx_community_events_is_public ON community_events(is_public);

-- Review indexes
CREATE INDEX idx_venue_reviews_venue_profile_id ON venue_reviews(venue_profile_id);
CREATE INDEX idx_venue_reviews_user_id ON venue_reviews(user_id);
CREATE INDEX idx_venue_reviews_rating ON venue_reviews(rating);
CREATE INDEX idx_community_reviews_community_profile_id ON community_reviews(community_profile_id);
CREATE INDEX idx_community_reviews_user_id ON community_reviews(user_id);
CREATE INDEX idx_community_reviews_rating ON community_reviews(rating);
CREATE INDEX idx_academy_reviews_academy_profile_id ON academy_reviews(academy_profile_id);
CREATE INDEX idx_academy_reviews_user_id ON academy_reviews(user_id);
CREATE INDEX idx_academy_reviews_rating ON academy_reviews(rating);
CREATE INDEX idx_player_reviews_player_profile_id ON player_reviews(player_profile_id);
CREATE INDEX idx_player_reviews_user_id ON player_reviews(user_id);
CREATE INDEX idx_player_reviews_rating ON player_reviews(rating);

-- Player stats indexes
CREATE INDEX idx_player_career_stats_player_profile_id ON player_career_stats(player_profile_id);
CREATE INDEX idx_player_match_stats_player_profile_id ON player_match_stats(player_profile_id);
CREATE INDEX idx_player_match_stats_match_id ON player_match_stats(match_id);
CREATE INDEX idx_user_stats_profile_id ON user_stats(profile_id);
CREATE INDEX idx_user_experiences_profile_id ON user_experiences(profile_id);
CREATE INDEX idx_user_achievements_profile_id ON user_achievements(profile_id);

-- Connection indexes
CREATE INDEX idx_connections_requester_id ON connections(requester_id);
CREATE INDEX idx_connections_addressee_id ON connections(addressee_id);
CREATE INDEX idx_connections_status ON connections(status);

-- User profile indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_location ON user_profiles(location);
CREATE INDEX idx_user_profiles_organization ON user_profiles(organization);

-- Conversation indexes
CREATE INDEX idx_conversations_user1_id ON conversations(user1_id);
CREATE INDEX idx_conversations_user2_id ON conversations(user2_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at);
CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_is_active ON conversation_participants(is_active);

-- Notification preferences indexes
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Search analytics indexes
CREATE INDEX idx_search_analytics_date ON search_analytics(date);
CREATE INDEX idx_search_analytics_created_at ON search_analytics(created_at);

-- Teams indexes
CREATE INDEX idx_match_teams_team_name ON match_teams(team_name);
CREATE INDEX idx_match_teams_player_role ON match_teams(player_role);
CREATE INDEX idx_match_teams_player_position ON match_teams(player_position);
CREATE INDEX idx_match_teams_is_active ON match_teams(is_active);
CREATE INDEX idx_match_teams_created_at ON match_teams(created_at);

-- Match Umpires indexes
CREATE INDEX idx_match_umpires_umpire_name ON match_umpires(umpire_name);
CREATE INDEX idx_match_umpires_umpire_contact ON match_umpires(umpire_contact);
CREATE INDEX idx_match_umpires_experience_level ON match_umpires(experience_level);
CREATE INDEX idx_match_umpires_umpire_fees ON match_umpires(umpire_fees);
CREATE INDEX idx_match_umpires_is_active ON match_umpires(is_active);
CREATE INDEX idx_match_umpires_created_at ON match_umpires(created_at);

-- Jobs table for job postings
CREATE TABLE jobs (
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
CREATE TABLE members (
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
CREATE TABLE job_applications (
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
CREATE INDEX idx_jobs_page_id ON jobs(page_id);
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_is_active ON jobs(is_active);
CREATE INDEX idx_jobs_is_featured ON jobs(is_featured);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);

-- Indexes for Members table
CREATE INDEX idx_members_page_id ON members(page_id);
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_role ON members(role);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_created_at ON members(created_at);

-- Indexes for Job Applications table
CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_applicant_user_id ON job_applications(applicant_user_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_job_applications_applied_at ON job_applications(applied_at);