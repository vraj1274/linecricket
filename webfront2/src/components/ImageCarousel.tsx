import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Image } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  alt?: string;
  className?: string;
}

export function ImageCarousel({ images, alt = "Post images", className = "" }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Validate props
  if (!images || !Array.isArray(images)) {
    console.warn('ImageCarousel: images prop must be an array');
    return null;
  }

  // Reset current index when images change
  useEffect(() => {
    setCurrentIndex(0);
    setLoadedImages(new Set());
    setImageErrors(new Set());
  }, [images]);

  // Auto-advance slides every 3 seconds (optional)
  useEffect(() => {
    if (images.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set([...prev, index]));
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set([...prev, index]));
    console.error(`Image ${index + 1} failed to load:`, images[index]);
  };

  // Handle edge cases
  if (!images || images.length === 0) return null;

  // Filter out images that failed to load
  const validImages = images.filter((_, index) => !imageErrors.has(index));
  const validCurrentIndex = validImages.length > 0 ? Math.min(currentIndex, validImages.length - 1) : 0;

  return (
    <>
      {/* Main Carousel */}
      <div className={`relative group ${className}`}>
        {/* Image Container */}
        <div className="relative overflow-hidden rounded-lg bg-gray-100">
          {validImages.length === 0 ? (
            <div className="w-full h-48 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No images available</p>
              </div>
            </div>
          ) : (
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${validCurrentIndex * 100}%)` }}
            >
              {validImages.map((image, index) => (
                <div key={index} className="w-full flex-shrink-0 relative">
                  {!loadedImages.has(index) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                    </div>
                  )}
                  <img
                    src={image}
                    alt={`${alt} ${index + 1}`}
                    className={`w-full h-auto max-h-96 object-cover cursor-pointer transition-opacity duration-300 ${
                      loadedImages.has(index) ? 'opacity-100' : 'opacity-0'
                    }`}
                    onClick={openFullscreen}
                    onLoad={() => handleImageLoad(index)}
                    onError={() => handleImageError(index)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Navigation Arrows - Show on hover */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {validImages.length > 1 && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              {validCurrentIndex + 1} / {validImages.length}
            </div>
          )}

          {/* Dot Indicators */}
          {validImages.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {validImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    index === validCurrentIndex 
                      ? 'bg-white' 
                      : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              aria-label="Close fullscreen"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Fullscreen Image Container */}
            <div className="relative w-full h-full flex items-center justify-center">
              <div 
                className="flex transition-transform duration-300 ease-in-out h-full"
                style={{ transform: `translateX(-${validCurrentIndex * 100}%)` }}
              >
                {validImages.map((image, index) => (
                  <div key={index} className="w-full h-full flex-shrink-0 flex items-center justify-center">
                    <img
                      src={image}
                      alt={`${alt} ${index + 1}`}
                      className="max-w-full max-h-full object-contain"
                      onError={() => handleImageError(index)}
                    />
                  </div>
                ))}
              </div>

              {/* Fullscreen Navigation */}
              {validImages.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Fullscreen Dot Indicators */}
              {validImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {validImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                        index === validCurrentIndex 
                          ? 'bg-white' 
                          : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
