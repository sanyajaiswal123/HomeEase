import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/apiClient';
import { AuthContext } from '../context/AuthContext';
import {
  Calendar,
  User,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  ShieldAlert,
  ArrowRight,
  Star,
  IndianRupee,
  Briefcase,
  AlertCircle,
  Zap,
  Bell,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Filter
} from 'lucide-react';
import { io } from 'socket.io-client';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import RetryState from '../components/ui/RetryState';

export const ProviderDashboard = () => {
  const { user, setUser } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggleLoading, setToggleLoading] = useState(false);

  // Active View Tab State
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'pending' | 'today' | 'upcoming' | 'completed' | 'notifications'

  // OTP Modal States
  const [activeOtpBookingId, setActiveOtpBookingId] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Action Loading states
  const [acceptingId, setAcceptingId] = useState(null);
  const [completingId, setCompletingId] = useState(null);

  // Socket reference for live location simulation
  const [socket, setSocket] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/bookings/provider-stats');
      setData(res.data.data);
    } catch (err) {
      console.error('Error fetching provider dashboard data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5000';

    const s = io(socketUrl);
    setSocket(s);

    if (user?._id) {
      s.emit('register', user._id);
    }

    return () => {
      s.disconnect();
    };
  }, [user?._id]);

  // Real-time location simulation loop when there is an active 'in_progress' job
  useEffect(() => {
    const activeJobs = data?.activeBookings || [];
    const activeJob = activeJobs.find(
      (b) => b.status === 'in_progress' && b.provider?._id === user?._id
    );
    if (!activeJob || !socket) return;

    let lat = 28.6139;
    let lng = 77.209;

    const interval = setInterval(() => {
      lat += (Math.random() - 0.4) * 0.0005;
      lng += (Math.random() - 0.4) * 0.0005;

      socket.emit('update_location', {
        providerId: user._id,
        coordinates: [lng, lat]
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [data?.activeBookings, socket, user?._id]);

  // Availability Toggle
  const handleToggleAvailability = async () => {
    if (!user) return;
    const newStatus = !user.providerDetails?.isAvailable;
    setToggleLoading(true);
    try {
      const res = await apiClient.put('/auth/me', {
        providerDetails: {
          isAvailable: newStatus
        }
      });
      setUser(res.data.data.user);
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to update duty status.');
    } finally {
      setToggleLoading(false);
    }
  };

  // Accept Job
  const handleAcceptJob = async (bookingId) => {
    setAcceptingId(bookingId);
    try {
      await apiClient.put(`/bookings/${bookingId}/status`, {
        status: 'accepted'
      });
      alert('Job accepted! You are now assigned to this service request.');
      fetchDashboardData();
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to accept job.');
    } finally {
      setAcceptingId(null);
    }
  };

  // Start Job with OTP
  const handleStartService = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError('');

    try {
      await apiClient.put(`/bookings/${activeOtpBookingId}/status`, {
        status: 'in_progress',
        otpInput
      });
      setActiveOtpBookingId(null);
      setOtpInput('');
      fetchDashboardData();
      alert('OTP Verified! Service visit active.');
    } catch (err) {
      setOtpError(err.friendlyMessage || 'Invalid OTP code.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Complete Service Job
  const handleCompleteService = async (bookingId) => {
    if (!window.confirm('Are you sure you have completed the service work?')) return;

    setCompletingId(bookingId);
    try {
      await apiClient.put(`/bookings/${bookingId}/status`, {
        status: 'completed'
      });
      fetchDashboardData();
      alert('Service job completed!');
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to mark service completed.');
    } finally {
      setCompletingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = data?.stats || {
    totalBookings: 0,
    pendingRequestsCount: 0,
    acceptedCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    todaysCount: 0,
    upcomingCount: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    rating: user?.providerDetails?.rating || 5.0
  };

  const pendingRequests = data?.pendingRequests || [];
  const activeBookings = data?.activeBookings || [];
  const todaysBookings = data?.todaysBookings || [];
  const upcomingBookings = data?.upcomingBookings || [];
  const recentBookings = data?.recentBookings || [];
  const recentNotifications = data?.recentNotifications || [];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full py-8 px-4 sm:px-6">
      {/* Header & Duty Switch */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-[28px] border border-border-light shadow-soft">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 font-outfit tracking-tight">
              Provider Dashboard
            </h1>
            {user?.providerDetails?.isVerified && (
              <Badge variant="success" className="px-3 py-1 text-xs font-bold uppercase">
                Verified Partner
              </Badge>
            )}
          </div>
          <p className="text-text-secondary font-medium text-sm sm:text-base mt-1">
            Logged in as <strong className="text-gray-900">{user?.name}</strong> ({user?.email})
          </p>
        </div>

        {/* Duty Switch */}
        <div className="flex items-center gap-4 bg-gray-50 p-3.5 rounded-2xl border border-gray-200 shrink-0">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Duty Availability
            </span>
            <strong
              className={`text-sm font-extrabold ${
                user?.providerDetails?.isAvailable ? 'text-emerald-600' : 'text-gray-500'
              }`}
            >
              {user?.providerDetails?.isAvailable ? '● ONLINE (Available)' : '○ OFFLINE'}
            </strong>
          </div>

          <button
            onClick={handleToggleAvailability}
            disabled={toggleLoading}
            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              user?.providerDetails?.isAvailable ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                user?.providerDetails?.isAvailable ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Verification Status Banner */}
      {user?.providerDetails?.verificationStatus === 'rejected' && (
        <div className="p-5 rounded-[24px] bg-red-50 border border-red-200 flex items-start gap-4 text-red-900 shadow-sm">
          <ShieldAlert size={26} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-extrabold text-base block font-outfit">
              Verification Rejected
            </strong>
            <p className="text-sm mt-1 text-red-700 font-medium">
              Reason:{' '}
              <span className="font-bold italic">
                "{user?.providerDetails?.verificationHistory?.slice(-1)[0]?.reason || 'Documentation did not meet criteria.'}"
              </span>
            </p>
          </div>
        </div>
      )}

      {user?.providerDetails?.verificationStatus === 'pending' && (
        <div className="p-5 rounded-[24px] bg-amber-50 border border-amber-200 flex items-center gap-4 text-amber-900 shadow-sm">
          <Clock size={24} className="text-amber-600 shrink-0" />
          <div>
            <strong className="font-extrabold text-base block font-outfit">
              Verification Pending Review
            </strong>
            <p className="text-xs text-amber-800 font-medium mt-0.5">
              Your KYC details are being verified by HomeEase administration.
            </p>
          </div>
        </div>
      )}

      {/* Real Provider Data Metrics Grid (Clickable Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Earnings */}
        <Card
          onClick={() => setActiveTab('completed')}
          className="p-5 shadow-soft border-border-light rounded-[22px] bg-white cursor-pointer hover:border-primary/50 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-text-secondary uppercase">
              Total Earnings
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <IndianRupee size={18} />
            </div>
          </div>
          <strong className="text-2xl text-emerald-600 font-extrabold font-outfit block">
            ₹{stats.totalEarnings}
          </strong>
          <span className="text-[11px] text-text-secondary font-bold mt-1 block">
            Pending: ₹{stats.pendingEarnings}
          </span>
        </Card>

        {/* Total Bookings */}
        <Card
          onClick={() => setActiveTab('active')}
          className="p-5 shadow-soft border-border-light rounded-[22px] bg-white cursor-pointer hover:border-primary/50 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-text-secondary uppercase">
              Total Bookings
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-primary flex items-center justify-center border border-teal-100">
              <Briefcase size={18} />
            </div>
          </div>
          <strong className="text-2xl text-gray-900 font-extrabold font-outfit block">
            {stats.totalBookings}
          </strong>
          <span className="text-[11px] text-primary font-bold mt-1 block">
            Assigned to you
          </span>
        </Card>

        {/* Pending Requests */}
        <Card
          onClick={() => setActiveTab('pending')}
          className="p-5 shadow-soft border-border-light rounded-[22px] bg-white cursor-pointer hover:border-amber-400 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-text-secondary uppercase">
              Pending Requests
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Clock size={18} />
            </div>
          </div>
          <strong className="text-2xl text-amber-600 font-extrabold font-outfit block">
            {stats.pendingRequestsCount}
          </strong>
          <span className="text-[11px] text-amber-700 font-bold mt-1 block">
            Open in your category
          </span>
        </Card>

        {/* Today's Bookings */}
        <Card
          onClick={() => setActiveTab('today')}
          className="p-5 shadow-soft border-border-light rounded-[22px] bg-white cursor-pointer hover:border-blue-400 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-text-secondary uppercase">
              Today's Jobs
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Calendar size={18} />
            </div>
          </div>
          <strong className="text-2xl text-blue-600 font-extrabold font-outfit block">
            {stats.todaysCount}
          </strong>
          <span className="text-[11px] text-blue-600 font-bold mt-1 block">
            Upcoming: {stats.upcomingCount}
          </span>
        </Card>

        {/* Rating */}
        <Card className="p-5 shadow-soft border-border-light rounded-[22px] bg-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-text-secondary uppercase">
              Rating
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100">
              <Star size={18} className="fill-amber-500" />
            </div>
          </div>
          <strong className="text-2xl text-gray-900 font-extrabold font-outfit block">
            {stats.rating} / 5.0
          </strong>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
            Completed: {stats.completedCount}
          </span>
        </Card>
      </div>

      {/* Tabs Bar */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm overflow-x-auto gap-1">
        {[
          { id: 'active', label: `Active Jobs (${activeBookings.length})` },
          { id: 'pending', label: `Pending Requests (${pendingRequests.length})` },
          { id: 'today', label: `Today's Jobs (${todaysBookings.length})` },
          { id: 'upcoming', label: `Upcoming Jobs (${upcomingBookings.length})` },
          { id: 'completed', label: `Completed History (${stats.completedCount})` },
          { id: 'notifications', label: `Notifications (${recentNotifications.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-[24px]" />
      ) : error ? (
        <RetryState error={error} onRetry={fetchDashboardData} />
      ) : (
        <div>
          {/* TAB 1: Active Jobs */}
          {activeTab === 'active' && (
            <div>
              {activeBookings.length === 0 ? (
                <EmptyState
                  title="No Active Jobs"
                  description="You have no accepted or in-progress jobs currently assigned."
                />
              ) : (
                <div className="flex flex-col gap-6">
                  {activeBookings.map((job) => (
                    <Card
                      key={job._id}
                      className={`border-l-[6px] shadow-soft rounded-[24px] bg-white ${
                        job.status === 'in_progress' ? 'border-l-primary' : 'border-l-amber-500'
                      }`}
                    >
                      <Card.Body className="p-6 sm:p-8">
                        <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-100">
                          <div>
                            <strong className="text-2xl text-gray-900 font-outfit font-extrabold">
                              {job.service?.name}
                            </strong>
                            <span className="text-xs text-text-secondary block mt-1 font-bold">
                              Booking ID: #{job._id.slice(-8).toUpperCase()}
                            </span>
                          </div>
                          <Badge variant={job.status === 'in_progress' ? 'info' : 'warning'}>
                            {job.status.replace('_', ' ')}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
                          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <span className="text-text-secondary block text-[10px] font-bold uppercase mb-1">
                              Customer
                            </span>
                            <strong className="text-gray-900 text-base block font-bold">
                              {job.customer?.name}
                            </strong>
                            <span className="flex items-center gap-1.5 text-gray-700 font-medium text-xs mt-1">
                              <Phone size={14} className="text-primary" /> {job.customer?.phone}
                            </span>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <span className="text-text-secondary block text-[10px] font-bold uppercase mb-1">
                              Address
                            </span>
                            <span className="flex items-start gap-1.5 text-gray-900 font-medium text-xs">
                              <MapPin size={16} className="text-primary mt-0.5 shrink-0" />{' '}
                              {job.address?.street}, {job.address?.city}
                            </span>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <span className="text-text-secondary block text-[10px] font-bold uppercase mb-1">
                              Scheduled Date
                            </span>
                            <span className="flex items-center gap-1.5 text-gray-900 font-medium text-xs">
                              <Calendar size={14} className="text-primary" />{' '}
                              {formatDate(job.scheduledDate)}
                            </span>
                          </div>

                          <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-100">
                            <span className="text-primary block text-[10px] font-bold uppercase mb-1">
                              Net Earnings (80%)
                            </span>
                            <strong className="text-gray-900 text-2xl font-extrabold font-outfit block">
                              ₹{Math.round((job.totalAmount || 0) * 0.8)}
                            </strong>
                          </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                          {job.status === 'accepted' && (
                            <Button
                              onClick={() => {
                                setActiveOtpBookingId(job._id);
                                setOtpInput('');
                                setOtpError('');
                              }}
                              variant="primary"
                              className="rounded-xl px-6 py-3 font-bold shadow-md"
                            >
                              Start Service Visit (Enter OTP) <ArrowRight size={16} />
                            </Button>
                          )}

                          {job.status === 'in_progress' && (
                            <div className="flex items-center justify-between gap-4 w-full flex-wrap">
                              <span className="text-xs text-primary font-bold bg-teal-50 px-3.5 py-2 rounded-xl border border-teal-100 flex items-center gap-2">
                                <Zap size={14} className="animate-pulse" /> Live Beacon Active
                              </span>
                              <Button
                                onClick={() => handleCompleteService(job._id)}
                                loading={completingId === job._id}
                                variant="accent"
                                className="rounded-xl px-6 py-3 font-bold shadow-md"
                              >
                                Mark Job Completed
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Pending Requests */}
          {activeTab === 'pending' && (
            <div>
              {pendingRequests.length === 0 ? (
                <EmptyState
                  title="No Pending Job Requests"
                  description="There are currently no open service requests in your category."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingRequests.map((req) => (
                    <Card key={req._id} className="p-6 bg-white border border-gray-200 rounded-[24px] shadow-soft">
                      <div className="flex justify-between items-start mb-4">
                        <strong className="text-xl font-extrabold text-gray-900 font-outfit">
                          {req.service?.name}
                        </strong>
                        <strong className="text-primary text-xl font-extrabold">
                          ₹{req.totalAmount}
                        </strong>
                      </div>

                      <div className="flex flex-col gap-2 text-xs text-gray-700 font-medium mb-6">
                        <span className="flex items-center gap-2">
                          <Calendar size={14} className="text-primary" /> {formatDate(req.scheduledDate)}
                        </span>
                        <span className="flex items-center gap-2">
                          <MapPin size={14} className="text-primary" /> {req.address?.city || 'Delhi NCR'}
                        </span>
                      </div>

                      <Button
                        onClick={() => handleAcceptJob(req._id)}
                        loading={acceptingId === req._id}
                        variant="primary"
                        className="w-full justify-center rounded-xl py-3 font-bold shadow-md"
                      >
                        Accept Job
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Today's Jobs */}
          {activeTab === 'today' && (
            <div>
              {todaysBookings.length === 0 ? (
                <EmptyState
                  title="No Jobs Scheduled for Today"
                  description="You have no service appointments scheduled for today's date."
                />
              ) : (
                <div className="flex flex-col gap-4">
                  {todaysBookings.map((job) => (
                    <Card key={job._id} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <strong className="text-gray-900 text-lg font-bold block">{job.service?.name}</strong>
                          <span className="text-xs text-text-secondary font-medium">Customer: {job.customer?.name} ({job.customer?.phone})</span>
                        </div>
                        <Badge variant="primary">{job.status}</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Upcoming Jobs */}
          {activeTab === 'upcoming' && (
            <div>
              {upcomingBookings.length === 0 ? (
                <EmptyState
                  title="No Upcoming Jobs"
                  description="You have no future service appointments scheduled."
                />
              ) : (
                <div className="flex flex-col gap-4">
                  {upcomingBookings.map((job) => (
                    <Card key={job._id} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <strong className="text-gray-900 text-lg font-bold block">{job.service?.name}</strong>
                          <span className="text-xs text-text-secondary font-medium">Scheduled: {formatDate(job.scheduledDate)}</span>
                        </div>
                        <Badge variant="warning">{job.status}</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Completed History */}
          {activeTab === 'completed' && (
            <div>
              {recentBookings.length === 0 ? (
                <EmptyState
                  title="No Job History"
                  description="No finished jobs found for this provider profile."
                />
              ) : (
                <div className="flex flex-col gap-4">
                  {recentBookings.map((job) => (
                    <Card key={job._id} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <strong className="text-gray-900 text-lg font-bold block">{job.service?.name}</strong>
                          <span className="text-xs text-text-secondary font-medium">{formatDate(job.scheduledDate)}</span>
                        </div>
                        <div className="text-right">
                          <Badge variant={job.status === 'completed' ? 'success' : 'error'}>{job.status}</Badge>
                          <strong className="block text-gray-900 font-extrabold text-base mt-1">+₹{Math.round((job.totalAmount || 0) * 0.8)}</strong>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: Notifications */}
          {activeTab === 'notifications' && (
            <div>
              {recentNotifications.length === 0 ? (
                <EmptyState
                  title="No In-App Notifications"
                  description="No system or job notifications received yet."
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {recentNotifications.map((n) => (
                    <Card key={n._id} className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-base font-bold text-gray-900">{n.title}</strong>
                        <span className="text-xs text-text-secondary">{formatDate(n.createdAt)}</span>
                      </div>
                      <p className="text-sm text-text-secondary font-medium">{n.message}</p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* OTP Visit Verification Modal */}
      <Modal
        isOpen={!!activeOtpBookingId}
        onClose={() => setActiveOtpBookingId(null)}
        title="Verify Customer 4-Digit OTP"
      >
        <div className="p-2">
          <p className="text-sm text-text-secondary mb-6 font-medium leading-relaxed">
            Please ask the customer for their 4-digit booking OTP code to activate service visit tracking.
          </p>

          <form onSubmit={handleStartService} className="flex flex-col gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
                Enter 4-Digit OTP
              </label>
              <input
                type="text"
                maxLength="4"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-[16px] px-6 py-4 text-center text-3xl tracking-[0.5em] font-extrabold text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary shadow-inner"
                placeholder="0000"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
              />
            </div>

            {otpError && (
              <span className="text-xs text-red-600 flex items-center justify-center gap-1.5 font-bold bg-red-50 py-3 rounded-xl border border-red-200">
                <ShieldAlert size={16} /> {otpError}
              </span>
            )}

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="secondary"
                className="rounded-xl px-5 py-2.5 font-bold"
                onClick={() => setActiveOtpBookingId(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="rounded-xl px-7 py-2.5 font-bold shadow-md"
                loading={otpLoading}
              >
                Verify & Start
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default ProviderDashboard;
