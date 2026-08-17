const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Complaint = require('../models/Complaint');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const Setting = require('../models/Setting');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { USER_ROLES } = require('../config/constants');
const { sendNotification } = require('../utils/notificationHelper');
const { logAdminAction } = require('../utils/auditLogger');

// 1. Dashboard Stats
exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const [
    totalCustomers,
    totalProviders,
    verifiedProviders,
    pendingVerifications,
    rejectedProviders,
    totalServices,
    allBookings,
    allComplaints,
    allReviews,
    recentBookings,
    recentUsers,
    recentProviders,
    recentVerifications
  ] = await Promise.all([
    User.countDocuments({ role: USER_ROLES.CUSTOMER, isActive: true }),
    User.countDocuments({ role: USER_ROLES.PROVIDER, isActive: true }),
    User.countDocuments({
      role: USER_ROLES.PROVIDER,
      'providerDetails.isVerified': true,
      isActive: true
    }),
    User.countDocuments({
      role: USER_ROLES.PROVIDER,
      'providerDetails.verificationStatus': 'pending',
      isActive: true
    }),
    User.countDocuments({
      role: USER_ROLES.PROVIDER,
      'providerDetails.verificationStatus': 'rejected',
      isActive: true
    }),
    Service.countDocuments(),
    Booking.find(),
    Complaint.countDocuments(),
    Review.countDocuments(),
    Booking.find()
      .populate('customer', 'name email phone')
      .populate('provider', 'name email phone')
      .populate('service', 'name')
      .sort('-createdAt')
      .limit(5),
    User.find({ role: USER_ROLES.CUSTOMER, isActive: true })
      .select('-password')
      .sort('-createdAt')
      .limit(5),
    User.find({ role: USER_ROLES.PROVIDER, isActive: true })
      .populate('providerDetails.serviceCategory', 'name')
      .select('-password')
      .sort('-createdAt')
      .limit(5),
    User.find({
      role: USER_ROLES.PROVIDER,
      'providerDetails.verificationStatus': 'pending',
      isActive: true
    })
      .populate('providerDetails.serviceCategory', 'name')
      .select('-password')
      .sort('-createdAt')
      .limit(5)
  ]);

  const completedBookings = allBookings.filter((b) => b.status === 'completed');
  const pendingBookings = allBookings.filter((b) => b.status === 'pending');
  const inProgressBookings = allBookings.filter(
    (b) => b.status === 'accepted' || b.status === 'in_progress'
  );
  const cancelledBookings = allBookings.filter((b) => b.status === 'cancelled');

  const paidBookings = allBookings.filter((b) => b.paymentStatus === 'paid');
  const refundedBookings = allBookings.filter((b) => b.paymentStatus === 'refunded');

  const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const platformRevenue = Math.round(totalRevenue * 0.2); // 20% commission
  const totalRefunds = refundedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalCustomers,
        totalProviders,
        verifiedProviders,
        pendingVerifications,
        rejectedProviders,
        totalServices,
        totalBookings: allBookings.length,
        totalRevenue,
        platformRevenue,
        totalRefunds,
        totalComplaints: allComplaints,
        totalReviews: allReviews
      },
      bookingOverview: {
        completed: completedBookings.length,
        pending: pendingBookings.length,
        inProgress: inProgressBookings.length,
        cancelled: cancelledBookings.length
      },
      recentBookings,
      recentUsers,
      recentProviders,
      recentVerifications
    }
  });
});

// 2. Customer Management
exports.getAllCustomers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search = '', status = 'all' } = req.query;

  const query = { role: USER_ROLES.CUSTOMER };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  if (status === 'active') {
    query.isActive = true;
    query.isBlocked = false;
  } else if (status === 'blocked') {
    query.isBlocked = true;
    query.isActive = true;
  } else if (status === 'deleted') {
    query.isActive = false;
  } else {
    query.isActive = true;
  }

  const skip = (page - 1) * limit;

  const [customers, total] = await Promise.all([
    User.find(query).select('-password').skip(skip).limit(parseInt(limit)).sort('-createdAt'),
    User.countDocuments(query)
  ]);

  res.status(200).json({
    status: 'success',
    results: customers.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: { customers }
  });
});

