const axios = require('axios');

async function testMentorClassrooms() {
  console.log('🧪 Testing Mentor Classrooms API...\n');
  
  try {
    // Login as mentor
    console.log('🔐 Login as mentor...');
    const mentorLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'debugmentor@pro.com',
      password: 'jp08qyud'
    });
    
    if (mentorLogin.status === 200) {
      const mentorToken = mentorLogin.data.token;
      const mentorUser = mentorLogin.data.user;
      
      console.log('✅ Mentor login successful');
      console.log('👤 Mentor User:', mentorUser);
      console.log('🔍 Mentor ID:', mentorUser.id);
      console.log('🔍 Mentor userId:', mentorUser.userId);
      
      // Test mentor classrooms endpoint
      console.log('\n📚 Testing GET /api/classrooms/my-classrooms...');
      try {
        const classroomsResponse = await axios.get('http://127.0.0.1:5002/api/classrooms/my-classrooms', {
          headers: { 'Authorization': `Bearer ${mentorToken}` }
        });
        
        console.log('✅ Mentor classrooms API working!');
        console.log('📊 Status:', classroomsResponse.status);
        console.log('📋 Response:', classroomsResponse.data);
        console.log('📚 Classrooms found:', classroomsResponse.data.data?.length || 0);
        
        if (classroomsResponse.data.data) {
          classroomsResponse.data.data.forEach((classroom, i) => {
            console.log(`   ${i+1}. ${classroom.name} - Grade: ${classroom.grade} - Section: ${classroom.section}`);
          });
        }
        
      } catch (error) {
        console.log('❌ Mentor classrooms failed:', error.response?.status, error.response?.data?.message);
        if (error.response?.status === 500) {
          console.log('🔍 This is a server error - check backend logs');
        }
      }
      
    } else {
      console.log('❌ Mentor login failed:', mentorLogin.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMentorClassrooms();
