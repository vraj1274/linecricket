import { ArrowLeft, Save, User, Phone, MapPin, Building, Trophy, Target, Mail, Calendar, Users, Camera } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { auth } from '../firebase/config';
import { ImageUploadModal } from './ImageUploadModal';

interface EditProfilePageProps {
  onBack: () => void;
}

export function EditProfilePage({ onBack }: EditProfilePageProps) {
  const { userProfile, updateProfile, refreshProfile } = useUserProfile();
  const { user: firebaseUser } = useFirebase();
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    bio: '',
    location: '',
    organization: '',
    age: '',
    gender: 'Male',
    contact: '',
    email: '',
    batting_skill: 0,
    bowling_skill: 0,
    fielding_skill: 0,
    profile_image_url: '',
  });

  // Cricket Statistics
  const [cricketStats, setCricketStats] = useState({
    batting: {
      totalRuns: 0,
      matches: 0,
      centuries: 0,
      halfCenturies: 0,
      average: 0,
      highest: 0
    },
    bowling: {
      matches: 0,
      overs: 0,
      wickets: 0,
      hatTricks: 0,
      best: '0/0',
      average: 0
    },
    fielding: {
      matches: 0,
      catches: 0,
      stumpings: 0,
      runOuts: 0
    }
  });

  // Format Performance
  const [formatPerformance, setFormatPerformance] = useState({
    test: { matches: 0, runs: 0, wickets: 0, average: 0 },
    odi: { matches: 0, runs: 0, wickets: 0, average: 0 },
    t20: { matches: 0, runs: 0, wickets: 0, average: 0 }
  });

  // Skills Rating
  const [skillsRating, setSkillsRating] = useState({
    batting: 0,
    bowling: 0,
    fielding: 0
  });

  // Experience
  const [experience, setExperience] = useState([
    { title: '', role: '', duration: '', description: '' }
  ]);

  // Achievements
  const [achievements, setAchievements] = useState([
    { title: '', description: '', year: '' }
  ]);

  // Awards
  const [awards, setAwards] = useState([
    { title: '', organization: '', year: '' }
  ]);

  // Load profile data when component mounts or profile changes
  useEffect(() => {
    const firebaseUser = auth.currentUser;
    
    console.log('🔄 EditProfilePage useEffect triggered');
    console.log('📋 userProfile:', userProfile);
    console.log('🔥 firebaseUser:', firebaseUser);
    
    
    if (userProfile) {
      console.log('📋 Loading profile data into form:', userProfile);
      
      setFormData({
        fullName: userProfile.profile?.full_name || firebaseUser?.displayName || '',
        username: userProfile.username || firebaseUser?.email?.split('@')[0] || '',
        bio: userProfile.profile?.bio || '',
        location: userProfile.profile?.location || '',
        organization: userProfile.profile?.organization || '',
        age: userProfile.profile?.age?.toString() || '',
        gender: userProfile.profile?.gender || 'Male',
        contact: userProfile.profile?.contact_number || '',
        email: firebaseUser?.email || userProfile.email || '',
        isVerified: userProfile.is_verified || false,
        profileImage: null,
      });

      if (userProfile.profile?.stats) {
        setCricketStats({
          batting: {
            totalRuns: userProfile.profile.stats.total_runs || 0,
            matches: userProfile.profile.stats.total_matches || 0,
            centuries: userProfile.profile.stats.centuries || 0,
            halfCenturies: userProfile.profile.stats.half_centuries || 0,
            average: userProfile.profile.stats.batting_average || 0,
            highest: userProfile.profile.stats.highest_score || 0
          },
          bowling: {
            matches: userProfile.profile.stats.total_matches || 0,
            overs: 0, // This would need to be calculated from balls_bowled
            wickets: userProfile.profile.stats.total_wickets || 0,
            hatTricks: 0, // Not in current schema
            best: userProfile.profile.stats.best_bowling_figures || '0/0',
            average: userProfile.profile.stats.bowling_average || 0
          },
          fielding: {
            matches: userProfile.profile.stats.total_matches || 0,
            catches: userProfile.profile.stats.catches || 0,
            stumpings: userProfile.profile.stats.stumpings || 0,
            runOuts: userProfile.profile.stats.run_outs || 0
          }
        });

        setFormatPerformance({
          test: { 
            matches: userProfile.profile.stats.test_matches || 0, 
            runs: userProfile.profile.stats.test_runs || 0, 
            wickets: userProfile.profile.stats.test_wickets || 0, 
            average: 0 
          },
          odi: { 
            matches: userProfile.profile.stats.odi_matches || 0, 
            runs: userProfile.profile.stats.odi_runs || 0, 
            wickets: userProfile.profile.stats.odi_wickets || 0, 
            average: 0 
          },
          t20: { 
            matches: userProfile.profile.stats.t20_matches || 0, 
            runs: userProfile.profile.stats.t20_runs || 0, 
            wickets: userProfile.profile.stats.t20_wickets || 0, 
            average: 0 
          }
        });

        setSkillsRating({
          batting: userProfile.profile.batting_skill || 0,
          bowling: userProfile.profile.bowling_skill || 0,
          fielding: userProfile.profile.fielding_skill || 0
        });

        setExperience((userProfile.profile.experiences || []).map(exp => ({
          title: exp.title || '',
          role: exp.role || '',
          duration: exp.duration || '',
          description: exp.description || ''
        })));
        setAchievements((userProfile.profile.achievements || []).map(ach => ({
          title: ach.title || '',
          description: ach.description || '',
          year: ach.year || ''
        })));
      }
    } else if (firebaseUser) {
      // If no backend profile yet, pre-fill with Firebase data
      setFormData({
        fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
        username: firebaseUser.email?.split('@')[0] || '',
        bio: '',
        location: '',
        organization: '',
        age: '',
        gender: 'Male',
        contact: '',
        email: firebaseUser.email || '',
        isVerified: false,
        profileImage: null,
      });
    } else {
      // Fallback: Try to load from localStorage
      console.log('📋 No context or Firebase data, trying localStorage fallback...');
      try {
        const savedData = localStorage.getItem('userProfile');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          console.log('📋 Loaded data from localStorage:', parsedData);
          
          // Update form data with saved data
          if (parsedData.fullName) setFormData(prev => ({ ...prev, fullName: parsedData.fullName }));
          if (parsedData.username) setFormData(prev => ({ ...prev, username: parsedData.username }));
          if (parsedData.bio) setFormData(prev => ({ ...prev, bio: parsedData.bio }));
          if (parsedData.location) setFormData(prev => ({ ...prev, location: parsedData.location }));
          if (parsedData.organization) setFormData(prev => ({ ...prev, organization: parsedData.organization }));
          if (parsedData.age) setFormData(prev => ({ ...prev, age: parsedData.age }));
          if (parsedData.gender) setFormData(prev => ({ ...prev, gender: parsedData.gender }));
          if (parsedData.contact) setFormData(prev => ({ ...prev, contact: parsedData.contact }));
          if (parsedData.email) setFormData(prev => ({ ...prev, email: parsedData.email }));
        }
      } catch (error) {
        console.warn('⚠️ Failed to load from localStorage:', error);
      }
    }
  }, [userProfile]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showImageUpload, setShowImageUpload] = useState(false);

  // Load profile data when component mounts
  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      
      try {
        // Get Firebase token
        const firebaseToken = localStorage.getItem('firebaseToken');
        if (!firebaseToken) {
          throw new Error('No Firebase token found');
        }
        
        // Fetch profile data from the API
        const response = await fetch('http://localhost:5000/api/users/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${firebaseToken}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const userData = data.user || data;
          const profileData = userData.profile || {};
          
          setFormData({
            fullName: profileData.full_name || firebaseUser?.displayName || '',
            username: userData.username || firebaseUser?.email?.split('@')[0] || '',
            bio: profileData.bio || '',
            location: profileData.location || '',
            organization: profileData.organization || '',
            age: profileData.age?.toString() || '',
            gender: profileData.gender || 'Male',
            contact: profileData.contact_number || '',
            email: firebaseUser?.email || userData.email || '',
            batting_skill: profileData.batting_skill || 0,
            bowling_skill: profileData.bowling_skill || 0,
            fielding_skill: profileData.fielding_skill || 0,
            profile_image_url: profileData.profile_image_url || '',
          });
        } else {
          // Fallback to userProfile from context
          if (userProfile) {
            setFormData({
              fullName: userProfile.profile?.full_name || firebaseUser?.displayName || '',
              username: userProfile.username || firebaseUser?.email?.split('@')[0] || '',
              bio: userProfile.profile?.bio || '',
              location: userProfile.profile?.location || '',
              organization: userProfile.profile?.organization || '',
              age: userProfile.profile?.age?.toString() || '',
              gender: userProfile.profile?.gender || 'Male',
              contact: userProfile.profile?.contact_number || '',
              email: firebaseUser?.email || userProfile.email || '',
              batting_skill: userProfile.profile?.batting_skill || 0,
              bowling_skill: userProfile.profile?.bowling_skill || 0,
              fielding_skill: userProfile.profile?.fielding_skill || 0,
              profile_image_url: userProfile.profile?.profile_image_url || '',
            });
          }
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
        // Fallback to basic data
        setFormData({
          fullName: firebaseUser?.displayName || '',
          username: firebaseUser?.email?.split('@')[0] || '',
          bio: '',
          location: '',
          organization: '',
          age: '',
          gender: 'Male',
          contact: '',
          email: firebaseUser?.email || '',
          batting_skill: 0,
          bowling_skill: 0,
          fielding_skill: 0,
          profile_image_url: '',
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [userProfile, firebaseUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillChange = (skill: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [skill]: Math.max(0, Math.min(100, value))
    }));
  };

  // Test function to debug the save process
  const handleTestSave = async () => {
    console.log('🧪 Testing profile save with minimal data...');
    
    const firebaseUser = auth.currentUser;
    const testData = {
      username: userProfile?.username || 'testuser',
      full_name: userProfile?.profile?.full_name || 'Test User',
      bio: 'Test bio'
    };
    
    try {
      console.log('🧪 Test data:', testData);
      console.log('🧪 API Base URL:', 'http://localhost:5000');
      
      // Check authentication status
      console.log('🧪 Checking authentication...');
      console.log('🧪 Firebase user:', firebaseUser);
      console.log('🧪 User profile:', userProfile);
      console.log('🧪 Is authenticated:', apiService.isAuthenticated());
      
      // First test the sync
      console.log('🧪 Testing user sync...');
      const syncResponse = await apiService.syncUserWithFirebase();
      console.log('🧪 Sync response:', syncResponse);
      
      // Then test the update
      console.log('🧪 Testing profile update...');
      try {
        const response = await apiService.updateUserProfile(testData);
        console.log('🧪 Test response:', response);
        showSuccess('Test Complete', 'Test save completed - check console for details');
      } catch (error) {
        console.warn('🧪 API test failed, using fallback:', error);
        
        // Fallback: Update local profile data
        if (updateProfile) {
          await updateProfile(testData);
          console.log('🧪 Local profile updated successfully');
        }
        
        showSuccess('Test Complete', 'Test save completed with fallback method - check console for details');
      }
    } catch (error) {
      console.error('🧪 Test error:', error);
      console.error('🧪 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      });
      showError('Test Failed', `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName.trim() || !formData.username.trim()) {
      showError('Validation Error', 'Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const profileData = {
        username: formData.username.trim(),
        full_name: formData.fullName.trim(),
        bio: formData.bio.trim(),
        location: formData.location.trim(),
        organization: formData.organization.trim(),
        age: parseInt(formData.age) || undefined,
        gender: formData.gender,
        contact_number: formData.contact.trim(),
        batting_skill: formData.batting_skill,
        bowling_skill: formData.bowling_skill,
        fielding_skill: formData.fielding_skill,
      };

      await updateProfile(profileData);
      await refreshProfile();
      showSuccess('Profile Updated', 'All changes have been saved successfully!');
      
      // Try API call directly first, don't rely on health check
      console.log('🔄 Attempting direct API call to update profile...');
      
      // First, ensure user exists in database by syncing with Firebase
      console.log('🔄 Syncing user with Firebase first...');
      try {
        const syncResponse = await apiService.syncUserWithFirebase();
        console.log('📡 Sync response:', syncResponse);
        console.log('✅ User sync successful, proceeding with profile update');
      } catch (syncError) {
        console.warn('⚠️ User sync failed, but continuing with profile update:', syncError);
        // Don't fail here, continue with the update attempt
      }
      
      // Try API call to save data
      console.log('🔄 Making direct API call to update profile...');
      console.log('📋 Profile data being sent:', JSON.stringify(profileData, null, 2));
      
      let apiResponse;
      try {
        console.log('🔄 Attempting API call to update profile...');
        apiResponse = await apiService.updateUserProfile(profileData);
        console.log('📡 API response:', apiResponse);
        console.log('📡 API response type:', typeof apiResponse);
        console.log('📡 API response keys:', apiResponse ? Object.keys(apiResponse) : 'null');
        console.log('📡 API response stringified:', JSON.stringify(apiResponse, null, 2));
      } catch (apiError) {
        console.error('❌ API call failed:', apiError);
        console.warn('⚠️ API call failed, attempting fallback methods...');
        
        // Try to get more specific error information
        let errorMessage = 'Unknown error';
        if (apiError instanceof Error) {
          errorMessage = apiError.message;
        }
        console.log('🔍 Error details:', errorMessage);
        
        // Check if it's a network error vs authentication error
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
          console.log('🌐 Network error detected - backend might be down');
          showError('Network Error', 'Cannot connect to server. Please check your internet connection and try again.');
        } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
          console.log('🔐 Authentication error detected');
          showError('Authentication Error', 'Please log in again to save your profile changes.');
        } else {
          console.log('❓ Other error:', errorMessage);
          showError('Save Error', `Failed to save profile: ${errorMessage}`);
        }
        
        // Still try fallback methods
        console.log('🔄 Attempting fallback methods...');
        
        // Try context update first
        if (updateProfile) {
          try {
            await updateProfile(profileData);
            console.log('✅ Local profile updated successfully via context');
            showSuccess('Profile Updated', 'Your profile has been updated locally. Changes will sync when connection is restored.');
          } catch (contextError) {
            console.warn('⚠️ Context update failed, using localStorage fallback:', contextError);
            
            // Additional localStorage fallback for data persistence
            try {
              const existingData = JSON.parse(localStorage.getItem('userProfile') || '{}');
              const updatedData = { ...existingData, ...profileData, lastUpdated: new Date().toISOString() };
              localStorage.setItem('userProfile', JSON.stringify(updatedData));
              console.log('✅ Profile data saved to localStorage as backup');
              showSuccess('Profile Updated', 'Your profile has been saved locally. Changes will sync when connection is restored.');
            } catch (storageError) {
              console.warn('⚠️ localStorage fallback failed:', storageError);
              showError('Save Failed', 'Unable to save profile changes. Please try again.');
            }
          }
        }
        
        // Navigate back after a short delay
        setTimeout(() => {
          onBack();
        }, 2000);
        return;
      }
      
      // Check if the response indicates success
      const isSuccess = apiResponse && (
        apiResponse.user || 
        apiResponse.success || 
        apiResponse.message === 'Profile updated successfully' ||
        (apiResponse.data && apiResponse.data.user)
      );
      
      if (isSuccess) {
        console.log('✅ API update successful');
        setSubmitSuccess(true);
        
        // Refresh profile to ensure all components have latest data
        console.log('🔄 Refreshing profile to show updated data...');
        await refreshProfile();
        console.log('✅ Profile refreshed successfully');
        
        // Show success notification
        showSuccess('Profile Updated', 'Your profile has been updated successfully and saved to the database!');
        
        // Navigate back after a short delay
        setTimeout(() => {
          onBack();
        }, 1500);
      } else {
        console.error('❌ Invalid response structure:', apiResponse);
        throw new Error(`Failed to update profile - invalid response: ${JSON.stringify(apiResponse)}`);
      }
      
      setTimeout(() => {
        onBack();
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Update Failed', 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle profile image upload
  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      profile_image_url: imageUrl
    }));
    setShowImageUpload(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6" style={{ backgroundColor: 'var(--field-light)' }}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="rounded-xl p-6 border shadow-sm" style={{ backgroundColor: 'var(--stadium-white)', borderColor: 'var(--gray-200)' }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2" style={{ color: 'var(--cricket-green)' }}>
              <Camera className="w-5 h-5" style={{ color: 'var(--fire-orange)' }} />
              <span>Profile Picture</span>
            </h3>
            <div className="flex items-center space-x-6">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold cursor-pointer transition-all duration-200 hover:opacity-80 relative group"
                style={{ backgroundColor: 'var(--cricket-green)' }}
                onClick={() => setShowImageUpload(true)}
              >
                {formData.profile_image_url ? (
                  <img 
                    src={formData.profile_image_url} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  (formData.fullName || 'User').split(' ').map((n: string) => n[0]).join('').toUpperCase()
                )}
                {/* Camera overlay on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">
                  Click on the profile picture to change it. You can upload a new image or choose from your existing photos.
                </p>
                <button
                  type="button"
                  onClick={() => setShowImageUpload(true)}
                  className="text-sm font-medium transition-colors"
                  style={{ color: 'var(--cricket-green)' }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.color = 'var(--cricket-green-hover)'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.color = 'var(--cricket-green)'}
                >
                  Change Profile Picture
                </button>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="rounded-xl p-6 border shadow-sm" style={{ backgroundColor: 'var(--stadium-white)', borderColor: 'var(--gray-200)' }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2" style={{ color: 'var(--cricket-green)' }}>
              <User className="w-5 h-5" style={{ color: 'var(--cricket-green)' }} />
              <span>Basic Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                  style={{ '--tw-ring-color': 'var(--cricket-green)' } as React.CSSProperties}
                  onFocus={(e) => e.target.style.borderColor = 'var(--cricket-green)'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                  style={{ '--tw-ring-color': 'var(--cricket-green)' } as React.CSSProperties}
                  onFocus={(e) => e.target.style.borderColor = 'var(--cricket-green)'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                  style={{ '--tw-ring-color': 'var(--cricket-green)' } as React.CSSProperties}
                  onFocus={(e) => e.target.style.borderColor = 'var(--cricket-green)'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  placeholder="Enter your age"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                  style={{ '--tw-ring-color': 'var(--cricket-green)' } as React.CSSProperties}
                  onFocus={(e) => e.target.style.borderColor = 'var(--cricket-green)'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="rounded-xl p-6 border shadow-sm" style={{ backgroundColor: 'var(--stadium-white)', borderColor: 'var(--gray-200)' }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2" style={{ color: 'var(--cricket-green)' }}>
              <Phone className="w-5 h-5" style={{ color: 'var(--fire-orange)' }} />
              <span>Contact Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                  style={{ '--tw-ring-color': 'var(--cricket-green)' } as React.CSSProperties}
                  onFocus={(e) => e.target.style.borderColor = 'var(--cricket-green)'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  placeholder="Enter your email"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                  style={{ '--tw-ring-color': 'var(--cricket-green)' } as React.CSSProperties}
                  onFocus={(e) => e.target.style.borderColor = 'var(--cricket-green)'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                  style={{ '--tw-ring-color': 'var(--cricket-green)' } as React.CSSProperties}
                  onFocus={(e) => e.target.style.borderColor = 'var(--cricket-green)'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  placeholder="Enter your location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                  style={{ '--tw-ring-color': 'var(--cricket-green)' } as React.CSSProperties}
                  onFocus={(e) => e.target.style.borderColor = 'var(--cricket-green)'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  placeholder="Enter your organization"
                />
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="rounded-xl p-6 border shadow-sm" style={{ backgroundColor: 'var(--stadium-white)', borderColor: 'var(--gray-200)' }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2" style={{ color: 'var(--cricket-green)' }}>
              <MapPin className="w-5 h-5" style={{ color: 'var(--sky-blue)' }} />
              <span>About</span>
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors resize-none"
                style={{ '--tw-ring-color': 'var(--cricket-green)' } as React.CSSProperties}
                onFocus={(e) => e.target.style.borderColor = 'var(--cricket-green)'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                placeholder="Tell us about yourself and your cricket journey..."
              />
            </div>
          </div>

          {/* Cricket Skills */}
          <div className="rounded-xl p-6 border shadow-sm" style={{ backgroundColor: 'var(--stadium-white)', borderColor: 'var(--gray-200)' }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2" style={{ color: 'var(--cricket-green)' }}>
              <Trophy className="w-5 h-5" style={{ color: 'var(--fire-orange)' }} />
              <span>Cricket Skills</span>
            </h3>
            <div className="space-y-6">
              {/* Batting Skill */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--scoreboard-gray)' }}>Batting</label>
                  <span className="text-sm font-bold" style={{ color: 'var(--cricket-green)' }}>{formData.batting_skill}%</span>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.batting_skill}
                    onChange={(e) => handleSkillChange('batting_skill', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="w-16 text-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.batting_skill}
                      onChange={(e) => handleSkillChange('batting_skill', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': 'var(--cricket-green)' } as React.CSSProperties}
                      onFocus={(e) => e.target.style.borderColor = 'var(--cricket-green)'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                </div>
              </div>

              {/* Bowling Skill */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--scoreboard-gray)' }}>Bowling</label>
                  <span className="text-sm font-bold" style={{ color: 'var(--cricket-green)' }}>{formData.bowling_skill}%</span>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.bowling_skill}
                    onChange={(e) => handleSkillChange('bowling_skill', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="w-16 text-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.bowling_skill}
                      onChange={(e) => handleSkillChange('bowling_skill', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': 'var(--cricket-green)' } as React.CSSProperties}
                      onFocus={(e) => e.target.style.borderColor = 'var(--cricket-green)'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                </div>
              </div>

              {/* Fielding Skill */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--scoreboard-gray)' }}>Fielding</label>
                  <span className="text-sm font-bold" style={{ color: 'var(--cricket-green)' }}>{formData.fielding_skill}%</span>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.fielding_skill}
                    onChange={(e) => handleSkillChange('fielding_skill', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="w-16 text-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.fielding_skill}
                      onChange={(e) => handleSkillChange('fielding_skill', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': 'var(--cricket-green)' } as React.CSSProperties}
                      onFocus={(e) => e.target.style.borderColor = 'var(--cricket-green)'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="px-6 py-3 text-sm border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              style={{ borderColor: 'var(--gray-300)', color: 'var(--scoreboard-gray)' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'var(--gray-50)'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleTestSave}
              className="px-4 py-2 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
            >
              Test Save
            </button>
            <button
              type="button"
              onClick={async () => {
                console.log('🧪 Testing API connection...');
                try {
                  const isHealthy = await apiService.checkBackendHealth();
                  console.log('🏥 Backend health:', isHealthy);
                  showSuccess('API Test', `Backend is ${isHealthy ? 'available' : 'unavailable'}`);
                } catch (error) {
                  console.error('🧪 API test failed:', error);
                  showError('API Test Failed', error instanceof Error ? error.message : 'Unknown error');
                }
              }}
              className="px-4 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              Test API
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 text-sm rounded-lg transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--cricket-green)' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'var(--cricket-green-hover)'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'var(--cricket-green)'}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </span>
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .slider {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }
        
        .slider::-webkit-slider-track {
          background: #e5e7eb;
          height: 8px;
          border-radius: 4px;
        }
        
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: var(--cricket-green);
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-top: -6px;
        }
        
        .slider::-moz-range-track {
          background: #e5e7eb;
          height: 8px;
          border-radius: 4px;
          border: none;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: var(--cricket-green);
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      
      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onSave={handleImageUpload}
      />
    </div>
  );
}