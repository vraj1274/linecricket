import { updateProfile } from 'firebase/auth';
import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { firebaseBackendSync } from '../services/firebaseBackendSync';

interface SignupPageProps {
  onSignup: () => void;
  onSwitchToLogin: () => void;
}

export function SignupPage({ onSignup, onSwitchToLogin }: SignupPageProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Firebase authentication hook
  const { signUp, loading, error: authError } = useFirebaseAuth();

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|commit\.com)$/i;
    return emailRegex.test(email);
  };

  // Password validation function
  const validatePassword = (password: string): {isValid: boolean, message: string} => {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one capital letter' };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one symbol' };
    }
    return { isValid: true, message: '' };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate all required fields
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Validate email
    if (!validateEmail(formData.email)) {
      setErrors(prev => ({ ...prev, email: 'Email must end with @gmail.com or @commit.com' }));
      return;
    }
    
    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setErrors(prev => ({ ...prev, password: passwordValidation.message }));
      return;
    }
    
    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return;
    }
    
    if (!agreeToTerms) {
      alert('Please agree to the Terms of Service and Privacy Policy');
      return;
    }
    
    try {
      // Use Firebase authentication
      const userCredential = await signUp(formData.email, formData.password);
      
      if (userCredential.user) {
        // Update Firebase user profile with comprehensive data
        try {
          await updateProfile(userCredential.user, {
            displayName: formData.fullName,
            photoURL: null, // Will be set later if user uploads a photo
          });
          
          // Store additional user data in Firebase custom claims or user metadata
          // This ensures all signup data is stored in Firebase
          console.log('✅ Firebase profile updated with:', {
            displayName: formData.fullName,
            email: formData.email
          });
        } catch (error) {
          console.warn('Failed to update Firebase profile:', error);
          // Continue with signup even if profile update fails
        }
        
        // Sync with backend database - store essential signup credentials
        const syncResult = await firebaseBackendSync.registerUserWithBackend({
          fullName: formData.fullName,
          email: formData.email,
        });
        
        if (syncResult.success) {
          console.log('✅ User credentials stored in Firebase and backend successfully');
          console.log('📊 Stored data includes:', {
            name: formData.fullName,
            email: formData.email
          });
        } else {
          console.warn('Failed to sync with backend:', syncResult.error);
          // Still proceed with signup even if backend sync fails
        }
      }
      
      alert(`Account created successfully! Your credentials are stored in Firebase. Welcome to TheLineCricket, ${formData.fullName}! 🏏`);
      onSignup();
    } catch (error: any) {
      console.error('Signup error:', error);
      setErrors(prev => ({ 
        ...prev, 
        email: authError || 'Signup failed. Please try again.' 
      }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div 
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-gradient-to-br from-orange-500 to-slate-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <span className="text-3xl">🏏</span>
          </div>
          <h1 className="text-3xl text-gray-800 mb-2 font-bold">Join TheLineCricket</h1>
          <p className="text-gray-600 text-lg">Create your account</p>
        </div>

        {/* Signup Form Card */}
        <div 
          className="rounded-2xl p-8 bg-white/80 backdrop-blur-lg border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Full Name Input */}
            <div className="space-y-2">
              <input 
                type="text" 
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required 
                className="w-full px-4 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200 hover:bg-white/90 border-gray-200 focus:ring-orange-200 hover:border-orange-300"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required 
                className={`w-full px-4 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200 hover:bg-white/90 ${
                  errors.email 
                    ? 'border-red-400 focus:ring-red-200 hover:border-red-500' 
                    : 'border-gray-200 focus:ring-orange-200 hover:border-orange-300'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-sm text-red-500 font-medium">{errors.email}</p>
              )}
            </div>
            
            {/* Password Input */}
            <div className="space-y-2">
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required 
                  className={`w-full px-4 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:border-transparent pr-12 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:bg-white/90 ${
                    errors.password 
                      ? 'border-red-400 focus:ring-red-200 hover:border-red-500' 
                      : 'border-gray-200 focus:ring-orange-200 hover:border-orange-300'
                  }`}
                  placeholder="Create a password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-600 transition-colors duration-200 p-1 rounded-lg hover:bg-orange-50"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <div className="relative">
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required 
                  className={`w-full px-4 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:border-transparent pr-12 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:bg-white/90 ${
                    errors.confirmPassword 
                      ? 'border-red-400 focus:ring-red-200 hover:border-red-500' 
                      : 'border-gray-200 focus:ring-orange-200 hover:border-orange-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-600 transition-colors duration-200 p-1 rounded-lg hover:bg-orange-50"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 font-medium">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-3">
              <input 
                type="checkbox" 
                id="agreeToTerms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 mt-1"
              />
              <label htmlFor="agreeToTerms" className="text-sm text-gray-600 cursor-pointer">
                I agree to the{' '}
                <span className="text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors duration-200">
                  Terms of Service
                </span>
                {' '}and{' '}
                <span className="text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors duration-200">
                  Privacy Policy
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-slate-600 text-white rounded-xl hover:from-orange-600 hover:to-slate-700 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account? 
              <button 
                onClick={onSwitchToLogin}
                className="text-orange-600 ml-2 hover:text-orange-700 font-semibold hover:underline transition-colors duration-200"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}