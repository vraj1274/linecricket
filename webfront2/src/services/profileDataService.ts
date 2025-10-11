// Profile Data Service - Fetches profile data from database
export interface ProfileData {
  id: number;
  profile_type: string;
  firebase_uid: string;
  email: string;
  profile_data: any;
  created_at: string;
  updated_at: string;
}

export interface AcademyProfileData {
  id: number;
  account_id: number;
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
  latitude?: number;
  longitude?: number;
  academy_type: string;
  level: string;
  established_year?: number;
  accreditation?: string;
  logo_url?: string;
  banner_image_url?: string;
  gallery_images?: string[];
  facilities?: string[];
  services_offered?: string[];
  equipment_provided: boolean;
  coaching_staff_count: number;
  programs_offered?: string[];
  age_groups?: string;
  batch_timings?: any;
  fees_structure?: any;
  instagram_handle?: string;
  facebook_handle?: string;
  twitter_handle?: string;
  youtube_handle?: string;
  total_students: number;
  successful_placements: number;
  achievements?: string[];
  testimonials?: string[];
  is_public: boolean;
  allow_messages: boolean;
  show_contact: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoachProfileData {
  id: number;
  user_id: number;
  name: string;
  specialization: string;
  experience: string;
  level: string;
  bio?: string;
  location?: string;
  phone?: string;
  email?: string;
  website?: string;
  coaching_style?: string;
  preferred_age_groups?: string;
  coaching_methods?: string;
  certifications?: string;
  achievements?: string;
  former_teams?: string;
  availability?: string;
  hourly_rate?: number;
  session_duration?: number;
  group_sessions: boolean;
  online_sessions: boolean;
  social_media?: string;
  contact_preferences?: string;
  total_students: number;
  successful_placements: number;
  years_experience: number;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  is_active: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface VenueProfileData {
  id: number;
  account_id: number;
  venue_name: string;
  tagline?: string;
  description?: string;
  contact_person?: string;
  contact_number?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  venue_type: string;
  ground_type: string;
  established_year?: number;
  capacity?: number;
  ground_length?: number;
  ground_width?: number;
  pitch_count: number;
  net_count: number;
  floodlights: boolean;
  covered_area: boolean;
  logo_url?: string;
  banner_image_url?: string;
  gallery_images?: string[];
  virtual_tour_url?: string;
  facilities?: string[];
  amenities?: string[];
  parking_available: boolean;
  parking_capacity: number;
  changing_rooms: boolean;
  refreshment_facility: boolean;
  booking_contact?: string;
  booking_email?: string;
  advance_booking_days: number;
  cancellation_policy?: string;
  hourly_rate?: number;
  daily_rate?: number;
  monthly_rate?: number;
  equipment_rental: boolean;
  equipment_rates?: any;
  operating_hours?: any;
  is_24_7: boolean;
  seasonal_availability?: any;
  instagram_handle?: string;
  facebook_handle?: string;
  twitter_handle?: string;
  total_bookings: number;
  average_rating: number;
  total_reviews: number;
  reviews?: any[];
  is_public: boolean;
  allow_messages: boolean;
  show_contact: boolean;
  is_verified: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// API endpoints for fetching profile data
import { API_BASE_URL } from '../config/api';

export const profileDataService = {
  // Fetch academy profile data
  async getAcademyProfile(profileId: number): Promise<AcademyProfileData> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/academy/${profileId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch academy profile: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching academy profile:', error);
      throw error;
    }
  },

  // Fetch coach profile data
  async getCoachProfile(profileId: number): Promise<CoachProfileData> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/coach/${profileId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch coach profile: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching coach profile:', error);
      throw error;
    }
  },

  // Fetch venue profile data
  async getVenueProfile(profileId: number): Promise<VenueProfileData> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/venue/${profileId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch venue profile: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching venue profile:', error);
      throw error;
    }
  },

  // Fetch profile by type and ID
  async getProfileByType(profileType: string, profileId: number): Promise<any> {
    switch (profileType) {
      case 'academy':
        return this.getAcademyProfile(profileId);
      case 'coach':
        return this.getCoachProfile(profileId);
      case 'venue':
        return this.getVenueProfile(profileId);
      default:
        throw new Error(`Unknown profile type: ${profileType}`);
    }
  },

  // Get profile statistics
  async getProfileStats(profileType: string, profileId: number): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/${profileType}/${profileId}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profile stats: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching profile stats:', error);
      throw error;
    }
  }
};
