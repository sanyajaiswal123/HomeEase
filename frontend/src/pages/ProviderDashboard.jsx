import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Calendar,
  User,
  Phone,
  MapPin,
  Clock,
  Check,
  Power,
  CheckCircle,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { io } from 'socket.io-client';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

export const ProviderDashboard = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // OTP Validation States
  const [activeOtpBookingId, setActiveOtpBookingId] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Socket reference for location update simulations
  const [socket, setSocket] = useState(null);

  const fetchJobs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bookings/my');
      setBookings(res.data.data.bookings);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    // Setup local socket connection for location simulation
    const s = io('http://localhost:5000');
    setSocket(s);
    if (user) {
      s.emit('register', user._id);
    }

    return () => {
      s.disconnect();
    };
  }, [user]);

  // Real-time location simulation loop when there is an active 'in_progress' job
  useEffect(() => {
    const activeJob = bookings.find(
      (b) => b.status === 'in_progress' && b.provider?._id === user?._id
    );
    if (!activeJob || !socket) return;

    console.log('Active job in progress! Initializing live location simulation...');

    // Simulate coordinates starting near Connaught Place, New Delhi and heading to Noida
    let lat = 28.6139;
    let lng = 77.209;

    const interval = setInterval(() => {
      // Small step increments toward customer location
      lat += (Math.random() - 0.4) * 0.0005;
      lng += (Math.random() - 0.4) * 0.0005;

      console.log(`[Socket] Sending simulated location update: [${lng}, ${lat}]`);
      socket.emit('update_location', {
        providerId: user._id,
        coordinates: [lng, lat] // [Longitude, Latitude]
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [bookings, socket, user]);

  const handleAcceptJob = async (bookingId) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        status: 'accepted'
      });
      fetchJobs();
      alert('Job accepted successfully! You are now assigned to this service request.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept job.');
    }
  };

  const handleStartService = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError('');

    try {
      await axios.put(`http://localhost:5000/api/bookings/${activeOtpBookingId}/status`, {
        status: 'in_progress',
        otpInput
      });
      setActiveOtpBookingId(null);
      setOtpInput('');
      fetchJobs();
      alert(
        'OTP Verified! Service is now active. Live tracking signal is now broadcasting to the customer.'
      );
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid OTP code.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleCompleteService = async (bookingId) => {
    if (!window.confirm('Are you sure you have completed the service work?')) return;

    try {
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        status: 'completed'
      });
      fetchJobs();
      alert('Service marked as completed! Payment status updated.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete service.');
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

  // Divide bookings
  const incomingRequests = bookings.filter((b) => b.status === 'pending');
  const myAssignedJobs = bookings.filter(
    (b) => b.status !== 'pending' && b.status !== 'completed' && b.status !== 'cancelled'
  );
  const finishedJobs = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto w-full py-12 px-4 sm:px-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-gray-900 font-outfit tracking-tight">
          Service Provider Dashboard
        </h1>
        <p className="text-text-secondary font-medium text-lg">
          Welcome back, {user?.name}. Accept local service tasks and track active bookings.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-24 text-text-secondary font-medium text-lg">
          Loading active job board...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Main Board column */}
          <div className="lg:col-span-2 flex flex-col gap-12">
            {/* Active assigned jobs */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 font-outfit">My Active Jobs</h2>
              {myAssignedJobs.length === 0 ? (
                <div className="p-10 text-center bg-bg-secondary border border-border-light rounded-[24px] text-text-secondary font-medium shadow-sm">
                  You do not have any active tasks right now.
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {myAssignedJobs.map((job) => (
                    <Card
                      key={job._id}
                      className={`border-l-[6px] shadow-soft rounded-[24px] ${job.status === 'in_progress' ? 'border-l-primary' : 'border-l-primary-light'} border-t-border-light border-r-border-light border-b-border-light`}
                    >
                      <Card.Body className="p-8">
                        {/* Title & badge */}
                        <div className="flex justify-between items-start mb-6 pb-6 border-b border-border-light">
                          <div>
                            <strong className="text-2xl text-gray-900 font-outfit font-extrabold">
                              {job.service?.name}
                            </strong>
                            <span className="text-xs text-text-secondary block mt-2 uppercase tracking-widest font-bold">
                              ID: {job._id}
                            </span>
                          </div>
                          <Badge
                            variant={job.status === 'in_progress' ? 'info' : 'warning'}
                            className="px-4 py-2 uppercase tracking-widest font-bold rounded-xl shadow-sm text-xs"
                          >
                            {job.status.replace('_', ' ')}
                          </Badge>
                        </div>

                        {/* Info grid */}
                        <div className="grid grid-cols-2 gap-8 text-sm mb-8">
                          <div className="bg-bg-secondary p-4 rounded-xl border border-border-light">
                            <span className="text-text-secondary block text-[10px] font-bold uppercase tracking-widest mb-1.5">
                              Customer
                            </span>
                            <strong className="text-gray-900 text-base">
                              {job.customer?.name}
                            </strong>
                            <span className="flex items-center gap-2 text-gray-900 font-medium mt-1">
                              <Phone size={14} className="text-primary" /> {job.customer?.phone}
                            </span>
                          </div>

                          <div className="bg-bg-secondary p-4 rounded-xl border border-border-light">
                            <span className="text-text-secondary block text-[10px] font-bold uppercase tracking-widest mb-1.5">
                              Address
                            </span>
                            <span className="flex items-start gap-2 text-gray-900 font-medium">
                              <MapPin size={16} className="text-primary mt-0.5 shrink-0" />{' '}
                              {job.address?.street}, {job.address?.city}
                            </span>
                          </div>

                          <div className="bg-bg-secondary p-4 rounded-xl border border-border-light">
                            <span className="text-text-secondary block text-[10px] font-bold uppercase tracking-widest mb-1.5">
                              Time Slot
                            </span>
                            <span className="flex items-center gap-2 text-gray-900 font-medium">
                              <Calendar size={14} className="text-primary" />{' '}
                              {formatDate(job.scheduledDate)}
                            </span>
                          </div>

                          <div className="bg-bg-alternate p-4 rounded-xl border border-primary-light">
                            <span className="text-primary block text-[10px] font-bold uppercase tracking-widest mb-1.5">
                              Earnings
                            </span>
                            <strong className="text-gray-900 text-2xl font-extrabold font-outfit">
                              ₹{job.totalAmount}
                            </strong>
                          </div>
                        </div>

                        {/* Active Actions */}
                        <div className="flex justify-end pt-6 border-t border-border-light">
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
                              <span className="flex items-center gap-2">
                                Start Service Visit <ArrowRight size={18} />
                              </span>
                            </Button>
                          )}

                          {job.status === 'in_progress' && (
                            <div className="flex items-center gap-6 w-full justify-between flex-wrap">
                              <span className="text-sm text-gray-900 flex items-center gap-2 font-bold bg-bg-alternate px-4 py-2.5 rounded-xl border border-primary-light shadow-sm">
                                <Clock size={16} className="text-primary animate-pulse" /> Live
                                tracking beacon active
                              </span>
                              <Button
                                onClick={() => handleCompleteService(job._id)}
                                variant="accent"
                                className="rounded-xl px-6 py-3 font-bold shadow-md"
                              >
                                Complete Service Job
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

            {/* Finished Jobs */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 font-outfit">
                Completed Job History
              </h2>
              {finishedJobs.length === 0 ? (
                <div className="p-10 text-center bg-bg-secondary border border-border-light rounded-[24px] text-text-secondary font-medium shadow-sm">
                  No past jobs recorded.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {finishedJobs.map((job) => (
                    <Card
                      key={job._id}
                      className="opacity-80 hover:opacity-100 transition-opacity bg-bg-secondary border-border-light rounded-2xl shadow-sm hover:shadow-md"
                    >
                      <Card.Body className="p-6">
                        <div className="flex justify-between items-center text-sm">
                          <div>
                            <strong className="text-gray-900 text-lg font-outfit">
                              {job.service?.name}
                            </strong>
                            <span className="flex items-center gap-2 text-text-secondary mt-1 font-bold">
                              <Calendar size={14} /> {formatDate(job.scheduledDate)}
                            </span>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={job.status === 'completed' ? 'success' : 'danger'}
                              className="uppercase tracking-widest text-[10px] font-bold px-3 py-1 rounded-lg shadow-sm"
                            >
                              {job.status}
                            </Badge>
                            <strong className="block mt-2 text-gray-900 text-lg font-extrabold">
                              +₹{job.totalAmount}
                            </strong>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Incoming Job Requests Board Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-28 rounded-[24px] shadow-elevated border border-border-light">
              <Card.Body className="p-8">
                <h3 className="text-xl font-bold border-b border-border-light pb-5 mb-6 flex justify-between items-center text-gray-900 font-outfit">
                  <span>Local Job Board</span>
                  <span className="text-xs bg-bg-alternate text-primary px-3 py-1 rounded-full font-bold border border-primary-light">
                    {incomingRequests.length} Open
                  </span>
                </h3>

                {incomingRequests.length === 0 ? (
                  <p className="text-text-secondary text-sm text-center py-8 font-medium">
                    No unassigned service requests in your area matching your speciality.
                  </p>
                ) : (
                  <div className="flex flex-col gap-5">
                    {incomingRequests.map((req) => (
                      <div
                        key={req._id}
                        className="bg-white border border-border-light p-6 rounded-[20px] flex flex-col gap-5 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <strong className="text-lg font-extrabold text-gray-900 font-outfit leading-tight max-w-[70%]">
                            {req.service?.name}
                          </strong>
                          <strong className="text-gray-900 text-xl font-extrabold">
                            ₹{req.totalAmount}
                          </strong>
                        </div>

                        <div className="flex flex-col gap-2 text-sm text-gray-900 font-medium">
                          <span className="flex items-center gap-2">
                            <Calendar size={16} className="text-primary" />{' '}
                            {formatDate(req.scheduledDate)}
                          </span>
                          <span className="flex items-center gap-2">
                            <MapPin size={16} className="text-primary" /> {req.address?.city}
                          </span>
                        </div>

                        <Button
                          onClick={() => handleAcceptJob(req._id)}
                          variant="secondary"
                          className="w-full justify-center mt-2 rounded-xl py-2.5 font-bold shadow-sm hover:bg-primary-light hover:border-primary-light transition-colors"
                          size="md"
                        >
                          Accept Job
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>
      )}

      {/* OTP Modal */}
      <Modal
        isOpen={!!activeOtpBookingId}
        onClose={() => setActiveOtpBookingId(null)}
        title="Start Service Verification"
      >
        <div className="p-2">
          <p className="text-sm text-text-secondary mb-6 font-medium leading-relaxed">
            Ask the customer for the 4-digit booking OTP displayed on their screen to begin work.
          </p>

          <form onSubmit={handleStartService} className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
                Enter 4-Digit OTP
              </label>
              <input
                type="text"
                maxLength="4"
                required
                className="w-full bg-bg-secondary border border-border-light rounded-[16px] px-6 py-4 text-center text-3xl tracking-[0.5em] font-extrabold text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary shadow-inner"
                placeholder="0000"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
              />
            </div>

            {otpError && (
              <span className="text-sm text-red-600 flex items-center justify-center gap-2 font-bold bg-red-50 py-3 rounded-xl border border-red-200">
                <ShieldAlert size={16} /> {otpError}
              </span>
            )}

            <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-border-light">
              <Button
                type="button"
                variant="secondary"
                className="rounded-xl px-6 py-3 font-bold"
                onClick={() => setActiveOtpBookingId(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="rounded-xl px-8 py-3 font-bold shadow-md"
                loading={otpLoading}
              >
                Verify OTP
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default ProviderDashboard;
