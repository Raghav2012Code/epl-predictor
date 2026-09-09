import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 28, className = '' }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex-shrink-0 flex items-center justify-center overflow-hidden bg-black border border-border ${className}`}
    >
      <img
        src="/logo.png"
        alt="EPL Predictor Logo"
        className="w-full h-full object-contain select-none pointer-events-none"
        loading="eager"
      />
    </div>
  );
};

export default Logo;
