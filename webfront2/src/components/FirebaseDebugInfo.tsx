import { useEffect, useState } from 'react';
import { useUserProfile } from '../contexts/UserProfileContext';
import { auth } from '../firebase/config';

interface FirebaseDebugInfoProps {
  onClose: () => void;
}

export function FirebaseDebugInfo({ onClose }: FirebaseDebugInfoProps) {
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const { userProfile } = useUserProfile();

  useEffect(() => {
    const user = auth.currentUser;
    setFirebaseUser(user);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Firebase Debug Information</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Firebase User Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Firebase User Data</h3>
            <div className="text-sm space-y-1">
              <p><strong>UID:</strong> {firebaseUser?.uid || 'Not available'}</p>
              <p><strong>Email:</strong> {firebaseUser?.email || 'Not available'}</p>
              <p><strong>Display Name:</strong> {firebaseUser?.displayName || 'Not set'}</p>
              <p><strong>Email Verified:</strong> {firebaseUser?.emailVerified ? 'Yes' : 'No'}</p>
              <p><strong>Provider:</strong> {firebaseUser?.providerData?.[0]?.providerId || 'Unknown'}</p>
            </div>
          </div>

          {/* Backend Profile Info */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Backend Profile Data</h3>
            <div className="text-sm space-y-1">
              <p><strong>User ID:</strong> {userProfile?.id || 'Not available'}</p>
              <p><strong>Username:</strong> {userProfile?.username || 'Not available'}</p>
              <p><strong>Full Name:</strong> {userProfile?.profile?.full_name || 'Not set'}</p>
              <p><strong>Email:</strong> {userProfile?.email || 'Not available'}</p>
              <p><strong>Verified:</strong> {userProfile?.is_verified ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {/* Sync Status */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Sync Status</h3>
            <div className="text-sm space-y-1">
              <p><strong>Name Match:</strong> {
                firebaseUser?.displayName === userProfile?.profile?.full_name ? 
                '✅ Match' : 
                '❌ Mismatch'
              }</p>
              <p><strong>Email Match:</strong> {
                firebaseUser?.email === userProfile?.email ? 
                '✅ Match' : 
                '❌ Mismatch'
              }</p>
              <p><strong>Profile Complete:</strong> {
                userProfile?.profile?.full_name ? 
                '✅ Complete' : 
                '❌ Incomplete'
              }</p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Recommendations</h3>
            <div className="text-sm space-y-2">
              {!firebaseUser?.displayName && (
                <p className="text-orange-600">⚠️ Firebase displayName is not set. Consider updating your Firebase profile.</p>
              )}
              {!userProfile?.profile?.full_name && (
                <p className="text-red-600">❌ Backend profile name is missing. The sync may have failed.</p>
              )}
              {firebaseUser?.displayName && firebaseUser?.displayName !== userProfile?.profile?.full_name && (
                <p className="text-blue-600">ℹ️ Names don't match. Try refreshing the profile or re-syncing.</p>
              )}
              {firebaseUser?.displayName && userProfile?.profile?.full_name && firebaseUser?.displayName === userProfile?.profile?.full_name && (
                <p className="text-green-600">✅ Everything looks good! Names are properly synced.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
