/**
 * Search Service for PostgreSQL Database Integration
 * Provides advanced search functionality with PostgreSQL full-text search
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface SearchProfile {
  id: string;
  name: string;
  type: string;
  description?: string;
  tagline?: string;
  city?: string;
  state?: string;
  country?: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  is_verified: boolean;
}

export interface SearchPost {
  id: string;
  content: string;
  post_type: string;
  location?: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  author: {
    id: string;
    username: string;
    initials: string;
    type: string;
  };
}

export interface SearchSuggestion {
  text: string;
  type: 'profile' | 'user';
  category: string;
}

export interface SearchPagination {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface SearchResult<T> {
  success: boolean;
  data: T[];
  pagination: SearchPagination;
  search_info: {
    query: string;
    type: string;
    sort_by: string;
    sort_order: string;
  };
}

export interface SearchAnalytics {
  totals: {
    profiles: number;
    users: number;
    posts: number;
  };
  profile_types: Array<{
    type: string;
    count: number;
  }>;
  recent_activity: Array<{
    id: string;
    name: string;
    type: string;
    created_at: string;
  }>;
}

class SearchService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Add authentication token if available
    const authToken = localStorage.getItem('authToken');
    const firebaseToken = localStorage.getItem('firebaseToken');
    
    if (authToken) {
      defaultHeaders['Authorization'] = `Bearer ${authToken}`;
    } else if (firebaseToken) {
      defaultHeaders['Authorization'] = `Bearer ${firebaseToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      console.log(`🔍 Search API Request: ${url}`, config);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ Search API Response:`, data);
      return data;
    } catch (error) {
      console.error(`❌ Search API Error:`, error);
      throw error;
    }
  }

  /**
   * Search profiles with advanced PostgreSQL full-text search
   */
  async searchProfiles(params: {
    query?: string;
    type?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
  } = {}): Promise<SearchResult<SearchProfile>> {
    const searchParams = new URLSearchParams();
    
    if (params.query) searchParams.append('q', params.query);
    if (params.type && params.type !== 'all') searchParams.append('type', params.type);
    if (params.sort) searchParams.append('sort', params.sort);
    if (params.order) searchParams.append('order', params.order);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.per_page) searchParams.append('per_page', params.per_page.toString());

    const endpoint = `/search/profiles?${searchParams.toString()}`;
    return this.makeRequest<SearchResult<SearchProfile>>(endpoint);
  }

  /**
   * Search posts with advanced PostgreSQL full-text search
   */
  async searchPosts(params: {
    query?: string;
    type?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
  } = {}): Promise<SearchResult<SearchPost>> {
    const searchParams = new URLSearchParams();
    
    if (params.query) searchParams.append('q', params.query);
    if (params.type && params.type !== 'all') searchParams.append('type', params.type);
    if (params.sort) searchParams.append('sort', params.sort);
    if (params.order) searchParams.append('order', params.order);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.per_page) searchParams.append('per_page', params.per_page.toString());

    const endpoint = `/search/posts?${searchParams.toString()}`;
    return this.makeRequest<SearchResult<SearchPost>>(endpoint);
  }

  /**
   * Get search suggestions for autocomplete
   */
  async getSuggestions(query: string, limit: number = 10): Promise<SearchSuggestion[]> {
    if (query.length < 2) return [];
    
    const searchParams = new URLSearchParams({
      q: query,
      limit: limit.toString()
    });

    const endpoint = `/search/suggestions?${searchParams.toString()}`;
    const response = await this.makeRequest<{ success: boolean; suggestions: SearchSuggestion[] }>(endpoint);
    
    return response.suggestions || [];
  }

  /**
   * Get search analytics and statistics
   */
  async getAnalytics(): Promise<SearchAnalytics> {
    const endpoint = '/search/analytics';
    const response = await this.makeRequest<{ success: boolean; analytics: SearchAnalytics }>(endpoint);
    
    return response.analytics;
  }

  /**
   * Advanced search with multiple filters
   */
  async advancedSearch(params: {
    query?: string;
    profile_types?: string[];
    post_types?: string[];
    date_range?: {
      start: string;
      end: string;
    };
    location?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
  }): Promise<{
    profiles: SearchResult<SearchProfile>;
    posts: SearchResult<SearchPost>;
  }> {
    const [profiles, posts] = await Promise.all([
      this.searchProfiles({
        query: params.query,
        type: params.profile_types?.[0] || 'all',
        sort: params.sort_by || 'name',
        order: params.sort_order || 'asc',
        page: params.page || 1,
        per_page: params.per_page || 20
      }),
      this.searchPosts({
        query: params.query,
        type: params.post_types?.[0] || 'all',
        sort: params.sort_by || 'created_at',
        order: params.sort_order || 'desc',
        page: params.page || 1,
        per_page: params.per_page || 20
      })
    ]);

    return { profiles, posts };
  }

  /**
   * Get trending searches
   */
  async getTrendingSearches(): Promise<string[]> {
    // This would typically come from analytics/logs
    // For now, return some sample trending terms
    return [
      'cricket academy',
      'cricket coaching',
      'cricket ground',
      'cricket community',
      'cricket match'
    ];
  }

  /**
   * Save search history (client-side for now)
   */
  saveSearchHistory(query: string): void {
    try {
      const history = this.getSearchHistory();
      const newHistory = [query, ...history.filter(item => item !== query)].slice(0, 10);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }

  /**
   * Get search history
   */
  getSearchHistory(): string[] {
    try {
      const history = localStorage.getItem('searchHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Failed to get search history:', error);
      return [];
    }
  }

  /**
   * Clear search history
   */
  clearSearchHistory(): void {
    localStorage.removeItem('searchHistory');
  }
}

// Export singleton instance
export const searchService = new SearchService();
export default searchService;
