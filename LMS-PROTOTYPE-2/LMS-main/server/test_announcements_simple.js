const axios = require('axios');

async function testAnnouncementsSimple() {
  console.log('🧪 Testing announcements endpoint (simple version)...\n');
  
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
    
    // Test announcements with simple response
    console.log('\n🔍 Testing announcements with simple response...');
    
    try {
      const response = await axios.get('http://127.0.0.1:5002/api/announcements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Announcements endpoint working!');
      console.log('📊 Response:', response.data);
      
      if (response.data && response.data.announcements) {
        console.log(`📢 Found ${response.data.announcements.length} announcements`);
        response.data.announcements.forEach((ann, index) => {
          console.log(`   ${index + 1}. ${ann.title} - ${ann.publishFor || 'course-specific'}`);
        });
      } else {
        console.log('📢 No announcements found');
      }
      
    } catch (error) {
      console.log('❌ Announcements error details:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Error:', error.message);
      
      // Try to get the raw response
      if (error.response) {
        console.log('🔍 Raw response:', error.response.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Simple test failed:', error.message);
  }
}

testAnnouncementsSimple();
