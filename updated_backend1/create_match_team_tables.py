#!/usr/bin/env python3
"""
Script to create match team tables in the existing database
"""

import psycopg2
import sys
from datetime import datetime

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'linecricket25',
    'user': 'postgres',
    'password': 'root'
}

def create_match_team_tables():
    """Create match team related tables"""
    try:
        # Connect to database
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        print("🔗 Connected to database successfully")
        
        # Create match_teams table
        print("📝 Creating match_teams table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS match_teams (
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
                created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("✅ match_teams table created successfully")
        
        # Create match_team_participants table
        print("📝 Creating match_team_participants table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS match_team_participants (
                match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
                team_id UUID NOT NULL REFERENCES match_teams(team_id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                player_position INTEGER NOT NULL,
                player_role VARCHAR(50),
                joined_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (match_id, team_id, user_id)
            );
        """)
        print("✅ match_team_participants table created successfully")
        
        # Create match_umpires table
        print("📝 Creating match_umpires table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS match_umpires (
                umpire_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
                umpire_name VARCHAR(200) NOT NULL,
                umpire_contact VARCHAR(20),
                experience_level VARCHAR(50),
                umpire_fees DOUBLE PRECISION,
                is_active BOOLEAN DEFAULT true,
                created_by UUID REFERENCES users(id),
                updated_by UUID REFERENCES users(id),
                created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("✅ match_umpires table created successfully")
        
        # Create indexes for better performance
        print("📝 Creating indexes...")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_match_teams_match_id ON match_teams(match_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_match_team_participants_match_id ON match_team_participants(match_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_match_team_participants_team_id ON match_team_participants(team_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_match_team_participants_user_id ON match_team_participants(user_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_match_umpires_match_id ON match_umpires(match_id);")
        print("✅ Indexes created successfully")
        
        # Commit changes
        conn.commit()
        print("💾 Changes committed to database")
        
        # Verify tables were created
        print("🔍 Verifying table creation...")
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('match_teams', 'match_team_participants', 'match_umpires')
            ORDER BY table_name;
        """)
        
        tables = cursor.fetchall()
        print(f"📊 Found {len(tables)} tables:")
        for table in tables:
            print(f"   - {table[0]}")
        
        print("\n🎉 Match team tables created successfully!")
        print("📋 Summary:")
        print("   ✅ match_teams - For storing team information")
        print("   ✅ match_team_participants - For storing team member assignments")
        print("   ✅ match_umpires - For storing umpire information")
        print("   ✅ Indexes created for optimal performance")
        
    except psycopg2.Error as e:
        print(f"❌ Database error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
        print("🔌 Database connection closed")

if __name__ == "__main__":
    print("🚀 Starting match team tables creation...")
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)
    
    create_match_team_tables()
    
    print("=" * 50)
    print("✅ Script completed successfully!")
