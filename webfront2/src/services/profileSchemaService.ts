// Profile Schema Service - Fetches database schema and creates dynamic forms
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'url' | 'textarea' | 'select' | 'number' | 'date' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface ProfileSchema {
  profileType: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  gradient: string;
  fields: FormField[];
}

// Database schema definitions based on the models
export const getProfileSchemas = (): ProfileSchema[] => {
  return [
    {
      profileType: 'player',
      title: 'Player Profile',
      description: 'Sign in or create a player profile',
      icon: 'User',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      gradient: 'from-gray-500 to-gray-600',
      fields: [
        // Basic Information
        {
          name: 'display_name',
          label: 'Display Name',
          type: 'text',
          required: true,
          placeholder: 'Enter your display name',
          validation: { minLength: 2, maxLength: 100 }
        },
        {
          name: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
          placeholder: 'Enter your email address',
          validation: { pattern: '^[^@]+@[^@]+\\.[^@]+$' }
        },
        {
          name: 'password',
          label: 'Password',
          type: 'password',
          required: true,
          placeholder: 'Enter your password',
          validation: { minLength: 6 }
        },
        {
          name: 'confirm_password',
          label: 'Confirm Password',
          type: 'password',
          required: true,
          placeholder: 'Confirm your password'
        },
        {
          name: 'bio',
          label: 'Bio',
          type: 'textarea',
          required: false,
          placeholder: 'Tell us about yourself',
          validation: { maxLength: 500 }
        },
        {
          name: 'location',
          label: 'Location',
          type: 'text',
          required: false,
          placeholder: 'Enter your location',
          validation: { maxLength: 100 }
        },
        {
          name: 'contact_number',
          label: 'Contact Number',
          type: 'tel',
          required: false,
          placeholder: 'Enter your contact number',
          validation: { pattern: '^[+]?[0-9\\s\\-()]+$' }
        },
        {
          name: 'date_of_birth',
          label: 'Date of Birth',
          type: 'date',
          required: false
        },
        {
          name: 'nationality',
          label: 'Nationality',
          type: 'text',
          required: false,
          placeholder: 'Enter your nationality',
          validation: { maxLength: 50 }
        },
        // Cricket Information
        {
          name: 'player_role',
          label: 'Player Role',
          type: 'select',
          required: true,
          options: [
            { value: 'BATSMAN', label: 'Batsman' },
            { value: 'BOWLER', label: 'Bowler' },
            { value: 'ALL_ROUNDER', label: 'All Rounder' },
            { value: 'WICKET_KEEPER', label: 'Wicket Keeper' },
            { value: 'CAPTAIN', label: 'Captain' }
          ]
        },
        {
          name: 'batting_style',
          label: 'Batting Style',
          type: 'select',
          required: false,
          options: [
            { value: 'RIGHT_HANDED', label: 'Right Handed' },
            { value: 'LEFT_HANDED', label: 'Left Handed' }
          ]
        },
        {
          name: 'bowling_style',
          label: 'Bowling Style',
          type: 'select',
          required: false,
          options: [
            { value: 'RIGHT_ARM_FAST', label: 'Right Arm Fast' },
            { value: 'LEFT_ARM_FAST', label: 'Left Arm Fast' },
            { value: 'RIGHT_ARM_MEDIUM', label: 'Right Arm Medium' },
            { value: 'LEFT_ARM_MEDIUM', label: 'Left Arm Medium' },
            { value: 'RIGHT_ARM_SPIN', label: 'Right Arm Spin' },
            { value: 'LEFT_ARM_SPIN', label: 'Left Arm Spin' },
            { value: 'LEG_SPIN', label: 'Leg Spin' },
            { value: 'OFF_SPIN', label: 'Off Spin' }
          ]
        },
        {
          name: 'preferred_position',
          label: 'Preferred Position',
          type: 'text',
          required: false,
          placeholder: 'e.g., Opening Batsman, Fast Bowler',
          validation: { maxLength: 50 }
        },
        // Skill Levels
        {
          name: 'batting_skill',
          label: 'Batting Skill (1-100)',
          type: 'number',
          required: false,
          validation: { min: 0, max: 100 }
        },
        {
          name: 'bowling_skill',
          label: 'Bowling Skill (1-100)',
          type: 'number',
          required: false,
          validation: { min: 0, max: 100 }
        },
        {
          name: 'fielding_skill',
          label: 'Fielding Skill (1-100)',
          type: 'number',
          required: false,
          validation: { min: 0, max: 100 }
        },
        {
          name: 'leadership_skill',
          label: 'Leadership Skill (1-100)',
          type: 'number',
          required: false,
          validation: { min: 0, max: 100 }
        },
        // Physical Attributes
        {
          name: 'height',
          label: 'Height (cm)',
          type: 'number',
          required: false,
          validation: { min: 100, max: 250 }
        },
        {
          name: 'weight',
          label: 'Weight (kg)',
          type: 'number',
          required: false,
          validation: { min: 30, max: 200 }
        },
        {
          name: 'dominant_hand',
          label: 'Dominant Hand',
          type: 'select',
          required: false,
          options: [
            { value: 'right', label: 'Right' },
            { value: 'left', label: 'Left' }
          ]
        },
        // Career Information
        {
          name: 'playing_since',
          label: 'Playing Since',
          type: 'date',
          required: false
        },
        {
          name: 'current_team',
          label: 'Current Team',
          type: 'text',
          required: false,
          placeholder: 'Enter your current team',
          validation: { maxLength: 100 }
        },
        // Social Media
        {
          name: 'instagram_handle',
          label: 'Instagram Handle',
          type: 'text',
          required: false,
          placeholder: '@username',
          validation: { maxLength: 100 }
        },
        {
          name: 'twitter_handle',
          label: 'Twitter Handle',
          type: 'text',
          required: false,
          placeholder: '@username',
          validation: { maxLength: 100 }
        },
        {
          name: 'linkedin_handle',
          label: 'LinkedIn Handle',
          type: 'text',
          required: false,
          placeholder: 'LinkedIn profile URL',
          validation: { maxLength: 100 }
        }
      ]
    },
    {
      profileType: 'coach',
      title: 'Coach Profile',
      description: 'Sign in or create a coaching profile',
      icon: 'GraduationCap',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      gradient: 'from-blue-500 to-blue-600',
      fields: [
        // Basic Information
        {
          name: 'name',
          label: 'Full Name',
          type: 'text',
          required: true,
          placeholder: 'Enter your full name',
          validation: { minLength: 2, maxLength: 255 }
        },
        {
          name: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
          placeholder: 'Enter your email address',
          validation: { pattern: '^[^@]+@[^@]+\\.[^@]+$' }
        },
        {
          name: 'password',
          label: 'Password',
          type: 'password',
          required: true,
          placeholder: 'Enter your password',
          validation: { minLength: 6 }
        },
        {
          name: 'confirm_password',
          label: 'Confirm Password',
          type: 'password',
          required: true,
          placeholder: 'Confirm your password'
        },
        {
          name: 'specialization',
          label: 'Specialization',
          type: 'select',
          required: true,
          options: [
            { value: 'BATTING', label: 'Batting' },
            { value: 'BOWLING', label: 'Bowling' },
            { value: 'FIELDING', label: 'Fielding' },
            { value: 'WICKET_KEEPING', label: 'Wicket Keeping' },
            { value: 'FITNESS', label: 'Fitness' },
            { value: 'MENTAL_COACHING', label: 'Mental Coaching' },
            { value: 'ALL_ROUND', label: 'All Round' }
          ]
        },
        {
          name: 'experience',
          label: 'Experience',
          type: 'text',
          required: true,
          placeholder: 'e.g., 5 years, 10+ years',
          validation: { maxLength: 100 }
        },
        {
          name: 'level',
          label: 'Coaching Level',
          type: 'select',
          required: true,
          options: [
            { value: 'BEGINNER', label: 'Beginner' },
            { value: 'INTERMEDIATE', label: 'Intermediate' },
            { value: 'ADVANCED', label: 'Advanced' },
            { value: 'PROFESSIONAL', label: 'Professional' },
            { value: 'INTERNATIONAL', label: 'International' }
          ]
        },
        {
          name: 'bio',
          label: 'Bio',
          type: 'textarea',
          required: false,
          placeholder: 'Tell us about your coaching experience',
          validation: { maxLength: 1000 }
        },
        {
          name: 'location',
          label: 'Location',
          type: 'text',
          required: false,
          placeholder: 'Enter your location',
          validation: { maxLength: 255 }
        },
        {
          name: 'phone',
          label: 'Phone Number',
          type: 'tel',
          required: false,
          placeholder: 'Enter your phone number',
          validation: { pattern: '^[+]?[0-9\\s\\-()]+$' }
        },
        {
          name: 'website',
          label: 'Website',
          type: 'url',
          required: false,
          placeholder: 'https://yourwebsite.com'
        },
        // Coaching Details
        {
          name: 'coaching_style',
          label: 'Coaching Style',
          type: 'text',
          required: false,
          placeholder: 'e.g., Aggressive, Technical, Patient',
          validation: { maxLength: 255 }
        },
        {
          name: 'preferred_age_groups',
          label: 'Preferred Age Groups',
          type: 'text',
          required: false,
          placeholder: 'e.g., U-16, U-19, Adults',
          validation: { maxLength: 255 }
        },
        {
          name: 'coaching_methods',
          label: 'Coaching Methods',
          type: 'textarea',
          required: false,
          placeholder: 'Describe your coaching methods',
          validation: { maxLength: 1000 }
        },
        // Availability and Pricing
        {
          name: 'availability',
          label: 'Availability',
          type: 'text',
          required: false,
          placeholder: 'e.g., Weekends, Evenings, Flexible',
          validation: { maxLength: 255 }
        },
        {
          name: 'hourly_rate',
          label: 'Hourly Rate',
          type: 'number',
          required: false,
          validation: { min: 0 }
        },
        {
          name: 'session_duration',
          label: 'Session Duration (minutes)',
          type: 'number',
          required: false,
          validation: { min: 30, max: 300 }
        },
        {
          name: 'group_sessions',
          label: 'Group Sessions Available',
          type: 'checkbox',
          required: false
        },
        {
          name: 'online_sessions',
          label: 'Online Sessions Available',
          type: 'checkbox',
          required: false
        },
        // Social Media
        {
          name: 'contact_preferences',
          label: 'Contact Preferences',
          type: 'text',
          required: false,
          placeholder: 'e.g., Phone, Email, WhatsApp',
          validation: { maxLength: 255 }
        }
      ]
    },
    {
      profileType: 'academy',
      title: 'Academy Profile',
      description: 'Sign in or create an academy profile',
      icon: 'Building2',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      gradient: 'from-purple-500 to-purple-600',
      fields: [
        // Basic Information
        {
          name: 'academy_name',
          label: 'Academy Name',
          type: 'text',
          required: true,
          placeholder: 'Enter academy name',
          validation: { minLength: 2, maxLength: 200 }
        },
        {
          name: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
          placeholder: 'Enter academy email address',
          validation: { pattern: '^[^@]+@[^@]+\\.[^@]+$' }
        },
        {
          name: 'password',
          label: 'Password',
          type: 'password',
          required: true,
          placeholder: 'Enter your password',
          validation: { minLength: 6 }
        },
        {
          name: 'confirm_password',
          label: 'Confirm Password',
          type: 'password',
          required: true,
          placeholder: 'Confirm your password'
        },
        {
          name: 'tagline',
          label: 'Tagline',
          type: 'text',
          required: false,
          placeholder: 'Enter academy tagline',
          validation: { maxLength: 300 }
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
          required: false,
          placeholder: 'Describe your academy',
          validation: { maxLength: 1000 }
        },
        {
          name: 'bio',
          label: 'Bio',
          type: 'textarea',
          required: false,
          placeholder: 'Tell us about your academy',
          validation: { maxLength: 1000 }
        },
        // Contact Information
        {
          name: 'contact_person',
          label: 'Contact Person',
          type: 'text',
          required: false,
          placeholder: 'Enter contact person name',
          validation: { maxLength: 100 }
        },
        {
          name: 'contact_number',
          label: 'Contact Number',
          type: 'tel',
          required: false,
          placeholder: 'Enter contact number',
          validation: { pattern: '^[+]?[0-9\\s\\-()]+$' }
        },
        {
          name: 'website',
          label: 'Website',
          type: 'url',
          required: false,
          placeholder: 'https://yourwebsite.com'
        },
        // Location Information
        {
          name: 'address',
          label: 'Address',
          type: 'textarea',
          required: false,
          placeholder: 'Enter academy address'
        },
        {
          name: 'city',
          label: 'City',
          type: 'text',
          required: false,
          placeholder: 'Enter city',
          validation: { maxLength: 100 }
        },
        {
          name: 'state',
          label: 'State',
          type: 'text',
          required: false,
          placeholder: 'Enter state',
          validation: { maxLength: 100 }
        },
        {
          name: 'country',
          label: 'Country',
          type: 'text',
          required: false,
          placeholder: 'Enter country',
          validation: { maxLength: 100 }
        },
        {
          name: 'pincode',
          label: 'Pincode',
          type: 'text',
          required: false,
          placeholder: 'Enter pincode',
          validation: { maxLength: 20 }
        },
        // Academy Details
        {
          name: 'academy_type',
          label: 'Academy Type',
          type: 'select',
          required: true,
          options: [
            { value: 'CRICKET_ACADEMY', label: 'Cricket Academy' },
            { value: 'COACHING_CENTER', label: 'Coaching Center' },
            { value: 'SPORTS_CLUB', label: 'Sports Club' },
            { value: 'SCHOOL_PROGRAM', label: 'School Program' },
            { value: 'UNIVERSITY_PROGRAM', label: 'University Program' }
          ]
        },
        {
          name: 'level',
          label: 'Academy Level',
          type: 'select',
          required: true,
          options: [
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'advanced', label: 'Advanced' },
            { value: 'professional', label: 'Professional' },
            { value: 'all_levels', label: 'All Levels' }
          ]
        },
        {
          name: 'established_year',
          label: 'Established Year',
          type: 'number',
          required: false,
          validation: { min: 1900, max: new Date().getFullYear() }
        },
        {
          name: 'accreditation',
          label: 'Accreditation',
          type: 'text',
          required: false,
          placeholder: 'e.g., BCCI, State Association',
          validation: { maxLength: 200 }
        },
        // Training Programs
        {
          name: 'age_groups',
          label: 'Age Groups',
          type: 'text',
          required: false,
          placeholder: 'e.g., 5-18 years',
          validation: { maxLength: 100 }
        },
        {
          name: 'coaching_staff_count',
          label: 'Coaching Staff Count',
          type: 'number',
          required: false,
          validation: { min: 0 }
        },
        // Social Media
        {
          name: 'instagram_handle',
          label: 'Instagram Handle',
          type: 'text',
          required: false,
          placeholder: '@username',
          validation: { maxLength: 100 }
        },
        {
          name: 'facebook_handle',
          label: 'Facebook Handle',
          type: 'text',
          required: false,
          placeholder: 'Facebook page name',
          validation: { maxLength: 100 }
        },
        {
          name: 'twitter_handle',
          label: 'Twitter Handle',
          type: 'text',
          required: false,
          placeholder: '@username',
          validation: { maxLength: 100 }
        },
        {
          name: 'youtube_handle',
          label: 'YouTube Handle',
          type: 'text',
          required: false,
          placeholder: 'YouTube channel name',
          validation: { maxLength: 100 }
        }
      ]
    },
    {
      profileType: 'venue',
      title: 'Venue Provider',
      description: 'Sign in or create a venue provider profile',
      icon: 'MapPin',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      gradient: 'from-green-500 to-green-600',
      fields: [
        // Basic Information
        {
          name: 'venue_name',
          label: 'Venue Name',
          type: 'text',
          required: true,
          placeholder: 'Enter venue name',
          validation: { minLength: 2, maxLength: 200 }
        },
        {
          name: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
          placeholder: 'Enter venue email address',
          validation: { pattern: '^[^@]+@[^@]+\\.[^@]+$' }
        },
        {
          name: 'password',
          label: 'Password',
          type: 'password',
          required: true,
          placeholder: 'Enter your password',
          validation: { minLength: 6 }
        },
        {
          name: 'confirm_password',
          label: 'Confirm Password',
          type: 'password',
          required: true,
          placeholder: 'Confirm your password'
        },
        {
          name: 'tagline',
          label: 'Tagline',
          type: 'text',
          required: false,
          placeholder: 'Enter venue tagline',
          validation: { maxLength: 300 }
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
          required: false,
          placeholder: 'Describe your venue',
          validation: { maxLength: 1000 }
        },
        // Contact Information
        {
          name: 'contact_person',
          label: 'Contact Person',
          type: 'text',
          required: false,
          placeholder: 'Enter contact person name',
          validation: { maxLength: 100 }
        },
        {
          name: 'contact_number',
          label: 'Contact Number',
          type: 'tel',
          required: false,
          placeholder: 'Enter contact number',
          validation: { pattern: '^[+]?[0-9\\s\\-()]+$' }
        },
        {
          name: 'website',
          label: 'Website',
          type: 'url',
          required: false,
          placeholder: 'https://yourwebsite.com'
        },
        // Location Information
        {
          name: 'address',
          label: 'Address',
          type: 'textarea',
          required: false,
          placeholder: 'Enter venue address'
        },
        {
          name: 'city',
          label: 'City',
          type: 'text',
          required: false,
          placeholder: 'Enter city',
          validation: { maxLength: 100 }
        },
        {
          name: 'state',
          label: 'State',
          type: 'text',
          required: false,
          placeholder: 'Enter state',
          validation: { maxLength: 100 }
        },
        {
          name: 'country',
          label: 'Country',
          type: 'text',
          required: false,
          placeholder: 'Enter country',
          validation: { maxLength: 100 }
        },
        {
          name: 'pincode',
          label: 'Pincode',
          type: 'text',
          required: false,
          placeholder: 'Enter pincode',
          validation: { maxLength: 20 }
        },
        // Venue Details
        {
          name: 'venue_type',
          label: 'Venue Type',
          type: 'select',
          required: true,
          options: [
            { value: 'CRICKET_GROUND', label: 'Cricket Ground' },
            { value: 'INDOOR_FACILITY', label: 'Indoor Facility' },
            { value: 'PRACTICE_NET', label: 'Practice Net' },
            { value: 'SPORTS_COMPLEX', label: 'Sports Complex' },
            { value: 'SCHOOL_GROUND', label: 'School Ground' },
            { value: 'CLUB_GROUND', label: 'Club Ground' }
          ]
        },
        {
          name: 'ground_type',
          label: 'Ground Type',
          type: 'select',
          required: true,
          options: [
            { value: 'natural_turf', label: 'Natural Turf' },
            { value: 'artificial_turf', label: 'Artificial Turf' },
            { value: 'concrete', label: 'Concrete' },
            { value: 'mat', label: 'Mat' }
          ]
        },
        {
          name: 'established_year',
          label: 'Established Year',
          type: 'number',
          required: false,
          validation: { min: 1900, max: new Date().getFullYear() }
        },
        {
          name: 'capacity',
          label: 'Spectator Capacity',
          type: 'number',
          required: false,
          validation: { min: 0 }
        },
        // Ground Specifications
        {
          name: 'ground_length',
          label: 'Ground Length (meters)',
          type: 'number',
          required: false,
          validation: { min: 0 }
        },
        {
          name: 'ground_width',
          label: 'Ground Width (meters)',
          type: 'number',
          required: false,
          validation: { min: 0 }
        },
        {
          name: 'pitch_count',
          label: 'Number of Pitches',
          type: 'number',
          required: false,
          validation: { min: 1 }
        },
        {
          name: 'net_count',
          label: 'Number of Nets',
          type: 'number',
          required: false,
          validation: { min: 0 }
        },
        {
          name: 'floodlights',
          label: 'Floodlights Available',
          type: 'checkbox',
          required: false
        },
        {
          name: 'covered_area',
          label: 'Covered Area Available',
          type: 'checkbox',
          required: false
        },
        // Facilities
        {
          name: 'parking_available',
          label: 'Parking Available',
          type: 'checkbox',
          required: false
        },
        {
          name: 'parking_capacity',
          label: 'Parking Capacity',
          type: 'number',
          required: false,
          validation: { min: 0 }
        },
        {
          name: 'changing_rooms',
          label: 'Changing Rooms Available',
          type: 'checkbox',
          required: false
        },
        {
          name: 'refreshment_facility',
          label: 'Refreshment Facility Available',
          type: 'checkbox',
          required: false
        },
        // Pricing
        {
          name: 'hourly_rate',
          label: 'Hourly Rate',
          type: 'number',
          required: false,
          validation: { min: 0 }
        },
        {
          name: 'daily_rate',
          label: 'Daily Rate',
          type: 'number',
          required: false,
          validation: { min: 0 }
        },
        {
          name: 'monthly_rate',
          label: 'Monthly Rate',
          type: 'number',
          required: false,
          validation: { min: 0 }
        },
        {
          name: 'equipment_rental',
          label: 'Equipment Rental Available',
          type: 'checkbox',
          required: false
        },
        // Social Media
        {
          name: 'instagram_handle',
          label: 'Instagram Handle',
          type: 'text',
          required: false,
          placeholder: '@username',
          validation: { maxLength: 100 }
        },
        {
          name: 'facebook_handle',
          label: 'Facebook Handle',
          type: 'text',
          required: false,
          placeholder: 'Facebook page name',
          validation: { maxLength: 100 }
        },
        {
          name: 'twitter_handle',
          label: 'Twitter Handle',
          type: 'text',
          required: false,
          placeholder: '@username',
          validation: { maxLength: 100 }
        }
      ]
    }
  ];
};

