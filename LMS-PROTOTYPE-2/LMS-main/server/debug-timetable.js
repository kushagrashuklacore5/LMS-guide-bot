const db = require('config/database-switch');
const jwt = require('jsonwebtoken');

setTimeout(() => {
  console.log('\n🔍 === DEBUGGING TIMETABLE ISSUE ===\n');

  const studentId = 3; // The test student
  const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret_key';
  const token = jwt.sign({ userId: studentId, role: 'student' }, jwtSecret);

  console.log('🧪 Testing with Student ID:', studentId);
  console.log('📋 Checking database...\n');

  // Step 1: Check if student exists
  db.get('SELECT * FROM users WHERE id = ? AND role = ?', [studentId, 'student'], (err, student) => {
    console.log('1️⃣  Student Record:');
    if (err) {
      console.log('   ❌ Error:', err.message);
    } else if (student) {
      console.log('   ✅ Found:', { id: student.id, name: student.name, email: student.email });
    } else {
      console.log('   ❌ NOT FOUND');
    }

    // Step 2: Check student_classroom_assignment records
    db.all('SELECT * FROM student_classroom_assignment WHERE studentId = ?', [studentId], (err, assignments) => {
      console.log('\n2️⃣  Student Classroom Assignments:');
      if (err) {
        console.log('   ❌ Error:', err.message);
      } else if (assignments && assignments.length > 0) {
        console.log('   ✅ Found', assignments.length, 'assignments:');
        assignments.forEach(a => {
          console.log(`      - classroom_id: ${a.classroomId}`);
        });
      } else {
        console.log('   ⚠️  NO ASSIGNMENTS FOUND - THIS IS THE ISSUE!');
      }

      // Step 3: List all classrooms
      db.all('SELECT * FROM classrooms LIMIT 10', (err, classrooms) => {
        console.log('\n3️⃣  All Classrooms:');
        if (err) {
          console.log('   ❌ Error:', err.message);
        } else if (classrooms && classrooms.length > 0) {
          console.log('   ✅ Found', classrooms.length, 'classrooms:');
          classrooms.forEach(c => {
            console.log(`      - ID: ${c.id}, Name: ${c.name}, Section: ${c.section}, Timetable: ${c.timetable || 'NONE'}`);
          });
        } else {
          console.log('   ❌ NO CLASSROOMS FOUND');
        }

        // Step 4: Check if any students are assigned to classrooms
        db.all('SELECT * FROM student_classroom_assignment LIMIT 10', (err, allAssignments) => {
          console.log('\n4️⃣  All Student Assignments (sample):');
          if (err) {
            console.log('   ❌ Error:', err.message);
          } else if (allAssignments && allAssignments.length > 0) {
            console.log('   ✅ Found', allAssignments.length, 'assignments total:');
            allAssignments.forEach(a => {
              console.log(`      - Student: ${a.studentId}, Classroom: ${a.classroomId}`);
            });
          } else {
            console.log('   ⚠️  NO ASSIGNMENTS AT ALL IN DATABASE');
          }

          // Step 5: Try the actual API query
          console.log('\n5️⃣  Running API Query:');
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
            [studentId],
            (err, result) => {
              if (err) {
                console.log('   ❌ Query Error:', err.message);
              } else if (result && result.length > 0) {
                console.log('   ✅ API Query returned', result.length, 'classrooms');
                result.forEach(c => {
                  console.log(`      - Name: ${c.name}, Has Timetable: ${c.timetable ? 'YES' : 'NO'}`);
                });
              } else {
                console.log('   ⚠️  API Query returned 0 classrooms');
              }

              console.log('\n💡 DIAGNOSIS:');
              if (!assignments || assignments.length === 0) {
                console.log('   The student has NO classroom assignments in the database.');
                console.log('   👉 ACTION: Assign the student to a classroom first!');
                console.log('\n   To create test data, run:');
                console.log('   node create-test-classroom.js');
              } else {
                console.log('   The student has assignments but the API query is failing.');
                console.log('   👉 Check database schema and query syntax.');
              }

              console.log('\n');
              process.exit(0);
            }
          );
        });
      });
    });
  });
}, 2000);
