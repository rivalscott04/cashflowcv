const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sasambo_finance',
  charset: 'utf8mb4',
  timezone: '+00:00'
};

// Create migrations table if not exists
const createMigrationsTable = async (connection) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS migrations (
      id INT PRIMARY KEY AUTO_INCREMENT,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await connection.execute(sql);
  console.log('✅ Migrations table ready');
};

// Get executed migrations
const getExecutedMigrations = async (connection) => {
  const [rows] = await connection.execute('SELECT filename FROM migrations ORDER BY id');
  return rows.map(row => row.filename);
};

// Mark migration as executed
const markMigrationExecuted = async (connection, filename) => {
  await connection.execute('INSERT INTO migrations (filename) VALUES (?)', [filename]);
};

// Get all migration files
const getMigrationFiles = () => {
  const migrationsDir = __dirname;
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql') && file !== 'migrate.js')
    .sort();
  return files;
};

// Execute migration file
const executeMigration = async (connection, filename) => {
  const filePath = path.join(__dirname, filename);
  const sql = fs.readFileSync(filePath, 'utf8');
  
  // Split by semicolon and execute each statement
  const statements = sql.split(';').filter(stmt => stmt.trim());
  
  for (const statement of statements) {
    if (statement.trim()) {
      await connection.query(statement);
    }
  }
  
  await markMigrationExecuted(connection, filename);
  console.log(`✅ Executed migration: ${filename}`);
};

// Main migration function
const runMigrations = async () => {
  let connection;
  
  try {
    // Create database if not exists
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`📊 Database '${dbConfig.database}' ready`);
    await tempConnection.end();
    
    // Connect to the database
    connection = await mysql.createConnection(dbConfig);
    console.log('🔌 Connected to database');
    
    // Create migrations table
    await createMigrationsTable(connection);
    
    // Get executed migrations
    const executedMigrations = await getExecutedMigrations(connection);
    console.log(`📋 Found ${executedMigrations.length} executed migrations`);
    
    // Get all migration files
    const migrationFiles = getMigrationFiles();
    console.log(`📁 Found ${migrationFiles.length} migration files`);
    
    // Execute pending migrations
    let executedCount = 0;
    for (const filename of migrationFiles) {
      if (!executedMigrations.includes(filename)) {
        await executeMigration(connection, filename);
        executedCount++;
      }
    }
    
    if (executedCount === 0) {
      console.log('✨ No pending migrations');
    } else {
      console.log(`🚀 Executed ${executedCount} new migrations`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
};

// Run migrations if called directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };