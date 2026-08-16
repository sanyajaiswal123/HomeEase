import React from 'react';

export const TempPage = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center w-full px-6 animate-fade-in">
      <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m18 16 4-4-4-4" />
          <path d="m6 8-4 4 4 4" />
          <path d="m14.5 4-5 16" />
        </svg>
      </div>
      <h1 className="text-4xl font-extrabold text-gray-900 font-outfit mb-4">{title}</h1>
      <p className="text-lg text-gray-500 max-w-md mx-auto">
        This page is currently under construction. Please check back later!
      </p>
    </div>
  );
};

export default TempPage;
