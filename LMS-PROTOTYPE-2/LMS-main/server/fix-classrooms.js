const db = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'lms-database.sqlite');

const database = new db.Database(dbPath, (err) => {
  if (err) {
    console.error('DB Error:', err);
    process.exit(1);
  }

  console.log('✅ Connected to database');

  // Update classroom 9 to have classTeacherId = 2 (Mentor User)
  database.run(`UPDATE classrooms SET classTeacherId = 2 WHERE id = 9`, function(err) {
    if (err) {
      console.error('Error updating classroom 9:', err);
    } else {
      console.log('✅ Updated classroom 9: classTeacherId = 2');
    }

    // Also update classrooms 7 and 8
    database.run(`UPDATE classrooms SET classTeacherId = 2 WHERE id IN (7, 8)`, function(err) {
      if (err) {
        console.error('Error updating classrooms 7, 8:', err);
      } else {
        console.log('✅ Updated classrooms 7, 8: classTeacherId = 2');
      }

      // Verify the update
      database.all(`SELECT id, name, classTeacherId FROM classrooms WHERE classTeacherId = 2`, (err, rows) => {
        if (err) {
          console.error('Error verifying:', err);
        } else {
          console.log('\n📚 Classrooms assigned to Mentor User (ID 2):');
          console.table(rows);
        }

        database.close();
      });
    });
  });
});
