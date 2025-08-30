const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

class File {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.original_name = data.original_name;
    this.filename = data.filename;
    this.file_path = data.file_path;
    this.mime_type = data.mime_type;
    this.file_size = data.file_size;
    this.file_type = data.file_type;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create new file record
  static async create(fileData) {
    try {
      const {
        user_id,
        original_name,
        filename,
        file_path,
        mime_type,
        file_size,
        file_type
      } = fileData;
      
      const id = uuidv4();
      
      const sql = `
        INSERT INTO files (
          id, user_id, original_name, filename, file_path,
          mime_type, file_size, file_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await query(sql, [
        id, user_id, original_name, filename, file_path,
        mime_type, file_size, file_type
      ]);
      
      // Get the created file
      const newFile = await File.findById(id);
      return newFile;
    } catch (error) {
      throw error;
    }
  }

  // Find file by ID
  static async findById(id) {
    try {
      const sql = 'SELECT * FROM files WHERE id = ?';
      const rows = await query(sql, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new File(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find file by ID and user ID
  static async findByIdAndUserId(id, userId) {
    try {
      const sql = 'SELECT * FROM files WHERE id = ? AND user_id = ?';
      const rows = await query(sql, [id, userId]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new File(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find file by filename
  static async findByFilename(filename) {
    try {
      const sql = 'SELECT * FROM files WHERE filename = ?';
      const rows = await query(sql, [filename]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new File(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find all files for a user
  static async findByUserId(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        file_type,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = options;
      
      const offset = (page - 1) * limit;
      
      let sql = 'SELECT * FROM files WHERE user_id = ?';
      const params = [userId];
      
      // Add file type filter
      if (file_type) {
        sql += ' AND file_type = ?';
        params.push(file_type);
      }
      
      // Add sorting
      const allowedSortFields = ['created_at', 'original_name', 'file_size', 'file_type'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
      const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      
      sql += ` ORDER BY ${sortField} ${order} LIMIT ? OFFSET ?`;
      params.push(limit, offset);
      
      const rows = await query(sql, params);
      
      return rows.map(row => new File(row));
    } catch (error) {
      throw error;
    }
  }

  // Count files for a user
  static async countByUserId(userId, options = {}) {
    try {
      const { file_type } = options;
      
      let sql = 'SELECT COUNT(*) as count FROM files WHERE user_id = ?';
      const params = [userId];
      
      if (file_type) {
        sql += ' AND file_type = ?';
        params.push(file_type);
      }
      
      const rows = await query(sql, params);
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }

  // Get file storage statistics for a user
  static async getStorageStatsByUserId(userId) {
    try {
      const sql = `
        SELECT 
          file_type,
          COUNT(*) as count,
          SUM(file_size) as total_size,
          AVG(file_size) as average_size
        FROM files 
        WHERE user_id = ?
        GROUP BY file_type
      `;
      
      const rows = await query(sql, [userId]);
      
      const stats = {
        invoice: { count: 0, total_size: 0, average_size: 0 },
        tax_invoice: { count: 0, total_size: 0, average_size: 0 },
        total_files: 0,
        total_size: 0
      };
      
      rows.forEach(row => {
        stats[row.file_type] = {
          count: row.count,
          total_size: parseInt(row.total_size),
          average_size: parseFloat(row.average_size)
        };
        stats.total_files += row.count;
        stats.total_size += parseInt(row.total_size);
      });
      
      return stats;
    } catch (error) {
      throw error;
    }
  }

  // Update file metadata
  async update(updateData) {
    try {
      const allowedFields = ['original_name', 'file_type'];
      
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
      
      const sql = `UPDATE files SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      await query(sql, values);
      
      // Refresh file data
      const updatedFile = await File.findById(this.id);
      Object.assign(this, updatedFile);
      
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Delete file record and physical file
  async delete() {
    try {
      // Delete physical file first
      try {
        await fs.unlink(this.file_path);
      } catch (fileError) {
        // File might not exist, continue with database deletion
        console.warn(`Warning: Could not delete physical file ${this.file_path}:`, fileError.message);
      }
      
      // Delete database record
      const sql = 'DELETE FROM files WHERE id = ?';
      await query(sql, [this.id]);
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Delete file by ID and user ID
  static async deleteByIdAndUserId(id, userId) {
    try {
      // First get the file to delete physical file
      const file = await File.findByIdAndUserId(id, userId);
      if (!file) {
        return false;
      }
      
      // Delete physical file
      try {
        await fs.unlink(file.file_path);
      } catch (fileError) {
        console.warn(`Warning: Could not delete physical file ${file.file_path}:`, fileError.message);
      }
      
      // Delete database record
      const sql = 'DELETE FROM files WHERE id = ? AND user_id = ?';
      const result = await query(sql, [id, userId]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Check if file exists physically
  async exists() {
    try {
      await fs.access(this.file_path);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get file stats
  async getStats() {
    try {
      const stats = await fs.stat(this.file_path);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime
      };
    } catch (error) {
      throw error;
    }
  }

  // Get file URL for download
  getDownloadUrl(baseUrl = '') {
    return `${baseUrl}/api/files/download/${this.id}`;
  }

  // Get file extension
  getExtension() {
    return path.extname(this.original_name).toLowerCase();
  }

  // Check if file is image
  isImage() {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return imageTypes.includes(this.mime_type);
  }

  // Check if file is PDF
  isPDF() {
    return this.mime_type === 'application/pdf';
  }

  // Format file size
  getFormattedSize() {
    const bytes = this.file_size;
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      original_name: this.original_name,
      filename: this.filename,
      file_path: this.file_path,
      mime_type: this.mime_type,
      file_size: this.file_size,
      file_type: this.file_type,
      created_at: this.created_at,
      updated_at: this.updated_at,
      formatted_size: this.getFormattedSize(),
      extension: this.getExtension(),
      is_image: this.isImage(),
      is_pdf: this.isPDF()
    };
  }
}

module.exports = File;