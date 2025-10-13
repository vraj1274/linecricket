import { Eye, Hash, Image, MapPin, Video, X, Users, ArrowLeft, Globe } from 'lucide-react';
import React, { useState } from 'react';
import { apiService } from '../services/api';

// CreatePost component for post creation functionality

interface CreatePostProps {
  onCreatePost: () => void;
  onBack?: () => void;
}

export function CreatePost({ onCreatePost, onBack }: CreatePostProps) {
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [isCreating, setIsCreating] = useState(false);
  const [mediaType, setMediaType] = useState<'images' | 'video' | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() && images.length === 0 && !video) return;
    
    try {
      setIsCreating(true);
      
      const postData = {
        content: caption.trim(),
        image_url: images.length > 0 ? images[0] : undefined, // Send first image as string
        image_caption: images.length > 0 ? caption.trim() : undefined, // Use caption as image caption
        video_url: video || undefined, // Rename video to video_url for clarity
        location: location || undefined,
        post_type: 'general',
        visibility: visibility
      };
      
      console.log('📤 Sending post data:', postData);
      const response = await apiService.createSocialPost(postData);
      console.log('📥 Received response:', response);
      
      if (response.success) {
        alert('Post created successfully! 🏏');
        // Reset form
        setCaption('');
        setImages([]);
        setVideo('');
        setLocation('');
        setVisibility('public');
        setMediaType(null);
        
        
        onCreatePost();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Limit to 10 images total
      const maxImages = 10;
      const currentCount = images.length;
      const availableSlots = maxImages - currentCount;
      
      if (availableSlots <= 0) {
        alert('You can only upload up to 10 images');
        return;
      }
      
      const filesToAdd = Array.from(files).slice(0, availableSlots);
      const newImages = filesToAdd.map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages]);
      setMediaType('images');
      setVideo(''); // Clear video if images are selected
      
      if (files.length > availableSlots) {
        alert(`Only ${availableSlots} more images can be added (max 10 total)`);
      }
    }
    
    // Reset the input value to allow selecting the same files again
    event.target.value = '';
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        alert('Video file is too large. Please select a file smaller than 100MB.');
        return;
      }
      
      setVideo(URL.createObjectURL(file));
      setMediaType('video');
      setImages([]); // Clear images if video is selected
    }
    
    // Reset the input value to allow selecting the same file again
    event.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideo('');
    setMediaType(null);
  };



  const extractHashtags = (content: string) => {
    return content.match(/#\w+/g) || [];
  };

  const extractMentions = (content: string) => {
    return content.match(/@\w+/g) || [];
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">Create Post</h1>
        </div>

        {/* Create Post Form */}
        <div className="space-y-8">

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Media Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Add Media</label>
              <div className="grid grid-cols-2 gap-4">
                {/* Image Upload */}
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                  video ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50' : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'
                }`}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={!!video}
                  />
                  <label htmlFor="image-upload" className={`cursor-pointer block ${video ? 'cursor-not-allowed' : ''}`}>
                    <div className="flex flex-col items-center space-y-3">
                      <div className={`p-2 rounded-lg ${video ? 'bg-gray-100' : 'bg-orange-100'}`}>
                        <Image className={`w-8 h-8 ${video ? 'text-gray-400' : 'text-orange-500'}`} />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${video ? 'text-gray-400' : 'text-gray-700'}`}>Add Images</p>
                        <p className={`text-xs mt-1 ${video ? 'text-gray-300' : 'text-gray-500'}`}>
                          {video ? 'Disabled when video is selected' : 'Click to select multiple images (up to 10)'}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Video Upload */}
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                  images.length > 0 ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50' : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'
                }`}>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                    disabled={images.length > 0}
                  />
                  <label htmlFor="video-upload" className={`cursor-pointer block ${images.length > 0 ? 'cursor-not-allowed' : ''}`}>
                    <div className="flex flex-col items-center space-y-3">
                      <div className={`p-2 rounded-lg ${images.length > 0 ? 'bg-gray-100' : 'bg-orange-100'}`}>
                        <Video className={`w-8 h-8 ${images.length > 0 ? 'text-gray-400' : 'text-orange-500'}`} />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${images.length > 0 ? 'text-gray-400' : 'text-gray-700'}`}>Add Video</p>
                        <p className={`text-xs mt-1 ${images.length > 0 ? 'text-gray-300' : 'text-gray-500'}`}>
                          {images.length > 0 ? 'Disabled when images are selected' : 'One video at a time'}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Caption */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Caption *</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption for your post... Use #hashtags and @mentions"
                className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-gray-700"
                rows={4}
                maxLength={500}
                required
              />
              <div className="flex justify-between items-center mt-2">
                <div className="text-sm text-gray-500">
                  {caption.length}/500 characters
                </div>
                <div className="flex space-x-2">
                  {extractHashtags(caption).map((hashtag, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {hashtag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Media Preview */}
            {(images.length > 0 || video) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Media Preview</label>
                
                {/* Images Preview */}
                {images.length > 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={image} 
                            alt={`Preview ${index + 1}`} 
                            className="w-full h-32 object-cover rounded-lg shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-gray-500 text-center">
                      {images.length} image{images.length !== 1 ? 's' : ''} selected
                    </div>
                  </div>
                )}

                {/* Video Preview */}
                {video && (
                  <div className="space-y-4">
                    <div className="relative group">
                      <video 
                        src={video} 
                        controls 
                        className="w-full h-64 object-cover rounded-lg shadow-sm"
                        poster=""
                      />
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-500 text-center">
                      Video selected
                    </div>
                  </div>
                )}
              </div>
            )}


            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Location (Optional)</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where are you posting from?"
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700"
                />
              </div>
            </div>

            {/* Visibility Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Who can see this post?</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all duration-200 ${
                    visibility === 'public' 
                      ? 'border-orange-500 bg-orange-500 text-white shadow-sm' 
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">Public</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('followers')}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all duration-200 ${
                    visibility === 'followers' 
                      ? 'border-orange-500 bg-orange-500 text-white shadow-sm' 
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Followers</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all duration-200 ${
                    visibility === 'private' 
                      ? 'border-orange-500 bg-orange-500 text-white shadow-sm' 
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Hash className="w-4 h-4" />
                  <span className="text-sm font-medium">Private</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end pt-6">
              <button 
                type="submit"
                disabled={(!caption.trim() && images.length === 0 && !video) || isCreating}
                className="px-8 py-3 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
                style={{ 
                  background: 'linear-gradient(90deg, #FF6B33 0%, #FF8C42 50%, #E5E7EB 100%)',
                  boxShadow: '0 4px 15px rgba(255, 107, 51, 0.3)'
                }}
              >
                {isCreating ? 'Posting...' : 'Share Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}