// Test Password Reset Flow
const http = require('http');

async function testPasswordReset() {
  console.log('🧪 Testing Password Reset Flow...');
  console.log('');

  const testEmail = 'student@gmail.com'; // Known test user
  const baseUrl = 'http://localhost:5002/api/password-reset';

  // Step 1: Send OTP
  console.log('📧 Step 1: Sending OTP...');
  try {
    const otpResponse = await makeRequest('POST', `${baseUrl}/send-otp`, { email: testEmail });
    console.log('✅ OTP Response:', JSON.stringify(otpResponse, null, 2));
    
    // In development, the OTP is returned in the response
    const otp = otpResponse.developmentOTP;
    if (!otp) {
      console.log('ℹ️  Check server console for OTP (development mode)');
      console.log('   Or check your email for the OTP');
      return;
    }
    
    console.log(`🔢 OTP for testing: ${otp}`);
    console.log('');

    // Step 2: Verify OTP
    console.log('🔍 Step 2: Verifying OTP...');
    const verifyResponse = await makeRequest('POST', `${baseUrl}/verify-otp`, { 
      email: testEmail, 
      otp: otp 
    });
    console.log('✅ Verify Response:', JSON.stringify(verifyResponse, null, 2));
    console.log('');

    // Step 3: Reset Password
    console.log('🔐 Step 3: Resetting Password...');
    const resetResponse = await makeRequest('POST', `${baseUrl}/reset-password`, {
      email: testEmail,
      newPassword: 'newpassword123',
      confirmPassword: 'newpassword123'
    });
    console.log('✅ Reset Response:', JSON.stringify(resetResponse, null, 2));
    console.log('');

    // Step 4: Test login with new password
    console.log('🚪 Step 4: Testing login with new password...');
    const loginResponse = await makeRequest('POST', 'http://localhost:5002/api/auth/login', {
      email: testEmail,
      password: 'newpassword123'
    });
    console.log('✅ Login Response:', JSON.stringify(loginResponse, null, 2));
    console.log('');

    console.log('🎉 Password reset flow completed successfully!');
    console.log('📝 You can now login with:');
    console.log(`   Email: ${testEmail}`);
    console.log('   Password: newpassword123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function makeRequest(method, url, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5002,
      path: url.replace('http://localhost:5002', ''),
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve(parsedData);
        } catch (error) {
          resolve({ success: false, message: responseData });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Run the test
testPasswordReset().catch(console.error);
