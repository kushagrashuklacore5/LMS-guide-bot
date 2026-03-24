const http = require('http');

const api = (path) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5002,
      path: `/api${path}`,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
};

(async () => {
  try {
    console.log('\n=== TEST 1: Get Classroom 7 ===');
    const classroom = await api('/classrooms/7');
    console.log(JSON.stringify(classroom, null, 2));

    console.log('\n=== TEST 2: Get Students in Classroom 7 ===');
    const students = await api('/classrooms/7/students');
    console.log(JSON.stringify(students, null, 2));

    console.log('\n=== TEST 3: Get Courses in Classroom 7 ===');
    const courses = await api('/courses/classroom/7');
    console.log(JSON.stringify(courses, null, 2));

    console.log('\n=== TEST 4: Get Mentors ===');
    const mentors = await api('/users/mentors');
    console.log(JSON.stringify(mentors, null, 2));

    console.log('\n✅ All tests completed');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
