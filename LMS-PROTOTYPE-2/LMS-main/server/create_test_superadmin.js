const bcrypt = require('bcryptjs');
const db = require('./config/database-switch');

// Create a superadmin with known password "12345678"
const createTestSuperadmin = async () => {
  try {
    const password = '12345678';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Creating test superadmin with password:', password);
    console.log('Hashed password:', hashedPassword);
    
    db.run(`
      INSERT OR REPLACE INTO superadmins (email, password_hash, db_name, db_host, db_port, db_user, db_password)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'superadmin@test.com',
      hashedPassword,
      'lms_tenant_demo',
      'localhost',
      5432,
      'postgres',
      'postgres'
    ], function(err) {
      if (err) {
        console.error('Error creating superadmin:', err);
      } else {
        console.log('✅ Test superadmin created successfully');
        console.log('Email: superadmin@test.com');
        console.log('Password: 12345678');
        
        // Verify the creation
        db.get("SELECT * FROM superadmins WHERE email = ?", ['superadmin@test.com'], (err, row) => {
          if (err) {
            console.error('Error verifying:', err);
          } else if (row) {
            console.log('✅ Superadmin verified in database');
            console.log('ID:', row.id);
            console.log('Email:', row.email);
            console.log('Status:', row.status);
          } else {
            console.log('❌ Superadmin not found after creation');
          }
        });
      }
    });
  } catch (error) {
    console.error('Error hashing password:', error);
  }
};

createTestSuperadmin();
