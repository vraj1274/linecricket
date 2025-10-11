import React, { useState, useEffect } from 'react';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { Loader2, Shield, User, Edit3, Calendar, MapPin, Mail, Phone, Trophy, Target, Zap, X, Save, Camera } from 'lucide-react';

interface MyProfilePageProps {
  onBack: () => void;
}

interface Post {
  id: number;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  salary: string;
  created_at: string;
}

interface JobApplication {
  id: number;
  job_title: string;
  status: string;
  applied_at: string;
}

interface Member {
  id: number;
  name: string;
  role: string;
  joined_at: string;
}

interface ProfileStats {
  posts_count: number;
  jobs_posted_count: number;
  applications_count: number;
  followers_count: number;
  following_count: number;
}

export function MyProfilePage({ onBack }: MyProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'jobs' | 'members' | 'created-pages' | 'about'>('posts');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showManagePosts, setShowManagePosts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Edit profile form states
  const [showEditForm, setShowEditForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    bio: '',
    location: '',
    contact_number: '',
    email: '',
    age: '',
    gender: '',
    batting_skill: 0,
    bowling_skill: 0,
    fielding_skill: 0,
    total_runs: 0,
    total_wickets: 0,
    total_matches: 0,
    batting_average: 0,
    highest_score: 0,
    centuries: 0,
    half_centuries: 0,
    bowling_average: 0,
    best_bowling_figures: '',
    catches: 0,
    stumpings: 0,
    run_outs: 0
  });
  
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
      console.log('🔄 Loading profile data from database...');
      
      // Get Firebase token
      const firebaseToken = localStorage.getItem('firebaseToken');
      if (!firebaseToken) {
        throw new Error('No Firebase token found');
      }
      
      // Fetch profile data from the correct API endpoint
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Profile data loaded from database:', data);
        
        // Extract user and profile data
        const userData = data.user || data;
        const profileData = userData.profile || {};
        const statsData = profileData.stats || {};
        
        // Set comprehensive profile data
        setProfileData({
          id: userData.id,
          username: userData.username,
          email: userData.email,
          full_name: profileData.full_name || userData.username,
          bio: profileData.bio || '',
          location: profileData.location || '',
          contact_number: profileData.contact_number || '',
          age: profileData.age || '',
          gender: profileData.gender || '',
          profile_image_url: profileData.profile_image_url || '',
          is_verified: userData.is_verified || false,
          
          // Cricket skills
          batting_skill: profileData.batting_skill || 0,
          bowling_skill: profileData.bowling_skill || 0,
          fielding_skill: profileData.fielding_skill || 0,
          
          // Cricket statistics
          total_runs: statsData.total_runs || 0,
          total_wickets: statsData.total_wickets || 0,
          total_matches: statsData.total_matches || 0,
          batting_average: statsData.batting_average || 0,
          highest_score: statsData.highest_score || 0,
          centuries: statsData.centuries || 0,
          half_centuries: statsData.half_centuries || 0,
          bowling_average: statsData.bowling_average || 0,
          best_bowling_figures: statsData.best_bowling_figures || '',
          catches: statsData.catches || 0,
          stumpings: statsData.stumpings || 0,
          run_outs: statsData.run_outs || 0,
          
          // Social stats
          posts_count: data.posts_count || 0,
          jobs_posted_count: data.jobs_posted_count || 0,
          applications_count: data.applications_count || 0,
          followers_count: data.followers_count || 0,
          following_count: data.following_count || 0
        });
        
        // Set stats for display
        setStats({
          posts_count: data.posts_count || 0,
          jobs_posted_count: data.jobs_posted_count || 0,
          applications_count: data.applications_count || 0,
          followers_count: data.followers_count || 0,
          following_count: data.following_count || 0
        });
        
        // Set posts, jobs, applications
        setPosts(data.recent_posts || []);
        setJobs(data.recent_jobs || []);
        setApplications(data.recent_applications || []);
        
      } else {
        console.error('❌ API call failed:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        
        // Try fallback with userProfile from context
        console.log('🔄 Trying fallback with userProfile from context...');
        if (userProfile) {
          console.log('✅ Using userProfile from context as fallback');
          setProfileData({
            id: userProfile.id,
            username: firebaseUser?.displayName || 'User',
            full_name: userProfile.profile?.full_name || firebaseUser?.displayName || 'User',
            bio: userProfile.profile?.bio || 'No bio available',
            location: userProfile.profile?.location || 'Location not set',
            profile_image_url: userProfile.profile?.profile_image_url || '',
            is_verified: false,
            batting_skill: 0,
            bowling_skill: 0,
            fielding_skill: 0,
            total_runs: 0,
            total_wickets: 0,
            total_matches: 0,
            batting_average: 0,
            highest_score: 0,
            centuries: 0,
            half_centuries: 0,
            bowling_average: 0,
            best_bowling_figures: '',
            catches: 0,
            stumpings: 0,
            run_outs: 0,
            posts_count: 0,
            jobs_posted_count: 0,
            applications_count: 0,
            followers_count: 0,
            following_count: 0
          });
          
          setStats({
            posts_count: 0,
            jobs_posted_count: 0,
            applications_count: 0,
            followers_count: 0,
            following_count: 0
          });
        } else {
          setError(errorData.error || `API call failed: ${response.status}`);
        }
      }
      
      // Load created pages
      await loadCreatedPages();
    } catch (err) {
      console.error('❌ Error loading profile data:', err);
      
      // Try fallback with userProfile from context
      console.log('🔄 Trying fallback with userProfile from context in catch block...');
      if (userProfile) {
        console.log('✅ Using userProfile from context as fallback in catch block');
        setProfileData({
          id: userProfile.id,
          username: firebaseUser?.displayName || 'User',
          full_name: userProfile.profile?.full_name || firebaseUser?.displayName || 'User',
          bio: userProfile.profile?.bio || 'No bio available',
          location: userProfile.profile?.location || 'Location not set',
          profile_image_url: userProfile.profile?.profile_image_url || '',
          is_verified: false,
          batting_skill: 0,
          bowling_skill: 0,
          fielding_skill: 0,
          total_runs: 0,
          total_wickets: 0,
          total_matches: 0,
          batting_average: 0,
          highest_score: 0,
          centuries: 0,
          half_centuries: 0,
          bowling_average: 0,
          best_bowling_figures: '',
          catches: 0,
          stumpings: 0,
          run_outs: 0,
          posts_count: 0,
          jobs_posted_count: 0,
          applications_count: 0,
          followers_count: 0,
          following_count: 0
        });
        
        setStats({
          posts_count: 0,
          jobs_posted_count: 0,
          applications_count: 0,
          followers_count: 0,
          following_count: 0
        });
      } else {
        setError('Failed to load profile data. Please check your connection and try again.');
      }
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
      // Mock implementation - replace with actual API call
      const newPost: Post = {
        id: Date.now(),
        content: data.content,
        created_at: new Date().toISOString(),
        likes_count: 0,
        comments_count: 0
      };
      setPosts(prev => [newPost, ...prev]);
      setShowCreatePost(false);
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
      // Mock implementation - replace with actual API call
      const newJob: Job = {
        id: Date.now(),
        title: data.title,
        description: data.description,
        location: data.location,
        salary: data.salary,
        created_at: new Date().toISOString()
      };
      setJobs(prev => [newJob, ...prev]);
      setShowCreateJob(false);
    } catch (err) {
      setError('Failed to create job');
      console.error('Error creating job:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err) {
      setError('Failed to delete post');
      console.error('Error deleting post:', err);
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    try {
      setJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (err) {
      setError('Failed to delete job');
      console.error('Error deleting job:', err);
    }
  };

  // Edit profile functions
  const handleEditProfile = () => {
    setShowEditForm(true);
    setIsEditing(true);
    // Populate form with current data
    setEditFormData({
      full_name: user.name,
      bio: user.bio,
      location: user.location,
      contact_number: profileData?.contact_number || '',
      email: firebaseUser?.email || '',
      age: profileData?.age || '',
      gender: profileData?.gender || '',
      batting_skill: profileData?.batting_skill || 0,
      bowling_skill: profileData?.bowling_skill || 0,
      fielding_skill: profileData?.fielding_skill || 0,
      total_runs: profileData?.total_runs || 0,
      total_wickets: profileData?.total_wickets || 0,
      total_matches: profileData?.total_matches || 0,
      batting_average: profileData?.batting_average || 0,
      highest_score: profileData?.highest_score || 0,
      centuries: profileData?.centuries || 0,
      half_centuries: profileData?.half_centuries || 0,
      bowling_average: profileData?.bowling_average || 0,
      best_bowling_figures: profileData?.best_bowling_figures || '',
      catches: profileData?.catches || 0,
      stumpings: profileData?.stumpings || 0,
      run_outs: profileData?.run_outs || 0
    });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      console.log('💾 Saving profile data to database:', editFormData);
      
      // Get Firebase token
      const firebaseToken = localStorage.getItem('firebaseToken');
      if (!firebaseToken) {
        throw new Error('No Firebase token found');
      }
      
      // Prepare data for API call
      const updateData = {
        // Basic profile info
        full_name: editFormData.full_name,
        bio: editFormData.bio,
        location: editFormData.location,
        contact_number: editFormData.contact_number,
        age: editFormData.age,
        gender: editFormData.gender,
        
        // Cricket skills
        batting_skill: editFormData.batting_skill,
        bowling_skill: editFormData.bowling_skill,
        fielding_skill: editFormData.fielding_skill,
        
        // Cricket statistics
        total_runs: editFormData.total_runs,
        total_wickets: editFormData.total_wickets,
        total_matches: editFormData.total_matches,
        batting_average: editFormData.batting_average,
        highest_score: editFormData.highest_score,
        centuries: editFormData.centuries,
        half_centuries: editFormData.half_centuries,
        bowling_average: editFormData.bowling_average,
        best_bowling_figures: editFormData.best_bowling_figures,
        catches: editFormData.catches,
        stumpings: editFormData.stumpings,
        run_outs: editFormData.run_outs
      };
      
      // Make API call to update profile
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Profile updated successfully in database:', result);
        
        // Update local state with new data
        const updatedProfileData = {
          ...profileData,
          ...editFormData
        };
        
        setProfileData(updatedProfileData);
        
        // Close form
        setShowEditForm(false);
        setIsEditing(false);
        
        // Show success message
        alert('Profile updated successfully!');
        
        // Reload profile data to ensure consistency
        await loadProfileData();
        
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to update profile:', errorData);
        setError(errorData.error || 'Failed to update profile');
        alert('Failed to update profile. Please try again.');
      }
      
    } catch (err) {
      console.error('❌ Error saving profile:', err);
      setError('Failed to save profile');
      alert('Failed to save profile. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setIsEditing(false);
    setEditFormData({
      full_name: '',
      bio: '',
      location: '',
      contact_number: '',
      email: '',
      age: '',
      gender: '',
      batting_skill: 0,
      bowling_skill: 0,
      fielding_skill: 0,
      total_runs: 0,
      total_wickets: 0,
      total_matches: 0,
      batting_average: 0,
      highest_score: 0,
      centuries: 0,
      half_centuries: 0,
      bowling_average: 0,
      best_bowling_figures: '',
      catches: 0,
      stumpings: 0,
      run_outs: 0
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const user = profileData ? {
    name: profileData.full_name || profileData.profile?.full_name || firebaseUser?.displayName || 'User',
    username: profileData.username || profileData.user?.username || firebaseUser?.email?.split('@')[0] || 'user',
    bio: profileData.bio || profileData.profile?.bio || 'Cricket enthusiast and coach',
    location: profileData.location || profileData.profile?.location || 'Mumbai, India',
    avatar: (profileData.full_name || profileData.profile?.full_name || firebaseUser?.displayName || 'User')
            .split(' ').map((n: string) => n[0]).join('').toUpperCase(),
    followers: profileData.followers_count || profileData.stats?.followers_count || 0,
    following: profileData.following_count || profileData.stats?.following_count || 0,
    posts: profileData.posts_count || profileData.stats?.posts_count || posts.length,
    verified: profileData.is_verified || profileData.user?.is_verified || false
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
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
    <div className="min-h-screen bg-white">
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
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.avatar}
            </div>
            {user.verified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h1>
          <p className="text-gray-600 mb-4">@{user.username}</p>
          
          {/* Statistics Bar */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-6">
            <div className="text-center min-w-[80px]">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{user.posts}</div>
              <div className="text-xs sm:text-sm text-gray-600">Posts</div>
            </div>
            <div className="text-center min-w-[80px]">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{user.followers}</div>
              <div className="text-xs sm:text-sm text-gray-600">Connections</div>
            </div>
            <div className="text-center min-w-[80px]">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">0</div>
              <div className="text-xs sm:text-sm text-gray-600">Matches</div>
            </div>
            <div className="text-center min-w-[80px]">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">0</div>
              <div className="text-xs sm:text-sm text-gray-600">Runs</div>
            </div>
          </div>
          
          <button 
            onClick={handleEditProfile}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Personal Information Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>View</span>
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mb-4">Private details visible only to you</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Full Name:</p>
              <p className="text-gray-900">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Contact:</p>
              <p className="text-gray-900">Not provided</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location:</p>
              <p className="text-gray-900">{user.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email:</p>
              <p className="text-gray-900">{firebaseUser?.email || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Posts {posts.length}</h2>
            <div className="flex space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Cricket Statistics */}
        <div className="space-y-6">
          {/* Batting Statistics */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Cricket Statistics</h2>
            <h3 className="text-md font-bold text-blue-600 mb-4">BATTING</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm sm:text-base">Total Runs</span>
                  <span className="font-bold text-blue-600">{profileData?.total_runs || 0}</span>
                </div>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm sm:text-base">Matches</span>
                  <span className="font-bold text-blue-600">{profileData?.total_matches || 0}</span>
                </div>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm sm:text-base">100s</span>
                  <span className="font-bold text-blue-600">{profileData?.centuries || 0}</span>
                </div>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm sm:text-base">50s</span>
                  <span className="font-bold text-blue-600">{profileData?.half_centuries || 0}</span>
                </div>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm sm:text-base">Average</span>
                  <span className="font-bold text-blue-600">{profileData?.batting_average || 0}</span>
                </div>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm sm:text-base">Highest</span>
                  <span className="font-bold text-blue-600">{profileData?.highest_score || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bowling Statistics */}
          <div>
            <h3 className="text-md font-bold text-blue-600 mb-4">BOWLING</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm sm:text-base">Matches</span>
                  <span className="font-bold text-blue-600">{profileData?.total_matches || 0}</span>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm sm:text-base">Wickets</span>
                  <span className="font-bold text-blue-600">{profileData?.total_wickets || 0}</span>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm sm:text-base">Best</span>
                  <span className="font-bold text-blue-600">{profileData?.best_bowling_figures || '0/0'}</span>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm sm:text-base">Average</span>
                  <span className="font-bold text-blue-600">{profileData?.bowling_average || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fielding Statistics */}
          <div>
            <h3 className="text-md font-bold text-green-600 mb-4">FIELDING</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm sm:text-base">Matches</span>
                  <span className="font-bold text-green-600">{profileData?.total_matches || 0}</span>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm sm:text-base">Catches</span>
                  <span className="font-bold text-green-600">{profileData?.catches || 0}</span>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm sm:text-base">Stumpings</span>
                  <span className="font-bold text-green-600">{profileData?.stumpings || 0}</span>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm sm:text-base">Run Outs</span>
                  <span className="font-bold text-green-600">{profileData?.run_outs || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Format Performance */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Format Performance</h3>
            
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900">Test Cricket</h4>
                    <p className="text-sm text-gray-600">0 runs • 0 wickets</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">0 matches</p>
                    <p className="text-sm text-gray-600">Avg: 0</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900">ODI Cricket</h4>
                    <p className="text-sm text-gray-600">0 runs • 0 wickets</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">0 matches</p>
                    <p className="text-sm text-gray-600">Avg: 0</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900">T20 Cricket</h4>
                    <p className="text-sm text-gray-600">0 runs • 0 wickets</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">0 matches</p>
                    <p className="text-sm text-gray-600">Avg: 0</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Rating */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Skills Rating</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 text-sm sm:text-base">Batting</span>
                <span className="font-bold text-gray-900">{profileData?.batting_skill || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${profileData?.batting_skill || 0}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-700 text-sm sm:text-base">Bowling</span>
                <span className="font-bold text-gray-900">{profileData?.bowling_skill || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${profileData?.bowling_skill || 0}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-700 text-sm sm:text-base">Fielding</span>
                <span className="font-bold text-gray-900">{profileData?.fielding_skill || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${profileData?.fielding_skill || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          © 2024 thelinecricket
        </div>
      </div>

      {/* Edit Profile Form Popup Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="space-y-4">
                {/* Personal Information */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Personal Information</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editFormData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={editFormData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Contact Number</label>
                      <input
                        type="tel"
                        value={editFormData.contact_number}
                        onChange={(e) => handleInputChange('contact_number', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Age</label>
                        <input
                          type="number"
                          value={editFormData.age}
                          onChange={(e) => handleInputChange('age', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                        <select
                          value={editFormData.gender}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Bio</label>
                      <textarea
                        value={editFormData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={2}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                </div>

                {/* Cricket Statistics */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Cricket Statistics</h3>
                  
                  {/* Batting Stats */}
                  <div className="mb-3">
                    <h4 className="text-xs font-semibold text-blue-600 mb-2">Batting</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Total Runs</label>
                        <input
                          type="number"
                          value={editFormData.total_runs}
                          onChange={(e) => handleInputChange('total_runs', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Matches</label>
                        <input
                          type="number"
                          value={editFormData.total_matches}
                          onChange={(e) => handleInputChange('total_matches', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">100s</label>
                        <input
                          type="number"
                          value={editFormData.centuries}
                          onChange={(e) => handleInputChange('centuries', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">50s</label>
                        <input
                          type="number"
                          value={editFormData.half_centuries}
                          onChange={(e) => handleInputChange('half_centuries', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Average</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editFormData.batting_average}
                          onChange={(e) => handleInputChange('batting_average', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Highest Score</label>
                        <input
                          type="number"
                          value={editFormData.highest_score}
                          onChange={(e) => handleInputChange('highest_score', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bowling Stats */}
                  <div className="mb-3">
                    <h4 className="text-xs font-semibold text-blue-600 mb-2">Bowling</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Wickets</label>
                        <input
                          type="number"
                          value={editFormData.total_wickets}
                          onChange={(e) => handleInputChange('total_wickets', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Best Figures</label>
                        <input
                          type="text"
                          value={editFormData.best_bowling_figures}
                          onChange={(e) => handleInputChange('best_bowling_figures', e.target.value)}
                          placeholder="e.g., 5/20"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Bowling Average</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editFormData.bowling_average}
                          onChange={(e) => handleInputChange('bowling_average', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fielding Stats */}
                  <div className="mb-3">
                    <h4 className="text-xs font-semibold text-green-600 mb-2">Fielding</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Catches</label>
                        <input
                          type="number"
                          value={editFormData.catches}
                          onChange={(e) => handleInputChange('catches', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Stumpings</label>
                        <input
                          type="number"
                          value={editFormData.stumpings}
                          onChange={(e) => handleInputChange('stumpings', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Run Outs</label>
                        <input
                          type="number"
                          value={editFormData.run_outs}
                          onChange={(e) => handleInputChange('run_outs', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skills Rating */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 mb-2">Skills Rating</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Batting Skill</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={editFormData.batting_skill}
                          onChange={(e) => handleInputChange('batting_skill', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-center text-xs text-gray-600">{editFormData.batting_skill}%</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Bowling Skill</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={editFormData.bowling_skill}
                          onChange={(e) => handleInputChange('bowling_skill', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-center text-xs text-gray-600">{editFormData.bowling_skill}%</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Fielding Skill</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={editFormData.fielding_skill}
                          onChange={(e) => handleInputChange('fielding_skill', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-center text-xs text-gray-600">{editFormData.fielding_skill}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Save className="w-3 h-3" />
                    )}
                    <span>{loading ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}