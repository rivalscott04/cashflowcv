const Company = require('../models/Company');
const User = require('../models/User');

// Middleware to ensure company isolation
const requireCompanyAccess = (req, res, next) => {
  try {
    const user = req.user;
    const companyId = req.params.companyId || req.body.company_id || req.query.company_id;
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    // Superadmin can access all companies
    if (user.isSuperAdmin()) {
      return next();
    }
    
    // For other users, check if they can access the requested company
    if (companyId && !user.canAccessCompany(parseInt(companyId))) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only access your own company data.' 
      });
    }
    
    // If no specific company requested, ensure user has a company
    if (!companyId && !user.company_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Company context required' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Company access middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Middleware to automatically filter by user's company
const filterByUserCompany = (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    // Superadmin can see all data (no filtering)
    if (user.isSuperAdmin()) {
      return next();
    }
    
    // For other users, automatically add company filter
    if (user.company_id) {
      req.companyFilter = { company_id: user.company_id };
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'User must be associated with a company' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Company filter middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Middleware to require admin role within company
const requireCompanyAdmin = (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    // Superadmin has all permissions
    if (user.isSuperAdmin()) {
      return next();
    }
    
    // Check if user is admin of their company
    if (!user.isCompanyAdmin()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin role required within your company' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Company admin middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Middleware to require superadmin role
const requireSuperAdmin = (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    if (!user.isSuperAdmin()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Superadmin role required' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Superadmin middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Middleware to validate company exists and is active
const validateCompany = async (req, res, next) => {
  try {
    const companyId = req.params.companyId || req.body.company_id;
    
    if (!companyId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Company ID is required' 
      });
    }
    
    const company = await Company.findById(companyId);
    
    if (!company) {
      return res.status(404).json({ 
        success: false, 
        message: 'Company not found' 
      });
    }
    
    if (!company.is_active) {
      return res.status(400).json({ 
        success: false, 
        message: 'Company is not active' 
      });
    }
    
    req.company = company;
    next();
  } catch (error) {
    console.error('Company validation middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Middleware to inject company data for transactions/files
const injectCompanyData = (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    // For non-superadmin users, automatically inject their company_id
    if (!user.isSuperAdmin() && user.company_id) {
      if (req.body && typeof req.body === 'object') {
        req.body.company_id = user.company_id;
      }
      if (req.query && typeof req.query === 'object') {
        req.query.company_id = user.company_id;
      }
    }
    
    next();
  } catch (error) {
    console.error('Company data injection middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

module.exports = {
  requireCompanyAccess,
  filterByUserCompany,
  requireCompanyAdmin,
  requireSuperAdmin,
  validateCompany,
  injectCompanyData
};