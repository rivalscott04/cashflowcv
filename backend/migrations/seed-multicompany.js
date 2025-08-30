const { query } = require('../config/database');
const { hashPassword } = require('../utils/password');

/**
 * Multi-Company Database Seeder
 * Creates default companies, superadmin, and company-specific admin users
 */
async function seedMultiCompanyDatabase() {
  try {
    console.log('🌱 Starting multi-company database seeding...');
    
    // Check if companies already exist
    const existingCompanies = await query('SELECT COUNT(*) as count FROM companies');
    
    if (existingCompanies[0].count > 0) {
      console.log('⚠️  Companies already exist in database. Skipping seeding.');
      return;
    }
    
    // Create default companies
    console.log('📊 Creating companies...');
    
    const company1Id = await createCompany({
      name: 'Sasambo Solusi Digital',
      email: 'info@sasambo.com',
      phone: '+62-21-1234567',
      address: 'Jakarta, Indonesia',
      website: 'https://sasambo.com'
    });
    
    const company2Id = await createCompany({
      name: 'Tech Innovate Corp',
      email: 'contact@techinnovate.com',
      phone: '+62-21-7654321',
      address: 'Bandung, Indonesia',
      website: 'https://techinnovate.com'
    });
    
    const company3Id = await createCompany({
      name: 'Digital Solutions Ltd',
      email: 'hello@digitalsolutions.com',
      phone: '+62-21-9876543',
      address: 'Surabaya, Indonesia',
      website: 'https://digitalsolutions.com'
    });
    
    console.log('✅ Companies created successfully');
    
    // Create superadmin (no company association)
    console.log('👑 Creating superadmin...');
    const superadminPassword = await hashPassword('superadmin123');
    await query(`
      INSERT INTO users (username, email, password_hash, full_name, role, is_active, company_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['superadmin', 'superadmin@system.com', superadminPassword, 'Super Administrator', 'superadmin', true, null]);
    
    console.log('✅ Superadmin created:');
    console.log('   Username: superadmin');
    console.log('   Email: superadmin@system.com');
    console.log('   Password: superadmin123');
    console.log('   Role: superadmin');
    console.log('   Company: None (System-wide access)');
    
    // Create company admins
    console.log('👨‍💼 Creating company admins...');
    
    // Admin for Sasambo Solusi Digital
    const admin1Password = await hashPassword('admin123');
    await query(`
      INSERT INTO users (username, email, password_hash, full_name, role, is_active, company_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['admin_sasambo', 'admin@sasambo.com', admin1Password, 'Sasambo Administrator', 'admin', true, company1Id]);
    
    // Admin for Tech Innovate Corp
    const admin2Password = await hashPassword('admin123');
    await query(`
      INSERT INTO users (username, email, password_hash, full_name, role, is_active, company_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['admin_techinnovate', 'admin@techinnovate.com', admin2Password, 'Tech Innovate Administrator', 'admin', true, company2Id]);
    
    // Admin for Digital Solutions Ltd
    const admin3Password = await hashPassword('admin123');
    await query(`
      INSERT INTO users (username, email, password_hash, full_name, role, is_active, company_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['admin_digital', 'admin@digitalsolutions.com', admin3Password, 'Digital Solutions Administrator', 'admin', true, company3Id]);
    
    console.log('✅ Company admins created:');
    console.log('   Sasambo Admin - Username: admin_sasambo, Password: admin123');
    console.log('   Tech Innovate Admin - Username: admin_techinnovate, Password: admin123');
    console.log('   Digital Solutions Admin - Username: admin_digital, Password: admin123');
    
    // Create sample users for each company
    console.log('👥 Creating sample users...');
    
    // Users for Sasambo Solusi Digital
    await createUser({
      username: 'user_sasambo1',
      email: 'user1@sasambo.com',
      password: 'user123',
      full_name: 'John Doe',
      company_id: company1Id
    });
    
    await createUser({
      username: 'user_sasambo2',
      email: 'user2@sasambo.com',
      password: 'user123',
      full_name: 'Jane Smith',
      company_id: company1Id
    });
    
    // Users for Tech Innovate Corp
    await createUser({
      username: 'user_tech1',
      email: 'user1@techinnovate.com',
      password: 'user123',
      full_name: 'Mike Johnson',
      company_id: company2Id
    });
    
    // Users for Digital Solutions Ltd
    await createUser({
      username: 'user_digital1',
      email: 'user1@digitalsolutions.com',
      password: 'user123',
      full_name: 'Sarah Wilson',
      company_id: company3Id
    });
    
    console.log('✅ Sample users created successfully');
    
    // Update company settings for each company
    console.log('⚙️ Creating company settings...');
    
    await createCompanySettings(company1Id, {
      company_name: 'Sasambo Solusi Digital',
      company_email: 'info@sasambo.com',
      company_address: 'Jakarta, Indonesia',
      currency: 'IDR',
      timezone: 'Asia/Jakarta'
    });
    
    await createCompanySettings(company2Id, {
      company_name: 'Tech Innovate Corp',
      company_email: 'contact@techinnovate.com',
      company_address: 'Bandung, Indonesia',
      currency: 'IDR',
      timezone: 'Asia/Jakarta'
    });
    
    await createCompanySettings(company3Id, {
      company_name: 'Digital Solutions Ltd',
      company_email: 'hello@digitalsolutions.com',
      company_address: 'Surabaya, Indonesia',
      currency: 'IDR',
      timezone: 'Asia/Jakarta'
    });
    
    console.log('✅ Company settings created successfully');
    
    console.log('🎉 Multi-company database seeding completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   - 3 Companies created');
    console.log('   - 1 Superadmin created (system-wide access)');
    console.log('   - 3 Company admins created (one per company)');
    console.log('   - 4 Regular users created (distributed across companies)');
    console.log('   - Company settings configured for all companies');
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('   Superadmin: superadmin / superadmin123');
    console.log('   Sasambo Admin: admin_sasambo / admin123');
    console.log('   Tech Innovate Admin: admin_techinnovate / admin123');
    console.log('   Digital Solutions Admin: admin_digital / admin123');
    console.log('   All Users: [username] / user123');
    
  } catch (error) {
    console.error('❌ Error seeding multi-company database:', error);
    throw error;
  }
}

/**
 * Helper function to create a company
 */
async function createCompany(companyData) {
  const result = await query(`
    INSERT INTO companies (name, email, phone, address, website, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [companyData.name, companyData.email, companyData.phone, companyData.address, companyData.website, true]);
  
  console.log(`   ✓ Company created: ${companyData.name}`);
  return result.insertId;
}

/**
 * Helper function to create a user
 */
async function createUser(userData) {
  const passwordHash = await hashPassword(userData.password);
  await query(`
    INSERT INTO users (username, email, password_hash, full_name, role, is_active, company_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [userData.username, userData.email, passwordHash, userData.full_name, 'user', true, userData.company_id]);
  
  console.log(`   ✓ User created: ${userData.username} (${userData.full_name})`);
}

/**
 * Helper function to create company settings
 */
async function createCompanySettings(companyId, settings) {
  await query(`
    INSERT INTO company_settings (company_id, company_name, company_email, company_address, currency, timezone)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [companyId, settings.company_name, settings.company_email, settings.company_address, settings.currency, settings.timezone]);
  
  console.log(`   ✓ Settings created for company ID: ${companyId}`);
}

// Run seeder if called directly
if (require.main === module) {
  seedMultiCompanyDatabase()
    .then(() => {
      console.log('Multi-company seeding finished.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Multi-company seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedMultiCompanyDatabase };