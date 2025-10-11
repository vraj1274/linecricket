# Environment Setup Guide

This guide explains how to configure the frontend to connect to different backend environments.

## Configuration Files

### 1. Environment Configuration (`src/config/environment.ts`)
This file contains all environment-specific settings and automatically detects the current environment.

### 2. API Configuration (`src/config/api.ts`)
This file exports the API base URL and environment flags for use throughout the application.

## Environment Variables

You can override the default API URL by setting environment variables:

### Development
```bash
# Create a .env.development file in the front directory
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_ENV=development
```

### Production
```bash
# Create a .env.production file in the front directory
VITE_API_BASE_URL=https://thelinecricket-socialapp-backend.onrender.com/api
VITE_APP_ENV=production
```

## Current Configuration

- **Default API URL**: `https://thelinecricket-socialapp-backend.onrender.com/api`
- **Environment Detection**: Automatic based on Vite's build mode
- **Debug Logging**: Enabled in development mode

## Testing Backend Connection

Use the `BackendTestComponent` to test the connection:

```tsx
import { BackendTestComponent } from './components/BackendTestComponent';

// In your component
<BackendTestComponent onTestComplete={(results) => {
  console.log('Backend test results:', results);
}} />
```

## Manual Testing

You can also test the backend connection manually:

```typescript
import { runBackendTests } from './utils/backendTest';

// Run all tests
const results = await runBackendTests();
console.log('Test results:', results);
```

## Switching Environments

### For Development
1. Set `VITE_API_BASE_URL=http://localhost:5000/api` in your environment
2. Or modify `src/config/environment.ts` directly

### For Production
1. The default configuration points to the production backend
2. No changes needed for production deployment

## Troubleshooting

### Connection Issues
1. Check if the backend server is running
2. Verify the API URL is correct
3. Check CORS settings on the backend
4. Test network connectivity

### Environment Variables Not Working
1. Ensure variables start with `VITE_`
2. Restart the development server after changing environment variables
3. Check that the `.env` file is in the correct location

## Files Modified

- `src/services/api.ts` - Updated to use new configuration
- `src/config/api.ts` - New API configuration
- `src/config/environment.ts` - New environment configuration
- `src/utils/backendTest.ts` - New backend testing utility
- `src/components/BackendTestComponent.tsx` - New test component
