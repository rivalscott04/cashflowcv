const { query, transaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Transaction {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.date = data.date;
    this.type = data.type;
    this.description = data.description;
    this.category = data.category;
    this.amount = parseFloat(data.amount);
    this.invoice_file_id = data.invoice_file_id;
    this.tax_invoice_file_id = data.tax_invoice_file_id;
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create new transaction
  static async create(transactionData) {
    try {
      const {
        user_id,
        date,
        type,
        description,
        category,
        amount,
        invoice_file_id = null,
        tax_invoice_file_id = null,
        notes = null
      } = transactionData;
      
      const id = uuidv4();
      
      const sql = `
        INSERT INTO transactions (
          id, user_id, date, type, description, category, amount,
          invoice_file_id, tax_invoice_file_id, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await query(sql, [
        id, user_id, date, type, description, category, amount,
        invoice_file_id, tax_invoice_file_id, notes
      ]);
      
      // Get the created transaction
      const newTransaction = await Transaction.findById(id);
      return newTransaction;
    } catch (error) {
      throw error;
    }
  }

  // Find transaction by ID
  static async findById(id) {
    try {
      const sql = 'SELECT * FROM transactions WHERE id = ?';
      const rows = await query(sql, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new Transaction(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find transaction by ID and user ID
  static async findByIdAndUserId(id, userId) {
    try {
      const sql = 'SELECT * FROM transactions WHERE id = ? AND user_id = ?';
      const rows = await query(sql, [id, userId]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new Transaction(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find all transactions for a user
  static async findByUserId(userId, options = {}) {
    try {
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
      } = options;
      
      const offset = (page - 1) * limit;
      
      let sql = 'SELECT * FROM transactions WHERE user_id = ?';
      const params = [userId];
      
      // Add filters
      if (type) {
        sql += ' AND type = ?';
        params.push(type);
      }
      
      if (category) {
        sql += ' AND category = ?';
        params.push(category);
      }
      
      if (startDate) {
        sql += ' AND date >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        sql += ' AND date <= ?';
        params.push(endDate);
      }
      
      if (search) {
        sql += ' AND (description LIKE ? OR category LIKE ? OR notes LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      // Add sorting
      const allowedSortFields = ['date', 'amount', 'type', 'category', 'created_at'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'date';
      const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      
      sql += ` ORDER BY ${sortField} ${order} LIMIT ? OFFSET ?`;
      params.push(limit, offset);
      
      const rows = await query(sql, params);
      
      return rows.map(row => new Transaction(row));
    } catch (error) {
      throw error;
    }
  }

  // Count transactions for a user
  static async countByUserId(userId, options = {}) {
    try {
      const { type, category, startDate, endDate, search } = options;
      
      let sql = 'SELECT COUNT(*) as count FROM transactions WHERE user_id = ?';
      const params = [userId];
      
      // Add filters
      if (type) {
        sql += ' AND type = ?';
        params.push(type);
      }
      
      if (category) {
        sql += ' AND category = ?';
        params.push(category);
      }
      
      if (startDate) {
        sql += ' AND date >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        sql += ' AND date <= ?';
        params.push(endDate);
      }
      
      if (search) {
        sql += ' AND (description LIKE ? OR category LIKE ? OR notes LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      const rows = await query(sql, params);
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }

  // Count all transactions (for system stats)
  static async count(options = {}) {
    try {
      const { type, category, startDate, endDate, search } = options;
      
      let sql = 'SELECT COUNT(*) as count FROM transactions';
      const params = [];
      
      const conditions = [];
      
      if (type) {
        conditions.push('type = ?');
        params.push(type);
      }
      
      if (category) {
        conditions.push('category = ?');
        params.push(category);
      }
      
      if (startDate) {
        conditions.push('date >= ?');
        params.push(startDate);
      }
      
      if (endDate) {
        conditions.push('date <= ?');
        params.push(endDate);
      }
      
      if (search) {
        conditions.push('(description LIKE ? OR category LIKE ?)');
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }
      
      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }
      
      const rows = await query(sql, params);
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }

  // Get transaction summary for a user
  static async getSummaryByUserId(userId, options = {}) {
    try {
      const { startDate, endDate } = options;
      
      let sql = `
        SELECT 
          type,
          COUNT(*) as count,
          SUM(amount) as total,
          AVG(amount) as average
        FROM transactions 
        WHERE user_id = ?
      `;
      const params = [userId];
      
      if (startDate) {
        sql += ' AND date >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        sql += ' AND date <= ?';
        params.push(endDate);
      }
      
      sql += ' GROUP BY type';
      
      const rows = await query(sql, params);
      
      const summary = {
        income: { count: 0, total: 0, average: 0 },
        expense: { count: 0, total: 0, average: 0 },
        balance: 0
      };
      
      rows.forEach(row => {
        summary[row.type] = {
          count: row.count,
          total: parseFloat(row.total),
          average: parseFloat(row.average)
        };
      });
      
      summary.balance = summary.income.total - summary.expense.total;
      
      return summary;
    } catch (error) {
      throw error;
    }
  }

  // Get monthly data for a user
  static async getMonthlyDataByUserId(userId, options = {}) {
    try {
      const { startDate, endDate } = options;
      
      let sql = `
        SELECT 
          DATE_FORMAT(date, '%Y-%m') as month,
          type,
          SUM(amount) as total
        FROM transactions 
        WHERE user_id = ?
      `;
      const params = [userId];
      
      if (startDate) {
        sql += ' AND date >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        sql += ' AND date <= ?';
        params.push(endDate);
      }
      
      sql += ' GROUP BY DATE_FORMAT(date, \'%Y-%m\'), type ORDER BY month';
      
      const rows = await query(sql, params);
      
      // Group by month
      const monthlyMap = {};
      
      rows.forEach(row => {
        const month = row.month;
        if (!monthlyMap[month]) {
          monthlyMap[month] = {
            month: month,
            income: 0,
            expense: 0
          };
        }
        monthlyMap[month][row.type] = parseFloat(row.total);
      });
      
      // Convert to array and sort by month
      const monthlyData = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));
      
      return monthlyData;
    } catch (error) {
      throw error;
    }
  }

  // Get categories for a user
  static async getCategoriesByUserId(userId, type = null) {
    try {
      let sql = 'SELECT DISTINCT category FROM transactions WHERE user_id = ?';
      const params = [userId];
      
      if (type) {
        sql += ' AND type = ?';
        params.push(type);
      }
      
      sql += ' ORDER BY category';
      
      const rows = await query(sql, params);
      return rows.map(row => row.category);
    } catch (error) {
      throw error;
    }
  }

  // Update transaction
  async update(updateData) {
    try {
      const allowedFields = [
        'date', 'type', 'description', 'category', 'amount',
        'invoice_file_id', 'tax_invoice_file_id', 'notes'
      ];
      
      const updates = [];
      const values = [];
      
      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }
      
      if (updates.length === 0) {
        return this;
      }
      
      values.push(this.id);
      
      const sql = `UPDATE transactions SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      await query(sql, values);
      
      // Refresh transaction data
      const updatedTransaction = await Transaction.findById(this.id);
      Object.assign(this, updatedTransaction);
      
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Delete transaction
  async delete() {
    try {
      const sql = 'DELETE FROM transactions WHERE id = ?';
      await query(sql, [this.id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Delete transaction by ID and user ID
  static async deleteByIdAndUserId(id, userId) {
    try {
      const sql = 'DELETE FROM transactions WHERE id = ? AND user_id = ?';
      const result = await query(sql, [id, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      date: this.date,
      type: this.type,
      description: this.description,
      category: this.category,
      amount: this.amount,
      invoice_file_id: this.invoice_file_id,
      tax_invoice_file_id: this.tax_invoice_file_id,
      notes: this.notes,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Get total revenue (sum of all income transactions)
  static async getTotalRevenue() {
    try {
      const sql = 'SELECT SUM(amount) as total FROM transactions WHERE type = "income"';
      const rows = await query(sql);
      return rows[0].total || 0;
    } catch (error) {
      console.error('Error in getTotalRevenue:', error);
      return 0;
    }
  }

  // Get recent activity
  static async getRecentActivity(limit = 10) {
    try {
      const sql = `
        SELECT t.*, u.full_name as user_name, u.username
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        ORDER BY t.created_at DESC
        LIMIT ?
      `;
      const rows = await query(sql, [limit]);
      
      return rows.map(row => ({
        id: row.id,
        type: 'transaction_created',
        description: `${row.type === 'income' ? 'Pendapatan' : 'Pengeluaran'} - ${row.description}`,
        timestamp: row.created_at,
        user: row.full_name || row.username,
        amount: row.amount,
        category: row.category
      }));
    } catch (error) {
      console.error('Error in getRecentActivity:', error);
      // Return empty array if there's an error
      return [];
    }
  }

  // Get company summary
  static async getCompanySummary(companyId, dateRange = {}) {
    try {
      let whereClause = 'u.company_id = ?';
      const params = [companyId];
      
      if (dateRange.startDate) {
        whereClause += ' AND t.date >= ?';
        params.push(dateRange.startDate);
      }
      
      if (dateRange.endDate) {
        whereClause += ' AND t.date <= ?';
        params.push(dateRange.endDate);
      }
      
      const sql = `
        SELECT 
          SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) as totalIncome,
          SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as totalExpense,
          COUNT(*) as totalTransactions
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        WHERE ${whereClause}
      `;
      
      const rows = await query(sql, params);
      const result = rows[0];
      
      const totalIncome = result.totalIncome || 0;
      const totalExpense = result.totalExpense || 0;
      const netProfit = totalIncome - totalExpense;
      const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
      
      return {
        totalIncome,
        totalExpense,
        netProfit,
        profitMargin,
        totalTransactions: result.totalTransactions || 0,
        incomeGrowth: 0, // TODO: Calculate growth compared to previous period
        expenseGrowth: 0, // TODO: Calculate growth compared to previous period
        profitGrowth: 0 // TODO: Calculate growth compared to previous period
      };
    } catch (error) {
      console.error('Error in getCompanySummary:', error);
      return {
        totalIncome: 0,
        totalExpense: 0,
        netProfit: 0,
        profitMargin: 0,
        totalTransactions: 0,
        incomeGrowth: 0,
        expenseGrowth: 0,
        profitGrowth: 0
      };
    }
  }

  // Get recent transactions by company
  static async getRecentByCompany(companyId, limit = 5) {
    try {
      const sql = `
        SELECT t.*, u.full_name as user_name
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        WHERE u.company_id = ?
        ORDER BY t.date DESC, t.created_at DESC
        LIMIT ?
      `;
      
      const rows = await query(sql, [companyId, limit]);
      return rows.map(row => new Transaction(row));
    } catch (error) {
      console.error('Error in getRecentByCompany:', error);
      return [];
    }
  }

  // Get monthly data for chart
  static async getMonthlyData(companyId, year) {
    try {
      const sql = `
        SELECT 
          MONTH(t.date) as month,
          SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) as income,
          SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as expense
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        WHERE u.company_id = ? AND YEAR(t.date) = ?
        GROUP BY MONTH(t.date)
        ORDER BY month
      `;
      
      const rows = await query(sql, [companyId, year]);
      
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      
      return rows.map(row => ({
        month: monthNames[row.month - 1],
        income: row.income || 0,
        expense: row.expense || 0
      }));
    } catch (error) {
      console.error('Error in getMonthlyData:', error);
      return [];
    }
  }
}

module.exports = Transaction;