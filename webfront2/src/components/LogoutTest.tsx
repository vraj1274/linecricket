import React from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

const LogoutTest: React.FC = () => {
  const { user, loading } = useFirebase();
  const { signOut } = useFirebaseAuth();

  const handleTestLogout = async () => {
    try {
      console.log('Testing logout...');
      await signOut();
      console.log('Logout successful!');
    } catch (error) {
      console.error('Logout test failed:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Logout Test</h3>
      {user ? (
        <div>
          <p className="text-green-600 mb-2">✅ User is logged in: {user.email}</p>
          <button
            onClick={handleTestLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Test Logout
          </button>
        </div>
      ) : (
        <p className="text-yellow-600">⚠️ No user logged in</p>
      )}
    </div>
  );
};

export default LogoutTest;
