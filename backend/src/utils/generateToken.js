const jwt = require('jsonwebtoken');

exports.generateAccessToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};

exports.generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

exports.verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

exports.verifyAccessToken = (token) => {
  return exports.verifyToken(token, process.env.JWT_SECRET);
};

exports.verifyRefreshToken = (token) => {
  return exports.verifyToken(token, process.env.JWT_REFRESH_SECRET);
};