import React, { useEffect, useState } from 'react';
import { Trophy, Plus } from 'lucide-react';
import { AppInstallNotification } from './components/AppInstallNotification';
import { CreateMatchModal } from './components/CreateMatchModal';
import { CreatePage } from './components/CreatePage';
import { EditProfilePage } from './components/EditProfilePage';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { MatchesPage } from './components/MatchesPage';
import { EnhancedMatchesPage } from './components/EnhancedMatchesPage';
import { MessagesPage } from './components/MessagesPage';
import { NetworkErrorBanner } from './components/NetworkErrorBanner';
import NewHomePage from './components/NewHomePage';
import { ComprehensiveProfileCreation } from './components/ComprehensiveProfileCreation';
import { DynamicProfileView } from './components/DynamicProfileView';
import { NotificationsPage } from './components/NotificationsPage';
import { AcademyProfilePage } from './components/AcademyProfilePage';
import { AcademyProfileView } from './components/AcademyProfileView';
import { VenueProfilePage } from './components/VenueProfilePage';
import { CoachProfilePage } from './components/CoachProfilePage';
import { PlayerProfilePage } from './components/PlayerProfilePage';
import { CommunityProfilePage } from './components/CommunityProfilePage';
import { DynamicProfilePage } from './components/DynamicProfilePage';
import { PublicProfilePage } from './components/PublicProfilePage';
import { GenericProfilePage } from './components/GenericProfilePage';
import { SocialProfileView } from './components/SocialProfileView';
import { PageView } from './components/PageView';
import { OTPVerificationPage } from './components/OTPVerificationPage';
import { MyProfilePage } from './components/MyProfilePage';
import { ProfileView } from './components/ProfileView';
import { PersonalInfoPage } from './components/PersonalInfoPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import { SearchPage } from './components/SearchPage';
import { Sidebar } from './components/Sidebar';
import { SignupPage } from './components/SignupPage';
import { UserProfileView } from './components/UserProfileView';
import { CreatedPageView } from './components/CreatedPageView';
import { TestPageView } from './components/TestPageView';
import { FirebaseProvider, useFirebase } from './contexts/FirebaseContext';
import { MobileAppProvider } from './contexts/MobileAppContext';
import { ToastProvider } from './contexts/ToastContext';
import { UserProfileProvider } from './contexts/UserProfileContext';
import { ProfileSwitchProvider } from './contexts/ProfileSwitchContext';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';

export type PageType = 'new-landing' | 'home' | 'search' | 'create' | 'create-page' | 'page-view' | 'matches' | 'notifications' | 'messages' | 'login' | 'signup' | 'edit-profile' | 'profile' | 'personal-info' | 'forgot-password' | 'otp-verification' | 'reset-password' | 'new-profile' | 'academy-profile' | 'venue-profile' | 'coach-profile' | 'player-profile' | 'community-profile' | 'dynamic-profile' | 'public-profile' | 'generic-profile' | 'social-profile' | 'my-profile' | 'created-page' | 'test-page' | 'pitch-profile';

export type ProfileType = 'player' | 'coach' | 'venue' | 'academy' | 'community' | 'pitch';

