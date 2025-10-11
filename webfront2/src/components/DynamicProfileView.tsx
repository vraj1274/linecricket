import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit3, MessageCircle, Phone, Star, Users, Award, Trophy, Target, TrendingUp, Send, Heart, Share2, Bookmark } from 'lucide-react';
import { useProfileSwitch } from '../contexts/ProfileSwitchContext';
import { useToast } from '../contexts/ToastContext';
import { ComprehensiveProfileEdit } from './ComprehensiveProfileEdit';

interface DynamicProfileViewProps {
  onBack: () => void;
  onNavigateToEdit?: () => void;
}

export function DynamicProfileView({ onBack, onNavigateToEdit }: DynamicProfileViewProps) {
  const { currentProfile, availableProfiles } = useProfileSwitch();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'achievements'>('posts');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (currentProfile) {
      loadProfileData();
    }
  }, [currentProfile]);

  const loadProfileData = async () => {
    if (!currentProfile) return;

    setLoading(true);
    try {
      // For now, use mock data based on profile type
      // In a real implementation, this would fetch from the API
      const mockData = getMockProfileData(currentProfile.type);
      setProfileData(mockData);
    } catch (error) {
      console.error('Error loading profile data:', error);
      showToast('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getMockProfileData = (profileType: string) => {
    const baseData = {
      id: currentProfile?.id,
      name: currentProfile?.name,
      username: currentProfile?.username,
      bio: `This is a ${profileType} profile.`,
      location: 'Mumbai, India',
      profileType,
      avatar: currentProfile?.avatar,
      isVerified: true,
      stats: {
        followers: Math.floor(Math.random() * 1000) + 100,
        following: Math.floor(Math.random() * 500) + 50,
        posts: Math.floor(Math.random() * 100) + 10,
        matches: profileType === 'player' ? Math.floor(Math.random() * 50) + 5 : undefined,
        experience: profileType === 'coach' ? Math.floor(Math.random() * 20) + 5 : undefined,
        rating: Math.floor(Math.random() * 2) + 4
      },
      posts: [],
      achievements: [
        {
          id: '1',
          title: `${profileType.charAt(0).toUpperCase() + profileType.slice(1)} Achievement`,
          description: 'Outstanding performance in the field',
          date: '2024-01-15',
          icon: '🏆'
        }
      ],
      contactInfo: {
        phone: '+91 9876543210',
        email: 'contact@example.com'
      }
    };

    // Add type-specific data
    switch (profileType) {
      case 'player':
        return {
          ...baseData,
          bio: 'Passionate cricket player with 10+ years of experience',
          stats: { ...baseData.stats, matches: 45, runs: 2500, wickets: 120 }
        };
      case 'coach':
        return {
          ...baseData,
          bio: 'Professional cricket coach with 15+ years of experience',
          stats: { ...baseData.stats, experience: 15, students: 200, rating: 4.8 }
        };
      case 'venue':
        return {
          ...baseData,
          bio: 'Premium cricket venue with world-class facilities',
          stats: { ...baseData.stats, capacity: 500, bookings: 150, rating: 4.6 }
        };
      case 'academy':
        return {
          ...baseData,
          bio: 'Leading cricket academy nurturing young talent',
          stats: { ...baseData.stats, students: 300, coaches: 12, rating: 4.9 }
        };
      case 'community':
        return {
          ...baseData,
          bio: 'Active cricket community bringing players together',
          stats: { ...baseData.stats, members: 500, events: 25, rating: 4.7 }
        };
      default:
        return baseData;
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = (updatedData: any) => {
    setProfileData(prev => prev ? { ...prev, ...updatedData } : null);
    setIsEditing(false);
    showToast('Profile updated successfully!', 'success');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      showToast('Please enter a message', 'error');
      return;
    }

    setSendingMessage(true);
    try {
      // Simulate sending message
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast(`Message sent to ${profileData?.name}!`, 'success');
      setMessageText('');
      setShowMessageModal(false);
    } catch (error) {
      showToast('Failed to send message. Please try again.', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  if (isEditing && currentProfile) {
    return (
      <ComprehensiveProfileEdit
        profileType={currentProfile.type}
        profileId={currentProfile.id.toString()}
        initialData={profileData}
        onBack={handleCancelEdit}
        onSave={handleSaveProfile}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No profile data found</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white text-xl"
                  style={{ background: currentProfile?.color || 'linear-gradient(to bottom right, #5D798E, #2E4B5F)' }}
                >
                  {currentProfile?.avatar || '👤'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <Star className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{profileData.name}</h2>
                  {profileData.isVerified && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">Verified</span>
                  )}
                </div>
                <p className="text-lg text-gray-600">@{profileData.username}</p>
                <p className="text-sm text-gray-500 mt-1">{profileData.bio}</p>
                <p className="text-sm text-gray-500">
                  🏏 {profileData.location} | 📍 {profileData.profileType.charAt(0).toUpperCase() + profileData.profileType.slice(1)}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleEditProfile}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => setShowMessageModal(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{profileData.stats.followers}</div>
              <div className="text-sm text-gray-600">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{profileData.stats.following}</div>
              <div className="text-sm text-gray-600">Following</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{profileData.stats.posts}</div>
              <div className="text-sm text-gray-600">Posts</div>
            </div>
            {profileData.stats.rating && (
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{profileData.stats.rating}</div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['posts', 'about', 'achievements'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'posts' && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Target className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600">Posts will appear here when created.</p>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                  <p className="text-gray-600">{profileData.bio}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    {profileData.contactInfo.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{profileData.contactInfo.phone}</span>
                      </div>
                    )}
                    {profileData.contactInfo.email && (
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{profileData.contactInfo.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="space-y-4">
                {profileData.achievements.map((achievement: any) => (
                  <div key={achievement.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                      <p className="text-gray-600">{achievement.description}</p>
                      <p className="text-sm text-gray-500">{achievement.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Modal */}
        {showMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Message</h3>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {sendingMessage ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
