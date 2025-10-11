from enum import Enum

# Enums matching database_schema.sql

class PageType(Enum):
    ACADEMY = "Academy"
    CLUB = "Club"
    COMMUNITY = "Community"
    PITCH = "Pitch"

class SearchType(Enum):
    USER = "User"
    PAGE = "Page"
    POST = "Post"
    MATCH = "Match"
    EVENT = "Event"
    ACADEMY = "Academy"
    JOB = "Job"
    COACH = "Coach"
    COMMUNITY = "Community"
    VENUE = "Venue"
    LOCATION = "Location"

class MatchType(Enum):
    FRIENDLY = "friendly"
    TOURNAMENT = "tournament"
    LEAGUE = "league"

class MatchStatus(Enum):
    UPCOMING = "upcoming"
    LIVE = "live"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class AcademyType(Enum):
    PRIVATE = "private"
    GOVERNMENT = "government"
    CLUB = "club"

class AcademyLevel(Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    PROFESSIONAL = "professional"

class RelationshipType(Enum):
    FOLLOW = "follow"
    FRIEND = "friend"
    BLOCK = "block"
    MUTE = "mute"
    CONNECTION_REQUEST = "connection_request"
    CONNECTION_ACCEPTED = "connection_accepted"
    CONNECTION_REJECTED = "connection_rejected"

class RelationshipStatus(Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    BLOCKED = "blocked"

class NotificationType(Enum):
    LIKE = "like"
    COMMENT = "comment"
    FOLLOW = "follow"
    MESSAGE = "message"
    MATCH = "match"
    SYSTEM = "system"

class NotificationPriority(Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class NotificationStatus(Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"

class ConversationType(Enum):
    DIRECT = "direct"
    GROUP = "group"

class MessageType(Enum):
    TEXT = "text"
    IMAGE = "image"
    FILE = "file"
    SYSTEM = "system"

class MessageStatus(Enum):
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"
