import { ArrowLeft, Eye, EyeOff, Loader2, User, Building2, MapPin, GraduationCap } from 'lucide-react';
import React, { useState } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useToast } from '../contexts/ToastContext';
import { useProfileSwitch } from '../contexts/ProfileSwitchContext';
import { profileAuthService } from '../services/profileAuthService';
import { authService } from '../services/firebase';
import { AcademyCreationForm } from './AcademyCreationForm';

interface ProfileCredentialPageProps {
  onBack: () => void;
  profileType: 'player' | 'coach' | 'venue' | 'academy';
}

type AuthMode = 'signin' | 'signup';

export function ProfileCredentialPage({ onBack, profileType }: ProfileCredentialPageProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showAcademyForm, setShowAcademyForm] = useState(false);

  const { user } = useFirebase();
  const { showToast } = useToast();
  const { addProfile } = useProfileSwitch();

  const getProfileConfig = () => {
    switch (profileType) {
      case 'player':
        return {
          title: 'Player Profile',
          description: 'Sign in or create a player profile',
          icon: <User className="w-8 h-8" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          gradient: 'from-gray-500 to-gray-600'
        };
      case 'coach':
        return {
          title: 'Coach Profile',
          description: 'Sign in or create a coaching profile',
          icon: <GraduationCap className="w-8 h-8" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          gradient: 'from-blue-500 to-blue-600'
        };
      case 'venue':
        return {
          title: 'Venue Provider',
          description: 'Sign in or create a venue provider profile',
          icon: <MapPin className="w-8 h-8" />,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          gradient: 'from-green-500 to-green-600'
        };
      case 'academy':
        return {
          title: 'Academy Profile',
          description: 'Sign in or create an academy profile',
          icon: <Building2 className="w-8 h-8" />,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          gradient: 'from-purple-500 to-purple-600'
        };
      default:
        return {
          title: 'Profile',
          description: 'Sign in or create a profile',
          icon: <User className="w-8 h-8" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          gradient: 'from-gray-500 to-gray-600'
        };
    }
  };

  const config = getProfileConfig();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      // For academy profiles, show the academy creation form
      if (profileType === 'academy') {
        setShowAcademyForm(true);
        return;
      }
      
      // Skip authentication and proceed directly to profile creation for other types
      setUserData({ email, profileType, exists: false });
      setShowConfirmation(true);
      showToast({ title: 'Success', message: 'Ready to create profile!', type: 'success' });
    } catch (error: any) {
      console.error('Profile creation error:', error);
      showToast({ title: 'Error', message: error.message || 'Profile creation failed', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmProfile = async () => {
    if (!userData || !user) return;

    setIsLoading(true);
    try {
      if (userData.exists) {
        // Profile already exists, just add to context
        const existingProfile = await profileAuthService.getProfile(user.uid, profileType);
        if (existingProfile) {
          const newProfile = {
            id: existingProfile.id,
            type: profileType,
            name: userData.email.split('@')[0],
            username: `@${userData.email.split('@')[0]}_${profileType}`,
            avatar: userData.email[0].toUpperCase(),
            color: `linear-gradient(to bottom right, ${config.gradient})`,
            isActive: true,
            createdAt: existingProfile.created_at,
            firebaseUid: user.uid,
            email: userData.email
          };
          addProfile(newProfile);
          showToast({ title: 'Profile Loaded', message: `${config.title} profile loaded successfully!`, type: 'success' });
        }
      } else {
        // Create new profile in database
        const profileData = {
          firebase_uid: user.uid,
          email: userData.email,
          profile_type: profileType,
          profile_data: {
            name: userData.email.split('@')[0],
            email: userData.email
          }
        };

        const createdProfile = await profileAuthService.createProfile(profileData);
        
        // Add to profile context
        const newProfile = {
          id: createdProfile.id,
          type: profileType,
          name: userData.email.split('@')[0],
          username: `@${userData.email.split('@')[0]}_${profileType}`,
          avatar: userData.email[0].toUpperCase(),
          color: `linear-gradient(to bottom right, ${config.gradient})`,
          isActive: true,
          createdAt: createdProfile.created_at,
          firebaseUid: user.uid,
          email: userData.email
        };
        addProfile(newProfile);
        showToast({ title: 'Profile Created', message: `${config.title} profile created successfully!`, type: 'success' });
      }
      
      onBack();
    } catch (error) {
      console.error('Error creating profile:', error);
      showToast({ title: 'Profile Error', message: 'Failed to create profile. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderConfirmationScreen = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setShowConfirmation(false)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Authentication</span>
          </button>

          <div className="text-center">
            <div className={`w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center mb-4 mx-auto`}>
              <div className={config.color}>
                {config.icon}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Confirm Profile Creation</h1>
            <p className="text-lg text-gray-600">
              Please confirm your {config.title.toLowerCase()} profile details
            </p>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Summary</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Profile Type:</span>
              <span className="font-medium text-gray-900">{config.title}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-gray-900">{userData?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Authentication:</span>
              <span className="font-medium text-gray-900">
                {authMode === 'signin' ? 'Existing Account' : 'New Account Created'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-green-600">Ready to Create</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => setShowConfirmation(false)}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmProfile}
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Profile...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Confirm & Create Profile</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (showAcademyForm) {
    return (
      <AcademyCreationForm 
        onBack={() => setShowAcademyForm(false)}
        onSuccess={() => onBack()}
      />
    );
  }

  if (showConfirmation) {
    return renderConfirmationScreen();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Profile Selection</span>
          </button>

          <div className="text-center">
            <div className={`w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center mb-4 mx-auto`}>
              <div className={config.color}>
                {config.icon}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{config.title}</h1>
            <p className="text-lg text-gray-600">{config.description}</p>
          </div>
        </div>

        {/* Auth Mode Toggle */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setAuthMode('signin')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                authMode === 'signin'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                authMode === 'signup'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleAuth} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email address"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Sign Up only) */}
            {authMode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{authMode === 'signin' ? 'Signing In...' : 'Creating Account...'}</span>
                </>
              ) : (
                <span>{authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            {authMode === 'signin' ? 'Already have an account?' : 'New to the platform?'}
          </h3>
          <p className="text-blue-700">
            {authMode === 'signin' 
              ? 'Sign in with your existing credentials to access your profile.'
              : 'Create a new account to get started with your profile.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
