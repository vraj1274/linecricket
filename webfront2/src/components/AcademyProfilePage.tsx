import { ArrowLeft, Award, Building2, Calendar, CheckCircle, Edit2, GraduationCap, MapPin, MessageCircle, Phone, Save, Star, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useToast } from '../contexts/ToastContext';
import { ProfileLoadingSpinner } from './LoadingSpinner';

interface AcademyProfilePageProps {
  onBack: () => void;
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
  pincode: string;
  latitude: number;
  longitude: number;
  academy_type: string;
  level: string;
  established_year: number;
  accreditation: string;
  logo_url: string;
  banner_image_url: string;
  gallery_images: string;
  facilities: string;
  services_offered: string;
  equipment_provided: boolean;
  coaching_staff_count: number;
  programs_offered: string;
  age_groups: string;
  batch_timings: string;
  fees_structure: string;
  instagram_handle: string;
  facebook_handle: string;
  twitter_handle: string;
  youtube_handle: string;
  total_students: number;
  successful_placements: number;
  achievements: string;
  testimonials: string;
  is_public: boolean;
  allow_messages: boolean;
  show_contact: boolean;
  is_verified: boolean;
}

interface AcademyCoach {
  id: number;
  academy_profile_id: number;
  coach_name: string;
  specialization: string;
  experience_years: number;
  qualifications: string;
  profile_image_url: string;
  bio: string;
}

interface AcademyStudent {
  id: number;
  academy_profile_id: number;
  student_name: string;
  age: number;
  level: string;
  enrollment_date: string;
  is_active: boolean;
}

interface AcademyProgram {
  id: number;
  academy_profile_id: number;
  program_name: string;
  description: string;
  duration_weeks: number;
  age_group: string;
  level: string;
  fees: number;
  max_students: number;
  is_active: boolean;
}

