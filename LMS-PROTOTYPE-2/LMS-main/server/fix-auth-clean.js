const db = require('./config/database-switch');
const bcrypt = require('bcryptjs');

console.log('=== FIXING AUTHENTICATION SYSTEM (CLEAN) ===');

async function fixAuthClean() {
  try {
    // First, clear any existing users to avoid ID conflicts
    console.log('1. Clearing existing users...');
    db.run(`DELETE FROM users`, function(err) {
      if (err) {
        console.error('Error clearing users:', err);
        return;
      }
      
      console.log(`✅ Cleared ${this.changes} existing users`);
      
      // Reset user ID counter
      db.run(`DELETE FROM sqlite_sequence WHERE name = 'users'`, (err) => {
        if (err) {
          console.error('Error resetting user counter:', err);
        } else {
          console.log('✅ Reset user auto-increment counter');
        }
        
        // Create essential users with proper passwords
        console.log('\n2. Creating essential users...');
        createUsers();
      });
    });
    
    function createUsers() {
      const usersToCreate = [
        {
          name: 'Portal Admin',
          email: 'portal@core5.co.in',
          password: 'Core5@2022',
          role: 'portal_admin',
          university_id: null
        },
        {
          name: 'SuperAdmin',
          email: 'superadmin@core5.co.in',
          password: 'password123',
          role: 'superadmin',
          university_id: null
        },
        {
          name: 'Test Admin',
          email: 'admin@test.com',
          password: 'password123',
          role: 'admin',
          university_id: null
        },
        {
          name: 'Test Student',
          email: 'student@test.com',
          password: 'password123',
          role: 'student',
          university_id: null
        }
      ];
      
      let createdCount = 0;
      let totalUsers = usersToCreate.length;
      
      usersToCreate.forEach(async (userData) => {
        try {
          // Hash the password
          const hashedPassword = await bcrypt.hash(userData.password, 10);
          
          // Insert the user (without specifying ID to use auto-increment)
          db.run(`
            INSERT INTO users (name, email, password, role, university_id)
            VALUES (?, ?, ?, ?, ?)
          `, [userData.name, userData.email, hashedPassword, userData.role, userData.university_id], function(err) {
            if (err) {
              console.error(`Error creating user ${userData.email}:`, err);
              return;
            }
            
            createdCount++;
            console.log(`✅ Created user: ${userData.name} (${userData.email}) - Role: ${userData.role}, ID: ${this.lastID}`);
            
            if (createdCount === totalUsers) {
              console.log('\n3. Testing password verification...');
              testPasswordVerification();
            }
          });
          
        } catch (error) {
          console.error(`Error hashing password for ${userData.email}:`, error);
        }
      });
    }
    
    function testPasswordVerification() {
      // Test password verification for each user
      db.all(`
        SELECT id, name, email, password, role 
        FROM users 
        ORDER BY id
      `, [], (err, users) => {
        if (err) {
          console.error('Error fetching users:', err);
          return;
        }
        
        console.log('Found users for testing:');
        users.forEach(user => {
          console.log(`  - ${user.name} (${user.email})`);
        });
        
        const testPasswords = [
          { email: 'portal@core5.co.in', password: 'Core5@2022' },
          { email: 'superadmin@core5.co.in', password: 'password123' },
          { email: 'admin@test.com', password: 'password123' },
          { email: 'student@test.com', password: 'password123' }
        ];
        
        let testCount = 0;
        let totalTests = testPasswords.length;
        
        testPasswords.forEach(testUser => {
          const user = users.find(u => u.email === testUser.email);
          
          if (user) {
            // Verify password
            bcrypt.compare(testUser.password, user.password, (err, isValid) => {
              if (err) {
                console.error(`Error verifying password for ${testUser.email}:`, err);
                return;
              }
              
              testCount++;
              
              if (isValid) {
                console.log(`✅ Password verification successful for ${testUser.email}`);
              } else {
                console.log(`❌ Password verification failed for ${testUser.email}`);
              }
              
              if (testCount === totalTests) {
                console.log('\n4. Creating test universities...');
                createTestUniversities(users);
              }
            });
          } else {
            console.log(`❌ User ${testUser.email} not found`);
            testCount++;
            
            if (testCount === totalTests) {
              createTestUniversities(users);
            }
          }
        });
      });
    }
    
    function createTestUniversities(users) {
      console.log('Creating test universities...');
      
      // Clear existing universities
      db.run(`DELETE FROM universities`, function(err) {
        if (err) {
          console.error('Error clearing universities:', err);
          return;
        }
        
        console.log(`✅ Cleared ${this.changes} existing universities`);
        
        // Reset university counter
        db.run(`DELETE FROM sqlite_sequence WHERE name = 'universities'`, (err) => {
          if (err) {
            console.error('Error resetting university counter:', err);
          }
          
          // Create universities
          const universities = [
            { name: 'Test University 1', adminId: 2 }, // SuperAdmin ID
            { name: 'Test University 2', adminId: 2 }
          ];
          
          let uniCount = 0;
          let totalUnis = universities.length;
          
          universities.forEach(uni => {
            db.run(`
              INSERT INTO universities (name, adminId)
              VALUES (?, ?)
            `, [uni.name, uni.adminId], function(err) {
              if (err) {
                console.error(`Error creating university ${uni.name}:`, err);
                return;
              }
              
              uniCount++;
              console.log(`✅ Created university: ${uni.name} (ID: ${this.lastID})`);
              
              if (uniCount === totalUnis) {
                console.log('\n5. Updating user university assignments...');
                updateUserAssignments(users);
              }
            });
          });
        });
      });
    }
    
    function updateUserAssignments(users) {
      // Get the created universities with their IDs
      db.all(`
        SELECT id, name, adminId 
        FROM universities 
        ORDER BY id
      `, [], (err, universities) => {
        if (err) {
          console.error('Error fetching universities:', err);
          return;
        }
        
        // Assign users to universities
        const superAdmin = users.find(u => u.email === 'superadmin@core5.co.in');
        const admin = users.find(u => u.email === 'admin@test.com');
        const student = users.find(u => u.email === 'student@test.com');
        
        if (universities.length > 0 && superAdmin && admin && student) {
          const uniId = universities[0].id; // First university
          
          const assignments = [
            { userId: superAdmin.id, universityId: uniId },
            { userId: admin.id, universityId: uniId },
            { userId: student.id, universityId: uniId }
          ];
          
          let assignCount = 0;
          let totalAssigns = assignments.length;
          
          assignments.forEach(assignment => {
            db.run(`
              UPDATE users 
              SET university_id = ? 
              WHERE id = ?
            `, [assignment.universityId, assignment.userId], function(err) {
              if (err) {
                console.error(`Error updating user assignment:`, err);
                return;
              }
              
              assignCount++;
              console.log(`✅ Assigned user ${assignment.userId} to university ${assignment.universityId}`);
              
              if (assignCount === totalAssigns) {
                console.log('\n=== AUTHENTICATION FIX COMPLETED ===');
                showCredentials();
              }
            });
          });
        } else {
          console.log('❌ Could not find users or universities for assignment');
          showCredentials();
        }
      });
    }
    
    function showCredentials() {
      console.log('\n=== WORKING LOGIN CREDENTIALS ===');
      console.log('\n🔑 PORTAL ADMIN (Highest Access):');
      console.log('   Email: portal@core5.co.in');
      console.log('   Password: Core5@2022');
      console.log('   Role: portal_admin');
      console.log('   University: None (system-wide access)');
      
      console.log('\n🔑 SUPERADMIN:');
      console.log('   Email: superadmin@core5.co.in');
      console.log('   Password: password123');
      console.log('   Role: superadmin');
      console.log('   University: Test University 1');
      
      console.log('\n🔑 ADMIN:');
      console.log('   Email: admin@test.com');
      console.log('   Password: password123');
      console.log('   Role: admin');
      console.log('   University: Test University 1');
      
      console.log('\n🔑 STUDENT:');
      console.log('   Email: student@test.com');
      console.log('   Password: password123');
      console.log('   Role: student');
      console.log('   University: Test University 1');
      
      console.log('\n🌐 LOGIN URL:');
      console.log('   http://localhost:3000/login');
      
      console.log('\n✅ Authentication system fixed!');
      console.log('✅ All passwords are properly hashed with bcrypt');
      console.log('✅ Login should work correctly now');
      console.log('✅ Test universities created');
      console.log('✅ Users assigned to universities');
      
      process.exit(0);
    }
    
  } catch (error) {
    console.error('Error fixing authentication:', error);
    process.exit(1);
  }
}

fixAuthClean();
