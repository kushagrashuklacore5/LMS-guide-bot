const axios = require('axios');

async function testUserPassword() {
  try {
    console.log('🧪 Testing user creation and login...');
    
    // Step 1: Login as superadmin
    const loginRes = await axios.post('http://127.0.0.1:5002/api/superadmin/login', {
      email: 'superadmin@test.com',
      password: '12345678'
    });
    
    console.log('✅ Superadmin login successful');
    const token = loginRes.data.data.accessToken;
    
    // Step 2: Create a new user with a specific password
    const testUserEmail = 'newuser@test.com';
    const testPassword = 'TestPassword123!';
    
    const createRes = await axios.post('http://127.0.0.1:5002/api/superadmin/create-user', {
      name: 'Test User',
      email: testUserEmail,
      password: testPassword,
      role: 'student',
      universityId: 1
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ User created successfully:', createRes.data);
    
    // Step 3: Try to login with the newly created user
    const userLoginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: testUserEmail,
      password: testPassword
    });
    
    console.log('✅ New user login successful:', userLoginRes.data);
    
    // Step 4: Test password reset
    console.log('🔄 Testing password reset...');
    
    // Send OTP
    const otpRes = await axios.post('http://127.0.0.1:5002/api/password-reset/send-otp', {
      email: testUserEmail
    });
    
    console.log('✅ OTP sent (simulated)');
    
    // Reset password (bypass OTP verification for testing)
    const newPassword = 'NewPassword456!';
    const resetRes = await axios.post('http://127.0.0.1:5002/api/password-reset/reset-password', {
      email: testUserEmail,
      newPassword: newPassword
    });
    
    console.log('✅ Password reset successful:', resetRes.data);
    
    // Step 5: Try to login with the new password
    const newLoginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: testUserEmail,
      password: newPassword
    });
    
    console.log('✅ Login with new password successful:', newLoginRes.data);
    
    // Cleanup: Remove test user
    console.log('🧹 Cleaning up test user...');
    const db = require('./config/database-switch');
    db.run("DELETE FROM users WHERE email = ?", [testUserEmail], (err) => {
      if (err) {
        console.error('❌ Error cleaning up:', err);
      } else {
        console.log('✅ Test user cleaned up');
      }
    });
    
    console.log('\n🎉 All password tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
  }
}

testUserPassword();
