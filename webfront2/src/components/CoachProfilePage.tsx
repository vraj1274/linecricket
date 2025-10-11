import { ArrowLeft, Award, Calendar, CheckCircle, Edit2, GraduationCap, MapPin, MessageCircle, Phone, Save, Star, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useToast } from '../contexts/ToastContext';
import { ProfileLoadingSpinner } from './LoadingSpinner';

interface CoachProfilePageProps {
  onBack: () => void;
}

interface CoachProfile {
  id: number;
  account_id: number;
  coach_name: string;
  specialization: string;
  experience_years: number;
  qualifications: string;
  profile_image_url: string;
  bio: string;
  created_at: string;
  updated_at: string;
}

interface AcademyProfile {
  id: number;
  account_id: number;
  academy_name: string;
  tagline: string;
  description: string;
  bio: string;
  contact_person: string;
  contact_number: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  academy_type: string;
  level: string;
  established_year: number;
  accreditation: string;
  logo_url: string;
  banner_image_url: string;
  facilities: string;
  services_offered: string;
  equipment_provided: boolean;
  coaching_staff_count: number;
  programs_offered: string;
  age_groups: string;
  batch_timings: string;
  fees_structure: string;
  total_students: number;
  successful_placements: number;
  achievements: string;
  testimonials: string;
  is_public: boolean;
  is_verified: boolean;
}

