import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/apiClient';
import { AuthContext } from '../context/AuthContext';
import {
  Tag,
  Percent,
  Calendar,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  AlertCircle,
  Sparkles,
  DollarSign
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import RetryState from '../components/ui/RetryState';

export const ProviderOffers = () => {
  const { user } = useContext(AuthContext);

  const [offers, setOffers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search State
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'expired' | 'inactive'
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState(null);

  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' | 'fixed'
  const [discountValue, setDiscountValue] = useState('');
  const [minBookingAmount, setMinBookingAmount] = useState('0');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [usageLimit, setUsageLimit] = useState('100');
  const [isActive, setIsActive] = useState(true);

  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resOffers, resServices] = await Promise.all([
        apiClient.get('/offers/my', {
          params: { statusFilter, search }
        }),
        apiClient.get('/services/my')
      ]);

      setOffers(resOffers.data.data.offers || []);
      setServices(resServices.data.data.services || []);
    } catch (err) {
      console.error('Error fetching provider offers:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [statusFilter, search]);

  const openCreateModal = () => {
    setEditingOfferId(null);
    setTitle('');
    setCode('');
    setDescription('');
    setServiceId('');
    setDiscountType('percentage');
    setDiscountValue('10');
    setMinBookingAmount('0');

    const todayStr = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().split('T')[0];

    setStartDate(todayStr);
    setEndDate(nextMonthStr);
    setUsageLimit('100');
    setIsActive(true);
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (offer) => {
    setEditingOfferId(offer._id);
    setTitle(offer.title || '');
    setCode(offer.code || '');
    setDescription(offer.description || '');
    setServiceId(offer.service?._id || offer.service || '');
    setDiscountType(offer.discountType || 'percentage');
    setDiscountValue(offer.discountValue ? offer.discountValue.toString() : '');
    setMinBookingAmount(offer.minBookingAmount ? offer.minBookingAmount.toString() : '0');
    setStartDate(offer.startDate ? offer.startDate.split('T')[0] : '');
    setEndDate(offer.endDate ? offer.endDate.split('T')[0] : '');
    setUsageLimit(offer.usageLimit ? offer.usageLimit.toString() : '100');
    setIsActive(offer.isActive !== false);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSaveOffer = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!title.trim() || !code.trim() || !discountValue || !endDate) {
      return setModalError('Title, Promo Code, Discount Value, and End Date are required.');
    }

    const val = Number(discountValue);
    if (val <= 0) {
      return setModalError('Discount value must be greater than 0.');
    }
    if (discountType === 'percentage' && val > 100) {
      return setModalError('Percentage discount cannot exceed 100%.');
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return setModalError('End date must be after start date.');
    }

    setModalLoading(true);
    try {
      const payload = {
        title: title.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        serviceId: serviceId || null,
        discountType,
        discountValue: val,
        minBookingAmount: Number(minBookingAmount) || 0,
        startDate,
        endDate,
        usageLimit: Number(usageLimit) || 100,
        isActive
      };

      if (editingOfferId) {
        await apiClient.put(`/offers/${editingOfferId}`, payload);
        alert('Offer updated successfully!');
      } else {
        await apiClient.post('/offers', payload);
        alert('Offer created successfully!');
      }

      setIsModalOpen(false);
      fetchOffers();
    } catch (err) {
      setModalError(err.friendlyMessage || 'Failed to save offer.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      await apiClient.delete(`/offers/${id}`);
      alert('Offer deleted.');
      fetchOffers();
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to delete offer.');
    }
  };

  const toggleOfferActive = async (offer) => {
    try {
      await apiClient.put(`/offers/${offer._id}`, {
        isActive: !offer.isActive
      });
      fetchOffers();
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to toggle offer status.');
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

  const getOfferStatus = (offer) => {
    const now = new Date();
    const end = new Date(offer.endDate);
    const start = new Date(offer.startDate);

    if (!offer.isActive) return { label: 'Deactivated', variant: 'secondary' };
    if (end < now) return { label: 'Expired', variant: 'error' };
    if (start > now) return { label: 'Upcoming', variant: 'warning' };
    return { label: 'Active Now', variant: 'success' };
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 font-outfit tracking-tight">
            Offers & Discounts
          </h1>
          <p className="text-text-secondary font-medium text-sm sm:text-base mt-1">
            Create promotional coupon codes and percentage/fixed discounts for your services.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          variant="primary"
          icon={<Plus size={18} />}
          className="rounded-2xl px-6 py-3.5 font-bold shadow-md shrink-0"
        >
          Create New Offer
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4 sm:p-6 shadow-soft border-border-light rounded-[26px] bg-white flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or promo code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-200 overflow-x-auto w-full sm:w-auto gap-1">
          {[
            { id: 'all', label: 'All Offers' },
            { id: 'active', label: 'Active Now' },
            { id: 'expired', label: 'Expired' },
            { id: 'inactive', label: 'Deactivated' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <Skeleton className="h-64 w-full rounded-[28px]" />
      ) : error ? (
        <RetryState error={error} onRetry={fetchOffers} />
      ) : offers.length === 0 ? (
        <EmptyState
          title="No promotional offers created"
          description="Create your first promotional offer to attract more customer bookings."
          actionText="Create New Offer"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map((offer) => {
            const statusInfo = getOfferStatus(offer);
            return (
              <Card
                key={offer._id}
                className="p-6 bg-white border border-border-light rounded-[28px] shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between gap-5 relative overflow-hidden"
              >
                {/* Status Badge Tag */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-primary font-black text-xl flex items-center justify-center border border-teal-100 shrink-0 font-outfit">
                      {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `₹${offer.discountValue}`}
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900 font-outfit">
                        {offer.title}
                      </h3>
                      <span className="bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider inline-block mt-0.5 border border-gray-200">
                        {offer.code}
                      </span>
                    </div>
                  </div>

                  <Badge variant={statusInfo.variant} className="uppercase text-[10px] font-extrabold">
                    {statusInfo.label}
                  </Badge>
                </div>

                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  {offer.description || 'Applicable for eligible customer service bookings.'}
                </p>

                {/* Offer Specs Grid */}
                <div className="grid grid-cols-2 gap-3 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 text-xs">
                  <div>
                    <span className="text-text-secondary font-semibold block text-[10px] uppercase tracking-wider">
                      Applicable Service
                    </span>
                    <strong className="text-gray-900 font-bold block truncate">
                      {offer.service?.name || 'All Provider Services'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-text-secondary font-semibold block text-[10px] uppercase tracking-wider">
                      Redemptions
                    </span>
                    <strong className="text-gray-900 font-bold block">
                      {offer.usedCount} / {offer.usageLimit || '∞'} Uses
                    </strong>
                  </div>

                  <div>
                    <span className="text-text-secondary font-semibold block text-[10px] uppercase tracking-wider">
                      Validity Window
                    </span>
                    <strong className="text-gray-900 font-bold block">
                      {formatDate(offer.startDate)} → {formatDate(offer.endDate)}
                    </strong>
                  </div>

                  <div>
                    <span className="text-text-secondary font-semibold block text-[10px] uppercase tracking-wider">
                      Min Booking
                    </span>
                    <strong className="text-gray-900 font-bold block">
                      {offer.minBookingAmount ? `₹${offer.minBookingAmount}` : 'No Min'}
                    </strong>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => toggleOfferActive(offer)}
                    className={`text-xs font-bold transition-colors ${
                      offer.isActive ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'
                    }`}
                  >
                    {offer.isActive ? 'Deactivate' : 'Activate'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(offer)}
                      className="p-2 rounded-xl text-gray-500 hover:text-primary hover:bg-gray-100 transition-all"
                      title="Edit Offer"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteOffer(offer._id)}
                      className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
                      title="Delete Offer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Offer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOfferId ? 'Edit Offer & Discount' : 'Create New Offer & Promo Code'}
      >
        <form onSubmit={handleSaveOffer} className="flex flex-col gap-4 p-2 max-h-[75vh] overflow-y-auto">
          {modalError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} /> {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
              Offer Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Summer Special 10% Discount"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
              Promo Code * (Auto Upper-case)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. SUMMER10"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
              Applicable Service
            </label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All Services I Offer</option>
              {services.map((svc) => (
                <option key={svc._id} value={svc._id}>
                  {svc.name} (Base ₹{svc.basePrice})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
                Discount Type *
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
                Discount Value *
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder={discountType === 'percentage' ? '10' : '150'}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
                End Date *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
                Min Booking Amount (₹)
              </label>
              <input
                type="number"
                min="0"
                value={minBookingAmount}
                onChange={(e) => setMinBookingAmount(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
                Max Usage Limit
              </label>
              <input
                type="number"
                min="1"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
              Description / Terms
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Valid on all AC repair bookings above ₹500."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={modalLoading}
              className="rounded-xl font-bold shadow-md"
            >
              Save Offer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProviderOffers;
