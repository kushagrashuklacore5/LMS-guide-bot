const db = require('config/database-switch');

console.log('=== TEST: Assignments and Students ===\n');

console.log('Step 1: Check student_classroom_assignment table');
db.all('SELECT * FROM student_classroom_assignment', (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Total assignments:', rows.length);
    rows.forEach(r => console.log(`  ClassroomID ${r.classroomId} -> StudentID ${r.studentId}`));
  }

  console.log('\nStep 2: Test the query for classroom 7 students');
  const query = `
    SELECT DISTINCT u.id as _id, u.id, u.name, u.email
    FROM users u
    WHERE u.role = 'student'
      AND u.id IN (
        SELECT studentId FROM student_classroom_assignment WHERE classroomId = 7
      )
    ORDER BY u.name
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Query Error:', err);
    } else {
      console.log('Students in classroom 7:', rows);
    }

    console.log('\nStep 3: Check all courses');
    db.all('SELECT id, title, classroomId, mentorId FROM courses', (err, rows) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Total courses:', rows.length);
        rows.forEach(c => console.log(`  Course: ${c.title} (ID: ${c.id}, Classroom: ${c.classroomId}, Mentor: ${c.mentorId})`));
      }
      
      process.exit(0);
    });
  });
});
