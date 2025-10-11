import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit3, MessageCircle, Phone, Star, Users, Award, Trophy, Target, TrendingUp, CheckCircle, Share2, Bookmark } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface ProfileCreationSuccessProps {
  profileData: any;
  onBack: () => void;
  onEdit?: () => void;
  onViewProfile?: () => void;
}

export function ProfileCreationSuccess({ 
  profileData, 
  onBack, 
  onEdit, 
  onViewProfile 
}: ProfileCreationSuccessProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'achievements'>('about');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const { showToast } = useToast();

  const getProfileIcon = (type: string) => {
    switch (type) {
      case 'player': return '🏏';
      case 'coach': return '👨‍🏫';
      case 'venue': return '🏟️';
      case 'academy': return '🎓';
      case 'community': return '👥';
      default: return '👤';
    }
  };

  const getProfileColor = (type: string) => {
    switch (type) {
      case 'player': return 'linear-gradient(to bottom right, #2e4b5f, #1a5f3f)';
      case 'coach': return 'linear-gradient(to bottom right, #5D798E, #2E4B5F)';
      case 'venue': return 'linear-gradient(to bottom right, #1A5F3F, #2E4B5F)';
      case 'academy': return 'linear-gradient(to bottom right, #E85E20, #F97316)';
      case 'community': return 'linear-gradient(to bottom right, #6B7280, #4B5563)';
      default: return 'linear-gradient(to bottom right, #5D798E, #2E4B5F)';
    }
  };

  const getProfileTitle = (type: string) => {
    switch (type) {
      case 'player': return 'Player Profile';
      case 'coach': return 'Coach Profile';
      case 'venue': return 'Venue Profile';
      case 'academy': return 'Academy Profile';
      case 'community': return 'Community Profile';
      default: return 'Profile';
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    setSendingMessage(true);
    try {
      // Simulate sending message
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast('Message sent successfully!', 'success');
      setMessageText('');
      setShowMessageModal(false);
    } catch (error) {
      showToast('Failed to send message', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const renderProfileContent = () => {
    if (!profileData) return null;

    switch (profileData.profile_type) {
      case 'player':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Player Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Player Role</label>
                  <p className="text-gray-900">{profileData.player_role || 'Batsman'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Batting Style</label>
                  <p className="text-gray-900">{profileData.batting_style || 'Right Handed'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Bowling Style</label>
                  <p className="text-gray-900">{profileData.bowling_style || 'Right Arm Fast'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Current Team</label>
                  <p className="text-gray-900">{profileData.current_team || 'Not specified'}</p>
                </div>
              </div>
              {profileData.bio && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-500">Bio</label>
                  <p className="text-gray-900 mt-1">{profileData.bio}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'coach':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Coach Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Specialization</label>
                  <p className="text-gray-900">{profileData.specialization || 'Batting'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Experience</label>
                  <p className="text-gray-900">{profileData.experience_years || 0} years</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Certifications</label>
                  <p className="text-gray-900">{profileData.certifications || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Hourly Rate</label>
                  <p className="text-gray-900">${profileData.hourly_rate || 0}/hour</p>
                </div>
              </div>
              {profileData.bio && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-500">Bio</label>
                  <p className="text-gray-900 mt-1">{profileData.bio}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'venue':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Venue Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Venue Type</label>
                  <p className="text-gray-900">{profileData.venue_type || 'Cricket Ground'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Capacity</label>
                  <p className="text-gray-900">{profileData.capacity || 0} people</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Facilities</label>
                  <p className="text-gray-900">{profileData.facilities || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Hourly Rate</label>
                  <p className="text-gray-900">${profileData.hourly_rate || 0}/hour</p>
                </div>
              </div>
              {profileData.description && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900 mt-1">{profileData.description}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'academy':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Academy Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Academy Type</label>
                  <p className="text-gray-900">{profileData.academy_type || 'Cricket Academy'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Level</label>
                  <p className="text-gray-900">{profileData.level || 'Beginner'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Age Groups</label>
                  <p className="text-gray-900">{profileData.age_groups || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Programs</label>
                  <p className="text-gray-900">{profileData.programs || 'Not specified'}</p>
                </div>
              </div>
              {profileData.description && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900 mt-1">{profileData.description}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'community':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Community Type</label>
                  <p className="text-gray-900">{profileData.community_type || 'General'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Level</label>
                  <p className="text-gray-900">{profileData.level || 'Beginner'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Activities</label>
                  <p className="text-gray-900">{profileData.activities || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Meeting Schedule</label>
                  <p className="text-gray-900">{profileData.meeting_schedule || 'Not specified'}</p>
                </div>
              </div>
              {profileData.description && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900 mt-1">{profileData.description}</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <p className="text-gray-500">No additional information available.</p>
          </div>
        );
    }
  };

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <div className="flex items-center space-x-3">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              )}
              {onViewProfile && (
                <button
                  onClick={onViewProfile}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Users className="w-4 h-4 mr-2" />
                  View Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-green-800">
                Profile Created Successfully!
              </h2>
              <p className="text-green-700 mt-1">
                Your {getProfileTitle(profileData.profile_type)} has been created and is now active.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border mb-8 overflow-hidden">
          <div 
            className="h-32 relative"
            style={{ background: getProfileColor(profileData.profile_type) }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>
          <div className="p-6 -mt-16 relative">
            <div className="flex items-end justify-between">
              <div className="flex items-end">
                <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center text-3xl">
                  {getProfileIcon(profileData.profile_type)}
                </div>
                <div className="ml-4 pb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profileData.name || profileData.display_name || profileData.venue_name || profileData.academy_name || profileData.community_name}
                  </h1>
                  <p className="text-gray-600">
                    {getProfileTitle(profileData.profile_type)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Created on {new Date(profileData.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowMessageModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </button>
                <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('about')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'about'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    About
                  </button>
                  <button
                    onClick={() => setActiveTab('posts')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'posts'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Posts
                  </button>
                  <button
                    onClick={() => setActiveTab('achievements')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'achievements'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Achievements
                  </button>
                </nav>
              </div>
              <div className="p-6">
                {activeTab === 'about' && renderProfileContent()}
                {activeTab === 'posts' && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <MessageCircle className="w-12 h-12 mx-auto" />
                    </div>
                    <p className="text-gray-500">No posts yet. Start sharing your cricket journey!</p>
                  </div>
                )}
                {activeTab === 'achievements' && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Trophy className="w-12 h-12 mx-auto" />
                    </div>
                    <p className="text-gray-500">No achievements yet. Keep playing and they'll appear here!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-3" />
                  <span>{profileData.contact_number || 'Not provided'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MessageCircle className="w-4 h-4 mr-3" />
                  <span>{profileData.email || 'Not provided'}</span>
                </div>
                {profileData.location && (
                  <div className="flex items-center text-gray-600">
                    <Target className="w-4 h-4 mr-3" />
                    <span>{profileData.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowMessageModal(true)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Bookmark className="w-4 h-4 mr-2" />
                  Bookmark Profile
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Message</h3>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message here..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowMessageModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || sendingMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sendingMessage ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
