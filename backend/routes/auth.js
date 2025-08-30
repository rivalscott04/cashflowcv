const express = require('express');
const { body, validationResult } = require('express-validator');
const { generateToken } = require('../utils/jwt');
const { comparePassword, hashPassword } = require('../utils/password');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = [
  // Validation middleware
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: errors.array()
          }
        });
      }

      const { username, password } = req.body;

      // Find user by username
      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Invalid credentials'
          }
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Account is deactivated'
          }
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Invalid credentials'
          }
        });
      }

      // Update last login
      await user.updateLastLogin();

      // Generate JWT token
      const token = generateToken({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role,
        company_id: user.company_id
      });

      res.status(200).json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            company_id: user.company_id,
            created_at: user.created_at,
            last_login: user.last_login
          }
        },
        message: 'Login successful'
      });
    } catch (error) {
      next(error);
    }
  }
];

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    // Find user by ID from the token
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Account is deactivated'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          company_id: user.company_id,
          created_at: user.created_at,
          last_login: user.last_login
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just send a success response
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify token
// @route   GET /api/auth/verify
// @access  Private
const verifyToken = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      },
      message: 'Token is valid'
    });
  } catch (error) {
    next(error);
  }
};

// Routes
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.get('/verify', protect, verifyToken);

module.exports = router;