import React from 'react';

const Button = ({
  children,
  variant = 'primary', // primary, secondary, outline, danger, ghost
  size = 'md', // sm, md, lg
  loading = false,
  disabled = false,
  icon = null,
  className = '',
  type = 'button',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-hover text-white shadow-sm focus-visible:ring-primary',
    secondary:
      'bg-white border border-border-light hover:bg-gray-50 text-text-primary shadow-sm focus-visible:ring-gray-200',
    outline:
      'border-2 border-primary hover:bg-primary-light text-primary focus-visible:ring-primary',
    danger: 'bg-error hover:bg-red-600 text-white shadow-sm focus-visible:ring-error',
    ghost:
      'hover:bg-gray-100 text-text-secondary hover:text-text-primary focus-visible:ring-gray-200'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`
        ${baseClasses} 
        ${variantClasses[variant] || variantClasses.primary} 
        ${sizeClasses[size] || sizeClasses.md}
        ${isDisabled ? 'opacity-60 cursor-not-allowed active:scale-100 shadow-none' : 'cursor-pointer'}
        ${className}
      `}
      aria-disabled={isDisabled ? 'true' : 'false'}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : icon ? (
        <span className="mr-2" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
