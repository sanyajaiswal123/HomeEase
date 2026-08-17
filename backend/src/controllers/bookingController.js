const Booking = require('../models/Booking');
const User = require('../models/User');
const Service = require('../models/Service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { USER_ROLES, BOOKING_STATUS, PAYMENT_STATUS } = require('../config/constants');

exports.createBooking = catchAsync(async (req, res, next) => {
  const { serviceId, subServicesSelected, scheduledDate, address, providerId } = req.body;

  if (!scheduledDate) {
    return next(new AppError('Please specify a scheduled date and time.', 400));
  }

  const requestedDate = new Date(scheduledDate);
  if (isNaN(requestedDate.getTime())) {
    return next(new AppError('Invalid scheduled date format.', 400));
  }

  if (requestedDate < new Date()) {
    return next(new AppError('Cannot book a service for a past date or time.', 400));
  }

  const service = await Service.findById(serviceId);
  if (!service) {
    return next(new AppError('Selected service category not found.', 404));
  }

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

  // AVAILABILITY & DOUBLE BOOKING VERIFICATION
  if (assignedProvider) {
    const providerUser = await User.findById(assignedProvider);
    if (!providerUser || !providerUser.providerDetails?.isAvailable) {
      return next(new AppError('Selected provider is currently offline or unavailable.', 400));
    }

    // LOCATION & SERVICE AREA VALIDATION
    if (address && (address.city || address.zipCode)) {
      const servedCities = providerUser.providerDetails?.servedCities || [];
      const servedZipCodes = providerUser.providerDetails?.servedZipCodes || [];
      const mainCity = providerUser.address?.city || '';

      const bookingCity = (address.city || '').trim().toLowerCase();
      const bookingZip = (address.zipCode || '').trim();

      if (servedCities.length > 0) {
        const isServed =
          servedCities.some((c) => c.toLowerCase() === bookingCity) ||
          (mainCity && mainCity.toLowerCase() === bookingCity) ||
          servedZipCodes.includes(bookingZip);

        if (!isServed) {
          return next(
            new AppError(
              `Selected provider does not offer service in ${address.city || 'your area'}. Please select a provider serving your locality.`,
              400
            )
          );
        }
      }
    }

    const dateStr = requestedDate.toISOString().split('T')[0];
    const blockedDates = providerUser.providerDetails?.blockedDates || [];
    if (blockedDates.some((b) => b.date === dateStr)) {
      return next(new AppError(`Selected provider is marked unavailable on ${dateStr}.`, 400));
    }

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[requestedDate.getDay()];
    const dayWorkingHours = providerUser.providerDetails?.workingHours?.[dayOfWeek];

    if (dayWorkingHours && dayWorkingHours.isEnabled === false) {
      return next(new AppError(`Selected provider does not work on ${dayOfWeek.toUpperCase()}s.`, 400));
    }

    const windowStart = new Date(requestedDate.getTime() - 45 * 60 * 1000);
    const windowEnd = new Date(requestedDate.getTime() + 45 * 60 * 1000);

    const conflictingBooking = await Booking.findOne({
      provider: assignedProvider,
      status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.ON_THE_WAY, BOOKING_STATUS.IN_PROGRESS] },
      scheduledDate: { $gte: windowStart, $lte: windowEnd }
    });

    if (conflictingBooking) {
      return next(new AppError('This provider already has a booking scheduled at this time. Please select another time slot.', 409));
    }
  }

  // Calculate base & original total amount
  let originalAmount = service.basePrice;
  if (subServicesSelected && subServicesSelected.length > 0) {
    subServicesSelected.forEach((subName) => {
      const sub = service.subServices.find((s) => s.name === subName);
      if (sub) {
        originalAmount += sub.price;
      }
    });
  }

  let discountAmount = 0;
  let appliedOfferId = null;
  let offerCodeApplied = '';

  // SERVER-SIDE OFFER & DISCOUNT VALIDATION (NEVER TRUST FRONTEND PRICE!)
  const { offerCode, offerId } = req.body;
  if ((offerCode || offerId) && assignedProvider) {
    const Offer = require('../models/Offer');
    let offerQuery = {};
    if (offerId) offerQuery._id = offerId;
    if (offerCode) offerQuery.code = offerCode.trim().toUpperCase();

    const validOffer = await Offer.findOne({
      ...offerQuery,
      provider: assignedProvider,
      isActive: true
    });

    const now = new Date();
    if (
      validOffer &&
      validOffer.startDate <= now &&
      validOffer.endDate >= now &&
      validOffer.usedCount < validOffer.usageLimit
    ) {
      if (!validOffer.minBookingAmount || originalAmount >= validOffer.minBookingAmount) {
        if (validOffer.discountType === 'percentage') {
          discountAmount = Math.round((originalAmount * validOffer.discountValue) / 100);
        } else {
          discountAmount = validOffer.discountValue;
        }
        discountAmount = Math.min(discountAmount, originalAmount - 1);
        appliedOfferId = validOffer._id;
        offerCodeApplied = validOffer.code;

        // Increment offer usage count
        validOffer.usedCount += 1;
        await validOffer.save();
      }
    }
  }

  const totalAmount = Math.max(1, originalAmount - discountAmount);

  // Generate random 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  const newBooking = await Booking.create({
    customer: req.user._id,
    provider: assignedProvider,
    service: serviceId,
    subServicesSelected,
    scheduledDate: requestedDate,
    originalAmount,
    discountAmount,
    appliedOffer: appliedOfferId,
    offerCode: offerCodeApplied,
    totalAmount,
    address,
    otp,
    trackingLog: [{ status: BOOKING_STATUS.PENDING, timestamp: new Date() }]
  });

  const bookingWithDetails = await Booking.findById(newBooking._id)
    .populate('customer', 'name phone email avatar')
    .populate('provider', 'name phone avatar providerDetails')
    .populate('service', 'name icon description');

  const io = req.app.get('io');
  const connectedUsers = req.app.get('connectedUsers');
  const { sendNotification } = require('../utils/notificationHelper');

  if (assignedProvider) {
    await sendNotification(req.app, {
      recipient: assignedProvider,
      sender: req.user._id,
      type: 'new_booking',
      title: 'New Service Booking Request 🔔',
      message: `You have received a new booking request for ${service.name} from ${req.user.name} scheduled for ${requestedDate.toLocaleDateString('en-IN')}.`,
      link: '/provider-bookings'
    });

    if (io && connectedUsers) {
      const providerSocketId = connectedUsers.get(assignedProvider.toString());
      if (providerSocketId) {
        io.to(providerSocketId).emit('new_booking_request', bookingWithDetails);
      }
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
  const { status, otpInput, reason } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('Booking not found.', 404));
  }

  // Final states cannot be changed
  if (booking.status === BOOKING_STATUS.COMPLETED || booking.status === BOOKING_STATUS.CANCELLED) {
    return next(
      new AppError(
        `Cannot modify booking #${booking._id.toString().slice(-6).toUpperCase()} because it is already ${booking.status}.`,
        400
      )
    );
  }

  // Provider Ownership check (if not admin/customer)
  if (
    req.user.role === USER_ROLES.PROVIDER &&
    booking.provider &&
    booking.provider.toString() !== req.user.id
  ) {
    return next(new AppError('You are not authorized to update another provider\'s booking.', 403));
  }

  const { sendNotification } = require('../utils/notificationHelper');
  const io = req.app.get('io');
  const connectedUsers = req.app.get('connectedUsers');

  // STATUS TRANSITION WORKFLOW LOGIC
  // 1. Cancellation / Rejection
  if (status === BOOKING_STATUS.CANCELLED) {
    if (req.user.role === USER_ROLES.CUSTOMER) {
      if (booking.status !== BOOKING_STATUS.PENDING && booking.status !== BOOKING_STATUS.ACCEPTED) {
        return next(new AppError('Cannot cancel booking during active or completed service visit.', 400));
      }
    } else if (req.user.role === USER_ROLES.PROVIDER) {
      if (booking.status !== BOOKING_STATUS.PENDING && booking.status !== BOOKING_STATUS.ACCEPTED && booking.status !== BOOKING_STATUS.ON_THE_WAY) {
        return next(new AppError('Cannot decline booking once service visit has started.', 400));
      }
    }

    booking.status = BOOKING_STATUS.CANCELLED;
    booking.trackingLog.push({
      status: req.user.role === USER_ROLES.PROVIDER ? 'rejected_by_provider' : BOOKING_STATUS.CANCELLED,
      timestamp: new Date()
    });

    if (booking.customer) {
      await sendNotification(req.app, {
        recipient: booking.customer,
        sender: req.user.id,
        type: 'booking_cancelled',
        title: 'Booking Cancelled',
        message: `Booking #${booking._id.toString().slice(-6).toUpperCase()} has been cancelled. ${reason ? `Reason: "${reason}"` : ''}`
      });
    }
  }

  // 2. Accept Booking (Pending -> Accepted)
  else if (status === BOOKING_STATUS.ACCEPTED && req.user.role === USER_ROLES.PROVIDER) {
    if (booking.status !== BOOKING_STATUS.PENDING) {
      return next(new AppError('This booking request has already been accepted or processed.', 400));
    }
    if (booking.provider && booking.provider.toString() !== req.user._id.toString()) {
      return next(new AppError('This service request has already been accepted by another provider.', 409));
    }

    booking.provider = req.user._id;
    booking.status = BOOKING_STATUS.ACCEPTED;
    booking.trackingLog.push({ status: BOOKING_STATUS.ACCEPTED, timestamp: new Date() });

    await sendNotification(req.app, {
      recipient: booking.customer,
      sender: req.user.id,
      type: 'booking_update',
      title: 'Booking Accepted! 🎉',
      message: `Your booking request #${booking._id.toString().slice(-6).toUpperCase()} has been accepted by ${req.user.name}.`
    });
  }

  // 3. Provider On The Way (Accepted -> On The Way)
  else if (status === BOOKING_STATUS.ON_THE_WAY && req.user.role === USER_ROLES.PROVIDER) {
    if (booking.status !== BOOKING_STATUS.ACCEPTED) {
      return next(new AppError('Provider can only set "On The Way" status after accepting the booking.', 400));
    }

    booking.status = BOOKING_STATUS.ON_THE_WAY;
    booking.trackingLog.push({ status: BOOKING_STATUS.ON_THE_WAY, timestamp: new Date() });

    await sendNotification(req.app, {
      recipient: booking.customer,
      sender: req.user.id,
      type: 'booking_update',
      title: 'Provider On The Way 🚗',
      message: `${req.user.name} is now on the way to your location for booking #${booking._id.toString().slice(-6).toUpperCase()}.`
    });
  }

  // 4. Start Service Visit (On The Way or Accepted -> In Progress, requires 4-digit OTP)
  else if (status === BOOKING_STATUS.IN_PROGRESS && req.user.role === USER_ROLES.PROVIDER) {
    if (booking.status !== BOOKING_STATUS.ACCEPTED && booking.status !== BOOKING_STATUS.ON_THE_WAY) {
      return next(new AppError('Service can only be started after provider acceptance or while on the way.', 400));
    }
    if (!otpInput || otpInput !== booking.otp) {
      return next(
        new AppError('Invalid OTP code. Please ask the customer for the correct 4-digit OTP displayed on their screen.', 400)
      );
    }

    booking.status = BOOKING_STATUS.IN_PROGRESS;
    booking.trackingLog.push({ status: BOOKING_STATUS.IN_PROGRESS, timestamp: new Date() });

    await sendNotification(req.app, {
      recipient: booking.customer,
      sender: req.user.id,
      type: 'booking_update',
      title: 'Service Visit Started ⚡',
      message: `OTP verified! ${req.user.name} has started work for booking #${booking._id.toString().slice(-6).toUpperCase()}. Live tracking beacon is active.`
    });
  }

  // 5. Complete Service (In Progress -> Completed)
  else if (status === BOOKING_STATUS.COMPLETED && req.user.role === USER_ROLES.PROVIDER) {
    if (booking.status !== BOOKING_STATUS.IN_PROGRESS) {
      return next(new AppError('Only active in-progress jobs can be marked as completed.', 400));
    }

    booking.status = BOOKING_STATUS.COMPLETED;
    booking.paymentStatus = PAYMENT_STATUS.PAID;
    booking.trackingLog.push({ status: BOOKING_STATUS.COMPLETED, timestamp: new Date() });

    await sendNotification(req.app, {
      recipient: booking.customer,
      sender: req.user.id,
      type: 'booking_update',
      title: 'Service Completed! ✅',
      message: `Service work for booking #${booking._id.toString().slice(-6).toUpperCase()} has been completed. Thank you for using HomeEase!`
    });
  }

  // 6. Admin Override
  else if (req.user.role === USER_ROLES.ADMIN) {
    booking.status = status;
    if (req.body.paymentStatus) {
      booking.paymentStatus = req.body.paymentStatus;
    }
    booking.trackingLog.push({ status, timestamp: new Date() });
  } else {
    return next(new AppError('Invalid status transition request.', 400));
  }

  await booking.save();

  const updatedBooking = await Booking.findById(booking._id)
    .populate('customer', 'name phone email avatar')
    .populate('provider', 'name phone avatar providerDetails')
    .populate('service', 'name icon description');

  // Notify real-time Socket rooms
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

