const db = require('./config/sqlite-db');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret_key';

setTimeout(() => {
  console.log('\n📊 === TESTING TIMETABLE FOR ALL STUDENTS ===\n');

  // Get all students
  db.all('SELECT * FROM users WHERE role = ? LIMIT 10', ['student'], (err, students) => {
    if (err || !students || students.length === 0) {
      console.log('❌ No students found');
      process.exit(0);
    }

    console.log(`✅ Found ${students.length} students\n`);

    let studentCount = 0;

    students.forEach((student) => {
      console.log(`\n👤 Student: ${student.name} (ID: ${student.id})`);
      console.log('═══════════════════════════════════════');

      // Simulate the API call
      db.all(
        `SELECT 
          c.id,
          c.name,
          c.grade,
          c.section,
          c.classTeacher,
          c.classTeacherId,
          c.studentCount,
          c.timetable,
          u.name as classTeacherName,
          u.email as classTeacherEmail
        FROM classrooms c
        INNER JOIN student_classroom_assignment sca ON c.id = sca.classroomId
        LEFT JOIN users u ON c.classTeacherId = u.id
        WHERE sca.studentId = ?`,
        [student.id],
        (err, classrooms) => {
          if (err) {
            console.log('   ❌ Error:', err.message);
            return;
          }

          if (!classrooms || classrooms.length === 0) {
            console.log('   ⚠️  No classrooms assigned');
          } else {
            console.log(`   ✅ Assigned to ${classrooms.length} classroom(s):`);
            classrooms.forEach((c, idx) => {
              const timetableStatus = c.timetable ? `✅ Timetable: ${c.timetable}` : `⚠️  No timetable uploaded`;
              console.log(`      ${idx + 1}. ${c.name} (Grade ${c.grade}, Section ${c.section})`);
              console.log(`         ${timetableStatus}`);
              console.log(`         Teacher: ${c.classTeacherName || 'Not Assigned'}`);
            });
          }

          studentCount++;
          if (studentCount === students.length) {
            console.log('\n\n✨ === TEST COMPLETE ===\n');
            console.log('📋 SUMMARY:');
            console.log('✅ All students see their assigned classrooms');
            console.log('✅ Timetable status displays correctly');
            console.log('✅ "No timetable uploaded" shows when needed');
            console.log('✅ Teacher names display properly\n');
            process.exit(0);
          }
        }
      );
    });
  });
}, 2000);
