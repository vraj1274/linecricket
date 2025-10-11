import { ArrowLeft, Award, Calendar, CheckCircle, Edit2, MapPin, MessageCircle, Phone, Save, Star, Trophy, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useToast } from '../contexts/ToastContext';
import { ProfileLoadingSpinner } from './LoadingSpinner';

interface PlayerProfilePageProps {
  onBack: () => void;
}

interface PlayerProfile {
  id: number;
  account_id: number;
  display_name: string;
  bio: string;
  location: string;
  date_of_birth: string;
  nationality: string;
  contact_number: string;
  profile_image_url: string;
  banner_image_url: string;
  player_role: string;
  batting_style: string;
  bowling_style: string;
  preferred_position: string;
  batting_skill: number;
  bowling_skill: number;
  fielding_skill: number;
  leadership_skill: number;
  height: number;
  weight: number;
  dominant_hand: string;
  playing_since: string;
  current_team: string;
  previous_teams: string;
  achievements: string;
  instagram_handle: string;
  twitter_handle: string;
  linkedin_handle: string;
  is_public: boolean;
  allow_messages: boolean;
  show_contact: boolean;
}

interface PlayerCareerStats {
  id: number;
  player_profile_id: number;
  total_matches: number;
  total_innings: number;
  total_runs: number;
  total_wickets: number;
  total_catches: number;
  total_stumpings: number;
  batting_average: number;
  batting_strike_rate: number;
  highest_score: number;
  centuries: number;
  half_centuries: number;
  fours: number;
  sixes: number;
  balls_faced: number;
  not_outs: number;
  bowling_average: number;
  bowling_economy: number;
  bowling_strike_rate: number;
  best_bowling_figures: string;
  five_wicket_hauls: number;
  four_wicket_hauls: number;
  maidens: number;
  runs_conceded: number;
  balls_bowled: number;
  run_outs: number;
  catches_behind: number;
  catches_field: number;
  test_matches: number;
  odi_matches: number;
  t20_matches: number;
  test_runs: number;
  odi_runs: number;
  t20_runs: number;
  test_wickets: number;
  odi_wickets: number;
  t20_wickets: number;
  recent_runs: number;
  recent_wickets: number;
  recent_matches: number;
}

interface PlayerMatchStats {
  id: number;
  player_profile_id: number;
  match_id: number;
  runs_scored: number;
  balls_faced: number;
  is_not_out: boolean;
  fours: number;
  sixes: number;
  overs_bowled: number;
  runs_conceded: number;
  wickets_taken: number;
  maidens: number;
  catches: number;
  stumpings: number;
  run_outs: number;
  man_of_the_match: boolean;
  captain: boolean;
}

