const axios = require('axios');

async function debugUserObject() {
  console.log('🔍 Debugging User Object...\n');
  
  try {
    // Login as Admin
    console.log('🔐 Login as Admin...');
    const adminLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'abhishek@core5.co.in',
      password: 'O#P$0A@7THQW'
    });
    
    if (adminLogin.status === 200) {
      console.log('✅ Admin login successful');
      console.log('📊 User Object Structure:');
      console.log(JSON.stringify(adminLogin.data.user, null, 2));
      
      const user = adminLogin.data.user;
      console.log('\n🔍 Checking university ID fields:');
      console.log('   - university_id:', user.university_id);
      console.log('   - universityId:', user.universityId);
      console.log('   - university:', user.university);
      console.log('   - All keys:', Object.keys(user));
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugUserObject();
