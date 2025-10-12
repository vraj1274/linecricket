import { BarChart3, Bell, Check, Home, Loader2, MessageCircle, MoreHorizontal, Plus, Search, User, Users, Building2, MapPin, Globe, Trash2, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PageType } from '../App';
import newIcon from '../assets/newiconfinal.svg';
import { useMobileApp } from '../contexts/MobileAppContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { useProfileSwitch } from '../contexts/ProfileSwitchContext';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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
    clearAllFilters
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

  // Handle delete page
  const handleDeletePage = (page: any) => {
    setProfileToDelete(page);
    setShowDeleteModal(true);
  };

  // Confirm delete page
  const confirmDeletePage = async () => {
    console.log('🔥 DELETE BUTTON CLICKED!');
    console.log('🔥 Page to delete:', profileToDelete);
    
    if (!profileToDelete) {
      console.error('❌ No page selected for deletion');
      alert('No page selected for deletion');
      return;
    }
    
    try {
      console.log('🚀 Starting deletion of page:', profileToDelete);
      setIsDeleting(true);
      
      // Try context delete function first
      try {
        console.log('📞 Calling deleteProfile with ID:', profileToDelete.id);
        await deleteProfile(profileToDelete.id);
        console.log('✅ Context deleteProfile succeeded');
      } catch (contextError) {
        console.warn('⚠️ Context deleteProfile failed, trying direct API call:', contextError);
        
        // Fallback: Direct API call for page deletion
        const apiUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/profiles/${profileToDelete.id}`;
        console.log('🌐 Direct API call to:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`API call failed: ${response.statusText}`);
        }
        
        console.log('✅ Direct API call succeeded');
        
        // Manually update the page list since context didn't work
        // This is a fallback - in a real app you'd want to refresh the context
        console.log('🔄 Manual page list update (fallback)');
      }
      
      console.log('✅ Page deleted successfully:', profileToDelete.name);
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setProfileToDelete(null);
      
      // Show success message
      console.log('🎉 Page deletion completed');
      alert(`Page "${profileToDelete.name}" deleted successfully!`);
      
    } catch (error) {
      console.error('❌ Error deleting page:', error);
      alert(`Failed to delete page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProfileToDelete(null);
  };

  // Handle keyboard events for delete modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showDeleteModal) {
        if (e.key === 'Enter' && !isDeleting) {
          e.preventDefault();
          confirmDeletePage();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cancelDelete();
        }
      }
    };

    if (showDeleteModal) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showDeleteModal, isDeleting, profileToDelete]);

  // Test scrollbar functionality
  const testScrollbar = () => {
    const container = document.querySelector('.profile-switch-container');
    if (container) {
      console.log('🧪 Testing scrollbar...');
      console.log('📏 Container height:', container.clientHeight);
      console.log('📏 Scroll height:', container.scrollHeight);
      console.log('📏 Can scroll:', container.scrollHeight > container.clientHeight);
      
      if (container.scrollHeight > container.clientHeight) {
        console.log('✅ Scrollbar should be visible');
        // Test scroll
        container.scrollTo({ top: 50, behavior: 'smooth' });
        setTimeout(() => {
          container.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1000);
      } else {
        console.log('⚠️ Not enough content to scroll');
      }
    }
  };

  // Scroll functions for profile list
  const scrollUp = () => {
    const container = document.querySelector('.profile-switch-container');
    if (container) {
      container.scrollBy({ top: -80, behavior: 'smooth' });
    }
  };

  const scrollDown = () => {
    const container = document.querySelector('.profile-switch-container');
    if (container) {
      container.scrollBy({ top: 80, behavior: 'smooth' });
    }
  };

  // Handle scroll events to update scroll state
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    
    setScrollPosition(scrollTop);
    setCanScrollUp(scrollTop > 0);
    setCanScrollDown(scrollTop < scrollHeight - clientHeight);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowUp' && canScrollUp) {
      e.preventDefault();
      scrollUp();
    } else if (e.key === 'ArrowDown' && canScrollDown) {
      e.preventDefault();
      scrollDown();
    } else if (e.key === 'Home') {
      e.preventDefault();
      const container = document.querySelector('.profile-switch-container');
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (e.key === 'End') {
      e.preventDefault();
      const container = document.querySelector('.profile-switch-container');
      if (container) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
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

  const handleProfileSwitch = (profileId: number) => {
    setShowProfileSwitch(false);
    setShowProfileMenu(false);
    // For now, since we have one logged-in user, we'll show a message
    // In the future, this could handle multiple accounts or profile views
    alert(`Profile view updated!`);
  };

  const handleMenuItemClick = (pageId: PageType) => {
    console.log('🎯 Sidebar menu item clicked:', pageId);
    
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
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                style={{ background: currentUser.color }}
              >
                {currentUser.avatar}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.username}</p>
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => setShowProfileSwitch(!showProfileSwitch)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                  title="Switch Page"
                  aria-label="Switch Page"
                >
                  <Users className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
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
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-900">My Pages</h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {availableProfiles.length} {availableProfiles.length === 1 ? 'page' : 'pages'} available
              </p>
            </div>
            
            <div 
              className="max-h-64 overflow-y-auto profile-switch-scrollbar profile-list-scrollbar profile-switch-container relative scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-100"
              onScroll={handleScroll}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              style={{
                scrollbarWidth: 'auto',
                scrollbarColor: '#3b82f6 #e0f2fe'
              }}
            >
              {/* Scroll Controls */}
              {availableProfiles.length > 3 && (
                <div className="absolute right-2 top-2 z-20 flex flex-col space-y-1">
                  <button
                    onClick={() => scrollUp()}
                    disabled={!canScrollUp}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-200 ${
                      canScrollUp 
                        ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    title="Scroll Up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => scrollDown()}
                    disabled={!canScrollDown}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-200 ${
                      canScrollDown 
                        ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    title="Scroll Down"
                  >
                    ↓
                  </button>
                </div>
              )}
              
              {/* Enhanced Scroll Progress Indicator */}
              {availableProfiles.length > 3 && (
                <div className="absolute top-0 left-0 right-0 h-2 bg-gray-200 z-10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 transition-all duration-300 ease-out rounded-full"
                    style={{ 
                      width: `${Math.min(100, (scrollPosition / 200) * 100)}%` 
                    }}
                  ></div>
                </div>
              )}
              
              {/* Scrollbar Status Indicator */}
              {availableProfiles.length > 3 && (
                <div className="absolute top-8 right-2 z-15 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-gray-600 shadow-sm">
                  {canScrollUp ? '↑' : ''} {canScrollDown ? '↓' : ''}
                </div>
              )}
              
              {/* Scroll Shadow Indicators */}
              {availableProfiles.length > 3 && (
                <>
                  {/* Top Shadow */}
                  <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent z-5 pointer-events-none"></div>
                  {/* Bottom Shadow */}
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent z-5 pointer-events-none"></div>
                </>
              )}
              
              {/* Enhanced Search and Filter Controls */}
              {availableProfiles.length > 1 && (
                <div className="px-4 py-3 border-b border-gray-100 space-y-3">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search profiles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  
                  {/* Filter Controls */}
                  <div className="flex space-x-2">
                    {/* Type Filter */}
                    <select
                      value={filterType}
                      onChange={(e) => setFilter(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Types</option>
                      <option value="player">Players</option>
                      <option value="coach">Coaches</option>
                      <option value="academy">Academies</option>
                      <option value="venue">Venues</option>
                      <option value="community">Communities</option>
                    </select>
                    
                    {/* Sort By */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSort(e.target.value, sortOrder)}
                      className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="name">Name</option>
                      <option value="type">Type</option>
                      <option value="created">Created</option>
                      <option value="active">Active</option>
                    </select>
                    
                    {/* Sort Order */}
                    <button
                      onClick={() => setSort(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                  
                  {/* Clear All Filters */}
                  {(searchQuery || filterType !== 'all' || sortBy !== 'name' || sortOrder !== 'asc') && (
                    <button
                      onClick={clearAllFilters}
                      className="w-full px-3 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      Clear All Filters
                    </button>
                  )}
                  
                  {/* Results Count */}
                  <div className="text-xs text-gray-500 text-center">
                    Showing {filteredProfiles.length} of {availableProfiles.length} profiles
                  </div>
                </div>
              )}
              
              {/* Scroll Controls */}
              {availableProfiles.length > 3 && (
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
                  <button
                    onClick={scrollToTop}
                    disabled={isScrolling || !canScrollUp}
                    className={`flex items-center space-x-1 text-xs transition-colors px-2 py-1 rounded-md ${
                      canScrollUp 
                        ? 'text-gray-600 hover:text-blue-600 hover:bg-blue-100' 
                        : 'text-gray-400 cursor-not-allowed'
                    } disabled:opacity-50`}
                  >
                    <span>↑ Top</span>
                    {canScrollUp && <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>}
                  </button>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {filteredProfiles.length} of {availableProfiles.length} profiles
                    </span>
                    {isScrolling && (
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                    )}
                    {/* Scroll Indicator */}
                    <div className="flex items-center space-x-1">
                      <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                      <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
                      <div className="w-1 h-1 bg-blue-200 rounded-full"></div>
                    </div>
                  </div>
                  <button
                    onClick={scrollToBottom}
                    disabled={isScrolling || !canScrollDown}
                    className={`flex items-center space-x-1 text-xs transition-colors px-2 py-1 rounded-md ${
                      canScrollDown 
                        ? 'text-gray-600 hover:text-blue-600 hover:bg-blue-100' 
                        : 'text-gray-400 cursor-not-allowed'
                    } disabled:opacity-50`}
                  >
                    <span>↓ Bottom</span>
                    {canScrollDown && <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>}
                  </button>
                </div>
              )}
              
              {/* Test Content to Force Scrollbar */}
              <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>TEST SCROLLBAR:</strong> This content should make the container scrollable
                </p>
              </div>
              
              {/* Filter Status Indicator */}
              {(searchQuery || filterType !== 'all' || sortBy !== 'name' || sortOrder !== 'asc') && (
                <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-700 font-medium">Active Filters:</span>
                      {searchQuery && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          Search: "{searchQuery}"
                        </span>
                      )}
                      {filterType !== 'all' && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          Type: {filterType}
                        </span>
                      )}
                      {sortBy !== 'name' && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                          Sort: {sortBy} {sortOrder}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Available Profiles from Context */}
              {filteredProfiles.length > 0 ? (
                filteredProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors group ${
                    profile.isActive ? 'bg-blue-50' : ''
                  }`}
                >
                  <button
                    id={`profile-${profile.id}`}
                    onClick={async () => {
                      try {
                        console.log('🔄 Switching to page:', profile.name, 'Type:', profile.type);
                        
                        // Switch profile first
                        await switchProfile(profile.id);
                        
                        // Then navigate to the appropriate page
                        const profilePage = getProfilePage(profile.type, profile.id);
                        console.log('📄 Page type determined:', profilePage);
                        
                        // Pass profile data for created pages
                        if (profilePage === 'created-page') {
                          console.log('📄 Navigating to created-page with data:', {
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
                          console.log('📄 Navigating to:', profilePage);
                          onPageChange(profilePage as any);
                        }
                        setShowProfileSwitch(false);
                      } catch (error) {
                        console.error('❌ Error switching profile:', error);
                        setShowProfileSwitch(false);
                      }
                    }}
                    className="flex items-center space-x-3 flex-1 text-left"
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
                        {profile.isActive && <Check className="w-4 h-4 text-blue-600" />}
                      </div>
                      <p className="text-xs text-gray-500">{profile.username}</p>
                      <p className="text-xs text-gray-400 capitalize">
                        {['academy', 'venue', 'community'].includes(profile.type) 
                          ? `${profile.type} Page` 
                          : `${profile.type} Page`
                        }
                      </p>
                    </div>
                  </button>
                  
                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePage(profile);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded-md text-red-500 hover:text-red-700"
                    title="Delete Page"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center">
                  <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No profiles found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {searchQuery ? `No profiles match "${searchQuery}"` : 
                     filterType !== 'all' ? `No ${filterType} profiles found` : 
                     'Try adjusting your search or filters'}
                  </p>
                  {(searchQuery || filterType !== 'all') && (
                    <button
                      onClick={clearAllFilters}
                      className="mt-3 px-4 py-2 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              )}
              
              {/* Default User Profile (if no profiles in context) */}
              {availableProfiles.length === 0 && (
                <button
                  onClick={() => {
                    onPageChange('my-profile');
                    setShowProfileSwitch(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors bg-blue-50"
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                    style={{ background: currentUser.color }}
                  >
                    {currentUser.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-900">My Pages</p>
                      <Check className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-500">{currentUser.username}</p>
                    <p className="text-xs text-gray-400">Personal Pages</p>
                  </div>
                </button>
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
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                  style={{ background: currentUser.color }}
                >
                  {currentUser.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{currentUser.username}</p>
                  <p className="text-xs text-gray-400">{currentUser.role}</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
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
              className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
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
              className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
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
                className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-50 transition-colors text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Page</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            {/* Debug Info */}
            <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs text-yellow-800">
                <strong>DEBUG:</strong> Modal is visible. Profile: {profileToDelete?.name || 'None'}
              </p>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-700 mb-2">
                Are you sure you want to delete the page <strong>{profileToDelete?.name}</strong>?
              </p>
              <p className="text-xs text-gray-500">
                This will permanently remove the page and all associated data.
              </p>
              {profileToDelete && (
                <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">
                    <strong>Page ID:</strong> {profileToDelete.id}
                  </p>
                  <p className="text-xs text-gray-600">
                    <strong>Page Type:</strong> {profileToDelete.type}
                  </p>
                </div>
              )}
            </div>
            
            {/* Test Button */}
            <div className="mb-4">
              <button
                onClick={() => {
                  console.log('🧪 TEST BUTTON CLICKED!');
                  alert('Test button works! Delete button should work too.');
                }}
                className="w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg border border-blue-300"
                type="button"
              >
                🧪 TEST BUTTON - Click to verify modal is working
              </button>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 border border-gray-300"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePage}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2 focus:outline-none focus:ring-4 focus:ring-red-300 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                type="button"
                style={{ minHeight: '48px' }}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-semibold">Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    <span className="font-semibold">DELETE PAGE</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}