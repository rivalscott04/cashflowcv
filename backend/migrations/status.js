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

// Get executed migrations with timestamps
const getExecutedMigrations = async (connection) => {
  try {
    const [rows] = await connection.execute(
      'SELECT filename, executed_at FROM migrations ORDER BY id'
    );
    return rows;
  } catch (error) {
    console.log('⚠️  Migrations table not found.');
    return [];
  }
};

// Get all migration files
const getMigrationFiles = () => {
  const migrationsDir = __dirname;
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql') && !file.includes('_rollback'))
    .sort();
  return files;
};

// Check migration status
const checkMigrationStatus = async () => {
  let connection;
  
  try {
    // Connect to the database
    connection = await mysql.createConnection(dbConfig);
    console.log('🔌 Connected to database');
    console.log('\n📊 Migration Status\n');
    
    // Get executed migrations
    const executedMigrations = await getExecutedMigrations(connection);
    const executedMap = new Map();
    
    executedMigrations.forEach(migration => {
      executedMap.set(migration.filename, migration.executed_at);
    });
    
    // Get all migration files
    const migrationFiles = getMigrationFiles();
    
    if (migrationFiles.length === 0) {
      console.log('📁 No migration files found');
      return;
    }
    
    console.log('Status | Migration File                    | Executed At');
    console.log('-------|-----------------------------------|---------------------------');
    
    let pendingCount = 0;
    let executedCount = 0;
    
    migrationFiles.forEach(filename => {
      const isExecuted = executedMap.has(filename);
      const status = isExecuted ? '✅ UP  ' : '⏳ DOWN';
      const executedAt = isExecuted 
        ? new Date(executedMap.get(filename)).toLocaleString()
        : 'Not executed';
      
      console.log(`${status} | ${filename.padEnd(33)} | ${executedAt}`);
      
      if (isExecuted) {
        executedCount++;
      } else {
        pendingCount++;
      }
    });
    
    console.log('\n📈 Summary:');
    console.log(`   Total migrations: ${migrationFiles.length}`);
    console.log(`   Executed: ${executedCount}`);
    console.log(`   Pending: ${pendingCount}`);
    
    if (pendingCount > 0) {
      console.log('\n🚀 Run `npm run migrate` to execute pending migrations');
    } else {
      console.log('\n✨ All migrations are up to date');
    }
    
  } catch (error) {
    console.error('❌ Failed to check migration status:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run status check if called directly
if (require.main === module) {
  checkMigrationStatus();
}

module.exports = { checkMigrationStatus };