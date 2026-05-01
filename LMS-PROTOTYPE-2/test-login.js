const axios = require('axios');

async function testLogin() {
  try {
    console.log('🧪 Testing Login API...\n');
    
    const response = await axios.post('http://localhost:5002/api/auth/login', {
      email: 'superadmin@core5.co.in',
      password: '12345678'
    });
    
    console.log('✅ Login Response:', response.data);
    console.log('🎯 Login is working correctly!');
    
  } catch (error) {
    console.log('❌ Login Error:', error.response?.data || error.message);
  }
}

testLogin();
