const axios = require('axios');

async function testStudentClassrooms() {
  console.log('🧪 Testing Student Classrooms API...\n');
  
  try {
    // Login as student
    console.log('🔐 Login as student...');
    const studentLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'newteststudent@example.com',
      password: 'tj843ikq'
    });
    
    if (studentLogin.status === 200) {
      const studentToken = studentLogin.data.token;
      const studentUser = studentLogin.data.user;
      
      console.log('✅ Student login successful');
      console.log('👤 Student User:', studentUser);
      console.log('🔍 Student ID:', studentUser.id);
      console.log('🔍 Student userId:', studentUser.userId);
      
      // Test student classrooms endpoint
      console.log('\n📚 Testing GET /api/classrooms/student-classrooms...');
      try {
        const classroomsResponse = await axios.get('http://127.0.0.1:5002/api/classrooms/student-classrooms', {
          headers: { 'Authorization': `Bearer ${studentToken}` }
        });
        
        console.log('✅ Student classrooms API working!');
        console.log('📊 Status:', classroomsResponse.status);
        console.log('📋 Response:', classroomsResponse.data);
        console.log('📚 Classrooms found:', classroomsResponse.data?.length || 0);
        
        if (classroomsResponse.data && classroomsResponse.data.length > 0) {
          classroomsResponse.data.forEach((classroom, i) => {
            console.log(`   ${i+1}. ${classroom.name} - Grade: ${classroom.grade} - Section: ${classroom.section}`);
          });
        }
        
      } catch (error) {
        console.log('❌ Student classrooms failed:', error.response?.status, error.response?.data?.message);
        if (error.response?.status === 500) {
          console.log('🔍 This is a server error - check backend logs');
        }
      }
      
    } else {
      console.log('❌ Student login failed:', studentLogin.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testStudentClassrooms();
