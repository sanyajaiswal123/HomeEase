const Offer = require('../models/Offer');
const Service = require('../models/Service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.createOffer = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'provider') {
    return next(new AppError('Only service providers can create offers.', 403));
  }

  const {
    title,
    code,
    description,
    serviceId,
    discountType,
    discountValue,
    minBookingAmount,
    startDate,
    endDate,
    usageLimit
  } = req.body;

  if (!title || !code || !discountValue || !endDate) {
    return next(new AppError('Please provide Title, Offer Code, Discount Value, and End Date.', 400));
  }

  const numericValue = Number(discountValue);
  if (isNaN(numericValue) || numericValue <= 0) {
    return next(new AppError('Discount value must be a positive number greater than 0.', 400));
  }

  if (discountType === 'percentage' && numericValue > 100) {
    return next(new AppError('Percentage discount cannot exceed 100%.', 400));
  }

  const start = startDate ? new Date(startDate) : new Date();
  const end = new Date(endDate);

  if (end <= start) {
    return next(new AppError('End date must be after the start date.', 400));
  }

  // Verify service ownership if specific service is selected
  let targetService = null;
  if (serviceId) {
    targetService = await Service.findById(serviceId);
    if (!targetService) {
      return next(new AppError('Selected service not found.', 404));
    }
    if (targetService.provider.toString() !== req.user.id) {
      return next(new AppError('You can only create offers for your own services.', 403));
    }

    if (discountType === 'fixed' && numericValue >= targetService.basePrice) {
      return next(
        new AppError(`Fixed discount (₹${numericValue}) cannot equal or exceed service base price (₹${targetService.basePrice}).`, 400)
      );
    }
  }

  const formattedCode = code.trim().toUpperCase();

  // Check duplicate code for this provider
  const existingCode = await Offer.findOne({ provider: req.user._id, code: formattedCode });
  if (existingCode) {
    return next(new AppError(`Offer code "${formattedCode}" already exists in your account.`, 400));
  }

  const offer = await Offer.create({
    title: title.trim(),
    code: formattedCode,
    description: description ? description.trim() : '',
    provider: req.user._id,
    service: serviceId || null,
    discountType: discountType || 'percentage',
    discountValue: numericValue,
    minBookingAmount: minBookingAmount ? Number(minBookingAmount) : 0,
    startDate: start,
    endDate: end,
    usageLimit: usageLimit ? Number(usageLimit) : 100,
    isActive: true
  });

  res.status(201).json({
    status: 'success',
    message: 'Offer created successfully!',
    data: {
      offer
    }
  });
});

exports.getMyProviderOffers = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'provider') {
    return next(new AppError('Only providers can access provider offers.', 403));
  }

  const { statusFilter = 'all', search } = req.query;

  let query = { provider: req.user._id };

  const now = new Date();

  if (statusFilter === 'active') {
    query.isActive = true;
    query.startDate = { $lte: now };
    query.endDate = { $gte: now };
  } else if (statusFilter === 'inactive') {
    query.isActive = false;
  } else if (statusFilter === 'expired') {
    query.endDate = { $lt: now };
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } }
    ];
  }

  const offers = await Offer.find(query)
    .populate('service', 'name basePrice category')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: offers.length,
    data: {
      offers
    }
  });
});

exports.updateOffer = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'provider') {
    return next(new AppError('Only providers can update offers.', 403));
  }

  const offer = await Offer.findById(req.params.id);
  if (!offer) {
    return next(new AppError('Offer not found.', 404));
  }

  if (offer.provider.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to edit this offer.', 403));
  }

  const { title, description, discountType, discountValue, startDate, endDate, isActive, usageLimit } = req.body;

  if (title) offer.title = title.trim();
  if (description !== undefined) offer.description = description.trim();
  if (discountType) offer.discountType = discountType;
  if (discountValue !== undefined) {
    const val = Number(discountValue);
    if (val <= 0) return next(new AppError('Discount value must be greater than 0.', 400));
    if (offer.discountType === 'percentage' && val > 100) {
      return next(new AppError('Percentage discount cannot exceed 100%.', 400));
    }
    offer.discountValue = val;
  }
  if (startDate) offer.startDate = new Date(startDate);
  if (endDate) offer.endDate = new Date(endDate);
  if (isActive !== undefined) offer.isActive = Boolean(isActive);
  if (usageLimit !== undefined) offer.usageLimit = Math.max(1, Number(usageLimit));

  if (offer.endDate <= offer.startDate) {
    return next(new AppError('End date must be after start date.', 400));
  }

  await offer.save();

  res.status(200).json({
    status: 'success',
    message: 'Offer updated successfully.',
    data: {
      offer
    }
  });
});

exports.deleteOffer = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'provider') {
    return next(new AppError('Only providers can delete offers.', 403));
  }

  const offer = await Offer.findById(req.params.id);
  if (!offer) {
    return next(new AppError('Offer not found.', 404));
  }

  if (offer.provider.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to delete this offer.', 403));
  }

  await Offer.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Offer deleted successfully.'
  });
});

exports.getActiveServiceOffers = catchAsync(async (req, res, next) => {
  const { serviceId } = req.params;
  const now = new Date();

  const offers = await Offer.find({
    $or: [{ service: serviceId }, { service: null }],
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).sort({ discountValue: -1 });

  res.status(200).json({
    status: 'success',
    results: offers.length,
    data: {
      offers
    }
  });
});

exports.validateOfferCode = catchAsync(async (req, res, next) => {
  const { code, serviceId, amount } = req.body;

  if (!code || !serviceId) {
    return next(new AppError('Please provide Offer Code and Service ID.', 400));
  }

  const service = await Service.findById(serviceId);
  if (!service) {
    return next(new AppError('Service not found.', 404));
  }

  const basePrice = Number(amount) || service.basePrice;
  const now = new Date();

  const offer = await Offer.findOne({
    code: code.trim().toUpperCase(),
    provider: service.provider,
    isActive: true
  });

  if (!offer) {
    return next(new AppError('Invalid offer code or offer not applicable for this provider.', 404));
  }

  if (offer.startDate > now) {
    return next(new AppError('This offer is not active yet.', 400));
  }

  if (offer.endDate < now) {
    return next(new AppError('This offer has expired.', 400));
  }

  if (offer.usageLimit && offer.usedCount >= offer.usageLimit) {
    return next(new AppError('This offer has reached its maximum redemption limit.', 400));
  }

  if (offer.minBookingAmount && basePrice < offer.minBookingAmount) {
    return next(new AppError(`Minimum booking amount of ₹${offer.minBookingAmount} required for this offer.`, 400));
  }

  // Calculate discount
  let discountAmount = 0;
  if (offer.discountType === 'percentage') {
    discountAmount = Math.round((basePrice * offer.discountValue) / 100);
  } else {
    discountAmount = offer.discountValue;
  }

  discountAmount = Math.min(discountAmount, basePrice - 1); // Ensure final price is at least ₹1
  const finalPrice = Math.max(1, basePrice - discountAmount);

  res.status(200).json({
    status: 'success',
    data: {
      offerId: offer._id,
      code: offer.code,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      originalPrice: basePrice,
      discountAmount,
      finalPrice
    }
  });
});
