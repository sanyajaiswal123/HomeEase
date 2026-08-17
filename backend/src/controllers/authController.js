const User = require('../models/User');
const signToken = require('../utils/token');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { USER_ROLES } = require('../config/constants');

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, role, phone, address, providerDetails } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email is already in use.', 409));
  }

  // Set providerDetails properties if role is provider
  const userDetails = {
    name,
    email,
    password,
    role,
    phone,
    address
  };

  if (role === USER_ROLES.PROVIDER) {
    userDetails.providerDetails = {
      ...providerDetails,
      isVerified: false, // Must be approved by admin
      isAvailable: true,
      rating: 5
    };
  }

  const newUser = await User.create(userDetails);
  const token = signToken(newUser._id);

  // Remove password from output
  newUser.password = undefined;

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password.', 400));
  }

  // Check user & password (explicitly select password)
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError('Incorrect email or password.', 401));
  }

  if (!user.isActive) {
    return next(new AppError('This account has been deleted. Please contact support.', 403));
  }

  if (user.isBlocked) {
    return next(new AppError('This account has been temporarily blocked by administrators.', 403));
  }

  const token = signToken(user._id);
  user.password = undefined;

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('providerDetails.serviceCategory');
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password) {
    return next(
      new AppError('This route is not for password updates. Please use updatePassword.', 400)
    );
  }

  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError('User not found', 404));

  if (req.body.name) user.name = req.body.name;
  if (req.body.phone) user.phone = req.body.phone;
  if (req.body.avatar !== undefined) user.avatar = req.body.avatar;
  if (req.body.address) user.address = { ...user.address, ...req.body.address };

  if (req.body.providerDetails && user.role === USER_ROLES.PROVIDER) {
    if (req.body.providerDetails.isAvailable !== undefined) {
      user.providerDetails.isAvailable = Boolean(req.body.providerDetails.isAvailable);
    }
    if (req.body.providerDetails.hourlyRate !== undefined) {
      user.providerDetails.hourlyRate = Number(req.body.providerDetails.hourlyRate);
    }
    if (req.body.providerDetails.experience !== undefined) {
      user.providerDetails.experience = Math.max(0, Number(req.body.providerDetails.experience));
    }
    if (req.body.providerDetails.bio !== undefined) {
      user.providerDetails.bio = req.body.providerDetails.bio;
    }
    if (req.body.providerDetails.skills !== undefined) {
      user.providerDetails.skills = req.body.providerDetails.skills;
    }
    if (req.body.providerDetails.languages !== undefined) {
      user.providerDetails.languages = req.body.providerDetails.languages;
    }
    if (req.body.providerDetails.documentUrl !== undefined) {
      user.providerDetails.documentUrl = req.body.providerDetails.documentUrl;
    }
    if (req.body.providerDetails.serviceCategory !== undefined) {
      user.providerDetails.serviceCategory = req.body.providerDetails.serviceCategory;
    }
  }

  await user.save({ validateBeforeSave: false });

  const updatedUser = await User.findById(user._id).populate('providerDetails.serviceCategory');

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.getProviders = catchAsync(async (req, res, next) => {
  const query = { role: USER_ROLES.PROVIDER };

  // Filters
  if (req.query.category) {
    query['providerDetails.serviceCategory'] = req.query.category;
  }
  if (req.query.verified) {
    query['providerDetails.isVerified'] = req.query.verified === 'true';
  } else {
    // Default to returning only verified providers to customers
    query['providerDetails.isVerified'] = true;
  }

  const providers = await User.find(query)
    .populate('providerDetails.serviceCategory')
    .select('-password');

  res.status(200).json({
    status: 'success',
    results: providers.length,
    data: {
      providers
    }
  });
});

exports.verifyProvider = catchAsync(async (req, res, next) => {
  const provider = await User.findById(req.params.id);
  if (!provider || provider.role !== USER_ROLES.PROVIDER) {
    return next(new AppError('Provider not found.', 404));
  }

  provider.providerDetails.isVerified = true;
  await provider.save();

  res.status(200).json({
    status: 'success',
    message: 'Provider verified successfully.',
    data: {
      provider
    }
  });
});

