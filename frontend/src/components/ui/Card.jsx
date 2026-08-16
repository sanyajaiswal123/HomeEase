import React from 'react';

const Card = ({ children, className = '', hoverLift = false, onClick = null, ...props }) => {
  const baseClasses = 'bg-white border border-border-light rounded-2xl overflow-hidden shadow-sm';
  const hoverClasses = hoverLift
    ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated hover:border-gray-300 cursor-pointer'
    : '';

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      {...(onClick && { role: 'button', tabIndex: 0 })}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Header = ({ children, className = '' }) => (
  <div className={`px-6 py-5 border-b border-border-light bg-white ${className}`}>{children}</div>
);

Card.Body = ({ children, className = '' }) => (
  <div className={`p-6 bg-white ${className}`}>{children}</div>
);

Card.Footer = ({ children, className = '' }) => (
  <div className={`px-6 py-4 bg-gray-50 border-t border-border-light ${className}`}>{children}</div>
);

export default Card;
