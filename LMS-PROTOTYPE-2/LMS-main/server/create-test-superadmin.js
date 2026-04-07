const bcrypt = require('bcryptjs');
const db = require('./config/sqlite-db');

console.log('👤 Creating a test superadmin for demonstration...');

const testSuperadmin = {
  email: 'demo@superadmin.com',
  password: 'Demo123!@#',
  expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
};

async function createTestSuperadmin() {
  try {
    // Check if already exists
    db.get('SELECT id FROM users WHERE email = ?', [testSuperadmin.email], async (err, existing) => {
      if (err) {
        console.error('❌ Error checking existing user:', err);
        return;
      }

      if (existing) {
        console.log('⚠️ Test superadmin already exists');
        console.log('📧 Email:', testSuperadmin.email);
        console.log('🔑 Password:', testSuperadmin.password);
        console.log('📅 Expires:', new Date(testSuperadmin.expires_at).toLocaleDateString());
        process.exit(0);
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(testSuperadmin.password, 10);
      
      // Insert superadmin
      db.run(
        `INSERT INTO users (name, email, password, role, created_at, expires_at, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          'Demo Superadmin',
          testSuperadmin.email,
          hashedPassword,
          'superadmin',
          new Date().toISOString(),
          testSuperadmin.expires_at,
          'active'
        ],
        function(err) {
          if (err) {
            console.error('❌ Error creating superadmin:', err);
            return;
          }

          console.log('✅ Test superadmin created successfully!');
          console.log('📧 Email:', testSuperadmin.email);
          console.log('🔑 Password:', testSuperadmin.password);
          console.log('📅 Expires:', new Date(testSuperadmin.expires_at).toLocaleDateString());
          console.log('🎯 This superadmin will appear in the portal management list');
          process.exit(0);
        }
      );
    });
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestSuperadmin();
