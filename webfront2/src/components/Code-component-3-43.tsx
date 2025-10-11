import React, { useState } from 'react';
import { Search } from 'lucide-react';

export function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const trendingPlayers = [
    { name: 'Virat Kohli', initials: 'VK', followers: '15.2M connections', verified: true, gradient: 'from-orange-500 to-slate-600' },
    { name: 'MS Dhoni', initials: 'MS', followers: '18.7M connections', verified: true, gradient: 'from-slate-700 to-orange-500' },
  ];

  const popularTeams = [
    { name: 'Mumbai Indians', initials: 'MI', followers: '8.9M connections', type: 'IPL Team', gradient: 'from-orange-500 to-slate-700' },
    { name: 'Chennai Super Kings', initials: 'CSK', followers: '12.1M connections', type: 'IPL Team', gradient: 'from-slate-600 to-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl mb-6">Search</h2>
        <div className="relative">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for players, teams, matches..." 
            className="w-full bg-white rounded-2xl px-6 py-4 text-lg shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-14"
          />
          <Search className="absolute right-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Trending Players */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg mb-6">Trending Players</h3>
          <div className="space-y-4">
            {trendingPlayers.map((player, index) => (
              <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center space-x-4">
                  <div 
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-sm bg-gradient-to-br ${player.gradient}`}
                  >
                    {player.initials}
                  </div>
                  <div>
                    <p>{player.name}</p>
                    <p className="text-gray-500 text-sm">{player.followers} • {player.verified ? 'Verified' : ''}</p>
                  </div>
                </div>
                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Teams */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg mb-6">Popular Teams</h3>
          <div className="space-y-4">
            {popularTeams.map((team, index) => (
              <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center space-x-4">
                  <div 
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-sm bg-gradient-to-br ${team.gradient}`}
                  >
                    {team.initials}
                  </div>
                  <div>
                    <p>{team.name}</p>
                    <p className="text-gray-500 text-sm">{team.followers} • {team.type}</p>
                  </div>
                </div>
                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}