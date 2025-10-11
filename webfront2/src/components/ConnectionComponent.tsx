import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserMinus, Search, Filter, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import { apiService } from '../services/api';
import { useUserProfile } from '../contexts/UserProfileContext';

interface Connection {
  id: number;
  user_id: number;
  friend_id: number;
  timestamp: string;
  friend: {
    id: number;
    username: string;
    email: string;
    is_verified: boolean;
    is_active: boolean;
  };
}

interface ConnectionStats {
  total_connections: number;
  initiated_connections: number;
  received_connections: number;
}

interface ConnectionSuggestion {
  id: number;
  username: string;
  email: string;
  is_verified: boolean;
  is_active: boolean;
}

export function ConnectionComponent() {
  const { userProfile } = useUserProfile();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [suggestions, setSuggestions] = useState<ConnectionSuggestion[]>([]);
  const [stats, setStats] = useState<ConnectionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'connections' | 'suggestions'>('connections');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (userProfile?.id) {
      loadConnections();
      loadStats();
      loadSuggestions();
    }
  }, [userProfile?.id]);

  const loadConnections = async () => {
    if (!userProfile?.id) return;
    
    try {
      setLoading(true);
      const response = await apiService.getConnections(userProfile.id, 1, 100);
      setConnections(response.connections);
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!userProfile?.id) return;
    
    try {
      const response = await apiService.getConnectionStats(userProfile.id);
      setStats(response.stats);
    } catch (error) {
      console.error('Error loading connection stats:', error);
    }
  };

  const loadSuggestions = async () => {
    if (!userProfile?.id) return;
    
    try {
      const response = await apiService.getConnectionSuggestions(userProfile.id, 10);
      setSuggestions(response.suggestions);
    } catch (error) {
      console.error('Error loading connection suggestions:', error);
    }
  };

  const addConnection = async (friendId: number) => {
    try {
      await apiService.addConnection(friendId);
      
      // Remove from suggestions and add to connections
      setSuggestions(prev => prev.filter(suggestion => suggestion.id !== friendId));
      
      // Reload connections and stats
      loadConnections();
      loadStats();
      
      alert('Connection added successfully!');
    } catch (error) {
      console.error('Error adding connection:', error);
      alert('Failed to add connection. Please try again.');
    }
  };

  const removeConnection = async (friendId: number) => {
    if (!confirm('Are you sure you want to remove this connection?')) return;
    
    try {
      await apiService.removeConnection(friendId);
      
      // Remove from connections
      setConnections(prev => prev.filter(connection => connection.friend_id !== friendId));
      
      // Reload stats
      loadStats();
      
      alert('Connection removed successfully!');
    } catch (error) {
      console.error('Error removing connection:', error);
      alert('Failed to remove connection. Please try again.');
    }
  };

  const checkConnection = async (friendId: number) => {
    try {
      const response = await apiService.checkConnection(friendId);
      return response.data.connected;
    } catch (error) {
      console.error('Error checking connection:', error);
      return false;
    }
  };

  const filteredConnections = connections.filter(connection =>
    connection.friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    connection.friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    suggestion.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-gray-700" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Connections</h1>
            {stats && (
              <p className="text-sm text-gray-500">
                {stats.total_connections} total connections
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_connections}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserPlus className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Initiated</p>
                <p className="text-2xl font-bold text-gray-900">{stats.initiated_connections}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Received</p>
                <p className="text-2xl font-bold text-gray-900">{stats.received_connections}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('connections')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'connections'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Connections ({connections.length})
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'suggestions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Suggestions ({suggestions.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      {activeTab === 'connections' ? (
        <div className="bg-white rounded-lg border border-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              Loading connections...
            </div>
          ) : filteredConnections.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No connections</h3>
              <p className="text-gray-500">
                {searchQuery ? 'No connections match your search.' : "You don't have any connections yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredConnections.map((connection) => (
                <div key={connection.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-slate-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {connection.friend.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {connection.friend.username}
                          </h3>
                          {connection.friend.is_verified && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{connection.friend.email}</p>
                        <p className="text-xs text-gray-400">
                          Connected {new Date(connection.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => removeConnection(connection.friend_id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove connection"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              Loading suggestions...
            </div>
          ) : filteredSuggestions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No suggestions</h3>
              <p className="text-gray-500">
                {searchQuery ? 'No suggestions match your search.' : "No connection suggestions available."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-slate-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {suggestion.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {suggestion.username}
                          </h3>
                          {suggestion.is_verified && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{suggestion.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            suggestion.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {suggestion.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => addConnection(suggestion.id)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Connect</span>
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
