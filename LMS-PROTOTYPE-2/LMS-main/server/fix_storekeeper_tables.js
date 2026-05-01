const db = require('./config/database-switch');

async function fixStorekeeperTables() {
  console.log('🔧 Fixing Storekeeper Tables...\n');
  
  try {
    // Check and fix inventory table
    console.log('📦 Checking Inventory Table Schema...');
    db.all("PRAGMA table_info(inventory)", (err, columns) => {
      if (err) {
        console.error('❌ Error checking inventory schema:', err);
        return;
      }
      
      console.log('Current inventory columns:');
      columns.forEach(col => {
        console.log(`   - ${col.name}: ${col.type}`);
      });
      
      // Check if required columns exist
      const hasName = columns.some(col => col.name === 'name');
      const hasUniversityId = columns.some(col => col.name === 'university_id');
      
      if (!hasName || !hasUniversityId) {
        console.log('🔧 Adding missing columns to inventory table...');
        
        if (!hasName) {
          db.run("ALTER TABLE inventory ADD COLUMN name TEXT", (err) => {
            if (err) {
              console.error('❌ Error adding name column:', err);
            } else {
              console.log('✅ Added name column to inventory');
            }
          });
        }
        
        if (!hasUniversityId) {
          db.run("ALTER TABLE inventory ADD COLUMN university_id INTEGER", (err) => {
            if (err) {
              console.error('❌ Error adding university_id column:', err);
            } else {
              console.log('✅ Added university_id column to inventory');
            }
          });
        }
      }
    });
    
    // Check and fix vendors table
    console.log('\n🏪 Checking Vendors Table Schema...');
    db.all("PRAGMA table_info(vendors)", (err, columns) => {
      if (err) {
        console.error('❌ Error checking vendors schema:', err);
        return;
      }
      
      console.log('Current vendors columns:');
      columns.forEach(col => {
        console.log(`   - ${col.name}: ${col.type}`);
      });
      
      // Check if required columns exist
      const hasUniversityId = columns.some(col => col.name === 'university_id');
      
      if (!hasUniversityId) {
        console.log('🔧 Adding missing university_id column to vendors table...');
        db.run("ALTER TABLE vendors ADD COLUMN university_id INTEGER", (err) => {
          if (err) {
            console.error('❌ Error adding university_id column:', err);
          } else {
            console.log('✅ Added university_id column to vendors');
          }
        });
      }
    });
    
    // Create vendor_stock table if it doesn't exist
    console.log('\n📊 Checking Vendor Stock Table...');
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='vendor_stock'", (err, tables) => {
      if (err) {
        console.error('❌ Error checking vendor_stock table:', err);
        return;
      }
      
      if (tables.length === 0) {
        console.log('🔧 Creating vendor_stock table...');
        db.run(`
          CREATE TABLE vendor_stock (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vendorId INTEGER NOT NULL,
            itemName TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            unitPrice DECIMAL(10,2) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (vendorId) REFERENCES vendors(id)
          )
        `, (err) => {
          if (err) {
            console.error('❌ Error creating vendor_stock table:', err);
          } else {
            console.log('✅ Created vendor_stock table');
          }
        });
      } else {
        console.log('✅ vendor_stock table already exists');
      }
    });
    
    // Add sample data after fixing tables
    setTimeout(() => {
      console.log('\n🔧 Adding Sample Data to Fixed Tables...');
      
      // Get storekeeper's university_id
      db.get("SELECT id, name, university_id FROM users WHERE email = ?", ['storekeeper@core5.co.in'], (err, storekeeper) => {
        if (err) {
          console.error('❌ Error finding storekeeper:', err);
          return;
        }
        
        if (!storekeeper) {
          console.log('❌ Storekeeper not found');
          return;
        }
        
        console.log(`👤 Using storekeeper university_id: ${storekeeper.university_id}`);
        
        // Add sample inventory items
        const inventoryItems = [
          {
            name: 'Whiteboard Markers',
            category: 'Consumable',
            stock: 50,
            unitPrice: 2.50,
            vendorName: 'Office Supplies Co.',
            purchaseDate: '2024-01-15',
            description: 'Dry erase markers for classroom use',
            minStock: 10,
            university_id: storekeeper.university_id
          },
          {
            name: 'Notebooks',
            category: 'Consumable',
            stock: 200,
            unitPrice: 1.25,
            vendorName: 'Stationery World',
            purchaseDate: '2024-01-10',
            description: 'Student notebooks for all subjects',
            minStock: 50,
            university_id: storekeeper.university_id
          },
          {
            name: 'Laptop',
            category: 'Non-Consumable',
            stock: 5,
            unitPrice: 450.00,
            vendorName: 'Tech Solutions Inc.',
            purchaseDate: '2024-01-05',
            description: 'Laptops for computer lab',
            minStock: 2,
            university_id: storekeeper.university_id
          }
        ];
        
        inventoryItems.forEach((item, index) => {
          db.run(`
            INSERT INTO inventory (name, category, stock, unitPrice, vendorName, purchaseDate, description, minStock, university_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            item.name,
            item.category,
            item.stock,
            item.unitPrice,
            item.vendorName,
            item.purchaseDate,
            item.description,
            item.minStock,
            item.university_id
          ], function(err) {
            if (err) {
              console.error(`❌ Error adding inventory item ${index + 1}:`, err);
            } else {
              console.log(`✅ Inventory item ${index + 1} added: ${item.name}`);
            }
          });
        });
        
        // Add sample vendors
        const vendors = [
          {
            name: 'Office Supplies Co.',
            email: 'office@supplies.com',
            phone: '+1-555-0101',
            address: '123 Main St, City, State',
            category: 'Office Supplies',
            university_id: storekeeper.university_id
          },
          {
            name: 'Stationery World',
            email: 'info@stationery.com',
            phone: '+1-555-0102',
            address: '456 Oak Ave, City, State',
            category: 'Stationery',
            university_id: storekeeper.university_id
          }
        ];
        
        vendors.forEach((vendor, index) => {
          db.run(`
            INSERT INTO vendors (name, email, phone, address, category, rating, totalOrders, totalValue, university_id, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            vendor.name,
            vendor.email,
            vendor.phone,
            vendor.address,
            vendor.category,
            0,
            0,
            0,
            vendor.university_id,
            new Date().toISOString()
          ], function(err) {
            if (err) {
              console.error(`❌ Error adding vendor ${index + 1}:`, err);
            } else {
              console.log(`✅ Vendor ${index + 1} added: ${vendor.name}`);
            }
          });
        });
        
        // Add sample vendor stock
        setTimeout(() => {
          const vendorStock = [
            { vendorId: 1, itemName: 'Whiteboard Markers', quantity: 100, unitPrice: 2.50 },
            { vendorId: 1, itemName: 'Pens', quantity: 1000, unitPrice: 0.50 },
            { vendorId: 2, itemName: 'Notebooks', quantity: 500, unitPrice: 1.25 },
            { vendorId: 2, itemName: 'Pencils', quantity: 750, unitPrice: 0.25 }
          ];
          
          vendorStock.forEach((stock, index) => {
            db.run(`
              INSERT INTO vendor_stock (vendorId, itemName, quantity, unitPrice)
              VALUES (?, ?, ?, ?)
            `, [
              stock.vendorId,
              stock.itemName,
              stock.quantity,
              stock.unitPrice
            ], function(err) {
              if (err) {
                console.error(`❌ Error adding vendor stock ${index + 1}:`, err);
              } else {
                console.log(`✅ Vendor stock ${index + 1} added: ${stock.itemName}`);
              }
            });
          });
        }, 1000);
      });
    }, 2000);
    
    // Verify the data was added
    setTimeout(() => {
      console.log('\n🔍 Verifying Fixed Data...');
      
      db.all("SELECT COUNT(*) as count FROM inventory", (err, result) => {
        if (err) {
          console.error('❌ Error checking inventory:', err);
        } else {
          console.log(`✅ Total inventory items: ${result[0].count}`);
        }
      });
      
      db.all("SELECT COUNT(*) as count FROM vendors", (err, result) => {
        if (err) {
          console.error('❌ Error checking vendors:', err);
        } else {
          console.log(`✅ Total vendors: ${result[0].count}`);
        }
      });
      
      db.all("SELECT COUNT(*) as count FROM vendor_stock", (err, result) => {
        if (err) {
          console.error('❌ Error checking vendor stock:', err);
        } else {
          console.log(`✅ Total vendor stock items: ${result[0].count}`);
        }
      });
      
      console.log('\n🎯 STOREKEEPER TABLES FIXED SUMMARY:');
      console.log('✅ Inventory: Table schema fixed and sample data added');
      console.log('✅ Vendors: Table schema fixed and sample data added');
      console.log('✅ Vendor Stock: Table created and sample data added');
      console.log('✅ All data assigned to storekeeper\'s university');
      
      console.log('\n🌐 FRONTEND TESTING:');
      console.log('🏪 Storekeeper Portal: http://localhost:5174/storekeeper/dashboard');
      console.log('🔐 Login: storekeeper@core5.co.in / storekeeper123');
      console.log('📋 Test Sections:');
      console.log('   - /inventory - Should show inventory items');
      console.log('   - /vendors - Should show vendors');
      console.log('   - /vendor-stock - Should show vendor stock options');
      
    }, 4000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixStorekeeperTables();
