import React, { useState } from 'react';
import { ArrowLeft, Building2, MapPin, Phone, Mail, Globe, Calendar, Users, Award, Image as ImageIcon } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useToast } from '../contexts/ToastContext';
import { useProfileSwitch } from '../contexts/ProfileSwitchContext';

interface AcademyCreationFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

interface AcademyFormData {
  // Basic Information
  academy_name: string;
  tagline: string;
  description: string;
  bio: string;
  
  // Contact Information
  contact_person: string;
  contact_number: string;
  email: string;
  website: string;
  
  // Location Information
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  
  // Academy Details
  academy_type: string;
  level: string;
  established_year: number;
  accreditation: string;
  
  // Profile Media
  logo_url: string;
  banner_image_url: string;
  
  // Facilities and Services
  facilities: string[];
  services_offered: string[];
  equipment_provided: boolean;
  coaching_staff_count: number;
  
  // Training Programs
  programs_offered: string[];
  age_groups: string;
  batch_timings: Array<{day: string; time: string}>;
  fees_structure: {[key: string]: number};
  
  // Social Media
  instagram_handle: string;
  facebook_handle: string;
  twitter_handle: string;
  youtube_handle: string;
  
  // Settings
  is_public: boolean;
  allow_messages: boolean;
  show_contact: boolean;
}

const ACADEMY_TYPES = [
  { value: 'Private', label: 'Private Academy' },
  { value: 'Government', label: 'Government Academy' },
  { value: 'Club', label: 'Sports Club' }
];