exports.getCustomerProfile = catchAsync(async (req, res, next) => {
  const customer = await User.findById(req.params.id).select('-password');
  if (!customer || customer.role !== USER_ROLES.CUSTOMER) {
    return next(new AppError('Customer not found', 404));
  }

  const [bookings, reviews, complaints] = await Promise.all([
    Booking.find({ customer: req.params.id })
      .populate('service', 'name')
      .populate('provider', 'name email')
      .sort('-createdAt'),
    Review.find({ customer: req.params.id }).populate('provider', 'name'),
    Complaint.find({ user: req.params.id }).sort('-createdAt')
  ]);

  const totalSpent = bookings
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  res.status(200).json({
    status: 'success',
    data: {
      customer,
      stats: {
        totalBookings: bookings.length,
        totalSpent,
        totalReviews: reviews.length,
        totalComplaints: complaints.length
      },
      bookings,
      reviews,
      complaints
    }
  });
});

// 3. Provider Management
exports.getAllProviders = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search = '', status = 'all' } = req.query;

  const query = { role: USER_ROLES.PROVIDER };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  if (status === 'active') {
    query.isActive = true;
    query.isBlocked = false;
  } else if (status === 'blocked') {
    query.isBlocked = true;
    query.isActive = true;
  } else if (status === 'verified') {
    query['providerDetails.isVerified'] = true;
    query.isActive = true;
  } else if (status === 'pending') {
    query['providerDetails.verificationStatus'] = 'pending';
    query.isActive = true;
  } else if (status === 'rejected') {
    query['providerDetails.verificationStatus'] = 'rejected';
    query.isActive = true;
  } else if (status === 'deleted') {
    query.isActive = false;
  } else {
    query.isActive = true;
  }

  const skip = (page - 1) * limit;

  const [providers, total] = await Promise.all([
    User.find(query)
      .populate('providerDetails.serviceCategory')
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt'),
    User.countDocuments(query)
  ]);

  res.status(200).json({
    status: 'success',
    results: providers.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: { providers }
  });
});

exports.getProviderProfile = catchAsync(async (req, res, next) => {
  const provider = await User.findById(req.params.id)
    .populate('providerDetails.serviceCategory')
    .select('-password');

  if (!provider || provider.role !== USER_ROLES.PROVIDER) {
    return next(new AppError('Provider not found', 404));
  }

  const [bookings, reviews] = await Promise.all([
    Booking.find({ provider: req.params.id })
      .populate('service', 'name')
      .populate('customer', 'name email phone')
      .sort('-createdAt'),
    Review.find({ provider: req.params.id }).populate('customer', 'name').sort('-createdAt')
  ]);

  const completedJobs = bookings.filter((b) => b.status === 'completed');
  const totalEarnings = completedJobs.reduce((sum, b) => sum + Math.round((b.totalAmount || 0) * 0.8), 0);

  res.status(200).json({
    status: 'success',
    data: {
      provider,
      stats: {
        totalJobs: bookings.length,
        completedJobs: completedJobs.length,
        totalEarnings,
        rating: provider.providerDetails?.rating || 5,
        totalReviews: reviews.length
      },
      bookings,
      reviews
    }
  });
});

// User Block / Delete Actions
exports.toggleBlockUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found', 404));

  user.isBlocked = !user.isBlocked;
  await user.save({ validateBeforeSave: false });

  // Audit log & Notify user
  await logAdminAction({
    adminId: req.user.id,
    action: user.isBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
    targetType: 'User',
    targetId: user._id,
    details: { name: user.name, email: user.email, role: user.role },
    req
  });

  await sendNotification(req.app, {
    recipient: user._id,
    sender: req.user.id,
    type: 'system',
    title: user.isBlocked ? 'Account Suspended' : 'Account Re-activated',
    message: user.isBlocked
      ? 'Your account has been suspended by administration due to policy compliance.'
      : 'Your account has been re-activated. You can now access HomeEase services.'
  });

  res.status(200).json({
    status: 'success',
    message: user.isBlocked ? 'User blocked successfully' : 'User unblocked successfully',
    data: { user }
  });
});

exports.softDeleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found', 404));

  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  await logAdminAction({
    adminId: req.user.id,
    action: 'USER_DELETED',
    targetType: 'User',
    targetId: user._id,
    details: { name: user.name, email: user.email },
    req
  });

  res.status(200).json({
    status: 'success',
    message: 'User account soft-deleted successfully'
  });
});

