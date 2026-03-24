const axios = require('axios');

const API = 'http://localhost:5002/api';

async function testLiveClassesAPI() {
  try {
    // Login as student
    console.log('1️⃣  Logging in as student...');
    const loginRes = await axios.post(`${API}/auth/login`, {
      email: 'student@gmail.com',
      password: 'password'
    });
    
    const studentToken = loginRes.data.token;
    console.log('✅ Student logged in');

    // Test fetching live classes for course ID 1
    console.log('\n2️⃣  Testing API: GET /api/live-classes/course/1');
    const liveClassesRes = await axios.get(
      `${API}/live-classes/course/1`,
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );

    console.log('✅ API Response Status:', liveClassesRes.status);
    console.log('📦 Response Data:');
    console.log(JSON.stringify(liveClassesRes.data, null, 2));

    if (Array.isArray(liveClassesRes.data) && liveClassesRes.data.length > 0) {
      console.log('\n✅ SUCCESS! Live classes are being returned');
      liveClassesRes.data.forEach((lc, i) => {
        console.log(`\n   Live Class ${i + 1}:`);
        console.log(`   - ID: ${lc.id || lc._id}`);
        console.log(`   - Title: ${lc.title}`);
        console.log(`   - Status: ${lc.status}`);
        console.log(`   - Start: ${lc.scheduledStartTime}`);
      });
    } else {
      console.log('\n❌ No live classes returned');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testLiveClassesAPI();
