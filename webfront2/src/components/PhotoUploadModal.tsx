import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, Camera, Image as ImageIcon, RotateCcw, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { apiService } from '../services/api';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoUpload: (photoUrl: string) => void;
  currentPhotoUrl?: string;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function PhotoUploadModal({ isOpen, onClose, onPhotoUpload, currentPhotoUrl }: PhotoUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setScale(1);
      setRotation(0);
      setCropArea({ x: 0, y: 0, width: 200, height: 200 });
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleCropMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDraggingCrop(true);
    setDragStart({ x: e.clientX - cropArea.x, y: e.clientY - cropArea.y });
  }, [cropArea]);

  const handleCropMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDraggingCrop) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(newX, 300 - prev.width)),
        y: Math.max(0, Math.min(newY, 300 - prev.height))
      }));
    }
  }, [isDraggingCrop, dragStart]);

  const handleCropMouseUp = useCallback(() => {
    setIsDraggingCrop(false);
  }, []);

  const cropImage = useCallback(() => {
    if (!selectedFile || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to crop area
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;

      // Apply transformations
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Draw cropped image
      ctx.drawImage(
        img,
        cropArea.x / scale,
        cropArea.y / scale,
        cropArea.width / scale,
        cropArea.height / scale,
        0,
        0,
        cropArea.width,
        cropArea.height
      );

      ctx.restore();

      // Convert to blob and upload
      canvas.toBlob(async (blob) => {
        if (blob) {
          await uploadPhoto(blob);
        }
      }, 'image/jpeg', 0.9);
    };
    img.src = previewUrl;
  }, [selectedFile, cropArea, scale, rotation, previewUrl]);

  const uploadPhoto = async (blob: Blob) => {
    setIsUploading(true);
    try {
      // Convert blob to File
      const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
      
      const result = await apiService.uploadProfileImage(file);
      
      if (result.success && result.imageUrl) {
        onPhotoUpload(result.imageUrl);
        onClose();
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = useCallback(() => {
    if (selectedFile) {
      cropImage();
    } else if (currentPhotoUrl) {
      onPhotoUpload(currentPhotoUrl);
      onClose();
    }
  }, [selectedFile, currentPhotoUrl, cropImage, onPhotoUpload, onClose]);

  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  const handleClose = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl('');
    setScale(1);
    setRotation(0);
    setCropArea({ x: 0, y: 0, width: 200, height: 200 });
    onClose();
  }, [previewUrl, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Update Profile Photo</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!selectedFile ? (
            /* Upload Area */
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-300 hover:border-orange-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <Camera className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {isDragging ? 'Drop your photo here' : 'Upload a new profile photo'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Drag and drop or click to browse
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Choose Photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            /* Photo Editor */
            <div className="space-y-6">
              {/* Preview */}
              <div className="relative">
                <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    style={{
                      transform: `scale(${scale}) rotate(${rotation}deg)`,
                      transformOrigin: 'center'
                    }}
                  />
                  {/* Crop Overlay */}
                  <div
                    className="absolute border-2 border-orange-500 bg-orange-500 bg-opacity-20 cursor-move"
                    style={{
                      left: cropArea.x,
                      top: cropArea.y,
                      width: cropArea.width,
                      height: cropArea.height
                    }}
                    onMouseDown={handleCropMouseDown}
                    onMouseMove={handleCropMouseMove}
                    onMouseUp={handleCropMouseUp}
                    onMouseLeave={handleCropMouseUp}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Zoom</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600 w-12 text-center">
                      {Math.round(scale * 100)}%
                    </span>
                    <button
                      onClick={() => setScale(Math.min(2, scale + 0.1))}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Rotation</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setRotation(rotation - 90)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600 w-12 text-center">
                      {rotation}°
                    </span>
                    <button
                      onClick={() => setRotation(rotation + 90)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center space-x-3">
            {selectedFile && (
              <button
                onClick={handleRemove}
                className="px-4 py-2 text-red-600 hover:text-red-800 transition-colors"
              >
                Remove
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isUploading}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Save Photo'}
            </button>
          </div>
        </div>

        {/* Hidden Canvas for Cropping */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