export function AcademyProfilePage({ onBack }: AcademyProfilePageProps) {
  const [academyProfile, setAcademyProfile] = useState<AcademyProfile | null>(null);
  const [coaches, setCoaches] = useState<AcademyCoach[]>([]);
  const [students, setStudents] = useState<AcademyStudent[]>([]);
  const [programs, setPrograms] = useState<AcademyProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useFirebase();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadAcademyProfile();
  }, []);

  const loadAcademyProfile = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      // const response = await apiService.getAcademyProfile(user?.uid);
      // setAcademyProfile(response.academyProfile);
      // setCoaches(response.coaches);
      // setStudents(response.students);
      // setPrograms(response.programs);
      
      // Mock data for now
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
        pincode: '400001',
        latitude: 19.0760,
        longitude: 72.8777,
        academy_type: 'Professional',
        level: 'Advanced',
        established_year: 2015,
        accreditation: 'BCCI Certified',
        logo_url: '',
        banner_image_url: '',
        gallery_images: '',
        facilities: '3 Cricket Nets, Practice Ground, Gym, Changing Rooms',
        services_offered: 'Individual Coaching, Group Training, Fitness Training',
        equipment_provided: true,
        coaching_staff_count: 5,
        programs_offered: 'Beginner, Intermediate, Advanced, Professional',
        age_groups: '6-18 years',
        batch_timings: 'Morning: 6-8 AM, Evening: 4-6 PM',
        fees_structure: 'Monthly: ₹5000, Quarterly: ₹12000',
        instagram_handle: '@elitecricket',
        facebook_handle: 'EliteCricketAcademy',
        twitter_handle: '@elitecricket',
        youtube_handle: 'EliteCricketAcademy',
        total_students: 150,
        successful_placements: 25,
        achievements: 'State Champions 2023, National Level Players: 15',
        testimonials: 'Excellent coaching and facilities',
        is_public: true,
        allow_messages: true,
        show_contact: true,
        is_verified: true
      });

      setCoaches([
        {
          id: 1,
          academy_profile_id: 1,
          coach_name: 'John Smith',
          specialization: 'Batting Coach',
          experience_years: 8,
          qualifications: 'Level 3 Cricket Coaching Certificate, BCCI Certified',
          profile_image_url: '',
          bio: 'Experienced cricket coach with 8+ years of training players'
        },
        {
          id: 2,
          academy_profile_id: 1,
          coach_name: 'Mike Johnson',
          specialization: 'Bowling Coach',
          experience_years: 6,
          qualifications: 'Level 2 Cricket Coaching Certificate',
          profile_image_url: '',
          bio: 'Specialized in fast bowling techniques'
        }
      ]);

      setPrograms([
        {
          id: 1,
          academy_profile_id: 1,
          program_name: 'Beginner Program',
          description: 'Basic cricket skills for beginners',
          duration_weeks: 12,
          age_group: '6-10 years',
          level: 'Beginner',
          fees: 3000,
          max_students: 20,
          is_active: true
        },
        {
          id: 2,
          academy_profile_id: 1,
          program_name: 'Advanced Program',
          description: 'Advanced techniques for experienced players',
          duration_weeks: 24,
          age_group: '14-18 years',
          level: 'Advanced',
          fees: 5000,
          max_students: 15,
          is_active: true
        }
      ]);
    } catch (error) {
      console.error('Error loading academy profile:', error);
      showError('Error', 'Failed to load academy profile');
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
      // await apiService.updateAcademyProfile(editingField, editValue);
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
          <h1 className="text-2xl font-bold text-gray-900">Academy Profile</h1>
          <p className="text-gray-600">Manage your academy information and programs</p>
        </div>
      </div>

      {/* Academy Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-purple-600" />
            Academy Information
          </h2>
          {academyProfile?.is_verified && (
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
            {editingField === 'academy_name' ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                <p className="text-gray-900">{academyProfile?.academy_name || 'Not provided'}</p>
                <button
                  onClick={() => startEditing('academy_name', academyProfile?.academy_name || '')}
                  className="opacity-0 hover:opacity-100 text-gray-500 hover:text-gray-700"
                  title="Edit academy name"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Tagline */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Tagline</label>
            {editingField === 'tagline' ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                <p className="text-gray-900">{academyProfile?.tagline || 'Not provided'}</p>
                <button
                  onClick={() => startEditing('tagline', academyProfile?.tagline || '')}
                  className="opacity-0 hover:opacity-100 text-gray-500 hover:text-gray-700"
                  title="Edit tagline"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Contact Person</label>
            {editingField === 'contact_person' ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                <p className="text-gray-900">{academyProfile?.contact_person || 'Not provided'}</p>
                <button
                  onClick={() => startEditing('contact_person', academyProfile?.contact_person || '')}
                  className="opacity-0 hover:opacity-100 text-gray-500 hover:text-gray-700"
                  title="Edit contact person"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Contact Number</label>
            <p className="text-gray-900 flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              {academyProfile?.contact_number || 'Not provided'}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <p className="text-gray-900">{academyProfile?.email || 'Not provided'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Website</label>
            <a href={academyProfile?.website} className="text-blue-600 hover:underline">
              {academyProfile?.website || 'Not provided'}
            </a>
          </div>

          {/* Location */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Address</label>
            <p className="text-gray-900 flex items-start">
              <MapPin className="w-4 h-4 mr-1 mt-0.5" />
              {academyProfile?.address}, {academyProfile?.city}, {academyProfile?.state}, {academyProfile?.country} - {academyProfile?.pincode}
            </p>
          </div>

          {/* Academy Details */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Academy Type</label>
            <p className="text-gray-900">{academyProfile?.academy_type || 'Not provided'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Level</label>
            <p className="text-gray-900">{academyProfile?.level || 'Not provided'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Established Year</label>
            <p className="text-gray-900">{academyProfile?.established_year || 'Not provided'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Accreditation</label>
            <p className="text-gray-900">{academyProfile?.accreditation || 'Not provided'}</p>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
          <p className="text-gray-900">{academyProfile?.description || 'No description provided'}</p>
        </div>

        {/* Bio */}
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Bio</label>
          <p className="text-gray-900">{academyProfile?.bio || 'No bio provided'}</p>
        </div>

        {/* Facilities */}
        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Facilities</label>
          <p className="text-gray-900">{academyProfile?.facilities || 'No facilities listed'}</p>
        </div>

        {/* Services Offered */}
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Services Offered</label>
          <p className="text-gray-900">{academyProfile?.services_offered || 'No services listed'}</p>
        </div>

        {/* Programs Offered */}
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Programs Offered</label>
          <p className="text-gray-900">{academyProfile?.programs_offered || 'No programs listed'}</p>
        </div>

        {/* Age Groups */}
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Age Groups</label>
          <p className="text-gray-900">{academyProfile?.age_groups || 'Not specified'}</p>
        </div>

        {/* Batch Timings */}
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Batch Timings</label>
          <p className="text-gray-900">{academyProfile?.batch_timings || 'Not specified'}</p>
        </div>

        {/* Fees Structure */}
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Fees Structure</label>
          <p className="text-gray-900">{academyProfile?.fees_structure || 'Not specified'}</p>
        </div>

        {/* Social Media */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Social Media</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {academyProfile?.instagram_handle && (
              <div className="flex items-center space-x-2">
                <span className="text-pink-600">📷</span>
                <span className="text-sm text-gray-900">{academyProfile.instagram_handle}</span>
              </div>
            )}
            {academyProfile?.facebook_handle && (
              <div className="flex items-center space-x-2">
                <span className="text-blue-600">📘</span>
                <span className="text-sm text-gray-900">{academyProfile.facebook_handle}</span>
              </div>
            )}
            {academyProfile?.twitter_handle && (
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">🐦</span>
                <span className="text-sm text-gray-900">{academyProfile.twitter_handle}</span>
              </div>
            )}
            {academyProfile?.youtube_handle && (
              <div className="flex items-center space-x-2">
                <span className="text-red-600">📺</span>
                <span className="text-sm text-gray-900">{academyProfile.youtube_handle}</span>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{academyProfile?.total_students || 0}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{academyProfile?.successful_placements || 0}</div>
            <div className="text-sm text-gray-600">Successful Placements</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{academyProfile?.coaching_staff_count || 0}</div>
            <div className="text-sm text-gray-600">Coaching Staff</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{academyProfile?.established_year || 0}</div>
            <div className="text-sm text-gray-600">Established Year</div>
          </div>
        </div>

        {/* Achievements */}
        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Achievements</label>
          <p className="text-gray-900">{academyProfile?.achievements || 'No achievements listed'}</p>
        </div>

        {/* Testimonials */}
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Testimonials</label>
          <p className="text-gray-900">{academyProfile?.testimonials || 'No testimonials available'}</p>
        </div>
      </div>

      {/* Coaching Staff */}
      {coaches.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
            Coaching Staff
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coaches.map((coach) => (
              <div key={coach.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900">{coach.coach_name}</h3>
                <p className="text-sm text-blue-600">{coach.specialization}</p>
                <p className="text-sm text-gray-600">{coach.experience_years} years experience</p>
                <p className="text-xs text-gray-500 mt-2">{coach.qualifications}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Programs */}
      {programs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <Calendar className="w-5 h-5 mr-2 text-green-600" />
            Programs Offered
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programs.map((program) => (
              <div key={program.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900">{program.program_name}</h3>
                <p className="text-sm text-gray-600">{program.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">{program.age_group} • {program.level}</span>
                  <span className="text-sm font-medium text-green-600">₹{program.fees}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Duration: {program.duration_weeks} weeks • Max: {program.max_students} students
                </div>
              </div>
            ))}
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
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Edit Academy
        </button>
      </div>
    </div>
  );
}