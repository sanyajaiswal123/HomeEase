export const USER_ROLES = {
  CUSTOMER: 'customer',
  PROVIDER: 'provider',
  ADMIN: 'admin'
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    UPDATE: '/auth/update-me',
    PROVIDERS: '/auth/providers'
  },
  SERVICES: '/services',
  BOOKINGS: {
    BASE: '/bookings',
    MY: '/bookings/my'
  },
  AI: {
    DIAGNOSE: '/ai/diagnose'
  },
  REVIEWS: '/reviews'
};
