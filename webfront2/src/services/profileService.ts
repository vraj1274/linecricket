import { apiService } from './api';

export interface ProfileData {
  id: number;
  type: 'player' | 'coach' | 'venue' | 'academy' | 'community';
  name: string;
  username: string;
  avatar: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  firebaseUid: string;
  // Profile-specific data
  profileData: any;
}

export interface CoachProfileData {
  name: string;
  specialization: string;
  experience: string;
  rating: number;
  students: number;
  sessions: number;
  achievements: string[];
  specializations: string[];
  programs: Array<{
    name: string;
    duration: string;
    price: string;
  }>;
  availability: {
    today: string;
    tomorrow: string;
    weekend: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  stats: {
    successRate: number;
    studentsPlaced: number;
    yearsExperience: number;
  };
}

export interface VenueProfileData {
  name: string;
  type: string;
  location: string;
  established: string;
  rating: number;
  capacity: number;
  matches: number;
  facilities: string[];
  amenities: string[];
  pricing: Array<{
    type: string;
    duration: string;
    price: string;
  }>;
  achievements: string[];
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  availability: {
    today: string;
    tomorrow: string;
    weekend: string;
  };
}

export interface AcademyProfileData {
  name: string;
  type: string;
  location: string;
  established: string;
  rating: number;
  students: number;
  coaches: number;
  programs: Array<{
    name: string;
    duration: string;
    price: string;
  }>;
  facilities: string[];
  achievements: string[];
  contact: {
    phone: string;
    email: string;
    website: string;
  };
}

export interface PlayerProfileData {
  name: string;
  role: string;
  battingStyle: string;
  bowlingStyle: string;
  experience: string;
  rating: number;
  matches: number;
  runs: number;
  wickets: number;
  achievements: string[];
  stats: {
    battingAverage: number;
    bowlingAverage: number;
    strikeRate: number;
  };
  contact: {
    phone: string;
    email: string;
    location: string;
  };
}

export class ProfileService {
  /**
   * Fetch profile data by ID and type
   */
  static async getProfileData(profileId: number, profileType: string): Promise<any> {
    try {
      const response = await apiService.get(`/profiles/${profileId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching profile data:', error);
      throw error;
    }
  }

  /**
   * Fetch coach profile data
   */
  static async getCoachProfile(profileId: number): Promise<CoachProfileData> {
    try {
      const response = await apiService.get(`/profiles/coach/${profileId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching coach profile:', error);
      throw error;
    }
  }

  /**
   * Fetch venue profile data
   */
  static async getVenueProfile(profileId: number): Promise<VenueProfileData> {
    try {
      const response = await apiService.get(`/profiles/venue/${profileId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching venue profile:', error);
      throw error;
    }
  }

  /**
   * Fetch academy profile data
   */
  static async getAcademyProfile(profileId: number): Promise<AcademyProfileData> {
    try {
      const response = await apiService.get(`/profiles/academy/${profileId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching academy profile:', error);
      throw error;
    }
  }

  /**
   * Fetch player profile data
   */
  static async getPlayerProfile(profileId: number): Promise<PlayerProfileData> {
    try {
      const response = await apiService.get(`/profiles/player/${profileId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching player profile:', error);
      throw error;
    }
  }

  /**
   * Update profile data
   */
  static async updateProfile(profileId: number, profileType: string, data: any): Promise<any> {
    try {
      const response = await apiService.put(`/profiles/${profileType}/${profileId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Delete profile
   */
  static async deleteProfile(profileId: number): Promise<void> {
    try {
      await apiService.delete(`/profiles/${profileId}`);
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  }
}
