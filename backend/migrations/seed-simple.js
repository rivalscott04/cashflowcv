const { query } = require('../config/database');
const { hashPassword } = require('../utils/password');

/**
 * Simple Database Seeder
 * Creates basic data with clear credentials
 */
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // STEP 1: Create companies
    console.log('📊 Creating companies...');
    
    const company1Result = await query(`
      INSERT INTO companies (name, email, phone, address, website, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['PT Sasambo Solusi Digital', 'info@sasambo.com', '+62-21-1234567', 'Jakarta, Indonesia', 'https://sasambo.com', true]);
    
    const company2Result = await query(`
      INSERT INTO companies (name, email, phone, address, website, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['Bank NBT', 'info@banknbt.com', '+62-21-7654321', 'Surabaya, Indonesia', 'https://banknbt.com', true]);
    
    const company1Id = company1Result.insertId;
    const company2Id = company2Result.insertId;
    
    console.log(`✅ Companies created: ID ${company1Id} and ${company2Id}`);
    
    // STEP 2: Create users with simple passwords
    console.log('👑 Creating users...');
    
    // Superadmin (system-wide access)
    const superadminPassword = await hashPassword('admin123');
    await query(`
      INSERT INTO users (username, email, password_hash, full_name, role, is_active, company_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['superadmin', 'superadmin@system.com', superadminPassword, 'Super Administrator', 'superadmin', true, null]);
    
    // Admin for PT Sasambo
    const adminPassword = await hashPassword('admin123');
    await query(`
      INSERT INTO users (username, email, password_hash, full_name, role, is_active, company_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['admin', 'admin@sasambo.com', adminPassword, 'Administrator Sasambo', 'admin', true, company1Id]);
    
    // Regular user for PT Sasambo
    const userPassword = await hashPassword('user123');
    await query(`
      INSERT INTO users (username, email, password_hash, full_name, role, is_active, company_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['user1', 'user1@sasambo.com', userPassword, 'User Sasambo', 'user', true, company1Id]);
    
    console.log('✅ Users created successfully');
    
    // STEP 3: Create company settings
    console.log('⚙️ Creating company settings...');
    
    const settings = [
      [company1Id, 'company_name', 'PT Sasambo Solusi Digital', 'string', 'Nama perusahaan'],
      [company1Id, 'company_email', 'info@sasambo.com', 'string', 'Email perusahaan'],
      [company1Id, 'company_address', 'Jakarta, Indonesia', 'string', 'Alamat perusahaan'],
      [company1Id, 'currency', 'IDR', 'string', 'Mata uang default'],
      [company1Id, 'timezone', 'Asia/Jakarta', 'string', 'Zona waktu'],
      [company2Id, 'company_name', 'Bank NBT', 'string', 'Nama perusahaan'],
      [company2Id, 'company_email', 'info@banknbt.com', 'string', 'Email perusahaan'],
      [company2Id, 'company_address', 'Surabaya, Indonesia', 'string', 'Alamat perusahaan'],
      [company2Id, 'currency', 'IDR', 'string', 'Mata uang default'],
      [company2Id, 'timezone', 'Asia/Jakarta', 'string', 'Zona waktu']
    ];
    
    for (const setting of settings) {
      await query(`
        INSERT INTO company_settings (company_id, setting_key, setting_value, setting_type, description)
        VALUES (?, ?, ?, ?, ?)
      `, setting);
    }
    
    console.log('✅ Company settings created successfully');
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('🔐 LOGIN CREDENTIALS:');
    console.log('   Superadmin: superadmin / admin123');
    console.log('   Admin: admin / admin123');
    console.log('   User: user1 / user123');
    console.log('');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
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
      console.error('Seeding error:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };