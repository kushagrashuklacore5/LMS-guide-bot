const db = require('./config/sqlite-db');

console.log('=== Creating Sample Attendance and Results Data ===');

const studentId = 3; // Student User
const currentDate = new Date();

// Create sample attendance data for the last 10 days
const attendanceRecords = [];
for (let i = 0; i < 10; i++) {
  const date = new Date(currentDate);
  date.setDate(date.getDate() - i);
  
  const status = Math.random() > 0.2 ? 'present' : 'absent'; // 80% attendance
  
  attendanceRecords.push({
    studentId,
    date: date.toISOString().split('T')[0], // YYYY-MM-DD format
    status,
    markedBy: 'teacher',
    createdAt: new Date().toISOString()
  });
}

console.log('Creating attendance records...');

// Insert attendance records
attendanceRecords.forEach(record => {
  db.run(
    `INSERT INTO attendance (studentId, date, status, markedBy, createdAt) 
     VALUES (?, ?, ?, ?, ?)`,
    [record.studentId, record.date, record.status, record.markedBy, record.createdAt],
    function(err) {
      if (err) {
        console.error('Error inserting attendance:', err);
      } else {
        console.log(`✅ Attendance record for ${record.date}: ${record.status}`);
      }
    }
  );
});

// Create sample results data
setTimeout(() => {
  console.log('\nCreating sample results...');
  
  const results = [
    {
      studentId,
      classroomId: 9, // Using classroom ID from our data
      term: 'Mid Term 2026',
      subjects: JSON.stringify([
        { name: 'Mathematics', marks: 85, total: 100, grade: 'A' },
        { name: 'Science', marks: 92, total: 100, grade: 'A+' },
        { name: 'English', marks: 78, total: 100, grade: 'B+' }
      ]),
      overallPercentage: 85,
      overallStatus: 'Pass',
      comments: 'Good performance, keep up the good work!',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  results.forEach(result => {
    db.run(
      `INSERT INTO results (studentId, classroomId, term, subjects, overallPercentage, overallStatus, comments, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [result.studentId, result.classroomId, result.term, result.subjects, result.overallPercentage, result.overallStatus, result.comments, result.createdAt, result.updatedAt],
      function(err) {
        if (err) {
          console.error('Error inserting result:', err);
        } else {
          console.log(`✅ Result record created: ${result.overallStatus} (${result.overallPercentage}%)`);
        }
      }
    );
  });

  setTimeout(() => {
    console.log('\n=== Verification ===');
    
    // Check attendance
    db.all('SELECT * FROM attendance WHERE studentId = ? ORDER BY date DESC LIMIT 5', [studentId], (err, attendance) => {
      if (err) {
        console.error('Error fetching attendance:', err);
      } else {
        const presentCount = attendance.filter(a => a.status === 'present').length;
        const totalCount = attendance.length;
        const attendancePercentage = (presentCount / totalCount) * 100;
        
        console.log(`Attendance Records: ${totalCount}`);
        console.log(`Present: ${presentCount}, Absent: ${totalCount - presentCount}`);
        console.log(`Attendance Percentage: ${attendancePercentage.toFixed(1)}%`);
      }
      
      // Check results
      db.all('SELECT * FROM results WHERE studentId = ?', [studentId], (err, results) => {
        if (err) {
          console.error('Error fetching results:', err);
        } else {
          console.log(`\nResults Records: ${results.length}`);
          results.forEach(r => {
            console.log(`${r.term}: ${r.overallStatus} (${r.overallPercentage}%)`);
            try {
              const subjects = JSON.parse(r.subjects);
              subjects.forEach(s => {
                console.log(`  - ${s.name}: ${s.marks}/${s.total} (${s.grade})`);
              });
            } catch (e) {
              console.log('  Subjects data:', r.subjects);
            }
          });
        }
        
        console.log('\n✅ Sample data creation completed!');
        console.log('🔄 Please refresh your browser to see the updated dashboard');
        process.exit(0);
      });
    });
  }, 1000);
}, 1000);
