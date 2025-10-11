import { DollarSign, MapPin, Plus, Trophy, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { EditMatchModal } from './EditMatchModal';
import { TeamSelectorModal } from './TeamSelectorModal';
// import { useMobileApp } from '../contexts/MobileAppContext';

interface MatchesPageProps {
  onCreateMatch: () => void;
  refreshTrigger?: number;
}

interface Match {
  id: string;
  title: string;
  description?: string;
  match_type: string;
  location: string;
  venue?: string;
  match_date: string;
  match_time: string;
  status: string;
  team1_name?: string;
  team2_name?: string;
  team1_score?: string;
  team2_score?: string;
  current_over?: string;
  players_needed: number;
  participants_count: number;
  entry_fee: number;
  skill_level: string;
  can_join: boolean;
  is_participant: boolean;
  team_stats?: {
    [teamId: string]: {
      current_players: number;
      max_players: number;
      available_positions: number[];
      is_full: boolean;
    };
  };
  teams?: Array<{
    team_id: string;
    team_name: string;
    current_players: number;
    max_players: number;
    available_positions: number[];
    participants: Array<{
      user_id: string;
      player_position: number;
      player_role: string;
      user: {
        id: string;
        username: string;
        profile_image_url?: string;
      };
    }>;
  }>;
  umpires?: Array<{
    umpire_name: string;
    umpire_contact: string;
    experience_level: string;
    umpire_fees: number;
  }>;
}

export function MatchesPage({ onCreateMatch, refreshTrigger }: MatchesPageProps) {
  // const { showMobileAppModal } = useMobileApp();
  const [matches, setMatches] = useState<Match[]>([]);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Team selection state
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [filterType, setFilterType] = useState('all');
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  console.log('🏏 MatchesPage component rendered with:', { activeTab, filterType, refreshTrigger });

  const loadMatches = async () => {
    try {
      setLoading(true);
      console.log('🏏 Loading matches...', { activeTab, filterType });
      
      const status = activeTab === 'upcoming' ? 'upcoming' : 
                    activeTab === 'completed' ? 'completed' : 
                    activeTab === 'live' ? 'live' : 'all';
      
      console.log('📊 Fetching matches with status:', status, 'and type:', filterType);
      console.log('🔗 API URL will be: http://localhost:5000/api/matches?status=' + status + '&match_type=' + filterType);
      
      const response = await apiService.getMatches({
        status: status,
        match_type: filterType
      });
      
      console.log('✅ API Response received:', response);
      console.log('📈 Number of matches:', response.matches ? response.matches.length : 0);
      console.log('🔍 Full response structure:', JSON.stringify(response, null, 2));
      
      if (response.matches) {
        setMatches(response.matches);
        console.log('🎯 Matches loaded successfully:', response.matches);
        console.log('📊 Matches state updated with', response.matches.length, 'matches');
        console.log('🔍 First match in state:', response.matches[0]);
        
        // Log first match details for debugging
        if (response.matches.length > 0) {
          const firstMatch = response.matches[0];
          console.log('🏏 First match details:', {
            id: firstMatch.id,
            title: firstMatch.title,
            location: firstMatch.location,
            date: firstMatch.match_date,
            time: firstMatch.match_time,
            status: firstMatch.status,
            match_type: firstMatch.match_type,
            teams: firstMatch.teams ? firstMatch.teams.length : 0,
            umpires: firstMatch.umpires ? firstMatch.umpires.length : 0
          });
          
          // Log teams and umpires data
          if (firstMatch.teams && firstMatch.teams.length > 0) {
            console.log('👥 Teams data:', firstMatch.teams.slice(0, 3));
          }
          if (firstMatch.umpires && firstMatch.umpires.length > 0) {
            console.log('🏏 Umpires data:', firstMatch.umpires.slice(0, 3));
          }
        }
      } else {
        console.warn('⚠️ No matches data in response');
        setMatches([]);
      }
    } catch (error: any) {
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

  // Load matches on component mount
  useEffect(() => {
    console.log('🔄 useEffect triggered with dependencies:', { activeTab, filterType, refreshTrigger });
    loadMatches();
    loadLiveMatches();
  }, [activeTab, filterType, refreshTrigger]);

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

  const handleJoinMatch = async (matchId: string) => {
    try {
      const response = await apiService.joinMatch(matchId);
      
      // Handle different response messages
      if (response.message === 'You are already a participant in this match') {
        alert('You are already a participant in this match!');
      } else {
        alert('Successfully joined the match!');
      }
      
      loadMatches(); // Refresh matches
    } catch (error) {
      console.error('Error joining match:', error);
      alert('Failed to join match. Please try again.');
    }
  };

  const handleJoinWithTeamSelection = async (matchId: string) => {
    try {
      const match = matches.find(m => m.id === matchId);
      if (!match) return;
      
      setSelectedMatch(match);
      setShowTeamSelector(true);
    } catch (error) {
      console.error('Error opening team selector:', error);
      alert('Failed to load team information. Please try again.');
    }
  };

  const handleJoinTeam = async (teamId: string, position: number) => {
    if (!selectedMatch) return;
    
    try {
      const response = await apiService.joinTeam(selectedMatch.id, teamId, position);
      alert(`Successfully joined the team at position ${position}!`);
      loadMatches(); // Refresh matches
      setShowTeamSelector(false);
      setSelectedMatch(null);
    } catch (error: any) {
      console.error('Error joining team:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to join team. Please try again.';
      alert(errorMessage);
      throw error; // Re-throw to prevent modal from closing
    }
  };

  const handleLeaveMatch = async (matchId: string) => {
    try {
      await apiService.leaveMatch(matchId);
      alert('Successfully left the match!');
      loadMatches(); // Refresh matches
    } catch (error) {
      console.error('Error leaving match:', error);
      alert('Failed to leave match. Please try again.');
    }
  };

  const handleWatchLive = async (matchId: string) => {
    try {
      const response = await apiService.watchLiveMatch(Number(matchId));
      window.open(response.stream_url, '_blank');
    } catch (error) {
      console.error('Error starting live stream:', error);
      alert('Failed to start live stream. Please try again.');
    }
  };

  const handleEditMatch = async (matchId: string) => {
    try {
      console.log('🔧 Editing match:', matchId);
      
      // Find the match data
      const match = matches.find(m => m.id === matchId);
      if (!match) {
        alert('Match not found');
        return;
      }

      console.log('📝 Opening edit modal for match:', match);
      
      // Set the match to edit and show the modal
      setEditingMatch(match);
      setShowEditModal(true);
      
    } catch (error) {
      console.error('❌ Error editing match:', error);
      alert('Failed to edit match. Please try again.');
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    try {
      console.log('🗑️ Deleting match:', matchId);
      
      const match = matches.find(m => m.id === matchId);
      if (!match) {
        alert('Match not found');
        return;
      }

      const confirmed = confirm(`Are you sure you want to delete "${match.title}"?\n\nThis action cannot be undone.`);
      if (confirmed) {
        // Call delete API
        await apiService.deleteMatch(matchId);
        alert('Match deleted successfully!');
        loadMatches(); // Refresh matches
      }
    } catch (error) {
      console.error('❌ Error deleting match:', error);
      alert('Failed to delete match. Please try again.');
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

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingMatch(null);
  };

  const handleMatchUpdated = () => {
    loadMatches(); // Refresh matches after update/delete
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Cricket Matches</h2>
          <p className="text-gray-600 mt-1">Discover and join cricket matches near you</p>
        </div>
        <button 
          onClick={onCreateMatch}
          className="px-6 py-3 text-white rounded-xl flex items-center space-x-2 font-medium hover:shadow-lg transition-all"
          style={{ background: 'linear-gradient(135deg, #FF6B33 0%, #2E4B5F 100%)' }}
        >
          <Plus className="w-5 h-5" />
          <span>Create Match</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'upcoming', label: 'Upcoming', count: matches.filter(m => m.status === 'upcoming').length },
          { id: 'live', label: 'Live', count: matches.filter(m => m.status === 'live').length },
          { id: 'completed', label: 'Completed', count: matches.filter(m => m.status === 'completed').length }
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
                  <span className="text-gray-500">{match.current_over || '0.0'}</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm"
                        style={{ background: 'linear-gradient(to bottom right, #FF6B33, #2E4B5F)' }}
                      >
                        {(match.team1_name || 'T1').substring(0, 3).toUpperCase()}
                      </div>
                      <span className="text-lg">{match.team1_name || 'Team 1'}</span>
                    </div>
                    <span className="text-2xl">{match.team1_score || '0/0'}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm"
                        style={{ background: 'linear-gradient(to bottom right, #2E4B5F, #5D798E)' }}
                      >
                        {(match.team2_name || 'T2').substring(0, 3).toUpperCase()}
                      </div>
                      <span className="text-lg">{match.team2_name || 'Team 2'}</span>
                    </div>
                    <span className="text-2xl">{match.team2_score || '0/0'}</span>
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
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map(match => {
              console.log('🎨 Rendering match:', match.id, match.title);
              return (
              <div key={match.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow mb-4 border border-gray-100">
                {/* Header with Match Type and Date */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      match.status === 'live' ? 'bg-red-500 text-white' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {match.match_type.toUpperCase()}
                    </span>
                    {match.status === 'live' && (
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-500 text-white">
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">{formatDate(match.match_date)}</span>
                  </div>
                </div>

                {/* Match Title */}
                <div className="mb-4">
                  <h4 className="text-xl font-bold text-gray-900">{match.title}</h4>
                </div>

                {/* Venue and Time */}
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm">{match.location}</span>
                  <span className="text-sm ml-2">{formatTime(match.match_time)}</span>
                </div>

                {/* Simple Match Info - Clean Design */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <div className="font-bold text-lg text-gray-900">{match.team1_name || 'Team 1'}</div>
                    </div>
                    <div className="text-center mx-4">
                      <div className="text-gray-400 text-lg font-medium">VS</div>
                    </div>
                    <div className="text-center flex-1">
                      <div className="font-bold text-lg text-gray-900">{match.team2_name || 'Team 2'}</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Clean Design */}
                <div className="flex items-center justify-between ">
                  <button 
                    onClick={() => match.is_participant ? handleLeaveMatch(match.id) : handleJoinWithTeamSelection(match.id)}
                    disabled={!match.can_join && !match.is_participant}
                    className={`flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      match.is_participant 
                        ? 'bg-gray-500 text-white hover:bg-gray-600' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <span>{match.is_participant ? 'Leave Match' : 'Join Match (Select Team)'}</span>
                  </button>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    {/* Edit Button */}
                    <button 
                      onClick={() => {
                        setEditingMatch(match);
                        setShowEditModal(true);
                      }}
                      className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center hover:bg-yellow-500 transition-all"
                      title="Edit Match"
                    >
                      <span className="text-white text-sm">✏️</span>
                    </button>
                    
                    {/* Delete Button */}
                    <button 
                      onClick={() => handleDeleteMatch(match.id)}
                      className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center hover:bg-red-600 transition-all"
                      title="Delete Match"
                    >
                      <span className="text-white text-sm">🗑️</span>
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Join Button for Upcoming Matches */}
      {activeTab === 'upcoming' && matches.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button 
            onClick={() => {
              const firstMatch = matches.find(m => m.status === 'upcoming');
              if (firstMatch) {
                handleJoinMatch(firstMatch.id);
              }
            }}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl hover:shadow-3xl transition-all hover:scale-105 flex items-center space-x-2"
          >
            <Users className="w-5 h-5" />
            <span>Quick Join</span>
          </button>
        </div>
      )}

      {/* Recent Results */}
      <div>
        <h3 className="text-lg mb-4">Recent Results</h3>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg">IPL 2024 - Match 44</span>
            <span className="px-3 py-1 bg-green-500 text-white text-sm rounded-full">RESULT</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs"
                  style={{ background: 'linear-gradient(to bottom right, #FF6B33, #2E4B5F)' }}
                >
                  RCB
                </div>
                <span>Royal Challengers Bangalore</span>
              </div>
              <span className="text-xl">198/5</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs"
                  style={{ background: 'linear-gradient(to bottom right, #2E4B5F, #5D798E)' }}
                >
                  KKR
                </div>
                <span>Kolkata Knight Riders</span>
              </div>
              <span className="text-xl">195/7</span>
            </div>
          </div>
          <p className="text-green-600 mt-4 text-center">RCB won by 3 runs</p>
        </div>
      </div>

      {/* Edit Match Modal */}
      {editingMatch && (
        <EditMatchModal
          isVisible={showEditModal}
          onClose={handleCloseEditModal}
          match={editingMatch}
          onMatchUpdated={handleMatchUpdated}
        />
      )}

      {/* Team Selector Modal */}
      {selectedMatch && (
        <TeamSelectorModal
          isVisible={showTeamSelector}
          onClose={() => {
            setShowTeamSelector(false);
            setSelectedMatch(null);
          }}
          match={selectedMatch}
          onJoinTeam={handleJoinTeam}
        />
      )}
    </div>
  );
}