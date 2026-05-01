const axios = require('axios');

async function testOTPOnly() {
  console.log('🧪 Testing OTP functionality...\n');
  
  try {
    const testEmail = 'test@example.com';
    
    // Send OTP
    console.log('📧 Sending OTP...');
    const otpRes = await axios.post('http://127.0.0.1:5002/api/password-reset/send-otp', {
      email: testEmail
    });
    
    console.log('✅ OTP send result:', otpRes.data);
    
    // Generate a test OTP
    const testOTP = '123456';
    
    // Store OTP manually for testing
    const db = require('./config/database-switch');
    
    // Create a test user first
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (name, email, password, role, isApproved, university_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        ['Test User', testEmail, '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', 'student', 1, 1],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    console.log('✅ Test user created');
    
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
    
    console.log('✅ Test OTP stored:', testOTP);
    
    // Verify OTP
    console.log('🔍 Verifying OTP...');
    const verifyOtpRes = await axios.post('http://127.0.0.1:5002/api/password-reset/verify-otp', {
      email: testEmail,
      otp: testOTP
    });
    
    console.log('✅ OTP verification result:', verifyOtpRes.data);
    
    // Reset password (after OTP verification)
    console.log('🔑 Resetting password...');
    const resetRes = await axios.post('http://127.0.0.1:5002/api/password-reset/reset-password', {
      email: testEmail,
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!'
    });
    
    console.log('✅ Password reset result:', resetRes.data);
    
    // Cleanup test data
    db.run("DELETE FROM otp_reset WHERE email = ?", [testEmail]);
    db.run("DELETE FROM users WHERE email = ?", [testEmail]);
    
    console.log('\n🎉 OTP functionality is working perfectly!');
    console.log('✅ OTP send: Working');
    console.log('✅ OTP verification: Working');
    console.log('✅ Password reset: Working');
    
  } catch (error) {
    console.error('❌ OTP test failed:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
  }
}

testOTPOnly();
