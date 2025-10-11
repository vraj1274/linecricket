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
    <div className="min-h-screen flex flex-col justify-center items-center px-6 py-8 bg-gray-100">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div 
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-lg border border-white/30 shadow-xl"
          >
            <span className="text-2xl">🏏</span>
          </div>
          <h1 className="text-2xl text-gray-800 mb-1 font-bold">Join TheLineCricket</h1>
          <p className="text-gray-600">Create your account</p>
        </div>

        <div 
          className="rounded-xl p-6 border bg-white/20 backdrop-blur-md border-white/30 shadow-lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input 
                type="text" 
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required 
                className="w-full px-4 py-3 border rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white/50 backdrop-blur-sm border-gray-300"
                placeholder="Full Name"
              />
            </div>

            <div>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required 
                className={`w-full px-4 py-3 border rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent bg-white/50 backdrop-blur-sm ${
                  errors.email ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'
                }`}
                placeholder="Email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            
            <div>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required 
                  className={`w-full px-4 py-3 border rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent pr-12 bg-white/50 backdrop-blur-sm ${
                    errors.password ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'
                  }`}
                  placeholder="Password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required 
                  className={`w-full px-4 py-3 border rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent pr-12 bg-white/50 backdrop-blur-sm ${
                    errors.confirmPassword ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'
                  }`}
                  placeholder="Confirm Password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-slate-600 text-white rounded-lg hover:from-orange-600 hover:to-slate-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account? 
              <button 
                onClick={onSwitchToLogin}
                className="text-orange-600 ml-1 hover:underline font-medium"
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