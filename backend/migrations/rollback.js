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

// Get executed migrations
const getExecutedMigrations = async (connection) => {
  try {
    const [rows] = await connection.execute('SELECT filename FROM migrations ORDER BY id DESC');
    return rows.map(row => row.filename);
  } catch (error) {
    console.log('⚠️  Migrations table not found. No migrations to rollback.');
    return [];
  }
};

// Remove migration from executed list
const removeMigrationRecord = async (connection, filename) => {
  await connection.execute('DELETE FROM migrations WHERE filename = ?', [filename]);
};

// Check if rollback file exists
const hasRollbackFile = (filename) => {
  const rollbackFilename = filename.replace('.sql', '_rollback.sql');
  const rollbackPath = path.join(__dirname, rollbackFilename);
  return fs.existsSync(rollbackPath);
};

// Execute rollback
const executeRollback = async (connection, filename) => {
  const rollbackFilename = filename.replace('.sql', '_rollback.sql');
  const rollbackPath = path.join(__dirname, rollbackFilename);
  
  if (!fs.existsSync(rollbackPath)) {
    throw new Error(`Rollback file not found: ${rollbackFilename}`);
  }
  
  const sql = fs.readFileSync(rollbackPath, 'utf8');
  
  // Split by semicolon and execute each statement
  const statements = sql.split(';').filter(stmt => stmt.trim());
  
  for (const statement of statements) {
    if (statement.trim()) {
      await connection.execute(statement);
    }
  }
  
  await removeMigrationRecord(connection, filename);
  console.log(`✅ Rolled back migration: ${filename}`);
};

// Main rollback function
const rollbackMigration = async (steps = 1) => {
  let connection;
  
  try {
    // Connect to the database
    connection = await mysql.createConnection(dbConfig);
    console.log('🔌 Connected to database');
    
    // Get executed migrations
    const executedMigrations = await getExecutedMigrations(connection);
    
    if (executedMigrations.length === 0) {
      console.log('✨ No migrations to rollback');
      return;
    }
    
    console.log(`📋 Found ${executedMigrations.length} executed migrations`);
    
    // Rollback specified number of steps
    const migrationsToRollback = executedMigrations.slice(0, steps);
    
    for (const filename of migrationsToRollback) {
      if (hasRollbackFile(filename)) {
        await executeRollback(connection, filename);
      } else {
        console.log(`⚠️  No rollback file for: ${filename} (skipping)`);
        await removeMigrationRecord(connection, filename);
      }
    }
    
    console.log(`🚀 Rolled back ${migrationsToRollback.length} migrations`);
    
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
};

// Get steps from command line arguments
const steps = parseInt(process.argv[2]) || 1;

// Run rollback if called directly
if (require.main === module) {
  console.log(`🔄 Rolling back ${steps} migration(s)...`);
  rollbackMigration(steps);
}

module.exports = { rollbackMigration };