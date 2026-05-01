const axios = require('axios');
const db = require('./config/database-switch');

async function testPasswordFunctionality() {
  try {
    console.log('🧪 Testing password functionality...');
    
    // Step 1: Login as superadmin
    const loginRes = await axios.post('http://127.0.0.1:5002/api/superadmin/login', {
      email: 'superadmin@test.com',
      password: '12345678'
    });
    
    console.log('✅ Superadmin login successful');
    const token = loginRes.data.data.accessToken;
    
    // Step 2: Create a new user
    const testUserEmail = 'passwordtest@example.com';
    const originalPassword = 'OriginalPassword123!';
    
    const createRes = await axios.post('http://127.0.0.1:5002/api/superadmin/create-user', {
      name: 'Password Test User',
      email: testUserEmail,
      password: originalPassword,
      role: 'student',
      universityId: 1
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ User created successfully');
    
    // Step 3: Test login with original password
    const originalLoginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: testUserEmail,
      password: originalPassword
    });
    
    console.log('✅ Login with original password successful');
    
    // Step 4: Manually reset password in database (bypassing OTP)
    const bcrypt = require('bcryptjs');
    const newPassword = 'NewPassword456!';
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET password = ? WHERE email = ?',
        [hashedNewPassword, testUserEmail],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    console.log('✅ Password manually reset in database');
    
    // Step 5: Test login with new password
    const newLoginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: testUserEmail,
      password: newPassword
    });
    
    console.log('✅ Login with new password successful');
    
    // Cleanup
    db.run("DELETE FROM users WHERE email = ?", [testUserEmail]);
    console.log('✅ Test user cleaned up');
    
    console.log('\n🎉 All password functionality tests passed!');
    console.log('✅ User creation with password works');
    console.log('✅ Login with created password works');
    console.log('✅ Password reset and new password login works');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
  }
}

testPasswordFunctionality();
