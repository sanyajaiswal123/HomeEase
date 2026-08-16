const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const catchAsync = require('../utils/catchAsync');
const { USER_ROLES } = require('../config/constants');

exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const totalCustomers = await User.countDocuments({ role: USER_ROLES.CUSTOMER });
  const totalProviders = await User.countDocuments({ role: USER_ROLES.PROVIDER });
  const pendingVerifications = await User.countDocuments({
    role: USER_ROLES.PROVIDER,
    'providerDetails.isVerified': false
  });

  const totalServices = await Service.countDocuments();
  const allBookings = await Booking.find();

  const completedBookings = allBookings.filter((b) => b.status === 'completed');
  const totalRevenue = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const platformRevenue = Math.round(totalRevenue * 0.2); // 20% cut

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalCustomers,
        totalProviders,
        pendingVerifications,
        totalServices,
        totalBookings: allBookings.length,
        totalRevenue,
        platformRevenue
      }
    }
  });
});

exports.getAllCustomers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search = '', status = 'all' } = req.query;

  const query = { role: USER_ROLES.CUSTOMER };

  // Search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  // Status filter
  if (status === 'active') {
    query.isActive = true;
    query.isBlocked = false;
  } else if (status === 'blocked') {
    query.isBlocked = true;
    query.isActive = true;
  } else if (status === 'deleted') {
    query.isActive = false;
  } else {
    // default 'all' shows only non-deleted
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

exports.getAllProviders = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search = '', status = 'all' } = req.query;

  const query = { role: USER_ROLES.PROVIDER };

  // Search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Status filter
  if (status === 'active') {
    query.isActive = true;
    query.isBlocked = false;
  } else if (status === 'blocked') {
    query.isBlocked = true;
    query.isActive = true;
  } else if (status === 'deleted') {
    query.isActive = false;
  } else {
    // default 'all' shows only non-deleted
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

exports.toggleBlockUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found', 404));

  user.isBlocked = !user.isBlocked;
  await user.save({ validateBeforeSave: false });

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

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getPendingVerifications = catchAsync(async (req, res, next) => {
  const providers = await User.find({
    role: USER_ROLES.PROVIDER,
    'providerDetails.verificationStatus': 'pending'
  })
    .populate('providerDetails.serviceCategory')
    .select('-password');

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
    reason: 'Documents verified and approved by administration.'
  });

  await provider.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Provider approved successfully',
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
    reason
  });

  await provider.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Provider rejected successfully',
    data: { provider }
  });
});

exports.getAllBookings = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search = '', status = 'all' } = req.query;

  let query = {};

  if (status !== 'all') {
    query.status = status;
  }

  // To search across populated fields like Customer/Provider name, we fetch all matching docs if a search exists,
  // or we can just search Booking ID if that's easier. Since Booking doesn't have text fields itself,
  // we will filter populated data after fetching if search is present, OR use a more advanced aggregation.
  // For simplicity and stability with Mongoose pagination, we'll search by Booking ID (last 6 chars) or rely on client-side search for deep matches.
  // Wait, let's just do a basic fetch and populate.

  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('customer', 'name email phone')
      .populate('provider', 'name email phone')
      .populate('service', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit)),
    Booking.countDocuments(query)
  ]);

  // If there's a search term, we can filter in memory (not ideal for huge datasets, but works for monolithic scale)
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
  booking.trackingLog.push({
    status: 'cancelled',
    timestamp: Date.now()
  });

  await booking.save();

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
    return next(new AppError('Invalid provider', 400));
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

  res.status(200).json({
    status: 'success',
    message: 'Provider assigned successfully',
    data: { booking }
  });
});

const Complaint = require('../models/Complaint');

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
      .sort({ priority: -1, createdAt: -1 }) // custom sort would need aggregation for enums, so we'll just sort by createdAt for now
      .skip(skip)
      .limit(parseInt(limit)),
    Complaint.countDocuments(query)
  ]);

  res.status(200).json({
    status: 'success',
    results: complaints.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: { complaints }
  });
});

exports.assignComplaint = catchAsync(async (req, res, next) => {
  const { adminId } = req.body; // Can be req.user.id if assigning to self
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

  res.status(200).json({
    status: 'success',
    data: { complaint }
  });
});

const Review = require('../models/Review');

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

  // Client-side filtering for search on populated names
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

  res.status(200).json({
    status: 'success',
    message: `Review is now ${review.isHidden ? 'hidden' : 'visible'}`,
    data: { review }
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));

  res.status(204).json({
    status: 'success',
    data: null
  });
});
