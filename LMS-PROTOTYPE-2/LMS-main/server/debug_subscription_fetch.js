const axios = require('axios');

async function debugSubscriptionFetch() {
  console.log('🔍 Debugging subscription fetch...\n');
  
  try {
    // Login first
    const loginRes = await axios.post('http://127.0.0.1:5002/api/superadmin/login', {
      email: 'superadmin@test.com',
      password: '12345678'
    });
    
    const token = loginRes.data.data.accessToken;
    console.log('✅ Logged in');
    
    // Add debug logging to see what's happening
    console.log('📊 Fetching subscription with debug...');
    
    const response = await axios.get('http://127.0.0.1:5002/api/subscriptions/current', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ API Response:', response.data);
    
    // Also test the findSubscriptionById function directly
    console.log('\n🔍 Testing findSubscriptionById directly...');
    
    // Create a mock request object
    const mockReq = {
      tenant: { database: require('./config/database-switch') }
    };
    
    // Import the function
    const { findSubscriptionById } = require('./controllers/subscription-controller');
    
    const subscription = await findSubscriptionById(mockReq, 'superadmin-1');
    console.log('✅ Direct function result:', subscription);
    
  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

debugSubscriptionFetch();
