import { ArrowLeft, Camera, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { auth } from '../firebase/config';
import { apiService } from '../services/api';
import { cricketValidationRules, DataValidator, sanitizeFormData, validationRules } from '../utils/validation';
import { ButtonLoadingSpinner } from './LoadingSpinner';

interface EditProfilePageProps {
  onBack: () => void;
}

export function EditProfilePage({ onBack }: EditProfilePageProps) {
  const { userProfile, updateProfile, updateProfileField, loading, lastUpdated, refreshProfile } = useUserProfile();
  const { showSuccess, showError, showWarning } = useToast();
  
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
    isVerified: false,
    profileImage: null as File | null,
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
  const [submitError, setSubmitError] = useState<{message: string, type: string, timestamp: string} | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  // Real-time field updates using the new updateProfileField function
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time update for basic fields (optional - can be enabled for instant updates)
    // if (['fullName', 'bio', 'location'].includes(name)) {
    //   const fieldMap: Record<string, string> = {
    //     fullName: 'full_name',
    //     bio: 'bio',
    //     location: 'location'
    //   };
    //   updateProfileField(fieldMap[name] || name, value);
    // }

    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        profileImage: e.target.files![0]
      }));
    }
  };

  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    // Basic validation
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }
    
    if (formData.email && !validationRules.email.pattern.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (formData.age && parseInt(formData.age) < 0) {
      errors.age = 'Age cannot be negative';
    }
    
    if (formData.contact && !validationRules.phone.pattern.test(formData.contact)) {
      errors.contact = 'Please enter a valid phone number';
    }

    // Cricket stats validation
    if (cricketStats.batting.totalRuns < 0) {
      errors.totalRuns = 'Total runs cannot be negative';
    }
    
    if (cricketStats.batting.matches < 0) {
      errors.matches = 'Matches cannot be negative';
    }
    
    if (cricketStats.batting.centuries > cricketStats.batting.halfCenturies + cricketStats.batting.centuries) {
      errors.centuries = 'Centuries cannot exceed total scores';
    }

    return errors;
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
    
    setSubmitError(null);
    setSubmitSuccess(false);
    setValidationErrors({});
    setIsValidating(true);
    
    try {
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setIsValidating(false);
        return;
      }
      
      setIsValidating(false);
      setIsSubmitting(true);

      console.log('💾 Submitting enhanced profile update...');
      console.log('📋 Form data:', formData);
      console.log('📊 Cricket stats:', cricketStats);
      console.log('🎯 Skills:', skillsRating);
      
      // Enhanced authentication check with detailed logging
      console.log('🔐 Checking authentication status...');
      const isAuth = apiService.isAuthenticated();
      console.log('🔐 Authentication status:', isAuth);
      
      if (!isAuth) {
        console.error('❌ User not authenticated');
        throw new Error('User not authenticated. Please log in again.');
      }
      
      // Check Firebase user
      const firebaseUser = auth.currentUser;
      console.log('🔥 Firebase user:', firebaseUser ? 'Present' : 'Not present');
      if (!firebaseUser) {
        throw new Error('Firebase user not found. Please log in again.');
      }
      
      // Log API configuration for debugging
      console.log('🔗 API Configuration:', {
        baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://thelinecricket-socialapp-backend.onrender.com/api',
        isDev: import.meta.env.DEV,
        isProd: import.meta.env.PROD
      });
      
      const sanitizedFormData = sanitizeFormData(formData);
      
      // Enhanced profile data with all cricket stats
      const profileData = {
        username: formData.username.trim(),
        full_name: formData.fullName.trim(),
        bio: formData.bio.trim(),
        location: formData.location.trim(),
        organization: formData.organization.trim(),
        age: parseInt(formData.age) || undefined,
        gender: formData.gender,
        contact_number: formData.contact.trim(),
        // Skills
        batting_skill: skillsRating.batting,
        bowling_skill: skillsRating.bowling,
        fielding_skill: skillsRating.fielding,
        // Cricket Statistics
        total_runs: cricketStats.batting.totalRuns,
        total_wickets: cricketStats.bowling.wickets,
        total_matches: cricketStats.batting.matches,
        batting_average: cricketStats.batting.average,
        highest_score: cricketStats.batting.highest,
        centuries: cricketStats.batting.centuries,
        half_centuries: cricketStats.batting.halfCenturies,
        bowling_average: cricketStats.bowling.average,
        best_bowling_figures: cricketStats.bowling.best,
        catches: cricketStats.fielding.catches,
        stumpings: cricketStats.fielding.stumpings,
        run_outs: cricketStats.fielding.runOuts,
        // Format Performance
        test_matches: formatPerformance.test.matches,
        odi_matches: formatPerformance.odi.matches,
        t20_matches: formatPerformance.t20.matches,
        test_runs: formatPerformance.test.runs,
        odi_runs: formatPerformance.odi.runs,
        t20_runs: formatPerformance.t20.runs,
        test_wickets: formatPerformance.test.wickets,
        odi_wickets: formatPerformance.odi.wickets,
        t20_wickets: formatPerformance.t20.wickets,
      };

      console.log('🚀 Sending profile data to enhanced context:', profileData);
      console.log('🔍 Debug: Profile data structure:', {
        hasUsername: !!profileData.username,
        hasFullName: !!profileData.full_name,
        hasBio: !!profileData.bio,
        hasStats: !!profileData.total_runs,
        dataKeys: Object.keys(profileData)
      });
      
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
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
        type: typeof error,
        constructor: error?.constructor?.name
      });
      
      // Enhanced error detection and logging
      console.log('🔍 Analyzing error type...');
      
      let errorMessage = 'Failed to update profile. Please try again.';
      let errorType = 'general';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        console.log('📝 Original error message:', errorMessage);
        
        // Check for specific error patterns
        if (errorMessage.includes('User not authenticated') || errorMessage.includes('Firebase user not found')) {
          errorType = 'auth';
          errorMessage = 'Please log in again to continue.';
          console.log('🔐 Detected authentication error');
        } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Connection error')) {
          errorType = 'network';
          errorMessage = 'Unable to connect to server. The server might be temporarily unavailable. Please try again in a few moments.';
          console.log('🌐 Detected server connection error');
        } else if (errorMessage.includes('unauthorized') || errorMessage.includes('401') || errorMessage.includes('403')) {
          errorType = 'auth';
          errorMessage = 'Session expired. Please log in again.';
          console.log('🔒 Detected authorization error');
        } else if (errorMessage.includes('username') && errorMessage.includes('taken')) {
          errorType = 'validation';
          setValidationErrors({ username: 'This username is already taken' });
          console.log('📝 Detected username validation error');
          return;
        } else if (errorMessage.includes('email') && errorMessage.includes('taken')) {
          errorType = 'validation';
          setValidationErrors({ email: 'This email is already registered' });
          console.log('📧 Detected email validation error');
          return;
        } else if (errorMessage.includes('validation') || errorMessage.includes('400')) {
          errorType = 'validation';
          console.log('📋 Detected validation error');
          try {
            const errorData = JSON.parse(error.message);
            if (errorData.errors) {
              setValidationErrors(errorData.errors);
              return;
            }
          } catch {
            // If parsing fails, use the original message
            console.log('⚠️ Could not parse validation errors');
          }
        } else if (errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT')) {
          errorType = 'network';
          errorMessage = 'Request timed out. Please check your connection and try again.';
          console.log('⏰ Detected timeout error');
        } else if (errorMessage.includes('CORS') || errorMessage.includes('cors')) {
          errorType = 'network';
          errorMessage = 'CORS error. Please check your connection and try again.';
          console.log('🌐 Detected CORS error');
        } else {
          console.log('❓ Unknown error type, treating as general error');
        }
      } else {
        console.log('❓ Non-Error object caught:', typeof error, error);
      }
      
      setSubmitError({
        message: errorMessage,
        type: errorType,
        timestamp: new Date().toISOString()
      });

    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions for CRUD operations
  const addExperience = () => {
    setExperience([...experience, { title: '', role: '', duration: '', description: '' }]);
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const newExperience = [...experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setExperience(newExperience);
  };

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const addAchievement = () => {
    setAchievements([...achievements, { title: '', description: '', year: '' }]);
  };

  const updateAchievement = (index: number, field: string, value: string) => {
    const newAchievements = [...achievements];
    newAchievements[index] = { ...newAchievements[index], [field]: value };
    setAchievements(newAchievements);
  };

  const removeAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const addAward = () => {
    setAwards([...awards, { title: '', organization: '', year: '' }]);
  };

  const updateAward = (index: number, field: string, value: string) => {
    const newAwards = [...awards];
    newAwards[index] = { ...newAwards[index], [field]: value };
    setAwards(newAwards);
  };

  const removeAward = (index: number) => {
    setAwards(awards.filter((_, i) => i !== index));
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Edit Profile</h1>
            <p className="text-xs text-gray-500">Update your information</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Section */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Profile Picture</h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm"
                  style={{ background: 'linear-gradient(to bottom right, #5D798E, #2E4B5F)' }}
                >
                  {formData.profileImage ? '📷' : formData.fullName.charAt(0) || 'U'}
                </div>
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
                  aria-label="Change profile picture"
                  title="Change profile picture"
                >
                  <Camera className="w-2 h-2" />
                </button>
              </div>
              <div>
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="profileImage"
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Change Photo
                </label>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 2MB</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.fullName 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {validationErrors.fullName && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.fullName}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.username 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter your username"
                />
                {validationErrors.username && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.username}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Select gender"
                  title="Select gender"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Organization</label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">About</h3>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          {/* Cricket Statistics */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Cricket Statistics</h3>
            
            {/* Batting Stats */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-700 mb-2">Batting</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Runs</label>
                  <input
                    type="number"
                    value={cricketStats.batting.totalRuns}
                    onChange={(e) => setCricketStats({
                      ...cricketStats,
                      batting: { ...cricketStats.batting, totalRuns: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Matches</label>
                  <input
                    type="number"
                    value={cricketStats.batting.matches}
                    onChange={(e) => setCricketStats({
                      ...cricketStats,
                      batting: { ...cricketStats.batting, matches: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Average</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cricketStats.batting.average}
                    onChange={(e) => setCricketStats({
                      ...cricketStats,
                      batting: { ...cricketStats.batting, average: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Bowling Stats */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-700 mb-2">Bowling</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Wickets</label>
                  <input
                    type="number"
                    value={cricketStats.bowling.wickets}
                    onChange={(e) => setCricketStats({
                      ...cricketStats,
                      bowling: { ...cricketStats.bowling, wickets: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Best</label>
                  <input
                    type="text"
                    value={cricketStats.bowling.best}
                    onChange={(e) => setCricketStats({
                      ...cricketStats,
                      bowling: { ...cricketStats.bowling, best: e.target.value }
                    })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5/23"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Average</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cricketStats.bowling.average}
                    onChange={(e) => setCricketStats({
                      ...cricketStats,
                      bowling: { ...cricketStats.bowling, average: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Fielding Stats */}
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-2">Fielding</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Catches</label>
                  <input
                    type="number"
                    value={cricketStats.fielding.catches}
                    onChange={(e) => setCricketStats({
                      ...cricketStats,
                      fielding: { ...cricketStats.fielding, catches: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Stumpings</label>
                  <input
                    type="number"
                    value={cricketStats.fielding.stumpings}
                    onChange={(e) => setCricketStats({
                      ...cricketStats,
                      fielding: { ...cricketStats.fielding, stumpings: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Run Outs</label>
                  <input
                    type="number"
                    value={cricketStats.fielding.runOuts}
                    onChange={(e) => setCricketStats({
                      ...cricketStats,
                      fielding: { ...cricketStats.fielding, runOuts: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Format Performance */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Format Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-md font-medium text-gray-800 mb-3">Test Cricket</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Matches</label>
                    <input
                      type="number"
                      value={formatPerformance.test.matches}
                      onChange={(e) => setFormatPerformance({
                        ...formatPerformance,
                        test: { ...formatPerformance.test, matches: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Runs</label>
                    <input
                      type="number"
                      value={formatPerformance.test.runs}
                      onChange={(e) => setFormatPerformance({
                        ...formatPerformance,
                        test: { ...formatPerformance.test, runs: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Wickets</label>
                    <input
                      type="number"
                      value={formatPerformance.test.wickets}
                      onChange={(e) => setFormatPerformance({
                        ...formatPerformance,
                        test: { ...formatPerformance.test, wickets: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-800 mb-3">ODI Cricket</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Matches</label>
                    <input
                      type="number"
                      value={formatPerformance.odi.matches}
                      onChange={(e) => setFormatPerformance({
                        ...formatPerformance,
                        odi: { ...formatPerformance.odi, matches: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Runs</label>
                    <input
                      type="number"
                      value={formatPerformance.odi.runs}
                      onChange={(e) => setFormatPerformance({
                        ...formatPerformance,
                        odi: { ...formatPerformance.odi, runs: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Wickets</label>
                    <input
                      type="number"
                      value={formatPerformance.odi.wickets}
                      onChange={(e) => setFormatPerformance({
                        ...formatPerformance,
                        odi: { ...formatPerformance.odi, wickets: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-800 mb-3">T20 Cricket</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Matches</label>
                    <input
                      type="number"
                      value={formatPerformance.t20.matches}
                      onChange={(e) => setFormatPerformance({
                        ...formatPerformance,
                        t20: { ...formatPerformance.t20, matches: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Runs</label>
                    <input
                      type="number"
                      value={formatPerformance.t20.runs}
                      onChange={(e) => setFormatPerformance({
                        ...formatPerformance,
                        t20: { ...formatPerformance.t20, runs: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Wickets</label>
                    <input
                      type="number"
                      value={formatPerformance.t20.wickets}
                      onChange={(e) => setFormatPerformance({
                        ...formatPerformance,
                        t20: { ...formatPerformance.t20, wickets: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Rating */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-green-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-sm">⭐</span>
              </div>
              <span>Skills Rating</span>
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Batting</label>
                  <span className="text-sm text-gray-600">{skillsRating.batting}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skillsRating.batting}
                  onChange={(e) => setSkillsRating({...skillsRating, batting: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Bowling</label>
                  <span className="text-sm text-gray-600">{skillsRating.bowling}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skillsRating.bowling}
                  onChange={(e) => setSkillsRating({...skillsRating, bowling: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Fielding</label>
                  <span className="text-sm text-gray-600">{skillsRating.fielding}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skillsRating.fielding}
                  onChange={(e) => setSkillsRating({...skillsRating, fielding: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-sm">💼</span>
                </div>
                <span>Experience</span>
              </h2>
              <button
                type="button"
                onClick={addExperience}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Experience</span>
              </button>
            </div>
            <div className="space-y-4">
              {experience.map((exp, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title/Organization</label>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => updateExperience(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role/Position</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => updateExperience(index, 'role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-yellow-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-sm">🏆</span>
                </div>
                <span>Achievements</span>
              </h2>
              <button
                type="button"
                onClick={addAchievement}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Achievement</span>
              </button>
            </div>
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Achievement Title</label>
                      <input
                        type="text"
                        value={achievement.title}
                        onChange={(e) => updateAchievement(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                      <input
                        type="text"
                        value={achievement.year}
                        onChange={(e) => updateAchievement(index, 'year', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <input
                        type="text"
                        value={achievement.description}
                        onChange={(e) => updateAchievement(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeAchievement(index)}
                        className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Validation Errors Summary */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-red-500 text-lg">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                    {Object.entries(validationErrors).map(([field, error]) => (
                      <li key={field}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Error/Success Messages */}
          {submitError && (
            <div className={`rounded-lg p-4 ${
              submitError.type === 'network' 
                ? 'bg-yellow-50 border border-yellow-200' 
                : submitError.type === 'auth'
                ? 'bg-red-50 border border-red-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className={`text-lg ${
                    submitError.type === 'network' 
                      ? 'text-yellow-500' 
                      : submitError.type === 'auth'
                      ? 'text-red-500'
                      : 'text-red-500'
                  }`}>
                    {submitError.type === 'network' ? '🌐' : 
                     submitError.type === 'auth' ? '🔒' : '⚠️'}
                  </span>
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    submitError.type === 'network' 
                      ? 'text-yellow-800' 
                      : submitError.type === 'auth'
                      ? 'text-red-800'
                      : 'text-red-800'
                  }`}>
                    {submitError.type === 'network' ? 'Connection Issue' : 
                     submitError.type === 'auth' ? 'Authentication Error' : 'Error'}
                  </h3>
                  <p className={`mt-1 text-sm ${
                    submitError.type === 'network' 
                      ? 'text-yellow-700' 
                      : submitError.type === 'auth'
                      ? 'text-red-700'
                      : 'text-red-700'
                  }`}>
                    {submitError.message}
                  </p>
                  <div className="mt-2 flex space-x-2">
                    {submitError.type === 'auth' && (
                      <button
                        onClick={() => window.location.reload()}
                        className="text-sm underline hover:no-underline text-red-600"
                      >
                        Refresh page to login again
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSubmitError(null);
                        setSubmitSuccess(false);
                      }}
                      className="text-sm underline hover:no-underline text-gray-600"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-green-500 text-lg">✅</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Profile Updated Successfully!</h3>
                  <p className="text-sm text-green-700">
                    All your changes have been saved to the database. 🏏 
                    Your profile will be updated across the app.
                  </p>
                  <div className="mt-2 text-xs text-green-600">
                    Redirecting you back to your profile...
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={loading || isSubmitting || isValidating || Object.keys(validationErrors).length > 0}
              className={`px-4 py-2 text-sm rounded transition-all duration-200 font-medium flex items-center space-x-2 ${
                submitSuccess 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {(loading || isSubmitting || isValidating) && (
                <ButtonLoadingSpinner />
              )}
              <span>
                {isValidating ? 'Validating...' :
                 isSubmitting ? 'Saving...' : 
                 loading ? 'Loading...' : 
                 submitSuccess ? 'Saved!' : 
                 'Save Changes'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}