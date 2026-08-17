import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import {
  Users,
  Briefcase,
  ClipboardCheck,
  IndianRupee,
  Calendar,
  Star,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ShieldCheck,
  User,
  ArrowRight
} from 'lucide-react';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import RetryState from '../../components/ui/RetryState';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/admin/stats');
      setData(res.data.data);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err.friendlyMessage || err.message);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = data?.stats || {
    totalCustomers: 0,
    totalProviders: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingVerifications: 0
  };

  const overview = data?.bookingOverview || {
    completed: 0,
    pending: 0,
    inProgress: 0,
    cancelled: 0
  };

  const recentBookings = data?.recentBookings || [];
  const recentUsers = data?.recentUsers || [];
  const recentProviders = data?.recentProviders || [];

  const totalOverviewBookings =
    overview.completed + overview.pending + overview.inProgress + overview.cancelled || 1;

  const getPercent = (count) => Math.round((count / totalOverviewBookings) * 100);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full py-4 sm:py-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 font-outfit tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-text-secondary font-medium text-sm sm:text-base mt-1">
          Real-time overview of platform statistics, marketplace bookings, and recent user activities.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-32 w-full rounded-[24px]" />
            <Skeleton className="h-32 w-full rounded-[24px]" />
            <Skeleton className="h-32 w-full rounded-[24px]" />
            <Skeleton className="h-32 w-full rounded-[24px]" />
          </div>
          <Skeleton.Card className="h-64 rounded-[24px]" />
          <Skeleton.Card className="h-64 rounded-[24px]" />
        </div>
      ) : error ? (
        <RetryState error={error} onRetry={fetchDashboardData} />
      ) : (
        <>
          {/* Summary Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Customers */}
            <Card className="p-6 shadow-soft border-border-light rounded-[24px] hover:shadow-elevated transition-all bg-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Total Customers
                </span>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-primary flex items-center justify-center border border-teal-100 shadow-sm">
                  <Users size={22} />
                </div>
              </div>
              <strong className="text-3xl text-gray-900 font-extrabold font-outfit tracking-tight block">
                {stats.totalCustomers}
              </strong>
              <span className="text-xs text-emerald-600 font-bold mt-1 inline-flex items-center gap-1">
                Active registered accounts
              </span>
            </Card>

            {/* Total Service Providers */}
            <Card className="p-6 shadow-soft border-border-light rounded-[24px] hover:shadow-elevated transition-all bg-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Service Providers
                </span>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                  <Briefcase size={22} />
                </div>
              </div>
              <strong className="text-3xl text-gray-900 font-extrabold font-outfit tracking-tight block">
                {stats.totalProviders}
              </strong>
              <span className="text-xs text-text-secondary font-medium mt-1 inline-block">
                {stats.pendingVerifications} pending verification
              </span>
            </Card>

            {/* Total Bookings */}
            <Card className="p-6 shadow-soft border-border-light rounded-[24px] hover:shadow-elevated transition-all bg-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Total Bookings
                </span>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-sm">
                  <ClipboardCheck size={22} />
                </div>
              </div>
              <strong className="text-3xl text-gray-900 font-extrabold font-outfit tracking-tight block">
                {stats.totalBookings}
              </strong>
              <span className="text-xs text-text-secondary font-medium mt-1 inline-block">
                Across all service categories
              </span>
            </Card>

            {/* Total Revenue */}
            <Card className="p-6 shadow-soft border-border-light rounded-[24px] hover:shadow-elevated transition-all bg-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Total Revenue
                </span>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
                  <IndianRupee size={22} />
                </div>
              </div>
              <strong className="text-3xl text-gray-900 font-extrabold font-outfit tracking-tight block">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </strong>
              <span className="text-xs text-emerald-600 font-bold mt-1 inline-block">
                Platform Cut: ₹{stats.platformRevenue.toLocaleString('en-IN')} (20%)
              </span>
            </Card>
          </div>

          {/* Booking Overview Section */}
          <Card className="shadow-soft border-border-light rounded-[24px] p-6 sm:p-8 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 font-outfit tracking-tight">
                  Booking Overview
                </h2>
                <p className="text-text-secondary text-xs sm:text-sm font-medium mt-0.5">
                  Distribution of booking statuses across the platform.
                </p>
              </div>
            </div>

            {/* Visual Breakdown Progress Bar */}
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex mb-6 shadow-inner">
              <div
                style={{ width: `${getPercent(overview.completed)}%` }}
                className="bg-emerald-500 h-full transition-all duration-500"
                title={`Completed: ${overview.completed}`}
              />
              <div
                style={{ width: `${getPercent(overview.inProgress)}%` }}
                className="bg-indigo-500 h-full transition-all duration-500"
                title={`In Progress: ${overview.inProgress}`}
              />
              <div
                style={{ width: `${getPercent(overview.pending)}%` }}
                className="bg-amber-400 h-full transition-all duration-500"
                title={`Pending: ${overview.pending}`}
              />
              <div
                style={{ width: `${getPercent(overview.cancelled)}%` }}
                className="bg-red-400 h-full transition-all duration-500"
                title={`Cancelled: ${overview.cancelled}`}
              />
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-2xl flex flex-col">
                <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
                  <CheckCircle2 size={16} /> Completed
                </div>
                <span className="text-2xl font-extrabold text-gray-900 font-outfit">
                  {overview.completed}
                </span>
                <span className="text-xs text-text-secondary font-medium mt-0.5">
                  {getPercent(overview.completed)}% of total
                </span>
              </div>

              <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-2xl flex flex-col">
                <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
                  <Clock size={16} /> In-Progress
                </div>
                <span className="text-2xl font-extrabold text-gray-900 font-outfit">
                  {overview.inProgress}
                </span>
                <span className="text-xs text-text-secondary font-medium mt-0.5">
                  {getPercent(overview.inProgress)}% of total
                </span>
              </div>

              <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-2xl flex flex-col">
                <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
                  <AlertCircle size={16} /> Pending
                </div>
                <span className="text-2xl font-extrabold text-gray-900 font-outfit">
                  {overview.pending}
                </span>
                <span className="text-xs text-text-secondary font-medium mt-0.5">
                  {getPercent(overview.pending)}% of total
                </span>
              </div>

              <div className="bg-red-50/60 border border-red-100 p-4 rounded-2xl flex flex-col">
                <div className="flex items-center gap-2 text-red-700 text-xs font-bold uppercase tracking-wider mb-1">
                  <XCircle size={16} /> Cancelled
                </div>
                <span className="text-2xl font-extrabold text-gray-900 font-outfit">
                  {overview.cancelled}
                </span>
                <span className="text-xs text-text-secondary font-medium mt-0.5">
                  {getPercent(overview.cancelled)}% of total
                </span>
              </div>
            </div>
          </Card>

          {/* Recent Bookings Section */}
          <Card className="shadow-soft border-border-light rounded-[24px] overflow-hidden bg-white">
            <div className="p-6 sm:p-8 border-b border-border-light flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 font-outfit tracking-tight">
                  Recent Bookings
                </h2>
                <p className="text-text-secondary text-xs sm:text-sm font-medium mt-0.5">
                  Latest customer service requests across all categories.
                </p>
              </div>
            </div>

            <Card.Body className="p-0">
              {recentBookings.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    title="No Recent Bookings"
                    description="No bookings have been made yet on the marketplace."
                    icon={<ClipboardCheck size={40} className="text-gray-300" />}
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-border-light text-xs font-bold text-text-secondary uppercase tracking-wider">
                        <th className="px-6 py-4">Booking ID</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Service</th>
                        <th className="px-6 py-4">Provider</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light text-sm font-medium text-gray-900">
                      {recentBookings.map((b) => (
                        <tr key={b._id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs font-bold text-primary">
                            #{b._id.substring(b._id.length - 6).toUpperCase()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900">{b.customer?.name || 'N/A'}</span>
                              <span className="text-xs text-text-secondary">{b.customer?.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            {b.service?.name || 'Home Service'}
                          </td>
                          <td className="px-6 py-4">
                            {b.provider?.name ? (
                              <span className="font-semibold text-gray-900">{b.provider.name}</span>
                            ) : (
                              <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                                Unassigned
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs text-text-secondary">
                            {new Date(b.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900">
                            ₹{b.totalAmount || 0}
                          </td>
                          <td className="px-6 py-4">
                            <Badge status={b.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Two Column Section: Recent Users & Recent Providers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Users */}
            <Card className="shadow-soft border-border-light rounded-[24px] overflow-hidden bg-white">
              <div className="p-6 border-b border-border-light flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 font-outfit tracking-tight">
                    Recent Customers
                  </h3>
                  <p className="text-xs text-text-secondary font-medium">
                    Latest customer registrations.
                  </p>
                </div>
              </div>

              <Card.Body className="p-0">
                {recentUsers.length === 0 ? (
                  <div className="p-6">
                    <EmptyState
                      title="No Customers Yet"
                      description="No registered customers found."
                      icon={<Users size={32} className="text-gray-300" />}
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-border-light">
                    {recentUsers.map((u) => (
                      <div
                        key={u._id}
                        className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-outfit">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 text-sm">{u.name}</span>
                            <span className="text-xs text-text-secondary">{u.email}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs text-text-secondary font-medium">
                            {new Date(u.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              u.isBlocked
                                ? 'bg-red-50 text-red-600'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {u.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Recent Providers */}
            <Card className="shadow-soft border-border-light rounded-[24px] overflow-hidden bg-white">
              <div className="p-6 border-b border-border-light flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 font-outfit tracking-tight">
                    Recent Service Providers
                  </h3>
                  <p className="text-xs text-text-secondary font-medium">
                    Latest provider registrations and verification statuses.
                  </p>
                </div>
              </div>

              <Card.Body className="p-0">
                {recentProviders.length === 0 ? (
                  <div className="p-6">
                    <EmptyState
                      title="No Providers Yet"
                      description="No registered service providers found."
                      icon={<Briefcase size={32} className="text-gray-300" />}
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-border-light">
                    {recentProviders.map((p) => (
                      <div
                        key={p._id}
                        className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold font-outfit border border-blue-100">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 text-sm">{p.name}</span>
                            <span className="text-xs text-text-secondary">
                              {p.providerDetails?.serviceCategory?.name || 'General Provider'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                            <Star size={14} className="fill-amber-400 text-amber-400" />
                            <span>{p.providerDetails?.rating || 5.0}</span>
                          </div>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              p.providerDetails?.verificationStatus === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : p.providerDetails?.verificationStatus === 'rejected'
                                  ? 'bg-red-50 text-red-600 border border-red-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {p.providerDetails?.verificationStatus === 'approved'
                              ? 'Verified'
                              : p.providerDetails?.verificationStatus === 'rejected'
                                ? 'Rejected'
                                : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
