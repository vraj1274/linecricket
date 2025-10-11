// Backend Connection Test Utility
import { API_BASE_URL } from '../config/api';

export interface BackendTestResult {
  success: boolean;
  status?: number;
  error?: string;
  responseTime?: number;
}

export const testBackendConnection = async (): Promise<BackendTestResult> => {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Testing backend connection to:', API_BASE_URL);
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      console.log('✅ Backend connection successful');
      return {
        success: true,
        status: response.status,
        responseTime,
      };
    } else {
      console.warn('⚠️ Backend responded with error status:', response.status);
      return {
        success: false,
        status: response.status,
        error: `HTTP ${response.status}`,
        responseTime,
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ Backend connection failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime,
    };
  }
};

// Test specific endpoints
export const testAuthEndpoint = async (): Promise<BackendTestResult> => {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Testing auth endpoint...');
    
    const response = await fetch(`${API_BASE_URL}/auth/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });
    
    const responseTime = Date.now() - startTime;
    
    return {
      success: response.ok,
      status: response.status,
      error: response.ok ? undefined : `HTTP ${response.status}`,
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime,
    };
  }
};

// Run all tests
export const runBackendTests = async (): Promise<{
  connection: BackendTestResult;
  auth: BackendTestResult;
  overall: boolean;
}> => {
  console.log('🚀 Running backend connection tests...');
  
  const [connection, auth] = await Promise.all([
    testBackendConnection(),
    testAuthEndpoint(),
  ]);
  
  const overall = connection.success && auth.success;
  
  console.log('📊 Test Results:', {
    connection: connection.success ? '✅' : '❌',
    auth: auth.success ? '✅' : '❌',
    overall: overall ? '✅' : '❌',
  });
  
  return { connection, auth, overall };
};
