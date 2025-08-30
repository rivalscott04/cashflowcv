const { query } = require('../config/database');
const { hashPassword } = require('../utils/password');

/**
 * Database Seeder
 * Creates default admin and user accounts
 */
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Check if users already exist
    const existingUsers = await query('SELECT COUNT(*) as count FROM users');
    
    if (existingUsers[0].count > 0) {
      console.log('⚠️  Users already exist in database. Skipping seeding.');
      return;
    }
    
    // Create admin user
    const adminPassword = await hashPassword('admin123');
    await query(`
      INSERT INTO users (username, email, password_hash, full_name, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['admin', 'admin@sasambo.com', adminPassword, 'Administrator', 'admin', true]);
    
    console.log('✅ Admin user created:');
    console.log('   Username: admin');
    console.log('   Email: admin@sasambo.com');
    console.log('   Password: admin123');
    console.log('   Role: admin');
    
    // Create regular user
    const userPassword = await hashPassword('user123');
    await query(`
      INSERT INTO users (username, email, password_hash, full_name, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['user', 'user@sasambo.com', userPassword, 'Regular User', 'user', true]);
    
    console.log('✅ Regular user created:');
    console.log('   Username: user');
    console.log('   Email: user@sasambo.com');
    console.log('   Password: user123');
    console.log('   Role: user');
    
    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding finished.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };