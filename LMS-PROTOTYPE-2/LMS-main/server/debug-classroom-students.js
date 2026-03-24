const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'lms-database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  }
  console.log('Connected to database');
  
  // Check student_classroom_assignment table
  db.all(`
    SELECT sca.*, u.name, u.email, c.name as classroomName
    FROM student_classroom_assignment sca
    LEFT JOIN users u ON sca.studentId = u.id
    LEFT JOIN classrooms c ON sca.classroomId = c.id
  `, (err, rows) => {
    if (err) {
      console.error('Error fetching assignments:', err.message);
    } else {
      console.log('\n=== ALL STUDENT CLASSROOM ASSIGNMENTS ===');
      console.table(rows);
    }
    
    // Check users table
    db.all(`
      SELECT id, name, email, role, classroom_id FROM users WHERE role = 'student'
    `, (err, rows) => {
      if (err) {
        console.error('Error fetching students:', err.message);
      } else {
        console.log('\n=== ALL STUDENTS ===');
        console.table(rows);
      }
      
      // Check classrooms
      db.all(`
        SELECT id, name, grade, section FROM classrooms
      `, (err, rows) => {
        if (err) {
          console.error('Error fetching classrooms:', err.message);
        } else {
          console.log('\n=== ALL CLASSROOMS ===');
          console.table(rows);
        }
        db.close();
      });
    });
  });
});
