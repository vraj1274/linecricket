import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Globe, Calendar, Users, Award, Star, Clock, DollarSign, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';
import { academyService, AcademyProfile } from '../services/academyService';
import { useToast } from '../contexts/ToastContext';

interface AcademyProfileViewProps {
  academyId: string;
  onBack?: () => void;
}

export function AcademyProfileView({ academyId, onBack }: AcademyProfileViewProps) {
  const [academy, setAcademy] = useState<AcademyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadAcademyData();
  }, [academyId]);

  const loadAcademyData = async () => {
    try {
      setLoading(true);
      const [academyResponse, statsResponse] = await Promise.all([
        academyService.getAcademy(academyId),
        academyService.getAcademyStats(academyId).catch(() => null)
      ]);

      if (academyResponse.success) {
        setAcademy(academyResponse.profile_page);
      }

      if (statsResponse) {
        setStats(statsResponse.statistics);
      }
    } catch (error) {
      console.error('Error loading academy data:', error);
      showToast({ title: 'Error', message: 'Failed to load academy data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading academy profile...</p>
        </div>
      </div>
    );
  }

  if (!academy) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Academy Not Found</h2>
          <p className="text-gray-600 mb-6">The academy profile you're looking for doesn't exist.</p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ← Back
                </button>
              )}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{academy.academy_name}</h1>
                  {academy.tagline && (
                    <p className="text-gray-600">{academy.tagline}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {academy.is_verified && (
                <div className="flex items-center space-x-1 text-green-600">
                  <Award className="w-4 h-4" />
                  <span className="text-sm font-medium">Verified</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              {academy.description && (
                <p className="text-gray-700 mb-4">{academy.description}</p>
              )}
              {academy.bio && (
                <p className="text-gray-700">{academy.bio}</p>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {academy.contact_person && (
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{academy.contact_person}</span>
                  </div>
                )}
                {academy.contact_number && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{academy.contact_number}</span>
                  </div>
                )}
                {academy.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{academy.email}</span>
                  </div>
                )}
                {academy.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <a href={academy.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800">
                      {academy.website}
                    </a>
                  </div>
                )}
                {academy.address && (
                  <div className="flex items-start space-x-3 md:col-span-2">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-700">{academy.address}</p>
                      <p className="text-gray-600 text-sm">
                        {academy.city}, {academy.state} {academy.pincode}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Facilities & Services */}
            {(academy.facilities.length > 0 || academy.services_offered.length > 0) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Facilities & Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {academy.facilities.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Facilities</h3>
                      <div className="flex flex-wrap gap-2">
                        {academy.facilities.map((facility, index) => (
                          <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {academy.services_offered.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Services</h3>
                      <div className="flex flex-wrap gap-2">
                        {academy.services_offered.map((service, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Programs */}
            {academy.programs_offered.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Programs Offered</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {academy.programs_offered.map((program, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900">{program}</h3>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Batch Timings */}
            {academy.batch_timings.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Batch Timings</h2>
                <div className="space-y-2">
                  {academy.batch_timings.map((timing, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{timing.day}</span>
                      <span className="text-gray-600">{timing.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Media */}
            {(academy.instagram_handle || academy.facebook_handle || academy.twitter_handle || academy.youtube_handle) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Follow Us</h2>
                <div className="flex space-x-4">
                  {academy.instagram_handle && (
                    <a href={`https://instagram.com/${academy.instagram_handle}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-pink-600 hover:text-pink-800">
                      <Instagram className="w-5 h-5" />
                      <span>@{academy.instagram_handle}</span>
                    </a>
                  )}
                  {academy.facebook_handle && (
                    <a href={`https://facebook.com/${academy.facebook_handle}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                      <Facebook className="w-5 h-5" />
                      <span>{academy.facebook_handle}</span>
                    </a>
                  )}
                  {academy.twitter_handle && (
                    <a href={`https://twitter.com/${academy.twitter_handle}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-400 hover:text-blue-600">
                      <Twitter className="w-5 h-5" />
                      <span>@{academy.twitter_handle}</span>
                    </a>
                  )}
                  {academy.youtube_handle && (
                    <a href={`https://youtube.com/${academy.youtube_handle}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-red-600 hover:text-red-800">
                      <Youtube className="w-5 h-5" />
                      <span>{academy.youtube_handle}</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Academy Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Academy Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-900 capitalize">{academy.academy_type.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Level:</span>
                  <span className="font-medium text-gray-900 capitalize">{academy.level}</span>
                </div>
                {academy.established_year && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Established:</span>
                    <span className="font-medium text-gray-900">{academy.established_year}</span>
                  </div>
                )}
                {academy.accreditation && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Accreditation:</span>
                    <span className="font-medium text-gray-900">{academy.accreditation}</span>
                  </div>
                )}
                {academy.age_groups && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age Groups:</span>
                    <span className="font-medium text-gray-900">{academy.age_groups}</span>
                  </div>
                )}
                {academy.coaching_staff_count > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Staff Count:</span>
                    <span className="font-medium text-gray-900">{academy.coaching_staff_count}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}
            {stats && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Programs:</span>
                    <span className="font-medium text-gray-900">{stats.total_programs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Programs:</span>
                    <span className="font-medium text-gray-900">{stats.active_programs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Students:</span>
                    <span className="font-medium text-gray-900">{stats.total_students}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Students:</span>
                    <span className="font-medium text-gray-900">{stats.active_students}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Fees Structure */}
            {Object.keys(academy.fees_structure).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Fees Structure</h3>
                <div className="space-y-2">
                  {Object.entries(academy.fees_structure).map(([period, amount]) => (
                    <div key={period} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{period}:</span>
                      <span className="font-medium text-gray-900">₹{amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Actions */}
            {academy.allow_messages && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                  Send Message
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
