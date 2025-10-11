import React, { useState } from 'react';
import { CreatePost } from './CreatePost';
import { useProfileSwitch } from '../contexts/ProfileSwitchContext';

interface CreatePageProps {
  onCreatePost: () => void;
}

export function CreatePage({ onCreatePost }: CreatePageProps) {
  const { addProfile } = useProfileSwitch();
  const [hasCreatedPage, setHasCreatedPage] = useState(false);

  const handlePostCreated = () => {
    // Create a page in switch profile section when post is created
    if (!hasCreatedPage) {
      const newPage = {
        id: `page_${Date.now()}`,
        type: 'community' as const,
        name: 'My Created Page',
        username: '@my_created_page',
        avatar: 'MP',
        color: 'linear-gradient(to bottom right, #FF6B33, #2E4B5F)',
        isActive: true,
        createdAt: new Date().toISOString(),
        firebaseUid: 'created-page'
      };
      
      addProfile(newPage);
      setHasCreatedPage(true);
      alert('Page created successfully! You can now find it in the switch profile section.');
    }
    
    onCreatePost();
  };

  const handleBack = () => {
    // Navigate back to home or previous page
    window.history.back();
  };

  // Show CreatePost form directly
  return <CreatePost onCreatePost={handlePostCreated} onBack={handleBack} />;
}