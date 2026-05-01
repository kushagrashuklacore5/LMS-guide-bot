const axios = require('axios');

axios.post('http://127.0.0.1:5002/api/superadmin/login', {
  email: 'superadmin@test.com',
  password: '12345678'
})
.then(res => {
  console.log('SUCCESS:', res.data);
})
.catch(err => {
  console.log('ERROR:', err.response?.data || err.message);
  if (err.response) {
    console.log('Status:', err.response.status);
    console.log('Headers:', err.response.headers);
  }
});
