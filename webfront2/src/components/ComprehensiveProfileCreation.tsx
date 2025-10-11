import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, GraduationCap, MapPin, User, Users, CheckCircle, Loader2 } from 'lucide-react';
import { useProfileSwitch } from '../contexts/ProfileSwitchContext';
import { useToast } from '../contexts/ToastContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { profileManagementService } from '../services/profileManagementService';
import { ProfileCreationSuccess } from './ProfileCreationSuccess';
import { API_BASE_URL } from '../config/api';

interface ComprehensiveProfileCreationProps {
  onBack: () => void;
  onProfileTypeSelect?: (type: 'player' | 'coach' | 'academy' | 'venue' | 'community') => void;
  selectedProfileType?: 'player' | 'coach' | 'academy' | 'venue' | 'community' | null;
  onNavigateToProfile?: (profileId: string, profileType: 'player' | 'coach' | 'academy' | 'venue' | 'community') => void;
  onNavigateToEdit?: (profileId: string, profileType: 'player' | 'coach' | 'academy' | 'venue' | 'community') => void;
}

type ProfileType = 'player' | 'coach' | 'academy' | 'venue' | 'community';

interface ProfileTypeOption {
  id: ProfileType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  databaseModel: string;
}

const profileTypes: ProfileTypeOption[] = [
  {
    id: 'player',
    title: 'Player Profile',
    description: 'Create a player profile to showcase your cricket skills and achievements',
    icon: <User className="w-8 h-8" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    databaseModel: 'PlayerProfile'
  },
  {
    id: 'coach',
    title: 'Coach Profile',
    description: 'Create a coaching profile to train players and manage teams',
    icon: <GraduationCap className="w-8 h-8" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    databaseModel: 'CoachProfile'
  },
  {
    id: 'academy',
    title: 'Academy Page',
    description: 'Create an academy page to manage students and programs',
    icon: <Building2 className="w-8 h-8" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    databaseModel: 'ProfilePage'
  },
  {
    id: 'venue',
    title: 'Venue Provider',
    description: 'List your cricket ground or facility for matches and training',
    icon: <MapPin className="w-8 h-8" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    databaseModel: 'VenueProfile'
  },
  {
    id: 'community',
    title: 'Community Page',
    description: 'Create a community page to connect with cricket enthusiasts',
    icon: <Users className="w-8 h-8" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    databaseModel: 'CommunityProfile'
  }
];

