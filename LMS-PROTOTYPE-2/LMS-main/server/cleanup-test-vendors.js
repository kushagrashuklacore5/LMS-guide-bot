const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'lms-database.sqlite');

console.log('Checking for test vendors in database...');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Check for vendors that might be test data
db.all('SELECT * FROM vendors ORDER BY id', [], (err, vendors) => {
  if (err) {
    console.error('Error fetching vendors:', err.message);
    db.close();
    process.exit(1);
  }

  console.log(`Found ${vendors.length} vendors:`);
  vendors.forEach(vendor => {
    console.log(`ID: ${vendor.id}, Name: ${vendor.name}, University ID: ${vendor.university_id}`);
  });

  // Look for potential test vendors (those with university_id = 1 or null that might be test data)
  const testVendors = vendors.filter(vendor => {
    return vendor.university_id === 1 || vendor.university_id === null;
  });
  
  if (testVendors.length > 0) {
    console.log(`\nFound ${testVendors.length} potential test vendors:`);
    testVendors.forEach(vendor => {
      console.log(`- ID: ${vendor.id}, Name: ${vendor.name}, University ID: ${vendor.university_id}`);
    });

    console.log('\nCleaning up test vendors...');
    db.run('DELETE FROM vendors WHERE university_id = 1 OR university_id IS NULL', function(err) {
      if (err) {
        console.error('Error deleting test vendors:', err.message);
      } else {
        console.log(`Deleted ${this.changes} test vendors`);
      }
    });
  } else {
    console.log('\nNo test vendors found. All vendors have legitimate university_id values.');
  }

  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('\nDatabase connection closed');
    }
  });
});
