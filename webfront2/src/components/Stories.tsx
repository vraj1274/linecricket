import React from 'react';

export function Stories() {
  const stories = [
    { name: 'Your story', initials: 'You', gradient: 'from-slate-600 to-slate-700' },
    { name: 'virat_kohli', initials: 'VK', gradient: 'from-orange-500 to-slate-600' },
    { name: 'msd_official', initials: 'MS', gradient: 'from-slate-700 to-orange-500' },
    { name: 'rohit_sharma', initials: 'RG', gradient: 'from-slate-600 to-orange-500' },
  ];

  return (
    <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg mb-4">Stories</h3>
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {stories.map((story, index) => (
          <div key={index} className="flex flex-col items-center space-y-2 flex-shrink-0">
            <div className="p-0.5 rounded-full bg-gradient-to-r from-orange-500 via-slate-600 to-slate-700">
              <div 
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-sm bg-gradient-to-br ${story.gradient}`}
              >
                {story.initials}
              </div>
            </div>
            <span className="text-xs text-gray-600">{story.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}