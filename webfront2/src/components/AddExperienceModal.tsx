import React, { useState } from 'react';
import { X, Save, Briefcase } from 'lucide-react';

interface AddExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (experience: any) => void;
  editData?: any;
}

export function AddExperienceModal({ isOpen, onClose, onSave, editData }: AddExperienceModalProps) {
  const [formData, setFormData] = useState({
    title: editData?.title || '',
    company: editData?.company || '',
    duration: editData?.duration || '',
    description: editData?.description || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      setFormData({
        title: '',
        company: '',
        duration: '',
        description: '',
      });
    } catch (error) {
      console.error('Error saving experience:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-20 transition-opacity" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-sm bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3" style={{ backgroundColor: 'var(--sky-blue)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-white" />
                <h2 className="text-lg font-bold text-white">
                  {editData ? 'Edit Experience' : 'Add Experience'}
                </h2>
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
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors text-sm"
                style={{ '--tw-ring-color': 'var(--sky-blue)' } as React.CSSProperties}
                onFocus={(e) => e.target.style.borderColor = 'var(--sky-blue)'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                placeholder="e.g., Cricket Coach"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company/Organization</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors text-sm"
                style={{ '--tw-ring-color': 'var(--sky-blue)' } as React.CSSProperties}
                onFocus={(e) => e.target.style.borderColor = 'var(--sky-blue)'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                placeholder="e.g., Mumbai Cricket Academy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors text-sm"
                style={{ '--tw-ring-color': 'var(--sky-blue)' } as React.CSSProperties}
                onFocus={(e) => e.target.style.borderColor = 'var(--sky-blue)'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                placeholder="e.g., 2020 - 2023"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                placeholder="Describe your experience..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 text-sm rounded-lg transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--sky-blue)' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--cricket-green)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--sky-blue)'}
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>
                  {isSubmitting ? 'Saving...' : (editData ? 'Update' : 'Add')}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
