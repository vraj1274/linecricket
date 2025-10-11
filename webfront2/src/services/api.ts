import { API_BASE_URL } from '../config/api';
import { auth } from '../firebase/config';

class ApiService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    try {
      // Try to get Firebase ID token first
      const user = auth.currentUser;
      if (user) {
        const idToken = await user.getIdToken();
        return {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        };
      }
    } catch (error) {
      console.warn('Failed to get Firebase ID token:', error);
    }
    
    // Fallback to localStorage token
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  isAuthenticated(): boolean {
    // Check Firebase auth first
    if (auth.currentUser) {
      return true;
    }
    
    // Fallback to localStorage token
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  // Test server connection and health
  async testServerConnection(): Promise<{
    isConnected: boolean;
    serverUrl: string;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();
    const serverUrl = API_BASE_URL;
    
    try {
      console.log('🔍 Testing server connection...', serverUrl);
      
      // Try to connect to the server
      const response = await fetch(`${serverUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        console.log('✅ Server connection successful', { responseTime: `${responseTime}ms` });
        return {
          isConnected: true,
          serverUrl,
          responseTime
        };
      } else {
        console.warn('⚠️ Server responded with error:', response.status, response.statusText);
        return {
          isConnected: false,
          serverUrl,
          responseTime,
          error: `Server error: ${response.status} ${response.statusText}`
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('❌ Server connection failed:', error);
      
      let errorMessage = 'Unknown connection error';
      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          errorMessage = 'Connection timeout - server may be slow or unavailable';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error - check your internet connection';
        } else if (error.message.includes('CORS')) {
          errorMessage = 'CORS error - server configuration issue';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        isConnected: false,
        serverUrl,
        responseTime,
        error: errorMessage
      };
    }
  }

  // Generic HTTP methods
  async get(url: string, options: RequestInit = {}) {
    const response = await this.makeRequest(url, {
      method: 'GET',
      ...options
    });
    return this.handleResponse(response);
  }

  async post(url: string, data?: any, options: RequestInit = {}) {
    const response = await this.makeRequest(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options
    });
    return this.handleResponse(response);
  }

  async put(url: string, data?: any, options: RequestInit = {}) {
    const response = await this.makeRequest(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options
    });
    return this.handleResponse(response);
  }

  async delete(url: string, options: RequestInit = {}) {
    const response = await this.makeRequest(url, {
      method: 'DELETE',
      ...options
    });
    return this.handleResponse(response);
  }

  // Test alternative server endpoints
  async testAlternativeServers(): Promise<{
    primary: any;
    alternatives: any[];
  }> {
    const primaryUrl = API_BASE_URL;
    const alternativeUrls = [
      'http://localhost:5000/api', // Local development backend
      'http://127.0.0.1:5000/api'  // Alternative localhost format
    ];
    
    console.log('🔍 Testing server alternatives...');
    
    // Test primary server
    const primary = await this.testServerConnection();
    
    // Test alternative servers
    const alternatives = await Promise.allSettled(
      alternativeUrls.map(async (url) => {
        // Create a temporary instance with the alternative URL
        const tempApi = new ApiService();
        tempApi.baseURL = url;
        const result = await tempApi.testServerConnection();
        return { ...result, url };
      })
    );
    
    const alternativeResults = alternatives
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<any>).value);
    
    return {
      primary,
      alternatives: alternativeResults
    };
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      console.error('❌ API Response Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      let errorMessage = 'Something went wrong';
      
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error('📝 API Error Details:', error);
      } catch (parseError) {
        console.error('⚠️ Could not parse error response:', parseError);
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    return response.json();
  }

  private async makeRequest(url: string, options: RequestInit = {}) {
    const headers = await this.getAuthHeaders();
    
    console.log('🌐 Making API request:', {
      url,
      method: options.method || 'GET',
      headers: Object.keys(headers),
      hasAuth: !!(headers as Record<string, string>).Authorization
    });
    
    try {
      // Add timeout and retry logic
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('📡 API Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });
      
      return response;
    } catch (error) {
      console.error('❌ Network request failed:', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
        type: typeof error,
        name: error instanceof Error ? error.name : undefined
      });
      
      // Enhanced error handling for different types of network failures
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout: The server is taking too long to respond. Please check your connection and try again.');
        } else if (error.message.includes('Failed to fetch')) {
          console.log('🔍 Analyzing "Failed to fetch" error...');
          console.log('🔍 Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
          throw new Error('Connection error: Unable to reach the server. This might be due to server maintenance or network issues. Please try again in a few moments.');
        } else if (error.message.includes('CORS')) {
          throw new Error('CORS error: The server is not configured to accept requests from this domain. Please contact support.');
        } else if (error.message.includes('NetworkError')) {
          throw new Error('Network error: Please check your internet connection and try again.');
        } else {
          console.log('🔍 Other error type:', error.name, error.message);
          throw new Error(`Request failed: ${error.message}`);
        }
      } else {
        console.log('🔍 Unknown error type:', typeof error, error);
        throw new Error('Request failed: Unknown error occurred');
      }
    }
  }

  // Posts API
  async createPost(postData: {
    content: string;
    image_url?: string;
    location?: string;
  }) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/posts`, {
      method: 'POST',
      body: JSON.stringify(postData)
    });
    return this.handleResponse(response);
  }

  async getPosts(page = 1, perPage = 10) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/posts?page=${page}&per_page=${perPage}`, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  async likePost(postId: string) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/posts/${postId}/like`, {
      method: 'POST'
    });
    return this.handleResponse(response);
  }

  async addComment(postId: string, content: string) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
    return this.handleResponse(response);
  }

  async getComments(postId: string) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/posts/${postId}/comments`, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  async sharePost(postId: string, shareData?: { message?: string; visibility?: string }) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/posts/${postId}/share`, {
      method: 'POST',
      body: shareData ? JSON.stringify(shareData) : undefined
    });
    return this.handleResponse(response);
  }

  // Matches API
  async createMatch(matchData: {
    title: string;
    description?: string;
    match_type: string;
    location: string;
    venue?: string;
    match_date: string;
    match_time: string;
    players_needed: number;
    entry_fee?: number;
    is_public?: boolean;
    skill_level?: string;
    equipment_provided?: boolean;
    rules?: string;
  }) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/matches`, {
      method: 'POST',
      body: JSON.stringify(matchData)
    });
    return this.handleResponse(response);
  }

  async getLiveMatches() {
    const response = await this.makeRequest(`${API_BASE_URL}/api/matches/live`, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  async getMatches(status = 'all', matchType = 'all', page = 1, perPage = 10) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/matches?status=${status}&match_type=${matchType}&page=${page}&per_page=${perPage}`, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  async joinMatch(matchId: number) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/matches/${matchId}/join`, {
      method: 'POST'
    });
    return this.handleResponse(response);
  }

  async leaveMatch(matchId: number) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/matches/${matchId}/leave`, {
      method: 'POST'
    });
    return this.handleResponse(response);
  }

  async getMatchParticipants(matchId: number) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/matches/${matchId}/participants`, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  async updateMatchScore(matchId: number, scoreData: {
    team1_name?: string;
    team2_name?: string;
    team1_score?: string;
    team2_score?: string;
    current_over?: string;
    match_summary?: string;
    status?: string;
  }) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/matches/${matchId}/update-score`, {
      method: 'POST',
      body: JSON.stringify(scoreData)
    });
    return this.handleResponse(response);
  }

  async watchLiveMatch(matchId: number) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/matches/${matchId}/watch`, {
      method: 'POST'
    });
    return this.handleResponse(response);
  }

  async getMatchTeams(matchId: string) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/matches/${matchId}/teams`, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  async getMatchTeamStats(matchId: string) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/matches/${matchId}/team-stats`, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  async getMatchDetails(matchId: string) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/matches/${matchId}`, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  async updateMatch(matchId: string, matchData: {
    title?: string;
    description?: string;
    match_type?: string;
    location?: string;
    venue?: string;
    match_date?: string;
    match_time?: string;
    players_needed?: number;
    entry_fee?: number;
    skill_level?: string;
    team1_name?: string;
    team2_name?: string;
    is_public?: boolean;
    equipment_provided?: boolean;
    rules?: string;
  }) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/matches/${matchId}`, {
      method: 'PUT',
      body: JSON.stringify(matchData)
    });
    return this.handleResponse(response);
  }

  async deleteMatch(matchId: string) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/matches/${matchId}`, {
      method: 'DELETE'
    });
    return this.handleResponse(response);
  }

  async joinTeam(matchId: string, teamData: {
    team_id: string;
    position: number;
    role: string;
  }) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/matches/${matchId}/join-team`, {
      method: 'POST',
      body: JSON.stringify(teamData)
    });
    return this.handleResponse(response);
  }

  async leaveTeam(matchId: string, teamId: string) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/matches/${matchId}/leave-team`, {
      method: 'POST',
      body: JSON.stringify({ team_id: teamId })
    });
    return this.handleResponse(response);
  }

  // Auth API
  async login(credentials: { username: string; password: string }) {
    const response = await this.makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    const data = await this.handleResponse(response);
    if (data.access_token) {
      localStorage.setItem('authToken', data.access_token);
    }
    return data;
  }

  async register(userData: { username: string; email: string; password: string }) {
    const response = await this.makeRequest(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    return this.handleResponse(response);
  }

  async logout() {
    localStorage.removeItem('authToken');
  }

  // Profile API
  async getCurrentUserProfile() {
    console.log('🔄 Getting current user profile with Firebase auth...');
    console.log('📡 API Base URL:', API_BASE_URL);
    
    try {
      const response = await this.makeRequest(`${API_BASE_URL}/api/users/profile`, {
        method: 'GET'
      });
      
      console.log('📡 Raw API response:', response);
      const data = await this.handleResponse(response);
      console.log('📋 Processed profile data:', data);
      
      // Ensure the response has the expected structure
      if (data && typeof data === 'object') {
        // If the response is directly the user object
        if (data.id || data.username) {
          console.log('✅ Direct user object received');
          return { user: data };
        }
        // If the response has a user property
        if (data.user) {
          console.log('✅ User object found in response');
          return data;
        }
        // If the response has a different structure, try to extract user data
        if (data.data && data.data.user) {
          console.log('✅ User object found in data.user');
          return { user: data.data.user };
        }
        // If the response has profile data directly
        if (data.profile) {
          console.log('✅ Profile data found, creating user object');
          return { 
            user: {
              id: data.id || 0,
              username: data.username || '',
              email: data.email || '',
              is_verified: data.is_verified || false,
              profile: data.profile
            }
          };
        }
      }
      
      console.warn('⚠️ Unexpected response format:', data);
      throw new Error('Invalid response format from server');
      
    } catch (error) {
      console.error('❌ Error in getCurrentUserProfile:', error);
      throw error;
    }
  }

  async updateUserProfile(profileData: {
    username?: string;
    full_name?: string;
    bio?: string;
    location?: string;
    organization?: string;
    age?: number;
    gender?: string;
    contact_number?: string;
    profile_image_url?: string;
    batting_skill?: number;
    bowling_skill?: number;
    fielding_skill?: number;
    // Stats
    total_runs?: number;
    total_wickets?: number;
    total_matches?: number;
    batting_average?: number;
    highest_score?: number;
    centuries?: number;
    half_centuries?: number;
    bowling_average?: number;
    best_bowling_figures?: string;
    catches?: number;
    stumpings?: number;
    run_outs?: number;
    // Format stats
    test_matches?: number;
    odi_matches?: number;
    t20_matches?: number;
    test_runs?: number;
    odi_runs?: number;
    t20_runs?: number;
    test_wickets?: number;
    odi_wickets?: number;
    t20_wickets?: number;
  }) {
    console.log('🔄 Updating user profile with Firebase auth...');
    console.log('📡 API Base URL:', API_BASE_URL);
    console.log('📋 Profile data being sent:', profileData);
    
    try {
      const response = await this.makeRequest(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });
      
      console.log('📡 Raw update response:', response);
      const data = await this.handleResponse(response);
      console.log('📋 Processed update data:', data);
      
      // Handle different response formats
      if (data && typeof data === 'object') {
        // If the response is directly the user object
        if (data.id || data.username) {
          console.log('✅ Direct user object received from update');
          return { user: data };
        }
        // If the response has a user property
        if (data.user) {
          console.log('✅ User object found in update response');
          return data;
        }
        // If the response has a different structure, try to extract user data
        if (data.data && data.data.user) {
          console.log('✅ User object found in data.user from update');
          return { user: data.data.user };
        }
        // If the response has profile data directly
        if (data.profile) {
          console.log('✅ Profile data found in update response, creating user object');
          return { 
            user: {
              id: data.id || 0,
              username: data.username || '',
              email: data.email || '',
              is_verified: data.is_verified || false,
              profile: data.profile
            }
          };
        }
        // If the response indicates success but no user data
        if (data.success || data.message) {
          console.log('✅ Update successful, but no user data returned. Will refresh profile.');
          return { success: true, message: data.message || 'Profile updated successfully' };
        }
      }
      
      console.warn('⚠️ Unexpected update response format:', data);
      // Don't throw error, just return success and let the context refresh
      return { success: true, message: 'Profile updated successfully' };
      
    } catch (error) {
      console.error('❌ Error in updateUserProfile:', error);
      throw error;
    }
  }

  // Verify that data was actually stored in database
  async verifyProfileUpdate(profileData: any): Promise<boolean> {
    try {
      console.log('🔍 Verifying profile update in database...');
      
      // Wait a moment for database to be updated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fetch the current profile from database
      const currentProfile = await this.getCurrentUserProfile();
      console.log('📋 Current profile from database:', currentProfile);
      
      if (!currentProfile.user) {
        console.warn('⚠️ No user data found in verification');
        return false;
      }
      
      const user = currentProfile.user;
      const profile = user.profile;
      
      // Check if key fields match what we sent
      const verificationChecks = {
        username: profileData.username ? user.username === profileData.username : true,
        fullName: profileData.full_name ? profile?.full_name === profileData.full_name : true,
        bio: profileData.bio ? profile?.bio === profileData.bio : true,
        location: profileData.location ? profile?.location === profileData.location : true,
        organization: profileData.organization ? profile?.organization === profileData.organization : true,
        age: profileData.age ? profile?.age === profileData.age : true,
        gender: profileData.gender ? profile?.gender === profileData.gender : true,
        contact: profileData.contact_number ? profile?.contact_number === profileData.contact_number : true,
        battingSkill: profileData.batting_skill ? profile?.batting_skill === profileData.batting_skill : true,
        bowlingSkill: profileData.bowling_skill ? profile?.bowling_skill === profileData.bowling_skill : true,
        fieldingSkill: profileData.fielding_skill ? profile?.fielding_skill === profileData.fielding_skill : true,
        totalRuns: profileData.total_runs ? profile?.stats?.total_runs === profileData.total_runs : true,
        totalWickets: profileData.total_wickets ? profile?.stats?.total_wickets === profileData.total_wickets : true,
        totalMatches: profileData.total_matches ? profile?.stats?.total_matches === profileData.total_matches : true,
        battingAverage: profileData.batting_average ? profile?.stats?.batting_average === profileData.batting_average : true,
        highestScore: profileData.highest_score ? profile?.stats?.highest_score === profileData.highest_score : true,
        centuries: profileData.centuries ? profile?.stats?.centuries === profileData.centuries : true,
        halfCenturies: profileData.half_centuries ? profile?.stats?.half_centuries === profileData.half_centuries : true,
        bowlingAverage: profileData.bowling_average ? profile?.stats?.bowling_average === profileData.bowling_average : true,
        bestBowling: profileData.best_bowling_figures ? profile?.stats?.best_bowling_figures === profileData.best_bowling_figures : true,
        catches: profileData.catches ? profile?.stats?.catches === profileData.catches : true,
        stumpings: profileData.stumpings ? profile?.stats?.stumpings === profileData.stumpings : true,
        runOuts: profileData.run_outs ? profile?.stats?.run_outs === profileData.run_outs : true,
      };
      
      console.log('🔍 Verification checks:', verificationChecks);
      
      const allChecksPassed = Object.values(verificationChecks).every(check => check === true);
      
      if (allChecksPassed) {
        console.log('✅ All verification checks passed - data is stored in database');
      } else {
        console.warn('⚠️ Some verification checks failed - data may not be fully stored');
        const failedChecks = Object.entries(verificationChecks)
          .filter(([key, value]) => value === false)
          .map(([key]) => key);
        console.warn('❌ Failed checks:', failedChecks);
      }
      
      return allChecksPassed;
      
    } catch (error) {
      console.error('❌ Error verifying profile update:', error);
      return false;
    }
  }

  async addExperience(experienceData: {
    title: string;
    role: string;
    duration: string;
    description?: string;
  }) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/users/profile/experiences`, {
      method: 'POST',
      body: JSON.stringify(experienceData)
    });
    return this.handleResponse(response);
  }

  async updateExperience(experienceId: number, experienceData: {
    title?: string;
    role?: string;
    duration?: string;
    description?: string;
  }) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/users/profile/experiences/${experienceId}`, {
      method: 'PUT',
      body: JSON.stringify(experienceData)
    });
    return this.handleResponse(response);
  }

  async deleteExperience(experienceId: number) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/users/profile/experiences/${experienceId}`, {
      method: 'DELETE'
    });
    return this.handleResponse(response);
  }

  async addAchievement(achievementData: {
    title: string;
    description?: string;
    year: string;
  }) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/users/profile/achievements`, {
      method: 'POST',
      body: JSON.stringify(achievementData)
    });
    return this.handleResponse(response);
  }

  async updateAchievement(achievementId: number, achievementData: {
    title?: string;
    description?: string;
    year?: string;
  }) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/users/profile/achievements/${achievementId}`, {
      method: 'PUT',
      body: JSON.stringify(achievementData)
    });
    return this.handleResponse(response);
  }

  async deleteAchievement(achievementId: number) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/users/profile/achievements/${achievementId}`, {
      method: 'DELETE'
    });
    return this.handleResponse(response);
  }

  async getUserProfile(userId: number) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  // Messaging API
  async sendMessage(receiverId: number, content: string) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/messages/send`, {
      method: 'POST',
      body: JSON.stringify({ receiver_id: receiverId, content })
    });
    return this.handleResponse(response);
  }

  async getMessages(userId: number, page = 1, perPage = 20) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/messages/${userId}?page=${page}&per_page=${perPage}`, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  async getConversationMessages(otherUserId: number, page = 1, perPage = 50) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/messages/conversation/${otherUserId}?page=${page}&per_page=${perPage}`, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  // Notification API
  async createNotification(userId: number, type: string, message: string) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/notifications/create`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, type, message })
    });
    return this.handleResponse(response);
  }

  async getNotifications(userId: number, page = 1, perPage = 20, unreadOnly = false, notificationType?: string) {
    let url = `${API_BASE_URL}/api/notifications/${userId}?page=${page}&per_page=${perPage}`;
    if (unreadOnly) url += '&unread_only=true';
    if (notificationType) url += `&type=${notificationType}`;
    
    const response = await this.makeRequest(url, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  async markNotificationRead(notificationId: number) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
      method: 'PATCH'
    });
    return this.handleResponse(response);
  }

  async markAllNotificationsRead() {
    const response = await this.makeRequest(`${API_BASE_URL}/api/notifications/mark-all-read`, {
      method: 'PATCH'
    });
    return this.handleResponse(response);
  }

  async deleteNotification(notificationId: number) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/notifications/${notificationId}`, {
      method: 'DELETE'
    });
    return this.handleResponse(response);
  }

  async getNotificationStats(userId: number) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/notifications/stats/${userId}`, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  // Connection API
  async addConnection(friendId: number) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/connections/add`, {
      method: 'POST',
      body: JSON.stringify({ friend_id: friendId })
    });
    return this.handleResponse(response);
  }

  async getConnections(userId: number, page = 1, perPage = 20) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/connections/${userId}?page=${page}&per_page=${perPage}`, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  async removeConnection(friendId: number) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/connections/remove/${friendId}`, {
      method: 'DELETE'
    });
    return this.handleResponse(response);
  }

  async checkConnection(friendId: number) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/connections/check/${friendId}`, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  async getConnectionStats(userId: number) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/connections/stats/${userId}`, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  async getConnectionSuggestions(userId: number, limit = 10) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/connections/suggestions/${userId}?limit=${limit}`, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  // Search API
  async searchContent(query: string, category: string = 'all') {
    const response = await this.makeRequest(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}&category=${category}`, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  async getTrendingContent(category: string = 'all') {
    const response = await this.makeRequest(`${API_BASE_URL}/api/search/trending?category=${category}`, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  async connectUser(userId: number) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/connections/add`, {
      method: 'POST',
      body: JSON.stringify({ friend_id: userId })
    });
    return this.handleResponse(response);
  }

  async applyJob(jobId: number) {
    const response = await this.makeRequest(`${API_BASE_URL}/jobs/${jobId}/apply`, {
      method: 'POST'
    });
    return this.handleResponse(response);
  }

  async joinCommunity(communityId: number) {
    const response = await this.makeRequest(`${API_BASE_URL}/communities/${communityId}/join`, {
      method: 'POST'
    });
    return this.handleResponse(response);
  }

  // Social Media Posts API
  async createSocialPost(postData: {
    content: string;
    image_url?: string;
    image_caption?: string;
    location?: string;
    post_type?: string;
    visibility?: string;
  }) {
    console.log('🚀 Creating social post:', postData);
    console.log('📡 API URL:', `${API_BASE_URL}/api/posts`);
    
    const response = await this.makeRequest(`${API_BASE_URL}/api/posts`, {
      method: 'POST',
      body: JSON.stringify(postData)
    });
    
    console.log('📥 Raw response:', response);
    const result = this.handleResponse(response);
    console.log('📋 Processed result:', result);
    return result;
  }

  async getSocialPosts(page = 1, perPage = 10, sortBy = 'created_at', order = 'desc', filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      sort_by: sortBy,
      order: order,
      ...filters
    });
    
    const response = await this.makeRequest(`${API_BASE_URL}/api/feed?${params}`, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  async getSocialPost(postId: number) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/posts/${postId}`, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  async likeSocialPost(postId: number) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/posts/${postId}/like`, {
      method: 'POST'
    });
    return this.handleResponse(response);
  }

  async bookmarkSocialPost(postId: number) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/posts/${postId}/bookmark`, {
      method: 'POST'
    });
    return this.handleResponse(response);
  }

  async shareSocialPost(postId: number) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/posts/${postId}/share`, {
      method: 'POST'
    });
    return this.handleResponse(response);
  }

  async addSocialComment(postId: number, content: string, parentCommentId?: number) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parent_comment_id: parentCommentId })
    });
    return this.handleResponse(response);
  }

  async getSocialComments(postId: number, page = 1, perPage = 20) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/posts/${postId}/comments?page=${page}&per_page=${perPage}`, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  async getTrendingPosts(timeFilter = '24h', page = 1, perPage = 10) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/feed/trending?time_filter=${timeFilter}&page=${page}&per_page=${perPage}`, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  async getPostsByHashtag(hashtag: string, page = 1, perPage = 10) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/feed?hashtag=${hashtag}&page=${page}&per_page=${perPage}`, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  async getUserBookmarks(page = 1, perPage = 10) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/feed/bookmarks?page=${page}&per_page=${perPage}`, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  async deleteSocialPost(postId: number) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/posts/${postId}`, {
      method: 'DELETE'
    });
    return this.handleResponse(response);
  }

  // Profile Page API
  async createProfilePage(profileData: {
    academy_name: string;
    tagline?: string;
    description?: string;
    bio?: string;
    contact_person?: string;
    contact_number?: string;
    email: string;
    website?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    academy_type: string;
    level: string;
    page_type: string;
    established_year?: number;
    accreditation?: string;
    coaching_staff_count?: number;
    total_students?: number;
    instagram_handle?: string;
    facebook_handle?: string;
    youtube_handle?: string;
    is_public?: boolean;
    allow_messages?: boolean;
    show_contact?: boolean;
  }) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/profile-page`, {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
    return this.handleResponse(response);
  }

  async getProfilePages() {
    const response = await this.makeRequest(`${API_BASE_URL}/api/profiles`, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  async getProfilePage(profileId: string) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/profiles/${profileId}`, {
      method: 'GET'
    });
    return this.handleResponse(response);
  }

  async updateProfilePage(profileId: string, profileData: any) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/profiles/${profileId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    return this.handleResponse(response);
  }

  async deleteProfilePage(profileId: string) {
    const response = await this.makeRequest(`${API_BASE_URL}/api/profiles/${profileId}`, {
      method: 'DELETE'
    });
    return this.handleResponse(response);
  }

  // Posts API
  async getPosts(page: number = 1, limit: number = 10): Promise<{
    success: boolean;
    posts: any[];
    total: number;
    current_page: number;
    pages: number;
  }> {
    console.log(`🌐 Fetching posts - Page: ${page}, Limit: ${limit}`);
    
    const response = await this.makeRequest(`${API_BASE_URL}/api/posts?page=${page}&per_page=${limit}`, {
      method: 'GET'
    });

    console.log('📥 Posts response:', response);
    
    // Transform the response to match expected format
    if (response.posts) {
      return {
        success: true,
        posts: response.posts,
        total: response.total || response.posts.length,
        current_page: response.current_page || page,
        pages: response.pages || 1
      };
    }
    
    return this.handleResponse(response);
  }

  // Utility methods
}

export const apiService = new ApiService();
