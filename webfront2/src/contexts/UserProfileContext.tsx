import { createContext, ReactNode, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { apiService } from '../services/api';
import { firebaseBackendSync } from '../services/firebaseBackendSync';
import { useFirebase } from './FirebaseContext';
import { useToast } from './ToastContext';
import { auth } from '../firebase/config'; // Added for direct Firebase user access

interface UserProfile {
  id: number;
  firebaseUid: string;
  username: string;
  email: string;
  is_verified: boolean;
  profile?: {
    id: number;
    full_name: string;
    bio?: string;
    location?: string;
    organization?: string;
    age?: number;
    gender?: string;
    contact_number?: string;
    profile_image_url?: string;
    batting_skill: number;
    bowling_skill: number;
    fielding_skill: number;
    stats?: {
      id: number;
      total_runs: number;
      total_wickets: number;
      total_matches: number;
      batting_average: number;
      highest_score: number;
      centuries: number;
      half_centuries: number;
      bowling_average: number;
      best_bowling_figures?: string;
      catches: number;
      stumpings: number;
      run_outs: number;
      test_matches: number;
      odi_matches: number;
      t20_matches: number;
      test_runs: number;
      odi_runs: number;
      t20_runs: number;
      test_wickets: number;
      odi_wickets: number;
      t20_wickets: number;
    };
    experiences: Array<{
      id: number;
      title: string;
      role: string;
      duration: string;
      description?: string;
    }>;
    achievements: Array<{
      id: number;
      title: string;
      description?: string;
      year: string;
    }>;
  };
}

interface UserProfileContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isInitialLoad: boolean;
  lastUpdated: Date | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (profileData: any) => Promise<UserProfile | null>;
  updateProfileField: (field: string, value: any) => void;
  addExperience: (experienceData: any) => Promise<void>;
  updateExperience: (experienceId: number, experienceData: any) => Promise<void>;
  deleteExperience: (experienceId: number) => Promise<void>;
  addAchievement: (achievementData: any) => Promise<void>;
  updateAchievement: (achievementId: number, achievementData: any) => Promise<void>;
  deleteAchievement: (achievementId: number) => Promise<void>;
  enableAutoRefresh: (intervalMs?: number) => void;
  disableAutoRefresh: () => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

interface UserProfileProviderProps {
  children: ReactNode;
}

export function UserProfileProvider({ children }: UserProfileProviderProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Auto-refresh functionality
  const autoRefreshInterval = useRef<NodeJS.Timeout | null>(null);
  const autoRefreshEnabled = useRef<boolean>(false);
  const syncInProgress = useRef<boolean>(false);
  
  // Get Firebase user state and toast notifications
  const { user: firebaseUser } = useFirebase();
  const { showSuccess, showError, showInfo } = useToast();

  // Create a temporary profile from Firebase data immediately
  const createTempProfileFromFirebase = useCallback((firebaseUser: any): UserProfile | null => {
    if (!firebaseUser) return null;
    
    return {
      id: 0, // Temporary ID
      firebaseUid: firebaseUser.uid,
      username: firebaseUser.email?.split('@')[0] || 'user',
      email: firebaseUser.email || '',
      is_verified: firebaseUser.emailVerified || false,
      profile: {
        id: 0,
        full_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        bio: '',
        location: '',
        organization: '',
        age: undefined,
        gender: 'Male',
        contact_number: '',
        profile_image_url: '',
        batting_skill: 0,
        bowling_skill: 0,
        fielding_skill: 0,
        stats: {
          id: 0,
          total_runs: 0,
          total_wickets: 0,
          total_matches: 0,
          batting_average: 0,
          highest_score: 0,
          centuries: 0,
          half_centuries: 0,
          bowling_average: 0,
          best_bowling_figures: '',
          catches: 0,
          stumpings: 0,
          run_outs: 0,
          test_matches: 0,
          odi_matches: 0,
          t20_matches: 0,
          test_runs: 0,
          odi_runs: 0,
          t20_runs: 0,
          test_wickets: 0,
          odi_wickets: 0,
          t20_wickets: 0,
        },
        experiences: [],
        achievements: [],
      },
    };
  }, []);

  // Enhanced refresh profile with better caching and error handling
  const refreshProfile = useCallback(async () => {
    if (!apiService.isAuthenticated()) {
      console.log('🔐 User not authenticated, skipping profile refresh');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Refreshing profile from database...');
      
      // First, try to sync user with Firebase to ensure they exist in database
      try {
        console.log('🔄 Syncing user with Firebase first...');
        await apiService.syncUserWithFirebase();
        console.log('✅ User sync completed');
      } catch (syncError) {
        console.warn('⚠️ User sync failed, but continuing with profile fetch:', syncError);
      }
      
      const response = await apiService.getCurrentUserProfile();
      console.log('📋 API Response received:', response);
      
      if (response && response.user) {
        setUserProfile(response.user);
        setLastUpdated(new Date());
        console.log('✅ Profile refreshed successfully:', response.user);
      } else {
        console.warn('⚠️ No user data in response:', response);
        setError('No user data received from server');
      }
    } catch (err) {
      console.error('❌ Error fetching profile:', err);
      
      // Enhanced error handling
      let errorMessage = 'Failed to fetch profile';
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('Network error')) {
          errorMessage = 'Unable to connect to server. Please check your internet connection.';
        } else if (err.message.includes('401') || err.message.includes('unauthorized')) {
          errorMessage = 'Session expired. Please log in again.';
        } else if (err.message.includes('404')) {
          errorMessage = 'Profile not found. Please create your profile.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      console.error('❌ Profile fetch error details:', {
        message: errorMessage,
        originalError: err
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle Firebase user changes and automatic sync
  useEffect(() => {
    const handleFirebaseUserChange = async () => {
      if (firebaseUser) {
        console.log('🔄 Firebase user detected, showing profile immediately...');
        
        // Show Firebase data immediately (like Instagram)
        const tempProfile = createTempProfileFromFirebase(firebaseUser);
        setUserProfile(tempProfile);
        setIsInitialLoad(false);
        
        console.log('📱 Profile shown immediately with Firebase data:', tempProfile);
        
        // Then sync with backend in background
        setLoading(true);
        
        try {
          // Sync with backend to ensure user exists in database
          console.log('🔄 Syncing user with backend...');
          await refreshProfile();
          console.log('✅ User sync completed');
        } catch (error) {
          console.error('Error during Firebase user setup:', error);
          // Only set error for critical failures, not sync issues
          if (error instanceof Error && !error.message.includes('sync')) {
            setError('Failed to initialize user profile');
          }
        } finally {
          setLoading(false);
        }
      } else {
        // User logged out, clear profile and stop auto-refresh
        setUserProfile(null);
        setIsInitialLoad(false);
        disableAutoRefresh();
      }
    };

    handleFirebaseUserChange();
  }, [firebaseUser?.uid, createTempProfileFromFirebase]); // Remove refreshProfile from dependencies

  // Enhanced update profile with optimistic updates and stats handling
  const updateProfile = useCallback(async (profileData: any): Promise<UserProfile | null> => {
    const originalProfile = userProfile;
    
    try {
      setLoading(true);
      setError(null);
      console.log('💾 Updating profile with data:', profileData);
      
      // Enhanced optimistic update with stats
      if (userProfile) {
        const optimisticProfile: UserProfile = {
          ...userProfile,
          username: profileData.username || userProfile.username,
          profile: {
            ...userProfile.profile!,
            // Basic profile fields
            full_name: profileData.full_name || userProfile.profile?.full_name || '',
            bio: profileData.bio || userProfile.profile?.bio || '',
            location: profileData.location || userProfile.profile?.location || '',
            organization: profileData.organization || userProfile.profile?.organization || '',
            age: profileData.age !== undefined ? profileData.age : userProfile.profile?.age,
            gender: profileData.gender || userProfile.profile?.gender || 'Male',
            contact_number: profileData.contact_number || userProfile.profile?.contact_number || '',
            profile_image_url: profileData.profile_image_url || userProfile.profile?.profile_image_url || '',
            // Skills
            batting_skill: profileData.batting_skill !== undefined ? profileData.batting_skill : userProfile.profile?.batting_skill || 0,
            bowling_skill: profileData.bowling_skill !== undefined ? profileData.bowling_skill : userProfile.profile?.bowling_skill || 0,
            fielding_skill: profileData.fielding_skill !== undefined ? profileData.fielding_skill : userProfile.profile?.fielding_skill || 0,
            // Stats - merge with existing stats
            stats: {
              ...userProfile.profile?.stats!,
              total_runs: profileData.total_runs !== undefined ? profileData.total_runs : userProfile.profile?.stats?.total_runs || 0,
              total_wickets: profileData.total_wickets !== undefined ? profileData.total_wickets : userProfile.profile?.stats?.total_wickets || 0,
              total_matches: profileData.total_matches !== undefined ? profileData.total_matches : userProfile.profile?.stats?.total_matches || 0,
              batting_average: profileData.batting_average !== undefined ? profileData.batting_average : userProfile.profile?.stats?.batting_average || 0,
              highest_score: profileData.highest_score !== undefined ? profileData.highest_score : userProfile.profile?.stats?.highest_score || 0,
              centuries: profileData.centuries !== undefined ? profileData.centuries : userProfile.profile?.stats?.centuries || 0,
              half_centuries: profileData.half_centuries !== undefined ? profileData.half_centuries : userProfile.profile?.stats?.half_centuries || 0,
              bowling_average: profileData.bowling_average !== undefined ? profileData.bowling_average : userProfile.profile?.stats?.bowling_average || 0,
              best_bowling_figures: profileData.best_bowling_figures || userProfile.profile?.stats?.best_bowling_figures || '',
              catches: profileData.catches !== undefined ? profileData.catches : userProfile.profile?.stats?.catches || 0,
              stumpings: profileData.stumpings !== undefined ? profileData.stumpings : userProfile.profile?.stats?.stumpings || 0,
              run_outs: profileData.run_outs !== undefined ? profileData.run_outs : userProfile.profile?.stats?.run_outs || 0,
              // Format stats
              test_matches: profileData.test_matches !== undefined ? profileData.test_matches : userProfile.profile?.stats?.test_matches || 0,
              odi_matches: profileData.odi_matches !== undefined ? profileData.odi_matches : userProfile.profile?.stats?.odi_matches || 0,
              t20_matches: profileData.t20_matches !== undefined ? profileData.t20_matches : userProfile.profile?.stats?.t20_matches || 0,
              test_runs: profileData.test_runs !== undefined ? profileData.test_runs : userProfile.profile?.stats?.test_runs || 0,
              odi_runs: profileData.odi_runs !== undefined ? profileData.odi_runs : userProfile.profile?.stats?.odi_runs || 0,
              t20_runs: profileData.t20_runs !== undefined ? profileData.t20_runs : userProfile.profile?.stats?.t20_runs || 0,
              test_wickets: profileData.test_wickets !== undefined ? profileData.test_wickets : userProfile.profile?.stats?.test_wickets || 0,
              odi_wickets: profileData.odi_wickets !== undefined ? profileData.odi_wickets : userProfile.profile?.stats?.odi_wickets || 0,
              t20_wickets: profileData.t20_wickets !== undefined ? profileData.t20_wickets : userProfile.profile?.stats?.t20_wickets || 0,
            },
            experiences: userProfile.profile?.experiences || [],
            achievements: userProfile.profile?.achievements || [],
          }
        };
        
        setUserProfile(optimisticProfile);
        setLastUpdated(new Date());
        console.log('🔄 Optimistic update applied with stats:', optimisticProfile);
      }
      
      // Make API call to update in database
      const response = await apiService.updateUserProfile(profileData);
      console.log('📋 Update API response:', response);
      
      // Update with fresh data from server
      if (response.user) {
        setUserProfile(response.user);
        setLastUpdated(new Date());
        console.log('✅ Profile updated successfully in database:', response.user);
        
        // Verify the data was actually stored in database
        console.log('🔍 Verifying database storage...');
        const isStored = await apiService.verifyProfileUpdate(profileData);
        if (isStored) {
          console.log('✅ Database verification successful - data is stored');
        } else {
          console.warn('⚠️ Database verification failed - data may not be fully stored');
        }
        
        return response.user;
      } else if (response.success) {
        // Update was successful but no user data returned, refresh from server
        console.log('✅ Update successful, refreshing profile from server...');
        await refreshProfile();
        
        // Verify the data was actually stored in database
        console.log('🔍 Verifying database storage after refresh...');
        const isStored = await apiService.verifyProfileUpdate(profileData);
        if (isStored) {
          console.log('✅ Database verification successful - data is stored');
        } else {
          console.warn('⚠️ Database verification failed - data may not be fully stored');
        }
        
        return userProfile; // Return current profile after refresh
      } else {
        // Fallback: don't refresh to avoid infinite loop
        console.log('⚠️ No user data in response, but avoiding refresh to prevent infinite loop');
        return userProfile; // Return current profile without refresh
      }
    } catch (err) {
      // Rollback optimistic update on error
      if (originalProfile) {
        setUserProfile(originalProfile);
        console.log('🔄 Rolled back optimistic update due to error');
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      console.error('❌ Error updating profile:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userProfile, refreshProfile]);

  // Update single field optimistically
  const updateProfileField = useCallback((field: string, value: any) => {
    if (!userProfile?.profile) return;
    
    const updatedProfile = {
      ...userProfile,
      profile: {
        ...userProfile.profile,
        [field]: value
      }
    };
    
    setUserProfile(updatedProfile);
    setLastUpdated(new Date());
    console.log(`🔄 Optimistically updated field ${field}:`, value);
  }, [userProfile]);

  // Enhanced experience management with optimistic updates
  const addExperience = useCallback(async (experienceData: any) => {
    const originalProfile = userProfile;
    
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update
      if (userProfile?.profile) {
        const newExperience = {
          id: Date.now(), // Temporary ID
          ...experienceData
        };
        
        const optimisticProfile = {
          ...userProfile,
          profile: {
            ...userProfile.profile,
            experiences: [...userProfile.profile.experiences, newExperience]
          }
        };
        
        setUserProfile(optimisticProfile);
        console.log('🔄 Optimistically added experience:', newExperience);
      }
      
      const response = await apiService.addExperience(experienceData);
      // Don't refresh to avoid infinite loop
      console.log('✅ Experience added to database');
    } catch (err) {
      // Rollback on error
      if (originalProfile) {
        setUserProfile(originalProfile);
        console.log('🔄 Rolled back experience addition');
      }
      setError(err instanceof Error ? err.message : 'Failed to add experience');
      console.error('❌ Error adding experience:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userProfile, refreshProfile]);

  const updateExperience = useCallback(async (experienceId: number, experienceData: any) => {
    const originalProfile = userProfile;
    
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update
      if (userProfile?.profile) {
        const updatedExperiences = userProfile.profile.experiences.map(exp =>
          exp.id === experienceId ? { ...exp, ...experienceData } : exp
        );
        
        const optimisticProfile = {
          ...userProfile,
          profile: {
            ...userProfile.profile,
            experiences: updatedExperiences
          }
        };
        
        setUserProfile(optimisticProfile);
        console.log('🔄 Optimistically updated experience:', experienceId);
      }
      
      await apiService.updateExperience(experienceId, experienceData);
      // Don't refresh to avoid infinite loop
      console.log('✅ Experience updated in database');
    } catch (err) {
      // Rollback on error
      if (originalProfile) {
        setUserProfile(originalProfile);
        console.log('🔄 Rolled back experience update');
      }
      setError(err instanceof Error ? err.message : 'Failed to update experience');
      console.error('❌ Error updating experience:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userProfile, refreshProfile]);

  const deleteExperience = useCallback(async (experienceId: number) => {
    const originalProfile = userProfile;
    
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update
      if (userProfile?.profile) {
        const filteredExperiences = userProfile.profile.experiences.filter(exp => exp.id !== experienceId);
        
        const optimisticProfile = {
          ...userProfile,
          profile: {
            ...userProfile.profile,
            experiences: filteredExperiences
          }
        };
        
        setUserProfile(optimisticProfile);
        console.log('🔄 Optimistically deleted experience:', experienceId);
      }
      
      await apiService.deleteExperience(experienceId);
      // Don't refresh to avoid infinite loop
      console.log('✅ Experience deleted from database');
    } catch (err) {
      // Rollback on error
      if (originalProfile) {
        setUserProfile(originalProfile);
        console.log('🔄 Rolled back experience deletion');
      }
      setError(err instanceof Error ? err.message : 'Failed to delete experience');
      console.error('❌ Error deleting experience:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userProfile, refreshProfile]);

  // Enhanced achievement management with optimistic updates
  const addAchievement = useCallback(async (achievementData: any) => {
    const originalProfile = userProfile;
    
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update
      if (userProfile?.profile) {
        const newAchievement = {
          id: Date.now(), // Temporary ID
          ...achievementData
        };
        
        const optimisticProfile = {
          ...userProfile,
          profile: {
            ...userProfile.profile,
            achievements: [...userProfile.profile.achievements, newAchievement]
          }
        };
        
        setUserProfile(optimisticProfile);
        console.log('🔄 Optimistically added achievement:', newAchievement);
      }
      
      await apiService.addAchievement(achievementData);
      // Don't refresh to avoid infinite loop
      console.log('✅ Achievement added to database');
    } catch (err) {
      // Rollback on error
      if (originalProfile) {
        setUserProfile(originalProfile);
        console.log('🔄 Rolled back achievement addition');
      }
      setError(err instanceof Error ? err.message : 'Failed to add achievement');
      console.error('❌ Error adding achievement:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userProfile, refreshProfile]);

  const updateAchievement = useCallback(async (achievementId: number, achievementData: any) => {
    const originalProfile = userProfile;
    
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update
      if (userProfile?.profile) {
        const updatedAchievements = userProfile.profile.achievements.map(ach =>
          ach.id === achievementId ? { ...ach, ...achievementData } : ach
        );
        
        const optimisticProfile = {
          ...userProfile,
          profile: {
            ...userProfile.profile,
            achievements: updatedAchievements
          }
        };
        
        setUserProfile(optimisticProfile);
        console.log('🔄 Optimistically updated achievement:', achievementId);
      }
      
      await apiService.updateAchievement(achievementId, achievementData);
      // Don't refresh to avoid infinite loop
      console.log('✅ Achievement updated in database');
    } catch (err) {
      // Rollback on error
      if (originalProfile) {
        setUserProfile(originalProfile);
        console.log('🔄 Rolled back achievement update');
      }
      setError(err instanceof Error ? err.message : 'Failed to update achievement');
      console.error('❌ Error updating achievement:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userProfile, refreshProfile]);

  const deleteAchievement = useCallback(async (achievementId: number) => {
    const originalProfile = userProfile;
    
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update
      if (userProfile?.profile) {
        const filteredAchievements = userProfile.profile.achievements.filter(ach => ach.id !== achievementId);
        
        const optimisticProfile = {
          ...userProfile,
          profile: {
            ...userProfile.profile,
            achievements: filteredAchievements
          }
        };
        
        setUserProfile(optimisticProfile);
        console.log('🔄 Optimistically deleted achievement:', achievementId);
      }
      
      await apiService.deleteAchievement(achievementId);
      // Don't refresh to avoid infinite loop
      console.log('✅ Achievement deleted from database');
    } catch (err) {
      // Rollback on error
      if (originalProfile) {
        setUserProfile(originalProfile);
        console.log('🔄 Rolled back achievement deletion');
      }
      setError(err instanceof Error ? err.message : 'Failed to delete achievement');
      console.error('❌ Error deleting achievement:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userProfile, refreshProfile]);

  // Auto-refresh functionality - DISABLED to prevent infinite loop
  const enableAutoRefresh = useCallback((intervalMs: number = 30000) => {
    console.log('🚫 Auto-refresh disabled to prevent infinite loop');
    // Disabled to prevent infinite loop
  }, []);

  const disableAutoRefresh = useCallback(() => {
    if (autoRefreshInterval.current) {
      clearInterval(autoRefreshInterval.current);
      autoRefreshInterval.current = null;
    }
    autoRefreshEnabled.current = false;
    console.log('❌ Auto-refresh disabled');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disableAutoRefresh();
    };
  }, [disableAutoRefresh]);

  const value: UserProfileContextType = {
    userProfile,
    loading,
    error,
    isInitialLoad,
    lastUpdated,
    refreshProfile,
    updateProfile,
    updateProfileField,
    addExperience,
    updateExperience,
    deleteExperience,
    addAchievement,
    updateAchievement,
    deleteAchievement,
    enableAutoRefresh,
    disableAutoRefresh,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}