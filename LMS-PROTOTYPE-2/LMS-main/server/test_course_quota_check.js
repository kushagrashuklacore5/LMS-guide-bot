const axios = require('axios');

async function testCourseQuotaCheck() {
  console.log('🧪 Testing Course Quota Check...\n');
  
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
      
      // Check existing courses in classroom 4
      console.log('\n📚 Checking existing courses in classroom 4...');
      try {
        const coursesResponse = await axios.get('http://127.0.0.1:5002/api/courses/classroom?classroomId=4', {
          headers: { 
            'Authorization': `Bearer ${mentorToken}`
          }
        });
        
        console.log('✅ Courses fetched successfully!');
        console.log('📊 Status:', coursesResponse.status);
        console.log('📋 Existing courses:', coursesResponse.data);
        console.log('📋 Number of courses:', coursesResponse.data.length);
        
      } catch (error) {
        console.log('❌ Failed to fetch courses:', error.response?.status);
        if (error.response?.data) {
          console.log('🔍 Error message:', error.response.data.message);
        }
      }
      
      // Try creating course in a different classroom
      console.log('\n📚 Testing course creation in classroom 1...');
      try {
        const courseData = {
          title: 'Test Course in Classroom 1',
          description: 'This is a test course in classroom 1',
          category: 'Chemistry',
          duration: '30',
          mentorId: '34',
          studentIds: ['28', '30'],
          classroomId: '1' // Different classroom
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
        }
      }
      
    } else {
      console.log('❌ Mentor login failed:', mentorLogin.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCourseQuotaCheck();
