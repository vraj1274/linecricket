import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  data?: any;
  timestamp?: string;
}

const BackendIntegrationTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [serverStatus, setServerStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const [connectionInfo, setConnectionInfo] = useState<any>(null);

  // Test data states
  const [postData, setPostData] = useState({
    content: 'Test post from frontend integration test',
    image_url: 'https://example.com/test-image.jpg',
    location: 'Test Location'
  });

  const [matchData, setMatchData] = useState({
    title: 'Test Match - Frontend Integration',
    description: 'Test match created from frontend integration test',
    match_type: 't20',
    location: 'Test Cricket Ground',
    venue: 'Test Venue',
    match_date: '2024-12-25',
    match_time: '10:00',
    players_needed: 22,
    entry_fee: 100.0,
    is_public: true,
    skill_level: 'all_levels',
    equipment_provided: true,
    rules: 'Standard cricket rules apply'
  });

  const [profileData, setProfileData] = useState({
    full_name: 'Updated Test Integration User',
    bio: 'Updated bio for integration testing',
    location: 'Updated Test City',
    age: 26,
    gender: 'Male',
    contact_number: '+9876543210'
  });

  const updateTestResult = (name: string, status: TestResult['status'], message?: string, data?: any) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.name === name);
      if (existing) {
        return prev.map(r => 
          r.name === name 
            ? { ...r, status, message, data, timestamp: new Date().toISOString() }
            : r
        );
      } else {
        return [...prev, { name, status, message, data, timestamp: new Date().toISOString() }];
      }
    });
  };

  const testServerConnection = async () => {
    updateTestResult('Server Connection', 'running');
    try {
      const result = await apiService.testServerConnection();
      if (result.isConnected) {
        setServerStatus('connected');
        setConnectionInfo(result);
        updateTestResult('Server Connection', 'success', `Connected in ${result.responseTime}ms`, result);
      } else {
        setServerStatus('disconnected');
        updateTestResult('Server Connection', 'error', result.error, result);
      }
    } catch (error) {
      setServerStatus('disconnected');
      updateTestResult('Server Connection', 'error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testPostCreation = async () => {
    updateTestResult('Post Creation', 'running');
    try {
      const result = await apiService.createPost(postData);
      updateTestResult('Post Creation', 'success', 'Post created successfully', result);
    } catch (error) {
      updateTestResult('Post Creation', 'error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testMatchCreation = async () => {
    updateTestResult('Match Creation', 'running');
    try {
      const result = await apiService.createMatch(matchData);
      updateTestResult('Match Creation', 'success', 'Match created successfully', result);
    } catch (error) {
      updateTestResult('Match Creation', 'error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testProfileUpdate = async () => {
    updateTestResult('Profile Update', 'running');
    try {
      const result = await apiService.updateUserProfile(profileData);
      updateTestResult('Profile Update', 'success', 'Profile updated successfully', result);
    } catch (error) {
      updateTestResult('Profile Update', 'error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testDataRetrieval = async () => {
    updateTestResult('Data Retrieval', 'running');
    try {
      const [posts, matches, profile] = await Promise.all([
        apiService.getPosts(1, 10),
        apiService.getMatches('all', 'all', 1, 10),
        apiService.getCurrentUserProfile()
      ]);
      
      const data = {
        posts: posts.posts?.length || 0,
        matches: matches.matches?.length || 0,
        profile: profile.user ? 'Found' : 'Not found'
      };
      
      updateTestResult('Data Retrieval', 'success', 'Data retrieved successfully', data);
    } catch (error) {
      updateTestResult('Data Retrieval', 'error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      // Test server connection first
      await testServerConnection();
      
      if (serverStatus === 'connected') {
        // Run all tests in sequence
        await testPostCreation();
        await testMatchCreation();
        await testProfileUpdate();
        await testDataRetrieval();
      }
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  useEffect(() => {
    testServerConnection();
  }, []);

  const successCount = testResults.filter(r => r.status === 'success').length;
  const errorCount = testResults.filter(r => r.status === 'error').length;
  const totalTests = testResults.length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Backend Integration Test
          </CardTitle>
          <CardDescription>
            Test the complete frontend-backend integration for posts, matches, and profile editing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Server Status */}
          <div className="flex items-center gap-4">
            <Badge 
              variant="outline" 
              className={
                serverStatus === 'connected' 
                  ? 'bg-green-100 text-green-800 border-green-200' 
                  : serverStatus === 'disconnected'
                  ? 'bg-red-100 text-red-800 border-red-200'
                  : 'bg-gray-100 text-gray-800 border-gray-200'
              }
            >
              {serverStatus === 'connected' ? 'Connected' : serverStatus === 'disconnected' ? 'Disconnected' : 'Unknown'}
            </Badge>
            {connectionInfo && (
              <span className="text-sm text-gray-600">
                Response time: {connectionInfo.responseTime}ms
              </span>
            )}
          </div>

          {/* Test Controls */}
          <div className="flex gap-2">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            <Button 
              onClick={testServerConnection} 
              variant="outline"
              disabled={isRunning}
            >
              Test Connection
            </Button>
          </div>

          {/* Test Results Summary */}
          {totalTests > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{successCount}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalTests}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          )}

          {/* Test Results */}
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <div className="font-medium">{result.name}</div>
                    {result.message && (
                      <div className="text-sm text-gray-600">{result.message}</div>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className={getStatusColor(result.status)}>
                  {result.status}
                </Badge>
              </div>
            ))}
          </div>

          {/* Test Data Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Post Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Post Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label htmlFor="post-content">Content</Label>
                  <Textarea
                    id="post-content"
                    value={postData.content}
                    onChange={(e) => setPostData(prev => ({ ...prev, content: e.target.value }))}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="post-location">Location</Label>
                  <Input
                    id="post-location"
                    value={postData.location}
                    onChange={(e) => setPostData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Match Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Match Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label htmlFor="match-title">Title</Label>
                  <Input
                    id="match-title"
                    value={matchData.title}
                    onChange={(e) => setMatchData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="match-type">Type</Label>
                  <Select
                    value={matchData.match_type}
                    onValueChange={(value) => setMatchData(prev => ({ ...prev, match_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="t20">T20</SelectItem>
                      <SelectItem value="odi">ODI</SelectItem>
                      <SelectItem value="test">Test</SelectItem>
                      <SelectItem value="practice">Practice</SelectItem>
                      <SelectItem value="tournament">Tournament</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="match-location">Location</Label>
                  <Input
                    id="match-location"
                    value={matchData.location}
                    onChange={(e) => setMatchData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Profile Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Profile Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label htmlFor="profile-name">Full Name</Label>
                  <Input
                    id="profile-name"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="profile-bio">Bio</Label>
                  <Textarea
                    id="profile-bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="profile-location">Location</Label>
                  <Input
                    id="profile-location"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Individual Test Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button 
              onClick={testPostCreation} 
              disabled={isRunning}
              variant="outline"
              size="sm"
            >
              Test Post
            </Button>
            <Button 
              onClick={testMatchCreation} 
              disabled={isRunning}
              variant="outline"
              size="sm"
            >
              Test Match
            </Button>
            <Button 
              onClick={testProfileUpdate} 
              disabled={isRunning}
              variant="outline"
              size="sm"
            >
              Test Profile
            </Button>
            <Button 
              onClick={testDataRetrieval} 
              disabled={isRunning}
              variant="outline"
              size="sm"
            >
              Test Retrieval
            </Button>
          </div>

          {/* Results Alert */}
          {totalTests > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {successCount === totalTests ? (
                  <span className="text-green-600">
                    ✅ All tests passed! Frontend-backend integration is working correctly.
                  </span>
                ) : (
                  <span className="text-red-600">
                    ⚠️ {errorCount} test(s) failed. Check the details above for issues.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BackendIntegrationTest;


