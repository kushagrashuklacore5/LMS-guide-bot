const axios = require('axios');

async function testDirectFeatures() {
  console.log('🧪 Testing Direct Feature Access...\n');
  
  try {
    // Login as Rishi (Free Plan User)
    console.log('🔐 Login as Rishi...');
    const rishiLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'rishi@core5.co.in',
      password: 'rishi123'
    });
    
    if (rishiLogin.status === 200) {
      const rishiToken = rishiLogin.data.token;
      console.log('✅ Rishi login successful');
      
      // Test 1: Calendar Access
      console.log('\n📅 Testing Calendar Access...');
      try {
        const calendarResponse = await axios.get('http://127.0.0.1:5002/api/calendar/events', {
          headers: { 
            'Authorization': `Bearer ${rishiToken}`
          }
        });
        console.log('✅ Calendar Access: Working (Status:', calendarResponse.status, ')');
      } catch (error) {
        console.log('❌ Calendar Access:', error.response?.status, error.response?.data?.message);
      }
      
      // Test 2: Data Export Access
      console.log('\n📤 Testing Data Export Access...');
      try {
        const exportResponse = await axios.get('http://127.0.0.1:5002/api/export/database', {
          headers: { 
            'Authorization': `Bearer ${rishiToken}`
          }
        });
        console.log('✅ Data Export Access: Working (Status:', exportResponse.status, ')');
      } catch (error) {
        console.log('❌ Data Export Access:', error.response?.status, error.response?.data?.message);
      }
      
      // Test 3: Create Assessment
      console.log('\n📝 Testing Assessment Creation...');
      const coursesResponse = await axios.get('http://127.0.0.1:5002/api/courses/mentor', {
        headers: { 
          'Authorization': `Bearer ${rishiToken}`
        }
      });
      
      if (coursesResponse.data.length > 0) {
        const testCourse = coursesResponse.data[0];
        const now = new Date();
        const startTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        
        try {
          const assessmentResponse = await axios.post('http://127.0.0.1:5002/api/assessments/create', {
            courseId: testCourse.id,
            title: 'Free Plan Assessment Test',
            description: 'Testing assessment creation in free plan',
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            timer: 60
          }, {
            headers: { 
              'Authorization': `Bearer ${rishiToken}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('✅ Assessment Creation: Working (Status:', assessmentResponse.status, ')');
        } catch (error) {
          console.log('❌ Assessment Creation:', error.response?.status, error.response?.data?.message);
        }
        
        // Test 4: Create Live Class
        console.log('\n🎥 Testing Live Class Creation...');
        try {
          const liveClassResponse = await axios.post('http://127.0.0.1:5002/api/live-classes', {
            courseId: testCourse.id,
            title: 'Free Plan Live Class Test',
            description: 'Testing live class creation in free plan',
            scheduledStartTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            scheduledEndTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
            duration: 60,
            platform: 'jitsi'
          }, {
            headers: { 
              'Authorization': `Bearer ${rishiToken}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('✅ Live Class Creation: Working (Status:', liveClassResponse.status, ')');
        } catch (error) {
          console.log('❌ Live Class Creation:', error.response?.status, error.response?.data?.message);
        }
        
        // Test 5: Create More Courses
        console.log('\n📚 Testing Unlimited Course Creation...');
        try {
          const courseResponse = await axios.post('http://127.0.0.1:5002/api/courses/create-course', {
            title: 'Free Plan Unlimited Course Test',
            description: 'Testing unlimited course creation',
            category: 'Test',
            duration: '30',
            mentorId: '31',
            studentIds: ['30'],
            classroomId: '4'
          }, {
            headers: { 
              'Authorization': `Bearer ${rishiToken}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('✅ Course Creation: Working (Status:', courseResponse.status, ')');
        } catch (error) {
          console.log('❌ Course Creation:', error.response?.status, error.response?.data?.message);
        }
        
        // Test 6: Upload Material
        console.log('\n📄 Testing Material Upload...');
        try {
          const materialResponse = await axios.post('http://127.0.0.1:5002/api/materials/upload', {
            courseId: testCourse.id,
            title: 'Free Plan Material Test',
            type: 'video_link',
            linkUrl: 'https://www.youtube.com/watch?v=test',
            description: 'Testing material upload in free plan'
          }, {
            headers: { 
              'Authorization': `Bearer ${rishiToken}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('✅ Material Upload: Working (Status:', materialResponse.status, ')');
        } catch (error) {
          console.log('❌ Material Upload:', error.response?.status, error.response?.data?.message);
        }
        
      } else {
        console.log('❌ No courses found for testing');
      }
      
      console.log('\n🎯 FEATURE ACCESS TEST COMPLETE');
      console.log('📋 All features should now be accessible in free plan');
      console.log('🚫 No more "feature restricted" popups should appear');
      
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDirectFeatures();
