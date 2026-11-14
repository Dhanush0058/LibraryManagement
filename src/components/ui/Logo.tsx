import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'coral';
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md',
  variant = 'coral' 
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const bgClasses = {
    coral: 'bg-gradient-to-tr from-coral-600 via-coral-500 to-coral-400 text-white shadow-md shadow-coral-500/25',
    dark: 'bg-charcoal-900 text-coral-400 border border-charcoal-800 shadow-md',
    light: 'bg-white text-coral-500 border border-parchment-200 shadow-xs'
  };

  return (
    <div className={`relative flex items-center justify-center rounded-2xl flex-shrink-0 ${sizeMap[size]} ${bgClasses[variant]} ${className}`}>
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="w-1/2 h-1/2"
      >
        {/* Modern Open Book with Caduceus Stem Emblem */}
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a2.5 2.5 0 0 1 0-5H20" />
        <path d="M6 6h10" />
        <path d="M6 10h7" />
        <circle cx="12" cy="14" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    </div>
  );
};
