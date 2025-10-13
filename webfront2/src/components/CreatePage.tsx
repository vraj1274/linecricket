import React, { useState } from 'react';
import { ArrowLeft, Building2, GraduationCap, MapPin, User, Users, CheckCircle, Loader2 } from 'lucide-react';
import { useProfileSwitch } from '../contexts/ProfileSwitchContext';
import { useToast } from '../contexts/ToastContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { API_BASE_URL } from '../config/api';

interface CreatePageProps {
  onCreatePost: () => void;
}

type ProfileType = 'academy' | 'venue' | 'community';

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
    id: 'academy',
    title: 'Academy Page',
    description: 'Create an academy page to manage students and programs',
    icon: <Building2 className="w-8 h-8" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: 'venue',
    title: 'Venue Provider',
    description: 'List your cricket ground, pitch, or facility for matches and training',
    icon: <MapPin className="w-8 h-8" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 'community',
    title: 'Community Page',
    description: 'Create a community page to connect with cricket enthusiasts',
    icon: <Users className="w-8 h-8" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  }
];

export function CreatePage({ onCreatePost }: CreatePageProps) {
  const { addProfile } = useProfileSwitch();
  const { showError, showSuccess } = useToast();
  const { user } = useFirebase();
  const [selectedType, setSelectedType] = useState<ProfileType | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isCreating, setIsCreating] = useState(false);

  const handleBack = () => {
    window.history.back();
  };

  const handleTypeSelect = (type: ProfileType) => {
    setSelectedType(type);
    setFormData({});
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const getProfileName = (type: string, data: any) => {
    const names = {
      academy: data.academy_name || 'Anonymous Academy',
      venue: data.venue_name || data.pitch_name || 'Anonymous Venue',
      community: data.community_name || 'Anonymous Community'
    };
    return names[type as keyof typeof names] || 'Anonymous Profile';
  };

  const getProfileUsername = (type: string, data: any) => {
    const name = getProfileName(type, data);
    return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  };

  const getProfileColor = (type: ProfileType): string => {
    switch (type) {
      case 'academy':
        return 'linear-gradient(to bottom right, #8B5CF6, #7C3AED)';
      case 'venue':
        return 'linear-gradient(to bottom right, #10B981, #059669)';
      case 'community':
        return 'linear-gradient(to bottom right, #6366F1, #4F46E5)';
      default:
        return 'linear-gradient(to bottom right, #6B7280, #4B5563)';
    }
  };

  const getPageType = (type: ProfileType): string => {
    switch (type) {
      case 'academy':
        return 'Academy';
      case 'venue':
        return 'Venue Provider';
      case 'community':
        return 'Community';
      default:
        return 'Academy';
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    // Basic validation
    const requiredFields = {
      academy: ['academy_name', 'academy_type', 'level'],
      venue: ['venue_name', 'venue_type', 'ground_type'],
      community: ['community_name', 'community_type']
    };

    const fields = requiredFields[selectedType];
    const missingFields = fields.filter(field => !formData[field] || formData[field].toString().trim() === '');
    
    if (missingFields.length > 0) {
      showError('Validation Error', `Please fill in all required fields: ${missingFields.join(', ')}`);
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
        profileData.academy_type = profileData.academy_type || 'Private';
        profileData.level = profileData.level || 'Beginner';
      } else if (selectedType === 'venue') {
        profileData.venue_name = formData.venue_name || formData.pitch_name || getProfileName(selectedType, formData);
        profileData.venue_type = profileData.venue_type || 'cricket_ground';
        profileData.ground_type = profileData.ground_type || 'turf';
      } else if (selectedType === 'community') {
        profileData.academy_name = formData.community_name || getProfileName(selectedType, formData);
        profileData.community_type = profileData.community_type || 'local_club';
      }

      console.log('🚀 Creating profile with data:', profileData);
      console.log('📡 API URL:', `${API_BASE_URL}/api/profiles`);
      
      const response = await fetch(`${API_BASE_URL}/api/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      console.log('📊 Response status:', response.status);
      
      const result = await response.json();
      console.log('✅ Profile creation response:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create profile');
      }
      
      const createdProfile = result.profile;
      
      // Create profile object for context
      const profileName = getProfileName(selectedType, formData);
      const profileUsername = getProfileUsername(selectedType, formData);
      
      const newProfile = {
        id: createdProfile.id ? `page_${createdProfile.id}` : `page_${Date.now()}`,
        type: selectedType,
        name: profileName,
        username: `@${profileUsername}`,
        avatar: profileName.charAt(0).toUpperCase(),
        color: getProfileColor(selectedType),
        isActive: true,
        createdAt: createdProfile.created_at || new Date().toISOString(),
        firebaseUid: user?.uid || 'anonymous'
      };

      console.log('Created profile object:', newProfile);

      // Add to profile context
      console.log('Adding profile to context:', newProfile);
      await addProfile(newProfile);
      
      showSuccess('Page Created', `Successfully created ${profileTypes.find(p => p.id === selectedType)?.title}!`);
      
      // Reset form
      setSelectedType(null);
      setFormData({});
      
      // Call the original onCreatePost callback
      onCreatePost();
      
    } catch (error: any) {
      console.error('❌ Profile creation error:', error);
      
      if (error?.message?.includes('Failed to fetch')) {
        showError('Network Error', 'Unable to connect to server. Please check if the backend is running.');
      } else if (error?.message?.includes('400')) {
        showError('Invalid Data', 'Please check all required fields are filled correctly.');
      } else if (error?.message?.includes('500')) {
        showError('Server Error', 'Please try again later or contact support.');
      } else {
        showError('Creation Failed', `Failed to create profile: ${error?.message || 'Unknown error'}`);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const renderTypeSelection = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={handleBack}
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

        <div className="grid md:grid-cols-3 gap-6">
          {profileTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleTypeSelect(type.id)}
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
              <p className="text-gray-600">{type.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderForm = () => {
    if (!selectedType) return null;

    const fields = {
      academy: [
        { name: 'academy_name', label: 'Academy Name', type: 'text', required: true, placeholder: 'Enter academy name' },
        { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Enter academy email' },
        { name: 'academy_type', label: 'Academy Type', type: 'select', required: true, options: [
          { value: 'private', label: 'Private Academy' },
          { value: 'government', label: 'Government Academy' },
          { value: 'club', label: 'Club Academy' }
        ]},
        { name: 'level', label: 'Level', type: 'select', required: true, options: [
          { value: 'beginner', label: 'Beginner' },
          { value: 'intermediate', label: 'Intermediate' },
          { value: 'advanced', label: 'Advanced' },
          { value: 'professional', label: 'Professional' }
        ]},
        { name: 'description', label: 'Description', type: 'textarea', required: false, placeholder: 'Describe your academy' },
        { name: 'contact_number', label: 'Contact Number', type: 'tel', required: false, placeholder: 'Enter contact number' }
      ],
      venue: [
        { name: 'venue_name', label: 'Venue/Pitch Name', type: 'text', required: true, placeholder: 'Enter venue or pitch name' },
        { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Enter venue email' },
        { name: 'venue_type', label: 'Venue Type', type: 'select', required: true, options: [
          { value: 'cricket_ground', label: 'Cricket Ground' },
          { value: 'indoor_pitch', label: 'Indoor Pitch' },
          { value: 'net_practice', label: 'Net Practice' },
          { value: 'multi_sport', label: 'Multi Sport' },
          { value: 'training_facility', label: 'Training Facility' },
          { value: 'pitch', label: 'Cricket Pitch' }
        ]},
        { name: 'ground_type', label: 'Ground Type', type: 'select', required: true, options: [
          { value: 'turf', label: 'Turf' },
          { value: 'mat', label: 'Mat' },
          { value: 'concrete', label: 'Concrete' },
          { value: 'synthetic', label: 'Synthetic' },
          { value: 'natural', label: 'Natural Grass' }
        ]},
        { name: 'description', label: 'Description', type: 'textarea', required: false, placeholder: 'Describe your venue or pitch' },
        { name: 'contact_number', label: 'Contact Number', type: 'tel', required: false, placeholder: 'Enter contact number' }
      ],
      community: [
        { name: 'community_name', label: 'Community Name', type: 'text', required: true, placeholder: 'Enter community name' },
        { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Enter community email' },
        { name: 'community_type', label: 'Community Type', type: 'select', required: true, options: [
          { value: 'local_club', label: 'Local Club' },
          { value: 'online_community', label: 'Online Community' },
          { value: 'tournament_group', label: 'Tournament Group' },
          { value: 'training_group', label: 'Training Group' }
        ]},
        { name: 'description', label: 'Description', type: 'textarea', required: false, placeholder: 'Describe your community' },
        { name: 'contact_number', label: 'Contact Number', type: 'tel', required: false, placeholder: 'Enter contact number' }
      ]
    };

    const currentFields = fields[selectedType] || [];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <button
              onClick={() => setSelectedType(null)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Page Types</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Create {profileTypes.find(p => p.id === selectedType)?.title}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Fill in the details below to create your page.
              </p>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {currentFields.map((field) => (
                <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {field.type === 'text' || field.type === 'email' || field.type === 'tel' ? (
                    <input
                      type={field.type}
                      required={field.required}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
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
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      required={field.required}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={field.placeholder}
                      rows={4}
                    />
                  ) : null}
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={() => setSelectedType(null)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Create Page</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return selectedType ? renderForm() : renderTypeSelection();
}