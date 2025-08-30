const { query, transaction } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');
const { v4: uuidv4 } = require('uuid');
const Company = require('./Company');

class User {
  constructor(data) {
    this.id = data.id;
    this.company_id = data.company_id;
    this.username = data.username;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.full_name = data.full_name;
    this.role = data.role || 'user';
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.last_login = data.last_login;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create new user
  static async create(userData) {
    try {
      const { username, email, password, full_name, role = 'user', company_id } = userData;
      
      // Validate company_id for non-superadmin users
      if (role !== 'superadmin' && !company_id) {
        throw new Error('Company ID is required for non-superadmin users');
      }
      
      // Validate company exists and is active (except for superadmin)
      if (company_id) {
        const isCompanyActive = await Company.isActive(company_id);
        if (!isCompanyActive) {
          throw new Error('Invalid or inactive company');
        }
      }
      
      // Hash password
      const password_hash = await hashPassword(password);
      
      const sql = `
        INSERT INTO users (company_id, username, email, password_hash, full_name, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const result = await query(sql, [company_id, username, email, password_hash, full_name, role]);
      
      // Get the created user
      const newUser = await User.findById(result.insertId);
      return newUser;
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const sql = 'SELECT * FROM users WHERE id = ? AND is_active = TRUE';
      const rows = await query(sql, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new User(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find user by username
  static async findByUsername(username) {
    try {
      const sql = 'SELECT * FROM users WHERE username = ? AND is_active = TRUE';
      const rows = await query(sql, [username]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new User(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const sql = 'SELECT * FROM users WHERE email = ? AND is_active = TRUE';
      const rows = await query(sql, [email]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new User(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Authenticate user
  static async authenticate(username, password) {
    try {
      const user = await User.findByUsername(username);
      
      if (!user) {
        return null;
      }
      
      const isValidPassword = await comparePassword(password, user.password_hash);
      
      if (!isValidPassword) {
        return null;
      }
      
      // Update last login
      await user.updateLastLogin();
      
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Compare password
  async comparePassword(password) {
    try {
      return await comparePassword(password, this.password_hash);
    } catch (error) {
      throw error;
    }
  }

  // Update last login
  async updateLastLogin() {
    try {
      const sql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
      await query(sql, [this.id]);
      this.last_login = new Date();
    } catch (error) {
      throw error;
    }
  }

  // Update user
  async update(updateData) {
    try {
      const allowedFields = ['username', 'email', 'full_name', 'role'];
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
      
      const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      await query(sql, values);
      
      // Refresh user data
      const updatedUser = await User.findById(this.id);
      Object.assign(this, updatedUser);
      
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Change password
  async changePassword(newPassword) {
    try {
      const password_hash = await hashPassword(newPassword);
      const sql = 'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      await query(sql, [password_hash, this.id]);
      this.password_hash = password_hash;
    } catch (error) {
      throw error;
    }
  }

  // Soft delete user
  async delete() {
    try {
      const sql = 'UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      await query(sql, [this.id]);
      this.is_active = false;
    } catch (error) {
      throw error;
    }
  }

  // Get all users (admin only)
  static async findAll(options = {}) {
    try {
      const { page = 1, limit = 10, role, search, company_id } = options;
      const offset = (page - 1) * limit;
      
      let sql = 'SELECT * FROM users WHERE is_active = TRUE';
      const params = [];
      
      // Filter by company for non-superadmin users
      if (company_id) {
        sql += ' AND company_id = ?';
        params.push(company_id);
      }
      
      if (role) {
        sql += ' AND role = ?';
        params.push(role);
      }
      
      if (search) {
        sql += ' AND (username LIKE ? OR email LIKE ? OR full_name LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const rows = await query(sql, params);
      
      return rows.map(row => new User(row));
    } catch (error) {
      throw error;
    }
  }

  // Count users
  static async count(options = {}) {
    try {
      const { role, search, company_id } = options;
      
      let sql = 'SELECT COUNT(*) as count FROM users WHERE is_active = TRUE';
      const params = [];
      
      // Filter by company for non-superadmin users
      if (company_id) {
        sql += ' AND company_id = ?';
        params.push(company_id);
      }
      
      if (role) {
        sql += ' AND role = ?';
        params.push(role);
      }
      
      if (search) {
        sql += ' AND (username LIKE ? OR email LIKE ? OR full_name LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      const rows = await query(sql, params);
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }

  // Get user's company
  async getCompany() {
    try {
      if (!this.company_id) {
        return null;
      }
      
      return await Company.findById(this.company_id);
    } catch (error) {
      throw error;
    }
  }

  // Find users by company ID
  static async findByCompanyId(companyId, options = {}) {
    try {
      const { page = 1, limit = 10, role, search } = options;
      const offset = (page - 1) * limit;
      
      let sql = 'SELECT * FROM users WHERE company_id = ? AND is_active = TRUE';
      const params = [companyId];
      
      if (role) {
        sql += ' AND role = ?';
        params.push(role);
      }
      
      if (search) {
        sql += ' AND (username LIKE ? OR email LIKE ? OR full_name LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const rows = await query(sql, params);
      
      return rows.map(row => new User(row));
    } catch (error) {
      throw error;
    }
  }

  // Check if user can access company data
  canAccessCompany(companyId) {
    // Superadmin can access all companies
    if (this.role === 'superadmin') {
      return true;
    }
    
    // Other users can only access their own company
    return this.company_id === companyId;
  }

  // Check if user is admin of their company
  isCompanyAdmin() {
    return this.role === 'admin' && this.company_id;
  }

  // Check if user is superadmin
  isSuperAdmin() {
    return this.role === 'superadmin';
  }

  // Update user with company validation
  async update(updateData) {
    try {
      const allowedFields = ['username', 'email', 'full_name', 'role', 'company_id'];
      const updates = [];
      const values = [];
      
      // Validate company_id change
      if (updateData.company_id !== undefined && updateData.company_id !== this.company_id) {
        if (updateData.role !== 'superadmin' && !updateData.company_id) {
          throw new Error('Company ID is required for non-superadmin users');
        }
        
        if (updateData.company_id) {
          const isCompanyActive = await Company.isActive(updateData.company_id);
          if (!isCompanyActive) {
            throw new Error('Invalid or inactive company');
          }
        }
      }
      
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
      
      const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      await query(sql, values);
      
      // Refresh user data
      const updatedUser = await User.findById(this.id);
      Object.assign(this, updatedUser);
      
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Convert to JSON (exclude sensitive data)
  toJSON() {
    const { password_hash, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = User;