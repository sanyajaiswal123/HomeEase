const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ status: 'error', message: 'You are not logged in. Please log in to get access.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey_homeease_2026');

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res
        .status(401)
        .json({ status: 'error', message: 'The user belonging to this token no longer exists.' });
    }

    if (currentUser.isBlocked) {
      return res.status(403).json({
        status: 'error',
        message: 'Your account has been suspended by administration. Please contact support.'
      });
    }

    if (currentUser.isActive === false) {
      return res.status(401).json({
        status: 'error',
        message: 'Your account has been deactivated.'
      });
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ status: 'error', message: 'Invalid token. Please log in again.' });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action.'
      });
    }
    next();
  };
};

const optionalProtect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey_homeease_2026');
      const currentUser = await User.findById(decoded.id);
      if (currentUser) {
        req.user = currentUser;
      }
    }
  } catch (error) {
    // Ignore invalid tokens for public endpoints
  }
  next();
};

module.exports = { protect, restrictTo, optionalProtect };
