import { Analytics } from 'firebase/analytics';
import { Auth, User } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { Messaging } from 'firebase/messaging';
import { FirebaseStorage } from 'firebase/storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { analytics, auth, db, messaging, storage } from '../firebase/config';
import { authService } from '../services/firebase';

interface FirebaseContextType {
  auth: Auth;
  storage: FirebaseStorage;
  db: Firestore;
  messaging: Messaging;
  analytics: Analytics | null;
  user: User | null;
  loading: boolean;
  isOnline: boolean;
  networkError: string | null;
  retryConnection: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // Check network connectivity
  const checkNetworkStatus = async () => {
    try {
      const online = await authService.isOnline();
      setIsOnline(online);
      if (online) {
        setNetworkError(null);
      }
    } catch (error) {
      console.warn('Network check failed:', error);
      setIsOnline(false);
      setNetworkError('Network connection failed');
    }
  };

  // Retry connection
  const retryConnection = async () => {
    setLoading(true);
    setNetworkError(null);
    await checkNetworkStatus();
    setLoading(false);
  };

  useEffect(() => {
    // Initial network check
    checkNetworkStatus();

    // Set up network status monitoring
    const handleOnline = () => {
      setIsOnline(true);
      setNetworkError(null);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setNetworkError('You are offline. Please check your internet connection.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up auth state listener with error handling
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        setUser(user);
        setLoading(false);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setLoading(false);
        if ((error as any).code === 'auth/network-request-failed') {
          setNetworkError('Network connection failed. Please check your internet connection.');
          setIsOnline(false);
        }
      }
    );

    // Periodic network check
    const networkCheckInterval = setInterval(checkNetworkStatus, 30000); // Check every 30 seconds

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(networkCheckInterval);
    };
  }, []);

  const value: FirebaseContextType = {
    auth,
    storage,
    db,
    messaging,
    analytics,
    user,
    loading,
    isOnline,
    networkError,
    retryConnection,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseContextType => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
