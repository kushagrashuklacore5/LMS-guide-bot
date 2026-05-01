const axios = require('axios');

async function testAdminDashboard() {
  console.log('🧪 Testing admin dashboard endpoint...\n');
  
  try {
    // Login first
    console.log('🔐 Logging in as admin...');
    const loginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'abhishek@core5.co.in',
      password: 'O#P$0A@7THQW'
    });
    
    console.log('✅ Login successful');
    const token = loginRes.data.token;
    console.log('👤 User:', loginRes.data.user);
    
    // Test admin dashboard
    console.log('\n🔍 Testing admin dashboard endpoint...');
    
    try {
      const response = await axios.get('http://127.0.0.1:5002/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Admin dashboard endpoint working!');
      console.log('📊 Response:', response.data);
      
      if (response.data && typeof response.data === 'object') {
        console.log('📊 Dashboard data keys:', Object.keys(response.data));
        
        if (response.data.userStats) {
          console.log('📊 User statistics:', response.data.userStats);
        }
        if (response.data.courseStats) {
          console.log('📊 Course statistics:', response.data.courseStats);
        }
        if (response.data.paymentStats) {
          console.log('📊 Payment statistics:', response.data.paymentStats);
        }
        if (response.data.recentUsers) {
          console.log('📊 Recent users:', response.data.recentUsers.length, 'users');
        }
      }
      
    } catch (error) {
      console.log('❌ Admin dashboard error details:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Error:', error.message);
      
      if (error.response && error.response.status === 500) {
        console.log('🔍 This is a server error - checking for database issues...');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminDashboard();
