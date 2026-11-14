import React, { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-parchment-200 shadow-2xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-coral-300' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = '' }) => (
  <div className={`px-6 py-4 border-b border-parchment-200 flex items-center justify-between ${className}`}>
    <div>
      <h3 className="font-bold text-charcoal-900 text-sm tracking-tight">{title}</h3>
      {subtitle && <p className="text-xs text-charcoal-500 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export const CardContent: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`p-5 ${className}`}>{children}</div>;
