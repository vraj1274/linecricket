import React, { useState, useEffect } from 'react';
import { MessageCircle, User } from 'lucide-react';
import { apiService } from '../services/api';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    username: string;
  };
}

interface PostCommentsProps {
  postId: string;
  commentsCount: number;
  onCommentAdded: () => void;
}

export function PostComments({ postId, commentsCount, onCommentAdded }: PostCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [hasLoadedComments, setHasLoadedComments] = useState(false);

  const fetchComments = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await apiService.getComments(postId);
      if (response.success) {
        setComments(response.comments || []);
        setHasLoadedComments(true);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-load comments if there are any and we haven't loaded them yet
  useEffect(() => {
    if (commentsCount > 0 && !hasLoadedComments) {
      fetchComments();
    }
  }, [commentsCount, hasLoadedComments]);

  // Don't auto-show comments - only show when user clicks

  // Refresh comments when a new comment is added
  useEffect(() => {
    if (hasLoadedComments) {
      fetchComments();
    }
  }, [commentsCount]);

  const toggleComments = () => {
    if (!showComments && !hasLoadedComments) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="border-t border-gray-100">
      {/* Comments Toggle Button */}
      <button
        onClick={toggleComments}
        className="w-full py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2 text-gray-600">
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-medium">
            {commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}
          </span>
          {isLoading && (
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </button>

      {/* Comments List */}
      {showComments && (
        <div className="px-4 pb-4 space-y-3">
          {comments.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">
                      {comment.author.username}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-800 text-sm">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
