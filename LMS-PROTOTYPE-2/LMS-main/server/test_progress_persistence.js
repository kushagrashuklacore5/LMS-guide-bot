const axios = require('axios');

async function testProgressPersistence() {
  console.log('🧪 Testing Progress Persistence...\n');
  
  try {
    // Login as Rashmi (student)
    console.log('🔐 Login as Rashmi...');
    const rashmiLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'rashmi.shetty@core5.co.in',
      password: 'rashmi123'
    });
    
    if (rashmiLogin.status === 200) {
      const rashmiToken = rashmiLogin.data.token;
      console.log('✅ Rashmi login successful');
      
      // Get Rashmi's courses
      console.log('\n📚 Getting Rashmi\'s courses...');
      const coursesResponse = await axios.get('http://127.0.0.1:5002/api/courses/student', {
        headers: { 
          'Authorization': `Bearer ${rashmiToken}`
        }
      });
      
      const courses = coursesResponse.data;
      console.log(`📋 Found ${courses.length} courses`);
      
      if (courses.length > 0) {
        const testCourse = courses.find(c => c.title && c.title.includes('Mathematics Fundamentals'));
        if (testCourse) {
          console.log(`📚 Using course: ${testCourse.title} (ID: ${testCourse.id})`);
          
          // Get materials for this course
          console.log('\n📄 Getting course materials...');
          try {
            const materialsResponse = await axios.get(`http://127.0.0.1:5002/api/materials/course/${testCourse.id}`, {
              headers: { 
                'Authorization': `Bearer ${rashmiToken}`
              }
            });
            
            const materials = materialsResponse.data;
            console.log(`📋 Found ${materials.length} materials`);
            
            if (materials.length > 0) {
              const testMaterial = materials[0];
              console.log(`📄 Using material: ${testMaterial.title} (ID: ${testMaterial.id})`);
              
              // Step 1: Check current progress
              console.log('\n🔍 Checking current progress...');
              try {
                const progressResponse = await axios.get(`http://127.0.0.1:5002/api/progress/${testCourse.id}`, {
                  headers: { 
                    'Authorization': `Bearer ${rashmiToken}`
                  }
                });
                
                const progress = progressResponse.data;
                console.log('📊 Current progress data:');
                console.log('   - Total materials:', progress.totalMaterials || 0);
                console.log('   - Completed materials:', progress.completedMaterials || 0);
                console.log('   - Materials progress:', progress.materialsProgress || []);
                
                // Check if material is already completed
                const existingProgress = progress.materialsProgress?.find(p => p.contentId == testMaterial.id);
                if (existingProgress && existingProgress.completed) {
                  console.log('✅ Material is already marked as completed');
                } else {
                  console.log('📝 Material is not completed yet');
                  
                  // Step 2: Mark material as complete
                  console.log('\n✅ Marking material as complete...');
                  try {
                    const markCompleteResponse = await axios.post('http://127.0.0.1:5002/api/progress/mark-content-completed', {
                      contentId: testMaterial.id,
                      contentType: 'material',
                      courseId: testCourse.id
                    }, {
                      headers: { 
                        'Authorization': `Bearer ${rashmiToken}`,
                        'Content-Type': 'application/json'
                      }
                    });
                    
                    console.log('✅ Material marked as complete!');
                    console.log('📝 Response:', markCompleteResponse.data);
                    
                    // Step 3: Verify progress is saved
                    console.log('\n🔍 Verifying progress is saved...');
                    setTimeout(async () => {
                      try {
                        const verifyProgressResponse = await axios.get(`http://127.0.0.1:5002/api/progress/${testCourse.id}`, {
                          headers: { 
                            'Authorization': `Bearer ${rashmiToken}`
                          }
                        });
                        
                        const verifyProgress = verifyProgressResponse.data;
                        console.log('📊 Updated progress data:');
                        console.log('   - Total materials:', verifyProgress.totalMaterials || 0);
                        console.log('   - Completed materials:', verifyProgress.completedMaterials || 0);
                        console.log('   - Materials progress:', verifyProgress.materialsProgress || []);
                        
                        const updatedProgress = verifyProgress.materialsProgress?.find(p => p.contentId == testMaterial.id);
                        if (updatedProgress && updatedProgress.completed) {
                          console.log('✅ SUCCESS: Material completion is persisted in database!');
                          console.log('🎯 The completion will survive page reloads.');
                        } else {
                          console.log('❌ FAILURE: Material completion not saved properly');
                        }
                        
                      } catch (verifyError) {
                        console.log('❌ Error verifying progress:', verifyError.response?.data?.message);
                      }
                    }, 1000);
                    
                  } catch (markError) {
                    console.log('❌ Error marking material complete:', markError.response?.status, markError.response?.data?.message);
                  }
                }
                
              } catch (progressError) {
                console.log('❌ Error getting progress:', progressError.response?.status, progressError.response?.data?.message);
              }
            } else {
              console.log('❌ No materials found in this course');
            }
          } catch (materialsError) {
            console.log('❌ Error getting materials:', materialsError.response?.status, materialsError.response?.data?.message);
          }
        } else {
          console.log('❌ No Mathematics Fundamentals course found');
        }
      } else {
        console.log('❌ No courses found for testing');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProgressPersistence();
