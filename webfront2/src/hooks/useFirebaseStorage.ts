import { useState } from 'react';
import { storageService } from '../services/firebase';

interface StorageState {
  uploading: boolean;
  error: string | null;
  progress: number;
}

export const useFirebaseStorage = () => {
  const [state, setState] = useState<StorageState>({
    uploading: false,
    error: null,
    progress: 0,
  });

  const uploadFile = async (
    file: File,
    path: string,
    metadata?: any
  ) => {
    try {
      setState({ uploading: true, error: null, progress: 0 });
      
      // Simulate progress (Firebase doesn't provide real-time progress for uploadBytes)
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 100);

      const result = await storageService.uploadFile(file, path, metadata);
      
      clearInterval(progressInterval);
      setState({ uploading: false, error: null, progress: 100 });
      
      return result;
    } catch (error: any) {
      setState({ 
        uploading: false, 
        error: error.message || 'Upload failed', 
        progress: 0 
      });
      throw error;
    }
  };

  const uploadImage = async (
    file: File,
    userId: string,
    folder: string = 'images'
  ) => {
    try {
      setState({ uploading: true, error: null, progress: 0 });
      
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 100);

      const url = await storageService.uploadImage(file, userId, folder);
      
      clearInterval(progressInterval);
      setState({ uploading: false, error: null, progress: 100 });
      
      return url;
    } catch (error: any) {
      setState({ 
        uploading: false, 
        error: error.message || 'Image upload failed', 
        progress: 0 
      });
      throw error;
    }
  };

  const getDownloadURL = async (path: string) => {
    try {
      setState(prev => ({ ...prev, error: null }));
      return await storageService.getDownloadURL(path);
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to get download URL' 
      }));
      throw error;
    }
  };

  const deleteFile = async (path: string) => {
    try {
      setState(prev => ({ ...prev, error: null }));
      await storageService.deleteFile(path);
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to delete file' 
      }));
      throw error;
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    ...state,
    uploadFile,
    uploadImage,
    getDownloadURL,
    deleteFile,
    clearError,
  };
};
