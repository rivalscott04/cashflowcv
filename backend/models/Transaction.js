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
}

module.exports = Transaction;