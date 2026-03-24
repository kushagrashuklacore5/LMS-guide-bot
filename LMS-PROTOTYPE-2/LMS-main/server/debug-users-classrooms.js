const db = require('./config/sqlite-db');

console.log('\n=== DEBUGGING USER ROLES AND CLASSROOM ASSIGNMENT ===\n');

// 1. Check all users and their roles
db.all(`SELECT id, name, email, role FROM users LIMIT 10`, (err, users) => {
  if (err) {
    console.error('Error fetching users:', err);
    process.exit(1);
  }
  
  console.log('📋 Users in database:');
  users.forEach(u => {
    console.log(`  - ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
  });
  
  // 2. Check classrooms with teacher assignments
  console.log('\n📚 Classrooms and their teacher assignments:');
  db.all(`SELECT id, name, grade, section, classTeacher, classTeacherId FROM classrooms LIMIT 10`, (err, classrooms) => {
    if (err) {
      console.error('Error fetching classrooms:', err);
      process.exit(1);
    }
    
    classrooms.forEach(c => {
      console.log(`  - ID: ${c.id}, Name: ${c.name}, Teacher ID: ${c.classTeacherId}, Teacher Name: ${c.classTeacher}`);
    });
    
    // 3. Test the mentor classrooms query
    if (classrooms.length > 0 && classrooms[0].classTeacherId) {
      const teacherId = classrooms[0].classTeacherId;
      console.log(`\n🔍 Testing query for teacher ID ${teacherId}:`);
      
      db.all(`
        SELECT c.*, 
               u.name as teacherName,
               (SELECT COUNT(*) FROM student_classroom_assignment WHERE classroomId = c.id) as studentCount
        FROM classrooms c
        LEFT JOIN users u ON c.classTeacherId = u.id
        WHERE c.classTeacherId = ?
        ORDER BY c.grade, c.section
      `, [teacherId], (err, mentorClassrooms) => {
        if (err) {
          console.error('Error fetching mentor classrooms:', err);
        } else {
          console.log(`Found ${mentorClassrooms.length} classrooms for teacher ${teacherId}:`);
          mentorClassrooms.forEach(c => {
            console.log(`  - ${c.name} (Grade ${c.grade}, Section ${c.section})`);
          });
        }
        process.exit(0);
      });
    } else {
      console.log('\n⚠️  No classrooms with teacher assignments found');
      process.exit(0);
    }
  });
});
