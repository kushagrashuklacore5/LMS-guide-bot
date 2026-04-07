const db = require('./config/sqlite-db');

console.log('🔧 Removing portal@core5.co.in from superadmin role...');

// Update portal user to have a different role (like 'portal_admin')
db.run('UPDATE users SET role = ? WHERE email = ?', ['portal_admin', 'portal@core5.co.in'], function(err) {
  if (err) {
    console.error('❌ Error updating portal user:', err);
  } else {
    console.log('✅ portal@core5.co.in role changed to portal_admin');
    console.log('🎯 This user can now access the portal but wont appear in superadmin list');
  }
  
  // Check remaining superadmins
  db.all('SELECT id, email, role FROM users WHERE role = ?', ['superadmin'], (err, rows) => {
    if (err) {
      console.error('❌ Error checking superadmins:', err);
      return;
    }
    
    console.log(`\n📊 Remaining superadmins: ${rows.length}`);
    rows.forEach(row => {
      console.log(`   👤 ${row.email} (ID: ${row.id})`);
    });
    
    if (rows.length === 0) {
      console.log('\n💡 No superadmins found. You can create them using the "Create Superadmin" tab.');
    }
    
    process.exit(0);
  });
});
