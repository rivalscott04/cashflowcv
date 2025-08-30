const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'You are not logged in! Please log in to get access.'
        }
      });
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists and get fresh user data
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'The user belonging to this token does no longer exist.'
        }
      });
    }

    // 4) Check if user is still active
    if (!currentUser.is_active) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Your account has been deactivated. Please contact support.'
        }
      });
    }

    // 5) Attach user to request
    req.user = currentUser;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid token. Please log in again!'
      }
    });
  }
};

// Optional authentication - doesn't require login but adds user info if logged in
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
      
      if (token) {
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        
        // Get fresh user data from database
        const currentUser = await User.findById(decoded.id);
        if (currentUser && currentUser.is_active) {
          req.user = currentUser;
        }
      }
    }
    next();
  } catch (error) {
    // If token is invalid, just continue without user info
    next();
  }
};

module.exports = {
  protect,
  optionalAuth
};