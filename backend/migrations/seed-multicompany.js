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
    
    let company1Id, company2Id;
    
    if (existingCompanies[0].count > 0) {
      console.log('⚠️  Companies already exist in database. Getting existing company IDs...');
      const companies = await query('SELECT id, name FROM companies ORDER BY id LIMIT 2');
      company1Id = companies[0]?.id;
      company2Id = companies[1]?.id;
      console.log(`   Found companies: ${companies.map(c => c.name).join(', ')}`);
    } else {
      // Create default companies
      console.log('📊 Creating companies...');
      
      company1Id = await createCompany({
        name: 'PT Sasambo Solusi Digital',
        email: 'info@sasambo.com',
        phone: '+62-21-1234567',
        address: 'Jakarta, Indonesia',
        website: 'https://sasambo.com'
      });
      
      company2Id = await createCompany({
        name: 'Bank NBT',
        email: 'info@banknbt.com',
        phone: '+62-21-7654321',
        address: 'Surabaya, Indonesia',
        website: 'https://banknbt.com'
      });
      
      console.log('✅ Companies created successfully');
    }
    
    // STEP 2: Create company settings for each company
    console.log('⚙️ Creating company settings...');
    
    if (company1Id) {
      await createCompanySettings(company1Id, {
        company_name: 'PT Sasambo Solusi Digital',
        company_email: 'info@sasambo.com',
        company_address: 'Jakarta, Indonesia',
        currency: 'IDR',
        timezone: 'Asia/Jakarta'
      });
    }
    
    if (company2Id) {
      await createCompanySettings(company2Id, {
        company_name: 'Bank NBT',
        company_email: 'info@banknbt.co.id',
        company_address: 'Jakarta Pusat, Indonesia',
        currency: 'IDR',
        timezone: 'Asia/Jakarta'
      });
    }
    
    console.log('✅ Company settings created successfully');
    
    // STEP 3: Create users (superadmin, admins, and sample users)
    console.log('👑 Creating superadmin...');
    const existingSuperadmin = await query('SELECT id FROM users WHERE username = ? OR email = ?', ['superadmin', 'superadmin@system.com']);
    
    if (existingSuperadmin.length === 0) {
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
    } else {
      console.log('⚠️  Superadmin already exists, skipping creation.');
    }
    
    // Create company admins
    console.log('👨‍💼 Creating company admins...');
    
    // Admin for PT Sasambo Solusi Digital
    if (company1Id) {
      const existingAdmin1 = await query('SELECT id FROM users WHERE username = ? OR email = ?', ['admin_sasambo', 'admin@sasambo.com']);
      if (existingAdmin1.length === 0) {
        const admin1Password = await hashPassword('admin123');
        await query(`
          INSERT INTO users (username, email, password_hash, full_name, role, is_active, company_id)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, ['admin_sasambo', 'admin@sasambo.com', admin1Password, 'Sasambo Administrator', 'admin', true, company1Id]);
        console.log('   ✅ Sasambo Admin created - Username: admin_sasambo, Password: admin123');
      } else {
        console.log('   ⚠️  Sasambo Admin already exists, skipping creation.');
      }
    }
    
    // Admin for Bank NBT
    if (company2Id) {
      const existingAdmin2 = await query('SELECT id FROM users WHERE username = ? OR email = ?', ['admin_banknbt', 'admin@banknbt.co.id']);
      if (existingAdmin2.length === 0) {
        const admin2Password = await hashPassword('admin123');
        await query(`
          INSERT INTO users (username, email, password_hash, full_name, role, is_active, company_id)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, ['admin_banknbt', 'admin@banknbt.co.id', admin2Password, 'Bank NBT Administrator', 'admin', true, company2Id]);
        console.log('   ✅ Bank NBT Admin created - Username: admin_banknbt, Password: admin123');
      } else {
        console.log('   ⚠️  Bank NBT Admin already exists, skipping creation.');
      }
    }
    
    console.log('✅ Company admins processing completed.');
    
    // Create sample users for each company
    console.log('👥 Creating sample users...');
    
    // Users for PT Sasambo Solusi Digital
    if (company1Id) {
      await createUser({
        username: 'user_sasambo1',
        email: 'user1@sasambo.com',
        password: 'user123',
        full_name: 'Budi Santoso',
        company_id: company1Id
      });
      
      await createUser({
        username: 'user_sasambo2',
        email: 'user2@sasambo.com',
        password: 'user123',
        full_name: 'Sari Dewi',
        company_id: company1Id
      });
    }
    
    // Users for Bank NBT
    if (company2Id) {
      await createUser({
        username: 'user_banknbt1',
        email: 'user1@banknbt.co.id',
        password: 'user123',
        full_name: 'Ahmad Rahman',
        company_id: company2Id
      });
      
      await createUser({
        username: 'user_banknbt2',
        email: 'user2@banknbt.co.id',
        password: 'user123',
        full_name: 'Maya Sari',
        company_id: company2Id
      });
    }
    
    console.log('✅ Sample users processing completed.')
    
    console.log('🎉 Multi-company database seeding completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   - 2 Companies created');
    console.log('   - 1 Superadmin created (system-wide access)');
    console.log('   - 2 Company admins created (one per company)');
    console.log('   - 4 Regular users created (distributed across companies)');
    console.log('   - Company settings configured for all companies');
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('   Superadmin: superadmin / superadmin123');
    console.log('   Sasambo Admin: admin_sasambo / admin123');
    console.log('   Bank NBT Admin: admin_banknbt / admin123');
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
  // Check if user already exists
  const existingUser = await query('SELECT id FROM users WHERE username = ? OR email = ?', [userData.username, userData.email]);
  
  if (existingUser.length === 0) {
    const passwordHash = await hashPassword(userData.password);
    await query(`
      INSERT INTO users (username, email, password_hash, full_name, role, is_active, company_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [userData.username, userData.email, passwordHash, userData.full_name, 'user', true, userData.company_id]);
    
    console.log(`   ✓ User created: ${userData.username} (${userData.full_name})`);
  } else {
    console.log(`   ⚠️  User '${userData.username}' already exists, skipping creation.`);
  }
}

/**
 * Helper function to create company settings
 */
async function createCompanySettings(companyId, settings) {
  // Insert each setting as a separate row
  const settingsToInsert = [
    { key: 'company_name', value: settings.company_name, type: 'string' },
    { key: 'company_email', value: settings.company_email, type: 'string' },
    { key: 'company_address', value: settings.company_address, type: 'string' },
    { key: 'currency', value: settings.currency, type: 'string' },
    { key: 'timezone', value: settings.timezone, type: 'string' }
  ];

  for (const setting of settingsToInsert) {
    // Check if setting already exists
    const existing = await query(`
      SELECT id FROM company_settings 
      WHERE company_id = ? AND setting_key = ?
    `, [companyId, setting.key]);
    
    if (existing.length === 0) {
      await query(`
        INSERT INTO company_settings (company_id, setting_key, setting_value, setting_type)
        VALUES (?, ?, ?, ?)
      `, [companyId, setting.key, setting.value, setting.type]);
    } else {
      console.log(`   ⚠️  Setting '${setting.key}' already exists for company ${companyId}`);
    }
  }
  
  console.log(`   ✓ Settings processed for company ID: ${companyId}`);
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