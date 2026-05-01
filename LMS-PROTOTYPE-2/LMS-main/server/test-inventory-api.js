const db = require('config/database-switch');

// Test database connection and inventory table
console.log('Testing database connection...');

// Check if inventory table exists and has the new fields
db.all("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'inventory)", (err, result) => {
  if (err) {
    console.error('Error getting table info:', err);
    return;
  }
  
  console.log('Inventory table structure:');
  result.forEach(col => {
    console.log(`- ${col.name}: ${col.type}`);
  });
  
  // Test inserting a sample item
  const testItem = {
    name: 'Test Item',
    category: 'Consumable',
    stock: 10,
    minStock: 5,
    unitPrice: 25.50,
    vendorName: 'Test Vendor',
    description: 'Test description',
    purchaseDate: new Date().toISOString()
  };
  
  console.log('\nTesting insert...');
  db.run(
    `INSERT INTO inventory (name, category, stock, minStock, unitPrice, vendorName, description, purchaseDate, university_id) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [testItem.name, testItem.category, testItem.stock, testItem.minStock, testItem.unitPrice, testItem.vendorName, testItem.description, testItem.purchaseDate],
    function(err) {
      if (err) {
        console.error('Insert test failed:', err);
      } else {
        console.log('Insert test successful! Item ID:', this.lastID);
      }
      
      // Test querying the item
      console.log('\nTesting query...');
      db.all(
        'SELECT * FROM inventory WHERE university_id = 1',
        (err, rows) => {
          if (err) {
            console.error('Query test failed:', err);
          } else {
            console.log('Query test successful! Found items:', rows.length);
            rows.forEach(item => {
              console.log(`- ${item.name} (ID: ${item.id}, Stock: ${item.stock})`);
            });
          }
        }
      );
    }
  );
});
