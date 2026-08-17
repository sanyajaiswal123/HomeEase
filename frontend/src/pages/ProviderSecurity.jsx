import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { AuthContext } from '../context/AuthContext';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  ShieldAlert,
  Smartphone,
  Eye,
  EyeOff
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';

export const ProviderSecurity = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // Account Deactivation Modal State
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [deactivateReason, setDeactivateReason] = useState('');
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [deactivateError, setDeactivateError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      return setPassError('Please complete all password fields.');
    }
    if (newPassword !== confirmPassword) {
      return setPassError('New password and confirmation password do not match.');
    }
    if (newPassword.length < 6) {
      return setPassError('New password must be at least 6 characters long.');
    }

    setPassLoading(true);
    try {
      const res = await apiClient.put('/auth/update-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });

      setPassSuccess(res.data.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassError(err.friendlyMessage || 'Failed to update password.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleDeactivateAccount = async (e) => {
    e.preventDefault();
    setDeactivateError('');

    if (!deactivatePassword) {
      return setDeactivateError('Please enter your password to confirm deactivation.');
    }

    setDeactivateLoading(true);
    try {
      await apiClient.post('/auth/deactivate', {
        password: deactivatePassword,
        reason: deactivateReason
      });

      alert('Account deactivated. Logging out...');
      if (logout) logout();
      navigate('/');
    } catch (err) {
      setDeactivateError(err.friendlyMessage || 'Failed to deactivate account.');
    } finally {
      setDeactivateLoading(false);
    }
  };

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 font-outfit tracking-tight">
            Security & Account Management
          </h1>
          <p className="text-text-secondary font-medium text-sm sm:text-base mt-1">
            Manage your login credentials, token sessions, account protection, and password settings.
          </p>
        </div>

        <Button
          onClick={handleLogout}
          variant="secondary"
          icon={<LogOut size={18} className="text-red-600" />}
          className="rounded-2xl font-bold shadow-xs shrink-0 text-red-600 hover:bg-red-50"
        >
          Logout of Account
        </Button>
      </div>

      {/* Account Status Card */}
      <Card className="p-6 sm:p-8 bg-white border border-border-light rounded-[28px] shadow-soft">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-primary flex items-center justify-center shrink-0 border border-teal-100">
              <ShieldCheck size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-gray-900 font-outfit">
                  {user?.name}
                </h2>
                <Badge variant="success" className="uppercase font-extrabold text-[10px]">
                  Account Active & Secure
                </Badge>
              </div>
              <p className="text-xs text-text-secondary font-medium mt-1">
                Role: <strong className="text-gray-900 font-bold uppercase">Provider</strong> • Email: <strong className="text-gray-900 font-bold">{user?.email}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="info" className="font-bold text-xs px-3.5 py-1.5">
              JWT Authenticated
            </Badge>
          </div>
        </div>
      </Card>

      {/* Change Password Card */}
      <Card className="p-6 sm:p-8 bg-white border border-border-light rounded-[28px] shadow-soft flex flex-col gap-6">
        <h3 className="text-xl font-extrabold text-gray-900 font-outfit pb-4 border-b border-gray-100 flex items-center gap-2">
          <KeyRound size={20} className="text-primary" /> Password Security Management
        </h3>

        <form onSubmit={handleChangePassword} className="flex flex-col gap-6 max-w-xl">
          {passError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} /> {passError}
            </div>
          )}

          {passSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} /> {passSuccess}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
              Current Password *
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pr-11"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
              New Password * (Min 6 Characters)
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pr-11"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex justify-start">
            <Button
              type="submit"
              variant="primary"
              loading={passLoading}
              icon={<Lock size={18} />}
              className="rounded-2xl px-8 py-3.5 font-bold shadow-md"
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Session & Permission Audit */}
      <Card className="p-6 sm:p-8 bg-white border border-border-light rounded-[28px] shadow-soft flex flex-col gap-4">
        <h3 className="text-xl font-extrabold text-gray-900 font-outfit pb-3 border-b border-gray-100 flex items-center gap-2">
          <UserCheck size={20} className="text-primary" /> Active Role & Access Control Summary
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <span className="text-text-secondary font-semibold block mb-0.5">Role Permission Scope</span>
            <strong className="text-gray-900 font-extrabold block text-sm">Provider Panel Only</strong>
            <span className="text-gray-500 font-medium block mt-1">Blocked from Admin & Customer private routes.</span>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <span className="text-text-secondary font-semibold block mb-0.5">Password Protection</span>
            <strong className="text-emerald-700 font-extrabold block text-sm">Bcrypt Salt Hashed</strong>
            <span className="text-gray-500 font-medium block mt-1">Never stored or transmitted in plain text.</span>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <span className="text-text-secondary font-semibold block mb-0.5">Protected System Parameters</span>
            <strong className="text-gray-900 font-extrabold block text-sm">System Controlled</strong>
            <span className="text-gray-500 font-medium block mt-1">Role, Verification, and Ratings locked to Admin.</span>
          </div>
        </div>
      </Card>

      {/* Danger Zone: Deactivate Account */}
      <Card className="p-6 sm:p-8 bg-red-50/60 border border-red-200 rounded-[28px] shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0 border border-red-200">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-red-950 font-outfit">
              Deactivate Provider Account
            </h3>
            <p className="text-xs text-red-800 font-medium mt-0.5">
              Temporarily deactivate your provider profile. Historical bookings and financial records will remain archived.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsDeactivateModalOpen(true)}
          variant="secondary"
          className="rounded-2xl font-bold shadow-xs text-red-700 bg-white border-red-300 hover:bg-red-50 shrink-0"
        >
          Deactivate Account
        </Button>
      </Card>

      {/* Deactivate Account Modal */}
      <Modal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        title="Confirm Provider Account Deactivation"
      >
        <form onSubmit={handleDeactivateAccount} className="flex flex-col gap-4 p-2">
          {deactivateError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} /> {deactivateError}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-semibold">
            Warning: Deactivating your account will remove your provider profile from customer search. Historical bookings, earnings, and payouts will remain archived.
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
              Reason for Deactivation (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Taking a personal break"
              value={deactivateReason}
              onChange={(e) => setDeactivateReason(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
              Confirm Password *
            </label>
            <input
              type="password"
              required
              placeholder="Enter your current password"
              value={deactivatePassword}
              onChange={(e) => setDeactivatePassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeactivateModalOpen(false)}
              className="rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={deactivateLoading}
              className="rounded-xl font-bold bg-red-600 hover:bg-red-700 shadow-md"
            >
              Confirm Deactivation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProviderSecurity;
