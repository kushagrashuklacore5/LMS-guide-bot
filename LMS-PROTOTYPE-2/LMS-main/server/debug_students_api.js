const axios = require('axios');

async function debugStudentsAPI() {
  console.log('🔍 Debugging Students API Response...\n');
  
  try {
    // Login as Rishi (Mentor)
    console.log('🔐 Login as Rishi (Mentor)...');
    const rishiLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'rishi@core5.co.in',
      password: 'rishi123'
    });
    
    if (rishiLogin.status === 200) {
      const rishiToken = rishiLogin.data.token;
      console.log('✅ Rishi login successful');
      
      // Debug the students API response
      console.log('\n👥 Debugging /api/users?role=student...');
      try {
        const studentsResponse = await axios.get('http://127.0.0.1:5002/api/users?role=student', {
          headers: { 
            'Authorization': `Bearer ${rishiToken}`
          }
        });
        
        console.log('✅ Response Status:', studentsResponse.status);
        console.log('✅ Response Headers:', studentsResponse.headers);
        console.log('✅ Response Data Type:', typeof studentsResponse.data);
        console.log('✅ Response Data:', JSON.stringify(studentsResponse.data, null, 2));
        
        // Check if it's wrapped
        if (studentsResponse.data && typeof studentsResponse.data === 'object') {
          if ('data' in studentsResponse.data) {
            console.log('📦 Wrapped Response - data field:', studentsResponse.data.data);
            console.log('📊 Student Count:', Array.isArray(studentsResponse.data.data) ? studentsResponse.data.data.length : 0);
          }
          if ('success' in studentsResponse.data) {
            console.log('📦 Wrapped Response - success field:', studentsResponse.data.success);
          }
        }
        
        // Try different endpoints
        console.log('\n🔍 Trying alternative endpoints...');
        
        // Try /api/students
        try {
          const altResponse = await axios.get('http://127.0.0.1:5002/api/students', {
            headers: { 
              'Authorization': `Bearer ${rishiToken}`
            }
          });
          console.log('✅ /api/students Response:', JSON.stringify(altResponse.data, null, 2));
        } catch (err) {
          console.log('❌ /api/students Error:', err.response?.status, err.response?.data?.message);
        }
        
        // Try /api/user/students
        try {
          const altResponse2 = await axios.get('http://127.0.0.1:5002/api/user/students', {
            headers: { 
              'Authorization': `Bearer ${rishiToken}`
            }
          });
          console.log('✅ /api/user/students Response:', JSON.stringify(altResponse2.data, null, 2));
        } catch (err) {
          console.log('❌ /api/user/students Error:', err.response?.status, err.response?.data?.message);
        }
        
      } catch (error) {
        console.log('❌ Students API Error:', error.response?.status, error.response?.data?.message);
        console.log('❌ Error Details:', error.response?.data);
      }
      
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugStudentsAPI();
