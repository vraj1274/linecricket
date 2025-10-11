import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface Team {
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
}

interface Match {
  id: string;
  title: string;
  teams?: Team[];
}

interface TeamSelectorModalProps {
  isVisible: boolean;
  onClose: () => void;
  match: Match;
  onJoinTeam: (teamId: string, position: number) => void;
}

// Cricket position names mapping
const CRICKET_POSITIONS = {
  1: { name: 'Captain', icon: '👑', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  2: { name: 'Wicket Keeper', icon: '🧤', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  3: { name: 'Bowler', icon: '🏏', color: 'bg-green-100 text-green-800 border-green-300' },
  4: { name: 'All Rounder', icon: '⚡', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  5: { name: 'Batsman', icon: '🏏', color: 'bg-red-100 text-red-800 border-red-300' },
  6: { name: 'Fast Bowler', icon: '💨', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  7: { name: 'Spinner', icon: '🌀', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  8: { name: 'Fielder', icon: '🏃', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  9: { name: 'Vice Captain', icon: '⭐', color: 'bg-pink-100 text-pink-800 border-pink-300' },
  10: { name: 'Reserve Player', icon: '🔄', color: 'bg-gray-100 text-gray-800 border-gray-300' },
  11: { name: 'Team Player', icon: '🤝', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' }
};

export function TeamSelectorModal({ isVisible, onClose, match, onJoinTeam }: TeamSelectorModalProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  useEffect(() => {
    if (isVisible && match.id) {
      loadMatchTeams();
    }
  }, [isVisible, match.id]);

  const loadMatchTeams = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMatchTeams(match.id);
      if (response.teams) {
        setTeams(response.teams);
      }
    } catch (error) {
      console.error('Error loading match teams:', error);
      alert('Failed to load team information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for position display
  const getPositionInfo = (position: number) => {
    return CRICKET_POSITIONS[position as keyof typeof CRICKET_POSITIONS] || {
      name: `Position ${position}`,
      icon: '⚽',
      color: 'bg-gray-100 text-gray-800 border-gray-300'
    };
  };

  const getPositionDisplayName = (position: number) => {
    const info = getPositionInfo(position);
    return `${info.icon} ${info.name}`;
  };

  const handlePositionSelect = (teamId: string, position: number) => {
    setSelectedTeam(teamId);
    setSelectedPosition(position);
  };

  const handleJoinTeam = async () => {
    if (selectedTeam && selectedPosition) {
      // Show confirmation dialog
      const confirmed = window.confirm(
        `Are you sure you want to join this team at position ${selectedPosition}?\n\n` +
        `This will reserve this position for you and prevent other players from taking it.`
      );
      
      if (!confirmed) return;
      
      try {
        await onJoinTeam(selectedTeam, selectedPosition);
        // Refresh teams after successful join
        loadMatchTeams();
      } catch (error) {
        console.error('Error joining team:', error);
        // Don't close modal on error, let user try again
      }
    }
  };

  const getPositionColor = (position: number, availablePositions: number[], team: Team) => {
    if (availablePositions.includes(position)) {
      return 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300';
    }
    
    // Check if position is occupied by a participant
    const occupiedParticipant = team.participants.find(p => p.player_position === position);
    if (occupiedParticipant) {
      return 'bg-red-100 text-red-800 border-red-300 cursor-not-allowed';
    }
    
    return 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200';
  };

  const getPositionStatus = (position: number, availablePositions: number[], team: Team) => {
    if (availablePositions.includes(position)) {
      return 'Available';
    }
    
    const occupiedParticipant = team.participants.find(p => p.player_position === position);
    if (occupiedParticipant) {
      return `Taken by ${occupiedParticipant.user.username}`;
    }
    
    return 'Unavailable';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Select Team & Position</h3>
              <p className="text-gray-600 mt-1">{match.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading teams...</span>
            </div>
          ) : (
            <>
              {/* Selection Summary */}
              {selectedTeam && selectedPosition && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{getPositionInfo(selectedPosition).icon}</span>
                    <div>
                      <h4 className="text-lg font-semibold text-blue-900 mb-1">Your Selection</h4>
                      <p className="text-blue-800">
                        You have selected <strong>{getPositionInfo(selectedPosition).name}</strong> position.
                        Click "Join Team" below to confirm your selection and reserve this position.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
              {teams.map((team) => (
                <div key={team.team_id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  {/* Team Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">{team.team_name}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {team.current_players}/{team.max_players} players
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      team.current_players >= team.max_players
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {team.current_players >= team.max_players ? 'Full' : 'Open'}
                    </div>
                  </div>

                  {/* Current Players */}
                  {team.participants.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Current Players:</h5>
                      <div className="flex flex-wrap gap-2">
                        {team.participants.map((participant) => {
                          const positionInfo = getPositionInfo(participant.player_position);
                          return (
                            <div
                              key={participant.user_id}
                              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm border ${positionInfo.color}`}
                            >
                              <span className="font-medium">{positionInfo.icon}</span>
                              <span className="font-semibold">{positionInfo.name}</span>
                              <span className="text-gray-600">{participant.user.username}</span>
                              <span className="text-xs text-gray-500">({participant.player_role})</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Position Grid */}
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Available Positions:</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {Array.from({ length: team.max_players }, (_, i) => i + 1).map((position) => {
                        const isAvailable = team.available_positions.includes(position);
                        const isSelected = selectedTeam === team.team_id && selectedPosition === position;
                        const occupiedParticipant = team.participants.find(p => p.player_position === position);
                        const positionInfo = getPositionInfo(position);
                        
                        return (
                          <div key={position} className="relative">
                            <div className="flex flex-col items-center space-y-2">
                              <button
                                onClick={() => isAvailable ? handlePositionSelect(team.team_id, position) : null}
                                disabled={!isAvailable}
                                className={`p-4 rounded-xl text-sm font-medium transition-all border-2 w-full min-h-[80px] flex flex-col items-center justify-center space-y-1 ${
                                  isSelected
                                    ? 'bg-blue-100 text-blue-800 border-blue-300 ring-2 ring-blue-400'
                                    : isAvailable
                                    ? `${positionInfo.color} hover:shadow-md cursor-pointer`
                                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                }`}
                                title={getPositionStatus(position, team.available_positions, team)}
                              >
                                {isSelected && <span className="text-blue-600 text-lg">✓</span>}
                                <span className="text-2xl">{positionInfo.icon}</span>
                                <span className="font-semibold text-xs text-center leading-tight">
                                  {positionInfo.name}
                                </span>
                                {occupiedParticipant && (
                                  <span className="text-xs text-red-600 font-medium">
                                    {occupiedParticipant.user.username}
                                  </span>
                                )}
                              </button>
                              {isAvailable && !isSelected && (
                                <button
                                  onClick={() => handlePositionSelect(team.team_id, position)}
                                  className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                  Select Position
                                </button>
                              )}
                              {occupiedParticipant && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                                  <span className="text-white text-xs">✕</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Available Positions:</span> {team.available_positions.map(pos => getPositionInfo(pos).name).join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Join Button */}
                  {selectedTeam === team.team_id && selectedPosition && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="bg-blue-50 p-4 rounded-lg mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getPositionInfo(selectedPosition).icon}</span>
                          <div>
                            <p className="text-sm text-blue-800 font-semibold">
                              Selected: {getPositionInfo(selectedPosition).name}
                            </p>
                            <p className="text-xs text-blue-600">
                              Team: {team.team_name}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleJoinTeam}
                        className="w-full bg-green-600 text-gray-800 py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium text-lg flex items-center justify-center space-x-2"
                      >
                        <span>✅</span>
                        <span>Join as {getPositionInfo(selectedPosition).name}</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {teams.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Teams Available</h3>
                  <p className="text-gray-500">This match doesn't have any teams set up yet.</p>
                </div>
              )}
              </div>
            </>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
