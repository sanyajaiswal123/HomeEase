import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  User,
  Briefcase,
  MoreVertical,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import RetryState from '../../components/ui/RetryState';
import Button from '../../components/ui/Button';

export const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal & Actions
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [availableProviders, setAvailableProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(
        `/admin/bookings?page=${page}&limit=10&search=${searchQuery}&status=${statusFilter}`
      );
      setBookings(res.data.data.bookings);
      setTotalPages(res.data.pages);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, statusFilter]);

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchBookings();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadProvidersForService = async (serviceId) => {
    try {
      // Load verified providers matching the service category
      const res = await apiClient.get(`/auth/providers?category=${serviceId}&verified=true`);
      setAvailableProviders(res.data.data.providers || []);
    } catch (err) {
      console.error('Failed to fetch providers', err);
    }
  };

  const openBookingModal = (booking) => {
    setSelectedBooking(booking);
    setSelectedProviderId('');
    if (booking.status === 'pending' && booking.service?._id) {
      loadProvidersForService(booking.service._id);
    }
    setIsModalOpen(true);
  };

  const handleCancelBooking = async (bookingId) => {
    if (
      !window.confirm(
        'Are you sure you want to FORCE CANCEL this booking? This action is irreversible.'
      )
    )
      return;

    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/bookings/${bookingId}/cancel`);
      alert('Booking cancelled successfully.');
      setIsModalOpen(false);
      fetchBookings();
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to cancel booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignProvider = async (bookingId) => {
    if (!selectedProviderId) return alert('Please select a provider first.');
    if (!window.confirm('Are you sure you want to manually assign this provider?')) return;

    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/bookings/${bookingId}/assign`, {
        providerId: selectedProviderId
      });
      alert('Provider assigned successfully.');
      setIsModalOpen(false);
      fetchBookings();
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to assign provider.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: <Badge variant="warning">Pending</Badge>,
      accepted: <Badge variant="primary">Accepted</Badge>,
      in_progress: <Badge variant="primary">In Progress</Badge>,
      completed: <Badge variant="success">Completed</Badge>,
      cancelled: <Badge variant="error">Cancelled</Badge>
    };
    return variants[status] || <Badge variant="secondary">{status}</Badge>;
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Booking Management
        </h1>
        <p className="text-text-secondary font-medium">
          Monitor all platform bookings, view timelines, and resolve issues.
        </p>
      </div>

      <Card className="shadow-sm border-border-light rounded-[24px] overflow-hidden bg-white relative">
        <div className="p-6 border-b border-border-light flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="w-full sm:w-72">
              <Input
                type="text"
                placeholder="Search ID, customer, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search size={18} className="text-gray-400" />}
                className="rounded-xl bg-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-border-light bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="px-3 py-1.5"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={18} />
            </Button>
            <span className="text-sm font-bold text-gray-600 px-2">
              Page {page} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              className="px-3 py-1.5"
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="p-6 flex flex-col gap-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : error ? (
          <div className="p-6">
            <RetryState error={error} onRetry={fetchBookings} />
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title="No bookings found"
              description="No bookings match your current search or filter criteria."
              icon={<Calendar size={48} className="text-gray-300" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Booking ID</Table.Head>
                  <Table.Head>Customer</Table.Head>
                  <Table.Head>Service Details</Table.Head>
                  <Table.Head>Provider</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head className="text-right">Action</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {bookings.map((booking) => (
                  <Table.Row
                    key={booking._id}
                    className={booking.status === 'cancelled' ? 'opacity-70 bg-gray-50' : ''}
                  >
                    <Table.Cell>
                      <span className="font-bold text-gray-900 uppercase">
                        {booking._id.slice(-6)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{booking.customer?.name}</span>
                        <span className="text-xs text-text-secondary">
                          {booking.customer?.phone}
                        </span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">{booking.service?.name}</span>
                        <span className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                          <Calendar size={10} />{' '}
                          {new Date(booking.scheduledDate).toLocaleDateString()}
                        </span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      {booking.provider ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-accent text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {booking.provider.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                            {booking.provider.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-text-muted italic">Unassigned</span>
                      )}
                    </Table.Cell>
                    <Table.Cell>{getStatusBadge(booking.status)}</Table.Cell>
                    <Table.Cell className="text-right">
                      <button
                        onClick={() => openBookingModal(booking)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors inline-flex"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </Card>

      {/* Booking Details Modal */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <Card className="w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl animate-fade-in max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border-light flex justify-between items-center bg-gray-50 shrink-0">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900">
                    Booking{' '}
                    <span className="uppercase text-primary">#{selectedBooking._id.slice(-6)}</span>
                  </h2>
                  {getStatusBadge(selectedBooking.status)}
                </div>
                <span className="text-sm text-text-secondary">
                  Placed on {new Date(selectedBooking.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 bg-white rounded-full p-2 shadow-sm border border-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Details */}
              <div className="flex flex-col gap-6">
                {/* Service Info */}
                <div className="flex flex-col gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Service Overview
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-primary text-lg">
                      {selectedBooking.service?.name}
                    </span>
                    <span className="font-extrabold text-gray-900">
                      ₹{selectedBooking.totalAmount}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary mt-1">
                    <Clock size={16} /> Scheduled for{' '}
                    {new Date(selectedBooking.scheduledDate).toLocaleString()}
                  </div>
                  {selectedBooking.subServicesSelected?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedBooking.subServicesSelected.map((sub, i) => (
                        <span
                          key={i}
                          className="text-xs bg-white border border-blue-200 text-blue-800 px-2 py-1 rounded-md"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* People Info */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Parties Involved
                  </h3>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-border-light">
                    <User size={20} className="text-gray-400" />
                    <div className="flex flex-col">
                      <span className="text-xs text-text-muted">Customer</span>
                      <span className="font-bold text-gray-900">
                        {selectedBooking.customer?.name} ({selectedBooking.customer?.phone})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-border-light">
                    <Briefcase size={20} className="text-accent" />
                    <div className="flex flex-col">
                      <span className="text-xs text-text-muted">Assigned Provider</span>
                      <span className="font-bold text-gray-900">
                        {selectedBooking.provider
                          ? `${selectedBooking.provider.name} (${selectedBooking.provider.phone})`
                          : 'Not yet assigned'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Location
                  </h3>
                  <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl border border-border-light text-sm text-gray-800">
                    <MapPin size={18} className="text-gray-400 mt-0.5 shrink-0" />
                    <span>
                      {selectedBooking.address?.street}, {selectedBooking.address?.city},{' '}
                      {selectedBooking.address?.state} {selectedBooking.address?.zipCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Timeline & Admin Actions */}
              <div className="flex flex-col gap-6 border-l border-border-light pl-0 md:pl-8">
                {/* Timeline */}
                <div className="flex flex-col">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                    Booking Timeline
                  </h3>
                  {selectedBooking.trackingLog?.length > 0 ? (
                    <div className="flex flex-col gap-4 ml-2 border-l-2 border-primary/20 pl-4 relative">
                      {selectedBooking.trackingLog.map((log, index) => (
                        <div key={index} className="flex flex-col relative">
                          <div
                            className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${index === selectedBooking.trackingLog.length - 1 ? 'bg-primary ring-4 ring-primary/20' : 'bg-gray-300'}`}
                          ></div>
                          <span className="font-bold text-gray-900 capitalize leading-tight">
                            {log.status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs text-text-muted">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-text-secondary italic">
                      No timeline events recorded.
                    </span>
                  )}
                </div>

                {/* Admin Actions Container */}
                <div className="mt-auto flex flex-col gap-4 pt-4 border-t border-border-light">
                  {selectedBooking.status === 'pending' && (
                    <div className="flex flex-col gap-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <span className="text-xs font-bold text-gray-900">
                        Manually Assign Provider
                      </span>
                      <div className="flex gap-2">
                        <select
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                          value={selectedProviderId}
                          onChange={(e) => setSelectedProviderId(e.target.value)}
                        >
                          <option value="">Select a provider...</option>
                          {availableProviders.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name} (★ {p.providerDetails?.rating})
                            </option>
                          ))}
                        </select>
                        <Button
                          variant="primary"
                          className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-lg"
                          disabled={!selectedProviderId || actionLoading}
                          onClick={() => handleAssignProvider(selectedBooking._id)}
                        >
                          Assign
                        </Button>
                      </div>
                    </div>
                  )}

                  {['pending', 'accepted', 'in_progress'].includes(selectedBooking.status) && (
                    <Button
                      variant="outline"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 font-bold"
                      onClick={() => handleCancelBooking(selectedBooking._id)}
                      disabled={actionLoading}
                    >
                      Force Cancel Booking
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
