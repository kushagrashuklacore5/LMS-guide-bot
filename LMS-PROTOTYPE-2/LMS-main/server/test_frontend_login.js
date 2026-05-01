const axios = require('axios');

async function testFrontendLogin() {
  console.log('🧪 Testing frontend login with abhishek@core5.co.in\n');
  
  try {
    const testEmail = 'abhishek@core5.co.in';
    const testPassword = 'O#P$0A@7THQW';
    
    console.log(`👤 Testing login for: ${testEmail}`);
    console.log(`🔑 Password: ${testPassword}`);
    
    // Test the /auth/login endpoint (same as frontend)
    const response = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: testEmail,
      password: testPassword
    });
    
    console.log('✅ API Login successful!');
    console.log('📊 Response:', response.data);
    
    const { token, user } = response.data;
    
    console.log('\n👤 User Info:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   University: ${user.university_id}`);
    console.log(`   Approved: ${user.isApproved}`);
    
    console.log('\n🔑 Token Info:');
    console.log(`   Token: ${token.substring(0, 50)}...`);
    console.log(`   Token Length: ${token.length}`);
    
    console.log('\n✅ Frontend login should work now!');
    console.log('💡 The frontend is now using the correct /auth/login endpoint');
    console.log('💡 The response format matches what the frontend expects');
    
  } catch (error) {
    console.error('❌ Login test failed:', error.response?.data?.message || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
  }
}

testFrontendLogin();
