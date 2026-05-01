const axios = require('axios');

async function testWithoutAuth() {
  try {
    console.log('=== Testing API without authentication ===');
    
    // Test health check without auth
    try {
      const response = await axios.get('http://127.0.0.1:5002/api/superadmin/internal/test');
      console.log('Health check response:', response.data);
    } catch (error) {
      console.error('Health check failed:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
  process.exit(0);
}

testWithoutAuth();
