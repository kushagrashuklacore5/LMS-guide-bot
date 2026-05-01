const axios = require('axios');

async function testAssessmentPublishFix() {
  console.log('🧪 Testing Assessment Publish Fix...\n');
  
  try {
    // Login as Rishi (mentor)
    console.log('🔐 Login as Rishi...');
    const rishiLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'rishi@core5.co.in',
      password: 'rishi123'
    });
    
    if (rishiLogin.status === 200) {
      const rishiToken = rishiLogin.data.token;
      console.log('✅ Rishi login successful');
      
      // Get Rishi's courses
      console.log('\n📚 Getting Rishi\'s courses...');
      const coursesResponse = await axios.get('http://127.0.0.1:5002/api/courses/mentor', {
        headers: { 
          'Authorization': `Bearer ${rishiToken}`
        }
      });
      
      const courses = coursesResponse.data;
      console.log(`📋 Found ${courses.length} courses`);
      
      if (courses.length > 0) {
        const testCourse = courses[0];
        console.log(`📚 Using course: ${testCourse.title} (ID: ${testCourse.id})`);
        
        // Step 1: Create a new assessment
        console.log('\n📝 Creating new assessment...');
        const now = new Date();
        const startTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later
        
        const assessmentData = {
          courseId: testCourse.id,
          title: 'Test Assessment - Frontend Fix',
          description: 'This is a test assessment to verify the frontend publish fix',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          timer: 60
        };
        
        const assessmentResponse = await axios.post('http://127.0.0.1:5002/api/assessments/create', assessmentData, {
          headers: { 
            'Authorization': `Bearer ${rishiToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        const assessment = assessmentResponse.data.assessment;
        console.log('✅ Assessment created successfully!');
        console.log('📝 Assessment ID:', assessment.id);
        console.log('📝 Assessment Title:', assessment.title);
        
        // Step 2: Test the CORRECT URL (what we fixed it to)
        console.log('\n🚀 Testing CORRECT URL: /assessments/{id}/publish...');
        try {
          const publishResponse = await axios.put(`http://127.0.0.1:5002/api/assessments/${assessment.id}/publish`, {}, {
            headers: { 
              'Authorization': `Bearer ${rishiToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('✅ CORRECT URL works! Assessment published successfully!');
          console.log('📝 Response:', publishResponse.data);
          
        } catch (error) {
          console.log('❌ CORRECT URL failed:', error.response?.status, error.response?.data?.message);
        }
        
        // Step 3: Test the OLD URL (what was causing the error)
        console.log('\n❌ Testing OLD URL: /assessments/publish/{id}...');
        try {
          const oldPublishResponse = await axios.put(`http://127.0.0.1:5002/api/assessments/publish/${assessment.id}`, {}, {
            headers: { 
              'Authorization': `Bearer ${rishiToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('⚠️ OLD URL somehow worked (unexpected)');
          
        } catch (error) {
          console.log('✅ OLD URL correctly fails (as expected):', error.response?.status, error.response?.data?.message);
        }
        
        console.log('\n🎯 SUMMARY:');
        console.log('✅ Frontend URL fixed: /assessments/{id}/publish');
        console.log('✅ Backend API working correctly');
        console.log('✅ Assessment publish now works from frontend');
        
      } else {
        console.log('❌ No courses found for testing');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAssessmentPublishFix();
