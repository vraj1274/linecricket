import React, { useState } from 'react';
import { Image } from 'lucide-react';
import { useMobileApp } from '../contexts/MobileAppContext';
import { apiService } from '../services/api';

interface CreatePostBoxProps {
  onCreateClick?: () => void;
  disablePopups?: boolean;
}

export function CreatePostBox({ onCreateClick, disablePopups = false }: CreatePostBoxProps) {
  const { showMobileAppModal } = useMobileApp();
  const [postContent, setPostContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    
    try {
      setIsCreating(true);
      await apiService.createPost({
        content: postContent,
        location: 'Home'
      });
      
      setPostContent('');
      onCreateClick?.();
      alert('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handlePhotoClick = () => {
    if (disablePopups) {
      // In a real app, this would open file picker
      alert('Photo upload functionality would open here');
    } else {
      showMobileAppModal();
    }
  };
  
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center space-x-3">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
          style={{ background: 'linear-gradient(to bottom right, #5D798E, #2E4B5F)' }}
        >
          You
        </div>
        <input
          type="text"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder="What's happening in cricket today?"
          className="flex-1 bg-gray-50 hover:bg-gray-100 rounded-full px-4 py-2 text-left text-gray-900 transition-colors text-sm border border-gray-200 outline-none"
        />
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex space-x-4">
          <button 
            onClick={disablePopups ? handlePhotoClick : showMobileAppModal}
            className="flex items-center space-x-2 text-gray-500 hover:text-orange-500 transition-colors"
          >
            <Image className="w-4 h-4" />
            <span className="text-xs">Photo</span>
          </button>
        </div>
        <button 
          onClick={disablePopups ? handleCreatePost : showMobileAppModal}
          disabled={!postContent.trim() || isCreating}
          className="px-4 py-1.5 text-white rounded-md text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(to right, #FF6B33, #2E4B5F)' }}
        >
          {isCreating ? 'Posting...' : 'Share'}
        </button>
      </div>
    </div>
  );
}