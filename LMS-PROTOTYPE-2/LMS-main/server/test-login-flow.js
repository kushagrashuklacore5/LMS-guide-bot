const axios = require('axios');

async function testCompleteFlow() {
  try {
    console.log('🔐 Testing complete login flow...');
    
    // Step 1: Login
    console.log('\n1️⃣ Logging in...');
    const loginResponse = await axios.post('http://localhost:5002/api/auth/login', {
      email: 'portal@core5.co.in',
      password: 'Core5@2024!'
    });
    
    console.log('✅ Login successful');
    console.log('🔑 Token received:', loginResponse.data.token ? 'YES' : 'NO');
    console.log('👤 User data:', JSON.stringify(loginResponse.data.user, null, 2));
    
    // Step 2: Call superadmin API
    console.log('\n2️⃣ Calling superadmin API...');
    const apiResponse = await axios.get('http://localhost:5002/api/superadmin/internal/superadmins', {
      headers: {
        Authorization: `Bearer ${loginResponse.data.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API call successful');
    console.log('📊 Status:', apiResponse.status);
    console.log('📤 Response data:', JSON.stringify(apiResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error occurred:');
    console.error('Message:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.request) {
      console.error('Request was made but no response received');
    }
  }
}

testCompleteFlow();
