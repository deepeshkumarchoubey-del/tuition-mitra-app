import { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  children: ReactNode;
  icon?: ReactNode;
}

export default function Badge({
  variant = 'primary',
  size = 'md',
  children,
  icon,
}: BadgeProps) {
  const variants = {
    primary: 'bg-primary-100 text-primary-700',
    secondary: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium rounded-full
        ${variants[variant]}
        ${sizes[size]}
      `}
    >
      {icon}
      {children}
    </span>
  );
}