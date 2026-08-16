import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 font-inter text-gray-900">
          <div className="max-w-md w-full bg-white rounded-2xl p-10 text-center border border-gray-200 shadow-xl">
            <div className="text-red-500 mb-6 bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto border border-red-100">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold mb-3 font-outfit text-gray-900">
              Something went wrong
            </h1>
            <p className="text-text-secondary mb-8 text-base font-medium leading-relaxed">
              An unexpected error occurred in the application. Our team has been notified.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full bg-primary hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
