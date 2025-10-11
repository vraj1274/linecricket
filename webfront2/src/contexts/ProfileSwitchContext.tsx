import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { useFirebase } from './FirebaseContext';
import { profileManagementService, ProfileData } from '../services/profileManagementService';
import { profileSwitchService, UserProfile as SwitchUserProfile } from '../services/profileSwitchService';

export interface UserProfile {
  id: number | string;
  type: 'player' | 'coach' | 'venue' | 'academy' | 'community';
  name: string;
  username: string;
  avatar: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  firebaseUid: string;
}

interface ProfileSwitchContextType {
  currentProfile: UserProfile | null;
  availableProfiles: UserProfile[];
  switchProfile: (profileId: number | string) => Promise<void>;
  addProfile: (profile: UserProfile) => void;
  getProfilePage: (profileType: string, profileId?: number | string) => string;
  loading: boolean;
  error: string | null;
}

const ProfileSwitchContext = createContext<ProfileSwitchContextType | undefined>(undefined);

interface ProfileSwitchProviderProps {
  children: ReactNode;
}

export function ProfileSwitchProvider({ children }: ProfileSwitchProviderProps) {
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [availableProfiles, setAvailableProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useFirebase();

  // Helper function to get profile color based on type
  const getProfileColor = (type: string): string => {
    switch (type) {
      case 'academy':
        return 'linear-gradient(to bottom right, #4F46E5, #7C3AED)';
      case 'venue':
        return 'linear-gradient(to bottom right, #059669, #0D9488)';
      case 'community':
        return 'linear-gradient(to bottom right, #DC2626, #EA580C)';
      case 'coach':
        return 'linear-gradient(to bottom right, #7C2D12, #92400E)';
      case 'player':
        return 'linear-gradient(to bottom right, #1E40AF, #3730A3)';
      default:
        return 'linear-gradient(to bottom right, #6B7280, #4B5563)';
    }
  };

  // Load user profiles when Firebase user changes
  useEffect(() => {
    console.log('🔄 ProfileSwitchContext: useEffect triggered');
    console.log('👤 User in useEffect:', user);
    console.log('🆔 User UID:', user?.uid);
    
    if (user) {
      console.log('✅ User found, calling loadUserProfiles');
      loadUserProfiles();
    } else {
      console.log('❌ No user found, clearing profiles');
      setCurrentProfile(null);
      setAvailableProfiles([]);
    }
  }, [user?.uid]); // Only depend on user ID to prevent unnecessary reloads

  // Fallback: Load profiles even if user is not authenticated (for public pages)
  useEffect(() => {
    if (!user && availableProfiles.length === 0) {
      console.log('🔄 Fallback: Loading public profiles without user authentication');
      loadPublicProfiles();
    }
  }, [user, availableProfiles.length]);

  // Initialize with a default player profile if no profiles exist
  useEffect(() => {
    if (user && availableProfiles.length === 0 && !loading) {
      const defaultProfile: UserProfile = {
        id: user.uid, // Use Firebase UID as the actual profile ID
        type: 'player',
        name: 'My Pages',
        username: `@${user.email?.split('@')[0] || 'mypages'}`,
        avatar: (user.displayName || 'MP').split(' ').map(n => n[0]).join('').toUpperCase(),
        color: 'linear-gradient(to bottom right, #5D798E, #2E4B5F)',
        isActive: true,
        createdAt: new Date().toISOString(),
        firebaseUid: user.uid
      };
      setAvailableProfiles([defaultProfile]);
      setCurrentProfile(defaultProfile);
    }
  }, [user?.uid, availableProfiles.length, loading]); // Only depend on user ID

  const loadPublicProfiles = async () => {
    console.log('🔄 ProfileSwitchContext: loadPublicProfiles called (fallback)');
    
    setLoading(true);
    setError(null);

    try {
      console.log('📡 Making API request to /api/profiles (public)');
      const response = await fetch('http://localhost:5000/api/profiles', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('📡 API Response status:', response.status);
      let createdProfiles: UserProfile[] = [];
      
      if (response.ok) {
        const result = await response.json();
        console.log('📊 API response:', result);
        
        if (result.profiles && result.profiles.length > 0) {
          console.log(`📋 Found ${result.profiles.length} public profiles from API`);
          // Transform API profiles to UserProfile format
          createdProfiles = result.profiles.map((profile: any) => ({
            id: `page_${profile.id}`, // Prefix with 'page_' to distinguish from user profile
            type: profile.type,
            name: profile.name,
            username: `@${profile.name.toLowerCase().replace(/\s+/g, '_')}`,
            avatar: profile.name.charAt(0).toUpperCase(),
            color: getProfileColor(profile.type),
            isActive: false,
            createdAt: profile.created_at || new Date().toISOString(),
            firebaseUid: 'public' // Mark as public profile
          }));
          
          console.log('🔄 Transformed public profiles:', createdProfiles);
        } else {
          console.log('⚠️  No public profiles found in API response');
        }
      } else {
        console.log('❌ API request failed:', response.status, response.statusText);
      }

      // Set available profiles (only created pages, no "My Pages" for public)
      setAvailableProfiles(createdProfiles);
      
      // Set the first profile as active if none is currently active
      if (createdProfiles.length > 0 && !currentProfile) {
        setCurrentProfile(createdProfiles[0]);
        setAvailableProfiles(prev => 
          prev.map(p => ({ ...p, isActive: p.id === createdProfiles[0].id }))
        );
      }

      console.log('✅ Public profiles loaded successfully');
      
    } catch (error) {
      console.error('❌ Error loading public profiles:', error);
      setError('Failed to load public profiles');
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfiles = async () => {
    console.log('🔄 ProfileSwitchContext: loadUserProfiles called');
    console.log('👤 User object:', user);
    
    if (!user) {
      console.log('❌ No user found, skipping profile load');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📡 Making API request to /api/profiles');
      // Load profiles directly from the API
      const response = await fetch('http://localhost:5000/api/profiles', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('📡 API Response status:', response.status);
      let createdProfiles: UserProfile[] = [];
      
      if (response.ok) {
        const result = await response.json();
        console.log('📊 API response:', result);
        
        if (result.profiles && result.profiles.length > 0) {
          console.log(`📋 Found ${result.profiles.length} profiles from API`);
          // Transform API profiles to UserProfile format
          createdProfiles = result.profiles.map((profile: any) => ({
            id: `page_${profile.id}`, // Prefix with 'page_' to distinguish from user profile
            type: profile.type,
            name: profile.name,
            username: `@${profile.name.toLowerCase().replace(/\s+/g, '_')}`,
            avatar: profile.name.charAt(0).toUpperCase(),
            color: getProfileColor(profile.type),
            isActive: false,
            createdAt: profile.created_at || new Date().toISOString(),
            firebaseUid: user.uid
          }));
          
          console.log('🔄 Transformed profiles:', createdProfiles);
        } else {
          console.log('⚠️  No profiles found in API response');
        }
      } else {
        console.log('❌ API request failed:', response.status, response.statusText);
      }

      // Always add a "My Pages" option at the beginning with actual profile ID
      const myProfile: UserProfile = {
        id: user.uid, // Use Firebase UID as the actual profile ID
        type: 'player',
        name: 'My Pages',
        username: `@${user.email?.split('@')[0] || 'mypages'}`,
        avatar: (user.displayName || 'MP').split(' ').map(n => n[0]).join('').toUpperCase(),
        color: 'linear-gradient(to bottom right, #FF6B33, #2E4B5F)',
        isActive: true,
        createdAt: new Date().toISOString(),
        firebaseUid: user.uid
      };

      setAvailableProfiles([myProfile, ...createdProfiles]);
      
      // Set the first profile as active if none is currently active
      if (!currentProfile) {
        setCurrentProfile(myProfile);
      }
      
    } catch (err) {
      console.error('Error loading profiles:', err);
      setError('Failed to load profiles');
      
      // Fallback to default profile
      const defaultProfile: UserProfile = {
        id: user.uid, // Use Firebase UID as the actual profile ID
        type: 'player',
        name: 'My Pages',
        username: `@${user.email?.split('@')[0] || 'mypages'}`,
        avatar: (user.displayName || 'MP').split(' ').map(n => n[0]).join('').toUpperCase(),
        color: 'linear-gradient(to bottom right, #5D798E, #2E4B5F)',
        isActive: true,
        createdAt: new Date().toISOString(),
        firebaseUid: user.uid
      };
      setAvailableProfiles([defaultProfile]);
      setCurrentProfile(defaultProfile);
    } finally {
      setLoading(false);
    }
  };

  const switchProfile = async (profileId: number | string): Promise<void> => {
    const profile = availableProfiles.find(p => String(p.id) === String(profileId));
    if (profile && user) {
      try {
        // Call the switching API
        const response = await profileSwitchService.switchProfile({
          email: user.email || '',
          profile_id: profileId.toString(),
          profile_type: profile.type
        });

        if (response.success) {
          // Update active status for all profiles
          setAvailableProfiles(prev => 
            prev.map(p => ({ ...p, isActive: String(p.id) === String(profileId) }))
          );
          
          // Set the new active profile
          setCurrentProfile(profile);
          
          console.log(`Successfully switched to profile: ${profile.name} (${profile.type})`);
        } else {
          console.error('Failed to switch profile:', response.error);
          setError('Failed to switch profile');
          throw new Error(response.error || 'Failed to switch profile');
        }
      } catch (error) {
        console.error('Error switching profile:', error);
        setError('Failed to switch profile');
        throw error;
      }
    } else {
      throw new Error('Profile not found or user not authenticated');
    }
  };

  const addProfile = async (profile: UserProfile) => {
    try {
      console.log('Adding profile to context:', profile);
      
      // Add to available profiles list immediately for UI responsiveness
      setAvailableProfiles(prev => {
        // Check if profile already exists (by ID or name)
        const exists = prev.some(p => p.id === profile.id || p.name === profile.name);
        if (exists) {
          console.log('Profile already exists, not adding duplicate:', profile);
          return prev; // Don't add duplicate
        }
        console.log('Adding new profile to list:', profile);
        return [...prev, profile];
      });
      
      // Switch to the new profile
      setCurrentProfile(profile);
      
      // Update active status for all profiles
      setAvailableProfiles(prev => 
        prev.map(p => ({ ...p, isActive: p.id === profile.id }))
      );

      console.log('Profile successfully added and set as active');
      
      // Reload profiles from API to ensure we have the latest data
      setTimeout(() => {
        loadUserProfiles();
      }, 1000);
      
    } catch (error) {
      console.error('Error adding profile:', error);
      setError('Failed to add profile');
    }
  };

  const getProfilePage = (profileType: string, profileId?: number | string): string => {
    // Special case for "My Pages" (user's actual profile)
    if (profileId === user?.uid) {
      return 'my-profile';
    }
    // Use created page view for academy, venue, community pages (created pages)
    if (['academy', 'venue', 'community'].includes(profileType)) {
      return 'created-page';
    }
    // Use dynamic profile page for other profile types (user profiles)
    return 'dynamic-profile';
  };

  const value: ProfileSwitchContextType = {
    currentProfile,
    availableProfiles,
    switchProfile,
    addProfile,
    getProfilePage,
    loading,
    error
  };

  return (
    <ProfileSwitchContext.Provider value={value}>
      {children}
    </ProfileSwitchContext.Provider>
  );
}

export function useProfileSwitch() {
  const context = useContext(ProfileSwitchContext);
  if (context === undefined) {
    throw new Error('useProfileSwitch must be used within a ProfileSwitchProvider');
  }
  return context;
}
