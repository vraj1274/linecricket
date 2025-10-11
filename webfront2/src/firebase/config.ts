// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";
import { getStorage } from "firebase/storage";
import { validateFirebaseConfig } from "../utils/firebaseConfigValidator";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAhYsXZwSjfA3LfMK23eGsKCIqVSr2aeI4",
  authDomain: "linecricket-1a2b3.firebaseapp.com",
  projectId: "linecricket-1a2b3",
  storageBucket: "linecricket-1a2b3.firebasestorage.app",
  messagingSenderId: "1080197808632",
  appId: "1:1080197808632:web:e7fb0380a8f6a698d3d60d",
  measurementId: "G-5JLRKNPDX3"
};

// Validate Firebase configuration
const configValidation = validateFirebaseConfig(firebaseConfig);
if (!configValidation.isValid) {
  console.warn('Firebase configuration validation failed:', configValidation.errors);
  // Don't throw error, just log warning
  // throw new Error(`Firebase configuration is invalid: ${configValidation.errors.join(', ')}`);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