// Error Boundary Component
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 App Error Boundary caught an error:', error, errorInfo);
    console.error('🚨 Error stack:', error.stack);
    console.error('🚨 Component stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-red-100">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              An unexpected error occurred. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App Content Component that uses Firebase authentication
function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageType>('new-landing');
  const [showCreateMatchModal, setShowCreateMatchModal] = useState(false);
  const [showAppInstallNotification, setShowAppInstallNotification] = useState(false);
  const [showAppDownloadModal, setShowAppDownloadModal] = useState(false);
  const [matchesRefreshTrigger, setMatchesRefreshTrigger] = useState(0);
  const [postsRefreshTrigger, setPostsRefreshTrigger] = useState(0);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [selectedProfileType, setSelectedProfileType] = useState<ProfileType | null>(null);
  const [publicProfileData, setPublicProfileData] = useState<{id: string, type: ProfileType} | null>(null);
  const [genericProfileData, setGenericProfileData] = useState<{id: string, type: ProfileType} | null>(null);
  const [createdPageData, setCreatedPageData] = useState<{id: string, name: string, type: string} | null>(null);
  
  
  // Firebase authentication state
  const { user, loading, isOnline, networkError, retryConnection } = useFirebase();
  const { signOut, retryAuth } = useFirebaseAuth();
  const [showNetworkError, setShowNetworkError] = useState(false);

  // Handle user sign-in (profile sync is now handled in UserProfileContext)
  useEffect(() => {
    if (user) {
      console.log('🚀 User signed in:', user.uid);
      // Profile sync is now handled automatically in UserProfileContext
      // No need to manually trigger sync here
    }
  }, [user]);

  const handleLogin = () => {
    setCurrentPage('home');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setCurrentPage('new-landing');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to landing page even if logout fails
      setCurrentPage('new-landing');
    }
  };

  const handleSignup = () => {
    // After successful signup, redirect to home page
    setCurrentPage('home');
  };

  const handleNavigateToLogin = () => {
    setCurrentPage('login');
  };

  const handleNavigateToSignup = () => {
    setCurrentPage('signup');
  };

  const handleNavigateToCoachProfile = () => {
    setCurrentPage('new-profile');
    setSelectedProfileType('coach');
  };


  const handleProfileTypeSelect = (type: ProfileType) => {
    setSelectedProfileType(type);
  };

  const handleNavigateToForgotPassword = () => {
    setCurrentPage('forgot-password');
  };

  const handleEmailSent = (email: string) => {
    setForgotPasswordEmail(email);
    setCurrentPage('otp-verification');
  };

  const handleOTPVerified = (email: string) => {
    setForgotPasswordEmail(email);
    setCurrentPage('reset-password');
  };

  const handlePasswordReset = () => {
    setCurrentPage('login');
    setForgotPasswordEmail('');
  };

  const handleRetryConnection = async () => {
    await retryAuth();
  };

  const handleDismissNetworkError = () => {
    setShowNetworkError(false);
  };

  const handleProfileClick = (profileId: string, profileType: ProfileType) => {
    setPublicProfileData({ id: profileId, type: profileType });
    setCurrentPage('public-profile');
  };

  const handleGenericProfileClick = (profileId: string, profileType: ProfileType) => {
    if (['academy', 'venue', 'community'].includes(profileType)) {
      // Navigate to page view for pages
      setGenericProfileData({ id: profileId, type: profileType });
      setCurrentPage('page-view');
    } else {
      // Navigate to public profile for user profiles
      setPublicProfileData({ id: profileId, type: profileType });
      setCurrentPage('public-profile');
    }
  };


  // Show network error banner when there's a network issue
  React.useEffect(() => {
    if (networkError && !isOnline) {
      setShowNetworkError(true);
    } else if (isOnline && showNetworkError) {
      // Auto-dismiss after 3 seconds when connection is restored
      setTimeout(() => setShowNetworkError(false), 3000);
    }
  }, [networkError, isOnline, showNetworkError]);

  // Show loading spinner while Firebase is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-lg border border-white/30 shadow-xl">
            <span className="text-2xl">🏏</span>
          </div>
          <h2 className="text-xl text-gray-800 font-semibold">Loading TheLineCricket...</h2>
          <p className="text-gray-600 mt-2">Please wait while we set up your experience</p>
        </div>
      </div>
    );
  }

  // Show authentication pages if user is not logged in
  if (!user) {
    // Allow access to create-page for testing without authentication
    if (currentPage === 'create-page') {
      return <ComprehensiveProfileCreation 
        onBack={() => setCurrentPage('new-landing')} 
        onProfileTypeSelect={handleProfileTypeSelect}
        selectedProfileType={selectedProfileType}
        onNavigateToProfile={handleGenericProfileClick}
        onNavigateToEdit={(profileId, profileType) => {
          setGenericProfileData({ id: profileId, type: profileType });
          setCurrentPage('edit-profile');
        }}
      />;
    }
    
    if (currentPage === 'new-landing') {
      return <NewHomePage onNavigateToLogin={handleNavigateToLogin} onNavigateToSignup={handleNavigateToSignup} onNavigateToCoachProfile={handleNavigateToCoachProfile} />;
    }
    
    if (currentPage === 'login') {
      return <LoginPage 
        onLogin={handleLogin} 
        onSwitchToSignup={() => setCurrentPage('signup')} 
        onForgotPassword={handleNavigateToForgotPassword}
      />;
    }
    
    if (currentPage === 'signup') {
      return <SignupPage onSignup={handleSignup} onSwitchToLogin={() => setCurrentPage('login')} />;
    }

    if (currentPage === 'forgot-password') {
      return <ForgotPasswordPage 
        onBackToLogin={() => setCurrentPage('login')} 
        onEmailSent={handleEmailSent}
      />;
    }

    if (currentPage === 'otp-verification') {
      return <OTPVerificationPage 
        email={forgotPasswordEmail}
        onBackToForgotPassword={() => setCurrentPage('forgot-password')}
        onOTPVerified={handleOTPVerified}
      />;
    }

    if (currentPage === 'reset-password') {
      return <ResetPasswordPage 
        email={forgotPasswordEmail}
        onBackToOTP={() => setCurrentPage('otp-verification')}
        onPasswordReset={handlePasswordReset}
      />;
    }
    
    // Default to new landing page
    return <NewHomePage onNavigateToLogin={handleNavigateToLogin} onNavigateToSignup={handleNavigateToSignup} onNavigateToCoachProfile={handleNavigateToCoachProfile} />;
  }

  const renderMainContent = () => {
    const isAnyPopupVisible = showCreateMatchModal || showAppInstallNotification || showAppDownloadModal;
    
    
    switch (currentPage) {
      case 'home':
        return <HomePage isPopupVisible={isAnyPopupVisible} onProfileClick={handleGenericProfileClick} refreshTrigger={postsRefreshTrigger} />;
      case 'search':
        return <SearchPage />;
      case 'create':
        return <CreatePage onCreatePost={() => {
          setPostsRefreshTrigger(prev => prev + 1);
          setCurrentPage('home');
        }} />;
      case 'create-page':
        return <ComprehensiveProfileCreation 
          onBack={() => setCurrentPage('home')} 
          onProfileTypeSelect={handleProfileTypeSelect}
          selectedProfileType={selectedProfileType}
          onNavigateToProfile={handleGenericProfileClick}
          onNavigateToEdit={(profileId, profileType) => {
            setGenericProfileData({ id: profileId, type: profileType });
            setCurrentPage('edit-profile');
          }}
        />;
      case 'page-view':
        return genericProfileData ? (
          <PageView 
            onBack={() => setCurrentPage('home')} 
            pageId={genericProfileData.id}
            pageType={genericProfileData.type as 'academy' | 'venue' | 'community'}
            onEdit={(pageId, pageType) => {
              setGenericProfileData({ id: pageId, type: pageType as ProfileType });
              setCurrentPage('edit-profile');
            }}
          />
        ) : <HomePage isPopupVisible={isAnyPopupVisible} refreshTrigger={postsRefreshTrigger} />;
      case 'matches':
        return <EnhancedMatchesPage 
          onCreateMatch={() => setShowCreateMatchModal(true)} 
          refreshTrigger={matchesRefreshTrigger}
        />;
      case 'notifications':
        return <NotificationsPage />;
      case 'messages':
        return <MessagesPage />;
      case 'edit-profile':
        return <EditProfilePage onBack={() => setCurrentPage('home')} />;
      case 'profile':
        return <ProfileView 
          onNavigateToPersonalInfo={() => setCurrentPage('personal-info')}
          onNavigateToEditProfile={() => setCurrentPage('edit-profile')}
        />;
      case 'personal-info':
        return <PersonalInfoPage onBack={() => setCurrentPage('profile')} />;
      case 'new-profile':
        return <ComprehensiveProfileCreation 
          onBack={() => setCurrentPage('home')} 
          onProfileTypeSelect={handleProfileTypeSelect}
          selectedProfileType={selectedProfileType}
          onNavigateToProfile={handleGenericProfileClick}
          onNavigateToEdit={(profileId, profileType) => {
            setGenericProfileData({ id: profileId, type: profileType });
            setCurrentPage('edit-profile');
          }}
        />;
      case 'academy-profile':
        return <AcademyProfilePage onBack={() => setCurrentPage('home')} />;
      case 'venue-profile':
        return <VenueProfilePage onBack={() => setCurrentPage('home')} />;
      case 'coach-profile':
        return <CoachProfilePage onBack={() => setCurrentPage('home')} />;
      case 'player-profile':
        return <PlayerProfilePage onBack={() => setCurrentPage('home')} />;
      case 'community-profile':
        return <CommunityProfilePage onBack={() => setCurrentPage('home')} />;
      case 'dynamic-profile':
        return <DynamicProfileView onBack={() => setCurrentPage('home')} />;
      case 'public-profile':
        return publicProfileData ? (
          <PublicProfilePage 
            onBack={() => setCurrentPage('home')} 
            profileId={publicProfileData.id}
            profileType={publicProfileData.type}
          />
        ) : <HomePage isPopupVisible={isAnyPopupVisible} refreshTrigger={postsRefreshTrigger} />;
      case 'generic-profile':
        return genericProfileData ? (
          <GenericProfilePage 
            onBack={() => setCurrentPage('home')} 
            profileId={genericProfileData.id}
            profileType={genericProfileData.type}
          />
        ) : <HomePage isPopupVisible={isAnyPopupVisible} refreshTrigger={postsRefreshTrigger} />;
      case 'social-profile':
        return genericProfileData ? (
          <SocialProfileView 
            onBack={() => setCurrentPage('home')} 
            profileId={genericProfileData.id}
            profileType={genericProfileData.type}
          />
        ) : <HomePage isPopupVisible={isAnyPopupVisible} refreshTrigger={postsRefreshTrigger} />;
      case 'my-profile':
        return <MyProfilePage onBack={() => setCurrentPage('home')} />;
      case 'created-page':
        console.log('Rendering CreatedPageView with data:', createdPageData);
        return <CreatedPageView 
          onBack={() => setCurrentPage('home')} 
          pageId={createdPageData?.id}
          pageName={createdPageData?.name}
          pageType={createdPageData?.type as 'academy' | 'venue' | 'community' | 'club'}
        />;
      case 'test-page':
        console.log('Rendering TestPageView with data:', createdPageData);
        return <TestPageView 
          onBack={() => setCurrentPage('home')} 
          pageId={createdPageData?.id}
          pageName={createdPageData?.name}
          pageType={createdPageData?.type as 'academy' | 'venue' | 'community' | 'club'}
        />;
      case 'signup':
        return <SignupPage onSignup={() => setCurrentPage('home')} onSwitchToLogin={() => setCurrentPage('login')} />;
      default:
        return <HomePage isPopupVisible={isAnyPopupVisible} />;
    }
  };

  return (
    <MobileAppProvider onShowModal={() => setShowAppInstallNotification(true)}>
      <ToastProvider>
        <UserProfileProvider>
          <ProfileSwitchProvider>
          <div className="min-h-screen bg-gray-100 min-w-[1270px]">
        <NetworkErrorBanner
          isVisible={showNetworkError}
          error={networkError}
          isOnline={isOnline}
          onRetry={handleRetryConnection}
          onDismiss={handleDismissNetworkError}
        />

        
        <Sidebar 
          currentPage={currentPage} 
          onPageChange={(page, data) => {
            if (page === 'created-page' && data) {
              setCreatedPageData(data);
            }
            setCurrentPage(page);
          }}
          onLogout={handleLogout}
          onProfileTypeSelect={(type) => handleProfileTypeSelect(type as ProfileType)}
          onAppDownloadModalChange={setShowAppDownloadModal}
        />
        
        <main className={`ml-[270px] min-h-screen p-5 min-w-[600px] bg-white transition-all duration-300 ${showAppDownloadModal ? 'blur-sm' : ''}`}>
          <div className="max-w-[600px] mx-auto">
            {renderMainContent()}
          </div>
        </main>

        {showCreateMatchModal && (
          <CreateMatchModal 
            isVisible={showCreateMatchModal}
            onClose={() => setShowCreateMatchModal(false)} 
            onMatchCreated={() => {
              setShowCreateMatchModal(false);
              setMatchesRefreshTrigger(prev => prev + 1); // Trigger matches refresh
            }}
          />
        )}

        {/* Show App Install Notification only on home page as overlay */}
        {currentPage === 'home' && (
          <AppInstallNotification 
            isVisible={showAppInstallNotification} 
            onClose={() => setShowAppInstallNotification(false)} 
          />
        )}

        {/* Global Floating Action Button for Creating Matches */}
        <button
          onClick={() => setShowCreateMatchModal(true)}
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300 z-40 group"
          style={{ background: 'linear-gradient(135deg, #FF6B33 0%, #2E4B5F 100%)' }}
          title="Create Match"
          aria-label="Create Match"
        >
          <div className="relative">
            <Trophy className="w-7 h-7 group-hover:scale-110 transition-transform duration-300" />
            <Plus className="w-4 h-4 absolute -bottom-1 -right-1 bg-white text-orange-500 rounded-full" />
          </div>
        </button>

        </div>
          </ProfileSwitchProvider>
        </UserProfileProvider>
      </ToastProvider>
    </MobileAppProvider>
  );
}

// Main App Component with Firebase Provider and Error Boundary
export default function App() {
  // Global error handling for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 Unhandled Promise Rejection:', event.reason);
      // Prevent the default browser behavior
      event.preventDefault();
    };

    const handleError = (event: ErrorEvent) => {
      console.error('🚨 Global Error:', event.error);
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <AppErrorBoundary>
      <FirebaseProvider>
        <AppContent />
      </FirebaseProvider>
    </AppErrorBoundary>
  );
}