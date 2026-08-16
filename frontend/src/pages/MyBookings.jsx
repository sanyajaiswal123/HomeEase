import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { API_ENDPOINTS } from '../config/constants';
import { Calendar, Phone, Star, MapPin, ArrowRight } from 'lucide-react';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import RetryState from '../components/ui/RetryState';

export const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(API_ENDPOINTS.BOOKINGS.MY);
      setBookings(res.data.data.bookings);
    } catch (err) {
      console.error('Error fetching bookings:', err.friendlyMessage);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const openReviewModal = (booking) => {
    setSelectedBooking(booking);
    setRating(5);
    setComment('');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);

    try {
      await apiClient.post(API_ENDPOINTS.REVIEWS, {
        bookingId: selectedBooking._id,
        rating,
        comment
      });
      setShowReviewModal(false);
      fetchBookings(); // Refresh list to reflect changes
      alert(
        'Thank you! Your feedback has been recorded and processed by our AI feedback compiler.'
      );
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      case 'accepted':
        return 'info';
      case 'in_progress':
        return 'primary';
      default:
        return 'warning';
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

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-10 w-full py-12 px-4 sm:px-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-gray-900 font-outfit tracking-tight">
          My Bookings
        </h1>
        <p className="text-text-secondary font-medium text-lg">
          Track active services and review completed technician visits.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-8">
          <Skeleton.Card className="rounded-[24px]" />
          <Skeleton.Card className="rounded-[24px]" />
        </div>
      ) : error ? (
        <RetryState error={error} onRetry={fetchBookings} />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          description="You do not have any active or past bookings. Once you book a service, it will appear here."
          action={{ label: 'Explore Services', onClick: () => navigate('/dashboard') }}
        />
      ) : (
        <div className="flex flex-col gap-10">
          {bookings.map((booking) => (
            <Card
              key={booking._id}
              className={`animate-fade-in border-l-[6px] shadow-soft rounded-[24px] ${booking.status === 'in_progress' ? 'border-l-primary' : booking.status === 'completed' ? 'border-l-success' : 'border-l-border-light'} border-t-border-light border-r-border-light border-b-border-light`}
            >
              <Card.Body className="p-8 md:p-10">
                {/* Top Row: Category Name & Status */}
                <div className="flex justify-between items-start flex-wrap gap-4 mb-8 border-b border-border-light pb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1 font-outfit tracking-tight">
                      {booking.service?.name} Service
                    </h3>
                    <span className="text-sm text-text-secondary font-bold tracking-wider uppercase">
                      ID: {booking._id}
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge
                      variant={getStatusBadgeVariant(booking.status)}
                      className="uppercase tracking-widest font-bold px-4 py-2 rounded-xl shadow-sm"
                    >
                      {booking.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                {/* Grid: Booking Details & Provider info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8 responsive-booking-card-grid">
                  {/* Column 1: Schedule & Selected Subservices */}
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 text-base text-gray-900 font-bold bg-bg-secondary p-4 rounded-xl border border-border-light shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                        <Calendar size={18} />
                      </div>
                      <span>{formatDate(booking.scheduledDate)}</span>
                    </div>

                    <div className="flex items-start gap-4 text-base text-gray-900 font-medium bg-bg-secondary p-4 rounded-xl border border-border-light shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                        <MapPin size={18} />
                      </div>
                      <span className="leading-relaxed mt-1">
                        {booking.address?.street}, {booking.address?.city}
                      </span>
                    </div>

                    {booking.subServicesSelected?.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs font-bold text-text-secondary uppercase tracking-widest block mb-3">
                          Requested Work:
                        </span>
                        <div className="flex flex-wrap gap-3">
                          {booking.subServicesSelected.map((sub, idx) => (
                            <span
                              key={idx}
                              className="text-xs font-bold bg-white border border-border-light px-4 py-2 rounded-xl text-gray-900 shadow-sm"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Column 2: Provider Info / Action Banner */}
                  <div className="bg-bg-alternate border border-primary-light rounded-[24px] p-8 h-full shadow-inner flex flex-col justify-center">
                    {booking.provider ? (
                      <div className="flex flex-col gap-5">
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">
                          Assigned Technician
                        </span>
                        <div className="flex gap-5 items-center">
                          <div className="w-14 h-14 rounded-[20px] bg-white text-primary flex items-center justify-center font-extrabold text-xl border border-primary-light shrink-0 shadow-sm">
                            {booking.provider.name.charAt(0)}
                          </div>
                          <div>
                            <strong className="block text-xl text-gray-900 mb-1 font-outfit tracking-tight">
                              {booking.provider.name}
                            </strong>
                            <span className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
                              <Star size={16} className="text-yellow-400 fill-yellow-400" />{' '}
                              {booking.provider.providerDetails?.rating || '5.0'}
                            </span>
                          </div>
                        </div>

                        {/* Contact */}
                        <div className="flex items-center gap-3 text-sm font-bold text-gray-900 mt-2">
                          <Phone size={16} className="text-primary" /> {booking.provider.phone}
                        </div>

                        {/* AI Bio Summary */}
                        {booking.provider.providerDetails?.aiSummary && (
                          <p className="text-sm italic text-gray-700 border-t border-primary-light/50 pt-5 mt-2 leading-relaxed font-medium">
                            "{booking.provider.providerDetails.aiSummary}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4 text-text-secondary font-medium">
                        {booking.status === 'cancelled' ? (
                          <span className="font-bold text-danger">Booking Cancelled</span>
                        ) : (
                          <>
                            <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4"></div>
                            <span className="font-bold uppercase tracking-widest text-xs">
                              Assigning Technician...
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Row: OTP display & Actions */}
                <div className="border-t border-border-light pt-8 flex justify-between items-center flex-wrap gap-6 mt-2">
                  <div>
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                      Total Cost
                    </span>
                    <strong className="text-3xl text-gray-900 block mt-1 font-extrabold font-outfit">
                      ₹{booking.totalAmount}
                    </strong>
                  </div>

                  <div className="flex gap-4 items-center flex-wrap">
                    {/* OTP display when active */}
                    {(booking.status === 'accepted' || booking.status === 'in_progress') && (
                      <div className="bg-bg-alternate border border-primary-light px-5 py-3 rounded-xl text-sm flex items-center gap-3 font-bold shadow-sm">
                        <span className="text-text-secondary uppercase tracking-widest text-xs">
                          Service OTP:
                        </span>
                        <strong className="text-primary text-xl font-extrabold tracking-[0.2em]">
                          {booking.otp}
                        </strong>
                      </div>
                    )}

                    {/* Actions */}
                    {(booking.status === 'accepted' || booking.status === 'in_progress') &&
                      booking.provider && (
                        <Button
                          onClick={() => navigate(`/booking/track/${booking._id}`)}
                          variant="primary"
                          className="rounded-xl font-bold px-6 py-3.5 shadow-md group"
                        >
                          <span className="flex items-center gap-2">
                            Track Technician{' '}
                            <ArrowRight
                              size={18}
                              className="group-hover:translate-x-1 transition-transform"
                            />
                          </span>
                        </Button>
                      )}

                    {booking.status === 'completed' && (
                      <Button
                        onClick={() => openReviewModal(booking)}
                        variant="accent"
                        className="rounded-xl font-bold px-6 py-3.5 shadow-md"
                      >
                        Submit Review
                      </Button>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Review Modal Pop-up */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Rate Service Visit"
      >
        <div className="p-2">
          <p className="text-text-secondary text-sm mb-8 leading-relaxed font-medium">
            Your feedback is analyzed using AI to tag reviews and build technician scorecards.
          </p>

          <form onSubmit={handleReviewSubmit} className="flex flex-col gap-8">
            {/* Stars selection */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">
                Service Rating
              </label>
              <div className="flex gap-4 bg-bg-secondary p-6 rounded-[20px] border border-border-light justify-center">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    className={`bg-transparent border-none cursor-pointer transition-transform hover:scale-110 focus:outline-none ${num <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    <Star size={44} fill={num <= rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment text */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
                Tell us about your experience
              </label>
              <textarea
                className="w-full bg-white border border-border-light rounded-[16px] text-gray-900 px-5 py-4 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-colors resize-y min-h-[140px] shadow-inner text-base font-medium leading-relaxed"
                required
                rows={4}
                placeholder="Explain details e.g., 'Amit arrived exactly on time, diagnosed the compressor trip and fixed it quickly...'"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-4 mt-4 pt-6 border-t border-border-light">
              <Button
                type="button"
                variant="secondary"
                className="rounded-xl px-6 py-3 font-bold"
                onClick={() => setShowReviewModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="rounded-xl px-8 py-3 font-bold shadow-md"
                loading={submittingReview}
              >
                {submittingReview ? 'Analyzing...' : 'Post Review'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default MyBookings;
