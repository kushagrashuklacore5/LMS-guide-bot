const jwt = require('jsonwebtoken');
const db = require('./config/sqlite-db');

// Create a test token
const token = jwt.sign(
  { userId: 2, role: 'mentor', name: 'Mentor User', email: 'mentor@gmail.com' },
  'your-secret-key'
);

console.log('Test token:', token);

// Now test the query
const teacherId = 2;
const query = `
  SELECT c.*, 
         u.name as teacherName,
         (SELECT COUNT(*) FROM student_classroom_assignment WHERE classroomId = c.id) as studentCount
  FROM classrooms c
  LEFT JOIN users u ON c.classTeacherId = u.id
  WHERE c.classTeacherId = ?
  ORDER BY c.grade, c.section
`;

db.all(query, [teacherId], (err, rows) => {
  console.log('Query Error:', err);
  console.log('Query Result:', rows);
  process.exit(0);
});
