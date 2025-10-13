import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import newIcon from '../assets/newiconfinal.svg';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { firebaseBackendSync } from '../services/firebaseBackendSync';

interface LoginPageProps {
  onLogin: () => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
}

export function LoginPage({ onLogin, onSwitchToSignup, onForgotPassword }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{email?: string, password?: string}>({});
  
  // Firebase authentication hook
  const { signIn, loading, error: authError } = useFirebaseAuth();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate email
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return;
    }
    if (!validateEmail(email)) {
      setErrors(prev => ({ ...prev, email: 'Email must end with @gmail.com or @commit.com' }));
      return;
    }

    // Validate password
    if (!password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      return;
    }
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setErrors(prev => ({ ...prev, password: passwordValidation.message }));
      return;
    }

    try {
      // Use Firebase authentication
      await signIn(email, password);
      
      // Sync with backend database
      const syncResult = await firebaseBackendSync.loginUserWithBackend();
      
      if (syncResult.success) {
        console.log('User synced with backend successfully');
      } else {
        console.warn('Failed to sync with backend:', syncResult.error);
        // Still proceed with login even if backend sync fails
      }
      
      alert('Login successful! Welcome back to TheLineCricket! 🏏');
      onLogin();
    } catch (error: any) {
      console.error('Login error:', error);
      setErrors(prev => ({ 
        ...prev, 
        password: authError || 'Login failed. Please check your credentials.' 
      }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div 
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-gradient-to-br from-orange-500 to-slate-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <img src={newIcon} alt="TheLineCricket" className="h-12 w-12" />
          </div>
          <h1 className="text-3xl text-gray-800 mb-2 font-bold">TheLineCricket</h1>
          
        </div>

        {/* Login Form Card */}
        <div 
          className="rounded-2xl p-8 bg-white/80 backdrop-blur-lg border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email Input */}
            <div className="space-y-3">
              <input 
                type="email" 
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors(prev => ({ ...prev, email: undefined }));
                  }
                }}
                required 
                className={`w-full px-4 py-4 border-2 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200 hover:bg-white/90 ${
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
            <div className="space-y-3">
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors(prev => ({ ...prev, password: undefined }));
                    }
                  }}
                  required 
                  className={`w-full px-4 py-4 border-2 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:border-transparent pr-12 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:bg-white/90 ${
                    errors.password 
                      ? 'border-red-400 focus:ring-red-200 hover:border-red-500' 
                      : 'border-gray-200 focus:ring-orange-200 hover:border-orange-300'
                  }`}
                  placeholder="Enter your password"
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button 
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors duration-200"
              >
                Forgot password?
              </button>
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
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Switch to Signup */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account? 
              <button 
                onClick={onSwitchToSignup}
                className="text-orange-600 ml-2 hover:text-orange-700 font-semibold hover:underline transition-colors duration-200"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}