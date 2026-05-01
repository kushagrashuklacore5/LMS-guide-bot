const axios = require('axios');

async function testAllStorekeeperSections() {
  console.log('🧪 Testing All Storekeeper Portal Sections...\n');
  
  try {
    // Login
    const login = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'storekeeper@core5.co.in',
      password: 'storekeeper123'
    });
    
    if (login.status === 200) {
      const token = login.data.token;
      console.log('✅ Login successful');
      
      // Test all APIs
      const tests = [
        { name: 'Inventory', url: '/api/storekeeper/inventory' },
        { name: 'Vendors', url: '/api/storekeeper/vendors' },
        { name: 'Vendor Stock', url: '/api/storekeeper/vendor-stock' },
        { name: 'Requirements', url: '/api/requirements' }
      ];
      
      for (const test of tests) {
        try {
          const response = await axios.get(`http://127.0.0.1:5002${test.url}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log(`✅ ${test.name}: ${response.status} - ${response.data?.data?.length || response.data?.length || 0} items`);
        } catch (error) {
          console.log(`❌ ${test.name}: ${error.response?.status || 'NETWORK_ERROR'} - ${error.response?.data?.message || error.message}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAllStorekeeperSections();
