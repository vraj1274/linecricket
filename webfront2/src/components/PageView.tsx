import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Edit3, 
  Save, 
  X, 
  Building2, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  MapPin as LocationIcon,
  Calendar,
  Users,
  Star,
  CheckCircle
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface PageViewProps {
  onBack: () => void;
  pageId: string;
  pageType: 'academy' | 'venue' | 'community';
  onEdit?: (pageId: string, pageType: string) => void;
}

interface PageData {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  contact_number: string;
  email: string;
  website: string;
  academy_type?: string;
  level?: string;
  facilities?: string;
  social_media_links?: string;
  allow_messages: boolean;
  show_contact: boolean;
  created_at: string;
  updated_at: string;
}

export function PageView({ onBack, pageId, pageType, onEdit }: PageViewProps) {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<PageData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadPageData();
  }, [pageId, pageType]);

  const loadPageData = async () => {
    try {
      setIsLoading(true);
      // Mock data for now - replace with actual API call
      const mockData: PageData = {
        id: pageId,
        name: 'Sample Academy',
        description: 'A premier cricket academy dedicated to developing young talent and providing world-class coaching.',
        address: '123 Cricket Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        contact_number: '+91 98765 43210',
        email: 'info@sampleacademy.com',
        website: 'https://sampleacademy.com',
        academy_type: 'CRICKET_ACADEMY',
        level: 'ALL_LEVELS',
        facilities: 'Indoor nets, outdoor ground, gym, swimming pool',
        social_media_links: 'https://instagram.com/sampleacademy',
        allow_messages: true,
        show_contact: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setPageData(mockData);
      setEditData(mockData);
    } catch (error) {
      console.error('Error loading page data:', error);
      showToast('Failed to load page data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(pageData || {});
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // TODO: Implement API call to update page data
      console.log('Saving page data:', editData);
      
      // Mock save - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPageData(editData as PageData);
      setIsEditing(false);
      showToast('Page updated successfully!', 'success');
    } catch (error) {
      console.error('Error saving page data:', error);
      showToast('Failed to save changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(pageData || {});
  };

  const handleInputChange = (field: keyof PageData, value: any) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getPageIcon = () => {
    switch (pageType) {
      case 'academy':
        return <Building2 className="w-8 h-8" />;
      case 'venue':
        return <MapPin className="w-8 h-8" />;
      case 'community':
        return <Globe className="w-8 h-8" />;
      default:
        return <Building2 className="w-8 h-8" />;
    }
  };

  const getPageColor = () => {
    switch (pageType) {
      case 'academy':
        return 'from-purple-500 to-purple-700';
      case 'venue':
        return 'from-green-500 to-green-700';
      case 'community':
        return 'from-indigo-500 to-indigo-700';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  const getPageTitle = () => {
    switch (pageType) {
      case 'academy':
        return 'Academy Page';
      case 'venue':
        return 'Venue Page';
      case 'community':
        return 'Community Page';
      default:
        return 'Page';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Page not found</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{getPageTitle()}</h1>
                <p className="text-sm text-gray-500">{pageData.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="bg-white">
          {/* Cover Image */}
          <div className={`relative h-48 bg-gradient-to-r ${getPageColor()}`}>
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute bottom-4 left-6">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center text-white">
                  {getPageIcon()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{pageData.name}</h2>
                  <p className="text-white text-opacity-90">{getPageTitle()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Page Details */}
          <div className="p-6">
            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={editData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={editData.contact_number || ''}
                      onChange={(e) => handleInputChange('contact_number', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={editData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={editData.city || ''}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      value={editData.state || ''}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={editData.country || ''}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-gray-700">{pageData.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{pageData.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{pageData.contact_number}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <LocationIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{pageData.address}, {pageData.city}, {pageData.state}, {pageData.country}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Page Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">Created {new Date(pageData.created_at).toLocaleDateString()}</span>
                      </div>
                      {pageData.academy_type && (
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700 capitalize">{pageData.academy_type.replace('_', ' ')}</span>
                        </div>
                      )}
                      {pageData.level && (
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700 capitalize">{pageData.level.replace('_', ' ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {pageData.facilities && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Facilities</h4>
                    <p className="text-gray-700">{pageData.facilities}</p>
                  </div>
                )}

                {pageData.website && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Website</h4>
                    <a 
                      href={pageData.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {pageData.website}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
