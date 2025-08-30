const express = require('express');
const { protect } = require('../middleware/auth');
const { requireSuperAdmin } = require('../middleware/company');
const User = require('../models/User');
const Company = require('../models/Company');
const Transaction = require('../models/Transaction');

const router = express.Router();

// Apply protection middleware to all routes
router.use(protect);

// @desc    Get system statistics (SuperAdmin only)
// @route   GET /api/dashboard/system-stats
// @access  SuperAdmin only
const getSystemStats = async (req, res, next) => {
  try {
    // Get total users
    const totalUsers = await User.count();
    
    // Get total companies
    const totalCompanies = await Company.count();
    
    // Get total transactions
    const totalTransactions = await Transaction.count();
    
    // Get total revenue (sum of all income transactions)
    const totalRevenue = await Transaction.getTotalRevenue();
    
    // Get active users (users who logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = await User.count({
      last_login: {
        $gte: thirtyDaysAgo.toISOString()
      }
    });
    
    // Get recent activity (last 10 activities)
    const recentActivity = await Transaction.getRecentActivity(10);
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCompanies,
        totalTransactions,
        totalRevenue,
        activeUsers,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Error in getSystemStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load system statistics',
      error: error.message
    });
  }
};

// @desc    Get company dashboard data
// @route   GET /api/dashboard/company
// @access  Company users only
const getCompanyDashboard = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const companyId = req.user.company_id;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'User must be associated with a company'
      });
    }
    
    // Get summary data
    const summary = await Transaction.getCompanySummary(companyId, { startDate, endDate });
    
    // Get recent transactions
    const recentTransactions = await Transaction.getRecentByCompany(companyId, 5);
    
    // Get monthly chart data
    const currentYear = new Date().getFullYear();
    const monthlyData = await Transaction.getMonthlyData(companyId, currentYear);
    
    res.status(200).json({
      success: true,
      data: {
        summary,
        recentTransactions,
        monthlyData
      }
    });
  } catch (error) {
    console.error('Error in getCompanyDashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load company dashboard data',
      error: error.message
    });
  }
};

// Routes
router.get('/system-stats', requireSuperAdmin, getSystemStats);
router.get('/company', getCompanyDashboard);

module.exports = router;
