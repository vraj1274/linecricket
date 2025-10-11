import { ArrowLeft, Award, Calendar, CheckCircle, Edit2, MapPin, MessageCircle, Phone, Save, Star, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useToast } from '../contexts/ToastContext';
import { ProfileLoadingSpinner } from './LoadingSpinner';

interface CommunityProfilePageProps {
  onBack: () => void;
}

interface CommunityProfile {
  id: number;
  account_id: number;
  community_name: string;
  tagline: string;
  description: string;
  bio: string;
  community_type: string;
  level: string;
  established_date: string;
  location: string;
  city: string;
  state: string;
  country: string;
  contact_person: string;
  contact_number: string;
  email: string;
  website: string;
  logo_url: string;
  banner_image_url: string;
  gallery_images: string;
  is_public: boolean;
  is_private: boolean;
  requires_approval: boolean;
  allow_messages: boolean;
  show_contact: boolean;
  max_members: number;
  current_members: number;
  membership_fee: number;
  membership_duration: string;
  rules: string;
  guidelines: string;
  code_of_conduct: string;
  activities: string;
  regular_meetings: string;
  instagram_handle: string;
  facebook_handle: string;
  twitter_handle: string;
  discord_handle: string;
  whatsapp_group: string;
  total_posts: number;
  total_events: number;
  achievements: string;
  testimonials: string;
  auto_approve_posts: boolean;
  allow_member_posts: boolean;
  allow_guest_posts: boolean;
  content_moderation: boolean;
}

interface CommunityMember {
  id: number;
  community_profile_id: number;
  user_id: number;
  joined_date: string;
  role: string;
  is_active: boolean;
  is_approved: boolean;
}

interface CommunityEvent {
  id: number;
  community_profile_id: number;
  event_name: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  max_participants: number;
  registration_fee: number;
  registration_deadline: string;
  is_public: boolean;
  status: string;
}

interface CommunityPost {
  id: number;
  community_profile_id: number;
  user_id: number;
  title: string;
  content: string;
  post_type: string;
  is_pinned: boolean;
  is_approved: boolean;
  likes_count: number;
  comments_count: number;
}

