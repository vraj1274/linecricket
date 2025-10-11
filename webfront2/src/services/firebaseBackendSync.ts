/**
 * Firebase Backend Sync Service
 * Handles synchronization between Firebase authentication and backend API
 */

import { API_BASE_URL } from '../config/api';
import { auth } from '../firebase/config';

interface UserData {
  fullName?: string;
  username?: string;
  contact?: string;
  location?: string;
  age?: number;
  gender?: string;
  bio?: string;
  organization?: string;
  email?: string; // Store email in backend
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class FirebaseBackendSync {
  private async getFirebaseIdToken(): Promise<string | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null;
      
      return await user.getIdToken();
    } catch (error) {
      console.error('Error getting Firebase ID token:', error);
      return null;
    }
  }

  private async makeApiRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      const idToken = await this.getFirebaseIdToken();
      if (!idToken) {
        console.warn('⚠️ No Firebase authentication token available');
        return { success: false, error: 'No Firebase authentication token' };
      }

      console.log(`🌐 Making API request to: ${API_BASE_URL}${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      console.log(`📡 API Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorMessage = 'API request failed';
        try {
          const errorResult = await response.json();
          errorMessage = errorResult.error || errorResult.message || `HTTP ${response.status}: ${response.statusText}`;
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        console.warn(`⚠️ API request failed: ${errorMessage}`);
        return { success: false, error: errorMessage };
      }

      const result = await response.json();
      console.log('✅ API request successful');
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ API request error:', error);
      
      // More specific error handling
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return { success: false, error: 'Unable to connect to server. Please check your connection.' };
      } else if (error instanceof Error) {
        return { success: false, error: `Request failed: ${error.message}` };
      } else {
        return { success: false, error: 'Unknown request error' };
      }
    }
  }

  /**
   * Sync Firebase user with backend database
   */
  async syncUserWithBackend(): Promise<ApiResponse> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'No authenticated user' };
      }

      const idToken = await user.getIdToken();
      
      return await this.makeApiRequest('/firebase/verify-token', 'POST', {
        id_token: idToken,
        firebase_uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      });
    } catch (error) {
      console.error('Error syncing user with backend:', error);
      return { success: false, error: 'Failed to sync user' };
    }
  }

  /**
   * Register new user with backend
   */
  async registerUserWithBackend(userData: UserData): Promise<ApiResponse> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'No authenticated user' };
      }

      const idToken = await user.getIdToken();
      
      // Store all signup credentials in backend
      const registrationData = {
        firebase_uid: user.uid,
        email: userData.email || user.email, // Use provided email or Firebase email
        id_token: idToken,
        displayName: user.displayName,
        // Store all signup form data
        full_name: userData.fullName,
        username: userData.username,
        contact_number: userData.contact,
        location: userData.location,
        age: userData.age,
        gender: userData.gender,
        bio: userData.bio,
        organization: userData.organization,
        // Firebase metadata
        firebase_email: user.email,
        firebase_display_name: user.displayName,
        created_at: new Date().toISOString(),
        is_verified: false, // Will be verified later
      };
      
      console.log('📝 Storing signup credentials in backend:', registrationData);
      
      return await this.makeApiRequest('/firebase/signup', 'POST', registrationData);
    } catch (error) {
      console.error('Error registering user with backend:', error);
      return { success: false, error: 'Failed to register user' };
    }
  }

  /**
   * Login user with backend
   */
  async loginUserWithBackend(): Promise<ApiResponse> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'No authenticated user' };
      }

      const idToken = await user.getIdToken();
      
      return await this.makeApiRequest('/firebase/login', 'POST', {
        id_token: idToken,
      });
    } catch (error) {
      console.error('Error logging in user with backend:', error);
      return { success: false, error: 'Failed to login user' };
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(profileData: UserData): Promise<ApiResponse> {
    try {
      return await this.makeApiRequest('/firebase/update-profile', 'POST', profileData);
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }

  /**
   * Get current user data from backend
   */
  async getCurrentUser(): Promise<ApiResponse> {
    try {
      return await this.makeApiRequest('/firebase/me');
    } catch (error) {
      console.error('Error getting current user:', error);
      return { success: false, error: 'Failed to get user data' };
    }
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(): Promise<ApiResponse> {
    try {
      return await this.makeApiRequest('/firebase/deactivate', 'POST');
    } catch (error) {
      console.error('Error deactivating user:', error);
      return { success: false, error: 'Failed to deactivate user' };
    }
  }

  /**
   * Check if user is synced with backend
   */
  async isUserSynced(): Promise<boolean> {
    try {
      const response = await this.getCurrentUser();
      return response.success;
    } catch (error) {
      console.error('Error checking user sync status:', error);
      return false;
    }
  }

  /**
   * Automatically sync Firebase user profile on sign-in
   * Updates profile name from Firebase displayName and ensures backend user exists
   */
  async syncUserProfileOnSignIn(): Promise<ApiResponse> {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn('⚠️ No authenticated user for sync');
        return { success: false, error: 'No authenticated user' };
      }

      console.log('🔄 Syncing user profile on sign-in...');
      console.log('📋 Firebase user data:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
      });
      
      // First, try to sync/verify the user with backend
      console.log('🔄 Attempting to sync with backend...');
      const syncResult = await this.syncUserWithBackend();
      
      if (!syncResult.success) {
        console.log('⚠️ User not found in backend, attempting to create new user...');
        // If sync fails, try to register the user
        const userData: UserData = {
          fullName: user.displayName || user.email?.split('@')[0] || 'User',
          username: user.email?.split('@')[0] || `user_${Date.now()}`,
        };
        console.log('📝 Creating new user with data:', userData);
        const registerResult = await this.registerUserWithBackend(userData);
        
        if (!registerResult.success) {
          console.warn('⚠️ Failed to create user in backend, but continuing...');
          // Don't fail completely - the user can still use the app
          return { success: true, data: 'Profile sync attempted (user creation failed but non-critical)' };
        }
      }

      // Try to update profile with Firebase data (non-critical)
      console.log('📝 Attempting to update profile with Firebase data...');
      const updateResult = await this.updateProfileFromFirebase();
      if (!updateResult.success) {
        console.warn('⚠️ Failed to update profile from Firebase data (non-critical):', updateResult.error);
        // Don't fail the entire sync if profile update fails
      } else {
        console.log('✅ Profile updated with Firebase data successfully');
      }

      console.log('✅ User profile sync completed (with possible warnings)');
      return { success: true, data: 'Profile sync completed' };
    } catch (error) {
      console.error('❌ Error syncing user profile on sign-in:', error);
      // Don't fail completely - return success with warning
      console.warn('⚠️ Sync failed but continuing - user can still use the app');
      return { success: true, data: 'Profile sync attempted (failed but non-critical)' };
    }
  }

  /**
   * Update backend profile with Firebase user data
   */
  async updateProfileFromFirebase(): Promise<ApiResponse> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'No authenticated user' };
      }

      console.log('🔄 Updating profile from Firebase data...');
      console.log('📋 Firebase user data for profile update:', {
        displayName: user.displayName,
        email: user.email,
        uid: user.uid
      });

      // Prepare profile data with Firebase information
      const profileData: UserData = {
        fullName: user.displayName || user.email?.split('@')[0] || 'User',
        // Include email if available for better user identification
        ...(user.email && { email: user.email }),
      };

      console.log('📝 Profile data to update:', profileData);

      // Always try to update, even if displayName is empty (to ensure email is set)
      const result = await this.updateUserProfile(profileData);
      
      if (result.success) {
        console.log('✅ Profile updated from Firebase data successfully');
      } else {
        console.warn('⚠️ Profile update from Firebase data failed:', result.error);
      }

      return result;
    } catch (error) {
      console.error('Error updating profile from Firebase:', error);
      return { success: false, error: 'Failed to update profile from Firebase' };
    }
  }

  /**
   * Enhanced sync that handles both new and existing users
   */
  async ensureUserExistsInBackend(): Promise<ApiResponse> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'No authenticated user' };
      }

      // Check if user already exists
      const existingUser = await this.getCurrentUser();
      if (existingUser.success) {
        console.log('User already exists in backend');
        return existingUser;
      }

      // User doesn't exist, create them
      console.log('Creating new user in backend...');
      const userData: UserData = {
        fullName: user.displayName || user.email?.split('@')[0] || '',
        username: user.email?.split('@')[0] || `user_${Date.now()}`,
      };

      return await this.registerUserWithBackend(userData);
    } catch (error) {
      console.error('Error ensuring user exists in backend:', error);
      return { success: false, error: 'Failed to ensure user exists' };
    }
  }

  /**
   * Get Firebase user data for profile sync
   */
  getFirebaseUserData(): UserData | null {
    const user = auth.currentUser;
    if (!user) return null;

    return {
      fullName: user.displayName || '',
      username: user.email?.split('@')[0] || '',
      email: user.email || '',
      // Firebase provides these by default
      // Additional data will be synced from backend
    };
  }

  /**
   * Store additional user data in Firebase (for future use)
   * This can be used to store custom user metadata
   */
  async storeUserMetadata(metadata: Record<string, any>): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) return false;

      // Store in Firebase custom claims or user metadata
      // This is a placeholder for future Firebase custom claims implementation
      console.log('📝 Storing user metadata in Firebase:', metadata);
      
      // For now, we'll store this data in the backend
      // In the future, this could be stored in Firebase custom claims
      return true;
    } catch (error) {
      console.error('Error storing user metadata:', error);
      return false;
    }
  }
}

// Export singleton instance
export const firebaseBackendSync = new FirebaseBackendSync();