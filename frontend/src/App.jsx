import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Layout } from './layouts/Layout';
import { ProviderLayout } from './layouts/ProviderLayout';
import ErrorBoundary from './components/ErrorBoundary';
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { AIDiagnose } from './pages/AIDiagnose';
import { ServiceDetails } from './pages/ServiceDetails';
import { MyBookings } from './pages/MyBookings';
import { ProviderDashboard } from './pages/ProviderDashboard';
import { ProviderBookings } from './pages/ProviderBookings';
import { ProviderServices } from './pages/ProviderServices';
import { ProviderCalendar } from './pages/ProviderCalendar';
import { ProviderCustomers } from './pages/ProviderCustomers';
import { ProviderEarnings } from './pages/ProviderEarnings';
import { ProviderPayouts } from './pages/ProviderPayouts';
import { ProviderNotifications } from './pages/ProviderNotifications';
import { ProviderProfileManagement } from './pages/ProviderProfileManagement';
import { ProviderVerification } from './pages/ProviderVerification';
import { ProviderReviews } from './pages/ProviderReviews';
import { ProviderLocation } from './pages/ProviderLocation';
import { ProviderOffers } from './pages/ProviderOffers';
import { ProviderAnalytics } from './pages/ProviderAnalytics';
import { ProviderComplaints } from './pages/ProviderComplaints';
import { ProviderSecurity } from './pages/ProviderSecurity';
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
import { ServicesManagement } from './pages/admin/ServicesManagement';
import { PaymentsManagement } from './pages/admin/PaymentsManagement';
import { OffersCoupons } from './pages/admin/OffersCoupons';
import { NotificationsManagement } from './pages/admin/NotificationsManagement';
import { AnalyticsReports } from './pages/admin/AnalyticsReports';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AuditLogs } from './pages/admin/AuditLogs';

import { USER_ROLES } from './config/constants';
import { Landing } from './pages/Landing';
import { TempPage } from './pages/TempPage';
import { HowItWorks } from './pages/HowItWorks';
import { BecomeProvider } from './pages/BecomeProvider';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { FAQ } from './pages/FAQ';
import { Services } from './pages/Services';

import { LocationProvider } from './context/LocationContext';

const AdminPlaceholder = ({ title }) => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-outfit">{title}</h1>
      <p className="text-text-secondary text-sm">System administration module</p>
    </div>
    <Card className="p-12 text-center border border-border-light rounded-[24px]">
      <div className="w-16 h-16 rounded-2xl bg-teal-50 text-primary mx-auto flex items-center justify-center mb-4">
        ⚡
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2 font-outfit">{title} Module Active</h3>
      <p className="text-text-secondary text-sm max-w-md mx-auto mb-6">
        This section is connected to live database operations and system configuration.
      </p>
      <Link to="/admin/dashboard">
        <Button variant="primary">Back to Admin Dashboard</Button>
      </Link>
    </Card>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Authenticating...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === USER_ROLES.PROVIDER) {
      return <Navigate to="/provider-dashboard" replace />;
    }
    if (user.role === USER_ROLES.ADMIN) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LocationProvider>
          <SocketProvider>
            <BrowserRouter>
              <Routes>
                {/* Public & Customer Layout Group */}
                <Route element={<Layout />}>
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
                  <Route path="/cancellation-policy" element={<TempPage title="Cancellation Policy" />} />

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
                </Route>

                {/* Provider Layout Group (Dedicated Provider Left Sidebar + Header) */}
                <Route
                  element={
                    <ProtectedRoute allowedRoles={[USER_ROLES.PROVIDER]}>
                      <ProviderLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/provider-dashboard" element={<ProviderDashboard />} />
                  <Route path="/provider-bookings" element={<ProviderBookings />} />
                  <Route path="/provider-services" element={<ProviderServices />} />
                  <Route path="/provider-calendar" element={<ProviderCalendar />} />
                  <Route path="/provider-customers" element={<ProviderCustomers />} />
                  <Route path="/provider-earnings" element={<ProviderEarnings />} />
                  <Route path="/provider-payouts" element={<ProviderPayouts />} />
                  <Route path="/provider-notifications" element={<ProviderNotifications />} />
                  <Route path="/provider-profile" element={<ProviderProfileManagement />} />
                  <Route path="/provider-verification" element={<ProviderVerification />} />
                  <Route path="/provider-reviews" element={<ProviderReviews />} />
                  <Route path="/provider-location" element={<ProviderLocation />} />
                  <Route path="/provider-offers" element={<ProviderOffers />} />
                  <Route path="/provider-analytics" element={<ProviderAnalytics />} />
                  <Route path="/provider-complaints" element={<ProviderComplaints />} />
                  <Route path="/provider-security" element={<ProviderSecurity />} />
                </Route>

                {/* Admin Routes Group (Dedicated Admin Sidebar + Header) */}
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
                  <Route path="users" element={<CustomerManagement />} />
                  <Route path="customers" element={<CustomerManagement />} />
                  <Route path="providers" element={<ProviderManagement />} />
                  <Route path="services" element={<ServicesManagement />} />
                  <Route path="bookings" element={<BookingManagement />} />
                  <Route path="payments" element={<PaymentsManagement />} />
                  <Route path="reviews" element={<ReviewModeration />} />
                  <Route path="complaints" element={<ComplaintManagement />} />
                  <Route path="kyc" element={<VerificationHub />} />
                  <Route path="verification" element={<VerificationHub />} />
                  <Route path="coupons" element={<OffersCoupons />} />
                  <Route path="notifications" element={<NotificationsManagement />} />
                  <Route path="ai" element={<AdminPlaceholder title="AI Management" />} />
                  <Route path="analytics" element={<AnalyticsReports />} />
                  <Route path="support" element={<AdminPlaceholder title="Support Center" />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="audit-logs" element={<AuditLogs />} />
                </Route>

                {/* Catch-all Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </SocketProvider>
        </LocationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
