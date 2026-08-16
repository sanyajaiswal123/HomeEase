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
  // Prevent password updates via this route
  if (req.body.password) {
    return next(
      new AppError('This route is not for password updates. Please use updatePassword.', 400)
    );
  }

  const filteredBody = { ...req.body };
  // Prevent manual verification bypass
  delete filteredBody.role;
  if (filteredBody.providerDetails) {
    delete filteredBody.providerDetails.isVerified;
    delete filteredBody.providerDetails.rating;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  }).populate('providerDetails.serviceCategory');

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
