
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  text, 
  fullScreen = false,
  overlay = false 
}: LoadingSpinnerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-6 h-6';
      case 'lg':
        return 'w-8 h-8';
      case 'xl':
        return 'w-12 h-12';
      default:
        return 'w-6 h-6';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'border-blue-500 border-t-transparent';
      case 'secondary':
        return 'border-gray-500 border-t-transparent';
      case 'white':
        return 'border-white border-t-transparent';
      case 'gray':
        return 'border-gray-300 border-t-transparent';
      default:
        return 'border-blue-500 border-t-transparent';
    }
  };

  const spinner = (
    <div className="flex items-center justify-center">
      <div
        className={`${getSizeClasses()} border-2 border-t-transparent rounded-full animate-spin ${getColorClasses()}`}
      />
      {text && (
        <span className={`ml-3 text-sm ${
          color === 'white' ? 'text-white' : 'text-gray-600'
        }`}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-blue-100">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading...</h3>
          <p className="text-gray-600">{text || 'Please wait while we process your request'}</p>
        </div>
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75 backdrop-blur-sm rounded-lg">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// Specialized loading components for different use cases
export function ProfileLoadingSpinner() {
  return (
    <div className="w-full flex items-center justify-center py-12">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center bg-orange-100">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Profile...</h3>
        <p className="text-sm text-gray-500">Syncing your cricket profile 🏏</p>
      </div>
    </div>
  );
}

export function FormLoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="flex items-center space-x-3">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-blue-700 text-sm font-medium">Processing...</span>
      </div>
    </div>
  );
}

export function ButtonLoadingSpinner() {
  return (
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
  );
}

export function InlineLoadingSpinner() {
  return (
    <div className="inline-flex items-center">
      <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
      <span className="text-sm text-gray-600">Loading...</span>
    </div>
  );
}
