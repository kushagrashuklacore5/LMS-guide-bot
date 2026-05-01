const axios = require('axios');

async function debugAnnouncementCreation() {
  console.log('🔍 Debugging Announcement Creation...\n');
  
  try {
    // Login as Admin
    console.log('🔐 Login as Admin...');
    const adminLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'abhishek@core5.co.in',
      password: 'O#P$0A@7THQW'
    });
    
    if (adminLogin.status === 200) {
      const adminToken = adminLogin.data.token;
      console.log('✅ Admin login successful');
      console.log('   - User ID:', adminLogin.data.user.id);
      console.log('   - Role:', adminLogin.data.user.role);
      console.log('   - University ID:', adminLogin.data.user.university_id);
      
      // Try to create announcement with minimal data
      console.log('\n📝 Creating announcement...');
      try {
        const response = await axios.post('http://127.0.0.1:5002/api/announcements', {
          title: 'Debug Test Announcement',
          message: 'This is a debug test announcement',
          publishFor: 'students'
        }, {
          headers: { 
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Announcement created:', response.data);
        
      } catch (error) {
        console.log('❌ Announcement creation failed:');
        console.log('   - Status:', error.response?.status);
        console.log('   - Message:', error.response?.data?.message);
        console.log('   - Full error:', JSON.stringify(error.response?.data, null, 2));
        
        // Check if it's a validation error
        if (error.response?.status === 400) {
          console.log('   - This is a validation error, checking required fields...');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugAnnouncementCreation();
