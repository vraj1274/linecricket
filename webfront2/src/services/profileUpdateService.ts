import { API_BASE_URL } from '../config/api';

export interface ProfileUpdateData {
  [key: string]: any;
}

export interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  profile?: any;
  error?: string;
}

export const profileUpdateService = {
  // Update player profile
  async updatePlayerProfile(profileId: string, data: ProfileUpdateData): Promise<ProfileUpdateResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/${profileId}?profile_type=player`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to update player profile: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating player profile:', error);
      throw error;
    }
  },

  // Update coach profile
  async updateCoachProfile(profileId: string, data: ProfileUpdateData): Promise<ProfileUpdateResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/${profileId}?profile_type=coach`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to update coach profile: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating coach profile:', error);
      throw error;
    }
  },

  // Update venue profile
  async updateVenueProfile(profileId: string, data: ProfileUpdateData): Promise<ProfileUpdateResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/${profileId}?profile_type=venue`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to update venue profile: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating venue profile:', error);
      throw error;
    }
  },

  // Update academy profile
  async updateAcademyProfile(profileId: string, data: ProfileUpdateData): Promise<ProfileUpdateResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/${profileId}?profile_type=academy`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to update academy profile: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating academy profile:', error);
      throw error;
    }
  },

  // Update community profile
  async updateCommunityProfile(profileId: string, data: ProfileUpdateData): Promise<ProfileUpdateResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/${profileId}?profile_type=community`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to update community profile: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating community profile:', error);
      throw error;
    }
  },

  // Generic update method
  async updateProfile(profileType: string, profileId: string, data: ProfileUpdateData): Promise<ProfileUpdateResponse> {
    switch (profileType) {
      case 'player':
        return this.updatePlayerProfile(profileId, data);
      case 'coach':
        return this.updateCoachProfile(profileId, data);
      case 'venue':
        return this.updateVenueProfile(profileId, data);
      case 'academy':
        return this.updateAcademyProfile(profileId, data);
      case 'community':
        return this.updateCommunityProfile(profileId, data);
      default:
        throw new Error(`Unknown profile type: ${profileType}`);
    }
  }
};
