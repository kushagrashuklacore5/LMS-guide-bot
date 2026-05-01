const db = require('./config/database-switch');
const bcrypt = require('bcryptjs');
const axios = require('axios');

async function debugSpecificUser() {
  console.log('🔍 Debugging specific user: abhishek@core5.co.in\n');
  
  try {
    const testEmail = 'abhishek@core5.co.in';
    const testPassword = 'O#P$0A@7THQW';
    
    console.log(`👤 Testing user: ${testEmail}`);
    console.log(`🔑 Generated password: ${testPassword}`);
    
    // Get user from database
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [testEmail], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!user) {
      console.log('❌ User not found in database');
      return;
    }
    
    console.log('\n✅ User found in database:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   University: ${user.university_id}`);
    console.log(`   Approved: ${user.isApproved}`);
    console.log(`   Password Type: ${user.password.startsWith('$2a$') ? 'bcrypt' : 'unknown'}`);
    console.log(`   Password Length: ${user.password.length}`);
    console.log(`   Password Hash: ${user.password.substring(0, 20)}...`);
    
    // Test 1: Direct bcrypt comparison
    console.log('\n🔐 Testing direct bcrypt comparison...');
    
    try {
      const isMatch = await bcrypt.compare(testPassword, user.password);
      console.log(`✅ Direct bcrypt.compare result: ${isMatch ? 'MATCH' : 'NO MATCH'}`);
      
      if (!isMatch) {
        console.log('❌ Password does not match stored hash');
        
        // Test with variations of the password
        const passwordVariations = [
          testPassword,
          testPassword.trim(),
          testPassword.toLowerCase(),
          testPassword.toUpperCase(),
          testPassword.replace(/[^a-zA-Z0-9]/g, ''), // Remove special chars
          'O#P$0A@7THQW'.replace(/[^a-zA-Z0-9]/g, ''), // Remove special chars from original
          'OP0ATHQW', // Remove special chars and uppercase
          'op0athqw', // Remove special chars and lowercase
        ];
        
        console.log('\n🔍 Testing password variations...');
        for (const variation of passwordVariations) {
          const variationMatch = await bcrypt.compare(variation, user.password);
          console.log(`   "${variation}": ${variationMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
          if (variationMatch) {
            console.log(`💡 FOUND MATCHING PASSWORD: "${variation}"`);
            break;
          }
        }
      }
    } catch (bcryptError) {
      console.log('❌ Bcrypt comparison error:', bcryptError.message);
    }
    
    // Test 2: API login test
    console.log('\n🌐 Testing API login...');
    
    try {
      const loginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
        email: testEmail,
        password: testPassword
      });
      
      console.log('✅ API Login successful!');
      console.log('👤 Logged in user:', loginRes.data.user);
      
    } catch (loginError) {
      console.log('❌ API Login failed:', loginError.response?.data?.message || loginError.message);
      
      // Test with the variations that matched in bcrypt (if any)
      if (bcryptError) {
        console.log('\n🔍 Testing API login with password variations...');
        
        const passwordVariations = [
          testPassword,
          testPassword.trim(),
          testPassword.toLowerCase(),
          testPassword.toUpperCase(),
        ];
        
        for (const variation of passwordVariations) {
          try {
            const variationLoginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
              email: testEmail,
              password: variation
            });
            
            console.log(`✅ API Login successful with password: "${variation}"`);
            console.log('👤 Logged in user:', variationLoginRes.data.user);
            return;
            
          } catch (variationError) {
            console.log(`❌ API Login failed with password "${variation}": ${variationError.response?.data?.message || variationError.message}`);
          }
        }
      }
    }
    
    // Test 3: Check if user is in demo list (which bypasses password)
    console.log('\n🔍 Checking if user is in demo list...');
    
    const demoEmails = [
      "student@gmail.com",
      "mentor@gmail.com", 
      "admin@gmail.com",
      "accountant@demo.com",
      "storekeeper@demo.com",
      "superadmin@core5.com",
      "portal@core5.co.in"
    ];
    
    if (demoEmails.includes(testEmail)) {
      console.log('✅ User is in demo list - password should be bypassed');
      console.log('💡 Any password should work for this user');
    } else {
      console.log('❌ User is not in demo list - password verification required');
    }
    
    // Test 4: Create a test user with the same password to verify
    console.log('\n🧪 Creating test user with same password...');
    
    const testUserEmail = 'testabhishek@example.com';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    const testUserId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO users (name, email, password, role, isApproved, university_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `, ['Test Abhishek', testUserEmail, hashedPassword, 'student', 1, 1], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    
    console.log(`✅ Test user created with ID: ${testUserId}`);
    
    // Test login with test user
    try {
      const testLoginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
        email: testUserEmail,
        password: testPassword
      });
      
      console.log('✅ Test user login successful!');
      console.log('👤 Test user logged in:', testLoginRes.data.user);
      console.log('💡 This proves the password hashing and login system works correctly');
      
    } catch (testLoginError) {
      console.log('❌ Test user login failed:', testLoginError.response?.data?.message || testLoginError.message);
    }
    
    // Cleanup test user
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE email = ?', [testUserEmail], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('\n🎯 CONCLUSION:');
    console.log('If the test user login works but the original user login fails, then:');
    console.log('1. The original user was created with a different password');
    console.log('2. There might be an issue with special characters in the password');
    console.log('3. The password was not properly saved during user creation');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugSpecificUser();
