import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { PostsFeed } from './PostsFeed';
// import { useMobileApp } from '../contexts/MobileAppContext';

interface HomePageProps {
  isPopupVisible?: boolean;
  onProfileClick?: (profileId: string, profileType: 'player' | 'coach' | 'venue' | 'academy' | 'community') => void;
  refreshTrigger?: number; // Add refresh trigger prop
}

export function HomePage({ isPopupVisible = false, onProfileClick, refreshTrigger }: HomePageProps) {
  // const { showMobileAppModal } = useMobileApp();
  const [liveMatch, setLiveMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  

  // Load initial data
  useEffect(() => {
    loadLiveMatches();
  }, []);

  const loadLiveMatches = async () => {
    try {
      const response = await apiService.getLiveMatches();
      if (response.matches && response.matches.length > 0) {
        setLiveMatch(response.matches[0]);
      }
    } catch (error) {
      console.error('Error loading live matches:', error);
    }
  };


  const handleWatchLive = async () => {
    if (liveMatch) {
      try {
        const response = await apiService.watchLiveMatch((liveMatch as any).id);
        // In a real app, this would open the stream URL
        window.open(response.stream_url, '_blank');
      } catch (error) {
        console.error('Error starting live stream:', error);
        alert('Failed to start live stream. Please try again.');
      }
    }
  };

  return (
    <div className={`space-y-6 transition-all duration-300 ${isPopupVisible ? 'blur-md pointer-events-none opacity-50' : ''}`}>
      {/* Blur overlay indicator */}
      {isPopupVisible && (
        <div className="fixed inset-0 bg-blue-500/5 pointer-events-none z-40"></div>
      )}
      
      {/* Live Match Update */}
      <div className="bg-gray-50 rounded-2xl shadow-sm border-l-4 border-red-500">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-red-500">LIVE MATCH UPDATE</span>
          </div>
          <div className="mb-4">
            <h3 className="text-lg mb-2 text-gray-900">T20 World Cup Final</h3>
            <p className="text-gray-600 text-sm">Over 18.4 • Wankhede Stadium, Mumbai</p>
          </div>
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs"
                  style={{ background: 'linear-gradient(to bottom right, #FF6B33, #2E4B5F)' }}
                >
                  IND
                </div>
                <span className="text-gray-900">India</span>
              </div>
              <span className="text-lg text-gray-900">187/4</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs"
                  style={{ background: 'linear-gradient(to bottom right, #2E4B5F, #5D798E)' }}
                >
                  AUS
                </div>
                <span className="text-gray-900">Australia</span>
              </div>
              <span className="text-lg text-gray-900">156/8</span>
            </div>
          </div>
          <p className="text-sm text-green-600 mb-4">India needs 32 runs from 8 balls</p>
          <button 
            onClick={handleWatchLive}
            className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Watch Live
          </button>
        </div>
      </div>

      {/* Posts Timeline */}
      <PostsFeed onNavigateToProfile={onProfileClick} />
      
      {/* Additional content to make blur more visible */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              A
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">New match created</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              B
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Player joined your team</p>
              <p className="text-xs text-gray-500">4 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              C
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Venue booking confirmed</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}