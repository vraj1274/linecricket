import React from 'react';

export function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: 'like',
      user: 'virat_kohli',
      userInitials: 'VK',
      action: 'liked your post about the match highlights.',
      time: '2 hours ago',
      gradient: 'from-orange-500 to-slate-600',
      hasImage: true
    },
    {
      id: 2,
      type: 'follow',
      user: 'msd_official',
      userInitials: 'MS',
      action: 'started following you.',
      time: '5 hours ago',
      gradient: 'from-slate-700 to-orange-500',
      hasImage: false
    },
    {
      id: 3,
      type: 'comment',
      user: 'rohit_sharma',
      userInitials: 'RG',
      action: 'commented: "Great shot! 🏏"',
      time: '1 day ago',
      gradient: 'from-slate-600 to-orange-500',
      hasImage: true
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl mb-8">Notifications</h2>
      
      <div className="space-y-4">
        {notifications.map(notification => (
          <div key={notification.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <div 
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-sm bg-gradient-to-br ${notification.gradient}`}
              >
                {notification.userInitials}
              </div>
              <div className="flex-1">
                <p className="text-gray-800">
                  <span className="font-semibold">{notification.user}</span> {notification.action}
                </p>
                <p className="text-sm text-gray-500 mt-1">{notification.time}</p>
              </div>
              {notification.type === 'follow' ? (
                <button className="px-6 py-2 text-white rounded-lg" style={{ background: 'linear-gradient(to right, #FF6B33, #2E4B5F)' }}>
                  Connect Back
                </button>
              ) : notification.hasImage ? (
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}