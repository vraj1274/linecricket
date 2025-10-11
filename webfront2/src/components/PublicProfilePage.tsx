import { ArrowLeft, Calendar, MapPin, MessageCircle, Phone, Star, Users, Award, Trophy, Target, TrendingUp, Send, Heart, Share2, Bookmark, Edit3 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { ComprehensiveProfileEdit } from './ComprehensiveProfileEdit';

interface PublicProfilePageProps {
  onBack: () => void;
  profileId: string;
  profileType: 'player' | 'coach' | 'venue' | 'academy' | 'community';
}

interface ProfileData {
  id: string;
  name: string;
  username: string;
  bio: string;
  location: string;
  profileType: string;
  avatar: string;
  coverImage?: string;
  isVerified: boolean;
  stats: {
    followers: number;
    following: number;
    posts: number;
    matches?: number;
    experience?: number;
    rating?: number;
  };
  posts: Array<{
    id: string;
    content: string;
    image?: string;
    likes: number;
    comments: number;
    createdAt: string;
  }>;
  achievements?: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    icon: string;
  }>;
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

export function PublicProfilePage({ onBack, profileId, profileType }: PublicProfilePageProps) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'achievements'>('posts');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    // Fetch profile data from API
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/public-profile/${profileId}?profile_type=${profileType}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setProfileData(data.profile);
        } else {
          throw new Error(data.error || 'Failed to fetch profile');
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        // Fallback to mock data if API fails
        const mockData: ProfileData = {
          id: profileId,
          name: getMockName(profileType),
          username: `@${getMockUsername(profileType)}`,
          bio: getMockBio(profileType),
          location: 'Mumbai, India',
          profileType,
          avatar: getMockAvatar(profileType),
          isVerified: Math.random() > 0.5,
          stats: getMockStats(profileType),
          posts: getMockPosts(),
          achievements: getMockAchievements(profileType),
          contactInfo: getMockContactInfo(profileType)
        };
        setProfileData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [profileId, profileType]);

  const getMockName = (type: string) => {
    const names = {
      player: 'Rahul Sharma',
      coach: 'Coach Priya Singh',
      venue: 'Mumbai Cricket Ground',
      academy: 'Elite Cricket Academy',
      community: 'Cricket Enthusiasts Mumbai'
    };
    return names[type as keyof typeof names] || 'Unknown';
  };

  const getMockUsername = (type: string) => {
    const usernames = {
      player: 'rahul_sharma_15',
      coach: 'coach_priya',
      venue: 'mumbai_cricket_ground',
      academy: 'elite_cricket_academy',
      community: 'cricket_mumbai'
    };
    return usernames[type as keyof typeof usernames] || 'unknown';
  };

  const getMockBio = (type: string) => {
    const bios = {
      player: 'Professional cricket player with 5+ years of experience. Passionate about the game and always looking to improve.',
      coach: 'Certified cricket coach with 10+ years of experience. Specialized in batting techniques and mental conditioning.',
      venue: 'Premium cricket ground in Mumbai with world-class facilities. Available for matches, training, and tournaments.',
      academy: 'Leading cricket academy in Mumbai. We train players of all ages and skill levels with professional coaching.',
      community: 'A vibrant community of cricket lovers in Mumbai. Join us for matches, discussions, and cricket events.'
    };
    return bios[type as keyof typeof bios] || 'No bio available';
  };

  const getMockAvatar = (type: string) => {
    const avatars = {
      player: 'RS',
      coach: 'PS',
      venue: 'MC',
      academy: 'EA',
      community: 'CM'
    };
    return avatars[type as keyof typeof avatars] || 'U';
  };

  const getMockStats = (type: string) => {
    const baseStats = {
      followers: Math.floor(Math.random() * 10000) + 1000,
      following: Math.floor(Math.random() * 1000) + 100,
      posts: Math.floor(Math.random() * 100) + 10
    };

    switch (type) {
      case 'player':
        return { ...baseStats, matches: Math.floor(Math.random() * 50) + 10, rating: 4.5 };
      case 'coach':
        return { ...baseStats, experience: Math.floor(Math.random() * 15) + 5, rating: 4.8 };
      case 'venue':
        return { ...baseStats, matches: Math.floor(Math.random() * 200) + 50 };
      case 'academy':
        return { ...baseStats, experience: Math.floor(Math.random() * 20) + 5 };
      case 'community':
        return { ...baseStats, matches: Math.floor(Math.random() * 30) + 5 };
      default:
        return baseStats;
    }
  };

  const getMockPosts = () => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: `post-${i + 1}`,
      content: `This is a sample post ${i + 1} from the profile. It shows the type of content this user shares.`,
      image: i % 3 === 0 ? 'cricket-image.jpg' : undefined,
      likes: Math.floor(Math.random() * 100) + 10,
      comments: Math.floor(Math.random() * 20) + 2,
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
    }));
  };

  const getMockAchievements = (type: string) => {
    const achievements = {
      player: [
        { id: '1', title: 'Man of the Match', description: 'Outstanding performance in local tournament', date: '2024-01-15', icon: '🏆' },
        { id: '2', title: 'Century Scorer', description: 'Scored 100+ runs in a single match', date: '2024-02-20', icon: '🎯' },
        { id: '3', title: 'Best Batsman', description: 'Awarded best batsman of the season', date: '2024-03-10', icon: '⭐' }
      ],
      coach: [
        { id: '1', title: 'Certified Coach', description: 'Level 3 Cricket Coaching Certificate', date: '2023-06-15', icon: '📜' },
        { id: '2', title: 'Championship Winner', description: 'Coached team to state championship', date: '2024-01-20', icon: '🏆' },
        { id: '3', title: 'Mentor of the Year', description: 'Recognized for exceptional coaching', date: '2024-02-15', icon: '👨‍🏫' }
      ],
      venue: [
        { id: '1', title: 'Premium Venue', description: 'Certified as premium cricket venue', date: '2023-08-10', icon: '🏟️' },
        { id: '2', title: 'Tournament Host', description: 'Hosted 50+ tournaments successfully', date: '2024-01-05', icon: '🏆' },
        { id: '3', title: 'Best Facilities', description: 'Awarded for excellent facilities', date: '2024-03-01', icon: '⭐' }
      ],
      academy: [
        { id: '1', title: 'Elite Academy', description: 'Recognized as elite cricket academy', date: '2023-09-15', icon: '🎓' },
        { id: '2', title: 'Championship Academy', description: 'Produced multiple championship winners', date: '2024-02-10', icon: '🏆' },
        { id: '3', title: 'Best Training', description: 'Awarded for best training programs', date: '2024-03-20', icon: '⭐' }
      ],
      community: [
        { id: '1', title: 'Active Community', description: 'Most active cricket community', date: '2023-12-01', icon: '👥' },
        { id: '2', title: 'Event Organizer', description: 'Organized 100+ cricket events', date: '2024-01-15', icon: '📅' },
        { id: '3', title: 'Community Leader', description: 'Leading cricket community in Mumbai', date: '2024-02-28', icon: '👑' }
      ]
    };
    return achievements[type as keyof typeof achievements] || [];
  };

  const getMockContactInfo = (type: string) => {
    const contactInfo = {
      player: { phone: '+91 98765 43210', email: 'rahul@example.com' },
      coach: { phone: '+91 98765 43211', email: 'priya@example.com', website: 'coachpriya.com' },
      venue: { phone: '+91 98765 43212', email: 'info@mumbaicricket.com', website: 'mumbaicricket.com' },
      academy: { phone: '+91 98765 43213', email: 'info@elitecricket.com', website: 'elitecricket.com' },
      community: { phone: '+91 98765 43214', email: 'contact@cricketmumbai.com' }
    };
    return contactInfo[type as keyof typeof contactInfo] || {};
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      showToast('Please enter a message', 'error');
      return;
    }

    setSendingMessage(true);
    try {
      const response = await fetch(`http://localhost:5000/api/public-profile/${profileId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          sender_id: 'current_user' // In a real app, this would be the actual user ID
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      
      if (data.success) {
        showToast(`Message sent to ${profileData?.name}!`, 'success');
        setMessageText('');
        setShowMessageModal(false);
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Failed to send message. Please try again.', 'error');
    } finally {
      setSendingMessage(false);
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

  const handleLikePost = (postId: string) => {
    // Simulate liking a post
    showToast('Post liked!', 'success');
  };

  const handleSharePost = (postId: string) => {
    // Simulate sharing a post
    showToast('Post shared!', 'success');
  };

  const handleBookmarkPost = (postId: string) => {
    // Simulate bookmarking a post
    showToast('Post bookmarked!', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Profile not found</h2>
          <p className="text-gray-600 mb-4">The profile you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">{profileData.name}</h1>
              <p className="text-sm text-gray-500">{profileData.username}</p>
            </div>
            <button 
              onClick={() => setShowMessageModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4 inline mr-2" />
              Message
            </button>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                style={{ background: 'linear-gradient(to bottom right, #3B82F6, #1D4ED8)' }}
              >
                {profileData.avatar}
              </div>
              {profileData.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{profileData.name}</h2>
                {profileData.isVerified && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 mb-3">{profileData.bio}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{profileData.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date().getFullYear()}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{profileData.stats.followers.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{profileData.stats.following.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{profileData.stats.posts}</div>
                  <div className="text-sm text-gray-500">Posts</div>
                </div>
                {profileData.stats.matches && (
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{profileData.stats.matches}</div>
                    <div className="text-sm text-gray-500">Matches</div>
                  </div>
                )}
                {profileData.stats.rating && (
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{profileData.stats.rating}</div>
                    <div className="text-sm text-gray-500">Rating</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex space-x-8">
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
              onClick={() => setActiveTab('achievements')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'achievements'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Achievements
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {profileData.posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                    style={{ background: 'linear-gradient(to bottom right, #3B82F6, #1D4ED8)' }}
                  >
                    {profileData.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-900">{profileData.name}</span>
                      <span className="text-gray-500 text-sm">{profileData.username}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500 text-sm">{formatTimeAgo(post.createdAt)}</span>
                    </div>
                    <p className="text-gray-800 mb-3">{post.content}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <button 
                        onClick={() => handleLikePost(post.id)}
                        className="flex items-center space-x-1 hover:text-red-500 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments}</span>
                      </button>
                      <button 
                        onClick={() => handleSharePost(post.id)}
                        className="flex items-center space-x-1 hover:text-green-500 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                      <button 
                        onClick={() => handleBookmarkPost(post.id)}
                        className="flex items-center space-x-1 hover:text-yellow-500 transition-colors"
                      >
                        <Bookmark className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Bio</h4>
                <p className="text-gray-600">{profileData.bio}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{profileData.location}</span>
                </div>
              </div>

              {profileData.contactInfo && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                  <div className="space-y-2">
                    {profileData.contactInfo.phone && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{profileData.contactInfo.phone}</span>
                      </div>
                    )}
                    {profileData.contactInfo.email && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <span className="w-4 h-4">📧</span>
                        <span>{profileData.contactInfo.email}</span>
                      </div>
                    )}
                    {profileData.contactInfo.website && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <span className="w-4 h-4">🌐</span>
                        <a href={profileData.contactInfo.website} className="text-blue-500 hover:underline">
                          {profileData.contactInfo.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-4">
            {profileData.achievements?.map((achievement) => (
              <div key={achievement.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">{achievement.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                    <p className="text-gray-600 text-sm mb-1">{achievement.description}</p>
                    <p className="text-gray-500 text-xs">{new Date(achievement.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Send Message to {profileData?.name}
              </h3>
              <button
                onClick={() => setShowMessageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={4}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowMessageModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage || !messageText.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
  );
}
