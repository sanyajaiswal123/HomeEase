import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/apiClient';
import { AuthContext } from '../context/AuthContext';
import {
  IndianRupee,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Eye,
  ArrowUpRight,
  ShieldCheck,
  Percent,
  Receipt
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import RetryState from '../components/ui/RetryState';

export const ProviderEarnings = () => {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({
    grossRevenue: 0,
    totalCommission: 0,
    netEarnings: 0,
    todaysEarnings: 0,
    weeksEarnings: 0,
    monthsEarnings: 0,
    pendingEarnings: 0,
    refundedAmount: 0,
    completedCount: 0,
    pendingCount: 0,
    cancelledCount: 0,
    commissionRatePercent: 20
  });

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [dateRange, setDateRange] = useState('all'); // 'all' | 'today' | 'week' | 'month' | 'last_month'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'paid' | 'pending' | 'refunded'

  // Selected Transaction Modal State
  const [selectedTxnBookingId, setSelectedTxnBookingId] = useState(null);
  const [txnDetails, setTxnDetails] = useState(null);
  const [txnLoading, setTxnLoading] = useState(false);

  const fetchEarningsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/bookings/provider-earnings', {
        params: {
          dateRange,
          status: statusFilter
        }
      });
      setStats(res.data.data.stats || {});
      setTransactions(res.data.data.transactions || []);
    } catch (err) {
      console.error('Error fetching provider earnings:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarningsData();
  }, [dateRange, statusFilter]);

  const openTxnDetails = async (bookingId) => {
    setSelectedTxnBookingId(bookingId);
    setTxnLoading(true);
    try {
      const res = await apiClient.get(`/bookings/provider-transactions/${bookingId}`);
      setTxnDetails(res.data.data.transaction);
    } catch (err) {
      console.error('Error fetching transaction details:', err);
    } finally {
      setTxnLoading(false);
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

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full py-8 px-4 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 font-outfit tracking-tight">
          Earnings & Financial Ledger
        </h1>
        <p className="text-text-secondary font-medium text-sm sm:text-base mt-1">
          Track gross revenues, 80/20 platform commission split, completed payouts, and transaction histories.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-36 w-full rounded-[24px]" />
          <Skeleton className="h-36 w-full rounded-[24px]" />
          <Skeleton className="h-36 w-full rounded-[24px]" />
          <Skeleton className="h-36 w-full rounded-[24px]" />
        </div>
      ) : error ? (
        <RetryState error={error} onRetry={fetchEarningsData} />
      ) : (
        <>
          {/* Main Financial Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Net Payout (80%) */}
            <Card className="p-6 bg-white border border-border-light rounded-[24px] shadow-soft flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Net Provider Earnings (80%)
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <IndianRupee size={20} />
                </div>
              </div>
              <strong className="text-3xl text-emerald-600 font-extrabold font-outfit block">
                ₹{stats.netEarnings}
              </strong>
              <span className="text-xs text-text-secondary font-semibold mt-2 block">
                Gross Billing: <strong className="text-gray-900">₹{stats.grossRevenue}</strong>
              </span>
            </Card>

            {/* Platform Commission (20%) */}
            <Card className="p-6 bg-white border border-border-light rounded-[24px] shadow-soft flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Platform Commission (20%)
                </span>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-primary flex items-center justify-center border border-teal-100">
                  <Percent size={18} />
                </div>
              </div>
              <strong className="text-3xl text-gray-900 font-extrabold font-outfit block">
                ₹{stats.totalCommission}
              </strong>
              <span className="text-xs text-primary font-bold mt-2 block">
                20% platform maintenance fee
              </span>
            </Card>

            {/* Today's & Weekly Earnings */}
            <Card className="p-6 bg-white border border-border-light rounded-[24px] shadow-soft flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Today's Net Earnings
                </span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Calendar size={18} />
                </div>
              </div>
              <strong className="text-3xl text-blue-600 font-extrabold font-outfit block">
                ₹{stats.todaysEarnings}
              </strong>
              <span className="text-xs text-blue-700 font-bold mt-2 block">
                This Week: ₹{stats.weeksEarnings}
              </span>
            </Card>

            {/* Pending & Refunded Payouts */}
            <Card className="p-6 bg-white border border-border-light rounded-[24px] shadow-soft flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Pending Payouts
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <Clock size={18} />
                </div>
              </div>
              <strong className="text-3xl text-amber-600 font-extrabold font-outfit block">
                ₹{stats.pendingEarnings}
              </strong>
              <span className="text-xs text-text-secondary font-semibold mt-2 block">
                Refunded/Cancelled: <strong className="text-red-600">₹{stats.refundedAmount}</strong>
              </span>
            </Card>
          </div>

          {/* Revenue Breakdown Banner */}
          <div className="p-6 rounded-[24px] bg-gradient-to-r from-teal-900 to-gray-900 text-white shadow-soft flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-teal-300 flex items-center justify-center border border-white/10 shrink-0">
                <Receipt size={24} />
              </div>
              <div>
                <strong className="text-xl font-extrabold font-outfit block">
                  80 / 20 Revenue Breakdown Summary
                </strong>
                <span className="text-xs text-teal-100/80 font-medium mt-0.5 block">
                  Gross Revenue (₹{stats.grossRevenue}) − Platform Commission (₹{stats.totalCommission}) = Net Provider Payout (₹{stats.netEarnings})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 bg-white/10 px-5 py-3 rounded-2xl border border-white/10 text-center shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200 block">This Month</span>
                <strong className="text-lg font-extrabold text-white">₹{stats.monthsEarnings}</strong>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200 block">Rating</span>
                <strong className="text-lg font-extrabold text-amber-400">★ {user?.providerDetails?.rating || 5.0}</strong>
              </div>
            </div>
          </div>

          {/* Filters & Transaction Ledger */}
          <Card className="shadow-soft border-border-light rounded-[26px] overflow-hidden bg-white">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 font-outfit">
                  Transaction Ledger ({transactions.length})
                </h3>
                <p className="text-xs text-text-secondary font-medium mt-0.5">
                  Detailed breakdown of every customer transaction associated with your bookings.
                </p>
              </div>

              {/* Date & Status Filter Controls */}
              <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                {/* Date Range Selector */}
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="last_month">Last Month</option>
                </select>

                {/* Status Filter Buttons */}
                <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 gap-1">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'paid', label: 'Paid' },
                    { id: 'pending', label: 'Pending' },
                    { id: 'refunded', label: 'Refunded' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setStatusFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        statusFilter === tab.id
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            {transactions.length === 0 ? (
              <EmptyState
                title="No Transactions Found"
                description="There are no transaction records matching your selected date or status filters."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-700">
                        Transaction ID
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-700">
                        Date & Customer
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-700">
                        Service Category
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-700">
                        Gross Billing
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-700">
                        20% Commission
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-emerald-700">
                        Your Share (80%)
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((txn) => (
                      <tr key={txn.bookingId} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-gray-900 text-xs">
                          {txn.transactionId}
                          <span className="text-[10px] text-gray-400 block font-sans">
                            Booking: {txn.bookingCode}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 text-xs">
                          <strong className="block">{txn.customerName}</strong>
                          <span className="text-[11px] text-gray-500 font-normal">
                            {formatDate(txn.date)}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-extrabold text-gray-900 text-xs">
                          {txn.serviceName}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-800 text-xs">
                          ₹{txn.grossAmount}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-500 text-xs">
                          -₹{txn.commissionAmount}
                        </td>
                        <td className="px-6 py-4 font-extrabold text-emerald-600 text-sm">
                          +₹{txn.netPayout}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              txn.paymentStatus === 'paid'
                                ? 'success'
                                : txn.paymentStatus === 'refunded'
                                ? 'error'
                                : 'warning'
                            }
                            className="uppercase text-[10px] font-bold"
                          >
                            {txn.paymentStatus}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            onClick={() => openTxnDetails(txn.bookingId)}
                            variant="secondary"
                            size="sm"
                            icon={<Eye size={14} />}
                            className="rounded-xl font-bold text-xs"
                          >
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Transaction Details Modal */}
      {selectedTxnBookingId && (
        <Modal
          isOpen={!!selectedTxnBookingId}
          onClose={() => setSelectedTxnBookingId(null)}
          title="Transaction & Settlement Details"
        >
          {txnLoading ? (
            <Skeleton className="h-56 w-full rounded-xl" />
          ) : txnDetails ? (
            <div className="flex flex-col gap-6 p-2">
              <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                <div>
                  <strong className="text-xl font-extrabold text-gray-900 font-outfit">
                    {txnDetails.transactionId}
                  </strong>
                  <span className="text-xs text-text-secondary font-mono block mt-0.5">
                    Booking Code: {txnDetails.bookingCode}
                  </span>
                </div>
                <Badge variant={txnDetails.paymentStatus === 'paid' ? 'success' : 'warning'}>
                  {txnDetails.paymentStatus.toUpperCase()}
                </Badge>
              </div>

              {/* Financial Breakdown */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex flex-col gap-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">
                  Financial Settlement Breakdown
                </h4>

                <div className="flex justify-between items-center text-sm font-medium text-gray-700">
                  <span>Gross Customer Bill</span>
                  <strong className="text-gray-900">₹{txnDetails.grossAmount}</strong>
                </div>

                <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                  <span>Platform Commission (20%)</span>
                  <span className="text-red-600 font-bold">-₹{txnDetails.commissionAmount}</span>
                </div>

                <div className="flex justify-between items-center text-base font-extrabold text-gray-900 pt-3 border-t border-gray-200">
                  <span className="text-emerald-700">Net Provider Share (80%)</span>
                  <strong className="text-emerald-600 text-xl font-outfit">+₹{txnDetails.netPayout}</strong>
                </div>
              </div>

              {/* Details Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-gray-500 font-bold block uppercase text-[10px] mb-1">
                    Customer Name
                  </span>
                  <strong className="text-gray-900 font-bold text-sm block">
                    {txnDetails.customer?.name}
                  </strong>
                  <span className="text-gray-500">{txnDetails.customer?.phone}</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-gray-500 font-bold block uppercase text-[10px] mb-1">
                    Service Category
                  </span>
                  <strong className="text-gray-900 font-bold text-sm block">
                    {txnDetails.service?.name}
                  </strong>
                  <span className="text-gray-500">Scheduled: {formatDate(txnDetails.scheduledDate)}</span>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button
                  variant="secondary"
                  onClick={() => setSelectedTxnBookingId(null)}
                  className="rounded-xl font-bold"
                >
                  Close Window
                </Button>
              </div>
            </div>
          ) : null}
        </Modal>
      )}
    </div>
  );
};

export default ProviderEarnings;
