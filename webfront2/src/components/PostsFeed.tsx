import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { PostCard } from './PostCard';

interface Post {
  id: string;
  content: string;
  post_type: string;
  location?: string;
  image_url?: string;
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
}

interface PostsFeedProps {
  className?: string;
  onNavigateToProfile?: (profileId: string, profileType: 'player' | 'coach' | 'venue' | 'academy' | 'community') => void;
  userId?: string;
  pageId?: string;
  showUserPosts?: boolean;
  showPagePosts?: boolean;
}

export function PostsFeed({ className = "", onNavigateToProfile, userId, pageId, showUserPosts, showPagePosts }: PostsFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (page: number = 1, reset: boolean = false) => {
    try {
      setIsLoading(true);
      let response;
      
      // Fetch posts based on filtering criteria
      if (userId && showUserPosts) {
        response = await apiService.getPostsByUser(userId, page, 10);
      } else if (pageId && showPagePosts) {
        response = await apiService.getPostsByPage(pageId, page, 10);
      } else {
        response = await apiService.getPosts(page, 10);
      }
      
      if (response.success) {
        if (reset) {
          setPosts(response.posts);
        } else {
          setPosts(prev => [...prev, ...response.posts]);
        }
        setHasMore(page < response.pages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, true);
  }, [userId, pageId, showUserPosts, showPagePosts]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchPosts(currentPage + 1, false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onNavigateToProfile={onNavigateToProfile} />
      ))}
      
      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
          <p className="text-gray-500 mt-2">Loading posts...</p>
        </div>
      )}
      
      {hasMore && !isLoading && (
        <button
          onClick={loadMore}
          className="w-full py-3 text-orange-600 hover:text-orange-700 font-medium border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
        >
          Load More Posts
        </button>
      )}
      
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-4 text-gray-500">
          No more posts to load
        </div>
      )}
      
      {posts.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          No posts available. Try clicking "Load More Posts" to fetch posts.
        </div>
      )}
    </div>
  );
}
