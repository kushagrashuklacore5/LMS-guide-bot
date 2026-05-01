const db = require('./config/database-switch');
const bcrypt = require('bcryptjs');

console.log('=== CREATING TEST USERS FOR SUPERADMINS ===');

async function createTestUsers() {
  try {
    console.log('1. Creating test users for each SuperAdmin...');
    
    // Get SuperAdmins
    db.all(`
      SELECT id, name, email, university_id 
      FROM users 
      WHERE role = 'superadmin' AND university_id IS NOT NULL
      ORDER BY id
    `, [], async (err, superAdmins) => {
      if (err) {
        console.error('Error fetching SuperAdmins:', err);
        return;
      }
      
      if (superAdmins.length === 0) {
        console.log('❌ No regular SuperAdmins found');
        return;
      }
      
      console.log(`Found ${superAdmins.length} regular SuperAdmins`);
      
      let createdCount = 0;
      let totalCreations = 0;
      
      for (const sa of superAdmins) {
        console.log(`\n--- Creating test users for ${sa.name} (ID: ${sa.id}) ---`);
        
        // Create 2 test users for each SuperAdmin
        const testUsers = [
          {
            name: `${sa.name}'s Admin`,
            email: `admin-${sa.id}@test.com`,
            role: 'admin',
            university_id: sa.university_id
          },
          {
            name: `${sa.name}'s Student`,
            email: `student-${sa.id}@test.com`,
            role: 'student',
            university_id: sa.university_id
          }
        ];
        
        totalCreations += testUsers.length;
        
        for (const testUser of testUsers) {
          try {
            // Check if user already exists
            const existingUser = await new Promise((resolve, reject) => {
              db.get('SELECT id FROM users WHERE email = ?', [testUser.email], (err, user) => {
                if (err) reject(err);
                else resolve(user);
              });
            });
            
            if (existingUser) {
              console.log(`  ⚠️  User ${testUser.email} already exists, skipping...`);
              createdCount++;
              continue;
            }
            
            // Hash password
            const hashedPassword = await bcrypt.hash('password123', 10);
            
            // Create user with created_by set to SuperAdmin
            const userId = await new Promise((resolve, reject) => {
              db.run(`
                INSERT INTO users (name, email, password, role, isApproved, university_id, created_by, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
              `, [testUser.name, testUser.email, hashedPassword, testUser.role, 1, testUser.university_id, sa.id], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
              });
            });
            
            console.log(`  ✅ Created ${testUser.name} (${testUser.email}) - ID: ${userId}`);
            createdCount++;
            
          } catch (error) {
            console.error(`  ❌ Error creating ${testUser.email}:`, error);
          }
        }
      }
      
      // Wait for all creations to complete
      setTimeout(() => {
        console.log('\n2. Verifying created users...');
        verifyCreatedUsers(superAdmins);
      }, 1000);
    });
    
    function verifyCreatedUsers(superAdmins) {
      console.log('\n=== VERIFICATION ===');
      
      superAdmins.forEach(sa => {
        console.log(`\n👤 SuperAdmin: ${sa.name} (${sa.email})`);
        
        db.all(`
          SELECT id, name, email, role, created_by
          FROM users 
          WHERE created_by = ? OR id = ?
          ORDER BY role, name
        `, [sa.id, sa.id], (err, users) => {
          if (err) {
            console.error(`Error verifying users for ${sa.name}:`, err);
            return;
          }
          
          console.log(`  📊 Users created by ${sa.name}: ${users.length}`);
          users.forEach(user => {
            const isSelf = user.id === sa.id ? ' (self)' : '';
            console.log(`    - ${user.name} (${user.email}) - Role: ${user.role}${isSelf}`);
          });
        });
      });
      
      setTimeout(() => {
        console.log('\n✅ TEST USERS CREATION COMPLETED!');
        console.log('✅ Each SuperAdmin now has test users');
        console.log('✅ Ready for testing created_by filtering');
        
        console.log('\n🧪 TESTING INSTRUCTIONS:');
        console.log('1. Login as regular SuperAdmin:');
        superAdmins.forEach(sa => {
          console.log(`   - ${sa.email} / password123`);
        });
        console.log('2. Check "All Staff" section');
        console.log('3. Should see only users created by that SuperAdmin');
        console.log('4. Create new users and verify they appear');
        
        process.exit(0);
      }, 1000);
    }
    
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
}

createTestUsers();
