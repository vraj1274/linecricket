// Firebase exports
export { analytics, default as app, auth, db, messaging, storage } from './config';

// Services
export { authService, firebaseUtils, firestoreService, storageService } from '../services/firebase';
export { messagingService } from '../services/firebaseMessaging';

// Hooks
export { useFirebaseAuth } from '../hooks/useFirebaseAuth';
export { useFirebaseStorage } from '../hooks/useFirebaseStorage';
export { useFirestore } from '../hooks/useFirestore';

// Context
export { FirebaseProvider, useFirebase } from '../contexts/FirebaseContext';

// Types
export * from '../types/firebase';

