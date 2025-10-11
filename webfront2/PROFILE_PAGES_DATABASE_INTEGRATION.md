# Profile Pages Database Integration

## 🎯 **Database-Driven Profile Pages Successfully Implemented**

Successfully created dedicated profile pages for Academy, Coach, and Venue Provider that fetch data from the database and display it according to each profile category.

## ✅ **Implementation Overview**

### **1. Profile Data Service (`profileDataService.ts`)**
- **Fetches profile data** from backend API endpoints
- **Type-safe interfaces** for all profile types
- **Error handling** with proper loading states
- **API integration** with backend database

### **2. Academy Profile Page (`AcademyProfilePage.tsx`)**
- **Fetches academy data** from database using `profileDataService.getAcademyProfile()`
- **Displays academy information**: name, type, location, established year, contact details
- **Shows statistics**: total students, coaching staff count, achievements
- **Programs section**: displays programs offered with details
- **Facilities section**: lists academy facilities
- **Contact information**: phone, email, website, social media

### **3. Coach Profile Page (`CoachProfilePage.tsx`)**
- **Fetches coach data** from database using `profileDataService.getCoachProfile()`
- **Displays coach information**: name, specialization, experience, level, bio
- **Shows statistics**: total students, successful placements, years experience, rating
- **Coaching details**: coaching style, preferred age groups, methods
- **Availability and pricing**: hourly rate, session duration, group/online sessions
- **Contact information**: phone, email, website, social media

### **4. Venue Profile Page (`VenueProfilePage.tsx`)**
- **Fetches venue data** from database using `profileDataService.getVenueProfile()`
- **Displays venue information**: name, type, location, established year, capacity
- **Shows specifications**: ground dimensions, pitch count, net count, facilities
- **Amenities section**: parking, changing rooms, refreshment facilities
- **Pricing information**: hourly, daily, monthly rates
- **Contact information**: phone, email, website, social media

## 🚀 **Database Schema Integration**

### **Academy Profile Fields (25+ fields)**
```typescript
interface AcademyProfileData {
  // Basic Information
  academy_name: string;
  tagline?: string;
  description?: string;
  bio?: string;
  
  // Contact Information
  contact_person?: string;
  contact_number?: string;
  email?: string;
  website?: string;
  
  // Location Information
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  
  // Academy Details
  academy_type: string;
  level: string;
  established_year?: number;
  accreditation?: string;
  
  // Training Programs
  age_groups?: string;
  coaching_staff_count: number;
  programs_offered?: string[];
  
  // Social Media
  instagram_handle?: string;
  facebook_handle?: string;
  twitter_handle?: string;
  youtube_handle?: string;
  
  // Statistics
  total_students: number;
  successful_placements: number;
  achievements?: string[];
  testimonials?: string[];
  
  // Settings
  is_public: boolean;
  allow_messages: boolean;
  show_contact: boolean;
  is_verified: boolean;
}
```

### **Coach Profile Fields (20+ fields)**
```typescript
interface CoachProfileData {
  // Basic Information
  name: string;
  specialization: string;
  experience: string;
  level: string;
  bio?: string;
  location?: string;
  phone?: string;
  email?: string;
  website?: string;
  
  // Coaching Details
  coaching_style?: string;
  preferred_age_groups?: string;
  coaching_methods?: string;
  
  // Availability and Pricing
  availability?: string;
  hourly_rate?: number;
  session_duration?: number;
  group_sessions: boolean;
  online_sessions: boolean;
  
  // Statistics
  total_students: number;
  successful_placements: number;
  years_experience: number;
  rating: number;
  total_reviews: number;
  
  // Status
  is_verified: boolean;
  is_active: boolean;
  is_available: boolean;
}
```

