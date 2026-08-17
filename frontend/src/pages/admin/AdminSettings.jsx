import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import {
  Settings,
  Shield,
  Lock,
  Mail,
  Phone,
  Percent,
  AlertTriangle,
  CheckCircle2,
  Save,
  User
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import RetryState from '../../components/ui/RetryState';

export const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // Platform Settings Form State
  const [platformCommission, setPlatformCommission] = useState(20);
  const [cancellationFeePercent, setCancellationFeePercent] = useState(10);
  const [emergencyServiceFee, setEmergencyServiceFee] = useState(150);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [contactSupportEmail, setContactSupportEmail] = useState('');
  const [contactSupportPhone, setContactSupportPhone] = useState('');

  // Admin Profile Update Form State
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsRes, profileRes] = await Promise.all([
        apiClient.get('/admin/settings'),
        apiClient.get('/auth/me')
      ]);

      const s = settingsRes.data.data.settings;
      setPlatformCommission(s.platformCommission || 20);
      setCancellationFeePercent(s.cancellationFeePercent || 10);
      setEmergencyServiceFee(s.emergencyServiceFee || 150);
      setMaintenanceMode(s.maintenanceMode || false);
      setContactSupportEmail(s.contactSupportEmail || 'support@homeease.com');
      setContactSupportPhone(s.contactSupportPhone || '+91 98765 43210');

      const u = profileRes.data.data.user;
      setAdminName(u.name || '');
      setAdminEmail(u.email || '');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await apiClient.put('/admin/settings', {
        platformCommission,
        cancellationFeePercent,
        emergencyServiceFee,
        maintenanceMode,
        contactSupportEmail,
        contactSupportPhone
      });
      alert('Platform settings saved to database.');
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to update settings.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await apiClient.put('/admin/profile', {
        name: adminName,
        email: adminEmail,
        password: newPassword || undefined
      });
      alert('Admin profile and security credentials updated successfully.');
      setNewPassword('');
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to update admin profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto py-6">
        <Skeleton className="h-64 w-full rounded-[24px]" />
        <Skeleton className="h-64 w-full rounded-[24px]" />
      </div>
    );
  }

  if (error) {
    return <RetryState error={error} onRetry={fetchSettings} />;
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full py-4 sm:py-6">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 font-outfit tracking-tight">
          System Settings & Security
        </h1>
        <p className="text-text-secondary font-medium text-sm sm:text-base mt-1">
          Configure marketplace commission rules, platform parameters, and manage administrator security.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1: Platform Global Config */}
        <Card className="shadow-soft border-border-light rounded-[24px] p-6 sm:p-8 bg-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-primary flex items-center justify-center border border-teal-100 shadow-sm">
              <Settings size={20} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 font-outfit">
                Marketplace Config
              </h3>
              <p className="text-xs text-text-secondary font-medium">
                Persisted in database & enforced across application
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Platform Commission Cut (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={platformCommission}
                onChange={(e) => setPlatformCommission(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Cancellation Fee Percent (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={cancellationFeePercent}
                onChange={(e) => setCancellationFeePercent(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Support Email Address
              </label>
              <input
                type="email"
                value={contactSupportEmail}
                onChange={(e) => setContactSupportEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Support Contact Phone
              </label>
              <input
                type="text"
                value={contactSupportPhone}
                onChange={(e) => setContactSupportPhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-2xl border border-amber-100 mt-2">
              <div>
                <strong className="text-sm font-bold text-gray-900 block">Maintenance Mode</strong>
                <span className="text-xs text-text-secondary">Temporarily restrict new bookings</span>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-5 h-5 rounded accent-primary cursor-pointer"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={saveLoading}
              icon={<Save size={16} />}
              className="mt-4 rounded-xl font-bold py-3.5 shadow-md"
            >
              Save System Settings
            </Button>
          </form>
        </Card>

        {/* Card 2: Admin Profile & Password Security */}
        <Card className="shadow-soft border-border-light rounded-[24px] p-6 sm:p-8 bg-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 font-outfit">
                Admin Profile & Password
              </h3>
              <p className="text-xs text-text-secondary font-medium">
                Update account details and security password
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Admin Full Name
              </label>
              <input
                type="text"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Change Password
              </label>
              <input
                type="password"
                placeholder="Leave blank to keep current password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={profileLoading}
              icon={<Lock size={16} />}
              className="mt-6 rounded-xl font-bold py-3.5 bg-gray-900 hover:bg-black text-white shadow-md"
            >
              Update Security Credentials
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
