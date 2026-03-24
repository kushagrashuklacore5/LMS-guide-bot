const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'lms-database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) return console.error('DB err', err);
  console.log('DB connected');
  fetchForStudent(3); // student id 3
});

function fetchForStudent(studentId) {
  const query = `SELECT a.*, u.name as createdByUserName FROM announcements a LEFT JOIN users u ON a.createdByUser = u.id WHERE ( a.publishFor IN ('students', 'both') OR (a.createdByRole = 'mentor' AND a.courseId IN (SELECT courseId FROM course_students WHERE studentId = ?)) ) ORDER BY a.createdAt DESC`;
  db.all(query, [studentId], (err, rows) => {
    if (err) return console.error(err);
    console.log('Announcements for student', studentId, JSON.stringify(rows, null, 2));
    db.close();
  });
}
