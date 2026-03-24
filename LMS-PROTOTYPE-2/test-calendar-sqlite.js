const http = require('http');

// Test data
const adminId = 'admin-user-123';
const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbi11c2VyLTEyMyIsInJvbGUiOiJhZG1pbiJ9.test'; // Dummy JWT

// Helper to make HTTP requests
function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5002,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Main test
async function test() {
  console.log('🧪 Testing SQLite-based Calendar System\n');

  try {
    // Test 1: Create event for students
    console.log('1️⃣ Testing: Admin creates event for students...');
    const createRes1 = await makeRequest('POST', '/api/calendar', {
      title: 'Student Assembly',
      description: 'Weekly student meeting',
      startDate: '2024-12-15T09:00:00',
      endDate: '2024-12-15T10:00:00',
      publishFor: 'student'
    }, adminToken);
    console.log(`Status: ${createRes1.statusCode}`);
    console.log(`Response:`, createRes1.data);
    console.log();

    // Test 2: Create event for mentors
    console.log('2️⃣ Testing: Admin creates event for mentors...');
    const createRes2 = await makeRequest('POST', '/api/calendar', {
      title: 'Faculty Meeting',
      description: 'Monthly faculty discussion',
      startDate: '2024-12-16T14:00:00',
      endDate: '2024-12-16T15:00:00',
      publishFor: 'faculty'
    }, adminToken);
    console.log(`Status: ${createRes2.statusCode}`);
    console.log(`Response:`, createRes2.data);
    console.log();

    // Test 3: Create event for both
    console.log('3️⃣ Testing: Admin creates event for both...');
    const createRes3 = await makeRequest('POST', '/api/calendar', {
      title: 'School Holiday',
      description: 'Public holiday',
      startDate: '2024-12-25T00:00:00',
      endDate: '2024-12-25T23:59:59',
      publishFor: 'both'
    }, adminToken);
    console.log(`Status: ${createRes3.statusCode}`);
    console.log(`Response:`, createRes3.data);
    console.log();

    // Test 4: Get all events (as admin)
    console.log('4️⃣ Testing: Get all events (admin view)...');
    const getRes = await makeRequest('GET', '/api/calendar', null, adminToken);
    console.log(`Status: ${getRes.statusCode}`);
    console.log(`Number of events: ${getRes.data.length}`);
    if (getRes.data.length > 0) {
      console.log(`Sample event:`, getRes.data[0]);
    }
    console.log();

    console.log('✅ Calendar SQLite tests completed!');
  } catch (err) {
    console.error('❌ Test error:', err);
  }
}

test();