exports.getProviderDashboardStats = catchAsync(async (req, res, next) => {
  if (req.user.role !== USER_ROLES.PROVIDER) {
    return next(new AppError('Only providers can access provider dashboard stats.', 403));
  }

  const providerId = req.user._id;
  const serviceCategory = req.user.providerDetails?.serviceCategory;

  // 1. Fetch all bookings assigned to this provider
  const assignedBookings = await Booking.find({ provider: providerId })
    .populate('customer', 'name phone email avatar')
    .populate('service', 'name icon basePrice')
    .sort('-createdAt');

  // 2. Fetch pending unassigned bookings in provider's service category (open requests)
  let pendingCategoryBookings = [];
  if (serviceCategory) {
    pendingCategoryBookings = await Booking.find({
      provider: null,
      status: BOOKING_STATUS.PENDING,
      service: serviceCategory
    })
      .populate('customer', 'name phone email avatar')
      .populate('service', 'name icon basePrice')
      .sort('-createdAt');
  }

  const completedBookings = assignedBookings.filter((b) => b.status === BOOKING_STATUS.COMPLETED);
  const acceptedBookings = assignedBookings.filter(
    (b) => b.status === BOOKING_STATUS.ACCEPTED || b.status === BOOKING_STATUS.IN_PROGRESS
  );
  const cancelledBookings = assignedBookings.filter((b) => b.status === BOOKING_STATUS.CANCELLED);

  // Today's Date calculations
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const todaysBookings = assignedBookings.filter(
    (b) => new Date(b.scheduledDate) >= startOfToday && new Date(b.scheduledDate) <= endOfToday
  );

  const upcomingBookings = assignedBookings.filter(
    (b) => new Date(b.scheduledDate) > endOfToday && (b.status === BOOKING_STATUS.ACCEPTED || b.status === BOOKING_STATUS.PENDING || b.status === BOOKING_STATUS.IN_PROGRESS)
  );

  // Earnings calculations (80% net payout after 20% platform cut)
  const totalEarnings = completedBookings.reduce((sum, b) => sum + Math.round((b.totalAmount || 0) * 0.8), 0);
  const pendingEarnings = acceptedBookings.reduce((sum, b) => sum + Math.round((b.totalAmount || 0) * 0.8), 0);

  // Notifications for this provider
  const Notification = require('../models/Notification');
  const recentNotifications = await Notification.find({ recipient: providerId })
    .sort('-createdAt')
    .limit(5);

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalBookings: assignedBookings.length,
        pendingRequestsCount: pendingCategoryBookings.length,
        acceptedCount: acceptedBookings.length,
        completedCount: completedBookings.length,
        cancelledCount: cancelledBookings.length,
        todaysCount: todaysBookings.length,
        upcomingCount: upcomingBookings.length,
        totalEarnings,
        pendingEarnings,
        rating: req.user.providerDetails?.rating || 5.0,
        isAvailable: req.user.providerDetails?.isAvailable || false,
        verificationStatus: req.user.providerDetails?.verificationStatus || 'pending'
      },
      pendingRequests: pendingCategoryBookings,
      activeBookings: acceptedBookings,
      todaysBookings,
      upcomingBookings,
      recentBookings: assignedBookings.slice(0, 5),
      recentNotifications
    }
  });
});

