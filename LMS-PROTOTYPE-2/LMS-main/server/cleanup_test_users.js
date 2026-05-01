const db = require('./config/database-switch');

console.log('🧹 Cleaning up test users...');

// Remove test users created during testing
const testEmails = [
  'newtestuser@example.com',
  'testuser@example.com',
  'testuser1777439660747@example.com'
];

let removedCount = 0;

testEmails.forEach((email, index) => {
  db.run("DELETE FROM users WHERE email = ?", [email], function(err) {
    if (err) {
      console.error(`❌ Error removing ${email}:`, err);
    } else {
      if (this.changes > 0) {
        console.log(`✅ Removed test user: ${email}`);
        removedCount++;
      } else {
        console.log(`ℹ️  Test user not found: ${email}`);
      }
    }
    
    // Check if this was the last one
    if (index === testEmails.length - 1) {
      console.log(`\n🎉 Cleanup complete! Removed ${removedCount} test users.`);
      
      // Show remaining users
      db.all("SELECT id, name, email, role FROM users ORDER BY id", [], (err, rows) => {
        if (err) {
          console.error('Error fetching remaining users:', err);
        } else {
          console.log('\n📊 Remaining users in database:');
          if (rows.length === 0) {
            console.log('   (No users remaining)');
          } else {
            rows.forEach(row => {
              console.log(`   - ID: ${row.id}, Name: ${row.name}, Email: ${row.email}, Role: ${row.role}`);
            });
          }
        }
      });
    }
  });
});
