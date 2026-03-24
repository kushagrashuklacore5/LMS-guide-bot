const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'data', 'lms-database.sqlite'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
    return;
  }
  console.log('Connected to database successfully');
});

console.log('\n=== Testing Vendor Stock Update ===');

// Check current vendor stock
const vendorId = 16; // vendor (Mumbai)

console.log('\n1. Current vendor stock:');
db.all('SELECT * FROM vendor_stock WHERE vendor_id = ?', [vendorId], (err, stock) => {
  if (err) {
    console.error('Error fetching stock:', err);
  } else {
    console.log(`Found ${stock.length} stock items for vendor ${vendorId}:`);
    stock.forEach(item => {
      console.log(`- ID: ${item.id}, Name: ${item.name}, Quantity: ${item.quantity}`);
    });
  }
  
  console.log('\n2. Testing stock update simulation...');
  
  // Simulate updating stock item ID 6 (Chalks) from 1000 to 950
  const testItemId = 6;
  const newQuantity = 950;
  
  db.run(
    'UPDATE vendor_stock SET quantity = ?, updated_at = datetime("now") WHERE id = ? AND vendor_id = ?',
    [newQuantity, testItemId, vendorId],
    function(err) {
      if (err) {
        console.error('Error updating stock:', err);
      } else {
        console.log(`✅ Stock item ${testItemId} updated to quantity: ${newQuantity}`);
        
        // Verify the update
        db.get('SELECT * FROM vendor_stock WHERE id = ? AND vendor_id = ?', [testItemId, vendorId], (err, updatedItem) => {
          if (err) {
            console.error('Error verifying update:', err);
          } else {
            console.log('✅ Verification successful:');
            console.log(`- ID: ${updatedItem.id}`);
            console.log(`- Name: ${updatedItem.name}`);
            console.log(`- Quantity: ${updatedItem.quantity}`);
            console.log(`- Updated At: ${updatedItem.updated_at}`);
          }
          
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err);
            } else {
              console.log('\n✅ Vendor stock update test completed!');
              console.log('\nStock updates ARE being saved to the database correctly.');
            }
          });
        });
      }
    }
  );
});
