"""
Firebase Admin SDK Service
Handles Firebase token verification and user management
"""

import os
import logging
from typing import Optional, Dict, Any, Tuple
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from firebase_admin.exceptions import FirebaseError

logger = logging.getLogger(__name__)

class FirebaseService:
    def __init__(self):
        self.app = None
        self._initialize_firebase()
    
    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Check if Firebase is already initialized
            if firebase_admin._apps:
                self.app = firebase_admin.get_app()
                logger.info("Firebase Admin SDK already initialized")
                return
            
            # Get service account path from environment or use default
            service_account_path = os.environ.get('FIREBASE_SERVICE_ACCOUNT_PATH', 'firebase-service-account.json')
            
            # If running from back directory, look for file in current directory
            if not os.path.exists(service_account_path):
                # Try looking in the back directory
                back_dir_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'firebase-service-account.json')
                if os.path.exists(back_dir_path):
                    service_account_path = back_dir_path
            
            if not os.path.exists(service_account_path):
                logger.warning(f"Firebase service account file not found at {service_account_path}")
                return
            
            # Initialize Firebase Admin SDK
            cred = credentials.Certificate(service_account_path)
            self.app = firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin SDK initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin SDK: {e}")
            self.app = None
    
    def is_initialized(self) -> bool:
        """Check if Firebase is properly initialized"""
        return self.app is not None
    
    def verify_id_token(self, id_token: str) -> Tuple[bool, Optional[Dict[str, Any]]]:
        """
        Verify Firebase ID token
        
        Args:
            id_token: Firebase ID token from frontend
            
        Returns:
            Tuple of (success, decoded_token_data)
        """
        # Temporary: Allow test tokens for debugging
        if id_token == 'test_token':
            logger.warning("Using test token for debugging")
            return True, {
                'uid': 'WjOm29wjGNh9GYOK6pn0mrDrJDM2',
                'email': 'test@gmail.com',
                'email_verified': True
            }
        elif id_token == 'new_user_token':
            logger.warning("Using new user test token for debugging")
            return True, {
                'uid': 'new_user_123',
                'email': 'newuser@gmail.com',
                'email_verified': True
            }
        
        if not self.is_initialized():
            logger.error("Firebase Admin SDK not initialized")
            return False, None
        
        try:
            # Verify the ID token
            decoded_token = firebase_auth.verify_id_token(id_token)
            logger.info(f"Firebase token verified for user: {decoded_token.get('uid')}")
            return True, decoded_token
            
        except FirebaseError as e:
            logger.error(f"Firebase token verification failed: {e}")
            return False, None
        except Exception as e:
            logger.error(f"Unexpected error during token verification: {e}")
            return False, None
    
    def get_user_by_uid(self, uid: str) -> Tuple[bool, Optional[Dict[str, Any]]]:
        """
        Get user data from Firebase by UID
        
        Args:
            uid: Firebase user UID
            
        Returns:
            Tuple of (success, user_data)
        """
        if not self.is_initialized():
            logger.error("Firebase Admin SDK not initialized")
            return False, None
        
        try:
            # Get user from Firebase
            user_record = firebase_auth.get_user(uid)
            
            # Convert to dictionary
            user_data = {
                'uid': user_record.uid,
                'email': user_record.email,
                'display_name': user_record.display_name,
                'photo_url': user_record.photo_url,
                'email_verified': user_record.email_verified,
                'disabled': user_record.disabled,
                'created_at': user_record.user_metadata.creation_timestamp,
                'last_sign_in': user_record.user_metadata.last_sign_in_timestamp,
                'provider_data': [
                    {
                        'provider_id': provider.provider_id,
                        'uid': provider.uid,
                        'email': provider.email,
                        'display_name': provider.display_name,
                        'photo_url': provider.photo_url
                    } for provider in user_record.provider_data
                ]
            }
            
            logger.info(f"Retrieved user data for UID: {uid}")
            return True, user_data
            
        except FirebaseError as e:
            logger.error(f"Failed to get user from Firebase: {e}")
            return False, None
        except Exception as e:
            logger.error(f"Unexpected error getting user: {e}")
            return False, None
    
    def create_custom_token(self, uid: str, additional_claims: Optional[Dict[str, Any]] = None) -> Tuple[bool, Optional[str]]:
        """
        Create custom token for user
        
        Args:
            uid: Firebase user UID
            additional_claims: Additional claims to include in token
            
        Returns:
            Tuple of (success, custom_token)
        """
        if not self.is_initialized():
            logger.error("Firebase Admin SDK not initialized")
            return False, None
        
        try:
            custom_token = firebase_auth.create_custom_token(uid, additional_claims)
            logger.info(f"Created custom token for user: {uid}")
            return True, custom_token.decode('utf-8')
            
        except FirebaseError as e:
            logger.error(f"Failed to create custom token: {e}")
            return False, None
        except Exception as e:
            logger.error(f"Unexpected error creating custom token: {e}")
            return False, None
    
    def delete_user(self, uid: str) -> bool:
        """
        Delete user from Firebase
        
        Args:
            uid: Firebase user UID
            
        Returns:
            Success status
        """
        if not self.is_initialized():
            logger.error("Firebase Admin SDK not initialized")
            return False
        
        try:
            firebase_auth.delete_user(uid)
            logger.info(f"Deleted user from Firebase: {uid}")
            return True
            
        except FirebaseError as e:
            logger.error(f"Failed to delete user from Firebase: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error deleting user: {e}")
            return False

# Create singleton instance
firebase_service = FirebaseService()
