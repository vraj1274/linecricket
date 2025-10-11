import React, { useState } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { useFirebaseStorage } from '../hooks/useFirebaseStorage';
import { useFirestore } from '../hooks/useFirestore';

const FirebaseExample: React.FC = () => {
  const { user, signIn, signUp, signOut, loading: authLoading, error: authError } = useFirebaseAuth();
  const { uploadImage, uploading, progress, error: storageError } = useFirebaseStorage();
  const { createDocument, getDocument, loading: firestoreLoading, error: firestoreError } = useFirestore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      console.log('Signed in successfully');
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(email, password);
      console.log('Signed up successfully');
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!file || !user) return;

    try {
      const imageUrl = await uploadImage(file, user.uid, 'example-images');
      console.log('Image uploaded:', imageUrl);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleCreateDocument = async () => {
    if (!user) return;

    try {
      await createDocument('example-collection', user.uid, {
        title: 'Example Document',
        content: 'This is an example document',
        createdAt: new Date(),
        userId: user.uid,
      });
      console.log('Document created successfully');
    } catch (error) {
      console.error('Create document error:', error);
    }
  };

  const handleGetDocument = async () => {
    if (!user) return;

    try {
      const doc = await getDocument('example-collection', user.uid);
      console.log('Document retrieved:', doc);
    } catch (error) {
      console.error('Get document error:', error);
    }
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Firebase Integration Example</h1>

      {/* Authentication Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Authentication</h2>
        
        {user ? (
          <div className="space-y-4">
            <p>Welcome, {user.email}!</p>
            <button
              onClick={handleSignOut}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-2">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
              <div className="space-x-2">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={handleSignUp}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        )}

        {authError && (
          <div className="text-red-500 mt-2">{authError}</div>
        )}
      </div>

      {/* Storage Section */}
      {user && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">File Storage</h2>
          
          <div className="space-y-4">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full p-2 border rounded"
              accept="image/*"
            />
            
            <button
              onClick={handleFileUpload}
              disabled={!file || uploading}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
            >
              {uploading ? `Uploading... ${progress}%` : 'Upload Image'}
            </button>
          </div>

          {storageError && (
            <div className="text-red-500 mt-2">{storageError}</div>
          )}
        </div>
      )}

      {/* Firestore Section */}
      {user && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Firestore Database</h2>
          
          <div className="space-x-2">
            <button
              onClick={handleCreateDocument}
              disabled={firestoreLoading}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
            >
              {firestoreLoading ? 'Creating...' : 'Create Document'}
            </button>
            
            <button
              onClick={handleGetDocument}
              disabled={firestoreLoading}
              className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 disabled:opacity-50"
            >
              {firestoreLoading ? 'Loading...' : 'Get Document'}
            </button>
          </div>

          {firestoreError && (
            <div className="text-red-500 mt-2">{firestoreError}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default FirebaseExample;