exports.getAvailableTimeSlots = catchAsync(async (req, res, next) => {
  const { providerId, date } = req.query;

  if (!providerId || !date) {
    return next(new AppError('Please provide providerId and date (YYYY-MM-DD).', 400));
  }

  const providerUser = await User.findById(providerId);
  if (!providerUser || providerUser.role !== USER_ROLES.PROVIDER) {
    return next(new AppError('Provider not found.', 404));
  }

  const isAvailable = providerUser.providerDetails?.isAvailable;
  const blockedDates = providerUser.providerDetails?.blockedDates || [];
  const isBlocked = blockedDates.some((b) => b.date === date);

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const targetDateObj = new Date(date);
  const dayOfWeek = days[targetDateObj.getDay()];
  const dayConfig = providerUser.providerDetails?.workingHours?.[dayOfWeek] || { isEnabled: true, startTime: '09:00', endTime: '18:00' };

  if (!isAvailable || isBlocked || !dayConfig.isEnabled) {
    return res.status(200).json({
      status: 'success',
      data: {
        isAvailable: false,
        reason: isBlocked ? 'Date blocked by provider' : 'Provider not available on this day',
        slots: []
      }
    });
  }

  const startOfDay = new Date(`${date}T00:00:00.000Z`);
  const endOfDay = new Date(`${date}T23:59:59.999Z`);

  const existingBookings = await Booking.find({
    provider: providerId,
    status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.ON_THE_WAY, BOOKING_STATUS.IN_PROGRESS] },
    scheduledDate: { $gte: startOfDay, $lte: endOfDay }
  });

  const bookedTimes = existingBookings.map((b) => new Date(b.scheduledDate).toTimeString().slice(0, 5));

  const startHour = parseInt(dayConfig.startTime.split(':')[0], 10) || 9;
  const endHour = parseInt(dayConfig.endTime.split(':')[0], 10) || 18;
  const breakConfig = providerUser.providerDetails?.breakHours;

  const slots = [];
  for (let h = startHour; h < endHour; h++) {
    const timeStr = `${h.toString().padStart(2, '0')}:00`;
    let slotAvailable = true;

    if (breakConfig?.isEnabled && timeStr >= breakConfig.startTime && timeStr < breakConfig.endTime) {
      slotAvailable = false;
    }

    if (bookedTimes.includes(timeStr)) {
      slotAvailable = false;
    }

    slots.push({
      time: timeStr,
      isAvailable: slotAvailable
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      isAvailable: true,
      dayOfWeek,
      workingHours: dayConfig,
      slots
    }
  });
});

