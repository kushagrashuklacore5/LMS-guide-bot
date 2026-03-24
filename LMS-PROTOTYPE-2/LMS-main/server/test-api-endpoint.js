const http = require('http');

function makeRequest(method, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5002,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function test() {
  try {
    console.log('\n✅ Testing Mentor Classrooms API\n');
    
    // Test the endpoint for user ID 1 (Admin - who also has classrooms assigned)
    console.log('Testing GET /api/classrooms/mentor/1...');
    const res = await makeRequest('GET', '/api/classrooms/mentor/1');
    console.log(`Status: ${res.status}`);
    console.log('Response:', JSON.stringify(res.data, null, 2));
    
    if (res.status === 200 && res.data.data && res.data.data.length > 0) {
      console.log('\n✅ SUCCESS: Endpoint working! Found classrooms.');
    } else {
      console.log('\n⚠️  Endpoint returned 200 but no classrooms found');
    }

  } catch (err) {
    console.error('Test error:', err.message);
  }
}

test().then(() => process.exit(0));