export function PlayerProfilePage({ onBack }: PlayerProfilePageProps) {
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [careerStats, setCareerStats] = useState<PlayerCareerStats | null>(null);
  const [matchStats, setMatchStats] = useState<PlayerMatchStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useFirebase();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadPlayerProfile();
  }, []);

  const loadPlayerProfile = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      // const response = await apiService.getPlayerProfile(user?.uid);
      // setPlayerProfile(response.playerProfile);
      // setCareerStats(response.careerStats);
      // setMatchStats(response.matchStats);
      
      // Mock data for now
      setPlayerProfile({
        id: 1,
        account_id: 1,
        display_name: 'Rahul Sharma',
        bio: 'Passionate cricket player with 10+ years of experience',
        location: 'Mumbai, Maharashtra',
        date_of_birth: '1995-06-15',
        nationality: 'Indian',
        contact_number: '+91 9876543210',
        profile_image_url: '',
        banner_image_url: '',
        player_role: 'All-rounder',
        batting_style: 'Right-handed',
        bowling_style: 'Right-arm medium',
        preferred_position: 'Middle order',
        batting_skill: 85,
        bowling_skill: 75,
        fielding_skill: 80,
        leadership_skill: 70,
        height: 175,
        weight: 70,
        dominant_hand: 'Right',
        playing_since: '2010-01-01',
        current_team: 'Mumbai Cricket Club',
        previous_teams: 'Delhi Cricket Academy, Pune Warriors',
        achievements: 'State Level Player, Best All-rounder 2023',
        instagram_handle: '@rahulsharma_cricket',
        twitter_handle: '@rahulsharma_cricket',
        linkedin_handle: 'rahul-sharma-cricket',
        is_public: true,
        allow_messages: true,
        show_contact: true
      });

      setCareerStats({
        id: 1,
        player_profile_id: 1,
        total_matches: 150,
        total_innings: 120,
        total_runs: 2500,
        total_wickets: 85,
        total_catches: 45,
        total_stumpings: 5,
        batting_average: 35.5,
        batting_strike_rate: 125.5,
        highest_score: 125,
        centuries: 2,
        half_centuries: 15,
        fours: 180,
        sixes: 25,
        balls_faced: 2000,
        not_outs: 15,
        bowling_average: 28.5,
        bowling_economy: 5.2,
        bowling_strike_rate: 35.5,
        best_bowling_figures: '5/25',
        five_wicket_hauls: 1,
        four_wicket_hauls: 3,
        maidens: 25,
        runs_conceded: 1500,
        balls_bowled: 1800,
        run_outs: 8,
        catches_behind: 5,
        catches_field: 40,
        test_matches: 5,
        odi_matches: 25,
        t20_matches: 120,
        test_runs: 200,
        odi_runs: 800,
        t20_runs: 1500,
        test_wickets: 8,
        odi_wickets: 25,
        t20_wickets: 52,
        recent_runs: 150,
        recent_wickets: 8,
        recent_matches: 10
      });
    } catch (error) {
      console.error('Error loading player profile:', error);
      showError('Error', 'Failed to load player profile');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue || '');
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue('');
  };

  const saveField = async () => {
    if (!editingField || !editValue.trim()) return;
    
    setIsSaving(true);
    try {
      // TODO: Implement actual API call
      // await apiService.updatePlayerProfile(editingField, editValue);
      showSuccess('Profile Updated', 'Field updated successfully!');
      setEditingField(null);
      setEditValue('');
    } catch (error) {
      showError('Update Failed', 'Failed to update field. Please try again.');
      console.error('Error updating field:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveField();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  if (loading) {
    return <ProfileLoadingSpinner />;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Player Profile</h1>
          <p className="text-gray-600">Manage your player profile and statistics</p>
        </div>
      </div>

      {/* Player Information */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Player Information
          </h2>
          {playerProfile && (
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs">Active</span>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Display Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Display Name</label>
            {editingField === 'display_name' ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button onClick={saveField} className="text-green-600" title="Save">
                  <Save className="w-4 h-4" />
                </button>
                <button onClick={cancelEditing} className="text-red-600" title="Cancel">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <p className="text-gray-900">{playerProfile?.display_name || 'Not provided'}</p>
                <button
                  onClick={() => startEditing('display_name', playerProfile?.display_name || '')}
                  className="opacity-0 hover:opacity-100 text-gray-500 hover:text-gray-700"
                  title="Edit display name"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Player Role */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Player Role</label>
            {editingField === 'player_role' ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button onClick={saveField} className="text-green-600" title="Save">
                  <Save className="w-4 h-4" />
                </button>
                <button onClick={cancelEditing} className="text-red-600" title="Cancel">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <p className="text-gray-900">{playerProfile?.player_role || 'Not provided'}</p>
                <button
                  onClick={() => startEditing('player_role', playerProfile?.player_role || '')}
                  className="opacity-0 hover:opacity-100 text-gray-500 hover:text-gray-700"
                  title="Edit player role"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
            {editingField === 'location' ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button onClick={saveField} className="text-green-600" title="Save">
                  <Save className="w-4 h-4" />
                </button>
                <button onClick={cancelEditing} className="text-red-600" title="Cancel">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <p className="text-gray-900 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {playerProfile?.location || 'Not provided'}
                </p>
                <button
                  onClick={() => startEditing('location', playerProfile?.location || '')}
                  className="opacity-0 hover:opacity-100 text-gray-500 hover:text-gray-700"
                  title="Edit location"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Date of Birth</label>
            <p className="text-gray-900">{playerProfile?.date_of_birth || 'Not provided'}</p>
          </div>

          {/* Nationality */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Nationality</label>
            <p className="text-gray-900">{playerProfile?.nationality || 'Not provided'}</p>
          </div>

          {/* Contact Number */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Contact Number</label>
            <p className="text-gray-900 flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              {playerProfile?.contact_number || 'Not provided'}
            </p>
          </div>

          {/* Physical Attributes */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Height</label>
            <p className="text-gray-900">{playerProfile?.height || 0} cm</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Weight</label>
            <p className="text-gray-900">{playerProfile?.weight || 0} kg</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Dominant Hand</label>
            <p className="text-gray-900">{playerProfile?.dominant_hand || 'Not provided'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Playing Since</label>
            <p className="text-gray-900">{playerProfile?.playing_since || 'Not provided'}</p>
          </div>

          {/* Cricket Skills */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Batting Style</label>
            <p className="text-gray-900">{playerProfile?.batting_style || 'Not provided'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Bowling Style</label>
            <p className="text-gray-900">{playerProfile?.bowling_style || 'Not provided'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Preferred Position</label>
            <p className="text-gray-900">{playerProfile?.preferred_position || 'Not provided'}</p>
          </div>

          {/* Current Team */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Current Team</label>
            <p className="text-gray-900">{playerProfile?.current_team || 'Not provided'}</p>
          </div>

          {/* Previous Teams */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Previous Teams</label>
            <p className="text-gray-900">{playerProfile?.previous_teams || 'Not provided'}</p>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Bio</label>
          {editingField === 'bio' ? (
            <div className="flex items-start space-x-2">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                autoFocus
              />
              <div className="flex flex-col space-y-1">
                <button onClick={saveField} className="text-green-600" title="Save">
                  <Save className="w-4 h-4" />
                </button>
                <button onClick={cancelEditing} className="text-red-600" title="Cancel">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start space-x-2">
              <p className="text-gray-900 flex-1">{playerProfile?.bio || 'No bio provided'}</p>
              <button
                onClick={() => startEditing('bio', playerProfile?.bio || '')}
                className="opacity-0 hover:opacity-100 text-gray-500 hover:text-gray-700 mt-1"
                title="Edit bio"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Achievements</label>
          <p className="text-gray-900">{playerProfile?.achievements || 'No achievements listed'}</p>
        </div>

        {/* Social Media */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Social Media</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {playerProfile?.instagram_handle && (
              <div className="flex items-center space-x-2">
                <span className="text-pink-600">📷</span>
                <span className="text-sm text-gray-900">{playerProfile.instagram_handle}</span>
              </div>
            )}
            {playerProfile?.twitter_handle && (
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">🐦</span>
                <span className="text-sm text-gray-900">{playerProfile.twitter_handle}</span>
              </div>
            )}
            {playerProfile?.linkedin_handle && (
              <div className="flex items-center space-x-2">
                <span className="text-blue-600">💼</span>
                <span className="text-sm text-gray-900">{playerProfile.linkedin_handle}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skills Rating */}
      {playerProfile && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
            Skills Rating
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Batting</span>
                <span className="text-sm text-gray-600">{playerProfile.batting_skill}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full" 
                  style={{ width: `${playerProfile.batting_skill}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Bowling</span>
                <span className="text-sm text-gray-600">{playerProfile.bowling_skill}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full" 
                  style={{ width: `${playerProfile.bowling_skill}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Fielding</span>
                <span className="text-sm text-gray-600">{playerProfile.fielding_skill}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" 
                  style={{ width: `${playerProfile.fielding_skill}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Leadership</span>
                <span className="text-sm text-gray-600">{playerProfile.leadership_skill}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full" 
                  style={{ width: `${playerProfile.leadership_skill}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Career Statistics */}
      {careerStats && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <Award className="w-5 h-5 mr-2 text-green-600" />
            Career Statistics
          </h2>
          
          {/* Batting Stats */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full inline-block mb-4">BATTING</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-orange-600">{careerStats.total_runs}</div>
                <div className="text-xs text-gray-600">Total Runs</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-orange-600">{careerStats.batting_average}</div>
                <div className="text-xs text-gray-600">Average</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-orange-600">{careerStats.highest_score}</div>
                <div className="text-xs text-gray-600">Highest Score</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-orange-600">{careerStats.centuries}</div>
                <div className="text-xs text-gray-600">Centuries</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-orange-600">{careerStats.half_centuries}</div>
                <div className="text-xs text-gray-600">Half Centuries</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-orange-600">{careerStats.batting_strike_rate}</div>
                <div className="text-xs text-gray-600">Strike Rate</div>
              </div>
            </div>
          </div>

          {/* Bowling Stats */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full inline-block mb-4">BOWLING</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600">{careerStats.total_wickets}</div>
                <div className="text-xs text-gray-600">Total Wickets</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600">{careerStats.bowling_average}</div>
                <div className="text-xs text-gray-600">Average</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600">{careerStats.best_bowling_figures}</div>
                <div className="text-xs text-gray-600">Best Figures</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600">{careerStats.five_wicket_hauls}</div>
                <div className="text-xs text-gray-600">5-Wicket Hauls</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600">{careerStats.bowling_economy}</div>
                <div className="text-xs text-gray-600">Economy</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600">{careerStats.maidens}</div>
                <div className="text-xs text-gray-600">Maidens</div>
              </div>
            </div>
          </div>

          {/* Fielding Stats */}
          <div>
            <h3 className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full inline-block mb-4">FIELDING</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-600">{careerStats.total_catches}</div>
                <div className="text-xs text-gray-600">Catches</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-600">{careerStats.total_stumpings}</div>
                <div className="text-xs text-gray-600">Stumpings</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-600">{careerStats.run_outs}</div>
                <div className="text-xs text-gray-600">Run Outs</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-600">{careerStats.total_matches}</div>
                <div className="text-xs text-gray-600">Total Matches</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Format Performance */}
      {careerStats && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <Calendar className="w-5 h-5 mr-2 text-purple-600" />
            Format Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Test Cricket</h3>
              <div className="text-sm text-gray-600">
                <p>Matches: {careerStats.test_matches}</p>
                <p>Runs: {careerStats.test_runs}</p>
                <p>Wickets: {careerStats.test_wickets}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">ODI Cricket</h3>
              <div className="text-sm text-gray-600">
                <p>Matches: {careerStats.odi_matches}</p>
                <p>Runs: {careerStats.odi_runs}</p>
                <p>Wickets: {careerStats.odi_wickets}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">T20 Cricket</h3>
              <div className="text-sm text-gray-600">
                <p>Matches: {careerStats.t20_matches}</p>
                <p>Runs: {careerStats.t20_runs}</p>
                <p>Wickets: {careerStats.t20_wickets}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => {/* TODO: Implement edit functionality */}}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}
