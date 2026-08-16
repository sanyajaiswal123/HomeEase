const Booking = require('../models/Booking');
const User = require('../models/User');
const Service = require('../models/Service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { USER_ROLES, BOOKING_STATUS, PAYMENT_STATUS } = require('../config/constants');

exports.createBooking = catchAsync(async (req, res, next) => {
  const { serviceId, subServicesSelected, scheduledDate, address, providerId } = req.body;

  const service = await Service.findById(serviceId);
  if (!service) {
    return next(new AppError('Selected service category not found.', 404));
  }

  // Calculate total amount
  let totalAmount = service.basePrice;
  if (subServicesSelected && subServicesSelected.length > 0) {
    subServicesSelected.forEach((subName) => {
      const sub = service.subServices.find((s) => s.name === subName);
      if (sub) {
        totalAmount += sub.price;
      }
    });
  }

  // Generate random 4-digit OTP for starting/completing service
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // Provider Assignment Logic
  let assignedProvider = providerId || null;

  // If no providerId is supplied, auto-assign an available provider in this category
  if (!assignedProvider) {
    const activeProvider = await User.findOne({
      role: USER_ROLES.PROVIDER,
      'providerDetails.serviceCategory': serviceId,
      'providerDetails.isVerified': true,
      'providerDetails.isAvailable': true
    });
    if (activeProvider) {
      assignedProvider = activeProvider._id;
    }
  }

  const newBooking = await Booking.create({
    customer: req.user._id,
    provider: assignedProvider,
    service: serviceId,
    subServicesSelected,
    scheduledDate,
    totalAmount,
    address,
    otp,
    trackingLog: [{ status: BOOKING_STATUS.PENDING, timestamp: new Date() }]
  });

  const bookingWithDetails = await Booking.findById(newBooking._id)
    .populate('customer', 'name phone email avatar')
    .populate('provider', 'name phone avatar providerDetails')
    .populate('service', 'name icon description');

  // Socket alert to assigned provider in real-time
  const io = req.app.get('io');
  const connectedUsers = req.app.get('connectedUsers');
  if (assignedProvider && io && connectedUsers) {
    const providerSocketId = connectedUsers.get(assignedProvider.toString());
    if (providerSocketId) {
      io.to(providerSocketId).emit('new_booking_request', bookingWithDetails);
    }
  }

  res.status(201).json({
    status: 'success',
    data: {
      booking: bookingWithDetails
    }
  });
});

exports.getMyBookings = catchAsync(async (req, res, next) => {
  let query = {};
  if (req.user.role === USER_ROLES.CUSTOMER) {
    query.customer = req.user._id;
  } else if (req.user.role === USER_ROLES.PROVIDER) {
    // Find bookings assigned to them OR pending bookings in their service category that are unassigned
    query = {
      $or: [
        { provider: req.user._id },
        {
          provider: null,
          status: BOOKING_STATUS.PENDING,
          service: req.user.providerDetails.serviceCategory
        }
      ]
    };
  }

  const bookings = await Booking.find(query)
    .populate('customer', 'name phone email avatar')
    .populate('provider', 'name phone avatar providerDetails')
    .populate('service', 'name icon description')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings
    }
  });
});

exports.getBookingDetails = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('customer', 'name phone email avatar')
    .populate('provider', 'name phone avatar providerDetails')
    .populate('service', 'name icon description');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Auth validation: make sure the requester belongs to this booking
  if (
    req.user.role !== USER_ROLES.ADMIN &&
    booking.customer._id.toString() !== req.user.id &&
    (!booking.provider || booking.provider._id.toString() !== req.user.id)
  ) {
    return next(new AppError('You do not have permission to view this booking.', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking
    }
  });
});

exports.updateBookingStatus = catchAsync(async (req, res, next) => {
  const { status, otpInput } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('Booking not found.', 404));
  }

  const io = req.app.get('io');
  const connectedUsers = req.app.get('connectedUsers');

  // Customer cancels booking
  if (status === BOOKING_STATUS.CANCELLED && req.user.role === USER_ROLES.CUSTOMER) {
    if (booking.status !== BOOKING_STATUS.PENDING && booking.status !== BOOKING_STATUS.ACCEPTED) {
      return next(new AppError('Cannot cancel booking in active phase.', 400));
    }
    booking.status = BOOKING_STATUS.CANCELLED;
    booking.trackingLog.push({ status: BOOKING_STATUS.CANCELLED, timestamp: new Date() });
  }

  // Provider accepts booking
  else if (status === BOOKING_STATUS.ACCEPTED && req.user.role === USER_ROLES.PROVIDER) {
    if (booking.status !== BOOKING_STATUS.PENDING) {
      return next(new AppError('Booking is already accepted or cancelled.', 400));
    }
    booking.provider = req.user._id;
    booking.status = BOOKING_STATUS.ACCEPTED;
    booking.trackingLog.push({ status: BOOKING_STATUS.ACCEPTED, timestamp: new Date() });
  }

  // Provider starts work (requires Customer OTP Verification)
  else if (status === BOOKING_STATUS.IN_PROGRESS && req.user.role === USER_ROLES.PROVIDER) {
    if (booking.status !== BOOKING_STATUS.ACCEPTED) {
      return next(new AppError('Service can only start after provider acceptance.', 400));
    }
    if (!otpInput || otpInput !== booking.otp) {
      return next(
        new AppError(
          'Invalid OTP code. Please request the customer to provide the correct OTP.',
          400
        )
      );
    }
    booking.status = BOOKING_STATUS.IN_PROGRESS;
    booking.trackingLog.push({ status: BOOKING_STATUS.IN_PROGRESS, timestamp: new Date() });
  }

  // Provider completes work
  else if (status === BOOKING_STATUS.COMPLETED && req.user.role === USER_ROLES.PROVIDER) {
    if (booking.status !== BOOKING_STATUS.IN_PROGRESS) {
      return next(new AppError('Only in-progress jobs can be completed.', 400));
    }
    booking.status = BOOKING_STATUS.COMPLETED;
    booking.paymentStatus = PAYMENT_STATUS.PAID; // Complete checkout payment integration sim
    booking.trackingLog.push({ status: BOOKING_STATUS.COMPLETED, timestamp: new Date() });
  }

  // Admin override
  else if (req.user.role === USER_ROLES.ADMIN) {
    booking.status = status;
    if (req.body.paymentStatus) {
      booking.paymentStatus = req.body.paymentStatus;
    }
    booking.trackingLog.push({ status, timestamp: new Date() });
  } else {
    return next(new AppError('Invalid status transition request.', 403));
  }

  await booking.save();

  const updatedBooking = await Booking.findById(booking._id)
    .populate('customer', 'name phone email avatar')
    .populate('provider', 'name phone avatar providerDetails')
    .populate('service', 'name icon description');

  // Notify client in real-time
  if (io && connectedUsers) {
    const customerSocketId = connectedUsers.get(updatedBooking.customer._id.toString());
    const providerSocketId = updatedBooking.provider
      ? connectedUsers.get(updatedBooking.provider._id.toString())
      : null;

    if (customerSocketId) {
      io.to(customerSocketId).emit('booking_status_updated', updatedBooking);
    }
    if (providerSocketId) {
      io.to(providerSocketId).emit('booking_status_updated', updatedBooking);
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking: updatedBooking
    }
  });
});
