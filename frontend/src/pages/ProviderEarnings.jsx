import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Award, TrendingUp, Calendar, IndianRupee, ShieldCheck } from 'lucide-react';
import Card from '../components/ui/Card';

export const ProviderEarnings = () => {
  const { user } = useContext(AuthContext);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/bookings/my');
        const jobs = res.data.data.bookings.filter((b) => b.status === 'completed');
        setCompletedJobs(jobs);
      } catch (err) {
        console.error('Error loading earnings details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  const calculateTotalEarnings = () => {
    return completedJobs.reduce((sum, job) => sum + job.totalAmount, 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto w-full py-12 px-4 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-gray-900 font-outfit tracking-tight">
          Earnings Dashboard
        </h1>
        <p className="text-text-secondary font-medium text-lg">
          Track your completed task earnings, performance indices, and billing statements.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-24 text-text-secondary font-medium text-lg">
          Loading earnings records...
        </div>
      ) : (
        <>
          {/* Metrics summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Total earnings */}
            <Card className="flex items-center gap-5 p-8 shadow-soft border-border-light rounded-[24px] hover:shadow-elevated transition-shadow">
              <div className="w-16 h-16 rounded-[20px] bg-bg-alternate text-primary flex items-center justify-center shrink-0 border border-primary-light shadow-sm">
                <IndianRupee size={28} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1.5">
                  Total Payout (80/20)
                </span>
                <strong className="text-3xl text-gray-900 font-extrabold font-outfit tracking-tight">
                  ₹{Math.round(calculateTotalEarnings() * 0.8)}
                </strong>
                <span className="text-xs text-text-secondary mt-1 font-medium">
                  Total gross billing:{' '}
                  <span className="font-bold">₹{calculateTotalEarnings()}</span>
                </span>
              </div>
            </Card>

            {/* Completed Tasks */}
            <Card className="flex items-center gap-5 p-8 shadow-soft border-border-light rounded-[24px] hover:shadow-elevated transition-shadow">
              <div className="w-16 h-16 rounded-[20px] bg-bg-secondary text-gray-900 flex items-center justify-center shrink-0 border border-border-light shadow-sm">
                <TrendingUp size={28} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1.5">
                  Jobs Completed
                </span>
                <strong className="text-3xl text-gray-900 font-extrabold font-outfit tracking-tight">
                  {completedJobs.length} Tasks
                </strong>
                <span className="text-xs text-text-secondary mt-1 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success"></span> Availability active
                </span>
              </div>
            </Card>

            {/* Performance index */}
            <Card className="flex items-center gap-5 p-8 shadow-soft border-border-light rounded-[24px] hover:shadow-elevated transition-shadow">
              <div className="w-16 h-16 rounded-[20px] bg-yellow-50 text-yellow-500 flex items-center justify-center shrink-0 border border-yellow-100 shadow-sm">
                <Award size={28} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1.5">
                  Quality Score
                </span>
                <strong className="text-3xl text-gray-900 font-extrabold font-outfit tracking-tight">
                  {user?.providerDetails?.rating || '5.0'} / 5.0
                </strong>
                <span className="text-xs text-text-secondary mt-1 font-medium">
                  Based on customer reviews
                </span>
              </div>
            </Card>
          </div>

          {/* Earnings ledger table */}
          <Card className="shadow-soft border-border-light rounded-[24px] overflow-hidden">
            <Card.Body className="p-0">
              <div className="p-8 border-b border-border-light bg-white">
                <h3 className="text-2xl font-extrabold text-gray-900 font-outfit tracking-tight">
                  Historical Ledger
                </h3>
              </div>

              {completedJobs.length === 0 ? (
                <div className="text-center p-16 text-text-secondary font-medium">
                  No completed bookings payout ledger found.
                </div>
              ) : (
                <div className="overflow-x-auto bg-white">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-bg-secondary border-b border-border-light">
                      <tr>
                        <th className="px-8 py-5 font-bold text-gray-900 uppercase tracking-widest text-[10px]">
                          Billing Date
                        </th>
                        <th className="px-8 py-5 font-bold text-gray-900 uppercase tracking-widest text-[10px]">
                          Service Category
                        </th>
                        <th className="px-8 py-5 font-bold text-gray-900 uppercase tracking-widest text-[10px]">
                          Customer
                        </th>
                        <th className="px-8 py-5 font-bold text-gray-900 uppercase tracking-widest text-[10px]">
                          Gross Total
                        </th>
                        <th className="px-8 py-5 font-bold text-primary uppercase tracking-widest text-[10px] text-right">
                          Your Share (80%)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light">
                      {completedJobs.map((job) => (
                        <tr key={job._id} className="hover:bg-bg-secondary/50 transition-colors">
                          <td className="px-8 py-5 text-gray-900 font-medium">
                            {formatDate(job.scheduledDate)}
                          </td>
                          <td className="px-8 py-5 font-extrabold text-gray-900">
                            {job.service?.name}
                          </td>
                          <td className="px-8 py-5 text-gray-900 font-medium">
                            {job.customer?.name}
                          </td>
                          <td className="px-8 py-5 text-text-secondary font-bold">
                            ₹{job.totalAmount}
                          </td>
                          <td className="px-8 py-5 font-extrabold text-gray-900 text-right text-base">
                            +₹{Math.round(job.totalAmount * 0.8)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};

export default ProviderEarnings;
