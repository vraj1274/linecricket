import React, { useState } from 'react';
import { AcademyCreationForm } from './AcademyCreationForm';
import { AcademyProfileView } from './AcademyProfileView';

export function AcademyCreationTest() {
  const [showForm, setShowForm] = useState(true);
  const [createdAcademyId, setCreatedAcademyId] = useState<string | null>(null);

  const handleAcademyCreated = (academyId: string) => {
    setCreatedAcademyId(academyId);
    setShowForm(false);
  };

  const handleBackToForm = () => {
    setShowForm(true);
    setCreatedAcademyId(null);
  };

  if (showForm) {
    return (
      <AcademyCreationForm 
        onBack={() => console.log('Back clicked')}
        onSuccess={() => {
          // Simulate academy creation success
          const mockAcademyId = 'test-academy-id-' + Date.now();
          handleAcademyCreated(mockAcademyId);
        }}
      />
    );
  }

  if (createdAcademyId) {
    return (
      <AcademyProfileView 
        academyId={createdAcademyId}
        onBack={handleBackToForm}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Academy Creation Test</h2>
        <p className="text-gray-600 mb-6">This is a test component for academy creation flow.</p>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Start Academy Creation
        </button>
      </div>
    </div>
  );
}
