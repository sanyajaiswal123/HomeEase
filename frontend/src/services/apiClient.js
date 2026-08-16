import axios from 'axios';

const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let customError = 'An unexpected error occurred.';

    if (error.response) {
      // Backend returned an error response
      const status = error.response.status;

      if (status === 400) {
        customError = 'Please check the information you entered.';
      } else if (status === 401) {
        customError = 'Invalid email or password.';
        // Only redirect if they are not already trying to login/register
        if (!error.config.url.includes('/login') && !error.config.url.includes('/register')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/auth';
        }
      } else if (status === 403) {
        customError = 'Your account is not authorized to perform this action.';
      } else if (status === 404) {
        customError = 'Authentication service is unavailable.';
      } else if (status === 409) {
        customError = 'An account with this email already exists.';
      } else if (status === 422) {
        customError = error.response.data.message || 'Validation error.';
      } else if (status === 429) {
        customError = 'Too many login attempts. Please try again later.';
      } else if (status >= 500) {
        customError =
          error.response?.data?.message ||
          'Something went wrong on our server. Please try again later.';
      } else {
        customError = error.response?.data?.message || customError;
      }
    } else if (error.request) {
      // The request was made but no response was received
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        customError = 'The server is taking too long to respond. Please try again.';
      } else if (error.message === 'Network Error') {
        // Axios sets error.message to 'Network Error' for CORS and offline issues
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          customError = 'Network error. Please check your internet connection.';
        } else {
          customError = 'Unable to connect to the server due to a configuration issue.';
        }
      } else {
        customError = 'Unable to reach the server. Please make sure the backend is running.';
      }
    }

    // Attach friendly message to the error object so components can display it
    error.friendlyMessage = customError;
    return Promise.reject(error);
  }
);

export default apiClient;
