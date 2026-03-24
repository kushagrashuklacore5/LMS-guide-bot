const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'lms-database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('=== Testing Vendor Stock API Logic ===\n');

// Simulate vendor1@gmail.com login (Vendor ID 16)
const vendorId = 16;
const universityId = 1;

console.log(`Testing for Vendor ID: ${vendorId} (vendor1@gmail.com)`);
console.log(`University ID: ${universityId}\n`);

// Step 1: Check vendor exists
console.log('1. Checking vendor exists...');
db.get('SELECT * FROM vendors WHERE id = ?', [vendorId], (err, vendor) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  if (vendor) {
    console.log('✅ Vendor found:');
    console.log(`- ID: ${vendor.id}`);
    console.log(`- Name: ${vendor.name}`);
    console.log(`- Email: ${vendor.email}`);
    console.log(`- University ID: ${vendor.university_id}`);
  } else {
    console.log('❌ Vendor not found');
    return;
  }
  
  // Step 2: Check vendor stock using same query as API
  console.log('\n2. Testing vendor stock query (same as API)...');
  db.all(
    `SELECT vs.*, v.name as vendor_name FROM vendor_stock vs LEFT JOIN vendors v ON vs.vendor_id = v.id WHERE vs.vendor_id = ? AND vs.university_id = ? ORDER BY vs.updated_at DESC`,
    [vendorId, universityId],
    (err, stock) => {
      if (err) {
        console.error('Error:', err);
        return;
      }
      
      console.log(`✅ Found ${stock.length} stock items for vendor ${vendorId}:`);
      
      if (stock.length === 0) {
        console.log('❌ No stock items found - This is the problem!');
        console.log('\n🔍 Checking all stock items for debugging...');
        db.all('SELECT * FROM vendor_stock WHERE vendor_id = ?', [vendorId], (err, allStock) => {
          if (err) {
            console.error('Error:', err);
            return;
          }
          
          console.log(`Found ${allStock.length} total stock items for vendor ${vendorId}:`);
          allStock.forEach(item => {
            console.log(`- ID: ${item.id}, Name: ${item.name}, University: ${item.university_id}`);
          });
          
          checkAlternativeQueries(vendorId);
        });
      } else {
        stock.forEach((item, index) => {
          console.log(`\nItem ${index + 1}:`);
          console.log(`- ID: ${item.id}`);
          console.log(`- Name: ${item.name}`);
          console.log(`- Category: ${item.category}`);
          console.log(`- Quantity: ${item.quantity}`);
          console.log(`- Unit Price: ${item.unit_price}`);
          console.log(`- University ID: ${item.university_id}`);
          console.log(`- Updated At: ${item.updated_at}`);
        });
        
        console.log('\n✅ API should return these items correctly');
      }
    }
  );
});

function checkAlternativeQueries(vendorId) {
  console.log('\n3. Testing alternative queries...');
  
  // Test without university filter
  db.all(
    'SELECT * FROM vendor_stock WHERE vendor_id = ? ORDER BY updated_at DESC',
    [vendorId],
    (err, stock) => {
      if (err) {
        console.error('Error:', err);
        return;
      }
      
      console.log(`Without university filter: ${stock.length} items`);
      
      // Test with different university ID
      db.all(
        'SELECT * FROM vendor_stock WHERE vendor_id = ? AND university_id = ?',
        [vendorId, 0],
        (err, stock) => {
          if (err) {
            console.error('Error:', err);
            return;
          }
          
          console.log(`With university_id = 0: ${stock.length} items`);
          
          console.log('\n💡 Issue Analysis:');
          if (stock.length > 0) {
            console.log('❌ Problem: Stock items have university_id = 0 but API expects university_id = 1');
            console.log('🔧 Solution: Update stock items to have correct university_id or fix API query');
          } else {
            console.log('❌ Problem: No stock items found for this vendor');
            console.log('🔧 Solution: Check if vendor ID is correct or if stock items exist');
          }
          
          db.close();
        }
      );
    }
  );
}

setTimeout(() => {
  console.log('\n=== Vendor Stock API Test Complete ===');
}, 2000);