// Get schema for specific profile type
export const getProfileSchema = (profileType: string): ProfileSchema | undefined => {
  return getProfileSchemas().find(schema => schema.profileType === profileType);
};

// Get form fields for specific profile type
export const getProfileFields = (profileType: string): FormField[] => {
  const schema = getProfileSchema(profileType);
  return schema ? schema.fields : [];
};

// Validate form data based on field definitions
export const validateFormData = (data: any, fields: FormField[]): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  fields.forEach(field => {
    const value = data[field.name];
    
    // Required field validation
    if (field.required && (!value || value.toString().trim() === '')) {
      errors[field.name] = `${field.label} is required`;
      return;
    }
    
    // Skip validation for empty optional fields
    if (!value || value.toString().trim() === '') {
      return;
    }
    
    // Type-specific validation
    if (field.type === 'email' && field.validation?.pattern) {
      const emailRegex = new RegExp(field.validation.pattern);
      if (!emailRegex.test(value)) {
        errors[field.name] = 'Please enter a valid email address';
      }
    }
    
    if (field.type === 'tel' && field.validation?.pattern) {
      const phoneRegex = new RegExp(field.validation.pattern);
      if (!phoneRegex.test(value)) {
        errors[field.name] = 'Please enter a valid phone number';
      }
    }
    
    if (field.type === 'url' && value) {
      try {
        new URL(value);
      } catch {
        errors[field.name] = 'Please enter a valid URL';
      }
    }
    
    // Length validation
    if (field.validation?.minLength && value.length < field.validation.minLength) {
      errors[field.name] = `${field.label} must be at least ${field.validation.minLength} characters`;
    }
    
    if (field.validation?.maxLength && value.length > field.validation.maxLength) {
      errors[field.name] = `${field.label} must be no more than ${field.validation.maxLength} characters`;
    }
    
    // Number validation
    if (field.type === 'number' && value !== '') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errors[field.name] = `${field.label} must be a valid number`;
      } else {
        if (field.validation?.min !== undefined && numValue < field.validation.min) {
          errors[field.name] = `${field.label} must be at least ${field.validation.min}`;
        }
        if (field.validation?.max !== undefined && numValue > field.validation.max) {
          errors[field.name] = `${field.label} must be no more than ${field.validation.max}`;
        }
      }
    }
  });
  
  // Password confirmation validation
  if (data.password && data.confirm_password && data.password !== data.confirm_password) {
    errors.confirm_password = 'Passwords do not match';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
