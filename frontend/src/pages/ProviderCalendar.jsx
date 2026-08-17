import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/apiClient';
import { AuthContext } from '../context/AuthContext';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Ban,
  Save,
  Plus,
  Trash2,
  CalendarCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import RetryState from '../components/ui/RetryState';

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

export const ProviderCalendar = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'working_hours' | 'blocked_dates'

  // Bookings State
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected Date Filter in Calendar View
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Availability Settings State
  const [isAvailable, setIsAvailable] = useState(true);
  const [workingHours, setWorkingHours] = useState({
    monday: { isEnabled: true, startTime: '09:00', endTime: '18:00' },
    tuesday: { isEnabled: true, startTime: '09:00', endTime: '18:00' },
    wednesday: { isEnabled: true, startTime: '09:00', endTime: '18:00' },
    thursday: { isEnabled: true, startTime: '09:00', endTime: '18:00' },
    friday: { isEnabled: true, startTime: '09:00', endTime: '18:00' },
    saturday: { isEnabled: true, startTime: '09:00', endTime: '18:00' },
    sunday: { isEnabled: false, startTime: '09:00', endTime: '18:00' }
  });
  const [breakHours, setBreakHours] = useState({
    isEnabled: true,
    startTime: '13:00',
    endTime: '14:00'
  });
  const [blockedDates, setBlockedDates] = useState([]);

  // Block Date Form Input State
  const [blockDateInput, setBlockDateInput] = useState('');
  const [blockReasonInput, setBlockReasonInput] = useState('Personal Leave');
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [bookingsRes, availabilityRes] = await Promise.all([
        apiClient.get('/bookings/my'),
        apiClient.get('/bookings/availability/me')
      ]);

      setBookings(bookingsRes.data.data.bookings || []);

      const availData = availabilityRes.data.data;
      setIsAvailable(availData.isAvailable ?? true);
      if (availData.workingHours && Object.keys(availData.workingHours).length > 0) {
        setWorkingHours((prev) => ({ ...prev, ...availData.workingHours }));
      }
      if (availData.breakHours) {
        setBreakHours((prev) => ({ ...prev, ...availData.breakHours }));
      }
      setBlockedDates(availData.blockedDates || []);
    } catch (err) {
      console.error('Error fetching calendar & availability data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save Working & Break Hours to Backend
  const handleSaveAvailability = async () => {
    setSaveLoading(true);
    try {
      await apiClient.put('/bookings/availability/me', {
        isAvailable,
        workingHours,
        breakHours,
        blockedDates
      });
      alert('Working hours & break settings updated successfully in database!');
      fetchData();
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to save availability settings.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Add Blocked Date
  const handleAddBlockedDate = async (e) => {
    e.preventDefault();
    if (!blockDateInput) {
      alert('Please select a date to block.');
      return;
    }

    if (blockedDates.some((b) => b.date === blockDateInput)) {
      alert('This date is already blocked.');
      return;
    }

    // Check if existing bookings exist on this blocked date
    const conflictingBookings = bookings.filter((b) => {
      const bDate = new Date(b.scheduledDate).toISOString().split('T')[0];
      return bDate === blockDateInput && b.status !== 'cancelled';
    });

    if (conflictingBookings.length > 0) {
      if (
        !window.confirm(
          `Warning: You have ${conflictingBookings.length} existing booking(s) on ${blockDateInput}. Blocking this date will prevent NEW bookings, but existing bookings will NOT be cancelled. Proceed?`
        )
      ) {
        return;
      }
    }

    const updatedBlocked = [...blockedDates, { date: blockDateInput, reason: blockReasonInput.trim() || 'Personal Leave' }];
    setBlockedDates(updatedBlocked);
    setBlockDateInput('');

    try {
      await apiClient.put('/bookings/availability/me', { blockedDates: updatedBlocked });
      alert(`Date ${blockDateInput} blocked successfully.`);
      fetchData();
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to block date.');
    }
  };

  // Remove Blocked Date
  const handleRemoveBlockedDate = async (dateStr) => {
    const updatedBlocked = blockedDates.filter((b) => b.date !== dateStr);
    setBlockedDates(updatedBlocked);
    try {
      await apiClient.put('/bookings/availability/me', { blockedDates: updatedBlocked });
      alert(`Unblocked ${dateStr}.`);
      fetchData();
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to unblock date.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter Bookings by Selected Date
  const dateBookings = bookings.filter((b) => {
    const bDate = new Date(b.scheduledDate).toISOString().split('T')[0];
    return bDate === selectedDate;
  });

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-[28px] border border-border-light shadow-soft">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 font-outfit tracking-tight">
            Calendar & Working Hours
          </h1>
          <p className="text-text-secondary font-medium text-sm sm:text-base mt-1">
            Manage your daily working schedules, break times, blocked leave dates, and view scheduled customer appointments.
          </p>
        </div>

        <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200 shrink-0">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'calendar' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Appointments Calendar
          </button>
          <button
            onClick={() => setActiveTab('working_hours')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'working_hours' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Working & Break Hours
          </button>
          <button
            onClick={() => setActiveTab('blocked_dates')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'blocked_dates' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Blocked Dates ({blockedDates.length})
          </button>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-[24px]" />
      ) : error ? (
        <RetryState error={error} onRetry={fetchData} />
      ) : (
        <div>
          {/* TAB 1: Appointments Calendar View */}
          {activeTab === 'calendar' && (
            <div className="flex flex-col gap-6">
              {/* Date Filter Selection Bar */}
              <Card className="p-6 bg-white border border-gray-200 rounded-[24px] shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CalendarIcon size={22} className="text-primary" />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary block">
                      Select Date to Inspect
                    </span>
                    <strong className="text-lg font-extrabold text-gray-900 font-outfit">
                      {new Date(selectedDate).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <Button
                    onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                    variant="secondary"
                    size="sm"
                    className="rounded-xl font-bold"
                  >
                    Today
                  </Button>
                </div>
              </Card>

              {/* Bookings for Selected Date */}
              {dateBookings.length === 0 ? (
                <EmptyState
                  title="No Bookings Scheduled for this Date"
                  description={`You have no service appointments scheduled for ${selectedDate}.`}
                />
              ) : (
                <div className="flex flex-col gap-4">
                  {dateBookings.map((job) => (
                    <Card
                      key={job._id}
                      className={`p-6 bg-white border-l-[6px] rounded-[24px] shadow-soft ${
                        job.status === 'completed'
                          ? 'border-l-emerald-500'
                          : job.status === 'in_progress' || job.status === 'on_the_way'
                          ? 'border-l-primary'
                          : job.status === 'accepted'
                          ? 'border-l-blue-500'
                          : 'border-l-amber-500'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <strong className="text-xl font-extrabold text-gray-900 font-outfit">
                              {job.service?.name}
                            </strong>
                            <Badge variant={job.status === 'completed' ? 'success' : 'info'}>
                              {job.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <span className="text-xs text-text-secondary font-bold block mt-1">
                            Customer: {job.customer?.name} ({job.customer?.phone}) • Time:{' '}
                            {new Date(job.scheduledDate).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className="text-xs text-gray-500 block mt-0.5">
                            Location: {job.address?.street}, {job.address?.city}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-text-secondary font-bold block uppercase">
                            Net Earnings
                          </span>
                          <strong className="text-2xl text-emerald-600 font-extrabold font-outfit">
                            ₹{Math.round((job.totalAmount || 0) * 0.8)}
                          </strong>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Working & Break Hours Manager */}
          {activeTab === 'working_hours' && (
            <div className="flex flex-col gap-8">
              {/* Working Hours Settings */}
              <Card className="p-6 sm:p-8 bg-white border border-gray-200 rounded-[28px] shadow-soft">
                <div className="flex justify-between items-center pb-6 mb-6 border-b border-gray-100">
                  <div>
                    <h3 className="text-2xl font-extrabold text-gray-900 font-outfit">
                      Weekly Working Hours
                    </h3>
                    <p className="text-xs text-text-secondary font-medium mt-0.5">
                      Enable or disable days of the week and define your custom operating hours.
                    </p>
                  </div>
                  <Button
                    onClick={handleSaveAvailability}
                    loading={saveLoading}
                    variant="primary"
                    icon={<Save size={18} />}
                    className="rounded-xl px-6 py-3 font-bold shadow-md"
                  >
                    Save Changes
                  </Button>
                </div>

                <div className="flex flex-col gap-4">
                  {DAYS_OF_WEEK.map((day) => {
                    const config = workingHours[day.key] || { isEnabled: true, startTime: '09:00', endTime: '18:00' };
                    return (
                      <div
                        key={day.key}
                        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border transition-all ${
                          config.isEnabled ? 'bg-gray-50 border-gray-200' : 'bg-gray-100/60 border-gray-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-4 w-40 mb-2 sm:mb-0">
                          <input
                            type="checkbox"
                            checked={config.isEnabled}
                            onChange={(e) =>
                              setWorkingHours({
                                ...workingHours,
                                [day.key]: { ...config, isEnabled: e.target.checked }
                              })
                            }
                            className="w-5 h-5 accent-primary rounded cursor-pointer"
                          />
                          <strong className="text-sm font-bold text-gray-900">{day.label}</strong>
                        </div>

                        {config.isEnabled ? (
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-gray-500">From</span>
                            <input
                              type="time"
                              value={config.startTime}
                              onChange={(e) =>
                                setWorkingHours({
                                  ...workingHours,
                                  [day.key]: { ...config, startTime: e.target.value }
                                })
                              }
                              className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-900"
                            />
                            <span className="text-xs font-semibold text-gray-500">To</span>
                            <input
                              type="time"
                              value={config.endTime}
                              onChange={(e) =>
                                setWorkingHours({
                                  ...workingHours,
                                  [day.key]: { ...config, endTime: e.target.value }
                                })
                              }
                              className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-900"
                            />
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Day Off (Disabled)
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Break Hours Settings */}
              <Card className="p-6 sm:p-8 bg-white border border-gray-200 rounded-[28px] shadow-soft">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900 font-outfit">
                      Daily Break Time (e.g. Lunch)
                    </h3>
                    <p className="text-xs text-text-secondary font-medium mt-0.5">
                      Customers will not be offered booking slots during your break time.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={breakHours.isEnabled}
                      onChange={(e) => setBreakHours({ ...breakHours, isEnabled: e.target.checked })}
                      className="w-5 h-5 accent-primary rounded cursor-pointer"
                    />
                    <span className="text-xs font-bold text-gray-900">Enable Daily Break</span>
                  </div>
                </div>

                {breakHours.isEnabled && (
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200 max-w-md">
                    <span className="text-xs font-bold text-gray-700">Break Hours:</span>
                    <input
                      type="time"
                      value={breakHours.startTime}
                      onChange={(e) => setBreakHours({ ...breakHours, startTime: e.target.value })}
                      className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-900"
                    />
                    <span className="text-xs text-gray-500">to</span>
                    <input
                      type="time"
                      value={breakHours.endTime}
                      onChange={(e) => setBreakHours({ ...breakHours, endTime: e.target.value })}
                      className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-900"
                    />
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* TAB 3: Block Specific Dates */}
          {activeTab === 'blocked_dates' && (
            <div className="flex flex-col gap-8">
              {/* Form to Block New Date */}
              <Card className="p-6 sm:p-8 bg-white border border-gray-200 rounded-[28px] shadow-soft">
                <h3 className="text-2xl font-extrabold text-gray-900 font-outfit mb-2">
                  Block a Specific Date for Leave / Holiday
                </h3>
                <p className="text-xs text-text-secondary font-medium mb-6">
                  Select a future date to mark yourself unavailable for new customer bookings.
                </p>

                <form onSubmit={handleAddBlockedDate} className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-900 mb-1.5">
                      Select Date to Block *
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={blockDateInput}
                      onChange={(e) => setBlockDateInput(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-900 mb-1.5">
                      Reason for Leave
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Personal Leave, Holiday, Family Function"
                      value={blockReasonInput}
                      onChange={(e) => setBlockReasonInput(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    icon={<Ban size={18} />}
                    className="rounded-xl px-6 py-3 font-bold shadow-md shrink-0 w-full sm:w-auto"
                  >
                    Block Date
                  </Button>
                </form>
              </Card>

              {/* List of Blocked Dates */}
              <Card className="p-6 sm:p-8 bg-white border border-gray-200 rounded-[28px] shadow-soft">
                <h3 className="text-xl font-extrabold text-gray-900 font-outfit mb-4">
                  Currently Blocked Dates ({blockedDates.length})
                </h3>

                {blockedDates.length === 0 ? (
                  <p className="text-sm text-text-secondary font-medium">
                    No dates blocked. You are operating normally on all configured working days.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {blockedDates.map((b, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-red-50/60 p-4 rounded-2xl border border-red-100 text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <Ban size={18} className="text-red-600" />
                          <div>
                            <strong className="text-gray-900 font-extrabold">
                              {new Date(b.date).toLocaleDateString('en-IN', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </strong>
                            <span className="text-xs text-red-700 font-medium block">
                              Reason: {b.reason}
                            </span>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleRemoveBlockedDate(b.date)}
                          variant="secondary"
                          size="sm"
                          className="rounded-xl font-bold text-red-600 border-red-200 hover:bg-red-100"
                        >
                          Unblock Date
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProviderCalendar;
