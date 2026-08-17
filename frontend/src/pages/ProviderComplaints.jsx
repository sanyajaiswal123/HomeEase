import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/apiClient';
import { AuthContext } from '../context/AuthContext';
import {
  LifeBuoy,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  Send,
  FileText,
  User,
  AlertCircle,
  RotateCcw,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import RetryState from '../components/ui/RetryState';

export const ProviderComplaints = () => {
  const { user } = useContext(AuthContext);

  const [complaints, setComplaints] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'open' | 'investigating' | 'resolved' | 'closed'
  const [search, setSearch] = useState('');

  // Create Ticket Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [category, setCategory] = useState('booking_problem');
  const [priority, setPriority] = useState('medium');
  const [bookingId, setBookingId] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // View Details & Thread Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resComplaints, resBookings] = await Promise.all([
        apiClient.get('/complaints/my', {
          params: { status: statusFilter, search }
        }),
        apiClient.get('/bookings/my')
      ]);

      setComplaints(resComplaints.data.data.complaints || []);
      setBookings(resBookings.data.data.bookings || []);
    } catch (err) {
      console.error('Error fetching provider complaints:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, search]);

  const openCreateModal = () => {
    setCategory('booking_problem');
    setPriority('medium');
    setBookingId('');
    setSubject('');
    setDescription('');
    setCreateError('');
    setIsCreateModalOpen(true);
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (!subject.trim() || !description.trim()) {
      return setCreateError('Subject and Description are required.');
    }

    setCreateLoading(true);
    try {
      await apiClient.post('/complaints', {
        category,
        priority,
        bookingId: bookingId || null,
        subject: subject.trim(),
        description: description.trim()
      });

      alert('Support ticket created successfully!');
      setIsCreateModalOpen(false);
      fetchComplaints();
    } catch (err) {
      setCreateError(err.friendlyMessage || 'Failed to create support ticket.');
    } finally {
      setCreateLoading(false);
    }
  };

  const openThreadModal = async (complaintId) => {
    try {
      const res = await apiClient.get(`/complaints/${complaintId}`);
      setSelectedComplaint(res.data.data.complaint);
      setReplyMessage('');
      setReplyError('');
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to load ticket conversation.');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setReplyLoading(true);
    setReplyError('');
    try {
      const res = await apiClient.post(`/complaints/${selectedComplaint._id}/reply`, {
        message: replyMessage.trim()
      });

      setSelectedComplaint(res.data.data.complaint);
      setReplyMessage('');
      fetchComplaints();
    } catch (err) {
      setReplyError(err.friendlyMessage || 'Failed to send response.');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleReopenTicket = async (complaintId) => {
    if (!window.confirm('Reopen this resolved ticket?')) return;
    try {
      await apiClient.put(`/complaints/${complaintId}/reopen`);
      alert('Ticket reopened.');
      if (selectedComplaint?._id === complaintId) {
        openThreadModal(complaintId);
      }
      fetchComplaints();
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to reopen ticket.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <Badge variant="info" className="uppercase font-bold">Open</Badge>;
      case 'investigating':
        return <Badge variant="warning" className="uppercase font-bold">Under Investigation</Badge>;
      case 'resolved':
        return <Badge variant="success" className="uppercase font-bold">Resolved</Badge>;
      case 'closed':
        return <Badge variant="secondary" className="uppercase font-bold">Closed</Badge>;
      default:
        return <Badge variant="secondary" className="uppercase font-bold">{status}</Badge>;
    }
  };

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'critical':
      case 'high':
        return <Badge variant="error" className="uppercase text-[10px] font-extrabold">{prio}</Badge>;
      case 'medium':
        return <Badge variant="warning" className="uppercase text-[10px] font-extrabold">Medium</Badge>;
      default:
        return <Badge variant="secondary" className="uppercase text-[10px] font-extrabold">Low</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 font-outfit tracking-tight">
            Complaints & Support Hub
          </h1>
          <p className="text-text-secondary font-medium text-sm sm:text-base mt-1">
            Raise support tickets, view customer service issues, and communicate directly with HomeEase Administration.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          variant="primary"
          icon={<Plus size={18} />}
          className="rounded-2xl px-6 py-3.5 font-bold shadow-md shrink-0"
        >
          Raise Support Ticket
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 sm:p-6 shadow-soft border-border-light rounded-[26px] bg-white flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ticket subject or text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-200 overflow-x-auto w-full sm:w-auto gap-1">
          {[
            { id: 'all', label: 'All Tickets' },
            { id: 'open', label: 'Open' },
            { id: 'investigating', label: 'Investigating' },
            { id: 'resolved', label: 'Resolved' },
            { id: 'closed', label: 'Closed' }
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

      {/* Tickets List */}
      {loading ? (
        <Skeleton className="h-64 w-full rounded-[28px]" />
      ) : error ? (
        <RetryState error={error} onRetry={fetchComplaints} />
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No support tickets or complaints found"
          description="You do not have any open customer issues or support tickets."
          actionText="Raise Support Ticket"
          onAction={openCreateModal}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {complaints.map((c) => (
            <Card
              key={c._id}
              className="p-6 bg-white border border-border-light rounded-[26px] shadow-soft hover:shadow-elevated transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-primary flex items-center justify-center border border-teal-100 shrink-0">
                  <LifeBuoy size={24} />
                </div>

                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-extrabold text-primary">
                      #{c._id.slice(-6).toUpperCase()}
                    </span>
                    {getPriorityBadge(c.priority)}
                    <Badge variant="secondary" className="uppercase text-[10px] font-bold">
                      {(c.category || 'booking_problem').replace('_', ' ')}
                    </Badge>
                  </div>

                  <h3 className="text-base font-extrabold text-gray-900 font-outfit mt-0.5">
                    {c.subject}
                  </h3>

                  <p className="text-xs text-gray-600 font-medium line-clamp-2">
                    {c.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-text-secondary font-semibold mt-2">
                    <span>Filed: {formatDate(c.createdAt)}</span>
                    {c.booking && (
                      <span className="text-primary font-bold">
                        Linked Booking #{c.booking._id ? c.booking._id.slice(-6).toUpperCase() : 'N/A'}
                      </span>
                    )}
                    <span>Messages: {c.messages?.length || 1}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                {getStatusBadge(c.status)}

                <Button
                  onClick={() => openThreadModal(c._id)}
                  variant="secondary"
                  size="sm"
                  icon={<MessageSquare size={14} />}
                  className="rounded-xl font-bold text-xs"
                >
                  View Thread
                </Button>

                {c.status === 'resolved' && (
                  <Button
                    onClick={() => handleReopenTicket(c._id)}
                    variant="secondary"
                    size="sm"
                    icon={<RotateCcw size={14} />}
                    className="rounded-xl font-bold text-xs text-amber-700"
                  >
                    Reopen
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Support Ticket Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Raise Support Ticket / Inquiry"
      >
        <form onSubmit={handleCreateTicket} className="flex flex-col gap-4 p-2 max-h-[75vh] overflow-y-auto">
          {createError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} /> {createError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
              Issue Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="booking_problem">Booking Problem</option>
              <option value="customer_issue">Customer Issue</option>
              <option value="payment_issue">Payment Issue</option>
              <option value="payout_issue">Payout Issue</option>
              <option value="service_issue">Service Issue</option>
              <option value="technical_issue">Technical Issue</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
              Priority Level *
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
              Related Booking (Optional)
            </label>
            <select
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Not linked to a specific booking</option>
              {bookings.map((b) => (
                <option key={b._id} value={b._id}>
                  Booking #{b._id.slice(-6).toUpperCase()} - {b.service?.name} (₹{b.totalAmount})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
              Subject Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Issue with payout withdrawal delay"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
              Detailed Description *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Provide complete details about your inquiry or concern..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
              className="rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createLoading}
              className="rounded-xl font-bold shadow-md"
            >
              Submit Ticket
            </Button>
          </div>
        </form>
      </Modal>

      {/* Ticket Conversation Thread Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          title={`Ticket #${selectedComplaint._id.slice(-6).toUpperCase()}: ${selectedComplaint.subject}`}
        >
          <div className="flex flex-col gap-6 max-h-[75vh] overflow-y-auto p-2">
            {/* Ticket Header Specs */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedComplaint.status)}
                {getPriorityBadge(selectedComplaint.priority)}
                <span className="font-bold text-gray-700 uppercase">
                  Category: {(selectedComplaint.category || 'booking').replace('_', ' ')}
                </span>
              </div>
              <span className="text-gray-500 font-medium">
                Filed: {formatDate(selectedComplaint.createdAt)}
              </span>
            </div>

            {/* Linked Booking Card */}
            {selectedComplaint.booking && (
              <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-100 text-xs flex items-center justify-between">
                <div>
                  <strong className="text-primary font-bold block mb-0.5">
                    Linked Booking #{selectedComplaint.booking._id ? selectedComplaint.booking._id.slice(-6).toUpperCase() : 'N/A'}
                  </strong>
                  <span className="text-gray-700 font-medium">
                    Service: {selectedComplaint.booking.service?.name} (₹{selectedComplaint.booking.totalAmount})
                  </span>
                </div>
              </div>
            )}

            {/* Messages Conversation Thread */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-extrabold text-text-secondary uppercase tracking-widest">
                Conversation Thread ({selectedComplaint.messages?.length || 0} Responses)
              </span>

              {selectedComplaint.messages && selectedComplaint.messages.length > 0 ? (
                selectedComplaint.messages.map((msg, idx) => {
                  const isSelf = msg.sender?._id === user?._id || msg.sender === user?._id;
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl text-xs flex flex-col gap-1.5 ${
                        isSelf
                          ? 'bg-teal-50 border border-teal-200 ml-4 sm:ml-8'
                          : msg.senderRole === 'admin'
                          ? 'bg-purple-50 border border-purple-200 mr-4 sm:mr-8'
                          : 'bg-gray-50 border border-gray-200 mr-4 sm:mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <strong className="font-extrabold text-gray-900 font-outfit">
                            {msg.sender?.name || (msg.senderRole === 'admin' ? 'HomeEase Admin' : 'User')}
                          </strong>
                          <Badge
                            variant={
                              msg.senderRole === 'admin'
                                ? 'error'
                                : msg.senderRole === 'provider'
                                ? 'info'
                                : 'secondary'
                            }
                            className="uppercase text-[9px] font-bold"
                          >
                            {msg.senderRole || 'user'}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>

                      <p className="text-gray-800 font-medium leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-gray-700 font-medium leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  {selectedComplaint.description}
                </p>
              )}
            </div>

            {/* Reply Input Form */}
            {selectedComplaint.status !== 'closed' ? (
              <form onSubmit={handleSendReply} className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                {replyError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={16} /> {replyError}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Type your response to support..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    loading={replyLoading}
                    icon={<Send size={16} />}
                    className="rounded-xl font-bold shadow-md shrink-0"
                  >
                    Send Reply
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-2xl bg-gray-100 border border-gray-200 text-center text-xs font-bold text-gray-600">
                This ticket has been permanently closed by administration.
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProviderComplaints;
