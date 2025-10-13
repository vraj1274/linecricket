import React, { useEffect } from 'react';
import { X, Download, Smartphone, QrCode } from 'lucide-react';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
}

export function AppDownloadModal({ isOpen, onClose, feature }: AppDownloadModalProps) {
  // Prevent background scrolling and disable all interactions when modal is open
  useEffect(() => {
    if (isOpen) {
      // Add modal-open class to body
      document.body.classList.add('modal-open');
      
      // Prevent scrolling
      document.body.style.overflow = 'hidden';
      
      // Disable all interactive elements except those in the modal
      const interactiveElements = document.querySelectorAll('button:not([data-modal-button]), a:not([data-modal-button]), input:not([data-modal-button]), select:not([data-modal-button]), textarea:not([data-modal-button]), [tabindex]:not([data-modal-button])');
      interactiveElements.forEach((element) => {
        element.setAttribute('disabled', 'true');
        (element as HTMLElement).style.pointerEvents = 'none';
        (element as HTMLElement).style.opacity = '0.5';
        element.setAttribute('data-original-tabindex', element.getAttribute('tabindex') || '');
        element.setAttribute('tabindex', '-1');
      });
      
      // Disable sidebar navigation
      const sidebar = document.querySelector('[data-sidebar]') as HTMLElement;
      if (sidebar) {
        sidebar.style.pointerEvents = 'none';
        sidebar.style.opacity = '0.5';
      }
      
      // Disable main content area
      const mainContent = document.querySelector('main') as HTMLElement;
      if (mainContent) {
        mainContent.style.pointerEvents = 'none';
        mainContent.style.opacity = '0.5';
      }
    } else {
      // Remove modal-open class from body
      document.body.classList.remove('modal-open');
      
      // Restore scrolling
      document.body.style.overflow = 'unset';
      
      // Re-enable all interactive elements
      const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');
      interactiveElements.forEach((element) => {
        element.removeAttribute('disabled');
        (element as HTMLElement).style.pointerEvents = 'auto';
        (element as HTMLElement).style.opacity = '1';
        const originalTabindex = element.getAttribute('data-original-tabindex');
        if (originalTabindex !== null) {
          element.setAttribute('tabindex', originalTabindex);
          element.removeAttribute('data-original-tabindex');
        }
      });
      
      // Re-enable sidebar navigation
      const sidebar = document.querySelector('[data-sidebar]') as HTMLElement;
      if (sidebar) {
        sidebar.style.pointerEvents = 'auto';
        sidebar.style.opacity = '1';
      }
      
      // Re-enable main content area
      const mainContent = document.querySelector('main') as HTMLElement;
      if (mainContent) {
        mainContent.style.pointerEvents = 'auto';
        mainContent.style.opacity = '1';
      }
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'unset';
      const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');
      interactiveElements.forEach((element) => {
        element.removeAttribute('disabled');
        (element as HTMLElement).style.pointerEvents = 'auto';
        (element as HTMLElement).style.opacity = '1';
        const originalTabindex = element.getAttribute('data-original-tabindex');
        if (originalTabindex !== null) {
          element.setAttribute('tabindex', originalTabindex);
          element.removeAttribute('data-original-tabindex');
        }
      });
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const appStoreUrl = 'https://play.google.com/store/apps/details?id=com.thelinecricket.app';
  const iosAppStoreUrl = 'https://apps.apple.com/app/thelinecricket/id1234567890';
  
  // Detect device type
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  
  const getAppStoreUrl = () => {
    if (isIOS) return iosAppStoreUrl;
    if (isAndroid) return appStoreUrl;
    // Default to Google Play Store for other devices
    return appStoreUrl;
  };
  
  const handleInstallClick = () => {
    const url = getAppStoreUrl();
    window.open(url, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      {/* Global overlay to prevent all interactions */}
      <div className="fixed inset-0 bg-transparent z-40" style={{ pointerEvents: 'auto' }}></div>
      <div 
        className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200 transform scale-100 animate-in fade-in-0 zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-slate-600 p-6 -m-6 mb-4 rounded-t-2xl text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-slate-500/20"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Smartphone className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Download TheLineCricket App</h2>
                <p className="text-orange-100 text-sm">
                  {isIOS ? 'Get it from the App Store' : isAndroid ? 'Get it from Google Play' : 'Get the full experience'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors hover:bg-white/10 rounded-full p-1"
              data-modal-button
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-white">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Download className="w-10 h-10 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {feature} Feature Available
            </h3>
            <p className="text-gray-700 mb-6 font-medium">
              To use the {feature.toLowerCase()} feature, please download our mobile app for the best experience!
            </p>
          </div>

          {/* QR Code */}
          <div className="mb-6">
            <div className="inline-block p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-inner">
              <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center mx-auto shadow-lg border border-gray-200">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 font-medium">QR Code</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3 font-medium">
              Use your phone camera to scan
            </p>
            <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 font-mono break-all">
                {getAppStoreUrl()}
              </p>
            </div>
          </div>


          {/* Features List */}
          <div className="text-left bg-gradient-to-br from-orange-50 to-slate-50 rounded-xl p-4 mb-6 border border-orange-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
              App Features:
            </h4>
            <ul className="text-sm text-gray-800 space-y-2 font-medium">
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-3"></span>
                Real-time messaging
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-3"></span>
                Push notifications
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-3"></span>
                Follow other players
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-3"></span>
                Match updates
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-3"></span>
                Offline access
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 mb-6 font-medium">
            {isIOS ? 'Redirecting to App Store' : isAndroid ? 'Redirecting to Play Store' : 'Available on Android and iOS'}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
              data-modal-button
            >
              Maybe Later
            </button>
            <button
              onClick={handleInstallClick}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-slate-600 text-white rounded-xl hover:from-orange-600 hover:to-slate-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
              data-modal-button
            >
              {isIOS ? (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"/>
                  </svg>
                  <span>Install from App Store</span>
                </>
              ) : isAndroid ? (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <span>Install from Play Store</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,16.5L18,9.5L16.5,8L11,13.5L7.5,10L6,11.5L11,16.5Z"/>
                  </svg>
                  <span>Install App</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
