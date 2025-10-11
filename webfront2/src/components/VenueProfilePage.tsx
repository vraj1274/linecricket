import { ArrowLeft, Award, Calendar, CheckCircle, Edit2, MapPin, MessageCircle, Phone, Save, Star, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useToast } from '../contexts/ToastContext';
import { ProfileLoadingSpinner } from './LoadingSpinner';

interface VenueProfilePageProps {
  onBack: () => void;
}

interface VenueProfile {
  id: number;
  account_id: number;
  venue_name: string;
  tagline: string;
  description: string;
  contact_person: string;
  contact_number: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  latitude: number;
  longitude: number;
  venue_type: string;
  ground_type: string;
  established_year: number;
  capacity: number;
  ground_length: number;
  ground_width: number;
  pitch_count: number;
  net_count: number;
  floodlights: boolean;
  covered_area: boolean;
  logo_url: string;
  banner_image_url: string;
  gallery_images: string;
  virtual_tour_url: string;
  facilities: string;
  amenities: string;
  parking_available: boolean;
  parking_capacity: number;
  changing_rooms: boolean;
  refreshment_facility: boolean;
  booking_contact: string;
  booking_email: string;
  advance_booking_days: number;
  cancellation_policy: string;
  hourly_rate: number;
  daily_rate: number;
  monthly_rate: number;
  equipment_rental: boolean;
  equipment_rates: string;
  operating_hours: string;
  is_24_7: boolean;
  seasonal_availability: string;
  instagram_handle: string;
  facebook_handle: string;
  twitter_handle: string;
  total_bookings: number;
  average_rating: number;
  total_reviews: number;
  reviews: string;
  is_public: boolean;
  allow_messages: boolean;
  show_contact: boolean;
  is_verified: boolean;
  is_available: boolean;
}

interface VenueBooking {
  id: number;
  venue_profile_id: number;
  user_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  total_cost: number;
  status: string;
  special_requirements: string;
  contact_number: string;
}

interface VenueReview {
  id: number;
  venue_profile_id: number;
  user_id: number;
  rating: number;
  title: string;
  review_text: string;
  is_verified: boolean;
}

