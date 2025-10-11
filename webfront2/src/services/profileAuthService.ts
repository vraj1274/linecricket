import { apiService } from './api';

export interface ProfileAuthData {
  email: string;
  profile_type: 'coach' | 'venue' | 'academy' | 'player';
  profile_data?: any;
}

export interface ProfileResponse {
  id: number;
  email: string;
  profile_type: string;
  profile_data: any;
  created_at: string;
  updated_at: string;
}

export const profileAuthService = {
  // Check if profile exists for user
  async checkProfileExists(email: string, profileType: string): Promise<boolean> {
    try {
      const response = await apiService.get(`/api/profiles/check/${email}/${profileType}`);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking profile existence:', error);
      return false;
    }
  },

  // Create new profile
  async createProfile(authData: ProfileAuthData): Promise<ProfileResponse> {
    try {
      // For academy profiles, use the profile-page endpoint
      if (authData.profile_type === 'academy') {
        const response = await apiService.createProfilePage({
          academy_name: authData.profile_data.academy_name,
          email: authData.email,
          academy_type: authData.profile_data.academy_type || 'CRICKET_ACADEMY',
          level: authData.profile_data.level || 'ALL_LEVELS',
          page_type: 'ACADEMY',
          description: authData.profile_data.description,
          tagline: authData.profile_data.tagline,
          bio: authData.profile_data.bio,
          contact_person: authData.profile_data.contact_person,
          contact_number: authData.profile_data.contact_number,
          website: authData.profile_data.website,
          address: authData.profile_data.address,
          city: authData.profile_data.city,
          state: authData.profile_data.state,
          country: authData.profile_data.country,
          pincode: authData.profile_data.pincode,
          established_year: authData.profile_data.established_year,
          accreditation: authData.profile_data.accreditation,
          coaching_staff_count: authData.profile_data.coaching_staff_count || 0,
          total_students: authData.profile_data.total_students || 0,
          instagram_handle: authData.profile_data.instagram_handle,
          facebook_handle: authData.profile_data.facebook_handle,
          youtube_handle: authData.profile_data.youtube_handle,
          is_public: authData.profile_data.is_public !== false,
          allow_messages: authData.profile_data.allow_messages !== false,
          show_contact: authData.profile_data.show_contact !== false
        });
        
        if (response.success) {
          return {
            id: response.profile_page.id,
            email: authData.email,
            profile_type: authData.profile_type,
            profile_data: authData.profile_data,
            created_at: response.profile_page.created_at,
            updated_at: response.profile_page.created_at
          };
        } else {
          throw new Error(response.error || 'Failed to create profile');
        }
      } else {
        // For other profile types, use the original endpoint
        const response = await apiService.post('/api/profiles/create', authData);
        if (response.data.success) {
          return response.data.profile;
        } else {
          throw new Error(response.data.error || 'Failed to create profile');
        }
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  },

  // Get profile by email and type
  async getProfile(email: string, profileType: string): Promise<ProfileResponse | null> {
    try {
      const response = await apiService.get(`/api/profiles/${email}/${profileType}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  // Update profile data
  async updateProfile(profileId: number, profileData: any): Promise<ProfileResponse> {
    try {
      const response = await apiService.put(`/api/profiles/${profileId}`, profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Delete profile
  async deleteProfile(profileId: number): Promise<void> {
    try {
      await apiService.delete(`/api/profiles/${profileId}`);
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  },

  // Get all profiles for a user
  async getUserProfiles(email: string): Promise<ProfileResponse[]> {
    try {
      const response = await apiService.get(`/api/profiles/user/${email}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profiles:', error);
      return [];
    }
  }
};
