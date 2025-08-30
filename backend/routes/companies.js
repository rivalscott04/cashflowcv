const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const { requireSuperAdmin, validateCompany } = require('../middleware/company');
const Company = require('../models/Company');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// @desc    Get all companies
// @route   GET /api/companies
// @access  SuperAdmin only
const getAllCompanies = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    
    const filters = {};
    if (search) {
      filters.search = search;
    }
    if (status) {
      filters.is_active = status === 'active';
    }

    const companies = await Company.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      ...filters
    });

    const total = await Company.count(filters);

    res.status(200).json({
      success: true,
      data: {
        companies,
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

// @desc    Get company by ID
// @route   GET /api/companies/:id
// @access  SuperAdmin only
const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Company not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        company
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new company
// @route   POST /api/companies
// @access  SuperAdmin only
const createCompany = [
  // Validation middleware
  body('name')
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),

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

      const { name, email, phone, address, website } = req.body;

      // Check if company with same name already exists
      const existingCompany = await Company.findByName(name);
      if (existingCompany) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Company with this name already exists'
          }
        });
      }

      // Create company
      const company = await Company.create({
        name,
        email,
        phone,
        address,
        website
      });

      res.status(201).json({
        success: true,
        data: {
          company
        },
        message: 'Company created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
];

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  SuperAdmin only
const updateCompany = [
  // Validation middleware
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value'),

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

      const company = await Company.findById(req.params.id);
      if (!company) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Company not found'
          }
        });
      }

      // Check if name is being changed and if new name already exists
      if (req.body.name && req.body.name !== company.name) {
        const existingCompany = await Company.findByName(req.body.name);
        if (existingCompany) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Company with this name already exists'
            }
          });
        }
      }

      // Update company
      const updatedCompany = await Company.update(req.params.id, req.body);

      res.status(200).json({
        success: true,
        data: {
          company: updatedCompany
        },
        message: 'Company updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
];

// @desc    Delete company (soft delete)
// @route   DELETE /api/companies/:id
// @access  SuperAdmin only
const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Company not found'
        }
      });
    }

    // Soft delete company
    await Company.delete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get company statistics
// @route   GET /api/companies/:id/stats
// @access  SuperAdmin only
const getCompanyStats = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Company not found'
        }
      });
    }

    const stats = await Company.getStats(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};

// Routes
router.get('/', requireSuperAdmin, getAllCompanies);
router.get('/:id', requireSuperAdmin, validateCompany, getCompanyById);
router.post('/', requireSuperAdmin, createCompany);
router.put('/:id', requireSuperAdmin, validateCompany, updateCompany);
router.delete('/:id', requireSuperAdmin, validateCompany, deleteCompany);
router.get('/:id/stats', requireSuperAdmin, validateCompany, getCompanyStats);

module.exports = router;