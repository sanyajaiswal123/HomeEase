import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { AuthContext } from '../context/AuthContext';
import {
  Users,
  UserCheck,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Briefcase,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import RetryState from '../components/ui/RetryState';

export const ProviderCustomers = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({ totalCustomers: 0, newCustomers: 0, returningCustomers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'upcoming' | 'completed' | 'new' | 'returning'

  // Selected Customer Details Modal
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/bookings/provider-customers');
      setCustomers(res.data.data.customers || []);
      setStats(res.data.data.stats || { totalCustomers: 0, newCustomers: 0, returningCustomers: 0 });
    } catch (err) {
      console.error('Error fetching provider customers:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch Deep Details for Selected Customer
  const openCustomerDetails = async (custId) => {
    setSelectedCustomerId(custId);
    setDetailsLoading(true);
    setDetailsError(null);
    try {
      const res = await apiClient.get(`/bookings/provider-customers/${custId}`);
      setCustomerDetails(res.data.data);
    } catch (err) {
      console.error('Error fetching customer details:', err);
      setDetailsError(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Client-Side Search & Filter Processing
  const filteredCustomers = customers.filter((item) => {
    if (filterTab === 'upcoming' && item.acceptedBookings === 0) return false;
    if (filterTab === 'completed' && item.completedBookings === 0) return false;
    if (filterTab === 'new' && item.totalBookings > 1) return false;
    if (filterTab === 'returning' && item.totalBookings === 1) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.customer.name?.toLowerCase().includes(q);
      const matchPhone = item.customer.phone?.toLowerCase().includes(q);
      const matchEmail = item.customer.email?.toLowerCase().includes(q);
      const matchBooking = item.bookings.some((b) => b._id.toLowerCase().includes(q));
      return matchName || matchPhone || matchEmail || matchBooking;
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full py-8 px-4 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 font-outfit tracking-tight">
          Customer Directory
        </h1>
        <p className="text-text-secondary font-medium text-sm sm:text-base mt-1">
          View and manage customers who have booked services with you.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border border-border-light rounded-[24px] shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Total Clients
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-primary flex items-center justify-center border border-teal-100">
              <Users size={20} />
            </div>
          </div>
          <strong className="text-3xl text-gray-900 font-extrabold font-outfit block">
            {stats.totalCustomers}
          </strong>
          <span className="text-xs text-text-secondary font-bold mt-1 block">
            Unique customers booked
          </span>
        </Card>

        <Card className="p-6 bg-white border border-border-light rounded-[24px] shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              New Clients
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <UserPlus size={20} />
            </div>
          </div>
          <strong className="text-3xl text-blue-600 font-extrabold font-outfit block">
            {stats.newCustomers}
          </strong>
          <span className="text-xs text-blue-700 font-bold mt-1 block">
            Single booking clients
          </span>
        </Card>

        <Card className="p-6 bg-white border border-border-light rounded-[24px] shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Repeat Clients
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <UserCheck size={20} />
            </div>
          </div>
          <strong className="text-3xl text-emerald-600 font-extrabold font-outfit block">
            {stats.returningCustomers}
          </strong>
          <span className="text-xs text-emerald-700 font-bold mt-1 block">
            Multiple booking clients
          </span>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <Card className="p-4 sm:p-6 shadow-soft border-border-light rounded-[24px] bg-white flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Customer Name, Phone, Email, or Booking ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-200 overflow-x-auto w-full md:w-auto shrink-0 gap-1">
          {[
            { id: 'all', label: `All Clients (${customers.length})` },
            { id: 'upcoming', label: 'Active Jobs' },
            { id: 'completed', label: 'Completed Jobs' },
            { id: 'new', label: 'New Clients' },
            { id: 'returning', label: 'Repeat Clients' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Customer List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-44 w-full rounded-[24px]" />
          <Skeleton className="h-44 w-full rounded-[24px]" />
        </div>
      ) : error ? (
        <RetryState error={error} onRetry={fetchCustomers} />
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          title={customers.length === 0 ? "You don't have any customers yet" : "No matching customers"}
          description={
            customers.length === 0
              ? "When customers book your services, their profile and booking history will appear here."
              : "Try adjusting your search query or filter."
          }
          action={
            customers.length === 0 && (
              <Button onClick={() => navigate('/provider-services')} variant="primary" icon={<Briefcase size={16} />}>
                Manage Services
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCustomers.map((item) => (
            <Card
              key={item.customer._id}
              className="p-6 bg-white border border-gray-200 rounded-[26px] shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 text-primary font-extrabold text-xl flex items-center justify-center border border-teal-100 shadow-sm shrink-0">
                      {item.customer.avatar ? (
                        <img
                          src={item.customer.avatar}
                          alt={item.customer.name}
                          className="w-full h-full rounded-2xl object-cover"
                        />
                      ) : (
                        item.customer.name?.charAt(0) || 'C'
                      )}
                    </div>

                    <div>
                      <strong className="text-xl font-extrabold text-gray-900 font-outfit block">
                        {item.customer.name}
                      </strong>
                      <span className="text-xs text-text-secondary font-bold block mt-0.5">
                        Client since {formatDate(item.firstBookingDate)}
                      </span>
                    </div>
                  </div>

                  <Badge variant={item.totalBookings > 1 ? 'info' : 'secondary'} className="font-bold text-xs">
                    {item.totalBookings} {item.totalBookings === 1 ? 'Booking' : 'Bookings'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-6">
                  {item.customer.phone && (
                    <a
                      href={`tel:${item.customer.phone}`}
                      className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-2 text-primary font-bold hover:underline"
                    >
                      <Phone size={14} /> {item.customer.phone}
                    </a>
                  )}

                  {item.customer.email && (
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-2 text-gray-700 font-medium truncate">
                      <Mail size={14} className="text-gray-400 shrink-0" />
                      <span className="truncate">{item.customer.email}</span>
                    </div>
                  )}

                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 sm:col-span-2 flex items-center gap-2 text-gray-800 font-medium">
                    <MapPin size={14} className="text-primary shrink-0" />
                    <span>
                      {item.customer.address?.street
                        ? `${item.customer.address.street}, ${item.customer.address.city || ''}`
                        : item.customer.address?.city || 'Delhi NCR'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-text-secondary font-semibold">
                  Last booking: <strong className="text-gray-900">{formatDate(item.lastBookingDate)}</strong>
                </span>

                <Button
                  onClick={() => openCustomerDetails(item.customer._id)}
                  variant="secondary"
                  size="sm"
                  icon={<Eye size={14} />}
                  className="rounded-xl font-bold"
                >
                  View Profile & History
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Customer Details & History Modal */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[28px] max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 my-8 animate-fade-in">
            <div className="flex justify-between items-start pb-4 border-b border-gray-100 mb-6">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 font-outfit">
                  Customer Profile & Booking History
                </h3>
                <span className="text-xs text-text-secondary font-mono">
                  ID: #{selectedCustomerId.slice(-8).toUpperCase()}
                </span>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedCustomerId(null)}
                className="rounded-xl font-bold"
              >
                Close View
              </Button>
            </div>

            {detailsLoading ? (
              <Skeleton className="h-64 w-full rounded-2xl" />
            ) : detailsError ? (
              <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm font-bold">
                {detailsError.friendlyMessage || 'Failed to load customer profile.'}
              </div>
            ) : customerDetails ? (
              <div className="flex flex-col gap-6">
                {/* Customer Profile Card */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary text-white font-extrabold text-2xl flex items-center justify-center border border-primary/20 shadow-md shrink-0">
                      {customerDetails.customer?.avatar ? (
                        <img
                          src={customerDetails.customer.avatar}
                          alt={customerDetails.customer.name}
                          className="w-full h-full rounded-2xl object-cover"
                        />
                      ) : (
                        customerDetails.customer?.name?.charAt(0) || 'C'
                      )}
                    </div>
                    <div>
                      <strong className="text-2xl font-extrabold text-gray-900 font-outfit block">
                        {customerDetails.customer?.name}
                      </strong>
                      <span className="text-xs text-text-secondary font-medium">
                        {customerDetails.customer?.email} • {customerDetails.customer?.phone}
                      </span>
                    </div>
                  </div>

                  <Badge variant="primary" className="font-bold text-xs px-4 py-1.5">
                    {customerDetails.stats?.totalBookings} Total Bookings
                  </Badge>
                </div>

                {/* Booking History Table / List */}
                <div>
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-text-secondary mb-3">
                    Bookings With You ({customerDetails.bookings?.length})
                  </h4>

                  <div className="flex flex-col gap-3">
                    {customerDetails.bookings?.map((booking) => (
                      <div
                        key={booking._id}
                        className="p-4 bg-white border border-gray-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm hover:border-primary/50 transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-base font-bold text-gray-900">
                              {booking.service?.name}
                            </strong>
                            <Badge
                              variant={
                                booking.status === 'completed'
                                  ? 'success'
                                  : booking.status === 'accepted' || booking.status === 'in_progress'
                                  ? 'info'
                                  : booking.status === 'cancelled'
                                  ? 'error'
                                  : 'warning'
                              }
                              className="text-[10px] uppercase font-bold"
                            >
                              {booking.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <span className="text-xs text-text-secondary font-medium block mt-1">
                            Scheduled: {formatDate(booking.scheduledDate)} • ID: #{booking._id.slice(-6).toUpperCase()}
                          </span>
                        </div>

                        <div className="text-right">
                          <strong className="text-lg font-extrabold text-gray-900 font-outfit block">
                            ₹{booking.totalAmount}
                          </strong>
                          <span className="text-[11px] text-emerald-600 font-bold block">
                            Net 80%: ₹{Math.round(booking.totalAmount * 0.8)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderCustomers;
