import { Eye, Hash, Image, MapPin, Video, X, Users, ArrowLeft } from 'lucide-react';
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
        image_url: images.length > 0 ? images : undefined, // Send all images as array
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
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideo(URL.createObjectURL(file));
      setMediaType('video');
      setImages([]); // Clear images if video is selected
    }
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
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <h2 className="text-2xl font-bold text-gray-900">Create Post</h2>
          </div>
        </div>

      {/* Create Post Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Media Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Add Media</label>
              <div className="grid grid-cols-2 gap-4">
                {/* Image Upload */}
                <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                  video ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50' : 'border-gray-300 hover:border-orange-500'
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
                  <label htmlFor="image-upload" className={`cursor-pointer ${video ? 'cursor-not-allowed' : ''}`}>
                    <Image className={`w-8 h-8 mx-auto mb-2 ${video ? 'text-gray-300' : 'text-gray-400'}`} />
                    <p className={`text-sm ${video ? 'text-gray-400' : 'text-gray-600'}`}>Add Images</p>
                    <p className={`text-xs ${video ? 'text-gray-300' : 'text-gray-500'}`}>
                      {video ? 'Disabled when video is selected' : 'Click to select multiple images (up to 10)'}
                    </p>
                  </label>
                </div>

                {/* Video Upload */}
                <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                  images.length > 0 ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50' : 'border-gray-300 hover:border-orange-500'
                }`}>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                    disabled={images.length > 0}
                  />
                  <label htmlFor="video-upload" className={`cursor-pointer ${images.length > 0 ? 'cursor-not-allowed' : ''}`}>
                    <Video className={`w-8 h-8 mx-auto mb-2 ${images.length > 0 ? 'text-gray-300' : 'text-gray-400'}`} />
                    <p className={`text-sm ${images.length > 0 ? 'text-gray-400' : 'text-gray-600'}`}>Add Video</p>
                    <p className={`text-xs ${images.length > 0 ? 'text-gray-300' : 'text-gray-500'}`}>
                      {images.length > 0 ? 'Disabled when images are selected' : 'One video at a time'}
                    </p>
                  </label>
                </div>
              </div>
            </div>

            {/* Caption */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Caption *</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption for your post... Use #hashtags and @mentions"
                className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                rows={4}
                required
              />
              <div className="flex justify-between items-center mt-2">
                <div className="text-sm text-gray-500">
                  {caption.length}/500 characters
                </div>
                <div className="flex space-x-2">
                  {extractHashtags(caption).map((hashtag, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={image} 
                          alt={`Preview ${index + 1}`} 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Video Preview */}
                {video && (
                  <div className="relative">
                    <video 
                      src={video} 
                      controls 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}


            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location (Optional)</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where are you posting from?"
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Visibility Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Who can see this post?</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                    visibility === 'public' 
                      ? 'border-orange-500 bg-orange-50 text-orange-700' 
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Public</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('followers')}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                    visibility === 'followers' 
                      ? 'border-orange-500 bg-orange-50 text-orange-700' 
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Followers</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                    visibility === 'private' 
                      ? 'border-orange-500 bg-orange-50 text-orange-700' 
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Hash className="w-4 h-4" />
                  <span className="text-sm">Private</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end pt-4 border-t border-gray-200">
              <button 
                type="submit"
                disabled={(!caption.trim() && images.length === 0 && !video) || isCreating}
                className="px-8 py-3 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ background: 'linear-gradient(to right, #FF6B33, #2E4B5F)' }}
              >
                {isCreating ? 'Posting...' : 'Share Post'}
              </button>
            </div>
          </form>
        </div>
    </div>
  );
}