export function VenueProfilePage({ onBack }: VenueProfilePageProps) {
  const [venueProfile, setVenueProfile] = useState<VenueProfile | null>(null);
  const [bookings, setBookings] = useState<VenueBooking[]>([]);
  const [reviews, setReviews] = useState<VenueReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useFirebase();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadVenueProfile();
  }, []);

  const loadVenueProfile = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      // const response = await apiService.getVenueProfile(user?.uid);
      // setVenueProfile(response.venueProfile);
      // setBookings(response.bookings);
      // setReviews(response.reviews);
      
      // Mock data for now
      setVenueProfile({
        id: 1,
        account_id: 1,
        venue_name: 'Elite Cricket Ground',
        tagline: 'Premium Cricket Venue',
        description: 'State-of-the-art cricket ground with modern facilities',
        contact_person: 'Rajesh Kumar',
        contact_number: '+91 9876543210',
        email: 'booking@elitecricketground.com',
        website: 'www.elitecricketground.com',
        address: '456 Sports Complex, Cricket Lane',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        pincode: '400001',
        latitude: 19.0760,
        longitude: 72.8777,
        venue_type: 'Cricket Ground',
        ground_type: 'Natural Turf',
        established_year: 2018,
        capacity: 5000,
        ground_length: 150,
        ground_width: 120,
        pitch_count: 2,
        net_count: 6,
        floodlights: true,
        covered_area: true,
        logo_url: '',
        banner_image_url: '',
        gallery_images: '',
        virtual_tour_url: '',
        facilities: 'Cricket Ground, Practice Nets, Changing Rooms, Gym',
        amenities: 'Parking, Refreshment, First Aid, Security',
        parking_available: true,
        parking_capacity: 200,
        changing_rooms: true,
        refreshment_facility: true,
        booking_contact: 'Rajesh Kumar',
        booking_email: 'booking@elitecricketground.com',
        advance_booking_days: 30,
        cancellation_policy: '24 hours notice required',
        hourly_rate: 2000,
        daily_rate: 15000,
        monthly_rate: 300000,
        equipment_rental: true,
        equipment_rates: 'Bats: ₹200/day, Balls: ₹50/day, Pads: ₹100/day',
        operating_hours: '6:00 AM - 10:00 PM',
        is_24_7: false,
        seasonal_availability: 'Year Round',
        instagram_handle: '@elitecricketground',
        facebook_handle: 'EliteCricketGround',
        twitter_handle: '@elitecricketground',
        total_bookings: 150,
        average_rating: 4.5,
        total_reviews: 25,
        reviews: 'Excellent facilities and well maintained ground',
        is_public: true,
        allow_messages: true,
        show_contact: true,
        is_verified: true,
        is_available: true
      });

      setBookings([
        {
          id: 1,
          venue_profile_id: 1,
          user_id: 1,
          booking_date: '2024-01-15',
          start_time: '09:00:00',
          end_time: '12:00:00',
          duration_hours: 3,
          total_cost: 6000,
          status: 'confirmed',
          special_requirements: 'Need floodlights',
          contact_number: '+91 9876543210'
        }
      ]);

      setReviews([
        {
          id: 1,
          venue_profile_id: 1,
          user_id: 1,
          rating: 5,
          title: 'Excellent Ground',
          review_text: 'Great facilities and well maintained. Highly recommended!',
          is_verified: true
        }
      ]);
    } catch (error) {
      console.error('Error loading venue profile:', error);
      showError('Error', 'Failed to load venue profile');
      } finally {
        setLoading(false);
      }
    };

  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue || '');
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue('');
  };

  const saveField = async () => {
    if (!editingField || !editValue.trim()) return;
    
    setIsSaving(true);
    try {
      // TODO: Implement actual API call
      // await apiService.updateVenueProfile(editingField, editValue);
      showSuccess('Profile Updated', 'Field updated successfully!');
      setEditingField(null);
      setEditValue('');
    } catch (error) {
      showError('Update Failed', 'Failed to update field. Please try again.');
      console.error('Error updating field:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveField();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  if (loading) {
    return <ProfileLoadingSpinner />;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Venue Profile</h1>
          <p className="text-gray-600">Manage your venue information and bookings</p>
        </div>
      </div>
                
      {/* Venue Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-green-600" />
            Venue Information
          </h2>
          {venueProfile?.is_verified && (
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Verified</span>
              <CheckCircle className="w-4 h-4 text-blue-600" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Venue Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Venue Name</label>
            {editingField === 'venue_name' ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  autoFocus
                />
                <button onClick={saveField} className="text-green-600" title="Save">
                  <Save className="w-4 h-4" />
                </button>
                <button onClick={cancelEditing} className="text-red-600" title="Cancel">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <p className="text-gray-900">{venueProfile?.venue_name || 'Not provided'}</p>
                <button
                  onClick={() => startEditing('venue_name', venueProfile?.venue_name || '')}
                  className="opacity-0 hover:opacity-100 text-gray-500 hover:text-gray-700"
                  title="Edit venue name"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          
          {/* Tagline */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Tagline</label>
            {editingField === 'tagline' ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  autoFocus
                />
                <button onClick={saveField} className="text-green-600" title="Save">
                  <Save className="w-4 h-4" />
                </button>
                <button onClick={cancelEditing} className="text-red-600" title="Cancel">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <p className="text-gray-900">{venueProfile?.tagline || 'Not provided'}</p>
                <button
                  onClick={() => startEditing('tagline', venueProfile?.tagline || '')}
                  className="opacity-0 hover:opacity-100 text-gray-500 hover:text-gray-700"
                  title="Edit tagline"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          
          {/* Contact Information */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Contact Person</label>
            {editingField === 'contact_person' ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  autoFocus
                />
                <button onClick={saveField} className="text-green-600" title="Save">
                  <Save className="w-4 h-4" />
                </button>
                <button onClick={cancelEditing} className="text-red-600" title="Cancel">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <p className="text-gray-900">{venueProfile?.contact_person || 'Not provided'}</p>
                <button
                  onClick={() => startEditing('contact_person', venueProfile?.contact_person || '')}
                  className="opacity-0 hover:opacity-100 text-gray-500 hover:text-gray-700"
                  title="Edit contact person"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Contact Number</label>
            <p className="text-gray-900 flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              {venueProfile?.contact_number || 'Not provided'}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <p className="text-gray-900">{venueProfile?.email || 'Not provided'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Website</label>
            <a href={venueProfile?.website} className="text-blue-600 hover:underline">
              {venueProfile?.website || 'Not provided'}
            </a>
          </div>

          {/* Location */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Address</label>
            <p className="text-gray-900 flex items-start">
              <MapPin className="w-4 h-4 mr-1 mt-0.5" />
              {venueProfile?.address}, {venueProfile?.city}, {venueProfile?.state}, {venueProfile?.country} - {venueProfile?.pincode}
            </p>
          </div>

          {/* Venue Details */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Venue Type</label>
            <p className="text-gray-900">{venueProfile?.venue_type || 'Not provided'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Ground Type</label>
            <p className="text-gray-900">{venueProfile?.ground_type || 'Not provided'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Established Year</label>
            <p className="text-gray-900">{venueProfile?.established_year || 'Not provided'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Capacity</label>
            <p className="text-gray-900">{venueProfile?.capacity || 0} people</p>
          </div>

          {/* Ground Specifications */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Ground Length</label>
            <p className="text-gray-900">{venueProfile?.ground_length || 0} meters</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Ground Width</label>
            <p className="text-gray-900">{venueProfile?.ground_width || 0} meters</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Pitch Count</label>
            <p className="text-gray-900">{venueProfile?.pitch_count || 0} pitches</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Net Count</label>
            <p className="text-gray-900">{venueProfile?.net_count || 0} nets</p>
          </div>

          {/* Features */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Features</label>
            <div className="flex flex-wrap gap-2">
              {venueProfile?.floodlights && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Floodlights</span>
              )}
              {venueProfile?.covered_area && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Covered Area</span>
              )}
              {venueProfile?.parking_available && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Parking</span>
              )}
              {venueProfile?.changing_rooms && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Changing Rooms</span>
              )}
              {venueProfile?.refreshment_facility && (
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Refreshment</span>
              )}
              {venueProfile?.equipment_rental && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Equipment Rental</span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
          <p className="text-gray-900">{venueProfile?.description || 'No description provided'}</p>
        </div>

        {/* Facilities */}
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Facilities</label>
          <p className="text-gray-900">{venueProfile?.facilities || 'No facilities listed'}</p>
        </div>

        {/* Amenities */}
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Amenities</label>
          <p className="text-gray-900">{venueProfile?.amenities || 'No amenities listed'}</p>
        </div>

        {/* Operating Hours */}
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Operating Hours</label>
          <p className="text-gray-900">{venueProfile?.operating_hours || 'Not specified'}</p>
        </div>

        {/* Seasonal Availability */}
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Seasonal Availability</label>
          <p className="text-gray-900">{venueProfile?.seasonal_availability || 'Not specified'}</p>
        </div>

        {/* Pricing */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-green-600">₹{venueProfile?.hourly_rate || 0}</div>
              <div className="text-sm text-gray-600">Per Hour</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-blue-600">₹{venueProfile?.daily_rate || 0}</div>
              <div className="text-sm text-gray-600">Per Day</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-purple-600">₹{venueProfile?.monthly_rate || 0}</div>
              <div className="text-sm text-gray-600">Per Month</div>
            </div>
          </div>
        </div>

        {/* Equipment Rental */}
        {venueProfile?.equipment_rental && (
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Equipment Rental Rates</label>
            <p className="text-gray-900">{venueProfile?.equipment_rates || 'Not specified'}</p>
                  </div>
        )}

        {/* Booking Information */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Booking Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Advance Booking</label>
              <p className="text-gray-900">{venueProfile?.advance_booking_days || 0} days in advance</p>
                  </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Cancellation Policy</label>
              <p className="text-gray-900">{venueProfile?.cancellation_policy || 'Not specified'}</p>
              </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Social Media</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {venueProfile?.instagram_handle && (
              <div className="flex items-center space-x-2">
                <span className="text-pink-600">📷</span>
                <span className="text-sm text-gray-900">{venueProfile.instagram_handle}</span>
              </div>
            )}
            {venueProfile?.facebook_handle && (
              <div className="flex items-center space-x-2">
                <span className="text-blue-600">📘</span>
                <span className="text-sm text-gray-900">{venueProfile.facebook_handle}</span>
                  </div>
            )}
            {venueProfile?.twitter_handle && (
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">🐦</span>
                <span className="text-sm text-gray-900">{venueProfile.twitter_handle}</span>
              </div>
            )}
              </div>
            </div>
            
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{venueProfile?.total_bookings || 0}</div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{venueProfile?.average_rating || 0}</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{venueProfile?.total_reviews || 0}</div>
            <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{venueProfile?.capacity || 0}</div>
            <div className="text-sm text-gray-600">Capacity</div>
          </div>
        </div>

        {/* Reviews */}
        {venueProfile?.reviews && (
          <div className="mt-6">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Reviews</label>
            <p className="text-gray-900">{venueProfile.reviews}</p>
          </div>
        )}
      </div>

      {/* Recent Bookings */}
      {bookings.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Recent Bookings
          </h2>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">Booking #{booking.id}</h3>
                    <p className="text-sm text-gray-600">{booking.booking_date} • {booking.start_time} - {booking.end_time}</p>
                    <p className="text-sm text-gray-600">Duration: {booking.duration_hours} hours</p>
                    {booking.special_requirements && (
                      <p className="text-sm text-gray-600">Requirements: {booking.special_requirements}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                    <p className="text-sm font-medium text-gray-900 mt-1">₹{booking.total_cost}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <Star className="w-5 h-5 mr-2 text-yellow-600" />
            Customer Reviews
          </h2>
            <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{review.title}</h3>
                    <div className="flex items-center space-x-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">{review.rating}/5</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{review.review_text}</p>
              </div>
                  {review.is_verified && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Verified</span>
                  )}
              </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => {/* TODO: Implement edit functionality */}}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Edit Venue
        </button>
      </div>
    </div>
  );
}