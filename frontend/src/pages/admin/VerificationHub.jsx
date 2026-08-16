import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import {
  ShieldAlert,
  Check,
  X,
  FileText,
  User,
  Mail,
  Phone,
  Briefcase,
  Clock,
  FileBadge
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import RetryState from '../../components/ui/RetryState';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';

export const VerificationHub = () => {
  const [pendingProviders, setPendingProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/admin/verifications');
      setPendingProviders(res.data.data.providers);
      if (res.data.data.providers.length > 0 && !selectedProvider) {
        setSelectedProvider(res.data.data.providers[0]);
      } else if (res.data.data.providers.length === 0) {
        setSelectedProvider(null);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleVerify = async (providerId) => {
    if (
      !window.confirm(
        'Are you sure you want to approve this provider? They will become immediately available on the platform.'
      )
    )
      return;

    setActionLoading(true);
    try {
      await apiClient.put(`/admin/verifications/${providerId}/approve`);
      alert('Provider successfully verified and activated.');
      setSelectedProvider(null);
      fetchPending();
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to verify provider.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (providerId) => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    setActionLoading(true);
    try {
      await apiClient.put(`/admin/verifications/${providerId}/reject`, { reason: rejectReason });
      alert('Provider application rejected.');
      setIsRejecting(false);
      setRejectReason('');
      setSelectedProvider(null);
      fetchPending();
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to reject provider.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full h-full">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Verification Hub
        </h1>
        <p className="text-text-secondary font-medium">
          Review documents, approve, or reject new service professional applications.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col md:flex-row gap-6 h-[600px]">
          <Skeleton className="w-full md:w-1/3 h-full rounded-2xl" />
          <Skeleton className="w-full md:w-2/3 h-full rounded-2xl" />
        </div>
      ) : error ? (
        <RetryState error={error} onRetry={fetchPending} />
      ) : pendingProviders.length === 0 ? (
        <Card className="rounded-[24px] p-12">
          <EmptyState
            title="All caught up!"
            description="There are currently no provider applications awaiting verification."
            icon={<ShieldAlert size={48} className="text-gray-300" />}
          />
        </Card>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 min-h-[600px] h-full items-start">
          {/* Queue List */}
          <Card className="w-full md:w-1/3 shadow-sm border-border-light rounded-[24px] overflow-hidden flex flex-col max-h-[700px]">
            <div className="p-5 border-b border-border-light bg-gray-50 shrink-0">
              <h2 className="font-bold text-gray-900 flex items-center justify-between">
                <span>Pending Queue</span>
                <Badge variant="primary" className="rounded-full px-2.5 py-0.5">
                  {pendingProviders.length}
                </Badge>
              </h2>
            </div>
            <div className="overflow-y-auto flex-1 p-2 flex flex-col gap-2 bg-white">
              {pendingProviders.map((provider) => (
                <button
                  key={provider._id}
                  onClick={() => {
                    setSelectedProvider(provider);
                    setIsRejecting(false);
                    setRejectReason('');
                  }}
                  className={`flex flex-col gap-1 p-4 rounded-xl text-left transition-all border ${
                    selectedProvider?._id === provider._id
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-transparent hover:bg-gray-50'
                  }`}
                >
                  <span className="font-bold text-gray-900">{provider.name}</span>
                  <span className="text-xs text-text-secondary truncate w-full">
                    {provider.providerDetails?.serviceCategory?.name || 'Unassigned'}
                  </span>
                  <span className="text-xs text-text-muted mt-1">
                    Applied: {new Date(provider.createdAt).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Detailed Review Panel */}
          {selectedProvider && (
            <Card className="w-full md:w-2/3 shadow-sm border-border-light rounded-[24px] overflow-hidden bg-white sticky top-4 flex flex-col">
              <div className="p-6 border-b border-border-light flex justify-between items-start bg-gray-50 shrink-0">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-[20px] bg-accent/10 text-accent flex items-center justify-center shrink-0 border border-accent/20">
                    <User size={32} />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      {selectedProvider.name}
                    </h2>
                    <span className="text-text-secondary font-medium text-sm">
                      Application ID: {selectedProvider._id}
                    </span>
                  </div>
                </div>
                <Badge variant="warning" className="rounded-full px-3 py-1 animate-pulse">
                  Awaiting Review
                </Badge>
              </div>

              <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Info */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
                    Contact Details
                  </h3>
                  <div className="flex items-center gap-3 text-text-secondary">
                    <Mail size={18} className="text-gray-400" />
                    <span className="font-medium text-gray-900">{selectedProvider.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-text-secondary">
                    <Phone size={18} className="text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {selectedProvider.phone || 'Not provided'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="text-sm text-text-muted">Home Address</span>
                    <p className="text-sm font-medium text-gray-900 bg-gray-50 p-3 rounded-xl border border-border-light leading-tight">
                      {selectedProvider.address || 'No address provided'}
                    </p>
                  </div>
                </div>

                {/* Professional Details */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
                    Professional Profile
                  </h3>
                  <div className="flex items-center gap-3 text-text-secondary">
                    <Briefcase size={18} className="text-gray-400" />
                    <div className="flex flex-col">
                      <span className="text-xs text-text-muted">Requested Category</span>
                      <span className="font-bold text-primary">
                        {selectedProvider.providerDetails?.serviceCategory?.name || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="bg-gray-50 p-3 rounded-xl border border-border-light flex flex-col gap-1">
                      <span className="text-xs text-text-muted">Experience</span>
                      <span className="font-bold text-gray-900">
                        {selectedProvider.providerDetails?.experience} Years
                      </span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-border-light flex flex-col gap-1">
                      <span className="text-xs text-text-muted">Proposed Rate</span>
                      <span className="font-bold text-gray-900">
                        ₹{selectedProvider.providerDetails?.hourlyRate}/hr
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="px-6 py-5 border-t border-b border-border-light bg-blue-50/50">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FileBadge size={18} className="text-blue-600" /> Identity Documents
                </h3>
                {selectedProvider.providerDetails?.documentUrl ? (
                  <a
                    href={selectedProvider.providerDetails.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-white border border-blue-200 rounded-xl hover:border-blue-400 hover:shadow-sm transition-all"
                  >
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-blue-900">View Uploaded Document</span>
                      <span className="text-xs text-blue-600">Opens securely in a new tab</span>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-white border border-dashed border-gray-300 rounded-xl">
                    <div className="w-10 h-10 bg-gray-100 text-gray-400 rounded-lg flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <span className="text-sm text-gray-500 font-medium">
                      No documents uploaded by user.
                    </span>
                  </div>
                )}
              </div>

              {/* Verification History Log (if any) */}
              {selectedProvider.providerDetails?.verificationHistory?.length > 0 && (
                <div className="px-6 py-4 bg-gray-50 border-b border-border-light max-h-40 overflow-y-auto">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock size={16} /> Verification History
                  </h3>
                  <div className="flex flex-col gap-3 border-l-2 border-gray-200 ml-2 pl-4">
                    {selectedProvider.providerDetails.verificationHistory.map((hist, idx) => (
                      <div key={idx} className="flex flex-col relative">
                        <div
                          className={`absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full ${hist.action === 'approved' ? 'bg-green-500' : 'bg-red-500'}`}
                        ></div>
                        <span className="text-xs text-text-muted font-medium">
                          {new Date(hist.date).toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-900">
                          <span className="font-bold capitalize">{hist.action}:</span> {hist.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="p-6 bg-white shrink-0 rounded-b-[24px]">
                {isRejecting ? (
                  <div className="flex flex-col gap-3 animate-fade-in bg-red-50 p-4 rounded-xl border border-red-100">
                    <h4 className="font-bold text-red-900 text-sm">Provide a Rejection Reason</h4>
                    <Input
                      type="text"
                      placeholder="e.g., ID document is blurry, mismatching name..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="bg-white"
                    />
                    <div className="flex gap-2 justify-end mt-2">
                      <Button
                        variant="outline"
                        className="px-4 py-2"
                        onClick={() => setIsRejecting(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white"
                        disabled={actionLoading}
                        onClick={() => handleReject(selectedProvider._id)}
                      >
                        Confirm Rejection
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setIsRejecting(true)}
                      className="px-6 py-2.5 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 rounded-xl font-bold"
                      icon={<X size={18} />}
                    >
                      Reject Application
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleVerify(selectedProvider._id)}
                      disabled={actionLoading}
                      className="px-8 py-2.5 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-white shadow-md shadow-green-600/20"
                      icon={<Check size={18} />}
                    >
                      Approve & Verify
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
