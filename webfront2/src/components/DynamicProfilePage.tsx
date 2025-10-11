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
import { useProfileSwitch } from '../contexts/ProfileSwitchContext';
import { profilePageService, Post, Job, JobApplication, ProfileStats } from '../services/profilePageService';
import { API_BASE_URL } from '../config/api';
import { MediaDisplay } from './MediaDisplay';

interface DynamicProfilePageProps {
  onBack: () => void;
  profileId?: number;
}

interface Member {
  id: string;
  name: string;
  role: string;
  avatar: string;
  joinedAt: string;
  status: 'active' | 'pending' | 'inactive';
}

export function DynamicProfilePage({ onBack, profileId }: DynamicProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'jobs' | 'members' | 'about'>('posts');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showManagePosts, setShowManagePosts] = useState(false);
  const [showEditPost, setShowEditPost] = useState(false);
  const [showEditJob, setShowEditJob] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  
  const { currentProfile } = useProfileSwitch();

  // State for data from backend
  const [posts, setPosts] = useState<Post[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [profileData, setProfileData] = useState<any>(null);

  // Load profile data on component mount and when profile changes
  useEffect(() => {
    if (currentProfile) {
      loadProfileData();
    }
  }, [currentProfile?.id, currentProfile?.type]);

  const loadProfileData = async () => {
      setLoading(true);
      setError(null);

      try {
      // For dynamic profiles, we'll use the current profile data
      if (currentProfile) {
        setProfileData(currentProfile);
        
        // Load profile-specific data from backend
        await Promise.all([
          loadProfilePosts(),
          loadProfileJobs(),
          loadProfileMembers()
        ]);
      } else {
        setError('No profile selected');
      }
      } catch (err) {
        setError('Failed to load profile data');
      console.error('Error loading profile data:', err);
      } finally {
        setLoading(false);
      }
    };

  const loadProfilePosts = async () => {
    try {
      const profileId = currentProfile?.id;
      if (!profileId) return;
      
      const response = await fetch(`${API_BASE_URL}/api/profiles/${profileId}/posts`);
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error('Error loading profile posts:', err);
    }
  };

  const loadProfileJobs = async () => {
    try {
      const profileId = currentProfile?.id;
      if (!profileId) return;
      
      const response = await fetch(`${API_BASE_URL}/api/profiles/${profileId}/jobs`);
      const data = await response.json();
      if (data.success) {
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error('Error loading profile jobs:', err);
    }
  };

  const loadProfileMembers = async () => {
    try {
      const profileId = currentProfile?.id;
      if (!profileId) return;
      
      const response = await fetch(`${API_BASE_URL}/api/profiles/${profileId}/members`);
      const data = await response.json();
      if (data.success) {
        setMembers(data.members || []);
      }
    } catch (err) {
      console.error('Error loading profile members:', err);
    }
  };

  const handleCreatePost = async (data: any) => {
    setLoading(true);
    try {
      const profileId = currentProfile?.id;
      if (!profileId) {
        setError('No profile selected');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/profiles/${profileId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      if (result.success && result.post) {
        setPosts(prev => [result.post, ...prev]);
        setShowCreatePost(false);
      } else {
        setError(result.error || 'Failed to create post');
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
      const profileId = currentProfile?.id;
      if (!profileId) {
        setError('No profile selected');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/profiles/${profileId}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      if (result.success && result.job) {
        setJobs(prev => [result.job, ...prev]);
        setShowCreateJob(false);
      } else {
        setError(result.error || 'Failed to create job');
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
      const response = await fetch(`${API_BASE_URL}/api/profile-page/posts/${postId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      if (result.success) {
        setPosts(prev => prev.filter(post => post.id !== postId));
      } else {
        setError(result.error || 'Failed to delete post');
      }
    } catch (err) {
      setError('Failed to delete post');
      console.error('Error deleting post:', err);
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile-page/jobs/${jobId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      if (result.success) {
        setJobs(prev => prev.filter(job => job.id !== jobId));
      } else {
        setError(result.error || 'Failed to delete job');
      }
    } catch (err) {
      setError('Failed to delete job');
      console.error('Error deleting job:', err);
    }
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setShowEditPost(true);
  };

  const handleEditJob = (job: any) => {
    setEditingJob(job);
    setShowEditJob(true);
  };

  const handleUpdatePost = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile-page/posts/${editingPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      if (result.success) {
        setPosts(prev => prev.map(post => 
          post.id === editingPost.id ? { ...post, ...data } : post
        ));
        setShowEditPost(false);
        setEditingPost(null);
      } else {
        setError(result.error || 'Failed to update post');
      }
    } catch (err) {
      setError('Failed to update post');
      console.error('Error updating post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateJob = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile-page/jobs/${editingJob.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      if (result.success) {
        setJobs(prev => prev.map(job => 
          job.id === editingJob.id ? { ...job, ...data } : job
        ));
        setShowEditJob(false);
        setEditingJob(null);
      } else {
        setError(result.error || 'Failed to update job');
      }
    } catch (err) {
      setError('Failed to update job');
      console.error('Error updating job:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSharePost = async (postId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile-page/posts/${postId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      if (result.success) {
        // Update the shares count in the UI
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, shares_count: (post.shares_count || 0) + 1 }
            : post
        ));
      } else {
        setError(result.error || 'Failed to share post');
      }
    } catch (err) {
      setError('Failed to share post');
      console.error('Error sharing post:', err);
    }
  };

  const handleAddMember = async (data: any) => {
    setLoading(true);
    try {
      const profileId = currentProfile?.id;
      if (!profileId) {
        setError('No profile selected');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/profiles/${profileId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      if (result.success) {
        setShowAddMember(false);
        // Reload members
        await loadProfileMembers();
      } else {
        setError(result.error || 'Failed to add member');
      }
    } catch (err) {
      setError('Failed to add member');
      console.error('Error adding member:', err);
    } finally {
      setLoading(false);
    }
  };


  const user = currentProfile ? {
    name: currentProfile.name || 'Profile',
    username: currentProfile.username || '@profile',
    bio: `Welcome to ${currentProfile.name || 'this profile'}!`,
    location: 'Location not specified',
    avatar: currentProfile.avatar || 'P',
    followers: 0,
    following: 0,
    posts: posts.length,
    verified: false
  } : {
    name: 'Profile',
    username: '@profile',
    bio: 'Welcome to this profile!',
    location: 'Location not specified',
    avatar: 'P',
    followers: 0,
    following: 0,
    posts: posts.length,
    verified: false
  };

  const tabs = [
    { id: 'posts' as const, label: 'Posts', count: posts.length },
    { id: 'jobs' as const, label: 'Jobs', count: jobs.length },
    { id: 'members' as const, label: 'Members', count: members.length },
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
            <h1 className="text-2xl font-bold text-gray-900">{currentProfile?.name || 'Profile'}</h1>
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
              style={{ background: currentProfile?.color || 'linear-gradient(to bottom right, #FF6B33, #2E4B5F)' }}
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
              <div className="font-semibold text-gray-900">Create Post</div>
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
              <div className="font-semibold text-gray-900">Create Job</div>
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
              <div className="font-semibold text-gray-900">Manage Posts</div>
              <div className="text-sm text-gray-600">Edit & delete</div>
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
              <div className="font-semibold text-gray-900">Add Member</div>
              <div className="text-sm text-gray-600">Invite people</div>
            </div>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
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

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'posts' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Posts</h3>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Post</span>
                  </button>
        </div>
                {posts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-8 h-8 text-gray-400" />
              </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                    <p className="text-gray-600 mb-4">Share your first post to get started!</p>
                    <button
                      onClick={() => setShowCreatePost(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Post
                    </button>
              </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">{user.avatar}</span>
              </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold text-gray-900">{user.name}</span>
                              <span className="text-gray-500">@{user.username}</span>
                              <span className="text-gray-500">•</span>
                              <span className="text-gray-500">{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
                            <p className="text-gray-900 mb-3">{post.content}</p>
                            {post.image_url && (
                              <div className="mb-3">
                                <MediaDisplay 
                                  imageUrl={post.image_url}
                                  maxHeight="max-h-80"
                                />
                              </div>
                            )}
                            <div className="flex items-center space-x-4 text-gray-500">
                              <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                                <Heart className="w-4 h-4" />
                                <span>{post.likes_count || 0}</span>
                              </button>
                              <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                                <MessageCircle className="w-4 h-4" />
                                <span>{post.comments_count || 0}</span>
              </button>
                              <button 
                                onClick={() => handleSharePost(post.id)}
                                className="flex items-center space-x-1 hover:text-green-500 transition-colors"
                              >
                                <Share2 className="w-4 h-4" />
                                <span>{post.shares_count || 0}</span>
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

            {activeTab === 'jobs' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Job Postings</h3>
                  <button
                    onClick={() => setShowCreateJob(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Job</span>
                  </button>
                </div>
                {jobs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No job postings yet</h3>
                    <p className="text-gray-600 mb-4">Create your first job posting to get started!</p>
                    <button
                      onClick={() => setShowCreateJob(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Job
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h4>
                            <p className="text-gray-600 mb-3">{job.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{job.location}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                                <span>{new Date(job.created_at).toLocaleDateString()}</span>
                              </span>
                              <span className="text-green-600 font-medium">{job.salary_range}</span>
                  </div>
                </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditJob(job)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteJob(job.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
              </div>
            </div>
          </div>
                    ))}
        </div>
                )}
              </div>
            )}

            {activeTab === 'members' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Member</span>
                  </button>
                </div>
                {members.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
              </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No members yet</h3>
                    <p className="text-gray-600 mb-4">Add team members to get started!</p>
                    <button
                      onClick={() => setShowAddMember(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Member
                    </button>
            </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.map((member) => (
                      <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-semibold">{member.avatar}</span>
          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{member.name}</h4>
                            <p className="text-sm text-gray-600">{member.role}</p>
              </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            member.status === 'active' ? 'bg-green-100 text-green-800' :
                            member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {member.status}
                          </span>
              </div>
                        <p className="text-sm text-gray-500">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
            </div>
                    ))}
          </div>
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About {user.name}</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Bio</h4>
                    <p className="text-gray-700">{user.bio}</p>
              </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Location</h4>
                    <p className="text-gray-700">{user.location}</p>
        </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Profile Type</h4>
                    <p className="text-gray-700 capitalize">{currentProfile?.type || 'Profile'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Created</h4>
                    <p className="text-gray-700">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>

      {/* Modals */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Post</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreatePost({
                content: formData.get('content'),
                image_url: formData.get('image_url')
              });
            }}>
            <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    name="content"
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What's happening?"
                    required
                  />
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (optional)</label>
                  <input
                    type="url"
                    name="image_url"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
              </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreatePost(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg transition-all duration-300 font-medium"
                >
                  Cancel
              </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-xl hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none font-bold text-lg border-2 border-blue-600 hover:border-blue-700"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Post'}
              </button>
            </div>
            </form>
          </div>
        </div>
      )}

      {showCreateJob && (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Job</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateJob({
                title: formData.get('title'),
                description: formData.get('description'),
                location: formData.get('location'),
                salary_range: formData.get('salary_range')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                  <input
                    type="text"
                    name="title"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Cricket Coach"
                    required
                  />
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Job description..."
                    required
                  />
                  </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Mumbai, India"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                  <input
                    type="text"
                    name="salary_range"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., ₹30,000 - ₹50,000"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateJob(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 hover:shadow-xl hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none font-bold text-lg border-2 border-green-600 hover:border-green-700"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Job'}
                </button>
            </div>
            </form>
          </div>
        </div>
      )}

      {showAddMember && (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Member</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddMember({
                email: formData.get('email'),
                role: formData.get('role')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="member@example.com"
                    required
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select 
                    name="role"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                  </select>
          </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 hover:shadow-xl hover:scale-110 transition-all duration-300 font-bold text-lg border-2 border-orange-600 hover:border-orange-700"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showManagePosts && (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Posts</h3>
            {posts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No posts to manage</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-900 mb-2">{post.content}</p>
                        <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
              </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditPost(post)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeletePost(post.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
            </div>
          </div>
        </div>
                ))}
              </div>
            )}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setShowManagePosts(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setShowManagePosts(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditPost && (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Post</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleUpdatePost({
                content: formData.get('content'),
                image_url: formData.get('image_url')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    name="content"
                    defaultValue={editingPost?.content || ''}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What's happening?"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (optional)</label>
                  <input
                    type="url"
                    name="image_url"
                    defaultValue={editingPost?.image_url || ''}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditPost(false);
                    setEditingPost(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Update Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditJob && (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Job</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleUpdateJob({
                title: formData.get('title'),
                description: formData.get('description'),
                location: formData.get('location'),
                salary_range: formData.get('salary_range')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingJob?.title || ''}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Cricket Coach"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingJob?.description || ''}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Job description..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={editingJob?.location || ''}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Mumbai, India"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                  <input
                    type="text"
                    name="salary_range"
                    defaultValue={editingJob?.salary_range || ''}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., ₹30,000 - ₹50,000"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditJob(false);
                    setEditingJob(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Update Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}