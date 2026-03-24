const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'data', 'lms-database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking accountant user and password...');

db.get('SELECT id, email, role, password FROM users WHERE role = "accountant"', [], async (err, user) => {
  if (err) {
    console.error('❌ Error:', err);
    return;
  }

  if (!user) {
    console.log('❌ No accountant user found');
    return;
  }

  console.log('\n📋 Accountant User Found:');
  console.log('=======================');
  console.log('ID:', user.id);
  console.log('Email:', user.email);
  console.log('Role:', user.role);
  console.log('Password Hash:', user.password ? 'SET' : 'NOT SET');

  if (!user.password) {
    console.log('\n🔧 Setting password for accountant user...');
    
    const newPassword = 'accountant123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id], (err) => {
      if (err) {
        console.error('❌ Error setting password:', err);
      } else {
        console.log('✅ Password set successfully!');
        console.log('📋 Login Credentials:');
        console.log('   Email:', user.email);
        console.log('   Password:', newPassword);
        console.log('\n🚀 You can now login with these credentials!');
      }
      
      db.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err);
        } else {
          console.log('\n✅ Database connection closed');
        }
      });
    });
  } else {
    console.log('\n✅ Accountant already has a password set');
    console.log('📋 Login Credentials:');
    console.log('   Email:', user.email);
    console.log('   Password: (already set - if you forgot, use the reset script)');
    
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err);
      } else {
        console.log('\n✅ Database connection closed');
      }
    });
  }
});
