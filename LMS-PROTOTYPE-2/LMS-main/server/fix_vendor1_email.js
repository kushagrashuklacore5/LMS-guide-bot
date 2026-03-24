const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database(path.join(__dirname, 'data', 'lms-database.sqlite'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
    return;
  }
  console.log('Connected to database successfully');
});

console.log('\n=== Fixing Vendor1 Email Mapping ===');

// Update the user account to use vendor1@gmail.com instead of vendor@mumbai.com
const newEmail = 'vendor1@gmail.com';
const vendorId = 36;

bcrypt.hash('vendor123', 10, (err, hashedPassword) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  
  // Update user email
  db.run(
    'UPDATE users SET email = ? WHERE id = ?',
    [newEmail, 36], // User ID 36 was created for vendor@mumbai.com
    function(err) {
      if (err) {
        console.error('Error updating user email:', err);
      } else {
        console.log(`✅ Updated user ID 36 email to: ${newEmail}`);
      }
      
      // Update vendor password to match
      db.run(
        'UPDATE vendors SET password = ? WHERE id = ?',
        [hashedPassword, vendorId],
        function(err) {
          if (err) {
            console.error('Error updating vendor password:', err);
          } else {
            console.log(`✅ Updated vendor ID ${vendorId} password`);
          }
          
          console.log('\n=== Verification ===');
          db.all('SELECT u.id as user_id, u.email, v.id as vendor_id, v.name as vendor_name FROM users u LEFT JOIN vendors v ON u.email = v.email WHERE u.email = ?', [newEmail], (err, results) => {
            if (err) {
              console.error('Error:', err);
            } else {
              console.log('Updated mapping:');
              results.forEach(result => {
                console.log(`User ID: ${result.user_id}, Email: ${result.email}, Vendor ID: ${result.vendor_id}, Vendor Name: ${result.vendor_name}`);
              });
            }
            
            console.log('\n=== Testing Request Fetch ===');
            db.all(
              `SELECT DISTINCT sr.*, u.name as storekeeper_name
               FROM stock_requests sr
               LEFT JOIN users u ON sr.storekeeper_id = u.id
               LEFT JOIN stock_request_items sri ON sr.id = sri.request_id
               WHERE sr.university_id = ? AND sri.vendor_id = ?
               ORDER BY sr.created_at DESC`,
              [1, vendorId],
              (err, requests) => {
                if (err) {
                  console.error('Error fetching requests:', err);
                } else {
                  console.log(`\n✅ Found ${requests.length} requests for vendor ${vendorId}:`);
                  requests.forEach(req => {
                    console.log(`- ID: ${req.id}, Title: ${req.title}, Status: ${req.status}`);
                  });
                }
                
                db.close((err) => {
                  if (err) {
                    console.error('Error closing database:', err);
                  } else {
                    console.log('\n✅ Vendor1 email fix completed!');
                    console.log('\nNow you can login with:');
                    console.log('Email: vendor1@gmail.com, Password: vendor123');
                    console.log('This account should see the 2 requests assigned to Vendor ID 16.');
                  }
                });
              }
            );
          });
        }
      );
    }
  );
});
