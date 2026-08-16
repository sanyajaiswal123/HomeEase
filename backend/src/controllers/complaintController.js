const Complaint = require('../models/Complaint');
const Booking = require('../models/Booking');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.createComplaint = catchAsync(async (req, res, next) => {
  const { bookingId, subject, description, priority } = req.body;

  if (!bookingId || !subject || !description) {
    return next(new AppError('Please provide booking ID, subject, and description.', 400));
  }

  // Ensure booking exists
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return next(new AppError('Booking not found.', 404));
  }

  // Ensure user is part of the booking (customer or provider)
  if (booking.customer.toString() !== req.user.id && booking.provider?.toString() !== req.user.id) {
    return next(new AppError('You can only file complaints for your own bookings.', 403));
  }

  const complaint = await Complaint.create({
    user: req.user.id,
    booking: bookingId,
    subject,
    description,
    priority: priority || 'medium',
    history: [
      {
        status: 'open',
        note: 'Complaint filed by user.',
        author: req.user.id
      }
    ]
  });

  res.status(201).json({
    status: 'success',
    data: { complaint }
  });
});

exports.getMyComplaints = catchAsync(async (req, res, next) => {
  const complaints = await Complaint.find({ user: req.user.id })
    .populate('booking')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: complaints.length,
    data: { complaints }
  });
});
