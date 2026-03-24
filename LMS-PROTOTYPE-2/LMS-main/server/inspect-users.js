const db = require('./config/sqlite-db');

function print(obj){ console.log(JSON.stringify(obj, null, 2)); }

db.all("PRAGMA table_info(users)", (err, cols) => {
  if (err) {
    console.error('PRAGMA error', err.message);
    process.exit(1);
  }
  console.log('COLUMNS:');
  print(cols.map(c=>c.name));

  db.all('SELECT id, name, name_ar, preferredLanguage FROM users LIMIT 20', (e, rows) => {
    if (e) {
      console.error('SELECT error', e.message);
      process.exit(1);
    }
    console.log('ROWS:');
    print(rows);
    process.exit(0);
  });
});
