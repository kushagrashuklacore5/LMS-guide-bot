const axios = require('axios');

async function testAssessmentPublish() {
  console.log('🧪 Testing Assessment Publish Function...\n');
  
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
          title: 'Test Assessment for Publish',
          description: 'This is a test assessment to verify publish functionality',
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
        console.log('📝 Current Status:', assessment.isPublished ? 'Published' : 'Draft');
        
        // Step 2: Try to publish the assessment
        console.log('\n🚀 Attempting to publish assessment...');
        try {
          const publishResponse = await axios.put(`http://127.0.0.1:5002/api/assessments/${assessment.id}/publish`, {}, {
            headers: { 
              'Authorization': `Bearer ${rishiToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('✅ Assessment published successfully!');
          console.log('📝 Response:', publishResponse.data);
          
          // Step 3: Verify the assessment is published
          console.log('\n🔍 Verifying assessment is published...');
          const verifyResponse = await axios.get(`http://127.0.0.1:5002/api/assessments/course/${testCourse.id}`, {
            headers: { 
              'Authorization': `Bearer ${rishiToken}`
            }
          });
          
          const publishedAssessment = verifyResponse.data.find(a => a.id === assessment.id);
          if (publishedAssessment) {
            console.log('📝 Assessment Status after publish:', publishedAssessment.isPublished ? 'Published' : 'Draft');
          }
          
        } catch (error) {
          console.log('❌ Publish failed:', error.response?.status);
          console.log('❌ Error message:', error.response?.data?.message);
          
          // Debug: Check if assessment still exists
          try {
            const checkResponse = await axios.get(`http://127.0.0.1:5002/api/assessments/course/${testCourse.id}`, {
              headers: { 
                'Authorization': `Bearer ${rishiToken}`
              }
            });
            
            const existingAssessment = checkResponse.data.find(a => a.id === assessment.id);
            if (existingAssessment) {
              console.log('📝 Assessment still exists:', existingAssessment.title);
              console.log('📝 Current isPublished value:', existingAssessment.isPublished);
            } else {
              console.log('❌ Assessment not found after publish attempt');
            }
          } catch (checkError) {
            console.log('❌ Could not verify assessment status');
          }
        }
        
      } else {
        console.log('❌ No courses found for testing');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAssessmentPublish();
