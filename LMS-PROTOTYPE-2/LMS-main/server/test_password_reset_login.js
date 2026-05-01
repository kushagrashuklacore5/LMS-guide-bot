const axios = require('axios');
const db = require('./config/database-switch');

async function testPasswordResetLogin() {
  console.log('🧪 Testing password reset and login...\n');
  
  try {
    const testEmail = 'passwordtest@example.com';
    const originalPassword = 'OriginalPassword123!';
    const newPassword = 'NewPassword456!';
    
    // Create a test user with original password
    console.log('👤 Creating test user...');
    const bcrypt = require('bcryptjs');
    const hashedOriginalPassword = await bcrypt.hash(originalPassword, 10);
    
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (name, email, password, role, isApproved, university_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        ['Test User', testEmail, hashedOriginalPassword, 'student', 1, 1],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    console.log('✅ Test user created with original password');
    
    // Test login with original password
    console.log('🔐 Testing login with original password...');
    const originalLoginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: testEmail,
      password: originalPassword
    });
    
    console.log('✅ Login with original password successful');
    
    // Reset password
    console.log('🔄 Resetting password...');
    
    // Send OTP
    await axios.post('http://127.0.0.1:5002/api/password-reset/send-otp', {
      email: testEmail
    });
    
    // Store and verify OTP
    const testOTP = '123456';
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO otp_reset (email, otp, expires_at, attempts, created_at, verified) VALUES (?, ?, datetime("now", "+5 minutes"), 0, datetime("now"), 0)',
        [testEmail, testOTP],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    // Verify OTP
    await axios.post('http://127.0.0.1:5002/api/password-reset/verify-otp', {
      email: testEmail,
      otp: testOTP
    });
    
    console.log('✅ OTP verified');
    
    // Reset password
    await axios.post('http://127.0.0.1:5002/api/password-reset/reset-password', {
      email: testEmail,
      newPassword: newPassword,
      confirmPassword: newPassword
    });
    
    console.log('✅ Password reset successful');
    
    // Test login with new password
    console.log('🔐 Testing login with new password...');
    const newLoginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: testEmail,
      password: newPassword
    });
    
    console.log('✅ Login with new password successful:', newLoginRes.data);
    
    // Cleanup
    db.run("DELETE FROM users WHERE email = ?", [testEmail]);
    db.run("DELETE FROM otp_reset WHERE email = ?", [testEmail]);
    
    console.log('\n🎉 Password reset and login working perfectly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
  }
}

testPasswordResetLogin();