// 4. Verification Hub
exports.getPendingVerifications = catchAsync(async (req, res, next) => {
  const { status = 'pending' } = req.query;

  let query = { role: USER_ROLES.PROVIDER, isActive: true };
  if (status !== 'all') {
    query['providerDetails.verificationStatus'] = status;
  }

  const providers = await User.find(query)
    .populate('providerDetails.serviceCategory')
    .select('-password')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: providers.length,
    data: { providers }
  });
});

exports.approveProvider = catchAsync(async (req, res, next) => {
  const provider = await User.findById(req.params.id);
  if (!provider || provider.role !== USER_ROLES.PROVIDER) {
    return next(new AppError('Provider not found', 404));
  }

  provider.providerDetails.isVerified = true;
  provider.providerDetails.verificationStatus = 'approved';
  provider.providerDetails.verificationHistory.push({
    action: 'approved',
    reason: 'Credentials and background check approved by administration.',
    date: Date.now()
  });

  await provider.save({ validateBeforeSave: false });

  await logAdminAction({
    adminId: req.user.id,
    action: 'PROVIDER_VERIFIED',
    targetType: 'User',
    targetId: provider._id,
    details: { name: provider.name, email: provider.email },
    req
  });

  await sendNotification(req.app, {
    recipient: provider._id,
    sender: req.user.id,
    type: 'verification_approved',
    title: 'Verification Approved 🎉',
    message: 'Congratulations! Your HomeEase provider profile has been verified. You can now accept customer jobs.'
  });

  res.status(200).json({
    status: 'success',
    message: 'Provider approved and verified successfully',
    data: { provider }
  });
});

exports.rejectProvider = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  if (!reason) {
    return next(new AppError('Please provide a rejection reason.', 400));
  }

  const provider = await User.findById(req.params.id);
  if (!provider || provider.role !== USER_ROLES.PROVIDER) {
    return next(new AppError('Provider not found', 404));
  }

  provider.providerDetails.isVerified = false;
  provider.providerDetails.verificationStatus = 'rejected';
  provider.providerDetails.verificationHistory.push({
    action: 'rejected',
    reason,
    date: Date.now()
  });

  await provider.save({ validateBeforeSave: false });

  await logAdminAction({
    adminId: req.user.id,
    action: 'PROVIDER_REJECTED',
    targetType: 'User',
    targetId: provider._id,
    details: { name: provider.name, email: provider.email, reason },
    req
  });

  await sendNotification(req.app, {
    recipient: provider._id,
    sender: req.user.id,
    type: 'verification_rejected',
    title: 'Verification Application Update',
    message: `Your verification request was rejected. Reason: "${reason}". Please update your details and resubmit.`
  });

  res.status(200).json({
    status: 'success',
    message: 'Provider verification rejected',
    data: { provider }
  });
});

// 5. Booking Management
exports.getAllBookings = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search = '', status = 'all' } = req.query;

  let query = {};
  if (status !== 'all') {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('customer', 'name email phone')
      .populate('provider', 'name email phone')
      .populate('service', 'name basePrice')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit)),
    Booking.countDocuments(query)
  ]);

  let filteredBookings = bookings;
  if (search) {
    const s = search.toLowerCase();
    filteredBookings = bookings.filter(
      (b) =>
        b._id.toString().toLowerCase().includes(s) ||
        b.customer?.name.toLowerCase().includes(s) ||
        b.provider?.name?.toLowerCase().includes(s) ||
        b.service?.name.toLowerCase().includes(s)
    );
  }

  res.status(200).json({
    status: 'success',
    results: filteredBookings.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: { bookings: filteredBookings }
  });
});

