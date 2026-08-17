import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import {
  CreditCard,
  IndianRupee,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  User,
  Briefcase,
  Calendar,
  ArrowUpRight
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import RetryState from '../../components/ui/RetryState';
import Button from '../../components/ui/Button';

export const PaymentsManagement = () => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({
    totalVolume: 0,
    platformCommission: 0,
    totalRefunded: 0,
    pendingVolume: 0,
    paidCount: 0,
    refundedCount: 0,
    pendingCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State for Refund Processing
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(
        `/admin/payments?page=${page}&limit=10&search=${searchQuery}&status=${statusFilter}`
      );
      setPayments(res.data.data.payments || []);
      setSummary(res.data.data.summary || {});
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchPayments();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleIssueRefund = async (e) => {
    e.preventDefault();
    if (!selectedPayment) return;

    setActionLoading(true);
    try {
      await apiClient.post(`/admin/payments/${selectedPayment._id}/refund`, {
        reason: refundReason
      });
      alert('Refund processed successfully and customer notified.');
      setSelectedPayment(null);
      setRefundReason('');
      fetchPayments();
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to process refund.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full py-4 sm:py-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 font-outfit tracking-tight">
          Payments & Refunds Management
        </h1>
        <p className="text-text-secondary font-medium text-sm sm:text-base mt-1">
          Monitor real marketplace transactions, platform 20% commission, pending payouts, and issue customer refunds.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 shadow-soft border-border-light rounded-[24px] bg-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Total Processed
            </span>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-primary flex items-center justify-center border border-teal-100 shadow-sm">
              <IndianRupee size={22} />
            </div>
          </div>
          <strong className="text-3xl text-gray-900 font-extrabold font-outfit tracking-tight block">
            ₹{summary.totalVolume || 0}
          </strong>
          <span className="text-xs text-text-secondary font-bold mt-1 inline-block">
            From {summary.paidCount || 0} successful bookings
          </span>
        </Card>

        <Card className="p-6 shadow-soft border-border-light rounded-[24px] bg-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Platform Commission (20%)
            </span>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
              <ArrowUpRight size={22} />
            </div>
          </div>
          <strong className="text-3xl text-emerald-600 font-extrabold font-outfit tracking-tight block">
            ₹{summary.platformCommission || 0}
          </strong>
          <span className="text-xs text-emerald-600 font-bold mt-1 inline-block">
            HomeEase Marketplace earnings
          </span>
        </Card>

        <Card className="p-6 shadow-soft border-border-light rounded-[24px] bg-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Total Refunded
            </span>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-sm">
              <RefreshCw size={22} />
            </div>
          </div>
          <strong className="text-3xl text-amber-600 font-extrabold font-outfit tracking-tight block">
            ₹{summary.totalRefunded || 0}
          </strong>
          <span className="text-xs text-text-secondary font-bold mt-1 inline-block">
            {summary.refundedCount || 0} refunded bookings
          </span>
        </Card>

        <Card className="p-6 shadow-soft border-border-light rounded-[24px] bg-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Pending Payments
            </span>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
              <Clock size={22} />
            </div>
          </div>
          <strong className="text-3xl text-blue-600 font-extrabold font-outfit tracking-tight block">
            ₹{summary.pendingVolume || 0}
          </strong>
          <span className="text-xs text-text-secondary font-bold mt-1 inline-block">
            {summary.pendingCount || 0} pending checkout orders
          </span>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 sm:p-6 shadow-soft border-border-light rounded-[24px] bg-white flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Payment ID, Customer, or Provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-bold text-text-secondary uppercase">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="shadow-soft border-border-light rounded-[24px] overflow-hidden bg-white">
        {loading ? (
          <div className="p-8">
            <Skeleton className="h-12 w-full mb-4 rounded-xl" />
            <Skeleton className="h-12 w-full mb-4 rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : error ? (
          <RetryState error={error} onRetry={fetchPayments} />
        ) : payments.length === 0 ? (
          <EmptyState
            title="No Payment Transactions Found"
            description="There are currently no transactions matching your search query."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Transaction ID</Table.Head>
                  <Table.Head>Customer</Table.Head>
                  <Table.Head>Provider</Table.Head>
                  <Table.Head>Service</Table.Head>
                  <Table.Head>Amount</Table.Head>
                  <Table.Head>Commission</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head>Date</Table.Head>
                  <Table.Head>Action</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {payments.map((p) => (
                  <Table.Row key={p._id}>
                    <Table.Cell>
                      <strong className="font-mono text-xs text-gray-900">
                        #{p._id.slice(-8).toUpperCase()}
                      </strong>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm">
                          {p.customer?.name || 'Customer'}
                        </span>
                        <span className="text-xs text-text-secondary">{p.customer?.email}</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm">
                          {p.provider?.name || 'Unassigned'}
                        </span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="font-bold text-gray-800 text-sm">
                        {p.service?.name || 'Service'}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <strong className="text-gray-900 font-extrabold">₹{p.totalAmount}</strong>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-emerald-600 font-bold text-xs">
                        +₹{Math.round((p.totalAmount || 0) * 0.2)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      {p.paymentStatus === 'paid' && <Badge variant="success">Paid</Badge>}
                      {p.paymentStatus === 'pending' && <Badge variant="warning">Pending</Badge>}
                      {p.paymentStatus === 'refunded' && <Badge variant="error">Refunded</Badge>}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-xs text-text-secondary font-medium">
                        {new Date(p.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      {p.paymentStatus === 'paid' ? (
                        <Button
                          onClick={() => setSelectedPayment(p)}
                          variant="secondary"
                          size="xs"
                          className="rounded-lg text-amber-700 hover:bg-amber-50"
                        >
                          Process Refund
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-400 font-bold">—</span>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </Card>

      {/* Process Refund Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 sm:p-8 shadow-2xl animate-fade-in border border-gray-100">
            <h3 className="text-2xl font-extrabold text-gray-900 font-outfit mb-2">
              Issue Refund
            </h3>
            <p className="text-sm text-text-secondary font-medium mb-6">
              You are processing a full refund of{' '}
              <strong className="text-gray-900">₹{selectedPayment.totalAmount}</strong> for booking{' '}
              <strong className="text-gray-900">
                #{selectedPayment._id.slice(-8).toUpperCase()}
              </strong>
              .
            </p>

            <form onSubmit={handleIssueRefund} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Refund Reason
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="Provide reason for issuing refund (e.g. Service cancellation / Complaint settlement)..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setSelectedPayment(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={actionLoading}
                  className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
                >
                  Confirm Refund
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsManagement;
