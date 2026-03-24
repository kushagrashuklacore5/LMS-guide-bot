const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'data', 'lms-database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) return console.error('DB err', err);
  console.log('DB connected');
  insert();
});

function insert() {
  const sql = `INSERT INTO announcements (title, message, publishFor, courseId, createdByUser, createdByRole, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const params = ['Mentor Course Update', 'New material uploaded', null, 1, 2, 'mentor', new Date().toISOString()];
  db.run(sql, params, function(err) {
    if (err) return console.error('Insert error', err);
    console.log('Inserted announcement id', this.lastID);
    db.close();
  });
}
