const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { protect } = require('../middleware/auth');
const Transaction = require('../models/Transaction');

const router = express.Router();

// Validation rules
const transactionValidation = [
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be in valid ISO format'),
  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(['income', 'expense'])
    .withMessage('Type must be either income or expense'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 3, max: 255 })
    .withMessage('Description must be between 3 and 255 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category must be between 2 and 100 characters'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isNumeric()
    .withMessage('Amount must be a number')
    .custom((value) => {
      if (value <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      return true;
    })
];

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Type must be either income or expense'),
  query('category')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Category cannot be empty'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be in valid ISO format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be in valid ISO format'),

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

      const {
        page = 1,
        limit = 10,
        type,
        category,
        startDate,
        endDate,
        search,
        sortBy = 'date',
        sortOrder = 'DESC'
      } = req.query;

      const userId = req.user.id;
      
      // Get transactions with filters
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        type,
        category,
        startDate,
        endDate,
        search,
        sortBy,
        sortOrder: sortOrder.toUpperCase()
      };
      
      const [transactions, total, summary] = await Promise.all([
        Transaction.findByUserId(userId, options),
        Transaction.countByUserId(userId, options),
        Transaction.getSummaryByUserId(userId, { startDate, endDate })
      ]);

      // Calculate pagination
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          transactions: transactions.map(t => t.toJSON()),
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: total,
            itemsPerPage: parseInt(limit),
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          },
          summary
        }
      });
    } catch (error) {
      next(error);
    }
  }
];

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
const getTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find transaction by ID and user ID
    const transaction = await Transaction.findByIdAndUserId(id, userId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Transaction not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        transaction: transaction.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = [
  ...transactionValidation,

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

      const { date, type, description, category, amount, notes, invoice_file_id, tax_invoice_file_id } = req.body;
      const userId = req.user.id;

      // Create new transaction
      const transactionData = {
        user_id: userId,
        date,
        type,
        description,
        category,
        amount: parseFloat(amount),
        notes: notes || null,
        invoice_file_id: invoice_file_id || null,
        tax_invoice_file_id: tax_invoice_file_id || null
      };

      const newTransaction = await Transaction.create(transactionData);

      res.status(201).json({
        success: true,
        data: {
          transaction: newTransaction.toJSON()
        },
        message: 'Transaction created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
];

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = [
  ...transactionValidation,

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
      const { date, type, description, category, amount, notes, invoice_file_id, tax_invoice_file_id } = req.body;
      const userId = req.user.id;

      // Find transaction by ID and user ID
      const transaction = await Transaction.findByIdAndUserId(id, userId);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Transaction not found'
          }
        });
      }

      // Update transaction
      const updateData = {
        date,
        type,
        description,
        category,
        amount: parseFloat(amount),
        notes: notes || null,
        invoice_file_id: invoice_file_id || null,
        tax_invoice_file_id: tax_invoice_file_id || null
      };

      const updatedTransaction = await transaction.update(updateData);

      res.json({
        success: true,
        data: {
          transaction: updatedTransaction.toJSON()
        },
        message: 'Transaction updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
];

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Delete transaction by ID and user ID
    const deleted = await Transaction.deleteByIdAndUserId(id, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Transaction not found'
        }
      });
    }

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction summary
// @route   GET /api/transactions/summary
// @access  Private
const getTransactionSummary = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be in valid ISO format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be in valid ISO format'),
  query('groupBy')
    .optional()
    .isIn(['month', 'year', 'day'])
    .withMessage('Group by must be month, year, or day'),

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

      const userId = req.user.id;
      const { startDate, endDate, groupBy } = req.query;

      // Get summary data
      const summary = await Transaction.getSummaryByUserId(userId, {
        startDate,
        endDate
      });

      let responseData = {
        totalIncome: summary.income.total,
        totalExpense: summary.expense.total,
        netProfit: summary.balance,
        profitMargin: summary.income.total > 0 ? (summary.balance / summary.income.total) * 100 : 0,
        incomeGrowth: 0, // TODO: Calculate growth
        expenseGrowth: 0, // TODO: Calculate growth
        profitGrowth: 0 // TODO: Calculate growth
      };

      // If groupBy is specified, get monthly data
      if (groupBy === 'month' && startDate && endDate) {
        const monthlyData = await Transaction.getMonthlyDataByUserId(userId, {
          startDate,
          endDate
        });
        responseData.monthlyData = monthlyData;
      }

      res.json({
        success: true,
        data: responseData
      });
    } catch (error) {
      next(error);
    }
  }
];

// Routes
router.get('/', protect, getTransactions);
router.get('/summary', protect, getTransactionSummary);
router.get('/:id', protect, getTransaction);
router.post('/', protect, createTransaction);
router.put('/:id', protect, updateTransaction);
router.delete('/:id', protect, deleteTransaction);

module.exports = router;