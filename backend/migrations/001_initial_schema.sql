-- Sasambo Solusi Digital Finance Database Schema
-- MySQL Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role ENUM('admin', 'user') DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) PRIMARY KEY,
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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_date (date),
  INDEX idx_type (type),
  INDEX idx_category (category)
);

-- Files table
CREATE TABLE IF NOT EXISTS files (
  id VARCHAR(36) PRIMARY KEY,
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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_file_type (file_type)
);

-- Settings table
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

-- Company settings table (global settings)
CREATE TABLE IF NOT EXISTS company_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_setting_key (setting_key)
);

-- Insert default admin user
INSERT IGNORE INTO users (username, email, password_hash, full_name, role) 
VALUES (
  'admin', 
  'admin@sasambo.com', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123
  'Administrator',
  'admin'
);

-- Insert default company settings
INSERT IGNORE INTO company_settings (setting_key, setting_value, setting_type, description) VALUES
('company_name', 'Sasambo Solusi Digital', 'string', 'Nama perusahaan'),
('company_email', 'info@sasambo.com', 'string', 'Email perusahaan'),
('company_phone', '+62-xxx-xxxx-xxxx', 'string', 'Nomor telepon perusahaan'),
('company_address', 'Jakarta, Indonesia', 'string', 'Alamat perusahaan'),
('currency', 'IDR', 'string', 'Mata uang default'),
('timezone', 'Asia/Jakarta', 'string', 'Zona waktu'),
('date_format', 'DD/MM/YYYY', 'string', 'Format tanggal'),
('max_file_size', '300000', 'number', 'Ukuran maksimal file upload (bytes)'),
('allowed_file_types', '["pdf", "jpg", "jpeg", "png"]', 'json', 'Tipe file yang diizinkan');

-- Insert default user settings for admin
INSERT IGNORE INTO settings (user_id, setting_key, setting_value, setting_type) VALUES
(1, 'theme', 'light', 'string'),
(1, 'language', 'id', 'string'),
(1, 'notifications_enabled', 'true', 'boolean'),
(1, 'dashboard_layout', 'default', 'string');