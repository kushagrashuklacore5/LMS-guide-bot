const axios = require('axios');

async function testCourseCreation() {
  console.log('🧪 Testing Course Creation API...\n');
  
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
      
      // Test course creation
      console.log('\n📚 Testing course creation...');
      try {
        const courseData = {
          title: 'Test Course from API',
          description: 'This is a test course created via API',
          category: 'Mathematics',
          duration: '40',
          mentorId: '34', // Mentor ID
          studentIds: ['28', '30'], // Student IDs
          classroomId: '4' // Classroom ID
        };
        
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
        console.log('❌ Course creation failed:', error.response?.status, error.response?.data?.message);
        if (error.response?.data?.error) {
          console.log('🔍 Error details:', error.response.data.error);
        }
        if (error.response?.data?.stack) {
          console.log('🔍 Stack trace:', error.response.data.stack);
        }
        console.log('🔍 Full error:', error.response?.data);
      }
      
    } else {
      console.log('❌ Mentor login failed:', mentorLogin.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCourseCreation();
