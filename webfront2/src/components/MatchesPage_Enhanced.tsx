import { DollarSign, MapPin, Plus, Trophy, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiService } from '../services/api';

interface MatchesPageProps {
  onCreateMatch: () => void;
  refreshTrigger?: number;
}

export function MatchesPage({ onCreateMatch, refreshTrigger }: MatchesPageProps) {
  const [matches, setMatches] = useState([]);
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [filterType, setFilterType] = useState('all');

  // Load matches on component mount
  useEffect(() => {
    loadMatches();
    loadLiveMatches();
  }, [activeTab, filterType, refreshTrigger]);

  // ENHANCED DATA FETCHING FUNCTION
  const loadMatches = async () => {
    try {
      setLoading(true);
      console.log('🏏 Loading matches...', { activeTab, filterType });
      
      const status = activeTab === 'upcoming' ? 'upcoming' : 
                    activeTab === 'completed' ? 'completed' : 
                    activeTab === 'live' ? 'live' : 'all';
      
      console.log('📊 Fetching matches with status:', status, 'and type:', filterType);
      
      const response = await apiService.getMatches(status, filterType);
      
      console.log('✅ API Response received:', response);
      console.log('📈 Number of matches:', response.matches ? response.matches.length : 0);
      
      if (response.matches) {
        setMatches(response.matches);
        console.log('🎯 Matches loaded successfully:', response.matches);
        
        // Log first match details for debugging
        if (response.matches.length > 0) {
          console.log('🏏 First match details:', {
            id: response.matches[0].id,
            title: response.matches[0].title,
            location: response.matches[0].location,
            date: response.matches[0].match_date,
            time: response.matches[0].match_time,
            status: response.matches[0].status,
            match_type: response.matches[0].match_type
          });
        }
      } else {
        console.warn('⚠️ No matches data in response');
        setMatches([]);
      }
    } catch (error) {
      console.error('❌ Error loading matches:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      setMatches([]);
    } finally {
      setLoading(false);
      console.log('🏁 Loading complete');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Cricket Matches</h2>
          <p className="text-gray-600 mt-1">Discover and join cricket matches near you</p>
        </div>
        <button 
          onClick={onCreateMatch}
          className="px-6 py-3 text-white rounded-xl flex items-center space-x-2"
          style={{ background: 'linear-gradient(to right, #FF6B33, #2E4B5F)' }}
        >
          <Plus className="w-5 h-5" />
          <span>Create Match</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'live', label: 'Live' },
          { id: 'completed', label: 'Completed' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
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
      
      {/* Live Matches */}
      {activeTab === 'live' && liveMatches.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg mb-4 flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></span>
            Live Matches
          </h3>
          <div className="space-y-4">
            {liveMatches.map(match => (
              <div key={match.id} className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-red-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-red-500 text-white text-sm rounded-full">LIVE</span>
                    <span className="text-lg">{match.title}</span>
                  </div>
                  <span className="text-gray-500">{match.over}</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm"
                        style={{ background: 'linear-gradient(to bottom right, #FF6B33, #2E4B5F)' }}
                      >
                        {match.team1.name.substring(0, 3).toUpperCase()}
                      </div>
                      <span className="text-lg">{match.team1.name}</span>
                    </div>
                    <span className="text-2xl">{match.team1.score}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm"
                        style={{ background: 'linear-gradient(to bottom right, #2E4B5F, #5D798E)' }}
                      >
                        {match.team2.name.substring(0, 3).toUpperCase()}
                      </div>
                      <span className="text-lg">{match.team2.name}</span>
                    </div>
                    <span className="text-2xl">{match.team2.score}</span>
                  </div>
                </div>
                <p className="text-green-600 mt-4 text-center">{match.description}</p>
                <button
                  onClick={() => handleWatchLive(match.id)}
                  className="w-full mt-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Watch Live
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matches List */}
      <div className="mb-8">
        <h3 className="text-lg mb-4 capitalize">{activeTab} Matches</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading matches...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No {activeTab} matches found</p>
            <button
              onClick={onCreateMatch}
              className="mt-4 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Create First Match
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map(match => (
              <div key={match.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold">{match.title}</h4>
                    <p className="text-sm text-gray-500">{formatDate(match.match_date)} at {formatTime(match.match_time)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      match.status === 'live' ? 'bg-red-100 text-red-600' :
                      match.status === 'upcoming' ? 'bg-blue-100 text-blue-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {match.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ background: 'linear-gradient(to bottom right, #FF6B33, #5D798E)' }}
                    >
                      {match.match_type.toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium">{match.match_type.toUpperCase()} Match</span>
                      <p className="text-sm text-gray-500">
                        {match.participants_count}/{match.players_needed} players
                      </p>
                    </div>
                  </div>
                  
                  {match.status === 'upcoming' && (
                    <button 
                      onClick={() => match.is_participant ? handleLeaveMatch(match.id) : handleJoinMatch(match.id)}
                      disabled={!match.can_join && !match.is_participant}
                      className={`px-6 py-2 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        match.is_participant 
                          ? 'bg-gray-500 text-white hover:bg-gray-600' 
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {match.is_participant ? 'Leave Match' : 'Join Match'}
                    </button>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{match.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>Skill: {match.skill_level}</span>
                  </div>
                  {match.entry_fee > 0 && (
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span>Entry: ₹{match.entry_fee}</span>
                    </div>
                  )}
                </div>

                {match.description && (
                  <p className="text-gray-600 text-sm mb-4">{match.description}</p>
                )}

                {/* Teams Information */}
                {(match.team1_name || match.team2_name) && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{match.team1_name || 'Team 1'}</span>
                      <span className="text-gray-500">vs</span>
                      <span className="font-medium">{match.team2_name || 'Team 2'}</span>
                    </div>
                    {match.status === 'live' && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">{match.team1_score || '0/0'}</span>
                          <span className="text-lg font-bold">{match.team2_score || '0/0'}</span>
                        </div>
                        {match.current_over && (
                          <p className="text-center text-sm text-gray-500 mt-2">
                            Over {match.current_over}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Weather Information */}
                {match.weather && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>🌤️ Weather: {match.weather}</span>
                      {match.temperature && <span>🌡️ {match.temperature}°C</span>}
                      {match.humidity && <span>💧 {match.humidity}% humidity</span>}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Created by {match.creator.username}</span>
                  <span>{match.equipment_provided ? 'Equipment provided' : 'Bring your own equipment'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
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
