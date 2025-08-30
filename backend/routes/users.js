const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const { requireSuperAdmin, requireCompanyAdmin } = require('../middleware/company');
const User = require('../models/User');
const Company = require('../models/Company');

const router = express.Router();

// Apply protection middleware to all routes
router.use(protect);

// @desc    Get all users (SuperAdmin only)
// @route   GET /api/users
// @access  SuperAdmin only
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, role, company_id } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      role,
      company_id: company_id ? parseInt(company_id) : undefined
    };
    
    const users = await User.findAll(options);
    const total = await User.count(options);
    
    // Get company data for each user
    const usersWithCompany = await Promise.all(
      users.map(async (user) => {
        const userData = user.toJSON();
        if (user.company_id) {
          const company = await user.getCompany();
          userData.company = company ? {
            id: company.id,
            name: company.name,
            email: company.email,
            phone: company.phone,
            address: company.address,
            website: company.website,
            logo_url: company.logo_url,
            is_active: company.is_active,
            subscription_plan: company.subscription_plan,
            subscription_expires_at: company.subscription_expires_at,
            created_at: company.created_at,
            updated_at: company.updated_at
          } : null;
        }
        return userData;
      })
    );
    
    res.status(200).json({
      success: true,
      data: {
        users: usersWithCompany,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get users by company (SuperAdmin or Company Admin)
// @route   GET /api/users/company/:companyId
// @access  SuperAdmin or Company Admin
const getUsersByCompany = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { page = 1, limit = 10, search, role } = req.query;
    
    // Check if user can access this company
    if (!req.user.isSuperAdmin() && req.user.company_id !== parseInt(companyId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view users from your own company.'
      });
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      role
    };
    
    const users = await User.findByCompanyId(parseInt(companyId), options);
    const company = await Company.findById(parseInt(companyId));
    
    res.status(200).json({
      success: true,
      data: {
        users: users.map(user => user.toJSON()),
        company: company ? {
          id: company.id,
          name: company.name,
          email: company.email,
          phone: company.phone,
          address: company.address,
          website: company.website,
          logo_url: company.logo_url,
          is_active: company.is_active,
          subscription_plan: company.subscription_plan,
          subscription_expires_at: company.subscription_expires_at,
          created_at: company.created_at,
          updated_at: company.updated_at
        } : null,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  SuperAdmin or Company Admin (own company only)
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(parseInt(id));
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check access permissions
    if (!req.user.isSuperAdmin() && !req.user.canAccessCompany(user.company_id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const userData = user.toJSON();
    if (user.company_id) {
      const company = await user.getCompany();
      userData.company = company ? company.toJSON() : null;
    }
    
    res.status(200).json({
      success: true,
      data: { user: userData }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  SuperAdmin or Company Admin (own company only)
const createUser = [
  // Validation middleware
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('full_name')
    .notEmpty()
    .withMessage('Full name is required'),
  body('role')
    .isIn(['user', 'admin', 'superadmin'])
    .withMessage('Invalid role'),
  body('company_id')
    .optional()
    .isInt()
    .withMessage('Company ID must be a number'),

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

      const { username, email, password, full_name, role, company_id } = req.body;
      
      // Permission checks
      if (!req.user.isSuperAdmin()) {
        // Company admin can only create users in their own company
        if (!req.user.isCompanyAdmin()) {
          return res.status(403).json({
            success: false,
            message: 'Insufficient permissions to create users'
          });
        }
        
        // Force company_id to be the admin's company
        if (company_id && company_id !== req.user.company_id) {
          return res.status(403).json({
            success: false,
            message: 'You can only create users in your own company'
          });
        }
        
        // Company admin cannot create superadmin or admin users
        if (role === 'superadmin' || role === 'admin') {
          return res.status(403).json({
            success: false,
            message: 'Insufficient permissions to create admin or superadmin users'
          });
        }
      }
      
      // Check if username or email already exists
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
      }
      
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      
      const userData = {
        username,
        email,
        password,
        full_name,
        role,
        company_id: company_id || (req.user.isSuperAdmin() ? null : req.user.company_id)
      };
      
      const newUser = await User.create(userData);
      const userResponse = newUser.toJSON();
      
      if (newUser.company_id) {
        const company = await newUser.getCompany();
        userResponse.company = company ? company.toJSON() : null;
      }
      
      res.status(201).json({
        success: true,
        data: { user: userResponse },
        message: 'User created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
];

// @desc    Update user
// @route   PUT /api/users/:id
// @access  SuperAdmin or Company Admin (own company only)
const updateUser = [
  // Validation middleware
  body('username')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required'),
  body('full_name')
    .optional()
    .notEmpty()
    .withMessage('Full name cannot be empty'),
  body('role')
    .optional()
    .isIn(['user', 'admin', 'superadmin'])
    .withMessage('Invalid role'),
  body('company_id')
    .optional()
    .isInt()
    .withMessage('Company ID must be a number'),

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

      const { id } = req.params;
      const updateData = req.body;
      
      const user = await User.findById(parseInt(id));
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Permission checks
      if (!req.user.isSuperAdmin()) {
        // Check if user can access this user's company
        if (!req.user.canAccessCompany(user.company_id)) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
        
        // Company admin cannot update role or company_id
        if (updateData.role || updateData.company_id) {
          return res.status(403).json({
            success: false,
            message: 'Insufficient permissions to update role or company'
          });
        }
      }
      
      // Check for duplicate username/email
      if (updateData.username) {
        const existingUser = await User.findByUsername(updateData.username);
        if (existingUser && existingUser.id !== user.id) {
          return res.status(400).json({
            success: false,
            message: 'Username already exists'
          });
        }
      }
      
      if (updateData.email) {
        const existingEmail = await User.findByEmail(updateData.email);
        if (existingEmail && existingEmail.id !== user.id) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists'
          });
        }
      }
      
      const updatedUser = await user.update(updateData);
      const userResponse = updatedUser.toJSON();
      
      if (updatedUser.company_id) {
        const company = await updatedUser.getCompany();
        userResponse.company = company ? company.toJSON() : null;
      }
      
      res.status(200).json({
        success: true,
        data: { user: userResponse },
        message: 'User updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
];

// @desc    Delete user (soft delete)
// @route   DELETE /api/users/:id
// @access  SuperAdmin or Company Admin (own company only)
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(parseInt(id));
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Permission checks
    if (!req.user.isSuperAdmin()) {
      // Check if user can access this user's company
      if (!req.user.canAccessCompany(user.company_id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      // Company admin cannot delete admin or superadmin users
      if (user.role === 'admin' || user.role === 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to delete admin or superadmin users'
        });
      }
    }
    
    // Prevent self-deletion
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }
    
    await user.delete();
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get users grouped by company (SuperAdmin only)
// @route   GET /api/users/grouped-by-company
// @access  SuperAdmin only
const getUsersGroupedByCompany = async (req, res, next) => {
  try {
    const { search, role } = req.query;
    
    // Get all companies
    const companies = await Company.findAll({ is_active: true });
    
    // Get users for each company
    const companiesWithUsers = await Promise.all(
      companies.map(async (company) => {
        const options = { search, role };
        const users = await User.findByCompanyId(company.id, options);
        
        return {
          id: company.id,
          name: company.name,
          email: company.email,
          phone: company.phone,
          address: company.address,
          website: company.website,
          logo_url: company.logo_url,
          is_active: company.is_active,
          subscription_plan: company.subscription_plan,
          subscription_expires_at: company.subscription_expires_at,
          created_at: company.created_at,
          updated_at: company.updated_at,
          users: users.map(user => user.toJSON()),
          userCount: users.length
        };
      })
    );
    
    // Get superadmin users (no company)
    const superadminOptions = { search, role: 'superadmin' };
    const superadminUsers = await User.findAll(superadminOptions);
    const systemUsers = superadminUsers.filter(user => !user.company_id);
    
    res.status(200).json({
      success: true,
      data: {
        companies: companiesWithUsers,
        systemUsers: systemUsers.map(user => user.toJSON())
      }
    });
  } catch (error) {
    next(error);
  }
};

// Routes
router.get('/', requireSuperAdmin, getAllUsers);
router.get('/grouped-by-company', requireSuperAdmin, getUsersGroupedByCompany);
router.get('/company/:companyId', getUsersByCompany);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;