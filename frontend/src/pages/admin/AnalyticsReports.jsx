import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import {
  BarChart3,
  TrendingUp,
  IndianRupee,
  Users,
  Briefcase,
  CheckCircle2,
  XCircle,
  Calendar,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import RetryState from '../../components/ui/RetryState';
import Button from '../../components/ui/Button';

export const AnalyticsReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState('month');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/admin/analytics?range=${range}`);
      setData(res.data.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const metrics = data?.metrics || {
    totalBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    platformCommission: 0,
    completionRate: 0,
    cancellationRate: 0,
    newCustomers: 0,
    newProviders: 0
  };

  const topServices = data?.topServices || [];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full py-4 sm:py-6">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 font-outfit tracking-tight">
            Reports & Marketplace Analytics
          </h1>
          <p className="text-text-secondary font-medium text-sm sm:text-base mt-1">
            Real-time financial growth, booking completion performance, and service request metrics.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
          {[
            { label: 'Today', value: 'today' },
            { label: 'This Week', value: 'week' },
            { label: 'This Month', value: 'month' },
            { label: 'This Year', value: 'year' },
            { label: 'All Time', value: 'all' }
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setRange(item.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                range === item.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-32 w-full rounded-[24px]" />
            <Skeleton className="h-32 w-full rounded-[24px]" />
            <Skeleton className="h-32 w-full rounded-[24px]" />
            <Skeleton className="h-32 w-full rounded-[24px]" />
          </div>
          <Skeleton className="h-64 w-full rounded-[24px]" />
        </div>
      ) : error ? (
        <RetryState error={error} onRetry={fetchAnalytics} />
      ) : (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 shadow-soft border-border-light rounded-[24px] bg-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Total Gross Revenue
                </span>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-primary flex items-center justify-center border border-teal-100 shadow-sm">
                  <IndianRupee size={22} />
                </div>
              </div>
              <strong className="text-3xl text-gray-900 font-extrabold font-outfit tracking-tight block">
                ₹{metrics.totalRevenue}
              </strong>
              <span className="text-xs text-emerald-600 font-bold mt-1 inline-flex items-center gap-1">
                <TrendingUp size={14} /> Completed booking volume
              </span>
            </Card>

            <Card className="p-6 shadow-soft border-border-light rounded-[24px] bg-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Platform Net Commission
                </span>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
                  <ArrowUpRight size={22} />
                </div>
              </div>
              <strong className="text-3xl text-emerald-600 font-extrabold font-outfit tracking-tight block">
                ₹{metrics.platformCommission}
              </strong>
              <span className="text-xs text-emerald-600 font-bold mt-1 inline-block">
                20% platform marketplace cut
              </span>
            </Card>

            <Card className="p-6 shadow-soft border-border-light rounded-[24px] bg-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Completion Rate
                </span>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                  <CheckCircle2 size={22} />
                </div>
              </div>
              <strong className="text-3xl text-blue-600 font-extrabold font-outfit tracking-tight block">
                {metrics.completionRate}%
              </strong>
              <span className="text-xs text-text-secondary font-bold mt-1 inline-block">
                {metrics.completedBookings} of {metrics.totalBookings} jobs completed
              </span>
            </Card>

            <Card className="p-6 shadow-soft border-border-light rounded-[24px] bg-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Cancellation Rate
                </span>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-sm">
                  <XCircle size={22} />
                </div>
              </div>
              <strong className="text-3xl text-amber-600 font-extrabold font-outfit tracking-tight block">
                {metrics.cancellationRate}%
              </strong>
              <span className="text-xs text-text-secondary font-bold mt-1 inline-block">
                {metrics.cancelledBookings} cancelled jobs
              </span>
            </Card>
          </div>

          {/* Performance Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Requested Services */}
            <Card className="p-6 shadow-soft border-border-light rounded-[24px] bg-white">
              <h3 className="text-xl font-extrabold text-gray-900 font-outfit mb-6 flex items-center gap-2">
                <Sparkles size={20} className="text-primary" /> Most Requested Services
              </h3>

              {topServices.length === 0 ? (
                <p className="text-sm text-text-secondary font-medium">No service data for this range.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {topServices.map((svc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          #{idx + 1}
                        </div>
                        <div>
                          <strong className="text-gray-900 font-bold text-base block">
                            {svc.name}
                          </strong>
                          <span className="text-xs text-text-secondary font-medium">
                            {svc.totalBookings} Total Bookings
                          </span>
                        </div>
                      </div>
                      <strong className="text-gray-900 font-extrabold text-lg">
                        ₹{svc.totalRevenue}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Growth Overview */}
            <Card className="p-6 shadow-soft border-border-light rounded-[24px] bg-white flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 font-outfit mb-6">
                  User Growth & Acquisition
                </h3>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-teal-50/50 p-6 rounded-2xl border border-teal-100 text-center">
                    <Users size={28} className="text-primary mx-auto mb-2" />
                    <strong className="text-3xl text-gray-900 font-extrabold font-outfit block">
                      +{metrics.newCustomers}
                    </strong>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                      New Customers
                    </span>
                  </div>

                  <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 text-center">
                    <Briefcase size={28} className="text-blue-600 mx-auto mb-2" />
                    <strong className="text-3xl text-gray-900 font-extrabold font-outfit block">
                      +{metrics.newProviders}
                    </strong>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      New Service Providers
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-text-secondary font-medium leading-relaxed">
                Marketplace conversion health is tracked in real-time based on database records. Platform commission is calculated at 20% on all completed jobs.
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsReports;
