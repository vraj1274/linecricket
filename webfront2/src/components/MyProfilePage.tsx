import React, { useState, useEffect } from 'react';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { Loader2, Shield, User, Edit3, Calendar, MapPin, Mail, Phone, Trophy, Target, Zap, X, Save, Camera, Upload } from 'lucide-react';
import { EditProfilePage } from './EditProfilePage';
import { AddAchievementModal } from './AddAchievementModal';
import { AddExperienceModal } from './AddExperienceModal';
import { EditCricketStatsModal } from './EditCricketStatsModal';
import { PersonalInfoModal } from './PersonalInfoModal';
import { ImageUploadModal } from './ImageUploadModal';

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
  
  // Edit profile page state
  const [showEditPage, setShowEditPage] = useState(false);
  const [postsViewMode, setPostsViewMode] = useState<'grid' | 'list'>('grid');
  
  // Achievements and Experience state
  const [achievements, setAchievements] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [showAddAchievement, setShowAddAchievement] = useState(false);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [showEditStats, setShowEditStats] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  
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
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
    loadUserPosts();
  }, []);

  // Load user-specific posts
  const loadUserPosts = async () => {
    try {
      setLoadingPosts(true);
      console.log('🔄 Loading user-specific posts...');
      
      // Get Firebase token
      const firebaseToken = localStorage.getItem('firebaseToken');
      if (!firebaseToken) {
        console.warn('No Firebase token found for posts');
        return;
      }
      
      // Get user ID from profile data or Firebase user
      const userId = profileData?.id || firebaseUser?.uid;
      if (!userId) {
        console.warn('No user ID found for posts');
        return;
      }
      
      // Fetch user-specific posts
      const response = await fetch(`http://localhost:5000/api/posts?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ User posts loaded:', data);
        
        if (data.success && data.posts) {
          setPosts(data.posts);
          setAllPosts(data.posts);
        }
      } else {
        console.error('❌ Failed to load user posts:', response.status);
      }
    } catch (error) {
      console.error('❌ Error loading user posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

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
        setAllPosts(data.recent_posts || []);
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
    setShowEditPage(true);
  };

  const handleBackFromEdit = () => {
    setShowEditPage(false);
    // Refresh profile data after editing
    loadProfileData();
  };

  // Handle view personal information
  const handleViewPersonalInfo = () => {
    setShowPersonalInfo(true);
  };


  // Handle posts view mode toggle
  const handlePostsViewToggle = (mode: 'grid' | 'list') => {
    setPostsViewMode(mode);
  };

  // Refresh posts
  const handleRefreshPosts = async () => {
    await loadUserPosts();
  };

  // Handle achievements
  const handleAddAchievement = (achievement: any) => {
    setAchievements(prev => [...prev, { ...achievement, id: Date.now() }]);
    setShowAddAchievement(false);
  };

  const handleEditAchievement = (id: number, achievement: any) => {
    setAchievements(prev => prev.map(a => a.id === id ? { ...a, ...achievement } : a));
  };

  const handleDeleteAchievement = (id: number) => {
    setAchievements(prev => prev.filter(a => a.id !== id));
  };

  // Handle experiences
  const handleAddExperience = (experience: any) => {
    setExperiences(prev => [...prev, { ...experience, id: Date.now() }]);
    setShowAddExperience(false);
  };

  const handleEditExperience = (id: number, experience: any) => {
    setExperiences(prev => prev.map(e => e.id === id ? { ...e, ...experience } : e));
  };

  const handleDeleteExperience = (id: number) => {
    setExperiences(prev => prev.filter(e => e.id !== id));
  };

  // Handle cricket stats edit
  const handleEditCricketStats = () => {
    setShowEditStats(true);
  };

  const handleSaveCricketStats = (stats: any) => {
    // Update profile data with new stats
    setProfileData((prev: any) => ({
      ...prev,
      ...stats
    }));
    setShowEditStats(false);
  };

  // Load more posts from database
  const loadMorePosts = async () => {
    setLoadingPosts(true);
    try {
      const firebaseToken = localStorage.getItem('firebaseToken');
      if (!firebaseToken) {
        throw new Error('No Firebase token found');
      }

      const response = await fetch('http://localhost:5000/api/posts/user-posts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAllPosts(data.posts || []);
        setShowAllPosts(true);
      } else {
        console.error('Failed to load posts:', response.status);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Handle profile image upload
  const handleImageUpload = (imageUrl: string) => {
    setProfileData((prev: any) => ({
      ...prev,
      profile_image_url: imageUrl
    }));
    setShowImageUpload(false);
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

  // Show edit profile page if editing
  if (showEditPage) {
    return <EditProfilePage onBack={handleBackFromEdit} />;
  }

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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6" style={{ backgroundColor: 'var(--field-light)' }}>
        {/* Profile Header - First Image Layout */}
        <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
          {/* Profile Picture */}
          <div className="relative flex-shrink-0">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold cursor-pointer transition-all duration-200 hover:opacity-80 relative group"
              style={{ backgroundColor: 'var(--cricket-green)' }}
              onClick={() => setShowImageUpload(true)}
            >
              {profileData?.profile_image_url ? (
                <img 
                  src={profileData.profile_image_url} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user.avatar
              )}
              {/* Camera overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            {user.verified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center" style={{ backgroundColor: 'var(--success)' }}>
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          
          {/* Name and Username */}
          <div className="flex-1 w-full">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{user.name}</h1>
          <p className="text-gray-600 mb-4">@{user.username}</p>
          
          {/* Statistics Bar */}
            <div className="flex flex-wrap gap-4 sm:gap-8 mb-6">
              <div className="text-center min-w-[60px]">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{user.posts}</div>
              <div className="text-xs sm:text-sm text-gray-600">Posts</div>
            </div>
              <div className="text-center min-w-[60px]">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{user.followers}</div>
              <div className="text-xs sm:text-sm text-gray-600">Connections</div>
            </div>
              <div className="text-center min-w-[60px]">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">0</div>
              <div className="text-xs sm:text-sm text-gray-600">Runs</div>
            </div>
          </div>
          
          <button 
            onClick={handleEditProfile}
            className="px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base text-white font-medium"
            style={{ backgroundColor: 'var(--cricket-green)', color: 'white' }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'var(--cricket-green-hover)'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'var(--cricket-green)'}
          >
              Edit Profile
          </button>
          </div>
        </div>

        {/* Personal Information Card - First Image */}
        <div className="border rounded-lg p-4 sm:p-6 mb-6" style={{ backgroundColor: 'var(--stadium-white)', borderColor: 'var(--gray-200)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" style={{ color: 'var(--cricket-green)' }} />
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Personal Information</h2>
                <p className="text-xs sm:text-sm text-gray-500">Private details visible only to you</p>
            </div>
            </div>
            <button
              onClick={handleViewPersonalInfo}
              className="text-white px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm sm:text-base font-medium"
              style={{ backgroundColor: 'var(--fire-orange)' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'var(--fire-orange-hover)'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'var(--fire-orange)'}
            >
              <User className="w-4 h-4" />
              <span>View</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Full Name:</p>
              <p className="text-gray-900 font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Contact:</p>
              <p className="text-gray-900 font-medium">Not provided</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location:</p>
              <p className="text-gray-900 font-medium">Not provided</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email:</p>
              <p className="text-gray-900 font-medium break-all">{firebaseUser?.email || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Posts Section - First Image */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--cricket-green)' }}>
              Posts {showAllPosts ? allPosts.length : posts.length}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={handleRefreshPosts}
                disabled={loadingPosts}
                className="p-2 rounded transition-colors hover:bg-gray-100 disabled:opacity-50"
                title="Refresh Posts"
              >
                <svg className={`w-5 h-5 text-gray-600 ${loadingPosts ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button 
                onClick={() => handlePostsViewToggle('grid')}
                className={`p-2 rounded transition-colors`}
                style={{ 
                  backgroundColor: postsViewMode === 'grid' ? 'var(--cricket-green-light)' : 'transparent',
                  color: postsViewMode === 'grid' ? 'white' : 'var(--cricket-green)'
                }}
                onMouseEnter={(e) => {
                  if (postsViewMode !== 'grid') {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'var(--gray-100)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (postsViewMode !== 'grid') {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                  }
                }}
              >
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button 
                onClick={() => handlePostsViewToggle('list')}
                className={`p-2 rounded transition-colors`}
                style={{ 
                  backgroundColor: postsViewMode === 'list' ? 'var(--cricket-green-light)' : 'transparent',
                  color: postsViewMode === 'list' ? 'white' : 'var(--cricket-green)'
                }}
                onMouseEnter={(e) => {
                  if (postsViewMode !== 'list') {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'var(--gray-100)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (postsViewMode !== 'list') {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                  }
                }}
              >
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="mb-4">
            {postsViewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(showAllPosts ? allPosts : posts).map((post) => (
                  <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: 'var(--cricket-green)' }}>
                        {user.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">{user.name}</h4>
                          <span className="text-xs text-gray-500">@{user.username}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-900 line-clamp-3">{post.content}</p>
                        <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{post.likes_count}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{post.comments_count}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {(showAllPosts ? allPosts : posts).map((post) => (
                  <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: 'var(--cricket-green)' }}>
                        {user.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900">{user.name}</h4>
                          <span className="text-xs text-gray-500">@{user.username}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 mb-3">{post.content}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{post.likes_count}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{post.comments_count}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* More Posts Button */}
          {!showAllPosts && posts.length > 0 && (
            <div className="text-center">
              <button
                onClick={loadMorePosts}
                disabled={loadingPosts}
                className="px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--cricket-green)' }}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'var(--cricket-green-hover)'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'var(--cricket-green)'}
              >
                {loadingPosts ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  'More Posts'
                )}
              </button>
            </div>
          )}

          {/* Show Less Button */}
          {showAllPosts && allPosts.length > posts.length && (
            <div className="text-center">
              <button
                onClick={() => setShowAllPosts(false)}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Show Less
              </button>
            </div>
          )}
        </div>

        {/* Cricket Statistics - Second Image */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: 'var(--cricket-green)' }}>Cricket Statistics</h2>
            <button
              onClick={handleEditCricketStats}
              className="flex items-center space-x-2 transition-colors"
              style={{ color: 'var(--fire-orange)' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.color = 'var(--fire-orange-hover)'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.color = 'var(--fire-orange)'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-sm font-medium">Edit Stats</span>
            </button>
          </div>

          {/* BOWLING Section */}
          <div>
            <h3 className="text-base sm:text-lg font-bold mb-4" style={{ color: 'var(--sky-blue)' }}>BOWLING</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 sm:p-4 rounded-lg" style={{ backgroundColor: 'var(--info-light)' }}>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base" style={{ color: 'var(--scoreboard-gray)' }}>Wickets</span>
                  <span className="font-bold" style={{ color: 'var(--sky-blue)' }}>{profileData?.total_wickets || 0}</span>
                </div>
              </div>
              <div className="p-3 sm:p-4 rounded-lg" style={{ backgroundColor: 'var(--info-light)' }}>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base" style={{ color: 'var(--scoreboard-gray)' }}>Best</span>
                  <span className="font-bold" style={{ color: 'var(--sky-blue)' }}>{profileData?.best_bowling_figures || '0/0'}</span>
                </div>
              </div>
              <div className="p-3 sm:p-4 rounded-lg" style={{ backgroundColor: 'var(--info-light)' }}>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base" style={{ color: 'var(--scoreboard-gray)' }}>Average</span>
                  <span className="font-bold" style={{ color: 'var(--sky-blue)' }}>{profileData?.bowling_average || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* FIELDING Section */}
          <div>
            <h3 className="text-base sm:text-lg font-bold mb-4" style={{ color: 'var(--grass-green)' }}>FIELDING</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 sm:p-4 rounded-lg" style={{ backgroundColor: 'var(--success-light)' }}>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base" style={{ color: 'var(--scoreboard-gray)' }}>Catches</span>
                  <span className="font-bold" style={{ color: 'var(--grass-green)' }}>{profileData?.catches || 0}</span>
                </div>
              </div>
              <div className="p-3 sm:p-4 rounded-lg" style={{ backgroundColor: 'var(--success-light)' }}>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base" style={{ color: 'var(--scoreboard-gray)' }}>Stumpings</span>
                  <span className="font-bold" style={{ color: 'var(--grass-green)' }}>{profileData?.stumpings || 0}</span>
                </div>
              </div>
              <div className="p-3 sm:p-4 rounded-lg" style={{ backgroundColor: 'var(--success-light)' }}>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base" style={{ color: 'var(--scoreboard-gray)' }}>Run Outs</span>
                  <span className="font-bold" style={{ color: 'var(--grass-green)' }}>{profileData?.run_outs || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Format Performance */}
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--cricket-green)' }}>Format Performance</h3>
            
            <div className="space-y-4">
              <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--pavilion-cream)' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold" style={{ color: 'var(--cricket-green)' }}>Test Cricket</h4>
                    <p className="text-sm" style={{ color: 'var(--scoreboard-gray)' }}>0 runs • 0 wickets</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm" style={{ color: 'var(--scoreboard-gray)' }}><span className="font-bold">Avg:</span> 0</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--pavilion-cream)' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold" style={{ color: 'var(--cricket-green)' }}>ODI Cricket</h4>
                    <p className="text-sm" style={{ color: 'var(--scoreboard-gray)' }}>0 runs • 0 wickets</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm" style={{ color: 'var(--scoreboard-gray)' }}><span className="font-bold">Avg:</span> 0</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--pavilion-cream)' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold" style={{ color: 'var(--cricket-green)' }}>T20 Cricket</h4>
                    <p className="text-sm" style={{ color: 'var(--scoreboard-gray)' }}>0 runs • 0 wickets</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm" style={{ color: 'var(--scoreboard-gray)' }}><span className="font-bold">Avg:</span> 0</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Rating */}
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--cricket-green)' }}>Skills Rating</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--scoreboard-gray)' }}>Batting</span>
                <span className="font-bold" style={{ color: 'var(--cricket-green)' }}>{profileData?.batting_skill || 0}%</span>
              </div>
              <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--gray-200)' }}>
                <div 
                  className="h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${profileData?.batting_skill || 0}%`, backgroundColor: 'var(--fire-orange)' }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--scoreboard-gray)' }}>Bowling</span>
                <span className="font-bold" style={{ color: 'var(--cricket-green)' }}>{profileData?.bowling_skill || 0}%</span>
              </div>
              <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--gray-200)' }}>
                <div 
                  className="h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${profileData?.bowling_skill || 0}%`, backgroundColor: 'var(--sky-blue)' }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--scoreboard-gray)' }}>Fielding</span>
                <span className="font-bold" style={{ color: 'var(--cricket-green)' }}>{profileData?.fielding_skill || 0}%</span>
              </div>
              <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--gray-200)' }}>
                <div 
                  className="h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${profileData?.fielding_skill || 0}%`, backgroundColor: 'var(--grass-green)' }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Experience Section - Third Image */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--cricket-green)' }}>Experience</h2>
            <button
              onClick={() => setShowAddExperience(true)}
              className="flex items-center space-x-2 transition-colors"
              style={{ color: 'var(--fire-orange)' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.color = 'var(--fire-orange-hover)'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.color = 'var(--fire-orange)'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium">Add Experience</span>
            </button>
        </div>
          
          {experiences.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No experience added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {experiences.map((experience) => (
                <div key={experience.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{experience.title}</h3>
                      <p className="text-sm text-gray-600">{experience.company}</p>
                      <p className="text-sm text-gray-500">{experience.duration}</p>
                      {experience.description && (
                        <p className="text-sm text-gray-700 mt-2">{experience.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEditExperience(experience.id, experience)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteExperience(experience.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

        {/* Achievements Section - Third Image */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--cricket-green)' }}>Achievements</h2>
            <button
              onClick={() => setShowAddAchievement(true)}
              className="flex items-center space-x-2 transition-colors"
              style={{ color: 'var(--fire-orange)' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.color = 'var(--fire-orange-hover)'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.color = 'var(--fire-orange)'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium">Add Achievement</span>
            </button>
          </div>
          
          {achievements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No achievements added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                      <p className="text-sm text-gray-600">{achievement.organization}</p>
                      <p className="text-sm text-gray-500">{achievement.date}</p>
                      {achievement.description && (
                        <p className="text-sm text-gray-700 mt-2">{achievement.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEditAchievement(achievement.id, achievement)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteAchievement(achievement.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


       
      </div>

      {/* Modals */}
      <AddAchievementModal
        isOpen={showAddAchievement}
        onClose={() => setShowAddAchievement(false)}
        onSave={handleAddAchievement}
      />
      
      <AddExperienceModal
        isOpen={showAddExperience}
        onClose={() => setShowAddExperience(false)}
        onSave={handleAddExperience}
      />
      
      <EditCricketStatsModal
        isOpen={showEditStats}
        onClose={() => setShowEditStats(false)}
        onSave={handleSaveCricketStats}
        currentStats={profileData}
      />
      
      <PersonalInfoModal
        isOpen={showPersonalInfo}
        onClose={() => setShowPersonalInfo(false)}
        profileData={profileData}
        firebaseUser={firebaseUser}
      />
      
      <ImageUploadModal
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onSave={handleImageUpload}
      />
    </div>
  );
}