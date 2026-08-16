import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { API_ENDPOINTS } from '../../config/constants';
import { ShieldAlert, Check, IndianRupee, ClipboardCheck } from 'lucide-react';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import RetryState from '../../components/ui/RetryState';

export const Dashboard = () => {
  const [unverifiedProviders, setUnverifiedProviders] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch unverified providers
      const provRes = await apiClient.get('/auth/providers?verified=false');
      setUnverifiedProviders(provRes.data.data.providers);

      // 2. Fetch all bookings (as admin, query is empty so returns all)
      const bookRes = await apiClient.get(API_ENDPOINTS.BOOKINGS.MY);
      setAllBookings(bookRes.data.data.bookings);
    } catch (err) {
      console.error('Error fetching admin data:', err.friendlyMessage);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerify = async (providerId) => {
    try {
      await apiClient.put(`/auth/providers/${providerId}/verify`);
      fetchData();
      alert(
        'Technician application approved successfully. They are now verified on the marketplace.'
      );
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to verify provider.');
    }
  };

  const calculatePlatformRevenue = () => {
    // 20% platform cut of completed bookings
    const completed = allBookings.filter((b) => b.status === 'completed');
    const totalGross = completed.reduce((sum, b) => sum + b.totalAmount, 0);
    return Math.round(totalGross * 0.2);
  };

  const completedBookingsCount = allBookings.filter((b) => b.status === 'completed').length;

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto w-full py-12 px-4 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-gray-900 font-outfit tracking-tight">
          Platform Management Console
        </h1>
        <p className="text-text-secondary font-medium text-lg">
          Review verification requests and audit system-wide marketplace metrics.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Skeleton className="h-32 w-full rounded-[24px]" />
            <Skeleton className="h-32 w-full rounded-[24px]" />
            <Skeleton className="h-32 w-full rounded-[24px]" />
          </div>
          <Skeleton.Card className="rounded-[24px]" />
        </div>
      ) : error ? (
        <RetryState error={error} onRetry={fetchData} />
      ) : (
        <>
          {/* Stats Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Platform cut */}
            <Card className="flex items-center gap-5 p-8 shadow-soft border-border-light rounded-[24px] hover:shadow-elevated transition-shadow">
              <div className="w-16 h-16 rounded-[20px] bg-bg-alternate text-primary flex items-center justify-center shrink-0 border border-primary-light shadow-sm">
                <IndianRupee size={28} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1.5">
                  Net Commissions (20%)
                </span>
                <strong className="text-3xl text-gray-900 font-extrabold font-outfit tracking-tight">
                  ₹{calculatePlatformRevenue()}
                </strong>
                <span className="text-xs text-text-secondary mt-1 font-medium">
                  Commission margin
                </span>
              </div>
            </Card>

            {/* Total Bookings */}
            <Card className="flex items-center gap-5 p-8 shadow-soft border-border-light rounded-[24px] hover:shadow-elevated transition-shadow">
              <div className="w-16 h-16 rounded-[20px] bg-bg-secondary text-gray-900 flex items-center justify-center shrink-0 border border-border-light shadow-sm">
                <ClipboardCheck size={28} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1.5">
                  Marketplace Bookings
                </span>
                <strong className="text-3xl text-gray-900 font-extrabold font-outfit tracking-tight">
                  {allBookings.length} Booked
                </strong>
                <span className="text-xs text-text-secondary mt-1 font-medium">
                  {completedBookingsCount} completed tasks
                </span>
              </div>
            </Card>

            {/* Verification queue size */}
            <Card className="flex items-center gap-5 p-8 shadow-soft border-border-light rounded-[24px] hover:shadow-elevated transition-shadow">
              <div className="w-16 h-16 rounded-[20px] bg-red-50 text-red-500 flex items-center justify-center shrink-0 border border-red-100 shadow-sm">
                <ShieldAlert size={28} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1.5">
                  Verification Backlog
                </span>
                <strong className="text-3xl text-gray-900 font-extrabold font-outfit tracking-tight">
                  {unverifiedProviders.length} Pending
                </strong>
                <span className="text-xs text-text-secondary mt-1 font-medium">
                  Awaiting review
                </span>
              </div>
            </Card>
          </div>

          {/* Verification Queue Column */}
          <Card className="shadow-soft border-border-light rounded-[24px] overflow-hidden bg-white">
            <Card.Body className="p-0">
              <div className="p-8 border-b border-border-light">
                <h3 className="text-2xl font-extrabold text-gray-900 font-outfit tracking-tight">
                  Provider Verification Queue
                </h3>
              </div>

              <div className="p-8 bg-bg-secondary/30">
                {unverifiedProviders.length === 0 ? (
                  <EmptyState
                    title="No Pending Approvals"
                    description="No pending provider applications in the verification backlog at this time."
                    icon={<ShieldAlert size={40} className="text-gray-300" />}
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {unverifiedProviders.map((provider) => (
                      <div
                        key={provider._id}
                        className="bg-white border border-border-light p-6 rounded-[20px] flex justify-between items-center flex-wrap gap-5 shadow-sm hover:shadow-md transition-all hover:border-primary-light"
                      >
                        <div className="flex flex-col gap-2">
                          <strong className="text-xl font-extrabold text-gray-900 font-outfit tracking-tight">
                            {provider.name}
                          </strong>
                          <span className="text-sm text-text-secondary font-medium">
                            Category:{' '}
                            <span className="text-gray-900 font-bold">
                              {provider.providerDetails?.serviceCategory?.name || 'N/A'}
                            </span>{' '}
                            <span className="mx-2">•</span>
                            <span className="text-gray-900 font-bold">
                              {provider.providerDetails?.experience}
                            </span>{' '}
                            Years Exp
                          </span>
                          <span className="text-xs text-text-secondary mt-1 font-bold">
                            Email: {provider.email} <span className="mx-2">|</span> Phone:{' '}
                            {provider.phone}
                          </span>
                        </div>

                        <Button
                          onClick={() => handleVerify(provider._id)}
                          variant="primary"
                          icon={<Check size={18} />}
                          className="rounded-xl px-6 py-3 font-bold shadow-md"
                        >
                          Approve & Activate
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;
