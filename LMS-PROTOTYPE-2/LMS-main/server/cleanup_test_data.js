const db = require('./config/database-switch');

console.log('🧹 Cleaning up all test data...');

// Remove test universities with test names
db.run("DELETE FROM universities WHERE name LIKE 'Test University%'", function(err) {
  if (err) {
    console.error('❌ Error removing test universities:', err);
  } else {
    console.log(`✅ Removed ${this.changes} test universities`);
  }
  
  // Remove any orphaned users (users without valid universities)
  db.run(`
    DELETE FROM users 
    WHERE university_id NOT IN (SELECT id FROM universities) 
    AND university_id > 1
  `, function(err) {
    if (err) {
      console.error('❌ Error removing orphaned users:', err);
    } else {
      console.log(`✅ Removed ${this.changes} orphaned users`);
    }
    
    console.log('\n🎉 Test data cleanup complete!');
    
    // Show remaining data
    db.all("SELECT id, name FROM universities ORDER BY id", [], (err, universities) => {
      if (err) {
        console.error('Error fetching universities:', err);
      } else {
        console.log('\n📊 Remaining universities:');
        if (universities.length === 0) {
          console.log('   (No universities remaining)');
        } else {
          universities.forEach(uni => {
            console.log(`   - ID: ${uni.id}, Name: ${uni.name}`);
          });
        }
      }
    });
    
    db.all("SELECT id, name, email, role FROM users ORDER BY id", [], (err, users) => {
      if (err) {
        console.error('Error fetching users:', err);
      } else {
        console.log('\n📊 Remaining users:');
        if (users.length === 0) {
          console.log('   (No users remaining)');
        } else {
          users.forEach(user => {
            console.log(`   - ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
          });
        }
      }
    });
  });
});
