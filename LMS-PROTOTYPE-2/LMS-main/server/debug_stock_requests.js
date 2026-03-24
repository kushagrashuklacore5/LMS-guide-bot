const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'lms-database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('=== Debugging Stock Request Visibility ===\n');

// Check all stock requests
console.log('1. Checking all stock requests in database...');
db.all('SELECT * FROM stock_requests ORDER BY created_at DESC', (err, requests) => {
  if (err) {
    console.error('Error fetching stock requests:', err);
    return;
  }
  
  console.log(`Found ${requests.length} stock requests:`);
  requests.forEach((req, index) => {
    console.log(`\nRequest ${index + 1}:`);
    console.log(`- ID: ${req.id}`);
    console.log(`- Title: ${req.title}`);
    console.log(`- Description: ${req.description}`);
    console.log(`- Status: ${req.status}`);
    console.log(`- University ID: ${req.university_id}`);
    console.log(`- Storekeeper ID: ${req.storekeeper_id}`);
    console.log(`- Created: ${req.created_at}`);
  });
  
  // Check stock request items
  console.log('\n2. Checking stock request items...');
  db.all('SELECT * FROM stock_request_items ORDER BY request_id', (err, items) => {
    if (err) {
      console.error('Error fetching request items:', err);
      return;
    }
    
    console.log(`Found ${items.length} stock request items:`);
    items.forEach((item, index) => {
      console.log(`\nItem ${index + 1}:`);
      console.log(`- Request ID: ${item.request_id}`);
      console.log(`- Item Name: ${item.item_name}`);
      console.log(`- Vendor ID: ${item.vendor_id}`);
      console.log(`- Quantity: ${item.quantity_requested}`);
      console.log(`- Category: ${item.category}`);
    });
    
    // Check vendor mapping
    console.log('\n3. Checking vendor mapping...');
    db.all('SELECT * FROM vendors WHERE email LIKE "%vendor%" ORDER BY id', (err, vendors) => {
      if (err) {
        console.error('Error fetching vendors:', err);
        return;
      }
      
      console.log(`Found ${vendors.length} vendors:`);
      vendors.forEach((vendor, index) => {
        console.log(`\nVendor ${index + 1}:`);
        console.log(`- ID: ${vendor.id}`);
        console.log(`- Name: ${vendor.name}`);
        console.log(`- Email: ${vendor.email}`);
        console.log(`- University ID: ${vendor.university_id}`);
      });
      
      // Check users table for vendor accounts
      console.log('\n4. Checking vendor user accounts...');
      db.all('SELECT * FROM users WHERE role = "vendor" ORDER BY id', (err, users) => {
        if (err) {
          console.error('Error fetching vendor users:', err);
          return;
        }
        
        console.log(`Found ${users.length} vendor users:`);
        users.forEach((user, index) => {
          console.log(`\nUser ${index + 1}:`);
          console.log(`- ID: ${user.id}`);
          console.log(`- Email: ${user.email}`);
          console.log(`- Role: ${user.role}`);
          console.log(`- Is Approved: ${user.isApproved}`);
        });
        
        // Test vendor requests API logic
        console.log('\n5. Testing vendor requests API logic...');
        
        // Simulate vendor1@gmail.com authentication (user ID 36)
        const userId = 36;
        
        console.log(`Testing for User ID: ${userId} (vendor1@gmail.com)`);
        
        // Get vendor ID from user email
        db.get('SELECT id FROM vendors WHERE email = (SELECT email FROM users WHERE id = ?)', [userId], (err, vendorRow) => {
          if (err) {
            console.error('Error getting vendor ID:', err);
            return;
          }
          
          if (!vendorRow) {
            console.log('❌ No vendor found for user ID:', userId);
            return;
          }
          
          const vendorId = vendorRow.id;
          console.log(`✅ Found vendor ID: ${vendorId} for user ID: ${userId}`);
          
          // Get university ID for vendor
          db.get('SELECT university_id FROM vendors WHERE id = ?', [vendorId], (err, vendor) => {
            if (err) {
              console.error('Error getting vendor university:', err);
              return;
            }
            
            const universityId = vendor ? vendor.university_id : 1;
            console.log(`✅ Vendor university ID: ${universityId}`);
            
            // Test the main query (same as vendor requests API)
            const query = `
              SELECT DISTINCT 
                sr.id, sr.title, sr.description, sr.status, sr.created_at, 
                sr.expected_delivery_date, sr.urgency_level, sr.requested_by,
                sri.item_name, sri.category, sri.quantity_requested, sri.unit_price, 
                sri.total_price, sri.specifications, sri.preferred_brand, sri.alternatives_allowed
              FROM stock_requests sr
              JOIN stock_request_items sri ON sr.id = sri.request_id
              WHERE sri.vendor_id = ? AND sr.university_id = ?
              ORDER BY sr.created_at DESC
            `;
            
            console.log('\n6. Testing vendor requests query...');
            console.log('Query:', query);
            console.log('Parameters:', [vendorId, universityId]);
            
            db.all(query, [vendorId, universityId], (err, requests) => {
              if (err) {
                console.error('Error testing query:', err);
                return;
              }
              
              console.log(`\n✅ Query returned ${requests.length} request items for vendor ${vendorId}:`);
              
              if (requests.length > 0) {
                // Group by request ID
                const groupedRequests = {};
                requests.forEach(req => {
                  if (!groupedRequests[req.id]) {
                    groupedRequests[req.id] = {
                      id: req.id,
                      title: req.title,
                      description: req.description,
                      status: req.status,
                      created_at: req.created_at,
                      expected_delivery_date: req.expected_delivery_date,
                      urgency_level: req.urgency_level,
                      requested_by: req.requested_by,
                      items: []
                    };
                  }
                  
                  groupedRequests[req.id].items.push({
                    item_name: req.item_name,
                    category: req.category,
                    quantity_requested: req.quantity_requested,
                    unit_price: req.unit_price,
                    total_price: req.total_price,
                    specifications: req.specifications,
                    preferred_brand: req.preferred_brand,
                    alternatives_allowed: req.alternatives_allowed
                  });
                });
                
                const finalRequests = Object.values(groupedRequests);
                console.log(`✅ Final grouped requests: ${finalRequests.length}`);
                
                finalRequests.forEach((request, index) => {
                  console.log(`\nRequest ${index + 1}:`);
                  console.log(`- ID: ${request.id}`);
                  console.log(`- Title: ${request.title}`);
                  console.log(`- Status: ${request.status}`);
                  console.log(`- Items: ${request.items.length}`);
                  
                  request.items.forEach((item, itemIndex) => {
                    console.log(`  Item ${itemIndex + 1}: ${item.item_name} (${item.quantity_requested})`);
                  });
                });
                
              } else {
                console.log('❌ No requests found for this vendor');
                
                // Check if there are requests without vendor assignment
                console.log('\n7. Checking requests without vendor assignment...');
                db.all('SELECT * FROM stock_request_items WHERE vendor_id IS NULL OR vendor_id = 0', (err, unassignedItems) => {
                  if (err) {
                    console.error('Error checking unassigned items:', err);
                    return;
                  }
                  
                  console.log(`Found ${unassignedItems.length} unassigned request items:`);
                  unassignedItems.forEach((item, index) => {
                    console.log(`\nUnassigned Item ${index + 1}:`);
                    console.log(`- Request ID: ${item.request_id}`);
                    console.log(`- Item Name: ${item.item_name}`);
                    console.log(`- Vendor ID: ${item.vendor_id}`);
                  });
                  
                  console.log('\n💡 Analysis:');
                  if (unassignedItems.length > 0) {
                    console.log('❌ Problem: Stock requests are created but not assigned to vendors');
                    console.log('🔧 Solution: Storekeeper needs to assign vendors to request items');
                  } else {
                    console.log('✅ All request items are assigned to vendors');
                    console.log('🔍 Issue might be in vendor mapping or API logic');
                  }
                  
                  console.log('\n=== Debug Complete ===');
                  db.close((err) => {
                    if (err) {
                      console.error('Error closing database:', err);
                    } else {
                      console.log('✅ Database connection closed');
                    }
                  });
                });
              }
            });
          });
        });
      });
    });
  });
});
