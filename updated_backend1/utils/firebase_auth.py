"""
Firebase Authentication Helper
Handles Firebase token verification and user ID extraction
"""

import os
import json
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

def verify_firebase_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify Firebase token and extract user information
    
    Args:
        token: Firebase ID token
        
    Returns:
        Dictionary with user information or None if invalid
    """
    try:
        # For development, we'll use a simple approach
        # In production, you would use the Firebase Admin SDK to verify the token
        
        if not token or len(token) < 10:
            logger.warning("Invalid token format")
            return None
            
        # For development, we'll simulate token verification
        # In production, you would use:
        # from firebase_admin import auth
        # decoded_token = auth.verify_id_token(token)
        
        # For now, we'll extract user info from a mock token structure
        # In a real implementation, you would verify the token with Firebase
        
        # Mock user data for development
        # In production, this would come from the verified Firebase token
        mock_users = {
            "17c9109e-cb20-4723-be49-c26b8343cd19": {
                "uid": "17c9109e-cb20-4723-be49-c26b8343cd19",
                "email": "test@example.com",
                "username": "testuser",
                "name": "Test User"
            },
            "user123": {
                "uid": "user123",
                "email": "user@example.com", 
                "username": "user123",
                "name": "User 123"
            }
        }
        
        # For development, we'll use the token as a user ID
        # In production, you would verify the token and extract the UID
        if token in mock_users:
            return mock_users[token]
        else:
            # For any other token, use it as a user ID
            return {
                "uid": token,
                "email": f"{token}@example.com",
                "username": token,
                "name": f"User {token}"
            }
            
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        return None

def get_user_id_from_token(token: str) -> Optional[str]:
    """
    Extract user ID from Firebase token
    
    Args:
        token: Firebase ID token
        
    Returns:
        User ID string or None if invalid
    """
    try:
        user_info = verify_firebase_token(token)
        if user_info:
            return user_info.get('uid')
        return None
    except Exception as e:
        logger.error(f"Error extracting user ID: {e}")
        return None

def get_user_info_from_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Get full user information from Firebase token
    
    Args:
        token: Firebase ID token
        
    Returns:
        Dictionary with user information or None if invalid
    """
    return verify_firebase_token(token)

def is_token_valid(token: str) -> bool:
    """
    Check if Firebase token is valid
    
    Args:
        token: Firebase ID token
        
    Returns:
        True if valid, False otherwise
    """
    return get_user_id_from_token(token) is not None
