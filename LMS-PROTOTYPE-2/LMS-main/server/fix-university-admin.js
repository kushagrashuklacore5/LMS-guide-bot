// Fix university admin assignment
const db = require('./config/sqlite-db');

function fixUniversityAdmin() {
  console.log('🔧 Fixing University Admin Assignment\n');
  
  // Update university to set superadmin 33 as admin
  db.run(
    'UPDATE universities SET adminId = ? WHERE id = ?',
    [33, 4], // Set superadmin 33 as admin of university 4
    function(err) {
      if (err) {
        console.error('❌ Error updating university admin:', err);
        return;
      }
      
      console.log('✅ University 4 (Core5) admin updated to superadmin 33');
      
      // Verify the update
      db.get('SELECT id, name, adminId FROM universities WHERE id = 4', [], (err2, row) => {
        if (err2) {
          console.error('❌ Error verifying update:', err2);
          return;
        }
        
        console.log('\n📋 Verification:');
        console.log(`University ID: ${row.id}`);
        console.log(`University Name: ${row.name}`);
        console.log(`Admin ID: ${row.adminId}`);
        
        console.log('\n🎯 Now superadmin 33 can propagate plans to university 4!');
      });
    }
  );
}

fixUniversityAdmin();
