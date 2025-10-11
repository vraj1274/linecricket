import { Calendar, Image } from 'lucide-react';

interface CreatePostBoxProps {
  onCreateClick?: () => void;
}

export function CreatePostBox({ onCreateClick }: CreatePostBoxProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center space-x-4">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm"
          style={{ background: 'linear-gradient(to bottom right, #5D798E, #2E4B5F)' }}
        >
          You
        </div>
        <button 
          onClick={onCreateClick}
          className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-3 text-left text-gray-500 transition-colors"
        >
          What's happening in cricket today?
        </button>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex space-x-6">
          <button className="flex items-center space-x-2 text-gray-500 hover:text-orange-500 transition-colors">
            <Image className="w-5 h-5" />
            <span className="text-sm">Photo</span>
          </button>
          <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
            <Calendar className="w-5 h-5" />
            <span className="text-sm">Match</span>
          </button>
        </div>
        <button 
          onClick={onCreateClick}
          className="px-6 py-2 text-white rounded-full text-sm"
          style={{ background: 'linear-gradient(to right, #FF6B33, #2E4B5F)' }}
        >
          Post
        </button>
      </div>
    </div>
  );
}