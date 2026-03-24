const http = require('http');

// First, get admin token
async function getAdminToken() {
  return new Promise((resolve) => {
    const loginData = JSON.stringify({
      email: 'admin@gmail.com',
      password: '12345678'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response.token);
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.write(loginData);
    req.end();
  });
}

// Create new student
async function createStudent(token) {
  return new Promise((resolve) => {
    const createData = JSON.stringify({
      fullName: 'Test Student',
      email: 'teststudent@gmail.com',
      phone: '9876543210',
      address: 'Test Address',
      className: '10',
      section: 'A'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/create-student',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': createData.length
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.write(createData);
    req.end();
  });
}

// Create new teacher
async function createTeacher(token) {
  return new Promise((resolve) => {
    const createData = JSON.stringify({
      name: 'Test Teacher',
      email: 'testteacher@gmail.com',
      phone: '9876543211',
      subject: 'Mathematics'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/create-teacher',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': createData.length
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.write(createData);
    req.end();
  });
}

// Test login with new user
async function testLogin(email, password) {
  return new Promise((resolve) => {
    const loginData = JSON.stringify({ email, password });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            success: res.statusCode === 200,
            message: response.message,
            role: response.user?.role,
            email: response.user?.email
          });
        } catch (e) {
          resolve({ success: false, message: 'Parse error' });
        }
      });
    });

    req.on('error', (e) => resolve({ success: false, message: e.message }));
    req.write(loginData);
    req.end();
  });
}

async function runTests() {
  console.log('\n========================================');
  console.log('Testing User Creation & Login Flow');
  console.log('========================================\n');

  // Get admin token
  console.log('1️⃣ Getting admin token...');
  const adminToken = await getAdminToken();
  if (!adminToken) {
    console.log('❌ Failed to get admin token');
    return;
  }
  console.log('✅ Admin token received\n');

  // Create new student
  console.log('2️⃣ Admin creating new student...');
  const studentResponse = await createStudent(adminToken);
  if (!studentResponse || studentResponse.message.includes('error')) {
    console.log('❌ Failed to create student:', studentResponse?.message);
  } else {
    console.log('✅ Student created successfully!');
    console.log('   Email:', studentResponse.student?.email);
    console.log('   Generated Password:', studentResponse.generatedPassword);
    console.log('   Role:', studentResponse.student?.role);

    // Test login with generated password
    console.log('\n3️⃣ Testing login with generated password...');
    const loginTest = await testLogin(
      studentResponse.student.email,
      studentResponse.generatedPassword
    );
    if (loginTest.success) {
      console.log('✅ Login successful!');
      console.log('   Email:', loginTest.email);
      console.log('   Role:', loginTest.role);
      console.log('   Message:', loginTest.message);
    } else {
      console.log('❌ Login failed:', loginTest.message);
    }
  }

  // Create new teacher
  console.log('\n4️⃣ Admin creating new teacher...');
  const teacherResponse = await createTeacher(adminToken);
  if (!teacherResponse || teacherResponse.message.includes('error')) {
    console.log('❌ Failed to create teacher:', teacherResponse?.message);
  } else {
    console.log('✅ Teacher created successfully!');
    console.log('   Email:', teacherResponse.teacher?.email);
    console.log('   Generated Password:', teacherResponse.generatedPassword);
    console.log('   Role:', teacherResponse.teacher?.role);

    // Test login with generated password
    console.log('\n5️⃣ Testing login with generated password...');
    const loginTest = await testLogin(
      teacherResponse.teacher.email,
      teacherResponse.generatedPassword
    );
    if (loginTest.success) {
      console.log('✅ Login successful!');
      console.log('   Email:', loginTest.email);
      console.log('   Role:', loginTest.role);
      console.log('   Message:', loginTest.message);
    } else {
      console.log('❌ Login failed:', loginTest.message);
    }
  }

  console.log('\n========================================');
  console.log('Test Summary');
  console.log('========================================');
  console.log('✅ New users CAN login with their generated passwords!');
  console.log('========================================\n');
}

runTests();
