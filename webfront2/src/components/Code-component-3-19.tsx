import React from 'react';
import { CheckCircle } from 'lucide-react';

export function RightSidebar() {
  const handleEditProfile = () => {
    alert('Edit Profile feature coming soon! 📝');
  };

  const trendingPlayers = [
    { name: 'Virat Kohli', username: 'VK', followers: '15.2M', gradient: 'from-orange-500 to-slate-600' },
    { name: 'MS Dhoni', username: 'MS', followers: '18.7M', gradient: 'from-slate-700 to-orange-500' },
    { name: 'Rohit Sharma', username: 'RG', followers: '12.8M', gradient: 'from-slate-600 to-orange-500' },
  ];

  const upcomingMatches = [
    { title: 'Sunday Cricket', time: 'Tomorrow', location: 'Shivaji Park, 7:00 AM' },
    { title: 'Practice Match', time: 'Today', location: 'Oval Maidan, 6:00 PM' },
  ];

  return (
    <div className="fixed top-0 right-0 h-screen w-[320px] bg-white border-l border-gray-200 z-40 overflow-y-auto">
      <div className="p-6">
        {/* Profile Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg"
                style={{ background: 'linear-gradient(to bottom right, #5D798E, #2E4B5F)' }}
              >
                You
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <CheckCircle className="w-2 h-2 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg">Arjun Sharma</h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Verified</span>
              </div>
              <p className="text-sm text-gray-600">@arjun_cricket_star</p>
            </div>
          </div>
          
          <div className="flex justify-around mb-4 bg-gray-50 rounded-xl p-4">
            <div className="text-center">
              <p className="text-lg">42</p>
              <p className="text-xs text-gray-500">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-lg">1,234</p>
              <p className="text-xs text-gray-500">Connections</p>
            </div>
            <div className="text-center">
              <p className="text-lg">567</p>
              <p className="text-xs text-gray-500">Connected</p>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm">Cricket Enthusiast & All-Rounder</p>
            <p className="text-xs text-gray-600">🏏 Mumbai Cricket Association | 📍 Mumbai, India</p>
          </div>
          
          <button 
            onClick={handleEditProfile}
            className="w-full py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Edit Profile
          </button>
        </div>

        {/* Skills Section */}
        <div className="mb-6">
          <h4 className="text-sm mb-3">Skills & Performance</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs">Batting</span>
                <span className="text-xs text-gray-600">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-1.5 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs">Bowling</span>
                <span className="text-xs text-gray-600">72%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-1.5 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs">Fielding</span>
                <span className="text-xs text-gray-600">90%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-green-400 to-green-600 h-1.5 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-6">
          <h4 className="text-sm mb-3">Quick Stats</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-orange-50 rounded-lg border border-orange-100">
              <p className="text-sm text-orange-700">2,847</p>
              <p className="text-xs text-gray-600">Total Runs</p>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-700">47</p>
              <p className="text-xs text-gray-600">Wickets</p>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-lg border border-green-100">
              <p className="text-sm text-green-700">89</p>
              <p className="text-xs text-gray-600">Matches</p>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded-lg border border-purple-100">
              <p className="text-sm text-purple-700">12</p>
              <p className="text-xs text-gray-600">Awards</p>
            </div>
          </div>
        </div>

        {/* Trending Players */}
        <div className="mb-6">
          <h4 className="text-sm mb-3">Trending Players</h4>
          <div className="space-y-3">
            {trendingPlayers.map((player, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs bg-gradient-to-br ${player.gradient}`}
                  >
                    {player.username}
                  </div>
                  <div>
                    <p className="text-xs">{player.name}</p>
                    <p className="text-xs text-gray-500">{player.followers} connections</p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors">
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Matches */}
        <div className="mb-6">
          <h4 className="text-sm mb-3">Your Upcoming Matches</h4>
          <div className="space-y-2">
            {upcomingMatches.map((match, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">{match.title}</span>
                  <span className="text-xs text-gray-500">{match.time}</span>
                </div>
                <p className="text-xs text-gray-600">{match.location}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">© 2024 thelinecricket</p>
        </div>
      </div>
    </div>
  );
}