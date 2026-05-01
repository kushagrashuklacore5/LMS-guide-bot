const axios = require('axios');

async function debugCurrentSubscription() {
  console.log('🔍 Debugging getCurrentSubscription...\n');
  
  try {
    // Login first
    const loginRes = await axios.post('http://127.0.0.1:5002/api/superadmin/login', {
      email: 'superadmin@test.com',
      password: '12345678'
    });
    
    const token = loginRes.data.data.accessToken;
    console.log('✅ Logged in');
    
    // Test the getCurrentSubscription endpoint with debug
    console.log('📊 Testing getCurrentSubscription endpoint...');
    
    // Add debug query parameter to trigger logging
    const response = await axios.get('http://127.0.0.1:5002/api/subscriptions/current?debug=true', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ API Response:', response.data);
    
  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

debugCurrentSubscription();
