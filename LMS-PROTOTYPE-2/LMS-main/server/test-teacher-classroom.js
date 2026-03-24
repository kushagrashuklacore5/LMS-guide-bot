const http = require('http');

// Function to make HTTP requests
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
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function test() {
  try {
    console.log('\n✅ Testing Teacher Classroom Reflection...\n');

    // 1. Create a teacher (if not exists)
    console.log('1️⃣  Getting teachers list...');
    let teachersRes = await makeRequest('GET', '/api/users/all?role=mentor');
    console.log('   Teachers:', teachersRes.data);
    
    // 2. Create a classroom with a teacher
    console.log('\n2️⃣  Creating a test classroom with teacher assignment...');
    const teacherId = 1; // Use existing teacher
    const classroomData = {
      name: 'Test Grade 5 - Section A',
      grade: '5',
      section: 'A',
      classTeacher: 'Test Teacher',
      classTeacherId: teacherId
    };
    
    let createRes = await makeRequest('POST', '/api/classrooms', classroomData);
    console.log('   Create Result:', JSON.stringify(createRes.data, null, 2));
    
    const classroomId = createRes.data?.data?.id;
    if (!classroomId) {
      console.error('❌ Failed to create classroom');
      process.exit(1);
    }
    
    // 3. Test the mentor classrooms endpoint
    console.log('\n3️⃣  Testing GET /api/classrooms/mentor/:teacherId...');
    let mentorClassroomsRes = await makeRequest('GET', `/api/classrooms/mentor/${teacherId}`);
    console.log('   Mentor Classrooms:', JSON.stringify(mentorClassroomsRes.data, null, 2));
    
    if (mentorClassroomsRes.data?.data?.length > 0) {
      console.log('\n✅ SUCCESS: Teacher can see assigned classrooms!');
    } else {
      console.log('\n❌ FAILED: Teacher cannot see assigned classrooms');
    }

  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

test().then(() => process.exit(0));
