const db = require('./config/sqlite-db');

setTimeout(() => {
  console.log('\n📋 Adding Timetable to Classroom...\n');

  // Add a timetable URL to classroom 7
  const timetableUrl = '/uploads/timetables/sample-timetable.pdf';

  db.run(
    'UPDATE classrooms SET timetable = ? WHERE id = ?',
    [timetableUrl, 7],
    (err) => {
      if (err) {
        console.log('❌ Failed:', err.message);
      } else {
        console.log('✅ Updated Classroom 7 with timetable');
        console.log(`   Timetable URL: ${timetableUrl}`);
        console.log('\n💡 Note: This is a placeholder URL.');
        console.log('   In production, class teachers will upload real timetable files.');
      }

      setTimeout(() => {
        console.log('\n✅ Timetable is now linked to the classroom!\n');
        process.exit(0);
      }, 100);
    }
  );
}, 2000);
