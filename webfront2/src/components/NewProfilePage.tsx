import { ArrowLeft, Building2, GraduationCap, MapPin, User, Users, Loader2, Plus, CheckCircle, X } from 'lucide-react';
import React, { useState } from 'react';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useProfileSwitch } from '../contexts/ProfileSwitchContext';
import { useToast } from '../contexts/ToastContext';
import { apiService } from '../services/api';
import { ConfirmationDialog } from './ConfirmationDialog';
import { DynamicProfileCredentialPage } from './DynamicProfileCredentialPage';

interface NewProfilePageProps {
  onBack: () => void;
  onProfileTypeSelect?: (type: 'player' | 'coach' | 'venue' | 'academy') => void;
  selectedProfileType?: 'player' | 'coach' | 'venue' | 'academy' | null;
  onNavigateToProfile?: (profileId: string, profileType: 'player' | 'coach' | 'venue' | 'academy' | 'community') => void;
}

type ProfileType = 'player' | 'coach' | 'venue' | 'academy' | 'community';

// Validation functions
const isEmailValid = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isPasswordValid = (password: string): boolean => {
  return password.length >= 8;
};

interface ProfileTypeOption {
  id: ProfileType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const profileTypes: ProfileTypeOption[] = [
  {
    id: 'player',
    title: 'Player Profile',
    description: 'Create a player profile to showcase your cricket skills and achievements',
    icon: <User className="w-8 h-8" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  },
  {
    id: 'coach',
    title: 'Coach Profile',
    description: 'Create a coaching profile to train players and manage teams',
    icon: <GraduationCap className="w-8 h-8" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'venue',
    title: 'Venue Provider',
    description: 'List your cricket ground or facility for matches and training',
    icon: <MapPin className="w-8 h-8" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 'academy',
    title: 'Academy Profile',
    description: 'Create an academy profile to manage students and programs',
    icon: <Building2 className="w-8 h-8" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: 'community',
    title: 'Community Profile',
    description: 'Create a community profile to connect with cricket enthusiasts',
    icon: <Users className="w-8 h-8" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  }
];

// Helper function to get profile colors
const getProfileColor = (type: ProfileType): string => {
  switch (type) {
    case 'player':
      return '#6B7280, #4B5563'; // Gray gradient
    case 'coach':
      return '#3B82F6, #1D4ED8'; // Blue gradient
    case 'venue':
      return '#10B981, #059669'; // Green gradient
    case 'academy':
      return '#8B5CF6, #7C3AED'; // Purple gradient
    case 'community':
      return '#6366F1, #4F46E5'; // Indigo gradient
    default:
      return '#6B7280, #4B5563'; // Gray gradient
  }
};

export function NewProfilePage({ onBack, onProfileTypeSelect, selectedProfileType, onNavigateToProfile }: NewProfilePageProps) {
  const [selectedType, setSelectedType] = useState<ProfileType | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdProfiles, setCreatedProfiles] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const { showToast } = useToast();
  const { addProfile } = useProfileSwitch();

  const handleProfileTypeSelect = (type: ProfileType) => {
    setSelectedType(type);
    // Skip credentials step - go directly to profile form
    setShowCredentials(true);
    onProfileTypeSelect?.(type);
  };

  // Handle when selectedProfileType prop changes
  React.useEffect(() => {
    if (selectedProfileType && selectedProfileType !== selectedType) {
      setSelectedType(selectedProfileType);
    }
  }, [selectedProfileType, selectedType]);

  const handleAddAnotherProfile = () => {
    setSelectedType(null);
    setShowSuccess(false);
  };

  const handleFinish = () => {
    onBack();
  };

  const handleCreateProfile = async (submittedFormData?: any) => {
    if (!selectedType) return;

    // Store form data and show confirmation
    setFormData(submittedFormData || {});
    setShowConfirmation(true);
  };

  const handleConfirmProfile = async () => {
    // Show final confirmation dialog
    setShowFinalConfirmation(true);
  };

  const handleFinalConfirm = async () => {
    if (!selectedType) return;

    setIsCreating(true);
    setShowFinalConfirmation(false);
    
    try {
      // Create profile data based on type
      const profileData = {
        profile_type: selectedType,
        email: formData.email || 'anonymous@example.com',
        created_at: new Date().toISOString()
      };

      // TODO: Implement actual API calls for different profile types
      let response;
      switch (selectedType) {
        case 'coach':
          // response = await apiService.createCoachProfile(profileData);
          break;
        case 'venue':
          // response = await apiService.createVenueProfile(profileData);
          break;
        case 'academy':
          // response = await apiService.createAcademyProfile(profileData);
          break;
        case 'player':
          // response = await apiService.createPlayerProfile(profileData);
          break;
        case 'community':
          // response = await apiService.createCommunityProfile(profileData);
          break;
        default:
          throw new Error('Invalid profile type');
      }

      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create profile object for context
      const newProfile = {
        id: `anonymous_${selectedType}_${Date.now()}`, // Unique profile ID
        type: selectedType,
        name: getProfileName(selectedType, formData.email),
        username: `@${formData.email?.split('@')[0] || 'user'}_${selectedType}`,
        avatar: getProfileAvatar(selectedType),
        color: `linear-gradient(to bottom right, ${getProfileColor(selectedType)})`,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      // Add to profile context
      addProfile(newProfile);
      
      // Track created profile
      setCreatedProfiles(prev => [...prev, newProfile]);
      setShowSuccess(true);
      setShowConfirmation(false);
      
      showToast(`Successfully created ${profileTypes.find(p => p.id === selectedType)?.title}!`, 'success');
    } catch (error) {
      console.error('Error creating profile:', error);
      showToast('Failed to create profile. Please try again.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const getProfileName = (type: string, email: string) => {
    const baseName = email.split('@')[0];
    const names = {
      player: `${baseName} Player`,
      coach: `Coach ${baseName}`,
      venue: `${baseName} Cricket Ground`,
      academy: `${baseName} Cricket Academy`,
      community: `${baseName} Cricket Community`
    };
    return names[type as keyof typeof names] || `${baseName} Profile`;
  };

  const getProfileAvatar = (type: string) => {
    const avatars = {
      player: 'P',
      coach: 'C',
      venue: 'V',
      academy: 'A',
      community: 'CM'
    };
    return avatars[type as keyof typeof avatars] || 'U';
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setFormData({});
  };

  const renderProfileTypeSelection = () => (
    <div className="min-h-screen bg-gray-50">
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
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Create New Profile</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the type of profile you want to create. You can have multiple profiles with the same account.
            </p>
          </div>
        </div>

        {/* Profile Type Selection */}
        <div className="grid md:grid-cols-3 gap-6">
          {profileTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleProfileTypeSelect(type.id)}
              className={`p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                selectedType === type.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className={`w-16 h-16 rounded-full ${type.bgColor} flex items-center justify-center mb-4 mx-auto`}>
                <div className={type.color}>
                  {type.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{type.title}</h3>
              <p className="text-gray-600 text-center">{type.description}</p>
            </button>
          ))}
        </div>

        {/* Profile selection is now direct - no continue button needed */}

        {/* Show created profiles if any */}
        {createdProfiles.length > 0 && !selectedType && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Created Profiles ({createdProfiles.length})</h3>
            <div className="space-y-3">
              {createdProfiles.map((profile, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold`} style={{ background: profile.color }}>
                    {profile.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{profile.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{profile.type} Profile</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-3">
              <button
                onClick={handleAddAnotherProfile}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Profile</span>
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Finish Setup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderConfirmationScreen = () => {
    const selectedProfileType = profileTypes.find(p => p.id === selectedType);
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleCancelConfirmation}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Form</span>
            </button>
            
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full ${selectedProfileType?.bgColor} flex items-center justify-center mb-4 mx-auto`}>
                <div className={selectedProfileType?.color}>
                  {selectedProfileType?.icon}
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Confirm Profile Creation</h1>
              <p className="text-lg text-gray-600">
                Please review your {selectedProfileType?.title.toLowerCase()} details before creating
              </p>
            </div>
          </div>

          {/* Profile Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Summary</h2>
            
            <div className="space-y-4">
              {selectedType === 'coach' && (
                <>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-gray-900">{formData.name || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Experience:</span>
                    <span className="font-medium text-gray-900">{formData.experience || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Specialization:</span>
                    <span className="font-medium text-gray-900">{formData.specialization || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Bio:</span>
                    <span className="font-medium text-gray-900">{formData.bio || 'Not provided'}</span>
                  </div>
                </>
              )}
              
              {selectedType === 'venue' && (
                <>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Venue Name:</span>
                    <span className="font-medium text-gray-900">{formData.venue_name || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Venue Type:</span>
                    <span className="font-medium text-gray-900">{formData.venue_type || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium text-gray-900">{formData.location || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-medium text-gray-900">{formData.capacity || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Description:</span>
                    <span className="font-medium text-gray-900">{formData.description || 'Not provided'}</span>
                  </div>
                </>
              )}
              
              {selectedType === 'academy' && (
                <>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Academy Name:</span>
                    <span className="font-medium text-gray-900">{formData.academy_name || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Academy Type:</span>
                    <span className="font-medium text-gray-900">{formData.academy_type || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium text-gray-900">{formData.location || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Levels Offered:</span>
                    <span className="font-medium text-gray-900">{formData.levels?.join(', ') || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Description:</span>
                    <span className="font-medium text-gray-900">{formData.description || 'Not provided'}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleCancelConfirmation}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmProfile}
              disabled={isCreating}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isCreating ? (
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
  };

  const renderSuccessScreen = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 mx-auto">
              <div className="text-green-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile Created Successfully!</h1>
            <p className="text-lg text-gray-600">
              Your {profileTypes.find(p => p.id === selectedType)?.title} has been created and added to your account.
            </p>
          </div>
        </div>

        {/* Created Profiles Summary */}
        {createdProfiles.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Created Profiles ({createdProfiles.length})</h3>
            <div className="space-y-3">
              {createdProfiles.map((profile, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold`} style={{ background: profile.color }}>
                    {profile.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{profile.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{profile.type} Profile</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">What would you like to do next?</h3>
            <p className="text-gray-600">You can view your new profile, create more profiles, or finish setup.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                // Navigate to the created profile
                const createdProfile = createdProfiles[createdProfiles.length - 1];
                if (createdProfile && onNavigateToProfile) {
                  onNavigateToProfile(createdProfile.id, createdProfile.type);
                } else {
                  showToast('Profile created! You can view it from your profile list.', 'success');
                }
              }}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              <span>View {profileTypes.find(p => p.id === selectedType)?.title}</span>
            </button>
            
            <button
              onClick={handleAddAnotherProfile}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Another Profile</span>
            </button>
            
            <button
              onClick={handleFinish}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Finish Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfileForm = () => {
    if (!selectedType) return null;

    const selectedProfileType = profileTypes.find(p => p.id === selectedType);
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => setSelectedType(null)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Selection</span>
            </button>
            
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full ${selectedProfileType?.bgColor} flex items-center justify-center mb-4 mx-auto`}>
                <div className={selectedProfileType?.color}>
                  {selectedProfileType?.icon}
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Create {selectedProfileType?.title}</h1>
              <p className="text-lg text-gray-600">
                Fill in the details to create your {selectedProfileType?.title.toLowerCase()}
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <ProfileForm 
              profileType={selectedType}
              onSubmit={handleCreateProfile}
              isCreating={isCreating}
              onCancel={() => setSelectedType(null)}
            />
          </div>
        </div>
      </div>
    );
  };

  if (showCredentials && selectedType) {
    // Skip credentials step - go directly to profile form
    return (
      <ProfileForm
        profileType={selectedType}
        onSubmit={handleCreateProfile}
        isCreating={isCreating}
        onCancel={() => setShowCredentials(false)}
      />
    );
  }

  if (showConfirmation) {
    return renderConfirmationScreen();
  }
  
  if (showSuccess) {
    return renderSuccessScreen();
  }
  
  return (
    <>
      {renderProfileTypeSelection()}
      
      {/* Final Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showFinalConfirmation}
        onClose={() => setShowFinalConfirmation(false)}
        onConfirm={handleFinalConfirm}
        title="Final Confirmation"
        message={`Are you sure you want to create this ${profileTypes.find(p => p.id === selectedType)?.title.toLowerCase()}? This action cannot be undone.`}
        confirmText="Yes, Create Profile"
        cancelText="Cancel"
        type="info"
        isLoading={isCreating}
      />
    </>
  );
}

// Main Profile Form Component
interface ProfileFormProps {
  profileType: ProfileType | null;
  onSubmit: (formData: any) => void;
  isCreating: boolean;
  onCancel: () => void;
}

function ProfileForm({ profileType, onSubmit, isCreating, onCancel }: ProfileFormProps) {
  const [formData, setFormData] = useState<any>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    validateForm({ ...formData, [field]: value });
  };

  const validateForm = (data: any) => {
    const isValid = data.email && data.password && data.email.includes('@') && data.password.length >= 6;
    setIsFormValid(isValid);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      setShowConfirmation(true);
    }
  };

  const handleConfirm = () => {
    setShowConfirmation(false);
    onSubmit(formData);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  if (showConfirmation) {
    return (
      <div className="space-y-6">
        {/* Confirmation Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirm Profile Creation</h3>
          <p className="text-gray-600">Please review your information before creating the profile.</p>
        </div>

        {/* Confirmation Details */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium text-gray-900">{formData.email}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Profile Type:</span>
            <span className="font-medium text-gray-900 capitalize">{profileType} Profile</span>
          </div>
        </div>

        {/* Confirmation Buttons */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleCancelConfirmation}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Form
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isCreating}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Profile...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Confirm & Create</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {profileType === 'coach' && <CoachProfileForm formData={formData} onChange={handleInputChange} />}
      {profileType === 'venue' && <VenueProfileForm formData={formData} onChange={handleInputChange} />}
      {profileType === 'academy' && <AcademyProfileForm formData={formData} onChange={handleInputChange} />}
      {profileType === 'player' && <PlayerProfileForm formData={formData} onChange={handleInputChange} />}
      {profileType === 'community' && <CommunityProfileForm formData={formData} onChange={handleInputChange} />}
      
      <div className="flex space-x-4 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isFormValid || isCreating}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isCreating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Continue to Confirmation</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// Coach Profile Form Component - Simplified to basic auth fields only
interface FormComponentProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

function CoachProfileForm({ formData, onChange }: FormComponentProps) {

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <div className="relative">
          <input
            type="email"
            required
            value={formData.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
              formData.email 
                ? isEmailValid(formData.email)
                  ? 'border-green-300 focus:ring-green-500 bg-green-50' 
                  : 'border-red-300 focus:ring-red-500 bg-red-50'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="Enter your email address"
          />
          {formData.email && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isEmailValid(formData.email) ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}
        </div>
        {formData.email && !isEmailValid(formData.email) && (
          <p className="mt-1 text-sm text-red-600">Please enter a valid email address</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <div className="relative">
          <input
            type="password"
            required
            value={formData.password || ''}
            onChange={(e) => onChange('password', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
              formData.password 
                ? isPasswordValid(formData.password) 
                  ? 'border-green-300 focus:ring-green-500 bg-green-50' 
                  : 'border-red-300 focus:ring-red-500 bg-red-50'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="Create a secure password"
          />
          {formData.password && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isPasswordValid(formData.password) ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}
        </div>
        {formData.password && !isPasswordValid(formData.password) && (
          <p className="mt-1 text-sm text-red-600">Password must be at least 6 characters long</p>
        )}
        {isPasswordValid(formData.password) && (
          <p className="mt-1 text-sm text-green-600">Password looks good!</p>
        )}
      </div>
    </div>
  );
}

// Venue Profile Form Component - Simplified to basic auth fields only
function VenueProfileForm({ formData, onChange }: FormComponentProps) {
  const isEmailValid = formData.email && formData.email.includes('@');
  const isPasswordValid = formData.password && formData.password.length >= 6;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <div className="relative">
          <input
            type="email"
            required
            value={formData.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
              formData.email 
                ? isEmailValid(formData.email) 
                  ? 'border-green-300 focus:ring-green-500 bg-green-50' 
                  : 'border-red-300 focus:ring-red-500 bg-red-50'
                : 'border-gray-300 focus:ring-green-500'
            }`}
            placeholder="Enter your email address"
          />
          {formData.email && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isEmailValid(formData.email) ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}
        </div>
        {formData.email && !isEmailValid(formData.email) && (
          <p className="mt-1 text-sm text-red-600">Please enter a valid email address</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <div className="relative">
          <input
            type="password"
            required
            value={formData.password || ''}
            onChange={(e) => onChange('password', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
              formData.password 
                ? isPasswordValid(formData.password) 
                  ? 'border-green-300 focus:ring-green-500 bg-green-50' 
                  : 'border-red-300 focus:ring-red-500 bg-red-50'
                : 'border-gray-300 focus:ring-green-500'
            }`}
            placeholder="Create a secure password"
          />
          {formData.password && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isPasswordValid(formData.password) ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}
        </div>
        {formData.password && !isPasswordValid(formData.password) && (
          <p className="mt-1 text-sm text-red-600">Password must be at least 6 characters long</p>
        )}
        {isPasswordValid(formData.password) && (
          <p className="mt-1 text-sm text-green-600">Password looks good!</p>
        )}
      </div>
    </div>
  );
}

// Academy Profile Form Component - Simplified to basic auth fields only
function AcademyProfileForm({ formData, onChange }: FormComponentProps) {
  const isEmailValid = formData.email && formData.email.includes('@');
  const isPasswordValid = formData.password && formData.password.length >= 6;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <div className="relative">
          <input
            type="email"
            required
            value={formData.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
              formData.email 
                ? isEmailValid(formData.email) 
                  ? 'border-green-300 focus:ring-green-500 bg-green-50' 
                  : 'border-red-300 focus:ring-red-500 bg-red-50'
                : 'border-gray-300 focus:ring-purple-500'
            }`}
            placeholder="Enter your email address"
          />
          {formData.email && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isEmailValid(formData.email) ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}
        </div>
        {formData.email && !isEmailValid(formData.email) && (
          <p className="mt-1 text-sm text-red-600">Please enter a valid email address</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <div className="relative">
          <input
            type="password"
            required
            value={formData.password || ''}
            onChange={(e) => onChange('password', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
              formData.password 
                ? isPasswordValid(formData.password) 
                  ? 'border-green-300 focus:ring-green-500 bg-green-50' 
                  : 'border-red-300 focus:ring-red-500 bg-red-50'
                : 'border-gray-300 focus:ring-purple-500'
            }`}
            placeholder="Create a secure password"
          />
          {formData.password && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isPasswordValid(formData.password) ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}
        </div>
        {formData.password && !isPasswordValid(formData.password) && (
          <p className="mt-1 text-sm text-red-600">Password must be at least 6 characters long</p>
        )}
        {isPasswordValid(formData.password) && (
          <p className="mt-1 text-sm text-green-600">Password looks good!</p>
        )}
      </div>
    </div>
  );
}

// Player Profile Form Component - Simplified to basic auth fields only
function PlayerProfileForm({ formData, onChange }: FormComponentProps) {
  const isEmailValid = formData.email && formData.email.includes('@');
  const isPasswordValid = formData.password && formData.password.length >= 6;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <div className="relative">
          <input
            type="email"
            required
            value={formData.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
              formData.email 
                ? isEmailValid(formData.email) 
                  ? 'border-green-300 focus:ring-green-500 bg-green-50' 
                  : 'border-red-300 focus:ring-red-500 bg-red-50'
                : 'border-gray-300 focus:ring-orange-500'
            }`}
            placeholder="Enter your email address"
          />
          {formData.email && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isEmailValid(formData.email) ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}
        </div>
        {formData.email && !isEmailValid(formData.email) && (
          <p className="mt-1 text-sm text-red-600">Please enter a valid email address</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <div className="relative">
          <input
            type="password"
            required
            value={formData.password || ''}
            onChange={(e) => onChange('password', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
              formData.password 
                ? isPasswordValid(formData.password) 
                  ? 'border-green-300 focus:ring-green-500 bg-green-50' 
                  : 'border-red-300 focus:ring-red-500 bg-red-50'
                : 'border-gray-300 focus:ring-orange-500'
            }`}
            placeholder="Create a secure password"
          />
          {formData.password && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isPasswordValid(formData.password) ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}
        </div>
        {formData.password && !isPasswordValid(formData.password) && (
          <p className="mt-1 text-sm text-red-600">Password must be at least 6 characters long</p>
        )}
        {isPasswordValid(formData.password) && (
          <p className="mt-1 text-sm text-green-600">Password looks good!</p>
        )}
      </div>
    </div>
  );
}

// Community Profile Form Component - Simplified to basic auth fields only
function CommunityProfileForm({ formData, onChange }: FormComponentProps) {
  const isEmailValid = formData.email && formData.email.includes('@');
  const isPasswordValid = formData.password && formData.password.length >= 6;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <div className="relative">
          <input
            type="email"
            required
            value={formData.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
              formData.email 
                ? isEmailValid(formData.email) 
                  ? 'border-green-300 focus:ring-green-500 bg-green-50' 
                  : 'border-red-300 focus:ring-red-500 bg-red-50'
                : 'border-gray-300 focus:ring-indigo-500'
            }`}
            placeholder="Enter your email address"
          />
          {formData.email && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isEmailValid(formData.email) ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}
        </div>
        {formData.email && !isEmailValid(formData.email) && (
          <p className="mt-1 text-sm text-red-600">Please enter a valid email address</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <div className="relative">
          <input
            type="password"
            required
            value={formData.password || ''}
            onChange={(e) => onChange('password', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
              formData.password 
                ? isPasswordValid(formData.password) 
                  ? 'border-green-300 focus:ring-green-500 bg-green-50' 
                  : 'border-red-300 focus:ring-red-500 bg-red-50'
                : 'border-gray-300 focus:ring-indigo-500'
            }`}
            placeholder="Create a secure password"
          />
          {formData.password && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isPasswordValid(formData.password) ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}
        </div>
        {formData.password && !isPasswordValid(formData.password) && (
          <p className="mt-1 text-sm text-red-600">Password must be at least 6 characters long</p>
        )}
        {isPasswordValid(formData.password) && (
          <p className="mt-1 text-sm text-green-600">Password looks good!</p>
        )}
      </div>
    </div>
  );
}
