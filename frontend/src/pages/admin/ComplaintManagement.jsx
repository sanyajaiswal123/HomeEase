import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../../services/apiClient';
import { AuthContext } from '../../context/AuthContext';
import {
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldAlert,
  XCircle,
  FileText,
  User,
  ChevronLeft,
  ChevronRight,
  Eye,
  Send,
  ArrowRight
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import RetryState from '../../components/ui/RetryState';
import Button from '../../components/ui/Button';

export const ComplaintManagement = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal & Actions
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Resolution form
  const [newStatus, setNewStatus] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(
        `/admin/complaints?page=${page}&limit=10&status=${statusFilter}`
      );
      setComplaints(res.data.data.complaints);
      setTotalPages(res.data.pages);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, statusFilter]);

  const openModal = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus('');
    setResolutionNote('');
    setIsResolving(false);
    setIsModalOpen(true);
  };

  const handleAssignToMe = async (complaintId) => {
    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/complaints/${complaintId}/assign`, {
        adminId: currentUser._id
      });
      alert('Complaint assigned to you successfully.');
      setIsModalOpen(false);
      fetchComplaints();
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to assign complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!newStatus || !resolutionNote.trim()) {
      return alert('Please select a new status and provide a resolution note.');
    }

    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/complaints/${selectedComplaint._id}/status`, {
        status: newStatus,
        note: resolutionNote
      });
      alert('Complaint status updated successfully.');
      setIsModalOpen(false);
      fetchComplaints();
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to update complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      low: (
        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
          Low
        </Badge>
      ),
      medium: (
        <Badge variant="primary" className="bg-blue-100 text-blue-700">
          Medium
        </Badge>
      ),
      high: (
        <Badge variant="warning" className="bg-orange-100 text-orange-700">
          High
        </Badge>
      ),
      critical: (
        <Badge variant="error" className="bg-red-100 text-red-700 animate-pulse">
          Critical
        </Badge>
      )
    };
    return variants[priority] || <Badge variant="secondary">{priority}</Badge>;
  };

  const getStatusBadge = (status) => {
    const variants = {
      open: (
        <Badge variant="error" className="bg-red-50 text-red-600 border border-red-200">
          Open
        </Badge>
      ),
      investigating: (
        <Badge variant="warning" className="bg-amber-50 text-amber-600 border border-amber-200">
          Investigating
        </Badge>
      ),
      resolved: (
        <Badge variant="success" className="bg-green-50 text-green-600 border border-green-200">
          Resolved
        </Badge>
      ),
      closed: (
        <Badge variant="secondary" className="bg-gray-50 text-gray-600 border border-gray-200">
          Closed
        </Badge>
      )
    };
    return variants[status] || <Badge variant="secondary">{status}</Badge>;
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2 flex items-center gap-3">
          Complaint Management
        </h1>
        <p className="text-text-secondary font-medium">
          Track, assign, and resolve user disputes and platform complaints.
        </p>
      </div>

      <Card className="shadow-sm border-border-light rounded-[24px] overflow-hidden bg-white relative">
        <div className="p-6 border-b border-border-light flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-xl border border-border-light bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Complaints</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
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
            <RetryState error={error} onRetry={fetchComplaints} />
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title="No complaints found"
              description="No tickets match your current filter criteria. Great job!"
              icon={<ShieldAlert size={48} className="text-gray-300" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Ticket ID</Table.Head>
                  <Table.Head>Subject</Table.Head>
                  <Table.Head>Complainant</Table.Head>
                  <Table.Head>Priority</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head>Assigned To</Table.Head>
                  <Table.Head className="text-right">Action</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {complaints.map((complaint) => (
                  <Table.Row
                    key={complaint._id}
                    className={
                      ['resolved', 'closed'].includes(complaint.status)
                        ? 'opacity-70 bg-gray-50'
                        : ''
                    }
                  >
                    <Table.Cell>
                      <span className="font-bold text-gray-500 text-xs">
                        #{complaint._id.slice(-6).toUpperCase()}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className="font-bold text-gray-900 line-clamp-1 max-w-[200px]"
                        title={complaint.subject}
                      >
                        {complaint.subject}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold shrink-0">
                          {complaint.user?.name?.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                          {complaint.user?.name}
                        </span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>{getPriorityBadge(complaint.priority)}</Table.Cell>
                    <Table.Cell>{getStatusBadge(complaint.status)}</Table.Cell>
                    <Table.Cell>
                      {complaint.assignedTo ? (
                        <span className="text-sm font-medium text-primary">
                          {complaint.assignedTo.name}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-gray-400 uppercase">
                          Unassigned
                        </span>
                      )}
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      <button
                        onClick={() => openModal(complaint)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors inline-flex"
                        title="Resolve Issue"
                      >
                        <ArrowRight size={18} />
                      </button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </Card>

      {/* Complaint Resolution Modal */}
      {isModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <Card className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl animate-fade-in max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border-light flex justify-between items-center bg-gray-50 shrink-0">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <AlertTriangle
                      size={22}
                      className={
                        selectedComplaint.priority === 'critical' ? 'text-red-500' : 'text-gray-400'
                      }
                    />
                    Ticket{' '}
                    <span className="uppercase text-primary">
                      #{selectedComplaint._id.slice(-6)}
                    </span>
                  </h2>
                  {getStatusBadge(selectedComplaint.status)}
                  {getPriorityBadge(selectedComplaint.priority)}
                </div>
                <span className="text-sm text-text-secondary">
                  Opened on {new Date(selectedComplaint.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 bg-white rounded-full p-2 shadow-sm border border-gray-200 transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-0 overflow-hidden flex-1 flex flex-col md:flex-row">
              {/* Left Column: Complaint Context */}
              <div className="w-full md:w-1/2 p-6 flex flex-col gap-6 overflow-y-auto border-r border-border-light bg-white">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">
                    {selectedComplaint.subject}
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                    {selectedComplaint.description}
                  </div>
                </div>

                {/* Associated Booking & Complainant Info */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Dispute Context
                  </h4>

                  <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 flex flex-col gap-3 text-sm">
                    <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                      <span className="font-bold text-blue-900">
                        Booking #{selectedComplaint.booking?._id.slice(-6).toUpperCase()}
                      </span>
                      <Badge variant="primary" className="bg-blue-100 text-blue-800 border-none">
                        {selectedComplaint.booking?.service?.name || 'Service'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-text-muted">Customer</span>
                        <span className="font-medium text-gray-900">
                          {selectedComplaint.booking?.customer?.name || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-text-muted">Assigned Provider</span>
                        <span className="font-medium text-gray-900">
                          {selectedComplaint.booking?.provider?.name || 'Unassigned'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Complainant
                  </h4>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold">
                      {selectedComplaint.user?.name?.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">
                        {selectedComplaint.user?.name}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {selectedComplaint.user?.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Audit Timeline & Resolution */}
              <div className="w-full md:w-1/2 flex flex-col bg-gray-50/50">
                {/* Audit Timeline */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                    Audit Timeline
                  </h4>

                  {selectedComplaint.history?.length > 0 ? (
                    <div className="flex flex-col gap-5 border-l-2 border-gray-200 ml-2 pl-4 relative">
                      {selectedComplaint.history.map((log, index) => (
                        <div key={index} className="flex flex-col relative">
                          <div
                            className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${index === selectedComplaint.history.length - 1 ? 'bg-primary ring-4 ring-primary/20' : 'bg-gray-300'}`}
                          ></div>
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-gray-900 capitalize leading-tight">
                              {log.status}
                            </span>
                            <span className="text-xs text-text-muted">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <span className="text-sm text-gray-700 mt-1 whitespace-pre-wrap bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                            {log.note}
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

                {/* Resolution Actions Panel */}
                <div className="shrink-0 p-6 bg-white border-t border-border-light shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                  {!selectedComplaint.assignedTo && selectedComplaint.status === 'open' ? (
                    <div className="flex flex-col items-center justify-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                      <span className="text-sm text-blue-800 font-medium text-center">
                        This ticket is currently unassigned. Take ownership to begin investigating.
                      </span>
                      <Button
                        variant="primary"
                        onClick={() => handleAssignToMe(selectedComplaint._id)}
                        disabled={actionLoading}
                      >
                        Assign to Me & Investigate
                      </Button>
                    </div>
                  ) : ['resolved', 'closed'].includes(selectedComplaint.status) && !isResolving ? (
                    <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-100 text-green-800 rounded-xl font-medium justify-center">
                      <CheckCircle size={20} /> This complaint is {selectedComplaint.status}.
                    </div>
                  ) : (
                    <form
                      onSubmit={handleUpdateStatus}
                      className="flex flex-col gap-4 animate-fade-in"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-900">Add Update / Resolve</h4>
                        {isResolving && (
                          <button
                            type="button"
                            onClick={() => setIsResolving(false)}
                            className="text-xs text-gray-500 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <select
                          className="w-1/3 px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white font-medium"
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          required
                        >
                          <option value="" disabled>
                            Select Status...
                          </option>
                          <option value="investigating">Investigating</option>
                          <option value="resolved">Resolved (Fix Applied)</option>
                          <option value="closed">Closed (No Action Needed)</option>
                        </select>

                        <Input
                          type="text"
                          placeholder="Type a note detailing your findings or resolution..."
                          value={resolutionNote}
                          onChange={(e) => setResolutionNote(e.target.value)}
                          className="flex-1 bg-gray-50 border-gray-200"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full justify-center bg-gray-900 hover:bg-black text-white rounded-xl py-3 shadow-md"
                        disabled={actionLoading || !newStatus || !resolutionNote.trim()}
                      >
                        <Send size={18} className="mr-2" /> Submit Update & Change Status
                      </Button>
                    </form>
                  )}

                  {!isResolving &&
                    !['resolved', 'closed'].includes(selectedComplaint.status) &&
                    selectedComplaint.assignedTo && (
                      <button
                        type="button"
                        onClick={() => setIsResolving(true)}
                        className="mt-4 w-full text-center text-sm font-bold text-primary hover:text-primary/80"
                      >
                        Update Ticket Status
                      </button>
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
