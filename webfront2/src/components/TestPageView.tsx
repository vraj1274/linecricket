import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit3, Eye, Share, Calendar, MapPin, Phone, Mail, Globe, Building2, Users, Star, Settings, Trash2 } from 'lucide-react';

interface TestPageViewProps {
  onBack: () => void;
  pageId?: string;
  pageName?: string;
  pageType?: 'academy' | 'venue' | 'community' | 'club';
}

export function TestPageView({ onBack, pageId, pageName, pageType }: TestPageViewProps) {
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug logging
  console.log('TestPageView props:', { pageId, pageName, pageType });

  // Fetch page data from backend API
  const fetchPageData = async () => {
    if (!pageId) return;
    
    try {
      setLoading(true);
      const actualPageId = pageId?.startsWith('page_') ? pageId.substring(5) : pageId;
      console.log('🔄 Fetching page data for ID:', actualPageId);
      
      const response = await fetch(`http://localhost:5000/api/profiles/${actualPageId}`);
      const data = await response.json();
      
      if (data.success && data.profile) {
        console.log('✅ Page data fetched successfully:', data.profile);
        const profile = data.profile;
        
        setPageData({
          id: profile.page_id || profile.id,
          name: profile.academy_name || profile.name || pageName || 'My Page',
          description: profile.description || profile.bio || 'This is a sample page created for testing purposes.',
          location: profile.city + ', ' + profile.state || 'Mumbai, India',
          contact: profile.contact_number || profile.email || 'contact@example.com',
          email: profile.email || 'contact@example.com',
          website: profile.website || 'https://example.com',
          page_type: profile.page_type || pageType || 'academy',
          created_at: profile.created_at || new Date().toISOString(),
          // Type-specific fields
          academy_type: profile.academy_type || '',
          level: profile.level || '',
          venue_type: profile.venue_type || '',
          ground_type: profile.ground_type || '',
          community_type: profile.community_type || '',
          // Additional fields
          established_year: profile.established_year || null,
          accreditation: profile.accreditation || '',
          coaching_staff_count: profile.coaching_staff_count || 0,
          total_students: profile.total_students || 0,
          facilities: profile.facilities || [],
          services_offered: profile.services_offered || []
        });
      } else {
        console.error('❌ Failed to fetch page data:', data.error);
        setError(data.error || 'Failed to fetch page data');
      }
    } catch (error) {
      console.error('❌ Error fetching page data:', error);
      setError('Failed to fetch page data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pageId) {
      console.log('🔄 Component mounted, fetching data for pageId:', pageId);
      fetchPageData();
    }
  }, [pageId]);

  const getPageIcon = () => {
    switch (pageType) {
      case 'academy':
        return <Building2 className="w-6 h-6" />;
      case 'venue':
        return <MapPin className="w-6 h-6" />;
      case 'community':
        return <Users className="w-6 h-6" />;
      default:
        return <Building2 className="w-6 h-6" />;
    }
  };

  const getPageColor = () => {
    switch (pageType) {
      case 'academy':
        return 'linear-gradient(to bottom right, #3B82F6, #1D4ED8)';
      case 'venue':
        return 'linear-gradient(to bottom right, #10B981, #059669)';
      case 'community':
        return 'linear-gradient(to bottom right, #F59E0B, #D97706)';
      default:
        return 'linear-gradient(to bottom right, #6B7280, #4B5563)';
    }
  };

  const getPageTitle = () => {
    switch (pageType) {
      case 'academy':
        return 'Cricket Academy';
      case 'venue':
        return 'Cricket Venue';
      case 'community':
        return 'Cricket Community';
      default:
        return 'Page';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Settings className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Page not found</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Page Details</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <Share className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Card - Test Page Style */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Page Header */}
          <div className="p-6">
            <div className="flex items-start space-x-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
                style={{ background: getPageColor() }}
              >
                {getPageIcon()}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{pageData.name}</h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    pageType === 'academy' ? 'bg-blue-100 text-blue-800' :
                    pageType === 'venue' ? 'bg-green-100 text-green-800' :
                    pageType === 'community' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {pageType ? pageType.charAt(0).toUpperCase() + pageType.slice(1) : 'Page'}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-500 mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>Created {new Date(pageData.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700 mb-4">{pageData.description}</p>
              </div>
            </div>
          </div>

          {/* Page Details */}
          <div className="border-t border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{pageData.location}</span>
                  </div>
                  {pageData.contact && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{pageData.contact}</span>
                    </div>
                  )}
                  {pageData.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{pageData.email}</span>
                    </div>
                  )}
                  {pageData.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-gray-400" />
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
              </div>

              {/* Type-Specific Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
                <div className="space-y-3">
                  {pageData.academy_type && (
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700 capitalize">{pageData.academy_type.replace('_', ' ')}</span>
                    </div>
                  )}
                  {pageData.level && (
                    <div className="flex items-center space-x-3">
                      <Star className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700 capitalize">{pageData.level.replace('_', ' ')}</span>
                    </div>
                  )}
                  {pageData.venue_type && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700 capitalize">{pageData.venue_type.replace('_', ' ')}</span>
                    </div>
                  )}
                  {pageData.ground_type && (
                    <div className="flex items-center space-x-3">
                      <Settings className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700 capitalize">{pageData.ground_type.replace('_', ' ')}</span>
                    </div>
                  )}
                  {pageData.community_type && (
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700 capitalize">{pageData.community_type.replace('_', ' ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(pageData.established_year || pageData.accreditation || pageData.coaching_staff_count > 0) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pageData.established_year && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{pageData.established_year}</div>
                      <div className="text-sm text-gray-600">Established</div>
                    </div>
                  )}
                  {pageData.coaching_staff_count > 0 && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{pageData.coaching_staff_count}</div>
                      <div className="text-sm text-gray-600">Coaching Staff</div>
                    </div>
                  )}
                  {pageData.total_students > 0 && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{pageData.total_students}</div>
                      <div className="text-sm text-gray-600">Students</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}






