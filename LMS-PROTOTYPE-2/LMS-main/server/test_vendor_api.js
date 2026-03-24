const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'data', 'lms-database.sqlite'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
    return;
  }
  console.log('Connected to database successfully');
});

console.log('\n=== Testing Vendor API Query ===');

// Test the exact query used in vendor route
const vendorUserId = 36; // vendor@mumbai.com user ID
const vendorEmail = 'vendor@mumbai.com';

console.log('\n1. Testing user to vendor mapping:');
db.get('SELECT id FROM vendors WHERE email = (SELECT email FROM users WHERE id = ?)', [vendorUserId], (err, vendorRow) => {
  if (err) {
    console.error('Error mapping user to vendor:', err);
  } else {
    console.log('User ID:', vendorUserId, '-> Vendor ID:', vendorRow?.id);
  }
  
  console.log('\n2. Testing direct vendor query:');
  db.get('SELECT id FROM vendors WHERE email = ?', [vendorEmail], (err, directVendor) => {
    if (err) {
      console.error('Error direct vendor query:', err);
    } else {
      console.log('Vendor email:', vendorEmail, '-> Vendor ID:', directVendor?.id);
    }
    
    console.log('\n3. Testing requests query with vendor ID:', directVendor?.id);
    const vendorId = directVendor?.id;
    
    if (vendorId) {
      db.all(
        `SELECT DISTINCT sr.*, u.name as storekeeper_name
         FROM stock_requests sr
         LEFT JOIN users u ON sr.storekeeper_id = u.id
         LEFT JOIN stock_request_items sri ON sr.id = sri.request_id
         WHERE sr.university_id = ? AND sri.vendor_id = ?
         ORDER BY sr.created_at DESC`,
        [1, vendorId], // university_id = 1, vendor_id from above
        (err, requests) => {
          if (err) {
            console.error('Error fetching requests:', err);
          } else {
            console.log(`\nFound ${requests.length} requests for vendor ${vendorId}:`);
            requests.forEach(req => {
              console.log(`- ID: ${req.id}, Title: ${req.title}, Status: ${req.status}`);
            });
          }
          
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err);
            } else {
              console.log('\nDatabase connection closed');
            }
          });
        }
      );
    }
  });
});