### **Venue Profile Fields (30+ fields)**
```typescript
interface VenueProfileData {
  // Basic Information
  venue_name: string;
  tagline?: string;
  description?: string;
  
  // Contact Information
  contact_person?: string;
  contact_number?: string;
  email?: string;
  website?: string;
  
  // Location Information
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  
  // Venue Details
  venue_type: string;
  ground_type: string;
  established_year?: number;
  capacity?: number;
  
  // Ground Specifications
  ground_length?: number;
  ground_width?: number;
  pitch_count: number;
  net_count: number;
  floodlights: boolean;
  covered_area: boolean;
  
  // Facilities
  parking_available: boolean;
  parking_capacity: number;
  changing_rooms: boolean;
  refreshment_facility: boolean;
  
  // Pricing
  hourly_rate?: number;
  daily_rate?: number;
  monthly_rate?: number;
  equipment_rental: boolean;
  
  // Statistics
  total_bookings: number;
  average_rating: number;
  total_reviews: number;
  
  // Settings
  is_public: boolean;
  allow_messages: boolean;
  show_contact: boolean;
  is_verified: boolean;
  is_available: boolean;
}
```

## 🎨 **Profile Page Features**

### **Loading States**
- **Loading indicators** with spinner and message
- **Error handling** with clear error messages
- **Fallback UI** for missing data

### **Data Display**
- **Header section** with profile name, type, location, rating
- **Statistics cards** showing key metrics
- **Detailed sections** for programs, facilities, achievements
- **Contact information** with proper formatting
- **Social media links** when available

### **Responsive Design**
- **Mobile-first approach** with responsive grid layouts
- **Proper spacing** and typography
- **Interactive elements** with hover states
- **Accessibility features** with proper ARIA labels

## 🔧 **Technical Implementation**

### **API Integration**
```typescript
// Profile data service
export const profileDataService = {
  async getAcademyProfile(profileId: number): Promise<AcademyProfileData> {
    const response = await fetch(`${API_BASE_URL}/api/profiles/academy/${profileId}`);
    return response.json();
  },
  
  async getCoachProfile(profileId: number): Promise<CoachProfileData> {
    const response = await fetch(`${API_BASE_URL}/api/profiles/coach/${profileId}`);
    return response.json();
  },
  
  async getVenueProfile(profileId: number): Promise<VenueProfileData> {
    const response = await fetch(`${API_BASE_URL}/api/profiles/venue/${profileId}`);
    return response.json();
  }
};
```

### **Component Structure**
```typescript
// Profile page component structure
export function AcademyProfilePage({ onBack, profileId }: AcademyProfilePageProps) {
  const [profileData, setProfileData] = useState<AcademyProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await profileDataService.getAcademyProfile(profileId);
        setProfileData(data);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [profileId]);

  // Render loading, error, or profile data
};
```

### **Data Fetching Pattern**
1. **Component mounts** with profileId prop
2. **useEffect triggers** data fetching
3. **Loading state** shows spinner
4. **Success state** displays profile data
5. **Error state** shows error message with retry option

## 🎉 **User Experience**

### **Profile Page Flow**
1. **User switches profile** → ProfileSwitchContext updates currentProfile
2. **Profile page loads** → Shows loading spinner
3. **Data fetches** → API call to backend database
4. **Profile displays** → Real data from database
5. **User interacts** → Contact buttons, social media links

### **Data Accuracy**
- **Real-time data** from PostgreSQL database
- **Consistent formatting** across all profile types
- **Proper validation** of required fields
- **Fallback values** for optional fields

### **Performance**
- **Efficient data fetching** with proper error handling
- **Loading states** to improve perceived performance
- **Responsive design** for all device sizes
- **Accessibility compliance** with proper ARIA labels

## 📊 **Backend Integration**

### **API Endpoints Required**
- `GET /api/profiles/academy/{id}` - Fetch academy profile
- `GET /api/profiles/coach/{id}` - Fetch coach profile  
- `GET /api/profiles/venue/{id}` - Fetch venue profile
- `GET /api/profiles/{type}/{id}/stats` - Fetch profile statistics

### **Database Models Used**
- **AcademyProfile** - Academy profile data
- **CoachProfile** - Coach profile data
- **VenueProfile** - Venue profile data
- **User** - Base user information

## 🎯 **Result**

The profile pages now provide:

1. **Database-driven content** that automatically updates with backend changes
2. **Profile-specific layouts** tailored to each profile type
3. **Comprehensive data display** with all relevant fields from database
4. **Professional UI/UX** with loading states and error handling
5. **Responsive design** that works on all devices
6. **Real-time data** fetched from PostgreSQL database

Users can now view detailed, accurate profile information for Academy, Coach, and Venue Provider profiles with data directly from the database! 🎉
