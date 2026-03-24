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

console.log('\n=== Testing API Endpoint Simulation ===');

// Simulate vendor login and get token
const vendorEmail = 'vendor1@gmail.com';
const password = 'vendor123';

console.log('1. Testing vendor authentication...');

// Get user from database
db.get('SELECT * FROM users WHERE email = ?', [vendorEmail], (err, user) => {
  if (err) {
    console.error('Error finding user:', err);
    return;
  }
  
  if (!user) {
    console.log('User not found');
    return;
  }
  
  console.log('✅ Found user:', { id: user.id, email: user.email, role: user.role });
  
  // Check password
  bcrypt.compare(password, user.password, (err, isValid) => {
    if (err) {
      console.error('Error comparing password:', err);
      return;
    }
    
    if (!isValid) {
      console.log('❌ Invalid password');
      return;
    }
    
    console.log('✅ Password valid');
    
    // Get vendor ID
    db.get('SELECT id FROM vendors WHERE email = ?', [vendorEmail], (err, vendor) => {
      if (err) {
        console.error('Error finding vendor:', err);
        return;
      }
      
      if (!vendor) {
        console.log('❌ Vendor not found');
        return;
      }
      
      console.log('✅ Found vendor:', { id: vendor.id, email: vendorEmail });
      
      // Test the exact query used in API
      const vendorId = vendor.id;
      const universityId = 1;
      
      console.log('\n2. Testing requests query...');
      db.all(
        `SELECT DISTINCT sr.*, u.name as storekeeper_name
         FROM stock_requests sr
         LEFT JOIN users u ON sr.storekeeper_id = u.id
         LEFT JOIN stock_request_items sri ON sr.id = sri.request_id
         WHERE sr.university_id = ? AND sri.vendor_id = ?
         ORDER BY sr.created_at DESC`,
        [universityId, vendorId],
        (err, requests) => {
          if (err) {
            console.error('Error fetching requests:', err);
          } else {
            console.log(`\n✅ Found ${requests.length} requests for vendor ${vendorId}:`);
            requests.forEach(req => {
              console.log(`- ID: ${req.id}, Title: ${req.title}, Status: ${req.status}`);
            });
            
            // Get items for each request
            const requestPromises = requests.map(request => {
              return new Promise((resolve, reject) => {
                db.all(
                  `SELECT sri.*, v.name as vendor_name
                   FROM stock_request_items sri
                   LEFT JOIN vendors v ON sri.vendor_id = v.id
                   WHERE sri.request_id = ?`,
                  [request.id],
                  (err, items) => {
                    if (err) reject(err);
                    else resolve({ ...request, items: items || [] });
                  }
                );
              });
            });
            
            Promise.all(requestPromises)
              .then(requestsWithItems => {
                console.log('\n✅ Final API Response Structure:');
                console.log(JSON.stringify({
                  success: true,
                  data: requestsWithItems
                }, null, 2));
                
                db.close();
              })
              .catch(err => {
                console.error('Error getting items:', err);
                db.close();
              });
          }
        }
      );
    });
  });
});
