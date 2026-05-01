const axios = require('axios');

async function testMentorsEndpoint() {
  console.log('🧪 Testing Mentors Endpoint...\n');
  
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
      
      // Test mentors endpoint
      console.log('\n👥 Testing mentors endpoint...');
      try {
        const mentorsResponse = await axios.get('http://127.0.0.1:5002/api/users/mentors', {
          headers: { 
            'Authorization': `Bearer ${mentorToken}`
          }
        });
        
        console.log('✅ Mentors endpoint successful!');
        console.log('📊 Status:', mentorsResponse.status);
        console.log('📋 Mentors data:', mentorsResponse.data);
        console.log('📋 Number of mentors:', Array.isArray(mentorsResponse.data) ? mentorsResponse.data.length : 'Not an array');
        
      } catch (error) {
        console.log('❌ Mentors endpoint failed:', error.response?.status);
        if (error.response?.data) {
          console.log('🔍 Error message:', error.response.data.message);
          console.log('🔍 Full error data:', error.response.data);
        }
      }
      
    } else {
      console.log('❌ Mentor login failed:', mentorLogin.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMentorsEndpoint();
