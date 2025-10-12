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
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName.trim() || !formData.username.trim()) {
      showError('Please fill in all required fields');
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
      
      setTimeout(() => {
        onBack();
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Failed to update profile. Please try again.');
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
                  onMouseEnter={(e) => e.target.style.color = 'var(--cricket-green-hover)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--cricket-green)'}
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
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--gray-50)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 text-sm rounded-lg transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--cricket-green)' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--cricket-green-hover)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--cricket-green)'}
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

      <style jsx>{`
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