exports.submitProviderVerification = catchAsync(async (req, res, next) => {
  if (req.user.role !== USER_ROLES.PROVIDER) {
    return next(new AppError('Only providers can submit verification documents.', 403));
  }

  const { idProofType, idProofNumber, documentUrl, legalName } = req.body;

  if (!idProofNumber || !documentUrl) {
    return next(new AppError('Please provide a valid ID proof number and document URL.', 400));
  }

  const user = await User.findById(req.user.id);

  if (user.providerDetails?.verificationStatus === 'approved' || user.providerDetails?.isVerified) {
    return next(new AppError('Your provider account is already verified.', 400));
  }

  if (user.providerDetails?.verificationStatus === 'pending') {
    return next(new AppError('You already have a pending verification request under admin review.', 409));
  }

  if (legalName) user.name = legalName.trim();
  user.providerDetails.verificationStatus = 'pending';
  user.providerDetails.isVerified = false;
  user.providerDetails.idProofType = idProofType || 'Aadhaar Card';
  user.providerDetails.idProofNumber = idProofNumber.trim();
  user.providerDetails.documentUrl = documentUrl.trim();

  if (!user.providerDetails.verificationHistory) {
    user.providerDetails.verificationHistory = [];
  }

  user.providerDetails.verificationHistory.push({
    action: 'submitted',
    reason: 'Verification KYC documents submitted for admin review.',
    date: new Date()
  });

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'KYC Verification request submitted successfully. HomeEase Admin will review your documents shortly.',
    data: {
      user
    }
  });
});

exports.getVerificationStatus = catchAsync(async (req, res, next) => {
  if (req.user.role !== USER_ROLES.PROVIDER) {
    return next(new AppError('Only providers can check verification status.', 403));
  }

  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      verificationStatus: user.providerDetails?.verificationStatus || 'pending',
      isVerified: user.providerDetails?.isVerified || false,
      documentUrl: user.providerDetails?.documentUrl || '',
      idProofType: user.providerDetails?.idProofType || 'Aadhaar Card',
      idProofNumber: user.providerDetails?.idProofNumber || '',
      verificationHistory: user.providerDetails?.verificationHistory || []
    }
  });
});

exports.getProviderLocation = catchAsync(async (req, res, next) => {
  if (req.user.role !== USER_ROLES.PROVIDER) {
    return next(new AppError('Only providers can access location settings.', 403));
  }

  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      address: user.address || {},
      serviceRadiusKm: user.providerDetails?.serviceRadiusKm || 25,
      servedCities: user.providerDetails?.servedCities || [],
      servedZipCodes: user.providerDetails?.servedZipCodes || []
    }
  });
});

exports.updateProviderLocation = catchAsync(async (req, res, next) => {
  if (req.user.role !== USER_ROLES.PROVIDER) {
    return next(new AppError('Only providers can update location settings.', 403));
  }

  const { street, city, state, zipCode, serviceRadiusKm, servedCities, servedZipCodes, coordinates } = req.body;

  const user = await User.findById(req.user.id);

  if (!user.address) user.address = {};
  if (street !== undefined) user.address.street = street.trim();
  if (city !== undefined) user.address.city = city.trim();
  if (state !== undefined) user.address.state = state.trim();
  if (zipCode !== undefined) user.address.zipCode = zipCode.trim();
  if (coordinates && Array.isArray(coordinates)) {
    user.address.coordinates = coordinates;
  }

  if (!user.providerDetails) user.providerDetails = {};
  if (serviceRadiusKm !== undefined) {
    user.providerDetails.serviceRadiusKm = Math.max(1, Number(serviceRadiusKm));
  }
  if (servedCities !== undefined && Array.isArray(servedCities)) {
    user.providerDetails.servedCities = servedCities;
  }
  if (servedZipCodes !== undefined && Array.isArray(servedZipCodes)) {
    user.providerDetails.servedZipCodes = servedZipCodes;
  }

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Provider service location & area settings updated successfully.',
    data: {
      address: user.address,
      serviceRadiusKm: user.providerDetails.serviceRadiusKm,
      servedCities: user.providerDetails.servedCities,
      servedZipCodes: user.providerDetails.servedZipCodes
    }
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new AppError('Please provide current password, new password, and confirmation password.', 400));
  }

  if (newPassword !== confirmPassword) {
    return next(new AppError('New password and confirmation password do not match.', 400));
  }

  if (newPassword.length < 6) {
    return next(new AppError('New password must be at least 6 characters long.', 400));
  }

  // Get user with password field
  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    return next(new AppError('User not found.', 404));
  }

  // Verify current password
  if (!(await user.comparePassword(currentPassword, user.password))) {
    return next(new AppError('Your current password is incorrect.', 401));
  }

  // Set new password (Mongoose pre-save hook will hash password securely with bcrypt)
  user.password = newPassword;
  await user.save();

  const token = signToken(user._id);
  user.password = undefined;

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully!',
    token,
    data: {
      user
    }
  });
});

exports.deactivateAccount = catchAsync(async (req, res, next) => {
  const { password, reason } = req.body;

  if (!password) {
    return next(new AppError('Please enter your password to confirm account deactivation.', 400));
  }

  const user = await User.findById(req.user.id).select('+password');
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError('Password verification failed. Incorrect password.', 401));
  }

  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Your account has been deactivated successfully. Historical bookings and financial records remain archived.'
  });
});
