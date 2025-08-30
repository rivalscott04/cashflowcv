const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Settings {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.setting_key = data.setting_key;
    this.setting_value = data.setting_value;
    this.setting_type = data.setting_type;
    this.description = data.description;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create new setting
  static async create(settingData) {
    try {
      const {
        user_id,
        setting_key,
        setting_value,
        setting_type = 'string',
        description = null
      } = settingData;
      
      const id = uuidv4();
      
      const sql = `
        INSERT INTO settings (
          id, user_id, setting_key, setting_value, setting_type, description
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      await query(sql, [
        id, user_id, setting_key, setting_value, setting_type, description
      ]);
      
      // Get the created setting
      const newSetting = await Settings.findById(id);
      return newSetting;
    } catch (error) {
      throw error;
    }
  }

  // Find setting by ID
  static async findById(id) {
    try {
      const sql = 'SELECT * FROM settings WHERE id = ?';
      const rows = await query(sql, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new Settings(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find setting by key and user ID
  static async findByKeyAndUserId(settingKey, userId) {
    try {
      const sql = 'SELECT * FROM settings WHERE setting_key = ? AND user_id = ?';
      const rows = await query(sql, [settingKey, userId]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new Settings(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find all settings for a user
  static async findByUserId(userId) {
    try {
      const sql = 'SELECT * FROM settings WHERE user_id = ? ORDER BY setting_key';
      const rows = await query(sql, [userId]);
      
      return rows.map(row => new Settings(row));
    } catch (error) {
      throw error;
    }
  }

  // Get settings as key-value object for a user
  static async getSettingsObject(userId) {
    try {
      const settings = await Settings.findByUserId(userId);
      const settingsObj = {};
      
      settings.forEach(setting => {
        let value = setting.setting_value;
        
        // Parse value based on type
        switch (setting.setting_type) {
          case 'boolean':
            value = value === 'true' || value === '1';
            break;
          case 'number':
            value = parseFloat(value);
            break;
          case 'json':
            try {
              value = JSON.parse(value);
            } catch (e) {
              value = setting.setting_value;
            }
            break;
          default:
            // string type, keep as is
            break;
        }
        
        settingsObj[setting.setting_key] = value;
      });
      
      return settingsObj;
    } catch (error) {
      throw error;
    }
  }

  // Set or update a setting
  static async setSetting(userId, settingKey, settingValue, settingType = 'string', description = null) {
    try {
      // Convert value to string for storage
      let valueToStore = settingValue;
      if (settingType === 'json') {
        valueToStore = JSON.stringify(settingValue);
      } else if (settingType === 'boolean') {
        valueToStore = settingValue ? '1' : '0';
      } else {
        valueToStore = String(settingValue);
      }
      
      // Check if setting exists
      const existingSetting = await Settings.findByKeyAndUserId(settingKey, userId);
      
      if (existingSetting) {
        // Update existing setting
        await existingSetting.update({
          setting_value: valueToStore,
          setting_type: settingType,
          description: description
        });
        return existingSetting;
      } else {
        // Create new setting
        return await Settings.create({
          user_id: userId,
          setting_key: settingKey,
          setting_value: valueToStore,
          setting_type: settingType,
          description: description
        });
      }
    } catch (error) {
      throw error;
    }
  }

  // Get a specific setting value
  static async getSetting(userId, settingKey, defaultValue = null) {
    try {
      const setting = await Settings.findByKeyAndUserId(settingKey, userId);
      
      if (!setting) {
        return defaultValue;
      }
      
      let value = setting.setting_value;
      
      // Parse value based on type
      switch (setting.setting_type) {
        case 'boolean':
          return value === 'true' || value === '1';
        case 'number':
          return parseFloat(value);
        case 'json':
          try {
            return JSON.parse(value);
          } catch (e) {
            return defaultValue;
          }
        default:
          return value;
      }
    } catch (error) {
      throw error;
    }
  }

  // Update setting
  async update(updateData) {
    try {
      const allowedFields = ['setting_value', 'setting_type', 'description'];
      
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
      
      const sql = `UPDATE settings SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      await query(sql, values);
      
      // Refresh setting data
      const updatedSetting = await Settings.findById(this.id);
      Object.assign(this, updatedSetting);
      
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Delete setting
  async delete() {
    try {
      const sql = 'DELETE FROM settings WHERE id = ?';
      await query(sql, [this.id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Delete setting by key and user ID
  static async deleteByKeyAndUserId(settingKey, userId) {
    try {
      const sql = 'DELETE FROM settings WHERE setting_key = ? AND user_id = ?';
      const result = await query(sql, [settingKey, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get parsed value
  getParsedValue() {
    let value = this.setting_value;
    
    switch (this.setting_type) {
      case 'boolean':
        return value === 'true' || value === '1';
      case 'number':
        return parseFloat(value);
      case 'json':
        try {
          return JSON.parse(value);
        } catch (e) {
          return value;
        }
      default:
        return value;
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      setting_key: this.setting_key,
      setting_value: this.setting_value,
      setting_type: this.setting_type,
      description: this.description,
      parsed_value: this.getParsedValue(),
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

// Company Settings class for global settings
class CompanySettings {
  constructor(data) {
    this.id = data.id;
    this.setting_key = data.setting_key;
    this.setting_value = data.setting_value;
    this.setting_type = data.setting_type;
    this.description = data.description;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Find company setting by key
  static async findByKey(settingKey) {
    try {
      const sql = 'SELECT * FROM company_settings WHERE setting_key = ?';
      const rows = await query(sql, [settingKey]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new CompanySettings(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get all company settings
  static async getAll() {
    try {
      const sql = 'SELECT * FROM company_settings ORDER BY setting_key';
      const rows = await query(sql);
      
      return rows.map(row => new CompanySettings(row));
    } catch (error) {
      throw error;
    }
  }

  // Get company settings as object
  static async getSettingsObject() {
    try {
      const settings = await CompanySettings.getAll();
      const settingsObj = {};
      
      settings.forEach(setting => {
        let value = setting.setting_value;
        
        // Parse value based on type
        switch (setting.setting_type) {
          case 'boolean':
            value = value === 'true' || value === '1';
            break;
          case 'number':
            value = parseFloat(value);
            break;
          case 'json':
            try {
              value = JSON.parse(value);
            } catch (e) {
              value = setting.setting_value;
            }
            break;
          default:
            // string type, keep as is
            break;
        }
        
        settingsObj[setting.setting_key] = value;
      });
      
      return settingsObj;
    } catch (error) {
      throw error;
    }
  }

  // Set or update company setting
  static async setSetting(settingKey, settingValue, settingType = 'string', description = null) {
    try {
      // Convert value to string for storage
      let valueToStore = settingValue;
      if (settingType === 'json') {
        valueToStore = JSON.stringify(settingValue);
      } else if (settingType === 'boolean') {
        valueToStore = settingValue ? '1' : '0';
      } else {
        valueToStore = String(settingValue);
      }
      
      // Check if setting exists
      const existingSetting = await CompanySettings.findByKey(settingKey);
      
      if (existingSetting) {
        // Update existing setting
        const sql = `UPDATE company_settings SET setting_value = ?, setting_type = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?`;
        await query(sql, [valueToStore, settingType, description, settingKey]);
        return await CompanySettings.findByKey(settingKey);
      } else {
        // Create new setting
        const id = uuidv4();
        const sql = `INSERT INTO company_settings (id, setting_key, setting_value, setting_type, description) VALUES (?, ?, ?, ?, ?)`;
        await query(sql, [id, settingKey, valueToStore, settingType, description]);
        return await CompanySettings.findByKey(settingKey);
      }
    } catch (error) {
      throw error;
    }
  }

  // Get company setting value
  static async getSetting(settingKey, defaultValue = null) {
    try {
      const setting = await CompanySettings.findByKey(settingKey);
      
      if (!setting) {
        return defaultValue;
      }
      
      let value = setting.setting_value;
      
      // Parse value based on type
      switch (setting.setting_type) {
        case 'boolean':
          return value === 'true' || value === '1';
        case 'number':
          return parseFloat(value);
        case 'json':
          try {
            return JSON.parse(value);
          } catch (e) {
            return defaultValue;
          }
        default:
          return value;
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = { Settings, CompanySettings };