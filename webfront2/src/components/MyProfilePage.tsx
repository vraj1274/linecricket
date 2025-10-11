import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Briefcase, 
  Settings, 
  UserPlus, 
  Info, 
  Edit3, 
  Trash2, 
  Eye,
  Calendar,
  MapPin,
  Users,
  Award,
  MessageCircle,
  Share2,
  Heart,
  Bookmark,
  Loader2
} from 'lucide-react';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { profilePageService, Post, Job, JobApplication, ProfileStats } from '../services/profilePageService';

interface MyProfilePageProps {
  onBack: () => void;
}

interface Member {
  id: string;
  name: string;
  role: string;
  avatar: string;
  joinedAt: string;
  status: 'active' | 'pending' | 'inactive';
}

export function MyProfilePage({ onBack }: MyProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'jobs' | 'members' | 'created-pages' | 'about'>('posts');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showManagePosts, setShowManagePosts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { userProfile } = useUserProfile();
  const { user: firebaseUser } = useFirebase();

  // State for data from backend
  const [posts, setPosts] = useState<Post[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [members] = useState<Member[]>([]);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [createdPages, setCreatedPages] = useState<any[]>([]);

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await profilePageService.getMyProfile();
      if (response.success && response.profile) {
        setProfileData(response.profile);
        setPosts(response.profile.recent_posts || []);
        setJobs(response.profile.recent_jobs || []);
        setApplications(response.profile.recent_applications || []);
      } else {
        setError(response.error || 'Failed to load profile data');
      }
      
      // Load created pages
      await loadCreatedPages();
    } catch (err) {
      setError('Failed to load profile data');
      console.error('Error loading profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCreatedPages = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/profiles', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profiles) {
          // Filter only created pages (academy, venue, community)
          const pages = data.profiles.filter((profile: any) => 
            ['academy', 'venue', 'community'].includes(profile.type)
          );
          setCreatedPages(pages);
        }
      }
    } catch (err) {
      console.error('Error loading created pages:', err);
    }
  };

  const handleCreatePost = async (data: any) => {
    setLoading(true);
    try {
      const response = await profilePageService.createPost(data);
      if (response.success && response.post) {
        setPosts(prev => [response.post!, ...prev]);
        setShowCreatePost(false);
      } else {
        setError(response.error || 'Failed to create post');
      }
    } catch (err) {
      setError('Failed to create post');
      console.error('Error creating post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (data: any) => {
    setLoading(true);
    try {
      const response = await profilePageService.createJob(data);
      if (response.success && response.job) {
        setJobs(prev => [response.job!, ...prev]);
        setShowCreateJob(false);
      } else {
        setError(response.error || 'Failed to create job');
      }
    } catch (err) {
      setError('Failed to create job');
      console.error('Error creating job:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      const response = await profilePageService.deletePost(postId);
      if (response.success) {
        setPosts(prev => prev.filter(post => post.id !== postId));
      } else {
        setError(response.error || 'Failed to delete post');
      }
    } catch (err) {
      setError('Failed to delete post');
      console.error('Error deleting post:', err);
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    try {
      const response = await profilePageService.deleteJob(jobId);
      if (response.success) {
        setJobs(prev => prev.filter(job => job.id !== jobId));
      } else {
        setError(response.error || 'Failed to delete job');
      }
    } catch (err) {
      setError('Failed to delete job');
      console.error('Error deleting job:', err);
    }
  };

  const user = profileData ? {
    name: profileData.profile?.full_name || firebaseUser?.displayName || 'User',
    username: profileData.user?.username || firebaseUser?.email?.split('@')[0] || 'user',
    bio: profileData.profile?.bio || 'Cricket enthusiast and coach',
    location: profileData.profile?.location || 'Mumbai, India',
    avatar: profileData.profile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 
            firebaseUser?.displayName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U',
    followers: profileData.stats?.followers_count || 0,
    following: profileData.stats?.following_count || 0,
    posts: profileData.stats?.posts_count || posts.length,
    verified: profileData.user?.is_verified || false
  } : {
    name: firebaseUser?.displayName || 'User',
    username: firebaseUser?.email?.split('@')[0] || 'user',
    bio: 'Cricket enthusiast and coach',
    location: 'Mumbai, India',
    avatar: firebaseUser?.displayName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U',
    followers: 0,
    following: 0,
    posts: posts.length,
    verified: false
  };

  const tabs = [
    { id: 'posts' as const, label: 'Posts', count: posts.length },
    { id: 'jobs' as const, label: 'Jobs', count: jobs.length },
    { id: 'members' as const, label: 'Members', count: members.length },
    { id: 'created-pages' as const, label: 'Created Pages', count: createdPages.length },
    { id: 'about' as const, label: 'About', count: null }
  ];

  if (loading && !profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadProfileData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">My Pages</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start space-x-6">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
              style={{ background: 'linear-gradient(to bottom right, #FF6B33, #2E4B5F)' }}
            >
              {user.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                {user.verified && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-gray-600 mb-2">@{user.username}</p>
              <p className="text-gray-700 mb-4">{user.bio}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined Jan 2023</span>
                </div>
              </div>
              <div className="flex items-center space-x-6 mt-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{user.posts}</div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{user.followers}</div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{user.following}</div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Edit Profile
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Create Post</div>
              <div className="text-sm text-gray-600">Share updates</div>
            </div>
          </button>

          <button
            onClick={() => setShowCreateJob(true)}
            className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Create Job</div>
              <div className="text-sm text-gray-600">Post opportunities</div>
            </div>
          </button>

          <button
            onClick={() => setShowManagePosts(true)}
            className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Manage Posts</div>
              <div className="text-sm text-gray-600">Edit & organize</div>
            </div>
          </button>

          <button
            onClick={() => setShowAddMember(true)}
            className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Add Member</div>
              <div className="text-sm text-gray-600">Invite people</div>
            </div>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Posts Tab */}
            {activeTab === 'posts' && (
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                    <p className="text-gray-600 mb-4">Share your thoughts and experiences with the cricket community!</p>
                    <button
                      onClick={() => setShowCreatePost(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Your First Post
                    </button>
                  </div>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                          style={{ background: 'linear-gradient(to bottom right, #FF6B33, #2E4B5F)' }}
                        >
                          {user.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-gray-900">{user.name}</span>
                              <span className="text-gray-500">@{user.username}</span>
                              <span className="text-gray-500">·</span>
                              <span className="text-gray-500">
                                {new Date(post.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleDeletePost(post.id)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete post"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-900 mb-3">{post.content}</p>
                          {post.image_url && (
                            <div className="w-full h-48 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                              <img 
                                src={post.image_url} 
                                alt="Post image" 
                                className="max-w-full max-h-full object-cover rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div className="flex items-center space-x-6 text-gray-500">
                            <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                              <Heart className="w-4 h-4" />
                              <span>{post.likes_count}</span>
                            </button>
                            <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                              <MessageCircle className="w-4 h-4" />
                              <span>{post.comments_count}</span>
                            </button>
                            <button className="flex items-center space-x-1 hover:text-green-500 transition-colors">
                              <Share2 className="w-4 h-4" />
                              <span>{post.shares_count}</span>
                            </button>
                            <button className="hover:text-blue-500 transition-colors">
                              <Bookmark className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <div className="space-y-4">
                {jobs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <Briefcase className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                    <p className="text-gray-600 mb-4">Share job opportunities with the cricket community!</p>
                    <button
                      onClick={() => setShowCreateJob(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Post Your First Job
                    </button>
                  </div>
                ) : (
                  jobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center space-x-1">
                              <Briefcase className="w-4 h-4" />
                              <span>{job.company}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location}</span>
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {job.job_type}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-4">{job.description}</p>
                          {job.requirements && job.requirements.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                {job.requirements.map((req, index) => (
                                  <li key={index}>{req}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {job.salary_range && (
                            <p className="text-sm text-gray-600 mb-3">
                              <span className="font-medium">Salary:</span> {job.salary_range}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">{job.applications_count} applicants</span>
                            <span className="text-sm text-gray-500">
                              Posted {new Date(job.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete job"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                      style={{ background: 'linear-gradient(to bottom right, #FF6B33, #2E4B5F)' }}
                    >
                      {member.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          member.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : member.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {member.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{member.role}</p>
                      <p className="text-xs text-gray-500">Joined {member.joinedAt}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Created Pages Tab */}
            {activeTab === 'created-pages' && (
              <div className="space-y-4">
                {createdPages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pages created yet</h3>
                    <p className="text-gray-600 mb-4">Create your first academy, venue, or community page!</p>
                    <button
                      onClick={() => {/* Navigate to create page */}}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Your First Page
                    </button>
                  </div>
                ) : (
                  createdPages.map((page) => (
                    <div key={page.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
                          style={{ 
                            background: page.type === 'academy' ? 'linear-gradient(to bottom right, #3B82F6, #1D4ED8)' :
                                       page.type === 'venue' ? 'linear-gradient(to bottom right, #10B981, #059669)' :
                                       'linear-gradient(to bottom right, #F59E0B, #D97706)'
                          }}
                        >
                          {page.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{page.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              page.type === 'academy' ? 'bg-blue-100 text-blue-800' :
                              page.type === 'venue' ? 'bg-green-100 text-green-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {page.type.charAt(0).toUpperCase() + page.type.slice(1)} Page
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-500 mb-3">
                            <Calendar className="w-4 h-4" />
                            <span>Created {new Date(page.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {/* Navigate to view page */}}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View page"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {/* Navigate to edit page */}}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Edit page"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {/* Delete page */}}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete page"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">
                      Welcome to my cricket profile! I'm passionate about the sport and dedicated to helping 
                      players improve their skills. With years of experience in coaching and playing, I believe 
                      in the power of teamwork, discipline, and continuous learning.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Award className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Best Coach 2023</h4>
                          <p className="text-sm text-gray-600">Cricket Association Award</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Team Leadership</h4>
                          <p className="text-sm text-gray-600">Led 3 championship teams</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{user.location}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">Available for coaching sessions</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal
          isOpen={showCreatePost}
          onClose={() => setShowCreatePost(false)}
          onSubmit={handleCreatePost}
          loading={loading}
        />
      )}

      {showCreateJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">Create Job Posting</h3>
            <div className="space-y-4">
              <input 
                type="text" 
                className="w-full p-3 border border-gray-300 rounded-lg" 
                placeholder="Job Title"
              />
              <input 
                type="text" 
                className="w-full p-3 border border-gray-300 rounded-lg" 
                placeholder="Company"
              />
              <input 
                type="text" 
                className="w-full p-3 border border-gray-300 rounded-lg" 
                placeholder="Location"
              />
              <textarea 
                className="w-full p-3 border border-gray-300 rounded-lg" 
                rows={3} 
                placeholder="Job Description"
              />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button 
                onClick={() => setShowCreateJob(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowCreateJob(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Post Job
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Member</h3>
            <div className="space-y-4">
              <input 
                type="email" 
                className="w-full p-3 border border-gray-300 rounded-lg" 
                placeholder="Email address"
              />
              <input 
                type="text" 
                className="w-full p-3 border border-gray-300 rounded-lg" 
                placeholder="Role"
              />
              <textarea 
                className="w-full p-3 border border-gray-300 rounded-lg" 
                rows={2} 
                placeholder="Invitation message (optional)"
              />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button 
                onClick={() => setShowAddMember(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowAddMember(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {showManagePosts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h3 className="text-lg font-semibold mb-4">Manage Posts</h3>
            <div className="space-y-3">
              {posts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 truncate">{post.content}</p>
                    <p className="text-xs text-gray-500">{post.created_at}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => setShowManagePosts(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Create Post Modal Component
interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
}

function CreatePostModal({ isOpen, onClose, onSubmit, loading }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [location, setLocation] = useState('');
  const [postType, setPostType] = useState('text');
  const [visibility, setVisibility] = useState('public');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    onSubmit({
      content: content.trim(),
      image_url: imageUrl || undefined,
      location: location || undefined,
      post_type: postType,
      visibility
    });
    
    // Reset form
    setContent('');
    setImageUrl('');
    setLocation('');
    setPostType('text');
    setVisibility('public');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Create Post</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content *
              </label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg" 
                rows={4} 
                placeholder="What's on your mind?"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL (optional)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location (optional)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Mumbai, India"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Post Type
                </label>
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="public">Public</option>
                  <option value="friends">Friends</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={loading || !content.trim()}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Posting...' : 'Post'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
