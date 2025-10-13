import React, { useState, useEffect } from 'react';
import { CheckCircle, Heart, MessageCircle, MoreHorizontal, Grid3X3, List, Edit2, Save, X, Plus, Trash2, Shield, User, Calendar, MapPin, Mail, Phone, Award, Trophy, Target, Users, Clock, Camera, Edit3 } from 'lucide-react';
import { useMobileApp } from '../contexts/MobileAppContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { PhotoUploadModal } from './PhotoUploadModal';

interface ProfileViewProps {
  onNavigateToPersonalInfo?: () => void;
}

export function ProfileView({ onNavigateToPersonalInfo }: ProfileViewProps) {
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [postViewMode, setPostViewMode] = useState<'grid' | 'list'>('grid');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
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

  // Mock data for the new design
  const profileStats = {
    posts: 42,
    connections: 156,
    matches: 23,
    runs: 1247
  };

  const cricketStats = {
    batting: {
      totalRuns: 1247,
      hundreds: 3,
      average: 45.2,
      matches: 23,
      fifties: 8,
      highest: 156
    },
    bowling: {
      matches: 15,
      wickets: 23,
      best: "4/25",
      average: 28.5
    },
    fielding: {
      matches: 23,
      catches: 12,
      stumpings: 2,
      runOuts: 4
    }
  };

  const formatPerformance = [
    { format: "Test Cricket", runs: 0, wickets: 0, matches: 0, average: 0 },
    { format: "ODI Cricket", runs: 0, wickets: 0, matches: 0, average: 0 },
    { format: "T20 Cricket", runs: 0, wickets: 0, matches: 0, average: 0 }
  ];

  const upcomingMatches = [
    { title: "Sunday Cricket", location: "Shivaji Park", time: "7:00 AM", date: "Tomorrow" },
    { title: "Practice Match", location: "Oval Maidan", time: "6:00 PM", date: "Today" }
  ];

  const handleEditProfile = () => {
    setShowEditProfile(true);
    // You can implement edit profile functionality here
  };

  const handleViewPersonalInfo = () => {
    if (onNavigateToPersonalInfo) {
      onNavigateToPersonalInfo();
    }
  };

  const handleAddMatch = () => {
    // Implement add match functionality
    console.log('Add match clicked');
  };

  const handleViewAllPosts = () => {
    setShowAllPosts(!showAllPosts);
  };

  const handleToggleViewMode = () => {
    setPostViewMode(postViewMode === 'grid' ? 'list' : 'grid');
  };

  const handlePhotoUpload = async (photoUrl: string) => {
    try {
      await updateProfile({ profile_image_url: photoUrl });
      setShowPhotoUpload(false);
    } catch (error) {
      console.error('Error updating profile photo:', error);
    }
  };

  const handlePhotoClick = () => {
    setShowPhotoUpload(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
              {userProfile?.profile?.profile_image_url ? (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-orange-400 transition-colors">
                  <img
                    src={userProfile.profile.profile_image_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-white text-xl font-bold group-hover:bg-orange-500 transition-colors">
                  {userProfile?.profile?.full_name?.charAt(0) || 'K'}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
              {/* Edit overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200">
                <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {userProfile?.profile?.full_name || 'krisha mangukiya'}
              </h1>
              <p className="text-gray-600">@{userProfile?.username || 'krishamangukiya2612'}</p>
            </div>
          </div>

          {/* Statistics Bar */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{profileStats.posts}</div>
              <div className="text-sm text-gray-500">Posts</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{profileStats.connections}</div>
              <div className="text-sm text-gray-500">Connections</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{profileStats.matches}</div>
              <div className="text-sm text-gray-500">Matches</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{profileStats.runs}</div>
              <div className="text-sm text-gray-500">Runs</div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <div className="flex justify-center">
            <button
              onClick={handleEditProfile}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-orange-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                <p className="text-sm text-gray-500">Private details visible only to you</p>
              </div>
            </div>
            <button
              onClick={handleViewPersonalInfo}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-gray-900 rounded-lg hover:bg-orange-600 transition-colors"
              style={{ backgroundColor: '#FF6B33' }}
            >
              <Users className="w-4 h-4 text-gray-900" />
              <span>View</span>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Full Name:</span>
              <p className="font-medium text-gray-900">{userProfile?.profile?.full_name || 'krisha mangukiya'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Contact:</span>
              <p className="font-medium text-gray-900">Not provided</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Location:</span>
              <p className="font-medium text-gray-900">Not provided</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Email:</span>
              <p className="font-medium text-gray-900">{userProfile?.email || 'krishamangukiya2612@gmail.com'}</p>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Posts {profileStats.posts}</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleToggleViewMode}
                className={`p-2 rounded-lg ${postViewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={handleToggleViewMode}
                className={`p-2 rounded-lg ${postViewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="text-center py-8 text-gray-500">
            <p>No posts yet. Start sharing your cricket journey!</p>
          </div>
        </div>

        {/* Cricket Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Cricket Statistics</h3>
          
          {/* Batting Section */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-orange-600 mb-4">BATTING</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Total Runs</div>
                <div className="text-lg font-bold text-orange-600">{cricketStats.batting.totalRuns}</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">100s</div>
                <div className="text-lg font-bold text-orange-600">{cricketStats.batting.hundreds}</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Average</div>
                <div className="text-lg font-bold text-orange-600">{cricketStats.batting.average}</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Matches</div>
                <div className="text-lg font-bold text-orange-600">{cricketStats.batting.matches}</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">50s</div>
                <div className="text-lg font-bold text-orange-600">{cricketStats.batting.fifties}</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Highest</div>
                <div className="text-lg font-bold text-orange-600">{cricketStats.batting.highest}</div>
              </div>
            </div>
          </div>

          {/* Bowling Section */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-orange-600 mb-4">BOWLING</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Matches</div>
                <div className="text-lg font-bold text-orange-600">{cricketStats.bowling.matches}</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Wickets</div>
                <div className="text-lg font-bold text-orange-600">{cricketStats.bowling.wickets}</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Best</div>
                <div className="text-lg font-bold text-orange-600">{cricketStats.bowling.best}</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Average</div>
                <div className="text-lg font-bold text-orange-600">{cricketStats.bowling.average}</div>
              </div>
            </div>
          </div>

          {/* Fielding Section */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-green-600 mb-4">FIELDING</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Matches</div>
                <div className="text-lg font-bold text-green-600">{cricketStats.fielding.matches}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Catches</div>
                <div className="text-lg font-bold text-green-600">{cricketStats.fielding.catches}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Stumpings</div>
                <div className="text-lg font-bold text-green-600">{cricketStats.fielding.stumpings}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Run Outs</div>
                <div className="text-lg font-bold text-green-600">{cricketStats.fielding.runOuts}</div>
              </div>
            </div>
          </div>

          {/* Format Performance */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-700 mb-4">Format Performance</h4>
            {formatPerformance.map((format, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 mb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">{format.format}</div>
                    <div className="text-sm text-gray-600">{format.runs} runs • {format.wickets} wickets</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">{format.matches} matches</div>
                    <div className="font-medium text-gray-900">Avg: {format.average}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Skills Rating */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-4">Skills Rating</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-gray-700">Batting</span>
                <span className="font-medium text-gray-900">0%</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-gray-700">Bowling</span>
                <span className="font-medium text-gray-900">0%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Fielding</span>
                <span className="font-medium text-gray-900">0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience</h3>
          <div className="text-center py-8 text-gray-500">
            <p>No experience added yet.</p>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
          <div className="text-center py-8 text-gray-500">
            <p>No achievements added yet.</p>
          </div>
        </div>

        {/* Upcoming Matches */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Upcoming Matches</h3>
            <button
              onClick={handleAddMatch}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Match</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {upcomingMatches.map((match, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">{match.title}</div>
                    <div className="text-sm text-gray-600">{match.location}, {match.time}</div>
                  </div>
                  <div className="text-sm text-gray-500">{match.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm py-4">
          © 2024 thelinecricket
        </div>
      </div>

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={showPhotoUpload}
        onClose={() => setShowPhotoUpload(false)}
        onPhotoUpload={handlePhotoUpload}
        currentPhotoUrl={userProfile?.profile?.profile_image_url}
      />
    </div>
  );
}