# Firebase Integration Guide

## Quick Start

### 1. Wrap your App with FirebaseProvider

In your `main.tsx` or `App.tsx`:

```typescript
import { FirebaseProvider } from './contexts/FirebaseContext';
import { FirebaseExample } from './components/FirebaseExample';

function App() {
  return (
    <FirebaseProvider>
      <div className="App">
        {/* Your existing components */}
        <FirebaseExample /> {/* Remove this after testing */}
      </div>
    </FirebaseProvider>
  );
}
```

### 2. Use Firebase in your components

```typescript
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import { useFirebaseStorage } from './hooks/useFirebaseStorage';
import { useFirestore } from './hooks/useFirestore';

function MyComponent() {
  const { user, signIn, signOut } = useFirebaseAuth();
  const { uploadImage } = useFirebaseStorage();
  const { createDocument } = useFirestore();

  // Your component logic
}
```

### 3. Import Firebase services directly

```typescript
import { auth, storage, db } from './firebase/config';
import { authService, storageService } from './services/firebase';
```

## Available Services

### Authentication
- `useFirebaseAuth()` - Hook for authentication
- `authService` - Direct service methods
- `auth` - Firebase Auth instance

### Storage
- `useFirebaseStorage()` - Hook for file operations
- `storageService` - Direct service methods
- `storage` - Firebase Storage instance

### Firestore
- `useFirestore()` - Hook for database operations
- `firestoreService` - Direct service methods
- `db` - Firestore instance

### Messaging
- `messagingService` - Push notification service
- `messaging` - Firebase Messaging instance

### Analytics
- `analytics` - Firebase Analytics instance

## Integration with Your Existing Code

Since you're using PostgreSQL for your main database, Firebase is used for:

1. **Authentication** - Replace your current auth with Firebase Auth
2. **File Storage** - Use Firebase Storage for images and files
3. **Push Notifications** - Use Firebase Messaging
4. **Analytics** - Use Firebase Analytics for user tracking

Your PostgreSQL database continues to handle:
- User profiles and data
- Posts and content
- Matches and connections
- Messages and notifications
- All business logic

## Next Steps

1. Replace your current authentication system with Firebase Auth
2. Update file upload functionality to use Firebase Storage
3. Implement push notifications using Firebase Messaging
4. Add analytics tracking using Firebase Analytics
5. Test the integration with the provided example component

## Security Considerations

- Set up proper Firebase security rules
- Keep your Firebase config secure
- Use environment variables for sensitive data
- Implement proper error handling
- Validate all user inputs

## Troubleshooting

- Check browser console for errors
- Verify Firebase project configuration
- Ensure proper permissions are set
- Test with different browsers
- Check network connectivity
