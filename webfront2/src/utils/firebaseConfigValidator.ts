interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export const validateFirebaseConfig = (config: FirebaseConfig): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check required fields
  if (!config.apiKey || config.apiKey.trim() === '') {
    errors.push('API Key is required');
  } else if (!config.apiKey.startsWith('AIza')) {
    errors.push('API Key appears to be invalid (should start with "AIza")');
  }

  if (!config.authDomain || config.authDomain.trim() === '') {
    errors.push('Auth Domain is required');
  } else if (!config.authDomain.includes('.firebaseapp.com')) {
    errors.push('Auth Domain appears to be invalid (should end with ".firebaseapp.com")');
  }

  if (!config.projectId || config.projectId.trim() === '') {
    errors.push('Project ID is required');
  }

  if (!config.storageBucket || config.storageBucket.trim() === '') {
    errors.push('Storage Bucket is required');
  } else if (!config.storageBucket.includes('.firebasestorage.app')) {
    errors.push('Storage Bucket appears to be invalid (should end with ".firebasestorage.app")');
  }

  if (!config.messagingSenderId || config.messagingSenderId.trim() === '') {
    errors.push('Messaging Sender ID is required');
  } else if (!/^\d+$/.test(config.messagingSenderId)) {
    errors.push('Messaging Sender ID should be numeric');
  }

  if (!config.appId || config.appId.trim() === '') {
    errors.push('App ID is required');
  } else if (!config.appId.startsWith('1:')) {
    errors.push('App ID appears to be invalid (should start with "1:")');
  }

  // Check for common configuration issues
  if (config.apiKey === 'your-api-key' || config.apiKey === 'AIzaSyExample') {
    errors.push('API Key appears to be a placeholder value');
  }

  if (config.projectId === 'your-project-id' || config.projectId === 'example-project') {
    errors.push('Project ID appears to be a placeholder value');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const testFirebaseConnection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    // Test basic connectivity to Firebase
    const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    // We expect this to fail with 400 (bad request) but not with network error
    if (response.status === 400) {
      return { success: true };
    }

    return { success: true };
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return { 
        success: false, 
        error: 'Network connection failed. Please check your internet connection.' 
      };
    }
    return { 
      success: false, 
      error: `Connection test failed: ${error.message}` 
    };
  }
};
