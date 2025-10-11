import React, { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, MapPin, GraduationCap, Briefcase, Users, Check, X, Loader2, BarChart3 } from 'lucide-react';
import { apiService } from '../services/api';
import { useUserProfile } from '../contexts/UserProfileContext';

interface SearchResult {
  id: number;
  name: string;
  initials: string;
  followers: string;
  type?: string;
  verified?: boolean;
  gradient: string;
  category: string;
  description?: string;
  location?: string;
  isConnected?: boolean;
  isApplied?: boolean;
  isJoined?: boolean;
}

export function SearchPage() {
  const { userProfile } = useUserProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({});
  const [showFilters, setShowFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    skillLevel: '',
    dateRange: '',
    entryFee: '',
    verifiedOnly: false,
    equipmentProvided: false
  });

  const filters = [
    { id: 'all', label: 'All', icon: '🔍', iconComponent: Search },
    { id: 'user', label: 'Users', icon: '👤', iconComponent: UserPlus },
    { id: 'match', label: 'Matches', icon: '🏏', iconComponent: BarChart3 },
    { id: 'post', label: 'Posts', icon: '📝', iconComponent: Search },
    { id: 'location', label: 'Location', icon: '📍', iconComponent: MapPin },
    { id: 'academy', label: 'Academy', icon: '🏫', iconComponent: GraduationCap },
    { id: 'job', label: 'Job', icon: '💼', iconComponent: Briefcase },
    { id: 'coach', label: 'Coach', icon: '👨‍🏫', iconComponent: UserPlus },
    { id: 'community', label: 'Community', icon: '👥', iconComponent: Users },
    { id: 'venue', label: 'Venues', icon: '🏟️', iconComponent: MapPin }
  ];

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string, filter: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          performSearch(query, filter);
        }, 300);
      };
    })(),
    []
  );

  // Perform actual search
  const performSearch = async (query: string, filter: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.searchContent(query, filter);
      if (response.success) {
        // Transform the results to match the expected format
        const transformedResults = (response.results || []).map((result: any) => ({
          id: result.id,
          name: result.name,
          initials: result.initials,
          followers: result.followers,
          type: result.type,
          verified: result.verified,
          gradient: result.gradient,
          category: result.category,
          description: result.description,
          location: result.location,
          isConnected: result.isConnected || false,
          isApplied: result.isApplied || false,
          isJoined: result.isJoined || false
        }));
        setSearchResults(transformedResults);
      } else {
        console.error('Search failed:', response.message);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Load trending/popular content when no search query
  const loadTrendingContent = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTrendingContent(activeFilter);
      if (response.success) {
        // Transform the results to match the expected format
        const transformedResults = (response.results || []).map((result: any) => ({
          id: result.id,
          name: result.name,
          initials: result.initials,
          followers: result.followers,
          type: result.type,
          verified: result.verified,
          gradient: result.gradient,
          category: result.category,
          description: result.description,
          location: result.location,
          isConnected: result.isConnected || false,
          isApplied: result.isApplied || false,
          isJoined: result.isJoined || false
        }));
        setSearchResults(transformedResults);
      }
    } catch (error) {
      console.error('Error loading trending content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      debouncedSearch(query, activeFilter);
    } else {
      loadTrendingContent();
    }
  };

  // Handle filter change
  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    if (searchQuery.trim()) {
      performSearch(searchQuery, filterId);
    } else {
      loadTrendingContent();
    }
  };

  // Handle action buttons
  const handleAction = async (result: SearchResult, action: string) => {
    setActionLoading(prev => ({ ...prev, [result.id]: true }));
    
    try {
      let response;
      switch (action) {
        case 'connect':
          response = await apiService.connectUser(result.id);
          break;
        case 'apply':
          response = await apiService.applyJob(result.id);
          break;
        case 'join':
          response = await apiService.joinCommunity(result.id);
          break;
        default:
          return;
      }

      if (response.success) {
        // Update the result state
        setSearchResults(prev => 
          prev.map(item => 
            item.id === result.id 
              ? { 
                  ...item, 
                  isConnected: action === 'connect' ? true : item.isConnected,
                  isApplied: action === 'apply' ? true : item.isApplied,
                  isJoined: action === 'join' ? true : item.isJoined
                }
              : item
          )
        );
        alert(`${action.charAt(0).toUpperCase() + action.slice(1)} successful!`);
      } else {
        alert(`Failed to ${action}. Please try again.`);
      }
    } catch (error) {
      console.error(`Error ${action}ing:`, error);
      alert(`Failed to ${action}. Please try again.`);
    } finally {
      setActionLoading(prev => ({ ...prev, [result.id]: false }));
    }
  };

  // Load initial content
  useEffect(() => {
    loadTrendingContent();
  }, []);

  // Get current results
  const getCurrentResults = () => {
    return searchResults;
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Search</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        
        <div className="relative">
          <input 
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for players, teams, matches, jobs, communities..." 
            className="w-full bg-white rounded-2xl px-6 py-4 text-lg shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-14"
          />
          {loading ? (
            <Loader2 className="absolute right-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-orange-500 animate-spin" />
          ) : (
            <Search className="absolute right-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
          )}
        </div>
      </div>

      {/* Filter Buttons */}
      {showFilters && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.map((filter) => {
              const IconComponent = filter.iconComponent;
              return (
                <button
                  key={filter.id}
                  onClick={() => handleFilterChange(filter.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeFilter === filter.id
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>
          
          {/* Advanced Filters */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Advanced Filters</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Skill Level Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Skill Level</label>
                <select
                  value={advancedFilters.skillLevel}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, skillLevel: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="professional">Professional</option>
                </select>
              </div>
              
              {/* Date Range Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date Range</label>
                <select
                  value={advancedFilters.dateRange}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Any Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              
                {/* Entry Fee Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Entry Fee</label>
                  <select
                    value={advancedFilters.entryFee}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, entryFee: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Any Price</option>
                    <option value="0">Free</option>
                    <option value="50">Under $50</option>
                    <option value="100">$50 - $100</option>
                    <option value="100+">$100+</option>
                  </select>
                </div>
            </div>
            
            {/* Checkbox Filters */}
            <div className="flex flex-wrap gap-4 mt-4">
              <label className="flex items-center space-x-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={advancedFilters.verifiedOnly}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, verifiedOnly: e.target.checked }))}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span>Verified Only</span>
              </label>
              
              <label className="flex items-center space-x-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={advancedFilters.equipmentProvided}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, equipmentProvided: e.target.checked }))}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span>Equipment Provided</span>
              </label>
            </div>
            
            {/* Apply Filters Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  // Apply advanced filters to search
                  if (searchQuery.trim()) {
                    performSearch(searchQuery, activeFilter);
                  } else {
                    loadTrendingContent();
                  }
                }}
                className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {/* Search Results */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {searchQuery.trim() ? 'Search Results' : 
               activeFilter === 'all' ? 'Trending' : 
               activeFilter === 'location' ? '📍 Popular Locations' :
               activeFilter === 'academy' ? '🏫 Top Academies' :
               activeFilter === 'job' ? '💼 Latest Jobs' :
               activeFilter === 'coach' ? '👨‍🏫 Featured Coaches' :
               activeFilter === 'community' ? '👥 Active Communities' : 'Results'}
            </h3>
            {searchQuery.trim() && (
              <span className="text-sm text-gray-500">
                {getCurrentResults().length} results
              </span>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Searching...</p>
            </div>
          ) : getCurrentResults().length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery.trim() ? 'No results found' : 'Start searching'}
              </h3>
              <p className="text-gray-500">
                {searchQuery.trim() 
                  ? 'Try different keywords or filters' 
                  : 'Enter a search term to find players, teams, jobs, and more'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {getCurrentResults().map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div 
                      className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-sm bg-gradient-to-br ${item.gradient}`}
                    >
                      {item.initials}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        {item.verified && (
                          <Check className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-gray-500 text-sm mb-1">
                        {item.followers}
                        {item.type && ` • ${item.type}`}
                      </p>
                      {item.description && (
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      )}
                      {item.location && (
                        <p className="text-gray-400 text-xs flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{item.location}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {item.isConnected || item.isApplied || item.isJoined ? (
                      <div className="flex items-center space-x-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {item.category === 'job' ? 'Applied' : 
                           item.category === 'community' ? 'Joined' : 
                           item.category === 'match' ? 'Joined' : 'Connected'}
                        </span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          const action = item.category === 'job' ? 'apply' : 
                                        item.category === 'community' ? 'join' : 
                                        item.category === 'match' ? 'join' : 'connect';
                          handleAction(item, action);
                        }}
                        disabled={actionLoading[item.id]}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {actionLoading[item.id] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            {item.category === 'job' ? <Briefcase className="w-4 h-4" /> :
                             item.category === 'community' ? <Users className="w-4 h-4" /> :
                             item.category === 'match' ? <BarChart3 className="w-4 h-4" /> :
                             <UserPlus className="w-4 h-4" />}
                            <span>
                              {item.category === 'job' ? 'Apply' : 
                               item.category === 'community' ? 'Join' : 
                               item.category === 'match' ? 'Join' : 'Connect'}
                            </span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}