export function CoachProfilePage({ onBack }: CoachProfilePageProps) {
  const [coachProfile, setCoachProfile] = useState<CoachProfile | null>(null);
  const [academyProfile, setAcademyProfile] = useState<AcademyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useFirebase();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadCoachProfile();
  }, []);

  const loadCoachProfile = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await apiService.getCoachProfile(user?.uid);
      // setCoachProfile(response.coachProfile);
      // setAcademyProfile(response.academyProfile);
      
      // Mock data for now
      setCoachProfile({
        id: 1,
        account_id: 1,
        coach_name: 'John Smith',
        specialization: 'Batting Coach',
        experience_years: 8,
        qualifications: 'Level 3 Cricket Coaching Certificate, BCCI Certified',
        profile_image_url: '',
        bio: 'Experienced cricket coach with 8+ years of training players from beginner to professional level.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      setAcademyProfile({
        id: 1,
        account_id: 1,
        academy_name: 'Elite Cricket Academy',
        tagline: 'Building Champions',
        description: 'Premier cricket academy focused on developing young talent',
        bio: 'We provide comprehensive cricket training for all age groups',
        contact_person: 'John Smith',
        contact_number: '+91 9876543210',
        email: 'contact@elitecricket.com',
        website: 'www.elitecricket.com',
        address: '123 Cricket Ground, Sports Complex',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        academy_type: 'Professional',
        level: 'Advanced',
        established_year: 2015,
        accreditation: 'BCCI Certified',
        logo_url: '',
        banner_image_url: '',
        facilities: '3 Cricket Nets, Practice Ground, Gym, Changing Rooms',
        services_offered: 'Individual Coaching, Group Training, Fitness Training',
        equipment_provided: true,
        coaching_staff_count: 5,
        programs_offered: 'Beginner, Intermediate, Advanced, Professional',
        age_groups: '6-18 years',
        batch_timings: 'Morning: 6-8 AM, Evening: 4-6 PM',
        fees_structure: 'Monthly: ₹5000, Quarterly: ₹12000',
        total_students: 150,
        successful_placements: 25,
        achievements: 'State Champions 2023, National Level Players: 15',
        testimonials: 'Excellent coaching and facilities',
        is_public: true,
        is_verified: true
      });
    } catch (error) {
      console.error('Error loading coach profile:', error);
      showError('Error', 'Failed to load coach profile');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue || '');
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue('');
  };

  const saveField = async () => {
    if (!editingField || !editValue.trim()) return;
    
    setIsSaving(true);
    try {
      // TODO: Implement actual API call
      // await apiService.updateCoachProfile(editingField, editValue);
      showSuccess('Profile Updated', 'Field updated successfully!');
      setEditingField(null);
      setEditValue('');
    } catch (error) {
      showError('Update Failed', 'Failed to update field. Please try again.');
      console.error('Error updating field:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveField();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  if (loading) {
    return <ProfileLoadingSpinner />;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coach Profile</h1>
          <p className="text-gray-600">Manage your coaching profile and academy information</p>
        </div>
      </div>

      {/* Coach Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
            Coach Information
          </h2>
          {coachProfile && (
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coach Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Coach Name</label>
            {editingField === 'coach_name' ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button onClick={saveField} className="text-green-600" title="Save">
                  <Save className="w-4 h-4" />
                </button>
                <button onClick={cancelEditing} className="text-red-600" title="Cancel">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <p className="text-gray-900">{coachProfile?.coach_name || 'Not provided'}</p>
                <button
                  onClick={() => startEditing('coach_name', coachProfile?.coach_name || '')}
                  className="opacity-0 hover:opacity-100 text-gray-500 hover:text-gray-700"
                  title="Edit coach name"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Specialization */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Specialization</label>
            {editingField === 'specialization' ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button onClick={saveField} className="text-green-600" title="Save">
                  <Save className="w-4 h-4" />
                </button>
                <button onClick={cancelEditing} className="text-red-600" title="Cancel">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <p className="text-gray-900">{coachProfile?.specialization || 'Not provided'}</p>
                <button
                  onClick={() => startEditing('specialization', coachProfile?.specialization || '')}
                  className="opacity-0 hover:opacity-100 text-gray-500 hover:text-gray-700"
                  title="Edit specialization"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Experience */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Experience (Years)</label>
            {editingField === 'experience_years' ? (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button onClick={saveField} className="text-green-600" title="Save">
                  <Save className="w-4 h-4" />
                </button>
                <button onClick={cancelEditing} className="text-red-600" title="Cancel">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <p className="text-gray-900">{coachProfile?.experience_years || 0} years</p>
                <button
                  onClick={() => startEditing('experience_years', coachProfile?.experience_years?.toString() || '0')}
                  className="opacity-0 hover:opacity-100 text-gray-500 hover:text-gray-700"
                  title="Edit experience"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Qualifications */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Qualifications</label>
            {editingField === 'qualifications' ? (
              <div className="flex items-center space-x-2">
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  autoFocus
                />
                <div className="flex flex-col space-y-1">
                  <button onClick={saveField} className="text-green-600" title="Save">
                    <Save className="w-4 h-4" />
                  </button>
                  <button onClick={cancelEditing} className="text-red-600" title="Cancel">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-2">
                <p className="text-gray-900 flex-1">{coachProfile?.qualifications || 'Not provided'}</p>
                <button
                  onClick={() => startEditing('qualifications', coachProfile?.qualifications || '')}
                  className="opacity-0 hover:opacity-100 text-gray-500 hover:text-gray-700 mt-1"
                  title="Edit qualifications"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Bio</label>
          {editingField === 'bio' ? (
            <div className="flex items-start space-x-2">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                autoFocus
              />
              <div className="flex flex-col space-y-1">
                <button onClick={saveField} className="text-green-600" title="Save">
                  <Save className="w-4 h-4" />
                </button>
                <button onClick={cancelEditing} className="text-red-600" title="Cancel">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start space-x-2">
              <p className="text-gray-900 flex-1">{coachProfile?.bio || 'No bio provided'}</p>
              <button
                onClick={() => startEditing('bio', coachProfile?.bio || '')}
                className="opacity-0 hover:opacity-100 text-gray-500 hover:text-gray-700 mt-1"
                title="Edit bio"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Academy Information */}
      {academyProfile && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-600" />
              Academy Information
            </h2>
            {academyProfile.is_verified && (
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Verified</span>
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Academy Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Academy Name</label>
              <p className="text-gray-900">{academyProfile.academy_name}</p>
            </div>

            {/* Tagline */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Tagline</label>
              <p className="text-gray-900">{academyProfile.tagline}</p>
            </div>

            {/* Contact Information */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Contact Person</label>
              <p className="text-gray-900">{academyProfile.contact_person}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Contact Number</label>
              <p className="text-gray-900 flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                {academyProfile.contact_number}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <p className="text-gray-900">{academyProfile.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Website</label>
              <a href={academyProfile.website} className="text-blue-600 hover:underline">
                {academyProfile.website}
              </a>
            </div>

            {/* Location */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Address</label>
              <p className="text-gray-900 flex items-start">
                <MapPin className="w-4 h-4 mr-1 mt-0.5" />
                {academyProfile.address}, {academyProfile.city}, {academyProfile.state}, {academyProfile.country}
              </p>
            </div>

            {/* Academy Details */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Academy Type</label>
              <p className="text-gray-900">{academyProfile.academy_type}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Level</label>
              <p className="text-gray-900">{academyProfile.level}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Established Year</label>
              <p className="text-gray-900">{academyProfile.established_year}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Accreditation</label>
              <p className="text-gray-900">{academyProfile.accreditation}</p>
            </div>
          </div>

          {/* Facilities */}
          <div className="mt-6">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Facilities</label>
            <p className="text-gray-900">{academyProfile.facilities}</p>
          </div>

          {/* Services Offered */}
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Services Offered</label>
            <p className="text-gray-900">{academyProfile.services_offered}</p>
          </div>

          {/* Programs Offered */}
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Programs Offered</label>
            <p className="text-gray-900">{academyProfile.programs_offered}</p>
          </div>

          {/* Age Groups */}
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Age Groups</label>
            <p className="text-gray-900">{academyProfile.age_groups}</p>
          </div>

          {/* Batch Timings */}
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Batch Timings</label>
            <p className="text-gray-900">{academyProfile.batch_timings}</p>
          </div>

          {/* Fees Structure */}
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Fees Structure</label>
            <p className="text-gray-900">{academyProfile.fees_structure}</p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{academyProfile.total_students}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{academyProfile.successful_placements}</div>
              <div className="text-sm text-gray-600">Successful Placements</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{academyProfile.coaching_staff_count}</div>
              <div className="text-sm text-gray-600">Coaching Staff</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{coachProfile?.experience_years || 0}</div>
              <div className="text-sm text-gray-600">Years Experience</div>
            </div>
          </div>

          {/* Achievements */}
          <div className="mt-6">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Achievements</label>
            <p className="text-gray-900">{academyProfile.achievements}</p>
          </div>

          {/* Testimonials */}
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Testimonials</label>
            <p className="text-gray-900">{academyProfile.testimonials}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => {/* TODO: Implement edit functionality */}}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}