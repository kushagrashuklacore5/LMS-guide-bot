const axios = require('axios');

async function testUserRole() {
  console.log('🧪 Testing user role and available endpoints...\n');
  
  try {
    // Login as the user
    console.log('🔐 Logging in...');
    const loginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'abhishek@core5.co.in',
      password: 'O#P$0A@7THQW'
    });
    
    console.log('✅ Login successful');
    const token = loginRes.data.token;
    const user = loginRes.data.user;
    
    console.log('👤 User info:');
    console.log('   ID:', user.id);
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   University ID:', user.universityId);
    
    // Test different endpoints
    console.log('\n🔍 Testing /api/admin/users (admin only)');
    try {
      const adminUsersRes = await axios.get('http://127.0.0.1:5002/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ /api/admin/users works:', adminUsersRes.status);
      console.log('📊 Data:', adminUsers.data);
    } catch (error) {
      console.log('❌ /api/admin/users failed:', error.response?.status, error.response?.data?.message);
    }
    
    console.log('\n🔍 Testing /api/users/mentors (mentor/admin only)');
    try {
      const mentorsRes = await axios.get('http://127.0.0.1:5002/api/users/mentors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ /api/users/mentors works:', mentorsRes.status);
      console.log('📊 Data:', mentorsRes.data);
    } catch (error) {
      console.log('❌ /api/users/mentors failed:', error.response?.status, error.response?.data?.message);
    }
    
    console.log('\n🔍 Testing /api/users/students (mentor/admin only)');
    try {
      const studentsRes = await axios.get('http://127.0.0.1:5002/api/users/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ /api/users/students works:', studentsRes.status);
      console.log('📊 Data:', studentsRes.data);
    } catch (error) {
      console.log('❌ /api/users/students failed:', error.response?.status, error.response?.data?.message);
    }
    
    console.log('\n🔍 Testing /api/users/mentors-simple (admin only)');
    try {
      const mentorsSimpleRes = await axios.get('http://127.0.0.1:5002/api/users/mentors-simple', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ /api/users/mentors-simple works:', mentorsSimpleRes.status);
      console.log('📊 Data:', mentorsSimpleRes.data);
    } catch (error) {
      console.log('❌ /api/users/mentors-simple failed:', error.response?.status, error.response?.data?.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUserRole();
