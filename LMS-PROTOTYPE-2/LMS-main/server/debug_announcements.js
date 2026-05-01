const axios = require('axios');

async function debugAnnouncements() {
  console.log('🔍 Debugging announcements endpoint...\n');
  
  try {
    // Login first
    console.log('🔐 Logging in...');
    const loginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'abhishek@core5.co.in',
      password: 'O#P$0A@7THQW'
    });
    
    console.log('✅ Login successful');
    const token = loginRes.data.token;
    console.log('👤 User:', loginRes.data.user);
    
    // Test announcements with detailed error logging
    console.log('\n🔍 Testing announcements with detailed logging...');
    
    try {
      const response = await axios.get('http://127.0.0.1:5002/api/announcements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Announcements endpoint working!');
      console.log('📊 Response:', response.data);
      
    } catch (error) {
      console.log('❌ Announcements error details:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Error:', error.message);
      
      if (error.response && error.response.status === 500) {
        console.log('🔍 This is a server error - checking server logs...');
        
        // Try to get more error details
        if (error.response.data && error.response.data.stack) {
          console.log('   Stack trace:', error.response.data.stack);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
  }
}

debugAnnouncements();
