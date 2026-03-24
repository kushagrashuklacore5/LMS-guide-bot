const axios = require('axios');

async function testSuperadminLogin() {
  try {
    console.log('Testing superadmin login...');
    
    const response = await axios.post('http://localhost:5002/api/superadmin/login', {
      email: 'superadmin@lms.com',
      password: 'admin123'
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
  }
}

testSuperadminLogin();
