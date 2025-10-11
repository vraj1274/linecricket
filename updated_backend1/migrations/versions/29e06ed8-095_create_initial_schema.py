"""Create initial database schema

Revision ID: 29e06ed8-095
Revises: 
Create Date: 2025-10-06 14:56:57.334441

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '29e06ed8-095'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Enable UUID extension
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
    
    # Create enum types
    op.execute("CREATE TYPE pagetype AS ENUM ('Academy', 'Club', 'Community', 'Pitch');")
    op.execute("CREATE TYPE searchtype AS ENUM ('User', 'Page', 'Post', 'Match', 'Event');")
    op.execute("CREATE TYPE matchtype AS ENUM ('Friendly', 'Tournament', 'League');")
    op.execute("CREATE TYPE matchstatus AS ENUM ('Upcoming', 'Live', 'Completed', 'Cancelled');")
    op.execute("CREATE TYPE academytype AS ENUM ('Private', 'Government', 'Club');")
    op.execute("CREATE TYPE academylevel AS ENUM ('Beginner', 'Intermediate', 'Advanced', 'Professional');")
    op.execute("CREATE TYPE relationshiptype AS ENUM ('Follow', 'Friend', 'Block', 'Mute');")
    op.execute("CREATE TYPE relationshipstatus AS ENUM ('Pending', 'Accepted', 'Rejected', 'Blocked');")
    op.execute("CREATE TYPE notificationtype AS ENUM ('Like', 'Comment', 'Follow', 'Message', 'Match', 'System');")
    op.execute("CREATE TYPE matchformat AS ENUM ('T20', 'ODI', 'Test', 'T10', 'Other');")
    
    # Create users table
    op.create_table('users',
        sa.Column('firebase_uid', sa.String(length=255), nullable=True),
        sa.Column('firebase_email', sa.String(length=255), nullable=True),
        sa.Column('cognito_user_id', sa.String(length=255), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('is_verified', sa.Boolean(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('auth_provider', sa.String(length=50), nullable=False),
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create page_profiles table
    op.create_table('page_profiles',
        sa.Column('page_id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('firebase_uid', sa.String(length=255), nullable=True),
        sa.Column('cognito_user_id', sa.String(length=255), nullable=True),
        sa.Column('organization_name', sa.String(length=200), nullable=False),
        sa.Column('tagline', sa.String(length=300), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('contact_person', sa.String(length=100), nullable=True),
        sa.Column('contact_number', sa.String(length=20), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('website', sa.String(length=500), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('city', sa.String(length=100), nullable=True),
        sa.Column('state', sa.String(length=100), nullable=True),
        sa.Column('country', sa.String(length=100), nullable=True),
        sa.Column('pincode', sa.String(length=20), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('logo_url', sa.String(length=500), nullable=True),
        sa.Column('banner_image_url', sa.String(length=500), nullable=True),
        sa.Column('gallery_images', sa.Text(), nullable=True),
        sa.Column('facilities', sa.Text(), nullable=True),
        sa.Column('services_offered', sa.Text(), nullable=True),
        sa.Column('instagram_handle', sa.String(length=100), nullable=True),
        sa.Column('facebook_handle', sa.String(length=100), nullable=True),
        sa.Column('twitter_handle', sa.String(length=100), nullable=True),
        sa.Column('youtube_handle', sa.String(length=100), nullable=True),
        sa.Column('achievements', sa.Text(), nullable=True),
        sa.Column('testimonials', sa.Text(), nullable=True),
        sa.Column('is_public', sa.Boolean(), nullable=True),
        sa.Column('allow_messages', sa.Boolean(), nullable=True),
        sa.Column('show_contact', sa.Boolean(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=True),
        sa.Column('page_type', postgresql.ENUM('Academy', 'Club', 'Community', 'Pitch', name='pagetype'), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default=sa.text('true')),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('page_id'),
        sa.UniqueConstraint('user_id', name='page_profiles_user_id_key')
    )
    
    # Create matches table
    op.create_table('matches',
        sa.Column('creator_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('match_name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('match_type', postgresql.ENUM('Friendly', 'Tournament', 'League', name='matchtype'), nullable=False),
        sa.Column('match_format', postgresql.ENUM('T20', 'ODI', 'Test', 'T10', 'Other', name='matchformat'), nullable=False),
        sa.Column('location', sa.String(length=200), nullable=False),
        sa.Column('venue', sa.String(length=200), nullable=True),
        sa.Column('match_date', sa.Date(), nullable=False),
        sa.Column('match_time', sa.Time(), nullable=False),
        sa.Column('players_needed', sa.Integer(), nullable=False),
        sa.Column('entry_fee', sa.Float(), nullable=True),
        sa.Column('is_public', sa.Boolean(), nullable=True),
        sa.Column('status', postgresql.ENUM('Upcoming', 'Live', 'Completed', 'Cancelled', name='matchstatus'), nullable=True),
        sa.Column('match_summary', sa.Text(), nullable=True),
        sa.Column('stream_url', sa.String(length=500), nullable=True),
        sa.Column('skill_level', sa.String(length=50), nullable=True),
        sa.Column('minimum_age', sa.Integer(), nullable=True),
        sa.Column('maximum_age', sa.Integer(), nullable=True),
        sa.Column('equipment_provided', sa.Boolean(), nullable=True),
        sa.Column('price_money_amount', sa.Float(), nullable=True),
        sa.Column('rules', sa.Text(), nullable=True),
        sa.Column('weather', sa.String(length=20), nullable=True, server_default=sa.text("'unknown'::character varying")),
        sa.Column('temperature', sa.Float(), nullable=True),
        sa.Column('wind_speed', sa.Float(), nullable=True),
        sa.Column('humidity', sa.Float(), nullable=True),
        sa.Column('total_views', sa.Integer(), nullable=True, server_default=sa.text('0')),
        sa.Column('total_interested', sa.Integer(), nullable=True, server_default=sa.text('0')),
        sa.Column('total_joined', sa.Integer(), nullable=True, server_default=sa.text('0')),
        sa.Column('total_left', sa.Integer(), nullable=True, server_default=sa.text('0')),
        sa.Column('estimated_duration', sa.Integer(), nullable=True),
        sa.Column('actual_duration', sa.Integer(), nullable=True),
        sa.Column('start_time_actual', sa.DateTime(), nullable=True),
        sa.Column('end_time_actual', sa.DateTime(), nullable=True),
        sa.Column('winner_team', sa.String(length=100), nullable=True),
        sa.Column('man_of_the_match', sa.String(length=100), nullable=True),
        sa.Column('best_bowler', sa.String(length=100), nullable=True),
        sa.Column('best_batsman', sa.String(length=100), nullable=True),
        sa.Column('photos', postgresql.JSON(astext_type=sa.Text()), nullable=True, server_default=sa.text("'[]'::json")),
        sa.Column('videos', postgresql.JSON(astext_type=sa.Text()), nullable=True, server_default=sa.text("'[]'::json")),
        sa.Column('highlights', postgresql.JSON(astext_type=sa.Text()), nullable=True, server_default=sa.text("'[]'::json")),
        sa.Column('last_updated', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('update_count', sa.Integer(), nullable=True, server_default=sa.text('0')),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default=sa.text('true')),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['creator_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create posts table
    op.create_table('posts',
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('image_url', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('video_url', sa.String(length=500), nullable=True),
        sa.Column('location', sa.String(length=100), nullable=True),
        sa.Column('likes_count', sa.Integer(), nullable=True),
        sa.Column('comments_count', sa.Integer(), nullable=True),
        sa.Column('shares_count', sa.Integer(), nullable=True),
        sa.Column('bookmarks_count', sa.Integer(), nullable=True),
        sa.Column('views_count', sa.Integer(), nullable=True),
        sa.Column('post_type', sa.String(length=50), nullable=False),
        sa.Column('visibility', sa.String(length=20), nullable=True, server_default=sa.text("'public'")),
        sa.Column('is_pinned', sa.Boolean(), nullable=True, server_default=sa.text('false')),
        sa.Column('engagement_score', sa.Float(), nullable=True),
        sa.Column('trending_score', sa.Float(), nullable=True),
        sa.Column('hashtags', sa.String(length=500), nullable=True),
        sa.Column('mentions', sa.String(length=500), nullable=True),
        sa.Column('page_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('community_profile_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('academy_profile_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('venue_profile_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('title', sa.String(length=200), nullable=True),
        sa.Column('is_approved', sa.Boolean(), nullable=True, server_default=sa.text('true')),
        sa.Column('approval_status', sa.String(length=20), nullable=True, server_default=sa.text("'approved'")),
        sa.Column('moderator_notes', sa.Text(), nullable=True),
        sa.Column('event_date', sa.Date(), nullable=True),
        sa.Column('event_time', sa.Time(), nullable=True),
        sa.Column('event_location', sa.String(length=200), nullable=True),
        sa.Column('max_participants', sa.Integer(), nullable=True),
        sa.Column('registration_fee', sa.Float(), nullable=True),
        sa.Column('registration_deadline', sa.Date(), nullable=True),
        sa.Column('post_category', sa.String(length=50), nullable=True),
        sa.Column('tags', sa.String(length=500), nullable=True),
        sa.Column('featured', sa.Boolean(), nullable=True, server_default=sa.text('false')),
        sa.Column('priority', sa.Integer(), nullable=True, server_default=sa.text('0')),
        sa.Column('schedule_time', sa.DateTime(), nullable=False),
        sa.Column('content_tsv', postgresql.TSVECTOR(), nullable=True),
        sa.Column('search_vector', postgresql.TSVECTOR(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default=sa.text('true')),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create conversations table
    op.create_table('conversations',
        sa.Column('user1_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user2_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('last_message_at', sa.DateTime(), nullable=True),
        sa.Column('last_message_content', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default=sa.text('true')),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user1_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['user2_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user1_id', 'user2_id', name='unique_conversation')
    )
    
    # Create messages table
    op.create_table('messages',
        sa.Column('conversation_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('sender_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('receiver_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=True),
        sa.Column('read_at', sa.DateTime(), nullable=True),
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ),
        sa.ForeignKeyConstraint(['sender_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['receiver_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create notifications table
    op.create_table('notifications',
        sa.Column('sender_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('receiver_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('type', postgresql.ENUM('Like', 'Comment', 'Follow', 'Message', 'Match', 'System', name='notificationtype'), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=True),
        sa.Column('read_at', sa.DateTime(), nullable=True),
        sa.Column('related_post_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('related_match_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('related_message_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['sender_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['receiver_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create relationships table
    op.create_table('relationships',
        sa.Column('follower_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('following_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('relationship_type', postgresql.ENUM('Follow', 'Friend', 'Block', 'Mute', name='relationshiptype'), nullable=False),
        sa.Column('status', postgresql.ENUM('Pending', 'Accepted', 'Rejected', 'Blocked', name='relationshipstatus'), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('accepted_at', sa.DateTime(), nullable=True),
        sa.Column('rejected_at', sa.DateTime(), nullable=True),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('is_mutual', sa.Boolean(), nullable=True),
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('uuid_generate_v4()')),
        sa.ForeignKeyConstraint(['follower_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['following_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('follower_id', 'following_id', 'relationship_type', name='unique_relationship_per_type')
    )
    
    # Create page_followers table
    op.create_table('page_followers',
        sa.Column('page_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('follower_type', sa.String(length=20), nullable=False),
        sa.Column('page_type', postgresql.ENUM('Academy', 'Club', 'Community', 'Pitch', name='pagetype'), nullable=False),
        sa.Column('joined_date', sa.Date(), nullable=True, server_default=sa.text('CURRENT_DATE')),
        sa.Column('role', sa.String(length=50), nullable=True, server_default=sa.text("'member'")),
        sa.Column('status', sa.String(length=20), nullable=True, server_default=sa.text("'active'")),
        sa.Column('is_approved', sa.Boolean(), nullable=True, server_default=sa.text('true')),
        sa.Column('community_profile_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('academy_profile_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('venue_profile_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('student_name', sa.String(length=100), nullable=True),
        sa.Column('age', sa.Integer(), nullable=True),
        sa.Column('level', sa.String(length=50), nullable=True),
        sa.Column('enrollment_date', sa.Date(), nullable=True),
        sa.Column('membership_fee', sa.Float(), nullable=True),
        sa.Column('membership_duration', sa.String(length=50), nullable=True),
        sa.Column('booking_preferences', sa.String(length=500), nullable=True),
        sa.Column('notification_preferences', sa.String(length=500), nullable=True),
        sa.Column('engagement_score', sa.Float(), nullable=True, server_default=sa.text('0')),
        sa.Column('last_active', sa.DateTime(), nullable=True),
        sa.Column('interaction_count', sa.Integer(), nullable=True, server_default=sa.text('0')),
        sa.Column('invited_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('invitation_sent_at', sa.DateTime(), nullable=True),
        sa.Column('invitation_accepted_at', sa.DateTime(), nullable=True),
        sa.Column('approved_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('approval_notes', sa.Text(), nullable=True),
        sa.Column('notification_settings', sa.String(length=500), nullable=True),
        sa.Column('privacy_settings', sa.String(length=500), nullable=True),
        sa.Column('follower_notes', sa.Text(), nullable=True),
        sa.Column('tags', sa.String(length=500), nullable=True),
        sa.Column('priority', sa.Integer(), nullable=True, server_default=sa.text('0')),
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['page_id'], ['page_profiles.page_id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('page_id', 'user_id', name='unique_page_follower')
    )


def downgrade():
    # Drop tables in reverse order
    op.drop_table('page_followers')
    op.drop_table('relationships')
    op.drop_table('notifications')
    op.drop_table('messages')
    op.drop_table('conversations')
    op.drop_table('posts')
    op.drop_table('matches')
    op.drop_table('page_profiles')
    op.drop_table('users')
    
    # Drop enum types
    op.execute("DROP TYPE IF EXISTS matchformat;")
    op.execute("DROP TYPE IF EXISTS notificationtype;")
    op.execute("DROP TYPE IF EXISTS relationshipstatus;")
    op.execute("DROP TYPE IF EXISTS relationshiptype;")
    op.execute("DROP TYPE IF EXISTS academylevel;")
    op.execute("DROP TYPE IF EXISTS academytype;")
    op.execute("DROP TYPE IF EXISTS matchstatus;")
    op.execute("DROP TYPE IF EXISTS matchtype;")
    op.execute("DROP TYPE IF EXISTS searchtype;")
    op.execute("DROP TYPE IF EXISTS pagetype;")
