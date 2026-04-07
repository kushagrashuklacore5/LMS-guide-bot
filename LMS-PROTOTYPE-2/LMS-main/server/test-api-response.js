const axios = require('axios');

async function testAPI() {
  try {
    console.log('🧪 Testing API endpoint...');
    
    // First login to get token
    const loginResponse = await axios.post('http://localhost:5002/api/auth/login', {
      email: 'portal@core5.co.in',
      password: 'Core5@2024!'
    });
    
    console.log('✅ Login successful');
    console.log('🔑 Token:', loginResponse.data.token ? 'Received' : 'Missing');
    console.log('👤 User:', loginResponse.data.user);
    
    // Now test the superadmin API
    const apiResponse = await axios.get('http://localhost:5002/api/superadmin/internal/superadmins', {
      headers: {
        Authorization: `Bearer ${loginResponse.data.token}`
      }
    });
    
    console.log('\n📊 API Response:');
    console.log('Status:', apiResponse.status);
    console.log('Data:', JSON.stringify(apiResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }
}

testAPI();
