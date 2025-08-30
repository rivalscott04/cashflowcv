-- Sasambo Solusi Digital Finance Database Schema
-- MySQL Database Schema - Multi-Company Support

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(50),
  address TEXT,
  logo_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  subscription_plan ENUM('basic', 'premium', 'enterprise') DEFAULT 'basic',
  subscription_expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_is_active (is_active)
);

-- Users table (modified for multi-company)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NULL, -- NULL for superadmin
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role ENUM('superadmin', 'admin', 'user') DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_company_id (company_id),
  INDEX idx_role (role)
);

-- Transactions table (modified for multi-company)
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) PRIMARY KEY,
  company_id INT NOT NULL,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  invoice_file_id VARCHAR(36) NULL,
  tax_invoice_file_id VARCHAR(36) NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_company_id (company_id),
  INDEX idx_user_id (user_id),
  INDEX idx_date (date),
  INDEX idx_type (type),
  INDEX idx_category (category)
);

-- Files table (modified for multi-company)
CREATE TABLE IF NOT EXISTS files (
  id VARCHAR(36) PRIMARY KEY,
  company_id INT NOT NULL,
  user_id INT NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  mimetype VARCHAR(100) NOT NULL,
  size INT NOT NULL,
  file_type ENUM('invoice', 'tax_invoice', 'other') DEFAULT 'other',
  url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_company_id (company_id),
  INDEX idx_user_id (user_id),
  INDEX idx_file_type (file_type)
);

-- Settings table (user-specific settings)
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT,
  setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_setting (user_id, setting_key),
  INDEX idx_user_id (user_id),
  INDEX idx_setting_key (setting_key)
);

-- Company settings table (per-company settings)
CREATE TABLE IF NOT EXISTS company_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT,
  setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE KEY unique_company_setting (company_id, setting_key),
  INDEX idx_company_id (company_id),
  INDEX idx_setting_key (setting_key)
);

-- Insert default company
INSERT IGNORE INTO companies (id, name, email, phone, address, is_active) VALUES
(1, 'Sasambo Solusi Digital', 'info@sasambo.com', '+62-xxx-xxxx-xxxx', 'Jakarta, Indonesia', TRUE);

-- Insert default superadmin user (no company association)
INSERT IGNORE INTO users (id, company_id, username, email, password_hash, full_name, role) VALUES
(1, NULL, 'superadmin', 'superadmin@sasambo.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super Administrator', 'superadmin');

-- Insert default admin user for default company
INSERT IGNORE INTO users (id, company_id, username, email, password_hash, full_name, role) VALUES
(2, 1, 'admin', 'admin@sasambo.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin');

-- Insert default company settings for default company
INSERT IGNORE INTO company_settings (company_id, setting_key, setting_value, setting_type, description) VALUES
(1, 'currency', 'IDR', 'string', 'Mata uang default'),
(1, 'timezone', 'Asia/Jakarta', 'string', 'Zona waktu'),
(1, 'date_format', 'DD/MM/YYYY', 'string', 'Format tanggal'),
(1, 'max_file_size', '300000', 'number', 'Ukuran maksimal file upload (bytes)'),
(1, 'allowed_file_types', '["pdf", "jpg", "jpeg", "png"]', 'json', 'Tipe file yang diizinkan');

-- Insert default user settings for superadmin
INSERT IGNORE INTO settings (user_id, setting_key, setting_value, setting_type) VALUES
(1, 'theme', 'light', 'string'),
(1, 'language', 'id', 'string'),
(1, 'notifications_enabled', 'true', 'boolean'),
(1, 'dashboard_layout', 'default', 'string');

-- Insert default user settings for admin
INSERT IGNORE INTO settings (user_id, setting_key, setting_value, setting_type) VALUES
(2, 'theme', 'light', 'string'),
(2, 'language', 'id', 'string'),
(2, 'notifications_enabled', 'true', 'boolean'),
(2, 'dashboard_layout', 'default', 'string');