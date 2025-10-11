import React, { useState } from 'react';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from 'lucide-react';

interface Post {
  id: number;
  author: string;
  authorInitials: string;
  location: string;
  timeAgo: string;
  content: string;
  imageContent: string;
  imageCaption: string;
  likes: number;
  comments: number;
  gradient: string;
}

interface PostCardProps {
  post: Post;
  onLike: () => void;
}

export function PostCard({ post, onLike }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(post.likes);

  const handleLike = () => {
    if (isLiked) {
      setCurrentLikes(prev => prev - 1);
    } else {
      setCurrentLikes(prev => prev + 1);
      onLike();
    }
    setIsLiked(!isLiked);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-3">
          <div 
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-sm bg-gradient-to-br ${post.gradient}`}
          >
            {post.authorInitials}
          </div>
          <div>
            <p>{post.author}</p>
            <p className="text-gray-500 text-sm">{post.location} • {post.timeAgo}</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      
      <div className="px-6 pb-4">
        <p className="text-gray-800 mb-4">{post.content}</p>
      </div>
      
      <div 
        className="aspect-video flex items-center justify-center mx-6 mb-4 rounded-xl"
        style={{ 
          background: 'linear-gradient(to bottom right, rgba(255, 107, 51, 0.2), rgba(93, 121, 142, 0.2), rgba(46, 75, 95, 0.2))' 
        }}
      >
        <div className="text-center text-gray-600">
          <div className="text-8xl mb-4">{post.imageContent}</div>
          <p className="text-lg">{post.imageCaption}</p>
        </div>
      </div>
      
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-8">
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">Like</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-6 h-6" />
              <span className="text-sm">Comment</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
              <Share className="w-6 h-6" />
              <span className="text-sm">Share</span>
            </button>
          </div>
          <button className="text-gray-500 hover:text-orange-500 transition-colors">
            <Bookmark className="w-6 h-6" />
          </button>
        </div>
        
        <p className="text-sm mb-2">
          <span>{currentLikes.toLocaleString()}</span> likes
        </p>
        <button className="text-gray-500 text-sm hover:text-gray-700">
          View all {post.comments.toLocaleString()} comments
        </button>
      </div>
    </div>
  );
}