exports.cancelBookingAdmin = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404));

  booking.status = 'cancelled';
  if (booking.paymentStatus === 'paid') {
    booking.paymentStatus = 'refunded';
  }

  booking.trackingLog.push({
    status: 'cancelled_by_admin',
    timestamp: Date.now()
  });

  await booking.save();

  await logAdminAction({
    adminId: req.user.id,
    action: 'BOOKING_CANCELLED',
    targetType: 'Booking',
    targetId: booking._id,
    details: { totalAmount: booking.totalAmount },
    req
  });

  if (booking.customer) {
    await sendNotification(req.app, {
      recipient: booking.customer,
      sender: req.user.id,
      type: 'booking_cancelled',
      title: 'Booking Cancelled by Admin',
      message: `Your booking #${booking._id.toString().slice(-6).toUpperCase()} has been cancelled by administration.`
    });
  }

  if (booking.provider) {
    await sendNotification(req.app, {
      recipient: booking.provider,
      sender: req.user.id,
      type: 'booking_cancelled',
      title: 'Booking Cancelled by Admin',
      message: `Booking #${booking._id.toString().slice(-6).toUpperCase()} assigned to you has been cancelled by administration.`
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Booking cancelled by administration',
    data: { booking }
  });
});

exports.assignProvider = catchAsync(async (req, res, next) => {
  const { providerId } = req.body;
  if (!providerId) return next(new AppError('Please provide a provider ID', 400));

  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404));

  const provider = await User.findById(providerId);
  if (!provider || provider.role !== USER_ROLES.PROVIDER) {
    return next(new AppError('Invalid provider selected', 400));
  }

  booking.provider = providerId;
  if (booking.status === 'pending') {
    booking.status = 'accepted';
  }

  booking.trackingLog.push({
    status: 'Provider Assigned by Admin',
    timestamp: Date.now()
  });

  await booking.save();

  await logAdminAction({
    adminId: req.user.id,
    action: 'PROVIDER_ASSIGNED',
    targetType: 'Booking',
    targetId: booking._id,
    details: { providerId, providerName: provider.name },
    req
  });

  await sendNotification(req.app, {
    recipient: provider._id,
    sender: req.user.id,
    type: 'booking_update',
    title: 'New Service Job Assigned',
    message: `You have been manually assigned to booking #${booking._id.toString().slice(-6).toUpperCase()} by HomeEase Admin.`
  });

  res.status(200).json({
    status: 'success',
    message: 'Provider assigned successfully',
    data: { booking }
  });
});

// 6. Complaints & Reports
exports.getAllComplaints = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search = '', status = 'all' } = req.query;

  let query = {};
  if (status !== 'all') query.status = status;

  const skip = (page - 1) * limit;

  const [complaints, total] = await Promise.all([
    Complaint.find(query)
      .populate('user', 'name email phone role')
      .populate('assignedTo', 'name email')
      .populate({
        path: 'booking',
        populate: [
          { path: 'customer', select: 'name' },
          { path: 'provider', select: 'name' },
          { path: 'service', select: 'name' }
        ]
      })
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit)),
    Complaint.countDocuments(query)
  ]);

  let filtered = complaints;
  if (search) {
    const s = search.toLowerCase();
    filtered = complaints.filter(
      (c) =>
        c.subject.toLowerCase().includes(s) ||
        c.user?.name.toLowerCase().includes(s) ||
        c._id.toString().toLowerCase().includes(s)
    );
  }

  res.status(200).json({
    status: 'success',
    results: filtered.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: { complaints: filtered }
  });
});

exports.assignComplaint = catchAsync(async (req, res, next) => {
  const { adminId } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return next(new AppError('Complaint not found', 404));

  complaint.assignedTo = adminId || req.user.id;
  if (complaint.status === 'open') complaint.status = 'investigating';

  complaint.history.push({
    status: complaint.status,
    note: 'Complaint assigned to an administrator for review.',
    author: req.user.id
  });

  await complaint.save();

  res.status(200).json({
    status: 'success',
    data: { complaint }
  });
});

exports.updateComplaintStatus = catchAsync(async (req, res, next) => {
  const { status, note } = req.body;
  if (!status || !note) {
    return next(new AppError('Please provide a status and a resolution note.', 400));
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return next(new AppError('Complaint not found', 404));

  complaint.status = status;
  complaint.history.push({
    status,
    note,
    author: req.user.id
  });

  await complaint.save();

  await sendNotification(req.app, {
    recipient: complaint.user,
    sender: req.user.id,
    type: 'complaint_update',
    title: `Complaint Status: ${status.toUpperCase()}`,
    message: `Your complaint regarding "${complaint.subject}" has been updated: ${note}`
  });

  res.status(200).json({
    status: 'success',
    data: { complaint }
  });
});

// 7. Reviews Moderation
exports.getAllReviews = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search = '', status = 'all' } = req.query;

  let query = {};
  if (status === 'reported') query.isReported = true;
  if (status === 'hidden') query.isHidden = true;
  if (status === 'public') query.isHidden = false;

  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate('customer', 'name email')
      .populate('provider', 'name email')
      .populate('booking', '_id')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit)),
    Review.countDocuments(query)
  ]);

  let filteredReviews = reviews;
  if (search) {
    const s = search.toLowerCase();
    filteredReviews = reviews.filter(
      (r) =>
        r.customer?.name.toLowerCase().includes(s) ||
        r.provider?.name.toLowerCase().includes(s) ||
        r.comment.toLowerCase().includes(s)
    );
  }

  res.status(200).json({
    status: 'success',
    results: filteredReviews.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: { reviews: filteredReviews }
  });
});

