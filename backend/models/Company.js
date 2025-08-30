const { pool } = require('../config/database');

class Company {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.website = data.website;
    this.logo_url = data.logo_url;
    this.is_active = data.is_active;
    this.subscription_plan = data.subscription_plan;
    this.subscription_expires_at = data.subscription_expires_at;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new company
  static async create(companyData) {
    const { name, email, phone, address, website, logo_url, subscription_plan } = companyData;
    
    const query = `
      INSERT INTO companies (name, email, phone, address, website, logo_url, subscription_plan)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [name, email, phone, address, website, logo_url, subscription_plan]);
    
    return this.findById(result.insertId);
  }

  // Find company by ID
  static async findById(id) {
    const query = 'SELECT * FROM companies WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    if (rows.length === 0) {
      return null;
    }
    
    return new Company(rows[0]);
  }

  // Find company by name
  static async findByName(name) {
    const query = 'SELECT * FROM companies WHERE name = ?';
    const [rows] = await pool.execute(query, [name]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return new Company(rows[0]);
  }

  // Get all companies
  static async findAll(options = {}) {
    let query = 'SELECT * FROM companies';
    const params = [];
    
    if (options.active_only) {
      query += ' WHERE is_active = TRUE';
    }
    
    query += ' ORDER BY created_at DESC';
    
    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows.map(row => new Company(row));
  }

  // Count companies
  static async count(filters = {}) {
    let query = 'SELECT COUNT(*) as total FROM companies';
    const params = [];
    
    if (filters.active_only) {
      query += ' WHERE is_active = TRUE';
    }
    
    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }

  // Update company
  static async update(id, updateData) {
    const allowedFields = ['name', 'email', 'phone', 'address', 'website', 'logo_url', 'is_active', 'subscription_plan', 'subscription_expires_at'];
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    values.push(id);
    
    const query = `UPDATE companies SET ${fields.join(', ')} WHERE id = ?`;
    await pool.execute(query, values);
    
    return this.findById(id);
  }

  // Delete company (soft delete by setting is_active to false)
  static async delete(id) {
    const query = 'UPDATE companies SET is_active = FALSE WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    
    return result.affectedRows > 0;
  }

  // Hard delete company (permanent deletion)
  static async hardDelete(id) {
    const query = 'DELETE FROM companies WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    
    return result.affectedRows > 0;
  }

  // Get company statistics
  static async getStats(companyId) {
    const queries = {
      userCount: 'SELECT COUNT(*) as count FROM users WHERE company_id = ? AND is_active = TRUE',
      transactionCount: 'SELECT COUNT(*) as count FROM transactions WHERE company_id = ?',
      totalIncome: 'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE company_id = ? AND type = "income"',
      totalExpense: 'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE company_id = ? AND type = "expense"'
    };
    
    const stats = {};
    
    for (const [key, query] of Object.entries(queries)) {
      const [rows] = await pool.execute(query, [companyId]);
      stats[key] = rows[0].count || rows[0].total || 0;
    }
    
    return stats;
  }

  // Check if company exists and is active
  static async isActive(id) {
    const query = 'SELECT is_active FROM companies WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    
    return rows.length > 0 && rows[0].is_active;
  }

  // Get company settings
  async getSettings() {
    const query = 'SELECT * FROM company_settings WHERE company_id = ?';
    const [rows] = await pool.execute(query, [this.id]);
    
    const settings = {};
    rows.forEach(row => {
      let value = row.setting_value;
      
      // Parse value based on type
      switch (row.setting_type) {
        case 'number':
          value = parseFloat(value);
          break;
        case 'boolean':
          value = value === 'true';
          break;
        case 'json':
          try {
            value = JSON.parse(value);
          } catch (e) {
            // Keep as string if JSON parsing fails
          }
          break;
      }
      
      settings[row.setting_key] = value;
    });
    
    return settings;
  }

  // Update company setting
  async updateSetting(key, value, type = 'string') {
    let stringValue = value;
    
    if (type === 'json') {
      stringValue = JSON.stringify(value);
    } else if (type === 'boolean') {
      stringValue = value ? 'true' : 'false';
    } else {
      stringValue = String(value);
    }
    
    const query = `
      INSERT INTO company_settings (company_id, setting_key, setting_value, setting_type)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      setting_value = VALUES(setting_value),
      setting_type = VALUES(setting_type)
    `;
    
    await pool.execute(query, [this.id, key, stringValue, type]);
  }
}

module.exports = Company;