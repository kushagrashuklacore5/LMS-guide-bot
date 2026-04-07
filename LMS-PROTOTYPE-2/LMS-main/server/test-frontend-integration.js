// Frontend Integration Test - Copy and paste into browser console
console.log('🧪 Frontend Password Reset Integration Test');
console.log('Copy and paste this code into your browser console at http://localhost:5174');
console.log('');

// Test function to run in browser console
const testPasswordResetFrontend = async () => {
  console.log('🚀 Starting frontend password reset test...');
  console.log('');

  const testEmail = 'mentor@gmail.com'; // Known test user
  const baseUrl = 'http://localhost:5002/api/password-reset';

  try {
    // Step 1: Send OTP
    console.log('📧 Step 1: Sending OTP...');
    const sendResponse = await fetch(`${baseUrl}/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail })
    });

    const sendData = await sendResponse.json();
    console.log('✅ Send OTP Response:', sendData);

    if (!sendData.success) {
      throw new Error('Failed to send OTP');
    }

    const otp = sendData.developmentOTP;
    if (!otp) {
      console.log('ℹ️  Check server console for OTP (development mode)');
      return;
    }
    
    console.log(`🔢 OTP for testing: ${otp}`);
    console.log('');

    // Step 2: Verify OTP
    console.log('🔍 Step 2: Verifying OTP...');
    const verifyResponse = await fetch(`${baseUrl}/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail, otp: otp })
    });

    const verifyData = await verifyResponse.json();
    console.log('✅ Verify OTP Response:', verifyData);

    if (!verifyData.success) {
      throw new Error('Failed to verify OTP');
    }

    console.log('');

    // Step 3: Reset Password
    console.log('🔐 Step 3: Resetting Password...');
    const resetResponse = await fetch(`${baseUrl}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        newPassword: 'frontendTest123',
        confirmPassword: 'frontendTest123'
      })
    });

    const resetData = await resetResponse.json();
    console.log('✅ Reset Password Response:', resetData);

    if (!resetData.success) {
      throw new Error('Failed to reset password');
    }

    console.log('');

    // Step 4: Test login with new password
    console.log('🚪 Step 4: Testing login with new password...');
    const loginResponse = await fetch('http://localhost:5002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'frontendTest123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('✅ Login Response:', loginData);

    if (!loginData.token) {
      throw new Error('Failed to login with new password');
    }

    console.log('');
    console.log('🎉 Frontend password reset test completed successfully!');
    console.log('📝 You can now login with:');
    console.log(`   Email: ${testEmail}`);
    console.log('   Password: frontendTest123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

// Test cooldown functionality
const testCooldownFrontend = async () => {
  console.log('⏱️  Testing cooldown functionality...');
  
  const testEmail = 'accountant@demo.com';
  const baseUrl = 'http://localhost:5002/api/password-reset';

  try {
    // First request
    console.log('📧 Sending first OTP...');
    const firstResponse = await fetch(`${baseUrl}/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail })
    });

    const firstData = await firstResponse.json();
    console.log('✅ First OTP:', firstData.success ? 'Sent' : 'Failed');

    // Immediate second request (should fail)
    console.log('📧 Trying immediate second OTP...');
    const secondResponse = await fetch(`${baseUrl}/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail })
    });

    const secondData = await secondResponse.json();
    console.log('✅ Second OTP:', secondData.success ? 'Sent' : 'Blocked (expected)');

    // Check cooldown
    console.log('⏱️  Checking cooldown status...');
    const cooldownResponse = await fetch(`${baseUrl}/check-cooldown?email=${encodeURIComponent(testEmail)}`);
    const cooldownData = await cooldownResponse.json();
    console.log('✅ Cooldown Status:', cooldownData);

    console.log('🎉 Cooldown test completed!');

  } catch (error) {
    console.error('❌ Cooldown test error:', error.message);
  }
};

console.log('📋 Available functions:');
console.log('  testPasswordResetFrontend() - Test complete password reset flow');
console.log('  testCooldownFrontend() - Test cooldown functionality');
console.log('');
console.log('🚀 Run: testPasswordResetFrontend() to test the complete flow');

// Export for browser use
if (typeof window !== 'undefined') {
  window.testPasswordResetFrontend = testPasswordResetFrontend;
  window.testCooldownFrontend = testCooldownFrontend;
}
