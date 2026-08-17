import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import {
  Bell,
  Send,
  Users,
  User,
  Briefcase,
  Globe,
  Clock,
  CheckCircle2
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import RetryState from '../../components/ui/RetryState';
import Button from '../../components/ui/Button';

export const NotificationsManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [targetType, setTargetType] = useState('broadcast');
  const [targetId, setTargetId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sendLoading, setSendLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/admin/notifications');
      setNotifications(res.data.data.notifications || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Please enter title and message.');
      return;
    }

    setSendLoading(true);
    try {
      const res = await apiClient.post('/admin/notifications', {
        targetType,
        targetId,
        title,
        message
      });
      alert(res.data.message || 'Notification sent successfully.');
      setTitle('');
      setMessage('');
      setTargetId('');
      fetchNotifications();
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to dispatch notification.');
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full py-4 sm:py-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 font-outfit tracking-tight">
          In-App Notifications System
        </h1>
        <p className="text-text-secondary font-medium text-sm sm:text-base mt-1">
          Compose and dispatch real-time targeted or broadcast announcements to customers and service providers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
        {/* Left Column: Sent Notifications Trail */}
        <Card className="shadow-soft border-border-light rounded-[24px] overflow-hidden bg-white">
          <Card.Header className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-gray-900 font-outfit">
              Sent Notification History
            </h3>
            <Badge variant="primary">{notifications.length} Sent</Badge>
          </Card.Header>

          {loading ? (
            <div className="p-6">
              <Skeleton className="h-16 w-full mb-3 rounded-xl" />
              <Skeleton className="h-16 w-full mb-3 rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : error ? (
            <RetryState error={error} onRetry={fetchNotifications} />
          ) : notifications.length === 0 ? (
            <EmptyState
              title="No Notifications Sent"
              description="No system notifications have been recorded in the database yet."
            />
          ) : (
            <div className="divide-y divide-gray-100 max-h-[650px] overflow-y-auto">
              {notifications.map((n) => (
                <div key={n._id} className="p-5 flex flex-col gap-2 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-gray-900 text-base">{n.title}</span>
                    <span className="text-xs text-text-secondary font-medium">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary font-medium leading-relaxed">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase font-bold text-primary bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                      Recipient: {n.recipient?.name || 'User'} ({n.recipient?.role || 'user'})
                    </span>
                    <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                      Type: {n.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Right Column: Compose Notification Box */}
        <Card className="shadow-soft border-border-light rounded-[24px] p-6 bg-white sticky top-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-primary flex items-center justify-center border border-teal-100 shadow-sm">
              <Send size={20} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 font-outfit">
                Compose Notification
              </h3>
              <p className="text-xs text-text-secondary font-medium">
                Dispatches real-time socket + database alert
              </p>
            </div>
          </div>

          <form onSubmit={handleSendNotification} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Target Audience
              </label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="broadcast">Broadcast to All Users</option>
                <option value="customers">All Customers Only</option>
                <option value="providers">All Service Providers Only</option>
                <option value="user">Specific User ID</option>
              </select>
            </div>

            {targetType === 'user' && (
              <Input
                label="Target User ID"
                type="text"
                required
                placeholder="Enter Mongoose User ID..."
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                wrapperClassName="mb-0"
              />
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Notification Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Platform Maintenance Notice..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Message Body
              </label>
              <textarea
                required
                rows="4"
                placeholder="Type your message content here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
              ></textarea>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={sendLoading}
              icon={<Send size={16} />}
              className="w-full mt-2 rounded-xl font-bold py-3.5 shadow-md"
            >
              Dispatch Notification
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default NotificationsManagement;