// Database field definitions for each profile type
const profileFieldDefinitions = {
  player: [
    { name: 'display_name', label: 'Player Name', type: 'text', required: true, placeholder: 'Enter your name' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Enter your email' },
    { name: 'bio', label: 'Bio', type: 'textarea', required: false, placeholder: 'Tell us about yourself' },
    { name: 'location', label: 'Location', type: 'text', required: false, placeholder: 'Enter your location' },
    { name: 'date_of_birth', label: 'Date of Birth', type: 'date', required: false },
    { name: 'nationality', label: 'Nationality', type: 'text', required: false, placeholder: 'Enter your nationality' },
    { name: 'contact_number', label: 'Contact Number', type: 'tel', required: false, placeholder: 'Enter your contact number' },
    { name: 'player_role', label: 'Player Role', type: 'select', required: true, options: [
      { value: 'batsman', label: 'Batsman' },
      { value: 'bowler', label: 'Bowler' },
      { value: 'all_rounder', label: 'All Rounder' },
      { value: 'wicket_keeper', label: 'Wicket Keeper' }
    ]},
    { name: 'batting_style', label: 'Batting Style', type: 'select', required: false, options: [
      { value: 'right_handed', label: 'Right Handed' },
      { value: 'left_handed', label: 'Left Handed' }
    ]},
    { name: 'bowling_style', label: 'Bowling Style', type: 'select', required: false, options: [
      { value: 'fast', label: 'Fast' },
      { value: 'medium', label: 'Medium' },
      { value: 'spin', label: 'Spin' },
      { value: 'off_spin', label: 'Off Spin' },
      { value: 'leg_spin', label: 'Leg Spin' }
    ]},
    { name: 'preferred_position', label: 'Preferred Position', type: 'text', required: false, placeholder: 'e.g., Opening Batsman' },
    { name: 'batting_skill', label: 'Batting Skill (1-100)', type: 'number', required: false, min: 1, max: 100 },
    { name: 'bowling_skill', label: 'Bowling Skill (1-100)', type: 'number', required: false, min: 1, max: 100 },
    { name: 'fielding_skill', label: 'Fielding Skill (1-100)', type: 'number', required: false, min: 1, max: 100 },
    { name: 'height', label: 'Height (cm)', type: 'number', required: false, min: 100, max: 250 },
    { name: 'weight', label: 'Weight (kg)', type: 'number', required: false, min: 30, max: 200 },
    { name: 'dominant_hand', label: 'Dominant Hand', type: 'select', required: false, options: [
      { value: 'right', label: 'Right' },
      { value: 'left', label: 'Left' }
    ]},
    { name: 'current_team', label: 'Current Team', type: 'text', required: false, placeholder: 'Enter current team name' },
    { name: 'instagram_handle', label: 'Instagram Handle', type: 'text', required: false, placeholder: '@username' },
    { name: 'twitter_handle', label: 'Twitter Handle', type: 'text', required: false, placeholder: '@username' }
  ],
  coach: [
    { name: 'name', label: 'Coach Name', type: 'text', required: true, placeholder: 'Enter your name' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Enter your email' },
    { name: 'bio', label: 'Bio', type: 'textarea', required: false, placeholder: 'Tell us about your coaching experience' },
    { name: 'specialization', label: 'Specialization', type: 'select', required: true, options: [
      { value: 'batting', label: 'Batting' },
      { value: 'bowling', label: 'Bowling' },
      { value: 'fielding', label: 'Fielding' },
      { value: 'all_round', label: 'All Round' },
      { value: 'fitness', label: 'Fitness' },
      { value: 'mental_coaching', label: 'Mental Coaching' }
    ]},
    { name: 'experience_years', label: 'Years of Experience', type: 'number', required: true, min: 0, max: 50 },
    { name: 'certification', label: 'Certification', type: 'text', required: false, placeholder: 'Enter your certifications' },
    { name: 'location', label: 'Location', type: 'text', required: false, placeholder: 'Enter your location' },
    { name: 'contact_number', label: 'Contact Number', type: 'tel', required: false, placeholder: 'Enter your contact number' },
    { name: 'website', label: 'Website', type: 'url', required: false, placeholder: 'Enter your website URL' },
    { name: 'instagram_handle', label: 'Instagram Handle', type: 'text', required: false, placeholder: '@username' },
    { name: 'linkedin_handle', label: 'LinkedIn Handle', type: 'text', required: false, placeholder: '@username' }
  ],
  academy: [
    { name: 'academy_name', label: 'Academy Name', type: 'text', required: true, placeholder: 'Enter academy name' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Enter academy email' },
    { name: 'tagline', label: 'Tagline', type: 'text', required: false, placeholder: 'Enter academy tagline' },
    { name: 'description', label: 'Description', type: 'textarea', required: false, placeholder: 'Describe your academy' },
    { name: 'bio', label: 'Bio', type: 'textarea', required: false, placeholder: 'Tell us about your academy' },
    { name: 'contact_person', label: 'Contact Person', type: 'text', required: false, placeholder: 'Enter contact person name' },
    { name: 'contact_number', label: 'Contact Number', type: 'tel', required: false, placeholder: 'Enter contact number' },
    { name: 'website', label: 'Website', type: 'url', required: false, placeholder: 'Enter website URL' },
    { name: 'address', label: 'Address', type: 'textarea', required: false, placeholder: 'Enter academy address' },
    { name: 'city', label: 'City', type: 'text', required: false, placeholder: 'Enter city' },
    { name: 'state', label: 'State', type: 'text', required: false, placeholder: 'Enter state' },
    { name: 'country', label: 'Country', type: 'text', required: false, placeholder: 'Enter country' },
    { name: 'pincode', label: 'Pincode', type: 'text', required: false, placeholder: 'Enter pincode' },
    { name: 'academy_type', label: 'Academy Type', type: 'select', required: true, options: [
      { value: 'Private', label: 'Private Academy' },
      { value: 'Government', label: 'Government Academy' },
      { value: 'Club', label: 'Club Academy' }
    ]},
    { name: 'level', label: 'Level', type: 'select', required: true, options: [
      { value: 'Beginner', label: 'Beginner' },
      { value: 'Intermediate', label: 'Intermediate' },
      { value: 'Advanced', label: 'Advanced' },
      { value: 'Professional', label: 'Professional' }
    ]},
    { name: 'established_year', label: 'Established Year', type: 'number', required: false, min: 1900, max: 2025 },
    { name: 'accreditation', label: 'Accreditation', type: 'text', required: false, placeholder: 'BCCI, State Association, etc.' },
    { name: 'coaching_staff_count', label: 'Coaching Staff Count', type: 'number', required: false, min: 0 },
    { name: 'total_students', label: 'Total Students', type: 'number', required: false, min: 0 },
    { name: 'instagram_handle', label: 'Instagram Handle', type: 'text', required: false, placeholder: '@username' },
    { name: 'facebook_handle', label: 'Facebook Handle', type: 'text', required: false, placeholder: '@username' },
    { name: 'youtube_handle', label: 'YouTube Handle', type: 'text', required: false, placeholder: '@username' }
  ],
  venue: [
    { name: 'venue_name', label: 'Venue Name', type: 'text', required: true, placeholder: 'Enter venue name' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Enter venue email' },
    { name: 'tagline', label: 'Tagline', type: 'text', required: false, placeholder: 'Enter venue tagline' },
    { name: 'description', label: 'Description', type: 'textarea', required: false, placeholder: 'Describe your venue' },
    { name: 'contact_person', label: 'Contact Person', type: 'text', required: false, placeholder: 'Enter contact person name' },
    { name: 'contact_number', label: 'Contact Number', type: 'tel', required: false, placeholder: 'Enter contact number' },
    { name: 'website', label: 'Website', type: 'url', required: false, placeholder: 'Enter website URL' },
    { name: 'address', label: 'Address', type: 'textarea', required: false, placeholder: 'Enter venue address' },
    { name: 'city', label: 'City', type: 'text', required: false, placeholder: 'Enter city' },
    { name: 'state', label: 'State', type: 'text', required: false, placeholder: 'Enter state' },
    { name: 'country', label: 'Country', type: 'text', required: false, placeholder: 'Enter country' },
    { name: 'pincode', label: 'Pincode', type: 'text', required: false, placeholder: 'Enter pincode' },
    { name: 'venue_type', label: 'Venue Type', type: 'select', required: true, options: [
      { value: 'cricket_ground', label: 'Cricket Ground' },
      { value: 'indoor_pitch', label: 'Indoor Pitch' },
      { value: 'net_practice', label: 'Net Practice' },
      { value: 'multi_sport', label: 'Multi Sport' },
      { value: 'training_facility', label: 'Training Facility' }
    ]},
    { name: 'ground_type', label: 'Ground Type', type: 'select', required: true, options: [
      { value: 'turf', label: 'Turf' },
      { value: 'mat', label: 'Mat' },
      { value: 'concrete', label: 'Concrete' },
      { value: 'synthetic', label: 'Synthetic' },
      { value: 'natural', label: 'Natural' }
    ]},
    { name: 'capacity', label: 'Capacity', type: 'number', required: false, min: 0, placeholder: 'Spectator capacity' },
    { name: 'ground_length', label: 'Ground Length (meters)', type: 'number', required: false, min: 0, max: 200 },
    { name: 'ground_width', label: 'Ground Width (meters)', type: 'number', required: false, min: 0, max: 200 },
    { name: 'pitch_count', label: 'Pitch Count', type: 'number', required: false, min: 0, max: 20 },
    { name: 'net_count', label: 'Net Count', type: 'number', required: false, min: 0, max: 50 },
    { name: 'floodlights', label: 'Floodlights Available', type: 'checkbox', required: false },
    { name: 'covered_area', label: 'Covered Area Available', type: 'checkbox', required: false },
    { name: 'parking_available', label: 'Parking Available', type: 'checkbox', required: false },
    { name: 'parking_capacity', label: 'Parking Capacity', type: 'number', required: false, min: 0 }
  ],
  community: [
    { name: 'community_name', label: 'Community Name', type: 'text', required: true, placeholder: 'Enter community name' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Enter community email' },
    { name: 'tagline', label: 'Tagline', type: 'text', required: false, placeholder: 'Enter community tagline' },
    { name: 'description', label: 'Description', type: 'textarea', required: false, placeholder: 'Describe your community' },
    { name: 'bio', label: 'Bio', type: 'textarea', required: false, placeholder: 'Tell us about your community' },
    { name: 'contact_person', label: 'Contact Person', type: 'text', required: false, placeholder: 'Enter contact person name' },
    { name: 'contact_number', label: 'Contact Number', type: 'tel', required: false, placeholder: 'Enter contact number' },
    { name: 'website', label: 'Website', type: 'url', required: false, placeholder: 'Enter website URL' },
    { name: 'location', label: 'Location', type: 'text', required: false, placeholder: 'Enter community location' },
    { name: 'city', label: 'City', type: 'text', required: false, placeholder: 'Enter city' },
    { name: 'state', label: 'State', type: 'text', required: false, placeholder: 'Enter state' },
    { name: 'country', label: 'Country', type: 'text', required: false, placeholder: 'Enter country' },
    { name: 'community_type', label: 'Community Type', type: 'select', required: true, options: [
      { value: 'local_club', label: 'Local Club' },
      { value: 'district_association', label: 'District Association' },
      { value: 'state_association', label: 'State Association' },
      { value: 'national_body', label: 'National Body' },
      { value: 'fan_club', label: 'Fan Club' },
      { value: 'players_association', label: 'Players Association' }
    ]},
    { name: 'level', label: 'Level', type: 'select', required: true, options: [
      { value: 'Beginner', label: 'Beginner' },
      { value: 'Intermediate', label: 'Intermediate' },
      { value: 'Advanced', label: 'Advanced' },
      { value: 'Professional', label: 'Professional' }
    ]},
    { name: 'max_members', label: 'Max Members', type: 'number', required: false, min: 1, max: 10000 },
    { name: 'membership_fee', label: 'Membership Fee', type: 'number', required: false, min: 0, step: 0.01 },
    { name: 'membership_duration', label: 'Membership Duration', type: 'text', required: false, placeholder: 'e.g., 1 year, 6 months' },
    { name: 'is_public', label: 'Public Community', type: 'checkbox', required: false },
    { name: 'requires_approval', label: 'Requires Approval', type: 'checkbox', required: false },
    { name: 'allow_messages', label: 'Allow Messages', type: 'checkbox', required: false },
    { name: 'show_contact', label: 'Show Contact Info', type: 'checkbox', required: false }
  ]
};

export function ComprehensiveProfileCreation({ onBack, onProfileTypeSelect, selectedProfileType, onNavigateToProfile, onNavigateToEdit }: ComprehensiveProfileCreationProps) {
  const [selectedType, setSelectedType] = useState<ProfileType | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdProfile, setCreatedProfile] = useState<any>(null);
  const { showToast } = useToast();
  const { addProfile } = useProfileSwitch();
  const { user } = useFirebase();

  // Filter out Player and Coach profiles for Create Page button
  const filteredProfileTypes = profileTypes.filter(type => 
    ['academy', 'venue', 'community'].includes(type.id)
  );

  const handleProfileTypeSelect = (type: ProfileType) => {
    setSelectedType(type);
    onProfileTypeSelect?.(type);
  };

  // Handle when selectedProfileType prop changes
  useEffect(() => {
    if (selectedProfileType && selectedProfileType !== selectedType) {
      setSelectedType(selectedProfileType);
    } else if (selectedProfileType === null && selectedType !== null) {
      // If prop is explicitly set to null, reset the local state
      setSelectedType(null);
      setFormData({});
    }
  }, [selectedProfileType, selectedType]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    // Validate required fields
    const fields = profileFieldDefinitions[selectedType] || [];
    const requiredFields = fields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !formData[field.name] || formData[field.name].toString().trim() === '');
    
    if (missingFields.length > 0) {
      showToast(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`, 'error');
      return;
    }

    setIsCreating(true);
    
    try {
      // Create profile data for API
      const profileData = {
        page_type: getPageType(selectedType),
        email: formData.email || 'anonymous@example.com',
        ...formData
      };

      // Ensure the correct name field is set based on profile type
      if (selectedType === 'academy') {
        profileData.academy_name = formData.academy_name || getProfileName(selectedType, formData);
      } else if (selectedType === 'venue') {
        profileData.academy_name = formData.venue_name || getProfileName(selectedType, formData);
        // Map venue-specific fields
        profileData.venue_type = formData.venue_type;
        profileData.ground_type = formData.ground_type;
      } else if (selectedType === 'community') {
        profileData.academy_name = formData.community_name || getProfileName(selectedType, formData);
        // Map community-specific fields
        profileData.community_type = formData.community_type;
      }

      // Ensure enum values are properly formatted
      if (selectedType === 'academy') {
        profileData.academy_type = profileData.academy_type || 'Private';
        profileData.level = profileData.level || 'Beginner';
      } else if (selectedType === 'venue') {
        profileData.venue_type = profileData.venue_type || 'cricket_ground';
        profileData.ground_type = profileData.ground_type || 'turf';
        // Remove academy-specific fields for venue
        delete profileData.academy_type;
        delete profileData.level;
      } else if (selectedType === 'community') {
        profileData.community_type = profileData.community_type || 'local_club';
        // Remove academy-specific fields for community
        delete profileData.academy_type;
        delete profileData.level;
      }

      console.log('Creating profile with data:', profileData);
      console.log('Form data:', formData);

                  // Call the main profile creation API
                  const response = await fetch(`${API_BASE_URL}/api/profiles`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(profileData),
                  });

                  const result = await response.json();
                  console.log('Profile creation response:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create profile');
      }
      
      const createdProfile = result.profile;
      
      // Create profile object for context using actual form data
      const profileName = getProfileName(selectedType, formData);
      const profileUsername = getProfileUsername(selectedType, formData);
      
      const newProfile = {
        id: createdProfile.id ? `page_${createdProfile.id}` : `page_${Date.now()}`,
        type: selectedType,
        name: profileName,
        username: `@${profileUsername}`,
        avatar: profileName.charAt(0).toUpperCase(),
        color: `linear-gradient(to bottom right, ${getProfileColor(selectedType)})`,
        isActive: true,
        createdAt: createdProfile.created_at || new Date().toISOString(),
        firebaseUid: user?.uid || 'anonymous'
      };

      console.log('Created profile object:', newProfile);

                  // Add to profile context
                  console.log('Adding profile to context:', newProfile);
                  await addProfile(newProfile);
                  setCreatedProfile(result.profile);
                  setShowSuccess(true);
                  
                  showToast(`Successfully created ${filteredProfileTypes.find(p => p.id === selectedType)?.title}!`, 'success');
                  
                  // Navigate to the created page after a short delay
                  setTimeout(() => {
                    if (onNavigateToProfile) {
                      onNavigateToProfile(newProfile.id.toString(), selectedType);
                    }
                  }, 2000);
      
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

  const getProfileName = (type: string, data: any) => {
    const names = {
      player: data.display_name || 'Anonymous Player',
      coach: data.name || 'Anonymous Coach',
      academy: data.academy_name || 'Anonymous Academy',
      venue: data.venue_name || 'Anonymous Venue',
      community: data.community_name || 'Anonymous Community'
    };
    return names[type as keyof typeof names] || 'Anonymous Profile';
  };

  const getProfileUsername = (type: string, data: any) => {
    const name = getProfileName(type, data);
    return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  };

  const getProfileAvatar = (type: string) => {
    const avatars = {
      player: 'P',
      coach: 'C',
      academy: 'A',
      venue: 'V',
      community: 'CM'
    };
    return avatars[type as keyof typeof avatars] || 'U';
  };

  const getProfileColor = (type: ProfileType): string => {
    switch (type) {
      case 'player':
        return '#6B7280, #4B5563';
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

  const getPageType = (type: ProfileType): string => {
    switch (type) {
      case 'academy':
        return 'Academy';
      case 'venue':
        return 'Pitch';
      case 'community':
        return 'Community';
      default:
        return 'Academy';
    }
  };


  const renderCategoryScroller = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Create New Page</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                      Choose the type of page you want to create from the categories below.
                    </p>
                  </div>
        </div>

        {/* Categories Grid */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Select a page category:</h3>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filteredProfileTypes.map((type, index) => (
              <button
                key={type.id}
                onClick={() => {
                  handleProfileTypeSelect(type.id);
                }}
                className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                  selectedType === type.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-full ${type.bgColor} flex items-center justify-center mb-3 mx-auto`}>
                  <div className={type.color}>
                    {type.icon}
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">{type.title}</h4>
                <p className="text-xs text-gray-600 text-center">{type.description}</p>
              </button>
            ))}
          </div>
          
        </div>
      </div>
    </div>
  );

  const renderProfileForm = () => {
    if (!selectedType) return null;

    const fields = profileFieldDefinitions[selectedType] || [];
    const selectedProfileTypeOption = filteredProfileTypes.find(p => p.id === selectedType);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => {
                console.log('Back button clicked, setting selectedType to null');
                setSelectedType(null);
                setFormData({});
                // Also call the parent callback to reset the prop
                onProfileTypeSelect?.(null as any);
              }}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Categories</span>
            </button>
            
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full ${selectedProfileTypeOption?.bgColor} flex items-center justify-center mb-4 mx-auto`}>
                <div className={selectedProfileTypeOption?.color}>
                  {selectedProfileTypeOption?.icon}
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Create {selectedProfileTypeOption?.title}
              </h1>
              <p className="text-lg text-gray-600">
                Fill in the details to create your profile. Fields marked with * are required.
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleFormSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {fields.map((field) => (
                <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'url' || field.type === 'date' ? (
                    <input
                      type={field.type}
                      required={field.required}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={field.placeholder}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                    />
                  ) : field.type === 'number' ? (
                    <input
                      type="number"
                      required={field.required}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={field.placeholder}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                    />
                  ) : field.type === 'textarea' ? (
                    <textarea
                      required={field.required}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={field.placeholder}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      required={field.required}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData[field.name] || false}
                        onChange={(e) => handleInputChange(field.name, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">{field.label}</label>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            
            <div className="flex space-x-4 mt-8">
              <button
                type="button"
                onClick={() => {
                  console.log('Cancel button clicked, setting selectedType to null');
                  setSelectedType(null);
                  setFormData({});
                  // Also call the parent callback to reset the prop
                  onProfileTypeSelect?.(null as any);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="flex-1 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                style={{
                  background: isCreating 
                    ? 'linear-gradient(135deg, #4a6b7f 0%, #2e4b5f 100%)' 
                    : 'linear-gradient(135deg, #2e4b5f 0%, #1a5f3f 100%)',
                  border: '2px solid #2e4b5f'
                }}
                onMouseEnter={(e) => {
                  if (!isCreating) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #1a3240 0%, #0f3d2a 100%)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCreating) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #2e4b5f 0%, #1a5f3f 100%)';
                  }
                }}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating {selectedProfileTypeOption?.title}...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Create {selectedProfileTypeOption?.title}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderSuccessScreen = () => {
    if (createdProfile) {
      return (
        <ProfileCreationSuccess
          profileData={createdProfile}
          onBack={onBack}
          onEdit={() => {
            // Navigate to edit profile page
            if (onNavigateToEdit && createdProfile.id) {
              onNavigateToEdit(createdProfile.id, createdProfile.profile_type);
            } else {
            setShowSuccess(false);
            setCreatedProfile(null);
            }
          }}
          onViewProfile={() => {
            // Navigate to profile view page
            if (onNavigateToProfile && createdProfile.id) {
              onNavigateToProfile(createdProfile.id, createdProfile.profile_type);
            } else {
            onBack();
            }
          }}
        />
      );
    }
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile Created Successfully!</h1>
            <p className="text-lg text-gray-600 mb-8">
              Your {filteredProfileTypes.find(p => p.id === selectedType)?.title.toLowerCase()} has been created and is ready to use.
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setSelectedType(null);
                  setShowSuccess(false);
                  setFormData({});
                }}
                className="flex-1 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #2e4b5f 0%, #1a5f3f 100%)',
                  border: '2px solid #2e4b5f'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #1a3240 0%, #0f3d2a 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #2e4b5f 0%, #1a5f3f 100%)';
                }}
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
  };

  if (showSuccess) {
    return renderSuccessScreen();
  }
  
  if (selectedType) {
    return renderProfileForm();
  }
  
  return renderCategoryScroller();
}
