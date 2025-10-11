import React, { useState } from 'react';
import { Share2, MessageCircle, Mail, Link, Copy, Check, Users, Lock, Globe, X } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postContent: string;
  onShare: (shareData?: { message?: string; visibility?: string }) => void;
}

export function ShareModal({ isOpen, onClose, postId, postContent, onShare }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [visibility, setVisibility] = useState('public');

  if (!isOpen) return null;

  const shareOptions = [
    {
      id: 'direct',
      name: 'Send to...',
      icon: MessageCircle,
      description: 'Send in a direct message',
      color: 'text-blue-500'
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      description: 'Send via email',
      color: 'text-gray-500'
    },
    {
      id: 'copy',
      name: 'Copy Link',
      icon: Link,
      description: 'Copy post link',
      color: 'text-gray-500'
    }
  ];

  const handleShare = async (option: string) => {
    switch (option) {
      case 'copy':
        const postUrl = `${window.location.origin}/post/${postId}`;
        try {
          await navigator.clipboard.writeText(postUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Failed to copy link:', err);
        }
        break;
      case 'direct':
        // Handle direct message sharing
        onShare({ message: shareMessage, visibility });
        onClose();
        break;
      case 'email':
        // Handle email sharing
        const emailUrl = `mailto:?subject=Check out this post&body=${encodeURIComponent(postContent)}`;
        window.open(emailUrl);
        onShare({ message: shareMessage, visibility });
        onClose();
        break;
      default:
        onShare({ message: shareMessage, visibility });
        onClose();
    }
  };

  const visibilityOptions = [
    {
      id: 'public',
      name: 'Public',
      description: 'Everyone can see this post',
      icon: Globe,
      color: 'text-green-500'
    },
    {
      id: 'followers',
      name: 'Followers',
      description: 'Only your followers can see',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      id: 'private',
      name: 'Private',
      description: 'Only you can see this post',
      icon: Lock,
      color: 'text-gray-500'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-md w-full transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Share Post</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Post Preview */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Sharing:</p>
          <p className="text-gray-800 text-sm line-clamp-3">{postContent}</p>
        </div>

        {/* Visibility Selection */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Who can see this post?</h4>
          <div className="space-y-2">
            {visibilityOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => setVisibility(option.id)}
                  className={`w-full flex items-center p-3 rounded-lg border transition-colors ${
                    visibility === option.id 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-full ${option.color} ${
                    visibility === option.id ? 'bg-orange-100' : 'bg-gray-100'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="ml-3 text-left">
                    <div className="font-medium text-gray-900">{option.name}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                  {visibility === option.id && (
                    <div className="ml-auto">
                      <Check className="w-5 h-5 text-orange-500" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Share Message */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add a message (optional)
          </label>
          <textarea
            value={shareMessage}
            onChange={(e) => setShareMessage(e.target.value)}
            placeholder="What do you think about this post?"
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows={3}
          />
        </div>

        {/* Share Options */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Share via</h4>
          <div className="space-y-2">
            {shareOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => handleShare(option.id)}
                  className="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className={`p-2 rounded-full bg-white ${option.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="ml-3 text-left">
                    <div className="font-medium text-gray-900">{option.name}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                  {option.id === 'copy' && copied && (
                    <div className="ml-auto flex items-center text-green-500">
                      <Check className="w-4 h-4 mr-1" />
                      <span className="text-sm">Copied!</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleShare('direct')}
            className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share Post
          </button>
        </div>
      </div>
    </div>
  );
}
