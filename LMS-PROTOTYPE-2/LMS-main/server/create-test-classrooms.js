const db = require('./config/sqlite-db');

setTimeout(() => {
  console.log('\n📚 Creating Test Classrooms...\n');

  // Create 3 test classrooms
  const classrooms = [
    { id: 7, name: 'Grade 1 - Section A', grade: '1', section: 'A', classTeacherId: 2 },
    { id: 8, name: 'Grade 2 - Section A', grade: '2', section: 'A', classTeacherId: 2 },
    { id: 9, name: 'Grade 3 - Section A', grade: '3', section: 'A', classTeacherId: 2 }
  ];

  let created = 0;

  classrooms.forEach((classroom, index) => {
    db.run(
      `INSERT OR IGNORE INTO classrooms (id, name, grade, section, classTeacherId, studentCount) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [classroom.id, classroom.name, classroom.grade, classroom.section, classroom.classTeacherId, 0],
      (err) => {
        if (err) {
          console.log(`❌ ${index + 1}. Failed to create "${classroom.name}":`, err.message);
        } else {
          console.log(`✅ ${index + 1}. Created "${classroom.name}" (ID: ${classroom.id})`);
          created++;
        }

        if (created + (classrooms.length - created) === classrooms.length && index === classrooms.length - 1) {
          setTimeout(() => {
            console.log(`\n📊 Summary: Created ${created}/${classrooms.length} classrooms`);
            console.log('\n✅ Now student should see their classrooms in Timetable!\n');
            process.exit(0);
          }, 100);
        }
      }
    );
  });
}, 2000);
