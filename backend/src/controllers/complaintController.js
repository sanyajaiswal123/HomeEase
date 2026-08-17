const Complaint = require('../models/Complaint');
const Booking = require('../models/Booking');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendNotification } = require('../utils/notificationHelper');

exports.createComplaint = catchAsync(async (req, res, next) => {
  const { bookingId, subject, description, priority, category } = req.body;

  if (!subject || !description) {
    return next(new AppError('Please provide a subject and detailed description.', 400));
  }

  let bookingObj = null;
  let targetProviderId = null;

  if (bookingId) {
    bookingObj = await Booking.findById(bookingId);
    if (!bookingObj) {
      return next(new AppError('Associated booking not found.', 404));
    }

    if (bookingObj.customer.toString() !== req.user.id && bookingObj.provider?.toString() !== req.user.id) {
      return next(new AppError('You can only file support tickets for your own bookings.', 403));
    }
    targetProviderId = bookingObj.provider;
  } else if (req.user.role === 'provider') {
    targetProviderId = req.user._id;
  }

  const complaint = await Complaint.create({
    user: req.user.id,
    booking: bookingId || null,
    provider: targetProviderId,
    category: category || 'booking_problem',
    subject: subject.trim(),
    description: description.trim(),
    priority: priority || 'medium',
    status: 'open',
    messages: [
      {
        sender: req.user.id,
        senderRole: req.user.role,
        message: description.trim(),
        createdAt: new Date()
      }
    ],
    history: [
      {
        status: 'open',
        note: `Ticket created by ${req.user.role} (${req.user.name})`,
        author: req.user.id,
        timestamp: new Date()
      }
    ]
  });

  const populatedComplaint = await Complaint.findById(complaint._id)
    .populate('user', 'name email avatar phone')
    .populate('provider', 'name email avatar')
    .populate({
      path: 'booking',
      populate: { path: 'service', select: 'name' }
    });

  res.status(201).json({
    status: 'success',
    message: 'Support ticket submitted successfully.',
    data: { complaint: populatedComplaint }
  });
});

exports.getMyComplaints = catchAsync(async (req, res, next) => {
  const { status, search } = req.query;

  let query = {};
  if (req.user.role === 'provider') {
    query.$or = [{ user: req.user._id }, { provider: req.user._id }];
  } else {
    query.user = req.user._id;
  }

  if (status && status !== 'all') {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { subject: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const complaints = await Complaint.find(query)
    .populate('user', 'name email avatar phone')
    .populate('provider', 'name email avatar')
    .populate({
      path: 'booking',
      populate: { path: 'service', select: 'name' }
    })
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: complaints.length,
    data: { complaints }
  });
});

exports.getComplaintDetails = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const complaint = await Complaint.findById(id)
    .populate('user', 'name email avatar phone')
    .populate('provider', 'name email avatar phone')
    .populate({
      path: 'booking',
      populate: [{ path: 'service', select: 'name basePrice' }, { path: 'customer', select: 'name phone' }]
    })
    .populate('messages.sender', 'name avatar role');

  if (!complaint) {
    return next(new AppError('Support ticket not found.', 404));
  }

  // Authorization check
  const isOwner = complaint.user?._id?.toString() === req.user.id;
  const isTargetProvider = complaint.provider?._id?.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isTargetProvider && !isAdmin) {
    return next(new AppError('You are not authorized to view this support ticket.', 403));
  }

  res.status(200).json({
    status: 'success',
    data: { complaint }
  });
});

exports.replyToComplaint = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return next(new AppError('Please provide a reply message.', 400));
  }

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    return next(new AppError('Support ticket not found.', 404));
  }

  // Authorization check
  const isOwner = complaint.user.toString() === req.user.id;
  const isTargetProvider = complaint.provider?.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isTargetProvider && !isAdmin) {
    return next(new AppError('You are not authorized to reply to this ticket.', 403));
  }

  if (complaint.status === 'closed') {
    return next(new AppError('This ticket is permanently closed. Please create a new ticket or request reopening.', 400));
  }

  complaint.messages.push({
    sender: req.user.id,
    senderRole: req.user.role,
    message: message.trim(),
    createdAt: new Date()
  });

  // Notify recipient
  let recipientId = null;
  if (req.user.id === complaint.user.toString()) {
    recipientId = complaint.provider || complaint.assignedTo;
  } else {
    recipientId = complaint.user;
  }

  if (recipientId) {
    await sendNotification(req.app, {
      recipient: recipientId,
      sender: req.user.id,
      type: 'system',
      title: `Update on Ticket #${complaint._id.toString().slice(-6)}`,
      message: `New response from ${req.user.name}: "${message.trim().slice(0, 60)}..."`
    });
  }

  await complaint.save();

  const updatedComplaint = await Complaint.findById(id)
    .populate('user', 'name email avatar phone')
    .populate('provider', 'name email avatar phone')
    .populate('messages.sender', 'name avatar role');

  res.status(200).json({
    status: 'success',
    message: 'Reply submitted successfully.',
    data: { complaint: updatedComplaint }
  });
});

exports.reopenComplaint = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const complaint = await Complaint.findById(id);

  if (!complaint) {
    return next(new AppError('Support ticket not found.', 404));
  }

  const isOwner = complaint.user.toString() === req.user.id;
  const isTargetProvider = complaint.provider?.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isTargetProvider && !isAdmin) {
    return next(new AppError('You are not authorized to reopen this ticket.', 403));
  }

  if (complaint.status !== 'resolved') {
    return next(new AppError('Only resolved tickets can be reopened.', 400));
  }

  complaint.status = 'open';
  complaint.history.push({
    status: 'open',
    note: `Ticket reopened by ${req.user.name}`,
    author: req.user.id,
    timestamp: new Date()
  });

  await complaint.save();

  res.status(200).json({
    status: 'success',
    message: 'Ticket reopened successfully.',
    data: { complaint }
  });
});
