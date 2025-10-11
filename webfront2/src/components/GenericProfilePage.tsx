import { ArrowLeft, Award, Calendar, CheckCircle, Edit2, MapPin, MessageCircle, Phone, Save, Star, Users, X, Building2, GraduationCap, Trophy, Target, TrendingUp } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useToast } from '../contexts/ToastContext';
import { auth } from '../firebase/config';

interface GenericProfilePageProps {
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
  isVerified: boolean;
  stats: any;
  posts: any[];
  achievements: any[];
  contactInfo: any;
  firebaseUid: string;
}

export function GenericProfilePage({ onBack, profileId, profileType }: GenericProfilePageProps) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'achievements' | 'stats'>('posts');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  
  const { user } = useFirebase();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const user = auth.currentUser;
    setFirebaseUser(user);
    fetchProfileData();
  }, [profileId, profileType]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
        contactInfo: getMockContactInfo(profileType),
        firebaseUid: user?.uid || ''
      };
      
      setProfileData(mockData);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      showError('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

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
        return { 
          ...baseStats, 
          matches: Math.floor(Math.random() * 50) + 10, 
          rating: 4.5,
          totalRuns: Math.floor(Math.random() * 5000) + 1000,
          totalWickets: Math.floor(Math.random() * 200) + 50,
          centuries: Math.floor(Math.random() * 10) + 1,
          halfCenturies: Math.floor(Math.random() * 20) + 5,
          battingAverage: (Math.random() * 50 + 20).toFixed(1),
          bowlingAverage: (Math.random() * 30 + 15).toFixed(1)
        };
      case 'coach':
        return { 
          ...baseStats, 
          experience: Math.floor(Math.random() * 15) + 5, 
          rating: 4.8,
          students: Math.floor(Math.random() * 200) + 50,
          certifications: Math.floor(Math.random() * 10) + 3
        };
      case 'venue':
        return { 
          ...baseStats, 
          matches: Math.floor(Math.random() * 200) + 50,
          capacity: Math.floor(Math.random() * 10000) + 5000,
          facilities: ['Pitch', 'Pavilion', 'Parking', 'Cafeteria']
        };
      case 'academy':
        return { 
          ...baseStats, 
          experience: Math.floor(Math.random() * 20) + 5,
          students: Math.floor(Math.random() * 500) + 100,
          programs: Math.floor(Math.random() * 10) + 3
        };
      case 'community':
        return { 
          ...baseStats, 
          matches: Math.floor(Math.random() * 30) + 5,
          members: Math.floor(Math.random() * 1000) + 100,
          events: Math.floor(Math.random() * 50) + 10
        };
      default:
        return baseStats;
    }
  };

  const getMockPosts = () => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: `post-${i + 1}`,
      content: `This is a sample post ${i + 1} from the ${profileType} profile. It shows the type of content this profile shares.`,
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

  // Inline editing functions
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
      // TODO: Implement actual API call to update profile field
      await new Promise(resolve => setTimeout(resolve, 1000));
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

  const getProfileIcon = (type: string) => {
    switch (type) {
      case 'player': return <Users className="w-6 h-6" />;
      case 'coach': return <GraduationCap className="w-6 h-6" />;
      case 'venue': return <MapPin className="w-6 h-6" />;
      case 'academy': return <Building2 className="w-6 h-6" />;
      case 'community': return <Users className="w-6 h-6" />;
      default: return <Users className="w-6 h-6" />;
    }
  };

  const getProfileColor = (type: string) => {
    switch (type) {
      case 'player': return 'from-gray-500 to-gray-700';
      case 'coach': return 'from-blue-500 to-blue-700';
      case 'venue': return 'from-green-500 to-green-700';
      case 'academy': return 'from-purple-500 to-purple-700';
      case 'community': return 'from-indigo-500 to-indigo-700';
      default: return 'from-gray-500 to-gray-700';
    }
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 sticky top-0 z-10">
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
            <button className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors">
              <MessageCircle className="w-4 h-4 inline mr-2" />
              Message
            </button>
          </div>
        </div>
      </div>

      {/* Profile Header */}
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
            <button className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors">
              <MessageCircle className="w-4 h-4 inline mr-2" />
              Message
            </button>
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
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Stats
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm bg-gradient-to-br ${getProfileColor(profileType)}`}
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
                      <button className="flex items-center space-x-1 hover:text-red-500">
                        <span>❤️</span>
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-blue-500">
                        <span>💬</span>
                        <span>{post.comments}</span>
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
                {editingField === 'bio' ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your bio..."
                      autoFocus
                    />
                    <button
                      onClick={saveField}
                      disabled={isSaving}
                      className="p-2 text-green-600 hover:text-green-700 disabled:opacity-50"
                      title="Save"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-2 text-red-600 hover:text-red-700"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <p className="text-gray-600">{profileData.bio}</p>
                    <button
                      onClick={() => startEditing('bio', profileData.bio)}
                      className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                      title="Edit bio"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
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

        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* Profile-specific stats */}
            {profileType === 'player' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cricket Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{profileData.stats.totalRuns}</div>
                    <div className="text-sm text-gray-600">Total Runs</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{profileData.stats.totalWickets}</div>
                    <div className="text-sm text-gray-600">Total Wickets</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{profileData.stats.centuries}</div>
                    <div className="text-sm text-gray-600">Centuries</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{profileData.stats.halfCenturies}</div>
                    <div className="text-sm text-gray-600">Half Centuries</div>
                  </div>
                </div>
              </div>
            )}

            {profileType === 'coach' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Coaching Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{profileData.stats.experience}</div>
                    <div className="text-sm text-gray-600">Years Experience</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{profileData.stats.students}</div>
                    <div className="text-sm text-gray-600">Students Trained</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{profileData.stats.certifications}</div>
                    <div className="text-sm text-gray-600">Certifications</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{profileData.stats.rating}</div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                </div>
              </div>
            )}

            {profileType === 'venue' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Venue Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{profileData.stats.capacity}</div>
                    <div className="text-sm text-gray-600">Capacity</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{profileData.stats.matches}</div>
                    <div className="text-sm text-gray-600">Matches Hosted</div>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Facilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {profileData.stats.facilities?.map((facility: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {profileType === 'academy' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Academy Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{profileData.stats.experience}</div>
                    <div className="text-sm text-gray-600">Years Experience</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{profileData.stats.students}</div>
                    <div className="text-sm text-gray-600">Current Students</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{profileData.stats.programs}</div>
                    <div className="text-sm text-gray-600">Programs Offered</div>
                  </div>
                </div>
              </div>
            )}

            {profileType === 'community' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">{profileData.stats.members}</div>
                    <div className="text-sm text-gray-600">Members</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{profileData.stats.events}</div>
                    <div className="text-sm text-gray-600">Events Organized</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{profileData.stats.matches}</div>
                    <div className="text-sm text-gray-600">Matches Played</div>
                  </div>
                </div>
              </div>
            )}
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
    </div>
  );
}
