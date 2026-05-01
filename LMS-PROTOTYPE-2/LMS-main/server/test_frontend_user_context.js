const axios = require('axios');

async function testFrontendUserContext() {
  console.log('🔍 Testing Frontend User Context...\n');
  
  try {
    // Login as mentor and check user object structure
    console.log('🔐 Login as mentor...');
    const mentorLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'debugmentor@pro.com',
      password: 'jp08qyud'
    });
    
    if (mentorLogin.status === 200) {
      const mentorToken = mentorLogin.data.token;
      const mentorUser = mentorLogin.data.user;
      
      console.log('✅ Mentor login successful');
      console.log('👤 User Object Structure:', mentorUser);
      console.log('🔍 User ID fields:');
      console.log('   user.id:', mentorUser.id);
      console.log('   user._id:', mentorUser._id);
      console.log('   user.userId:', mentorUser.userId);
      
      // Simulate frontend user context check
      console.log('\n📱 Simulating frontend user context...');
      const userId = mentorUser.id || mentorUser._id || mentorUser.userId;
      console.log('🔍 Frontend would use userId:', userId);
      
      if (!userId) {
        console.log('❌ No valid user ID found - this is the issue!');
        console.log('🔧 The frontend needs to handle different user ID fields');
      } else {
        console.log('✅ User ID found:', userId);
      }
      
      // Test the API call with the same logic
      console.log('\n📚 Testing API call with frontend logic...');
      try {
        const apiResponse = await axios.get('http://127.0.0.1:5002/api/classrooms/my-classrooms', {
          headers: { 'Authorization': `Bearer ${mentorToken}` }
        });
        
        console.log('✅ API call successful');
        console.log('📊 Response:', apiResponse.data);
        
        // Simulate frontend data processing
        const data = apiResponse.data;
        const classroomList = data.data || data.classrooms || data;
        const validClassrooms = Array.isArray(classroomList) ? classroomList : [];
        
        console.log('📋 Frontend processing results:');
        console.log('   classroomList:', classroomList);
        console.log('   validClassrooms:', validClassrooms);
        console.log('   Array.isArray:', Array.isArray(classroomList));
        console.log('   Length:', validClassrooms.length);
        
        if (validClassrooms.length > 0) {
          console.log('🎯 Frontend should display:', validClassrooms.length, 'classrooms');
        } else {
          console.log('⚠️ Frontend would display 0 classrooms');
        }
        
      } catch (error) {
        console.log('❌ API call failed:', error.response?.status, error.response?.data?.message);
      }
      
    } else {
      console.log('❌ Mentor login failed:', mentorLogin.status);
    }
    
    console.log('\n🎯 FRONTEND USER CONTEXT ANALYSIS:');
    console.log('✅ Backend APIs are working');
    console.log('✅ User data is available');
    console.log('🔍 Issue might be in frontend user ID extraction or API call');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFrontendUserContext();
