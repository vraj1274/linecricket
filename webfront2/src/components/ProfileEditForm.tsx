import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, X, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface ProfileEditFormProps {
  profileType: 'player' | 'coach' | 'venue' | 'academy' | 'community';
  profileId: string;
  initialData: any;
  onBack: () => void;
  onSave: (updatedData: any) => void;
}

export function ProfileEditForm({ profileType, profileId, initialData, onBack, onSave }: ProfileEditFormProps) {
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { showToast } = useToast();

  // Initialize form data
  useEffect(() => {
    setFormData(initialData || {});
  }, [initialData]);

  // Track changes
  useEffect(() => {
    const hasFormChanges = JSON.stringify(formData) !== JSON.stringify(initialData);
    setHasChanges(hasFormChanges);
  }, [formData, initialData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast('Failed to update profile. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getFormFields = () => {
    switch (profileType) {
      case 'player':
        return [
          { name: 'display_name', label: 'Display Name', type: 'text', required: true },
          { name: 'bio', label: 'Bio', type: 'textarea', required: false },
          { name: 'location', label: 'Location', type: 'text', required: false },
          { name: 'player_role', label: 'Player Role', type: 'select', required: true, options: [
            { value: 'BATSMAN', label: 'Batsman' },
            { value: 'BOWLER', label: 'Bowler' },
            { value: 'ALL_ROUNDER', label: 'All Rounder' },
            { value: 'WICKET_KEEPER', label: 'Wicket Keeper' }
          ]},
          { name: 'batting_style', label: 'Batting Style', type: 'select', required: false, options: [
            { value: 'RIGHT_HANDED', label: 'Right Handed' },
            { value: 'LEFT_HANDED', label: 'Left Handed' }
          ]},
          { name: 'bowling_style', label: 'Bowling Style', type: 'select', required: false, options: [
            { value: 'RIGHT_ARM_FAST', label: 'Right Arm Fast' },
            { value: 'LEFT_ARM_FAST', label: 'Left Arm Fast' },
            { value: 'RIGHT_ARM_SPIN', label: 'Right Arm Spin' },
            { value: 'LEFT_ARM_SPIN', label: 'Left Arm Spin' }
          ]},
          { name: 'contact_number', label: 'Contact Number', type: 'text', required: false },
          { name: 'current_team', label: 'Current Team', type: 'text', required: false },
          { name: 'achievements', label: 'Achievements', type: 'textarea', required: false }
        ];
      
      case 'coach':
        return [
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'bio', label: 'Bio', type: 'textarea', required: false },
          { name: 'location', label: 'Location', type: 'text', required: false },
          { name: 'specialization', label: 'Specialization', type: 'select', required: true, options: [
            { value: 'BATTING', label: 'Batting' },
            { value: 'BOWLING', label: 'Bowling' },
            { value: 'FIELDING', label: 'Fielding' },
            { value: 'FITNESS', label: 'Fitness' },
            { value: 'MENTAL_GAME', label: 'Mental Game' }
          ]},
          { name: 'experience_years', label: 'Experience (Years)', type: 'number', required: false },
          { name: 'certifications', label: 'Certifications', type: 'textarea', required: false },
          { name: 'contact_number', label: 'Contact Number', type: 'text', required: false },
          { name: 'hourly_rate', label: 'Hourly Rate', type: 'number', required: false }
        ];
      
      case 'venue':
        return [
          { name: 'venue_name', label: 'Venue Name', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea', required: false },
          { name: 'location', label: 'Location', type: 'text', required: true },
          { name: 'venue_type', label: 'Venue Type', type: 'select', required: true, options: [
            { value: 'CRICKET_GROUND', label: 'Cricket Ground' },
            { value: 'INDOOR_FACILITY', label: 'Indoor Facility' },
            { value: 'TRAINING_CENTER', label: 'Training Center' },
            { value: 'STADIUM', label: 'Stadium' }
          ]},
          { name: 'capacity', label: 'Capacity', type: 'number', required: false },
          { name: 'facilities', label: 'Facilities', type: 'textarea', required: false },
          { name: 'contact_number', label: 'Contact Number', type: 'text', required: false },
          { name: 'hourly_rate', label: 'Hourly Rate', type: 'number', required: false }
        ];
      
      case 'academy':
        return [
          { name: 'academy_name', label: 'Academy Name', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea', required: false },
          { name: 'location', label: 'Location', type: 'text', required: true },
          { name: 'academy_type', label: 'Academy Type', type: 'select', required: true, options: [
            { value: 'CRICKET_ACADEMY', label: 'Cricket Academy' },
            { value: 'SPORTS_ACADEMY', label: 'Sports Academy' },
            { value: 'FITNESS_CENTER', label: 'Fitness Center' }
          ]},
          { name: 'level', label: 'Level', type: 'select', required: true, options: [
            { value: 'BEGINNER', label: 'Beginner' },
            { value: 'INTERMEDIATE', label: 'Intermediate' },
            { value: 'ADVANCED', label: 'Advanced' },
            { value: 'PROFESSIONAL', label: 'Professional' }
          ]},
          { name: 'age_groups', label: 'Age Groups', type: 'text', required: false },
          { name: 'programs', label: 'Programs', type: 'textarea', required: false },
          { name: 'contact_number', label: 'Contact Number', type: 'text', required: false },
          { name: 'fees', label: 'Fees', type: 'text', required: false }
        ];
      
      case 'community':
        return [
          { name: 'community_name', label: 'Community Name', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea', required: false },
          { name: 'location', label: 'Location', type: 'text', required: false },
          { name: 'community_type', label: 'Community Type', type: 'select', required: true, options: [
            { value: 'GENERAL', label: 'General' },
            { value: 'LOCAL', label: 'Local' },
            { value: 'PROFESSIONAL', label: 'Professional' },
            { value: 'YOUTH', label: 'Youth' }
          ]},
          { name: 'level', label: 'Level', type: 'select', required: true, options: [
            { value: 'BEGINNER', label: 'Beginner' },
            { value: 'INTERMEDIATE', label: 'Intermediate' },
            { value: 'ADVANCED', label: 'Advanced' }
          ]},
          { name: 'activities', label: 'Activities', type: 'textarea', required: false },
          { name: 'contact_number', label: 'Contact Number', type: 'text', required: false },
          { name: 'meeting_schedule', label: 'Meeting Schedule', type: 'text', required: false }
        ];
      
      default:
        return [];
    }
  };

  const fields = getFormFields();

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
            <span>Back to Profile</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Edit {profileType.charAt(0).toUpperCase() + profileType.slice(1)} Profile
            </h1>
            <p className="text-lg text-gray-600">
              Update your profile information below.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="grid md:grid-cols-2 gap-6">
              {fields.map((field) => (
                <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {field.type === 'text' || field.type === 'number' ? (
                    <input
                      type={field.type}
                      required={field.required}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  ) : field.type === 'textarea' ? (
                    <textarea
                      required={field.required}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
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
                  ) : null}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mt-8">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!hasChanges || isSaving}
                className="flex-1 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                style={{
                  background: isSaving
                    ? 'linear-gradient(135deg, #4a6b7f 0%, #2e4b5f 100%)'
                    : hasChanges
                    ? 'linear-gradient(135deg, #2e4b5f 0%, #1a5f3f 100%)'
                    : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                  border: '2px solid #2e4b5f'
                }}
                onMouseEnter={(e) => {
                  if (hasChanges && !isSaving) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #1a3240 0%, #0f3d2a 100%)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (hasChanges && !isSaving) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #2e4b5f 0%, #1a5f3f 100%)';
                  }
                }}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
