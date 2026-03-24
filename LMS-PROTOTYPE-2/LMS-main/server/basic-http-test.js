// Test basic HTTP request to vendor stock API
const http = require('http');

console.log('Testing basic HTTP request to vendor stock API...');

const options = {
  hostname: 'localhost',
  port: 5002,
  path: '/api/vendor/stock',
  method: 'GET',
  timeout: 3000
};

const req = http.request(options, (res) => {
  console.log(`Response Status: ${res.statusCode}`);
  console.log(`Response Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk.toString();
  });
  
  res.on('end', () => {
    console.log(`Response Status: ${res.statusCode}`);
    console.log(`Response Data: ${data}`);
    
    if (res.statusCode === 200) {
      console.log('✅ Request successful!');
      try {
        const jsonData = JSON.parse(data);
        console.log('Response JSON:', jsonData);
      } catch (error) {
        console.log('Error parsing JSON:', error.message);
      }
    } else {
      console.log(`❌ Request failed with status: ${res.statusCode}`);
    }
  }
  });

req.on('error', (err) => {
  console.error('Request Error:', err.message);
});

req.setTimeout(() => {
  if (!req.complete) {
    console.log('❌ Request timed out after 3 seconds');
    req.destroy();
  }
}, 3000);
