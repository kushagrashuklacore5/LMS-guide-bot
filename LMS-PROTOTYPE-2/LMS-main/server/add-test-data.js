const db = require('./config/sqlite-db');

console.log('Adding test data...\n');

// Assign students to classrooms
const assignments = [
  { classroomId: 7, studentId: 3 },  // Student User to classroom 7
  { classroomId: 7, studentId: 6 },  // Aniket Singh to classroom 7
  { classroomId: 8, studentId: 3 },  // Student User to classroom 8
  { classroomId: 8, studentId: 6 },  // Aniket Singh to classroom 8
];

let completed = 0;
const total = assignments.length;

assignments.forEach((assign, idx) => {
  const query = `
    INSERT OR IGNORE INTO student_classroom_assignment (classroomId, studentId, createdAt)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `;
  
  db.run(query, [assign.classroomId, assign.studentId], (err) => {
    if (err) {
      console.error(`❌ Failed to assign student ${assign.studentId} to classroom ${assign.classroomId}:`, err);
    } else {
      console.log(`✅ Assigned student ${assign.studentId} to classroom ${assign.classroomId}`);
    }
    completed++;
    
    if (completed === total) {
      console.log('\n✅ All assignments added!');
      
      // Verify
      setTimeout(() => {
        console.log('\nVerifying assignments...');
        db.all('SELECT * FROM student_classroom_assignment', (err, rows) => {
          console.log('Total assignments now:', rows.length);
          console.log('Assignments:', rows);
          process.exit(0);
        });
      }, 100);
    }
  });
});
