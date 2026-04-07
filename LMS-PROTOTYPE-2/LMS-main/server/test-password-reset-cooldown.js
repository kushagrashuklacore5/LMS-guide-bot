// Test Password Reset Cooldown Functionality
const http = require('http');

async function testCooldown() {
  console.log('🧪 Testing Password Reset Cooldown...');
  console.log('');

  const testEmail = 'admin@gmail.com'; // Known test user
  const baseUrl = 'http://localhost:5002/api/password-reset';

  try {
    // Step 1: Send first OTP
    console.log('📧 Step 1: Sending first OTP...');
    const firstResponse = await makeRequest('POST', `${baseUrl}/send-otp`, { email: testEmail });
    console.log('✅ First OTP Response:', JSON.stringify(firstResponse, null, 2));
    console.log('');

    // Step 2: Try to send second OTP immediately (should fail with cooldown)
    console.log('📧 Step 2: Trying to send second OTP immediately...');
    const secondResponse = await makeRequest('POST', `${baseUrl}/send-otp`, { email: testEmail });
    console.log('✅ Second OTP Response:', JSON.stringify(secondResponse, null, 2));
    console.log('');

    // Step 3: Check cooldown status
    console.log('⏱️  Step 3: Checking cooldown status...');
    const cooldownResponse = await makeRequest('GET', `${baseUrl}/check-cooldown?email=${encodeURIComponent(testEmail)}`);
    console.log('✅ Cooldown Response:', JSON.stringify(cooldownResponse, null, 2));
    console.log('');

    // Step 4: Wait for cooldown and try again
    if (cooldownResponse.cooldownRemaining > 0) {
      console.log(`⏳ Step 4: Waiting ${cooldownResponse.cooldownRemaining} seconds for cooldown...`);
      await new Promise(resolve => setTimeout(resolve, (cooldownResponse.cooldownRemaining + 1) * 1000));
      
      console.log('📧 Step 5: Sending OTP after cooldown...');
      const thirdResponse = await makeRequest('POST', `${baseUrl}/send-otp`, { email: testEmail });
      console.log('✅ Third OTP Response:', JSON.stringify(thirdResponse, null, 2));
    }

    console.log('🎉 Cooldown test completed successfully!');

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
testCooldown().catch(console.error);
