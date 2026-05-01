const axios = require('axios');

async function testFrontendAnnouncements() {
  console.log('🧪 Testing frontend announcements endpoint...\n');
  
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
    
    // Test announcements with proper headers (like frontend)
    console.log('\n🔍 Testing announcements with frontend-like headers...');
    
    try {
      const response = await axios.get('http://127.0.0.1:5002/api/announcements', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Announcements endpoint working!');
      console.log('📊 Response:', response.data);
      
      if (Array.isArray(response.data)) {
        console.log(`📢 Found ${response.data.length} announcements`);
        if (response.data.length > 0) {
          response.data.forEach((ann, index) => {
            console.log(`   ${index + 1}. ${ann.title} - ${ann.publishFor || 'course-specific'}`);
          });
        } else {
          console.log('📢 No announcements found (empty array returned)');
        }
      } else {
        console.log('📊 Response format:', typeof response.data);
        console.log('📊 Response keys:', Object.keys(response.data));
      }
      
      console.log('\n✅ FRONTEND ANNOUNCEMENTS ISSUE FIXED!');
      console.log('💡 The AnnouncementBell component should now work properly');
      console.log('💡 No more 500 Internal Server Error');
      
    } catch (error) {
      console.log('❌ Announcements error details:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Frontend test failed:', error.message);
  }
}

testFrontendAnnouncements();
