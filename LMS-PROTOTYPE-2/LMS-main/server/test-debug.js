const db = require('./config/sqlite-db');

// Test 1: Check users table
console.log('\n=== TEST 1: Get All Users ===');
db.all('SELECT id, name, email, role, isApproved FROM users', (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Total Users:', rows.length);
    console.log('Users by role:');
    rows.forEach(u => console.log(`  ID ${u.id}: ${u.name} (${u.role}) - Approved: ${u.isApproved}`));
  }
});

// Test 2: Check classrooms table
console.log('\n=== TEST 2: Get All Classrooms ===');
db.all('SELECT id, name, grade, section, classTeacherId FROM classrooms LIMIT 5', (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Classrooms:', rows);
  }
});

// Test 3: Check classroom students assignment
console.log('\n=== TEST 3: Check student_classroom_assignment table ===');
db.all('SELECT * FROM student_classroom_assignment', (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Total assignments:', rows.length);
    if (rows.length > 0) {
      console.log('Sample assignments:');
      rows.slice(0, 10).forEach(a => console.log(`  ClassroomID ${a.classroomId} -> UserID ${a.userId}`));
    }
  }
});

// Test 4: Check courses
console.log('\n=== TEST 4: Get All Courses ===');
db.all('SELECT id, title, mentorId, classroomId FROM courses LIMIT 5', (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Courses:', rows);
  }
});

// Test 5: Get mentors (role = 'mentor')
console.log('\n=== TEST 5: Get Mentors ===');
db.all("SELECT id, name, email FROM users WHERE role = 'mentor' AND isApproved = 1", (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Mentors:', rows);
  }
});

// Test 6: Get students (role = 'student')
console.log('\n=== TEST 6: Get Students ===');
db.all("SELECT id, name, email FROM users WHERE role = 'student' AND isApproved = 1 LIMIT 10", (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Students:', rows);
    console.log('Total students:', rows.length);
  }
});

// Test 7: Get students in specific classroom
console.log('\n=== TEST 7: Get Students in Classroom ID 1 ===');
db.all(`
  SELECT DISTINCT u.id as _id, u.id, u.name, u.email
  FROM users u
  WHERE u.role = 'student'
    AND u.id IN (
      SELECT userId FROM student_classroom_assignment WHERE classroomId = 1
    )
  ORDER BY u.name
`, (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Students in classroom:', rows);
  }
});

setTimeout(() => {
  console.log('\n✅ Tests completed');
  process.exit(0);
}, 2000);
