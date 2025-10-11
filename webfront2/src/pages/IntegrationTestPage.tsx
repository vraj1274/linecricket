import React from 'react';
import BackendIntegrationTest from '../components/BackendIntegrationTest';

const IntegrationTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Frontend-Backend Integration Test
          </h1>
          <p className="text-gray-600">
            Test the complete integration between frontend and backend for posts, matches, and profile editing.
          </p>
        </div>
        <BackendIntegrationTest />
      </div>
    </div>
  );
};

export default IntegrationTestPage;


