// Test the API directly without axios
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5002,
  path: '/api/superadmin/internal/superadmins',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY5LCJyb2xlIjoic3VwZXJhZG1pbiIsIm5hbWUiOiJQb3J0YWwgQWRtaW4iLCJlbWFpbCI6InBvcnRhbEBjb3JlNS5jby5pbiIsInVuaXZlcnNpdHlJZCI6MSwiaWF0IjoxNzI0OTY2NjQzLCJleHAiOjE3MjU1NzE0NDN9.DUMMY_TOKEN_FOR_TESTING',
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
