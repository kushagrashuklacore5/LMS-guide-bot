const http = require('http');

// Use the student token from localStorage (you'll need to get this from browser)
const studentToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJzdHVkZW50XzMiLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTczODA0NzQzNCwiZXhwIjoxNzM4MTMzODM0fQ.example'; // Replace with actual token

const options = {
  hostname: 'localhost',
  port: 5002,
  path: '/api/student-classrooms',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${studentToken}`,
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
  process.exit(1);
});

req.end();
