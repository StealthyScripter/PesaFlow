const jwt = require('jsonwebtoken');
const User = require('../models/users.models');

const authMiddleware = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        details: 'No token provided'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      return res.status(401).json({
        error: 'Access denied',
        details: 'User no longer exists'
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Access denied',
        details: 'User account is deactivated'
      });
    }
    
    // Check if password was changed after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        error: 'Access denied',
        details: 'Password recently changed. Please log in again'
      });
    }
    
    // Grant access
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Access denied',
        details: 'Invalid token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Access denied',
        details: 'Token expired'
      });
    }
    
    res.status(500).json({
      error: 'Authentication error',
      details: error.message
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access forbidden',
      details: 'Admin access required'
    });
  }
  next();
};

const restrictToOwner = (req, res, next) => {
  // Allow admin access or owner access
  if (req.user.role === 'admin' || req.user.memberNumber === req.params.id?.toUpperCase()) {
    return next();
  }
  
  return res.status(403).json({
    error: 'Access forbidden',
    details: 'You can only access your own data'
  });
};

module.exports = {
  authMiddleware,
  adminOnly,
  restrictToOwner
};