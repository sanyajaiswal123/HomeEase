import React, { forwardRef } from 'react';

const Input = forwardRef(
  ({ label, id, error, icon, className = '', wrapperClassName = '', ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`mb-5 ${wrapperClassName}`}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-text-primary mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div
              className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted"
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
            block w-full bg-white border ${error ? 'border-error' : 'border-gray-200'} 
            rounded-xl text-text-primary placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            transition-all duration-200 shadow-sm
            ${icon ? 'pl-10' : 'px-4'} py-2.5
            ${className}
          `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-error font-medium" id={`${inputId}-error`} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
