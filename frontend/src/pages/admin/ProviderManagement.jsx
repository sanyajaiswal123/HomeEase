import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import {
  Search,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Star,
  MoreVertical,
  Ban,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import RetryState from '../../components/ui/RetryState';
import Button from '../../components/ui/Button';

export const ProviderManagement = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filter States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProviders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(
        `/admin/providers?page=${page}&limit=10&search=${searchQuery}&status=${statusFilter}`
      );
      setProviders(res.data.data.providers);
      setTotalPages(res.data.pages);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [page, statusFilter]);

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchProviders();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleBlockToggle = async (userId, currentStatus) => {
    if (
      !window.confirm(
        `Are you sure you want to ${currentStatus ? 'unblock' : 'block'} this provider?`
      )
    )
      return;
    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/users/${userId}/block`);
      fetchProviders();
      if (selectedProvider?._id === userId) {
        setSelectedProvider({ ...selectedProvider, isBlocked: !currentStatus });
      }
    } catch (err) {
      alert('Failed to update provider status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (
      !window.confirm('Are you sure you want to delete this provider? This removes their listings.')
    )
      return;
    setActionLoading(true);
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      setIsModalOpen(false);
      fetchProviders();
    } catch (err) {
      alert('Failed to delete provider.');
    } finally {
      setActionLoading(false);
    }
  };

  const openProfile = (provider) => {
    setSelectedProvider(provider);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Provider Management
        </h1>
        <p className="text-text-secondary font-medium">
          View, block, and manage service professionals.
        </p>
      </div>

      <Card className="shadow-sm border-border-light rounded-[24px] overflow-hidden bg-white">
        {/* Controls */}
        <div className="p-6 border-b border-border-light flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="w-full sm:w-72">
              <Input
                type="text"
                placeholder="Search by name or email..."
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
              <option value="all">All Active</option>
              <option value="active">Active Only</option>
              <option value="blocked">Blocked</option>
              <option value="deleted">Deleted (Archive)</option>
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
            <RetryState error={error} onRetry={fetchProviders} />
          </div>
        ) : providers.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title="No providers found"
              description="Try adjusting your search query or filter."
              icon={<Briefcase size={48} className="text-gray-300" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Provider</Table.Head>
                  <Table.Head>Service</Table.Head>
                  <Table.Head>Rating/Status</Table.Head>
                  <Table.Head>Account State</Table.Head>
                  <Table.Head className="text-right">Actions</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {providers.map((provider) => (
                  <Table.Row
                    key={provider._id}
                    className={!provider.isActive ? 'opacity-60 bg-gray-50' : ''}
                  >
                    <Table.Cell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                          {provider.name?.charAt(0).toUpperCase() || 'P'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{provider.name}</span>
                          <span className="text-xs text-text-secondary uppercase">
                            ID: {provider._id.slice(-6)}
                          </span>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-primary text-sm">
                          {provider.providerDetails?.serviceCategory?.name || 'Unassigned'}
                        </span>
                        <span className="text-xs text-text-secondary font-medium">
                          ₹{provider.providerDetails?.hourlyRate}/hr
                        </span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star size={16} fill="currentColor" />
                          <span className="text-sm font-bold text-gray-900">
                            {provider.providerDetails?.rating?.toFixed(1) || '5.0'}
                          </span>
                        </div>
                        {provider.providerDetails?.isVerified ? (
                          <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                            <ShieldCheck size={12} /> Verified
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-orange-500 flex items-center gap-1">
                            <ShieldAlert size={12} /> Pending
                          </span>
                        )}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      {!provider.isActive ? (
                        <Badge variant="error" className="bg-red-50 text-red-700">
                          Deleted
                        </Badge>
                      ) : provider.isBlocked ? (
                        <Badge variant="warning" className="bg-orange-50 text-orange-700">
                          Blocked
                        </Badge>
                      ) : (
                        <Badge variant="success" className="bg-green-50 text-green-700">
                          Active
                        </Badge>
                      )}
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openProfile(provider)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="View Profile"
                        >
                          <Eye size={18} />
                        </button>
                        {provider.isActive && (
                          <button
                            onClick={() => handleBlockToggle(provider._id, provider.isBlocked)}
                            className={`p-2 rounded-lg transition-colors ${provider.isBlocked ? 'text-green-600 hover:bg-green-50' : 'text-orange-500 hover:bg-orange-50'}`}
                            title={provider.isBlocked ? 'Unblock Provider' : 'Block Provider'}
                          >
                            <Ban size={18} />
                          </button>
                        )}
                        {provider.isActive && (
                          <button
                            onClick={() => handleDelete(provider._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Provider"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </Card>

      {/* Provider Profile Modal */}
      {isModalOpen && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <Card className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl animate-fade-in max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-border-light flex justify-between items-start bg-gray-50 shrink-0">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-bold text-2xl border border-accent/20">
                  {selectedProvider.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedProvider.name}</h2>
                  <div className="flex gap-2 mt-1">
                    {!selectedProvider.isActive ? (
                      <Badge variant="error">Deleted</Badge>
                    ) : selectedProvider.isBlocked ? (
                      <Badge variant="warning">Blocked</Badge>
                    ) : (
                      <Badge variant="success">Active</Badge>
                    )}
                    {selectedProvider.providerDetails?.isVerified && (
                      <Badge variant="success" className="bg-green-100">
                        <ShieldCheck size={12} className="inline mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 bg-white rounded-full p-1 shadow-sm"
              >
                <MoreVertical size={20} className="rotate-90" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Details */}
                <div className="flex flex-col gap-4 bg-gray-50 p-4 rounded-2xl">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">
                    Contact Details
                  </h3>
                  <div className="flex items-center gap-3 text-text-secondary">
                    <Mail size={16} className="text-gray-400" />
                    <span className="font-medium text-gray-900">{selectedProvider.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-text-secondary">
                    <Phone size={16} className="text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {selectedProvider.phone || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-start gap-3 mt-1 text-text-secondary">
                    <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-800 leading-tight">
                      {selectedProvider.address || 'No address provided'}
                    </span>
                  </div>
                </div>

                {/* Professional Details */}
                <div className="flex flex-col gap-4 bg-blue-50/50 border border-blue-100 p-4 rounded-2xl">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">
                    Professional Profile
                  </h3>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-text-muted font-medium">Service Category</span>
                    <span className="font-bold text-primary">
                      {selectedProvider.providerDetails?.serviceCategory?.name || 'Unassigned'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="flex flex-col">
                      <span className="text-xs text-text-muted font-medium">Experience</span>
                      <span className="font-bold text-gray-900">
                        {selectedProvider.providerDetails?.experience} Yrs
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-text-muted font-medium">Hourly Rate</span>
                      <span className="font-bold text-gray-900">
                        ₹{selectedProvider.providerDetails?.hourlyRate}/hr
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {selectedProvider.isActive && (
              <div className="p-6 bg-gray-50 border-t border-border-light flex gap-3 justify-end shrink-0">
                <Button
                  variant="outline"
                  onClick={() =>
                    handleBlockToggle(selectedProvider._id, selectedProvider.isBlocked)
                  }
                  disabled={actionLoading}
                  className={
                    selectedProvider.isBlocked
                      ? 'text-green-600 border-green-200 hover:bg-green-50'
                      : 'text-orange-600 border-orange-200 hover:bg-orange-50'
                  }
                >
                  {selectedProvider.isBlocked ? 'Unblock Access' : 'Block Access'}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleDelete(selectedProvider._id)}
                  disabled={actionLoading}
                  className="bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20"
                >
                  Delete Account
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
