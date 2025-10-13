import { DollarSign, MapPin, Plus, Trophy, Users, Clock, Calendar, Star, Eye, UserPlus, UserMinus, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiService } from '../services/api';

interface MatchesPageProps {
  onCreateMatch: () => void;
  refreshTrigger?: number;
}

interface Match {
  id: number;
  title: string;
  description: string;
  match_type: string;
  location: string;
  venue: string;
  match_date: string;
  match_time: string;
  players_needed: number;
  participants_count: number;
  entry_fee: number;
  skill_level: string;
  equipment_provided: boolean;
  status: string;
  is_public: boolean;
  is_participant: boolean;
  can_join: boolean;
  team1_name: string;
  team2_name: string;
  creator: {
    id: string;
    username: string;
  };
  weather?: string;
  temperature?: number;
  wind_speed?: number;
  humidity?: number;
  estimated_duration?: number;
  total_views?: number;
  total_interested?: number;
  total_joined?: number;
  total_left?: number;
}

export function EnhancedMatchesPage({ onCreateMatch, refreshTrigger }: MatchesPageProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [filterType, setFilterType] = useState('all');
  const [error, setError] = useState('');

  // Load matches on component mount
  useEffect(() => {
    loadMatches();
    loadLiveMatches();
  }, [activeTab, filterType, refreshTrigger]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🏏 Loading matches for tab:', activeTab, 'filter:', filterType);
      
      const status = activeTab === 'upcoming' ? 'upcoming' : 
                    activeTab === 'live' ? 'live' : 
                    activeTab === 'completed' ? 'completed' : 'all';
      
      const response = await apiService.getMatches(status, filterType);
      console.log('📊 API Response:', response);
      
      if (response.matches) {
        setMatches(response.matches);
        console.log(`✅ Loaded ${response.matches.length} matches`);
      } else {
        console.warn('⚠️ No matches data in response');
        setMatches([]);
      }
    } catch (error) {
      console.error('❌ Error loading matches:', error);
      setError('Failed to load matches. Please try again.');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const loadLiveMatches = async () => {
    try {
      console.log('🔴 Loading live matches...');
      const response = await apiService.getLiveMatches();
      console.log('📺 Live matches response:', response);
      
      if (response.matches) {
        setLiveMatches(response.matches);
        console.log(`✅ Loaded ${response.matches.length} live matches`);
      }
    } catch (error) {
      console.error('❌ Error loading live matches:', error);
    }
  };

  const handleJoinMatch = async (matchId: number) => {
    try {
      console.log('👥 Joining match:', matchId);
      await apiService.joinMatch(matchId);
      alert('Successfully joined the match!');
      loadMatches(); // Refresh matches
    } catch (error) {
      console.error('❌ Error joining match:', error);
      alert('Failed to join match. Please try again.');
    }
  };

  const handleLeaveMatch = async (matchId: number) => {
    try {
      console.log('👋 Leaving match:', matchId);
      await apiService.leaveMatch(matchId);
      alert('Successfully left the match!');
      loadMatches(); // Refresh matches
    } catch (error) {
      console.error('❌ Error leaving match:', error);
      alert('Failed to leave match. Please try again.');
    }
  };

  const handleWatchLive = async (matchId: number) => {
    try {
      console.log('📺 Starting live stream for match:', matchId);
      const response = await apiService.watchLiveMatch(matchId);
      if (response.stream_url) {
        window.open(response.stream_url, '_blank');
      } else {
        alert('Live stream not available for this match.');
      }
    } catch (error) {
      console.error('❌ Error starting live stream:', error);
      alert('Failed to start live stream. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'live': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMatchTypeColor = (matchType: string) => {
    switch (matchType) {
      case 'tournament': return 'bg-purple-100 text-purple-800';
      case 'friendly': return 'bg-green-100 text-green-800';
      case 'league': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderMatchCard = (match: Match) => (
    <div key={match.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{match.title}</h3>
          <p className="text-gray-600 text-sm mb-3">{match.description}</p>
        </div>
        <div className="flex flex-col space-y-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
            {match.status.toUpperCase()}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMatchTypeColor(match.match_type)}`}>
            {match.match_type.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Match Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{formatDate(match.match_date)}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{formatTime(match.match_time)}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{match.location}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Users className="w-4 h-4" />
          <span className="text-sm">{match.participants_count}/{match.players_needed} players</span>
        </div>
      </div>

      {/* Teams */}
      {(match.team1_name || match.team2_name) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="font-semibold text-gray-900">{match.team1_name || 'Team 1'}</div>
              <div className="text-sm text-gray-600">vs</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{match.team2_name || 'Team 2'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Match Info */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span>Skill: {match.skill_level}</span>
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-green-500" />
          <span>Entry: ₹{match.entry_fee}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span>Equipment: {match.equipment_provided ? 'Provided' : 'Bring your own'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-gray-500" />
          <span>Views: {match.total_views || 0}</span>
        </div>
      </div>

      {/* Weather Info */}
      {match.weather && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span>🌤️ Weather: {match.weather}</span>
            {match.temperature && <span>🌡️ {match.temperature}°C</span>}
            {match.humidity && <span>💧 {match.humidity}% humidity</span>}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Created by: {match.creator.username}</span>
        </div>
        <div className="flex items-center space-x-2">
          {match.status === 'live' && (
            <button
              onClick={() => handleWatchLive(match.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Watch Live</span>
            </button>
          )}
          {match.status === 'upcoming' && (
            <>
              {match.is_participant ? (
                <button
                  onClick={() => handleLeaveMatch(match.id)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  <UserMinus className="w-4 h-4" />
                  <span>Leave</span>
                </button>
              ) : (
                <button
                  onClick={() => handleJoinMatch(match.id)}
                  disabled={!match.can_join}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Join Match</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cricket Matches</h2>
          <p className="text-gray-600 mt-1">Discover and join cricket matches near you</p>
        </div>
        <button 
          onClick={onCreateMatch}
          className="px-6 py-3 text-white rounded-xl flex items-center space-x-2 hover:shadow-lg transition-all"
          style={{ background: 'linear-gradient(to right, #FF6B33, #2E4B5F)' }}
        >
          <Plus className="w-5 h-5" />
          <span>Create Match</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'upcoming', label: 'Upcoming', count: matches.length },
          { id: 'live', label: 'Live', count: liveMatches.length },
          { id: 'completed', label: 'Completed', count: 0 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
              activeTab === tab.id
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.label}</span>
            <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="tournament">Tournament</option>
          <option value="friendly">Friendly</option>
          <option value="league">League</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <span className="ml-3 text-gray-600">Loading matches...</span>
        </div>
      )}

      {/* Matches List */}
      {!loading && (
        <div className="space-y-4">
          {matches.length > 0 ? (
            matches.map(renderMatchCard)
          ) : (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches found</h3>
              <p className="text-gray-600 mb-4">
                {activeTab === 'upcoming' && 'No upcoming matches available'}
                {activeTab === 'live' && 'No live matches at the moment'}
                {activeTab === 'completed' && 'No completed matches yet'}
              </p>
              <button
                onClick={onCreateMatch}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Create First Match
              </button>
            </div>
          )}
        </div>
      )}

      {/* Debug Info */}
      {import.meta.env.DEV && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <p>Active Tab: {activeTab}</p>
          <p>Filter Type: {filterType}</p>
          <p>Matches Count: {matches.length}</p>
          <p>Live Matches Count: {liveMatches.length}</p>
          <p>Loading: {loading.toString()}</p>
        </div>
      )}
    </div>
  );
}
