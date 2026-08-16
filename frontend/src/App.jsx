import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Layout } from './layouts/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { AIDiagnose } from './pages/AIDiagnose';
import { ServiceDetails } from './pages/ServiceDetails';
import { MyBookings } from './pages/MyBookings';
import { ProviderDashboard } from './pages/ProviderDashboard';
import { ProviderEarnings } from './pages/ProviderEarnings';
import { BookingTracking } from './pages/BookingTracking';
import { ProviderList } from './pages/ProviderList';
import { ProviderProfile } from './pages/ProviderProfile';
import { AdminLayout } from './layouts/AdminLayout';
import { Dashboard as AdminDashboard } from './pages/admin/Dashboard';
import { CustomerManagement } from './pages/admin/CustomerManagement';
import { ProviderManagement } from './pages/admin/ProviderManagement';
import { VerificationHub } from './pages/admin/VerificationHub';
import { BookingManagement } from './pages/admin/BookingManagement';
import { ComplaintManagement } from './pages/admin/ComplaintManagement';
import { ReviewModeration } from './pages/admin/ReviewModeration';
import { Sparkles, ShieldCheck, MapPin, BadgePercent, ArrowRight } from 'lucide-react';
import { USER_ROLES } from './config/constants';
import './App.css';

// Protected Route Wrapper for Role-Based Access Control
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-text-muted font-semibold">
        Verifying user credentials...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect role mismatch to their index boards
    if (user.role === USER_ROLES.PROVIDER) return <Navigate to="/provider-dashboard" replace />;
    if (user.role === USER_ROLES.ADMIN) return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

import { Landing } from './pages/Landing';
import { TempPage } from './pages/TempPage';
import { HowItWorks } from './pages/HowItWorks';
import { BecomeProvider } from './pages/BecomeProvider';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { FAQ } from './pages/FAQ';
import { Services } from './pages/Services';

export const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/services" element={<Services />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/become-provider" element={<BecomeProvider />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/ai-diagnose" element={<AIDiagnose />} />

                {/* Footer Legal Placeholder Routes */}
                <Route path="/terms" element={<TempPage title="Terms of Service" />} />
                <Route path="/privacy" element={<TempPage title="Privacy Policy" />} />
                <Route path="/careers" element={<TempPage title="Careers" />} />
                <Route path="/press" element={<TempPage title="Press" />} />
                <Route path="/blog" element={<TempPage title="Blog" />} />
                <Route
                  path="/cancellation-policy"
                  element={<TempPage title="Cancellation Policy" />}
                />

                {/* Customer Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/services/:serviceId/providers"
                  element={
                    <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
                      <ProviderList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/services/provider/:id"
                  element={
                    <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
                      <ProviderProfile />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/service/:id"
                  element={
                    <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
                      <ServiceDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookings"
                  element={
                    <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
                      <MyBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/booking/track/:id"
                  element={
                    <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
                      <BookingTracking />
                    </ProtectedRoute>
                  }
                />

                {/* Provider Routes */}
                <Route
                  path="/provider-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={[USER_ROLES.PROVIDER]}>
                      <ProviderDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/provider-earnings"
                  element={
                    <ProtectedRoute allowedRoles={[USER_ROLES.PROVIDER]}>
                      <ProviderEarnings />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="customers" element={<CustomerManagement />} />
                  <Route path="providers" element={<ProviderManagement />} />
                  <Route path="verification" element={<VerificationHub />} />
                  <Route
                    path="services"
                    element={
                      <div className="p-10 text-center font-bold">
                        Service Categories Module coming soon
                      </div>
                    }
                  />
                  <Route path="bookings" element={<BookingManagement />} />
                  <Route path="complaints" element={<ComplaintManagement />} />
                  <Route path="reviews" element={<ReviewModeration />} />
                </Route>

                {/* Redirect any random route to index */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
