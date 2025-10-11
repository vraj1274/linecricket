import React, { useState } from 'react';
import { Image, Video, ExternalLink } from 'lucide-react';

interface MediaDisplayProps {
  imageUrl?: string;
  videoUrl?: string;
  className?: string;
  maxHeight?: string;
}

export function MediaDisplay({ 
  imageUrl, 
  videoUrl, 
  className = "", 
  maxHeight = "max-h-96" 
}: MediaDisplayProps) {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  if (imageUrl && !imageError) {
    return (
      <div className={`relative rounded-lg overflow-hidden bg-gray-100 ${className}`}>
        <img 
          src={imageUrl} 
          alt="Post image" 
          className={`w-full ${maxHeight} object-cover cursor-pointer hover:opacity-95 transition-opacity`}
          onClick={() => window.open(imageUrl, '_blank')}
          onError={() => setImageError(true)}
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded">
          <ExternalLink className="w-4 h-4" />
        </div>
      </div>
    );
  }

  if (videoUrl && !videoError) {
    return (
      <div className={`relative rounded-lg overflow-hidden bg-gray-100 ${className}`}>
        <video 
          src={videoUrl} 
          controls 
          className={`w-full ${maxHeight} object-cover`}
          preload="metadata"
          onError={() => setVideoError(true)}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // Error fallback
  if ((imageUrl && imageError) || (videoUrl && videoError)) {
    return (
      <div className={`relative rounded-lg overflow-hidden bg-gray-100 ${className}`}>
        <div className="flex items-center justify-center bg-gray-100 p-8">
          <div className="text-center">
            {imageUrl && imageError && (
              <>
                <Image className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm mb-2">Failed to load image</p>
                <a 
                  href={imageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-600 text-sm underline flex items-center justify-center space-x-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View original</span>
                </a>
              </>
            )}
            {videoUrl && videoError && (
              <>
                <Video className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm mb-2">Failed to load video</p>
                <a 
                  href={videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-600 text-sm underline flex items-center justify-center space-x-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View original</span>
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}


