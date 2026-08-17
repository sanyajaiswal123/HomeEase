import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/apiClient';
import { AuthContext } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  IndianRupee,
  Briefcase,
  ShieldAlert,
  ArrowRight,
  Zap,
  Tag
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import RetryState from '../components/ui/RetryState';

export const ProviderBookings = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'accepted' | 'upcoming' | 'completed' | 'cancelled'

  // Modal States
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeOtpBookingId, setActiveOtpBookingId] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/bookings/my');
      setBookings(res.data.data.bookings || []);
    } catch (err) {
      console.error('Error fetching provider bookings:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Accept Booking Action
  const handleAcceptBooking = async (bookingId) => {
    setActionLoadingId(bookingId);
    try {
      await apiClient.put(`/bookings/${bookingId}/status`, {
        status: 'accepted'
      });
      alert('Booking request accepted! Customer and Admin dashboards updated.');
      fetchBookings();
      if (selectedBooking?._id === bookingId) {
        setSelectedBooking(null);
      }
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to accept booking.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reject / Decline Booking Action
  const handleRejectBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to decline this booking request?')) return;

    setActionLoadingId(bookingId);
    try {
      await apiClient.put(`/bookings/${bookingId}/status`, {
        status: 'cancelled',
        reason: 'Declined by provider'
      });
      alert('Booking request declined.');
      fetchBookings();
      if (selectedBooking?._id === bookingId) {
        setSelectedBooking(null);
      }
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to decline booking.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Start Travel (On The Way)
  const handleStartTravel = async (bookingId) => {
    setActionLoadingId(bookingId);
    try {
      await apiClient.put(`/bookings/${bookingId}/status`, {
        status: 'on_the_way'
      });
      alert('Status updated! Customer and Admin notified that you are on the way.');
      fetchBookings();
      if (selectedBooking?._id === bookingId) {
        setSelectedBooking(null);
      }
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to update status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Start Service Visit with OTP
  const handleStartService = async (e) => {
    e.preventDefault();
    setActionLoadingId(activeOtpBookingId);
    setOtpError('');

    try {
      await apiClient.put(`/bookings/${activeOtpBookingId}/status`, {
        status: 'in_progress',
        otpInput
      });
      setActiveOtpBookingId(null);
      setOtpInput('');
      fetchBookings();
      alert('OTP Verified! Service visit active.');
    } catch (err) {
      setOtpError(err.friendlyMessage || 'Invalid OTP code.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Complete Service Action
  const handleCompleteService = async (bookingId) => {
    if (!window.confirm('Are you sure you have completed the service work?')) return;

    setActionLoadingId(bookingId);
    try {
      await apiClient.put(`/bookings/${bookingId}/status`, {
        status: 'completed'
      });
      alert('Service job marked as completed!');
      fetchBookings();
      if (selectedBooking?._id === bookingId) {
        setSelectedBooking(null);
      }
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to complete booking.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Client-Side Filter & Search Processing
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const filteredBookings = bookings.filter((b) => {
    // 1. Status filter
    if (statusFilter === 'pending' && b.status !== 'pending') return false;
    if (statusFilter === 'accepted' && (b.status !== 'accepted' && b.status !== 'in_progress')) return false;
    if (statusFilter === 'upcoming' && (new Date(b.scheduledDate) <= startOfToday || (b.status !== 'accepted' && b.status !== 'pending'))) return false;
    if (statusFilter === 'completed' && b.status !== 'completed') return false;
    if (statusFilter === 'cancelled' && b.status !== 'cancelled') return false;

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = b._id.toLowerCase().includes(q);
      const matchCustomer = b.customer?.name?.toLowerCase().includes(q);
      const matchService = b.service?.name?.toLowerCase().includes(q);
      const matchCity = b.address?.city?.toLowerCase().includes(q);
      return matchId || matchCustomer || matchService || matchCity;
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full py-8 px-4 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 font-outfit tracking-tight">
          Provider Booking Management
        </h1>
        <p className="text-text-secondary font-medium text-sm sm:text-base mt-1">
          Manage your incoming service requests, active customer appointments, and job completion workflows.
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <Card className="p-4 sm:p-6 shadow-soft border-border-light rounded-[24px] bg-white flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Customer Name, Booking ID (#XXXXXX), Service, or City..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-200 overflow-x-auto w-full md:w-auto shrink-0 gap-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending Requests' },
            { id: 'accepted', label: 'Accepted / Active' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Booking Cards List */}
      {loading ? (
        <div className="flex flex-col gap-6">
          <Skeleton className="h-44 w-full rounded-[24px]" />
          <Skeleton className="h-44 w-full rounded-[24px]" />
          <Skeleton className="h-44 w-full rounded-[24px]" />
        </div>
      ) : error ? (
        <RetryState error={error} onRetry={fetchBookings} />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          title="No Bookings Found"
          description="There are no bookings matching your selected filter or search criteria."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredBookings.map((job) => (
            <Card
              key={job._id}
              className={`border-l-[6px] shadow-soft rounded-[24px] bg-white transition-all hover:shadow-elevated ${
                job.status === 'completed'
                  ? 'border-l-emerald-500'
                  : job.status === 'in_progress'
                  ? 'border-l-primary'
                  : job.status === 'accepted'
                  ? 'border-l-blue-500'
                  : job.status === 'cancelled'
                  ? 'border-l-red-400'
                  : 'border-l-amber-500'
              }`}
            >
              <Card.Body className="p-6 sm:p-8">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-3">
                      <strong className="text-2xl text-gray-900 font-outfit font-extrabold">
                        {job.service?.name}
                      </strong>
                      <Badge
                        variant={
                          job.status === 'completed'
                            ? 'success'
                            : job.status === 'in_progress' || job.status === 'accepted'
                            ? 'info'
                            : job.status === 'cancelled'
                            ? 'error'
                            : 'warning'
                        }
                        className="uppercase font-bold text-xs px-3 py-1"
                      >
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <span className="text-xs text-text-secondary font-bold block mt-1">
                      Booking ID: #{job._id.slice(-8).toUpperCase()} • Created on{' '}
                      {new Date(job.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-text-secondary font-bold uppercase tracking-wider block">
                      Net Provider Payout (80%)
                    </span>
                    <strong className="text-2xl text-emerald-600 font-extrabold font-outfit">
                      ₹{Math.round((job.totalAmount || 0) * 0.8)}
                    </strong>
                    <span className="text-[11px] text-gray-500 block">
                      Total Customer Bill: ₹{job.totalAmount}
                    </span>
                  </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-6">
                  {/* Customer Info */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-1">
                    <span className="text-text-secondary text-[10px] font-bold uppercase tracking-wider">
                      Customer
                    </span>
                    <strong className="text-gray-900 text-base font-bold">
                      {job.customer?.name || 'Customer'}
                    </strong>
                    {job.customer?.phone && (
                      <a
                        href={`tel:${job.customer.phone}`}
                        className="text-xs text-primary font-bold inline-flex items-center gap-1.5 hover:underline mt-1"
                      >
                        <Phone size={14} /> Call {job.customer.phone}
                      </a>
                    )}
                  </div>

                  {/* Scheduled Date */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-1">
                    <span className="text-text-secondary text-[10px] font-bold uppercase tracking-wider">
                      Scheduled Date & Time
                    </span>
                    <strong className="text-gray-900 text-sm font-bold flex items-center gap-1.5 mt-0.5">
                      <Calendar size={16} className="text-primary" /> {formatDate(job.scheduledDate)}
                    </strong>
                    <span className="text-xs text-gray-500 mt-1">
                      Payment Status: <strong className="uppercase text-gray-800">{job.paymentStatus}</strong>
                    </span>
                  </div>

                  {/* Service Location */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-1">
                    <span className="text-text-secondary text-[10px] font-bold uppercase tracking-wider">
                      Service Address
                    </span>
                    <span className="text-xs font-semibold text-gray-900 flex items-start gap-1.5 mt-0.5">
                      <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                      {job.address?.street}, {job.address?.city} {job.address?.zipCode}
                    </span>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-gray-100">
                  <Button
                    onClick={() => setSelectedBooking(job)}
                    variant="secondary"
                    size="sm"
                    icon={<Eye size={16} />}
                    className="rounded-xl font-bold"
                  >
                    View Details
                  </Button>

                  <div className="flex items-center gap-3">
                    {job.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleRejectBooking(job._id)}
                          loading={actionLoadingId === job._id}
                          variant="secondary"
                          size="sm"
                          className="rounded-xl font-bold text-red-600 hover:bg-red-50 border-red-200"
                        >
                          Decline Request
                        </Button>

                        <Button
                          onClick={() => handleAcceptBooking(job._id)}
                          loading={actionLoadingId === job._id}
                          variant="primary"
                          size="sm"
                          className="rounded-xl font-bold shadow-sm"
                        >
                          Accept Booking
                        </Button>
                      </>
                    )}

                    {job.status === 'accepted' && (
                      <Button
                        onClick={() => handleStartTravel(job._id)}
                        loading={actionLoadingId === job._id}
                        variant="primary"
                        size="sm"
                        className="rounded-xl font-bold shadow-sm bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Start Travel (On The Way 🚗)
                      </Button>
                    )}

                    {job.status === 'on_the_way' && (
                      <Button
                        onClick={() => {
                          setActiveOtpBookingId(job._id);
                          setOtpInput('');
                          setOtpError('');
                        }}
                        variant="primary"
                        size="sm"
                        className="rounded-xl font-bold shadow-sm"
                      >
                        Start Visit (Verify OTP ⚡)
                      </Button>
                    )}

                    {job.status === 'in_progress' && (
                      <Button
                        onClick={() => handleCompleteService(job._id)}
                        loading={actionLoadingId === job._id}
                        variant="accent"
                        size="sm"
                        className="rounded-xl font-bold shadow-sm"
                      >
                        Mark Job Completed ✅
                      </Button>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[28px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl animate-fade-in border border-gray-100 my-8">
            <div className="flex justify-between items-start pb-4 border-b border-gray-100 mb-6">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 font-outfit">
                  Booking Details
                </h3>
                <span className="text-xs text-text-secondary font-mono">
                  ID: #{selectedBooking._id.toUpperCase()}
                </span>
              </div>
              <Badge variant={selectedBooking.status === 'completed' ? 'success' : 'warning'}>
                {selectedBooking.status.replace('_', ' ')}
              </Badge>
            </div>

            <div className="flex flex-col gap-6">
              {/* Customer Section */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-3">
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-500 block font-semibold">Name</span>
                    <strong className="text-gray-900 font-bold">
                      {selectedBooking.customer?.name}
                    </strong>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block font-semibold">Contact Phone</span>
                    <a
                      href={`tel:${selectedBooking.customer?.phone}`}
                      className="text-primary font-bold hover:underline"
                    >
                      {selectedBooking.customer?.phone}
                    </a>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-xs text-gray-500 block font-semibold">Address</span>
                    <span className="text-gray-900 font-medium">
                      {selectedBooking.address?.street}, {selectedBooking.address?.city} {selectedBooking.address?.zipCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service & Sub-services Section */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-3">
                  Service Details
                </h4>
                <strong className="text-lg text-gray-900 font-bold block mb-1">
                  {selectedBooking.service?.name}
                </strong>
                <p className="text-xs text-text-secondary font-medium mb-3">
                  {selectedBooking.service?.description}
                </p>

                {selectedBooking.subServicesSelected?.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-gray-700 block mb-1.5">
                      Sub-services Included:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedBooking.subServicesSelected.map((sub, idx) => (
                        <span
                          key={idx}
                          className="bg-white border border-gray-200 px-3 py-1 rounded-lg text-xs font-bold text-gray-800"
                        >
                          ✓ {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Financial & Payment Section */}
              <div className="bg-teal-50/60 p-5 rounded-2xl border border-teal-100 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary block">
                    Your Net Payout (80%)
                  </span>
                  <strong className="text-2xl text-gray-900 font-extrabold font-outfit">
                    ₹{Math.round((selectedBooking.totalAmount || 0) * 0.8)}
                  </strong>
                  <span className="text-xs text-gray-500 block">
                    Payment Status: <strong className="uppercase">{selectedBooking.paymentStatus}</strong>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 block font-semibold">Scheduled Visit</span>
                  <strong className="text-sm font-bold text-gray-900">
                    {formatDate(selectedBooking.scheduledDate)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <Button
                variant="secondary"
                onClick={() => setSelectedBooking(null)}
                className="rounded-xl font-bold"
              >
                Close View
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Visit Modal */}
      <Modal
        isOpen={!!activeOtpBookingId}
        onClose={() => setActiveOtpBookingId(null)}
        title="Verify Customer 4-Digit OTP"
      >
        <div className="p-2">
          <p className="text-sm text-text-secondary mb-6 font-medium leading-relaxed">
            Ask the customer for the 4-digit booking verification OTP code to start service visit tracking.
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
                loading={actionLoadingId === activeOtpBookingId}
              >
                Verify & Start Visit
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default ProviderBookings;