exports.getMyAvailabilitySettings = catchAsync(async (req, res, next) => {
  if (req.user.role !== USER_ROLES.PROVIDER) {
    return next(new AppError('Only providers can access availability settings.', 403));
  }

  const user = await User.findById(req.user._id);

  res.status(200).json({
    status: 'success',
    data: {
      isAvailable: user.providerDetails?.isAvailable ?? true,
      workingHours: user.providerDetails?.workingHours || {},
      breakHours: user.providerDetails?.breakHours || {},
      blockedDates: user.providerDetails?.blockedDates || []
    }
  });
});

exports.updateMyAvailabilitySettings = catchAsync(async (req, res, next) => {
  if (req.user.role !== USER_ROLES.PROVIDER) {
    return next(new AppError('Only providers can update availability settings.', 403));
  }

  const { workingHours, breakHours, blockedDates, isAvailable } = req.body;

  const user = await User.findById(req.user._id);

  if (isAvailable !== undefined) {
    user.providerDetails.isAvailable = isAvailable;
  }
  if (workingHours !== undefined) {
    user.providerDetails.workingHours = {
      ...user.providerDetails.workingHours,
      ...workingHours
    };
  }
  if (breakHours !== undefined) {
    user.providerDetails.breakHours = {
      ...user.providerDetails.breakHours,
      ...breakHours
    };
  }
  if (blockedDates !== undefined) {
    user.providerDetails.blockedDates = blockedDates;
  }

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Availability settings updated successfully',
    data: {
      isAvailable: user.providerDetails.isAvailable,
      workingHours: user.providerDetails.workingHours,
      breakHours: user.providerDetails.breakHours,
      blockedDates: user.providerDetails.blockedDates
    }
  });
});

// Provider Customer Management Functions
exports.getProviderCustomers = catchAsync(async (req, res, next) => {
  if (req.user.role !== USER_ROLES.PROVIDER) {
    return next(new AppError('Only providers can access provider customer management.', 403));
  }

  const providerId = req.user._id;
  const { search = '', filter = 'all' } = req.query;

  const bookings = await Booking.find({ provider: providerId })
    .populate('customer', 'name phone email avatar address createdAt')
    .populate('service', 'name icon basePrice')
    .sort('-createdAt');

  const customersMap = new Map();

  bookings.forEach((b) => {
    if (!b.customer) return;
    const custId = b.customer._id.toString();

    if (!customersMap.has(custId)) {
      customersMap.set(custId, {
        customer: {
          _id: b.customer._id,
          name: b.customer.name,
          email: b.customer.email,
          phone: b.customer.phone,
          avatar: b.customer.avatar,
          address: b.address || b.customer.address,
          createdAt: b.customer.createdAt
        },
        totalBookings: 0,
        completedBookings: 0,
        pendingBookings: 0,
        acceptedBookings: 0,
        cancelledBookings: 0,
        lastBookingDate: b.scheduledDate || b.createdAt,
        firstBookingDate: b.createdAt,
        bookings: []
      });
    }

    const item = customersMap.get(custId);
    item.totalBookings += 1;
    if (b.status === BOOKING_STATUS.COMPLETED) item.completedBookings += 1;
    if (b.status === BOOKING_STATUS.PENDING) item.pendingBookings += 1;
    if (b.status === BOOKING_STATUS.ACCEPTED || b.status === BOOKING_STATUS.IN_PROGRESS || b.status === BOOKING_STATUS.ON_THE_WAY) item.acceptedBookings += 1;
    if (b.status === BOOKING_STATUS.CANCELLED) item.cancelledBookings += 1;

    item.bookings.push({
      _id: b._id,
      service: b.service,
      scheduledDate: b.scheduledDate,
      totalAmount: b.totalAmount,
      status: b.status,
      paymentStatus: b.paymentStatus
    });
  });

  let customerList = Array.from(customersMap.values());

  if (search.trim()) {
    const q = search.toLowerCase();
    customerList = customerList.filter(
      (c) =>
        c.customer.name.toLowerCase().includes(q) ||
        c.customer.phone.toLowerCase().includes(q) ||
        c.customer.email.toLowerCase().includes(q) ||
        c.bookings.some((b) => b._id.toString().toLowerCase().includes(q))
    );
  }

  if (filter === 'upcoming') {
    customerList = customerList.filter((c) => c.acceptedBookings > 0);
  } else if (filter === 'completed') {
    customerList = customerList.filter((c) => c.completedBookings > 0);
  } else if (filter === 'new') {
    customerList = customerList.filter((c) => c.totalBookings === 1);
  } else if (filter === 'returning') {
    customerList = customerList.filter((c) => c.totalBookings > 1);
  }

  const totalCustomers = customersMap.size;
  const newCustomers = customerList.filter((c) => c.totalBookings === 1).length;
  const returningCustomers = customerList.filter((c) => c.totalBookings > 1).length;

  res.status(200).json({
    status: 'success',
    results: customerList.length,
    data: {
      stats: {
        totalCustomers,
        newCustomers,
        returningCustomers
      },
      customers: customerList
    }
  });
});

