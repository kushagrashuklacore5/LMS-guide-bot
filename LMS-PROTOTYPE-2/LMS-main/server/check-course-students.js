const db = require('./config/sqlite-db');

console.log('Checking course_students table...\n');

db.all('PRAGMA table_info(course_students)', (err, cols) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  
  console.log('course_students columns:');
  if (cols && cols.length > 0) {
    cols.forEach(c => console.log(`  - ${c.name} (${c.type})`));
  }
  process.exit(0);
});