exports.toggleHideReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));

  review.isHidden = !review.isHidden;
  await review.save();

  await logAdminAction({
    adminId: req.user.id,
    action: review.isHidden ? 'REVIEW_HIDDEN' : 'REVIEW_UNHIDDEN',
    targetType: 'Review',
    targetId: review._id,
    details: { comment: review.comment },
    req
  });

  res.status(200).json({
    status: 'success',
    message: `Review is now ${review.isHidden ? 'hidden' : 'visible'}`,
    data: { review }
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));

  await logAdminAction({
    adminId: req.user.id,
    action: 'REVIEW_DELETED',
    targetType: 'Review',
    targetId: req.params.id,
    details: { comment: review.comment },
    req
  });

  res.status(200).json({
    status: 'success',
    message: 'Review deleted successfully',
    data: null
  });
});

// 8. Payments & Refunds
exports.getPayments = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search = '', status = 'all' } = req.query;

  let query = {};
  if (status !== 'all') {
    query.paymentStatus = status;
  }

  const skip = (page - 1) * limit;

  const [bookings, total, allBookings] = await Promise.all([
    Booking.find(query)
      .populate('customer', 'name email phone')
      .populate('provider', 'name email phone')
      .populate('service', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit)),
    Booking.countDocuments(query),
    Booking.find()
  ]);

  const paid = allBookings.filter((b) => b.paymentStatus === 'paid');
  const refunded = allBookings.filter((b) => b.paymentStatus === 'refunded');
  const pending = allBookings.filter((b) => b.paymentStatus === 'pending');

  const totalVolume = paid.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const platformCommission = Math.round(totalVolume * 0.2);
  const totalRefunded = refunded.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const pendingVolume = pending.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  let filtered = bookings;
  if (search) {
    const s = search.toLowerCase();
    filtered = bookings.filter(
      (b) =>
        b._id.toString().toLowerCase().includes(s) ||
        b.customer?.name.toLowerCase().includes(s) ||
        b.provider?.name?.toLowerCase().includes(s)
    );
  }

  res.status(200).json({
    status: 'success',
    results: filtered.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: {
      payments: filtered,
      summary: {
        totalVolume,
        platformCommission,
        totalRefunded,
        pendingVolume,
        paidCount: paid.length,
        refundedCount: refunded.length,
        pendingCount: pending.length
      }
    }
  });
});

exports.processRefund = catchAsync(async (req, res, next) => {
  const { bookingId } = req.params;
  const { reason } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) return next(new AppError('Booking transaction not found', 404));

  booking.paymentStatus = 'refunded';
  booking.status = 'cancelled';
  booking.trackingLog.push({
    status: 'refunded_by_admin',
    timestamp: Date.now()
  });

  await booking.save();

  await logAdminAction({
    adminId: req.user.id,
    action: 'REFUND_ISSUED',
    targetType: 'Booking',
    targetId: booking._id,
    details: { amount: booking.totalAmount, reason: reason || 'Customer refund' },
    req
  });

  if (booking.customer) {
    await sendNotification(req.app, {
      recipient: booking.customer,
      sender: req.user.id,
      type: 'refund_processed',
      title: 'Refund Processed Successfuly',
      message: `A full refund of ₹${booking.totalAmount} for booking #${booking._id.toString().slice(-6).toUpperCase()} has been issued.`
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Refund issued successfully',
    data: { booking }
  });
});