exports.getProviderCustomerDetails = catchAsync(async (req, res, next) => {
  if (req.user.role !== USER_ROLES.PROVIDER) {
    return next(new AppError('Only providers can access provider customer details.', 403));
  }

  const providerId = req.user._id;
  const customerId = req.params.customerId;

  const customerBookings = await Booking.find({
    provider: providerId,
    customer: customerId
  })
    .populate('customer', 'name phone email avatar address createdAt')
    .populate('service', 'name icon basePrice description')
    .sort('-createdAt');

  if (!customerBookings || customerBookings.length === 0) {
    return next(
      new AppError(
        'Customer record not found or you do not have a booking relationship with this customer.',
        403
      )
    );
  }

  const customerObj = customerBookings[0].customer;

  const completedCount = customerBookings.filter((b) => b.status === BOOKING_STATUS.COMPLETED).length;
  const upcomingCount = customerBookings.filter(
    (b) => b.status === BOOKING_STATUS.ACCEPTED || b.status === BOOKING_STATUS.IN_PROGRESS || b.status === BOOKING_STATUS.ON_THE_WAY
  ).length;
  const pendingCount = customerBookings.filter((b) => b.status === BOOKING_STATUS.PENDING).length;
  const cancelledCount = customerBookings.filter((b) => b.status === BOOKING_STATUS.CANCELLED).length;

  res.status(200).json({
    status: 'success',
    data: {
      customer: {
        _id: customerObj._id,
        name: customerObj.name,
        email: customerObj.email,
        phone: customerObj.phone,
        avatar: customerObj.avatar,
        address: customerBookings[0].address || customerObj.address,
        createdAt: customerObj.createdAt
      },
      stats: {
        totalBookings: customerBookings.length,
        completedCount,
        upcomingCount,
        pendingCount,
        cancelledCount
      },
      bookings: customerBookings
    }
  });
});

// Provider Earnings & Financial Management Functions
exports.getProviderEarnings = catchAsync(async (req, res, next) => {
  if (req.user.role !== USER_ROLES.PROVIDER) {
    return next(new AppError('Only providers can access earnings data.', 403));
  }

  const providerId = req.user._id;
  const { dateRange = 'all', status = 'all' } = req.query;

  let bookings = await Booking.find({ provider: providerId })
    .populate('customer', 'name phone email avatar')
    .populate('service', 'name icon basePrice')
    .sort('-createdAt');

  const now = new Date();
  if (dateRange === 'today') {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    bookings = bookings.filter(
      (b) => new Date(b.scheduledDate || b.createdAt) >= startOfToday && new Date(b.scheduledDate || b.createdAt) <= endOfToday
    );
  } else if (dateRange === 'week') {
    const startOfWeek = new Date();
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    bookings = bookings.filter((b) => new Date(b.scheduledDate || b.createdAt) >= startOfWeek);
  } else if (dateRange === 'month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    bookings = bookings.filter((b) => new Date(b.scheduledDate || b.createdAt) >= startOfMonth);
  } else if (dateRange === 'last_month') {
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    bookings = bookings.filter(
      (b) => new Date(b.scheduledDate || b.createdAt) >= startOfLastMonth && new Date(b.scheduledDate || b.createdAt) <= endOfLastMonth
    );
  }

  const completedBookings = bookings.filter((b) => b.status === BOOKING_STATUS.COMPLETED);
  const pendingBookings = bookings.filter(
    (b) =>
      b.status === BOOKING_STATUS.ACCEPTED ||
      b.status === BOOKING_STATUS.IN_PROGRESS ||
      b.status === BOOKING_STATUS.ON_THE_WAY ||
      b.status === BOOKING_STATUS.PENDING
  );
  const cancelledBookings = bookings.filter((b) => b.status === BOOKING_STATUS.CANCELLED);

  const grossRevenue = completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalCommission = Math.round(grossRevenue * 0.2);
  const netEarnings = Math.round(grossRevenue * 0.8);

  const pendingGross = pendingBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const pendingEarnings = Math.round(pendingGross * 0.8);

  const refundedAmount = cancelledBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfWeek = new Date();
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const todaysEarnings = completedBookings
    .filter((b) => new Date(b.scheduledDate || b.createdAt) >= startOfToday)
    .reduce((sum, b) => sum + Math.round((b.totalAmount || 0) * 0.8), 0);

  const weeksEarnings = completedBookings
    .filter((b) => new Date(b.scheduledDate || b.createdAt) >= startOfWeek)
    .reduce((sum, b) => sum + Math.round((b.totalAmount || 0) * 0.8), 0);

  const monthsEarnings = completedBookings
    .filter((b) => new Date(b.scheduledDate || b.createdAt) >= startOfMonth)
    .reduce((sum, b) => sum + Math.round((b.totalAmount || 0) * 0.8), 0);

  let transactions = bookings.map((b) => {
    const isCompleted = b.status === BOOKING_STATUS.COMPLETED;
    const isCancelled = b.status === BOOKING_STATUS.CANCELLED;

    return {
      transactionId: `TXN-${b._id.toString().slice(-8).toUpperCase()}`,
      bookingId: b._id,
      bookingCode: `#${b._id.toString().slice(-8).toUpperCase()}`,
      serviceName: b.service?.name || 'General Service',
      customerName: b.customer?.name || 'Customer',
      customerPhone: b.customer?.phone || '',
      grossAmount: b.totalAmount || 0,
      commissionAmount: Math.round((b.totalAmount || 0) * 0.2),
      netPayout: Math.round((b.totalAmount || 0) * 0.8),
      paymentStatus: isCompleted ? 'paid' : isCancelled ? 'refunded' : 'pending',
      bookingStatus: b.status,
      date: b.scheduledDate || b.createdAt,
      paymentMethod: 'Online Payment (Razorpay/Stripe)'
    };
  });

  if (status !== 'all') {
    transactions = transactions.filter((t) => t.paymentStatus === status);
  }

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        grossRevenue,
        totalCommission,
        netEarnings,
        todaysEarnings,
        weeksEarnings,
        monthsEarnings,
        pendingEarnings,
        refundedAmount,
        completedCount: completedBookings.length,
        pendingCount: pendingBookings.length,
        cancelledCount: cancelledBookings.length,
        commissionRatePercent: 20
      },
      transactions
    }
  });
});

