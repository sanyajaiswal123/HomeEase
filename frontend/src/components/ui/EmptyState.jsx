import React from 'react';
import Button from './Button';

const EmptyState = ({ title, description, icon, actionLabel, onAction, className = '' }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-10 text-center bg-gray-50/50 border border-gray-200 border-dashed rounded-2xl ${className}`}
    >
      {icon ? (
        <div className="text-gray-400 mb-5" aria-hidden="true">
          {icon}
        </div>
      ) : (
        <svg
          className="w-16 h-16 text-gray-300 mb-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      )}
      <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
      {description && <p className="text-text-secondary mb-6 max-w-md">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="secondary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
