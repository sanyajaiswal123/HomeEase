import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { AuthContext } from '../context/AuthContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  IndianRupee,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import RetryState from '../components/ui/RetryState';

export const ProviderNotifications = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter tab: 'all' | 'unread' | 'bookings' | 'payouts' | 'system'
  const [filterTab, setFilterTab] = useState('all');

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/notifications');
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await apiClient.delete(`/notifications/${id}`);
      setNotifications((prev) => {
        const deleted = prev.find((n) => n._id === id);
        if (deleted && !deleted.isRead) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n._id !== id);
      });
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }

    if (notification.link) {
      navigate(notification.link);
    } else if (notification.type.includes('booking')) {
      navigate('/provider-bookings');
    } else if (notification.type.includes('payout') || notification.type.includes('payment')) {
      navigate('/provider-payouts');
    } else if (notification.type.includes('verification')) {
      navigate('/provider-dashboard');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_booking':
      case 'booking_update':
      case 'booking_accepted':
      case 'booking_rejected':
      case 'booking_cancelled':
        return <Calendar size={20} className="text-primary" />;
      case 'payout_update':
      case 'payment_update':
      case 'refund_processed':
        return <IndianRupee size={20} className="text-emerald-600" />;
      case 'verification_approved':
      case 'verification_rejected':
        return <ShieldCheck size={20} className="text-blue-600" />;
      default:
        return <Bell size={20} className="text-amber-500" />;
    }
  };

  // Filtered Notifications List
  const filteredNotifications = notifications.filter((n) => {
    if (filterTab === 'unread') return !n.isRead;
    if (filterTab === 'bookings') return n.type.includes('booking');
    if (filterTab === 'payouts') return n.type.includes('payout') || n.type.includes('payment');
    if (filterTab === 'system') return n.type.includes('verification') || n.type === 'system';
    return true;
  });

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[28px] border border-border-light shadow-soft">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-outfit tracking-tight">
              Notification Center
            </h1>
            {unreadCount > 0 && (
              <Badge variant="error" className="font-extrabold px-3 py-1 text-xs animate-pulse">
                {unreadCount} Unread
              </Badge>
            )}
          </div>
          <p className="text-text-secondary font-medium text-sm mt-1">
            Real-time activity notifications for bookings, payouts, customer actions, and admin updates.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={fetchNotifications}
            variant="secondary"
            size="sm"
            icon={<RefreshCw size={14} />}
            className="rounded-xl font-bold"
          >
            Refresh
          </Button>

          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              variant="secondary"
              size="sm"
              icon={<CheckCheck size={14} />}
              className="rounded-xl font-bold text-primary border-primary/20"
            >
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white p-2 rounded-2xl border border-border-light shadow-soft overflow-x-auto gap-1">
        {[
          { id: 'all', label: `All Notifications (${notifications.length})` },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'bookings', label: 'Bookings' },
          { id: 'payouts', label: 'Earnings & Payouts' },
          { id: 'system', label: 'System & KYC' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterTab === tab.id
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-24 w-full rounded-[22px]" />
          <Skeleton className="h-24 w-full rounded-[22px]" />
          <Skeleton className="h-24 w-full rounded-[22px]" />
        </div>
      ) : error ? (
        <RetryState error={error} onRetry={fetchNotifications} />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          title="You're all caught up!"
          description={
            filterTab === 'unread'
              ? 'You have read all your notifications.'
              : 'When new bookings, status updates, payouts, or system announcements occur, they will appear here.'
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-5 rounded-[22px] border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                !notification.isRead
                  ? 'bg-teal-50/40 border-teal-200 shadow-soft hover:shadow-elevated'
                  : 'bg-white border-gray-200 opacity-90 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon Container */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                    !notification.isRead
                      ? 'bg-white border-teal-200 shadow-sm'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  {getNotificationIcon(notification.type)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-base font-extrabold text-gray-900 font-outfit">
                      {notification.title}
                    </strong>
                    {!notification.isRead && (
                      <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping inline-block" />
                    )}
                  </div>

                  <p className="text-xs text-gray-700 font-medium mt-1 leading-relaxed">
                    {notification.message}
                  </p>

                  <span className="text-[11px] text-text-secondary font-bold mt-2 flex items-center gap-1">
                    <Clock size={12} /> {formatDate(notification.createdAt)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {!notification.isRead && (
                  <button
                    title="Mark as read"
                    onClick={(e) => handleMarkAsRead(notification._id, e)}
                    className="p-2 rounded-xl text-gray-400 hover:text-primary hover:bg-teal-50 transition-colors"
                  >
                    <CheckCheck size={16} />
                  </button>
                )}

                <button
                  title="Delete notification"
                  onClick={(e) => handleDeleteNotification(notification._id, e)}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderNotifications;