exports.getProviderTransactionDetails = catchAsync(async (req, res, next) => {
  if (req.user.role !== USER_ROLES.PROVIDER) {
    return next(new AppError('Only providers can access transaction details.', 403));
  }

  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId)
    .populate('customer', 'name phone email avatar')
    .populate('service', 'name icon basePrice description');

  if (!booking) {
    return next(new AppError('Transaction / Booking record not found.', 404));
  }

  if (booking.provider && booking.provider.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to view this transaction.', 403));
  }

  const isCompleted = booking.status === BOOKING_STATUS.COMPLETED;
  const isCancelled = booking.status === BOOKING_STATUS.CANCELLED;

  res.status(200).json({
    status: 'success',
    data: {
      transaction: {
        transactionId: `TXN-${booking._id.toString().slice(-8).toUpperCase()}`,
        bookingId: booking._id,
        bookingCode: `#${booking._id.toString().slice(-8).toUpperCase()}`,
        service: booking.service,
        customer: booking.customer,
        scheduledDate: booking.scheduledDate,
        createdAt: booking.createdAt,
        grossAmount: booking.totalAmount,
        commissionAmount: Math.round(booking.totalAmount * 0.2),
        netPayout: Math.round(booking.totalAmount * 0.8),
        paymentStatus: isCompleted ? 'paid' : isCancelled ? 'refunded' : 'pending',
        bookingStatus: booking.status,
        paymentMethod: 'Online Payment'
      }
    }
  });
});

// Provider Payout Management Controllers
const Payout = require('../models/Payout');

exports.getProviderPayouts = catchAsync(async (req, res, next) => {
  if (req.user.role !== USER_ROLES.PROVIDER) {
    return next(new AppError('Only providers can access payout management.', 403));
  }

  const providerId = req.user._id;

  // 1. Calculate Total Net Provider Share from Completed Bookings
  const completedBookings = await Booking.find({
    provider: providerId,
    status: BOOKING_STATUS.COMPLETED
  });

  const totalNetEarnings = completedBookings.reduce(
    (sum, b) => sum + Math.round((b.totalAmount || 0) * 0.8),
    0
  );

  // 2. Fetch all payout requests for this provider
  const payouts = await Payout.find({ provider: providerId }).sort('-createdAt');

  // Sum active/completed payouts
  const totalPaidOut = payouts
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingBalance = payouts
    .filter((p) => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + p.amount, 0);

  const failedPayoutAmount = payouts
    .filter((p) => p.status === 'failed')
    .reduce((sum, p) => sum + p.amount, 0);

  // Available Balance = Net Earnings - (Completed + Pending Payouts)
  const availableBalance = Math.max(0, totalNetEarnings - totalPaidOut - pendingBalance);

  const lastPayout = payouts.find((p) => p.status === 'completed') || null;

  // Account details
  const userObj = await User.findById(providerId);
  const payoutAcc = userObj.providerDetails?.payoutAccount || {};

  let maskedAccountText = 'No payout account configured';
  if (payoutAcc.accountNumber) {
    const accNum = payoutAcc.accountNumber;
    maskedAccountText = `${payoutAcc.bankName || 'Bank'} ending in ${accNum.slice(-4)}`;
  } else if (payoutAcc.upiId) {
    maskedAccountText = `UPI: ${payoutAcc.upiId}`;
  }

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalNetEarnings,
        availableBalance,
        pendingBalance,
        totalPaidOut,
        failedPayoutAmount,
        lastPayoutDate: lastPayout ? lastPayout.processedAt || lastPayout.createdAt : null,
        lastPayoutAmount: lastPayout ? lastPayout.amount : 0,
        maskedAccountText
      },
      payoutAccount: {
        accountType: payoutAcc.accountType || 'bank_account',
        accountHolderName: payoutAcc.accountHolderName || '',
        bankName: payoutAcc.bankName || '',
        accountNumberMasked: payoutAcc.accountNumber ? `XXXX-XXXX-${payoutAcc.accountNumber.slice(-4)}` : '',
        ifscCode: payoutAcc.ifscCode || '',
        upiIdMasked: payoutAcc.upiId ? payoutAcc.upiId.replace(/(?<=.{2}).(?=.*@)/g, '*') : ''
      },
      payouts
    }
  });
});

