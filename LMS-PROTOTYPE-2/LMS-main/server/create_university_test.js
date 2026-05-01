const db = require('./config/database-switch');
const bcrypt = require('bcryptjs');

console.log('🧪 Testing University Creation');
console.log('==============================');

// Test creating a university with admin
const universityData = {
  universityName: 'Test University API',
  area: 'Test Area',
  adminName: 'Test Admin',
  adminEmail: 'testadmin@example.com'
};

console.log('🏛️ Creating university with admin...');

async function createUniversityWithAdmin() {
  try {
    // Check if admin already exists
    console.log('🔍 Checking if admin already exists...');
    
    const existingAdmin = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE email = ?", [universityData.adminEmail.toLowerCase()], (err, user) => {
        if (err) reject(err);
        else resolve(user);
      });
    });

    if (existingAdmin) {
      console.log('❌ Admin already exists:', existingAdmin.email);
      return;
    }

    // Auto-generate password
    console.log('🔑 Generating password...');
    const rawPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    
    console.log('🔐 Password generated and hashed');

    // Create university first to get the ID
    console.log('🏛️ Creating university...');
    const universityId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO universities (name, area, createdAt, updatedAt)
        VALUES (?, ?, datetime('now'), datetime('now'))
      `, [universityData.universityName, universityData.area], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    console.log(`✅ University created with ID: ${universityId}`);

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO users (name, email, password, role, is_approved, university_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, [universityData.adminName, universityData.adminEmail.toLowerCase(), hashedPassword, "admin", 1, universityId], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    console.log(`✅ Admin user created with ID: ${adminId}`);

    // Update university adminId
    console.log('🔗 Linking admin to university...');
    await new Promise((resolve, reject) => {
      db.run(`UPDATE universities SET adminId = ? WHERE id = ?`, [adminId, universityId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('🎉 University and Admin created successfully!');
    console.log('📊 Results:');
    console.log(`   University ID: ${universityId}`);
    console.log(`   University Name: ${universityData.universityName}`);
    console.log(`   Admin ID: ${adminId}`);
    console.log(`   Admin Email: ${universityData.adminEmail}`);
    console.log(`   Admin Password: ${rawPassword}`);
    
    return {
      university: {
        id: universityId,
        name: universityData.universityName,
        area: universityData.area
      },
      admin: {
        id: adminId,
        name: universityData.adminName,
        email: universityData.adminEmail,
        generatedPassword: rawPassword
      }
    };

  } catch (error) {
    console.error('❌ Error creating university:', error.message);
    throw error;
  }
}

createUniversityWithAdmin()
  .then(result => {
    console.log('\n✅ Test completed successfully!');
    console.log('🔗 University and admin are permanently saved in the database!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });
