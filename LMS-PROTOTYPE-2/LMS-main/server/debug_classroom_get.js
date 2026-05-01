const axios = require('axios');

async function debugClassroomGet() {
  console.log('🔍 Debugging GET /api/classrooms...\n');
  
  try {
    // Login first
    const loginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'abhishek@core5.co.in',
      password: 'O#P$0A@7THQW'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Login successful');
    
    // Test GET with detailed response
    console.log('\n📡 Making GET request to /api/classrooms...');
    const response = await axios.get('http://127.0.0.1:5002/api/classrooms', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', response.headers);
    console.log('📊 Response Data:', JSON.stringify(response.data, null, 2));
    console.log('📊 Response Data Type:', typeof response.data);
    console.log('📊 Response Data Length:', response.data?.length || 'N/A');
    
    if (response.data && response.data.data) {
      console.log('📊 Data Array Length:', response.data.data?.length || 'N/A');
      console.log('📊 First Classroom:', response.data.data[0] || 'None');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('📊 Error Status:', error.response.status);
      console.error('📊 Error Data:', error.response.data);
    }
  }
}

debugClassroomGet();
