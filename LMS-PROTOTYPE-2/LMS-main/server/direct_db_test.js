const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Direct database connection
const db = new sqlite3.Database(path.join(__dirname, 'data', 'lms-database.sqlite'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
    return;
  }
  console.log('Connected to database successfully');
});

console.log('\n=== Checking stock_requests table ===');
db.all('SELECT * FROM stock_requests ORDER BY created_at DESC LIMIT 5', (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Stock requests found:', rows.length);
    rows.forEach(row => {
      console.log(`ID: ${row.id}, Title: ${row.title}, Status: ${row.status}, Created: ${row.created_at}`);
    });
  }
  
  console.log('\n=== Checking stock_request_items table ===');
  db.all('SELECT * FROM stock_request_items ORDER BY id DESC LIMIT 10', (err, items) => {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('Stock request items found:', items.length);
      items.forEach(item => {
        console.log(`ID: ${item.id}, Request ID: ${item.request_id}, Vendor ID: ${item.vendor_id}, Item: ${item.item_name}`);
      });
    }
    
    console.log('\n=== Checking vendors table ===');
    db.all('SELECT id, name FROM vendors LIMIT 5', (err, vendors) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Vendors found:', vendors.length);
        vendors.forEach(vendor => {
          console.log(`ID: ${vendor.id}, Name: ${vendor.name}`);
        });
      }
      
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed');
        }
      });
    });
  });
});
