import { CheckCircle, Edit2, Grid3X3, Heart, List, MessageCircle, MoreHorizontal, Save, Settings, Shield, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useMobileApp } from '../contexts/MobileAppContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useToast } from '../contexts/ToastContext';
import { auth } from '../firebase/config';
import { FirebaseDebugInfo } from './FirebaseDebugInfo';
import { ProfileLoadingSpinner } from './LoadingSpinner';

interface UserProfileViewProps {
  onEditProfile?: () => void;
  onNavigateToPersonalInfo?: () => void;
}

export function UserProfileView({ onEditProfile, onNavigateToPersonalInfo }: UserProfileViewProps) {
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [postViewMode, setPostViewMode] = useState<'grid' | 'list'>('grid');
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const { showMobileAppModal } = useMobileApp();
  const { userProfile, refreshProfile, loading, error, isInitialLoad, updateProfileField } = useUserProfile();
  const { showSuccess, showError } = useToast();

  // Get Firebase user data immediately
  useEffect(() => {
    const user = auth.currentUser;
    setFirebaseUser(user);
    console.log('🔥 Firebase user in profile:', user);
  }, []);

  // Refresh profile when component mounts to ensure we have the latest data
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);
  
  const handleEditProfile = () => {
    if (onEditProfile) {
      onEditProfile();
    } else {
      showMobileAppModal();
    }
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
      const valueToSave = editValue.trim();
      
      // Map frontend field names to backend field names
      const fieldMapping: { [key: string]: string } = {
        'bio': 'bio',
        'location': 'location',
        'organization': 'organization',
        'total_runs': 'total_runs',
        'total_matches': 'total_matches',
        'total_wickets': 'total_wickets',
        'centuries': 'centuries',
        'half_centuries': 'half_centuries',
        'catches': 'catches',
        'stumpings': 'stumpings',
        'run_outs': 'run_outs',
        'batting_average': 'batting_average',
        'bowling_average': 'bowling_average',
        'highest_score': 'highest_score',
        'best_bowling_figures': 'best_bowling_figures'
      };
      
      const backendFieldName = fieldMapping[editingField] || editingField;
      await updateProfileField(backendFieldName, valueToSave);
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

  const userPosts: any[] = [];

  const displayedPosts = showAllPosts ? userPosts : userPosts.slice(0, 3);

  // Use profile data from context - these will automatically update when context changes
  const experience = userProfile?.profile?.experiences || [];

  const upcomingMatches = [
    { title: 'Sunday Cricket', time: 'Tomorrow', location: 'Shivaji Park, 7:00 AM' },
    { title: 'Practice Match', time: 'Today', location: 'Oval Maidan, 6:00 PM' },
  ];

  // Show loading state during initial load
  if (isInitialLoad && loading) {
    return <ProfileLoadingSpinner />;
  }

  // Show error state
  if (error && !userProfile) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center bg-red-100">
            <span className="text-red-500 text-xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Error Loading Profile</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={refreshProfile}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Error message for updates */}
      {error && userProfile && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-red-500 text-lg">⚠️</span>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">Update Failed</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={refreshProfile}
                className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Profile Header with Real Data */}
      <div className="mb-8">
        <div className="flex items-center space-x-6 mb-6">
          <div className="relative">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-xl"
              style={{ background: 'linear-gradient(to bottom right, #5D798E, #2E4B5F)' }}
            >
              {userProfile?.profile?.full_name?.charAt(0) || firebaseUser?.displayName?.charAt(0) || 'U'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {userProfile?.profile?.full_name || firebaseUser?.displayName || 'Loading...'}
              </h2>
              {userProfile?.is_verified && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">Verified</span>
              )}
            </div>
            <p className="text-lg text-gray-600">@{userProfile?.username || firebaseUser?.email?.split('@')[0] || 'loading...'}</p>
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
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Personal Information</h3>
                <p className="text-xs text-gray-600">Private details visible only to you</p>
              </div>
            </div>
            <button
              onClick={onNavigateToPersonalInfo}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
            >
              <User className="w-3 h-3" />
              <span>View</span>
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500">Full Name:</span>
              <p className="font-medium text-gray-900">
                  {userProfile?.profile?.full_name || firebaseUser?.displayName || 'Not provided'}
              </p>
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
                <p className="font-medium text-gray-900">{userProfile?.email || firebaseUser?.email || 'Not provided'}</p>
              </div>
            </div>
              </div>
            )}
          </div>

      {/* Posts Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm">Posts</h4>
            <span className="text-xs text-gray-500">42</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setPostViewMode('grid')}
              className={`p-1 rounded ${postViewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              aria-label="Grid view"
              title="Grid view"
            >
              <Grid3X3 className="w-3 h-3 text-gray-600" />
            </button>
            <button
              onClick={() => setPostViewMode('list')}
              className={`p-1 rounded ${postViewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              aria-label="List view"
              title="List view"
            >
              <List className="w-3 h-3 text-gray-600" />
            </button>
          </div>
        </div>
        
        {postViewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-1">
            {(showAllPosts ? userPosts : userPosts.slice(0, 9)).map((post) => (
              <div key={post.id} className="aspect-square bg-gray-100 rounded cursor-pointer hover:opacity-80 transition-opacity relative group">
                <div className="w-full h-full flex items-center justify-center text-lg">
                  🏏
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center space-x-2 text-white text-xs">
                    <Heart className="w-3 h-3" />
                    <span>{post.likes}</span>
                    <MessageCircle className="w-3 h-3 ml-1" />
                    <span>{post.comments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedPosts.map((post) => (
              <div key={post.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ background: 'linear-gradient(to bottom right, #5D798E, #2E4B5F)' }}
                    >
                      You
                    </div>
                    <span className="text-xs text-gray-500">{post.timeAgo}</span>
                  </div>
                  <button 
                    className="p-1 hover:bg-gray-200 rounded-full"
                    aria-label="More options"
                    title="More options"
                  >
                    <MoreHorizontal className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
                
                <p className="text-xs text-gray-800 mb-3 leading-relaxed">{post.content}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={showMobileAppModal}
                      className={`flex items-center space-x-1 text-xs transition-colors ${
                        post.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${post.liked ? 'fill-current' : ''}`} />
                      <span>{post.likes}</span>
                    </button>
                    <button 
                      onClick={showMobileAppModal}
                      className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-500 transition-colors"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>{post.comments}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {userPosts.length > (postViewMode === 'grid' ? 9 : 3) && (
          <button 
            onClick={() => setShowAllPosts(!showAllPosts)}
            className="w-full mt-3 py-2 text-xs text-blue-500 hover:text-blue-600 transition-colors border border-blue-200 rounded-lg hover:bg-blue-50"
          >
            {showAllPosts ? 'Show Less' : `View All 42 Posts`}
          </button>
        )}
      </div>

      {/* Cricket Statistics Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm">Cricket Statistics</h4>
          <button 
            onClick={showMobileAppModal}
            className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
          >
            View All
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white border border-gray-100 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">25</div>
            <div className="text-xs text-gray-500">Matches</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">1,250</div>
            <div className="text-xs text-gray-500">Runs</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">50.0</div>
            <div className="text-xs text-gray-500">Average</div>
          </div>
        </div>
      </div>

      {/* Upcoming Matches Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm">Upcoming Matches</h4>
          <button 
            onClick={showMobileAppModal}
            className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
          >
            View All
          </button>
        </div>
        
        <div className="space-y-2">
          {upcomingMatches.slice(0, 2).map((match, index) => (
            <div key={index} className="bg-white border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h5 className="text-xs font-medium text-gray-900 truncate">{match.title}</h5>
                  <p className="text-xs text-gray-500 mt-1">{match.location}</p>
                </div>
                <div className="text-right ml-2">
                  <p className="text-xs font-medium text-blue-600">{match.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Button */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleEditProfile}
          className="flex-1 py-2 border border-gray-200 rounded-lg text-xs hover:bg-gray-50 transition-colors font-medium"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}