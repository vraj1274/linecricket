import { BarChart3, Bell, Check, Home, Loader2, MessageCircle, MoreHorizontal, Plus, Search, User, Users, Building2, MapPin, Globe, Trash2, AlertTriangle, Eye, EyeOff, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PageType } from '../App';
import newIcon from '../assets/newiconfinal.svg';
import { useMobileApp } from '../contexts/MobileAppContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { useProfileSwitch } from '../contexts/ProfileSwitchContext';
import { AppDownloadModal } from './AppDownloadModal';

interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType, data?: any) => void;
  onLogout: () => void;
  onProfileTypeSelect?: (type: 'player' | 'coach' | 'venue' | 'academy' | 'community') => void;
}

export function Sidebar({ currentPage, onPageChange, onLogout, onProfileTypeSelect }: SidebarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileSwitch, setShowProfileSwitch] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showAppDownloadModal, setShowAppDownloadModal] = useState(false);
  const [modalFeature, setModalFeature] = useState('');
  const { showMobileAppModal } = useMobileApp();
  
  // Get real user data from contexts
  const { userProfile, loading: profileLoading } = useUserProfile();
  const { user: firebaseUser } = useFirebase();
  const { 
    currentProfile, 
    availableProfiles, 
    switchProfile, 
    deleteProfile,
    getProfilePage,
    scrollToProfile,
    scrollToTop,
    scrollToBottom,
    isScrolling,
    scrollPosition,
    canScrollUp,
    canScrollDown,
    searchQuery,
    setSearchQuery,
    filteredProfiles,
    clearSearch,
    filterType,
    setFilter,
    sortBy,
    sortOrder,
    setSort,
    clearAllFilters,
    searchLoading,
    searchError
  } = useProfileSwitch();

  // Get appropriate icon for profile type
  const getProfileIcon = (type: string) => {
    switch (type) {
      case 'academy':
        return <Building2 className="w-4 h-4" />;
      case 'venue':
        return <MapPin className="w-4 h-4" />;
      case 'community':
        return <Globe className="w-4 h-4" />;
      case 'player':
        return <User className="w-4 h-4" />;
      case 'coach':
        return <Users className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  // Create current user object from real data
  const currentUser = userProfile ? {
    id: userProfile.id,
    name: userProfile.profile?.full_name || firebaseUser?.displayName || 'User',
    username: `@${userProfile.username}`,
    role: userProfile.profile?.organization || 'Player',
    avatar: userProfile.profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 
            firebaseUser?.displayName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U',
    color: "linear-gradient(to bottom right, #5D798E, #2E4B5F)",
    email: userProfile.email || firebaseUser?.email || '',
    joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    status: userProfile.is_verified ? 'Verified' : 'Active'
  } : {
    id: 0,
    name: firebaseUser?.displayName || 'User',
    username: `@${firebaseUser?.email?.split('@')[0] || 'user'}`,
    role: 'Player',
    avatar: firebaseUser?.displayName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U',
    color: "linear-gradient(to bottom right, #5D798E, #2E4B5F)",
    email: firebaseUser?.email || '',
    joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    status: 'Active'
  };

  const menuItems = [
    { id: 'home' as PageType, label: 'Home', icon: Home },
    { id: 'search' as PageType, label: 'Search', icon: Search },
    { id: 'matches' as PageType, label: 'Matches', icon: BarChart3 },
    { id: 'notifications' as PageType, label: 'Notifications', icon: Bell, hasNotification: true },
    { id: 'messages' as PageType, label: 'Messages', icon: MessageCircle, hasNotification: true },
    { id: 'create' as PageType, label: 'Create Post', icon: Plus },
    { id: 'create-page' as PageType, label: 'Create Page', icon: Plus },
    { id: 'profile' as PageType, label: 'Profile', icon: User },
  ];

  const handleShowHelpCenter = () => {
    alert('Help Center\n\n📧 Email: help@thelinecricket.com');
    setShowProfileMenu(false);
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout from thelinecricket?')) {
      setIsLoggingOut(true);
      try {
        await onLogout();
        alert('You have been successfully logged out. Thank you for using thelinecricket! 🏏');
      } catch (error) {
        console.error('Logout error:', error);
        alert('There was an error logging out. Please try again.');
      } finally {
        setIsLoggingOut(false);
      }
    }
    setShowProfileMenu(false);
  };

  const handleMenuItemClick = (pageId: PageType) => {
    console.log('🎯 Sidebar menu item clicked:', pageId);
    
    // Show download app modal for Messages and Notifications
    if (pageId === 'messages') {
      setModalFeature('Messages');
      setShowAppDownloadModal(true);
      return;
    }
    
    if (pageId === 'notifications') {
      setModalFeature('Notifications');
      setShowAppDownloadModal(true);
      return;
    }
    
    // Handle profile navigation separately to avoid conflicts
    if (pageId === 'profile') {
      console.log('👤 Profile button clicked - navigating to my-profile');
      // Navigate to user's actual profile, not dynamic profile view
      onPageChange('my-profile');
    } else {
      console.log('📄 Other page clicked - navigating to:', pageId);
      // All other pages navigate directly
      onPageChange(pageId);
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 h-screen w-[280px] bg-gray-50 border-r border-gray-200 z-40 flex flex-col">
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto sidebar-scrollbar cricket-scrollbar">
          <div className="p-6">
            {/* Logo */}
            <div className="mb-8">
              <h1 className="flex items-center text-2xl font-bold bg-gradient-to-r from-orange-500 to-slate-600 bg-clip-text text-transparent">
                <img src={newIcon} alt="TheLineCricket" className="h-8 w-8 mr-3" />
                TheLineCricket
              </h1>
              <p className="text-sm text-gray-500 mt-1" text-align="center">Learn . Play . Connect.</p>
            </div>
            
            {/* Navigation Menu */}
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuItemClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors ${
                      isActive 
                        ? 'text-white' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    style={isActive ? { background: 'linear-gradient(to right, #FF6B33, #2E4B5F)' } : {}}
                  >
                    <div className="relative">
                      <Icon className="w-6 h-6" />
                      {item.hasNotification && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            
            {/* Add some bottom padding to ensure content doesn't get cut off */}
            <div className="h-4"></div>
          </div>
        </div>
        
        {/* User Info at Bottom - Fixed */}
        <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50">
          {profileLoading ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onPageChange('my-profile')}
                className="flex items-center space-x-3 flex-1 text-left hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200 group"
                title="View Profile"
                aria-label="View Profile"
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold group-hover:scale-105 transition-transform duration-200"
                style={{ background: currentUser.color }}
              >
                {currentUser.avatar}
              </div>
              <div className="flex-1">
                  <p className="text-sm text-gray-900 group-hover:text-gray-700 transition-colors duration-200">{currentUser.name}</p>
                  <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-200">{currentUser.username}</p>
              </div>
              </button>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => setShowProfileSwitch(!showProfileSwitch)}
                  className="p-1 hover:bg-orange-100 hover:text-orange-600 rounded-lg transition-all duration-200 ease-in-out"
                  title="Switch Profile"
                  aria-label="Switch Profile"
                >
                  <Users className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="p-2 hover:bg-orange-100 hover:text-orange-600 rounded-lg transition-all duration-200 ease-in-out"
                  title="Profile Menu"
                  aria-label="Profile Menu"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Switch Dropdown */}
      {showProfileSwitch && (
        <div className="fixed bottom-20 left-6 bg-white rounded-xl shadow-lg border border-gray-200 z-50 w-72 backdrop-blur-none">
          <div className="py-2">
            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-slate-50">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-orange-600" />
                <h3 className="text-sm font-semibold text-gray-900">My Pages</h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {availableProfiles.length} {availableProfiles.length === 1 ? 'page' : 'pages'} available
              </p>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {/* Available Profiles from Context */}
              {filteredProfiles.length > 0 ? (
                filteredProfiles.map((profile) => (
                <div
                  key={profile.id}
                  onClick={async () => {
                    try {
                      // Switch profile first
                      await switchProfile(profile.id);
                      
                      // Then navigate to the appropriate page
                      const profilePage = getProfilePage(profile.type, profile.id);
                      
                      // Pass profile data for created pages
                      if (profilePage === 'created-page') {
                        console.log('Navigating to created-page with data:', {
                          id: profile.id,
                          name: profile.name,
                          type: profile.type
                        });
                        onPageChange(profilePage as any, {
                          id: profile.id,
                          name: profile.name,
                          type: profile.type
                        });
                      } else {
                        onPageChange(profilePage as any);
                      }
                      setShowProfileSwitch(false);
                    } catch (error) {
                      console.error('Error switching profile:', error);
                      setShowProfileSwitch(false);
                    }
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-orange-50 hover:text-orange-700 transition-all duration-200 ease-in-out ${
                    profile.isActive ? 'bg-orange-100 border-l-4 border-orange-500' : ''
                  }`}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                    style={{ background: profile.color }}
                  >
                    {getProfileIcon(profile.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-900">{profile.name}</p>
                      {profile.isActive && <Check className="w-4 h-4 text-orange-600" />}
                    </div>
                    <p className="text-xs text-gray-500">{profile.username}</p>
                    <p className="text-xs text-gray-400 capitalize">
                      {['academy', 'venue', 'community'].includes(profile.type) 
                        ? `${profile.type} Page` 
                        : `${profile.type} Page`}
                    </p>
                  </div>
                </div>
              ))
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-gray-500">No profiles found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Menu Dropdown */}
      {showProfileMenu && (
        <div className="fixed bottom-20 left-6 bg-white rounded-xl shadow-lg border border-gray-200 z-50 w-72 backdrop-blur-none">
          <div className="py-2">
            {/* Current User Profile Info */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-slate-50">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg"
                  style={{ background: currentUser.color }}
                >
                  {currentUser.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{currentUser.username}</p>
                  <p className="text-xs text-gray-400">{currentUser.role}</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <p>Email: {currentUser.email}</p>
                <p>Member since: {currentUser.joinDate}</p>
                <p>Status: {currentUser.status}</p>
                {userProfile?.profile?.bio && (
                  <p className="mt-1 text-xs text-gray-600 italic">"{userProfile.profile.bio}"</p>
                )}
                {userProfile?.profile?.location && (
                  <p className="mt-1 text-xs text-gray-500">📍 {userProfile.profile.location}</p>
                )}
              </div>
            </div>
            
            <button 
              onClick={handleShowHelpCenter}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-orange-50 hover:text-orange-700 transition-all duration-200 ease-in-out"
            >
              <div>
                <p className="text-sm text-gray-900">Help Center</p>
                <p className="text-xs text-gray-500">help@thelinecricket.com</p>
              </div>
            </button>
            
            <button 
              onClick={() => {
                onPageChange('edit-profile');
                setShowProfileMenu(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-orange-50 hover:text-orange-700 transition-all duration-200 ease-in-out"
            >
              <div>
                <p className="text-sm text-gray-900">Edit Profile</p>
                <p className="text-xs text-gray-500">Update your profile information</p>
              </div>
            </button>
            
            <div className="border-t border-gray-100 mt-2 pt-2">
              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-50 hover:text-red-700 transition-all duration-200 ease-in-out text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-2">
                  {isLoggingOut && <Loader2 className="w-4 h-4 animate-spin" />}
                  <div>
                    <p className="text-sm">{isLoggingOut ? 'Logging out...' : 'Logout'}</p>
                    <p className="text-xs text-red-500">Sign out of your account</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close menus */}
      {(showProfileMenu || showProfileSwitch) && (
        <div 
          className="fixed inset-0 z-40 backdrop-blur-sm bg-black/20" 
          onClick={() => {
            setShowProfileMenu(false);
            setShowProfileSwitch(false);
          }}
        />
      )}
      
      {/* App Download Modal */}
      <AppDownloadModal
        isOpen={showAppDownloadModal}
        onClose={() => setShowAppDownloadModal(false)}
        feature={modalFeature}
      />
    </>
  );
}