// 9. Analytics & Reports
exports.getAnalyticsData = catchAsync(async (req, res, next) => {
  const { range = 'month' } = req.query;

  let dateFilter = new Date();
  if (range === 'today') dateFilter.setHours(0, 0, 0, 0);
  else if (range === 'week') dateFilter.setDate(dateFilter.getDate() - 7);
  else if (range === 'month') dateFilter.setMonth(dateFilter.getMonth() - 1);
  else if (range === 'year') dateFilter.setFullYear(dateFilter.getFullYear() - 1);
  else dateFilter = new Date(0); // all time

  const [bookings, customersCount, providersCount, topServicesAgg] = await Promise.all([
    Booking.find({ createdAt: { $gte: dateFilter } })
      .populate('service', 'name')
      .sort('createdAt'),
    User.countDocuments({ role: USER_ROLES.CUSTOMER, createdAt: { $gte: dateFilter } }),
    User.countDocuments({ role: USER_ROLES.PROVIDER, createdAt: { $gte: dateFilter } }),
    Booking.aggregate([
      { $match: { createdAt: { $gte: dateFilter } } },
      { $group: { _id: '$service', totalBookings: { $sum: 1 }, totalRevenue: { $sum: '$totalAmount' } } },
      { $sort: { totalBookings: -1 } },
      { $limit: 5 }
    ])
  ]);

  const populatedTopServices = await Service.populate(topServicesAgg, { path: '_id', select: 'name' });

  const completed = bookings.filter((b) => b.status === 'completed');
  const cancelled = bookings.filter((b) => b.status === 'cancelled');
  const totalRevenue = completed.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const platformCommission = Math.round(totalRevenue * 0.2);

  const completionRate = bookings.length > 0 ? Math.round((completed.length / bookings.length) * 100) : 0;
  const cancellationRate = bookings.length > 0 ? Math.round((cancelled.length / bookings.length) * 100) : 0;

  res.status(200).json({
    status: 'success',
    data: {
      range,
      metrics: {
        totalBookings: bookings.length,
        completedBookings: completed.length,
        cancelledBookings: cancelled.length,
        totalRevenue,
        platformCommission,
        completionRate,
        cancellationRate,
        newCustomers: customersCount,
        newProviders: providersCount
      },
      topServices: populatedTopServices.map((s) => ({
        name: s._id?.name || 'Service',
        totalBookings: s.totalBookings,
        totalRevenue: s.totalRevenue
      }))
    }
  });
});

// 10. Notifications Management
exports.getAdminNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find()
    .populate('recipient', 'name email role')
    .sort('-createdAt')
    .limit(50);

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    data: { notifications }
  });
});

exports.sendAdminNotification = catchAsync(async (req, res, next) => {
  const { targetType, targetId, title, message } = req.body;

  if (!title || !message) {
    return next(new AppError('Please provide title and message for notification.', 400));
  }

  let recipients = [];
  if (targetType === 'user' && targetId) {
    recipients = [targetId];
  } else if (targetType === 'customers') {
    const users = await User.find({ role: USER_ROLES.CUSTOMER, isActive: true }).select('_id');
    recipients = users.map((u) => u._id);
  } else if (targetType === 'providers') {
    const users = await User.find({ role: USER_ROLES.PROVIDER, isActive: true }).select('_id');
    recipients = users.map((u) => u._id);
  } else {
    // broadcast all
    const users = await User.find({ isActive: true }).select('_id');
    recipients = users.map((u) => u._id);
  }

  const createdNotifs = [];
  for (const rId of recipients) {
    const n = await sendNotification(req.app, {
      recipient: rId,
      sender: req.user.id,
      type: 'broadcast',
      title,
      message
    });
    if (n) createdNotifs.push(n);
  }

  await logAdminAction({
    adminId: req.user.id,
    action: 'NOTIFICATION_SENT',
    targetType: targetType || 'broadcast',
    details: { title, recipientCount: recipients.length },
    req
  });

  res.status(200).json({
    status: 'success',
    message: `Notification dispatched to ${recipients.length} user(s).`,
    data: { count: recipients.length }
  });
});

// 11. System Settings
exports.getAdminSettings = catchAsync(async (req, res, next) => {
  let settings = await Setting.findOne({ key: 'global_config' });
  if (!settings) {
    settings = await Setting.create({ key: 'global_config' });
  }

  res.status(200).json({
    status: 'success',
    data: { settings }
  });
});

