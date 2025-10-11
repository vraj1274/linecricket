import { User, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { authService } from '../services/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useFirebaseAuth = () => {
  const { auth, isOnline, networkError, retryConnection } = useFirebase();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth, 
      (user) => {
        setAuthState({
          user,
          loading: false,
          error: null,
        });
      },
      (error) => {
        console.error('Auth state change error:', error);
        setAuthState({
          user: null,
          loading: false,
          error: error.message || 'Authentication error occurred',
        });
      }
    );

    return () => unsubscribe();
  }, [auth]);

  // Update error state when network status changes
  useEffect(() => {
    if (!isOnline && networkError) {
      setAuthState(prev => ({
        ...prev,
        error: networkError,
      }));
    } else if (isOnline && authState.error === networkError) {
      setAuthState(prev => ({
        ...prev,
        error: null,
      }));
    }
  }, [isOnline, networkError, authState.error]);

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const result = await authService.signIn(email, password);
      return result;
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Sign in failed' 
      }));
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const result = await authService.signUp(email, password);
      return result;
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Sign up failed' 
      }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.signOut();
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Sign out failed' 
      }));
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.resetPassword(email);
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Password reset failed' 
      }));
      throw error;
    }
  };

  const updateProfile = async (profileData: {
    displayName?: string;
    photoURL?: string;
  }) => {
    if (!authState.user) {
      throw new Error('No user logged in');
    }

    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.updateUserProfile(authState.user, profileData);
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Profile update failed' 
      }));
      throw error;
    }
  };

  const retryAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await retryConnection();
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Retry failed' 
      }));
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    retryAuth,
    isOnline,
    networkError,
  };
};
