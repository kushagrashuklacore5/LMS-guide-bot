const db = require('config/database-switch');

console.log('Checking existing stock requests...');

// Check stock_requests table
db.all('SELECT * FROM stock_requests ORDER BY created_at DESC LIMIT 5', (err, requests) => {
  if (err) {
    console.error('Error fetching requests:', err);
  } else {
    console.log('\n=== Stock Requests ===');
    console.log('Found', requests.length, 'requests:');
    console.log(requests);
  }
  
  // Check stock_request_items table
  db.all('SELECT * FROM stock_request_items ORDER BY id DESC LIMIT 10', (err, items) => {
    if (err) {
      console.error('Error fetching items:', err);
    } else {
      console.log('\n=== Stock Request Items ===');
      console.log('Found', items.length, 'items:');
      console.log(items);
    }
    
    // Check vendors table
    db.all('SELECT id, name FROM vendors LIMIT 5', (err, vendors) => {
      if (err) {
        console.error('Error fetching vendors:', err);
      } else {
        console.log('\n=== Vendors ===');
        console.log('Found', vendors.length, 'vendors:');
        console.log(vendors);
      }
      
      db.close();
    });
  });
});
