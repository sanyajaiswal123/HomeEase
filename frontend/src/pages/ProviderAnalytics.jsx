import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/apiClient';
import { AuthContext } from '../context/AuthContext';
import {
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  Star,
  Tag,
  DollarSign,
  Download,
  Filter,
  BarChart3,
  Briefcase,
  Percent,
  Sparkles
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import RetryState from '../components/ui/RetryState';

export const ProviderAnalytics = () => {
  const { user } = useContext(AuthContext);

  const [analytics, setAnalytics] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [period, setPeriod] = useState('month'); // 'today' | 'week' | 'month' | '3months' | 'all'
  const [serviceId, setServiceId] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resAnalytics, resServices] = await Promise.all([
        apiClient.get('/bookings/provider-analytics', {
          params: { period, serviceId }
        }),
        apiClient.get('/services/my')
      ]);

      setAnalytics(resAnalytics.data.data);
      setServices(resServices.data.data.services || []);
    } catch (err) {
      console.error('Error fetching provider analytics:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period, serviceId]);

  const handleExportCSV = () => {
    if (!analytics || !analytics.summary) return;

    const summary = analytics.summary;
    const csvRows = [
      ['Metric', 'Value'],
      ['Total Bookings', summary.totalBookings],
      ['Completed Bookings', summary.completedCount],
      ['Pending Bookings', summary.pendingCount],
      ['Cancelled Bookings', summary.cancelledCount],
      ['Completion Rate (%)', `${summary.completionRate}%`],
      ['Gross Revenue (INR)', summary.grossRevenue],
      ['Platform Commission 20% (INR)', summary.platformCommission],
      ['Net Provider Earnings 80% (INR)', summary.netEarnings],
      ['Total Discounts Given (INR)', summary.totalDiscountGiven],
      ['Total Unique Customers', summary.totalCustomersCount],
      ['Repeat Clients Count', summary.repeatCustomersCount],
      ['Average Rating', summary.avgRating],
      ['Total Reviews', summary.totalReviewsCount],
      ['Active Offers Count', summary.activeOffersCount],
      ['Total Offer Redemptions', summary.totalOfferRedemptions]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HomeEase_Provider_Analytics_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt || 0);
  };

  const summary = analytics?.summary || {};

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 font-outfit tracking-tight">
            Reports & Business Analytics
          </h1>
          <p className="text-text-secondary font-medium text-sm sm:text-base mt-1">
            Real-time operational performance, revenue breakdowns, customer retention, and service ratings.
          </p>
        </div>

        <Button
          onClick={handleExportCSV}
          disabled={loading || !analytics}
          variant="secondary"
          icon={<Download size={18} className="text-primary" />}
          className="rounded-2xl font-bold shadow-xs shrink-0"
        >
          Export CSV Report
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 sm:p-6 shadow-soft border-border-light rounded-[26px] bg-white flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Time Period Filter */}
        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-200 overflow-x-auto w-full sm:w-auto gap-1">
          {[
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: '3months', label: 'Last 3 Months' },
            { id: 'all', label: 'All Time' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                period === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Service Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-text-secondary font-bold whitespace-nowrap">Service:</span>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">All Services Offered</option>
            {services.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <Skeleton className="h-96 w-full rounded-[28px]" />
      ) : error ? (
        <RetryState error={error} onRetry={fetchAnalytics} />
      ) : (
        <>
          {/* Top KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Bookings Card */}
            <Card className="p-6 bg-white border border-border-light rounded-[28px] shadow-soft flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">
                  Total Bookings
                </span>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-primary flex items-center justify-center border border-teal-100">
                  <BarChart3 size={20} />
                </div>
              </div>
              <div className="mt-4">
                <strong className="text-3xl font-extrabold text-gray-900 font-outfit">
                  {summary.totalBookings || 0}
                </strong>
                <div className="flex items-center gap-2 mt-1 text-xs font-semibold text-emerald-600">
                  <span>{summary.completionRate}% Completion Rate</span>
                </div>
              </div>
            </Card>

            {/* Net Provider Earnings Card */}
            <Card className="p-6 bg-gradient-to-br from-teal-900 via-gray-900 to-gray-900 text-white rounded-[28px] shadow-soft flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-teal-200 uppercase tracking-wider">
                  Net Earnings (80%)
                </span>
                <div className="w-10 h-10 rounded-xl bg-white/10 text-teal-400 flex items-center justify-center border border-white/10">
                  <DollarSign size={20} />
                </div>
              </div>
              <div className="mt-4">
                <strong className="text-3xl font-extrabold font-outfit text-white">
                  {formatCurrency(summary.netEarnings)}
                </strong>
                <span className="text-[11px] text-teal-100/80 font-medium block mt-1">
                  Gross: {formatCurrency(summary.grossRevenue)} (Commission -20%)
                </span>
              </div>
            </Card>

            {/* Average Rating Card */}
            <Card className="p-6 bg-white border border-border-light rounded-[28px] shadow-soft flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">
                  Average Rating
                </span>
                <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center border border-yellow-100">
                  <Star size={20} className="fill-yellow-500 text-yellow-500" />
                </div>
              </div>
              <div className="mt-4">
                <strong className="text-3xl font-extrabold text-gray-900 font-outfit flex items-center gap-1.5">
                  {summary.avgRating} <Star size={24} className="text-yellow-500 fill-yellow-500" />
                </strong>
                <span className="text-xs font-bold text-gray-500 block mt-1">
                  From {summary.totalReviewsCount || 0} customer reviews
                </span>
              </div>
            </Card>

            {/* Unique Customers Card */}
            <Card className="p-6 bg-white border border-border-light rounded-[28px] shadow-soft flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">
                  Unique Clients
                </span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Users size={20} />
                </div>
              </div>
              <div className="mt-4">
                <strong className="text-3xl font-extrabold text-gray-900 font-outfit">
                  {summary.totalCustomersCount || 0}
                </strong>
                <span className="text-xs font-bold text-gray-500 block mt-1">
                  {summary.repeatCustomersCount || 0} Repeat Clients
                </span>
              </div>
            </Card>
          </div>

          {/* Booking Status & Service Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Booking Lifecycle Breakdown */}
            <Card className="p-6 bg-white border border-border-light rounded-[28px] shadow-soft flex flex-col justify-between gap-4">
              <h3 className="text-lg font-extrabold text-gray-900 font-outfit border-b border-gray-100 pb-3 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-primary" /> Booking Status Ratio
              </h3>

              <div className="flex flex-col gap-3 text-xs font-bold">
                <div>
                  <div className="flex justify-between text-gray-800 mb-1">
                    <span>Completed Services</span>
                    <span className="text-emerald-600">{summary.completedCount} ({summary.completionRate}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${summary.completionRate}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-800 mb-1">
                    <span>Pending / In Review</span>
                    <span className="text-amber-600">{summary.pendingCount}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${summary.totalBookings > 0 ? (summary.pendingCount / summary.totalBookings) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-800 mb-1">
                    <span>Cancelled</span>
                    <span className="text-red-600">{summary.cancelledCount} ({summary.cancellationRate}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-red-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${summary.cancellationRate}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-xs font-medium text-gray-600 mt-2">
                Pending earnings held in escrow: <strong className="text-gray-900 font-bold">{formatCurrency(summary.pendingEarnings)}</strong>
              </div>
            </Card>

            {/* Service Performance Table */}
            <Card className="p-6 bg-white border border-border-light rounded-[28px] shadow-soft md:col-span-2 flex flex-col justify-between gap-4">
              <h3 className="text-lg font-extrabold text-gray-900 font-outfit border-b border-gray-100 pb-3 flex items-center gap-2">
                <Briefcase size={18} className="text-primary" /> Top Performing Services
              </h3>

              {analytics?.servicePerformance?.length === 0 ? (
                <div className="py-8 text-center text-xs font-bold text-gray-400">
                  No service performance data available for this time range.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-text-secondary font-extrabold uppercase text-[10px] tracking-wider">
                        <th className="pb-3">Service Name</th>
                        <th className="pb-3 text-center">Bookings</th>
                        <th className="pb-3 text-right">Gross Revenue</th>
                        <th className="pb-3 text-right">Net Payout (80%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                      {analytics.servicePerformance.map((svc, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/60">
                          <td className="py-3 font-bold text-gray-900">{svc.name}</td>
                          <td className="py-3 text-center font-bold">{svc.bookingsCount}</td>
                          <td className="py-3 text-right">{formatCurrency(svc.grossRevenue)}</td>
                          <td className="py-3 text-right font-bold text-emerald-700">
                            {formatCurrency(svc.netEarnings)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* Offers & Discounts Performance Bar */}
          <Card className="p-6 bg-white border border-border-light rounded-[28px] shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-primary flex items-center justify-center shrink-0 border border-teal-100">
                <Tag size={24} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 font-outfit">
                  Offers & Coupon Performance
                </h3>
                <p className="text-xs text-text-secondary font-medium mt-0.5">
                  Total Discounts Given: <strong className="text-gray-900 font-bold">{formatCurrency(summary.totalDiscountGiven)}</strong> across <strong className="text-gray-900 font-bold">{summary.totalOfferRedemptions}</strong> promo code redemptions.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="info" className="font-bold text-xs">
                {summary.activeOffersCount || 0} Active Offers
              </Badge>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default ProviderAnalytics;
