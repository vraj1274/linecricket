
interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'hero';
  variant?: 'light' | 'dark';
  className?: string;
  iconOnly?: boolean;
}

function Logo({ size = 'medium', variant = 'light', className = '', iconOnly = false }: LogoProps) {
  const sizes = {
    small: { height: '32px' },
    medium: { height: '48px' },
    large: { height: '64px' },
    xlarge: { height: '80px' },
    hero: { height: '120px' }
  };

  const currentSize = sizes[size];

  // Choose the appropriate logo file
  const getLogoSrc = () => {
    if (iconOnly) return '/logo-icon.svg';
    if (variant === 'dark') return '/logo-dark.svg';
    return '/logo.svg';
  };

  const logoSrc = getLogoSrc();

  return (
    <div className={`logo logo-${size} logo-${variant} ${className}`}>
      <img 
        src={logoSrc}
        alt="TheLine Cricket"
        className="logo-image"
        onError={(e) => {
          // Fallback to text logo if SVG fails to load
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      {/* Fallback text logo */}
      <div 
        className={`logo-text-fallback logo-text-${size} logo-text-${variant}`}
      >
        {iconOnly ? '🏏' : 'TheLine Cricket'}
      </div>
    </div>
  );
}

export default Logo;
