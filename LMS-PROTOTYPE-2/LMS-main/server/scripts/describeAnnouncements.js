const db = require('../config/sqlite-db');

console.log('\nPRAGMA table_info(announcements)');

db.all("PRAGMA table_info(announcements)", (err, rows) => {
  if (err) { console.error(err); process.exit(1); }
  rows.forEach(r => console.log(r));
  process.exit(0);
});
