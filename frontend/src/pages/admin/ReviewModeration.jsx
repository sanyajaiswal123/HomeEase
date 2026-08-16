import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import {
  Search,
  Star,
  Trash2,
  EyeOff,
  Eye,
  AlertCircle,
  ShieldAlert,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import RetryState from '../../components/ui/RetryState';
import Button from '../../components/ui/Button';

export const ReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(
        `/admin/reviews?page=${page}&limit=10&search=${searchQuery}&status=${statusFilter}`
      );
      setReviews(res.data.data.reviews);
      setTotalPages(res.data.pages);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchReviews();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleToggleHide = async (reviewId) => {
    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/reviews/${reviewId}/hide`);
      fetchReviews();
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to toggle visibility.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this review? This will recalculate the provider's overall rating."
      )
    )
      return;

    setActionLoading(true);
    try {
      await apiClient.delete(`/admin/reviews/${reviewId}`);
      alert('Review permanently deleted.');
      fetchReviews();
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to delete review.');
    } finally {
      setActionLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 text-gray-200'
            }
          />
        ))}
      </div>
    );
  };

  const getSentimentBadge = (sentiment) => {
    const styles = {
      positive: 'bg-green-100 text-green-700',
      neutral: 'bg-gray-100 text-gray-700',
      negative: 'bg-red-100 text-red-700'
    };
    return (
      <Badge variant="secondary" className={`${styles[sentiment]} text-[10px] uppercase py-0 px-2`}>
        {sentiment}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Review Moderation
        </h1>
        <p className="text-text-secondary font-medium">
          Monitor public feedback, hide inappropriate content, or permanently remove fraudulent
          reviews.
        </p>
      </div>

      <Card className="shadow-sm border-border-light rounded-[24px] overflow-hidden bg-white">
        <div className="p-6 border-b border-border-light flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="w-full sm:w-72">
              <Input
                type="text"
                placeholder="Search reviews by name or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search size={18} className="text-gray-400" />}
                className="rounded-xl bg-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-xl border border-border-light bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Reviews</option>
              <option value="public">Public</option>
              <option value="reported">Reported Only</option>
              <option value="hidden">Hidden by Admin</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="px-3 py-1.5"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={18} />
            </Button>
            <span className="text-sm font-bold text-gray-600 px-2">
              Page {page} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              className="px-3 py-1.5"
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="p-6 flex flex-col gap-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : error ? (
          <div className="p-6">
            <RetryState error={error} onRetry={fetchReviews} />
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title="No reviews found"
              description="No feedback matches your current filters."
              icon={<Star size={48} className="text-gray-300" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Review Details</Table.Head>
                  <Table.Head>Customer</Table.Head>
                  <Table.Head>Provider</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head className="text-right">Moderation Actions</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {reviews.map((review) => (
                  <Table.Row
                    key={review._id}
                    className={review.isHidden ? 'bg-gray-50/80 opacity-75' : ''}
                  >
                    {/* Review Details (Stars & Text) */}
                    <Table.Cell className="w-2/5">
                      <div className="flex flex-col gap-1.5 max-w-sm">
                        <div className="flex items-center justify-between">
                          {renderStars(review.rating)}
                          {getSentimentBadge(review.sentiment)}
                        </div>
                        <p
                          className={`text-sm ${review.isHidden ? 'italic text-gray-500' : 'text-gray-900'} leading-snug line-clamp-2`}
                          title={review.comment}
                        >
                          "{review.comment}"
                        </p>
                        <span className="text-[10px] text-gray-400">
                          Date: {new Date(review.createdAt).toLocaleDateString()} | Booking: #
                          {review.booking?._id?.toString().slice(-6).toUpperCase()}
                        </span>
                      </div>
                    </Table.Cell>

                    <Table.Cell>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{review.customer?.name}</span>
                      </div>
                    </Table.Cell>

                    <Table.Cell>
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">{review.provider?.name}</span>
                      </div>
                    </Table.Cell>

                    <Table.Cell>
                      <div className="flex flex-col gap-1 items-start">
                        {review.isHidden ? (
                          <Badge
                            variant="secondary"
                            className="bg-gray-200 text-gray-600 border border-gray-300 flex items-center gap-1"
                          >
                            <EyeOff size={12} /> Hidden
                          </Badge>
                        ) : (
                          <Badge
                            variant="success"
                            className="bg-green-50 text-green-700 flex items-center gap-1"
                          >
                            <Eye size={12} /> Public
                          </Badge>
                        )}
                        {review.isReported && (
                          <Badge
                            variant="error"
                            className="animate-pulse bg-red-100 text-red-700 flex items-center gap-1"
                          >
                            <AlertCircle size={12} /> Reported
                          </Badge>
                        )}
                      </div>
                    </Table.Cell>

                    <Table.Cell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleHide(review._id)}
                          disabled={actionLoading}
                          className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold ${review.isHidden ? 'text-blue-600 hover:bg-blue-50 border-blue-200' : 'text-gray-600 hover:bg-gray-100 border-gray-200'} border`}
                          title={review.isHidden ? 'Unhide Review' : 'Hide from Public'}
                        >
                          {review.isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                          <span className="hidden sm:inline">
                            {review.isHidden ? 'Unhide' : 'Hide'}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(review._id)}
                          disabled={actionLoading}
                          className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold border border-red-100"
                          title="Delete Permanently"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};
