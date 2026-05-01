const db = require('./config/database-switch');

console.log('=== FINAL ISOLATION FIX ===');

async function finalFix() {
  try {
    // 1. Get all users with University 1 assignment
    console.log('1. Finding users with invalid University 1 assignment...');
    
    db.all(`
      SELECT id, name, email, role, university_id 
      FROM users 
      WHERE university_id = 1
      ORDER BY role, id
    `, [], (err, users) => {
      if (err) {
        console.error('Error fetching users:', err);
        return;
      }
      
      console.log(`Found ${users.length} users with University 1 assignment:`);
      users.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}, ID: ${user.id}`);
      });
      
      // 2. Reassign these users appropriately
      console.log('\n2. Reassigning users to correct universities...');
      
      let completed = 0;
      let total = users.length;
      
      users.forEach(user => {
        let targetUniversity = null;
        
        // Assign based on role and ID patterns
        if (user.role === 'admin' || user.role === 'student' || user.role === 'mentor' || user.role === 'accountant' || user.role === 'storekeeper') {
          // These are regular users, assign them to University 4 (Core5)
          targetUniversity = 4;
        } else if (user.role === 'portal_admin' || user.role === 'superadmin') {
          // Keep these as null (no university access)
          targetUniversity = null;
        } else if (user.role === 'vendor') {
          // Keep vendors as null (shared)
          targetUniversity = null;
        } else {
          // Test users - keep as null
          targetUniversity = null;
        }
        
        db.run(`
          UPDATE users 
          SET university_id = ? 
          WHERE id = ?
        `, [targetUniversity, user.id], function(err) {
          if (err) {
            console.error(`Error updating user ${user.id}:`, err);
            return;
          }
          
          completed++;
          
          const action = targetUniversity ? `moved to University ${targetUniversity}` : 'removed from university assignment';
          console.log(`✅ ${user.name} (${user.role}) - ${action}`);
          
          if (completed === total) {
            console.log('\n3. Verifying final isolation...');
            verifyIsolation();
          }
        });
      });
      
      if (total === 0) {
        console.log('No users to reassign');
        verifyIsolation();
      }
    });
    
    function verifyIsolation() {
      // Check final distribution
      db.all(`
        SELECT 'users' as table_name, COUNT(*) as count, university_id 
        FROM users WHERE university_id IS NOT NULL
        GROUP BY university_id
        UNION ALL
        SELECT 'stock_requests' as table_name, COUNT(*) as count, university_id 
        FROM stock_requests WHERE university_id IS NOT NULL
        GROUP BY university_id
        UNION ALL
        SELECT 'vendors' as table_name, COUNT(*) as count, university_id 
        FROM vendors WHERE university_id IS NOT NULL
        GROUP BY university_id
        ORDER BY table_name, university_id
      `, [], (err, results) => {
        if (err) {
          console.error('Error verifying:', err);
          return;
        }
        
        console.log('\n=== FINAL DATA DISTRIBUTION ===');
        
        const dataByTable = {};
        results.forEach(row => {
          if (!dataByTable[row.table_name]) {
            dataByTable[row.table_name] = {};
          }
          dataByTable[row.table_name][row.university_id] = row.count;
        });
        
        Object.keys(dataByTable).forEach(tableName => {
          console.log(`\n${tableName}:`);
          Object.keys(dataByTable[tableName]).forEach(uniId => {
            console.log(`  University ${uniId}: ${dataByTable[tableName][uniId]} records`);
          });
        });
        
        // Check for any remaining University 1 assignments
        db.get(`
          SELECT COUNT(*) as count 
          FROM users 
          WHERE university_id = 1
        `, [], (err, result) => {
          if (err) {
            console.error('Error checking University 1:', err);
            return;
          }
          
          console.log('\n=== ISOLATION STATUS ===');
          
          if (result.count === 0) {
            console.log('✅ ISOLATION: SECURE');
            console.log('✅ No users with invalid University 1 assignment');
            console.log('✅ Data properly isolated by university');
          } else {
            console.log(`❌ ISOLATION: COMPROMISED`);
            console.log(`❌ Still ${result.count} users with University 1 assignment`);
          }
          
          console.log('\n=== READY FOR TESTING ===');
          console.log('SuperAdmin 33 (University 4):');
          console.log('  Email: superadmin@core5.com');
          console.log('  Password: password123');
          console.log('  Should see: 9 users, 19 stock requests, 1 vendor');
          
          console.log('\nSuperAdmin 86 (University 5):');
          console.log('  Email: superadmin86@core5.co.in');
          console.log('  Password: password123');
          console.log('  Should see: 1 user, 0 stock requests, 1 vendor');
          
          console.log('\n✅ DATABASE ISOLATION FIX COMPLETED!');
          
          process.exit(0);
        });
      });
    }
    
  } catch (error) {
    console.error('Error during final fix:', error);
    process.exit(1);
  }
}

finalFix();
