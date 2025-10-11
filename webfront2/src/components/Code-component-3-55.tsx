import React from 'react';

export function MessagesPage() {
  const conversations = [
    {
      id: 1,
      user: 'virat_kohli',
      userInitials: 'VK',
      lastMessage: 'Great match today!',
      time: '2h',
      unread: true,
      gradient: 'from-orange-500 to-slate-600'
    },
    {
      id: 2,
      user: 'msd_official',
      userInitials: 'MS',
      lastMessage: 'Training tomorrow?',
      time: '5h',
      unread: false,
      gradient: 'from-slate-700 to-orange-500'
    },
    {
      id: 3,
      user: 'rohit_sharma',
      userInitials: 'RG',
      lastMessage: 'See you at practice!',
      time: '1d',
      unread: false,
      gradient: 'from-slate-600 to-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl mb-8">Messages</h2>
      
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="space-y-1">
          {conversations.map(conversation => (
            <div 
              key={conversation.id} 
              className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                conversation.unread ? 'border-l-4 border-orange-500' : ''
              }`}
            >
              <div className="flex items-center space-x-4">
                <div 
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-sm bg-gradient-to-br ${conversation.gradient}`}
                >
                  {conversation.userInitials}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{conversation.user}</p>
                    <p className="text-sm text-gray-500">{conversation.time}</p>
                  </div>
                  <p className="text-gray-600">{conversation.lastMessage}</p>
                </div>
                {conversation.unread && (
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}