exports.requestProviderPayout = catchAsync(async (req, res, next) => {
  if (req.user.role !== USER_ROLES.PROVIDER) {
    return next(new AppError('Only providers can request payouts.', 403));
  }

  const providerId = req.user._id;
  const { amount } = req.body;

  const reqAmount = Number(amount);
  if (isNaN(reqAmount) || reqAmount <= 0) {
    return next(new AppError('Please enter a valid payout amount greater than 0.', 400));
  }

  // Calculate current available balance
  const completedBookings = await Booking.find({
    provider: providerId,
    status: BOOKING_STATUS.COMPLETED
  });

  const totalNetEarnings = completedBookings.reduce(
    (sum, b) => sum + Math.round((b.totalAmount || 0) * 0.8),
    0
  );

  const payouts = await Payout.find({ provider: providerId });
  const totalPaidOut = payouts
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingBalance = payouts
    .filter((p) => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + p.amount, 0);

  const availableBalance = Math.max(0, totalNetEarnings - totalPaidOut - pendingBalance);

  if (reqAmount > availableBalance) {
    return next(
      new AppError(
        `Insufficient available balance. You requested ₹${reqAmount}, but your current available balance is ₹${availableBalance}.`,
        400
      )
    );
  }

  // Check Payout Destination Account
  const userObj = await User.findById(providerId);
  const payoutAcc = userObj.providerDetails?.payoutAccount || {};
  if (!payoutAcc.accountNumber && !payoutAcc.upiId) {
    return next(new AppError('Please add a valid payout bank account or UPI ID before requesting a payout.', 400));
  }

  // Check duplicate pending requests
  const activePendingRequest = payouts.find((p) => p.status === 'pending');
  if (activePendingRequest) {
    return next(
      new AppError(
        `You already have a pending payout request (#${activePendingRequest.payoutId}) of ₹${activePendingRequest.amount} currently under processing.`,
        409
      )
    );
  }

  // Create Payout record
  const payoutId = `PO-${Math.floor(100000 + Math.random() * 900000)}`;

  const newPayout = await Payout.create({
    provider: providerId,
    payoutId,
    amount: reqAmount,
    status: 'pending',
    destinationAccount: {
      accountType: payoutAcc.accountType || 'bank_account',
      accountHolderName: payoutAcc.accountHolderName || userObj.name,
      bankName: payoutAcc.bankName || 'Bank',
      accountNumberMasked: payoutAcc.accountNumber ? `XXXX-XXXX-${payoutAcc.accountNumber.slice(-4)}` : '',
      ifscCode: payoutAcc.ifscCode || '',
      upiIdMasked: payoutAcc.upiId || ''
    }
  });

  res.status(201).json({
    status: 'success',
    message: `Payout request #${payoutId} of ₹${reqAmount} submitted successfully. It will be processed shortly by HomeEase administration.`,
    data: {
      payout: newPayout,
      remainingAvailableBalance: availableBalance - reqAmount
    }
  });
});

exports.updateProviderPayoutAccount = catchAsync(async (req, res, next) => {
  if (req.user.role !== USER_ROLES.PROVIDER) {
    return next(new AppError('Only providers can update payout accounts.', 403));
  }

  const { accountType, accountHolderName, bankName, accountNumber, ifscCode, upiId } = req.body;

  const userObj = await User.findById(req.user._id);

  if (!userObj.providerDetails) {
    userObj.providerDetails = {};
  }

  userObj.providerDetails.payoutAccount = {
    accountType: accountType || 'bank_account',
    accountHolderName: accountHolderName || userObj.name,
    bankName: bankName || '',
    accountNumber: accountNumber || '',
    ifscCode: ifscCode || '',
    upiId: upiId || ''
  };

  await userObj.save();

  res.status(200).json({
    status: 'success',
    message: 'Payout destination account updated successfully',
    data: {
      payoutAccount: {
        accountType: userObj.providerDetails.payoutAccount.accountType,
        accountHolderName: userObj.providerDetails.payoutAccount.accountHolderName,
        bankName: userObj.providerDetails.payoutAccount.bankName,
        accountNumberMasked: accountNumber ? `XXXX-XXXX-${accountNumber.slice(-4)}` : '',
        ifscCode: userObj.providerDetails.payoutAccount.ifscCode,
        upiIdMasked: upiId || ''
      }
    }
  });
});

exports.getProviderPayoutDetails = catchAsync(async (req, res, next) => {
  if (req.user.role !== USER_ROLES.PROVIDER) {
    return next(new AppError('Only providers can access payout details.', 403));
  }

  const { id } = req.params;
  const payout = await Payout.findById(id);

  if (!payout) {
    return next(new AppError('Payout record not found.', 404));
  }

  if (payout.provider.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to view this payout record.', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      payout
    }
  });
});

