// Simple test to check if vendor stock API is accessible
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5002,
  path: '/api/vendor/stock',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer fake-token-for-testing'
  },
  timeout: 5000
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Status:', res.statusCode);
    console.log('Response Headers:', res.headers);
    console.log('Response Data:', data);
    
    if (res.statusCode === 200) {
      try {
        const jsonData = JSON.parse(data);
        console.log('Parsed JSON Response:', jsonData);
      } catch (error) {
        console.log('Error parsing JSON:', error.message);
      }
    } else {
      console.log('Response Status:', res.statusCode);
      console.log('Response Data:', data);
    }
  });
});

req.on('error', (err) => {
  console.error('Request Error:', err.message);
});

console.log('Making request to vendor stock API...');
