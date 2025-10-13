// Test authentication for debugging
export const testAuth = async () => {
  console.log('🔍 Testing authentication...');
  
  // Check Firebase auth
  try {
    const { auth } = await import('../firebase/config');
    const user = auth.currentUser;
    console.log('Firebase user:', user ? 'Authenticated' : 'Not authenticated');
    
    if (user) {
      const token = await user.getIdToken();
      console.log('Firebase token length:', token.length);
      console.log('Token preview:', token.substring(0, 20) + '...');
    }
  } catch (error) {
    console.error('Firebase auth error:', error);
  }
  
  // Check localStorage
  const authToken = localStorage.getItem('authToken');
  const firebaseToken = localStorage.getItem('firebaseToken');
  console.log('LocalStorage authToken:', authToken ? 'Present' : 'Not found');
  console.log('LocalStorage firebaseToken:', firebaseToken ? 'Present' : 'Not found');
  
  // Test API call
  try {
    const response = await fetch('http://localhost:5000/api/posts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken || firebaseToken || 'test-token'}`
      }
    });
    console.log('API test response:', response.status, response.statusText);
  } catch (error) {
    console.error('API test error:', error);
  }
};


