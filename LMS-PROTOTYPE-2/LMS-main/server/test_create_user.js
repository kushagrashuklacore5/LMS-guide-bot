const axios = require('axios');

// First login to get token
axios.post('http://127.0.0.1:5002/api/superadmin/login', {
  email: 'superadmin@test.com',
  password: '12345678'
})
.then(loginRes => {
  console.log('Login successful:', loginRes.data);
  
  const token = loginRes.data.data.accessToken;
  
  // Now test user creation
  return axios.post('http://127.0.0.1:5002/api/superadmin/create-user', {
    name: 'New Test User',
    email: 'newtestuser@example.com',
    password: '12345678',
    role: 'student',
    universityId: 1
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
})
.then(createRes => {
  console.log('User creation successful:', createRes.data);
})
.catch(err => {
  console.log('ERROR:', err.response?.data || err.message);
  if (err.response) {
    console.log('Status:', err.response.status);
  }
});
