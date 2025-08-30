const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sasambo_finance'
};

async function resetDatabase() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(config);
    
    console.log('🗑️ Dropping all tables...');
    
    // Get all tables
    const [tables] = await connection.execute(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = ?',
      [config.database]
    );
    
    // Disable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // Drop all tables
    for (const table of tables) {
      const tableName = table.table_name || table.TABLE_NAME;
      console.log(`  Dropping table: ${tableName}`);
      await connection.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
    }
    
    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✅ All tables dropped successfully');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  resetDatabase();
}

module.exports = resetDatabase;