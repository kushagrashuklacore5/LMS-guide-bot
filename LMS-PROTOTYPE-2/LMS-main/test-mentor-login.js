const axios = require('axios');

const API = 'http://localhost:5002/api';

async function testMentorLogin() {
  try {
    console.log('🧪 Testing Mentor Login...');
    const response = await axios.post(`${API}/auth/login`, {
      email: 'mentor@gmail.com',
      password: '12345678'
    });

    console.log('✅ Login Response:', {
      message: response.data.message,
      user: response.data.user,
      token: response.data.token ? '***TOKEN_RECEIVED***' : 'NO_TOKEN'
    });

    if (response.data.user.isApproved === true) {
      console.log('✅ ✅ ✅ MENTOR isApproved = TRUE - Dashboard should render!');
    } else {
      console.log('❌ ❌ ❌ MENTOR isApproved = FALSE - Dashboard will show approval message!');
    }

    return response.data;
  } catch (error) {
    console.error('❌ Login Error:', error.response?.data || error.message);
  }
}

testMentorLogin();
