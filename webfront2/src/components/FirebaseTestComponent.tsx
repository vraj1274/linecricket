import React from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

const FirebaseTestComponent: React.FC = () => {
  const { user, loading } = useFirebase();
  const { signOut } = useFirebaseAuth();

  if (loading) {
    return <div>Loading Firebase...</div>;
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Firebase Integration Test</h3>
      {user ? (
        <div>
          <p className="text-green-600">✅ Firebase Auth is working!</p>
          <p className="text-sm text-gray-600">User: {user.email}</p>
          <p className="text-sm text-gray-600">UID: {user.uid}</p>
          <button
            onClick={signOut}
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          <p className="text-yellow-600">⚠️ No user logged in</p>
          <p className="text-sm text-gray-600">Try logging in to test Firebase Auth</p>
        </div>
      )}
    </div>
  );
};

export default FirebaseTestComponent;
