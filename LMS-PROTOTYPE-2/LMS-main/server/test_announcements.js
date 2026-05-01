const axios = require('axios');

async function testAnnouncements() {
  console.log('🧪 Testing announcements endpoint...\n');
  
  try {
    // Test without authentication (should fail with 401)
    console.log('🔍 Testing without authentication...');
    
    try {
      const response = await axios.get('http://127.0.0.1:5002/api/announcements');
      console.log('✅ Unexpected success without auth:', response.data);
    } catch (error) {
      console.log('❌ Expected failure without auth:', error.response?.status, error.response?.data?.message);
    }
    
    // Test with authentication (should work)
    console.log('\n🔐 Testing with authentication...');
    
    // First login to get token
    const loginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'abhishek@core5.co.in',
      password: 'O#P$0A@7THQW'
    });
    
    console.log('✅ Login successful');
    const token = loginRes.data.token;
    console.log('👤 User:', loginRes.data.user);
    
    // Now test announcements with token
    const announcementsRes = await axios.get('http://127.0.0.1:5002/api/announcements', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Announcements endpoint working!');
    console.log('📊 Response:', announcementsRes.data);
    
    if (announcementsRes.data.announcements) {
      console.log(`📢 Found ${announcementsRes.data.announcements.length} announcements`);
      announcementsRes.data.announcements.forEach((ann, index) => {
        console.log(`   ${index + 1}. ${ann.title} - ${ann.publishFor || 'course-specific'}`);
      });
    } else {
      console.log('📢 No announcements found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
    }
  }
}

testAnnouncements();
