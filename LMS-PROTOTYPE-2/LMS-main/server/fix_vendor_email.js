const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'data', 'lms-database.sqlite'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
    return;
  }
  console.log('Connected to database successfully');
});

console.log('\n=== Fixing Vendor Email ===');

// Update vendor ID 16 email to match the user
db.run(
  'UPDATE vendors SET email = ? WHERE id = ?',
  ['vendor@mumbai.com', 16],
  function(err) {
    if (err) {
      console.error('Error updating vendor email:', err);
    } else {
      console.log('✅ Updated vendor ID 16 email to: vendor@mumbai.com');
    }
    
    console.log('\n=== Verification ===');
    db.all('SELECT id, name, email FROM vendors', (err, vendors) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Updated vendors:');
        vendors.forEach(vendor => {
          console.log(`ID: ${vendor.id}, Name: "${vendor.name}", Email: "${vendor.email}"`);
        });
      }
      
      console.log('\n=== Testing Request Fetch ===');
      // Test the query that will be used
      db.all(
        `SELECT DISTINCT sr.*, u.name as storekeeper_name
         FROM stock_requests sr
         LEFT JOIN users u ON sr.storekeeper_id = u.id
         LEFT JOIN stock_request_items sri ON sr.id = sri.request_id
         WHERE sr.university_id = ? AND sri.vendor_id = ?
         ORDER BY sr.created_at DESC`,
        [1, 16], // university_id = 1, vendor_id = 16
        (err, requests) => {
          if (err) {
            console.error('Error fetching requests:', err);
          } else {
            console.log(`\n✅ Found ${requests.length} requests for vendor 16:`);
            requests.forEach(req => {
              console.log(`- ID: ${req.id}, Title: ${req.title}, Status: ${req.status}`);
            });
          }
          
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err);
            } else {
              console.log('\n✅ Vendor email fix completed!');
              console.log('\nNow you can login with:');
              console.log('1. Email: vendor@mumbai.com, Password: vendor123 (Vendor ID 16)');
              console.log('2. Email: dell@vendor.com, Password: vendor123 (Vendor ID 17)');
            }
          });
        }
      );
    });
  }
});
