import { apiService } from './api';

export interface ProfileStats {
  posts: {
    total_posts: number;
    total_likes: number;
    total_comments: number;
    total_shares: number;
    total_views: number;
    average_engagement: number;
  };
  jobs: {
    total_jobs_posted: number;
    total_job_views: number;
    total_job_applications: number;
    average_applications_per_job: number;
  };
  applications: {
    total_applications: number;
  };
}

export interface Post {
  id: number;
  content: string;
  image_url?: string;
  image_caption?: string;
  location?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  bookmarks_count: number;
  views_count: number;
  post_type: string;
  visibility: string;
  created_at: string;
  updated_at: string;
  author: {
    id: number;
    username: string;
    profile?: any;
  };
  engagement_stats: {
    likes: number;
    comments: number;
    shares: number;
    bookmarks: number;
    views: number;
    engagement_score: number;
  };
  is_liked: boolean;
  is_bookmarked: boolean;
  is_shared: boolean;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  job_type: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  salary_period: string;
  salary_range: string;
  posted_by: number;
  is_active: boolean;
  is_featured: boolean;
  application_deadline?: string;
  views_count: number;
  applications_count: number;
  bookmarks_count: number;
  skills_required: string[];
  experience_level: string;
  education_required?: string;
  city?: string;
  state?: string;
  country?: string;
  is_remote: boolean;
  is_hybrid: boolean;
  contact_email?: string;
  contact_phone?: string;
  application_url?: string;
  created_at: string;
  updated_at: string;
  poster: {
    id: number;
    username: string;
    profile?: any;
  };
}

export interface JobApplication {
  id: number;
  job_id: number;
  applicant_id: number;
  cover_letter?: string;
  resume_url?: string;
  portfolio_url?: string;
  status: string;
  expected_salary?: number;
  availability_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  applicant: {
    id: number;
    username: string;
    profile?: any;
  };
}

export interface CreatePostData {
  content: string;
  image_url?: string;
  image_caption?: string;
  location?: string;
  post_type?: string;
  visibility?: string;
}

export interface CreateJobData {
  title: string;
  company: string;
  location: string;
  job_type: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  salary_period?: string;
  skills_required?: string[];
  experience_level?: string;
  education_required?: string;
  city?: string;
  state?: string;
  country?: string;
  is_remote?: boolean;
  is_hybrid?: boolean;
  contact_email?: string;
  contact_phone?: string;
  application_url?: string;
  application_deadline?: string;
}

export interface CreateApplicationData {
  job_id: number;
  cover_letter?: string;
  resume_url?: string;
  portfolio_url?: string;
  expected_salary?: number;
  availability_date?: string;
  notes?: string;
}

export interface UpdatePostData {
  content?: string;
  image_url?: string;
  image_caption?: string;
  location?: string;
  visibility?: string;
}

export interface UpdateJobData {
  title?: string;
  company?: string;
  location?: string;
  job_type?: string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  salary_period?: string;
  skills_required?: string[];
  experience_level?: string;
  education_required?: string;
  city?: string;
  state?: string;
  country?: string;
  is_remote?: boolean;
  is_hybrid?: boolean;
  contact_email?: string;
  contact_phone?: string;
  application_url?: string;
  application_deadline?: string;
  is_active?: boolean;
}

export interface PaginationInfo {
  page: number;
  pages: number;
  per_page: number;
  total: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ProfilePageResponse {
  success: boolean;
  profile?: {
    user: any;
    profile: any;
    stats: {
      posts_count: number;
      jobs_posted_count: number;
      applications_count: number;
      followers_count: number;
      following_count: number;
    };
    recent_posts: Post[];
    recent_jobs: Job[];
    recent_applications: JobApplication[];
  };
  error?: string;
}

export interface PostsResponse {
  success: boolean;
  posts?: Post[];
  pagination?: PaginationInfo;
  error?: string;
}

export interface JobsResponse {
  success: boolean;
  jobs?: Job[];
  pagination?: PaginationInfo;
  error?: string;
}

export interface ApplicationsResponse {
  success: boolean;
  applications?: JobApplication[];
  pagination?: PaginationInfo;
  error?: string;
}

export interface StatsResponse {
  success: boolean;
  stats?: ProfileStats;
  error?: string;
}

class ProfilePageService {
  private baseUrl = '/api/profile-page';

  // Get my profile with all data
  async getMyProfile(): Promise<ProfilePageResponse> {
    try {
      const response = await apiService.get(`${this.baseUrl}/my-profile`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting my profile:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get profile data'
      };
    }
  }

  // Get user's posts
  async getUserPosts(page: number = 1, perPage: number = 20): Promise<PostsResponse> {
    try {
      const response = await apiService.get(`${this.baseUrl}/posts?page=${page}&per_page=${perPage}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting user posts:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get posts'
      };
    }
  }

  // Create a new post
  async createPost(data: CreatePostData): Promise<{ success: boolean; post?: Post; error?: string }> {
    try {
      const response = await apiService.post(`${this.baseUrl}/posts`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating post:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create post'
      };
    }
  }

  // Update a post
  async updatePost(postId: number, data: UpdatePostData): Promise<{ success: boolean; post?: Post; error?: string }> {
    try {
      const response = await apiService.put(`${this.baseUrl}/posts/${postId}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating post:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update post'
      };
    }
  }

  // Delete a post
  async deletePost(postId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiService.delete(`${this.baseUrl}/posts/${postId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting post:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete post'
      };
    }
  }

  // Get user's jobs
  async getUserJobs(page: number = 1, perPage: number = 20): Promise<JobsResponse> {
    try {
      const response = await apiService.get(`${this.baseUrl}/jobs?page=${page}&per_page=${perPage}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting user jobs:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get jobs'
      };
    }
  }

  // Create a new job
  async createJob(data: CreateJobData): Promise<{ success: boolean; job?: Job; error?: string }> {
    try {
      const response = await apiService.post(`${this.baseUrl}/jobs`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating job:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create job'
      };
    }
  }

  // Update a job
  async updateJob(jobId: number, data: UpdateJobData): Promise<{ success: boolean; job?: Job; error?: string }> {
    try {
      const response = await apiService.put(`${this.baseUrl}/jobs/${jobId}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating job:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update job'
      };
    }
  }

  // Delete a job
  async deleteJob(jobId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiService.delete(`${this.baseUrl}/jobs/${jobId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting job:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete job'
      };
    }
  }

  // Get user's applications
  async getUserApplications(page: number = 1, perPage: number = 20): Promise<ApplicationsResponse> {
    try {
      const response = await apiService.get(`${this.baseUrl}/applications?page=${page}&per_page=${perPage}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting user applications:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get applications'
      };
    }
  }

  // Apply for a job
  async createApplication(data: CreateApplicationData): Promise<{ success: boolean; application?: JobApplication; error?: string }> {
    try {
      const response = await apiService.post(`${this.baseUrl}/applications`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating application:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create application'
      };
    }
  }

  // Get profile members (for organization profiles)
  async getProfileMembers(): Promise<{ success: boolean; members?: any[]; error?: string }> {
    try {
      const response = await apiService.get(`${this.baseUrl}/members`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting profile members:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get members'
      };
    }
  }

  // Add member (for organization profiles)
  async addMember(data: any): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiService.post(`${this.baseUrl}/members`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error adding member:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to add member'
      };
    }
  }

  // Get profile statistics
  async getProfileStats(): Promise<StatsResponse> {
    try {
      const response = await apiService.get(`${this.baseUrl}/stats`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting profile stats:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get profile stats'
      };
    }
  }
}

export const profilePageService = new ProfilePageService();
