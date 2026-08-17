import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/apiClient';
import { AuthContext } from '../context/AuthContext';
import {
  IndianRupee,
  Building,
  CreditCard,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Eye,
  Plus,
  RefreshCw,
  Info
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import RetryState from '../components/ui/RetryState';

export const ProviderPayouts = () => {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({
    totalNetEarnings: 0,
    availableBalance: 0,
    pendingBalance: 0,
    totalPaidOut: 0,
    failedPayoutAmount: 0,
    lastPayoutDate: null,
    lastPayoutAmount: 0,
    maskedAccountText: 'No account configured'
  });

  const [payoutAccount, setPayoutAccount] = useState({
    accountType: 'bank_account',
    accountHolderName: '',
    bankName: '',
    accountNumberMasked: '',
    ifscCode: '',
    upiIdMasked: ''
  });

  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Request Payout Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState('');

  // Account Settings Modal State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountType, setAccountType] = useState('bank_account');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState('');

  // Details Modal State
  const [selectedPayout, setSelectedPayout] = useState(null);

  const fetchPayoutData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/bookings/provider-payouts');
      const data = res.data.data;
      setStats(data.stats || {});
      setPayoutAccount(data.payoutAccount || {});
      setPayouts(data.payouts || []);
    } catch (err) {
      console.error('Error fetching provider payouts:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayoutData();
  }, []);

  const openAccountModal = () => {
    setAccountType(payoutAccount.accountType || 'bank_account');
    setAccountHolderName(payoutAccount.accountHolderName || user?.name || '');
    setBankName(payoutAccount.bankName || '');
    setAccountNumber('');
    setIfscCode(payoutAccount.ifscCode || '');
    setUpiId('');
    setAccountError('');
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setAccountError('');
    setAccountLoading(true);

    try {
      await apiClient.put('/bookings/provider-payouts/account', {
        accountType,
        accountHolderName: accountHolderName.trim(),
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim(),
        upiId: upiId.trim()
      });
      alert('Payout destination account updated successfully!');
      setIsAccountModalOpen(false);
      fetchPayoutData();
    } catch (err) {
      setAccountError(err.friendlyMessage || 'Failed to save payout account.');
    } finally {
      setAccountLoading(false);
    }
  };

  const openRequestModal = () => {
    setRequestAmount(stats.availableBalance ? stats.availableBalance.toString() : '');
    setRequestError('');
    setIsRequestModalOpen(true);
  };

  const handleSubmitPayoutRequest = async (e) => {
    e.preventDefault();
    setRequestError('');

    const amt = Number(requestAmount);
    if (isNaN(amt) || amt <= 0) {
      return setRequestError('Please enter a valid amount greater than 0.');
    }
    if (amt > stats.availableBalance) {
      return setRequestError(`Payout amount cannot exceed available balance (₹${stats.availableBalance}).`);
    }

    setRequestLoading(true);
    try {
      const res = await apiClient.post('/bookings/provider-payouts/request', {
        amount: amt
      });
      alert(res.data.message || 'Payout request submitted successfully!');
      setIsRequestModalOpen(false);
      fetchPayoutData();
    } catch (err) {
      setRequestError(err.friendlyMessage || 'Failed to submit payout request.');
    } finally {
      setRequestLoading(false);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-[28px] border border-border-light shadow-soft">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 font-outfit tracking-tight">
            Payout Management
          </h1>
          <p className="text-text-secondary font-medium text-sm sm:text-base mt-1">
            Withdraw your completed net earnings, configure bank accounts, and track payout statuses.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={openAccountModal}
            variant="secondary"
            icon={<Building size={18} />}
            className="rounded-2xl px-5 py-3 font-bold"
          >
            Manage Payout Account
          </Button>

          <Button
            onClick={openRequestModal}
            disabled={stats.availableBalance <= 0}
            variant="primary"
            icon={<Send size={18} />}
            className="rounded-2xl px-6 py-3 font-bold shadow-md"
          >
            Request Payout
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-36 w-full rounded-[24px]" />
          <Skeleton className="h-36 w-full rounded-[24px]" />
          <Skeleton className="h-36 w-full rounded-[24px]" />
          <Skeleton className="h-36 w-full rounded-[24px]" />
        </div>
      ) : error ? (
        <RetryState error={error} onRetry={fetchPayoutData} />
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Available Balance */}
            <Card className="p-6 bg-white border border-border-light rounded-[24px] shadow-soft flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Available Balance
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <IndianRupee size={20} />
                </div>
              </div>
              <strong className="text-3xl text-emerald-600 font-extrabold font-outfit block">
                ₹{stats.availableBalance}
              </strong>
              <span className="text-xs text-emerald-700 font-bold mt-2 block">
                Ready for withdrawal
              </span>
            </Card>

            {/* Pending Payout Requests */}
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
                ₹{stats.pendingBalance}
              </strong>
              <span className="text-xs text-amber-700 font-bold mt-2 block">
                Under admin processing
              </span>
            </Card>

            {/* Total Paid Out */}
            <Card className="p-6 bg-white border border-border-light rounded-[24px] shadow-soft flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Total Paid Out
                </span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <strong className="text-3xl text-gray-900 font-extrabold font-outfit block">
                ₹{stats.totalPaidOut}
              </strong>
              <span className="text-xs text-gray-500 font-semibold mt-2 block">
                Settled to your account
              </span>
            </Card>

            {/* Payout Destination Account */}
            <Card className="p-6 bg-white border border-border-light rounded-[24px] shadow-soft flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Destination Account
                </span>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-primary flex items-center justify-center border border-teal-100">
                  <Building size={18} />
                </div>
              </div>
              <strong className="text-sm text-gray-900 font-bold block truncate">
                {stats.maskedAccountText}
              </strong>
              <button
                onClick={openAccountModal}
                className="text-xs text-primary font-bold hover:underline mt-2 text-left"
              >
                Change Destination →
              </button>
            </Card>
          </div>

          {/* Payout History Ledger */}
          <Card className="shadow-soft border-border-light rounded-[26px] overflow-hidden bg-white">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-2xl font-extrabold text-gray-900 font-outfit">
                Payout Request History ({payouts.length})
              </h3>
              <p className="text-xs text-text-secondary font-medium mt-0.5">
                Track status updates on your payout withdrawal requests.
              </p>
            </div>

            {payouts.length === 0 ? (
              <EmptyState
                title="No payouts requested yet"
                description="When you request withdrawals from your available earnings balance, payout records will appear here."
                action={
                  <Button
                    onClick={openRequestModal}
                    disabled={stats.availableBalance <= 0}
                    variant="primary"
                    icon={<Send size={16} />}
                  >
                    Request First Payout
                  </Button>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-700">
                        Payout ID
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-700">
                        Requested Date
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-700">
                        Destination Account
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-700">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right text-gray-700">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payouts.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-gray-900 text-xs">
                          #{p.payoutId}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 text-xs">
                          {formatDate(p.createdAt)}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-700 text-xs">
                          {p.destinationAccount?.bankName || 'Bank'} (
                          {p.destinationAccount?.accountNumberMasked || 'UPI'})
                        </td>
                        <td className="px-6 py-4 font-extrabold text-gray-900 text-sm">
                          ₹{p.amount}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              p.status === 'completed'
                                ? 'success'
                                : p.status === 'failed' || p.status === 'cancelled'
                                ? 'error'
                                : 'warning'
                            }
                            className="uppercase text-[10px] font-bold"
                          >
                            {p.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            onClick={() => setSelectedPayout(p)}
                            variant="secondary"
                            size="sm"
                            icon={<Eye size={14} />}
                            className="rounded-xl font-bold text-xs"
                          >
                            Receipt
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

      {/* Request Payout Modal */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Request Payout Withdrawal"
      >
        <form onSubmit={handleSubmitPayoutRequest} className="flex flex-col gap-5 p-2">
          {requestError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} /> {requestError}
            </div>
          )}

          <div className="bg-teal-50 p-4 rounded-2xl border border-teal-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-primary font-bold uppercase tracking-wider block">
                Available Balance
              </span>
              <strong className="text-2xl text-gray-900 font-extrabold font-outfit">
                ₹{stats.availableBalance}
              </strong>
            </div>
            <Badge variant="info" className="font-bold">
              Ready to withdraw
            </Badge>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wider">
              Enter Payout Amount (₹) *
            </label>
            <input
              type="number"
              required
              min="1"
              max={stats.availableBalance}
              placeholder="e.g. 5000"
              value={requestAmount}
              onChange={(e) => setRequestAmount(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs text-text-secondary flex items-start gap-2">
            <Info size={16} className="text-primary mt-0.5 shrink-0" />
            <span>
              Destination: <strong className="text-gray-900 font-bold">{stats.maskedAccountText}</strong>. Payout request will be verified and processed by HomeEase administration.
            </span>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsRequestModalOpen(false)}
              className="rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={requestLoading}
              className="rounded-xl font-bold shadow-md"
            >
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Account Settings Modal */}
      <Modal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        title="Configure Payout Destination Account"
      >
        <form onSubmit={handleSaveAccount} className="flex flex-col gap-5 p-2">
          {accountError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} /> {accountError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wider">
              Payout Destination Method
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 bg-gray-50 border p-3 rounded-xl cursor-pointer font-bold text-xs flex-1">
                <input
                  type="radio"
                  name="accType"
                  value="bank_account"
                  checked={accountType === 'bank_account'}
                  onChange={() => setAccountType('bank_account')}
                  className="accent-primary"
                />
                Bank Account
              </label>

              <label className="flex items-center gap-2 bg-gray-50 border p-3 rounded-xl cursor-pointer font-bold text-xs flex-1">
                <input
                  type="radio"
                  name="accType"
                  value="upi"
                  checked={accountType === 'upi'}
                  onChange={() => setAccountType('upi')}
                  className="accent-primary"
                />
                UPI ID
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wider">
              Account Holder Name *
            </label>
            <input
              type="text"
              required
              placeholder="Full Name as registered in Bank"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {accountType === 'bank_account' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wider">
                  Bank Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Bank / ICICI Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wider">
                    Account Number *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter Account Number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wider">
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC0001234"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wider">
                UPI ID *
              </label>
              <input
                type="text"
                required
                placeholder="username@upi / mobile@paytm"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAccountModalOpen(false)}
              className="rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={accountLoading}
              className="rounded-xl font-bold shadow-md"
            >
              Save Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Payout Details Modal */}
      {selectedPayout && (
        <Modal
          isOpen={!!selectedPayout}
          onClose={() => setSelectedPayout(null)}
          title="Payout Withdrawal Receipt"
        >
          <div className="flex flex-col gap-6 p-2">
            <div className="flex justify-between items-start pb-4 border-b border-gray-100">
              <div>
                <strong className="text-2xl font-extrabold text-gray-900 font-outfit">
                  #{selectedPayout.payoutId}
                </strong>
                <span className="text-xs text-text-secondary block mt-0.5 font-medium">
                  Requested on {formatDate(selectedPayout.createdAt)}
                </span>
              </div>
              <Badge variant={selectedPayout.status === 'completed' ? 'success' : 'warning'}>
                {selectedPayout.status.toUpperCase()}
              </Badge>
            </div>

            <div className="bg-teal-50/60 p-5 rounded-2xl border border-teal-100 flex justify-between items-center">
              <div>
                <span className="text-xs text-primary font-bold uppercase tracking-wider block">
                  Payout Amount
                </span>
                <strong className="text-3xl text-gray-900 font-extrabold font-outfit">
                  ₹{selectedPayout.amount}
                </strong>
              </div>
              <span className="text-xs text-gray-600 font-bold">
                Method: {selectedPayout.destinationAccount?.accountType === 'upi' ? 'UPI' : 'Bank Transfer'}
              </span>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
              <span className="text-gray-500 font-bold block uppercase text-[10px] mb-1">
                Destination Account
              </span>
              <strong className="text-gray-900 font-bold text-sm block">
                {selectedPayout.destinationAccount?.bankName} (
                {selectedPayout.destinationAccount?.accountNumberMasked || selectedPayout.destinationAccount?.upiIdMasked})
              </strong>
              <span className="text-gray-500 block mt-0.5">
                Holder: {selectedPayout.destinationAccount?.accountHolderName}
              </span>
            </div>

            {selectedPayout.failureReason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold">
                Failure Reason: {selectedPayout.failureReason}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button
                variant="secondary"
                onClick={() => setSelectedPayout(null)}
                className="rounded-xl font-bold"
              >
                Close Receipt
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProviderPayouts;
