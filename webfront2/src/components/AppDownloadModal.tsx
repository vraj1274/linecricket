import React from 'react';
import { X, Download, Smartphone, QrCode } from 'lucide-react';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
}

export function AppDownloadModal({ isOpen, onClose, feature }: AppDownloadModalProps) {
  if (!isOpen) return null;

  const appStoreUrl = 'https://play.google.com/store/apps/details?id=com.thelinecricket.app';

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Download TheLineCricket App</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Download className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {feature} Feature Available
            </h3>
            <p className="text-gray-600 mb-4">
              To use the {feature.toLowerCase()} feature, please download our mobile app for the best experience!
            </p>
          </div>

          {/* QR Code */}
          <div className="mb-4">
            <div className="inline-block p-4 bg-gray-50 rounded-lg">
              <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mx-auto">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">QR Code</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Use your phone camera to scan
            </p>
            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 font-mono break-all">
                {appStoreUrl}
              </p>
            </div>
          </div>


          {/* Features List */}
          <div className="text-left bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">App Features:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Real-time messaging</li>
              <li>• Push notifications</li>
              <li>• Follow other players</li>
              <li>• Match updates</li>
              <li>• Offline access</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-500 mb-4">
            Available on Android and iOS
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Copy URL to clipboard without opening new page
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard.writeText(appStoreUrl).then(() => {
                    alert('App store URL copied to clipboard!');
                  }).catch(() => {
                    // Fallback: select text in a temporary element
                    const tempInput = document.createElement('input');
                    tempInput.value = appStoreUrl;
                    document.body.appendChild(tempInput);
                    tempInput.select();
                    document.execCommand('copy');
                    document.body.removeChild(tempInput);
                    alert('App store URL copied to clipboard!');
                  });
                } else {
                  // Fallback for older browsers
                  const tempInput = document.createElement('input');
                  tempInput.value = appStoreUrl;
                  document.body.appendChild(tempInput);
                  tempInput.select();
                  document.execCommand('copy');
                  document.body.removeChild(tempInput);
                  alert('App store URL copied to clipboard!');
                }
              }}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Copy App Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