const ACADEMY_LEVELS = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Professional', label: 'Professional' }
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function AcademyCreationForm({ onBack, onSuccess }: AcademyCreationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AcademyFormData>({
    academy_name: '',
    tagline: '',
    description: '',
    bio: '',
    contact_person: '',
    contact_number: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    academy_type: 'cricket_academy',
    level: 'all_levels',
    established_year: new Date().getFullYear(),
    accreditation: '',
    logo_url: '',
    banner_image_url: '',
    facilities: [],
    services_offered: [],
    equipment_provided: false,
    coaching_staff_count: 0,
    programs_offered: [],
    age_groups: '',
    batch_timings: [],
    fees_structure: {},
    instagram_handle: '',
    facebook_handle: '',
    twitter_handle: '',
    youtube_handle: '',
    is_public: true,
    allow_messages: true,
    show_contact: true
  });

  const { user } = useFirebase();
  const { showToast } = useToast();
  const { addProfile } = useProfileSwitch();

  const handleInputChange = (field: keyof AcademyFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field: 'facilities' | 'services_offered' | 'programs_offered', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: items
    }));
  };

  const addBatchTiming = () => {
    setFormData(prev => ({
      ...prev,
      batch_timings: [...prev.batch_timings, { day: 'Monday', time: '' }]
    }));
  };

  const updateBatchTiming = (index: number, field: 'day' | 'time', value: string) => {
    setFormData(prev => ({
      ...prev,
      batch_timings: prev.batch_timings.map((timing, i) => 
        i === index ? { ...timing, [field]: value } : timing
      )
    }));
  };

  const removeBatchTiming = (index: number) => {
    setFormData(prev => ({
      ...prev,
      batch_timings: prev.batch_timings.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.academy_name.trim()) {
      errors.push('Academy name is required');
    }
    if (!formData.academy_type) {
      errors.push('Academy type is required');
    }
    if (!formData.level) {
      errors.push('Level is required');
    }
    if (!formData.contact_person.trim()) {
      errors.push('Contact person is required');
    }
    if (!formData.contact_number.trim()) {
      errors.push('Contact number is required');
    }
    if (!formData.email.trim()) {
      errors.push('Email is required');
    }
    if (!formData.address.trim()) {
      errors.push('Address is required');
    }
    if (!formData.city.trim()) {
      errors.push('City is required');
    }
    if (!formData.state.trim()) {
      errors.push('State is required');
    }
    if (!formData.country.trim()) {
      errors.push('Country is required');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (formData.contact_number && !phoneRegex.test(formData.contact_number.replace(/\s/g, ''))) {
      errors.push('Please enter a valid phone number');
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    if (!user) {
      showToast({ title: 'Error', message: 'Please sign in to create an academy', type: 'error' });
      return;
    }

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      showToast({ 
        title: 'Validation Error', 
        message: validationErrors.join(', '), 
        type: 'error' 
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create academy profile in backend
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          firebase_uid: user.uid,
          page_type: 'Academy'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create academy profile');
      }

      const result = await response.json();
      
      // Add to profile switching context
      const academyProfile = {
        id: result.profile_page.page_id,
        type: 'academy' as const,
        name: formData.academy_name,
        username: `@${formData.academy_name.toLowerCase().replace(/\s+/g, '_')}`,
        avatar: formData.academy_name.charAt(0).toUpperCase(),
        color: 'linear-gradient(to bottom right, #8B5CF6, #7C3AED)',
        isActive: true,
        createdAt: new Date().toISOString(),
        firebaseUid: user.uid
      };

      addProfile(academyProfile);
      
      showToast({ 
        title: 'Success', 
        message: 'Academy profile created successfully!', 
        type: 'success' 
      });
      
      onSuccess();
    } catch (error: any) {
      console.error('Error creating academy:', error);
      showToast({ 
        title: 'Error', 
        message: error.message || 'Failed to create academy profile', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Academy Name *
        </label>
        <input
          type="text"
          value={formData.academy_name}
          onChange={(e) => handleInputChange('academy_name', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Enter academy name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tagline
        </label>
        <input
          type="text"
          value={formData.tagline}
          onChange={(e) => handleInputChange('tagline', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Enter academy tagline"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Describe your academy"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Tell us about your academy's history and achievements"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Academy Type *
          </label>
          <select
            value={formData.academy_type}
            onChange={(e) => handleInputChange('academy_type', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {ACADEMY_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Level *
          </label>
          <select
            value={formData.level}
            onChange={(e) => handleInputChange('level', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {ACADEMY_LEVELS.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Established Year
          </label>
          <input
            type="number"
            value={formData.established_year}
            onChange={(e) => handleInputChange('established_year', parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="2020"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Accreditation
          </label>
          <input
            type="text"
            value={formData.accreditation}
            onChange={(e) => handleInputChange('accreditation', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="BCCI, State Association, etc."
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact & Location</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Person
          </label>
          <input
            type="text"
            value={formData.contact_person}
            onChange={(e) => handleInputChange('contact_person', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter contact person name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Number
          </label>
          <input
            type="tel"
            value={formData.contact_number}
            onChange={(e) => handleInputChange('contact_number', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="+91-9876543210"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="info@academy.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="https://academy.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address
        </label>
        <textarea
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Enter full address"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Mumbai"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State
          </label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Maharashtra"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pincode
          </label>
          <input
            type="text"
            value={formData.pincode}
            onChange={(e) => handleInputChange('pincode', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="400050"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Facilities & Services</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Facilities (comma-separated)
        </label>
        <input
          type="text"
          value={formData.facilities.join(', ')}
          onChange={(e) => handleArrayInputChange('facilities', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Indoor nets, Gym, Swimming pool, Cafeteria"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Services Offered (comma-separated)
        </label>
        <input
          type="text"
          value={formData.services_offered.join(', ')}
          onChange={(e) => handleArrayInputChange('services_offered', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Personal coaching, Group training, Fitness training"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="equipment_provided"
            checked={formData.equipment_provided}
            onChange={(e) => handleInputChange('equipment_provided', e.target.checked)}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="equipment_provided" className="text-sm font-medium text-gray-700">
            Equipment Provided
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Coaching Staff Count
          </label>
          <input
            type="number"
            value={formData.coaching_staff_count}
            onChange={(e) => handleInputChange('coaching_staff_count', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="15"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Programs Offered (comma-separated)
        </label>
        <input
          type="text"
          value={formData.programs_offered.join(', ')}
          onChange={(e) => handleArrayInputChange('programs_offered', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Summer camp, Winter training, Weekend classes"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Age Groups
        </label>
        <input
          type="text"
          value={formData.age_groups}
          onChange={(e) => handleInputChange('age_groups', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="5-18 years"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Batch Timings
        </label>
        <div className="space-y-3">
          {formData.batch_timings.map((timing, index) => (
            <div key={index} className="flex space-x-3">
              <select
                value={timing.day}
                onChange={(e) => updateBatchTiming(index, 'day', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {DAYS_OF_WEEK.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <input
                type="text"
                value={timing.time}
                onChange={(e) => updateBatchTiming(index, 'time', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="6:00 AM - 8:00 AM"
              />
              <button
                type="button"
                onClick={() => removeBatchTiming(index)}
                className="px-3 py-2 text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addBatchTiming}
            className="px-4 py-2 text-purple-600 hover:text-purple-800 border border-purple-300 rounded-lg"
          >
            Add Timing
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Social Media & Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instagram Handle
          </label>
          <input
            type="text"
            value={formData.instagram_handle}
            onChange={(e) => handleInputChange('instagram_handle', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="academy_handle"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Facebook Handle
          </label>
          <input
            type="text"
            value={formData.facebook_handle}
            onChange={(e) => handleInputChange('facebook_handle', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="AcademyName"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Twitter Handle
          </label>
          <input
            type="text"
            value={formData.twitter_handle}
            onChange={(e) => handleInputChange('twitter_handle', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="academy_handle"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            YouTube Handle
          </label>
          <input
            type="text"
            value={formData.youtube_handle}
            onChange={(e) => handleInputChange('youtube_handle', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="AcademyChannel"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Profile Settings</h3>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_public"
              checked={formData.is_public}
              onChange={(e) => handleInputChange('is_public', e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="is_public" className="text-sm font-medium text-gray-700">
              Make profile public
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="allow_messages"
              checked={formData.allow_messages}
              onChange={(e) => handleInputChange('allow_messages', e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="allow_messages" className="text-sm font-medium text-gray-700">
              Allow messages from visitors
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="show_contact"
              checked={formData.show_contact}
              onChange={(e) => handleInputChange('show_contact', e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="show_contact" className="text-sm font-medium text-gray-700">
              Show contact information
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const steps = [
    { title: 'Basic Info', component: renderStep1 },
    { title: 'Contact & Location', component: renderStep2 },
    { title: 'Facilities & Services', component: renderStep3 },
    { title: 'Social & Settings', component: renderStep4 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
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
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4 mx-auto">
              <Building2 className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Create Academy Profile</h1>
            <p className="text-lg text-gray-600">
              Set up your academy profile to connect with students and showcase your programs
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index + 1 <= currentStep 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  index + 1 <= currentStep ? 'text-purple-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    index + 1 < currentStep ? 'bg-purple-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          {steps[currentStep - 1].component()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading || !formData.academy_name}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Academy...</span>
                </>
              ) : (
                <span>Create Academy</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
