import { API_BASE_URL } from '../config/api';

export interface ProfileSwitchRequest {
  email: string;
  profile_id: string;
  profile_type: string;
}

export interface ProfileSwitchResponse {
  success: boolean;
  message?: string;
  active_profile?: {
    id: string;
    type: string;
    name: string;
    data: any;
  };
  error?: string;
}

export interface UserProfile {
  id: string;
  type: 'player' | 'coach' | 'venue' | 'academy' | 'community';
  name: string;
  username: string;
  avatar: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  data: any;
}

export interface ProfileListResponse {
  success: boolean;
  profiles: UserProfile[];
  count: number;
  error?: string;
}

export const profileSwitchService = {
  // Switch to a different profile
  async switchProfile(request: ProfileSwitchRequest): Promise<ProfileSwitchResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/switch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to switch profile: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error switching profile:', error);
      throw error;
    }
  },

  // Get the currently active profile for a user
  async getActiveProfile(email: string): Promise<ProfileSwitchResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/active/${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get active profile: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting active profile:', error);
      throw error;
    }
  },

  // Get all profiles for a user
  async getUserProfiles(email: string): Promise<ProfileListResponse> {
    try {
      // First get regular profiles
      const profilesResponse = await fetch(`${API_BASE_URL}/api/profiles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      let profiles: any[] = [];
      if (profilesResponse.ok) {
        const profilesResult = await profilesResponse.json();
        if (profilesResult.profiles) {
          profiles = profilesResult.profiles;
        }
      }

      // Note: Academy profiles are now included in the main /api/profiles endpoint
      // No need for separate academy API call

      // Transform all profiles to match the expected format
      const transformedProfiles = profiles.map((profile: any) => ({
        id: profile.id.toString(),
        type: profile.type || 'academy',
        name: profile.name || 'New Profile',
        username: profile.username || `@${(profile.name || 'new_profile').toLowerCase().replace(/\s+/g, '_')}`,
        avatar: (profile.name || 'NP').charAt(0).toUpperCase(),
        color: profile.color || this.getProfileColor(profile.type || 'academy'),
        isActive: profile.isActive || false,
        createdAt: profile.createdAt || new Date().toISOString(),
        data: profile
      }));
      
      return {
        success: true,
        profiles: transformedProfiles,
        count: transformedProfiles.length
      };
    } catch (error) {
      console.error('Error getting user profiles:', error);
      throw error;
    }
  },

  // Helper method to get profile color based on type
  getProfileColor(profileType: string): string {
    switch (profileType) {
      case 'player':
        return 'linear-gradient(to bottom right, #5D798E, #2E4B5F)';
      case 'coach':
        return 'linear-gradient(to bottom right, #3B82F6, #1D4ED8)';
      case 'academy':
        return 'linear-gradient(to bottom right, #8B5CF6, #7C3AED)';
      case 'venue':
        return 'linear-gradient(to bottom right, #10B981, #059669)';
      case 'community':
        return 'linear-gradient(to bottom right, #6366F1, #4F46E5)';
      default:
        return 'linear-gradient(to bottom right, #6B7280, #4B5563)';
    }
  },

  // Helper method to format profile for frontend
  formatProfileForFrontend(profile: any): UserProfile {
    return {
      id: profile.id,
      type: profile.type,
      name: profile.name,
      username: profile.username,
      avatar: profile.avatar,
      color: profile.color,
      isActive: profile.isActive || false,
      createdAt: profile.createdAt,
      data: profile.data || {}
    };
  }
};