exports.updateAdminSettings = catchAsync(async (req, res, next) => {
  const {
    platformCommission,
    cancellationFeePercent,
    emergencyServiceFee,
    maintenanceMode,
    contactSupportEmail,
    contactSupportPhone
  } = req.body;

  let settings = await Setting.findOne({ key: 'global_config' });
  if (!settings) {
    settings = new Setting({ key: 'global_config' });
  }

  if (platformCommission !== undefined) settings.platformCommission = Number(platformCommission);
  if (cancellationFeePercent !== undefined) settings.cancellationFeePercent = Number(cancellationFeePercent);
  if (emergencyServiceFee !== undefined) settings.emergencyServiceFee = Number(emergencyServiceFee);
  if (maintenanceMode !== undefined) settings.maintenanceMode = Boolean(maintenanceMode);
  if (contactSupportEmail !== undefined) settings.contactSupportEmail = contactSupportEmail;
  if (contactSupportPhone !== undefined) settings.contactSupportPhone = contactSupportPhone;

  await settings.save();

  await logAdminAction({
    adminId: req.user.id,
    action: 'SETTINGS_UPDATED',
    targetType: 'Setting',
    targetId: settings._id,
    details: req.body,
    req
  });

  res.status(200).json({
    status: 'success',
    message: 'System settings updated successfully',
    data: { settings }
  });
});

// 12. Audit Logs
exports.getAuditLogs = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, search = '' } = req.query;

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find()
      .populate('admin', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit)),
    AuditLog.countDocuments()
  ]);

  let filtered = logs;
  if (search) {
    const s = search.toLowerCase();
    filtered = logs.filter(
      (l) =>
        l.action.toLowerCase().includes(s) ||
        l.admin?.name.toLowerCase().includes(s) ||
        l.targetType.toLowerCase().includes(s)
    );
  }

  res.status(200).json({
    status: 'success',
    results: filtered.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: { logs: filtered }
  });
});

// 13. Update Admin Profile
exports.updateAdminProfile = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  const adminUser = await User.findById(req.user.id).select('+password');
  if (!adminUser) return next(new AppError('Admin account not found', 404));

  if (name) adminUser.name = name;
  if (email) adminUser.email = email;
  if (password) adminUser.password = password;

  await adminUser.save();

  await logAdminAction({
    adminId: req.user.id,
    action: 'PROFILE_UPDATED',
    targetType: 'User',
    targetId: adminUser._id,
    req
  });

  adminUser.password = undefined;

  res.status(200).json({
    status: 'success',
    message: 'Admin profile updated successfully',
    data: { user: adminUser }
  });
});

// 14. Admin Payout Management
exports.getAdminPayouts = catchAsync(async (req, res, next) => {
  const Payout = require('../models/Payout');
  const payouts = await Payout.find()
    .populate('provider', 'name email phone avatar providerDetails')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: payouts.length,
    data: { payouts }
  });
});

exports.updateAdminPayoutStatus = catchAsync(async (req, res, next) => {
  const Payout = require('../models/Payout');
  const { id } = req.params;
  const { status, failureReason } = req.body;

  const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid payout status value.', 400));
  }

  const payout = await Payout.findById(id);
  if (!payout) {
    return next(new AppError('Payout record not found.', 404));
  }

  payout.status = status;
  if (status === 'completed') {
    payout.processedAt = new Date();
  }
  if (failureReason !== undefined) {
    payout.failureReason = failureReason;
  }

  await payout.save();

  await logAdminAction({
    adminId: req.user.id,
    action: 'PAYOUT_STATUS_UPDATED',
    targetType: 'Payout',
    targetId: payout._id,
    details: { status, amount: payout.amount, failureReason },
    req
  });

  await sendNotification(req.app, {
    recipient: payout.provider,
    sender: req.user.id,
    type: 'payout_update',
    title: `Payout #${payout.payoutId} ${status.toUpperCase()}`,
    message: `Your payout request #${payout.payoutId} of ₹${payout.amount} is now ${status.toUpperCase()}.${status === 'failed' ? ` Reason: ${failureReason || 'Account issue'}` : ''}`
  });

  res.status(200).json({
    status: 'success',
    message: `Payout status updated to ${status}`,
    data: { payout }
  });
});
