const { query } = require('../config/database');

/**
 * Reset Users
 * Removes all existing users to allow fresh seeding
 */
async function resetUsers() {
  try {
    console.log('🗑️  Resetting users table...');
    
    // Show existing users first
    const existingUsers = await query('SELECT id, username, email, full_name, role FROM users');
    
    if (existingUsers.length > 0) {
      console.log('📋 Existing users:');
      existingUsers.forEach(user => {
        console.log(`   - ${user.username} (${user.email}) - ${user.role}`);
      });
      
      // Delete all users
      await query('DELETE FROM users');
      console.log('✅ All users deleted successfully.');
    } else {
      console.log('ℹ️  No users found in database.');
    }
    
  } catch (error) {
    console.error('❌ Error resetting users:', error);
    throw error;
  }
}

// Run reset if called directly
if (require.main === module) {
  resetUsers()
    .then(() => {
      console.log('Reset finished.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Reset failed:', error);
      process.exit(1);
    });
}

module.exports = { resetUsers };