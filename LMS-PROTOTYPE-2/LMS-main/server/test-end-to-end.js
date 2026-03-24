const http = require('http');

function makeRequest(method, path, data = null) {
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
      res.on('data', (chunk) => { responseData += chunk; });
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
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  try {
    console.log('\n🧪 END-TO-END CLASSROOM ASSIGNMENT TEST\n');

    // Step 1: Create classroom assigned to mentor ID 2
    console.log('Step 1️⃣  Creating classroom assigned to Mentor User (ID: 2)...');
    const createRes = await makeRequest('POST', '/api/classrooms', {
      name: 'Grade 8 - Section B (Mentor Test)',
      grade: '8',
      section: 'B',
      classTeacher: 'Mentor User',
      classTeacherId: 2
    });

    if (createRes.status !== 201) {
      console.error('❌ Failed to create classroom:', createRes.data);
      process.exit(1);
    }

    const classroomId = createRes.data.data?.id;
    console.log(`✅ Classroom created! ID: ${classroomId}`);

    // Step 2: Query classrooms for mentor ID 2
    console.log('\nStep 2️⃣  Fetching classrooms assigned to Mentor User (ID: 2)...');
    const fetchRes = await makeRequest('GET', '/api/classrooms/mentor/2');

    if (fetchRes.status !== 200) {
      console.error('❌ Failed to fetch mentor classrooms:', fetchRes.data);
      process.exit(1);
    }

    const classrooms = fetchRes.data.data || [];
    console.log(`✅ Found ${classrooms.length} classrooms:`);
    classrooms.forEach(c => {
      console.log(`  - ${c.name} (Grade ${c.grade}, Section ${c.section}, Teacher: ${c.teacherName})`);
    });

    if (classrooms.length === 0) {
      console.log('❌ ERROR: No classrooms found for mentor!');
      process.exit(1);
    }

    console.log('\n✅ SUCCESS: Mentor classrooms endpoint is working correctly!');
    console.log('📝 The Mentor User should now see these classrooms in their portal.');

  } catch (err) {
    console.error('Test error:', err.message);
    process.exit(1);
  }
}

test().then(() => process.exit(0));
