# Firebase Setup for LineCricket

This directory contains all Firebase-related configuration and services for the LineCricket application.

## Files Overview

- `config.ts` - Main Firebase configuration and service exports
- `init.ts` - Firebase initialization with emulator support
- `README.md` - This documentation file

## Services Available

### Authentication (`auth`)
- Email/password authentication
- User profile management
- Password reset functionality

### Storage (`storage`)
- File upload and download
- Image storage with automatic URL generation
- File deletion

### Firestore (`db`)
- Document CRUD operations
- Querying with constraints
- Real-time data synchronization

### Messaging (`messaging`)
- Push notifications
- FCM token management
- Foreground message handling

### Analytics (`analytics`)
- User behavior tracking
- Custom event logging
- Performance monitoring

## Usage Examples

### 1. Authentication
```typescript
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

const { user, signIn, signUp, signOut, loading, error } = useFirebaseAuth();

// Sign in
await signIn('user@example.com', 'password');

// Sign up
await signUp('user@example.com', 'password');

// Sign out
await signOut();
```

### 2. Storage
```typescript
import { useFirebaseStorage } from '../hooks/useFirebaseStorage';

const { uploadImage, uploading, progress, error } = useFirebaseStorage();

// Upload image
const imageUrl = await uploadImage(file, userId, 'profile-pictures');
```

### 3. Firestore
```typescript
import { useFirestore } from '../hooks/useFirestore';

const { createDocument, getDocument, queryDocuments } = useFirestore();

// Create document
await createDocument('users', userId, userData);

// Get document
const user = await getDocument('users', userId);

// Query documents
const users = await queryDocuments('users', [], 'createdAt', 'desc', 10);
```

### 4. Messaging
```typescript
import { messagingService } from '../services/firebaseMessaging';

// Initialize messaging
const token = await messagingService.initialize();

// Listen for messages
messagingService.onMessage((payload) => {
  console.log('Message received:', payload);
});
```

## Configuration

The Firebase configuration is set up to use your custom PostgreSQL database for data persistence while using Firebase for:

- Authentication
- File storage
- Push notifications
- Analytics
- Real-time features

## Environment Variables

Make sure to set up the following environment variables in your `.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Security Rules

Make sure to set up proper security rules in your Firebase Console:

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow users to upload files to their own folder
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Integration with PostgreSQL

This Firebase setup is designed to work alongside your existing PostgreSQL database. Firebase is used for:

- User authentication (Firebase Auth)
- File storage (Firebase Storage)
- Push notifications (Firebase Messaging)
- Analytics (Firebase Analytics)

While your PostgreSQL database handles:
- User profiles
- Posts and content
- Matches and connections
- Messages and notifications
- All business logic data

## Troubleshooting

1. **Authentication issues**: Check if the user is properly authenticated before making requests
2. **Storage upload failures**: Verify file size limits and permissions
3. **Firestore errors**: Ensure proper security rules are set up
4. **Messaging not working**: Check if notifications are enabled in the browser

## Support

For Firebase-specific issues, refer to the [Firebase Documentation](https://firebase.google.com/docs).
For application-specific issues, check the main project documentation.
