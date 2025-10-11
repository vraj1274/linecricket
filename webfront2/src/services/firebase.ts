import {
    AuthError,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    User,
    UserCredential
} from 'firebase/auth';
import {
    collection,
    deleteDoc,
    doc,
    DocumentData,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    QuerySnapshot,
    setDoc,
    updateDoc,
    where,
} from 'firebase/firestore';
import {
    deleteObject,
    getDownloadURL,
    ref,
    uploadBytes,
    UploadResult,
} from 'firebase/storage';
import { auth, db, storage } from '../firebase/config';

// Network error handling utilities
const isNetworkError = (error: any): boolean => {
  return error?.code === 'auth/network-request-failed' || 
         error?.message?.includes('network') ||
         error?.message?.includes('fetch') ||
         error?.message?.includes('timeout');
};

const isRetryableError = (error: any): boolean => {
  return isNetworkError(error) || 
         error?.code === 'auth/too-many-requests' ||
         error?.code === 'auth/internal-error';
};

// Retry mechanism for network requests
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      if (!isRetryableError(error) || attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
};

// Check network connectivity
const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    const response = await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    return true;
  } catch {
    try {
      // Fallback check
      const response = await fetch('https://firebase.googleapis.com', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      return true;
    } catch {
      return false;
    }
  }
};

// Enhanced error handling
const handleAuthError = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many requests. Please wait a moment and try again.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled. Please contact support.';
    case 'auth/internal-error':
      return 'An internal error occurred. Please try again later.';
    default:
      return error.message || 'An authentication error occurred. Please try again.';
  }
};

// Authentication Services
export const authService = {
  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<UserCredential> => {
    // Check network connectivity first
    const isOnline = await checkNetworkConnectivity();
    if (!isOnline) {
      throw new Error('No internet connection. Please check your network and try again.');
    }

    try {
      return await retryOperation(async () => {
        return await signInWithEmailAndPassword(auth, email, password);
      });
    } catch (error: any) {
      const authError = error as AuthError;
      throw new Error(handleAuthError(authError));
    }
  },

  // Create new user account
  signUp: async (email: string, password: string): Promise<UserCredential> => {
    // Check network connectivity first
    const isOnline = await checkNetworkConnectivity();
    if (!isOnline) {
      throw new Error('No internet connection. Please check your network and try again.');
    }

    try {
      return await retryOperation(async () => {
        return await createUserWithEmailAndPassword(auth, email, password);
      });
    } catch (error: any) {
      const authError = error as AuthError;
      throw new Error(handleAuthError(authError));
    }
  },

  // Sign out current user
  signOut: async (): Promise<void> => {
    try {
      return await retryOperation(async () => {
        return await signOut(auth);
      });
    } catch (error: any) {
      const authError = error as AuthError;
      throw new Error(handleAuthError(authError));
    }
  },

  // Send password reset email
  resetPassword: async (email: string): Promise<void> => {
    // Check network connectivity first
    const isOnline = await checkNetworkConnectivity();
    if (!isOnline) {
      throw new Error('No internet connection. Please check your network and try again.');
    }

    try {
      return await retryOperation(async () => {
        return await sendPasswordResetEmail(auth, email);
      });
    } catch (error: any) {
      const authError = error as AuthError;
      throw new Error(handleAuthError(authError));
    }
  },

  // Update user profile
  updateUserProfile: async (user: User, profileData: {
    displayName?: string;
    photoURL?: string;
  }): Promise<void> => {
    try {
      return await retryOperation(async () => {
        return await updateProfile(user, profileData);
      });
    } catch (error: any) {
      const authError = error as AuthError;
      throw new Error(handleAuthError(authError));
    }
  },

  // Check if user is online
  isOnline: checkNetworkConnectivity,
};

// Storage Services
export const storageService = {
  // Upload file to Firebase Storage
  uploadFile: async (
    file: File,
    path: string,
    metadata?: any
  ): Promise<UploadResult> => {
    const storageRef = ref(storage, path);
    return await uploadBytes(storageRef, file, metadata);
  },

  // Get download URL for a file
  getDownloadURL: async (path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  },

  // Delete file from storage
  deleteFile: async (path: string): Promise<void> => {
    const storageRef = ref(storage, path);
    return await deleteObject(storageRef);
  },

  // Upload image and get URL
  uploadImage: async (
    file: File,
    userId: string,
    folder: string = 'images'
  ): Promise<string> => {
    const timestamp = Date.now();
    const fileName = `${userId}_${timestamp}_${file.name}`;
    const path = `${folder}/${fileName}`;
    
    await storageService.uploadFile(file, path);
    return await storageService.getDownloadURL(path);
  },
};

// Firestore Services
export const firestoreService = {
  // Create document
  createDoc: async (
    collectionName: string,
    docId: string,
    data: any
  ): Promise<void> => {
    const docRef = doc(db, collectionName, docId);
    return await setDoc(docRef, data);
  },

  // Get document
  getDoc: async (collectionName: string, docId: string): Promise<DocumentData | undefined> => {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : undefined;
  },

  // Update document
  updateDoc: async (
    collectionName: string,
    docId: string,
    data: any
  ): Promise<void> => {
    const docRef = doc(db, collectionName, docId);
    return await updateDoc(docRef, data);
  },

  // Delete document
  deleteDoc: async (collectionName: string, docId: string): Promise<void> => {
    const docRef = doc(db, collectionName, docId);
    return await deleteDoc(docRef);
  },

  // Query documents
  queryDocs: async (
    collectionName: string,
    constraints: any[] = [],
    orderByField?: string,
    orderDirection: 'asc' | 'desc' = 'asc',
    limitCount?: number
  ): Promise<QuerySnapshot<DocumentData>> => {
    const collectionRef = collection(db, collectionName);
    let q = query(collectionRef, ...constraints);
    
    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection));
    }
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    return await getDocs(q);
  },

  // Query by field
  queryByField: async (
    collectionName: string,
    field: string,
    operator: any,
    value: any
  ): Promise<QuerySnapshot<DocumentData>> => {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where(field, operator, value));
    return await getDocs(q);
  },
};

// Utility functions
export const firebaseUtils = {
  // Generate unique ID
  generateId: (): string => {
    return doc(collection(db, 'temp')).id;
  },

  // Get current timestamp
  getTimestamp: () => {
    return new Date();
  },

  // Convert Firestore timestamp to Date
  timestampToDate: (timestamp: any): Date => {
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate();
    }
    return new Date(timestamp);
  },
};
