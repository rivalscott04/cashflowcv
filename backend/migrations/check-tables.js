const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sasambo_finance'
};

async function checkTables() {
  let connection;
  
  try {
    connection = await mysql.createConnection(config);
    
    console.log('📋 Checking table structures...');
    
    // Check company_settings table
    try {
      const [rows] = await connection.execute('DESCRIBE company_settings');
      console.log('\n🏢 company_settings structure:');
      rows.forEach(row => {
        console.log(`  ${row.Field} - ${row.Type} ${row.Null === 'YES' ? '(nullable)' : '(not null)'}`);
      });
    } catch (error) {
      console.log('❌ company_settings table does not exist');
    }
    
    // Check companies table
    try {
      const [rows] = await connection.execute('DESCRIBE companies');
      console.log('\n🏢 companies structure:');
      rows.forEach(row => {
        console.log(`  ${row.Field} - ${row.Type} ${row.Null === 'YES' ? '(nullable)' : '(not null)'}`);
      });
    } catch (error) {
      console.log('❌ companies table does not exist');
    }
    
    // List all tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📊 All tables in database:');
    tables.forEach(table => {
      const tableName = table[`Tables_in_${config.database}`];
      console.log(`  - ${tableName}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkTables();