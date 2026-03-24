const db = require('./config/sqlite-db');

console.log('Checking announcements table structure...\n');

db.all("PRAGMA table_info(announcements);", (err, rows) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  
  console.log('Announcements table columns:');
  if (rows && rows.length > 0) {
    rows.forEach(r => {
      console.log(`  - ${r.name} (${r.type})${r.notnull ? ' NOT NULL' : ''}`);
    });
  } else {
    console.log('  (no columns found)');
  }
  
  process.exit(0);
});
