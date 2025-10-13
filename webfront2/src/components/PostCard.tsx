import React, { useState } from 'react';
import { Heart, MessageCircle, Share, MapPin, Image, Video, Send } from 'lucide-react';
import { ImageCarousel } from './ImageCarousel';
import { ErrorBoundary } from './ErrorBoundary';
import { apiService } from '../services/api';
import { PostComments } from './PostComments';
import { ShareModal } from './ShareModal';
import { ShareSuccessPopup } from './SuccessPopup';
import { MediaDisplay } from './MediaDisplay';

interface Post {
  id: string;
  content: string;
  post_type: string;
  location?: string;
  image_url?: string | string[];
  video_url?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  author: {
    id: string;
    username: string;
    initials: string;
    type?: 'player' | 'coach' | 'venue' | 'academy' | 'community';
  };
  is_liked?: boolean;
  is_bookmarked?: boolean;
  is_shared?: boolean;
}

interface PostCardProps {
  post: Post;
  onNavigateToProfile?: (profileId: string, profileType: 'player' | 'coach' | 'venue' | 'academy' | 'community') => void;
}

export function PostCard({ post, onNavigateToProfile }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [isShared, setIsShared] = useState(post.is_shared || false);
  const [sharesCount, setSharesCount] = useState(post.shares_count || 0);
  const [isSharing, setIsSharing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showShareSuccess, setShowShareSuccess] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleProfileClick = () => {
    if (onNavigateToProfile && post.author.type) {
      // Use the navigation function from App.tsx
      onNavigateToProfile(post.author.id, post.author.type);
    } else {
      // Fallback to direct URL navigation
      window.location.href = `/profile/${post.author.id}`;
    }
  };

  const handleLike = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await apiService.likePost(post.id);
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComment = () => {
    setShowCommentBox(!showCommentBox);
    // Close share modal if comment box is opened
    if (!showCommentBox) {
      setShowShareModal(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      await apiService.addComment(post.id, commentText.trim());
      setCommentText('');
      setCommentsCount(prev => prev + 1);
      setShowCommentBox(false);
      // Trigger comment refresh
      handleCommentAdded();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentAdded = () => {
    setCommentsCount(prev => prev + 1);
  };

  const handleShare = () => {
    setShowShareModal(true);
    // Close comment box if share modal is opened
    setShowCommentBox(false);
  };

  const handleShareAction = async (shareData?: { message?: string; visibility?: string }) => {
    if (isSharing) return;
    
    setIsSharing(true);
    try {
      const response = await apiService.sharePost(post.id, shareData);
      console.log('Share response:', response);
      
      if (response.success || response.message) {
        // Toggle share state
        setIsShared(!isShared);
        setSharesCount(prev => isShared ? prev - 1 : prev + 1);
        
        // Show success popup
        setShowShareSuccess(true);
        setShowShareModal(false);
      } else {
        throw new Error(response.error || 'Failed to share post');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
      alert('Failed to share post. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Post Header */}
      <div className="flex items-start space-x-3 mb-4">
        <button 
          onClick={handleProfileClick}
          className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold hover:from-orange-600 hover:to-orange-700 transition-colors cursor-pointer"
        >
          {post.author.initials}
        </button>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleProfileClick}
              className="font-semibold text-gray-900 hover:text-orange-600 transition-colors cursor-pointer"
            >
              {post.author.username}
            </button>
            <span className="text-gray-500 text-sm">•</span>
            <span className="text-gray-500 text-sm">{formatDate(post.created_at)}</span>
          </div>
          {post.location && (
            <div className="flex items-center text-gray-500 text-sm mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              {post.location}
            </div>
          )}
        </div>
        <div className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
          {post.post_type}
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-800 leading-relaxed">{post.content}</p>
      </div>

      {/* Media Display */}
      {(post.image_url || post.video_url) && (
        <div className="mb-4">
          <div className="flex items-center text-gray-500 text-sm mb-2">
            {post.image_url && <Image className="w-4 h-4 mr-1" />}
            {post.video_url && <Video className="w-4 h-4 mr-1" />}
            {post.image_url ? (Array.isArray(post.image_url) ? `${post.image_url.length} Images` : 'Image') : 'Video'}
          </div>
          <ErrorBoundary>
            <ImageCarousel 
              images={Array.isArray(post.image_url) ? post.image_url : (post.image_url ? [post.image_url] : [])}
              alt="Post images"
              className="w-full"
            />
          </ErrorBoundary>
        </div>
      )}

      {post.video_url && (
        <div className="mb-4">
          <div className="flex items-center text-gray-500 text-sm mb-2">
            <Video className="w-4 h-4 mr-1" />
            Video
          </div>
          <div className="rounded-lg overflow-hidden">
            <video 
              src={post.video_url} 
              controls 
              className="w-full h-auto max-h-96"
              onError={(e) => {
                console.error('Video failed to load:', post.video_url);
                e.currentTarget.style.display = 'none';
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <MediaDisplay 
            imageUrl={post.image_url}
            videoUrl={post.video_url}
            maxHeight="max-h-96"
          />
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          <button 
            onClick={handleLike}
            disabled={isLoading}
            className={`flex items-center space-x-2 transition-colors ${
              isLiked 
                ? 'text-red-500' 
                : 'text-gray-500 hover:text-red-500'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm">{likesCount}</span>
          </button>
              <button 
                onClick={handleComment}
                className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{commentsCount}</span>
              </button>
              <button 
                onClick={handleShare}
                disabled={isSharing}
                className={`flex items-center space-x-2 transition-colors ${
                  isShared 
                    ? 'text-green-500' 
                    : 'text-gray-500 hover:text-green-500'
                } ${isSharing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Share className={`w-5 h-5 ${isShared ? 'fill-current' : ''}`} />
                <span className="text-sm">{sharesCount}</span>
              </button>
          </div>
        </div>

        {/* Comments Section */}
        <PostComments 
          postId={post.id} 
          commentsCount={commentsCount}
          onCommentAdded={handleCommentAdded}
        />

        {/* Inline Comment Box */}
        {showCommentBox && (
          <div className="border-t border-gray-100 p-4">
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your comment..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={3}
                disabled={isSubmittingComment}
              />
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCommentBox(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={isSubmittingComment}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!commentText.trim() || isSubmittingComment}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmittingComment ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Share Modal */}
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          postId={post.id}
          postContent={post.content}
          onShare={handleShareAction}
        />

        {/* Share Success Popup */}
        <ShareSuccessPopup
          isOpen={showShareSuccess}
          onClose={() => setShowShareSuccess(false)}
          postContent={post.content}
        />
      </div>
    );
  }