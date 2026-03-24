const db = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'lms-database.sqlite');

const database = new db.Database(dbPath, (err) => {
  if (err) {
    console.error('DB Error:', err);
    process.exit(1);
  }

  console.log('✅ Connected to database');

  // Check users with mentor/teacher role
  console.log('\n📋 USERS (potential mentors):');
  database.all(`SELECT id, name, email, role FROM users WHERE role IN ('mentor', 'teacher')`, (err, rows) => {
    if (err) console.error('Error:', err);
    else console.table(rows);

    // Check classrooms
    console.log('\n📚 CLASSROOMS:');
    database.all(`SELECT id, name, grade, section, classTeacherId FROM classrooms`, (err, rows) => {
      if (err) console.error('Error:', err);
      else console.table(rows);

      // Check classroom assignments
      console.log('\n🔗 CLASSROOM ASSIGNMENTS:');
      database.all(`SELECT * FROM classroomAssignments`, (err, rows) => {
        if (err) console.error('Error:', err);
        else console.table(rows);

        // Check student assignments
        console.log('\n👨‍🎓 STUDENT CLASSROOM ASSIGNMENTS:');
        database.all(`SELECT * FROM student_classroom_assignment`, (err, rows) => {
          if (err) console.error('Error:', err);
          else console.table(rows);

          database.close();
        });
      });
    });
  });
});
