import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Edit3, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal, 
  Heart, 
  Star, 
  Users, 
  Trophy, 
  MapPin, 
  Calendar,
  CheckCircle,
  Settings,
  Camera,
  Grid3X3,
  List,
  Filter
} from 'lucide-react';
import { useProfileSwitch } from '../contexts/ProfileSwitchContext';
import { MediaDisplay } from './MediaDisplay';

interface SocialProfileViewProps {
  onBack: () => void;
  profileId: string;
  profileType: 'player' | 'coach' | 'venue' | 'academy' | 'community';
}

interface ProfileStats {
  posts: number;
  followers: number;
  following: number;
  likes: number;
  matches?: number;
  rating?: number;
}

interface Post {
  id: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  isLiked: boolean;
}

export function SocialProfileView({ onBack, profileId, profileType }: SocialProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'achievements'>('posts');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [profileData, setProfileData] = useState<any>(null);
  const [stats, setStats] = useState<ProfileStats>({
    posts: 42,
    followers: 1234,
    following: 567,
    likes: 8901,
    matches: 15,
    rating: 4.8
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const { currentProfile, availableProfiles } = useProfileSwitch();

  useEffect(() => {
    // Load profile data based on profileId and profileType
    loadProfileData();
    loadPosts();
  }, [profileId, profileType]);

  const loadProfileData = async () => {
    // Mock profile data - in real implementation, fetch from API
    const mockProfile = {
      id: profileId,
      name: 'John Doe',
      username: '@johndoe',
      bio: 'Professional cricket player and coach. Passionate about developing young talent.',
      location: 'Mumbai, India',
      website: 'https://johndoe.com',
      email: 'john@example.com',
      phone: '+91 98765 43210',
      isVerified: true,
      joinDate: '2023-01-15',
      profileImage: 'https://via.placeholder.com/150',
      coverImage: 'https://via.placeholder.com/800x200'
    };
    setProfileData(mockProfile);
  };

  const loadPosts = () => {
    // Mock posts data
    const mockPosts: Post[] = [
      {
        id: '1',
        content: 'Great match today! Thanks to all the supporters.',
        image: 'https://via.placeholder.com/400x300',
        likes: 45,
        comments: 12,
        shares: 8,
        timestamp: '2 hours ago',
        isLiked: false
      },
      {
        id: '2',
        content: 'Training session with the team. Everyone is improving!',
        likes: 32,
        comments: 5,
        shares: 3,
        timestamp: '1 day ago',
        isLiked: true
      },
      {
        id: '3',
        content: 'New coaching techniques I learned at the workshop.',
        image: 'https://via.placeholder.com/400x300',
        likes: 28,
        comments: 7,
        shares: 2,
        timestamp: '3 days ago',
        isLiked: false
      }
    ];
    setPosts(mockPosts);
  };


  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1 
          }
        : post
    ));
  };

  const getProfileIcon = () => {
    switch (profileType) {
      case 'player': return <Trophy className="w-6 h-6" />;
      case 'coach': return <Users className="w-6 h-6" />;
      case 'venue': return <MapPin className="w-6 h-6" />;
      case 'academy': return <Star className="w-6 h-6" />;
      case 'community': return <Users className="w-6 h-6" />;
      default: return <Users className="w-6 h-6" />;
    }
  };

  const getProfileColor = () => {
    switch (profileType) {
      case 'player': return 'from-blue-500 to-blue-700';
      case 'coach': return 'from-green-500 to-green-700';
      case 'venue': return 'from-purple-500 to-purple-700';
      case 'academy': return 'from-orange-500 to-orange-700';
      case 'community': return 'from-pink-500 to-pink-700';
      default: return 'from-gray-500 to-gray-700';
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
              <p className="text-sm text-gray-500">{stats.posts} posts</p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <MoreHorizontal className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white">
          {/* Cover Image */}
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <button className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full hover:bg-opacity-30 transition-colors">
              <Camera className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            {/* Profile Picture */}
            <div className="relative -mt-16 mb-4">
              <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getProfileColor()} flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg`}>
                {profileData.name.charAt(0)}
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Details */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">{profileData.name}</h2>
                  {profileData.isVerified && (
                    <CheckCircle className="w-6 h-6 text-blue-500" />
                  )}
                </div>
                <p className="text-gray-600 mb-2">@{profileData.username}</p>
                <p className="text-gray-700 mb-3">{profileData.bio}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profileData.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(profileData.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {profileData.website && (
                  <a 
                    href={profileData.website} 
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {profileData.website}
                  </a>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`px-6 py-2 rounded-full font-medium transition-colors ${
                    isFollowing 
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button
                  onClick={() => setShowMessageModal(true)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
                >
                  Message
                </button>
                <button className="p-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 mb-6">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{stats.posts}</div>
                <div className="text-sm text-gray-500">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{stats.followers.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{stats.following}</div>
                <div className="text-sm text-gray-500">Following</div>
              </div>
              {stats.matches && (
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{stats.matches}</div>
                  <div className="text-sm text-gray-500">Matches</div>
                </div>
              )}
              {stats.rating && (
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{stats.rating}</div>
                  <div className="text-sm text-gray-500">Rating</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'posts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Posts
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'about'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab('achievements')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
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

        {/* Content */}
        <div className="bg-white">
          {activeTab === 'posts' && (
            <div className="p-6">
              {/* Posts Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Posts</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Posts Grid/List */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <div key={post.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      {post.image && (
                        <div className="aspect-square bg-gray-100">
                          <img 
                            src={post.image} 
                            alt="Post" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <p className="text-gray-900 mb-3 line-clamp-3">{post.content}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <button 
                              onClick={() => handleLike(post.id)}
                              className={`flex items-center space-x-1 ${
                                post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                              <span>{post.likes}</span>
                            </button>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="w-4 h-4" />
                              <span>{post.comments}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Share2 className="w-4 h-4" />
                              <span>{post.shares}</span>
                            </div>
                          </div>
                          <span>{post.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getProfileColor()} flex items-center justify-center text-white font-bold`}>
                          {profileData.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{profileData.name}</h4>
                            <span className="text-sm text-gray-500">@{profileData.username}</span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-500">{post.timestamp}</span>
                          </div>
                          <p className="text-gray-900 mb-4">{post.content}</p>
                          {post.image && (
                            <div className="mb-4">
                              <MediaDisplay 
                                imageUrl={post.image}
                                maxHeight="max-h-80"
                              />
                            </div>
                          )}
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <button 
                              onClick={() => handleLike(post.id)}
                              className={`flex items-center space-x-2 ${
                                post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                              }`}
                            >
                              <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                              <span>{post.likes}</span>
                            </button>
                            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500">
                              <MessageCircle className="w-5 h-5" />
                              <span>{post.comments}</span>
                            </button>
                            <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500">
                              <Share2 className="w-5 h-5" />
                              <span>{post.shares}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">About</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Bio</h4>
                  <p className="text-gray-700">{profileData.bio}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Email:</span>
                      <span className="text-gray-900">{profileData.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Phone:</span>
                      <span className="text-gray-900">{profileData.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Location:</span>
                      <span className="text-gray-900">{profileData.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg p-6 text-white">
                  <Trophy className="w-8 h-8 mb-3" />
                  <h4 className="font-semibold mb-2">Player of the Year</h4>
                  <p className="text-sm opacity-90">2023</p>
                </div>
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-6 text-white">
                  <Star className="w-8 h-8 mb-3" />
                  <h4 className="font-semibold mb-2">Best Coach</h4>
                  <p className="text-sm opacity-90">2022</p>
                </div>
                <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-6 text-white">
                  <Users className="w-8 h-8 mb-3" />
                  <h4 className="font-semibold mb-2">Team Leadership</h4>
                  <p className="text-sm opacity-90">2021</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
