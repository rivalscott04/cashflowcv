const fs = require('fs');
const path = require('path');

// Get migration name from command line arguments
const migrationName = process.argv[2];

if (!migrationName) {
  console.error('❌ Please provide a migration name');
  console.log('Usage: node create-migration.js <migration_name>');
  console.log('Example: node create-migration.js add_user_avatar_column');
  process.exit(1);
}

// Generate timestamp
const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

// Generate filename
const filename = `${timestamp}_${migrationName}.sql`;
const filepath = path.join(__dirname, filename);

// Migration template
const template = `-- Migration: ${migrationName}
-- Created: ${new Date().toISOString()}

-- Add your SQL statements here
-- Example:
-- ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
-- CREATE INDEX idx_users_avatar ON users(avatar_url);

-- Remember to use IF NOT EXISTS for CREATE statements
-- and IF EXISTS for DROP statements to make migrations idempotent
`;

// Create migration file
try {
  fs.writeFileSync(filepath, template);
  console.log(`✅ Migration created: ${filename}`);
  console.log(`📁 Path: ${filepath}`);
  console.log('\n📝 Edit the file to add your SQL statements');
  console.log('🚀 Run migration with: npm run migrate');
} catch (error) {
  console.error('❌ Failed to create migration:', error.message);
  process.exit(1);
}