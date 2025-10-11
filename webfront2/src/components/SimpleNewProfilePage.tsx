import React, { useState } from 'react';
import { ArrowLeft, Building2, GraduationCap, MapPin, Users, CheckCircle, Loader2 } from 'lucide-react';
import { useProfileSwitch } from '../contexts/ProfileSwitchContext';
import { useToast } from '../contexts/ToastContext';
import { profileAuthService } from '../services/profileAuthService';

interface SimpleNewProfilePageProps {
  onBack: () => void;
  onProfileTypeSelect?: (type: 'coach' | 'academy' | 'venue' | 'community') => void;
  selectedProfileType?: 'coach' | 'academy' | 'venue' | 'community' | null;
  onNavigateToProfile?: (profileId: string, profileType: 'coach' | 'academy' | 'venue' | 'community') => void;
}

type ProfileType = 'coach' | 'academy' | 'venue' | 'community';

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
    id: 'coach',
    title: 'Coach Profile',
    description: 'Create a coaching profile to train players and manage teams',
    icon: <GraduationCap className="w-8 h-8" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
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
    id: 'venue',
    title: 'Venue Provider',
    description: 'List your cricket ground or facility for matches and training',
    icon: <MapPin className="w-8 h-8" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
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

export function SimpleNewProfilePage({ onBack, onProfileTypeSelect, selectedProfileType }: SimpleNewProfilePageProps) {
  const [selectedType, setSelectedType] = useState<ProfileType | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { showToast } = useToast();
  const { addProfile } = useProfileSwitch();

  const handleProfileTypeSelect = (type: ProfileType) => {
    setSelectedType(type);
    onProfileTypeSelect?.(type);
  };

  // Handle when selectedProfileType prop changes
  React.useEffect(() => {
    if (selectedProfileType && selectedProfileType !== selectedType) {
      setSelectedType(selectedProfileType);
    }
  }, [selectedProfileType, selectedType]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    setIsCreating(true);
    
    try {
      // Create profile data for API
      const profileData = {
        profile_type: selectedType,
        email: formData.email || 'anonymous@example.com',
        profile_data: {
          academy_name: formData.academy_name,
          email: formData.email,
          academy_type: formData.academy_type ? formData.academy_type.toUpperCase() : 'CRICKET_ACADEMY',
          level: formData.level ? formData.level.toUpperCase() : 'ALL_LEVELS',
          description: formData.description,
          tagline: formData.tagline,
          bio: formData.bio,
          contact_person: formData.contact_person,
          contact_number: formData.contact_number,
          website: formData.website,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          pincode: formData.pincode,
          established_year: formData.established_year,
          accreditation: formData.accreditation,
          coaching_staff_count: formData.coaching_staff_count || 0,
          total_students: formData.total_students || 0,
          instagram_handle: formData.instagram_handle,
          facebook_handle: formData.facebook_handle,
          youtube_handle: formData.youtube_handle,
          is_public: formData.is_public !== false,
          allow_messages: formData.allow_messages !== false,
          show_contact: formData.show_contact !== false
        }
      };

      // Call the actual API
      const createdProfile = await profileAuthService.createProfile(profileData);
      
      // Create profile object for context
      const newProfile = {
        id: createdProfile.id,
        type: selectedType,
        name: getProfileName(selectedType, formData.name || formData.academy_name || formData.venue_name || formData.community_name || 'Anonymous'),
        username: `@${(formData.name || formData.academy_name || formData.venue_name || formData.community_name || 'user').toLowerCase().replace(/\s+/g, '_')}_${selectedType}`,
        avatar: getProfileAvatar(selectedType),
        color: `linear-gradient(to bottom right, ${getProfileColor(selectedType)})`,
        isActive: true,
        createdAt: createdProfile.created_at || new Date().toISOString()
      };

      // Add to profile context
      addProfile(newProfile);
      setShowSuccess(true);
      
      showToast(`Successfully created ${profileTypes.find(p => p.id === selectedType)?.title}!`, 'success');
      
    } catch (error) {
      console.error('Profile creation error:', error);
      showToast('Failed to create profile. Please try again.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getProfileName = (type: string, name: string) => {
    const names = {
      coach: `Coach ${name}`,
      academy: `${name} Cricket Academy`,
      venue: `${name} Cricket Ground`,
      community: `${name} Cricket Community`
    };
    return names[type as keyof typeof names] || `${name} Profile`;
  };

  const getProfileAvatar = (type: string) => {
    const avatars = {
      coach: 'C',
      academy: 'A',
      venue: 'V',
      community: 'CM'
    };
    return avatars[type as keyof typeof avatars] || 'U';
  };

  const getProfileColor = (type: ProfileType): string => {
    switch (type) {
      case 'coach':
        return '#3B82F6, #1D4ED8';
      case 'academy':
        return '#8B5CF6, #7C3AED';
      case 'venue':
        return '#10B981, #059669';
      case 'community':
        return '#6366F1, #4F46E5';
      default:
        return '#6B7280, #4B5563';
    }
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
              Choose the type of profile you want to create.
            </p>
          </div>
        </div>

        {/* Profile Type Selection */}
        <div className="grid md:grid-cols-2 gap-6">
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
      </div>
    </div>
  );

  const renderProfileForm = () => {
    if (!selectedType) return null;

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
              <span>Back to Profile Types</span>
            </button>
            
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full ${profileTypes.find(p => p.id === selectedType)?.bgColor} flex items-center justify-center mb-4 mx-auto`}>
                <div className={profileTypes.find(p => p.id === selectedType)?.color}>
                  {profileTypes.find(p => p.id === selectedType)?.icon}
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Create {profileTypes.find(p => p.id === selectedType)?.title}
              </h1>
              <p className="text-lg text-gray-600">
                Fill in the details to create your profile.
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleFormSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {selectedType === 'coach' && <CoachProfileForm formData={formData} onChange={handleInputChange} />}
            {selectedType === 'academy' && <AcademyProfileForm formData={formData} onChange={handleInputChange} />}
            {selectedType === 'venue' && <VenueProfileForm formData={formData} onChange={handleInputChange} />}
            {selectedType === 'community' && <CommunityProfileForm formData={formData} onChange={handleInputChange} />}
            
            <div className="flex space-x-4 mt-8">
              <button
                type="button"
                onClick={() => setSelectedType(null)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Create Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderSuccessScreen = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile Created Successfully!</h1>
          <p className="text-lg text-gray-600 mb-8">
            Your {profileTypes.find(p => p.id === selectedType)?.title.toLowerCase()} has been created and is ready to use.
          </p>
          
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setSelectedType(null);
                setShowSuccess(false);
                setFormData({});
              }}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Another Profile
            </button>
            <button
              onClick={onBack}
              className="flex-1 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Finish Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (showSuccess) {
    return renderSuccessScreen();
  }
  
  if (selectedType) {
    return renderProfileForm();
  }
  
  return renderProfileTypeSelection();
}

// Profile Form Components
interface FormComponentProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

function CoachProfileForm({ formData, onChange }: FormComponentProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Coach Name *</label>
        <input
          type="text"
          required
          value={formData.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
        <input
          type="email"
          required
          value={formData.email || ''}
          onChange={(e) => onChange('email', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Specialization *</label>
        <select
          required
          value={formData.specialization || ''}
          onChange={(e) => onChange('specialization', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select specialization</option>
          <option value="batting">Batting</option>
          <option value="bowling">Bowling</option>
          <option value="fielding">Fielding</option>
          <option value="all_round">All Round</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years) *</label>
        <input
          type="number"
          required
          value={formData.experience || ''}
          onChange={(e) => onChange('experience', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Years of coaching experience"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
        <textarea
          value={formData.bio || ''}
          onChange={(e) => onChange('bio', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Tell us about your coaching experience"
        />
      </div>
    </div>
  );
}

function AcademyProfileForm({ formData, onChange }: FormComponentProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Academy Name *</label>
        <input
          type="text"
          required
          value={formData.academy_name || ''}
          onChange={(e) => onChange('academy_name', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Enter academy name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
        <input
          type="email"
          required
          value={formData.email || ''}
          onChange={(e) => onChange('email', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Enter academy email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Academy Type *</label>
        <select
          required
          value={formData.academy_type || ''}
          onChange={(e) => onChange('academy_type', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="">Select academy type</option>
          <option value="cricket_academy">Cricket Academy</option>
          <option value="coaching_center">Coaching Center</option>
          <option value="sports_club">Sports Club</option>
          <option value="school_program">School Program</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Level *</label>
        <select
          required
          value={formData.level || ''}
          onChange={(e) => onChange('level', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="">Select level</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="all_levels">All Levels</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
        <input
          type="text"
          value={formData.location || ''}
          onChange={(e) => onChange('location', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Enter academy location"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Describe your academy programs"
        />
      </div>
    </div>
  );
}

function VenueProfileForm({ formData, onChange }: FormComponentProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name *</label>
        <input
          type="text"
          required
          value={formData.venue_name || ''}
          onChange={(e) => onChange('venue_name', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="Enter venue name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
        <input
          type="email"
          required
          value={formData.email || ''}
          onChange={(e) => onChange('email', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="Enter venue email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Venue Type *</label>
        <select
          required
          value={formData.venue_type || ''}
          onChange={(e) => onChange('venue_type', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Select venue type</option>
          <option value="cricket_ground">Cricket Ground</option>
          <option value="indoor_facility">Indoor Facility</option>
          <option value="practice_net">Practice Net</option>
          <option value="sports_complex">Sports Complex</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
        <input
          type="text"
          required
          value={formData.location || ''}
          onChange={(e) => onChange('location', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="Enter venue location"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
        <input
          type="number"
          value={formData.capacity || ''}
          onChange={(e) => onChange('capacity', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="Spectator capacity"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="Describe your venue facilities"
        />
      </div>
    </div>
  );
}

function CommunityProfileForm({ formData, onChange }: FormComponentProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Community Name *</label>
        <input
          type="text"
          required
          value={formData.community_name || ''}
          onChange={(e) => onChange('community_name', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter community name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
        <input
          type="email"
          required
          value={formData.email || ''}
          onChange={(e) => onChange('email', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter community email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Community Type *</label>
        <select
          required
          value={formData.community_type || ''}
          onChange={(e) => onChange('community_type', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select community type</option>
          <option value="local_club">Local Club</option>
          <option value="online_community">Online Community</option>
          <option value="fan_group">Fan Group</option>
          <option value="players_association">Players Association</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Level *</label>
        <select
          required
          value={formData.level || ''}
          onChange={(e) => onChange('level', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select level</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="professional">Professional</option>
          <option value="all_levels">All Levels</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
        <input
          type="text"
          value={formData.location || ''}
          onChange={(e) => onChange('location', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter community location"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Describe your community"
        />
      </div>
    </div>
  );
}