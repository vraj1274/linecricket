import React, { useState, useEffect } from 'react';
import { CheckCircle, Heart, MessageCircle, MoreHorizontal, Grid3X3, List, Edit2, Save, X, Plus, Trash2, Shield, User } from 'lucide-react';
import { useMobileApp } from '../contexts/MobileAppContext';
import { useUserProfile } from '../contexts/UserProfileContext';

interface ProfileViewProps {
  onNavigateToPersonalInfo?: () => void;
}

export function ProfileView({ onNavigateToPersonalInfo }: ProfileViewProps) {
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [postViewMode, setPostViewMode] = useState<'grid' | 'list'>('grid');
  const { showMobileAppModal } = useMobileApp();
  const { userProfile, loading, updateProfile, addExperience, updateExperience, deleteExperience, addAchievement, updateAchievement, deleteAchievement, refreshProfile } = useUserProfile();

  // Refresh profile when component mounts to ensure we have the latest data
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // Also refresh when component becomes visible (user navigates back from edit)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshProfile();
      }
    };

    const handleFocus = () => {
      refreshProfile();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshProfile]);

  // Editing state management
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [tempData, setTempData] = useState<any>({});
  const [awards, setAwards] = useState<any[]>([]); // Awards not in current schema

  const userPosts: any[] = [];

  const displayedPosts = showAllPosts ? userPosts : userPosts.slice(0, 3);

  // Use profile data from context - these will automatically update when context changes
  const experience = userProfile?.profile?.experiences || [];
  const skillsRating = {
    batting: userProfile?.profile?.batting_skill || 0,
    bowling: userProfile?.profile?.bowling_skill || 0,
    fielding: userProfile?.profile?.fielding_skill || 0
  };
  const achievements = userProfile?.profile?.achievements || [];

  const [upcomingMatches, setUpcomingMatches] = useState([
    { title: 'Sunday Cricket', time: 'Tomorrow', location: 'Shivaji Park, 7:00 AM' },
    { title: 'Practice Match', time: 'Today', location: 'Oval Maidan, 6:00 PM' },
  ]);

  // Helper functions for editing
  const startEditing = (section: string, data: any) => {
    setEditingSection(section);
    setTempData(data);
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setTempData({});
  };

  const saveEditing = () => {
    // Here you would typically save to backend
    console.log('Saving data:', tempData);
    setEditingSection(null);
    setTempData({});
  };

  const addNewItem = async (section: string, newItem: any) => {
    if (newItem.title || newItem.name) {
      try {
        switch (section) {
          case 'experience':
            await addExperience(newItem);
            break;
          case 'achievements':
            await addAchievement(newItem);
            break;
          case 'awards':
            // Awards not implemented in backend yet
            setAwards([...awards, newItem]);
            break;
        }
      } catch (error) {
        console.error(`Error adding ${section}:`, error);
        alert(`Failed to add ${section}. Please try again.`);
      }
    }
  };

  const updateItem = async (section: string, index: number, updatedItem: any) => {
    try {
      switch (section) {
        case 'experience':
          const experienceItem = experience[index];
          if (experienceItem?.id) {
            await updateExperience(experienceItem.id, updatedItem);
          }
          break;
        case 'achievements':
          const achievementItem = achievements[index];
          if (achievementItem?.id) {
            await updateAchievement(achievementItem.id, updatedItem);
          }
          break;
        case 'awards':
          // Awards not implemented in backend yet
          const newAwards = [...awards];
          newAwards[index] = updatedItem;
          setAwards(newAwards);
          break;
      }
    } catch (error) {
      console.error(`Error updating ${section}:`, error);
      alert(`Failed to update ${section}. Please try again.`);
    }
  };

  const deleteItem = async (section: string, index: number) => {
    try {
      switch (section) {
        case 'experience':
          const experienceItem = experience[index];
          if (experienceItem?.id) {
            await deleteExperience(experienceItem.id);
          }
          break;
        case 'achievements':
          const achievementItem = achievements[index];
          if (achievementItem?.id) {
            await deleteAchievement(achievementItem.id);
          }
          break;
        case 'awards':
          // Awards not implemented in backend yet
          setAwards(awards.filter((_, i) => i !== index));
          break;
      }
    } catch (error) {
      console.error(`Error deleting ${section}:`, error);
      alert(`Failed to delete ${section}. Please try again.`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-6 mb-6">
          <div className="relative">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-xl"
              style={{ background: 'linear-gradient(to bottom right, #5D798E, #2E4B5F)' }}
            >
              You
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{userProfile?.profile?.full_name || 'Loading...'}</h2>
              {userProfile?.is_verified && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">Verified</span>
              )}
            </div>
            <p className="text-lg text-gray-600">@{userProfile?.username || 'loading...'}</p>
            <p className="text-sm text-gray-500 mt-1">{userProfile?.profile?.bio || 'Cricket Enthusiast'}</p>
            <p className="text-sm text-gray-500">
              🏏 {userProfile?.profile?.organization || 'Cricket Player'} | 📍 {userProfile?.profile?.location || 'Location'}
            </p>
          </div>
        </div>
        
        <div className="flex justify-around mb-6 bg-gray-50 rounded-xl p-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">42</p>
            <p className="text-sm text-gray-500">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">1,234</p>
            <p className="text-sm text-gray-500">Connections</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">567</p>
            <p className="text-sm text-gray-500">Connected</p>
          </div>
        </div>

        {/* Personal Information Section */}
        {onNavigateToPersonalInfo && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  <p className="text-sm text-gray-600">Private details visible only to you</p>
                </div>
              </div>
              <button
                onClick={onNavigateToPersonalInfo}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>View Personal Info</span>
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Full Name:</span>
                <p className="font-medium text-gray-900">{userProfile?.profile?.full_name || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-gray-500">Location:</span>
                <p className="font-medium text-gray-900">{userProfile?.profile?.location || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-gray-500">Contact:</span>
                <p className="font-medium text-gray-900">{userProfile?.profile?.contact_number || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <p className="font-medium text-gray-900">{userProfile?.email || 'Not provided'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Posts Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-semibold">Posts</h3>
            <span className="text-sm text-gray-500">42</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPostViewMode('grid')}
              className={`p-2 rounded-lg ${postViewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
              <Grid3X3 className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setPostViewMode('list')}
              className={`p-2 rounded-lg ${postViewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
              <List className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {postViewMode === 'grid' ? (
          <div className="grid grid-cols-4 gap-3">
            {(showAllPosts ? userPosts : userPosts.slice(0, 12)).map((post) => (
              <div key={post.id} className="aspect-square bg-gray-100 rounded-lg cursor-pointer hover:opacity-80 transition-opacity relative group">
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  🏏
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center space-x-3 text-white text-sm">
                    <Heart className="w-4 h-4" />
                    <span>{post.likes}</span>
                    <MessageCircle className="w-4 h-4 ml-1" />
                    <span>{post.comments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedPosts.map((post) => (
              <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                      style={{ background: 'linear-gradient(to bottom right, #5D798E, #2E4B5F)' }}
                    >
                      You
                    </div>
                    <span className="text-sm text-gray-500">{post.timeAgo}</span>
                  </div>
                  <button className="p-1 hover:bg-gray-200 rounded-full">
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                
                <p className="text-sm text-gray-800 mb-4 leading-relaxed">{post.content}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button 
                      onClick={showMobileAppModal}
                      className={`flex items-center space-x-2 text-sm transition-colors ${
                        post.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.liked ? 'fill-current' : ''}`} />
                      <span>{post.likes}</span>
                    </button>
                    <button 
                      onClick={showMobileAppModal}
                      className="flex items-center space-x-2 text-sm text-gray-500 hover:text-blue-500 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {userPosts.length > (postViewMode === 'grid' ? 12 : 3) && (
          <button 
            onClick={() => setShowAllPosts(!showAllPosts)}
            className="w-full mt-4 py-3 text-sm text-blue-500 hover:text-blue-600 transition-colors border border-blue-200 rounded-lg hover:bg-blue-50"
          >
            {showAllPosts ? 'Show Less' : `View All 42 Posts`}
          </button>
        )}
      </div>

      {/* Cricket Statistics */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Cricket Statistics</h3>
        
        {/* Batting Stats */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <span className="text-sm font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">BATTING</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Runs</span>
                <span className="text-lg font-semibold text-orange-700">{userProfile?.profile?.stats?.total_runs || 0}</span>
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Matches</span>
                <span className="text-lg font-semibold text-orange-700">{userProfile?.profile?.stats?.total_matches || 0}</span>
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">100s</span>
                <span className="text-lg font-semibold text-orange-700">{userProfile?.profile?.stats?.centuries || 0}</span>
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">50s</span>
                <span className="text-lg font-semibold text-orange-700">{userProfile?.profile?.stats?.half_centuries || 0}</span>
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average</span>
                <span className="text-lg font-semibold text-orange-700">{userProfile?.profile?.stats?.batting_average || 0}</span>
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Highest</span>
                <span className="text-lg font-semibold text-orange-700">{userProfile?.profile?.stats?.highest_score || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bowling Stats */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">BOWLING</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Matches</span>
                <span className="text-lg font-semibold text-blue-700">89</span>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Overs</span>
                <span className="text-lg font-semibold text-blue-700">215.2</span>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Wickets</span>
                <span className="text-lg font-semibold text-blue-700">47</span>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Hat-tricks</span>
                <span className="text-lg font-semibold text-blue-700">1</span>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Best</span>
                <span className="text-lg font-semibold text-blue-700">5/23</span>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average</span>
                <span className="text-lg font-semibold text-blue-700">28.4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fielding Stats */}
        <div>
          <div className="flex items-center mb-3">
            <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">FIELDING</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Matches</span>
                <span className="text-lg font-semibold text-green-700">89</span>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Catches</span>
                <span className="text-lg font-semibold text-green-700">34</span>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Stumpings</span>
                <span className="text-lg font-semibold text-green-700">8</span>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Run Outs</span>
                <span className="text-lg font-semibold text-green-700">12</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Format Performance */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Format Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-800">Test Cricket</span>
              <span className="text-sm text-gray-500">5 matches</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>234 runs • 8 wickets</span>
              <span className="text-orange-600 font-medium">Avg: 46.8</span>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-800">ODI Cricket</span>
              <span className="text-sm text-gray-500">25 matches</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>1,456 runs • 18 wickets</span>
              <span className="text-orange-600 font-medium">Avg: 58.2</span>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-800">T20 Cricket</span>
              <span className="text-sm text-gray-500">59 matches</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>1,157 runs • 21 wickets</span>
              <span className="text-orange-600 font-medium">Avg: 19.6</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Rating */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Skills Rating</h3>
          <button
            onClick={() => startEditing('skills', skillsRating)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit Skills"
          >
            <Edit2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        
        {editingSection === 'skills' ? (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Batting</span>
                <span className="text-sm text-gray-600">{tempData.batting || skillsRating.batting}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={tempData.batting || skillsRating.batting}
                onChange={(e) => setTempData({...tempData, batting: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Bowling</span>
                <span className="text-sm text-gray-600">{tempData.bowling || skillsRating.bowling}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={tempData.bowling || skillsRating.bowling}
                onChange={(e) => setTempData({...tempData, bowling: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Fielding</span>
                <span className="text-sm text-gray-600">{tempData.fielding || skillsRating.fielding}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={tempData.fielding || skillsRating.fielding}
                onChange={(e) => setTempData({...tempData, fielding: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="flex items-center space-x-2">
                  <button
                    onClick={async () => {
                      try {
                        await updateProfile({ 
                          batting_skill: tempData.batting || skillsRating.batting,
                          bowling_skill: tempData.bowling || skillsRating.bowling,
                          fielding_skill: tempData.fielding || skillsRating.fielding
                        });
                        saveEditing();
                      } catch (error) {
                        console.error('Error updating skills:', error);
                        alert('Failed to update skills. Please try again.');
                      }
                    }}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-1"
                  >
                    <Save className="w-3 h-3" />
                    <span>Save</span>
                  </button>
              <button
                onClick={cancelEditing}
                className="px-3 py-1 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-1"
              >
                <X className="w-3 h-3" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Batting</span>
                <span className="text-sm text-gray-600">{skillsRating.batting}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full" style={{ width: `${skillsRating.batting}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Bowling</span>
                <span className="text-sm text-gray-600">{skillsRating.bowling}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full" style={{ width: `${skillsRating.bowling}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Fielding</span>
                <span className="text-sm text-gray-600">{skillsRating.fielding}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full" style={{ width: `${skillsRating.fielding}%` }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Experience */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Experience</h3>
          <button
            onClick={() => startEditing('experience', { title: '', role: '', duration: '', description: '', index: -1 })}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Add Experience"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="space-y-4">
          {experience.map((exp, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg group">
              {editingSection === 'experience' && tempData.index === index ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Title/Organization"
                    value={tempData.title}
                    onChange={(e) => setTempData({...tempData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Role/Position"
                    value={tempData.role}
                    onChange={(e) => setTempData({...tempData, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Duration"
                    value={tempData.duration}
                    onChange={(e) => setTempData({...tempData, duration: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <textarea
                    placeholder="Description"
                    value={tempData.description}
                    onChange={(e) => setTempData({...tempData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={async () => {
                        await updateItem('experience', index, tempData);
                        cancelEditing();
                      }}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-1"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-1"
                    >
                      <X className="w-3 h-3" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{exp.title}</p>
                      <p className="text-sm text-gray-600">{exp.role}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{exp.duration}</span>
                      <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
                        <button
                          onClick={() => startEditing('experience', {...exp, index})}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3 text-gray-600" />
                        </button>
                        <button
                          onClick={async () => await deleteItem('experience', index)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{exp.description}</p>
                </>
              )}
            </div>
          ))}
          
          {editingSection === 'experience' && tempData.index === -1 && (
            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Title/Organization"
                  value={tempData.title}
                  onChange={(e) => setTempData({...tempData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Role/Position"
                  value={tempData.role}
                  onChange={(e) => setTempData({...tempData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Duration"
                  value={tempData.duration}
                  onChange={(e) => setTempData({...tempData, duration: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <textarea
                  placeholder="Description"
                  value={tempData.description}
                  onChange={(e) => setTempData({...tempData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={async () => {
                      await addNewItem('experience', tempData);
                      cancelEditing();
                    }}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-3 py-1 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-1"
                  >
                    <X className="w-3 h-3" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Achievements */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Achievements</h3>
          <button
            onClick={() => startEditing('achievements', { title: '', description: '', year: '', index: -1 })}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Add Achievement"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="space-y-4">
          {achievements.map((achievement, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg group">
              {editingSection === 'achievements' && tempData.index === index ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Achievement Title"
                    value={tempData.title}
                    onChange={(e) => setTempData({...tempData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={tempData.description}
                    onChange={(e) => setTempData({...tempData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Year"
                    value={tempData.year}
                    onChange={(e) => setTempData({...tempData, year: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={async () => {
                        await updateItem('achievements', index, tempData);
                        cancelEditing();
                      }}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-1"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-1"
                    >
                      <X className="w-3 h-3" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{achievement.title}</p>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{achievement.year}</span>
                      <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
                        <button
                          onClick={() => startEditing('achievements', {...achievement, index})}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3 text-gray-600" />
                        </button>
                        <button
                          onClick={async () => await deleteItem('achievements', index)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
          
          {editingSection === 'achievements' && tempData.index === -1 && (
            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Achievement Title"
                  value={tempData.title}
                  onChange={(e) => setTempData({...tempData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={tempData.description}
                  onChange={(e) => setTempData({...tempData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Year"
                  value={tempData.year}
                  onChange={(e) => setTempData({...tempData, year: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={async () => {
                      await addNewItem('achievements', tempData);
                      cancelEditing();
                    }}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-3 py-1 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-1"
                  >
                    <X className="w-3 h-3" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Awards */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Awards</h3>
          <button
            onClick={() => startEditing('awards', { title: '', organization: '', year: '', index: -1 })}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Add Award"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="space-y-4">
          {awards.map((award, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg group">
              {editingSection === 'awards' && tempData.index === index ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Award Title"
                    value={tempData.title}
                    onChange={(e) => setTempData({...tempData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Organization"
                    value={tempData.organization}
                    onChange={(e) => setTempData({...tempData, organization: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Year"
                    value={tempData.year}
                    onChange={(e) => setTempData({...tempData, year: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        updateItem('awards', index, tempData);
                        cancelEditing();
                      }}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-1"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-1"
                    >
                      <X className="w-3 h-3" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{award.title}</p>
                      <p className="text-sm text-gray-600">{award.organization}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{award.year}</span>
                      <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
                        <button
                          onClick={() => startEditing('awards', {...award, index})}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3 text-gray-600" />
                        </button>
                        <button
                          onClick={() => deleteItem('awards', index)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
          
          {editingSection === 'awards' && tempData.index === -1 && (
            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Award Title"
                  value={tempData.title}
                  onChange={(e) => setTempData({...tempData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Organization"
                  value={tempData.organization}
                  onChange={(e) => setTempData({...tempData, organization: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Year"
                  value={tempData.year}
                  onChange={(e) => setTempData({...tempData, year: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      addNewItem('awards', tempData);
                      cancelEditing();
                    }}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-3 py-1 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-1"
                  >
                    <X className="w-3 h-3" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Matches */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Upcoming Matches</h3>
        <div className="space-y-3">
          {upcomingMatches.map((match, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{match.title}</span>
                <span className="text-sm text-gray-500">{match.time}</span>
              </div>
              <p className="text-sm text-gray-600">{match.location}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}