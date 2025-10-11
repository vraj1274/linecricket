import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase/config';

// VAPID key for web push notifications (you'll need to get this from Firebase Console)
const VAPID_KEY = 'YOUR_VAPID_KEY_HERE'; // Replace with your actual VAPID key

export const messagingService = {
  // Request permission for notifications
  requestPermission: async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    const permission = await Notification.requestPermission();
    return permission;
  },

  // Get FCM token
  getToken: async (): Promise<string | null> => {
    try {
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      });
      return token;
    } catch (error) {
      console.error('An error occurred while retrieving token:', error);
      return null;
    }
  },

  // Listen for foreground messages
  onMessage: (callback: (payload: any) => void) => {
    return onMessage(messaging, callback);
  },

  // Initialize messaging
  initialize: async (): Promise<string | null> => {
    try {
      const permission = await messagingService.requestPermission();
      
      if (permission === 'granted') {
        const token = await messagingService.getToken();
        console.log('FCM Token:', token);
        return token;
      } else {
        console.log('Notification permission denied');
        return null;
      }
    } catch (error) {
      console.error('Error initializing messaging:', error);
      return null;
    }
  },

  // Send token to your backend server
  sendTokenToServer: async (token: string, userId: string) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/fcm-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send token to server');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending token to server:', error);
      throw error;
    }
  },
};
