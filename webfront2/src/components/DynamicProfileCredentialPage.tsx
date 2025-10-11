import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Loader2, User, GraduationCap, MapPin, Building2 } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useToast } from '../contexts/ToastContext';
import { useProfileSwitch } from '../contexts/ProfileSwitchContext';
import { authService } from '../services/firebase';
import { profileAuthService } from '../services/profileAuthService';
import { getProfileSchema, validateFormData, FormField } from '../services/profileSchemaService';

interface DynamicProfileCredentialPageProps {
  onBack: () => void;
  profileType: string;
}

export function DynamicProfileCredentialPage({ onBack, profileType }: DynamicProfileCredentialPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const { user } = useFirebase();
  const { showToast } = useToast();
  const { addProfile } = useProfileSwitch();

  // Get profile schema from database
  const profileSchema = getProfileSchema(profileType);
  
  if (!profileSchema) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Type Not Found</h2>
          <p className="text-gray-600 mb-4">The requested profile type is not available.</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'User':
        return <User className="w-8 h-8" />;
      case 'GraduationCap':
        return <GraduationCap className="w-8 h-8" />;
      case 'MapPin':
        return <MapPin className="w-8 h-8" />;
      case 'Building2':
        return <Building2 className="w-8 h-8" />;
      default:
        return <User className="w-8 h-8" />;
    }
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = validateFormData(formData, profileSchema.fields);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      showToast({ 
        title: 'Validation Error', 
        message: 'Please fix the errors below', 
        type: 'error' 
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create new profile without authentication
      const profileData = {
        email: formData.email || 'anonymous@example.com',
        profile_type: profileType,
        profile_data: formData
      };
      
      const newProfile = await profileAuthService.createProfile(profileData);
      
      if (newProfile) {
        // Add to profile switch context
        addProfile({
          id: newProfile.id,
          type: profileType,
          name: formData.display_name || formData.name || formData.academy_name || formData.venue_name || 'Profile',
          email: formData.email,
          isActive: false
        });
        
        showToast({ 
          title: 'Profile Created', 
          message: `${profileSchema.title} profile created successfully!`, 
          type: 'success' 
        });
        setShowConfirmation(true);
      }
      
    } catch (error: any) {
      console.error('Authentication error:', error);
      showToast({ 
        title: 'Authentication Error', 
        message: error.message || 'Authentication failed', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (field: FormField) => {
    const fieldError = errors[field.name];
    
    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                fieldError ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
            />
            {fieldError && <p className="text-red-500 text-sm">{fieldError}</p>}
          </div>
        );
        
      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                fieldError ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldError && <p className="text-red-500 text-sm">{fieldError}</p>}
          </div>
        );
        
      case 'checkbox':
        return (
          <div key={field.name} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.name}
              checked={formData[field.name] || false}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={field.name} className="text-sm font-medium text-gray-700">
              {field.label}
            </label>
          </div>
        );
        
      case 'password':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <input
                type={field.name === 'password' ? (showPassword ? 'text' : 'password') : (showConfirmPassword ? 'text' : 'password')}
                value={formData[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  fieldError ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => field.name === 'password' ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {field.name === 'password' ? (showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />) : (showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />)}
              </button>
            </div>
            {fieldError && <p className="text-red-500 text-sm">{fieldError}</p>}
          </div>
        );
        
      default:
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                fieldError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {fieldError && <p className="text-red-500 text-sm">{fieldError}</p>}
          </div>
        );
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-r ${profileSchema.gradient}`}>
              {getIcon(profileSchema.icon)}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Ready!</h2>
            <p className="text-gray-600 mb-6">
              Your {profileSchema.title} profile has been created successfully. You can now switch between profiles and access all features.
            </p>
            <button
              onClick={onBack}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <div className="flex items-center space-x-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r ${profileSchema.gradient}`}>
              {getIcon(profileSchema.icon)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{profileSchema.title}</h1>
              <p className="text-sm text-gray-600">{profileSchema.description}</p>
            </div>
          </div>
        </div>

        {/* Toggle Buttons */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              !isSignUp
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              isSignUp
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profileSchema.fields.map(field => renderField(field))}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : `bg-gradient-to-r ${profileSchema.gradient} text-white hover:opacity-90`
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </div>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
