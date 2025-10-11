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
    <div className="min-h-screen flex flex-col justify-center items-center px-6 bg-gray-100">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div 
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-lg border border-white/30 shadow-xl"
          >
            <img src={newIcon} alt="TheLineCricket" className="h-10 w-10" />
          </div>
          <h1 className="text-2xl text-gray-800 mb-1 font-bold">TheLineCricket</h1>
          <p className="text-gray-600">Welcome Back</p>
        </div>

        <div 
          className="rounded-xl p-6 border bg-white/20 backdrop-blur-md border-white/30 shadow-lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
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
                className={`w-full px-4 py-2 border rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent bg-white/50 backdrop-blur-sm ${
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
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors(prev => ({ ...prev, password: undefined }));
                    }
                  }}
                  required 
                  className={`w-full px-4 py-2 border rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent pr-12 bg-white/50 backdrop-blur-sm ${
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

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-slate-600 text-white rounded-lg hover:from-orange-600 hover:to-slate-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account? 
              <button 
                onClick={onSwitchToSignup}
                className="text-orange-600 ml-1 hover:underline font-medium"
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