const db = require('./config/sqlite-db');

console.log('Checking vendors table structure...');

db.all('PRAGMA table_info(vendors)', (err, result) => {
  if (err) {
    console.error('Error getting vendors table info:', err);
  } else {
    console.log('Vendors table structure:');
    result.forEach(col => {
      console.log(`- ${col.name}: ${col.type}`);
    });
  }
  
  // Check existing vendors
  db.all('SELECT * FROM vendors LIMIT 5', (err, rows) => {
    if (err) {
      console.error('Error getting vendors:', err);
    } else {
      console.log('\nExisting vendors:');
      if (rows.length === 0) {
        console.log('No vendors found');
      } else {
        rows.forEach(row => {
          console.log(`- ID: ${row.id}, Name: ${row.name || row.vendorName || 'Unknown'}`);
        });
      }
    }
  });
});