export function CommunityProfilePage({ onBack }: CommunityProfilePageProps) {
  const [communityProfile, setCommunityProfile] = useState<CommunityProfile | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useFirebase();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadCommunityProfile();
  }, []);

  const loadCommunityProfile = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      // const response = await apiService.getCommunityProfile(user?.uid);
      // setCommunityProfile(response.communityProfile);
      // setMembers(response.members);
      // setEvents(response.events);
      // setPosts(response.posts);
      
      // Mock data for now
      setCommunityProfile({
        id: 1,
        account_id: 1,
        community_name: 'Mumbai Cricket Community',
        tagline: 'Uniting Cricket Lovers',
        description: 'A vibrant community of cricket enthusiasts in Mumbai',
        bio: 'We bring together cricket lovers from all walks of life',
        community_type: 'Sports Community',
        level: 'All Levels',
        established_date: '2020-01-15',
        location: 'Mumbai, Maharashtra',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        contact_person: 'Rajesh Kumar',
        contact_number: '+91 9876543210',
        email: 'contact@mumbaicricketcommunity.com',
        website: 'www.mumbaicricketcommunity.com',
        logo_url: '',
        banner_image_url: '',
        gallery_images: '',
        is_public: true,
        is_private: false,
        requires_approval: false,
        allow_messages: true,
        show_contact: true,
        max_members: 1000,
        current_members: 250,
        membership_fee: 0,
        membership_duration: 'Lifetime',
        rules: 'Be respectful, No spam, Stay on topic',
        guidelines: 'Share cricket content, Participate in discussions',
        code_of_conduct: 'Treat everyone with respect and kindness',
        activities: 'Weekly matches, Training sessions, Tournaments',
        regular_meetings: 'Every Sunday at 6 PM',
        instagram_handle: '@mumbaicricketcommunity',
        facebook_handle: 'MumbaiCricketCommunity',
        twitter_handle: '@mumbaicricketcommunity',
        discord_handle: 'MumbaiCricketCommunity',
        whatsapp_group: 'Mumbai Cricket Community',
        total_posts: 150,
        total_events: 25,
        achievements: 'Organized 10 successful tournaments',
        testimonials: 'Great community with amazing people',
        auto_approve_posts: true,
        allow_member_posts: true,
        allow_guest_posts: false,
        content_moderation: true
      });

      setMembers([
        {
          id: 1,
          community_profile_id: 1,
          user_id: 1,
          joined_date: '2020-01-15',
          role: 'Admin',
          is_active: true,
          is_approved: true
        },
        {
          id: 2,
          community_profile_id: 1,
          user_id: 2,
          joined_date: '2020-02-01',
          role: 'Member',
          is_active: true,
          is_approved: true
        }
      ]);

      setEvents([
        {
          id: 1,
          community_profile_id: 1,
          event_name: 'Weekly Cricket Match',
          description: 'Regular weekly cricket match for community members',
          event_date: '2024-01-21',
          event_time: '18:00:00',
          location: 'Shivaji Park, Mumbai',
          max_participants: 22,
          registration_fee: 0,
          registration_deadline: '2024-01-20',
          is_public: true,
          status: 'active'
        }
      ]);

      setPosts([
        {
          id: 1,
          community_profile_id: 1,
          user_id: 1,
          title: 'Welcome to Mumbai Cricket Community!',
          content: 'Welcome all cricket lovers to our amazing community!',
          post_type: 'announcement',
          is_pinned: true,
          is_approved: true,
          likes_count: 25,
          comments_count: 5
        }
      ]);
    } catch (error) {
      console.error('Error loading community profile:', error);
      showError('Error', 'Failed to load community profile');
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
      // await apiService.updateCommunityProfile(editingField, editValue);
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
          <h1 className="text-2xl font-bold text-gray-900">Community Profile</h1>
          <p className="text-gray-600">Manage your community information and members</p>
        </div>
      </div>

      {/* Community Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-indigo-600" />
            Community Information
          </h2>
          <div className="flex items-center space-x-2">
            {communityProfile?.is_public && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Public</span>
            )}
            {communityProfile?.is_private && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Private</span>
            )}
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Community Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Community Name</label>
            {editingField === 'community_name' ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <p className="text-gray-900">{communityProfile?.community_name || 'Not provided'}</p>
                <button
                  onClick={() => startEditing('community_name', communityProfile?.community_name || '')}
                  className="opacity-0 hover:opacity-100 text-gray-500 hover:text-gray-700"
                  title="Edit community name"
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <p className="text-gray-900">{communityProfile?.tagline || 'Not provided'}</p>
                <button
                  onClick={() => startEditing('tagline', communityProfile?.tagline || '')}
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <p className="text-gray-900">{communityProfile?.contact_person || 'Not provided'}</p>
                <button
                  onClick={() => startEditing('contact_person', communityProfile?.contact_person || '')}
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
              {communityProfile?.contact_number || 'Not provided'}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <p className="text-gray-900">{communityProfile?.email || 'Not provided'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Website</label>
            <a href={communityProfile?.website} className="text-blue-600 hover:underline">
              {communityProfile?.website || 'Not provided'}
            </a>
          </div>

          {/* Location */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
            <p className="text-gray-900 flex items-start">
              <MapPin className="w-4 h-4 mr-1 mt-0.5" />
              {communityProfile?.location || 'Not provided'}
            </p>
          </div>

          {/* Community Details */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Community Type</label>
            <p className="text-gray-900">{communityProfile?.community_type || 'Not provided'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Level</label>
            <p className="text-gray-900">{communityProfile?.level || 'Not provided'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Established Date</label>
            <p className="text-gray-900">{communityProfile?.established_date || 'Not provided'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Membership Fee</label>
            <p className="text-gray-900">₹{communityProfile?.membership_fee || 0} ({communityProfile?.membership_duration || 'Not specified'})</p>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
          <p className="text-gray-900">{communityProfile?.description || 'No description provided'}</p>
        </div>

        {/* Bio */}
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Bio</label>
          <p className="text-gray-900">{communityProfile?.bio || 'No bio provided'}</p>
        </div>

        {/* Activities */}
        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Activities</label>
          <p className="text-gray-900">{communityProfile?.activities || 'No activities listed'}</p>
        </div>

        {/* Regular Meetings */}
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Regular Meetings</label>
          <p className="text-gray-900">{communityProfile?.regular_meetings || 'Not specified'}</p>
        </div>

        {/* Rules and Guidelines */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Community Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Rules</label>
              <p className="text-sm text-gray-900">{communityProfile?.rules || 'No rules specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Guidelines</label>
              <p className="text-sm text-gray-900">{communityProfile?.guidelines || 'No guidelines specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Code of Conduct</label>
              <p className="text-sm text-gray-900">{communityProfile?.code_of_conduct || 'No code of conduct specified'}</p>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Social Media</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {communityProfile?.instagram_handle && (
              <div className="flex items-center space-x-2">
                <span className="text-pink-600">📷</span>
                <span className="text-sm text-gray-900">{communityProfile.instagram_handle}</span>
              </div>
            )}
            {communityProfile?.facebook_handle && (
              <div className="flex items-center space-x-2">
                <span className="text-blue-600">📘</span>
                <span className="text-sm text-gray-900">{communityProfile.facebook_handle}</span>
              </div>
            )}
            {communityProfile?.twitter_handle && (
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">🐦</span>
                <span className="text-sm text-gray-900">{communityProfile.twitter_handle}</span>
              </div>
            )}
            {communityProfile?.discord_handle && (
              <div className="flex items-center space-x-2">
                <span className="text-indigo-600">💬</span>
                <span className="text-sm text-gray-900">{communityProfile.discord_handle}</span>
              </div>
            )}
            {communityProfile?.whatsapp_group && (
              <div className="flex items-center space-x-2">
                <span className="text-green-600">📱</span>
                <span className="text-sm text-gray-900">{communityProfile.whatsapp_group}</span>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{communityProfile?.current_members || 0}</div>
            <div className="text-sm text-gray-600">Current Members</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{communityProfile?.total_posts || 0}</div>
            <div className="text-sm text-gray-600">Total Posts</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{communityProfile?.total_events || 0}</div>
            <div className="text-sm text-gray-600">Total Events</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{communityProfile?.max_members || 0}</div>
            <div className="text-sm text-gray-600">Max Members</div>
          </div>
        </div>

        {/* Achievements */}
        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Achievements</label>
          <p className="text-gray-900">{communityProfile?.achievements || 'No achievements listed'}</p>
        </div>

        {/* Testimonials */}
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Testimonials</label>
          <p className="text-gray-900">{communityProfile?.testimonials || 'No testimonials available'}</p>
        </div>
      </div>

      {/* Members */}
      {members.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Community Members
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => (
              <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Member #{member.user_id}</h3>
                    <p className="text-sm text-blue-600">{member.role}</p>
                    <p className="text-sm text-gray-600">Joined: {member.joined_date}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {member.is_active && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                    )}
                    {member.is_approved && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Approved</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events */}
      {events.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <Calendar className="w-5 h-5 mr-2 text-green-600" />
            Upcoming Events
          </h2>
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{event.event_name}</h3>
                    <p className="text-sm text-gray-600">{event.description}</p>
                    <p className="text-sm text-gray-600">{event.event_date} at {event.event_time}</p>
                    <p className="text-sm text-gray-600">Location: {event.location}</p>
                    <p className="text-sm text-gray-600">Max Participants: {event.max_participants}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      event.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {event.status}
                    </span>
                    <p className="text-sm font-medium text-gray-900 mt-1">₹{event.registration_fee}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Posts */}
      {posts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <MessageCircle className="w-5 h-5 mr-2 text-purple-600" />
            Recent Posts
          </h2>
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{post.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{post.content}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-500">Type: {post.post_type}</span>
                      <span className="text-sm text-gray-500">Likes: {post.likes_count}</span>
                      <span className="text-sm text-gray-500">Comments: {post.comments_count}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {post.is_pinned && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pinned</span>
                    )}
                    {post.is_approved && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Approved</span>
                    )}
                  </div>
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
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Edit Community
        </button>
      </div>
    </div>
  );
}
