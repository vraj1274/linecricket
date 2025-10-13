import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit3, MessageCircle, Phone, Star, Users, Award, Trophy, Target, TrendingUp, Send, Heart, Share2, Bookmark, Shield, Eye, Grid3X3, List, Calendar, MapPin, Clock, X } from 'lucide-react';
import { useProfileSwitch } from '../contexts/ProfileSwitchContext';
import { useToast } from '../contexts/ToastContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { ComprehensiveProfileEdit } from './ComprehensiveProfileEdit';
import { AppDownloadModal } from './AppDownloadModal';
import { apiService } from '../services/api';

interface DynamicProfileViewProps {
  onBack: () => void;
  onNavigateToEdit?: () => void;
}

export function DynamicProfileView({ onBack, onNavigateToEdit }: DynamicProfileViewProps) {
  const { currentProfile, availableProfiles } = useProfileSwitch();
  const { userProfile } = useUserProfile();
  const { user: firebaseUser } = useFirebase();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'achievements'>('posts');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [showAddAchievement, setShowAddAchievement] = useState(false);
  const [showAppDownloadModal, setShowAppDownloadModal] = useState(false);
  const [experienceForm, setExperienceForm] = useState({ title: '', role: '', duration: '', description: '' });
  const [achievementForm, setAchievementForm] = useState({ title: '', description: '', year: '' });
  const { showSuccess, showError, showInfo } = useToast();

  useEffect(() => {
      loadProfileData();
  }, [userProfile, firebaseUser]);

  // Add a listener for localStorage changes to refresh profile data
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userProfile' && e.newValue) {
        console.log('📋 localStorage profile data changed, refreshing...');
        loadProfileData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      // Check localStorage first for any saved data
      const savedData = localStorage.getItem('userProfile');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          console.log('📋 Found saved profile data in localStorage:', parsedData);
          // Merge saved data with current profile data
          if (userProfile) {
            const realData = getRealProfileData(userProfile, firebaseUser);
            const mergedData = { ...realData, ...parsedData };
            setProfileData(mergedData);
            console.log('📋 Using merged profile data:', mergedData);
            return;
          }
        } catch (error) {
          console.warn('⚠️ Failed to parse localStorage data:', error);
        }
      }

      // Use actual user profile data if available, otherwise use Firebase user data
      let baseData;
      if (userProfile) {
        baseData = getRealProfileData(userProfile, firebaseUser);
      } else if (firebaseUser) {
        baseData = getFirebaseProfileData(firebaseUser);
      } else {
        // Fallback to mock data if no user data available
        baseData = getMockProfileData('player');
      }

      // Load experiences and achievements from database
      try {
        console.log('🔄 Loading experiences and achievements from database...');
        const [experiencesResponse, achievementsResponse] = await Promise.all([
          apiService.getExperiences(),
          apiService.getAchievements()
        ]);

        console.log('📋 Loaded experiences from database:', experiencesResponse);
        console.log('📋 Loaded achievements from database:', achievementsResponse);
        console.log('📋 Experiences count:', experiencesResponse.experiences?.length || 0);
        console.log('📋 Achievements count:', achievementsResponse.achievements?.length || 0);

        // Merge database data with base profile data
        const updatedData = {
          ...baseData,
          experience: experiencesResponse.experiences || [],
          achievements: achievementsResponse.achievements || []
        };

        console.log('📋 Setting profile data with database content...');
        setProfileData(updatedData);
        console.log('📋 Final profile data with database content:', updatedData);
      } catch (dbError) {
        console.warn('⚠️ Failed to load experiences/achievements from database:', dbError);
        console.log('🔄 Using base data without database content');
        // Use base data without database content
        setProfileData(baseData);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      showError('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const getRealProfileData = (userProfile: any, firebaseUser: any) => {
    return {
      id: userProfile.id,
      name: userProfile.full_name || userProfile.username || firebaseUser?.displayName || 'User',
      username: userProfile.username || firebaseUser?.email?.split('@')[0] || 'user',
      bio: userProfile.bio || `This is a ${userProfile.profile_type || 'player'} profile.`,
      location: userProfile.location || 'Not provided',
      profileType: userProfile.profile_type || 'player',
      avatar: userProfile.full_name?.charAt(0)?.toUpperCase() || firebaseUser?.displayName?.charAt(0)?.toUpperCase() || 'U',
      isVerified: userProfile.is_verified || false,
      isOnline: true,
      stats: {
        posts: userProfile.posts_count || 0,
        connections: userProfile.connections_count || 0,
        matches: userProfile.matches_count || 0,
        runs: userProfile.total_runs || 0
      },
      personalInfo: {
        fullName: userProfile.full_name || firebaseUser?.displayName || 'Not provided',
        contact: userProfile.contact_number || 'Not provided',
        location: userProfile.location || 'Not provided',
        email: userProfile.email || firebaseUser?.email || 'Not provided'
      },
      cricketStats: {
        batting: {
          totalRuns: userProfile.total_runs || 0,
          matches: userProfile.total_matches || 0,
          hundreds: userProfile.centuries || 0,
          fifties: userProfile.half_centuries || 0,
          average: userProfile.batting_average || 0,
          highest: userProfile.highest_score || 0
        },
        bowling: {
          matches: userProfile.total_matches || 0,
          wickets: userProfile.total_wickets || 0,
          best: userProfile.best_bowling_figures || '0/0',
          average: userProfile.bowling_average || 0
        },
        fielding: {
          matches: userProfile.total_matches || 0,
          catches: userProfile.catches || 0,
          stumpings: userProfile.stumpings || 0,
          runOuts: userProfile.run_outs || 0
        }
      },
      formatPerformance: [
        {
          format: 'Test Cricket',
          runs: userProfile.test_runs || 0,
          wickets: userProfile.test_wickets || 0,
          matches: userProfile.test_matches || 0,
          average: userProfile.test_runs && userProfile.test_matches ? (userProfile.test_runs / userProfile.test_matches) : 0
        },
        {
          format: 'ODI Cricket',
          runs: userProfile.odi_runs || 0,
          wickets: userProfile.odi_wickets || 0,
          matches: userProfile.odi_matches || 0,
          average: userProfile.odi_runs && userProfile.odi_matches ? (userProfile.odi_runs / userProfile.odi_matches) : 0
        },
        {
          format: 'T20 Cricket',
          runs: userProfile.t20_runs || 0,
          wickets: userProfile.t20_wickets || 0,
          matches: userProfile.t20_matches || 0,
          average: userProfile.t20_runs && userProfile.t20_matches ? (userProfile.t20_runs / userProfile.t20_matches) : 0
        }
      ],
      skillsRating: {
        batting: userProfile.batting_skill || 0,
        bowling: userProfile.bowling_skill || 0,
        fielding: userProfile.fielding_skill || 0
      },
      experience: [],
      achievements: [],
      upcomingMatches: [
        {
          id: '1',
          title: 'Sunday Cricket',
          location: 'Shivaji Park, 7:00 AM',
          date: 'Tomorrow'
        },
        {
          id: '2',
          title: 'Practice Match',
          location: 'Oval Maidan, 6:00 PM',
          date: 'Today'
        }
      ],
      posts: [],
      contactInfo: {
        phone: userProfile.contact_number || '+91 9876543210',
        email: userProfile.email || firebaseUser?.email || 'contact@example.com'
      }
    };
  };

  const getFirebaseProfileData = (firebaseUser: any) => {
    return {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      username: firebaseUser.email?.split('@')[0] || 'user',
      bio: 'This is a player profile.',
      location: 'Not provided',
      profileType: 'player',
      avatar: firebaseUser.displayName?.charAt(0)?.toUpperCase() || firebaseUser.email?.charAt(0)?.toUpperCase() || 'U',
      isVerified: firebaseUser.emailVerified || false,
      isOnline: true,
      stats: {
        posts: 0,
        connections: 0,
        matches: 0,
        runs: 0
      },
      personalInfo: {
        fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Not provided',
        contact: 'Not provided',
        location: 'Not provided',
        email: firebaseUser.email || 'Not provided'
      },
      cricketStats: {
        batting: {
          totalRuns: 0,
          matches: 0,
          hundreds: 0,
          fifties: 0,
          average: 0,
          highest: 0
        },
        bowling: {
          matches: 0,
          wickets: 0,
          best: '0/0',
          average: 0
        },
        fielding: {
          matches: 0,
          catches: 0,
          stumpings: 0,
          runOuts: 0
        }
      },
      formatPerformance: [
        {
          format: 'Test Cricket',
          runs: 0,
          wickets: 0,
          matches: 0,
          average: 0
        },
        {
          format: 'ODI Cricket',
          runs: 0,
          wickets: 0,
          matches: 0,
          average: 0
        },
        {
          format: 'T20 Cricket',
          runs: 0,
          wickets: 0,
          matches: 0,
          average: 0
        }
      ],
      skillsRating: {
        batting: 0,
        bowling: 0,
        fielding: 0
      },
      experience: [],
      achievements: [],
      upcomingMatches: [
        {
          id: '1',
          title: 'Sunday Cricket',
          location: 'Shivaji Park, 7:00 AM',
          date: 'Tomorrow'
        },
        {
          id: '2',
          title: 'Practice Match',
          location: 'Oval Maidan, 6:00 PM',
          date: 'Today'
        }
      ],
      posts: [],
      contactInfo: {
        phone: '+91 9876543210',
        email: firebaseUser.email || 'contact@example.com'
      }
    };
  };

  const getMockProfileData = (profileType: string) => {
    const baseData = {
      id: currentProfile?.id,
      name: currentProfile?.name || 'krisha mangukiya',
      username: currentProfile?.username || 'krishamangukiya2612',
      bio: `This is a ${profileType} profile.`,
      location: 'Mumbai, India',
      profileType,
      avatar: currentProfile?.avatar || 'K',
      isVerified: true,
      isOnline: true,
      stats: {
        posts: 42,
        connections: 0,
        matches: 0,
        runs: 0
      },
      personalInfo: {
        fullName: 'krisha mangukiya',
        contact: 'Not provided',
        location: 'Not provided',
        email: 'krishamangukiya2612@gmail.com'
      },
      cricketStats: {
        batting: {
          totalRuns: 0,
          matches: 0,
          hundreds: 0,
          fifties: 0,
          average: 0,
          highest: 0
        },
        bowling: {
          matches: 0,
          wickets: 0,
          best: '0/0',
          average: 0
        },
        fielding: {
          matches: 0,
          catches: 0,
          stumpings: 0,
          runOuts: 0
        }
      },
      formatPerformance: [
        {
          format: 'Test Cricket',
          runs: 0,
          wickets: 0,
          matches: 0,
          average: 0
        },
        {
          format: 'ODI Cricket',
          runs: 0,
          wickets: 0,
          matches: 0,
          average: 0
        },
        {
          format: 'T20 Cricket',
          runs: 0,
          wickets: 0,
          matches: 0,
          average: 0
        }
      ],
      skillsRating: {
        batting: 0,
        bowling: 0,
        fielding: 0
      },
      experience: [],
      achievements: [],
      upcomingMatches: [
        {
          id: '1',
          title: 'Sunday Cricket',
          location: 'Shivaji Park, 7:00 AM',
          date: 'Tomorrow'
        },
        {
          id: '2',
          title: 'Practice Match',
          location: 'Oval Maidan, 6:00 PM',
          date: 'Today'
        }
      ],
      posts: [],
      contactInfo: {
        phone: '+91 9876543210',
        email: 'contact@example.com'
      }
    };

    // Add type-specific data
    switch (profileType) {
      case 'player':
        return {
          ...baseData,
          bio: 'Passionate cricket player with 10+ years of experience',
          stats: { ...baseData.stats, matches: 45, runs: 2500, wickets: 120 }
        };
      case 'coach':
        return {
          ...baseData,
          bio: 'Professional cricket coach with 15+ years of experience',
          stats: { ...baseData.stats, experience: 15, students: 200, rating: 4.8 }
        };
      case 'venue':
        return {
          ...baseData,
          bio: 'Premium cricket venue with world-class facilities',
          stats: { ...baseData.stats, capacity: 500, bookings: 150, rating: 4.6 }
        };
      case 'academy':
        return {
          ...baseData,
          bio: 'Leading cricket academy nurturing young talent',
          stats: { ...baseData.stats, students: 300, coaches: 12, rating: 4.9 }
        };
      case 'community':
        return {
          ...baseData,
          bio: 'Active cricket community bringing players together',
          stats: { ...baseData.stats, members: 500, events: 25, rating: 4.7 }
        };
      default:
        return baseData;
    }
  };

  const handleEditProfile = () => {
    if (onNavigateToEdit) {
      onNavigateToEdit();
    } else {
    setIsEditing(true);
    }
  };

  const handleSaveProfile = (updatedData: any) => {
    setProfileData((prev: any) => prev ? { ...prev, ...updatedData } : null);
    setIsEditing(false);
    showSuccess('Success', 'Profile updated successfully!');
    // Refresh profile data to get latest changes from database
    loadProfileData();
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleShowSavedData = () => {
    const savedData = localStorage.getItem('userProfile');
    const contextData = userProfile;
    const currentData = profileData;
    
    console.log('🔍 Debug - Saved Data in localStorage:', savedData ? JSON.parse(savedData) : 'No data');
    console.log('🔍 Debug - Context Data:', contextData);
    console.log('🔍 Debug - Current Profile Data:', currentData);
    
    alert(`Debug Information:
    
localStorage Data: ${savedData ? 'Found' : 'Not found'}
Context Data: ${contextData ? 'Available' : 'Not available'}
Current Profile: ${currentData ? 'Loaded' : 'Not loaded'}

Check console for detailed data.`);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      showError('Error', 'Please enter a message');
      return;
    }

    setSendingMessage(true);
    try {
      // Simulate sending message
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Success', `Message sent to ${profileData?.name}!`);
      setMessageText('');
      setShowMessageModal(false);
    } catch (error) {
      showError('Error', 'Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleViewPersonalInfo = () => {
    setShowPersonalInfo(!showPersonalInfo);
    showInfo('Info', showPersonalInfo ? 'Personal information hidden' : 'Personal information shown');
  };

  const handleViewModeToggle = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    showInfo('Info', `Switched to ${mode} view`);
  };

  const handleAddExperience = () => {
    setShowAddExperience(true);
  };

  const handleAddAchievement = () => {
    setShowAddAchievement(true);
  };

  const handleExperienceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!experienceForm.title.trim()) {
      showError('Error', 'Please enter a title');
      return;
    }
    
    try {
      // Save to database via API
      const response = await apiService.addExperience({
        title: experienceForm.title,
        role: experienceForm.role,
        duration: experienceForm.duration,
        description: experienceForm.description
      });
      
      console.log('✅ Experience saved to database:', response);
      
      // Add experience to local profile data
      const newExperience = {
        id: Date.now(),
        title: experienceForm.title,
        role: experienceForm.role,
        duration: experienceForm.duration,
        description: experienceForm.description
      };
      
      setProfileData((prev: any) => ({
        ...prev,
        experience: [...(prev.experience || []), newExperience]
      }));
      
      showSuccess('Success', 'Experience added successfully and saved to database!');
      setExperienceForm({ title: '', role: '', duration: '', description: '' });
      setShowAddExperience(false);
    } catch (error) {
      console.error('❌ Error saving experience:', error);
      showError('Error', 'Failed to save experience to database');
    }
  };

  const handleAchievementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!achievementForm.title.trim()) {
      showError('Error', 'Please enter a title');
      return;
    }
    
    try {
      // Save to database via API
      const response = await apiService.addAchievement({
        title: achievementForm.title,
        description: achievementForm.description,
        year: achievementForm.year
      });
      
      console.log('✅ Achievement saved to database:', response);
      
      // Add achievement to local profile data
      const newAchievement = {
        id: Date.now(),
        title: achievementForm.title,
        description: achievementForm.description,
        year: achievementForm.year
      };
      
      setProfileData((prev: any) => ({
        ...prev,
        achievements: [...(prev.achievements || []), newAchievement]
      }));
      
      showSuccess('Success', 'Achievement added successfully and saved to database!');
      setAchievementForm({ title: '', description: '', year: '' });
      setShowAddAchievement(false);
    } catch (error) {
      console.error('❌ Error saving achievement:', error);
      showError('Error', 'Failed to save achievement to database');
    }
  };

  const handleDeleteExperience = async (id: number) => {
    try {
      // Delete from database via API
      await apiService.deleteExperience(id);
      console.log('✅ Experience deleted from database:', id);
      
      // Remove from local profile data
      setProfileData((prev: any) => ({
        ...prev,
        experience: prev.experience.filter((exp: any) => exp.id !== id)
      }));
      showSuccess('Success', 'Experience deleted successfully from database!');
    } catch (error) {
      console.error('❌ Error deleting experience:', error);
      showError('Error', 'Failed to delete experience from database');
    }
  };

  const handleDeleteAchievement = async (id: number) => {
    try {
      // Delete from database via API
      await apiService.deleteAchievement(id);
      console.log('✅ Achievement deleted from database:', id);
      
      // Remove from local profile data
      setProfileData((prev: any) => ({
        ...prev,
        achievements: prev.achievements.filter((ach: any) => ach.id !== id)
      }));
      showSuccess('Success', 'Achievement deleted successfully from database!');
    } catch (error) {
      console.error('❌ Error deleting achievement:', error);
      showError('Error', 'Failed to delete achievement from database');
    }
  };

  const handleMatchClick = (matchId: string) => {
    showInfo('Info', `Viewing match details for ${matchId}`);
  };

  if (isEditing && currentProfile) {
    return (
      <ComprehensiveProfileEdit
        profileType={currentProfile.type}
        profileId={currentProfile.id.toString()}
        initialData={profileData}
        onBack={handleCancelEdit}
        onSave={handleSaveProfile}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No profile data found</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-6 mb-6">
              <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-white text-xl font-bold">
                {profileData.avatar}
              </div>
              {profileData.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-gray-900 leading-tight">
                {profileData.name?.split(' ')[0] || 'User'}
              </div>
              <div className="text-2xl font-bold text-gray-900 leading-tight">
                {profileData.name?.split(' ').slice(1).join(' ') || ''}
              </div>
              <p className="text-gray-600 mt-1">@{profileData.username}</p>
            </div>
          </div>

          {/* Statistics Overview */}
          <div className="flex gap-4 mb-6">
            <div className="bg-gray-100 rounded-lg p-4 text-center flex-1">
              <div className="text-2xl font-bold text-gray-900">{profileData.stats.posts}</div>
              <div className="text-sm text-gray-600">Posts</div>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 text-center flex-1">
              <div className="text-2xl font-bold text-gray-900">{profileData.stats.connections}</div>
              <div className="text-sm text-gray-600">Connections</div>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 text-center flex-1">
              <div className="text-2xl font-bold text-gray-900">{profileData.stats.matches}</div>
              <div className="text-sm text-gray-600">Matches</div>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 text-center flex-1">
              <div className="text-2xl font-bold text-gray-900">{profileData.stats.runs}</div>
              <div className="text-sm text-gray-600">Runs</div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <div className="flex justify-center mb-8 gap-4">
            <button
              onClick={handleEditProfile}
              className="px-8 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Edit Profile
            </button>
            <button
              onClick={() => setShowAppDownloadModal(true)}
              className="px-8 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Connect
            </button>
          </div>

          {/* Personal Information Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
              </div>
              <button 
                onClick={handleViewPersonalInfo}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-gray-900 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showPersonalInfo ? (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Private details visible only to you</p>
            
            {showPersonalInfo && (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name:</p>
                    <p className="font-semibold text-gray-900">{profileData.personalInfo.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact:</p>
                    <p className="font-semibold text-gray-900">{profileData.personalInfo.contact}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Location:</p>
                    <p className="font-semibold text-gray-900">{profileData.personalInfo.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email:</p>
                    <p className="font-semibold text-gray-900">{profileData.personalInfo.email}</p>
                  </div>
                </div>
              </div>
            )}
            
            {!showPersonalInfo && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">Click "View" to see your personal information</p>
              </div>
            )}
            
          {/* Posts Count and View Toggles */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Posts {profileData.stats.posts}</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => handleViewModeToggle('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleViewModeToggle('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="mb-8">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-3 gap-2">
                {/* Sample posts - replace with actual posts data */}
                {Array.from({ length: Math.min(9, profileData.stats.posts) }, (_, index) => (
                  <div key={index} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-gray-500 text-sm">Post {index + 1}</div>
                  </div>
                ))}
                {/* Empty slots if less than 9 posts */}
                {Array.from({ length: Math.max(0, 9 - profileData.stats.posts) }, (_, index) => (
                  <div key={`empty-${index}`} className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <div className="text-gray-400 text-sm">+</div>
            </div>
                ))}
            </div>
            ) : (
              <div className="space-y-3">
                {Array.from({ length: Math.min(5, profileData.stats.posts) }, (_, index) => (
                  <div key={index} className="bg-gray-100 rounded-lg p-4">
                    <div className="text-gray-700">Post {index + 1}</div>
            </div>
                ))}
              </div>
            )}
            
            {/* See More Posts Button */}
            {profileData.stats.posts > 9 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => showInfo('Info', 'See more posts feature coming soon!')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  See More Posts
                </button>
              </div>
            )}
          </div>

          {/* Cricket Statistics */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Cricket Statistics</h3>
            
            {/* Batting Section */}
            <div className="mb-6">
              <h4 className="text-md font-bold text-gray-900 mb-3">BATTING</h4>
              <div className="space-y-0">
                {[
                  { label: 'Total Runs', value: profileData.cricketStats.batting.totalRuns },
                  { label: 'Matches', value: profileData.cricketStats.batting.matches },
                  { label: '100s', value: profileData.cricketStats.batting.hundreds },
                  { label: '50s', value: profileData.cricketStats.batting.fifties },
                  { label: 'Average', value: profileData.cricketStats.batting.average },
                  { label: 'Highest', value: profileData.cricketStats.batting.highest }
                ].map((stat, index) => (
                  <div key={stat.label} className={`flex justify-between items-center py-3 px-4 ${index % 2 === 0 ? 'bg-orange-50' : 'bg-white'}`}>
                    <span className="text-gray-700">{stat.label}</span>
                    <span className="font-semibold text-orange-600">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bowling Section */}
            <div className="mb-6">
              <h4 className="text-md font-bold text-blue-600 mb-3">BOWLING</h4>
              <div className="flex gap-4">
                <div className="bg-blue-50 rounded-lg p-4 flex-1">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Matches</span>
                    <span className="font-semibold text-gray-900">{profileData.cricketStats.bowling.matches}</span>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 flex-1">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Wickets</span>
                    <span className="font-semibold text-gray-900">{profileData.cricketStats.bowling.wickets}</span>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 flex-1">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Best</span>
                    <span className="font-semibold text-gray-900">{profileData.cricketStats.bowling.best}</span>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 flex-1">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Average</span>
                    <span className="font-semibold text-gray-900">{profileData.cricketStats.bowling.average}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fielding Section */}
            <div className="mb-6">
              <h4 className="text-md font-bold text-green-600 mb-3">FIELDING</h4>
              <div className="flex gap-4">
                <div className="bg-green-50 rounded-lg p-4 flex-1">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Matches</span>
                    <span className="font-semibold text-gray-900">{profileData.cricketStats.fielding.matches}</span>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 flex-1">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Catches</span>
                    <span className="font-semibold text-gray-900">{profileData.cricketStats.fielding.catches}</span>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 flex-1">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Stumpings</span>
                    <span className="font-semibold text-gray-900">{profileData.cricketStats.fielding.stumpings}</span>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 flex-1">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Run Outs</span>
                    <span className="font-semibold text-gray-900">{profileData.cricketStats.fielding.runOuts}</span>
                  </div>
                </div>
              </div>
                </div>
                
            {/* Format Performance */}
            <div className="mb-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Format Performance</h4>
              <div className="space-y-3">
                {profileData.formatPerformance.map((format: any, index: number) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                <div>
                        <h5 className="font-semibold text-gray-900">{format.format}</h5>
                        <p className="text-sm text-gray-600">{format.runs} runs • {format.wickets} wickets</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{format.matches} matches</p>
                        <p className="text-sm text-gray-600">Avg: {format.average}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Rating */}
            <div className="mb-8">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Skills Rating</h4>
              <div className="space-y-3">
                {[
                  { skill: 'Batting', percentage: profileData.skillsRating.batting },
                  { skill: 'Bowling', percentage: profileData.skillsRating.bowling },
                  { skill: 'Fielding', percentage: profileData.skillsRating.fielding }
                ].map((skill, index) => (
                  <div key={skill.skill} className="flex items-center justify-between">
                    <span className="text-gray-700">{skill.skill}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${skill.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{skill.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Experience Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Experience</h3>
              <button 
                onClick={handleAddExperience}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Add Experience
              </button>
            </div>
            {profileData.experience && profileData.experience.length > 0 ? (
              <div className="space-y-4">
                {profileData.experience.map((exp: any) => (
                  <div key={exp.id} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                        {exp.role && (
                          <p className="text-gray-600 text-sm mb-1">{exp.role}</p>
                        )}
                        {exp.duration && (
                          <p className="text-gray-500 text-xs mb-1">{exp.duration}</p>
                        )}
                        {exp.description && (
                          <p className="text-gray-600 text-sm">{exp.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteExperience(exp.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete experience"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No experience added yet</p>
              </div>
            )}
          </div>

          {/* Achievements Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Achievements</h3>
              <button 
                onClick={handleAddAchievement}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                Add Achievement
              </button>
            </div>
            {profileData.achievements && profileData.achievements.length > 0 ? (
              <div className="space-y-4">
                {profileData.achievements.map((achievement: any) => (
                  <div key={achievement.id} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Award className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                        {achievement.description && (
                          <p className="text-gray-600 text-sm mb-1">{achievement.description}</p>
                        )}
                        {achievement.year && (
                          <p className="text-gray-500 text-xs">{achievement.year}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteAchievement(achievement.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete achievement"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No achievements added yet</p>
              </div>
            )}
          </div>

          {/* Upcoming Matches */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Upcoming Matches</h3>
            <div className="space-y-3">
              {profileData.upcomingMatches.map((match: any) => (
                <div 
                  key={match.id} 
                  onClick={() => handleMatchClick(match.id)}
                  className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-semibold text-gray-900">{match.title}</h5>
                      <p className="text-sm text-gray-600">{match.location}</p>
                    </div>
                    <span className="text-sm text-gray-500">{match.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm">
            <p>© 2024 thelinecricket</p>
          </div>
        </div>

        {/* Message Modal */}
        {showMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Message</h3>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {sendingMessage ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* App Download Modal */}
      <AppDownloadModal
        isOpen={showAppDownloadModal}
        onClose={() => setShowAppDownloadModal(false)}
        feature="Follow"
      />

      {/* Add Experience Modal */}
      {showAddExperience && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAddExperience(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add Experience</h2>
              <button
                onClick={() => setShowAddExperience(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleExperienceSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={experienceForm.title}
                  onChange={(e) => setExperienceForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Cricket Coach"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value={experienceForm.role}
                  onChange={(e) => setExperienceForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Head Coach"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={experienceForm.duration}
                  onChange={(e) => setExperienceForm(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 2020-2023"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={experienceForm.description}
                  onChange={(e) => setExperienceForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Describe your experience..."
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddExperience(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Achievement Modal */}
      {showAddAchievement && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAddAchievement(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add Achievement</h2>
              <button
                onClick={() => setShowAddAchievement(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAchievementSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={achievementForm.title}
                  onChange={(e) => setAchievementForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Best Batsman Award"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="text"
                  value={achievementForm.year}
                  onChange={(e) => setAchievementForm(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 2023"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={achievementForm.description}
                  onChange={(e) => setAchievementForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Describe your achievement..."
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddAchievement(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Add Achievement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default DynamicProfileView;
