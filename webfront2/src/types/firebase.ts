import { User } from 'firebase/auth';
import { DocumentData } from 'firebase/firestore';

// Firebase Auth Types
export interface FirebaseUser extends User {
  // Add any custom properties you might need
}

// Firebase Storage Types
export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
}

export interface StorageMetadata {
  contentType?: string;
  customMetadata?: Record<string, string>;
}

// Firebase Firestore Types
export interface FirestoreDocument {
  id: string;
  data: DocumentData;
  createdAt?: Date;
  updatedAt?: Date;
}

// Firebase Messaging Types
export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
}

// Firebase Error Types
export interface FirebaseError {
  code: string;
  message: string;
  details?: any;
}

// Firebase Configuration Types
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Firebase Context Types
export interface FirebaseContextType {
  auth: any;
  storage: any;
  db: any;
  messaging: any;
  analytics: any;
  user: FirebaseUser | null;
  loading: boolean;
}

// Firebase Service Types
export interface AuthService {
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (user: User, profileData: any) => Promise<void>;
}

export interface StorageService {
  uploadFile: (file: File, path: string, metadata?: any) => Promise<any>;
  getDownloadURL: (path: string) => Promise<string>;
  deleteFile: (path: string) => Promise<void>;
  uploadImage: (file: File, userId: string, folder?: string) => Promise<string>;
}

export interface FirestoreService {
  createDoc: (collectionName: string, docId: string, data: any) => Promise<void>;
  getDoc: (collectionName: string, docId: string) => Promise<DocumentData | undefined>;
  updateDoc: (collectionName: string, docId: string, data: any) => Promise<void>;
  deleteDoc: (collectionName: string, docId: string) => Promise<void>;
  queryDocs: (collectionName: string, constraints?: any[], orderByField?: string, orderDirection?: 'asc' | 'desc', limitCount?: number) => Promise<any>;
  queryByField: (collectionName: string, field: string, operator: any, value: any) => Promise<any>;
}

// Firebase Hook Types
export interface AuthState {
  user: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

export interface StorageState {
  uploading: boolean;
  error: string | null;
  progress: number;
}

export interface FirestoreState {
  loading: boolean;
  error: string | null;
  data: DocumentData | null;
}
