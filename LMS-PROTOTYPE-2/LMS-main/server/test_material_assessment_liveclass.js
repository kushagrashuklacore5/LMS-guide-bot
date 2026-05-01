const axios = require('axios');

async function testMaterialAssessmentLiveClass() {
  console.log('🧪 Testing Material, Assessment, and Live Class Features...\n');
  
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
        
        // Test 1: Add Material
        console.log('\n📄 Testing Material Upload...');
        try {
          const materialData = {
            courseId: testCourse.id,
            title: 'Test Material - Mathematics Basics',
            type: 'video_link',
            linkUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            description: 'This is a test material for mathematics basics'
          };
          
          const materialResponse = await axios.post('http://127.0.0.1:5002/api/materials/upload', materialData, {
            headers: { 
              'Authorization': `Bearer ${rishiToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('✅ Material created successfully!');
          console.log('📄 Material ID:', materialResponse.data.material.id);
          console.log('📄 Material Title:', materialResponse.data.material.title);
          
        } catch (error) {
          console.log('❌ Material creation failed:', error.response?.status, error.response?.data?.message);
        }
        
        // Test 2: Create Assessment
        console.log('\n📝 Testing Assessment Creation...');
        try {
          const now = new Date();
          const startTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
          const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later
          
          const assessmentData = {
            courseId: testCourse.id,
            title: 'Mathematics Assessment - Chapter 1',
            description: 'Test your knowledge of basic mathematics concepts',
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
          
          console.log('✅ Assessment created successfully!');
          console.log('📝 Assessment ID:', assessmentResponse.data.assessment.id);
          console.log('📝 Assessment Title:', assessmentResponse.data.assessment.title);
          
        } catch (error) {
          console.log('❌ Assessment creation failed:', error.response?.status, error.response?.data?.message);
        }
        
        // Test 3: Create Live Class
        console.log('\n🎥 Testing Live Class Creation...');
        try {
          const now = new Date();
          const startTime = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // Day after tomorrow
          const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later
          
          const liveClassData = {
            courseId: testCourse.id,
            title: 'Live Class - Mathematics Problem Solving',
            description: 'Interactive session for solving mathematics problems',
            scheduledStartTime: startTime.toISOString(),
            scheduledEndTime: endTime.toISOString(),
            duration: 60,
            platform: 'jitsi'
          };
          
          const liveClassResponse = await axios.post('http://127.0.0.1:5002/api/live-classes', liveClassData, {
            headers: { 
              'Authorization': `Bearer ${rishiToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('✅ Live class created successfully!');
          console.log('🎥 Live Class ID:', liveClassResponse.data.liveClass.id);
          console.log('🎥 Live Class Title:', liveClassResponse.data.liveClass.title);
          console.log('🎥 Meeting Link:', liveClassResponse.data.liveClass.meetingLink);
          
        } catch (error) {
          console.log('❌ Live class creation failed:', error.response?.status, error.response?.data?.message);
        }
        
        // Test 4: Verify Student Access
        console.log('\n👩‍🎓 Testing Student Access...');
        try {
          // Login as Rashmi
          const rashmiLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
            email: 'rashmi.shetty@core5.co.in',
            password: 'rashmi123'
          });
          
          if (rashmiLogin.status === 200) {
            const rashmiToken = rashmiLogin.data.token;
            console.log('✅ Rashmi login successful');
            
            // Check if Rashmi can access the course materials
            try {
              const materialsResponse = await axios.get(`http://127.0.0.1:5002/api/materials/course/${testCourse.id}`, {
                headers: { 
                  'Authorization': `Bearer ${rashmiToken}`
                }
              });
              
              console.log(`✅ Rashmi can access ${materialsResponse.data.length} materials`);
              materialsResponse.data.forEach(material => {
                console.log(`   📄 ${material.title}`);
              });
            } catch (error) {
              console.log('❌ Rashmi cannot access materials:', error.response?.data?.message);
            }
            
            // Check if Rashmi can access assessments
            try {
              const assessmentsResponse = await axios.get(`http://127.0.0.1:5002/api/assessments/course/${testCourse.id}`, {
                headers: { 
                  'Authorization': `Bearer ${rashmiToken}`
                }
              });
              
              console.log(`✅ Rashmi can access ${assessmentsResponse.data.length} assessments`);
              assessmentsResponse.data.forEach(assessment => {
                console.log(`   📝 ${assessment.title}`);
              });
            } catch (error) {
              console.log('❌ Rashmi cannot access assessments:', error.response?.data?.message);
            }
            
            // Check if Rashmi can access live classes
            try {
              const liveClassesResponse = await axios.get(`http://127.0.0.1:5002/api/live-classes/course/${testCourse.id}`, {
                headers: { 
                  'Authorization': `Bearer ${rashmiToken}`
                }
              });
              
              console.log(`✅ Rashmi can access ${liveClassesResponse.data.length} live classes`);
              liveClassesResponse.data.forEach(liveClass => {
                console.log(`   🎥 ${liveClass.title} (${liveClass.status})`);
              });
            } catch (error) {
              console.log('❌ Rashmi cannot access live classes:', error.response?.data?.message);
            }
          }
        } catch (error) {
          console.log('❌ Rashmi login failed:', error.response?.data?.message);
        }
      } else {
        console.log('❌ No courses found for testing');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMaterialAssessmentLiveClass();
