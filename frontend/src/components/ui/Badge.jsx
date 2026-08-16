import React from 'react';
import { BOOKING_STATUS } from '../../config/constants';

const Badge = ({ status, label, className = '' }) => {
  let colorClasses = 'bg-gray-100 text-gray-700 border border-gray-200';
  let displayLabel = label || status;

  switch (status) {
    case BOOKING_STATUS.PENDING:
    case 'pending':
      colorClasses = 'bg-amber-50 text-amber-700 border border-amber-200';
      displayLabel = label || 'Pending';
      break;
    case BOOKING_STATUS.ACCEPTED:
    case 'accepted':
      colorClasses = 'bg-blue-50 text-blue-700 border border-blue-200';
      displayLabel = label || 'Accepted';
      break;
    case BOOKING_STATUS.IN_PROGRESS:
    case 'in_progress':
      colorClasses = 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      displayLabel = label || 'In Progress';
      break;
    case BOOKING_STATUS.COMPLETED:
    case 'completed':
      colorClasses = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      displayLabel = label || 'Completed';
      break;
    case BOOKING_STATUS.CANCELLED:
    case 'cancelled':
      colorClasses = 'bg-red-50 text-red-700 border border-red-200';
      displayLabel = label || 'Cancelled';
      break;
    case 'success':
      colorClasses = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      break;
    case 'danger':
    case 'error':
      colorClasses = 'bg-red-50 text-red-700 border border-red-200';
      break;
    case 'warning':
      colorClasses = 'bg-amber-50 text-amber-700 border border-amber-200';
      break;
    case 'info':
      colorClasses = 'bg-blue-50 text-blue-700 border border-blue-200';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase ${colorClasses} ${className}`}
    >
      {displayLabel}
    </span>
  );
};

export default Badge;
