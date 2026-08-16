import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import {
  Search,
  MapPin,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
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

export const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filter States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(
        `/admin/customers?page=${page}&limit=10&search=${searchQuery}&status=${statusFilter}`
      );
      setCustomers(res.data.data.customers);
      setTotalPages(res.data.pages);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, statusFilter]);

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to first page on search
      fetchCustomers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleBlockToggle = async (userId, currentStatus) => {
    if (
      !window.confirm(`Are you sure you want to ${currentStatus ? 'unblock' : 'block'} this user?`)
    )
      return;
    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/users/${userId}/block`);
      fetchCustomers();
      if (selectedUser?._id === userId) {
        setSelectedUser({ ...selectedUser, isBlocked: !currentStatus });
      }
    } catch (err) {
      alert('Failed to update user status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this user? This action will remove their access to the platform.'
      )
    )
      return;
    setActionLoading(true);
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      alert('Failed to delete user.');
    } finally {
      setActionLoading(false);
    }
  };

  const openProfile = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Customer Management
        </h1>
        <p className="text-text-secondary font-medium">
          View, block, and manage customer accounts.
        </p>
      </div>

      <Card className="shadow-sm border-border-light rounded-[24px] overflow-hidden bg-white relative">
        {/* Controls */}
        <div className="p-6 border-b border-border-light flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="w-full sm:w-72">
              <Input
                type="text"
                placeholder="Search by name, email or phone..."
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

        {/* Table */}
        {loading ? (
          <div className="p-6 flex flex-col gap-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : error ? (
          <div className="p-6">
            <RetryState error={error} onRetry={fetchCustomers} />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title="No customers found"
              description="Try adjusting your search query or filter."
              icon={<UserIcon size={48} className="text-gray-300" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Customer</Table.Head>
                  <Table.Head>Contact</Table.Head>
                  <Table.Head>Joined</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head className="text-right">Actions</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {customers.map((customer) => (
                  <Table.Row
                    key={customer._id}
                    className={!customer.isActive ? 'opacity-60 bg-gray-50' : ''}
                  >
                    <Table.Cell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                          {customer.name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{customer.name}</span>
                          <span className="text-xs text-text-secondary uppercase">
                            ID: {customer._id.slice(-6)}
                          </span>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-col gap-1 text-sm text-gray-700">
                        <span className="flex items-center gap-2">
                          <Mail size={12} className="text-gray-400" />
                          {customer.email}
                        </span>
                        <span className="flex items-center gap-2">
                          <Phone size={12} className="text-gray-400" />
                          {customer.phone || 'N/A'}
                        </span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm font-medium text-gray-600">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      {!customer.isActive ? (
                        <Badge variant="error" className="bg-red-50 text-red-700">
                          Deleted
                        </Badge>
                      ) : customer.isBlocked ? (
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
                          onClick={() => openProfile(customer)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="View Profile"
                        >
                          <Eye size={18} />
                        </button>
                        {customer.isActive && (
                          <button
                            onClick={() => handleBlockToggle(customer._id, customer.isBlocked)}
                            className={`p-2 rounded-lg transition-colors ${customer.isBlocked ? 'text-green-600 hover:bg-green-50' : 'text-orange-500 hover:bg-orange-50'}`}
                            title={customer.isBlocked ? 'Unblock User' : 'Block User'}
                          >
                            <Ban size={18} />
                          </button>
                        )}
                        {customer.isActive && (
                          <button
                            onClick={() => handleDelete(customer._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
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

      {/* User Profile Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <Card className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 border-b border-border-light flex justify-between items-start bg-gray-50">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h2>
                  <div className="flex gap-2 mt-1">
                    {!selectedUser.isActive ? (
                      <Badge variant="error">Deleted</Badge>
                    ) : selectedUser.isBlocked ? (
                      <Badge variant="warning">Blocked</Badge>
                    ) : (
                      <Badge variant="success">Active</Badge>
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

            <div className="p-6 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Email
                  </span>
                  <p className="font-medium text-gray-900 mt-1">{selectedUser.email}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Phone
                  </span>
                  <p className="font-medium text-gray-900 mt-1">{selectedUser.phone || 'N/A'}</p>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Address
                </span>
                <div className="flex items-start gap-2 mt-2 bg-gray-50 p-3 rounded-xl">
                  <MapPin size={18} className="text-gray-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-800">
                    {selectedUser.address || 'No address provided'}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 text-blue-800">
                  <Calendar size={18} />
                  <span className="font-medium">Joined Platform</span>
                </div>
                <span className="font-bold text-blue-900">
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {selectedUser.isActive && (
              <div className="p-6 bg-gray-50 border-t border-border-light flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => handleBlockToggle(selectedUser._id, selectedUser.isBlocked)}
                  disabled={actionLoading}
                  className={
                    selectedUser.isBlocked
                      ? 'text-green-600 border-green-200 hover:bg-green-50'
                      : 'text-orange-600 border-orange-200 hover:bg-orange-50'
                  }
                >
                  {selectedUser.isBlocked ? 'Unblock Access' : 'Block Access'}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleDelete(selectedUser._id)}
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
