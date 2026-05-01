const db = require('./config/database-switch');
const bcrypt = require('bcryptjs');

console.log('=== FIXING AUTHENTICATION SYSTEM ===');

async function fixAuthentication() {
  try {
    console.log('1. Creating essential users with proper passwords...');
    
    // Create essential users with proper password hashing
    const usersToCreate = [
      {
        id: 1,
        name: 'Portal Admin',
        email: 'portal@core5.co.in',
        password: 'Core5@2022',
        role: 'portal_admin',
        university_id: null
      },
      {
        id: 2,
        name: 'SuperAdmin',
        email: 'superadmin@core5.co.in',
        password: 'password123',
        role: 'superadmin',
        university_id: null
      },
      {
        id: 3,
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin',
        university_id: null
      },
      {
        id: 4,
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
        
        // Insert the user
        db.run(`
          INSERT INTO users (id, name, email, password, role, university_id)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [userData.id, userData.name, userData.email, hashedPassword, userData.role, userData.university_id], function(err) {
          if (err) {
            console.error(`Error creating user ${userData.email}:`, err);
            return;
          }
          
          createdCount++;
          console.log(`✅ Created user: ${userData.name} (${userData.email}) - Role: ${userData.role}`);
          
          if (createdCount === totalUsers) {
            console.log('\n2. Testing password verification...');
            testPasswordVerification();
          }
        });
        
      } catch (error) {
        console.error(`Error hashing password for ${userData.email}:`, error);
      }
    });
    
    function testPasswordVerification() {
      // Test password verification for each user
      const testUsers = [
        { email: 'portal@core5.co.in', password: 'Core5@2022' },
        { email: 'superadmin@core5.co.in', password: 'password123' },
        { email: 'admin@test.com', password: 'password123' },
        { email: 'student@test.com', password: 'password123' }
      ];
      
      let testCount = 0;
      let totalTests = testUsers.length;
      
      testUsers.forEach(testUser => {
        db.get(`
          SELECT id, name, email, password, role 
          FROM users 
          WHERE email = ?
        `, [testUser.email], (err, user) => {
          if (err) {
            console.error(`Error fetching user ${testUser.email}:`, err);
            return;
          }
          
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
                console.log('\n3. Creating universities for testing...');
                createTestUniversities();
              }
            });
          } else {
            console.log(`❌ User ${testUser.email} not found`);
            testCount++;
            
            if (testCount === totalTests) {
              createTestUniversities();
            }
          }
        });
      });
    }
    
    function createTestUniversities() {
      console.log('Creating test universities...');
      
      const universities = [
        { id: 1, name: 'Test University 1', adminId: 2 },
        { id: 2, name: 'Test University 2', adminId: 2 }
      ];
      
      let uniCount = 0;
      let totalUnis = universities.length;
      
      universities.forEach(uni => {
        db.run(`
          INSERT INTO universities (id, name, adminId)
          VALUES (?, ?, ?)
        `, [uni.id, uni.name, uni.adminId], function(err) {
          if (err) {
            console.error(`Error creating university ${uni.name}:`, err);
            return;
          }
          
          uniCount++;
          console.log(`✅ Created university: ${uni.name}`);
          
          if (uniCount === totalUnis) {
            console.log('\n4. Updating user university assignments...');
            updateUserAssignments();
          }
        });
      });
    }
    
    function updateUserAssignments() {
      // Assign users to universities
      const assignments = [
        { userId: 2, universityId: 1 }, // SuperAdmin to University 1
        { userId: 3, universityId: 1 }, // Admin to University 1
        { userId: 4, universityId: 1 }  // Student to University 1
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
    }
    
    function showCredentials() {
      console.log('\n=== WORKING LOGIN CREDENTIALS ===');
      console.log('\n🔑 PORTAL ADMIN (Highest Access):');
      console.log('   Email: portal@core5.co.in');
      console.log('   Password: Core5@2022');
      console.log('   Role: portal_admin');
      
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
      console.log('✅ All passwords are properly hashed');
      console.log('✅ Login should work correctly now');
      console.log('✅ Test universities created');
      
      process.exit(0);
    }
    
  } catch (error) {
    console.error('Error fixing authentication:', error);
    process.exit(1);
  }
}

fixAuthentication();
