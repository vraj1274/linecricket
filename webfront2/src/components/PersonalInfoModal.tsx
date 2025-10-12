import React from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, Shield, Eye, EyeOff } from 'lucide-react';

interface PersonalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: any;
  firebaseUser: any;
}

export function PersonalInfoModal({ isOpen, onClose, profileData, firebaseUser }: PersonalInfoModalProps) {
  const [showSensitiveInfo, setShowSensitiveInfo] = React.useState(false);

  if (!isOpen) return null;

  const personalInfo = {
    fullName: profileData?.full_name || profileData?.profile?.full_name || firebaseUser?.displayName || 'Not provided',
    username: profileData?.username || firebaseUser?.email?.split('@')[0] || 'Not provided',
    email: firebaseUser?.email || profileData?.email || 'Not provided',
    phone: profileData?.contact_number || profileData?.profile?.contact_number || 'Not provided',
    location: profileData?.location || profileData?.profile?.location || 'Not provided',
    organization: profileData?.organization || profileData?.profile?.organization || 'Not provided',
    age: profileData?.age || profileData?.profile?.age || 'Not provided',
    gender: profileData?.gender || profileData?.profile?.gender || 'Not provided',
    bio: profileData?.bio || profileData?.profile?.bio || 'Not provided',
    dateOfBirth: profileData?.date_of_birth || profileData?.profile?.date_of_birth || 'Not provided',
    emergencyContact: profileData?.emergency_contact || profileData?.profile?.emergency_contact || 'Not provided',
    bloodGroup: profileData?.blood_group || profileData?.profile?.blood_group || 'Not provided',
    medicalConditions: profileData?.medical_conditions || profileData?.profile?.medical_conditions || 'Not provided',
    address: profileData?.address || profileData?.profile?.address || 'Not provided',
    city: profileData?.city || profileData?.profile?.city || 'Not provided',
    state: profileData?.state || profileData?.profile?.state || 'Not provided',
    pincode: profileData?.pincode || profileData?.profile?.pincode || 'Not provided',
    country: profileData?.country || profileData?.profile?.country || 'Not provided',
  };

  const sensitiveFields = ['phone', 'dateOfBirth', 'emergencyContact', 'bloodGroup', 'medicalConditions', 'address', 'city', 'state', 'pincode', 'country'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-20 transition-opacity" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3" style={{ backgroundColor: 'var(--cricket-green)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-white" />
                <h2 className="text-lg font-bold text-white">Personal Information</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
                  className="flex items-center space-x-1 px-3 py-1 text-white text-sm rounded transition-colors"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                >
                  {showSensitiveInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{showSensitiveInfo ? 'Hide' : 'Show'} Sensitive Info</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[50vh] overflow-y-auto p-3">
            <div className="space-y-3">
              {/* Basic Information */}
              <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--pavilion-cream)' }}>
                <h3 className="text-base font-semibold mb-3 flex items-center space-x-2" style={{ color: 'var(--cricket-green)' }}>
                  <User className="w-4 h-4" />
                  <span>Basic Information</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--scoreboard-gray)' }}>Full Name</label>
                    <p className="text-sm text-gray-900 font-medium">{personalInfo.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--scoreboard-gray)' }}>Username</label>
                    <p className="text-sm text-gray-900 font-medium">@{personalInfo.username}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--scoreboard-gray)' }}>Email</label>
                    <p className="text-sm text-gray-900 font-medium">{personalInfo.email}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--scoreboard-gray)' }}>Age</label>
                    <p className="text-sm text-gray-900 font-medium">{personalInfo.age}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--scoreboard-gray)' }}>Gender</label>
                    <p className="text-sm text-gray-900 font-medium">{personalInfo.gender}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--scoreboard-gray)' }}>Location</label>
                    <p className="text-sm text-gray-900 font-medium">{personalInfo.location}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--pavilion-cream)' }}>
                <h3 className="text-base font-semibold mb-3 flex items-center space-x-2" style={{ color: 'var(--cricket-green)' }}>
                  <Phone className="w-4 h-4" />
                  <span>Contact Information</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--scoreboard-gray)' }}>Phone Number</label>
                    <p className="text-sm text-gray-900 font-medium">{personalInfo.phone}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--scoreboard-gray)' }}>Organization</label>
                    <p className="text-sm text-gray-900 font-medium">{personalInfo.organization}</p>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--pavilion-cream)' }}>
                <h3 className="text-base font-semibold mb-3 flex items-center space-x-2" style={{ color: 'var(--cricket-green)' }}>
                  <User className="w-4 h-4" />
                  <span>About</span>
                </h3>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--scoreboard-gray)' }}>Bio</label>
                  <p className="text-sm text-gray-900 font-medium">{personalInfo.bio}</p>
                </div>
              </div>

              {/* Sensitive Information - Only shown when toggle is on */}
              {showSensitiveInfo && (
                <>
                  {/* Personal Details */}
                  <div className="rounded-lg p-3 border" style={{ backgroundColor: 'var(--error-light)', borderColor: 'var(--error)' }}>
                    <h3 className="text-base font-semibold mb-3 flex items-center space-x-2" style={{ color: 'var(--error)' }}>
                      <Shield className="w-4 h-4" />
                      <span>Sensitive Information</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--scoreboard-gray)' }}>Date of Birth</label>
                        <p className="text-sm text-gray-900 font-medium">{personalInfo.dateOfBirth}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--scoreboard-gray)' }}>Blood Group</label>
                        <p className="text-sm text-gray-900 font-medium">{personalInfo.bloodGroup}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--scoreboard-gray)' }}>Emergency Contact</label>
                        <p className="text-sm text-gray-900 font-medium">{personalInfo.emergencyContact}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--scoreboard-gray)' }}>Medical Conditions</label>
                        <p className="text-sm text-gray-900 font-medium">{personalInfo.medicalConditions}</p>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="rounded-lg p-3 border" style={{ backgroundColor: 'var(--error-light)', borderColor: 'var(--error)' }}>
                    <h3 className="text-base font-semibold mb-3 flex items-center space-x-2" style={{ color: 'var(--error)' }}>
                      <MapPin className="w-4 h-4" />
                      <span>Address Information</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--scoreboard-gray)' }}>Address</label>
                        <p className="text-sm text-gray-900 font-medium">{personalInfo.address}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--scoreboard-gray)' }}>City</label>
                        <p className="text-sm text-gray-900 font-medium">{personalInfo.city}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--scoreboard-gray)' }}>State</label>
                        <p className="text-sm text-gray-900 font-medium">{personalInfo.state}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--scoreboard-gray)' }}>Pincode</label>
                        <p className="text-sm text-gray-900 font-medium">{personalInfo.pincode}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--scoreboard-gray)' }}>Country</label>
                        <p className="text-sm text-gray-900 font-medium">{personalInfo.country}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Privacy Notice */}
              <div className="rounded-lg p-3 border" style={{ backgroundColor: 'var(--info-light)', borderColor: 'var(--info)' }}>
                <div className="flex items-start space-x-2">
                  <Shield className="w-4 h-4 mt-0.5" style={{ color: 'var(--info)' }} />
                  <div>
                    <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--info)' }}>Privacy Notice</h4>
                    <p className="text-xs text-gray-700">
                      This information is private and visible only to you. Sensitive information is hidden by default for your security. 
                      Use the toggle button to view sensitive details when needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-gray-200" style={{ backgroundColor: 'var(--pavilion-cream)' }}>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-white rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--cricket-green)' }}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'var(--cricket-green-hover)'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'var(--cricket-green)'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
