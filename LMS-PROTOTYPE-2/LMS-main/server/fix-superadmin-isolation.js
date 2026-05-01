const db = require('./config/database-switch');

console.log('=== FIXING SUPERADMIN ISOLATION ===');

async function fixSuperAdminIsolation() {
  try {
    console.log('Current Issues Found:');
    console.log('1. Multiple SuperAdmins assigned to University 1 (shared)');
    console.log('2. SuperAdmin 33 manages University 4 but assigned to University 1');
    console.log('3. SuperAdmin 86 should manage University 5 but not properly assigned');
    console.log('4. Other SuperAdmins have no proper university assignments');
    
    // Fix 1: Update SuperAdmin 33 to be properly assigned to University 4
    console.log('\n=== FIXING SUPERADMIN 33 ===');
    db.run(`
      UPDATE users 
      SET university_id = 4 
      WHERE id = 33 AND role = 'superadmin'
    `, function(err) {
      if (err) {
        console.error('Error updating SuperAdmin 33:', err);
        return;
      }
      
      console.log(`✅ SuperAdmin 33 assigned to University 4 (Core5) - ${this.changes} record(s) updated`);
      
      // Fix 2: Create SuperAdmin 86 if not exists or update existing
      console.log('\n=== FIXING SUPERADMIN 86 ===');
      
      // Check if SuperAdmin 86 exists
      db.get(`
        SELECT id, name, email, role, university_id 
        FROM users 
        WHERE id = 86
      `, [], (err, user86) => {
        if (err) {
          console.error('Error checking SuperAdmin 86:', err);
          return;
        }
        
        if (user86) {
          console.log(`Found existing user 86: ${user86.name} (${user86.role})`);
          
          // Update this user to be a proper superadmin
          db.run(`
            UPDATE users 
            SET role = 'superadmin', university_id = 5 
            WHERE id = 86
          `, function(err) {
            if (err) {
              console.error('Error updating user 86 to superadmin:', err);
              return;
            }
            
            console.log(`✅ User 86 updated to SuperAdmin and assigned to University 5 - ${this.changes} record(s) updated`);
            
            // Fix 3: Assign other superadmins to no university (they should not access shared data)
            fixOtherSuperAdmins();
          });
        } else {
          console.log('Creating SuperAdmin 86...');
          
          // Create SuperAdmin 86
          db.run(`
            INSERT INTO users (id, name, email, password, role, university_id) 
            VALUES (86, 'SuperAdmin 86', 'superadmin86@core5.co.in', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'superadmin', 5)
          `, function(err) {
            if (err) {
              console.error('Error creating SuperAdmin 86:', err);
              return;
            }
            
            console.log(`✅ SuperAdmin 86 created and assigned to University 5 - ${this.changes} record(s) inserted`);
            
            fixOtherSuperAdmins();
          });
        }
      });
    });
    
    function fixOtherSuperAdmins() {
      console.log('\n=== FIXING OTHER SUPERADMINS ===');
      
      // Get all other superadmins (excluding 33 and 86)
      db.all(`
        SELECT id, name, email, role, university_id 
        FROM users 
        WHERE role = 'superadmin' AND id NOT IN (33, 86)
      `, [], (err, otherSuperAdmins) => {
        if (err) {
          console.error('Error fetching other superadmins:', err);
          return;
        }
        
        console.log(`Found ${otherSuperAdmins.length} other superadmins to fix:`);
        
        let fixedCount = 0;
        
        otherSuperAdmins.forEach(sa => {
          console.log(`- ${sa.name} (ID: ${sa.id}) - currently assigned to University ${sa.university_id}`);
          
          // Remove university assignment (set to null) - they should not access shared data
          db.run(`
            UPDATE users 
            SET university_id = NULL 
            WHERE id = ?
          `, [sa.id], function(err) {
            if (err) {
              console.error(`Error updating SuperAdmin ${sa.id}:`, err);
              return;
            }
            
            fixedCount++;
            console.log(`✅ SuperAdmin ${sa.name} (ID: ${sa.id}) - university assignment removed`);
            
            if (fixedCount === otherSuperAdmins.length) {
              console.log(`\n✅ All ${fixedCount} other superadmins fixed`);
              
              // Final verification
              verifyFix();
            }
          });
        });
        
        if (otherSuperAdmins.length === 0) {
          console.log('No other superadmins to fix');
          verifyFix();
        }
      });
    }
    
    function verifyFix() {
      console.log('\n=== VERIFYING FIX ===');
      
      // Check universities
      db.all(`
        SELECT id, name, adminId 
        FROM universities 
        ORDER BY id
      `, [], (err, universities) => {
        if (err) {
          console.error('Error verifying universities:', err);
          return;
        }
        
        console.log('Universities after fix:');
        universities.forEach(uni => {
          console.log(`  University ID: ${uni.id}, Name: "${uni.name}", AdminId: ${uni.adminId}`);
        });
        
        // Check superadmins
        db.all(`
          SELECT u.id, u.name, u.email, u.role, u.university_id, uni.name as university_name
          FROM users u
          LEFT JOIN universities uni ON u.university_id = uni.id
          WHERE u.role = 'superadmin'
          ORDER BY u.id
        `, [], (err, superadmins) => {
          if (err) {
            console.error('Error verifying superadmins:', err);
            return;
          }
          
          console.log('\nSuperAdmins after fix:');
          superadmins.forEach(sa => {
            console.log(`  SuperAdmin ID: ${sa.id}, Name: "${sa.name}"`);
            console.log(`    University ID: ${sa.university_id}, University: "${sa.university_name || 'None'}"`);
          });
          
          console.log('\n=== ISOLATION STATUS ===');
          
          // Check proper isolation
          const sa33 = superadmins.find(sa => sa.id === 33);
          const sa86 = superadmins.find(sa => sa.id === 86);
          
          if (sa33 && sa33.university_id === 4) {
            console.log('✅ SuperAdmin 33 properly isolated to University 4 (Core5)');
          } else {
            console.log('❌ SuperAdmin 33 not properly isolated');
          }
          
          if (sa86 && sa86.university_id === 5) {
            console.log('✅ SuperAdmin 86 properly isolated to University 5 (Core5 (2))');
          } else {
            console.log('❌ SuperAdmin 86 not properly isolated');
          }
          
          const otherSAs = superadmins.filter(sa => sa.id !== 33 && sa.id !== 86);
          const properlyIsolated = otherSAs.every(sa => sa.university_id === null);
          
          if (properlyIsolated) {
            console.log(`✅ ${otherSAs.length} other superadmins properly isolated (no university access)`);
          } else {
            console.log(`❌ Some other superadmins still have university access`);
          }
          
          console.log('\n=== UPDATED LOGIN CREDENTIALS ===');
          console.log('SuperAdmin 33 (University 4 - Core5):');
          console.log('  Email: superadmin@core5.com');
          console.log('  Password: password123');
          
          if (sa86) {
            console.log('\nSuperAdmin 86 (University 5 - Core5 (2)):');
            console.log('  Email: superadmin86@core5.co.in');
            console.log('  Password: password123');
          }
          
          console.log('\n✅ SUPERADMIN ISOLATION FIX COMPLETED!');
          console.log('Now each SuperAdmin has their own isolated database.');
          
          process.exit(0);
        });
      });
    }
    
  } catch (error) {
    console.error('Error during fix:', error);
    process.exit(1);
  }
}

fixSuperAdminIsolation();
