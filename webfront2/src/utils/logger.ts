// Logger utility for consistent logging across the application
export const logger = {
  userAction: (message: string, data?: any) => {
    console.log(`[USER ACTION] ${message}`, data);
  },
  
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },
  
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  },
  
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
  
  profileSync: (message: string, data?: any) => {
    console.log(`[PROFILE SYNC] ${message}`, data);
  },
  
  profileSyncSuccess: (message: string, data?: any) => {
    console.log(`[PROFILE SYNC SUCCESS] ${message}`, data);
  },
  
  profileSyncError: (message: string, error?: any) => {
    console.error(`[PROFILE SYNC ERROR] ${message}`, error);
  }
};
