import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface MatchesPageProps {
  onCreateMatch: () => void;
}

export function MatchesPage({ onCreateMatch }: MatchesPageProps) {
  const [matches, setMatches] = useState([
    {
      id: 1,
      title: 'Sunday Morning Cricket',
      time: 'Tomorrow, 7:00 AM',
      type: 'T20',
      typeInitials: 'T20',
      playersNeeded: 8,
      location: '📍 Shivaji Park, Mumbai',
      entry: 'Free',
      skill: 'All levels',
      joined: false
    },
    {
      id: 2,
      title: 'Evening Practice Match',
      time: 'Today, 6:00 PM',
      type: 'ODI',
      typeInitials: 'ODI',
      playersNeeded: 4,
      location: '📍 Oval Maidan, Mumbai',
      entry: '₹200',
      skill: 'Intermediate',
      joined: false
    }
  ]);

  const handleJoinMatch = (matchId: number) => {
    setMatches(matches.map(match => 
      match.id === matchId 
        ? { ...match, joined: !match.joined, playersNeeded: match.joined ? match.playersNeeded + 1 : match.playersNeeded - 1 }
        : match
    ));
    
    const match = matches.find(m => m.id === matchId);
    if (match) {
      alert(match.joined ? 'Left the match.' : 'Successfully joined the match! 🏏');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl">Cricket Matches</h2>
        <button 
          onClick={onCreateMatch}
          className="px-6 py-3 text-white rounded-xl flex items-center space-x-2"
          style={{ background: 'linear-gradient(to right, #FF6B33, #2E4B5F)' }}
        >
          <Plus className="w-5 h-5" />
          <span>Create Match</span>
        </button>
      </div>
      
      {/* Live Matches */}
      <div className="mb-8">
        <h3 className="text-lg mb-4 flex items-center">
          <span className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></span>
          Live Matches
        </h3>
        <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-red-500 text-white text-sm rounded-full">LIVE</span>
              <span className="text-lg">T20 World Cup Final</span>
            </div>
            <span className="text-gray-500">Over 18.4</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm"
                  style={{ background: 'linear-gradient(to bottom right, #FF6B33, #2E4B5F)' }}
                >
                  IND
                </div>
                <span className="text-lg">India</span>
              </div>
              <span className="text-2xl">187/4</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm"
                  style={{ background: 'linear-gradient(to bottom right, #2E4B5F, #5D798E)' }}
                >
                  AUS
                </div>
                <span className="text-lg">Australia</span>
              </div>
              <span className="text-2xl">156/8</span>
            </div>
          </div>
          <p className="text-green-600 mt-4 text-center">India needs 32 runs from 8 balls</p>
        </div>
      </div>

      {/* Upcoming Matches */}
      <div className="mb-8">
        <h3 className="text-lg mb-4">Upcoming Matches</h3>
        <div className="space-y-4">
          {matches.map(match => (
            <div key={match.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg">{match.title}</span>
                <span className="text-gray-500">{match.time}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ background: 'linear-gradient(to bottom right, #FF6B33, #5D798E)' }}
                  >
                    {match.typeInitials}
                  </div>
                  <div>
                    <span>{match.type} Match</span>
                    <p className="text-sm text-gray-500">Need {match.playersNeeded} more players</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleJoinMatch(match.id)}
                  className={`px-6 py-2 font-semibold rounded-lg transition-colors ${
                    match.joined 
                      ? 'bg-gray-500 text-white' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {match.joined ? 'Joined ✓' : 'Join Match'}
                </button>
              </div>
              <p className="text-gray-600 mb-3">{match.location}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Entry: {match.entry}</span>
                <span>Skill: {match.skill}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

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
    </div>
  );
}