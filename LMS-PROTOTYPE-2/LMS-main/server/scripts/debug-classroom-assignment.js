const db = require('../config/database-switch');

// Wait for DB connection
setTimeout(() => {
  console.log('\n=== DEBUG: Classroom Assignment Data ===\n');

  // Check if table exists
  db.all("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND name='student_classroom_assignment'", (err, tables) => {
    if (err) {
      console.error('Error checking tables:', err);
      process.exit(1);
    }
    
    if (!tables || tables.length === 0) {
      console.log('❌ Table "student_classroom_assignment" does NOT exist');
    } else {
      console.log('✅ Table "student_classroom_assignment" EXISTS');
      
      // Check all data in the table
      db.all('SELECT * FROM student_classroom_assignment', (err, rows) => {
        if (err) {
          console.error('Error fetching data:', err);
        } else {
          console.log(`Total assignments in DB: ${rows.length}`);
          if (rows.length === 0) {
            console.log('⚠️  No student-classroom assignments found!');
          } else {
            console.log('\nAssignments:');
            rows.forEach(row => {
              console.log(`  - Student ID: ${row.studentId}, Classroom ID: ${row.classroomId}`);
            });
          }
        }
        
        // Also check for students
        db.all('SELECT id, name, role FROM users WHERE role = "student" LIMIT 5', (err, students) => {
          if (err) {
            console.error('Error fetching students:', err);
          } else {
            console.log(`\nStudents in DB: ${students.length}`);
            students.forEach(student => {
              console.log(`  - ID: ${student.id}, Name: ${student.name}`);
            });
          }
          
          // Check for classrooms
          db.all('SELECT id, name, grade FROM classrooms LIMIT 5', (err, classrooms) => {
            if (err) {
              console.error('Error fetching classrooms:', err);
            } else {
              console.log(`\nClassrooms in DB: ${classrooms.length}`);
              classrooms.forEach(classroom => {
                console.log(`  - ID: ${classroom.id}, Name: ${classroom.name}, Grade: ${classroom.grade}`);
              });
            }
            
            process.exit(0);
          });
        });
      });
    }
  });
}, 1000);