exports.getProviderAnalytics = catchAsync(async (req, res, next) => {
  if (req.user.role !== USER_ROLES.PROVIDER) {
    return next(new AppError('Only providers can access reports and analytics.', 403));
  }

  const providerId = req.user._id;
  const { period = 'month', serviceId } = req.query;

  // Date range filter
  let startDate = new Date();
  const endDate = new Date();

  if (period === 'today') {
    startDate.setHours(0, 0, 0, 0);
  } else if (period === 'week') {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === 'month') {
    startDate.setMonth(startDate.getMonth() - 1);
  } else if (period === '3months') {
    startDate.setMonth(startDate.getMonth() - 3);
  } else if (period === 'all') {
    startDate = new Date(0);
  }

  let query = {
    provider: providerId,
    createdAt: { $gte: startDate, $lte: endDate }
  };

  if (serviceId) {
    query.service = serviceId;
  }

  // Fetch all matching bookings for analytics
  const bookings = await Booking.find(query)
    .populate('service', 'name category basePrice')
    .populate('customer', 'name email avatar')
    .sort({ createdAt: 1 });

  // 1. Booking Metrics
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter((b) => b.status === BOOKING_STATUS.COMPLETED);
  const pendingBookings = bookings.filter((b) => b.status === BOOKING_STATUS.PENDING || b.status === BOOKING_STATUS.ACCEPTED);
  const inProgressBookings = bookings.filter((b) => b.status === BOOKING_STATUS.ON_THE_WAY || b.status === BOOKING_STATUS.IN_PROGRESS);
  const cancelledBookings = bookings.filter((b) => b.status === BOOKING_STATUS.CANCELLED);

  const completedCount = completedBookings.length;
  const pendingCount = pendingBookings.length;
  const inProgressCount = inProgressBookings.length;
  const cancelledCount = cancelledBookings.length;

  const completionRate = totalBookings > 0 ? Math.round((completedCount / totalBookings) * 100) : 0;
  const cancellationRate = totalBookings > 0 ? Math.round((cancelledCount / totalBookings) * 100) : 0;

  // 2. Financial Metrics (exact match with Earnings Feature)
  const grossRevenue = completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const platformCommission = Math.round(grossRevenue * 0.2);
  const netEarnings = grossRevenue - platformCommission;
  const pendingEarnings = Math.round(
    bookings
      .filter((b) => b.status === BOOKING_STATUS.PENDING || b.status === BOOKING_STATUS.ACCEPTED || b.status === BOOKING_STATUS.IN_PROGRESS)
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0) * 0.8
  );

  const totalDiscountGiven = completedBookings.reduce((sum, b) => sum + (b.discountAmount || 0), 0);

  // 3. Service Performance Breakdown
  const serviceStatsMap = {};
  completedBookings.forEach((b) => {
    const sName = b.service?.name || 'Other Service';
    if (!serviceStatsMap[sName]) {
      serviceStatsMap[sName] = { name: sName, bookingsCount: 0, grossRevenue: 0, netEarnings: 0 };
    }
    serviceStatsMap[sName].bookingsCount += 1;
    serviceStatsMap[sName].grossRevenue += b.totalAmount || 0;
    serviceStatsMap[sName].netEarnings += Math.round((b.totalAmount || 0) * 0.8);
  });

  const servicePerformance = Object.values(serviceStatsMap).sort((a, b) => b.grossRevenue - a.grossRevenue);

  // 4. Customer Metrics
  const customerIds = completedBookings.map((b) => b.customer?._id?.toString()).filter(Boolean);
  const uniqueCustomerSet = new Set(customerIds);
  const totalCustomersCount = uniqueCustomerSet.size;

  const customerBookingCounts = {};
  customerIds.forEach((cid) => {
    customerBookingCounts[cid] = (customerBookingCounts[cid] || 0) + 1;
  });
  const repeatCustomersCount = Object.values(customerBookingCounts).filter((cnt) => cnt > 1).length;

  // 5. Review & Rating Metrics
  const Review = require('../models/Review');
  const reviews = await Review.find({ provider: providerId });
  const totalReviewsCount = reviews.length;
  const avgRating = totalReviewsCount > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount) * 10) / 10
    : 5.0;

  const star5Count = reviews.filter((r) => r.rating === 5).length;
  const star4Count = reviews.filter((r) => r.rating === 4).length;
  const star3Count = reviews.filter((r) => r.rating === 3).length;
  const star2Count = reviews.filter((r) => r.rating === 2).length;
  const star1Count = reviews.filter((r) => r.rating === 1).length;

  // 6. Offer Metrics
  const Offer = require('../models/Offer');
  const offers = await Offer.find({ provider: providerId });
  const activeOffersCount = offers.filter((o) => o.isActive).length;
  const totalOfferRedemptions = offers.reduce((sum, o) => sum + (o.usedCount || 0), 0);

  // 7. Time Trend Aggregation (Daily or Monthly)
  const trendsMap = {};
  bookings.forEach((b) => {
    const dStr = b.createdAt.toISOString().split('T')[0];
    if (!trendsMap[dStr]) {
      trendsMap[dStr] = { date: dStr, bookings: 0, grossRevenue: 0, netEarnings: 0 };
    }
    trendsMap[dStr].bookings += 1;
    if (b.status === BOOKING_STATUS.COMPLETED) {
      trendsMap[dStr].grossRevenue += b.totalAmount || 0;
      trendsMap[dStr].netEarnings += Math.round((b.totalAmount || 0) * 0.8);
    }
  });

  const timeTrends = Object.values(trendsMap).sort((a, b) => a.date.localeCompare(b.date));

  res.status(200).json({
    status: 'success',
    data: {
      summary: {
        totalBookings,
        completedCount,
        pendingCount,
        inProgressCount,
        cancelledCount,
        completionRate,
        cancellationRate,
        grossRevenue,
        platformCommission,
        netEarnings,
        pendingEarnings,
        totalDiscountGiven,
        totalCustomersCount,
        repeatCustomersCount,
        avgRating,
        totalReviewsCount,
        star5Count,
        star4Count,
        star3Count,
        star2Count,
        star1Count,
        totalOffersCount: offers.length,
        activeOffersCount,
        totalOfferRedemptions
      },
      servicePerformance,
      timeTrends
    }
  });
});
