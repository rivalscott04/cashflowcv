const express = require('express');
const { protect } = require('../middleware/auth');
const { Settings, CompanySettings } = require('../models/Settings');

const router = express.Router();

// @desc    Get user settings
// @route   GET /api/settings/user
// @access  Private
const getUserSettings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const settings = await Settings.findByUserId(userId);

    res.status(200).json({
      success: true,
      data: {
        settings: settings.map(s => s.toJSON())
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user setting
// @route   PUT /api/settings/user/:key
// @access  Private
const updateUserSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value, type = 'string' } = req.body;
    const userId = req.user.id;

    if (!key || value === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Key and value are required'
        }
      });
    }

    // Validate type
    const validTypes = ['string', 'number', 'boolean', 'json'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid type. Must be one of: ' + validTypes.join(', ')
        }
      });
    }

    const setting = await Settings.updateByUserIdAndKey(userId, key, value, type);

    res.status(200).json({
      success: true,
      data: {
        setting: setting.toJSON()
      },
      message: 'Setting updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user setting
// @route   DELETE /api/settings/user/:key
// @access  Private
const deleteUserSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const userId = req.user.id;

    const deleted = await Settings.deleteByUserIdAndKey(userId, key);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Setting not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Setting deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get company settings
// @route   GET /api/settings/company
// @access  Private
const getCompanySettings = async (req, res, next) => {
  try {
    const settings = await CompanySettings.findAll();

    res.status(200).json({
      success: true,
      data: {
        settings: settings.map(s => s.toJSON())
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update company setting (admin only)
// @route   PUT /api/settings/company/:key
// @access  Private (Admin)
const updateCompanySetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value, type = 'string' } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied. Admin role required.'
        }
      });
    }

    if (!key || value === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Key and value are required'
        }
      });
    }

    // Validate type
    const validTypes = ['string', 'number', 'boolean', 'json'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid type. Must be one of: ' + validTypes.join(', ')
        }
      });
    }

    const setting = await CompanySettings.updateByKey(key, value, type);

    res.status(200).json({
      success: true,
      data: {
        setting: setting.toJSON()
      },
      message: 'Company setting updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific user setting by key
// @route   GET /api/settings/user/:key
// @access  Private
const getUserSettingByKey = async (req, res, next) => {
  try {
    const { key } = req.params;
    const userId = req.user.id;

    const setting = await Settings.findByUserIdAndKey(userId, key);

    if (!setting) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Setting not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        setting: setting.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific company setting by key
// @route   GET /api/settings/company/:key
// @access  Private
const getCompanySettingByKey = async (req, res, next) => {
  try {
    const { key } = req.params;

    const setting = await CompanySettings.findByKey(key);

    if (!setting) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Company setting not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        setting: setting.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Apply protection middleware to all routes
router.use(protect);

// User settings routes
router.get('/user', getUserSettings);
router.get('/user/:key', getUserSettingByKey);
router.put('/user/:key', updateUserSetting);
router.delete('/user/:key', deleteUserSetting);

// Company settings routes
router.get('/company', getCompanySettings);
router.get('/company/:key', getCompanySettingByKey);
router.put('/company/:key', updateCompanySetting);

module.exports = router;