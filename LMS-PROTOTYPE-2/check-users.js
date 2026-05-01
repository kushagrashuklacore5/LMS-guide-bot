const db = require('./server/config/database-switch');

console.log('🔍 Checking existing users...\n');

db.all('SELECT id, name, email, role, isApproved FROM users ORDER BY id', (err, rows) => {
  if (err) {
    console.error('❌ Database error:', err);
    return;
  }

  if (rows.length === 0) {
    console.log('❌ No users found in database');
    console.log('🔧 Creating superadmin user...');
    
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('12345678', 10);
    
    db.run(
      'INSERT INTO users (name, email, password, role, isApproved) VALUES (?, ?, ?, ?, ?)',
      ['Super Admin', 'superadmin@core5.co.in', hashedPassword, 'superadmin', 1],
      function(err) {
        if (err) {
          console.error('❌ Error creating superadmin:', err);
        } else {
          console.log('✅ Superadmin user created successfully!');
          console.log('   Email: superadmin@core5.co.in');
          console.log('   Password: 12345678');
          console.log('   ID:', this.lastID);
        }
        
        // Check users again
        console.log('\n📋 Updated user list:');
        db.all('SELECT id, name, email, role, isApproved FROM users ORDER BY id', (err2, rows2) => {
          if (!err2 && rows2.length > 0) {
            rows2.forEach(user => {
              console.log(`   ${user.id}. ${user.name} (${user.email}) - ${user.role} - Approved: ${user.isApproved ? 'Yes' : 'No'}`);
            });
          }
        });
      }
    );
  } else {
    console.log(`✅ Found ${rows.length} users:`);
    rows.forEach(user => {
      console.log(`   ${user.id}. ${user.name} (${user.email}) - ${user.role} - Approved: ${user.isApproved ? 'Yes' : 'No'}`);
    });
    
    // Check if superadmin exists
    const superadmin = rows.find(u => u.email === 'superadmin@core5.co.in');
    if (!superadmin) {
      console.log('\n❌ Superadmin user not found. Creating one...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync('12345678', 10);
      
      db.run(
        'INSERT INTO users (name, email, password, role, isApproved) VALUES (?, ?, ?, ?, ?)',
        ['Super Admin', 'superadmin@core5.co.in', hashedPassword, 'superadmin', 1],
        function(err) {
          if (err) {
            console.error('❌ Error creating superadmin:', err);
          } else {
            console.log('✅ Superadmin user created successfully!');
            console.log('   Email: superadmin@core5.co.in');
            console.log('   Password: 12345678');
          }
        }
      );
    }
  }
});
