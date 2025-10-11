import React, { useState } from 'react';
import { BackendTestResult, runBackendTests } from '../utils/backendTest';

interface BackendTestComponentProps {
  onTestComplete?: (results: { connection: BackendTestResult; auth: BackendTestResult; overall: boolean }) => void;
}

export const BackendTestComponent: React.FC<BackendTestComponentProps> = ({ onTestComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    connection: BackendTestResult;
    auth: BackendTestResult;
    overall: boolean;
  } | null>(null);

  const runTests = async () => {
    setIsLoading(true);
    try {
      const testResults = await runBackendTests();
      setResults(testResults);
      onTestComplete?.(testResults);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Backend Connection Test</h3>
      
      <button
        onClick={runTests}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Testing...' : 'Test Backend Connection'}
      </button>

      {results && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">Overall Status:</span>
            <span className={`px-2 py-1 rounded text-sm ${
              results.overall ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {results.overall ? '✅ Connected' : '❌ Failed'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-medium">Connection:</span>
            <span className={`px-2 py-1 rounded text-sm ${
              results.connection.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {results.connection.success ? '✅ Success' : '❌ Failed'}
            </span>
            {results.connection.responseTime && (
              <span className="text-sm text-gray-600">
                ({results.connection.responseTime}ms)
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-medium">Auth Endpoint:</span>
            <span className={`px-2 py-1 rounded text-sm ${
              results.auth.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {results.auth.success ? '✅ Success' : '❌ Failed'}
            </span>
            {results.auth.responseTime && (
              <span className="text-sm text-gray-600">
                ({results.auth.responseTime}ms)
              </span>
            )}
          </div>

          {!results.overall && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> If tests are failing, check:
              </p>
              <ul className="text-sm text-yellow-700 mt-1 ml-4 list-disc">
                <li>Backend server is running</li>
                <li>CORS settings allow your domain</li>
                <li>Network connectivity</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
