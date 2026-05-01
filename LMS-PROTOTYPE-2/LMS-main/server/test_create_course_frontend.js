const axios = require('axios');

async function testCreateCourseFrontend() {
  console.log('🧪 Testing Create Course Frontend Flow...\n');
  
  try {
    // Login as mentor
    console.log('🔐 Login as mentor...');
    const mentorLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'debugmentor@pro.com',
      password: 'jp08qyud'
    });
    
    if (mentorLogin.status === 200) {
      const mentorToken = mentorLogin.data.token;
      console.log('✅ Mentor login successful');
      
      // Test course creation with frontend-like data
      console.log('\n📚 Testing course creation with frontend data...');
      try {
        const courseData = {
          title: 'Frontend Test Course',
          description: 'This is a test course from frontend simulation',
          category: 'Science',
          duration: '30',
          mentorId: '34', // Mentor ID
          studentIds: ['28', '30'], // Student IDs
          classroomId: '4' // Classroom ID
        };
        
        console.log('📋 Course data being sent:', courseData);
        
        const courseResponse = await axios.post('http://127.0.0.1:5002/api/courses/create-course', courseData, {
          headers: { 
            'Authorization': `Bearer ${mentorToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Course creation successful!');
        console.log('📊 Status:', courseResponse.status);
        console.log('📋 Response:', courseResponse.data);
        
      } catch (error) {
        console.log('❌ Course creation failed:', error.response?.status);
        if (error.response?.data) {
          console.log('🔍 Error message:', error.response.data.message);
          console.log('🔍 Full error data:', error.response.data);
        }
        console.log('🔍 Error stack:', error.stack);
      }
      
    } else {
      console.log('❌ Mentor login failed:', mentorLogin.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCreateCourseFrontend();
