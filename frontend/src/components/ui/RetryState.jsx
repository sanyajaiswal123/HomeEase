import React from 'react';
import Button from './Button';

const RetryState = ({ error, onRetry, message = 'Failed to load data.', className = '' }) => {
  // Extract user-friendly error message if available
  const displayMessage =
    typeof error === 'string' ? error : error?.friendlyMessage || error?.message || message;

  return (
    <div
      className={`bg-red-50 border border-red-100 rounded-2xl p-8 text-center shadow-sm ${className}`}
    >
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 text-red-500 mb-5">
        <svg
          className="w-7 h-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-red-700 mb-2">Something went wrong</h3>
      <p className="text-red-600/80 mb-6">{displayMessage}</p>

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="danger"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          }
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

export default RetryState;
