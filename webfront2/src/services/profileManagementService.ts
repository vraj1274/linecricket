import { API_BASE_URL } from '../config/api';

export interface ProfileData {
  id: string;
  type: 'player' | 'coach' | 'venue' | 'academy' | 'community';
  name: string;
  username: string;
  avatar: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  profileData?: any;
}

export interface CreateProfileRequest {
  profile_type: string;
  email: string;
  name: string;
  [key: string]: any;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  profile?: any;
  error?: string;
}

export const profileManagementService = {
  // Create a new profile
  async createProfile(profileData: CreateProfileRequest): Promise<ProfileResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create profile: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  },

  // Get all profiles for a user
  async getUserProfiles(email: string): Promise<ProfileData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/user/${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user profiles: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.profiles) {
        // Transform backend profiles to frontend format
        return result.profiles.map((profile: any) => ({
          id: profile.id || profile.profile_id,
          type: profile.type || profile.profile_type,
          name: this.getProfileName(profile.type || profile.profile_type, profile),
          username: this.getProfileUsername(profile.type || profile.profile_type, profile),
          avatar: this.getProfileAvatar(profile.type || profile.profile_type),
          color: this.getProfileColor(profile.type || profile.profile_type),
          isActive: false,
          createdAt: profile.created_at || new Date().toISOString(),
          profileData: profile
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching user profiles:', error);
      return [];
    }
  },

  // Update profile
  async updateProfile(profileId: string, profileType: string, data: any): Promise<ProfileResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/${profileId}?profile_type=${profileType}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Delete profile
  async deleteProfile(profileId: string, profileType: string): Promise<ProfileResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/${profileId}?profile_type=${profileType}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete profile: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  },

  // Helper methods for profile formatting
  getProfileName(profileType: string, profile: any): string {
    switch (profileType) {
      case 'player':
        return profile.display_name || profile.name || 'Anonymous Player';
      case 'coach':
        return profile.name || 'Anonymous Coach';
      case 'venue':
        return profile.venue_name || profile.name || 'Anonymous Venue';
      case 'academy':
        return profile.academy_name || profile.name || 'Anonymous Academy';
      case 'community':
        return profile.community_name || profile.name || 'Anonymous Community';
      default:
        return profile.name || 'Anonymous Profile';
    }
  },

  getProfileUsername(profileType: string, profile: any): string {
    const name = this.getProfileName(profileType, profile);
    return `@${name.toLowerCase().replace(/\s+/g, '_')}_${profileType}`;
  },

  getProfileAvatar(profileType: string): string {
    // Return appropriate avatar based on profile type
    const avatars = {
      player: '🏏',
      coach: '👨‍🏫',
      venue: '🏟️',
      academy: '🎓',
      community: '👥'
    };
    return avatars[profileType as keyof typeof avatars] || '👤';
  },

  getProfileColor(profileType: string): string {
    const colors = {
      player: '#2e4b5f, #1a5f3f',
      coach: '#e85e20, #d14a0f',
      venue: '#4a6b7f, #2e4b5f',
      academy: '#1a5f3f, #0f3d2a',
      community: '#6b7280, #4b5563'
    };
    return colors[profileType as keyof typeof colors] || '#6b7280, #4b5563';
  }
};
