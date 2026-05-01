const axios = require('axios');
const db = require('./config/database-switch');
const bcrypt = require('bcryptjs');

async function testExistingUserLogin() {
  console.log('🧪 Testing existing user login...\n');
  
  try {
    // Test with an existing user that has bcrypt password
    const testEmail = 'pranay@core5.co.in';
    
    console.log(`🔍 Testing login for: ${testEmail}`);
    
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
    
    console.log('✅ User found:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      password_type: user.password.startsWith('$2a$') ? 'bcrypt' : 'unknown'
    });
    
    // Test login with common passwords
    const testPasswords = [
      '12345678',
      'password',
      'Password123!',
      'Pranay123',
      'pranay123',
      'admin',
      'test',
      ''
    ];
    
    console.log('\n🔐 Testing with common passwords...');
    
    for (const password of testPasswords) {
      try {
        const loginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
          email: testEmail,
          password: password
        });
        
        console.log(`✅ Login successful with password: "${password}"`);
        console.log('👤 User logged in:', loginRes.data.user);
        return;
        
      } catch (error) {
        console.log(`❌ Login failed with password "${password}": ${error.response?.data?.message || error.message}`);
      }
    }
    
    // If no common password works, let's check if it's a demo user
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
      console.log('✅ User is in demo list - any password should work');
    } else {
      console.log('❌ User is not in demo list - specific password required');
      
      // Test password verification directly
      if (user.password.startsWith('$2a$')) {
        console.log('\n🔐 Testing bcrypt password verification...');
        
        // Try to verify with common passwords
        for (const password of testPasswords) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (isMatch) {
            console.log(`✅ Password match found: "${password}"`);
            console.log('💡 This password should work for login');
            return;
          }
        }
        
        console.log('❌ No common password matches the stored hash');
        console.log('💡 The user was created with a specific password that we don\'t know');
      }
    }
    
    // Test with another user
    console.log('\n🔍 Testing with another user...');
    
    const testEmail2 = 'newuser@test.com';
    
    const user2 = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [testEmail2], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (user2) {
      console.log(`✅ Found user: ${user2.name} (${user2.email})`);
      
      // Test with common passwords for this user too
      for (const password of testPasswords) {
        try {
          const loginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
            email: testEmail2,
            password: password
          });
          
          console.log(`✅ Login successful for ${testEmail2} with password: "${password}"`);
          console.log('👤 User logged in:', loginRes.data.user);
          return;
          
        } catch (error) {
          console.log(`❌ Login failed for ${testEmail2} with password "${password}": ${error.response?.data?.message || error.message}`);
        }
      }
    }
    
    console.log('\n🎯 CONCLUSION:');
    console.log('❌ Unable to login with any common password');
    console.log('💡 The users were created with specific passwords that are not common ones');
    console.log('🔍 To test generated passwords, you need to:');
    console.log('   1. Login as superadmin first');
    console.log('   2. Create a new university/user via API');
    console.log('   3. Use the generated password from the API response');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testExistingUserLogin();
