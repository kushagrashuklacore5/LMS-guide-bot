const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'lms-database.sqlite');

console.log('Testing vendor stock API...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to database');
});

// Check if vendor_stock table exists and has data
db.all('SELECT COUNT(*) as count FROM vendor_stock', [], (err, result) => {
  if (err) {
    console.error('Error checking vendor_stock:', err.message);
  } else {
    console.log(`Vendor stock table has ${result[0].count} items`);
    
    if (result[0].count > 0) {
      // Get a few sample items
      db.all('SELECT * FROM vendor_stock LIMIT 5', [], (err, items) => {
        if (err) {
          console.error('Error fetching sample items:', err.message);
        } else {
          console.log('Sample vendor stock items:');
          items.forEach((item, index) => {
            console.log(`${index + 1}. ID: ${item.id}, Vendor: ${item.vendor_id}, Name: ${item.name}, Category: ${item.category}, Quantity: ${item.quantity}`);
          });
        }
      });
    } else {
      console.log('No items in vendor_stock table');
    }
  }
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database connection closed');
  }
});
