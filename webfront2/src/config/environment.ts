// Environment Configuration
export const ENV = {
  // API Configuration - Updated to use localhost backend
  API_BASE_URL: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000',
  
  // Environment flags
  IS_DEVELOPMENT: (import.meta as any).env?.DEV || false,
  IS_PRODUCTION: (import.meta as any).env?.PROD || true,
  
  // App Configuration
  APP_NAME: 'TheLineCricket',
  APP_VERSION: '1.0.0',
  
  // Feature flags
  ENABLE_DEBUG_LOGS: (import.meta as any).env?.DEV || false,
  ENABLE_ANALYTICS: (import.meta as any).env?.PROD || true,
};

// Development helpers
if (ENV.IS_DEVELOPMENT) {
  console.log('🚀 TheLineCricket - Development Mode');
  console.log('📡 API Base URL:', ENV.API_BASE_URL);
  console.log('🔧 Debug logs enabled:', ENV.ENABLE_DEBUG_LOGS);
}

// Production helpers
if (ENV.IS_PRODUCTION) {
  console.log('🏏 TheLineCricket - Production Mode');
  console.log('📡 API Base URL:', ENV.API_BASE_URL);
}
