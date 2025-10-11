import { API_BASE_URL } from '../config/api';

export interface AcademyProfile {
  page_id: string;
  academy_name: string;
  tagline?: string;
  description?: string;
  bio?: string;
  contact_person?: string;
  contact_number?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  academy_type: string;
  level: string;
  established_year?: number;
  accreditation?: string;
  logo_url?: string;
  banner_image_url?: string;
  facilities: string[];
  services_offered: string[];
  equipment_provided: boolean;
  coaching_staff_count: number;
  programs_offered: string[];
  age_groups?: string;
  batch_timings: Array<{day: string; time: string}>;
  fees_structure: {[key: string]: number};
  instagram_handle?: string;
  facebook_handle?: string;
  twitter_handle?: string;
  youtube_handle?: string;
  is_public: boolean;
  allow_messages: boolean;
  show_contact: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAcademyRequest {
  academy_name: string;
  tagline?: string;
  description?: string;
  bio?: string;
  contact_person?: string;
  contact_number?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  academy_type: string;
  level: string;
  established_year?: number;
  accreditation?: string;
  logo_url?: string;
  banner_image_url?: string;
  facilities?: string[];
  services_offered?: string[];
  equipment_provided?: boolean;
  coaching_staff_count?: number;
  programs_offered?: string[];
  age_groups?: string;
  batch_timings?: Array<{day: string; time: string}>;
  fees_structure?: {[key: string]: number};
  instagram_handle?: string;
  facebook_handle?: string;
  twitter_handle?: string;
  youtube_handle?: string;
  is_public?: boolean;
  allow_messages?: boolean;
  show_contact?: boolean;
  firebase_uid?: string;
  page_type: string;
}

export interface AcademyListResponse {
  success: boolean;
  profile_pages: AcademyProfile[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface AcademyResponse {
  success: boolean;
  profile_page: AcademyProfile;
  message?: string;
  error?: string;
}

export const academyService = {
  // Create a new academy profile
  async createAcademy(data: CreateAcademyRequest): Promise<AcademyResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create academy: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating academy:', error);
      throw error;
    }
  },

  // Get academy profile by ID
  async getAcademy(pageId: string): Promise<AcademyResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/${pageId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to get academy: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting academy:', error);
      throw error;
    }
  },

  // Get academy profile by user ID
  async getAcademyByUser(userId: number): Promise<AcademyResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile-page/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to get academy: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting academy by user:', error);
      throw error;
    }
  },

  // Update academy profile
  async updateAcademy(pageId: string, data: Partial<CreateAcademyRequest>): Promise<AcademyResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update academy: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating academy:', error);
      throw error;
    }
  },

  // Delete academy profile
  async deleteAcademy(pageId: string): Promise<{success: boolean; message: string}> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/${pageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete academy: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting academy:', error);
      throw error;
    }
  },

  // List all academy profiles with filters
  async listAcademies(params: {
    page?: number;
    per_page?: number;
    search?: string;
    academy_type?: string;
    level?: string;
    page_type?: string;
    city?: string;
    state?: string;
    country?: string;
  } = {}): Promise<AcademyListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.per_page) queryParams.append('per_page', params.per_page.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.academy_type) queryParams.append('academy_type', params.academy_type);
      if (params.level) queryParams.append('level', params.level);
      if (params.page_type) queryParams.append('page_type', params.page_type);
      if (params.city) queryParams.append('city', params.city);
      if (params.state) queryParams.append('state', params.state);
      if (params.country) queryParams.append('country', params.country);

      const response = await fetch(`${API_BASE_URL}/api/profile-pages?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to list academies: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error listing academies:', error);
      throw error;
    }
  },

  // Search academies by location
  async searchByLocation(params: {
    city?: string;
    state?: string;
    country?: string;
  }): Promise<{profile_pages: AcademyProfile[]}> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.city) queryParams.append('city', params.city);
      if (params.state) queryParams.append('state', params.state);
      if (params.country) queryParams.append('country', params.country);

      const response = await fetch(`${API_BASE_URL}/api/profile-pages/search/location?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to search academies: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error searching academies:', error);
      throw error;
    }
  },

  // Get academy statistics
  async getAcademyStats(pageId: string): Promise<{
    academy_profile: AcademyProfile;
    statistics: {
      total_programs: number;
      active_programs: number;
      total_students: number;
      active_students: number;
      students_by_level: {[key: string]: number};
    };
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/academy/${pageId}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to get academy stats: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting academy stats:', error);
      throw error;
    }
  }
};
