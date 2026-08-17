import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/apiClient';
import { AuthContext } from '../context/AuthContext';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Filter,
  ArrowUpDown,
  Reply,
  CheckCircle2,
  Calendar,
  User,
  AlertCircle,
  Clock
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import RetryState from '../components/ui/RetryState';

export const ProviderReviews = () => {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({
    avgRating: 5.0,
    totalReviews: 0,
    star5Count: 0,
    star4Count: 0,
    star3Count: 0,
    star2Count: 0,
    star1Count: 0,
    star5Percent: 0,
    star4Percent: 0,
    star3Percent: 0,
    star2Percent: 0,
    star1Percent: 0
  });

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Sorting
  const [ratingFilter, setRatingFilter] = useState('all'); // 'all' | '5' | '4' | '3' | '2' | '1'
  const [sortOption, setSortOption] = useState('newest'); // 'newest' | 'oldest' | 'highest' | 'lowest'

  // Reply Modal State
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/reviews/my', {
        params: {
          ratingFilter,
          sort: sortOption
        }
      });
      setStats(res.data.data.stats || {});
      setReviews(res.data.data.reviews || []);
    } catch (err) {
      console.error('Error fetching provider reviews:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [ratingFilter, sortOption]);

  const openReplyModal = (review) => {
    setSelectedReviewId(review._id);
    setReplyText(review.providerReply?.message || '');
    setReplyError('');
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      return setReplyError('Please enter a valid reply message.');
    }

    setReplyLoading(true);
    try {
      await apiClient.post(`/reviews/${selectedReviewId}/reply`, {
        reply: replyText.trim()
      });
      alert('Reply published successfully!');
      setSelectedReviewId(null);
      fetchReviews();
    } catch (err) {
      setReplyError(err.friendlyMessage || 'Failed to submit reply.');
    } finally {
      setReplyLoading(false);
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
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full py-8 px-4 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 font-outfit tracking-tight">
          Customer Reviews & Ratings
        </h1>
        <p className="text-text-secondary font-medium text-sm sm:text-base mt-1">
          Monitor your customer feedback, star rating distribution, and reply to client reviews.
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-[28px]" />
      ) : error ? (
        <RetryState error={error} onRetry={fetchReviews} />
      ) : (
        <>
          {/* Rating Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Average Rating Block */}
            <Card className="p-8 bg-white border border-border-light rounded-[28px] shadow-soft flex flex-col items-center justify-center text-center">
              <span className="text-xs font-extrabold text-text-secondary uppercase tracking-widest mb-2">
                Overall Provider Rating
              </span>
              <strong className="text-5xl sm:text-6xl text-gray-900 font-extrabold font-outfit tracking-tight flex items-center gap-2">
                {stats.avgRating} <Star size={36} className="text-yellow-500 fill-yellow-500 shrink-0" />
              </strong>
              <span className="text-xs font-bold text-gray-500 mt-2">
                Based on <strong className="text-gray-900">{stats.totalReviews}</strong> customer reviews
              </span>
            </Card>

            {/* Rating Bars Distribution */}
            <Card className="p-6 bg-white border border-border-light rounded-[28px] shadow-soft md:col-span-2 flex flex-col justify-between">
              <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-widest mb-4">
                Rating Breakdown
              </h3>

              <div className="flex flex-col gap-2.5">
                {[
                  { star: 5, count: stats.star5Count, percent: stats.star5Percent },
                  { star: 4, count: stats.star4Count, percent: stats.star4Percent },
                  { star: 3, count: stats.star3Count, percent: stats.star3Percent },
                  { star: 2, count: stats.star2Count, percent: stats.star2Percent },
                  { star: 1, count: stats.star1Count, percent: stats.star1Percent }
                ].map((tier) => (
                  <div key={tier.star} className="flex items-center gap-3 text-xs font-bold">
                    <span className="w-12 text-gray-700 flex items-center gap-1">
                      {tier.star} <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    </span>

                    <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-yellow-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${tier.percent}%` }}
                      />
                    </div>

                    <span className="w-16 text-right text-text-secondary">
                      {tier.count} ({tier.percent}%)
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Filter & Sort Bar */}
          <Card className="p-4 sm:p-6 shadow-soft border-border-light rounded-[26px] bg-white flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-200 overflow-x-auto w-full sm:w-auto gap-1">
              {[
                { id: 'all', label: `All (${stats.totalReviews})` },
                { id: '5', label: '5 ★' },
                { id: '4', label: '4 ★' },
                { id: '3', label: '3 ★' },
                { id: '2', label: '2 ★' },
                { id: '1', label: '1 ★' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRatingFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    ratingFilter === tab.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-text-secondary font-bold whitespace-nowrap">Sort By:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </Card>

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <EmptyState
              title="No customer reviews yet"
              description="When customers review your completed service bookings, their ratings and comments will appear here."
            />
          ) : (
            <div className="flex flex-col gap-6">
              {reviews.map((review) => (
                <Card
                  key={review._id}
                  className="p-6 bg-white border border-gray-200 rounded-[28px] shadow-soft hover:shadow-elevated transition-all flex flex-col gap-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 text-primary font-extrabold text-lg flex items-center justify-center border border-teal-100 shrink-0">
                        {review.customer?.avatar ? (
                          <img
                            src={review.customer.avatar}
                            alt={review.customer.name}
                            className="w-full h-full rounded-2xl object-cover"
                          />
                        ) : (
                          review.customer?.name?.charAt(0) || 'C'
                        )}
                      </div>

                      <div>
                        <strong className="text-lg font-extrabold text-gray-900 font-outfit block">
                          {review.customer?.name}
                        </strong>
                        <span className="text-xs text-text-secondary font-medium block">
                          Reviewed on {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-200">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={
                              i < review.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-200 fill-gray-200'
                            }
                          />
                        ))}
                        <strong className="text-xs font-bold text-gray-900 ml-1">{review.rating}.0</strong>
                      </div>

                      {review.sentiment && (
                        <Badge
                          variant={
                            review.sentiment === 'positive'
                              ? 'success'
                              : review.sentiment === 'negative'
                              ? 'error'
                              : 'secondary'
                          }
                          className="uppercase text-[10px] font-bold"
                        >
                          {review.sentiment}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-800 font-medium leading-relaxed bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
                    "{review.comment}"
                  </p>

                  {/* Provider Reply Display */}
                  {review.providerReply?.message ? (
                    <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-100 ml-4 sm:ml-8 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-extrabold text-primary flex items-center gap-1.5">
                          <Reply size={14} /> Your Provider Response
                        </strong>
                        <span className="text-[10px] text-gray-500 font-medium">
                          {formatDate(review.providerReply.repliedAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-800 font-medium">
                        "{review.providerReply.message}"
                      </p>
                    </div>
                  ) : (
                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={() => openReplyModal(review)}
                        variant="secondary"
                        size="sm"
                        icon={<Reply size={14} />}
                        className="rounded-xl font-bold text-xs"
                      >
                        Reply to Customer
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Reply Modal */}
      {selectedReviewId && (
        <Modal
          isOpen={!!selectedReviewId}
          onClose={() => setSelectedReviewId(null)}
          title="Reply to Customer Review"
        >
          <form onSubmit={handleSendReply} className="flex flex-col gap-4 p-2">
            {replyError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} /> {replyError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wider">
                Write Your Response *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Thank the customer for their business or clarify any service visit details professionally..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSelectedReviewId(null)}
                className="rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={replyLoading}
                className="rounded-xl font-bold shadow-md"
              >
                Publish Reply
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ProviderReviews;
