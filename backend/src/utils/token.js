const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey_homeease_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

module.exports = signToken;
