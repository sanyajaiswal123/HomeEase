import React from 'react';

const Skeleton = ({ className = '', type = 'block' }) => {
  const baseClass = 'animate-pulse bg-gray-200 rounded-md';

  if (type === 'text') {
    return <div className={`${baseClass} h-4 w-full ${className}`}></div>;
  }
  if (type === 'title') {
    return <div className={`${baseClass} h-6 w-3/4 mb-4 ${className}`}></div>;
  }
  if (type === 'avatar') {
    return <div className={`${baseClass} h-12 w-12 rounded-full ${className}`}></div>;
  }

  // Default block
  return <div className={`${baseClass} ${className}`}></div>;
};

// Ready-made skeleton variants
Skeleton.Card = () => (
  <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 h-full flex flex-col">
    <div className="flex items-center space-x-4 mb-5">
      <Skeleton type="avatar" />
      <div className="flex-1">
        <Skeleton type="title" className="mb-2" />
        <Skeleton type="text" className="w-1/2" />
      </div>
    </div>
    <div className="space-y-3 flex-1">
      <Skeleton type="text" />
      <Skeleton type="text" />
      <Skeleton type="text" className="w-4/5" />
    </div>
    <div className="mt-6 flex justify-between">
      <Skeleton type="text" className="w-1/4 h-8" />
      <Skeleton type="text" className="w-1/4 h-8 rounded-lg" />
    </div>
  </div>
);

Skeleton.List = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex justify-between items-center"
      >
        <div className="space-y-2 flex-1 mr-4">
          <Skeleton type="title" className="h-5" />
          <Skeleton type="text" className="w-1/3" />
        </div>
        <Skeleton type="block" className="w-24 h-10 rounded-lg" />
      </div>
    ))}
  </div>
);

export default Skeleton;
