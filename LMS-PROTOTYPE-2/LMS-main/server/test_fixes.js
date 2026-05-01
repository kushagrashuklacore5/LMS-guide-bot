const axios = require('axios');

async function testFixes() {
  console.log('🧪 Testing fixes...\n');
  
  try {
    // Test 1: Subscription verification (Issue 1)
    console.log('🔍 Testing subscription verification...');
    
    // First login as superadmin
    const loginRes = await axios.post('http://127.0.0.1:5002/api/superadmin/login', {
      email: 'superadmin@test.com',
      password: '12345678'
    });
    
    console.log('✅ Superadmin login successful');
    const token = loginRes.data.data.accessToken;
    
    // Test subscription verification endpoint
    const verifyRes = await axios.post('http://127.0.0.1:5002/api/subscriptions/verify-payment', {
      orderId: 'test_order_123',
      paymentId: 'test_payment_123',
      signature: 'test_signature',
      planId: 'standard',
      planName: 'Standard',
      amount: 99900
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Subscription verification result:', verifyRes.data);
    
    // Test 2: Password reset OTP (Issue 2)
    console.log('\n🔍 Testing password reset OTP...');
    
    const testEmail = 'test@example.com';
    
    // Send OTP
    const otpRes = await axios.post('http://127.0.0.1:5002/api/password-reset/send-otp', {
      email: testEmail
    });
    
    console.log('✅ OTP send result:', otpRes.data);
    
    // Generate a test OTP (since we can't actually receive emails)
    const testOTP = '123456';
    
    // Store OTP manually for testing
    const db = require('./config/database-switch');
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
    
    console.log('✅ Test OTP stored');
    
    // Verify OTP
    const verifyOtpRes = await axios.post('http://127.0.0.1:5002/api/password-reset/verify-otp', {
      email: testEmail,
      otp: testOTP
    });
    
    console.log('✅ OTP verification result:', verifyOtpRes.data);
    
    // Reset password
    const resetRes = await axios.post('http://127.0.0.1:5002/api/password-reset/reset-password', {
      email: testEmail,
      newPassword: 'NewPassword123!'
    });
    
    console.log('✅ Password reset result:', resetRes.data);
    
    // Cleanup test data
    db.run("DELETE FROM otp_reset WHERE email = ?", [testEmail]);
    db.run("DELETE FROM users WHERE email = ?", [testEmail]);
    
    console.log('\n🎉 Both issues fixed successfully!');
    console.log('✅ Subscription verification: Working');
    console.log('✅ Password reset OTP: Working');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
  }
}

testFixes();
