import React, { useState } from 'react';
import { X, Upload, Camera, Image as ImageIcon } from 'lucide-react';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageUrl: string) => void;
}

export function ImageUploadModal({ isOpen, onClose, onSave }: ImageUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', selectedFile);

      // Upload to backend (you'll need to implement this endpoint)
      const response = await fetch('http://localhost:5000/api/users/upload-profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('firebaseToken')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        onSave(data.imageUrl);
      } else {
        // Fallback: use the preview URL (for demo purposes)
        onSave(previewUrl || '');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      // Fallback: use the preview URL (for demo purposes)
      onSave(previewUrl || '');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-20 transition-opacity" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-sm bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3" style={{ backgroundColor: 'var(--cricket-green)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-white" />
                <h2 className="text-lg font-bold text-white">Change Profile Picture</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-3">
            {!previewUrl ? (
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                  dragActive 
                    ? 'border-cricket-green bg-cricket-green bg-opacity-10' 
                    : 'border-gray-300 hover:border-cricket-green'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{ 
                  borderColor: dragActive ? 'var(--cricket-green)' : undefined,
                  backgroundColor: dragActive ? 'var(--cricket-green)' : undefined,
                  '--tw-bg-opacity': dragActive ? '0.1' : undefined
                } as React.CSSProperties}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--cricket-green)' }}>
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900">Upload Profile Picture</p>
                    <p className="text-xs text-gray-600">Drag and drop an image here, or click to select</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="px-3 py-2 text-xs font-medium text-white rounded-lg cursor-pointer transition-colors"
                    style={{ backgroundColor: 'var(--cricket-green)' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--cricket-green-hover)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--cricket-green)'}
                  >
                    Choose File
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-base font-semibold text-gray-900 mb-2">Preview</p>
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-white shadow-lg"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={onClose}
                className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              {previewUrl && (
                <button
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className="px-3 py-2 text-xs font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--cricket-green)' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--cricket-green-hover)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--cricket-green)'}
                >
                  {isUploading ? (
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
